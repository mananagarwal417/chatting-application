// Dashboard.jsx

import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { getToken, removeToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import EmojiPicker from "emoji-picker-react";

const API_URL = import.meta.env.VITE_AXIOS_URL;
const SOCKET_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

let globalSocket = null;

const UserContext = React.createContext();
const useUser = () => useContext(UserContext);

function Dashboard() {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messages, setMessages] = useState([]);

  // State to track unread messages per conversation
  const [unreadCounts, setUnreadCounts] = useState({});

  const socket = useRef(null);
  const selectedConvoRef = useRef(null);
  const conversationsRef = useRef(conversations);

  const navigate = useNavigate();

  // ⭐ FIXED MOBILE LOGIC — LIVE TRACKING
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileView, setMobileView] = useState("list");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Ensure desktop always shows both panes
  useEffect(() => {
    if (!isMobile) {
      setMobileView("list");
    }
  }, [isMobile]);

  // ⭐ HANDLE HARDWARE/BROWSER BACK BUTTON
  useEffect(() => {
    const handlePopState = (event) => {
      if (isMobile && mobileView === "chat") {
        setMobileView("list");
        setSelectedConvo(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isMobile, mobileView]);

  // ─────────────────────── KEY STORAGE ───────────────────────

  const privateKeyRef = useRef(null);
  const publicJwkRef = useRef(null);
  const publicKeyCache = useRef({});
  const aesKeyCache = useRef({});

  const LOCAL_PRIVATE_JWK_KEY = "e2ee_private_jwk_v1";
  const LOCAL_PUBLIC_JWK_KEY = "e2ee_public_jwk_v1";

  const utf8Encoder = new TextEncoder();
  const utf8Decoder = new TextDecoder();

  const bufToB64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const b64ToBuf = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

  async function generateAndStoreKeyPairIfNeeded() {
    const existing = localStorage.getItem(LOCAL_PRIVATE_JWK_KEY);

    if (existing) {
      try {
        const jwk = JSON.parse(existing);
        const priv = await window.crypto.subtle.importKey(
          "jwk",
          jwk,
          { name: "ECDH", namedCurve: "P-256" },
          true,
          ["deriveKey"]
        );
        const pubStr = localStorage.getItem(LOCAL_PUBLIC_JWK_KEY);
        const pub = pubStr ? JSON.parse(pubStr) : null;
        return { privateKey: priv, publicJwk: pub };
      } catch {}
    }

    const kp = await window.crypto.subtle.generateKey(
      { name: "ECDH", namedCurve: "P-256" },
      true,
      ["deriveKey"]
    );

    const pubJwk = await window.crypto.subtle.exportKey("jwk", kp.publicKey);
    const privJwk = await window.crypto.subtle.exportKey("jwk", kp.privateKey);

    localStorage.setItem(LOCAL_PRIVATE_JWK_KEY, JSON.stringify(privJwk));
    localStorage.setItem(LOCAL_PUBLIC_JWK_KEY, JSON.stringify(pubJwk));

    const privateKey = await window.crypto.subtle.importKey(
      "jwk",
      privJwk,
      { name: "ECDH", namedCurve: "P-256" },
      true,
      ["deriveKey"]
    );

    return { privateKey, publicJwk: pubJwk };
  }

  async function importPublicJwk(jwk) {
    return window.crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "ECDH", namedCurve: "P-256" },
      true,
      []
    );
  }

  async function deriveAesKey(priv, pub) {
    return window.crypto.subtle.deriveKey(
      { name: "ECDH", public: pub },
      priv,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async function encrypt(aesKey, plaintext) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      aesKey,
      utf8Encoder.encode(plaintext)
    );
    return { iv: bufToB64(iv.buffer), data: bufToB64(ciphertext) };
  }

  async function decrypt(aesKey, payload) {
    const iv = b64ToBuf(payload.iv);
    const ct = b64ToBuf(payload.data);
    const plain = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      aesKey,
      ct
    );
    return utf8Decoder.decode(plain);
  }

  async function getAesKey(convo) {
    if (!convo || !user) return null;
    if (aesKeyCache.current[convo._id]) return aesKeyCache.current[convo._id];

    const otherParticipant = convo.participants.find((p) => {
      const uid = typeof p.user === "string" ? p.user : p.user?._id;
      return uid && uid !== user._id;
    });

    if (!otherParticipant) return null;

    const otherUser =
      typeof otherParticipant.user === "string"
        ? convo.participants.find(
            (p) => p.user?._id === otherParticipant.user
          )?.user
        : otherParticipant.user;

    if (!otherUser || !otherUser._id) return null;

    const otherId = otherUser._id;

    let pubJwk = publicKeyCache.current[otherId];
    if (!pubJwk) {
      const res = await api.get(`/users/${otherId}/public-key`);
      pubJwk = res.data.publicKey;
      publicKeyCache.current[otherId] = pubJwk;
    }

    const pub = await importPublicJwk(pubJwk);
    const aes = await deriveAesKey(privateKeyRef.current, pub);

    aesKeyCache.current[convo._id] = aes;
    return aes;
  }

  // ─────────────────────── LOAD USER ───────────────────────

  useEffect(() => {
    const token = getToken();
    if (!token) return navigate("/login");

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    api
      .get("/users/profile")
      .then(async (res) => {
        setUser(res.data);

        const { privateKey, publicJwk } =
          await generateAndStoreKeyPairIfNeeded();

        privateKeyRef.current = privateKey;
        publicJwkRef.current = publicJwk;

        await api
          .post("/users/public-key", { publicKey: publicJwk })
          .catch(() => {});
      })
      .catch(() => {
        removeToken();
        navigate("/login");
      });
  }, [navigate]);

  // ─────────────────────── LOGOUT FUNCTION ───────────────────────
  const handleLogout = () => {
    if (globalSocket) {
      globalSocket.disconnect();
      globalSocket = null;
    }
    removeToken();
    navigate("/login");
  };

  // ─────────────────────── SOCKET ───────────────────────

  useEffect(() => {
    selectedConvoRef.current = selectedConvo;
  }, [selectedConvo]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    if (!user) return;

    if (!globalSocket) {
      globalSocket = io(SOCKET_URL, { query: { userId: user._id } });
    }

    socket.current = globalSocket;

    const handleIncomingMessage = async (msg) => {
      let finalContent = msg.content;

      // 1. Decryption Logic
      try {
        if (typeof msg.content === "string") {
          const trimmed = msg.content.trim();
          if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            const parsed = JSON.parse(trimmed);
            if (parsed.iv && parsed.data) {
              const convo = conversationsRef.current.find(
                (c) => c._id === msg.conversation
              );
              const aes = await getAesKey(convo);
              if (aes) finalContent = await decrypt(aes, parsed);
            }
          }
        }
      } catch {}

      const finalMsg = { ...msg, content: finalContent };

      // ⭐ FIX: Status & ID Synchronization
      if (msg.sender._id === user._id) {
        setMessages((prev) => {
          const tempIndex = prev.findIndex(
            (m) =>
              m.status === "sent" &&
              typeof m._id === "number" &&
              m.conversation === msg.conversation
          );

          if (tempIndex !== -1) {
            const updated = [...prev];
            updated[tempIndex] = {
              ...updated[tempIndex],
              _id: finalMsg._id,
              status: "delivered",
            };
            return updated;
          }
          return prev;
        });
        return; // Stop here, don't add duplicate
      }

      // If message is from others
      finalMsg.status = "delivered";

      // If we are looking at this conversation, mark it seen immediately
      if (
        selectedConvoRef.current &&
        selectedConvoRef.current._id === msg.conversation
      ) {
        socket.current.emit("markSeen", {
          conversationId: msg.conversation,
          userId: user._id,
        });
      }

      setMessages((prev) => {
        if (
          selectedConvoRef.current?._id === finalMsg.conversation ||
          selectedConvo?._id === finalMsg.conversation
        ) {
          return [...prev, finalMsg];
        }
        return prev;
      });

      // ⭐ FEATURE: Check if conversation exists locally
      const convoExists = conversationsRef.current.find(
        (c) => c._id === msg.conversation
      );

      if (convoExists) {
        // 1. Conversation exists -> Update list
        updateConvoList(finalMsg);

        // 2. Update Unread Count (if not selected)
        if (selectedConvoRef.current?._id !== msg.conversation) {
          setUnreadCounts((prev) => ({
            ...prev,
            [msg.conversation]: (prev[msg.conversation] || 0) + 1,
          }));
        }
      } else {
        // 1. Conversation NEW -> Fetch updated list from API
        api
          .get("/conversations")
          .then((res) => {
            setConversations(res.data);
            // ⭐ FIX: Explicitly set unread count to 1 for this new conversation
            setUnreadCounts((prev) => ({
              ...prev,
              [msg.conversation]: 1,
            }));
          })
          .catch(() => {});
      }
    };

    socket.current.on("receiveMessage", handleIncomingMessage);

    socket.current.on("messageSeen", (msgId) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === msgId ? { ...m, status: "seen" } : m))
      );
    });

    return () => {
      socket.current.off("receiveMessage", handleIncomingMessage);
      socket.current.off("messageSeen");
    };
  }, [user]);

  // ─────────────────────── LOAD CONVERSATIONS ───────────────────────

  useEffect(() => {
    if (!user) return;
    api
      .get("/conversations")
      .then((res) => setConversations(res.data))
      .catch(() => {});
  }, [user]);

  // ─────────────────────── LOAD MESSAGES ───────────────────────

  useEffect(() => {
    if (!selectedConvo) return;
    setMessages([]);

    socket.current.emit("joinRoom", selectedConvo._id);

    api
      .get(`/messages/${selectedConvo._id}`)
      .then(async (res) => {
        const aes = await getAesKey(selectedConvo);
        const list = await Promise.all(
          res.data.map(async (m) => {
            let content = m.content;
            try {
              const trimmed =
                typeof content === "string" ? content.trim() : "";
              if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
                const parsed = JSON.parse(trimmed);
                if (parsed.iv && parsed.data && aes) {
                  content = await decrypt(aes, parsed);
                }
              }
            } catch {}
            return { ...m, content };
          })
        );
        setMessages(list);
        socket.current.emit("markSeen", {
          conversationId: selectedConvo._id,
          userId: user._id,
        });
      })
      .catch(() => {});
  }, [selectedConvo]);

  const updateConvoList = (msg) => {
    setConversations((prev) => {
      const i = prev.findIndex((c) => c._id === msg.conversation);
      if (i === -1) return prev;
      const updated = {
        ...prev[i],
        lastMessage: msg.content,
        lastMessageAt: msg.createdAt,
      };
      return [updated, ...prev.filter((c) => c._id !== msg.conversation)];
    });
  };

  const handleSelectConvo = (convo) => {
    setSelectedConvo(convo);

    // ⭐ Reset unread count when opening a conversation
    setUnreadCounts((prev) => ({
      ...prev,
      [convo._id]: 0,
    }));

    if (isMobile) {
      setMobileView("chat");
      window.history.pushState({ chatOpen: true }, "");
    }
  };

  const handleCreateConvo = (targetUser) => {
    api
      .post("/conversations", { targetUserId: targetUser._id })
      .then((res) => {
        const newConvo = res.data;
        // ⭐ FIX: Prevent Duplicate Addition locally
        if (!conversations.find((c) => c._id === newConvo._id)) {
          setConversations((prev) => [newConvo, ...prev]);
        }
        setSelectedConvo(newConvo);
        setUnreadCounts((prev) => ({ ...prev, [newConvo._id]: 0 }));

        if (isMobile) {
          setMobileView("chat");
          window.history.pushState({ chatOpen: true }, "");
        }
      })
      .catch(() => {});
  };

  const handleSendMessage = async (content) => {
    if (!selectedConvo) return;

    let sendContent = content;
    const aes = await getAesKey(selectedConvo);
    if (aes) {
      const encrypted = await encrypt(aes, content);
      sendContent = JSON.stringify(encrypted);
    }

    const localMessage = {
      _id: Date.now(),
      content,
      sender: { _id: user._id },
      conversation: selectedConvo._id,
      createdAt: new Date().toISOString(),
      status: "sent",
    };

    setMessages((prev) => [...prev, localMessage]);

    socket.current.emit("sendMessage", {
      content: sendContent,
      conversationId: selectedConvo._id,
      sender: user._id,
    });
  };

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">Loading...</div>
    );
  }

  return (
    <UserContext.Provider value={user}>
      <div className="flex h-full">
        {/* ⭐ MOBILE LIST */}
        {isMobile && mobileView === "list" && (
          <ConversationList
            conversations={conversations}
            onSelect={handleSelectConvo}
            activeId={selectedConvo?._id}
            onCreateConvo={handleCreateConvo}
            onLogout={handleLogout}
            unreadCounts={unreadCounts}
          />
        )}

        {/* ⭐ MOBILE CHAT */}
        {isMobile && mobileView === "chat" && selectedConvo && (
          <ChatWindow
            conversation={selectedConvo}
            messages={messages}
            onSendMessage={handleSendMessage}
            onBack={() => {
              window.history.back();
            }}
            isMobile={true}
          />
        )}

        {/* ⭐ DESKTOP VIEW */}
        {!isMobile && (
          <>
            <ConversationList
              conversations={conversations}
              onSelect={handleSelectConvo}
              activeId={selectedConvo?._id}
              onCreateConvo={handleCreateConvo}
              onLogout={handleLogout}
              unreadCounts={unreadCounts}
            />
            {selectedConvo ? (
              <ChatWindow
                conversation={selectedConvo}
                messages={messages}
                onSendMessage={handleSendMessage}
                isMobile={false}
              />
            ) : (
              <WelcomeScreen />
            )}
          </>
        )}
      </div>
    </UserContext.Provider>
  );
}

// ───────────────────────────────────────────────────────────
// CONVERSATION LIST
// ───────────────────────────────────────────────────────────

function ConversationList({
  conversations,
  onSelect,
  activeId,
  onCreateConvo,
  onLogout,
  unreadCounts,
}) {
  const user = useUser();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }
    const delay = setTimeout(() => {
      api
        .get(`/users/phone-search?phone=${search}`)
        .then((res) => {
          if (res.data) {
            setSearchResults([res.data]);
          } else {
            setSearchResults([]);
          }
        })
        .catch(() => {
          setSearchResults([]);
        });
    }, 300);
    return () => clearTimeout(delay);
  }, [search]);

  const handleSelectUser = (user) => {
    onCreateConvo(user);
    setSearch("");
    setSearchResults([]);
  };

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white shadow-sm z-10">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Hello, {user?.username} 👋
          </h2>
        </div>
        
      </div>

      <div className="p-4 border-b border-gray-200 shrink-0">
        <input
          type="text"
          placeholder="Enter phone number..."
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grow overflow-y-auto">
        {searchResults.length > 0 && (
          <div className="border-b border-gray-200">
            <h3 className="p-2 text-xs font-semibold text-gray-500">
              Search Results
            </h3>
            {searchResults.map((user) => (
              <div
                key={user._id}
                onClick={() => handleSelectUser(user)}
                className="flex items-center p-3 cursor-pointer hover:bg-gray-100"
              >
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center font-bold text-sm">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="ml-3 font-medium text-sm">
                  {user.username}
                </span>
              </div>
            ))}
          </div>
        )}

        {conversations.map((convo) => (
          <ConversationItem
            key={convo._id}
            convo={convo}
            isActive={convo._id === activeId}
            onClick={() => onSelect(convo)}
            unreadCount={unreadCounts[convo._id] || 0}
          />
        ))}
      </div>
    </div>
  );
}

function ConversationItem({ convo, isActive, onClick, unreadCount }) {
  const user = useUser();
  if (!user) return null;

  const otherParticipant = convo.participants.find((p) => {
    const uid = typeof p.user === "string" ? p.user : p.user?._id;
    return uid && uid !== user._id;
  });

  const otherUser =
    typeof otherParticipant?.user === "string"
      ? convo.participants.find(
          (p) => p.user?._id === otherParticipant.user
        )?.user
      : otherParticipant?.user;

  // ⭐ FIX: Handle Deleted Users Gracefully
  const name = otherUser?.username || "Deleted User";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-4 cursor-pointer hover:bg-gray-100 border-b border-gray-100 ${
        isActive ? "bg-indigo-50" : ""
      }`}
    >
      <div
        className={`shrink-0 w-10 h-10 text-white rounded-full flex items-center justify-center font-bold ${
          otherUser ? "bg-indigo-500" : "bg-gray-400"
        }`}
      >
        {initial}
      </div>
      <div className="grow ml-3 overflow-hidden">
        <h3
          className={`text-sm font-medium ${
            otherUser ? "text-gray-900" : "text-gray-500 italic"
          }`}
        >
          {name}
        </h3>
        <p className="text-xs text-gray-500 truncate">
          {convo.lastMessage || "Start chatting..."}
        </p>
      </div>

      {unreadCount > 0 && (
        <div className="ml-2 shrink-0 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
          {unreadCount > 9 ? "9+" : unreadCount}
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// CHAT WINDOW
// ───────────────────────────────────────────────────────────

function ChatWindow({
  conversation,
  messages,
  onSendMessage,
  onBack,
  isMobile,
}) {
  const user = useUser();
  const [content, setContent] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const endRef = useRef(null);

  const otherParticipant = conversation.participants.find((p) => {
    const uid = typeof p.user === "string" ? p.user : p.user?._id;
    return uid && uid !== user._id;
  });

  const otherUser =
    typeof otherParticipant?.user === "string"
      ? conversation.participants.find(
          (p) => p.user?._id === otherParticipant.user
        )?.user
      : otherParticipant?.user;

  // ⭐ FIX: Handle Deleted Users Gracefully
  const name = otherUser?.username || "Deleted User";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSendMessage(content.trim());
    setContent("");
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showEmoji]);

  return (
    <div
      className={`flex flex-col bg-gray-50 ${
        isMobile ? "fixed inset-0 z-50 h-dvh" : "grow h-full"
      }`}
    >
      <div className="p-3 bg-white shadow-sm flex items-center shrink-0 border-b border-gray-200">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 mr-2 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            ←
          </button>
        )}
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${
            otherUser ? "bg-indigo-600" : "bg-gray-400"
          }`}
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <h2 className="ml-3 text-lg font-semibold text-gray-800 truncate">
          {name}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <Message key={msg._id || index} message={msg} />
        ))}
        <div ref={endRef} />
      </div>

      <div className="shrink-0 p-3 bg-white border-t border-gray-200 relative">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className="p-2 text-gray-500 hover:text-indigo-600"
          >
            🙂
          </button>

          {showEmoji && (
            <div className="absolute bottom-16 left-2 z-50 shadow-xl">
              <EmojiPicker
                onEmojiClick={(emoji) =>
                  setContent((prev) => prev + emoji.emoji)
                }
              />
            </div>
          )}

          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              otherUser ? "Type a message..." : "User deleted"
            }
            disabled={!otherUser}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full 
              focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
              text-gray-900 bg-white disabled:bg-gray-100 disabled:text-gray-500"
          />

          <button
            type="submit"
            disabled={!otherUser}
            className="px-4 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition disabled:bg-gray-400"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

function Message({ message }) {
  const user = useUser();
  const isMe = message.sender._id === user._id;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm ${
          isMe
            ? "bg-indigo-600 text-white rounded-br-none"
            : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
        }`}
      >
        <p className="leading-relaxed">{message.content}</p>
        <div
          className={`text-[10px] mt-1 flex items-center justify-end space-x-1 ${
            isMe ? "text-indigo-100" : "text-gray-400"
          }`}
        >
          <span>
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {isMe && (
            <span className="font-bold ml-1">
              {message.status === "sent" && "✓"}
              {message.status === "delivered" && "✓✓"}
              {message.status === "seen" && (
                <span className="text-blue-200">✓✓</span>
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function WelcomeScreen() {
  const user = useUser();
  return (
    <div className="grow flex flex-col items-center justify-center text-center bg-gray-50">
      <h2 className="text-3xl font-bold text-gray-800">
        Hello, {user.username}!
      </h2>
      <p className="mt-2 text-gray-500">
        Select a conversation from the sidebar to start chatting.
      </p>
    </div>
  );
}

export default Dashboard;
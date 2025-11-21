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
  const socket = useRef(null);
  const selectedConvoRef = useRef(null);
  const conversationsRef = useRef(conversations); // ✅ MODIFIED

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
      setSelectedConvo(selectedConvo); 
    }
  }, [isMobile]);

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
    if (!convo) return null;
    if (aesKeyCache.current[convo._id]) return aesKeyCache.current[convo._id];

    const other = convo.participants.find((p) => p.user._id !== user._id)?.user;
    if (!other) return null;

    let pubJwk = publicKeyCache.current[other._id];
    if (!pubJwk) {
      const res = await api.get(`/users/${other._id}/public-key`);
      pubJwk = res.data.publicKey;
      publicKeyCache.current[other._id] = pubJwk;
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

    api.get("/users/profile")
      .then(async (res) => {
        setUser(res.data);

        const { privateKey, publicJwk } =
          await generateAndStoreKeyPairIfNeeded();

        privateKeyRef.current = privateKey;
        publicJwkRef.current = publicJwk;

        await api.post("/users/public-key", { publicKey: publicJwk }).catch(() => {});
      })
      .catch(() => {
        removeToken();
        navigate("/login");
      });
  }, [navigate]);

  // ─────────────────────── SOCKET ───────────────────────

  useEffect(() => {
  selectedConvoRef.current = selectedConvo;
}, [selectedConvo]);

  // ✅ ADD THIS ENTIRE useEffect
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);


  useEffect(() => {
  if (!user) return;

  // Use the single global socket
  if (!globalSocket) {
    globalSocket = io(SOCKET_URL, { query: { userId: user._id } });
  }

  socket.current = globalSocket;

  const handleIncomingMessage = async (msg) => {
    let finalContent = msg.content;

    try {
      if (typeof msg.content === "string" && msg.content.startsWith("{")) {
        const parsed = JSON.parse(msg.content);

        if (parsed.iv && parsed.data) {
          const convo = conversationsRef.current.find(
            (c) => c._id === msg.conversation
          );
          const aes = await getAesKey(convo);

          if (aes) {
            finalContent = await decrypt(aes, parsed);
          }
        }
      }
    } catch (e) {}


    // If this message is sent by me, ignore socket echo
if (msg.sender._id === user._id) {
  return;
}


    const finalMsg = { ...msg, content: finalContent };

    setMessages((prev) => {
      if (selectedConvoRef.current?._id === finalMsg.conversation) {
        return [...prev, finalMsg];
      }
      return prev;
    });

    updateConvoList(finalMsg);
  };

  socket.current.on("receiveMessage", handleIncomingMessage);

  return () => {
    socket.current.off("receiveMessage", handleIncomingMessage);
  };
}, [user]);



  // ─────────────────────── LOAD CONVERSATIONS ───────────────────────

  useEffect(() => {
    if (!user) return;

    api.get("/conversations")
      .then((res) => setConversations(res.data))
      .catch(() => {});
  }, [user]);

//   useEffect(() => {
//   if (!selectedConvo) return;

//   // Rejoin room when component reloads
//   socket.current?.emit("joinRoom", selectedConvo._id);

// }, [selectedConvo]);



  // ─────────────────────── LOAD MESSAGES ───────────────────────

 useEffect(() => {
  if (!selectedConvo) return;

  socket.current.emit("joinRoom", selectedConvo._id);

  api.get(`/messages/${selectedConvo._id}`)
    .then(async (res) => {
      const list = await Promise.all(
        res.data.map(async (m) => {
          let content = m.content;

          try {
            // Trim to avoid newline/spaces
            const trimmed = (typeof content === "string" ? content.trim() : content);

            // Only parse JSON-like data
            if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
              const parsed = JSON.parse(trimmed);

              // Check if it's encrypted structure
              if (parsed.iv && parsed.data) {
                const aes = await getAesKey(selectedConvo);

                if (aes) {
                  content = await decrypt(aes, parsed);
                }
              }
            }
          } catch (e) {
            // Ignore parse errors, keep raw content
          }

          return { ...m, content };
        })
      );

      setMessages(list);
    })
    .catch(() => {});
}, [selectedConvo]);


  // ─────────────────────── UPDATE CHAT LIST ───────────────────────

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

  // ─────────────────────── SELECT / CREATE CONVERSATIONS ───────────────────────

  const handleSelectConvo = (convo) => {
    setSelectedConvo(convo);
    if (isMobile) setMobileView("chat");
  };

  const handleCreateConvo = (targetUser) => {
    api.post("/conversations", { targetUserId: targetUser._id })
      .then((res) => {
        const newConvo = res.data;

        if (!conversations.find((c) => c._id === newConvo._id)) {
          setConversations((prev) => [newConvo, ...prev]);
          socket.current.emit("notifyNewConversation", {
            ...newConvo,
            creatorId: user._id,
          });
        }

        setSelectedConvo(newConvo);
        if (isMobile) setMobileView("chat");
      })
      .catch(() => {});
  };

  // ─────────────────────── SEND MESSAGE ───────────────────────

  const handleSendMessage = async (content) => {
  if (!selectedConvo) return;

  let sendContent = content;

  // Encrypt before sending
  const aes = await getAesKey(selectedConvo);
  if (aes) {
    const encrypted = await encrypt(aes, content);
    sendContent = JSON.stringify(encrypted);
  }

  // ⭐ Add the plaintext message instantly
  const localMessage = {
    _id: Date.now(),        // temporary ID
    content,                // plaintext
    sender: { _id: user._id },
    conversation: selectedConvo._id,
    createdAt: new Date().toISOString(),
  };

  setMessages((prev) => [...prev, localMessage]);

  // Send encrypted to backend
  socket.current.emit("sendMessage", {
    content: sendContent,
    conversationId: selectedConvo._id,
    sender: user._id,
  });
};
  // ─────────────────────── LOADING STATE ───────────────────────

  if (!user) {
    return <div className="h-full flex items-center justify-center">Loading...</div>;
  }

  // ─────────────────────── UI RENDER ───────────────────────

  return (
    <UserContext.Provider value={user}>
      <div className="flex h-full">

        {/* ⭐ MOBILE LIST ONLY */}
        {isMobile && mobileView === "list" && (
          <ConversationList
            conversations={conversations}
            onSelect={handleSelectConvo}
            activeId={selectedConvo?._id}
            onCreateConvo={handleCreateConvo}
          />
        )}

        {/* ⭐ MOBILE CHAT ONLY */}
        {isMobile && mobileView === "chat" && selectedConvo && (
          <ChatWindow
            conversation={selectedConvo}
            messages={messages}
            onSendMessage={handleSendMessage}
            onBack={() => {
              setMobileView("list");
              setSelectedConvo(null);
            }}
          />
        )}

        {/* ⭐ DESKTOP FULL VIEW */}
        {!isMobile && (
          <>
            <ConversationList
              conversations={conversations}
              onSelect={handleSelectConvo}
              activeId={selectedConvo?._id}
              onCreateConvo={handleCreateConvo}
            />

            {selectedConvo ? (
              <ChatWindow
                conversation={selectedConvo}
                messages={messages}
                onSendMessage={handleSendMessage}
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

function ConversationList({ conversations, onSelect, activeId, onCreateConvo }) {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    const delay = setTimeout(() => {
      api.get(`/users?search=${search}`)
        .then((res) => setSearchResults(res.data))
        .catch(() => {});
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  const handleSelectUser = (user) => {
    onCreateConvo(user);
    setSearch("");
    setSearchResults([]);
  };

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col h-full p-4">
      <div className="p-4 border-b border-gray-200 shrink-0">
        <input
          type="text"
          placeholder="Enter phone to find user"
          onChange={(e) => {
            const phone = e.target.value;

            if (!phone) return setSearchResults([]);

            api.get(`/users/phone-search?phone=${phone}`)
              .then((res) => setSearchResults([res.data]))
              .catch(() => setSearchResults([]));
          }}
          className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grow overflow-y-auto">
        {searchResults.length > 0 && (
          <div className="border-b border-gray-200">
            <h3 className="p-2 text-xs font-semibold text-gray-500">Users</h3>

            {searchResults.map((user) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center p-4 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSelectUser(user)}
              >
                <div className="shrink-0 w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>

                <div className="grow ml-3">
                  <h3 className="text-sm font-medium text-gray-900">{user.username}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <h3 className="p-2 text-xs font-semibold text-gray-500">Chats</h3>

        {conversations.map((convo) => (
          <ConversationItem
            key={convo._id}
            convo={convo}
            isActive={convo._id === activeId}
            onClick={() => onSelect(convo)}
          />
        ))}
      </div>
    </div>
  );
}

function ConversationItem({ convo, isActive, onClick }) {
  const user = useUser();
  if (!user) return null;

  const other = convo.participants.find((p) => p.user._id !== user._id)?.user;
  const name = other?.username || "Chat";

  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`flex items-center p-4 cursor-pointer hover:bg-gray-100 transition-colors ${
        isActive ? "bg-indigo-50" : ""
      }`}
    >
      <div className="shrink-0 w-12 h-12 bg-indigo-500 text-white rounded-full flex items-center justify-center">
        {name.charAt(0).toUpperCase()}
      </div>

      <div className="grow ml-3 overflow-hidden">
        <h3 className="text-sm font-medium">{name}</h3>
        <p className="text-sm text-gray-500 truncate">{convo.lastMessage || "..."}</p>
      </div>
    </motion.div>
  );
}

// ───────────────────────────────────────────────────────────
// CHAT WINDOW
// ───────────────────────────────────────────────────────────

function ChatWindow({ conversation, messages, onSendMessage, onBack }) {
  const user = useUser();
  const [content, setContent] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const endRef = useRef(null);

  const other = conversation.participants.find((p) => p.user._id !== user._id)?.user;
  const name = other?.username;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSendMessage(content.trim());
    setContent("");
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="grow flex flex-col bg-gray-50">

      <div className="p-4 bg-white shadow flex items-center space-x-4">

        {/* ⭐ MOBILE BACK BUTTON */}
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 bg-gray-200 rounded-full mr-2 md:hidden"
          >
            ←
          </button>
        )}

        <div className="shrink-0 w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold">
          {name.charAt(0).toUpperCase()}
        </div>

        <h2 className="text-lg font-semibold">{name}</h2>
      </div>

      <div className="grow p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <Message key={msg._id} message={msg} />
        ))}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-4 bg-white border-t border-gray-200 relative"
      >
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setShowEmoji((p) => !p)}
            className="text-2xl"
          >
            🙂
          </button>

          {showEmoji && (
            <div className="absolute bottom-16 left-4 z-50">
              <EmojiPicker
                onEmojiClick={(emoji) => setContent((prev) => prev + emoji.emoji)}
              />
            </div>
          )}

          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message..."
            className="grow px-4 py-2 border border-gray-300 rounded-full"
          />

          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// MESSAGE BUBBLE
// ───────────────────────────────────────────────────────────

function Message({ message }) {
  const user = useUser();
  const isMe = message.sender._id === user._id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.20 }}
      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-xs px-4 py-3 rounded-2xl shadow ${
          isMe
            ? "bg-indigo-500 text-white rounded-br-lg"
            : "bg-white text-gray-900 rounded-bl-lg"
        }`}
      >
        <p>{message.content}</p>
        <p className="text-xs opacity-70 text-right mt-1">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </motion.div>
  );
}

// ───────────────────────────────────────────────────────────
// WELCOME SCREEN
// ───────────────────────────────────────────────────────────

function WelcomeScreen() {
  const user = useUser();
  return (
    <div className="grow flex flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-semibold">Welcome, {user.username}!</h2>
      <p className="mt-2 text-gray-500">Select a chat to start messaging.</p>
    </div>
  );
}

export default Dashboard;
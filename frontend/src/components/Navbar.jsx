import { useState, useEffect, useRef } from "react";
import { Disclosure } from "@headlessui/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getToken, removeToken } from "../utils/auth";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const token = getToken();
  const [theme, setTheme] = useState("light");

  const isActive = (path) => location.pathname === path;

  // Logic to close mobile menu when clicking outside
  useEffect(() => {
    function handleOutside(e) {
      if (!menuRef.current || !buttonRef.current) return;
      if (
        !menuRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        // If the button is visible (meaning we are on mobile) and menu is open, click to close
        // Note: Headless UI handles the 'open' state internally, so we just simulate a click 
        // if the panel is rendered.
        // A safer check is usually checking aria-expanded or internal state, 
        // but strictly based on your previous code logic:
        if (buttonRef.current.getAttribute('aria-expanded') === 'true') {
           buttonRef.current.click();
        }
      }
    }
    document.addEventListener("click", handleOutside);
    return () => document.removeEventListener("click", handleOutside);
  }, []);

  useEffect(() => {
    const t = localStorage.getItem("theme") || "light";
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  return (
    <Disclosure
      as="nav"
      className="bg-white text-black dark:bg-gray-900 dark:text-white shadow"
    >
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              {/* LEFT: LOGO */}
              <div className="flex items-center space-x-3">
                <img src={logo} alt="logo" className="h-8 w-8 rounded-full" />
                <Link to="/" className="text-xl font-bold text-indigo-400">
                  Connect
                </Link>
              </div>

              {/* CENTER: DESKTOP NAV LINKS (Only if NOT logged in) */}
              <div className="hidden md:flex items-center space-x-6 text-sm font-bold">
                {!token && (
                  <>
                    <Link
                      to="/"
                      className={`px-3 py-2 rounded-md transition ${
                        isActive("/")
                          ? "text-indigo-400"
                          : "text-gray-700 dark:text-gray-300 hover:text-indigo-400"
                      }`}
                    >
                      Home
                    </Link>

                    <Link
                      to="/contact"
                      className={`px-3 py-2 rounded-md transition ${
                        isActive("/contact")
                          ? "text-indigo-400"
                          : "text-gray-700 dark:text-gray-300 hover:text-indigo-400"
                      }`}
                    >
                      Contact Us
                    </Link>
                    <Link
                      to="/login"
                      className={`px-3 py-2 rounded transition ${
                        isActive("/login")
                          ? "bg-indigo-700 text-white"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white"
                      }`}
                    >
                      Login
                    </Link>

                    <Link
                      to="/register"
                      className={`px-3 py-2 rounded transition ${
                        isActive("/register")
                          ? "bg-gray-600 text-white"
                          : "bg-gray-700 hover:bg-gray-600 text-white"
                      }`}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>

              {/* RIGHT: THEME TOGGLE & LOGOUT */}
              <div className="flex items-center space-x-4">
                <motion.button
                  onClick={toggleTheme}
                  whileTap={{ scale: 0.85 }}
                  className="p-2 md:hidden hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full"
                >
                  <span className="material-symbols-rounded text-[28px]">
                    {theme === "light" ? "dark_mode" : "light_mode"}
                  </span>
                </motion.button>

                {/* ⭐ DIRECT LOGOUT BUTTON (Replaces Person Menu) */}
                {token && (
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition shadow-sm"
                  >
                    Logout
                  </button>
                )}

                {/* MOBILE HAMBURGER (Only if NOT logged in) */}
                {!token && (
                  <Disclosure.Button
                    ref={buttonRef}
                    className="md:hidden p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
                  >
                    <span className="material-symbols-rounded text-[28px]">
                      {open ? "close" : "menu"}
                    </span>
                  </Disclosure.Button>
                )}

                {/* DESKTOP THEME TOGGLE */}
                <motion.button
                  onClick={toggleTheme}
                  whileTap={{ scale: 0.85 }}
                  className="p-2 hidden md:flex hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full"
                >
                  <span className="material-symbols-rounded text-[24px]">
                    {theme === "light" ? "dark_mode" : "light_mode"}
                  </span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* MOBILE MENU PANEL (Only shows when !token) */}
          <Disclosure.Panel
            ref={menuRef}
            className="md:hidden bg-gray-200 dark:bg-gray-800"
          >
            <div className="space-y-1 px-4 pt-2 pb-3">
              {!token && (
                <>
                  <Link
                    to="/"
                    className={`block px-3 py-2 rounded-md transition ${
                      isActive("/")
                        ? "bg-gray-300 dark:bg-gray-700 text-indigo-400"
                        : "text-gray-900 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    Home
                  </Link>

                  <Link
                    to="/contact"
                    className={`block px-3 py-2 rounded-md transition ${
                      isActive("/contact")
                        ? "bg-gray-300 dark:bg-gray-700 text-indigo-400"
                        : "text-gray-900 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    Contact Us
                  </Link>

                  <Link
                    to="/login"
                    className={`block px-3 py-2 rounded-md transition ${
                      isActive("/login")
                        ? "bg-gray-300 dark:bg-gray-700 text-indigo-400"
                        : "text-gray-900 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className={`block px-3 py-2 rounded-md transition ${
                      isActive("/register")
                        ? "bg-gray-300 dark:bg-gray-700 text-indigo-400"
                        : "text-gray-900 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
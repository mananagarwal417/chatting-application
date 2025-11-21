// import { Fragment, useState, useEffect } from "react";
// import { Disclosure, Menu, Transition } from "@headlessui/react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { getToken, removeToken } from "../utils/auth";
// import { motion } from "framer-motion";
// import logo from "../assets/logo.png";

// function classNames(...classes) {
//   return classes.filter(Boolean).join(" ");
// }

// export default function Navbar() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const token = getToken();
//   const [theme, setTheme] = useState("light");

//   const isActive = (path) => location.pathname === path;

//   useEffect(() => {
//     const t = localStorage.getItem("theme") || "light";
//     setTheme(t);
//     document.documentElement.classList.toggle("dark", t === "dark");
//   }, []);

//   const toggleTheme = () => {
//     const newTheme = theme === "light" ? "dark" : "light";
//     setTheme(newTheme);
//     localStorage.setItem("theme", newTheme);
//     document.documentElement.classList.toggle("dark", newTheme === "dark");
//   };

//   const handleLogout = () => {
//     removeToken();
//     navigate("/login");
//   };

//   return (
//     <Disclosure as="nav" className="bg-gray-900 text-white shadow">
//       {({ open }) => (
//         <>
//           {/* DESKTOP NAV */}
//           <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//             <div className="flex h-16 justify-between items-center">
//               {/* LEFT: LOGO + TITLE */}
//               <div className="flex items-center space-x-3">
//                 <img src={logo} alt="logo" className="h-8 w-8 rounded-full" />
//                 <Link to="/" className="text-xl font-bold text-indigo-400">
//                   Connect
//                 </Link>
//               </div>

//               {/* DESKTOP NAV LINKS */}
//               <div className="hidden md:flex items-center space-x-6 text-sm font-bold">
//                 {/* GUEST ONLY LINKS */}
//                 {!token && (
//                   <>
//                     {/* HOME */}
//                     <Link
//                       to="/"
//                       className={`px-3 py-2 rounded-md transition ${
//                         isActive("/")
//                           ? "text-indigo-400"
//                           : "text-gray-300 hover:text-indigo-400"
//                       }`}
//                     >
//                       Home
//                     </Link>

//                     {/* CONTACT */}
//                     <Link
//                       to="/contact"
//                       className={`px-3 py-2 rounded-md transition ${
//                         isActive("/contact")
//                           ? "text-indigo-400"
//                           : "text-gray-300 hover:text-indigo-400"
//                       }`}
//                     >
//                       Contact Us
//                     </Link>
//                     <Link
//                       to="/login"
//                       className={`px-3 py-2 rounded transition ${
//                         isActive("/login")
//                           ? "bg-indigo-700"
//                           : "bg-indigo-600 hover:bg-indigo-700"
//                       }`}
//                     >
//                       Login
//                     </Link>

//                     <Link
//                       to="/register"
//                       className={`px-3 py-2 rounded transition ${
//                         isActive("/register")
//                           ? "bg-gray-600"
//                           : "bg-gray-700 hover:bg-gray-600"
//                       }`}
//                     >
//                       Register
//                     </Link>
//                   </>
//                 )}
//               </div>

//               {/* RIGHT SIDE ICONS */}
//               {/* RIGHT SIDE ICONS */}
//               <div className="flex items-center space-x-4">
//                 {/* ---- MOBILE THEME BUTTON ---- */}
//                 <motion.button
//                   onClick={toggleTheme}
//                   whileTap={{ scale: 0.85 }}
//                   className="p-2 md:hidden hover:bg-gray-800 rounded-full"
//                 >
//                   <span className="material-symbols-rounded text-[28px]">
//                     {theme === "light" ? "dark_mode" : "light_mode"}
//                   </span>
//                 </motion.button>

//                 {/* ---- PROFILE BUTTON (MOBILE + DESKTOP) WHEN LOGGED IN ---- */}
//                 {token && (
//                   <Menu as="div" className="relative">
//                     <Menu.Button className="flex items-center rounded-full bg-gray-800">
//                       <span className="material-symbols-rounded p-2 bg-indigo-600 rounded-full">
//                         person
//                       </span>
//                     </Menu.Button>

//                     <Transition
//                       as={Fragment}
//                       enter="transition ease-out duration-150"
//                       enterFrom="transform opacity-0 scale-95"
//                       enterTo="transform opacity-100 scale-100"
//                       leave="transition ease-in duration-100"
//                       leaveFrom="transform opacity-100 scale-100"
//                       leaveTo="transform opacity-0 scale-95"
//                     >
//                       <Menu.Items className="absolute right-0 z-50 mt-2 w-40 origin-top-right rounded-md bg-white dark:bg-gray-700 shadow-lg">
//                         {/* LOGOUT ONLY */}
//                         <Menu.Item>
//                           {({ active }) => (
//                             <button
//                               onClick={handleLogout}
//                               className={classNames(
//                                 active ? "bg-gray-100 dark:bg-gray-600" : "",
//                                 "block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-white"
//                               )}
//                             >
//                               Logout
//                             </button>
//                           )}
//                         </Menu.Item>
//                       </Menu.Items>
//                     </Transition>
//                   </Menu>
//                 )}

//                 {/* ---- MOBILE HAMBURGER WHEN LOGGED OUT ---- */}
//                 {!token && (
//                   <Disclosure.Button className="md:hidden p-2 rounded hover:bg-gray-800">
//                     <span className="material-symbols-rounded text-[28px]">
//                       {open ? "close" : "menu"}
//                     </span>
//                   </Disclosure.Button>
//                 )}

//                 {/* ---- DESKTOP THEME BUTTON ---- */}
//                 <motion.button
//                   onClick={toggleTheme}
//                   whileTap={{ scale: 0.85 }}
//                   className="p-2 hidden md:flex hover:bg-gray-800 rounded-full"
//                 >
//                   <span className="material-symbols-rounded text-[24px]">
//                     {theme === "light" ? "dark_mode" : "light_mode"}
//                   </span>
//                 </motion.button>
//               </div>
//             </div>
//           </div>

//           {/* MOBILE MENU */}
//           {/* MOBILE MENU */}
//           <Disclosure.Panel className="md:hidden bg-gray-800">
//             <div className="space-y-1 px-4 pt-2 pb-3">
//               {/* Only show menu if NOT logged in */}
//               {!token && (
//                 <>
//                   <Link
//                     to="/"
//                     className={`block px-3 py-2 rounded-md transition ${
//                       isActive("/")
//                         ? "bg-gray-700 text-indigo-400"
//                         : "text-gray-200 hover:bg-gray-700"
//                     }`}
//                   >
//                     Home
//                   </Link>

//                   <Link
//                     to="/contact"
//                     className={`block px-3 py-2 rounded-md transition ${
//                       isActive("/contact")
//                         ? "bg-gray-700 text-indigo-400"
//                         : "text-gray-200 hover:bg-gray-700"
//                     }`}
//                   >
//                     Contact Us
//                   </Link>

//                   <Link
//                     to="/login"
//                     className={`block px-3 py-2 rounded-md transition ${
//                       isActive("/login")
//                         ? "bg-gray-700 text-indigo-400"
//                         : "text-gray-200 hover:bg-gray-700"
//                     }`}
//                   >
//                     Login
//                   </Link>

//                   <Link
//                     to="/register"
//                     className={`block px-3 py-2 rounded-md transition ${
//                       isActive("/register")
//                         ? "bg-gray-700 text-indigo-400"
//                         : "text-gray-200 hover:bg-gray-700"
//                     }`}
//                   >
//                     Register
//                   </Link>
//                 </>
//               )}
//             </div>
//           </Disclosure.Panel>
//         </>
//       )}
//     </Disclosure>
//   );
// }


// import { Fragment, useState, useEffect } from "react";
// import { Disclosure, Menu, Transition } from "@headlessui/react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { getToken, removeToken } from "../utils/auth";
// import { motion } from "framer-motion";
// import logo from "../assets/logo.png";

// function classNames(...classes) {
//   return classes.filter(Boolean).join(" ");
// }

// export default function Navbar() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const token = getToken();
//   const [theme, setTheme] = useState("light");

//   const isActive = (path) => location.pathname === path;

//   useEffect(() => {
//     const t = localStorage.getItem("theme") || "light";
//     setTheme(t);
//     document.documentElement.classList.toggle("dark", t === "dark");
//   }, []);

//   const toggleTheme = () => {
//     const newTheme = theme === "light" ? "dark" : "light";
//     setTheme(newTheme);
//     localStorage.setItem("theme", newTheme);
//     document.documentElement.classList.toggle("dark", newTheme === "dark");
//   };

//   const handleLogout = () => {
//     removeToken();
//     navigate("/login");
//   };

//   return (
//     <Disclosure
//       as="nav"
//       className="bg-white text-black dark:bg-gray-900 dark:text-white shadow"
//     >
//       {({ open }) => (
//         <>
//           <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//             <div className="flex h-16 justify-between items-center">
//               <div className="flex items-center space-x-3">
//                 <img src={logo} alt="logo" className="h-8 w-8 rounded-full" />
//                 <Link to="/" className="text-xl font-bold text-indigo-400">
//                   Connect
//                 </Link>
//               </div>

//               <div className="hidden md:flex items-center space-x-6 text-sm font-bold">
//                 {!token && (
//                   <>
//                     <Link
//                       to="/"
//                       className={`px-3 py-2 rounded-md transition ${
//                         isActive("/")
//                           ? "text-indigo-400"
//                           : "text-gray-700 dark:text-gray-300 hover:text-indigo-400"
//                       }`}
//                     >
//                       Home
//                     </Link>

//                     <Link
//                       to="/contact"
//                       className={`px-3 py-2 rounded-md transition ${
//                         isActive("/contact")
//                           ? "text-indigo-400"
//                           : "text-gray-700 dark:text-gray-300 hover:text-indigo-400"
//                       }`}
//                     >
//                       Contact Us
//                     </Link>
//                     <Link
//                       to="/login"
//                       className={`px-3 py-2 rounded transition ${
//                         isActive("/login")
//                           ? "bg-indigo-700 text-white"
//                           : "bg-indigo-600 hover:bg-indigo-700 text-white"
//                       }`}
//                     >
//                       Login
//                     </Link>

//                     <Link
//                       to="/register"
//                       className={`px-3 py-2 rounded transition ${
//                         isActive("/register")
//                           ? "bg-gray-600 text-white"
//                           : "bg-gray-700 hover:bg-gray-600 text-white"
//                       }`}
//                     >
//                       Register
//                     </Link>
//                   </>
//                 )}
//               </div>

//               <div className="flex items-center space-x-4">
//                 <motion.button
//                   onClick={toggleTheme}
//                   whileTap={{ scale: 0.85 }}
//                   className="p-2 md:hidden hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full"
//                 >
//                   <span className="material-symbols-rounded text-[28px]">
//                     {theme === "light" ? "dark_mode" : "light_mode"}
//                   </span>
//                 </motion.button>

//                 {token && (
//                   <Menu as="div" className="relative">
//                     <Menu.Button className="flex items-center rounded-full bg-gray-200 dark:bg-gray-800">
//                       <span className="material-symbols-rounded p-2 bg-indigo-600 rounded-full text-white">
//                         person
//                       </span>
//                     </Menu.Button>

//                     <Transition
//                       as={Fragment}
//                       enter="transition ease-out duration-150"
//                       enterFrom="transform opacity-0 scale-95"
//                       enterTo="transform opacity-100 scale-100"
//                       leave="transition ease-in duration-100"
//                       leaveFrom="transform opacity-100 scale-100"
//                       leaveTo="transform opacity-0 scale-95"
//                     >
//                       <Menu.Items className="absolute right-0 z-50 mt-2 w-40 origin-top-right rounded-md bg-white dark:bg-gray-700 shadow-lg">
//                         <Menu.Item>
//                           {({ active }) => (
//                             <button
//                               onClick={handleLogout}
//                               className={classNames(
//                                 active
//                                   ? "bg-gray-100 dark:bg-gray-600"
//                                   : "",
//                                 "block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-white"
//                               )}
//                             >
//                               Logout
//                             </button>
//                           )}
//                         </Menu.Item>
//                       </Menu.Items>
//                     </Transition>
//                   </Menu>
//                 )}

//                 {!token && (
//                   <Disclosure.Button className="md:hidden p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800">
//                     <span className="material-symbols-rounded text-[28px]">
//                       {open ? "close" : "menu"}
//                     </span>
//                   </Disclosure.Button>
//                 )}

//                 <motion.button
//                   onClick={toggleTheme}
//                   whileTap={{ scale: 0.85 }}
//                   className="p-2 hidden md:flex hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full"
//                 >
//                   <span className="material-symbols-rounded text-[24px]">
//                     {theme === "light" ? "dark_mode" : "light_mode"}
//                   </span>
//                 </motion.button>
//               </div>
//             </div>
//           </div>

//           <Disclosure.Panel className="md:hidden bg-gray-200 dark:bg-gray-800">
//             <div className="space-y-1 px-4 pt-2 pb-3">
//               {!token && (
//                 <>
//                   <Link
//                     to="/"
//                     className={`block px-3 py-2 rounded-md transition ${
//                       isActive("/")
//                         ? "bg-gray-300 dark:bg-gray-700 text-indigo-400"
//                         : "text-gray-900 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
//                     }`}
//                   >
//                     Home
//                   </Link>

//                   <Link
//                     to="/contact"
//                     className={`block px-3 py-2 rounded-md transition ${
//                       isActive("/contact")
//                         ? "bg-gray-300 dark:bg-gray-700 text-indigo-400"
//                         : "text-gray-900 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
//                     }`}
//                   >
//                     Contact Us
//                   </Link>

//                   <Link
//                     to="/login"
//                     className={`block px-3 py-2 rounded-md transition ${
//                       isActive("/login")
//                         ? "bg-gray-300 dark:bg-gray-700 text-indigo-400"
//                         : "text-gray-900 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
//                     }`}
//                   >
//                     Login
//                   </Link>

//                   <Link
//                     to="/register"
//                     className={`block px-3 py-2 rounded-md transition ${
//                       isActive("/register")
//                         ? "bg-gray-300 dark:bg-gray-700 text-indigo-400"
//                         : "text-gray-900 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
//                     }`}
//                   >
//                     Register
//                   </Link>
//                 </>
//               )}
//             </div>
//           </Disclosure.Panel>
//         </>
//       )}
//     </Disclosure>
//   );
// }


import { Fragment, useState, useEffect } from "react";
import { useRef } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getToken, removeToken } from "../utils/auth";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar(){
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const token = getToken();
  const [theme, setTheme] = useState("light");

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    function handleOutside(e) {
      if (!menuRef.current || !buttonRef.current) return;
      if (!menuRef.current.contains(e.target) && !buttonRef.current.contains(e.target)) {
        if (!buttonRef.current.classList.contains('hidden')) buttonRef.current.click();
      }
    }
    document.addEventListener('click', handleOutside);
    return () => document.removeEventListener('click', handleOutside);
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
  
  useEffect(() => {
  const btn = document.querySelector("#mobile-menu-btn");
  if (btn && !btn.classList.contains("hidden")) {
    btn.click(); // closes the open menu smoothly
  }
}, [location.pathname]);


  return (
    <Disclosure
      as="nav"
      className="bg-white text-black dark:bg-gray-900 dark:text-white shadow"
    >
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              <div className="flex items-center space-x-3">
                <img src={logo} alt="logo" className="h-8 w-8 rounded-full" />
                <Disclosure.Button as={Link}$1>
                  Connect
                </Disclosure.Button>
              </div>

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

                    <Disclosure.Button as={Link} to="/contact">
                      Contact Us
                    </Disclosure.Button>
                    <Disclosure.Button as={Link} to="/login">
                      Login
                    </Disclosure.Button>

                    <Disclosure.Button as={Link} to="/register">
                      Register
                    </Disclosure.Button>
                  </>
                )}
              </div>

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

                {token && (
                  <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center rounded-full bg-gray-200 dark:bg-gray-800">
                      <span className="material-symbols-rounded p-2 bg-indigo-600 rounded-full text-white">
                        person
                      </span>
                    </Menu.Button>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-150"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-100"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-50 mt-2 w-40 origin-top-right rounded-md bg-white dark:bg-gray-700 shadow-lg">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={classNames(
                                active
                                  ? "bg-gray-100 dark:bg-gray-600"
                                  : "",
                                "block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-white"
                              )}
                            >
                              Logout
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                )}

                {!token && (
                  <Disclosure.Button ref={buttonRef} id="mobile-menu-btn" className="md:hidden p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800">
                    <span className="material-symbols-rounded text-[28px]">
                      {open ? "close" : "menu"}
                    </span>
                  </Disclosure.Button>
                )}

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

          <Disclosure.Panel ref={menuRef} className="md:hidden bg-gray-200 dark:bg-gray-800">
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




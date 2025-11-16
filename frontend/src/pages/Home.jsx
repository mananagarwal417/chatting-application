import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// ICONS
const BoltIcon = () => (
  <svg className="w-12 h-12 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none"
    viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-12 h-12 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none"
    viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-12 h-12 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none"
    viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

function Home() {

  // ⭐ REQUIRED FOR FEATURE 3 OVERLAY
  const [showComingSoon, setShowComingSoon] = useState(false);
  const timeoutRef = useRef(null);

  return (
    <div className="text-gray-800">

      {/* HERO SECTION */}
      <motion.section className="bg-white shadow-sm"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}>
        <div className="max-w-7xl mx-auto py-24 px-4 text-center">

          <motion.h1
            className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <span className="block">Connect Instantly.</span>
            <span className="block text-indigo-600">Your New Conversation Hub.</span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-md mx-auto text-lg text-gray-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
          >
            Chat with friends, family, and colleagues in real-time.
          </motion.p>

          <motion.div
            className="mt-10 max-w-sm mx-auto sm:flex sm:justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link to="/register"
              className="px-8 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              Get Started Free
            </Link>

            <Link to="/contact"
              className="px-8 py-3 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50">
              Contact Us
            </Link>
          </motion.div>

        </div>
      </motion.section>

      {/* FEATURES */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">

          <motion.div className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}>
            <h2 className="text-base font-semibold text-indigo-600 uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900">
              Everything you need to connect
            </p>
          </motion.div>

          {/* GRID */}
          <motion.div
            className="mt-16 grid gap-10 md:grid-cols-3"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.2 } } }}
          >

            {/* Feature 1 */}
            <motion.div
              className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-lg"
              variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.2 }}
              whileHover={{
                scale: 1.05,
                y: -5,
                boxShadow: "0px 15px 35px rgba(0,0,0,0.15)"
              }}>
              <BoltIcon />
              <h3 className="mt-4 text-xl font-bold">Real-Time Messaging</h3>
              <p className="mt-2 text-base text-gray-600">
                Send and receive messages instantly with our websocket engine.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-lg"
              variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.2 }}
              whileHover={{
                scale: 1.05,
                y: -5,
                boxShadow: "0px 15px 35px rgba(0,0,0,0.15)"
              }}>
              <LockIcon />
              <h3 className="mt-4 text-xl font-bold">Secure & Private</h3>
              <p className="mt-2 text-base text-gray-600">
                We prioritize your privacy with industry-grade encryption.
              </p>
            </motion.div>

            {/* Feature 3 — WITH COMING SOON OVERLAY */}
            <motion.div
              className="relative flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-lg overflow-hidden"
              variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.2 }}
              whileHover={{
                scale: 1.05,
                y: -5,
                boxShadow: "0px 15px 35px rgba(0,0,0,0.15)"
              }}
              onHoverStart={() => {
                if (!showComingSoon) {
                  setShowComingSoon(true);
                  timeoutRef.current = setTimeout(() => {
                    setShowComingSoon(false);
                  }, 1000);
                }
              }}
            >
              <UsersIcon />
              <h3 className="mt-4 text-xl font-bold">Group Chats</h3>
              <p className="mt-2 text-base text-gray-600">
                Create groups and manage your communities with ease.
              </p>

              {/* Coming Soon Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showComingSoon ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
              >
                <motion.span
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{
                    scale: showComingSoon ? 1 : 0.7,
                    opacity: showComingSoon ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="text-white text-2xl font-bold"
                >
                  Coming Soon!
                </motion.span>
              </motion.div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <motion.section
        className="bg-indigo-700"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}>
        <div className="max-w-4xl mx-auto text-center py-16 px-4">
          <h2 className="text-3xl font-extrabold text-white">Ready to join?</h2>
          <p className="mt-4 text-lg text-indigo-200">
            Create your free account today and start chatting in minutes.
          </p>
          <Link to="/register"
            className="mt-8 inline-flex items-center px-6 py-3 bg-white text-indigo-600 rounded-md shadow hover:bg-indigo-50">
            Sign up for free
          </Link>
        </div>
      </motion.section>

    </div>
  );
}

export default Home;

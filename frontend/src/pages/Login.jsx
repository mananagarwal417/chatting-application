import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setToken } from '../utils/auth';
import { motion } from "framer-motion";   // ⭐ ADDED

const API_URL = import.meta.env.VITE_API_URL;


function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      setToken(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">

      {/* ⭐ Animated Card */}
      <motion.div
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Log in to your account
        </h2>

        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            create a new account
          </Link>
        </p>

        {/* EMAIL + PASSWORD LOGIN */}
        <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
          <div className="rounded-md shadow-sm -space-y-px">

            {/* ⭐ Animated Input */}
            <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 
                border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md 
                focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Email address"
              />
            </motion.div>

            {/* ⭐ Animated Input */}
            <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 
                border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md 
                focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Password"
              />
            </motion.div>

          </div>

          {/* ⭐ Animated Button */}
          <motion.button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 
            text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 
            rounded-md focus:outline-none"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.15 }}
          >
            Sign in
          </motion.button>

        </form>
      </motion.div>
    </div>
  );
}

export default Login;

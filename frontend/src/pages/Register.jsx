import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";   // ⭐ ADDED

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlesubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    axios.post('http://localhost:8000/api/auth/register', {
      username,
      email,
      phone,
      password
    })
      .then((res) => {
        console.log(res.data);
        navigate('/login');
      })
      .catch((err) => {
        console.log(err);
        alert(err.response.data.message);
        navigate('/register');
      });
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
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your new account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              log in to an existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onClick={handlesubmit}>
          <div className="rounded-md shadow-sm space-y-4">

            {/* USERNAME */}
            <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
              <input
                id="username"
                name="username"
                type="text"
                onChange={(e) => setUsername(e.target.value)}
                value={username}
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 
                placeholder-gray-500 text-gray-900 rounded-md focus:outline-none 
                focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Username"
              />
            </motion.div>

            {/* EMAIL */}
            <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
              <input
                id="email-address"
                name="email"
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 
                placeholder-gray-500 text-gray-900 rounded-md focus:outline-none 
                focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Email address"
              />
            </motion.div>

            {/* PHONE */}
            <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
              <input
                id="phone"
                name="phone"
                type="text"
                onChange={(e) => setPhone(e.target.value)}
                value={phone}
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 
                placeholder-gray-500 text-gray-900 rounded-md focus:outline-none 
                focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Phone number"
              />
            </motion.div>

            {/* PASSWORD */}
            <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
              <input
                id="password"
                name="password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 
                placeholder-gray-500 text-gray-900 rounded-md focus:outline-none 
                focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Password"
              />
            </motion.div>

            {/* CONFIRM PASSWORD */}
            <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 
                placeholder-gray-500 text-gray-900 rounded-md focus:outline-none 
                focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Confirm Password"
              />
            </motion.div>

          </div>

          {/* ⭐ Animated Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
            <button
              type="submit"
              
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent 
              text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Account
            </button>
          </motion.div>

        </form>

      </motion.div>
    </div>
  );
}

export default Register;

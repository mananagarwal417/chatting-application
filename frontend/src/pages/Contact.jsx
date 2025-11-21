import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion";

function Contact() {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [submitted, setSubmitted] = useState(false); // ⭐ New state

const API_URL = import.meta.env.VITE_API_URL;


  const handlesubmit = async (e) => {
    e.preventDefault();
    const newMessage = { firstname, lastname, email, subject, message };

    try {
      await axios.post(`${API_URL}/api/users/contact`, newMessage);

      // clear fields
      setFirstname('');
      setLastname('');
      setEmail('');
      setSubject('');
      setMessage('');

      // show success animation
      setSubmitted(true);

    } catch (error) {
      alert('Failed to send message.');
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      
      <AnimatePresence mode="wait">
        {!submitted ? (
          /* -------------------- FORM CARD --------------------- */
          <motion.div
            key="form"
            initial={{ opacity: 0, rotateY: -90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: 90 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto bg-white p-10 rounded-xl shadow-lg"
          >
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Get in touch
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                We'd love to hear from you! Please fill out the form below.
              </p>
            </div>

            <form className="mt-10 space-y-6" onSubmit={handlesubmit}>
              <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First name
                  </label>
                  <input
                    type="text"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    required
                    className="mt-1 py-3 px-4 block w-full shadow-sm 
                    focus:ring-indigo-500 focus:border-indigo-500 
                    border-gray-300 rounded-md transition-all duration-150 
                    hover:scale-[1.01]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last name
                  </label>
                  <input
                    type="text"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    required
                    className="mt-1 py-3 px-4 block w-full shadow-sm 
                    focus:ring-indigo-500 focus:border-indigo-500 
                    border-gray-300 rounded-md transition-all duration-150 
                    hover:scale-[1.01]"
                  />
                </div>

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 py-3 px-4 block w-full shadow-sm 
                  focus:ring-indigo-500 focus:border-indigo-500 
                  border-gray-300 rounded-md transition-all duration-150 
                  hover:scale-[1.01]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="mt-1 py-3 px-4 block w-full shadow-sm 
                  focus:ring-indigo-500 focus:border-indigo-500 
                  border-gray-300 rounded-md transition-all duration-150 
                  hover:scale-[1.01]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  required
                  className="mt-1 py-3 px-4 block w-full shadow-sm 
                  focus:ring-indigo-500 focus:border-indigo-500 
                  border-gray-300 rounded-md transition-all duration-150 
                  hover:scale-[1.01]"
                />
              </div>

              <div className="text-right">
                <button
                  type="submit"
                  className="inline-flex justify-center py-3 px-6 text-white 
                  bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm"
                >
                  Send Message
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          /* ---------------- SUCCESS MESSAGE CARD ------------------ */
          <motion.div
            key="success"
            initial={{ opacity: 0, rotateY: -90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto bg-white p-10 rounded-xl shadow-lg text-center"
          >
            <h2 className="text-3xl font-semibold text-indigo-600">
              🎉 Message Sent!
            </h2>

            <p className="mt-4 text-gray-600 text-lg">
              Thank you for reaching out.  
              We will get back to you shortly.
            </p>

            <button
              onClick={() => setSubmitted(false)}
              className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Send Another Message
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default Contact;

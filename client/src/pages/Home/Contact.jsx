/* eslint-disable-next-line no-unused-vars */
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { Header } from "../../components/Header";
import Footer from "../../components/Footer";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData); // Here you can add backend API integration
    setIsSubmitted(true);
  };

  return (
    <div>
      <Header />
            
            {/*   Header bg */}
            <div className="relative bg-indigo-600 h-16">
              <div className="absolute bottom-0 inset-x-0">
                <svg
                  viewBox="0 0 0 0"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  <path
                    fill="rgb(249 250 251)"
                    d="M0 100H1440V0C1440 0 1144 100 720 100C296 100 0 0 0 0V100Z"
                  />
                </svg>
              </div>
            </div>
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white px-6 py-12">
       
      <motion.div
        className="max-w-4xl w-full bg-white shadow-lg rounded-2xl p-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <motion.h1
          className="text-4xl font-bold text-center text-gray-800 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Contact Us
        </motion.h1>

        <p className="text-center text-gray-600 mb-8">
          Have questions? We’d love to hear from you. Send us a message and we’ll get back to you as soon as possible.
        </p>

        {/* Contact Info */}
        <div className="grid md:grid-cols-3 gap-6 text-center mb-8">
          <motion.div
            className="flex flex-col items-center bg-blue-50 p-6 rounded-xl shadow-sm"
            whileHover={{ scale: 1.05 }}
          >
            <Phone className="h-10 w-10 text-blue-600 mb-2" />
            <h3 className="text-lg font-semibold text-gray-800">Phone</h3>
            <p className="text-sm text-gray-600">+1 (234) 567-890</p>
          </motion.div>

          <motion.div
            className="flex flex-col items-center bg-green-50 p-6 rounded-xl shadow-sm"
            whileHover={{ scale: 1.05 }}
          >
            <Mail className="h-10 w-10 text-green-600 mb-2" />
            <h3 className="text-lg font-semibold text-gray-800">Email</h3>
            <p className="text-sm text-gray-600">contact@equbapp.com</p>
          </motion.div>

          <motion.div
            className="flex flex-col items-center bg-yellow-50 p-6 rounded-xl shadow-sm"
            whileHover={{ scale: 1.05 }}
          >
            <MapPin className="h-10 w-10 text-yellow-600 mb-2" />
            <h3 className="text-lg font-semibold text-gray-800">Location</h3>
            <p className="text-sm text-gray-600">Addis Ababa, Ethiopia</p>
          </motion.div>
        </div>

        {/* Contact Form */}
        <motion.form
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onSubmit={handleSubmit}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <textarea
            name="message"
            placeholder="Your Message"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>
          <motion.button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all"
            whileHover={{ scale: 1.05 }}
          >
            <Send className="h-5 w-5" />
            Send Message
          </motion.button>
        </motion.form>

        {/* Success Message */}
        {isSubmitted && (
          <motion.p
            className="mt-6 text-center text-green-600 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            ✅ Thank you! Your message has been sent.
          </motion.p>
        )}
      </motion.div>
    </div>
    <Footer />
    </div>
  );
};

export default Contact;

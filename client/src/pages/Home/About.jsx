/* eslint-disable-next-line no-unused-vars */
import { motion } from "framer-motion";
import { Info, Users, Star, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "../../components/Header";
import Footer from "../../components/Footer";

export const About = () => {
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
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white flex items-center justify-center p-6">
        <motion.div
          className="max-w-4xl w-full bg-white shadow-xl rounded-2xl p-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header Section */}
          <motion.h1
            className="text-4xl font-bold text-center text-gray-800 mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            About Our Platform
          </motion.h1>

          {/* Description */}
          <motion.p
            className="text-gray-600 text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Our platform revolutionizes traditional Equb management, making it
            seamless, secure, and efficient for users to create, manage, and
            participate in savings groups.
          </motion.p>

          {/* Features Section */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <motion.div
              className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl shadow-sm bg-blue-50"
              whileHover={{ scale: 1.05 }}
            >
              <Info className="w-10 h-10 text-blue-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Easy Management
                </h3>
                <p className="text-sm text-gray-600">
                  Create and manage Equbs effortlessly with an intuitive
                  dashboard.
                </p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl shadow-sm bg-green-50"
              whileHover={{ scale: 1.05 }}
            >
              <Users className="w-10 h-10 text-green-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Community Driven
                </h3>
                <p className="text-sm text-gray-600">
                  Connect with others and build trust through financial
                  collaboration.
                </p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl shadow-sm bg-yellow-50"
              whileHover={{ scale: 1.05 }}
            >
              <Star className="w-10 h-10 text-yellow-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Secure & Transparent
                </h3>
                <p className="text-sm text-gray-600">
                  Ensuring fairness and trust with encrypted data and
                  transparent transactions.
                </p>
              </div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl shadow-sm bg-purple-50"
              whileHover={{ scale: 1.05 }}
            >
              <Rocket className="w-10 h-10 text-purple-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Fast & Efficient
                </h3>
                <p className="text-sm text-gray-600">
                  Automated processes save time and reduce manual effort.
                </p>
              </div>
            </motion.div>
          </div>

          {/* CTA Section */}
          <Link to="/signup">
            <motion.div
              className="mt-10 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <button className="bg-blue-600 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all">
                Get Started
              </button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

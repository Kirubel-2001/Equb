
import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Shield, 
  ChevronRight,
  Search,
  Award,
  TrendingUp,
  Bell,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  HelpCircle,
  Plus
} from 'lucide-react';
/* eslint-disable-next-line no-unused-vars */
import { motion } from 'framer-motion';
import { Header } from './Header';



const Home = () => {
  const [activeEqubs] = useState([
    {
      id: 1,
      name: "Weekly Savings Group",
      members: 12,
      amount: 1000,
      cycle: "Weekly",
      location: "Addis Ababa",
      spotsLeft: 3,
      progress: 75
    },
    {
      id: 2,
      name: "Monthly Business Equb",
      members: 20,
      amount: 5000,
      cycle: "Monthly",
      location: "Bahir Dar",
      spotsLeft: 5,
      progress: 45
    },
    {
      id: 3,
      name: "Quarter Investment Group",
      members: 15,
      amount: 10000,
      cycle: "Quarterly",
      location: "Hawassa",
      spotsLeft: 2,
      progress: 90
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-indigo-600 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
              Modern Equb Management Platform
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-indigo-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Join trusted rotating savings groups, manage your contributions, and achieve your financial goals together.
            </p>
            <div className="mt-10 flex justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-md bg-white px-6 py-3 text-base font-medium text-indigo-600 shadow-sm hover:bg-indigo-50"
              >
                Get Started
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-md bg-indigo-500 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-400"
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Curved bottom */}
        <div className="relative h-16">
          <div className="absolute bottom-0 inset-x-0">
            <svg
              viewBox="0 0 1440 100"
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
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10"
        >
          <div className="flex items-center bg-white rounded-xl shadow-lg border border-gray-100 p-2">
            <div className="flex-1 min-w-0 px-4">
              <input
                type="text"
                placeholder="Search for Equb groups..."
                className="w-full text-gray-700 text-lg focus:outline-none"
              />
            </div>
            <div className="flex items-center space-x-2 px-4">
              <select className="text-gray-700 border-r border-gray-200 pr-4 focus:outline-none">
                <option>All Locations</option>
                <option>Addis Ababa</option>
                <option>Bahir Dar</option>
                <option>Hawassa</option>
              </select>
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                Search
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900">Why Choose Our Platform?</h2>
          <p className="mt-4 text-xl text-gray-600">Experience the benefits of traditional Equb with modern convenience</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Shield, title: "Secure & Trusted", description: "Identity verification and secure payment tracking" },
            { icon: Users, title: "Community Driven", description: "Join groups with like-minded savers" },
            { icon: Calendar, title: "Flexible Cycles", description: "Weekly, monthly, or custom saving periods" },
            { icon: DollarSign, title: "Transparent", description: "Clear tracking of all contributions and payouts" }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.4 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Active Equbs Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Popular Equb Groups</h2>
              <p className="mt-2 text-gray-600">Join active groups or create your own</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-indigo-600 hover:text-indigo-500 flex items-center"
            >
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeEqubs.map((equb, index) => (
              <motion.div
                key={equb.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{equb.name}</h3>
                      <p className="text-gray-600">{equb.location}</p>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {equb.spotsLeft} spots left
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Members:</span>
                      <span className="font-medium">{equb.members}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">{equb.amount} ETB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cycle:</span>
                      <span className="font-medium">{equb.cycle}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{equb.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${equb.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-6 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Join Group
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Users, value: "10,000+", label: "Active Members" },
              { icon: Award, value: "1,000+", label: "Successful Equbs" },
              { icon: TrendingUp, value: "5M+ ETB", label: "Total Savings" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="text-white"
              >
                <div className="bg-indigo-500 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-indigo-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">About</h3>
              <p className="text-gray-600 text-sm">
                Modern platform for managing traditional Ethiopian Equb systems digitally.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-indigo-600">How it Works</a></li>
                <li><a href="#" className="hover:text-indigo-600">Find Groups</a></li>
                <li><a href="#" className="hover:text-indigo-600">Create Equb</a></li>
                <li><a href="#" className="hover:text-indigo-600">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-indigo-600">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-600">Terms of Service</a></li>
                <li><a href="#" className="hover:text-indigo-600">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>support@equb.com</li>
                <li>+251 911 123 456</li>
                <li>Addis Ababa, Ethiopia</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} Equb Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
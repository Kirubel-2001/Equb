import React, { useState, useEffect } from "react";
import {
  Bell,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  HelpCircle,
  Plus,
} from "lucide-react";
/* eslint-disable-next-line no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export const Header = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications] = useState([
    {
      id: 1,
      message: "New Equb group created in your area",
      time: "2 mins ago",
    },
    { id: 2, message: "Your payment is due tomorrow", time: "1 hour ago" },
    {
      id: 3,
      message: "Congratulations! You won this week's Equb",
      time: "2 hours ago",
    },
  ]);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/">
          <div className="flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center"
            >
              <span
                className={`text-2xl font-bold ${
                  isScrolled ? "text-indigo-600" : "text-white"
                }`}
              >
                EQUB
              </span>
            </motion.div>
          </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <motion.a
                key={link.name}
                href={link.href}
                whileHover={{ y: -2 }}
                className={`text-sm font-medium transition-colors ${
                  isScrolled
                    ? "text-gray-700 hover:text-indigo-600"
                    : "text-white hover:text-indigo-100"
                }`}
              >
                {link.name}
              </motion.a>
            ))}
          </div>

          {/* Right section */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <>
                {/* Notifications - Only show when logged in */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 rounded-full ${
                      isScrolled ? "hover:bg-gray-100" : "hover:bg-white/10"
                    }`}
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  >
                    <Bell
                      className={isScrolled ? "text-gray-700" : "text-white"}
                      size={20}
                    />
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      3
                    </span>
                  </motion.button>

                  {/* Notifications Dropdown */}
                  <AnimatePresence>
                    {isNotificationOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50"
                      >
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                          >
                            <p className="text-sm text-gray-700">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Create Button - Only show when logged in */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    isScrolled
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-white text-indigo-600 hover:bg-indigo-50"
                  }`}
                >
                  <Plus size={20} className="mr-2" />
                  Create Equb
                </motion.button>

                {/* User Menu - When logged in */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                  </motion.button>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
                      >
                        <a
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <User className="w-4 h-4 mr-3" />
                          Profile
                        </a>
                        <a
                          href="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Settings
                        </a>
                        <a
                          href="/help"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <HelpCircle className="w-4 h-4 mr-3" />
                          Help Center
                        </a>
                        <hr className="my-2" />
                        <a
                          href="/logout"
                          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign out
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              /* Sign in / Sign up buttons - When not logged in */
              <div className="flex items-center space-x-3">
                <Link to="/signin">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      isScrolled
                        ? "text-indigo-600 hover:bg-indigo-50"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    Sign in
                  </motion.button>
                </Link>
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-lg ${
                      isScrolled
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-white text-indigo-600 hover:bg-indigo-50"
                    }`}
                  >
                    Sign up
                  </motion.button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={isScrolled ? "text-gray-700" : "text-white"}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                >
                  {link.name}
                </a>
              ))}
              <hr className="my-2" />

              {currentUser ? (
                <>
                  <a
                    href="/create"
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus size={20} className="mr-2" />
                    Create Equb
                  </a>
                  <a
                    href="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  >
                    Profile
                  </a>
                  <a
                    href="/logout"
                    className="block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-50"
                  >
                    Sign out
                  </a>
                </>
              ) : (
                <>
                  <Link to="/signin">
                    <a
                      className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:bg-gray-50"
                    >
                      Sign in
                    </a>
                  </Link>
                  <Link to="/signup">
                    <a
                      className="block px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Sign up
                    </a>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </nav>
  );
};
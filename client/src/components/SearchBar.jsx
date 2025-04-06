import React from "react";
/* eslint-disable-next-line no-unused-vars */
import { motion } from "framer-motion";
import PopularEqubs from "./PopularEqubs";

export default function SearchBar({
  searchTerm,
  setSearchTerm,
  activeCategory,
  setActiveCategory,
}) {
  const [isTyping, setIsTyping] = React.useState(false);

  return (
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsTyping(e.target.value.length > 0);
              }}
              value={searchTerm}
            />
          </div>
          <div className="flex items-center space-x-2 px-4">
            <select
              className="text-gray-700 border-r border-gray-200 pr-4 focus:outline-none"
              onChange={(e) => setActiveCategory(e.target.value)}
              value={activeCategory}
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
            </select>
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
              Search
            </button>
          </div>
        </div>
      </motion.div>

      {/* Popular Equbs Section - show only when not typing */}
      {!isTyping && <PopularEqubs />}
    </div>
  );
}

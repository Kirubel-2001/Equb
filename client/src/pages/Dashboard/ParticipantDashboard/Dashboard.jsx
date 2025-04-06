import React, { useState } from "react";
/* eslint-disable-next-line no-unused-vars */
import { motion } from "framer-motion";
import { Search, Filter, PlusCircle } from "lucide-react";
import { CreateEqub } from "../../../components/ParticipantComponent/CreateEqub";
import PopularEqubs from "../../../components/PopularEqubs";
import { AllEqubs } from "../../../components/ParticipantComponent/AllEqubs"; // Import the self-contained component

export const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [isTyping, setIsTyping] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [amountFilter, setAmountFilter] = useState({ min: "", max: "" });

  return (
    <div className="transition-all duration-300 flex-1">
      {/* Main Content */}
      <main className="px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-2">Welcome back, Abebe!</h2>
          <p className="text-gray-600">
            Find and join your next Equb, or create a new one.
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, location or amount..."
                className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsTyping(e.target.value.length > 0);
                }}
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                <Filter className="h-5 w-5 text-gray-500" />
                <span>Filter</span>
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 p-4 border border-gray-100">
                  <h4 className="font-medium mb-3">Status</h4>
                  <div className="space-y-2 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="all"
                        checked={activeCategory === "all"}
                        onChange={() => setActiveCategory("all")}
                      />
                      <span>All</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="Active"
                        checked={activeCategory === "Active"}
                        onChange={() => setActiveCategory("Active")}
                      />
                      <span>Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="Pending"
                        checked={activeCategory === "Pending"}
                        onChange={() => setActiveCategory("Pending")}
                      />
                      <span>Pending</span>
                    </label>
                  </div>

                  <h4 className="font-medium mb-3">Amount Per Person (ETB)</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm text-gray-600">Min</label>
                      <input
                        type="number"
                        className="w-full p-2 border border-gray-200 rounded-lg"
                        value={amountFilter.min}
                        onChange={(e) =>
                          setAmountFilter({
                            ...amountFilter,
                            min: e.target.value,
                          })
                        }
                        placeholder="Min"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Max</label>
                      <input
                        type="number"
                        className="w-full p-2 border border-gray-200 rounded-lg"
                        value={amountFilter.max}
                        onChange={(e) =>
                          setAmountFilter({
                            ...amountFilter,
                            max: e.target.value,
                          })
                        }
                        placeholder="Max"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      className="text-sm text-blue-600 hover:text-blue-800"
                      onClick={() => {
                        setAmountFilter({ min: "", max: "" });
                        setActiveCategory("all");
                      }}
                    >
                      Reset filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm font-medium"
              onClick={() => setShowPopup(true)}
            >
              <PlusCircle className="h-5 w-5" />
              <span>Create Equb</span>
            </button>
          </div>
        </motion.div>

        {/*Create Equb Popup */}
        <CreateEqub isOpen={showPopup} onClose={() => setShowPopup(false)} />

        {/* Popular Equbs Section */}
        {!isTyping && <PopularEqubs />}

        {/* All Equbs Section */}
        <AllEqubs
          searchTerm={searchTerm}
          activeCategory={activeCategory}
          amountFilter={amountFilter}
          setShowPopup={setShowPopup}
        />
      </main>
    </div>
  );
};

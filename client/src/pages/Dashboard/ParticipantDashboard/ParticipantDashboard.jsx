// ParticipantDashboard.jsx
import React, { useState } from "react";
/* eslint-disable-next-line no-unused-vars */
import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react";
import { SideBar } from "../../../components/ParticipantComponent/SideBar";
import { DashboardHeader } from "../../../components/DashboardHeader";
import Footer from "../../../components/Footer";
import { MyEqubs } from "./MyEqubs";
import { CreateEqub } from "../../../components/ParticipantComponent/CreateEqub";
import PopularEqubs from "../../../components/PopularEqubs";
import { AllEqubs } from "../../../components/ParticipantComponent/AllEqubs";
import { SearchAndFilter } from "../../../components/ParticipantComponent/SearchAndFilter";
import { Notifications } from "./Notifications";

export const ParticipantDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Initialize activeItem from localStorage or default to "dashboard"
  const [activeItem, setActiveItem] = useState(() => {
    const savedItem = localStorage.getItem('activeNavItem');
    return savedItem || "dashboard";
  });

  // Derived states from activeItem
  const isDashboardOpen = activeItem === "dashboard";
  const isMyEqubsOpen = activeItem === "myEqubs";
  const isNotificationsOpen = activeItem === "notifications";

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [isTyping, setIsTyping] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [amountFilter, setAmountFilter] = useState({ min: "", max: "" });
  const [locationFilter, setLocationFilter] = useState("");

  // Function to handle navigation
  const handleNavigation = (view) => {
    setActiveItem(view);
    localStorage.setItem('activeNavItem', view);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800 flex">
      {/* Sidebar */}
      <SideBar 
        onToggle={setIsSidebarOpen} 
        onNavigate={handleNavigation}
        activeItem={activeItem}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "ml-60" : "ml-20"
        } flex-1`}
      >
        {/* Header */}
        <DashboardHeader />

        <main className="px-6 py-8">
          {isDashboardOpen && (
            <>
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

              {/* Search and Filter Section with Create Equb Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-grow">
                    <SearchAndFilter
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      activeCategory={activeCategory}
                      setActiveCategory={setActiveCategory}
                      amountFilter={amountFilter}
                      setAmountFilter={setAmountFilter}
                      locationFilter={locationFilter}
                      setLocationFilter={setLocationFilter}
                      setIsTyping={setIsTyping}
                    />
                  </div>

                  {/* Create Equb Button */}
                  <div className="flex md:justify-end mb-8">
                    <button
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm font-medium"
                      onClick={() => setShowPopup(true)}
                    >
                      <PlusCircle className="h-5 w-5" />
                      <span>Create Equb</span>
                    </button>
                  </div>
                </div>

                {/*Create Equb Popup */}
                <CreateEqub isOpen={showPopup} onClose={() => setShowPopup(false)} />

                {/* Popular Equbs Section */}
                {!isTyping && (
                  <PopularEqubs
                    searchTerm={searchTerm}
                    activeCategory={activeCategory}
                    amountFilter={amountFilter}
                    locationFilter={locationFilter}
                  />
                )}

                {/* All Equbs Section */}
                <AllEqubs
                  searchTerm={searchTerm}
                  activeCategory={activeCategory}
                  amountFilter={amountFilter}
                  locationFilter={locationFilter}
                  setShowPopup={setShowPopup}
                />
              </motion.div>
            </>
          )}

          {/* My Equbs section */}
          {isMyEqubsOpen && <MyEqubs />}
          
          {/* Notifications section */}
          {isNotificationsOpen && <Notifications />}
          
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};
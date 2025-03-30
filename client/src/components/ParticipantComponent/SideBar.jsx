import React, { useState } from "react";
/* eslint-disable-next-line no-unused-vars */
import { motion } from "framer-motion";
import {
  Bell,
  Menu,
  User,
  Home,
  Grid,
  PlusSquare,
  HelpCircle,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

export const SideBar = ({ onDashboardToggle, onMyEqubsToggle, onToggle }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  /* eslint-disable-next-line no-unused-vars */
  const [notificationsCount, setNotificationsCount] = useState(3);
  const [activeItem, setActiveItem] = useState("dashboard"); // Track active sidebar item

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    onToggle(!isSidebarOpen);
  };

  const handleItemClick = (item) => {
    setActiveItem(item);
    if (item === "dashboard") {
      onDashboardToggle(true);
      onMyEqubsToggle(false);
    } else if (item === "myEqubs") {
      onDashboardToggle(false);
      onMyEqubsToggle(true);
    }
    // Add other sections as needed
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800 flex">
      {/* Sidebar */}
      <motion.div
        initial={{ width: isSidebarOpen ? 240 : 72 }}
        animate={{ width: isSidebarOpen ? 240 : 72 }}
        transition={{ duration: 0.3 }}
        className="bg-white shadow-md z-20 fixed h-full"
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            {isSidebarOpen ? (
              <>
                <Link to="/">
                  <h2 className="text-xl font-bold text-blue-600">Equb</h2>
                </Link>
                <button
                  onClick={toggleSidebar}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </>
            ) : (
              <button
                onClick={toggleSidebar}
                className="text-gray-500 hover:text-gray-700 mx-auto"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
          </div>

          <div
            className={`flex items-center gap-3 p-4 border-b pb-4 ${
              !isSidebarOpen && "justify-center"
            }`}
          >
            <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5" />
            </div>
            {isSidebarOpen && (
              <div>
                <h3 className="font-medium">Abebe Bekele</h3>
                <p className="text-sm text-gray-500">Member since Jan 2025</p>
              </div>
            )}
          </div>

          <div className="flex-1 py-4">
            <ul className="space-y-1">
              <li onClick={() => handleItemClick("dashboard")}>
                <a
                  href="#"
                  className={`flex items-center ${
                    isSidebarOpen ? "px-4" : "justify-center px-2"
                  } py-3 rounded-lg mx-2 ${
                    activeItem === "dashboard" 
                      ? "text-blue-700 bg-blue-50 font-medium" 
                      : "text-gray-600 hover:bg-gray-100"
                  } transition`}
                >
                  <Home className="h-5 w-5 flex-shrink-0" />
                  {isSidebarOpen && <span className="ml-3">Dashboard</span>}
                </a>
              </li>
              <li onClick={() => handleItemClick("myEqubs")}>
                <a
                  href="#"
                  className={`flex items-center ${
                    isSidebarOpen ? "px-4" : "justify-center px-2"
                  } py-3 rounded-lg mx-2 ${
                    activeItem === "myEqubs" 
                      ? "text-blue-700 bg-blue-50 font-medium" 
                      : "text-gray-600 hover:bg-gray-100"
                  } transition`}
                >
                  <Grid className="h-5 w-5 flex-shrink-0" />
                  {isSidebarOpen && <span className="ml-3">My Equbs</span>}
                </a>
              </li>
              <li onClick={() => handleItemClick("notifications")}>
                <a
                  href="#"
                  className={`flex items-center ${
                    isSidebarOpen ? "px-4" : "justify-center px-2"
                  } py-3 rounded-lg mx-2 ${
                    activeItem === "notifications" 
                      ? "text-blue-700 bg-blue-50 font-medium" 
                      : "text-gray-600 hover:bg-gray-100"
                  } transition relative`}
                >
                  <Bell className="h-5 w-5 flex-shrink-0" />
                  {notificationsCount > 0 && (
                    <span className="absolute top-2 left-5 transform translate-x-1 -translate-y-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {notificationsCount}
                    </span>
                  )}
                  {isSidebarOpen && <span className="ml-3">Notifications</span>}
                </a>
              </li>
              <li onClick={() => handleItemClick("help")}>
                <a
                  href="#"
                  className={`flex items-center ${
                    isSidebarOpen ? "px-4" : "justify-center px-2"
                  } py-3 rounded-lg mx-2 ${
                    activeItem === "help" 
                      ? "text-blue-700 bg-blue-50 font-medium" 
                      : "text-gray-600 hover:bg-gray-100"
                  } transition`}
                >
                  <HelpCircle className="h-5 w-5 flex-shrink-0" />
                  {isSidebarOpen && <span className="ml-3">Help</span>}
                </a>
              </li>
              <li onClick={() => handleItemClick("settings")}>
                <a
                  href="#"
                  className={`flex items-center ${
                    isSidebarOpen ? "px-4" : "justify-center px-2"
                  } py-3 rounded-lg mx-2 ${
                    activeItem === "settings" 
                      ? "text-blue-700 bg-blue-50 font-medium" 
                      : "text-gray-600 hover:bg-gray-100"
                  } transition`}
                >
                  <Settings className="h-5 w-5 flex-shrink-0" />
                  {isSidebarOpen && <span className="ml-3">Settings</span>}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
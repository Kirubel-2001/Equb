import React, { useState, useEffect } from "react";
/* eslint-disable-next-line no-unused-vars */
import { motion } from "framer-motion";
import {
  Bell,
  Menu,
  User,
  Home,
  Grid,
  HelpCircle,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

export const SideBar = ({ onToggle, onNavigate, activeItem }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notification count
  const fetchNotificationCount = async () => {
    setLoading(true);
    try {
      // Fetch user's equbs first (needed for winner notifications)
      const equbsResponse = await fetch("/api/participant/joined-equbs", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (!equbsResponse.ok) {
        throw new Error("Failed to fetch user equbs");
      }
      
      const equbData = await equbsResponse.json();
      
      // Fetch equbs created by the user (needed for complaint notifications)
      const createdEqubsResponse = await fetch("/api/equb/my-equbs", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (!createdEqubsResponse.ok) {
        throw new Error("Failed to fetch created equbs");
      }
      
      const createdEqubData = await createdEqubsResponse.json();
      
      // Fetch all announcements from the server with read status
      const announcementResponse = await fetch("/api/announcement", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (!announcementResponse.ok) {
        throw new Error("Failed to fetch announcement notifications");
      }
      
      const announcementData = await announcementResponse.json();
      
      // Count unread announcements
      const unreadAnnouncementCount = announcementData.filter(notification => !notification.isRead).length;
      
      // Fetch winners for each equb the user participates in
      const winnersPromises = equbData.map((equb) =>
        fetch(`/api/winner/equb/${equb._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }).then((res) => (res.ok ? res.json() : []))
      );
      
      const winnersResults = await Promise.all(winnersPromises);
      const winnersData = winnersResults.flat();
      
      // Count unread winner notifications
      const unreadWinnerCount = winnersData.filter(winner => !winner.isRead).length;
      
      // Fetch complaints for each equb the user created
      const complaintsPromises = createdEqubData.map((equb) =>
        fetch(`/api/complaint/equb/${equb._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }).then((res) => (res.ok ? res.json() : []))
      );
      
      const complaintsResults = await Promise.all(complaintsPromises);
      const complaintsData = complaintsResults.flat();
      
      // Get user ID from localStorage
      const userId = localStorage.getItem("userId");
      
      // Count unread complaint notifications
      // Count unread complaint notifications - ONLY RESOLVED ONES
const unreadComplaintCount = complaintsData
  .filter(complaint => complaint.status === "Resolved") // Only count resolved complaints
  .filter(complaint => 
    !complaint.readBy || !complaint.readBy.some(reader => 
      reader.user === userId || 
      reader.user._id === userId ||
      reader.user.toString() === userId
    )
  ).length;
      
      // Calculate total unread notifications
      const totalUnreadCount = unreadAnnouncementCount + unreadWinnerCount + unreadComplaintCount;
      
      setNotificationsCount(totalUnreadCount);
    } catch (error) {
      console.error("Failed to fetch notification count:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch count when component mounts
    fetchNotificationCount();
    
    // Set up an interval to refresh the count periodically
    const interval = setInterval(fetchNotificationCount, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    onToggle(!isSidebarOpen);
  };

  const handleItemClick = (item) => {
    // If navigating to notifications, we could reset the count
    // but it's better to wait for the actual read status from the server
    onNavigate(item);
  };

  return (
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
            <li>
              <a
                href="#"
                onClick={() => handleItemClick("dashboard")}
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
            <li>
              <a
                href="#"
                onClick={() => handleItemClick("myEqubs")}
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
            <li>
              <a
                href="#"
                onClick={() => handleItemClick("notifications")}
                className={`flex items-center ${
                  isSidebarOpen ? "px-4" : "justify-center px-2"
                } py-3 rounded-lg mx-2 ${
                  activeItem === "notifications" 
                    ? "text-blue-700 bg-blue-50 font-medium" 
                    : "text-gray-600 hover:bg-gray-100"
                } transition relative`}
              >
                <Bell className="h-5 w-5 flex-shrink-0" />
                {!loading && notificationsCount > 0 && (
                  <span className="absolute top-2 left-5 transform translate-x-1 -translate-y-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {notificationsCount}
                  </span>
                )}
                {isSidebarOpen && <span className="ml-3">Notifications</span>}
                
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={() => handleItemClick("help")}
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
          </ul>
        </div>
      </div>
    </motion.div>
  );
};
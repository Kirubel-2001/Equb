import React, { useState, useEffect } from "react";
/* eslint-disable-next-line no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle, AlertCircle, Clock, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/announcement", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      
      const data = await response.json();
      
      // Transform the announcements into notification format
      const notificationsData = data.map(announcement => ({
        id: announcement._id,
        equbName: announcement.equb?.name || "Unknown Equb",
        message: announcement.message,
        type: "announcement", // Default type
        dateCreated: new Date(announcement.dateCreated),
        isRead: announcement.isRead, // Use the isRead status from the server
        announcementId: announcement._id, // Keep reference to original ID
        equbId: announcement.equb?._id, // Store equb ID for marking all as read
      }));
      
      setNotifications(notificationsData);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      // Find the notification and get its original announcement ID
      const notification = notifications.find(n => n.id === id);
      
      if (notification && notification.announcementId && !notification.isRead) {
        // Update UI immediately for better UX
        setNotifications(notifications.map(notification => 
          notification.id === id ? { ...notification, isRead: true } : notification
        ));
        
        // Call the API to mark the announcement as read
        const response = await fetch(`/api/announcement/${notification.announcementId}/read`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        if (!response.ok) {
          throw new Error("Failed to mark notification as read");
        }
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      // If the API call fails, refresh to get the accurate state
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      // Group notifications by equbId
      const equbGroups = notifications.reduce((groups, notification) => {
        if (notification.equbId && !notification.isRead) {
          if (!groups[notification.equbId]) {
            groups[notification.equbId] = [];
          }
          groups[notification.equbId].push(notification);
        }
        return groups;
      }, {});
      
      // Update UI immediately
      setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
      
      // Make API calls for each equb
      const promises = Object.keys(equbGroups).map(equbId => 
        fetch(`/api/announcement/equb/${equbId}/read-all`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
      );
      
      const results = await Promise.all(promises);
      
      // Check if any request failed
      const hasError = results.some(response => !response.ok);
      if (hasError) {
        throw new Error("Failed to mark all notifications as read");
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      // If any API call fails, refresh to get the accurate state
      fetchNotifications();
    }
  };
  
  const handleViewDetails = (notification) => {
    // Mark as read when viewing details
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Navigate to the appropriate page based on notification type
    if (notification.type === "announcement" && notification.announcementId) {
      // Navigate to announcement detail page
      // For example: history.push(`/equbs/${notification.equbId}/announcements/${notification.announcementId}`);
      console.log("Viewing details for announcement:", notification.announcementId);
    } else if (notification.type === "winner") {
      // Navigate to winner details
      console.log("Viewing details for winner notification");
    } else if (notification.type === "payment") {
      // Navigate to payment details
      console.log("Viewing details for payment notification");
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return !notification.isRead;
    return notification.type === activeFilter;
  });

  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  const getNotificationIcon = (type) => {
    switch(type) {
      case "winner":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "payment":
        return <Clock className="h-6 w-6 text-orange-500" />;
      case "announcement":
        return <AlertCircle className="h-6 w-6 text-blue-500" />;
      default:
        return <Bell className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-white rounded-2xl shadow-md p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Bell className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {["all", "unread", "winner", "payment", "announcement"].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              activeFilter === filter
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
            {filter === "unread" && unreadCount > 0 && ` (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredNotifications.length > 0 ? (
        <AnimatePresence>
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className={`p-4 rounded-xl flex items-start gap-4 transform transition-all duration-200 ${
                  notification.isRead ? "bg-gray-50" : "bg-blue-50"
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <h3 className={`font-medium ${notification.isRead ? "text-gray-800" : "text-blue-800"}`}>
                      {notification.equbName}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(notification.dateCreated, { addSuffix: true })}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${notification.isRead ? "text-gray-600" : "text-gray-800"}`}>
                    {notification.message}
                  </p>
                  
                  <div className="mt-2 flex justify-end">
                    <button 
                      className="flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent also triggering markAsRead
                        handleViewDetails(notification);
                      }}
                    >
                      View details <ArrowRight className="h-3 w-3 ml-1" />
                    </button>
                  </div>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Bell className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No notifications found</h3>
          <p className="text-sm text-gray-500 mt-1">
            {activeFilter !== "all" 
              ? `You don't have any ${activeFilter} notifications at the moment.` 
              : "You don't have any notifications at the moment."}
          </p>
        </div>
      )}
    </motion.div>
  );
};
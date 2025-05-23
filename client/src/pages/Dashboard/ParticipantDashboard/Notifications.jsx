import React, { useState, useEffect } from "react";
/* eslint-disable-next-line no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Trophy,
  MessageCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [userEqubs, setUserEqubs] = useState([]);
  const [createdEqubs, setCreatedEqubs] = useState([]);

  useEffect(() => {
    fetchUserEqubs();
    fetchCreatedEqubs();
  }, []);

  useEffect(() => {
    if (userEqubs.length > 0 || createdEqubs.length > 0) {
      fetchNotifications();
    }
  }, [userEqubs, createdEqubs]);

  // First fetch the equbs the user participates in
  const fetchUserEqubs = async () => {
    try {
      const response = await fetch("/api/participant/joined-equbs", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user equbs");
      }

      const equbData = await response.json();
      setUserEqubs(equbData);
    } catch (error) {
      console.error("Failed to fetch user equbs:", error);
      setLoading(false);
    }
  };

  // Fetch equbs created by the user (for complaint notifications)
  const fetchCreatedEqubs = async () => {
    try {
      const response = await fetch("/api/equb/my-equbs", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch created equbs");
      }

      const equbData = await response.json();
      setCreatedEqubs(equbData);
    } catch (error) {
      console.error("Failed to fetch created equbs:", error);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Fetch announcements
      const announcementResponse = await fetch("/api/announcement", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!announcementResponse.ok) {
        throw new Error("Failed to fetch announcement notifications");
      }

      const announcementData = await announcementResponse.json();
      
      // Fetch winners for each equb the user participates in
      const winnersPromises = userEqubs.map((equb) =>
        fetch(`/api/winner/equb/${equb._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }).then((res) => (res.ok ? res.json() : []))
      );

      const winnersResults = await Promise.all(winnersPromises);
      const winnersData = winnersResults.flat();

      // Fetch complaints for each equb the user created
      const complaintsPromises = createdEqubs.map((equb) =>
        fetch(`/api/complaint/equb/${equb._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }).then((res) => (res.ok ? res.json() : []))
      );

      const complaintsResults = await Promise.all(complaintsPromises);
      const complaintsData = complaintsResults.flat();

      // Transform the announcements into notification format
      const announcementNotifications = announcementData.map(
        (announcement) => ({
          id: announcement._id,
          equbName: announcement.equb?.name || "Unknown Equb",
          message: announcement.message,
          type: "announcement",
          dateCreated: new Date(announcement.dateCreated),
          isRead: announcement.isRead,
          announcementId: announcement._id,
          equbId: announcement.equb?._id,
        })
      );
      
      // Transform winners into notification format
      const winnerNotifications = winnersData.map((winner) => ({
        id: `winner-${winner._id}`,
        equbName: winner.equb?.name || "Unknown Equb",
        message: `${winner.user.firstName} ${
          winner.user.lastName
        } has won cycle ${
          winner.cycleNumber
        } of ${winner.amountWon.toLocaleString()} birr!`,
        type: "winner",
        dateCreated: new Date(winner.dateWon),
        isRead: winner.isRead || false,
        winnerId: winner._id,
        equbId: winner.equb?._id,
        cycleNumber: winner.cycleNumber,
        amountWon: winner.amountWon,
        winnerName: `${winner.user.firstName} ${winner.user.lastName}`,
      }));

      // Transform complaints into notification format
      const complaintNotifications = complaintsData.map((complaint) => ({
        id: `complaint-${complaint._id}`,
        equbName: complaint.equb?.name || "Unknown Equb",
        message: `New complaint: ${complaint.message.substring(0, 60)}${
          complaint.message.length > 60 ? "..." : ""
        }`,
        type: "complaint",
        dateCreated: new Date(complaint.dateSubmitted),
        isRead: complaint.readBy?.some(
          (reader) => reader.user === localStorage.getItem("userId")
        ) || false,
        complaintId: complaint._id,
        equbId: complaint.equb,
        status: complaint.status,
        fromUser: complaint.user?.firstName ? 
          `${complaint.user.firstName} ${complaint.user.lastName}` : 
          "Unknown User",
      }));

      // Combine all notifications and sort by date
      const allNotifications = [
        ...announcementNotifications,
        ...winnerNotifications,
        ...complaintNotifications,
      ].sort((a, b) => b.dateCreated - a.dateCreated);

      setNotifications(allNotifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      // Find the notification
      const notification = notifications.find((n) => n.id === id);

      if (notification && !notification.isRead) {
        // Update UI immediately for better UX
        setNotifications(
          notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );

        // Call the appropriate API based on notification type
        if (
          notification.type === "announcement" &&
          notification.announcementId
        ) {
          // Mark announcement as read
          const response = await fetch(
            `/api/announcement/${notification.announcementId}/read`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to mark announcement as read");
          }
        } else if (notification.type === "winner" && notification.winnerId) {
          // Mark winner notification as read
          const response = await fetch(
            `/api/winner/${notification.winnerId}/read`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to mark winner notification as read");
          }
        } else if (notification.type === "complaint" && notification.complaintId) {
          // Mark complaint notification as read
          const response = await fetch(
            `/api/complaint/${notification.complaintId}/read`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to mark complaint as read");
          }
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
      // Group notifications by type and equbId
      const announcementsByEqub = {};
      const winnersByEqub = {};
      const complaintsByEqub = {};

      notifications.forEach((notification) => {
        if (!notification.isRead) {
          if (notification.type === "announcement" && notification.equbId) {
            if (!announcementsByEqub[notification.equbId]) {
              announcementsByEqub[notification.equbId] = [];
            }
            announcementsByEqub[notification.equbId].push(notification);
          } else if (notification.type === "winner" && notification.equbId) {
            if (!winnersByEqub[notification.equbId]) {
              winnersByEqub[notification.equbId] = [];
            }
            winnersByEqub[notification.equbId].push(notification);
          } else if (notification.type === "complaint" && notification.equbId) {
            if (!complaintsByEqub[notification.equbId]) {
              complaintsByEqub[notification.equbId] = [];
            }
            complaintsByEqub[notification.equbId].push(notification);
          }
        }
      });

      // Update UI immediately
      setNotifications(
        notifications.map((notification) => ({ ...notification, isRead: true }))
      );

      // Make API calls for announcements by equb
      const announcementPromises = Object.keys(announcementsByEqub).map(
        (equbId) =>
          fetch(`/api/announcement/equb/${equbId}/read-all`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
      );

      // Make API calls for winners by equb
      const winnerPromises = Object.keys(winnersByEqub).map(
        (equbId) =>
          fetch(`/api/winner/equb/${equbId}/read-all`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
      );

      // Make API calls for complaints by equb
      const complaintPromises = Object.keys(complaintsByEqub).map(
        (equbId) =>
          fetch(`/api/complaint/equb/${equbId}/read-all`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
      );

      // Combine all promises
      const results = await Promise.all([
        ...announcementPromises,
        ...winnerPromises,
        ...complaintPromises,
      ]);

      // Check if any request failed
      const hasError = results.some((response) => !response.ok);
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
    if (notification.type === "announcement" && notification.equbId) {
      // Navigate to announcement detail page
      window.location.href = `/equbs/${notification.equbId}/announcements`;
    } else if (notification.type === "winner" && notification.equbId) {
      // Navigate to winner details in the equb
      window.location.href = `/equbs/${notification.equbId}/winners`;
    } else if (notification.type === "complaint" && notification.equbId) {
      // Navigate to complaint details in the equb
      window.location.href = `/equbs/${notification.equbId}/complaints`;
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return !notification.isRead;
    return notification.type === activeFilter;
  });

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case "winner":
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case "payment":
        return <Clock className="h-6 w-6 text-orange-500" />;
      case "announcement":
        return <AlertCircle className="h-6 w-6 text-blue-500" />;
      case "complaint":
        return <MessageCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Bell className="h-6 w-6 text-gray-500" />;
    }
  };

  const getNotificationColor = (type, isRead) => {
    if (isRead) return "bg-gray-50";

    switch (type) {
      case "winner":
        return "bg-yellow-50";
      case "payment":
        return "bg-orange-50";
      case "announcement":
        return "bg-blue-50";
      case "complaint":
        return "bg-red-50";
      default:
        return "bg-gray-50";
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
        {["all", "unread", "winner", "announcement", "complaint"].map((filter) => (
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
                className={`p-4 rounded-xl flex items-start gap-4 transform transition-all duration-200 ${getNotificationColor(
                  notification.type,
                  notification.isRead
                )}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <h3
                      className={`font-medium ${
                        notification.isRead
                          ? "text-gray-800"
                          : notification.type === "winner"
                          ? "text-yellow-800"
                          : notification.type === "complaint"
                          ? "text-red-800"
                          : "text-blue-800"
                      }`}
                    >
                      {notification.equbName}
                      {notification.type === "winner" &&
                        notification.cycleNumber && (
                          <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">
                            Cycle {notification.cycleNumber}
                          </span>
                        )}
                      {notification.type === "complaint" && (
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                          notification.status === "Resolved" 
                            ? "bg-green-200 text-green-800" 
                            : "bg-red-200 text-red-800"
                        }`}>
                          {notification.status || "Pending"}
                        </span>
                      )}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(notification.dateCreated, {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p
                    className={`text-sm mt-1 ${
                      notification.isRead ? "text-gray-600" : "text-gray-800"
                    }`}
                  >
                    {notification.message}
                  </p>

                  {notification.type === "winner" && notification.amountWon && (
                    <p className="text-sm font-medium text-green-600 mt-1">
                      Amount: {notification.amountWon.toLocaleString()} birr
                    </p>
                  )}

                  {notification.type === "complaint" && notification.fromUser && (
                    <p className="text-sm font-medium text-gray-600 mt-1">
                      From: {notification.fromUser}
                    </p>
                  )}

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
          <h3 className="text-lg font-medium text-gray-600">
            No notifications found
          </h3>
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
import React, { useState, useEffect } from "react";
/* eslint-disable-next-line no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  Users,
  DollarSign,
  X,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  AlertTriangle,
  Star,
  MessageCircle,
  AlertCircle,
  Check,
  Megaphone,
  Calendar,
  MoreVertical,
  PlayCircle,
  Gift
} from "lucide-react";
import {CreateEqub} from "./CreateEqub";

export const MyEqubsList = ({
  equbs,
  showAdminControls = false,
  onEqubDeleted,
  onEqubUpdated,
  onRatingSubmitted,
  onComplaintSubmitted
}) => {
  const [joinStatus, setJoinStatus] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEqub, setSelectedEqub] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [equbToEdit, setEqubToEdit] = useState(null);
  // States for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [equbToDelete, setEqubToDelete] = useState(null);
  // States for announcement modal
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [equbToAnnounce, setEqubToAnnounce] = useState(null);
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const [announcementError, setAnnouncementError] = useState("");
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);
  // Announcements states
  const [equbAnnouncements, setEqubAnnouncements] = useState({});
  const [announcementsLoading, setAnnouncementsLoading] = useState({});
  const [announcementToEdit, setAnnouncementToEdit] = useState(null);
  const [showEditAnnouncementModal, setShowEditAnnouncementModal] = useState(false);
  const [showDeleteAnnouncementModal, setShowDeleteAnnouncementModal] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  // Rating and complaint states
  const [expandedRatingId, setExpandedRatingId] = useState(null);
  const [expandedComplaintId, setExpandedComplaintId] = useState(null);
  const [ratingMap, setRatingMap] = useState({});
  const [hoverRatingMap, setHoverRatingMap] = useState({});
  const [complaints, setComplaints] = useState({});
  const [ratingErrors, setRatingErrors] = useState({});
  const [complaintErrors, setComplaintErrors] = useState({});
  const [ratingSuccess, setRatingSuccess] = useState({});
  const [complaintSuccess, setComplaintSuccess] = useState({});
  // Participant count state
  const [participantCounts, setParticipantCounts] = useState({});
  // Winner selection state
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [equbToDrawWinner, setEqubToDrawWinner] = useState(null);
  const [winnerSelectionLoading, setWinnerSelectionLoading] = useState(false);
  const [winnerSelectionError, setWinnerSelectionError] = useState("");
  const [winnerSelectionSuccess, setWinnerSelectionSuccess] = useState(false);
  // Start cycle state
  const [startCycleLoading, setStartCycleLoading] = useState({});
  const [startCycleError, setStartCycleError] = useState({});
  const [startCycleSuccess, setStartCycleSuccess] = useState({});
  
  const equbsPerPage = 9;

  // Fetch join status and participant counts on component mount
  useEffect(() => {
    const fetchJoinStatus = async () => {
      try {
        // Fetch join status for each equb
        const statusObj = {};
        const countsObj = {};
        
        for (const equb of equbs) {
          try {
            // Fetch join status
            const statusResponse = await fetch(
              `/api/participant/status/${equb._id}`,
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              statusObj[equb._id] = {
                status: statusData.status,
                message: statusData.message,
              };
            }
            
            // Fetch participant counts
            const countResponse = await fetch(
              `/api/participant/count/${equb._id}`,
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            if (countResponse.ok) {
              const countData = await countResponse.json();
              countsObj[equb._id] = {
                currentParticipants: countData.currentParticipants,
                totalParticipants: countData.totalParticipants,
                remainingSpots: countData.remainingSpots,
                isFull: countData.isFull
              };
            }
          } catch (error) {
            console.error(`Error fetching data for equb ${equb._id}:`, error);
          }
        }
        
        setJoinStatus(statusObj);
        setParticipantCounts(countsObj);
      } catch (error) {
        console.error("Error fetching join status:", error);
      }
    };

    fetchJoinStatus();
  }, [equbs]);

  // Initialize rating map from equbs data
  useEffect(() => {
    const initialRatingMap = {};
    const initialComplaintsMap = {};
    
    equbs.forEach(equb => {
      initialRatingMap[equb._id] = equb.userRating || 0;
      initialComplaintsMap[equb._id] = "";
    });
    
    setRatingMap(initialRatingMap);
    setComplaints(initialComplaintsMap);
  }, [equbs]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [equbs]);

  // Automatically clear message after delay
  useEffect(() => {
    // For any equb with a status message, clear it after 3 seconds
    const timers = [];
    Object.keys(joinStatus).forEach(equbId => {
      if (joinStatus[equbId]?.message) {
        const timer = setTimeout(() => {
          setJoinStatus(prev => ({
            ...prev,
            [equbId]: {
              ...prev[equbId],
              message: ""
            }
          }));
        }, 3000);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [joinStatus]);

  // Clear success messages after delay
  useEffect(() => {
    const ratingTimers = [];
    Object.keys(ratingSuccess).forEach(equbId => {
      if (ratingSuccess[equbId]) {
        const timer = setTimeout(() => {
          setRatingSuccess(prev => ({
            ...prev,
            [equbId]: false
          }));
        }, 3000);
        ratingTimers.push(timer);
      }
    });

    const complaintTimers = [];
    Object.keys(complaintSuccess).forEach(equbId => {
      if (complaintSuccess[equbId]) {
        const timer = setTimeout(() => {
          setComplaintSuccess(prev => ({
            ...prev,
            [equbId]: false
          }));
        }, 3000);
        complaintTimers.push(timer);
      }
    });

    // Clear start cycle success messages
    const startCycleTimers = [];
    Object.keys(startCycleSuccess).forEach(equbId => {
      if (startCycleSuccess[equbId]) {
        const timer = setTimeout(() => {
          setStartCycleSuccess(prev => ({
            ...prev,
            [equbId]: false
          }));
        }, 3000);
        startCycleTimers.push(timer);
      }
    });

    // Clear start cycle error messages
    const startCycleErrorTimers = [];
    Object.keys(startCycleError).forEach(equbId => {
      if (startCycleError[equbId]) {
        const timer = setTimeout(() => {
          setStartCycleError(prev => ({
            ...prev,
            [equbId]: ""
          }));
        }, 3000);
        startCycleErrorTimers.push(timer);
      }
    });

    // Clear announcement success message after delay
    if (announcementSuccess) {
      const timer = setTimeout(() => {
        setAnnouncementSuccess(false);
      }, 3000);
      
      return () => {
        clearTimeout(timer);
        ratingTimers.forEach(timer => clearTimeout(timer));
        complaintTimers.forEach(timer => clearTimeout(timer));
        startCycleTimers.forEach(timer => clearTimeout(timer));
        startCycleErrorTimers.forEach(timer => clearTimeout(timer));
      };
    }

    // Clear winner selection success after delay
    if (winnerSelectionSuccess) {
      const timer = setTimeout(() => {
        setWinnerSelectionSuccess(false);
        setShowWinnerModal(false);
        setEqubToDrawWinner(null);
      }, 3000);
      
      return () => {
        clearTimeout(timer);
      };
    }

    return () => {
      ratingTimers.forEach(timer => clearTimeout(timer));
      complaintTimers.forEach(timer => clearTimeout(timer));
      startCycleTimers.forEach(timer => clearTimeout(timer));
      startCycleErrorTimers.forEach(timer => clearTimeout(timer));
    };
  }, [ratingSuccess, complaintSuccess, announcementSuccess, winnerSelectionSuccess, startCycleSuccess, startCycleError]);

  // Fetch announcements when an equb is selected for details
  useEffect(() => {
    if (selectedEqub && activeTab === "announcements") {
      fetchAnnouncementsForEqub(selectedEqub._id);
    }
  }, [selectedEqub, activeTab]);

  const fetchAnnouncementsForEqub = async (equbId) => {
    if (equbAnnouncements[equbId]) return; // Already fetched
    
    setAnnouncementsLoading(prev => ({ ...prev, [equbId]: true }));
    
    try {
      const response = await fetch(`/api/announcement/equb/${equbId}`, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setEqubAnnouncements(prev => ({
          ...prev,
          [equbId]: data
        }));
      } else {
        console.error(`Error fetching announcements for equb ${equbId}`);
      }
    } catch (error) {
      console.error(`Error fetching announcements:`, error);
    } finally {
      setAnnouncementsLoading(prev => ({ ...prev, [equbId]: false }));
    }
  };

  const handleCancelJoin = async (equbId) => {
    setLoadingMap((prev) => ({ ...prev, [equbId]: true }));
    try {
      const response = await fetch(`/api/participant/leave/${equbId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Update join status to show not joined
        setJoinStatus({
          ...joinStatus,
          [equbId]: {
            status: null,
            message: "Request canceled successfully",
          },
        });
        
        // Refresh participant count after leaving
        await refreshParticipantCount(equbId);
      } else {
        setJoinStatus({
          ...joinStatus,
          [equbId]: {
            status: "Error",
            message: data.message || "Failed to cancel. Please try again.",
          },
        });
      }
    } catch (error) {
      console.error("Error canceling Equb join:", error);
      setJoinStatus({
        ...joinStatus,
        [equbId]: {
          status: "Error",
          message: "Failed to cancel. Please try again.",
        },
      });
    } finally {
      setLoadingMap((prev) => ({ ...prev, [equbId]: false }));
    }
  };
  
  // Function to refresh participant count for a specific equb
  const refreshParticipantCount = async (equbId) => {
    try {
      const countResponse = await fetch(
        `/api/participant/count/${equbId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (countResponse.ok) {
        const countData = await countResponse.json();
        setParticipantCounts((prev) => ({
          ...prev,
          [equbId]: {
            currentParticipants: countData.currentParticipants,
            totalParticipants: countData.totalParticipants,
            remainingSpots: countData.remainingSpots,
            isFull: countData.isFull
          }
        }));
      }
    } catch (error) {
      console.error(`Error refreshing participant count for equb ${equbId}:`, error);
    }
  };

  // Show details
  const handleShowDetails = (equb) => {
    setSelectedEqub(equb);
    setActiveTab("details");
    setShowDetailsModal(true);
  };

  // Handle edit equb
  const handleEditEqub = (equb) => {
    setEqubToEdit(equb);
    setShowEditModal(true);
  };

  // Show delete confirmation modal
  const handleShowDeleteConfirmation = (equb) => {
    setEqubToDelete(equb);
    setShowDeleteModal(true);
  };

  // Handle delete equb
  const handleDeleteEqub = async () => {
    if (!equbToDelete) return;

    const equbId = equbToDelete._id;
    setLoadingMap((prev) => ({ ...prev, [equbId]: true }));

    try {
      const response = await fetch(`/api/equb/${equbId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (response.ok) {
        // Close the delete modal immediately
        setShowDeleteModal(false);
        setEqubToDelete(null);
        
        // Notify parent component about update
        if (onEqubDeleted) {
          onEqubDeleted(equbId);
        }
      } else {
        const errorData = await response.json();
        console.error("Error deleting Equb:", errorData);
        
        // Close modal but show error in the join status area of the affected equb
        setShowDeleteModal(false);
        setEqubToDelete(null);
        setJoinStatus({
          ...joinStatus,
          [equbId]: {
            status: "Error",
            message: errorData.message || "Failed to delete. Please try again.",
          },
        });
      }
    } catch (error) {
      console.error("Error deleting Equb:", error);
      // Close modal but show error in the join status area of the affected equb
      setShowDeleteModal(false);
      setEqubToDelete(null);
      setJoinStatus({
        ...joinStatus,
        [equbId]: {
          status: "Error",
          message: "Failed to delete. Please check your connection.",
        },
      });
    } finally {
      setLoadingMap((prev) => ({ ...prev, [equbId]: false }));
    }
  };

  // Show announcement modal
  const handleShowAnnouncementModal = (equb) => {
    setEqubToAnnounce(equb);
    setAnnouncementMessage("");
    setAnnouncementError("");
    setAnnouncementSuccess(false);
    setShowAnnouncementModal(true);
  };

  // Handle send announcement
  const handleSendAnnouncement = async () => {
    if (!equbToAnnounce || !announcementMessage.trim()) {
      setAnnouncementError("Please enter an announcement message");
      return;
    }

    setAnnouncementLoading(true);
    setAnnouncementError("");

    try {
      const response = await fetch(`/api/announcement/equb/${equbToAnnounce._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: announcementMessage }),
      });

      if (response.ok) {
        setAnnouncementSuccess(true);
        // Clear the form after successful submission
        setAnnouncementMessage("");
        
        // Clear cached announcements to force a refresh
        setEqubAnnouncements(prev => {
          const newState = { ...prev };
          delete newState[equbToAnnounce._id];
          return newState;
        });
        
        // Close the modal after a short delay
        setTimeout(() => {
          setShowAnnouncementModal(false);
          setEqubToAnnounce(null);
        }, 1500);
      } else {
        const errorData = await response.json();
        setAnnouncementError(errorData.message || "Failed to send announcement. Please try again.");
      }
    } catch (error) {
      console.error("Error sending announcement:", error);
      setAnnouncementError("Failed to send announcement. Please check your connection.");
    } finally {
      setAnnouncementLoading(false);
    }
  };

  // Handle edit announcement modal
  const handleShowEditAnnouncementModal = (announcement) => {
    setAnnouncementToEdit(announcement);
    setAnnouncementMessage(announcement.message);
    setAnnouncementError("");
    setAnnouncementSuccess(false);
    setShowEditAnnouncementModal(true);
  };

  // Handle update announcement
  const handleUpdateAnnouncement = async () => {
    if (!announcementToEdit || !announcementMessage.trim()) {
      setAnnouncementError("Please enter an announcement message");
      return;
    }

    setAnnouncementLoading(true);
    setAnnouncementError("");

    try {
      const response = await fetch(`/api/announcement/${announcementToEdit._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: announcementMessage }),
      });

      if (response.ok) {
        setAnnouncementSuccess(true);
        
        // Update the announcements list
        setEqubAnnouncements(prev => {
          const equbId = announcementToEdit.equb;
          const updatedAnnouncements = prev[equbId].map(ann => 
            ann._id === announcementToEdit._id ? { ...ann, message: announcementMessage } : ann
          );
          
          return {
            ...prev,
            [equbId]: updatedAnnouncements
          };
        });
        
        // Close the modal after a short delay
        setTimeout(() => {
          setShowEditAnnouncementModal(false);
          setAnnouncementToEdit(null);
          setAnnouncementMessage("");
        }, 1500);
      } else {
        const errorData = await response.json();
        setAnnouncementError(errorData.message || "Failed to update announcement. Please try again.");
      }
    } catch (error) {
      console.error("Error updating announcement:", error);
      setAnnouncementError("Failed to update announcement. Please check your connection.");
    } finally {
      setAnnouncementLoading(false);
    }
  };

  // Show delete announcement confirmation modal
  const handleShowDeleteAnnouncementConfirmation = (announcement) => {
    setAnnouncementToDelete(announcement);
    setShowDeleteAnnouncementModal(true);
  };

  // Handle delete announcement
  const handleDeleteAnnouncement = async () => {
    if (!announcementToDelete) return;

    setAnnouncementLoading(true);

    try {
      const response = await fetch(`/api/announcement/${announcementToDelete._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (response.ok) {
        // Update announcements list
        setEqubAnnouncements(prev => {
          const equbId = announcementToDelete.equb;
          return {
            ...prev,
            [equbId]: prev[equbId].filter(ann => ann._id !== announcementToDelete._id)
          };
        });
        
        // Close the modal
        setShowDeleteAnnouncementModal(false);
        setAnnouncementToDelete(null);
      } else {
        const errorData = await response.json();
        console.error("Error deleting announcement:", errorData);
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
    } finally {
      setAnnouncementLoading(false);
    }
  };

  // Handle start cycle button
  const handleStartCycle = async (equbId) => {
    setStartCycleLoading(prev => ({ ...prev, [equbId]: true }));
    setStartCycleError(prev => ({ ...prev, [equbId]: "" }));
    
    try {
      const response = await fetch(`/api/equb/${equbId}/start-cycle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setStartCycleSuccess(prev => ({ ...prev, [equbId]: true }));
        
        // Notify parent component about update
        if (onEqubUpdated) {
          onEqubUpdated();
        }
      } else {
        const errorData = await response.json();
        setStartCycleError(prev => ({ 
          ...prev, 
          [equbId]: errorData.message || "Failed to start cycle. Please try again." 
        }));
      }
    } catch (error) {
      console.error("Error starting cycle:", error);
      setStartCycleError(prev => ({ 
        ...prev, 
        [equbId]: "Failed to start cycle. Please check your connection." 
      }));
    } finally {
      setStartCycleLoading(prev => ({ ...prev, [equbId]: false }));
    }
  };

  // Show winner selection modal
  const handleShowWinnerModal = (equb) => {
    setEqubToDrawWinner(equb);
    setWinnerSelectionError("");
    setWinnerSelectionSuccess(false);
    setShowWinnerModal(true);
  };

  // Handle winner selection
  const handleSelectWinner = async () => {
    if (!equbToDrawWinner) return;

    setWinnerSelectionLoading(true);
    setWinnerSelectionError("");

    try {
      const response = await fetch(`/api/equb/${equbToDrawWinner._id}/select-winner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setWinnerSelectionSuccess(true);
        
        // Notify parent component about update
        if (onEqubUpdated) {
          onEqubUpdated();
        }
      } else {
        const errorData = await response.json();
        setWinnerSelectionError(errorData.message || "Failed to select winner. Please try again.");
      }
    } catch (error) {
      console.error("Error selecting winner:", error);
      setWinnerSelectionError("Failed to select winner. Please check your connection.");
    } finally {
      setWinnerSelectionLoading(false);
    }
  };

  // Handle edit modal close
  const handleEditModalClose = (success) => {
    setShowEditModal(false);
    setEqubToEdit(null);

    if (success && onEqubUpdated) {
      onEqubUpdated();
    }
  };

  // Handle rating hover
  const handleRatingHover = (equbId, rating) => {
    setHoverRatingMap(prev => ({
      ...prev,
      [equbId]: rating
    }));
  };

  // Handle rating click
  const handleRatingClick = async (equbId, selectedRating) => {
    setRatingMap(prev => ({
      ...prev,
      [equbId]: selectedRating
    }));
    
    try {
      setRatingErrors(prev => ({...prev, [equbId]: ""}));
      const response = await fetch(`/api/rating/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          rating: selectedRating, 
          equbId: equbId 
        }),
      });

      if (response.ok) {
        setRatingSuccess(prev => ({...prev, [equbId]: true}));
        
        // Notify parent component
        if (onRatingSubmitted) {
          onRatingSubmitted(equbId, selectedRating);
        }
      } else {
        const errorData = await response.json();
        setRatingErrors(prev => ({
          ...prev, 
          [equbId]: errorData.message || "Failed to submit rating"
        }));
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      setRatingErrors(prev => ({
        ...prev, 
        [equbId]: "Failed to submit rating. Please try again."
      }));
    }
  };

  // Handle complaint change
  const handleComplaintChange = (equbId, text) => {
    setComplaints(prev => ({
      ...prev,
      [equbId]: text
    }));
  };

  // Handle complaint submit
  const handleComplaintSubmit = async (equbId) => {
    if (!complaints[equbId]?.trim()) {
      setComplaintErrors(prev => ({
        ...prev,
        [equbId]: "Please enter a complaint description"
      }));
      return;
    }

    try {
      setComplaintErrors(prev => ({...prev, [equbId]: ""}));
      const response = await fetch(`/api/complaint/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: complaints[equbId], equbId: equbId }),
      });

      if (response.ok) {
        setComplaints(prev => ({...prev, [equbId]: ""}));
        setComplaintSuccess(prev => ({...prev, [equbId]: true}));
        setExpandedComplaintId(null);
        
        // Notify parent component
        if (onComplaintSubmitted) {
          onComplaintSubmitted(equbId);
        }
      } else {
        const errorData = await response.json();
        setComplaintErrors(prev => ({
          ...prev,
          [equbId]: errorData.message || "Failed to submit complaint"
        }));
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      setComplaintErrors(prev => ({
        ...prev,
        [equbId]: "Failed to submit complaint. Please try again."
      }));
    }
  };

  // Get current page equbs
  const indexOfLastEqub = currentPage * equbsPerPage;
  const indexOfFirstEqub = indexOfLastEqub - equbsPerPage;
  const currentEqubs = equbs.slice(indexOfFirstEqub, indexOfLastEqub);
  const totalPages = Math.ceil(equbs.length / equbsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // Toggle rating UI
  const toggleRatingUI = (equbId) => {
    if (expandedRatingId === equbId) {
      setExpandedRatingId(null);
    } else {
      setExpandedRatingId(equbId);
      setExpandedComplaintId(null); // Close complaint UI if open
    }
  };

  // Toggle complaint UI
  const toggleComplaintUI = (equbId) => {
    if (expandedComplaintId === equbId) {
      setExpandedComplaintId(null);
    } else {
      setExpandedComplaintId(equbId);
      setExpandedRatingId(null); // Close rating UI if open
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Helper function to get participant count display
  const getParticipantCountDisplay = (equbId) => {
    // Check if we have fetched participant count from API
    if (participantCounts[equbId]) {
      const { currentParticipants, totalParticipants } = participantCounts[equbId];
      return `${currentParticipants}/${totalParticipants} members`;
    }
    
    // Fallback to equb object data
    const equb = equbs.find(e => e._id === equbId);
    return equb ? `${equb.currentParticipants}/${equb.numberOfParticipants} members` : "Loading...";
  };

  // Function to render action buttons based on equb type and status
  const renderActionButtons = (equb) => {
    const equbId = equb._id;

    // For created equbs, show admin controls
    if (equb.type === "created" && showAdminControls) {
      return (
        <div className="flex flex-wrap gap-2">
          {/* Start Cycle or Choose Winner button based on equb type */}
          {equb.equbType === "Automatic" && (
            <button
              className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition flex items-center text-sm"
              onClick={() => handleStartCycle(equbId)}
              disabled={startCycleLoading[equbId]}
            >
              {startCycleLoading[equbId] ? (
                <span className="animate-pulse">Starting...</span>
              ) : (
                <>
                  <PlayCircle className="h-3.5 w-3.5 mr-1" />
                  Start Cycle
                </>
              )}
            </button>
          )}
          
          {equb.equbType === "Special" && (
            <button
              className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition flex items-center text-sm"
              onClick={() => handleShowWinnerModal(equb)}
              disabled={winnerSelectionLoading}
            >
              <Gift className="h-3.5 w-3.5 mr-1" />
              Choose Winner
            </button>
          )}
          
          <button
            className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition flex items-center text-sm"
            onClick={() => handleShowAnnouncementModal(equb)}
          >
            <Megaphone className="h-3.5 w-3.5 mr-1" />
            Announce
          </button>
          <button
            className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition flex items-center text-sm"
            onClick={() => handleEditEqub(equb)}
            disabled={loadingMap[equbId]}
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            Edit
          </button>
          <button
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center text-sm"
            onClick={() => handleShowDeleteConfirmation(equb)}
            disabled={loadingMap[equbId]}
          >
            {loadingMap[equbId] ? (
              <>
                <span className="animate-pulse">...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </>
            )}
          </button>
        </div>
      );
    }

    // For joined equbs, show rating, complaint, and leave buttons
    if (equb.type === "joined") {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition flex items-center text-sm"
            onClick={() => toggleRatingUI(equbId)}
          >
            <Star className="h-3.5 w-3.5 mr-1" />
            Rate
          </button>
          <button
            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition flex items-center text-sm"
            onClick={() => toggleComplaintUI(equbId)}
          >
            <MessageCircle className="h-3.5 w-3.5 mr-1" />
            Complaint
          </button>
          <button
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center text-sm"
            onClick={() => handleCancelJoin(equbId)}
            disabled={loadingMap[equbId]}
          >
            <X className="h-3.5 w-3.5 mr-1" />
            {loadingMap[equbId] ? "..." : "Leave"}
          </button>
        </div>
      );
    }

    return null;
  };

  // Function to render rating stars
  const renderRatingStars = (equb) => {
    if (!equb.averageRating && equb.averageRating !== 0) return null;
    
    return (
      <div className="flex items-center mt-1">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-3.5 w-3.5 ${
                star <= Math.round(equb.averageRating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="ml-1 text-xs text-gray-600">
          {equb.averageRating.toFixed(1)} ({equb.ratingCount})
        </span>
      </div>
    );
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {equbs.length > 0 ? (
        <div className="space-y-4">
          {currentEqubs.map((equb) => (
            <motion.div
              key={equb._id}
              whileHover={{ scale: 1.01 }}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition flex flex-col dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="mb-4 flex flex-col md:flex-row justify-between">
                <div>
                  <div className="flex items-center flex-wrap gap-2">
                    <h4 className="font-bold dark:text-white">{equb.name}</h4>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        equb.equbType === "Automatic"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      {equb.equbType === "Automatic"
                        ? "Automatic Lottery"
                        : "Manual Lottery"}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        equb.type === "created"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      }`}
                    >
                      {equb.type === "created" ? "Created" : "Joined"}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-500 text-sm mt-1 dark:text-gray-400">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{equb.location}</span>
                  </div>

                  {/* Rating stars - show for all equbs */}
                  {renderRatingStars(equb)}

                  <div className="flex flex-wrap gap-3 mt-3">
                    <div className="text-sm flex items-center text-gray-600 dark:text-gray-300">
                      <Users className="h-4 w-4 mr-1 text-blue-600 dark:text-blue-400" />
                      {getParticipantCountDisplay(equb._id)}
                    </div>

                    <div className="text-sm flex items-center text-gray-600 dark:text-gray-300">
                      <DollarSign className="h-4 w-4 mr-1 text-blue-600 dark:text-blue-400" />
                      {equb.amountPerPerson} ETB
                    </div>

                    <div className="text-sm flex items-center text-gray-600 dark:text-gray-300">
                      <Clock className="h-4 w-4 mr-1 text-blue-600 dark:text-blue-400" />
                      {equb.cycle}
                    </div>
                  </div>

                  {joinStatus[equb._id]?.message && (
                    <div
                      className={`mt-2 text-sm ${
                        joinStatus[equb._id]?.status === "Error" ||
                        joinStatus[equb._id]?.status === "Rejected"
                          ? "text-red-600 dark:text-red-400"
                          : joinStatus[equb._id]?.status === "Pending"
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {joinStatus[equb._id]?.message}
                    </div>
                  )}
                  
                  {/* Start Cycle status messages */}
                  {startCycleSuccess[equb._id] && (
                    <div className="mt-2 text-sm text-green-600 flex items-center dark:text-green-400">
                      <Check className="h-4 w-4 mr-1" />
                      Cycle started successfully!
                    </div>
                  )}
                  
                  {startCycleError[equb._id] && (
                    <div className="mt-2 text-sm text-red-600 flex items-center dark:text-red-400">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {startCycleError[equb._id]}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3 mt-3 md:mt-0">
                  <button
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={() => handleShowDetails(equb)}
                  >
                    Details
                  </button>

                  {renderActionButtons(equb)}
                </div>
              </div>

              {/* Expandable Rating UI */}
              <AnimatePresence>
                {expandedRatingId === equb._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-gray-50 rounded-lg p-3 mt-2 dark:bg-gray-700"
                  >
                    <div>
                      <h5 className="font-medium text-sm text-gray-700 mb-2 dark:text-gray-200">Rate this Equb</h5>
                      <div className="flex items-center flex-wrap gap-3">
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleRatingClick(equb._id, star)}
                              onMouseEnter={() => handleRatingHover(equb._id, star)}
                              onMouseLeave={() => handleRatingHover(equb._id, 0)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  star <= (hoverRatingMap[equb._id] || ratingMap[equb._id] || 0)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300 dark:text-gray-500"
                                } transition-colors`}
                              />
                            </button>
                          ))}
                        </div>
                        
                        {equb.userRating > 0 && !ratingSuccess[equb._id] && (
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            You rated this {equb.userRating} out of 5
                          </span>
                        )}
                        
                        {ratingSuccess[equb._id] && (
                          <span className="text-sm text-green-600 flex items-center dark:text-green-400">
                            <Check className="h-4 w-4 mr-1" />
                            Rating submitted!
                          </span>
                        )}
                      </div>
                      
                      {ratingErrors[equb._id] && (
                        <p className="mt-1 text-sm text-red-600 flex items-center dark:text-red-400">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {ratingErrors[equb._id]}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Expandable Complaint UI */}
              <AnimatePresence>
                {expandedComplaintId === equb._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-gray-50 rounded-lg p-3 mt-2 dark:bg-gray-700"
                  >
                    <div>
                      <h5 className="font-medium text-sm text-gray-700 mb-2 dark:text-gray-200">Submit a Complaint</h5>
                      <textarea
                        value={complaints[equb._id] || ""}
                        onChange={(e) => handleComplaintChange(equb._id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        rows="2"
                        placeholder="Describe your issue with this Equb..."
                      ></textarea>
                      
                      <div className="mt-2 flex items-center justify-between flex-wrap gap-2">
                        <div>
                          {complaintErrors[equb._id] && (
                            <p className="text-sm text-red-600 flex items-center dark:text-red-400">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {complaintErrors[equb._id]}
                            </p>
                          )}
                          
                          {complaintSuccess[equb._id] && (
                            <p className="text-sm text-green-600 flex items-center dark:text-green-400">
                              <Check className="h-4 w-4 mr-1" />
                              Complaint submitted successfully!
                            </p>
                          )}
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => handleComplaintSubmit(equb._id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                        >
                          Submit Complaint
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {/* Pagination */}
          {equbs.length > equbsPerPage && (
            <div className="flex justify-center items-center mt-8 gap-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg border ${
                  currentPage === 1
                    ? "text-gray-400 border-gray-200 cursor-not-allowed dark:text-gray-600 dark:border-gray-700"
                    : "text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/30"
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((num) => {
                    // Show pages that are close to the current page and the first/last page
                    return (
                      num === 1 ||
                      num === totalPages ||
                      Math.abs(num - currentPage) <= 1
                    );
                  })
                  .map((number, idx, arr) => {
                    // If there's a gap in the sequence, show ellipsis
                    if (idx > 0 && number - arr[idx - 1] > 1) {
                      return (
                        <React.Fragment key={`ellipsis-${number}`}>
                          <span className="px-3 py-1 text-gray-400 dark:text-gray-500">...</span>
                          <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`px-3 py-1 rounded-lg ${
                              currentPage === number
                                ? "bg-blue-600 text-white"
                                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            }`}
                          >
                            {number}
                          </button>
                        </React.Fragment>
                      );
                    }
                    return (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-3 py-1 rounded-lg ${
                          currentPage === number
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        }`}
                      >
                        {number}
                      </button>
                    );
                  })}
              </div>

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg border ${
                  currentPage === totalPages
                    ? "text-gray-400 border-gray-200 cursor-not-allowed dark:text-gray-600 dark:border-gray-700"
                    : "text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/30"
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No Equbs found matching your criteria.
          </p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            onClick={() => window.location.href = "/create-equb"}
          >
            Create a new Equb
          </button>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedEqub && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto dark:bg-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold dark:text-white">Equb Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center flex-wrap gap-2 mb-3">
                <h4 className="font-bold text-lg dark:text-white">{selectedEqub.name}</h4>

                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    selectedEqub.status === "active"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  }`}
                >
                  {selectedEqub.status}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    selectedEqub.equbType === "Automatic"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  }`}
                >
                  {selectedEqub.equbType === "Automatic"
                    ? "Automatic Lottery"
                    : "Manual Lottery"}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    selectedEqub.type === "created"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                  }`}
                >
                  {selectedEqub.type === "created" ? "Created" : "Joined"}
                </span>
              </div>

              {/* Admin buttons in details modal */}
              {selectedEqub.type === "created" && showAdminControls && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedEqub.equbType === "Automatic" && (
                    <button
                      className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition flex items-center text-sm"
                      onClick={() => handleStartCycle(selectedEqub._id)}
                      disabled={startCycleLoading[selectedEqub._id]}
                    >
                      {startCycleLoading[selectedEqub._id] ? (
                        <span className="animate-pulse">Starting...</span>
                      ) : (
                        <>
                          <PlayCircle className="h-3.5 w-3.5 mr-1" />
                          Start Cycle
                        </>
                      )}
                    </button>
                  )}
                  
                  {selectedEqub.equbType === "Manual" && (
                    <button
                      className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition flex items-center text-sm"
                      onClick={() => handleShowWinnerModal(selectedEqub)}
                      disabled={winnerSelectionLoading}
                    >
                      <Gift className="h-3.5 w-3.5 mr-1" />
                      Choose Winner
                    </button>
                  )}
                </div>
              )}

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`px-4 py-2 font-medium text-sm ${
                      activeTab === "details"
                        ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab("announcements")}
                    className={`px-4 py-2 font-medium text-sm ${
                      activeTab === "announcements"
                        ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    Announcements
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "details" && (
              <div className="space-y-4">
                {/* Rating display in details */}
                <div className="flex items-center">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(selectedEqub.averageRating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 dark:text-gray-500"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {selectedEqub.averageRating ? selectedEqub.averageRating.toFixed(1) : "0.0"} 
                    ({selectedEqub.ratingCount || 0} ratings)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                    <h5 className="font-semibold text-gray-700 mb-2 dark:text-gray-200">Location</h5>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{selectedEqub.location}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                    <h5 className="font-semibold text-gray-700 mb-2 dark:text-gray-200">Cycle</h5>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{selectedEqub.cycle}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                    <h5 className="font-semibold text-gray-700 mb-2 dark:text-gray-200">Members</h5>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Users className="h-4 w-4 mr-2" />
                      <span>
                        {getParticipantCountDisplay(selectedEqub._id)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                    <h5 className="font-semibold text-gray-700 mb-2 dark:text-gray-200">
                      Amount Per Person
                    </h5>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>{selectedEqub.amountPerPerson} ETB</span>
                    </div>
                  </div>
                </div>

                {selectedEqub.message && (
                  <div className="mt-4">
                    <h5 className="font-semibold text-gray-700 mb-2 dark:text-gray-200">
                      Description
                    </h5>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedEqub.message || "No description provided."}
                    </p>
                  </div>
                )}

                {/* Rating and Complaint UI in details modal */}
                {selectedEqub.type === "joined" && (
                  <div className="mt-6 space-y-6">
                    {/* Rating Section */}
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2 dark:text-gray-200">Rate this Equb</h4>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingClick(selectedEqub._id, star)}
                            onMouseEnter={() => handleRatingHover(selectedEqub._id, star)}
                            onMouseLeave={() => handleRatingHover(selectedEqub._id, 0)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= (hoverRatingMap[selectedEqub._id] || ratingMap[selectedEqub._id] || 0)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300 dark:text-gray-500"
                              } transition-colors`}
                            />
                          </button>
                        ))}

                        {selectedEqub.userRating > 0 && !ratingSuccess[selectedEqub._id] && (
                          <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                            You rated this {selectedEqub.userRating} out of 5
                          </span>
                        )}
                        
                        {ratingSuccess[selectedEqub._id] && (
                          <span className="ml-2 text-sm text-green-600 flex items-center dark:text-green-400">
                            <Check className="h-4 w-4 mr-1" />
                            Rating submitted!
                          </span>
                        )}
                      </div>
                      
                      {ratingErrors[selectedEqub._id] && (
                        <p className="mt-1 text-sm text-red-600 flex items-center dark:text-red-400">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {ratingErrors[selectedEqub._id]}
                        </p>
                      )}
                    </div>

                    {/* Complaint Section */}
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2 dark:text-gray-200">Submit a Complaint</h4>
                      <textarea
                        value={complaints[selectedEqub._id] || ""}
                        onChange={(e) => handleComplaintChange(selectedEqub._id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        rows="3"
                        placeholder="Describe your issue with this Equb..."
                      ></textarea>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <div>
                          {complaintErrors[selectedEqub._id] && (
                            <p className="text-sm text-red-600 flex items-center dark:text-red-400">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {complaintErrors[selectedEqub._id]}
                            </p>
                          )}
                          
                          {complaintSuccess[selectedEqub._id] && (
                            <p className="text-sm text-green-600 flex items-center dark:text-green-400">
                              <Check className="h-4 w-4 mr-1" />
                              Complaint submitted successfully!
                            </p>
                          )}
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => handleComplaintSubmit(selectedEqub._id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                        >
                          Submit Complaint
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Announcements Tab */}
            {activeTab === "announcements" && (
              <div>
                {selectedEqub.type === "created" && showAdminControls && (
                  <div className="mb-4">
                    <button
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center"
                      onClick={() => handleShowAnnouncementModal(selectedEqub)}
                    >
                      <Megaphone className="h-4 w-4 mr-2" />
                      New Announcement
                    </button>
                  </div>
                )}

                <div className="space-y-4">
                  {announcementsLoading[selectedEqub._id] ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">Loading announcements...</p>
                    </div>
                  ) : equbAnnouncements[selectedEqub._id] && equbAnnouncements[selectedEqub._id].length > 0 ? (
                    equbAnnouncements[selectedEqub._id].map(announcement => (
                      <div key={announcement._id} className="bg-gray-50 rounded-lg p-4 dark:bg-gray-700">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center">
                              <Megaphone className="h-4 w-4 text-purple-500 mr-2" />
                              <h5 className="font-medium text-gray-800 dark:text-gray-200">
                                {announcement.createdBy?.firstName || ""} {announcement.createdBy?.lastName || ""}
                              </h5>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(announcement.dateCreated)}
                            </div>
                          </div>
                          
                          {/* Edit/Delete options (only for creators) */}
                          {selectedEqub.type === "created" && showAdminControls && (
                            <div className="relative group">
                              <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                                <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                              </button>
                              <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg overflow-hidden z-10 invisible group-hover:visible dark:bg-gray-800 border dark:border-gray-700">
                                <div className="py-1">
                                  <button 
                                    onClick={() => handleShowEditAnnouncementModal(announcement)}
                                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center dark:text-gray-300 dark:hover:bg-gray-700"
                                  >
                                    <Edit className="h-3.5 w-3.5 mr-2" />
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleShowDeleteAnnouncementConfirmation(announcement)}
                                    className="px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left flex items-center dark:text-red-400 dark:hover:bg-gray-700"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{announcement.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">No announcements yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && equbToDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4 dark:bg-gray-800"
            >
              <div className="text-center mb-4">
                <div className="mx-auto w-14 h-14 flex items-center justify-center bg-red-100 rounded-full mb-4 dark:bg-red-900">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1 dark:text-white">Delete Equb</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Are you sure you want to delete <span className="font-semibold">{equbToDelete.name}</span>? This action cannot be undone.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 justify-between">
                <button
                  className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setEqubToDelete(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center justify-center"
                  onClick={handleDeleteEqub}
                  disabled={loadingMap[equbToDelete._id]}
                >
                  {loadingMap[equbToDelete._id] ? (
                    <span className="inline-block animate-pulse">Deleting...</span>
                  ) : (
                    <>Delete</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Announcement Modal */}
      <AnimatePresence>
        {showAnnouncementModal && equbToAnnounce && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4 dark:bg-gray-800"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Megaphone className="h-5 w-5 text-purple-500 mr-2" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Make Announcement</h3>
                </div>
                <button
                  onClick={() => {
                    setShowAnnouncementModal(false);
                    setEqubToAnnounce(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-gray-600 mb-4 dark:text-gray-300">
                Send an announcement to all members of <span className="font-semibold">{equbToAnnounce.name}</span>.
              </p>

              <div className="mb-4">
                <label htmlFor="announcement" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  Announcement Message
                </label>
                <textarea
                  id="announcement"
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows="4"
                  placeholder="Type your announcement message here..."
                ></textarea>
                
                {announcementError && (
                  <p className="mt-1 text-sm text-red-600 flex items-center dark:text-red-400">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {announcementError}
                  </p>
                )}
                
                {announcementSuccess && (
                  <p className="mt-1 text-sm text-green-600 flex items-center dark:text-green-400">
                    <Check className="h-4 w-4 mr-1" />
                    Announcement sent successfully!
                  </p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => {
                    setShowAnnouncementModal(false);
                    setEqubToAnnounce(null);
                  }}
                  disabled={announcementLoading}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center"
                  onClick={handleSendAnnouncement}
                  disabled={announcementLoading}
                >
                  {announcementLoading ? (
                    <span className="inline-block animate-pulse">Sending...</span>
                  ) : (
                    <>
                      <Megaphone className="h-4 w-4 mr-1" />
                      Send Announcement
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Announcement Modal */}
      <AnimatePresence>
        {showEditAnnouncementModal && announcementToEdit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4 dark:bg-gray-800"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Edit className="h-5 w-5 text-yellow-500 mr-2" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Announcement</h3>
                </div>
                <button
                  onClick={() => {
                    setShowEditAnnouncementModal(false);
                    setAnnouncementToEdit(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <label htmlFor="edit-announcement" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  Edit Announcement
                </label>
                <textarea
                  id="edit-announcement"
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows="4"
                  placeholder="Edit your announcement message..."
                ></textarea>
                
                {announcementError && (
                  <p className="mt-1 text-sm text-red-600 flex items-center dark:text-red-400">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {announcementError}
                  </p>
                )}
                
                {announcementSuccess && (
                  <p className="mt-1 text-sm text-green-600 flex items-center dark:text-green-400">
                    <Check className="h-4 w-4 mr-1" />
                    Announcement updated successfully!
                  </p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => {
                    setShowEditAnnouncementModal(false);
                    setAnnouncementToEdit(null);
                  }}
                  disabled={announcementLoading}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition flex items-center"
                  onClick={handleUpdateAnnouncement}
                  disabled={announcementLoading}
                >
                  {announcementLoading ? (
                    <span className="inline-block animate-pulse">Updating...</span>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-1" />
                      Update
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Announcement Confirmation Modal */}
      <AnimatePresence>
        {showDeleteAnnouncementModal && announcementToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4 dark:bg-gray-800"
            >
              <div className="text-center mb-4">
                <div className="mx-auto w-14 h-14 flex items-center justify-center bg-red-100 rounded-full mb-4 dark:bg-red-900">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1 dark:text-white">Delete Announcement</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Are you sure you want to delete this announcement? This action cannot be undone.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 justify-between">
                <button
                  className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => {
                    setShowDeleteAnnouncementModal(false);
                    setAnnouncementToDelete(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center justify-center"
                  onClick={handleDeleteAnnouncement}
                  disabled={announcementLoading}
                >
                  {announcementLoading ? (
                    <span className="inline-block animate-pulse">Deleting...</span>
                  ) : (
                    <>Delete</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winner Selection Modal */}
      <AnimatePresence>
        {showWinnerModal && equbToDrawWinner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4 dark:bg-gray-800"
            >
              <div className="text-center mb-4">
                <div className="mx-auto w-14 h-14 flex items-center justify-center bg-green-100 rounded-full mb-4 dark:bg-green-900">
                  <Gift className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1 dark:text-white">Select Winner</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  You are about to randomly select a winner for <span className="font-semibold">{equbToDrawWinner.name}</span>. 
                  This will advance the Equb to the next cycle.
                </p>
              </div>
              
              {winnerSelectionError && (
                <div className="mb-4 text-center text-red-600 flex items-center justify-center dark:text-red-400">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {winnerSelectionError}
                </div>
              )}
              
              {winnerSelectionSuccess && (
                <div className="mb-4 text-center text-green-600 flex items-center justify-center dark:text-green-400">
                  <Check className="h-5 w-5 mr-2" />
                  Winner selected successfully!
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 justify-between">
                <button
                  className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => {
                    setShowWinnerModal(false);
                    setEqubToDrawWinner(null);
                  }}
                  disabled={winnerSelectionLoading}
                >
                  Cancel
                </button>
                <button
                  className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center justify-center"
                  onClick={handleSelectWinner}
                  disabled={winnerSelectionLoading || winnerSelectionSuccess}
                >
                  {winnerSelectionLoading ? (
                    <span className="inline-block animate-pulse">Selecting...</span>
                  ) : (
                    <>Select Winner</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      {showEditModal && equbToEdit && (
        <CreateEqub
          isOpen={showEditModal}
          onClose={handleEditModalClose}
          initialData={equbToEdit}
          isEditing={true}
        />
      )}
    </motion.section>
  );
};
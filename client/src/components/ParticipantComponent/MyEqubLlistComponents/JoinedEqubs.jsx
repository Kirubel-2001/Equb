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
  Star,
  MessageCircle,
  AlertCircle,
  Check
} from "lucide-react";

export const JoinedEqubs = ({
  equbs,
  onRatingSubmitted,
  onComplaintSubmitted
}) => {
  const [joinStatus, setJoinStatus] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEqub, setSelectedEqub] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
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
  // Local equbs state for filtering after leave
  const [localEqubs, setLocalEqubs] = useState([]);
  
  const equbsPerPage = 9;

  // Initialize local equbs from props
  useEffect(() => {
    setLocalEqubs(equbs);
  }, [equbs]);

  // Fetch join status and participant counts on component mount
  useEffect(() => {
    const fetchJoinStatus = async () => {
      try {
        // Fetch join status for each equb
        const statusObj = {};
        const countsObj = {};
        
        for (const equb of localEqubs) {
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
  }, [localEqubs]);

  // Initialize rating map from equbs data
  useEffect(() => {
    const initialRatingMap = {};
    const initialComplaintsMap = {};
    
    localEqubs.forEach(equb => {
      initialRatingMap[equb._id] = equb.userRating || 0;
      initialComplaintsMap[equb._id] = "";
    });
    
    setRatingMap(initialRatingMap);
    setComplaints(initialComplaintsMap);
  }, [localEqubs]);

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

    return () => {
      ratingTimers.forEach(timer => clearTimeout(timer));
      complaintTimers.forEach(timer => clearTimeout(timer));
    };
  }, [ratingSuccess, complaintSuccess]);

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
        
        // Remove the equb from local state immediately
        setLocalEqubs(prevEqubs => prevEqubs.filter(equb => equb._id !== equbId));
        
        // Close details modal if open for this equb
        if (selectedEqub && selectedEqub._id === equbId) {
          setShowDetailsModal(false);
        }
        
        // Reset current page if needed
        const remainingEqubs = localEqubs.filter(equb => equb._id !== equbId);
        const newTotalPages = Math.ceil(remainingEqubs.length / equbsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
        
        // Dispatch custom event for parent components
        if (window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('equb-left', { 
            detail: { equbId, actionType: 'leave' } 
          }));
        }
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
  

  // Show details
  const handleShowDetails = (equb) => {
    setSelectedEqub(equb);
    setActiveTab("details");
    setShowDetailsModal(true);
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
  const currentEqubs = localEqubs.slice(indexOfFirstEqub, indexOfLastEqub);
  const totalPages = Math.ceil(localEqubs.length / equbsPerPage);

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
  
  // Helper function to get participant count display
  const getParticipantCountDisplay = (equbId) => {
    // Check if we have fetched participant count from API
    if (participantCounts[equbId]) {
      const { currentParticipants, totalParticipants } = participantCounts[equbId];
      return `${currentParticipants}/${totalParticipants} members`;
    }
    
    // Fallback to equb object data
    const equb = localEqubs.find(e => e._id === equbId);
    return equb ? `${equb.currentParticipants}/${equb.numberOfParticipants} members` : "Loading...";
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
    <>
      {localEqubs.length > 0 ? (
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
                      className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                    >
                      Joined
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
                </div>

                <div className="flex items-center space-x-3 mt-3 md:mt-0">
                  <button
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={() => handleShowDetails(equb)}
                  >
                    Details
                  </button>

                  <div className="flex flex-wrap gap-2">
                    <button
                      className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition flex items-center text-sm"
                      onClick={() => toggleRatingUI(equb._id)}
                    >
                      <Star className="h-3.5 w-3.5 mr-1" />
                      Rate
                    </button>
                    <button
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition flex items-center text-sm"
                      onClick={() => toggleComplaintUI(equb._id)}
                    >
                      <MessageCircle className="h-3.5 w-3.5 mr-1" />
                      Complaint
                    </button>
                    <button
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center text-sm"
                      onClick={() => handleCancelJoin(equb._id)}
                      disabled={loadingMap[equb._id]}
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      {loadingMap[equb._id] ? "..." : "Leave"}
                    </button>
                  </div>
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
          {localEqubs.length > equbsPerPage && (
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
            You haven't joined any Equbs yet.
          </p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            onClick={() => window.location.href = "/equbs"}
          >
            Browse available Equbs
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
                  className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                >
                  Joined
                </span>
              </div>

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

                {selectedEqub.description && (
                  <div className="mt-4">
                    <h5 className="font-semibold text-gray-700 mb-2 dark:text-gray-200">
                      Description
                    </h5>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedEqub.description || "No description provided."}
                    </p>
                  </div>
                )}

                {/* Rating and Complaint UI in details modal */}
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
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center"
                onClick={() => handleCancelJoin(selectedEqub._id)}
                disabled={loadingMap[selectedEqub._id]}
              >
                <X className="h-4 w-4 mr-1" />
                {loadingMap[selectedEqub._id] ? "Leaving..." : "Leave Equb"}
              </button>
              
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
    </>
  );
};
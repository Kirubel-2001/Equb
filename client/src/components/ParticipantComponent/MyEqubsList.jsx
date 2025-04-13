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
  Check
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
  
  const equbsPerPage = 9;

  // Fetch join status on component mount
  useEffect(() => {
    const fetchJoinStatus = async () => {
      try {
        // Fetch join status for each equb
        const statusObj = {};
        for (const equb of equbs) {
          try {
            const statusResponse = await fetch(
              `/api/participant/status/${equb._id}`
            );
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              statusObj[equb._id] = {
                status: statusData.status,
                message: statusData.message,
              };
            }
          } catch (error) {
            console.error(`Error fetching status for equb ${equb._id}:`, error);
          }
        }
        setJoinStatus(statusObj);
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

  // Function to render action buttons based on equb type and status
  const renderActionButtons = (equb) => {
    const equbId = equb._id;

    // For created equbs, show admin controls
    if (equb.type === "created" && showAdminControls) {
      return (
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition flex items-center"
            onClick={() => handleEditEqub(equb)}
            disabled={loadingMap[equbId]}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </button>
          <button
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center"
            onClick={() => handleShowDeleteConfirmation(equb)}
            disabled={loadingMap[equbId]}
          >
            {loadingMap[equbId] ? (
              <>
                <span className="animate-pulse">Processing...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-1" />
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
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition flex flex-col"
            >
              <div className="mb-4 flex flex-col md:flex-row justify-between">
                <div>
                  <div className="flex items-center flex-wrap gap-2">
                    <h4 className="font-bold">{equb.name}</h4>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        equb.equbType === "Automatic"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {equb.equbType === "Automatic"
                        ? "Automatic Lottery"
                        : "Manual Lottery"}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        equb.type === "created"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {equb.type === "created" ? "Created" : "Joined"}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{equb.location}</span>
                  </div>

                  {/* Rating stars - show for all equbs */}
                  {renderRatingStars(equb)}

                  <div className="flex flex-wrap gap-3 mt-3">
                    <div className="text-sm flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-1 text-blue-600" />
                      {equb.currentParticipants}/{equb.numberOfParticipants} members
                    </div>

                    <div className="text-sm flex items-center text-gray-600">
                      <DollarSign className="h-4 w-4 mr-1 text-blue-600" />
                      {equb.amountPerPerson} ETB
                    </div>

                    <div className="text-sm flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-1 text-blue-600" />
                      {equb.cycle}
                    </div>
                  </div>

                  {joinStatus[equb._id]?.message && (
                    <div
                      className={`mt-2 text-sm ${
                        joinStatus[equb._id]?.status === "Error" ||
                        joinStatus[equb._id]?.status === "Rejected"
                          ? "text-red-600"
                          : joinStatus[equb._id]?.status === "Pending"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {joinStatus[equb._id]?.message}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3 mt-3 md:mt-0">
                  <button
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition"
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
                    className="overflow-hidden bg-gray-50 rounded-lg p-3 mt-2"
                  >
                    <div>
                      <h5 className="font-medium text-sm text-gray-700 mb-2">Rate this Equb</h5>
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
                                    : "text-gray-300"
                                } transition-colors`}
                              />
                            </button>
                          ))}
                        </div>
                        
                        {equb.userRating > 0 && !ratingSuccess[equb._id] && (
                          <span className="text-sm text-gray-600">
                            You rated this {equb.userRating} out of 5
                          </span>
                        )}
                        
                        {ratingSuccess[equb._id] && (
                          <span className="text-sm text-green-600 flex items-center">
                            <Check className="h-4 w-4 mr-1" />
                            Rating submitted!
                          </span>
                        )}
                      </div>
                      
                      {ratingErrors[equb._id] && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
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
                    className="overflow-hidden bg-gray-50 rounded-lg p-3 mt-2"
                  >
                    <div>
                      <h5 className="font-medium text-sm text-gray-700 mb-2">Submit a Complaint</h5>
                      <textarea
                        value={complaints[equb._id] || ""}
                        onChange={(e) => handleComplaintChange(equb._id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="2"
                        placeholder="Describe your issue with this Equb..."
                      ></textarea>
                      
                      <div className="mt-2 flex items-center justify-between flex-wrap gap-2">
                        <div>
                          {complaintErrors[equb._id] && (
                            <p className="text-sm text-red-600 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {complaintErrors[equb._id]}
                            </p>
                          )}
                          
                          {complaintSuccess[equb._id] && (
                            <p className="text-sm text-green-600 flex items-center">
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
                    ? "text-gray-400 border-gray-200 cursor-not-allowed"
                    : "text-blue-600 border-blue-200 hover:bg-blue-50"
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
                          <span className="px-3 py-1 text-gray-400">...</span>
                          <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`px-3 py-1 rounded-lg ${
                              currentPage === number
                                ? "bg-blue-600 text-white"
                                : "text-gray-700 hover:bg-gray-100"
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
                            : "text-gray-700 hover:bg-gray-100"
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
                    ? "text-gray-400 border-gray-200 cursor-not-allowed"
                    : "text-blue-600 border-blue-200 hover:bg-blue-50"
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">
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
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Equb Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center flex-wrap gap-2">
                <h4 className="font-bold text-lg">{selectedEqub.name}</h4>

                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    selectedEqub.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {selectedEqub.status}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    selectedEqub.equbType === "Automatic"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {selectedEqub.equbType === "Automatic"
                    ? "Automatic Lottery"
                    : "Manual Lottery"}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    selectedEqub.type === "created"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {selectedEqub.type === "created" ? "Created" : "Joined"}
                </span>
              </div>

              {/* Rating display in details */}
              <div className="flex items-center">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(selectedEqub.averageRating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {selectedEqub.averageRating ? selectedEqub.averageRating.toFixed(1) : "0.0"} 
                  ({selectedEqub.ratingCount || 0} ratings)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-700 mb-2">Location</h5>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{selectedEqub.location}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-700 mb-2">Cycle</h5>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{selectedEqub.cycle}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-700 mb-2">Members</h5>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>
                      {selectedEqub.currentParticipants}/
                      {selectedEqub.numberOfParticipants} participants
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-700 mb-2">
                    Amount Per Person
                  </h5>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>{selectedEqub.amountPerPerson} ETB</span>
                  </div>
                </div>
              </div>

              {selectedEqub.message && (
                <div className="mt-4">
                  <h5 className="font-semibold text-gray-700 mb-2">
                    Description
                  </h5>
                  <p className="text-gray-600">
                    {selectedEqub.message || "No description provided."}
                  </p>
                </div>
              )}

              {/* Rating and Complaint UI in details modal */}
              {selectedEqub.type === "joined" && (
                <div className="mt-6 space-y-6">
                  {/* Rating Section */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Rate this Equb</h4>
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
                                : "text-gray-300"
                            } transition-colors`}
                          />
                        </button>
                      ))}

                      {selectedEqub.userRating > 0 && !ratingSuccess[selectedEqub._id] && (
                        <span className="ml-2 text-sm text-gray-600">
                          You rated this {selectedEqub.userRating} out of 5
                        </span>
                      )}
                      
                      {ratingSuccess[selectedEqub._id] && (
                        <span className="ml-2 text-sm text-green-600 flex items-center">
                          <Check className="h-4 w-4 mr-1" />
                          Rating submitted!
                        </span>
                      )}
                    </div>
                    
                    {ratingErrors[selectedEqub._id] && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {ratingErrors[selectedEqub._id]}
                      </p>
                    )}
                  </div>

                  {/* Complaint Section */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Submit a Complaint</h4>
                    <textarea
                      value={complaints[selectedEqub._id] || ""}
                      onChange={(e) => handleComplaintChange(selectedEqub._id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="Describe your issue with this Equb..."
                    ></textarea>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <div>
                        {complaintErrors[selectedEqub._id] && (
                          <p className="text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {complaintErrors[selectedEqub._id]}
                          </p>
                        )}
                        
                        {complaintSuccess[selectedEqub._id] && (
                          <p className="text-sm text-green-600 flex items-center">
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

              <div className="flex justify-end mt-6">
                <button
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </button>
              </div>
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
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            >
              <div className="text-center mb-4">
                <div className="mx-auto w-14 h-14 flex items-center justify-center bg-red-100 rounded-full mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Delete Equb</h3>
                <p className="text-gray-600">
                  Are you sure you want to delete <span className="font-semibold">{equbToDelete.name}</span>? This action cannot be undone.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 justify-between">
                <button
                  className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
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
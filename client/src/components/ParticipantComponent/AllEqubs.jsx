import React, { useState, useEffect } from "react";
/* eslint-disable-next-line no-unused-vars */
import { motion } from "framer-motion";
import {
  MapPin,
  UserPlus,
  Clock,
  Users,
  DollarSign,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  StarHalf
} from "lucide-react";

export const AllEqubs = ({
  searchTerm = "",
  activeCategory = "all",
  amountFilter = { min: "", max: "" },
  setShowPopup,
  locationFilter = "",
}) => {
  const [equbs, setEqubs] = useState([]);
  const [filteredEqubs, setFilteredEqubs] = useState([]);
  const [joinStatus, setJoinStatus] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEqub, setSelectedEqub] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [equbRatings, setEqubRatings] = useState({});
  const [participantCounts, setParticipantCounts] = useState({});
  const equbsPerPage = 9;

  // Fetch equbs on component mount
  useEffect(() => {
    const fetchEqubs = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch all equbs
        const response = await fetch("/api/equb/get-equbs", {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch Equbs");
        }
        
        const equbsData = await response.json();
        setEqubs(equbsData);
        
        // Fetch join status, ratings, and participant counts for each equb
        const statusObj = {};
        const ratingsObj = {};
        const countsObj = {};

        for (const equb of equbsData) {
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

            // Fetch ratings
            const ratingsResponse = await fetch(
              `/api/rating/equb/${equb._id}`
            );
            if (ratingsResponse.ok) {
              const ratingsData = await ratingsResponse.json();
              ratingsObj[equb._id] = {
                averageRating: ratingsData.averageRating,
                totalRatings: ratingsData.totalRatings
              };
            }
            
            // Fetch participant counts using the new API endpoint
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
        setEqubRatings(ratingsObj);
        setParticipantCounts(countsObj);
      } catch (error) {
        console.error("Error fetching Equbs:", error);
        setError("Failed to load equbs. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEqubs();
  }, []);

  // Filter equbs based on search, category, amount and location
  useEffect(() => {
    const filtered = equbs.filter((equb) => {
      // Filter by status category
      if (activeCategory !== "all" && equb.status !== activeCategory)
        return false;

      // Filter by amount range
      if (amountFilter.min && equb.amountPerPerson < Number(amountFilter.min))
        return false;
      if (amountFilter.max && equb.amountPerPerson > Number(amountFilter.max))
        return false;
        
      // Filter by location
      if (
        locationFilter &&
        !equb.location.toLowerCase().includes(locationFilter.toLowerCase())
      )
        return false;
        
      // Filter by search term (name, location, or amount)
      return (
        searchTerm === "" ||
        equb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equb.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equb.amountPerPerson.toString().includes(searchTerm)
      );
    });
    
    setFilteredEqubs(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [equbs, searchTerm, activeCategory, amountFilter, locationFilter]);

  const handleJoinEqub = async (equbId) => {
    setLoadingMap((prev) => ({ ...prev, [equbId]: true }));
    try {
      const response = await fetch(`/api/participant/join/${equbId}`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setJoinStatus({
          ...joinStatus,
          [equbId]: {
            status: "Pending",
            message: "Join request sent successfully",
          },
        });
        
        // Refresh participant count after joining
        await refreshParticipantCount(equbId);
      } else {
        // If the error is that user already joined
        if (data.status) {
          setJoinStatus({
            ...joinStatus,
            [equbId]: {
              status: data.status,
              message: data.message,
            },
          });
        } else {
          setJoinStatus({
            ...joinStatus,
            [equbId]: {
              status: "Error",
              message: data.message,
            },
          });
        }
      }
    } catch (error) {
      console.error("Error joining Equb:", error);
      setJoinStatus({
        ...joinStatus,
        [equbId]: {
          status: "Error",
          message: "Failed to join. Please try again.",
        },
      });
    } finally {
      setLoadingMap((prev) => ({ ...prev, [equbId]: false }));
    }
  };

  const handleCancelJoin = async (equbId) => {
    setLoadingMap((prev) => ({ ...prev, [equbId]: true }));
    try {
      const response = await fetch(`/api/participant/leave/${equbId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
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

        // After a brief delay, remove the message
        setTimeout(() => {
          setJoinStatus((prev) => ({
            ...prev,
            [equbId]: {
              status: null,
              message: "",
            },
          }));
        }, 3000);
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
    setShowDetailsModal(true);
  };

  // Get current page equbs
  const indexOfLastEqub = currentPage * equbsPerPage;
  const indexOfFirstEqub = indexOfLastEqub - equbsPerPage;
  const currentEqubs = filteredEqubs.slice(indexOfFirstEqub, indexOfLastEqub);
  const totalPages = Math.ceil(filteredEqubs.length / equbsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const getJoinButtonText = (equbId) => {
    if (loadingMap[equbId]) return "Processing...";

    const status = joinStatus[equbId]?.status;
    if (status === "Pending") return "Pending";
    if (status === "Accepted") return "Joined";
    if (status === "Rejected") return "Rejected";

    return "Join";
  };

  const getJoinButtonStyle = (equbId) => {
    const status = joinStatus[equbId]?.status;

    if (status === "Pending") {
      return "px-4 py-2 bg-yellow-500 text-white rounded-lg transition flex items-center";
    } else if (status === "Accepted") {
      return "px-4 py-2 bg-green-600 text-white rounded-lg transition flex items-center";
    } else if (status === "Rejected" || status === "Error") {
      return "px-4 py-2 bg-red-600 text-white rounded-lg transition flex items-center";
    }

    return "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center";
  };

  // Function to render join/cancel buttons based on status
  const renderActionButtons = (equbId) => {
    const status = joinStatus[equbId]?.status;
    const isFull = participantCounts[equbId]?.isFull;

    // If equb is full and user is not already a member, disable join button
    if (isFull && status !== "Accepted" && status !== "Pending") {
      return (
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded-lg transition flex items-center cursor-not-allowed"
          disabled={true}
        >
          <UserPlus className="h-4 w-4 mr-1" />
          Full
        </button>
      );
    }

    // If pending or accepted, show cancel button
    if (status === "Pending" || status === "Accepted") {
      return (
        <div className="flex space-x-2">
          <button className={getJoinButtonStyle(equbId)} disabled={true}>
            <UserPlus className="h-4 w-4 mr-1" />
            {getJoinButtonText(equbId)}
          </button>
          <button
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition flex items-center"
            onClick={() => handleCancelJoin(equbId)}
            disabled={loadingMap[equbId]}
          >
            <X className="h-4 w-4 mr-1" />
            {loadingMap[equbId] ? "Processing..." : "Cancel"}
          </button>
        </div>
      );
    }

    // Otherwise show regular join button
    return (
      <button
        className={getJoinButtonStyle(equbId)}
        onClick={() => handleJoinEqub(equbId)}
        disabled={loadingMap[equbId]}
      >
        <UserPlus className="h-4 w-4 mr-1" />
        {getJoinButtonText(equbId)}
      </button>
    );
  };

  // Function to render star ratings
  const renderStarRating = (equbId) => {
    const rating = equbRatings[equbId]?.averageRating || 0;
    const totalRatings = equbRatings[equbId]?.totalRatings || 0;
    
    // Determine whole stars and half stars
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        <div className="flex text-yellow-400">
          {[...Array(5)].map((_, i) => {
            if (i < fullStars) {
              return <Star key={i} className="h-4 w-4 fill-current" />;
            } else if (i === fullStars && hasHalfStar) {
              return <StarHalf key={i} className="h-4 w-4 fill-current" />;
            } else {
              return <Star key={i} className="h-4 w-4 text-gray-300" />;
            }
          })}
        </div>
        <span className="ml-1 text-sm text-gray-600">
          {rating.toFixed(1)} ({totalRatings})
        </span>
      </div>
    );
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

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h3 className="text-xl font-bold mb-4">Available Equbs</h3>

      {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-gray-200"></div>
          <p className="mt-2 text-gray-600">Loading equbs...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEqubs.length > 0 ? (
            currentEqubs.map((equb) => (
              <motion.div
                key={equb._id}
                whileHover={{ scale: 1.01 }}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition flex flex-col md:flex-row justify-between"
              >
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center">
                    <h4 className="font-bold">{equb.name}</h4>
                    <span
                      className={`ml-3 text-xs px-2 py-1 rounded-full ${
                        equb.equbType === "Automatic"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {equb.equbType === "Automatic"
                        ? "Automatic Lottery"
                        : "Manual Lottery"}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{equb.location}</span>
                  </div>

                  {/* Rating display */}
                  <div className="mt-1">
                    {renderStarRating(equb._id)}
                  </div>

                  <div className="flex flex-wrap gap-3 mt-3">
                    <div className="text-sm flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-1 text-blue-600" />
                      {getParticipantCountDisplay(equb._id)}
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

                <div className="flex items-center space-x-3">
                  <button
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition"
                    onClick={() => handleShowDetails(equb)}
                  >
                    Details
                  </button>

                  {renderActionButtons(equb._id)}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No Equbs found matching your criteria.
              </p>
              <button
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                onClick={() => setShowPopup && setShowPopup(true)}
              >
                Create a new Equb
              </button>
            </div>
          )}

          {/* Pagination */}
          {filteredEqubs.length > equbsPerPage && (
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
              <div className="flex items-center">
                <h4 className="font-bold text-lg">{selectedEqub.name}</h4>

                <span
                  className={`ml-3 text-xs px-2 py-1 rounded-full ${
                    selectedEqub.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {selectedEqub.status}
                </span>
                <span
                  className={`ml-3 text-xs px-2 py-1 rounded-full ${
                    selectedEqub.equbType === "Automatic"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {selectedEqub.equbType === "Automatic"
                    ? "Automatic Lottery"
                    : "Manual Lottery"}
                </span>
              </div>

              {/* Rating in the modal */}
              <div className="mt-2">
                {renderStarRating(selectedEqub._id)}
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
                      {getParticipantCountDisplay(selectedEqub._id)}
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

              {selectedEqub.description && (
                <div className="mt-4">
                  <h5 className="font-semibold text-gray-700 mb-2">
                    Description
                  </h5>
                  <p className="text-gray-600">
                    {selectedEqub.description || "No description provided."}
                  </p>
                </div>
              )}

              <div className="flex justify-end mt-6 space-x-3">
                <button
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </button>

                {renderActionButtons(selectedEqub._id)}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
};
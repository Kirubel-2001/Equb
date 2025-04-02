import React, { useState, useEffect } from "react";
/* eslint-disable-next-line no-unused-vars */
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  UserPlus,
  Clock,
  PlusCircle,
  Filter,
  Users,
  DollarSign,
  X,
} from "lucide-react";
import { CreateEqub } from "../../../components/ParticipantComponent/CreateEqub";
import PopularEqubs from "../../../components/PopularEqubs";

export const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [equbs, setEqubs] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [joinStatus, setJoinStatus] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEqub, setSelectedEqub] = useState(null);
  const [amountFilter, setAmountFilter] = useState({ min: "", max: "" });

  useEffect(() => {
    // Fetch all equbs and check join status for each one
    const fetchEqubsAndStatus = async () => {
      try {
        // Fetch all equbs
        const response = await fetch("/api/equb/get-equbs");
        if (!response.ok) {
          throw new Error("Failed to fetch Equbs");
        }
        const equbsData = await response.json();
        setEqubs(equbsData);

        // Fetch join status for each equb
        const statusObj = {};
        for (const equb of equbsData) {
          try {
            // Make a separate API call to check join status for each equb
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
        console.error("Error fetching Equbs:", error.message);
      }
    };

    fetchEqubsAndStatus();
  }, []);

  const handleJoinEqub = async (equbId) => {
    setLoadingMap((prev) => ({ ...prev, [equbId]: true }));
    try {
      const response = await fetch(`/api/participant/join/${equbId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  // New cancel/leave function
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
  // Show details
  const handleShowDetails = (equb) => {
    setSelectedEqub(equb);
    setShowDetailsModal(true);
  };

  const filteredEqubs = equbs.filter((equb) => {
    // Filter by status category
    if (activeCategory !== "all" && equb.status !== activeCategory)
      return false;

    // Filter by amount range
    if (amountFilter.min && equb.amountPerPerson < Number(amountFilter.min))
      return false;
    if (amountFilter.max && equb.amountPerPerson > Number(amountFilter.max))
      return false;

    // Filter by search term (name, location, or amount)
    return (
      equb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equb.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equb.amountPerPerson.toString().includes(searchTerm)
    );
  });

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

        {/* Details Modal */}
        {showDetailsModal &&
          selectedEqub &&
          filteredEqubs.map((equb) => (
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
                        selectedEqub.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedEqub.status}
                    </span>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-gray-700 mb-2">
                        Location
                      </h5>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{selectedEqub.location}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-gray-700 mb-2">
                        Cycle
                      </h5>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{selectedEqub.cycle}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-gray-700 mb-2">
                        Members
                      </h5>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span>
                          {selectedEqub.numberOfParticipants}/
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

                    {/* Use the new renderActionButtons function for the modal too */}
                    {renderActionButtons(selectedEqub._id)}
                  </div>
                </div>
              </div>
            </div>
          ))}

        {/* Popular Equbs Section */}
        {!isTyping && <PopularEqubs />}

        {/* All Equbs Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-xl font-bold mb-4 pt-4">All Equbs</h3>

          <div className="space-y-4">
            {filteredEqubs.length > 0 ? (
              filteredEqubs.map((equb) => (
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

                    <div className="flex flex-wrap gap-3 mt-3">
                      <div className="text-sm flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-1 text-blue-600" />
                        {equb.numberOfParticipants}/{equb.numberOfParticipants}{" "}
                        members
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

                    {/* Use the new renderActionButtons function */}
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
                  onClick={() => setShowPopup(true)}
                >
                  Create a new Equb
                </button>
              </div>
            )}
          </div>
        </motion.section>
      </main>
    </div>
  );
};

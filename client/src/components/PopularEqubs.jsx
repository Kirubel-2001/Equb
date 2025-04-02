import { useEffect, useState } from "react";
/* eslint-disable-next-line no-unused-vars */
import { motion } from "framer-motion";
import { ChevronRight, UserPlus, X } from "lucide-react";

export default function PopularEqubs() {
  const [activeEqubs, setActiveEqubs] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [joinStatus, setJoinStatus] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  
  useEffect(() => {
    const fetchEqubsAndStatus = async () => {
      try {
        const response = await fetch("/api/equb/get-equbs");
        if (!response.ok) {
          throw new Error("Failed to fetch Equbs");
        }
        const equbsData = await response.json();
        setActiveEqubs(equbsData);
        
        // Fetch join status for each equb
        const statusObj = {};
        for (const equb of equbsData) {
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
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setJoinStatus({
          ...joinStatus,
          [equbId]: {
            status: null,
            message: "Request canceled successfully",
          },
        });

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

  const getJoinButtonText = (equbId) => {
    if (loadingMap[equbId]) return "Processing...";

    const status = joinStatus[equbId]?.status;
    if (status === "Pending") return "Pending";
    if (status === "Accepted") return "Joined";
    if (status === "Rejected") return "Rejected";

    return "Join Group";
  };

  const getJoinButtonStyle = (equbId) => {
    const status = joinStatus[equbId]?.status;

    if (status === "Pending") {
      return "mt-6 w-full bg-yellow-500 text-white py-2 rounded-lg transition";
    } else if (status === "Accepted") {
      return "mt-6 w-full bg-green-600 text-white py-2 rounded-lg transition";
    } else if (status === "Rejected" || status === "Error") {
      return "mt-6 w-full bg-red-600 text-white py-2 rounded-lg transition";
    }

    return "mt-6 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors";
  };

  const renderActionButtons = (equbId) => {
    const status = joinStatus[equbId]?.status;

    if (status === "Pending" || status === "Accepted") {
      return (
        <div className="flex flex-col space-y-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={getJoinButtonStyle(equbId)}
            disabled={true}
          >
            <div className="flex items-center justify-center">
              <UserPlus className="h-4 w-4 mr-1" />
              {getJoinButtonText(equbId)}
            </div>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition"
            onClick={() => handleCancelJoin(equbId)}
            disabled={loadingMap[equbId]}
          >
            <div className="flex items-center justify-center">
              <X className="h-4 w-4 mr-1" />
              {loadingMap[equbId] ? "Processing..." : "Cancel"}
            </div>
          </motion.button>
        </div>
      );
    }

    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={getJoinButtonStyle(equbId)}
        onClick={() => handleJoinEqub(equbId)}
        disabled={loadingMap[equbId]}
      >
        <div className="flex items-center justify-center">
          <UserPlus className="h-4 w-4 mr-1" />
          {getJoinButtonText(equbId)}
        </div>
      </motion.button>
    );
  };

  // Display only the first `visibleCount` Equbs
  const displayedEqubs = activeEqubs.slice(0, visibleCount);
  
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Popular Equb Groups
            </h2>
            <p className="mt-2 text-gray-600">
              Join active groups or create your own
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedEqubs.map((equb, index) => (
            <motion.div
              key={equb._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {equb.name}
                    </h3>
                    <p className="text-gray-600">{equb.location}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {equb.spotsLeft} spots left
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Members:</span>
                    <span className="font-medium">
                      {equb.numberOfParticipants}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">
                      {equb.amountPerPerson} ETB
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Cycle:</span>
                    <span className="font-medium">{equb.cycle}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">
                        {equb.numberOfParticipants - 2}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${equb.numberOfParticipants - 1}%` }}
                      />
                    </div>
                  </div>
                </div>

                {joinStatus[equb._id]?.message && (
                  <div
                    className={`mt-2 text-sm text-center ${
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

                {renderActionButtons(equb._id)}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-end pt-7">
          {activeEqubs.length > 3 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-indigo-600 hover:text-indigo-500 flex items-center"
              onClick={() => setVisibleCount(visibleCount === 3 ? 9 : 3)}
            >
              {visibleCount === 3 ? "View More" : "Show Less"} <ChevronRight className="w-4 h-4 ml-1" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
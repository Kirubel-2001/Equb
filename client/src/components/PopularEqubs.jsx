import { useEffect, useState } from "react";
/* eslint-disable-next-line no-unused-vars */
import { motion } from "framer-motion";
import { ChevronRight, UserPlus, X, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Helper for rendering stars
function renderStars(average) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Star
        key={i}
        fill={i <= average ? "#FBBF24" : "none"}
        stroke="#FBBF24"
        className="h-4 w-4 inline-block"
      />
    );
  }
  return stars;
}

// Skeleton Card for loading state
function EqubSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
          </div>
          <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
            <div className="h-4 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="flex justify-between text-sm">
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
            <div className="h-4 w-12 bg-gray-200 rounded"></div>
          </div>
          <div className="flex justify-between text-sm">
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
            <div className="h-4 w-10 bg-gray-200 rounded"></div>
          </div>
          <div className="flex items-center text-sm space-x-2">
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-4 w-8 bg-gray-200 rounded"></div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2"></div>
          </div>
        </div>
        <div className="mt-6 w-full bg-gray-200 h-10 rounded-lg"></div>
      </div>
    </div>
  );
}

// Spinner Component
function Spinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <svg
        className="animate-spin h-10 w-10 text-indigo-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
    </div>
  );
}

export default function PopularEqubs({
  searchTerm,
  activeCategory,
  amountFilter,
  locationFilter,
  isPublicView = false,
}) {
  const [activeEqubs, setActiveEqubs] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [joinStatus, setJoinStatus] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [participantsMap, setParticipantsMap] = useState({});
  const [ratingsMap, setRatingsMap] = useState({});
  const [loading, setLoading] = useState(true); // <-- loading state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEqubsAndDetails = async () => {
      setLoading(true); // start loading
      try {
        const response = await fetch("/api/equb/get-equbs");
        if (!response.ok) throw new Error("Failed to fetch Equbs");
        const equbsData = await response.json();
        setActiveEqubs(equbsData);

        const statusObj = {};
        const participantsPromises = [];
        const ratingsPromises = [];
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
          } catch (error) {}

          participantsPromises.push(
            fetch(`/api/participant/count/${equb._id}`)
              .then((res) =>
                res.ok
                  ? res.json()
                  : {
                      currentParticipants: 0,
                      totalParticipants: 1,
                      remainingSpots: 0,
                    }
              )
              .then((data) => ({
                equbId: equb._id,
                current: data.currentParticipants ?? 0,
                total: data.totalParticipants ?? 1,
                remaining: data.remainingSpots ?? 0,
              }))
              .catch(() => ({
                equbId: equb._id,
                current: 0,
                total: 1,
                remaining: 0,
              }))
          );

          ratingsPromises.push(
            fetch(`/api/rating/equb/${equb._id}`)
              .then((res) => (res.ok ? res.json() : []))
              .then((data) => {
                const ratingsArr = Array.isArray(data)
                  ? data
                  : data.ratings || [];
                let average = 0;
                if (ratingsArr.length > 0) {
                  const total = ratingsArr.reduce(
                    (acc, r) =>
                      acc +
                      (typeof r.rating === "number"
                        ? r.rating
                        : parseFloat(r.rating) || 0),
                    0
                  );
                  average = total / ratingsArr.length;
                }
                return {
                  equbId: equb._id,
                  average: average,
                  count: ratingsArr.length,
                };
              })
              .catch(() => ({
                equbId: equb._id,
                average: 0,
                count: 0,
              }))
          );
        }

        setJoinStatus(statusObj);

        const participantsResults = await Promise.all(participantsPromises);
        const ratingsResults = await Promise.all(ratingsPromises);

        const newParticipantsMap = {};
        for (const { equbId, current, total, remaining } of participantsResults) {
          newParticipantsMap[equbId] = {
            current,
            total,
            remaining,
          };
        }
        setParticipantsMap(newParticipantsMap);

        const newRatingsMap = {};
        for (const { equbId, average, count } of ratingsResults) {
          newRatingsMap[equbId] = { average, count };
        }
        setRatingsMap(newRatingsMap);
      } catch (error) {
        console.error("Error fetching Equbs:", error.message);
      } finally {
        setLoading(false); // done loading
      }
    };

    fetchEqubsAndDetails();
  }, []);

  // ... rest of your handlers and helpers here (unchanged) ...

  const handleJoinEqub = async (equbId) => {
    if (isPublicView) {
      navigate("/signin");
      return;
    }

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
        setJoinStatus((prev) => ({
          ...prev,
          [equbId]: {
            status: "Pending",
            message: "Join request sent successfully",
          },
        }));
      } else {
        setJoinStatus((prev) => ({
          ...prev,
          [equbId]: {
            status: data.status || "Error",
            message: data.message || "Error joining Equb",
          },
        }));
      }
    } catch {
      setJoinStatus((prev) => ({
        ...prev,
        [equbId]: {
          status: "Error",
          message: "Failed to join. Please try again.",
        },
      }));
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

  // Filter equbs based on search term, category, and amount filter - same as AllEqubs
  const filteredEqubs = activeEqubs.filter((equb) => {
    if (activeCategory !== "all" && equb.status !== activeCategory) return false;
    if (amountFilter.min && equb.amountPerPerson < Number(amountFilter.min)) return false;
    if (amountFilter.max && equb.amountPerPerson > Number(amountFilter.max)) return false;
    if (
      locationFilter &&
      !equb.location.toLowerCase().includes(locationFilter.toLowerCase())
    )
      return false;
    return (
      equb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equb.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equb.amountPerPerson.toString().includes(searchTerm)
    );
  });

  // Sort filteredEqubs by average rating descending
  const sortedEqubs = [...filteredEqubs].sort((a, b) => {
    const aRating = ratingsMap[a._id]?.average ?? 0;
    const bRating = ratingsMap[b._id]?.average ?? 0;
    return bRating - aRating;
  });

  // Display only the first visibleCount filtered Equbs
  const displayedEqubs = sortedEqubs.slice(0, visibleCount);

  return (
    <div className="bg-white">
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
        {/* Loading spinner or skeletons */}
        {loading ? (
          <>
            <Spinner />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <EqubSkeleton key={i} />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedEqubs.length > 0 ? (
                displayedEqubs.map((equb, index) => {
                  const participantData =
                    participantsMap[equb._id] ?? { current: 0, total: 1, remaining: 0 };
                  const participantCount = participantData.current;
                  const capacity = participantData.total;
                  const spotsLeft = participantData.remaining;
                  const percent =
                    capacity > 0 ? Math.round((participantCount / capacity) * 100) : 0;

                  const ratingData = ratingsMap[equb._id] || { average: 0, count: 0 };

                  return (
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
                            {spotsLeft} spots left
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Members:</span>
                            <span className="font-medium">{participantCount}</span>
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

                          {/* Ratings */}
                          <div className="flex items-center text-sm">
                            <span className="text-gray-600 mr-2">Rating:</span>
                            <span>
                              {renderStars(Math.round(ratingData.average))}
                            </span>
                            <span className="ml-2 text-xs text-gray-500">
                              ({ratingData.count})
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium">{percent}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{ width: `${percent}%` }}
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
                  );
                })
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-500">
                    No popular Equbs found matching your criteria.
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end pt-7">
              {filteredEqubs.length > 3 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-indigo-600 hover:text-indigo-500 flex items-center"
                  onClick={() => setVisibleCount(visibleCount === 3 ? 9 : 3)}
                >
                  {visibleCount === 3 ? "View More" : "Show Less"}{" "}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </motion.button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
/* eslint-disable-next-line no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, TrendingUp, Users, CheckCircle, X, Star } from "lucide-react";
import { SearchAndFilter } from "../../../components/ParticipantComponent/SearchAndFilter";
import { MyEqubsList } from "../../../components/ParticipantComponent/MyEqubsList";

export const MyEqubs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("created");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [equbs, setEqubs] = useState([]);

  // Toast notification state
  const [toast, setToast] = useState(null);

  // Search and filter states
  const [activeCategory, setActiveCategory] = useState("all");
  const [amountFilter, setAmountFilter] = useState({ min: "", max: "" });
  const [locationFilter, setLocationFilter] = useState("");

  // Stats summary
  const [stats, setStats] = useState({
    totalCreated: 0,
    activeCreated: 0,
    totalJoined: 0,
    nextDue: null,
  });

  // Clear toast after delay
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchEqubs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get created equbs
      const createdResponse = await fetch('/api/equb/my-equbs', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!createdResponse.ok) {
        throw new Error('Failed to fetch created equbs');
      }
      
      const createdEqubsData = await createdResponse.json();
      const createdEqubs = createdEqubsData.map(equb => ({
        ...equb,
        type: "created",
        isCreator: true
      }));
      
      // Get joined equbs
      const joinedResponse = await fetch('/api/participant/joined-equbs', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!joinedResponse.ok) {
        throw new Error('Failed to fetch joined equbs');
      }
      
      const joinedEqubsData = await joinedResponse.json();
      const joinedEqubs = joinedEqubsData.map(equb => ({
        ...equb,
        type: "joined",
        isCreator: false
      }));
      
      const allEqubs = [...createdEqubs, ...joinedEqubs];
      
      // Fetch ratings for all equbs
      const equbsWithRatings = await Promise.all(
        allEqubs.map(async (equb) => {
          try {
            // Get all ratings for the equb
            const ratingResponse = await fetch(`/api/rating/equb/${equb._id}`);
            let ratingData = { averageRating: 0, count: 0 };
            
            if (ratingResponse.ok) {
              ratingData = await ratingResponse.json();
            }
            
            // Get the user's rating for the equb
            const userRatingResponse = await fetch(`/api/rating/user/${equb._id}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              }
            });
            
            let userRating = 0;
            if (userRatingResponse.ok) {
              const userRatingData = await userRatingResponse.json();
              userRating = userRatingData.rating || 0;
            }
            
            return {
              ...equb,
              averageRating: ratingData.averageRating || 0,
              ratingCount: ratingData.count || 0,
              userRating: userRating
            };
          } catch (error) {
            console.error(`Error fetching rating for equb ${equb._id}:`, error);
            return equb;
          }
        })
      );
      
      setEqubs(equbsWithRatings);
      
      // Calculate stats
      const created = createdEqubs.length;
      const activeCreated = createdEqubs.filter(
        (e) => e.status === "active"
      ).length;
      const totalJoined = joinedEqubs.length;

      // Find next due equb
      const now = new Date();
      const upcoming = allEqubs
        .filter((e) => e.nextDueDate && new Date(e.nextDueDate) > now)
        .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));

      setStats({
        totalCreated: created,
        activeCreated: activeCreated,
        totalJoined,
        nextDue: upcoming.length > 0 ? upcoming[0] : null,
      });
    } catch (err) {
      console.error("Error fetching equbs:", err);
      setError("Failed to load your equbs. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEqubs();
  }, []);

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Handle equb deleted from the list
  const handleEqubDeleted = (deletedEqubId) => {
    // Remove the deleted equb from the state
    setEqubs(prevEqubs => prevEqubs.filter(equb => equb._id !== deletedEqubId));

    // Update stats
    setStats(prevStats => ({
      ...prevStats,
      totalCreated: prevStats.totalCreated - 1,
      // Only decrement active count if the deleted equb was active
      activeCreated: prevStats.activeCreated - 
        (equbs.find(e => e._id === deletedEqubId && e.status === 'active') ? 1 : 0)
    }));

    // Show success notification as a toast
    showToast("Equb deleted successfully");
  };

  // Handle equb updated from the list
  const handleEqubUpdated = () => {
    // Refetch all equbs to get the latest data
    fetchEqubs();

    // Show success notification as a toast
    showToast("Equb updated successfully");
  };

  // Handle rating submitted
  const handleRatingSubmitted = (equbId, rating) => {
    setEqubs(prevEqubs => prevEqubs.map(equb => {
      if (equb._id === equbId) {
        const totalRating = (equb.averageRating * equb.ratingCount) || 0;
        let newCount, newAverage;
        
        if (!equb.userRating) {
          // New rating
          newCount = (equb.ratingCount || 0) + 1;
          newAverage = (totalRating + rating) / newCount;
        } else {
          // Update existing rating
          newCount = equb.ratingCount || 1;
          newAverage = (totalRating - equb.userRating + rating) / newCount;
        }
        
        return {
          ...equb,
          userRating: rating,
          averageRating: newAverage,
          ratingCount: newCount
        };
      }
      return equb;
    }));
    
    showToast("Rating submitted successfully");
  };

  // Handle complaint submitted
  const handleComplaintSubmitted = (equbId) => {
    showToast("Complaint submitted successfully");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRemainingDays = (dateString) => {
    if (!dateString) return null;

    const now = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const getFilteredEqubs = () => {
    return equbs.filter(equb =>
      (activeTab === "all" || equb.type === activeTab) &&
      (searchTerm === "" ||
        equb.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (activeCategory === "all" || equb.status === activeCategory) &&
      (locationFilter === "" ||
        equb.location.toLowerCase().includes(locationFilter.toLowerCase())) &&
      (amountFilter.min === "" || equb.amount >= parseInt(amountFilter.min)) &&
      (amountFilter.max === "" || equb.amount <= parseInt(amountFilter.max))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 rounded-lg p-4 shadow-lg flex items-center ${
              toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
            ) : (
              <X className="h-5 w-5 mr-2 text-red-500" />
            )}
            <p>{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-6 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-2">My Equbs</h1>
          <p className="text-gray-600">
            Manage your created and joined Equb groups
          </p>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm text-gray-500 font-medium">
                  Total Created
                </span>
                <h3 className="text-2xl font-bold mt-1">
                  {stats.totalCreated}
                </h3>
              </div>
              <div className="bg-purple-100 p-2 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm text-gray-500 font-medium">
                  Active Created
                </span>
                <h3 className="text-2xl font-bold mt-1">
                  {stats.activeCreated}
                </h3>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm text-gray-500 font-medium">
                  Joined
                </span>
                <h3 className="text-2xl font-bold mt-1">{stats.totalJoined}</h3>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 font-medium">
                Next Due Payment
              </span>
              {stats.nextDue ? (
                <div className="mt-2">
                  <p className="font-medium text-sm">{stats.nextDue.name}</p>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-sm text-gray-700">
                      {formatDate(stats.nextDue.nextDueDate)}
                    </span>

                    {getRemainingDays(stats.nextDue.nextDueDate) && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        {getRemainingDays(stats.nextDue.nextDueDate)} days left
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">
                  No upcoming payments
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Row */}
        <SearchAndFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          amountFilter={amountFilter}
          setAmountFilter={setAmountFilter}
          locationFilter={locationFilter}
          setLocationFilter={setLocationFilter}
        />

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-6 border-b border-gray-200"
        >
          <div className="flex justify-center">
            <button
              onClick={() => setActiveTab("created")}
              className={`py-4 px-6 text-base font-medium transition relative mx-4 ${
                activeTab === "created"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Created By Me
            </button>
            <button
              onClick={() => setActiveTab("joined")}
              className={`py-4 px-6 text-base font-medium transition relative mx-4 ${
                activeTab === "joined"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Joined
            </button>
          </div>
        </motion.div>

        {/* Loading, Error and Equbs List */}
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-gray-200"></div>
            <p className="mt-2 text-gray-600">Loading your equbs...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => fetchEqubs()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : (
          <MyEqubsList
            equbs={getFilteredEqubs()}
            showAdminControls={true}
            onEqubDeleted={handleEqubDeleted}
            onEqubUpdated={handleEqubUpdated}
            onRatingSubmitted={handleRatingSubmitted}
            onComplaintSubmitted={handleComplaintSubmitted}
          />
        )}
      </div>
    </div>
  );
};
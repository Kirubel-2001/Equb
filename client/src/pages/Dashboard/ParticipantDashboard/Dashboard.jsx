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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulated API call
    const fetchEqubs = async () => {
      try {
        const response = await fetch("/api/equb/get-equbs");
        if (!response.ok) {
          throw new Error("Failed to fetch Equbs");
        }
        const data = await response.json();
        setEqubs(data);
      } catch (error) {
        console.error("Error fetching Equbs:", error.message);
      }
    };

    fetchEqubs();
  }, []);

  const handleJoinEqub = async (equbId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/participant/join/${equbId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setJoinStatus({
          ...joinStatus,
          [equbId]: { 
            status: 'Pending', 
            message: 'Join request sent successfully' 
          }
        });
      } else {
        // If the error is that user already joined
        if (data.status) {
          setJoinStatus({
            ...joinStatus,
            [equbId]: { 
              status: data.status, 
              message: data.message 
            }
          });
        } else {
          setJoinStatus({
            ...joinStatus,
            [equbId]: { 
              status: 'Error', 
              message: data.message 
            }
          });
        }
      }
    } catch (error) {
      console.error("Error joining Equb:", error);
      setJoinStatus({
        ...joinStatus,
        [equbId]: { 
          status: 'Error', 
          message: 'Failed to join. Please try again.' 
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEqubs = equbs.filter((equb) => {
    if (activeCategory !== "all" && equb.status !== activeCategory)
      return false;

    return (
      equb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equb.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getJoinButtonText = (equbId) => {
    if (loading) return "Processing...";
    
    const status = joinStatus[equbId]?.status;
    if (status === 'Pending') return "Pending";
    if (status === 'Accepted') return "Joined";
    if (status === 'Rejected') return "Rejected";
    
    return "Join";
  };

  const getJoinButtonStyle = (equbId) => {
    const status = joinStatus[equbId]?.status;
    
    if (status === 'Pending') {
      return "px-4 py-2 bg-yellow-500 text-white rounded-lg transition flex items-center";
    } else if (status === 'Accepted') {
      return "px-4 py-2 bg-green-600 text-white rounded-lg transition flex items-center";
    } else if (status === 'Rejected' || status === 'Error') {
      return "px-4 py-2 bg-red-600 text-white rounded-lg transition flex items-center";
    }
    
    return "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center";
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
                placeholder="Search Equbs by name or location..."
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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 p-3 border border-gray-100">
                  <h4 className="font-medium mb-2">Status</h4>
                  <div className="space-y-2">
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
                        value="active"
                        checked={activeCategory === "active"}
                        onChange={() => setActiveCategory("active")}
                      />
                      <span>Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="pending"
                        checked={activeCategory === "pending"}
                        onChange={() => setActiveCategory("pending")}
                      />
                      <span>Pending</span>
                    </label>
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
                          equb.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {equb.status === "active" ? "Active" : "Pending"}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-500 text-sm mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{equb.location}</span>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-3">
                      <div className="text-sm flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-1 text-blue-600" />
                        {equb.numberOfParticipants}/{equb.numberOfParticipants} members
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
                      <div className={`mt-2 text-sm ${
                        joinStatus[equb._id]?.status === 'Error' || 
                        joinStatus[equb._id]?.status === 'Rejected' 
                          ? 'text-red-600' 
                          : joinStatus[equb._id]?.status === 'Pending' 
                            ? 'text-yellow-600' 
                            : 'text-green-600'
                      }`}>
                        {joinStatus[equb._id]?.message}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <button className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition">
                      Details
                    </button>

                    <button 
                      className={getJoinButtonStyle(equb._id)}
                      onClick={() => handleJoinEqub(equb._id)}
                      disabled={loading || joinStatus[equb._id]?.status === 'Accepted' || joinStatus[equb._id]?.status === 'Pending'}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      {getJoinButtonText(equb._id)}
                    </button>
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
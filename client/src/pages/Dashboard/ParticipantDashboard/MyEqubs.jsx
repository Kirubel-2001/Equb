import React, { useState, useEffect } from "react";
/* eslint-disable-next-line no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Edit, 
  MapPin, 
  MoreVertical, 
  Plus, 
  Search, 
  Trash2, 
  TrendingUp, 
  Users 
} from "lucide-react";
import { Link } from "react-router-dom";

export const MyEqubs = () => {
  const [equbs, setEqubs] = useState([]);
  const [filteredEqubs, setFilteredEqubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("created");
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  // Stats summary
  const [stats, setStats] = useState({
    totalActive: 0,
    totalSaved: 0,
    nextDue: null,
    upcoming: []
  });

  useEffect(() => {
    // Simulate API call
    const fetchMyEqubs = () => {
      setTimeout(() => {
        const mockCreatedEqubs = [
          {
            id: 1,
            name: "Family Savings Circle",
            location: "Bole, Addis Ababa",
            members: 8,
            totalMembers: 10,
            amount: 2000,
            cycle: "Monthly",
            nextDueDate: "2025-04-15",
            totalCollected: 16000,
            status: "active",
            isCreator: true,
            progress: 40,
            winner: "Almaz Tadesse",
            type: "created"
          },
          {
            id: 2,
            name: "Office Weekly Fund",
            location: "Kirkos, Addis Ababa",
            members: 12,
            totalMembers: 12,
            amount: 500,
            cycle: "Weekly",
            nextDueDate: "2025-04-02",
            totalCollected: 6000,
            status: "active",
            isCreator: true,
            progress: 75,
            winner: "Bekele Mulatu",
            type: "created"
          },
          {
            id: 3,
            name: "Startup Capital Fund",
            location: "Kazanchis, Addis Ababa",
            members: 3,
            totalMembers: 5,
            amount: 5000,
            cycle: "Monthly",
            nextDueDate: null,
            totalCollected: 0,
            status: "pending",
            isCreator: true,
            progress: 0,
            winner: null,
            type: "created"
          }
        ];

        const mockJoinedEqubs = [
          {
            id: 4,
            name: "Neighborhood Iqub",
            location: "Mekanisa, Addis Ababa",
            members: 20,
            totalMembers: 20,
            amount: 1500,
            cycle: "Monthly",
            nextDueDate: "2025-04-10",
            totalCollected: 30000,
            status: "active",
            isCreator: false,
            creator: "Dawit Haile",
            progress: 60,
            winner: "Samrawit Lemma",
            type: "joined"
          },
          {
            id: 5,
            name: "Annual Big Saving",
            location: "Lideta, Addis Ababa",
            members: 15,
            totalMembers: 15,
            amount: 10000,
            cycle: "Yearly",
            nextDueDate: "2025-12-01",
            totalCollected: 150000,
            status: "active",
            isCreator: false,
            creator: "Yonas Tesfaye",
            progress: 25,
            winner: null,
            type: "joined"
          }
        ];

        const allEqubs = [...mockCreatedEqubs, ...mockJoinedEqubs];
        setEqubs(allEqubs);
        
        // Calculate stats
        const active = allEqubs.filter(e => e.status === "active").length;
        const totalSaved = allEqubs.reduce((acc, e) => acc + e.totalCollected, 0);
        
        // Find next due equb
        const now = new Date();
        const upcoming = allEqubs
          .filter(e => e.nextDueDate && new Date(e.nextDueDate) > now)
          .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));
        
        setStats({
          totalActive: active,
          totalSaved,
          nextDue: upcoming.length > 0 ? upcoming[0] : null,
          upcoming: upcoming.slice(0, 3)
        });
        
        setLoading(false);
      }, 800);
    };

    fetchMyEqubs();
  }, []);

  useEffect(() => {
    const filtered = equbs.filter(equb => {
      const matchesSearch = equb.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           equb.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || equb.status === filterStatus;
      const matchesTab = activeTab === "all" || equb.type === activeTab;
      
      return matchesSearch && matchesStatus && matchesTab;
    });
    
    setFilteredEqubs(filtered);
  }, [equbs, searchTerm, filterStatus, activeTab]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ET', { 
      style: 'currency', 
      currency: 'ETB',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRemainingDays = (dateString) => {
    if (!dateString) return null;
    
    const now = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const toggleDropdown = (id) => {
    if (dropdownOpen === id) {
      setDropdownOpen(null);
    } else {
      setDropdownOpen(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
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
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm text-gray-500 font-medium">Active Equbs</span>
                <h3 className="text-2xl font-bold mt-1">{stats.totalActive}</h3>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm text-gray-500 font-medium">Total Saved</span>
                <h3 className="text-2xl font-bold mt-1">{formatCurrency(stats.totalSaved)}</h3>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 font-medium">Next Due Payment</span>
              {stats.nextDue ? (
                <div className="mt-2">
                  <p className="font-medium text-sm">{stats.nextDue.name}</p>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-sm text-gray-700">{formatDate(stats.nextDue.nextDueDate)}</span>
                    
                    {getRemainingDays(stats.nextDue.nextDueDate) && 
                      <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        {getRemainingDays(stats.nextDue.nextDueDate)} days left
                      </span>
                    }
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">No upcoming payments</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between"
        >
          <div className="relative w-full md:w-auto md:flex-grow">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search your Equbs..."
              className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <select 
              className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition w-full md:w-auto"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>

            <Link to="/create-equb" className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm font-medium whitespace-nowrap">
              <Plus className="h-5 w-5" />
              <span>Create Equb</span>
            </Link>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-6 border-b border-gray-200"
        >
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("all")}
              className={`py-3 px-1 font-medium text-sm transition relative ${
                activeTab === "all"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              All Equbs
            </button>
            <button
              onClick={() => setActiveTab("created")}
              className={`py-3 px-1 font-medium text-sm transition relative ${
                activeTab === "created"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Created By Me
            </button>
            <button
              onClick={() => setActiveTab("joined")}
              className={`py-3 px-1 font-medium text-sm transition relative ${
                activeTab === "joined"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Joined
            </button>
          </div>
        </motion.div>

        {/* Equbs List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-4"
        >
          {loading ? (
            // Loading skeleton
            Array(3).fill().map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="flex justify-between mt-6">
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))
          ) : filteredEqubs.length > 0 ? (
            <AnimatePresence>
              {filteredEqubs.map((equb) => (
                <motion.div
                  key={equb.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center flex-wrap gap-2 mb-3">
                        <h3 className="text-lg font-bold">{equb.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          equb.status === "active" 
                            ? "bg-green-100 text-green-800" 
                            : equb.status === "pending" 
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}>
                          {equb.status.charAt(0).toUpperCase() + equb.status.slice(1)}
                        </span>
                        {equb.isCreator && (
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                            Creator
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                          <span>{equb.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-gray-500" />
                          <span>{equb.members}/{equb.totalMembers} members</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                          <span>{formatCurrency(equb.amount)} per {equb.cycle.toLowerCase()}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-500" />
                          <span>{equb.cycle} cycle</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-4 mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span className="font-medium">{equb.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${equb.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Next payment */}
                      {equb.nextDueDate && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                              <span className="font-medium">Next payment:</span>
                              <span className="ml-2">{formatDate(equb.nextDueDate)}</span>
                            </div>
                            
                            {getRemainingDays(equb.nextDueDate) && (
                              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                {getRemainingDays(equb.nextDueDate)} days left
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Current winner */}
                      {equb.winner && (
                        <div className="mt-3 text-sm">
                          <span className="font-medium">Current winner: </span>
                          <span className="text-green-700">{equb.winner}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:min-w-[160px]">
                      <Link 
                        to={`/equb/${equb.id}`}
                        className="px-4 py-2 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition w-full whitespace-nowrap"
                      >
                        View Details
                      </Link>
                      
                      <div className="relative">
                        <button 
                          onClick={() => toggleDropdown(equb.id)}
                          className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                        
                        {dropdownOpen === equb.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 p-1 border border-gray-100">
                            <button 
                              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-md transition"
                              onClick={() => {/* Handle edit */}}
                            >
                              <Edit className="h-4 w-4" />
                              <span>Edit</span>
                            </button>
                            <button 
                              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition"
                              onClick={() => {/* Handle delete */}}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <div className="mx-auto w-16 h-16 bg-gray-100 flex items-center justify-center rounded-full mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Equbs Found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? "We couldn't find any Equbs matching your search criteria."
                  : "You haven't created or joined any Equbs yet."}
              </p>
              <Link 
                to="/create-equb" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="h-5 w-5" />
                <span>Create Your First Equb</span>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

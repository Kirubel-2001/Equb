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
  Bell,
  Menu,
  User,
  LogOut,
  Home,
  Grid,
  PlusSquare,
  HelpCircle,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import EqubCard from "../../components/EqubCard";

export const ParticipantDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  /* eslint-disable-next-line no-unused-vars */
  const [notificationsCount, setNotificationsCount] = useState(3);
  const [activeCategory, setActiveCategory] = useState("all");
  const [equbs, setEqubs] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Simulated data for demo
  useEffect(() => {
    // Simulated API call
    const fetchEqubs = () => {
      const mockEqubs = [
        {
          id: 1,
          name: "Addis Weekly Savings",
          location: "Addis Ababa, Ethiopia",
          members: 12,
          totalMembers: 15,
          amount: 1000,
          cycle: "Weekly",
          createdBy: "Abebe Kebede",
          status: "active",
          createdAt: "2025-02-15",
        },
        {
          id: 2,
          name: "Merkato Traders Fund",
          location: "Merkato, Addis Ababa",
          members: 20,
          totalMembers: 20,
          amount: 2500,
          cycle: "Monthly",
          createdBy: "Tigist Hailu",
          status: "active",
          createdAt: "2025-01-10",
        },
        {
          id: 3,
          name: "Bahir Dar Community Saving",
          location: "Bahir Dar, Ethiopia",
          members: 8,
          totalMembers: 10,
          amount: 500,
          cycle: "Bi-weekly",
          createdBy: "Daniel Tessema",
          status: "pending",
          createdAt: "2025-03-01",
        },
        {
          id: 4,
          name: "Hawassa Friends Equb",
          location: "Hawassa, Ethiopia",
          members: 5,
          totalMembers: 12,
          amount: 1500,
          cycle: "Monthly",
          createdBy: "Yonas Mekonnen",
          status: "pending",
          createdAt: "2025-03-05",
        },
        {
          id: 5,
          name: "Neighborhood Savers",
          location: "Dire Dawa, Ethiopia",
          members: 15,
          totalMembers: 15,
          amount: 800,
          cycle: "Weekly",
          createdBy: "Rahel Solomon",
          status: "active",
          createdAt: "2025-02-20",
        },
        {
          id: 6,
          name: "University Alumni Equb",
          location: "Mekelle, Ethiopia",
          members: 25,
          totalMembers: 30,
          amount: 3000,
          cycle: "Monthly",
          createdBy: "Bereket Haile",
          status: "active",
          createdAt: "2025-01-25",
        },
      ];

      setEqubs(mockEqubs);
    };

    fetchEqubs();
  }, []);

  const filteredEqubs = equbs.filter((equb) => {
    if (activeCategory !== "all" && equb.status !== activeCategory)
      return false;

    return (
      equb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equb.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div
      onClick={() => setIsFilterOpen(!isFilterOpen)}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800 flex"
    >
      {/* Sidebar */}
      <motion.div
        initial={{ width: isSidebarOpen ? 240 : 72 }}
        animate={{ width: isSidebarOpen ? 240 : 72 }}
        transition={{ duration: 0.3 }}
        className="bg-white shadow-md z-20 fixed h-full"
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            {isSidebarOpen ? (
              <>
                <Link to="/">
                  <h2 className="text-xl font-bold text-blue-600">
                    Equb System
                  </h2>
                </Link>
                <button
                  onClick={toggleSidebar}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </>
            ) : (
              <button
                onClick={toggleSidebar}
                className="text-gray-500 hover:text-gray-700 mx-auto"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
          </div>

          <div
            className={`flex items-center gap-3 p-4 border-b pb-4 ${
              !isSidebarOpen && "justify-center"
            }`}
          >
            <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5" />
            </div>
            {isSidebarOpen && (
              <div>
                <h3 className="font-medium">Abebe Bekele</h3>
                <p className="text-sm text-gray-500">Member since Jan 2025</p>
              </div>
            )}
          </div>

          <div className="flex-1 py-4">
            <ul className="space-y-1">
              <li>
                <a
                  href="#"
                  className={`flex items-center ${
                    isSidebarOpen ? "px-4" : "justify-center px-2"
                  } py-3 text-blue-700 bg-blue-50 rounded-lg mx-2 font-medium`}
                >
                  <Home className="h-5 w-5 flex-shrink-0" />
                  {isSidebarOpen && <span className="ml-3">Dashboard</span>}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`flex items-center ${
                    isSidebarOpen ? "px-4" : "justify-center px-2"
                  } py-3 text-gray-600 hover:bg-gray-100 rounded-lg mx-2 transition`}
                >
                  <Grid className="h-5 w-5 flex-shrink-0" />
                  {isSidebarOpen && <span className="ml-3">My Equbs</span>}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`flex items-center ${
                    isSidebarOpen ? "px-4" : "justify-center px-2"
                  } py-3 text-gray-600 hover:bg-gray-100 rounded-lg mx-2 transition`}
                >
                  <PlusSquare className="h-5 w-5 flex-shrink-0" />
                  {isSidebarOpen && <span className="ml-3">Create Equb</span>}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`flex items-center ${
                    isSidebarOpen ? "px-4" : "justify-center px-2"
                  } py-3 text-gray-600 hover:bg-gray-100 rounded-lg mx-2 transition relative`}
                >
                  <Bell className="h-5 w-5 flex-shrink-0" />
                  {notificationsCount > 0 && (
                    <span className="absolute top-2 left-5 transform translate-x-1 -translate-y-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {notificationsCount}
                    </span>
                  )}
                  {isSidebarOpen && <span className="ml-3">Notifications</span>}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`flex items-center ${
                    isSidebarOpen ? "px-4" : "justify-center px-2"
                  } py-3 text-gray-600 hover:bg-gray-100 rounded-lg mx-2 transition`}
                >
                  <HelpCircle className="h-5 w-5 flex-shrink-0" />
                  {isSidebarOpen && <span className="ml-3">Help</span>}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`flex items-center ${
                    isSidebarOpen ? "px-4" : "justify-center px-2"
                  } py-3 text-gray-600 hover:bg-gray-100 rounded-lg mx-2 transition`}
                >
                  <Settings className="h-5 w-5 flex-shrink-0" />
                  {isSidebarOpen && <span className="ml-3">Settings</span>}
                </a>
              </li>
            </ul>
          </div>

          <div className="p-4 border-t">
            <a
              href="#"
              className={`flex items-center ${
                isSidebarOpen ? "px-4" : "justify-center px-2"
              } py-3 text-red-500 hover:bg-red-50 rounded-lg transition`}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {isSidebarOpen && <span className="ml-3">Log Out</span>}
            </a>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "ml-60" : "ml-20"
        } flex-1`}
      >
        <header className="bg-white shadow-sm sticky top-0 z-10 p-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell className="h-6 w-6 text-gray-500 hover:text-blue-600 cursor-pointer" />
              {notificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {notificationsCount}
                </span>
              )}
            </div>
          </div>
        </header>

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

              <button className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm font-medium">
                <PlusCircle className="h-5 w-5" />
                <span>Create Equb</span>
              </button>
            </div>
          </motion.div>

          {/* Popular Equbs Section */}

          {!isTyping && <EqubCard />}

          {/* All Equbs Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-4">All Equbs</h3>

            <div className="space-y-4">
              {filteredEqubs.length > 0 ? (
                filteredEqubs.map((equb) => (
                  <motion.div
                    key={equb.id}
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
                          {equb.members}/{equb.totalMembers} members
                        </div>

                        <div className="text-sm flex items-center text-gray-600">
                          <DollarSign className="h-4 w-4 mr-1 text-blue-600" />
                          {equb.amount} ETB
                        </div>

                        <div className="text-sm flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-1 text-blue-600" />
                          {equb.cycle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition">
                        Details
                      </button>

                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center">
                        <UserPlus className="h-4 w-4 mr-1" />
                        Join
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No Equbs found matching your criteria.
                  </p>
                  <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                    Create a new Equb
                  </button>
                </div>
              )}
            </div>
          </motion.section>

          <footer className="mt-12 pt-6 border-t border-gray-200">
            <div className="text-center text-gray-500 text-sm">
              <p>© 2025 Equb Management System. All rights reserved.</p>
              <div className="mt-2">
                <a href="#" className="text-blue-600 hover:underline mx-2">
                  Terms of Service
                </a>
                <a href="#" className="text-blue-600 hover:underline mx-2">
                  Privacy Policy
                </a>
                <a href="#" className="text-blue-600 hover:underline mx-2">
                  Contact Us
                </a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

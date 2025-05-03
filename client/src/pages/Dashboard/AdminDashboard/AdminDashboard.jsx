import React, { useState, useEffect } from "react";
/* eslint-disable-next-line no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Users,
  AlertTriangle,
  BarChart3,
  Search,
  Filter,
  ArrowDownUp,
  Bell,
  LogOut,
  PanelLeft,
  PanelLeftClose,
} from "lucide-react";
import Profile from "../../../components/Profile";

// Import the separated components
import {Dashboard} from "./Dashboard";
import {EqubsManagement} from "./Equbs";
import {UsersManagement} from "./Users";
import {ComplaintsManagement} from "./Complaints";

export const AdminDashboard = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState("dashboard");

  // State for sidebar collapse
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // State for equbs and users data
  const [equbs, setEqubs] = useState([]);
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [filterStatus, setFilterStatus] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(null);

  // Get auth token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const token = getToken();
        if (!token) {
          throw new Error("Authentication token not found");
        }
        
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };
        
        // Fetch equbs
        const equbsResponse = await fetch('/api/equb/get-equbs', {
          headers
        });
        
        if (!equbsResponse.ok) {
          throw new Error(`Error fetching equbs: ${equbsResponse.statusText}`);
        }
        
        const equbsData = await equbsResponse.json();
        
        // Fetch users
        const usersResponse = await fetch('/api/user', {
          headers
        });
        
        if (!usersResponse.ok) {
          throw new Error(`Error fetching users: ${usersResponse.statusText}`);
        }
        
        const usersData = await usersResponse.json();
        
        // Fetch complaints
        const complaintsResponse = await fetch('/api/complaint/all', {
          headers
        });
        
        if (!complaintsResponse.ok) {
          throw new Error(`Error fetching complaints: ${complaintsResponse.statusText}`);
        }
        
        const complaintsData = await complaintsResponse.json();
        
        // Transform data to match component expectations if needed
        const formattedEqubs = equbsData.map(equb => ({
          id: equb._id,
          name: equb.name,
          location: equb.location,
          creatorName: equb.creator?.firstName + ' ' + equb.creator?.lastName || 'Unknown',
          participants: equb.numberOfParticipants,
          amount: equb.amountPerPerson,
          cycle: equb.cycle,
          type: equb.equbType,
          status: equb.status,
          lastUpdated: new Date(equb.updatedAt).toISOString().split('T')[0],
        }));
        
        const formattedUsers = usersData.map(user => ({
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          equbsCreated: 0, // This would be calculated from another endpoint if available
          equbsJoined: 0, // This would be calculated from another endpoint if available
          status: "Active", // Assuming all users are active by default
          joinDate: new Date(user.createdAt).toISOString().split('T')[0],
        }));
        
        const formattedComplaints = complaintsData.map(complaint => ({
          id: complaint._id,
          equbName: complaint.equb.name || 'Unknown Equb',
          userName: complaint.user.firstName + ' ' + complaint.user.lastName || 'Unknown User',
          message: complaint.message,
          status: complaint.status,
          dateSubmitted: new Date(complaint.dateSubmitted).toISOString().split('T')[0],
        }));
        
        // Set sample notifications for now
        // In a real app, these would come from an API or websocket
        const sampleNotifications = [
          {
            id: 1,
            message: "New user registered",
            time: "2 hours ago",
          },
          {
            id: 2,
            message: "New complaint submitted",
            time: "1 day ago",
          },
          {
            id: 3,
            message: "Equb cycle completed",
            time: "3 days ago",
          }
        ];
        
        setEqubs(formattedEqubs);
        setUsers(formattedUsers);
        setComplaints(formattedComplaints);
        setNotifications(sampleNotifications);
        
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle sorting
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Handle actions
  const handleDeleteEqub = async (id) => {
    try {
      const token = getToken();
      const response = await fetch(`/api/equb/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete equb: ${response.statusText}`);
      }
      
      // Update state after successful deletion
      setEqubs(equbs.filter((equb) => equb.id !== id));
      
    } catch (err) {
      console.error("Error deleting equb:", err);
      // Show an error message to the user
    }
  };

  const handleRemoveUser = async (id) => {
    // Note: Your API doesn't seem to have a route for deleting users
    // This is a placeholder that just updates the UI
    // In a real app, you would add proper API call
    
    setUsers(users.filter((user) => user.id !== id));
  };

  const handleResolveComplaint = async (id) => {
    try {
      const token = getToken();
      const response = await fetch(`/api/complaint/${id}/resolve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to resolve complaint: ${response.statusText}`);
      }
      
      // Update state after successful resolution
      setComplaints(
        complaints.map((complaint) =>
          complaint.id === id ? { ...complaint, status: "Resolved" } : complaint
        )
      );
      
    } catch (err) {
      console.error("Error resolving complaint:", err);
      // Show an error message to the user
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.div
        className={`${
          sidebarCollapsed ? "w-20" : "w-64"
        } bg-gradient-to-b from-indigo-700 to-indigo-900 text-white transition-all duration-300 flex flex-col z-20`}
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 256 }}
      >
        <div
          className={`p-6 flex ${
            sidebarCollapsed ? "justify-center" : "justify-between"
          } items-center`}
        >
          {!sidebarCollapsed && (
            <h1 className="text-2xl font-bold tracking-tight">Equb Admin</h1>
          )}
          <button
            className="p-2 rounded-full hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50"
            onClick={toggleSidebar}
          >
            {sidebarCollapsed ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>
        </div>

        <nav className="mt-6 flex-1">
          <div
            className={`flex items-center px-6 py-3 cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-indigo-800 border-l-4 border-white"
                : "hover:bg-indigo-800"
            } transition-all`}
            onClick={() => setActiveTab("dashboard")}
          >
            <Home className="h-5 w-5 mr-3" />
            {!sidebarCollapsed && <span>Dashboard</span>}
          </div>

          <div
            className={`flex items-center px-6 py-3 cursor-pointer ${
              activeTab === "equbs"
                ? "bg-indigo-800 border-l-4 border-white"
                : "hover:bg-indigo-800"
            } transition-all`}
            onClick={() => setActiveTab("equbs")}
          >
            <BarChart3 className="h-5 w-5 mr-3" />
            {!sidebarCollapsed && <span>Equbs</span>}
          </div>

          <div
            className={`flex items-center px-6 py-3 cursor-pointer ${
              activeTab === "users"
                ? "bg-indigo-800 border-l-4 border-white"
                : "hover:bg-indigo-800"
            } transition-all`}
            onClick={() => setActiveTab("users")}
          >
            <Users className="h-5 w-5 mr-3" />
            {!sidebarCollapsed && <span>Users</span>}
          </div>

          <div
            className={`flex items-center px-6 py-3 cursor-pointer ${
              activeTab === "complaints"
                ? "bg-indigo-800 border-l-4 border-white"
                : "hover:bg-indigo-800"
            } transition-all`}
            onClick={() => setActiveTab("complaints")}
          >
            <AlertTriangle className="h-5 w-5 mr-3" />
            {!sidebarCollapsed && <span>Complaints</span>}
          </div>
        </nav>

        <div className="p-6">
          <div
            className="flex items-center text-indigo-200 hover:text-white cursor-pointer mb-4"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <div className="relative">
              <Bell className="h-5 w-5 mr-3" />
              {notifications.length > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {notifications.length}
                </div>
              )}
            </div>
            {!sidebarCollapsed && <span>Notifications</span>}
          </div>
          <div className="flex items-center text-indigo-200 hover:text-white cursor-pointer">
            <LogOut className="h-5 w-5 mr-3" />
            {!sidebarCollapsed && <span>Logout</span>}
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10 sticky top-0">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold text-gray-800 ml-2">
                {activeTab === "dashboard" && "Dashboard"}
                {activeTab === "equbs" && "Manage Equbs"}
                {activeTab === "users" && "User Management"}
                {activeTab === "complaints" && "Complaints Management"}
              </h2>
            </div>

            <div className="flex items-center space-x-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-gray-100 rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Profile />
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="relative">
                <div className="absolute animate-ping h-12 w-12 rounded-full bg-indigo-400 opacity-75"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* Dashboard */}
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Dashboard 
                    equbs={equbs} 
                    users={users} 
                    complaints={complaints} 
                  />
                </motion.div>
              )}

              {/* Equbs Management */}
              {activeTab === "equbs" && (
                <motion.div
                  key="equbs"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <EqubsManagement 
                    equbs={equbs}
                    searchTerm={searchTerm}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    sortConfig={sortConfig}
                    requestSort={requestSort}
                    handleDeleteEqub={handleDeleteEqub}
                  />
                </motion.div>
              )}

              {/* Users Management */}
              {activeTab === "users" && (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <UsersManagement 
                    users={users}
                    searchTerm={searchTerm}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    sortConfig={sortConfig}
                    requestSort={requestSort}
                    handleRemoveUser={handleRemoveUser}
                  />
                </motion.div>
              )}

              {/* Complaints */}
              {activeTab === "complaints" && (
                <motion.div
                  key="complaints"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ComplaintsManagement 
                    complaints={complaints}
                    searchTerm={searchTerm}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    sortConfig={sortConfig}
                    handleResolveComplaint={handleResolveComplaint}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Click outside handler for notifications and dropdowns */}
      {(showNotifications || showDropdown) && (
        <div
          className="fixed inset-0 bg-transparent z-10"
          onClick={() => {
            setShowNotifications(false);
            setShowDropdown(false);
          }}
        />
      )}
      
      {/* Notifications panel */}
      {showNotifications && (
        <div className="absolute top-16 right-6 bg-white rounded-md shadow-lg w-72 z-30 overflow-hidden">
          <div className="p-3 bg-indigo-600 text-white font-medium">
            Notifications
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No new notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                >
                  <p className="text-gray-800">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {notification.time}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
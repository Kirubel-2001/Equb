import React, { useState, useEffect } from "react";
/* eslint-disable-next-line no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Home,
  AlertTriangle,
  BarChart3,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  Filter,
  ArrowDownUp,
  Bell,
  LogOut,
  ChevronRight,
  Eye,
  DollarSign,
  User,
  X,
  PanelLeft,
  PanelLeftClose
} from "lucide-react";
import Profile from "../../../components/Profile";

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

  // Mock data for demonstration
  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => {
      setEqubs([
        { id: 1, name: "Weekly Savers", location: "Addis Ababa", creatorName: "Abebe Kebede", participants: 10, amount: 1000, cycle: "Weekly", type: "Automatic", status: "Active", lastUpdated: "2025-03-20" },
        { id: 2, name: "Monthly Investors", location: "Bahir Dar", creatorName: "Tigist Haile", participants: 12, amount: 5000, cycle: "Monthly", type: "Manual", status: "Pending", lastUpdated: "2025-03-18" },
        { id: 3, name: "Quarterly Fund", location: "Hawassa", creatorName: "Daniel Bekele", participants: 8, amount: 10000, cycle: "Quarterly", type: "Automatic", status: "Completed", lastUpdated: "2025-03-15" },
        { id: 4, name: "Family Savings", location: "Dire Dawa", creatorName: "Selam Alemu", participants: 6, amount: 2000, cycle: "Monthly", type: "Automatic", status: "Active", lastUpdated: "2025-03-22" },
        { id: 5, name: "Business Group", location: "Mekelle", creatorName: "Yonas Tadesse", participants: 15, amount: 7500, cycle: "Monthly", type: "Manual", status: "Active", lastUpdated: "2025-03-19" },
      ]);
      
      setUsers([
        { id: 1, firstName: "Abebe", lastName: "Kebede", email: "abebe@example.com", role: "Participant", equbsCreated: 2, equbsJoined: 1, status: "Active", joinDate: "2025-01-15" },
        { id: 2, firstName: "Tigist", lastName: "Haile", email: "tigist@example.com", role: "Participant", equbsCreated: 1, equbsJoined: 3, status: "Active", joinDate: "2025-02-10" },
        { id: 3, firstName: "Daniel", lastName: "Bekele", email: "daniel@example.com", role: "Participant", equbsCreated: 1, equbsJoined: 2, status: "Inactive", joinDate: "2025-01-20" },
        { id: 4, firstName: "Selam", lastName: "Alemu", email: "selam@example.com", role: "Participant", equbsCreated: 1, equbsJoined: 0, status: "Active", joinDate: "2025-03-05" },
        { id: 5, firstName: "Yonas", lastName: "Tadesse", email: "yonas@example.com", role: "Participant", equbsCreated: 1, equbsJoined: 4, status: "Active", joinDate: "2025-02-28" },
      ]);
      
      setComplaints([
        { id: 1, equbName: "Weekly Savers", userName: "Tigist Haile", message: "Payment not registered correctly. I made the payment on Monday but it's still showing as unpaid in the system.", status: "Pending", dateSubmitted: "2025-03-20" },
        { id: 2, equbName: "Monthly Investors", userName: "Daniel Bekele", message: "Winner announcement delayed for this month's cycle. It's already been a week past the scheduled date.", status: "Resolved", dateSubmitted: "2025-03-15" },
        { id: 3, equbName: "Weekly Savers", userName: "Abebe Kebede", message: "Unable to view past payments in my account history. The payment records for February are missing.", status: "Pending", dateSubmitted: "2025-03-22" },
        { id: 4, equbName: "Family Savings", userName: "Selam Alemu", message: "The system incorrectly calculated my contribution amount. It should be 2000 Birr but it's showing 2500 Birr.", status: "Pending", dateSubmitted: "2025-03-23" },
        { id: 5, equbName: "Business Group", userName: "Yonas Tadesse", message: "My profile information is incorrect. My phone number needs to be updated.", status: "Resolved", dateSubmitted: "2025-03-21" },
      ]);
      
      setNotifications([
        { id: 1, message: "New user registered: Selam Alemu", time: "2 hours ago" },
        { id: 2, message: "New complaint submitted from Tigist Haile", time: "1 day ago" },
        { id: 3, message: "Equb cycle completed: Weekly Savers", time: "3 days ago" },
        { id: 4, message: "Monthly report generated", time: "5 days ago" },
        { id: 5, message: "System maintenance scheduled for tomorrow", time: "1 week ago" },
      ]);
      
      setIsLoading(false);
    }, 1000);
  }, []);

  // Handle sorting
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Get sorted data based on config
  const getSortedData = (data) => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  };

  // Filter data based on search term and status
  const getFilteredEqubs = () => {
    return getSortedData(equbs).filter((equb) => {
      const matchesSearch = 
        equb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equb.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equb.creatorName.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesFilter = filterStatus === "all" || equb.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    });
  };
  
  const getFilteredUsers = () => {
    return getSortedData(users).filter((user) => {
      return (
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  };
  
  const getFilteredComplaints = () => {
    return getSortedData(complaints).filter((complaint) => {
      const matchesSearch = 
        complaint.equbName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.message.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesFilter = filterStatus === "all" || complaint.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    });
  };

  // Handle actions
  const handleDeleteEqub = (id) => {
    setEqubs(equbs.filter(equb => equb.id !== id));
  };
  
  const handleRemoveUser = (id) => {
    setUsers(users.filter(user => user.id !== id));
  };
  
  const handleResolveComplaint = (id) => {
    setComplaints(
      complaints.map(complaint => 
        complaint.id === id 
          ? { ...complaint, status: "Resolved" } 
          : complaint
      )
    );
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Stats for dashboard
  const activeEqubs = equbs.filter(equb => equb.status === "Active").length;
  const totalParticipants = users.length;
  const pendingComplaints = complaints.filter(complaint => complaint.status === "Pending").length;
  const totalAmount = equbs.reduce((sum, equb) => sum + equb.amount * equb.participants, 0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.div 
        className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-indigo-700 to-indigo-900 text-white transition-all duration-300 flex flex-col z-20`}
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 256 }}
      >
        <div className={`p-6 flex ${sidebarCollapsed ? 'justify-center' : 'justify-between'} items-center`}>
          {!sidebarCollapsed && (
            <h1 className="text-2xl font-bold tracking-tight">Equb Admin</h1>
          )}
          <button 
            className="p-2 rounded-full hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50"
            onClick={toggleSidebar}
          >
            {sidebarCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
        </div>
        
        <nav className="mt-6 flex-1">
          <div 
            className={`flex items-center px-6 py-3 cursor-pointer ${activeTab === "dashboard" ? "bg-indigo-800 border-l-4 border-white" : "hover:bg-indigo-800"} transition-all`}
            onClick={() => setActiveTab("dashboard")}
          >
            <Home className="h-5 w-5 mr-3" />
            {!sidebarCollapsed && <span>Dashboard</span>}
          </div>
          
          <div 
            className={`flex items-center px-6 py-3 cursor-pointer ${activeTab === "equbs" ? "bg-indigo-800 border-l-4 border-white" : "hover:bg-indigo-800"} transition-all`}
            onClick={() => setActiveTab("equbs")}
          >
            <BarChart3 className="h-5 w-5 mr-3" />
            {!sidebarCollapsed && <span>Equbs</span>}
          </div>
          
          <div 
            className={`flex items-center px-6 py-3 cursor-pointer ${activeTab === "users" ? "bg-indigo-800 border-l-4 border-white" : "hover:bg-indigo-800"} transition-all`}
            onClick={() => setActiveTab("users")}
          >
            <Users className="h-5 w-5 mr-3" />
            {!sidebarCollapsed && <span>Users</span>}
          </div>
          
          <div 
            className={`flex items-center px-6 py-3 cursor-pointer ${activeTab === "complaints" ? "bg-indigo-800 border-l-4 border-white" : "hover:bg-indigo-800"} transition-all`}
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
              
              <Profile/>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="p-6 pb-0">
                        <div className="flex items-center">
                          <div className="rounded-lg p-3 bg-gradient-to-br from-indigo-100 to-indigo-200">
                            <BarChart3 className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <h3 className="text-gray-500 text-sm">Active Equbs</h3>
                            <p className="text-2xl font-semibold">{activeEqubs}</p>
                          </div>
                        </div>
                      </div>
                      <div className="h-2 bg-gradient-to-r from-indigo-400 to-indigo-600 mt-6"></div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="p-6 pb-0">
                        <div className="flex items-center">
                          <div className="rounded-lg p-3 bg-gradient-to-br from-green-100 to-green-200">
                            <Users className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="ml-4">
                            <h3 className="text-gray-500 text-sm">Total Users</h3>
                            <p className="text-2xl font-semibold">{totalParticipants}</p>
                          </div>
                        </div>
                      </div>
                      <div className="h-2 bg-gradient-to-r from-green-400 to-green-600 mt-6"></div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="p-6 pb-0">
                        <div className="flex items-center">
                          <div className="rounded-lg p-3 bg-gradient-to-br from-red-100 to-red-200">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                          </div>
                          <div className="ml-4">
                            <h3 className="text-gray-500 text-sm">Pending Complaints</h3>
                            <p className="text-2xl font-semibold">{pendingComplaints}</p>
                          </div>
                        </div>
                      </div>
                      <div className="h-2 bg-gradient-to-r from-red-400 to-red-600 mt-6"></div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="p-6 pb-0">
                        <div className="flex items-center">
                          <div className="rounded-lg p-3 bg-gradient-to-br from-purple-100 to-purple-200">
                            <DollarSign className="h-6 w-6 text-purple-600" />
                          </div>
                          <div className="ml-4">
                            <h3 className="text-gray-500 text-sm">Total Amount</h3>
                            <p className="text-2xl font-semibold">{totalAmount.toLocaleString()} Birr</p>
                          </div>
                        </div>
                      </div>
                      <div className="h-2 bg-gradient-to-r from-purple-400 to-purple-600 mt-6"></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="text-lg font-semibold text-gray-800">Recent Equbs</h3>
                        <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                          <span>View All</span>
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </a>
                      </div>
                      
                      <div className="divide-y">
                        {equbs.slice(0, 5).map(equb => (
                          <div key={equb.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-600 font-bold">
                                {equb.name.charAt(0)}
                              </div>
                              <div className="ml-3">
                                <h4 className="font-medium text-gray-900">{equb.name}</h4>
                                <p className="text-sm text-gray-500">{equb.location} • {equb.participants} members</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                equb.status === "Active" ? "bg-green-100 text-green-800" :
                                equb.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                                "bg-gray-100 text-gray-800"
                              }`}>
                                {equb.status}
                              </span>
                              <span className="text-xs text-gray-500 mt-1">{equb.lastUpdated}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="text-lg font-semibold text-gray-800">Recent Complaints</h3>
                        <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                          <span>View All</span>
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </a>
                      </div>
                      
                      <div className="divide-y">
                        {complaints.slice(0, 5).map(complaint => (
                          <div key={complaint.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center text-red-600 font-bold">
                                  {complaint.userName.charAt(0)}
                                </div>
                                <div className="ml-3">
                                  <h4 className="font-medium text-gray-900">{complaint.userName}</h4>
                                  <p className="text-xs text-gray-500">{complaint.equbName} • {complaint.dateSubmitted}</p>
                                </div>
                              </div>
                              <span className={`px-2 py-1 h-6 rounded-full text-xs flex items-center ${
                                complaint.status === "Pending" ? "bg-yellow-100 text-yellow-800" : 
                                "bg-green-100 text-green-800"
                              }`}>
                                {complaint.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mt-2 line-clamp-2">{complaint.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b">
                      <h3 className="text-lg font-semibold text-gray-800">Recent Users</h3>
                      <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                        <span>View All</span>
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </a>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equbs</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.slice(0, 5).map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-600 font-bold">
                                    {user.firstName.charAt(0)}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{user.joinDate}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">Created: {user.equbsCreated} • Joined: {user.equbsJoined}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  user.status === "Active" ? "bg-green-100 text-green-800" : 
                                  "bg-gray-100 text-gray-800"
                                }`}>
                                  {user.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
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
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                    <div className="p-4 border-b flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-800">All Equbs</h3>
                      <div className="flex items-center space-x-3">
                        <div className="relative group">
                          <button className="flex items-center space-x-2 bg-white border rounded-md px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors">
                            <Filter className="h-4 w-4" />
                            <span>Filter Status</span>
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
                            <div className="py-1">
                              <div 
                                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${filterStatus === "all" ? "bg-indigo-50 text-indigo-700 font-medium" : ""}`} 
                                onClick={() => setFilterStatus("all")}
                              >
                                All Equbs
                              </div>
                              <div 
                                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${filterStatus === "Active" ? "bg-indigo-50 text-indigo-700 font-medium" : ""}`} 
                                onClick={() => setFilterStatus("Active")}
                              >
                                Active
                              </div>
                              <div 
                                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${filterStatus === "Pending" ? "bg-indigo-50 text-indigo-700 font-medium" : ""}`} 
                                onClick={() => setFilterStatus("Pending")}
                              >
                                Pending
                              </div>
                              <div 
                                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${filterStatus === "Completed" ? "bg-indigo-50 text-indigo-700 font-medium" : ""}`} 
                                onClick={() => setFilterStatus("Completed")}
                              >
                                Completed
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th 
                              className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => requestSort('name')}
                            >
                              <div className="flex items-center">
                                <span>Name</span>
                                <div className={`ml-1.5 transition-colors ${sortConfig.key === 'name' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                                  <ArrowDownUp className="h-3.5 w-3.5" />
                                </div>
                              </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Location
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Creator
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Members
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Cycle
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {getFilteredEqubs().map((equb) => (
                            <tr key={equb.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{equb.name}</div>
                                <div className="text-xs text-gray-500">ID: {equb.id}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{equb.location}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{equb.creatorName}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{equb.participants}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{equb.amount.toLocaleString()} Birr</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{equb.cycle}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  equb.status === "Active" ? "bg-green-100 text-green-800" :
                                  equb.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                                  "bg-gray-100 text-gray-800"
                                }`}>
                                  {equb.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                <div className="flex justify-center space-x-2">
                                  <button className="text-indigo-600 hover:text-indigo-900 transition-colors">
                                    <Eye className="h-5 w-5" />
                                  </button>
                                  <button className="text-blue-600 hover:text-blue-900 transition-colors">
                                    <Edit className="h-5 w-5" />
                                  </button>
                                  <button 
                                    className="text-red-600 hover:text-red-900 transition-colors"
                                    onClick={() => handleDeleteEqub(equb.id)}
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {getFilteredEqubs().length === 0 && (
                      <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                          <BarChart3 className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No Equbs Found</h3>
                        <p className="text-gray-500">No Equbs match your search criteria</p>
                      </div>
                    )}
                  </div>
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
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-800">All Users</h3>
                      <div className="flex items-center space-x-3">
                        <div className="relative group">
                          <button className="flex items-center space-x-2 bg-white border rounded-md px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors">
                            <Filter className="h-4 w-4" />
                            <span>Filter Status</span>
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
                            <div className="py-1">
                              <div 
                                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${filterStatus === "all" ? "bg-indigo-50 text-indigo-700 font-medium" : ""}`} 
                                onClick={() => setFilterStatus("all")}
                              >
                                All Users
                              </div>
                              <div 
                                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${filterStatus === "Active" ? "bg-indigo-50 text-indigo-700 font-medium" : ""}`} 
                                onClick={() => setFilterStatus("Active")}
                              >
                                Active
                              </div>
                              <div 
                                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${filterStatus === "Inactive" ? "bg-indigo-50 text-indigo-700 font-medium" : ""}`} 
                                onClick={() => setFilterStatus("Inactive")}
                              >
                                Inactive
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th 
                              className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => requestSort('firstName')}
                            >
                              <div className="flex items-center">
                                <span>Name</span>
                                <div className={`ml-1.5 transition-colors ${sortConfig.key === 'firstName' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                                  <ArrowDownUp className="h-3.5 w-3.5" />
                                </div>
                              </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Join Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Equbs
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {getFilteredUsers().map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-600 font-bold">
                                    {user.firstName.charAt(0)}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                                    <div className="text-xs text-gray-500">ID: {user.id}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{user.role}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{user.joinDate}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  <span className="font-medium">{user.equbsCreated}</span> Created
                                  <span className="mx-1">•</span>
                                  <span className="font-medium">{user.equbsJoined}</span> Joined
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  user.status === "Active" ? "bg-green-100 text-green-800" : 
                                  "bg-gray-100 text-gray-800"
                                }`}>
                                  {user.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                <div className="flex justify-center space-x-2">
                                  <button className="text-indigo-600 hover:text-indigo-900 transition-colors">
                                    <Eye className="h-5 w-5" />
                                  </button>
                                  <button className="text-blue-600 hover:text-blue-900 transition-colors">
                                    <Edit className="h-5 w-5" />
                                  </button>
                                  <button 
                                    className="text-red-600 hover:text-red-900 transition-colors"
                                    onClick={() => handleRemoveUser(user.id)}
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {getFilteredUsers().length === 0 && (
                      <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                          <Users className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No Users Found</h3>
                        <p className="text-gray-500">No users match your search criteria</p>
                      </div>
                    )}
                  </div>
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
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-800">All Complaints</h3>
                      <div className="flex items-center space-x-3">
                        <div className="relative group">
                          <button className="flex items-center space-x-2 bg-white border rounded-md px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors">
                            <Filter className="h-4 w-4" />
                            <span>Filter Status</span>
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
                            <div className="py-1">
                              <div 
                                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${filterStatus === "all" ? "bg-indigo-50 text-indigo-700 font-medium" : ""}`} 
                                onClick={() => setFilterStatus("all")}
                              >
                                All Complaints
                              </div>
                              <div 
                                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${filterStatus === "Pending" ? "bg-indigo-50 text-indigo-700 font-medium" : ""}`} 
                                onClick={() => setFilterStatus("Pending")}
                              >
                                Pending
                              </div>
                              <div 
                                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${filterStatus === "Resolved" ? "bg-indigo-50 text-indigo-700 font-medium" : ""}`} 
                                onClick={() => setFilterStatus("Resolved")}
                              >
                                Resolved
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="divide-y">
                      {getFilteredComplaints().map((complaint) => (
                        <div key={complaint.id} className="p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center text-red-600 font-bold">
                                {complaint.userName.charAt(0)}
                              </div>
                              <div className="ml-4">
                                <h4 className="font-medium text-gray-900">{complaint.userName}</h4>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                  <span>{complaint.equbName}</span>
                                  <span className="mx-1.5">•</span>
                                  <span>{complaint.dateSubmitted}</span>
                                </div>
                              </div>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              complaint.status === "Pending" ? "bg-yellow-100 text-yellow-800" : 
                              "bg-green-100 text-green-800"
                            }`}>
                              {complaint.status}
                            </span>
                          </div>
                          <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-700">{complaint.message}</p>
                          </div>
                          
                          {complaint.status === "Pending" && (
                            <div className="mt-4 flex justify-end">
                              <button 
                                className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2 rounded-md text-sm hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 flex items-center shadow-sm transition-all"
                                onClick={() => handleResolveComplaint(complaint.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Resolved
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {getFilteredComplaints().length === 0 && (
                      <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                          <AlertTriangle className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No Complaints Found</h3>
                        <p className="text-gray-500">No complaints match your search criteria</p>
                      </div>
                    )}
                  </div>
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
    </div>
  );
};

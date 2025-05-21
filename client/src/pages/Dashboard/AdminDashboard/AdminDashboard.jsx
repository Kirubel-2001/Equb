import React, { useState, useEffect } from "react";
/* eslint-disable-next-line no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Users,
  AlertTriangle,
  BarChart3,
  Search,
  PanelLeft,
  PanelLeftClose,
} from "lucide-react";
import Profile from "../../../components/Profile";

// Import the separated components
import { Dashboard } from "./Dashboard";
import { EqubsManagement } from "./Equbs";
import { UsersManagement } from "./Users";
import { ComplaintsManagement } from "./Complaints";

// Key for localStorage to persist activeTab
const ACTIVE_TAB_KEY = "adminDashboardActiveTab";

export const AdminDashboard = () => {
  // --- Persistent Active Tab ---
  const getInitialTab = () => {
    // Default to dashboard if nothing is saved
    return localStorage.getItem(ACTIVE_TAB_KEY) || "dashboard";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());

  // Persist activeTab to localStorage
  useEffect(() => {
    localStorage.setItem(ACTIVE_TAB_KEY, activeTab);
  }, [activeTab]);

  // Sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Data states
  const [equbs, setEqubs] = useState([]);
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [filterStatus, setFilterStatus] = useState("all");
  const [error, setError] = useState(null);

  // Auth
  const getToken = () => localStorage.getItem("token");

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = getToken();
        if (!token) throw new Error("Authentication token not found");

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        // Equbs
        const equbsResponse = await fetch("/api/equb/get-equbs", { headers });
        if (!equbsResponse.ok)
          throw new Error(`Error fetching equbs: ${equbsResponse.statusText}`);
        const equbsData = await equbsResponse.json();

        // Users
        const usersResponse = await fetch("/api/user", { headers });
        if (!usersResponse.ok)
          throw new Error(`Error fetching users: ${usersResponse.statusText}`);
        const usersData = await usersResponse.json();

        // Complaints
        const complaintsResponse = await fetch("/api/complaint/all", {
          headers,
        });
        if (!complaintsResponse.ok)
          throw new Error(
            `Error fetching complaints: ${complaintsResponse.statusText}`
          );
        const complaintsData = await complaintsResponse.json();

        // Format data
        const formattedEqubs = equbsData.map((equb) => ({
          id: equb._id,
          name: equb.name,
          location: equb.location,
          creatorName:
            (equb.creator?.firstName || "") +
              " " +
              (equb.creator?.lastName || "") || "Unknown",
          participants: equb.numberOfParticipants,
          amount: equb.amountPerPerson,
          cycle: equb.cycle,
          type: equb.equbType,
          status: equb.status,
          lastUpdated: new Date(equb.updatedAt).toISOString().split("T")[0],
        }));

        const formattedUsers = usersData.map((user) => ({
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          equbsCreated: 0,
          equbsJoined: 0,
          status: "Active",
          joinDate: new Date(user.createdAt).toISOString().split("T")[0],
        }));

        const formattedComplaints = complaintsData.map((complaint) => ({
          id: complaint._id,
          equbName: complaint.equb?.name || "Unknown Equb",
          userName:
            (complaint.user?.firstName || "") +
              " " +
              (complaint.user?.lastName || "") || "Unknown User",
          message: complaint.message,
          status: complaint.status,
          dateSubmitted: new Date(complaint.dateSubmitted)
            .toISOString()
            .split("T")[0],
        }));

        setEqubs(formattedEqubs);
        setUsers(formattedUsers);
        setComplaints(formattedComplaints);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sorting
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Equb delete
  const handleDeleteEqub = async (id) => {
    try {
      const token = getToken();
      const response = await fetch(`/api/equb/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to delete equb: ${response.statusText}`);
      }
      setEqubs(equbs.filter((equb) => equb.id !== id));
    } catch (err) {
      console.error("Error deleting equb:", err);
    }
  };

  // Remove user (UI only)
  const handleRemoveUser = async (id) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  // Resolve complaint
  const handleResolveComplaint = async (id) => {
    try {
      const token = getToken();
      const response = await fetch(`/api/complaint/${id}/resolve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to resolve complaint: ${response.statusText}`);
      }
      setComplaints(
        complaints.map((complaint) =>
          complaint.id === id
            ? { ...complaint, status: "Resolved" }
            : complaint
        )
      );
    } catch (err) {
      console.error("Error resolving complaint:", err);
    }
  };

  // Sidebar collapse
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Fixed with white background */}
      <motion.div
        className={`fixed top-0 left-0 h-screen ${
          sidebarCollapsed ? "w-20" : "w-64"
        } bg-white text-gray-800 transition-all duration-300 flex flex-col z-30 shadow-md`}
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 256 }}
        style={{ minHeight: "100vh" }}
      >
        <div
          className={`p-6 flex ${
            sidebarCollapsed ? "justify-center" : "justify-between"
          } items-center border-b border-gray-100`}
        >
          {!sidebarCollapsed && (
            <h1 className="text-2xl font-bold tracking-tight text-indigo-700">Equb Admin</h1>
          )}
          <button
            className="p-2 rounded-full text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50"
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
          {[
            {
              key: "dashboard",
              label: "Dashboard",
              icon: <Home className="h-5 w-5 mr-3" />,
            },
            {
              key: "equbs",
              label: "Equbs",
              icon: <BarChart3 className="h-5 w-5 mr-3" />,
            },
            {
              key: "users",
              label: "Users",
              icon: <Users className="h-5 w-5 mr-3" />,
            },
            {
              key: "complaints",
              label: "Complaints",
              icon: <AlertTriangle className="h-5 w-5 mr-3" />,
            },
          ].map((tab) => (
            <div
              key={tab.key}
              className={`flex items-center px-6 py-3 cursor-pointer ${
                activeTab === tab.key
                  ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-700"
                  : "hover:bg-gray-50 text-gray-600 hover:text-indigo-600"
              } transition-all`}
              onClick={() => setActiveTab(tab.key)}
            >
              <div className={activeTab === tab.key ? "text-indigo-700" : "text-gray-500"}>
                {tab.icon}
              </div>
              {!sidebarCollapsed && <span>{tab.label}</span>}
            </div>
          ))}
        </nav>
      </motion.div>

      {/* Main Content - Pad left for sidebar */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        {/* Header */}
        <header className="bg-white shadow-sm z-10 sticky top-0">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold text-gray-800 ml-2">
                {{
                  dashboard: "Dashboard",
                  equbs: "Manage Equbs",
                  users: "User Management",
                  complaints: "Complaints Management",
                }[activeTab]}
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
                    searchTerm={searchTerm}
                    users={users}
                    complaints={complaints}
                    setActiveTab={setActiveTab}
                  />
                </motion.div>
              )}
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
    </div>
  );
};
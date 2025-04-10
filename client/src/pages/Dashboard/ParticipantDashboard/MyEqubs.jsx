import React, { useState, useEffect } from "react";
/* eslint-disable-next-line no-unused-vars */
import { motion } from "framer-motion";
import { Calendar, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { SearchAndFilter } from "../../../components/ParticipantComponent/SearchAndFilter";
import { AllEqubs } from "../../../components/ParticipantComponent/AllEqubs";

export const MyEqubs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("created");

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
            type: "created",
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
            type: "created",
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
            type: "created",
          },
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
            type: "joined",
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
            type: "joined",
          },
        ];

        const allEqubs = [...mockCreatedEqubs, ...mockJoinedEqubs];

        // Calculate stats
        const created = mockCreatedEqubs.length;
        const activeCreated = mockCreatedEqubs.filter(
          (e) => e.status === "active"
        ).length;
        const totalJoined = mockJoinedEqubs.length;

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
      }, 800);
    };

    fetchMyEqubs();
  }, []);

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

        {/* Tabs - Updated to be centered and larger */}
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

        {/* Equbs List */}
        <AllEqubs
          searchTerm={searchTerm}
          activeCategory={activeCategory}
          amountFilter={amountFilter}
          locationFilter={locationFilter}
          showAdminControls={true}
        />
      </div>
    </div>
  );
};

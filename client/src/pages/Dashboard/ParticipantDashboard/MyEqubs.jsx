import React, { useState, useEffect } from "react";
/* eslint-disable-next-line no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  TrendingUp,
  Users,
  CheckCircle,
  X,
  Star,
} from "lucide-react";
import { SearchAndFilter } from "../../../components/ParticipantComponent/SearchAndFilter";
import { MyEqubsList } from "../../../components/ParticipantComponent/MyEqubsList";

export const MyEqubs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("created");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [equbs, setEqubs] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [selectedEqub, setSelectedEqub] = useState(null);
  const [participantsView, setParticipantsView] = useState("pending"); // "pending", "active", or "attendance"
  const [cycles, setCycles] = useState([]);
  const [selectedCycle, setSelectedCycle] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [members, setMembers] = useState([]);
  const [attendanceTab, setAttendanceTab] = useState("take"); // "take" or "history"
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [historyFilterCycle, setHistoryFilterCycle] = useState("all");
  const [historyFilterDate, setHistoryFilterDate] = useState("");

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
    pendingRequests: 0,
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
      const createdResponse = await fetch("/api/equb/my-equbs", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!createdResponse.ok) {
        throw new Error("Failed to fetch created equbs");
      }

      const createdEqubsData = await createdResponse.json();
      const createdEqubs = createdEqubsData.map((equb) => ({
        ...equb,
        type: "created",
        isCreator: true,
      }));

      // Get joined equbs
      const joinedResponse = await fetch("/api/participant/joined-equbs", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!joinedResponse.ok) {
        throw new Error("Failed to fetch joined equbs");
      }

      const joinedEqubsData = await joinedResponse.json();
      const joinedEqubs = joinedEqubsData.map((equb) => ({
        ...equb,
        type: "joined",
        isCreator: false,
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
            const userRatingResponse = await fetch(
              `/api/rating/user/${equb._id}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );

            let userRating = 0;
            if (userRatingResponse.ok) {
              const userRatingData = await userRatingResponse.json();
              userRating = userRatingData.rating || 0;
            }

            // Get pending request count for equbs created by user
            let pendingCount = 0;
            if (equb.isCreator) {
              const pendingResponse = await fetch(
                `/api/participant/equb/${equb._id}?status=Pending`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );

              if (pendingResponse.ok) {
                const pendingData = await pendingResponse.json();
                pendingCount = pendingData.length || 0;
              }
            }

            return {
              ...equb,
              averageRating: ratingData.averageRating || 0,
              ratingCount: ratingData.count || 0,
              userRating: userRating,
              pendingCount: pendingCount,
            };
          } catch (error) {
            console.error(`Error fetching rating for equb ${equb._id}:`, error);
            return equb;
          }
        })
      );

      setEqubs(equbsWithRatings);

      // If no equb is selected yet and we have created equbs, select the first one
      if (!selectedEqub && createdEqubs.length > 0) {
        setSelectedEqub(createdEqubs[0]._id);
      }

      // Calculate stats
      const created = createdEqubs.length;
      const activeCreated = createdEqubs.filter(
        (e) => e.status === "active"
      ).length;
      const totalJoined = joinedEqubs.length;

      // Calculate total pending requests
      const totalPending = equbsWithRatings
        .filter((e) => e.isCreator)
        .reduce((sum, equb) => sum + (equb.pendingCount || 0), 0);

      // Find next due equb
      const now = new Date();
      const upcoming = allEqubs
        .filter((e) => e.nextDueDate && new Date(e.nextDueDate) > now)
        .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));

      setStats({
        totalCreated: created,
        activeCreated: activeCreated,
        totalJoined,
        pendingRequests: totalPending,
        nextDue: upcoming.length > 0 ? upcoming[0] : null,
      });
    } catch (err) {
      console.error("Error fetching equbs:", err);
      setError("Failed to load your equbs. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchParticipants = async () => {
    if (!selectedEqub) return;

    setIsLoading(true);
    try {
      // Map the UI status values to database status values
      const status = participantsView === "pending" ? "Pending" : "Accepted";

      const response = await fetch(
        `/api/participant/equb/${selectedEqub}?status=${status}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch participants");
      }

      const data = await response.json();
      // Filter participants to only include those with the specified status
      const filteredParticipants = data.filter(
        (participant) => participant.status === status
      );

      setParticipants(filteredParticipants);
    } catch (error) {
      console.error("Error fetching participants:", error);
      showToast("Failed to load participants", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch cycles for the selected equb
  const fetchCycles = async () => {
    if (!selectedEqub) return;

    setIsLoading(true);
    try {
      // Get all cycles for an equb
      const response = await fetch(`/api/cycle/all/equb/${selectedEqub}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        // Fallback to fetch single cycle if all cycles endpoint fails
        const fallbackResponse = await fetch(
          `/api/cycle/equb/${selectedEqub}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (fallbackResponse.ok) {
          const cycle = await fallbackResponse.json();
          const cyclesArray = cycle ? [cycle] : [];
          setCycles(cyclesArray);

          if (cyclesArray.length > 0 && !selectedCycle) {
            setSelectedCycle(cyclesArray[0]._id);
          }
        } else {
          throw new Error("Failed to fetch cycles");
        }
      } else {
        const data = await response.json();
        const cyclesArray = Array.isArray(data) ? data : data ? [data] : [];

        // Sort cycles by cycleNumber if available
        cyclesArray.sort((a, b) => {
          const cycleA = a.currentCycleNumber || 0;
          const cycleB = b.currentCycleNumber || 0;
          return cycleB - cycleA; // Descending order - newest first
        });

        setCycles(cyclesArray);

        if (cyclesArray.length > 0 && !selectedCycle) {
          setSelectedCycle(cyclesArray[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching cycles:", error);
      showToast("Failed to load cycles", "error");
      setCycles([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch members for attendance tracking
  const fetchMembers = async () => {
    if (!selectedEqub) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/participant/equb/${selectedEqub}?status=Accepted`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch members");
      }

      const data = await response.json();

      // Check attendance status for each member based on selected cycle
      const membersWithAttendance = await Promise.all(
        data.map(async (member) => {
          try {
            // Add cycle parameter to the query if a cycle is selected
            const cycleParam =
              selectedCycle && selectedCycle !== "all"
                ? `&cycle=${selectedCycle}`
                : "";

            // Get the attendance status for this member for the selected cycle and date
            const statusResponse = await fetch(
              `/api/attendance/equb/${selectedEqub}/user/${member.user._id}?date=${attendanceDate}${cycleParam}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );

            // If there's an existing record, use its payment status
            if (statusResponse.ok) {
              const attendanceRecord = await statusResponse.json();
              return {
                ...member,
                isPresent: attendanceRecord.paymentStatus === "Paid",
              };
            }
          } catch (err) {
            console.log(
              `Could not fetch payment status for user ${member.user._id}`,
              err
            );
          }

          // Default to not paid if no record exists or there was an error
          return {
            ...member,
            isPresent: false,
          };
        })
      );

      setMembers(membersWithAttendance);
    } catch (error) {
      console.error("Error fetching members:", error);
      showToast("Failed to load members", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch attendance history with cycle and date filtering
  const fetchAttendanceHistory = async () => {
    if (!selectedEqub) return;

    setIsLoading(true);
    try {
      // Build query parameters for filtering
      let queryParams = "";
      if (historyFilterCycle && historyFilterCycle !== "all") {
        queryParams += `cycle=${historyFilterCycle}`;
      }

      if (historyFilterDate) {
        if (queryParams) queryParams += "&";
        queryParams += `date=${historyFilterDate}`;
      }

      // Append query parameters if they exist
      const apiUrl = `/api/attendance/equb/${selectedEqub}${
        queryParams ? `?${queryParams}` : ""
      }`;

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch attendance history");
      }

      const attendanceRecords = await response.json();

      // Format and process attendance records
      const formattedRecords = [];

      // Process each attendance record
      for (const record of attendanceRecords) {
        try {
          // Find the cycle this record belongs to
          const cycle = cycles.find((c) => c._id === record.cycle) || {
            name: "Unknown Cycle",
            currentCycleNumber: 0,
          };

          // Format the record with all necessary information
          formattedRecords.push({
            id: record._id,
            date: record.paymentDate || record.createdAt,
            cycle: cycle,
            cycleName: getCycleName(cycle),
            memberName: `${record.user.firstName} ${record.user.lastName}`,
            status: record.paymentStatus,
            missed: record.paymentStatus === "Paid" ? 0 : 1,
            userId: record.user._id,
          });
        } catch (err) {
          console.error("Error processing attendance record:", err);
        }
      }

      // Sort by date, newest first
      formattedRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

      setAttendanceHistory(formattedRecords);
    } catch (error) {
      console.error("Error fetching attendance history:", error);
      showToast("Failed to load attendance history", "error");
      setAttendanceHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle member attendance status
  const toggleAttendance = (memberId) => {
    setMembers((prev) =>
      prev.map((member) =>
        member._id === memberId
          ? { ...member, isPresent: !member.isPresent }
          : member
      )
    );
  };

  // Record attendance for the selected cycle
  const recordAttendance = async () => {
    if (!selectedEqub) {
      showToast("Please select an Equb", "error");
      return;
    }

    if (!selectedCycle || selectedCycle === "all") {
      showToast("Please select a specific cycle", "error");
      return;
    }

    setIsLoading(true);
    let hasError = false;

    try {
      // Process each member's attendance
      for (const member of members) {
        try {
          // Determine which endpoint to call based on attendance status
          const endpoint = member.isPresent
            ? `/api/attendance/equb/${selectedEqub}/user/${member.user._id}/pay`
            : `/api/attendance/equb/${selectedEqub}/user/${member.user._id}/miss`;

          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              date: attendanceDate,
              cycle: selectedCycle, // Include the selected cycle
            }),
          });

          if (!response.ok) {
            console.error(
              `Failed to record attendance for ${member.user.firstName}`
            );
            hasError = true;
          }
        } catch (memberError) {
          console.error(
            `Error processing member ${member.user._id}:`,
            memberError
          );
          hasError = true;
        }
      }

      if (hasError) {
        showToast("Some attendance records could not be saved", "error");
      } else {
        showToast("Attendance recorded successfully");
      }

      // Refresh attendance history if we're viewing it
      if (attendanceTab === "history") {
        fetchAttendanceHistory();
      }
    } catch (error) {
      console.error("Error recording attendance:", error);
      showToast(`Failed to record attendance: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchEqubs();
  }, []);

  // Effect for fetching cycle data as soon as an equb is selected
  useEffect(() => {
    if (selectedEqub && participantsView === "attendance") {
      fetchCycles();
    }
  }, [selectedEqub, participantsView]);

  // Effect for handling tab changes and refreshing data
  useEffect(() => {
    if (activeTab === "participants" && selectedEqub) {
      if (participantsView === "pending" || participantsView === "active") {
        fetchParticipants();
      } else if (participantsView === "attendance") {
        // Cycles are fetched in a separate useEffect
        if (attendanceTab === "take") {
          fetchMembers();
        } else if (attendanceTab === "history") {
          fetchAttendanceHistory();
        }
      }
    }
  }, [activeTab, selectedEqub, participantsView, attendanceTab]);

  // Effect to refresh data when filters change in history tab
  useEffect(() => {
    if (
      activeTab === "participants" &&
      participantsView === "attendance" &&
      attendanceTab === "history"
    ) {
      fetchAttendanceHistory();
    }
  }, [historyFilterCycle, historyFilterDate]);

  // Effect to refresh member data when cycle changes
  useEffect(() => {
    if (
      activeTab === "participants" &&
      participantsView === "attendance" &&
      attendanceTab === "take"
    ) {
      fetchMembers();
    }
  }, [selectedCycle, attendanceDate]);

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Handle equb deleted from the list
  const handleEqubDeleted = (deletedEqubId) => {
    // Remove the deleted equb from the state
    setEqubs((prevEqubs) =>
      prevEqubs.filter((equb) => equb._id !== deletedEqubId)
    );

    // Update stats
    setStats((prevStats) => ({
      ...prevStats,
      totalCreated: prevStats.totalCreated - 1,
      // Only decrement active count if the deleted equb was active
      activeCreated:
        prevStats.activeCreated -
        (equbs.find((e) => e._id === deletedEqubId && e.status === "active")
          ? 1
          : 0),
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
    setEqubs((prevEqubs) =>
      prevEqubs.map((equb) => {
        if (equb._id === equbId) {
          const totalRating = equb.averageRating * equb.ratingCount || 0;
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
            ratingCount: newCount,
          };
        }
        return equb;
      })
    );

    showToast("Rating submitted successfully");
  };

  // Handle complaint submitted
  const handleComplaintSubmitted = () => {
    showToast("Complaint submitted successfully");
  };

  // Handle participant status update (accept/reject)
  const handleParticipantStatusUpdate = async (participantId, status) => {
    try {
      // Convert UI status to database status format
      const dbStatus = status === "approved" ? "Accepted" : "Rejected";

      const response = await fetch(`/api/participant/${participantId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: dbStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${status} participant`);
      }

      // Refresh participants list and equbs data
      fetchParticipants();
      fetchEqubs();

      showToast(
        `Participant ${
          status === "approved" ? "approved" : "rejected"
        } successfully`
      );
    } catch (error) {
      console.error("Error updating participant status:", error);
      showToast(`Failed to ${status} participant`, "error");
    }
  };

  // Handle participant removal
  const handleParticipantRemoved = async (participantId) => {
    try {
      // This requires a new API endpoint to remove a participant from an equb
      const response = await fetch(`/api/participant/${participantId}/remove`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to remove participant");
      }

      // Refresh participants list
      fetchParticipants();
      showToast("Participant removed successfully");
    } catch (error) {
      console.error("Error removing participant:", error);
      showToast("Failed to remove participant", "error");
    }
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
    return equbs.filter(
      (equb) =>
        (activeTab === "all" || equb.type === activeTab) &&
        (searchTerm === "" ||
          equb.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (activeCategory === "all" || equb.status === activeCategory) &&
        (locationFilter === "" ||
          equb.location.toLowerCase().includes(locationFilter.toLowerCase())) &&
        (amountFilter.min === "" ||
          equb.amount >= parseInt(amountFilter.min)) &&
        (amountFilter.max === "" || equb.amount <= parseInt(amountFilter.max))
    );
  };

  const getCreatedEqubs = () => {
    return equbs.filter((equb) => equb.isCreator);
  };

  // Get cycle name for display
  const getCycleName = (cycle) => {
    if (!cycle) return "N/A";
    return cycle.name || `Cycle ${cycle.currentCycleNumber || 1}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 rounded-lg p-4 shadow-lg flex items-center ${
              toast.type === "success"
                ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="h-5 w-5 mr-2 text-green-500 dark:text-green-300" />
            ) : (
              <X className="h-5 w-5 mr-2 text-red-500 dark:text-red-300" />
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            My Equbs
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Total Created
                </span>
                <h3 className="text-2xl font-bold mt-1 dark:text-white">
                  {stats.totalCreated}
                </h3>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Active Created
                </span>
                <h3 className="text-2xl font-bold mt-1 dark:text-white">
                  {stats.activeCreated}
                </h3>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Joined
                </span>
                <h3 className="text-2xl font-bold mt-1 dark:text-white">
                  {stats.totalJoined}
                </h3>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Next Due Payment
              </span>
              {stats.nextDue ? (
                <div className="mt-2">
                  <p className="font-medium text-sm dark:text-white">
                    {stats.nextDue.name}
                  </p>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-300 mr-1" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(stats.nextDue.nextDueDate)}
                    </span>

                    {getRemainingDays(stats.nextDue.nextDueDate) && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                        {getRemainingDays(stats.nextDue.nextDueDate)} days left
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  No upcoming payments
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Row - Only show in created and joined tabs */}
        {activeTab !== "participants" && (
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
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-6 border-b border-gray-200 dark:border-gray-700"
        >
          <div className="flex justify-center">
            <button
              onClick={() => setActiveTab("created")}
              className={`py-4 px-6 text-base font-medium transition relative mx-4 ${
                activeTab === "created"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              Created By Me
            </button>
            <button
              onClick={() => setActiveTab("joined")}
              className={`py-4 px-6 text-base font-medium transition relative mx-4 ${
                activeTab === "joined"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              Joined
            </button>
            <button
              onClick={() => setActiveTab("participants")}
              className={`py-4 px-6 text-base font-medium transition relative mx-4 ${
                activeTab === "participants"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              Participants
              {stats.pendingRequests > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {stats.pendingRequests}
                </span>
              )}
            </button>
          </div>
        </motion.div>

        {/* Participants Management - Only show when participants tab is active */}
        {activeTab === "participants" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {/* Equb Selection Dropdown */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Equb:
              </label>
              <select
                value={selectedEqub || ""}
                onChange={(e) => {
                  setSelectedEqub(e.target.value);
                  // Reset the selected cycle when equb changes
                  setSelectedCycle("");
                }}
                className="w-full p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              >
                <option value="">Select an Equb</option>
                {getCreatedEqubs().map((equb) => (
                  <option key={equb._id} value={equb._id}>
                    {equb.name}{" "}
                    {equb.pendingCount > 0 && `(${equb.pendingCount} pending)`}
                  </option>
                ))}
              </select>
            </div>

            {/* Participant View Toggle */}
            <div className="flex mb-6">
              <button
                onClick={() => setParticipantsView("pending")}
                className={`flex-1 py-2 text-center font-medium ${
                  participantsView === "pending"
                    ? "bg-blue-600 text-white dark:bg-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                } rounded-l-lg`}
              >
                Pending Requests
              </button>
              <button
                onClick={() => setParticipantsView("active")}
                className={`flex-1 py-2 text-center font-medium ${
                  participantsView === "active"
                    ? "bg-blue-600 text-white dark:bg-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                Active Participants
              </button>
              <button
                onClick={() => setParticipantsView("attendance")}
                className={`flex-1 py-2 text-center font-medium ${
                  participantsView === "attendance"
                    ? "bg-blue-600 text-white dark:bg-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                } rounded-r-lg`}
              >
                Attendance
              </button>
            </div>

            {/* Attendance Tab */}
            {participantsView === "attendance" && (
              <div>
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                  <div className="flex">
                    <button
                      onClick={() => setAttendanceTab("take")}
                      className={`py-2 px-4 font-medium ${
                        attendanceTab === "take"
                          ? "border-b-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      Take Attendance
                    </button>
                    <button
                      onClick={() => setAttendanceTab("history")}
                      className={`py-2 px-4 font-medium ${
                        attendanceTab === "history"
                          ? "border-b-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      Attendance History
                    </button>
                  </div>
                </div>

                {/* Take Attendance Form */}
                {attendanceTab === "take" && (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Cycle Filter */}
                      <div>
                        <label
                          htmlFor="cycleFilter"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Filter by Cycle
                        </label>
                        <select
                          id="cycleFilter"
                          value={selectedCycle}
                          onChange={(e) => setSelectedCycle(e.target.value)}
                          className="w-full p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                        >
                          <option value="">Select Cycle</option>
                          {cycles.map((cycle) => (
                            <option key={cycle._id} value={cycle._id}>
                              {getCycleName(cycle)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Date Filter */}
                      <div>
                        <label
                          htmlFor="date"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Filter by Date
                        </label>
                        <input
                          type="date"
                          id="date"
                          value={attendanceDate}
                          onChange={(e) => setAttendanceDate(e.target.value)}
                          className="w-full p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                          placeholder="mm/dd/yyyy"
                        />
                      </div>
                    </div>

                    <h2 className="text-xl font-medium mb-4 text-gray-800 dark:text-gray-200">
                      Members
                    </h2>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      {isLoading ? (
                        <div className="p-4 text-center">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-t-blue-500 border-gray-200 dark:border-t-blue-400 dark:border-gray-700"></div>
                          <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Loading members...
                          </p>
                        </div>
                      ) : members.length === 0 ? (
                        <div className="p-4 text-center">
                          <p className="text-gray-600 dark:text-gray-400">
                            No active members found for this Equb.
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                          {members.map((member) => (
                            <div
                              key={member._id}
                              className="flex items-center justify-between p-4"
                            >
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
                                  {member.user.firstName
                                    ?.charAt(0)
                                    .toUpperCase() || "U"}
                                </div>
                                <div className="ml-4">
                                  <h3 className="font-medium dark:text-white">
                                    {member?.user?.firstName &&
                                    member?.user?.lastName
                                      ? `${member.user.firstName} ${member.user.lastName}`
                                      : "Unknown User"}
                                  </h3>
                                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    {member.user.email}
                                  </p>
                                </div>
                              </div>
                              <label className="inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={member.isPresent}
                                  onChange={() => toggleAttendance(member._id)}
                                />
                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Save Button */}
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={recordAttendance}
                          disabled={
                            isLoading ||
                            members.length === 0 ||
                            !selectedCycle ||
                            selectedCycle === "all"
                          }
                          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {isLoading ? "Saving..." : "Save Attendance"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Attendance History */}
                {attendanceTab === "history" && (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Filter by Cycle */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Filter by Cycle
                        </label>
                        <select
                          value={historyFilterCycle}
                          onChange={(e) =>
                            setHistoryFilterCycle(e.target.value)
                          }
                          className="w-full p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                        >
                          <option value="all">All Cycles</option>
                          {cycles.map((cycle) => (
                            <option key={cycle._id} value={cycle._id}>
                              {getCycleName(cycle)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Filter by Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Filter by Date
                        </label>
                        <input
                          type="date"
                          value={historyFilterDate}
                          onChange={(e) => setHistoryFilterDate(e.target.value)}
                          className="w-full p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                          placeholder="mm/dd/yyyy"
                        />
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      {isLoading ? (
                        <div className="p-4 text-center">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-t-blue-500 border-gray-200 dark:border-t-blue-400 dark:border-gray-700"></div>
                          <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Loading attendance history...
                          </p>
                        </div>
                      ) : attendanceHistory.length === 0 ? (
                        <div className="p-4 text-center">
                          <p className="text-gray-600 dark:text-gray-400">
                            No attendance records found.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  DATE
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  CYCLE
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  MEMBER
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  STATUS
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  MISSED
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  ACTIONS
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {attendanceHistory.map((record, index) => (
                                <tr key={record.id || index}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                                    {formatDate(record.date)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                                    {record.cycleName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                                    {record.memberName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        record.status === "Paid"
                                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                      }`}
                                    >
                                      {record.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 text-center">
                                    {record.missed}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                                      View Details
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pending Participants List */}
            {participantsView === "pending" &&
              (selectedEqub ? (
                isLoading ? (
                  <div className="text-center py-10">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-gray-200 dark:border-t-blue-400 dark:border-gray-700"></div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      Loading participants...
                    </p>
                  </div>
                ) : participants.length === 0 ? (
                  <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <p className="text-gray-600 dark:text-gray-400">
                      No pending join requests.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            User
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Join Date
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {participants.map((participant) => (
                          <tr key={participant._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                  {participant.user.profilePicture ? (
                                    <img
                                      src={participant.user.profilePicture}
                                      alt=""
                                      className="h-10 w-10 rounded-full"
                                    />
                                  ) : (
                                    <span className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                                      {participant.user.firstName
                                        ?.charAt(0)
                                        .toUpperCase() || "U"}
                                    </span>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {participant.user.firstName +
                                      " " +
                                      participant.user.lastName || "Unknown"}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {participant.user.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(participant.dateJoined)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() =>
                                  handleParticipantStatusUpdate(
                                    participant._id,
                                    "approved"
                                  )
                                }
                                className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 mr-4"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() =>
                                  handleParticipantStatusUpdate(
                                    participant._id,
                                    "rejected"
                                  )
                                }
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <p className="text-gray-600 dark:text-gray-400">
                    Please select an Equb to manage participants.
                  </p>
                </div>
              ))}

            {/* Active Participants List */}
            {participantsView === "active" &&
              (selectedEqub ? (
                isLoading ? (
                  <div className="text-center py-10">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-gray-200 dark:border-t-blue-400 dark:border-gray-700"></div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      Loading participants...
                    </p>
                  </div>
                ) : participants.length === 0 ? (
                  <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <p className="text-gray-600 dark:text-gray-400">
                      No active participants for this Equb.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            User
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Join Date
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {participants.map((participant) => (
                          <tr key={participant._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                  {participant.user.profilePicture ? (
                                    <img
                                      src={participant.user.profilePicture}
                                      alt=""
                                      className="h-10 w-10 rounded-full"
                                    />
                                  ) : (
                                    <span className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                                      {participant.user.firstName
                                        ?.charAt(0)
                                        .toUpperCase() || "U"}
                                    </span>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {participant.user.firstName +
                                      " " +
                                      participant.user.lastName || "Unknown"}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {participant.user.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(participant.dateJoined)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                {participant.status || "Active"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() =>
                                  handleParticipantRemoved(participant._id)
                                }
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <p className="text-gray-600 dark:text-gray-400">
                    Please select an Equb to manage participants.
                  </p>
                </div>
              ))}
          </motion.div>
        )}

        {/* Loading, Error and Equbs List - Only show when not in participants tab */}
        {activeTab !== "participants" && (
          <>
            {isLoading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-gray-200 dark:border-t-blue-400 dark:border-gray-700"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Loading your equbs...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-500 dark:text-red-400">{error}</p>
                <button
                  onClick={() => fetchEqubs()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition dark:bg-blue-700 dark:hover:bg-blue-800"
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
          </>
        )}
      </div>
    </div>
  );
};

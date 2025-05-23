import React, { useState, useEffect } from "react";
/* eslint-disable-next-line no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  Users,
  DollarSign,
  X,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  AlertTriangle,
  Star,
  MessageCircle,
  AlertCircle,
  Check,
  Megaphone,
  Calendar,
  MoreVertical,
  PlayCircle,
  Gift,
  TrendingUp,
  Eye,
  Award,
  RefreshCw,
  UserCheck,
  ChevronDown,
  Info,
} from "lucide-react";
import { CreateEqub } from "../CreateEqub";

export const CreatedEqubs = ({
  equbs,
  showAdminControls = false,
  onEqubDeleted,
  onEqubUpdated,
}) => {
  const [joinStatus, setJoinStatus] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEqub, setSelectedEqub] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [equbToEdit, setEqubToEdit] = useState(null);
  // States for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [equbToDelete, setEqubToDelete] = useState(null);
  // States for announcement modal
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [equbToAnnounce, setEqubToAnnounce] = useState(null);
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const [announcementError, setAnnouncementError] = useState("");
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);
  // Announcements states
  const [equbAnnouncements, setEqubAnnouncements] = useState({});
  const [announcementsLoading, setAnnouncementsLoading] = useState({});
  const [announcementToEdit, setAnnouncementToEdit] = useState(null);
  const [showEditAnnouncementModal, setShowEditAnnouncementModal] =
    useState(false);
  const [showDeleteAnnouncementModal, setShowDeleteAnnouncementModal] =
    useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  // Participant count state
  const [participantCounts, setParticipantCounts] = useState({});
  // Winner selection state
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [equbToDrawWinner, setEqubToDrawWinner] = useState(null);
  const [winnerSelectionLoading, setWinnerSelectionLoading] = useState(false);
  const [winnerSelectionError, setWinnerSelectionError] = useState("");
  const [winnerSelectionSuccess, setWinnerSelectionSuccess] = useState(false);
  // Start cycle state
  const [startCycleLoading, setStartCycleLoading] = useState({});
  const [startCycleError, setStartCycleError] = useState({});
  const [startCycleSuccess, setStartCycleSuccess] = useState({});
  // Cycle and winners state
  const [currentCycle, setCurrentCycle] = useState(null);
  const [cycleLoading, setCycleLoading] = useState(false);
  const [winners, setWinners] = useState([]);
  const [winnersLoading, setWinnersLoading] = useState(false);
  // Manual winner selection
  const [showManualWinnerModal, setShowManualWinnerModal] = useState(false);
  const [eligibleParticipants, setEligibleParticipants] = useState([]);
  const [selectedParticipant, setSelectedParticipant] = useState("");
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [switchToAutomatic, setSwitchToAutomatic] = useState(false);
  const [manualWinnerError, setManualWinnerError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const equbsPerPage = 9;

  // Fetch participant counts on component mount
  useEffect(() => {
    const fetchParticipantCounts = async () => {
      try {
        const countsObj = {};

        for (const equb of equbs) {
          try {
            const countResponse = await fetch(
              `/api/participant/count/${equb._id}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                  "Content-Type": "application/json",
                },
              }
            );
            if (countResponse.ok) {
              const countData = await countResponse.json();
              countsObj[equb._id] = {
                currentParticipants: countData.currentParticipants,
                totalParticipants: countData.totalParticipants,
                remainingSpots: countData.remainingSpots,
                isFull: countData.isFull,
              };
            }
          } catch (error) {
            console.error(`Error fetching data for equb ${equb._id}:`, error);
          }
        }

        setParticipantCounts(countsObj);
      } catch (error) {
        console.error("Error fetching participant counts:", error);
      }
    };

    fetchParticipantCounts();
  }, [equbs]);

  // Clear success messages after delay
  useEffect(() => {
    // Clear announcement success message after delay
    if (announcementSuccess) {
      const timer = setTimeout(() => {
        setAnnouncementSuccess(false);
      }, 3000);

      return () => {
        clearTimeout(timer);
      };
    }

    // Clear winner selection success after delay
    if (winnerSelectionSuccess) {
      const timer = setTimeout(() => {
        setWinnerSelectionSuccess(false);
        setShowWinnerModal(false);
        setEqubToDrawWinner(null);
      }, 3000);

      return () => {
        clearTimeout(timer);
      };
    }

    // Clear start cycle success messages
    const startCycleTimers = [];
    Object.keys(startCycleSuccess).forEach((equbId) => {
      if (startCycleSuccess[equbId]) {
        const timer = setTimeout(() => {
          setStartCycleSuccess((prev) => ({
            ...prev,
            [equbId]: false,
          }));
        }, 3000);
        startCycleTimers.push(timer);
      }
    });

    // Clear start cycle error messages
    const startCycleErrorTimers = [];
    Object.keys(startCycleError).forEach((equbId) => {
      if (startCycleError[equbId]) {
        const timer = setTimeout(() => {
          setStartCycleError((prev) => ({
            ...prev,
            [equbId]: "",
          }));
        }, 3000);
        startCycleErrorTimers.push(timer);
      }
    });

    return () => {
      startCycleTimers.forEach((timer) => clearTimeout(timer));
      startCycleErrorTimers.forEach((timer) => clearTimeout(timer));
    };
  }, [
    announcementSuccess,
    winnerSelectionSuccess,
    startCycleSuccess,
    startCycleError,
  ]);

  // Fetch announcements when an equb is selected for details
  useEffect(() => {
    if (selectedEqub && activeTab === "announcements") {
      fetchAnnouncementsForEqub(selectedEqub._id);
    }
  }, [selectedEqub, activeTab]);

  // Fetch cycle and winners when an equb is selected for details
  useEffect(() => {
    if (selectedEqub && activeTab === "cycles") {
      fetchCycleForEqub(selectedEqub._id);
      fetchWinnersForEqub(selectedEqub._id);
    }
  }, [selectedEqub, activeTab]);

  const fetchAnnouncementsForEqub = async (equbId) => {
    if (equbAnnouncements[equbId]) return; // Already fetched

    setAnnouncementsLoading((prev) => ({ ...prev, [equbId]: true }));

    try {
      const response = await fetch(`/api/announcement/equb/${equbId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEqubAnnouncements((prev) => ({
          ...prev,
          [equbId]: data,
        }));
      } else {
        console.error(`Error fetching announcements for equb ${equbId}`);
      }
    } catch (error) {
      console.error(`Error fetching announcements:`, error);
    } finally {
      setAnnouncementsLoading((prev) => ({ ...prev, [equbId]: false }));
    }
  };

  // Fetch cycle information for an equb
  const fetchCycleForEqub = async (equbId) => {
    setCycleLoading(true);

    try {
      const response = await fetch(`/api/cycle/equb/${equbId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentCycle(data);
      } else {
        console.error(`Error fetching cycle for equb ${equbId}`);
        setCurrentCycle(null);
      }
    } catch (error) {
      console.error(`Error fetching cycle:`, error);
      setCurrentCycle(null);
    } finally {
      setCycleLoading(false);
    }
  };

  // Fetch winners for an equb
  const fetchWinnersForEqub = async (equbId) => {
    setWinnersLoading(true);

    try {
      const response = await fetch(`/api/winner/equb/${equbId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWinners(data);
      } else {
        console.error(`Error fetching winners for equb ${equbId}`);
        setWinners([]);
      }
    } catch (error) {
      console.error(`Error fetching winners:`, error);
      setWinners([]);
    } finally {
      setWinnersLoading(false);
    }
  };

  // Fetch eligible participants for manual winner selection
  const fetchEligibleParticipants = async (equbId) => {
    setParticipantsLoading(true);

    try {
      const response = await fetch(
        `/api/participant/eligible-winners/${equbId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEligibleParticipants(data);
      } else {
        console.error(
          `Error fetching eligible participants for equb ${equbId}`
        );
        setEligibleParticipants([]);
      }
    } catch (error) {
      console.error(`Error fetching eligible participants:`, error);
      setEligibleParticipants([]);
    } finally {
      setParticipantsLoading(false);
    }
  };

  // Show details
  const handleShowDetails = (equb) => {
    setSelectedEqub(equb);
    setActiveTab("details");
    setShowDetailsModal(true);
  };

  // Handle edit equb
  const handleEditEqub = (equb) => {
    setEqubToEdit(equb);
    setShowEditModal(true);
  };

  // Show delete confirmation modal
  const handleShowDeleteConfirmation = (equb) => {
    setEqubToDelete(equb);
    setShowDeleteModal(true);
  };

  // Handle delete equb
  const handleDeleteEqub = async () => {
    if (!equbToDelete) return;

    const equbId = equbToDelete._id;
    setLoadingMap((prev) => ({ ...prev, [equbId]: true }));

    try {
      const response = await fetch(`/api/equb/${equbId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        // Close the delete modal immediately
        setShowDeleteModal(false);
        setEqubToDelete(null);

        // Notify parent component about update
        if (onEqubDeleted) {
          onEqubDeleted(equbId);
        }
      } else {
        const errorData = await response.json();
        console.error("Error deleting Equb:", errorData);

        // Close modal but show error in the join status area of the affected equb
        setShowDeleteModal(false);
        setEqubToDelete(null);
        setJoinStatus({
          ...joinStatus,
          [equbId]: {
            status: "Error",
            message: errorData.message || "Failed to delete. Please try again.",
          },
        });
      }
    } catch (error) {
      console.error("Error deleting Equb:", error);
      // Close modal but show error in the join status area of the affected equb
      setShowDeleteModal(false);
      setEqubToDelete(null);
      setJoinStatus({
        ...joinStatus,
        [equbId]: {
          status: "Error",
          message: "Failed to delete. Please check your connection.",
        },
      });
    } finally {
      setLoadingMap((prev) => ({ ...prev, [equbId]: false }));
    }
  };

  // Show announcement modal
  const handleShowAnnouncementModal = (equb) => {
    setEqubToAnnounce(equb);
    setAnnouncementMessage("");
    setAnnouncementError("");
    setAnnouncementSuccess(false);
    setShowAnnouncementModal(true);
  };

  // Handle send announcement
  const handleSendAnnouncement = async () => {
    if (!equbToAnnounce || !announcementMessage.trim()) {
      setAnnouncementError("Please enter an announcement message");
      return;
    }

    setAnnouncementLoading(true);
    setAnnouncementError("");

    try {
      const response = await fetch(
        `/api/announcement/equb/${equbToAnnounce._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ message: announcementMessage }),
        }
      );

      if (response.ok) {
        setAnnouncementSuccess(true);
        // Clear the form after successful submission
        setAnnouncementMessage("");

        // Clear cached announcements to force a refresh
        setEqubAnnouncements((prev) => {
          const newState = { ...prev };
          delete newState[equbToAnnounce._id];
          return newState;
        });

        // Close the modal after a short delay
        setTimeout(() => {
          setShowAnnouncementModal(false);
          setEqubToAnnounce(null);
        }, 1500);
      } else {
        const errorData = await response.json();
        setAnnouncementError(
          errorData.message || "Failed to send announcement. Please try again."
        );
      }
    } catch (error) {
      console.error("Error sending announcement:", error);
      setAnnouncementError(
        "Failed to send announcement. Please check your connection."
      );
    } finally {
      setAnnouncementLoading(false);
    }
  };

  // Handle edit announcement modal
  const handleShowEditAnnouncementModal = (announcement) => {
    setAnnouncementToEdit(announcement);
    setAnnouncementMessage(announcement.message);
    setAnnouncementError("");
    setAnnouncementSuccess(false);
    setShowEditAnnouncementModal(true);
  };

  // Handle update announcement
  const handleUpdateAnnouncement = async () => {
    if (!announcementToEdit || !announcementMessage.trim()) {
      setAnnouncementError("Please enter an announcement message");
      return;
    }

    setAnnouncementLoading(true);
    setAnnouncementError("");

    try {
      const response = await fetch(
        `/api/announcement/${announcementToEdit._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ message: announcementMessage }),
        }
      );

      if (response.ok) {
        setAnnouncementSuccess(true);

        // Update the announcements list
        setEqubAnnouncements((prev) => {
          const equbId = announcementToEdit.equb;
          const updatedAnnouncements = prev[equbId].map((ann) =>
            ann._id === announcementToEdit._id
              ? { ...ann, message: announcementMessage }
              : ann
          );

          return {
            ...prev,
            [equbId]: updatedAnnouncements,
          };
        });

        // Close the modal after a short delay
        setTimeout(() => {
          setShowEditAnnouncementModal(false);
          setAnnouncementToEdit(null);
          setAnnouncementMessage("");
        }, 1500);
      } else {
        const errorData = await response.json();
        setAnnouncementError(
          errorData.message ||
            "Failed to update announcement. Please try again."
        );
      }
    } catch (error) {
      console.error("Error updating announcement:", error);
      setAnnouncementError(
        "Failed to update announcement. Please check your connection."
      );
    } finally {
      setAnnouncementLoading(false);
    }
  };

  // Show delete announcement confirmation modal
  const handleShowDeleteAnnouncementConfirmation = (announcement) => {
    setAnnouncementToDelete(announcement);
    setShowDeleteAnnouncementModal(true);
  };

  // Handle delete announcement
  const handleDeleteAnnouncement = async () => {
    if (!announcementToDelete) return;

    setAnnouncementLoading(true);

    try {
      const response = await fetch(
        `/api/announcement/${announcementToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        // Update announcements list
        setEqubAnnouncements((prev) => {
          const equbId = announcementToDelete.equb;
          return {
            ...prev,
            [equbId]: prev[equbId].filter(
              (ann) => ann._id !== announcementToDelete._id
            ),
          };
        });

        // Close the modal
        setShowDeleteAnnouncementModal(false);
        setAnnouncementToDelete(null);
      } else {
        const errorData = await response.json();
        console.error("Error deleting announcement:", errorData);
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
    } finally {
      setAnnouncementLoading(false);
    }
  };

  // Handle start cycle button
  const handleStartCycle = async (equbId) => {
    setStartCycleLoading((prev) => ({ ...prev, [equbId]: true }));
    setStartCycleError((prev) => ({ ...prev, [equbId]: "" }));

    try {
      const response = await fetch(`/api/cycle/equb/${equbId}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setStartCycleSuccess((prev) => ({ ...prev, [equbId]: true }));

        // Refresh cycle data
        if (selectedEqub && selectedEqub._id === equbId) {
          fetchCycleForEqub(equbId);
        }

        // Notify parent component about update
        if (onEqubUpdated) {
          onEqubUpdated();
        }
      } else {
        const errorData = await response.json();
        setStartCycleError((prev) => ({
          ...prev,
          [equbId]:
            errorData.message || "Failed to start cycle. Please try again.",
        }));
      }
    } catch (error) {
      console.error("Error starting cycle:", error);
      setStartCycleError((prev) => ({
        ...prev,
        [equbId]: "Failed to start cycle. Please check your connection.",
      }));
    } finally {
      setStartCycleLoading((prev) => ({ ...prev, [equbId]: false }));
    }
  };

  // Show manual winner selection modal
  const handleShowManualWinnerModal = async (equb) => {
    // Check if there's an active cycle for this equb
    let cycleExists = false;

    try {
      const cycleResponse = await fetch(`/api/cycle/equb/${equb._id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      cycleExists = cycleResponse.ok && (await cycleResponse.json());

      // If no cycle exists, start one first
      if (!cycleExists) {
        setStartCycleLoading((prev) => ({ ...prev, [equb._id]: true }));

        const startCycleResponse = await fetch(
          `/api/cycle/equb/${equb._id}/start`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!startCycleResponse.ok) {
          const errorData = await startCycleResponse.json();
          setJoinStatus({
            ...joinStatus,
            [equb._id]: {
              status: "Error",
              message:
                errorData.message || "Failed to start cycle. Please try again.",
            },
          });
          setStartCycleLoading((prev) => ({ ...prev, [equb._id]: false }));
          return;
        }

        setStartCycleLoading((prev) => ({ ...prev, [equb._id]: false }));
        setStartCycleSuccess((prev) => ({ ...prev, [equb._id]: true }));
      } else if (cycleExists.hasSelectedWinner) {
        // If cycle exists but a winner has already been selected
        setJoinStatus({
          ...joinStatus,
          [equb._id]: {
            status: "Error",
            message:
              "A winner has already been selected for the current cycle. Please wait until the cycle ends.",
          },
        });
        return;
      }

      // Now proceed with winner selection
      setEqubToDrawWinner(equb);
      setManualWinnerError("");
      setSwitchToAutomatic(false);
      setSelectedParticipant("");
      setShowManualWinnerModal(true);
      fetchEligibleParticipants(equb._id);
    } catch (error) {
      console.error("Error checking cycle status:", error);
      setJoinStatus({
        ...joinStatus,
        [equb._id]: {
          status: "Error",
          message: "Failed to process request. Please try again.",
        },
      });
    }
  };

  // Handle automatic winner selection
  const handleSelectWinner = async () => {
    if (!equbToDrawWinner) return;

    setWinnerSelectionLoading(true);
    setWinnerSelectionError("");
    // Calculate the amount won based on equb data
    const amountWon =
      equbToDrawWinner.currentParticipants * equbToDrawWinner.amountPerPerson;
    try {
      const response = await fetch(
        `/api/winner/equb/${equbToDrawWinner._id}/automatic`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            amountWon: amountWon, // Add the amount won field
          }),
        }
      );

      if (response.ok) {
        setWinnerSelectionSuccess(true);

        // Refresh cycle and winners data
        if (selectedEqub && selectedEqub._id === equbToDrawWinner._id) {
          fetchCycleForEqub(equbToDrawWinner._id);
          fetchWinnersForEqub(equbToDrawWinner._id);
        }

        // Notify parent component about update
        if (onEqubUpdated) {
          onEqubUpdated();
        }
      } else {
        const errorData = await response.json();
        setWinnerSelectionError(
          errorData.message || "Failed to select winner. Please try again."
        );
      }
    } catch (error) {
      console.error("Error selecting winner:", error);
      setWinnerSelectionError(
        "Failed to select winner. Please check your connection."
      );
    } finally {
      setWinnerSelectionLoading(false);
    }
  };

  // Handle manual winner selection
  const handleSelectManualWinner = async () => {
    if (!equbToDrawWinner || !selectedParticipant) {
      setManualWinnerError("Please select a participant");
      return;
    }

    setWinnerSelectionLoading(true);
    setManualWinnerError("");
    // Calculate the amount won based on equb data
    // This is typically number of participants × amount per person
    const amountWon =
      equbToDrawWinner.currentParticipants * equbToDrawWinner.amountPerPerson;
    try {
      const response = await fetch(
        `/api/winner/equb/${equbToDrawWinner._id}/manual`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            participantId: selectedParticipant,
            switchToAutomatic: switchToAutomatic,
            amountWon: amountWon,
          }),
        }
      );

      if (response.ok) {
        setWinnerSelectionSuccess(true);

        // Refresh cycle and winners data
        if (selectedEqub && selectedEqub._id === equbToDrawWinner._id) {
          fetchCycleForEqub(equbToDrawWinner._id);
          fetchWinnersForEqub(equbToDrawWinner._id);
        }

        // For Special equbs, automatically start the next cycle
        // only if not switching to automatic mode (since that changes cycle handling)
        if (equbToDrawWinner.equbType === "Special" && !switchToAutomatic) {
          try {
            // Short delay to ensure winner selection is fully processed
            setTimeout(async () => {
              const startCycleResponse = await fetch(
                `/api/cycle/equb/${equbToDrawWinner._id}/start`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );

              if (startCycleResponse.ok) {
                console.log("New cycle automatically started for Special equb");
                // Update success status for visual feedback
                setStartCycleSuccess((prev) => ({
                  ...prev,
                  [equbToDrawWinner._id]: true,
                }));

                // Refresh cycle data again after starting new cycle
                if (selectedEqub && selectedEqub._id === equbToDrawWinner._id) {
                  fetchCycleForEqub(equbToDrawWinner._id);
                }
              } else {
                console.error("Failed to automatically start new cycle");
              }
            }, 1000); // Small delay to ensure winner selection is fully processed
          } catch (cycleError) {
            console.error(
              "Error automatically starting new cycle:",
              cycleError
            );
          }
        }

        // Notify parent component about update
        if (onEqubUpdated) {
          onEqubUpdated();
        }

        // Close the modal after a delay
        setTimeout(() => {
          setShowManualWinnerModal(false);
          setEqubToDrawWinner(null);
          setSelectedParticipant("");
          setSwitchToAutomatic(false);
        }, 1500);
      } else {
        const errorData = await response.json();
        setManualWinnerError(
          errorData.message || "Failed to select winner. Please try again."
        );
      }
    } catch (error) {
      console.error("Error selecting winner:", error);
      setManualWinnerError(
        "Failed to select winner. Please check your connection."
      );
    } finally {
      setWinnerSelectionLoading(false);
    }
  };

  // Mark winner as read
  const handleMarkWinnerAsRead = async (winnerId) => {
    try {
      const response = await fetch(`/api/winner/${winnerId}/read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        // Update winners list with read status
        setWinners((prev) =>
          prev.map((winner) =>
            winner._id === winnerId ? { ...winner, isRead: true } : winner
          )
        );
      } else {
        console.error("Error marking winner as read");
      }
    } catch (error) {
      console.error("Error marking winner as read:", error);
    }
  };

  // Mark all winners as read
  const handleMarkAllWinnersAsRead = async (equbId) => {
    try {
      const response = await fetch(`/api/winner/equb/${equbId}/read-all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        // Update all winners as read
        setWinners((prev) =>
          prev.map((winner) => ({ ...winner, isRead: true }))
        );
      } else {
        console.error("Error marking all winners as read");
      }
    } catch (error) {
      console.error("Error marking all winners as read:", error);
    }
  };

  // Handle edit modal close
  const handleEditModalClose = (success) => {
    setShowEditModal(false);
    setEqubToEdit(null);

    if (success && onEqubUpdated) {
      onEqubUpdated();
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Helper function to get participant count display
  const getParticipantCountDisplay = (equbId) => {
    // Check if we have fetched participant count from API
    if (participantCounts[equbId]) {
      const { currentParticipants, totalParticipants } =
        participantCounts[equbId];
      return `${currentParticipants}/${totalParticipants} members`;
    }

    // Fallback to equb object data
    const equb = equbs.find((e) => e._id === equbId);
    return equb
      ? `${equb.currentParticipants}/${equb.numberOfParticipants} members`
      : "Loading...";
  };

  // Function to render rating stars
  const renderRatingStars = (equb) => {
    if (!equb.averageRating && equb.averageRating !== 0) return null;

    return (
      <div className="flex items-center mt-1">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-3.5 w-3.5 ${
                star <= Math.round(equb.averageRating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="ml-1 text-xs text-gray-600">
          {equb.averageRating.toFixed(1)} ({equb.ratingCount})
        </span>
      </div>
    );
  };

  // Function to check if a winner can be selected for an equb
  const canSelectWinner = (equb) => {
    // If there's no current cycle, winner selection is disabled
    if (!currentCycle) return true;

    // If the equb ID doesn't match the current cycle's equb, we can't determine
    if (equb._id !== currentCycle.equb) return true;

    // If a winner has already been selected for the current cycle, disable selection
    return !currentCycle.hasSelectedWinner;
  };

  // Get current page equbs
  const indexOfLastEqub = currentPage * equbsPerPage;
  const indexOfFirstEqub = indexOfLastEqub - equbsPerPage;
  const currentEqubs = equbs.slice(indexOfFirstEqub, indexOfLastEqub);
  const totalPages = Math.ceil(equbs.length / equbsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <>
      {equbs.length > 0 ? (
        <div className="space-y-4">
          {currentEqubs.map((equb) => (
            <motion.div
              key={equb._id}
              whileHover={{ scale: 1.01 }}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition flex flex-col dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="mb-4 flex flex-col md:flex-row justify-between">
                <div>
                  <div className="flex items-center flex-wrap gap-2">
                    <h4 className="font-bold dark:text-white">{equb.name}</h4>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        equb.equbType === "Automatic"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      {equb.equbType === "Automatic"
                        ? "Automatic Lottery"
                        : "Special Lottery"}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Created
                    </span>
                  </div>

                  <div className="flex items-center text-gray-500 text-sm mt-1 dark:text-gray-400">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{equb.location}</span>
                  </div>

                  {/* Rating stars - show for all equbs */}
                  {renderRatingStars(equb)}

                  <div className="flex flex-wrap gap-3 mt-3">
                    <div className="text-sm flex items-center text-gray-600 dark:text-gray-300">
                      <Users className="h-4 w-4 mr-1 text-blue-600 dark:text-blue-400" />
                      {getParticipantCountDisplay(equb._id)}
                    </div>

                    <div className="text-sm flex items-center text-gray-600 dark:text-gray-300">
                      <DollarSign className="h-4 w-4 mr-1 text-blue-600 dark:text-blue-400" />
                      {equb.amountPerPerson} ETB
                    </div>

                    <div className="text-sm flex items-center text-gray-600 dark:text-gray-300">
                      <Clock className="h-4 w-4 mr-1 text-blue-600 dark:text-blue-400" />
                      {equb.cycle}
                    </div>
                  </div>

                  {joinStatus[equb._id]?.message && (
                    <div
                      className={`mt-2 text-sm ${
                        joinStatus[equb._id]?.status === "Error" ||
                        joinStatus[equb._id]?.status === "Rejected"
                          ? "text-red-600 dark:text-red-400"
                          : joinStatus[equb._id]?.status === "Pending"
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {joinStatus[equb._id]?.message}
                    </div>
                  )}

                  {/* Start Cycle status messages */}
                  {startCycleSuccess[equb._id] && (
                    <div className="mt-2 text-sm text-green-600 flex items-center dark:text-green-400">
                      <Check className="h-4 w-4 mr-1" />
                      Cycle started successfully!
                    </div>
                  )}

                  {startCycleError[equb._id] && (
                    <div className="mt-2 text-sm text-red-600 flex items-center dark:text-red-400">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {startCycleError[equb._id]}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3 mt-3 md:mt-0">
                  <button
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={() => handleShowDetails(equb)}
                  >
                    Details
                  </button>

                  {showAdminControls && (
                    <div className="flex flex-wrap gap-2">
                      {/* Conditional buttons based on equb type */}
                      {equb.equbType === "Automatic" ? (
                        <button
                          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition flex items-center text-sm"
                          onClick={() => handleStartCycle(equb._id)}
                          disabled={startCycleLoading[equb._id]}
                        >
                          {startCycleLoading[equb._id] ? (
                            <span className="animate-pulse">Starting...</span>
                          ) : (
                            <>
                              <PlayCircle className="h-3.5 w-3.5 mr-1" />
                              Start Cycle
                            </>
                          )}
                        </button>
                      ) : (
                        equb.status === "Active" && (
                          <button
                            className={`px-3 py-1.5 ${
                              canSelectWinner(equb)
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-gray-400 cursor-not-allowed"
                            } text-white rounded-lg transition flex items-center text-sm`}
                            onClick={() => handleShowManualWinnerModal(equb)}
                            disabled={
                              winnerSelectionLoading || !canSelectWinner(equb)
                            }
                            title={
                              !canSelectWinner(equb)
                                ? "A winner has already been selected for this cycle"
                                : ""
                            }
                          >
                            <UserCheck className="h-3.5 w-3.5 mr-1" />
                            Select Winner
                          </button>
                        )
                      )}

                      <button
                        className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition flex items-center text-sm"
                        onClick={() => handleShowAnnouncementModal(equb)}
                      >
                        <Megaphone className="h-3.5 w-3.5 mr-1" />
                        Announce
                      </button>
                      <button
                        className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition flex items-center text-sm"
                        onClick={() => handleEditEqub(equb)}
                        disabled={loadingMap[equb._id]}
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </button>
                      <button
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center text-sm"
                        onClick={() => handleShowDeleteConfirmation(equb)}
                        disabled={loadingMap[equb._id]}
                      >
                        {loadingMap[equb._id] ? (
                          <>
                            <span className="animate-pulse">...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Pagination */}
          {equbs.length > equbsPerPage && (
            <div className="flex justify-center items-center mt-8 gap-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg border ${
                  currentPage === 1
                    ? "text-gray-400 border-gray-200 cursor-not-allowed dark:text-gray-600 dark:border-gray-700"
                    : "text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/30"
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((num) => {
                    // Show pages that are close to the current page and the first/last page
                    return (
                      num === 1 ||
                      num === totalPages ||
                      Math.abs(num - currentPage) <= 1
                    );
                  })
                  .map((number, idx, arr) => {
                    // If there's a gap in the sequence, show ellipsis
                    if (idx > 0 && number - arr[idx - 1] > 1) {
                      return (
                        <React.Fragment key={`ellipsis-${number}`}>
                          <span className="px-3 py-1 text-gray-400 dark:text-gray-500">
                            ...
                          </span>
                          <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`px-3 py-1 rounded-lg ${
                              currentPage === number
                                ? "bg-blue-600 text-white"
                                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            }`}
                          >
                            {number}
                          </button>
                        </React.Fragment>
                      );
                    }
                    return (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-3 py-1 rounded-lg ${
                          currentPage === number
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        }`}
                      >
                        {number}
                      </button>
                    );
                  })}
              </div>

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg border ${
                  currentPage === totalPages
                    ? "text-gray-400 border-gray-200 cursor-not-allowed dark:text-gray-600 dark:border-gray-700"
                    : "text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/30"
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            You haven't created any Equbs yet.
          </p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            onClick={() => setShowPopup(true)}
          >
            Create a new Equb
          </button>
          {showPopup && (
            <CreateEqub
              isOpen={showPopup}
              onClose={() => setShowPopup(false)}
            />
          )}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedEqub && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto dark:bg-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold dark:text-white">
                Equb Details
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center flex-wrap gap-2 mb-3">
                <h4 className="font-bold text-lg dark:text-white">
                  {selectedEqub.name}
                </h4>

                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    selectedEqub.status === "Active"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : selectedEqub.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : selectedEqub.status === "Completed"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {selectedEqub.status}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    selectedEqub.equbType === "Automatic"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  }`}
                >
                  {selectedEqub.equbType === "Automatic"
                    ? "Automatic Lottery"
                    : "Special Lottery"}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Created
                </span>
              </div>

              {/* Admin buttons in details modal */}
              {showAdminControls && selectedEqub.status !== "Completed" && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedEqub.equbType === "Automatic" ? (
                    <button
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition flex items-center text-sm"
                      onClick={() => handleStartCycle(selectedEqub._id)}
                      disabled={startCycleLoading[selectedEqub._id]}
                    >
                      {startCycleLoading[selectedEqub._id] ? (
                        <span className="animate-pulse">Starting...</span>
                      ) : (
                        <>
                          <PlayCircle className="h-3.5 w-3.5 mr-1" />
                          Start Cycle
                        </>
                      )}
                    </button>
                  ) : (
                    selectedEqub.status === "Active" && (
                      <button
                        className={`px-3 py-1.5 ${
                          canSelectWinner(selectedEqub)
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-gray-400 cursor-not-allowed"
                        } text-white rounded-lg transition flex items-center text-sm`}
                        onClick={() =>
                          handleShowManualWinnerModal(selectedEqub)
                        }
                        disabled={
                          winnerSelectionLoading ||
                          !canSelectWinner(selectedEqub)
                        }
                        title={
                          !canSelectWinner(selectedEqub)
                            ? "A winner has already been selected for this cycle"
                            : ""
                        }
                      >
                        <UserCheck className="h-3.5 w-3.5 mr-1" />
                        Select Winner
                      </button>
                    )
                  )}
                </div>
              )}

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`px-4 py-2 font-medium text-sm ${
                      activeTab === "details"
                        ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab("cycles")}
                    className={`px-4 py-2 font-medium text-sm ${
                      activeTab === "cycles"
                        ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    Cycles & Winners
                  </button>
                  <button
                    onClick={() => setActiveTab("announcements")}
                    className={`px-4 py-2 font-medium text-sm ${
                      activeTab === "announcements"
                        ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    Announcements
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "details" && (
              <div className="space-y-4">
                {/* Rating display in details */}
                <div className="flex items-center">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(selectedEqub.averageRating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 dark:text-gray-500"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {selectedEqub.averageRating
                      ? selectedEqub.averageRating.toFixed(1)
                      : "0.0"}
                    ({selectedEqub.ratingCount || 0} ratings)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                    <h5 className="font-semibold text-gray-700 mb-2 dark:text-gray-200">
                      Location
                    </h5>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{selectedEqub.location}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                    <h5 className="font-semibold text-gray-700 mb-2 dark:text-gray-200">
                      Cycle
                    </h5>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{selectedEqub.cycle}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                    <h5 className="font-semibold text-gray-700 mb-2 dark:text-gray-200">
                      Members
                    </h5>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Users className="h-4 w-4 mr-2" />
                      <span>
                        {getParticipantCountDisplay(selectedEqub._id)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                    <h5 className="font-semibold text-gray-700 mb-2 dark:text-gray-200">
                      Amount Per Person
                    </h5>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>{selectedEqub.amountPerPerson} ETB</span>
                    </div>
                  </div>
                </div>

                {selectedEqub.description && (
                  <div className="mt-4">
                    <h5 className="font-semibold text-gray-700 mb-2 dark:text-gray-200">
                      Description
                    </h5>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedEqub.description || "No description provided."}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Cycles & Winners Tab */}
            {activeTab === "cycles" && (
              <div className="space-y-6">
                {/* Current Cycle Information */}
                <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                  <h5 className="font-semibold text-gray-700 mb-3 dark:text-gray-200">
                    Current Cycle
                  </h5>

                  {cycleLoading ? (
                    <div className="flex justify-center py-6">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-gray-300 border-t-blue-600"></div>
                    </div>
                  ) : currentCycle ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
                          <span className="font-medium">
                            Cycle {currentCycle.currentCycleNumber}
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full 
                          ${
                            currentCycle.status === "Active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : currentCycle.status === "Completed"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }
                        `}
                        >
                          {currentCycle.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Start Date:</span>{" "}
                          {formatDate(currentCycle.startDate)}
                        </div>

                        {currentCycle.endDate && (
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">End Date:</span>{" "}
                            {formatDate(currentCycle.endDate)}
                          </div>
                        )}

                        {selectedEqub.equbType === "Automatic" &&
                          currentCycle.nextDrawDate && (
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              <span className="font-medium">
                                Next Draw Date:
                              </span>{" "}
                              {formatDate(currentCycle.nextDrawDate)}
                            </div>
                          )}
                      </div>

                      {/* Winner selection status - show if a winner has been selected */}
                      {currentCycle.hasSelectedWinner && (
                        <div className="mt-2 text-sm text-green-600 flex items-center dark:text-green-400">
                          <Check className="h-4 w-4 mr-1" />
                          Winner has been selected for this cycle
                        </div>
                      )}

                      {/* Admin Actions for Active Cycles */}
                      {showAdminControls &&
                        currentCycle.status === "Active" && (
                          <div className="flex gap-2 mt-3">
                            {selectedEqub.equbType === "Automatic" ? (
                              <button
                                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition flex items-center text-sm"
                                onClick={() =>
                                  handleStartCycle(selectedEqub._id)
                                }
                                disabled={startCycleLoading[selectedEqub._id]}
                              >
                                <PlayCircle className="h-3.5 w-3.5 mr-1" />
                                Start Cycle
                              </button>
                            ) : (
                              <button
                                className={`px-3 py-1.5 ${
                                  !currentCycle.hasSelectedWinner
                                    ? "bg-green-500 hover:bg-green-600"
                                    : "bg-gray-400 cursor-not-allowed"
                                } text-white rounded-lg transition flex items-center text-sm`}
                                onClick={() =>
                                  handleShowManualWinnerModal(selectedEqub)
                                }
                                disabled={
                                  winnerSelectionLoading ||
                                  currentCycle.hasSelectedWinner
                                }
                                title={
                                  currentCycle.hasSelectedWinner
                                    ? "A winner has already been selected for this cycle"
                                    : ""
                                }
                              >
                                <UserCheck className="h-3.5 w-3.5 mr-1" />
                                Select Winner
                              </button>
                            )}
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500 dark:text-gray-400">
                        No active cycle found.
                      </p>

                      {showAdminControls &&
                        selectedEqub.status !== "Completed" && (
                          <button
                            className="mt-3 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition flex items-center text-sm mx-auto"
                            onClick={() => handleStartCycle(selectedEqub._id)}
                            disabled={startCycleLoading[selectedEqub._id]}
                          >
                            {startCycleLoading[selectedEqub._id] ? (
                              <span className="animate-pulse">Starting...</span>
                            ) : (
                              <>
                                <PlayCircle className="h-3.5 w-3.5 mr-1" />
                                Start First Cycle
                              </>
                            )}
                          </button>
                        )}
                    </div>
                  )}
                </div>

                {/* Winners Section */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-semibold text-gray-700 dark:text-gray-200">
                      Winners
                    </h5>

                    {/* Mark all as read button */}
                    {winners.length > 0 && winners.some((w) => !w.isRead) && (
                      <button
                        className="text-xs text-blue-600 hover:underline flex items-center dark:text-blue-400"
                        onClick={() =>
                          handleMarkAllWinnersAsRead(selectedEqub._id)
                        }
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {winnersLoading ? (
                    <div className="flex justify-center py-6">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-gray-300 border-t-blue-600"></div>
                    </div>
                  ) : winners.length > 0 ? (
                    <div className="space-y-3">
                      {winners.map((winner) => (
                        <div
                          key={winner._id}
                          className={`p-3 rounded-lg border ${
                            winner.isRead
                              ? "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                              : "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800"
                          }`}
                        >
                          <div className="flex justify-between">
                            <div className="flex items-center">
                              <Award
                                className={`h-5 w-5 mr-2 ${
                                  winner.isRead
                                    ? "text-yellow-500"
                                    : "text-blue-500"
                                }`}
                              />
                              <div>
                                <div className="font-medium dark:text-white">
                                  {winner.user.firstName} {winner.user.lastName}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Won on {formatDate(winner.winDate)} (Cycle{" "}
                                  {winner.cycleNumber})
                                </div>
                              </div>
                            </div>

                            {!winner.isRead && (
                              <button
                                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                onClick={() =>
                                  handleMarkWinnerAsRead(winner._id)
                                }
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg dark:bg-gray-700">
                      <p className="text-gray-500 dark:text-gray-400">
                        No winners yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Announcements Tab */}
            {activeTab === "announcements" && (
              <div>
                {showAdminControls && (
                  <div className="mb-4">
                    <button
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center"
                      onClick={() => handleShowAnnouncementModal(selectedEqub)}
                    >
                      <Megaphone className="h-4 w-4 mr-2" />
                      New Announcement
                    </button>
                  </div>
                )}

                <div className="space-y-4">
                  {announcementsLoading[selectedEqub._id] ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Loading announcements...
                      </p>
                    </div>
                  ) : equbAnnouncements[selectedEqub._id] &&
                    equbAnnouncements[selectedEqub._id].length > 0 ? (
                    equbAnnouncements[selectedEqub._id].map((announcement) => (
                      <div
                        key={announcement._id}
                        className="bg-gray-50 rounded-lg p-4 dark:bg-gray-700"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center">
                              <Megaphone className="h-4 w-4 text-purple-500 mr-2" />
                              <h5 className="font-medium text-gray-800 dark:text-gray-200">
                                {announcement.createdBy?.firstName || ""}{" "}
                                {announcement.createdBy?.lastName || ""}
                              </h5>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(announcement.dateCreated)}
                            </div>
                          </div>

                          {/* Edit/Delete options (only for creators) */}
                          {showAdminControls && (
                            <div className="relative group">
                              <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                                <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                              </button>
                              <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg overflow-hidden z-10 invisible group-hover:visible dark:bg-gray-800 border dark:border-gray-700">
                                <div className="py-1">
                                  <button
                                    onClick={() =>
                                      handleShowEditAnnouncementModal(
                                        announcement
                                      )
                                    }
                                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center dark:text-gray-300 dark:hover:bg-gray-700"
                                  >
                                    <Edit className="h-3.5 w-3.5 mr-2" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleShowDeleteAnnouncementConfirmation(
                                        announcement
                                      )
                                    }
                                    className="px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left flex items-center dark:text-red-400 dark:hover:bg-gray-700"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {announcement.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">
                        No announcements yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && equbToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4 dark:bg-gray-800"
            >
              <div className="text-center mb-4">
                <div className="mx-auto w-14 h-14 flex items-center justify-center bg-red-100 rounded-full mb-4 dark:bg-red-900">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1 dark:text-white">
                  Delete Equb
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">{equbToDelete.name}</span>?
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 justify-between">
                <button
                  className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setEqubToDelete(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center justify-center"
                  onClick={handleDeleteEqub}
                  disabled={loadingMap[equbToDelete._id]}
                >
                  {loadingMap[equbToDelete._id] ? (
                    <span className="inline-block animate-pulse">
                      Deleting...
                    </span>
                  ) : (
                    <>Delete</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Announcement Modal */}
      <AnimatePresence>
        {showAnnouncementModal && equbToAnnounce && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4 dark:bg-gray-800"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Megaphone className="h-5 w-5 text-purple-500 mr-2" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Make Announcement
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowAnnouncementModal(false);
                    setEqubToAnnounce(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-gray-600 mb-4 dark:text-gray-300">
                Send an announcement to all members of{" "}
                <span className="font-semibold">{equbToAnnounce.name}</span>.
              </p>

              <div className="mb-4">
                <label
                  htmlFor="announcement"
                  className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
                >
                  Announcement Message
                </label>
                <textarea
                  id="announcement"
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows="4"
                  placeholder="Type your announcement message here..."
                ></textarea>

                {announcementError && (
                  <p className="mt-1 text-sm text-red-600 flex items-center dark:text-red-400">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {announcementError}
                  </p>
                )}

                {announcementSuccess && (
                  <p className="mt-1 text-sm text-green-600 flex items-center dark:text-green-400">
                    <Check className="h-4 w-4 mr-1" />
                    Announcement sent successfully!
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => {
                    setShowAnnouncementModal(false);
                    setEqubToAnnounce(null);
                  }}
                  disabled={announcementLoading}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center"
                  onClick={handleSendAnnouncement}
                  disabled={announcementLoading}
                >
                  {announcementLoading ? (
                    <span className="inline-block animate-pulse">
                      Sending...
                    </span>
                  ) : (
                    <>
                      <Megaphone className="h-4 w-4 mr-1" />
                      Send Announcement
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Announcement Modal */}
      <AnimatePresence>
        {showEditAnnouncementModal && announcementToEdit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4 dark:bg-gray-800"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Edit className="h-5 w-5 text-yellow-500 mr-2" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Edit Announcement
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowEditAnnouncementModal(false);
                    setAnnouncementToEdit(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="edit-announcement"
                  className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
                >
                  Edit Announcement
                </label>
                <textarea
                  id="edit-announcement"
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows="4"
                  placeholder="Edit your announcement message..."
                ></textarea>

                {announcementError && (
                  <p className="mt-1 text-sm text-red-600 flex items-center dark:text-red-400">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {announcementError}
                  </p>
                )}

                {announcementSuccess && (
                  <p className="mt-1 text-sm text-green-600 flex items-center dark:text-green-400">
                    <Check className="h-4 w-4 mr-1" />
                    Announcement updated successfully!
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => {
                    setShowEditAnnouncementModal(false);
                    setAnnouncementToEdit(null);
                  }}
                  disabled={announcementLoading}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition flex items-center"
                  onClick={handleUpdateAnnouncement}
                  disabled={announcementLoading}
                >
                  {announcementLoading ? (
                    <span className="inline-block animate-pulse">
                      Updating...
                    </span>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-1" />
                      Update
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Announcement Confirmation Modal */}
      <AnimatePresence>
        {showDeleteAnnouncementModal && announcementToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4 dark:bg-gray-800"
            >
              <div className="text-center mb-4">
                <div className="mx-auto w-14 h-14 flex items-center justify-center bg-red-100 rounded-full mb-4 dark:bg-red-900">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1 dark:text-white">
                  Delete Announcement
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Are you sure you want to delete this announcement? This action
                  cannot be undone.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 justify-between">
                <button
                  className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => {
                    setShowDeleteAnnouncementModal(false);
                    setAnnouncementToDelete(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center justify-center"
                  onClick={handleDeleteAnnouncement}
                  disabled={announcementLoading}
                >
                  {announcementLoading ? (
                    <span className="inline-block animate-pulse">
                      Deleting...
                    </span>
                  ) : (
                    <>Delete</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Automatic Winner Selection Modal */}
      <AnimatePresence>
        {showWinnerModal && equbToDrawWinner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4 dark:bg-gray-800"
            >
              <div className="text-center mb-4">
                <div className="mx-auto w-14 h-14 flex items-center justify-center bg-green-100 rounded-full mb-4 dark:bg-green-900">
                  <Gift className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1 dark:text-white">
                  Select Winner
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  You are about to randomly select a winner for{" "}
                  <span className="font-semibold">{equbToDrawWinner.name}</span>
                  . This will advance the Equb to the next cycle.
                </p>
              </div>

              {winnerSelectionError && (
                <div className="mb-4 text-center text-red-600 flex items-center justify-center dark:text-red-400">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {winnerSelectionError}
                </div>
              )}

              {winnerSelectionSuccess && (
                <div className="mb-4 text-center text-green-600 flex items-center justify-center dark:text-green-400">
                  <Check className="h-5 w-5 mr-2" />
                  Winner selected successfully!
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 justify-between">
                <button
                  className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => {
                    setShowWinnerModal(false);
                    setEqubToDrawWinner(null);
                  }}
                  disabled={winnerSelectionLoading}
                >
                  Cancel
                </button>
                <button
                  className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center justify-center"
                  onClick={handleSelectWinner}
                  disabled={winnerSelectionLoading || winnerSelectionSuccess}
                >
                  {winnerSelectionLoading ? (
                    <span className="inline-block animate-pulse">
                      Selecting...
                    </span>
                  ) : (
                    <>Select Winner</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Winner Selection Modal */}
      <AnimatePresence>
        {showManualWinnerModal && equbToDrawWinner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4 dark:bg-gray-800"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <UserCheck className="h-5 w-5 text-green-500 mr-2" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Select Winner
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowManualWinnerModal(false);
                    setEqubToDrawWinner(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-gray-600 mb-4 dark:text-gray-300">
                Select a winner for{" "}
                <span className="font-semibold">{equbToDrawWinner.name}</span>{" "}
                from the eligible participants.
              </p>

              <div className="mb-4">
                <label
                  htmlFor="participant-select"
                  className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
                >
                  Select Participant
                </label>

                {participantsLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-gray-300 border-t-blue-600"></div>
                  </div>
                ) : eligibleParticipants.length > 0 ? (
                  <select
                    id="participant-select"
                    value={selectedParticipant}
                    onChange={(e) => setSelectedParticipant(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">-- Select a participant --</option>
                    {eligibleParticipants.map((participant) => (
                      <option key={participant._id} value={participant._id}>
                        {participant.user.firstName} {participant.user.lastName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-center py-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">
                      No eligible participants found.
                    </p>
                  </div>
                )}

                {manualWinnerError && (
                  <p className="mt-1 text-sm text-red-600 flex items-center dark:text-red-400">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {manualWinnerError}
                  </p>
                )}
              </div>

              {/* Switch to automatic option */}
              {equbToDrawWinner.equbType === "Special" && (
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      id="switch-automatic"
                      type="checkbox"
                      checked={switchToAutomatic}
                      onChange={(e) => setSwitchToAutomatic(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="switch-automatic"
                      className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      Switch to automatic mode for future cycles
                    </label>
                  </div>
                  <div className="mt-1 text-xs text-gray-500 flex items-center dark:text-gray-400">
                    <Info className="h-3 w-3 mr-1" />
                    Future winners will be selected automatically based on the
                    Equb cycle.
                  </div>
                </div>
              )}

              {winnerSelectionSuccess && (
                <div className="mb-4 text-center text-green-600 flex items-center justify-center dark:text-green-400">
                  <Check className="h-5 w-5 mr-2" />
                  Winner selected successfully!
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => {
                    setShowManualWinnerModal(false);
                    setEqubToDrawWinner(null);
                  }}
                  disabled={winnerSelectionLoading}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center"
                  onClick={handleSelectManualWinner}
                  disabled={
                    winnerSelectionLoading ||
                    !selectedParticipant ||
                    winnerSelectionSuccess
                  }
                >
                  {winnerSelectionLoading ? (
                    <span className="inline-block animate-pulse">
                      Selecting...
                    </span>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 mr-1" />
                      Confirm Selection
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      {showEditModal && equbToEdit && (
        <CreateEqub
          isOpen={showEditModal}
          onClose={handleEditModalClose}
          initialData={equbToEdit}
          isEditing={true}
        />
      )}
    </>
  );
};

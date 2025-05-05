import React, { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, Filter, Search, RefreshCw } from "lucide-react";

export const ComplaintsManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: "dateSubmitted", direction: "descending" });
  const [response, setResponse] = useState("");
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  // Fetch all complaints
  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/complaint/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // to include cookies for authentication
      });

      if (!response.ok) {
        throw new Error('Failed to fetch complaints');
      }

      const data = await response.json();
      setComplaints(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle resolving a complaint
  const handleResolveComplaint = (complaintId) => {
    setSelectedComplaintId(complaintId);
    setShowResponseModal(true);
  };

  // Submit complaint resolution
  const submitResolution = async () => {
    try {
      const res = await fetch(`/api/complaint/${selectedComplaintId}/resolve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ response }),
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Failed to resolve complaint');
      }

      // Update complaints list after resolution
      fetchComplaints();
      setShowResponseModal(false);
      setResponse("");
    } catch (err) {
      console.error('Error resolving complaint:', err);
      alert('Failed to resolve complaint. Please try again.');
    }
  };

  // Delete complaint (admin only)
  const handleDeleteComplaint = async (complaintId) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) {
      return;
    }

    try {
      const res = await fetch(`/api/complaint/${complaintId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Failed to delete complaint');
      }

      // Update complaints list after deletion
      fetchComplaints();
    } catch (err) {
      console.error('Error deleting complaint:', err);
      alert('Failed to delete complaint. Please try again.');
    }
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

  // Handle sort request
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Get filtered complaints
  const getFilteredComplaints = () => {
    return getSortedData(complaints).filter((complaint) => {
      const matchesSearch =
        complaint.equb?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.message?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === "all" || complaint.status === filterStatus;

      return matchesSearch && matchesFilter;
    });
  };

  // Load complaints on component mount
  useEffect(() => {
    fetchComplaints();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header section */}
      <div className="p-4 border-b flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-800">Complaints Management</h3>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {/* Search box */}
          <div className="relative flex-grow md:w-64">
            <input
              type="text"
              placeholder="Search complaints..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          
          {/* Filter dropdown */}
          <div className="relative group">
            <button className="flex items-center justify-center space-x-2 bg-white border rounded-md px-3 py-2 text-sm hover:bg-gray-50 transition-colors w-full md:w-auto">
              <Filter className="h-4 w-4" />
              <span>Filter: {filterStatus === 'all' ? 'All' : filterStatus}</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
              <div className="py-1">
                <div
                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${
                    filterStatus === "all" ? "bg-indigo-50 text-indigo-700 font-medium" : ""
                  }`}
                  onClick={() => setFilterStatus("all")}
                >
                  All Complaints
                </div>
                <div
                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${
                    filterStatus === "Pending" ? "bg-indigo-50 text-indigo-700 font-medium" : ""
                  }`}
                  onClick={() => setFilterStatus("Pending")}
                >
                  Pending
                </div>
                <div
                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${
                    filterStatus === "Resolved" ? "bg-indigo-50 text-indigo-700 font-medium" : ""
                  }`}
                  onClick={() => setFilterStatus("Resolved")}
                >
                  Resolved
                </div>
              </div>
            </div>
          </div>
          
          {/* Refresh button */}
          <button 
            onClick={fetchComplaints}
            className="flex items-center justify-center space-x-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-md px-3 py-2 text-sm hover:bg-indigo-100 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
            <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Loading complaints...</h3>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Error Loading Complaints</h3>
          <p className="text-gray-500">{error}</p>
          <button 
            onClick={fetchComplaints}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Complaints list */}
      {!loading && !error && (
        <div className="divide-y">
          {getFilteredComplaints().map((complaint) => (
            <div
              key={complaint._id}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center text-red-600 font-bold">
                    {complaint.user?.username?.charAt(0) || '?'}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900">
                    {complaint.user ? `${complaint.user.firstName} ${complaint.user.lastName}` : 'Unknown User'}

                    </h4>
                    <div className="flex flex-wrap items-center text-sm text-gray-500 mt-1">
                      <span>{complaint.equb?.name || 'Unknown Equb'}</span>
                      <span className="mx-1.5">•</span>
                      <span>{formatDate(complaint.dateSubmitted)}</span>
                    </div>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    complaint.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {complaint.status}
                </span>
              </div>
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Complaint:</h5>
                <p className="text-gray-700">{complaint.message}</p>
              </div>

              {complaint.status === "Resolved" && complaint.response && (
                <div className="mt-4 bg-green-50 p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-green-700 mb-2">Resolution:</h5>
                  <p className="text-gray-700">{complaint.response}</p>
                  <div className="text-xs text-gray-500 mt-2">
                    Resolved on: {formatDate(complaint.dateResolved)}
                  </div>
                </div>
              )}

              <div className="mt-4 flex justify-end space-x-2">
                {complaint.status === "Pending" && (
                  <button
                    className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2 rounded-md text-sm hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 flex items-center shadow-sm transition-all"
                    onClick={() => handleResolveComplaint(complaint._id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resolve
                  </button>
                )}
                <button
                  className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all"
                  onClick={() => handleDeleteComplaint(complaint._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {getFilteredComplaints().length === 0 && !loading && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <AlertTriangle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No Complaints Found
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== "all" 
                  ? "No complaints match your search criteria" 
                  : "There are no complaints in the system yet"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Resolution modal */}
      {showResponseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Resolve Complaint</h3>
              <p className="text-sm text-gray-500 mb-4">
                Please provide a resolution response for this complaint:
              </p>
              <textarea
                className="w-full border rounded-md p-3 h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your response..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
              ></textarea>
            </div>
            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
              <button
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={() => {
                  setShowResponseModal(false);
                  setResponse("");
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
                onClick={submitResolution}
                disabled={!response.trim()}
              >
                Submit Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsManagement;
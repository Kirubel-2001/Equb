import React from "react";
import { AlertTriangle, CheckCircle, Filter } from "lucide-react";

export const ComplaintsManagement = ({ 
  complaints, 
  searchTerm, 
  filterStatus, 
  setFilterStatus, 
  sortConfig, 
  handleResolveComplaint 
}) => {
  // Get filtered and sorted complaints
  const getFilteredComplaints = () => {
    return getSortedData(complaints).filter((complaint) => {
      const matchesSearch =
        complaint.equbName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.message.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === "all" || complaint.status === filterStatus;

      return matchesSearch && matchesFilter;
    });
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

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          All Complaints
        </h3>
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <button className="flex items-center space-x-2 bg-white border rounded-md px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors">
              <Filter className="h-4 w-4" />
              <span>Filter Status</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
              <div className="py-1">
                <div
                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${
                    filterStatus === "all"
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : ""
                  }`}
                  onClick={() => setFilterStatus("all")}
                >
                  All Complaints
                </div>
                <div
                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${
                    filterStatus === "Pending"
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : ""
                  }`}
                  onClick={() => setFilterStatus("Pending")}
                >
                  Pending
                </div>
                <div
                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${
                    filterStatus === "Resolved"
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : ""
                  }`}
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
          <div
            key={complaint.id}
            className="p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center text-red-600 font-bold">
                  {complaint.userName.charAt(0)}
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-900">
                    {complaint.userName}
                  </h4>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span>{complaint.equbName}</span>
                    <span className="mx-1.5">•</span>
                    <span>{complaint.dateSubmitted}</span>
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
              <p className="text-gray-700">{complaint.message}</p>
            </div>

            {complaint.status === "Pending" && (
              <div className="mt-4 flex justify-end">
                <button
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2 rounded-md text-sm hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 flex items-center shadow-sm transition-all"
                  onClick={() =>
                    handleResolveComplaint(complaint.id)
                  }
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
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No Complaints Found
          </h3>
          <p className="text-gray-500">
            No complaints match your search criteria
          </p>
        </div>
      )}
    </div>
  );
};

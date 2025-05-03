import React from "react";
import { BarChart3, Edit, Eye, Trash2, Filter, ArrowDownUp } from "lucide-react";

export const EqubsManagement = ({ 
  equbs, 
  searchTerm, 
  filterStatus, 
  setFilterStatus, 
  sortConfig, 
  requestSort, 
  handleDeleteEqub 
}) => {
  // Get filtered and sorted equbs
  const getFilteredEqubs = () => {
    return getSortedData(equbs).filter((equb) => {
      const matchesSearch =
        equb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equb.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equb.creatorName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === "all" || equb.status === filterStatus;

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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          All Equbs
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
                  All Equbs
                </div>
                <div
                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${
                    filterStatus === "Active"
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : ""
                  }`}
                  onClick={() => setFilterStatus("Active")}
                >
                  Active
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
                    filterStatus === "Completed"
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : ""
                  }`}
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
                onClick={() => requestSort("name")}
              >
                <div className="flex items-center">
                  <span>Name</span>
                  <div
                    className={`ml-1.5 transition-colors ${
                      sortConfig.key === "name"
                        ? "text-indigo-500"
                        : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  >
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
              <tr
                key={equb.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {equb.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {equb.id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {equb.location}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {equb.creatorName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {equb.participants}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {equb.amount.toLocaleString()} Birr
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {equb.cycle}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      equb.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : equb.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
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
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No Equbs Found
          </h3>
          <p className="text-gray-500">
            No Equbs match your search criteria
          </p>
        </div>
      )}
    </div>
  );
};

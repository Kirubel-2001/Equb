import React from "react";
import { Users, Edit, Eye, Trash2, Filter, ArrowDownUp } from "lucide-react";

export const UsersManagement = ({ 
  users, 
  searchTerm, 
  filterStatus, 
  setFilterStatus, 
  sortConfig, 
  requestSort, 
  handleRemoveUser 
}) => {
  // Get filtered and sorted users
  const getFilteredUsers = () => {
    return getSortedData(users).filter((user) => {
      const matchesSearch = 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesFilter =
        filterStatus === "all" || user.status === filterStatus;
        
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
          All Users
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
                  All Users
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
                    filterStatus === "Inactive"
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : ""
                  }`}
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
                onClick={() => requestSort("firstName")}
              >
                <div className="flex items-center">
                  <span>Name</span>
                  <div
                    className={`ml-1.5 transition-colors ${
                      sortConfig.key === "firstName"
                        ? "text-indigo-500"
                        : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  >
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
              <tr
                key={user.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-600 font-bold">
                      {user.firstName.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {user.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {user.role}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {user.joinDate}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">
                      {user.equbsCreated}
                    </span>{" "}
                    Created
                    <span className="mx-1">•</span>
                    <span className="font-medium">
                      {user.equbsJoined}
                    </span>{" "}
                    Joined
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
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
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No Users Found
          </h3>
          <p className="text-gray-500">
            No users match your search criteria
          </p>
        </div>
      )}
    </div>
  );
};

import React from "react";
import {
  BarChart3,
  Users,
  AlertTriangle,
  DollarSign,
  ChevronRight,
} from "lucide-react";

export const Dashboard = ({ equbs, users, complaints, setActiveTab, searchTerm }) => {
  // Stats for dashboard
  const activeEqubs = equbs.filter((equb) => equb.status === "Active").length;
  const totalParticipants = users.length;
  const pendingComplaints = complaints.filter(
    (complaint) => complaint.status === "Pending"
  ).length;
  const totalAmount = equbs.reduce(
    (sum, equb) => sum + equb.amount * equb.participants,
    0
  );

  // Lowercase searchTerm for case-insensitive search
  const search = searchTerm?.toLowerCase() || "";

  // Filter functions
  const filterEqubs = (equb) =>
    !search ||
    equb.name.toLowerCase().includes(search) ||
    equb.location?.toLowerCase().includes(search) ||
    equb.status?.toLowerCase().includes(search);

  const filterComplaints = (complaint) =>
    !search ||
    complaint.userName?.toLowerCase().includes(search) ||
    complaint.equbName?.toLowerCase().includes(search) ||
    complaint.status?.toLowerCase().includes(search) ||
    complaint.message?.toLowerCase().includes(search);

  const filterUsers = (user) =>
    !search ||
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(search) ||
    user.email?.toLowerCase().includes(search) ||
    user.status?.toLowerCase().includes(search);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* ...STAT BOXES REMAIN UNCHANGED... */}
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
                <p className="text-2xl font-semibold">
                  {totalAmount.toLocaleString()} Birr
                </p>
              </div>
            </div>
          </div>
          <div className="h-2 bg-gradient-to-r from-purple-400 to-purple-600 mt-6"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Equbs */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Equbs
            </h3>
            <button
              onClick={() => setActiveTab("equbs")}
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center focus:outline-none"
              type="button"
            >
              <span>View All</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="divide-y">
            {equbs.filter(filterEqubs).slice(0, 5).map((equb) => (
              <div
                key={equb.id}
                className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-600 font-bold">
                    {equb.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-900">{equb.name}</h4>
                    <p className="text-sm text-gray-500">
                      {equb.location} • {equb.participants} members
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      equb.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : equb.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {equb.status}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {equb.lastUpdated}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Complaints
            </h3>
            <button
              onClick={() => setActiveTab("complaints")}
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center focus:outline-none"
              type="button"
            >
              <span>View All</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="divide-y">
            {complaints.filter(filterComplaints).slice(0, 5).map((complaint) => (
              <div
                key={complaint.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center text-red-600 font-bold">
                      {complaint.userName.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-900">
                        {complaint.userName}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {complaint.equbName} • {complaint.dateSubmitted}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 h-6 rounded-full text-xs flex items-center ${
                      complaint.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {complaint.status}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                  {complaint.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            Recent Users
          </h3>
          <button
            onClick={() => setActiveTab("users")}
            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center focus:outline-none"
            type="button"
          >
            <span>View All</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Join Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Equbs
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.filter(filterUsers).slice(0, 5).map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-600 font-bold">
                        {user.firstName.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
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
                    <div className="text-sm text-gray-500">
                      Created: {user.equbsCreated} • Joined: {user.equbsJoined}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
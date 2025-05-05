import React, { useEffect, useState } from "react";
import {
  Users, Edit, Eye, Trash2, Filter, ArrowDownUp, X
} from "lucide-react";

// Toast notification component
const Toast = ({ message, type, onClose }) => (
  <div
    className={`
      fixed z-50 top-6 right-6 px-5 py-3 rounded shadow-lg flex items-center space-x-2
      ${type === "success" ? "bg-green-600 text-white" : type === "error" ? "bg-red-600 text-white" : "bg-gray-800 text-white"}
      animate-fade-in-up
    `}
    style={{ minWidth: 220 }}
  >
    <span>{message}</span>
    <button
      className="ml-2 text-white/80 hover:text-white transition"
      onClick={onClose}
      aria-label="Close"
    >
      <X className="w-4 h-4" />
    </button>
  </div>
);

// Modal with smooth zoom animation
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl p-7 animate-zoom-in">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
          onClick={onClose}
          aria-label="Close"
        >
          <X />
        </button>
        <h2 className="text-xl font-bold mb-5 text-gray-900">{title}</h2>
        <div>{children}</div>
      </div>
    </div>
  );
};

// Toast hook
const useToast = () => {
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };
  return [toast, showToast];
};

export const UsersManagement = ({
  users,
  searchTerm,
  filterStatus,
  setFilterStatus,
  sortConfig,
  requestSort,
}) => {
  const [userList, setUserList] = useState(users);
  const [equbCounts, setEqubCounts] = useState({});
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [processing, setProcessing] = useState(false);

  // Delete modal state
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleteUserName, setDeleteUserName] = useState("");

  const [toast, showToast] = useToast();

  useEffect(() => {
    setUserList(users);
  }, [users]);

  // Fetch Equb counts for all users
  useEffect(() => {
    if (!userList || userList.length === 0) return;
    let cancelled = false;
    const fetchCounts = async () => {
      const counts = {};
      await Promise.all(
        userList.map(async (user) => {
          try {
            const [createdRes, joinedRes] = await Promise.all([
              fetch(`/api/equb/created-equbs/${user.id}`),
              fetch(`/api/participant/joined-equbs/${user.id}`),
            ]);
            const createdData = await createdRes.json();
            const joinedData = await joinedRes.json();
            counts[user.id] = {
              created: Array.isArray(createdData) ? createdData.length : 0,
              joined: Array.isArray(joinedData) ? joinedData.length : 0,
            };
          } catch (err) {
            counts[user.id] = { created: 0, joined: 0 };
          }
        })
      );
      if (!cancelled) setEqubCounts(counts);
    };
    fetchCounts();
    return () => { cancelled = true; };
  }, [userList]);

  // Filtering/sorting
  const getFilteredUsers = () => {
    return getSortedData(userList).filter((user) => {
      const matchesSearch =
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterStatus === "all" || user.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  };

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

  // Actions
  const handleDeleteUser = async (userId) => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/user/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setUserList(prev => prev.filter(user => user.id !== userId));
        showToast("User deleted successfully", "success");
      } else {
        const data = await res.json();
        showToast(data.message || "Failed to delete user.", "error");
      }
    } catch (err) {
      showToast("Network error while deleting user.", "error");
    }
    setProcessing(false);
  };

  const openEditModal = (user) => {
    setEditUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      status: user.status,
      role: user.role,
      joinDate: user.joinDate,
    });
  };

  const handleEditChange = (e) => {
    setEditForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const res = await fetch(`/api/user/${editUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok) {
        setUserList((prev) =>
          prev.map((u) =>
            u.id === editUser.id
              ? { ...u, ...editForm }
              : u
          )
        );
        setEditUser(null);
        showToast("User updated successfully", "success");
      } else {
        showToast(data.message || "Failed to update user.", "error");
      }
    } catch (err) {
      showToast("Network error while updating user.", "error");
    }
    setProcessing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      {/* Toast notification */}
      {toast && <Toast {...toast} onClose={() => showToast("", "")} />}

      {/* View Modal */}
      <Modal isOpen={!!viewUser} onClose={() => setViewUser(null)} title="User Details">
        {viewUser && (
          <div className="space-y-4 text-[15px]">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-300 flex items-center justify-center text-2xl text-indigo-700 font-bold shadow">
                {viewUser.firstName.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-lg">{viewUser.firstName} {viewUser.lastName}</div>
                <div className="text-xs text-gray-400">ID: {viewUser.id}</div>
              </div>
            </div>
            <div>
              <span className="block text-gray-500">Email</span>
              <span className="font-medium">{viewUser.email}</span>
            </div>
            <div>
              <span className="block text-gray-500">Role</span>
              <span className="font-medium capitalize">{viewUser.role}</span>
            </div>
            <div>
              <span className="block text-gray-500">Status</span>
              <span className={`inline-block rounded-full px-2 py-1 text-xs ml-1 ${
                viewUser.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-700"
              }`}>
                {viewUser.status}
              </span>
            </div>
            <div>
              <span className="block text-gray-500">Join Date</span>
              <span className="font-medium">{viewUser.joinDate}</span>
            </div>
            <div>
              <span className="block text-gray-500">Equbs</span>
              <span className="font-medium">{equbCounts[viewUser.id]?.created ?? "..."} Created</span>
              <span className="mx-2">•</span>
              <span className="font-medium">{equbCounts[viewUser.id]?.joined ?? "..."} Joined</span>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        {editUser && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="flex gap-3">
              <div className="w-1/2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">First Name</label>
                <input
                  name="firstName"
                  required
                  value={editForm.firstName}
                  onChange={handleEditChange}
                  className="border rounded-lg w-full p-2 text-gray-800 bg-gray-50 focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Last Name</label>
                <input
                  name="lastName"
                  required
                  value={editForm.lastName}
                  onChange={handleEditChange}
                  className="border rounded-lg w-full p-2 text-gray-800 bg-gray-50 focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
              <input
                name="email"
                type="email"
                required
                value={editForm.email}
                onChange={handleEditChange}
                className="border rounded-lg w-full p-2 text-gray-800 bg-gray-50 focus:ring-2 focus:ring-indigo-200 transition"
              />
            </div>
            <div className="flex gap-3">
              <div className="w-1/2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Role</label>
                <select
                  name="role"
                  value={editForm.role}
                  onChange={handleEditChange}
                  className="border rounded-lg w-full p-2 bg-gray-50 text-gray-800"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="w-1/2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditChange}
                  className="border rounded-lg w-full p-2 bg-gray-50 text-gray-800"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded px-4 py-2 transition"
                onClick={() => setEditUser(null)}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded px-4 py-2 font-semibold transition"
                disabled={processing}
              >
                {processing ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        title="Delete User"
      >
        <div className="mb-6">
          <p className="text-gray-700 font-medium text-base">
            Are you sure you want to <span className="text-red-600 font-bold">delete</span>
            {" "}user <span className="font-bold">{deleteUserName}</span>?<br />
            <span className="text-sm text-gray-500">This action cannot be undone.</span>
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteUserId(null)}
            className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              await handleDeleteUser(deleteUserId);
              setDeleteUserId(null);
            }}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold"
            disabled={processing}
          >
            Delete
          </button>
        </div>
      </Modal>

      {/* Header */}
      <div className="p-5 border-b flex flex-col md:flex-row gap-3 md:gap-0 justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
        <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
          User Management
        </h3>
        <div className="flex items-center space-x-3 relative">
          <div className="relative group">
            <button className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 text-sm font-medium shadow hover:bg-gray-50 transition-colors">
              <Filter className="h-4 w-4" />
              <span>Filter Status</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block border">
              <div className="py-1">
                {["all", "Active", "Inactive"].map((s) => (
                  <div
                    key={s}
                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${
                      filterStatus === s
                        ? "bg-indigo-50 text-indigo-700 font-semibold"
                        : ""
                    }`}
                    onClick={() => setFilterStatus(s)}
                  >
                    {s === "all" ? "All Users" : s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-[15px]">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="group px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer"
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
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Join Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Equbs
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {getFilteredUsers().map((user) => (
              <tr
                key={user.id}
                className="hover:bg-indigo-50/60 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-lg shadow">
                      {user.firstName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {user.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.joinDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  <span className="font-semibold">
                    {equbCounts[user.id]?.created ?? (
                      <span className="animate-pulse text-gray-400">...</span>
                    )}
                  </span>{" "}
                  Created
                  <span className="mx-1">•</span>
                  <span className="font-semibold">
                    {equbCounts[user.id]?.joined ?? (
                      <span className="animate-pulse text-gray-400">...</span>
                    )}
                  </span>{" "}
                  Joined
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex justify-center gap-2">
                    <button
                      className="rounded-full text-indigo-500 hover:bg-indigo-50 p-2 transition"
                      onClick={() => setViewUser(user)}
                      title="View"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      className="rounded-full text-blue-500 hover:bg-blue-50 p-2 transition"
                      onClick={() => openEditModal(user)}
                      title="Edit"
                      disabled={processing}
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      className="rounded-full text-red-500 hover:bg-red-50 p-2 transition"
                      onClick={() => {
                        setDeleteUserId(user.id);
                        setDeleteUserName(`${user.firstName} ${user.lastName}`);
                      }}
                      title="Delete"
                      disabled={processing}
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

      {/* Animations */}
      <style>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.5s cubic-bezier(.4,0,.2,1);
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-zoom-in {
          animation: zoomIn .32s cubic-bezier(.4,0,.2,1);
        }
        @keyframes zoomIn {
          0% {
            opacity: 0;
            scale: .9;
          }
          100% {
            opacity: 1;
            scale: 1;
          }
        }
      `}</style>
    </div>
  );
};
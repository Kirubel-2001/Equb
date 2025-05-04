import React, { useState } from "react";
import { BarChart3, Edit, Eye, Trash2, Filter, ArrowDownUp, X, Check } from "lucide-react";

export const EqubsManagement = ({
  equbs,
  searchTerm,
  filterStatus,
  setFilterStatus,
  sortConfig,
  requestSort,
  handleDeleteEqub
}) => {
  const [viewModal, setViewModal] = useState({ isOpen: false, equb: null });
  const [editModal, setEditModal] = useState({ isOpen: false, equb: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, equbId: null });
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    numberOfParticipants: 2,
    amountPerPerson: 100,
    cycle: "Weekly",
    equbType: "Automatic",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // Handle opening the view modal
  const handleViewEqub = async (equbId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/equb/${equbId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch equb details');
      }

      const data = await response.json();
      setViewModal({ isOpen: true, equb: data });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching equb details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle opening the edit modal
  const handleOpenEditModal = async (equbId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/equb/${equbId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch equb details');
      }

      const data = await response.json();
      setFormData({
        name: data.name,
        location: data.location,
        numberOfParticipants: data.numberOfParticipants,
        amountPerPerson: data.amountPerPerson,
        cycle: data.cycle,
        equbType: data.equbType,
        description: data.description || "",
      });
      setEditModal({ isOpen: true, equb: data });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching equb details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form data changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numberOfParticipants' || name === 'amountPerPerson' 
        ? parseInt(value) 
        : value
    }));
  };

  // Handle submitting the edit form
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/equb/${editModal.equb._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update equb');
      }

      // Close modal and refresh equbs (this will depend on your app structure)
      setEditModal({ isOpen: false, equb: null });
      // You might want to add a callback to refresh the equbs data
      // refreshEqubs();
    } catch (err) {
      setError(err.message);
      console.error('Error updating equb:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle equb deletion with confirmation
  const confirmDeleteEqub = (equbId) => {
    setDeleteConfirm({ isOpen: true, equbId });
  };

  const executeDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/equb/${deleteConfirm.equbId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete equb');
      }

      // Close modal and call the parent component's delete handler
      setDeleteConfirm({ isOpen: false, equbId: null });
      handleDeleteEqub(deleteConfirm.equbId);
    } catch (err) {
      setError(err.message);
      console.error('Error deleting equb:', err);
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, equbId: null });
  };

  return (
    <>
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
                <tr key={equb.id} className="hover:bg-gray-50 transition-colors" >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                    {equb.name.length > 30 ? `${equb.name.slice(0, 30)}...` : equb.name}

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
                      <button 
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        onClick={() => handleViewEqub(equb.id)}
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button 
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        onClick={() => handleOpenEditModal(equb.id)}
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900 transition-colors"
                        onClick={() => confirmDeleteEqub(equb.id)}
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

      {/* View Equb Modal */}
      {viewModal.isOpen && viewModal.equb && (
        <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Equb Details</h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setViewModal({ isOpen: false, equb: null })}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Name</h4>
                  <p className="text-base">{viewModal.equb.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Location</h4>
                  <p className="text-base">{viewModal.equb.location}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Creator</h4>
                  <p className="text-base">{viewModal.equb.creatorName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Number of Participants</h4>
                  <p className="text-base">{viewModal.equb.participants}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Amount Per Person</h4>
                  <p className="text-base">{viewModal.equb.amount?.toLocaleString()} Birr</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Cycle</h4>
                  <p className="text-base">{viewModal.equb.cycle}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Type</h4>
                  <p className="text-base">{viewModal.equb.equbType}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                  <p className="text-base">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        viewModal.equb.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : viewModal.equb.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {viewModal.equb.status}
                    </span>
                  </p>
                </div>
              </div>
              
              {viewModal.equb.description && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                  <p className="text-base">{viewModal.equb.description}</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors"
                onClick={() => setViewModal({ isOpen: false, equb: null })}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Equb Modal */}
      {editModal.isOpen && editModal.equb && (
        <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Edit Equb</h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setEditModal({ isOpen: false, equb: null })}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitEdit}>
              <div className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Participants</label>
                    <input
                      type="number"
                      name="numberOfParticipants"
                      value={formData.numberOfParticipants}
                      onChange={handleInputChange}
                      min="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount Per Person (Birr)</label>
                    <input
                      type="number"
                      name="amountPerPerson"
                      value={formData.amountPerPerson}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cycle</label>
                    <select
                      name="cycle"
                      value={formData.cycle}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                      required
                    >
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Equb Type</label>
                    <select
                      name="equbType"
                      value={formData.equbType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                      required
                    >
                      <option value="Automatic">Automatic</option>
                      <option value="Special">Special</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                  ></textarea>
                </div>
              </div>
              
              <div className="p-4 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors"
                  onClick={() => setEditModal({ isOpen: false, equb: null })}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm font-medium text-white transition-colors flex items-center space-x-1"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Update Equb</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-center text-gray-900 mb-2">Delete Equb</h3>
              <p className="text-center text-gray-500 mb-6">
                Are you sure you want to delete this equb? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors"
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium text-white transition-colors flex items-center space-x-1"
                  onClick={executeDelete}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Equb</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
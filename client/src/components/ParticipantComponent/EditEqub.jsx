// Create a new file for the EditEqub component
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

export const EditEqub = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    numberOfParticipants: "",
    amountPerPerson: "",
    cycle: "Monthly",
    equbType: "Manual",
    description: "",
  });

  // Loading equb data if coming from the equb list
  useEffect(() => {
    const fetchEqubData = async () => {
      setIsLoading(true);
      try {
        // Check if we have equb data from the location state
        if (location.state && location.state.equb) {
          const equb = location.state.equb;
          setFormData({
            name: equb.name || "",
            location: equb.location || "",
            numberOfParticipants: equb.numberOfParticipants || "",
            amountPerPerson: equb.amountPerPerson || "",
            cycle: equb.cycle || "Monthly",
            equbType: equb.equbType || "Manual",
            description: equb.description || "",
          });
          setIsLoading(false);
          return;
        }

        // If not, fetch the equb data
        const response = await fetch(`/api/equb/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch equb data');
        }

        const equbData = await response.json();
        setFormData({
          name: equbData.name || "",
          location: equbData.location || "",
          numberOfParticipants: equbData.numberOfParticipants || "",
          amountPerPerson: equbData.amountPerPerson || "",
          cycle: equbData.cycle || "Monthly",
          equbType: equbData.equbType || "Manual",
          description: equbData.description || "",
        });
      } catch (error) {
        console.error("Error fetching equb data:", error);
        setServerError("Failed to load equb data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEqubData();
  }, [id, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setServerError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/equb/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update equb');
      }

      setSuccessMessage("Equb updated successfully!");
      
      // After a brief delay, navigate back to the my-equbs page
      setTimeout(() => {
        navigate('/my-equbs');
      }, 2000);
    } catch (error) {
      console.error("Error updating equb:", error);
      setServerError(error.message || "Failed to update equb. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/my-equbs')}
            className="flex items-center text-blue-600 hover:text-blue-800 transition mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to My Equbs
          </button>
          
          <h1 className="text-2xl font-bold text-gray-800">Edit Equb</h1>
          <p className="text-gray-600 mt-2">
            Update the details of your equb group
          </p>
        </motion.div>

        {serverError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
            <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8"
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Equb Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter equb name"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="City, Area"
                />
              </div>

              <div>
                <label htmlFor="cycle" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Cycle *
                </label>
                <select
                  id="cycle"
                  name="cycle"
                  value={formData.cycle}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Bi-weekly">Bi-weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                </select>
              </div>

              <div>
                <label htmlFor="numberOfParticipants" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Participants *
                </label>
                <input
                  type="number"
                  id="numberOfParticipants"
                  name="numberOfParticipants"
                  value={formData.numberOfParticipants}
                  onChange={handleChange}
                  required
                  min="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="How many participants"
                />
              </div>

              <div>
                <label htmlFor="amountPerPerson" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount Per Person (ETB) *
                </label>
                <input
                  type="number"
                  id="amountPerPerson"
                  name="amountPerPerson"
                  value={formData.amountPerPerson}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Amount in ETB"
                />
              </div>

              <div>
                <label htmlFor="equbType" className="block text-sm font-medium text-gray-700 mb-1">
                  Equb Type *
                </label>
                <select
                  id="equbType"
                  name="equbType"
                  value={formData.equbType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Manual">Manual Lottery</option>
                  <option value="Automatic">Automatic Lottery</option>
                </select>
              </div>

              <div className="col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional description of your equb group"
                ></textarea>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/my-equbs')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg mr-4 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                    Updating...
                  </>
                ) : (
                  "Update Equb"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
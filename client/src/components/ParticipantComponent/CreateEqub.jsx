import React, { useState, useEffect, useRef } from "react";
/* eslint-disable-next-line no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Users,
  DollarSign,
  Calendar,
  ChevronLeft,
  AlertCircle,
  RefreshCw,
  Gift,
  CheckCircle2,
  CalendarDays,
  X,
  Search,
  ChevronDown,
} from "lucide-react";
import { useSelector } from "react-redux";

export const CreateEqub = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    numberOfParticipants: "",
    amountPerPerson: "",
    cycle: "Weekly",
    equbType: "Automatic",
    description: "",
  });
  const { currentUser } = useSelector((state) => state.user);
  const [locationSearch, setLocationSearch] = useState("");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationRef = useRef(null);
  // Sample locations - replace with your actual locations
  const locations = [
    "Addis Ababa, Ethiopia",
    "Bahir Dar, Ethiopia",
    "Hawassa, Ethiopia",
    "Dire Dawa, Ethiopia",
    "Mekelle, Ethiopia",
    "Gondar, Ethiopia",
    "Jimma, Ethiopia",
    "Dessie, Ethiopia",
    "Adama, Ethiopia",
    "Bishoftu, Ethiopia",
  ];

  const filteredLocations = locations.filter((location) =>
    location.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle form submission
    try {
      const response = await fetch("/api/equb/create-equb ", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formData, userRef: currentUser.user.id }), // Sending the formData as a JSON string
      });

      if (response.ok) {
        // Handle successful submission
        const responseData = await response.json();
        console.log("Form submitted successfully", responseData);
      } else {
        console.log("Error submitting form");
      }
      console.log("Form submitted:", formData);
      onClose();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleLocationSelect = (location) => {
    setFormData({
      ...formData,
      location,
    });
    setLocationSearch("");
    setShowLocationDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5 text-white flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Create a New Equb</h1>
              <p className="text-blue-100 mt-1">
                Set up your rotating savings group
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 bg-blue-700 bg-opacity-30 hover:bg-opacity-50 transition"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-grow px-6 py-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
              <div className="flex">
                <AlertCircle className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-800">Important Note</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Physical identity verification will be required before
                    accepting participants into your Equb. Make sure to verify
                    members in person.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Equb Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="e.g., Weekly Office Savings"
                      required
                    />
                  </div>
                </div>

                <div className="relative" ref={locationRef}>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          location: e.target.value,
                        });
                        setLocationSearch(e.target.value);
                        setShowLocationDropdown(true);
                      }}
                      onClick={() => setShowLocationDropdown(true)}
                      className="block w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Search locations..."
                      required
                    />
                    <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>

                  {/* Location Dropdown */}
                  {showLocationDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Search locations..."
                            value={locationSearch}
                            onChange={(e) => setLocationSearch(e.target.value)}
                            autoFocus
                          />
                        </div>
                      </div>

                      {filteredLocations.length > 0 ? (
                        filteredLocations.map((location, index) => (
                          <div
                            key={index}
                            className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer flex items-center"
                            onClick={() => handleLocationSelect(location)}
                          >
                            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-700">{location}</span>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          No locations found. Try a different search.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="numberOfParticipants"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Number of Participants
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      id="numberOfParticipants"
                      name="numberOfParticipants"
                      value={formData.numberOfParticipants}
                      onChange={handleChange}
                      min="2"
                      className="block w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="e.g., 12"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="amountPerPerson"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Amount Per Person (ETB)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      id="amountPerPerson"
                      name="amountPerPerson"
                      value={formData.amountPerPerson}
                      onChange={handleChange}
                      min="1"
                      className="block w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="e.g., 1000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Cycle
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <select
                      id="cycle"
                      name="cycle"
                      value={formData.cycle}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none bg-white"
                      required
                    >
                      <option value="Weekly">Weekly</option>
                      <option value="Bi-weekly">Bi-weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Equb Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`border ${
                        formData.equbType === "Automatic"
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                          : "border-gray-300 bg-white"
                      } rounded-xl p-3 cursor-pointer transition-all duration-200 hover:border-blue-300`}
                      onClick={() =>
                        setFormData({ ...formData, equbType: "Automatic" })
                      }
                    >
                      <div className="flex flex-col items-center">
                        <RefreshCw
                          className={`h-7 w-7 mb-1.5 ${
                            formData.equbType === "Automatic"
                              ? "text-blue-500"
                              : "text-gray-400"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            formData.equbType === "Automatic"
                              ? "text-blue-700"
                              : "text-gray-600"
                          }`}
                        >
                          Automatic Lottery
                        </span>
                        <p className="text-xs text-center mt-1 text-gray-500">
                          System selects winners automatically
                        </p>
                      </div>
                    </div>

                    <div
                      className={`border ${
                        formData.equbType === "Special"
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                          : "border-gray-300 bg-white"
                      } rounded-xl p-3 cursor-pointer transition-all duration-200 hover:border-blue-300`}
                      onClick={() =>
                        setFormData({ ...formData, equbType: "Special" })
                      }
                    >
                      <div className="flex flex-col items-center">
                        <Gift
                          className={`h-7 w-7 mb-1.5 ${
                            formData.equbType === "Special"
                              ? "text-blue-500"
                              : "text-gray-400"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            formData.equbType === "Special"
                              ? "text-blue-700"
                              : "text-gray-600"
                          }`}
                        >
                          Special Case
                        </span>
                        <p className="text-xs text-center mt-1 text-gray-500">
                          Manually select winners as needed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                    <div className="flex items-start">
                      <CalendarDays className="h-6 w-6 text-gray-600 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-gray-800">
                          When will this Equb start?
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          The Equb will automatically start once all{" "}
                          {formData.numberOfParticipants || "required"}{" "}
                          participants have joined and been approved by you.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="block w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Describe the purpose of your Equb, who should join, etc."
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Footer Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleSubmit}
              className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm"
            >
              Create Equb
              <CheckCircle2 className="h-5 w-5 ml-1" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

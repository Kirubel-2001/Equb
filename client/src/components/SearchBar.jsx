import React, { useState, useEffect } from "react";
/* eslint-disable-next-line no-unused-vars */
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  UserPlus,
  Clock,
  PlusCircle,
  Filter,
  Users,
  DollarSign,
} from "lucide-react";
import PopularEqubs from "./PopularEqubs";

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  /* eslint-disable-next-line no-unused-vars */
  const [activeCategory, setActiveCategory] = useState("all");
  const [equbs, setEqubs] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Simulated data for demo
  useEffect(() => {
    // Simulated API call
    const fetchEqubs = () => {
      const mockEqubs = [
        {
          id: 1,
          name: "Addis Weekly Savings",
          location: "Addis Ababa, Ethiopia",
          members: 12,
          totalMembers: 15,
          amount: 1000,
          cycle: "Weekly",
          createdBy: "Abebe Kebede",
          status: "active",
          createdAt: "2025-02-15",
        },
        {
          id: 2,
          name: "Merkato Traders Fund",
          location: "Merkato, Addis Ababa",
          members: 20,
          totalMembers: 20,
          amount: 2500,
          cycle: "Monthly",
          createdBy: "Tigist Hailu",
          status: "active",
          createdAt: "2025-01-10",
        },
        {
          id: 3,
          name: "Bahir Dar Community Saving",
          location: "Bahir Dar, Ethiopia",
          members: 8,
          totalMembers: 10,
          amount: 500,
          cycle: "Bi-weekly",
          createdBy: "Daniel Tessema",
          status: "pending",
          createdAt: "2025-03-01",
        },
        {
          id: 4,
          name: "Hawassa Friends Equb",
          location: "Hawassa, Ethiopia",
          members: 5,
          totalMembers: 12,
          amount: 1500,
          cycle: "Monthly",
          createdBy: "Yonas Mekonnen",
          status: "pending",
          createdAt: "2025-03-05",
        },
        {
          id: 5,
          name: "Neighborhood Savers",
          location: "Dire Dawa, Ethiopia",
          members: 15,
          totalMembers: 15,
          amount: 800,
          cycle: "Weekly",
          createdBy: "Rahel Solomon",
          status: "active",
          createdAt: "2025-02-20",
        },
        {
          id: 6,
          name: "University Alumni Equb",
          location: "Mekelle, Ethiopia",
          members: 25,
          totalMembers: 30,
          amount: 3000,
          cycle: "Monthly",
          createdBy: "Bereket Haile",
          status: "active",
          createdAt: "2025-01-25",
        },
      ];

      setEqubs(mockEqubs);
    };

    fetchEqubs();
  }, []);
const filteredEqubs = equbs.filter((equb) => {
    if (activeCategory !== "all" && equb.status !== activeCategory)
      return false;
    
    return (
      equb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equb.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10"
      >
        <div className="flex items-center bg-white rounded-xl shadow-lg border border-gray-100 p-2">
          <div className="flex-1 min-w-0 px-4">
            <input
              type="text"
              placeholder="Search for Equb groups..."
              className="w-full text-gray-700 text-lg focus:outline-none"
              onChange={(e) => {setSearchTerm(e.target.value); setIsTyping(e.target.value.length > 0)}}
            />
          </div>
          <div className="flex items-center space-x-2 px-4">
            <select className="text-gray-700 border-r border-gray-200 pr-4 focus:outline-none">
              <option>All Locations</option>
              <option>Addis Ababa</option>
              <option>Bahir Dar</option>
              <option>Hawassa</option>
            </select>
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
              Search
            </button>
          </div>
        </div>
      </motion.div>
                {/* Popular Equbs Section */}
      
                {!isTyping && <PopularEqubs />}
      {/* All Equbs Section */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mb-8"
                >
                  <h3 className="text-xl font-bold mb-4">All Equbs</h3>
      
                  <div className="space-y-4">
                    {filteredEqubs.length > 0 ? (
                      filteredEqubs.map((equb) => (
                        <motion.div
                          key={equb.id}
                          whileHover={{ scale: 1.01 }}
                          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition flex flex-col md:flex-row justify-between"
                        >
                          <div className="mb-4 md:mb-0">
                            <div className="flex items-center">
                              <h4 className="font-bold">{equb.name}</h4>
                              <span
                                className={`ml-3 text-xs px-2 py-1 rounded-full ${
                                  equb.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {equb.status === "active" ? "Active" : "Pending"}
                              </span>
                            </div>
      
                            <div className="flex items-center text-gray-500 text-sm mt-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{equb.location}</span>
                            </div>
      
                            <div className="flex flex-wrap gap-3 mt-3">
                              <div className="text-sm flex items-center text-gray-600">
                                <Users className="h-4 w-4 mr-1 text-blue-600" />
                                {equb.members}/{equb.totalMembers} members
                              </div>
      
                              <div className="text-sm flex items-center text-gray-600">
                                <DollarSign className="h-4 w-4 mr-1 text-blue-600" />
                                {equb.amount} ETB
                              </div>
      
                              <div className="text-sm flex items-center text-gray-600">
                                <Clock className="h-4 w-4 mr-1 text-blue-600" />
                                {equb.cycle}
                              </div>
                            </div>
                          </div>
      
                          <div className="flex items-center space-x-3">
                            <button className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition">
                              Details
                            </button>
      
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center">
                              <UserPlus className="h-4 w-4 mr-1" />
                              Join
                            </button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">
                          No Equbs found matching your criteria.
                        </p>
                        <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                          Create a new Equb
                        </button>
                      </div>
                    )}
                  </div>
                </motion.section>
    </div>
  );
}

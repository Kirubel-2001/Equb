import { useState } from "react";
/* eslint-disable-next-line no-unused-vars */
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export default function EqubCard() {
  const [activeEqubs] = useState([
    {
      id: 1,
      name: "Weekly Savings Group",
      members: 12,
      amount: 1000,
      cycle: "Weekly",
      location: "Addis Ababa",
      spotsLeft: 3,
      progress: 75,
    },
    {
      id: 2,
      name: "Monthly Business Equb",
      members: 20,
      amount: 5000,
      cycle: "Monthly",
      location: "Bahir Dar",
      spotsLeft: 5,
      progress: 45,
    },
    {
      id: 3,
      name: "Quarter Investment Group",
      members: 15,
      amount: 10000,
      cycle: "Quarterly",
      location: "Hawassa",
      spotsLeft: 2,
      progress: 90,
    },
  ]);
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Popular Equb Groups
            </h2>
            <p className="mt-2 text-gray-600">
              Join active groups or create your own
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-indigo-600 hover:text-indigo-500 flex items-center"
          >
            View all <ChevronRight className="w-4 h-4 ml-1" />
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeEqubs.map((equb, index) => (
            <motion.div
              key={equb.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {equb.name}
                    </h3>
                    <p className="text-gray-600">{equb.location}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {equb.spotsLeft} spots left
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Members:</span>
                    <span className="font-medium">{equb.members}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">{equb.amount} ETB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Cycle:</span>
                    <span className="font-medium">{equb.cycle}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{equb.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${equb.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Join Group
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

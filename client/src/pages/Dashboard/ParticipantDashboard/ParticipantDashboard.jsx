import React, { useState } from "react";
import { SideBar } from "../../../components/ParticipantComponent/SideBar";
import { Dashboard } from "./Dashboard";
import { DashboardHeader } from "../../../components/DashboardHeader";
import Footer from "../../../components/Footer";

export const ParticipantDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800 flex">
      {/* Sidebar */}
      <SideBar onToggle={setIsSidebarOpen} />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "ml-60" : "ml-20"
        } flex-1`}
      >
        {/* Header */}
        <DashboardHeader />
        <main>
          {/* Dashboard */}
          <Dashboard />
          {/* Footer */}
          <Footer />
        </main>
      </div>
    </div>
  );
};

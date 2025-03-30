import React, { useState } from "react";
import { SideBar } from "../../../components/ParticipantComponent/SideBar";
import { Dashboard } from "./Dashboard";
import { DashboardHeader } from "../../../components/DashboardHeader";
import Footer from "../../../components/Footer";
import { MyEqubs } from "./MyEqubs";

export const ParticipantDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDashboardOpen, setIsDashboardOpen] = useState(true);
  const [isMyEqubsOpen, setIsMyEqubsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800 flex">
      {/* Sidebar */}
      <SideBar onToggle={setIsSidebarOpen} onDashboardToggle={setIsDashboardOpen}  onMyEqubsToggle={setIsMyEqubsOpen}/>

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
          {isDashboardOpen && <Dashboard />}
          {isMyEqubsOpen && <MyEqubs />}
          {/* Footer */}
          <Footer />
        </main>
      </div>
    </div>
  );
};

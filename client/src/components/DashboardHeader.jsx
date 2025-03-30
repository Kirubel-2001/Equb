import Profile from "./Profile";

export function DashboardHeader() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10 p-4 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
      </div>
      {/* Profile */}
      <Profile />
    </header>
  );
}

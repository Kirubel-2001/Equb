import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Signin } from "./pages/Home/Signin";
import Home from "./pages/Home/Home";
import Profile from "./components/Profile";
import { SignUp } from "./pages/Home/SignUp";
import { Header } from "./components/Header";
import { ParticipantDashboard } from "./pages/Dashboard/ParticipantDashboard/ParticipantDashboard";
import { AdminDashboard } from "./pages/Dashboard/AdminDashboard/AdminDashboard";
import { About } from "./pages/Home/About";
import Contact from "./pages/Home/Contact";
import { FindEqub } from "./components/FindEqub";
import SearchBar from "./components/SearchBar";
import { MyEqubs } from "./pages/Dashboard/ParticipantDashboard/MyEqubs";
import { SideBar } from "./components/ParticipantComponent/SideBar";
import PrivateRoute from "./components/PrivateRoute";
import { Dashboard } from "./pages/Dashboard/ParticipantDashboard/Dashboard";
import { DashboardHeader } from "./components/DashboardHeader";
// import MyEqubs from './pages/Dashboard/MyEqub'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/header" element={<Header />} />
        <Route path="/about" element={<About />} />
        <Route path="/find" element={<FindEqub />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/search" element={<SearchBar />} />
        <Route path="/sidebar" element={<SideBar />} />
        <Route path="/dashboard-header" element={<DashboardHeader />} />

        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/myequbs" element={<MyEqubs />} />
        </Route>
        {/* Admin-only route */}
        <Route element={<PrivateRoute allowedRoles={["Admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Participant-only route */}
        <Route element={<PrivateRoute allowedRoles={["Participant"]} />}>
          <Route path="/participant" element={<ParticipantDashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

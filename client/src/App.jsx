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
import SearchBar from "./components/SearchBar";
import { MyEqubs } from "./pages/Dashboard/ParticipantDashboard/MyEqubs";
import { SideBar } from "./components/ParticipantComponent/SideBar";
import PrivateRoute from "./components/PrivateRoute";
import { DashboardHeader } from "./components/DashboardHeader";
import { CreateEqub } from "./components/ParticipantComponent/CreateEqub";
import { AllEqubs } from "./components/ParticipantComponent/AllEqubs";
import { EditEqub } from "./components/ParticipantComponent/EditEqub";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/header" element={<Header />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/search" element={<SearchBar />} />
        <Route path="/sidebar" element={<SideBar />} />
        <Route path="/dashboard-header" element={<DashboardHeader />} />
        <Route path="/all-equbs" element={<AllEqubs />} />

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
          <Route path="/create" element={<CreateEqub />} />
          <Route path="/edit-equb/:id" element={<EditEqub />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

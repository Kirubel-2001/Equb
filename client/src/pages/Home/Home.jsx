import React, { useState } from "react";
import {
  Users,
  Calendar,
  DollarSign,
  Shield,
  Award,
  TrendingUp,
  Search, // Added Search for potential use in SearchBar, though not explicitly used here
} from "lucide-react";
/* eslint-disable-next-line no-unused-vars */
import { motion } from "framer-motion";
import { Header } from "../../components/Header";
import Footer from "../../components/Footer";
import SearchBar from "../../components/SearchBar"; // Assuming SearchBar has modern styling
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AllEqubs } from "../../components/ParticipantComponent/AllEqubs"; // Assuming these render modern cards
import PopularEqubs from "../../components/PopularEqubs"; // Assuming these render modern cards

const Home = () => {
  const { currentUser } = useSelector((state) => state.user);
  /* eslint-disable-next-line no-unused-vars */
  const [showPopup, setShowPopup] = useState(false);
  /* eslint-disable-next-line no-unused-vars */
  const [amountFilter, setAmountFilter] = useState({ min: "", max: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar Section */}
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 pt-16 relative overflow-hidden">
        {/* Optional: Add subtle background shapes/patterns */}
        {/* <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-400 rounded-full opacity-20 -translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-400 rounded-full opacity-20 translate-x-20 translate-y-20"></div> */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl tracking-tight"
            >
              The Modern Way to <span className="text-indigo-300">Equb</span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="mt-4 max-w-md mx-auto text-lg text-indigo-100 sm:text-xl md:mt-6 md:max-w-3xl"
            >
              Join trusted rotating savings circles, manage contributions
              seamlessly, and achieve your financial goals, together.
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto rounded-lg bg-white px-8 py-3 text-base font-semibold text-indigo-600 shadow-md hover:bg-indigo-50 transition duration-300 ease-in-out"
                onClick={() => {
                  if (currentUser) {
                    const userRole = currentUser?.user?.role;
                    navigate(userRole === "Admin" ? "/admin" : "/participant");
                  } else {
                    navigate("/signup");
                  }
                }}
              >
                {currentUser ? "Go to Dashboard" : "Get Started Free"}
              </motion.button>
              <Link to="/about" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto rounded-lg bg-white/5 px-8 py-3 text-base font-semibold text-white shadow-md backdrop-blur-sm hover:bg-white/10 border border-white/20 transition duration-300 ease-in-out"
                >
                  Learn More
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Curved bottom */}
        <div className="relative h-16 md:h-24">
          <div className="absolute bottom-0 inset-x-0">
            <svg
              viewBox="0 0 1440 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
              preserveAspectRatio="none" // Ensures it scales correctly
            >
              <path
                fill="rgb(249 250 251)" // Corresponds to bg-gray-50
                d="M0 100H1440V0C1440 0 1144 100 720 100C296 100 0 0 0 0V100Z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Search Bar Section */}
      <div className="py-12 bg-gray-50">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          // You might want to pass amountFilter setters here if SearchBar handles it
          // setAmountFilter={setAmountFilter}
        />
      </div>

      {/* Popular Equbs Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <PopularEqubs
            searchTerm={searchTerm}
            activeCategory={activeCategory}
            amountFilter={amountFilter}
          />
        </div>
      </div>

      {/* All Equbs Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-gray-900 text-center mb-12"
          >
            Explore All Equbs
          </motion.h2>
          <AllEqubs
            searchTerm={searchTerm}
            activeCategory={activeCategory}
            amountFilter={amountFilter}
            setShowPopup={setShowPopup} // Assuming AllEqubs uses this
          />
        </div>
      </div>


      {/* Features Section */}
      <div className="py-20 bg-white"> {/* Changed background for contrast */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }} // Animate when in view
            viewport={{ once: true, amount: 0.3 }} // Trigger animation once
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl tracking-tight">
              Why Choose Our Platform?
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the time-tested benefits of Equb enhanced with modern
              technology for security, convenience, and transparency.
            </p>
          </motion.div>

          <motion.div
             initial="hidden"
             whileInView="visible" // Animate when in view
             viewport={{ once: true, amount: 0.2 }} // Trigger animation once
             variants={containerVariants}
             className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { icon: Shield, title: "Secure & Trusted", description: "Verified members, encrypted data, and transparent transaction logs." },
              { icon: Users, title: "Community Driven", description: "Connect and save with trusted friends, family, or new connections." },
              { icon: Calendar, title: "Flexible Cycles", description: "Choose from weekly, bi-weekly, or monthly cycles that fit your needs." },
              { icon: DollarSign, title: "Automated & Easy", description: "Simplified contributions, automatic reminders, and clear payout schedules." },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-indigo-100 flex flex-col items-center text-center transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-5">
                  <feature.icon className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <motion.dl
             initial="hidden"
             whileInView="visible" // Animate when in view
             viewport={{ once: true, amount: 0.3 }} // Trigger animation once
             variants={containerVariants}
            className="grid grid-cols-1 gap-y-12 md:grid-cols-3 md:gap-x-8 md:gap-y-0 text-center"
           >
            {[
              { icon: Users, value: "10,000+", label: "Active Members" },
              { icon: Award, value: "1,000+", label: "Successful Equbs" },
              { icon: TrendingUp, value: "5M+ ETB", label: "Total Saved" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="flex flex-col items-center text-white"
              >
                 <div className="bg-white/10 rounded-full w-16 h-16 mb-4 flex items-center justify-center ring-1 ring-white/20">
                  <stat.icon className="w-8 h-8" />
                </div>
                <dt className="text-4xl font-bold tracking-tight order-last mt-2">{stat.value}</dt>
                <dd className="text-base text-indigo-200">{stat.label}</dd>
              </motion.div>
            ))}
          </motion.dl>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
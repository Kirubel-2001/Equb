import React, { useState } from "react";
import {
  Users,
  Calendar,
  DollarSign,
  Shield,
  Award,
  TrendingUp,
} from "lucide-react";
/* eslint-disable-next-line no-unused-vars */
import { motion } from "framer-motion";
import { Header } from "../../components/Header";
import Footer from "../../components/Footer";
import SearchBar from "../../components/SearchBar";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AllEqubs } from "../../components/ParticipantComponent/AllEqubs";

const Home = () => {
  const { currentUser } = useSelector((state) => state.user);
  /* eslint-disable-next-line no-unused-vars */
  const [showPopup, setShowPopup] = useState(false);
  /* eslint-disable-next-line no-unused-vars */
  const [amountFilter, setAmountFilter] = useState({ min: "", max: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Section */}
      <Header />

      {/* Hero Section */}
      <div className="bg-indigo-600 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
              Modern Equb Management Platform
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-indigo-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Join trusted rotating savings groups, manage your contributions,
              and achieve your financial goals together.
            </p>
            <div className="mt-10 flex justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-md bg-white px-6 py-3 text-base font-medium text-indigo-600 shadow-sm hover:bg-indigo-50"
                onClick={() => {
                  if (currentUser) {
                    const userRole = currentUser?.user?.role;
                    if (userRole === "Admin") {
                      navigate("/admin");
                    } else if (userRole === "Participant") {
                      navigate("/participant");
                    }
                  } else {
                    navigate("/signup");
                  }
                }}
              >
                {currentUser ? "Go to Dashboard" : "Get Started"}
              </motion.button>
              <Link to="/about">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-md bg-indigo-500 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-400"
                >
                  Learn More
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Curved bottom */}
        <div className="relative h-16">
          <div className="absolute bottom-0 inset-x-0">
            <svg
              viewBox="0 0 1440 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <path
                fill="rgb(249 250 251)"
                d="M0 100H1440V0C1440 0 1144 100 720 100C296 100 0 0 0 0V100Z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Search Bar - passing state and setter functions */}
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {/* AllEqubs Component - passing down all required props */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AllEqubs
          searchTerm={searchTerm}
          activeCategory={activeCategory}
          amountFilter={amountFilter}
          setShowPopup={setShowPopup}
        />
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900">
            Why Choose Our Platform?
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Experience the benefits of traditional Equb with modern convenience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Shield,
              title: "Secure & Trusted",
              description: "Identity verification and secure payment tracking",
            },
            {
              icon: Users,
              title: "Community Driven",
              description: "Join groups with like-minded savers",
            },
            {
              icon: Calendar,
              title: "Flexible Cycles",
              description: "Weekly, monthly, or custom saving periods",
            },
            {
              icon: DollarSign,
              title: "Transparent",
              description: "Clear tracking of all contributions and payouts",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.4 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Users, value: "10,000+", label: "Active Members" },
              { icon: Award, value: "1,000+", label: "Successful Equbs" },
              { icon: TrendingUp, value: "5M+ ETB", label: "Total Savings" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="text-white"
              >
                <div className="bg-indigo-500 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-indigo-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;

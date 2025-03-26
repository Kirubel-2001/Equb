import React, { useState } from "react";
/* eslint-disable-next-line no-unused-vars */
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  CheckCircle,
  X,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer";
import { Header } from "../../components/Header";

// SignUp Page Component
export const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formSubmitError, setFormSubmitError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitError("");

    if (currentStep === totalSteps && validateStep2()) {
      try {
        setIsLoading(true);

        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Registration failed");
        }

        // Store token in localStorage for authentication
        localStorage.setItem("token", data.token);

        // Redirect to login or dashboard on success
        window.location.href = "/signin";
      } catch (err) {
        setFormSubmitError(
          err.message ||
            "An error occurred during registration. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div>
      <Header />
      {/*   Header bg */}
      <div className="relative bg-indigo-600 h-16">
        <div className="absolute bottom-0 inset-x-0">
          <svg
            viewBox="0 0 0 0"
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

      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col justify-center py-10">
        <div className="max-w-md mx-auto w-full px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <Link
                to="/"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to home
              </Link>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Create your account
              </h1>
              <p className="mt-2 text-gray-600">
                Join the Equb community today
              </p>
            </div>

            {/* Step indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <React.Fragment key={index}>
                    {/* Step circle */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                          currentStep > index + 1
                            ? "bg-indigo-600 border-indigo-600"
                            : currentStep === index + 1
                            ? "border-indigo-600 text-indigo-600"
                            : "border-gray-300 text-gray-400"
                        }`}
                      >
                        {currentStep > index + 1 ? (
                          <CheckCircle size={16} className="text-white" />
                        ) : (
                          <span className="text-sm font-medium">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs mt-1 ${
                          currentStep >= index + 1
                            ? "text-indigo-600"
                            : "text-gray-500"
                        }`}
                      >
                        {index === 0 ? "Personal Info" : "Security"}
                      </span>
                    </div>

                    {/* Connector line between steps */}
                    {index < totalSteps - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 ${
                          currentStep > index + 1
                            ? "bg-indigo-600"
                            : "bg-gray-300"
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {formSubmitError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start"
              >
                <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{formSubmitError}</span>
                <button
                  onClick={() => setFormSubmitError("")}
                  className="ml-auto"
                >
                  <X size={18} />
                </button>
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        First Name*
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User size={20} className="text-gray-400" />
                        </div>
                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          value={formData.firstName}
                          onChange={handleChange}
                          className={`block w-full pl-10 pr-3 py-3 border ${
                            errors.firstName
                              ? "border-red-300"
                              : "border-gray-300"
                          } rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-900`}
                          placeholder="John"
                        />
                      </div>
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Last Name*
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`block w-full px-3 py-3 border ${
                          errors.lastName ? "border-red-300" : "border-gray-300"
                        } rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-900`}
                        placeholder="Doe"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email address*
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={20} className="text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-3 border ${
                          errors.email ? "border-red-300" : "border-gray-300"
                        } rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-900`}
                        placeholder="you@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Phone number*
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone size={20} className="text-gray-400" />
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-3 border ${
                          errors.phone ? "border-red-300" : "border-gray-300"
                        } rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-900`}
                        placeholder="+251 911 234 567"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="pt-4">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={handleNextStep}
                      className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Continue
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Security */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Password*
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock size={20} className="text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-10 py-3 border ${
                          errors.password ? "border-red-300" : "border-gray-300"
                        } rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-900`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff
                            size={20}
                            className="text-gray-400 hover:text-gray-500"
                          />
                        ) : (
                          <Eye
                            size={20}
                            className="text-gray-400 hover:text-gray-500"
                          />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.password}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Password must be at least 8 characters long
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Confirm Password*
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock size={20} className="text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-10 py-3 border ${
                          errors.confirmPassword
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-900`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff
                            size={20}
                            className="text-gray-400 hover:text-gray-500"
                          />
                        ) : (
                          <Eye
                            size={20}
                            className="text-gray-400 hover:text-gray-500"
                          />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        checked={agreeToTerms}
                        onChange={() => setAgreeToTerms(!agreeToTerms)}
                        className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ${
                          errors.agreeToTerms ? "border-red-300" : ""
                        }`}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="terms" className="text-gray-700">
                        I agree to the{" "}
                        <a
                          href="#"
                          className="text-indigo-600 hover:text-indigo-500"
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="#"
                          className="text-indigo-600 hover:text-indigo-500"
                        >
                          Privacy Policy
                        </a>
                      </label>
                      {errors.agreeToTerms && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.agreeToTerms}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={handlePrevStep}
                      className="w-1/3 flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Back
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={isLoading}
                      className={`w-2/3 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        isLoading ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/signin"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

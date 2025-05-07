import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  deleteUserFailure,
  deleteUserSuccess,
  signOutUserStart,
} from "../redux/User/userSlice";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Modal for updating profile
  const [showUpdate, setShowUpdate] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // User state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Profile form state
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirm: "",
  });

  const [updateLoading, setUpdateLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [pwMsg, setPwMsg] = useState(null);

  // Check token validity on component mount and periodically
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/user/me', {
          credentials: 'include'
        });
        
        if (!res.ok) {
          // If response is not ok, token is invalid or expired
          handleTokenExpired();
          return;
        }
        
        const userData = await res.json();
        setUser(userData);
        setForm({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.phone || '',
        });
        setLoading(false);
      } catch (err) {
        handleTokenExpired();
      }
    };

    // Function to handle token expiration
    const handleTokenExpired = () => {
      dispatch(deleteUserSuccess(null));
      setLoading(false);
      navigate("/");
    };

    checkAuth();

    // Periodically check token validity (every 5 minutes)
    const intervalId = setInterval(checkAuth, 5 * 60 * 1000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [dispatch, navigate]);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/user/me', {
          credentials: 'include'
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch user data');
        }
        
        const userData = await res.json();
        setUser(userData);
        setForm({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.phone || '',
        });
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        // If fetching user data fails, redirect to home
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch("/api/auth/signout");
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
      navigate("/");
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  // Handle clicks outside dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle profile form input
  const handleInputChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle password form input
  const handlePasswordInput = (e) => {
    setPasswordForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Update Profile submit (firstName, lastName, phone)
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setMsg(null);
    try {
      const updates = { ...form };
      // Using /profile endpoint instead of /me to avoid the ObjectId error
      const res = await fetch(`/api/user/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        // Check if the error is due to auth failure
        if (res.status === 401) {
          dispatch(deleteUserSuccess(null));
          navigate("/");
          return;
        }
      }

      const data = await res.json();
      if (res.ok) {
        // Update local user state with new data
        setUser(prev => ({
          ...prev,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone
        }));
        
        setMsg({ type: "success", text: "Profile updated!" });
        setTimeout(() => {
          setShowUpdate(false);
          setMsg(null);
        }, 1200);
      } else {
        setMsg({ type: "error", text: data.message || "Update failed" });
      }
    } catch (error) {
      setMsg({ type: "error", text: error.message });
    }
    setUpdateLoading(false);
  };

  // Update Password submit
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (!passwordForm.password || !passwordForm.confirm) {
      setPwMsg({ type: "error", text: "Please fill both fields." });
      return;
    }
    if (passwordForm.password.length < 6) {
      setPwMsg({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    if (passwordForm.password !== passwordForm.confirm) {
      setPwMsg({ type: "error", text: "Passwords do not match." });
      return;
    }
    setUpdateLoading(true);
    try {
      const updates = { password: passwordForm.password };
      // Using /profile endpoint instead of /me to avoid the ObjectId error
      const res = await fetch(`/api/user/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        // Check if the error is due to auth failure
        if (res.status === 401) {
          dispatch(deleteUserSuccess(null));
          navigate("/");
          return;
        }
      }

      const data = await res.json();
      if (res.ok) {
        setPwMsg({ type: "success", text: "Password updated!" });
        setPasswordForm({ password: "", confirm: "" });
        setTimeout(() => {
          setShowChangePassword(false);
          setPwMsg(null);
        }, 1200);
      } else {
        setPwMsg({ type: "error", text: data.message || "Update failed" });
      }
    } catch (error) {
      setPwMsg({ type: "error", text: error.message });
    }
    setUpdateLoading(false);
  };

  // Show loading state while fetching user data
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-300">Loading profile...</span>
      </div>
    );
  }

  // Show error message if fetching user data failed
  if (error) {
    return (
      <div className="text-red-600 p-4 rounded-md bg-red-50 dark:bg-red-900/20 dark:text-red-400">
        <p>Error loading profile: {error}</p>
        <p className="mt-1 text-sm">Redirecting to home page...</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-2 bg-blue-600 text-white py-1 px-3 rounded-md font-medium hover:bg-blue-700 transition-colors text-sm"
        >
          Go to Home
        </button>
      </div>
    );
  }

  // If no user data available
  if (!user) {
    return (
      <div className="text-gray-600 dark:text-gray-300 p-4">
        <p>No profile data found. Session may have expired.</p>
        <p className="mt-1 text-sm">Redirecting to home page...</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-2 bg-blue-600 text-white py-1 px-3 rounded-md font-medium hover:bg-blue-700 transition-colors text-sm"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      {/* Profile Button with Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 bg-blue-100 hover:bg-blue-200 rounded-full py-1 px-4 transition-colors border border-blue-300 dark:bg-blue-900 dark:border-blue-700 dark:hover:bg-blue-800 dark:text-white"
        >
          <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-medium">
              {user.firstName?.[0] || user.email?.[0] || '?'}
            </span>
          </div>
          <span className="font-medium text-gray-800 dark:text-gray-100">
            {user.firstName} {user.lastName}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 text-gray-600 dark:text-gray-400"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        <div
          className={`absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-20 border border-gray-100 dark:border-gray-700 origin-top-right transition-transform duration-200 ${
            isOpen ? "scale-100" : "scale-0"
          }`}
        >
          <div className="p-4 flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-medium">
                {user.firstName?.[0] || user.email?.[0] || '?'}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
          <div className="p-2 flex flex-col space-y-1">
            <button
              type="button"
              onClick={() => {
                setShowUpdate(true);
                setIsOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-3 text-gray-600 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536M9 13h3l9-9a1.5 1.5 0 00-2.121-2.121l-9 9v3z"
                />
              </svg>
              Update Profile
            </button>
            <button
              type="button"
              onClick={() => {
                setShowChangePassword(true);
                setIsOpen(false);
              }}
              className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-3 text-gray-600 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Change Password
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Update Profile Modal */}
      {showUpdate && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-11/12 sm:w-96 p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              onClick={() => {
                setShowUpdate(false);
                setMsg(null);
                setForm({
                  firstName: user.firstName || '',
                  lastName: user.lastName || '',
                  phone: user.phone || '',
                });
              }}
              title="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Update Profile</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border rounded-md py-2 px-3 text-base focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border rounded-md py-2 px-3 text-base focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border rounded-md py-2 px-3 text-base focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              {msg && (
                <div
                  className={`text-sm ${
                    msg.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {msg.text}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors"
                disabled={updateLoading}
              >
                {updateLoading ? "Updating..." : "Update"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-11/12 sm:w-96 p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              onClick={() => {
                setShowChangePassword(false);
                setPwMsg(null);
                setPasswordForm({ password: "", confirm: "" });
              }}
              title="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Change Password</h2>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={passwordForm.password}
                  onChange={handlePasswordInput}
                  className="mt-1 block w-full border rounded-md py-2 px-3 text-base focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  minLength={6}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirm"
                  value={passwordForm.confirm}
                  onChange={handlePasswordInput}
                  className="mt-1 block w-full border rounded-md py-2 px-3 text-base focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  minLength={6}
                  autoComplete="new-password"
                  required
                />
              </div>
              {pwMsg && (
                <div
                  className={`text-sm ${
                    pwMsg.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {pwMsg.text}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors"
                disabled={updateLoading}
              >
                {updateLoading ? "Updating..." : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
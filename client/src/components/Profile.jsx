import { useState } from "react";
import {Bell} from "lucide-react";
import { useDispatch } from "react-redux";
import { deleteUserFailure, deleteUserSuccess, signOutUserStart } from "../redux/User/userSlice";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    /* eslint-disable-next-line no-unused-vars */
    const [notificationsCount, setNotificationsCount] = useState(3);
    
  const navigate = useNavigate();
    const dispatch = useDispatch();

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
        navigate("/")
      } catch (error) {
        dispatch(deleteUserFailure(error.message));
      }
    };
  return (
    <div className="flex items-center space-x-4">
    <div className="relative">
      <Bell className="h-6 w-6 text-gray-500 hover:text-blue-600 cursor-pointer" />
      {notificationsCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
          {notificationsCount}
        </span>
      )}
    </div>
    
    {/* Profile Button with Dropdown - Matching the provided image */}
    <div className="relative group">
      <button className="flex items-center space-x-2 bg-blue-100 hover:bg-blue-200 rounded-full py-1 px-4 transition-colors border border-blue-300">
        <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-medium">K</span>
        </div>
        <span className="font-medium text-gray-800">Kirubel Tesfaw</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-600">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>
      
      {/* Dropdown Menu */}
      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-20 border border-gray-100 scale-0 group-hover:scale-100 origin-top-right transition-transform duration-200">
        <div className="p-4 flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-medium">K</span>
          </div>
          <div>
            <p className="font-medium text-gray-800">Kirubel Tesfaw</p>
            <p className="text-sm text-gray-500">Kirubel@gmail.com</p>
          </div>
        </div>
        <div className="p-2">
          <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Change Password
          </a>
          <a onClick={handleSignOut}  className="flex items-center px-3 py-2 text-red-600 hover:bg-gray-100 rounded-md transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </a>
        </div>
      </div>
    </div>
  </div>
  )
}

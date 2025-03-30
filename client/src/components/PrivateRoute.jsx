import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";

export default function PrivateRoute({ allowedRoles = [] }) {
  const { currentUser } = useSelector((state) => state.user);

  if (!currentUser) return <Navigate to="/signin" />;

  if (allowedRoles.length && !allowedRoles.includes(currentUser?.user?.role)) {
    // User does not have any of the allowed roles
    return <Navigate to="/" />;
  }
  return <Outlet />;
}

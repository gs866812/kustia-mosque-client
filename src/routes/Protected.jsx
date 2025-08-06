import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import ContextData from "../ContextData";


const Protected = ({ children }) => {
  const { user, loading } = useContext(ContextData);
  const location = useLocation();

  // ⏳ Wait until Firebase auth check completes
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // ❌ If no user, redirect to login and preserve path
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ Authenticated, render the protected children
  return children;
};

export default Protected;

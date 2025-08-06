import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import ContextData from "./ContextData";



const GuestRoute = ({ children }) => {
  const { user, loading } = useContext(ContextData);
  const location = useLocation();

  if (loading) return <p className="text-center mt-10">লোড হচ্ছে...</p>;

  if (user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default GuestRoute;

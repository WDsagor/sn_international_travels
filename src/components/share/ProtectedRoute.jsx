import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  // আপনার Auth State বা LocalStorage থেকে টোকেন/ইউজার ডাটা চেক করুন
  const isAuthenticated = localStorage.getItem("token"); // অথবা আপনার Auth Context/State

  // লগইন না থাকলে লগইন পেজে পাঠিয়ে দেবে
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // লগইন থাকলে প্রাইভেট পেজগুলো দেখাবে
  return <Outlet />;
};

export default ProtectedRoute;

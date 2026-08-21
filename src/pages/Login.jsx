import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/SN-logo.png";
import { useLoginUserMutation } from "../redux/features/user/userApi";
import Swal from "sweetalert2";

const backgroundImageUrl =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginUser, { isLoading }] = useLoginUserMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      console.log("Login Data Submitted:", data);
      const res = await loginUser(data).unwrap();
      localStorage.setItem("token", res.token);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Log in Successfully!",
        confirmButtonColor: "#2563eb", // Tailwind blue-600
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/");
    } catch (err) {
      // console.log(error);
      Swal.fire({
        icon: "error",
        title: "Login failed!",
        text: err?.data?.message || "Failed to login. Please try again.",
        confirmButtonColor: "#dc2626", // Tailwind red-600
      });
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat p-4 relative"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      {/* ব্যাকগ্রাউন্ড ওভারলে */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs"></div>

      {/* গ্লাসমোরফিজম লগইন কার্ড */}
      <div className="relative z-10 bg-white/15 rounded-3xl shadow-2xl border border-white/20 w-full max-w-md p-8 backdrop-blur-md">
        {/* লোগো ও হেডার */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center justify-center gap-2 mb-3">
            <img
              src={logo}
              alt="SN Travel"
              className="h-20 w-auto drop-shadow-md"
            />
            <span className="text-2xl uppercase font-bold font-sans text-white tracking-wider drop-shadow-sm">
              SN International TRAVEL
            </span>
          </div>

          <h1 className="text-xl font-bold text-white">Welcome Back</h1>
          <p className="text-xx text-gray-200 mt-1">
            Please enter your details to sign in to your account
          </p>
        </div>

        {/* লগইন ফর্ম */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 text-white"
        >
          {/* ইমেইল ফিল্ড */}
          <div>
            <label className="block text-xx font-semibold uppercase mb-1.5 text-gray-200">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-300 absolute left-3.5 top-3.5" />
              <input
                type="email"
                placeholder="admin@agency.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className={`w-full text-xs border pl-10 pr-3 py-2.5 rounded-xl bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${
                  errors.email ? "border-red-400" : "border-white/30"
                }`}
              />
            </div>
            {errors.email && (
              <span className="text-[11px] text-red-300 mt-1 block">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* পাসওয়ার্ড ফিল্ড */}
          <div>
            <label className="block text-xx font-semibold uppercase mb-1.5 text-gray-200">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-300 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                className={`w-full text-xs border pl-10 pr-10 py-2.5 rounded-xl bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${
                  errors.password ? "border-red-400" : "border-white/30"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-gray-300 hover:text-white cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <span className="text-[11px] text-red-300 mt-1 block">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xx py-1">
            {/* <label className="flex items-center gap-2 cursor-pointer text-gray-200">
              <input
                type="checkbox"
                {...register("rememberMe")}
                className="rounded border-white/30 text-blue-600 focus:ring-blue-400 w-4 h-4 cursor-pointer"
              />
              Remember me
            </label> */}
            <a
              href="#forgot-password"
              className="text-blue-300 hover:text-blue-200 hover:underline font-medium"
            >
              Forgot password?
            </a>
          </div>

          {/* সাইন ইন বাটন */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer mt-2"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* ফুটনোট */}
        <p className="text-center text-xx text-gray-200 mt-6">
          Don't have an account?{" "}
          <a
            href="#contact-admin"
            className="text-blue-300 font-semibold hover:underline"
          >
            Contact Admin
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

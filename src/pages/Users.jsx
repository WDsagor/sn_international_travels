import React from "react";
import { Shield, UserPlus, KeyRound, Edit2 } from "lucide-react";
import AddStaffModal from "../components/modals/AddStaffModal";
import { useState } from "react";
import Swal from "sweetalert2";
import {
  useCreateUserMutation,
  useGetUsersQuery,
} from "../redux/features/user/userApi";
import { User } from "lucide-react";
const Users = () => {
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [createUser, { isLoading: createLoading }] = useCreateUserMutation();
  const { data, isLoading, isError, error } = useGetUsersQuery();
  // console.log(error);

  const handleAddStaff = async (data) => {
    try {
      const response = await createUser(data).unwrap();

      // Success Alert
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Staff Created Successfully!",
        confirmButtonColor: "#2563eb", // Tailwind blue-600
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      // console.error(err);

      // Error Alert
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: err?.data?.message || "Failed to create staff. Please try again.",
        confirmButtonColor: "#dc2626", // Tailwind red-600
      });
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">ইউজারদের তথ্য লোড হচ্ছে...</div>;
  }

  if (isError) {
    return (
      <div className="p-4 text-red-500 text-center">
        ডাটা লোড করতে সমস্যা হয়েছে: {error?.data?.message || "Server Error"}
      </div>
    );
  }

  // ব্যাকএন্ড থেকে পাওয়া ইউজার অ্যারে (যদি response.user এ থাকে)
  const users = data?.users || data || [];
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Staff & Roles Portal
          </h1>
          <p className="text-xs text-gray-500">
            Manage internal users, security access, and system roles
          </p>
        </div>
        <button
          onClick={() => setIsStaffModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Add New Staff
        </button>
        <AddStaffModal
          isOpen={isStaffModalOpen}
          onClose={setIsStaffModalOpen}
          onSubmitSuccess={handleAddStaff}
        />
      </div>

      {/* Staff Grid Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sample User Card */}
        {users.map((user) => {
          return (
            <div
              key={user.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full pointer-events-none" />

              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-200">
                  <User />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{user?.fullName}</h3>
                  <p className="text-xx text-gray-400">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-600 border-t border-b border-gray-100 py-3 my-4">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xx">Access Level:</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xx font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {user.role}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xx">Phone:</span>
                  <span className="text-xx font-medium text-gray-800">
                    {user?.phone}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 relative z-10">
                <button className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-xx font-medium transition-colors border border-gray-200">
                  <Edit2 className="w-3 h-3" /> Edit Profile
                </button>
                <button className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xx font-medium transition-colors border border-red-100">
                  <KeyRound className="w-3 h-3" /> Reset Pin
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Users;

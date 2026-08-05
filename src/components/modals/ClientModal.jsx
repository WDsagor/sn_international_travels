import React from "react";
import { useForm } from "react-hook-form";
import { X, UserPlus } from "lucide-react";
import Swal from "sweetalert2";
import { useEffect } from "react";
import {
  useAddClientMutation,
  useUpdateClientMutation,
} from "../../redux/features/clients/clientApiSlice";

const ClientModal = ({ isOpen, onClose, selectedClient = null }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [addClient, { isLoading: isAdding }] = useAddClientMutation();
  const [updateClient, { isLoading: isUpdating }] = useUpdateClientMutation();
  useEffect(() => {
    if (selectedClient) {
      reset(selectedClient);
    } else {
      reset({
        clientType: "Individual",
        fullName: "",
        phone: "",
        email: "",
        company: "",
        openingBalance: 0,
        address: "",
      });
    }
  }, [selectedClient, reset, isOpen]);
  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        openingBalance: Number(data.openingBalance) || 0,
        email: data.email || null,
        company: data.company || null,
        address: data.address || null,
      };

      const isEdit = Boolean(selectedClient);
      if (isEdit) {
        await updateClient({ id: selectedClient.id, ...payload }).unwrap();
      } else {
        await addClient(payload).unwrap();
      }

      Swal.fire({
        icon: "success",
        title: isEdit ? "Updated!" : "Success!",
        text: `Client ${isEdit ? "updated" : "created"} successfully!`,
        timer: 1500,
        showConfirmButton: false,
      });

      onClose();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: err?.data?.message || "Something went wrong!",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl border border-gray-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {selectedClient ? "Edit Client Profile" : "Add New Client"}
              </h2>
              <p className="text-xs text-gray-500">
                Create a new customer or B2B agent profile
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="overflow-y-auto p-6 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Client Type *
              </label>
              <select
                {...register("clientType")}
                className="w-full text-sm border border-gray-200 px-3 py-2.5 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Individual">Individual</option>
                <option value="Agent">Corporate / Agent</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Rahim Ali"
                {...register("fullName", {
                  required: "Client name is required",
                })}
                className={`w-full text-sm border px-3 py-2 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 ${
                  errors.fullName
                    ? "border-red-500 bg-red-50/30"
                    : "border-gray-200"
                }`}
              />
              {errors.fullName && (
                <span className="text-[10px] text-red-500 mt-1 block">
                  {errors.fullName.message}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Phone Number *
              </label>
              <input
                type="text"
                placeholder="01712345678"
                {...register("phone", {
                  required: "Phone number is required",
                })}
                className={`w-full text-sm border px-3 py-2 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 font-mono ${
                  errors.phone
                    ? "border-red-500 bg-red-50/30"
                    : "border-gray-200"
                }`}
              />
              {errors.phone && (
                <span className="text-[10px] text-red-500 mt-1 block">
                  {errors.phone.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="rahim@example.com"
                {...register("email")}
                className="w-full text-sm border border-gray-200 px-3 py-2 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Company / Agency Name
              </label>
              <input
                type="text"
                placeholder="e.g. Sky Travels"
                {...register("company")}
                className="w-full text-sm border border-gray-200 px-3 py-2 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Opening Balance / Due (৳)
              </label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                {...register("openingBalance", {
                  setValueAs: (v) => (v === "" || isNaN(v) ? 0 : parseFloat(v)),
                })}
                className="w-full text-sm font-semibold font-mono border border-gray-200 px-3 py-2 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
              Address
            </label>
            <textarea
              rows="2"
              placeholder="House #12, Road #5, Dhanmondi, Dhaka"
              {...register("address")}
              className="w-full text-sm border border-gray-200 p-3 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 resize-none"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding || isUpdating}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isAdding || isUpdating ? "Saving..." : "Save Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;

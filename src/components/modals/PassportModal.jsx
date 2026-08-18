import React, { useState, useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { DayPicker } from "react-day-picker";
import { format, isValid } from "date-fns";
import { Calendar as CalendarIcon, Upload, X, Loader2 } from "lucide-react";
import { useGetClientsQuery } from "../../redux/features/clients/clientApiSlice";
import { useGetUsersQuery } from "../../redux/features/user/userApi";
import { useAddVisaInfoMutation } from "../../redux/features/passports/passportApiSlice";
import Swal from "sweetalert2";

const PassportModal = ({ isOpen, onClose, initialData = null }) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSubCalOpen, setIsSubCalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const isEditMode = Boolean(initialData);
  const [createVisaInfo, { isLoading: isCreating }] = useAddVisaInfoMutation();
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery();
  const { data: clientsData, isLoading: clientsLoading } = useGetClientsQuery();

  const users = Array.isArray(usersData?.users)
    ? usersData.users
    : Array.isArray(usersData)
      ? usersData
      : [];

  const clients = Array.isArray(clientsData?.data)
    ? clientsData.data
    : Array.isArray(clientsData)
      ? clientsData
      : [];

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting }, // 🟢 1. Double Click Preventer
  } = useForm({
    defaultValues: {
      issueDate: new Date(),
      submissionDate: new Date(),
      passportName: "",
      passportNumber: "",
      paxCount: 1,
      passportImage: null,
      clientId: "",
      issuedById: "",
      visaCategory: "agency",
      agencyName: "",
      visaCountry: "",
      visaDetails: "",
      netCost: "",
      clientPrice: "",
      status: "Submitted",
    },
  });

  // Watchers
  const [netCost, clientPrice, selectedVisaCategory, issueDate] = useWatch({
    control,
    name: ["netCost", "clientPrice", "visaCategory", "issueDate"],
  });

  // Profit Calculation
  const numClientPrice = Number(clientPrice) || 0;
  const numNetCost = Number(netCost) || 0;
  const calculatedProfit = numClientPrice - numNetCost;

  // 🟢 3. Clear agencyName when e-visa is selected
  useEffect(() => {
    if (selectedVisaCategory === "e-visa") {
      setValue("agencyName", "");
    }
  }, [selectedVisaCategory, setValue]);

  // Sync Form Data on Open / Edit
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          ...initialData,
          issueDate: initialData.issueDate
            ? new Date(initialData.issueDate)
            : new Date(),
          submissionDate: initialData.submissionDate
            ? new Date(initialData.submissionDate)
            : new Date(),
          issuedById:
            initialData.issuedById ??
            initialData.issuedBy?.id ??
            (typeof initialData.issuedBy === "string"
              ? initialData.issuedBy
              : ""),

          clientId:
            initialData.clientId ??
            initialData.client?.id ??
            (typeof initialData.client === "string" ? initialData.client : ""),
        });
        if (initialData.passportImage) {
          setImagePreview(
            typeof initialData.passportImage === "string"
              ? initialData.passportImage
              : null,
          );
        }
      } else {
        reset({
          issueDate: new Date(),
          submissionDate: new Date(),
          passportName: "",
          passportNumber: "",
          numberOfPassport: 1,
          passportImage: null,
          clientId: "",
          issuedById: "",
          visaCategory: "agency",
          agencyName: "",
          visaCountry: "",
          visaDetails: "",
          netCost: "",
          clientPrice: "",
          status: "Submitted",
        });
        setImagePreview(null);
      }
    }
  }, [initialData, isOpen, reset, usersLoading, clientsLoading]);

  // Safe Date Formatter
  const safeFormatDate = (dateVal) => {
    if (!dateVal) return "Select Date";
    const d = new Date(dateVal);
    return isValid(d) ? format(d, "dd/MM/yyyy") : "Select Date";
  };

  // 🟢 4. Image Upload & Memory Revoke
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview); // Memory Clean Up
      }
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Image Remove Handler
  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview); // Memory Clean Up
    }
    setImagePreview(null);
    setValue("passportImage", null);
  };

  // 🟢 5. Production Form Submit
  const handleFormSubmit = async (data) => {
    try {
      const finalVisaType =
        data.visaCategory === "e-visa" ? "e-Visa" : data.agencyName;
      // console.log(data);
      // console.log(file);
      const file = data?.passportImage?.[0];
      if (data?.passportImage?.length) {
        const formData = new FormData();
        formData.append("image", file);
        const response = await fetch(
          `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
          {
            method: "POST",
            body: formData,
          },
        );
        const imgData = await response.json();
        // console.log(data?.data?.display_url);
        await setValue("passportImage", imgData?.data?.display_url);
      }
      const formattedData = {
        ...data,
        issueDate: data?.issueDate,
        submissionDate: data?.submissionDate,
        visaType: finalVisaType,
        passportNumber: data?.passportNumber?.toUpperCase(),
      };
      // console.log(formattedData);
      if (isEditMode) {
        // await onSubmitSuccess(formattedData);
        Swal.fire({
          icon: "success",
          title: "Update Successfully!",
          text: "Visa has been updated.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await createVisaInfo(formattedData).unwrap();
        Swal.fire({
          icon: "success",
          title: "Created Successfully!",
          text: "New Visa has been submitted.",
          timer: 2000,
          showConfirmButton: false,
        });
        reset();
        onClose(false);
      }
    } catch (error) {
      console.error("Form Submission Error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-xl border border-gray-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center rounded-t-2xl justify-between px-6 py-4 border-b bg-gray-100/60 border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEditMode ? "Update Passport Details" : "Add New Passport"}
            </h2>
            <p className="text-xs text-gray-500">
              Fill in the passport and visa details for client processing
            </p>
          </div>
          <button
            type="button"
            onClick={() => onClose(false)}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
            {/* Row 1: Dates, Client & Issuer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Issue Date */}
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Issue Date <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={control}
                  name="issueDate"
                  rules={{ required: "Date is required" }}
                  render={({ field }) => (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCalendarOpen(!isCalendarOpen);
                          setIsSubCalOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <span>{safeFormatDate(field.value)}</span>
                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                      </button>

                      {isCalendarOpen && (
                        <div className="absolute top-full left-0 mt-2 z-50 bg-white p-3 rounded-2xl shadow-xl border border-gray-100">
                          <DayPicker
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) field.onChange(date);
                              setIsCalendarOpen(false);
                              setValue("submissionDate", date);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                />
                {errors.date && (
                  <span className="text-xs text-red-500 mt-1 block">
                    {errors.date.message}
                  </span>
                )}
              </div>

              {/* Client Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Client name <span className="text-red-500">*</span>
                </label>
                <select
                  disabled={clientsLoading}
                  {...register("clientId", {
                    required: "Please select a client",
                  })}
                  className={`w-full text-sm border px-3 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.clientId
                      ? "border-red-500 bg-red-50/30"
                      : "border-gray-200"
                  }`}
                >
                  <option value="">
                    {clientsLoading
                      ? "Loading clients..."
                      : "Select client name"}
                  </option>
                  {clients.map((client) => (
                    <option
                      key={client?.id || client?._id}
                      value={client?.id || client?._id}
                    >
                      {client?.fullName || client?.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Issued By */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Issued by <span className="text-red-500">*</span>
                </label>
                <select
                  disabled={usersLoading}
                  {...register("issuedById", {
                    required: "Please select issuer name",
                  })}
                  className={`w-full text-sm border px-3 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.issuedById
                      ? "border-red-500 bg-red-50/30"
                      : "border-gray-200"
                  }`}
                >
                  <option value="">
                    {usersLoading ? "Loading users..." : "Select issuer name"}
                  </option>
                  {users.map((user) => (
                    <option
                      key={user?.id || user?._id}
                      value={user?.id || user?._id}
                    >
                      {user?.fullName || user?.name}{" "}
                      {user?.role ? `(${user?.role})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Passport Information */}
            <div className="p-4 bg-gray-50/60 rounded-xl border border-gray-100 space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Passport Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Passport Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Passport holder name"
                      {...register("passportName", {
                        required: "Name is required",
                      })}
                      className="w-full text-sm border border-gray-200 px-3.5 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    {errors.passportName && (
                      <span className="text-xs text-red-500 mt-1 block">
                        {errors.passportName.message}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Passport Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. A00151750"
                        {...register("passportNumber", {
                          required: "Passport number required",
                        })}
                        className="w-full text-sm border border-gray-200 px-3.5 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 uppercase"
                      />
                      {errors.passportNumber && (
                        <span className="text-xs text-red-500 mt-1 block">
                          {errors.passportNumber.message}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Number of Passports (Pax)
                      </label>
                      <input
                        type="number"
                        min="1"
                        {...register("numberOfPassport", {
                          valueAsNumber: true,
                        })}
                        className="w-full text-sm border border-gray-200 px-3.5 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Passport Image Upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Passport Image
                  </label>

                  {imagePreview ? (
                    <div className="relative w-full h-28  overflow-hidden flex items-center justify-center">
                      <img
                        src={imagePreview}
                        alt="Passport Preview"
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all shadow-md cursor-pointer"
                        title="Remove Image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-full  flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl cursor-pointer bg-white hover:bg-blue-50/30 transition-all p-3 text-center">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-full mb-2">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        Click or drag image to upload
                      </span>
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        Supports PNG, JPG, JPEG or WEBP
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        {...register("passportImage", {
                          onChange: handleImageChange,
                        })}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Row 3: Visa Category & Dynamic Agency Input */}
            <div className="p-4 bg-gray-50/60 rounded-xl border border-gray-100 space-y-3">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                Visa Category
              </label>

              <div className="flex flex-col md:flex-row gap-5 items-start md:items-center">
                <div className="flex items-center gap-6 pt-2 pb-8">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      value="agency"
                      {...register("visaCategory")}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                    />
                    Agency
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      value="e-visa"
                      {...register("visaCategory")}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                    />
                    e-Visa
                  </label>
                </div>

                {selectedVisaCategory === "agency" && (
                  <div className="flex-1 w-full animate-in fade-in duration-200">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Agency Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Agency name"
                      {...register("agencyName", {
                        required:
                          selectedVisaCategory === "agency"
                            ? "Agency name is required"
                            : false,
                      })}
                      className="w-full text-sm border border-gray-200 px-3.5 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 "
                    />
                    {errors.agencyName && (
                      <span className="text-xs text-red-500 mt-1 block">
                        {errors.agencyName.message}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {/* Submission Date */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Submission Date <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="submissionDate"
                    rules={{ required: "Submission Date is required" }}
                    render={({ field }) => (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setIsSubCalOpen(!isSubCalOpen);
                            setIsCalendarOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <span>{safeFormatDate(field.value)}</span>
                          <CalendarIcon className="w-4 h-4 text-gray-500" />
                        </button>

                        {isSubCalOpen && (
                          <div className="absolute top-full left-0 mt-2 z-50 bg-white p-3 rounded-2xl shadow-xl border border-gray-100">
                            <DayPicker
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                if (date) field.onChange(date);
                                setIsSubCalOpen(false);
                              }}
                              disabled={[{ before: issueDate }]}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  />
                  {errors.submissionDate && (
                    <span className="text-xs text-red-500 mt-1 block">
                      {errors.submissionDate.message}
                    </span>
                  )}
                </div>

                {/* Visa Country */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Visa Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Singapore"
                    {...register("visaCountry", {
                      required: "Country is required",
                    })}
                    className="w-full text-sm border border-gray-200 px-3.5 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 "
                  />
                  {errors.visaCountry && (
                    <span className="text-xs text-red-500 mt-1 block">
                      {errors.visaCountry.message}
                    </span>
                  )}
                </div>

                {/* Visa Details */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Visa Duration & Details
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2 Years, Multiple"
                    {...register("visaDetails")}
                    className="w-full text-sm border border-gray-200 px-3.5 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 "
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Visa Status
                  </label>
                  <select
                    {...register("status")}
                    className="w-full text-sm border border-gray-200 px-3.5 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Processing">Processing</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 4: Financials & Live Profit Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Net Cost (৳)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  {...register("netCost")}
                  className="w-full text-sm border border-gray-200 px-3.5 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 "
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Client Price (৳)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  {...register("clientPrice")}
                  className="w-full text-sm border border-gray-200 px-3.5 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 "
                />
              </div>

              {/* Live Profit Display */}
              <div>
                <span className="block text-xs font-bold text-gray-500 mb-1">
                  Net Profit (Auto)
                </span>
                <div
                  className={`text-base font-bold font-mono px-3 py-2 rounded-xl border ${
                    calculatedProfit >= 0
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  ৳{calculatedProfit.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => onClose(false)}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              {/* Submit button with loading state */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ||
                  (isCreating && <Loader2 className="w-4 h-4 animate-spin" />)}
                {isSubmitting || isCreating
                  ? "Saving..."
                  : isEditMode
                    ? "Update Visa Record"
                    : "Save Visa Record"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PassportModal;

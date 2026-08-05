import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { useGetUsersQuery } from "../../redux/features/user/userApi";

import { formatDateForInput } from "../../utils/dateFormate";
import Swal from "sweetalert2";
import {
  useCreateTicketMutation,
  useUpdateTicketMutation,
} from "../../redux/features/tickets/ticketsApiSlice";
import { useGetClientsQuery } from "../../redux/features/clients/clientApiSlice";

export const VENDOR_LIST = [
  { id: "v1", name: "Mostofa Kamal" },
  { id: "v2", name: "Fly Deals Travel" },
  { id: "v3", name: "B2B Cargo & Ticketing" },
  { id: "v4", name: "SkyLink Aviation" },
];

const AIRLINE_LIST = [
  { id: "bg", code: "BG", name: "Biman Bangladesh Airlines" },
  { id: "bs", code: "BS", name: "US-Bangla Airlines" },
  { id: "vq", code: "VQ", name: "Novoair" },
  { id: "qr", code: "QR", name: "Qatar Airways" },
  { id: "ek", code: "EK", name: "Emirates" },
  { id: "ey", code: "EY", name: "Etihad Airways" },
  { id: "g9", code: "G9", name: "Air Arabia" },
  { id: "fz", code: "FZ", name: "Flydubai" },
  { id: "sv", code: "SV", name: "Saudia" },
  { id: "ku", code: "KU", name: "Kuwait Airways" },
  { id: "gf", code: "GF", name: "Gulf Air" },
  { id: "wy", code: "WY", name: "Oman Air" },
  { id: "mh", code: "MH", name: "Malaysia Airlines" },
  { id: "ak", code: "AK", name: "AirAsia" },
  { id: "sq", code: "SQ", name: "Singapore Airlines" },
  { id: "tg", code: "TG", name: "Thai Airways" },
  { id: "cx", code: "CX", name: "Cathay Pacific" },
  { id: "ai", code: "AI", name: "Air India" },
  { id: "uk", code: "UK", name: "Vistara" },
  { id: "6e", code: "6E", name: "IndiGo" },
];

const TicketModal = ({
  isOpen,
  onClose,
  initialData = null,
  onSubmitSuccess,
}) => {
  const isEditMode = Boolean(initialData);

  // Redux RTK Mutations
  const [createTicket, { isLoading: isCreating }] = useCreateTicketMutation();
  const [updateTicket, { isLoading: isUpdating }] = useUpdateTicketMutation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      pnrCode: "",
      ticketType: "one_way",
      issueDate: new Date().toISOString().split("T")[0],
      passengerName: "",
      route: "",
      travelDate: "",
      totalPax: "",
      issuedById: "",
      clientId: "",
      airline: "",
      netCost: 0,
      clientPrice: 0,
      serviceCharge: 0,
      status: "issued",
    },
  });

  // Watch Form Values (Fixed neCost -> netCost typo)
  const netCost = watch("netCost") || 0;
  const clientPrice = watch("clientPrice") || 0;
  const serviceCharge = watch("serviceCharge") || 0;
  const currentTicketType = watch("ticketType");
  const currentStatus = watch("status");

  // Dynamic status flag for extra Service Charge field
  const showServiceCharge = ["reissue", "refund", "void"].includes(
    currentStatus,
  );

  // RTK Queries for Dropdowns
  const { data, isLoading: usersLoading } = useGetUsersQuery();
  const { data: clients = [], isLoading: clientsLoading } =
    useGetClientsQuery();
  const users = data?.users || data || [];
  // console.log(clients);
  // Populate data in Edit Mode or reset in Create Mode when Modal Opens
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      reset({
        ...initialData,
        issueDate: formatDateForInput(initialData.issueDate),
        travelDate: formatDateForInput(initialData.travelDate),
        serviceCharge: initialData?.serviceCharge || 0,
        netCost: initialData?.netCost || 0,
        clientPrice: initialData?.clientPrice || 0,
      });
    } else {
      reset({
        pnrCode: "",
        ticketType: "one_way",
        issueDate: new Date().toISOString().split("T")[0],
        passengerName: "",
        route: "",
        travelDate: "",
        totalPax: "",
        issuedById: "",
        clientId: "",
        airline: "",
        netCost: 0,
        clientPrice: 0,
        serviceCharge: 0,
        status: "issued",
      });
    }
  }, [initialData, reset, isOpen]);

  // Handle Route auto-clear logic on type switch
  useEffect(() => {
    if (isOpen && !initialData) {
      setValue("route", "", { shouldValidate: false });
    }
  }, [currentTicketType, setValue, initialData, isOpen]);

  const handleRouteInput = (e) => {
    const cleanText = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
    const isReturn =
      currentTicketType === "round_trip" || currentTicketType === "multi_city";
    const arrow = isReturn ? "⇋" : "⇒";

    if (!cleanText) {
      setValue("route", "", { shouldValidate: true });
      return;
    }

    const codes = cleanText.match(/.{1,3}/g) || [];

    if (currentTicketType === "multi_city") {
      const pairs = [];
      for (let i = 0; i < codes.length; i += 2) {
        const from = codes[i];
        const to = codes[i + 1];

        if (from && to) {
          pairs.push(`${from}${arrow}${to}`);
        } else if (from) {
          if (from.length === 3) {
            pairs.push(`${from}${arrow}`);
          } else {
            pairs.push(from);
          }
        }
      }
      setValue("route", pairs.join(", "), { shouldValidate: true });
      return;
    }

    const from = codes[0] || "";
    const to = codes[1] || "";

    if (from.length === 3 && !to) {
      setValue("route", `${from}${arrow}`, { shouldValidate: true });
    } else if (to) {
      setValue("route", `${from}${arrow}${to.slice(0, 3)}`, {
        shouldValidate: true,
      });
    } else {
      setValue("route", from, { shouldValidate: true });
    }
  };

  // Calculate profit including service charge when applicable (Safe against NaN)
  const numClientPrice = Number(clientPrice) || 0;
  const numNetCost = Number(netCost) || 0;
  const numServiceCharge = showServiceCharge ? Number(serviceCharge) || 0 : 0;

  const calculatedProfit = numClientPrice - numNetCost + numServiceCharge;

  const onSubmit = async (formData) => {
    const payload = {
      ...formData,
      netCost: Number(formData.netCost) || 0,
      clientPrice: Number(formData.clientPrice) || 0,
      serviceCharge: showServiceCharge
        ? Number(formData.serviceCharge) || 0
        : 0,
      profit: calculatedProfit,
    };

    try {
      if (isEditMode) {
        console.log(payload);
        await updateTicket({ id: initialData.id, ...payload }).unwrap();

        // Success alert for update
        Swal.fire({
          icon: "success",
          title: "Updated Successfully!",
          text: "Ticket details have been updated.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await createTicket(payload).unwrap();

        // Success alert for creation
        Swal.fire({
          icon: "success",
          title: "Created Successfully!",
          text: "New ticket has been issued.",
          timer: 2000,
          showConfirmButton: false,
        });
      }

      if (onSubmitSuccess) onSubmitSuccess(payload);
      reset();
      onClose(false);
    } catch (err) {
      console.error("Redux Mutation Error:", err);

      // Error alert
      Swal.fire({
        icon: "error",
        title: "Something went wrong!",
        text:
          err?.data?.message || err?.message || "Failed to save the ticket.",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  if (!isOpen) return null;

  const isSubmitting = isCreating || isUpdating;

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all">
      <div className="bg-white rounded-2xl w-full max-w-6xl shadow-xl border border-gray-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEditMode ? "Update Ticket Details" : "Issue New Ticket"}
            </h2>
            <p className="text-xs text-gray-500">
              Enter ticket details and financial logging
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

        {/* Modal Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="overflow-y-auto p-6 space-y-5"
        >
          {/* Row 1: PNR, Ticket Type, Issue Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                PNR Code *
              </label>
              <input
                type="text"
                placeholder="e.g. PNR98765"
                {...register("pnrCode", { required: "PNR is required" })}
                className={`w-full uppercase text-sm border px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono ${
                  errors.pnrCode
                    ? "border-red-500 bg-red-50/30"
                    : "border-gray-200"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Ticket Type *
              </label>
              <select
                {...register("ticketType", { required: true })}
                className="w-full text-sm border border-gray-200 px-3 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="one_way">One Way</option>
                <option value="round_trip">Round Trip</option>
                <option value="multi_city">Multi City</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Issue Date *
              </label>
              <input
                type="date"
                {...register("issueDate", { required: true })}
                className="w-full text-sm border border-gray-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Row 2: Passenger Name, Route */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Primary Passenger Name *
              </label>
              <input
                type="text"
                placeholder="Rahim Ali"
                {...register("passengerName", {
                  required: "Passenger name is required",
                })}
                className={`w-full text-sm border px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.passengerName
                    ? "border-red-500 bg-red-50/30"
                    : "border-gray-200"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Route (e.g. DAC{" "}
                {currentTicketType === "round_trip" ||
                currentTicketType === "multi_city"
                  ? "⇋"
                  : "⇒"}{" "}
                CXB) *
              </label>
              <input
                type="text"
                placeholder={
                  currentTicketType === "round_trip" ||
                  currentTicketType === "multi_city"
                    ? "DAC⇋CXB"
                    : "DAC⇒CXB"
                }
                {...register("route", {
                  required: "Route is required",
                  validate: (value) => {
                    if (currentTicketType === "multi_city") {
                      const isValid =
                        /^([A-Z]{3}⇋[A-Z]{3})(,\s*[A-Z]{3}⇋[A-Z]{3})*$/.test(
                          value,
                        );
                      return (
                        isValid ||
                        "Please enter valid complete pairs (e.g. DAB⇋DAC, DXB⇋MAA)"
                      );
                    }
                    return true;
                  },
                })}
                onChange={handleRouteInput}
                className={`w-full uppercase text-sm border px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono ${
                  errors.route
                    ? "border-red-500 bg-red-50/30"
                    : "border-gray-200"
                }`}
              />
            </div>
          </div>

          {/* Row 3: Travel Date, Total Pax, Issued By */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Travel Date *
              </label>
              <input
                type="date"
                {...register("travelDate", {
                  required: "Travel date is required",
                })}
                className={`w-full text-sm border px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.travelDate
                    ? "border-red-500 bg-red-50/30"
                    : "border-gray-200"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Total Pax Details
              </label>
              <input
                type="text"
                placeholder="3 Persons (2 Adult, 1 Child)"
                {...register("totalPax")}
                className="w-full text-sm border border-gray-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Issued By *
              </label>
              {usersLoading ? (
                <div className="text-xs text-gray-400 py-2">
                  Loading users...
                </div>
              ) : (
                <select
                  {...register("issuedById", {
                    required: "Please select value",
                  })}
                  className={`w-full text-sm border px-3 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.issuedById
                      ? "border-red-500 bg-red-50/30"
                      : "border-gray-200"
                  }`}
                >
                  <option value="">Select value</option>
                  {users.map((user) => (
                    <option key={user?.id} value={user?.id}>
                      {user?.fullName} {user?.role ? `(${user?.role})` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Row 4: Client, Airline, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Client *
              </label>
              {clientsLoading ? (
                <div className="text-xs text-gray-400 py-2">
                  Loading clients...
                </div>
              ) : (
                <select
                  {...register("clientId", {
                    required: "Please select a client",
                  })}
                  className={`w-full text-sm border px-3 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.clientId
                      ? "border-red-500 bg-red-50/30"
                      : "border-gray-200"
                  }`}
                >
                  <option value="">Select client</option>
                  {clients?.data?.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.fullName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Airline *
              </label>
              <select
                {...register("airline", {
                  required: "Please select an airline",
                })}
                className={`w-full text-sm border px-3 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 truncate ${
                  errors.airline
                    ? "border-red-500 bg-red-50/30"
                    : "border-gray-200"
                }`}
              >
                <option value="">Select Airline</option>
                {AIRLINE_LIST.map((a) => (
                  <option key={a.id} value={`${a.code} - ${a.name}`}>
                    {a.code} - {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Status
              </label>
              <select
                {...register("status")}
                className="w-full text-sm border border-gray-200 px-3 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 uppercase"
              >
                <option value="issued">Issued</option>
                <option value="reissue">Reissue</option>
                <option value="refund">Refund</option>
                <option value="void">Void</option>
              </select>
            </div>
          </div>

          {/* Pricing Box */}
          <div
            className={`p-4 bg-gray-50 rounded-xl border border-gray-100 grid grid-cols-1 ${
              showServiceCharge ? "sm:grid-cols-4" : "sm:grid-cols-3"
            } gap-4 items-center`}
          >
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Net Cost (৳) *
              </label>
              <input
                type="number"
                {...register("netCost", {
                  valueAsNumber: true,
                  required: true,
                })}
                className="w-full text-sm font-semibold font-mono border border-gray-200 px-3 py-2 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Client Price (৳) *
              </label>
              <input
                type="number"
                {...register("clientPrice", {
                  valueAsNumber: true,
                  required: true,
                })}
                className="w-full text-sm font-semibold font-mono border border-gray-200 px-3 py-2 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Service Charge: Conditionally renders for reissue, refund, or void */}
            {showServiceCharge && (
              <div className="animate-in fade-in duration-200">
                <label className="block text-xs font-bold text-amber-600 uppercase mb-1">
                  Service Charge (৳)
                </label>
                <input
                  type="number"
                  {...register("serviceCharge", { valueAsNumber: true })}
                  placeholder="0"
                  className="w-full text-sm font-semibold font-mono border border-amber-300 bg-amber-50 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            )}

            <div>
              <span className="block text-xs font-bold text-gray-500 uppercase mb-1">
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
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-4 py-2 text-sm font-medium text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (isEditMode && !isDirty)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isSubmitting || (isEditMode && !isDirty)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              }`}
            >
              {isSubmitting
                ? "Processing..."
                : isEditMode
                  ? "Update Ticket"
                  : "Create Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketModal;

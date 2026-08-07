import React, { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { X } from "lucide-react";
import Swal from "sweetalert2";

import { useGetUsersQuery } from "../../redux/features/user/userApi";
import { useGetClientsQuery } from "../../redux/features/clients/clientApiSlice";
import {
  useCreateTicketMutation,
  useUpdateTicketMutation,
} from "../../redux/features/tickets/ticketsApiSlice";

import {
  formatDateForInput,
  getTodayDateString,
} from "../../utils/dateFormate";
import { CustomDatePicker } from "../share/CustomDatePicker";
import { Loader2 } from "lucide-react";

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

  const [createTicket, { isLoading: isCreating }] = useCreateTicketMutation();
  const [updateTicket, { isLoading: isUpdating }] = useUpdateTicketMutation();

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
    setValue,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      pnrCode: "",
      ticketType: "one_way",
      issueDate: getTodayDateString(),
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

  const [
    netCost,
    clientPrice,
    serviceCharge,
    currentTicketType,
    currentStatus,
    issueDate,
  ] = useWatch({
    control,
    name: [
      "netCost",
      "clientPrice",
      "serviceCharge",
      "ticketType",
      "status",
      "issueDate",
    ],
  });

  const showServiceCharge = ["reissue", "refund", "void"].includes(
    currentStatus,
  );

  // 1. Data Reset Effect with Fallbacks & Airline Matcher
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      // Airline Matching Logic
      let matchedAirline = initialData.airline || "";
      if (matchedAirline) {
        const found = AIRLINE_LIST.find(
          (a) =>
            `${a.code} - ${a.name}`.toLowerCase() ===
              matchedAirline.toLowerCase() ||
            a.code.toLowerCase() === matchedAirline.toLowerCase() ||
            a.name.toLowerCase() === matchedAirline.toLowerCase(),
        );
        if (found) {
          matchedAirline = `${found.code} - ${found.name}`;
        }
      }

      reset({
        pnrCode:
          initialData.pnrCode ?? initialData.pnr_code ?? initialData.pnr ?? "",
        ticketType:
          initialData.ticketType ?? initialData.ticket_type ?? "one_way",
        issueDate: formatDateForInput(
          initialData.issueDate || initialData.issue_date,
        ),
        passengerName:
          initialData.passengerName ?? initialData.passenger_name ?? "",
        route: initialData.route ?? "",
        travelDate: formatDateForInput(
          initialData.travelDate || initialData.travel_date,
        ),
        totalPax: initialData.totalPax ?? initialData.total_pax ?? "",

        // Mongo _id and Nested Object Handlers
        issuedById:
          initialData.issuedById ??
          initialData.issued_by_id ??
          initialData.issuedBy?._id ??
          initialData.issuedBy?.id ??
          (typeof initialData.issuedBy === "string"
            ? initialData.issuedBy
            : ""),

        clientId:
          initialData.clientId ??
          initialData.client_id ??
          initialData.client?._id ??
          initialData.client?.id ??
          (typeof initialData.client === "string" ? initialData.client : ""),

        airline: matchedAirline,
        netCost: Number(initialData.netCost ?? initialData.net_cost ?? 0),
        clientPrice: Number(
          initialData.clientPrice ?? initialData.client_price ?? 0,
        ),
        serviceCharge: Number(
          initialData.serviceCharge ?? initialData.service_charge ?? 0,
        ),
        status: (initialData.status || "issued").toLowerCase(),
      });
    } else {
      reset({
        pnrCode: "",
        ticketType: "one_way",
        issueDate: getTodayDateString(),
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
  }, [initialData, reset, isOpen, usersLoading, clientsLoading]); // Included loading states to re-sync form when dropdown options arrive

  useEffect(() => {
    if (isOpen && !initialData) {
      setValue("route", "", { shouldValidate: false });
    }
  }, [currentTicketType, setValue, initialData, isOpen]);

  const handleRouteInput = (e) => {
    const rawValue = e.target.value.toUpperCase();
    const cleanText = rawValue.replace(/[^A-Z]/g, "");
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
          pairs.push(from.length === 3 ? `${from}${arrow}` : from);
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
      netProfit: calculatedProfit,
    };

    try {
      if (isEditMode) {
        await updateTicket({
          id: initialData.id || initialData._id,
          ...payload,
        }).unwrap();
        Swal.fire({
          icon: "success",
          title: "Updated Successfully!",
          text: "Ticket details have been updated.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await createTicket(payload).unwrap();
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
      Swal.fire({
        icon: "error",
        title: "Something Went Wrong!",
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

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="overflow-y-auto p-6 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                PNR Code *
              </label>
              <input
                type="text"
                placeholder="e.g. 123456"
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
              <Controller
                control={control}
                name="issueDate"
                rules={{ required: "Issue Date is required" }}
                render={({ field, fieldState }) => (
                  <CustomDatePicker
                    label="Issue Date *"
                    value={field.value}
                    onChange={(date) => {
                      field.onChange(date);
                      const currentTravel = control._formValues.travelDate;
                      if (
                        currentTravel &&
                        new Date(currentTravel) < new Date(date)
                      ) {
                        setValue("travelDate", "");
                      }
                    }}
                    error={fieldState.error}
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Primary Passenger Name *
              </label>
              <input
                type="text"
                placeholder="MD Rahamat ali"
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
                    ? "GDG⇋FDG"
                    : "GGG⇒DDD"
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Controller
                control={control}
                name="travelDate"
                rules={{ required: "Travel Date is required" }}
                render={({ field, fieldState }) => (
                  <CustomDatePicker
                    label="Travel Date *"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error}
                    minDate={issueDate}
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Total Pax Details
              </label>
              <input
                type="text"
                placeholder="3 Adult, 1 Child, 1 Infant"
                {...register("totalPax")}
                className="w-full text-sm border border-gray-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Issued By *
              </label>
              <select
                disabled={usersLoading}
                {...register("issuedById", {
                  required: "Please select value",
                })}
                className={`w-full text-sm border px-3 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.issuedById
                    ? "border-red-500 bg-red-50/30"
                    : "border-gray-200"
                }`}
              >
                <option value="">
                  {usersLoading ? "Loading users..." : "Select value"}
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Client *
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
                  {clientsLoading ? "Loading clients..." : "Select client"}
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
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
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

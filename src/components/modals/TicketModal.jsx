import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Loader2, Plane, X } from "lucide-react";
import Swal from "sweetalert2";

import { useGetUsersQuery } from "../../redux/features/user/userApi";
import { useGetClientsQuery } from "../../redux/features/clients/clientApiSlice";
import {
  useCreateTicketMutation,
  useUpdateTicketMutation,
} from "../../redux/features/tickets/ticketsApiSlice";
import { useGetAllAirlinesQuery } from "../../redux/features/airlines/airlineApiSlice";

import {
  formatDateForInput,
  getTodayDateString,
} from "../../utils/dateFormate";

import { CustomDatePicker } from "../share/CustomDatePicker";
import AddAirlineForm from "../share/AddAirlineForm";

const EMPTY_TICKET = {
  pnrCode: "",
  ticketType: "one_way",
  issueDate: getTodayDateString(),
  passengerName: "",
  route: "",
  travelDate: "",
  totalPax: "",
  issuedById: "",
  clientId: "",
  airlineCode: "",
  netCost: 0,
  clientPrice: 0,
  serviceCharge: 0,
  status: "issued",
};

const getDateKey = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

const TicketModal = ({
  isOpen,
  onClose,
  initialData = null,
  onSubmitSuccess,
}) => {
  const isEditMode = Boolean(initialData);
  const [showAddAirline, setShowAddAirline] = useState(false);

  const [createTicket, { isLoading: isCreating }] = useCreateTicketMutation();
  const [updateTicket, { isLoading: isUpdating }] = useUpdateTicketMutation();

  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery();
  const { data: clientsData, isLoading: clientsLoading } = useGetClientsQuery();

  const {
    data: airlinesData,
    isLoading: airlinesLoading,
    refetch: refetchAirlines,
  } = useGetAllAirlinesQuery();

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

  const airlines = Array.isArray(airlinesData?.data) ? airlinesData.data : [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: EMPTY_TICKET,
  });

  const [
    netCost,
    clientPrice,
    serviceCharge,
    currentTicketType,
    currentStatus,
    currentTravelDate,
    currentIssueDate,
  ] = useWatch({
    control,
    name: [
      "netCost",
      "clientPrice",
      "serviceCharge",
      "ticketType",
      "status",
      "travelDate",
      "issueDate",
    ],
  });

  useEffect(() => {
    if (!isOpen) return;

    setShowAddAirline(false);

    if (!initialData) {
      reset(EMPTY_TICKET);
      return;
    }

    reset({
      pnrCode:
        initialData.pnrCode ?? initialData.pnr_code ?? initialData.pnr ?? "",

      ticketType:
        initialData.ticketType ?? initialData.ticket_type ?? "one_way",

      issueDate: formatDateForInput(
        initialData.issueDate ?? initialData.issue_date,
      ),

      passengerName:
        initialData.passengerName ?? initialData.passenger_name ?? "",

      route: initialData.route ?? "",

      travelDate: formatDateForInput(
        initialData.travelDate ?? initialData.travel_date,
      ),

      totalPax: initialData.totalPax ?? initialData.total_pax ?? "",

      issuedById:
        initialData.issuedById ??
        initialData.issuedBy?.id ??
        initialData.issuedBy?._id ??
        "",

      clientId:
        initialData.clientId ??
        initialData.client?.id ??
        initialData.client?._id ??
        "",

      airlineCode: initialData.airlineCode ?? initialData.airline?.code ?? "",

      netCost: Number(initialData.netCost ?? initialData.net_cost ?? 0),

      clientPrice: Number(
        initialData.clientPrice ?? initialData.client_price ?? 0,
      ),

      // নতুন reissue charge input-এর জন্য
      serviceCharge: 0,

      status: String(initialData.status || "issued").toLowerCase(),
    });
  }, [isOpen, initialData, reset]);

  const initialStatus = String(initialData?.status || "")
    .trim()
    .toLowerCase();

  const selectedStatus = String(currentStatus || "issued")
    .trim()
    .toLowerCase();

  const isTravelDateChanged =
    Boolean(initialData?.travelDate && currentTravelDate) &&
    getDateKey(initialData.travelDate) !== getDateKey(currentTravelDate);

  const showServiceCharge =
    selectedStatus !== "issued" &&
    (selectedStatus !== "reissue" ||
      initialStatus !== "reissue" ||
      isTravelDateChanged);

  const handleRouteInput = (event) => {
    const cleanText = event.target.value.toUpperCase().replace(/[^A-Z]/g, "");

    const isReturn =
      currentTicketType === "round_trip" || currentTicketType === "multi_city";

    const arrow = isReturn ? "⇋" : "⇒";

    if (!cleanText) {
      setValue("route", "", { shouldValidate: true });
      return;
    }

    const codes = cleanText.match(/.{1,3}/g) || [];

    if (currentTicketType === "multi_city") {
      const routes = [];

      for (let index = 0; index < codes.length; index += 2) {
        const from = codes[index];
        const to = codes[index + 1];

        if (from && to) routes.push(`${from}${arrow}${to}`);
        else if (from)
          routes.push(from.length === 3 ? `${from}${arrow}` : from);
      }

      setValue("route", routes.join(", "), { shouldValidate: true });
      return;
    }

    const from = codes[0] || "";
    const to = codes[1] || "";

    setValue(
      "route",
      to
        ? `${from}${arrow}${to.slice(0, 3)}`
        : from.length === 3
          ? `${from}${arrow}`
          : from,
      { shouldValidate: true },
    );
  };

  const price = Number(clientPrice) || 0;
  const cost = Number(netCost) || 0;
  const oldCharge = Number(initialData?.serviceCharge || 0);
  const newCharge = showServiceCharge ? Number(serviceCharge) || 0 : 0;

  const calculatedProfit = ["refund", "void"].includes(selectedStatus)
    ? showServiceCharge
      ? price - cost + oldCharge + newCharge
      : price - cost + oldCharge
    : price - cost + oldCharge + newCharge;

  const onSubmit = async (formData) => {
    const { serviceCharge: _, ...ticketData } = formData;

    const payload = {
      ...ticketData,
      netCost: Number(formData.netCost) || 0,
      clientPrice: Number(formData.clientPrice) || 0,

      ...(showServiceCharge && {
        serviceCharge: Number(formData.serviceCharge) || 0,
      }),
    };

    try {
      // console.log(payload);
      const response = isEditMode
        ? await updateTicket({
            id: initialData.id || initialData._id,
            ...payload,
          }).unwrap()
        : await createTicket(payload).unwrap();

      Swal.fire({
        icon: "success",
        title: isEditMode
          ? "Updated Successfully!"
          : "Ticket Created Successfully!",
        timer: 1600,
        showConfirmButton: false,
      });

      onSubmitSuccess?.(response?.data || payload);
      onClose(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Something went wrong!",
        text:
          error?.data?.message || error?.message || "Failed to save ticket.",
      });
    }
  };

  if (!isOpen) return null;

  const isSubmitting = isCreating || isUpdating;
  const inputClass = (hasError) =>
    `w-full text-xs border px-3 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
      hasError ? "border-red-500 bg-red-50/30" : "border-gray-200"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col rounded-2xl border border-gray-100 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEditMode ? "Update Ticket Details" : "Issue New Ticket"}
            </h2>
            <p className="text-xx text-gray-500">
              Enter ticket details and financial logging
            </p>
          </div>

          <button
            type="button"
            onClick={() => onClose(false)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 overflow-y-auto p-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xx font-semibold uppercase text-gray-600">
                PNR Code *
              </label>
              <input
                placeholder="e.g. 123456"
                {...register("pnrCode", { required: "PNR is required" })}
                className={`${inputClass(errors.pnrCode)} uppercase font-mono`}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xx font-semibold uppercase text-gray-600">
                Ticket Type *
              </label>
              <select {...register("ticketType")} className={inputClass(false)}>
                <option value="one_way">One Way</option>
                <option value="round_trip">Round Trip</option>
                <option value="multi_city">Multi City</option>
              </select>
            </div>

            <Controller
              control={control}
              name="issueDate"
              rules={{ required: "Issue Date is required" }}
              render={({ field, fieldState }) => (
                <CustomDatePicker
                  label="Issue Date *"
                  value={field.value}
                  error={fieldState.error}
                  onChange={(date) => {
                    field.onChange(date);

                    if (
                      currentTravelDate &&
                      new Date(currentTravelDate) < new Date(date)
                    ) {
                      setValue("travelDate", "");
                    }
                  }}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xx font-semibold uppercase text-gray-600">
                Primary Passenger Name *
              </label>
              <input
                placeholder="MD Rahamat Ali"
                {...register("passengerName", {
                  required: "Passenger name is required",
                })}
                className={inputClass(errors.passengerName)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xx font-semibold uppercase text-gray-600">
                Route *
              </label>
              <input
                placeholder="DAC⇒CGP"
                {...register("route", { required: "Route is required" })}
                onChange={handleRouteInput}
                className={`${inputClass(errors.route)} uppercase font-mono`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                  minDate={currentIssueDate}
                />
              )}
            />

            <div>
              <label className="mb-1.5 block text-xx font-semibold uppercase text-gray-600">
                Total Pax
              </label>
              <input
                placeholder="1 Adult"
                {...register("totalPax")}
                className={inputClass(false)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xx font-semibold uppercase text-gray-600">
                Issued By *
              </label>
              <select
                disabled={usersLoading}
                {...register("issuedById", { required: true })}
                className={inputClass(errors.issuedById)}
              >
                <option value="">Select user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} {user.role ? `(${user.role})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xx font-semibold uppercase text-gray-600">
                Client *
              </label>
              <select
                disabled={clientsLoading}
                {...register("clientId", { required: true })}
                className={inputClass(errors.clientId)}
              >
                <option value="">Select client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xx font-semibold uppercase text-gray-600">
                  Airline *
                </label>

                <button
                  type="button"
                  onClick={() => setShowAddAirline((value) => !value)}
                  className="flex items-center gap-1 text-xx font-semibold text-gray-500 hover:text-gray-700"
                >
                  <Plane className="h-3 w-3" />
                  {showAddAirline ? "Cancel" : "Add Airline"}
                </button>
              </div>

              {showAddAirline ? (
                <AddAirlineForm
                  onSuccess={async (newAirline) => {
                    await refetchAirlines();

                    setValue("airlineCode", newAirline.code, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });

                    setShowAddAirline(false);
                  }}
                />
              ) : (
                <select
                  disabled={airlinesLoading}
                  {...register("airlineCode", { required: true })}
                  className={inputClass(errors.airlineCode)}
                >
                  <option value="">Select airline</option>
                  {airlines.map((airline) => (
                    <option key={airline.id} value={airline.code}>
                      {airline.code} - {airline.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xx font-semibold uppercase text-gray-600">
                Status
              </label>
              <select {...register("status")} className={inputClass(false)}>
                <option value="issued">Issued</option>
                <option value="reissue">Reissue</option>
                <option value="refund">Refund</option>
                <option value="void">Void</option>
              </select>
            </div>
          </div>

          <div
            className={`grid grid-cols-1 items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 ${
              showServiceCharge ? "sm:grid-cols-4" : "sm:grid-cols-3"
            }`}
          >
            <div>
              <label className="mb-1 block text-xx font-bold uppercase text-gray-500">
                Net Cost (৳) *
              </label>
              <input
                type="number"
                {...register("netCost", {
                  valueAsNumber: true,
                  required: true,
                })}
                className={inputClass(errors.netCost)}
              />
            </div>

            <div>
              <label className="mb-1 block text-xx font-bold uppercase text-gray-500">
                Client Price (৳) *
              </label>
              <input
                type="number"
                {...register("clientPrice", {
                  valueAsNumber: true,
                  required: true,
                })}
                className={inputClass(errors.clientPrice)}
              />
            </div>

            {showServiceCharge && (
              <div>
                <label className="mb-1 block text-xx font-bold uppercase text-amber-600">
                  {selectedStatus} Charge (৳)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  {...register("serviceCharge", { valueAsNumber: true })}
                  className="w-full rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            )}

            <div>
              <span className="mb-1 block text-xx font-bold uppercase text-gray-500">
                Net Profit (Auto)
              </span>
              <div
                className={`rounded-xl border px-3 py-2 text-base font-bold font-mono ${
                  calculatedProfit >= 0
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                ৳{calculatedProfit.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-2">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs text-gray-500 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting || showAddAirline || (isEditMode && !isDirty)
              }
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
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

import React, { useState } from "react";
import { Plus, Search, PlaneTakeoff, Edit3, UserCheck } from "lucide-react";
import TicketModal from "../components/modals/TicketModal";

import { formatDate } from "../utils/dateFormate";
import { useGetTicketsQuery } from "../redux/features/tickets/ticketsApiSlice";

const Tickets = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  // Redux Fetching with Search & Filter State
  const {
    data: ticketsData = [],
    isLoading,
    isError,
    error,
  } = useGetTicketsQuery({
    search: searchTerm,
    status: selectedStatus,
  });

  const handleOpenCreateModal = () => {
    setSelectedTicket(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTicket(null);
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "issued":
        return "bg-green-50 text-green-700 border-green-200";
      case "reissue":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "refund":
      case "refunded":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "void":
      case "cancel":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Ticket Management
          </h1>
          <p className="text-sm text-gray-500">
            Issue, track, and manage all passenger flights
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Ticket Issue
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search PNR, Airline, Client or Passenger..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none w-full md:w-auto cursor-pointer uppercase"
          >
            <option value="All Status">All Status</option>
            <option value="issued">Issued</option>
            <option value="reissue">Reissue</option>
            <option value="refund">Refund</option>
            <option value="void">Void</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="p-4">PNR & Date</th>
                <th className="p-4">Travel Details</th>
                <th className="p-4">Client</th>
                <th className="p-4">Airline</th>
                <th className="p-4 text-right">Net Cost</th>
                <th className="p-4 text-right">Client Price</th>
                <th className="p-4 text-right">Ser. Charge</th>
                <th className="p-4 text-right">Profit</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-gray-500">
                    Loading tickets...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-red-500">
                    Failed to load tickets:{" "}
                    {error?.message || "Something went wrong"}
                  </td>
                </tr>
              ) : ticketsData?.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-gray-400">
                    No tickets found.
                  </td>
                </tr>
              ) : (
                ticketsData?.map((ticket) => {
                  // Issuer Name Extraction (Handles Object or Direct Field)
                  const issuerName =
                    ticket?.issuedBy?.fullName ||
                    ticket?.issuedBy ||
                    ticket?.issuedUser?.fullName ||
                    "N/A";

                  return (
                    <tr
                      key={ticket.id}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-gray-900 uppercase">
                          {ticket.pnrCode}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {formatDate(ticket.issueDate)}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {ticket.passengerName}
                        </div>
                        <div className="text-[11px] flex items-center gap-1 text-amber-600 font-medium py-0.5">
                          <PlaneTakeoff size={14} strokeWidth={1.5} />
                          <span>{formatDate(ticket.travelDate)}</span>
                        </div>
                        <div className="relative group w-max mt-0.5">
                          <div className="text-xs text-blue-600 font-semibold flex items-center gap-1 cursor-pointer hover:text-blue-800 transition-colors">
                            {ticket.route}
                          </div>

                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:flex group-hover:flex-col items-center gap-1.5 bg-gray-900 text-white text-xs  rounded-lg py-1.5 shadow-xl z-50 whitespace-nowrap animate-in fade-in zoom-in-95 pointer-events-none">
                            <p className="font-bold text-blue-400  uppercase tracking-wide px-3">
                              Passenger Details
                            </p>
                            <div className="border-b w-full border-gray-600" />
                            <div className=" text-gray-300 px-3">
                              <p>
                                <span className="text-gray-400">Primary:</span>{" "}
                                {ticket.passengerName}
                              </p>
                              <p>
                                <span className="text-gray-400">
                                  Pax Details:
                                </span>{" "}
                                {ticket.totalPax || "N/A"}
                              </p>
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-medium">
                        {ticket?.client?.fullName}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {ticket.airline}
                      </td>

                      <td className="px-4 py-3 text-right font-mono text-gray-500">
                        ৳{Number(ticket.netCost || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900">
                        ৳{Number(ticket.clientPrice || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-amber-600">
                        ৳{Number(ticket.serviceCharge || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-green-600">
                        ৳{Number(ticket.netProfit || 0).toLocaleString()}
                      </td>

                      {/* Status Column with Issuer Hover Tooltip */}
                      <td className="px-4 py-3 relative group">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize cursor-pointer ${getStatusBadge(
                            ticket.status,
                          )}`}
                        >
                          {ticket.status}
                        </span>

                        {/* Issuer Hover Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-6 hidden group-hover:flex group-hover:flex-col items-center gap-0.5 bg-gray-900 text-white text-xs  py-1.5 rounded-lg shadow-xl z-50 whitespace-nowrap animate-in fade-in zoom-in-95 pointer-events-none">
                          <p className="flex px-3 gap-1 uppercase  text-blue-400 font-bold">
                            <UserCheck className="w-3.5 h-3.5" />
                            Issued By
                          </p>
                          <div className="border-b w-full border-gray-600" />
                          <strong className="text-gray-100 px-3 font-semibold">
                            {issuerName}
                          </strong>
                          <p className="px-3">
                            <span className="text-gray-400  mr-2 ">
                              Last Update:
                            </span>
                            {formatDate(ticket.updatedAt)}
                          </p>

                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleOpenEditModal(ticket)}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-semibold px-2.5 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TicketModal
        isOpen={showModal}
        onClose={handleCloseModal}
        initialData={selectedTicket}
      />
    </div>
  );
};

export default Tickets;

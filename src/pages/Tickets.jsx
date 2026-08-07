import React, { useState } from "react";
import { Plus, Search } from "lucide-react";
import TicketModal from "../components/modals/TicketModal";
import { useGetTicketsQuery } from "../redux/features/tickets/ticketsApiSlice";
import TicketRow from "../components/tickets/TicketRow";

const Tickets = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

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

  const handleDeleteTicket = (ticket) => {
    // Add your confirmation dialog and delete RTK mutation here
    if (
      window.confirm(`Are you sure you want to delete PNR: ${ticket.pnrCode}?`)
    ) {
      console.log("Deleting ticket:", ticket.id);
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
                ticketsData?.map((ticket) => (
                  <TicketRow
                    key={ticket.id}
                    ticket={ticket}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteTicket}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <TicketModal
          key={selectedTicket?.id}
          isOpen={showModal}
          onClose={handleCloseModal}
          initialData={selectedTicket}
        />
      )}
    </div>
  );
};

export default Tickets;

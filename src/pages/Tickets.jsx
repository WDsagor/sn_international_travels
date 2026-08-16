import React, { useState, useMemo, useEffect } from "react";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import TicketModal from "../components/modals/TicketModal";
import { useGetTicketsQuery } from "../redux/features/tickets/ticketsApiSlice";
import TicketRow from "../components/tickets/TicketRow";
import Swal from "sweetalert2";
import ReportCalender from "../components/share/ReportCalender";

const Tickets = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  // 🟢 পেজিনেশন স্টেটস (Pagination States)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // প্রতি পেজে যতগুলো টিকিট দেখতে চান

  const {
    data: ticketsData = [],
    isLoading,
    isError,
    error,
  } = useGetTicketsQuery({
    search: searchTerm,
    status: selectedStatus,
  });

  // 🟢 সার্চ বা ফিল্টার পরিবর্তন হলে পেজ নম্বর ১-এ রিসেট হবে
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  // 🟢 পেজিনেশন হিসাব-নিকাশ
  const totalPages = Math.ceil((ticketsData?.length || 0) / itemsPerPage);

  const paginatedTickets = useMemo(() => {
    if (!Array.isArray(ticketsData)) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return ticketsData.slice(startIndex, startIndex + itemsPerPage);
  }, [ticketsData, currentPage, itemsPerPage]);

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
    Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete PNR: ${ticket.pnrCode?.toUpperCase()}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626", // Red button
      cancelButtonColor: "#6b7280", // Gray button
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "rounded-2xl",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Deleted!",
          text: "Ticket has been deleted successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
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
        <ReportCalender />
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
                    <div className="space-y-4 animate-pulse">
                      <div className="h-12 bg-gray-100 rounded-lg w-full" />
                      <div className="h-8 bg-gray-100 rounded-lg w-3/4" />
                      <div className="h-32 bg-gray-100 rounded-lg w-full" />
                    </div>
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
                paginatedTickets?.map((ticket) => (
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

        {/* 🟢 Pagination UI */}
        {ticketsData?.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-medium text-gray-700">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-gray-700">
                {Math.min(currentPage * itemsPerPage, ticketsData.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-700">
                {ticketsData.length}
              </span>{" "}
              entries
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <span className="text-xs text-gray-600 font-medium px-2">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
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

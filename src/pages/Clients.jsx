import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  UserPlus,
  FileText,
  Download,
  Wallet,
  AlertCircle,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import ClientModal from "../components/modals/ClientModal";
import ReceivePaymentModal from "../components/modals/ReceivePaymentModal";
import { formatCurrency, formatDate } from "../utils/dateFormate";
import {
  useGetClientByIdQuery,
  useGetClientsQuery,
} from "../redux/features/clients/clientApiSlice";
import ReportCalender from "../components/share/ReportCalender";

const Clients = () => {
  // ১. URL Path থেকে id গ্রহণ
  const { id: urlClientId } = useParams();
  const navigate = useNavigate();

  // ২. ক্লায়েন্ট লিস্ট ফেচ করা
  const {
    data: clientsData,
    isLoading: isClientsLoading,
    isError: isClientsError,
    refetch: refetchClients,
  } = useGetClientsQuery();

  const clients = useMemo(() => {
    if (Array.isArray(clientsData)) return clientsData;
    return clientsData?.data || [];
  }, [clientsData]);

  // ৩. স্টেটস
  const [selectedClientId, setSelectedClientId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedClientModal, setSelectedClientModal] = useState(null);

  // 🟢 পেজিনেশন স্টেটস (Pagination States)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // প্রতি পেজে যতগুলো রো দেখাতে চান

  // ৪. URL Path থেকে ID পেয়ে State-এ সেট
  useEffect(() => {
    if (urlClientId) {
      setSelectedClientId(urlClientId);
    } else {
      setSelectedClientId("");
    }
  }, [urlClientId]);

  // 🟢 ক্লায়েন্ট চেঞ্জ হলে পেজ ১-এ রিসেট হবে
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClientId]);

  // ৫. ড্রপডাউন পরিবর্তন হ্যান্ডলার
  const handleClientSelect = (e) => {
    const id = e.target.value;
    setSelectedClientId(id);
    if (id) {
      navigate(`/clients/${id}`);
    } else {
      navigate(`/clients`);
    }
  };

  // ৬. আইডি ভ্যালিডেশন
  const isValidClientId = Boolean(
    selectedClientId &&
    selectedClientId !== "undefined" &&
    selectedClientId !== "null",
  );

  // ৭. ব্যাকএন্ড থেকে নির্দিষ্ট ক্লায়েন্টের ডাটা ও প্রস্তুতকৃত লেজার ফেচ
  const {
    data: clientDetailsResponse,
    isLoading: isLedgerLoading,
    isError: isLedgerError,
  } = useGetClientByIdQuery(selectedClientId, {
    skip: !isValidClientId,
  });

  // ব্যাকএন্ড রেসপন্স অবজেক্ট এক্সট্র্যাক্ট
  const clientInfo = clientDetailsResponse?.data || clientDetailsResponse || {};
  const ledgerList = clientInfo?.ledger || [];
  const currentDue = clientInfo?.totalOutstandingDue ?? 0;

  // 🟢 রিভার্সড লেজার এবং পেজিনেশন হিসাব (সর্বশেষ ট্রানজেকশন প্রথমে দেখানোর জন্য)
  const sortedLedger = useMemo(() => {
    if (!ledgerList.length) return [];

    return [...ledgerList].sort((a, b) => {
      // ১. মূল তারিখ ও সময়ের তুলনা
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      if (dateB !== dateA) {
        return dateB - dateA; // Newest date first
      }

      // ২. যদি তারিখ একই হয়, তবে createdAt বা id অনুযায়ী চেক (Fallback)
      const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      return createdB - createdA;
    });
  }, [ledgerList]);

  const totalPages = Math.ceil(sortedLedger.length / itemsPerPage);

  const paginatedLedger = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedLedger.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedLedger, currentPage, itemsPerPage]);

  const handleAddNew = () => {
    setSelectedClientModal(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gray-50 font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Client Accounts Ledger
          </h1>
          <p className="text-xs text-gray-500">
            Real-time financial status and ticketing hub
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-xs font-medium transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Wallet className="w-4 h-4" /> Receive Payment
          </button>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-medium transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Add New Client
          </button>
        </div>
      </div>

      {/* Select Client Dropdown Section */}
      <div className="bg-white flex flex-col xl:flex-row justify-center xl:justify-between items-stretch sm:items-center gap-4 p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="w-full md:max-w-md">
          {isClientsLoading ? (
            <div className="h-10 bg-gray-200 animate-pulse rounded-xl w-full" />
          ) : isClientsError ? (
            <div className="flex items-center gap-2 text-xs text-red-600">
              <AlertCircle size={16} />
              <span>Failed to load clients.</span>
              <button
                onClick={() => refetchClients()}
                className="underline font-semibold ml-2"
              >
                Retry
              </button>
            </div>
          ) : (
            <select
              value={selectedClientId}
              onChange={handleClientSelect}
              className="w-full text-xs border border-gray-300 px-3.5 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer text-gray-800"
            >
              <option value="">-- Select a Client --</option>
              {clients?.map((client) => {
                const clientId = client.id || client._id;
                return (
                  <option key={clientId} value={clientId}>
                    {client.fullName || client.name}{" "}
                    {client.company ? `(${client.company})` : ""}
                  </option>
                );
              })}
            </select>
          )}
        </div>
        <ReportCalender />
      </div>

      {/* Ledger Table Section */}
      <div className="w-full grid grid-cols-1 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-3">
          {!isValidClientId ? (
            <div className="text-center py-16 text-gray-500">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6 text-gray-400" />
              </div>
              <p className="font-medium text-gray-700">No Client Selected</p>
              <p className="text-xx text-gray-400 mt-1">
                Please select a client from the dropdown above to view their
                statement.
              </p>
            </div>
          ) : isLedgerLoading | isClientsLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-12 bg-gray-100 rounded-lg w-full" />
              <div className="h-8 bg-gray-100 rounded-lg w-3/4" />
              <div className="h-32 bg-gray-100 rounded-lg w-full" />
            </div>
          ) : isLedgerError ? (
            <div className="text-center py-12 text-red-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="font-semibold">Failed to fetch ledger statement!</p>
            </div>
          ) : (
            <>
              {/* Client Header Info */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-100 pb-3 mb-3 gap-4">
                <div>
                  <h2 className="text-xl font-bold font-mono text-gray-900">
                    {clientInfo?.fullName || clientInfo?.name || "Client"}
                  </h2>
                  <p className="text-xx text-gray-500 mt-0.5">
                    Email: {clientInfo?.email || "N/A"} | Phone:{" "}
                    {clientInfo?.phone || "N/A"}
                  </p>
                  {clientInfo?.company && (
                    <p className="text-xx text-blue-600 font-medium mt-1">
                      Company: {clientInfo?.company}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xx text-gray-400 block font-medium">
                      {currentDue > 0
                        ? " Total Outstanding Due"
                        : "Total Credit Balance"}
                    </span>
                    <span
                      className={`text-xl font-bold font-mono ${
                        currentDue > 0 ? "text-red-600" : "text-emerald-600"
                      }`}
                    >
                      {formatCurrency(Math.abs(currentDue))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ledger Table */}
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-100 text-xx font-semibold text-gray-600 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Date</th>
                      <th className="px-4 py-3.5">Reference / Details</th>
                      <th className="px-4 py-3.5 text-right">Debit (Owed)</th>
                      <th className="px-4 py-3.5 text-right">Credit (Paid)</th>
                      <th className="px-4 py-3.5 text-right">
                        Running Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xx text-gray-600">
                    {sortedLedger.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center py-8 text-gray-400 text-xx"
                        >
                          No transactions recorded.
                        </td>
                      </tr>
                    ) : (
                      paginatedLedger.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50/60 transition-colors"
                        >
                          <td className="px-4 py-3.5 text-xx text-gray-500 whitespace-nowrap">
                            {formatDate(item.date)}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-medium text-gray-900">
                              {item.details}
                            </div>
                            {item.subDetails && (
                              <div className="text-xx text-gray-400 mt-0.5">
                                {item.subDetails}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono text-red-600 font-medium whitespace-nowrap">
                            {item.debit > 0 ? formatCurrency(item.debit) : "-"}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono text-emerald-600 font-medium whitespace-nowrap">
                            {item.credit > 0
                              ? formatCurrency(item.credit)
                              : "-"}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono font-bold text-gray-900 whitespace-nowrap">
                            {formatCurrency(Math.abs(item.runningBalance))}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* 🟢 Pagination Control UI */}
              {sortedLedger.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-2 py-3 border-t border-gray-100">
                  <p className="text-xx text-gray-500">
                    Showing{" "}
                    <span className="font-medium text-gray-700">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium text-gray-700">
                      {Math.min(
                        currentPage * itemsPerPage,
                        sortedLedger.length,
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-gray-700">
                      {sortedLedger.length}
                    </span>{" "}
                    entries
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      className="px-3 py-1.5 text-xx font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <ChevronLeft size={14} /> Previous
                    </button>
                    <span className="text-xx text-gray-600 font-medium px-2">
                      Page {currentPage} of {totalPages || 1}
                    </span>
                    <button
                      disabled={currentPage === totalPages || totalPages === 0}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      className="px-3 py-1.5 text-xx font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedClient={selectedClientModal}
      />

      <ReceivePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        selectedClientId={selectedClientId}
      />
    </div>
  );
};

export default Clients;

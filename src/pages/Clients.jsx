import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // 🟢 useParams এবং useNavigate ইম্পোর্ট
import {
  UserPlus,
  FileText,
  Download,
  Wallet,
  AlertCircle,
  User,
} from "lucide-react";
import {
  useGetClientByIdQuery,
  useGetClientsQuery,
} from "../redux/api/clientApi";
import ClientModal from "../components/modals/ClientModal";
import ReceivePaymentModal from "../components/modals/ReceivePaymentModal";
import { formatCurrency, formatDate } from "../utils/dateFormate";

// 🟢 হেলপার: নিরাপদ তারিখ ফরম্যাটিং

const Clients = () => {
  // 🟢 ১. Path parameter থেকে id পড়া (যেমন: /clients/4beca03a-ca9b...)
  const { id: urlClientId } = useParams();
  const navigate = useNavigate();

  // ২. সব ক্লায়েন্টের তালিকা ফেচ করা
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

  // 🟢 ৪. URL Path থেকে ID পেয়ে State-এ সেট করা
  useEffect(() => {
    if (urlClientId) {
      setSelectedClientId(urlClientId);
    } else {
      setSelectedClientId("");
    }
  }, [urlClientId]);

  // 🟢 ৫. Dropdown সিলেক্ট করলে Dynamic URL Path এ নিয়ে যাওয়া
  const handleClientSelect = (e) => {
    const id = e.target.value;
    setSelectedClientId(id);
    if (id) {
      navigate(`/clients/${id}`); // Path-এ আইডি যোগ করা
    } else {
      navigate(`/clients`); // ক্লায়েন্ট সিলেক্ট না থাকলে মূল পাথে ফিরে যাওয়া
    }
  };

  // ৬. সেফ সিলেক্টেড আইডি ভ্যালিডেশন
  const isValidClientId = Boolean(
    selectedClientId &&
    selectedClientId !== "undefined" &&
    selectedClientId !== "null",
  );

  // ৭. সিলেক্টেড ক্লায়েন্টের বিস্তারিত ফেচ করা
  const {
    data: clientDetails,
    isLoading: isLedgerLoading,
    isError: isLedgerError,
  } = useGetClientByIdQuery(selectedClientId, {
    skip: !isValidClientId,
  });

  const handleAddNew = () => {
    setSelectedClientModal(null);
    setIsModalOpen(true);
  };

  // ক্লায়েন্ট ইনফরমেশন অবজেক্ট Extraction
  const clientInfo = clientDetails?.data || clientDetails;

  // ৮. Tickets ও Payments মিলিয়ে ডায়নামিক Ledger Transactions তৈরি
  const { ledgerList, currentDue } = useMemo(() => {
    if (!clientInfo) return { ledgerList: [], currentDue: 0 };

    const openingBalance = Number(clientInfo.openingBalance || 0);
    const tickets = Array.isArray(clientInfo.tickets) ? clientInfo.tickets : [];
    const payments = Array.isArray(clientInfo.payments)
      ? clientInfo.payments
      : [];

    // Ticket (Debit) Entries
    const ticketEntries = tickets.map((t) => {
      const isVoidOrRefund = t.status === "Refunded" || t.status === "Voided";
      const debitAmount = isVoidOrRefund
        ? Number(t.serviceCharge || 0)
        : Number(t.clientPrice || 0) + Number(t.serviceCharge || 0);

      const rawDate = t.issueDate || t.createdAt;

      return {
        id: `ticket-${t.id || Math.random()}`,
        rawDate: rawDate ? new Date(rawDate) : new Date(0),
        formattedDate: formatDate(rawDate),
        details: `Ticket Issued: ${t.pnrCode || "N/A"}`,
        subDetails: `Passenger: ${t.passengerName || "N/A"} (${
          t.ticketType || "Flight"
        })`,
        debit: debitAmount,
        credit: 0,
      };
    });

    // Payment (Credit) Entries
    const paymentEntries = payments.map((p) => {
      const rawDate = p.paymentDate || p.createdAt;

      return {
        id: `payment-${p.id || Math.random()}`,
        rawDate: rawDate ? new Date(rawDate) : new Date(0),
        formattedDate: formatDate(rawDate),
        details: `Payment Received (${p.paymentMethod || "Cash"})`,
        subDetails: p.trxId
          ? `TrxID: ${p.trxId} ${p.note ? `| ${p.note}` : ""}`
          : p.note || "N/A",
        debit: 0,
        credit: Number(p.amount || 0),
      };
    });

    // ট্রানজ্যাকশন সর্টিং
    const allTransactions = [...ticketEntries, ...paymentEntries].sort(
      (a, b) => a.rawDate.getTime() - b.rawDate.getTime(),
    );

    // Running Balance ক্যালকুলেট করা
    let runningBalance = openingBalance;
    const computedLedger = allTransactions.map((item) => {
      runningBalance = runningBalance + item.debit - item.credit;
      return {
        ...item,
        runningBalance,
      };
    });

    return {
      ledgerList: computedLedger,
      currentDue: runningBalance,
    };
  }, [clientInfo]);

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gray-50 font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Client Accounts Ledger
          </h1>
          <p className="text-sm text-gray-500">
            Real-time financial status and ticketing hub
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Wallet className="w-4 h-4" /> Receive Payment
          </button>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Add New Client
          </button>
        </div>
      </div>

      {/* Select Client Dropdown Section */}
      <div className="bg-white flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="w-full max-w-md">
          {isClientsLoading ? (
            <div className="h-10 bg-gray-200 animate-pulse rounded-xl w-full" />
          ) : isClientsError ? (
            <div className="flex items-center gap-2 text-sm text-red-600">
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
              className="w-full text-sm border border-gray-300 px-3.5 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer text-gray-800"
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
        <button
          disabled={!isValidClientId}
          className="text-sm flex items-center justify-center gap-2 border border-blue-200 bg-blue-50 py-2.5 px-5 rounded-xl font-medium cursor-pointer hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-blue-700"
        >
          <Download size={18} />
          Report
        </button>
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
              <p className="text-xs text-gray-400 mt-1">
                Please select a client from the dropdown above to view their
                statement.
              </p>
            </div>
          ) : isLedgerLoading ? (
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
                  <h2 className="text-xl font-bold text-gray-900">
                    {clientInfo?.fullName || clientInfo?.name || "Client"}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Email: {clientInfo?.email || "N/A"} | Phone:{" "}
                    {clientInfo?.phone || "N/A"}
                  </p>
                  {clientInfo?.company && (
                    <p className="text-xs text-blue-600 font-medium mt-1">
                      Company: {clientInfo?.company}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block font-medium">
                      Total Outstanding Due
                    </span>
                    <span
                      className={`text-xl font-bold font-mono ${
                        currentDue > 0 ? "text-red-600" : "text-emerald-600"
                      }`}
                    >
                      {formatCurrency(currentDue)}
                    </span>
                  </div>
                  <button className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer">
                    <FileText className="w-4 h-4" /> Export PDF
                  </button>
                </div>
              </div>

              {/* Ledger Table */}
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                    <tr className="bg-blue-50/40 font-semibold text-blue-700">
                      <td className="px-4 py-3.5 text-xs  flex flex-col">
                        <span> Opening</span>
                        <span>{formatDate(clientInfo?.createdAt)}</span>
                      </td>
                      <td className="px-4 py-3.5 ">Opening Balance</td>
                      <td className="px-4 py-3.5 text-right font-mono text-gray-400">
                        -
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-gray-400">
                        -
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold ">
                        {formatCurrency(clientInfo?.openingBalance)}
                      </td>
                    </tr>

                    {ledgerList.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center py-8 text-gray-400 text-xs"
                        >
                          No transactions recorded after opening balance.
                        </td>
                      </tr>
                    ) : (
                      ledgerList.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50/60 transition-colors"
                        >
                          <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                            {item.formattedDate}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-medium text-gray-900">
                              {item.details}
                            </div>
                            {item.subDetails && (
                              <div className="text-xs text-gray-400 mt-0.5">
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
                            {formatCurrency(item.runningBalance)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
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

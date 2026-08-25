import { Plus } from "lucide-react";
import { Search } from "lucide-react";

import { ChevronLeft } from "lucide-react";
import { ChevronRight } from "lucide-react";
import PassportRow from "../components/passport/PassportRow";
import PassportModal from "../components/modals/PassportModal";
import { useGetAllVisaInfoQuery } from "../redux/features/passports/passportApiSlice";
import { useMemo, useEffect, useState } from "react";

const Passports = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPassport, setSelectedPassport] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    data: passportsData = [],
    isLoading,
    isError,
    error,
  } = useGetAllVisaInfoQuery({
    search: searchTerm,
    status: selectedStatus,
  });
  // console.log(error);
  // 🟢 সার্চ বা ফিল্টার পরিবর্তন হলে পেজ নম্বর ১-এ রিসেট হবে
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  const totalPages = Math.ceil((passportsData?.length || 0) / itemsPerPage);
  // console.log(passportsData);
  const paginatedPassports = useMemo(() => {
    if (!Array.isArray(passportsData)) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return passportsData.slice(startIndex, startIndex + itemsPerPage);
  }, [passportsData, currentPage, itemsPerPage]);
  // console.log(paginatedPassports);
  const handleOpenCreateModal = () => {
    setSelectedPassport(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (passport) => {
    setSelectedPassport(passport);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPassport(null);
  };
  return (
    <div className="min-h-screen p-4 bg-gray-50 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Passport & Visa Information
          </h1>
          <p className="text-xs text-gray-500">
            Manage all passport and visa information status
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Passport & Visa
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Passport no, Visa or Client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs focus:outline-none w-full md:w-auto cursor-pointer uppercase"
          >
            <option value="All Status">All Status</option>
            <option value="Submitted">Submitted</option>
            <option value="Processing">Processing</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-xx font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Passport Details</th>
                <th className="p-4">Client </th>
                <th className="p-4">Visa Type</th>
                <th className="p-4">Visa</th>
                <th className="p-4 text-right">Net Cost</th>
                <th className="p-4 text-right">Client Price</th>
                <th className="p-4 text-right">Profit</th>
                <th className="p-4 px-6 text-right "> Visa Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-gray-500">
                    <div className="space-y-4 p-5  animate-pulse">
                      <div className="h-12 bg-gray-100 rounded-lg w-full" />
                      <div className="h-8 bg-gray-100 rounded-lg w-3/4" />
                      <div className="h-32 bg-gray-100 rounded-lg w-full" />
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-red-500">
                    {error?.data?.message || "Something went wrong"}
                  </td>
                </tr>
              ) : passportsData?.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-gray-400">
                    No visa found.
                  </td>
                </tr>
              ) : (
                paginatedPassports?.map((passport) => (
                  <PassportRow
                    key={passport.id}
                    passport={passport}
                    onEdit={handleOpenEditModal}
                    // onDelete={handleDeleteTicket}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 🟢 Pagination UI */}
        {passportsData?.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200">
            <p className="text-xx text-gray-500">
              Showing{" "}
              <span className="font-medium text-gray-700">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-gray-700">
                {Math.min(currentPage * itemsPerPage, passportsData.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-700">
                {passportsData.length}
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
      </div>

      {showModal && (
        <PassportModal
          key={selectedPassport?.id}
          isOpen={showModal}
          onClose={handleCloseModal}
          initialData={selectedPassport}
        />
      )}
    </div>
  );
};

export default Passports;

import React from "react";
import { UserCheck } from "lucide-react";
import { formatDate } from "../../utils/dateFormate";

const StatusBadgeWithTooltip = ({ status, issuerName, updatedAt }) => {
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "issued":
        return "bg-green-50 text-green-700 border-green-200";
      case "reissue":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "refund":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "void":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <td className="px-3 py-3 relative group text-right">
      <span
        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize cursor-pointer ${getStatusBadge(
          status,
        )}`}
      >
        {status}
      </span>

      {/* Issuer Hover Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-6 hidden group-hover:flex group-hover:flex-col items-center gap-0.5 bg-gray-900 text-white text-xs py-1.5 rounded-lg shadow-xl z-50 whitespace-nowrap animate-in fade-in zoom-in-95 pointer-events-none">
        <p className="flex px-3 gap-1 uppercase text-blue-400 font-bold">
          <UserCheck className="w-3.5 h-3.5" />
          Issued By
        </p>
        <div className="border-b w-full border-gray-600" />
        <strong className="text-gray-100 px-3 font-semibold">
          {issuerName}
        </strong>
        <p className="px-3">
          <span className="text-gray-400 mr-2">Last Update:</span>
          {formatDate(updatedAt)}
        </p>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </div>
    </td>
  );
};

export default StatusBadgeWithTooltip;

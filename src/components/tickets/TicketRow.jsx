import React from "react";
import { PlaneTakeoff, Trash2, SquarePen } from "lucide-react";
import { formatDate } from "../../utils/dateFormate";
import StatusBadgeWithTooltip from "../share/StatusBadgeWithTooltip";
import CustomTooltip from "../share/CustomTooltip";

const TicketRow = ({ ticket, onEdit, onDelete }) => {
  const issuerName =
    ticket?.issuedBy?.fullName ||
    ticket?.issuedBy ||
    ticket?.issuedUser?.fullName ||
    "N/A";

  const isDisableEdit =
    ticket?.status === "void" || ticket?.status === "refund";

  return (
    <tr className="hover:bg-blue-50/50 transition-colors">
      <td className="px-4 py-3">
        <div className="font-mono font-bold text-gray-900 uppercase">
          {ticket?.pnrCode}
        </div>
        <div className="text-[11px] text-gray-400 mt-0.5">
          {formatDate(ticket?.issueDate)}
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="font-medium text-gray-900">{ticket?.passengerName}</div>
        <div className="text-[11px] flex items-center gap-1 text-amber-600 font-medium py-0.5">
          <PlaneTakeoff size={14} strokeWidth={1.5} />
          <span>{formatDate(ticket?.travelDate)}</span>
        </div>
        <div className="relative group w-max mt-0.5">
          <div className="text-xs text-blue-600 font-semibold flex items-center gap-1 cursor-pointer hover:text-blue-800 transition-colors">
            {ticket?.route}
          </div>

          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:flex group-hover:flex-col items-center gap-1.5 bg-gray-900 text-white text-xs rounded-lg py-1.5 shadow-xl z-50 whitespace-nowrap animate-in fade-in zoom-in-95 pointer-events-none">
            <p className="font-bold text-blue-400 uppercase tracking-wide px-3">
              Passenger Details
            </p>
            <div className="border-b w-full border-gray-600" />
            <div className="text-gray-300 px-3">
              <p>
                <span className="text-gray-400">Primary:</span>{" "}
                {ticket?.passengerName}
              </p>
              <p>
                <span className="text-gray-400">Pax Details:</span>{" "}
                {ticket?.totalPax || "N/A"}
              </p>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      </td>

      <td className="px-4 py-3 font-medium">{ticket?.client?.fullName}</td>
      <td className="px-4 py-3 font-medium">{ticket?.airline}</td>

      <td className="px-4 py-3 text-right font-mono text-gray-500">
        ৳{Number(ticket?.netCost || 0).toLocaleString()}
      </td>
      <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900">
        ৳{Number(ticket?.clientPrice || 0).toLocaleString()}
      </td>
      <td className="px-4 py-3 text-right font-mono text-amber-600">
        ৳{Number(ticket?.serviceCharge || 0).toLocaleString()}
      </td>
      <td className="px-4 py-3 text-right font-mono font-semibold text-green-600">
        ৳{Number(ticket?.netProfit || 0).toLocaleString()}
      </td>

      <StatusBadgeWithTooltip
        status={ticket?.status}
        issuerName={issuerName}
        updatedAt={ticket?.updatedAt}
      />

      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-2">
          {/* Edit Button */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => !isDisableEdit && onEdit && onEdit(ticket)}
              disabled={isDisableEdit}
              className={`p-1.5 rounded-lg transition-colors ${
                isDisableEdit
                  ? "text-gray-400 bg-gray-100 cursor-not-allowed opacity-60"
                  : "text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 cursor-pointer"
              }`}
              aria-label="Edit"
            >
              <SquarePen className="w-4 h-4" />
            </button>

            <CustomTooltip
              text={isDisableEdit ? "Disabled" : "Edit"}
              color={isDisableEdit ? "gray" : "blue"}
            />
          </div>

          {/* Delete Button */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => !isDisableEdit && onDelete && onDelete(ticket)}
              disabled={isDisableEdit}
              className={`p-1.5 rounded-lg transition-colors ${
                isDisableEdit
                  ? "text-gray-400 bg-gray-100 cursor-not-allowed opacity-60"
                  : "text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 cursor-pointer"
              }`}
              aria-label="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <CustomTooltip
              text={isDisableEdit ? "Disabled" : "Delete"}
              color={isDisableEdit ? "gray" : "red"}
            />
          </div>
        </div>
      </td>
    </tr>
  );
};

export default TicketRow;

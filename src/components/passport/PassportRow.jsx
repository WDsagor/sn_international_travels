import React from "react";
import { PlaneTakeoff, Trash2, SquarePen } from "lucide-react";

import StatusBadgeWithTooltip from "../share/StatusBadgeWithTooltip";
import CustomTooltip from "../share/CustomTooltip";
import { formatDate } from "../../utils/dateFormate";
import { Image } from "lucide-react";
import { useState } from "react";
import ImageModal from "../modals/ImageModal";

const PassportRow = ({ passport, onEdit, onDelete }) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  // বাটনে ক্লিক করলে Prop হিসেবে পাঠানোর জন্য ইমেজ লিঙ্ক সেট হবে
  const handleOpenImageModal = (imageLink) => {
    setSelectedImage(imageLink);
    setIsImageModalOpen(true);
  };

  const handleImageCloseModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage("");
  };
  const issuerName =
    passport?.issuedBy?.fullName ||
    passport?.issuedBy ||
    passport?.issuedUser?.fullName ||
    "N/A";

  const isDisableEdit =
    passport?.status === "void" || passport?.status === "refund";

  return (
    <tr className="hover:bg-blue-50/50 transition-colors">
      <td className="px-4 py-3">
        <div className="font-mono font-semibold text-gray-900 ">
          {passport?.issue || "10/08/2026"}
        </div>
        {/* <div className="text-[11px] text-gray-400 mt-0.5">
          Submit 12/10/2026
        </div> */}
      </td>

      <td className="px-4 py-3">
        <div className="font-medium text-gray-900">
          {passport?.passportName || " Mohammad Ashikur Rahman"}
        </div>
        <div className="text-xs flex items-center gap-1 text-blue-600 font-bold py-0.5">
          <span>A00151750</span>
          <div className="w-5 h-5 bg-black rounded-full text-white text-center font-bold p-0.5">
            2
          </div>

          <button
            onClick={() =>
              handleOpenImageModal(
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvJHWRgj3lcwhksxKkDDsHrQ_UatU1Gzzksjjhp30Lhg&s=10",
              )
            }
            className="text-green-600 cursor-pointer"
          >
            <Image />
          </button>
          <ImageModal
            isOpen={isImageModalOpen}
            onClose={handleImageCloseModal}
            imgSrc={selectedImage}
          />
        </div>
      </td>

      <td className="px-4 py-3 font-medium">
        {passport?.client?.fullName || "Nil Ratan Dhali"}
      </td>
      <td className="px-4 py-3 font-medium">
        <div className=" font-semibold text-gray-900 ">
          {passport?.agencyName || "Telon Corporation"}
        </div>
        <div className="text-[11px] text-gray-400 mt-0.5">
          Submit 12/10/2026
        </div>
      </td>
      <td className="px-4 py-3 font-medium">
        <div className="font-mono font-semibold text-gray-900 ">
          {passport?.visa || "Singapore"}
        </div>
        <div className="text-[11px] text-gray-400 mt-0.5">
          2 Years, Multiple
        </div>
      </td>

      <td className="px-4 py-3 text-right font-mono text-gray-500">
        ৳{Number(passport?.netCost || 4900).toLocaleString()}
      </td>
      <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900">
        ৳{Number(passport?.clientPrice || 6000).toLocaleString()}
      </td>

      <td className="px-4 py-3 text-right font-mono font-semibold text-green-600">
        ৳{Number(passport?.netProfit || 1100).toLocaleString()}
      </td>
      {/* <td className="px-4 py-3 text-right font-mono font-semibold text-green-600">
        {passport.status || "Pending Approval"}
      </td> */}

      <StatusBadgeWithTooltip
        passport={passport || "status"}
        issuerName={"Uttam halder"}
      />

      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-2">
          {/* Edit Button */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => !isDisableEdit && onEdit && onEdit(passport)}
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
              onClick={() => !isDisableEdit && onDelete && onDelete(passport)}
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

export default PassportRow;

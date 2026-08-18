import React, { useRef, useCallback } from "react";
import { X } from "lucide-react";
import QuickPinchZoom, { make2dTransformValue } from "react-quick-pinch-zoom";
import { FileText } from "lucide-react";
import { ImageOff } from "lucide-react";
import { Ban } from "lucide-react";
import { Image } from "lucide-react";

const ImageModal = ({ isOpen, onClose, imgSrc }) => {
  const imgRef = useRef(null);
  if (!isOpen) return null;

  const onUpdate = useCallback(({ x, y, scale }) => {
    if (imgRef.current) {
      const value = make2dTransformValue({ x, y, scale });
      imgRef.current.style.transform = value;
    }
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-7xl max-h-[90vh] bg-white rounded-2xl p-2 shadow-2xl overflow-hidden flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black cursor-pointer text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg transition-all"
        >
          <X />
        </button>

        {/* 🟢 Zoomable Container */}
        <QuickPinchZoom onUpdate={onUpdate} doubleTapToggleZoom>
          {imgSrc ? (
            <img
              ref={imgRef}
              src={imgSrc}
              alt="Modal Preview"
              className="max-h-[85vh] w-auto object-contain rounded-xl select-none"
            />
          ) : (
            <div className="w-full h-60 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
              <div className="relative mb-2">
                <Image className="w-30 h-30 text-gray-400" />

                <Ban className="w-14 h-14 text-rose-400 absolute bg-white -bottom-1 -right-1 rounded-full p-0.5 shadow-sm" />
              </div>
              <p className="text-2xl font-semibold text-gray-500">
                Passport Image Not Uploaded
              </p>
              <span className="text-md text-gray-700 mt-0.5">
                No document image attached yet
              </span>
            </div>
          )}
        </QuickPinchZoom>
      </div>
    </div>
  );
};
export default ImageModal;

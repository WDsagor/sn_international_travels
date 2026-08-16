import { X } from "lucide-react";

const ImageModal = ({ isOpen, onClose, imgSrc }) => {
  // Modal বন্ধ থাকলে কিছুই রেন্ডার করবে না
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[70vh] bg-white rounded-2xl p-2 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black cursor-pointer text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg transition-all"
        >
          <X />
        </button>

        {/* Modal Image */}
        <img
          src={imgSrc}
          alt="Modal Preview"
          className="max-h-[60vh] w-auto object-contain rounded-xl"
        />
      </div>
    </div>
  );
};
export default ImageModal;

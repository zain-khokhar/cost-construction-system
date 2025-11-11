export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
            {title || 'Confirm Action'}
          </h3>
          <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
            {message || 'Are you sure you want to proceed?'}
          </p>
          <div className="flex gap-2 md:gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-sm md:text-base text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-3 md:px-4 py-2 bg-red-600 text-white text-sm md:text-base rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

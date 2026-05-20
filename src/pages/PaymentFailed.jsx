import { useNavigate } from "react-router-dom";

export default function PaymentFailed() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">

        {/* Icon */}
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Payment Failed
        </h2>

        {/* Message */}
        <p className="text-gray-500 text-sm mb-8">
          Your payment could not be completed. Please try again or contact support if the issue persists.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-colors duration-200"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors duration-200"
          >
            Go Home
          </button>
        </div>

      </div>
    </div>
  );
}
// // App.jsx – Add this to your existing App.jsx
// // If you already have a Router, just add these <Route> entries inside it.

// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import Login  from './pages/Login';
// import Signup from './pages/Signup';
// import HomePage from './pages/HomePage';
// import PaymentStatus from "./pages/PaymentStatus";
// import PaymentFailed from "./pages/PaymentFailed";
// import GenerateQr from './pages/GenerateQr';

// // Replace or merge this with your existing App.jsx
// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Auth routes */}
//         <Route path="/login"  element={<Login />} />
//         <Route path="/signup" element={<Signup />} />
//          <Route path="/payment-status" element={<PaymentStatus />} />
//         <Route path="/payment-failed" element={<PaymentFailed />} />
        

//         {/* Default redirect */}
//         <Route path="/" element={<Navigate to="/login" replace />} />

//         <Route path="/dashboard" element={<HomePage/>}/>
//         <Route path="/qr" element={<GenerateQr/>}/>

//         {/* Your other app routes go here */}
//         {/* <Route path="/dashboard" element={<Dashboard />} /> */}
//       </Routes>
//     </BrowserRouter>
//   );
// }


// App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import HomePage from './pages/HomePage';
import PaymentStatus from "./pages/PaymentStatus";
import PaymentFailed from "./pages/PaymentFailed";
import GenerateQr from './pages/GenerateQr';

// ── Watermark ────────────────────────────────────────────────────────────────
function TestingWatermark() {
  return (
    <div
      className="fixed bottom-4 right-5 z-[9999] pointer-events-none select-none
                 flex items-center gap-1.5 px-3 py-1.5
                 bg-red-600 border border-amber-400/45
                 rounded-md backdrop-blur-sm"
      aria-label="Testing watermark"
    >
      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse" />
      <span className="text-[11px] font-semibold text-amber-500 tracking-wider uppercase whitespace-nowrap">
        For Testing Purpose Only
      </span>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      {/* Watermark renders on every page, above all content */}
      <TestingWatermark />

      <Routes>
        {/* Auth routes */}
        <Route path="/login"          element={<Login />} />
        <Route path="/signup"         element={<Signup />} />
        <Route path="/payment-status" element={<PaymentStatus />} />
        <Route path="/payment-failed" element={<PaymentFailed />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/dashboard" element={<HomePage />} />
        <Route path="/qr"        element={<GenerateQr />} />
      </Routes>
    </BrowserRouter>
  );
}
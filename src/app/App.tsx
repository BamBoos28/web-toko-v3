// App.tsx
import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

/** Lazy-loaded pages */
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Profil = lazy(() => import("@/pages/Profil"));
const Cart = lazy(() => import("@/pages/Cart"));
const Contact = lazy(() => import("@/pages/Contact"));

/** Simple fallback shown while a page chunk is loading */
function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-light">
      <div className="flex items-center gap-3 rounded-md bg-white/90 px-4 py-3 shadow">
        <svg
          className="h-6 w-6 animate-spin text-action"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
          <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <span className="text-sm font-medium text-main">Memuat...</span>
      </div>
    </div>
  );
}

export default function App(): JSX.Element {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Suspense>
  );
}

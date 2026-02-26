import { Routes, Route } from "react-router-dom";

/** Import halaman secara langsung (Eager Loading) */
import Dashboard from "@/pages/Dashboard";
import Profil from "@/pages/Profil";
import Cart from "@/pages/Cart";
import Contact from "@/pages/Contact";

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/profil" element={<Profil />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  );
}
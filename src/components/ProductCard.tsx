// components/ProductCard.tsx
import { useEffect, useState } from "react";
import { Product } from "@/data/products";
import { useToast } from "./ToastProvider";

function formatRupiah(n: number) {
  return n.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
}

export default function ProductCard({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState(false); // collapse state
  const { showToast } = useToast();


  useEffect(() => {
    if (qty < 1) setQty(1);
  }, [qty]);

  // determine description field (fallbacks)
  const description =
    // @ts-ignore - tolerate different field names in product source
    product.description ||
    // @ts-ignore
    product.deskripsi ||
    // @ts-ignore
    product.desc ||
    "";

  const addToCart = () => {
    if ((product.stock ?? 0) <= 0) return alert("Stok habis");

    const stored = localStorage.getItem("cart");
    const cart: {
      id: string;
      qty: number;
      name: string;
      cat: string;
      price: number;
      img: string;
    }[] = stored ? JSON.parse(stored) : [];

    const idx = cart.findIndex((c) => c.id === product.id);
    if (idx >= 0) cart[idx].qty += qty;
    else
      cart.push({
        id: product.id,
        qty,
        name: product.nama,
        cat: product.kategori,
        price: product.harga,
        img: product.img,
      });

    localStorage.setItem("cart", JSON.stringify(cart));
    showToast(`${product.nama} x${qty} ditambahkan`, {
      variant: "success",
      duration: 1800,
    });
    setQty(1);
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm">
      {/* IMAGE */}
      <div className="relative h-40 bg-gray-100">
        <img
          src={product.img || "/bgs.png"}
          alt={product.nama}
          className="h-full w-full object-cover"
        />

        {(product.stock ?? 0) <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-semibold text-red-600">
            Stok Habis
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col px-2 py-3">
        {/* Header: name + collapse button */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold text-slate-800">{product.nama}</h3>

          {/* Collapse toggle */}
          <button
            aria-expanded={open}
            aria-controls={`prod-desc-${product.id}`}
            onClick={() => setOpen((v) => !v)}
            className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-sm text-slate-700"
            title={open ? "Tutup deskripsi" : "Buka deskripsi"}
          >
            {/* simple chevron icon */}
            <svg
              className={`h-4 w-4 transform transition-transform duration-150 ${
                open ? "rotate-180" : "rotate-0"
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        {/* Description (collapse) */}
        {open && (
          <div
            id={`prod-desc-${product.id}`}
            className="mt-2 text-sm text-slate-600"
            role="region"
            aria-label={`Deskripsi ${product.nama}`}
          >
            {description ? (
              <p>{description}</p>
            ) : (
              <p className="italic text-slate-400">Tidak ada deskripsi.</p>
            )}
          </div>
        )}

        <div className="mt-3 text-sm text-slate-900">
          {formatRupiah(product.harga)}
        </div>

        <div className="mt-auto flex items-center gap-3 pt-3">
          {/* COUNTER */}
          <div className="flex items-center gap-2 rounded-lg border">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="h-8 w-6 bg-gray-100"
              aria-label="Kurangi jumlah"
            >
              −
            </button>
            <span className="w-8 text-center text-sm" aria-live="polite">
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="h-8 w-6 bg-gray-100"
              aria-label="Tambah jumlah"
            >
              +
            </button>
          </div>

          {/* ADD */}
          <button
            onClick={addToCart}
            disabled={(product.stock ?? 0) <= 0}
            className="bg-yellow ml-auto rounded-lg px-2 py-2 text-sm font-semibold text-white disabled:opacity-60"
            aria-disabled={(product.stock ?? 0) <= 0}
            title={
              (product.stock ?? 0) <= 0
                ? "Stok habis"
                : "Tambahkan ke keranjang"
            }
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="currentColor"
              aria-hidden
            >
              <path d="M18,12a5.993,5.993,0,0,1-5.191-9H4.242L4.2,2.648A3,3,0,0,0,1.222,0H1A1,1,0,0,0,1,2h.222a1,1,0,0,1,.993.883l1.376,11.7A5,5,0,0,0,8.557,19H19a1,1,0,0,0,0-2H8.557a3,3,0,0,1-2.821-2H17.657a5,5,0,0,0,4.921-4.113l.238-1.319A5.984,5.984,0,0,1,18,12Z" />
              <circle cx="7" cy="22" r="2" />
              <circle cx="17" cy="22" r="2" />
              <path d="M15,7h2V9a1,1,0,0,0,2,0V7h2a1,1,0,0,0,0-2H19V3a1,1,0,0,0-2,0V5H15a1,1,0,0,0,0,2Z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}

// pages/Dashboard.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { useSearchParams } from "react-router-dom";

import BottomNavbar from "@/components/BottomNavbar";
import ProductCard from "@/components/ProductCard";
import CategorySidebar from "@/components/CategorySidebar";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import { Product } from "@/data/products";

/** ====== TYPES / CONSTS ====== */
const DATA_URL = import.meta.env.VITE_API_DATA_SHEET;
const ITEMS_PER_PAGE = 8;

// memoize ProductCard component so it doesn't re-render unless `product` prop changes
const MemoProductCard = React.memo(ProductCard);

/** ====== COMPONENT ====== */
export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get("category") || "all";
  const page = Math.max(1, Number(searchParams.get("page") || "1"));

  // keep last DATA_URL in ref so effect deps stable (DATA_URL is env and usually stable)
  const dataUrlRef = useRef(DATA_URL);

  /** ====== FETCH (with AbortController) ====== */
  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    async function load() {
      try {
        setLoading(true);

        const res = await fetch(dataUrlRef.current, { signal: controller.signal });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

        const json = await res.json();
        const rows: any[][] = Array.isArray(json?.values) ? json.values : [];

        // skip header if present
        const [, ...dataRows] = rows;

        const parsed = dataRows.map((row, idx) => {
          const name = (row?.[0] ?? "").toString().trim();
          const desc = (row?.[1] ?? "").toString().trim();
          const priceRaw = (row?.[2] ?? "").toString().trim();
          const imgRaw = (row?.[3] ?? "").toString().trim();
          const categoryCell = (row?.[4] ?? "Lainnya").toString().trim();
          const stockRaw = (row?.[5] ?? "0").toString().trim();

          const harga = Number(priceRaw.replace(/[^\d.-]/g, "")) || 0;
          const stock = Number(stockRaw.replace(/[^\d.-]/g, "")) || 0;
          const img = imgRaw.replace(/\s+/g, "").replace(/^https?:\s*\/\//, "https://");

          return {
            id: `p-${idx}`,
            nama: name,
            desc,
            harga,
            img,
            kategori: categoryCell || "Lainnya",
            stock,
          } as Product;
        });

        if (mounted) setProducts(parsed);
      } catch (err: any) {
        if (err?.name === "AbortError") {
          // ignore abort
          return;
        }
        console.error("Gagal load data produk (sheets):", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []); // DATA_URL stable from env; if not, add it here

  /** ====== DERIVED DATA (memoized) ====== */
  const categories = useMemo(() => {
    // create stable array of categories (including 'all')
    const setCats = new Set<string>();
    for (let i = 0; i < products.length; i++) {
      setCats.add(products[i].kategori);
    }
    return ["all", ...Array.from(setCats)];
  }, [products]);

  const filtered = useMemo(() => {
    if (category === "all") return products;
    return products.filter((p) => p.kategori === category);
  }, [products, category]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  }, [filtered.length]);

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = page * ITEMS_PER_PAGE;
    // slice returns a new array but it's necessary; paginated only recomputed when deps change
    return filtered.slice(start, end);
  }, [filtered, page]);

  const skeletons = useMemo(() => {
    return Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
      <ProductCardSkeleton key={`skeleton-${i}`} />
    ));
    // we return react nodes here and keep stable unless ITEMS_PER_PAGE changes
  }, []);

  /** ====== CALLBACKS (memoized) ====== */
  const onSelectCategory = useCallback(
    (c: string) => {
      // reset page to 1 when category changes
      setSearchParams({ category: c, page: "1" });
    },
    [setSearchParams]
  );

  const onChangePage = useCallback(
    (p: number) => {
      setSearchParams({ category, page: String(p) });
      // optionally scroll to top of product grid: leave to consumer if needed
    },
    [setSearchParams, category]
  );

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((s) => !s);
  }, []);

  /** ====== RENDER ====== */
  return (
    <>
      {/* Desktop-only message */}
      <div className="bg-light hidden min-h-screen items-center justify-center px-6 xl:flex">
        <div className="max-w-md rounded-xl bg-white p-6 text-center shadow">
          <h1 className="text-primary mb-2 text-xl font-semibold">Mobile Only</h1>
          <p className="text-main text-sm">
            Aplikasi ini hanya dapat digunakan pada perangkat mobile.
            <br />
            Silakan buka kembali menggunakan smartphone.
          </p>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="bg-light min-h-screen xl:hidden ">
        <CategorySidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          categories={categories}
          activeCategory={category}
          page={page}
          totalPages={totalPages}
          onSelectCategory={onSelectCategory}
          onChangePage={onChangePage}
        />

        {/* Toggle sidebar */}
        <button
          onClick={toggleSidebar}
          className="fixed left-2 top-1/2 z-50 -translate-y-1/2 rounded-r-md border-2 border-yellow-300 bg-emerald-800/70 text-white px-3 py-2 shadow"
        >
          {sidebarOpen ? "‹" : "›"}
        </button>

        <main className="mx-auto max-w-6xl px-4 py-6 pb-[100px]">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {skeletons}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {paginated.map((p) => (
                <MemoProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </main>

        <BottomNavbar />
      </div>
    </>
  );
}
type Props = {
  open: boolean;
  onClose: () => void;
  categories: string[];
  activeCategory: string;
  page: number;
  totalPages: number;
  onSelectCategory: (c: string) => void;
  onChangePage: (p: number) => void; // NEW: navigation handler
};

export default function CategorySidebar({
  open,
  onClose,
  categories,
  activeCategory,
  page,
  totalPages,
  onSelectCategory,
  onChangePage,
}: Props) {
  const handlePrev = () => {
    if (page > 1) onChangePage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) onChangePage(page + 1);
  };

  return (
    <>
      {/* Backdrop (mobile) */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />

      {/* Sidebar panel */}
      <aside
        id="sidebar"
        className={`fixed left-0 top-0 z-50 h-full w-72 transform flex flex-col gap-3 bg-white px-4 py-6 shadow-lg transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!open}
        role="complementary"
        aria-label="Kategori Produk"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Halaman</div>
            <div className="text-sm font-semibold text-slate-800">
              {page} / {totalPages}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={page <= 1}
              aria-label="Halaman sebelumnya"
              className={`rounded-md px-2 py-1 text-sm ${
                page <= 1 ? "text-slate-300 cursor-not-allowed" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              ‹
            </button>

            <button
              onClick={onClose}
              aria-label="Tutup sidebar kategori"
              className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
            >
              ✕
            </button>
          </div>
        </div>

        <nav className="mt-4 flex-1 overflow-auto" aria-label="Daftar kategori">
          <ul className="space-y-2">
            {categories.map((c) => {
              const isActive = c === activeCategory;
              return (
                <li key={c}>
                  <button
                    onClick={() => {
                      onSelectCategory(c);
                      onClose(); // close when selecting category
                    }}
                    className={`w-full text-left rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:bg-light ${
                      isActive
                        ? "bg-action text-white"
                        : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                    aria-current={isActive ? "true" : undefined}
                  >
                    {c === "all" ? "Semua Kategori" : c}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Page navigation */}
        <div className="mt-2 border-t pt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={page <= 1}
              className={`px-3 py-1 rounded-md text-sm ${
                page <= 1 ? "bg-gray-100 text-slate-300 cursor-not-allowed" : "bg-white border hover:bg-slate-50"
              }`}
              aria-label="Halaman sebelumnya"
            >
              Prev
            </button>

            {/* Page numbers (limited window if many pages) */}
            <div className="flex gap-1 overflow-x-auto">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const isCurrent = p === page;
                return (
                  <button
                    key={p}
                    onClick={() => onChangePage(p)}
                    className={`px-2 py-1 rounded text-sm ${isCurrent ? "bg-action text-white" : "bg-white border"}`}
                    aria-current={isCurrent ? "true" : undefined}
                    aria-label={`Halaman ${p}`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNext}
              disabled={page >= totalPages}
              className={`px-3 py-1 rounded-md text-sm ${
                page >= totalPages ? "bg-gray-100 text-slate-300 cursor-not-allowed" : "bg-white border hover:bg-slate-50"
              }`}
              aria-label="Halaman berikutnya"
            >
              Next
            </button>
          </div>
        </div>

        {/* footer note */}
        <div className="text-xs text-slate-500">Pilih kategori atau halaman untuk memfilter produk</div>
      </aside>
    </>
  );
}

// App.tsx
import BottomNavbar from "@/components/BottomNavbar";
import IconList from "@/components/IconList";
import { useToast } from "@/components/ToastProvider";
import { useEffect, useState } from "react";

/** Type untuk nilai form */
type FormValues = {
  nama: string;
  alamat: string;
  detailRumah: string;
  nomorWa: string;
};

const STORAGE_KEY = "userData";

/** Validasi nomor WA: 10-15 digit (hanya angka) */
function isValidPhone(phone: string) {
  return /^[0-9]{10,15}$/.test(phone);
}

export default function Profile() {
  const [formValues, setFormValues] = useState<FormValues>({
    nama: "",
    alamat: "",
    detailRumah: "",
    nomorWa: "",
  });

  const { showToast } = useToast();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setFormValues(JSON.parse(saved));
    } catch {}
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleSave() {
    const { nama, alamat, nomorWa } = formValues;

    if (!nama.trim() || !alamat.trim() || !nomorWa.trim()) {
      showToast("Nama, Alamat, dan Nomor WA wajib diisi.", {
        variant: "error",
        duration: 1800,
      });
      return;
    }

    if (!isValidPhone(nomorWa)) {
      showToast("Nomor WA harus 10–15 digit angka.", {
        variant: "error",
        duration: 1800,
      });
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(formValues));

    showToast("Data berhasil disimpan.", {
      variant: "success",
      duration: 1800,
    });
  }

  function handleReset() {
    setFormValues({
      nama: "",
      alamat: "",
      detailRumah: "",
      nomorWa: "",
    });

    localStorage.removeItem(STORAGE_KEY);

    showToast("Data berhasil dihapus.", {
      variant: "success",
      duration: 1800,
    });
  }

  // ---- NEW: collapse state untuk info gratis ongkir ----
  const [promoOpen, setPromoOpen] = useState(false);

  return (
    <>
      <div className="bg-light hidden min-h-screen items-center justify-center px-6 xl:flex">
        <div className="max-w-md rounded-xl bg-white p-6 text-center shadow">
          <h1 className="text-primary mb-2 text-xl font-semibold">
            Mobile Only
          </h1>
          <p className="text-main text-sm">
            Aplikasi ini hanya dapat digunakan pada perangkat mobile.
            <br />
            Silakan buka kembali menggunakan smartphone.
          </p>
        </div>
      </div>

      <div className="bg-light mx-auto min-h-screen max-w-4xl px-4  py-6 xl:hidden">
        <div className=" rounded-xl bg-white p-6 shadow-md">
          <header className="mb-6 text-center">
            <h1 className="text-main text-xl font-bold tracking-widest">
              Form Checkout
            </h1>
            <p className="text-main mt-1 text-sm opacity-70">
              Simpan detail pengiriman Anda
            </p>
          </header>

          <div className="space-y-5">
            {/* Nama */}
            <div>
              <label className="text-main mb-1 block text-xs font-semibold uppercase">
                Nama *
              </label>
              <input
                name="nama"
                value={formValues.nama}
                onChange={handleChange}
                className="border-gray-light w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--action-green)]"
              />
            </div>

            {/* Alamat */}
            <div>
              <label className="text-main mb-1 block text-xs font-semibold uppercase">
                Alamat *
              </label>
              <input
                name="alamat"
                value={formValues.alamat}
                onChange={handleChange}
                className="border-gray-light mb-2 w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-[var(--action-green)]"
              />
              <input
                name="detailRumah"
                value={formValues.detailRumah}
                onChange={handleChange}
                placeholder="Detail rumah (opsional)"
                className="border-gray-light w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-[var(--action-green)]"
              />
            </div>

            {/* Nomor WA */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-main mb-1 block text-xs font-semibold uppercase">
                  Nomor WA *
                </label>
                <input
                  name="nomorWa"
                  value={formValues.nomorWa}
                  onChange={handleChange}
                  inputMode="numeric"
                  className="border-gray-light w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-[var(--action-green)]"
                />
              </div>

              <div className="flex items-end gap-3">
                <button
                  onClick={handleSave}
                  className="bg-action rounded-md px-4 py-2 font-semibold text-white hover:opacity-90"
                >
                  Simpan
                </button>

                <button
                  onClick={handleReset}
                  className="border-gray-light text-main hover:bg-gray-light rounded-md border px-4 py-2"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>

          <footer className="text-main mt-6 text-center text-xs opacity-60">
            Data disimpan secara lokal di perangkat ini
          </footer>
        </div>

        {/* Tombol Kontak Layanan Kami (existing) */}
        <div className="mt-6 px-2">
          <a
            href="/contact"
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#FBBF24] py-3 shadow-md transition-transform active:scale-95"
            aria-label="Kontak Layanan Kami"
          >
            <img src="phone.svg" alt="Contact" className="h-6 w-6" />
            <span className="text-main text-sm font-bold uppercase tracking-wider">
              Kontak Layanan Kami
            </span>
          </a>
        </div>

        {/* NEW: Collapse promo gratis ongkir */}
        <div className="mt-4 px-2">
          <button
            onClick={() => setPromoOpen((s) => !s)}
            aria-expanded={promoOpen}
            className="bg-action flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 shadow-md transition-transform active:scale-95"
          >
            <div className="flex items-center gap-3">
              <img
                src="dollar.svg"
                alt="Promo"
                className="h-6 w-6 brightness-0 invert"
              />
              <div className="text-left">
                <div className="text-main text-sm font-bold uppercase tracking-wider text-white">
                  Gratis Ongkir
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">
                {promoOpen ? "Tutup" : "Lihat"}
              </span>
              {/* simple chevron */}
              <svg
                className={`h-5 w-5 transition-transform ${
                  promoOpen ? "rotate-180" : "rotate-0"
                }`}
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path
                  d="M6 8l4 4 4-4"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </button>

          {/* Content Area (Promo Gratis Ongkir) */}
          <div
            className={`mt-3 overflow-hidden transition-all duration-300 ease-in-out ${
              promoOpen
                ? "max-h-[800px] translate-y-0 transform opacity-100"
                : "max-h-0 -translate-y-2 transform opacity-0"
            }`}
            aria-hidden={!promoOpen}
          >
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Berbagai Promo Menanti
              </p>

              <div className="space-y-3">
                {/* Opsi 1: Minimal Belanja */}
                <div className="flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                  <div className="mt-0.5 flex-shrink-0 text-emerald-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-tight text-emerald-900">
                      Belanja Hemat
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-emerald-700">
                      Gratis ongkir dengan belanja minimal{" "}
                      <span className="font-bold underline decoration-emerald-200">
                        Rp 100.000
                      </span>
                    </p>
                  </div>
                </div>

                {/* Pembatas ATAU */}
                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="mx-3 flex-shrink text-[9px] font-black tracking-tighter">
                    ATAU
                  </span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>

                {/* Opsi 2: Area Lokal */}
                <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50/50 p-3">
                  <div className="mt-0.5 flex-shrink-0 text-blue-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-tight text-blue-900">
                      Khusus Tetangga
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-blue-700">
                      Gratis ongkir tanpa minimal belanja untuk area{" "}
                      <span className="font-bold underline decoration-blue-200">
                        Desa Margorejo
                      </span>{" "}
                      & sekitarnya.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* IconList */}
        <IconList />

        <BottomNavbar />
      </div>
    </>
  );
}

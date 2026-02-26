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
            className="flex w-full items-center justify-between gap-3 rounded-xl bg-action py-3 px-3 shadow-md transition-transform active:scale-95"
          >
            <div className="flex items-center gap-3">
              <img src="dollar.svg" alt="Promo" className="h-6 w-6 brightness-0 invert" />
              <div className="text-left">
                <div className="text-main text-sm font-bold uppercase tracking-wider text-white">
                  Gratis Ongkir
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-white font-semibold">
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

          {/* content area (dibuka/tutup) */}
          <div
            className={`mt-3 overflow-hidden rounded-md bg-white p-4 shadow-sm transition-all ${
              promoOpen ? "max-h-[800px] opacity-100 block" : "max-h-0 hidden"
            }`}
            aria-hidden={!promoOpen}
          >
            {/* isi teks promo */}
            <p className="mb-2 text-sm text-slate-800">
              Promo Gratis Ongkir untuk area <strong>Desa Margorejo</strong> dan
              sekitarnya. Syarat & ketentuan singkat:
            </p>

            <ul className="mb-3 ml-4 list-disc text-sm text-slate-700">
              <li>Pembelian minimum <strong>Rp 100.000</strong></li>
              <li>Berlaku untuk alamat di Desa Margorejo dan area sekitarnya.</li>
              {/* <li>Promo berlaku MInggu dan Senin.</li> */}
            </ul>
          </div>
        </div>

        {/* IconList */}
          <IconList />

        <BottomNavbar />
      </div>
    </>
  );
}
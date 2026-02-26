// pages/Contact.tsx
import BottomNavbar from "@/components/BottomNavbar";
import { useToast } from "@/components/ToastProvider";
import { useState } from "react";

/** ---------- Types ---------- */
type ProfileItem = {
  iconSrc: string;
  text: string;
  desc: string;
  link?: string; // Menambahkan opsi link
};

export default function Contact(): JSX.Element {
  const { showToast } = useToast();

  /** ---------- Profile Info ---------- */
  const profileItems: ProfileItem[] = [
    { 
      iconSrc: "/phone.svg", 
      text: "Nomor WA", 
      desc: "+62 878-3539-4899",
      link: "https://wa.me/6287835394899" // Link langsung ke WhatsApp
    },
    {
      iconSrc: "/location.svg",
      text: "Alamat",
      desc: "Desa Margorejo, Pati",
      // Link ke Google Maps (pencarian berdasarkan alamat/koordinat)
      link: "https://www.google.com/maps/search/?api=1&query=Desa+Margorejo+Kecamatan+Margorejo+Kabupaten+Pati"
    },
    { iconSrc: "/cs.svg", text: "Pelayanan Online", desc: "24 / 7" },
    { iconSrc: "/time.svg", text: "Pengiriman Barang", desc: "07.00 - 18.00" },
  ];

  /** ---------- Form State ---------- */
  const [nama, setNama] = useState("");
  const [pesan, setPesan] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /** ---------- Submit Handler ---------- */
  const handleSendMessage = async () => {
    if (!nama.trim() || !pesan.trim()) {
      showToast("Semua field harus diisi.", {
        variant: "error",
        duration: 1800,
      });
      return;
    }

    setIsLoading(true);

    try {
      const webhook = import.meta.env.VITE_API_DC_SARAN;

      const embeds = [
        {
          title: "📩 Pesan / Saran Baru",
          color: 0x22c55e,
          fields: [
            { name: "👤 Nama Pengirim", value: nama, inline: false },
            { name: "💬 Pesan", value: pesan, inline: false },
          ],
          timestamp: new Date().toISOString(),
        },
      ];

      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: null, embeds }),
      });

      if (!res.ok) throw new Error("Webhook failed");

      setNama("");
      setPesan("");

      showToast("Pesan berhasil dikirim. Terima kasih!", {
        variant: "success",
        duration: 1800,
      });
    } catch (err) {
      showToast("Gagal mengirim pesan. Coba lagi.", {
        variant: "error",
        duration: 1800,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Desktop Overlay */}
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

      {/* Mobile Content */}
      <div className="min-h-screen bg-light pb-24 xl:hidden">
        <div className="mx-auto max-w-4xl px-4 py-8">
          
          {/* ---------- Profile Grid ---------- */}
          <section className="mb-6">
            <div className="grid grid-cols-2 gap-[1px] overflow-hidden rounded-xl border bg-gray-200 shadow-sm">
              {profileItems.map((item, idx) => {
                const CardContent = (
                  <div className="flex h-full flex-col items-center gap-3 bg-white px-4 py-8 text-center transition-colors active:bg-gray-50">
                    <img src={item.iconSrc} alt={item.text} className="h-12 w-12" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-main">
                      {item.text}
                    </h3>
                    <p className="text-[10px] leading-relaxed text-slate-500">
                      {item.desc}
                    </p>
                  </div>
                );

                // Jika ada link, bungkus dengan tag <a>, jika tidak gunakan <div> biasa
                return item.link ? (
                  <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer">
                    {CardContent}
                  </a>
                ) : (
                  <div key={idx}>{CardContent}</div>
                );
              })}
            </div>
          </section>

          {/* ---------- Contact Form ---------- */}
          <section className="rounded-xl bg-white p-6 shadow-md border border-gray-100">
            <h2 className="mb-5 text-center text-lg font-bold tracking-tight text-main">
              Tinggalkan Pesan & Saran
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase text-slate-400">Nama</label>
                <input
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Masukkan nama Anda"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-action focus:outline-none focus:ring-1 focus:ring-action"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase text-slate-400">Pesan</label>
                <textarea
                  value={pesan}
                  onChange={(e) => setPesan(e.target.value)}
                  placeholder="Tulis pesan atau saran di sini..."
                  className="min-h-[120px] w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-action focus:outline-none focus:ring-1 focus:ring-action"
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className={`w-full rounded-lg py-3 text-sm font-bold uppercase tracking-widest text-white shadow-lg transition-all active:scale-95
                  ${isLoading ? "bg-gray-400" : "bg-action hover:bg-opacity-90"}`}
              >
                {isLoading ? "Mengirim..." : "Kirim Pesan"}
              </button>
            </div>
          </section>
        </div>

        <BottomNavbar />
      </div>
    </>
  );
}
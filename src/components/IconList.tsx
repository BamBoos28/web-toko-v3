import { useState, useEffect } from "react";

interface IconItem {
  icon: string; // Path ke file SVG
  header: string;
  description: string;
  phone: string;
}

const iconItems: IconItem[] = [
  {
    icon: "/aman.svg",
    header: "Aman Terjamin",
    description: "Transaksi dilindungi sistem keamanan enkripsi terbaru.",
    phone: "Aman",
  },
  {
    icon: "/time.svg",
    header: "Kirim Instan",
    description: "Layanan pengiriman super cepat sampai di hari yang sama.",
    phone: "Instan",
  },
  {
    icon: "/dollar.svg",
    header: "Harga Termurah",
    description: "Penawaran harga terbaik langsung dari tangan pertama.",
    phone: "Murah",
  },
  {
    icon: "/cs.svg",
    header: "Layanan 24jam",
    description: "Customer service sigap membantu kendala Anda kapanpun.",
    phone: "CS 24jam",
  },
];

function Icon({
  icon,
  header,
  description,
  phone,
  isActive,
}: IconItem & { isActive: boolean }) {
  return (
    <div
      className={`flex flex-1 flex-col xl:flex-row py-6 px-4 xl:px-9 gap-4 rounded-xl items-center justify-center xl:justify-start duration-300 transition-all
      ${
        isActive
          ? "bg-action text-white scale-105 shadow-xl z-10"
          : "hover:bg-neutral-200 bg-white text-neutral-600 border border-neutral-100"
      }`}
    >
      {/* Ikon Container */}
      <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 flex items-center justify-center">
        <img 
          src={icon} 
          alt={header} 
          className={`w-full h-full object-contain duration-300 ${
            isActive ? "brightness-0 invert" : "" 
            /* Filter invert digunakan agar SVG hitam/warna gelap berubah jadi putih saat aktif */
          }`}
        />
      </div>

      {/* Informasi */}
      <div className="text-center xl:text-left">
        <h1 className="hidden md:block font-bold text-sm xl:text-lg tracking-wide leading-tight">
          {header}
        </h1>
        <p className={`hidden xl:block text-[11px] mt-1 leading-relaxed ${
          isActive ? "text-green-50" : "text-neutral-500"
        }`}>
          {description}
        </p>
        {/* Tampilan Mobile Singkat */}
        <h1 className={`block md:hidden font-bold text-[10px] uppercase tracking-wider ${isActive ? "text-white" : ""}`}>
          {phone}
        </h1>
      </div>
    </div>
  );
}

export default function IconList() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % iconItems.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full  py-9 px-4 mb-24">
      <div className="max-w-7xl mx-auto flex flex-row gap-2 md:gap-4 lg:gap-6 items-stretch">
        {iconItems.map((item, index) => (
          <Icon
            key={index}
            {...item}
            isActive={index === activeIndex}
          />
        ))}
      </div>
    </div>
  );
}
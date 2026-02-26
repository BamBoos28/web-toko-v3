import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { href: "/", label: "Katalog", icon: "/cart.png", key: "katalog" },
  { href: "/cart", label: "Keranjang", icon: "/bag.png", key: "qr" },
  { href: "/profil", label: "Profil", icon: "/user.png", key: "profil" },
];

export default function BottomNavbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // compute active index but force "no active" when on /contact
  const getActiveIndex = () => {
    const path = location.pathname || "/";

    // If on contact route, make all non-active
    if (path === "/contact" || path.startsWith("/contact/")) {
      return -1;
    }

    const idx = navItems.findIndex((it) => path === it.href || path.startsWith(it.href + "/"));
    return idx === -1 ? 0 : idx;
  };

  const activeIndex = getActiveIndex();

  const handleNav = (href: string) => {
    if (location.pathname !== href) navigate(href);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 bg-transparent pointer-events-none"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="w-full mx-auto h-[100px] flex items-end pointer-events-none">
        {/* Background base - Putih tetap di bawah */}
        <div className="absolute w-full h-[70px] bottom-0 rounded-t-[24px] bg-white border-t border-[#1B5E20] pointer-events-auto" />

        {/* Items Container */}
        <div className="relative w-full flex items-center justify-around px-4 pb-2 pointer-events-auto">
          {navItems.map((item, index) => {
            const explicitActive = index === activeIndex && activeIndex !== -1;
            const isActive = explicitActive;
            const isQR = item.key === "qr";

            if (isQR) {
              return (
                <div key={item.key} className="relative -top-8 flex flex-col items-center pointer-events-auto">
                  <button
                    onClick={() => handleNav(item.href)}
                    aria-label={item.label}
                    aria-current={isActive ? "page" : undefined}
                    className="flex items-center justify-center w-20 h-20 rounded-full bg-action shadow-xl border-4 border-white focus:outline-none transition-transform active:scale-95"
                  >
                    <img src={item.icon} alt={item.label} className="w-10 h-10 invert brightness-0" />
                  </button>

                  {/* Label QR - always styled as action color but if page is contact (inactive) show neutral */}
                  <span
                    className={`absolute -bottom-7 text-sm`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            }

            return (
              <button
                key={item.key}
                onClick={() => handleNav(item.href)}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className="relative flex flex-col items-center justify-center w-20 h-20 focus:outline-none pointer-events-auto "
              >
                <div
                  className={`mb-1 w-11 h-11 rounded-full flex items-center justify-center border 
                    ${isActive ? "bg-action border-white" : "bg-white border-[#1B5E20]"}
                    transition-colors duration-300`}
                >
                  <img
                    src={item.icon}
                    alt={item.label}
                    className={`w-5 h-5 ${isActive ? "brightness-0 invert" : ""}`}
                  />
                </div>

                <span
                  className={`text-sm `}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

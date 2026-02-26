// CartPage.tsx
import { useToast } from "@/components/ToastProvider";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/** Tipe item cart yang disimpan di localStorage */
type CartItem = {
  id: string;
  qty: number;
  name: string;
  price: number;
  img: string;
};

/** Utility: format angka menjadi IDR (tanpa desimal) */
function formatRupiah(n: number) {
  return n.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
}

/** Baca cart dari localStorage */
function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem("cart");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // basic sanitization
    return parsed
      .map((p) => ({
        id: String(p.id ?? ""),
        name: String(p.name ?? ""),
        qty: Number.isFinite(Number(p.qty)) ? Math.max(0, Number(p.qty)) : 0,
        price: Number.isFinite(Number(p.price)) ? Number(p.price) : 0,
        img: String(p.img),
      }))
      .filter((i) => i.id && i.name && i.qty > 0);
  } catch {
    return [];
  }
}

/** Write cart back to localStorage */
function writeCart(items: CartItem[]) {
  localStorage.setItem("cart", JSON.stringify(items));
}

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  // local editing state for qty per row
  const [editQty, setEditQty] = useState<Record<string, number>>({});
  // id yang sedang dalam mode konfirmasi hapus (null = tidak ada)
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("userData");

      if (!raw) {
        navigate("/profil", { replace: true });
        showToast("Isi data diri dahulu", { variant: "error", duration: 1800 });
        return;
      }

      const userData = JSON.parse(raw);

      const nama =
        typeof userData?.nama === "string" ? userData.nama.trim() : "";

      if (!nama) {
        navigate("/profil", { replace: true });
        showToast("Isi data diri dahulu", { variant: "error", duration: 1800 });
      }
    } catch (err) {
      // jika data corrupt / bukan JSON
      navigate("/profil", { replace: true });
      showToast("Isi data diri dahulu", { variant: "error", duration: 1800 });
    }
  }, []);

  // load on mount
  useEffect(() => {
    const c = readCart();
    setItems(c);
    // init editQty
    const q: Record<string, number> = {};
    c.forEach((it) => (q[it.id] = it.qty));
    setEditQty(q);
  }, []);

  // computed total
  const total = useMemo(() => {
    let s = 0;
    for (const it of items) {
      s += Math.round(it.price) * Math.round(it.qty);
    }
    return s;
  }, [items]);

  // update item qty from edit state
  function handleUpdate(id: string) {
    const newQty = Math.max(1, Math.floor(Number(editQty[id] ?? 1)));
    const updated = items.map((it) =>
      it.id === id ? { ...it, qty: newQty } : it,
    );
    setItems(updated);
    writeCart(updated);
    showToast("Item diperbarui", { variant: "success", duration: 1800 });
  }

  // mulai mode konfirmasi hapus (tampilkan tombol Ya / Tidak)
  function startConfirmDelete(id: string) {
    setConfirmId(id);
  }

  // batalkan konfirmasi (kembalikan tombol Hapus)
  function cancelConfirm() {
    setConfirmId(null);
  }

  // hapus benar-benar dan simpan ke storage
  function confirmDelete(id: string) {
    const updated = items.filter((it) => it.id !== id);
    setItems(updated);
    writeCart(updated);
    // bersihkan editQty
    setEditQty((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    setConfirmId(null);
    showToast("Item dihapus", { variant: "success", duration: 1800 });
  }

  // increment/decrement in the editing UI (doesn't persist until Update)
  function changeEditQty(id: string, delta: number) {
    setEditQty((prev) => {
      const cur = Math.max(1, Number(prev[id] ?? 1));
      const next = Math.max(1, cur + delta);
      return { ...prev, [id]: next };
    });
  }

  // direct number entry
  function handleQtyInput(id: string, value: string) {
    const digits = value.replace(/\D/g, "");
    const num = digits === "" ? 0 : Math.max(0, Number(digits));
    setEditQty((prev) => ({ ...prev, [id]: num }));
  }

  type Embed = {
    title?: string;
    description?: string;
    color?: number;
    fields?: {
      name: string;
      value: string;
      inline?: boolean;
    }[];
    timestamp?: string;
  };

  async function sendWebhook(embeds: Embed[]) {
    const webhook = import.meta.env.VITE_API_DC_PESANAN;

    if (!webhook) {
      console.error("Webhook Discord belum diset di env");
      return;
    }

    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: null,
        embeds,
      }),
    });
  }

  // checkout action
  async function handleCheckout() {
    setIsLoading(true);

    if (items.length === 0) {
      showToast("Keranjang kosong.", {
        variant: "warning",
        duration: 1800,
      });
      return;
    }

    try {
      const orderDetails = items
        .map(
          (item, i) =>
            `${i + 1}. ${item.name} x ${item.qty}  
Rp ${(item.price * item.qty).toLocaleString("id-ID")}`,
        )
        .join("\n");

      const totalHarga = items.reduce(
        (sum, item) => sum + item.price * item.qty,
        0,
      );

      const userDataRaw = localStorage.getItem("userData");
      const user = userDataRaw ? JSON.parse(userDataRaw) : {};

      const userInfo = [
        `👤 **Nama**: ${user.nama ?? "-"}`,
        `📱 **No WA**: ${user.nomorWa ?? "-"}`,
        `📍 **Alamat**: ${user.alamat ?? "-"}`,
        `🏠 **Detail**: ${user.detailRumah ?? "-"}`,
      ].join("\n");

      const embeds = [
        {
          title: "🛒 Pesanan Baru",
          color: 0x22c55e, // hijau
          fields: [
            {
              name: "🧾 Rincian Pesanan",
              value:
                orderDetails +
                `\n\n💰 **Total: Rp ${totalHarga.toLocaleString("id-ID")}**`,
              inline: true,
            },
            {
              name: "📦 Data Penerima",
              value: userInfo,
              inline: true,
            },
          ],
          footer: {
            text: "Pesanan dikirim dari aplikasi (Vite)",
          },
          timestamp: new Date().toISOString(),
        },
      ];

      await sendWebhook(embeds);

      // clear cart (demo)
      writeCart([]);
      setItems([]);
      setEditQty({});

      showToast("Checkout sukses — pesanan dikirim ke admin.", {
        variant: "success",
        duration: 2200,
      });

      setIsLoading(false);
    } catch (err) {
      console.error(err);
      showToast("Gagal mengirim pesanan.", {
        variant: "error",
        duration: 2200,
      });

      setIsLoading(false);
    }
  }

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

      <div className="xl:hidden bg-light min-h-screen pb-16">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="text-main bg-light sticky top-0 mb-4 pb-2 pt-4 text-2xl font-semibold">
            Keranjang Belanja
          </h1>

          {items.length === 0 ? (
            <div className="rounded-md bg-white p-6 text-center text-slate-700 shadow">
              Keranjang kosong.
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="flex gap-3 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                >
                  {/* image */}
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                    <img
                      src={it.img || "/bgs.png"}
                      alt={it.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* main info */}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold text-slate-800">
                          {it.name}
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          {formatRupiah(it.price)}
                        </div>
                      </div>

                      <div className="text-right text-sm text-slate-500">
                        Qty: {it.qty}
                      </div>
                    </div>

                    {/* controls row */}
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white">
                        <button
                          onClick={() => changeEditQty(it.id, -1)}
                          className="h-8 w-8 rounded bg-gray-100"
                          aria-label={`Kurangi qty ${it.name}`}
                        >
                          −
                        </button>

                        <input
                          type="text"
                          inputMode="numeric"
                          value={String(editQty[it.id] ?? it.qty)}
                          onChange={(e) =>
                            handleQtyInput(it.id, e.target.value)
                          }
                          className="w-9 rounded border border-gray-100 px-2 py-1 text-center text-sm"
                          aria-label={`Jumlah ${it.name}`}
                        />

                        <button
                          onClick={() => changeEditQty(it.id, 1)}
                          className="h-8 w-8 rounded bg-gray-100"
                          aria-label={`Tambah qty ${it.name}`}
                        >
                          +
                        </button>
                      </div>

                      {/* Delete / Confirm buttons */}
                      {confirmId === it.id ? (
                        <>
                          <button
                            onClick={() => confirmDelete(it.id)}
                            className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:opacity-90"
                          >
                            Ya
                          </button>
                          <button
                            onClick={cancelConfirm}
                            className="rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-slate-700"
                          >
                            Tidak
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleUpdate(it.id)}
                            className="bg-yellow rounded-md px-3 py-2 text-sm font-medium text-white hover:opacity-90"
                          >
                            Update
                          </button>

                          <button
                            onClick={() => startConfirmDelete(it.id)}
                            className="ml-auto rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                          >
                            Hapus
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Checkout bar fixed bottom */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
            <div className="flex-1">
              <div className="text-sm text-slate-600">Total</div>
              <div className="text-lg font-semibold text-slate-900">
                {formatRupiah(total)}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
              >
                Kembali
              </button>

              <button
                onClick={handleCheckout}
                disabled={isLoading} // Tombol mati jika isLoading true
                className={`rounded-md px-5 py-2 text-sm font-semibold text-white shadow 
        ${
          isLoading
            ? "cursor-not-allowed bg-gray-400"
            : "bg-action hover:bg-primary"
        }`}
              >
                {isLoading ? "Processing..." : "Checkout"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

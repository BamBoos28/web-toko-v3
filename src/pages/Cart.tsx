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
  cat: string;
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
        cat: String(p.cat ?? "Lainnya"),
        qty: Number.isFinite(Number(p.qty)) ? Math.max(0, Number(p.qty)) : 0,
        price: Number.isFinite(Number(p.price)) ? Number(p.price) : 0,
        img: String(p.img ?? ""),
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
  }, [navigate, showToast]);

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

  // grouped by category (array of [cat, items[]]) - stable order: sorted by cat name
  const grouped = useMemo(() => {
    const map = new Map<string, CartItem[]>();
    for (const it of items) {
      const cat = it.cat && it.cat.trim() ? it.cat.trim() : "Lainnya";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(it);
    }
    // sort categories alphabetically (optional)
    const entries = Array.from(map.entries()).sort((a, b) =>
      a[0].localeCompare(b[0], undefined, { sensitivity: "base" })
    );
    return entries;
  }, [items]);

  // update item qty from edit state
  function handleUpdate(id: string) {
    const newQty = Math.max(1, Math.floor(Number(editQty[id] ?? 1)));
    const updated = items.map((it) =>
      it.id === id ? { ...it, qty: newQty } : it
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
    footer?: { text?: string };
  };

  async function sendWebhook(embeds: Embed[]) {
    const webhook = import.meta.env.VITE_API_DC_PESANAN;

    if (!webhook) {
      console.error("Webhook Discord belum diset di env");
      return;
    }

    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: null,
          embeds,
        }),
      });
    } catch (err) {
      console.error("Gagal kirim webhook:", err);
      throw err;
    }
  }

  // checkout action
  async function handleCheckout() {
    setIsLoading(true);

    if (items.length === 0) {
      showToast("Keranjang kosong.", {
        variant: "warning",
        duration: 1800,
      });
      setIsLoading(false);
      return;
    }

    try {
      // Build embed fields grouped by category
      const fields: Embed["fields"] = [];

      for (const [cat, groupItems] of grouped) {
        // lines per item
        const lines: string[] = groupItems.map((it, i) => {
          const subtotal = it.price * it.qty;
          return `${i + 1}. ${it.name} x ${it.qty} — ${formatRupiah(
            subtotal
          )}`;
        });

        const catSubtotal = groupItems.reduce(
          (s, it) => s + it.price * it.qty,
          0
        );

        // guard: Discord field max 1024 chars — if exceed, truncate gracefully
        let value = lines.join("\n");
        const summary = `\n**Subtotal: ${formatRupiah(catSubtotal)}**\n\n`;
        if (value.length + summary.length > 1000) {
          // keep first N lines until length limit
          let acc = "";
          for (const l of lines) {
            if (acc.length + l.length + 1 > 900) break;
            acc += (acc ? "\n" : "") + l;
          }
          value = acc + "\n\n(daftar panjang, lihat panel admin untuk detail)" ;
        }
        value += summary;

        fields.push({
          name: `📦 ${cat}`,
          value: value || "-",
          inline: false,
        });
      }

      // user info
      const userDataRaw = localStorage.getItem("userData");
      const user = userDataRaw ? JSON.parse(userDataRaw) : {};

      const userInfo = [
        `👤 **Nama**: ${user.nama ?? "-"}`,
        `📱 **No WA**: ${user.nomorWa ?? "-"}`,
        `📍 **Alamat**: ${user.alamat ?? "-"}`,
        `🏠 **Detail**: ${user.detailRumah ?? "-"}`,
        `💵 **Total**: ${formatRupiah(total) ?? "-"}`,
      ].join("\n");

      // Ensure we don't exceed 25 fields: if too many categories, combine remainder
      if (fields.length > 23) {
        // keep first 23 fields, combine rest
        const keep = fields.slice(0, 23);
        const rest = fields.slice(23);
        const combinedValue = rest
          .map((f) => `**${f.name}**\n${f.value}`)
          .join("\n\n");
        keep.push({
          name: "📚 Lainnya",
          value:
            combinedValue.length > 900
              ? combinedValue.slice(0, 900) + "\n\n(terpotong)"
              : combinedValue,
          inline: false,
        });
        // replace fields with new
        // @ts-ignore
        fields.length = 0;
        // push the keep content
        keep.forEach((f) => fields.push(f));
      }

      // Push user info as one field
      fields.push({
        name: "\n\n📦 Data Penerima",
        value: userInfo,
        inline: false,
      });

      const embed: Embed = {
        title: "🛒 Pesanan Baru",
        color: 0x22c55e,
        fields,
        footer: { text: "Pesanan dikirim dari aplikasi (Vite)" },
        timestamp: new Date().toISOString(),
      };

      await sendWebhook([embed]);

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
            <div className="space-y-6">
              {/* Render per-category */}
              {grouped.map(([cat, catItems]) => (
                <div key={cat} className="rounded-lg bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-semibold text-slate-800">{cat}</h2>
                    <div className="text-sm text-slate-600">
                      {formatRupiah(
                        catItems.reduce((s, it) => s + it.price * it.qty, 0)
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {catItems.map((it) => (
                      <div
                        key={it.id}
                        className="flex gap-3 rounded-md p-2 hover:bg-gray-50"
                      >
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                          <img
                            src={it.img || "/bgs.png"}
                            alt={it.name}
                            className="h-full w-full object-cover"
                          />
                        </div>

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
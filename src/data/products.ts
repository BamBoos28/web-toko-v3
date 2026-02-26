// data/products.ts

export type Product = {
  id: string;
  nama: string;
  desc: string;
  harga: number;
  img: string;
  kategori: string;
  stock: number; // 0 / 1 (lebih kompatibel)
};


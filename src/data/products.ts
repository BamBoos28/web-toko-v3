// data/products.ts

export type Product = {
  id: string;
  nama: string;
  desc: string;
  harga: number;      // harga asli
  discount: number;   // potongan nominal
  isDiscount: boolean;
  img: string;
  kategori: string;
  stock: number;
};


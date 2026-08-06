import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Hitung umur "X th Y bln" dari tanggal lahir */
export function hitungUmur(tanggalLahir: string | Date, ref: Date = new Date()): string {
  const lahir = new Date(tanggalLahir);
  let bulan = (ref.getFullYear() - lahir.getFullYear()) * 12 + (ref.getMonth() - lahir.getMonth());
  if (ref.getDate() < lahir.getDate()) bulan--;
  if (bulan < 0) bulan = 0;
  const th = Math.floor(bulan / 12);
  const bln = bulan % 12;
  return `${th} th ${bln} bln`;
}

/** Umur dalam bulan (untuk z-score) */
export function umurBulan(tanggalLahir: string | Date, ref: Date = new Date()): number {
  const lahir = new Date(tanggalLahir);
  let bulan = (ref.getFullYear() - lahir.getFullYear()) * 12 + (ref.getMonth() - lahir.getMonth());
  if (ref.getDate() < lahir.getDate()) bulan--;
  return Math.max(0, bulan);
}

export function formatTanggal(d: string | Date): string {
  const date = new Date(d);
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export function inisial(nama: string): string {
  return nama
    .replace(/,.*$/, "")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatDateISO(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

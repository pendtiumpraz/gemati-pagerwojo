/**
 * Perhitungan status gizi & risiko stunting (pendekatan WHO TB/U — height-for-age).
 * Menggunakan median & SD referensi (anchor points) lalu interpolasi linear.
 * Output z-score, status_gizi, dan risiko_stunting.
 *
 * Catatan: ini pendekatan ringkas untuk keperluan aplikasi. Untuk produksi
 * gunakan tabel LMS WHO lengkap.
 */

// Anchor median tinggi/panjang badan (cm) per umur bulan — WHO length/height-for-age
// [bulan, median_L, sd_L, median_P, sd_P]
const ANCHOR: Array<[number, number, number, number, number]> = [
  [0, 49.9, 1.9, 49.1, 1.9],
  [6, 67.6, 2.3, 65.7, 2.3],
  [12, 75.7, 2.6, 74.0, 2.6],
  [18, 82.3, 2.8, 80.7, 2.8],
  [24, 87.1, 3.0, 85.7, 3.1],
  [36, 96.1, 3.3, 95.1, 3.4],
  [48, 103.3, 3.6, 102.7, 3.7],
  [60, 110.0, 3.9, 109.4, 4.0],
];

function interp(bulan: number, sex: "L" | "P") {
  const b = Math.max(0, Math.min(60, bulan));
  let lo = ANCHOR[0];
  let hi = ANCHOR[ANCHOR.length - 1];
  for (let i = 0; i < ANCHOR.length - 1; i++) {
    if (b >= ANCHOR[i][0] && b <= ANCHOR[i + 1][0]) {
      lo = ANCHOR[i];
      hi = ANCHOR[i + 1];
      break;
    }
  }
  const t = hi[0] === lo[0] ? 0 : (b - lo[0]) / (hi[0] - lo[0]);
  const mIdx = sex === "L" ? 1 : 3;
  const sIdx = sex === "L" ? 2 : 4;
  const median = lo[mIdx] + t * (hi[mIdx] - lo[mIdx]);
  const sd = lo[sIdx] + t * (hi[sIdx] - lo[sIdx]);
  return { median, sd };
}

export type HasilGizi = {
  z_score: number;
  status_gizi: "normal" | "kurang" | "sangat_kurang";
  risiko_stunting: "normal" | "tinggi";
};

export function hitungStatusGizi(
  tinggiBadan: number,
  umurBulan: number,
  jenisKelamin: "L" | "P"
): HasilGizi {
  const { median, sd } = interp(umurBulan, jenisKelamin);
  const z = Math.round(((tinggiBadan - median) / sd) * 100) / 100;

  let status_gizi: HasilGizi["status_gizi"];
  let risiko_stunting: HasilGizi["risiko_stunting"];

  if (z < -3) {
    status_gizi = "sangat_kurang";
    risiko_stunting = "tinggi";
  } else if (z < -2) {
    status_gizi = "kurang";
    risiko_stunting = "tinggi";
  } else {
    status_gizi = "normal";
    risiko_stunting = "normal";
  }

  return { z_score: z, status_gizi, risiko_stunting };
}

export const LABEL_GIZI: Record<string, string> = {
  normal: "Normal",
  kurang: "Kurang",
  sangat_kurang: "Sangat Kurang",
};

export const LABEL_RISIKO: Record<string, string> = {
  normal: "Normal",
  tinggi: "Risiko Tinggi",
};

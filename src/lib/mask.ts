/**
 * Masking data pribadi (PII) untuk tampilan.
 * Dipakai di UI agar NIK/HP/email tidak tampil penuh.
 */

/** NIK 16 digit → tampil 6 depan + 4 belakang, tengah disamarkan: 350101******0001 */
export function maskNik(nik?: string | null): string {
  if (!nik) return "-";
  const s = String(nik);
  if (s.length <= 8) return s[0] + "*".repeat(Math.max(1, s.length - 2)) + s.slice(-1);
  return s.slice(0, 6) + "*".repeat(s.length - 10) + s.slice(-4);
}

/** No. HP → 4 depan + 3 belakang: 0812****567 */
export function maskPhone(hp?: string | null): string {
  if (!hp) return "-";
  const s = String(hp);
  if (s.length <= 5) return s[0] + "*".repeat(s.length - 1);
  return s.slice(0, 4) + "*".repeat(Math.max(2, s.length - 7)) + s.slice(-3);
}

/** Email → sisakan 2 huruf awal local-part: ad***@domain */
export function maskEmail(email?: string | null): string {
  if (!email) return "-";
  const [local, domain] = String(email).split("@");
  if (!domain) return email;
  const head = local.slice(0, 2);
  return `${head}${"*".repeat(Math.max(2, local.length - 2))}@${domain}`;
}

/** Nama → sisakan kata pertama + inisial kata berikutnya: "Ahmad R. P." (opsional) */
export function maskNama(nama?: string | null): string {
  if (!nama) return "-";
  const parts = nama.replace(/,.*/, "").trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return parts[0] + " " + parts.slice(1).map((p) => p[0]?.toUpperCase() + ".").join(" ");
}

import crypto from "crypto";

/**
 * Enkripsi PII penting (NIK, No. HP) at-rest — AES-256-GCM.
 * Kunci diturunkan dari env PII_KEY (atau SESSION_SECRET sebagai fallback) via scrypt.
 * Format tersimpan: base64( iv(12) | authTag(16) | ciphertext ).
 * Ditandai prefix "enc:" agar bisa membedakan data lama (plaintext) vs terenkripsi.
 */
const RAW_KEY = process.env.PII_KEY || process.env.SESSION_SECRET || "dev_pii_key_change_me";
const KEY = crypto.scryptSync(RAW_KEY, "gemati_pii_salt_v1", 32);
const HMAC_KEY = crypto.scryptSync(RAW_KEY, "gemati_blind_index_v1", 32);
const PREFIX = "enc:";

export function encryptPII(plain: string | null | undefined): string | null {
  if (plain == null || plain === "") return plain ?? null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);
  const ct = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return PREFIX + Buffer.concat([iv, tag, ct]).toString("base64");
}

export function decryptPII(stored: string | null | undefined): string | null {
  if (stored == null || stored === "") return stored ?? null;
  if (!stored.startsWith(PREFIX)) return stored; // data lama plaintext — kembalikan apa adanya
  try {
    const buf = Buffer.from(stored.slice(PREFIX.length), "base64");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const ct = buf.subarray(28);
    const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

/** Blind index (HMAC-SHA256) — deterministik, untuk exact-match search & cek unik tanpa dekripsi. */
export function blindIndex(value: string | null | undefined): string | null {
  if (value == null || value === "") return null;
  const norm = String(value).trim().toLowerCase();
  return crypto.createHmac("sha256", HMAC_KEY).update(norm).digest("hex");
}

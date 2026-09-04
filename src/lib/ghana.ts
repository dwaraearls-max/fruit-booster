const PHONE_RE = /^(?:\+233|233|0)(?:2|3|4|5)\d{8}$/;

export function normalizeGhPhone(input: string) {
  const digits = input.replace(/\s+/g, "");
  if (digits.startsWith("+233")) return digits;
  if (digits.startsWith("233")) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 10) return `+233${digits.slice(1)}`;
  return digits;
}

export function isValidGhPhone(input: string) {
  return PHONE_RE.test(input.replace(/\s+/g, ""));
}

export function whatsappDigits() {
  return (process.env.NEXT_PUBLIC_WHATSAPP || "233555979765").replace(/\D/g, "");
}

export function waLink(text?: string) {
  const base = `https://wa.me/${whatsappDigits()}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function displayPhone(phone: string) {
  const n = normalizeGhPhone(phone);
  if (n.startsWith("+233") && n.length === 13) {
    return `0${n.slice(4, 6)} ${n.slice(6, 9)} ${n.slice(9)}`;
  }
  return phone;
}

/** Moolre expects local 0-prefixed format e.g. 0241234567 */
export function toLocalGhPhone(input: string) {
  const digits = input.replace(/\s+/g, "");
  if (digits.startsWith("0") && digits.length === 10) return digits;
  if (digits.startsWith("+233") && digits.length === 13) return `0${digits.slice(4)}`;
  if (digits.startsWith("233") && digits.length === 12) return `0${digits.slice(3)}`;
  return digits;
}

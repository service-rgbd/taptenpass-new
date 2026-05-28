export function normalizePhone(input: string): string {
  return input.replace(/\D/g, "").replace(/^225/, "");
}

export function isValidIvorianPhone(phone: string): boolean {
  const digits = normalizePhone(phone);
  return digits.length === 10 && /^(07|05|01)/.test(digits);
}

export function formatPhoneDisplay(phone: string): string {
  const digits = normalizePhone(phone);
  const parts = [
    digits.slice(0, 2),
    digits.slice(2, 4),
    digits.slice(4, 6),
    digits.slice(6, 8),
    digits.slice(8, 10),
  ];
  return parts.filter(Boolean).join(" ");
}

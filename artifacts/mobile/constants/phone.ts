export type OperatorName = "Orange" | "MTN" | "Moov";

export const OPERATOR_PREFIXES: Record<OperatorName, string> = {
  Orange: "07",
  MTN: "05",
  Moov: "01",
};

export function normalizePhone(input: string): string {
  return input.replace(/\D/g, "").replace(/^225/, "");
}

export function detectOperator(phone: string): OperatorName | null {
  const digits = normalizePhone(phone);
  if (digits.startsWith("07")) return "Orange";
  if (digits.startsWith("05")) return "MTN";
  if (digits.startsWith("01")) return "Moov";
  return null;
}

export function validatePhoneForOperator(phone: string, operator: OperatorName): boolean {
  const digits = normalizePhone(phone);
  return digits.startsWith(OPERATOR_PREFIXES[operator]) && digits.length === 10;
}

export function phoneHint(operator: OperatorName): string {
  return `${OPERATOR_PREFIXES[operator]} XX XX XX XX`;
}

export function phoneError(operator: OperatorName): string {
  return `Le numéro ${operator} doit commencer par ${OPERATOR_PREFIXES[operator]} et contenir 10 chiffres.`;
}

export function formatPhoneInput(value: string): string {
  const digits = normalizePhone(value).slice(0, 10);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 6), digits.slice(6, 8), digits.slice(8, 10)];
  return parts.filter(Boolean).join(" ");
}

export const ECG_ACADEMY_PRODUCT = "ecg-academy";
export const EP_MENTOR_PRODUCT = "ep-mentor";

export function getCaseProduct(
  contentJson: Record<string, unknown> | null | undefined
): string | null {
  const product = contentJson?.product;
  return typeof product === "string" && product.length > 0 ? product : null;
}

export function isEcgAcademyCase(
  contentJson: Record<string, unknown> | null | undefined
): boolean {
  return getCaseProduct(contentJson) === ECG_ACADEMY_PRODUCT;
}

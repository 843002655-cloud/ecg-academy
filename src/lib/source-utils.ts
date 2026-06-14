/**
 * Format a case source string for display by stripping common book prefixes/suffixes.
 */
export function formatSource(source: string): string {
  return source
    .replace(/^Clinical Cases in Cardiac Electrophysiology:\s*/, "")
    .replace(/, Lucian Muresan \(ed\.\), Springer \d{4}/, "")
    .replace(/\. Cardiotext Publishing, \d{4}\./, "")
    .replace(/^Bogun FM\.\s*/, "");
}

/**
 * OnePay utility functions - vpc_SecureHash creation
 * Based on official OnePay sample code
 */

import { createHmac } from "crypto";

/** Sort object keys alphabetically (case-sensitive) */
export function sortParams(obj: Record<string, string>): Record<string, string> {
  return Object.keys(obj)
    .sort()
    .reduce(
      (result, key) => {
        result[key] = obj[key];
        return result;
      },
      {} as Record<string, string>
    );
}

/**
 * Build string to hash from sorted params
 * Only includes vpc_* and user_* keys (excludes vpc_SecureHash, vpc_SecureHashType)
 * Skips empty values
 */
export function generateStringToHash(
  paramSorted: Record<string, string>
): string {
  let stringToHash = "";
  for (const key in paramSorted) {
    const value = paramSorted[key];
    const pref4 = key.substring(0, 4);
    const pref5 = key.substring(0, 5);
    if (pref4 === "vpc_" || pref5 === "user_") {
      if (key !== "vpc_SecureHash" && key !== "vpc_SecureHashType") {
        if (value != null && String(value).length > 0) {
          if (stringToHash.length > 0) stringToHash += "&";
          stringToHash += key + "=" + value;
        }
      }
    }
  }
  return stringToHash;
}

/**
 * Generate vpc_SecureHash using HMAC-SHA256
 * @param stringToHash - String from generateStringToHash
 * @param merchantHashCode - Hex string (32 bytes = 64 hex chars)
 * @returns Uppercase hex string
 */
export function genSecureHash(
  stringToHash: string,
  merchantHashCode: string
): string {
  const key = Buffer.from(merchantHashCode, "hex");
  const hmac = createHmac("sha256", key);
  hmac.update(stringToHash);
  return hmac.digest("hex").toUpperCase();
}

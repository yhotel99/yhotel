/**
 * OnePay response verification - validate vpc_SecureHash
 * Use when receiving ReturnURL redirect or IPN callback
 */

import { sortParams, generateStringToHash, genSecureHash } from "./utils";

/**
 * Verify vpc_SecureHash from OnePay response
 * @param params - Query params from ReturnURL or IPN (Record or URLSearchParams)
 * @param merchantHashCode - Your OnePay Hash Code
 * @returns true if signature is valid
 */
export function verifySecureHash(
  params: Record<string, string> | URLSearchParams,
  merchantHashCode: string
): boolean {
  const paramObject: Record<string, string> =
    params instanceof URLSearchParams
      ? Object.fromEntries(params.entries())
      : params;

  const hashFromOnePay = paramObject["vpc_SecureHash"];
  if (!hashFromOnePay) return false;

  const paramsSorted = sortParams(paramObject);
  const stringToHash = generateStringToHash(paramsSorted);
  const computedHash = genSecureHash(stringToHash, merchantHashCode);

  return computedHash === hashFromOnePay;
}

/**
 * Verify from full URL string (e.g. ReturnURL with query)
 */
export function verifySecureHashFromUrl(
  url: string,
  merchantHashCode: string
): boolean {
  const parsed = new URL(url);
  const params = Object.fromEntries(parsed.searchParams.entries());
  return verifySecureHash(params, merchantHashCode);
}

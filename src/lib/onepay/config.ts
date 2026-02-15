/**
 * OnePay configuration
 * Use env vars in production, fallback to sandbox for development
 */
export const ONEPAY_CONFIG = {
  /** Payment gateway base URL */
  baseUrl:
    process.env.ONEPAY_BASE_URL || "https://mtf.onepay.vn",
  /** Payment endpoint path */
  paygatePath: "/paygate/vpcpay.op",
  /** QueryDR API path */
  queryDrPath: "/msp/api/v1/vpc/invoices/queries",

  /** Sandbox credentials (from docs) */
  sandbox: {
    merchantId: "TESTONEPAY31",
    accessCode: "6BEB2566",
    hashCode: "6D0870CDE5F24F34F3915FB0045120D6",
  },
} as const;

export type OnePayEnv = "sandbox" | "production";

export function getOnePayCredentials(env: OnePayEnv = "sandbox") {
  if (env === "production") {
    return {
      merchantId: process.env.ONEPAY_MERCHANT_ID!,
      accessCode: process.env.ONEPAY_ACCESS_CODE!,
      hashCode: process.env.ONEPAY_HASH_CODE!,
    };
  }
  return ONEPAY_CONFIG.sandbox;
}

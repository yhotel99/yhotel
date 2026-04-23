/**
 * OnePay configuration
 * Use env vars in production, fallback to sandbox for development
 */
export const ONEPAY_CONFIG = {
  /** Payment endpoint path */
  paygatePath: "/paygate/vpcpay.op",
  /** QueryDR API path */
  queryDrPath: "/msp/api/v1/vpc/invoices/queries",
  sandboxBaseUrl: "https://mtf.onepay.vn",
  productionBaseUrl: "https://onepay.vn",

  /** Sandbox credentials (from docs) */
  sandbox: {
    merchantId: "TESTONEPAY31",
    accessCode: "6BEB2566",
    hashCode: "6D0870CDE5F24F34F3915FB0045120D6",
  },
} as const;

export type OnePayEnv = "sandbox" | "production";

export function getOnePayEnv(): OnePayEnv {
  return process.env.ONEPAY_ENV === "production" ? "production" : "sandbox";
}

export function resolveOnePayBaseUrl(env: OnePayEnv = getOnePayEnv()) {
  if (process.env.ONEPAY_BASE_URL) return process.env.ONEPAY_BASE_URL;
  return env === "production"
    ? ONEPAY_CONFIG.productionBaseUrl
    : ONEPAY_CONFIG.sandboxBaseUrl;
}

export function getOnePayCredentials(env: OnePayEnv = getOnePayEnv()) {
  if (env === "production") {
    return {
      merchantId: process.env.ONEPAY_MERCHANT_ID!,
      accessCode: process.env.ONEPAY_ACCESS_CODE!,
      hashCode: process.env.ONEPAY_HASH_CODE!,
    };
  }
  return ONEPAY_CONFIG.sandbox;
}

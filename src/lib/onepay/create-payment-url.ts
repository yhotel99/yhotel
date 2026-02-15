/**
 * Create OnePay payment URL
 * Based on official sample - CreateInvoice.js
 */

import { ONEPAY_CONFIG, getOnePayCredentials } from "./config";
import { sortParams, generateStringToHash, genSecureHash } from "./utils";

export interface CreatePaymentParams {
  /** Amount in VND (will be multiplied by 100) */
  amount: number;
  /** Order/booking reference - unique, no Vietnamese accents */
  orderInfo: string;
  /** Merchant transaction ref - unique per transaction */
  merchTxnRef: string;
  /** Client IP (required, cannot be fixed) */
  ticketNo: string;
  /** URL to redirect after payment */
  returnUrl: string;
  /** Optional: IPN callback URL (server-to-server) */
  callbackUrl?: string;
  /** Locale: vn | en */
  locale?: "vn" | "en";
  /** Optional: Customer phone */
  customerPhone?: string;
  /** Optional: Customer email */
  customerEmail?: string;
  /** Optional: Customer ID */
  customerId?: string;
  /** Optional: Card list filter (INTERNATIONAL, DOMESTIC, QR, etc.) */
  cardList?: string;
  /** Use sandbox or production credentials */
  env?: "sandbox" | "production";
}

/**
 * Build OnePay payment URL with vpc_SecureHash
 */
export function createPaymentUrl(params: CreatePaymentParams): string {
  const { env = "sandbox" } = params;
  const creds = getOnePayCredentials(env);

  const baseParams: Record<string, string> = {
    vpc_Version: "2",
    vpc_Currency: "VND",
    vpc_Command: "pay",
    vpc_AccessCode: creds.accessCode,
    vpc_Merchant: creds.merchantId,
    vpc_Locale: params.locale ?? "vn",
    vpc_ReturnURL: params.returnUrl,
    vpc_MerchTxnRef: params.merchTxnRef,
    vpc_OrderInfo: params.orderInfo,
    vpc_Amount: String(Math.round(params.amount * 100)),
    vpc_TicketNo: params.ticketNo,
  };

  if (params.callbackUrl) baseParams.vpc_CallbackURL = params.callbackUrl;
  if (params.customerPhone) baseParams.vpc_Customer_Phone = params.customerPhone;
  if (params.customerEmail) baseParams.vpc_Customer_Email = params.customerEmail;
  if (params.customerId) baseParams.vpc_Customer_Id = params.customerId;
  if (params.cardList) baseParams.vpc_CardList = params.cardList;

  const sorted = sortParams(baseParams);
  const stringToHash = generateStringToHash(sorted);
  const secureHash = genSecureHash(stringToHash, creds.hashCode);
  baseParams.vpc_SecureHash = secureHash;

  const baseUrl = ONEPAY_CONFIG.baseUrl + ONEPAY_CONFIG.paygatePath;
  const search = new URLSearchParams(baseParams).toString();
  return `${baseUrl}?${search}`;
}

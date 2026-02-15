/**
 * OnePay QueryDR API - query transaction result
 * Use when ReturnURL/IPN not received after 15-30 mins
 */

import { ONEPAY_CONFIG, getOnePayCredentials } from "./config";
import { sortParams, generateStringToHash, genSecureHash } from "./utils";

export interface QueryDrParams {
  merchTxnRef: string;
  /** QueryDR uses different credentials (vpc_User, vpc_Password) - from OnePay */
  user?: string;
  password?: string;
  env?: "sandbox" | "production";
}

export interface QueryDrResult {
  vpc_DRExists: string;
  vpc_TxnResponseCode: string;
  vpc_Message: string;
  vpc_MerchTxnRef: string;
  vpc_Merchant: string;
  vpc_OrderInfo: string;
  vpc_Amount: string;
  vpc_TransactionNo?: string;
  vpc_PayChannel?: string;
  vpc_Card?: string;
  vpc_CardNum?: string;
  vpc_SecureHash: string;
  [key: string]: string | undefined;
}

/**
 * Query transaction status via QueryDR API
 * Note: Sandbox QueryDR may use different User/Password - check with OnePay docs
 */
export async function queryDr(params: QueryDrParams): Promise<QueryDrResult> {
  const { merchTxnRef, user = "op01", password = "op123456", env = "sandbox" } = params;
  const creds = getOnePayCredentials(env);

  const baseParams: Record<string, string> = {
    vpc_Version: "2",
    vpc_Command: "queryDR",
    vpc_AccessCode: creds.accessCode,
    vpc_Merchant: creds.merchantId,
    vpc_User: user,
    vpc_Password: password,
    vpc_MerchTxnRef: merchTxnRef,
  };

  const sorted = sortParams(baseParams);
  const stringToHash = generateStringToHash(sorted);
  const secureHash = genSecureHash(stringToHash, creds.hashCode);
  baseParams.vpc_SecureHash = secureHash;

  const url = ONEPAY_CONFIG.baseUrl + ONEPAY_CONFIG.queryDrPath;
  const body = new URLSearchParams(baseParams).toString();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const text = await res.text();
  const result = Object.fromEntries(new URLSearchParams(text).entries()) as QueryDrResult;
  return result;
}

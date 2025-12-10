import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Vietnamese bank BIN codes for VietQR
export const BANK_BIN_CODES: Record<string, string> = {
  "Vietcombank": "970436",
  "BIDV": "970415",
  "Vietinbank": "970415",
  "Agribank": "970405",
  "ACB": "970416",
  "Techcombank": "970407",
  "MBBank": "970422",
  "VPBank": "970432",
  "TPBank": "970423",
  "HDBank": "970437",
  "Sacombank": "970403",
  "Eximbank": "970431",
  "MSB": "970426",
  "VIB": "970441",
  "SHB": "970443",
  "OCB": "970448",
  "SeABank": "970440",
  "PVcomBank": "970412",
  "VietABank": "970427",
  "ABBank": "970425",
  "NamABank": "970428",
  "PublicBank": "970439",
  "BacABank": "970409",
  "SCB": "970429",
  "DongABank": "970406",
  "GPBank": "970408",
  "Kienlongbank": "970414",
  "LienVietPostBank": "970449",
  "VietBank": "970433",
  "NCB": "970419",
  "PGBank": "970430",
  "Oceanbank": "970414",
  "BaoVietBank": "970438",
  "VietCapitalBank": "970424",
  "COOPBANK": "970446",
};
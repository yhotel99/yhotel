import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format booking code to display format
 * If booking_code exists (format: YH20251230000001), return it as is
 * Otherwise, return first 8 characters of UUID in uppercase (fallback)
 * @param bookingCode - Booking code (can be booking_code from DB or UUID)
 * @returns Formatted booking code
 */
export function formatBookingCode(bookingCode: string | null | undefined): string {
  if (!bookingCode) return '';
  // If it's a booking_code (starts with YH), return as is
  if (bookingCode.startsWith('YH')) {
    return bookingCode;
  }
  // Otherwise, return first 8 characters (UUID fallback)
  return bookingCode.slice(0, 8).toUpperCase();
}

/**
 * Generate CRC16 checksum for EMV QR Code
 */
function crc16(data: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Format EMV QR Code field
 */
function formatField(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

/**
 * Common Vietnamese bank BIN codes for VietQR
 * Reference: https://www.vietqr.io/
 */
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
  "Sacombank": "970403",
  "HDBank": "970437",
  "SHB": "970443",
  "Eximbank": "970431",
  "MSB": "970426",
  "VIB": "970441",
  "OCB": "970448",
  "SeABank": "970440",
  "PVcomBank": "970412",
  "VietABank": "970427",
  "ABBank": "970425",
  "NamABank": "970428",
  "PublicBank": "970439",
  "SCB": "970429",
  "VietBank": "970433",
  "BacABank": "970409",
  "DongABank": "970406",
  "KienLongBank": "970452",
  "LienVietPostBank": "970449",
  "NCB": "970419",
  "OceanBank": "970414",
  "PGBank": "970430",
  "SaigonBank": "970400",
  "VCCB": "970434",
  "VietCapitalBank": "970436",
};

/**
 * Generate VietQR string according to EMV QR Code standard
 * VietQR is the Vietnamese standard for QR code payments, compatible with all Vietnamese banks
 * 
 * @param accountNumber - Bank account number (without spaces or special characters)
 * @param bankBin - Bank BIN code (6 digits, e.g., "970436" for Vietcombank)
 *                  You can use BANK_BIN_CODES constant for common banks
 * @param amount - Transaction amount in VND (optional, if not provided, user can enter manually)
 * @param content - Payment content/reference (booking ID or order reference)
 * @param merchantName - Merchant name (max 25 characters)
 * @param merchantCity - Merchant city (max 15 characters)
 * 
 * @returns EMV QR Code string that can be scanned by Vietnamese banking apps
 * 
 * @example
 * ```ts
 * const qrCode = generateVietQR({
 *   accountNumber: "1234567890",
 *   bankBin: BANK_BIN_CODES["Vietcombank"],
 *   amount: 1000000,
 *   content: "BOOK12345",
 *   merchantName: "Y Hotel",
 *   merchantCity: "Ho Chi Minh"
 * });
 * ```
 */
export function generateVietQR({
  accountNumber,
  bankBin,
  amount,
  content,
  merchantName = "Y Hotel",
  merchantCity = "Ho Chi Minh"
}: {
  accountNumber: string;
  bankBin: string;
  amount?: number;
  content?: string;
  merchantName?: string;
  merchantCity?: string;
}): string {
  // Payload Format Indicator
  let qrString = "000201";
  
  // Point of Initiation Method (12 = static)
  qrString += "010212";
  
  // Merchant Account Information
  // GUID for VietQR
  const guid = "A000000775";
  // Bank BIN
  const bankBinField = formatField("01", bankBin);
  // Account Number
  const accountField = formatField("02", accountNumber);
  // Combine merchant account info
  const merchantAccountInfo = formatField("00", guid) + bankBinField + accountField;
  qrString += formatField("38", merchantAccountInfo);
  
  // Merchant Category Code (5812 = Hotels)
  qrString += formatField("52", "5812");
  
  // Transaction Currency (704 = VND)
  qrString += formatField("53", "704");
  
  // Transaction Amount (optional)
  if (amount !== undefined && amount > 0) {
    const amountStr = amount.toFixed(0);
    qrString += formatField("54", amountStr);
  }
  
  // Country Code
  qrString += formatField("58", "VN");
  
  // Merchant Name
  qrString += formatField("59", merchantName);
  
  // Merchant City
  qrString += formatField("60", merchantCity);
  
  // Additional Data Field Template
  if (content) {
    const billNumber = formatField("08", content);
    const additionalData = formatField("62", billNumber);
    qrString += additionalData;
  }
  
  // Calculate CRC for the payload (including CRC field ID but not the CRC value)
  // According to EMV QR Code spec, CRC is calculated for payload + "6304" (without CRC value)
  const payloadForCrc = qrString + "6304";
  const crc = crc16(payloadForCrc);
  qrString += "6304" + crc;
  
  return qrString;
}
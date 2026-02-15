# Hướng dẫn tích hợp OnePay

> Tài liệu này ghi nhận cách tích hợp cổng thanh toán OnePay theo tài liệu chính thức và sample code.

---

## 1. Tổng quan

### Môi trường Sandbox (Test)
| Thông tin | Giá trị |
|-----------|---------|
| Payment Link | `https://mtf.onepay.vn/paygate/vpcpay.op` |
| Merchant ID | `TESTONEPAY31` |
| Access Code | `6BEB2566` |
| Hash Code | `6D0870CDE5F24F34F3915FB0045120D6` |

### Môi trường Production
- Endpoint: `https://onepay.vn/paygate/vpcpay.op`
- Thay thế tài khoản kỹ thuật bằng tài khoản thật do OnePay cấp

---

## 2. Luồng tích hợp chính

### 2.1. Tạo yêu cầu thanh toán (Payment Request)

**Phương thức:** GET  
**URL:** `https://mtf.onepay.vn/paygate/vpcpay.op?[key=value]&...`

#### Tham số bắt buộc
| Tham số | Mô tả |
|---------|-------|
| `vpc_Version` | `2` |
| `vpc_Currency` | `VND` hoặc `USD` (theo tài khoản) |
| `vpc_Command` | `pay` |
| `vpc_AccessCode` | Access Code |
| `vpc_Merchant` | Merchant ID |
| `vpc_Locale` | `vn` hoặc `en` |
| `vpc_ReturnURL` | URL nhận kết quả (phải encode) |
| `vpc_MerchTxnRef` | Mã giao dịch duy nhất (không dấu TV, không ký tự đặc biệt) |
| `vpc_OrderInfo` | Mã đơn hàng/thông tin đơn (không dấu TV) |
| `vpc_Amount` | **Số tiền × 100** (VD: 25.000đ → `2500000`) |
| `vpc_TicketNo` | IP khách hàng (không cố định) |
| `vpc_SecureHash` | Chữ ký HMAC-SHA256 |

#### Tham số tùy chọn
- `vpc_CardList`: Phương thức thanh toán (INTERNATIONAL, DOMESTIC, QR, VIETQR, APPLEPAY, v.v.)
- `vpc_Customer_Phone`, `vpc_Customer_Email`, `vpc_Customer_Id`
- `vpc_CallbackURL`: IPN URL (server-to-server)

---

### 2.2. Tạo chữ ký vpc_SecureHash

**Bước 1:** Lấy tất cả tham số có tiền tố `vpc_` và `user_` (trừ `vpc_SecureHash`, `vpc_SecureHashType`)

**Bước 2:** Sắp xếp key theo thứ tự alphabet (phân biệt hoa thường)

**Bước 3:** Tạo chuỗi: `key1=value1&key2=value2&...` (chỉ tham số có giá trị)

**Bước 4:** Tạo chữ ký:
```
signature = HMAC-SHA256(stringToSign, merchantHashCode).toHex().toUpperCase()
```

**Ví dụ JavaScript (crypto-js):**
```javascript
const CryptoJS = require("crypto-js");
const merHashHex = CryptoJS.enc.Hex.parse(merchantHashCode);
const keyHash = CryptoJS.HmacSHA256(stringToHash, merHashHex);
const secureHash = CryptoJS.enc.Hex.stringify(keyHash).toUpperCase();
```

**Ví dụ Python:**
```python
import hmac
import hashlib

def generate_secure_hash(string_to_hash: str, merchant_hash_code: str) -> str:
    vpc_key = bytes.fromhex(merchant_hash_code)
    vpc_hash = hmac.new(vpc_key, string_to_hash.encode("utf-8"), hashlib.sha256).digest()
    return vpc_hash.hex().upper()
```

---

### 2.3. Xác thực chữ ký khi nhận Response (ReturnURL / IPN)

- Lấy tất cả tham số `vpc_` và `user_` trả về (trừ `vpc_SecureHash`)
- Sắp xếp key alphabet
- Tạo chuỗi stringToSign như trên
- Tính HMAC-SHA256 với Hash Code của merchant
- So sánh với `vpc_SecureHash` OnePay trả về → **bằng nhau = hợp lệ**

---

### 2.4. Xử lý kết quả trả về

| Kênh | Mô tả |
|------|-------|
| **ReturnURL** | Redirect người dùng về trang của merchant kèm params |
| **IPN (CallbackURL)** | OnePay gọi server-to-server; merchant phải trả: `200 OK` + body `responsecode=1&desc=confirm-success` |

**IPN tĩnh vs động:** IPN tĩnh cấu hình 1 lần theo tài khoản. IPN động qua `vpc_CallbackURL` — OnePay ưu tiên `vpc_CallbackURL` nếu có.

#### Trạng thái giao dịch
- `vpc_TxnResponseCode = "0"` → Thành công
- `vpc_TxnResponseCode != "0"` → Thất bại

**Lưu ý:** Mã có thể là chữ (F, Z, B, …) — không ép kiểu về số vì F→0 sẽ hiển thị sai là thành công.

#### Bảng mã lỗi thường gặp (hiển thị cho user)
| Code | Mô tả |
|------|-------|
| 0 | Giao dịch thành công |
| 99 | User Cancel – Người dùng hủy giao dịch |
| F | 3D Secure Failure – Xác thực 3DS không thành công |
| 5 | Insufficient Funds – Số dư không đủ |
| 4 | Expired Card – Thẻ hết hạn |
| 25 | Invalid OTP – Mã OTP không hợp lệ |
| 253 | Expired – Hết thời gian nhập thông tin |
| 300 | Pending – Đang xử lý (QueryDR: query tiếp) |
| 100 | In progress – Chưa thanh toán (QueryDR: query tiếp) |

*Chi tiết đầy đủ xem Phụ lục PDF chính thức.*

---

### 2.5. QueryDR API (truy vấn giao dịch)

**Khi nào dùng:** Sau 15–30 phút chưa nhận ReturnURL/IPN.

- **Endpoint:** `https://mtf.onepay.vn/msp/api/v1/vpc/invoices/queries`
- **Method:** POST (form-urlencoded)
- **Tham số:** `vpc_Command=queryDR`, `vpc_Version=2`, `vpc_MerchTxnRef`, `vpc_Merchant`, `vpc_AccessCode`, `vpc_User`, `vpc_Password`, `vpc_SecureHash`

---

## 3. Lưu ý quan trọng

1. **Số tiền:** Luôn nhân × 100 trước khi gửi (VND: 25.000 → 2500000). Trả góp: từ 3 triệu VND trở lên.
2. **Không dấu TV:** Các tham số không chấp nhận tiếng Việt có dấu và ký tự: `(`, `/`, `&`, `?`, `)`.
3. **vpc_TicketNo:** Phải là IP thực của khách hàng, không cố định.
4. **Bảo mật:** Merchant Hash Code chỉ lưu server-side, không đưa lên frontend.
5. **IPN:** Nếu status code ≠ 200, OnePay retry 3 lần, mỗi lần cách 50s.
6. **Response params:** OnePay trả về tham số khác nhau tùy loại giao dịch — không bắt cố định params, luôn check null.
7. **QueryDR:** vpc_User, vpc_Password do OnePay cấp; sandbox mẫu: op01 / op123456 (xác nhận với OnePay).

---

## 4. Thẻ test (Sandbox)

### DOMESTIC – Vietcombank
| Trường | Giá trị |
|--------|---------|
| Card Number | 9704360000000000002 |
| Card Name | NGUYEN VAN A |
| Issue Date | 01-13 |
| OTP | 123456 |

### Thẻ quốc tế – Master
| Trường | Giá trị |
|--------|---------|
| Card Number | 5123450000000008 |
| Expiry Date | 05/2028 |
| CSC | 123 |

### Thẻ quốc tế – Visa
| Trường | Giá trị |
|--------|---------|
| Card Number | 4000000000001091 |
| Expiry Date | 05/2028 |
| CSC | 123 |

---

## 5. Thư viện OnePay trong dự án

Code mẫu đã được tích hợp sẵn tại `src/lib/onepay/`:

| File | Mô tả |
|------|-------|
| `config.ts` | Cấu hình Sandbox/Production, credentials |
| `utils.ts` | sortParams, generateStringToHash, genSecureHash (HMAC-SHA256) |
| `verify.ts` | verifySecureHash, verifySecureHashFromUrl |
| `create-payment-url.ts` | createPaymentUrl – tạo URL thanh toán |
| `query-dr.ts` | queryDr – truy vấn trạng thái giao dịch |

### Ví dụ sử dụng

```typescript
import {
  createPaymentUrl,
  verifySecureHash,
  getOnePayCredentials,
} from "@/lib/onepay";

// Tạo URL thanh toán
const url = createPaymentUrl({
  amount: 500000,
  orderInfo: "Ma Don Hang 123",
  merchTxnRef: "TXN_" + Date.now(),
  ticketNo: "192.168.1.1",
  returnUrl: "https://yoursite.com/checkout/return",
  callbackUrl: "https://yoursite.com/api/onepay/ipn",
  customerEmail: "guest@email.com",
  env: "sandbox",
});

// Xác thực response
const isValid = verifySecureHash(searchParams, hashCode);
```

---

## 6. Biến môi trường (Production)

Thêm vào `.env`:

```
NEXT_PUBLIC_APP_URL=https://your-domain.com
ONEPAY_MERCHANT_ID=...
ONEPAY_ACCESS_CODE=...
ONEPAY_HASH_CODE=...
ONEPAY_BASE_URL=https://onepay.vn
```

**Lưu ý:** Bảng `payments` cần hỗ trợ `payment_method = 'onepay'`. Nếu có constraint/enum, cần thêm giá trị này.

---

## 7. Liên hệ OnePay

- **HN:** (+84) 24 3936 6668 | Tầng 6, BIDV, 194 Trần Quang Khải  
- **HCM:** (+84) 28 3930 9075 | Tầng 7, ITAXA, 126 Nguyễn Thị Minh Khai  
- **Email:** support@onepay.vn | biz@onepay.vn  
- **Logo & điều khoản:** https://mtf.onepay.vn/client/logo_term_guide/Logo_term_guide_VN_EN.html  

---

## 8. Tham khảo tài liệu gốc

- **PDF:** `docs/01-vi-Tài liệu tích hợp cổng thanh toán OnePay.pdf` – bảng mã lỗi đầy đủ, BIN ngân hàng, Test Case, v.v.
- **Sample code:** `docs/onepay-sample-code/vpc_SecureHash/language/` – JS, Python, PHP, Java, C#, Golang

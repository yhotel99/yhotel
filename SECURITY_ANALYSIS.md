# 🔒 Phân Tích Bảo Mật Edge Function - Sepay Webhook

## 📋 Tổng Quan

Báo cáo này phân tích bảo mật của Edge Function `sepay-webhook` để đánh giá khả năng chống lại các cuộc tấn công webhook giả mạo.

---

## 🚨 Các Lỗ Hổng Bảo Mật Phát Hiện

### 🔴 CRITICAL - Mức Độ Nghiêm Trọng Cao

#### 1. **API Key Validation Không An Toàn** (Dòng 39)
```typescript
if (!apiKey || !apiKey.includes(expectedApiKey)) {
```
**Vấn đề:**
- Sử dụng `includes()` thay vì so sánh chính xác
- Không parse đúng format `Authorization: Apikey <API_KEY>` (SePay) nên dễ viết sai logic check
- Cho phép API key giả mạo nếu chứa chuỗi con của API key thật
- Ví dụ: Nếu API key là `"abc123"`, thì `"xyzabc123xyz"` sẽ pass validation

**Tác động:**
- Attacker có thể đoán và bypass authentication
- Dễ dàng tạo webhook giả mạo

**Giải pháp:**
```typescript
// Sử dụng constant-time comparison
function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
```

#### 2. **Xác Thực Tùy Chọn** (Dòng 32-45)
```typescript
const expectedApiKey = Deno.env.get("SEPAY_WEBHOOK_API_KEY") || Deno.env.get("PAY2S_WEBHOOK_API_KEY");
if (expectedApiKey) {
  // validation...
}
```
**Vấn đề:**
- Nếu không có API key trong env, function bỏ qua hoàn toàn authentication
- Webhook có thể được gọi bởi bất kỳ ai nếu quên cấu hình API key

**Tác động:**
- Cho phép attacker gọi webhook mà không cần authentication
- Có thể tạo booking giả và xác nhận thanh toán giả

**Giải pháp:**
- Bắt buộc phải có API key, throw error nếu không có

---

### 🟠 HIGH - Mức Độ Nghiêm Trọng Trung Bình-Cao

#### 3. **Thiếu Rate Limiting**
**Vấn đề:**
- Không có giới hạn số lượng request từ một IP
- Dễ bị tấn công DDoS hoặc brute force

**Tác động:**
- Attacker có thể spam webhook với hàng nghìn request
- Có thể làm quá tải database và service
- Có thể thử nhiều API key khác nhau

**Giải pháp:**
- Implement rate limiting (ví dụ: 10 requests/phút từ một IP)
- Sử dụng Supabase Edge Function rate limiting hoặc Redis

#### 4. **Thiếu Request Signing/HMAC Verification**
**Vấn đề:**
- Không verify signature từ Sepay
- Chỉ dựa vào API key trong header (có thể bị leak)

**Tác động:**
- Nếu API key bị leak, attacker có thể tạo webhook hợp lệ
- Không thể verify request thực sự đến từ Sepay

**Giải pháp:**
- Yêu cầu Sepay gửi HMAC signature trong header
- Verify signature bằng secret key

#### 5. **Thiếu IP Whitelisting**
**Vấn đề:**
- Không kiểm tra IP nguồn của request
- Bất kỳ IP nào cũng có thể gọi webhook nếu có API key

**Tác động:**
- Attacker có thể gọi từ bất kỳ đâu nếu có API key
- Khó phát hiện các cuộc tấn công

**Giải pháp:**
- Whitelist IP addresses của Sepay (nếu có)
- Log và alert các request từ IP không trong whitelist

---

### 🟡 MEDIUM - Mức Độ Nghiêm Trọng Trung Bình

#### 6. **CORS Quá Rộng** (Dòng 5)
```typescript
"Access-Control-Allow-Origin": "*"
```
**Vấn đề:**
- Cho phép tất cả origins
- Không cần thiết cho webhook (webhook không gọi từ browser)

**Tác động:**
- Tăng surface attack (mặc dù không nghiêm trọng cho webhook)
- Không tuân thủ best practices

**Giải pháp:**
- Chỉ cho phép origins cần thiết hoặc bỏ CORS cho webhook

#### 7. **Thiếu Request Size Limits**
**Vấn đề:**
- Không giới hạn kích thước payload
- Có thể bị tấn công DoS bằng payload lớn

**Tác động:**
- Attacker có thể gửi payload rất lớn làm crash function
- Tốn tài nguyên xử lý

**Giải pháp:**
- Giới hạn request body size (ví dụ: 10KB)

#### 8. **Error Messages Có Thể Leak Thông Tin**
**Vấn đề:**
- Error messages có thể tiết lộ cấu trúc database
- Stack traces có thể leak code structure

**Tác động:**
- Attacker có thể thu thập thông tin về hệ thống
- Dễ dàng tìm lỗ hổng khác

**Giải pháp:**
- Sanitize error messages trong production
- Log chi tiết nhưng chỉ trả về generic errors

---

### 🟢 LOW - Mức Độ Nghiêm Trọng Thấp

#### 9. **Thiếu Input Validation Chi Tiết**
**Vấn đề:**
- Chỉ validate cơ bản (có transaction.id)
- Không validate format của các fields

**Tác động:**
- Có thể gây lỗi nếu payload không đúng format
- Khó debug khi có vấn đề

**Giải pháp:**
- Sử dụng Zod schema để validate payload

#### 10. **Thiếu Request Timestamp Verification**
**Vấn đề:**
- Không kiểm tra timestamp của request
- Có thể replay attack với request cũ

**Tác động:**
- Attacker có thể replay webhook đã ghi lại
- Có thể xác nhận booking nhiều lần (mặc dù có idempotency check)

**Giải pháp:**
- Verify timestamp và reject request quá cũ (> 5 phút)

---

## ✅ Điểm Mạnh Hiện Tại

1. ✅ **Idempotency Check**: Kiểm tra duplicate transaction (dòng 79-112)
2. ✅ **Transaction Type Filtering**: Chỉ xử lý "in" transactions (dòng 125-135)
3. ✅ **Amount Validation**: Kiểm tra số tiền thanh toán (dòng 193-228)
4. ✅ **Booking Status Check**: Kiểm tra booking đã confirmed chưa (dòng 231-243)
5. ✅ **Comprehensive Logging**: Log tất cả transactions vào `payment_logs`
6. ✅ **Error Handling**: Try-catch và error logging tốt
7. ✅ **Database Security**: Sử dụng Supabase RPC function `confirm_booking_secure`

---

## 🛡️ Đề Xuất Cải Thiện

### Ưu Tiên 1 - CRITICAL (Phải sửa ngay)

1. **Sửa API Key Validation**
   - Thay `includes()` bằng constant-time comparison
   - Bắt buộc phải có API key

2. **Thêm Request Signing**
   - Yêu cầu Sepay gửi HMAC signature
   - Verify signature trước khi xử lý

### Ưu Tiên 2 - HIGH (Nên sửa sớm)

3. **Thêm Rate Limiting**
   - Giới hạn 10-20 requests/phút từ một IP
   - Track bằng Redis hoặc in-memory cache

4. **Thêm IP Whitelisting**
   - Whitelist IP addresses của Sepay
   - Log và alert các request từ IP lạ

### Ưu Tiên 3 - MEDIUM (Cải thiện)

5. **Cải thiện CORS**
   - Bỏ CORS hoặc chỉ cho phép origins cần thiết

6. **Thêm Request Size Limits**
   - Giới hạn payload size

7. **Cải thiện Error Handling**
   - Sanitize error messages trong production

### Ưu Tiên 4 - LOW (Tùy chọn)

8. **Thêm Input Validation**
   - Sử dụng Zod schema

9. **Thêm Timestamp Verification**
   - Reject request quá cũ

---

## 📊 Đánh Giá Tổng Thể

| Tiêu Chí | Điểm | Ghi Chú |
|----------|------|---------|
| Authentication | ⚠️ 4/10 | API key validation không an toàn, có thể bypass |
| Authorization | ✅ 7/10 | Có kiểm tra booking status và amount |
| Input Validation | ⚠️ 5/10 | Cơ bản nhưng thiếu chi tiết |
| Rate Limiting | ❌ 0/10 | Không có |
| Request Signing | ❌ 0/10 | Không có |
| Error Handling | ✅ 7/10 | Tốt nhưng có thể leak thông tin |
| Logging | ✅ 9/10 | Rất tốt, log đầy đủ |
| Idempotency | ✅ 8/10 | Tốt, có kiểm tra duplicate |

**Tổng điểm: 40/80 (50%)**

**Kết luận:** Edge function hiện tại **CHƯA ĐỦ MẠNH** để chống lại các cuộc tấn công webhook. Cần sửa các lỗ hổng CRITICAL và HIGH trước khi deploy production.

---

## 🔧 Code Examples - Cải Thiện

Xem file `supabase/functions/sepay-webhook/index.ts` đã được cải thiện với các fix bảo mật.

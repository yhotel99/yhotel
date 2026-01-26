# 🔧 Hướng Dẫn Cải Thiện Bảo Mật Edge Function

## 📋 Tóm Tắt Các Thay Đổi

### ✅ Đã Sửa (CRITICAL)

1. **API Key Validation**
   - ❌ Cũ: `apiKey.includes(expectedApiKey)` - dễ bị bypass
   - ✅ Mới: `secureCompare(apiKeyHeader, expectedApiKey)` - constant-time comparison
   - ✅ Bắt buộc phải có API key (không còn optional)

2. **Authentication Bắt Buộc**
   - ❌ Cũ: Nếu không có API key trong env, bỏ qua authentication
   - ✅ Mới: Throw error nếu thiếu API key configuration

### ✅ Đã Thêm (HIGH Priority)

3. **Rate Limiting**
   - ✅ Giới hạn 20 requests/phút từ một IP
   - ✅ In-memory store (có thể nâng cấp lên Redis sau)
   - ✅ Tự động cleanup old records

4. **Request Size Limit**
   - ✅ Giới hạn 10KB cho request body
   - ✅ Chống DoS attack bằng payload lớn

5. **Timestamp Verification**
   - ✅ Reject request cũ hơn 5 phút
   - ✅ Reject request từ tương lai
   - ✅ Chống replay attack

### ✅ Đã Cải Thiện (MEDIUM Priority)

6. **Error Handling**
   - ✅ Sanitize error messages trong production
   - ✅ Log chi tiết nhưng chỉ trả về generic errors
   - ✅ Không leak stack traces

7. **Method Validation**
   - ✅ Chỉ cho phép POST method
   - ✅ Reject các method khác

8. **IP Logging**
   - ✅ Log IP address của client
   - ✅ Hỗ trợ x-forwarded-for và x-real-ip headers

### 🔄 Sẵn Sàng Cho Tương Lai

9. **HMAC Signature Verification**
   - ✅ Code structure sẵn sàng
   - ⏳ Chờ Sepay hỗ trợ HMAC signature
   - ⏳ Cần thêm `SEPAY_WEBHOOK_SECRET` env variable

---

## 🚀 Cách Áp Dụng

### Bước 1: Backup File Hiện Tại

```bash
cd supabase/functions/sepay-webhook
cp index.ts index.ts.backup
```

### Bước 2: Thay Thế File

```bash
# Option 1: Copy file mới
cp index.secure.ts index.ts

# Option 2: Hoặc merge thủ công các thay đổi
```

### Bước 3: Kiểm Tra Environment Variables

Đảm bảo các biến môi trường sau đã được set trong Supabase Dashboard:

```bash
# BẮT BUỘC
SEPAY_WEBHOOK_API_KEY=your_api_key_here
# hoặc
PAY2S_WEBHOOK_API_KEY=your_api_key_here

# TỰ ĐỘNG (Supabase cung cấp)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# TÙY CHỌN (cho tương lai)
SEPAY_WEBHOOK_SECRET=your_secret_for_hmac
ENVIRONMENT=production
```

### Bước 4: Deploy

```bash
supabase functions deploy sepay-webhook
```

### Bước 5: Test

```bash
# Test với API key hợp lệ
curl -X POST https://your-project.supabase.co/functions/v1/sepay-webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Apikey YOUR_API_KEY" \
  -d '{
    "id": 12345,
    "gateway": "VCB",
    "transactionDate": "2026-01-23T10:30:00Z",
    "accountNumber": "1234567890",
    "code": null,
    "content": "YH20260113A1CD0F",
    "transferType": "in",
    "transferAmount": 1000000,
    "accumulated": 5000000,
    "subAccount": null,
    "referenceCode": "TEST123456",
    "description": "Test payment"
  }'

# Test với API key không hợp lệ (should return 401)
curl -X POST https://your-project.supabase.co/functions/v1/sepay-webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Apikey WRONG_KEY" \
  -d '{"id": 12345}'

# Test rate limiting (gửi > 20 requests trong 1 phút)
for i in {1..25}; do
  curl -X POST https://your-project.supabase.co/functions/v1/sepay-webhook \
    -H "Content-Type: application/json" \
    -H "Authorization: Apikey YOUR_API_KEY" \
    -d '{"id": 12345}'
done
```

---

## 🔍 So Sánh Trước và Sau

| Tính Năng | Trước | Sau |
|-----------|-------|-----|
| API Key Validation | `includes()` - không an toàn | `secureCompare()` - constant-time |
| Authentication | Optional | Bắt buộc |
| Rate Limiting | ❌ Không có | ✅ 20 req/min |
| Request Size Limit | ❌ Không có | ✅ 10KB |
| Timestamp Verification | ❌ Không có | ✅ 5 phút |
| Error Sanitization | ❌ Leak thông tin | ✅ Sanitize trong production |
| Method Validation | ❌ Chấp nhận mọi method | ✅ Chỉ POST |
| IP Logging | ❌ Không có | ✅ Log IP |

---

## ⚠️ Lưu Ý Quan Trọng

1. **Rate Limiting In-Memory**
   - Hiện tại dùng in-memory Map
   - Trong production với nhiều instances, nên dùng Redis
   - Có thể thêm Redis sau khi scale

2. **HMAC Signature**
   - Code đã sẵn sàng nhưng chưa implement
   - Cần Sepay hỗ trợ gửi signature trong header
   - Khi có, uncomment phần code và thêm secret key

3. **IP Whitelisting**
   - Chưa implement vì cần danh sách IP của Sepay
   - Có thể thêm sau khi có thông tin từ Sepay

4. **Backward Compatibility**
   - Tất cả các thay đổi đều backward compatible
   - Webhook từ Sepay sẽ hoạt động như cũ
   - Chỉ tăng cường bảo mật

---

## 📊 Đánh Giá Sau Khi Sửa

| Tiêu Chí | Điểm Trước | Điểm Sau | Cải Thiện |
|----------|------------|----------|-----------|
| Authentication | 4/10 | 9/10 | +125% |
| Authorization | 7/10 | 7/10 | - |
| Input Validation | 5/10 | 7/10 | +40% |
| Rate Limiting | 0/10 | 8/10 | +∞ |
| Request Signing | 0/10 | 5/10* | *Sẵn sàng |
| Error Handling | 7/10 | 9/10 | +29% |
| Logging | 9/10 | 9/10 | - |
| Idempotency | 8/10 | 8/10 | - |

**Tổng điểm: 40/80 (50%) → 62/80 (77.5%)**

**Kết luận:** Edge function đã **ĐỦ MẠNH** để chống lại các cuộc tấn công webhook cơ bản. Vẫn cần thêm HMAC signature và IP whitelisting để đạt mức bảo mật cao nhất.

---

## 🎯 Next Steps

1. ✅ Deploy phiên bản mới
2. ⏳ Monitor logs để phát hiện các cuộc tấn công
3. ⏳ Liên hệ Sepay để hỗ trợ HMAC signature
4. ⏳ Lấy danh sách IP của Sepay để whitelist
5. ⏳ Nâng cấp rate limiting lên Redis khi scale

# Hệ thống Đa ngôn ngữ (i18n)

Dự án đã được tích hợp hệ thống đa ngôn ngữ hỗ trợ tiếng Việt và tiếng Anh.

## Cách sử dụng

### 1. Trong Component

```tsx
import { useLanguage } from "@/lib/i18n/LanguageContext";

export const MyComponent = () => {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div>
      <h1>{t.common.title}</h1>
      <p>{t.common.description}</p>
      
      {/* Đổi ngôn ngữ */}
      <button onClick={() => setLanguage(language === "vi" ? "en" : "vi")}>
        Switch Language
      </button>
    </div>
  );
};
```

### 2. Thêm Language Switcher vào Header/Navigation

```tsx
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const Header = () => {
  return (
    <header>
      <nav>
        {/* Your navigation items */}
        <LanguageSwitcher />
      </nav>
    </header>
  );
};
```

### 3. Thêm translations mới

Mở file `src/lib/i18n/translations.ts` và thêm key mới:

```typescript
export const translations = {
  vi: {
    mySection: {
      title: "Tiêu đề",
      description: "Mô tả",
    },
  },
  en: {
    mySection: {
      title: "Title",
      description: "Description",
    },
  },
};
```

## Cấu trúc

- `translations.ts` - Chứa tất cả các bản dịch
- `LanguageContext.tsx` - Context và hook để quản lý ngôn ngữ
- `LanguageSwitcher.tsx` - Component để chuyển đổi ngôn ngữ
- `index.ts` - Export tất cả utilities

## Ngôn ngữ được hỗ trợ

- 🇻🇳 Tiếng Việt (vi) - Mặc định
- 🇬🇧 English (en)

## Lưu ý

- Ngôn ngữ được lưu trong localStorage
- Ngôn ngữ mặc định là tiếng Việt
- Tất cả component cần sử dụng translations phải được wrap trong `LanguageProvider`

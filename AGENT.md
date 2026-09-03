# 🛠️ AGENT & CODEBASE CONVENTIONS — VOCAB APP

> Tài liệu quy chuẩn kỹ thuật, kiến trúc thư mục, quy tắc tách logic và sử dụng thư viện đồng bộ cho toàn bộ dự án **Vocab App**.
> **Tuyệt đối tuân thủ các quy tắc dưới đây khi tạo mới hoặc sửa đổi mã nguồn. Không tự ý tạo file tùy tiện hoặc viết code vi phạm quy chuẩn DRY.**

---

## 1. Nguyên Tắc Cốt Lõi (Core Engineering Principles)

1. **DRY (Don't Repeat Yourself) — Không Viết Hàm Trùng Lặp**:
   - Bất kỳ đoạn logic, công thức tính toán, hàm xử lý chuỗi/ngày tháng hay gọi API xuất hiện từ **2 lần trở lên** (hoặc có khả năng tái sử dụng) **PHẢI** được tách thành helper function độc lập trong `utils/` hoặc `services/`.
   - Nghiêm cấm copy-paste code giữa các component, hook hoặc file service.

2. **Skinny Components, Fat Hooks (Tách Logic Triệt Để)**:
   - Component **chỉ làm nhiệm vụ hiển thị giao diện (JSX)** và bắt sự kiện người dùng (UI event bindings).
   - Mọi state phức tạp, side-effect (`useEffect`), gọi API, logic form, tính toán số liệu **bắt buộc phải được tách vào Custom Hooks nhỏ**.
   - Mỗi component nên giữ độ dài vừa phải (< 100 dòng UI). Nếu vượt quá, hãy chia nhỏ thành sub-components hoặc trích xuất custom hooks.

3. **Separation of Concerns (Phân Tách Lớp Rõ Ràng)**:
   ```
   [Page / Route] (Next.js App Router)
         │
   [Layout / Shell] (Header, Sidebar, Navigation)
         │
   [Feature Component] (Chỉ nhận props & render JSX)
         │
   [Custom Hook] (use[Feature][Action] — quản lý state, side effects, handlers)
         │
   [Service Layer] (Gọi API qua Axios Instance hoặc Supabase Client)
         │
   [Lib / Core / Utils] (Axios config, Supabase config, QueryClient, Pure Helpers)
   ```

4. **Type Safety Tuyệt Đối**:
   - 100% sử dụng TypeScript, không dùng `any`.
   - Dùng `Zod` để validate runtime data (Form inputs, API responses, Server Actions payload) và infer type thông qua `z.infer<typeof schema>`.

5. **Phân Định Trách Nhiệm Dữ Liệu**:
   - **Server State (Dữ liệu từ DB/API)**: Quản lý độc quyền qua **TanStack Query** (React Query). Không bao giờ lưu server data vào Zustand hay useState để tránh mất đồng bộ cache.
   - **Client State (Trạng thái UI, modal, sidebar, filter tạm, timer...)**: Quản lý qua **Zustand** (cho global UI state) hoặc `useState` (cho local component state).

---

## 2. Cấu Trúc Thư Mục Chuẩn (Project Structure)

Dự án áp dụng Next.js App Router với đường dẫn alias `@/*` ánh xạ tới thư mục gốc.

```
vocab-app-plus/
├── app/                               # Next.js App Router (Chỉ chứa routing & layout wrappers)
│   ├── (auth)/                        # Route group: Xác thực (login, register, forgot-password)
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/                        # Route group: Giao diện chính của người dùng
│   │   ├── layout.tsx                 # Main layout: AppSidebar, AppHeader, BottomNav
│   │   ├── page.tsx                   # Dashboard
│   │   ├── review/page.tsx            # Màn hình SRS Review
│   │   ├── add/page.tsx               # Thêm từ vựng (Chế độ thủ công & AI)
│   │   ├── import/page.tsx            # Import văn bản
│   │   ├── leaderboard/page.tsx       # Bảng xếp hạng
│   │   └── settings/page.tsx          # Cài đặt cá nhân & Telegram
│   ├── (admin)/                       # Route group: Trang quản trị
│   │   ├── layout.tsx                 # Admin layout: AdminSidebar, AdminHeader, Guard
│   │   └── admin/
│   │       ├── dashboard/page.tsx
│   │       ├── users/page.tsx
│   │       ├── cards/page.tsx
│   │       ├── ai-providers/page.tsx
│   │       └── telegram/page.tsx
│   ├── api/                           # Next.js Route Handlers (Internal API proxy / Webhooks)
│   │   ├── telegram/webhook/route.ts
│   │   └── ...
│   ├── layout.tsx                     # Root Layout: nạp font, meta, AppProviders
│   ├── globals.css                    # Tailwind CSS imports & Design Tokens
│   └── favicon.ico
│
├── components/                        # UI Components
│   ├── ui/                            # Primitives / shadcn/ui components (button, dialog, input...)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── dropdown-menu.tsx
│   │   └── ...
│   ├── common/                        # Component dùng chung toàn app (EmptyState, Loader, Avatar, Badge...)
│   │   ├── empty-state.tsx
│   │   ├── loading-spinner.tsx
│   │   ├── audio-button.tsx
│   │   └── stat-card.tsx
│   ├── layouts/                       # Khung layout dùng chung
│   │   ├── app-header.tsx
│   │   ├── app-sidebar.tsx
│   │   ├── mobile-bottom-nav.tsx
│   │   └── admin-sidebar.tsx
│   ├── providers/                     # React Context Providers gom cụm
│   │   ├── app-providers.tsx          # Bọc TanStack Query, Theme, Toast
│   │   └── query-provider.tsx
│   └── features/                      # Components theo từng domain/tính năng
│       ├── review/                    # Review Flashcard UI
│       │   ├── flashcard.tsx
│       │   ├── rating-actions.tsx
│       │   └── review-progress.tsx
│       ├── cards/                     # Quản lý card & Form thêm từ
│       │   ├── card-form-manual.tsx
│       │   ├── card-form-ai-preview.tsx
│       │   └── card-item.tsx
│       ├── import/
│       ├── admin/
│       └── settings/
│
├── hooks/                             # Custom React Hooks
│   ├── common/                        # Hooks dùng chung toàn app
│   │   ├── use-debounce.ts
│   │   ├── use-local-storage.ts
│   │   ├── use-media-query.ts
│   │   └── use-text-to-speech.ts      # Web Speech API wrapper
│   └── features/                      # Hooks chia nhỏ theo domain
│       ├── review/
│       │   ├── use-review-session.ts  # Điều phối phiên review
│       │   └── use-fsrs-rating.ts     # Tính toán FSRS state
│       ├── cards/
│       │   ├── use-cards-query.ts     # TanStack Query hook lấy danh sách card
│       │   ├── use-card-mutation.ts   # Tạo, sửa, xóa card
│       │   └── use-card-form.ts       # React Hook Form + Zod logic
│       ├── ai/
│       │   └── use-ai-analyzer.ts     # Gọi phân tích từ AI
│       └── admin/
│
├── services/                          # API Service Layer (Giao tiếp HTTP / Supabase)
│   ├── api.client.ts                  # Axios instance chuẩn & cấu hình interceptor
│   ├── cards.service.ts               # Các hàm gọi API CRUD Cards
│   ├── review.service.ts              # Các hàm gọi API SRS Review & Logs
│   ├── ai.service.ts                  # Các hàm gọi AI Analyzer, Mnemonic
│   ├── telegram.service.ts            # Các hàm liên quan Telegram token
│   └── admin.service.ts               # API cho trang quản trị
│
├── lib/                               # Khởi tạo thư viện & cấu hình cốt lõi
│   ├── utils.ts                       # Helper `cn(...)` (clsx + tailwind-merge)
│   ├── axios.ts                       # Singleton Axios instance
│   ├── query-client.ts                # Cấu hình TanStack Query Client mặc định
│   ├── fsrs.ts                        # Khởi tạo thuật toán ts-fsrs
│   └── supabase/                      # Cấu hình Supabase client theo chuẩn Next.js SSR
│       ├── client.ts                  # createBrowserClient (dùng phía client)
│       ├── server.ts                  # createServerClient (dùng trong Server Component, Action, Route)
│       └── middleware.ts              # updateSession (dùng trong Next.js Middleware)
│
├── stores/                            # Zustand Global Stores (Chỉ lưu UI / Client state)
│   ├── use-ui-store.ts                # Sidebar collapse, modal state, active theme
│   ├── use-review-store.ts            # Current card index, transient answers
│   └── use-auth-store.ts              # Current profile cache, role info
│
├── types/                             # TypeScript definitions
│   ├── database.types.ts              # Types sinh từ Supabase schema
│   ├── card.types.ts                  # Domain models cho Card, Senses, Collocations
│   ├── review.types.ts                # Review logs, FSRS states, Ratings
│   ├── api.types.ts                   # ApiResponse<T>, PaginatedResponse<T>, ApiError
│   └── admin.types.ts
│
├── utils/                             # Pure Helper Functions (Độc lập, có thể unit test)
│   ├── datetime.ts                    # Format ngày, giờ vàng, timezone (date-fns, date-fns-tz)
│   ├── formatters.ts                  # Format chuỗi, số, XP, viết hoa chữ cái
│   ├── error.ts                       # Xử lý & chuẩn hóa lỗi từ Axios / Supabase
│   └── validators.ts                  # Reusable Zod fragments & helpers
│
└── constants/                         # Hằng số hệ thống
    ├── routes.ts                      # Đặt tên route tập trung (`ROUTES.APP.REVIEW`, ...)
    ├── query-keys.ts                  # Query Keys Factory cho TanStack Query
    ├── design-tokens.ts               # Color codes, break points
    └── srs-config.ts                  # FSRS default parameters & thresholds
```

---

## 3. Quy Chuẩn Layout & Phân Vùng Giao Diện (Layout Architecture)

### 3.1 Cấu Trúc Layout
1. **Root Layout (`app/layout.tsx`)**:
   - Chỉ đảm nhiệm: nạp font chữ (`Sora`, `Be Vietnam Pro`, `JetBrains Mono`), thẻ meta SEO cơ bản, và bọc `AppProviders`.
   - Không chứa giao diện nghiệp vụ cụ thể.

2. **Providers Wrapper (`components/providers/app-providers.tsx`)**:
   - Khởi tạo `QueryClientProvider` (TanStack Query).
   - Khởi tạo Toast notification container.
   - Luôn đánh dấu `'use client'`.

3. **Main Layout (`app/(main)/layout.tsx`)**:
   - Layout dạng Dashboard/App Shell gồm 3 khu vực cố định:
     - `AppSidebar`: Sidebar điều hướng bên trái (ẩn trên màn hình mobile).
     - `AppHeader`: Thanh tiêu đề, thông tin user, streak badge, profile dropdown.
     - `MobileBottomNav`: Thanh điều hướng chân trang chỉ hiện trên thiết bị di động (`md:hidden`).
     - `<main>` container: Bọc nội dung trang với padding chuẩn và responsive maxWidth.

4. **Auth Layout (`app/(auth)/layout.tsx`)**:
   - Giao diện căn giữa tối giản, không có sidebar, tập trung vào form đăng nhập/đăng ký.

5. **Admin Layout (`app/(admin)/layout.tsx`)**:
   - Chứa `AdminSidebar` riêng biệt với các mục quản trị hệ thống, kèm kiểm tra quyền (`role === 'admin'`).

### 3.2 Quy Tắc Phân Chia Server Component (RSC) và Client Component
- **Mặc định toàn bộ page và layout là Server Component** để tối ưu SSR và SEO.
- **Chỉ dùng `'use client'`** khi component có:
  - Sử dụng hooks của React (`useState`, `useEffect`, `useCallback`, `useRef`).
  - Sử dụng Custom Hooks, TanStack Query hooks (`useQuery`, `useMutation`).
  - Bắt sự kiện người dùng (`onClick`, `onChange`, `onSubmit`).
  - Dùng Web APIs (`speechSynthesis`, `localStorage`, `window`).
- **Quy tắc lá cây (Leaf Nodes)**: Đẩy `'use client'` xuống component nhỏ nhất có thể, không đánh dấu `'use client'` ở cả trang lớn nếu chỉ có 1 nút bấm cần tương tác.

---

## 4. Quy Chuẩn Tách Logic Thành Hook Nhỏ (Custom Hooks Guidelines)

### 4.1 Quy Tắc Thiết Kế Hook
1. **Một Hook — Một Trách Nhiệm (Single Responsibility)**:
   - Không gộp chung logic lấy dữ liệu (fetching), logic form và logic audio vào cùng một hook khổng lồ.
   - Tách thành các hook chuyên biệt: `useCardsQuery`, `useCardForm`, `useTextToSpeech`.
2. **Quy Ước Đặt Tên**:
   - Luôn bắt đầu bằng tiền tố `use`.
   - Theo định dạng: `use[Feature][Action/Role]`.
   - Ví dụ: `useReviewSession`, `useCreateCardMutation`, `useAiWordAnalyzer`.
3. **Giá Trị Trả Về (Return Values)**:
   - Ưu tiên trả về **Object** thay vì Array (Tuple) để dễ mở rộng và destructuring rõ nghĩa:
     ```typescript
     // ✅ CHUẨN
     export const useReviewSession = () => {
       return { currentCard, isSubmitting, handleRate, progress };
     };
     ```

### 4.2 Phân Loại Hook Bắt Buộc
- **Query Hooks (`hooks/features/[feature]/use-[feature]-query.ts`)**:
  - Chuyên wrap `useQuery` của TanStack Query kết hợp với hàm gọi từ `services/`.
  - Tự động bắt lỗi và chuẩn hóa data.
- **Mutation Hooks (`hooks/features/[feature]/use-[feature]-mutation.ts`)**:
  - Chuyên wrap `useMutation`.
  - Đảm nhiệm: gọi API mutation, invalidate cache (`queryClient.invalidateQueries`), hiển thị toast thông báo thành công/thất bại.
- **Form Hooks (`hooks/features/[feature]/use-[feature]-form.ts`)**:
  - Tách toàn bộ setup của `useForm` (React Hook Form) + `zodResolver(schema)` ra khỏi UI component.
  - Cung cấp: `register`, `handleSubmit`, `errors`, `onSubmitHandler`, `isDirty`, `reset`.
- **UI / Feature Hooks (`hooks/features/[feature]/use-[feature]-session.ts`)**:
  - Điều khiển luồng trạng thái phức tạp (ví dụ: chuyển card tiếp theo trong phiên học, đếm ngược thời gian).

---

## 5. Quy Chuẩn Hàm Dùng Chung & Chống Trùng Lặp (DRY Utility Functions)

### 5.1 Nguyên Tắc Vàng Chống Duplicate Code
- **Cấm tuyệt đối** viết cùng một logic định dạng (format), tính toán hoặc xử lý chuỗi ở nhiều nơi.
- Nếu bạn chuẩn bị viết một hàm xử lý chuỗi, thời gian, số hay kiểm tra logic: **Hãy kiểm tra xem hàm đó đã tồn tại trong `utils/` chưa**. Nếu chưa có, viết vào `utils/` rồi mới import vào dùng.

### 5.2 Phân Vùng Utilities Bắt Buộc Trong `utils/`

| File | Nhiệm vụ | Thư viện liên quan |
|---|---|---|
| `utils/datetime.ts` | Format ngày giờ, kiểm tra trong/ngoài khung giờ vàng, chuyển đổi timezone | `date-fns`, `date-fns-tz` |
| `utils/formatters.ts` | Viết hoa chữ đầu, format XP điểm số, rút gọn văn bản (truncate), format IPA | Thuần TypeScript |
| `utils/error.ts` | Bóc tách mã lỗi & message thân thiện từ Axios error hoặc Supabase error | `axios` |
| `utils/storage.ts` | Wrapper an toàn cho LocalStorage / SessionStorage (có try-catch, SSR check) | Thuần TypeScript |
| `lib/utils.ts` | Hàm gộp classname `cn(...)` | `clsx`, `tailwind-merge` |

### 5.3 Tiêu Chuẩn Viết Hàm Trong `utils/`
- **Pure Functions**: Hàm trong `utils/` phải là hàm thuần túy (cùng input luôn ra cùng output), không gây side-effect, không đọc/ghi biến toàn cục.
- **Explicit Types**: Khai báo rõ ràng kiểu dữ liệu của params và return type.

---

## 6. Quy Chuẩn Sử Dụng Tech Stack & Tính Đồng Bộ Hệ Thống

### 6.1 Axios & Service Layer (Gọi API)
Toàn bộ HTTP request gọi tới backend / Edge Functions / API routes **phải đi qua Axios Instance tập trung**, không dùng `fetch` tùy tiện hay gọi `axios` trực tiếp trong component.

1. **Khởi tạo Singleton Instance (`lib/axios.ts`)**:
   ```typescript
   // lib/axios.ts
   import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
   import { createClient } from '@/lib/supabase/client';

   export const apiClient: AxiosInstance = axios.create({
     baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
     timeout: 15000,
     headers: {
       'Content-Type': 'application/json',
     },
   });

   // Request Interceptor: Tự động đính kèm Access Token từ Supabase Auth
   apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
     if (typeof window !== 'undefined') {
       const supabase = createClient();
       const { data } = await supabase.auth.getSession();
       const token = data.session?.access_token;
       if (token) {
         config.headers.set('Authorization', `Bearer ${token}`);
       }
     }
     return config;
   });

   // Response Interceptor: Chuẩn hóa dữ liệu trả về & xử lý lỗi tập trung
   apiClient.interceptors.response.use(
     (response) => response.data,
     (error) => {
       // Bóc tách message lỗi đồng bộ
       const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra!';
       return Promise.reject(new Error(message));
     }
   );
   ```

2. **Cấu Trúc File Service (`services/[feature].service.ts`)**:
   - Mỗi domain có 1 service riêng (ví dụ `cards.service.ts`, `ai.service.ts`).
   - Các hàm service chỉ làm nhiệm vụ giao tiếp dữ liệu và trả về kiểu dữ liệu chính xác:
   ```typescript
   // services/cards.service.ts
   import { apiClient } from '@/lib/axios';
   import type { Card, CreateCardDto } from '@/types/card.types';

   export const cardsService = {
     getDueCards: (): Promise<Card[]> => {
       return apiClient.get('/review/due');
     },
     createCard: (payload: CreateCardDto): Promise<Card> => {
       return apiClient.post('/cards', payload);
     },
   };
   ```

### 6.2 TanStack Query (React Query)
1. **Query Keys Factory (`constants/query-keys.ts`)**:
   - Tuyệt đối không hardcode string key (ví dụ `['cards']`, `['due']`) rải rác trong code.
   - Tập trung định nghĩa tại một nơi duy nhất:
   ```typescript
   // constants/query-keys.ts
   export const QUERY_KEYS = {
     cards: {
       all: ['cards'] as const,
       lists: () => [...QUERY_KEYS.cards.all, 'list'] as const,
       due: () => [...QUERY_KEYS.cards.all, 'due'] as const,
       detail: (id: string) => [...QUERY_KEYS.cards.all, 'detail', id] as const,
     },
     review: {
       stats: ['review', 'stats'] as const,
       history: (range: string) => ['review', 'history', range] as const,
     },
   } as const;
   ```

2. **Cấu Hình Mặc Định (`lib/query-client.ts`)**:
   - `staleTime: 1000 * 60 * 5` (5 phút cho dữ liệu ít thay đổi).
   - `refetchOnWindowFocus: false` để tránh gọi API liên tục khi user chuyển tab.

### 6.3 Supabase SSR Architecture
Tuân thủ nghiêm ngặt mô hình SSR của `@supabase/ssr`:
- **Trong Client Component**: Import `createClient` từ `@/lib/supabase/client`.
- **Trong Server Component / Server Action / Route Handler**: Import `createClient` từ `@/lib/supabase/server`.
- **Trong Middleware**: Sử dụng `@/lib/supabase/middleware` để làm mới session cookie.

### 6.4 Zustand (Client UI State)
- Chỉ dùng cho dữ liệu giao diện tạm thời:
  - Ẩn/hiện Sidebar, Filter đang chọn trên UI, Trạng thái popup modal.
  - Vị trí thẻ đang lật dở trong phiên review hiện tại.
- Tạo store tách biệt theo từng cụm chức năng (`useUIStore`, `useReviewStore`).
- Luôn sử dụng Selector khi lấy dữ liệu trong component để hạn chế re-render:
  ```typescript
  // ✅ CHUẨN
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  // ❌ KHÔNG LÀM (gây re-render thừa khi bất kỳ state nào trong store đổi)
  const { isSidebarOpen } = useUIStore();
  ```

### 6.5 React Hook Form + Zod (Quản Lý Form)
- Mọi Form đều phải có Schema xác thực viết bằng **Zod** đặt trong `types/` hoặc `lib/validations/`.
- Sử dụng `@hookform/resolvers/zod`.
- Tách `useForm` vào custom hook khi form có hơn 3 trường dữ liệu hoặc có logic phụ trợ (tính toán, phụ thuộc chéo).

### 6.6 Design System & Tailwind CSS (Dark Focus Theme)
- Màu sắc phải sử dụng chính xác các token được định nghĩa:
  - Nền chính: `bg-base` (`#0B0F17`)
  - Nền khối card/panel: `bg-surface` (`#131A26`), hover: `bg-surface-hover` (`#1B2333`)
  - Viền: `border-border` (`#232B3A`)
  - Chữ: `text-text-primary` (`#E7EAF0`), phụ: `text-text-secondary` (`#8B94A7`)
  - Accent chính: `brand` (`#6366F1`), hover: `brand-hover` (`#818CF8`)
  - Trạng thái: `success` (`#10B981`), `warning` (`#F59E0B`), `danger` (`#F43F5E`), `info` (`#38BDF8`)
- Bo góc: `rounded-2xl` cho card, `rounded-xl` cho input/button.
- Kết hợp class động bằng hàm `cn(...)` từ `@/lib/utils`.

### 6.7 Spaced Repetition (ts-fsrs) & Timezone (date-fns-tz)
- Khởi tạo thuật toán FSRS tập trung tại `lib/fsrs.ts`.
- Mọi xử lý tính toán ngày kế tiếp, "Giờ vàng" (Golden Hours) phải đi qua `utils/datetime.ts`, luôn đính kèm timezone người dùng (`user.timezone || 'Asia/Ho_Chi_Minh'`).

---

## 7. Quy Ước Đặt Tên & Coding Conventions

| Loại đối tượng | Quy ước đặt tên | Ví dụ |
|---|---|---|
| **Thư mục & File thường** | `kebab-case` | `cards.service.ts`, `use-review-session.ts`, `empty-state.tsx` |
| **Component React** | `PascalCase` | `Flashcard`, `AppHeader`, `CardFormManual` |
| **Custom Hook** | `camelCase` (bắt đầu bằng `use`) | `useCardsQuery`, `useTextToSpeech`, `useCardMutation` |
| **Hàm Helper / Service** | `camelCase` | `formatDate`, `calculateNextReview`, `getDueCards` |
| **TypeScript Interface / Type** | `PascalCase` | `Card`, `ReviewSession`, `ApiResponse<T>` |
| **Hằng số (Constants)** | `UPPER_SNAKE_CASE` hoặc `camelCase` object | `DEFAULT_TIMEZONE`, `QUERY_KEYS`, `ROUTES` |
| **Zod Schema** | `camelCase` kết thúc bằng `Schema` | `createCardSchema`, `loginSchema` |

---

## 8. Clean Code Checklist (Kiểm Tra Trước Khi Hoàn Thành Task)

Trước khi commit code hoặc kết thúc một công việc, Agent/Developer phải tự kiểm tra các tiêu chí sau:

- [ ] **Không có code duplicated**: Logic dùng chung đã được chuyển vào `utils/` hoặc `services/`.
- [ ] **Component gọn gàng**: Không chứa logic gọi API hay tính toán phức tạp trực tiếp bên trong JSX; đã tách ra Custom Hook.
- [ ] **API đồng bộ**: Gọi API thông qua `apiClient` (`services/`), không gọi axios tùy tiện trong component.
- [ ] **Data Fetching chuẩn**: Dùng TanStack Query kết hợp `QUERY_KEYS` tập trung, có cấu hình invalidate rõ ràng khi mutate.
- [ ] **Type Safety đầy đủ**: Không còn kiểu `any`, các response và props đều có type/interface tường minh.
- [ ] **UI nhất quán**: Màu sắc dùng đúng token Design System "Deep Focus", bo góc và font chữ tuân thủ thiết kế.
- [ ] **Layout phân định đúng**: Server Component cho nội dung tĩnh/fetch ban đầu, `'use client'` chỉ đặt ở lá cây tương tác.

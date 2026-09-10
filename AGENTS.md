<!-- BEGIN:nextjs-agent-rules -->
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
│   ├── (auth)/                        # Route group: Xác thực (Đăng nhập duy nhất bằng Google OAuth)
│   │   ├── layout.tsx
│   │   └── login/page.tsx             # Màn hình đăng nhập Google
│   ├── auth/
│   │   └── callback/route.ts          # Route Handler xử lý OAuth PKCE callback (exchangeCodeForSession)
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

### 3.3 Quy Tắc Bắt Buộc Đăng Nhập (Strict Authentication Gate)
- **Bảo vệ 100% ứng dụng**: Toàn bộ các trang (kể cả trang chủ `/`, `/review`, `/add`, `/settings`, v.v.) đều nằm sau cánh cổng xác thực.
- **Middleware Interceptor**:
  - Người dùng **chưa đăng nhập** truy cập bất kỳ trang nào (ngoại trừ `/login`, `/auth/callback`, và tài nguyên tĩnh) sẽ bị Middleware chặn ngay lập tức và chuyển hướng sang `/login?redirect=<current_path>`.
  - Người dùng **đã đăng nhập** nếu truy cập lại vào `/login` sẽ được tự động chuyển hướng về trang chủ `/`.
- **Public Routes duy nhất**:
  - `/login`: Trang đăng nhập Google duy nhất.
  - `/auth/callback`: Route Handler xử lý xác thực OAuth.
  - Static files: `favicon.ico`, `_next/*`, `public/*`.

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
| `utils/lemmatizer.ts` | Tách từ nguyên, phân tích hình thái học hậu tố thì/số nhiều & từ điển bất quy tắc hai chiều | Thuần TypeScript |
| `utils/text-similarity.ts` | Tính toán độ tương đồng chuỗi và biến thể ngữ pháp (Levenshtein + Dice + Inflections) | Thuần TypeScript |
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
  - Viền: `border-border` (`#202736`)
  - Chữ: `text-text-primary` (`#EEF2F6`), phụ: `text-text-secondary` (`#94A3B8`)
  - Accent chính: `brand` (`#EA580C` - Warm Sunset Orange), hover: `brand-hover` (`#C2410C`)
  - Trạng thái: `success` (`#10B981`), `warning` (`#F59E0B`), `danger` (`#EF4444`), `info` (`#0284C7`)
- Bo góc: `rounded-2xl` cho card, `rounded-xl` cho input/button.
- Triệt tiêu outline viền trắng mặc định: Toàn bộ thẻ tương tác (button, link, input) đã được cấu hình loại bỏ viền outline/focus trắng mặc định của trình duyệt tại `globals.css`. Khi cần focus state, chỉ dùng `focus:border-brand` hoặc `focus:ring-brand`.
- Kết hợp class động bằng hàm `cn(...)` từ `@/lib/utils`.

### 6.7 Spaced Repetition (ts-fsrs) & Timezone (date-fns-tz)
- Khởi tạo thuật toán FSRS tập trung tại `lib/fsrs.ts`.
- Mọi xử lý tính toán ngày kế tiếp, "Giờ vàng" (Golden Hours) phải đi qua `utils/datetime.ts`, luôn đính kèm timezone người dùng (`user.timezone || 'Asia/Ho_Chi_Minh'`).

### 6.8 Animation & Micro-interactions (Motion / React)
- **Thư viện chuẩn**: Sử dụng package `motion` (Framer Motion).
- **Import convention**: Bắt buộc import từ `"motion/react"`:
  ```typescript
  import { motion, AnimatePresence } from 'motion/react';
  ```
- **Client Component Requirement**: Bất kỳ component nào sử dụng `motion` đều phải có `'use client';` ở đầu file.
- **Tập trung tokens chuyển động (Motion Variants)**: Đặt tại `constants/animations.ts` để đảm bảo tính nhất quán (consistent physics & timing).
- **Quy tắc hiệu năng (Performance Rules)**:
  - Chỉ animate các thuộc tính GPU-accelerated: `transform` (`x`, `y`, `scale`, `rotate`, `rotateY`) và `opacity`.
  - Không animate trực tiếp `width`, `height`, `margin`, `top`, `left` (trừ khi dùng `layoutId` hoặc `layout`).
  - Ưu tiên spring animations tự nhiên: `{ type: 'spring', stiffness: 350, damping: 25 }`.
- **Ứng dụng toàn diện trong dự án**:
  - Chuyển tab / Modal / Thông báo: Sử dụng `<AnimatePresence mode="wait">`.
  - Danh sách từ vựng & Dashboard stat cards: Sử dụng Stagger container (`staggerChildren: 0.05`).
  - Nút bấm tương tác: Micro-interactions nhẹ nhàng (`whileTap={{ scale: 0.98 }}`).
  - Flashcard: 3D Flip mượt mà với spring physics (`rotateY: isFlipped ? 180 : 0`).

### 6.9 Skeleton Loading Standard (Chuẩn Hóa Mọi Trạng Thái Loading)
- **Quy tắc bắt buộc**: MỌI trang, màn hình hoặc danh sách khi đang nạp dữ liệu (data fetching / page loading) PHẢI sử dụng **Skeleton Loading**, tuyệt đối không để màn hình trắng hay dùng spinner đơn lẻ giữa trang lớn (chỉ dùng spinner siêu nhỏ trong nút khi submitting action).
- **Mục đích**:
  - Mô phỏng chính xác khung wireframe bố cục thực tế (Header, Stat Cards, Chart, Table list, Flashcard).
  - Triệt tiêu hiện tượng giật cục Layout Shift (Cumulative Layout Shift - CLS), giúp thị giác người dùng thích ứng mượt mà và tạo cảm giác tải tức thì.
- **Component chuẩn**:
  - Sử dụng [`components/ui/skeleton.tsx`](file:///d:/my_project/vocab-app-plus/components/ui/skeleton.tsx) với `animate-pulse` và màu nền `bg-surface-hover/60`.
- **Triển khai Next.js Streaming**:
  - Mỗi phân hệ route chính phải có file `loading.tsx` (như `app/(main)/loading.tsx`, `app/(main)/review/loading.tsx`) chứa layout Skeleton tương ứng.

### 6.10 Tiêu Chuẩn Dữ Liệu Từ Vựng Song Ngữ (Bilingual English-First Standard)
- **Cấu trúc lưu trữ song ngữ bắt buộc**:
  - `definition_en`: Định nghĩa tiếng Anh chuẩn xác, ngắn gọn, súc tích (English definition).
  - `definition`: Định nghĩa tiếng Việt rõ ràng, tự nhiên (Vietnamese definition).
  - `example_sentence`: Câu ví dụ tiếng Anh thực tế trong văn cảnh (English contextual sentence).
  - `example_translation`: Bản dịch tiếng Việt chính xác và tự nhiên của câu ví dụ (Vietnamese translation).
- **Quy tắc hiển thị UI (English-First)**:
  - Ưu tiên hiển thị định nghĩa tiếng Anh (`definition_en`) nổi bật nhất (phông chữ to, màu sáng `text-white` hoặc `text-text-primary`) để người học tư duy trực tiếp bằng tiếng Anh.
  - Định nghĩa tiếng Việt (`definition`) hiển thị tinh tế ở dòng phụ bên dưới để đối chiếu và hiểu sâu ngữ nghĩa.
  - Luôn đảm bảo tương thích ngược: các thẻ cũ nếu chưa có `definition_en` vẫn hiển thị `definition` tiếng Việt trọn vẹn, không bị trống hay vỡ layout.
- **Ví dụ thực tế kèm bản dịch ngữ cảnh**:
  - Câu ví dụ tiếng Anh (`example_sentence`) đi kèm nút audio phát âm.
  - Dưới câu ví dụ tiếng Anh hiển thị bản dịch tiếng Việt (`example_translation`) với sắc thái màu phụ (`text-slate-400` / `text-text-secondary`).

### 6.11 Quy Chuẩn Tắt Kiểm Tra Chính Tả (Disable Spellcheck & Autocorrect)
- **Quy tắc bắt buộc 100%**: Mọi thẻ `<input>`, `<textarea>`, các component form và editable elements trong toàn bộ ứng dụng **PHẢI tắt kiểm tra chính tả và tự động sửa** (`spellCheck={false}`, `autoCorrect="off"`, `autoCapitalize="off"`). Điều này ngăn chặn triệt để các đường gạch chân đỏ (red squiggly lines) gây rối mắt khi người dùng nhập tiếng Anh hoặc tiếng Việt.
- **Triển khai ở component dùng chung**:
  - `components/ui/input.tsx` và `components/ui/textarea.tsx` đã được cấu hình mặc định `spellCheck={false}`, `autoCorrect="off"`, `autoCapitalize="off"`.
  - Toàn bộ các component mới PHẢI sử dụng `Input` / `Textarea` từ `@/components/ui/` hoặc đảm bảo gắn đầy đủ các thuộc tính trên nếu dùng thẻ HTML gốc.
  - Thẻ `<body>` tại `app/layout.tsx` đã được gắn `spellCheck={false}` để ngăn chặn spellcheck kế thừa trên toàn bộ cây DOM.

### 6.12 Quy Chuẩn Hình Thái Học & Xử Lý Từ Gốc (Morphological Lemmatization Pattern)
- **Quy tắc AI Lemmatization**: Khi AI phân tích bất kỳ từ vựng nào có dạng chia thì (V-ed, V-ing, V-s/es) hoặc số nhiều (plurals), AI **bắt buộc phải chuẩn hóa đưa về từ gốc từ điển (Base form / Lemma)** (ví dụ: `goes` ➔ `go`, `bought` ➔ `buy`, `studies` ➔ `study`).
- **Quyền quyết định người dùng (Revert Control)**: Giao diện form (`CardFormAiPreview`, `WordQuickPopover`) **bắt buộc** cung cấp nút bấm chuyển đổi nhanh `[↺ Giữ nguyên "goes"]` / `[↺ Dùng từ gốc "go"]` để người dùng chủ động lựa chọn.
- **Tra cứu ngữ cảnh tức thời ($O(1)$) trong Trình đọc (`InteractiveReader`)**:
  - Nghiêm cấm gọi API tra từ nguyên rải rác. Bắt buộc sử dụng helper `getBaseWordCandidates` từ `utils/lemmatizer.ts` kết hợp mảng `word_family` của thẻ để lập chỉ mục trong bộ nhớ (`knownWordsMap`).
  - Đảm bảo token hiển thị trong bài đọc dù là dạng chia thì (`bought`) vẫn được highlight màu xanh lá (`text-emerald-300`) và khi click mở popover sẽ tự động liên kết tới thẻ gốc (`buy`), ngăn ngừa gọi AI trùng lặp.

### 6.13 Quy Chuẩn Ngăn Ngừa Trùng Lặp Từ Vựng (Duplicate Prevention Pattern)
- **Kiểm tra trùng lặp mọi luồng thêm từ (Global Duplicate Gate)**: Toàn bộ các thao tác thêm từ mới (Thêm thủ công, Phân tích AI, Lưu nhanh từ popover bài đọc) **bắt buộc** phải đi qua lớp kiểm tra trùng lặp qua custom hook `useWordDuplicateCheck`.
- **Thuật toán so sánh đa tầng (`utils/text-similarity.ts`)**: Kết hợp linh hoạt giữa kiểm tra biến thể ngữ pháp cơ bản (`checkInflectionMatch`), khoảng cách Levenshtein (`levenshteinDistance`) và hệ số Sørensen–Dice (`diceCoefficient`) có hỗ trợ cả cụm từ (Phrasal Verbs).
- **Ngưỡng tương đồng linh hoạt**: Ngưỡng mặc định là **80%** (có thể được tùy chỉnh động bởi Admin qua bảng `system_settings` tại `/admin/settings`).
- **Smart Fork Resolution**: Khi người dùng clone bộ sưu tập cộng đồng (`/collections`), hệ thống tự động chạy phân tích đối chiếu trước (`analyzeFork`). Nếu có từ trùng lặp, bắt buộc hiển thị `DuplicateResolutionModal` để người dùng chủ động chọn giữ lại từ mới, lấy từ trùng hay thêm toàn bộ.

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
- [ ] **Tắt Spellcheck**: Toàn bộ `input`, `textarea` và form fields đều có `spellCheck={false}`, `autoCorrect="off"`, `autoCapitalize="off"`.
- [ ] **UI nhất quán**: Màu sắc dùng đúng token Design System "Deep Focus", bo góc và font chữ tuân thủ thiết kế.
- [ ] **Layout phân định đúng**: Server Component cho nội dung tĩnh/fetch ban đầu, `'use client'` chỉ đặt ở lá cây tương tác.


<!-- END:nextjs-agent-rules -->

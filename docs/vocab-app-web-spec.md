# 📘 Đặc Tả Sản Phẩm — Vocab App (Phiên bản Web)

> Stack: **Next.js** (App Router) + **Supabase** (Postgres, Auth, Edge Functions, Storage) + **Tailwind CSS** + **Motion (Framer Motion)** + **Zustand** + **TanStack Query** + **React Hook Form** + **Zod** — Deploy trên **Vercel**
> Ngôn ngữ học: **Tiếng Anh** | Giao diện: **Tiếng Việt**
> Mục tiêu: Sản phẩm học từ vựng khoa học, thẩm mỹ cao, tính năng cộng đồng mạnh mẽ, ưu tiên tối đa chi phí **$0**

---

## 1. Tổng quan

Ứng dụng học từ vựng tiếng Anh hiện đại kết hợp phương pháp **Lặp lại ngắt quãng (Spaced Repetition)** thông qua thuật toán **FSRS** và các nguyên lý khoa học nhận thức (Cognitive Science):
1. **Chuẩn hóa cấp độ quốc tế**: Phân loại và quản lý từ vựng theo khung tham chiếu châu Âu **CEFR (A1, A2, B1, B2, C1, C2)**.
2. **Mô hình tổ chức & chia sẻ lai (Hybrid: Tags + Collections)**:
   - **Tags (Cá nhân & Linh hoạt)**: Gắn nhãn tự do cho từng thẻ (`#ielts`, `#technology`, `#daily`), hỗ trợ tạo **Custom Study Session** ôn tập chuyên sâu theo chủ đề/tag bất kỳ.
   - **Collections / Study Sets (Bộ từ vựng đóng gói / Playlists chia sẻ cộng đồng)**: Đóng gói các bộ từ có chủ đề (IELTS 7.5, 3000 từ Oxford, IT Vocab...) với đầy đủ metadata (Title, Description, Cover). Người dùng khác có thể xem trước và **1-Click Clone/Fork** vào kho từ cá nhân để bắt đầu học với FSRS.
3. **Đọc hiểu & Trích xuất từ vựng ngữ cảnh (Smart Contextual Reader)**: Đọc văn bản tiếng Anh, bôi đen từ vựng để tra nghĩa tức thì và lưu thẻ kèm chính xác câu ngữ cảnh thật (`example_sentence`).
4. **Chế độ ôn tập Active Recall đa dạng**:
   - **Flashcard 3D FSRS**: Lật thẻ trực quan với 4 mức đánh giá (Again, Hard, Good, Easy) cùng phím tắt tiện lợi.
   - **Cloze Deletion (Điền khuyết ngữ cảnh)**: Ẩn từ mục tiêu trong câu ví dụ dạng `[_____]` để rèn luyện khả năng nhớ chủ động trong câu.
5. **Hỗ trợ AI học sâu**: AI Word Analyzer tự động phân tích cấp độ CEFR, tầng nghĩa, collocations; AI sinh mnemonic, hình ảnh liên tưởng (Dual-Coding), chấm câu viết ngữ pháp.
6. **Nhắc nhở & báo cáo qua Telegram**: Theo "giờ vàng" cá nhân hóa dựa trên hiệu suất học thực tế qua `pg_cron`.
7. **Kho từ vựng & Quản lý từ vựng tập trung (`/vocab`)**: Trang quản trị toàn bộ vốn từ vựng cá nhân, tích hợp tìm kiếm tức thời, lọc đa chiều (CEFR, Tags, Trạng thái FSRS, Loại từ), sắp xếp linh hoạt, xem chi tiết thẻ, chỉnh sửa, xóa và thao tác hàng loạt.
8. **Trang Admin quản trị toàn diện**: Giám sát hệ thống và cấu hình AI provider động (Groq, Gemini, OpenAI...).

---

## 2. Design System — "Deep Focus (Dark)"

Mục tiêu: Giao diện tối sang trọng, chuyên nghiệp, điểm nhấn sinh động, không xám xịt nhàm chán.

### 2.1 Bảng màu (Color Tokens)

| Token | Hex | Vai trò |
|---|---|---|
| `--bg-base` | `#0B0F17` | Nền chính (gần đen, ánh navy) |
| `--bg-surface` | `#131A26` | Nền card/panel |
| `--bg-surface-hover` | `#1B2333` | Hover state |
| `--border` | `#232B3A` | Viền, divider |
| `--text-primary` | `#E7EAF0` | Chữ chính |
| `--text-secondary` | `#8B94A7` | Chữ phụ |
| `--brand-primary` | `#F97316` (Electric Orange) | Accent chính: nút, link, highlight |
| `--brand-primary-hover` | `#EA580C` | Hover của primary |
| `--success` | `#10B981` (Emerald) | Trả lời đúng, từ đã thành thạo |
| `--warning` | `#F59E0B` (Amber) | Từ khó / leech / sắp quên |
| `--danger` | `#EF4444` (Rose/Red) | Trả lời sai, cảnh báo |
| `--info` | `#0284C7` (Sky/Blue) | Thông báo, tip |

**Màu sắc phân biệt Huy hiệu Cấp độ CEFR**:
- `A1 - A2` (Sơ cấp): Xanh ngọc / Emerald (`#10B981`)
- `B1 - B2` (Trung cấp): Xanh dương / Sky Blue (`#0284C7`)
- `C1 - C2` (Cao cấp): Tím thẫm / Purple (`#8B5CF6`)

Gradient điểm nhấn:
`linear-gradient(135deg, #F97316 0%, #FB923C 100%)`

### 2.2 Typography

- **Heading/Display**: `Sora` (Google Fonts, free) — font hiện đại, geometric
- **Body/UI**: `Be Vietnam Pro` (Google Fonts, free, hỗ trợ dấu tiếng Việt đầy đủ)
- **Monospace** (phiên âm IPA, phím tắt): `JetBrains Mono`

### 2.3 Nguyên tắc UI/UX

- Bo góc: `rounded-2xl` (16px) cho card, `rounded-xl` (12px) cho input/button.
- Glow mềm mại thay vì shadow đen: `box-shadow: 0 0 24px -8px rgba(249,115,22,0.35)`.
- **Tuyệt đối loại bỏ outline màu trắng** khi click/focus/active trên mọi button, select, sidebar menu, input; thay thế bằng highlight viền màu thương hiệu hoặc glow nhẹ.
- **Skeleton Loading chuẩn mực**: Toàn bộ các trang khi tải dữ liệu đều sử dụng Skeleton Loading (`<Skeleton />`) khớp layout thực tế, loại bỏ việc dùng spinner đơn độc gây giật layout.
- Micro-animation mượt mà khi lật card 3D và khi đánh giá đáp án.

---

## 3. Kiến trúc hệ thống

### 3.1 Tech Stack chi tiết

| Layer | Công nghệ | Vai trò |
|---|---|---|
| Framework | **Next.js** (App Router) | Framework chính, SSR/RSC, deploy trên Vercel |
| Backend / DB | **Supabase** (Postgres, Auth, Storage, Edge Functions) | Backend as a Service, có RLS bảo mật theo user |
| Styling | **Tailwind CSS** | Utility-first CSS theo đúng design tokens |
| UI Components | **shadcn/ui** | Component dựng sẵn trên Radix (Select, Dialog, Form, Tabs...) |
| State toàn cục (client) | **Zustand** | Quản lý UI state nhẹ: custom study session, filters, modal |
| Data fetching & cache | **TanStack Query** | Fetch/cache/đồng bộ dữ liệu server: cards, collections, stats |
| Form & Validation | **React Hook Form** + **Zod** | Quản lý form và validate schema an toàn runtime |
| Supabase client | `@supabase/supabase-js` + `@supabase/ssr` | Kết nối Supabase, xử lý session/cookie App Router |
| Icon | `lucide-react` | Bộ icon chính |
| FSRS engine | `ts-fsrs` | Thư viện thuật toán Spaced Repetition FSRS |
| Date/Time & Timezone | `date-fns` + `date-fns-tz` | Xử lý múi giờ cho tính năng "giờ vàng" |

### 3.2 Sơ đồ luồng dữ liệu

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App                          │
│  (Dashboard, Review 3D, Smart Reader, Collections, UI)  │
└───────────────┬─────────────────────────┬───────────────┘
                │                         │
       REST / TanStack Query              │ Supabase Client / SSR
                │                         │
                ▼                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Supabase Platform                     │
│  ┌──────────────────┐  ┌─────────────┐  ┌────────────┐  │
│  │ Postgres + RLS   │  │ Auth (OAuth)│  │ Storage    │  │
│  └────────┬─────────┘  └─────────────┘  └────────────┘  │
│           │                                             │
│       pg_cron (30 phút/lần)                             │
│           │                                             │
│           ▼                                             │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Edge Functions: send-reminders, weekly-report     │  │
│  └────────┬──────────────────────────────────────────┘  │
└───────────┼─────────────────────────────────────────────┘
            │                                 │
            ▼                                 ▼
┌───────────────────────┐         ┌───────────────────────┐
│   Telegram Bot API    │         │  AI Providers (Groq/  │
│ (Nhắc nhở, báo cáo)   │         │  Gemini/OpenAI...)    │
└───────────────────────┘         └───────────────────────┘
```

---

## 4. Database Schema (Postgres)

```sql
-- Người dùng (mở rộng từ auth.users của Supabase)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  role text default 'user' check (role in ('user','admin')),
  timezone text default 'Asia/Ho_Chi_Minh',
  telegram_chat_id bigint unique,
  golden_hours jsonb default '["07:00-08:00","12:00-13:00","21:00-22:00"]',
  xp integer default 0,
  created_at timestamptz default now()
);

-- Thẻ từ vựng (chứa đầy đủ CEFR Level, Tags, Mnemonic)
create table public.cards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  word text not null,
  ipa text,
  definition text not null,
  example_sentence text,
  source_type text check (source_type in ('manual','imported','ai_generated','admin_curated')),
  card_type text default 'word' check (card_type in ('word','phrasal_verb','idiom')),
  part_of_speech text check (part_of_speech in ('noun','verb','adjective','adverb','preposition','conjunction','pronoun','interjection')),
  cefr_level text check (cefr_level in ('A1','A2','B1','B2','C1','C2')), -- Cấp độ chuẩn CEFR
  tags text[] default '{}', -- Mảng tags cá nhân: ['#ielts', '#marketing', '#reading']
  sense_number int default 1,
  audio_url text,
  image_url text,
  mnemonic text,
  created_at timestamptz default now()
);

-- Bộ sưu tập / Bộ từ vựng đóng gói (Collections / Playlists để chia sẻ cộng đồng)
create table public.collections (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  cover_image text,
  category text check (category in ('ielts','toeic','toefl','daily_communication','business','academic','travel','slang_idioms','other')),
  is_public boolean default false, -- true: hiển thị trên Thư viện cộng đồng
  tags text[] default '{}',
  fork_count int default 0, -- Số lượt người dùng khác clone bộ này
  likes_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Bảng liên kết thẻ vào Collection (quan hệ nhiều - nhiều)
create table public.collection_cards (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid references public.collections(id) on delete cascade,
  card_id uuid references public.cards(id) on delete cascade,
  display_order int default 0,
  added_at timestamptz default now(),
  unique(collection_id, card_id)
);

-- Bộ sưu tập người dùng đã lưu/bookmark (User Saved Collections)
create table public.user_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  collection_id uuid references public.collections(id) on delete cascade,
  is_pinned boolean default false,
  saved_at timestamptz default now(),
  unique(user_id, collection_id)
);

-- Collocation gắn với 1 card
create table public.collocations (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references public.cards(id) on delete cascade,
  phrase text not null,
  example_sentence text
);

-- Word family: các dạng biến thể của cùng 1 từ gốc
create table public.word_families (
  id uuid primary key default gen_random_uuid(),
  root_card_id uuid references public.cards(id) on delete cascade,
  form_word text not null,
  part_of_speech text check (part_of_speech in ('noun','verb','adjective','adverb'))
);

-- Cặp từ dễ nhầm phát âm (minimal pairs)
create table public.minimal_pairs (
  id uuid primary key default gen_random_uuid(),
  word_a text not null,
  audio_a text not null,
  word_b text not null,
  audio_b text not null
);

-- Truyện ngắn AI sinh cuối tuần
create table public.weekly_stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  week_start date not null,
  content text not null,
  words_used jsonb,
  created_at timestamptz default now()
);

-- Quan hệ bạn bè
create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  friend_id uuid references public.profiles(id) on delete cascade,
  status text default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz default now(),
  unique(user_id, friend_id)
);

-- Thách đấu ôn từ giữa 2 người (Duel)
create table public.duels (
  id uuid primary key default gen_random_uuid(),
  challenger_id uuid references public.profiles(id),
  opponent_id uuid references public.profiles(id),
  word_set jsonb not null,
  status text default 'pending' check (status in ('pending','active','finished','declined')),
  challenger_score int,
  opponent_score int,
  duration_seconds int default 300,
  created_at timestamptz default now(),
  finished_at timestamptz
);

-- Trạng thái học FSRS của từng user với từng card
create table public.user_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  card_id uuid references public.cards(id) on delete cascade,
  stability numeric default 0,
  difficulty numeric default 0,
  due_at timestamptz default now(),
  review_count int default 0,
  lapse_count int default 0,
  is_leech boolean default false,
  state text default 'new' check (state in ('new','learning','review','relearning')),
  unique(user_id, card_id)
);

-- Lịch sử review
create table public.review_logs (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  card_id uuid references public.cards(id) on delete cascade,
  rating smallint check (rating between 1 and 4),
  reviewed_at timestamptz default now(),
  response_ms int,
  review_mode text default 'flashcard' check (review_mode in ('flashcard', 'cloze', 'custom_session'))
);

-- Token liên kết Telegram
create table public.telegram_link_tokens (
  token text primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  expires_at timestamptz not null,
  used boolean default false
);

-- Log gửi nhắc nhở
create table public.reminder_logs (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id),
  sent_at timestamptz default now(),
  window_label text
);

-- Cấu hình AI Provider động
create table public.ai_provider_configs (
  id uuid primary key default gen_random_uuid(),
  provider_name text not null,
  display_name text,
  model text not null,
  api_key text,
  is_active boolean default true,
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Văn bản đã import để tách từ & đọc tương tác
create table public.imported_texts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text,
  raw_text text not null,
  detected_words jsonb,
  created_at timestamptz default now()
);
```

---

## 5. Tính năng chi tiết theo Phase

### 🟦 Phase 1 — Nền tảng Core FSRS + Chuẩn hóa CEFR Level & Tags
- Xác thực đăng nhập qua Google OAuth.
- Thuật toán **FSRS** (`ts-fsrs`): tính toán chu kỳ lặp tối ưu dựa trên độ ổn định (stability) và độ khó (difficulty).
- Giao diện Review Flashcard 3D: hiệu ứng lật thẻ mượt mà, hỗ trợ phím tắt (`Space`: lật thẻ; `1`: Again, `2`: Hard, `3`: Good, `4`: Easy).
- Dashboard cá nhân: thống kê số thẻ đến hạn hôm nay, chuỗi ngày học liên tục (streak), biểu đồ forecast 7 ngày tới, biểu đồ phân bổ từ vựng theo trình độ quốc tế **CEFR (A1, A2, B1, B2, C1, C2)**.

**1.x. Thêm từ vựng mới — 2 chế độ hoàn chỉnh**:
- **Chế độ 1 — Nhập thủ công**:
  - Nhập Từ (*), Nghĩa (*), Từ loại (Select dropdown), **Cấp độ CEFR** (Select: A1, A2, B1, B2, C1, C2), **Tags** (nhập danh sách nhãn dạng tag badge), IPA, Câu ví dụ, Ảnh minh họa, Audio (tự sinh TTS).
  - Bấm "Lưu từ" → ghi vào bảng `cards` với `source_type = 'manual'`.
- **Chế độ 2 — AI Word Analyzer (Tự động phân tích toàn diện)**:
  - Gõ từ/cụm từ bất kỳ → AI tự động phân tích:
    - `cefr_level`: Đánh giá cấp độ CEFR chuẩn xác.
    - `card_type`: Phát hiện từ đơn, phrasal verb, hay idiom.
    - `ipa` & `part_of_speech`.
    - `senses[]`: Các tầng nghĩa riêng biệt kèm câu ví dụ đơn giản, dễ hiểu cho người học.
    - `tags`: AI tự động gợi ý 2-3 tags phù hợp với chủ đề của từ vựng.
    - `collocations`, `word_family`, `mnemonic`.
  - Toàn bộ kết quả hiển thị dạng form preview cho phép người dùng chỉnh sửa từng trường trước khi lưu.

**1.y. Kho từ vựng & Quản lý từ vựng (`/vocab`)**:
- Màn hình quản trị tập trung toàn bộ vốn từ vựng của người dùng:
  - **Thanh tìm kiếm tức thời (Search Bar)**: Tìm kiếm nhanh theo từ khóa, nghĩa tiếng Việt hoặc câu ví dụ.
  - **Bộ lọc đa chiều (Filters Toolbar)**:
    - Lọc theo Cấp độ CEFR: Tất cả, A1, A2, B1, B2, C1, C2.
    - Lọc theo Tags cá nhân: Chọn 1 hoặc nhiều tags (`#ielts`, `#technology`...).
    - Lọc theo Trạng thái học (FSRS State): Thẻ mới (New), Đang học (Learning), Cần ôn (Review/Due), Đã thành thạo, Từ khó (Leech).
    - Lọc theo Từ loại (Part of speech): Noun, Verb, Adj, Adv, Phrasal verb, Idiom...
  - **Sắp xếp linh hoạt (Sort)**: Mới thêm gần đây, Cũ nhất, Hạn ôn gần nhất (Due Date), Độ ổn định (Stability cao/thấp), Độ khó (Difficulty), Bảng chữ cái A-Z.
  - **Chế độ hiển thị kép**: Chuyển đổi linh hoạt giữa Dạng lưới thẻ (Card Grid) sinh động và Dạng bảng danh sách (Data Table) tiện quản lý số lượng lớn.
  - **Thao tác trên từng thẻ**:
    - Xem chi tiết thẻ (Modal Detail): Hiển thị đầy đủ phiên âm, audio TTS, câu ví dụ, collocations, word family, mẹo nhớ mnemonic, chỉ số FSRS (stability, difficulty, due date, lapse count).
    - Chỉnh sửa (Edit Modal): Sửa trực tiếp từ, nghĩa, ví dụ, CEFR level, tags, ảnh.
    - Xóa thẻ (Delete Confirmation Dialog): Xóa thẻ kèm dọn dẹp các bản ghi liên quan trong `user_cards` và `review_logs`.
    - Phát âm mẫu (Audio TTS) chỉ với 1 click.
  - **Thao tác hàng loạt (Bulk Actions)**: Chọn nhiều thẻ để gán tag, đưa vào Collection (Phase 3), hoặc tạo Custom Study Session ôn tập nhóm từ đã chọn.

---

### 🟩 Phase 2 — Smart Contextual Reader & Import từ mới
- **Trình đọc thông minh (Smart Contextual Reader)**:
  - Cho phép người dùng dán các bài đọc tiếng Anh (tin tức, báo chí, bài thi mẫu).
  - Giao diện đọc tương tác: Click hoặc bôi đen từ vựng bất kỳ trên bài đọc → hiển thị tooltip tra nhanh nghĩa, IPA, cấp độ CEFR.
  - **Nút "Lưu từ nhanh"**: Lưu ngay từ vựng vào kho cá nhân kèm chính xác câu ngữ cảnh chứa từ đó trong bài đọc (`context_sentence`), giúp não bộ ghi nhớ tự nhiên qua ngữ cảnh gốc.
- **Batch Word Extraction**:
  - Tự động tokenize và đối chiếu kho từ của user để highlight các từ chưa học.
  - Chọn nhiều từ mới cùng lúc → gọi AI phân tích hàng loạt theo batch (~10 từ/lần gọi) tiết kiệm quota.

---

### 🟨 Phase 3 — Hệ Thống Tổ Chức & Chia Sẻ Cộng Đồng (Tags + Collections)
- **Tổ chức cá nhân bằng Tags**:
  - Gắn nhãn tự do cho từng thẻ: `#ielts_writing`, `#technology`, `#daily_life`...
  - Lọc nhanh danh sách từ vựng theo 1 hoặc nhiều tags.
  - **Custom Study Session (Ôn tập tùy chỉnh theo Tag/Level)**:
    - Cho phép tạo phiên ôn tập tập trung theo nhu cầu: "Hôm nay tôi chỉ ôn 20 từ thuộc tag `#business`" hoặc "Ôn cấp tốc các từ trình độ `B2`" mà không làm xáo trộn chu kỳ FSRS tổng thể.
- **Collections / Study Sets (Bộ từ vựng đóng gói / Playlists chia sẻ)**:
  - Người dùng có thể nhóm các thẻ thành bộ từ vựng hoàn chỉnh: Tiêu đề, Mô tả, Ảnh bìa, Danh mục (IELTS, TOEIC, Giao tiếp, Học thuật...).
  - Thiết lập quyền riêng tư: **Private** (cá nhân) hoặc **Public** (chia sẻ cộng đồng).
- **Khám phá bộ từ vựng cộng đồng (Community Library)**:
  - Trang khám phá các Study Sets công khai được tạo bởi Admin hoặc cộng đồng học viên.
  - Xem trước (Preview) các thẻ trong bộ từ, xem thống kê lượt clone và đánh giá.
  - **1-Click Fork/Clone**: Chỉ với 1 click, toàn bộ thẻ trong bộ từ vựng được sao chép vào kho cá nhân của user, khởi tạo trạng thái FSRS để bắt đầu học ngay.
  - Chia sẻ link trực tiếp (`/collections/[id]`) cho bạn bè hoặc nhóm học tập.

---

### 🟧 Phase 4 — Chế độ ôn tập Active Recall: Cloze Deletion (Điền khuyết)
- Bổ sung chế độ ôn tập **Điền từ vào câu** bên cạnh Flashcard lật kinh điển:
  - Hệ thống tự động ẩn từ mục tiêu trong câu ví dụ: `"He has a strong [_______] to succeed in his career."`
  - Cung cấp gợi ý (chữ cái đầu hoặc từ loại).
  - Người dùng tự gõ từ cần điền hoặc chọn từ trắc nghiệm để kiểm tra khả năng nhớ chủ động trong văn cảnh thật (Contextual Active Recall).
  - Chấm điểm độ chính xác và thưởng XP cao hơn so với lật flashcard thụ động.

---

### 🟫 Phase 5 — AI Hỗ Trợ Học Sâu & Dual-Coding
- **Visual Mnemonic & Dual-Coding**:
  - Gợi ý hình ảnh liên tưởng thông qua Unsplash API hoặc mô tả hình ảnh gợi nhớ bằng AI.
  - Kích hoạt cơ chế ghi nhớ kép (Dual-Coding: Ngôn ngữ + Hình ảnh) giúp tăng 200% tỷ lệ lưu giữ từ vựng dài hạn.
- **Mnemonic Generator**: Tạo câu chuyện ngắn hoặc mẹo nhớ bằng âm thanh tương tự sinh động.
- **Sentence Writing & AI Grader**: Người dùng tự đặt câu với từ mới, AI chấm đúng/sai ngữ pháp và gợi ý cách dùng từ tự nhiên hơn (natural collocations).

---

### 🟥 Phase 6 — Tích hợp Telegram & Nhắc nhở "Giờ Vàng"
- Liên kết tài khoản nhanh qua Deep Link `/start <token>`.
- Thuật toán tự động nhận diện **"Giờ vàng" (Golden Hours)**: Phân tích lịch sử `review_logs` theo khung 2 giờ, tự động chọn 2-3 khung giờ user có tỷ lệ nhớ bài và tập trung cao nhất.
- Supabase Edge Function chạy định kỳ bằng `pg_cron` (mỗi 30 phút) kiểm tra số từ due và gửi tin nhắn nhắc nhở qua Telegram bot.
- **Weekly Report**: 20:00 Chủ nhật hàng tuần, bot gửi báo cáo tổng kết tuần (tổng lượt ôn, độ chính xác, streak, top từ leech hay quên) kèm dự báo số từ tuần tới.

---

### 🟪 Phase 7 — Trang Admin Quản Trị & Cấu hình AI Provider Động
- **Cấu hình AI Provider linh hoạt**:
  - Quản lý bảng `ai_provider_configs` trực tiếp trên UI: Groq, Gemini Flash, OpenAI, Anthropic...
  - Thay đổi provider mặc định chỉ bằng 1 click mà không cần sửa code hay deploy lại.
  - Nút kiểm tra kết nối API key trực tiếp từ giao diện Admin.
- **Giám sát hệ thống & Metrics**:
  - Theo dõi người dùng (DAU/WAU/MAU), số lượt ôn, tỷ lệ nhớ bài toàn hệ thống.
  - Giám sát lượng gọi API và mức tiêu thụ token tránh vượt quá free tier.
  - Thống kê các từ khó (leech) phổ biến nhất trong cộng đồng.
- **Quản lý nội dung mẫu**: Tạo và duyệt các bộ từ vựng chuẩn mực do Admin biên soạn (`admin_curated`) để đưa lên trang Khám phá cộng đồng.

---

### 🔶 Phase 8 — Collocations, Word Families, Minimal Pairs & Phrasal Verbs
- **Collocation Trainer**: Luyện ghép các cụm từ cố định tự nhiên (vd: "make a decision" chứ không dùng "do a decision").
- **Word Family Tree**: Khám phá mạng lưới các biến thể danh/động/tính/trạng từ cùng gốc.
- **Minimal Pairs**: Luyện phân biệt các cặp âm dễ nhầm lẫn bằng audio mẫu chuẩn xác.
- **Phrasal Verbs & Idioms**: Gắn nhãn riêng biệt, có bộ lọc chuyên biệt trong kho từ vựng.

---

### 🔺 Phase 9 — Xử lý từ khó (Leech Detection) & AI Mini-Story
- Tự động phát hiện từ khó (`lapse_count >= 4` → `is_leech = true`).
- Cơ chế xử lý từ khó: sinh lại mnemonic mới với góc nhìn khác, tạm thời tăng tần suất ôn ngắn hạn, gắn badge cảnh báo nổi bật.
- **AI Mini-Story cuối tuần**: AI tự động sáng tác truyện ngắn (~150 từ) lồng ghép toàn bộ từ vựng mới học trong tuần để người dùng đọc ôn tập ngữ cảnh giải trí.

---

### ⭐ Phase 10 — Gamification Xã Hội: Duel & Leaderboard
- **Kết bạn (Friendships)**: Kết nối với bạn bè qua username hoặc link chia sẻ.
- **Bảng xếp hạng tuần (Leaderboard)**: Đua top XP tích lũy từ các phiên review đúng có trọng số độ khó.
- **Đấu từ vựng thời gian thực (Duel)**: 2 người chơi thách đấu ôn cùng một bộ từ vựng trong 5 phút, so tài tốc độ và độ chính xác với điểm số cập nhật trực tiếp.

---

## 6. Chiến lược Chi phí $0 & Tối ưu Free Tier

| Dịch vụ | Hạn mức Free Tier | Giải pháp tối ưu duy trì $0 |
|---|---|---|
| **Vercel** | Hobby free | Tối ưu App Router static/SSR, không dùng cron Vercel. |
| **Supabase** | 500MB DB, 50k MAU, 500k Edge Fn | Sử dụng `pg_cron` (miễn phí) chạy Edge Function nhắc nhở Telegram định kỳ — vừa phục vụ tính năng vừa tự động giữ instance Supabase luôn hoạt động, tránh bị tạm dừng (pause) sau 7 ngày. |
| **AI Engine** | Groq Free / Google AI Studio (Gemini Flash) | Chạy model mã nguồn mở tốc độ cao; dễ dàng đổi provider dự phòng qua trang Admin nếu một bên gặp sự cố rate limit. |
| **Telegram API** | Miễn phí 100% | Không tốn chi phí SMS/Push notification phức tạp. |
| **TTS (Phát âm)** | Web Speech API | Chạy client-side hoàn toàn miễn phí. |
| **Ảnh minh họa** | Unsplash API Free Tier | ~50 req/giờ, cache URL ảnh đã dùng để tiết kiệm quota. |

---

## 7. Danh mục API & Edge Functions (Dùng chung cho Web và iOS)

| Endpoint / Hàm | Phương thức | Mô tả chức năng |
|---|---|---|
| `/api/cards` | GET / POST | Lấy danh sách thẻ / Tạo thẻ mới (kèm CEFR level, tags) |
| `/api/cards/:id` | PUT / DELETE | Cập nhật thông tin thẻ / Xóa thẻ |
| `/api/review/due` | GET | Lấy danh sách thẻ FSRS đến hạn ôn hôm nay |
| `/api/review/submit` | POST | Gửi kết quả review, cập nhật FSRS state & ghi log |
| `/api/review/custom-session` | GET | Lấy danh sách thẻ ôn tập theo Tag hoặc Collection |
| `/api/collections` | GET / POST | Lấy danh sách collections (cá nhân & public) / Tạo mới |
| `/api/collections/:id` | GET / PUT / DELETE | Xem chi tiết collection kèm preview thẻ / Chỉnh sửa / Xóa |
| `/api/collections/:id/fork` | POST | **1-Click Clone toàn bộ thẻ trong collection vào kho FSRS cá nhân** |
| `/api/collections/:id/cards` | POST / DELETE | Thêm / xóa thẻ khỏi bộ sưu tập |
| `/api/import/extract` | POST | Trích xuất từ mới từ đoạn văn bản |
| `/api/ai/analyze-word` | POST | AI Word Analyzer: phân tích CEFR, nghĩa, IPA, collocations, tags, mnemonic |
| `/api/ai/mnemonic` | POST | Sinh mẹo nhớ sinh động cho từ |
| `/api/ai/grade-sentence` | POST | Chấm điểm câu tiếng Anh người dùng tự viết |
| `/api/telegram/webhook` | POST | Webhook tiếp nhận tin nhắn từ Telegram bot |
| `edge-fn: send-reminders` | Cron trigger | Kiểm tra giờ vàng và gửi thông báo Telegram |
| `edge-fn: weekly-report` | Cron trigger | Tổng hợp báo cáo tuần và AI Mini-Story |

---

## 8. Kế hoạch Milestones triển khai

| Mốc | Nội dung công việc |
|---|---|
| **M1** | Core SRS (FSRS) + Auth Google + CRUD Card + Phân loại CEFR Level (A1-C2) + Tags cá nhân |
| **M2** | Collections & Chia sẻ cộng đồng (Tạo bộ từ, Public lên Thư viện, 1-Click Fork/Clone) + Custom Study Session theo Tag |
| **M3** | Smart Contextual Reader (Đọc bài tương tác, bôi đen lưu từ kèm câu gốc ngữ cảnh) + Batch Import |
| **M4** | Chế độ ôn tập Cloze Deletion (Điền khuyết ngữ cảnh) + Flashcard 3D |
| **M5** | AI học sâu: Dual-Coding ảnh Unsplash + Sinh Mnemonic + AI Grader chấm câu viết |
| **M6** | Tích hợp Telegram: Liên kết tài khoản + Thuật toán Giờ vàng + Nhắc nhở tự động qua `pg_cron` |
| **M7** | Admin Dashboard hoàn chỉnh + Cấu hình AI Provider động linh hoạt |
| **M8** | Collocations, Word Families, Phrasal Verbs, Dictation & Minimal Pairs |
| **M9** | Leech Detection tự động + AI Mini-Story cuối tuần |
| **M10** | Gamification xã hội: Bạn bè, Thách đấu Duel thời gian thực & Bảng xếp hạng tuần |

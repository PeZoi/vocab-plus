# 📘 Đặc Tả Sản Phẩm — Vocab App (Phiên bản Web)

> Stack: **Next.js** (App Router) + **Supabase** (Postgres, Auth, Edge Functions, Storage) + **Tailwind CSS** + **Motion (Framer Motion)** + **Zustand** + **TanStack Query** + **React Hook Form** + **Zod** — Deploy trên **Vercel**
> Ngôn ngữ học: **Tiếng Anh**
> Mục tiêu: Sản phẩm nghiêm túc, launch public, ưu tiên tối đa chi phí **$0**

---

## 1. Tổng quan

Ứng dụng học từ vựng tiếng Anh dùng phương pháp **Lặp lại ngắt quãng (Spaced Repetition)** thông qua thuật toán **FSRS**, có khả năng:
- Tự tạo card từ nội dung thật của người dùng (import & auto-detect)
- Hỗ trợ AI sinh mnemonic, ảnh liên tưởng, chấm câu viết
- Nhắc nhở & báo cáo qua **Telegram** theo "giờ vàng" cá nhân hóa
- Có trang **Admin** quản trị toàn diện, bao gồm cấu hình AI provider động

---

## 2. Design System — "Deep Focus (Dark)"

Mục tiêu: tối, chuyên nghiệp, nhưng có điểm nhấn sinh động — không xám xịt nhàm chán.

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

Gradient điểm nhấn (dùng cho hero, streak badge, nút CTA quan trọng):
`linear-gradient(135deg, #F97316 0%, #FB923C 100%)`

### 2.2 Typography

- **Heading/Display**: `Sora` (Google Fonts, free) — trọng lượng 600–700, tạo cảm giác hiện đại, hơi "geometric"
- **Body/UI**: `Be Vietnam Pro` (Google Fonts, free, hỗ trợ dấu tiếng Việt đầy đủ cho phần UI/admin tiếng Việt)
- **Monospace** (phiên âm IPA, code): `JetBrains Mono`

Kích thước cơ bản: base 16px, scale 1.25 (Major Third).

### 2.3 Nguyên tắc UI

- Bo góc lớn vừa phải: `rounded-2xl` (16px) cho card, `rounded-xl` (12px) cho input/button
- Shadow rất nhẹ, thiên về "glow" màu brand thay vì shadow đen (vì nền đã tối): `box-shadow: 0 0 24px -8px rgba(99,102,241,0.35)`
- Không dùng border cứng nhiều — ưu tiên phân tách bằng độ sáng nền (surface vs base)
- Micro-animation khi review card đúng/sai (màu success/danger flash nhẹ + haptic-like feedback trên mobile)
- Empty state luôn có minh họa nhẹ (line-art SVG đơn sắc theo brand color) thay vì để trống trơn

### 2.4 Tailwind config (gợi ý)

```js
// tailwind.config.ts
colors: {
  base: '#0B0F17',
  surface: { DEFAULT: '#131A26', hover: '#1B2333' },
  border: '#232B3A',
  text: { primary: '#E7EAF0', secondary: '#8B94A7' },
  brand: { DEFAULT: '#6366F1', hover: '#818CF8' },
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#F43F5E',
  info: '#38BDF8',
}
```

---

## 3. Kiến trúc hệ thống

### 3.1 Tech Stack chi tiết

| Layer | Công nghệ | Vai trò |
|---|---|---|
| Framework | **Next.js** (App Router) | Framework chính, SSR/RSC, deploy trên Vercel |
| Backend / DB | **Supabase** (Postgres, Auth, Storage, Edge Functions) | Backend as a Service, có RLS bảo mật theo user |
| Styling | **Tailwind CSS** | Utility-first CSS, dùng trực tiếp các token màu đã định nghĩa ở mục 2 |
| UI Components | **shadcn/ui** | Component dựng sẵn trên Radix (dialog, dropdown, table, form...), dễ chỉnh theo Design System tối |
| State toàn cục (client) | **Zustand** | Quản lý state client nhẹ: trạng thái phiên review đang chạy, filter tạm, UI state |
| Data fetching & cache | **TanStack Query** | Fetch/cache/đồng bộ dữ liệu server: card due, dashboard, leaderboard... |
| Form | **React Hook Form** | Quản lý toàn bộ form: tạo card thủ công, settings, admin forms |
| Validation | **Zod** | Validate schema cho form (kết hợp `@hookform/resolvers/zod`) và validate input ở API/Edge Function |
| Supabase client | `@supabase/supabase-js` + `@supabase/ssr` | Kết nối Supabase, xử lý session/cookie đúng chuẩn cho Next.js App Router |
| Icon | `lucide-react` | Bộ icon mặc định đi kèm shadcn/ui |
| FSRS engine | `ts-fsrs` | Thư viện tính lịch ôn tập theo thuật toán Spaced Repetition FSRS |
| Date/Time & Timezone | `date-fns` + `date-fns-tz` | Xử lý múi giờ cho tính năng "giờ vàng" theo timezone từng user |

### 3.2 Sơ đồ kiến trúc

```
┌─────────────────┐      ┌──────────────────────┐
│   Next.js App    │◄────►│   Supabase Postgres    │
│  (Vercel, App    │      │   + Auth + Storage     │
│   Router, RSC)   │      │   + Edge Functions     │
└────────┬─────────┘      └──────────┬────────────┘
         │                           │
         │                  pg_cron (lịch chạy)
         │                           │
         ▼                           ▼
┌─────────────────┐      ┌──────────────────────┐
│  AI Provider     │      │   Telegram Bot API     │
│ (Gemini/Groq free)│     │   (sendMessage/webhook)│
└──────────────────┘      └──────────────────────┘
```

### 3.3 Lưu ý triển khai

- **Không dùng Vercel Cron** cho tác vụ chạy mỗi 30 phút vì gói Hobby free chỉ cho phép cron chạy **1 lần/ngày**. Thay vào đó dùng **Supabase `pg_cron`** (miễn phí, chạy được theo phút) để trigger Edge Function.
- Toàn bộ logic nghiệp vụ (FSRS scheduling, gọi AI, gửi Telegram) đặt trong **Supabase Edge Functions** — để sau này app iOS gọi chung, không viết lại logic.

---

## 4. Database Schema (Postgres)

```sql
-- Người dùng (mở rộng từ auth.users của Supabase)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text default 'user' check (role in ('user','admin')),
  timezone text default 'Asia/Ho_Chi_Minh',
  telegram_chat_id bigint unique,
  golden_hours jsonb default '["07:00-08:00","12:00-13:00","21:00-22:00"]',
  xp integer default 0, -- dùng cho leaderboard, cộng theo review đúng có trọng số độ khó
  created_at timestamptz default now()
);

-- Thẻ từ vựng (global pool, có thể do user hoặc admin tạo)
create table public.cards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id),
  word text not null,
  ipa text,
  definition text not null,
  example_sentence text,
  source_type text check (source_type in ('manual','imported','ai_generated','admin_curated')),
  card_type text default 'word' check (card_type in ('word','phrasal_verb','idiom')),
  part_of_speech text check (part_of_speech in ('noun','verb','adjective','adverb','preposition','conjunction','pronoun','interjection')), -- chỉ áp dụng khi card_type = 'word'; AI tự detect ở Chế độ 2, hoặc user tự chọn ở Chế độ 1
  sense_number int default 1, -- phân biệt các nghĩa khác nhau của cùng 1 từ (từ đa nghĩa)
  audio_url text,
  image_url text,
  mnemonic text,
  created_at timestamptz default now()
);

-- Collocation gắn với 1 card (vd: "make a decision", không phải "do a decision")
create table public.collocations (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references public.cards(id) on delete cascade,
  phrase text not null,
  example_sentence text
);

-- Word family: các dạng biến thể của cùng 1 từ gốc (danh từ/tính từ/động từ/trạng từ)
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

-- Truyện ngắn AI sinh cuối tuần, lồng ghép từ mới học trong tuần
create table public.weekly_stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  week_start date not null,
  content text not null,
  words_used jsonb,
  created_at timestamptz default now()
);

-- Quan hệ bạn bè (cho leaderboard & duel)
create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  friend_id uuid references public.profiles(id) on delete cascade,
  status text default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz default now(),
  unique(user_id, friend_id)
);

-- Thách đấu ôn từ giữa 2 người
create table public.duels (
  id uuid primary key default gen_random_uuid(),
  challenger_id uuid references public.profiles(id),
  opponent_id uuid references public.profiles(id),
  word_set jsonb not null, -- danh sách card_id dùng trong trận
  status text default 'pending' check (status in ('pending','active','finished','declined')),
  challenger_score int,
  opponent_score int,
  duration_seconds int default 300,
  created_at timestamptz default now(),
  finished_at timestamptz
);

-- Trạng thái học của từng user với từng card (FSRS state)
create table public.user_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  card_id uuid references public.cards(id) on delete cascade,
  stability numeric default 0,
  difficulty numeric default 0,
  due_at timestamptz default now(),
  review_count int default 0,
  lapse_count int default 0,
  is_leech boolean default false, -- tự động bật khi lapse_count vượt ngưỡng (mặc định 4)
  state text default 'new' check (state in ('new','learning','review','relearning')),
  unique(user_id, card_id)
);

-- Lịch sử review (dùng để vẽ forecast, tính giờ vàng, weekly report)
create table public.review_logs (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  card_id uuid references public.cards(id) on delete cascade,
  rating smallint check (rating between 1 and 4), -- 1 Again 2 Hard 3 Good 4 Easy
  reviewed_at timestamptz default now(),
  response_ms int
);

-- Token liên kết Telegram (deep link /start <token>)
create table public.telegram_link_tokens (
  token text primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  expires_at timestamptz not null,
  used boolean default false
);

-- Log gửi nhắc nhở (tránh spam trong cùng khung giờ vàng)
create table public.reminder_logs (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id),
  sent_at timestamptz default now(),
  window_label text -- vd: '2026-09-03_morning'
);

-- Cấu hình AI Provider động (admin quản lý qua UI, không hardcode)
create table public.ai_provider_configs (
  id uuid primary key default gen_random_uuid(),
  provider_name text not null, -- 'groq' | 'gemini' | 'openai' | 'anthropic' ...
  display_name text,
  model text not null, -- vd 'llama-3.3-70b-versatile' (Groq)
  api_key_secret_name text not null, -- CHỈ lưu tên secret trong Supabase Vault, không lưu key thô ở đây
  is_active boolean default true,
  is_default boolean default false, -- chỉ 1 provider được default tại 1 thời điểm
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Văn bản đã import để tách từ
create table public.imported_texts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  raw_text text not null,
  detected_words jsonb,
  created_at timestamptz default now()
);
```

Tất cả bảng chứa dữ liệu user đều bật **Row Level Security (RLS)**: user chỉ đọc/ghi được dữ liệu của chính mình; `role = 'admin'` được policy riêng cho phép truy cập toàn bộ.

---

## 5. Tính năng theo Phase (chỉ liệt kê tính năng CHẮC CHẮN làm)

### 🟦 Phase 1 — Nền tảng & Core SRS
- Đăng ký/đăng nhập (Email + Google OAuth qua Supabase Auth)
- CRUD thẻ từ vựng: từ, từ loại, IPA, nghĩa, câu ví dụ, audio (TTS), ảnh — chi tiết 2 chế độ nhập (thủ công / AI tự động phân tích) ở mục 1.x ngay dưới đây
- Thuật toán **FSRS** (dùng thư viện `ts-fsrs`) — đây chính là phương pháp **Lặp lại ngắt quãng (Spaced Repetition)**, phiên bản hiện đại và chính xác hơn thuật toán SM-2 cũ — tính lịch ôn tập tối ưu cho từng card
- Màn hình Review: hiển thị card, 4 nút đánh giá (Again/Hard/Good/Easy), animation phản hồi theo màu success/danger
- Dashboard cá nhân: số từ đang học, số due hôm nay, streak hiện tại, biểu đồ forecast 7 ngày tới

**1.x. Thêm từ vựng mới — 2 chế độ: Thủ công & AI tự động phân tích**

Màn hình "Thêm từ" (`/add`, dạng dialog) có segmented control chọn chế độ ở trên cùng, dùng chung 1 layout form bên dưới.

**Chế độ 1 — Nhập thủ công**
- Form đầy đủ (React Hook Form + Zod): Từ/cụm từ (*), Từ loại (dropdown: danh từ/động từ/tính từ/trạng từ/giới từ/liên từ/đại từ/thán từ — ẩn field này nếu `card_type` chọn Phrasal verb/Idiom), IPA (không bắt buộc), Nghĩa (*), Câu ví dụ (không bắt buộc), Ảnh minh họa (upload hoặc bấm "Tìm ảnh" gọi Unsplash), Audio (tự sinh bằng TTS khi lưu, không cần thao tác thêm)
- Zod schema chỉ bắt buộc `word` và `definition`, các trường còn lại optional
- Bấm "Lưu từ" → gọi thẳng `POST /api/cards`, lưu với `source_type = 'manual'`
- Dùng khi: user đã chắc nghĩa/cách dùng và muốn nhập nhanh, hoặc muốn tự viết lại sau khi thấy kết quả AI ở Chế độ 2 chưa ưng ý

**Chế độ 2 — AI tự động phân tích ("AI Word Analyzer")**
- User chỉ cần gõ 1 từ hoặc cụm từ (không cần biết nghĩa/loại từ/IPA) → bấm "Phân tích bằng AI"
- Edge Function gọi AI provider đang active (mặc định Groq, xem mục 5.5) với prompt yêu cầu trả JSON có cấu trúc, gồm:
  - `ipa`, `card_type` (tự detect word/phrasal_verb/idiom)
  - `senses[]`: nếu từ đa nghĩa, trả về **nhiều nghĩa riêng biệt**, mỗi nghĩa kèm `part_of_speech`, `definition`, `vietnamese_hint`, `example_sentence` riêng
    - `example_sentence` bắt buộc ở mức **câu đơn giản, cơ bản** (ưu tiên từ vựng phổ biến A2–B1 trong chính câu ví dụ, tránh nhồi thêm từ khó khác) — để người vừa học từ này vẫn đọc hiểu được trọn câu
  - `collocations[]`: các cụm từ hay đi kèm (tự động insert vào bảng `collocations`)
  - `word_family[]`: các dạng biến thể danh/động/tính/trạng từ (tự động insert vào bảng `word_families`)
  - `mnemonic`: gợi ý mẹo nhớ luôn trong 1 lần gọi, khỏi phải bấm sinh mnemonic riêng ở Phase 3
- Kết quả hiển thị dạng **preview** dùng chung layout form của Chế độ 1 — mọi field (kể cả `part_of_speech`, câu ví dụ...) đều sửa/xóa được trước khi lưu, không tự động lưu thẳng vì AI có thể sai
- Nếu `senses.length > 1`: hiển thị checkbox để user chọn nghĩa nào muốn thêm — mỗi nghĩa chọn tạo 1 card riêng với `sense_number` tương ứng
- Bấm "Lưu" ở preview → gọi `POST /api/cards` (1 lần cho mỗi nghĩa được chọn), `source_type = 'ai_generated'`

### 🟩 Phase 2 — Import & Tự động phát hiện từ mới
- Ô nhập/paste đoạn văn bản tiếng Anh
- Tokenize + so khớp với danh sách từ user đã học/đang học → highlight từ **chưa** có trong deck
- User chọn (checkbox) những từ muốn thêm → bấm "Phân tích bằng AI" để gọi **AI Word Analyzer** hàng loạt (tái dùng `POST /api/ai/analyze-word`, nay hỗ trợ dạng batch — xem mục 7):
  - Gộp các từ đã chọn vào tối đa ~10 từ/lần gọi (chọn nhiều hơn thì tự chia thành nhiều lần gọi tuần tự) — tránh gọi API riêng lẻ từng từ, tiết kiệm hạn mức free tier
  - Mỗi từ gửi kèm `context_sentence` = câu gốc chứa từ đó trong đoạn văn → AI ưu tiên trả về `senses[]` khớp đúng nghĩa đang được dùng trong câu đó lên đầu, thay vì liệt kê mọi nghĩa có thể có
  - `example_sentence` của card lấy mặc định là **câu gốc từ đoạn văn user paste** (không dùng câu AI tự sinh) — vì đây là ngữ cảnh thật user đã gặp từ, giá trị ghi nhớ cao hơn ví dụ chung chung; các field còn lại (`part_of_speech`, `ipa`, `definition`, `vietnamese_hint`, collocations, word family, mnemonic) lấy từ AI như Chế độ 2 ở Phase 1
- Kết quả hiển thị dạng preview hàng loạt (tái dùng UI/validate của Chế độ 1&2 ở mục 1.x — `word` + `definition` bắt buộc), cho sửa từng field trước khi lưu → "Lưu tất cả" → tạo card với `source_type = 'imported'`
- Lưu lại `imported_texts` để tham chiếu sau

### 🟨 Phase 3 — AI hỗ trợ học sâu
- Sinh **mnemonic** (câu chuyện/liên tưởng ghi nhớ) cho từng từ qua AI, hiển thị ở mặt sau card
- Gợi ý **ảnh minh họa** (dual coding) từ Unsplash API theo từ khóa
- Chế độ **viết câu**: user dùng từ vừa học viết 1 câu, AI chấm đúng/sai ngữ pháp + gợi ý cải thiện

### 🟥 Phase 4 — Tích hợp Telegram & Nhắc nhở "Giờ Vàng"

**4.1. Liên kết tài khoản Telegram**
- User vào Settings → bấm "Kết nối Telegram" → hệ thống tạo `telegram_link_tokens` (hết hạn 15 phút) → hiển thị nút deep link `https://t.me/<bot_username>?start=<token>`
- Webhook `POST /api/telegram/webhook` nhận update, nếu là `/start <token>` hợp lệ → lưu `chat_id` vào `profiles.telegram_chat_id`, bot trả lời xác nhận

**4.2. Phương pháp xác định "Giờ vàng"**
- Mặc định 3 khung: Sáng (07:00–08:00), Trưa (12:00–13:00), Tối trước ngủ (21:00–22:00) — dựa nguyên lý multiple exposure của spaced repetition
- Sau khi user có ≥ 15 phiên review: hệ thống phân tích `review_logs` theo khung 2 giờ, tính **tỉ lệ đúng trung bình** + **tỉ lệ hoàn thành phiên** theo từng khung → tự xếp hạng lại, chọn ra 2–3 khung giờ hiệu quả nhất, cập nhật `profiles.golden_hours`
- Cho phép user override thủ công trong Settings

**4.3. Logic gửi nhắc nhở (Edge Function chạy mỗi 30 phút qua `pg_cron`)**
1. Với mỗi user: quy đổi giờ hiện tại theo `timezone` của họ
2. Nếu giờ hiện tại rơi vào 1 khung `golden_hours` **và** có card `due_at <= now()` **và** chưa gửi nhắc nhở trong khung này hôm nay (check `reminder_logs`) → gửi tin nhắn Telegram
3. Giới hạn tối đa 3 lần nhắc/ngày/user
4. Nếu user đã hoàn thành review hôm nay → không nhắc nữa dù còn khung giờ vàng
5. Nếu user không hoạt động 2 ngày liên tiếp → gửi 1 tin nhắc nhẹ nhàng ngoài giờ vàng (re-engagement, không tính vào cap 3 lần/ngày)

**4.4. Báo cáo tuần (Weekly Report)**
- Edge Function chạy Chủ nhật 20:00 (giờ user), tổng hợp từ `review_logs` 7 ngày gần nhất
- Nội dung: tổng số lượt ôn, độ chính xác trung bình, streak, top từ hay sai (leech), dự báo số từ due tuần tới
- Gửi qua Telegram dạng tin nhắn Markdown

### 🟪 Phase 5 — Trang Admin (chi tiết)

**Bảo mật**: route `/admin/*` bọc middleware kiểm tra `profiles.role = 'admin'`, kết hợp RLS phía Supabase.

**5.1. Dashboard tổng quan**
- Tổng số user, user hoạt động (DAU/WAU/MAU)
- Tổng số card trong hệ thống, tổng lượt review hôm nay
- Tỉ lệ ghi nhớ trung bình toàn hệ thống (accuracy trung bình)
- Số user đã kết nối Telegram / chưa kết nối
- Thống kê từ leech phổ biến toàn hệ thống (những từ nhiều user hay quên nhất)
- Biểu đồ tăng trưởng user theo thời gian

**5.2. Quản lý người dùng**
- Bảng danh sách user: tìm kiếm, lọc theo trạng thái hoạt động, ngày đăng ký
- Xem chi tiết 1 user: số card, streak, lịch sử review, trạng thái Telegram
- Hành động: khóa/mở khóa tài khoản, gửi tin nhắn test qua Telegram, xóa dữ liệu (theo yêu cầu xóa tài khoản)

**5.3. Quản lý nội dung**
- CRUD bộ từ vựng do admin biên soạn (`source_type = 'admin_curated'`) — dùng làm deck mẫu cho user mới
- Duyệt/ẩn card do lỗi hoặc không phù hợp (nếu sau này mở tính năng chia sẻ)

**5.4. Giám sát sử dụng AI**
- Bảng theo dõi số lượt gọi AI provider theo ngày/tháng, so với hạn mức free tier
- Cảnh báo (hiển thị màu `warning`/`danger`) khi gần chạm giới hạn free tier của provider đang active

**5.5. Cấu hình AI Provider động**
- Admin quản lý bảng `ai_provider_configs` qua UI: thêm/sửa/xóa provider, chọn model, bật/tắt, chọn 1 provider làm **default**
- **Mặc định ban đầu: Groq** (free tier, chạy model open-source tốc độ cao) — nhưng kiến trúc cho phép thêm Gemini, OpenAI, Anthropic... bất cứ lúc nào mà không cần deploy lại code
- API key của từng provider lưu qua **Supabase Vault** (extension `pgsodium`), bảng `ai_provider_configs` chỉ lưu `api_key_secret_name` tham chiếu tới secret, không lưu key thô
- Nút "Kiểm tra kết nối": gửi 1 prompt test đơn giản tới provider đang chọn để xác nhận key hoạt động trước khi set làm default
- Toàn bộ Edge Function gọi AI (`/api/ai/mnemonic`, `/api/ai/grade-sentence`, weekly-story...) đọc provider `is_default = true` tại thời điểm gọi, không hardcode provider trong code

**5.6. Quản lý Telegram Bot**
- Xem log tin nhắn đã gửi (thành công/thất bại)
- Test gửi thử tin nhắn tới 1 user cụ thể
- Cấu hình template nội dung nhắc nhở / báo cáo tuần (cho phép chỉnh câu chữ mà không cần deploy lại code)

**5.7. Feature Flags**
- Bật/tắt từng phase tính năng (import, AI mnemonic, collocation, dictation...) toàn hệ thống hoặc theo từng user (dùng cho A/B test hoặc rollout dần)

**5.8. Logs & Reports**
- Log lỗi hệ thống (API fail, Edge Function fail)
- Export báo cáo CSV: danh sách user, thống kê học tập

### 🔶 Phase 6 — Học sâu: Collocation, Word Family, Từ đa nghĩa, Phrasal Verbs
- **Collocation trainer**: mỗi card có thể gắn các cụm collocation phổ biến (bảng `collocations`) — bài tập dạng chọn từ ghép đúng (vd "make a decision" chứ không phải "do a decision")
- **Word family**: khi mở 1 card, hiển thị thêm các dạng biến thể liên quan (bảng `word_families`) — danh từ/động từ/tính từ/trạng từ cùng gốc — cho phép "học mở rộng" cả nhóm cùng lúc
- **Xử lý từ đa nghĩa**: cùng 1 từ có thể có nhiều card riêng biệt phân biệt bằng `sense_number`, mỗi nghĩa có ví dụ ngữ cảnh riêng, tránh học lẫn lộn nghĩa
- **Phrasal verbs & Idioms**: có `card_type` riêng, hiển thị badge phân loại rõ trong UI, có thể lọc riêng deck theo loại này

### 🔷 Phase 7 — Dictation & Minimal Pairs
- **Dictation mode**: phát audio câu ví dụ (ẩn chữ), user gõ lại chính xác, chấm bằng khoảng cách Levenshtein giữa câu gõ và câu gốc
- **Minimal pairs pronunciation**: luyện phân biệt các cặp từ dễ nhầm (vd *ship/sheep*) từ bảng `minimal_pairs` — nghe audio, chọn đúng từ vừa phát (chỉ dạng nghe-chọn, không ghi âm — phần ghi âm/chấm phát âm dành riêng cho app iOS)

### 🔺 Phase 8 — Leech Detection (xử lý từ hay quên tự động)
- Khi 1 card có `lapse_count` vượt ngưỡng (mặc định 4 lần liên tiếp Again/Hard) → Edge Function tự động set `is_leech = true`
- Card leech được: (1) AI sinh lại mnemonic mới khác cách trình bày cũ, (2) tạm tăng tần suất ôn ngắn hạn riêng cho từ đó, (3) gắn badge "Từ khó" nổi bật màu `warning` trong UI
- Dashboard có mục riêng "Từ khó cần chú ý" liệt kê toàn bộ card đang `is_leech = true`
- Admin xem được thống kê leech toàn hệ thống (mục 5.1) để biết loại từ nào gây khó phổ biến

### 🔻 Phase 9 — AI Mini-Story cuối tuần
- Edge Function chạy cùng lịch với weekly report (Chủ nhật) — lấy danh sách từ user học trong tuần, prompt AI viết 1 đoạn truyện ngắn (~100-150 từ) lồng ghép tự nhiên các từ đó
- Lưu vào bảng `weekly_stories`, hiển thị trong tab "Ôn tập tuần" trên app
- Gửi kèm bản rút gọn qua Telegram trong báo cáo tuần, kèm link mở app xem đầy đủ

### ⭐ Phase 10 — Gamification xã hội: Duel & Leaderboard
- **Kết bạn**: gửi/chấp nhận lời mời qua username hoặc link chia sẻ (bảng `friendships`)
- **Duel**: 2 người thách đấu ôn cùng 1 bộ từ trong thời gian giới hạn (mặc định 5 phút), so điểm accuracy + tốc độ trả lời, kết quả thông báo qua Telegram cho cả 2 (bảng `duels`)
- **Leaderboard**: bảng xếp hạng XP theo tuần trong nhóm bạn bè, XP tính theo số lượt trả lời đúng có trọng số theo độ khó (không tính số lần ôn để tránh khuyến khích học vẹt/spam), reset mỗi tuần

---

## 6. Chi phí & Free Tier — Bảng theo dõi

| Dịch vụ | Free tier | Giới hạn cần lưu ý | Rủi ro phát sinh phí | Phương án thay thế miễn phí |
|---|---|---|---|---|
| **Vercel** (Hobby) | Không giới hạn deploy, 100GB bandwidth/tháng | Cron job chỉ chạy **1 lần/ngày** | Nếu cần cron dày hơn sẽ phải nâng gói | Dùng **Supabase `pg_cron`** thay vì Vercel Cron |
| **Supabase** (Free) | 500MB DB, 1GB storage, 50k MAU, 500k Edge Function invocations/tháng | **Project tự tạm dừng (pause) sau 7 ngày không có hoạt động** | Cần có traffic đều hoặc ping định kỳ để tránh pause | Set up 1 cron nhỏ tự ping project, hoặc chấp nhận unpause thủ công |
| **Telegram Bot API** | Hoàn toàn miễn phí | Rate limit ~30 tin/giây (dư sức) | Không có rủi ro phí | — |
| **AI (mnemonic, chấm câu, mini-story)** | **Groq** (mặc định ban đầu, cấu hình qua Admin) — free tier, chạy model open-source tốc độ cao | Free tier Groq có giới hạn request/phút và token/ngày (thay đổi theo thời gian, cần kiểm tra hiện tại) | Nếu vượt hạn mức Groq free, cần đổi sang provider khác hoặc trả phí | Nhờ kiến trúc `ai_provider_configs`, admin chuyển sang **Gemini Flash free tier** hoặc provider free khác chỉ bằng vài click, không cần deploy lại |
| **TTS** (phát âm mẫu, dictation) | Web Speech API (`speechSynthesis`) — client-side, miễn phí | Chất lượng giọng phụ thuộc trình duyệt/OS, không đồng nhất | Dịch vụ TTS chất lượng cao (Google Cloud TTS, ElevenLabs) đều tính phí sau hạn mức nhỏ | Chấp nhận chất lượng Web Speech API cho bản Web |
| **Ảnh minh họa** | Unsplash API (Demo tier) | ~50 request/giờ | Cần xin "Production" tier (vẫn free) nếu traffic cao | Có thể cache ảnh đã dùng để giảm số request |
| **Domain** | `*.vercel.app` miễn phí | — | Domain riêng (`.com`, `.app`...) phải mua | Dùng subdomain free trong giai đoạn đầu |

⚠️ **Lưu ý quan trọng nhất**: Supabase Free project bị **pause sau 7 ngày không hoạt động** — cần tính phương án (ví dụ: chính cron job nhắc nhở Telegram mỗi 30 phút sẽ tự nhiên giữ project luôn "sống", vì nó liên tục có Edge Function invocation).

---

## 7. API / Edge Functions (để dùng chung cho iOS sau này)

| Endpoint / Function | Mô tả |
|---|---|
| `POST /api/cards` | Tạo card mới (dùng cho cả Chế độ 1 - nhập thủ công, và bước lưu sau khi xác nhận preview ở Chế độ 2 - AI Word Analyzer) |
| `GET /api/review/due` | Lấy danh sách card due hôm nay |
| `POST /api/review/submit` | Gửi kết quả review, cập nhật FSRS state |
| `POST /api/import/extract` | Nhận đoạn text, trả về danh sách từ mới phát hiện |
| `POST /api/ai/mnemonic` | Sinh mnemonic cho 1 từ (dùng provider `is_default` hiện tại) |
| `POST /api/ai/analyze-word` | **AI Word Analyzer**: nhận 1 hoặc nhiều từ dạng batch (tối đa ~10 từ/lần, mỗi từ kèm `context_sentence` tùy chọn để ưu tiên đúng nghĩa theo ngữ cảnh), trả về từ loại (`part_of_speech`), IPA, senses (đa nghĩa, ví dụ ở mức cơ bản), collocations, word family, mnemonic — dùng cho Chế độ 2 ở màn "Thêm từ" (Phase 1) và bước phân tích khi Import (Phase 2) |
| `POST /api/ai/grade-sentence` | Chấm câu user viết (dùng provider `is_default` hiện tại) |
| `GET/POST /api/admin/ai-providers` | Admin xem/thêm/sửa cấu hình `ai_provider_configs`, đổi provider default |
| `POST /api/telegram/webhook` | Nhận webhook từ Telegram |
| `edge-fn: send-reminders` | Chạy theo `pg_cron`, gửi nhắc nhở giờ vàng |
| `edge-fn: weekly-report` | Chạy Chủ nhật, gửi báo cáo tuần |

---

## 8. Yêu cầu phi chức năng

- **Bảo mật**: RLS bật cho mọi bảng chứa dữ liệu cá nhân; Telegram bot token, AI API key chỉ lưu server-side (Supabase secrets/Vercel env)
- **Hiệu năng**: cache danh sách card due bằng **TanStack Query**, tránh gọi lại API không cần thiết khi review liên tục
- **Đa ngôn ngữ giao diện**: UI chính tiếng Việt (vì đây là sản phẩm cho người Việt học tiếng Anh)
- **Responsive**: Web phải dùng tốt trên mobile browser vì đây sẽ là trải nghiệm chính trước khi có app iOS

---

## 9. Gợi ý mốc triển khai (Milestones)

| Mốc | Nội dung |
|---|---|
| M1 | Auth + CRUD card + FSRS review (Spaced Repetition) hoạt động end-to-end |
| M2 | Import & auto-detect từ mới (kèm AI Word Analyzer chạy batch) |
| M3 | AI mnemonic + ảnh + chấm câu (dùng Groq qua kiến trúc provider động) |
| M4 | Telegram liên kết + gửi nhắc nhở giờ vàng + báo cáo tuần |
| M5 | Admin panel đầy đủ (bao gồm cấu hình AI provider động) |
| M6 | Collocation, word family, từ đa nghĩa, phrasal verbs |
| M7 | Dictation mode + minimal pairs (nghe-chọn) |
| M8 | Leech detection tự động |
| M9 | AI mini-story cuối tuần |
| M10 | Gamification xã hội: duel & leaderboard |
| M11 | Public launch |

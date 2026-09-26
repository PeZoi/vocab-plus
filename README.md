<div align="center">

  <h1>✨ Vocab Plus</h1>

  <p>
    <strong>Nền Tảng Học Từ Vựng Tiếng Anh Thông Minh Ứng Dụng AI & Thuật Toán Lặp Lại Ngắt Quãng (FSRS)</strong>
  </p>

  <p>
    Chinh phục vốn từ vựng tiếng Anh vững chắc dựa trên khoa học nhận thức hiện đại, luyện nghe chép chính tả YouTube tương tác và hệ thống trợ lý học tập đa nền tảng.
  </p>

  <!-- Badges -->
  <p>
    <a href="https://vocab-plus-dph.vercel.app/"><img src="https://img.shields.io/badge/Demo_Web-Live-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Demo Web" /></a>
    <a href="https://github.com/PeZoi/vocab-plus/actions"><img src="https://img.shields.io/badge/Build-Passing-10B981?style=for-the-badge&logo=github-actions&logoColor=white" alt="Trạng Thái Build" /></a>
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" /></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" /></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-Auth_%26_DB-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="Giấy phép MIT" /></a>
  </p>

  <p>
    <a href="https://vocab-plus-dph.vercel.app/"><strong>🌐 Trải Nghiệm Demo Web</strong></a> •
    <a href="#-tổng-quan-dự-án">Tổng Quan</a> •
    <a href="#-tính-năng-nổi-bật">Tính Năng Nổi Bật</a> •
    <a href="#-công-nghệ-sử-dụng">Công Nghệ Sử Dụng</a> •
    <a href="#-cấu-trúc-thư-mục">Cấu Trúc Thư Mục</a> •
    <a href="#-hướng-dẫn-cài-đặt">Cài Đặt</a> •
    <a href="#-biến-môi-trường">Biến Môi Trường</a> •
    <a href="#-cách-sử-dụng">Sử Dụng</a> •
    <a href="#-đóng-góp">Đóng Góp</a> •
    <a href="#-giấy-phép">Giấy Phép</a>
  </p>

</div>

---

## 📖 Tổng Quan Dự Án

**Vocab Plus** là nền tảng học và làm chủ từ vựng tiếng Anh hiệu năng cao được xây dựng trên nền tảng **Next.js 16 (App Router)**, **React 19** và **Supabase**.

Các ứng dụng học từ truyền thống thường phụ thuộc vào flashcard tĩnh hoặc thuật toán SM-2 ra đời từ năm 1987 đã bộc lộ nhiều điểm hạn chế. **Vocab Plus** tích hợp thuật toán **FSRS (Free Spaced Repetition Scheduler)** thế hệ mới — một mô hình toán học tiên tiến giúp mô phỏng chính xác độ ổn định của trí nhớ và khả năng truy hồi thông tin. Kết hợp cùng tính năng **luyện chép chính tả video YouTube thời gian thực**, **phân tích ngữ âm & mẹo ghi nhớ bằng AI**, cùng **trợ lý học tập Telegram Bot**, Vocab Plus chuyển hóa việc ghi nhớ thụ động thành một thói quen học tập khoa học và đầy hứng khởi.

> [!TIP]
> Giao diện được thiết kế theo ngôn ngữ **Dark Focus Theme** chuyên sâu, giúp tối ưu khả năng tập trung và chống mỏi mắt hiệu quả trong các phiên học kéo dài vào ban đêm.

---

## 🚀 Tính Năng Nổi Bật

### 🧠 Thuật Toán Lặp Lại Ngắt Quãng FSRS Tự Động Hóa (Active Recall Assessment)
- **Tối ưu hóa ghi nhớ dài hạn**: Ứng dụng mô hình toán học FSRS v5 (`ts-fsrs`), tính toán chính xác chu kỳ và khoảng cách ôn tập theo đường cong quên lãng cá nhân hóa.
- **Đánh giá phản xạ khách quan (Active Recall)**: Thay thế hoàn toàn cơ chế tự chấm điểm chủ quan truyền thống. Độ bền trí nhớ và lịch ôn tập được hệ thống tự động ghi nhận dựa trên kết quả làm bài tập thực tế tại phân hệ Ôn tập & Kiểm tra (`/practice`).
- **Đa dạng hình thức kiểm tra**: Kết hợp linh hoạt giữa Trắc nghiệm 4 đáp án, Điền khuyết từ vựng trong ngữ cảnh và Tự đặt câu chấm điểm thông minh bằng AI.
- **Hệ thống Cây Sinh Trưởng 6 Cấp Độ**: Trực quan hóa tiến trình làm chủ từ vựng từ Level 0 Hạt mầm ➔ Level 5 Đại thụ, đồng bộ trực tiếp với độ ổn định của trí nhớ và ghi nhận chuỗi ngày học liên tục (Streak 🔥).

### 🎧 Luyện Nghe & Chép Chính Tả Tương Tác Qua YouTube
- Tự động trích xuất phụ đề và bản dịch song ngữ trực tiếp từ bất kỳ liên kết video YouTube nào.
- Không gian luyện chép chính tả theo từng câu (dictation workspace), hỗ trợ điều chỉnh tốc độ âm thanh và so sánh đối chiếu lỗi sai tức thì.
- Đồng bộ hóa 1-chạm: lưu ngay các từ vựng, cụm từ hoặc thành ngữ mới học từ video vào bộ flashcard ôn tập.

### 🤖 AI Vocabulary Studio & Phân Tích Ngữ Cảnh
- Tự động bóc tách ngôn ngữ học: phiên âm chuẩn quốc tế IPA, giải nghĩa theo đúng ngữ cảnh và phân tích Collocations (cụm từ đi kèm).
- Khởi tạo mẹo nhớ từ (mnemonics) và câu ví dụ thực tế được cá nhân hóa theo trình độ của người học.
- Tự động liên kết hình ảnh trực quan minh họa ngữ nghĩa thông qua tích hợp API Pexels.

### 📖 Học Từ Vựng Qua Ngữ Cảnh Câu Chuyện (Story Learning)
- Tận dụng sức mạnh AI để sáng tác các đoạn văn, mẩu truyện ngắn lồng ghép tự nhiên các từ vựng bạn đang cần học, giúp hiểu sâu ngữ cảnh sử dụng thực tế.

### 🏆 Gamification & Giải Đấu Bảng Xếp Hạng Tuần
- Hệ thống bảng xếp hạng giải đấu tuần cạnh tranh, cơ chế tích lũy điểm kinh nghiệm (XP) và duy trì chuỗi ngày học liên tục (Streak).
- **Khung Giờ Vàng (UTC+7)**: Nhân đôi điểm thưởng XP trong các khung giờ vàng buổi sáng và buổi tối để thúc đẩy thói quen tự giác.

### 📱 Trợ Lý Học Tập Cá Nhân Qua Telegram Bot
- Liên kết tài khoản trực tiếp với bot Telegram cá nhân (`@vocabdph_bot`).
- Tự động gửi thông báo 1-1 nhắc nhở danh sách thẻ đến hạn ôn, cảnh báo bảo vệ chuỗi Streak và gửi các câu đố micro-review nhanh ngay trong Telegram.

### 🛡️ Trang Quản Trị Hệ Thống Toàn Diện (Admin Dashboard)
- Quản lý người dùng, kiểm duyệt danh mục từ vựng, cấu hình nhà cung cấp AI và điều phối thông báo hệ thống tập trung.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Phân Vùng | Công Nghệ & Thư Viện Cốt Lõi |
| :--- | :--- |
| **Framework & Ngôn Ngữ** | ![Next.js](https://img.shields.io/badge/Next.js_16-black?logo=next.js) ![React](https://img.shields.io/badge/React_19-20232A?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?logo=typescript) |
| **Giao Diện & Chuyển Động** | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?logo=tailwindcss) ![Motion](https://img.shields.io/badge/Motion-FF0055?logo=framer) `tw-animate-css` `lucide-react` |
| **UI Primitives & Toast** | `@base-ui/react` `@radix-ui/react-select` `sonner` |
| **Backend & Cơ Sở Dữ Liệu** | ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase) (PostgreSQL, Google OAuth PKCE, SSR Cookies với `@supabase/ssr`) |
| **Quản Lý State & Gọi API** | ![TanStack Query](https://img.shields.io/badge/TanStack_Query_v5-FF4154?logo=react-query) ![Zustand](https://img.shields.io/badge/Zustand-443E38) `axios` |
| **Thuật Toán SRS** | `ts-fsrs` (Free Spaced Repetition Scheduler v5) |
| **Biểu Mẫu & Xác Thực Dữ Liệu** | `zod` `react-hook-form` `@hookform/resolvers` |
| **Tích Hợp Dịch Vụ Ngoài** | YouTube Innertube / Trích xuất Subtitle, Pexels API, Telegram Bot API |

---

## 📂 Cấu Trúc Thư Mục Chuẩn

Dự án tuân thủ nghiêm ngặt mô hình **Next.js App Router** kết hợp kiến trúc **Skinny Components, Fat Hooks**:

```
vocab-plus/
├── app/                  # Next.js App Router (Routing, Layouts, Route Handlers)
│   ├── (auth)/           # Luồng xác thực đăng nhập Google OAuth
│   ├── (main)/           # Giao diện chính: review, listening, vocab, leaderboard, story
│   ├── (admin)/          # Cổng quản trị: quản lý users, cards, AI providers, telegram
│   └── api/              # Internal API endpoints & Webhooks
├── components/           # UI Components
│   ├── ui/               # Primitives & Design tokens (Button, Dialog, Input...)
│   ├── common/           # Thành phần tái sử dụng (AudioButton, EmptyState, StatCard)
│   ├── layouts/          # Header, AppSidebar, MobileBottomNav
│   └── features/         # Component theo domain nghiệp vụ (review, cards, listening)
├── hooks/                # Custom React Hooks tách biệt logic và server state
├── services/             # Lớp giao tiếp API tập trung (Axios Instance & Supabase)
├── lib/                  # Khởi tạo thư viện cốt lõi (FSRS, Axios, Supabase SSR)
├── stores/               # Zustand Global Stores (Chỉ quản lý UI/Client state)
├── types/                # Định nghĩa kiểu dữ liệu TypeScript & Database Schemas
└── utils/                # Hàm tiện ích thuần túy (FSRS helpers, formatters, similarity)
```

---

## 🏁 Hướng Dẫn Cài Đặt

### Yêu Cầu Hệ Thống

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt:
- **Node.js**: Phiên bản `v20.x` trở lên
- **Trình quản lý gói**: `npm`, `pnpm`, hoặc `yarn`
- **Git**
- Một tài khoản và dự án **Supabase** (đã kích hoạt Database & Google OAuth)

### Các Bước Cài Đặt

1. **Clone kho lưu trữ về máy:**
   ```bash
   git clone https://github.com/PeZoi/vocab-plus.git
   cd vocab-plus
   ```

2. **Cài đặt các gói phụ thuộc (dependencies):**
   ```bash
   npm install
   ```

3. **Thiết lập biến môi trường:**
   Tạo tệp `.env.local` từ mẫu có sẵn:
   ```bash
   cp .env.example .env.local
   ```

---

## 🔐 Biến Môi Trường (.env.local)

Điền các thông số tương ứng vào tệp `.env.local` của bạn:

| Tên Biến | Mô Tả | Bắt Buộc | Giá Trị Ví Dụ |
| :--- | :--- | :---: | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Đường dẫn kết nối dự án Supabase | **Có** | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Khóa công khai (publishable/anon key) của Supabase | **Có** | `sb_publishable_YMvSKo...` |
| `NEXT_PUBLIC_APP_URL` | Địa chỉ gốc của ứng dụng (dùng cho callback OAuth) | **Có** | `http://localhost:3999` |
| `PEXELS_API_KEY` | Khóa API Pexels dùng tự động tìm ảnh minh họa cho thẻ từ | Không | `your-pexels-api-key` |
| `CRON_SECRET` | Mã bí mật bảo mật cho API chốt sổ bảng xếp hạng tuần | Không | `your-cron-secret-key` |
| `TELEGRAM_BOT_TOKEN` | Token Bot Telegram cấp từ [@BotFather](https://t.me/BotFather) | Không | `123456789:ABCdefGhI...` |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | Username của bot Telegram | Không | `vocabdph_bot` |

---

## 💻 Cách Sử Dụng & Lệnh Chạy

### Chạy Môi Trường Phát Triển (Dev)
```bash
npm run dev
```
Truy cập trình duyệt tại địa chỉ: [http://localhost:3999](http://localhost:3999) để trải nghiệm ứng dụng.

### Đóng Gói & Chạy Bản Production
```bash
npm run build
npm run start
```

### Kiểm Tra Lỗi Code & Định Dạng (Linting)
```bash
npm run lint
```

---

## 📸 Giao Diện & Trải Nghiệm Thực Tế (Screenshots)

### 1. Tổng Quan & Trải Nghiệm Học Tập Cốt Lõi
<div align="center">
  <table width="100%">
    <tr>
      <td width="50%" align="center">
        <strong>Bảng Điều Khiển Tổng Quan (Dashboard)</strong><br />
        <sub>Theo dõi Heatmap học tập 52 tuần, chuỗi Streak và dự báo lượt ôn tập 7 ngày tới</sub><br /><br />
        <img src="https://github.com/user-attachments/assets/73fbc0eb-c8f0-470a-9a45-76158337c6de" alt="Bảng Điều Khiển Tổng Quan" width="100%" />
      </td>
      <td width="50%" align="center">
        <strong>Không Gian Ôn Tập Flashcard FSRS</strong><br />
        <sub>Học tập tập trung với phím tắt chuyên nghiệp [Space], [Ctrl] và cơ chế nhận thức FSRS</sub><br /><br />
        <img src="https://github.com/user-attachments/assets/b225d536-3b0a-4806-b050-96aa7641fb56" alt="Không Gian Ôn Tập Flashcard FSRS" width="100%" />
      </td>
    </tr>
    <tr>
      <td width="50%" align="center">
        <strong>Bài Kiểm Tra Tổng Hợp 3 Hình Thức</strong><br />
        <sub>Tùy chỉnh linh hoạt: Trắc nghiệm 4 đáp án, Điền khuyết ngữ cảnh và Tự đặt câu chấm bằng AI</sub><br /><br />
        <img src="https://github.com/user-attachments/assets/abcd70b4-f026-45a6-b2bb-cf85b592abab" alt="Bài Kiểm Tra Tổng Hợp" width="100%" />
      </td>
      <td width="50%" align="center">
        <strong>Luyện Tập Điền Khuyết Ngữ Cảnh</strong><br />
        <sub>Điền từ vào câu văn đời thực với gợi ý số lượng ký tự, bản dịch và phản hồi tức thì</sub><br /><br />
        <img src="https://github.com/user-attachments/assets/7e9e148d-484d-4a07-9d46-c702ee837f32" alt="Luyện Tập Điền Khuyết Ngữ Cảnh" width="100%" />
      </td>
    </tr>
  </table>
</div>

### 2. Luyện Nghe Chủ Động & Chép Chính Tả YouTube
<div align="center">
  <table width="100%">
    <tr>
      <td width="50%" align="center">
        <strong>Phòng Luyện Nghe Podcast YouTube</strong><br />
        <sub>Tự động biến video YouTube thành bài tập chép chính tả 3 cấp độ (Dễ, Vừa, Khó)</sub><br /><br />
        <img src="https://github.com/user-attachments/assets/9698bddb-9af7-46f0-befd-77acfa23350d" alt="Phòng Luyện Nghe Podcast YouTube" width="100%" />
      </td>
      <td width="50%" align="center">
        <strong>Không Gian Chép Chính Tả Tương Tác</strong><br />
        <sub>Tua chậm 0.75x - 1.25x, lặp đoạn A-B, Mẹo nối âm AI và tính năng Luyện nói Shadowing</sub><br /><br />
        <img src="https://github.com/user-attachments/assets/3fa2d1e0-bd13-46b2-a859-f139836f8379" alt="Không Gian Chép Chính Tả Tương Tác" width="100%" />
      </td>
    </tr>
  </table>
</div>

### 3. Kho Từ Vựng Cá Nhân & AI Vocabulary Studio
<div align="center">
  <table width="100%">
    <tr>
      <td width="50%" align="center">
        <strong>AI Vocabulary Studio (Thêm từ bằng AI)</strong><br />
        <sub>Tự động phân tích IPA, các tầng nghĩa, Collocations, Mẹo nhớ Mnemonic và ảnh Pexels</sub><br /><br />
        <img src="https://github.com/user-attachments/assets/8cace2d9-a028-4503-9770-ac34b84010d8" alt="AI Vocabulary Studio" width="100%" />
      </td>
      <td width="50%" align="center">
        <strong>Kho Từ Vựng Cá Nhân (Grid View)</strong><br />
        <sub>Bộ lọc đa chiều CEFR (A1-C2), thẻ tags, cấp độ Cây sinh trưởng và ôn tập theo nhóm từ</sub><br /><br />
        <img src="https://github.com/user-attachments/assets/6aa65485-7300-4722-9b05-5d16a14dd378" alt="Kho Từ Vựng Cá Nhân" width="100%" />
      </td>
    </tr>
    <tr>
      <td width="50%" align="center">
        <strong>Chi Tiết Từ Vựng & Chỉ Số Trí Nhớ FSRS</strong><br />
        <sub>Xem chi tiết cấp độ tiến hóa Cây sinh trưởng, độ ổn định trí nhớ và lịch sử ôn tập FSRS</sub><br /><br />
        <img src="https://github.com/user-attachments/assets/507dd5b2-903d-4511-8708-231111580f54" alt="Chi Tiết Từ Vựng & Chỉ Số Trí Nhớ FSRS" width="100%" />
      </td>
      <td width="50%" align="center">
        <strong>Bộ Sưu Tập & Thư Viện Cộng Đồng</strong><br />
        <sub>Quản lý bộ từ cá nhân và khám phá các chủ đề: IELTS, TOEIC, Giao tiếp, Kinh doanh...</sub><br /><br />
        <img src="https://github.com/user-attachments/assets/bed7cae8-a780-40de-8df9-7c49cc15e6a7" alt="Bộ Sưu Tập & Thư Viện Cộng Đồng" width="100%" />
      </td>
    </tr>
    <tr>
      <td colspan="2" align="center">
        <strong>Chi Tiết Bộ Sưu Tập Từ Vựng</strong><br />
        <sub>Công cụ ôn tập tập trung theo bộ thẻ, chia sẻ liên kết công khai và clone bộ từ vựng</sub><br /><br />
        <img src="https://github.com/user-attachments/assets/c0c2331b-bf62-4706-9dbc-93a754ebff48" alt="Chi Tiết Bộ Sưu Tập Từ Vựng" width="75%" />
      </td>
    </tr>
  </table>
</div>

### 4. Học Qua Ngữ Cảnh Truyện & Đọc Hiểu AI
<div align="center">
  <table width="100%">
    <tr>
      <td width="50%" align="center">
        <strong>Tạo Câu Chuyện Bằng AI (Story Creator)</strong><br />
        <sub>Tự động sáng tác truyện ngắn theo trình độ CEFR và lồng ghép khéo léo từ vựng trong kho</sub><br /><br />
        <img src="https://github.com/user-attachments/assets/19a567a7-cc41-4b81-ba30-f9256d9ca292" alt="Tạo Câu Chuyện Bằng AI" width="100%" />
      </td>
      <td width="50%" align="center">
        <strong>Trình Đọc Tương Tác & Bài Tập Đọc Hiểu AI</strong><br />
        <sub>Chạm để tra từ trực tiếp trong bài đọc và giải bộ câu hỏi đọc hiểu thông minh do AI chấm</sub><br /><br />
        <img src="https://github.com/user-attachments/assets/75b91632-21fc-496e-9aeb-de58a84142fb" alt="Trình Đọc Tương Tác & Bài Tập Đọc Hiểu AI" width="100%" />
      </td>
    </tr>
  </table>
</div>

### 5. Gamification & Đấu Trường Bảng Xếp Hạng
<div align="center">
  <table width="100%">
    <tr>
      <td align="center">
        <strong>Bảng Xếp Hạng & Bậc Rank Mùa Giải (Leaderboard)</strong><br />
        <sub>Đấu trường thi đua học tập: Phân hạng Bậc Rank (Sắt, Đồng...), mốc thăng/trụ hạng và bục vinh danh Quán Quân</sub><br /><br />
        <img src="https://github.com/user-attachments/assets/bb3fc2c0-28a2-4dc0-bc27-e84f0f0fab1b" alt="Bảng Xếp Hạng & Bậc Rank Mùa Giải" width="75%" />
      </td>
    </tr>
  </table>
</div>

### 6. Bảng Điều Khiển Quản Trị Hệ Thống (Admin Control Panel)
<div align="center">
  <table width="100%">
    <tr>
      <td width="50%" align="center">
        <strong>Quản Lý Người Dùng & Học Viên</strong><br />
        <sub>Phân quyền vai trò (Admin / Học viên), theo dõi chuỗi Streak, tổng XP và can thiệp Reset Streak</sub><br /><br />
        <img src="https://github.com/user-attachments/assets/dcb0ab37-9667-4dd0-a4df-76041e77bb5e" alt="Quản Lý Người Dùng" width="100%" />
      </td>
      <td width="50%" align="center">
        <strong>Cấu Hình AI Hệ Thống Toàn Diện</strong><br />
        <sub>Tùy chỉnh LLM (Groq Llama 3.3 70B, OrcaRouter, Kira AI), kiểm tra kết nối Live Ping và Fallback</sub><br /><br />
        <img src="https://github.com/user-attachments/assets/2d70af0c-b597-48de-b709-199d3ded7588" alt="Cấu Hình AI Hệ Thống" width="100%" />
      </td>
    </tr>
    <tr>
      <td width="50%" align="center">
        <strong>Cấu Hình Smart Fork & Live Tester</strong><br />
        <sub>Thuật toán phát hiện từ vựng trùng lặp, Live Tester so khớp thông minh các biến thể ngữ pháp</sub><br /><br />
        <img src="https://github.com/user-attachments/assets/29014a10-f68a-4dbd-b493-bfd079f4f342" alt="Cấu Hình Smart Fork & Live Tester" width="100%" />
      </td>
      <td width="50%" align="center">
        <strong>Cấu Hình Cấp Độ Cây Sinh Trưởng</strong><br />
        <sub>Tùy biến 6 cấp độ tiến hóa từ vựng (Level 0 Hạt mầm → Level 5 Đại thụ) và quy tắc phạt câu sai</sub><br /><br />
        <img src="https://github.com/user-attachments/assets/fb541e64-f745-4512-8af4-a7783c208c68" alt="Cấu Hình Cấp Độ Cây Sinh Trưởng" width="100%" />
      </td>
    </tr>
    <tr>
      <td colspan="2" align="center">
        <strong>Quản Lý Dynamic Cron Jobs (pg_cron Native)</strong><br />
        <sub>Lập lịch và giám sát tác vụ PostgreSQL tự động: Chốt rank tuần, dọn dẹp log và nhắc nhở Telegram 30 phút/lần</sub><br /><br />
        <img src="https://github.com/user-attachments/assets/52bd75de-ff1b-4667-a5e1-a283b13e50f4" alt="Quản Lý Dynamic Cron Jobs" width="75%" />
      </td>
    </tr>
  </table>
</div>

---

## 🤝 Hướng Dẫn Đóng Góp (Contributing)

Mọi đóng góp từ cộng đồng nhằm phát triển dự án ngày càng hoàn thiện hơn đều được chào đón nồng nhiệt!

1. **Fork** dự án về tài khoản GitHub của bạn.
2. Tạo một nhánh tính năng mới (`feature branch`):
   ```bash
   git checkout -b feat/tinh-nang-moi
   ```
3. Commit các thay đổi (khuyến khích chuẩn [Conventional Commits](https://www.conventionalcommits.org/)):
   ```bash
   git commit -m 'feat: them tinh nang luyen phat am ai'
   ```
4. Đẩy mã nguồn lên nhánh của bạn:
   ```bash
   git push origin feat/tinh-nang-moi
   ```
5. Mở một yêu cầu kéo (**Pull Request**) trên GitHub.

---

## 📄 Giấy Phép (License)

Dự án được phân phối dưới giấy phép **MIT License**. Xem thêm chi tiết tại tệp [`LICENSE`](LICENSE).

---

## 📬 Liên Hệ & Tác Giả

**PeZoi**
- **Demo Web Trực Tuyến:** [https://vocab-plus-dph.vercel.app/](https://vocab-plus-dph.vercel.app/)
- **Email:** [pezoiks1@gmail.com](mailto:pezoiks1@gmail.com)
- **GitHub:** [@PeZoi](https://github.com/PeZoi)
- **Kho lưu trữ:** [https://github.com/PeZoi/vocab-plus](https://github.com/PeZoi/vocab-plus)

<div align="center">
  <sub>Được phát triển với tất cả tâm huyết dành cho cộng đồng học ngoại ngữ. ❤️</sub>
</div>

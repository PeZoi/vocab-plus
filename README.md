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
    <a href="https://github.com/PeZoi/vocab-plus/actions"><img src="https://img.shields.io/badge/Build-Passing-10B981?style=for-the-badge&logo=github-actions&logoColor=white" alt="Trạng Thái Build" /></a>
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" /></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" /></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-Auth_%26_DB-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="Giấy phép MIT" /></a>
  </p>

  <p>
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

### 🧠 Thuật Toán Lặp Lại Ngắt Quãng FSRS Thế Hệ Mới
- Ứng dụng thư viện `ts-fsrs` (v5), vượt trội hơn thuật toán cổ điển SM-2 nhờ tính toán khoảng cách ôn tập chuẩn xác dựa trên đường cong quên lãng của từng cá nhân.
- Cơ chế đánh giá nhận thức 4 mức độ trực quan: `Again` (Quên), `Hard` (Khó), `Good` (Nhớ), và `Easy` (Dễ).
- Tự động lên lịch thẻ cần ôn, theo dõi lịch sử ổn định trí nhớ và tỷ lệ duy trì kiến thức theo thời gian thực.

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

## 📸 Giao Diện & Hình Ảnh Minh Họa

<!-- Khu vực hình ảnh minh họa ứng dụng -->
<div align="center">
  <table width="100%">
    <tr>
      <td width="50%" align="center">
        <h4>Không Gian Ôn Tập Flashcard FSRS</h4>
        <!-- [Chèn ảnh chụp màn hình / GIF minh họa tại đây] -->
        <img src="https://placehold.co/800x450/131a26/eef2f6?text=FSRS+Review+Workspace+Mockup" alt="Không Gian Ôn Tập FSRS" width="100%" />
      </td>
      <td width="50%" align="center">
        <h4>Luyện Nghe & Chép Chính Tả YouTube</h4>
        <!-- [Chèn ảnh chụp màn hình / GIF minh họa tại đây] -->
        <img src="https://placehold.co/800x450/131a26/eef2f6?text=YouTube+Dictation+Practice" alt="Luyện Nghe Chép Chính Tả" width="100%" />
      </td>
    </tr>
    <tr>
      <td width="50%" align="center">
        <h4>Giải Đấu Tuần & Chuỗi Ngày Học (Streak)</h4>
        <!-- [Chèn ảnh chụp màn hình / GIF minh họa tại đây] -->
        <img src="https://placehold.co/800x450/131a26/eef2f6?text=Leaderboard+%26+Streak+Tracking" alt="Bảng Xếp Hạng & Chuỗi Ngày" width="100%" />
      </td>
      <td width="50%" align="center">
        <h4>AI Vocabulary Studio</h4>
        <!-- [Chèn ảnh chụp màn hình / GIF minh họa tại đây] -->
        <img src="https://placehold.co/800x450/131a26/eef2f6?text=AI+Vocabulary+Analyzer" alt="Phân Tích Từ Vựng Bằng AI" width="100%" />
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
- **Email:** [pezoiks1@gmail.com](mailto:pezoiks1@gmail.com)
- **GitHub:** [@PeZoi](https://github.com/PeZoi)
- **Kho lưu trữ:** [https://github.com/PeZoi/vocab-plus](https://github.com/PeZoi/vocab-plus)

<div align="center">
  <sub>Được phát triển với tất cả tâm huyết dành cho cộng đồng học ngoại ngữ. ❤️</sub>
</div>

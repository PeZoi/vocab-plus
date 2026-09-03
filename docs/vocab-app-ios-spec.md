# 📱 Đặc Tả Sản Phẩm — Vocab App (Phiên bản iOS)

> Stack: **SwiftUI** + **Supabase Swift SDK** — cùng backend với bản Web
> Nguyên tắc: **App iOS không viết lại logic nghiệp vụ** — mọi thứ (FSRS, AI, Telegram) đã nằm ở Supabase Edge Functions, app iOS chỉ là client gọi API + xử lý offline/native features
> Ngôn ngữ học: **Tiếng Anh** | Giao diện: Tiếng Việt

---

## 1. Tổng quan

Bản iOS kế thừa 100% dữ liệu và tài khoản từ bản Web (cùng Supabase project). Vai trò chính của bản iOS:
1. Trải nghiệm mượt hơn trên di động (offline-first)
2. Tận dụng phần cứng/API native mà bản Web **không có**: **chấm điểm phát âm chính xác** (Speech framework) — đây là tính năng luyện phát âm **chỉ có trên iOS**, bản Web không triển khai phần này — và thông báo/nhắc nhở mượt hơn qua widget, haptic feedback
3. Đồng bộ real-time với bản Web qua Supabase

**Không làm trong app iOS**: Trang Admin (chỉ quản trị qua Web) — vì admin panel là công cụ nội bộ, không cần thiết trên mobile.

---

## 2. Design System — đồng bộ với bản Web ("Deep Focus")

### 2.1 Color Assets (Asset Catalog)

Đưa toàn bộ token dưới đây vào `Assets.xcassets` dạng Color Set, mỗi color set có **1 giá trị duy nhất cho Dark Mode** (app mặc định tối, không theo Light Mode hệ thống — vì đây là lựa chọn thiết kế chủ đích "muốn tối").

| Color Set name | Hex | Vai trò |
|---|---|---|
| `BGBase` | `#0B0F17` | Nền chính |
| `BGSurface` | `#131A26` | Card/panel |
| `BGSurfaceHover` | `#1B2333` | Trạng thái nhấn/pressed |
| `BorderColor` | `#232B3A` | Viền, divider |
| `TextPrimary` | `#E7EAF0` | Chữ chính |
| `TextSecondary` | `#8B94A7` | Chữ phụ |
| `BrandPrimary` | `#6366F1` | Accent chính |
| `BrandPrimaryHover` | `#818CF8` | Trạng thái nhấn của brand |
| `SuccessColor` | `#10B981` | Đúng / thành thạo |
| `WarningColor` | `#F59E0B` | Từ khó / leech |
| `DangerColor` | `#F43F5E` | Sai |
| `InfoColor` | `#38BDF8` | Thông báo |

```swift
// Color+Theme.swift
extension Color {
    static let bgBase = Color("BGBase")
    static let bgSurface = Color("BGSurface")
    static let brandPrimary = Color("BrandPrimary")
    static let success = Color("SuccessColor")
    static let warning = Color("WarningColor")
    static let danger = Color("DangerColor")
    // ...
}
```

### 2.2 Typography

- Dùng **Sora** (heading) và **Be Vietnam Pro** (body) — nhúng làm Custom Fonts trong bundle (cả 2 đều free, tải từ Google Fonts, cần add vào `Info.plist` → `UIAppFonts`)
- Text style theo Dynamic Type để hỗ trợ Accessibility (người dùng lớn tuổi học từ vựng cũng cần đọc rõ)

### 2.3 Component style

- Card: `RoundedRectangle(cornerRadius: 20)`, background `.bgSurface`, không border cứng, dùng `shadow(color: .brandPrimary.opacity(0.25), radius: 20)` cho hiệu ứng "glow" nhẹ khi card active
- Nút chính: bo góc 14, gradient `LinearGradient` từ `BrandPrimary` → `InfoColor` cho CTA quan trọng (vd: nút "Bắt đầu ôn tập")
- Feedback khi review: dùng `UINotificationFeedbackGenerator` (haptic) kết hợp flash màu `success`/`danger` — tận dụng lợi thế native mà web không có

---

## 3. Kiến trúc App

**Pattern**: MVVM + Repository pattern, offline-first.

```
View (SwiftUI)
   │
   ▼
ViewModel (ObservableObject)
   │
   ▼
Repository ── local cache (SwiftData) ◄──► Sync Engine ──► Supabase (Postgres/Auth/Edge Fn)
```

- **SwiftData** (framework native của Apple, free, thay thế Core Data) làm local cache: lưu card, user_cards (FSRS state), review_logs chưa sync
- **Sync Engine**: khi có mạng, đẩy các review chưa sync lên Supabase; kéo về các thay đổi mới (vd: card mới thêm từ bản Web) — dùng Supabase Realtime subscription để nhận thay đổi tức thời khi có mạng

### 3.1 Vì sao cần Offline-first
Học từ vựng thường diễn ra lúc di chuyển, chờ đợi — không phải lúc nào cũng có mạng ổn định. App phải cho phép review **hoàn toàn offline**, và tự đồng bộ khi có mạng trở lại.

---

## 4. Local Data Model (SwiftData)

```swift
@Model
final class LocalCard {
    @Attribute(.unique) var id: UUID
    var word: String
    var partOfSpeech: String?
    var ipa: String?
    var definition: String
    var exampleSentence: String?
    var audioURL: String?
    var imageURL: String?
    var mnemonic: String?
}

@Model
final class LocalUserCard {
    @Attribute(.unique) var id: UUID
    var cardID: UUID
    var stability: Double
    var difficulty: Double
    var dueAt: Date
    var reviewCount: Int
    var lapseCount: Int = 0
    var isLeech: Bool = false
    var state: String
    var needsSync: Bool = false
}

@Model
final class LocalCollocation {
    @Attribute(.unique) var id: UUID
    var cardID: UUID
    var phrase: String
    var exampleSentence: String?
}

@Model
final class LocalWordFamily {
    @Attribute(.unique) var id: UUID
    var rootCardID: UUID
    var formWord: String
    var partOfSpeech: String
}

@Model
final class LocalMinimalPair {
    @Attribute(.unique) var id: UUID
    var wordA: String
    var audioAURL: String
    var wordB: String
    var audioBURL: String
}

@Model
final class LocalReviewLog {
    @Attribute(.unique) var id: UUID
    var cardID: UUID
    var rating: Int
    var reviewedAt: Date
    var responseMs: Int
    var synced: Bool = false
}
```

---

## 5. Tính năng theo Phase (chỉ liệt kê tính năng CHẮC CHẮN làm)

### 🟦 Phase 1 — Nền tảng & Core SRS (offline-first)
- Đăng nhập (dùng chung tài khoản Supabase Auth với bản Web — Sign in with Apple + Email)
- Đồng bộ card & tiến độ học từ Supabase về SwiftData khi mở app lần đầu
- Review flow: card front/back với swipe gesture (trái = Again, phải = Good, hoặc 4 nút tùy chọn), hoạt động **hoàn toàn offline**, tự tính trạng thái theo thuật toán **FSRS** — chính là phương pháp **Lặp lại ngắt quãng (Spaced Repetition)** hiện đại — tại local để không phụ thuộc mạng khi review
- Dashboard: streak, due hôm nay, forecast — đọc từ local cache, không cần chờ mạng
- Thêm/sửa/xóa card thủ công — hoạt động hoàn toàn offline (chi tiết 2 chế độ nhập ở mục 1.x ngay dưới đây)

**1.x. Thêm từ vựng mới — 2 chế độ: Thủ công & AI tự động phân tích**

Màn hình "Thêm từ" mở dạng `.sheet`, có `Picker` kiểu segmented ở trên để chuyển giữa 2 chế độ, dùng chung 1 `Form` bên dưới.

**Chế độ 1 — Nhập thủ công**
- `Form` SwiftUI: Từ/cụm từ (*), Từ loại (`Picker`: danh từ/động từ/tính từ/trạng từ/giới từ/liên từ/đại từ/thán từ), IPA (optional), Nghĩa (*), Câu ví dụ (optional), Ảnh (chọn qua `PhotosPicker` hoặc bỏ qua), Audio (tự sinh bằng `AVSpeechSynthesizer`, không cần upload tay)
- Bắt buộc tối thiểu `word` + `definition`, còn lại optional
- Hoạt động **hoàn toàn offline**: lưu thẳng vào `LocalCard` (SwiftData), đánh dấu `needsSync = true`, đẩy lên Supabase khi có mạng qua Sync Engine (mục 7)
- Dùng khi: user đã chắc nghĩa/cách dùng, muốn nhập nhanh lúc không có mạng, hoặc muốn tự sửa lại sau khi thấy kết quả AI ở Chế độ 2 chưa ưng ý

**Chế độ 2 — AI tự động phân tích ("AI Word Analyzer")**
- Cùng flow với bản Web: gọi chung `POST /api/ai/analyze-word` — chỉ cần mạng lúc phân tích, sau khi lưu thì xem lại hoàn toàn offline
- Kết quả (`part_of_speech`, IPA, senses đa nghĩa kèm câu ví dụ **ở mức cơ bản, dễ hiểu** cho người mới học từ, collocation, word family, mnemonic) hiển thị dạng preview trong SwiftUI Sheet dùng chung layout `Form` của Chế độ 1 — mọi field đều sửa được trước khi lưu vào SwiftData + đồng bộ lên Supabase
- Nếu offline khi bấm "Phân tích bằng AI": hiển thị thông báo cần mạng (đây là 1 trong số ít thao tác bắt buộc cần kết nối, vì phải gọi AI provider) — gợi ý chuyển sang Chế độ 1 (Thủ công) để vẫn thêm được từ ngay lúc đó

### 🟩 Phase 2 — Import & Tự động phát hiện từ mới
- Màn hình paste/nhập đoạn văn bản
- Gọi Edge Function `POST /api/import/extract` (cần mạng) để tách từ mới
- Kết quả hiển thị dạng danh sách chọn (checkbox) — chọn xong bấm "Phân tích bằng AI" để gọi `POST /api/ai/analyze-word` dạng **batch** (cùng cơ chế với bản Web: tối đa ~10 từ/lần gọi, mỗi từ kèm `context_sentence` để AI ưu tiên đúng nghĩa theo câu gốc thay vì liệt kê mọi nghĩa)
- `example_sentence` mặc định lấy câu gốc trong đoạn văn đã paste; các field còn lại (`part_of_speech`, IPA, definition, collocations, word family, mnemonic) lấy từ AI, hiển thị preview dùng chung `Form` với Chế độ 1&2 ở mục 1.x, cho sửa trước khi lưu
- Lưu vào SwiftData ngay sau khi xác nhận (`source_type = 'imported'`), đánh dấu `needsSync`, đồng bộ lên Supabase khi có mạng — nếu offline lúc bấm "Phân tích bằng AI" thì lưu danh sách từ đã chọn ở trạng thái pending, tự động phân tích khi có mạng trở lại

### 🟨 Phase 3 — AI hỗ trợ học sâu
- Gọi chung Edge Functions AI (`/api/ai/mnemonic`, `/api/ai/grade-sentence`) như bản Web
- Cache kết quả AI đã tạo vào local (mnemonic, ảnh) để xem lại offline sau khi đã tạo 1 lần

### 🟧 Phase 4 — Luyện phát âm (native, đây là điểm mạnh nhất của bản iOS)
- Dùng **Speech framework** (`SFSpeechRecognizer`) — chấm điểm phát âm on-device, **miễn phí, không giới hạn, hoạt động cả offline** (khi đã tải ngôn ngữ) — vượt trội hoàn toàn so với giới hạn của Web Speech API
- So khớp văn bản nhận diện được với từ mục tiêu, tính điểm tương đồng (Levenshtein distance ở mức phoneme nếu khả thi, hoặc mức từ ở bản đầu)
- Phát âm mẫu bằng `AVSpeechSynthesizer` (native TTS, free, chất lượng giọng tốt hơn nhiều so với Web Speech API trên trình duyệt)

### 🟥 Phase 5 — Đồng bộ Telegram (không cần app tự gửi, chỉ cần liên kết)
- Màn hình Settings có nút "Kết nối Telegram" → mở Safari/deep link tới bot (giống flow bên Web) → cùng 1 bảng `profiles.telegram_chat_id` nên chỉ cần liên kết 1 lần dù từ Web hay iOS
- Việc **gửi nhắc nhở và báo cáo tuần vẫn do Edge Function + `pg_cron` phía Supabase đảm nhiệm** — app iOS không cần chạy nền để gửi thông báo (tiết kiệm pin, không cần lo Background App Refresh bị hệ điều hành giới hạn)
- App hiển thị lại "Giờ vàng" hiện tại của user trong Settings, cho phép chỉnh sửa (ghi thẳng lên `profiles.golden_hours`)

### 🔶 Phase 7 — Học sâu: Collocation, Word Family, Từ đa nghĩa, Phrasal Verbs
- Đồng bộ `collocations`, `word_families` về local (`LocalCollocation`, `LocalWordFamily`) để xem/luyện tập offline
- UI: khi mở chi tiết 1 card, thêm section "Cụm từ đi kèm" (collocation) và "Từ cùng gốc" (word family) dạng expandable, có thể tap để thêm luôn dạng biến thể vào deck học
- Từ đa nghĩa (`sense_number`) hiển thị dạng tab/segment picker nếu 1 từ có nhiều card nghĩa khác nhau
- Phrasal verbs/idioms có filter riêng trong màn hình danh sách deck (`card_type`)

### 🔷 Phase 8 — Dictation & Minimal Pairs (tận dụng thế mạnh native)
- Dictation: phát audio bằng `AVAudioPlayer`, ô nhập text, chấm bằng Levenshtein — hoạt động **hoàn toàn offline** nếu audio đã cache local
- Minimal pairs: ngoài chọn từ nghe được (giống Web), bản iOS cho phép **user tự phát âm rồi chấm bằng Speech framework** — so khớp kết quả nhận diện với từ mục tiêu để biết user có đang lẫn lộn cặp âm đó không (điểm khác biệt lớn so với bản Web)

### 🔺 Phase 9 — Leech Detection
- Cờ `isLeech` đồng bộ 2 chiều giữa local và Supabase
- Card leech hiển thị badge màu `WarningColor` trong danh sách review, có mục riêng "Từ khó" trong Dashboard (đọc local, không cần mạng)
- Khi AI sinh lại mnemonic mới cho card leech (cần mạng), kết quả được cache local để xem lại offline

### 🔻 Phase 10 — AI Mini-Story cuối tuần
- App fetch `weekly_stories` mới nhất khi có mạng, hiển thị trong tab "Ôn tập tuần", cache lại để đọc offline
- Có thể bật thông báo local (`UNUserNotificationCenter`) nhắc "Truyện tuần này đã sẵn sàng" khi story mới được tạo (nhận qua Supabase Realtime hoặc khi mở app)

### ⭐ Phase 11 — Gamification xã hội: Duel & Leaderboard
- Kết bạn, xem leaderboard: cần mạng (dữ liệu xã hội không cache offline vì cần tính realtime)
- Duel: dùng Supabase Realtime để 2 người chơi thấy điểm số của nhau cập nhật trực tiếp trong lúc thi đấu
- Kết quả duel/leaderboard cập nhật XP cũng được gửi thông báo qua Telegram (do Edge Function xử lý, không cần app iOS tự gửi)

### 🔲 Phase 12 — Widget màn hình khóa (iOS-only, không có ở bản Web)
- Dùng **WidgetKit** (framework native, miễn phí) — tạo Lock Screen Widget (iOS 16+) và Home Screen Widget
- Hiển thị: số từ đang `due` hôm nay, hoặc xoay vòng hiển thị 1 từ ngẫu nhiên cần ôn kèm nghĩa rút gọn
- Dữ liệu đọc trực tiếp từ SwiftData local cache (qua App Group để widget extension truy cập chung container với app chính) — **không cần gọi mạng** để hiển thị, refresh theo `WidgetKit Timeline` (vd mỗi 1-2 giờ)
- Tap vào widget mở thẳng app vào màn hình Review (deep link nội bộ)

---

## 6. Chi phí & Free Tier — Bảng theo dõi (riêng phần iOS)

| Hạng mục | Free tier | Giới hạn | Rủi ro phát sinh phí | Phương án |
|---|---|---|---|---|
| **Xcode + Swift/SwiftUI** | Hoàn toàn miễn phí | — | Không | — |
| **Chạy thử trên máy cá nhân** | Free (Apple ID thường, không cần Developer Program) | App tự hết hạn cài đặt sau **7 ngày**, phải cài lại qua Xcode | Không tốn phí, chỉ bất tiện | Chấp nhận trong giai đoạn dev |
| **Apple Developer Program** | ❌ Không có free tier | Bắt buộc để: phát hành App Store, dùng TestFlight, Push Notification (APNs) production | **$99/năm — đây là chi phí KHÔNG THỂ TRÁNH** nếu muốn launch public trên App Store | Không có phương án free thay thế nếu muốn phát hành chính thức |
| **Speech framework / AVSpeechSynthesizer** | Miễn phí, on-device | Cần thiết bị/simulator hỗ trợ tải gói ngôn ngữ | Không | — |
| **Supabase Swift SDK** | Miễn phí (open-source) | Dùng chung hạn mức Supabase Free với bản Web | Xem bảng ở file Web | — |
| **Push Notification (APNs)** | Miễn phí | Cần Apple Developer Program để lấy chứng chỉ | Gộp vào chi phí $99/năm ở trên | — |
| **WidgetKit + App Group** | Miễn phí | App Group cần bundle ID đăng ký qua Developer Program để phát hành chính thức | Gộp vào chi phí $99/năm ở trên (không phát sinh thêm) | — |

⚠️ **Lưu ý duy nhất về chi phí không tránh được**: **Apple Developer Program $99/năm** — bắt buộc nếu muốn app xuất hiện trên App Store. Trong giai đoạn phát triển/test cá nhân, có thể dùng Xcode free để cài trực tiếp lên máy mình mà chưa cần trả phí này.

---

## 7. Chiến lược đồng bộ (Sync Strategy)

1. **Khi mở app**: kiểm tra kết nối mạng → nếu có, pull thay đổi mới từ Supabase (card mới, cập nhật từ Web) qua Realtime subscription hoặc fetch incremental theo `updated_at`
2. **Khi review**: ghi thẳng vào SwiftData trước (instant, không chờ mạng), đánh dấu `needsSync = true`
3. **Background sync**: dùng `BGAppRefreshTask` để đẩy dữ liệu pending lên Supabase khi có cơ hội (không phụ thuộc hoàn toàn vào việc này vì iOS giới hạn tần suất chạy nền — sync chủ động khi mở app vẫn là chính)
4. **Conflict resolution**: vì FSRS state chỉ tăng tiến (review sau luôn mới hơn), dùng chiến lược "last write wins" theo `reviewed_at` — đơn giản và đủ dùng cho use case này

---

## 8. Yêu cầu phi chức năng

- **Offline-first bắt buộc** cho luồng review — đây là khác biệt cốt lõi so với bản Web
- **Hiệu năng**: review flow phải phản hồi tức thời (< 100ms) vì đọc/ghi local, không chờ network
- **Pin**: hạn chế đánh thức app chạy nền — để việc gửi nhắc nhở cho Supabase Edge Function xử lý hoàn toàn, app chỉ cần nhận push khi cần
- **Accessibility**: hỗ trợ Dynamic Type, VoiceOver cho các thành phần chính (đặc biệt quan trọng vì đây là app học tập)

---

## 9. Gợi ý mốc triển khai (Milestones)

| Mốc | Nội dung |
|---|---|
| M1 | Đăng nhập chung tài khoản + đồng bộ card cơ bản + review offline hoạt động |
| M2 | Import & auto-detect (cần mạng) + AI Word Analyzer chạy batch |
| M3 | AI mnemonic/ảnh/chấm câu (cache offline sau khi tạo) |
| M4 | Luyện phát âm native (Speech framework) — điểm khác biệt lớn nhất so với Web |
| M5 | Liên kết Telegram + hiển thị/chỉnh giờ vàng |
| M6 | Collocation, word family, từ đa nghĩa, phrasal verbs |
| M7 | Dictation + minimal pairs (có chấm phát âm bằng Speech framework) |
| M8 | Leech detection |
| M9 | AI mini-story cuối tuần |
| M10 | Gamification xã hội: duel & leaderboard |
| M11 | Widget màn hình khóa/home screen |
| M12 | Đăng ký Apple Developer Program, chuẩn bị TestFlight |
| M13 | Public launch trên App Store |

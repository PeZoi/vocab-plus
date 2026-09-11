# 📱 Đặc Tả Sản Phẩm — Vocab App (Phiên bản iOS)

> Stack: **SwiftUI** + **Supabase Swift SDK** + **SwiftData** (Local Cache) — Dùng chung 100% backend với bản Web
> Nguyên tắc: **Đảm bảo tương đương 100% tính năng với bản Web (ngoại trừ trang Admin)** — App iOS không viết lại logic nghiệp vụ nặng (FSRS, AI, Telegram nằm ở Supabase Edge Functions), app iOS là native client offline-first tận dụng tối đa phần cứng Apple
> Ngôn ngữ học: **Tiếng Anh** | Giao diện: **Tiếng Việt**

---

## 1. Tổng quan & Quan hệ với Bản Web

Bản iOS kế thừa 100% tài khoản, dữ liệu thẻ, collections và tiến độ học từ bản Web thông qua Supabase.
1. **Đồng bộ tính năng hoàn hảo với bản Web**:
   - Quản lý từ vựng theo chuẩn quốc tế **CEFR Level (A1, A2, B1, B2, C1, C2)**.
   - Mô hình tổ chức lai **Tags + Collections**: Phân loại tag cá nhân, ôn tập tùy chỉnh (Custom Study Session) và khám phá Thư viện bộ từ vựng cộng đồng với tính năng **Smart Fork & Clone** (Fuzzy matching Levenshtein + Dice, modal giải quyết trùng lặp `DuplicateResolutionSheet`, thanh tiến trình gradient `ForkLoadingModal`).
   - **Smart Contextual Reader (Native)**: Đọc văn bản, chạm/bôi đen từ để tra nhanh và lưu ngay vào kho từ kèm câu ngữ cảnh thật; tích hợp **On-device Morphological Lemmatizer ($O(1)$)** tự động nhận diện và highlight xanh lá cho cả từ gốc lẫn dạng chia thì (`bought` ↔ `buy`).
   - **AI Morphological Lemmatization & Revert Control**: AI tự động đưa từ chia thì/số nhiều về từ gốc từ điển (lemma), hỗ trợ nút đảo chiều `[↺ Giữ nguyên]` / `[↺ Dùng từ gốc]` trên UI form.
   - **Global Duplicate Prevention**: Lớp kiểm tra trùng lặp toàn cục cảnh báo tức thì khi từ sắp thêm tương đồng $\ge 80\%$ với kho từ hiện có.
   - **Phân Tách Rạch Ròi: Học Từ Vựng (Flashcard `ReviewView`) vs Ôn Tập & Kiểm Tra (Active Recall `PracticeView`) & Hệ Thống Cây Sinh Trưởng (Levels 0 ➔ 5)**:
     + **Phân hệ 1 — Học từ vựng (`ReviewView`) (Passive Input & Nạp từ mới)**: Lướt nhanh thẻ Flashcard 3D vuốt lật (Flip gesture), phát âm `AVSpeechSynthesizer`, xem nghĩa Việt & Anh, ngữ cảnh, collocations, mnemonic, ảnh minh họa. **Không có bài Quiz trắc nghiệm**, **Không gọi FSRS submit**, **Không đổi Level**, **Không tính Streak** (chỉ cộng nhẹ +1 XP/thẻ lướt xem). Tích hợp nút **⚡ "Tôi đã thuộc từ này" (Quick Master)** nhảy thẳng lên Level 2 Cây con (14 ngày). Nút CTA nổi bật *"Bắt đầu bài kiểm tra ngay ([X] từ)"* điều hướng sang `PracticeView(cardIDs: ...)`.
     + **Phân hệ 2 — Ôn tập & Kiểm tra (`PracticeView`) (Active Recall Assessment & Quyết định Level)**: Môi trường kiểm tra trí nhớ phản xạ native kết hợp 3 định dạng: Trắc nghiệm 4 đáp án (Đúng = Good 3, Sai = Again 1), Điền từ khuyết (Cloze Deletion) và Viết câu chấm điểm AI. Trọng tài khách quan duy nhất quyết định cập nhật FSRS on-device qua SwiftData, kích hoạt thăng/hạ cấp Cây Sinh Trưởng và **ghi nhận Chuỗi ngày học liên tục (Streak 🔥)**. Hỗ trợ tính năng **Ôn tập ngay (Fast-Track Due Cards)** 1-tap cho các từ đến hạn FSRS.
     + **Hệ thống Cây Sinh Trưởng Lottie-iOS (0 ➔ 5)**: Hạt mầm ➔ Nảy mầm ➔ Cây con ➔ Cây xanh ➔ Nở hoa ➔ Đại thụ, hiển thị hoạt ảnh Lottie vector 60fps qua framework `Lottie-iOS` (Airbnb), chuẩn hóa ngưỡng số lần đúng và cơ chế bảo vệ Đại thụ.
   - **Kho từ vựng & Quản lý từ vựng Native**: Tìm kiếm tức thì, thanh lọc ngang, vuốt để phát âm / sửa / xóa, tích hợp **Chế độ chọn & Thao tác hàng loạt (Selection Mode & Bulk Actions)** với cơ chế chống tap nhầm, hoạt động 100% offline qua SwiftData.
   - **Dual-Coding Image Picker**: Tìm kiếm và gắn ảnh minh họa độ nét cao từ Pexels API kết hợp Photo Library.
2. **Thế mạnh độc quyền native của bản iOS**:
   - **Chấm điểm phát âm chuẩn xác (Speech Framework)**: On-device, không tốn phí, không giới hạn số lần luyện tập.
   - **Offline-First toàn diện**: Toàn bộ dữ liệu thẻ, bộ sưu tập cá nhân, thuật toán FSRS và phiên ôn tập đều chạy trơn tru khi không có kết nối Internet thông qua **SwiftData**.
   - **WidgetKit**: Widget hiển thị **"Khu vườn từ vựng" (Vocabulary Garden)** trực quan hóa số cây ở từng cấp độ và từ vựng cần ôn theo Collection hoặc CEFR Level ngay trên Màn hình khóa (Lock Screen) và Màn hình chính (Home Screen).
   - **Tương tác rung (Haptic Feedback)**: Trải nghiệm lật thẻ, chấm điểm đúng/sai phản hồi rung chân thực.

*Lưu ý*: Trang Admin quản trị hệ thống chỉ phục vụ trên Web, không triển khai trên app iOS. Tuy nhiên, các tham số cấu hình toàn cục từ Admin (như ngưỡng trùng lặp Smart Fork `fork_similarity_threshold`) sẽ được đồng bộ về app iOS để đảm bảo sự nhất quán.

---

## 2. Design System — Đồng bộ với bản Web ("Deep Focus")

### 2.1 Color Assets (Asset Catalog)

Đưa toàn bộ token dưới đây vào `Assets.xcassets` dạng Color Set với giá trị Dark Mode mặc định.

| Color Set Name | Hex | Vai trò |
|---|---|---|
| `BGBase` | `#0B0F17` | Nền chính |
| `BGSurface` | `#131A26` | Card / Panel |
| `BGSurfaceHover` | `#1B2333` | Trạng thái chạm / Highlight |
| `BorderColor` | `#232B3A` | Viền, divider mỏng |
| `TextPrimary` | `#E7EAF0` | Chữ chính |
| `TextSecondary` | `#8B94A7` | Chữ phụ / Chú thích |
| `BrandPrimary` | `#F97316` | Màu nhấn Electric Orange |
| `BrandPrimaryHover` | `#EA580C` | Trạng thái chạm của brand |
| `SuccessColor` | `#10B981` | Trả lời đúng, thuộc bài |
| `WarningColor` | `#F59E0B` | Từ khó / Leech |
| `DangerColor` | `#EF4444` | Trả lời sai |
| `InfoColor` | `#0284C7` | Thông báo, thông tin phụ |
| `CEFR_A` | `#10B981` | Huy hiệu cấp độ A1, A2 |
| `CEFR_B` | `#0284C7` | Huy hiệu cấp độ B1, B2 |
| `CEFR_C` | `#8B5CF6` | Huy hiệu cấp độ C1, C2 |

```swift
// Color+Theme.swift
extension Color {
    static let bgBase = Color("BGBase")
    static let bgSurface = Color("BGSurface")
    static let bgSurfaceHover = Color("BGSurfaceHover")
    static let borderColor = Color("BorderColor")
    static let textPrimary = Color("TextPrimary")
    static let textSecondary = Color("TextSecondary")
    static let brandPrimary = Color("BrandPrimary")
    static let successColor = Color("SuccessColor")
    static let warningColor = Color("WarningColor")
    static let dangerColor = Color("DangerColor")
    static let infoColor = Color("InfoColor")
    
    static func cefrBadge(for level: String?) -> Color {
        guard let level = level?.uppercased() else { return .gray }
        if level.hasPrefix("A") { return Color("CEFR_A") }
        if level.hasPrefix("B") { return Color("CEFR_B") }
        return Color("CEFR_C")
    }
}
```

### 2.2 Typography

- Heading: **Sora** (Custom font nhúng vào bundle).
- Body / UI: **Be Vietnam Pro** (Dynamic Type hỗ trợ kích thước chữ linh hoạt theo cài đặt của hệ thống iOS).
- Monospace: **JetBrains Mono** (hiển thị phiên âm IPA, phím tắt hoặc mã).

### 2.3 Component Styles & Nguyên tắc Native

- **Card Styling**: `RoundedRectangle(cornerRadius: 20)`, nền `Color.bgSurface`, viền mờ `Color.borderColor`, hiệu ứng glow mềm màu cam `shadow(color: .brandPrimary.opacity(0.2), radius: 16)`.
- **Loại bỏ viền trắng**: Đảm bảo toàn bộ các nút bấm, picker, list items đều không xuất hiện viền trắng thô khi tap; sử dụng hiệu ứng opacity hoặc scale spring animation nhẹ.
- **Haptic Feedback**: Sử dụng `UIImpactFeedbackGenerator(style: .medium)` khi lật thẻ và `UINotificationFeedbackGenerator` khi gửi đáp án (success/warning/error).

---

## 3. Kiến trúc App & Sync Strategy

**Pattern**: MVVM + Repository Pattern, chuẩn hóa **Offline-First**.

```
┌─────────────────────────────────────────────────────────┐
│                    View (SwiftUI)                       │
│  (Review 3D, Cloze Recall, Smart Reader, Collections)   │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              ViewModel (ObservableObject)               │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Repository Layer                      │
│            (Xử lý logic đọc/ghi ưu tiên Local)           │
└─────────────┬─────────────────────────────┬─────────────┘
              │                             │
              ▼                             ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│   Local Cache (SwiftData) │ │        Sync Engine        │
│  (Cards, Collections,     │ │ (Đồng bộ ngầm 2 chiều     │
│   UserCards, Logs)        │ │  khi có kết nối mạng)     │
└───────────────────────────┘ └─────────────┬─────────────┘
                                            │
                                            ▼
                              ┌───────────────────────────┐
                              │     Supabase Backend      │
                              │ (Postgres, Auth, Edge Fn) │
                              └───────────────────────────┘
```

---

## 4. Local Data Model (SwiftData)

```swift
import Foundation
import SwiftData

@Model
final class LocalCard {
    @Attribute(.unique) var id: UUID
    var word: String
    var ipa: String?
    var definition: String
    var exampleSentence: String?
    var partOfSpeech: String?         // 'noun', 'verb', 'adjective', 'phrase'... (nullable cho idiom)
    var cefrLevel: String?            // 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'
    var tags: [String] = []           // ['#ielts', '#work']
    var cardType: String = "word"     // 'word', 'phrasal_verb', 'idiom' (badge riêng: idiom tím, phrasal_verb hổ phách)
    var senseNumber: Int = 1
    var audioURL: String?
    var imageURL: String?
    var mnemonic: String?
    var sourceType: String = "manual"
    var createdAt: Date = Date()
    
    init(id: UUID = UUID(), word: String, definition: String, cefrLevel: String? = nil, tags: [String] = []) {
        self.id = id
        self.word = word
        self.definition = definition
        self.cefrLevel = cefrLevel
        self.tags = tags
    }
}

@Model
final class LocalCollection {
    @Attribute(.unique) var id: UUID
    var creatorID: UUID
    var title: String
    var descriptionText: String?
    var coverImage: String?
    var category: String?             // 'ielts', 'toeic', 'daily_communication'...
    var isPublic: Bool = false
    var tags: [String] = []
    var forkCount: Int = 0
    var likesCount: Int = 0
    var isSavedLocally: Bool = true   // Bộ từ do user tạo hoặc đã clone về máy
    var updatedAt: Date = Date()
}

@Model
final class LocalCollectionCard {
    @Attribute(.unique) var id: UUID
    var collectionID: UUID
    var cardID: UUID
    var displayOrder: Int = 0
    var addedAt: Date = Date()
}

@Model
final class LocalUserCard {
    @Attribute(.unique) var id: UUID
    var cardID: UUID
    var stability: Double = 0.0
    var difficulty: Double = 0.0
    var dueAt: Date = Date()
    var reviewCount: Int = 0
    var lapseCount: Int = 0
    var isLeech: Bool = false
    var state: String = "new"         // 'new', 'learning', 'review', 'relearning'
    var needsSync: Bool = false
    // Quick Master ⚡: Khi bấm "Tôi đã thuộc từ này" -> state = "review", stability = 14.0, reviewCount = 5, dueAt = Date() + 14 days (Lv.2 Sapling)
}

@Model
final class LocalReviewLog {
    @Attribute(.unique) var id: UUID
    var cardID: UUID
    var rating: Int                   // 1 Again, 2 Hard, 3 Good, 4 Easy
    var reviewedAt: Date = Date()
    var responseMs: Int = 0
    var reviewMode: String = "flashcard" // 'flashcard', 'cloze', 'custom_session'
    var synced: Bool = false
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
final class LocalSystemSetting {
    @Attribute(.unique) var key: String      // vd: 'fork_similarity_threshold'
    var valueJSON: String                    // lưu giá trị cấu hình JSON (vd: "0.8")
    var updatedAt: Date = Date()
}
```

---

## 5. Tính năng chi tiết theo Phase (Đồng bộ 100% với Web)

### 🟦 Phase 1 — Nền tảng Core FSRS + Hệ Thống Cấp Độ Cây Sinh Trưởng (Tree Levels 0 ➔ 5) & Chuẩn hóa CEFR Level (Offline-First)
- Đăng nhập bảo mật qua Supabase Auth (Sign in with Apple + Google OAuth + Email).
- Đồng bộ toàn bộ kho từ vựng và tiến độ FSRS về SwiftData khi mở app.
- **Thuật toán FSRS Swift Engine Chuẩn Hóa**:
  - Tích hợp FSRS native parameters on-device bảo toàn toán học giữa độ ổn định (`stability`) và độ khó (`difficulty`):
    - `learningSteps: ["10m", "4h", "1d"]`: Hạt mầm đúng lần 1 hẹn ôn sau 4 tiếng (trong ngày), đúng lần 2 hẹn sau 1 ngày (sáng hôm sau), giúp củng cố phản xạ kịp thời on-device.
    - `relearningSteps: ["10m", "2h"]`: Bước tái học tập khi từ bị quên.
    - `requestRetention: 0.9` (Mục tiêu nhớ 90%).
    - `maximumInterval: 365` (Giãn cách tối đa 1 năm cho cấp Đại thụ).
  - **Tuyệt đối không cắt ngọn (clamp) `dueAt` thô bạo**: FSRS tính toán khoảng cách chuẩn xác, tránh tích lũy sai lệch mô hình trí nhớ.
  - **Chuẩn hóa điểm Quiz sang FSRS Rating**:
    - Trắc nghiệm 4 đáp án đúng: Gán `Rating.good (3)` (tránh méo mó giảm độ khó).
    - Trả lời sai: Gán `Rating.again (1)`.
    - Trả lời tự luận / điền từ đúng nhanh (< 4 giây): Gán `Rating.easy (4)`.

- **Kiến Trúc Phân Tách Tuyệt Đối: Học Từ Vựng (`ReviewView`) vs Ôn Tập & Kiểm Tra (`PracticeView`)**:
  - **1. Phân hệ Học Từ Vựng (`ReviewView`) — Passive Input / Nạp & Xem Trước**:
    - Giao diện Flashcard 3D vuốt lật (Flip gesture) hoặc tap để lật xem từ, phát âm `AVSpeechSynthesizer`, nghĩa Việt & Anh, ngữ cảnh, collocations, mnemonic, ảnh.
    - **Không có bài Quiz trắc nghiệm lồng ghép tại đây**.
    - **Không gọi FSRS `submitReview`**, **Không đổi Level**, **Không tính Streak** (chỉ cộng nhẹ +1 XP/thẻ lướt xem).
    - **Tính năng ⚡ "Tôi đã thuộc từ này" (Quick Master)**: Nút bấm trên mặt sau Flashcard và Sheet chi tiết từ: nhảy thẳng sang `state = "review"`, `stability = 14.0`, `difficulty = 3.0`, `reviewCount = 5`, `dueAt = Date() + 14 ngày` (tương đương Level 2 Cây con / Sapling) bỏ qua chu kỳ học sơ khởi.
    - **Màn hình hoàn tất Flashcard**: Chúc mừng và hiển thị nút CTA lớn:
      👉 **"BẮT ĐẦU BÀI KIỂM TRA NGAY ([X] TỪ VỪNG)"** điều hướng thẳng sang `PracticeView(cardIDs: ...)`.

  - **2. Phân hệ Ôn Tập & Kiểm Tra (`PracticeView`) — Active Recall Assessment / Đánh giá & Level Up**:
    - Môi trường kiểm tra phản xạ trí nhớ chủ động, kết hợp ngẫu nhiên 3 định dạng:
      1. *Multiple Choice*: Trắc nghiệm 4 lựa chọn (Từ ➔ Nghĩa, Nghĩa ➔ Từ, Nghe ➔ Từ) với kho từ gây nhiễu dự phòng (`System Distractor Pool`) đảm bảo luôn đủ 4 đáp án.
      2. *Cloze Deletion*: Ẩn từ mục tiêu trong câu văn ngữ cảnh kèm gợi ý ký tự.
      3. *Sentence Writing*: Tự đặt câu tiếng Anh với từ vựng, chấm điểm AI tức thì.
    - **NƠI DUY NHẤT THỰC THI**:
      1. Cập nhật FSRS `LocalUserCard` on-device (và queue sync lên Supabase).
      2. Kích hoạt tính toán **Thăng cấp (Level Up)** hoặc **Hạ cấp (Level Down)** cho Cây Sinh Trưởng.
      3. **Ghi nhận chuỗi học liên tục (Streak 🔥)** cho ngày hôm nay vào `LocalProfile` và Supabase (hoàn toàn độc lập với việc thêm/xóa thẻ).
      4. Tăng tiến độ Nhiệm vụ hàng ngày (`daily_quests`) và thưởng XP kiểm tra (10-20 XP/câu, bonus bài thi hoàn hảo).
    - **Tính năng Ôn tập ngay (Fast-Track Due Cards)**:
      - Banner ưu tiên trên đầu `PracticeView`: *"🎯 Hôm nay có [N] từ đến hạn cần ôn tập theo FSRS"* kèm nút *"ÔN TẬP & KIỂM TRA NGAY"*, 1-tap gom toàn bộ từ đến hạn vào bài thi ngay lập tức.
      - Tự động vào bài kiểm tra ngay khi mở từ Flashcard có tham số `cardIDs`.
    - **Màn hình Chuyển Tiếp Xử Lý (`PracticeProcessingView`)**:
      - Khi nộp câu hỏi cuối cùng, hiển thị màn hình loading native gradient với thanh tiến trình và chỉ báo 4 bước: Ghi nhận câu trả lời ➔ Tưới nước FSRS ➔ Đánh giá Cây Sinh Trưởng ➔ Ghi nhận Streak 🔥.
    - **Màn hình Kết Quả (`PracticeSummaryView`) — Phần Tưới Nước & Thông Báo Level Up**:
      - **Khối "Khu Vườn Vừa Được Tưới Nước! 💧"**: Hiển thị danh sách cây đến hạn đã được tưới nước và phục hồi sinh khí, số lượng cây xanh tốt, kèm thời điểm hẹn tưới nước tiếp theo on-device (`dueAt`).
      - **Thông báo Thăng Cấp (Haptic & Toast/Banner)**: Rung phản hồi haptic chúc mừng và hiển thị banner/toast nổi bật khi có từ vựng lên level.

- **Hệ thống Cấp độ Cây Sinh Trưởng (Gamification Tree Levels 0 ➔ 5) Với Lottie-iOS**:
  - Tích hợp thư viện `Lottie-iOS` (Airbnb) hiển thị hoạt ảnh vector 60fps mượt mà theo 6 cấp độ:
    - **Lv 0: Hạt mầm (Seed)** 🌰: Trạng thái tiềm năng, vừa thêm vào kho (0 lần test, Stability 0).
    - **Lv 1: Nảy mầm (Sprout)** 🌱: Vượt qua chu kỳ học ban đầu (Test đúng 1-3 lần, Stability >= 1 ngày).
    - **Lv 2: Cây con / Nhánh non (Sapling)** 🌿: Hình thành phản xạ tốt (Test đúng 2-5 lần, Stability >= 3-14 ngày).
    - **Lv 3: Cây xanh (Green Tree)** 🌳: Trí nhớ vững vàng (Test đúng 3-8 lần, Stability >= 7-30 ngày).
    - **Lv 4: Nở hoa (Blossom)** 🌸: Thành thạo sâu sắc (Test đúng 5-12 lần, Stability >= 21-90 ngày).
    - **Lv 5: Cổ thụ / Đại thụ (Ancient Tree)** 👑: Khắc sâu vĩnh viễn (Test đúng 8-15 lần, Stability >= 60-365 ngày).
  - **Cơ chế bảo vệ Level 5**: Khi trả lời sai lần đầu ở Lv 5, hiển thị cảnh báo *"⚠️ Cây Đại thụ cần thêm nước!"* để chuyển vào chu kỳ tái học tập ngắn (`relearningSteps`) thay vì bị giáng cấp nặng nề do tap nhầm.
  - Tối ưu hiệu năng: chế độ tĩnh hoặc icon nhẹ trên list từ vựng, full animation 60fps tại Flashcard, Sheet chi tiết từ và Màn hình Thăng Cấp (`level-up-burst`).

- **Phân Định 2 Chế Độ: Ôn Tập Chuẩn (Ranked) vs Luyện Tập Tự Do (Casual Practice)**:
  - **🎯 Ranked**: Áp dụng cho các từ đến hạn (`dueAt <= Date()`) và từ mới (`Level 0`). Đúng đủ số lần ➔ Lên cấp & tính FSRS; Sai ➔ Giảm cấp (giảm 1 cấp).
  - **🎮 Casual**: Ôn theo Collection / Tag tùy chọn khi đã hết từ cần ôn. Nhận XP bình thường nhưng **Cấp độ Cây và FSRS giữ nguyên vẹn 100%**.

- **Dashboard cá nhân & Khu vườn từ vựng (Vocabulary Garden)**:
  - Widget thống kê số lượng Hạt mầm, Nảy mầm, Cây con, Cây xanh, Nở hoa, Đại thụ.
  - Thống kê thẻ đến hạn hôm nay, chuỗi streak bất biến, biểu đồ forecast 7 ngày và biểu đồ phân bổ CEFR (A1-C2).
  - **WidgetKit**: Đưa widget "Khu vườn từ vựng" ra Màn hình chính (Home Screen) và Màn hình khóa (Lock Screen) của iOS.

**1.x. Thêm từ vựng mới — 2 chế độ**:
- **Chế độ 1 — Nhập thủ công (Offline hoàn toàn)**:
  - Form SwiftUI: Từ (*), Nghĩa (*), Từ loại (`Picker`), **Cấp độ CEFR** (`Picker`: A1 đến C2), **Tags** (thêm nhãn nhanh bằng chip input), IPA, Ví dụ, Ảnh minh họa (Tích hợp **Chọn ảnh Dual-Coding từ Pexels API** hoặc thư viện máy `PhotosPicker`), Audio tự sinh bằng `AVSpeechSynthesizer`.
  - **Lớp kiểm tra trùng lặp toàn cục (Global Duplicate Prevention)**: Tự động so khớp với kho từ `LocalCard` on-device (sử dụng thuật toán Levenshtein + Sorensen-Dice + biến thể chia thì/số nhiều). Cảnh báo tức thì nếu từ sắp thêm tương đồng $\ge 80\%$ qua hộp thoại `DuplicateWordSheet`.
  - Lưu tức thì vào SwiftData, đánh dấu `needsSync = true`, tự động đẩy lên Supabase khi có mạng.
- **Chế độ 2 — AI Word Analyzer**:
  - Gọi `POST /api/ai/analyze-word` (cần mạng):
    - **AI Morphological Lemmatization**: AI tự động đưa từ chia thì/số nhiều về từ gốc từ điển (lemma) (ví dụ: `goes` ➔ `go`, `bought` ➔ `buy`).
    - **Cơ chế đảo chiều linh hoạt (Revert Control)**: Hiển thị banner thông báo kèm nút bấm đảo chiều `[↺ Giữ nguyên "goes"]` / `[↺ Dùng từ gốc "go"]` để người học tự quyết định lưu dạng gốc hay dạng chia thì.
    - Phân tích CEFR Level, Card Type, IPA, các tầng nghĩa kèm ví dụ cơ bản, đề xuất tags, collocations, word family và mnemonic.
    - Tìm kiếm và chọn ảnh Pexels trực tiếp trong Form preview.
    - Kiểm tra trùng lặp thông minh trước khi lưu thẻ.
  - Hiển thị kết quả trong Form preview để người dùng chỉnh sửa trước khi lưu.

**1.y. Kho từ vựng & Quản lý từ vựng Native (Vocabulary Library View — SwiftData)**:
- Màn hình quản lý toàn bộ kho từ vựng cá nhân, hoạt động **100% offline**:
  - **Tìm kiếm native mượt mà**: Tích hợp SwiftUI `.searchable(text: $searchText)` tìm kiếm tức thì theo từ, nghĩa, câu ví dụ mà không giật lag.
  - **Filter Chips cuộn ngang**: Lọc nhanh theo CEFR Level (A1, A2, B1, B2, C1, C2), theo Tags cá nhân, và theo trạng thái FSRS (Due, Learning, Mastered, Leech).
  - **Tương tác vuốt (Swipe Actions)**:
    - Vuốt sang phải: Phát âm audio tức thời qua `AVSpeechSynthesizer`.
    - Vuốt sang trái: Hiển thị nút Chỉnh sửa (Edit) và Xóa thẻ (Delete kèm xác nhận).
  - **Chế độ chọn & Thao tác hàng loạt (Selection Mode & Bulk Actions)**:
    - Nút "Chọn" trên Navigation Bar chuyển đổi linh hoạt chế độ `isSelectionMode`.
    - Checkbox chọn từng thẻ, nút **Chọn tất cả (Select All)** / Bỏ chọn toàn bộ danh sách hiển thị.
    - **Nút Xóa các từ đã chọn (`BulkDeleteConfirmationDialog`)**: Xóa an toàn hàng loạt thẻ khỏi SwiftData và queue đồng bộ xóa lên Supabase.
    - **Cơ chế chống tap nhầm (Anti-misclick navigation)**: Khi đang ở chế độ chọn, tap vào bất kỳ đâu trên thẻ sẽ toggle trạng thái chọn thay vì mở `CardDetailSheet`.
    - Thêm nhanh các thẻ đã chọn vào Collection (`AddToCollectionSheet`).
  - **Chạm để xem chi tiết (`CardDetailSheet`)**: Xem toàn bộ các nghĩa, collocations, word family, mẹo nhớ mnemonic và các thông số FSRS (độ ổn định stability, độ khó difficulty, số lần lapse).
  - **Chỉnh sửa thẻ trực tiếp offline**: Form chỉnh sửa lưu thẳng vào `LocalCard` trong SwiftData và tự động đánh dấu cờ `needsSync = true` để đồng bộ lên Supabase khi có mạng.

---

### 🟩 Phase 2 — Smart Contextual Reader & Import từ mới
- **Trình đọc thông minh Native (Smart Contextual Reader)**:
  - Màn hình đọc văn bản tiếng Anh tích hợp tính năng Native Text Selection của iOS.
  - **On-device Morphological Lemmatizer & Hai chiều ($O(1)$)**:
    - Tích hợp bộ tra cứu 150+ từ bất quy tắc (`bought` ↔ `buy`, `went` ↔ `go`...) và bộ tách hậu tố ngữ pháp on-device kết hợp với framework `NaturalLanguage` của Apple.
    - Tự động nhận diện và **highlight xanh lá** cho cả từ gốc lẫn các dạng biến thể chia thì trong văn bản bài đọc.
    - Chạm hoặc bôi đen từ/cụm từ bất kỳ: hiển thị Popover / Action Menu tra nhanh (IPA, nghĩa, cấp độ CEFR).
    - Popover liên kết trực tiếp vào thẻ gốc (`LocalCard`), hiển thị nhãn chú thích *"Đã lưu từ gốc (buy) vào kho từ"* kèm trạng thái FSRS, không gọi AI Edge Function phân tích lại và không lưu trùng lặp.
  - Nút **"Lưu thẻ nhanh"**: Tự động trích xuất câu văn chứa từ đó làm câu ví dụ ngữ cảnh (`exampleSentence`), tích hợp kiểm tra trùng lặp (`DuplicateWordSheet`), lưu trực tiếp vào SwiftData.
- **Batch Word Extraction**:
  - Dán đoạn văn bản → Edge Function tách các từ mới chưa có trong kho từ → Chọn nhiều từ cùng lúc để AI phân tích batch và lưu hàng loạt.

---

### 🟨 Phase 3 — Hệ Thống Tổ Chức & Chia Sẻ Cộng Đồng (Tags + Collections)
- **Tổ chức cá nhân bằng Tags**:
  - Quản lý danh sách thẻ theo Tags trực quan dạng Tag Cloud.
  - **Custom Study Session (Ôn tập tùy chỉnh)**:
    - Cho phép kích hoạt phiên ôn tập tập trung theo Tag (ví dụ `#ielts_writing`) hoặc theo Level CEFR (`B2`) ngay trên app mà không làm ảnh hưởng chu kỳ FSRS tổng thể.
    - Hoạt động mượt mà offline.
- **Collections / Study Sets (Bộ từ vựng đóng gói)**:
  - Tạo, chỉnh sửa bộ từ vựng cá nhân: Tên bộ, Mô tả, Ảnh bìa, Danh mục, quyền Public/Private.
  - Thêm hoặc xóa thẻ khỏi bộ từ vựng chỉ bằng vài thao tác chạm.
- **Khám phá Thư viện bộ từ cộng đồng (Community Library)**:
  - Khám phá các bộ từ nổi bật do cộng đồng hoặc Admin chia sẻ.
  - Xem trước (Preview) chi tiết các thẻ có trong bộ.
  - **Smart Fork (Phân tích Fuzzy Matching & Tránh trùng lặp bộ từ)**:
    - Trước khi clone, hệ thống tự động quét và đối chiếu các từ trong bộ với `LocalCard` cá nhân dựa theo thuật toán Text Similarity (Levenshtein + Dice + Inflections) với ngưỡng lấy từ `LocalSystemSetting` (`fork_similarity_threshold`, mặc định 80%).
    - Nếu phát hiện trùng lặp: Hiển thị modal sheet **`DuplicateResolutionSheet`** phân loại trực quan từ mới vs từ trùng lặp, cho phép chọn: *"Chỉ thêm từ mới"*, *"Thêm đã chọn"* hoặc *"Thêm tất cả"*.
  - **Popup Loading & Thanh tiến trình (ForkLoadingModal / ProgressView)**:
    - Hiển thị sheet loading hiện đại với spinner nhịp nhàng, thanh progress bar gradient và 3 bước chỉ báo:
      1. *Quét dữ liệu* (Phân tích trùng lặp).
      2. *Sao chép thẻ* (Nhân bản vào `LocalCard`).
      3. *Đồng bộ SRS* (Khởi tạo lịch `LocalUserCard` FSRS).
    - Phản hồi rung Haptic (`UINotificationFeedbackGenerator`) khi hoàn tất 100%.

---

### 🟧 Phase 4 — Chế độ ôn tập Active Recall: Cloze Deletion (Điền khuyết)
- Bên cạnh Flashcard lật thông thường, bản iOS hỗ trợ chế độ **Điền từ vào câu**:
  - Ẩn từ mục tiêu trong câu ví dụ dạng `[_______]`.
  - Tối ưu bàn phím iOS với gợi ý chữ cái đầu, tự động kiểm tra chính tả.
  - Haptic feedback phản hồi ngay khi gõ đúng/sai từng ký tự.
  - Thưởng XP cao hơn và ghi log ôn tập vào `LocalReviewLog`.

---

### 🟫 Phase 5 — AI Hỗ Trợ Học Sâu & Dual-Coding
- **Visual Mnemonic & Dual-Coding**: Hiển thị hình ảnh liên tưởng (cache local bằng Kingfisher hoặc SwiftData) kết hợp mẹo nhớ chữ giúp tăng cường khả năng ghi nhớ dài hạn.
- **Sentence Writing & AI Grader**: Nhập câu tiếng Anh tự viết, gọi Edge Function AI để chấm lỗi ngữ pháp và đề xuất cách hành văn chuẩn bản xứ.

---

### 🟪 Phase 6 — Luyện Phát Âm Native (Điểm Mạnh Độc Quyền iOS)
- Dùng **Speech framework (`SFSpeechRecognizer`)** của Apple:
  - Nhận diện giọng nói on-device, chấm điểm phát âm chính xác, **hoàn toàn miễn phí và hoạt động cả khi offline** (khi thiết bị đã tải gói tiếng Anh).
  - So khớp âm tiết, tính điểm phần trăm độ chính xác và highlight những từ phát âm chưa chuẩn.
- **Phát âm mẫu chuẩn**: Sử dụng `AVSpeechSynthesizer` với giọng đọc Enhanced chất lượng cao của iOS.

---

### 🟥 Phase 7 — Tích Hợp Telegram & Đồng Bộ Lịch Nhắc
- Màn hình Cài đặt có nút "Kết nối Telegram" mở Universal Link / Deep Link tới bot Telegram.
- Dùng chung tài khoản và `telegram_chat_id` với bản Web. Toàn bộ logic gửi nhắc nhở giờ vàng và báo cáo tuần vẫn do **Supabase Edge Function + `pg_cron`** đảm nhiệm, app iOS không cần chạy ngầm tốn pin.
- Cho phép xem và tùy chỉnh "Khung giờ vàng" ngay trong Cài đặt của app iOS.

---

### 🔶 Phase 8 — Collocations, Word Family, Minimal Pairs & Phrasal Verbs
- Đồng bộ `LocalCollocation` và `LocalWordFamily` về máy để tra cứu và luyện tập offline.
- Section mở rộng trong chi tiết thẻ: Xem cụm từ đi kèm, các từ cùng gốc.
- **Minimal Pairs Pronunciation**: Khác với Web chỉ nghe và chọn, bản iOS cho phép **người dùng tự phát âm cặp từ để Speech framework chấm điểm**, sửa tật phát âm lẫn lộn các âm khó (như /i:/ và /ɪ/).

---

### 🔺 Phase 9 — Leech Detection & AI Mini-Story
- Cờ `isLeech` đồng bộ 2 chiều.
- Dashboard hiển thị mục riêng "Từ khó cần chú ý" đọc từ SwiftData local.
- Tab "Ôn tập tuần": Tải truyện ngắn AI cuối tuần (`weekly_stories`), cache lại để đọc offline.

---

### ⭐ Phase 10 — Gamification Xã Hội: Duel & Leaderboard
- Xem Bảng xếp hạng XP theo tuần trong nhóm bạn bè.
- **Đấu từ vựng (Duel)**: Tận dụng Supabase Realtime WebSocket trên iOS để 2 người chơi thi đấu trực tiếp, cập nhật điểm số từng câu trên màn hình.

---

### 🔲 Phase 11 — WidgetKit (Màn Hình Khóa & Home Screen — iOS-Only)
- Tạo Widget hiển thị qua framework **WidgetKit** (Lock Screen Widget & Home Screen Widget).
- Cho phép người dùng cấu hình Widget:
  - Hiển thị số lượng từ đến hạn cần ôn hôm nay.
  - Hoặc xoay vòng hiển thị các từ vựng thuộc **Collection yêu thích** hoặc thuộc **CEFR Level** đang tập trung học (ví dụ: chỉ hiện từ B2).
- Đọc trực tiếp từ SwiftData local container (App Group) — **không tốn pin, không cần kết nối mạng**.
- Chạm vào Widget mở thẳng app vào phiên ôn tập.

---

## 6. Bảng Phân Bổ Chi Phí & Tối Ưu

| Hạng mục | Chi phí | Ghi chú tối ưu |
|---|---|---|
| **Xcode & SwiftUI SDK** | Miễn phí | Phát triển và chạy thử nghiệm cá nhân không tốn phí. |
| **Speech Framework & TTS** | Miễn phí | On-device, không tốn chi phí server hay API bên ngoài. |
| **Supabase Swift SDK** | Miễn phí | Dùng chung toàn bộ cơ sở hạ tầng Supabase Free của bản Web. |
| **Apple Developer Program** | $99/năm | Chỉ cần thiết khi chuẩn bị phát hành chính thức lên App Store / TestFlight. Giai đoạn dev cài trực tiếp qua Xcode miễn phí. |

---

## 7. Chiến Lược Đồng Bộ Hai Chiều (Sync Engine)

1. **Khởi động App**: Kiểm tra kết nối mạng → Fetch thay đổi mới từ Supabase (Cards, Collections mới được tạo trên Web) theo timestamp `updated_at`.
2. **Khi Học Flashcard hoặc Làm Kiểm Tra**:
   - **Lướt Flashcard**: Ghi nhận XP lướt thẻ cục bộ, đồng bộ `POST /api/review/complete` kèm `is_preview_only: true` (không gọi FSRS submit, không tính streak).
   - **Làm bài kiểm tra (`PracticeView`)**: Cập nhật trạng thái FSRS `LocalUserCard` on-device, đồng bộ `POST /api/review/submit` cho từng câu và `POST /api/practice/complete` để ghi nhận **Streak 🔥** và tiến độ nhiệm vụ ngày.
   - **Thao tác Quick Master ⚡**: Đánh dấu `needsSync = true` và gọi đồng bộ `POST /api/cards/:id/mark-known`.
3. **Đồng bộ ngầm (Background Sync)**: Tận dụng `BGAppRefreshTask` và trigger đồng bộ mỗi khi app chuyển trạng thái active hoặc khi kết nối mạng được phục hồi.
4. **Xử lý xung đột**: Dùng nguyên tắc "Last Write Wins" dựa trên `reviewed_at` và `updated_at`.

---

## 8. Kế Hoạch Milestones Triển Khai (iOS)

| Mốc | Nội dung công việc |
|---|---|
| **M1** | Đăng nhập Supabase Auth + SwiftData Models (Card, CEFR Level, Tags, System Settings) + **Hệ Thống Cấp Độ Cây Sinh Trưởng (Level 0-5 Lottie-iOS)** + AI Lemmatization & Revert Control + Global Duplicate Gate + Pexels Image Picker + Quản lý từ vựng (Selection Mode & Bulk Actions) |
| **M2** | Quản lý Tags cá nhân + Collections (Tạo, Xem chi tiết, Khám phá Thư viện cộng đồng) + Custom Study Session + Smart Fork (Fuzzy Matching + `DuplicateResolutionSheet`) + Thanh tiến trình loading `ForkLoadingModal` |
| **M3** | Smart Contextual Reader (On-device Morphological Lemmatizer $O(1)$, highlight xanh lá biến thể chia thì, chạm tra nhanh liên kết thẻ gốc) + Batch Import |
| **M4** | **Phân Tách Toàn Diện Review vs Practice Native**: Flashcard 3D Preview (`ReviewView`) + Quick Master ⚡ + **Active Recall Assessment (`PracticeView`)** (Trắc nghiệm, Điền khuyết, Đặt câu chấm điểm FSRS, Streak & Thăng/Hạ cấp độ Cây) + Fast-Track Due Cards |
| **M5** | Luyện phát âm Native với Speech framework (`SFSpeechRecognizer`) + TTS `AVSpeechSynthesizer` |
| **M6** | AI Deep Learning: Dual-Coding ảnh, Mnemonic, AI Grader chấm câu |
| **M7** | Liên kết Telegram + Xem/chỉnh sửa khung Giờ Vàng |
| **M8** | Collocations, Word Families, Phrasal Verbs & Chấm phát âm Minimal Pairs |
| **M9** | Leech Detection + Đọc AI Mini-Story cuối tuần |
| **M10** | Gamification: Bảng xếp hạng bạn bè + Thách đấu Duel thời gian thực qua Realtime |
| **M11** | Lock Screen & Home Screen Widget (WidgetKit) |
| **M12** | TestFlight nội bộ & Hoàn thiện phát hành App Store |

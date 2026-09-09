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
   - **Quy trình Ôn tập 2 Giai Đoạn & Hệ Thống Cấp Độ Cây Sinh Trưởng (Tree Levels 0 ➔ 5) Với Lottie-iOS**:
     + **Giai đoạn 1 — Lướt xem Flashcard (Passive Preview & Warm-up)**: Gesture vuốt mượt mà để lướt xem thẻ cần ôn và thẻ mới (+1 XP/thẻ), loại bỏ hoàn toàn 4 nút chấm điểm chủ quan.
     + **Giai đoạn 2 — Kiểm tra trí nhớ phản xạ (Active Recall Quiz Native)**: Trắc nghiệm phản xạ 4 đáp án (Từ ➔ Nghĩa, Nghĩa ➔ Từ, Nghe ➔ Từ, Điền khuyết) với kho distractor pool dự phòng và vòng lặp sửa sai (Re-test loop) kèm Haptic feedback. Kết quả Đúng/Sai quyết định FSRS và thăng/hạ cấp Cây.
     + **Hệ thống Cây Sinh Trưởng Lottie (0 ➔ 5)**: Hạt mầm ➔ Nảy mầm ➔ Nhánh non ➔ Cây xanh ➔ Nở hoa ➔ Đại thụ, hiển thị hoạt ảnh Lottie vector 60fps qua framework `Lottie-iOS` (Airbnb), có cơ chế bảo vệ Level 5 và phân định Ranked vs Casual.
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
    var partOfSpeech: String?
    var cefrLevel: String?            // 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'
    var tags: [String] = []           // ['#ielts', '#work']
    var cardType: String = "word"     // 'word', 'phrasal_verb', 'idiom'
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
- **Quy trình Ôn tập 2 Giai Đoạn Native (`ReviewView`)**:
  - **Giai đoạn 1 — Lướt xem Flashcard (Passive Preview & Warm-up)**:
    - Giao diện thẻ 3D vuốt lật (Flip gesture) hoặc tap để lật xem từ, phát âm, nghĩa, ví dụ, mnemonic, ảnh.
    - **Loại bỏ hoàn toàn 4 nút chấm điểm chủ quan** (Again, Hard, Good, Easy) và gesture vuốt chấm điểm.
    - Vuốt ngang hoặc tap mũi tên để chuyển thẻ trước/sau, nút nổi bật "Bắt đầu Kiểm tra ngay" (+1 XP khởi động mỗi thẻ).
  - **Giai đoạn 2 — Kiểm tra Trí nhớ Phản xạ (Active Recall Quiz Native)**:
    - Trọng tài khách quan quyết định việc thăng/hạ cấp FSRS và cấp độ cây trực tiếp on-device qua SwiftData.
    - 4 hình thức trắc nghiệm native mượt mà (Từ ➔ Nghĩa, Nghĩa ➔ Từ, Nghe ➔ Từ, Điền khuyết) với phản hồi rung Haptic (`UINotificationFeedbackGenerator`).
    - **Kho từ gây nhiễu dự phòng (System Distractor Pool)**: Tự động mượn từ vựng hệ thống làm đáp án sai khi kho từ của user có dưới 4 từ.
    - **Vòng lặp sửa sai (Re-test loop)**: Câu sai được hỏi lại ở cuối bài để ghi nhớ (làm lại đúng chỉ để xác nhận hiểu bài, không thăng cấp tức thời).
- **Hệ thống Cấp độ Cây Sinh Trưởng (Tree Levels 0 ➔ 5) Với Lottie-iOS**:
  - Tích hợp thư viện `Lottie-iOS` (Airbnb) hiển thị hoạt ảnh vector 60fps mượt mà:
    - **Lv 0: Hạt mầm (Seed)** 🌰: Trạng thái tiềm năng.
    - **Lv 1: Nảy mầm (Sprout)** 🌱: Đúng 1 lần test Ranked (Stability ~1-2 ngày).
    - **Lv 2: Nhánh non (Sapling)** 🌿: Đúng 2 lần liên tiếp (Stability ~3-6 ngày).
    - **Lv 3: Cây xanh (Green Tree)** 🌳: Đúng 3 lần liên tiếp (Stability ~7-20 ngày).
    - **Lv 4: Nở hoa (Blossom)** 🌸: Đúng 5 lần liên tiếp (Stability ~21-59 ngày).
    - **Lv 5: Đại thụ (Ancient Tree)** 👑: Đúng 8 lần liên tiếp (Stability >= 60 ngày), kèm cơ chế bảo hiểm tránh rớt hạng do tap nhầm.
  - Tối ưu hiệu năng: chế độ tĩnh hoặc hover/scroll trên list từ vựng, full animation 60fps tại Flashcard, Sheet chi tiết từ và Màn hình Thăng Cấp (`level-up-burst`).
- **Phân Định 2 Chế Độ: Ôn Tập Chuẩn (Ranked) vs Luyện Tập Tự Do (Casual Practice)**:
  - **🎯 Ranked**: Áp dụng cho các từ đến hạn (`dueAt <= Date()`) và từ mới (`Level 0`). Đúng đủ số lần ➔ Lên cấp & tính FSRS; Sai ➔ Giảm cấp.
  - **🎮 Casual**: Ôn theo Collection / Tag tùy chọn khi đã hết từ cần ôn. Nhận XP bình thường nhưng **Cấp độ Cây và FSRS giữ nguyên vẹn 100%**.
- **Dashboard cá nhân & Khu vườn từ vựng (Vocabulary Garden)**:
  - Widget thống kê số lượng Hạt mầm, Nảy mầm, Nhánh non, Cây xanh, Nở hoa, Đại thụ.
  - Thống kê thẻ đến hạn hôm nay, chuỗi streak, biểu đồ forecast 7 ngày và biểu đồ phân bổ CEFR (A1-C2).
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
2. **Khi Review hoặc Thêm thẻ**: Ghi lập tức vào SwiftData local (phản hồi < 50ms, không lag chờ mạng), đánh dấu cờ `needsSync = true`.
3. **Đồng bộ ngầm (Background Sync)**: Tận dụng `BGAppRefreshTask` và trigger đồng bộ mỗi khi app chuyển trạng thái active hoặc khi kết nối mạng được phục hồi.
4. **Xử lý xung đột**: Dùng nguyên tắc "Last Write Wins" dựa trên `reviewed_at` và `updated_at`.

---

## 8. Kế Hoạch Milestones Triển Khai (iOS)

| Mốc | Nội dung công việc |
|---|---|
| **M1** | Đăng nhập Supabase Auth + SwiftData Models (Card, CEFR Level, Tags, System Settings) + **Hệ Thống Cấp Độ Cây Sinh Trưởng (Level 0-5 Lottie-iOS)** + AI Lemmatization & Revert Control + Global Duplicate Gate + Pexels Image Picker + Quản lý từ vựng (Selection Mode & Bulk Actions) |
| **M2** | Quản lý Tags cá nhân + Collections (Tạo, Xem chi tiết, Khám phá Thư viện cộng đồng) + Custom Study Session + Smart Fork (Fuzzy Matching + `DuplicateResolutionSheet`) + Thanh tiến trình loading `ForkLoadingModal` |
| **M3** | Smart Contextual Reader (On-device Morphological Lemmatizer $O(1)$, highlight xanh lá biến thể chia thì, chạm tra nhanh liên kết thẻ gốc) + Batch Import |
| **M4** | **Quy trình Ôn tập 2 Giai Đoạn Native**: Flashcard 3D Preview + **Active Recall Quiz Native** (Trắc nghiệm quyết định FSRS & Thăng/Hạ cấp độ Cây) + Phân định Ranked vs Casual |
| **M5** | Luyện phát âm Native với Speech framework (`SFSpeechRecognizer`) + TTS `AVSpeechSynthesizer` |
| **M6** | AI Deep Learning: Dual-Coding ảnh, Mnemonic, AI Grader chấm câu |
| **M7** | Liên kết Telegram + Xem/chỉnh sửa khung Giờ Vàng |
| **M8** | Collocations, Word Families, Phrasal Verbs & Chấm phát âm Minimal Pairs |
| **M9** | Leech Detection + Đọc AI Mini-Story cuối tuần |
| **M10** | Gamification: Bảng xếp hạng bạn bè + Thách đấu Duel thời gian thực qua Realtime |
| **M11** | Lock Screen & Home Screen Widget (WidgetKit) |
| **M12** | TestFlight nội bộ & Hoàn thiện phát hành App Store |

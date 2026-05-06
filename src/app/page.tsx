import {
  BarChart3,
  BriefcaseBusiness,
  Calendar,
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  DollarSign,
  FileBarChart,
  FileText,
  Flag,
  Menu,
  Percent,
  Settings,
  SlidersHorizontal,
  Target,
  Ticket,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import styles from "./page.module.css";

type ModuleSpec = {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  audience: string;
  Icon: LucideIcon;
  tone: string;
  metrics: string[];
  workflow: string[];
  screens: string[];
  features: string[];
};

const navigation = [
  { label: "Dashboard", href: "#dashboard", Icon: BarChart3 },
  { label: "Khách Hàng", href: "#customers", Icon: Users },
  { label: "Bảng Giá", href: "#pricing", Icon: SlidersHorizontal },
  { label: "Hợp Đồng", href: "#contracts", Icon: FileText },
  { label: "Vé Lẻ", href: "#tickets", Icon: Ticket },
  { label: "Golf Teetime", href: "#teetime", Icon: Flag },
  { label: "Golf Line Tập", href: "#line", Icon: Target },
  { label: "Lịch HLV", href: "#coach", Icon: CalendarCheck },
  { label: "Lịch Lớp", href: "#classes", Icon: CalendarDays },
  { label: "Check-in/out", href: "#checkin", Icon: ClipboardCheck },
  { label: "Sổ Quỹ", href: "#cashbook", Icon: WalletCards },
  { label: "Hoa Hồng Sale", href: "#commission", Icon: Percent },
  { label: "Cài Đặt", href: "#settings", Icon: Settings },
  { label: "Báo cáo", href: "#reports", Icon: FileBarChart },
];

const stats = [
  {
    label: "Tổng Đặt Chỗ Hôm Nay",
    value: "50",
    trend: "+12%",
    Icon: Calendar,
    tone: "blue",
  },
  {
    label: "Khách Hàng Hoạt Động",
    value: "1,234",
    trend: "+8%",
    Icon: Users,
    tone: "green",
  },
  {
    label: "Doanh Thu Hôm Nay",
    value: "17.3M VNĐ",
    trend: "+23%",
    Icon: DollarSign,
    tone: "amber",
  },
  {
    label: "Tỷ Lệ Sử Dụng",
    value: "78%",
    trend: "+5%",
    Icon: TrendingUp,
    tone: "purple",
  },
];

const facilities = [
  {
    name: "Golf Teetime",
    Icon: Flag,
    booked: "32",
    available: "8",
    revenue: "12.5M VNĐ",
  },
  {
    name: "Golf Line Tập",
    Icon: Target,
    booked: "18",
    available: "12",
    revenue: "4.8M VNĐ",
  },
];

const bookings = [
  ["BK001", "Nguyễn Văn A", "Golf Teetime", "14:00 - 16:00", "Đã Xác Nhận"],
  ["BK002", "Trần Thị B", "Golf Teetime", "15:00 - 16:00", "Đã Xác Nhận"],
  ["BK003", "Lê Văn C", "Golf Line Tập", "16:00 - 17:00", "Chờ Xác Nhận"],
  ["BK004", "Phạm Văn D", "Golf Teetime", "09:00 - 11:00", "Đã Xác Nhận"],
  ["BK005", "Hoàng Thị E", "Golf Line Tập", "10:00 - 11:00", "Chờ Xác Nhận"],
];

const modules: ModuleSpec[] = [
  {
    id: "customers",
    code: "M01",
    title: "Khách Hàng",
    subtitle:
      "Single source of truth cho hồ sơ golfer, sinh trắc học, hợp đồng, giao dịch và kết quả tập luyện.",
    audience: "Lễ tân · Sale · Manager",
    Icon: Users,
    tone: "moduleBlue",
    metrics: ["1,234 hồ sơ", "186 còn hạn", "32 sắp hết hạn"],
    workflow: [
      "Thêm mới khách hàng với Họ tên + SĐT bắt buộc, tự sinh mã HV và mã sinh trắc học.",
      "Kiểm tra SĐT không trùng trong cùng chi nhánh, lưu audit log.",
      "Từ hồ sơ KH có thể ký HĐ, check-in, ghi scorecard, đo Inbody và lập Meal Plan.",
    ],
    screens: [
      "Danh sách KH với chip: Tất cả, Còn hạn, Hết hạn, Sắp hết hạn, Chưa đăng ký.",
      "Panel lọc nâng cao: ngày hết hạn, sinh nhật, đăng ký, giới tính, CN, nhóm KH, sale phụ trách.",
      "Modal chi tiết 8 tab: Tổng quan, Hợp đồng, Giao dịch, Check-in, Tập luyện, Inbody, Meal Plan, TA.",
      "Form thêm/sửa KH, modal thêm người đi cùng, thêm nhóm/nguồn, gán trợ giảng.",
    ],
    features: [
      "Badge FaceID / Vân tay / Thẻ",
      "Soft delete 30 ngày cho Admin",
      "Công nợ realtime từ Sổ Quỹ",
    ],
  },
  {
    id: "pricing",
    code: "M02",
    title: "Bảng Giá",
    subtitle:
      "Cấu hình Khu vực, Khung giờ, Bảng giá hợp đồng và Bảng giá vé lẻ theo thứ tự phụ thuộc.",
    audience: "Admin · Manager chi nhánh",
    Icon: SlidersHorizontal,
    tone: "moduleViolet",
    metrics: ["4 khu vực", "18 khung giờ", "12 gói active"],
    workflow: [
      "Tạo Khu vực trước, sau đó tạo Khung giờ gắn khu vực và chi nhánh.",
      "Chỉ mở form Bảng giá khi đã có đủ Khu vực + Khung giờ.",
      "Bảng giá active mới xuất hiện trong form Hợp Đồng và Vé Lẻ; giá được snapshot khi bán.",
    ],
    screens: [
      "Quản lý Bảng Giá với tab Bảng giá hợp đồng table view và Bảng giá vé lẻ card view.",
      "Modal Quản lý Khu vực, Quản lý Khung giờ, form tạo/sửa và dialog chặn xóa nếu đang tham chiếu.",
      "Import/Export Excel, bộ lọc tên/mã, loại dịch vụ, cơ sở, trạng thái.",
    ],
    features: [
      "Draft / Active / Inactive",
      "Optimistic lock khi sửa giá",
      "Kết nối ma trận hoa hồng M11",
    ],
  },
  {
    id: "contracts",
    code: "M03",
    title: "Hợp Đồng",
    subtitle:
      "Trung tâm bán hàng và quản lý vòng đời hợp đồng hội viên từ ký mới đến hết hạn hoặc chuyển đổi.",
    audience: "Sales · Lễ tân · Manager",
    Icon: FileText,
    tone: "moduleIndigo",
    metrics: ["CT102 active", "18 gia hạn", "6 bảo lưu"],
    workflow: [
      "Chọn KH có sẵn hoặc tạo KH mới, chọn gói từ Bảng Giá active.",
      "Lưu HĐ sinh mã CTxxx và phiếu thu trong Sổ Quỹ.",
      "Các trạng thái mở rộng gồm Gia hạn, Nâng cấp, Bảo lưu, Chuyển nhượng, Chuyển đổi HĐ.",
    ],
    screens: [
      "Quản lý Hợp Đồng với 6 tab: Hợp đồng, Gia hạn, Nâng cấp, Bảo lưu, Chuyển nhượng, Chuyển đổi.",
      "Danh sách HĐ có sub-tab filter và modal chi tiết 8 section + timeline sự kiện.",
      "Form 2-panel/3-column cho các nghiệp vụ nâng cấp, bảo lưu, chuyển nhượng, chuyển đổi.",
    ],
    features: [
      "In HĐ theo mẫu cấu hình",
      "Audit contract_history",
      "Tự sinh phiếu thu M10",
    ],
  },
  {
    id: "tickets",
    code: "M04",
    title: "Vé Lẻ",
    subtitle:
      "Bán vé sử dụng đơn lẻ hoặc vé nhóm cho khách vãng lai, kèm voucher và dịch vụ add-on.",
    audience: "Lễ tân",
    Icon: Ticket,
    tone: "moduleOrange",
    metrics: ["72 vé hôm nay", "9 voucher", "5 add-on"],
    workflow: [
      "Lễ tân xem KPI và danh sách vé, tạo vé mới với toggle Vé lẻ / Vé nhóm.",
      "Vé CONFIRMED tự sinh phiếu thu trong Sổ Quỹ.",
      "Tab Voucher quản lý card 3 cột, điều kiện áp dụng và giới hạn sử dụng.",
    ],
    screens: [
      "Tab Danh sách vé: KPI, search mã vé/tên/SĐT, bộ lọc thời gian và trạng thái.",
      "Form tạo/sửa vé đơn, vé nhóm, thêm KH inline nếu chưa có.",
      "Tab Vouchers và Dịch vụ đi kèm với QR chứa ticket_id + add-ons + total.",
    ],
    features: [
      "Soft cancel giữ lịch sử",
      "Sinh phiếu thu bổ sung khi thêm add-on",
      "Voucher theo % hoặc số tiền",
    ],
  },
  {
    id: "teetime",
    code: "M05",
    title: "Golf Teetime",
    subtitle:
      "Lưới khung giờ phát bóng trong ngày, mỗi slot phục vụ 1-6 người chơi.",
    audience: "Lễ tân · Admin",
    Icon: Flag,
    tone: "moduleGreen",
    metrics: ["150 slot/ngày", "32 đã đặt", "8 còn trống"],
    workflow: [
      "Đổi ngày hoặc chi nhánh để refresh lưới teetime.",
      "Ô xanh mở form đăng ký, ô vàng cam mở chi tiết để book thêm hoặc thao tác vòng đời.",
      "Cho đổi lịch, hủy, xóa cứng có audit log và thông báo khách.",
    ],
    screens: [
      "Màn lưới Teetime: mỗi hàng 6 ô, header ngày + chi nhánh + nút Thiết lập.",
      "Form Thiết lập dãy teetime, Form Đăng ký lịch chơi, Popup chi tiết booking.",
      "Danh sách booking trong slot với trạng thái, đại diện HV và số khách.",
    ],
    features: [
      "Load ~150 ô dưới 2 giây",
      "Hoàn buổi khi hủy",
      "Tái sử dụng form thêm HV",
    ],
  },
  {
    id: "line",
    code: "M06",
    title: "Golf Line Tập",
    subtitle:
      "Quản lý lane driving range, sơ đồ line, in vé lẻ, bán dịch vụ kèm và gia hạn giờ.",
    audience: "Lễ tân · Admin",
    Icon: Target,
    tone: "moduleCyan",
    metrics: ["30 line", "18 đang dùng", "12 còn trống"],
    workflow: [
      "Line là trạm tập cố định; mỗi line có trạng thái màu theo khả dụng.",
      "Mở form In vé để chọn bảng giá, khách hàng, số khách và dịch vụ kèm.",
      "Gia hạn giờ cập nhật booking line và sinh thu bổ sung khi cần.",
    ],
    screens: [
      "Danh sách Line có phân trang, nút + Thêm mới, ô tìm kiếm và icon sửa.",
      "Sơ đồ Line theo màu: trống, đang dùng, bảo trì, quá giờ.",
      "Form thêm/sửa Line và form In vé lẻ + add-on.",
    ],
    features: [
      "Quản lý trạng thái line",
      "Dịch vụ bán kèm",
      "In vé/QR tại quầy",
    ],
  },
  {
    id: "coach",
    code: "M07",
    title: "Lịch HLV",
    subtitle:
      "Calendar lịch tập 1-1 giữa HLV và học viên theo HLV × slot 15 phút.",
    audience: "HLV · Lễ tân · Admin",
    Icon: CalendarCheck,
    tone: "moduleRose",
    metrics: ["14 HLV", "96 slot", "28 đã tập"],
    workflow: [
      "Lọc theo chi nhánh, thời gian, HLV, trợ lý HLV và khách hàng.",
      "Đăng ký lịch linh hoạt, lịch tập tháng hoặc lịch theo hội viên.",
      "Đánh dấu Đã tập tự động trừ buổi và đẩy dữ liệu sang Hoa Hồng Sale.",
    ],
    screens: [
      "Calendar HLV × giờ với panel filter trái.",
      "Form đăng ký lịch linh hoạt, lịch tháng, lịch hội viên.",
      "Modal chi tiết buổi tập, trạng thái tham gia và ghi chú tiến độ.",
    ],
    features: [
      "Slot 15 phút",
      "Trợ giảng HLV",
      "Tính buổi đã dạy cho M11",
    ],
  },
  {
    id: "classes",
    code: "M08",
    title: "Lịch Lớp",
    subtitle:
      "Quản lý lớp học nhóm, lịch tuần, booking học viên, điểm danh và báo cáo buổi học.",
    audience: "Giáo viên · Lễ tân · Admin",
    Icon: CalendarDays,
    tone: "modulePurple",
    metrics: ["12 lớp", "86 học viên", "21 buổi/tuần"],
    workflow: [
      "Tạo lớp nhóm, cấu hình lịch học theo tuần và giới hạn sĩ số.",
      "Booking kiểm tra HV có thuộc lớp và còn quyền tham gia hay không.",
      "Giáo viên điểm danh, lễ tân in báo cáo buổi, tổng buổi dạy sang M11.",
    ],
    screens: [
      "Danh sách lớp: header tím, 3 KPI, search và grid card lớp học.",
      "Form thêm/sửa lớp, cấu hình lịch tuần từng ngày.",
      "Weekly calendar hiển thị cả lịch lớp và booking đã phát sinh.",
    ],
    features: [
      "Điểm danh buổi",
      "In báo cáo lớp",
      "Hoa hồng giáo viên",
    ],
  },
  {
    id: "checkin",
    code: "M09",
    title: "Check-in / Checkout",
    subtitle:
      "Quản lý realtime lượt vào/ra, thiết bị FaceID/vân tay/thẻ và cấu hình khu vực.",
    audience: "Lễ tân · Admin",
    Icon: ClipboardCheck,
    tone: "moduleTeal",
    metrics: ["98 lượt hôm nay", "6 thiết bị", "3 khu vực"],
    workflow: [
      "Thiết bị gửi sự kiện check-in, lễ tân xác nhận hoặc check-in thủ công.",
      "Chi tiết lượt vào/ra tham chiếu customer_id, hợp đồng, khu vực và thiết bị.",
      "Checkout ghi thời gian ra, cập nhật trạng thái và báo cáo check-in.",
    ],
    screens: [
      "Tab Danh sách Check-in realtime với KPI dashboard.",
      "Bảng check-in/checkout, bộ lọc và panel phải gồm tabs thông tin chi tiết.",
      "Màn quản lý thiết bị và đăng ký FaceID/Vân tay/Thẻ.",
    ],
    features: [
      "Realtime tại quầy",
      "Thiết bị gắn khu vực",
      "Badge sinh trắc học",
    ],
  },
  {
    id: "cashbook",
    code: "M10",
    title: "Sổ Quỹ",
    subtitle:
      "Quản lý thu chi tiền mặt tại chi nhánh, công nợ và phiếu tự sinh từ hợp đồng/vé lẻ.",
    audience: "Kế toán · Lễ tân",
    Icon: WalletCards,
    tone: "moduleEmerald",
    metrics: ["17.3M thu", "2.1M chi", "8 công nợ"],
    workflow: [
      "Phiếu thu có 2 loại: Công nợ và Phiếu thu khác.",
      "Hợp đồng thanh toán, vé lẻ confirmed và hoa hồng chi trả tự sinh phiếu.",
      "Modal chi tiết phiếu thu/chi có tabs chứng từ và lịch sử xử lý.",
    ],
    screens: [
      "Tab Phiếu thu, Tab Phiếu chi, bộ lọc theo thời gian, đối tượng nộp, trạng thái.",
      "Form thêm Phiếu thu Công nợ chọn KH + danh sách HĐ còn nợ.",
      "Modal chi tiết phiếu và kết nối công nợ trong hồ sơ KH.",
    ],
    features: [
      "Auto receipt từ M03/M04",
      "Auto expense từ M11",
      "Theo dõi công nợ realtime",
    ],
  },
  {
    id: "commission",
    code: "M11",
    title: "Hoa Hồng Sale",
    subtitle:
      "Cấu hình ma trận hoa hồng Sales và Coach, theo nhóm khách hàng, nhóm dịch vụ và số buổi dạy.",
    audience: "Manager · Sales",
    Icon: Percent,
    tone: "modulePink",
    metrics: ["24 sale", "14 coach", "38.5M chờ chi"],
    workflow: [
      "Manager cấu hình Ma trận Hoa hồng theo Nhóm KH × Loại HĐ.",
      "Khi tạo HĐ mới, hệ thống snapshot tỷ lệ hoa hồng.",
      "Lịch sử chi trả sinh phiếu chi sang Sổ Quỹ khi xác nhận.",
    ],
    screens: [
      "Quản Lý Hoa Hồng với tab Ma trận Hoa hồng và Lịch sử chi trả.",
      "KPI cố định theo tổng hoa hồng, đã chi, chờ chi, số nhân sự.",
      "Màn quản lý nhóm, nhân viên sales, coach và chính sách chi trả.",
    ],
    features: [
      "Ma trận 2 chiều",
      "Snapshot tỷ lệ",
      "Phiếu chi tự động M10",
    ],
  },
  {
    id: "settings",
    code: "M12",
    title: "Cài Đặt Hệ Thống",
    subtitle:
      "10 tab cấu hình lõi dành cho Admin: doanh nghiệp, mẫu in, phân quyền, chi nhánh, thiết bị và khuyến mãi.",
    audience: "Admin",
    Icon: Settings,
    tone: "moduleSlate",
    metrics: ["10 tab", "6 chi nhánh", "12 mẫu in"],
    workflow: [
      "Admin cập nhật cấu hình hệ thống dùng chung cho tất cả module.",
      "Quản lý phân quyền theo module, mời Agent qua SSO và sơ đồ tổ chức.",
      "Khôi phục dữ liệu soft delete trong thùng rác 30 ngày.",
    ],
    screens: [
      "Header gradient Cài đặt hệ thống + thanh tab 10 mục.",
      "Tabs: Thông tin DN, Mẫu in, HĐĐT, Phân quyền, Chi nhánh, Sinh mã, Thiết bị, VAT, KM, Chung.",
      "Quản lý thiết bị check-in, mã tự sinh HV/CT/Vé và chính sách khuyến mãi.",
    ],
    features: [
      "Role based access",
      "Print templates",
      "VAT & promotion rules",
    ],
  },
  {
    id: "reports",
    code: "M14",
    title: "Báo cáo",
    subtitle:
      "Tập hợp báo cáo vận hành, doanh thu, check-in, hợp đồng, vé lẻ và hoa hồng theo chi nhánh.",
    audience: "Admin · Manager · Kế toán",
    Icon: FileBarChart,
    tone: "moduleGray",
    metrics: ["Doanh thu", "Check-in", "Công nợ"],
    workflow: [
      "Người dùng chọn chi nhánh, thời gian, module nguồn và trạng thái.",
      "Báo cáo tổng hợp dữ liệu từ HĐ, Vé lẻ, Teetime, Line, Check-in, Sổ Quỹ.",
      "Xuất Excel/PDF theo quyền và ghi audit log thao tác export.",
    ],
    screens: [
      "Dashboard báo cáo theo ngày/tuần/tháng/quý.",
      "Báo cáo doanh thu, check-in, hợp đồng, vé lẻ, hoa hồng, công nợ.",
      "Panel bộ lọc nâng cao và bảng chi tiết drill-down.",
    ],
    features: [
      "Export Excel/PDF",
      "Drill-down theo module",
      "Theo dõi chi nhánh",
    ],
  },
];

const settingsTabs = [
  "Thông tin DN",
  "Mẫu in",
  "HĐĐT",
  "Phân quyền",
  "Chi nhánh",
  "Sinh mã",
  "Thiết bị",
  "VAT",
  "Khuyến mãi",
  "Cài đặt chung",
];

export default function Home() {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1>Golf Manager</h1>
          <button type="button" aria-label="Thu gọn menu">
            <Menu size={20} strokeWidth={2} />
          </button>
        </div>

        <nav className={styles.navigation} aria-label="Menu quản trị">
          <p className={styles.navGroup}>Vận hành</p>
          {navigation.map((item) => {
            const Icon = item.Icon;

            return (
              <a
                className={item.href === "#dashboard" ? styles.activeNav : undefined}
                href={item.href}
                key={item.label}
              >
                <Icon size={19} strokeWidth={2} />
                {item.label}
              </a>
            );
          })}
        </nav>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <p>Thứ Ba, 7 tháng 4, 2026</p>

          <div className={styles.userTools}>
            <button className={styles.branchButton} type="button">
              <BriefcaseBusiness size={16} strokeWidth={1.8} />
              NextVision
              <ChevronDown size={16} strokeWidth={1.8} />
            </button>
            <span className={styles.role}>Admin</span>
            <span className={styles.avatar}>A</span>
          </div>
        </header>

        <section className={styles.dashboard} id="dashboard">
          <div className={styles.titleBlock}>
            <span className={styles.kicker}>SRS v3.0 · EPGA Golf Manager</span>
            <h2>Dashboard</h2>
            <p>Tổng quan hệ thống quản lý cơ sở thể thao theo chi nhánh đang chọn.</p>
          </div>

          <section className={styles.statsGrid} aria-label="Chỉ số tổng quan">
            {stats.map((item) => {
              const Icon = item.Icon;

              return (
                <article className={styles.statCard} key={item.label}>
                  <div>
                    <p>{item.label}</p>
                    <strong>{item.value}</strong>
                    <span>{item.trend}</span>
                  </div>
                  <span className={`${styles.statIcon} ${styles[item.tone]}`}>
                    <Icon size={24} strokeWidth={2} />
                  </span>
                </article>
              );
            })}
          </section>

          <section className={`${styles.card} ${styles.facilityCard}`}>
            <div className={styles.cardHeading}>
              <div>
                <h3>Tổng Quan Cơ Sở</h3>
                <p>Click vào card để đi sang màn chi tiết cơ sở tương ứng.</p>
              </div>
              <a href="#teetime">Xem lịch</a>
            </div>
            <div className={styles.facilityGrid}>
              {facilities.map((facility) => {
                const Icon = facility.Icon;

                return (
                  <article className={styles.facility} key={facility.name}>
                    <div className={styles.facilityTitle}>
                      <Icon size={20} strokeWidth={2} />
                      <h4>{facility.name}</h4>
                    </div>
                    <dl>
                      <div>
                        <dt>Đã đặt:</dt>
                        <dd>{facility.booked}</dd>
                      </div>
                      <div>
                        <dt>Còn trống:</dt>
                        <dd className={styles.positive}>{facility.available}</dd>
                      </div>
                      <div>
                        <dt>Doanh thu:</dt>
                        <dd>{facility.revenue}</dd>
                      </div>
                    </dl>
                  </article>
                );
              })}
            </div>
          </section>

          <section className={`${styles.card} ${styles.tableCard}`}>
            <div className={styles.cardHeading}>
              <div>
                <h3>Đặt Chỗ Gần Đây</h3>
                <p>5 booking mới nhất từ Teetime và Line Tập.</p>
              </div>
              <a href="#teetime">Xem tất cả</a>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Khách Hàng</th>
                    <th>Cơ Sở</th>
                    <th>Thời Gian</th>
                    <th>Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(([code, customer, facility, time, status]) => (
                    <tr key={code}>
                      <td>{code}</td>
                      <td>{customer}</td>
                      <td>{facility}</td>
                      <td>{time}</td>
                      <td>
                        <span
                          className={
                            status === "Đã Xác Nhận"
                              ? styles.confirmed
                              : styles.pending
                          }
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>

        <section className={styles.moduleOverview}>
          <div className={styles.sectionHeader}>
            <span className={styles.kicker}>Đầy đủ module theo SRS</span>
            <h2>Kiến trúc màn hình nghiệp vụ</h2>
            <p>
              Prototype bên dưới gom đủ module, flow, màn danh sách, form, dialog
              và các kết nối liên module để kiểm tra nghiệp vụ trước khi tách route.
            </p>
          </div>

          <div className={styles.moduleGrid}>
            {modules.map((module) => {
              const Icon = module.Icon;

              return (
                <a className={styles.moduleTile} href={`#${module.id}`} key={module.id}>
                  <span className={`${styles.moduleIcon} ${styles[module.tone]}`}>
                    <Icon size={22} strokeWidth={2} />
                  </span>
                  <small>{module.code}</small>
                  <strong>{module.title}</strong>
                  <p>{module.subtitle}</p>
                </a>
              );
            })}
          </div>
        </section>

        <section className={styles.flowBoard}>
          <div className={styles.sectionHeader}>
            <span className={styles.kicker}>End-to-end flow</span>
            <h2>Luồng vận hành chính</h2>
          </div>

          <div className={styles.flowGrid}>
            {[
              ["01", "Khách hàng", "Tạo hồ sơ, sinh mã HV, lưu sinh trắc học."],
              ["02", "Bán hàng", "Ký HĐ hoặc bán vé lẻ theo bảng giá active."],
              ["03", "Thanh toán", "Tự sinh phiếu thu/chi và cập nhật công nợ."],
              ["04", "Sử dụng dịch vụ", "Book teetime, line tập, HLV, lớp nhóm, check-in."],
              ["05", "Đối soát", "Hoa hồng, báo cáo doanh thu, check-in và công nợ."],
            ].map(([step, title, description]) => (
              <article className={styles.flowStep} key={step}>
                <span>{step}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.moduleSections}>
          {modules.map((module) => {
            const Icon = module.Icon;

            return (
              <article className={styles.moduleSection} id={module.id} key={module.id}>
                <div className={styles.moduleHeader}>
                  <span className={`${styles.moduleIcon} ${styles[module.tone]}`}>
                    <Icon size={24} strokeWidth={2} />
                  </span>
                  <div>
                    <small>{module.code} · {module.audience}</small>
                    <h2>{module.title}</h2>
                    <p>{module.subtitle}</p>
                  </div>
                </div>

                <div className={styles.metricRow}>
                  {module.metrics.map((metric) => (
                    <span key={metric}>{metric}</span>
                  ))}
                </div>

                <div className={styles.detailGrid}>
                  <div className={styles.detailPanel}>
                    <h3>Flow nghiệp vụ</h3>
                    <ol>
                      {module.workflow.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ol>
                  </div>

                  <div className={styles.detailPanel}>
                    <h3>Màn hình / Form / Dialog</h3>
                    <ul>
                      {module.screens.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.previewPanel}>
                    <h3>Tính năng trọng tâm</h3>
                    <div className={styles.featureList}>
                      {module.features.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </div>
                    {module.id === "settings" ? (
                      <div className={styles.settingsTabs}>
                        {settingsTabs.map((tab) => (
                          <span key={tab}>{tab}</span>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.mockScreen}>
                        <div />
                        <div />
                        <div />
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}

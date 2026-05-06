"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  Calendar,
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  DollarSign,
  Download,
  FileBarChart,
  FileText,
  Filter,
  Flag,
  Menu,
  Percent,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Target,
  Ticket,
  TrendingUp,
  Upload,
  Users,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import styles from "./page.module.css";

type ModuleKey =
  | "dashboard"
  | "customers"
  | "pricing"
  | "contracts"
  | "tickets"
  | "teetime"
  | "line"
  | "coach"
  | "classes"
  | "checkin"
  | "cashbook"
  | "commission"
  | "settings"
  | "reports";

type NavItem = {
  key: ModuleKey;
  label: string;
  Icon: LucideIcon;
};

const navItems: NavItem[] = [
  { key: "dashboard", label: "Dashboard", Icon: BarChart3 },
  { key: "customers", label: "Khách Hàng", Icon: Users },
  { key: "pricing", label: "Bảng Giá", Icon: SlidersHorizontal },
  { key: "contracts", label: "Hợp Đồng", Icon: FileText },
  { key: "tickets", label: "Vé Lẻ", Icon: Ticket },
  { key: "teetime", label: "Golf Teetime", Icon: Flag },
  { key: "line", label: "Golf Line Tập", Icon: Target },
  { key: "coach", label: "Lịch HLV", Icon: CalendarCheck },
  { key: "classes", label: "Lịch Lớp", Icon: CalendarDays },
  { key: "checkin", label: "Check-in/out", Icon: ClipboardCheck },
  { key: "cashbook", label: "Sổ Quỹ", Icon: WalletCards },
  { key: "commission", label: "Hoa Hồng Sale", Icon: Percent },
  { key: "settings", label: "Cài Đặt", Icon: Settings },
  { key: "reports", label: "Báo cáo", Icon: FileBarChart },
];

const recentBookings = [
  ["BK001", "Nguyễn Văn A", "Golf Teetime", "14:00 - 16:00", "Đã Xác Nhận"],
  ["BK002", "Trần Thị B", "Golf Teetime", "15:00 - 16:00", "Đã Xác Nhận"],
  ["BK003", "Lê Văn C", "Golf Line Tập", "16:00 - 17:00", "Chờ Xác Nhận"],
  ["BK004", "Phạm Văn D", "Golf Teetime", "09:00 - 11:00", "Đã Xác Nhận"],
  ["BK005", "Hoàng Thị E", "Golf Line Tập", "10:00 - 11:00", "Chờ Xác Nhận"],
];

const customers = [
  ["HV0001", "Nguyễn Văn A", "0901234567", "VIP", "Còn hạn", "12.5M"],
  ["HV0002", "Trần Thị B", "0912345678", "Premium", "Sắp hết hạn", "0"],
  ["HV0003", "Lê Văn C", "0987654321", "Standard", "Chưa đăng ký", "1.8M"],
  ["HV0004", "Hoàng Thị E", "0934567890", "Vãng lai", "Hết hạn", "0"],
];

const teetimeSlots = [
  ["06:00", "Trống", "green"],
  ["06:15", "Trống", "green"],
  ["06:30", "Nguyễn Văn A · 4 khách", "orange"],
  ["06:45", "Trống", "green"],
  ["07:00", "Trần Thị B · 2 khách", "orange"],
  ["07:15", "Trống", "green"],
  ["07:30", "Trống", "green"],
  ["07:45", "Lê Văn C · 6 khách", "orange"],
  ["08:00", "Trống", "green"],
  ["08:15", "Trống", "green"],
  ["08:30", "Bảo trì sân", "gray"],
  ["08:45", "Trống", "green"],
];

const lineSlots = Array.from({ length: 18 }, (_, index) => {
  const status = index % 6 === 0 ? "maintenance" : index % 3 === 0 ? "busy" : "free";
  return {
    name: `Line ${String(index + 1).padStart(2, "0")}`,
    status,
  };
});

export default function Home() {
  const [active, setActive] = useState<ModuleKey>("dashboard");
  const activeItem = useMemo(
    () => navItems.find((item) => item.key === active) ?? navItems[0],
    [active],
  );

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1>Golf Manager</h1>
          <button type="button" aria-label="Thu gọn menu">
            <Menu size={20} />
          </button>
        </div>

        <nav className={styles.navigation} aria-label="Menu quản trị">
          <p className={styles.navGroup}>Vận hành</p>
          {navItems.map((item) => {
            const Icon = item.Icon;
            return (
              <button
                className={active === item.key ? styles.activeNav : undefined}
                key={item.key}
                onClick={() => setActive(item.key)}
                type="button"
              >
                <Icon size={19} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <p>Thứ Ba, 7 tháng 4, 2026</p>
            <strong>{activeItem.label}</strong>
          </div>

          <div className={styles.userTools}>
            <button className={styles.branchButton} type="button">
              <BriefcaseBusiness size={16} />
              NextVision
              <ChevronDown size={16} />
            </button>
            <span className={styles.role}>Admin</span>
            <span className={styles.avatar}>A</span>
          </div>
        </header>

        <div className={styles.content}>
          {active === "dashboard" && <Dashboard onOpen={setActive} />}
          {active === "customers" && <CustomersScreen />}
          {active === "pricing" && <PricingScreen />}
          {active === "contracts" && <ContractsScreen />}
          {active === "tickets" && <TicketsScreen />}
          {active === "teetime" && <TeetimeScreen />}
          {active === "line" && <LineScreen />}
          {active === "coach" && <CoachScreen />}
          {active === "classes" && <ClassesScreen />}
          {active === "checkin" && <CheckinScreen />}
          {active === "cashbook" && <CashbookScreen />}
          {active === "commission" && <CommissionScreen />}
          {active === "settings" && <SettingsScreen />}
          {active === "reports" && <ReportsScreen />}
        </div>
      </main>
    </div>
  );
}

function Dashboard({ onOpen }: { onOpen: (key: ModuleKey) => void }) {
  const dashboardStats: Array<{
    label: string;
    value: string;
    trend: string;
    Icon: LucideIcon;
    tone: string;
  }> = [
    { label: "Tổng Đặt Chỗ Hôm Nay", value: "50", trend: "+12%", Icon: Calendar, tone: "blue" },
    { label: "Khách Hàng Hoạt Động", value: "1,234", trend: "+8%", Icon: Users, tone: "green" },
    { label: "Doanh Thu Hôm Nay", value: "17.3M VNĐ", trend: "+23%", Icon: DollarSign, tone: "amber" },
    { label: "Tỷ Lệ Sử Dụng", value: "78%", trend: "+5%", Icon: TrendingUp, tone: "purple" },
  ];

  const dashboardFacilities: Array<{
    name: string;
    booked: string;
    available: string;
    revenue: string;
    Icon: LucideIcon;
  }> = [
    { name: "Golf Teetime", booked: "32", available: "8", revenue: "12.5M VNĐ", Icon: Flag },
    { name: "Golf Line Tập", booked: "18", available: "12", revenue: "4.8M VNĐ", Icon: Target },
  ];

  return (
    <Screen title="Dashboard" subtitle="Tổng quan hệ thống quản lý cơ sở thể thao">
      <div className={styles.statsGrid}>
        {dashboardStats.map(({ Icon, label, tone, trend, value }) => {
          return (
            <article className={styles.statCard} key={label}>
              <div>
                <p>{label}</p>
                <strong>{value}</strong>
                <span>{trend}</span>
              </div>
              <span className={`${styles.statIcon} ${styles[tone]}`}>
                <Icon size={24} />
              </span>
            </article>
          );
        })}
      </div>

      <section className={styles.card}>
        <CardTitle title="Tổng Quan Cơ Sở" action="Mở lịch sân" onClick={() => onOpen("teetime")} />
        <div className={styles.facilityGrid}>
          {dashboardFacilities.map(({ Icon, available, booked, name, revenue }) => {
            return (
              <article className={styles.facility} key={name}>
                <div className={styles.facilityTitle}>
                  <Icon size={20} />
                  <h4>{name}</h4>
                </div>
                <dl>
                  <Row label="Đã đặt:" value={booked} />
                  <Row label="Còn trống:" value={available} positive />
                  <Row label="Doanh thu:" value={revenue} />
                </dl>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.card}>
        <CardTitle title="Đặt Chỗ Gần Đây" action="Xem tất cả" onClick={() => onOpen("teetime")} />
        <BookingTable />
      </section>
    </Screen>
  );
}

function CustomersScreen() {
  return (
    <Screen title="Khách Hàng" subtitle="Hồ sơ golfer, sinh trắc học, hợp đồng, giao dịch và kết quả tập luyện">
      <Toolbar primary="+ Thêm mới khách hàng" filters={["Tất cả", "Còn hạn", "Hết hạn", "Sắp hết hạn", "Chưa đăng ký"]} />
      <section className={styles.card}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã HV</th>
                <th>Họ và tên</th>
                <th>Số điện thoại</th>
                <th>Nhóm KH</th>
                <th>Trạng thái</th>
                <th>Công nợ</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(([code, name, phone, group, status, debt]) => (
                <tr key={code}>
                  <td className={styles.linkCell}>{code}</td>
                  <td>{name}</td>
                  <td>{phone}</td>
                  <td>{group}</td>
                  <td><StatusBadge status={status} /></td>
                  <td>{debt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <DetailLayout
        title="Modal chi tiết khách hàng"
        tabs={["Tổng quan", "Hợp đồng", "Giao dịch", "Check-in", "Tập luyện", "Inbody", "Meal Plan", "Trợ giảng"]}
        fields={["Mã HV tự sinh HV####", "SĐT không trùng trong chi nhánh", "FaceID / Vân tay / Thẻ", "Soft delete 30 ngày"]}
      />
    </Screen>
  );
}

function PricingScreen() {
  return (
    <Screen title="Bảng Giá" subtitle="Khu vực, Khung giờ, Bảng giá hợp đồng và Bảng giá vé lẻ">
      <Toolbar primary="Tạo Bảng Giá Mới" filters={["Bảng giá hợp đồng", "Bảng giá vé lẻ", "Khu vực", "Khung giờ"]} />
      <div className={styles.twoColumn}>
        <section className={styles.card}>
          <CardTitle title="Bảng giá hợp đồng" action="Nhập Excel" />
          <MiniTable rows={[["Gói Premium", "Teetime", "Active"], ["Gói Standard", "Line Tập", "Nháp"], ["Gói Family", "Combo", "Active"]]} />
        </section>
        <section className={styles.card}>
          <CardTitle title="Thiết lập phụ thuộc" action="Quản lý" />
          <Process steps={["Khu vực", "Khung giờ", "Bảng giá", "Kích hoạt"]} />
        </section>
      </div>
    </Screen>
  );
}

function ContractsScreen() {
  return (
    <Screen title="Hợp Đồng" subtitle="Quản lý vòng đời hợp đồng hội viên: ký mới, gia hạn, nâng cấp, bảo lưu, chuyển nhượng">
      <Toolbar primary="+ Tạo hợp đồng" filters={["Hợp đồng", "Gia hạn", "Nâng cấp", "Bảo lưu", "Chuyển nhượng", "Chuyển đổi HĐ"]} />
      <section className={styles.card}>
        <MiniTable rows={[["CT001", "Nguyễn Văn A", "Active"], ["CT002", "Trần Thị B", "Pending"], ["CT003", "Lê Văn C", "Expired"]]} />
      </section>
      <DetailLayout title="Form tạo hợp đồng 6 section" tabs={["Khách hàng", "Gói dịch vụ", "Thanh toán", "Hoa hồng", "Mẫu in", "Timeline"]} fields={["Chọn KH hoặc tạo mới", "Snapshot giá từ M02", "Sinh phiếu thu M10", "Audit contract_history"]} />
    </Screen>
  );
}

function TicketsScreen() {
  return (
    <Screen title="Vé Lẻ" subtitle="Bán vé đơn, vé nhóm, voucher và dịch vụ đi kèm">
      <Toolbar primary="+ Tạo vé mới" filters={["Danh sách vé", "Vouchers", "Dịch vụ đi kèm", "Vé lẻ", "Vé nhóm"]} />
      <div className={styles.statsGrid}>
        <SimpleMetric label="Vé hôm nay" value="72" />
        <SimpleMetric label="Doanh thu" value="8.6M" />
        <SimpleMetric label="Voucher active" value="9" />
        <SimpleMetric label="Add-ons" value="5" />
      </div>
      <section className={styles.card}>
        <MiniTable rows={[["VL001", "Khách vãng lai", "Confirmed"], ["VL002", "Nhóm 4 người", "Pending"], ["VC001", "Voucher 20%", "Active"]]} />
      </section>
    </Screen>
  );
}

function TeetimeScreen() {
  return (
    <Screen title="Golf Teetime" subtitle="Lưới khung giờ phát bóng theo ngày và chi nhánh">
      <Toolbar primary="Thiết lập teetime" filters={["Hôm nay", "NextVision", "Tất cả trạng thái"]} />
      <section className={styles.card}>
        <div className={styles.slotGrid}>
          {teetimeSlots.map(([time, label, tone]) => (
            <button className={`${styles.slot} ${styles[String(tone)]}`} key={time} type="button">
              <strong>{time}</strong>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>
      <DetailLayout title="Form đăng ký lịch chơi" tabs={["Khách đại diện", "Số khách", "Caddie", "Thanh toán", "Ghi chú"]} fields={["Ô xanh mở đăng ký", "Ô vàng mở chi tiết booking", "Đổi lịch / Hủy / Xóa", "Hoàn buổi vào HĐ khi hủy"]} />
    </Screen>
  );
}

function LineScreen() {
  return (
    <Screen title="Golf Line Tập" subtitle="Danh sách line, sơ đồ line, in vé và dịch vụ bán kèm">
      <Toolbar primary="+ Thêm mới Line" filters={["Danh sách Line", "Sơ đồ Line", "In vé lẻ", "Gia hạn giờ"]} />
      <section className={styles.card}>
        <div className={styles.lineGrid}>
          {lineSlots.map((line) => (
            <article className={`${styles.lineBox} ${styles[line.status]}`} key={line.name}>
              <strong>{line.name}</strong>
              <span>{line.status === "free" ? "Còn trống" : line.status === "busy" ? "Đang dùng" : "Bảo trì"}</span>
            </article>
          ))}
        </div>
      </section>
    </Screen>
  );
}

function CoachScreen() {
  return (
    <Screen title="Lịch HLV" subtitle="Calendar HLV × slot 15 phút cho buổi tập 1-1">
      <Toolbar primary="+ Đăng ký lịch tập" filters={["Chi nhánh", "HLV", "Trợ lý HLV", "Khách hàng", "Cấu hình booking"]} />
      <CalendarMatrix columns={["HLV Minh", "HLV An", "HLV Khoa", "HLV Trang"]} rows={["06:00", "06:15", "06:30", "06:45", "07:00", "07:15"]} />
    </Screen>
  );
}

function ClassesScreen() {
  return (
    <Screen title="Lịch Lớp" subtitle="Lớp học nhóm theo lịch tuần, booking và điểm danh">
      <Toolbar primary="+ Thêm lớp mới" filters={["Danh sách lớp", "Lịch tuần", "Điểm danh"]} />
      <div className={styles.cardGrid}>
        {["Beginner Kids", "Advanced Swing", "Weekend Group"].map((name) => (
          <article className={styles.classCard} key={name}>
            <strong>{name}</strong>
            <span>12 học viên · 3 buổi/tuần</span>
            <p>Thứ 2, 4, 6 · 17:30 - 19:00</p>
          </article>
        ))}
      </div>
    </Screen>
  );
}

function CheckinScreen() {
  return (
    <Screen title="Check-in / Checkout" subtitle="Realtime lượt vào/ra, thiết bị và sinh trắc học">
      <Toolbar primary="Check-in thủ công" filters={["Danh sách Check-in", "Thiết bị", "FaceID", "Vân tay", "Thẻ"]} />
      <div className={styles.twoColumn}>
        <section className={styles.card}>
          <MiniTable rows={[["HV0001", "07:12", "Đang trong sân"], ["HV0002", "08:05", "Đã checkout"], ["HV0003", "08:20", "Chờ xác nhận"]]} />
        </section>
        <DetailLayout title="Panel chi tiết lượt vào/ra" tabs={["Khách hàng", "Hợp đồng", "Thiết bị", "Khu vực"]} fields={["FaceID matched", "Thiết bị cổng 01", "Khu vực Teetime", "Checkout 10:35"]} compact />
      </div>
    </Screen>
  );
}

function CashbookScreen() {
  return (
    <Screen title="Sổ Quỹ" subtitle="Phiếu thu, phiếu chi, công nợ và chứng từ tự sinh">
      <Toolbar primary="+ Phiếu thu" filters={["Phiếu thu", "Phiếu chi", "Công nợ", "Hôm nay", "Đã hạch toán"]} />
      <div className={styles.statsGrid}>
        <SimpleMetric label="Tổng thu" value="17.3M" />
        <SimpleMetric label="Tổng chi" value="2.1M" />
        <SimpleMetric label="Công nợ" value="8.4M" />
        <SimpleMetric label="Phiếu tự sinh" value="23" />
      </div>
      <section className={styles.card}>
        <MiniTable rows={[["PT001", "Hợp đồng CT001", "12.5M"], ["PT002", "Vé lẻ VL001", "650K"], ["PC001", "Hoa hồng HLV", "1.2M"]]} />
      </section>
    </Screen>
  );
}

function CommissionScreen() {
  return (
    <Screen title="Hoa Hồng Sale" subtitle="Ma trận hoa hồng Sales và Coach, lịch sử chi trả">
      <Toolbar primary="+ Cấu hình hoa hồng" filters={["Ma trận Hoa hồng", "Lịch sử chi trả", "Sales", "Coach"]} />
      <section className={styles.card}>
        <div className={styles.matrix}>
          {["VIP × Teetime 8%", "Premium × Line 6%", "Coach × Buổi tập 120K", "Sale × HĐ mới 10%"].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>
    </Screen>
  );
}

function SettingsScreen() {
  return (
    <Screen title="Cài Đặt Hệ Thống" subtitle="10 tab cấu hình lõi dành cho Admin">
      <Toolbar primary="Lưu cấu hình" filters={["Thông tin DN", "Mẫu in", "HĐĐT", "Phân quyền", "Chi nhánh", "Sinh mã", "Thiết bị", "VAT", "Khuyến mãi", "Chung"]} />
      <DetailLayout title="Thông tin doanh nghiệp" tabs={["Hồ sơ", "Mẫu in", "Phân quyền", "Thiết bị"]} fields={["Tên doanh nghiệp", "Mã số thuế", "Chi nhánh mặc định", "Múi giờ GMT+7"]} />
    </Screen>
  );
}

function ReportsScreen() {
  return (
    <Screen title="Báo cáo" subtitle="Doanh thu, check-in, hợp đồng, vé lẻ, hoa hồng và công nợ">
      <Toolbar primary="Xuất báo cáo" filters={["Doanh thu", "Check-in", "Hợp đồng", "Vé lẻ", "Hoa hồng", "Công nợ"]} />
      <div className={styles.reportGrid}>
        <SimpleMetric label="Doanh thu tháng" value="486M" />
        <SimpleMetric label="Lượt check-in" value="2,842" />
        <SimpleMetric label="Hợp đồng mới" value="64" />
      </div>
      <section className={styles.card}>
        <div className={styles.chartBars}>
          {[40, 64, 48, 72, 58, 84, 68, 92].map((height, index) => (
            <span key={index} style={{ height: `${height}%` }} />
          ))}
        </div>
      </section>
    </Screen>
  );
}

function Screen({ children, subtitle, title }: { children: React.ReactNode; subtitle: string; title: string }) {
  return (
    <section className={styles.screen}>
      <div className={styles.titleBlock}>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function Toolbar({ filters, primary }: { filters: string[]; primary: string }) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.searchBox}>
        <Search size={18} />
        <span>Tìm kiếm theo mã, tên, SĐT...</span>
      </div>
      <div className={styles.chips}>
        {filters.map((filter, index) => (
          <button className={index === 0 ? styles.activeChip : undefined} key={filter} type="button">
            {filter}
          </button>
        ))}
      </div>
      <button className={styles.iconButton} type="button"><Filter size={18} /></button>
      <button className={styles.iconButton} type="button"><Upload size={18} /></button>
      <button className={styles.iconButton} type="button"><Download size={18} /></button>
      <button className={styles.primaryButton} type="button"><Plus size={18} />{primary}</button>
    </div>
  );
}

function CardTitle({ action, onClick, title }: { action?: string; onClick?: () => void; title: string }) {
  return (
    <div className={styles.cardHeading}>
      <h3>{title}</h3>
      {action ? <button onClick={onClick} type="button">{action}</button> : null}
    </div>
  );
}

function Row({ label, positive, value }: { label: string; positive?: boolean; value: React.ReactNode }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className={positive ? styles.positive : undefined}>{value}</dd>
    </div>
  );
}

function BookingTable() {
  return (
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
          {recentBookings.map(([code, customer, facility, time, status]) => (
            <tr key={code}>
              <td className={styles.linkCell}>{code}</td>
              <td>{customer}</td>
              <td>{facility}</td>
              <td>{time}</td>
              <td><StatusBadge status={status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status.includes("Xác Nhận") || status.includes("Còn hạn") || status.includes("Active")
      ? styles.confirmed
      : status.includes("Chờ") || status.includes("Sắp")
        ? styles.pending
        : status.includes("Hết")
          ? styles.danger
          : styles.neutral;
  return <span className={className}>{status}</span>;
}

function SimpleMetric({ label, value }: { label: string; value: string }) {
  return (
    <article className={styles.simpleMetric}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function MiniTable({ rows }: { rows: string[][] }) {
  return (
    <div className={styles.miniRows}>
      {rows.map((row) => (
        <div key={row.join("-")}>
          {row.map((cell, index) => (
            <span key={cell} className={index === 0 ? styles.linkCell : undefined}>{cell}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

function DetailLayout({ compact, fields, tabs, title }: { compact?: boolean; fields: string[]; tabs: string[]; title: string }) {
  return (
    <section className={`${styles.detailLayout} ${compact ? styles.compactDetail : ""}`}>
      <div className={styles.cardHeading}>
        <h3>{title}</h3>
      </div>
      <div className={styles.tabs}>
        {tabs.map((tab, index) => (
          <button className={index === 0 ? styles.activeChip : undefined} key={tab} type="button">{tab}</button>
        ))}
      </div>
      <div className={styles.formPreview}>
        {fields.map((field) => (
          <label key={field}>
            <span>{field}</span>
            <input readOnly value="Dữ liệu mẫu theo SRS" />
          </label>
        ))}
      </div>
    </section>
  );
}

function Process({ steps }: { steps: string[] }) {
  return (
    <div className={styles.process}>
      {steps.map((step, index) => (
        <article key={step}>
          <span>{index + 1}</span>
          <strong>{step}</strong>
        </article>
      ))}
    </div>
  );
}

function CalendarMatrix({ columns, rows }: { columns: string[]; rows: string[] }) {
  return (
    <section className={styles.card}>
      <div className={styles.calendarMatrix}>
        <span />
        {columns.map((column) => <strong key={column}>{column}</strong>)}
        {rows.map((row, rowIndex) => (
          <>
            <time key={`${row}-time`}>{row}</time>
            {columns.map((column, columnIndex) => (
              <button
                className={(rowIndex + columnIndex) % 3 === 0 ? styles.bookedCell : styles.emptyCell}
                key={`${row}-${column}`}
                type="button"
              >
                {(rowIndex + columnIndex) % 3 === 0 ? "Đã đặt" : "Trống"}
              </button>
            ))}
          </>
        ))}
      </div>
    </section>
  );
}

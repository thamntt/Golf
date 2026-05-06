"use client";

import { useState, type FormEvent } from "react";
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
  Edit,
  FileBarChart,
  FileText,
  Filter,
  Flag,
  Mail,
  Menu,
  Percent,
  Phone,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Target,
  Ticket,
  TrendingUp,
  Upload,
  UploadCloud,
  User,
  UserPlus,
  Users,
  WalletCards,
  X,
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

const customerRows = [
  {
    code: "HV001",
    name: "Nguyễn Văn A",
    phone: "0901234567",
    email: "nguyenvana@gmail.com",
    gender: "Nam",
    birth: "15/5/1990",
    status: "Hết hạn",
    cards: ["green", "red"],
    registerDate: "15/1/2024",
    endDate: "15/7/2024",
    createdDate: "10/1/2024",
    creator: "Admin",
    debt: "1.500.000 VND",
  },
  {
    code: "HV002",
    name: "Trần Thị B",
    phone: "0901234567s",
    email: "tranthib@gmail.com",
    gender: "Nữ",
    birth: "20/8/1995",
    status: "Còn hạn",
    cards: ["green", "red"],
    registerDate: "1/2/2024",
    endDate: "31/12/2026",
    createdDate: "28/1/2024",
    creator: "Nguyễn Văn Thành",
    debt: "0 VND",
  },
  {
    code: "HV003",
    name: "Lê Văn C",
    phone: "0923456789",
    email: "levanc@gmail.com",
    gender: "Nam",
    birth: "10/12/1988",
    status: "Hết hạn",
    cards: ["red", "red"],
    registerDate: "1/11/2023",
    endDate: "1/2/2024",
    createdDate: "25/10/2023",
    creator: "Admin",
    debt: "2.800.000 VND",
  },
  {
    code: "HV004",
    name: "Phạm Thị D",
    phone: "0934567890",
    email: "phamthid@gmail.com",
    gender: "Nữ",
    birth: "25/3/1992",
    status: "Chưa đăng ký",
    cards: ["amber"],
    registerDate: "---",
    endDate: "---",
    createdDate: "5/3/2024",
    creator: "Trần Minh Hoàng",
    debt: "0 VND",
  },
  {
    code: "HV005",
    name: "Huỳnh Xuân Long",
    phone: "0910070932",
    email: "member5@gmail.com",
    gender: "Nam",
    birth: "6/8/1975",
    status: "Hết hạn",
    cards: ["red"],
    registerDate: "1/6/2023",
    endDate: "1/9/2023",
    createdDate: "20/5/2023",
    creator: "Admin",
    debt: "500.000 VND",
  },
  {
    code: "HV006",
    name: "Phan Ngọc Hà",
    phone: "0310078551",
    email: "member6@gmail.com",
    gender: "Nữ",
    birth: "7/7/1976",
    status: "Chưa đăng ký",
    cards: [],
    registerDate: "---",
    endDate: "---",
    createdDate: "12/2/2024",
    creator: "Lê Thị Mai",
    debt: "0 VND",
  },
  {
    code: "HV007",
    name: "Vũ Hồng Nhất",
    phone: "0510086770",
    email: "member7@gmail.com",
    gender: "Nam",
    birth: "8/8/1977",
    status: "Còn hạn",
    cards: ["green", "red"],
    registerDate: "1/8/2025",
    endDate: "1/8/2026",
    createdDate: "15/7/2025",
    creator: "Nguyễn Văn Thành",
    debt: "0 VND",
  },
  {
    code: "HV008",
    name: "Võ Đức Hiếu",
    phone: "0710094689",
    email: "member8@gmail.com",
    gender: "Nam",
    birth: "9/9/1978",
    status: "Hết hạn",
    cards: ["green", "red"],
    registerDate: "1/9/2022",
    endDate: "1/10/2022",
    createdDate: "20/8/2022",
    creator: "Admin",
    debt: "3.200.000 VND",
  },
  {
    code: "HV009",
    name: "Đặng Hồng Châu",
    phone: "0810102608",
    email: "member9@gmail.com",
    gender: "Nữ",
    birth: "10/10/1979",
    status: "Hết hạn",
    cards: [],
    registerDate: "1/10/2023",
    endDate: "1/1/2024",
    createdDate: "25/9/2023",
    creator: "Trần Minh Hoàng",
    debt: "1.200.000 VND",
  },
  {
    code: "HV010",
    name: "Bùi Trung Đông",
    phone: "0910110527",
    email: "member10@gmail.com",
    gender: "Nam",
    birth: "11/11/1980",
    status: "Hết hạn",
    cards: ["amber"],
    registerDate: "1/11/2024",
    endDate: "1/5/2025",
    createdDate: "28/10/2024",
    creator: "Lê Thị Mai",
    debt: "800.000 VND",
  },
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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`${styles.shell} ${collapsed ? styles.collapsedShell : ""}`}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1>Golf Manager</h1>
          <button
            aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
            onClick={() => setCollapsed((value) => !value)}
            type="button"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className={styles.navigation} aria-label="Menu quản trị">
          {navItems.map((item) => {
            const Icon = item.Icon;
            return (
              <button
                className={active === item.key ? styles.activeNav : undefined}
                key={item.key}
                onClick={() => setActive(item.key)}
                type="button"
                title={collapsed ? item.label : undefined}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <p>Thứ Ba, 7 tháng 4, 2026</p>
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
  const [addOpen, setAddOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState("Thông tin cơ bản");
  const [nestedModal, setNestedModal] = useState<"group" | "companion" | null>(null);
  const [rows, setRows] = useState(customerRows);
  const [query, setQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState("Tất cả");
  const [filterOpen, setFilterOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [activeAdvancedFilter, setActiveAdvancedFilter] = useState<string | null>(null);

  const quickFilters = ["Tất cả", "Còn hạn", "Hết hạn", "Sắp hết hạn", "Chưa đăng ký"];
  const filteredRows = rows.filter((customer) => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery = normalizedQuery
      ? [customer.code, customer.name, customer.phone, customer.email, customer.creator]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      : true;
    const matchesQuickFilter = quickFilter === "Tất cả" ? true : customer.status === quickFilter;
    const matchesAdvancedFilter = activeAdvancedFilter ? customer.status === activeAdvancedFilter : true;
    return matchesQuery && matchesQuickFilter && matchesAdvancedFilter;
  });

  const handleCreateCustomer = (customer: (typeof customerRows)[number]) => {
    setRows((current) => [customer, ...current]);
    setQuickFilter("Tất cả");
    setActiveAdvancedFilter(null);
  };

  return (
    <>
      <section className={styles.customerScreen}>
        <div className={styles.customerToolbar}>
          <h2>Danh sách thành viên</h2>
          <div className={styles.customerActions}>
            <div className={styles.customerSearch}>
              <Search size={18} />
              <input
                aria-label="Tìm kiếm hội viên"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm kiếm..."
                value={query}
              />
            </div>
            <button className={styles.blueButton} onClick={() => setAddOpen(true)} type="button">
              <Plus size={18} />
              Thêm mới
            </button>
            <button className={styles.squareButton} onClick={() => setFilterOpen((value) => !value)} type="button">
              <Filter size={18} />
            </button>
            <button className={styles.squareButton} onClick={() => setSettingsOpen((value) => !value)} type="button">
              <Settings size={18} />
            </button>
            <button className={styles.greenButton} onClick={() => setExportOpen((value) => !value)} type="button">
              <Download size={18} />
              Nhập xuất
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        <div className={styles.quickFilters}>
          {quickFilters.map((filter) => (
            <button
              className={quickFilter === filter ? styles.activeFilterChip : undefined}
              key={filter}
              onClick={() => setQuickFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>

        {filterOpen ? (
          <section className={styles.advancedPanel}>
            <h3>Bộ lọc nâng cao</h3>
            <div className={styles.advancedGrid}>
              <label>Ngày hết hạn<select><option>Toàn thời gian</option><option>Lựa chọn khác</option></select></label>
              <label>Ngày sinh<select><option>Toàn thời gian</option><option>Trong tháng này</option></select></label>
              <label>Ngày đăng ký<select><option>30 ngày gần đây</option><option>Quý này</option></select></label>
              <label>Giới tính<select><option>Tất cả</option><option>Nam</option><option>Nữ</option></select></label>
              <label>Nhóm khách hàng<select><option>Tất cả</option><option>VIP</option><option>Premium</option><option>Standard</option></select></label>
              <label>
                Trạng thái
                <select onChange={(event) => setActiveAdvancedFilter(event.target.value || null)} value={activeAdvancedFilter ?? ""}>
                  <option value="">Tất cả</option>
                  <option>Còn hạn</option>
                  <option>Hết hạn</option>
                  <option>Chưa đăng ký</option>
                </select>
              </label>
              <label>Sinh trắc học<select><option>Có</option><option>Chưa</option><option>Face</option><option>Vân tay</option><option>Thẻ</option></select></label>
              <label>Nhân viên phụ trách<select><option>Tất cả</option><option>Admin</option><option>Nguyễn Văn Thành</option><option>Lê Thị Mai</option></select></label>
            </div>
            <footer>
              <button onClick={() => { setActiveAdvancedFilter(null); setQuickFilter("Tất cả"); }} type="button">Xóa bộ lọc</button>
              <button className={styles.blueButton} onClick={() => setFilterOpen(false)} type="button">Áp dụng lọc</button>
            </footer>
          </section>
        ) : null}

        {settingsOpen ? (
          <section className={styles.advancedPanel}>
            <h3>Cài đặt cột hiển thị</h3>
            <div className={styles.columnGrid}>
              {["Mã HV", "Họ và tên", "Số điện thoại", "Email", "Sinh trắc học", "Trạng thái", "Thẻ", "Công nợ"].map((column) => (
                <label key={column}><input defaultChecked type="checkbox" /> {column}</label>
              ))}
            </div>
          </section>
        ) : null}

        {exportOpen ? (
          <section className={styles.exportMenu}>
            <button type="button"><Upload size={16} /> Nhập Excel</button>
            <button type="button"><Download size={16} /> Xuất Excel</button>
            <button type="button">Tải file mẫu import</button>
          </section>
        ) : null}

        <section className={styles.memberTableCard}>
          <div className={styles.memberTableWrap}>
            <table className={styles.memberTable}>
              <thead>
                <tr>
                  <th>Mã HV</th>
                  <th>Họ và tên</th>
                  <th>Số điện thoại</th>
                  <th>Email</th>
                  <th>Giới tính</th>
                  <th>Ngày sinh</th>
                  <th>Sinh trắc học</th>
                  <th>Trạng thái</th>
                  <th>Thẻ</th>
                  <th>Nhóm KH</th>
                  <th>Nguồn KH</th>
                  <th>Ngày đăng ký</th>
                  <th>Ngày hết hạn</th>
                  <th>Ngày tạo</th>
                  <th>Người tạo</th>
                  <th>Công nợ</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((customer) => (
                  <tr key={customer.code}>
                    <td>
                      <button
                        className={styles.memberCode}
                        onClick={() => {
                          setDetailTab("Thông tin cơ bản");
                          setDetailOpen(true);
                        }}
                        type="button"
                      >
                        {customer.code}
                      </button>
                    </td>
                    <td className={styles.memberName}>{customer.name}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.email}</td>
                    <td>{customer.gender}</td>
                    <td>{customer.birth}</td>
                    <td><BiometricBadges /></td>
                    <td><CustomerStatus status={customer.status} /></td>
                    <td>
                      <div className={styles.cardDots}>
                        {customer.cards.map((card, index) => (
                          <span className={styles[`${card}Dot`]} key={`${customer.code}-${card}-${index}`} />
                        ))}
                        <button type="button">+</button>
                      </div>
                    </td>
                    <td className={styles.mutedCell}>---</td>
                    <td className={styles.mutedCell}>---</td>
                    <td className={customer.registerDate === "---" ? styles.mutedCell : styles.dateGreen}>{customer.registerDate}</td>
                    <td className={customer.endDate === "---" ? styles.mutedCell : styles.dateRed}>{customer.endDate}</td>
                    <td className={styles.dateGreen}>{customer.createdDate}</td>
                    <td>{customer.creator}</td>
                    <td>{customer.debt}</td>
                  </tr>
                ))}
                {filteredRows.length === 0 ? (
                  <tr>
                    <td className={styles.emptyTableCell} colSpan={16}>
                      Không có hội viên phù hợp với điều kiện tìm kiếm/lọc.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <div className={styles.pagination}>
            <span>Hiển thị {filteredRows.length ? 1 : 0} - {filteredRows.length} / {filteredRows.length} hội viên</span>
            <span>Hiển thị: <input aria-label="Số dòng mỗi trang" defaultValue={10} /> / trang</span>
            <div>
              <button type="button">Trước</button>
              <button className={styles.currentPage} type="button">1</button>
              <button type="button">Sau</button>
            </div>
          </div>
        </section>
      </section>

      {addOpen ? (
        <AddCustomerModal
          nestedModal={nestedModal}
          onCreate={handleCreateCustomer}
          onClose={() => {
            setAddOpen(false);
            setNestedModal(null);
          }}
          onOpenNested={setNestedModal}
        />
      ) : null}

      {nestedModal === "group" ? <AddGroupModal onClose={() => setNestedModal(null)} /> : null}
      {nestedModal === "companion" ? <AddCompanionModal onClose={() => setNestedModal(null)} /> : null}

      {detailOpen ? (
        <CustomerDetailModal
          activeTab={detailTab}
          onChangeTab={setDetailTab}
          onClose={() => setDetailOpen(false)}
        />
      ) : null}
    </>
  );
}

function AddCustomerModal({
  nestedModal,
  onCreate,
  onClose,
  onOpenNested,
}: {
  nestedModal: "group" | "companion" | null;
  onCreate: (customer: (typeof customerRows)[number]) => void;
  onClose: () => void;
  onOpenNested: (modal: "group" | "companion") => void;
}) {
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();

    if (!name || !phone) {
      setError("Họ và tên và Số điện thoại là bắt buộc theo SRS.");
      return;
    }

    onCreate({
      birth: String(data.get("birth") ?? "---") || "---",
      cards: ["green"],
      code: "HV" + String(customerRows.length + 1).padStart(3, "0"),
      createdDate: "7/4/2026",
      creator: "Admin",
      debt: "0 VND",
      email: String(data.get("email") ?? ""),
      endDate: "---",
      gender: String(data.get("gender") ?? "Nam") || "Nam",
      name,
      phone,
      registerDate: "---",
      status: "Chưa đăng ký",
    });
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <form className={`${styles.modalShell} ${nestedModal ? styles.dimmedModal : ""}`} onSubmit={handleSubmit}>
        <header className={styles.modalHeader}>
          <div>
            <h2>Thêm mới khách hàng</h2>
            <p>Điền thông tin hội viên mới vào form bên dưới</p>
          </div>
          <button onClick={onClose} type="button"><X size={22} /></button>
        </header>

        <div className={styles.modalBody}>
          {error ? <p className={styles.formError}>{error}</p> : null}
          <h3>Thông tin khách hàng</h3>
          <div className={styles.formGrid}>
            <FormField action="Tự động" label="Mã hội viên" name="code" value="HV1001" />
            <FormField action="Tự động" label="Mã sinh trắc học" name="biometricCode" value="12345678" />
            <FormField required label="Họ và tên" name="name" placeholder="Nhập họ và tên" />
            <FormField required label="Số điện thoại" name="phone" placeholder="Nhập số điện thoại" />
            <FormField label="Email" name="email" placeholder="Nhập email" />
            <FormField label="Ngày sinh" name="birth" type="date" />
            <FormField label="Nhân viên phụ trách" />
            <FormField label="Thẻ khách hàng" placeholder="Nhập số thẻ" />
            <FormField
              action="Thêm mới"
              label="Nhóm khách hàng"
              onAction={() => onOpenNested("group")}
            />
          </div>
          <FormField area label="Ghi chú" placeholder="Nhập ghi chú về khách hàng..." />
          <FormField
            action="Thêm mới"
            label="Nguồn khách hàng"
          />

          <div className={styles.formDivider} />
          <div className={styles.customFieldRow}>
            <strong>Trường tùy chỉnh (0)</strong>
            <button type="button">Quản lý trường</button>
            <p>Chưa có trường tùy chỉnh nào được thêm</p>
          </div>

          <div className={styles.formDivider} />
          <button className={styles.collapseButton} type="button">⌃ Ẩn bớt</button>

          <div className={styles.formGrid}>
            <FormField label="Số CMND/CCCD" placeholder="Nhập số CMND/CCCD" />
            <FormField label="Giới tính" name="gender" placeholder="Nam / Nữ" />
            <FormField
              action="Thêm"
              label="Người đi cùng"
              onAction={() => onOpenNested("companion")}
              placeholder="Không có"
            />
            <FormField label="Người liên hệ" placeholder="Tên người liên hệ" />
            <FormField label="SĐT liên hệ" placeholder="Số điện thoại" />
            <FormField label="Tỉnh/Thành phố" />
            <FormField label="Phường/Xã" />
          </div>
          <FormField label="Thôn/Xóm/Số nhà" placeholder="Nhập địa chỉ chi tiết" />
          <FormField area label="Ghi chú" placeholder="Nhập ghi chú" />
        </div>

        <footer className={styles.modalFooter}>
          <button onClick={onClose} type="button">Hủy bỏ</button>
          <button className={styles.blueButton} type="submit">Thêm hội viên</button>
        </footer>
      </form>
    </div>
  );
}

function AddGroupModal({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.nestedOverlay}>
      <section className={styles.smallModal}>
        <header>
          <h2>Thêm nhóm khách hàng</h2>
          <button onClick={onClose} type="button"><X size={20} /></button>
        </header>
        <div className={styles.smallModalBody}>
          <FormField action="Tự động" required label="Mã nhóm" value="NG001" />
          <FormField required label="Tên nhóm" placeholder="Nhập tên nhóm khách hàng" />
          <FormField label="Mô tả" placeholder="Nhập mô tả" />
        </div>
        <footer>
          <button onClick={onClose} type="button">Hủy bỏ</button>
          <button className={styles.blueButton} type="button">Thêm</button>
        </footer>
      </section>
    </div>
  );
}

function AddCompanionModal({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.nestedOverlay}>
      <section className={styles.companionModal}>
        <header>
          <h2>Thêm người đi cùng</h2>
          <button onClick={onClose} type="button"><X size={20} /></button>
        </header>
        <div className={styles.companionBody}>
          <div>
            <label>Ảnh <b>*</b></label>
            <div className={styles.uploadBox}>
              <UploadCloud size={42} />
              <span>Tải ảnh lên</span>
            </div>
            <button className={styles.greenButton} type="button">Webcam</button>
          </div>
          <div className={styles.companionFields}>
            <FormField required label="Họ và tên" placeholder="Họ tên người đi cùng" />
            <div className={styles.radioRow}>
              <span className={styles.radioActive} /> Nam
              <span className={styles.radio} /> Nữ
            </div>
            <FormField label="Nhóm quan hệ" placeholder="Nhóm quan hệ" />
            <FormField label="Ghi chú" placeholder="Ghi chú" />
          </div>
          <FormField label="Ngày sinh" />
          <div className={styles.formGrid}>
            <FormField label="Chiều cao (m)" value="1.70" />
            <FormField label="Cân nặng (kg)" value="65" />
          </div>
        </div>
        <footer>
          <button className={styles.greenButton} type="button">+ Thêm người đi cùng</button>
        </footer>
      </section>
    </div>
  );
}

function CustomerDetailModal({
  activeTab,
  onChangeTab,
  onClose,
}: {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  onClose: () => void;
}) {
  const tabs = ["Thông tin cơ bản", "Hợp đồng", "Lịch sử giao dịch", "Lịch sử checkin", "Kết quả tập luyện", "Inbody", "Meal Plan", "Thông tin TA"];

  return (
    <div className={styles.modalOverlay}>
      <section className={styles.detailModal}>
        <header className={styles.detailHeader}>
          <div className={styles.detailIdentity}>
            <span>N</span>
            <div>
              <h2>Nguyễn Văn A</h2>
              <p>Mã hội viên: HV001</p>
            </div>
          </div>
          <div>
            <button className={styles.blueButton} type="button"><Edit size={17} />Chỉnh sửa</button>
            <button onClick={onClose} type="button"><X size={22} /></button>
          </div>
        </header>

        <nav className={styles.detailTabs}>
          {tabs.map((tab) => (
            <button
              className={activeTab === tab ? styles.activeDetailTab : undefined}
              key={tab}
              onClick={() => onChangeTab(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className={styles.detailBody}>
          <CustomerDetailTab activeTab={activeTab} />
        </div>

        <footer className={styles.modalFooter}>
          <button onClick={onClose} type="button">Đóng</button>
        </footer>
      </section>
    </div>
  );
}

function CustomerDetailTab({ activeTab }: { activeTab: string }) {
  if (activeTab === "Hợp đồng") {
    return <ContractsTab />;
  }

  if (activeTab === "Lịch sử giao dịch") {
    return (
      <section className={styles.detailCard}>
        <h3>Lịch sử giao dịch</h3>
        <MiniTable rows={[["PT001", "Thu hợp đồng Golf Teetime - VIP", "15.000.000 VND"], ["PT002", "Thu vé lẻ Line tập", "650.000 VND"], ["CN001", "Công nợ còn lại", "1.500.000 VND"]]} />
      </section>
    );
  }

  if (activeTab === "Lịch sử checkin") {
    return (
      <section className={styles.detailCard}>
        <h3>Lịch sử check-in</h3>
        <div className={styles.chartBars}>{[42, 56, 38, 70, 64, 82].map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}</div>
        <MiniTable rows={[["7/4/2026", "Golf Teetime", "08:00 - 10:00"], ["5/4/2026", "Golf Line Tập", "16:00 - 17:00"]]} />
      </section>
    );
  }

  if (activeTab === "Kết quả tập luyện") {
    return (
      <section className={styles.detailCard}>
        <h3>Kết quả tập luyện <button className={styles.blueButton} type="button"><Plus size={16} />Thêm kết quả</button></h3>
        <div className={styles.statsGrid}>
          <SimpleMetric label="Điểm TB" value="82" />
          <SimpleMetric label="Handicap WHS" value="18.4" />
          <SimpleMetric label="Tổng buổi" value="24" />
          <SimpleMetric label="Giờ tập" value="36h" />
        </div>
        <MiniTable rows={[["24/04/2026 · Thứ 5", "Buổi 5", "Swing cơ bản · HLV Minh"], ["18/04/2026 · Thứ 6", "Buổi 4", "Putting và short game"]]} />
      </section>
    );
  }

  if (activeTab === "Inbody") {
    return (
      <section className={styles.detailCard}>
        <h3>Inbody <button className={styles.blueButton} type="button"><Plus size={16} />Thêm</button></h3>
        <div className={styles.detailThree}>
          {["Cân nặng 65kg", "Cơ xương 31.2kg", "Mỡ cơ thể 18%", "BMI 22.4", "Carry 168 yards", "Spin Rate 2,450rpm"].map((item) => (
            <InfoBlock key={item} label={item.split(" ")[0]}>{item.replace(item.split(" ")[0], "").trim()}</InfoBlock>
          ))}
        </div>
      </section>
    );
  }

  if (activeTab === "Meal Plan") {
    return (
      <section className={styles.detailCard}>
        <h3>Meal Plan <button className={styles.blueButton} type="button"><Plus size={16} />Thêm kế hoạch</button></h3>
        <div className={styles.detailTwo}>
          <InfoBlock label="Kế hoạch">Giảm mỡ - Tăng cơ</InfoBlock>
          <InfoBlock label="Mục tiêu ngày">2,100 kcal · 130g protein</InfoBlock>
        </div>
        <MiniTable rows={[["07:00", "Bữa sáng", "450 kcal · 32g protein"], ["10:00", "Bữa phụ", "220 kcal · 18g protein"], ["12:30", "Bữa trưa", "620 kcal · 42g protein"]]} />
      </section>
    );
  }

  if (activeTab === "Thông tin TA") {
    return (
      <section className={styles.detailCard}>
        <h3>Thông tin TA <button className={styles.greenButton} type="button"><Plus size={16} />Gán TA mới</button></h3>
        <MiniTable rows={[["TA001", "Lê Minh Anh", "Thứ 2-4-6 · 17:30", "Ghi chú: hỗ trợ swing"], ["TA002", "Phạm Hoàng Nam", "Cuối tuần · 08:00", "Hỗ trợ short game"]]} />
      </section>
    );
  }

  return <BasicInfoTab />;
}

function BasicInfoTab() {
  return (
    <>
      <section className={styles.detailCard}>
        <h3>Trạng thái & Thẻ</h3>
        <div className={styles.detailThree}>
          <InfoBlock label="Trạng thái"><CustomerStatus status="Hết hạn" /></InfoBlock>
          <InfoBlock label="Thẻ hội viên"><div className={styles.cardDots}><span className={styles.greenDot} /><span className={styles.redDot} /></div></InfoBlock>
          <InfoBlock label="Sinh trắc học"><BiometricBadges /></InfoBlock>
        </div>
      </section>

      <section className={styles.detailCard}>
        <h3>Thông tin cá nhân</h3>
        <div className={styles.infoGrid}>
          <InfoLine icon={User} label="Họ và tên" value="Nguyễn Văn A" />
          <InfoLine icon={Phone} label="Số điện thoại" value="0901234567" />
          <InfoLine icon={Mail} label="Email" value="nguyenvana@gmail.com" />
          <InfoLine icon={User} label="Giới tính" value="Nam" />
          <InfoLine icon={Calendar} label="Ngày sinh" value="15/5/1990" />
        </div>
      </section>

      <div className={styles.detailTwo}>
        <section className={styles.detailCard}>
          <h3>Thông tin hợp đồng</h3>
          <InfoLine icon={Calendar} label="Ngày đăng ký" value="15/1/2024" />
          <InfoLine icon={Calendar} label="Ngày hết hạn" value="15/7/2024" danger />
        </section>
        <section className={styles.detailCard}>
          <h3>Tài chính</h3>
          <InfoLine icon={DollarSign} label="Công nợ" value="1.500.000 VND" danger />
        </section>
      </div>

      <section className={styles.detailCard}>
        <h3>Người đi cùng <button className={styles.greenButton} type="button"><UserPlus size={16} />Thêm người đi cùng</button></h3>
        {["Nguyễn Văn B · Vợ/Chồng · 0912345678 · 20/6/1992", "Nguyễn Văn C · Con · 0923456789 · 15/8/2010"].map((item) => (
          <div className={styles.companionRow} key={item}>
            <span>N</span>
            <strong>{item}</strong>
            <div><button type="button"><Edit size={16} /></button><button type="button"><X size={16} /></button></div>
          </div>
        ))}
      </section>
    </>
  );
}

function ContractsTab() {
  return (
    <section className={styles.detailCard}>
      <h3>Danh sách hợp đồng <button className={styles.blueButton} type="button"><Plus size={16} />Thêm hợp đồng</button></h3>
      {[
        ["Golf Teetime - VIP", "Hết hạn", "HD001", "15/1/2024", "15/7/2024", "15,000,000 VND"],
        ["Golf Practice - Premium", "Còn hạn", "HD002", "1/2/2024", "31/12/2026", "25,000,000 VND"],
      ].map(([name, status, code, start, end, value]) => (
        <article className={styles.contractCard} key={code}>
          <div>
            <h4>{name} <CustomerStatus status={status} /></h4>
            <div className={styles.contractGrid}>
              <InfoBlock label="Mã hợp đồng"><span className={styles.memberCode}>{code}</span></InfoBlock>
              <InfoBlock label="Ngày bắt đầu">{start}</InfoBlock>
              <InfoBlock label="Ngày kết thúc">{end}</InfoBlock>
              <InfoBlock label="Giá trị"><span className={styles.dateGreen}>{value}</span></InfoBlock>
            </div>
          </div>
          <button type="button">Xem chi tiết</button>
        </article>
      ))}
    </section>
  );
}

function FormField({
  action,
  area,
  label,
  name,
  onAction,
  placeholder,
  required,
  type = "text",
  value,
}: {
  action?: string;
  area?: boolean;
  label: string;
  name?: string;
  onAction?: () => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value?: string;
}) {
  return (
    <label className={area ? styles.fullField : undefined}>
      <span>{label} {required ? <b>*</b> : null}</span>
      <div className={styles.inputWrap}>
        {area ? (
          <textarea name={name} placeholder={placeholder} />
        ) : (
          <input
            defaultValue={value}
            name={name}
            placeholder={placeholder}
            readOnly={Boolean(value)}
            required={required}
            type={type}
          />
        )}
        {action ? <button onClick={onAction} type="button">{action}</button> : null}
      </div>
    </label>
  );
}

function BiometricBadges() {
  return (
    <div className={styles.bioBadges}>
      <span>Face</span>
      <span className={styles.bioActive}>Vân tay</span>
      <span>Thẻ</span>
    </div>
  );
}

function CustomerStatus({ status }: { status: string }) {
  const className = status === "Còn hạn" ? styles.statusGreen : status === "Hết hạn" ? styles.statusRed : styles.statusDark;
  return <span className={className}>{status}</span>;
}

function InfoBlock({ children, label }: { children: React.ReactNode; label: string }) {
  return <div className={styles.infoBlock}><span>{label}</span><strong>{children}</strong></div>;
}

function InfoLine({ danger, icon: Icon, label, value }: { danger?: boolean; icon: LucideIcon; label: string; value: string }) {
  return (
    <div className={styles.infoLine}>
      <Icon size={18} />
      <div>
        <span>{label}</span>
        <strong className={danger ? styles.dangerText : undefined}>{value}</strong>
      </div>
    </div>
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

"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  Calendar,
  CalendarCheck,
  ChevronDown,
  ClipboardCheck,
  Download,
  DollarSign,
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
  { key: "teetime", label: "Golf Teetime", Icon: Flag },
  { key: "line", label: "Golf Line Tập", Icon: Target },
  { key: "tickets", label: "Vé lẻ", Icon: Ticket },
  { key: "cashbook", label: "Sổ quỹ", Icon: WalletCards },
  { key: "coach", label: "Lịch HLV", Icon: CalendarCheck },
  { key: "contracts", label: "Hợp Đồng", Icon: FileText },
  { key: "pricing", label: "Bảng Giá", Icon: SlidersHorizontal },
  { key: "commission", label: "Hoa hồng Sale", Icon: Percent },
  { key: "reports", label: "Báo cáo Doanh thu", Icon: FileBarChart },
  { key: "customers", label: "Khách Hàng", Icon: Users },
  { key: "classes", label: "Báo Cáo", Icon: BarChart3 },
  { key: "settings", label: "Cài đặt", Icon: Settings },
  { key: "checkin", label: "Check-in/out", Icon: ClipboardCheck },
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
          <button
            className={active === "dashboard" ? styles.activeNav : undefined}
            onClick={() => setActive("dashboard")}
            type="button"
          >
            <BarChart3 size={19} />
            Dashboard
          </button>
          <p className={styles.navGroup}>Golf</p>
          {navItems
            .filter((item) => item.key !== "dashboard")
            .map((item) => {
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
          <p>Thứ Ba, 7 tháng 4, 2026</p>
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
          {active === "customers" && <CustomersScreen />}
          {active !== "customers" && <PlaceholderScreen title={activeItem.label} />}
        </div>
      </main>
    </div>
  );
}

function CustomersScreen() {
  const [addOpen, setAddOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState("Thông tin cơ bản");
  const [nestedModal, setNestedModal] = useState<"group" | "companion" | null>(null);

  return (
    <>
      <section className={styles.customerScreen}>
        <div className={styles.customerToolbar}>
          <h2>Danh sách thành viên</h2>
          <div className={styles.customerActions}>
            <div className={styles.customerSearch}>
              <Search size={18} />
              <span>Tìm &ếm...</span>
            </div>
            <button className={styles.blueButton} onClick={() => setAddOpen(true)} type="button">
              <Plus size={18} />
              Thêm mới
            </button>
            <button className={styles.squareButton} type="button">
              <Filter size={18} />
            </button>
            <button className={styles.squareButton} type="button">
              <Settings size={18} />
            </button>
            <button className={styles.greenButton} type="button">
              <Download size={18} />
              Nhập xuất
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

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
                {customerRows.map((customer) => (
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
              </tbody>
            </table>
          </div>
          <div className={styles.pagination}>
            <span>Hiển thị 1 - 10 / 10 hội viên</span>
            <span>Hiển thị: <input aria-label="Số dòng mỗi trang" /> / trang</span>
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
  onClose,
  onOpenNested,
}: {
  nestedModal: "group" | "companion" | null;
  onClose: () => void;
  onOpenNested: (modal: "group" | "companion") => void;
}) {
  return (
    <div className={styles.modalOverlay}>
      <section className={`${styles.modalShell} ${nestedModal ? styles.dimmedModal : ""}`}>
        <header className={styles.modalHeader}>
          <div>
            <h2>Thêm mới khách hàng</h2>
            <p>Điền thông tin hội viên mới vào form bên dưới</p>
          </div>
          <button onClick={onClose} type="button"><X size={22} /></button>
        </header>

        <div className={styles.modalBody}>
          <h3>Thông tin khách hàng</h3>
          <div className={styles.formGrid}>
            <FormField action="Tự động" label="Mã hội viên" value="HV1001" />
            <FormField action="Tự động" label="Mã sinh trắc học" value="12345678" />
            <FormField required label="Họ và tên" placeholder="Nhập họ và tên" />
            <FormField required label="Số điện thoại" placeholder="Nhập số điện thoại" />
            <FormField label="Email" placeholder="Nhập email" />
            <FormField label="Ngày sinh" />
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
            <FormField label="Giới tính" />
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
          <button className={styles.blueButton} type="button">Thêm hội viên</button>
        </footer>
      </section>
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
  const tabs = ["Thông tin cơ bản", "Hợp đồng", "Lịch sử giao dịch", "Lịch sử checkin", "Kết quả tập luyện", "Inbody", "Meal Plan"];

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
          {activeTab === "Hợp đồng" ? <ContractsTab /> : <BasicInfoTab />}
        </div>

        <footer className={styles.modalFooter}>
          <button onClick={onClose} type="button">Đóng</button>
        </footer>
      </section>
    </div>
  );
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
  onAction,
  placeholder,
  required,
  value,
}: {
  action?: string;
  area?: boolean;
  label: string;
  onAction?: () => void;
  placeholder?: string;
  required?: boolean;
  value?: string;
}) {
  return (
    <label className={area ? styles.fullField : undefined}>
      <span>{label} {required ? <b>*</b> : null}</span>
      <div className={styles.inputWrap}>
        {area ? <textarea placeholder={placeholder} /> : <input placeholder={placeholder} readOnly={Boolean(value)} value={value ?? ""} />}
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

function PlaceholderScreen({ title }: { title: string }) {
  return (
    <section className={styles.placeholder}>
      <h2>{title}</h2>
      <p>Màn hình module sẽ được tiếp tục thiết kế chi tiết theo SRS sau khi hoàn tất module Khách Hàng.</p>
    </section>
  );
}

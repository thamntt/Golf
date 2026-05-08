"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  BadgePercent,
  Banknote,
  Building2,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  CreditCard,
  Eye,
  FileCog,
  FileText,
  Fingerprint,
  Gauge,
  KeyRound,
  Layers3,
  LockKeyhole,
  MonitorCog,
  MoreVertical,
  Pencil,
  Plus,
  PlusCircle,
  Power,
  Printer,
  ReceiptText,
  RefreshCcw,
  Save,
  ScanFace,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TestTube2,
  Trash2,
  Upload,
  UsersRound,
  Wifi,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FeaturePage } from "@/shared/components";
import styles from "@/shared/styles/feature-styles.module.css";

type TabKey =
  | "business"
  | "payment"
  | "print"
  | "einvoice"
  | "roles"
  | "branches"
  | "codes"
  | "devices"
  | "general"
  | "promotions";

type ModalKind = "branch" | "device" | "template" | "promotion" | "role" | "preview" | "confirm" | null;

type ModalState = {
  kind: ModalKind;
  title?: string;
  note?: string;
};

type SettingsDeviceType = "FACE" | "ATTENDANCE" | "CARD";
type SettingsDeviceColumn = "name" | "code" | "port" | "ip" | "password" | "branch" | "status";

const tabs: Array<{ key: TabKey; label: string; icon: LucideIcon }> = [
  { key: "business", label: "Thông tin DN", icon: Building2 },
  { key: "payment", label: "Thanh toán", icon: CreditCard },
  { key: "print", label: "Mẫu in", icon: Printer },
  { key: "einvoice", label: "HĐĐT", icon: ReceiptText },
  { key: "roles", label: "Phân quyền", icon: ShieldCheck },
  { key: "branches", label: "Chi nhánh", icon: Layers3 },
  { key: "codes", label: "Sinh mã", icon: KeyRound },
  { key: "devices", label: "Thiết bị", icon: Fingerprint },
  { key: "general", label: "VAT & Giá", icon: SlidersHorizontal },
  { key: "promotions", label: "Khuyến mãi", icon: BadgePercent },
];

const branches = [
  {
    name: "NextVision Golf Center - Bến Nghé",
    code: "CN001",
    manager: "Nguyễn Minh Anh",
    members: 428,
    status: "Đang hoạt động",
    address: "12 Nguyễn Huệ, Quận 1, TP.HCM",
    phone: "028 3822 1900",
    hours: "06:00 - 22:00",
  },
  {
    name: "NextVision Golf Center - Võ Thị Sáu",
    code: "CN002",
    manager: "Trần Hoàng Long",
    members: 312,
    status: "Đang hoạt động",
    address: "88 Võ Thị Sáu, Quận 3, TP.HCM",
    phone: "028 3933 1010",
    hours: "05:30 - 22:30",
  },
  {
    name: "NextVision Golf Center - Thảo Điền",
    code: "CN003",
    manager: "Lê Bảo Châu",
    members: 186,
    status: "Bảo trì nhẹ",
    address: "21 Xuân Thủy, TP. Thủ Đức",
    phone: "028 3744 2020",
    hours: "07:00 - 21:30",
  },
];

const devices = [
  { id: "D-001", type: "FACE" as const, name: "Face cổng chính", code: "FACE-CN1", port: 4370, ip: "192.168.1.21", password: "********", branch: "NextVision", isCoachOnly: false, online: true },
  { id: "D-002", type: "FACE" as const, name: "Face cổng phụ", code: "FACE-CN2", port: 4370, ip: "192.168.1.22", password: "********", branch: "NextVision", isCoachOnly: false, online: true },
  { id: "D-003", type: "FACE" as const, name: "Face Driving Range", code: "FACE-DR", port: 4370, ip: "192.168.1.23", password: "********", branch: "NextVision", isCoachOnly: false, online: false },
  { id: "D-004", type: "ATTENDANCE" as const, name: "Máy chấm công HLV", code: "ATT-HLV", port: 4371, ip: "192.168.1.41", password: "********", branch: "NextVision", isCoachOnly: true, online: true },
  { id: "D-005", type: "ATTENDANCE" as const, name: "Máy chấm công văn phòng", code: "ATT-VP", port: 4371, ip: "192.168.1.42", password: "********", branch: "NextVision", isCoachOnly: false, online: true },
  { id: "D-006", type: "CARD" as const, name: "Quẹt thẻ cổng chính", code: "CARD-CN1", port: 9100, ip: "192.168.1.51", password: "********", branch: "NextVision", isCoachOnly: false, online: true },
  { id: "D-007", type: "FACE" as const, name: "Face khu putting", code: "FACE-PUTT", port: 4370, ip: "192.168.1.24", password: "********", branch: "NextVision", isCoachOnly: false, online: true },
  { id: "D-008", type: "FACE" as const, name: "Face phòng VIP 1", code: "FACE-VIP1", port: 4370, ip: "192.168.1.25", password: "********", branch: "NextVision", isCoachOnly: false, online: true },
  { id: "D-009", type: "FACE" as const, name: "Face phòng VIP 2", code: "FACE-VIP2", port: 4370, ip: "192.168.1.26", password: "********", branch: "NextVision", isCoachOnly: false, online: true },
  { id: "D-010", type: "FACE" as const, name: "Face khu HLV", code: "FACE-COACH", port: 4370, ip: "192.168.1.27", password: "********", branch: "NextVision", isCoachOnly: true, online: true },
  { id: "D-011", type: "ATTENDANCE" as const, name: "Máy chấm công bảo vệ", code: "ATT-SEC", port: 4371, ip: "192.168.1.43", password: "********", branch: "NextVision", isCoachOnly: false, online: false },
];

const templates = [
  { name: "Hợp đồng chuẩn", type: "Hợp đồng", size: "A4 (210 x 297mm)", font: "Arial", updated: "2025-01-01", default: true },
  { name: "Hóa đơn chuẩn", type: "Hóa đơn", size: "A4 (210 x 297mm)", font: "Arial", updated: "2025-01-01", default: true },
  { name: "Phiếu thu K80", type: "Phiếu thu", size: "K80 (80mm)", font: "Arial", updated: "2025-01-01", default: true },
];

const providers = ["Viettel", "VNPT", "MISA", "FPT", "BKAV"];

const roles = [
  { name: "Quản trị viên", users: 2, permissions: 48, tone: "blue" },
  { name: "Quản lý chi nhánh", users: 4, permissions: 36, tone: "green" },
  { name: "Lễ tân", users: 8, permissions: 22, tone: "amber" },
  { name: "Sales", users: 6, permissions: 18, tone: "violet" },
  { name: "HLV", users: 12, permissions: 14, tone: "slate" },
];

const codeConfigs = [
  { label: "Hội viên", prefix: "HV", separator: "", start: "1", digits: 4, preview: "HV0001" },
  { label: "Hợp đồng", prefix: "HD", separator: "-", start: "1", digits: 6, preview: "HD-000001" },
  { label: "Hóa đơn", prefix: "INV", separator: "-", start: "1", digits: 6, preview: "INV-000001" },
  { label: "Lịch PT", prefix: "PT", separator: "", start: "1", digits: 4, preview: "PT0001" },
  { label: "Lớp học", prefix: "CLS", separator: "", start: "1", digits: 4, preview: "CLS0001" },
];

const promotions = [
  { code: "SUMMER2026", name: "Khuyến mãi hè 2026", desc: "Tặng 5 buổi PT cho gói VIP", type: "Tặng buổi PT", value: "5 buổi PT", time: "01/06/2026 - 31/08/2026", status: "Đang áp dụng", active: true },
  { code: "NEWYEAR2026", name: "Chào năm mới 2026", desc: "Giảm 20% cho tất cả gói tập", type: "Giảm giá %", value: "20%", time: "01/01/2026 - 28/02/2026", status: "Đã kết thúc", active: false },
  { code: "MEMBER300K", name: "Giảm giá 300K", desc: "Giảm ngay 300K cho gói 6 tháng trở lên", type: "Giảm giá tiền", value: "300.000đ", time: "01/03/2026 - 31/03/2026", status: "Đang áp dụng", active: true },
];

const paymentMethods = [
  { name: "Tiền mặt tại quầy", fee: "0%", settlement: "Tức thời", active: true },
  { name: "Chuyển khoản ngân hàng", fee: "0%", settlement: "T+0", active: true },
  { name: "POS / thẻ quốc tế", fee: "1.8%", settlement: "T+1", active: true },
  { name: "Ví điện tử", fee: "1.2%", settlement: "T+1", active: false },
];

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState<TabKey>("business");
  const [modal, setModal] = useState<ModalState>({ kind: null });
  const [toast, setToast] = useState("");
  const [logoUploaded, setLogoUploaded] = useState(false);
  const [vatMode, setVatMode] = useState<"before" | "after">("before");
  const [rounding, setRounding] = useState(true);
  const [digits, setDigits] = useState(0);
  const [provider, setProvider] = useState("Viettel");
  const [invoiceConnected, setInvoiceConnected] = useState(false);
  const [selectedRole, setSelectedRole] = useState(roles[0].name);
  const [printFilter, setPrintFilter] = useState("Tất cả");
  const [deviceFilter, setDeviceFilter] = useState<"all" | SettingsDeviceType>("all");
  const [deviceSearch, setDeviceSearch] = useState("");
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [deviceColumnsOpen, setDeviceColumnsOpen] = useState(false);
  const [visibleDeviceColumns, setVisibleDeviceColumns] = useState<Record<SettingsDeviceColumn, boolean>>({
    name: true,
    code: true,
    port: true,
    ip: true,
    password: true,
    branch: true,
    status: true,
  });

  const filteredDevices = useMemo(() => {
    const keyword = deviceSearch.trim().toLowerCase();
    return devices.filter((device) => {
      if (deviceFilter !== "all" && device.type !== deviceFilter) return false;
      if (!keyword) return true;
      return [device.name, device.code, device.ip, device.branch].some((value) => value.toLowerCase().includes(keyword));
    });
  }, [deviceFilter, deviceSearch]);
  const deviceCounts = useMemo(() => ({
    total: devices.length,
    face: devices.filter((device) => device.type === "FACE").length,
    att: devices.filter((device) => device.type === "ATTENDANCE").length,
    card: devices.filter((device) => device.type === "CARD").length,
  }), []);

  const showToast = (message: string) => {
    setToast(message);
    window.clearTimeout(Number(window.sessionStorage.getItem("settings-toast")));
    const timer = window.setTimeout(() => setToast(""), 3000);
    window.sessionStorage.setItem("settings-toast", String(timer));
  };

  const openModal = (kind: ModalKind, title: string, note?: string) => setModal({ kind, title, note });
  const closeModal = () => setModal({ kind: null });

  return (
    <FeaturePage title="Cài Đặt Hệ Thống" subtitle="Quản lý cấu hình vận hành, chi nhánh, thiết bị và mẫu nghiệp vụ của trung tâm golf.">
      <section className={styles.settingsHero}>
        <div>
          <span className={styles.settingsEyebrow}><Settings size={16} /> NextVision Golf Center</span>
          <h3>Cấu hình hệ thống</h3>
          <p>Thiết lập thông tin doanh nghiệp, VAT, phân quyền, thiết bị check-in và các quy tắc dùng chung cho toàn bộ module.</p>
        </div>
      </section>

      <section className={styles.settingsStats}>
        <StatCard icon={Building2} label="Chi nhánh" value="03" caption="02 đang hoạt động" />
        <StatCard icon={Fingerprint} label="Thiết bị" value="11" caption="09 đồng bộ ổn định" />
        <StatCard icon={ShieldCheck} label="Vai trò" value="05" caption="62 quyền được cấu hình" />
        <StatCard icon={ReceiptText} label="Hóa đơn" value={invoiceConnected ? "Online" : "Chưa test"} caption={`${provider} đang được chọn`} />
      </section>

      <div className={styles.settingsTabBar} role="tablist">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button className={activeTab === tab.key ? styles.settingsTabActive : undefined} key={tab.key} onClick={() => setActiveTab(tab.key)} type="button">
              <Icon size={17} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <section className={styles.settingsPanel}>
        {activeTab === "business" ? (
          <BusinessPanel logoUploaded={logoUploaded} onLogo={() => { setLogoUploaded(true); showToast("Đã chọn logo demo, kiểm tra tỉ lệ 1:1 trước khi lưu"); }} />
        ) : null}
        {activeTab === "payment" ? <PaymentPanel onToast={showToast} /> : null}
        {activeTab === "print" ? <PrintPanel filter={printFilter} onFilter={setPrintFilter} onOpen={openModal} /> : null}
        {activeTab === "einvoice" ? (
          <InvoicePanel connected={invoiceConnected} provider={provider} setConnected={setInvoiceConnected} setProvider={setProvider} showToast={showToast} />
        ) : null}
        {activeTab === "roles" ? <RolePanel onOpen={openModal} selectedRole={selectedRole} setSelectedRole={setSelectedRole} showToast={showToast} /> : null}
        {activeTab === "branches" ? <BranchPanel onOpen={openModal} /> : null}
        {activeTab === "codes" ? <CodePanel onOpen={openModal} showToast={showToast} /> : null}
        {activeTab === "devices" ? (
          <DevicePanel
            columnsOpen={deviceColumnsOpen}
            counts={deviceCounts}
            deviceSearch={deviceSearch}
            devices={filteredDevices}
            onCloseColumns={() => setDeviceColumnsOpen(false)}
            onOpen={openModal}
            onOpenColumns={() => setDeviceColumnsOpen(true)}
            onResetColumns={() => setVisibleDeviceColumns({
              name: true,
              code: true,
              port: true,
              ip: true,
              password: true,
              branch: true,
              status: true,
            })}
            selectedDeviceIds={selectedDeviceIds}
            setDeviceSearch={setDeviceSearch}
            setSelectedDeviceIds={setSelectedDeviceIds}
            setTypeFilter={setDeviceFilter}
            setVisibleColumns={setVisibleDeviceColumns}
            showToast={showToast}
            typeFilter={deviceFilter}
            visibleColumns={visibleDeviceColumns}
          />
        ) : null}
        {activeTab === "general" ? <GeneralPanel digits={digits} rounding={rounding} setDigits={setDigits} setRounding={setRounding} setVatMode={setVatMode} vatMode={vatMode} showToast={showToast} /> : null}
        {activeTab === "promotions" ? <PromotionPanel onOpen={openModal} showToast={showToast} /> : null}
      </section>

      {toast ? (
        <div className={styles.contractToast}>
          <Sparkles size={18} />
          <span>{toast}</span>
        </div>
      ) : null}

      {modal.kind ? <SettingsModal modal={modal} onClose={closeModal} onDone={(message) => { closeModal(); showToast(message); }} /> : null}
    </FeaturePage>
  );
}

function StatCard({ caption, icon: Icon, label, value }: { caption: string; icon: LucideIcon; label: string; value: string }) {
  return (
    <article className={styles.settingsStatCard}>
      <span><Icon size={20} /></span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <p>{caption}</p>
      </div>
    </article>
  );
}

function BusinessPanel({ logoUploaded, onLogo }: { logoUploaded: boolean; onLogo: () => void }) {
  return (
    <div className={styles.settingsBusinessShell}>
      <section className={styles.settingsBusinessProfile}>
        <div className={styles.settingsBusinessGradient}>
          <span>Hồ sơ doanh nghiệp</span>
          <strong>NextVision Golf Center</strong>
          <p>Thông tin này được dùng đồng bộ cho hợp đồng, hóa đơn điện tử, phiếu thu, bill thanh toán và header mẫu in.</p>
        </div>
        <div className={styles.settingsLogoBox}>
          <div className={styles.settingsLogoPreview}>{logoUploaded ? "NG" : "N"}</div>
          <div>
            <strong>Logo doanh nghiệp</strong>
            <span>PNG/JPG/GIF, tối đa 2MB. Khuyến nghị 200x200px.</span>
          </div>
          <button onClick={onLogo} type="button"><Upload size={18} />Tải logo</button>
        </div>
        <div className={styles.settingsBusinessChecklist}>
          {["Email hợp lệ", "MST 10 hoặc 13 số", "Thông tin in đồng bộ", "Audit log khi lưu"].map((item) => (
            <span key={item}><Check size={14} />{item}</span>
          ))}
        </div>
      </section>

      <section className={styles.settingsBusinessForm}>
        <div className={styles.settingsBusinessTopline}>
          <div>
            <span><Building2 size={16} /> Thông tin doanh nghiệp</span>
            <h3>Cấu hình nhận diện trung tâm</h3>
            <p>Các trường dưới đây có thể chỉnh trực tiếp như form thật, sau khi lưu sẽ áp dụng cho chứng từ và mẫu in mới.</p>
          </div>
        </div>

        <div className={styles.settingsBusinessSections}>
          <section className={`${styles.settingsBusinessSection} ${styles.settingsBusinessSectionBlue}`}>
            <header><FileText size={18} /><div><strong>Thông tin cơ bản</strong><span>Thông tin pháp lý hiển thị trên chứng từ</span></div></header>
            <div className={styles.settingsFormGrid}>
              <TextField label="Tên doanh nghiệp *" value="NextVision Golf Center" />
              <TextField label="Mã số thuế" value="0318888999" />
            </div>
          </section>

          <section className={`${styles.settingsBusinessSection} ${styles.settingsBusinessSectionGreen}`}>
            <header><MonitorCog size={18} /><div><strong>Thông tin liên hệ</strong><span>Dùng trên phiếu thu, hóa đơn và thông báo hệ thống</span></div></header>
            <div className={styles.settingsFormGrid}>
              <TextField label="Số điện thoại *" value="028 3822 1900" />
              <TextField label="Email *" value="support@nextgolf.vn" />
              <TextField label="Website" value="https://nextgolf.vn" />
              <TextField area label="Địa chỉ *" value="12 Nguyễn Huệ, Quận 1, TP.HCM" />
            </div>
          </section>

          <section className={`${styles.settingsBusinessSection} ${styles.settingsBusinessSectionViolet}`}>
            <header><ClipboardCheck size={18} /><div><strong>Mô tả</strong><span>Giới thiệu ngắn về sân tập, dịch vụ và đội ngũ HLV</span></div></header>
            <textarea className={styles.settingsTextarea} defaultValue="Trung tâm golf indoor/outdoor, quản lý hội viên, HLV, line tập, lớp học, thiết bị check-in và thanh toán tại quầy." />
          </section>
        </div>
      </section>
    </div>
  );
}

function PaymentPanel({ onToast }: { onToast: (message: string) => void }) {
  return (
    <div className={styles.settingsOpsLayout}>
      <section className={styles.settingsOpsHero}>
        <div>
          <span><CreditCard size={16} /> Thanh toán & đối soát</span>
          <h3>Thiết lập kênh thu tiền tại quầy</h3>
          <p>Quản lý tiền mặt, chuyển khoản, POS, ví điện tử và nội dung QR hiển thị trên phiếu thu, bill thanh toán.</p>
        </div>
      </section>

      <section className={`${styles.settingsCard} ${styles.settingsPaymentPanel}`}>
        <PanelHead icon={CreditCard} title="Phương thức thanh toán" subtitle="Bật/tắt kênh thu tiền theo quy trình quầy lễ tân." />
        <div className={styles.settingsPaymentMethods}>
          {paymentMethods.map((method, index) => (
            <article className={method.active ? styles.settingsPaymentActive : ""} key={method.name}>
              <span>{index + 1}</span>
              <div>
                <strong>{method.name}</strong>
                <small>Phí {method.fee} · Đối soát {method.settlement} · {method.active ? "Đang nhận thanh toán" : "Đang tạm khóa"}</small>
              </div>
              <button className={method.active ? styles.settingsToggleOn : styles.settingsToggleOff} onClick={() => onToast(`${method.name}: trạng thái đã được ghi nhận`)} type="button"><span /></button>
            </article>
          ))}
        </div>
      </section>

      <div className={styles.settingsOpsGrid}>
        <section className={styles.settingsCard}>
          <PanelHead icon={Banknote} title="Tài khoản nhận tiền" subtitle="Thông tin in trên phiếu thu và màn xác nhận chuyển khoản." />
          <div className={styles.settingsFormGrid}>
            <TextField label="Ngân hàng" value="Vietcombank" />
            <TextField label="Số tài khoản" value="1029 888 999" />
            <TextField label="Chủ tài khoản" value="CONG TY NEXTVISION GOLF" />
            <TextField label="Nội dung mặc định" value="{MaPhieuThu} {TenHoiVien}" />
            <TextField label="Mã QR nhận tiền" value="VCB-1029888999" />
            <TextField label="Chi nhánh nhận tiền" value="Bến Nghé" />
          </div>
        </section>
        <section className={styles.settingsCard}>
          <PanelHead icon={ClipboardCheck} title="Quy tắc vận hành" subtitle="Áp dụng cho hợp đồng, vé lẻ, teetime, check-in và sổ quỹ." />
          <div className={styles.settingsRuleList}>
            <label><input defaultChecked type="checkbox" /> Tự sinh phiếu thu khi thanh toán thành công</label>
            <label><input defaultChecked type="checkbox" /> Cho phép chia nhiều phương thức trong một giao dịch</label>
            <label><input defaultChecked type="checkbox" /> Bắt buộc xác nhận chuyển khoản trước khi in bill</label>
            <label><input type="checkbox" /> Tự động gửi bill qua email/Zalo sau thanh toán</label>
          </div>
          <div className={styles.settingsActionRow}>
            <button onClick={() => onToast("Đã lưu cấu hình thanh toán")} type="button"><Save size={17} />Lưu cấu hình</button>
          </div>
        </section>
      </div>
    </div>
  );
}

function ThemeSettingsBlock({ showToast }: { showToast: (message: string) => void }) {
  return (
    <section className={styles.settingsCard}>
      <PanelHead icon={MonitorCog} title="Ngôn ngữ & giao diện" subtitle="Màn theme/kích thước chữ trong ảnh tài liệu được đưa vào cài đặt chung." />
      <div className={styles.settingsThemeGrid}>
        {["Tiếng Việt", "English"].map((lang, index) => (
          <button className={index === 0 ? styles.settingsProviderActive : undefined} key={lang} onClick={() => showToast(`Đã chọn ${lang}`)} type="button">
            <strong>{lang}</strong>
            <span>{index === 0 ? "Mặc định" : "Chuẩn bị dùng cho khách quốc tế"}</span>
          </button>
        ))}
        {["Nhỏ", "Vừa", "Lớn"].map((size, index) => (
          <button className={index === 1 ? styles.settingsProviderActive : undefined} key={size} onClick={() => showToast(`Cỡ chữ ${size} đã được ghi nhận`)} type="button">
            <strong>{size}</strong>
            <span>Cỡ chữ giao diện</span>
          </button>
        ))}
      </div>
    </section>
  );
}
function GeneralPanel({
  digits,
  rounding,
  setDigits,
  setRounding,
  setVatMode,
  showToast,
  vatMode,
}: {
  digits: number;
  rounding: boolean;
  setDigits: (value: number) => void;
  setRounding: (value: boolean) => void;
  setVatMode: (value: "before" | "after") => void;
  showToast: (message: string) => void;
  vatMode: "before" | "after";
}) {
  return (
    <div className={styles.settingsOpsLayout}>
      <section className={styles.settingsOpsHero}>
        <div>
          <span><Gauge size={16} /> VAT & Giá</span>
          <h3>Cấu hình cách tính giá toàn hệ thống</h3>
          <p>Áp dụng cho hợp đồng mới, vé lẻ, dịch vụ đi kèm, phiếu thu và hóa đơn điện tử. Hợp đồng đã lưu không bị thay đổi ngược.</p>
        </div>
      </section>
      <div className={styles.settingsSplit}>
      <section className={styles.settingsCard}>
        <PanelHead icon={Gauge} title="Cấu hình tính thuế VAT" subtitle="Áp dụng cho hợp đồng mới, hóa đơn dịch vụ và phiếu thu phát sinh sau thời điểm lưu." />
        <div className={styles.settingsVatOptions}>
          <button className={vatMode === "before" ? styles.settingsVatActive : undefined} onClick={() => setVatMode("before")} type="button">
            <Check size={18} />
            <strong>Giảm giá trước VAT</strong>
            <span>Tạm tính = Giá gốc - Giảm giá. VAT tính trên tạm tính.</span>
            <em>Phù hợp khuyến mãi trực tiếp tại quầy.</em>
          </button>
          <button className={vatMode === "after" ? styles.settingsVatActive : undefined} onClick={() => setVatMode("after")} type="button">
            <Check size={18} />
            <strong>Giảm giá sau VAT</strong>
            <span>VAT tính trên giá gốc, sau đó trừ ưu đãi.</span>
            <em>Dùng khi ưu đãi là khoản hỗ trợ sau thuế.</em>
          </button>
        </div>
        <div className={styles.settingsFormGrid}>
          <TextField label="VAT mặc định (%)" value="8" />
          <TextField label="Nhãn thuế" value="VAT" />
          <TextField label="Hiển thị chi tiết VAT" value="Bật" />
          <TextField label="Làm tròn VAT" value="Bật" />
        </div>
        <div className={styles.settingsVatExample}>
          <article><span>Giảm trước VAT</span><strong>1.430.000đ</strong><small>VAT tính trên giá đã giảm</small></article>
          <article><span>Giảm sau VAT</span><strong>1.450.000đ</strong><small>VAT tính trên giá gốc</small></article>
        </div>
      </section>
      <section className={styles.settingsCard}>
        <PanelHead icon={CircleDollarSign} title="Làm tròn giá" subtitle="Quy chuẩn hiển thị tiền trên báo cáo, phiếu thu và hóa đơn." />
        <div className={styles.settingsControlRow}>
          <span>Làm tròn giá bán</span>
          <button className={rounding ? styles.settingsToggleOn : styles.settingsToggleOff} onClick={() => setRounding(!rounding)} type="button"><span /></button>
        </div>
        <label className={styles.settingsRange}>
          <span>Số chữ số thập phân: <strong>{digits}</strong></span>
          <input max="3" min="0" onChange={(event) => setDigits(Number(event.target.value))} type="range" value={digits} />
        </label>
        <div className={styles.settingsPresetRow}>
          {[0, 1, 2, 3].map((value) => (
            <button className={digits === value ? styles.settingsPresetActive : undefined} key={value} onClick={() => setDigits(value)} type="button">{value}</button>
          ))}
        </div>
        <div className={styles.settingsSummaryBox}>
          <strong>Ví dụ hiển thị</strong>
          <span>{rounding ? Number(1250000.257).toLocaleString("vi-VN", { maximumFractionDigits: digits, minimumFractionDigits: digits }) : "1.250.000,257"} đ</span>
        </div>
      </section>
      </div>
      <section className={styles.settingsCard}>
        <PanelHead icon={ClipboardCheck} title="Tóm tắt cài đặt hiện tại" subtitle="Preview realtime để kế toán và lễ tân hiểu đúng cách hệ thống tính tiền." />
        <div className={styles.settingsSummaryGrid}>
          <MiniStat label="Thứ tự giảm giá" value={vatMode === "before" ? "Trước VAT" : "Sau VAT"} />
          <MiniStat label="Thuế suất mặc định" value="8%" />
          <MiniStat label="Nhãn thuế" value="VAT" />
          <MiniStat label="Chi tiết phiếu thu" value="Bật" />
        </div>
        <div className={styles.settingsActionRow}>
          <button onClick={() => showToast("Đã khôi phục cấu hình VAT mặc định")} type="button"><RefreshCcw size={17} />Đặt lại mặc định</button>
          <button onClick={() => showToast("Đã lưu cấu hình VAT và làm tròn giá")} type="button"><Save size={17} />Lưu cài đặt VAT</button>
        </div>
      </section>
      <ThemeSettingsBlock showToast={showToast} />
    </div>
  );
}

function BranchPanel({ onOpen }: { onOpen: (kind: ModalKind, title: string, note?: string) => void }) {
  return (
    <div className={styles.settingsOpsLayout}>
      <section className={styles.settingsOpsHero}>
        <div>
          <span><Layers3 size={16} /> Quản lý chi nhánh</span>
          <h3>Vận hành nhiều cơ sở golf</h3>
          <p>Theo dõi địa chỉ, người quản lý, giờ mở cửa, số hội viên và trạng thái hoạt động từng chi nhánh.</p>
        </div>
      </section>
      <div className={styles.settingsMiniStats}>
        <MiniStat label="Tổng chi nhánh" value="03" />
        <MiniStat label="Đang hoạt động" value="02" />
        <MiniStat label="Hội viên" value="926" />
        <MiniStat label="TB hội viên/CN" value="309" />
      </div>
      <section className={styles.settingsCard}>
        <PanelHead icon={Layers3} title="Danh sách chi nhánh" subtitle="Click vào card hoặc dùng nút thao tác để chỉnh sửa chi nhánh." action="Thêm chi nhánh" onAction={() => onOpen("branch", "Thêm chi nhánh mới")} />
        <div className={styles.settingsToolbarLine}>
          <Search size={18} />
          <input placeholder="Tìm theo tên, mã, địa chỉ, người quản lý..." />
          <button type="button">Cả ngày</button>
          <button type="button">Tất cả</button>
          <button type="button">Đang hoạt động</button>
          <button type="button">Tạm ngưng</button>
        </div>
        <div className={styles.settingsBranchGrid}>
          {branches.map((branch) => (
            <article key={branch.code} className={styles.settingsBranchCard}>
              <div>
                <span className={branch.status === "Đang hoạt động" ? styles.settingsStatusGreen : styles.settingsStatusAmber}>{branch.status}</span>
                <strong>{branch.name}</strong>
                <small>{branch.code}</small>
              </div>
              <p>{branch.address}</p>
              <dl>
                <div><dt>Quản lý</dt><dd>{branch.manager}</dd></div>
                <div><dt>Hội viên</dt><dd>{branch.members}</dd></div>
                <div><dt>Hotline</dt><dd>{branch.phone}</dd></div>
                <div><dt>Giờ mở cửa</dt><dd>{branch.hours}</dd></div>
              </dl>
              <footer>
                <button onClick={() => onOpen("branch", `Sửa ${branch.code}`)} type="button"><Pencil size={16} />Sửa</button>
                <button onClick={() => onOpen("confirm", "Xác nhận xóa chi nhánh", "Chi nhánh có dữ liệu phát sinh sẽ được khóa thay vì xóa cứng.")} type="button"><Trash2 size={16} />Xóa</button>
              </footer>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function DevicePanel({
  columnsOpen,
  counts,
  devices: visibleDevices,
  deviceSearch,
  onCloseColumns,
  onOpen,
  onOpenColumns,
  onResetColumns,
  selectedDeviceIds,
  setDeviceSearch,
  setSelectedDeviceIds,
  setTypeFilter,
  setVisibleColumns,
  showToast,
  typeFilter,
  visibleColumns,
}: {
  columnsOpen: boolean;
  counts: { total: number; att: number; face: number; card: number };
  devices: typeof devices;
  deviceSearch: string;
  onCloseColumns: () => void;
  onOpen: (kind: ModalKind, title: string, note?: string) => void;
  onOpenColumns: () => void;
  onResetColumns: () => void;
  selectedDeviceIds: string[];
  setDeviceSearch: (value: string) => void;
  setSelectedDeviceIds: (value: string[]) => void;
  setTypeFilter: (value: "all" | SettingsDeviceType) => void;
  setVisibleColumns: (value: Record<SettingsDeviceColumn, boolean>) => void;
  showToast: (message: string) => void;
  typeFilter: "all" | SettingsDeviceType;
  visibleColumns: Record<SettingsDeviceColumn, boolean>;
}) {
  const allVisibleSelected = visibleDevices.length > 0 && visibleDevices.every((device) => selectedDeviceIds.includes(device.id));
  const visibleCount = Object.values(visibleColumns).filter(Boolean).length;
  const deviceColumnLabels: Record<SettingsDeviceColumn, string> = {
    name: "Tên máy",
    code: "Mã",
    port: "Cổng số",
    ip: "Địa chỉ IP",
    password: "Mật khẩu",
    branch: "Chi nhánh",
    status: "Trạng thái",
  };
  const toggleAll = () => {
    if (allVisibleSelected) {
      setSelectedDeviceIds(selectedDeviceIds.filter((id) => !visibleDevices.some((device) => device.id === id)));
      return;
    }
    setSelectedDeviceIds(Array.from(new Set([...selectedDeviceIds, ...visibleDevices.map((device) => device.id)])));
  };
  const toggleOne = (id: string) => {
    setSelectedDeviceIds(selectedDeviceIds.includes(id) ? selectedDeviceIds.filter((deviceId) => deviceId !== id) : [...selectedDeviceIds, id]);
  };

  return (
    <div className={styles.checkinDevicesPane}>
      <div className={styles.checkinDeviceHeader}>
        <div>
          <h3>Quản lý thiết bị</h3>
          <p>Máy chấm công, Face ID và đầu đọc thẻ dùng cho check-in hội viên, HLV và nhân sự.</p>
        </div>
        <div className={styles.checkinDeviceTools}>
          <div className={styles.checkinSearch}>
            <Search size={16} />
            <input onChange={(event) => setDeviceSearch(event.target.value)} placeholder="Tìm tên máy, mã, IP, chi nhánh..." type="text" value={deviceSearch} />
          </div>
          <select className={styles.checkinSelectInput} onChange={(event) => setTypeFilter(event.target.value as "all" | SettingsDeviceType)} value={typeFilter}>
            <option value="all">Tất cả loại</option>
            <option value="ATTENDANCE">Chấm công</option>
            <option value="FACE">Face ID</option>
            <option value="CARD">Quẹt thẻ</option>
          </select>
          {selectedDeviceIds.length > 0 ? (
            <button className={styles.checkinBtnDanger} onClick={() => onOpen("confirm", `Xóa ${selectedDeviceIds.length} thiết bị`, "Thiết bị đã có CheckinLog sẽ được soft delete để giữ lịch sử vận hành.")} type="button">
              <Trash2 size={14} /> Xóa ({selectedDeviceIds.length})
            </button>
          ) : null}
          <button className={styles.checkinBtnGhost} onClick={onOpenColumns} type="button"><MoreVertical size={14} /> Cột</button>
          <button className={styles.checkinPrimary} onClick={() => onOpen("device", "Thêm thiết bị")} type="button"><PlusCircle size={16} /> Thêm mới</button>
        </div>
      </div>

      <div className={styles.checkinDeviceFilters}>
        {([
          { key: "all", label: "Tất cả", count: counts.total },
          { key: "ATTENDANCE", label: "Chấm công", count: counts.att, icon: <Power size={12} /> },
          { key: "FACE", label: "Face ID", count: counts.face, icon: <ScanFace size={12} /> },
          { key: "CARD", label: "Quẹt thẻ", count: counts.card, icon: <CreditCard size={12} /> },
        ] as const).map((filter) => (
          <button className={`${styles.checkinDeviceFilter} ${typeFilter === filter.key ? styles.checkinDeviceFilterActive : ""}`} key={filter.key} onClick={() => setTypeFilter(filter.key)} type="button">
            {"icon" in filter ? filter.icon : null} {filter.label} <span>[{filter.count}]</span>
          </button>
        ))}
      </div>

      <div className={styles.checkinTableWrap}>
        <table className={styles.checkinTable}>
          <thead>
            <tr>
              <th>Loại</th>
              <th><input aria-label="Chọn tất cả thiết bị" checked={allVisibleSelected} onChange={toggleAll} type="checkbox" /></th>
              {visibleColumns.name ? <th>Tên máy</th> : null}
              {visibleColumns.code ? <th>Mã</th> : null}
              {visibleColumns.port ? <th>Cổng số</th> : null}
              {visibleColumns.ip ? <th>Địa chỉ IP</th> : null}
              {visibleColumns.password ? <th>Mật khẩu</th> : null}
              {visibleColumns.branch ? <th>Chi nhánh</th> : null}
              {visibleColumns.status ? <th>Trạng thái</th> : null}
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {visibleDevices.length === 0 ? (
              <tr>
                <td className={styles.checkinEmptyRow} colSpan={visibleCount + 3}>
                  Chưa có thiết bị nào. Bấm <button className={styles.checkinTextLink} onClick={() => onOpen("device", "Thêm thiết bị")} type="button">Thêm thiết bị</button> để cấu hình.
                </td>
              </tr>
            ) : visibleDevices.map((device) => (
              <tr className={selectedDeviceIds.includes(device.id) ? styles.checkinSelectedRow : ""} key={device.id}>
                <td>
                  <span className={`${styles.checkinDeviceBadge} ${device.type === "FACE" ? styles.checkinDeviceBadgeFace : device.type === "ATTENDANCE" ? styles.checkinDeviceBadgeAtt : styles.checkinDeviceBadgeCard}`}>
                    {device.type === "FACE" ? <ScanFace size={11} /> : device.type === "ATTENDANCE" ? <Power size={11} /> : <CreditCard size={11} />}
                    {device.type === "FACE" ? "Face ID" : device.type === "ATTENDANCE" ? "Chấm công" : "Quẹt thẻ"}
                  </span>
                </td>
                <td><input aria-label={`Chọn ${device.name}`} checked={selectedDeviceIds.includes(device.id)} onChange={() => toggleOne(device.id)} type="checkbox" /></td>
                {visibleColumns.name ? <td><button className={styles.checkinDeviceNameBtn} onClick={() => onOpen("device", `Sửa ${device.code}`)} type="button"><strong>{device.name}</strong></button>{device.isCoachOnly ? <small className={styles.checkinCoachOnly}> · PT</small> : null}</td> : null}
                {visibleColumns.code ? <td><span className={styles.checkinDeviceCode}>{device.code}</span></td> : null}
                {visibleColumns.port ? <td>{device.port}</td> : null}
                {visibleColumns.ip ? <td><Wifi size={11} /> {device.ip}</td> : null}
                {visibleColumns.password ? <td>{device.password}</td> : null}
                {visibleColumns.branch ? <td>{device.branch}</td> : null}
                {visibleColumns.status ? <td>{device.online ? <span className={styles.checkinStatusActive}>● Online</span> : <span className={styles.checkinStatusOffline}>● Offline</span>}</td> : null}
                <td>
                  <div className={styles.checkinActionRow}>
                    <button className={styles.checkinIconBtn} onClick={() => showToast(`Đang test kết nối ${device.code}`)} title="Test kết nối" type="button"><TestTube2 size={14} /></button>
                    <button className={styles.checkinIconBtn} onClick={() => onOpen("device", `Sửa ${device.code}`)} title="Sửa" type="button"><Pencil size={14} /></button>
                    <button className={`${styles.checkinIconBtn} ${styles.checkinIconBtnDanger}`} onClick={() => onOpen("confirm", `Xóa ${device.code}`, "Thiết bị đã có CheckinLog sẽ được soft delete để giữ lịch sử vận hành.")} title="Xóa" type="button"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.checkinTableFooter}>
          <span>{selectedDeviceIds.length > 0 ? `Đã chọn ${selectedDeviceIds.length} / ${counts.total} thiết bị` : `Hiển thị ${visibleDevices.length} / ${counts.total} thiết bị`}</span>
          <span>Hiển thị {visibleCount}/7 cột</span>
        </div>
      </div>
      {columnsOpen ? (
        <div className={styles.modalOverlay} onClick={onCloseColumns}>
          <div className={`${styles.modalContent} ${styles.checkinColumnsModal}`} onClick={(event) => event.stopPropagation()}>
            <header className={styles.checkinModalHeader}>
              <div>
                <h3>Cấu hình cột</h3>
                <p>Ẩn/hiện các cột trong bảng thiết bị theo người dùng.</p>
              </div>
              <button className={styles.checkinBtnGhost} onClick={onResetColumns} type="button">Reset</button>
            </header>
            <div className={styles.checkinColumnGrid}>
              {(Object.keys(deviceColumnLabels) as SettingsDeviceColumn[]).map((key) => (
                <label className={styles.checkinCheckRow} key={key}>
                  <input checked={visibleColumns[key]} onChange={(event) => setVisibleColumns({ ...visibleColumns, [key]: event.target.checked })} type="checkbox" />
                  <span>{deviceColumnLabels[key]}</span>
                </label>
              ))}
            </div>
            <footer className={styles.checkinModalFooter}>
              <span className={styles.checkinShortcut}>Loại, chọn dòng và hành động luôn hiển thị</span>
              <button className={styles.checkinBtnConfirm} onClick={onCloseColumns} type="button">Áp dụng</button>
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PrintPanel({ filter, onFilter, onOpen }: { filter: string; onFilter: (value: string) => void; onOpen: (kind: ModalKind, title: string, note?: string) => void }) {
  const filters = ["Tất cả", "Hợp đồng", "Hóa đơn", "Thẻ HV", "Phiếu thu"];
  const filtered = filter === "Tất cả" ? templates : templates.filter((template) => template.type === filter);
  const filterCount = (item: string) => item === "Tất cả" ? templates.length : templates.filter((template) => template.type === item).length;
  return (
    <div className={styles.settingsOpsLayout}>
    <section className={styles.settingsOpsHero}>
      <div>
        <span><Printer size={16} /> Cấu hình mẫu in</span>
        <h3>Template in ấn dùng toàn hệ thống</h3>
        <p>Quản lý mẫu hợp đồng, hóa đơn, thẻ hội viên, phiếu thu và bill thanh toán. Mỗi loại có một mẫu mặc định.</p>
      </div>
    </section>
    <section className={styles.settingsCard}>
      <PanelHead icon={Printer} title="Danh sách mẫu in" subtitle="Lọc theo loại, xem trước, cấu hình hoặc xóa mẫu không phải mặc định." action="Tạo mẫu in mới" onAction={() => onOpen("template", "Tạo mẫu in mới")} />
      <div className={styles.settingsFilterTabs}>
        {filters.map((item) => (
          <button className={filter === item ? styles.settingsFilterActive : undefined} key={item} onClick={() => onFilter(item)} type="button">{item} ({filterCount(item)})</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className={styles.settingsEmptyState}>
          <FileCog size={42} />
          <strong>Chưa có mẫu in nào</strong>
          <p>Tạo mẫu thẻ hội viên hoặc bill thanh toán để dùng khi in từ các module liên quan.</p>
          <button onClick={() => onOpen("template", "Tạo mẫu in mới")} type="button"><Plus size={16} />Tạo mẫu in mới</button>
        </div>
      ) : (
        <div className={styles.settingsTemplateGrid}>
          {filtered.map((template) => (
            <article key={template.name} className={styles.settingsTemplateCard}>
              <button className={styles.settingsTemplateDelete} disabled={template.default} onClick={() => onOpen("confirm", `Xóa ${template.name}`, "Mẫu mặc định không thể xóa cho đến khi có mẫu khác được đặt làm mặc định.")} type="button"><Trash2 size={15} /></button>
              <div className={styles.settingsTemplatePreview}><FileCog size={38} /></div>
              <div>
                <span>{template.type}</span>
                <strong>{template.name}</strong>
                <small>{template.size} · {template.font} · Cập nhật {template.updated}</small>
              </div>
              {template.default ? <em>Mặc định</em> : null}
              <footer>
                <button onClick={() => onOpen("preview", `Xem trước ${template.name}`)} type="button"><Eye size={16} />Xem trước</button>
                <button onClick={() => onOpen("template", `Cấu hình ${template.name}`)} type="button"><SlidersHorizontal size={16} />Cấu hình</button>
              </footer>
            </article>
          ))}
        </div>
      )}
    </section>
    </div>
  );
}

function InvoicePanel({
  connected,
  provider,
  setConnected,
  setProvider,
  showToast,
}: {
  connected: boolean;
  provider: string;
  setConnected: (value: boolean) => void;
  setProvider: (value: string) => void;
  showToast: (message: string) => void;
}) {
  const providerFields = provider === "BKAV"
    ? ["Partner GUID", "Partner Token", "Invoice form", "Loại hóa đơn", "Loại ký số", "API endpoint"]
    : provider === "MISA"
      ? ["Mã số thuế", "Username", "Password", "App ID", "API Key", "Loại ký số"]
      : ["Mã số thuế", "Username", "Password", "API Key", "API Secret", "Môi trường"];
  return (
    <div className={styles.settingsOpsLayout}>
      <section className={styles.settingsOpsHero}>
        <div>
          <span><ReceiptText size={16} /> Hóa đơn điện tử</span>
          <h3>Kết nối nhà cung cấp HĐĐT</h3>
          <p>Cấu hình thông tin xác thực, ký hiệu hóa đơn và quy tắc phát hành tự động cho hợp đồng, vé lẻ, bill dịch vụ.</p>
        </div>
      </section>
      <div className={styles.settingsSplit}>
      <section className={styles.settingsCard}>
        <PanelHead icon={ReceiptText} title="Nhà cung cấp hóa đơn điện tử" subtitle="Cần test kết nối thành công trước khi lưu thông tin phát hành." />
        <div className={styles.settingsProviderGrid}>
          {providers.map((item) => (
            <button className={provider === item ? styles.settingsProviderActive : undefined} key={item} onClick={() => { setProvider(item); setConnected(false); }} type="button">
              <ReceiptText size={22} />
              <strong>{item}</strong>
              <span>{item === "Viettel" ? "Đang dùng phổ biến" : "Tích hợp API"}</span>
          </button>
        ))}
        </div>
        <div className={styles.settingsProviderStatus}>
          <strong>{provider}</strong>
          <span>{connected ? "Đã test kết nối. Có thể lưu cấu hình phát hành." : "Chưa test kết nối. Nút lưu sẽ khóa cho đến khi test thành công."}</span>
        </div>
      </section>
      <section className={styles.settingsCard}>
        <PanelHead icon={LockKeyhole} title="Thông tin phát hành" subtitle="Thông tin nhạy cảm được mã hóa khi lưu trên máy chủ." />
        <div className={styles.settingsFormGrid}>
          {providerFields.map((field, index) => (
            <TextField key={field} label={field} value={index === 0 ? "0318888999" : index === 1 ? "nextgolf_api" : ""} />
          ))}
          <TextField label="Mẫu số" value="1/001" />
          <TextField label="Ký hiệu" value="C26TNG" />
          <TextField label="Tự động phát hành" value="Bật sau khi thanh toán đủ" />
          <TextField label="Email nhận lỗi" value="accounting@nextgolf.vn" />
        </div>
        <div className={styles.settingsActionRow}>
          <button onClick={() => { setConnected(true); showToast(`Kết nối ${provider} thành công trong môi trường demo`); }} type="button"><TestTube2 size={17} />Test kết nối</button>
          <button onClick={() => showToast("Đã mở nhật ký phát hành HĐĐT")} type="button"><FileText size={17} />Nhật ký</button>
          <button disabled={!connected} onClick={() => showToast(`Đã lưu cấu hình HĐĐT ${provider}`)} type="button"><Save size={17} />Lưu HĐĐT</button>
        </div>
      </section>
      </div>
    </div>
  );
}

function RolePanel({
  onOpen,
  selectedRole,
  setSelectedRole,
  showToast,
}: {
  onOpen: (kind: ModalKind, title: string, note?: string) => void;
  selectedRole: string;
  setSelectedRole: (value: string) => void;
  showToast: (message: string) => void;
}) {
  return (
    <div className={styles.settingsOpsLayout}>
      <section className={styles.settingsOpsHero}>
        <div>
          <span><ShieldCheck size={16} /> Phân quyền & Agent</span>
          <h3>Quản trị vai trò, quyền và sơ đồ tổ chức</h3>
          <p>Thiết lập ma trận quyền theo module, mời Agent qua SSO, theo dõi trạng thái tài khoản và phân cấp quản lý.</p>
        </div>
      </section>
      <div className={styles.settingsMiniStats}>
        <MiniStat label="Vai trò" value="05" />
        <MiniStat label="Tài khoản" value="32" />
        <MiniStat label="Tính năng" value="48" />
        <MiniStat label="Vai trò tùy chỉnh" value="03" />
      </div>
      <section className={styles.settingsRoleLayout}>
        <aside className={styles.settingsCard}>
          <PanelHead icon={UsersRound} title="Danh sách vai trò" subtitle="Phân quyền theo nhóm nghiệp vụ." action="Tạo vai trò" onAction={() => onOpen("role", "Tạo vai trò")} />
          <div className={styles.settingsRoleList}>
            {roles.map((role) => (
              <button className={selectedRole === role.name ? styles.settingsRoleActive : undefined} key={role.name} onClick={() => setSelectedRole(role.name)} type="button">
                <strong>{role.name}</strong>
                <span>{role.users} người dùng · {role.permissions} quyền</span>
                <ChevronRight size={17} />
              </button>
            ))}
          </div>
        </aside>
        <section className={styles.settingsCard}>
          <PanelHead icon={ShieldCheck} title={selectedRole} subtitle="Cấu hình quyền xem, tạo, sửa, xóa theo từng phân hệ." action="Xuất quyền" onAction={() => showToast("Đã tạo file quyền mẫu")} />
          <div className={styles.settingsPermissionGrid}>
            {["Hội viên", "Hợp đồng", "Check-in", "Lịch HLV", "Lớp học", "Sổ quỹ", "Hoa hồng", "Cài đặt"].map((module, index) => (
              <article key={module}>
                <strong>{module}</strong>
                <label><input defaultChecked type="checkbox" /> Xem</label>
                <label><input defaultChecked={index < 5} type="checkbox" /> Tạo/Sửa</label>
                <label><input defaultChecked={index < 2} type="checkbox" /> Xóa/Duyệt</label>
              </article>
            ))}
          </div>
        </section>
      </section>
      <section className={styles.settingsCard}>
        <PanelHead icon={UsersRound} title="Tài khoản nhân sự" subtitle="Màn AgentList, AgentEdit và AgentDelete trong tài liệu được gom ở đây để quản trị tài khoản đăng nhập." action="Mời Agent" onAction={() => onOpen("role", "Mời Agent mới")} />
        <div className={styles.settingsAgentList}>
          {["Lan Anh - Lễ tân", "Minh Khang - Sales", "Hoàng Long - Quản lý CN", "Bảo Châu - HLV"].map((agent, index) => (
            <article key={agent}>
              <div>
                <strong>{agent}</strong>
                <span>{index % 2 === 0 ? "Đang hoạt động" : "Chờ xác thực 2FA"}</span>
              </div>
              <button onClick={() => onOpen("role", `Sửa ${agent}`)} type="button"><Pencil size={15} />Sửa</button>
              <button onClick={() => onOpen("confirm", `Xóa ${agent}`, "Tài khoản có lịch sử thao tác sẽ bị khóa đăng nhập thay vì xóa cứng.")} type="button"><Trash2 size={15} />Xóa</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function CodePanel({ onOpen, showToast }: { onOpen: (kind: ModalKind, title: string, note?: string) => void; showToast: (message: string) => void }) {
  return (
    <div className={styles.settingsOpsLayout}>
      <section className={styles.settingsOpsHero}>
        <div>
          <span><KeyRound size={16} /> Cấu hình sinh mã</span>
          <h3>Quy tắc định danh tự động</h3>
          <p>Mã hội viên, hợp đồng, hóa đơn, lịch PT và lớp học được sinh theo tiền tố, ký tự phân tách và số thứ tự.</p>
        </div>
      </section>
      <section className={styles.settingsCard}>
        <InfoNote>Mã đã phát sinh không đổi. Cấu hình mới chỉ áp dụng cho hồ sơ tạo sau khi lưu.</InfoNote>
        <div className={styles.settingsCodeGrid}>
          {codeConfigs.map((config) => (
            <article key={config.label} className={styles.settingsCodeCard}>
              <header>
                <div>
                  <strong>{config.label}</strong>
                  <small>4 mã kế tiếp: {config.preview} · {config.prefix}{config.separator}{String(Number(config.start) + 1).padStart(config.digits, "0")}</small>
                </div>
                <span>{config.preview}</span>
              </header>
              <div className={styles.settingsFormGrid}>
                <TextField label="Tiền tố" value={config.prefix} />
                <TextField label="Phân tách" value={config.separator || "Không dùng"} />
                <TextField label="Số bắt đầu" value={config.start} />
                <TextField label="Số chữ số" value={String(config.digits)} />
              </div>
              <footer>
                <button onClick={() => showToast(`Đã reset cấu hình ${config.label}`)} type="button"><RefreshCcw size={15} />Reset</button>
                <button onClick={() => onOpen("confirm", `Xóa cấu hình ${config.label}`, "Chỉ xóa khi chưa có nghiệp vụ đang dùng mã này.")} type="button"><Trash2 size={15} />Xóa</button>
              </footer>
            </article>
          ))}
        </div>
        <div className={styles.settingsActionRow}>
          <button onClick={() => showToast("Đã kiểm tra xung đột mã")} type="button"><ClipboardCheck size={17} />Kiểm tra trùng mã</button>
          <button onClick={() => showToast("Đã lưu cấu hình sinh mã")} type="button"><Save size={17} />Lưu tất cả</button>
        </div>
      </section>
    </div>
  );
}

function PromotionPanel({ onOpen, showToast }: { onOpen: (kind: ModalKind, title: string, note?: string) => void; showToast: (message: string) => void }) {
  return (
    <div className={styles.settingsStack}>
      <div className={styles.settingsPromoStats}>
        <article className={styles.settingsPromoPurple}><BadgePercent size={28} /><span>Tổng CTKM</span><strong>3</strong></article>
        <article className={styles.settingsPromoGreen}><Check size={28} /><span>Đang áp dụng</span><strong>2</strong></article>
        <article className={styles.settingsPromoOrange}><CircleDollarSign size={28} /><span>Tổng giảm giá</span><strong>300.000đ</strong></article>
        <article className={styles.settingsPromoBlue}><Gauge size={28} /><span>Đã hết hạn</span><strong>1</strong></article>
      </div>
      <section className={styles.settingsCard}>
        <PanelHead icon={BadgePercent} title="Danh sách khuyến mãi" subtitle="Quản lý chương trình ưu đãi áp dụng khi ký hợp đồng mới." action="Tạo khuyến mãi" onAction={() => onOpen("promotion", "Tạo khuyến mãi mới")} />
        <div className={styles.settingsPromoTableWrap}>
          <table className={styles.settingsPromoTable}>
            <thead>
              <tr>
                <th>Mã KM</th>
                <th>Tên chương trình</th>
                <th>Loại KM</th>
                <th>Giá trị</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promo) => (
                <tr key={promo.code}>
                  <td><span className={promo.active ? styles.settingsDotGreen : styles.settingsDotRed} /> <strong>{promo.code}</strong></td>
                  <td><strong>{promo.name}</strong><small>{promo.desc}</small></td>
                  <td><span className={promo.type === "Tặng buổi PT" ? styles.settingsPromoTypePurple : promo.type === "Giảm giá %" ? styles.settingsPromoTypeGreen : styles.settingsPromoTypeAmber}>{promo.type}</span></td>
                  <td><b>{promo.value}</b></td>
                  <td>{promo.time}</td>
                  <td><span className={promo.active ? styles.settingsStatusGreen : styles.settingsStatusAmber}>{promo.status}</span></td>
                  <td>
                    <div className={styles.checkinActionRow}>
                      <button className={styles.checkinIconBtn} onClick={() => onOpen("promotion", `Chỉnh sửa ${promo.code}`)} title="Sửa" type="button"><Pencil size={14} /></button>
                      <button className={`${styles.checkinIconBtn} ${styles.checkinIconBtnDanger}`} onClick={() => onOpen("confirm", `Xóa ${promo.code}`, "Không thể xóa CTKM đang có hợp đồng áp dụng. Hệ thống sẽ kiểm tra ràng buộc trước khi xóa.")} title="Xóa" type="button"><Trash2 size={14} /></button>
                      <button className={styles.checkinIconBtn} onClick={() => showToast(`Đã nhân bản ${promo.code}`)} title="Nhân bản" type="button"><RefreshCcw size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SettingsModal({ modal, onClose, onDone }: { modal: ModalState; onClose: () => void; onDone: (message: string) => void }) {
  const body = getModalBody(modal);
  return (
    <div className={styles.modalOverlay}>
      <section className={styles.settingsModal}>
        <header>
          <div>
            <span>Cài đặt hệ thống</span>
            <h3>{modal.title}</h3>
          </div>
          <button aria-label="Đóng" onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <div className={styles.settingsModalBody}>
          {modal.note ? <InfoNote>{modal.note}</InfoNote> : null}
          {body}
        </div>
        <footer>
          <button onClick={onClose} type="button">Hủy</button>
          <button onClick={() => onDone(modal.kind === "confirm" ? "Đã ghi nhận thao tác kiểm soát dữ liệu" : "Đã lưu thông tin cấu hình")} type="button">
            {modal.kind === "confirm" ? "Xác nhận" : "Lưu"}
          </button>
        </footer>
      </section>
    </div>
  );
}

function getModalBody(modal: ModalState) {
  if (modal.kind === "preview") {
    return (
      <div className={styles.settingsPrintPreview}>
        <strong>NEXTVISION GOLF CENTER</strong>
        <span>{modal.title?.includes("Phiếu thu") ? "Phiếu thu K80 - K80 (80mm)" : modal.title?.includes("Hóa đơn") ? "Hóa đơn chuẩn - A4 (210 x 297mm)" : "Hợp đồng chuẩn - A4 (210 x 297mm)"}</span>
        <div />
        <p>{modal.title?.includes("Phiếu thu") ? "Cảm ơn quý khách!" : "Ngày 03 tháng 03 năm 2026"}</p>
      </div>
    );
  }
  if (modal.kind === "confirm") {
    return <p className={styles.settingsConfirmText}>Thao tác này sẽ được ghi audit log. Dữ liệu đã phát sinh nghiệp vụ sẽ được khóa hoặc ngưng sử dụng thay vì xóa cứng.</p>;
  }
  if (modal.kind === "device") {
    const editing = modal.title?.startsWith("Sửa");
    return (
      <div className={styles.settingsModalStack}>
        {!editing ? (
          <div className={styles.settingsDeviceTypeTabs}>
            <button type="button">Chấm công</button>
            <button type="button">Face ID</button>
            <button type="button">Quẹt thẻ</button>
          </div>
        ) : null}
        <div className={styles.settingsFormGrid}>
          <TextField label="Mã máy" value={editing ? "FACE-CN1" : "Hikvision FaceID1"} />
          <TextField label="Tên máy" value={editing ? "Face cổng chính" : "FaceID sảnh chính"} />
          <TextField label="Cổng TCP/IP" value="4370" />
          <TextField label="Địa chỉ IP" value="192.168.1.150" />
          <TextField label="Mật khẩu" value="••••••••" />
          <TextField label="Chi nhánh" value="NextVision Golf Center - Bến Nghé" />
          <label className={styles.settingsFullField}><span>Máy Check PT</span><input defaultChecked={editing} type="checkbox" /></label>
        </div>
        <InfoNote>IP + cổng phải duy nhất theo chi nhánh. Có thể test kết nối trước khi lưu; mật khẩu chỉ hiển thị dạng ẩn.</InfoNote>
      </div>
    );
  }
  if (modal.kind === "promotion") {
    const editing = modal.title?.startsWith("Chỉnh sửa");
    return (
      <div className={styles.settingsModalStack}>
        <div className={styles.settingsWizardTabs}>
          <button type="button">1. Thông tin</button>
          <button type="button">2. Điều kiện</button>
          <button type="button">3. Đối tượng</button>
        </div>
        <div className={styles.settingsFormGrid}>
          <TextField label="Mã khuyến mãi" value={editing ? "SUMMER2026" : "SUMMER2026"} />
          <TextField label="Tên khuyến mãi" value={editing ? "Khuyến mãi hè 2026" : ""} />
          <TextField label="Ngày bắt đầu" value="2026-06-01" />
          <TextField label="Ngày kết thúc" value="2026-08-31" />
          <TextField label="Loại khuyến mãi" value="Tặng buổi HLV / Giảm % / Giảm tiền" />
          <TextField label="Giá trị khuyến mãi" value="5 buổi PT" />
          <TextField label="Giá trị đơn hàng tối thiểu" value="1.000.000đ" />
          <TextField label="Giới hạn mỗi khách" value="1 lần" />
          <TextField label="Áp dụng gói tập" value="VIP, 6 tháng, 12 tháng" />
          <TextField label="Áp dụng chi nhánh" value="Tất cả chi nhánh" />
          <TextField label="Đối tượng hội viên" value="Tất cả / Mới / Tái ký / Đã nghỉ" />
          <TextField label="Hạng thẻ hội viên" value="Bronze, Silver, Gold, Platinum" />
          <TextField area label="Mô tả chi tiết" value="Điều khoản, điều kiện áp dụng và giới hạn ưu đãi." />
        </div>
      </div>
    );
  }
  if (modal.kind === "template") {
    const isCode = modal.title?.includes("sinh mã");
    if (isCode) {
      return (
        <div className={styles.settingsModalStack}>
          <div className={styles.settingsFormGrid}>
            <TextField label="Chọn đối tượng" value="MEMBER" />
            <TextField label="Tiền tố" value="MEM" />
            <TextField label="Ký tự phân tách" value="-" />
            <TextField label="Số bắt đầu" value="1" />
            <TextField label="Số chữ số" value="4" />
          </div>
          <div className={styles.settingsCodePreview}><span>Xem trước định dạng</span><strong>MEM-0001</strong><p>Mã đầu tiên sẽ được sinh khi tạo mới đối tượng MEMBER.</p></div>
        </div>
      );
    }
    return (
      <div className={styles.settingsModalStack}>
        <div className={styles.settingsFormGrid}>
          <TextField label="Tên mẫu in" value={modal.title?.includes("Tạo") ? "Mẫu in mới" : "Hợp đồng chuẩn"} />
          <TextField label="Loại mẫu" value="Hợp đồng / Hóa đơn / Thẻ hội viên / Phiếu thu / Bill" />
          <TextField label="Khổ giấy" value="A4 (210 x 297mm)" />
          <TextField label="Font chữ" value="Arial" />
          <TextField label="Kích thước chữ" value="13px" />
          <TextField label="Khoảng cách dòng" value="1.5" />
          <label><span>Hiển thị logo</span><input defaultChecked type="checkbox" /></label>
          <label><span>Hiển thị tên công ty</span><input defaultChecked type="checkbox" /></label>
          <label><span>Hiển thị chữ ký</span><input defaultChecked type="checkbox" /></label>
          <label><span>Hiển thị dấu</span><input defaultChecked type="checkbox" /></label>
          <TextField area label="Văn bản tùy chỉnh cuối trang" value="Cảm ơn quý khách đã sử dụng dịch vụ" />
        </div>
      </div>
    );
  }
  if (modal.kind === "role") {
    return (
      <div className={styles.settingsModalStack}>
        <div className={styles.settingsFormGrid}>
          <TextField label="Email" value="agent@example.com" />
          <TextField label="Mã Agent" value="AG007" />
          <TextField label="Họ và tên" value="Nguyễn Văn A" />
          <TextField label="Số điện thoại" value="0901234567" />
          <TextField label="Phòng ban" value="Kinh doanh - Nhóm A" />
          <TextField label="Người quản lý trực tiếp" value="Không có (Root / CEO)" />
          <TextField label="Vai trò" value="Nhân viên" />
          <TextField label="Trạng thái" value="Đang hoạt động" />
        </div>
        <InfoNote>Agent có thể đăng nhập qua Gmail, Facebook hoặc Email. Khi xóa Agent có nhân sự dưới quyền, cần chuyển người quản lý trước.</InfoNote>
      </div>
    );
  }
  if (modal.kind === "branch") {
    return (
      <div className={styles.settingsFormGrid}>
        <TextField label="Tên chi nhánh" value="Chi nhánh Bến Nghé" />
        <TextField label="Mã chi nhánh" value="CN-BN" />
        <TextField label="Địa chỉ" value="123 Nguyễn Huệ, TP.HCM" />
        <TextField label="Số điện thoại" value="028 3822 1234" />
        <TextField label="Email" value="bennge@nextgolf.vn" />
        <TextField label="Quản lý chi nhánh" value="Nguyễn Minh Anh" />
        <TextField label="Giờ mở cửa" value="06:00" />
        <TextField label="Giờ đóng cửa" value="22:00" />
        <TextField label="Trạng thái" value="Hoạt động" />
      </div>
    );
  }
  return (
    <div className={styles.settingsFormGrid}>
      <TextField label="Tên" value="" />
      <TextField label="Mã" value="" />
      <TextField label="Trạng thái" value="Đang hoạt động" />
      <TextField area label="Ghi chú" value="" />
    </div>
  );
}

function PanelHead({
  action,
  icon: Icon,
  onAction,
  subtitle,
  title,
}: {
  action?: string;
  icon: LucideIcon;
  onAction?: () => void;
  subtitle: string;
  title: string;
}) {
  return (
    <div className={styles.settingsPanelHead}>
      <span><Icon size={19} /></span>
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      {action ? <button onClick={onAction} type="button"><Plus size={16} />{action}</button> : null}
    </div>
  );
}

function TextField({ area, label, value }: { area?: boolean; label: string; value: string }) {
  return (
    <label className={area ? styles.settingsFullField : undefined}>
      <span>{label}</span>
      {area ? <textarea defaultValue={value} /> : <input defaultValue={value} />}
    </label>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <article>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function InfoNote({ children }: { children: ReactNode }) {
  return (
    <div className={styles.settingsInfoNote}>
      <ClipboardCheck size={17} />
      <span>{children}</span>
    </div>
  );
}

"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import {
  BadgePercent,
  Banknote,
  Building2,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  ClipboardCheck,
  CreditCard,
  Download,
  Eye,
  FileCog,
  FileText,
  Fingerprint,
  Gauge,
  IdCard,
  KeyRound,
  Layers3,
  LockKeyhole,
  Mail,
  MapPin,
  MonitorCog,
  MoreVertical,
  Pencil,
  Plus,
  PlusCircle,
  Phone,
  Power,
  Printer,
  ReceiptText,
  RefreshCcw,
  Save,
  ScanFace,
  ScrollText,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TestTube2,
  Trash2,
  Upload,
  UserRound,
  UsersRound,
  WalletCards,
  Wifi,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FeaturePage } from "@/shared/components";
import { branchFullNames, branchShortNames, systemBranches } from "@/shared/data";
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

type ModalKind =
  | "branch"
  | "device"
  | "template"
  | "code"
  | "promotion"
  | "role"
  | "preview"
  | "confirm"
  | "businessSave"
  | "paymentSave"
  | "vatSave"
  | "vatReset"
  | "codeReset"
  | "codeSave"
  | "permissionImport"
  | "permissionExport"
  | "transferRole"
  | "agentChildren"
  | "invoiceLog"
  | "invoiceSave"
  | "deviceTest"
  | "codeConflict"
  | "duplicatePromotion"
  | "logoEditor"
  | null;

type ModalState = {
  kind: ModalKind;
  title?: string;
  note?: string;
  template?: PrintTemplate;
};

type SettingsDeviceType = "FACE" | "ATTENDANCE" | "CARD";
type SettingsDeviceColumn = "name" | "code" | "port" | "ip" | "password" | "branch" | "status";
type TemplateKind = "contract" | "invoice" | "receipt" | "bill" | "memberCard";
type PrintTemplate = {
  default: boolean;
  font: string;
  fontSize: string;
  kind: TemplateKind;
  name: string;
  size: string;
  type: string;
  updated: string;
};
type MemberCardTemplateOptions = {
  logo: boolean;
  tier: boolean;
  expiry: boolean;
  code: boolean;
  qr: boolean;
  note: boolean;
};
type BusinessInfo = {
  name: string;
  taxCode: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  description: string;
};

const tabs: Array<{ key: TabKey; label: string; icon: LucideIcon }> = [
  { key: "business", label: "Thông tin doanh nghiệp", icon: Building2 },
  { key: "payment", label: "Phương thức thanh toán", icon: CreditCard },
  { key: "print", label: "Cấu hình mẫu in", icon: Printer },
  { key: "einvoice", label: "Hóa đơn điện tử", icon: ReceiptText },
  { key: "roles", label: "Phân quyền", icon: ShieldCheck },
  { key: "branches", label: "Quản lý chi nhánh", icon: Layers3 },
  { key: "codes", label: "Cấu hình sinh mã", icon: KeyRound },
  { key: "devices", label: "Quản lý thiết bị", icon: Fingerprint },
  { key: "general", label: "Cài đặt chung", icon: SlidersHorizontal },
  { key: "promotions", label: "Quản lý khuyến mãi", icon: BadgePercent },
];

const branches = systemBranches;
const allBranchShortOptions = ["Tất cả chi nhánh", ...branchShortNames];
const defaultBusinessInfo: BusinessInfo = {
  name: "NextVision Golf Center",
  taxCode: "0318888999",
  phone: "02838221900",
  email: "support@nextgolf.vn",
  website: "https://nextgolf.vn",
  address: "12 Nguyễn Huệ, Quận 1, TP.HCM",
  description: "Trung tâm golf indoor/outdoor, quản lý hội viên, HLV, line tập, lớp học, thiết bị check-in và thanh toán tại quầy.",
};

const devices = [
  { id: "D-001", type: "FACE" as const, name: "Face cổng chính", code: "FACE-CN1", port: 4370, ip: "192.168.1.21", password: "********", branch: branchShortNames[0], isCoachOnly: false, online: true },
  { id: "D-002", type: "FACE" as const, name: "Face cổng phụ", code: "FACE-CN2", port: 4370, ip: "192.168.1.22", password: "********", branch: branchShortNames[0], isCoachOnly: false, online: true },
  { id: "D-003", type: "FACE" as const, name: "Face Driving Range", code: "FACE-DR", port: 4370, ip: "192.168.1.23", password: "********", branch: branchShortNames[0], isCoachOnly: false, online: false },
  { id: "D-004", type: "ATTENDANCE" as const, name: "Máy chấm công HLV", code: "ATT-HLV", port: 4371, ip: "192.168.1.41", password: "********", branch: branchShortNames[1], isCoachOnly: true, online: true },
  { id: "D-005", type: "ATTENDANCE" as const, name: "Máy chấm công văn phòng", code: "ATT-VP", port: 4371, ip: "192.168.1.42", password: "********", branch: branchShortNames[1], isCoachOnly: false, online: true },
  { id: "D-006", type: "CARD" as const, name: "Quẹt thẻ cổng chính", code: "CARD-CN1", port: 9100, ip: "192.168.1.51", password: "********", branch: branchShortNames[0], isCoachOnly: false, online: true },
  { id: "D-007", type: "FACE" as const, name: "Face khu putting", code: "FACE-PUTT", port: 4370, ip: "192.168.1.24", password: "********", branch: branchShortNames[2], isCoachOnly: false, online: true },
  { id: "D-008", type: "FACE" as const, name: "Face phòng VIP 1", code: "FACE-VIP1", port: 4370, ip: "192.168.1.25", password: "********", branch: branchShortNames[2], isCoachOnly: false, online: true },
  { id: "D-009", type: "FACE" as const, name: "Face phòng VIP 2", code: "FACE-VIP2", port: 4370, ip: "192.168.1.26", password: "********", branch: branchShortNames[2], isCoachOnly: false, online: true },
  { id: "D-010", type: "FACE" as const, name: "Face khu HLV", code: "FACE-COACH", port: 4370, ip: "192.168.1.27", password: "********", branch: branchShortNames[1], isCoachOnly: true, online: true },
  { id: "D-011", type: "ATTENDANCE" as const, name: "Máy chấm công bảo vệ", code: "ATT-SEC", port: 4371, ip: "192.168.1.43", password: "********", branch: branchShortNames[0], isCoachOnly: false, online: false },
];

const templates: PrintTemplate[] = [
  { kind: "contract", name: "Hợp đồng chuẩn", type: "Hợp đồng", size: "A4 (210 x 297mm)", font: "Arial", fontSize: "13px", updated: "2025-01-01", default: true },
  { kind: "invoice", name: "Hóa đơn chuẩn", type: "Hóa đơn", size: "A4 (210 x 297mm)", font: "Arial", fontSize: "12px", updated: "2025-01-01", default: true },
  { kind: "receipt", name: "Phiếu thu K80", type: "Phiếu thu", size: "K80 (80mm)", font: "Arial", fontSize: "11px", updated: "2025-01-01", default: true },
  { kind: "bill", name: "Bill thanh toán tổng", type: "Bill", size: "K80 (80mm)", font: "Arial", fontSize: "11px", updated: "2026-03-03", default: true },
  { kind: "memberCard", name: "Thẻ hội viên", type: "Thẻ HV", size: "PVC 86 x 54mm", font: "Inter", fontSize: "10px", updated: "2026-03-03", default: false },
];

const templateKindOptions: Array<{ kind: TemplateKind; label: string; sizes: string[] }> = [
  { kind: "contract", label: "Hợp đồng", sizes: ["A4 (210 x 297mm)", "A5"] },
  { kind: "invoice", label: "Hóa đơn", sizes: ["A4 (210 x 297mm)", "A5"] },
  { kind: "receipt", label: "Phiếu thu", sizes: ["K80 (80mm)", "A5"] },
  { kind: "bill", label: "Bill", sizes: ["K80 (80mm)"] },
  { kind: "memberCard", label: "Thẻ HV", sizes: ["PVC 86 x 54mm"] },
];

const providers = ["VNPT Invoice", "Viettel Sinvoice", "FPT Invoice", "MISA meInvoice", "BKAV eInvoice"];

const einvoiceProviderMeta: Record<string, { tone: string; description: string; formNo: string; symbol: string; fields: string[] }> = {
  "VNPT Invoice": {
    tone: "blue",
    description: "Nhà cung cấp phổ biến, dùng tài khoản/API cho phát hành HĐĐT dịch vụ.",
    formNo: "01GTKT0/001",
    symbol: "AA/26E",
    fields: ["Môi trường", "Mã số thuế doanh nghiệp", "Tên đăng nhập", "Mật khẩu", "API Key", "API Secret"],
  },
  "Viettel Sinvoice": {
    tone: "red",
    description: "Tích hợp Sinvoice, cần username, password và cặp khóa API do Viettel cấp.",
    formNo: "01GTKT0/001",
    symbol: "AA/26E",
    fields: ["Môi trường", "Mã số thuế doanh nghiệp", "Tên đăng nhập", "Mật khẩu", "API Key", "API Secret"],
  },
  "FPT Invoice": {
    tone: "orange",
    description: "Tích hợp FPT Invoice, phù hợp quy trình phát hành tự động sau thanh toán.",
    formNo: "01GTKT0/001",
    symbol: "AA/26E",
    fields: ["Môi trường", "Mã số thuế doanh nghiệp", "Tên đăng nhập", "Mật khẩu", "API Key", "API Secret"],
  },
  "MISA meInvoice": {
    tone: "green",
    description: "MISA cần App ID và loại ký số ngoài thông tin xác thực API.",
    formNo: "01GTKT0/001",
    symbol: "AA/26E",
    fields: ["Môi trường", "Mã số thuế doanh nghiệp", "Tên đăng nhập", "Mật khẩu", "API Key", "API Secret", "App ID", "Loại ký số"],
  },
  "BKAV eInvoice": {
    tone: "cyan",
    description: "BKAV dùng Partner GUID/Token và cấu hình invoice form riêng.",
    formNo: "01GTKT3/001",
    symbol: "AA/24E",
    fields: ["Môi trường", "Mã số thuế doanh nghiệp", "Partner GUID", "Partner Token", "Invoice form", "Loại hóa đơn", "Loại ký số"],
  },
};

const templateVisuals: Record<TemplateKind, { icon: LucideIcon; tone: string }> = {
  contract: { icon: FileText, tone: "contract" },
  invoice: { icon: ReceiptText, tone: "invoice" },
  receipt: { icon: WalletCards, tone: "receipt" },
  bill: { icon: ScrollText, tone: "bill" },
  memberCard: { icon: IdCard, tone: "member" },
};

const roles = [
  { name: "Quản trị viên", users: 2, permissions: 52, tone: "blue", system: true },
  { name: "Quản lý chi nhánh", users: 4, permissions: 36, tone: "green", system: true },
  { name: "Lễ tân", users: 4, permissions: 22, tone: "amber", system: false },
  { name: "Sales", users: 3, permissions: 18, tone: "violet", system: false },
  { name: "HLV", users: 4, permissions: 14, tone: "slate", system: false },
];

const roleMembers: Record<string, Array<{ code: string; name: string; branch: string; status: string }>> = {
  "Quản trị viên": [
    { code: "AG001", name: "Nguyễn Văn CEO", branch: "Tất cả chi nhánh", status: "Hoạt động" },
    { code: "AG009", name: "Trần Minh Admin", branch: "Tất cả chi nhánh", status: "Hoạt động" },
  ],
  "Quản lý chi nhánh": [
    { code: "AG003", name: "Hoàng Long", branch: "Bến Nghé", status: "Hoạt động" },
    { code: "AG012", name: "Minh Anh", branch: "Võ Thị Sáu", status: "Hoạt động" },
    { code: "AG018", name: "Bảo Châu", branch: "Thảo Điền", status: "Hoạt động" },
    { code: "AG021", name: "Linh Đan", branch: "Bến Nghé", status: "Tạm ngưng" },
  ],
  "Lễ tân": [
    { code: "AG004", name: "Lan Anh", branch: "Bến Nghé", status: "Hoạt động" },
    { code: "AG005", name: "Thu Hà", branch: "Bến Nghé", status: "Hoạt động" },
    { code: "AG006", name: "Mai Chi", branch: "Võ Thị Sáu", status: "Hoạt động" },
    { code: "AG007", name: "Quỳnh Như", branch: "Thảo Điền", status: "Chờ" },
  ],
  Sales: [
    { code: "AG010", name: "Minh Khang", branch: "Bến Nghé", status: "Hoạt động" },
    { code: "AG011", name: "Phạm Hoài", branch: "Võ Thị Sáu", status: "Hoạt động" },
    { code: "AG014", name: "Tú Anh", branch: "Thảo Điền", status: "Hoạt động" },
  ],
  HLV: [
    { code: "HLV001", name: "Bảo Châu", branch: "Bến Nghé", status: "Hoạt động" },
    { code: "HLV002", name: "Quốc Huy", branch: "Võ Thị Sáu", status: "Hoạt động" },
    { code: "HLV003", name: "Thanh Sơn", branch: "Thảo Điền", status: "Hoạt động" },
    { code: "HLV004", name: "Minh Trí", branch: "Bến Nghé", status: "Hoạt động" },
  ],
};

const settingsAgentDirectory = [
  { code: "AG001", name: "Nguyễn Văn CEO", login: "gmail", email: "ceo@nextgolf.vn", department: "Ban Giám đốc", manager: "Không có", role: "Quản trị viên", subordinates: 5, status: "Hoạt động", hasHistory: true },
  { code: "AG003", name: "Hoàng Long", login: "email", email: "long@nextgolf.vn", department: "Vận hành", manager: "Nguyễn Văn CEO", role: "Quản lý chi nhánh", subordinates: 6, status: "Hoạt động", hasHistory: true },
  { code: "AG004", name: "Lan Anh", login: "gmail", email: "lananh@nextgolf.vn", department: "Lễ tân", manager: "Hoàng Long", role: "Lễ tân", subordinates: 0, status: "Hoạt động", hasHistory: true },
  { code: "AG007", name: "Quỳnh Như", login: "email", email: "nhu@nextgolf.vn", department: "Lễ tân", manager: "Hoàng Long", role: "Lễ tân", subordinates: 0, status: "Chờ", hasHistory: false },
  { code: "AG010", name: "Minh Khang", login: "facebook", email: "khang@nextgolf.vn", department: "Kinh doanh", manager: "Nguyễn Văn CEO", role: "Sales", subordinates: 2, status: "Hoạt động", hasHistory: true },
  { code: "HLV001", name: "Bảo Châu", login: "email", email: "chau@nextgolf.vn", department: "Học viện", manager: "Hoàng Long", role: "HLV", subordinates: 4, status: "Hoạt động", hasHistory: true },
];

type CodeConfig = {
  entity: string;
  label: string;
  prefix: string;
  separator: string;
  start: string;
  digits: number;
};

const initialCodeConfigs: CodeConfig[] = [
  { entity: "MEMBER", label: "Hội viên", prefix: "HV", separator: "", start: "1", digits: 4 },
  { entity: "CONTRACT", label: "Hợp đồng", prefix: "HD", separator: "", start: "1", digits: 5 },
  { entity: "INVOICE", label: "Hóa đơn", prefix: "INV", separator: "-", start: "1", digits: 6 },
  { entity: "SCHEDULE", label: "Lịch HLV", prefix: "PT", separator: "", start: "1", digits: 4 },
  { entity: "CLASS", label: "Lớp học", prefix: "CLS", separator: "", start: "1", digits: 4 },
  { entity: "EMPLOYEE", label: "Nhân viên", prefix: "NV", separator: "", start: "1", digits: 4 },
  { entity: "DEVICE", label: "Thiết bị", prefix: "TB", separator: "-", start: "1", digits: 4 },
  { entity: "BRANCH", label: "Chi nhánh", prefix: "CN", separator: "-", start: "1", digits: 2 },
  { entity: "PROMOTION", label: "Khuyến mãi", prefix: "KM", separator: "-", start: "1", digits: 3 },
  { entity: "RECEIPT", label: "Phiếu thu", prefix: "PTT", separator: "-", start: "1", digits: 5 },
  { entity: "PAYMENT", label: "Phiếu chi", prefix: "PC", separator: "-", start: "1", digits: 5 },
];

const codeEntityOptions = initialCodeConfigs.map((config) => `${config.entity} - ${config.label}`);
const codeSeparatorOptions = ["Không dùng", "-", "_", ".", "/"];
const normalizeSeparator = (separator: string) => separator === "Không dùng" ? "" : separator;
const formatGeneratedCode = (config: Pick<CodeConfig, "prefix" | "separator" | "start" | "digits">, offset = 0) => {
  const number = Math.max(0, Number(config.start) + offset);
  return `${config.prefix}${normalizeSeparator(config.separator)}${String(number).padStart(config.digits, "0")}`;
};

const promotions = [
  { code: "SUMMER2026", name: "Khuyến mãi hè 2026", desc: "Tặng 5 buổi PT cho gói VIP", type: "Tặng buổi PT", value: "5 buổi PT", start: "01/06/2026", end: "31/08/2026", status: "Đang áp dụng", active: true, appliedContracts: 18 },
  { code: "NEWYEAR2026", name: "Chào năm mới 2026", desc: "Giảm 20% cho tất cả gói tập", type: "Giảm giá %", value: "20%", start: "01/01/2026", end: "28/02/2026", status: "Đã kết thúc", active: false, appliedContracts: 42 },
  { code: "MEMBER300K", name: "Giảm giá 300K", desc: "Giảm ngay 300K cho gói 6 tháng trở lên", type: "Giảm giá tiền", value: "300.000đ", start: "01/03/2026", end: "31/03/2026", status: "Đang áp dụng", active: true, appliedContracts: 7 },
];
const promotionPackageOptions = ["Gói 1 tháng", "Gói 3 tháng", "Gói 6 tháng", "Gói 12 tháng", "Gói VIP"];
const promotionTierOptions = ["Bronze", "Silver", "Gold", "Platinum"];

const paymentMethods = [
  { name: "Tiền mặt tại quầy", fee: "0%", settlement: "Tức thời", active: true },
  { name: "Chuyển khoản ngân hàng", fee: "0%", settlement: "T+0", active: true },
  { name: "POS / thẻ quốc tế", fee: "1.8%", settlement: "T+1", active: true },
  { name: "Ví điện tử", fee: "1.2%", settlement: "T+1", active: false },
];

const permissionActions = ["Xem", "Tạo", "Sửa", "Xóa"] as const;
type PermissionAction = (typeof permissionActions)[number] | "Duyệt" | "Xuất";

const permissionModules: Array<{ group: string; items: Array<{ name: string; actions: PermissionAction[] }> }> = [
  { group: "Vận hành", items: [
    { name: "Dashboard", actions: ["Xem"] },
    { name: "Hội viên / Khách hàng", actions: ["Xem", "Tạo", "Sửa", "Xóa"] },
    { name: "Hợp đồng", actions: ["Xem", "Tạo", "Sửa", "Xóa"] },
    { name: "Nhân viên", actions: ["Xem", "Tạo", "Sửa", "Xóa"] },
    { name: "Lịch HLV", actions: ["Xem", "Tạo", "Sửa", "Xóa"] },
    { name: "Lớp học", actions: ["Xem", "Tạo", "Sửa", "Xóa"] },
    { name: "Check-in/Check-out", actions: ["Xem", "Tạo", "Sửa", "Xóa"] },
    { name: "Báo cáo", actions: ["Xem"] },
  ] },
  { group: "Cài đặt", items: [
    { name: "Thông tin doanh nghiệp", actions: ["Xem", "Sửa"] },
    { name: "Gói cước / Bảng giá", actions: ["Xem", "Tạo", "Sửa", "Xóa"] },
    { name: "Cấu hình mẫu in", actions: ["Xem", "Tạo", "Sửa", "Xóa"] },
    { name: "Hóa đơn điện tử", actions: ["Xem", "Tạo", "Sửa"] },
    { name: "Quản lý chi nhánh", actions: ["Xem", "Tạo", "Sửa", "Xóa"] },
  ] },
];

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState<TabKey>("business");
  const [modal, setModal] = useState<ModalState>({ kind: null });
  const [toast, setToast] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [pendingLogo, setPendingLogo] = useState("");
  const [vatMode, setVatMode] = useState<"before" | "after">("before");
  const [rounding, setRounding] = useState(true);
  const [digits, setDigits] = useState(0);
  const [provider, setProvider] = useState("VNPT Invoice");
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

  const exportCsv = (filename: string, rows: string[][]) => {
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll("\"", "\"\"")}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Đã xuất file ${filename}`);
  };

  const openModal = (kind: ModalKind, title: string, note?: string, template?: PrintTemplate) => setModal({ kind, title, note, template });
  const closeModal = () => setModal({ kind: null });

  return (
    <FeaturePage title="Cài Đặt Hệ Thống" subtitle="Cấu hình vận hành, chi nhánh, thiết bị, phân quyền và mẫu nghiệp vụ của trung tâm golf.">
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
          <BusinessPanel
            logoPreview={logoPreview}
            onClearLogo={() => { setLogoPreview(""); showToast("Đã xóa logo đang chọn"); }}
            onLogo={(file) => {
              if (!["image/png", "image/jpeg", "image/gif"].includes(file.type)) {
                showToast("Logo chỉ nhận PNG, JPG hoặc GIF");
                return;
              }
              if (file.size > 2 * 1024 * 1024) {
                showToast("Logo vượt quá 2MB, vui lòng chọn file nhẹ hơn");
                return;
              }
              setPendingLogo(URL.createObjectURL(file));
              openModal("logoEditor", "Chỉnh logo doanh nghiệp", `File: ${file.name}. Căn logo vào khung vuông trước khi áp dụng.`);
            }}
            onCancel={() => openModal("confirm", "Hủy thay đổi thông tin doanh nghiệp", "Hoàn tác dữ liệu đang sửa trong form, không ảnh hưởng thông tin đã lưu trên mẫu in và hóa đơn.")}
            onSave={() => openModal("businessSave", "Lưu thông tin doanh nghiệp", "Kiểm tra MST, email, website và logo trước khi cập nhật sang mẫu in, hóa đơn, hợp đồng mới.")}
          />
        ) : null}
        {activeTab === "payment" ? <PaymentPanel onOpen={openModal} /> : null}
        {activeTab === "print" ? <PrintPanel filter={printFilter} onFilter={setPrintFilter} onOpen={openModal} /> : null}
        {activeTab === "einvoice" ? (
          <InvoicePanel connected={invoiceConnected} onOpen={openModal} provider={provider} setConnected={setInvoiceConnected} setProvider={setProvider} />
        ) : null}
        {activeTab === "roles" ? <RolePanel onExport={exportCsv} onOpen={openModal} selectedRole={selectedRole} setSelectedRole={setSelectedRole} /> : null}
        {activeTab === "branches" ? <BranchPanel onOpen={openModal} /> : null}
        {activeTab === "codes" ? <CodePanel onOpen={openModal} /> : null}
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
            typeFilter={deviceFilter}
            visibleColumns={visibleDeviceColumns}
          />
        ) : null}
        {activeTab === "general" ? <GeneralPanel digits={digits} onOpen={openModal} rounding={rounding} setDigits={setDigits} setRounding={setRounding} setVatMode={setVatMode} vatMode={vatMode} /> : null}
        {activeTab === "promotions" ? <PromotionPanel onOpen={openModal} /> : null}
      </section>

      {toast ? (
        <div className={styles.contractToast}>
          <Sparkles size={18} />
          <span>{toast}</span>
        </div>
      ) : null}

      {modal.kind ? (
        <SettingsModal
          modal={modal}
          onApplyLogo={() => {
            if (pendingLogo) {
              setLogoPreview(pendingLogo);
              setPendingLogo("");
              closeModal();
              showToast("Đã áp dụng logo sau khi căn chỉnh");
            }
          }}
          onClose={closeModal}
          onDone={(message) => { closeModal(); showToast(message); }}
          pendingLogo={pendingLogo}
        />
      ) : null}
    </FeaturePage>
  );
}

function BusinessPanel({
  logoPreview,
  onCancel,
  onClearLogo,
  onLogo,
  onSave,
}: {
  logoPreview: string;
  onCancel: () => void;
  onClearLogo: () => void;
  onLogo: (file: File) => void;
  onSave: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<BusinessInfo>(defaultBusinessInfo);
  const [errors, setErrors] = useState<Partial<Record<keyof BusinessInfo, string>>>({});
  const updateField = (field: keyof BusinessInfo, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };
  const validate = () => {
    const nextErrors: Partial<Record<keyof BusinessInfo, string>> = {};
    if (!form.name.trim()) nextErrors.name = "Tên doanh nghiệp là bắt buộc.";
    if (form.name.trim().length > 200) nextErrors.name = "Tên doanh nghiệp tối đa 200 ký tự.";
    if (form.taxCode && !/^\d{10}(\d{3})?$/.test(form.taxCode.trim())) nextErrors.taxCode = "Mã số thuế phải gồm 10 hoặc 13 chữ số.";
    if (!/^\d{10,11}$/.test(form.phone.replace(/\s/g, ""))) nextErrors.phone = "Số điện thoại phải gồm 10-11 chữ số.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = "Email không hợp lệ.";
    if (form.website && !/^https?:\/\/[^\s]+\.[^\s]+/.test(form.website.trim())) nextErrors.website = "Website phải là URL hợp lệ, ví dụ https://nextgolf.vn.";
    if (!form.address.trim()) nextErrors.address = "Địa chỉ là bắt buộc.";
    if (form.address.trim().length > 500) nextErrors.address = "Địa chỉ tối đa 500 ký tự.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };
  const handleSave = () => {
    if (!validate()) return;
    onSave();
  };
  const handleCancel = () => {
    setForm(defaultBusinessInfo);
    setErrors({});
    onCancel();
  };
  return (
    <div className={styles.settingsBusinessShell}>
      <section className={styles.settingsBusinessProfile}>
        <div className={styles.settingsBusinessGradient}>
          <span>Business profile</span>
          <strong>{form.name || "NextVision Golf Center"}</strong>
        </div>
        <div className={styles.settingsLogoBox}>
          <div className={styles.settingsLogoPreview}>{logoPreview ? <img alt="Logo doanh nghiệp" src={logoPreview} /> : "N"}</div>
          <div>
            <strong>Logo doanh nghiệp</strong>
            <span>PNG/JPG/GIF, tối đa 2MB. Khuyến nghị 200x200px.</span>
          </div>
          <input
            accept="image/png,image/jpeg,image/gif"
            className={styles.settingsHiddenFile}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onLogo(file);
              event.currentTarget.value = "";
            }}
            ref={fileRef}
            type="file"
          />
          <div className={styles.settingsLogoActions}>
            <button onClick={() => fileRef.current?.click()} type="button"><Upload size={18} />Tải logo</button>
            {logoPreview ? <button onClick={onClearLogo} type="button"><Trash2 size={17} />Xóa</button> : null}
          </div>
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
          </div>
        </div>

        <div className={styles.settingsBusinessSections}>
          <section className={`${styles.settingsBusinessSection} ${styles.settingsBusinessSectionBlue}`}>
            <header><FileText size={18} /><div><strong>Thông tin cơ bản</strong><span>Thông tin pháp lý hiển thị trên chứng từ</span></div></header>
            <div className={styles.settingsFormGrid}>
              <TextField error={errors.name} label="Tên doanh nghiệp *" onChange={(value) => updateField("name", value)} value={form.name} />
              <TextField error={errors.taxCode} inputMode="numeric" label="Mã số thuế" onChange={(value) => updateField("taxCode", value.replace(/\D/g, "").slice(0, 13))} value={form.taxCode} />
            </div>
          </section>

          <section className={`${styles.settingsBusinessSection} ${styles.settingsBusinessSectionGreen}`}>
            <header><MonitorCog size={18} /><div><strong>Thông tin liên hệ</strong><span>Dùng trên phiếu thu, hóa đơn và thông báo hệ thống</span></div></header>
            <div className={styles.settingsFormGrid}>
              <TextField error={errors.phone} label="Số điện thoại *" onChange={(value) => updateField("phone", value)} type="tel" value={form.phone} />
              <TextField error={errors.email} label="Email *" onChange={(value) => updateField("email", value)} type="email" value={form.email} />
              <TextField error={errors.website} label="Website" onChange={(value) => updateField("website", value)} type="url" value={form.website} />
              <TextField area error={errors.address} label="Địa chỉ *" onChange={(value) => updateField("address", value)} value={form.address} />
            </div>
          </section>

          <section className={`${styles.settingsBusinessSection} ${styles.settingsBusinessSectionViolet}`}>
            <header><ClipboardCheck size={18} /><div><strong>Mô tả</strong><span>Giới thiệu ngắn về sân tập, dịch vụ và đội ngũ HLV</span></div></header>
            <textarea className={styles.settingsTextarea} onChange={(event) => updateField("description", event.target.value)} value={form.description} />
          </section>
          <div className={styles.settingsBusinessSaveBar}>
            <span>Thay đổi sẽ cập nhật lên mẫu in, hóa đơn và hợp đồng mới sau khi lưu.</span>
            <div>
              <button onClick={handleCancel} type="button"><RefreshCcw size={17} />Hủy thay đổi</button>
              <button onClick={handleSave} type="button"><Save size={17} />Lưu thông tin</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function PaymentPanel({ onOpen }: { onOpen: (kind: ModalKind, title: string, note?: string) => void }) {
  const [methods, setMethods] = useState(paymentMethods);
  const [paymentForm, setPaymentForm] = useState({
    bank: "Vietcombank",
    accountNumber: "1029888999",
    accountHolder: "CONG TY NEXTVISION GOLF",
    transferContent: "{MaPhieuThu} {TenHoiVien}",
    branch: branchShortNames[0],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof paymentForm | "methods", string>>>({});
  const setPaymentField = (field: keyof typeof paymentForm, value: string) => {
    setPaymentForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };
  const toggleMethod = (index: number) => {
    const next = methods.map((method, methodIndex) => methodIndex === index ? { ...method, active: !method.active } : method);
    setMethods(next);
    setErrors((current) => ({ ...current, methods: "" }));
  };
  const savePayment = () => {
    const nextErrors: Partial<Record<keyof typeof paymentForm | "methods", string>> = {};
    const hasActiveMethod = methods.some((method) => method.active);
    const bankTransferActive = methods.some((method) => method.name.includes("Chuyển khoản") && method.active);
    if (!hasActiveMethod) nextErrors.methods = "Cần bật ít nhất một phương thức thanh toán.";
    if (bankTransferActive) {
      if (!paymentForm.bank) nextErrors.bank = "Chọn ngân hàng nhận tiền.";
      if (!/^\d{6,20}$/.test(paymentForm.accountNumber.replace(/\s/g, ""))) nextErrors.accountNumber = "Số tài khoản phải gồm 6-20 chữ số.";
      if (!paymentForm.accountHolder.trim()) nextErrors.accountHolder = "Chủ tài khoản là bắt buộc.";
      if (!paymentForm.transferContent.includes("{MaPhieuThu}")) nextErrors.transferContent = "Nội dung chuyển khoản nên chứa {MaPhieuThu} để đối soát tự động.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onOpen("paymentSave", "Lưu cấu hình phương thức thanh toán", "Cấu hình này áp dụng cho Hợp đồng, Vé lẻ, Teetime, Check-in, Sổ quỹ và mẫu Bill thanh toán kể từ giao dịch mới.");
  };
  return (
    <div className={styles.settingsOpsLayout}>
      <section className={`${styles.settingsCard} ${styles.settingsPaymentPanel}`}>
        <PanelHead icon={CreditCard} title="Phương thức thanh toán" subtitle="Kênh thu tiền tại quầy và bill thanh toán." />
        <div className={styles.settingsPaymentMethods}>
          {methods.map((method, index) => (
            <article className={method.active ? styles.settingsPaymentActive : ""} key={method.name}>
              <span>{index + 1}</span>
              <div>
                <strong>{method.name}</strong>
                <small>Phí {method.fee} · Đối soát {method.settlement} · {method.active ? "Đang nhận thanh toán" : "Đang tạm khóa"}</small>
              </div>
              <button aria-pressed={method.active} className={method.active ? styles.settingsToggleOn : styles.settingsToggleOff} onClick={() => toggleMethod(index)} type="button"><span /></button>
            </article>
          ))}
          {errors.methods ? <em className={styles.settingsFieldErrorText}>{errors.methods}</em> : null}
        </div>
      </section>

      <div className={styles.settingsOpsGrid}>
        <section className={styles.settingsCard}>
          <PanelHead icon={Banknote} title="Tài khoản nhận tiền" subtitle="Thông tin in trên phiếu thu và màn xác nhận chuyển khoản." />
          <div className={styles.settingsFormGrid}>
            <SearchSelectField error={errors.bank} label="Ngân hàng" onChange={(value) => setPaymentField("bank", value)} options={["Vietcombank", "Techcombank", "BIDV", "VietinBank", "MB Bank", "ACB", "VPBank"]} value={paymentForm.bank} />
            <TextField error={errors.accountNumber} inputMode="numeric" label="Số tài khoản" onChange={(value) => setPaymentField("accountNumber", value.replace(/\D/g, ""))} value={paymentForm.accountNumber} />
            <TextField error={errors.accountHolder} label="Chủ tài khoản" onChange={(value) => setPaymentField("accountHolder", value.toUpperCase())} value={paymentForm.accountHolder} />
            <TextField error={errors.transferContent} label="Nội dung mặc định" onChange={(value) => setPaymentField("transferContent", value)} value={paymentForm.transferContent} />
            <QrUploadField />
            <SearchSelectField label="Chi nhánh nhận tiền" onChange={(value) => setPaymentField("branch", value)} options={[...branchShortNames, "Tất cả chi nhánh"]} value={paymentForm.branch} />
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
            <button onClick={savePayment} type="button"><Save size={17} />Lưu cấu hình</button>
          </div>
        </section>
      </div>
    </div>
  );
}

function GeneralPanel({
  digits,
  onOpen,
  rounding,
  setDigits,
  setRounding,
  setVatMode,
  vatMode,
}: {
  digits: number;
  onOpen: (kind: ModalKind, title: string, note?: string) => void;
  rounding: boolean;
  setDigits: (value: number) => void;
  setRounding: (value: boolean) => void;
  setVatMode: (value: "before" | "after") => void;
  vatMode: "before" | "after";
}) {
  const [vatRate, setVatRate] = useState("8");
  const [vatLabel, setVatLabel] = useState("VAT");
  const [showVatDetail, setShowVatDetail] = useState(true);
  const [roundVat, setRoundVat] = useState(true);
  return (
    <div className={styles.settingsOpsLayout}>
      <section className={styles.settingsCard}>
        <PanelHead icon={Gauge} title="Cấu hình tính thuế VAT" subtitle="" />
        <div className={styles.settingsVatOptions}>
          <button className={vatMode === "before" ? styles.settingsVatActive : undefined} onClick={() => setVatMode("before")} type="button">
            <Check size={18} />
            <strong>Giảm giá trước VAT</strong>
            <span>Đơn giá → Giảm giá → Giá trước VAT → +VAT% → Tổng</span>
            <em>VAT tính trên giá sau giảm, phù hợp khuyến mãi trực tiếp.</em>
          </button>
          <button className={vatMode === "after" ? styles.settingsVatActive : undefined} onClick={() => setVatMode("after")} type="button">
            <Check size={18} />
            <strong>Giảm giá sau VAT</strong>
            <span>Đơn giá → +VAT% → Giá gồm VAT → Giảm giá → Tổng</span>
            <em>Dùng khi hóa đơn VAT cần thể hiện đủ thuế trên đơn giá gốc.</em>
          </button>
        </div>
        <div className={styles.settingsVatExample}>
          <article><span>Giảm trước VAT</span><strong>1.430.000đ</strong><small>VAT tính trên giá đã giảm</small></article>
          <article><span>Giảm sau VAT</span><strong>1.450.000đ</strong><small>VAT tính trên giá gốc</small></article>
        </div>
      </section>
      <section className={styles.settingsCard}>
        <PanelHead icon={BadgePercent} title="Thuế suất & hiển thị" subtitle="" />
        <div className={styles.settingsFormGrid}>
          <TextField label="Thuế suất VAT mặc định (%)" onChange={setVatRate} type="number" value={vatRate} />
          <TextField label="Nhãn hiển thị dòng thuế" onChange={setVatLabel} value={vatLabel} />
        </div>
      </section>
      <section className={styles.settingsCard}>
        <PanelHead icon={SlidersHorizontal} title="Tùy chọn hiển thị" subtitle="" />
        <div className={styles.settingsControlRow}>
          <span>Hiển thị chi tiết VAT trong phiếu thu</span>
          <button className={showVatDetail ? styles.settingsToggleOn : styles.settingsToggleOff} onClick={() => setShowVatDetail(!showVatDetail)} type="button"><span /></button>
        </div>
        <div className={styles.settingsControlRow}>
          <span>Làm tròn VAT về đồng nguyên</span>
          <button className={roundVat ? styles.settingsToggleOn : styles.settingsToggleOff} onClick={() => setRoundVat(!roundVat)} type="button"><span /></button>
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
      <section className={styles.settingsCard}>
        <PanelHead icon={ClipboardCheck} title="Tóm tắt cài đặt hiện tại" subtitle="" />
        <div className={styles.settingsSummaryGrid}>
          <MiniStat icon={BadgePercent} label="Thứ tự giảm giá" value={vatMode === "before" ? "Trước VAT" : "Sau VAT"} />
          <MiniStat icon={CircleDollarSign} label="Thuế suất mặc định" value={Number(vatRate) ? `${vatRate}%` : "Nhập thủ công"} />
          <MiniStat icon={FileText} label="Nhãn thuế" value={vatLabel || "VAT"} />
          <MiniStat icon={ReceiptText} label="Chi tiết phiếu thu" value={showVatDetail ? "Bật" : "Tắt"} />
        </div>
        <div className={styles.settingsActionRow}>
          <button onClick={() => onOpen("vatReset", "Đặt lại mặc định VAT & Giá", "Khôi phục giảm giá trước VAT, thuế suất 8%, làm tròn về đồng và 0 chữ số thập phân cho cấu hình mới.")} type="button"><RefreshCcw size={17} />Đặt lại mặc định</button>
          <button onClick={() => onOpen("vatSave", "Lưu cài đặt VAT & Giá", "Cài đặt chỉ áp dụng cho hợp đồng, phiếu thu, hóa đơn tạo mới sau thời điểm lưu.")} type="button"><Save size={17} />Lưu cài đặt VAT</button>
        </div>
      </section>
    </div>
  );
}

function BranchPanel({ onOpen }: { onOpen: (kind: ModalKind, title: string, note?: string) => void }) {
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">("all");
  const [timeFilter, setTimeFilter] = useState("Cả ngày");
  const [query, setQuery] = useState("");
  const activeBranches = branches.filter((branch) => branch.status === "Đang hoạt động").length;
  const totalMembers = branches.reduce((sum, branch) => sum + branch.members, 0);
  const memberAverage = Math.round(totalMembers / Math.max(branches.length, 1));
  const filteredBranches = branches.filter((branch) => {
    const isActive = branch.status === "Đang hoạt động";
    if (statusFilter === "active" && !isActive) return false;
    if (statusFilter === "paused" && isActive) return false;
    const keyword = query.trim().toLowerCase();
    if (!keyword) return true;
    return [branch.name, branch.shortName, branch.code, branch.address, branch.manager, branch.phone, branch.email].some((value) => value.toLowerCase().includes(keyword));
  });
  return (
    <div className={styles.settingsOpsLayout}>
      <div className={styles.settingsMiniStats}>
        <MiniStat icon={Building2} label="Tổng chi nhánh" value={String(branches.length).padStart(2, "0")} />
        <MiniStat icon={Check} label="Đang hoạt động" value={String(activeBranches).padStart(2, "0")} />
        <MiniStat icon={UsersRound} label="Hội viên" value={totalMembers.toLocaleString("vi-VN")} />
        <MiniStat icon={Gauge} label="TB hội viên/CN" value={memberAverage.toLocaleString("vi-VN")} />
      </div>
      <section className={styles.settingsCard}>
        <PanelHead icon={Layers3} title="Danh sách chi nhánh" subtitle="" action="Thêm chi nhánh" onAction={() => onOpen("branch", "Thêm chi nhánh mới")} />
        <div className={styles.settingsToolbarLine}>
          <Search size={18} />
          <input onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên, mã, địa chỉ, người quản lý..." value={query} />
          <select aria-label="Lọc theo thời gian" className={styles.settingsSelectCompact} onChange={(event) => setTimeFilter(event.target.value)} value={timeFilter}>
            {["Cả ngày", "Hôm nay", "Tuần này", "Tháng này"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <button className={statusFilter === "all" ? styles.settingsToolbarActive : undefined} onClick={() => setStatusFilter("all")} type="button">Tất cả</button>
          <button className={statusFilter === "active" ? styles.settingsToolbarActive : undefined} onClick={() => setStatusFilter("active")} type="button">Đang hoạt động</button>
          <button className={statusFilter === "paused" ? styles.settingsToolbarActive : undefined} onClick={() => setStatusFilter("paused")} type="button">Tạm ngưng</button>
        </div>
        <div className={styles.settingsBranchGrid}>
          {filteredBranches.map((branch) => (
            <article key={branch.code} className={styles.settingsBranchCard} onClick={() => onOpen("branch", `Sửa ${branch.name} (${branch.code})`)}>
              <div className={styles.settingsBranchHeader}>
                <span><Building2 size={22} /></span>
                <div>
                  <strong>{branch.name}</strong>
                  <small>{branch.code}</small>
                </div>
                <div className={styles.settingsBranchActions}>
                  <button aria-label={`Sửa ${branch.name}`} onClick={(event) => { event.stopPropagation(); onOpen("branch", `Sửa ${branch.name} (${branch.code})`); }} type="button"><Pencil size={15} /></button>
                  <button aria-label={`Xóa ${branch.name}`} onClick={(event) => { event.stopPropagation(); onOpen("confirm", `Xóa chi nhánh ${branch.shortName} (${branch.code})`, `${branch.name} đang có ${branch.members} hội viên và dữ liệu liên quan từ hợp đồng, check-in, thiết bị.`); }} type="button"><Trash2 size={15} /></button>
                </div>
              </div>
              <dl>
                <div><dt><MapPin size={15} />Địa chỉ</dt><dd>{branch.address}</dd></div>
                <div><dt><Phone size={15} />Số điện thoại</dt><dd>{branch.phone}</dd></div>
                <div><dt><Mail size={15} />Email</dt><dd>{branch.email}</dd></div>
                <div><dt><UserRound size={15} />Quản lý</dt><dd>{branch.manager}</dd></div>
                <div><dt><Clock3 size={15} />Giờ hoạt động</dt><dd>{branch.hours}</dd></div>
              </dl>
              <footer>
                <span><UsersRound size={16} />{branch.members.toLocaleString("vi-VN")} hội viên</span>
                <b className={branch.status === "Đang hoạt động" ? styles.settingsStatusGreen : styles.settingsStatusAmber}>{branch.status}</b>
              </footer>
            </article>
          ))}
        </div>
        {filteredBranches.length === 0 ? <div className={styles.settingsEmptyState}><Layers3 size={38} /><strong>Không có chi nhánh phù hợp</strong></div> : null}
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
              <th><input aria-label="Chọn tất cả thiết bị" checked={allVisibleSelected} onChange={toggleAll} type="checkbox" /></th>
              <th>Loại</th>
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
                <td><input aria-label={`Chọn ${device.name}`} checked={selectedDeviceIds.includes(device.id)} onChange={() => toggleOne(device.id)} type="checkbox" /></td>
                <td>
                  <span className={`${styles.checkinDeviceBadge} ${device.type === "FACE" ? styles.checkinDeviceBadgeFace : device.type === "ATTENDANCE" ? styles.checkinDeviceBadgeAtt : styles.checkinDeviceBadgeCard}`}>
                    {device.type === "FACE" ? <ScanFace size={11} /> : device.type === "ATTENDANCE" ? <Power size={11} /> : <CreditCard size={11} />}
                    {device.type === "FACE" ? "Face ID" : device.type === "ATTENDANCE" ? "Chấm công" : "Quẹt thẻ"}
                  </span>
                </td>
                {visibleColumns.name ? <td><button className={styles.checkinDeviceNameBtn} onClick={() => onOpen("device", `Sửa ${device.code}`)} type="button"><strong>{device.name}</strong></button>{device.isCoachOnly ? <small className={styles.checkinCoachOnly}> · PT</small> : null}</td> : null}
                {visibleColumns.code ? <td><span className={styles.checkinDeviceCode}>{device.code}</span></td> : null}
                {visibleColumns.port ? <td>{device.port}</td> : null}
                {visibleColumns.ip ? <td><Wifi size={11} /> {device.ip}</td> : null}
                {visibleColumns.password ? <td>{device.password}</td> : null}
                {visibleColumns.branch ? <td>{device.branch}</td> : null}
                {visibleColumns.status ? <td>{device.online ? <span className={styles.checkinStatusActive}>● Online</span> : <span className={styles.checkinStatusOffline}>● Offline</span>}</td> : null}
                <td>
                  <div className={styles.checkinActionRow}>
                    <button className={styles.checkinIconBtn} onClick={() => onOpen("deviceTest", `Test kết nối ${device.code}`)} title="Test kết nối" type="button"><TestTube2 size={14} /></button>
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

function PrintPanel({ filter, onFilter, onOpen }: { filter: string; onFilter: (value: string) => void; onOpen: (kind: ModalKind, title: string, note?: string, template?: PrintTemplate) => void }) {
  const filters = ["Tất cả", "Hợp đồng", "Hóa đơn", "Thẻ HV", "Phiếu thu", "Bill"];
  const filtered = filter === "Tất cả" ? templates : templates.filter((template) => template.type === filter);
  const filterCount = (item: string) => item === "Tất cả" ? templates.length : templates.filter((template) => template.type === item).length;
  return (
    <div className={styles.settingsOpsLayout}>
    <section className={styles.settingsCard}>
      <PanelHead icon={Printer} title="Danh sách mẫu in" subtitle="Lọc theo loại, xem trước, cấu hình hoặc xóa mẫu không phải mặc định." action="Tạo mẫu in mới" onAction={() => onOpen("template", "Tạo mẫu in mới", undefined, { kind: "contract", name: "Mẫu in mới", type: "Hợp đồng", size: "A4 (210 x 297mm)", font: "Arial", fontSize: "13px", updated: "Hôm nay", default: false })} />
      <div className={styles.settingsFilterTabs}>
        {filters.map((item) => (
          <button className={filter === item ? styles.settingsFilterActive : undefined} key={item} onClick={() => onFilter(item)} type="button">
            <span>{item}</span>
            <em>{filterCount(item)}</em>
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className={styles.settingsEmptyState}>
          <FileCog size={42} />
          <strong>Chưa có mẫu in nào</strong>
          <p>Tạo mẫu thẻ hội viên hoặc bill thanh toán để dùng khi in từ các module liên quan.</p>
          <button onClick={() => onOpen("template", "Tạo mẫu in mới", undefined, { kind: "contract", name: "Mẫu in mới", type: "Hợp đồng", size: "A4 (210 x 297mm)", font: "Arial", fontSize: "13px", updated: "Hôm nay", default: false })} type="button"><Plus size={16} />Tạo mẫu in mới</button>
        </div>
      ) : (
        <div className={styles.settingsTemplateGrid}>
          {filtered.map((template) => {
            const visual = templateVisuals[template.kind];
            const Icon = visual.icon;
            return (
            <article key={template.name} className={`${styles.settingsTemplateCard} ${styles[`settingsTemplateTone${visual.tone}`]}`}>
              <button
                className={styles.settingsTemplateDelete}
                disabled={template.default}
                aria-label={template.default ? `Không thể xóa mẫu mặc định ${template.name}` : `Xóa mẫu in ${template.name}`}
                onClick={() => onOpen("confirm", `Xóa ${template.name}`, "Mẫu in không mặc định sẽ bị xóa vĩnh viễn. Mẫu mặc định bị chặn xóa cho đến khi có mẫu thay thế cùng loại.", template)}
                title={template.default ? "Mẫu mặc định không thể xóa" : "Xóa mẫu in"}
                type="button"
              >
                <Trash2 size={15} />
              </button>
              <header>
                <span className={styles.settingsTemplateIcon}><Icon aria-hidden="true" size={20} /></span>
                <div>
                  <strong>{template.name}</strong>
                  <span>{template.type}</span>
                </div>
              </header>
              <div className={styles.settingsTemplateChips}>
                <span>{template.type}</span>
                <span>{template.size}</span>
                {template.default ? <em>Mặc định</em> : null}
              </div>
              <dl>
                <div><dt>Font</dt><dd>{template.font}</dd></div>
                <div><dt>Cỡ chữ</dt><dd>{template.fontSize}</dd></div>
                <div><dt>Cập nhật</dt><dd>{template.updated}</dd></div>
              </dl>
              <footer>
                <button aria-label={`Xem trước mẫu in ${template.name}`} onClick={() => onOpen("preview", `Xem trước ${template.name}`, `${template.type} · ${template.size} · dùng dữ liệu mẫu theo SRS, không kết nối dữ liệu thật.`, template)} type="button"><Eye size={16} /><span>Xem trước</span></button>
                <button aria-label={`Cấu hình mẫu in ${template.name}`} onClick={() => onOpen("template", `Cấu hình ${template.name}`, undefined, template)} type="button"><SlidersHorizontal size={16} /><span>Cấu hình</span></button>
              </footer>
            </article>
          );
          })}
        </div>
      )}
    </section>
    </div>
  );
}

function InvoicePanel({
  connected,
  onOpen,
  provider,
  setConnected,
  setProvider,
}: {
  connected: boolean;
  onOpen: (kind: ModalKind, title: string, note?: string) => void;
  provider: string;
  setConnected: (value: boolean) => void;
  setProvider: (value: string) => void;
}) {
  const [environment, setEnvironment] = useState("Sandbox");
  const [testResult, setTestResult] = useState("");
  const meta = einvoiceProviderMeta[provider];
  const changeProvider = (item: string) => {
    setProvider(item);
    setConnected(false);
    setEnvironment("Sandbox");
    setTestResult("");
  };
  const changeEnvironment = (value: string) => {
    setEnvironment(value);
    setConnected(false);
    setTestResult(value === "Production" ? "Production cần xác nhận và chỉ được test bằng thông tin thật do nhà cung cấp cấp." : "");
    if (value === "Production") {
      onOpen("confirm", "Xác nhận chuyển môi trường Production", "Production sẽ phát hành hóa đơn thật nếu bật tự động phát hành. Chỉ dùng khi đã có tài khoản thật, ký số hợp lệ và kế toán xác nhận.");
    }
  };
  const testConnection = () => {
    const latency = provider.includes("BKAV") ? "152ms" : provider.includes("MISA") ? "118ms" : "96ms";
    setConnected(true);
    setTestResult(`Kết nối ${provider} thành công trong ${latency}. MST 0318888999 hợp lệ, mẫu số ${meta.formNo}, ký hiệu ${meta.symbol}, secrets được mask và không ghi vào log.`);
  };
  return (
    <div className={styles.settingsOpsLayout}>
      <div className={`${styles.settingsSplit} ${styles.settingsEInvoiceLayout}`}>
      <section className={styles.settingsCard}>
        <PanelHead icon={ReceiptText} title="Nhà cung cấp hóa đơn điện tử" subtitle="Cần test kết nối thành công trước khi lưu thông tin phát hành." />
        <div className={styles.settingsProviderGrid}>
          {providers.map((item) => (
            <button className={`${provider === item ? styles.settingsProviderActive : ""} ${styles[`settingsProviderTone${einvoiceProviderMeta[item].tone}`]}`} key={item} onClick={() => changeProvider(item)} type="button">
              <span aria-hidden="true" />
              <strong>{item}</strong>
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
          {meta.fields.map((field, index) => (
            <InvoiceField environment={environment} field={field} index={index} key={field} onEnvironmentChange={changeEnvironment} provider={provider} />
          ))}
          <TextField label="Mẫu số hóa đơn" options={provider.includes("BKAV") ? ["01GTKT3/001", "01GTKT0/001"] : ["01GTKT0/001", "01GTKT3/001", "1/001"]} value={meta.formNo} />
          <TextField label="Ký hiệu hóa đơn" value={meta.symbol} />
          <TextField label="Tự động phát hành" options={["Bật sau khi thanh toán đủ", "Tắt", "Chờ kế toán duyệt"]} value="Bật sau khi thanh toán đủ" />
          <TextField label="Email nhận lỗi" type="email" value="accounting@nextgolf.vn" />
        </div>
        {testResult ? (
          <div className={connected ? styles.settingsConnectionResult : styles.settingsConnectionWarning}>
            {connected ? <Check size={22} /> : <TestTube2 size={22} />}
            <strong>{connected ? "Test kết nối thành công" : "Cần xác nhận môi trường"}</strong>
            <span>{testResult}</span>
          </div>
        ) : null}
        <div className={styles.settingsActionRow}>
          <button onClick={testConnection} type="button"><TestTube2 size={17} />Test kết nối</button>
          <button onClick={() => onOpen("invoiceLog", `Nhật ký phát hành HĐĐT ${provider}`)} type="button"><FileText size={17} />Nhật ký</button>
          <button disabled={!connected} onClick={() => onOpen("invoiceSave", `Lưu cấu hình HĐĐT ${provider}`, `Lưu cấu hình ${provider} ở môi trường ${environment}. Secret/API token sẽ mã hóa, không log giá trị gốc và chỉ áp dụng cho hóa đơn phát sinh mới.`)} type="button"><Save size={17} />Lưu HĐĐT</button>
        </div>
      </section>
      </div>
    </div>
  );
}

function RolePanel({
  onExport,
  onOpen,
  selectedRole,
  setSelectedRole,
}: {
  onExport: (filename: string, rows: string[][]) => void;
  onOpen: (kind: ModalKind, title: string, note?: string) => void;
  selectedRole: string;
  setSelectedRole: (value: string) => void;
}) {
  const [roleView, setRoleView] = useState<"roles" | "agents">("roles");
  const [agentView, setAgentView] = useState<"list" | "org">("list");
  const [creatingRole, setCreatingRole] = useState(false);
  const [agentQuery, setAgentQuery] = useState("");
  const [agentStatusFilter, setAgentStatusFilter] = useState("Tất cả trạng thái");
  const [agentRoleFilter, setAgentRoleFilter] = useState("Tất cả vai trò");
  const selectedRoleMeta = roles.find((role) => role.name === selectedRole) ?? roles[0];
  const agentRows = settingsAgentDirectory;
  const filteredAgents = agentRows.filter((agent) => {
    const text = `${agent.code} ${agent.name} ${agent.email} ${agent.department} ${agent.manager}`.toLowerCase();
    const queryMatch = !agentQuery.trim() || text.includes(agentQuery.trim().toLowerCase());
    const statusMatch = agentStatusFilter === "Tất cả trạng thái" || agent.status === agentStatusFilter;
    const roleMatch = agentRoleFilter === "Tất cả vai trò" || agent.role === agentRoleFilter;
    return queryMatch && statusMatch && roleMatch;
  });
  const exportPermissions = () => onExport("phan-quyen-golf.csv", [
    ["Nhóm", "Chức năng", ...permissionActions],
    ...permissionModules.flatMap((section) => section.items.map((item) => [
      section.group,
      item.name,
      ...permissionActions.map((action) => item.actions.includes(action) ? "Có" : "Không áp dụng"),
    ])),
  ]);
  const exportAgents = () => onExport("danh-sach-agent.csv", [
    ["Mã", "Họ tên", "Email", "Phòng ban", "Người quản lý", "Vai trò", "Dưới quyền", "Trạng thái"],
    ...filteredAgents.map((agent) => [agent.code, agent.name, agent.email, agent.department, agent.manager, agent.role, String(agent.subordinates), agent.status]),
  ]);
  return (
    <div className={styles.settingsOpsLayout}>
      <div className={styles.settingsSubTabs}>
        <button className={roleView === "roles" ? styles.settingsSubTabActive : undefined} onClick={() => setRoleView("roles")} type="button"><ShieldCheck size={16} />Vai trò & Phân quyền</button>
        <button className={roleView === "agents" ? styles.settingsSubTabActive : undefined} onClick={() => setRoleView("agents")} type="button"><UsersRound size={16} />Quản lý Agent</button>
      </div>

      {roleView === "roles" ? (
        <>
          <div className={styles.settingsMiniStats}>
            <MiniStat icon={ShieldCheck} label="Vai trò" value="05" />
            <MiniStat icon={UsersRound} label="Tài khoản" value={String(Object.values(roleMembers).reduce((total, items) => total + items.length, 0)).padStart(2, "0")} />
            <MiniStat icon={Layers3} label="Tính năng" value={String(permissionModules.reduce((total, section) => total + section.items.length, 0)).padStart(2, "0")} />
            <MiniStat icon={Sparkles} label="Vai trò tùy chỉnh" value="03" />
          </div>
          <section className={styles.settingsRoleLayout}>
            <aside className={styles.settingsCard}>
              <PanelHead icon={UsersRound} title="Danh sách vai trò" subtitle="Phân quyền theo nhóm nghiệp vụ golf." action="Tạo vai trò" onAction={() => setCreatingRole(true)} />
              <div className={styles.settingsRoleList}>
                {roles.map((role) => (
                  <button className={!creatingRole && selectedRole === role.name ? styles.settingsRoleActive : undefined} key={role.name} onClick={() => { setSelectedRole(role.name); setCreatingRole(false); }} type="button">
                    <strong>{role.name}{role.system ? <em>Hệ thống</em> : null}</strong>
                    <span>{role.users} người dùng · {role.permissions} quyền</span>
                    <ChevronRight size={17} />
                  </button>
                ))}
              </div>
              <div className={styles.settingsActionRow}>
                <button onClick={exportPermissions} type="button"><FileText size={16} />Xuất Excel</button>
                <button onClick={() => onOpen("permissionImport", "Nhập ma trận phân quyền", "Import file Excel theo mẫu. Hệ thống validate module, quyền và user trước khi áp dụng.")} type="button"><Upload size={16} />Nhập Excel</button>
              </div>
            </aside>
            <section className={styles.settingsCard}>
              {creatingRole ? (
                <div className={styles.settingsInlineEditor}>
                  <header>
                    <div>
                      <strong>Tạo vai trò mới</strong>
                      <span>Cấu hình quyền hạn chi tiết cho vai trò</span>
                    </div>
                    <div>
                      <button onClick={() => setCreatingRole(false)} type="button"><X size={15} />Hủy</button>
                      <button onClick={() => onOpen("confirm", "Lưu vai trò Quản lý học viện", "Vai trò mới sẽ được ghi audit log và có thể gán cho Agent sau khi lưu.")} type="button"><Save size={15} />Lưu lại</button>
                    </div>
                  </header>
                  <section className={styles.settingsInlineRoleForm}>
                    <h4>Thông tin vai trò</h4>
                    <div className={styles.settingsFormGrid}>
                      <TextField label="Tên vai trò *" value="Quản lý học viện" />
                      <TextField label="Mô tả vai trò" value="Quản lý lịch HLV, lớp học và học viên golf." />
                    </div>
                  </section>
                  <section className={styles.settingsInlineRoleForm}>
                    <div className={styles.settingsInlineMatrixHead}>
                      <h4>Ma trận phân quyền</h4>
                      <span>16 quyền được cấp</span>
                    </div>
                    <div className={styles.settingsPermissionTable}>
                      <div><strong>Chức năng</strong>{permissionActions.map((action) => <span key={action}>{action}</span>)}</div>
                      {permissionModules.flatMap((section) => section.items).map((module, index) => (
                        <div key={`create-${module.name}`}>
                          <strong>{module.name}</strong>
                          {permissionActions.map((permission) => (
                            <label className={!module.actions.includes(permission) ? styles.settingsPermissionDisabled : undefined} key={permission}>
                              {module.actions.includes(permission) ? <input defaultChecked={permission === "Xem" || index < 2} type="checkbox" /> : <span>—</span>}
                            </label>
                          ))}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              ) : (
                <>
                  <PanelHead icon={ShieldCheck} title={selectedRole} subtitle={selectedRoleMeta.system ? "Vai trò hệ thống: chỉ xem/đối soát, không cho xóa hoặc sửa quyền lõi." : "Vai trò tùy chỉnh: thay đổi quyền được ghi audit log và áp dụng từ lần đăng nhập kế tiếp."} />
                  <div className={styles.settingsPermissionTable}>
                    <div><strong>Nhóm / chức năng</strong>{permissionActions.map((action) => <span key={action}>{action}</span>)}</div>
                    {permissionModules.flatMap((section) => [
                      <div className={styles.settingsPermissionGroupRow} key={section.group}><strong>{section.group}</strong>{permissionActions.map((action) => <span key={action} />)}</div>,
                      ...section.items.map((module, index) => (
                        <div key={`${section.group}-${module.name}`}>
                          <strong>{module.name}</strong>
                          {permissionActions.map((permission) => (
                            <label className={!module.actions.includes(permission) ? styles.settingsPermissionDisabled : undefined} key={permission}>
                              {module.actions.includes(permission) ? <input defaultChecked={selectedRoleMeta.system || permission === "Xem" || index < 3} disabled={selectedRoleMeta.system} type="checkbox" /> : <span>—</span>}
                            </label>
                          ))}
                        </div>
                      )),
                    ])}
                  </div>
                </>
              )}
            </section>
          </section>
        </>
      ) : (
        <section className={styles.settingsCard}>
          <PanelHead icon={UsersRound} title="Quản lý Agent" subtitle="Tài khoản nhân sự đăng nhập hệ thống, gán vai trò và cấu trúc quản lý." action="Mời Agent" onAction={() => onOpen("role", "Mời Agent mới")} />
          <div className={styles.settingsMiniStats}>
            <MiniStat icon={UsersRound} label="Tổng agent" value={String(agentRows.length).padStart(2, "0")} />
            <MiniStat icon={Check} label="Đã chấp nhận" value={String(agentRows.filter((agent) => agent.status === "Hoạt động").length).padStart(2, "0")} />
            <MiniStat icon={Clock3} label="Chờ" value={String(agentRows.filter((agent) => agent.status === "Chờ").length).padStart(2, "0")} />
            <MiniStat icon={ShieldCheck} label="Quản trị viên" value={String(agentRows.filter((agent) => agent.role === "Quản trị viên").length).padStart(2, "0")} />
          </div>
          <div className={styles.settingsToolbarLine}>
            <div className={styles.settingsSubTabs}>
              <button className={agentView === "list" ? styles.settingsSubTabActive : undefined} onClick={() => setAgentView("list")} type="button">Danh sách</button>
              <button className={agentView === "org" ? styles.settingsSubTabActive : undefined} onClick={() => setAgentView("org")} type="button">Sơ đồ tổ chức</button>
            </div>
            <input onChange={(event) => setAgentQuery(event.target.value)} placeholder="Tìm theo tên, mã, email, phòng ban..." value={agentQuery} />
            <select className={styles.settingsSelectCompact} onChange={(event) => setAgentStatusFilter(event.target.value)} value={agentStatusFilter}>
              {["Tất cả trạng thái", "Hoạt động", "Chờ", "Tạm ngưng"].map((item) => <option key={item}>{item}</option>)}
            </select>
            <select className={styles.settingsSelectCompact} onChange={(event) => setAgentRoleFilter(event.target.value)} value={agentRoleFilter}>
              {["Tất cả vai trò", ...roles.map((role) => role.name)].map((item) => <option key={item}>{item}</option>)}
            </select>
            <button onClick={exportAgents} type="button"><FileText size={16} />Xuất Excel</button>
          </div>
          {agentView === "list" ? (
            <div className={styles.settingsAgentTable}>
              <div><strong>Mã Agent</strong><strong>Họ và tên</strong><strong>Email</strong><strong>Phòng ban</strong><strong>Người quản lý</strong><strong>Vai trò</strong><strong>Dưới quyền</strong><strong>Trạng thái</strong><strong>Thao tác</strong></div>
              {filteredAgents.map((agent) => {
                return (
                  <div key={agent.code}>
                    <span>{agent.code}</span>
                    <strong>{agent.name}<small>{agent.login}</small></strong>
                    <span>{agent.email}</span>
                    <span>{agent.department}</span>
                    <span>{agent.manager}</span>
                    <em>{agent.role}</em>
                    <button className={styles.settingsInlineLink} onClick={() => onOpen("agentChildren", `${agent.name} - ${agent.subordinates} người dưới quyền`, `${agent.name} quản lý trực tiếp ${agent.subordinates} agent. Danh sách dùng để kiểm tra trước khi sửa/xóa tài khoản.`)} type="button">{agent.subordinates}</button>
                    <span className={getStatusClass(agent.status)}>{agent.status}</span>
                    <span>
                      {agent.status === "Chờ" ? <button onClick={() => onOpen("confirm", `Gửi lại lời mời ${agent.name}`, `Gửi email kích hoạt mới tới ${agent.email}. Link cũ sẽ hết hiệu lực.`)} type="button"><RefreshCcw size={14} /></button> : null}
                      <button onClick={() => onOpen("role", `Sửa ${agent.name} - ${agent.role}`)} type="button"><Pencil size={14} /></button>
                      <button onClick={() => onOpen("confirm", `Xóa ${agent.name} - ${agent.role}`, agent.role === "Quản trị viên" ? "Agent CEO/root bị chặn xóa để luôn còn quản trị viên hệ thống." : agent.subordinates ? `Agent này có ${agent.subordinates} người dưới quyền. Cần chuyển quản lý trước khi xóa.` : agent.hasHistory ? "Agent đã có lịch sử hợp đồng/check-in nên sẽ soft delete, khóa đăng nhập và giữ audit log." : "Agent chờ chưa kích hoạt có thể hard delete vì chưa phát sinh dữ liệu.")} type="button"><Trash2 size={14} /></button>
                    </span>
                  </div>
                );
              })}
              {!filteredAgents.length ? <div className={styles.settingsTableEmpty}>Không có Agent phù hợp bộ lọc.</div> : null}
            </div>
          ) : (
            <div className={styles.settingsOrgChart}>
              <OrgNode name="Nguyễn Văn CEO" code="AG001" email="ceo@nextgolf.vn" onOpen={onOpen} role="Quản trị viên / CEO" status="Hoạt động" />
              <div className={styles.settingsOrgConnectors}><span /><span /><span /></div>
              <div className={styles.settingsOrgLevel}>
                <OrgNode name="Hoàng Long" code="AG003" email="long@nextgolf.vn" onOpen={onOpen} role="Quản lý CN" status="Hoạt động" subordinates="6 người" />
                <OrgNode name="Minh Khang" code="AG010" email="khang@nextgolf.vn" onOpen={onOpen} role="Sales Lead" status="Hoạt động" subordinates="2 người" />
                <OrgNode name="Bảo Châu" code="HLV001" email="chau@nextgolf.vn" onOpen={onOpen} role="HLV trưởng" status="Hoạt động" subordinates="4 người" />
              </div>
              <div className={styles.settingsOrgLevel}>
                <OrgNode name="Lan Anh" code="AG004" email="lananh@nextgolf.vn" onOpen={onOpen} role="Lễ tân" status="Hoạt động" />
                <OrgNode name="Quỳnh Như" code="AG007" email="nhu@nextgolf.vn" onOpen={onOpen} role="Lễ tân" status="Chờ" />
                <OrgNode name="Trợ giảng TA" code="AG018" email="ta@nextgolf.vn" onOpen={onOpen} role="Trợ giảng" status="Hoạt động" />
                <OrgNode name="CSKH sân tập" code="AG022" email="cskh@nextgolf.vn" onOpen={onOpen} role="CSKH" status="Hoạt động" />
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function CodePanel({ onOpen }: { onOpen: (kind: ModalKind, title: string, note?: string) => void }) {
  const cloneInitialCodeConfigs = () => initialCodeConfigs.map((config) => ({ ...config }));
  const [configs, setConfigs] = useState<CodeConfig[]>(cloneInitialCodeConfigs);
  const [dirty, setDirty] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<{ entity: string; time: string }>({ entity: "", time: "" });
  const updateConfig = (entity: string, patch: Partial<CodeConfig>) => {
    setConfigs((items) => items.map((item) => item.entity === entity ? { ...item, ...patch } : item));
    setDirty(true);
    setResetFeedback({ entity: "", time: "" });
  };
  const resetConfig = (entity: string) => {
    const source = initialCodeConfigs.find((config) => config.entity === entity);
    if (!source) return;
    setConfigs((items) => items.map((item) => item.entity === entity ? { ...source } : item));
    setDirty(false);
    setResetFeedback({ entity, time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) });
  };
  const resetAll = () => {
    setConfigs(cloneInitialCodeConfigs());
    setDirty(false);
    setResetFeedback({ entity: "ALL", time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) });
  };
  return (
    <div className={styles.settingsOpsLayout}>
      <section className={styles.settingsCard}>
        <PanelHead icon={KeyRound} title="Cấu hình sinh mã tự động" subtitle="" action="Thêm cấu hình mới" onAction={() => onOpen("code", "Thêm mới cấu hình sinh mã")} />
        <div className={styles.settingsCodeGrid}>
          {configs.map((config) => (
            <article key={config.label} className={`${styles.settingsCodeCard} ${resetFeedback.entity === config.entity || resetFeedback.entity === "ALL" ? styles.settingsCodeCardReset : ""}`}>
              <header>
                <div>
                  <strong>{config.label}</strong>
                  <small>{config.entity}</small>
                </div>
                <div className={styles.settingsCodeHeaderActions}>
                  <button onClick={() => resetConfig(config.entity)} type="button"><RefreshCcw size={14} />{resetFeedback.entity === config.entity || resetFeedback.entity === "ALL" ? "Đã reset" : "Reset"}</button>
                  <button onClick={() => onOpen("confirm", `Xóa cấu hình ${config.label}`, `Sau khi xóa, ${config.label.toLowerCase()} không thể tự sinh mã mới cho đến khi có cấu hình thay thế.`)} type="button"><Trash2 size={14} />Xóa</button>
                </div>
              </header>
              <div className={styles.settingsCodeLivePreview}>
                <span>Xem trước</span>
                <strong>{formatGeneratedCode(config)}</strong>
                <small>Mã tiếp theo sẽ là: {formatGeneratedCode(config)}</small>
              </div>
              {resetFeedback.entity === config.entity || resetFeedback.entity === "ALL" ? (
                <div className={styles.settingsCodeResetNotice}>
                  <Check size={15} />
                  <span>Đã khôi phục cấu hình ban đầu lúc {resetFeedback.time}.</span>
                </div>
              ) : null}
              <div className={styles.settingsFormGrid}>
                <TextField label="Tiền tố" onChange={(value) => updateConfig(config.entity, { prefix: value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) })} value={config.prefix} />
                <TextField label="Ký tự phân tách" onChange={(value) => updateConfig(config.entity, { separator: normalizeSeparator(value) })} options={codeSeparatorOptions} value={config.separator || "Không dùng"} />
                <TextField label="Số bắt đầu" onChange={(value) => updateConfig(config.entity, { start: value.replace(/\D/g, "") || "1" })} type="number" value={config.start} />
                <TextField label="Số chữ số" onChange={(value) => updateConfig(config.entity, { digits: Math.min(8, Math.max(2, Number(value) || 4)) })} type="number" value={String(config.digits)} />
              </div>
              <div className={styles.settingsCodeChips}>
                {Array.from({ length: 4 }, (_, index) => <span key={index}>{formatGeneratedCode(config, index)}</span>)}
              </div>
            </article>
          ))}
        </div>
        <div className={styles.settingsCodeFooter}>
          <span>Việc thay đổi cấu hình chỉ ảnh hưởng mã mới được tạo. Mã cũ không bị thay đổi.</span>
          <div>
            <button onClick={resetAll} type="button"><RefreshCcw size={16} />Reset tất cả</button>
            <button disabled={!dirty} onClick={() => onOpen("codeSave", "Lưu cấu hình sinh mã", "Áp dụng tiền tố, ký tự phân tách, bộ đếm và số chữ số cho mã phát sinh mới sau thời điểm lưu.")} type="button"><Save size={16} />{dirty ? "Lưu thay đổi" : "Đã lưu"}</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function PromotionPanel({ onOpen }: { onOpen: (kind: ModalKind, title: string, note?: string) => void }) {
  const activePromotions = promotions.filter((promo) => promo.status === "Đang áp dụng").length;
  const endedPromotions = promotions.filter((promo) => promo.status === "Đã kết thúc").length;
  return (
    <div className={styles.settingsStack}>
      <div className={styles.settingsPromoStats}>
        <article className={styles.settingsPromoPurple}><BadgePercent size={28} /><span>Tổng CTKM</span><strong>{promotions.length}</strong></article>
        <article className={styles.settingsPromoGreen}><Check size={28} /><span>Đang áp dụng</span><strong>{activePromotions}</strong></article>
        <article className={styles.settingsPromoOrange}><CircleDollarSign size={28} /><span>Tổng giảm giá</span><strong>300.000đ</strong></article>
        <article className={styles.settingsPromoBlue}><Gauge size={28} /><span>Đã hết hạn</span><strong>{endedPromotions}</strong></article>
      </div>
      <section className={styles.settingsCard}>
        <PanelHead icon={BadgePercent} title="Danh sách khuyến mãi" subtitle="" action="Tạo khuyến mãi" onAction={() => onOpen("promotion", "Tạo khuyến mãi mới")} />
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
                  <td>
                    <div className={styles.settingsPromoDateStack}>
                      <span><Clock3 size={13} />{promo.start}</span>
                      <span><Clock3 size={13} />{promo.end}</span>
                    </div>
                  </td>
                  <td><span className={promo.active ? styles.settingsStatusGreen : styles.settingsStatusRed}>{promo.status}</span></td>
                  <td>
                    <div className={styles.checkinActionRow}>
                      <button className={styles.checkinIconBtn} onClick={() => onOpen("promotion", `Chỉnh sửa ${promo.code}`)} title="Sửa" type="button"><Pencil size={14} /></button>
                      <button className={`${styles.checkinIconBtn} ${styles.checkinIconBtnDanger}`} onClick={() => onOpen("confirm", `Xóa ${promo.code}`, `${promo.code} đã được áp dụng cho ${promo.appliedContracts} hợp đồng. Nếu còn ràng buộc, hệ thống chỉ cho chuyển sang Đã kết thúc thay vì xóa cứng.`)} title="Xóa" type="button"><Trash2 size={14} /></button>
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

function SettingsModal({
  modal,
  onApplyLogo,
  onClose,
  onDone,
  pendingLogo,
}: {
  modal: ModalState;
  onApplyLogo: () => void;
  onClose: () => void;
  onDone: (message: string) => void;
  pendingLogo: string;
}) {
  const [deviceType, setDeviceType] = useState<SettingsDeviceType>("FACE");
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const [promotionStep, setPromotionStep] = useState<"info" | "condition" | "target">("info");
  const initialTemplate = modal.template ?? templates[0];
  const [templateKind, setTemplateKind] = useState<TemplateKind>(initialTemplate.kind);
  const [templateSize, setTemplateSize] = useState(initialTemplate.size);
  const [templateFont, setTemplateFont] = useState(initialTemplate.font);
  const [templateFontSize, setTemplateFontSize] = useState(initialTemplate.fontSize.replace("px", ""));
  const [templateFooter, setTemplateFooter] = useState("Cảm ơn quý khách đã sử dụng dịch vụ");
  const [memberCardTier, setMemberCardTier] = useState("VIP GOLD");
  const [codeDraft, setCodeDraft] = useState<CodeConfig>({ entity: "MEMBER", label: "Hội viên", prefix: "MEM", separator: "-", start: "1", digits: 4 });
  const [memberCardOptions, setMemberCardOptions] = useState<MemberCardTemplateOptions>({
    logo: true,
    tier: true,
    expiry: true,
    code: true,
    qr: true,
    note: true,
  });
  const [logoZoom, setLogoZoom] = useState(112);
  const [logoOffset, setLogoOffset] = useState({ x: 0, y: 0 });
  const [logoDragStart, setLogoDragStart] = useState<{ pointerX: number; pointerY: number; x: number; y: number } | null>(null);
  const validation = modal.kind === "preview" ? null : getValidationSummary(modal, { deviceType, promotionStep });
  const validationErrors = validation?.errors ?? [];
  const validationPassed = validation?.passed ?? [];
  const clearRuntimeFieldErrors = () => {
    const container = modalBodyRef.current;
    if (!container) return;
    container.querySelectorAll(`.${styles.settingsFieldError}`).forEach((node) => node.classList.remove(styles.settingsFieldError));
    container.querySelectorAll(`.${styles.settingsRuntimeFieldError}`).forEach((node) => node.remove());
  };
  const validateBeforeSave = () => {
    clearRuntimeFieldErrors();
    if (validation?.errors.length) return false;
    const container = modalBodyRef.current;
    if (!container) return true;
    const invalidFields = Array.from(container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input, textarea, select"))
      .map((field) => {
        if (field instanceof HTMLInputElement && ["checkbox", "radio", "file", "hidden", "search", "color"].includes(field.type)) return false;
        if (field.hasAttribute("readonly") || field.hasAttribute("disabled")) return false;
        if (!field.dataset.required && !["email", "url", "tel", "number", "date", "time"].includes(field instanceof HTMLInputElement ? field.type : "")) return false;
        const value = field.value.trim();
        const label = field.closest("label");
        const labelText = label?.querySelector("span")?.textContent?.trim() || field.getAttribute("aria-label") || "Trường bắt buộc";
        if (!value) return { field, label, message: `${labelText} không được để trống.` };
        if (field instanceof HTMLInputElement && field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return { field, label, message: `${labelText} không đúng định dạng email.` };
        if (field instanceof HTMLInputElement && field.type === "url" && !/^https?:\/\/[^\s]+\.[^\s]+/.test(value)) return { field, label, message: `${labelText} phải là URL hợp lệ, ví dụ https://nextgolf.vn.` };
        if (field instanceof HTMLInputElement && field.type === "number" && Number.isNaN(Number(value))) return { field, label, message: `${labelText} phải là số hợp lệ.` };
        if (field instanceof HTMLInputElement && field.type === "tel" && !/^[0-9+\-\s().]{8,16}$/.test(value)) return { field, label, message: `${labelText} không đúng định dạng số điện thoại.` };
        return false;
      })
      .filter(Boolean) as Array<{ field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement; label: Element | null; message: string }>;
    if (invalidFields.length) {
      invalidFields.forEach(({ field, label, message }) => {
        const target = label ?? field.parentElement;
        target?.classList.add(styles.settingsFieldError);
        const error = document.createElement("em");
        error.className = `${styles.settingsFieldErrorText} ${styles.settingsRuntimeFieldError}`;
        error.textContent = message;
        target?.appendChild(error);
      });
      invalidFields[0]?.field.focus();
      return false;
    }
    return true;
  };
  const body = getModalBody(modal, {
    deviceType,
    logoDragStart,
    logoOffset,
    logoZoom,
    codeDraft,
    memberCardTier,
    memberCardOptions,
    onApplyLogo,
    onClose,
    pendingLogo,
    promotionStep,
    setDeviceType,
    setLogoDragStart,
    setLogoOffset,
    setLogoZoom,
    setCodeDraft,
    setMemberCardTier,
    setMemberCardOptions,
    setPromotionStep,
    setTemplateFont,
    setTemplateFontSize,
    setTemplateFooter,
    setTemplateKind,
    setTemplateSize,
    templateFont,
    templateFontSize,
    templateFooter,
    templateKind,
    templateSize,
  });
  return (
    <div className={styles.modalOverlay}>
      <section className={`${styles.settingsModal} ${modal.kind === "preview" ? styles.settingsModalPreview : ""}`}>
        <header>
          <div>
            <span>Cài đặt hệ thống</span>
            <h3>{modal.title}</h3>
          </div>
          <button aria-label="Đóng" onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <div className={styles.settingsModalBody} ref={modalBodyRef}>
          {modal.kind !== "preview" && modal.kind !== "confirm" && modal.note ? <InfoNote>{modal.note}</InfoNote> : null}
          {body}
          {validation ? (
            <div className={validationErrors.length ? styles.settingsValidationBoxError : styles.settingsValidationBoxOk}>
              <strong>{validationErrors.length ? "Cần kiểm tra trước khi lưu" : "Dữ liệu hợp lệ để lưu"}</strong>
              <ul>
                {(validationErrors.length ? validationErrors : validationPassed).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ) : null}
        </div>
        {modal.kind === "preview" ? null : (
          <footer>
            <button onClick={onClose} type="button">Hủy</button>
            <button disabled={Boolean(validation?.errors.length)} onClick={() => {
              if (!validateBeforeSave()) return;
              if (modal.kind === "logoEditor") {
                onApplyLogo();
                return;
              }
              onDone(modal.kind === "confirm" ? "Đã ghi nhận thao tác kiểm soát dữ liệu" : "Đã lưu thông tin cấu hình");
            }} type="button">
              {modal.kind === "confirm" ? "Xác nhận" : modal.kind === "logoEditor" ? "Áp dụng logo" : modal.kind === "promotion" && modal.title?.startsWith("Tạo") ? "Tạo khuyến mãi" : modal.kind === "promotion" && modal.title?.startsWith("Chỉnh") ? "Cập nhật khuyến mãi" : modal.kind === "branch" && modal.title?.startsWith("Thêm") ? "Tạo chi nhánh" : modal.kind === "branch" && modal.title?.startsWith("Sửa") ? "Cập nhật" : modal.kind === "role" && modal.title?.startsWith("Mời") ? "Gửi lời mời" : modal.kind === "role" && modal.title?.startsWith("Sửa") ? "Cập nhật" : "Lưu"}
            </button>
          </footer>
        )}
      </section>
    </div>
  );
}

function getModalBody(
  modal: ModalState,
  ui: {
    deviceType: SettingsDeviceType;
    logoDragStart: { pointerX: number; pointerY: number; x: number; y: number } | null;
    logoOffset: { x: number; y: number };
    logoZoom: number;
    codeDraft: CodeConfig;
    memberCardTier: string;
    memberCardOptions: MemberCardTemplateOptions;
    onApplyLogo: () => void;
    onClose: () => void;
    pendingLogo: string;
    promotionStep: "info" | "condition" | "target";
    setDeviceType: (value: SettingsDeviceType) => void;
    setLogoDragStart: (value: { pointerX: number; pointerY: number; x: number; y: number } | null) => void;
    setLogoOffset: (value: { x: number; y: number }) => void;
    setLogoZoom: (value: number) => void;
    setCodeDraft: (value: CodeConfig) => void;
    setMemberCardTier: (value: string) => void;
    setMemberCardOptions: (value: MemberCardTemplateOptions) => void;
    setPromotionStep: (value: "info" | "condition" | "target") => void;
    setTemplateFont: (value: string) => void;
    setTemplateFontSize: (value: string) => void;
    setTemplateFooter: (value: string) => void;
    setTemplateKind: (value: TemplateKind) => void;
    setTemplateSize: (value: string) => void;
    templateFont: string;
    templateFontSize: string;
    templateFooter: string;
    templateKind: TemplateKind;
    templateSize: string;
  },
) {
  if (modal.kind === "logoEditor") {
    return (
      <div className={styles.settingsLogoEditor}>
        <div className={styles.settingsLogoCropWorkspace}>
          <div
            className={styles.settingsLogoCropFrame}
            onPointerDown={(event) => ui.setLogoDragStart({ pointerX: event.clientX, pointerY: event.clientY, x: ui.logoOffset.x, y: ui.logoOffset.y })}
            onPointerLeave={() => ui.setLogoDragStart(null)}
            onPointerMove={(event) => {
              if (!ui.logoDragStart) return;
              ui.setLogoOffset({
                x: ui.logoDragStart.x + event.clientX - ui.logoDragStart.pointerX,
                y: ui.logoDragStart.y + event.clientY - ui.logoDragStart.pointerY,
              });
            }}
            onPointerUp={() => ui.setLogoDragStart(null)}
          >
            {ui.pendingLogo ? (
              <img
                alt="Logo đang chỉnh"
                src={ui.pendingLogo}
                style={{ transform: `translate(${ui.logoOffset.x}px, ${ui.logoOffset.y}px) scale(${ui.logoZoom / 100})` }}
              />
            ) : <span>Chưa có ảnh</span>}
            <div className={styles.settingsLogoCropMask} />
          </div>
          <div className={styles.settingsLogoCropPreview}>
            <strong>Xem trước</strong>
            <div>{ui.pendingLogo ? <img alt="Preview logo" src={ui.pendingLogo} style={{ transform: `translate(${ui.logoOffset.x * 0.34}px, ${ui.logoOffset.y * 0.34}px) scale(${ui.logoZoom / 100})` }} /> : null}</div>
            <span>Dùng trên hóa đơn, hợp đồng, phiếu thu</span>
          </div>
        </div>
        <div className={styles.settingsLogoSliders}>
          <label><span>Phóng to</span><input max="220" min="70" onChange={(event) => ui.setLogoZoom(Number(event.target.value))} type="range" value={ui.logoZoom} /></label>
          <button onClick={() => { ui.setLogoZoom(112); ui.setLogoOffset({ x: 0, y: 0 }); }} type="button">Căn giữa</button>
        </div>
        <InfoNote>Logo sau khi áp dụng sẽ dùng trên mẫu in, hóa đơn điện tử, hợp đồng và header chứng từ. Cần căn trong khung vuông để không bị méo.</InfoNote>
      </div>
    );
  }
  if (modal.kind === "preview") {
    const previewKind = modal.template?.kind ?? ui.templateKind;
    const isReceipt = previewKind === "receipt";
    const isInvoice = previewKind === "invoice";
    const isBill = previewKind === "bill";
    const isMemberCard = previewKind === "memberCard";
    const isContract = !isReceipt && !isInvoice && !isBill && !isMemberCard;
    const templateName = modal.title?.replace("Xem trước ", "") ?? "Mẫu in";
    const paperSize = modal.template?.size ?? ui.templateSize;
    const footerText = isReceipt || isBill
      ? "Cảm ơn quý khách!"
      : isMemberCard
        ? "Thẻ chỉ có giá trị khi trạng thái hội viên đang hoạt động"
        : "Cảm ơn quý khách đã sử dụng dịch vụ";
    const heading = isBill ? "BILL THANH TOÁN" : isReceipt ? "PHIẾU THU" : isInvoice ? "HÓA ĐƠN" : isMemberCard ? "THẺ HỘI VIÊN" : "HỢP ĐỒNG DỊCH VỤ GOLF";
    const downloadPreview = () => {
      const content = [
        "NEXTVISION GOLF CENTER",
        templateName,
        "Số mẫu: 001/2026",
        "Ngày: 08/05/2026",
        isBill ? "Khách hàng: Nguyễn Văn A - HV0001" : "Người nhận: Khách hàng mẫu",
        isBill ? "Dịch vụ: Line tập + HLV + phụ kiện" : isReceipt ? "Nội dung: Thu tiền hợp đồng/giao dịch golf" : isInvoice ? "Nội dung: Hóa đơn dịch vụ hội viên golf" : isMemberCard ? "Nội dung: Thẻ định danh hội viên golf" : "Nội dung: Hợp đồng dịch vụ hội viên golf VIP",
        "Tổng tiền: 1.430.000đ",
        "VAT: 130.000đ",
        "Cảm ơn quý khách đã sử dụng dịch vụ.",
      ].join("\n");
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${templateName.toLowerCase().replaceAll(" ", "-")}-preview.txt`;
      link.click();
      URL.revokeObjectURL(url);
    };
    return (
      <div className={`${styles.settingsPrintPreviewShell} ${isMemberCard ? styles.settingsMemberCardPreviewShell : ""}`}>
        <div className={styles.settingsPreviewTitle}>
          <strong>Xem trước mẫu in</strong>
          <span>{templateName} - {paperSize}</span>
        </div>
        <div className={styles.settingsPrintPreviewStage}>
          {renderPrintPreviewDocument({ footerText, kind: previewKind, paperSize, templateName })}
          {false ? (
          <article className={isMemberCard ? styles.settingsPrintMemberCard : isReceipt || isBill ? styles.settingsPrintPaperK80 : styles.settingsPrintPaperA4}>
            <header>
              <div className={styles.settingsPrintLogo}><Printer size={34} /></div>
              <strong>PHÒNG TẬP GOLF NEXTVISION</strong>
              <span>12 Nguyễn Huệ, Quận 1, TP.HCM</span>
              <span>Điện thoại: 02838221900</span>
            </header>
            <h4>{heading}</h4>
            <section className={styles.settingsPrintInfoBox}>
              {!isMemberCard ? (
                <>
                  <div><span>Số:</span><strong>001/2026</strong></div>
                  <div><span>Ngày:</span><strong>08/05/2026</strong></div>
                </>
              ) : null}
              {isMemberCard ? (
                <div className={styles.settingsMemberCardPreview}>
                  <div>
                    <span>Hạng thẻ</span>
                    <strong>VIP GOLD</strong>
                  </div>
                  <p>Nguyễn Văn A</p>
                  <dl>
                    <div><dt>Mã HV</dt><dd>HV0001</dd></div>
                    <div><dt>Hiệu lực</dt><dd>08/11/2026</dd></div>
                    <div><dt>Chi nhánh</dt><dd>Bến Nghé</dd></div>
                  </dl>
                  <small>Quét mã tại quầy để check-in, đặt line tập và đối soát quyền lợi hội viên.</small>
                </div>
              ) : isContract ? (
                <div className={styles.settingsContractPreview}>
                  <p><strong>Căn cứ:</strong> Nhu cầu sử dụng dịch vụ tập luyện golf của hội viên và khả năng cung cấp dịch vụ của NextVision Golf Center.</p>
                  <div>
                    <strong>Bên A - Đơn vị cung cấp</strong>
                    <span>NextVision Golf Center - Bến Nghé</span>
                    <span>MST: 0312345678 · Hotline: 02838221900</span>
                    <span>Địa chỉ: 12 Nguyễn Huệ, Quận 1, TP.HCM</span>
                  </div>
                  <div>
                    <strong>Bên B - Hội viên</strong>
                    <span>Nguyễn Văn A · Mã HV: HV0001</span>
                    <span>CCCD: 079199900001 · SĐT: 0901234567</span>
                    <span>Email: nguyenvana@example.com</span>
                  </div>
                  <table>
                    <tbody>
                      <tr><th>Gói dịch vụ</th><td>VIP 6 tháng</td></tr>
                      <tr><th>Thời hạn</th><td>08/05/2026 - 08/11/2026</td></tr>
                      <tr><th>Quyền lợi</th><td>24 buổi HLV cá nhân, đặt line tập theo lịch trống, ưu tiên đặt lịch cuối tuần.</td></tr>
                      <tr><th>Chi nhánh áp dụng</th><td>Bến Nghé; có thể chuyển buổi sang Võ Thị Sáu khi còn sức chứa.</td></tr>
                      <tr><th>Giá trị hợp đồng</th><td>12.000.000đ - ưu đãi SUMMER2026 1.200.000đ + VAT 8% = 11.664.000đ.</td></tr>
                    </tbody>
                  </table>
                  <ol>
                    <li>Bên B thanh toán trước khi kích hoạt gói; hệ thống chỉ mở quyền đặt lịch sau khi phiếu thu được xác nhận.</li>
                    <li>Lịch HLV cần đặt trước tối thiểu 12 giờ; hủy muộn dưới 4 giờ được tính là đã sử dụng buổi.</li>
                    <li>Bảo lưu tối đa 30 ngày/lần khi có xác nhận y tế hoặc lịch công tác; tổng thời gian bảo lưu không quá 60 ngày.</li>
                    <li>Chuyển nhượng gói cần xác minh người nhận và phí xử lý theo bảng giá đang hiệu lực.</li>
                    <li>Hai bên cam kết tuân thủ nội quy sân tập, an toàn thiết bị và quy định check-in tại quầy.</li>
                  </ol>
                </div>
              ) : (
                <p>{isBill ? "Khách hàng: Nguyễn Văn A · HV0001 · Bến Nghé. Giao dịch gồm Line tập 60 phút, 01 buổi HLV cá nhân và nước uống tại quầy." : isReceipt ? "Người nộp: Nguyễn Văn A · HV0001. Lý do thu: Thanh toán hợp đồng VIP 6 tháng, phiếu thu PT-000128, nhân viên thu: Lan Anh." : "Người mua: Nguyễn Văn A · MST: 0318888999. Dịch vụ: Gói hội viên golf VIP 6 tháng, 24 buổi HLV, sử dụng line tập không giới hạn trong khung giờ đăng ký."}</p>
              )}
              {!isBill && !isContract && !isMemberCard ? (
                <table>
                  <tbody>
                    <tr><td>{isReceipt ? "Gói VIP 6 tháng" : isInvoice ? "Dịch vụ hội viên golf VIP" : "Phí hội viên VIP 6 tháng"}</td><td>1</td><td>12.000.000đ</td></tr>
                    <tr><td>{isReceipt ? "Ưu đãi SUMMER2026" : "Khuyến mãi áp dụng"}</td><td></td><td>-1.200.000đ</td></tr>
                    <tr><td>VAT 8%</td><td></td><td>864.000đ</td></tr>
                    <tr><th>Tổng thanh toán</th><th></th><th>11.664.000đ</th></tr>
                  </tbody>
                </table>
              ) : null}
              {!isContract && !isMemberCard ? (
                <div className={styles.settingsPrintMeta}>
                  <span>Mã giao dịch: {isBill ? "BILL-000318" : isReceipt ? "PT-000128" : "HD-000089"}</span>
                  <span>Thu ngân: Lan Anh</span>
                  <span>Chi nhánh: Bến Nghé</span>
                </div>
              ) : null}
              {isBill ? (
                <table>
                  <tbody>
                    <tr><td>Line tập 60 phút</td><td>1</td><td>300.000đ</td></tr>
                    <tr><td>HLV cá nhân</td><td>1</td><td>900.000đ</td></tr>
                    <tr><td>VAT</td><td></td><td>130.000đ</td></tr>
                    <tr><th>Tổng cộng</th><th></th><th>1.430.000đ</th></tr>
                  </tbody>
                </table>
              ) : null}
            </section>
            <footer>
              <em>{isReceipt || isBill ? "Cảm ơn quý khách!" : isMemberCard ? "Thẻ chỉ có giá trị khi trạng thái hội viên đang hoạt động" : "Cảm ơn quý khách đã sử dụng dịch vụ"}</em>
              <span>Ngày 8 tháng 5 năm 2026</span>
              {!isReceipt && !isBill && !isMemberCard ? (
                <div>
                  <strong>{isContract ? "Đại diện bên A" : "Người lập phiếu"}</strong>
                  <strong>{isContract ? "Đại diện bên B" : "Dấu công ty"}</strong>
                  <b>GOLF<br />NEXTVISION</b>
                </div>
              ) : null}
            </footer>
          </article>
          ) : null}
        </div>
        <div className={styles.settingsPreviewFooter}>
          <span>Khổ giấy: {paperSize}</span>
          <div>
            <button onClick={ui.onClose} type="button">Đóng</button>
            <button onClick={downloadPreview} type="button"><Download size={16} />Tải xuống</button>
          </div>
        </div>
      </div>
    );
  }
  if (modal.kind === "confirm") {
    const title = modal.title ?? "";
    const rows = title.includes("cấu hình")
      ? ["Kiểm tra đối tượng đang dùng cấu hình mã trước khi xóa.", "Mã đã sinh trong hợp đồng, phiếu thu và hóa đơn không bị đổi.", "Nếu còn ràng buộc nghiệp vụ, hệ thống chặn xóa và yêu cầu tạo cấu hình thay thế."]
      : title.includes("Agent") || title.includes("Lan Anh") || title.includes("Minh Khang") || title.includes("Hoàng") || title.includes("Bảo")
        ? ["Agent có người dưới quyền phải chuyển quản lý trước.", "Tài khoản đã có lịch sử thao tác sẽ soft-delete để giữ audit log.", "Agent CEO/root bị chặn xóa để hệ thống luôn còn quản trị viên."]
        : title.includes("chi nhánh")
          ? ["Chi nhánh còn hội viên, hợp đồng, lịch tập, thiết bị hoặc phiếu thu sẽ bị chặn xóa cứng.", "Nếu cần ngưng vận hành, chuyển trạng thái Tạm ngưng để giữ dữ liệu đối soát.", "Branch Selector, booking, check-in và báo cáo sẽ dừng hiển thị chi nhánh sau khi trạng thái được cập nhật."]
        : title.includes("thiết bị") || title.includes("Face") || title.includes("CARD") || title.includes("ATT")
          ? ["Thiết bị đã có CheckinLog sẽ soft-delete, không xóa cứng.", "Sau khi xóa, thiết bị không còn nhận check-in hoặc chấm công.", "IP/Port có thể được dùng lại sau khi thao tác hoàn tất."]
          : title.includes("SUMMER") || title.includes("NEWYEAR") || title.includes("MEMBER")
            ? ["Khuyến mãi đã áp dụng vào hợp đồng sẽ không được xóa cứng.", "Có thể chuyển trạng thái hết hiệu lực để ngừng áp dụng.", "Hệ thống kiểm tra số hợp đồng và phiếu thu liên quan trước khi xác nhận."]
            : ["Thao tác được ghi audit log.", "Dữ liệu đã phát sinh nghiệp vụ sẽ được khóa hoặc ngưng sử dụng.", "Không xóa cứng dữ liệu cần đối soát."];
    return (
      <div className={styles.settingsConfirmBox}>
        <strong>{title}</strong>
        <p>{modal.note ?? "Kiểm tra ràng buộc dữ liệu trước khi xác nhận."}</p>
        <ul>{rows.map((row) => <li key={row}><Check size={15} />{row}</li>)}</ul>
      </div>
    );
  }
  if (modal.kind === "permissionExport") {
    return (
      <div className={styles.settingsModalStack}>
        <section className={styles.settingsModalSection}>
          <h4>Phạm vi xuất dữ liệu</h4>
          <div className={styles.settingsFormGrid}>
            <TextField label="Loại dữ liệu" options={["Ma trận quyền theo vai trò", "Danh sách Agent", "Audit thay đổi quyền"]} value={modal.title?.includes("Agent") ? "Danh sách Agent" : "Ma trận quyền theo vai trò"} />
            <TextField label="Định dạng file" options={["Excel .xlsx", "CSV .csv"]} value="Excel .xlsx" />
            <TextField label="Chi nhánh" options={allBranchShortOptions} value="Tất cả chi nhánh" />
            <TextField label="Bao gồm dữ liệu nhạy cảm" options={["Không", "Có, chỉ Admin hệ thống"]} value="Không" />
          </div>
        </section>
        <InfoNote>File xuất dùng để đối soát quyền, không chứa mật khẩu/API key/token. Mỗi lần xuất được ghi audit log.</InfoNote>
      </div>
    );
  }
  if (modal.kind === "permissionImport") {
    return (
      <div className={styles.settingsModalStack}>
        <section className={styles.settingsModalSection}>
          <h4>Import phân quyền hàng loạt</h4>
          <div className={styles.settingsImportDrop}>
            <Upload size={24} />
            <strong>Kéo thả hoặc chọn file Excel</strong>
            <span>Chỉ nhận .xlsx theo mẫu hệ thống. Dung lượng tối đa 5MB.</span>
            <button type="button">Chọn file</button>
          </div>
          <div className={styles.settingsFormGrid}>
            <TextField label="Cách áp dụng" options={["Chỉ validate trước", "Validate và ghi đè quyền", "Chỉ thêm quyền mới"]} value="Chỉ validate trước" />
            <TextField label="Xử lý quyền không hợp lệ" options={["Bỏ qua dòng lỗi", "Dừng toàn bộ file"]} value="Dừng toàn bộ file" />
          </div>
        </section>
        <InfoNote>Import phải kiểm tra module/action có tồn tại, quyền không phù hợp sẽ bị từ chối. Ví dụ Dashboard không được import quyền Tạo/Sửa/Xóa.</InfoNote>
      </div>
    );
  }
  if (modal.kind && ["businessSave", "paymentSave", "vatSave", "vatReset", "codeReset", "codeSave", "invoiceSave"].includes(modal.kind)) {
    const rows: Record<string, string[]> = {
      businessSave: ["MST đúng định dạng 10 hoặc 13 số.", "Email và website hợp lệ.", "Thông tin sẽ cập nhật vào header mẫu in, HĐĐT và hợp đồng mới."],
      paymentSave: ["Có ít nhất một phương thức thanh toán đang bật.", "Tài khoản nhận tiền và nội dung chuyển khoản đã đủ.", "Quy tắc tự sinh phiếu thu và chia phương thức thanh toán sẽ áp dụng cho giao dịch mới."],
      vatSave: ["Thứ tự giảm giá so với VAT đã được chọn.", "Preview tổng tiền khớp cấu hình hiện tại.", "Hợp đồng cũ không bị tính lại sau khi lưu."],
      vatReset: ["Giảm giá trước VAT được đặt làm mặc định.", "Thuế suất mặc định quay về 8%.", "Làm tròn tiền về đồng và cập nhật preview sau khi xác nhận."],
      codeReset: ["Chỉ reset current_counter về số bắt đầu.", "Mã cũ đã sinh không thay đổi.", "Nếu số bắt đầu gây trùng, hệ thống sẽ chặn khi kiểm tra xung đột."],
      codeSave: ["Cấu hình mới chỉ áp dụng cho mã phát sinh sau khi lưu.", "Các entity thiếu cấu hình sinh mã sẽ bị cảnh báo.", "Thay đổi được ghi audit log để truy vết backend."],
      invoiceSave: ["Thông tin API, mã số thuế, mẫu số và ký hiệu hóa đơn đã đủ.", "Kết nối nhà cung cấp đã được test thành công trước khi lưu.", "Mật khẩu, token và API secret được mã hóa; audit log không ghi giá trị gốc.", "Cấu hình mới chỉ áp dụng cho hóa đơn phát sinh sau thời điểm lưu."],
    };
    return (
      <div className={styles.settingsConfirmBox}>
        <strong>{modal.title}</strong>
        <p>{modal.note}</p>
        <ul>{(rows[modal.kind] ?? []).map((row) => <li key={row}><Check size={15} />{row}</li>)}</ul>
      </div>
    );
  }
  if (modal.kind === "transferRole") {
    return (
      <div className={styles.settingsModalStack}>
        <section className={styles.settingsModalSection}>
          <h4>Chuyển vai trò tài khoản</h4>
          <div className={styles.settingsFormGrid}>
            <SearchSelectField label="Vai trò mới" options={roles.map((role) => role.name)} value="Quản lý chi nhánh" />
            <SearchSelectField label="Chi nhánh áp dụng" options={allBranchShortOptions} value={branchShortNames[0]} />
            <TextField label="Ngày hiệu lực" type="date" value="2026-05-08" />
            <TextField label="Thông báo cho nhân sự" options={["Gửi email", "Không gửi", "Gửi email và thông báo trong app"]} value="Gửi email" />
          </div>
        </section>
        <div className={styles.settingsRoleImpact}>
          <article><strong>Quyền được thêm</strong><span>Duyệt lịch HLV, xem báo cáo chi nhánh, xuất danh sách check-in.</span></article>
          <article><strong>Quyền bị thu hồi</strong><span>Xóa cấu hình hệ thống, sửa VAT, xóa mẫu in mặc định.</span></article>
        </div>
        <InfoNote>Chuyển vai trò không xóa lịch sử thao tác cũ. Quyền mới áp dụng từ ngày hiệu lực và ghi audit log.</InfoNote>
      </div>
    );
  }
  if (modal.kind === "agentChildren") {
    return (
      <div className={styles.settingsModalStack}>
        <div className={styles.settingsLogTable}>
          <div><strong>Mã</strong><strong>Họ tên</strong><strong>Vai trò</strong><strong>Trạng thái</strong></div>
          {[
            ["AG004", "Lan Anh", "Lễ tân", "Hoạt động"],
            ["AG007", "Quỳnh Như", "Lễ tân", "Chờ"],
            ["AG018", "Trợ giảng TA", "Trợ giảng", "Hoạt động"],
          ].map((row) => <div key={row[0]}>{row.map((cell) => <span key={cell}>{cell}</span>)}</div>)}
        </div>
        <InfoNote>Nếu muốn xóa Agent có người dưới quyền, phải chuyển toàn bộ người dưới quyền sang quản lý khác trước rồi hệ thống mới cho phép tiếp tục.</InfoNote>
      </div>
    );
  }
  if (modal.kind === "invoiceLog") {
    return (
      <div className={styles.settingsModalStack}>
        <div className={styles.settingsLogTable}>
          <div><strong>Thời gian</strong><strong>Hóa đơn</strong><strong>Trạng thái</strong><strong>Ghi chú</strong></div>
          {[
            ["08/05/2026 09:12", "INV-000123", "Thành công", "Đã gửi email khách hàng"],
            ["08/05/2026 10:04", "INV-000124", "Chờ gửi lại", "API nhà cung cấp timeout"],
            ["08/05/2026 11:22", "INV-000125", "Thành công", "Phát hành từ hợp đồng HD-000088"],
          ].map((row) => <div key={row[1]}>{row.map((cell) => <span key={cell}>{cell}</span>)}</div>)}
        </div>
        <InfoNote>Nhật ký dùng để kế toán đối soát trạng thái phát hành, gửi lại hóa đơn lỗi và truy vết API.</InfoNote>
      </div>
    );
  }
  if (modal.kind === "deviceTest") {
    return (
      <div className={styles.settingsModalStack}>
        <div className={styles.settingsConnectionResult}>
          <Wifi size={24} />
          <strong>Kết nối thành công</strong>
          <span>Ping 32ms · Port mở · Thiết bị trả về model ZKTeco/Hikvision · Đồng bộ log gần nhất 08/05/2026 14:25</span>
        </div>
        <InfoNote>Nếu test thất bại, hệ thống cần hiển thị lỗi IP/port/mật khẩu hoặc thiết bị offline để kỹ thuật xử lý.</InfoNote>
      </div>
    );
  }
  if (modal.kind === "codeConflict") {
    return (
      <div className={styles.settingsModalStack}>
        <div className={styles.settingsLogTable}>
          <div><strong>Đối tượng</strong><strong>Mã tiếp theo</strong><strong>Kết quả</strong><strong>Ghi chú</strong></div>
          {[
            ["Hội viên", "HV0001", "Hợp lệ", "Không trùng mã hiện có"],
            ["Hợp đồng", "HD-000001", "Cảnh báo", "Đã tồn tại trong dữ liệu import cũ"],
            ["Hóa đơn", "INV-000001", "Hợp lệ", "Sẵn sàng sinh mã"],
          ].map((row) => <div key={row[0]}>{row.map((cell) => <span key={cell}>{cell}</span>)}</div>)}
        </div>
        <InfoNote>Cấu hình có cảnh báo phải điều chỉnh số bắt đầu hoặc tiền tố trước khi lưu để tránh trùng dữ liệu backend.</InfoNote>
      </div>
    );
  }
  if (modal.kind === "duplicatePromotion") {
    return (
      <div className={styles.settingsModalStack}>
        <section className={styles.settingsModalSection}>
          <h4>Thiết lập bản sao khuyến mãi</h4>
          <div className={styles.settingsFormGrid}>
            <TextField label="Mã mới" readonly value="KM-COPY-001" />
            <TextField label="Tên chương trình mới" value={`${modal.title?.replace("Nhân bản ", "")} - bản sao`} />
            <TextField label="Ngày bắt đầu" type="date" value="2026-06-01" />
            <TextField label="Ngày kết thúc" type="date" value="2026-08-31" />
            <TextField label="Trạng thái sau khi tạo" options={["Nháp", "Đang áp dụng"]} value="Nháp" />
          </div>
        </section>
        <InfoNote>Nhân bản giữ điều kiện và đối tượng áp dụng, nhưng luôn sinh mã mới và trạng thái Nháp để Admin rà soát trước.</InfoNote>
      </div>
    );
  }
  if (modal.kind === "device") {
    const editing = modal.title?.startsWith("Sửa");
    return (
      <div className={styles.settingsModalStack}>
        {!editing ? (
          <div className={styles.settingsDeviceTypeTabs}>
            <button className={ui.deviceType === "ATTENDANCE" ? styles.settingsModalTabActive : undefined} onClick={() => ui.setDeviceType("ATTENDANCE")} type="button">Chấm công</button>
            <button className={ui.deviceType === "FACE" ? styles.settingsModalTabActive : undefined} onClick={() => ui.setDeviceType("FACE")} type="button">Face ID</button>
            <button className={ui.deviceType === "CARD" ? styles.settingsModalTabActive : undefined} onClick={() => ui.setDeviceType("CARD")} type="button">Quẹt thẻ</button>
          </div>
        ) : null}
        <div className={styles.settingsFormGrid} key={`device-${ui.deviceType}-${editing ? "edit" : "new"}`}>
          <TextField label="Mã máy" readonly value={editing ? "FACE-CN1" : ui.deviceType === "CARD" ? "CARD-CN1" : ui.deviceType === "ATTENDANCE" ? "ATT-HLV" : "FACE-CN1"} />
          <TextField dataRequired label="Tên máy" value={editing ? "Face cổng chính" : ui.deviceType === "CARD" ? "Đầu đọc thẻ cổng chính" : ui.deviceType === "ATTENDANCE" ? "Máy chấm công HLV" : "FaceID sảnh chính"} />
          <TextField dataRequired label="Cổng TCP/IP" type="number" value={ui.deviceType === "CARD" ? "9100" : ui.deviceType === "ATTENDANCE" ? "4371" : "4370"} />
          <TextField dataRequired inputMode="numeric" label="Địa chỉ IP" value={ui.deviceType === "CARD" ? "192.168.1.151" : "192.168.1.150"} />
          <TextField dataRequired label="Mật khẩu" type="password" value="device-pass" />
          <SearchSelectField label="Chi nhánh" options={branchFullNames} value={branchFullNames[0]} />
          <label className={styles.settingsCheckboxRow}><input defaultChecked={editing} type="checkbox" /><span>Máy Check PT</span></label>
        </div>
        <InfoNote>IP + cổng phải duy nhất theo chi nhánh. Có thể test kết nối trước khi lưu; mật khẩu chỉ hiển thị dạng ẩn.</InfoNote>
        <InfoNote>Mã máy tự sinh theo tab Sinh mã và loại thiết bị, không nhập tay để tránh trùng mã khi đồng bộ check-in.</InfoNote>
      </div>
    );
  }
  if (modal.kind === "promotion") {
    const editing = modal.title?.startsWith("Chỉnh sửa");
    return (
      <div className={styles.settingsModalStack}>
        <div className={styles.settingsWizardTabs}>
          <button className={ui.promotionStep === "info" ? styles.settingsModalTabActive : undefined} onClick={() => ui.setPromotionStep("info")} type="button">1. Thông tin</button>
          <button className={ui.promotionStep === "condition" ? styles.settingsModalTabActive : undefined} onClick={() => ui.setPromotionStep("condition")} type="button">2. Điều kiện</button>
          <button className={ui.promotionStep === "target" ? styles.settingsModalTabActive : undefined} onClick={() => ui.setPromotionStep("target")} type="button">3. Đối tượng</button>
        </div>
        {ui.promotionStep === "info" ? (
          <section className={styles.settingsModalSection}>
            <h4>Thông tin chương trình</h4>
            <div className={styles.settingsFormGrid}>
              <TextField label="Mã khuyến mãi" readonly value={editing ? "SUMMER2026" : "KM-202606-001"} />
              <TextField dataRequired label="Tên khuyến mãi" value={editing ? "Khuyến mãi hè 2026" : ""} />
              <TextField dataRequired label="Ngày bắt đầu" type="date" value="2026-06-01" />
              <TextField dataRequired label="Ngày kết thúc" type="date" value="2026-08-31" />
              <TextField label="Loại khuyến mãi" options={["Tặng buổi HLV", "Giảm giá %", "Giảm giá tiền"]} value="Tặng buổi HLV" />
              <TextField dataRequired label="Giá trị khuyến mãi" type="number" value="5" />
              <TextField area dataRequired label="Mô tả chi tiết" value="Tặng thêm 5 buổi tập với HLV khi hội viên đăng ký gói VIP trong thời gian chương trình còn hiệu lực." />
            </div>
          </section>
        ) : null}
        {ui.promotionStep === "condition" ? (
          <section className={styles.settingsModalSection}>
            <h4>Điều kiện áp dụng</h4>
            <div className={styles.settingsFormGrid}>
              <TextField dataRequired label="Giá trị đơn hàng tối thiểu" type="number" value="1000000" />
              <TextField dataRequired label="Số lượng mã tối đa" type="number" value="300" />
              <TextField dataRequired label="Giới hạn / khách hàng" type="number" value="1" />
              <div className={styles.settingsFullField}>
                <span>Áp dụng cho gói tập</span>
                <div className={styles.settingsCheckGrid}>
                  {promotionPackageOptions.map((item, index) => <label key={item}><input defaultChecked={index >= 2} type="checkbox" /> {item}</label>)}
                </div>
              </div>
              <div className={styles.settingsFullField}>
                <span>Áp dụng tại chi nhánh</span>
                <div className={styles.settingsCheckGrid}>
                  {branchShortNames.map((item) => <label key={item}><input defaultChecked type="checkbox" /> {item}</label>)}
                </div>
              </div>
            </div>
          </section>
        ) : null}
        {ui.promotionStep === "target" ? (
          <section className={styles.settingsModalSection}>
            <h4>Đối tượng hội viên</h4>
            <div className={styles.settingsFormGrid}>
              <TextField label="Đối tượng hội viên" options={["Tất cả hội viên", "Hội viên mới", "Tái ký", "Đã nghỉ quay lại"]} value="Tất cả hội viên" />
              <div className={styles.settingsFullField}>
                <span>Hạng thẻ hội viên</span>
                <div className={styles.settingsCheckGrid}>
                  {promotionTierOptions.map((item) => <label key={item}><input defaultChecked={item === "Gold" || item === "Platinum"} type="checkbox" /> {item}</label>)}
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    );
  }
  if (modal.kind === "code") {
    const selectEntity = (value: string) => {
      const entity = value.split(" - ")[0];
      const source = initialCodeConfigs.find((config) => config.entity === entity);
      if (source) ui.setCodeDraft({ ...source, prefix: source.entity === "MEMBER" ? "MEM" : source.prefix });
    };
    const updateDraft = (patch: Partial<CodeConfig>) => ui.setCodeDraft({ ...ui.codeDraft, ...patch });
    const codePreview = formatGeneratedCode(ui.codeDraft);
    return (
      <div className={styles.settingsModalStack}>
        <div className={styles.settingsFormGrid}>
          <TextField label="Chọn đối tượng" onChange={selectEntity} options={codeEntityOptions} value={`${ui.codeDraft.entity} - ${ui.codeDraft.label}`} />
          <TextField label="Tiền tố" onChange={(value) => updateDraft({ prefix: value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) })} value={ui.codeDraft.prefix} />
          <TextField label="Ký tự phân tách" onChange={(value) => updateDraft({ separator: normalizeSeparator(value) })} options={codeSeparatorOptions} value={ui.codeDraft.separator || "Không dùng"} />
          <TextField label="Số bắt đầu" onChange={(value) => updateDraft({ start: value.replace(/\D/g, "") || "1" })} type="number" value={ui.codeDraft.start} />
          <TextField label="Số chữ số" onChange={(value) => updateDraft({ digits: Math.min(8, Math.max(2, Number(value) || 4)) })} type="number" value={String(ui.codeDraft.digits)} />
        </div>
        <div className={styles.settingsCodePreview}><span>Xem trước định dạng</span><strong>{codePreview}</strong><p>Mã đầu tiên sẽ được sinh khi tạo mới {ui.codeDraft.label.toLowerCase()} sau khi lưu cấu hình.</p></div>
      </div>
    );
  }
  if (modal.kind === "template") {
    const selectedKind = templateKindOptions.find((item) => item.kind === ui.templateKind) ?? templateKindOptions[0];
    const templateTypeOptions = templateKindOptions.map((item) => item.label);
    const isContractTemplate = ui.templateKind === "contract";
    const isInvoiceTemplate = ui.templateKind === "invoice";
    const isReceiptTemplate = ui.templateKind === "receipt";
    const isBillTemplate = ui.templateKind === "bill";
    const isMemberCardTemplate = ui.templateKind === "memberCard";
    const setMemberOption = (key: keyof MemberCardTemplateOptions) => {
      ui.setMemberCardOptions({ ...ui.memberCardOptions, [key]: !ui.memberCardOptions[key] });
    };
    const changeKind = (label: string) => {
      const next = templateKindOptions.find((item) => item.label === label) ?? templateKindOptions[0];
      ui.setTemplateKind(next.kind);
      ui.setTemplateSize(next.sizes[0]);
      if (next.kind === "memberCard") {
        ui.setTemplateFont("Inter");
        ui.setTemplateFontSize("10");
        ui.setTemplateFooter("Quét mã tại quầy để check-in và đối soát quyền lợi hội viên.");
      } else if (next.kind === "receipt" || next.kind === "bill") {
        ui.setTemplateFont("Arial");
        ui.setTemplateFontSize("11");
        ui.setTemplateFooter("Cảm ơn quý khách!");
      } else {
        ui.setTemplateFont("Arial");
        ui.setTemplateFontSize(next.kind === "invoice" ? "12" : "13");
        ui.setTemplateFooter("Cảm ơn quý khách đã sử dụng dịch vụ");
      }
    };
    return (
      <div className={styles.settingsModalStack}>
        <div className={styles.settingsTemplateForm}>
          <section>
            <h4>1. Thông tin cơ bản</h4>
            <div className={styles.settingsFormGrid}>
              <TextField label="Tên mẫu in" value={modal.template?.name ?? "Mẫu in mới"} />
              <TextField label="Loại mẫu" onChange={changeKind} options={templateTypeOptions} value={selectedKind.label} />
              <TextField label="Khổ giấy" onChange={ui.setTemplateSize} options={selectedKind.sizes} value={ui.templateSize} />
            </div>
          </section>
          <section>
            <h4>2. Phần đầu trang</h4>
            <div className={styles.settingsCheckGrid}>
              {isMemberCardTemplate ? <label><input checked={ui.memberCardOptions.logo} onChange={() => setMemberOption("logo")} type="checkbox" /> Hiển thị logo</label> : <label><input defaultChecked type="checkbox" /> Hiển thị logo</label>}
              {!isMemberCardTemplate ? <label><input defaultChecked type="checkbox" /> Hiển thị tên công ty</label> : null}
              {!isMemberCardTemplate ? <label><input defaultChecked type="checkbox" /> Hiển thị địa chỉ</label> : null}
              {!isMemberCardTemplate ? <label><input defaultChecked type="checkbox" /> Hiển thị số điện thoại</label> : null}
              {isMemberCardTemplate ? <label><input checked={ui.memberCardOptions.tier} onChange={() => setMemberOption("tier")} type="checkbox" /> Hiển thị hạng thẻ</label> : null}
              {isMemberCardTemplate ? <label><input checked={ui.memberCardOptions.expiry} onChange={() => setMemberOption("expiry")} type="checkbox" /> Hiển thị ngày hiệu lực</label> : null}
            </div>
          </section>
          <section>
            <h4>3. Nội dung</h4>
            <div className={styles.settingsFormGrid}>
              <TextField label="Font chữ" onChange={ui.setTemplateFont} options={["Arial", "Inter", "Roboto", "Times New Roman"]} value={ui.templateFont} />
              <TextField label="Kích thước chữ" onChange={ui.setTemplateFontSize} type="number" value={ui.templateFontSize} />
              {isMemberCardTemplate ? <TextField label="Loại hội viên áp dụng" onChange={ui.setMemberCardTier} options={["VIP GOLD", "SILVER", "ACADEMY", "CORPORATE", "JUNIOR"]} value={ui.memberCardTier} /> : null}
              <TextField label="Màu chữ" type="color" value="#111827" />
              {!isMemberCardTemplate ? <TextField label="Khoảng cách dòng" type="number" value={isReceiptTemplate || isBillTemplate ? "1" : isInvoiceTemplate ? "1.2" : "1.5"} /> : null}
            </div>
            <div className={styles.settingsCheckGrid}>
              {isContractTemplate ? <label><input defaultChecked type="checkbox" /> Hiển thị điều khoản hợp đồng</label> : null}
              {isContractTemplate ? <label><input defaultChecked type="checkbox" /> Hiển thị bảng quyền lợi hội viên</label> : null}
              {isInvoiceTemplate ? <label><input defaultChecked type="checkbox" /> Hiển thị MST người mua</label> : null}
              {isInvoiceTemplate ? <label><input defaultChecked type="checkbox" /> Hiển thị VAT và mã tra cứu</label> : null}
              {isReceiptTemplate ? <label><input defaultChecked type="checkbox" /> Hiển thị người nộp tiền</label> : null}
              {isReceiptTemplate ? <label><input defaultChecked type="checkbox" /> Hiển thị phương thức thanh toán</label> : null}
              {isBillTemplate ? <label><input defaultChecked type="checkbox" /> Hiển thị QR giao dịch</label> : null}
              {isBillTemplate ? <label><input defaultChecked type="checkbox" /> Hiển thị thu ngân/line tập</label> : null}
              {isMemberCardTemplate ? <label><input checked={ui.memberCardOptions.code} onChange={() => setMemberOption("code")} type="checkbox" /> Hiển thị mã hội viên</label> : null}
              {isMemberCardTemplate ? <label><input checked={ui.memberCardOptions.qr} onChange={() => setMemberOption("qr")} type="checkbox" /> Tích hợp RFID/NFC check-in trong thẻ</label> : null}
            </div>
          </section>
          <section>
            <h4>4. Phần cuối trang</h4>
            <div className={styles.settingsCheckGrid}>
              {!isMemberCardTemplate ? <label><input defaultChecked type="checkbox" /> Hiển thị chữ ký</label> : null}
              {isContractTemplate || isInvoiceTemplate ? <label><input defaultChecked type="checkbox" /> Hiển thị dấu</label> : null}
              {!isMemberCardTemplate ? <label><input defaultChecked type="checkbox" /> Hiển thị ngày tháng</label> : null}
              {isMemberCardTemplate ? <label><input checked={ui.memberCardOptions.note} onChange={() => setMemberOption("note")} type="checkbox" /> Hiển thị ghi chú điều kiện sử dụng thẻ</label> : null}
            </div>
            <TextField area label={isMemberCardTemplate ? "Ghi chú mặt thẻ" : "Văn bản tùy chỉnh cuối trang"} onChange={ui.setTemplateFooter} value={ui.templateFooter} />
          </section>
        </div>
        <section className={styles.settingsTemplateLivePreview}>
          <div>
            <strong>Xem trước nhanh theo cấu hình</strong>
            <span>{selectedKind.label} · {ui.templateSize} · {ui.templateFont} {ui.templateFontSize}px</span>
          </div>
          <div className={styles.settingsTemplatePreviewMini}>
            {renderPrintPreviewDocument({
              footerText: ui.templateFooter,
              kind: ui.templateKind,
              memberCardTier: ui.memberCardTier,
              paperSize: ui.templateSize,
              templateName: modal.template?.name ?? "Mẫu in mới",
              variant: "quick",
              memberCardOptions: ui.memberCardOptions,
            })}
          </div>
        </section>
      </div>
    );
  }
  if (modal.kind === "role") {
    const title = modal.title ?? "";
    const isAgent = title.includes("Agent") || title.includes(" - ");
    if (!isAgent) {
      return (
        <div className={styles.settingsModalStack}>
          <section className={styles.settingsModalSection}>
            <h4>Thông tin vai trò</h4>
            <div className={styles.settingsFormGrid}>
              <TextField label="Tên vai trò *" value="Quản lý học viện" />
              <TextField label="Mã vai trò" readonly value="ROLE-ACADEMY-001" />
              <TextField area label="Mô tả vai trò" value="Quản lý lịch lớp, HLV, hội viên và báo cáo vận hành học viện golf." />
            </div>
          </section>
          <section className={styles.settingsModalSection}>
            <h4>Ma trận phân quyền</h4>
            <div className={styles.settingsPermissionMatrix}>
              {permissionModules.flatMap((section) => section.items).map((module, index) => (
                <div key={module.name}>
                  <strong>{module.name}</strong>
                  {permissionActions.map((permission) => (
                    <label className={!module.actions.includes(permission) ? styles.settingsPermissionDisabled : undefined} key={permission}>
                      {module.actions.includes(permission) ? <><input defaultChecked={permission === "Xem" || index < 18} type="checkbox" />{permission}</> : <><span>—</span>{permission}</>}
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </section>
          <InfoNote>Quyền Tạo/Sửa/Xóa bao hàm quyền Xem. Vai trò hệ thống không cho xóa/sửa quyền lõi.</InfoNote>
          <InfoNote>Mã vai trò tự sinh từ cấu hình Sinh mã để đồng bộ RBAC với backend và audit log.</InfoNote>
        </div>
      );
    }
    const editing = title.startsWith("Sửa");
    const agentNameFromTitle = settingsAgentDirectory.find((agent) => title.includes(agent.name));
    const agentForm = agentNameFromTitle ?? settingsAgentDirectory[2];
    const managerValue = agentForm.manager === "Không có" ? "Không có (Root / CEO)" : `${agentForm.manager} - ${agentForm.role === "HLV" ? "HLV trưởng" : agentForm.role === "Sales" ? "Sales Lead" : "Quản lý CN"}`;
    return (
      <div className={styles.settingsModalStack}>
        <div className={styles.settingsAgentInviteHero}>
          <UsersRound size={22} />
          <div>
            <strong>{editing ? "Chỉnh sửa Agent" : "Mời Agent qua SSO"}</strong>
            <span>{editing ? "Email không đổi để giữ liên kết SSO và audit log." : "Agent nhận lời mời qua email, sau đó đăng nhập bằng Gmail/Facebook/Email."}</span>
          </div>
        </div>
        <div className={styles.settingsFormGrid}>
          <TextField label="Email đăng nhập *" readonly={editing} type="email" value={editing ? agentForm.email : "agent@example.com"} />
          <TextField label="Mã Agent" readonly value={editing ? agentForm.code : "AG007"} />
          <TextField label="Họ và tên *" value={editing ? agentForm.name : "Nguyễn Văn A"} />
          <TextField label="Số điện thoại" type="tel" value="0901234567" />
          <SearchSelectField label="Phòng ban" options={["Ban Giám đốc", "Vận hành", "Kinh doanh", "Lễ tân", "Học viện", "Kế toán"]} value={editing ? agentForm.department : "Kinh doanh"} />
          <SearchSelectField label="Người quản lý trực tiếp" options={["Không có (Root / CEO)", "Hoàng Long - Quản lý CN", "Minh Khang - Sales Lead", "Bảo Châu - HLV trưởng"]} value={editing ? managerValue : "Hoàng Long - Quản lý CN"} />
          <SearchSelectField label="Vai trò" options={roles.map((role) => role.name)} value={editing ? agentForm.role : "Lễ tân"} />
          <SearchSelectField label="Chi nhánh truy cập" options={[...branchShortNames, "Tất cả chi nhánh"]} value={branchShortNames[0]} />
          <TextField label="Trạng thái" options={["Hoạt động", "Tạm ngưng", "Chờ"]} value={editing ? agentForm.status : "Chờ"} />
        </div>
        <InfoNote>Agent không tự chọn quyền. Quyền truy cập lấy từ vai trò và chi nhánh được Admin phân công.</InfoNote>
      </div>
    );
  }
  if (modal.kind === "branch") {
    const editing = modal.title?.startsWith("Sửa");
    const branchForm = branches.find((branch) => modal.title?.includes(branch.code)) ?? branches[0];
    const nextBranch = {
      code: "CN-Q7",
      name: "Chi nhánh Quận 7",
      address: "68 Nguyễn Thị Thập, Phường Tân Phong, TP.HCM",
      phone: "028 3777 8800",
      email: "quan7@gymmaster.vn",
      manager: "Hoàng Long",
      hours: "06:00 - 22:00",
      status: "Đang hoạt động",
    };
    const branchData = editing ? branchForm : nextBranch;
    const [openTime, closeTime] = branchData.hours.split(" - ");
    return (
      <div className={`${styles.settingsFormGrid} ${styles.settingsBranchModalForm}`}>
        <TextField dataRequired label="Tên chi nhánh *" value={branchData.name} />
        <TextField label="Mã chi nhánh" readonly value={branchData.code} />
        <TextField area dataRequired label="Địa chỉ *" value={branchData.address} />
        <TextField dataRequired label="Số điện thoại *" type="tel" value={branchData.phone} />
        <TextField dataRequired label="Email *" type="email" value={branchData.email} />
        <div className={styles.settingsFullField}>
          <SearchSelectField label="Quản lý chi nhánh" options={["Nguyễn Văn A - Quản lý Bến Nghé", "Trần Thị B - Quản lý Võ Thị Sáu", "Lê Văn C - Quản lý Thảo Điền", "Phạm Thị D - Quản lý Tân Phú", "Hoàng Long - Quản lý vận hành", "Linh Đan - Quản lý học viên"]} value={`${branchData.manager} - Quản lý chi nhánh`} />
        </div>
        <div className={styles.settingsBranchTimeRow}>
          <TextField dataRequired label="Giờ mở cửa" type="time" value={openTime} />
          <TextField dataRequired label="Giờ đóng cửa" type="time" value={closeTime} />
        </div>
        <TextField label="Trạng thái" options={["Đang hoạt động", "Tạm ngưng", "Bảo trì nhẹ"]} value={branchData.status} />
      </div>
    );
  }
  return (
    <div className={styles.settingsFormGrid}>
      <TextField label="Tên" value="" />
      <TextField label="Mã" readonly value="AUTO" />
      <TextField label="Trạng thái" options={["Đang hoạt động", "Tạm ngưng"]} value="Đang hoạt động" />
      <TextField area label="Ghi chú" value="" />
    </div>
  );
}

function renderPrintPreviewDocument({
  footerText,
  kind,
  memberCardOptions = { logo: true, tier: true, expiry: true, code: true, qr: true, note: true },
  memberCardTier = "VIP GOLD",
  paperSize,
  templateName,
  variant = "full",
}: {
  footerText: string;
  kind: TemplateKind;
  memberCardOptions?: MemberCardTemplateOptions;
  memberCardTier?: string;
  paperSize: string;
  templateName: string;
  variant?: "full" | "quick";
}) {
  const isReceipt = kind === "receipt";
  const isInvoice = kind === "invoice";
  const isBill = kind === "bill";
  const isMemberCard = kind === "memberCard";
  const isContract = kind === "contract";
  const heading = isBill ? "BILL THANH TOÁN" : isReceipt ? "PHIẾU THU" : isInvoice ? "HÓA ĐƠN" : isMemberCard ? "THẺ HỘI VIÊN" : "HỢP ĐỒNG DỊCH VỤ GOLF";
  const memberTierSamples = [
    { tier: "VIP GOLD", name: "Nguyễn Văn A", code: "HV0001", expires: "08/11/2026", branch: "Bến Nghé", className: styles.settingsMemberTierGold },
    { tier: "SILVER", name: "Trần Thị B", code: "HV0128", expires: "31/12/2026", branch: "Võ Thị Sáu", className: styles.settingsMemberTierSilver },
    { tier: "ACADEMY", name: "Lê Minh Khang", code: "HV0204", expires: "15/09/2026", branch: "Thảo Điền", className: styles.settingsMemberTierAcademy },
    { tier: "CORPORATE", name: "NextVision Team", code: "HV0312", expires: "31/12/2026", branch: "Tất cả CN", className: styles.settingsMemberTierCorporate },
    { tier: "JUNIOR", name: "Phạm Gia Bảo", code: "HV0405", expires: "01/06/2027", branch: "Academy", className: styles.settingsMemberTierJunior },
  ];

  if (isMemberCard) {
    const configuredSample = memberTierSamples.find((sample) => sample.tier === memberCardTier) ?? memberTierSamples[0];
    const samples = variant === "quick" ? [configuredSample] : memberTierSamples.slice(0, 3);
    return (
      <article className={styles.settingsPrintMemberCardDeck} data-template-name={templateName} data-template-size={paperSize}>
        <div className={styles.settingsMemberCardSet}>
          {samples.map((sample) => (
            <div className={`${styles.settingsMemberCardPreview} ${sample.className}`} key={sample.tier}>
              <div className={styles.settingsMemberCardTop}>
                {memberCardOptions.logo ? <span className={styles.settingsMemberBrand}><i>NV</i><small>NextVision Golf</small></span> : null}
                {memberCardOptions.tier ? <span className={styles.settingsMemberTierLabel}><em>Hạng hội viên</em><strong>{sample.tier}</strong></span> : null}
              </div>
              <p>{sample.name}</p>
              <dl>
                {memberCardOptions.code ? <div><dt>Mã HV</dt><dd>{sample.code}</dd></div> : null}
                {memberCardOptions.expiry ? <div><dt>Hiệu lực</dt><dd>{sample.expires}</dd></div> : null}
                <div><dt>Chi nhánh</dt><dd>{sample.branch}</dd></div>
              </dl>
              <div className={styles.settingsMemberCardBottom}>
                {memberCardOptions.note ? <small>{footerText}</small> : <span />}
              </div>
            </div>
          ))}
        </div>
      </article>
    );
  }

  return (
    <article className={isReceipt || isBill ? styles.settingsPrintPaperK80 : styles.settingsPrintPaperA4} data-template-name={templateName} data-template-size={paperSize}>
      <header>
        <div className={styles.settingsPrintLogo}><b>NV</b><small>GOLF</small></div>
        <strong>PHÒNG TẬP GOLF NEXTVISION</strong>
        <span>12 Nguyễn Huệ, Quận 1, TP.HCM</span>
        <span>Điện thoại: 02838221900</span>
      </header>
      <h4>{heading}</h4>
      <section className={styles.settingsPrintInfoBox}>
        {!isMemberCard ? (
          <>
            <div><span>Số:</span><strong>001/2026</strong></div>
            <div><span>Ngày:</span><strong>08/05/2026</strong></div>
          </>
        ) : null}
        {isContract ? (
          <div className={styles.settingsContractPreview}>
            <p><strong>Căn cứ:</strong> Nhu cầu sử dụng dịch vụ tập luyện golf của hội viên và khả năng cung cấp dịch vụ của NextVision Golf Center.</p>
            <div><strong>Bên A - Đơn vị cung cấp</strong><span>NextVision Golf Center - Bến Nghé</span><span>MST: 0312345678 · Hotline: 02838221900</span><span>Địa chỉ: 12 Nguyễn Huệ, Quận 1, TP.HCM</span></div>
            <div><strong>Bên B - Hội viên</strong><span>Nguyễn Văn A · Mã HV: HV0001</span><span>CCCD: 079199900001 · SĐT: 0901234567</span><span>Email: nguyenvana@example.com</span></div>
            <table><tbody><tr><th>Gói dịch vụ</th><td>VIP 6 tháng</td></tr><tr><th>Thời hạn</th><td>08/05/2026 - 08/11/2026</td></tr><tr><th>Quyền lợi</th><td>24 buổi HLV cá nhân, đặt line tập theo lịch trống, ưu tiên đặt lịch cuối tuần.</td></tr></tbody></table>
            <ol><li>Bên B thanh toán trước khi kích hoạt gói.</li><li>Lịch HLV cần đặt trước tối thiểu 12 giờ.</li><li>Bảo lưu/chuyển nhượng theo chính sách đang hiệu lực.</li></ol>
          </div>
        ) : (
          <p>{isBill ? "Khách hàng: Nguyễn Văn A · HV0001 · Bến Nghé. Giao dịch gồm line tập 60 phút, 01 buổi HLV cá nhân và nước uống tại quầy." : isReceipt ? "Người nộp: Nguyễn Văn A · HV0001. Lý do thu: Thanh toán hợp đồng VIP 6 tháng, phiếu thu PT-000128, nhân viên thu: Lan Anh." : "Người mua: Nguyễn Văn A · MST: 0318888999. Dịch vụ: Gói hội viên golf VIP 6 tháng, 24 buổi HLV, sử dụng line tập theo lịch đăng ký."}</p>
        )}
        {!isBill && !isContract && !isMemberCard ? (
          <table><tbody><tr><td>{isReceipt ? "Gói VIP 6 tháng" : "Dịch vụ hội viên golf VIP"}</td><td>1</td><td>12.000.000đ</td></tr><tr><td>Ưu đãi SUMMER2026</td><td></td><td>-1.200.000đ</td></tr><tr><td>VAT 8%</td><td></td><td>864.000đ</td></tr><tr><th>Tổng thanh toán</th><th></th><th>11.664.000đ</th></tr></tbody></table>
        ) : null}
        {isBill ? (
          <table><tbody><tr><td>Line tập 60 phút</td><td>1</td><td>300.000đ</td></tr><tr><td>HLV cá nhân</td><td>1</td><td>900.000đ</td></tr><tr><td>VAT</td><td></td><td>130.000đ</td></tr><tr><th>Tổng cộng</th><th></th><th>1.430.000đ</th></tr></tbody></table>
        ) : null}
      </section>
      <footer>
        <em>{footerText}</em>
        <span>Ngày 8 tháng 5 năm 2026</span>
        {!isReceipt && !isBill && !isMemberCard ? <div><strong>{isContract ? "Đại diện bên A" : "Người lập phiếu"}</strong><strong>{isContract ? "Đại diện bên B" : "Dấu công ty"}</strong><b>GOLF<br />NEXTVISION</b></div> : null}
      </footer>
    </article>
  );
}

function getValidationSummary(
  modal: ModalState,
  ui: { deviceType: SettingsDeviceType; promotionStep: "info" | "condition" | "target" },
): { errors: string[]; passed: string[] } | null {
  if (!modal.kind || modal.kind === "preview" || modal.kind === "confirm") return null;

  if (modal.kind === "device") {
    return {
      errors: [],
      passed: [
        `Loại thiết bị ${ui.deviceType} có mã, tên máy, IP và cổng TCP/IP.`,
        "IP đúng định dạng IPv4 và không trùng trong cùng chi nhánh.",
        "Cổng nằm trong khoảng 1-65535, mật khẩu lưu dạng mã hóa.",
      ],
    };
  }
  if (modal.kind === "promotion") {
    return {
      errors: [],
      passed: [
        "Ngày bắt đầu nhỏ hơn hoặc bằng ngày kết thúc.",
        "Giá trị khuyến mãi và giới hạn sử dụng là số hợp lệ.",
        "Đối tượng áp dụng có gói tập, chi nhánh và nhóm hội viên rõ ràng.",
      ],
    };
  }
  if (modal.kind === "role") {
    return {
      errors: [],
      passed: [
        "Vai trò chỉ có quyền phù hợp với từng loại module.",
        "Dashboard/Báo cáo không được cấp Tạo/Sửa/Xóa.",
        "Agent có email hợp lệ, vai trò, chi nhánh và người quản lý.",
      ],
    };
  }
  if (modal.kind === "branch") {
    return {
      errors: [],
      passed: [
        "Mã chi nhánh tự sinh theo cấu hình Sinh mã và không nhập tay.",
        "Email, số điện thoại, giờ mở/đóng cửa đúng định dạng.",
        "Chi nhánh liên kết với Branch Selector, booking, check-in, hợp đồng và báo cáo.",
      ],
    };
  }
  if (modal.kind === "permissionImport") {
    return {
      errors: [],
      passed: [
        "File import phải là .xlsx dưới 5MB.",
        "Module/action không hợp lệ sẽ bị chặn trước khi ghi dữ liệu.",
        "Import ghi audit log và có chế độ chỉ validate trước.",
      ],
    };
  }
  if (modal.kind === "permissionExport") {
    return {
      errors: [],
      passed: ["File xuất không chứa mật khẩu/API key/token.", "Phạm vi xuất dữ liệu và chi nhánh đã được chọn."],
    };
  }
  return {
    errors: [],
    passed: ["Trường bắt buộc đã có dữ liệu.", "Định dạng dữ liệu phù hợp loại trường.", "Thao tác lưu sẽ ghi audit log."],
  };
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
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {action ? <button onClick={onAction} type="button"><Plus size={16} />{action}</button> : null}
    </div>
  );
}

function TextField({
  area,
  dataRequired,
  error,
  label,
  inputMode,
  onChange,
  options,
  readonly,
  type = "text",
  value,
}: {
  area?: boolean;
  dataRequired?: boolean;
  error?: string;
  inputMode?: "numeric" | "decimal" | "tel" | "email" | "url";
  label: string;
  onChange?: (value: string) => void;
  options?: string[];
  readonly?: boolean;
  type?: "text" | "number" | "password" | "date" | "email" | "url" | "time" | "tel" | "color";
  value: string;
}) {
  const fieldProps = onChange ? { onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(event.target.value), value } : { defaultValue: value };
  return (
    <label className={`${area ? styles.settingsFullField : ""} ${error ? styles.settingsFieldError : ""}`}>
      <span>{label}</span>
      {area ? <textarea {...fieldProps} data-required={dataRequired} readOnly={readonly} /> : options ? (
        <select {...fieldProps} data-required={dataRequired}>
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
      ) : <input {...fieldProps} data-required={dataRequired} inputMode={inputMode} readOnly={readonly} type={type} />}
      {error ? <em className={styles.settingsFieldErrorText}>{error}</em> : null}
    </label>
  );
}

function SearchSelectField({ error, label, onChange, options, value }: { error?: string; label: string; onChange?: (value: string) => void; options: string[]; value: string }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(value);
  const filtered = options.filter((option) => option.toLowerCase().includes(query.trim().toLowerCase()));
  const selectedMeta = selected.includes(" - ") ? selected.split(" - ").slice(1).join(" - ") : "";
  return (
    <label className={`${styles.settingsSearchSelect} ${error ? styles.settingsFieldError : ""}`}>
      <span>{label}</span>
      <div className={styles.settingsSearchSelectedValue}>
        <Check size={14} />
        <strong>{selected}</strong>
        {selectedMeta ? <em>{selectedMeta}</em> : null}
      </div>
      <input onChange={(event) => setQuery(event.target.value)} placeholder={`Tìm để đổi ${label.toLowerCase()}...`} type="search" value={query} />
      <div>
        {filtered.map((option) => (
          <button className={selected === option ? styles.settingsSearchSelectActive : undefined} key={option} onClick={() => { setSelected(option); setQuery(""); onChange?.(option); }} type="button">
            <Check size={14} />
            {option}
          </button>
        ))}
        {filtered.length === 0 ? <em>Không tìm thấy dữ liệu phù hợp</em> : null}
      </div>
      {error ? <em className={styles.settingsFieldErrorText}>{error}</em> : null}
    </label>
  );
}

function QrUploadField() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [qrName, setQrName] = useState("QR Vietcombank NextVision");
  const [qrPreview, setQrPreview] = useState("");
  const [qrError, setQrError] = useState("");
  return (
    <label className={styles.settingsQrField}>
      <span>Mã QR nhận tiền</span>
      <div>
        <div className={styles.settingsQrPreview}>
          {qrPreview ? <span style={{ backgroundImage: `url(${qrPreview})` }} /> : <QrSample />}
        </div>
        <section>
          <strong>{qrName}</strong>
          <small>QR dùng trên màn thanh toán, phiếu thu và bill K80. Chỉ nhận ảnh PNG/JPG dưới 2MB.</small>
          <button onClick={() => fileRef.current?.click()} type="button"><Upload size={15} />Thay QR</button>
          {qrPreview ? <button onClick={() => { setQrPreview(""); setQrName("QR Vietcombank NextVision"); setQrError(""); }} type="button"><Trash2 size={15} />Xóa</button> : null}
          {qrError ? <em>{qrError}</em> : null}
        </section>
        <input
          accept="image/png,image/jpeg"
          className={styles.settingsHiddenFile}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              if (!["image/png", "image/jpeg"].includes(file.type)) {
                setQrError("File QR phải là PNG hoặc JPG.");
                event.currentTarget.value = "";
                return;
              }
              if (file.size > 2 * 1024 * 1024) {
                setQrError("File QR vượt quá 2MB.");
                event.currentTarget.value = "";
                return;
              }
              setQrError("");
              setQrName(file.name);
              setQrPreview(URL.createObjectURL(file));
            }
            event.currentTarget.value = "";
          }}
          ref={fileRef}
          type="file"
        />
      </div>
    </label>
  );
}

function QrSample() {
  const modules = [
    "11111110010101111111",
    "10000010110101000001",
    "10111010001101011101",
    "10111010111001011101",
    "10111010010101011101",
    "10000010101101000001",
    "11111110101011111111",
    "00000000111100000000",
    "11010111100110101101",
    "01001100111001011010",
    "11100110101110100111",
    "00111001110101110001",
    "10101111001011011100",
    "00000000101110101011",
    "11111110110100111101",
    "10000010011100100001",
    "10111010101010101101",
    "10111010010111101001",
    "10000010101100110101",
    "11111110110011100111",
  ];
  return (
    <svg aria-label="QR thanh toán mẫu" className={styles.settingsQrSvg} viewBox="0 0 120 120" role="img">
      <rect fill="#ffffff" height="120" width="120" />
      {modules.flatMap((row, y) => row.split("").map((cell, x) => cell === "1" ? <rect fill="#0f172a" height="4.8" key={`${x}-${y}`} width="4.8" x={12 + x * 4.8} y={12 + y * 4.8} /> : null))}
      {[0, 1, 2].map((index) => {
        const positions = [[12, 12], [74.4, 12], [12, 74.4]] as const;
        const [x, y] = positions[index];
        return (
          <g key={index}>
            <rect fill="#0f172a" height="33.6" width="33.6" x={x} y={y} />
            <rect fill="#ffffff" height="21.6" width="21.6" x={x + 6} y={y + 6} />
            <rect fill="#0f172a" height="12" width="12" x={x + 10.8} y={y + 10.8} />
          </g>
        );
      })}
      <rect fill="#2563eb" height="10" rx="2" width="10" x="55" y="55" />
    </svg>
  );
}

function InvoiceField({
  environment,
  field,
  index,
  onEnvironmentChange,
  provider,
}: {
  environment: string;
  field: string;
  index: number;
  onEnvironmentChange: (value: string) => void;
  provider: string;
}) {
  if (field === "Môi trường") return <TextField label={field} onChange={onEnvironmentChange} options={["Sandbox", "Production"]} value={environment} />;
  if (field === "Loại hóa đơn") return <TextField label={field} options={["HĐ GTGT", "HĐ bán hàng", "HĐ xuất khẩu"]} value="HĐ GTGT" />;
  if (field === "Loại ký số") return <TextField label={field} options={["USB Token", "HSM", "Remote Signing"]} value="Remote Signing" />;
  if (field === "Invoice form") return <TextField label={field} value="INV-GOLF-SERVICE" />;
  if (field === "Partner GUID") return <TextField label={field} value="bkav-guid-nextvision-demo" />;
  if (field.includes("Mật khẩu") || field.includes("Secret") || field.includes("Token")) return <TextField label={field} type="password" value="************" />;
  if (field.includes("thuế")) return <TextField label={field} inputMode="numeric" value="0318888999" />;
  if (field === "API Key") return <TextField label={field} value={`${provider.split(" ")[0].toLowerCase()}_nextgolf_api_key`} />;
  if (field === "App ID") return <TextField label={field} value="NEXTGOLF-MEINVOICE-APP" />;
  return <TextField label={field} value={index === 1 ? "nextgolf_api" : "nextgolf_api"} />;
}

function OrgNode({
  code,
  email,
  name,
  onOpen,
  role,
  status,
  subordinates,
}: {
  code: string;
  email: string;
  name: string;
  onOpen: (kind: ModalKind, title: string, note?: string) => void;
  role: string;
  status: string;
  subordinates?: string;
}) {
  return (
    <article className={styles.settingsOrgNode}>
      <div className={styles.settingsOrgAvatar}>{name.charAt(0)}</div>
      <div>
        <strong>{name}</strong>
        <span>{code} · {email}</span>
        <em>{role}</em>
        {subordinates ? <small>{subordinates} dưới quyền</small> : null}
      </div>
      <b className={getStatusClass(status)}>{status}</b>
      <footer>
        {status === "Chờ" ? <button onClick={() => onOpen("confirm", `Gửi lại lời mời ${name}`, `Gửi email kích hoạt mới tới ${email}. Link cũ sẽ hết hiệu lực để tránh dùng nhầm.`)} type="button"><RefreshCcw size={13} />Gửi lại</button> : null}
        <button onClick={() => onOpen("role", `Sửa ${name} - ${role}`)} type="button"><Pencil size={13} />Sửa</button>
        <button onClick={() => onOpen("confirm", `Xóa ${name} - ${role}`, subordinates ? `${name} đang có ${subordinates} dưới quyền. Cần chuyển quản lý trước khi xóa.` : `Khóa đăng nhập ${email} và giữ lịch sử thao tác.`)} type="button"><Trash2 size={13} />Xóa</button>
      </footer>
    </article>
  );
}

function getStatusClass(status: string) {
  if (status.includes("Hoạt động")) return styles.settingsStatusBadgeGreen;
  if (status.includes("Chờ")) return styles.settingsStatusBadgeAmber;
  if (status.includes("Tạm") || status.includes("Xóa")) return styles.settingsStatusBadgeRed;
  if (status.includes("Bảo trì")) return styles.settingsStatusBadgeViolet;
  return styles.settingsStatusBadgeSlate;
}

function MiniStat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <article>
      <i><Icon size={24} /></i>
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

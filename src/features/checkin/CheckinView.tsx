"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Edit3,
  Fingerprint,
  History,
  IdCard,
  KeyRound,
  LogIn,
  LogOut,
  MoreVertical,
  Phone,
  PlusCircle,
  Power,
  ScanFace,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  Trash2,
  User,
  Users,
  Wifi,
  X,
  XCircle,
} from "lucide-react";
import styles from "@/shared/styles/feature-styles.module.css";
import { FeaturePage } from "@/shared/components";

// =====================================================================================
// SECTION A — Constants
// =====================================================================================

const TODAY = "08/05/2026";
const NOW = "14:32";

const BRANCHES = ["NextVision", "Hà Nội Center", "Sài Gòn West"] as const;

const COACHES = [
  { id: "TR-001", name: "Trần Văn An", specialty: "Swing cơ bản" },
  { id: "TR-002", name: "Đỗ Hồng Quân", specialty: "Putting & Short Game" },
  { id: "TR-003", name: "Nguyễn Mai", specialty: "Driver, Long Iron" },
  { id: "TR-004", name: "Phạm Hùng", specialty: "Course Management" },
] as const;

const LOCKER_OPTIONS = ["L-101", "L-102", "L-103", "L-204", "L-205", "L-310", "L-311"] as const;
const TOWEL_OPTIONS = ["TW-A01", "TW-A02", "TW-B05", "TW-B12"] as const;

const ADDON_SERVICES = [
  { id: "S-CADDIE", name: "Caddie", price: 350000, unit: "buổi" },
  { id: "S-BUGGY", name: "Buggy", price: 250000, unit: "lượt" },
  { id: "S-CLUB", name: "Bộ gậy thuê", price: 400000, unit: "bộ" },
  { id: "S-WATER", name: "Nước uống", price: 25000, unit: "chai" },
  { id: "S-BALL", name: "Bóng tập (100q)", price: 100000, unit: "rổ" },
  { id: "S-TOWEL", name: "Khăn cao cấp", price: 30000, unit: "chiếc" },
] as const;

const PAYMENT_METHODS = ["Tiền mặt", "Chuyển khoản", "Thẻ", "QR-Code"] as const;

const REJECTION_REASONS: Record<string, { device: "deny" | "warn"; staff: "warn"; message: string }> = {
  expired: { device: "deny", staff: "warn", message: "Hợp đồng đã hết hạn" },
  paused: { device: "deny", staff: "warn", message: "HĐ đang trong thời gian bảo lưu" },
  cancelled: { device: "deny", staff: "warn", message: "Hợp đồng đã bị hủy" },
  not_started: { device: "deny", staff: "warn", message: "HĐ chưa đến ngày bắt đầu" },
  not_activated: { device: "deny", staff: "warn", message: "HĐ chưa được kích hoạt" },
  transferred: { device: "deny", staff: "warn", message: "HĐ đã chuyển nhượng cho người khác" },
  branch_transferring: { device: "deny", staff: "warn", message: "Đang chuyển chi nhánh" },
  no_session: { device: "deny", staff: "warn", message: "Đã sử dụng hết lượt tập" },
  wrong_branch: { device: "deny", staff: "warn", message: "Gói không áp dụng tại chi nhánh này" },
  wrong_time: { device: "deny", staff: "warn", message: "Sai khung giờ — gói này chỉ tập 06:00–22:00" },
  wrong_zone: { device: "deny", staff: "warn", message: "Gói không áp dụng cho khu vực này" },
  daily_limit: { device: "deny", staff: "warn", message: "Đã đạt giới hạn lượt tập hôm nay" },
};

// =====================================================================================
// SECTION B — Types
// =====================================================================================

type CheckInStatus = "active" | "checkedout";

type CheckInLog = {
  id: string;
  memberCode: string;
  name: string;
  phone: string;
  contractCode: string;
  packageName: string;
  packageRemaining: number;
  packageEnd: string;
  packageHours: string;
  branch: string;
  checkInAt: string; // dd/mm/yyyy HH:mm
  checkOutAt?: string;
  status: CheckInStatus;
  method: "Face" | "Fingerprint" | "Card" | "Manual";
  coachId?: string;
  lockerCode?: string;
  towelCode?: string;
  addons: { serviceId: string; name: string; quantity: number; price: number }[];
  totalAddon: number;
  paymentMethod?: string;
  history: { date: string; action: string }[];
};

type DeviceType = "FACE" | "ATTENDANCE" | "CARD";
type DeviceColumn = "name" | "code" | "port" | "ip" | "password" | "branch" | "status";

type Device = {
  id: string;
  type: DeviceType;
  name: string;
  code: string;
  port: number;
  ip: string;
  password: string;
  branch: string;
  isCoachOnly: boolean;
  online: boolean;
  lastSync: string;
};

type BiometricRecord = {
  memberCode: string;
  name: string;
  phone: string;
  faceRegistered: boolean;
  fingerRegistered: boolean;
  cardRegistered: boolean;
  cardCode?: string;
  registeredDevice?: string;
  category: "member" | "agent";
};

type CheckinConfig = {
  // Section 1 — Cấu hình máy chấm công
  machineEnabled: boolean;
  machineDeviceId: string;
  syncTime: boolean;
  autoRestartMinutes: number;
  warnBeforeRestart: boolean;
  openDoorTime: string;
  registerFaceFromMachine: boolean;
  registerFingerFromMachine: boolean;
  pingServer: boolean;
  shutdownOnLogout: boolean;
  // Section 2 — Checkin Member
  memberPopupEnabled: boolean;
  memberPopupAutoClose: boolean;
  memberPopupSeconds: number;
  memberAllowExpired: boolean;
  memberAllowWrongTime: boolean;
  memberCheckoutEnabled: boolean;
  memberPopupCheckoutEnabled: boolean;
  memberPopupCheckoutAutoClose: boolean;
  memberPopupCheckoutSeconds: number;
  memberAutoCheckout: boolean;
  // Section 3 — Checkin HLV
  coachPopupEnabled: boolean;
  coachPopupAutoClose: boolean;
  coachPopupSeconds: number;
  coachAllowExpired: boolean;
  coachAllowWrongTime: boolean;
  coachCheckoutEnabled: boolean;
  coachPopupCheckoutEnabled: boolean;
  coachPopupCheckoutAutoClose: boolean;
  coachAutoCheckout: boolean;
  coachMustBookFirst: boolean;
  coachAutoUpdateBooking: boolean;
  coachAutoSelectFromBooking: boolean;
  // Section 4 — Thiết lập Checkin
  graceDaysAfterExpired: number;
  enforceDailyLimit: boolean;
  allowWrongTime: boolean;
  // Section 5 — Popup
  errorPopupSeconds: number;
  popupServiceAttendance: boolean;
  popupServiceMemberNote: boolean;
  // Section 6 — Khác
  autoReturnLockerOnCheckout: boolean;
  customDoorControl: boolean;
  memberScreenSeconds: number;
};

type CheckinReceipt = {
  id: string;
  memberCode: string;
  name: string;
  paymentMethod?: string;
  addons: AddonChosen[];
  total: number;
};

// =====================================================================================
// SECTION C — Seed data
// =====================================================================================

const INITIAL_LOGS: CheckInLog[] = [
  {
    id: "CK-2605-001",
    memberCode: "HV001",
    name: "Nguyễn Văn An",
    phone: "0901234567",
    contractCode: "HD-2602-001",
    packageName: "Gói Cao Cấp Golf",
    packageRemaining: 18,
    packageEnd: "31/12/2026",
    packageHours: "06:00 – 22:00",
    branch: "NextVision",
    checkInAt: `${TODAY} 06:55`,
    checkOutAt: `${TODAY} 09:42`,
    status: "checkedout",
    method: "Face",
    coachId: "TR-001",
    lockerCode: "L-101",
    addons: [
      { serviceId: "S-CADDIE", name: "Caddie", quantity: 1, price: 350000 },
      { serviceId: "S-WATER", name: "Nước uống", quantity: 2, price: 25000 },
    ],
    totalAddon: 400000,
    paymentMethod: "Tiền mặt",
    history: [
      { date: `${TODAY} 06:55`, action: "Check-in qua Face ID — cổng FACE-CN1" },
      { date: `${TODAY} 06:55`, action: "Trừ 1 buổi gói Golf Premium" },
      { date: `${TODAY} 09:42`, action: "Checkout thủ công — Lễ tân Hoàng Mỹ Linh" },
    ],
  },
  {
    id: "CK-2605-002",
    memberCode: "HV005",
    name: "Huỳnh Xuân Long",
    phone: "0910070932",
    contractCode: "HD-2603-007",
    packageName: "Gói VIP Master",
    packageRemaining: 42,
    packageEnd: "30/06/2027",
    packageHours: "06:00 – 22:00",
    branch: "NextVision",
    checkInAt: `${TODAY} 08:12`,
    status: "active",
    method: "Manual",
    coachId: "TR-002",
    lockerCode: "L-204",
    towelCode: "TW-A01",
    addons: [
      { serviceId: "S-BUGGY", name: "Buggy", quantity: 1, price: 250000 },
    ],
    totalAddon: 250000,
    paymentMethod: "Chuyển khoản",
    history: [
      { date: `${TODAY} 08:12`, action: "Check-in thủ công — Lễ tân Nguyễn Thị Lan" },
      { date: `${TODAY} 08:12`, action: "Mượn tủ L-204, khăn TW-A01" },
    ],
  },
  {
    id: "CK-2605-003",
    memberCode: "HV012",
    name: "Đỗ Mai Hương",
    phone: "0345678901",
    contractCode: "HD-2604-012",
    packageName: "Gói Family Combo",
    packageRemaining: 38,
    packageEnd: "31/03/2027",
    packageHours: "06:00 – 21:00",
    branch: "NextVision",
    checkInAt: `${TODAY} 09:30`,
    status: "active",
    method: "Card",
    addons: [],
    totalAddon: 0,
    history: [{ date: `${TODAY} 09:30`, action: "Check-in qua Quẹt thẻ — cổng CARD-CN1" }],
  },
  {
    id: "CK-2605-004",
    memberCode: "HV007",
    name: "Phan Mỹ Tâm",
    phone: "0907111222",
    contractCode: "HD-2603-022",
    packageName: "Gói 1 tháng",
    packageRemaining: 5,
    packageEnd: "31/05/2026",
    packageHours: "06:00 – 22:00",
    branch: "NextVision",
    checkInAt: `${TODAY} 10:45`,
    status: "active",
    method: "Fingerprint",
    coachId: "TR-003",
    lockerCode: "L-310",
    addons: [
      { serviceId: "S-BALL", name: "Bóng tập (100q)", quantity: 2, price: 100000 },
    ],
    totalAddon: 200000,
    paymentMethod: "Tiền mặt",
    history: [{ date: `${TODAY} 10:45`, action: "Check-in qua Vân tay — cổng FP-CN1" }],
  },
  {
    id: "CK-2605-005",
    memberCode: "HV015",
    name: "Vũ Hoàng Nam",
    phone: "0987654321",
    contractCode: "HD-2602-015",
    packageName: "Gói 3 tháng",
    packageRemaining: 12,
    packageEnd: "30/05/2026",
    packageHours: "06:00 – 22:00",
    branch: "NextVision",
    checkInAt: `${TODAY} 11:20`,
    checkOutAt: `${TODAY} 13:50`,
    status: "checkedout",
    method: "Face",
    addons: [],
    totalAddon: 0,
    history: [
      { date: `${TODAY} 11:20`, action: "Check-in qua Face ID" },
      { date: `${TODAY} 13:50`, action: "Tự động checkout sau 2.5h" },
    ],
  },
];

const INITIAL_DEVICES: Device[] = [
  { id: "D-001", type: "FACE", name: "Face cổng chính", code: "FACE-CN1", port: 4370, ip: "192.168.1.21", password: "********", branch: "NextVision", isCoachOnly: false, online: true, lastSync: `${TODAY} 14:30` },
  { id: "D-002", type: "FACE", name: "Face cổng phụ", code: "FACE-CN2", port: 4370, ip: "192.168.1.22", password: "********", branch: "NextVision", isCoachOnly: false, online: true, lastSync: `${TODAY} 14:31` },
  { id: "D-003", type: "FACE", name: "Face Driving Range", code: "FACE-DR", port: 4370, ip: "192.168.1.23", password: "********", branch: "NextVision", isCoachOnly: false, online: false, lastSync: `${TODAY} 09:10` },
  { id: "D-004", type: "ATTENDANCE", name: "Máy chấm công HLV", code: "ATT-HLV", port: 4371, ip: "192.168.1.41", password: "********", branch: "NextVision", isCoachOnly: true, online: true, lastSync: `${TODAY} 14:25` },
  { id: "D-005", type: "ATTENDANCE", name: "Máy chấm công Văn phòng", code: "ATT-VP", port: 4371, ip: "192.168.1.42", password: "********", branch: "NextVision", isCoachOnly: false, online: true, lastSync: `${TODAY} 14:20` },
  { id: "D-006", type: "CARD", name: "Quẹt thẻ cổng chính", code: "CARD-CN1", port: 9100, ip: "192.168.1.51", password: "********", branch: "NextVision", isCoachOnly: false, online: true, lastSync: `${TODAY} 14:32` },
];

const INITIAL_BIO: BiometricRecord[] = [
  { memberCode: "HV001", name: "Nguyễn Văn An", phone: "0901234567", faceRegistered: true, fingerRegistered: true, cardRegistered: false, registeredDevice: "FACE-CN1", category: "member" },
  { memberCode: "HV002", name: "Trần Thị Bình", phone: "0902345678", faceRegistered: false, fingerRegistered: true, cardRegistered: false, registeredDevice: "FP-CN1", category: "member" },
  { memberCode: "HV003", name: "Lê Văn Cường", phone: "0923456789", faceRegistered: true, fingerRegistered: false, cardRegistered: true, cardCode: "CARD-0003", registeredDevice: "FACE-CN1", category: "member" },
  { memberCode: "HV005", name: "Huỳnh Xuân Long", phone: "0910070932", faceRegistered: true, fingerRegistered: true, cardRegistered: true, cardCode: "CARD-0005", registeredDevice: "FACE-CN1", category: "member" },
  { memberCode: "HV007", name: "Phan Mỹ Tâm", phone: "0907111222", faceRegistered: false, fingerRegistered: true, cardRegistered: false, registeredDevice: "FP-CN1", category: "member" },
  { memberCode: "HV012", name: "Đỗ Mai Hương", phone: "0345678901", faceRegistered: false, fingerRegistered: false, cardRegistered: true, cardCode: "CARD-0012", registeredDevice: "CARD-CN1", category: "member" },
  { memberCode: "HV015", name: "Vũ Hoàng Nam", phone: "0987654321", faceRegistered: true, fingerRegistered: false, cardRegistered: false, registeredDevice: "FACE-CN1", category: "member" },
  { memberCode: "HV020", name: "Bùi Thanh Tú", phone: "0976543210", faceRegistered: false, fingerRegistered: false, cardRegistered: false, category: "member" },
  { memberCode: "AG-001", name: "Agent Lê Quang Minh", phone: "0931112222", faceRegistered: true, fingerRegistered: true, cardRegistered: false, registeredDevice: "FACE-CN1", category: "agent" },
  { memberCode: "AG-002", name: "Agent Phạm Hùng", phone: "0931112233", faceRegistered: true, fingerRegistered: false, cardRegistered: false, registeredDevice: "FACE-CN1", category: "agent" },
  { memberCode: "AG-003", name: "Agent Nguyễn Linh", phone: "0931112244", faceRegistered: false, fingerRegistered: true, cardRegistered: false, registeredDevice: "FP-CN1", category: "agent" },
];

const INITIAL_CONFIG: CheckinConfig = {
  machineEnabled: true,
  machineDeviceId: "D-005",
  syncTime: true,
  autoRestartMinutes: 0,
  warnBeforeRestart: true,
  openDoorTime: "06:00",
  registerFaceFromMachine: true,
  registerFingerFromMachine: true,
  pingServer: true,
  shutdownOnLogout: false,
  memberPopupEnabled: true,
  memberPopupAutoClose: true,
  memberPopupSeconds: 3,
  memberAllowExpired: false,
  memberAllowWrongTime: false,
  memberCheckoutEnabled: true,
  memberPopupCheckoutEnabled: true,
  memberPopupCheckoutAutoClose: true,
  memberPopupCheckoutSeconds: 3,
  memberAutoCheckout: false,
  coachPopupEnabled: true,
  coachPopupAutoClose: true,
  coachPopupSeconds: 3,
  coachAllowExpired: false,
  coachAllowWrongTime: false,
  coachCheckoutEnabled: true,
  coachPopupCheckoutEnabled: true,
  coachPopupCheckoutAutoClose: true,
  coachAutoCheckout: false,
  coachMustBookFirst: true,
  coachAutoUpdateBooking: true,
  coachAutoSelectFromBooking: true,
  graceDaysAfterExpired: 0,
  enforceDailyLimit: true,
  allowWrongTime: false,
  errorPopupSeconds: 5,
  popupServiceAttendance: true,
  popupServiceMemberNote: true,
  autoReturnLockerOnCheckout: true,
  customDoorControl: false,
  memberScreenSeconds: 10,
};

// Existing members lookup for manual check-in
const MEMBER_DIRECTORY: { code: string; name: string; phone: string; contractCode: string; packageName: string; packageRemaining: number; packageEnd: string; packageHours: string; branch: string; status: string; }[] = [
  { code: "HV001", name: "Nguyễn Văn An", phone: "0901234567", contractCode: "HD-2602-001", packageName: "Gói Cao Cấp Golf", packageRemaining: 18, packageEnd: "31/12/2026", packageHours: "06:00 – 22:00", branch: "NextVision", status: "active" },
  { code: "HV002", name: "Trần Thị Bình", phone: "0902345678", contractCode: "HD-2603-002", packageName: "Gói 1 tháng", packageRemaining: 5, packageEnd: "31/05/2026", packageHours: "06:00 – 22:00", branch: "NextVision", status: "active" },
  { code: "HV003", name: "Lê Văn Cường", phone: "0923456789", contractCode: "HD-2602-003", packageName: "Gói Premium Practice", packageRemaining: 12, packageEnd: "30/05/2026", packageHours: "06:00 – 22:00", branch: "NextVision", status: "active" },
  { code: "HV005", name: "Huỳnh Xuân Long", phone: "0910070932", contractCode: "HD-2603-007", packageName: "Gói VIP Master", packageRemaining: 42, packageEnd: "30/06/2027", packageHours: "06:00 – 22:00", branch: "NextVision", status: "active" },
  { code: "HV007", name: "Phan Mỹ Tâm", phone: "0907111222", contractCode: "HD-2603-022", packageName: "Gói 1 tháng", packageRemaining: 5, packageEnd: "31/05/2026", packageHours: "06:00 – 22:00", branch: "NextVision", status: "active" },
  { code: "HV012", name: "Đỗ Mai Hương", phone: "0345678901", contractCode: "HD-2604-012", packageName: "Gói Family Combo", packageRemaining: 38, packageEnd: "31/03/2027", packageHours: "06:00 – 21:00", branch: "NextVision", status: "active" },
  { code: "HV020", name: "Bùi Thanh Tú", phone: "0976543210", contractCode: "HD-2604-020", packageName: "Trả theo buổi", packageRemaining: 0, packageEnd: "08/05/2026", packageHours: "06:00 – 22:00", branch: "NextVision", status: "expired" },
  { code: "HV022", name: "Nguyễn Khánh Vy", phone: "0976000111", contractCode: "HD-2603-040", packageName: "Gói VIP Master", packageRemaining: 60, packageEnd: "31/12/2026", packageHours: "06:00 – 22:00", branch: "Hà Nội Center", status: "wrong_branch" },
];

// =====================================================================================
// SECTION D — Top-level component
// =====================================================================================

type Tab = "list" | "devices" | "config" | "biometric";

export default function CheckinView() {
  const [tab, setTab] = useState<Tab>("list");
  const [logs, setLogs] = useState<CheckInLog[]>(INITIAL_LOGS);
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [bio, setBio] = useState<BiometricRecord[]>(INITIAL_BIO);
  const [config, setConfig] = useState<CheckinConfig>(INITIAL_CONFIG);

  const [logSearch, setLogSearch] = useState("");
  const [logDate, setLogDate] = useState(TODAY);
  const [statusFilter, setStatusFilter] = useState<"all" | CheckInStatus>("all");

  const [manualCheckinOpen, setManualCheckinOpen] = useState(false);
  const [logDetailId, setLogDetailId] = useState<string | null>(null);
  const [checkoutDialogId, setCheckoutDialogId] = useState<string | null>(null);

  const [deviceFormOpen, setDeviceFormOpen] = useState<{ mode: "create" } | { mode: "edit"; deviceId: string } | null>(null);
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<"all" | DeviceType>("all");
  const [deviceSearch, setDeviceSearch] = useState("");
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [deviceColumnsOpen, setDeviceColumnsOpen] = useState(false);
  const [visibleDeviceColumns, setVisibleDeviceColumns] = useState<Record<DeviceColumn, boolean>>({
    name: true,
    code: true,
    port: true,
    ip: true,
    password: true,
    branch: true,
    status: true,
  });
  const [deleteDeviceId, setDeleteDeviceId] = useState<string | null>(null);
  const [bulkDeleteDeviceIds, setBulkDeleteDeviceIds] = useState<string[]>([]);
  const [receipt, setReceipt] = useState<CheckinReceipt | null>(null);

  const [bioRegisterOpen, setBioRegisterOpen] = useState<{ memberCode: string; type: "FACE" | "FINGER" | "CARD" } | null>(null);
  const [bioCategory, setBioCategory] = useState<"member" | "agent">("member");
  const [bioSearch, setBioSearch] = useState("");

  const stats = useMemo(() => {
    const today = logs.filter((l) => l.checkInAt.startsWith(TODAY));
    const inSite = today.filter((l) => l.status === "active").length;
    const totalIn = today.length;
    const totalOut = today.filter((l) => l.status === "checkedout").length;
    return { inSite, totalIn, totalOut, average: 87 };
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const q = logSearch.trim().toLowerCase();
    return logs
      .filter((l) => {
        if (!l.checkInAt.startsWith(logDate)) return false;
        if (statusFilter !== "all" && l.status !== statusFilter) return false;
        if (!q) return true;
        return (
          l.memberCode.toLowerCase().includes(q) ||
          l.name.toLowerCase().includes(q) ||
          l.phone.includes(q)
        );
      })
      .sort((a, b) => b.checkInAt.localeCompare(a.checkInAt));
  }, [logs, logSearch, logDate, statusFilter]);

  const filteredDevices = useMemo(() => {
    const q = deviceSearch.trim().toLowerCase();
    return devices.filter((d) => {
      if (deviceTypeFilter !== "all" && d.type !== deviceTypeFilter) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.ip.includes(q) ||
        d.branch.toLowerCase().includes(q)
      );
    });
  }, [devices, deviceSearch, deviceTypeFilter]);

  const deviceCounts = useMemo(() => {
    const total = devices.length;
    const att = devices.filter((d) => d.type === "ATTENDANCE").length;
    const face = devices.filter((d) => d.type === "FACE").length;
    const card = devices.filter((d) => d.type === "CARD").length;
    return { total, att, face, card };
  }, [devices]);

  const filteredBio = useMemo(() => {
    const q = bioSearch.trim().toLowerCase();
    return bio
      .filter((b) => b.category === bioCategory)
      .filter((b) => {
        if (!q) return true;
        return (
          b.memberCode.toLowerCase().includes(q) ||
          b.name.toLowerCase().includes(q) ||
          b.phone.includes(q)
        );
      });
  }, [bio, bioCategory, bioSearch]);

  const bioStats = useMemo(() => {
    const members = bio.filter((b) => b.category === "member");
    return {
      face: members.filter((b) => b.faceRegistered).length,
      finger: members.filter((b) => b.fingerRegistered).length,
      card: members.filter((b) => b.cardRegistered).length,
      total: members.length,
    };
  }, [bio]);

  const handleManualCheckin = (payload: ManualCheckinPayload) => {
    const newLog: CheckInLog = {
      id: `CK-${Math.floor(Math.random() * 9000) + 1000}`,
      memberCode: payload.memberCode,
      name: payload.name,
      phone: payload.phone,
      contractCode: payload.contractCode,
      packageName: payload.packageName,
      packageRemaining: payload.packageRemaining,
      packageEnd: payload.packageEnd,
      packageHours: payload.packageHours,
      branch: payload.branch,
      checkInAt: `${TODAY} ${NOW}`,
      status: "active",
      method: "Manual",
      coachId: payload.coachId,
      lockerCode: payload.lockerCode,
      towelCode: payload.towelCode,
      addons: payload.addons,
      totalAddon: payload.addons.reduce((sum, a) => sum + a.price * a.quantity, 0),
      paymentMethod: payload.paymentMethod,
      history: [
        { date: `${TODAY} ${NOW}`, action: `Check-in thủ công — Lễ tân ${payload.staff}` },
        ...(payload.lockerCode ? [{ date: `${TODAY} ${NOW}`, action: `Mượn tủ ${payload.lockerCode}` }] : []),
        ...(payload.addons.length > 0
          ? [{ date: `${TODAY} ${NOW}`, action: `Thêm ${payload.addons.length} dịch vụ` }]
          : []),
      ],
    };
    setLogs((prev) => [newLog, ...prev]);
    setManualCheckinOpen(false);
    if (newLog.addons.length > 0) {
      setReceipt({
        id: `PT-M09-${newLog.id.replace("CK-", "")}`,
        memberCode: newLog.memberCode,
        name: newLog.name,
        paymentMethod: newLog.paymentMethod,
        addons: newLog.addons,
        total: newLog.totalAddon,
      });
    }
  };

  const handleCheckout = (logId: string) => {
    setLogs((prev) =>
      prev.map((l) =>
        l.id === logId
          ? {
              ...l,
              status: "checkedout",
              checkOutAt: `${TODAY} ${NOW}`,
              history: [
                ...l.history,
                { date: `${TODAY} ${NOW}`, action: "Checkout thủ công — Lễ tân" },
                ...(config.autoReturnLockerOnCheckout && l.lockerCode
                  ? [{ date: `${TODAY} ${NOW}`, action: `Tự động trả tủ ${l.lockerCode}` }]
                  : []),
              ],
            }
          : l,
      ),
    );
    setCheckoutDialogId(null);
  };

  const upsertDevice = (d: Device) => {
    setDevices((prev) => {
      const exists = prev.some((x) => x.id === d.id);
      return exists ? prev.map((x) => (x.id === d.id ? d : x)) : [d, ...prev];
    });
  };

  const removeDevice = (id: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
    setDeleteDeviceId(null);
    setSelectedDeviceIds((prev) => prev.filter((deviceId) => deviceId !== id));
  };

  const removeDevices = (ids: string[]) => {
    setDevices((prev) => prev.filter((d) => !ids.includes(d.id)));
    setSelectedDeviceIds((prev) => prev.filter((id) => !ids.includes(id)));
    setBulkDeleteDeviceIds([]);
  };

  const updateConfig = <K extends keyof CheckinConfig>(key: K, value: CheckinConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const completeBioRegister = (memberCode: string, type: "FACE" | "FINGER" | "CARD", deviceCode: string, cardCode?: string) => {
    setBio((prev) =>
      prev.map((b) =>
        b.memberCode === memberCode
          ? {
              ...b,
              faceRegistered: type === "FACE" ? true : b.faceRegistered,
              fingerRegistered: type === "FINGER" ? true : b.fingerRegistered,
              cardRegistered: type === "CARD" ? true : b.cardRegistered,
              cardCode: type === "CARD" ? cardCode : b.cardCode,
              registeredDevice: deviceCode || b.registeredDevice,
            }
          : b,
      ),
    );
    setBioRegisterOpen(null);
  };

  return (
    <FeaturePage title="Check-in / Checkout" subtitle="Quản lý realtime lượt vào/ra, thiết bị sinh trắc và cấu hình check-in toàn hệ thống">
      <div className={styles.checkinTopBar}>
        <div className={styles.checkinTabs}>
          <button
            className={`${styles.checkinTab} ${tab === "list" ? styles.checkinTabActive : ""}`}
            onClick={() => setTab("list")}
            type="button"
          >
            <LogIn size={16} /> Danh sách Check-in
          </button>
          <button
            className={`${styles.checkinTab} ${tab === "devices" ? styles.checkinTabActive : ""}`}
            onClick={() => setTab("devices")}
            type="button"
          >
            <Smartphone size={16} /> Quản lý thiết bị
          </button>
          <button
            className={`${styles.checkinTab} ${tab === "config" ? styles.checkinTabActive : ""}`}
            onClick={() => setTab("config")}
            type="button"
          >
            <Settings size={16} /> Cấu hình tùy chỉnh
          </button>
          <button
            className={`${styles.checkinTab} ${tab === "biometric" ? styles.checkinTabActive : ""}`}
            onClick={() => setTab("biometric")}
            type="button"
          >
            <ScanFace size={16} /> Đăng ký FaceID / Vân tay
          </button>
        </div>
        {tab === "list" ? (
          <button className={styles.checkinPrimary} onClick={() => setManualCheckinOpen(true)} type="button">
            <PlusCircle size={16} /> Check-in thủ công
          </button>
        ) : null}
      </div>

      {tab === "list" ? (
        <ListTab
          filteredLogs={filteredLogs}
          logDate={logDate}
          logs={logs}
          logSearch={logSearch}
          onOpenCheckoutDialog={setCheckoutDialogId}
          onOpenDetail={setLogDetailId}
          setLogDate={setLogDate}
          setLogSearch={setLogSearch}
          setStatusFilter={setStatusFilter}
          stats={stats}
          statusFilter={statusFilter}
        />
      ) : null}

      {tab === "devices" ? (
        <DevicesTab
          columnsOpen={deviceColumnsOpen}
          counts={deviceCounts}
          devices={filteredDevices}
          deviceSearch={deviceSearch}
          onAddDevice={() => setDeviceFormOpen({ mode: "create" })}
          onBulkDelete={() => setBulkDeleteDeviceIds(selectedDeviceIds)}
          onCloseColumns={() => setDeviceColumnsOpen(false)}
          onDeleteDevice={setDeleteDeviceId}
          onEditDevice={(id) => setDeviceFormOpen({ mode: "edit", deviceId: id })}
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
          setTypeFilter={setDeviceTypeFilter}
          setVisibleColumns={setVisibleDeviceColumns}
          typeFilter={deviceTypeFilter}
          visibleColumns={visibleDeviceColumns}
        />
      ) : null}

      {tab === "config" ? <ConfigTab config={config} devices={devices} onUpdate={updateConfig} /> : null}

      {tab === "biometric" ? (
        <BiometricTab
          bioCategory={bioCategory}
          bioSearch={bioSearch}
          counts={{ ...bioStats, members: bio.filter((b) => b.category === "member").length, agents: bio.filter((b) => b.category === "agent").length }}
          filteredBio={filteredBio}
          onOpenRegister={(memberCode, type) => setBioRegisterOpen({ memberCode, type })}
          setBioCategory={setBioCategory}
          setBioSearch={setBioSearch}
        />
      ) : null}

      {/* ============== MODALS ============== */}
      {manualCheckinOpen ? (
        <ManualCheckinModal
          onClose={() => setManualCheckinOpen(false)}
          onConfirm={handleManualCheckin}
        />
      ) : null}

      {logDetailId ? (
        <LogDetailModal
          log={logs.find((l) => l.id === logDetailId)!}
          onClose={() => setLogDetailId(null)}
        />
      ) : null}

      {checkoutDialogId ? (
        <CheckoutDialog
          log={logs.find((l) => l.id === checkoutDialogId)!}
          onCancel={() => setCheckoutDialogId(null)}
          onConfirm={() => handleCheckout(checkoutDialogId)}
        />
      ) : null}

      {deviceFormOpen ? (
        <DeviceFormModal
          editingDevice={
            deviceFormOpen.mode === "edit"
              ? devices.find((d) => d.id === deviceFormOpen.deviceId)
              : undefined
          }
          existingDevices={devices}
          mode={deviceFormOpen.mode}
          onClose={() => setDeviceFormOpen(null)}
          onSave={(d) => {
            upsertDevice(d);
            setDeviceFormOpen(null);
          }}
        />
      ) : null}

      {deleteDeviceId ? (
        <DeleteDeviceDialog
          device={devices.find((d) => d.id === deleteDeviceId)!}
          onCancel={() => setDeleteDeviceId(null)}
          onConfirm={() => removeDevice(deleteDeviceId)}
        />
      ) : null}

      {bulkDeleteDeviceIds.length > 0 ? (
        <DeleteDeviceDialog
          count={bulkDeleteDeviceIds.length}
          onCancel={() => setBulkDeleteDeviceIds([])}
          onConfirm={() => removeDevices(bulkDeleteDeviceIds)}
        />
      ) : null}

      {bioRegisterOpen ? (
        <BiometricRegisterModal
          devices={devices}
          memberCode={bioRegisterOpen.memberCode}
          memberName={bio.find((b) => b.memberCode === bioRegisterOpen.memberCode)?.name ?? ""}
          onClose={() => setBioRegisterOpen(null)}
          onComplete={completeBioRegister}
          type={bioRegisterOpen.type}
        />
      ) : null}

      {receipt ? (
        <CheckinReceiptModal
          receipt={receipt}
          onClose={() => setReceipt(null)}
        />
      ) : null}
    </FeaturePage>
  );
}

// =====================================================================================
// SECTION E — List Tab
// =====================================================================================

function ListTab({
  filteredLogs,
  logDate,
  logs,
  logSearch,
  onOpenCheckoutDialog,
  onOpenDetail,
  setLogDate,
  setLogSearch,
  setStatusFilter,
  stats,
  statusFilter,
}: {
  filteredLogs: CheckInLog[];
  logDate: string;
  logs: CheckInLog[];
  logSearch: string;
  onOpenCheckoutDialog: (id: string) => void;
  onOpenDetail: (id: string) => void;
  setLogDate: (v: string) => void;
  setLogSearch: (v: string) => void;
  setStatusFilter: (v: "all" | CheckInStatus) => void;
  stats: { inSite: number; totalIn: number; totalOut: number; average: number };
  statusFilter: "all" | CheckInStatus;
}) {
  return (
    <>
      <div className={styles.checkinKpiGrid}>
        <article className={`${styles.checkinKpi} ${styles.checkinKpiBlue}`}>
          <div><Users size={20} /></div>
          <span>Đang trong sân</span>
          <strong>{stats.inSite}</strong>
          <small>HV đang tập (realtime)</small>
        </article>
        <article className={`${styles.checkinKpi} ${styles.checkinKpiGreen}`}>
          <div><LogIn size={20} /></div>
          <span>Tổng check-in hôm nay</span>
          <strong>{stats.totalIn}</strong>
          <small>{TODAY}</small>
        </article>
        <article className={`${styles.checkinKpi} ${styles.checkinKpiOrange}`}>
          <div><LogOut size={20} /></div>
          <span>Tổng check-out hôm nay</span>
          <strong>{stats.totalOut}</strong>
          <small>{TODAY}</small>
        </article>
        <article className={`${styles.checkinKpi} ${styles.checkinKpiPurple}`}>
          <div><History size={20} /></div>
          <span>Trung bình / ngày</span>
          <strong>{stats.average}</strong>
          <small>30 ngày gần nhất</small>
        </article>
      </div>

      <div className={styles.checkinFilterRow}>
        <div className={styles.checkinSearch}>
          <Search size={16} />
          <input
            onChange={(e) => setLogSearch(e.target.value)}
            placeholder="Tìm theo mã / tên / SĐT..."
            type="text"
            value={logSearch}
          />
        </div>
        <label className={styles.checkinDateLabel}>
          <CalendarIcon size={14} />
          <input
            onChange={(e) => {
              const [y, m, d] = e.target.value.split("-");
              setLogDate(`${d}/${m}/${y}`);
            }}
            type="date"
            value={(() => {
              const [d, m, y] = logDate.split("/");
              return `${y}-${m}-${d}`;
            })()}
          />
        </label>
        <div className={styles.checkinChips}>
          {([
            { key: "all", label: `Tất cả (${logs.filter((l) => l.checkInAt.startsWith(logDate)).length})` },
            { key: "active", label: `Đang trong sân (${logs.filter((l) => l.checkInAt.startsWith(logDate) && l.status === "active").length})` },
            { key: "checkedout", label: `Đã checkout (${logs.filter((l) => l.checkInAt.startsWith(logDate) && l.status === "checkedout").length})` },
          ] as const).map((chip) => (
            <button
              className={`${styles.checkinChip} ${statusFilter === chip.key ? styles.checkinChipActive : ""}`}
              key={chip.key}
              onClick={() => setStatusFilter(chip.key)}
              type="button"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.checkinTableWrap}>
        <table className={styles.checkinTable}>
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã HV</th>
              <th>Tên hội viên</th>
              <th>Số điện thoại</th>
              <th>Giờ check-in</th>
              <th>Giờ check-out</th>
              <th>Phương thức</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td className={styles.checkinEmptyRow} colSpan={9}>
                  Chưa có lượt check-in nào trong ngày {logDate}
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, idx) => (
                <tr
                  className={styles.checkinRow}
                  key={log.id}
                  onClick={() => onOpenDetail(log.id)}
                >
                  <td>{idx + 1}</td>
                  <td><span className={styles.checkinMemberCode}>{log.memberCode}</span></td>
                  <td><strong>{log.name}</strong></td>
                  <td><Phone size={11} /> {log.phone}</td>
                  <td><span className={styles.checkinTimeIn}>{log.checkInAt.split(" ")[1]}</span></td>
                  <td>
                    {log.checkOutAt ? (
                      <span className={styles.checkinTimeOut}>{log.checkOutAt.split(" ")[1]}</span>
                    ) : (
                      <span className={styles.checkinDash}>—</span>
                    )}
                  </td>
                  <td>
                    <span className={styles.checkinMethodTag}>
                      {log.method === "Face" ? <ScanFace size={11} /> : null}
                      {log.method === "Fingerprint" ? <Fingerprint size={11} /> : null}
                      {log.method === "Card" ? <CreditCard size={11} /> : null}
                      {log.method === "Manual" ? <User size={11} /> : null}
                      {log.method === "Face" ? "Face ID" : log.method === "Fingerprint" ? "Vân tay" : log.method === "Card" ? "Thẻ" : "Thủ công"}
                    </span>
                  </td>
                  <td>
                    {log.status === "active" ? (
                      <span className={styles.checkinStatusActive}>Đang trong sân</span>
                    ) : (
                      <span className={styles.checkinStatusOut}>Đã checkout</span>
                    )}
                  </td>
                  <td>
                    {log.status === "active" ? (
                      <button
                        className={styles.checkinCheckoutBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCheckoutDialog(log.id);
                        }}
                        type="button"
                      >
                        <LogOut size={12} /> Checkout
                      </button>
                    ) : (
                      <button
                        className={styles.checkinDetailBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDetail(log.id);
                        }}
                        type="button"
                      >
                        Chi tiết
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

// =====================================================================================
// SECTION F — Manual Check-in Modal
// =====================================================================================

type AddonChosen = { serviceId: string; name: string; quantity: number; price: number };
type ManualCheckinPayload = {
  memberCode: string;
  name: string;
  phone: string;
  contractCode: string;
  packageName: string;
  packageRemaining: number;
  packageEnd: string;
  packageHours: string;
  branch: string;
  coachId?: string;
  lockerCode?: string;
  towelCode?: string;
  addons: AddonChosen[];
  paymentMethod?: string;
  staff: string;
};

function ManualCheckinModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (payload: ManualCheckinPayload) => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [coachId, setCoachId] = useState<string>("");
  const [borrowLocker, setBorrowLocker] = useState(false);
  const [borrowTowel, setBorrowTowel] = useState(false);
  const [lockerCode, setLockerCode] = useState<string>("");
  const [towelCode, setTowelCode] = useState<string>("");
  const [addons, setAddons] = useState<AddonChosen[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS[0]);
  const [staff] = useState("Nguyễn Thị Lan");
  const [tab, setTab] = useState<"package" | "note" | "business" | "companions" | "session" | "packageNote" | "history">("package");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return MEMBER_DIRECTORY.slice(0, 8);
    return MEMBER_DIRECTORY.filter(
      (m) => m.code.toLowerCase().includes(q) || m.name.toLowerCase().includes(q) || m.phone.includes(q),
    ).slice(0, 8);
  }, [search]);

  const selected = MEMBER_DIRECTORY.find((m) => m.code === selectedCode);

  const warnings = useMemo(() => {
    if (!selected) return [];
    const list: { code: string; message: string }[] = [];
    const reason = REJECTION_REASONS[selected.status];
    if (reason) list.push({ code: selected.status, message: reason.message });
    return list;
  }, [selected]);

  const toggleAddon = (s: typeof ADDON_SERVICES[number]) => {
    setAddons((prev) => {
      const ex = prev.find((a) => a.serviceId === s.id);
      if (ex) return prev.filter((a) => a.serviceId !== s.id);
      return [...prev, { serviceId: s.id, name: s.name, quantity: 1, price: s.price }];
    });
  };

  const updateAddonQty = (id: string, qty: number) => {
    setAddons((prev) =>
      prev.map((a) => (a.serviceId === id ? { ...a, quantity: Math.max(1, qty) } : a)),
    );
  };

  const total = addons.reduce((sum, a) => sum + a.price * a.quantity, 0);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!selected) next.member = "Chọn hội viên trước khi check-in";
    if (borrowLocker && !lockerCode) next.lockerCode = "Chọn tủ trống để bàn giao cho hội viên";
    if (borrowTowel && !towelCode) next.towelCode = "Chọn mã khăn để theo dõi trả khi checkout";
    if (addons.length > 0 && !paymentMethod) next.paymentMethod = "Chọn phương thức thanh toán dịch vụ thêm";
    return next;
  };

  const handleConfirm = () => {
    const next = validate();
    setErrors(next);
    if (!selected || Object.keys(next).length > 0) return;
    onConfirm({
      memberCode: selected.code,
      name: selected.name,
      phone: selected.phone,
      contractCode: selected.contractCode,
      packageName: selected.packageName,
      packageRemaining: selected.packageRemaining,
      packageEnd: selected.packageEnd,
      packageHours: selected.packageHours,
      branch: selected.branch,
      coachId: coachId || undefined,
      lockerCode: borrowLocker ? lockerCode || undefined : undefined,
      towelCode: borrowTowel ? towelCode || undefined : undefined,
      addons,
      paymentMethod: addons.length > 0 ? paymentMethod : undefined,
      staff,
    });
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "F12" && selected) {
        event.preventDefault();
        handleConfirm();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modalContent} ${styles.checkinManualModal}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.checkinModalHeader}>
          <div>
            <h3>Check-in Golf</h3>
            <p>Tra cứu HV và xác nhận lượt vào sân — kiểm tra HĐ, chi nhánh và khung giờ</p>
          </div>
          <button className={styles.modalClose} onClick={onClose} type="button"><X size={18} /></button>
        </header>

        <div className={styles.checkinManualBody}>
          {!selected ? (
            <div className={styles.checkinSearchPanel}>
              <div className={styles.checkinSearchBig}>
                <Search size={18} />
                <input
                  autoFocus
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nhập mã HV / tên / SĐT..."
                  type="text"
                  value={search}
                />
              </div>
              <div className={styles.checkinSearchResults}>
                {matches.map((m) => (
                  <button
                    className={styles.checkinSearchResult}
                    key={m.code}
                    onClick={() => setSelectedCode(m.code)}
                    type="button"
                  >
                    <div className={styles.checkinAvatar}>{m.name.split(" ").pop()?.[0] ?? "?"}</div>
                    <div>
                      <strong>{m.name}</strong>
                      <span>{m.code} · {m.phone}</span>
                      <small>{m.packageName} · còn {m.packageRemaining} buổi</small>
                    </div>
                    <ChevronRight size={16} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.checkinManualGrid}>
              {/* Cột trái: Avatar + Section Checkin */}
              <aside className={styles.checkinManualLeft}>
                <div className={styles.checkinAvatarLarge}>{selected.name.split(" ").pop()?.[0] ?? "?"}</div>
                <h4>{selected.name}</h4>
                <p className={styles.checkinMemberMeta}>{selected.code} · {selected.phone}</p>
                <button
                  className={styles.checkinChangeMember}
                  onClick={() => setSelectedCode("")}
                  type="button"
                >
                  Đổi HV
                </button>

                {warnings.length > 0 ? (
                  <div className={styles.checkinWarnList}>
                    {warnings.map((w) => (
                      <div className={styles.checkinWarnItem} key={w.code}>
                        <AlertTriangle size={14} />
                        <span>{w.message}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.checkinOkBadge}>
                    <CheckCircle2 size={14} /> Đủ điều kiện check-in
                  </div>
                )}

                <section className={styles.checkinManualSection}>
                  <h5>Cấu hình buổi tập</h5>
                  <label className={styles.checkinManualField}>
                    <span>Giáo viên / HLV</span>
                    <select onChange={(e) => setCoachId(e.target.value)} value={coachId}>
                      <option value="">— Không có —</option>
                      {COACHES.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} — {c.specialty}</option>
                      ))}
                    </select>
                  </label>

                  <div className={styles.checkinBorrowGroup}>
                    <label className={styles.checkinBorrowItem}>
                      <input checked={borrowLocker} onChange={(e) => setBorrowLocker(e.target.checked)} type="checkbox" />
                      <span>Mượn tủ đồ</span>
                    </label>
                    {borrowLocker ? (
                      <select
                        className={errors.lockerCode ? styles.checkinInputError : ""}
                        onChange={(e) => {
                          setLockerCode(e.target.value);
                          setErrors((prev) => ({ ...prev, lockerCode: "" }));
                        }}
                        value={lockerCode}
                      >
                        <option value="">Chọn tủ trống</option>
                        {LOCKER_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    ) : null}
                    {errors.lockerCode ? <small className={styles.checkinFieldError}>{errors.lockerCode}</small> : null}
                  </div>

                  <div className={styles.checkinBorrowGroup}>
                    <label className={styles.checkinBorrowItem}>
                      <input checked={borrowTowel} onChange={(e) => setBorrowTowel(e.target.checked)} type="checkbox" />
                      <span>Mượn khăn</span>
                    </label>
                    {borrowTowel ? (
                      <select
                        className={errors.towelCode ? styles.checkinInputError : ""}
                        onChange={(e) => {
                          setTowelCode(e.target.value);
                          setErrors((prev) => ({ ...prev, towelCode: "" }));
                        }}
                        value={towelCode}
                      >
                        <option value="">Chọn khăn trống</option>
                        {TOWEL_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    ) : null}
                    {errors.towelCode ? <small className={styles.checkinFieldError}>{errors.towelCode}</small> : null}
                  </div>
                </section>

                <section className={styles.checkinManualSection}>
                  <h5>Dịch vụ thêm</h5>
                  <div className={styles.checkinAddonGrid}>
                    {ADDON_SERVICES.map((s) => {
                      const chosen = addons.find((a) => a.serviceId === s.id);
                      return (
                        <div className={`${styles.checkinAddonCard} ${chosen ? styles.checkinAddonCardActive : ""}`} key={s.id}>
                          <label>
                            <input checked={!!chosen} onChange={() => toggleAddon(s)} type="checkbox" />
                            <div>
                              <strong>{s.name}</strong>
                              <small>{s.price.toLocaleString("vi-VN")}đ / {s.unit}</small>
                            </div>
                          </label>
                          {chosen ? (
                            <input
                              className={styles.checkinAddonQty}
                              min={1}
                              onChange={(e) => updateAddonQty(s.id, parseInt(e.target.value, 10) || 1)}
                              type="number"
                              value={chosen.quantity}
                            />
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                  {addons.length > 0 ? (
                    <div className={styles.checkinPaymentRow}>
                      <strong>Tổng dịch vụ:</strong>
                      <span className={styles.checkinTotalAmount}>{total.toLocaleString("vi-VN")}đ</span>
                      <select onChange={(e) => setPaymentMethod(e.target.value)} value={paymentMethod}>
                        {PAYMENT_METHODS.map((p) => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                  ) : null}
                </section>
              </aside>

              {/* Cột phải: Tabs */}
              <div className={styles.checkinManualRight}>
                <div className={styles.checkinManualTabs}>
                  <button
                    className={tab === "package" ? styles.checkinManualTabActive : ""}
                    onClick={() => setTab("package")}
                    type="button"
                  >
                    Thông tin gói tập
                  </button>
                  <button
                    className={tab === "note" ? styles.checkinManualTabActive : ""}
                    onClick={() => setTab("note")}
                    type="button"
                  >
                    Ghi chú HV
                  </button>
                  <button
                    className={tab === "business" ? styles.checkinManualTabActive : ""}
                    onClick={() => setTab("business")}
                    type="button"
                  >
                    Nghiệp vụ HV
                  </button>
                  <button
                    className={tab === "companions" ? styles.checkinManualTabActive : ""}
                    onClick={() => setTab("companions")}
                    type="button"
                  >
                    HV tập kèm
                  </button>
                  <button
                    className={tab === "session" ? styles.checkinManualTabActive : ""}
                    onClick={() => setTab("session")}
                    type="button"
                  >
                    Ghi chú buổi tập
                  </button>
                  <button
                    className={tab === "packageNote" ? styles.checkinManualTabActive : ""}
                    onClick={() => setTab("packageNote")}
                    type="button"
                  >
                    Ghi chú gói thẻ
                  </button>
                  <button
                    className={tab === "history" ? styles.checkinManualTabActive : ""}
                    onClick={() => setTab("history")}
                    type="button"
                  >
                    Lịch sử
                  </button>
                </div>

                {tab === "package" ? (
                  <div className={styles.checkinPackageInfo}>
                    <dl className={styles.checkinPkgGrid}>
                      <div><dt>Gói tập</dt><dd>{selected.packageName}</dd></div>
                      <div><dt>Mã HĐ</dt><dd>{selected.contractCode}</dd></div>
                      <div><dt>Số buổi còn lại</dt><dd>{selected.packageRemaining}</dd></div>
                      <div><dt>Ngày kết thúc</dt><dd>{selected.packageEnd}</dd></div>
                      <div><dt>Khung giờ tập</dt><dd>{selected.packageHours}</dd></div>
                      <div>
                        <dt>Trạng thái khung giờ</dt>
                        <dd className={styles.checkinStatusActive}>Đúng giờ</dd>
                      </div>
                      <div><dt>Chi nhánh HĐ</dt><dd>{selected.branch}</dd></div>
                      <div><dt>NV Sale</dt><dd>Phạm Văn Đức</dd></div>
                    </dl>
                    <div className={styles.checkinPkgLinks}>
                      <button onClick={() => setTab("history")} type="button">Lịch sử HĐ</button>
                      <button onClick={() => setTab("business")} type="button">Khung giờ tập</button>
                      <button onClick={() => setTab("business")} type="button">Công nợ</button>
                    </div>
                    <table className={styles.checkinContractTable}>
                      <thead>
                        <tr><th>Mã HĐ</th><th>Dịch vụ</th><th>Bắt đầu</th><th>Kết thúc</th><th>Trạng thái</th><th>Còn lại</th><th>Sale</th></tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{selected.contractCode}</td>
                          <td>{selected.packageName}</td>
                          <td>01/02/2026</td>
                          <td>{selected.packageEnd}</td>
                          <td><span className={styles.checkinStatusActive}>Đang hiệu lực</span></td>
                          <td>{selected.packageRemaining} buổi</td>
                          <td>Phạm Văn Đức</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : null}

                {tab === "note" ? (
                  <div className={styles.checkinNote}>
                    <p>VIP — Ưu tiên xếp tee đầu giờ. Không dùng caddie nữ.</p>
                    <p>Sinh nhật {selected.code === "HV001" ? "12/05" : "—"}.</p>
                  </div>
                ) : null}

                {tab === "business" ? (
                  <div className={styles.checkinPackageInfo}>
                    <dl className={styles.checkinPkgGrid}>
                      <div><dt>Điều kiện HĐ</dt><dd>Đúng chi nhánh, đúng khung giờ, còn lượt tập</dd></div>
                      <div><dt>Công nợ</dt><dd>0đ quá hạn</dd></div>
                      <div><dt>Khu vực được vào</dt><dd>Driving Range, Putting Green, Phòng Locker</dd></div>
                      <div><dt>Giới hạn/ngày</dt><dd>1 lượt chính + dịch vụ mua thêm</dd></div>
                    </dl>
                  </div>
                ) : null}

                {tab === "companions" ? (
                  <div className={styles.checkinNote}>
                    <p>Gói hiện tại cho phép tối đa 01 hội viên tập kèm nếu cùng nhóm Family Combo.</p>
                    <p>Hôm nay chưa ghi nhận hội viên tập kèm trong lượt check-in này.</p>
                  </div>
                ) : null}

                {tab === "session" ? (
                  <div className={styles.checkinNote}>
                    <p>Buổi tập ưu tiên line gần camera swing để HLV theo dõi video sau buổi tập.</p>
                    <p>Lễ tân cần nhắc hội viên trả tủ/khăn trước khi checkout.</p>
                  </div>
                ) : null}

                {tab === "packageNote" ? (
                  <div className={styles.checkinNote}>
                    <p>Gói được tái ký từ hợp đồng HD-2511-021, giữ nguyên quyền lợi khung giờ cao điểm.</p>
                    <p>Không áp dụng khuyến mãi khi mua thêm bóng tập trong ngày cuối tuần.</p>
                  </div>
                ) : null}

                {tab === "history" ? (
                  <div className={styles.checkinHistory}>
                    <div><strong>{TODAY} 06:55</strong><span>Check-in qua Face ID</span></div>
                    <div><strong>05/05/2026 07:10</strong><span>Check-in qua Face ID</span></div>
                    <div><strong>03/05/2026 14:30</strong><span>Check-in thủ công</span></div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        <footer className={styles.checkinModalFooter}>
          <span className={styles.checkinShortcut}><KeyRound size={12} /> F12 đồng ý · ESC từ chối</span>
          <div>
            <button className={styles.checkinBtnGhost} onClick={onClose} type="button">
              <XCircle size={14} /> Không cho vào (ESC)
            </button>
            <button
              className={styles.checkinBtnConfirm}
              disabled={!selected}
              onClick={handleConfirm}
              type="button"
            >
              <CheckCircle2 size={14} /> Đồng ý cho vào (F12)
              {addons.length > 0 ? " & In bill" : ""}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

// =====================================================================================
// SECTION G — Log Detail Modal
// =====================================================================================

function LogDetailModal({ log, onClose }: { log: CheckInLog; onClose: () => void }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modalContent} ${styles.checkinLogModal}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.checkinModalHeader}>
          <div>
            <h3>Chi tiết check-in {log.id}</h3>
            <p>{log.memberCode} · {log.name} · {log.checkInAt}</p>
          </div>
          <button className={styles.modalClose} onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <div className={styles.checkinLogBody}>
          <dl className={styles.checkinLogGrid}>
            <div><dt>SĐT</dt><dd>{log.phone}</dd></div>
            <div><dt>Hợp đồng</dt><dd>{log.contractCode}</dd></div>
            <div><dt>Gói</dt><dd>{log.packageName}</dd></div>
            <div><dt>Buổi còn lại</dt><dd>{log.packageRemaining}</dd></div>
            <div><dt>Chi nhánh</dt><dd>{log.branch}</dd></div>
            <div>
              <dt>Phương thức</dt>
              <dd>
                <span className={styles.checkinMethodTag}>
                  {log.method === "Face" ? "Face ID" : log.method === "Fingerprint" ? "Vân tay" : log.method === "Card" ? "Thẻ" : "Thủ công"}
                </span>
              </dd>
            </div>
            <div><dt>Giờ vào</dt><dd className={styles.checkinTimeIn}>{log.checkInAt.split(" ")[1]}</dd></div>
            <div><dt>Giờ ra</dt><dd className={styles.checkinTimeOut}>{log.checkOutAt?.split(" ")[1] ?? "—"}</dd></div>
            {log.coachId ? (
              <div><dt>HLV</dt><dd>{COACHES.find((c) => c.id === log.coachId)?.name ?? log.coachId}</dd></div>
            ) : null}
            {log.lockerCode ? <div><dt>Tủ</dt><dd>{log.lockerCode}</dd></div> : null}
            {log.towelCode ? <div><dt>Khăn</dt><dd>{log.towelCode}</dd></div> : null}
          </dl>

          {log.addons.length > 0 ? (
            <section>
              <h5>Dịch vụ đi kèm</h5>
              <table className={styles.checkinAddonTable}>
                <thead>
                  <tr><th>Dịch vụ</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr>
                </thead>
                <tbody>
                  {log.addons.map((a) => (
                    <tr key={a.serviceId}>
                      <td>{a.name}</td>
                      <td>{a.quantity}</td>
                      <td>{a.price.toLocaleString("vi-VN")}đ</td>
                      <td>{(a.price * a.quantity).toLocaleString("vi-VN")}đ</td>
                    </tr>
                  ))}
                  <tr className={styles.checkinAddonTotal}>
                    <td colSpan={3}>Tổng cộng ({log.paymentMethod ?? "—"})</td>
                    <td>{log.totalAddon.toLocaleString("vi-VN")}đ</td>
                  </tr>
                </tbody>
              </table>
            </section>
          ) : null}

          <section>
            <h5>Lịch sử thao tác</h5>
            <ul className={styles.checkinTimeline}>
              {log.history.map((h, i) => (
                <li key={`${h.date}-${i}`}>
                  <span className={styles.checkinTimelineDot} />
                  <div>
                    <strong>{h.date}</strong>
                    <span>{h.action}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <footer className={styles.checkinModalFooter}>
          <button className={styles.checkinBtnConfirm} onClick={onClose} type="button">Đóng</button>
        </footer>
      </div>
    </div>
  );
}

// =====================================================================================
// SECTION H — Checkout Dialog
// =====================================================================================

function CheckoutDialog({
  log,
  onCancel,
  onConfirm,
}: {
  log: CheckInLog;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div
        className={`${styles.modalContent} ${styles.checkinCheckoutDialog}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.checkinModalHeader}>
          <div>
            <h3>Xác nhận checkout</h3>
            <p>Ghi nhận thời điểm rời sân golf</p>
          </div>
          <button className={styles.modalClose} onClick={onCancel} type="button"><X size={18} /></button>
        </header>
        <div className={styles.checkinCheckoutBody}>
          <dl>
            <div><dt>Mã HV</dt><dd><span className={styles.checkinMemberCode}>{log.memberCode}</span></dd></div>
            <div><dt>Tên HV</dt><dd>{log.name}</dd></div>
            <div><dt>SĐT</dt><dd>{log.phone}</dd></div>
            <div><dt>Giờ check-in</dt><dd className={styles.checkinTimeIn}>{log.checkInAt}</dd></div>
            <div><dt>Giờ check-out</dt><dd className={styles.checkinTimeOut}>{`${TODAY} ${NOW}`}</dd></div>
          </dl>
          {log.lockerCode ? (
            <div className={styles.checkinReturnLocker}>
              <KeyRound size={14} /> Sẽ tự động trả tủ <strong>{log.lockerCode}</strong>
            </div>
          ) : null}
        </div>
        <footer className={styles.checkinModalFooter}>
          <button className={styles.checkinBtnGhost} onClick={onCancel} type="button">Hủy</button>
          <button className={styles.checkinBtnConfirm} onClick={onConfirm} type="button">
            <LogOut size={14} /> Xác nhận checkout
          </button>
        </footer>
      </div>
    </div>
  );
}

// =====================================================================================
// SECTION I — Devices Tab
// =====================================================================================

function DevicesTab({
  columnsOpen,
  counts,
  devices,
  deviceSearch,
  onAddDevice,
  onBulkDelete,
  onCloseColumns,
  onDeleteDevice,
  onEditDevice,
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
  devices: Device[];
  deviceSearch: string;
  onAddDevice: () => void;
  onBulkDelete: () => void;
  onCloseColumns: () => void;
  onDeleteDevice: (id: string) => void;
  onEditDevice: (id: string) => void;
  onOpenColumns: () => void;
  onResetColumns: () => void;
  selectedDeviceIds: string[];
  setDeviceSearch: (value: string) => void;
  setSelectedDeviceIds: (ids: string[]) => void;
  setTypeFilter: (t: "all" | DeviceType) => void;
  setVisibleColumns: (value: Record<DeviceColumn, boolean>) => void;
  typeFilter: "all" | DeviceType;
  visibleColumns: Record<DeviceColumn, boolean>;
}) {
  const allVisibleSelected = devices.length > 0 && devices.every((d) => selectedDeviceIds.includes(d.id));
  const visibleCount = Object.values(visibleColumns).filter(Boolean).length;
  const deviceColumnLabels: Record<DeviceColumn, string> = {
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
      setSelectedDeviceIds(selectedDeviceIds.filter((id) => !devices.some((d) => d.id === id)));
      return;
    }
    setSelectedDeviceIds(Array.from(new Set([...selectedDeviceIds, ...devices.map((d) => d.id)])));
  };

  const toggleOne = (id: string) => {
    setSelectedDeviceIds(
      selectedDeviceIds.includes(id)
        ? selectedDeviceIds.filter((deviceId) => deviceId !== id)
        : [...selectedDeviceIds, id],
    );
  };

  return (
    <div className={styles.checkinDevicesPane}>
      <div className={styles.checkinDeviceHeader}>
        <div>
          <h3>Quản lý thiết bị</h3>
          <p>Máy chấm công, Face ID, quẹt thẻ kết nối qua IP, cổng và mật khẩu.</p>
        </div>
        <div className={styles.checkinDeviceTools}>
          <div className={styles.checkinSearch}>
            <Search size={16} />
            <input
              onChange={(e) => setDeviceSearch(e.target.value)}
              placeholder="Tìm tên máy, mã, IP, chi nhánh..."
              type="text"
              value={deviceSearch}
            />
          </div>
          <select
            className={styles.checkinSelectInput}
            onChange={(e) => setTypeFilter(e.target.value as "all" | DeviceType)}
            value={typeFilter}
          >
            <option value="all">Tất cả loại</option>
            <option value="ATTENDANCE">Chấm công</option>
            <option value="FACE">Face ID</option>
            <option value="CARD">Quẹt thẻ</option>
          </select>
          {selectedDeviceIds.length > 0 ? (
            <button className={styles.checkinBtnDanger} onClick={onBulkDelete} type="button">
              <Trash2 size={14} /> Xóa ({selectedDeviceIds.length})
            </button>
          ) : null}
          <button className={styles.checkinBtnGhost} onClick={onOpenColumns} type="button">
            <MoreVertical size={14} /> Cột
          </button>
          <button className={styles.checkinPrimary} onClick={onAddDevice} type="button">
            <PlusCircle size={16} /> Thêm mới
          </button>
        </div>
      </div>

      <div className={styles.checkinDeviceFilters}>
        {([
          { key: "all", label: "Tất cả", count: counts.total },
          { key: "ATTENDANCE", label: "Chấm công", count: counts.att, icon: <Power size={12} /> },
          { key: "FACE", label: "Face ID", count: counts.face, icon: <ScanFace size={12} /> },
          { key: "CARD", label: "Quẹt thẻ", count: counts.card, icon: <CreditCard size={12} /> },
        ] as const).map((f) => (
          <button
            className={`${styles.checkinDeviceFilter} ${typeFilter === f.key ? styles.checkinDeviceFilterActive : ""}`}
            key={f.key}
            onClick={() => setTypeFilter(f.key)}
            type="button"
          >
            {"icon" in f ? f.icon : null} {f.label} <span>[{f.count}]</span>
          </button>
        ))}
      </div>

      <div className={styles.checkinTableWrap}>
        <table className={styles.checkinTable}>
          <thead>
            <tr>
              <th>
                <input
                  aria-label="Chọn tất cả thiết bị"
                  checked={allVisibleSelected}
                  onChange={toggleAll}
                  type="checkbox"
                />
              </th>
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
            {devices.length === 0 ? (
              <tr>
                <td className={styles.checkinEmptyRow} colSpan={visibleCount + 3}>
                  Chưa có thiết bị nào. Bấm <button className={styles.checkinTextLink} onClick={onAddDevice} type="button">Thêm thiết bị</button> để cấu hình.
                </td>
              </tr>
            ) : (
              devices.map((d) => (
                <tr className={selectedDeviceIds.includes(d.id) ? styles.checkinSelectedRow : ""} key={d.id}>
                  <td>
                    <input
                      aria-label={`Chọn ${d.name}`}
                      checked={selectedDeviceIds.includes(d.id)}
                      onChange={() => toggleOne(d.id)}
                      type="checkbox"
                    />
                  </td>
                  <td>
                    <span className={`${styles.checkinDeviceBadge} ${
                      d.type === "FACE" ? styles.checkinDeviceBadgeFace
                        : d.type === "ATTENDANCE" ? styles.checkinDeviceBadgeAtt
                        : styles.checkinDeviceBadgeCard
                    }`}>
                      {d.type === "FACE" ? <ScanFace size={11} /> : d.type === "ATTENDANCE" ? <Power size={11} /> : <CreditCard size={11} />}
                      {d.type === "FACE" ? "Face ID" : d.type === "ATTENDANCE" ? "Chấm công" : "Quẹt thẻ"}
                    </span>
                  </td>
                  {visibleColumns.name ? <td><button className={styles.checkinDeviceNameBtn} onClick={() => onEditDevice(d.id)} type="button"><strong>{d.name}</strong></button>{d.isCoachOnly ? <small className={styles.checkinCoachOnly}> · PT</small> : null}</td> : null}
                  {visibleColumns.code ? <td><span className={styles.checkinDeviceCode}>{d.code}</span></td> : null}
                  {visibleColumns.port ? <td>{d.port}</td> : null}
                  {visibleColumns.ip ? <td><Wifi size={11} /> {d.ip}</td> : null}
                  {visibleColumns.password ? <td>••••••</td> : null}
                  {visibleColumns.branch ? <td>{d.branch}</td> : null}
                  {visibleColumns.status ? (
                    <td>
                      {d.online ? (
                        <span className={styles.checkinStatusActive}>● Online</span>
                      ) : (
                        <span className={styles.checkinStatusOffline}>● Offline</span>
                      )}
                    </td>
                  ) : null}
                  <td>
                    <div className={styles.checkinActionRow}>
                      <button className={styles.checkinIconBtn} onClick={() => onEditDevice(d.id)} title="Sửa" type="button"><Edit3 size={14} /></button>
                      <button className={`${styles.checkinIconBtn} ${styles.checkinIconBtnDanger}`} onClick={() => onDeleteDevice(d.id)} title="Xóa" type="button"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className={styles.checkinTableFooter}>
          <span>{selectedDeviceIds.length > 0 ? `Đã chọn ${selectedDeviceIds.length} / ${counts.total} thiết bị` : `Hiển thị ${devices.length} / ${counts.total} thiết bị`}</span>
          <span>Hiển thị {visibleCount}/7 cột</span>
        </div>
      </div>

      {columnsOpen ? (
        <div className={styles.modalOverlay} onClick={onCloseColumns}>
          <div className={`${styles.modalContent} ${styles.checkinColumnsModal}`} onClick={(e) => e.stopPropagation()}>
            <header className={styles.checkinModalHeader}>
              <div>
                <h3>Cấu hình cột</h3>
                <p>Ẩn/hiện các cột trong bảng thiết bị theo người dùng.</p>
              </div>
              <button className={styles.checkinBtnGhost} onClick={onResetColumns} type="button">Reset</button>
            </header>
            <div className={styles.checkinColumnGrid}>
              {(Object.keys(deviceColumnLabels) as DeviceColumn[]).map((key) => (
                <label className={styles.checkinCheckRow} key={key}>
                  <input
                    checked={visibleColumns[key]}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, [key]: e.target.checked })}
                    type="checkbox"
                  />
                  <span>{deviceColumnLabels[key]}</span>
                </label>
              ))}
            </div>
            <footer className={styles.checkinModalFooter}>
              <span className={styles.checkinShortcut}>Loại và Hành động luôn hiển thị</span>
              <button className={styles.checkinBtnConfirm} onClick={onCloseColumns} type="button">Áp dụng</button>
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DeviceFormModal({
  editingDevice,
  existingDevices,
  mode,
  onClose,
  onSave,
}: {
  editingDevice?: Device;
  existingDevices: Device[];
  mode: "create" | "edit";
  onClose: () => void;
  onSave: (d: Device) => void;
}) {
  const [type, setType] = useState<DeviceType>(editingDevice?.type ?? "FACE");
  const nextDeviceCode = (deviceType: DeviceType) => {
    const prefix = deviceType === "FACE" ? "FACE-CN" : deviceType === "ATTENDANCE" ? "ATT-CN" : "CARD-CN";
    const next = existingDevices.filter((d) => d.code.startsWith(prefix)).length + 1;
    return `${prefix}${next}`;
  };
  const [code, setCode] = useState(editingDevice?.code ?? nextDeviceCode("FACE"));
  const [name, setName] = useState(editingDevice?.name ?? "");
  const [port, setPort] = useState(String(editingDevice?.port ?? 4370));
  const [ip, setIp] = useState(editingDevice?.ip ?? "");
  const [password, setPassword] = useState(editingDevice?.password ?? "");
  const [branch, setBranch] = useState<string>(editingDevice?.branch ?? BRANCHES[0]);
  const [isCoachOnly, setIsCoachOnly] = useState(editingDevice?.isCoachOnly ?? false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (!code.trim()) next.code = "Bắt buộc";
    if (!name.trim()) next.name = "Bắt buộc";
    if (!ip.trim()) next.ip = "Bắt buộc";
    if (!password.trim()) next.password = "Nhập mật khẩu kết nối thiết bị";
    if (code.trim() && existingDevices.some((d) => d.id !== editingDevice?.id && d.code.toLowerCase() === code.trim().toLowerCase())) {
      next.code = "Mã máy đã tồn tại";
    }
    if (ip.trim() && !/^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/.test(ip.trim())) {
      next.ip = "IP không hợp lệ";
    }
    const p = parseInt(port, 10);
    if (isNaN(p) || p < 1 || p > 65535) next.port = "Cổng 1-65535";
    if (ip.trim() && existingDevices.some((d) => d.id !== editingDevice?.id && d.branch === branch && d.ip === ip.trim())) {
      next.ip = "IP đã tồn tại trong chi nhánh";
    }
    if (ip.trim() && !next.port && existingDevices.some((d) => d.id !== editingDevice?.id && d.ip === ip.trim() && d.port === p)) {
      next.port = "IP + cổng đã tồn tại";
    }
    return next;
  };

  const handleSave = () => {
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSave({
      id: editingDevice?.id ?? `D-${Math.floor(Math.random() * 9000) + 1000}`,
      type,
      code: code.trim(),
      name: name.trim(),
      port: parseInt(port, 10),
      ip: ip.trim(),
      password,
      branch,
      isCoachOnly,
      online: editingDevice?.online ?? true,
      lastSync: editingDevice?.lastSync ?? `${TODAY} ${NOW}`,
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modalContent} ${styles.checkinDeviceFormModal}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.checkinModalHeader}>
          <div>
            <h3>{mode === "create" ? "Thêm thiết bị mới" : "Chỉnh sửa thiết bị"}</h3>
            <p>Cấu hình kết nối máy phần cứng qua IP nội bộ</p>
          </div>
          <button className={styles.modalClose} onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <div className={styles.checkinDeviceFormBody}>
          {mode === "create" ? (
          <div className={styles.checkinTypeSelector}>
            {([
              { key: "ATTENDANCE", label: "Chấm công", icon: <Power size={16} /> },
              { key: "FACE", label: "Face ID", icon: <ScanFace size={16} /> },
              { key: "CARD", label: "Quẹt thẻ", icon: <CreditCard size={16} /> },
            ] as const).map((t) => (
              <button
                className={`${styles.checkinTypeOption} ${type === t.key ? styles.checkinTypeOptionActive : ""}`}
                key={t.key}
                onClick={() => {
                  setType(t.key);
                  setCode(nextDeviceCode(t.key));
                }}
                type="button"
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          ) : (
            <div className={styles.checkinLockedType}>
              Loại thiết bị không đổi sau khi tạo: <strong>{type === "FACE" ? "Face ID" : type === "ATTENDANCE" ? "Chấm công" : "Quẹt thẻ"}</strong>
            </div>
          )}

          <div className={styles.checkinDeviceGrid}>
            <label className={styles.checkinField}>
              <span>Mã máy <b>*</b></span>
              <input className={errors.code ? styles.checkinInputError : ""} onChange={(e) => setCode(e.target.value)} placeholder="VD: FACE-CN1" type="text" value={code} />
              {errors.code ? <small>{errors.code}</small> : null}
            </label>
            <label className={styles.checkinField}>
              <span>Tên máy <b>*</b></span>
              <input className={errors.name ? styles.checkinInputError : ""} onChange={(e) => setName(e.target.value)} placeholder="VD: Face cổng chính" type="text" value={name} />
              {errors.name ? <small>{errors.name}</small> : null}
            </label>
            <label className={styles.checkinField}>
              <span>Cổng <b>*</b></span>
              <input className={errors.port ? styles.checkinInputError : ""} onChange={(e) => setPort(e.target.value)} placeholder="4370" type="number" value={port} />
              {errors.port ? <small>{errors.port}</small> : null}
            </label>
            <label className={styles.checkinField}>
              <span>Địa chỉ IP <b>*</b></span>
              <input className={errors.ip ? styles.checkinInputError : ""} onChange={(e) => setIp(e.target.value)} placeholder="192.168.1.21" type="text" value={ip} />
              {errors.ip ? <small>{errors.ip}</small> : null}
            </label>
            <label className={styles.checkinField}>
              <span>Mật khẩu <b>*</b></span>
              <input className={errors.password ? styles.checkinInputError : ""} onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu thiết bị" type="password" value={password} />
              {errors.password ? <small>{errors.password}</small> : null}
            </label>
            <label className={styles.checkinField}>
              <span>Chi nhánh</span>
              <select onChange={(e) => setBranch(e.target.value)} value={branch}>
                {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </label>
            <label className={styles.checkinCheckRow}>
              <input checked={isCoachOnly} onChange={(e) => setIsCoachOnly(e.target.checked)} type="checkbox" />
              <span>Máy Check HLV (chỉ dùng cho HLV chấm công, không phải HV check-in)</span>
            </label>
          </div>
        </div>
        <footer className={styles.checkinModalFooter}>
          <button className={styles.checkinBtnGhost} onClick={onClose} type="button">Hủy</button>
          <button className={styles.checkinBtnConfirm} onClick={handleSave} type="button">Lưu</button>
        </footer>
      </div>
    </div>
  );
}

function DeleteDeviceDialog({
  count,
  device,
  onCancel,
  onConfirm,
}: {
  count?: number;
  device?: Device;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div
        className={`${styles.modalContent} ${styles.checkinCheckoutDialog}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.checkinModalHeader}>
          <div>
            <h3>Xác nhận xóa thiết bị</h3>
            <p>Thao tác này không thể hoàn tác</p>
          </div>
        </header>
        <div className={styles.checkinCheckoutBody}>
          <p>
            {count
              ? `Bạn có chắc chắn muốn xóa ${count} thiết bị đã chọn?`
              : <>Bạn có chắc chắn xóa thiết bị <strong>&quot;{device?.name}&quot;</strong> ({device?.code}) không?</>}
          </p>
          <p>Thiết bị đã có CheckinLog sẽ được soft delete để giữ lịch sử vận hành.</p>
        </div>
        <footer className={styles.checkinModalFooter}>
          <button className={styles.checkinBtnGhost} onClick={onCancel} type="button">Hủy</button>
          <button className={styles.checkinBtnDanger} onClick={onConfirm} type="button"><Trash2 size={14} /> Xóa</button>
        </footer>
      </div>
    </div>
  );
}

function CheckinReceiptModal({
  onClose,
  receipt,
}: {
  onClose: () => void;
  receipt: CheckinReceipt;
}) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modalContent} ${styles.checkinReceiptModal}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.checkinModalHeader}>
          <div>
            <h3>Bill dịch vụ check-in</h3>
            <p>{receipt.id} · {receipt.memberCode} · {receipt.name}</p>
          </div>
          <button className={styles.modalClose} onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <div className={styles.checkinReceiptBody}>
          <div className={styles.checkinReceiptQr}>
            <div aria-label="Mã QR thanh toán">
              {Array.from({ length: 49 }).map((_, index) => (
                <span key={index} />
              ))}
            </div>
            <span>QR giao dịch {receipt.id}</span>
          </div>
          <table className={styles.checkinAddonTable}>
            <thead>
              <tr><th>Dịch vụ</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr>
            </thead>
            <tbody>
              {receipt.addons.map((addon) => (
                <tr key={addon.serviceId}>
                  <td>{addon.name}</td>
                  <td>{addon.quantity}</td>
                  <td>{addon.price.toLocaleString("vi-VN")}đ</td>
                  <td>{(addon.price * addon.quantity).toLocaleString("vi-VN")}đ</td>
                </tr>
              ))}
              <tr className={styles.checkinAddonTotal}>
                <td colSpan={3}>Tổng thanh toán · {receipt.paymentMethod}</td>
                <td>{receipt.total.toLocaleString("vi-VN")}đ</td>
              </tr>
            </tbody>
          </table>
          <p>Phiếu thu nháp đã được sinh sang Module 10 Sổ Quỹ theo luồng M09.</p>
        </div>
        <footer className={styles.checkinModalFooter}>
          <button className={styles.checkinBtnGhost} onClick={onClose} type="button">Bỏ qua</button>
          <button className={styles.checkinBtnConfirm} onClick={onClose} type="button">
            <CreditCard size={14} /> Xác nhận & In bill
          </button>
        </footer>
      </div>
    </div>
  );
}

// =====================================================================================
// SECTION J — Config Tab
// =====================================================================================

function ConfigTab({
  config,
  devices,
  onUpdate,
}: {
  config: CheckinConfig;
  devices: Device[];
  onUpdate: <K extends keyof CheckinConfig>(key: K, value: CheckinConfig[K]) => void;
}) {
  return (
    <div className={styles.checkinConfigPane}>
      <ConfigSection icon={<Power size={16} />} title="Cấu hình máy chấm công">
        <ToggleRow desc="Bật/tắt kết nối với máy chấm công" label="Kết nối chấm công" onChange={(v) => onUpdate("machineEnabled", v)} value={config.machineEnabled} />
        <SelectRow
          desc="Chọn máy chấm công áp dụng"
          label="Chọn thiết bị"
          onChange={(v) => onUpdate("machineDeviceId", v)}
          options={[{ value: "", label: "— Chưa chọn —" }, ...devices.filter((d) => d.type === "ATTENDANCE").map((d) => ({ value: d.id, label: `${d.name} (${d.code})` }))]}
          value={config.machineDeviceId}
        />
        <ToggleRow desc="Đồng bộ giờ máy với server" label="Tự động cập nhật thời gian máy" onChange={(v) => onUpdate("syncTime", v)} value={config.syncTime} />
        <NumberRow
          desc="0 = không tự khởi động"
          label="Tự động khởi động lại Server (phút)"
          onChange={(v) => onUpdate("autoRestartMinutes", v)}
          value={config.autoRestartMinutes}
        />
        <ToggleRow desc="Hiện thông báo trước khi tự reboot" label="Cảnh báo trước khi khởi động" onChange={(v) => onUpdate("warnBeforeRestart", v)} value={config.warnBeforeRestart} />
        <TimeRow desc="Giờ sân bắt đầu hoạt động" label="Thời gian mở cửa" onChange={(v) => onUpdate("openDoorTime", v)} value={config.openDoorTime} />
        <ToggleRow desc="Cho phép đăng ký FaceID từ máy" label="Đăng ký Face ID" onChange={(v) => onUpdate("registerFaceFromMachine", v)} value={config.registerFaceFromMachine} />
        <ToggleRow desc="Cho phép đăng ký Vân tay từ máy" label="Đăng ký Vân tay" onChange={(v) => onUpdate("registerFingerFromMachine", v)} value={config.registerFingerFromMachine} />
        <ToggleRow desc="Tự động ping server kiểm tra kết nối" label="Kiểm tra kết nối Server" onChange={(v) => onUpdate("pingServer", v)} value={config.pingServer} />
        <ToggleRow desc="Tắt service khi đăng xuất ứng dụng" label="Tắt Server khi đăng xuất" onChange={(v) => onUpdate("shutdownOnLogout", v)} value={config.shutdownOnLogout} />
      </ConfigSection>

      <ConfigSection icon={<User size={16} />} title="Check-in Member (Hội viên)">
        <ToggleRow desc="Hiện popup xác nhận khi HV check-in" label="Popup Check-in" onChange={(v) => onUpdate("memberPopupEnabled", v)} value={config.memberPopupEnabled} />
        <ToggleRow desc="Tự động đóng popup sau N giây" label="Tự đóng Popup Check-in" onChange={(v) => onUpdate("memberPopupAutoClose", v)} value={config.memberPopupAutoClose} />
        <NumberRow desc="Mặc định 3 giây" label="Thời gian popup (s)" onChange={(v) => onUpdate("memberPopupSeconds", v)} value={config.memberPopupSeconds} />
        <ToggleRow desc="Cho vào nếu HĐ trong grace period" label="Cho vào nếu còn hạn (grace)" onChange={(v) => onUpdate("memberAllowExpired", v)} value={config.memberAllowExpired} />
        <ToggleRow desc="Bỏ qua kiểm tra khung giờ" label="Cho vào cả khi sai giờ" onChange={(v) => onUpdate("memberAllowWrongTime", v)} value={config.memberAllowWrongTime} />
        <ToggleRow desc="Bật tính năng checkout" label="Checkout" onChange={(v) => onUpdate("memberCheckoutEnabled", v)} value={config.memberCheckoutEnabled} />
        <ToggleRow desc="Hiện popup khi checkout" label="Popup Checkout" onChange={(v) => onUpdate("memberPopupCheckoutEnabled", v)} value={config.memberPopupCheckoutEnabled} />
        <ToggleRow desc="Tự động đóng popup checkout" label="Tự đóng Popup Checkout" onChange={(v) => onUpdate("memberPopupCheckoutAutoClose", v)} value={config.memberPopupCheckoutAutoClose} />
        <NumberRow desc="Mặc định 3 giây" label="Thời gian popup checkout (s)" onChange={(v) => onUpdate("memberPopupCheckoutSeconds", v)} value={config.memberPopupCheckoutSeconds} />
        <ToggleRow desc="Tự động checkout HV theo giờ đặt trước" label="Tự động Checkout" onChange={(v) => onUpdate("memberAutoCheckout", v)} value={config.memberAutoCheckout} />
      </ConfigSection>

      <ConfigSection icon={<ShieldCheck size={16} />} title="Check-in HLV">
        <ToggleRow desc="Hiện popup xác nhận khi HLV check-in" label="Popup Check-in HLV" onChange={(v) => onUpdate("coachPopupEnabled", v)} value={config.coachPopupEnabled} />
        <ToggleRow desc="Tự đóng popup sau N giây" label="Tự đóng Popup HLV" onChange={(v) => onUpdate("coachPopupAutoClose", v)} value={config.coachPopupAutoClose} />
        <NumberRow desc="Mặc định 3 giây" label="Thời gian popup HLV (s)" onChange={(v) => onUpdate("coachPopupSeconds", v)} value={config.coachPopupSeconds} />
        <ToggleRow desc="Cho vào nếu HLV còn hạn HĐ" label="Cho vào nếu còn hạn" onChange={(v) => onUpdate("coachAllowExpired", v)} value={config.coachAllowExpired} />
        <ToggleRow desc="Override khung giờ" label="Cho vào cả khi sai giờ" onChange={(v) => onUpdate("coachAllowWrongTime", v)} value={config.coachAllowWrongTime} />
        <ToggleRow desc="Bật tính năng checkout cho HLV" label="Checkout HLV" onChange={(v) => onUpdate("coachCheckoutEnabled", v)} value={config.coachCheckoutEnabled} />
        <ToggleRow desc="Hiện popup khi checkout" label="Popup Checkout HLV" onChange={(v) => onUpdate("coachPopupCheckoutEnabled", v)} value={config.coachPopupCheckoutEnabled} />
        <ToggleRow desc="Tự động đóng popup checkout HLV" label="Tự đóng Popup Checkout HLV" onChange={(v) => onUpdate("coachPopupCheckoutAutoClose", v)} value={config.coachPopupCheckoutAutoClose} />
        <ToggleRow desc="Tự động checkout HLV cuối ca" label="Tự động Checkout HLV" onChange={(v) => onUpdate("coachAutoCheckout", v)} value={config.coachAutoCheckout} />
        <ToggleRow desc="HLV phải có lịch đặt trước mới check-in được" label="Phải Book HLV trước" onChange={(v) => onUpdate("coachMustBookFirst", v)} value={config.coachMustBookFirst} />
        <ToggleRow desc="Cập nhật trạng thái buổi tập khi HLV check-in" label="Cập nhật buổi đầy khi có HLV check-in" onChange={(v) => onUpdate("coachAutoUpdateBooking", v)} value={config.coachAutoUpdateBooking} />
        <ToggleRow desc="Tự gán HLV theo lịch đã book" label="Tự động chọn HLV theo HLV đã book" onChange={(v) => onUpdate("coachAutoSelectFromBooking", v)} value={config.coachAutoSelectFromBooking} />
      </ConfigSection>

      <ConfigSection icon={<Settings size={16} />} title="Thiết lập Check-in">
        <NumberRow desc="Grace period sau khi HĐ hết hạn (ngày)" label="Cho phép check-in khi hết hạn không quá" onChange={(v) => onUpdate("graceDaysAfterExpired", v)} value={config.graceDaysAfterExpired} suffix="ngày" />
        <ToggleRow desc="Áp dụng giới hạn lượt/ngày của gói" label="Kiểm tra số lần tập/ngày (tuần)" onChange={(v) => onUpdate("enforceDailyLimit", v)} value={config.enforceDailyLimit} />
        <ToggleRow desc="Override toàn bộ kiểm tra khung giờ" label="Cho phép check-in sai giờ" onChange={(v) => onUpdate("allowWrongTime", v)} value={config.allowWrongTime} />
      </ConfigSection>

      <ConfigSection icon={<AlertTriangle size={16} />} title="Thiết lập Popup">
        <NumberRow desc="0 = không tự đóng popup lỗi" label="Thời gian popup ERROR (s)" onChange={(v) => onUpdate("errorPopupSeconds", v)} value={config.errorPopupSeconds} />
        <ToggleRow desc="Hiện service chấm công trong popup" label="Popup service chấm công" onChange={(v) => onUpdate("popupServiceAttendance", v)} value={config.popupServiceAttendance} />
        <ToggleRow desc="Hiện ghi chú HV trong popup" label="Popup service ghi chú hội viên" onChange={(v) => onUpdate("popupServiceMemberNote", v)} value={config.popupServiceMemberNote} />
      </ConfigSection>

      <ConfigSection icon={<MoreVertical size={16} />} title="Thiết lập khác">
        <ToggleRow desc="Checkout sẽ tự động trả tủ đồ đang mượn" label="Tự động trả mượn tủ khi checkout" onChange={(v) => onUpdate("autoReturnLockerOnCheckout", v)} value={config.autoReturnLockerOnCheckout} />
        <ToggleRow desc="Kết nối điều khiển cửa tự động" label="Chạy điều khiển cửa tùy chỉnh" onChange={(v) => onUpdate("customDoorControl", v)} value={config.customDoorControl} />
        <NumberRow desc="Mặc định 10 giây" label="Thời gian hiển thị màn hình hội viên (s)" onChange={(v) => onUpdate("memberScreenSeconds", v)} value={config.memberScreenSeconds} />
      </ConfigSection>
    </div>
  );
}

function ConfigSection({ children, icon, title }: { children: React.ReactNode; icon: React.ReactNode; title: string }) {
  return (
    <section className={styles.checkinConfigSection}>
      <header>{icon} <h4>{title}</h4></header>
      <div className={styles.checkinConfigRows}>{children}</div>
    </section>
  );
}

function ToggleRow({ desc, label, onChange, value }: { desc: string; label: string; onChange: (v: boolean) => void; value: boolean }) {
  return (
    <label className={styles.checkinConfigRow}>
      <div>
        <strong>{label}</strong>
        <small>{desc}</small>
      </div>
      <button
        className={`${styles.checkinSwitch} ${value ? styles.checkinSwitchOn : ""}`}
        onClick={() => onChange(!value)}
        type="button"
      >
        <span />
      </button>
    </label>
  );
}

function NumberRow({ desc, label, onChange, suffix, value }: { desc: string; label: string; onChange: (v: number) => void; suffix?: string; value: number }) {
  return (
    <label className={styles.checkinConfigRow}>
      <div>
        <strong>{label}</strong>
        <small>{desc}</small>
      </div>
      <div className={styles.checkinNumberWrap}>
        <input min={0} onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)} type="number" value={value} />
        {suffix ? <span>{suffix}</span> : null}
      </div>
    </label>
  );
}

function TimeRow({ desc, label, onChange, value }: { desc: string; label: string; onChange: (v: string) => void; value: string }) {
  return (
    <label className={styles.checkinConfigRow}>
      <div>
        <strong>{label}</strong>
        <small>{desc}</small>
      </div>
      <input className={styles.checkinTimeInput} onChange={(e) => onChange(e.target.value)} type="time" value={value} />
    </label>
  );
}

function SelectRow({ desc, label, onChange, options, value }: { desc: string; label: string; onChange: (v: string) => void; options: { value: string; label: string }[]; value: string }) {
  return (
    <label className={styles.checkinConfigRow}>
      <div>
        <strong>{label}</strong>
        <small>{desc}</small>
      </div>
      <select className={styles.checkinSelectInput} onChange={(e) => onChange(e.target.value)} value={value}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

// =====================================================================================
// SECTION K — Biometric Tab
// =====================================================================================

function BiometricTab({
  bioCategory,
  bioSearch,
  counts,
  filteredBio,
  onOpenRegister,
  setBioCategory,
  setBioSearch,
}: {
  bioCategory: "member" | "agent";
  bioSearch: string;
  counts: { face: number; finger: number; card: number; total: number; members: number; agents: number };
  filteredBio: BiometricRecord[];
  onOpenRegister: (memberCode: string, type: "FACE" | "FINGER" | "CARD") => void;
  setBioCategory: (v: "member" | "agent") => void;
  setBioSearch: (v: string) => void;
}) {
  return (
    <>
      <div className={styles.checkinBioKpi}>
        <article>
          <ScanFace size={18} />
          <div>
            <span>Đã đăng ký Face ID</span>
            <strong>{counts.face} / {counts.total}</strong>
          </div>
        </article>
        <article>
          <Fingerprint size={18} />
          <div>
            <span>Đã đăng ký Vân tay</span>
            <strong>{counts.finger} / {counts.total}</strong>
          </div>
        </article>
        <article>
          <CreditCard size={18} />
          <div>
            <span>Đã đăng ký Thẻ</span>
            <strong>{counts.card} / {counts.total}</strong>
          </div>
        </article>
        <article>
          <Users size={18} />
          <div>
            <span>Tổng hội viên</span>
            <strong>{counts.total}</strong>
          </div>
        </article>
      </div>

      <div className={styles.checkinFilterRow}>
        <div className={styles.checkinChips}>
          <button className={`${styles.checkinChip} ${bioCategory === "member" ? styles.checkinChipActive : ""}`} onClick={() => setBioCategory("member")} type="button">
            Hội viên ({counts.members})
          </button>
          <button className={`${styles.checkinChip} ${bioCategory === "agent" ? styles.checkinChipActive : ""}`} onClick={() => setBioCategory("agent")} type="button">
            Agent ({counts.agents})
          </button>
        </div>
        <div className={styles.checkinSearch}>
          <Search size={16} />
          <input
            onChange={(e) => setBioSearch(e.target.value)}
            placeholder="Tìm theo mã / tên / SĐT..."
            type="text"
            value={bioSearch}
          />
        </div>
      </div>

      <div className={styles.checkinTableWrap}>
        <table className={styles.checkinTable}>
          <thead>
            <tr>
              <th>Mã</th>
              <th>Tên</th>
              <th>SĐT</th>
              <th>Face ID</th>
              <th>Vân tay</th>
              <th>Thẻ</th>
              <th>Thiết bị đăng ký</th>
            </tr>
          </thead>
          <tbody>
            {filteredBio.map((b) => (
              <tr key={b.memberCode}>
                <td><span className={styles.checkinMemberCode}>{b.memberCode}</span></td>
                <td><strong>{b.name}</strong></td>
                <td>{b.phone}</td>
                <td>
                  {b.faceRegistered ? (
                    <span className={styles.checkinBioOk}><CheckCircle2 size={11} /> Đã đăng ký</span>
                  ) : (
                    <button className={styles.checkinBioRegister} onClick={() => onOpenRegister(b.memberCode, "FACE")} type="button">
                      <ScanFace size={11} /> Đăng ký
                    </button>
                  )}
                </td>
                <td>
                  {b.fingerRegistered ? (
                    <span className={styles.checkinBioOk}><CheckCircle2 size={11} /> Đã đăng ký</span>
                  ) : (
                    <button className={styles.checkinBioRegister} onClick={() => onOpenRegister(b.memberCode, "FINGER")} type="button">
                      <Fingerprint size={11} /> Đăng ký
                    </button>
                  )}
                </td>
                <td>
                  {b.cardRegistered ? (
                    <span className={styles.checkinBioOk}><CheckCircle2 size={11} /> {b.cardCode ?? "Đã có"}</span>
                  ) : (
                    <button className={styles.checkinBioRegister} onClick={() => onOpenRegister(b.memberCode, "CARD")} type="button">
                      <IdCard size={11} /> Đăng ký
                    </button>
                  )}
                </td>
                <td>{b.registeredDevice ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function BiometricRegisterModal({
  devices,
  memberCode,
  memberName,
  onClose,
  onComplete,
  type,
}: {
  devices: Device[];
  memberCode: string;
  memberName: string;
  onClose: () => void;
  onComplete: (memberCode: string, type: "FACE" | "FINGER" | "CARD", deviceCode: string, cardCode?: string) => void;
  type: "FACE" | "FINGER" | "CARD";
}) {
  const eligibleDevices = devices.filter((d) =>
    type === "FACE" ? d.type === "FACE" : type === "FINGER" ? d.type === "ATTENDANCE" : d.type === "CARD",
  );
  const [deviceCode, setDeviceCode] = useState<string>(eligibleDevices[0]?.code ?? "");
  const [cardCode, setCardCode] = useState("");
  const [cardKind, setCardKind] = useState("RFID Mifare 13.56MHz");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"setup" | "scanning" | "done">("setup");

  const startRegister = () => {
    const next: Record<string, string> = {};
    if (type !== "CARD" && !deviceCode) next.deviceCode = "Chọn thiết bị đăng ký";
    if (type === "CARD" && !cardCode.trim()) next.cardCode = "Quẹt thẻ hoặc nhập mã thẻ";
    if (type === "CARD" && !/^[A-Z0-9-]{6,24}$/i.test(cardCode.trim())) next.cardCode = "Mã thẻ 6-24 ký tự, chỉ gồm chữ, số hoặc dấu gạch";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    if (type === "CARD") {
      setStep("done");
    } else {
      setStep("scanning");
    }
  };

  const finish = () => {
    onComplete(memberCode, type, deviceCode, type === "CARD" ? cardCode : undefined);
  };

  const Icon = type === "FACE" ? ScanFace : type === "FINGER" ? Fingerprint : IdCard;
  const title = type === "FACE" ? "Đăng ký Face ID" : type === "FINGER" ? "Đăng ký Vân tay" : "Đăng ký Thẻ";

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modalContent} ${styles.checkinBioModal}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.checkinModalHeader}>
          <div>
            <h3>{title}</h3>
            <p>{memberCode} · {memberName}</p>
          </div>
          <button className={styles.modalClose} onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <div className={styles.checkinBioBody}>
          <div className={styles.checkinBioVisual}>
            <Icon size={64} />
          </div>

          {step === "setup" ? (
            <>
              {type !== "CARD" ? (
                <label className={styles.checkinField}>
                  <span>Chọn thiết bị {type === "FACE" ? "camera" : "máy quét"}</span>
                  <select className={errors.deviceCode ? styles.checkinInputError : ""} onChange={(e) => setDeviceCode(e.target.value)} value={deviceCode}>
                    <option value="">Chọn thiết bị</option>
                    {eligibleDevices.map((d) => (
                      <option key={d.id} value={d.code}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                  {errors.deviceCode ? <small>{errors.deviceCode}</small> : null}
                </label>
              ) : (
                <div className={styles.checkinBioCardGrid}>
                  <label className={styles.checkinField}>
                    <span>Số thẻ <b>*</b></span>
                    <input
                      autoFocus
                      className={errors.cardCode ? styles.checkinInputError : ""}
                      onChange={(e) => setCardCode(e.target.value.toUpperCase())}
                      placeholder="Quẹt thẻ hoặc nhập tay"
                      type="text"
                      value={cardCode}
                    />
                    {errors.cardCode ? <small>{errors.cardCode}</small> : null}
                  </label>
                  <label className={styles.checkinField}>
                    <span>Loại thẻ <b>*</b></span>
                    <select onChange={(e) => setCardKind(e.target.value)} value={cardKind}>
                      <option>RFID Mifare 13.56MHz</option>
                      <option>Thẻ từ 125KHz</option>
                      <option>Barcode / QR nội bộ</option>
                    </select>
                  </label>
                </div>
              )}
              <p className={styles.checkinBioHint}>
                {type === "FACE"
                  ? "HV nhìn thẳng vào camera, giữ khoảng cách 30-50cm. Hệ thống sẽ chụp 3 góc khuôn mặt."
                  : type === "FINGER"
                  ? "HV đặt ngón trỏ lên máy quét. Lặp lại 3 lần để hệ thống lấy mẫu chính xác."
                  : `Quẹt ${cardKind} vào đầu đọc hoặc nhập mã in trên thẻ.`}
              </p>
              <button className={styles.checkinBtnConfirm} onClick={startRegister} type="button">
                Bắt đầu đăng ký
              </button>
            </>
          ) : null}

          {step === "scanning" ? (
            <>
              <div className={styles.checkinBioProgress}>
                <div className={styles.checkinBioPulse} />
              </div>
              <p className={styles.checkinBioHint}>
                {type === "FACE" ? "Đang quét khuôn mặt — giữ nguyên tư thế..." : "Đang quét vân tay — giữ ngón tay cố định..."}
              </p>
              <button className={styles.checkinBtnConfirm} onClick={() => setStep("done")} type="button">
                Quét xong
              </button>
            </>
          ) : null}

          {step === "done" ? (
            <>
              <div className={styles.checkinBioOkLarge}>
                <CheckCircle2 size={48} />
                <strong>Đăng ký thành công!</strong>
                <span>Dữ liệu đã được lưu vào thiết bị {deviceCode || cardCode}</span>
              </div>
              <button className={styles.checkinBtnConfirm} onClick={finish} type="button">
                Hoàn tất
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

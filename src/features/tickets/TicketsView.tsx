"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Edit3,
  Eye,
  Gift,
  Hash,
  MoreVertical,
  Plus,
  PlusCircle,
  Power,
  Printer,
  QrCode,
  Receipt,
  RefreshCcw,
  Search,
  ShoppingBag,
  Sparkles,
  Tag,
  Ticket as TicketIcon,
  Trash2,
  Upload,
  User,
  UserPlus,
  Users,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import styles from "@/shared/styles/feature-styles.module.css";
import { FeaturePage } from "@/shared/components";

// =====================================================================================
// SECTION A — Constants
// =====================================================================================

const BRANCHES = ["NextVision", "Hà Nội Center", "Sài Gòn West"] as const;

const STAFF_LIST = [
  "Nguyễn Thị Lan",
  "Phạm Văn Đức",
  "Hoàng Mỹ Linh",
  "Trần Quốc Bảo",
  "Nguyễn Văn Thành",
  "Đỗ Hồng Quân",
] as const;

const PAYMENT_METHODS = ["Tiền mặt", "Chuyển khoản", "Thẻ"] as const;
const VAT_OPTIONS = [0, 5, 8, 10] as const;

const BANK_ACCOUNTS = [
  { id: "BANK-VCB", label: "Vietcombank · 0071000123456" },
  { id: "BANK-TCB", label: "Techcombank · 1903567890" },
  { id: "BANK-MB", label: "MB Bank · 0019999988" },
] as const;

const POS_DEVICES = [
  { id: "POS-Q1", label: "POS Quầy 1 (Vietcombank)" },
  { id: "POS-Q2", label: "POS Quầy 2 (Techcombank)" },
  { id: "POS-VIP", label: "POS VIP Lounge (MB)" },
] as const;

const CASH_FUNDS = [
  { id: "CASH-FRONT", label: "Quỹ tiền mặt tại quầy" },
  { id: "CASH-VIP", label: "Quỹ tiền mặt VIP" },
] as const;

// 10 màu cho service category badge (theo SRS)
const COLOR_PALETTE = [
  { key: "purple", label: "Tím", bg: "#f3e8ff", fg: "#7e22ce", dot: "#a855f7" },
  { key: "orange", label: "Cam", bg: "#fed7aa", fg: "#c2410c", dot: "#f97316" },
  { key: "blue", label: "Xanh dương", bg: "#dbeafe", fg: "#1d4ed8", dot: "#3b82f6" },
  { key: "green", label: "Xanh lá", bg: "#dcfce7", fg: "#15803d", dot: "#22c55e" },
  { key: "pink", label: "Hồng", bg: "#fce7f3", fg: "#be185d", dot: "#ec4899" },
  { key: "yellow", label: "Vàng", bg: "#fef9c3", fg: "#a16207", dot: "#eab308" },
  { key: "red", label: "Đỏ", bg: "#fee2e2", fg: "#b91c1c", dot: "#ef4444" },
  { key: "indigo", label: "Chàm", bg: "#e0e7ff", fg: "#4338ca", dot: "#6366f1" },
  { key: "teal", label: "Xanh ngọc", bg: "#ccfbf1", fg: "#0f766e", dot: "#14b8a6" },
  { key: "cyan", label: "Xanh lơ", bg: "#cffafe", fg: "#0e7490", dot: "#06b6d4" },
] as const;

type ColorKey = (typeof COLOR_PALETTE)[number]["key"];

// =====================================================================================
// SECTION B — Types
// =====================================================================================

type ServiceCategory = {
  id: string;
  name: string;
  code: string;
  color: ColorKey;
  description: string;
};

type ServiceItem = {
  code: string;
  name: string;
  categoryId: string;
  durationHours: number;
  prices: { weekday: number; weekend: number; holiday: number; peak: number };
  needsTeeTime: boolean;
  status: "active" | "paused";
};

type CustomerLite = {
  code: string;
  name: string;
  phone: string;
  email?: string;
  cccd?: string;
  birthDate?: string;
  gender?: "Nam" | "Nữ";
  address?: string;
  isMember?: boolean;
  loyaltyPoints?: number;
};

type AddonCatalogItem = {
  id: string;
  name: string;
  unitPrice: number;
  vatPercent: number;
  description?: string;
  category: "Caddie" | "Phương tiện" | "Trang bị" | "F&B" | "Khác";
};

type TicketAddonLine = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  vatPercent: number;
  discount: number;
  note?: string;
  fromCatalog: boolean;
  catalogId?: string;
};

type Voucher = {
  code: string;
  name: string;
  description: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  maxDiscount?: number;
  minOrder?: number;
  applyToCategoryIds: string[];
  quantity: number;
  quantityUsed: number;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt: string;
};

type PaymentEntry = {
  id: string;
  method: "Tiền mặt" | "Chuyển khoản" | "Thẻ";
  amount: number;
  account?: string;
  txRef?: string;
};

type GroupMember = {
  id: string;
  customerCode: string;
  serviceCode: string;
  ticketDate: string;
  teeTime?: string;
  bayCount: number;
  guestCount: number;
  manualDiscount: number;
  discountKind: "percent" | "amount";
  addons: TicketAddonLine[];
  note?: string;
};

type TicketStatus = "pending" | "confirmed" | "cancelled";

type TicketHistoryEntry = {
  date: string;
  actor: string;
  action: string;
  detail?: string;
};

type Ticket = {
  id: string;
  type: "single" | "group";
  customerCode?: string;
  serviceCode?: string;
  ticketDate?: string;
  teeTime?: string;
  durationHours?: number;
  guestCount?: number;
  bayCount?: number;
  members?: GroupMember[];
  staff: string;
  basePrice: number;
  vatPercent: number;
  manualDiscount: number;
  discountKind?: "percent" | "amount";
  voucherCode?: string;
  voucherDiscount: number;
  addons: TicketAddonLine[];
  totalAmount: number;
  payments: PaymentEntry[];
  paid: number;
  cashAtCounter?: boolean;
  note?: string;
  status: TicketStatus;
  createdAt: string;
  createdBy: string;
  branch: string;
  cancellationReason?: string;
  cancelledAt?: string;
  history: TicketHistoryEntry[];
};

type TabKey = "tickets" | "vouchers" | "addons";
type TicketTypeFilter = "all" | "single" | "group";
type StatusFilter = "all" | "pending" | "confirmed" | "cancelled";
type DateFilter = "all" | "today" | "7days" | "30days";

// =====================================================================================
// SECTION C — Mock seed data
// =====================================================================================

const INITIAL_CATEGORIES: ServiceCategory[] = [
  { id: "CAT-TEE", name: "Teetime", code: "TEETIME", color: "green", description: "Đặt giờ ra sân golf 9/18 hố" },
  { id: "CAT-PRA", name: "Practice", code: "PRACTICE", color: "blue", description: "Driving range, putting green, chipping" },
  { id: "CAT-COMBO", name: "Combo", code: "COMBO", color: "purple", description: "Combo Teetime + Caddie / Practice + Banh" },
  { id: "CAT-EVT", name: "Event", code: "EVENT", color: "pink", description: "Vé sự kiện, giải đấu" },
  { id: "CAT-CADDIE", name: "Caddie", code: "CADDIE", color: "orange", description: "Vé thuê caddie độc lập" },
  { id: "CAT-BAG", name: "Gửi gậy", code: "BAGSTORAGE", color: "indigo", description: "Phí gửi gậy/bao gậy tại CLB" },
];

const INITIAL_SERVICES: ServiceItem[] = [
  { code: "T001", name: "Teetime 18 Holes - Standard", categoryId: "CAT-TEE", durationHours: 4, prices: { weekday: 850_000, weekend: 1_200_000, holiday: 1_500_000, peak: 1_600_000 }, needsTeeTime: true, status: "active" },
  { code: "T002", name: "Teetime 9 Holes Quick", categoryId: "CAT-TEE", durationHours: 2, prices: { weekday: 450_000, weekend: 650_000, holiday: 800_000, peak: 850_000 }, needsTeeTime: true, status: "active" },
  { code: "T003", name: "Practice 1h Standard", categoryId: "CAT-PRA", durationHours: 1, prices: { weekday: 120_000, weekend: 180_000, holiday: 220_000, peak: 250_000 }, needsTeeTime: false, status: "active" },
  { code: "T004", name: "Practice 30p Quick", categoryId: "CAT-PRA", durationHours: 0.5, prices: { weekday: 70_000, weekend: 100_000, holiday: 130_000, peak: 150_000 }, needsTeeTime: false, status: "active" },
  { code: "T005", name: "Combo Caddie + Teetime", categoryId: "CAT-COMBO", durationHours: 4, prices: { weekday: 1_100_000, weekend: 1_500_000, holiday: 1_900_000, peak: 2_000_000 }, needsTeeTime: true, status: "active" },
  { code: "T006", name: "Combo Cha + Con (2 người)", categoryId: "CAT-COMBO", durationHours: 3, prices: { weekday: 1_500_000, weekend: 2_200_000, holiday: 2_800_000, peak: 3_000_000 }, needsTeeTime: true, status: "active" },
  { code: "T007", name: "Group of 4 Special", categoryId: "CAT-TEE", durationHours: 4, prices: { weekday: 3_000_000, weekend: 4_400_000, holiday: 5_500_000, peak: 6_000_000 }, needsTeeTime: true, status: "active" },
  { code: "T008", name: "Voucher Trial Day", categoryId: "CAT-PRA", durationHours: 8, prices: { weekday: 350_000, weekend: 500_000, holiday: 600_000, peak: 650_000 }, needsTeeTime: false, status: "active" },
];

const INITIAL_CUSTOMERS: CustomerLite[] = [
  { code: "HV001", name: "Nguyễn Văn A", phone: "0901234567", email: "nguyenvana@gmail.com", cccd: "079098001234", birthDate: "15/05/1990", gender: "Nam", address: "12 Lê Lợi, Q.1, TP.HCM", isMember: true, loyaltyPoints: 1240 },
  { code: "HV002", name: "Trần Thị B", phone: "0902345678", email: "tranthib@gmail.com", cccd: "079098002345", birthDate: "20/08/1995", gender: "Nữ", address: "45 Pasteur, Q.3, TP.HCM", isMember: true, loyaltyPoints: 320 },
  { code: "HV003", name: "Lê Văn C", phone: "0923456789", email: "levanc@gmail.com", birthDate: "10/12/1988", gender: "Nam", address: "78 Nguyễn Trãi, Q.5, TP.HCM", isMember: false, loyaltyPoints: 80 },
  { code: "HV005", name: "Huỳnh Xuân Long", phone: "0910070932", email: "longhx@gmail.com", birthDate: "06/08/1975", gender: "Nam", address: "210 Trần Hưng Đạo, Q.5, TP.HCM", isMember: true, loyaltyPoints: 5420 },
  { code: "HV012", name: "Đỗ Mai Hương", phone: "0345678901", email: "huongdm@gmail.com", birthDate: "11/02/1993", gender: "Nữ", address: "8 CMT8, Q.3, TP.HCM", isMember: true, loyaltyPoints: 210 },
  { code: "HV020", name: "Walk-in Khách Vãng Lai", phone: "0900000000", isMember: false, loyaltyPoints: 0 },
];

const INITIAL_ADDONS: AddonCatalogItem[] = [
  { id: "AD-CADDIE", name: "Caddie", unitPrice: 200_000, vatPercent: 8, description: "Người cầm túi gậy hỗ trợ trên sân", category: "Caddie" },
  { id: "AD-BUGGY", name: "Xe điện (Buggy)", unitPrice: 300_000, vatPercent: 8, description: "Phương tiện di chuyển trên sân, 2 chỗ ngồi", category: "Phương tiện" },
  { id: "AD-RENTAL", name: "Bộ gậy thuê", unitPrice: 150_000, vatPercent: 8, description: "Thuê 1 bộ gậy golf đầy đủ", category: "Trang bị" },
  { id: "AD-COMPANION", name: "Người đi cùng", unitPrice: 500_000, vatPercent: 8, description: "Non-golfer đi xem cùng nhóm", category: "Khác" },
  { id: "AD-BALLS", name: "Banh tập (100 trái)", unitPrice: 80_000, vatPercent: 8, description: "Banh tập driving range, 100 trái", category: "Trang bị" },
  { id: "AD-BAG", name: "Phí gửi gậy 1 ngày", unitPrice: 50_000, vatPercent: 8, description: "Lưu bao gậy tại CLB qua đêm", category: "Trang bị" },
];

const INITIAL_VOUCHERS: Voucher[] = [
  {
    code: "VOUCHERS8KQ4U", name: "Giảm 20% Teetime",
    description: "Voucher giảm 20% các dịch vụ Teetime, áp dụng KH thường",
    discountType: "percent", discountValue: 20, maxDiscount: 500_000, minOrder: 500_000,
    applyToCategoryIds: ["CAT-TEE"], quantity: 100, quantityUsed: 23,
    startDate: "01/04/2026", endDate: "30/06/2026", active: true, createdAt: "01/04/2026 09:00",
  },
  {
    code: "WELCOME200K", name: "Chào mừng KH mới 200K",
    description: "Voucher giảm cố định 200.000đ cho lần đầu trải nghiệm",
    discountType: "fixed", discountValue: 200_000, minOrder: 500_000,
    applyToCategoryIds: [], quantity: 200, quantityUsed: 88,
    startDate: "15/03/2026", endDate: "31/12/2026", active: true, createdAt: "15/03/2026 14:30",
  },
  {
    code: "PRACTICE10", name: "Sale Practice 10%",
    description: "Giảm 10% cho mọi vé Practice trong giờ off-peak",
    discountType: "percent", discountValue: 10, maxDiscount: 50_000,
    applyToCategoryIds: ["CAT-PRA"], quantity: 500, quantityUsed: 312,
    startDate: "01/01/2026", endDate: "31/12/2026", active: true, createdAt: "01/01/2026 08:00",
  },
  {
    code: "BIRTHDAY500", name: "Sinh nhật giảm 500K",
    description: "Voucher sinh nhật cho hội viên VIP",
    discountType: "fixed", discountValue: 500_000, minOrder: 1_500_000,
    applyToCategoryIds: ["CAT-TEE", "CAT-COMBO"], quantity: 50, quantityUsed: 11,
    startDate: "01/01/2026", endDate: "31/12/2026", active: true, createdAt: "01/01/2026 08:00",
  },
  {
    code: "EVENTSPRING", name: "Khai xuân 2026",
    description: "Khuyến mãi đầu năm — đã hết hạn",
    discountType: "percent", discountValue: 15, maxDiscount: 300_000,
    applyToCategoryIds: [], quantity: 300, quantityUsed: 287,
    startDate: "01/02/2026", endDate: "29/02/2026", active: false, createdAt: "01/02/2026 08:00",
  },
];

const INITIAL_TICKETS: Ticket[] = [
  {
    id: "VE-2605-001", type: "single",
    customerCode: "HV001", serviceCode: "T001",
    ticketDate: "07/05/2026", teeTime: "07:30", durationHours: 4, guestCount: 1, bayCount: 1,
    staff: "Nguyễn Thị Lan",
    basePrice: 850_000, vatPercent: 8, manualDiscount: 0, discountKind: "amount",
    voucherCode: "VOUCHERS8KQ4U", voucherDiscount: 170_000,
    addons: [
      { id: "TAL-1", name: "Caddie", quantity: 1, unitPrice: 200_000, vatPercent: 8, discount: 0, fromCatalog: true, catalogId: "AD-CADDIE" },
      { id: "TAL-2", name: "Xe điện (Buggy)", quantity: 1, unitPrice: 300_000, vatPercent: 8, discount: 0, fromCatalog: true, catalogId: "AD-BUGGY" },
    ],
    totalAmount: 1_273_400, paid: 1_273_400,
    payments: [{ id: "P1", method: "Chuyển khoản", amount: 1_273_400, account: "BANK-VCB", txRef: "FT26050712345" }],
    note: "KH VIP, ưu tiên caddie nữ.", status: "confirmed", createdAt: "06/05/2026 18:20",
    createdBy: "Nguyễn Thị Lan", branch: "NextVision",
    history: [
      { date: "06/05/2026 18:20", actor: "Nguyễn Thị Lan", action: "Tạo vé" },
      { date: "06/05/2026 18:25", actor: "Hệ thống", action: "Sinh phiếu thu PT-2605-0021", detail: "1.273.400 đ (BR-M4-09)" },
      { date: "07/05/2026 07:25", actor: "Lễ tân", action: "Check-in tại starter house" },
    ],
  },
  {
    id: "VE-2605-002", type: "single",
    customerCode: "HV003", serviceCode: "T003",
    ticketDate: "08/05/2026", durationHours: 1, guestCount: 1, bayCount: 1,
    staff: "Phạm Văn Đức",
    basePrice: 120_000, vatPercent: 8, manualDiscount: 0, discountKind: "amount",
    voucherDiscount: 0,
    addons: [{ id: "TAL-3", name: "Banh tập (100 trái)", quantity: 1, unitPrice: 80_000, vatPercent: 8, discount: 0, fromCatalog: true, catalogId: "AD-BALLS" }],
    totalAmount: 216_000, paid: 0,
    payments: [],
    note: "Chờ KH đến quầy thanh toán", status: "pending", createdAt: "07/05/2026 09:15",
    createdBy: "Phạm Văn Đức", branch: "NextVision",
    history: [
      { date: "07/05/2026 09:15", actor: "Phạm Văn Đức", action: "Tạo vé Pending" },
    ],
  },
  {
    id: "VE-2605-003", type: "group",
    members: [
      { id: "GM-1", customerCode: "HV005", serviceCode: "T001", ticketDate: "10/05/2026", teeTime: "08:00", bayCount: 1, guestCount: 1, manualDiscount: 0, discountKind: "amount", addons: [{ id: "GM-AD-1", name: "Caddie", quantity: 1, unitPrice: 200_000, vatPercent: 8, discount: 0, fromCatalog: true, catalogId: "AD-CADDIE" }] },
      { id: "GM-2", customerCode: "HV012", serviceCode: "T001", ticketDate: "10/05/2026", teeTime: "08:00", bayCount: 1, guestCount: 1, manualDiscount: 0, discountKind: "amount", addons: [{ id: "GM-AD-2", name: "Caddie", quantity: 1, unitPrice: 200_000, vatPercent: 8, discount: 0, fromCatalog: true, catalogId: "AD-CADDIE" }] },
      { id: "GM-3", customerCode: "HV001", serviceCode: "T001", ticketDate: "10/05/2026", teeTime: "08:00", bayCount: 1, guestCount: 1, manualDiscount: 5, discountKind: "percent", addons: [{ id: "GM-AD-3", name: "Caddie", quantity: 1, unitPrice: 200_000, vatPercent: 8, discount: 0, fromCatalog: true, catalogId: "AD-CADDIE" }, { id: "GM-AD-4", name: "Xe điện (Buggy)", quantity: 1, unitPrice: 300_000, vatPercent: 8, discount: 0, fromCatalog: true, catalogId: "AD-BUGGY" }] },
      { id: "GM-4", customerCode: "HV002", serviceCode: "T001", ticketDate: "10/05/2026", teeTime: "08:00", bayCount: 1, guestCount: 1, manualDiscount: 0, discountKind: "amount", addons: [] },
    ],
    staff: "Hoàng Mỹ Linh",
    basePrice: 0, vatPercent: 8, manualDiscount: 0, discountKind: "amount",
    voucherDiscount: 0, addons: [],
    totalAmount: 5_184_000, paid: 5_184_000,
    payments: [{ id: "P-G1", method: "Tiền mặt", amount: 5_184_000, account: "CASH-FRONT" }],
    note: "Flight 4 người, đặt sẵn caddie", status: "confirmed", createdAt: "08/05/2026 11:30",
    createdBy: "Hoàng Mỹ Linh", branch: "NextVision",
    history: [
      { date: "08/05/2026 11:30", actor: "Hoàng Mỹ Linh", action: "Tạo vé nhóm 4 người" },
      { date: "08/05/2026 11:32", actor: "Hệ thống", action: "Sinh phiếu thu PT-2605-0030", detail: "5.184.000 đ (BR-M4-09)" },
    ],
  },
  {
    id: "VE-2604-018", type: "single",
    customerCode: "HV020", serviceCode: "T004",
    ticketDate: "30/04/2026", durationHours: 0.5, guestCount: 1, bayCount: 1,
    staff: "Trần Quốc Bảo",
    basePrice: 130_000, vatPercent: 8, manualDiscount: 0, discountKind: "amount",
    voucherDiscount: 0, addons: [],
    totalAmount: 140_400, paid: 0,
    payments: [],
    note: "Đã hủy theo yêu cầu KH (mưa)", status: "cancelled",
    cancellationReason: "Khách hủy do thời tiết xấu",
    cancelledAt: "30/04/2026 06:50",
    createdAt: "29/04/2026 19:00", createdBy: "Trần Quốc Bảo", branch: "NextVision",
    history: [
      { date: "29/04/2026 19:00", actor: "Trần Quốc Bảo", action: "Tạo vé" },
      { date: "30/04/2026 06:50", actor: "Trần Quốc Bảo", action: "Hủy vé", detail: "Lý do: Khách hủy do thời tiết xấu (BR-M4-07)" },
    ],
  },
];

// =====================================================================================
// SECTION D — Helpers
// =====================================================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(value)) + " đ";
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(value));
}

function todayString(): string {
  const t = new Date();
  return [
    String(t.getDate()).padStart(2, "0"),
    String(t.getMonth() + 1).padStart(2, "0"),
    t.getFullYear(),
  ].join("/");
}

function nowString(): string {
  const t = new Date();
  return `${String(t.getDate()).padStart(2, "0")}/${String(t.getMonth() + 1).padStart(2, "0")}/${t.getFullYear()} ${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
}

function parseDDMMYYYY(s: string): Date | null {
  const [d, m, y] = s.split("/").map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

function isPastDate(s: string): boolean {
  const d = parseDDMMYYYY(s);
  if (!d) return false;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d.getTime() < now.getTime();
}

function daysBetween(start: string, end: string): number {
  const a = parseDDMMYYYY(start);
  const b = parseDDMMYYYY(end);
  if (!a || !b) return 0;
  return Math.round((a.getTime() - b.getTime()) / 86_400_000);
}

function getTierForDate(s: string): "weekday" | "weekend" | "holiday" | "peak" {
  const d = parseDDMMYYYY(s);
  if (!d) return "weekday";
  const holidays = ["30/04", "01/05", "02/09", "01/01"];
  const mmdd = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  if (holidays.includes(mmdd)) return "holiday";
  const day = d.getDay();
  return day === 0 || day === 6 ? "weekend" : "weekday";
}

function nextTicketId(items: Ticket[]): string {
  const t = new Date();
  const yymm = String(t.getFullYear()).slice(2) + String(t.getMonth() + 1).padStart(2, "0");
  const count = items.filter((it) => it.id.startsWith(`VE-${yymm}`)).length + 1;
  return `VE-${yymm}-${String(count).padStart(3, "0")}`;
}

function generateVoucherCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "VOUCHER";
  for (let i = 0; i < 6; i += 1) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function calculateAddonTotal(line: TicketAddonLine): number {
  const subtotal = line.unitPrice * line.quantity - line.discount;
  return Math.round(subtotal * (1 + line.vatPercent / 100));
}

function calculateMemberTotal(member: GroupMember, services: ServiceItem[]): number {
  const svc = services.find((s) => s.code === member.serviceCode);
  if (!svc) return 0;
  const tier = getTierForDate(member.ticketDate);
  const base = svc.prices[tier] * member.guestCount;
  const discount = member.discountKind === "percent"
    ? Math.round((base * member.manualDiscount) / 100)
    : member.manualDiscount;
  const afterDiscount = Math.max(0, base - discount);
  const vatAmount = Math.round(afterDiscount * 0.08);
  const addonsTotal = member.addons.reduce((sum, a) => sum + calculateAddonTotal(a), 0);
  return afterDiscount + vatAmount + addonsTotal;
}

function lookupCustomer(code: string, list: CustomerLite[]): CustomerLite | undefined {
  return list.find((c) => c.code === code);
}

function lookupService(code: string, list: ServiceItem[]): ServiceItem | undefined {
  return list.find((s) => s.code === code);
}

function lookupCategory(id: string, list: ServiceCategory[]): ServiceCategory | undefined {
  return list.find((c) => c.id === id);
}

function lookupColor(key: ColorKey | string): typeof COLOR_PALETTE[number] {
  return COLOR_PALETTE.find((c) => c.key === key) ?? COLOR_PALETTE[0];
}

function makeQrMatrix(input: string): boolean[][] {
  const N = 25;
  const matrix: boolean[][] = Array.from({ length: N }, () => Array.from({ length: N }, () => false));
  const drawFinder = (sr: number, sc: number) => {
    for (let r = 0; r < 7; r += 1) {
      for (let c = 0; c < 7; c += 1) {
        const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[sr + r][sc + c] = isOuter || isInner;
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, N - 7);
  drawFinder(N - 7, 0);
  let h = 5381;
  for (let i = 0; i < input.length; i += 1) h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  for (let r = 0; r < N; r += 1) {
    for (let c = 0; c < N; c += 1) {
      const inFinder = (r < 8 && c < 8) || (r < 8 && c >= N - 8) || (r >= N - 8 && c < 8);
      if (inFinder) continue;
      h = (h * 1103515245 + 12345 + r * 31 + c * 17) & 0x7fffffff;
      matrix[r][c] = h % 7 < 3;
    }
  }
  return matrix;
}

function getTicketRefDate(t: Ticket): string {
  return t.type === "single" ? (t.ticketDate ?? "") : (t.members?.[0]?.ticketDate ?? "");
}

// =====================================================================================
// SECTION E — Top-level component
// =====================================================================================

export default function TicketsView() {
  const [tab, setTab] = useState<TabKey>("tickets");
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [vouchers, setVouchers] = useState<Voucher[]>(INITIAL_VOUCHERS);
  const [addons, setAddons] = useState<AddonCatalogItem[]>(INITIAL_ADDONS);
  const [categories, setCategories] = useState<ServiceCategory[]>(INITIAL_CATEGORIES);
  const [services] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [customers, setCustomers] = useState<CustomerLite[]>(INITIAL_CUSTOMERS);

  const [toast, setToast] = useState<string | null>(null);
  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  };

  const handleCreateCustomer = (c: CustomerLite) => {
    setCustomers((prev) => [...prev, c]);
    flash(`Đã tạo KH ${c.code} · ${c.name}`);
  };

  const handleCreateCategory = (cat: ServiceCategory) => {
    setCategories((prev) => [...prev, cat]);
    flash(`Đã thêm loại dịch vụ "${cat.name}"`);
  };

  const handleCreateAddon = (addon: AddonCatalogItem) => {
    setAddons((prev) => [...prev, addon]);
    flash(`Đã thêm dịch vụ đi kèm "${addon.name}"`);
  };

  return (
    <>
      <FeaturePage
        title="Vé Lẻ"
        subtitle="Bán vé sử dụng đơn lẻ · Vé nhóm · Quản lý voucher · Dịch vụ đi kèm"
      >
        <div className={styles.contractTabs}>
          <TabButton
            active={tab === "tickets"}
            icon={TicketIcon}
            label="Danh Sách Vé"
            count={tickets.length}
            onClick={() => setTab("tickets")}
          />
          <TabButton
            active={tab === "vouchers"}
            icon={Gift}
            label="Vouchers"
            count={vouchers.length}
            onClick={() => setTab("vouchers")}
            accent="purple"
          />
          <TabButton
            active={tab === "addons"}
            icon={ShoppingBag}
            label="Dịch Vụ Đi Kèm"
            count={addons.length}
            onClick={() => setTab("addons")}
            accent="blue"
          />
        </div>

        {tab === "tickets" ? (
          <TicketListTab
            tickets={tickets}
            onChange={setTickets}
            customers={customers}
            services={services}
            categories={categories}
            addons={addons}
            vouchers={vouchers}
            flash={flash}
            onCreateCustomer={handleCreateCustomer}
            onCreateCategory={handleCreateCategory}
            onCreateAddon={handleCreateAddon}
            onUseVoucher={(code) => {
              setVouchers((prev) => prev.map((v) => v.code === code ? { ...v, quantityUsed: v.quantityUsed + 1 } : v));
            }}
          />
        ) : null}

        {tab === "vouchers" ? (
          <VoucherListTab
            vouchers={vouchers}
            onChange={setVouchers}
            categories={categories}
            flash={flash}
          />
        ) : null}

        {tab === "addons" ? (
          <AddonListTab
            addons={addons}
            onChange={setAddons}
            flash={flash}
          />
        ) : null}
      </FeaturePage>

      {toast ? <div className={styles.contractToast}>{toast}</div> : null}
    </>
  );
}

function TabButton({
  active,
  count,
  icon: Icon,
  label,
  onClick,
  accent,
}: {
  active: boolean;
  count: number;
  icon: typeof TicketIcon;
  label: string;
  onClick: () => void;
  accent?: "purple" | "blue";
}) {
  return (
    <button
      className={`${styles.contractTabBtn} ${active ? styles.contractTabActive : ""} ${accent === "purple" ? styles.contractTabPurple : ""} ${accent === "blue" ? styles.contractTabBlue : ""}`}
      onClick={onClick}
      type="button"
    >
      <Icon size={16} /> {label}
      <span>{count}</span>
    </button>
  );
}

function KpiCard({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: typeof TicketIcon;
  label: string;
  tone: "blue" | "green" | "amber" | "red" | "purple";
  value: string;
}) {
  return (
    <article className={`${styles.contractKpiCard} ${styles[`kpi_${tone}`]}`}>
      <span className={styles.contractKpiIcon}><Icon size={18} /></span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function ServiceCategoryBadge({ category }: { category?: ServiceCategory }) {
  if (!category) return <span className={styles.ticketCategoryBadge}>—</span>;
  const c = lookupColor(category.color);
  return (
    <span className={styles.ticketCategoryBadge} style={{ background: c.bg, color: c.fg }}>
      {category.name}
    </span>
  );
}

function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const map: Record<TicketStatus, { label: string; cls: string }> = {
    pending: { label: "Chờ xác nhận", cls: styles.contractBadgeSuspended },
    confirmed: { label: "Đã xác nhận", cls: styles.contractBadgeActive },
    cancelled: { label: "Đã hủy", cls: styles.contractBadgeExpired },
  };
  const m = map[status];
  return <span className={m.cls}>{m.label}</span>;
}

// =====================================================================================
// SECTION F — Tab "Danh Sách Vé"
// =====================================================================================

type TicketListProps = {
  tickets: Ticket[];
  onChange: (next: Ticket[]) => void;
  customers: CustomerLite[];
  services: ServiceItem[];
  categories: ServiceCategory[];
  addons: AddonCatalogItem[];
  vouchers: Voucher[];
  flash: (msg: string) => void;
  onCreateCustomer: (c: CustomerLite) => void;
  onCreateCategory: (c: ServiceCategory) => void;
  onCreateAddon: (a: AddonCatalogItem) => void;
  onUseVoucher: (code: string) => void;
};

function TicketListTab({
  tickets,
  onChange,
  customers,
  services,
  categories,
  addons,
  vouchers,
  flash,
  onCreateCustomer,
  onCreateCategory,
  onCreateAddon,
  onUseVoucher,
}: TicketListProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TicketTypeFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [branchFilter, setBranchFilter] = useState<string>("Tất cả chi nhánh");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [detailTicket, setDetailTicket] = useState<Ticket | null>(null);
  const [billTicket, setBillTicket] = useState<{ ticket: Ticket; mode: "addons" | "full" } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Ticket | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Ticket | null>(null);

  useEffect(() => {
    if (!openMenuId) return;
    const handler = () => setOpenMenuId(null);
    const t = window.setTimeout(() => document.addEventListener("click", handler), 0);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("click", handler);
    };
  }, [openMenuId]);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (branchFilter !== "Tất cả chi nhánh" && t.branch !== branchFilter) return false;
      if (dateFilter !== "all") {
        const refDate = getTicketRefDate(t);
        if (!refDate) return false;
        const today = todayString();
        const diff = daysBetween(refDate, today);
        if (dateFilter === "today" && diff !== 0) return false;
        if (dateFilter === "7days" && (diff < 0 || diff > 7)) return false;
        if (dateFilter === "30days" && (diff < 0 || diff > 30)) return false;
      }
      if (query) {
        const target = [
          t.id,
          t.customerCode ?? "",
          lookupCustomer(t.customerCode ?? "", customers)?.name ?? "",
          lookupCustomer(t.customerCode ?? "", customers)?.phone ?? "",
          ...(t.members?.map((m) => `${m.customerCode} ${lookupCustomer(m.customerCode, customers)?.name ?? ""}`) ?? []),
          lookupService(t.serviceCode ?? "", services)?.name ?? "",
        ].join(" ").toLowerCase();
        if (!target.includes(query.toLowerCase())) return false;
      }
      return true;
    });
  }, [tickets, statusFilter, typeFilter, dateFilter, branchFilter, query, customers, services]);

  const stats = useMemo(() => {
    const total = tickets.length;
    const confirmed = tickets.filter((t) => t.status === "confirmed").length;
    const pending = tickets.filter((t) => t.status === "pending").length;
    const revenue = tickets.filter((t) => t.status === "confirmed").reduce((s, t) => s + t.totalAmount, 0);
    return { total, confirmed, pending, revenue };
  }, [tickets]);

  const openCreate = () => {
    setEditingTicket(null);
    setFormOpen(true);
  };

  const openEdit = (ticket: Ticket) => {
    if (ticket.status === "cancelled") {
      flash("Không thể sửa vé đã hủy. Hãy tạo vé mới.");
      return;
    }
    setEditingTicket(ticket);
    setFormOpen(true);
    setOpenMenuId(null);
  };

  const submit = (next: Ticket) => {
    const exists = tickets.find((t) => t.id === next.id);
    if (exists) {
      onChange(tickets.map((t) => (t.id === next.id ? next : t)));
      flash(`Đã cập nhật ${next.id}`);
    } else {
      onChange([next, ...tickets]);
      flash(`Đã tạo ${next.id}${next.status === "confirmed" ? " · sinh phiếu thu (BR-M4-09)" : ""}`);
      if (next.voucherCode) onUseVoucher(next.voucherCode);
    }
    setFormOpen(false);
    setEditingTicket(null);
  };

  const confirmTicket = (target: Ticket) => {
    const next: Ticket = {
      ...target,
      status: "confirmed",
      paid: target.totalAmount,
      payments: target.payments.length > 0 ? target.payments : [{ id: `P-${Date.now()}`, method: "Tiền mặt", amount: target.totalAmount, account: "CASH-FRONT" }],
      history: [
        ...target.history,
        { date: nowString(), actor: "Lễ tân", action: "Xác nhận vé · thu đủ" },
        { date: nowString(), actor: "Hệ thống", action: "Sinh phiếu thu", detail: `${formatCurrency(target.totalAmount)} (BR-M4-09)` },
      ],
    };
    onChange(tickets.map((t) => (t.id === target.id ? next : t)));
    if (target.voucherCode) onUseVoucher(target.voucherCode);
    flash(`Đã xác nhận ${target.id} · sinh phiếu thu PT (BR-M4-09)`);
    setConfirmTarget(null);
  };

  const cancelTicket = (target: Ticket, reason: string) => {
    const next: Ticket = {
      ...target,
      status: "cancelled",
      cancellationReason: reason,
      cancelledAt: nowString(),
      history: [
        ...target.history,
        { date: nowString(), actor: "Lễ tân", action: "Hủy vé", detail: `Lý do: ${reason} (BR-M4-07)` },
      ],
    };
    onChange(tickets.map((t) => (t.id === target.id ? next : t)));
    flash(`Đã hủy ${target.id} (Soft Delete · BR-M4-07)`);
    setDeleteTarget(null);
  };

  return (
    <>
      <div className={styles.contractKpi}>
        <KpiCard label="Tổng vé" value={String(stats.total)} tone="blue" icon={TicketIcon} />
        <KpiCard label="Đã xác nhận" value={String(stats.confirmed)} tone="green" icon={CheckCircle2} />
        <KpiCard label="Chờ xác nhận" value={String(stats.pending)} tone="amber" icon={Clock} />
        <KpiCard label="Tổng doanh thu" value={formatCurrency(stats.revenue)} tone="purple" icon={Wallet} />
      </div>

      <div className={styles.contractListSearchRow}>
        <div className={styles.pricingSearch} style={{ flex: 1 }}>
          <Search size={18} />
          <input
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo mã vé, tên KH, SĐT, dịch vụ..."
            value={query}
          />
        </div>
        <select className={styles.selectInput} onChange={(e) => setDateFilter(e.target.value as DateFilter)} value={dateFilter}>
          <option value="all">Mọi thời gian</option>
          <option value="today">Hôm nay</option>
          <option value="7days">7 ngày tới</option>
          <option value="30days">30 ngày tới</option>
        </select>
        <select className={styles.selectInput} onChange={(e) => setTypeFilter(e.target.value as TicketTypeFilter)} value={typeFilter}>
          <option value="all">Tất cả loại vé</option>
          <option value="single">Vé lẻ</option>
          <option value="group">Vé nhóm</option>
        </select>
        <select className={styles.selectInput} onChange={(e) => setBranchFilter(e.target.value)} value={branchFilter}>
          {["Tất cả chi nhánh", ...BRANCHES].map((b) => <option key={b}>{b}</option>)}
        </select>
      </div>

      <div className={styles.contractListChipRow}>
        <div className={styles.contractFilterChips}>
          {[
            { key: "all", label: "Tất cả" },
            { key: "confirmed", label: "Đã xác nhận" },
            { key: "pending", label: "Chờ xác nhận" },
            { key: "cancelled", label: "Đã hủy" },
          ].map((opt) => (
            <button
              className={statusFilter === opt.key ? styles.contractFilterActive : styles.contractFilterChip}
              key={opt.key}
              onClick={() => setStatusFilter(opt.key as StatusFilter)}
              type="button"
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className={styles.contractListActions}>
          <button
            className={styles.iconButton}
            onClick={() => flash(`Đang xuất ${filtered.length} vé ra Excel...`)}
            title="Xuất Excel"
            type="button"
          >
            <Download size={16} />
          </button>
          <button
            className={styles.iconButton}
            onClick={() => flash("Chọn file Excel để nhập...")}
            title="Nhập Excel"
            type="button"
          >
            <Upload size={16} />
          </button>
          <button className={styles.greenButton} onClick={openCreate} type="button">
            <PlusCircle size={16} /> Tạo vé mới
          </button>
        </div>
      </div>

      <section className={styles.memberTableCard}>
        <div className={styles.memberTableWrap}>
          <table className={`${styles.memberTable} ${styles.contractListTable}`}>
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã vé</th>
                <th>Loại</th>
                <th>Khách hàng</th>
                <th>SĐT</th>
                <th>Dịch vụ</th>
                <th>Ngày & giờ</th>
                <th>SL</th>
                <th>Giá tiền</th>
                <th>Đã TT</th>
                <th>Trạng thái</th>
                <th>NV xử lý</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td className={styles.emptyTableCell} colSpan={13}>
                    Không có vé nào khớp bộ lọc. Thử điều chỉnh bộ lọc hoặc tạo vé mới.
                  </td>
                </tr>
              ) : null}
              {filtered.map((t, index) => {
                const isGroup = t.type === "group";
                const customer = isGroup
                  ? lookupCustomer(t.members?.[0]?.customerCode ?? "", customers)
                  : lookupCustomer(t.customerCode ?? "", customers);
                const service = isGroup
                  ? lookupService(t.members?.[0]?.serviceCode ?? "", services)
                  : lookupService(t.serviceCode ?? "", services);
                const refDate = isGroup ? t.members?.[0]?.ticketDate : t.ticketDate;
                const refTime = isGroup ? t.members?.[0]?.teeTime : t.teeTime;
                const totalGuests = isGroup
                  ? (t.members?.reduce((s, m) => s + m.guestCount, 0) ?? 0)
                  : (t.guestCount ?? 1);
                return (
                  <tr key={t.id}>
                    <td className={styles.contractRowIndex}>{index + 1}</td>
                    <td>
                      <button className={styles.memberCode} onClick={() => setDetailTicket(t)} type="button">
                        {t.id}
                      </button>
                    </td>
                    <td>
                      <span className={isGroup ? styles.ticketTypeGroup : styles.ticketTypeSingle}>
                        {isGroup ? <Users size={12} /> : <User size={12} />}
                        {isGroup ? "Nhóm" : "Lẻ"}
                      </span>
                    </td>
                    <td className={styles.memberName}>
                      <strong>{customer?.name ?? "—"}</strong>
                      {isGroup ? <span className={styles.cellMuted}> +{(t.members?.length ?? 1) - 1} người</span> : null}
                    </td>
                    <td>{customer?.phone ?? "—"}</td>
                    <td>
                      {service ? (
                        <div className={styles.ticketServiceCell}>
                          <strong>{service.name}</strong>
                          <ServiceCategoryBadge category={lookupCategory(service.categoryId, categories)} />
                        </div>
                      ) : "—"}
                    </td>
                    <td>
                      <div className={styles.ticketDateCell}>
                        <Calendar size={12} /> {refDate ?? "—"}
                        {refTime ? <><Clock size={12} /> {refTime}</> : null}
                      </div>
                    </td>
                    <td className={styles.cellMuted}>{totalGuests}</td>
                    <td><strong className={styles.contractTotalCell}>{formatCurrency(t.totalAmount)}</strong></td>
                    <td>
                      <strong className={t.paid >= t.totalAmount ? styles.contractZeroCell : styles.contractDebtCell}>
                        {formatCurrency(t.paid)}
                      </strong>
                    </td>
                    <td><TicketStatusBadge status={t.status} /></td>
                    <td className={styles.cellTruncate} title={t.staff}>{t.staff}</td>
                    <td>
                      <div className={styles.contractRowActions}>
                        <button onClick={() => setDetailTicket(t)} title="Xem chi tiết" type="button">
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => openEdit(t)}
                          title={t.status === "cancelled" ? "Vé đã hủy không thể sửa" : "Sửa vé"}
                          type="button"
                          disabled={t.status === "cancelled"}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(t)}
                          title="Hủy vé"
                          type="button"
                          className={styles.contractDelete}
                          disabled={t.status === "cancelled"}
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className={styles.contractMenuWrap}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === t.id ? null : t.id); }}
                            title="Thao tác khác"
                            type="button"
                          >
                            <MoreVertical size={14} />
                          </button>
                          {openMenuId === t.id ? (
                            <TicketActionMenu
                              ticket={t}
                              onClose={() => setOpenMenuId(null)}
                              onConfirm={() => { setOpenMenuId(null); setConfirmTarget(t); }}
                              onPrintAddons={() => { setOpenMenuId(null); setBillTicket({ ticket: t, mode: "addons" }); }}
                              onPrintFull={() => { setOpenMenuId(null); setBillTicket({ ticket: t, mode: "full" }); }}
                              onDuplicate={() => {
                                setOpenMenuId(null);
                                const cloned: Ticket = {
                                  ...t,
                                  id: nextTicketId(tickets),
                                  status: "pending",
                                  paid: 0,
                                  payments: [],
                                  cancellationReason: undefined,
                                  cancelledAt: undefined,
                                  createdAt: nowString(),
                                  history: [{ date: nowString(), actor: "Lễ tân", action: "Nhân bản từ " + t.id }],
                                };
                                onChange([cloned, ...tickets]);
                                flash(`Đã nhân bản → ${cloned.id}`);
                              }}
                            />
                          ) : null}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <footer className={styles.contractTableFooter}>
          <span>Hiển thị {filtered.length} / {tickets.length} vé</span>
          <span>Doanh thu hiển thị: <strong>{formatCurrency(filtered.filter((t) => t.status === "confirmed").reduce((s, t) => s + t.totalAmount, 0))}</strong></span>
        </footer>
      </section>

      {formOpen ? (
        <TicketFormModal
          initial={editingTicket}
          tickets={tickets}
          customers={customers}
          services={services}
          categories={categories}
          addons={addons}
          vouchers={vouchers}
          onClose={() => { setFormOpen(false); setEditingTicket(null); }}
          onSubmit={submit}
          onCreateCustomer={onCreateCustomer}
          onCreateCategory={onCreateCategory}
          onCreateAddon={onCreateAddon}
          flash={flash}
        />
      ) : null}

      {detailTicket ? (
        <TicketDetailModal
          ticket={detailTicket}
          customers={customers}
          services={services}
          categories={categories}
          onClose={() => setDetailTicket(null)}
          onEdit={() => { openEdit(detailTicket); setDetailTicket(null); }}
          onPrintAddons={() => { setBillTicket({ ticket: detailTicket, mode: "addons" }); setDetailTicket(null); }}
          onPrintFull={() => { setBillTicket({ ticket: detailTicket, mode: "full" }); setDetailTicket(null); }}
          onConfirm={() => { setConfirmTarget(detailTicket); setDetailTicket(null); }}
          onCancel={() => { setDeleteTarget(detailTicket); setDetailTicket(null); }}
        />
      ) : null}

      {billTicket ? (
        <BillReceiptModal
          ticket={billTicket.ticket}
          mode={billTicket.mode}
          customers={customers}
          services={services}
          onClose={() => setBillTicket(null)}
          flash={flash}
        />
      ) : null}

      {deleteTarget ? (
        <CancelTicketDialog
          ticket={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={(reason) => cancelTicket(deleteTarget, reason)}
        />
      ) : null}

      {confirmTarget ? (
        <ConfirmTicketDialog
          ticket={confirmTarget}
          customers={customers}
          services={services}
          onCancel={() => setConfirmTarget(null)}
          onConfirm={() => confirmTicket(confirmTarget)}
        />
      ) : null}
    </>
  );
}

function TicketActionMenu({
  ticket,
  onClose,
  onConfirm,
  onPrintAddons,
  onPrintFull,
  onDuplicate,
}: {
  ticket: Ticket;
  onClose: () => void;
  onConfirm: () => void;
  onPrintAddons: () => void;
  onPrintFull: () => void;
  onDuplicate: () => void;
}) {
  const hasAddons = ticket.addons.length > 0 || (ticket.members?.some((m) => m.addons.length > 0) ?? false);
  const items = [
    { icon: CheckCircle2, label: "Xác nhận & thu tiền", onClick: onConfirm, disabled: ticket.status !== "pending", hint: ticket.status === "confirmed" ? "Đã xác nhận" : ticket.status === "cancelled" ? "Vé đã hủy" : "" },
    { icon: Printer, label: "In bill DV đi kèm", onClick: onPrintAddons, disabled: !hasAddons, hint: !hasAddons ? "Vé không có DV đi kèm" : "" },
    { icon: Receipt, label: "In bill tổng (DV chính + đi kèm)", onClick: onPrintFull, disabled: false, hint: "" },
    { icon: Copy, label: "Nhân bản vé", onClick: onDuplicate, disabled: false, hint: "" },
  ];

  return (
    <>
      <button className={styles.contractMenuBackdrop} onClick={onClose} type="button" aria-label="Đóng menu" />
      <div className={styles.contractActionMenu}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={item.disabled ? styles.contractMenuDisabled : styles.contractMenuItem}
              disabled={item.disabled}
              key={item.label}
              onClick={item.disabled ? undefined : item.onClick}
              title={item.hint}
              type="button"
            >
              <Icon size={14} /> <span>{item.label}</span>
              {item.disabled && item.hint ? <em>{item.hint}</em> : null}
            </button>
          );
        })}
      </div>
    </>
  );
}

// =====================================================================================
// SECTION G — Form Tạo/Sửa Vé (Vé lẻ + Vé nhóm) — sẽ được build tiếp ở các edit sau
// =====================================================================================
// Placeholders — sẽ replace bằng implementation đầy đủ
function TicketFormModal(props: {
  initial: Ticket | null;
  tickets: Ticket[];
  customers: CustomerLite[];
  services: ServiceItem[];
  categories: ServiceCategory[];
  addons: AddonCatalogItem[];
  vouchers: Voucher[];
  onClose: () => void;
  onSubmit: (t: Ticket) => void;
  onCreateCustomer: (c: CustomerLite) => void;
  onCreateCategory: (c: ServiceCategory) => void;
  onCreateAddon: (a: AddonCatalogItem) => void;
  flash: (m: string) => void;
}) {
  return <TicketFormModalImpl {...props} />;
}

function TicketDetailModal(props: {
  ticket: Ticket;
  customers: CustomerLite[];
  services: ServiceItem[];
  categories: ServiceCategory[];
  onClose: () => void;
  onEdit: () => void;
  onPrintAddons: () => void;
  onPrintFull: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return <TicketDetailModalImpl {...props} />;
}

function BillReceiptModal(props: {
  ticket: Ticket;
  mode: "addons" | "full";
  customers: CustomerLite[];
  services: ServiceItem[];
  onClose: () => void;
  flash: (m: string) => void;
}) {
  return <BillReceiptModalImpl {...props} />;
}

function CancelTicketDialog(props: { ticket: Ticket; onCancel: () => void; onConfirm: (reason: string) => void }) {
  return <CancelTicketDialogImpl {...props} />;
}

function ConfirmTicketDialog(props: {
  ticket: Ticket;
  customers: CustomerLite[];
  services: ServiceItem[];
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return <ConfirmTicketDialogImpl {...props} />;
}

function VoucherListTab(props: {
  vouchers: Voucher[];
  onChange: (v: Voucher[]) => void;
  categories: ServiceCategory[];
  flash: (m: string) => void;
}) {
  return <VoucherListTabImpl {...props} />;
}

function AddonListTab(props: {
  addons: AddonCatalogItem[];
  onChange: (a: AddonCatalogItem[]) => void;
  flash: (m: string) => void;
}) {
  return <AddonListTabImpl {...props} />;
}

// =====================================================================================
// SECTION G IMPL — TicketFormModal (Vé lẻ + Vé nhóm)
// =====================================================================================

function TicketFormModalImpl({
  initial,
  tickets,
  customers,
  services,
  categories,
  addons,
  vouchers,
  onClose,
  onSubmit,
  onCreateCustomer,
  onCreateCategory,
  onCreateAddon,
}: {
  initial: Ticket | null;
  tickets: Ticket[];
  customers: CustomerLite[];
  services: ServiceItem[];
  categories: ServiceCategory[];
  addons: AddonCatalogItem[];
  vouchers: Voucher[];
  onClose: () => void;
  onSubmit: (t: Ticket) => void;
  onCreateCustomer: (c: CustomerLite) => void;
  onCreateCategory: (c: ServiceCategory) => void;
  onCreateAddon: (a: AddonCatalogItem) => void;
  flash: (m: string) => void;
}) {
  const isEdit = Boolean(initial);
  const today = todayString();

  // Toggle Vé lẻ / Vé nhóm
  const [ticketType, setTicketType] = useState<"single" | "group">(initial?.type ?? "single");

  // Single state
  const [customerCode, setCustomerCode] = useState<string>(initial?.customerCode ?? customers[0]?.code ?? "");
  const [serviceCode, setServiceCode] = useState<string>(initial?.serviceCode ?? services[0]?.code ?? "");
  const [ticketDate, setTicketDate] = useState<string>(initial?.ticketDate ?? today);
  const [teeTime, setTeeTime] = useState<string>(initial?.teeTime ?? "07:00");
  const [durationHours, setDurationHours] = useState<number>(initial?.durationHours ?? 4);
  const [guestCount, setGuestCount] = useState<number>(initial?.guestCount ?? 1);
  const [bayCount, setBayCount] = useState<number>(initial?.bayCount ?? 1);
  const [singleAddons, setSingleAddons] = useState<TicketAddonLine[]>(initial?.addons ?? []);
  const [vatPercent, setVatPercent] = useState<number>(initial?.vatPercent ?? 8);
  const [manualDiscount, setManualDiscount] = useState<number>(initial?.manualDiscount ?? 0);
  const [discountKind, setDiscountKind] = useState<"percent" | "amount">(initial?.discountKind ?? "amount");
  const [voucherCode, setVoucherCode] = useState<string>(initial?.voucherCode ?? "");

  // Group state
  const [members, setMembers] = useState<GroupMember[]>(() => initial?.members ?? [
    { id: "M-INIT-1", customerCode: customers[0]?.code ?? "", serviceCode: services[0]?.code ?? "", ticketDate: today, teeTime: "07:00", bayCount: 1, guestCount: 1, manualDiscount: 0, discountKind: "amount", addons: [] },
    { id: "M-INIT-2", customerCode: customers[1]?.code ?? "", serviceCode: services[0]?.code ?? "", ticketDate: today, teeTime: "07:00", bayCount: 1, guestCount: 1, manualDiscount: 0, discountKind: "amount", addons: [] },
  ]);

  // Common
  const [staff, setStaff] = useState<string>(initial?.staff ?? STAFF_LIST[0]);
  const [branch, setBranch] = useState<string>(initial?.branch ?? BRANCHES[0]);
  const [note, setNote] = useState<string>(initial?.note ?? "");
  const [payments, setPayments] = useState<PaymentEntry[]>(
    () => initial?.payments ?? [{ id: "P-INIT", method: "Tiền mặt", amount: 0, account: "CASH-FRONT" }]
  );
  const [cashAtCounter, setCashAtCounter] = useState<boolean>(initial?.cashAtCounter ?? true);

  const [activeSection, setActiveSection] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [error, setError] = useState<string | null>(null);

  // Sub-modals
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [addonModalOpen, setAddonModalOpen] = useState<{ targetMember?: string } | null>(null);

  const selectedCustomer = lookupCustomer(customerCode, customers);
  const selectedService = lookupService(serviceCode, services);
  const tier = getTierForDate(ticketDate);
  const tierPrice = selectedService?.prices[tier] ?? 0;
  const basePrice = tierPrice * guestCount;

  // Voucher calc
  const selectedVoucher = vouchers.find((v) => v.code === voucherCode);
  let voucherDiscount = 0;
  let voucherWarning = "";
  if (selectedVoucher) {
    if (!selectedVoucher.active) voucherWarning = "Voucher đã tắt kích hoạt";
    else if (selectedVoucher.quantityUsed >= selectedVoucher.quantity) voucherWarning = "Voucher đã hết stock";
    else if (isPastDate(selectedVoucher.endDate)) voucherWarning = "Voucher đã hết hạn";
    else if (selectedVoucher.minOrder && basePrice < selectedVoucher.minOrder) voucherWarning = `Đơn tối thiểu ${formatCurrency(selectedVoucher.minOrder)}`;
    else if (selectedVoucher.applyToCategoryIds.length > 0 && selectedService && !selectedVoucher.applyToCategoryIds.includes(selectedService.categoryId)) voucherWarning = "Voucher không áp dụng cho loại DV này";
    else {
      voucherDiscount = selectedVoucher.discountType === "percent"
        ? Math.min(selectedVoucher.maxDiscount ?? Infinity, Math.round((basePrice * selectedVoucher.discountValue) / 100))
        : selectedVoucher.discountValue;
    }
  }

  const manualAmount = discountKind === "percent" ? Math.round((basePrice * manualDiscount) / 100) : manualDiscount;
  const totalDiscount = voucherDiscount + manualAmount;
  const afterDiscount = Math.max(0, basePrice - totalDiscount);
  const vatAmount = Math.round((afterDiscount * vatPercent) / 100);
  const addonsTotal = singleAddons.reduce((s, a) => s + calculateAddonTotal(a), 0);
  const singleTotal = afterDiscount + vatAmount + addonsTotal;
  const groupTotal = members.reduce((s, m) => s + calculateMemberTotal(m, services), 0);
  const totalAmount = ticketType === "single" ? singleTotal : groupTotal;
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const debt = totalAmount - totalPaid;

  // Member handlers
  const updateMember = (id: string, partial: Partial<GroupMember>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...partial } : m)));
  };
  const addMember = () => {
    setMembers((prev) => [
      ...prev,
      { id: `M-${Date.now()}`, customerCode: customers[0]?.code ?? "", serviceCode: services[0]?.code ?? "", ticketDate, teeTime: "07:00", bayCount: 1, guestCount: 1, manualDiscount: 0, discountKind: "amount", addons: [] },
    ]);
  };
  const removeMember = (id: string) => {
    if (members.length <= 2) {
      setError("Vé nhóm phải có tối thiểu 2 thành viên (BR-M4-06)");
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  // Addon handlers (single)
  const toggleQuickAddon = (cat: AddonCatalogItem) => {
    const existing = singleAddons.find((a) => a.catalogId === cat.id);
    if (existing) {
      setSingleAddons((prev) => prev.filter((a) => a.id !== existing.id));
    } else {
      setSingleAddons((prev) => [
        ...prev,
        { id: `TAL-${Date.now()}`, name: cat.name, quantity: 1, unitPrice: cat.unitPrice, vatPercent: cat.vatPercent, discount: 0, fromCatalog: true, catalogId: cat.id },
      ]);
    }
  };
  const updateSingleAddon = (id: string, partial: Partial<TicketAddonLine>) => {
    setSingleAddons((prev) => prev.map((a) => (a.id === id ? { ...a, ...partial } : a)));
  };
  const removeSingleAddon = (id: string) => setSingleAddons((prev) => prev.filter((a) => a.id !== id));

  // Member addon handlers
  const addMemberAddon = (memberId: string, line: TicketAddonLine) => {
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, addons: [...m.addons, line] } : m)));
  };
  const updateMemberAddon = (memberId: string, addonId: string, partial: Partial<TicketAddonLine>) => {
    setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, addons: m.addons.map((a) => a.id === addonId ? { ...a, ...partial } : a) } : m));
  };
  const removeMemberAddon = (memberId: string, addonId: string) => {
    setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, addons: m.addons.filter((a) => a.id !== addonId) } : m));
  };

  // Payment handlers
  const addPayment = () => {
    setPayments((prev) => [...prev, { id: `P-${Date.now()}`, method: "Tiền mặt", amount: 0, account: "CASH-FRONT" }]);
  };
  const updatePayment = (id: string, partial: Partial<PaymentEntry>) => {
    setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, ...partial } : p)));
  };
  const removePayment = (id: string) => {
    if (payments.length <= 1) return;
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };
  const fillPaymentToTotal = () => {
    if (payments.length === 0) return;
    const others = payments.slice(0, -1).reduce((s, p) => s + p.amount, 0);
    const last = payments[payments.length - 1];
    updatePayment(last.id, { amount: Math.max(0, totalAmount - others) });
  };

  // Service select handler — auto-set duration & teeTime visibility
  const onPickService = (code: string) => {
    setServiceCode(code);
    const svc = services.find((s) => s.code === code);
    if (svc) {
      setDurationHours(svc.durationHours);
      if (!svc.needsTeeTime) setTeeTime("");
      else if (!teeTime) setTeeTime("07:00");
    }
  };

  // Validation
  const validate = (): string | null => {
    if (ticketType === "single") {
      if (!customerCode) return "Vui lòng chọn khách hàng (BR-M4-01)";
      if (!serviceCode) return "Vui lòng chọn dịch vụ (BR-M4-02)";
      if (!ticketDate) return "Vui lòng nhập ngày sử dụng";
      if (isPastDate(ticketDate)) return "Ngày sử dụng phải ≥ hôm nay (BR-M4-03)";
      if (selectedService?.needsTeeTime && !teeTime) return "Dịch vụ Teetime yêu cầu giờ ra sân";
      if (guestCount < 1) return "Số người tối thiểu 1";
    } else {
      if (members.length < 2) return "Vé nhóm phải có ≥2 thành viên (BR-M4-06)";
      const codes = members.map((m) => m.customerCode);
      if (new Set(codes).size !== codes.length) return "Vé nhóm không được trùng cùng 1 KH (BR-M4-06)";
      for (const m of members) {
        if (!m.customerCode) return "Một thành viên chưa chọn KH";
        if (!m.serviceCode) return "Một thành viên chưa chọn DV";
        if (isPastDate(m.ticketDate)) return `Thành viên có ngày trong quá khứ (BR-M4-03)`;
      }
    }
    if (voucherCode && voucherWarning) return `Voucher: ${voucherWarning}`;
    for (const p of payments) {
      if ((p.method === "Chuyển khoản" || p.method === "Thẻ") && p.amount > 0 && !p.txRef?.trim()) {
        return `Vui lòng nhập mã giao dịch cho ${p.method}`;
      }
    }
    return null;
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);

    const id = initial?.id ?? nextTicketId(tickets);
    const willConfirm = totalPaid >= totalAmount && totalAmount > 0;
    const status: TicketStatus = initial?.status === "cancelled" ? "cancelled" : willConfirm ? "confirmed" : "pending";

    const ticket: Ticket = {
      id,
      type: ticketType,
      customerCode: ticketType === "single" ? customerCode : undefined,
      serviceCode: ticketType === "single" ? serviceCode : undefined,
      ticketDate: ticketType === "single" ? ticketDate : undefined,
      teeTime: ticketType === "single" ? teeTime : undefined,
      durationHours: ticketType === "single" ? durationHours : undefined,
      guestCount: ticketType === "single" ? guestCount : undefined,
      bayCount: ticketType === "single" ? bayCount : undefined,
      members: ticketType === "group" ? members : undefined,
      staff,
      basePrice: ticketType === "single" ? basePrice : 0,
      vatPercent,
      manualDiscount: manualAmount,
      discountKind,
      voucherCode: voucherCode || undefined,
      voucherDiscount,
      addons: ticketType === "single" ? singleAddons : [],
      totalAmount,
      payments,
      paid: totalPaid,
      cashAtCounter,
      note,
      status,
      createdAt: initial?.createdAt ?? nowString(),
      createdBy: initial?.createdBy ?? staff,
      branch,
      history: initial?.history ?? [
        { date: nowString(), actor: staff, action: isEdit ? "Cập nhật vé" : "Tạo vé" },
        ...(status === "confirmed" ? [{ date: nowString(), actor: "Hệ thống", action: "Sinh phiếu thu", detail: `${formatCurrency(totalAmount)} (BR-M4-09)` }] : []),
      ],
    };
    onSubmit(ticket);
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <form className={styles.contractFormModal} onSubmit={submit}>
        <header className={styles.contractFormBanner}>
          <div className={styles.ticketFormBannerLeft}>
            <h2>{isEdit ? `Chỉnh sửa vé ${initial?.id}` : "Tạo vé mới"}</h2>
            <div className={styles.ticketTypeToggle}>
              <button
                className={ticketType === "single" ? styles.ticketTypeToggleActive : styles.ticketTypeToggleBtn}
                onClick={() => setTicketType("single")}
                type="button"
              >
                <User size={14} /> Vé lẻ
              </button>
              <button
                className={ticketType === "group" ? styles.ticketTypeToggleActive : styles.ticketTypeToggleBtn}
                onClick={() => setTicketType("group")}
                type="button"
              >
                <Users size={14} /> Vé nhóm
              </button>
            </div>
          </div>
          <button onClick={onClose} title="Đóng" type="button"><X size={18} /></button>
        </header>

        {ticketType === "single" ? (
          <nav className={styles.contractSectionNav}>
            {[
              { num: 1, label: "Khách hàng", color: "blue" },
              { num: 2, label: "Dịch vụ", color: "green" },
              { num: 3, label: "DV đi kèm", color: "orange" },
              { num: 4, label: "Bảng giá", color: "purple" },
              { num: 5, label: "Thanh toán", color: "teal" },
            ].map((s) => (
              <button
                className={`${activeSection === s.num ? styles.contractSectionTabActive : styles.contractSectionTab} ${styles[`contractTab_${s.color}`] ?? ""}`}
                key={s.num}
                onClick={() => setActiveSection(s.num as 1 | 2 | 3 | 4 | 5)}
                type="button"
              >
                <span className={styles.contractSectionNumber}>{s.num}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </nav>
        ) : null}

        <div className={styles.contractFormBody}>
          {error ? <div className={styles.formError}><AlertCircle size={14} /> {error}</div> : null}

          {/* ============ SINGLE TICKET ============ */}
          {ticketType === "single" ? (
            <>
              {activeSection === 1 ? (
                <section className={`${styles.contractFormSection} ${styles.contractSectionBlue}`}>
                  <h3 className={styles.contractSectionHeader}><User size={16} /> 1. Thông tin khách hàng</h3>
                  <div className={styles.contractGrid2}>
                    <label>
                      <span>Tên khách hàng <b>*</b></span>
                      <div className={styles.selectControl}>
                        <select className={styles.selectInput} onChange={(e) => setCustomerCode(e.target.value)} value={customerCode} required>
                          {customers.map((c) => <option key={c.code} value={c.code}>{c.name} · {c.phone}</option>)}
                        </select>
                        <button className={styles.selectAction} onClick={() => setCustomerModalOpen(true)} type="button">
                          <UserPlus size={14} /> Thêm KH
                        </button>
                      </div>
                    </label>
                    <label>
                      <span>Số điện thoại</span>
                      <input readOnly value={selectedCustomer?.phone ?? ""} />
                    </label>
                    <label>
                      <span>Mã khách hàng</span>
                      <input readOnly value={selectedCustomer?.code ?? ""} />
                    </label>
                    <label>
                      <span>Trạng thái</span>
                      <input readOnly value={selectedCustomer ? `✓ ${selectedCustomer.isMember ? "Hội viên · " + (selectedCustomer.loyaltyPoints ?? 0) + " điểm" : "Khách thường"}` : ""} />
                    </label>
                  </div>
                  {selectedCustomer ? (
                    <div className={styles.ticketCustomerInfo}>
                      <Sparkles size={14} /> {selectedCustomer.isMember ? "Khách hàng là hội viên — được áp giá member nếu Bảng Giá có cấu hình." : "Khách vãng lai — áp giá Walk-in mặc định."}
                    </div>
                  ) : null}
                </section>
              ) : null}

              {activeSection === 2 ? (
                <section className={`${styles.contractFormSection} ${styles.contractSectionGreen}`}>
                  <h3 className={styles.contractSectionHeader}><TicketIcon size={16} /> 2. Thông tin dịch vụ</h3>
                  <div className={styles.contractGrid2}>
                    <label>
                      <span>Loại dịch vụ <b>*</b></span>
                      <div className={styles.selectControl}>
                        <select
                          className={styles.selectInput}
                          onChange={(e) => {
                            const cat = e.target.value;
                            const first = services.find((s) => {
                              const c = lookupCategory(s.categoryId, categories);
                              return c?.id === cat;
                            });
                            if (first) onPickService(first.code);
                          }}
                          value={selectedService?.categoryId ?? ""}
                        >
                          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <button className={styles.selectAction} onClick={() => setCategoryModalOpen(true)} type="button">
                          <Plus size={14} /> Thêm
                        </button>
                      </div>
                    </label>
                    <label>
                      <span>Tên dịch vụ <b>*</b></span>
                      <select className={styles.selectInput} onChange={(e) => onPickService(e.target.value)} value={serviceCode}>
                        {services.filter((s) => s.categoryId === selectedService?.categoryId).map((s) => (
                          <option key={s.code} value={s.code}>{s.name} · {formatCurrency(s.prices[tier])}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Ngày sử dụng <b>*</b></span>
                      <input
                        onChange={(e) => setTicketDate(e.target.value)}
                        placeholder="dd/mm/yyyy"
                        type="text"
                        value={ticketDate}
                      />
                    </label>
                    {selectedService?.needsTeeTime ? (
                      <label>
                        <span>Giờ ra sân (Tee-time) <b>*</b></span>
                        <input onChange={(e) => setTeeTime(e.target.value)} placeholder="HH:mm" type="text" value={teeTime} />
                      </label>
                    ) : (
                      <label>
                        <span>Số hộ tập (bay)</span>
                        <input onChange={(e) => setBayCount(Math.max(1, Number(e.target.value) || 1))} type="number" min={1} value={bayCount} />
                      </label>
                    )}
                    <label>
                      <span>Thời lượng (giờ)</span>
                      <input onChange={(e) => setDurationHours(Number(e.target.value) || 0)} type="number" step="0.5" min={0.5} value={durationHours} />
                    </label>
                    <label>
                      <span>Số người</span>
                      <input onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value) || 1))} type="number" min={1} value={guestCount} />
                    </label>
                    <label>
                      <span>Nhân viên xử lý</span>
                      <select className={styles.selectInput} onChange={(e) => setStaff(e.target.value)} value={staff}>
                        {STAFF_LIST.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </label>
                    <label>
                      <span>Chi nhánh</span>
                      <select className={styles.selectInput} onChange={(e) => setBranch(e.target.value)} value={branch}>
                        {BRANCHES.map((b) => <option key={b}>{b}</option>)}
                      </select>
                    </label>
                  </div>
                  <div className={styles.ticketTierBanner}>
                    <Tag size={14} />
                    Tier giá theo ngày <strong>{ticketDate}</strong>: <strong className={styles.ticketTierLabel}>
                      {tier === "weekday" ? "Ngày thường" : tier === "weekend" ? "Cuối tuần" : tier === "holiday" ? "Lễ tết" : "Giờ cao điểm"}
                    </strong> · Đơn giá <strong>{formatCurrency(tierPrice)}</strong> × {guestCount} = <strong>{formatCurrency(basePrice)}</strong>
                  </div>
                </section>
              ) : null}

              {activeSection === 3 ? (
                <section className={`${styles.contractFormSection} ${styles.contractSectionOrange}`}>
                  <h3 className={styles.contractSectionHeader}><ShoppingBag size={16} /> 3. Dịch vụ đi kèm</h3>
                  <div className={styles.ticketAddonQuickRow}>
                    {addons.slice(0, 4).map((cat) => {
                      const checked = singleAddons.some((a) => a.catalogId === cat.id);
                      return (
                        <button
                          className={checked ? styles.ticketAddonChipActive : styles.ticketAddonChip}
                          key={cat.id}
                          onClick={() => toggleQuickAddon(cat)}
                          type="button"
                        >
                          {checked ? <CheckCircle2 size={14} /> : <Plus size={14} />}
                          <strong>{cat.name}</strong>
                          <span>{formatCurrency(cat.unitPrice)}</span>
                        </button>
                      );
                    })}
                    <button className={styles.ticketAddonAddBtn} onClick={() => setAddonModalOpen({})} type="button">
                      <Plus size={14} /> Thêm DV khác
                    </button>
                  </div>
                  {singleAddons.length > 0 ? (
                    <table className={styles.ticketAddonTable}>
                      <thead>
                        <tr>
                          <th>Tên DV</th>
                          <th>SL</th>
                          <th>Đơn giá</th>
                          <th>VAT</th>
                          <th>Giảm giá</th>
                          <th>Thành tiền</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {singleAddons.map((a) => (
                          <tr key={a.id}>
                            <td><strong>{a.name}</strong>{a.note ? <em className={styles.cellMuted}> · {a.note}</em> : null}</td>
                            <td>
                              <input className={styles.ticketTableInput} type="number" min={1} value={a.quantity} onChange={(e) => updateSingleAddon(a.id, { quantity: Math.max(1, Number(e.target.value) || 1) })} />
                            </td>
                            <td>
                              <input className={styles.ticketTableInput} type="number" min={0} step={1000} value={a.unitPrice} onChange={(e) => updateSingleAddon(a.id, { unitPrice: Math.max(0, Number(e.target.value) || 0) })} />
                            </td>
                            <td>
                              <select className={styles.ticketTableInput} value={a.vatPercent} onChange={(e) => updateSingleAddon(a.id, { vatPercent: Number(e.target.value) })}>
                                {VAT_OPTIONS.map((v) => <option key={v} value={v}>{v}%</option>)}
                              </select>
                            </td>
                            <td>
                              <input className={styles.ticketTableInput} type="number" min={0} value={a.discount} onChange={(e) => updateSingleAddon(a.id, { discount: Math.max(0, Number(e.target.value) || 0) })} />
                            </td>
                            <td><strong>{formatCurrency(calculateAddonTotal(a))}</strong></td>
                            <td>
                              <button className={styles.contractRowRemove} onClick={() => removeSingleAddon(a.id)} type="button" title="Xóa"><X size={14} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={5} style={{ textAlign: "right" }}><strong>Tổng DV đi kèm:</strong></td>
                          <td colSpan={2}><strong className={styles.contractTotalCell}>{formatCurrency(addonsTotal)}</strong></td>
                        </tr>
                      </tfoot>
                    </table>
                  ) : (
                    <div className={styles.ticketEmptyHint}>Chưa có dịch vụ đi kèm. Click chip nhanh ở trên hoặc nút Thêm DV khác.</div>
                  )}
                </section>
              ) : null}

              {activeSection === 4 ? (
                <section className={`${styles.contractFormSection} ${styles.contractSectionPurple}`}>
                  <h3 className={styles.contractSectionHeader}><Receipt size={16} /> 4. Bảng giá chi tiết</h3>
                  <div className={styles.contractGrid2}>
                    <label>
                      <span>Voucher áp dụng</span>
                      <div className={styles.selectControl}>
                        <select className={styles.selectInput} onChange={(e) => setVoucherCode(e.target.value)} value={voucherCode}>
                          <option value="">— Không dùng voucher —</option>
                          {vouchers.filter((v) => v.active && v.quantityUsed < v.quantity && !isPastDate(v.endDate)).map((v) => (
                            <option key={v.code} value={v.code}>
                              {v.code} · {v.discountType === "percent" ? `${v.discountValue}%` : formatCurrency(v.discountValue)} · còn {v.quantity - v.quantityUsed}
                            </option>
                          ))}
                        </select>
                      </div>
                    </label>
                    <label>
                      <span>Giảm giá thủ công</span>
                      <div className={styles.contractDiscountInput}>
                        <input type="number" min={0} value={manualDiscount} onChange={(e) => setManualDiscount(Math.max(0, Number(e.target.value) || 0))} />
                        <select value={discountKind} onChange={(e) => setDiscountKind(e.target.value as "percent" | "amount")}>
                          <option value="amount">VNĐ</option>
                          <option value="percent">%</option>
                        </select>
                      </div>
                    </label>
                    <label>
                      <span>VAT chính (%)</span>
                      <select className={styles.selectInput} value={vatPercent} onChange={(e) => setVatPercent(Number(e.target.value))}>
                        {VAT_OPTIONS.map((v) => <option key={v} value={v}>{v}%</option>)}
                      </select>
                    </label>
                  </div>

                  {voucherWarning ? (
                    <div className={styles.formError}><AlertTriangle size={14} /> {voucherWarning}</div>
                  ) : null}

                  <table className={styles.ticketAddonTable}>
                    <thead>
                      <tr>
                        <th>Tên DV</th><th>SL</th><th>Đơn giá</th><th>VAT</th><th>Tiền VAT</th><th>Giảm giá</th><th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>{selectedService?.name ?? "—"}</strong></td>
                        <td>{guestCount}</td>
                        <td>{formatCurrency(tierPrice)}</td>
                        <td>{vatPercent}%</td>
                        <td>{formatCurrency(vatAmount)}</td>
                        <td>{formatCurrency(totalDiscount)}</td>
                        <td><strong className={styles.contractTotalCell}>{formatCurrency(afterDiscount + vatAmount)}</strong></td>
                      </tr>
                      {singleAddons.map((a) => (
                        <tr key={a.id}>
                          <td>{a.name}</td>
                          <td>{a.quantity}</td>
                          <td>{formatCurrency(a.unitPrice)}</td>
                          <td>{a.vatPercent}%</td>
                          <td>{formatCurrency(Math.round((a.unitPrice * a.quantity - a.discount) * a.vatPercent / 100))}</td>
                          <td>{formatCurrency(a.discount)}</td>
                          <td><strong>{formatCurrency(calculateAddonTotal(a))}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={6} style={{ textAlign: "right" }}><strong>TỔNG CỘNG:</strong></td>
                        <td><strong className={styles.ticketGrandTotal}>{formatCurrency(totalAmount)}</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </section>
              ) : null}

              {activeSection === 5 ? (
                <section className={`${styles.contractFormSection} ${styles.contractSectionTeal}`}>
                  <h3 className={styles.contractSectionHeader}><Wallet size={16} /> 5. Phương thức thanh toán</h3>
                  <div className={styles.contractTotalsCard}>
                    <div className={styles.contractTotalRow}>
                      <span>Tổng số tiền</span>
                      <strong className={styles.ticketGrandTotal}>{formatCurrency(totalAmount)}</strong>
                    </div>
                  </div>
                  <PaymentList
                    payments={payments}
                    onUpdate={updatePayment}
                    onRemove={removePayment}
                    onAdd={addPayment}
                    onFill={fillPaymentToTotal}
                    cashAtCounter={cashAtCounter}
                    onToggleCash={setCashAtCounter}
                  />
                  <div className={styles.contractPaymentSummary}>
                    <div><span>Đã thanh toán</span><strong>{formatCurrency(totalPaid)}</strong></div>
                    <div className={debt > 0 ? styles.contractDebtRow : styles.contractZeroRow}>
                      <span>{debt > 0 ? "Còn nợ" : "Tiền thừa"}</span>
                      <strong>{formatCurrency(Math.abs(debt))}</strong>
                    </div>
                  </div>
                  <label className={styles.fullField}>
                    <span>Ghi chú</span>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú thêm về vé này (nếu có)..." />
                  </label>
                </section>
              ) : null}
            </>
          ) : null}

          {/* ============ GROUP TICKET ============ */}
          {ticketType === "group" ? (
            <section className={`${styles.contractFormSection} ${styles.contractSectionBlue}`}>
              <h3 className={styles.contractSectionHeader}><Users size={16} /> Vé nhóm — {members.length} thành viên</h3>
              <div className={styles.contractGrid2}>
                <label>
                  <span>Nhân viên xử lý</span>
                  <select className={styles.selectInput} onChange={(e) => setStaff(e.target.value)} value={staff}>
                    {STAFF_LIST.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
                <label>
                  <span>Chi nhánh</span>
                  <select className={styles.selectInput} onChange={(e) => setBranch(e.target.value)} value={branch}>
                    {BRANCHES.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </label>
                <label className={styles.fullField}>
                  <span>Ghi chú chung</span>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú cho cả nhóm..." />
                </label>
              </div>

              <div className={styles.ticketMemberList}>
                {members.map((m, idx) => (
                  <MemberCard
                    key={m.id}
                    index={idx + 1}
                    member={m}
                    customers={customers}
                    services={services}
                    categories={categories}
                    onUpdate={(p) => updateMember(m.id, p)}
                    onRemove={() => removeMember(m.id)}
                    onAddAddon={() => setAddonModalOpen({ targetMember: m.id })}
                    onUpdateAddon={(addonId, p) => updateMemberAddon(m.id, addonId, p)}
                    onRemoveAddon={(addonId) => removeMemberAddon(m.id, addonId)}
                    total={calculateMemberTotal(m, services)}
                    canRemove={members.length > 2}
                  />
                ))}
              </div>
              <button className={styles.ticketAddMemberBtn} onClick={addMember} type="button">
                <PlusCircle size={16} /> Thêm thành viên
              </button>

              <div className={styles.ticketGroupTotalBanner}>
                <Users size={18} /> Tổng tiền cả nhóm <span>· {members.length} thành viên</span>
                <strong>{formatCurrency(groupTotal)}</strong>
              </div>

              <h3 className={styles.contractSectionHeader} style={{ marginTop: 16 }}><Wallet size={16} /> Thanh toán</h3>
              <PaymentList
                payments={payments}
                onUpdate={updatePayment}
                onRemove={removePayment}
                onAdd={addPayment}
                onFill={fillPaymentToTotal}
                cashAtCounter={cashAtCounter}
                onToggleCash={setCashAtCounter}
              />
              <div className={styles.contractPaymentSummary}>
                <div><span>Đã thanh toán</span><strong>{formatCurrency(totalPaid)}</strong></div>
                <div className={debt > 0 ? styles.contractDebtRow : styles.contractZeroRow}>
                  <span>{debt > 0 ? "Còn nợ" : "Tiền thừa"}</span>
                  <strong>{formatCurrency(Math.abs(debt))}</strong>
                </div>
              </div>
            </section>
          ) : null}
        </div>

        <footer className={styles.contractFormFooter}>
          <span>Tổng tiền vé:</span>
          <strong className={styles.ticketGrandTotal}>{formatCurrency(totalAmount)}</strong>
          <div>
            <button className={styles.contractFilterChip} onClick={onClose} type="button">Hủy</button>
            <button className={styles.greenButton} type="submit">
              <CheckCircle2 size={16} /> {isEdit ? "Cập nhật vé" : "Tạo vé"}
            </button>
          </div>
        </footer>
      </form>

      {customerModalOpen ? (
        <AddCustomerQuickModal
          existingCodes={customers.map((c) => c.code)}
          onClose={() => setCustomerModalOpen(false)}
          onSubmit={(c) => {
            onCreateCustomer(c);
            setCustomerCode(c.code);
            setCustomerModalOpen(false);
          }}
        />
      ) : null}

      {categoryModalOpen ? (
        <AddServiceCategoryModal
          existing={categories}
          onClose={() => setCategoryModalOpen(false)}
          onSubmit={(c) => {
            onCreateCategory(c);
            setCategoryModalOpen(false);
          }}
        />
      ) : null}

      {addonModalOpen ? (
        <AddAddonModal
          catalog={addons}
          onClose={() => setAddonModalOpen(null)}
          onCreateCatalog={(a) => onCreateAddon(a)}
          onPick={(line) => {
            if (addonModalOpen.targetMember) {
              addMemberAddon(addonModalOpen.targetMember, line);
            } else {
              setSingleAddons((prev) => [...prev, line]);
            }
            setAddonModalOpen(null);
          }}
        />
      ) : null}
    </div>
  );
}

function PaymentList({
  payments,
  onUpdate,
  onRemove,
  onAdd,
  onFill,
  cashAtCounter,
  onToggleCash,
}: {
  payments: PaymentEntry[];
  onUpdate: (id: string, p: Partial<PaymentEntry>) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
  onFill: () => void;
  cashAtCounter: boolean;
  onToggleCash: (v: boolean) => void;
}) {
  return (
    <div className={styles.contractPaymentList}>
      {payments.map((p) => (
        <div className={styles.contractPaymentRow} key={p.id}>
          <select
            className={styles.selectInput}
            onChange={(e) => onUpdate(p.id, { method: e.target.value as PaymentEntry["method"], account: e.target.value === "Tiền mặt" ? "CASH-FRONT" : e.target.value === "Chuyển khoản" ? "BANK-VCB" : "POS-Q1" })}
            value={p.method}
          >
            {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
          </select>
          <input
            onChange={(e) => onUpdate(p.id, { amount: Math.max(0, Number(e.target.value) || 0) })}
            placeholder="Số tiền"
            type="number"
            min={0}
            step={1000}
            value={p.amount}
          />
          <select className={styles.selectInput} onChange={(e) => onUpdate(p.id, { account: e.target.value })} value={p.account ?? ""}>
            {p.method === "Tiền mặt" ? CASH_FUNDS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>) : null}
            {p.method === "Chuyển khoản" ? BANK_ACCOUNTS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>) : null}
            {p.method === "Thẻ" ? POS_DEVICES.map((d) => <option key={d.id} value={d.id}>{d.label}</option>) : null}
          </select>
          {p.method !== "Tiền mặt" ? (
            <input
              onChange={(e) => onUpdate(p.id, { txRef: e.target.value })}
              placeholder="Mã giao dịch"
              type="text"
              value={p.txRef ?? ""}
            />
          ) : null}
          <button className={styles.contractRowRemove} onClick={() => onRemove(p.id)} disabled={payments.length === 1} type="button" title="Xóa">
            <X size={14} />
          </button>
        </div>
      ))}
      <div className={styles.ticketPaymentActions}>
        <button className={styles.contractLinkBtn} onClick={onAdd} type="button"><Plus size={14} /> Thêm dòng</button>
        <button className={styles.contractLinkBtn} onClick={onFill} type="button"><RefreshCcw size={14} /> Auto fill = tổng</button>
        <label className={styles.contractCheckboxLine}>
          <input checked={cashAtCounter} onChange={(e) => onToggleCash(e.target.checked)} type="checkbox" />
          Quỹ tiền mặt tại quầy
        </label>
      </div>
    </div>
  );
}

function MemberCard({
  index,
  member,
  customers,
  services,
  categories,
  onUpdate,
  onRemove,
  onAddAddon,
  onUpdateAddon,
  onRemoveAddon,
  total,
  canRemove,
}: {
  index: number;
  member: GroupMember;
  customers: CustomerLite[];
  services: ServiceItem[];
  categories: ServiceCategory[];
  onUpdate: (p: Partial<GroupMember>) => void;
  onRemove: () => void;
  onAddAddon: () => void;
  onUpdateAddon: (id: string, p: Partial<TicketAddonLine>) => void;
  onRemoveAddon: (id: string) => void;
  total: number;
  canRemove: boolean;
}) {
  const svc = lookupService(member.serviceCode, services);
  const tier = getTierForDate(member.ticketDate);
  return (
    <article className={styles.ticketMemberCard}>
      <header className={styles.ticketMemberHead}>
        <span className={styles.ticketMemberNumber}>{index}</span>
        <strong>Thành viên {index}</strong>
        {canRemove ? (
          <button className={styles.ticketMemberRemoveBtn} onClick={onRemove} type="button" title="Xóa thành viên">
            <Trash2 size={14} />
          </button>
        ) : null}
      </header>
      <div className={styles.contractGrid2}>
        <label>
          <span>Khách hàng <b>*</b></span>
          <select className={styles.selectInput} onChange={(e) => onUpdate({ customerCode: e.target.value })} value={member.customerCode}>
            {customers.map((c) => <option key={c.code} value={c.code}>{c.name} · {c.phone}</option>)}
          </select>
        </label>
        <label>
          <span>SĐT</span>
          <input readOnly value={lookupCustomer(member.customerCode, customers)?.phone ?? ""} />
        </label>
        <label>
          <span>Loại dịch vụ</span>
          <select
            className={styles.selectInput}
            onChange={(e) => {
              const cat = e.target.value;
              const first = services.find((s) => s.categoryId === cat);
              if (first) onUpdate({ serviceCode: first.code });
            }}
            value={svc?.categoryId ?? ""}
          >
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label>
          <span>Tên dịch vụ</span>
          <select className={styles.selectInput} onChange={(e) => onUpdate({ serviceCode: e.target.value })} value={member.serviceCode}>
            {services.filter((s) => s.categoryId === svc?.categoryId).map((s) => (
              <option key={s.code} value={s.code}>{s.name} · {formatCurrency(s.prices[tier])}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Ngày sử dụng</span>
          <input onChange={(e) => onUpdate({ ticketDate: e.target.value })} placeholder="dd/mm/yyyy" type="text" value={member.ticketDate} />
        </label>
        {svc?.needsTeeTime ? (
          <label>
            <span>Giờ ra sân</span>
            <input onChange={(e) => onUpdate({ teeTime: e.target.value })} placeholder="HH:mm" type="text" value={member.teeTime ?? ""} />
          </label>
        ) : (
          <label>
            <span>Số hộ</span>
            <input onChange={(e) => onUpdate({ bayCount: Math.max(1, Number(e.target.value) || 1) })} type="number" min={1} value={member.bayCount} />
          </label>
        )}
        <label>
          <span>Số người</span>
          <input onChange={(e) => onUpdate({ guestCount: Math.max(1, Number(e.target.value) || 1) })} type="number" min={1} value={member.guestCount} />
        </label>
        <label>
          <span>Giảm giá</span>
          <div className={styles.contractDiscountInput}>
            <input type="number" min={0} value={member.manualDiscount} onChange={(e) => onUpdate({ manualDiscount: Math.max(0, Number(e.target.value) || 0) })} />
            <select value={member.discountKind} onChange={(e) => onUpdate({ discountKind: e.target.value as "percent" | "amount" })}>
              <option value="amount">VNĐ</option>
              <option value="percent">%</option>
            </select>
          </div>
        </label>
      </div>

      <div className={styles.ticketMemberAddons}>
        <div className={styles.ticketMemberAddonHead}>
          <strong><ShoppingBag size={14} /> Dịch vụ đi kèm</strong>
          <button className={styles.contractLinkBtn} onClick={onAddAddon} type="button"><Plus size={14} /> Thêm</button>
        </div>
        {member.addons.length === 0 ? (
          <span className={styles.cellMuted}>Chưa có dịch vụ đi kèm</span>
        ) : (
          <table className={styles.ticketAddonTable}>
            <thead>
              <tr>
                <th>Tên</th><th>SL</th><th>Đơn giá</th><th>VAT</th><th>Thành tiền</th><th></th>
              </tr>
            </thead>
            <tbody>
              {member.addons.map((a) => (
                <tr key={a.id}>
                  <td>{a.name}</td>
                  <td><input className={styles.ticketTableInput} type="number" min={1} value={a.quantity} onChange={(e) => onUpdateAddon(a.id, { quantity: Math.max(1, Number(e.target.value) || 1) })} /></td>
                  <td><input className={styles.ticketTableInput} type="number" min={0} step={1000} value={a.unitPrice} onChange={(e) => onUpdateAddon(a.id, { unitPrice: Math.max(0, Number(e.target.value) || 0) })} /></td>
                  <td>{a.vatPercent}%</td>
                  <td><strong>{formatCurrency(calculateAddonTotal(a))}</strong></td>
                  <td><button className={styles.contractRowRemove} onClick={() => onRemoveAddon(a.id)} type="button"><X size={12} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <footer className={styles.ticketMemberFooter}>
        <span>Tổng thành viên {index}:</span>
        <strong>{formatCurrency(total)}</strong>
      </footer>
    </article>
  );
}

// =====================================================================================
// SECTION H — Sub-modals
// =====================================================================================

function AddCustomerQuickModal({
  existingCodes,
  onClose,
  onSubmit,
}: {
  existingCodes: string[];
  onClose: () => void;
  onSubmit: (c: CustomerLite) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<"Nam" | "Nữ">("Nam");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) { setError("Vui lòng nhập tên KH"); return; }
    if (!/^0\d{9,10}$/.test(phone.trim())) { setError("SĐT không hợp lệ (10-11 số bắt đầu bằng 0)"); return; }
    const max = Math.max(0, ...existingCodes.map((c) => parseInt(c.replace("HV", ""), 10)).filter((n) => !Number.isNaN(n)));
    const code = "HV" + String(max + 1).padStart(3, "0");
    onSubmit({ code, name: name.trim(), phone: phone.trim(), email: email.trim() || undefined, gender, birthDate: birthDate || undefined, isMember: false, loyaltyPoints: 0 });
  };

  return (
    <div className={styles.nestedOverlay} role="dialog" aria-modal="true">
      <form className={styles.ticketSubModal} onSubmit={submit}>
        <header><h3><UserPlus size={16} /> Thêm khách hàng nhanh</h3><button onClick={onClose} type="button"><X size={16} /></button></header>
        {error ? <div className={styles.formError}><AlertCircle size={14} /> {error}</div> : null}
        <div className={styles.contractGrid2}>
          <label>
            <span>Họ tên <b>*</b></span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Nguyễn Văn An" />
          </label>
          <label>
            <span>Số điện thoại <b>*</b></span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0901234567" />
          </label>
          <label>
            <span>Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@gmail.com" />
          </label>
          <label>
            <span>Giới tính</span>
            <select className={styles.selectInput} value={gender} onChange={(e) => setGender(e.target.value as "Nam" | "Nữ")}>
              <option>Nam</option>
              <option>Nữ</option>
            </select>
          </label>
          <label>
            <span>Ngày sinh</span>
            <input value={birthDate} onChange={(e) => setBirthDate(e.target.value)} placeholder="dd/mm/yyyy" />
          </label>
        </div>
        <footer>
          <button className={styles.contractFilterChip} onClick={onClose} type="button">Hủy</button>
          <button className={styles.greenButton} type="submit"><CheckCircle2 size={14} /> Lưu KH</button>
        </footer>
      </form>
    </div>
  );
}

function AddServiceCategoryModal({
  existing,
  onClose,
  onSubmit,
}: {
  existing: ServiceCategory[];
  onClose: () => void;
  onSubmit: (c: ServiceCategory) => void;
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [color, setColor] = useState<ColorKey>("purple");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onChangeName = (v: string) => {
    setName(v);
    if (!code) {
      const auto = v.toUpperCase().replace(/[^A-Z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
      setCode(auto);
    }
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) { setError("Vui lòng nhập tên loại DV"); return; }
    if (!code.trim()) { setError("Vui lòng nhập mã"); return; }
    if (existing.some((c) => c.code === code.trim())) { setError("Mã đã tồn tại"); return; }
    onSubmit({ id: `CAT-${Date.now()}`, name: name.trim(), code: code.trim(), color, description: description.trim() });
  };

  const colorPreview = lookupColor(color);

  return (
    <div className={styles.nestedOverlay} role="dialog" aria-modal="true">
      <form className={styles.ticketSubModal} onSubmit={submit}>
        <header><h3><Tag size={16} /> Thêm loại dịch vụ mới</h3><button onClick={onClose} type="button"><X size={16} /></button></header>
        {error ? <div className={styles.formError}><AlertCircle size={14} /> {error}</div> : null}
        <div className={styles.contractGrid2}>
          <label>
            <span>Tên loại dịch vụ <b>*</b></span>
            <input value={name} onChange={(e) => onChangeName(e.target.value)} placeholder="VD: Teetime, Practice, Combo..." />
          </label>
          <label>
            <span>Mã loại (auto-sinh) <b>*</b></span>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="VD: TEETIME, PRACTICE" />
          </label>
          <label className={styles.fullField}>
            <span>Mô tả</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả chi tiết về loại dịch vụ này..." />
          </label>
        </div>
        <div>
          <label className={styles.fullField}>
            <span>Màu sắc hiển thị</span>
          </label>
          <div className={styles.ticketColorPicker}>
            {COLOR_PALETTE.map((c) => (
              <button
                key={c.key}
                className={color === c.key ? styles.ticketColorOptionActive : styles.ticketColorOption}
                onClick={() => setColor(c.key)}
                style={{ background: c.bg, color: c.fg, borderColor: color === c.key ? c.dot : "transparent" }}
                type="button"
                title={c.label}
              >
                <span className={styles.ticketColorDot} style={{ background: c.dot }} />
                {c.label}
              </button>
            ))}
          </div>
          <div className={styles.ticketCategoryPreview}>
            Xem trước:
            <span className={styles.ticketCategoryBadge} style={{ background: colorPreview.bg, color: colorPreview.fg }}>
              {name || "Tên loại DV"}
            </span>
          </div>
        </div>
        <footer>
          <button className={styles.contractFilterChip} onClick={onClose} type="button">Hủy</button>
          <button className={styles.greenButton} type="submit"><CheckCircle2 size={14} /> Lưu loại DV</button>
        </footer>
      </form>
    </div>
  );
}

function AddAddonModal({
  catalog,
  onClose,
  onCreateCatalog,
  onPick,
}: {
  catalog: AddonCatalogItem[];
  onClose: () => void;
  onCreateCatalog: (a: AddonCatalogItem) => void;
  onPick: (line: TicketAddonLine) => void;
}) {
  const [mode, setMode] = useState<"catalog" | "freeform">("catalog");
  const [catalogId, setCatalogId] = useState<string>(catalog[0]?.id ?? "");
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [vat, setVat] = useState<number>(8);
  const [note, setNote] = useState("");
  const [saveToCatalog, setSaveToCatalog] = useState(false);
  const [category, setCategory] = useState<AddonCatalogItem["category"]>("Khác");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (mode === "catalog") {
      const item = catalog.find((c) => c.id === catalogId);
      if (!item) { setError("Vui lòng chọn DV trong bảng"); return; }
      onPick({ id: `TAL-${Date.now()}`, name: item.name, quantity, unitPrice: item.unitPrice, vatPercent: item.vatPercent, discount: 0, fromCatalog: true, catalogId: item.id, note: note || undefined });
    } else {
      if (!name.trim()) { setError("Vui lòng nhập tên DV"); return; }
      if (price < 0) { setError("Đơn giá không hợp lệ"); return; }
      const line: TicketAddonLine = { id: `TAL-${Date.now()}`, name: name.trim(), quantity, unitPrice: price, vatPercent: vat, discount: 0, fromCatalog: false, note: note || undefined };
      if (saveToCatalog) {
        onCreateCatalog({ id: `AD-${Date.now()}`, name: name.trim(), unitPrice: price, vatPercent: vat, category, description: note });
      }
      onPick(line);
    }
  };

  return (
    <div className={styles.nestedOverlay} role="dialog" aria-modal="true">
      <form className={styles.ticketSubModal} onSubmit={submit}>
        <header><h3><ShoppingBag size={16} /> Thêm dịch vụ đi kèm</h3><button onClick={onClose} type="button"><X size={16} /></button></header>
        {error ? <div className={styles.formError}><AlertCircle size={14} /> {error}</div> : null}
        <div className={styles.contractRadioRow}>
          <button className={mode === "catalog" ? styles.contractRadioActive : styles.contractRadio} onClick={() => setMode("catalog")} type="button">
            <Tag size={14} /> Chọn từ Bảng Giá
          </button>
          <button className={mode === "freeform" ? styles.contractRadioActive : styles.contractRadio} onClick={() => setMode("freeform")} type="button">
            <Edit3 size={14} /> Nhập tự do
          </button>
        </div>

        {mode === "catalog" ? (
          <div className={styles.contractGrid2}>
            <label className={styles.fullField}>
              <span>Dịch vụ <b>*</b></span>
              <select className={styles.selectInput} value={catalogId} onChange={(e) => setCatalogId(e.target.value)}>
                {catalog.map((c) => <option key={c.id} value={c.id}>{c.name} · {formatCurrency(c.unitPrice)} · VAT {c.vatPercent}%</option>)}
              </select>
            </label>
            <label>
              <span>Số lượng</span>
              <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))} />
            </label>
            <label className={styles.fullField}>
              <span>Ghi chú</span>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú đặc biệt (nếu có)" />
            </label>
          </div>
        ) : (
          <div className={styles.contractGrid2}>
            <label>
              <span>Tên DV <b>*</b></span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Nước suối, Khăn lạnh..." />
            </label>
            <label>
              <span>Đơn giá (VNĐ) <b>*</b></span>
              <input type="number" min={0} step={1000} value={price} onChange={(e) => setPrice(Math.max(0, Number(e.target.value) || 0))} />
            </label>
            <label>
              <span>Số lượng</span>
              <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))} />
            </label>
            <label>
              <span>VAT (%)</span>
              <select className={styles.selectInput} value={vat} onChange={(e) => setVat(Number(e.target.value))}>
                {VAT_OPTIONS.map((v) => <option key={v} value={v}>{v}%</option>)}
              </select>
            </label>
            <label>
              <span>Nhóm</span>
              <select className={styles.selectInput} value={category} onChange={(e) => setCategory(e.target.value as AddonCatalogItem["category"])}>
                <option>Caddie</option><option>Phương tiện</option><option>Trang bị</option><option>F&B</option><option>Khác</option>
              </select>
            </label>
            <label className={styles.fullField}>
              <span>Ghi chú</span>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Mô tả thêm" />
            </label>
            <label className={styles.contractCheckboxLine}>
              <input type="checkbox" checked={saveToCatalog} onChange={(e) => setSaveToCatalog(e.target.checked)} />
              Lưu vào danh mục để dùng lại sau
            </label>
          </div>
        )}

        <footer>
          <button className={styles.contractFilterChip} onClick={onClose} type="button">Hủy</button>
          <button className={styles.greenButton} type="submit"><CheckCircle2 size={14} /> Thêm vào vé</button>
        </footer>
      </form>
    </div>
  );
}
// =====================================================================================
// SECTION I IMPL — TicketDetailModal
// =====================================================================================

function TicketDetailModalImpl({
  ticket,
  customers,
  services,
  categories,
  onClose,
  onEdit,
  onPrintAddons,
  onPrintFull,
  onConfirm,
  onCancel,
}: {
  ticket: Ticket;
  customers: CustomerLite[];
  services: ServiceItem[];
  categories: ServiceCategory[];
  onClose: () => void;
  onEdit: () => void;
  onPrintAddons: () => void;
  onPrintFull: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const isGroup = ticket.type === "group";
  const customer = isGroup
    ? lookupCustomer(ticket.members?.[0]?.customerCode ?? "", customers)
    : lookupCustomer(ticket.customerCode ?? "", customers);
  const service = lookupService(ticket.serviceCode ?? "", services);
  const cat = service ? lookupCategory(service.categoryId, categories) : undefined;
  const debt = ticket.totalAmount - ticket.paid;
  const hasAddons = ticket.addons.length > 0 || (ticket.members?.some((m) => m.addons.length > 0) ?? false);

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.contractFormModal}>
        <header className={styles.contractFormBanner}>
          <div className={styles.ticketFormBannerLeft}>
            <h2>{ticket.id}</h2>
            <TicketStatusBadge status={ticket.status} />
            <span className={isGroup ? styles.ticketTypeGroup : styles.ticketTypeSingle}>
              {isGroup ? <Users size={12} /> : <User size={12} />}
              {isGroup ? `Nhóm · ${ticket.members?.length} thành viên` : "Vé lẻ"}
            </span>
          </div>
          <button onClick={onClose} title="Đóng" type="button"><X size={18} /></button>
        </header>

        <div className={styles.contractFormBody}>
          <section className={`${styles.contractFormSection} ${styles.contractSectionBlue}`}>
            <h3 className={styles.contractSectionHeader}><User size={16} /> Khách hàng</h3>
            <div className={styles.ticketDetailGrid}>
              <div><span>Tên KH</span><strong>{customer?.name ?? "—"}</strong></div>
              <div><span>SĐT</span><strong>{customer?.phone ?? "—"}</strong></div>
              <div><span>Mã KH</span><strong>{customer?.code ?? "—"}</strong></div>
              <div><span>Hội viên</span><strong>{customer?.isMember ? `Có · ${customer.loyaltyPoints} điểm` : "Không"}</strong></div>
            </div>
          </section>

          {!isGroup ? (
            <section className={`${styles.contractFormSection} ${styles.contractSectionGreen}`}>
              <h3 className={styles.contractSectionHeader}><TicketIcon size={16} /> Dịch vụ</h3>
              <div className={styles.ticketDetailGrid}>
                <div><span>Tên DV</span><strong>{service?.name ?? "—"}</strong></div>
                <div><span>Loại</span><strong>{cat ? <ServiceCategoryBadge category={cat} /> : "—"}</strong></div>
                <div><span>Ngày sử dụng</span><strong><Calendar size={12} /> {ticket.ticketDate}</strong></div>
                {ticket.teeTime ? <div><span>Giờ ra sân</span><strong><Clock size={12} /> {ticket.teeTime}</strong></div> : null}
                <div><span>Thời lượng</span><strong>{ticket.durationHours} giờ</strong></div>
                <div><span>Số người</span><strong>{ticket.guestCount}</strong></div>
                <div><span>Chi nhánh</span><strong>{ticket.branch}</strong></div>
                <div><span>NV xử lý</span><strong>{ticket.staff}</strong></div>
              </div>
            </section>
          ) : (
            <section className={`${styles.contractFormSection} ${styles.contractSectionGreen}`}>
              <h3 className={styles.contractSectionHeader}><Users size={16} /> Thành viên nhóm</h3>
              <table className={styles.ticketAddonTable}>
                <thead>
                  <tr><th>#</th><th>KH</th><th>DV</th><th>Ngày & giờ</th><th>SL</th><th>Add-ons</th><th>Thành tiền</th></tr>
                </thead>
                <tbody>
                  {ticket.members?.map((m, i) => {
                    const c = lookupCustomer(m.customerCode, customers);
                    const s = lookupService(m.serviceCode, services);
                    return (
                      <tr key={m.id}>
                        <td><span className={styles.ticketMemberNumber}>{i + 1}</span></td>
                        <td><strong>{c?.name}</strong><br /><span className={styles.cellMuted}>{c?.phone}</span></td>
                        <td>{s?.name}</td>
                        <td>{m.ticketDate}{m.teeTime ? ` · ${m.teeTime}` : ""}</td>
                        <td>{m.guestCount}</td>
                        <td>{m.addons.map((a) => a.name).join(", ") || "—"}</td>
                        <td><strong>{formatCurrency(calculateMemberTotal(m, services))}</strong></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          )}

          {hasAddons && !isGroup ? (
            <section className={`${styles.contractFormSection} ${styles.contractSectionOrange}`}>
              <h3 className={styles.contractSectionHeader}><ShoppingBag size={16} /> Dịch vụ đi kèm</h3>
              <table className={styles.ticketAddonTable}>
                <thead><tr><th>Tên</th><th>SL</th><th>Đơn giá</th><th>VAT</th><th>Giảm giá</th><th>Thành tiền</th></tr></thead>
                <tbody>
                  {ticket.addons.map((a) => (
                    <tr key={a.id}>
                      <td>{a.name}</td><td>{a.quantity}</td><td>{formatCurrency(a.unitPrice)}</td>
                      <td>{a.vatPercent}%</td><td>{formatCurrency(a.discount)}</td>
                      <td><strong>{formatCurrency(calculateAddonTotal(a))}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : null}

          <section className={`${styles.contractFormSection} ${styles.contractSectionTeal}`}>
            <h3 className={styles.contractSectionHeader}><Wallet size={16} /> Thanh toán</h3>
            <div className={styles.contractTotalsCard}>
              <div className={styles.contractTotalRow}><span>Tổng tiền</span><strong className={styles.ticketGrandTotal}>{formatCurrency(ticket.totalAmount)}</strong></div>
              <div className={styles.contractTotalRow}><span>Đã thanh toán</span><strong className={styles.contractPaidCell}>{formatCurrency(ticket.paid)}</strong></div>
              <div className={debt > 0 ? styles.contractDebtRow : styles.contractZeroRow}><span>{debt > 0 ? "Còn nợ" : "Đã thanh toán đủ"}</span><strong>{formatCurrency(Math.abs(debt))}</strong></div>
              {ticket.voucherCode ? <div className={styles.contractTotalRow}><span>Voucher</span><strong className={styles.ticketGrandTotal}>{ticket.voucherCode} · −{formatCurrency(ticket.voucherDiscount)}</strong></div> : null}
            </div>
            {ticket.payments.length > 0 ? (
              <table className={styles.ticketAddonTable}>
                <thead><tr><th>Phương thức</th><th>Tài khoản</th><th>Mã GD</th><th>Số tiền</th></tr></thead>
                <tbody>
                  {ticket.payments.map((p) => (
                    <tr key={p.id}>
                      <td>{p.method}</td><td>{p.account ?? "—"}</td><td>{p.txRef ?? "—"}</td>
                      <td><strong>{formatCurrency(p.amount)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <span className={styles.cellMuted}>Chưa có giao dịch thanh toán</span>}
          </section>

          {ticket.note ? (
            <section className={styles.contractFormSection}>
              <h3 className={styles.contractSectionHeader}>Ghi chú</h3>
              <p className={styles.ticketDetailNote}>{ticket.note}</p>
            </section>
          ) : null}

          {ticket.status === "cancelled" ? (
            <section className={styles.contractFormSection}>
              <h3 className={styles.contractSectionHeader} style={{ background: "#dc2626" }}><XCircle size={16} /> Vé đã hủy</h3>
              <p className={styles.ticketDetailNote}><strong>Lý do:</strong> {ticket.cancellationReason}</p>
              <p className={styles.cellMuted}>Hủy lúc: {ticket.cancelledAt}</p>
            </section>
          ) : null}

          <section className={styles.contractFormSection}>
            <h3 className={styles.contractSectionHeader}><Hash size={16} /> Lịch sử giao dịch</h3>
            <ul className={styles.contractTimeline}>
              {ticket.history.map((h, i) => (
                <li key={i}>
                  <span className={styles.contractTimelineDot} />
                  <strong>{h.action}</strong>
                  <span>{h.date} · {h.actor}{h.detail ? ` · ${h.detail}` : ""}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <footer className={styles.contractFormFooter}>
          <span>Tổng:</span>
          <strong className={styles.ticketGrandTotal}>{formatCurrency(ticket.totalAmount)}</strong>
          <div>
            {ticket.status === "pending" ? (
              <button className={styles.greenButton} onClick={onConfirm} type="button">
                <CheckCircle2 size={14} /> Xác nhận & thu
              </button>
            ) : null}
            {hasAddons ? (
              <button className={styles.contractFilterChip} onClick={onPrintAddons} type="button">
                <Printer size={14} /> In bill DV đi kèm
              </button>
            ) : null}
            <button className={styles.contractFilterChip} onClick={onPrintFull} type="button">
              <Receipt size={14} /> In bill tổng
            </button>
            {ticket.status !== "cancelled" ? (
              <>
                <button className={styles.contractFilterChip} onClick={onEdit} type="button"><Edit3 size={14} /> Sửa</button>
                <button className={styles.contractFilterChip} onClick={onCancel} type="button" style={{ color: "#b91c1c" }}><Trash2 size={14} /> Hủy vé</button>
              </>
            ) : null}
          </div>
        </footer>
      </div>
    </div>
  );
}
// =====================================================================================
// SECTION J IMPL — BillReceiptModal (in bill DV đi kèm hoặc bill tổng + QR)
// =====================================================================================

function BillReceiptModalImpl({
  ticket,
  mode,
  customers,
  services,
  onClose,
  flash,
}: {
  ticket: Ticket;
  mode: "addons" | "full";
  customers: CustomerLite[];
  services: ServiceItem[];
  onClose: () => void;
  flash: (m: string) => void;
}) {
  const isGroup = ticket.type === "group";
  const customer = isGroup
    ? lookupCustomer(ticket.members?.[0]?.customerCode ?? "", customers)
    : lookupCustomer(ticket.customerCode ?? "", customers);
  const service = lookupService(ticket.serviceCode ?? "", services);

  const allAddons: TicketAddonLine[] = isGroup
    ? (ticket.members?.flatMap((m) => m.addons) ?? [])
    : ticket.addons;
  const addonsSubtotal = allAddons.reduce((s, a) => s + a.unitPrice * a.quantity - a.discount, 0);
  const addonsVat = allAddons.reduce((s, a) => s + Math.round((a.unitPrice * a.quantity - a.discount) * a.vatPercent / 100), 0);
  const addonsTotal = addonsSubtotal + addonsVat;

  const qrPayload = JSON.stringify({
    id: ticket.id,
    mode,
    total: mode === "addons" ? addonsTotal : ticket.totalAmount,
    addons: allAddons.length,
    date: getTicketRefDate(ticket),
  });
  const qr = makeQrMatrix(qrPayload);

  const printNow = () => {
    window.print();
    flash(`Đang in bill ${mode === "addons" ? "DV đi kèm" : "tổng"} cho ${ticket.id}`);
  };

  const downloadAsImage = () => {
    flash(`Đã tải xuống bill ${ticket.id}.pdf`);
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.ticketBillModal}>
        <header className={styles.contractFormBanner}>
          <h2><Printer size={16} /> {mode === "addons" ? "Bill Dịch Vụ Đi Kèm" : "Bill Tổng"} · {ticket.id}</h2>
          <button onClick={onClose} title="Đóng" type="button"><X size={18} /></button>
        </header>

        <div className={styles.ticketBillBody}>
          <div className={styles.ticketReceipt}>
            <header className={styles.ticketReceiptHead}>
              <strong>NEXTVISION GOLF CLUB</strong>
              <span>{ticket.branch}</span>
              <em>www.nextvision-golf.vn · Hotline: 1900 1234</em>
              <hr />
              <h3>{mode === "addons" ? "BILL DỊCH VỤ ĐI KÈM" : "BILL TỔNG VÉ LẺ"}</h3>
            </header>

            <div className={styles.ticketReceiptMeta}>
              <div><span>Mã vé:</span><strong>{ticket.id}</strong></div>
              <div><span>Ngày in:</span><strong>{nowString()}</strong></div>
              <div><span>Khách hàng:</span><strong>{customer?.name}</strong></div>
              <div><span>SĐT:</span><strong>{customer?.phone}</strong></div>
              {!isGroup && service ? (
                <>
                  <div><span>Dịch vụ chính:</span><strong>{service.name}</strong></div>
                  <div><span>Ngày sử dụng:</span><strong>{ticket.ticketDate}{ticket.teeTime ? ` · ${ticket.teeTime}` : ""}</strong></div>
                </>
              ) : null}
              {isGroup ? <div><span>Số thành viên:</span><strong>{ticket.members?.length}</strong></div> : null}
              <div><span>NV xử lý:</span><strong>{ticket.staff}</strong></div>
            </div>

            <table className={styles.ticketReceiptTable}>
              <thead>
                <tr><th>Mục</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr>
              </thead>
              <tbody>
                {mode === "full" && !isGroup && service ? (
                  <tr>
                    <td><strong>{service.name}</strong></td>
                    <td>{ticket.guestCount}</td>
                    <td>{formatCurrency(ticket.basePrice / (ticket.guestCount || 1))}</td>
                    <td><strong>{formatCurrency(ticket.basePrice)}</strong></td>
                  </tr>
                ) : null}
                {mode === "full" && isGroup ? ticket.members?.map((m) => {
                  const s = lookupService(m.serviceCode, services);
                  const c = lookupCustomer(m.customerCode, customers);
                  const tier = getTierForDate(m.ticketDate);
                  const price = (s?.prices[tier] ?? 0) * m.guestCount;
                  return (
                    <tr key={m.id}>
                      <td><strong>{s?.name}</strong> · {c?.name}</td>
                      <td>{m.guestCount}</td>
                      <td>{formatCurrency(s?.prices[tier] ?? 0)}</td>
                      <td><strong>{formatCurrency(price)}</strong></td>
                    </tr>
                  );
                }) : null}
                {allAddons.map((a) => (
                  <tr key={a.id}>
                    <td>{a.name}</td>
                    <td>{a.quantity}</td>
                    <td>{formatCurrency(a.unitPrice)}</td>
                    <td><strong>{formatCurrency(a.unitPrice * a.quantity - a.discount)}</strong></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {mode === "addons" ? (
                  <>
                    <tr><td colSpan={3}>Tạm tính</td><td><strong>{formatCurrency(addonsSubtotal)}</strong></td></tr>
                    <tr><td colSpan={3}>VAT</td><td><strong>{formatCurrency(addonsVat)}</strong></td></tr>
                    <tr><td colSpan={3} className={styles.ticketReceiptTotalLabel}>TỔNG CỘNG</td><td><strong className={styles.ticketReceiptGrandTotal}>{formatCurrency(addonsTotal)}</strong></td></tr>
                  </>
                ) : (
                  <>
                    {ticket.voucherCode ? <tr><td colSpan={3}>Voucher {ticket.voucherCode}</td><td>−{formatCurrency(ticket.voucherDiscount)}</td></tr> : null}
                    <tr><td colSpan={3}>VAT</td><td>{formatCurrency(Math.round(ticket.totalAmount - ticket.totalAmount / (1 + ticket.vatPercent / 100)))}</td></tr>
                    <tr><td colSpan={3} className={styles.ticketReceiptTotalLabel}>TỔNG CỘNG</td><td><strong className={styles.ticketReceiptGrandTotal}>{formatCurrency(ticket.totalAmount)}</strong></td></tr>
                    <tr><td colSpan={3}>Đã thanh toán</td><td>{formatCurrency(ticket.paid)}</td></tr>
                  </>
                )}
              </tfoot>
            </table>

            <div className={styles.ticketReceiptQrBlock}>
              <div className={styles.ticketReceiptQrSvgWrap}>
                <svg viewBox={`0 0 ${qr.length} ${qr.length}`} width="120" height="120" className={styles.ticketReceiptQr}>
                  <rect width={qr.length} height={qr.length} fill="#ffffff" />
                  {qr.map((row, r) => row.map((cell, c) => cell ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#0f172a" /> : null))}
                </svg>
              </div>
              <div className={styles.ticketReceiptQrInfo}>
                <strong><QrCode size={14} /> Quét QR để check-in</strong>
                <span>Quét bằng app nội bộ tại starter house</span>
                <em>Mã: {ticket.id}</em>
              </div>
            </div>

            <footer className={styles.ticketReceiptFoot}>
              <span>Cảm ơn quý khách đã sử dụng dịch vụ. Chúc một vòng golf vui vẻ!</span>
              <em>Bill này có giá trị thay phiếu thu — Module 10 Sổ Quỹ.</em>
            </footer>
          </div>
        </div>

        <footer className={styles.contractFormFooter}>
          <span></span>
          <div>
            <button className={styles.contractFilterChip} onClick={onClose} type="button">Đóng</button>
            <button className={styles.contractFilterChip} onClick={downloadAsImage} type="button"><Download size={14} /> Tải PDF</button>
            <button className={styles.greenButton} onClick={printNow} type="button"><Printer size={14} /> In ngay</button>
          </div>
        </footer>
      </div>
    </div>
  );
}
// =====================================================================================
// SECTION K IMPL — Dialogs (Cancel / Confirm)
// =====================================================================================

function CancelTicketDialogImpl({
  ticket,
  onCancel,
  onConfirm,
}: {
  ticket: Ticket;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const presets = ["Khách hủy do thời tiết xấu", "Khách bận đột xuất", "Trùng lịch khác", "Sai thông tin vé", "Khác"];

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Vui lòng nhập lý do hủy");
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <form className={styles.ticketDialog} onSubmit={submit}>
        <header>
          <span className={styles.ticketDialogIcon} style={{ background: "#fee2e2", color: "#b91c1c" }}>
            <AlertTriangle size={20} />
          </span>
          <div>
            <h3>Xác nhận hủy vé {ticket.id}</h3>
            <p>Bạn có chắc chắn muốn hủy vé lẻ này? Vé sẽ chuyển sang trạng thái <strong>Đã hủy</strong> (Soft Delete · BR-M4-07). Dữ liệu vẫn được giữ cho báo cáo.</p>
          </div>
        </header>
        {error ? <div className={styles.formError}><AlertCircle size={14} /> {error}</div> : null}
        <div className={styles.ticketDialogBody}>
          <label>
            <span>Lý do hủy <b>*</b></span>
            <select className={styles.selectInput} value={presets.includes(reason) ? reason : "Khác"} onChange={(e) => setReason(e.target.value === "Khác" ? "" : e.target.value)}>
              <option value="">— Chọn lý do —</option>
              {presets.map((p) => <option key={p}>{p}</option>)}
            </select>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Hoặc nhập lý do tự do..." style={{ marginTop: 8 }} />
          </label>
        </div>
        <footer>
          <button className={styles.contractFilterChip} onClick={onCancel} type="button">Hủy bỏ</button>
          <button className={styles.ticketDialogDanger} type="submit"><Trash2 size={14} /> Xác nhận hủy vé</button>
        </footer>
      </form>
    </div>
  );
}

function ConfirmTicketDialogImpl({
  ticket,
  customers,
  onCancel,
  onConfirm,
}: {
  ticket: Ticket;
  customers: CustomerLite[];
  services: ServiceItem[];
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const customer = ticket.type === "single"
    ? lookupCustomer(ticket.customerCode ?? "", customers)
    : lookupCustomer(ticket.members?.[0]?.customerCode ?? "", customers);
  const debt = ticket.totalAmount - ticket.paid;

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.ticketDialog}>
        <header>
          <span className={styles.ticketDialogIcon} style={{ background: "#dcfce7", color: "#15803d" }}>
            <CheckCircle2 size={20} />
          </span>
          <div>
            <h3>Xác nhận vé {ticket.id}</h3>
            <p>Hệ thống sẽ thu đủ <strong>{formatCurrency(ticket.totalAmount)}</strong> bằng tiền mặt tại quầy{debt > 0 ? ` (đang còn nợ ${formatCurrency(debt)})` : ""}. Sau khi xác nhận, Module 10 Sổ Quỹ sẽ tự sinh phiếu thu PT (BR-M4-09).</p>
          </div>
        </header>
        <div className={styles.ticketDialogBody}>
          <div className={styles.ticketDialogInfo}>
            <div><span>Khách hàng</span><strong>{customer?.name} · {customer?.phone}</strong></div>
            <div><span>Tổng tiền</span><strong className={styles.ticketGrandTotal}>{formatCurrency(ticket.totalAmount)}</strong></div>
            <div><span>Đã thu</span><strong>{formatCurrency(ticket.paid)}</strong></div>
            <div><span>Sẽ thu thêm</span><strong style={{ color: debt > 0 ? "#ea580c" : "#16a34a" }}>{formatCurrency(Math.max(0, debt))}</strong></div>
          </div>
        </div>
        <footer>
          <button className={styles.contractFilterChip} onClick={onCancel} type="button">Hủy bỏ</button>
          <button className={styles.greenButton} onClick={onConfirm} type="button">
            <CheckCircle2 size={14} /> Xác nhận & sinh phiếu thu
          </button>
        </footer>
      </div>
    </div>
  );
}
// =====================================================================================
// SECTION L IMPL — Tab "Vouchers"
// =====================================================================================

function VoucherListTabImpl({
  vouchers,
  onChange,
  categories,
  flash,
}: {
  vouchers: Voucher[];
  onChange: (v: Voucher[]) => void;
  categories: ServiceCategory[];
  flash: (m: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "expired">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Voucher | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Voucher | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Voucher | null>(null);

  const filtered = useMemo(() => {
    return vouchers.filter((v) => {
      if (statusFilter === "active" && (!v.active || isPastDate(v.endDate))) return false;
      if (statusFilter === "inactive" && v.active) return false;
      if (statusFilter === "expired" && !isPastDate(v.endDate)) return false;
      if (query) {
        const target = `${v.code} ${v.name} ${v.description}`.toLowerCase();
        if (!target.includes(query.toLowerCase())) return false;
      }
      return true;
    });
  }, [vouchers, statusFilter, query]);

  const stats = useMemo(() => ({
    total: vouchers.length,
    active: vouchers.filter((v) => v.active && !isPastDate(v.endDate)).length,
    issued: vouchers.reduce((s, v) => s + v.quantity, 0),
    used: vouchers.reduce((s, v) => s + v.quantityUsed, 0),
  }), [vouchers]);

  const submit = (next: Voucher) => {
    const exists = vouchers.find((v) => v.code === next.code);
    onChange(exists ? vouchers.map((v) => v.code === next.code ? next : v) : [next, ...vouchers]);
    flash(`${exists ? "Đã cập nhật" : "Đã tạo"} voucher ${next.code}`);
    setFormOpen(false);
    setEditing(null);
  };

  const toggle = (target: Voucher) => {
    onChange(vouchers.map((v) => v.code === target.code ? { ...v, active: !v.active } : v));
    flash(`Voucher ${target.code} đã ${target.active ? "tắt" : "bật"} kích hoạt`);
    setToggleTarget(null);
  };

  const remove = (target: Voucher) => {
    onChange(vouchers.filter((v) => v.code !== target.code));
    flash(`Đã xóa voucher ${target.code}`);
    setDeleteTarget(null);
  };

  const copyCode = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => undefined);
    }
    flash(`Đã copy mã ${code}`);
  };

  return (
    <>
      <div className={styles.contractKpi}>
        <KpiCard label="Tổng vouchers" value={String(stats.total)} tone="blue" icon={Gift} />
        <KpiCard label="Đang hoạt động" value={String(stats.active)} tone="green" icon={CheckCircle2} />
        <KpiCard label="Tổng phát hành" value={formatNumber(stats.issued)} tone="purple" icon={Hash} />
        <KpiCard label="Đã sử dụng" value={formatNumber(stats.used)} tone="amber" icon={Sparkles} />
      </div>

      <div className={styles.contractListSearchRow}>
        <div className={styles.pricingSearch} style={{ flex: 1 }}>
          <Search size={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo mã, tên, mô tả..." />
        </div>
      </div>

      <div className={styles.contractListChipRow}>
        <div className={styles.contractFilterChips}>
          {[
            { key: "all", label: "Tất cả" },
            { key: "active", label: "Đang hoạt động" },
            { key: "inactive", label: "Đã tắt" },
            { key: "expired", label: "Hết hạn" },
          ].map((opt) => (
            <button
              className={statusFilter === opt.key ? styles.contractFilterActive : styles.contractFilterChip}
              key={opt.key}
              onClick={() => setStatusFilter(opt.key as typeof statusFilter)}
              type="button"
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className={styles.contractListActions}>
          <button className={styles.greenButton} onClick={() => { setEditing(null); setFormOpen(true); }} type="button">
            <PlusCircle size={16} /> Tạo voucher
          </button>
        </div>
      </div>

      <div className={styles.ticketVoucherGrid}>
        {filtered.length === 0 ? (
          <div className={styles.ticketEmptyVoucher}>
            <Gift size={32} />
            <strong>Chưa có voucher nào khớp bộ lọc</strong>
            <span>Thử thay đổi bộ lọc hoặc tạo voucher mới</span>
          </div>
        ) : null}
        {filtered.map((v) => {
          const expired = isPastDate(v.endDate);
          const usedPct = v.quantity > 0 ? Math.round((v.quantityUsed / v.quantity) * 100) : 0;
          return (
            <article className={`${styles.ticketVoucherCard} ${!v.active || expired ? styles.ticketVoucherCardOff : ""}`} key={v.code}>
              <header className={styles.ticketVoucherHead}>
                <div>
                  <strong>{v.name}</strong>
                  <span>{v.description}</span>
                </div>
                <button
                  className={v.active ? styles.ticketVoucherToggleOn : styles.ticketVoucherToggleOff}
                  onClick={() => setToggleTarget(v)}
                  type="button"
                  title={v.active ? "Tắt voucher" : "Bật voucher"}
                >
                  <span className={styles.ticketVoucherToggleDot} />
                </button>
              </header>
              <div className={styles.ticketVoucherCode}>
                <code>{v.code}</code>
                <button onClick={() => copyCode(v.code)} type="button" title="Copy mã"><Copy size={12} /></button>
              </div>
              <div className={styles.ticketVoucherDiscount}>
                <strong>{v.discountType === "percent" ? `${v.discountValue}%` : formatCurrency(v.discountValue)}</strong>
                <span>{v.discountType === "percent" ? `Tối đa ${v.maxDiscount ? formatCurrency(v.maxDiscount) : "không giới hạn"}` : "Giảm cố định"}</span>
                {v.minOrder ? <em>Đơn tối thiểu {formatCurrency(v.minOrder)}</em> : null}
              </div>
              {v.applyToCategoryIds.length > 0 ? (
                <div className={styles.ticketVoucherCats}>
                  {v.applyToCategoryIds.map((id) => {
                    const c = lookupCategory(id, categories);
                    return c ? <ServiceCategoryBadge key={id} category={c} /> : null;
                  })}
                </div>
              ) : (
                <div className={styles.ticketVoucherCats}><span className={styles.ticketCategoryBadge}>Áp dụng tất cả DV</span></div>
              )}
              <div className={styles.ticketVoucherProgress}>
                <div className={styles.ticketVoucherProgressBar}>
                  <span style={{ width: `${usedPct}%` }} />
                </div>
                <em>Đã dùng {v.quantityUsed}/{v.quantity} ({usedPct}%)</em>
              </div>
              <div className={styles.ticketVoucherDates}>
                <Calendar size={12} /> {v.startDate} → {v.endDate}
                {expired ? <span className={styles.ticketVoucherExpired}>HẾT HẠN</span> : null}
              </div>
              <footer className={styles.ticketVoucherFooter}>
                <em>Tạo: {v.createdAt}</em>
                <div>
                  <button onClick={() => setToggleTarget(v)} title={v.active ? "Tắt" : "Bật"} type="button"><Power size={14} /></button>
                  <button onClick={() => { setEditing(v); setFormOpen(true); }} title="Sửa" type="button"><Edit3 size={14} /></button>
                  <button className={styles.contractDelete} onClick={() => setDeleteTarget(v)} title="Xóa" type="button"><Trash2 size={14} /></button>
                </div>
              </footer>
            </article>
          );
        })}
      </div>

      {formOpen ? (
        <VoucherFormModal
          initial={editing}
          existing={vouchers}
          categories={categories}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSubmit={submit}
        />
      ) : null}

      {toggleTarget ? (
        <ToggleVoucherDialog
          voucher={toggleTarget}
          onCancel={() => setToggleTarget(null)}
          onConfirm={() => toggle(toggleTarget)}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteVoucherDialog
          voucher={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => remove(deleteTarget)}
        />
      ) : null}
    </>
  );
}

function VoucherFormModal({
  initial,
  existing,
  categories,
  onClose,
  onSubmit,
}: {
  initial: Voucher | null;
  existing: Voucher[];
  categories: ServiceCategory[];
  onClose: () => void;
  onSubmit: (v: Voucher) => void;
}) {
  const isEdit = Boolean(initial);
  const [code, setCode] = useState(initial?.code ?? generateVoucherCode());
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">(initial?.discountType ?? "percent");
  const [discountValue, setDiscountValue] = useState<number>(initial?.discountValue ?? 10);
  const [maxDiscount, setMaxDiscount] = useState<number>(initial?.maxDiscount ?? 0);
  const [minOrder, setMinOrder] = useState<number>(initial?.minOrder ?? 0);
  const [applyToCategoryIds, setApplyToCategoryIds] = useState<string[]>(initial?.applyToCategoryIds ?? []);
  const [quantity, setQuantity] = useState<number>(initial?.quantity ?? 100);
  const [startDate, setStartDate] = useState(initial?.startDate ?? todayString());
  const [endDate, setEndDate] = useState(initial?.endDate ?? "31/12/2026");
  const [active, setActive] = useState(initial?.active ?? true);
  const [error, setError] = useState<string | null>(null);

  const toggleCategory = (id: string) => {
    setApplyToCategoryIds((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!code.trim()) { setError("Vui lòng nhập mã voucher"); return; }
    if (!isEdit && existing.some((v) => v.code === code.trim())) { setError("Mã voucher đã tồn tại"); return; }
    if (!name.trim()) { setError("Vui lòng nhập tên voucher"); return; }
    if (discountValue <= 0) { setError("Giá trị giảm phải > 0"); return; }
    if (discountType === "percent" && discountValue > 100) { setError("% giảm tối đa 100%"); return; }
    if (quantity <= 0) { setError("Số lượng phát hành phải > 0"); return; }
    const a = parseDDMMYYYY(startDate);
    const b = parseDDMMYYYY(endDate);
    if (!a || !b) { setError("Ngày không hợp lệ (dd/mm/yyyy)"); return; }
    if (b.getTime() <= a.getTime()) { setError("Ngày kết thúc phải sau ngày bắt đầu"); return; }

    onSubmit({
      code: code.trim(),
      name: name.trim(),
      description: description.trim(),
      discountType,
      discountValue,
      maxDiscount: discountType === "percent" && maxDiscount > 0 ? maxDiscount : undefined,
      minOrder: minOrder > 0 ? minOrder : undefined,
      applyToCategoryIds,
      quantity,
      quantityUsed: initial?.quantityUsed ?? 0,
      startDate,
      endDate,
      active,
      createdAt: initial?.createdAt ?? nowString(),
    });
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <form className={styles.contractFormModal} onSubmit={submit}>
        <header className={styles.contractFormBanner}>
          <h2><Gift size={16} /> {isEdit ? `Chỉnh sửa voucher ${initial?.code}` : "Tạo voucher mới"}</h2>
          <button onClick={onClose} title="Đóng" type="button"><X size={18} /></button>
        </header>
        <div className={styles.contractFormBody}>
          {error ? <div className={styles.formError}><AlertCircle size={14} /> {error}</div> : null}

          <section className={`${styles.contractFormSection} ${styles.contractSectionBlue}`}>
            <h3 className={styles.contractSectionHeader}>1. Thông tin cơ bản</h3>
            <div className={styles.contractGrid2}>
              <label>
                <span>Mã voucher <b>*</b></span>
                <div className={styles.selectControl}>
                  <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} disabled={isEdit} />
                  {!isEdit ? (
                    <button className={styles.selectAction} onClick={() => setCode(generateVoucherCode())} type="button">
                      <RefreshCcw size={14} /> Sinh mã
                    </button>
                  ) : null}
                </div>
              </label>
              <label>
                <span>Tên voucher <b>*</b></span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Voucher giảm 20% Teetime" maxLength={200} />
              </label>
              <label className={styles.fullField}>
                <span>Mô tả</span>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả chi tiết về voucher..." />
              </label>
            </div>
          </section>

          <section className={`${styles.contractFormSection} ${styles.contractSectionOrange}`}>
            <h3 className={styles.contractSectionHeader}>2. Giá trị giảm</h3>
            <div className={styles.contractRadioRow}>
              <button className={discountType === "percent" ? styles.contractRadioActive : styles.contractRadio} onClick={() => setDiscountType("percent")} type="button">
                <Sparkles size={14} /> Giảm theo %
              </button>
              <button className={discountType === "fixed" ? styles.contractRadioActive : styles.contractRadio} onClick={() => setDiscountType("fixed")} type="button">
                <Wallet size={14} /> Giảm cố định VNĐ
              </button>
            </div>
            <div className={styles.contractGrid2}>
              <label>
                <span>{discountType === "percent" ? "Phần trăm giảm (%)" : "Số tiền giảm (VNĐ)"} <b>*</b></span>
                <input type="number" min={0} max={discountType === "percent" ? 100 : undefined} step={discountType === "percent" ? 1 : 1000} value={discountValue} onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value) || 0))} />
              </label>
              {discountType === "percent" ? (
                <label>
                  <span>Giảm tối đa (VNĐ)</span>
                  <input type="number" min={0} step={1000} value={maxDiscount} onChange={(e) => setMaxDiscount(Math.max(0, Number(e.target.value) || 0))} placeholder="0 = không giới hạn" />
                </label>
              ) : null}
              <label>
                <span>Đơn tối thiểu (VNĐ)</span>
                <input type="number" min={0} step={1000} value={minOrder} onChange={(e) => setMinOrder(Math.max(0, Number(e.target.value) || 0))} placeholder="0 = không yêu cầu" />
              </label>
            </div>
          </section>

          <section className={`${styles.contractFormSection} ${styles.contractSectionPurple}`}>
            <h3 className={styles.contractSectionHeader}>3. Điều kiện áp dụng</h3>
            <p className={styles.cellMuted}>Chọn loại dịch vụ áp dụng (không chọn = áp dụng tất cả).</p>
            <div className={styles.ticketCategoryPills}>
              {categories.map((c) => {
                const checked = applyToCategoryIds.includes(c.id);
                const color = lookupColor(c.color);
                return (
                  <button
                    key={c.id}
                    className={checked ? styles.ticketCategoryPillActive : styles.ticketCategoryPill}
                    style={checked ? { background: color.bg, color: color.fg, borderColor: color.dot } : undefined}
                    onClick={() => toggleCategory(c.id)}
                    type="button"
                  >
                    {checked ? <CheckCircle2 size={12} /> : null} {c.name}
                  </button>
                );
              })}
              <button
                className={applyToCategoryIds.length === categories.length ? styles.ticketCategoryPillActive : styles.ticketCategoryPill}
                onClick={() => setApplyToCategoryIds(applyToCategoryIds.length === categories.length ? [] : categories.map((c) => c.id))}
                type="button"
              >
                {applyToCategoryIds.length === categories.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </button>
            </div>
          </section>

          <section className={`${styles.contractFormSection} ${styles.contractSectionTeal}`}>
            <h3 className={styles.contractSectionHeader}>4. Số lượng & thời hạn</h3>
            <div className={styles.contractGrid2}>
              <label>
                <span>Số lượng phát hành <b>*</b></span>
                <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))} />
              </label>
              <label>
                <span>Đã sử dụng (read-only)</span>
                <input readOnly value={`${initial?.quantityUsed ?? 0} / ${quantity}`} />
              </label>
              <label>
                <span>Ngày bắt đầu <b>*</b></span>
                <input value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="dd/mm/yyyy" />
              </label>
              <label>
                <span>Ngày kết thúc <b>*</b></span>
                <input value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="dd/mm/yyyy" />
              </label>
              <label className={styles.contractCheckboxLine}>
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                Kích hoạt voucher ngay
              </label>
            </div>
          </section>
        </div>
        <footer className={styles.contractFormFooter}>
          <span></span>
          <div>
            <button className={styles.contractFilterChip} onClick={onClose} type="button">Hủy</button>
            <button className={styles.greenButton} type="submit"><CheckCircle2 size={14} /> {isEdit ? "Cập nhật" : "Tạo voucher"}</button>
          </div>
        </footer>
      </form>
    </div>
  );
}

function ToggleVoucherDialog({
  voucher,
  onCancel,
  onConfirm,
}: {
  voucher: Voucher;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const turningOn = !voucher.active;
  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.ticketDialog}>
        <header>
          <span className={styles.ticketDialogIcon} style={{ background: turningOn ? "#fef3c7" : "#fee2e2", color: turningOn ? "#b45309" : "#b91c1c" }}>
            {turningOn ? <AlertTriangle size={20} /> : <Power size={20} />}
          </span>
          <div>
            <h3>{turningOn ? "Bật kích hoạt voucher" : "Tắt kích hoạt voucher"}</h3>
            <p>Bạn có chắc chắn muốn {turningOn ? "bật kích hoạt" : "tắt kích hoạt"} voucher <strong>{voucher.code}</strong>?</p>
          </div>
        </header>
        <footer>
          <button className={styles.contractFilterChip} onClick={onCancel} type="button">Hủy bỏ</button>
          <button className={turningOn ? styles.greenButton : styles.ticketDialogDanger} onClick={onConfirm} type="button">
            <Power size={14} /> {turningOn ? "Kích hoạt" : "Tắt"}
          </button>
        </footer>
      </div>
    </div>
  );
}

function DeleteVoucherDialog({
  voucher,
  onCancel,
  onConfirm,
}: {
  voucher: Voucher;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.ticketDialog}>
        <header>
          <span className={styles.ticketDialogIcon} style={{ background: "#fee2e2", color: "#b91c1c" }}>
            <AlertTriangle size={20} />
          </span>
          <div>
            <h3>Xóa voucher {voucher.code}</h3>
            <p>Bạn có chắc chắn muốn xóa voucher này? Hành động này <strong>không thể hoàn tác</strong>.{voucher.quantityUsed > 0 ? ` Voucher đã được sử dụng ${voucher.quantityUsed} lần.` : ""}</p>
          </div>
        </header>
        <footer>
          <button className={styles.contractFilterChip} onClick={onCancel} type="button">Hủy bỏ</button>
          <button className={styles.ticketDialogDanger} onClick={onConfirm} type="button"><Trash2 size={14} /> Xóa</button>
        </footer>
      </div>
    </div>
  );
}
// =====================================================================================
// SECTION M IMPL — Tab "Dịch Vụ Đi Kèm"
// =====================================================================================

function AddonListTabImpl({
  addons,
  onChange,
  flash,
}: {
  addons: AddonCatalogItem[];
  onChange: (a: AddonCatalogItem[]) => void;
  flash: (m: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AddonCatalogItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AddonCatalogItem | null>(null);

  const filtered = useMemo(() => {
    return addons.filter((a) => {
      if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
      if (query) {
        const target = `${a.name} ${a.description ?? ""}`.toLowerCase();
        if (!target.includes(query.toLowerCase())) return false;
      }
      return true;
    });
  }, [addons, categoryFilter, query]);

  const stats = useMemo(() => ({
    total: addons.length,
    caddie: addons.filter((a) => a.category === "Caddie").length,
    vehicle: addons.filter((a) => a.category === "Phương tiện").length,
    avgPrice: addons.length ? Math.round(addons.reduce((s, a) => s + a.unitPrice, 0) / addons.length) : 0,
  }), [addons]);

  const submit = (next: AddonCatalogItem) => {
    const exists = addons.find((a) => a.id === next.id);
    onChange(exists ? addons.map((a) => a.id === next.id ? next : a) : [next, ...addons]);
    flash(`${exists ? "Đã cập nhật" : "Đã thêm"} dịch vụ ${next.name}`);
    setFormOpen(false);
    setEditing(null);
  };

  const remove = (target: AddonCatalogItem) => {
    onChange(addons.filter((a) => a.id !== target.id));
    flash(`Đã xóa dịch vụ ${target.name}`);
    setDeleteTarget(null);
  };

  return (
    <>
      <div className={styles.contractKpi}>
        <KpiCard label="Tổng DV đi kèm" value={String(stats.total)} tone="blue" icon={ShoppingBag} />
        <KpiCard label="Caddie" value={String(stats.caddie)} tone="amber" icon={Users} />
        <KpiCard label="Phương tiện" value={String(stats.vehicle)} tone="purple" icon={TicketIcon} />
        <KpiCard label="Giá TB" value={formatCurrency(stats.avgPrice)} tone="green" icon={Wallet} />
      </div>

      <div className={styles.contractListSearchRow}>
        <div className={styles.pricingSearch} style={{ flex: 1 }}>
          <Search size={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo tên DV, mô tả..." />
        </div>
        <select className={styles.selectInput} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">Tất cả nhóm</option>
          <option>Caddie</option>
          <option>Phương tiện</option>
          <option>Trang bị</option>
          <option>F&B</option>
          <option>Khác</option>
        </select>
      </div>

      <div className={styles.contractListChipRow}>
        <span className={styles.cellMuted}>Hiển thị {filtered.length} / {addons.length} DV đi kèm</span>
        <div className={styles.contractListActions}>
          <button className={styles.greenButton} onClick={() => { setEditing(null); setFormOpen(true); }} type="button">
            <PlusCircle size={16} /> Thêm DV đi kèm
          </button>
        </div>
      </div>

      <section className={styles.memberTableCard}>
        <div className={styles.memberTableWrap}>
          <table className={`${styles.memberTable} ${styles.contractListTable}`}>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên dịch vụ</th>
                <th>Nhóm</th>
                <th>Đơn giá</th>
                <th>VAT</th>
                <th>Mô tả</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td className={styles.emptyTableCell} colSpan={7}>Không có dịch vụ đi kèm nào khớp bộ lọc</td></tr>
              ) : null}
              {filtered.map((a, i) => (
                <tr key={a.id}>
                  <td className={styles.contractRowIndex}>{i + 1}</td>
                  <td className={styles.memberName}><strong>{a.name}</strong></td>
                  <td><span className={styles.ticketCategoryBadge}>{a.category}</span></td>
                  <td><strong className={styles.contractTotalCell}>{formatCurrency(a.unitPrice)}</strong></td>
                  <td>{a.vatPercent}%</td>
                  <td className={styles.cellTruncate} title={a.description}>{a.description ?? "—"}</td>
                  <td>
                    <div className={styles.contractRowActions}>
                      <button onClick={() => { setEditing(a); setFormOpen(true); }} title="Sửa" type="button"><Edit3 size={14} /></button>
                      <button className={styles.contractDelete} onClick={() => setDeleteTarget(a)} title="Xóa" type="button"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {formOpen ? (
        <AddonFormModal
          initial={editing}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSubmit={submit}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteAddonDialog
          addon={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => remove(deleteTarget)}
        />
      ) : null}
    </>
  );
}

function AddonFormModal({
  initial,
  onClose,
  onSubmit,
}: {
  initial: AddonCatalogItem | null;
  onClose: () => void;
  onSubmit: (a: AddonCatalogItem) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [unitPrice, setUnitPrice] = useState(initial?.unitPrice ?? 0);
  const [vatPercent, setVatPercent] = useState(initial?.vatPercent ?? 8);
  const [category, setCategory] = useState<AddonCatalogItem["category"]>(initial?.category ?? "Khác");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) { setError("Vui lòng nhập tên DV"); return; }
    if (unitPrice < 0) { setError("Đơn giá không hợp lệ"); return; }
    onSubmit({
      id: initial?.id ?? `AD-${Date.now()}`,
      name: name.trim(),
      unitPrice,
      vatPercent,
      category,
      description: description.trim() || undefined,
    });
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <form className={styles.ticketSubModal} onSubmit={submit} style={{ minWidth: 540 }}>
        <header><h3><ShoppingBag size={16} /> {initial ? `Sửa ${initial.name}` : "Thêm dịch vụ đi kèm"}</h3><button onClick={onClose} type="button"><X size={16} /></button></header>
        {error ? <div className={styles.formError}><AlertCircle size={14} /> {error}</div> : null}
        <div className={styles.contractGrid2}>
          <label>
            <span>Tên dịch vụ <b>*</b></span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Caddie nữ, Buggy 2 chỗ..." />
          </label>
          <label>
            <span>Nhóm</span>
            <select className={styles.selectInput} value={category} onChange={(e) => setCategory(e.target.value as AddonCatalogItem["category"])}>
              <option>Caddie</option>
              <option>Phương tiện</option>
              <option>Trang bị</option>
              <option>F&B</option>
              <option>Khác</option>
            </select>
          </label>
          <label>
            <span>Đơn giá (VNĐ) <b>*</b></span>
            <input type="number" min={0} step={1000} value={unitPrice} onChange={(e) => setUnitPrice(Math.max(0, Number(e.target.value) || 0))} />
          </label>
          <label>
            <span>VAT (%)</span>
            <select className={styles.selectInput} value={vatPercent} onChange={(e) => setVatPercent(Number(e.target.value))}>
              {VAT_OPTIONS.map((v) => <option key={v} value={v}>{v}%</option>)}
            </select>
          </label>
          <label className={styles.fullField}>
            <span>Mô tả</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả ngắn về dịch vụ..." />
          </label>
        </div>
        <footer>
          <button className={styles.contractFilterChip} onClick={onClose} type="button">Hủy</button>
          <button className={styles.greenButton} type="submit"><CheckCircle2 size={14} /> {initial ? "Cập nhật" : "Thêm"}</button>
        </footer>
      </form>
    </div>
  );
}

function DeleteAddonDialog({
  addon,
  onCancel,
  onConfirm,
}: {
  addon: AddonCatalogItem;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.ticketDialog}>
        <header>
          <span className={styles.ticketDialogIcon} style={{ background: "#fee2e2", color: "#b91c1c" }}>
            <AlertTriangle size={20} />
          </span>
          <div>
            <h3>Xóa dịch vụ {addon.name}</h3>
            <p>Bạn có chắc chắn muốn xóa dịch vụ đi kèm này? Hành động này không thể hoàn tác. Các vé đã sử dụng sẽ vẫn giữ snapshot giá tại thời điểm tạo (BR-M4-04).</p>
          </div>
        </header>
        <footer>
          <button className={styles.contractFilterChip} onClick={onCancel} type="button">Hủy bỏ</button>
          <button className={styles.ticketDialogDanger} onClick={onConfirm} type="button"><Trash2 size={14} /> Xóa</button>
        </footer>
      </div>
    </div>
  );
}

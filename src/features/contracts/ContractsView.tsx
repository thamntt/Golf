"use client";

import { useLayoutEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  Edit3,
  Eye,
  FileSignature,
  FileText,
  HandCoins,
  History,
  Layers,
  MoreVertical,
  Pause,
  PlusCircle,
  Power,
  Printer,
  RefreshCcw,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  TrendingUp,
  UserCog,
  Users,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import styles from "@/shared/styles/feature-styles.module.css";
import { FeaturePage } from "@/shared/components";

// =====================================================================================
// SECTION A — Constants & Types
// =====================================================================================

const BRANCHES = ["NextVision", "Hà Nội Center", "Sài Gòn West"];

const PACKAGE_LIBRARY: PackageOption[] = [
  { code: "P001", name: "Gói Cơ Bản Golf", serviceType: "Member - Golf", sessions: 8, durationMonths: 1, price: 2_000_000 },
  { code: "P002", name: "Gói Cao Cấp Golf", serviceType: "Member - Golf", sessions: 24, durationMonths: 3, price: 5_500_000 },
  { code: "P003", name: "Gói Premium Practice", serviceType: "Practice", sessions: 30, durationMonths: 6, price: 4_200_000 },
  { code: "P004", name: "Gói Family Combo", serviceType: "Combo", sessions: 50, durationMonths: 12, price: 18_500_000 },
  { code: "P005", name: "Gói Trial 7 ngày", serviceType: "Trial", sessions: 4, durationMonths: 0.25, price: 800_000 },
  { code: "P006", name: "Gói Linh Hoạt theo Buổi", serviceType: "Practice", sessions: 0, durationMonths: 0, price: 250_000 },
  { code: "P007", name: "Gói VIP Master", serviceType: "Member - Golf", sessions: 60, durationMonths: 12, price: 30_000_000 },
];

const SALES_STAFF = ["Nguyễn Thị Lan", "Phạm Văn Đức", "Hoàng Mỹ Linh", "Trần Quốc Bảo", "Nguyễn Văn Thành"] as const;
const PAYMENT_METHODS = ["Tiền mặt", "Chuyển khoản", "Thẻ", "MoMo", "ZaloPay"] as const;
const VAT_OPTIONS = ["0", "5", "8", "10"] as const;
const PROVINCES = ["TP.HCM", "Hà Nội", "Đà Nẵng", "Bình Dương", "Đồng Nai", "Bà Rịa - Vũng Tàu"] as const;
const WARDS_BY_PROVINCE: Record<string, string[]> = {
  "TP.HCM": ["Phường Bến Nghé (Q.1)", "Phường Đa Kao (Q.1)", "Phường Tân Định (Q.1)", "Phường 1 (Q.3)", "Phường 12 (Q.10)", "Phường Phú Mỹ Hưng (Q.7)"],
  "Hà Nội": ["Phường Tràng Tiền", "Phường Phan Chu Trinh", "Phường Lý Thái Tổ"],
  "Đà Nẵng": ["Phường Hải Châu I", "Phường Thuận Phước"],
  "Bình Dương": ["Phường Phú Lợi", "Phường Hiệp Thành"],
  "Đồng Nai": ["Phường Hoà Bình", "Phường Trung Dũng"],
  "Bà Rịa - Vũng Tàu": ["Phường 1 (TP.Vũng Tàu)", "Phường 7 (TP.Vũng Tàu)"],
};

type CustomerGroup = { id: string; name: string; description: string };
type CustomerSource = { id: string; name: string; description: string };
type ContractType = { id: string; name: string; description: string };
type Trainer = { id: string; name: string; specialty: string };
type Voucher = { code: string; name: string; type: "percent" | "amount"; value: number; minOrder?: number; expires: string };
type BankAccount = { id: string; bank: string; name: string; number: string };
type PosDevice = { id: string; name: string; bank: string };
type CashFund = { id: string; name: string; branch: string };

const INITIAL_GROUPS: CustomerGroup[] = [
  { id: "G-VIP", name: "VIP", description: "Hội viên VIP - tổng chi tiêu ≥ 100M" },
  { id: "G-PRE", name: "Premium", description: "Hội viên cao cấp" },
  { id: "G-STD", name: "Standard", description: "Hội viên thường" },
  { id: "G-WALK", name: "Khách vãng lai", description: "Walk-in, không HĐ dài hạn" },
];

const INITIAL_SOURCES: CustomerSource[] = [
  { id: "S-WALK", name: "Walk-in", description: "Tự đến tại quầy" },
  { id: "S-FB", name: "Facebook", description: "Quảng cáo Facebook" },
  { id: "S-GG", name: "Google", description: "Quảng cáo Google Ads" },
  { id: "S-REF", name: "Giới thiệu", description: "Hội viên giới thiệu" },
  { id: "S-OTHER", name: "Chi nhánh khác", description: "Chuyển từ CN khác" },
];

const INITIAL_CONTRACT_TYPES: ContractType[] = [
  { id: "CT-MEMBER", name: "Hội viên Member", description: "Hợp đồng dài hạn cho hội viên chính thức" },
  { id: "CT-TRIAL", name: "Trial / Dùng thử", description: "Hợp đồng dùng thử ngắn hạn" },
  { id: "CT-CORP", name: "Doanh nghiệp", description: "Hợp đồng B2B công ty" },
  { id: "CT-FAMILY", name: "Gia đình", description: "Combo gia đình ≥2 người" },
  { id: "CT-EVENT", name: "Sự kiện", description: "HĐ phục vụ giải đấu / event" },
];

const SERVICE_TYPE_OPTIONS = ["Member - Golf tập thành viên", "Practice", "Combo", "Trial"] as const;

const INITIAL_TRAINERS: Trainer[] = [
  { id: "TR-001", name: "HLV Trần Văn An", specialty: "Swing cơ bản" },
  { id: "TR-002", name: "HLV Đỗ Hồng Quân", specialty: "Putting & Short Game" },
  { id: "TR-003", name: "HLV Nguyễn Mai", specialty: "Driver, Long Iron" },
  { id: "TR-004", name: "HLV Phạm Hùng", specialty: "Course Management" },
];

const INITIAL_VOUCHERS: Voucher[] = [
  { code: "DISCOUNT20", name: "Giảm giá 20%", type: "percent", value: 20, minOrder: 1_000_000, expires: "31/12/2026" },
  { code: "WELCOME500K", name: "Giảm 500.000đ cho HV mới", type: "amount", value: 500_000, minOrder: 3_000_000, expires: "30/06/2026" },
  { code: "VIP10", name: "VIP giảm 10% mọi gói", type: "percent", value: 10, expires: "31/12/2026" },
  { code: "SUMMER2M", name: "Khuyến mãi hè 2M", type: "amount", value: 2_000_000, minOrder: 10_000_000, expires: "31/08/2026" },
];

const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  { id: "BANK-VCB", bank: "Vietcombank", name: "TK chính", number: "0071000123456" },
  { id: "BANK-TCB", bank: "Techcombank", name: "TK phụ", number: "1903567890" },
  { id: "BANK-MB", bank: "MB Bank", name: "TK chi nhánh HN", number: "0019999988" },
];

const INITIAL_POS_DEVICES: PosDevice[] = [
  { id: "POS-Q1", name: "POS Quầy 1", bank: "Vietcombank" },
  { id: "POS-Q2", name: "POS Quầy 2", bank: "Techcombank" },
  { id: "POS-VIP", name: "POS VIP Lounge", bank: "MB Bank" },
];

const INITIAL_CASH_FUNDS: CashFund[] = [
  { id: "CASH-FRONT", name: "Quỹ tiền mặt tại quầy", branch: "NextVision" },
  { id: "CASH-VIP", name: "Quỹ tiền mặt VIP", branch: "NextVision" },
  { id: "CASH-HN", name: "Quỹ tiền mặt CN Hà Nội", branch: "Hà Nội Center" },
];

const RECEIPT_CATEGORIES = ["Thu hợp đồng mới", "Thu công nợ", "Khách đặt cọc", "Thu thẻ thành viên", "Phiếu thu khác"] as const;

type PackageOption = {
  code: string;
  name: string;
  serviceType: string;
  sessions: number;
  durationMonths: number;
  price: number;
};

type Companion = {
  id: string;
  name: string;
  relation: string;
  phone?: string;
};

type CustomerLite = {
  code: string;
  bioCode?: string;
  name: string;
  phone: string;
  email: string;
  cccd: string;
  birthDate: string;
  gender: "Nam" | "Nữ";
  address: string;
  cccdVerified: boolean;
  groupId?: string;
  sourceId?: string;
  card?: string;
  contactName?: string;
  contactPhone?: string;
  province?: string;
  ward?: string;
  street?: string;
  note?: string;
  companions?: Companion[];
};

type Payment = {
  method: "Tiền mặt" | "Chuyển khoản" | "Thẻ" | "MoMo" | "ZaloPay";
  amount: number;
  accountId?: string; // FK đến BANK_ACCOUNTS / POS_DEVICES / CASH_FUNDS
  txRef?: string;     // Mã giao dịch xác nhận (bắt buộc với CK + POS)
};

type SalesAllocation = { staff: string; percent: number };

type VatLine = { rate: number; amount: number };

type CommissionMode = "preset" | "custom" | "none";

type ContractStatus = "active" | "suspended" | "expired" | "closed" | "converted";

type Contract = {
  id: string;
  customerCode: string;
  contractTypeId?: string;       // Loại hợp đồng (Member-Standard / VIP / Trial...)
  serviceTypeId?: string;        // Loại dịch vụ (Member-Golf, Practice, Combo...)
  packageCode: string;           // = "Tên dịch vụ" (gói cụ thể)
  signedDate: string;
  startDate: string;
  endDate: string;
  branch: string;
  signer: string;
  signStatus?: "Chưa ký" | "Đã ký";
  signNote?: string;
  trainerId?: string;            // Nhân viên PT/HLV
  activeNow?: boolean;
  totalSessions: number;
  remainingSessions: number;
  basePrice: number;
  discountAmount: number;
  voucherCode?: string;          // KM/Voucher đang áp dụng
  vatPercent: number;
  vatLines?: VatLine[];          // multi-VAT (BR-M9-10)
  totalAmount: number;
  paid: number;
  payments: Payment[];
  receiptId?: string;            // Số phiếu thu auto
  receiptDate?: string;
  receiptCashier?: string;
  receiptCategory?: string;      // Loại thu chi (Công nợ / Phiếu thu khác / Thu Thẻ / Khách đặt cọc)
  receiptNote?: string;
  paymentDeadlineDays?: number;  // Thời hạn TT (ngày)
  customerCash?: number;         // Khách đưa
  changeAmount?: number;         // Tiền thừa
  status: ContractStatus;
  saleStaff: string;             // Sale chính (legacy)
  saleAllocations?: SalesAllocation[]; // Phân bổ % cho nhiều NV Sale (tổng=100%)
  creator: string;
  attachments: string[];
  customFields?: Array<{ label: string; value: string }>;
  note: string;
  history: TimelineEntry[];
  renewalCount: number;
  suspensionCount: number;
  hasUpgraded: boolean;
  hasTransferred: boolean;
  hasConverted: boolean;
  commissionMode?: CommissionMode;
  commissionPercent?: number;
  commissionAmount?: number;
};

type TimelineEntry = { date: string; actor: string; action: string; detail?: string };

type RenewalUnit = "Tháng" | "Tuần" | "Buổi";

type Renewal = {
  id: string;
  contractId: string;
  customerCode: string;
  unit: RenewalUnit;
  quantity: number;
  unitPrice: number;
  discount: number;
  vatPercent: number;
  total: number;
  paid: number;
  newEndDate: string;
  addedSessions: number;
  saleStaff: string;
  createdAt: string;
  status: "Đã hoàn tất" | "Chờ thanh toán" | "Đã hủy";
  note: string;
};

type UpgradeStatus = "draft" | "pending_approval" | "approved" | "rejected" | "activated" | "paid" | "completed";

type Upgrade = {
  id: string;
  contractId: string;
  customerCode: string;
  fromPackage: string;
  toPackage: string;
  oldRemainingValue: number;
  upgradeFee: number;
  vatPercent: number;
  total: number;
  paid: number;
  oldSessions: number;
  newSessions: number;
  effectiveDate: string;
  saleStaff: string;
  createdAt: string;
  status: UpgradeStatus;
  rejectReason?: string;
};

type SuspensionStatus = "draft" | "pending_approval" | "approved" | "rejected" | "activated" | "completed" | "cancelled";

type Suspension = {
  id: string;
  contractIds: string[];
  type: "Đơn" | "Nhóm";
  startDate: string;
  endDate: string;
  durationDays: number;
  reason: string;
  fee: number;
  vatPercent: number;
  total: number;
  status: SuspensionStatus;
  createdAt: string;
  saleStaff: string;
  rejectReason?: string;
};

type TransferStatus = "draft" | "pending_approval" | "approved" | "rejected" | "activated" | "completed";

type Transfer = {
  id: string;
  contractId: string;
  fromCustomer: string;
  toCustomer: string;
  fee: number;
  vatPercent: number;
  total: number;
  paid: number;
  effectiveDate: string;
  reason: string;
  status: TransferStatus;
  createdAt: string;
  saleStaff: string;
  rejectReason?: string;
};

type ConversionStatus = "draft" | "pending_approval" | "approved" | "rejected" | "activated" | "completed";

type Conversion = {
  id: string;
  oldContractId: string;
  newContractId?: string;
  customerCode: string;
  oldPackage: string;
  newPackage: string;
  conversionType: "UPGRADE" | "DOWNGRADE";
  oldRemainingValue: number;
  newPrice: number;
  fee: number;
  refundAmount: number;
  vatPercent: number;
  total: number;
  paid: number;
  effectiveDate: string;
  status: ConversionStatus;
  createdAt: string;
  saleStaff: string;
  reason: string;
  rejectReason?: string;
};

type ContractTab = "list" | "renewal" | "upgrade" | "suspension" | "transfer" | "conversion";
export type ContractWorkflowRequest = {
  id: number;
  mode: "create" | "detail";
  customerCode?: string;
  contractId?: string;
};

// =====================================================================================
// SECTION B — Mock seed data
// =====================================================================================

const CUSTOMERS: CustomerLite[] = [
  {
    code: "HV001", bioCode: "81630772", name: "Nguyễn Văn A", phone: "0901234567", email: "nguyenvana@gmail.com",
    cccd: "079098001234", birthDate: "15/05/1990", gender: "Nam", address: "12 Lê Lợi, Q.1, TP.HCM", cccdVerified: true,
    groupId: "G-VIP", sourceId: "S-FB", card: "RFID-00012", contactName: "Nguyễn Thị Mai", contactPhone: "0903111222",
    province: "TP.HCM", ward: "Phường Bến Nghé (Q.1)", street: "12 Lê Lợi",
    note: "Khách VIP, ưu tiên book sớm. Sinh nhật T5.",
    companions: [{ id: "NDC-001", name: "Nguyễn Văn Bin", relation: "Con trai", phone: "" }],
  },
  {
    code: "HV002", bioCode: "81630773", name: "Trần Thị B", phone: "0902345678", email: "tranthib@gmail.com",
    cccd: "079098002345", birthDate: "20/08/1995", gender: "Nữ", address: "45 Pasteur, Q.3, TP.HCM", cccdVerified: true,
    groupId: "G-PRE", sourceId: "S-GG", card: "", contactName: "", contactPhone: "",
    province: "TP.HCM", ward: "Phường 1 (Q.3)", street: "45 Pasteur",
  },
  {
    code: "HV003", bioCode: "81630774", name: "Lê Văn C", phone: "0923456789", email: "levanc@gmail.com",
    cccd: "079098003456", birthDate: "10/12/1988", gender: "Nam", address: "78 Nguyễn Trãi, Q.5, TP.HCM", cccdVerified: false,
    groupId: "G-STD", sourceId: "S-WALK", province: "TP.HCM", ward: "Phường 12 (Q.10)",
  },
  {
    code: "HV004", bioCode: "81630775", name: "Phạm Thị D", phone: "0934567890", email: "phamthid@gmail.com",
    cccd: "079098004567", birthDate: "25/03/1992", gender: "Nữ", address: "100 Lý Thường Kiệt, Q.10, TP.HCM", cccdVerified: true,
    groupId: "G-PRE", sourceId: "S-REF", province: "TP.HCM", ward: "Phường 12 (Q.10)",
  },
  {
    code: "HV005", bioCode: "81630776", name: "Huỳnh Xuân Long", phone: "0910070932", email: "longhx@gmail.com",
    cccd: "079098005678", birthDate: "06/08/1975", gender: "Nam", address: "210 Trần Hưng Đạo, Q.5, TP.HCM", cccdVerified: true,
    groupId: "G-VIP", sourceId: "S-REF", card: "RFID-00045",
    province: "TP.HCM", ward: "Phường 12 (Q.10)", street: "210 Trần Hưng Đạo",
    note: "Hội viên VIP - tặng caddie",
  },
  {
    code: "HV007", bioCode: "81630777", name: "Vũ Hồng Nhất", phone: "0510086770", email: "nhatvh@gmail.com",
    cccd: "079098007890", birthDate: "08/08/1977", gender: "Nam", address: "55 Nam Kỳ Khởi Nghĩa, Q.1, TP.HCM", cccdVerified: true,
    groupId: "G-STD", sourceId: "S-WALK", province: "TP.HCM", ward: "Phường Đa Kao (Q.1)",
  },
  {
    code: "HV012", bioCode: "81630778", name: "Đỗ Mai Hương", phone: "0345678901", email: "huongdm@gmail.com",
    cccd: "079098012345", birthDate: "11/02/1993", gender: "Nữ", address: "8 Cách Mạng Tháng 8, Q.3, TP.HCM", cccdVerified: true,
    groupId: "G-PRE", sourceId: "S-FB", province: "TP.HCM", ward: "Phường 1 (Q.3)",
  },
];

const INITIAL_CONTRACTS: Contract[] = [
  {
    id: "CT001", customerCode: "HV001", packageCode: "P002", signedDate: "10/02/2026", startDate: "12/02/2026", endDate: "12/05/2026",
    branch: "NextVision", signer: "Nguyễn Văn A", totalSessions: 24, remainingSessions: 18,
    basePrice: 5_500_000, discountAmount: 200_000, vatPercent: 8, totalAmount: 5_724_000, paid: 5_724_000,
    payments: [{ method: "Tiền mặt", amount: 2_000_000 }, { method: "Chuyển khoản", amount: 3_724_000 }],
    status: "active", saleStaff: "Nguyễn Thị Lan", creator: "Admin", attachments: ["HD_NguyenVanA_signed.pdf"], note: "Khách VIP, ưu tiên book sớm",
    history: [
      { date: "10/02/2026 09:30", actor: "Nguyễn Thị Lan", action: "Ký mới hợp đồng" },
      { date: "10/02/2026 09:31", actor: "Hệ thống", action: "Sinh phiếu thu PT-2602-0010", detail: "5.724.000 đ" },
      { date: "12/02/2026 07:20", actor: "Lễ tân", action: "Kích hoạt hợp đồng" },
    ],
    renewalCount: 0, suspensionCount: 0, hasUpgraded: false, hasTransferred: false, hasConverted: false,
  },
  {
    id: "CT002", customerCode: "HV002", packageCode: "P001", signedDate: "01/03/2026", startDate: "03/03/2026", endDate: "03/04/2026",
    branch: "NextVision", signer: "Trần Thị B", totalSessions: 8, remainingSessions: 5,
    basePrice: 2_000_000, discountAmount: 0, vatPercent: 8, totalAmount: 2_160_000, paid: 1_500_000,
    payments: [{ method: "Tiền mặt", amount: 1_500_000 }],
    status: "active", saleStaff: "Phạm Văn Đức", creator: "Phạm Văn Đức", attachments: [], note: "Còn nợ 660k, hẹn thanh toán cuối tháng",
    history: [
      { date: "01/03/2026 14:00", actor: "Phạm Văn Đức", action: "Ký mới hợp đồng" },
      { date: "01/03/2026 14:02", actor: "Hệ thống", action: "Ghi công nợ", detail: "660.000 đ" },
    ],
    renewalCount: 0, suspensionCount: 0, hasUpgraded: false, hasTransferred: false, hasConverted: false,
  },
  {
    id: "CT003", customerCode: "HV003", packageCode: "P003", signedDate: "15/01/2026", startDate: "20/01/2026", endDate: "20/07/2026",
    branch: "NextVision", signer: "Lê Văn C", totalSessions: 30, remainingSessions: 12,
    basePrice: 4_200_000, discountAmount: 100_000, vatPercent: 10, totalAmount: 4_510_000, paid: 4_510_000,
    payments: [{ method: "Thẻ", amount: 4_510_000, accountId: "POS-Q1" }],
    status: "active", saleStaff: "Hoàng Mỹ Linh", creator: "Admin", attachments: ["CCCD_LeVanC.jpg", "HD_LeVanC.pdf"], note: "",
    history: [
      { date: "15/01/2026 10:15", actor: "Hoàng Mỹ Linh", action: "Ký mới hợp đồng" },
      { date: "20/01/2026 08:00", actor: "Lễ tân", action: "Kích hoạt hợp đồng" },
      { date: "05/03/2026 19:00", actor: "Hệ thống", action: "Trừ buổi", detail: "18 buổi đã sử dụng" },
    ],
    renewalCount: 0, suspensionCount: 0, hasUpgraded: false, hasTransferred: false, hasConverted: false,
  },
  {
    id: "CT004", customerCode: "HV005", packageCode: "P007", signedDate: "01/12/2025", startDate: "01/12/2025", endDate: "01/12/2026",
    branch: "NextVision", signer: "Huỳnh Xuân Long", totalSessions: 60, remainingSessions: 42,
    basePrice: 30_000_000, discountAmount: 1_500_000, vatPercent: 10, totalAmount: 31_350_000, paid: 31_350_000,
    payments: [{ method: "Chuyển khoản", amount: 31_350_000 }],
    status: "active", saleStaff: "Trần Quốc Bảo", creator: "Trần Quốc Bảo", attachments: ["HD_HuynhXuanLong.pdf"], note: "Hội viên VIP - tặng caddie",
    history: [
      { date: "01/12/2025 11:00", actor: "Trần Quốc Bảo", action: "Ký mới hợp đồng VIP" },
      { date: "10/01/2026 09:00", actor: "Hoàng Mỹ Linh", action: "Gia hạn", detail: "Cộng 12 buổi miễn phí" },
    ],
    renewalCount: 1, suspensionCount: 0, hasUpgraded: false, hasTransferred: false, hasConverted: false,
  },
  {
    id: "CT005", customerCode: "HV004", packageCode: "P004", signedDate: "20/02/2026", startDate: "01/03/2026", endDate: "01/03/2027",
    branch: "NextVision", signer: "Phạm Thị D", totalSessions: 50, remainingSessions: 38,
    basePrice: 18_500_000, discountAmount: 500_000, vatPercent: 10, totalAmount: 19_800_000, paid: 19_800_000,
    payments: [{ method: "Chuyển khoản", amount: 19_800_000 }],
    status: "suspended", saleStaff: "Nguyễn Thị Lan", creator: "Admin", attachments: [], note: "Đang bảo lưu vì lý do cá nhân",
    history: [
      { date: "20/02/2026 16:30", actor: "Nguyễn Thị Lan", action: "Ký mới hợp đồng Family Combo" },
      { date: "15/04/2026 10:00", actor: "Manager", action: "Phê duyệt bảo lưu", detail: "30 ngày từ 20/04" },
    ],
    renewalCount: 0, suspensionCount: 1, hasUpgraded: false, hasTransferred: false, hasConverted: false,
  },
  {
    id: "CT006", customerCode: "HV007", packageCode: "P001", signedDate: "10/01/2024", startDate: "10/01/2024", endDate: "10/02/2024",
    branch: "NextVision", signer: "Vũ Hồng Nhất", totalSessions: 8, remainingSessions: 0,
    basePrice: 2_000_000, discountAmount: 0, vatPercent: 8, totalAmount: 2_160_000, paid: 2_160_000,
    payments: [{ method: "Tiền mặt", amount: 2_160_000 }],
    status: "expired", saleStaff: "Phạm Văn Đức", creator: "Admin", attachments: [], note: "",
    history: [
      { date: "10/01/2024 08:00", actor: "Phạm Văn Đức", action: "Ký mới hợp đồng" },
      { date: "10/02/2024 23:00", actor: "Hệ thống", action: "Hết hạn tự động" },
    ],
    renewalCount: 0, suspensionCount: 0, hasUpgraded: false, hasTransferred: false, hasConverted: false,
  },
  {
    id: "CT007", customerCode: "HV012", packageCode: "P006", signedDate: "05/04/2026", startDate: "06/04/2026", endDate: "06/05/2026",
    branch: "NextVision", signer: "Đỗ Mai Hương", totalSessions: 0, remainingSessions: 0,
    basePrice: 250_000, discountAmount: 0, vatPercent: 8, totalAmount: 270_000, paid: 270_000,
    payments: [{ method: "MoMo", amount: 270_000 }],
    status: "active", saleStaff: "Hoàng Mỹ Linh", creator: "Hoàng Mỹ Linh", attachments: [], note: "Pay-per-use, không ràng buộc",
    history: [{ date: "05/04/2026 18:00", actor: "Hoàng Mỹ Linh", action: "Ký mới HĐ linh hoạt" }],
    renewalCount: 0, suspensionCount: 0, hasUpgraded: false, hasTransferred: false, hasConverted: false,
  },
];

const INITIAL_RENEWALS: Renewal[] = [
  {
    id: "GH-2601-001", contractId: "CT004", customerCode: "HV005", unit: "Tháng", quantity: 3, unitPrice: 7_500_000, discount: 0, vatPercent: 10,
    total: 8_250_000, paid: 8_250_000, newEndDate: "01/03/2027", addedSessions: 12, saleStaff: "Hoàng Mỹ Linh",
    createdAt: "10/01/2026 09:00", status: "Đã hoàn tất", note: "Khách hài lòng, gia hạn sớm",
  },
  {
    id: "GH-2604-002", contractId: "CT001", customerCode: "HV001", unit: "Buổi", quantity: 8, unitPrice: 200_000, discount: 50_000, vatPercent: 8,
    total: 1_674_000, paid: 0, newEndDate: "12/06/2026", addedSessions: 8, saleStaff: "Nguyễn Thị Lan",
    createdAt: "02/05/2026 14:30", status: "Chờ thanh toán", note: "Chờ chuyển khoản",
  },
];

const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: "NC-2603-001", contractId: "CT002", customerCode: "HV002", fromPackage: "P001", toPackage: "P002",
    oldRemainingValue: 1_350_000, upgradeFee: 4_150_000, vatPercent: 8, total: 4_482_000, paid: 0,
    oldSessions: 5, newSessions: 29, effectiveDate: "10/03/2026", saleStaff: "Phạm Văn Đức",
    createdAt: "06/03/2026 11:20", status: "pending_approval",
  },
  {
    id: "NC-2602-002", contractId: "CT003", customerCode: "HV003", fromPackage: "P003", toPackage: "P004",
    oldRemainingValue: 1_680_000, upgradeFee: 16_820_000, vatPercent: 10, total: 18_502_000, paid: 18_502_000,
    oldSessions: 12, newSessions: 62, effectiveDate: "20/02/2026", saleStaff: "Hoàng Mỹ Linh",
    createdAt: "15/02/2026 10:00", status: "completed",
  },
];

const INITIAL_SUSPENSIONS: Suspension[] = [
  {
    id: "BL-2604-001", contractIds: ["CT005"], type: "Đơn", startDate: "20/04/2026", endDate: "20/05/2026", durationDays: 31,
    reason: "Đi công tác nước ngoài 1 tháng", fee: 0, vatPercent: 0, total: 0, status: "activated",
    createdAt: "15/04/2026 09:30", saleStaff: "Nguyễn Thị Lan",
  },
  {
    id: "BL-2604-002", contractIds: ["CT001", "CT003"], type: "Nhóm", startDate: "01/06/2026", endDate: "15/06/2026", durationDays: 15,
    reason: "Sự kiện công ty - đóng cửa CN tạm thời", fee: 0, vatPercent: 0, total: 0, status: "pending_approval",
    createdAt: "08/05/2026 10:00", saleStaff: "Trần Quốc Bảo",
  },
];

const INITIAL_TRANSFERS: Transfer[] = [
  {
    id: "CN-2603-001", contractId: "CT006", fromCustomer: "HV007", toCustomer: "HV012",
    fee: 200_000, vatPercent: 10, total: 220_000, paid: 220_000,
    effectiveDate: "12/03/2026", reason: "Khách chuyển nhượng cho người thân", status: "completed",
    createdAt: "10/03/2026 14:00", saleStaff: "Phạm Văn Đức",
  },
];

const INITIAL_CONVERSIONS: Conversion[] = [
  {
    id: "CD-2604-001", oldContractId: "CT007", newContractId: "CT007-NEW", customerCode: "HV012",
    oldPackage: "P006", newPackage: "P002", conversionType: "UPGRADE",
    oldRemainingValue: 250_000, newPrice: 5_500_000, fee: 5_350_000, refundAmount: 0,
    vatPercent: 8, total: 5_778_000, paid: 0, effectiveDate: "10/05/2026", status: "approved",
    createdAt: "08/05/2026 16:00", saleStaff: "Hoàng Mỹ Linh", reason: "Khách muốn đổi sang gói tháng",
  },
];

// =====================================================================================
// SECTION C — Helpers
// =====================================================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value) + " đ";
}

function lookupCustomer(code: string): CustomerLite | undefined {
  return CUSTOMERS.find((c) => c.code === code);
}

function lookupPackage(code: string): PackageOption | undefined {
  return PACKAGE_LIBRARY.find((p) => p.code === code);
}

function nextContractId(items: Contract[]): string {
  const numbers = items
    .map((item) => Number.parseInt(item.id.replace("CT", ""), 10))
    .filter((num) => !Number.isNaN(num));
  const next = (numbers.length > 0 ? Math.max(...numbers) : 0) + 1;
  return "CT" + String(next).padStart(3, "0");
}

function nextSeqId(items: Array<{ id: string }>, prefix: string): string {
  const today = new Date();
  const yymm = String(today.getFullYear()).slice(2) + String(today.getMonth() + 1).padStart(2, "0");
  const count = items.filter((it) => it.id.startsWith(`${prefix}-${yymm}`)).length + 1;
  return `${prefix}-${yymm}-${String(count).padStart(3, "0")}`;
}

function addMonthsToDate(dateStr: string, months: number): string {
  const [day, month, year] = dateStr.split("/").map(Number);
  if (!day || !month || !year) return dateStr;
  const date = new Date(year, month - 1 + months, day);
  return [
    String(date.getDate()).padStart(2, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    date.getFullYear(),
  ].join("/");
}

function addDaysToDate(dateStr: string, days: number): string {
  const [day, month, year] = dateStr.split("/").map(Number);
  if (!day || !month || !year) return dateStr;
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return [
    String(date.getDate()).padStart(2, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    date.getFullYear(),
  ].join("/");
}

function diffDaysInclusive(startStr: string, endStr: string): number {
  const [d1, m1, y1] = startStr.split("/").map(Number);
  const [d2, m2, y2] = endStr.split("/").map(Number);
  if (!d1 || !d2) return 0;
  const start = new Date(y1, m1 - 1, d1).getTime();
  const end = new Date(y2, m2 - 1, d2).getTime();
  return Math.max(1, Math.round((end - start) / 86_400_000) + 1);
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

function calcTotalAmount(basePrice: number, discount: number, vatPercent: number): number {
  return Math.round((basePrice - discount) * (1 + vatPercent / 100));
}

function statusLabel(status: ContractStatus): string {
  return status === "active"
    ? "Đang hoạt động"
    : status === "suspended"
      ? "Đang bảo lưu"
      : status === "expired"
        ? "Hết hạn"
        : status === "closed"
          ? "Đã đóng"
          : "Đã chuyển đổi";
}

// =====================================================================================
// SECTION D — Top-level component
// =====================================================================================

export default function ContractsView() {
  const [activeTab, setActiveTab] = useState<ContractTab>("list");
  const [contracts, setContracts] = useState<Contract[]>(INITIAL_CONTRACTS);
  const [renewals, setRenewals] = useState<Renewal[]>(INITIAL_RENEWALS);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(INITIAL_UPGRADES);
  const [suspensions, setSuspensions] = useState<Suspension[]>(INITIAL_SUSPENSIONS);
  const [transfers, setTransfers] = useState<Transfer[]>(INITIAL_TRANSFERS);
  const [conversions, setConversions] = useState<Conversion[]>(INITIAL_CONVERSIONS);
  const [listActionForm, setListActionForm] = useState<{
    kind: "renewal" | "upgrade" | "suspension" | "transfer" | "conversion";
    contractId: string;
  } | null>(null);

  // Mutable lookup state
  const [customersState, setCustomersState] = useState<CustomerLite[]>(CUSTOMERS);
  const [packagesState] = useState<PackageOption[]>(PACKAGE_LIBRARY);
  const [groups, setGroups] = useState<CustomerGroup[]>(INITIAL_GROUPS);
  const [sources, setSources] = useState<CustomerSource[]>(INITIAL_SOURCES);
  const [contractTypesState, setContractTypesState] = useState<ContractType[]>(INITIAL_CONTRACT_TYPES);
  const [trainers, setTrainers] = useState<Trainer[]>(INITIAL_TRAINERS);
  const [vouchersState, setVouchersState] = useState<Voucher[]>(INITIAL_VOUCHERS);
  const [serviceTypes, setServiceTypes] = useState<string[]>([...SERVICE_TYPE_OPTIONS]);
  const [bankAccounts] = useState<BankAccount[]>(INITIAL_BANK_ACCOUNTS);
  const [posDevices] = useState<PosDevice[]>(INITIAL_POS_DEVICES);
  const [cashFunds] = useState<CashFund[]>(INITIAL_CASH_FUNDS);

  // Toast (simple)
  const [toast, setToast] = useState<string | null>(null);
  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  };

  // Handlers cho sub-modal "+ Thêm" inline
  const handleCreateGroup = (name: string, description: string) => {
    const id = `G-${Date.now().toString(36).toUpperCase()}`;
    setGroups((current) => [...current, { id, name, description }]);
    flash(`Đã thêm nhóm KH "${name}"`);
  };
  const handleCreateSource = (name: string, description: string) => {
    const id = `S-${Date.now().toString(36).toUpperCase()}`;
    setSources((current) => [...current, { id, name, description }]);
    flash(`Đã thêm nguồn KH "${name}"`);
  };
  const handleCreateContractType = (name: string, description: string) => {
    const id = `CT-${Date.now().toString(36).toUpperCase()}`;
    setContractTypesState((current) => [...current, { id, name, description }]);
    flash(`Đã thêm loại HĐ "${name}"`);
  };
  const handleCreateServiceType = (name: string) => {
    setServiceTypes((current) => current.includes(name) ? current : [...current, name]);
    flash(`Đã thêm loại dịch vụ "${name}"`);
  };
  const handleCreateTrainer = (name: string, specialty: string) => {
    const id = `TR-${Date.now().toString(36).toUpperCase()}`;
    setTrainers((current) => [...current, { id, name, specialty }]);
    flash(`Đã thêm HLV "${name}"`);
  };
  const handleCreateVoucher = (v: Voucher) => {
    setVouchersState((current) => [...current, v]);
    flash(`Đã tạo voucher ${v.code}`);
  };
  const handleCreateCustomer = (c: CustomerLite) => {
    setCustomersState((current) => [...current, c]);
    flash(`Đã tạo KH ${c.code} · ${c.name}`);
  };

  const stats = useMemo(() => {
    const today = new Date();
    const inDays = (endStr: string) => {
      const [d, m, y] = endStr.split("/").map(Number);
      if (!d) return 9999;
      const end = new Date(y, m - 1, d);
      return Math.round((end.getTime() - today.getTime()) / 86_400_000);
    };
    return {
      total: contracts.length,
      active: contracts.filter((c) => c.status === "active").length,
      soon: contracts.filter((c) => c.status === "active" && inDays(c.endDate) <= 30 && inDays(c.endDate) >= 0).length,
      expired: contracts.filter((c) => c.status === "expired").length,
    };
  }, [contracts]);

  return (
    <>
      <FeaturePage
        title="Hợp Đồng"
        subtitle="Quản lý vòng đời hợp đồng hội viên: ký mới · gia hạn · nâng cấp · bảo lưu · chuyển nhượng · chuyển đổi"
      >
        <div className={styles.contractTabs}>
          <TabButton active={activeTab === "list"} icon={FileText} label="Hợp Đồng" count={contracts.length} onClick={() => setActiveTab("list")} />
          <TabButton active={activeTab === "renewal"} icon={RefreshCcw} label="Gia Hạn" count={renewals.length} onClick={() => setActiveTab("renewal")} />
          <TabButton active={activeTab === "upgrade"} icon={TrendingUp} label="Nâng Cấp" count={upgrades.length} onClick={() => setActiveTab("upgrade")} />
          <TabButton active={activeTab === "suspension"} icon={Pause} label="Bảo Lưu" count={suspensions.length} onClick={() => setActiveTab("suspension")} />
          <TabButton active={activeTab === "transfer"} icon={UserCog} label="Chuyển Nhượng" count={transfers.length} onClick={() => setActiveTab("transfer")} accent="purple" />
          <TabButton active={activeTab === "conversion"} icon={Layers} label="Chuyển Đổi HĐ" count={conversions.length} onClick={() => setActiveTab("conversion")} accent="blue" />
        </div>

        {activeTab === "list" ? (
          <ContractListTab
            stats={stats}
            contracts={contracts}
            onChange={setContracts}
            onAddRenewal={(contract) => {
              setListActionForm({ kind: "renewal", contractId: contract.id });
            }}
            onAddUpgrade={(contract) => {
              setListActionForm({ kind: "upgrade", contractId: contract.id });
            }}
            onAddSuspension={(contract) => {
              setListActionForm({ kind: "suspension", contractId: contract.id });
            }}
            onAddTransfer={(contract) => {
              setListActionForm({ kind: "transfer", contractId: contract.id });
            }}
            onAddConversion={(contract) => {
              setListActionForm({ kind: "conversion", contractId: contract.id });
            }}
            flash={flash}
            customers={customersState}
            packages={packagesState}
            groups={groups}
            sources={sources}
            contractTypes={contractTypesState}
            trainers={trainers}
            vouchers={vouchersState}
            serviceTypes={serviceTypes}
            bankAccounts={bankAccounts}
            posDevices={posDevices}
            cashFunds={cashFunds}
            onCreateGroup={handleCreateGroup}
            onCreateSource={handleCreateSource}
            onCreateContractType={handleCreateContractType}
            onCreateServiceType={handleCreateServiceType}
            onCreateTrainer={handleCreateTrainer}
            onCreateVoucher={handleCreateVoucher}
            onCreateCustomer={handleCreateCustomer}
          />
        ) : null}

        {activeTab === "renewal" ? (
          <RenewalTab
            renewals={renewals}
            contracts={contracts}
            onChangeRenewals={setRenewals}
            onChangeContracts={setContracts}
            flash={flash}
          />
        ) : null}

        {activeTab === "upgrade" ? (
          <UpgradeTab
            upgrades={upgrades}
            contracts={contracts}
            onChangeUpgrades={setUpgrades}
            onChangeContracts={setContracts}
            flash={flash}
          />
        ) : null}

        {activeTab === "suspension" ? (
          <SuspensionTab
            suspensions={suspensions}
            contracts={contracts}
            onChangeSuspensions={setSuspensions}
            onChangeContracts={setContracts}
            flash={flash}
          />
        ) : null}

        {activeTab === "transfer" ? (
          <TransferTab
            transfers={transfers}
            contracts={contracts}
            onChangeTransfers={setTransfers}
            onChangeContracts={setContracts}
            flash={flash}
          />
        ) : null}

        {activeTab === "conversion" ? (
          <ConversionTab
            conversions={conversions}
            contracts={contracts}
            onChangeConversions={setConversions}
            onChangeContracts={setContracts}
            flash={flash}
          />
        ) : null}
      </FeaturePage>

      {toast ? (
        <div className={styles.contractToast}>{toast}</div>
      ) : null}

      {listActionForm?.kind === "renewal" ? (
        <RenewalFormModal
          contracts={contracts}
          existingRenewals={renewals}
          initialContractId={listActionForm.contractId}
          onClose={() => setListActionForm(null)}
          onSubmit={(renewal, contract) => {
            setRenewals((current) => [renewal, ...current]);
            setContracts((current) =>
              current.map((c) =>
                c.id === contract.id
                  ? {
                      ...c,
                      endDate: renewal.newEndDate,
                      totalSessions: c.totalSessions + renewal.addedSessions,
                      remainingSessions: c.remainingSessions + renewal.addedSessions,
                      renewalCount: c.renewalCount + 1,
                      history: [
                        ...c.history,
                        { date: nowString(), actor: renewal.saleStaff, action: `Gia hạn (${renewal.id})`, detail: `+${renewal.addedSessions} buổi · ${formatCurrency(renewal.total)}` },
                      ],
                    }
                  : c
              )
            );
            flash(`Đã tạo ${renewal.id} từ HĐ ${contract.id}`);
            setListActionForm(null);
          }}
        />
      ) : null}

      {listActionForm?.kind === "upgrade" ? (
        <UpgradeFormModal
          contracts={contracts}
          existing={upgrades}
          initialContractId={listActionForm.contractId}
          onClose={() => setListActionForm(null)}
          onSubmit={(upgrade) => {
            setUpgrades((current) => [upgrade, ...current]);
            flash(`Đã tạo yêu cầu nâng cấp ${upgrade.id} từ HĐ ${upgrade.contractId}`);
            setListActionForm(null);
          }}
        />
      ) : null}

      {listActionForm?.kind === "suspension" ? (
        <SuspensionFormModal
          contracts={contracts}
          existing={suspensions}
          initialContractId={listActionForm.contractId}
          onClose={() => setListActionForm(null)}
          onSubmit={(suspension) => {
            setSuspensions((current) => [suspension, ...current]);
            flash(`Đã tạo yêu cầu bảo lưu ${suspension.id} từ HĐ ${listActionForm.contractId}`);
            setListActionForm(null);
          }}
        />
      ) : null}

      {listActionForm?.kind === "transfer" ? (
        <TransferFormModal
          contracts={contracts}
          existing={transfers}
          initialContractId={listActionForm.contractId}
          onClose={() => setListActionForm(null)}
          onSubmit={(transfer) => {
            setTransfers((current) => [transfer, ...current]);
            flash(`Đã tạo yêu cầu chuyển nhượng ${transfer.id} từ HĐ ${transfer.contractId}`);
            setListActionForm(null);
          }}
        />
      ) : null}

      {listActionForm?.kind === "conversion" ? (
        <ConversionFormModal
          contracts={contracts}
          existing={conversions}
          initialContractId={listActionForm.contractId}
          onClose={() => setListActionForm(null)}
          onSubmit={(conversion) => {
            setConversions((current) => [conversion, ...current]);
            flash(`Đã tạo yêu cầu chuyển đổi ${conversion.id} từ HĐ ${conversion.oldContractId}`);
            setListActionForm(null);
          }}
        />
      ) : null}
    </>
  );
}

export function ContractWorkflowOverlay({
  onClose,
  request,
}: {
  onClose: () => void;
  request: ContractWorkflowRequest;
}) {
  const [contracts, setContracts] = useState<Contract[]>(INITIAL_CONTRACTS);
  const [customersState, setCustomersState] = useState<CustomerLite[]>(CUSTOMERS);
  const [groups, setGroups] = useState<CustomerGroup[]>(INITIAL_GROUPS);
  const [sources, setSources] = useState<CustomerSource[]>(INITIAL_SOURCES);
  const [contractTypesState, setContractTypesState] = useState<ContractType[]>(INITIAL_CONTRACT_TYPES);
  const [trainers, setTrainers] = useState<Trainer[]>(INITIAL_TRAINERS);
  const [vouchersState, setVouchersState] = useState<Voucher[]>(INITIAL_VOUCHERS);
  const [serviceTypes, setServiceTypes] = useState<string[]>([...SERVICE_TYPE_OPTIONS]);
  const [bankAccounts] = useState<BankAccount[]>(INITIAL_BANK_ACCOUNTS);
  const [posDevices] = useState<PosDevice[]>(INITIAL_POS_DEVICES);
  const [cashFunds] = useState<CashFund[]>(INITIAL_CASH_FUNDS);
  const [mode, setMode] = useState<"detail" | "edit" | "create">(request.mode);
  const targetContract =
    contracts.find((contract) => contract.id === request.contractId) ??
    contracts.find((contract) => contract.customerCode === request.customerCode) ??
    contracts[0];
  const [printContract, setPrintContract] = useState<Contract | null>(null);

  const handleCreateGroup = (name: string, description: string) => {
    setGroups((current) => [...current, { id: `G-${Date.now().toString(36).toUpperCase()}`, name, description }]);
  };
  const handleCreateSource = (name: string, description: string) => {
    setSources((current) => [...current, { id: `S-${Date.now().toString(36).toUpperCase()}`, name, description }]);
  };
  const handleCreateContractType = (name: string, description: string) => {
    setContractTypesState((current) => [...current, { id: `CT-${Date.now().toString(36).toUpperCase()}`, name, description }]);
  };
  const handleCreateServiceType = (name: string) => {
    setServiceTypes((current) => current.includes(name) ? current : [...current, name]);
  };
  const handleCreateTrainer = (name: string, specialty: string) => {
    setTrainers((current) => [...current, { id: `TR-${Date.now().toString(36).toUpperCase()}`, name, specialty }]);
  };
  const handleCreateVoucher = (voucher: Voucher) => {
    setVouchersState((current) => [...current, voucher]);
  };
  const handleCreateCustomer = (customer: CustomerLite) => {
    setCustomersState((current) => [...current, customer]);
  };
  const handleSubmit = (next: Contract) => {
    setContracts((current) => current.some((contract) => contract.id === next.id)
      ? current.map((contract) => contract.id === next.id ? next : contract)
      : [next, ...current]);
    onClose();
  };

  if (mode === "detail") {
    return (
      <>
        <ContractDetailModal
          contract={targetContract}
          onClose={onClose}
          onEdit={() => setMode("edit")}
          onPrint={() => setPrintContract(targetContract)}
        />
        {printContract ? (
          <PrintTemplateDialog
            onClose={() => setPrintContract(null)}
            onConfirm={() => setPrintContract(null)}
            title={`In hợp đồng ${printContract.id}`}
          />
        ) : null}
      </>
    );
  }

  return (
    <ContractFormModal
      key={`${request.id}-${mode}`}
      initial={mode === "edit" ? targetContract : null}
      initialCustomerCode={mode === "create" ? request.customerCode : undefined}
      onClose={onClose}
      onSubmit={handleSubmit}
      existingIds={contracts.map((contract) => contract.id)}
      customers={customersState}
      packages={PACKAGE_LIBRARY}
      groups={groups}
      sources={sources}
      contractTypes={contractTypesState}
      trainers={trainers}
      vouchers={vouchersState}
      serviceTypes={serviceTypes}
      bankAccounts={bankAccounts}
      posDevices={posDevices}
      cashFunds={cashFunds}
      onCreateGroup={handleCreateGroup}
      onCreateSource={handleCreateSource}
      onCreateContractType={handleCreateContractType}
      onCreateServiceType={handleCreateServiceType}
      onCreateTrainer={handleCreateTrainer}
      onCreateVoucher={handleCreateVoucher}
      onCreateCustomer={handleCreateCustomer}
    />
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
  icon: typeof FileText;
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
  icon: typeof FileText;
  label: string;
  tone: "blue" | "green" | "amber" | "red";
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

// =====================================================================================
// SECTION E — Tab "Hợp Đồng" (CRUD chính)
// =====================================================================================

type ContractListStats = { total: number; active: number; soon: number; expired: number };

type ContractListProps = {
  stats: ContractListStats;
  contracts: Contract[];
  onChange: (next: Contract[]) => void;
  onAddRenewal: (contract: Contract) => void;
  onAddUpgrade: (contract: Contract) => void;
  onAddSuspension: (contract: Contract) => void;
  onAddTransfer: (contract: Contract) => void;
  onAddConversion: (contract: Contract) => void;
  flash: (msg: string) => void;
  customers: CustomerLite[];
  packages: PackageOption[];
  groups: CustomerGroup[];
  sources: CustomerSource[];
  contractTypes: ContractType[];
  trainers: Trainer[];
  vouchers: Voucher[];
  serviceTypes: string[];
  bankAccounts: BankAccount[];
  posDevices: PosDevice[];
  cashFunds: CashFund[];
  onCreateGroup: (name: string, description: string) => void;
  onCreateSource: (name: string, description: string) => void;
  onCreateContractType: (name: string, description: string) => void;
  onCreateServiceType: (name: string) => void;
  onCreateTrainer: (name: string, specialty: string) => void;
  onCreateVoucher: (v: Voucher) => void;
  onCreateCustomer: (c: CustomerLite) => void;
};

function ContractListTab({
  stats,
  contracts,
  onChange,
  onAddRenewal,
  onAddUpgrade,
  onAddSuspension,
  onAddTransfer,
  onAddConversion,
  flash,
  customers,
  packages,
  groups,
  sources,
  contractTypes,
  trainers,
  vouchers,
  serviceTypes,
  bankAccounts,
  posDevices,
  cashFunds,
  onCreateGroup,
  onCreateSource,
  onCreateContractType,
  onCreateServiceType,
  onCreateTrainer,
  onCreateVoucher,
  onCreateCustomer,
}: ContractListProps) {
  const [filter, setFilter] = useState<"all" | "active" | "suspended" | "expired">("all");
  const [query, setQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState<string>("Tất cả chi nhánh");
  const [packageFilter, setPackageFilter] = useState<string>("Tất cả gói");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [detailContract, setDetailContract] = useState<Contract | null>(null);
  const [historyContract, setHistoryContract] = useState<Contract | null>(null);
  const [printContract, setPrintContract] = useState<Contract | null>(null);
  const [deleteContract, setDeleteContract] = useState<Contract | null>(null);

  const filtered = contracts.filter((c) => {
    if (filter === "active" && c.status !== "active") return false;
    if (filter === "suspended" && c.status !== "suspended") return false;
    if (filter === "expired" && c.status !== "expired") return false;
    if (branchFilter !== "Tất cả chi nhánh" && c.branch !== branchFilter) return false;
    if (packageFilter !== "Tất cả gói" && c.packageCode !== packageFilter) return false;
    if (query) {
      const target = `${c.id} ${c.customerCode} ${lookupCustomer(c.customerCode)?.name ?? ""} ${lookupCustomer(c.customerCode)?.phone ?? ""}`.toLowerCase();
      if (!target.includes(query.toLowerCase())) return false;
    }
    return true;
  });

  const openCreate = () => {
    setEditingContract(null);
    setFormOpen(true);
  };

  const openEdit = (contract: Contract) => {
    setEditingContract(contract);
    setFormOpen(true);
    setOpenMenuId(null);
  };

  const handleSubmit = (next: Contract) => {
    const exists = contracts.find((c) => c.id === next.id);
    if (exists) {
      onChange(contracts.map((c) => (c.id === next.id ? next : c)));
      flash(`Đã cập nhật ${next.id}`);
    } else {
      onChange([next, ...contracts]);
      flash(`Đã tạo ${next.id} + sinh phiếu thu (BR-M5-01)`);
    }
    setFormOpen(false);
    setEditingContract(null);
  };

  const handleDelete = (target: Contract) => {
    onChange(contracts.filter((c) => c.id !== target.id));
    flash(`Đã xóa ${target.id} (Soft Delete 30 ngày — BR-M8-07)`);
    setDeleteContract(null);
  };

  return (
    <>
      <div className={styles.contractKpi}>
        <KpiCard label="Tổng HĐ" value={String(stats.total)} tone="blue" icon={FileText} />
        <KpiCard label="Đang Hoạt Động" value={String(stats.active)} tone="green" icon={CheckCircle2} />
        <KpiCard label="Sắp Hết Hạn (≤30 ngày)" value={String(stats.soon)} tone="amber" icon={Clock} />
        <KpiCard label="Đã Hết Hạn" value={String(stats.expired)} tone="red" icon={XCircle} />
      </div>

      <div className={styles.contractListSearchRow}>
        <div className={styles.pricingSearch} style={{ flex: 1 }}>
          <Search size={18} />
          <input
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm theo tên, mã hợp đồng..."
            value={query}
          />
        </div>
        <select className={styles.selectInput} onChange={(e) => setBranchFilter(e.target.value)} value={branchFilter}>
          {["Tất cả chi nhánh", ...BRANCHES].map((b) => <option key={b}>{b}</option>)}
        </select>
        <select className={styles.selectInput} onChange={(e) => setPackageFilter(e.target.value)} value={packageFilter}>
          <option>Tất cả gói</option>
          {PACKAGE_LIBRARY.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
        </select>
      </div>

      <div className={styles.contractListChipRow}>
        <div className={styles.contractFilterChips}>
          {[
            { key: "all", label: "Tất Cả" },
            { key: "active", label: "Đang Hoạt Động" },
            { key: "suspended", label: "Bảo Lưu" },
            { key: "expired", label: "Hết Hạn" },
          ].map((opt) => (
            <button
              className={filter === opt.key ? styles.contractFilterActive : styles.contractFilterChip}
              key={opt.key}
              onClick={() => setFilter(opt.key as typeof filter)}
              type="button"
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className={styles.contractListActions}>
          <button className={styles.greenButton} onClick={openCreate} type="button">
            <PlusCircle size={16} /> Thêm Mới Hợp Đồng
          </button>
        </div>
      </div>

      <section className={styles.memberTableCard}>
        <div className={styles.memberTableWrap}>
          <table className={`${styles.memberTable} ${styles.contractListTable}`}>
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã HĐ</th>
                <th>Mã HV</th>
                <th>Tên học viên</th>
                <th>Số điện thoại</th>
                <th>Gói tập</th>
                <th>Đơn vị</th>
                <th>Số lượng</th>
                <th>Giá kỳ</th>
                <th>Tổng TT</th>
                <th>Đã TT</th>
                <th>Còn nợ</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Người tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td className={styles.emptyTableCell} colSpan={16}>Không có hợp đồng nào khớp bộ lọc</td>
                </tr>
              ) : null}
              {filtered.map((c, index) => {
                const customer = lookupCustomer(c.customerCode);
                const pkg = lookupPackage(c.packageCode);
                const debt = c.totalAmount - c.paid;
                const unit = pkg ? (pkg.durationMonths >= 1 ? "tháng" : pkg.sessions > 0 ? "buổi" : "lượt") : "—";
                const quantity = pkg ? (pkg.durationMonths >= 1 ? `${Math.round(pkg.durationMonths)} tháng` : `${pkg.sessions} buổi`) : "—";
                const periodPrice = pkg ? Math.round(pkg.price / Math.max(1, Math.round(pkg.durationMonths || 1))) : 0;
                return (
                  <tr key={c.id}>
                    <td className={styles.contractRowIndex}>{index + 1}</td>
                    <td>
                      <button className={styles.memberCode} onClick={() => setDetailContract(c)} type="button">
                        {c.id}
                      </button>
                    </td>
                    <td><span className={styles.contractCustomerCodeCell}>{c.customerCode}</span></td>
                    <td className={styles.memberName}>
                      <strong>{customer?.name ?? c.customerCode}</strong>
                    </td>
                    <td>{customer?.phone ?? "—"}</td>
                    <td>{pkg?.name ?? c.packageCode}</td>
                    <td className={styles.cellMuted}>{unit}</td>
                    <td>{quantity}</td>
                    <td className={pkg && pkg.durationMonths >= 1 ? styles.contractMoneyCellAmount : styles.cellMuted}>
                      {pkg && pkg.durationMonths >= 1 ? formatCurrency(periodPrice) : "N/A"}
                    </td>
                    <td><strong className={styles.contractTotalCell}>{formatCurrency(c.totalAmount)}</strong></td>
                    <td><strong className={styles.contractPaidCell}>{formatCurrency(c.paid)}</strong></td>
                    <td>
                      <strong className={debt > 0 ? styles.contractDebtCell : styles.contractZeroCell}>
                        {formatCurrency(Math.max(0, debt))}
                      </strong>
                    </td>
                    <td>{c.startDate}</td>
                    <td>{c.endDate}</td>
                    <td className={styles.cellTruncate} title={c.creator}>{c.creator}</td>
                    <td>
                      <div className={styles.contractRowActions}>
                        <button onClick={() => setDetailContract(c)} title="Xem" type="button"><Eye size={14} /></button>
                        <button onClick={() => openEdit(c)} title="Sửa" type="button"><Edit3 size={14} /></button>
                        <button
                          onClick={() => setDeleteContract(c)}
                          title="Xóa"
                          type="button"
                          className={styles.contractDelete}
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className={styles.contractMenuWrap}>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                            title="Thao tác khác"
                            type="button"
                          >
                            <MoreVertical size={14} />
                          </button>
                          {openMenuId === c.id ? (
                            <ContractActionMenu
                              contract={c}
                              onClose={() => setOpenMenuId(null)}
                              onPrint={() => { setOpenMenuId(null); setPrintContract(c); }}
                              onRenew={() => { setOpenMenuId(null); onAddRenewal(c); }}
                              onUpgrade={() => { setOpenMenuId(null); onAddUpgrade(c); }}
                              onSuspend={() => { setOpenMenuId(null); onAddSuspension(c); }}
                              onTransfer={() => { setOpenMenuId(null); onAddTransfer(c); }}
                              onConvert={() => { setOpenMenuId(null); onAddConversion(c); }}
                              onHistory={() => { setOpenMenuId(null); setHistoryContract(c); }}
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
          <span>Hiển thị {filtered.length} / {contracts.length} hợp đồng</span>
          <span>Trạng thái: <ContractStatusBadge status="active" /></span>
        </footer>
      </section>

      {formOpen ? (
        <ContractFormModal
          key={editingContract?.id ?? "new"}
          initial={editingContract}
          onClose={() => { setFormOpen(false); setEditingContract(null); }}
          onSubmit={handleSubmit}
          existingIds={contracts.map((c) => c.id)}
          customers={customers}
          packages={packages}
          groups={groups}
          sources={sources}
          contractTypes={contractTypes}
          trainers={trainers}
          vouchers={vouchers}
          serviceTypes={serviceTypes}
          bankAccounts={bankAccounts}
          posDevices={posDevices}
          cashFunds={cashFunds}
          onCreateGroup={onCreateGroup}
          onCreateSource={onCreateSource}
          onCreateContractType={onCreateContractType}
          onCreateServiceType={onCreateServiceType}
          onCreateTrainer={onCreateTrainer}
          onCreateVoucher={onCreateVoucher}
          onCreateCustomer={onCreateCustomer}
        />
      ) : null}

      {detailContract ? (
        <ContractDetailModal
          contract={detailContract}
          onClose={() => setDetailContract(null)}
          onEdit={() => { openEdit(detailContract); setDetailContract(null); }}
          onPrint={() => { setPrintContract(detailContract); setDetailContract(null); }}
        />
      ) : null}

      {historyContract ? (
        <ContractHistoryModal
          contract={historyContract}
          onClose={() => setHistoryContract(null)}
        />
      ) : null}

      {printContract ? (
        <PrintTemplateDialog
          onClose={() => setPrintContract(null)}
          onConfirm={(template) => {
            flash(`Đang in ${printContract.id} bằng mẫu "${template}"`);
            setPrintContract(null);
          }}
          title={`In hợp đồng ${printContract.id}`}
        />
      ) : null}

      {deleteContract ? (
        <DeleteContractDialog
          contract={deleteContract}
          onCancel={() => setDeleteContract(null)}
          onConfirm={() => handleDelete(deleteContract)}
        />
      ) : null}
    </>
  );
}

function ContractStatusBadge({ status }: { status: ContractStatus }) {
  const className =
    status === "active"
      ? styles.contractBadgeActive
      : status === "suspended"
        ? styles.contractBadgeSuspended
        : status === "expired"
          ? styles.contractBadgeExpired
          : status === "closed"
            ? styles.contractBadgeClosed
            : styles.contractBadgeConverted;
  return <span className={className}>{statusLabel(status)}</span>;
}

function useContractMenuPosition() {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState<{ left: number; top: number }>({ left: 0, top: 0 });

  useLayoutEffect(() => {
    const menu = menuRef.current;
    const trigger = menu?.parentElement?.querySelector("button");
    if (!menu || !trigger) return;

    const triggerRect = trigger.getBoundingClientRect();
    const menuWidth = Math.min(300, window.innerWidth - 32);
    const menuHeight = Math.min(menu.scrollHeight || 260, window.innerHeight - 32);
    const left = Math.min(Math.max(16, triggerRect.right - menuWidth), window.innerWidth - menuWidth - 16);
    const preferredTop = triggerRect.bottom + 8;
    const top =
      preferredTop + menuHeight > window.innerHeight - 16
        ? Math.max(16, triggerRect.top - menuHeight - 8)
        : preferredTop;

    setStyle({ left, top });
  }, []);

  return { menuRef, style };
}

function ContractActionMenu({
  contract,
  onClose,
  onPrint,
  onRenew,
  onUpgrade,
  onSuspend,
  onTransfer,
  onConvert,
  onHistory,
}: {
  contract: Contract;
  onClose: () => void;
  onPrint: () => void;
  onRenew: () => void;
  onUpgrade: () => void;
  onSuspend: () => void;
  onTransfer: () => void;
  onConvert: () => void;
  onHistory: () => void;
}) {
  const { menuRef, style } = useContractMenuPosition();
  const isActive = contract.status === "active";
  const items: Array<{ icon: typeof FileText; label: string; onClick: () => void; disabled?: boolean; hint?: string }> = [
    { icon: Printer, label: "In hợp đồng", onClick: onPrint },
    { icon: RefreshCcw, label: "Gia hạn", onClick: onRenew, disabled: !isActive, hint: !isActive ? "HĐ phải đang Hoạt động" : "" },
    { icon: TrendingUp, label: "Nâng cấp", onClick: onUpgrade, disabled: !isActive, hint: !isActive ? "HĐ phải đang Hoạt động" : "" },
    { icon: Pause, label: "Bảo lưu", onClick: onSuspend, disabled: !isActive || contract.suspensionCount >= 2, hint: contract.suspensionCount >= 2 ? "Đã bảo lưu 2 lần (BR-M8-26)" : "" },
    { icon: UserCog, label: "Chuyển nhượng", onClick: onTransfer, disabled: !isActive || contract.hasTransferred, hint: contract.hasTransferred ? "Đã CN 1 lần (BR-M8-54)" : "" },
    { icon: Layers, label: "Chuyển đổi HĐ", onClick: onConvert, disabled: !isActive || contract.hasConverted, hint: contract.hasConverted ? "Đã chuyển đổi (BR-M8-61)" : "" },
    { icon: History, label: "Lịch sử giao dịch", onClick: onHistory },
  ];

  return (
    <>
      <button className={styles.contractMenuBackdrop} onClick={onClose} type="button" aria-label="Đóng menu" />
      <div className={styles.contractActionMenu} ref={menuRef} style={style}>
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
// SECTION F — Form Tạo/Sửa Hợp Đồng (6 section)
// =====================================================================================

function ContractFormModal({
  existingIds,
  initial,
  initialCustomerCode,
  onClose,
  onSubmit,
  groups,
  sources,
  contractTypes,
  trainers,
  vouchers,
  bankAccounts,
  posDevices,
  cashFunds,
  customers,
  packages,
  onCreateGroup,
  onCreateSource,
  onCreateContractType,
  onCreateServiceType,
  onCreateTrainer,
  onCreateVoucher,
  onCreateCustomer,
  serviceTypes,
}: {
  existingIds: string[];
  initial: Contract | null;
  initialCustomerCode?: string;
  onClose: () => void;
  onSubmit: (contract: Contract) => void;
  groups: CustomerGroup[];
  sources: CustomerSource[];
  contractTypes: ContractType[];
  trainers: Trainer[];
  vouchers: Voucher[];
  bankAccounts: BankAccount[];
  posDevices: PosDevice[];
  cashFunds: CashFund[];
  customers: CustomerLite[];
  packages: PackageOption[];
  serviceTypes: string[];
  onCreateGroup: (name: string, description: string) => void;
  onCreateSource: (name: string, description: string) => void;
  onCreateContractType: (name: string, description: string) => void;
  onCreateServiceType: (name: string) => void;
  onCreateTrainer: (name: string, specialty: string) => void;
  onCreateVoucher: (v: Voucher) => void;
  onCreateCustomer: (c: CustomerLite) => void;
}) {
  const today = todayString();
  const isEdit = Boolean(initial);

  // ---- Section 1: Khách hàng ----
  const initialCustomer = initial
    ? customers.find((c) => c.code === initial.customerCode)
    : customers.find((c) => c.code === initialCustomerCode);
  const [customerMode, setCustomerMode] = useState<"existing" | "new">(isEdit ? "existing" : "existing");
  const [customerCode, setCustomerCode] = useState<string>(initial?.customerCode ?? initialCustomerCode ?? customers[0]?.code ?? "");
  const [showAdvanced, setShowAdvanced] = useState<boolean>(true);
  const [memberCode, setMemberCode] = useState<string>(initialCustomer?.code ?? customerCode);
  const [bioCode, setBioCode] = useState<string>(initialCustomer?.bioCode ?? "");
  const [custName, setCustName] = useState<string>(initialCustomer?.name ?? "");
  const [custPhone, setCustPhone] = useState<string>(initialCustomer?.phone ?? "");
  const [custEmail, setCustEmail] = useState<string>(initialCustomer?.email ?? "");
  const [custBirth, setCustBirth] = useState<string>(initialCustomer?.birthDate ?? "");
  const [custCard, setCustCard] = useState<string>(initialCustomer?.card ?? "");
  const [custGroup, setCustGroup] = useState<string>(initialCustomer?.groupId ?? "");
  const [custSource, setCustSource] = useState<string>(initialCustomer?.sourceId ?? "");
  const [custCccd, setCustCccd] = useState<string>(initialCustomer?.cccd ?? "");
  const [custGender, setCustGender] = useState<"Nam" | "Nữ">(initialCustomer?.gender ?? "Nam");
  const [custContactName, setCustContactName] = useState<string>(initialCustomer?.contactName ?? "");
  const [custContactPhone, setCustContactPhone] = useState<string>(initialCustomer?.contactPhone ?? "");
  const [custProvince, setCustProvince] = useState<string>(initialCustomer?.province ?? "");
  const [custWard, setCustWard] = useState<string>(initialCustomer?.ward ?? "");
  const [custStreet, setCustStreet] = useState<string>(initialCustomer?.street ?? "");
  const [custNote, setCustNote] = useState<string>(initialCustomer?.note ?? "");
  const [companions, setCompanions] = useState<Companion[]>(initialCustomer?.companions ?? []);
  const [customFields, setCustomFields] = useState<Array<{ label: string; value: string }>>(initial?.customFields ?? []);

  // Sub-modal state
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [companionModalOpen, setCompanionModalOpen] = useState(false);
  const [contractTypeModalOpen, setContractTypeModalOpen] = useState(false);
  const [serviceTypeModalOpen, setServiceTypeModalOpen] = useState(false);
  const [trainerModalOpen, setTrainerModalOpen] = useState(false);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [customFieldModalOpen, setCustomFieldModalOpen] = useState(false);

  // ---- Section 2: Dịch vụ ----
  const [branch, setBranch] = useState<string>(initial?.branch ?? BRANCHES[0]);
  const [contractDate, setContractDate] = useState<string>(initial?.signedDate ?? today);
  const [contractTypeId, setContractTypeId] = useState<string>(initial?.contractTypeId ?? contractTypes[0]?.id ?? "");
  const [serviceTypeName, setServiceTypeName] = useState<string>(initial?.serviceTypeId ?? serviceTypes[0] ?? "");
  const [packageCode, setPackageCode] = useState<string>(initial?.packageCode ?? packages[0].code);
  const initialPackage = packages.find((p) => p.code === packageCode);
  const [startDate, setStartDate] = useState<string>(initial?.startDate ?? today);
  const [endDate, setEndDate] = useState<string>(
    initial?.endDate ?? (initialPackage ? addMonthsToDate(today, Math.max(1, Math.round(initialPackage.durationMonths))) : today)
  );
  const [trainerId, setTrainerId] = useState<string>(initial?.trainerId ?? "");
  const [salesAlloc, setSalesAlloc] = useState<SalesAllocation[]>(
    initial?.saleAllocations ?? [{ staff: SALES_STAFF[0], percent: 100 }]
  );
  const [contractCode, setContractCode] = useState<string>(
    () => initial?.id ?? `HD${Date.now().toString().slice(-12)}`
  );
  const [activeNow, setActiveNow] = useState<boolean>(initial?.activeNow ?? true);
  const [commissionMode, setCommissionMode] = useState<CommissionMode>(initial?.commissionMode ?? "preset");
  const [commissionPercent, setCommissionPercent] = useState<number>(initial?.commissionPercent ?? 10);

  // ---- Section 3: Ký HĐ ----
  const [signStatus, setSignStatus] = useState<"Chưa ký" | "Đã ký">(initial?.signStatus ?? "Chưa ký");
  const [signDate, setSignDate] = useState<string>(initial?.signedDate ?? "");
  const [signer, setSigner] = useState<string>(initial?.signer ?? "");
  const [signNote, setSignNote] = useState<string>(initial?.signNote ?? "");

  // ---- Section 4: Thanh toán ----
  const [voucherCode, setVoucherCode] = useState<string>(initial?.voucherCode ?? "");
  const [discountKind, setDiscountKind] = useState<"amount" | "percent">("percent");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [vatLines, setVatLines] = useState<VatLine[]>(initial?.vatLines ?? [{ rate: 8, amount: 0 }]);
  const [payments, setPayments] = useState<Payment[]>(
    initial?.payments ?? [{ method: "Tiền mặt", amount: 0, accountId: cashFunds[0]?.id }]
  );
  const [paymentNote, setPaymentNote] = useState<string>("");

  // ---- Section 5: Phiếu thu ----
  const [customerCash, setCustomerCash] = useState<number>(initial?.customerCash ?? 0);
  const [receiptId, setReceiptId] = useState<string>(() => initial?.receiptId ?? `PT${Date.now().toString().slice(-12)}`);
  const [receiptDate, setReceiptDate] = useState<string>(initial?.receiptDate ?? today);
  const [receiptCashier, setReceiptCashier] = useState<string>(initial?.receiptCashier ?? SALES_STAFF[0]);
  const [receiptCategory, setReceiptCategory] = useState<string>(initial?.receiptCategory ?? RECEIPT_CATEGORIES[0]);
  const [paymentDeadline, setPaymentDeadline] = useState<number>(initial?.paymentDeadlineDays ?? 0);
  const [receiptNote, setReceiptNote] = useState<string>(initial?.receiptNote ?? "");

  // ---- Section 6: Đính kèm ----
  const [attachments, setAttachments] = useState<string[]>(initial?.attachments ?? []);

  const [activeSection, setActiveSection] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [error, setError] = useState<string | null>(null);

  const selectedPackage = packages.find((p) => p.code === packageCode);
  const basePrice = selectedPackage?.price ?? 0;
  const months = selectedPackage ? Math.round(selectedPackage.durationMonths) : 0;
  const sessions = selectedPackage?.sessions ?? 0;

  // Voucher discount calc
  const selectedVoucher = vouchers.find((v) => v.code === voucherCode);
  let voucherDiscount = 0;
  if (selectedVoucher) {
    if (!selectedVoucher.minOrder || basePrice >= selectedVoucher.minOrder) {
      voucherDiscount = selectedVoucher.type === "percent"
        ? Math.round((basePrice * selectedVoucher.value) / 100)
        : selectedVoucher.value;
    }
  }

  // Manual discount calc
  const manualDiscount = discountKind === "amount" ? discountValue : Math.round((basePrice * discountValue) / 100);
  const totalDiscount = voucherDiscount + manualDiscount;
  const afterDiscount = Math.max(0, basePrice - totalDiscount);

  // Multi-VAT
  const vatTotal = vatLines.reduce((sum, line) => sum + Math.round((afterDiscount * line.rate) / 100), 0);
  const totalAmount = afterDiscount + vatTotal;

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const debt = totalAmount - totalPaid;
  const change = customerCash - totalPaid;

  const totalSalesPercent = salesAlloc.reduce((s, x) => s + x.percent, 0);

  const onPickPackage = (code: string) => {
    setPackageCode(code);
    const pkg = packages.find((p) => p.code === code);
    if (pkg) {
      const m = Math.max(1, Math.round(pkg.durationMonths));
      setEndDate(addMonthsToDate(startDate, m));
    }
  };

  const onPickStartDate = (value: string) => {
    setStartDate(value);
    if (selectedPackage) {
      setEndDate(addMonthsToDate(value, Math.max(1, Math.round(selectedPackage.durationMonths))));
    }
  };

  const onSelectExisting = (code: string) => {
    setCustomerCode(code);
    setMemberCode(code);
    const c = customers.find((x) => x.code === code);
    if (c) {
      setBioCode(c.bioCode ?? "");
      setCustName(c.name);
      setCustPhone(c.phone);
      setCustEmail(c.email);
      setCustBirth(c.birthDate);
      setCustCard(c.card ?? "");
      setCustGroup(c.groupId ?? "");
      setCustSource(c.sourceId ?? "");
      setCustCccd(c.cccd);
      setCustGender(c.gender);
      setCustContactName(c.contactName ?? "");
      setCustContactPhone(c.contactPhone ?? "");
      setCustProvince(c.province ?? "");
      setCustWard(c.ward ?? "");
      setCustStreet(c.street ?? "");
      setCustNote(c.note ?? "");
      setCompanions(c.companions ?? []);
      setSigner(c.name);
    }
  };

  const updatePayment = (index: number, partial: Partial<Payment>) => {
    setPayments((items) => items.map((p, i) => (i === index ? { ...p, ...partial } : p)));
  };

  const updateSalesAlloc = (index: number, partial: Partial<SalesAllocation>) => {
    setSalesAlloc((items) => items.map((s, i) => (i === index ? { ...s, ...partial } : s)));
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (customerMode === "new" && (!custName.trim() || !custPhone.trim())) {
      setError("Vui lòng nhập họ tên và SĐT để tạo khách hàng mới");
      setActiveSection(1);
      return;
    }
    if (!packageCode) {
      setError("Vui lòng chọn gói dịch vụ");
      setActiveSection(2);
      return;
    }
    if (!signer.trim()) {
      setError("Vui lòng nhập tên người ký hợp đồng");
      setActiveSection(3);
      return;
    }
    if (totalSalesPercent !== 100) {
      setError(`Tổng tỷ lệ doanh số NV Sale phải = 100% (hiện ${totalSalesPercent}%)`);
      setActiveSection(2);
      return;
    }
    // Mã giao dịch bắt buộc cho CK + Thẻ
    for (const p of payments) {
      if ((p.method === "Chuyển khoản" || p.method === "Thẻ") && !p.txRef?.trim() && p.amount > 0) {
        setError(`Vui lòng nhập mã giao dịch cho ${p.method}`);
        setActiveSection(4);
        return;
      }
    }

    let finalCustomerCode = customerCode;
    if (customerMode === "new") {
      const max = Math.max(0, ...customers.map((c) => Number.parseInt(c.code.replace("HV", ""), 10)).filter((n) => !Number.isNaN(n)));
      finalCustomerCode = "HV" + String(max + 1).padStart(3, "0");
      onCreateCustomer({
        code: finalCustomerCode, bioCode, name: custName, phone: custPhone, email: custEmail, cccd: custCccd,
        birthDate: custBirth, gender: custGender, address: `${custStreet}, ${custWard}, ${custProvince}`,
        cccdVerified: false, groupId: custGroup, sourceId: custSource, card: custCard,
        contactName: custContactName, contactPhone: custContactPhone,
        province: custProvince, ward: custWard, street: custStreet, note: custNote, companions,
      });
    }

    const id = initial?.id ?? nextContractId(INITIAL_CONTRACTS.concat(existingIds.map((idStr) => ({ id: idStr } as Contract))));
    const newContract: Contract = {
      id,
      customerCode: finalCustomerCode,
      contractTypeId,
      serviceTypeId: serviceTypeName,
      packageCode,
      signedDate: contractDate,
      startDate,
      endDate,
      branch,
      signer,
      signStatus,
      signNote,
      trainerId,
      activeNow,
      totalSessions: sessions,
      remainingSessions: initial?.remainingSessions ?? sessions,
      basePrice,
      discountAmount: totalDiscount,
      voucherCode: voucherCode || undefined,
      vatPercent: vatLines[0]?.rate ?? 8,
      vatLines,
      totalAmount,
      paid: totalPaid,
      payments,
      receiptId,
      receiptDate,
      receiptCashier,
      receiptCategory,
      receiptNote,
      paymentDeadlineDays: paymentDeadline,
      customerCash,
      changeAmount: Math.max(0, change),
      status: initial?.status ?? "active",
      saleStaff: salesAlloc[0]?.staff ?? SALES_STAFF[0],
      saleAllocations: salesAlloc,
      creator: initial?.creator ?? salesAlloc[0]?.staff ?? SALES_STAFF[0],
      attachments,
      customFields,
      note: paymentNote,
      history: initial?.history ?? [
        { date: nowString(), actor: salesAlloc[0]?.staff ?? "Sale", action: isEdit ? "Cập nhật hợp đồng" : "Ký mới hợp đồng" },
        { date: nowString(), actor: "Hệ thống", action: "Sinh phiếu thu (BR-M5-01)", detail: formatCurrency(totalPaid) },
      ],
      renewalCount: initial?.renewalCount ?? 0,
      suspensionCount: initial?.suspensionCount ?? 0,
      hasUpgraded: initial?.hasUpgraded ?? false,
      hasTransferred: initial?.hasTransferred ?? false,
      hasConverted: initial?.hasConverted ?? false,
      commissionMode,
      commissionPercent: commissionMode === "custom" ? commissionPercent : undefined,
      commissionAmount: commissionMode === "none" ? 0 : Math.round((basePrice * commissionPercent) / 100),
    };
    onSubmit(newContract);
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <form className={styles.contractFormModal} onSubmit={submit}>
        <header className={styles.contractFormBanner}>
          <h2>{isEdit ? `Chỉnh sửa hợp đồng ${initial?.id}` : "Đăng ký hợp đồng mới"}</h2>
          <button onClick={onClose} title="Đóng" type="button"><X size={18} /></button>
        </header>

        <nav className={styles.contractSectionNav}>
          {[
            { num: 1, label: "Thông tin khách hàng", icon: Users, color: "blue" },
            { num: 2, label: "Thông tin dịch vụ", icon: Layers, color: "green" },
            { num: 3, label: "Ký hợp đồng", icon: FileSignature, color: "purple" },
            { num: 4, label: "Thanh toán", icon: Wallet, color: "orange" },
            { num: 5, label: "Phiếu thu", icon: HandCoins, color: "teal" },
            { num: 6, label: "Đính kèm", icon: ClipboardList, color: "indigo" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <button
                className={`${activeSection === s.num ? styles.contractSectionTabActive : styles.contractSectionTab} ${styles[`contractTab_${s.color}`] ?? ""}`}
                key={s.num}
                onClick={() => setActiveSection(s.num as typeof activeSection)}
                type="button"
              >
                <span className={styles.contractSectionNumber}>{s.num}</span>
                <Icon size={14} />
                <span>{s.label}</span>
              </button>
            );
          })}
        </nav>

        <div className={styles.contractFormBody}>
          {error ? <div className={styles.formError}><AlertCircle size={14} /> {error}</div> : null}

          {/* ============ Section 1: Khách hàng ============ */}
          {activeSection === 1 ? (
            <section className={`${styles.contractFormSection} ${styles.contractSectionBlue}`}>
              <h3 className={styles.contractSectionHeader}><Users size={16} /> 1. Thông tin khách hàng</h3>

              <label className={styles.contractCheckboxLine}>
                <input checked={customerMode === "existing"} onChange={(e) => setCustomerMode(e.target.checked ? "existing" : "new")} type="checkbox" />
                Chọn từ hội viên đã có
              </label>

              {customerMode === "existing" ? (
                <label style={{ marginTop: 10, display: "block" }}>
                  <span>Tìm hội viên</span>
                  <select className={styles.selectInput} onChange={(e) => onSelectExisting(e.target.value)} value={customerCode}>
                    {customers.map((c) => <option key={c.code} value={c.code}>{c.code} · {c.name} · {c.phone}</option>)}
                  </select>
                </label>
              ) : null}

              <div className={styles.contractGrid2} style={{ marginTop: 14 }}>
                <label>
                  <span>Mã hội viên</span>
                  <div className={styles.inputWithBtn}>
                    <input onChange={(e) => setMemberCode(e.target.value)} placeholder="HV001" value={memberCode} />
                    <button className={styles.contractAutoBtn} onClick={() => setMemberCode(`HV${String(Math.floor(Math.random() * 9000) + 1000)}`)} type="button">Tự động</button>
                  </div>
                </label>
                <label>
                  <span>Mã sinh trắc học</span>
                  <div className={styles.inputWithBtn}>
                    <input onChange={(e) => setBioCode(e.target.value)} placeholder="8 chữ số" value={bioCode} />
                    <button className={styles.contractAutoBtn} onClick={() => setBioCode(String(Math.floor(Math.random() * 90_000_000) + 10_000_000))} type="button">Tự động</button>
                  </div>
                </label>
                <label><span>Họ và tên <b>*</b></span><input onChange={(e) => setCustName(e.target.value)} placeholder="Nhập họ và tên" value={custName} /></label>
                <label><span>Số điện thoại <b>*</b></span><input onChange={(e) => setCustPhone(e.target.value)} placeholder="0901234567" value={custPhone} /></label>
                <label><span>Email</span><input onChange={(e) => setCustEmail(e.target.value)} placeholder="email@example.com" type="email" value={custEmail} /></label>
                <label><span>Ngày sinh</span><input onChange={(e) => setCustBirth(e.target.value)} placeholder="dd/mm/yyyy" value={custBirth} /></label>
                <label><span>Nhân viên phụ trách</span>
                  <select className={styles.selectInput} onChange={(e) => setTrainerId(e.target.value)} value={trainerId}>
                    <option value="">Chọn nhân viên</option>
                    {trainers.map((t) => <option key={t.id} value={t.id}>{t.name} · {t.specialty}</option>)}
                  </select>
                </label>
                <label><span>Thẻ khách hàng</span><input onChange={(e) => setCustCard(e.target.value)} placeholder="RFID-xxx" value={custCard} /></label>
                <label>
                  <span>Nhóm khách hàng</span>
                  <div className={styles.inputWithBtn}>
                    <select className={styles.selectInput} onChange={(e) => setCustGroup(e.target.value)} value={custGroup}>
                      <option value="">Chọn nhóm</option>
                      {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    <button className={styles.contractAddBtn} onClick={() => setGroupModalOpen(true)} type="button">+ Thêm nhóm</button>
                  </div>
                </label>
                <label>
                  <span>Nguồn khách hàng</span>
                  <div className={styles.inputWithBtn}>
                    <select className={styles.selectInput} onChange={(e) => setCustSource(e.target.value)} value={custSource}>
                      <option value="">Chọn nguồn</option>
                      {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <button className={styles.contractAddBtn} onClick={() => setSourceModalOpen(true)} type="button">+ Thêm nguồn</button>
                  </div>
                </label>
              </div>

              <button
                className={styles.contractToggleAdvanced}
                onClick={() => setShowAdvanced(!showAdvanced)}
                type="button"
              >
                {showAdvanced ? "← Ẩn bớt" : "▼ Xem thêm"}
              </button>

              {showAdvanced ? (
                <div className={styles.contractGrid2} style={{ marginTop: 10 }}>
                  <label><span>CMND/CCCD</span><input onChange={(e) => setCustCccd(e.target.value)} placeholder="079098xxxxx" value={custCccd} /></label>
                  <label><span>Giới tính</span>
                    <select className={styles.selectInput} onChange={(e) => setCustGender(e.target.value as "Nam" | "Nữ")} value={custGender}>
                      <option>Nam</option><option>Nữ</option>
                    </select>
                  </label>
                  <label><span>Người liên hệ</span><input onChange={(e) => setCustContactName(e.target.value)} placeholder="Tên người liên hệ khẩn cấp" value={custContactName} /></label>
                  <label><span>SĐT liên hệ</span><input onChange={(e) => setCustContactPhone(e.target.value)} placeholder="0901234567" value={custContactPhone} /></label>

                  <label className={styles.fullField}>
                    <span>Người đi cùng (NDC)</span>
                    <div className={styles.contractCompanionList}>
                      {companions.map((c) => (
                        <span key={c.id} className={styles.contractCompanionTag}>
                          {c.name} ({c.relation})
                          <button onClick={() => setCompanions(companions.filter((x) => x.id !== c.id))} type="button"><X size={12} /></button>
                        </span>
                      ))}
                      <button className={styles.contractAddBtn} onClick={() => setCompanionModalOpen(true)} type="button">+ Thêm người đi cùng</button>
                    </div>
                  </label>

                  <label><span>Tỉnh/Thành phố</span>
                    <select className={styles.selectInput} onChange={(e) => { setCustProvince(e.target.value); setCustWard(""); }} value={custProvince}>
                      <option value="">Chọn Tỉnh/Thành</option>
                      {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </label>
                  <label><span>Phường/Xã</span>
                    <select className={styles.selectInput} disabled={!custProvince} onChange={(e) => setCustWard(e.target.value)} value={custWard}>
                      <option value="">Chọn Phường/Xã</option>
                      {(WARDS_BY_PROVINCE[custProvince] ?? []).map((w) => <option key={w}>{w}</option>)}
                    </select>
                  </label>
                  <label className={styles.fullField}><span>Thôn/Xóm/Số nhà</span><input onChange={(e) => setCustStreet(e.target.value)} placeholder="VD: 12 Lê Lợi" value={custStreet} /></label>
                  <label className={styles.fullField}><span>Ghi chú bổ sung</span><textarea onChange={(e) => setCustNote(e.target.value)} placeholder="Sở thích, lưu ý..." rows={2} value={custNote} /></label>

                  <div className={`${styles.contractCustomFields} ${styles.fullField}`}>
                    <header>
                      <strong>Trường tùy chỉnh ({customFields.length})</strong>
                      <button className={styles.contractAddBtn} onClick={() => setCustomFieldModalOpen(true)} type="button">+ Thêm trường</button>
                    </header>
                    {customFields.length === 0 ? (
                      <p className={styles.contractMutedNote}>Chưa có trường tùy chỉnh nào.</p>
                    ) : (
                      <ul className={styles.contractCustomFieldList}>
                        {customFields.map((f, i) => (
                          <li key={i}>
                            <strong>{f.label}</strong>: <span>{f.value}</span>
                            <button onClick={() => setCustomFields(customFields.filter((_, idx) => idx !== i))} type="button"><Trash2 size={12} /></button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}

          {/* ============ Section 2: Dịch vụ ============ */}
          {activeSection === 2 ? (
            <section className={`${styles.contractFormSection} ${styles.contractSectionGreen}`}>
              <h3 className={styles.contractSectionHeader}><Layers size={16} /> 2. Thông tin dịch vụ</h3>
              <div className={styles.contractGrid2}>
                <label><span>Chi nhánh <b>*</b></span>
                  <select className={styles.selectInput} onChange={(e) => setBranch(e.target.value)} value={branch}>
                    {BRANCHES.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </label>
                <label><span>Ngày hợp đồng <b>*</b></span><input onChange={(e) => setContractDate(e.target.value)} placeholder="dd/mm/yyyy" value={contractDate} /></label>
                <label className={styles.fullField}>
                  <span>Loại hợp đồng</span>
                  <div className={styles.inputWithBtn}>
                    <select className={styles.selectInput} onChange={(e) => setContractTypeId(e.target.value)} value={contractTypeId}>
                      {contractTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <button className={styles.contractAddBtn} onClick={() => setContractTypeModalOpen(true)} type="button">+ Thêm loại HĐ</button>
                  </div>
                </label>
                <label>
                  <span>Loại dịch vụ <b>*</b></span>
                  <div className={styles.inputWithBtn}>
                    <select className={styles.selectInput} onChange={(e) => setServiceTypeName(e.target.value)} value={serviceTypeName}>
                      {serviceTypes.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <button className={styles.contractAddBtn} onClick={() => setServiceTypeModalOpen(true)} type="button">+ Thêm</button>
                  </div>
                </label>
                <label>
                  <span>Tên dịch vụ <b>*</b></span>
                  <select className={styles.selectInput} onChange={(e) => onPickPackage(e.target.value)} value={packageCode}>
                    {packages.map((p) => <option key={p.code} value={p.code}>{p.name} · {formatCurrency(p.price)}</option>)}
                  </select>
                </label>
                <label><span>Ngày bắt đầu <b>*</b></span><input onChange={(e) => onPickStartDate(e.target.value)} placeholder="dd/mm/yyyy" value={startDate} /></label>
                <label><span>Ngày kết thúc</span><input onChange={(e) => setEndDate(e.target.value)} placeholder="dd/mm/yyyy" value={endDate} /></label>
                <label><span>Số tháng</span><input readOnly value={`${months} tháng`} /></label>
                <label><span>Số buổi</span><input readOnly value={`${sessions} buổi`} /></label>
                <label><span>Số ngày</span><input readOnly value={`${diffDaysInclusive(startDate, endDate)} ngày`} /></label>
                <label className={styles.fullField}>
                  <span>Nhân viên PT (HLV)</span>
                  <div className={styles.inputWithBtn}>
                    <select className={styles.selectInput} onChange={(e) => setTrainerId(e.target.value)} value={trainerId}>
                      <option value="">Chưa có nhân viên PT</option>
                      {trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <button className={styles.contractAddBtn} onClick={() => setTrainerModalOpen(true)} type="button">+ Thêm HLV</button>
                  </div>
                </label>
              </div>

              {/* Multi-Sale với % tỷ lệ */}
              <div className={styles.contractSubsection}>
                <header className={styles.contractSubsectionHeader}>
                  <strong>Nhân viên Sale</strong>
                  <button className={styles.contractAddBtn} onClick={() => setSalesAlloc([...salesAlloc, { staff: SALES_STAFF[0], percent: 0 }])} type="button">+ Thêm NV</button>
                </header>
                <p className={styles.contractMutedNote}>Có thể thêm nhiều nhân viên Sale</p>
                {salesAlloc.map((s, index) => (
                  <div className={styles.contractSaleRow} key={index}>
                    <span className={styles.contractSaleIndex}>{index + 1}</span>
                    <div>
                      <span className={styles.contractFieldLabel}>Nhân viên #{index + 1}</span>
                      <select className={styles.selectInput} onChange={(e) => updateSalesAlloc(index, { staff: e.target.value })} value={s.staff}>
                        {SALES_STAFF.map((x) => <option key={x}>{x}</option>)}
                      </select>
                    </div>
                    <div>
                      <span className={styles.contractFieldLabel}>Tỷ lệ doanh số (%)</span>
                      <input
                        max={100}
                        min={0}
                        onChange={(e) => updateSalesAlloc(index, { percent: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })}
                        type="number"
                        value={s.percent}
                      />
                    </div>
                    <button
                      className={styles.contractRowRemove}
                      disabled={salesAlloc.length === 1}
                      onClick={() => setSalesAlloc(salesAlloc.filter((_, i) => i !== index))}
                      type="button"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <div className={`${styles.contractTotalsCard} ${totalSalesPercent === 100 ? styles.contractGreenCard : styles.contractWarnCard}`} style={{ marginTop: 8 }}>
                  <div><span>% Tổng tỷ lệ</span><strong>{totalSalesPercent}%</strong></div>
                  {totalSalesPercent !== 100 ? <div><span>Còn thiếu</span><strong>{100 - totalSalesPercent}%</strong></div> : null}
                </div>
              </div>

              <div className={styles.contractGrid2} style={{ marginTop: 14 }}>
                <label className={styles.fullField}>
                  <span>Mã hợp đồng</span>
                  <div className={styles.inputWithBtn}>
                    <input onChange={(e) => setContractCode(e.target.value)} value={contractCode} />
                    <button className={styles.contractAutoBtn} onClick={() => setContractCode(`HD${Date.now().toString().slice(-12)}`)} type="button">Tự động</button>
                  </div>
                </label>
              </div>

              <label className={`${styles.contractActiveToggleRow} ${styles.fullField}`} style={{ marginTop: 14 }}>
                <div>
                  <strong>Kích hoạt ngay</strong>
                  <small>Hợp đồng có hiệu lực ngay sau khi tạo</small>
                </div>
                <input checked={activeNow} onChange={(e) => setActiveNow(e.target.checked)} type="checkbox" />
              </label>

              {/* Hoa hồng nested */}
              <div className={styles.contractCommissionBlock}>
                <header><HandCoins size={14} /> <strong>Hoa hồng</strong></header>
                <div className={styles.contractGrid2}>
                  <label><span>Nhóm khách hàng</span>
                    <select className={styles.selectInput} disabled value={custGroup || ""}>
                      <option value="">Chưa chọn</option>
                      {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </label>
                  <label><span>Loại dịch vụ</span><input readOnly value={serviceTypeName} /></label>
                </div>
                <div className={styles.contractRadioRow} style={{ marginTop: 10 }}>
                  {(["preset", "custom", "none"] as const).map((m) => (
                    <label className={commissionMode === m ? styles.contractRadioActive : styles.contractRadio} key={m}>
                      <input checked={commissionMode === m} onChange={() => setCommissionMode(m)} type="radio" />
                      {m === "preset" ? "Theo thiết lập" : m === "custom" ? "Theo tùy chỉnh" : "Không áp dụng"}
                    </label>
                  ))}
                </div>
                {commissionMode === "custom" ? (
                  <div className={styles.contractGrid2} style={{ marginTop: 10 }}>
                    <label><span>Giá trị hoa hồng (%)</span><input min={0} max={100} onChange={(e) => setCommissionPercent(Number(e.target.value) || 0)} type="number" value={commissionPercent} /></label>
                  </div>
                ) : null}
                <div className={styles.contractCommissionPreview}>
                  <span>Hoa hồng dự kiến</span>
                  <strong>{formatCurrency(commissionMode === "none" ? 0 : Math.round((basePrice * commissionPercent) / 100))}</strong>
                </div>
                <p className={styles.contractMutedNote}>Hoa hồng sẽ được áp dụng khi tạo hợp đồng dựa trên cấu hình hoặc tùy chỉnh.</p>
              </div>
            </section>
          ) : null}

          {/* ============ Section 3: Ký HĐ ============ */}
          {activeSection === 3 ? (
            <section className={`${styles.contractFormSection} ${styles.contractSectionPurple}`}>
              <h3 className={styles.contractSectionHeader}><FileSignature size={16} /> 3. Thông tin ký hợp đồng</h3>
              <div className={styles.contractGrid2}>
                <label><span>Trạng thái ký <b>*</b></span>
                  <select className={styles.selectInput} onChange={(e) => setSignStatus(e.target.value as "Chưa ký" | "Đã ký")} value={signStatus}>
                    <option>Chưa ký</option><option>Đã ký</option>
                  </select>
                </label>
                <label><span>Ngày ký</span><input disabled={signStatus !== "Đã ký"} onChange={(e) => setSignDate(e.target.value)} placeholder="dd/mm/yyyy" value={signDate} /></label>
                <label><span>Người ký</span>
                  <select className={styles.selectInput} onChange={(e) => setSigner(e.target.value)} value={signer}>
                    <option value="">Chọn nhân viên ký</option>
                    {SALES_STAFF.map((s) => <option key={s}>{s}</option>)}
                    {custName ? <option value={custName}>{custName} (Khách hàng)</option> : null}
                  </select>
                </label>
                <label className={styles.fullField}><span>Ghi chú M/S (Membership)</span>
                  <textarea onChange={(e) => setSignNote(e.target.value)} placeholder="Ghi chú liên quan ký HĐ..." rows={2} value={signNote} />
                </label>
              </div>
              {signStatus === "Đã ký" && signDate ? (
                <div className={styles.contractInfoBanner}><CheckCircle2 size={14} /> Hợp đồng đã được ký vào ngày {signDate}</div>
              ) : null}
            </section>
          ) : null}

          {/* ============ Section 4: Thanh toán ============ */}
          {activeSection === 4 ? (
            <section className={`${styles.contractFormSection} ${styles.contractSectionOrange}`}>
              <h3 className={styles.contractSectionHeader}><Wallet size={16} /> 4. Thanh toán</h3>

              {selectedVoucher ? (
                <div className={styles.contractVoucherApplied}>
                  <div>
                    <strong>{selectedVoucher.code}</strong>
                    <span>{selectedVoucher.name}</span>
                  </div>
                  <strong className={styles.contractVoucherValue}>−{selectedVoucher.type === "percent" ? `${selectedVoucher.value}%` : formatCurrency(selectedVoucher.value)}</strong>
                </div>
              ) : null}

              <div className={styles.contractGrid2}>
                <label><span>Giá gốc</span><input readOnly value={formatCurrency(basePrice)} /></label>
              </div>

              {/* Sub-section Khuyến mãi */}
              <div className={styles.contractPromoBlock}>
                <header><strong>Khuyến mãi & Giảm giá</strong></header>
                <div className={styles.contractRadioRow}>
                  <label className={styles.contractRadioActive}><input checked readOnly type="radio" /> Chương trình KM / Voucher</label>
                </div>
                <div className={styles.contractVoucherGrid}>
                  {vouchers.map((v) => {
                    const eligible = !v.minOrder || basePrice >= v.minOrder;
                    return (
                      <button
                        className={`${styles.contractVoucherCard} ${voucherCode === v.code ? styles.contractVoucherSelected : ""} ${!eligible ? styles.contractVoucherDisabled : ""}`}
                        disabled={!eligible}
                        key={v.code}
                        onClick={() => setVoucherCode(voucherCode === v.code ? "" : v.code)}
                        type="button"
                      >
                        <strong>{v.name}</strong>
                        <span>{v.code}</span>
                        <em>{v.type === "percent" ? `Giảm ${v.value}%` : `Giảm ${formatCurrency(v.value)}`}{v.minOrder ? ` · đơn ≥ ${formatCurrency(v.minOrder)}` : ""}</em>
                      </button>
                    );
                  })}
                </div>
                <button className={styles.contractAddBtn} onClick={() => setVoucherModalOpen(true)} style={{ marginTop: 8 }} type="button">+ Tạo voucher mới</button>

                <div className={styles.contractGrid2} style={{ marginTop: 12 }}>
                  <label><span>Giảm giá ({discountKind === "percent" ? "%" : "VNĐ"})</span>
                    <div className={styles.contractDiscountInput}>
                      <input min={0} onChange={(e) => setDiscountValue(Number(e.target.value) || 0)} type="number" value={discountValue} />
                      <select className={styles.selectInput} onChange={(e) => setDiscountKind(e.target.value as "amount" | "percent")} value={discountKind}>
                        <option value="amount">VNĐ</option><option value="percent">%</option>
                      </select>
                    </div>
                  </label>
                  <label><span>Số tiền giảm</span><input readOnly value={formatCurrency(totalDiscount)} /></label>
                  <label className={styles.fullField}><span>Sau giảm giá</span><input readOnly value={formatCurrency(afterDiscount)} /></label>
                </div>
              </div>

              {/* VAT multi-line */}
              <div className={styles.contractSubsection}>
                <header className={styles.contractSubsectionHeader}>
                  <strong>THUẾ</strong>
                  <button className={styles.contractAddBtn} onClick={() => setVatLines([...vatLines, { rate: 5, amount: 0 }])} type="button">+ Thêm mức VAT</button>
                </header>
                {vatLines.map((line, i) => (
                  <div className={styles.contractVatRow} key={i}>
                    <select className={styles.selectInput} onChange={(e) => setVatLines(vatLines.map((l, idx) => idx === i ? { ...l, rate: Number(e.target.value) } : l))} value={line.rate}>
                      {VAT_OPTIONS.map((v) => <option key={v} value={v}>{v}%</option>)}
                    </select>
                    <span>= {formatCurrency(Math.round((afterDiscount * line.rate) / 100))}</span>
                    <button
                      className={styles.contractRowRemove}
                      disabled={vatLines.length === 1}
                      onClick={() => setVatLines(vatLines.filter((_, idx) => idx !== i))}
                      type="button"
                    ><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>

              <div className={styles.contractTotalsCard}>
                <div><span>Tổng thanh toán</span><strong className={styles.contractTotalAmount}>{formatCurrency(totalAmount)}</strong></div>
                <div className={styles.contractMutedNote}>Giá gốc: {formatCurrency(basePrice)} · Giảm: {formatCurrency(totalDiscount)} · VAT: {formatCurrency(vatTotal)}</div>
              </div>

              {/* PTTT nhiều lần */}
              <div className={styles.contractSubsection}>
                <header className={styles.contractSubsectionHeader}>
                  <strong>Phương thức thanh toán <b>*</b></strong>
                  <button className={styles.contractAddBtn} onClick={() => setPayments([...payments, { method: "Tiền mặt", amount: 0, accountId: cashFunds[0]?.id }])} type="button">+ Thêm</button>
                </header>
                {payments.map((p, index) => (
                  <div className={styles.contractPaymentBlock} key={index}>
                    <header>
                      <span className={styles.contractSaleIndex}>{index + 1}</span>
                      <strong>Lần {index + 1}</strong>
                      <button
                        className={styles.contractRowRemove}
                        disabled={payments.length === 1}
                        onClick={() => setPayments(payments.filter((_, i) => i !== index))}
                        type="button"
                      ><Trash2 size={14} /></button>
                    </header>
                    <div className={styles.contractGrid2}>
                      <label><span>Phương thức</span>
                        <select className={styles.selectInput} onChange={(e) => updatePayment(index, { method: e.target.value as Payment["method"], accountId: undefined, txRef: undefined })} value={p.method}>
                          {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                        </select>
                      </label>
                      <label><span>Số tiền</span><input min={0} onChange={(e) => updatePayment(index, { amount: Number(e.target.value) || 0 })} placeholder="Nhập số tiền" type="number" value={p.amount} /></label>

                      {p.method === "Chuyển khoản" ? (
                        <>
                          <label><span>Tài khoản nhận</span>
                            <select className={styles.selectInput} onChange={(e) => updatePayment(index, { accountId: e.target.value })} value={p.accountId ?? bankAccounts[0]?.id}>
                              {bankAccounts.map((a) => <option key={a.id} value={a.id}>{a.bank} — {a.name} ({a.number})</option>)}
                            </select>
                          </label>
                          <label><span>Mã giao dịch xác nhận <b>*</b></span><input onChange={(e) => updatePayment(index, { txRef: e.target.value })} placeholder="Ref code từ ngân hàng" value={p.txRef ?? ""} /></label>
                          <p className={`${styles.contractMutedNote} ${styles.fullField} ${styles.dangerText}`}>Bắt buộc</p>
                        </>
                      ) : null}

                      {p.method === "Thẻ" ? (
                        <>
                          <label><span>Thiết bị POS</span>
                            <select className={styles.selectInput} onChange={(e) => updatePayment(index, { accountId: e.target.value })} value={p.accountId ?? posDevices[0]?.id}>
                              {posDevices.map((a) => <option key={a.id} value={a.id}>{a.name} — {a.bank}</option>)}
                            </select>
                          </label>
                          <label><span>Mã giao dịch xác nhận <b>*</b></span><input onChange={(e) => updatePayment(index, { txRef: e.target.value })} placeholder="Ref code từ POS" value={p.txRef ?? ""} /></label>
                          <p className={`${styles.contractMutedNote} ${styles.fullField} ${styles.dangerText}`}>Bắt buộc</p>
                        </>
                      ) : null}

                      {p.method === "Tiền mặt" ? (
                        <>
                          <label><span>Quỹ tiền mặt</span>
                            <select className={styles.selectInput} onChange={(e) => updatePayment(index, { accountId: e.target.value })} value={p.accountId ?? cashFunds[0]?.id}>
                              {cashFunds.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.branch})</option>)}
                            </select>
                          </label>
                          <p className={`${styles.contractMutedNote} ${styles.fullField}`}>Thu tiền mặt trực tiếp tại quầy</p>
                        </>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              <label className={styles.fullField} style={{ marginTop: 12 }}>
                <span>Ghi chú</span>
                <textarea onChange={(e) => setPaymentNote(e.target.value)} placeholder="Ghi chú thanh toán..." rows={2} value={paymentNote} />
              </label>
            </section>
          ) : null}

          {/* ============ Section 5: Phiếu thu ============ */}
          {activeSection === 5 ? (
            <section className={`${styles.contractFormSection} ${styles.contractSectionTeal}`}>
              <h3 className={styles.contractSectionHeader}><HandCoins size={16} /> 5. Phiếu thu</h3>
              <div className={styles.contractGrid2}>
                <label><span>Khách đưa</span><input min={0} onChange={(e) => setCustomerCash(Number(e.target.value) || 0)} type="number" value={customerCash} /></label>
                <label><span>Tiền thừa</span>
                  <div className={styles.contractChangeBox}>
                    {change >= 0 ? <em className={styles.contractPaid}>Đủ tiền</em> : <em className={styles.dangerText}>Thiếu</em>}
                    <strong>{formatCurrency(Math.max(0, change))}</strong>
                  </div>
                </label>
                <label>
                  <span>Số phiếu thu</span>
                  <div className={styles.inputWithBtn}>
                    <input onChange={(e) => setReceiptId(e.target.value)} value={receiptId} />
                    <button className={styles.contractAutoBtn} onClick={() => setReceiptId(`PT${Date.now().toString().slice(-12)}`)} type="button">Tự động</button>
                  </div>
                </label>
                <label><span>Ngày lập phiếu</span><input onChange={(e) => setReceiptDate(e.target.value)} placeholder="dd/mm/yyyy" value={receiptDate} /></label>
                <label><span>Nhân viên thu</span>
                  <select className={styles.selectInput} onChange={(e) => setReceiptCashier(e.target.value)} value={receiptCashier}>
                    {SALES_STAFF.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
                <label><span>Loại thu chi</span>
                  <select className={styles.selectInput} onChange={(e) => setReceiptCategory(e.target.value)} value={receiptCategory}>
                    {RECEIPT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </label>
                <label><span>Thời hạn thanh toán (Ngày)</span><input min={0} onChange={(e) => setPaymentDeadline(Number(e.target.value) || 0)} type="number" value={paymentDeadline} /></label>
                <label className={styles.fullField}><span>Ghi chú phiếu thu</span><textarea onChange={(e) => setReceiptNote(e.target.value)} rows={2} value={receiptNote} /></label>
              </div>

              <div className={styles.contractReceiptPreview}>
                <header>PHIẾU THU</header>
                <div><span>Số: {receiptId}</span><span>Ngày tạo {receiptDate}</span></div>
                <div><span>Khách hàng</span><strong>{custName || "—"}</strong></div>
                <div><span>Mã hợp đồng</span><strong>{contractCode}</strong></div>
                <div><span>Số tiền thu</span><strong>{formatCurrency(totalPaid)}</strong></div>
                <div><span>Còn nợ</span><strong>{formatCurrency(Math.max(0, debt))}</strong></div>
              </div>
            </section>
          ) : null}

          {/* ============ Section 6: Đính kèm ============ */}
          {activeSection === 6 ? (
            <section className={`${styles.contractFormSection} ${styles.contractSectionIndigo}`}>
              <h3 className={styles.contractSectionHeader}><ClipboardList size={16} /> 6. Tài liệu đính kèm</h3>
              <button
                className={styles.contractDropzone}
                onClick={() => {
                  const name = window.prompt("Tên file (PDF/JPG/PNG/DOCX):", "tai-lieu.pdf");
                  if (name) setAttachments([...attachments, name]);
                }}
                type="button"
              >
                <ClipboardList size={32} />
                <strong>Kéo thả file hoặc nhấn để chọn</strong>
                <span>PDF, Word, Excel, JPG, PNG... tối đa 50 MB / file</span>
              </button>
              {attachments.length > 0 ? (
                <ul className={styles.contractAttachmentList}>
                  {attachments.map((f, i) => (
                    <li key={i}>
                      <FileText size={14} /> {f}
                      <button onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} type="button"><Trash2 size={12} /></button>
                    </li>
                  ))}
                </ul>
              ) : null}

              <p className={styles.contractMutedNote} style={{ marginTop: 14 }}>Trường bổ sung tin / Quản lý trường</p>
            </section>
          ) : null}
        </div>

        <footer className={styles.contractFormFooter}>
          <span>Tổng thanh toán: <strong>{formatCurrency(totalAmount)}</strong> · Đã thu: <strong>{formatCurrency(totalPaid)}</strong> · Còn nợ: <strong>{formatCurrency(Math.max(0, debt))}</strong></span>
          <div>
            <button className={styles.outlineButton} onClick={onClose} type="button">Hủy</button>
            <button className={styles.greenButton} type="submit">{isEdit ? "Cập nhật" : "Lưu hợp đồng"}</button>
          </div>
        </footer>
      </form>

      {groupModalOpen ? (
        <AddSimpleModal title="Thêm nhóm khách hàng" onClose={() => setGroupModalOpen(false)} onSubmit={(name, desc) => { onCreateGroup(name, desc); setGroupModalOpen(false); }} />
      ) : null}
      {sourceModalOpen ? (
        <AddSimpleModal title="Thêm nguồn khách hàng" onClose={() => setSourceModalOpen(false)} onSubmit={(name, desc) => { onCreateSource(name, desc); setSourceModalOpen(false); }} />
      ) : null}
      {contractTypeModalOpen ? (
        <AddSimpleModal title="Thêm loại hợp đồng" onClose={() => setContractTypeModalOpen(false)} onSubmit={(name, desc) => { onCreateContractType(name, desc); setContractTypeModalOpen(false); }} />
      ) : null}
      {serviceTypeModalOpen ? (
        <AddSimpleModal hideDescription title="Thêm loại dịch vụ" onClose={() => setServiceTypeModalOpen(false)} onSubmit={(name) => { onCreateServiceType(name); setServiceTypeModalOpen(false); }} />
      ) : null}
      {trainerModalOpen ? (
        <AddSimpleModal title="Thêm HLV / NV PT" descriptionLabel="Chuyên môn" onClose={() => setTrainerModalOpen(false)} onSubmit={(name, desc) => { onCreateTrainer(name, desc); setTrainerModalOpen(false); }} />
      ) : null}
      {companionModalOpen ? (
        <AddCompanionModal onClose={() => setCompanionModalOpen(false)} onSubmit={(c) => { setCompanions([...companions, c]); setCompanionModalOpen(false); }} />
      ) : null}
      {voucherModalOpen ? (
        <AddVoucherModal onClose={() => setVoucherModalOpen(false)} onSubmit={(v) => { onCreateVoucher(v); setVoucherCode(v.code); setVoucherModalOpen(false); }} />
      ) : null}
      {customFieldModalOpen ? (
        <AddCustomFieldModal onClose={() => setCustomFieldModalOpen(false)} onSubmit={(label, value) => { setCustomFields([...customFields, { label, value }]); setCustomFieldModalOpen(false); }} />
      ) : null}
    </div>
  );
}

function AddSimpleModal({
  title,
  onClose,
  onSubmit,
  hideDescription,
  descriptionLabel,
}: {
  title: string;
  onClose: () => void;
  onSubmit: (name: string, desc: string) => void;
  hideDescription?: boolean;
  descriptionLabel?: string;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  return (
    <div className={styles.nestedOverlay}>
      <div className={styles.smallModal}>
        <header><h2>{title}</h2><button onClick={onClose} type="button"><X size={16} /></button></header>
        <div className={styles.smallModalBody}>
          <label><span>Tên <b>*</b></span><input autoFocus onChange={(e) => setName(e.target.value)} value={name} /></label>
          {!hideDescription ? (
            <label><span>{descriptionLabel ?? "Mô tả"}</span><input onChange={(e) => setDesc(e.target.value)} value={desc} /></label>
          ) : null}
        </div>
        <footer>
          <button className={styles.outlineButton} onClick={onClose} type="button">Hủy</button>
          <button className={styles.blueButton} disabled={!name.trim()} onClick={() => onSubmit(name.trim(), desc.trim())} type="button">Thêm</button>
        </footer>
      </div>
    </div>
  );
}

function AddCompanionModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (c: Companion) => void;
}) {
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("Vợ/Chồng");
  const [phone, setPhone] = useState("");
  return (
    <div className={styles.nestedOverlay}>
      <div className={styles.smallModal}>
        <header><h2>Thêm người đi cùng (NDC)</h2><button onClick={onClose} type="button"><X size={16} /></button></header>
        <div className={styles.smallModalBody}>
          <label><span>Họ tên <b>*</b></span><input autoFocus onChange={(e) => setName(e.target.value)} value={name} /></label>
          <label><span>Quan hệ</span>
            <select className={styles.selectInput} onChange={(e) => setRelation(e.target.value)} value={relation}>
              {["Vợ/Chồng", "Con", "Bạn bè", "Đồng nghiệp", "Khác"].map((r) => <option key={r}>{r}</option>)}
            </select>
          </label>
          <label><span>SĐT</span><input onChange={(e) => setPhone(e.target.value)} value={phone} /></label>
        </div>
        <footer>
          <button className={styles.outlineButton} onClick={onClose} type="button">Hủy</button>
          <button className={styles.blueButton} disabled={!name.trim()} onClick={() => onSubmit({ id: `NDC-${Date.now()}`, name: name.trim(), relation, phone })} type="button">Thêm</button>
        </footer>
      </div>
    </div>
  );
}

function AddVoucherModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (v: Voucher) => void;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<"percent" | "amount">("percent");
  const [value, setValue] = useState(10);
  const [minOrder, setMinOrder] = useState(0);
  const [expires, setExpires] = useState(addMonthsToDate(todayString(), 6));
  return (
    <div className={styles.nestedOverlay}>
      <div className={styles.smallModal}>
        <header><h2>Tạo voucher mới</h2><button onClick={onClose} type="button"><X size={16} /></button></header>
        <div className={styles.smallModalBody}>
          <label><span>Mã voucher <b>*</b></span><input onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="VD: SUMMER2026" value={code} /></label>
          <label><span>Tên voucher <b>*</b></span><input onChange={(e) => setName(e.target.value)} placeholder="VD: Khuyến mãi hè 2026" value={name} /></label>
          <label><span>Loại</span>
            <select className={styles.selectInput} onChange={(e) => setType(e.target.value as "percent" | "amount")} value={type}>
              <option value="percent">Giảm theo %</option>
              <option value="amount">Giảm tiền cố định</option>
            </select>
          </label>
          <label><span>Giá trị</span><input min={0} onChange={(e) => setValue(Number(e.target.value) || 0)} type="number" value={value} /></label>
          <label><span>Đơn tối thiểu (VNĐ, để 0 nếu không yêu cầu)</span><input min={0} onChange={(e) => setMinOrder(Number(e.target.value) || 0)} type="number" value={minOrder} /></label>
          <label><span>Hết hạn</span><input onChange={(e) => setExpires(e.target.value)} placeholder="dd/mm/yyyy" value={expires} /></label>
        </div>
        <footer>
          <button className={styles.outlineButton} onClick={onClose} type="button">Hủy</button>
          <button className={styles.blueButton} disabled={!code.trim() || !name.trim()} onClick={() => onSubmit({ code: code.trim(), name: name.trim(), type, value, minOrder: minOrder || undefined, expires })} type="button">Tạo</button>
        </footer>
      </div>
    </div>
  );
}

function AddCustomFieldModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (label: string, value: string) => void;
}) {
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  return (
    <div className={styles.nestedOverlay}>
      <div className={styles.smallModal}>
        <header><h2>Thêm trường tùy chỉnh</h2><button onClick={onClose} type="button"><X size={16} /></button></header>
        <div className={styles.smallModalBody}>
          <label><span>Tên trường <b>*</b></span><input autoFocus onChange={(e) => setLabel(e.target.value)} placeholder="VD: Mã giới thiệu" value={label} /></label>
          <label><span>Giá trị</span><input onChange={(e) => setValue(e.target.value)} value={value} /></label>
        </div>
        <footer>
          <button className={styles.outlineButton} onClick={onClose} type="button">Hủy</button>
          <button className={styles.blueButton} disabled={!label.trim()} onClick={() => onSubmit(label.trim(), value)} type="button">Thêm</button>
        </footer>
      </div>
    </div>
  );
}

// =====================================================================================
// SECTION G — Modal Chi tiết HĐ (8 section + Timeline)
// =====================================================================================

function ContractDetailModal({
  contract,
  onClose,
  onEdit,
  onPrint,
}: {
  contract: Contract;
  onClose: () => void;
  onEdit: () => void;
  onPrint: () => void;
}) {
  const [tab, setTab] = useState<"info" | "contract" | "payment" | "promo" | "staff" | "suspension" | "extra" | "timeline">("info");
  const customer = lookupCustomer(contract.customerCode);
  const pkg = lookupPackage(contract.packageCode);
  const debt = contract.totalAmount - contract.paid;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.detailModal}>
        <header className={styles.detailHeader}>
          <div className={styles.detailIdentity}>
            <span>{contract.id.slice(-2)}</span>
            <div>
              <h2>{contract.id} <ContractStatusBadge status={contract.status} /></h2>
              <p>{customer?.name ?? contract.customerCode} · {pkg?.name ?? contract.packageCode}</p>
            </div>
          </div>
          <div>
            <button className={styles.outlineButton} onClick={onPrint} type="button"><Printer size={14} /> In hợp đồng</button>
            <button className={styles.blueButton} onClick={onEdit} type="button"><Edit3 size={14} /> Chỉnh sửa</button>
            <button onClick={onClose} title="Đóng" type="button"><X size={18} /></button>
          </div>
        </header>

        <nav className={styles.detailTabs}>
          {[
            { key: "info", label: "1 · Hội viên" },
            { key: "contract", label: "2 · HĐ" },
            { key: "payment", label: "3 · Thanh toán" },
            { key: "promo", label: "4 · Khuyến mãi" },
            { key: "staff", label: "5 · Nhân viên" },
            { key: "suspension", label: "6 · Bảo lưu" },
            { key: "extra", label: "7 · Bổ sung" },
            { key: "timeline", label: "8 · Lịch sử" },
          ].map((t) => (
            <button
              className={tab === t.key ? styles.activeDetailTab : ""}
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              type="button"
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className={styles.detailBody}>
          {tab === "info" && customer ? (
            <article className={styles.detailCard}>
              <h3>Thông tin hội viên</h3>
              <div className={styles.detailThree}>
                <Info label="Họ tên" value={customer.name} />
                <Info label="Mã HV" value={customer.code} />
                <Info label="Mã sinh trắc học" value={customer.bioCode ?? "—"} />
                <Info label="SĐT" value={customer.phone} />
                <Info label="Email" value={customer.email} />
                <Info label="CCCD/CMND" value={`${customer.cccd}${customer.cccdVerified ? " · ✓" : ""}`} />
                <Info label="Ngày sinh" value={customer.birthDate} />
                <Info label="Giới tính" value={customer.gender} />
                <Info label="Thẻ KH" value={customer.card || "—"} />
                <Info label="Người liên hệ" value={customer.contactName ? `${customer.contactName} · ${customer.contactPhone}` : "—"} />
                <Info label="Địa chỉ" value={customer.address} />
              </div>
              {customer.companions && customer.companions.length > 0 ? (
                <>
                  <h4 className={styles.contractSubheading}>Người đi cùng (NDC)</h4>
                  <ul className={styles.contractAttachmentList}>
                    {customer.companions.map((c) => (
                      <li key={c.id}><strong>{c.name}</strong> · {c.relation}{c.phone ? ` · ${c.phone}` : ""}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              {customer.note ? <p className={styles.contractMutedNote} style={{ marginTop: 10 }}>Ghi chú: {customer.note}</p> : null}
            </article>
          ) : null}

          {tab === "contract" ? (
            <article className={styles.detailCard}>
              <h3>Thông tin hợp đồng</h3>
              <div className={styles.detailThree}>
                <Info label="Mã HĐ" value={contract.id} />
                <Info label="Ngày ký" value={contract.signedDate} />
                <Info label="Trạng thái ký" value={contract.signStatus ?? "—"} />
                <Info label="Chi nhánh" value={contract.branch} />
                <Info label="Người ký" value={contract.signer} />
                <Info label="Loại HĐ" value={contract.contractTypeId ?? "—"} />
                <Info label="Loại dịch vụ" value={contract.serviceTypeId ?? "—"} />
                <Info label="Gói dịch vụ" value={pkg?.name ?? contract.packageCode} />
                <Info label="Kích hoạt ngay" value={contract.activeNow ? "Có" : "Không"} />
                <Info label="Số buổi ban đầu" value={String(contract.totalSessions)} />
                <Info label="Số buổi còn lại" value={String(contract.remainingSessions)} />
                <Info label="Ngày BĐ" value={contract.startDate} />
                <Info label="Ngày KT" value={contract.endDate} />
              </div>
              {contract.signNote ? <p className={styles.contractMutedNote} style={{ marginTop: 10 }}>Ghi chú M/S: {contract.signNote}</p> : null}
            </article>
          ) : null}

          {tab === "payment" ? (
            <article className={styles.detailCard}>
              <h3>Thanh toán</h3>
              <div className={styles.detailThree}>
                <Info label="Giá gốc" value={formatCurrency(contract.basePrice)} />
                <Info label="Tổng giảm" value={formatCurrency(contract.discountAmount)} />
                <Info label="VAT" value={contract.vatLines && contract.vatLines.length > 1
                  ? contract.vatLines.map((l) => `${l.rate}%`).join(" + ")
                  : `${contract.vatPercent}%`} />
                <Info label="Tổng tiền" value={formatCurrency(contract.totalAmount)} />
                <Info label="Đã thu" value={formatCurrency(contract.paid)} />
                <Info danger={debt > 0} label="Còn nợ" value={formatCurrency(Math.max(0, debt))} />
                <Info label="Khách đưa" value={formatCurrency(contract.customerCash ?? 0)} />
                <Info label="Tiền thừa" value={formatCurrency(contract.changeAmount ?? 0)} />
                <Info label="Thời hạn TT" value={`${contract.paymentDeadlineDays ?? 0} ngày`} />
              </div>
              <h4 className={styles.contractSubheading}>Phương thức thanh toán</h4>
              <ul className={styles.contractPaymentBreakdown}>
                {contract.payments.map((p, i) => (
                  <li key={i}>
                    <span>{p.method}{p.accountId ? ` · ${p.accountId}` : ""}{p.txRef ? ` · Ref: ${p.txRef}` : ""}</span>
                    <strong>{formatCurrency(p.amount)}</strong>
                  </li>
                ))}
              </ul>
              {contract.receiptId ? (
                <>
                  <h4 className={styles.contractSubheading}>Phiếu thu</h4>
                  <div className={styles.detailThree}>
                    <Info label="Số phiếu" value={contract.receiptId} />
                    <Info label="Ngày lập" value={contract.receiptDate ?? "—"} />
                    <Info label="NV thu" value={contract.receiptCashier ?? "—"} />
                    <Info label="Loại thu" value={contract.receiptCategory ?? "—"} />
                  </div>
                  {contract.receiptNote ? <p className={styles.contractMutedNote} style={{ marginTop: 8 }}>Ghi chú phiếu thu: {contract.receiptNote}</p> : null}
                </>
              ) : null}
            </article>
          ) : null}

          {tab === "promo" ? (
            <article className={styles.detailCard}>
              <h3>Khuyến mãi áp dụng</h3>
              {contract.voucherCode ? (
                <div className={styles.contractVoucherApplied}>
                  <div>
                    <strong>{contract.voucherCode}</strong>
                    <span>Đã áp dụng giảm giá vào HĐ này</span>
                  </div>
                  <strong className={styles.contractVoucherValue}>− {formatCurrency(contract.discountAmount)}</strong>
                </div>
              ) : (
                <p className={styles.contractMutedNote}>Hợp đồng này chưa áp dụng khuyến mãi nào.</p>
              )}
              {contract.commissionMode ? (
                <>
                  <h4 className={styles.contractSubheading}>Hoa hồng</h4>
                  <div className={styles.detailThree}>
                    <Info label="Chế độ" value={contract.commissionMode === "preset" ? "Theo thiết lập" : contract.commissionMode === "custom" ? "Tùy chỉnh" : "Không áp dụng"} />
                    {contract.commissionPercent !== undefined ? <Info label="Tỷ lệ" value={`${contract.commissionPercent}%`} /> : null}
                    <Info label="Số tiền dự kiến" value={formatCurrency(contract.commissionAmount ?? 0)} />
                  </div>
                </>
              ) : null}
            </article>
          ) : null}

          {tab === "staff" ? (
            <article className={styles.detailCard}>
              <h3>Nhân viên phụ trách</h3>
              <div className={styles.detailTwo}>
                <Info label="NV Sale chính" value={contract.saleStaff} />
                <Info label="Người tạo" value={contract.creator} />
              </div>
              {contract.saleAllocations && contract.saleAllocations.length > 0 ? (
                <>
                  <h4 className={styles.contractSubheading}>Phân bổ tỷ lệ doanh số</h4>
                  <ul className={styles.contractPaymentBreakdown}>
                    {contract.saleAllocations.map((s, i) => (
                      <li key={i}><span>NV #{i + 1} · {s.staff}</span><strong>{s.percent}%</strong></li>
                    ))}
                  </ul>
                </>
              ) : null}
              {contract.trainerId ? (
                <>
                  <h4 className={styles.contractSubheading}>HLV / Nhân viên PT</h4>
                  <p className={styles.contractMutedNote}>Mã HLV: {contract.trainerId}</p>
                </>
              ) : null}
            </article>
          ) : null}

          {tab === "suspension" ? (
            <article className={styles.detailCard}>
              <h3>Lịch sử bảo lưu</h3>
              {contract.suspensionCount === 0 ? (
                <p className={styles.contractMutedNote}>Chưa có lần bảo lưu nào.</p>
              ) : (
                <p>Đã sử dụng {contract.suspensionCount}/2 lần bảo lưu (BR-M8-26).</p>
              )}
            </article>
          ) : null}

          {tab === "extra" ? (
            <article className={styles.detailCard}>
              <h3>Thông tin bổ sung</h3>
              <div className={styles.detailTwo}>
                <Info label="Ghi chú" value={contract.note || "—"} />
                <div>
                  <span>Tài liệu đính kèm</span>
                  {contract.attachments.length === 0 ? (
                    <p className={styles.contractMutedNote}>Chưa có file đính kèm.</p>
                  ) : (
                    <ul className={styles.contractAttachmentList}>
                      {contract.attachments.map((f) => (
                        <li key={f}><FileText size={14} /> {f} <button className={styles.contractLinkBtn} type="button">Tải về</button></li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              {contract.customFields && contract.customFields.length > 0 ? (
                <>
                  <h4 className={styles.contractSubheading}>Trường tùy chỉnh</h4>
                  <ul className={styles.contractAttachmentList}>
                    {contract.customFields.map((f, i) => (
                      <li key={i}><strong>{f.label}:</strong> {f.value || "—"}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </article>
          ) : null}

          {tab === "timeline" ? (
            <article className={styles.detailCard}>
              <h3>Lịch sử tác động</h3>
              <ol className={styles.contractTimeline}>
                {contract.history.map((entry, index) => (
                  <li key={index}>
                    <span className={styles.contractTimelineDot} />
                    <div>
                      <strong>{entry.action}</strong>
                      <span>{entry.date} · {entry.actor}{entry.detail ? ` · ${entry.detail}` : ""}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </article>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Info({ danger, label, value }: { danger?: boolean; label: string; value: string }) {
  return (
    <div className={styles.contractInfoCell}>
      <span>{label}</span>
      <strong className={danger ? styles.dangerText : undefined}>{value}</strong>
    </div>
  );
}

// =====================================================================================
// SECTION H — Lịch sử giao dịch & Dialog chung
// =====================================================================================

function ContractHistoryModal({ contract, onClose }: { contract: Contract; onClose: () => void }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.smallModal}>
        <header>
          <h2>Lịch sử giao dịch — {contract.id}</h2>
          <button onClick={onClose} type="button"><X size={16} /></button>
        </header>
        <div className={styles.smallModalBody}>
          <ol className={styles.contractTimeline}>
            {contract.history.map((entry, index) => (
              <li key={index}>
                <span className={styles.contractTimelineDot} />
                <div>
                  <strong>{entry.action}</strong>
                  <span>{entry.date} · {entry.actor}{entry.detail ? ` · ${entry.detail}` : ""}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <footer><button className={styles.blueButton} onClick={onClose} type="button">Đóng</button></footer>
      </div>
    </div>
  );
}

function PrintTemplateDialog({ onClose, onConfirm, title }: { onClose: () => void; onConfirm: (template: string) => void; title: string }) {
  const [template, setTemplate] = useState("Mẫu HĐ chuẩn A4");
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.smallModal}>
        <header>
          <h2>{title}</h2>
          <button onClick={onClose} type="button"><X size={16} /></button>
        </header>
        <div className={styles.smallModalBody}>
          <p>Chọn mẫu in từ Module 12 Cài đặt:</p>
          <select className={styles.selectInput} onChange={(e) => setTemplate(e.target.value)} value={template}>
            <option>Mẫu HĐ chuẩn A4</option>
            <option>Mẫu HĐ Premium A4</option>
            <option>Mẫu HĐ K80 thu gọn</option>
            <option>Mẫu HĐ tiếng Anh A4</option>
          </select>
        </div>
        <footer>
          <button className={styles.outlineButton} onClick={onClose} type="button">Hủy</button>
          <button className={styles.blueButton} onClick={() => onConfirm(template)} type="button"><Printer size={14} /> In</button>
        </footer>
      </div>
    </div>
  );
}

function DeleteContractDialog({
  contract,
  onCancel,
  onConfirm,
}: {
  contract: Contract;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const hasTransactions = contract.history.length > 1;
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.smallModal}>
        <header>
          <h2><AlertCircle size={16} /> Xác nhận xóa hợp đồng</h2>
          <button onClick={onCancel} type="button"><X size={16} /></button>
        </header>
        <div className={styles.smallModalBody}>
          <p>Bạn có chắc chắn muốn xóa hợp đồng <strong>{contract.id}</strong>? Hành động có thể khôi phục trong Thùng rác 30 ngày (BR-M8-07).</p>
          {hasTransactions ? (
            <div className={styles.contractWarningBox}>
              <AlertCircle size={14} /> HĐ đã có {contract.history.length - 1} bản ghi — chỉ Admin/Manager mới được xóa, dữ liệu liên quan sẽ ẩn cho đến khi khôi phục.
            </div>
          ) : null}
        </div>
        <footer>
          <button className={styles.outlineButton} onClick={onCancel} type="button">Hủy bỏ</button>
          <button className={styles.dangerOutline} onClick={onConfirm} type="button"><Trash2 size={14} /> Xóa hợp đồng</button>
        </footer>
      </div>
    </div>
  );
}

function ConfirmDialog({
  cancelLabel = "Hủy",
  confirmLabel,
  description,
  onCancel,
  onConfirm,
  reasonRequired,
  title,
  tone = "blue",
}: {
  cancelLabel?: string;
  confirmLabel: string;
  description: string;
  onCancel: () => void;
  onConfirm: (reason?: string) => void;
  reasonRequired?: boolean;
  title: string;
  tone?: "blue" | "red" | "green" | "purple" | "amber";
}) {
  const [reason, setReason] = useState("");
  const reasonError = reasonRequired && !reason.trim();

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.smallModal}>
        <header>
          <h2>{title}</h2>
          <button onClick={onCancel} type="button"><X size={16} /></button>
        </header>
        <div className={styles.smallModalBody}>
          <p>{description}</p>
          {reasonRequired ? (
            <label className={styles.fullField}>
              <span>Lý do <b>*</b></span>
              <textarea onChange={(e) => setReason(e.target.value)} placeholder="Nhập lý do..." rows={3} value={reason} />
            </label>
          ) : null}
        </div>
        <footer>
          <button className={styles.outlineButton} onClick={onCancel} type="button">{cancelLabel}</button>
          <button
            className={`${styles[`${tone}Button`] ?? styles.blueButton}`}
            disabled={reasonError}
            onClick={() => onConfirm(reasonRequired ? reason : undefined)}
            type="button"
          >
            {confirmLabel}
          </button>
        </footer>
      </div>
    </div>
  );
}

function PaymentDialog({
  amount,
  onCancel,
  onConfirm,
  title,
}: {
  amount: number;
  onCancel: () => void;
  onConfirm: (method: string, paid: number) => void;
  title: string;
}) {
  const [method, setMethod] = useState<string>(PAYMENT_METHODS[0]);
  const [paid, setPaid] = useState<number>(amount);
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.smallModal}>
        <header>
          <h2>{title}</h2>
          <button onClick={onCancel} type="button"><X size={16} /></button>
        </header>
        <div className={styles.smallModalBody}>
          <p>Số tiền cần thu: <strong>{formatCurrency(amount)}</strong></p>
          <label><span>Phương thức thanh toán</span>
            <select className={styles.selectInput} onChange={(e) => setMethod(e.target.value)} value={method}>
              {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>
          <label><span>Số tiền thực thu</span>
            <input onChange={(e) => setPaid(Number(e.target.value) || 0)} type="number" value={paid} />
          </label>
        </div>
        <footer>
          <button className={styles.outlineButton} onClick={onCancel} type="button">Hủy</button>
          <button className={styles.greenButton} onClick={() => onConfirm(method, paid)} type="button"><Wallet size={14} /> Xác nhận thu</button>
        </footer>
      </div>
    </div>
  );
}

// =====================================================================================
// PLACEHOLDERS — sẽ thay thế bằng tab thật trong các phần kế tiếp
// =====================================================================================

type RenewalTabProps = {
  renewals: Renewal[];
  contracts: Contract[];
  onChangeRenewals: (next: Renewal[]) => void;
  onChangeContracts: (next: Contract[]) => void;
  flash: (msg: string) => void;
};

function RenewalTab({ renewals, contracts, onChangeRenewals, onChangeContracts, flash }: RenewalTabProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [detailRenewal, setDetailRenewal] = useState<Renewal | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Renewal | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<Renewal | null>(null);
  const [printTarget, setPrintTarget] = useState<Renewal | null>(null);
  const [query, setQuery] = useState("");

  const filtered = renewals.filter((r) => {
    if (!query) return true;
    const c = contracts.find((c) => c.id === r.contractId);
    const customer = c ? lookupCustomer(c.customerCode) : undefined;
    return `${r.id} ${r.contractId} ${customer?.name ?? ""} ${customer?.phone ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase());
  });

  const totals = {
    total: renewals.length,
    completed: renewals.filter((r) => r.status === "Đã hoàn tất").length,
    pending: renewals.filter((r) => r.status === "Chờ thanh toán").length,
    revenue: renewals.reduce((s, r) => s + r.paid, 0),
  };

  const handleSubmit = (renewal: Renewal, contract: Contract) => {
    onChangeRenewals([renewal, ...renewals]);
    onChangeContracts(
      contracts.map((c) =>
        c.id === contract.id
          ? {
              ...c,
              endDate: renewal.newEndDate,
              totalSessions: c.totalSessions + renewal.addedSessions,
              remainingSessions: c.remainingSessions + renewal.addedSessions,
              renewalCount: c.renewalCount + 1,
              history: [
                ...c.history,
                {
                  date: nowString(),
                  actor: renewal.saleStaff,
                  action: `Gia hạn (${renewal.id})`,
                  detail: `${renewal.unit === "Buổi" ? `+${renewal.addedSessions} buổi` : `+${renewal.quantity} ${renewal.unit.toLowerCase()}`} · ${formatCurrency(renewal.total)}`,
                },
              ],
            }
          : c
      )
    );
    flash(`Đã tạo ${renewal.id} · cộng ${renewal.addedSessions} buổi vào ${contract.id}`);
    setFormOpen(false);
  };

  const handleCancel = (target: Renewal) => {
    onChangeRenewals(
      renewals.map((r) => (r.id === target.id ? { ...r, status: "Đã hủy" } : r))
    );
    onChangeContracts(
      contracts.map((c) =>
        c.id === target.contractId
          ? {
              ...c,
              totalSessions: Math.max(0, c.totalSessions - target.addedSessions),
              remainingSessions: Math.max(0, c.remainingSessions - target.addedSessions),
              renewalCount: Math.max(0, c.renewalCount - 1),
              history: [
                ...c.history,
                {
                  date: nowString(),
                  actor: "Admin",
                  action: `Hủy gia hạn ${target.id}`,
                  detail: "Rollback theo BR-M8-36",
                },
              ],
            }
          : c
      )
    );
    flash(`Đã hủy gia hạn ${target.id} (rollback HĐ ${target.contractId})`);
    setCancelTarget(null);
  };

  const handlePayment = (target: Renewal, method: string, paid: number) => {
    onChangeRenewals(
      renewals.map((r) =>
        r.id === target.id
          ? { ...r, paid: r.paid + paid, status: r.paid + paid >= r.total ? "Đã hoàn tất" : "Chờ thanh toán" }
          : r
      )
    );
    flash(`Đã thu ${formatCurrency(paid)} qua ${method} cho ${target.id}`);
    setPaymentTarget(null);
  };

  return (
    <>
      <div className={styles.contractToolbar}>
        <div className={styles.pricingSearch}>
          <Search size={18} />
          <input
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo Mã GH, Mã HĐ gốc, KH..."
            value={query}
          />
        </div>
        <button className={styles.greenButton} onClick={() => setFormOpen(true)} type="button">
          <PlusCircle size={16} /> Thêm gia hạn
        </button>
      </div>

      <div className={styles.contractKpi} style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <KpiCard label="Tổng gia hạn" value={String(totals.total)} tone="blue" icon={RefreshCcw} />
        <KpiCard label="Đã hoàn tất" value={String(totals.completed)} tone="green" icon={CheckCircle2} />
        <KpiCard label="Chờ thanh toán" value={String(totals.pending)} tone="amber" icon={Clock} />
        <KpiCard label="Doanh thu thu được" value={formatCurrency(totals.revenue)} tone="blue" icon={Wallet} />
      </div>

      <section className={styles.memberTableCard}>
        <div className={styles.memberTableWrap}>
          <table className={styles.memberTable}>
            <thead>
              <tr>
                <th>Mã GH</th>
                <th>Mã HĐ gốc</th>
                <th>Khách hàng</th>
                <th>Đơn vị / SL</th>
                <th>Buổi cộng thêm</th>
                <th>Tổng tiền / Đã thu</th>
                <th>Ngày KT mới</th>
                <th>Trạng thái</th>
                <th>NV Sale</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td className={styles.emptyTableCell} colSpan={10}>Chưa có gia hạn nào</td></tr>
              ) : null}
              {filtered.map((r) => {
                const contract = contracts.find((c) => c.id === r.contractId);
                const customer = contract ? lookupCustomer(contract.customerCode) : undefined;
                return (
                  <tr key={r.id}>
                    <td>
                      <button className={styles.memberCode} onClick={() => setDetailRenewal(r)} type="button">
                        {r.id}
                      </button>
                    </td>
                    <td>{r.contractId}</td>
                    <td className={styles.memberName}>
                      <strong>{customer?.name ?? "—"}</strong>
                      <small>{customer?.phone ?? ""}</small>
                    </td>
                    <td>{r.unit} · {r.quantity}</td>
                    <td className={styles.contractSessions}><strong>+{r.addedSessions}</strong></td>
                    <td>
                      <div className={styles.contractMoneyCell}>
                        <strong>{formatCurrency(r.total)}</strong>
                        <em className={r.paid < r.total ? styles.dangerText : styles.contractPaid}>
                          {r.paid < r.total ? `Còn nợ ${formatCurrency(r.total - r.paid)}` : "Đã thu đủ"}
                        </em>
                      </div>
                    </td>
                    <td>{r.newEndDate}</td>
                    <td><RenewalStatusBadge status={r.status} /></td>
                    <td>{r.saleStaff}</td>
                    <td>
                      <div className={styles.contractRowActions}>
                        <button onClick={() => setDetailRenewal(r)} title="Xem" type="button"><Eye size={14} /></button>
                        {r.paid < r.total && r.status !== "Đã hủy" ? (
                          <button onClick={() => setPaymentTarget(r)} title="Thanh toán" type="button"><Wallet size={14} /></button>
                        ) : null}
                        <button onClick={() => setPrintTarget(r)} title="In phiếu" type="button"><Printer size={14} /></button>
                        {r.status !== "Đã hủy" ? (
                          <button
                            className={styles.contractDelete}
                            onClick={() => setCancelTarget(r)}
                            title="Hủy gia hạn"
                            type="button"
                          >
                            <RotateCcw size={14} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {formOpen ? (
        <RenewalFormModal
          contracts={contracts}
          existingRenewals={renewals}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
        />
      ) : null}

      {detailRenewal ? (
        <RenewalDetailModal
          renewal={detailRenewal}
          contracts={contracts}
          onClose={() => setDetailRenewal(null)}
          onPrint={() => { setPrintTarget(detailRenewal); setDetailRenewal(null); }}
        />
      ) : null}

      {cancelTarget ? (
        <ConfirmDialog
          title="Hủy gia hạn (rollback)"
          description={`Hủy gia hạn ${cancelTarget.id}? Hệ thống sẽ trừ ${cancelTarget.addedSessions} buổi và quay lại end_date trước đó (BR-M8-36). Tiền đã thu KHÔNG hoàn tự động.`}
          confirmLabel="Xác nhận hủy"
          tone="red"
          reasonRequired
          onCancel={() => setCancelTarget(null)}
          onConfirm={() => handleCancel(cancelTarget)}
        />
      ) : null}

      {paymentTarget ? (
        <PaymentDialog
          amount={paymentTarget.total - paymentTarget.paid}
          title={`Thu phí gia hạn ${paymentTarget.id}`}
          onCancel={() => setPaymentTarget(null)}
          onConfirm={(method, paid) => handlePayment(paymentTarget, method, paid)}
        />
      ) : null}

      {printTarget ? (
        <PrintTemplateDialog
          title={`In phiếu gia hạn ${printTarget.id}`}
          onClose={() => setPrintTarget(null)}
          onConfirm={(template) => {
            flash(`Đang in ${printTarget.id} bằng mẫu "${template}"`);
            setPrintTarget(null);
          }}
        />
      ) : null}
    </>
  );
}

function RenewalStatusBadge({ status }: { status: Renewal["status"] }) {
  const className =
    status === "Đã hoàn tất"
      ? styles.contractApprovalCompleted
      : status === "Chờ thanh toán"
        ? styles.contractApprovalPending
        : styles.contractApprovalCancelled;
  return <span className={className}>{status}</span>;
}

function RenewalFormModal({
  contracts,
  existingRenewals,
  initialContractId,
  onClose,
  onSubmit,
}: {
  contracts: Contract[];
  existingRenewals: Renewal[];
  initialContractId?: string;
  onClose: () => void;
  onSubmit: (renewal: Renewal, contract: Contract) => void;
}) {
  const eligible = contracts.filter((c) => c.status === "active");
  const [contractId, setContractId] = useState<string>(
    eligible.some((c) => c.id === initialContractId) ? initialContractId ?? "" : eligible[0]?.id ?? ""
  );
  const selected = contracts.find((c) => c.id === contractId);
  const pkg = selected ? lookupPackage(selected.packageCode) : undefined;

  const [unit, setUnit] = useState<RenewalUnit>("Tháng");
  const [quantity, setQuantity] = useState<number>(1);
  const [discount, setDiscount] = useState<number>(0);
  const [vatPercent, setVatPercent] = useState<number>(8);
  const [paidNow, setPaidNow] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS[0]);
  const [note, setNote] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Đơn giá snapshot từ HĐ gốc
  const unitPrice = useMemo(() => {
    if (!selected || !pkg) return 0;
    if (unit === "Tháng") return pkg.price / Math.max(1, Math.round(pkg.durationMonths));
    if (unit === "Tuần") return pkg.price / Math.max(1, Math.round(pkg.durationMonths * 4));
    return pkg.price / Math.max(1, pkg.sessions || 1);
  }, [selected, pkg, unit]);

  const total = calcTotalAmount(unitPrice * quantity, discount, vatPercent);
  const addedSessions = useMemo(() => {
    if (!pkg) return 0;
    if (unit === "Buổi") return quantity;
    const monthsAdded = unit === "Tuần" ? quantity / 4 : quantity;
    return Math.round((pkg.sessions / Math.max(1, Math.round(pkg.durationMonths))) * monthsAdded);
  }, [pkg, quantity, unit]);

  const newEndDate = useMemo(() => {
    if (!selected) return "—";
    if (unit === "Tháng") return addMonthsToDate(selected.endDate, quantity);
    if (unit === "Tuần") return addDaysToDate(selected.endDate, quantity * 7);
    return selected.endDate;
  }, [selected, unit, quantity]);

  const filteredContracts = eligible.filter((c) => {
    if (!searchQuery) return true;
    const customer = lookupCustomer(c.customerCode);
    return `${c.id} ${customer?.name ?? ""} ${customer?.phone ?? ""}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!selected) {
      setError("Vui lòng chọn 1 hợp đồng đang hoạt động");
      return;
    }
    if (quantity <= 0) {
      setError("Số lượng phải > 0");
      return;
    }
    if (paidNow > total) {
      setError("Số tiền thu vượt tổng gia hạn");
      return;
    }
    const renewal: Renewal = {
      id: nextSeqId(existingRenewals, "GH"),
      contractId: selected.id,
      customerCode: selected.customerCode,
      unit,
      quantity,
      unitPrice: Math.round(unitPrice),
      discount,
      vatPercent,
      total,
      paid: paidNow,
      newEndDate,
      addedSessions,
      saleStaff: selected.saleStaff,
      createdAt: nowString(),
      status: paidNow >= total ? "Đã hoàn tất" : "Chờ thanh toán",
      note,
    };
    if (paidNow > 0) {
      renewal.note = `${note}${note ? " · " : ""}PTTT: ${paymentMethod}`;
    }
    onSubmit(renewal, selected);
  };

  return (
    <div className={styles.modalOverlay}>
      <form className={styles.contractFormModal} onSubmit={submit}>
        <header className={styles.contractFormHeader}>
          <div>
            <h2>Tạo gia hạn hợp đồng</h2>
            <p>Đơn giá snapshot từ HĐ gốc (BR-M8-23) · Tổng = (Đơn giá − Giảm) × (1 + VAT%)</p>
          </div>
          <button onClick={onClose} type="button"><X size={18} /></button>
        </header>

        <div className={styles.contractFormBody}>
          {error ? <div className={styles.formError}><AlertCircle size={14} /> {error}</div> : null}

          <div className={styles.contractRenewalLayout}>
            <section>
              <h3 style={{ marginTop: 0 }}><Search size={16} /> 1. Chọn hợp đồng gốc</h3>
              <div className={styles.pricingSearch} style={{ marginBottom: 10 }}>
                <Search size={16} />
                <input
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo Mã HĐ, tên KH, SĐT..."
                  value={searchQuery}
                />
              </div>
              <div className={styles.contractContractList}>
                {filteredContracts.map((c) => {
                  const customer = lookupCustomer(c.customerCode);
                  const p = lookupPackage(c.packageCode);
                  return (
                    <div
                      className={`${styles.contractContractRow} ${contractId === c.id ? styles.contractContractRowSelected : ""}`}
                      key={c.id}
                      onClick={() => setContractId(c.id)}
                    >
                      <input checked={contractId === c.id} readOnly type="radio" />
                      <strong>{c.id}</strong>
                      <span><strong>{customer?.name}</strong> · {customer?.phone}</span>
                      <span>{p?.name}</span>
                      <span>{c.remainingSessions}/{c.totalSessions}</span>
                      <span>KT: {c.endDate}</span>
                    </div>
                  );
                })}
                {filteredContracts.length === 0 ? <p className={styles.contractMutedNote} style={{ padding: 12 }}>Không có HĐ phù hợp</p> : null}
              </div>

              <h3 style={{ marginTop: 18 }}><Calendar size={16} /> 2. Gói gia hạn</h3>
              <div className={styles.contractGrid2}>
                <label>
                  <span>Đơn vị gia hạn (BR-M8-22)</span>
                  <select className={styles.selectInput} onChange={(e) => setUnit(e.target.value as RenewalUnit)} value={unit}>
                    <option value="Tháng">Tháng</option>
                    <option value="Tuần">Tuần</option>
                    <option value="Buổi">Buổi</option>
                  </select>
                </label>
                <label>
                  <span>Số lượng</span>
                  <input min={1} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))} type="number" value={quantity} />
                </label>
                <label><span>Đơn giá (snapshot)</span><input readOnly value={formatCurrency(Math.round(unitPrice))} /></label>
                <label><span>Buổi cộng thêm</span><input readOnly value={`+${addedSessions} buổi`} /></label>
              </div>

              <h3 style={{ marginTop: 18 }}><Wallet size={16} /> 3. Phí gia hạn</h3>
              <div className={styles.contractGrid2}>
                <label><span>Giảm giá (VNĐ)</span><input min={0} onChange={(e) => setDiscount(Number(e.target.value) || 0)} type="number" value={discount} /></label>
                <label>
                  <span>VAT %</span>
                  <select className={styles.selectInput} onChange={(e) => setVatPercent(Number(e.target.value))} value={vatPercent}>
                    {VAT_OPTIONS.map((v) => <option key={v} value={v}>{v}%</option>)}
                  </select>
                </label>
                <label><span>Tổng phí (BR-M8-33)</span><input readOnly value={formatCurrency(total)} /></label>
              </div>

              <h3 style={{ marginTop: 18 }}><HandCoins size={16} /> 4. Thu phí ngay</h3>
              <div className={styles.contractGrid2}>
                <label>
                  <span>Phương thức</span>
                  <select className={styles.selectInput} onChange={(e) => setPaymentMethod(e.target.value)} value={paymentMethod}>
                    {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </label>
                <label><span>Số tiền thu</span><input min={0} onChange={(e) => setPaidNow(Number(e.target.value) || 0)} type="number" value={paidNow} /></label>
              </div>
              <label className={styles.fullField} style={{ marginTop: 12 }}>
                <span>Ghi chú</span>
                <textarea onChange={(e) => setNote(e.target.value)} rows={2} value={note} />
              </label>
            </section>

            <aside className={styles.contractSidePanel}>
              <h4>Tóm tắt HĐ gốc</h4>
              {selected ? (
                <>
                  <div className={styles.contractSidePanelRow}><span>Mã HĐ</span><strong>{selected.id}</strong></div>
                  <div className={styles.contractSidePanelRow}><span>Khách hàng</span><strong>{lookupCustomer(selected.customerCode)?.name}</strong></div>
                  <div className={styles.contractSidePanelRow}><span>Gói</span><strong>{pkg?.name}</strong></div>
                  <div className={styles.contractSidePanelRow}><span>Còn lại</span><strong>{selected.remainingSessions}/{selected.totalSessions} buổi</strong></div>
                  <div className={styles.contractSidePanelRow}><span>Ngày KT cũ</span><strong>{selected.endDate}</strong></div>
                  <div className={styles.contractSidePanelRow}><span>Ngày KT mới</span><strong style={{ color: "#16a34a" }}>{newEndDate}</strong></div>
                  <div className={styles.contractSidePanelRow}><span>Lần gia hạn</span><strong>#{selected.renewalCount + 1}</strong></div>
                  <div className={styles.contractSidePanelTotal}><span>Tổng phải thu</span><strong>{formatCurrency(total)}</strong></div>
                </>
              ) : (
                <p className={styles.contractMutedNote}>Chọn 1 hợp đồng từ danh sách</p>
              )}
            </aside>
          </div>
        </div>

        <footer className={styles.contractFormFooter}>
          <span>Tổng phí gia hạn: <strong>{formatCurrency(total)}</strong></span>
          <div>
            <button className={styles.outlineButton} onClick={onClose} type="button">Hủy</button>
            <button className={styles.greenButton} type="submit"><RefreshCcw size={14} /> Lưu gia hạn</button>
          </div>
        </footer>
      </form>
    </div>
  );
}

function RenewalDetailModal({
  contracts,
  onClose,
  onPrint,
  renewal,
}: {
  contracts: Contract[];
  onClose: () => void;
  onPrint: () => void;
  renewal: Renewal;
}) {
  const contract = contracts.find((c) => c.id === renewal.contractId);
  const customer = contract ? lookupCustomer(contract.customerCode) : undefined;
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.detailModal}>
        <header className={styles.detailHeader}>
          <div className={styles.detailIdentity}>
            <span><RefreshCcw size={20} /></span>
            <div>
              <h2>{renewal.id} <RenewalStatusBadge status={renewal.status} /></h2>
              <p>HĐ gốc {renewal.contractId} · {customer?.name}</p>
            </div>
          </div>
          <div>
            <button className={styles.outlineButton} onClick={onPrint} type="button"><Printer size={14} /> In phiếu</button>
            <button onClick={onClose} type="button"><X size={18} /></button>
          </div>
        </header>
        <div className={styles.detailBody}>
          <article className={styles.detailCard}>
            <h3>Thông tin gia hạn</h3>
            <div className={styles.detailThree}>
              <Info label="Đơn vị" value={`${renewal.unit} × ${renewal.quantity}`} />
              <Info label="Đơn giá snapshot" value={formatCurrency(renewal.unitPrice)} />
              <Info label="Buổi cộng thêm" value={`+${renewal.addedSessions}`} />
              <Info label="Giảm giá" value={formatCurrency(renewal.discount)} />
              <Info label="VAT" value={`${renewal.vatPercent}%`} />
              <Info label="Tổng tiền" value={formatCurrency(renewal.total)} />
              <Info label="Đã thu" value={formatCurrency(renewal.paid)} />
              <Info danger={renewal.paid < renewal.total} label="Còn nợ" value={formatCurrency(Math.max(0, renewal.total - renewal.paid))} />
              <Info label="Ngày KT mới" value={renewal.newEndDate} />
              <Info label="NV Sale" value={renewal.saleStaff} />
              <Info label="Ngày tạo" value={renewal.createdAt} />
            </div>
            {renewal.note ? <p className={styles.contractMutedNote} style={{ marginTop: 12 }}>Ghi chú: {renewal.note}</p> : null}
          </article>
        </div>
      </div>
    </div>
  );
}

type UpgradeTabProps = {
  upgrades: Upgrade[];
  contracts: Contract[];
  onChangeUpgrades: (next: Upgrade[]) => void;
  onChangeContracts: (next: Contract[]) => void;
  flash: (msg: string) => void;
};

function UpgradeTab({ contracts, flash, onChangeContracts, onChangeUpgrades, upgrades }: UpgradeTabProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [detailUpgrade, setDetailUpgrade] = useState<Upgrade | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ kind: "approve" | "reject" | "activate" | "deactivate" | "complete"; upgrade: Upgrade } | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<Upgrade | null>(null);
  const [printTarget, setPrintTarget] = useState<Upgrade | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const totals = {
    total: upgrades.length,
    pending: upgrades.filter((u) => u.status === "pending_approval").length,
    activated: upgrades.filter((u) => u.status === "activated").length,
    completed: upgrades.filter((u) => u.status === "completed").length,
  };

  const handleSubmit = (upgrade: Upgrade) => {
    onChangeUpgrades([upgrade, ...upgrades]);
    flash(`Đã tạo yêu cầu nâng cấp ${upgrade.id} (chờ phê duyệt)`);
    setFormOpen(false);
  };

  const updateUpgrade = (id: string, partial: Partial<Upgrade>) => {
    onChangeUpgrades(upgrades.map((u) => (u.id === id ? { ...u, ...partial } : u)));
  };

  const handleApprove = (target: Upgrade) => {
    updateUpgrade(target.id, { status: "approved" });
    flash(`Đã phê duyệt ${target.id} — chuyển sang Kích hoạt`);
    setConfirmAction(null);
  };

  const handleReject = (target: Upgrade, reason?: string) => {
    updateUpgrade(target.id, { status: "rejected", rejectReason: reason });
    flash(`Đã từ chối ${target.id} — HĐ gốc giữ Active`);
    setConfirmAction(null);
  };

  const handleActivate = (target: Upgrade) => {
    updateUpgrade(target.id, { status: "activated" });
    onChangeContracts(
      contracts.map((c) =>
        c.id === target.contractId
          ? {
              ...c,
              packageCode: target.toPackage,
              totalSessions: target.newSessions,
              remainingSessions: target.newSessions,
              hasUpgraded: true,
              history: [
                ...c.history,
                { date: nowString(), actor: "Manager", action: `Kích hoạt nâng cấp ${target.id}`, detail: `${target.fromPackage} → ${target.toPackage}` },
              ],
            }
          : c
      )
    );
    flash(`Đã kích hoạt ${target.id} — chuyển ${target.fromPackage} → ${target.toPackage}`);
    setConfirmAction(null);
  };

  const handleDeactivate = (target: Upgrade, reason?: string) => {
    updateUpgrade(target.id, { status: "rejected", rejectReason: reason });
    onChangeContracts(
      contracts.map((c) =>
        c.id === target.contractId
          ? {
              ...c,
              packageCode: target.fromPackage,
              totalSessions: target.oldSessions,
              remainingSessions: target.oldSessions,
              hasUpgraded: false,
              history: [
                ...c.history,
                { date: nowString(), actor: "Admin", action: `Hủy kích hoạt nâng cấp ${target.id}`, detail: reason ?? "" },
              ],
            }
          : c
      )
    );
    flash(`Đã hủy kích hoạt ${target.id}`);
    setConfirmAction(null);
  };

  const handleComplete = (target: Upgrade) => {
    updateUpgrade(target.id, { status: "completed" });
    flash(`Hoàn tất nâng cấp ${target.id} — sinh hoa hồng (Module 11)`);
    setConfirmAction(null);
  };

  const handlePayment = (target: Upgrade, method: string, paid: number) => {
    const newPaid = target.paid + paid;
    updateUpgrade(target.id, { paid: newPaid, status: newPaid >= target.total ? "paid" : target.status });
    flash(`Đã thu ${formatCurrency(paid)} qua ${method} cho ${target.id}`);
    setPaymentTarget(null);
  };

  return (
    <>
      <div className={styles.contractToolbar}>
        <div className={styles.pricingSearch}>
          <Search size={18} />
          <input placeholder="Tìm Mã NC, HĐ gốc, KH..." />
        </div>
        <button className={styles.greenButton} onClick={() => setFormOpen(true)} type="button">
          <PlusCircle size={16} /> Thêm yêu cầu nâng cấp
        </button>
      </div>

      <div className={styles.contractKpi}>
        <KpiCard label="Tổng nâng cấp" value={String(totals.total)} tone="blue" icon={TrendingUp} />
        <KpiCard label="Chờ phê duyệt" value={String(totals.pending)} tone="amber" icon={Clock} />
        <KpiCard label="Đang hoạt động" value={String(totals.activated)} tone="green" icon={CheckCircle2} />
        <KpiCard label="Đã hoàn tất" value={String(totals.completed)} tone="green" icon={ShieldCheck} />
      </div>

      <section className={styles.memberTableCard}>
        <div className={styles.memberTableWrap}>
          <table className={styles.memberTable}>
            <thead>
              <tr>
                <th>Mã NC</th>
                <th>HĐ gốc</th>
                <th>Khách hàng</th>
                <th>Từ gói → Sang gói</th>
                <th>Số buổi cũ/mới</th>
                <th>GT còn lại</th>
                <th>Phí NC</th>
                <th>Tổng tiền / Đã TT</th>
                <th>Trạng thái</th>
                <th>NV Sale</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {upgrades.length === 0 ? (
                <tr><td className={styles.emptyTableCell} colSpan={11}>Chưa có yêu cầu nâng cấp</td></tr>
              ) : null}
              {upgrades.map((u) => {
                const c = contracts.find((c) => c.id === u.contractId);
                const customer = c ? lookupCustomer(c.customerCode) : undefined;
                const pkgFrom = lookupPackage(u.fromPackage);
                const pkgTo = lookupPackage(u.toPackage);
                return (
                  <tr key={u.id}>
                    <td>
                      <button className={styles.memberCode} onClick={() => setDetailUpgrade(u)} type="button">{u.id}</button>
                    </td>
                    <td>{u.contractId}</td>
                    <td className={styles.memberName}>
                      <strong>{customer?.name ?? "—"}</strong>
                      <small>{customer?.phone ?? ""}</small>
                    </td>
                    <td>
                      <span className={styles.contractMutedNote} style={{ fontStyle: "normal" }}>
                        {pkgFrom?.name ?? u.fromPackage}
                      </span>
                      <ArrowRight size={12} style={{ margin: "0 4px", color: "#16a34a", verticalAlign: "middle" }} />
                      <strong>{pkgTo?.name ?? u.toPackage}</strong>
                    </td>
                    <td>{u.oldSessions} → <strong>{u.newSessions}</strong></td>
                    <td>{formatCurrency(u.oldRemainingValue)}</td>
                    <td><strong>{formatCurrency(u.upgradeFee)}</strong></td>
                    <td>
                      <div className={styles.contractMoneyCell}>
                        <strong>{formatCurrency(u.total)}</strong>
                        <em className={u.paid < u.total ? styles.dangerText : styles.contractPaid}>
                          {u.paid < u.total ? `Nợ ${formatCurrency(u.total - u.paid)}` : "Đủ"}
                        </em>
                      </div>
                    </td>
                    <td><UpgradeStatusBadge status={u.status} /></td>
                    <td>{u.saleStaff}</td>
                    <td>
                      <div className={styles.contractRowActions}>
                        <button onClick={() => setDetailUpgrade(u)} title="Xem" type="button"><Eye size={14} /></button>
                        <div className={styles.contractMenuWrap}>
                          <button onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)} title="Thao tác" type="button">
                            <MoreVertical size={14} />
                          </button>
                          {openMenuId === u.id ? (
                            <UpgradeActionMenu
                              upgrade={u}
                              onClose={() => setOpenMenuId(null)}
                              onApprove={() => { setOpenMenuId(null); setConfirmAction({ kind: "approve", upgrade: u }); }}
                              onReject={() => { setOpenMenuId(null); setConfirmAction({ kind: "reject", upgrade: u }); }}
                              onActivate={() => { setOpenMenuId(null); setConfirmAction({ kind: "activate", upgrade: u }); }}
                              onDeactivate={() => { setOpenMenuId(null); setConfirmAction({ kind: "deactivate", upgrade: u }); }}
                              onPay={() => { setOpenMenuId(null); setPaymentTarget(u); }}
                              onComplete={() => { setOpenMenuId(null); setConfirmAction({ kind: "complete", upgrade: u }); }}
                              onPrint={() => { setOpenMenuId(null); setPrintTarget(u); }}
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
      </section>

      {formOpen ? (
        <UpgradeFormModal
          contracts={contracts}
          existing={upgrades}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
        />
      ) : null}

      {detailUpgrade ? (
        <UpgradeDetailModal
          contracts={contracts}
          onClose={() => setDetailUpgrade(null)}
          onPrint={() => { setPrintTarget(detailUpgrade); setDetailUpgrade(null); }}
          upgrade={detailUpgrade}
        />
      ) : null}

      {confirmAction ? (
        <ConfirmDialog
          title={
            confirmAction.kind === "approve"
              ? "Phê duyệt nâng cấp"
              : confirmAction.kind === "reject"
                ? "Từ chối nâng cấp"
                : confirmAction.kind === "activate"
                  ? "Kích hoạt nâng cấp"
                  : confirmAction.kind === "deactivate"
                    ? "Hủy kích hoạt nâng cấp"
                    : "Hoàn tất nâng cấp"
          }
          description={
            confirmAction.kind === "approve"
              ? `Phê duyệt yêu cầu ${confirmAction.upgrade.id}? Sau khi duyệt sẽ chuyển trạng thái sang "Đã phê duyệt" và mở dialog Kích hoạt.`
              : confirmAction.kind === "reject"
                ? `Từ chối yêu cầu ${confirmAction.upgrade.id}? HĐ gốc sẽ giữ trạng thái Active.`
                : confirmAction.kind === "activate"
                  ? `Kích hoạt nâng cấp ${confirmAction.upgrade.id}? Hệ thống sẽ chuyển sang gói mới (${confirmAction.upgrade.toPackage}), cộng số buổi và đóng HĐ gốc.`
                  : confirmAction.kind === "deactivate"
                    ? `Hủy kích hoạt ${confirmAction.upgrade.id}? Rollback về gói cũ. Chặn nếu HĐ mới đã có booking (BR-M8-43).`
                    : `Hoàn tất nâng cấp ${confirmAction.upgrade.id}? Sẽ sinh hoa hồng cho Sale + HLV.`
          }
          confirmLabel={
            confirmAction.kind === "approve"
              ? "Phê duyệt"
              : confirmAction.kind === "reject"
                ? "Từ chối"
                : confirmAction.kind === "activate"
                  ? "Kích hoạt"
                  : confirmAction.kind === "deactivate"
                    ? "Hủy kích hoạt"
                    : "Hoàn tất"
          }
          tone={
            confirmAction.kind === "approve" || confirmAction.kind === "complete"
              ? "green"
              : confirmAction.kind === "reject" || confirmAction.kind === "deactivate"
                ? "red"
                : "blue"
          }
          reasonRequired={confirmAction.kind === "reject" || confirmAction.kind === "deactivate"}
          onCancel={() => setConfirmAction(null)}
          onConfirm={(reason) => {
            if (confirmAction.kind === "approve") handleApprove(confirmAction.upgrade);
            if (confirmAction.kind === "reject") handleReject(confirmAction.upgrade, reason);
            if (confirmAction.kind === "activate") handleActivate(confirmAction.upgrade);
            if (confirmAction.kind === "deactivate") handleDeactivate(confirmAction.upgrade, reason);
            if (confirmAction.kind === "complete") handleComplete(confirmAction.upgrade);
          }}
        />
      ) : null}

      {paymentTarget ? (
        <PaymentDialog
          amount={paymentTarget.total - paymentTarget.paid}
          title={`Thu phí nâng cấp ${paymentTarget.id}`}
          onCancel={() => setPaymentTarget(null)}
          onConfirm={(method, paid) => handlePayment(paymentTarget, method, paid)}
        />
      ) : null}

      {printTarget ? (
        <PrintTemplateDialog
          title={`In phiếu nâng cấp ${printTarget.id}`}
          onClose={() => setPrintTarget(null)}
          onConfirm={(template) => {
            flash(`Đang in ${printTarget.id} bằng mẫu "${template}"`);
            setPrintTarget(null);
          }}
        />
      ) : null}
    </>
  );
}

function UpgradeStatusBadge({ status }: { status: UpgradeStatus }) {
  const map: Record<UpgradeStatus, { label: string; className: string }> = {
    draft: { label: "Nháp", className: styles.contractApprovalDraft },
    pending_approval: { label: "Chờ phê duyệt", className: styles.contractApprovalPending },
    approved: { label: "Đã phê duyệt", className: styles.contractApprovalApproved },
    rejected: { label: "Từ chối", className: styles.contractApprovalRejected },
    activated: { label: "Đã kích hoạt", className: styles.contractApprovalActivated },
    paid: { label: "Đã thanh toán", className: styles.contractApprovalPaid },
    completed: { label: "Hoàn tất", className: styles.contractApprovalCompleted },
  };
  const meta = map[status];
  return <span className={meta.className}>{meta.label}</span>;
}

function UpgradeActionMenu({
  upgrade,
  onClose,
  onApprove,
  onReject,
  onActivate,
  onDeactivate,
  onPay,
  onComplete,
  onPrint,
}: {
  upgrade: Upgrade;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onPay: () => void;
  onComplete: () => void;
  onPrint: () => void;
}) {
  const { menuRef, style } = useContractMenuPosition();
  const items: Array<{ icon: typeof FileText; label: string; onClick: () => void; disabled?: boolean }> = [
    { icon: ThumbsUp, label: "Phê duyệt", onClick: onApprove, disabled: upgrade.status !== "pending_approval" },
    { icon: ThumbsDown, label: "Từ chối", onClick: onReject, disabled: upgrade.status !== "pending_approval" },
    { icon: Power, label: "Kích hoạt", onClick: onActivate, disabled: upgrade.status !== "approved" },
    { icon: RotateCcw, label: "Hủy kích hoạt", onClick: onDeactivate, disabled: upgrade.status !== "activated" },
    { icon: HandCoins, label: "Thanh toán", onClick: onPay, disabled: upgrade.paid >= upgrade.total },
    { icon: CheckCircle2, label: "Hoàn tất", onClick: onComplete, disabled: upgrade.status !== "paid" && upgrade.status !== "activated" },
    { icon: Printer, label: "In phiếu", onClick: onPrint },
  ];
  return (
    <>
      <button className={styles.contractMenuBackdrop} onClick={onClose} type="button" aria-label="Đóng" />
      <div className={styles.contractActionMenu} ref={menuRef} style={style}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={item.disabled ? styles.contractMenuDisabled : styles.contractMenuItem}
              disabled={item.disabled}
              key={item.label}
              onClick={item.disabled ? undefined : item.onClick}
              type="button"
            >
              <Icon size={14} /> <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function UpgradeFormModal({
  contracts,
  existing,
  initialContractId,
  onClose,
  onSubmit,
}: {
  contracts: Contract[];
  existing: Upgrade[];
  initialContractId?: string;
  onClose: () => void;
  onSubmit: (upgrade: Upgrade) => void;
}) {
  const eligible = contracts.filter((c) => c.status === "active" && !c.hasUpgraded);
  const [contractId, setContractId] = useState<string>(
    eligible.some((c) => c.id === initialContractId) ? initialContractId ?? "" : eligible[0]?.id ?? ""
  );
  const selected = contracts.find((c) => c.id === contractId);
  const oldPackage = selected ? lookupPackage(selected.packageCode) : undefined;

  // BR-M8-42: chỉ gói có price > old
  const upgradePackages = useMemo(() => {
    if (!oldPackage) return [];
    return PACKAGE_LIBRARY.filter((p) => p.price > oldPackage.price && p.code !== oldPackage.code);
  }, [oldPackage]);

  const [toPackageCode, setToPackageCode] = useState<string>(upgradePackages[0]?.code ?? "");
  const newPackage = lookupPackage(toPackageCode);

  // BR-M8-39: GT còn lại = (Giá_cũ ÷ Tổng_buổi) × Buổi_còn_lại − Số nợ
  const oldRemainingValue = useMemo(() => {
    if (!selected || !oldPackage || oldPackage.sessions === 0) return 0;
    const debt = Math.max(0, selected.totalAmount - selected.paid);
    const value = (oldPackage.price / oldPackage.sessions) * selected.remainingSessions - debt;
    return Math.max(0, Math.round(value));
  }, [selected, oldPackage]);

  // BR-M8-40: Phí NC = Giá_mới − GT_còn_lại
  const upgradeFee = useMemo(() => {
    if (!newPackage) return 0;
    return Math.max(0, newPackage.price - oldRemainingValue);
  }, [newPackage, oldRemainingValue]);

  const [vatPercent, setVatPercent] = useState<number>(8);
  const [paidNow, setPaidNow] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS[0]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const total = calcTotalAmount(upgradeFee, 0, vatPercent);
  // BR-M8-46: Buổi mới = Gói mới + Buổi còn lại HĐ gốc
  const newSessions = useMemo(() => {
    if (!newPackage || !selected) return 0;
    return newPackage.sessions + selected.remainingSessions;
  }, [newPackage, selected]);

  const filteredContracts = eligible.filter((c) => {
    if (!searchQuery) return true;
    const customer = lookupCustomer(c.customerCode);
    return `${c.id} ${customer?.name ?? ""} ${customer?.phone ?? ""}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!selected) {
      setError("Vui lòng chọn 1 hợp đồng đang hoạt động");
      return;
    }
    if (!toPackageCode) {
      setError("Không có gói nào cao hơn gói cũ — không thể nâng cấp (BR-M8-42)");
      return;
    }
    if (paidNow > total) {
      setError("Số tiền thu vượt tổng phải thu");
      return;
    }
    const upgrade: Upgrade = {
      id: nextSeqId(existing, "NC"),
      contractId: selected.id,
      customerCode: selected.customerCode,
      fromPackage: selected.packageCode,
      toPackage: toPackageCode,
      oldRemainingValue,
      upgradeFee,
      vatPercent,
      total,
      paid: paidNow,
      oldSessions: selected.totalSessions,
      newSessions,
      effectiveDate: todayString(),
      saleStaff: selected.saleStaff,
      createdAt: nowString(),
      status: "pending_approval",
    };
    onSubmit(upgrade);
  };

  return (
    <div className={styles.modalOverlay}>
      <form className={styles.contractFormModal} onSubmit={submit}>
        <header className={styles.contractFormHeader}>
          <div>
            <h2>Tạo yêu cầu nâng cấp</h2>
            <p>BR-M8-39/40: GT còn lại + Phí NC tính realtime · BR-M8-42: chỉ chọn gói cao hơn</p>
          </div>
          <button onClick={onClose} type="button"><X size={18} /></button>
        </header>

        <div className={styles.contractFormBody}>
          {error ? <div className={styles.formError}><AlertCircle size={14} /> {error}</div> : null}

          <div className={styles.contractRenewalLayout}>
            <section>
              <h3 style={{ marginTop: 0 }}><Search size={16} /> 1. Chọn hợp đồng gốc</h3>
              <div className={styles.pricingSearch} style={{ marginBottom: 10 }}>
                <Search size={16} />
                <input
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm Mã HĐ, KH, SĐT..."
                  value={searchQuery}
                />
              </div>
              <div className={styles.contractContractList}>
                {filteredContracts.map((c) => {
                  const customer = lookupCustomer(c.customerCode);
                  const p = lookupPackage(c.packageCode);
                  return (
                    <div
                      className={`${styles.contractContractRow} ${contractId === c.id ? styles.contractContractRowSelected : ""}`}
                      key={c.id}
                      onClick={() => setContractId(c.id)}
                    >
                      <input checked={contractId === c.id} readOnly type="radio" />
                      <strong>{c.id}</strong>
                      <span><strong>{customer?.name}</strong></span>
                      <span>{p?.name}</span>
                      <span>{c.remainingSessions}/{c.totalSessions}</span>
                      <span>{formatCurrency(p?.price ?? 0)}</span>
                    </div>
                  );
                })}
                {filteredContracts.length === 0 ? <p className={styles.contractMutedNote} style={{ padding: 12 }}>Không có HĐ phù hợp (loại HĐ đã NC)</p> : null}
              </div>

              <h3 style={{ marginTop: 18 }}><TrendingUp size={16} /> 2. Chọn gói mới (BR-M8-42)</h3>
              {upgradePackages.length === 0 ? (
                <p className={styles.contractMutedNote}>Không có gói nào cao hơn gói cũ — vui lòng chọn HĐ khác.</p>
              ) : (
                <div className={styles.contractGrid2}>
                  <label>
                    <span>Gói mới <b>*</b></span>
                    <select className={styles.selectInput} onChange={(e) => setToPackageCode(e.target.value)} value={toPackageCode}>
                      {upgradePackages.map((p) => (
                        <option key={p.code} value={p.code}>{p.code} · {p.name} · {formatCurrency(p.price)}</option>
                      ))}
                    </select>
                  </label>
                  <label><span>Số buổi mới (gói + chuyển)</span><input readOnly value={`${newSessions} buổi`} /></label>
                </div>
              )}

              {selected && newPackage ? (
                <div className={styles.contractUpgradeCompare} style={{ marginTop: 14 }}>
                  <article className={`${styles.contractUpgradeBlock} ${styles.contractUpgradeOld}`}>
                    <h5>Gói cũ</h5>
                    <strong>{oldPackage?.name}</strong>
                    <div><span>Giá</span><span>{formatCurrency(oldPackage?.price ?? 0)}</span></div>
                    <div><span>Số buổi còn</span><span>{selected.remainingSessions}/{selected.totalSessions}</span></div>
                    <div><span>GT còn lại (BR-M8-39)</span><span>{formatCurrency(oldRemainingValue)}</span></div>
                  </article>
                  <div className={styles.contractUpgradeArrow}><ArrowRight size={20} /></div>
                  <article className={`${styles.contractUpgradeBlock} ${styles.contractUpgradeNew}`}>
                    <h5>Gói mới</h5>
                    <strong>{newPackage.name}</strong>
                    <div><span>Giá gói</span><span>{formatCurrency(newPackage.price)}</span></div>
                    <div><span>Số buổi gói</span><span>{newPackage.sessions}</span></div>
                    <div><span>+ Buổi chuyển</span><span>+ {selected.remainingSessions}</span></div>
                    <div><span>Tổng buổi mới</span><span><strong>{newSessions}</strong></span></div>
                  </article>
                </div>
              ) : null}

              <h3 style={{ marginTop: 18 }}><Wallet size={16} /> 3. Thanh toán</h3>
              <div className={styles.contractGrid2}>
                <label><span>Phí nâng cấp (auto)</span><input readOnly value={formatCurrency(upgradeFee)} /></label>
                <label>
                  <span>VAT %</span>
                  <select className={styles.selectInput} onChange={(e) => setVatPercent(Number(e.target.value))} value={vatPercent}>
                    {VAT_OPTIONS.map((v) => <option key={v} value={v}>{v}%</option>)}
                  </select>
                </label>
                <label><span>Tổng cần thu</span><input readOnly value={formatCurrency(total)} /></label>
                <label>
                  <span>Phương thức (nếu thu ngay)</span>
                  <select className={styles.selectInput} onChange={(e) => setPaymentMethod(e.target.value)} value={paymentMethod}>
                    {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </label>
                <label><span>Số tiền thu</span><input min={0} onChange={(e) => setPaidNow(Number(e.target.value) || 0)} type="number" value={paidNow} /></label>
              </div>
            </section>

            <aside className={styles.contractSidePanel}>
              <h4>Tổng kết yêu cầu</h4>
              {selected ? (
                <>
                  <div className={styles.contractSidePanelRow}><span>HĐ gốc</span><strong>{selected.id}</strong></div>
                  <div className={styles.contractSidePanelRow}><span>Khách</span><strong>{lookupCustomer(selected.customerCode)?.name}</strong></div>
                  <div className={styles.contractSidePanelRow}><span>Gói cũ</span><strong>{oldPackage?.name}</strong></div>
                  <div className={styles.contractSidePanelRow}><span>Gói mới</span><strong style={{ color: "#16a34a" }}>{newPackage?.name ?? "—"}</strong></div>
                  <div className={styles.contractSidePanelRow}><span>GT còn lại HĐ cũ</span><strong>{formatCurrency(oldRemainingValue)}</strong></div>
                  <div className={styles.contractSidePanelRow}><span>Phí nâng cấp</span><strong>{formatCurrency(upgradeFee)}</strong></div>
                  <div className={styles.contractSidePanelRow}><span>VAT</span><strong>{vatPercent}%</strong></div>
                  <div className={styles.contractSidePanelTotal}><span>Tổng cần TT</span><strong>{formatCurrency(total)}</strong></div>
                </>
              ) : (
                <p className={styles.contractMutedNote}>Chọn 1 hợp đồng</p>
              )}
            </aside>
          </div>
        </div>

        <footer className={styles.contractFormFooter}>
          <span>Sau khi gửi → trạng thái <strong>Chờ phê duyệt</strong> · BR-M8-45 có thể tắt trong Module 12</span>
          <div>
            <button className={styles.outlineButton} onClick={onClose} type="button">Hủy</button>
            <button className={styles.greenButton} type="submit"><TrendingUp size={14} /> Gửi yêu cầu</button>
          </div>
        </footer>
      </form>
    </div>
  );
}

function UpgradeDetailModal({
  contracts,
  onClose,
  onPrint,
  upgrade,
}: {
  contracts: Contract[];
  onClose: () => void;
  onPrint: () => void;
  upgrade: Upgrade;
}) {
  const contract = contracts.find((c) => c.id === upgrade.contractId);
  const customer = contract ? lookupCustomer(contract.customerCode) : undefined;
  const fromPkg = lookupPackage(upgrade.fromPackage);
  const toPkg = lookupPackage(upgrade.toPackage);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.detailModal}>
        <header className={styles.detailHeader}>
          <div className={styles.detailIdentity}>
            <span><TrendingUp size={20} /></span>
            <div>
              <h2>{upgrade.id} <UpgradeStatusBadge status={upgrade.status} /></h2>
              <p>HĐ gốc {upgrade.contractId} · {customer?.name}</p>
            </div>
          </div>
          <div>
            <button className={styles.outlineButton} onClick={onPrint} type="button"><Printer size={14} /> In</button>
            <button onClick={onClose} type="button"><X size={18} /></button>
          </div>
        </header>
        <div className={styles.detailBody}>
          <article className={styles.detailCard}>
            <h3>So sánh gói</h3>
            <div className={styles.contractUpgradeCompare}>
              <article className={`${styles.contractUpgradeBlock} ${styles.contractUpgradeOld}`}>
                <h5>Gói cũ</h5>
                <strong>{fromPkg?.name}</strong>
                <div><span>Giá</span><span>{formatCurrency(fromPkg?.price ?? 0)}</span></div>
                <div><span>Số buổi cũ</span><span>{upgrade.oldSessions}</span></div>
                <div><span>GT còn lại</span><span>{formatCurrency(upgrade.oldRemainingValue)}</span></div>
              </article>
              <div className={styles.contractUpgradeArrow}><ArrowRight size={20} /></div>
              <article className={`${styles.contractUpgradeBlock} ${styles.contractUpgradeNew}`}>
                <h5>Gói mới</h5>
                <strong>{toPkg?.name}</strong>
                <div><span>Giá</span><span>{formatCurrency(toPkg?.price ?? 0)}</span></div>
                <div><span>Số buổi mới</span><span>{upgrade.newSessions}</span></div>
                <div><span>Phí nâng cấp</span><span>{formatCurrency(upgrade.upgradeFee)}</span></div>
              </article>
            </div>
          </article>

          <article className={styles.detailCard}>
            <h3>Thanh toán</h3>
            <div className={styles.detailThree}>
              <Info label="Phí NC" value={formatCurrency(upgrade.upgradeFee)} />
              <Info label="VAT" value={`${upgrade.vatPercent}%`} />
              <Info label="Tổng tiền" value={formatCurrency(upgrade.total)} />
              <Info label="Đã thu" value={formatCurrency(upgrade.paid)} />
              <Info danger={upgrade.paid < upgrade.total} label="Còn nợ" value={formatCurrency(Math.max(0, upgrade.total - upgrade.paid))} />
              <Info label="Ngày hiệu lực" value={upgrade.effectiveDate} />
              <Info label="NV Sale" value={upgrade.saleStaff} />
              <Info label="Ngày tạo" value={upgrade.createdAt} />
            </div>
            {upgrade.rejectReason ? (
              <div className={styles.contractWarningBox} style={{ marginTop: 10 }}>
                Lý do từ chối / hủy: {upgrade.rejectReason}
              </div>
            ) : null}
          </article>
        </div>
      </div>
    </div>
  );
}

type SuspensionTabProps = {
  suspensions: Suspension[];
  contracts: Contract[];
  onChangeSuspensions: (next: Suspension[]) => void;
  onChangeContracts: (next: Contract[]) => void;
  flash: (msg: string) => void;
};

function SuspensionTab({ contracts, flash, onChangeContracts, onChangeSuspensions, suspensions }: SuspensionTabProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<Suspension | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ kind: "approve" | "reject" | "activate" | "deactivate"; suspension: Suspension } | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<Suspension | null>(null);
  const [printTarget, setPrintTarget] = useState<Suspension | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const totals = {
    total: suspensions.length,
    pending: suspensions.filter((s) => s.status === "pending_approval").length,
    activated: suspensions.filter((s) => s.status === "activated").length,
    completed: suspensions.filter((s) => s.status === "completed").length,
  };

  const handleSubmit = (sus: Suspension) => {
    onChangeSuspensions([sus, ...suspensions]);
    flash(`Đã tạo ${sus.id} (${sus.type}) · ${sus.contractIds.length} HĐ · chờ phê duyệt`);
    setFormOpen(false);
  };

  const updateStatus = (id: string, partial: Partial<Suspension>) => {
    onChangeSuspensions(suspensions.map((s) => (s.id === id ? { ...s, ...partial } : s)));
  };

  const handleApprove = (target: Suspension) => {
    updateStatus(target.id, { status: "approved" });
    flash(`Đã phê duyệt ${target.id}`);
    setConfirmAction(null);
  };

  const handleReject = (target: Suspension, reason?: string) => {
    updateStatus(target.id, { status: "rejected", rejectReason: reason });
    flash(`Đã từ chối ${target.id}`);
    setConfirmAction(null);
  };

  const handleActivate = (target: Suspension) => {
    updateStatus(target.id, { status: "activated" });
    onChangeContracts(
      contracts.map((c) =>
        target.contractIds.includes(c.id)
          ? {
              ...c,
              status: "suspended",
              endDate: addDaysToDate(c.endDate, target.durationDays),
              suspensionCount: c.suspensionCount + 1,
              history: [
                ...c.history,
                { date: nowString(), actor: "Manager", action: `Kích hoạt bảo lưu ${target.id}`, detail: `+${target.durationDays} ngày · ${target.startDate} → ${target.endDate}` },
              ],
            }
          : c
      )
    );
    flash(`Đã kích hoạt bảo lưu ${target.id} — cộng ${target.durationDays} ngày vào ${target.contractIds.length} HĐ (BR-M8-50)`);
    setConfirmAction(null);
  };

  const handleDeactivate = (target: Suspension, reason?: string) => {
    updateStatus(target.id, { status: "cancelled", rejectReason: reason });
    onChangeContracts(
      contracts.map((c) =>
        target.contractIds.includes(c.id)
          ? {
              ...c,
              status: "active",
              history: [
                ...c.history,
                { date: nowString(), actor: "Admin", action: `Hủy kích hoạt bảo lưu ${target.id}`, detail: reason ?? "" },
              ],
            }
          : c
      )
    );
    flash(`Đã hủy bảo lưu ${target.id} — booking đã hủy KHÔNG khôi phục (BR-M8-51)`);
    setConfirmAction(null);
  };

  const handlePayment = (target: Suspension, method: string, paid: number) => {
    flash(`Đã thu phí bảo lưu ${target.id}: ${formatCurrency(paid)} qua ${method}`);
    setPaymentTarget(null);
  };

  return (
    <>
      <div className={styles.contractToolbar}>
        <div className={styles.pricingSearch}>
          <Search size={18} />
          <input placeholder="Tìm Mã BL, HĐ, KH..." />
        </div>
        <button className={styles.greenButton} onClick={() => setFormOpen(true)} type="button">
          <PlusCircle size={16} /> Thêm bảo lưu
        </button>
      </div>

      <div className={styles.contractKpi}>
        <KpiCard label="Tổng bảo lưu" value={String(totals.total)} tone="blue" icon={Pause} />
        <KpiCard label="Chờ phê duyệt" value={String(totals.pending)} tone="amber" icon={Clock} />
        <KpiCard label="Đang bảo lưu" value={String(totals.activated)} tone="amber" icon={Pause} />
        <KpiCard label="Đã hoàn tất / Hủy" value={String(totals.completed)} tone="green" icon={CheckCircle2} />
      </div>

      <section className={styles.memberTableCard}>
        <div className={styles.memberTableWrap}>
          <table className={styles.memberTable}>
            <thead>
              <tr>
                <th>Mã BL</th>
                <th>Loại</th>
                <th>HĐ áp dụng</th>
                <th>Ngày BĐ — KT</th>
                <th>Số ngày</th>
                <th>Lý do</th>
                <th>Phí (mặc định 0đ)</th>
                <th>Trạng thái</th>
                <th>NV xử lý</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {suspensions.length === 0 ? (
                <tr><td className={styles.emptyTableCell} colSpan={10}>Chưa có yêu cầu bảo lưu</td></tr>
              ) : null}
              {suspensions.map((s) => (
                <tr key={s.id}>
                  <td><button className={styles.memberCode} onClick={() => setDetailItem(s)} type="button">{s.id}</button></td>
                  <td>
                    <span className={s.type === "Đơn" ? styles.contractApprovalDraft : styles.contractApprovalApproved}>{s.type}</span>
                  </td>
                  <td>
                    <div className={styles.contractMoneyCell}>
                      {s.contractIds.map((id) => <strong key={id}>{id}</strong>)}
                    </div>
                  </td>
                  <td>{s.startDate} → {s.endDate}</td>
                  <td><strong>{s.durationDays}</strong> ngày</td>
                  <td className={styles.cellTruncate} title={s.reason}>{s.reason}</td>
                  <td>{formatCurrency(s.fee)}</td>
                  <td><SuspensionStatusBadge status={s.status} /></td>
                  <td>{s.saleStaff}</td>
                  <td>
                    <div className={styles.contractRowActions}>
                      <button onClick={() => setDetailItem(s)} title="Xem" type="button"><Eye size={14} /></button>
                      <div className={styles.contractMenuWrap}>
                        <button onClick={() => setOpenMenuId(openMenuId === s.id ? null : s.id)} title="Thao tác" type="button">
                          <MoreVertical size={14} />
                        </button>
                        {openMenuId === s.id ? (
                          <SuspensionActionMenu
                            suspension={s}
                            onClose={() => setOpenMenuId(null)}
                            onApprove={() => { setOpenMenuId(null); setConfirmAction({ kind: "approve", suspension: s }); }}
                            onReject={() => { setOpenMenuId(null); setConfirmAction({ kind: "reject", suspension: s }); }}
                            onActivate={() => { setOpenMenuId(null); setConfirmAction({ kind: "activate", suspension: s }); }}
                            onDeactivate={() => { setOpenMenuId(null); setConfirmAction({ kind: "deactivate", suspension: s }); }}
                            onPay={() => { setOpenMenuId(null); setPaymentTarget(s); }}
                            onPrint={() => { setOpenMenuId(null); setPrintTarget(s); }}
                          />
                        ) : null}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {formOpen ? (
        <SuspensionFormModal
          contracts={contracts}
          existing={suspensions}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
        />
      ) : null}

      {detailItem ? (
        <SuspensionDetailModal
          contracts={contracts}
          onClose={() => setDetailItem(null)}
          onPrint={() => { setPrintTarget(detailItem); setDetailItem(null); }}
          suspension={detailItem}
        />
      ) : null}

      {confirmAction ? (
        <ConfirmDialog
          title={
            confirmAction.kind === "approve"
              ? "Phê duyệt bảo lưu"
              : confirmAction.kind === "reject"
                ? "Từ chối bảo lưu"
                : confirmAction.kind === "activate"
                  ? "Kích hoạt bảo lưu"
                  : "Hủy kích hoạt bảo lưu"
          }
          description={
            confirmAction.kind === "approve"
              ? `Phê duyệt ${confirmAction.suspension.id}? Sau khi duyệt sẽ mở dialog Kích hoạt.`
              : confirmAction.kind === "reject"
                ? `Từ chối ${confirmAction.suspension.id}? HĐ giữ trạng thái Active.`
                : confirmAction.kind === "activate"
                  ? `Kích hoạt ${confirmAction.suspension.id}? Hệ thống sẽ chuyển ${confirmAction.suspension.contractIds.length} HĐ sang trạng thái "Đang bảo lưu", cộng ${confirmAction.suspension.durationDays} ngày vào end_date. Booking tương lai trong khoảng BL sẽ bị hủy + hoàn buổi (BR-M8-28).`
                  : `Hủy kích hoạt ${confirmAction.suspension.id}? Trừ lại số ngày chưa dùng. Booking đã hủy KHÔNG khôi phục (BR-M8-51). Yêu cầu nhập lý do.`
          }
          confirmLabel={
            confirmAction.kind === "approve"
              ? "Phê duyệt"
              : confirmAction.kind === "reject"
                ? "Từ chối"
                : confirmAction.kind === "activate"
                  ? "Kích hoạt"
                  : "Hủy kích hoạt"
          }
          tone={
            confirmAction.kind === "approve"
              ? "green"
              : confirmAction.kind === "reject" || confirmAction.kind === "deactivate"
                ? "red"
                : "blue"
          }
          reasonRequired={confirmAction.kind === "reject" || confirmAction.kind === "deactivate"}
          onCancel={() => setConfirmAction(null)}
          onConfirm={(reason) => {
            if (confirmAction.kind === "approve") handleApprove(confirmAction.suspension);
            if (confirmAction.kind === "reject") handleReject(confirmAction.suspension, reason);
            if (confirmAction.kind === "activate") handleActivate(confirmAction.suspension);
            if (confirmAction.kind === "deactivate") handleDeactivate(confirmAction.suspension, reason);
          }}
        />
      ) : null}

      {paymentTarget ? (
        <PaymentDialog
          amount={paymentTarget.total}
          title={`Thu phí bảo lưu ${paymentTarget.id}`}
          onCancel={() => setPaymentTarget(null)}
          onConfirm={(method, paid) => handlePayment(paymentTarget, method, paid)}
        />
      ) : null}

      {printTarget ? (
        <PrintTemplateDialog
          title={`In phiếu bảo lưu ${printTarget.id}`}
          onClose={() => setPrintTarget(null)}
          onConfirm={(template) => {
            flash(`Đang in ${printTarget.id} bằng mẫu "${template}"`);
            setPrintTarget(null);
          }}
        />
      ) : null}
    </>
  );
}

function SuspensionStatusBadge({ status }: { status: SuspensionStatus }) {
  const map: Record<SuspensionStatus, { label: string; className: string }> = {
    draft: { label: "Nháp", className: styles.contractApprovalDraft },
    pending_approval: { label: "Chờ phê duyệt", className: styles.contractApprovalPending },
    approved: { label: "Đã phê duyệt", className: styles.contractApprovalApproved },
    rejected: { label: "Từ chối", className: styles.contractApprovalRejected },
    activated: { label: "Đang bảo lưu", className: styles.contractApprovalActivated },
    completed: { label: "Hoàn tất", className: styles.contractApprovalCompleted },
    cancelled: { label: "Đã hủy", className: styles.contractApprovalCancelled },
  };
  return <span className={map[status].className}>{map[status].label}</span>;
}

function SuspensionActionMenu({
  suspension,
  onClose,
  onApprove,
  onReject,
  onActivate,
  onDeactivate,
  onPay,
  onPrint,
}: {
  suspension: Suspension;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onPay: () => void;
  onPrint: () => void;
}) {
  const { menuRef, style } = useContractMenuPosition();
  const items: Array<{ icon: typeof FileText; label: string; onClick: () => void; disabled?: boolean }> = [
    { icon: ThumbsUp, label: "Phê duyệt", onClick: onApprove, disabled: suspension.status !== "pending_approval" },
    { icon: ThumbsDown, label: "Từ chối", onClick: onReject, disabled: suspension.status !== "pending_approval" },
    { icon: Power, label: "Kích hoạt", onClick: onActivate, disabled: suspension.status !== "approved" },
    { icon: RotateCcw, label: "Hủy kích hoạt", onClick: onDeactivate, disabled: suspension.status !== "activated" },
    { icon: HandCoins, label: "Thanh toán phí", onClick: onPay, disabled: suspension.fee === 0 },
    { icon: Printer, label: "In phiếu", onClick: onPrint },
  ];
  return (
    <>
      <button className={styles.contractMenuBackdrop} onClick={onClose} type="button" />
      <div className={styles.contractActionMenu} ref={menuRef} style={style}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={item.disabled ? styles.contractMenuDisabled : styles.contractMenuItem}
              disabled={item.disabled}
              key={item.label}
              onClick={item.disabled ? undefined : item.onClick}
              type="button"
            >
              <Icon size={14} /> <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function SuspensionFormModal({
  contracts,
  existing,
  initialContractId,
  onClose,
  onSubmit,
}: {
  contracts: Contract[];
  existing: Suspension[];
  initialContractId?: string;
  onClose: () => void;
  onSubmit: (suspension: Suspension) => void;
}) {
  const eligible = contracts.filter((c) => c.status === "active" && c.suspensionCount < 2);
  const [type, setType] = useState<"Đơn" | "Nhóm">("Đơn");
  const [selectedIds, setSelectedIds] = useState<string[]>(
    eligible.some((c) => c.id === initialContractId) ? [initialContractId ?? ""] : eligible[0] ? [eligible[0].id] : []
  );
  const [startDate, setStartDate] = useState<string>(todayString());
  const [endDate, setEndDate] = useState<string>(addDaysToDate(todayString(), 30));
  const [reason, setReason] = useState<string>("");
  const [fee, setFee] = useState<number>(0);
  const [vatPercent, setVatPercent] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const durationDays = useMemo(() => diffDaysInclusive(startDate, endDate), [startDate, endDate]);

  const total = calcTotalAmount(fee, 0, vatPercent);

  const totalSuspendedDays = useMemo(() => {
    if (selectedIds.length === 0) return 0;
    const c = contracts.find((x) => x.id === selectedIds[0]);
    if (!c) return 0;
    return durationDays;
  }, [selectedIds, contracts, durationDays]);

  const toggleId = (id: string) => {
    if (type === "Đơn") {
      setSelectedIds([id]);
    } else {
      setSelectedIds((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (selectedIds.length === 0) {
      setError("Vui lòng chọn HĐ áp dụng bảo lưu");
      return;
    }
    if (type === "Nhóm" && selectedIds.length < 2) {
      setError("Bảo lưu nhóm cần chọn ≥ 2 hợp đồng");
      return;
    }
    if (durationDays > 90) {
      setError("Mỗi lần bảo lưu tối đa 90 ngày (BR-M8-26)");
      return;
    }
    if (!reason.trim()) {
      setError("Vui lòng nhập lý do bảo lưu");
      return;
    }
    // BR-M8-26: tổng ≤ 180
    for (const id of selectedIds) {
      const c = contracts.find((c) => c.id === id);
      if (c && c.suspensionCount >= 2) {
        setError(`HĐ ${id} đã bảo lưu 2 lần (BR-M8-26)`);
        return;
      }
    }

    const suspension: Suspension = {
      id: nextSeqId(existing, "BL"),
      contractIds: selectedIds,
      type,
      startDate,
      endDate,
      durationDays,
      reason,
      fee,
      vatPercent,
      total,
      status: "pending_approval",
      createdAt: nowString(),
      saleStaff: SALES_STAFF[0],
    };
    onSubmit(suspension);
  };

  return (
    <div className={styles.modalOverlay}>
      <form className={styles.contractFormModal} onSubmit={submit}>
        <header className={styles.contractFormHeader}>
          <div>
            <h2>Tạo yêu cầu bảo lưu</h2>
            <p>BR-M8-26: tối đa 2 lần × 90 ngày · tổng ≤ 180 ngày · Booking tương lai sẽ hủy + hoàn buổi</p>
          </div>
          <button onClick={onClose} type="button"><X size={18} /></button>
        </header>

        <div className={styles.contractFormBody}>
          {error ? <div className={styles.formError}><AlertCircle size={14} /> {error}</div> : null}

          <section className={styles.contractFormSection}>
            <h3><Layers size={16} /> 1. Loại bảo lưu</h3>
            <div className={styles.contractRadioRow}>
              <label className={type === "Đơn" ? styles.contractRadioActive : styles.contractRadio}>
                <input checked={type === "Đơn"} onChange={() => { setType("Đơn"); setSelectedIds(selectedIds.slice(0, 1)); }} type="radio" /> Bảo lưu đơn (1 HĐ)
              </label>
              <label className={type === "Nhóm" ? styles.contractRadioActive : styles.contractRadio}>
                <input checked={type === "Nhóm"} onChange={() => setType("Nhóm")} type="radio" /> Bảo lưu nhóm (nhiều HĐ — BR-M8-47)
              </label>
            </div>
          </section>

          <section className={styles.contractFormSection}>
            <h3><Search size={16} /> 2. Chọn hợp đồng (active, chưa BL 2 lần)</h3>
            <div className={styles.contractSuspensionContractGrid}>
              {eligible.map((c) => {
                const customer = lookupCustomer(c.customerCode);
                const pkg = lookupPackage(c.packageCode);
                const isSelected = selectedIds.includes(c.id);
                return (
                  <div
                    className={`${styles.contractSuspensionContractCard} ${isSelected ? styles.contractSuspensionSelected : ""}`}
                    key={c.id}
                    onClick={() => toggleId(c.id)}
                  >
                    <input checked={isSelected} readOnly type={type === "Đơn" ? "radio" : "checkbox"} />
                    <div>
                      <strong>{c.id} · {customer?.name}</strong>
                      <span>{pkg?.name} · {c.remainingSessions}/{c.totalSessions}</span>
                      <span>BL {c.suspensionCount}/2 — KT {c.endDate}</span>
                    </div>
                  </div>
                );
              })}
              {eligible.length === 0 ? <p className={styles.contractMutedNote}>Không có HĐ nào đủ điều kiện bảo lưu</p> : null}
            </div>
          </section>

          <section className={styles.contractFormSection}>
            <h3><Calendar size={16} /> 3. Thời gian bảo lưu</h3>
            <div className={styles.contractGrid2}>
              <label><span>Ngày bắt đầu <b>*</b></span><input onChange={(e) => setStartDate(e.target.value)} placeholder="dd/mm/yyyy" value={startDate} /></label>
              <label><span>Ngày kết thúc <b>*</b></span><input onChange={(e) => setEndDate(e.target.value)} placeholder="dd/mm/yyyy" value={endDate} /></label>
              <label><span>Số ngày (auto)</span><input readOnly value={`${durationDays} ngày`} /></label>
              <label className={styles.fullField}><span>Lý do bảo lưu <b>*</b></span><textarea onChange={(e) => setReason(e.target.value)} placeholder="VD: Đi công tác / chấn thương / lý do cá nhân..." rows={3} value={reason} /></label>
            </div>
          </section>

          <section className={styles.contractFormSection}>
            <h3><Sparkles size={16} /> 4. Tổng kết</h3>
            <div className={styles.contractSuspensionMatrix}>
              <div><span>Số HĐ áp dụng</span><strong>{selectedIds.length}</strong></div>
              <div><span>Số ngày bảo lưu / HĐ</span><strong>{durationDays}</strong></div>
              <div><span>Tổng ngày gia hạn (cộng vào end_date)</span><strong>{durationDays * selectedIds.length}</strong></div>
            </div>
            {selectedIds.length > 0 ? (
              <ul className={styles.contractAttachmentList} style={{ marginTop: 12 }}>
                {selectedIds.map((id) => {
                  const c = contracts.find((c) => c.id === id);
                  if (!c) return null;
                  return (
                    <li key={id}>
                      <FileText size={14} /> {id} · KT cũ: {c.endDate}
                      <ArrowRight size={12} style={{ margin: "0 6px" }} />
                      <strong style={{ color: "#16a34a" }}>KT mới: {addDaysToDate(c.endDate, totalSuspendedDays)}</strong>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </section>

          <section className={styles.contractFormSection}>
            <h3><Wallet size={16} /> 5. Phí bảo lưu (BR-M8-27)</h3>
            <div className={styles.contractGrid2}>
              <label><span>Phí (VNĐ) — mặc định 0đ miễn phí</span><input min={0} onChange={(e) => setFee(Number(e.target.value) || 0)} type="number" value={fee} /></label>
              <label>
                <span>VAT %</span>
                <select className={styles.selectInput} onChange={(e) => setVatPercent(Number(e.target.value))} value={vatPercent}>
                  {VAT_OPTIONS.map((v) => <option key={v} value={v}>{v}%</option>)}
                </select>
              </label>
              <label><span>Tổng phí</span><input readOnly value={formatCurrency(total)} /></label>
            </div>
          </section>
        </div>

        <footer className={styles.contractFormFooter}>
          <span>Tổng phí: <strong>{formatCurrency(total)}</strong> · {selectedIds.length} HĐ · {durationDays} ngày</span>
          <div>
            <button className={styles.outlineButton} onClick={onClose} type="button">Hủy</button>
            <button className={styles.greenButton} type="submit"><Pause size={14} /> Gửi yêu cầu</button>
          </div>
        </footer>
      </form>
    </div>
  );
}

function SuspensionDetailModal({
  contracts,
  onClose,
  onPrint,
  suspension,
}: {
  contracts: Contract[];
  onClose: () => void;
  onPrint: () => void;
  suspension: Suspension;
}) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.detailModal}>
        <header className={styles.detailHeader}>
          <div className={styles.detailIdentity}>
            <span><Pause size={20} /></span>
            <div>
              <h2>{suspension.id} <SuspensionStatusBadge status={suspension.status} /></h2>
              <p>Loại: {suspension.type} · {suspension.contractIds.length} HĐ · {suspension.durationDays} ngày</p>
            </div>
          </div>
          <div>
            <button className={styles.outlineButton} onClick={onPrint} type="button"><Printer size={14} /> In</button>
            <button onClick={onClose} type="button"><X size={18} /></button>
          </div>
        </header>
        <div className={styles.detailBody}>
          <article className={styles.detailCard}>
            <h3>Cấu hình bảo lưu</h3>
            <div className={styles.detailThree}>
              <Info label="Loại" value={suspension.type} />
              <Info label="Ngày BĐ" value={suspension.startDate} />
              <Info label="Ngày KT" value={suspension.endDate} />
              <Info label="Số ngày" value={`${suspension.durationDays} ngày`} />
              <Info label="Phí" value={formatCurrency(suspension.fee)} />
              <Info label="Tổng" value={formatCurrency(suspension.total)} />
              <Info label="NV xử lý" value={suspension.saleStaff} />
              <Info label="Ngày tạo" value={suspension.createdAt} />
            </div>
            <p className={styles.contractMutedNote} style={{ marginTop: 12 }}>Lý do: {suspension.reason}</p>
          </article>

          <article className={styles.detailCard}>
            <h3>HĐ áp dụng & end_date thay đổi</h3>
            <ul className={styles.contractAttachmentList}>
              {suspension.contractIds.map((id) => {
                const c = contracts.find((c) => c.id === id);
                if (!c) return <li key={id}>{id}</li>;
                return (
                  <li key={id}>
                    <FileText size={14} /> <strong>{id}</strong> · {lookupCustomer(c.customerCode)?.name} · KT mới: {c.endDate}
                  </li>
                );
              })}
            </ul>
            {suspension.rejectReason ? (
              <div className={styles.contractWarningBox} style={{ marginTop: 10 }}>Lý do từ chối / hủy: {suspension.rejectReason}</div>
            ) : null}
          </article>
        </div>
      </div>
    </div>
  );
}

type TransferTabProps = {
  transfers: Transfer[];
  contracts: Contract[];
  onChangeTransfers: (next: Transfer[]) => void;
  onChangeContracts: (next: Contract[]) => void;
  flash: (msg: string) => void;
};

function TransferTab({ contracts, flash, onChangeContracts, onChangeTransfers, transfers }: TransferTabProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<Transfer | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ kind: "approve" | "reject" | "activate" | "deactivate"; transfer: Transfer } | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<Transfer | null>(null);
  const [printTarget, setPrintTarget] = useState<Transfer | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const totals = {
    total: transfers.length,
    pending: transfers.filter((t) => t.status === "pending_approval").length,
    completed: transfers.filter((t) => t.status === "completed" || t.status === "activated").length,
    revenue: transfers.reduce((s, t) => s + t.paid, 0),
  };

  const handleSubmit = (transfer: Transfer) => {
    onChangeTransfers([transfer, ...transfers]);
    flash(`Đã tạo ${transfer.id} — chờ phê duyệt`);
    setFormOpen(false);
  };

  const updateStatus = (id: string, partial: Partial<Transfer>) => {
    onChangeTransfers(transfers.map((t) => (t.id === id ? { ...t, ...partial } : t)));
  };

  const handleApprove = (target: Transfer) => {
    updateStatus(target.id, { status: "approved" });
    flash(`Đã phê duyệt ${target.id}`);
    setConfirmAction(null);
  };

  const handleReject = (target: Transfer, reason?: string) => {
    updateStatus(target.id, { status: "rejected", rejectReason: reason });
    flash(`Đã từ chối ${target.id}`);
    setConfirmAction(null);
  };

  const handleActivate = (target: Transfer) => {
    // BR-M8-59: ATOMIC ownership transfer
    updateStatus(target.id, { status: "activated" });
    onChangeContracts(
      contracts.map((c) =>
        c.id === target.contractId
          ? {
              ...c,
              customerCode: target.toCustomer,
              hasTransferred: true,
              history: [
                ...c.history,
                { date: nowString(), actor: "Manager", action: `Kích hoạt chuyển nhượng ${target.id}`, detail: `${target.fromCustomer} → ${target.toCustomer}` },
              ],
            }
          : c
      )
    );
    const fromName = lookupCustomer(target.fromCustomer)?.name ?? target.fromCustomer;
    const toName = lookupCustomer(target.toCustomer)?.name ?? target.toCustomer;
    flash(`Atomic transfer: ${fromName} → ${toName} cho HĐ ${target.contractId}`);
    setConfirmAction(null);
  };

  const handleDeactivate = (target: Transfer) => {
    // BR-M8-60: KHÔNG yêu cầu lý do, phí KHÔNG hoàn
    updateStatus(target.id, { status: "rejected" });
    onChangeContracts(
      contracts.map((c) =>
        c.id === target.contractId
          ? {
              ...c,
              customerCode: target.fromCustomer,
              hasTransferred: false,
              history: [
                ...c.history,
                { date: nowString(), actor: "Admin", action: `Hủy kích hoạt chuyển nhượng ${target.id}`, detail: "Phí không hoàn (BR-M8-60)" },
              ],
            }
          : c
      )
    );
    flash(`Đã hủy kích hoạt ${target.id} — phí KHÔNG hoàn (BR-M8-60)`);
    setConfirmAction(null);
  };

  const handlePayment = (target: Transfer, method: string, paid: number) => {
    const newPaid = target.paid + paid;
    updateStatus(target.id, { paid: newPaid, status: newPaid >= target.total ? "completed" : target.status });
    flash(`Đã thu ${formatCurrency(paid)} qua ${method} cho ${target.id}`);
    setPaymentTarget(null);
  };

  return (
    <>
      <div className={styles.contractToolbar}>
        <div className={styles.pricingSearch}>
          <Search size={18} />
          <input placeholder="Tìm Mã CN, HĐ, KH..." />
        </div>
        <button
          className={styles.greenButton}
          onClick={() => setFormOpen(true)}
          style={{ background: "#9333ea" }}
          type="button"
        >
          <PlusCircle size={16} /> Thêm chuyển nhượng
        </button>
      </div>

      <div className={styles.contractKpi}>
        <KpiCard label="Tổng chuyển nhượng" value={String(totals.total)} tone="blue" icon={UserCog} />
        <KpiCard label="Chờ phê duyệt" value={String(totals.pending)} tone="amber" icon={Clock} />
        <KpiCard label="Đã chuyển" value={String(totals.completed)} tone="green" icon={CheckCircle2} />
        <KpiCard label="Phí đã thu" value={formatCurrency(totals.revenue)} tone="blue" icon={Wallet} />
      </div>

      <section className={styles.memberTableCard}>
        <div className={styles.memberTableWrap}>
          <table className={styles.memberTable}>
            <thead>
              <tr>
                <th>Mã CN</th>
                <th>HĐ</th>
                <th>Chủ cũ</th>
                <th>Chủ mới</th>
                <th>Ngày CN</th>
                <th>Phí CN</th>
                <th>Tổng tiền / Đã TT</th>
                <th>Trạng thái</th>
                <th>NV xử lý</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {transfers.length === 0 ? (
                <tr><td className={styles.emptyTableCell} colSpan={10}>Chưa có yêu cầu chuyển nhượng</td></tr>
              ) : null}
              {transfers.map((t) => {
                const fromCustomer = lookupCustomer(t.fromCustomer);
                const toCustomer = lookupCustomer(t.toCustomer);
                return (
                  <tr key={t.id}>
                    <td><button className={styles.memberCode} onClick={() => setDetailItem(t)} type="button">{t.id}</button></td>
                    <td>{t.contractId}</td>
                    <td className={styles.memberName}>
                      <strong>{fromCustomer?.name ?? t.fromCustomer}</strong>
                      <small>{fromCustomer?.phone}</small>
                    </td>
                    <td className={styles.memberName}>
                      <strong style={{ color: "#9333ea" }}>{toCustomer?.name ?? t.toCustomer}</strong>
                      <small>{toCustomer?.phone}</small>
                    </td>
                    <td>{t.effectiveDate}</td>
                    <td>{formatCurrency(t.fee)}</td>
                    <td>
                      <div className={styles.contractMoneyCell}>
                        <strong>{formatCurrency(t.total)}</strong>
                        <em className={t.paid < t.total ? styles.dangerText : styles.contractPaid}>
                          {t.paid < t.total ? `Nợ ${formatCurrency(t.total - t.paid)}` : "Đủ"}
                        </em>
                      </div>
                    </td>
                    <td><TransferStatusBadge status={t.status} /></td>
                    <td>{t.saleStaff}</td>
                    <td>
                      <div className={styles.contractRowActions}>
                        <button onClick={() => setDetailItem(t)} title="Xem" type="button"><Eye size={14} /></button>
                        <div className={styles.contractMenuWrap}>
                          <button onClick={() => setOpenMenuId(openMenuId === t.id ? null : t.id)} title="Thao tác" type="button">
                            <MoreVertical size={14} />
                          </button>
                          {openMenuId === t.id ? (
                            <TransferActionMenu
                              transfer={t}
                              onClose={() => setOpenMenuId(null)}
                              onApprove={() => { setOpenMenuId(null); setConfirmAction({ kind: "approve", transfer: t }); }}
                              onReject={() => { setOpenMenuId(null); setConfirmAction({ kind: "reject", transfer: t }); }}
                              onActivate={() => { setOpenMenuId(null); setConfirmAction({ kind: "activate", transfer: t }); }}
                              onDeactivate={() => { setOpenMenuId(null); setConfirmAction({ kind: "deactivate", transfer: t }); }}
                              onPay={() => { setOpenMenuId(null); setPaymentTarget(t); }}
                              onPrint={() => { setOpenMenuId(null); setPrintTarget(t); }}
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
      </section>

      {formOpen ? (
        <TransferFormModal
          contracts={contracts}
          existing={transfers}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
        />
      ) : null}

      {detailItem ? (
        <TransferDetailModal
          contracts={contracts}
          onClose={() => setDetailItem(null)}
          onPrint={() => { setPrintTarget(detailItem); setDetailItem(null); }}
          transfer={detailItem}
        />
      ) : null}

      {confirmAction ? (
        <ConfirmDialog
          title={
            confirmAction.kind === "approve"
              ? "Phê duyệt chuyển nhượng"
              : confirmAction.kind === "reject"
                ? "Từ chối chuyển nhượng"
                : confirmAction.kind === "activate"
                  ? "Kích hoạt chuyển nhượng"
                  : "Hủy kích hoạt chuyển nhượng"
          }
          description={
            confirmAction.kind === "approve"
              ? `Phê duyệt ${confirmAction.transfer.id}? Sau khi duyệt sẽ mở dialog Kích hoạt (transfer ownership ATOMIC — BR-M8-59).`
              : confirmAction.kind === "reject"
                ? `Từ chối ${confirmAction.transfer.id}? HĐ giữ chủ cũ.`
                : confirmAction.kind === "activate"
                  ? `Kích hoạt ${confirmAction.transfer.id}? Hệ thống sẽ chuyển ownership từ ${lookupCustomer(confirmAction.transfer.fromCustomer)?.name} sang ${lookupCustomer(confirmAction.transfer.toCustomer)?.name} trong cùng giao dịch DB.`
                  : `Hủy kích hoạt ${confirmAction.transfer.id}? Trả HĐ về chủ cũ. Phí KHÔNG hoàn tự động (BR-M8-60).`
          }
          confirmLabel={
            confirmAction.kind === "approve"
              ? "Phê duyệt"
              : confirmAction.kind === "reject"
                ? "Từ chối"
                : confirmAction.kind === "activate"
                  ? "Kích hoạt"
                  : "Hủy kích hoạt"
          }
          tone={
            confirmAction.kind === "approve" ? "purple" : confirmAction.kind === "reject" ? "red" : confirmAction.kind === "activate" ? "purple" : "red"
          }
          reasonRequired={confirmAction.kind === "reject"}
          onCancel={() => setConfirmAction(null)}
          onConfirm={(reason) => {
            if (confirmAction.kind === "approve") handleApprove(confirmAction.transfer);
            if (confirmAction.kind === "reject") handleReject(confirmAction.transfer, reason);
            if (confirmAction.kind === "activate") handleActivate(confirmAction.transfer);
            if (confirmAction.kind === "deactivate") handleDeactivate(confirmAction.transfer);
          }}
        />
      ) : null}

      {paymentTarget ? (
        <PaymentDialog
          amount={paymentTarget.total - paymentTarget.paid}
          title={`Thu phí chuyển nhượng ${paymentTarget.id}`}
          onCancel={() => setPaymentTarget(null)}
          onConfirm={(method, paid) => handlePayment(paymentTarget, method, paid)}
        />
      ) : null}

      {printTarget ? (
        <PrintTemplateDialog
          title={`In phiếu chuyển nhượng ${printTarget.id}`}
          onClose={() => setPrintTarget(null)}
          onConfirm={(template) => {
            flash(`Đang in ${printTarget.id} bằng mẫu "${template}"`);
            setPrintTarget(null);
          }}
        />
      ) : null}
    </>
  );
}

function TransferStatusBadge({ status }: { status: TransferStatus }) {
  const map: Record<TransferStatus, { label: string; className: string }> = {
    draft: { label: "Nháp", className: styles.contractApprovalDraft },
    pending_approval: { label: "Chờ phê duyệt", className: styles.contractApprovalPending },
    approved: { label: "Đã phê duyệt", className: styles.contractApprovalApproved },
    rejected: { label: "Từ chối / Hủy", className: styles.contractApprovalRejected },
    activated: { label: "Đã chuyển", className: styles.contractApprovalActivated },
    completed: { label: "Hoàn tất", className: styles.contractApprovalCompleted },
  };
  return <span className={map[status].className}>{map[status].label}</span>;
}

function TransferActionMenu({
  transfer,
  onClose,
  onApprove,
  onReject,
  onActivate,
  onDeactivate,
  onPay,
  onPrint,
}: {
  transfer: Transfer;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onPay: () => void;
  onPrint: () => void;
}) {
  const { menuRef, style } = useContractMenuPosition();
  const items: Array<{ icon: typeof FileText; label: string; onClick: () => void; disabled?: boolean }> = [
    { icon: ThumbsUp, label: "Phê duyệt", onClick: onApprove, disabled: transfer.status !== "pending_approval" },
    { icon: ThumbsDown, label: "Từ chối", onClick: onReject, disabled: transfer.status !== "pending_approval" },
    { icon: Power, label: "Kích hoạt CN", onClick: onActivate, disabled: transfer.status !== "approved" },
    { icon: RotateCcw, label: "Hủy kích hoạt", onClick: onDeactivate, disabled: transfer.status !== "activated" },
    { icon: HandCoins, label: "Thanh toán phí", onClick: onPay, disabled: transfer.paid >= transfer.total },
    { icon: Printer, label: "In phiếu", onClick: onPrint },
  ];
  return (
    <>
      <button className={styles.contractMenuBackdrop} onClick={onClose} type="button" />
      <div className={styles.contractActionMenu} ref={menuRef} style={style}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={item.disabled ? styles.contractMenuDisabled : styles.contractMenuItem}
              disabled={item.disabled}
              key={item.label}
              onClick={item.disabled ? undefined : item.onClick}
              type="button"
            >
              <Icon size={14} /> <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function TransferFormModal({
  contracts,
  existing,
  initialContractId,
  onClose,
  onSubmit,
}: {
  contracts: Contract[];
  existing: Transfer[];
  initialContractId?: string;
  onClose: () => void;
  onSubmit: (transfer: Transfer) => void;
}) {
  const eligible = contracts.filter(
    (c) =>
      c.status === "active" &&
      c.remainingSessions > 0 &&
      !c.hasTransferred &&
      c.totalAmount === c.paid
  );
  const [contractId, setContractId] = useState<string>(
    eligible.some((c) => c.id === initialContractId) ? initialContractId ?? "" : eligible[0]?.id ?? ""
  );
  const selected = contracts.find((c) => c.id === contractId);
  const fromCustomer = selected ? lookupCustomer(selected.customerCode) : undefined;

  // Người nhận (loại trừ chủ cũ)
  const receiverOptions = CUSTOMERS.filter((c) => c.code !== selected?.customerCode);
  const [toCustomerCode, setToCustomerCode] = useState<string>(receiverOptions[0]?.code ?? "");
  const toCustomer = lookupCustomer(toCustomerCode);

  const [effectiveDate, setEffectiveDate] = useState<string>(todayString());
  const [fee, setFee] = useState<number>(200_000);
  const [vatPercent, setVatPercent] = useState<number>(10);
  const [reason, setReason] = useState<string>("");
  const [paidNow, setPaidNow] = useState<number>(220_000);
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS[0]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const total = calcTotalAmount(fee, 0, vatPercent);

  const filteredContracts = eligible.filter((c) => {
    if (!searchQuery) return true;
    const customer = lookupCustomer(c.customerCode);
    return `${c.id} ${customer?.name ?? ""} ${customer?.phone ?? ""}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!selected) {
      setError("Vui lòng chọn HĐ");
      return;
    }
    if (!toCustomerCode || toCustomerCode === selected.customerCode) {
      setError("Người nhận phải khác chủ cũ (BR-M8-56)");
      return;
    }
    if (toCustomer && !toCustomer.cccdVerified) {
      setError(`Người nhận ${toCustomer.name} chưa verified CCCD (BR-M8-55) — Admin override?`);
      // Không return để cho phép tiếp tục (mô phỏng admin override)
    }
    if (!reason.trim()) {
      setError("Vui lòng nhập lý do chuyển nhượng");
      return;
    }
    const transfer: Transfer = {
      id: nextSeqId(existing, "CN"),
      contractId: selected.id,
      fromCustomer: selected.customerCode,
      toCustomer: toCustomerCode,
      fee,
      vatPercent,
      total,
      paid: paidNow,
      effectiveDate,
      reason,
      status: "pending_approval",
      createdAt: nowString(),
      saleStaff: selected.saleStaff,
    };
    if (paidNow > 0) {
      transfer.reason = `${reason} · PTTT: ${paymentMethod}`;
    }
    onSubmit(transfer);
  };

  return (
    <div className={styles.modalOverlay}>
      <form className={styles.contractFormModal} onSubmit={submit}>
        <header className={styles.contractFormHeader} style={{ background: "#faf5ff", borderBottomColor: "#e9d5ff" }}>
          <div>
            <h2 style={{ color: "#6b21a8" }}>Tạo chuyển nhượng hợp đồng</h2>
            <p>BR-M8-54: HĐ active + còn buổi + chưa CN + đã TT đủ · BR-M8-55: CCCD verified · BR-M8-59: ATOMIC</p>
          </div>
          <button onClick={onClose} type="button"><X size={18} /></button>
        </header>

        <div className={styles.contractFormBody}>
          {error ? <div className={styles.formError}><AlertCircle size={14} /> {error}</div> : null}

          <div className={styles.contractRenewalLayout}>
            <section>
              <h3 style={{ marginTop: 0, color: "#6b21a8" }}><Search size={16} /> 1. Tìm hợp đồng gốc</h3>
              <div className={styles.pricingSearch} style={{ marginBottom: 10 }}>
                <Search size={16} />
                <input onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tìm Mã HĐ, KH..." value={searchQuery} />
              </div>
              <div className={styles.contractContractList}>
                {filteredContracts.map((c) => {
                  const customer = lookupCustomer(c.customerCode);
                  const p = lookupPackage(c.packageCode);
                  return (
                    <div
                      className={`${styles.contractContractRow} ${contractId === c.id ? styles.contractContractRowSelected : ""}`}
                      key={c.id}
                      onClick={() => setContractId(c.id)}
                    >
                      <input checked={contractId === c.id} readOnly type="radio" />
                      <strong>{c.id}</strong>
                      <span><strong>{customer?.name}</strong> · {customer?.phone}</span>
                      <span>{p?.name}</span>
                      <span>{c.remainingSessions}/{c.totalSessions}</span>
                      <span>KT: {c.endDate}</span>
                    </div>
                  );
                })}
                {filteredContracts.length === 0 ? <p className={styles.contractMutedNote} style={{ padding: 12 }}>Không có HĐ thỏa điều kiện</p> : null}
              </div>

              <h3 style={{ marginTop: 18, color: "#6b21a8" }}><UserCog size={16} /> 2. Người nhận chuyển nhượng</h3>
              <div className={styles.contractGrid2}>
                <label>
                  <span>Hội viên nhận <b>*</b></span>
                  <select className={styles.selectInput} onChange={(e) => setToCustomerCode(e.target.value)} value={toCustomerCode}>
                    {receiverOptions.map((c) => (
                      <option key={c.code} value={c.code}>{c.code} · {c.name} · {c.phone} {c.cccdVerified ? "✓" : "(Chưa verified)"}</option>
                    ))}
                  </select>
                </label>
                <label><span>Ngày CN</span><input onChange={(e) => setEffectiveDate(e.target.value)} placeholder="dd/mm/yyyy" value={effectiveDate} /></label>
              </div>

              {toCustomer ? (
                <div className={styles.contractCustomerCard} style={{ marginTop: 10, background: "#faf5ff", borderColor: "#e9d5ff" }}>
                  <strong style={{ color: "#6b21a8" }}>Hội viên nhận: {toCustomer.name}</strong>
                  <span>SĐT: {toCustomer.phone} · CCCD: {toCustomer.cccd}</span>
                  <span>{toCustomer.cccdVerified ? <em className={styles.contractVerified}>✓ Verified</em> : <em className={styles.contractUnverified}>⚠ Chưa verified — cần Admin override</em>}</span>
                </div>
              ) : null}

              <h3 style={{ marginTop: 18, color: "#6b21a8" }}><FileText size={16} /> 3. Lý do</h3>
              <label className={styles.fullField}>
                <span>Lý do chuyển nhượng <b>*</b></span>
                <textarea onChange={(e) => setReason(e.target.value)} placeholder="VD: Chuyển nhượng cho người thân, đổi gói cho con..." rows={2} value={reason} />
              </label>

              <h3 style={{ marginTop: 18, color: "#6b21a8" }}><Wallet size={16} /> 4. Phí chuyển nhượng (BR-M8-30)</h3>
              <div className={styles.contractGrid2}>
                <label><span>Phí CN (mặc định 200.000đ)</span><input min={0} onChange={(e) => setFee(Number(e.target.value) || 0)} type="number" value={fee} /></label>
                <label>
                  <span>VAT %</span>
                  <select className={styles.selectInput} onChange={(e) => setVatPercent(Number(e.target.value))} value={vatPercent}>
                    {VAT_OPTIONS.map((v) => <option key={v} value={v}>{v}%</option>)}
                  </select>
                </label>
                <label><span>Tổng phải thu</span><input readOnly value={formatCurrency(total)} /></label>
                <label>
                  <span>Phương thức TT</span>
                  <select className={styles.selectInput} onChange={(e) => setPaymentMethod(e.target.value)} value={paymentMethod}>
                    {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </label>
                <label><span>Số tiền thu ngay</span><input min={0} onChange={(e) => setPaidNow(Number(e.target.value) || 0)} type="number" value={paidNow} /></label>
              </div>
            </section>

            <aside className={`${styles.contractSidePanel} ${styles.transferPurplePanel}`}>
              <h4>Thông tin chuyển giao</h4>
              {selected && fromCustomer ? (
                <>
                  <div className={styles.transferOldOwner}>
                    <Users size={14} />
                    <div>
                      <strong>{fromCustomer.name}</strong>
                      <span style={{ display: "block", fontSize: 12, color: "#64748b" }}>{fromCustomer.code} · {fromCustomer.phone}</span>
                    </div>
                  </div>
                  <div className={styles.transferArrowDown}><ArrowDownRight size={20} /></div>
                  <div className={styles.transferNewOwner}>
                    <UserCog size={14} />
                    <div>
                      <strong>{toCustomer?.name ?? "Chưa chọn"}</strong>
                      <span style={{ display: "block", fontSize: 12, color: "#9333ea" }}>{toCustomer?.code} · {toCustomer?.phone}</span>
                    </div>
                  </div>
                  <div className={styles.contractSidePanelRow}><span>HĐ áp dụng</span><strong>{selected.id}</strong></div>
                  <div className={styles.contractSidePanelRow}><span>Buổi còn lại</span><strong>{selected.remainingSessions}/{selected.totalSessions}</strong></div>
                  <div className={styles.contractSidePanelRow}><span>Phí CN</span><strong>{formatCurrency(fee)}</strong></div>
                  <div className={styles.contractSidePanelTotal}><span>Tổng phải thu</span><strong>{formatCurrency(total)}</strong></div>

                  <div className={styles.contractWarningBox} style={{ background: "#faf5ff", borderColor: "#e9d5ff", color: "#6b21a8", marginTop: 8 }}>
                    <ShieldCheck size={14} /> Lưu ý: Quyền lợi nguyên vẹn · Đồng ý 2 bên · CCCD verify · Atomic transfer
                  </div>
                </>
              ) : (
                <p className={styles.contractMutedNote}>Chọn 1 hợp đồng</p>
              )}
            </aside>
          </div>
        </div>

        <footer className={styles.contractFormFooter} style={{ background: "#faf5ff" }}>
          <span>Tổng phí: <strong style={{ color: "#9333ea" }}>{formatCurrency(total)}</strong></span>
          <div>
            <button className={styles.outlineButton} onClick={onClose} type="button">Hủy</button>
            <button className={styles.greenButton} style={{ background: "#9333ea" }} type="submit"><UserCog size={14} /> Gửi yêu cầu CN</button>
          </div>
        </footer>
      </form>
    </div>
  );
}

function TransferDetailModal({
  contracts,
  onClose,
  onPrint,
  transfer,
}: {
  contracts: Contract[];
  onClose: () => void;
  onPrint: () => void;
  transfer: Transfer;
}) {
  const contract = contracts.find((c) => c.id === transfer.contractId);
  const fromC = lookupCustomer(transfer.fromCustomer);
  const toC = lookupCustomer(transfer.toCustomer);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.detailModal}>
        <header className={styles.detailHeader} style={{ background: "#faf5ff" }}>
          <div className={styles.detailIdentity}>
            <span style={{ background: "#9333ea" }}><UserCog size={20} /></span>
            <div>
              <h2>{transfer.id} <TransferStatusBadge status={transfer.status} /></h2>
              <p>{fromC?.name} → {toC?.name} · HĐ {transfer.contractId}</p>
            </div>
          </div>
          <div>
            <button className={styles.outlineButton} onClick={onPrint} type="button"><Printer size={14} /> In</button>
            <button onClick={onClose} type="button"><X size={18} /></button>
          </div>
        </header>
        <div className={styles.detailBody}>
          <article className={styles.detailCard}>
            <h3>Chuyển giao quyền</h3>
            <div className={styles.transferOldOwner}>
              <Users size={14} /> <strong>{fromC?.name}</strong> · {fromC?.phone} · CCCD: {fromC?.cccd}
            </div>
            <div className={styles.transferArrowDown}><ArrowDownRight size={20} /></div>
            <div className={styles.transferNewOwner}>
              <UserCog size={14} /> <strong>{toC?.name}</strong> · {toC?.phone} · CCCD: {toC?.cccd}
            </div>
          </article>
          <article className={styles.detailCard}>
            <h3>Thông tin & thanh toán</h3>
            <div className={styles.detailThree}>
              <Info label="HĐ áp dụng" value={transfer.contractId} />
              <Info label="Ngày CN" value={transfer.effectiveDate} />
              <Info label="Phí CN" value={formatCurrency(transfer.fee)} />
              <Info label="VAT" value={`${transfer.vatPercent}%`} />
              <Info label="Tổng" value={formatCurrency(transfer.total)} />
              <Info label="Đã thu" value={formatCurrency(transfer.paid)} />
              <Info label="NV xử lý" value={transfer.saleStaff} />
              <Info label="Ngày tạo" value={transfer.createdAt} />
            </div>
            {contract ? <p className={styles.contractMutedNote} style={{ marginTop: 10 }}>HĐ còn lại: {contract.remainingSessions}/{contract.totalSessions} buổi · KT: {contract.endDate}</p> : null}
            <p className={styles.contractMutedNote} style={{ marginTop: 6 }}>Lý do: {transfer.reason}</p>
            {transfer.rejectReason ? (
              <div className={styles.contractWarningBox} style={{ marginTop: 10 }}>Lý do từ chối: {transfer.rejectReason}</div>
            ) : null}
          </article>
        </div>
      </div>
    </div>
  );
}

type ConversionTabProps = {
  conversions: Conversion[];
  contracts: Contract[];
  onChangeConversions: (next: Conversion[]) => void;
  onChangeContracts: (next: Contract[]) => void;
  flash: (msg: string) => void;
};

function ConversionTab({ contracts, conversions, flash, onChangeContracts, onChangeConversions }: ConversionTabProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<Conversion | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ kind: "approve" | "reject" | "activate" | "deactivate"; conversion: Conversion } | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<Conversion | null>(null);
  const [printTarget, setPrintTarget] = useState<Conversion | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const totals = {
    total: conversions.length,
    pending: conversions.filter((c) => c.status === "pending_approval").length,
    upgrade: conversions.filter((c) => c.conversionType === "UPGRADE").length,
    downgrade: conversions.filter((c) => c.conversionType === "DOWNGRADE").length,
  };

  const handleSubmit = (conversion: Conversion) => {
    onChangeConversions([conversion, ...conversions]);
    flash(`Đã tạo ${conversion.id} (${conversion.conversionType}) — chờ phê duyệt`);
    setFormOpen(false);
  };

  const updateStatus = (id: string, partial: Partial<Conversion>) => {
    onChangeConversions(conversions.map((c) => (c.id === id ? { ...c, ...partial } : c)));
  };

  const handleApprove = (target: Conversion) => {
    updateStatus(target.id, { status: "approved" });
    flash(`Đã phê duyệt ${target.id}`);
    setConfirmAction(null);
  };

  const handleReject = (target: Conversion, reason?: string) => {
    updateStatus(target.id, { status: "rejected", rejectReason: reason });
    flash(`Đã từ chối ${target.id}`);
    setConfirmAction(null);
  };

  const handleActivate = (target: Conversion) => {
    // BR-M8-66: ATOMIC — đóng HĐ cũ, tạo HĐ mới
    updateStatus(target.id, { status: "activated", newContractId: `${target.oldContractId}-NEW` });
    onChangeContracts(
      contracts.map((c) =>
        c.id === target.oldContractId
          ? {
              ...c,
              status: "converted",
              hasConverted: true,
              history: [
                ...c.history,
                { date: nowString(), actor: "Manager", action: `Kích hoạt chuyển đổi ${target.id}`, detail: `${target.oldPackage} → ${target.newPackage}` },
              ],
            }
          : c
      )
    );
    flash(`Atomic conversion: HĐ cũ ${target.oldContractId}-OLD đã đóng, sinh HĐ mới ${target.oldContractId}-NEW`);
    setConfirmAction(null);
  };

  const handleDeactivate = (target: Conversion, reason?: string) => {
    updateStatus(target.id, { status: "rejected", rejectReason: reason });
    onChangeContracts(
      contracts.map((c) =>
        c.id === target.oldContractId
          ? {
              ...c,
              status: "active",
              hasConverted: false,
              history: [
                ...c.history,
                { date: nowString(), actor: "Admin", action: `Hủy kích hoạt chuyển đổi ${target.id}`, detail: reason ?? "" },
              ],
            }
          : c
      )
    );
    flash(`Đã hủy kích hoạt ${target.id} — tiền KHÔNG hoàn (BR-M8-67)`);
    setConfirmAction(null);
  };

  const handlePayment = (target: Conversion, method: string, paid: number) => {
    const newPaid = target.paid + paid;
    updateStatus(target.id, { paid: newPaid, status: newPaid >= target.total ? "completed" : target.status });
    flash(`Đã thu ${formatCurrency(paid)} qua ${method} cho ${target.id}`);
    setPaymentTarget(null);
  };

  return (
    <>
      <div className={styles.contractToolbar}>
        <div className={styles.pricingSearch}>
          <Search size={18} />
          <input placeholder="Tìm Mã CĐ, HĐ, KH..." />
        </div>
        <button className={styles.greenButton} onClick={() => setFormOpen(true)} style={{ background: "#2563eb" }} type="button">
          <PlusCircle size={16} /> Chuyển đổi HĐ
        </button>
      </div>

      <div className={styles.contractKpi}>
        <KpiCard label="Tổng chuyển đổi" value={String(totals.total)} tone="blue" icon={Layers} />
        <KpiCard label="Chờ phê duyệt" value={String(totals.pending)} tone="amber" icon={Clock} />
        <KpiCard label="UPGRADE" value={String(totals.upgrade)} tone="green" icon={ArrowUpRight} />
        <KpiCard label="DOWNGRADE" value={String(totals.downgrade)} tone="amber" icon={ArrowDownRight} />
      </div>

      <section className={styles.memberTableCard}>
        <div className={styles.memberTableWrap}>
          <table className={styles.memberTable}>
            <thead>
              <tr>
                <th>Mã CĐ</th>
                <th>HĐ cũ → mới</th>
                <th>Khách hàng</th>
                <th>Gói cũ → mới</th>
                <th>Loại</th>
                <th>Phí CĐ / Hoàn</th>
                <th>Tổng tiền / Đã TT</th>
                <th>Trạng thái</th>
                <th>NV Sale</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {conversions.length === 0 ? (
                <tr><td className={styles.emptyTableCell} colSpan={10}>Chưa có yêu cầu chuyển đổi</td></tr>
              ) : null}
              {conversions.map((cv) => {
                const customer = lookupCustomer(cv.customerCode);
                const oldPkg = lookupPackage(cv.oldPackage);
                const newPkg = lookupPackage(cv.newPackage);
                return (
                  <tr key={cv.id}>
                    <td><button className={styles.memberCode} onClick={() => setDetailItem(cv)} type="button">{cv.id}</button></td>
                    <td>
                      <div className={styles.contractMoneyCell}>
                        <strong>{cv.oldContractId}-OLD</strong>
                        {cv.newContractId ? <em className={styles.contractPaid}>→ {cv.newContractId}</em> : <em className={styles.cellMuted}>chưa kích hoạt</em>}
                      </div>
                    </td>
                    <td className={styles.memberName}>
                      <strong>{customer?.name ?? "—"}</strong>
                      <small>{customer?.phone}</small>
                    </td>
                    <td>
                      <span className={styles.contractMutedNote} style={{ fontStyle: "normal" }}>{oldPkg?.name}</span>
                      <ArrowRight size={12} style={{ margin: "0 4px", color: "#2563eb", verticalAlign: "middle" }} />
                      <strong>{newPkg?.name}</strong>
                    </td>
                    <td>
                      {cv.conversionType === "UPGRADE" ? (
                        <span className={styles.conversionUpgrade}><ArrowUpRight size={12} /> UPGRADE</span>
                      ) : (
                        <span className={styles.conversionDowngrade}><ArrowDownRight size={12} /> DOWNGRADE</span>
                      )}
                    </td>
                    <td>
                      {cv.conversionType === "UPGRADE"
                        ? <span>{formatCurrency(cv.fee)}</span>
                        : <span style={{ color: "#9a3412" }}>Hoàn {formatCurrency(cv.refundAmount)}</span>}
                    </td>
                    <td>
                      <div className={styles.contractMoneyCell}>
                        <strong>{formatCurrency(cv.total)}</strong>
                        <em className={cv.paid < cv.total ? styles.dangerText : styles.contractPaid}>
                          {cv.paid < cv.total ? `Còn ${formatCurrency(cv.total - cv.paid)}` : "Đủ"}
                        </em>
                      </div>
                    </td>
                    <td><ConversionStatusBadge status={cv.status} /></td>
                    <td>{cv.saleStaff}</td>
                    <td>
                      <div className={styles.contractRowActions}>
                        <button onClick={() => setDetailItem(cv)} title="Xem" type="button"><Eye size={14} /></button>
                        <div className={styles.contractMenuWrap}>
                          <button onClick={() => setOpenMenuId(openMenuId === cv.id ? null : cv.id)} title="Thao tác" type="button">
                            <MoreVertical size={14} />
                          </button>
                          {openMenuId === cv.id ? (
                            <ConversionActionMenu
                              conversion={cv}
                              onClose={() => setOpenMenuId(null)}
                              onApprove={() => { setOpenMenuId(null); setConfirmAction({ kind: "approve", conversion: cv }); }}
                              onReject={() => { setOpenMenuId(null); setConfirmAction({ kind: "reject", conversion: cv }); }}
                              onActivate={() => { setOpenMenuId(null); setConfirmAction({ kind: "activate", conversion: cv }); }}
                              onDeactivate={() => { setOpenMenuId(null); setConfirmAction({ kind: "deactivate", conversion: cv }); }}
                              onPay={() => { setOpenMenuId(null); setPaymentTarget(cv); }}
                              onPrint={() => { setOpenMenuId(null); setPrintTarget(cv); }}
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
      </section>

      {formOpen ? (
        <ConversionFormModal
          contracts={contracts}
          existing={conversions}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
        />
      ) : null}

      {detailItem ? (
        <ConversionDetailModal
          contracts={contracts}
          conversion={detailItem}
          onClose={() => setDetailItem(null)}
          onPrint={() => { setPrintTarget(detailItem); setDetailItem(null); }}
        />
      ) : null}

      {confirmAction ? (
        <ConfirmDialog
          title={
            confirmAction.kind === "approve"
              ? "Phê duyệt chuyển đổi"
              : confirmAction.kind === "reject"
                ? "Từ chối chuyển đổi"
                : confirmAction.kind === "activate"
                  ? "Kích hoạt chuyển đổi"
                  : "Hủy kích hoạt chuyển đổi"
          }
          description={
            confirmAction.kind === "approve"
              ? `Phê duyệt ${confirmAction.conversion.id}? Sau khi duyệt sẽ mở dialog Kích hoạt (atomic — BR-M8-66).`
              : confirmAction.kind === "reject"
                ? `Từ chối ${confirmAction.conversion.id}?`
                : confirmAction.kind === "activate"
                  ? `Kích hoạt ${confirmAction.conversion.id}? Đóng HĐ cũ (gắn hậu tố -OLD) + tạo HĐ mới (-NEW) trong cùng giao dịch DB.`
                  : `Hủy kích hoạt ${confirmAction.conversion.id}? Tiền đã thu KHÔNG hoàn (BR-M8-67). Yêu cầu nhập lý do.`
          }
          confirmLabel={
            confirmAction.kind === "approve"
              ? "Phê duyệt"
              : confirmAction.kind === "reject"
                ? "Từ chối"
                : confirmAction.kind === "activate"
                  ? "Kích hoạt"
                  : "Hủy kích hoạt"
          }
          tone={
            confirmAction.kind === "approve" || confirmAction.kind === "activate" ? "blue" : "red"
          }
          reasonRequired={confirmAction.kind === "reject" || confirmAction.kind === "deactivate"}
          onCancel={() => setConfirmAction(null)}
          onConfirm={(reason) => {
            if (confirmAction.kind === "approve") handleApprove(confirmAction.conversion);
            if (confirmAction.kind === "reject") handleReject(confirmAction.conversion, reason);
            if (confirmAction.kind === "activate") handleActivate(confirmAction.conversion);
            if (confirmAction.kind === "deactivate") handleDeactivate(confirmAction.conversion, reason);
          }}
        />
      ) : null}

      {paymentTarget ? (
        <PaymentDialog
          amount={paymentTarget.total - paymentTarget.paid}
          title={paymentTarget.conversionType === "UPGRADE"
            ? `Thu phí chuyển đổi ${paymentTarget.id}`
            : `Hoàn tiền chuyển đổi ${paymentTarget.id}`}
          onCancel={() => setPaymentTarget(null)}
          onConfirm={(method, paid) => handlePayment(paymentTarget, method, paid)}
        />
      ) : null}

      {printTarget ? (
        <PrintTemplateDialog
          title={`In phiếu chuyển đổi ${printTarget.id}`}
          onClose={() => setPrintTarget(null)}
          onConfirm={(template) => {
            flash(`Đang in ${printTarget.id} bằng mẫu "${template}"`);
            setPrintTarget(null);
          }}
        />
      ) : null}
    </>
  );
}

function ConversionStatusBadge({ status }: { status: ConversionStatus }) {
  const map: Record<ConversionStatus, { label: string; className: string }> = {
    draft: { label: "Nháp", className: styles.contractApprovalDraft },
    pending_approval: { label: "Chờ phê duyệt", className: styles.contractApprovalPending },
    approved: { label: "Đã phê duyệt", className: styles.contractApprovalApproved },
    rejected: { label: "Từ chối / Hủy", className: styles.contractApprovalRejected },
    activated: { label: "Đã kích hoạt", className: styles.contractApprovalActivated },
    completed: { label: "Hoàn tất", className: styles.contractApprovalCompleted },
  };
  return <span className={map[status].className}>{map[status].label}</span>;
}

function ConversionActionMenu({
  conversion,
  onClose,
  onApprove,
  onReject,
  onActivate,
  onDeactivate,
  onPay,
  onPrint,
}: {
  conversion: Conversion;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onPay: () => void;
  onPrint: () => void;
}) {
  const { menuRef, style } = useContractMenuPosition();
  const items: Array<{ icon: typeof FileText; label: string; onClick: () => void; disabled?: boolean }> = [
    { icon: ThumbsUp, label: "Phê duyệt", onClick: onApprove, disabled: conversion.status !== "pending_approval" },
    { icon: ThumbsDown, label: "Từ chối", onClick: onReject, disabled: conversion.status !== "pending_approval" },
    { icon: Power, label: "Kích hoạt CĐ", onClick: onActivate, disabled: conversion.status !== "approved" },
    { icon: RotateCcw, label: "Hủy kích hoạt", onClick: onDeactivate, disabled: conversion.status !== "activated" },
    { icon: HandCoins, label: conversion.conversionType === "UPGRADE" ? "Thu phí" : "Hoàn tiền", onClick: onPay, disabled: conversion.paid >= conversion.total },
    { icon: Printer, label: "In phiếu", onClick: onPrint },
  ];
  return (
    <>
      <button className={styles.contractMenuBackdrop} onClick={onClose} type="button" />
      <div className={styles.contractActionMenu} ref={menuRef} style={style}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={item.disabled ? styles.contractMenuDisabled : styles.contractMenuItem}
              disabled={item.disabled}
              key={item.label}
              onClick={item.disabled ? undefined : item.onClick}
              type="button"
            >
              <Icon size={14} /> <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function ConversionFormModal({
  contracts,
  existing,
  initialContractId,
  onClose,
  onSubmit,
}: {
  contracts: Contract[];
  existing: Conversion[];
  initialContractId?: string;
  onClose: () => void;
  onSubmit: (conversion: Conversion) => void;
}) {
  const eligible = contracts.filter((c) => c.status === "active" && !c.hasConverted);
  const [contractId, setContractId] = useState<string>(
    eligible.some((c) => c.id === initialContractId) ? initialContractId ?? "" : eligible[0]?.id ?? ""
  );
  const selected = contracts.find((c) => c.id === contractId);
  const customer = selected ? lookupCustomer(selected.customerCode) : undefined;
  const oldPkg = selected ? lookupPackage(selected.packageCode) : undefined;

  // BR-M8-63: loại trừ gói đang dùng
  const newPackageOptions = useMemo(() => {
    if (!oldPkg) return PACKAGE_LIBRARY;
    return PACKAGE_LIBRARY.filter((p) => p.code !== oldPkg.code);
  }, [oldPkg]);
  const [newPackageCode, setNewPackageCode] = useState<string>(newPackageOptions[0]?.code ?? "");
  const newPkg = lookupPackage(newPackageCode);

  // BR-M8-39: GT còn lại HĐ cũ
  const oldRemainingValue = useMemo(() => {
    if (!selected || !oldPkg || oldPkg.sessions === 0) return 0;
    const debt = Math.max(0, selected.totalAmount - selected.paid);
    return Math.max(0, Math.round((oldPkg.price / oldPkg.sessions) * selected.remainingSessions - debt));
  }, [selected, oldPkg]);

  // BR-M8-62: Phí CĐ = Giá_mới − GT_còn_lại + Phí hành chính
  const adminFee = 100_000;
  const rawFee = newPkg ? newPkg.price - oldRemainingValue + adminFee : 0;
  const fee = Math.max(0, rawFee);
  const refundAmount = Math.max(0, -rawFee);
  const conversionType: "UPGRADE" | "DOWNGRADE" = rawFee >= 0 ? "UPGRADE" : "DOWNGRADE";

  const [vatPercent, setVatPercent] = useState<number>(8);
  const [discount, setDiscount] = useState<number>(0);
  const [paidNow, setPaidNow] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS[0]);
  const [reason, setReason] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [effectiveDate, setEffectiveDate] = useState<string>(todayString());

  const total = calcTotalAmount(fee, discount, vatPercent);

  const filteredContracts = eligible.filter((c) => {
    if (!searchQuery) return true;
    const customer = lookupCustomer(c.customerCode);
    return `${c.id} ${customer?.name ?? ""}`.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!selected) {
      setError("Vui lòng chọn HĐ cũ");
      return;
    }
    if (!newPackageCode || newPackageCode === selected.packageCode) {
      setError("Gói mới phải khác gói cũ (BR-M8-64)");
      return;
    }
    if (paidNow > total) {
      setError("Số tiền thu vượt tổng phải thu");
      return;
    }
    if (!reason.trim()) {
      setError("Vui lòng nhập lý do chuyển đổi");
      return;
    }

    const conversion: Conversion = {
      id: nextSeqId(existing, "CD"),
      oldContractId: selected.id,
      customerCode: selected.customerCode,
      oldPackage: selected.packageCode,
      newPackage: newPackageCode,
      conversionType,
      oldRemainingValue,
      newPrice: newPkg?.price ?? 0,
      fee,
      refundAmount,
      vatPercent,
      total,
      paid: paidNow,
      effectiveDate,
      status: "pending_approval",
      createdAt: nowString(),
      saleStaff: selected.saleStaff,
      reason: paidNow > 0 ? `${reason} · PTTT: ${paymentMethod}` : reason,
    };
    onSubmit(conversion);
  };

  return (
    <div className={styles.modalOverlay}>
      <form className={styles.contractFormModal} onSubmit={submit} style={{ width: "min(1100px, 95vw)" }}>
        <header className={styles.contractFormHeader} style={{ background: "#eff6ff", borderBottomColor: "#dbeafe" }}>
          <div>
            <h2 style={{ color: "#1e40af" }}>Chuyển đổi hợp đồng</h2>
            <p>BR-M8-61: 1 lần/đời HĐ · BR-M8-62: Phí CĐ tính realtime · BR-M8-66: Atomic</p>
          </div>
          <button onClick={onClose} type="button"><X size={18} /></button>
        </header>

        <div className={styles.contractFormBody}>
          {error ? <div className={styles.formError}><AlertCircle size={14} /> {error}</div> : null}

          <div className={styles.conversionForm3Col}>
            <article className={styles.conversionFormCol}>
              <h4><FileText size={14} /> Cột 1: KH + DV cũ</h4>
              <div className={styles.pricingSearch}>
                <Search size={14} />
                <input onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tìm Mã HĐ, KH..." value={searchQuery} />
              </div>
              <div className={styles.contractContractList} style={{ maxHeight: 180 }}>
                {filteredContracts.map((c) => {
                  const cust = lookupCustomer(c.customerCode);
                  const p = lookupPackage(c.packageCode);
                  return (
                    <div
                      className={`${styles.contractContractRow} ${contractId === c.id ? styles.contractContractRowSelected : ""}`}
                      key={c.id}
                      onClick={() => setContractId(c.id)}
                    >
                      <input checked={contractId === c.id} readOnly type="radio" />
                      <strong>{c.id}</strong>
                      <span><strong>{cust?.name}</strong></span>
                      <span>{p?.name}</span>
                      <span>{c.remainingSessions}/{c.totalSessions}</span>
                      <span>KT {c.endDate}</span>
                    </div>
                  );
                })}
              </div>
              {selected && customer && oldPkg ? (
                <div className={styles.contractCustomerCard}>
                  <strong>{customer.name} <span className={styles.contractCustomerCode}>{customer.code}</span></strong>
                  <span>HĐ {selected.id} · {selected.startDate} → {selected.endDate}</span>
                  <span>Gói: {oldPkg.name} · {formatCurrency(oldPkg.price)}</span>
                  <span>Buổi còn lại: <strong>{selected.remainingSessions}/{selected.totalSessions}</strong></span>
                  <span>GT còn lại (BR-M8-39): <strong style={{ color: "#15803d" }}>{formatCurrency(oldRemainingValue)}</strong></span>
                </div>
              ) : null}
            </article>

            <article className={styles.conversionFormCol}>
              <h4><Sparkles size={14} /> Cột 2: DV mới</h4>
              <label>
                <span>Gói mới (loại trừ gói cũ — BR-M8-63) <b>*</b></span>
                <select className={styles.selectInput} onChange={(e) => setNewPackageCode(e.target.value)} value={newPackageCode}>
                  {newPackageOptions.map((p) => (
                    <option key={p.code} value={p.code}>{p.code} · {p.name} · {formatCurrency(p.price)}</option>
                  ))}
                </select>
              </label>
              <label><span>Mã HĐ mới (auto)</span><input readOnly value={selected ? `${selected.id}-NEW` : ""} /></label>
              <label><span>Ngày BĐ HĐ mới</span><input onChange={(e) => setEffectiveDate(e.target.value)} placeholder="dd/mm/yyyy" value={effectiveDate} /></label>
              {newPkg ? (
                <div className={styles.contractCustomerCard} style={{ background: "#eff6ff", borderColor: "#dbeafe" }}>
                  <strong style={{ color: "#1e40af" }}>{newPkg.name}</strong>
                  <span>Đơn giá: {formatCurrency(newPkg.price)}</span>
                  <span>Số buổi: {newPkg.sessions} · Thời hạn: {Math.round(newPkg.durationMonths)} tháng</span>
                  <span>Loại: {newPkg.serviceType}</span>
                  <span>
                    Loại CĐ:{" "}
                    {conversionType === "UPGRADE" ? (
                      <span className={styles.conversionUpgrade}><ArrowUpRight size={12} /> UPGRADE</span>
                    ) : (
                      <span className={styles.conversionDowngrade}><ArrowDownRight size={12} /> DOWNGRADE</span>
                    )}
                  </span>
                </div>
              ) : null}
              <label className={styles.fullField}><span>Lý do chuyển đổi <b>*</b></span><textarea onChange={(e) => setReason(e.target.value)} placeholder="VD: Khách muốn đổi từ Practice sang Member..." rows={2} value={reason} /></label>
            </article>

            <article className={styles.conversionFormCol}>
              <h4><Wallet size={14} /> Cột 3: Phí CĐ + Thanh toán</h4>
              <div className={styles.contractTotalsCard}>
                <div><span>Giá gói mới</span><strong>{formatCurrency(newPkg?.price ?? 0)}</strong></div>
                <div><span>− GT còn lại HĐ cũ</span><strong>− {formatCurrency(oldRemainingValue)}</strong></div>
                <div><span>+ Phí hành chính</span><strong>+ {formatCurrency(adminFee)}</strong></div>
                {refundAmount > 0 ? (
                  <div><span>Hoàn tiền (downgrade)</span><strong style={{ color: "#9a3412" }}>{formatCurrency(refundAmount)}</strong></div>
                ) : null}
                <div className={styles.contractTotalRow}>
                  <span>{conversionType === "UPGRADE" ? "Phí CĐ (BR-M8-62)" : "Phí CĐ (downgrade=0)"}</span>
                  <strong>{formatCurrency(fee)}</strong>
                </div>
              </div>

              <div className={styles.contractGrid2} style={{ marginTop: 12 }}>
                <label><span>Giảm giá (VNĐ)</span><input min={0} onChange={(e) => setDiscount(Number(e.target.value) || 0)} type="number" value={discount} /></label>
                <label>
                  <span>VAT %</span>
                  <select className={styles.selectInput} onChange={(e) => setVatPercent(Number(e.target.value))} value={vatPercent}>
                    {VAT_OPTIONS.map((v) => <option key={v} value={v}>{v}%</option>)}
                  </select>
                </label>
                <label><span>Tổng phải thu</span><input readOnly value={formatCurrency(total)} /></label>
                <label>
                  <span>Phương thức TT</span>
                  <select className={styles.selectInput} onChange={(e) => setPaymentMethod(e.target.value)} value={paymentMethod}>
                    {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </label>
                <label><span>Số tiền thu / hoàn ngay</span><input min={0} onChange={(e) => setPaidNow(Number(e.target.value) || 0)} type="number" value={paidNow} /></label>
              </div>
            </article>
          </div>
        </div>

        <footer className={styles.contractFormFooter} style={{ background: "#eff6ff" }}>
          <span>Loại CĐ: {conversionType === "UPGRADE" ? <strong style={{ color: "#15803d" }}>UPGRADE</strong> : <strong style={{ color: "#9a3412" }}>DOWNGRADE</strong>} · Tổng: <strong>{formatCurrency(total)}</strong></span>
          <div>
            <button className={styles.outlineButton} onClick={onClose} type="button">Hủy</button>
            <button className={styles.greenButton} style={{ background: "#2563eb" }} type="submit"><Layers size={14} /> Gửi yêu cầu CĐ</button>
          </div>
        </footer>
      </form>
    </div>
  );
}

function ConversionDetailModal({
  contracts,
  conversion,
  onClose,
  onPrint,
}: {
  contracts: Contract[];
  conversion: Conversion;
  onClose: () => void;
  onPrint: () => void;
}) {
  const customer = lookupCustomer(conversion.customerCode);
  const oldPkg = lookupPackage(conversion.oldPackage);
  const newPkg = lookupPackage(conversion.newPackage);
  const oldContract = contracts.find((c) => c.id === conversion.oldContractId);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.detailModal}>
        <header className={styles.detailHeader} style={{ background: "#eff6ff" }}>
          <div className={styles.detailIdentity}>
            <span style={{ background: "#2563eb" }}><Layers size={20} /></span>
            <div>
              <h2>{conversion.id} <ConversionStatusBadge status={conversion.status} /></h2>
              <p>
                {customer?.name} · {oldPkg?.name} → {newPkg?.name}{" "}
                {conversion.conversionType === "UPGRADE" ? (
                  <span className={styles.conversionUpgrade}><ArrowUpRight size={10} /> UPGRADE</span>
                ) : (
                  <span className={styles.conversionDowngrade}><ArrowDownRight size={10} /> DOWNGRADE</span>
                )}
              </p>
            </div>
          </div>
          <div>
            <button className={styles.outlineButton} onClick={onPrint} type="button"><Printer size={14} /> In</button>
            <button onClick={onClose} type="button"><X size={18} /></button>
          </div>
        </header>
        <div className={styles.detailBody}>
          <article className={styles.detailCard}>
            <h3>So sánh HĐ cũ → mới</h3>
            <div className={styles.contractUpgradeCompare}>
              <article className={`${styles.contractUpgradeBlock} ${styles.contractUpgradeOld}`}>
                <h5>HĐ cũ {conversion.oldContractId}-OLD</h5>
                <strong>{oldPkg?.name}</strong>
                <div><span>Đơn giá</span><span>{formatCurrency(oldPkg?.price ?? 0)}</span></div>
                <div><span>Số buổi cũ</span><span>{oldContract?.totalSessions ?? 0}</span></div>
                <div><span>Buổi còn lại</span><span>{oldContract?.remainingSessions ?? 0}</span></div>
                <div><span>GT còn lại</span><span>{formatCurrency(conversion.oldRemainingValue)}</span></div>
              </article>
              <div className={styles.contractUpgradeArrow}><ArrowRight size={20} /></div>
              <article className={`${styles.contractUpgradeBlock} ${styles.contractUpgradeNew}`}>
                <h5>HĐ mới {conversion.newContractId ?? `${conversion.oldContractId}-NEW (chưa tạo)`}</h5>
                <strong>{newPkg?.name}</strong>
                <div><span>Đơn giá</span><span>{formatCurrency(newPkg?.price ?? 0)}</span></div>
                <div><span>Số buổi mới</span><span>{newPkg?.sessions ?? 0}</span></div>
                <div><span>Phí CĐ</span><span>{formatCurrency(conversion.fee)}</span></div>
                {conversion.refundAmount > 0 ? (
                  <div><span>Hoàn tiền</span><span style={{ color: "#9a3412" }}>{formatCurrency(conversion.refundAmount)}</span></div>
                ) : null}
              </article>
            </div>
          </article>

          <article className={styles.detailCard}>
            <h3>Thanh toán</h3>
            <div className={styles.detailThree}>
              <Info label="Phí CĐ" value={formatCurrency(conversion.fee)} />
              <Info label="Hoàn tiền" value={formatCurrency(conversion.refundAmount)} />
              <Info label="VAT" value={`${conversion.vatPercent}%`} />
              <Info label="Tổng" value={formatCurrency(conversion.total)} />
              <Info label="Đã TT" value={formatCurrency(conversion.paid)} />
              <Info label="Còn nợ" value={formatCurrency(Math.max(0, conversion.total - conversion.paid))} />
              <Info label="Ngày hiệu lực" value={conversion.effectiveDate} />
              <Info label="NV Sale" value={conversion.saleStaff} />
              <Info label="Ngày tạo" value={conversion.createdAt} />
            </div>
            <p className={styles.contractMutedNote} style={{ marginTop: 12 }}>Lý do: {conversion.reason}</p>
            {conversion.rejectReason ? (
              <div className={styles.contractWarningBox} style={{ marginTop: 10 }}>Lý do từ chối / hủy: {conversion.rejectReason}</div>
            ) : null}
          </article>
        </div>
      </div>
    </div>
  );
}


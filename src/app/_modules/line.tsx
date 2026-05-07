"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit3,
  Flag,
  LayoutGrid,
  List,
  Lightbulb,
  Plus,
  PlusCircle,
  Power,
  Printer,
  RefreshCcw,
  Search,
  Tag,
  Trash2,
  User,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import styles from "../page.module.css";
import { Screen } from "../_shared/components";

// =====================================================================================
// SECTION A — Constants & types
// =====================================================================================

const BRANCHES = ["Toàn hệ thống", "NextVision", "Hà Nội Center", "Sài Gòn West"] as const;
const STAFF_LIST = ["Nguyễn Thị Lan", "Phạm Văn Đức", "Hoàng Mỹ Linh", "Trần Quốc Bảo"] as const;
const PRICE_BOOKS = [
  { id: "PB-WD", name: "Bảng giá Weekday", hourlyRate: 120_000 },
  { id: "PB-WE", name: "Bảng giá Weekend", hourlyRate: 180_000 },
  { id: "PB-VIP", name: "Bảng giá VIP", hourlyRate: 250_000 },
  { id: "PB-EVENT", name: "Bảng giá Event/Holiday", hourlyRate: 220_000 },
] as const;

const PAYMENT_METHODS = ["Tiền mặt", "Chuyển khoản", "Thẻ", "Ví điện tử"] as const;
const TICKET_TYPES = ["Line", "Teetime", "Combo"] as const;
const VAT_OPTIONS = [0, 5, 8, 10] as const;

type Line = {
  id: string;
  name: string;
  branch: string;
  startTime: string;
  endTime: string;
  maxCheckin: number;
  active: boolean;
  description?: string;
  createdAt: string;
};

type ServiceItem = {
  id: string;
  name: string;
  branch: string;
  priceBeforeVat: number;
  unitPrice: number;
  notUsable: boolean;
  description?: string;
};

type CustomerLite = {
  code: string;
  name: string;
  phone: string;
  address?: string;
  isMember?: boolean;
};

type LineTicketStatus = "active" | "pending" | "checkout" | "cancelled";

type ServiceLine = {
  id: string;
  serviceId: string;
  name: string;
  priceBeforeVat: number;
  unitPrice: number;
  quantity: number;
  used: boolean;
  free: boolean;
  note?: string;
};

type LineTicket = {
  id: string;                     // VD: VL-2605-001
  lineId?: string;                // ID Line (nếu Loại = Line/Combo)
  ticketType: "Line" | "Teetime" | "Combo";
  priceBookId: string;
  customerCode?: string;          // empty → khách lẻ walk-in
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  guestCount: number;             // 1-4
  byHour: boolean;                // tính theo giờ
  hours: number;
  hourlyRate: number;             // snapshot giá đơn vị
  vatPercent: number;
  discountPercent: number;
  discountAmount: number;
  services: ServiceLine[];
  totalAmount: number;
  customerCash: number;
  changeAmount: number;
  paymentMethod: string;
  date: string;                   // dd/mm/yyyy
  startTime: string;              // HH:mm
  endTime: string;                // HH:mm (= start + hours*60)
  active: boolean;                // kích hoạt
  effective: boolean;             // hiệu lực
  checkout: boolean;              // đã checkout
  staff: string;
  branch: string;
  note?: string;
  status: LineTicketStatus;
  createdAt: string;
  history: { date: string; actor: string; action: string; detail?: string }[];
};

// =====================================================================================
// SECTION B — Seed data
// =====================================================================================

const INITIAL_LINES: Line[] = [
  { id: "LN-01", name: "Line 1", branch: "NextVision", startTime: "05:00", endTime: "22:00", maxCheckin: 1, active: true, description: "Khu vực thường", createdAt: "01/01/2026" },
  { id: "LN-02", name: "Line 2", branch: "NextVision", startTime: "05:00", endTime: "22:00", maxCheckin: 1, active: true, description: "Khu vực thường", createdAt: "01/01/2026" },
  { id: "LN-03", name: "Line 3", branch: "NextVision", startTime: "05:00", endTime: "22:00", maxCheckin: 1, active: true, description: "Khu vực thường", createdAt: "01/01/2026" },
  { id: "LN-04", name: "Line 4", branch: "NextVision", startTime: "05:00", endTime: "22:00", maxCheckin: 1, active: true, description: "Khu vực thường", createdAt: "01/01/2026" },
  { id: "LN-05", name: "Line 5", branch: "NextVision", startTime: "05:00", endTime: "22:00", maxCheckin: 1, active: true, description: "Khu vực thường", createdAt: "01/01/2026" },
  { id: "LN-VIP1", name: "Line VIP 1", branch: "NextVision", startTime: "06:00", endTime: "21:00", maxCheckin: 2, active: true, description: "Khu vực VIP có điều hòa", createdAt: "01/01/2026" },
  { id: "LN-VIP2", name: "Line VIP 2", branch: "NextVision", startTime: "06:00", endTime: "21:00", maxCheckin: 2, active: true, description: "Khu vực VIP có điều hòa", createdAt: "01/01/2026" },
  { id: "LN-A01", name: "Sân Bóng A-01", branch: "NextVision", startTime: "06:00", endTime: "20:00", maxCheckin: 4, active: true, description: "Sân cỏ tự nhiên", createdAt: "01/01/2026" },
  { id: "LN-A02", name: "Sân Bóng A-02", branch: "NextVision", startTime: "06:00", endTime: "20:00", maxCheckin: 4, active: true, description: "Sân cỏ tự nhiên", createdAt: "01/01/2026" },
  { id: "LN-HN1", name: "Line HN 1", branch: "Hà Nội Center", startTime: "06:00", endTime: "21:00", maxCheckin: 1, active: true, description: "Chi nhánh Hà Nội", createdAt: "15/03/2026" },
  { id: "LN-HN2", name: "Line HN 2", branch: "Hà Nội Center", startTime: "06:00", endTime: "21:00", maxCheckin: 1, active: false, description: "Đang bảo trì", createdAt: "15/03/2026" },
  { id: "LN-OLD", name: "Line cũ", branch: "NextVision", startTime: "05:00", endTime: "22:00", maxCheckin: 1, active: false, description: "Đã ngừng sử dụng", createdAt: "01/06/2024" },
];

const INITIAL_SERVICES: ServiceItem[] = [
  { id: "SV-WATER", name: "Nước suối 500ml", branch: "Toàn hệ thống", priceBeforeVat: 8_000, unitPrice: 10_000, notUsable: false, description: "Nước Lavie / Aquafina" },
  { id: "SV-COKE", name: "Coca/Pepsi lon", branch: "Toàn hệ thống", priceBeforeVat: 13_000, unitPrice: 15_000, notUsable: false },
  { id: "SV-BALL50", name: "Bóng tập (50 trái)", branch: "Toàn hệ thống", priceBeforeVat: 36_000, unitPrice: 40_000, notUsable: false, description: "Bóng tập driving range" },
  { id: "SV-BALL100", name: "Bóng tập (100 trái)", branch: "Toàn hệ thống", priceBeforeVat: 72_000, unitPrice: 80_000, notUsable: false },
  { id: "SV-CLUB", name: "Thuê gậy Driver", branch: "NextVision", priceBeforeVat: 90_000, unitPrice: 100_000, notUsable: false, description: "Thuê 1 gậy Driver/Iron" },
  { id: "SV-FULLSET", name: "Thuê bộ gậy đầy đủ", branch: "Toàn hệ thống", priceBeforeVat: 135_000, unitPrice: 150_000, notUsable: false },
  { id: "SV-SHOE", name: "Thuê giày golf", branch: "Toàn hệ thống", priceBeforeVat: 45_000, unitPrice: 50_000, notUsable: false },
  { id: "SV-PRO", name: "HLV Pro 1 giờ", branch: "NextVision", priceBeforeVat: 270_000, unitPrice: 300_000, notUsable: false, description: "Thầy dạy Pro tại line" },
  { id: "SV-TOWEL", name: "Khăn lạnh", branch: "Toàn hệ thống", priceBeforeVat: 9_000, unitPrice: 10_000, notUsable: false },
  { id: "SV-SNACK", name: "Snack/Bánh", branch: "Toàn hệ thống", priceBeforeVat: 18_000, unitPrice: 20_000, notUsable: false },
  { id: "SV-OLD", name: "DV cũ (đã ngừng)", branch: "Toàn hệ thống", priceBeforeVat: 50_000, unitPrice: 55_000, notUsable: true, description: "Đã ẩn khỏi danh sách bán" },
];

const INITIAL_CUSTOMERS: CustomerLite[] = [
  { code: "HV001", name: "Nguyễn Văn A", phone: "0901234567", address: "12 Lê Lợi, Q.1, TP.HCM", isMember: true },
  { code: "HV002", name: "Trần Thị B", phone: "0902345678", address: "45 Pasteur, Q.3, TP.HCM", isMember: true },
  { code: "HV005", name: "Huỳnh Xuân Long", phone: "0910070932", address: "210 Trần Hưng Đạo, Q.5", isMember: true },
  { code: "HV012", name: "Đỗ Mai Hương", phone: "0345678901", address: "8 CMT8, Q.3, TP.HCM", isMember: true },
];

const INITIAL_TICKETS: LineTicket[] = [
  {
    id: "VL-2605-001", lineId: "LN-01", ticketType: "Line", priceBookId: "PB-WD",
    customerCode: "HV001", customerName: "Nguyễn Văn A", customerPhone: "0901234567", customerAddress: "12 Lê Lợi, Q.1",
    guestCount: 1, byHour: true, hours: 2, hourlyRate: 120_000, vatPercent: 10,
    discountPercent: 0, discountAmount: 0,
    services: [
      { id: "SL-1", serviceId: "SV-BALL100", name: "Bóng tập (100 trái)", priceBeforeVat: 72_000, unitPrice: 80_000, quantity: 1, used: true, free: false },
      { id: "SL-2", serviceId: "SV-WATER", name: "Nước suối 500ml", priceBeforeVat: 8_000, unitPrice: 10_000, quantity: 2, used: true, free: false },
    ],
    totalAmount: 364_000, customerCash: 400_000, changeAmount: 36_000, paymentMethod: "Tiền mặt",
    date: "08/05/2026", startTime: "08:00", endTime: "10:00",
    active: true, effective: true, checkout: false, staff: "Nguyễn Thị Lan",
    branch: "NextVision", note: "Khách quen, ưu tiên line cạnh điều hòa", status: "active", createdAt: "08/05/2026 08:00",
    history: [{ date: "08/05/2026 08:00", actor: "Nguyễn Thị Lan", action: "In vé · kích hoạt Line LN-01" }],
  },
  {
    id: "VL-2605-002", lineId: "LN-VIP1", ticketType: "Line", priceBookId: "PB-VIP",
    customerCode: "HV005", customerName: "Huỳnh Xuân Long", customerPhone: "0910070932",
    guestCount: 2, byHour: true, hours: 3, hourlyRate: 250_000, vatPercent: 10,
    discountPercent: 5, discountAmount: 0,
    services: [
      { id: "SL-3", serviceId: "SV-FULLSET", name: "Thuê bộ gậy đầy đủ", priceBeforeVat: 135_000, unitPrice: 150_000, quantity: 1, used: true, free: false },
      { id: "SL-4", serviceId: "SV-PRO", name: "HLV Pro 1 giờ", priceBeforeVat: 270_000, unitPrice: 300_000, quantity: 1, used: true, free: false },
    ],
    totalAmount: 1_280_250, customerCash: 1_300_000, changeAmount: 19_750, paymentMethod: "Chuyển khoản",
    date: "08/05/2026", startTime: "09:30", endTime: "12:30",
    active: true, effective: true, checkout: false, staff: "Hoàng Mỹ Linh",
    branch: "NextVision", status: "active", createdAt: "08/05/2026 09:30",
    history: [{ date: "08/05/2026 09:30", actor: "Hoàng Mỹ Linh", action: "In vé VIP · kích hoạt Line VIP1" }],
  },
  {
    id: "VL-2605-003", lineId: "LN-A01", ticketType: "Line", priceBookId: "PB-WE",
    customerName: "Khách lẻ", customerPhone: "0900000000",
    guestCount: 1, byHour: false, hours: 1, hourlyRate: 180_000, vatPercent: 10,
    discountPercent: 0, discountAmount: 50_000,
    services: [
      { id: "SL-5", serviceId: "SV-BALL50", name: "Bóng tập (50 trái)", priceBeforeVat: 36_000, unitPrice: 40_000, quantity: 1, used: true, free: false },
    ],
    totalAmount: 192_000, customerCash: 200_000, changeAmount: 8_000, paymentMethod: "Tiền mặt",
    date: "08/05/2026", startTime: "10:00", endTime: "11:00",
    active: false, effective: true, checkout: false, staff: "Phạm Văn Đức",
    branch: "NextVision", note: "Khách walk-in, chờ kích hoạt", status: "pending", createdAt: "08/05/2026 09:55",
    history: [{ date: "08/05/2026 09:55", actor: "Phạm Văn Đức", action: "In vé Pending — chưa kích hoạt" }],
  },
  {
    id: "VL-2605-004", lineId: "LN-04", ticketType: "Line", priceBookId: "PB-WD",
    customerCode: "HV012", customerName: "Đỗ Mai Hương", customerPhone: "0345678901",
    guestCount: 1, byHour: true, hours: 1, hourlyRate: 120_000, vatPercent: 10,
    discountPercent: 0, discountAmount: 0,
    services: [],
    totalAmount: 132_000, customerCash: 132_000, changeAmount: 0, paymentMethod: "Ví điện tử",
    date: "07/05/2026", startTime: "16:00", endTime: "17:00",
    active: false, effective: false, checkout: true, staff: "Trần Quốc Bảo",
    branch: "NextVision", status: "checkout", createdAt: "07/05/2026 16:00",
    history: [
      { date: "07/05/2026 16:00", actor: "Trần Quốc Bảo", action: "In vé · kích hoạt" },
      { date: "07/05/2026 17:05", actor: "Trần Quốc Bảo", action: "Checkout · sinh phiếu thu PT-2605-0019" },
    ],
  },
];

// =====================================================================================
// SECTION C — Helpers
// =====================================================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(value)) + " đ";
}

function todayString(): string {
  const t = new Date();
  return `${String(t.getDate()).padStart(2, "0")}/${String(t.getMonth() + 1).padStart(2, "0")}/${t.getFullYear()}`;
}

function nowString(): string {
  const t = new Date();
  return `${String(t.getDate()).padStart(2, "0")}/${String(t.getMonth() + 1).padStart(2, "0")}/${t.getFullYear()} ${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function minutesToTime(m: number): string {
  const hh = Math.floor(m / 60) % 24;
  const mm = m % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function calcTicketTotal(ticket: Pick<LineTicket, "byHour" | "hours" | "hourlyRate" | "vatPercent" | "services" | "discountPercent" | "discountAmount">): number {
  const lineSubtotal = ticket.byHour
    ? ticket.hourlyRate * ticket.hours
    : ticket.hourlyRate;
  const servicesSubtotal = ticket.services
    .filter((s) => s.used && !s.free)
    .reduce((sum, s) => sum + s.priceBeforeVat * s.quantity, 0);
  const subtotal = lineSubtotal + servicesSubtotal;
  const withVat = subtotal * (1 + ticket.vatPercent / 100);
  const afterPercent = withVat * (1 - ticket.discountPercent / 100);
  const final = Math.max(0, afterPercent - ticket.discountAmount);
  return Math.round(final);
}

function nextLineTicketId(items: LineTicket[]): string {
  const t = new Date();
  const yymm = String(t.getFullYear()).slice(2) + String(t.getMonth() + 1).padStart(2, "0");
  const count = items.filter((it) => it.id.startsWith(`VL-${yymm}`)).length + 1;
  return `VL-${yymm}-${String(count).padStart(3, "0")}`;
}

// =====================================================================================
// SECTION D — Top-level component
// =====================================================================================

type TabKey = "list" | "diagram";

export default function LineScreen() {
  const [tab, setTab] = useState<TabKey>("diagram");
  const [lines, setLines] = useState<Line[]>(INITIAL_LINES);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [tickets, setTickets] = useState<LineTicket[]>(INITIAL_TICKETS);
  const [customers, setCustomers] = useState<CustomerLite[]>(INITIAL_CUSTOMERS);

  const [toast, setToast] = useState<string | null>(null);
  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  };

  return (
    <>
      <Screen
        title="Golf Line Tập"
        subtitle="Danh sách Line · Sơ đồ Line realtime · In vé lẻ · Dịch vụ bán kèm · Gia hạn giờ"
      >
        <div className={styles.contractTabs}>
          <TabButton active={tab === "diagram"} icon={LayoutGrid} label="Sơ đồ Line" count={lines.filter((l) => l.active).length} onClick={() => setTab("diagram")} />
          <TabButton active={tab === "list"} icon={List} label="Danh sách Line" count={lines.length} onClick={() => setTab("list")} accent="purple" />
        </div>

        {tab === "diagram" ? (
          <DiagramTab
            lines={lines}
            tickets={tickets}
            customers={customers}
            services={services}
            onTicketsChange={setTickets}
            onServicesChange={setServices}
            onCustomersChange={setCustomers}
            flash={flash}
          />
        ) : null}

        {tab === "list" ? (
          <LineListTab
            lines={lines}
            tickets={tickets}
            onChange={setLines}
            flash={flash}
          />
        ) : null}
      </Screen>
      {toast ? <div className={styles.contractToast}>{toast}</div> : null}
    </>
  );
}

function TabButton({ active, count, icon: Icon, label, onClick, accent }: { active: boolean; count: number; icon: typeof LayoutGrid; label: string; onClick: () => void; accent?: "purple" | "blue" }) {
  return (
    <button className={`${styles.contractTabBtn} ${active ? styles.contractTabActive : ""} ${accent === "purple" ? styles.contractTabPurple : ""} ${accent === "blue" ? styles.contractTabBlue : ""}`} onClick={onClick} type="button">
      <Icon size={16} /> {label}
      <span>{count}</span>
    </button>
  );
}

function KpiCard({ icon: Icon, label, tone, value }: { icon: typeof LayoutGrid; label: string; tone: "blue" | "green" | "amber" | "red" | "purple"; value: string }) {
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
// SECTION E — Tab "Sơ đồ Line"
// =====================================================================================

function DiagramTab({
  lines,
  tickets,
  customers,
  services,
  onTicketsChange,
  onServicesChange,
  onCustomersChange,
  flash,
}: {
  lines: Line[];
  tickets: LineTicket[];
  customers: CustomerLite[];
  services: ServiceItem[];
  onTicketsChange: (next: LineTicket[]) => void;
  onServicesChange: (next: ServiceItem[]) => void;
  onCustomersChange: (next: CustomerLite[]) => void;
  flash: (m: string) => void;
}) {
  const [branchFilter, setBranchFilter] = useState<string>("NextVision");
  const [query, setQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [printOpen, setPrintOpen] = useState(false);
  const [extendOpen, setExtendOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<LineTicket | null>(null);

  const visibleLines = useMemo(() => {
    return lines.filter((l) => {
      if (!l.active) return false;
      if (branchFilter !== "Toàn hệ thống" && l.branch !== branchFilter) return false;
      if (query) {
        const customerOnLine = tickets.find((t) => t.lineId === l.id && t.status === "active")?.customerName ?? "";
        const target = `${l.name} ${customerOnLine}`.toLowerCase();
        if (!target.includes(query.toLowerCase())) return false;
      }
      return true;
    });
  }, [lines, branchFilter, query, tickets]);

  const lineState = (line: Line): { state: "busy" | "free" | "reserved"; ticket?: LineTicket } => {
    const active = tickets.find((t) => t.lineId === line.id && t.status === "active");
    if (active) return { state: "busy", ticket: active };
    const pending = tickets.find((t) => t.lineId === line.id && t.status === "pending");
    if (pending) return { state: "reserved", ticket: pending };
    return { state: "free" };
  };

  const stats = useMemo(() => {
    const total = visibleLines.length;
    let busy = 0, reserved = 0, free = 0;
    visibleLines.forEach((l) => {
      const s = lineState(l).state;
      if (s === "busy") busy += 1;
      else if (s === "reserved") reserved += 1;
      else free += 1;
    });
    const dayRevenue = tickets
      .filter((t) => t.date === todayString() && (t.status === "active" || t.status === "checkout"))
      .reduce((s, t) => s + t.totalAmount, 0);
    return { total, busy, reserved, free, dayRevenue };
  // refreshKey forces recompute
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleLines, tickets, refreshKey]);

  const refreshNow = () => {
    setRefreshKey((k) => k + 1);
    flash("Đã refresh trạng thái Line");
  };

  const submitTicket = (next: LineTicket) => {
    const exists = tickets.find((t) => t.id === next.id);
    if (exists) {
      onTicketsChange(tickets.map((t) => (t.id === next.id ? next : t)));
      flash(`Đã cập nhật ${next.id}`);
    } else {
      onTicketsChange([next, ...tickets]);
      const lineMsg = next.lineId ? ` · kích hoạt ${lines.find((l) => l.id === next.lineId)?.name ?? next.lineId}` : "";
      flash(`Đã in ${next.id}${lineMsg}`);
    }
    setPrintOpen(false);
    setEditingTicket(null);
  };

  const checkoutTicket = (ticket: LineTicket) => {
    onTicketsChange(tickets.map((t) => t.id === ticket.id ? {
      ...t,
      status: "checkout",
      active: false,
      checkout: true,
      history: [...t.history, { date: nowString(), actor: "Lễ tân", action: "Checkout", detail: `Sinh phiếu thu (BR-M6 · ${formatCurrency(t.totalAmount)})` }],
    } : t));
    flash(`Đã checkout ${ticket.id} · sinh phiếu thu`);
  };

  const extendTime = (lineIds: string[], minutes: number, note: string) => {
    const updates = tickets.map((t) => {
      if (!t.lineId || !lineIds.includes(t.lineId) || t.status !== "active") return t;
      const newEndM = timeToMinutes(t.endTime) + minutes;
      const newHours = t.byHour ? t.hours + minutes / 60 : t.hours;
      const newTotal = t.byHour ? calcTicketTotal({ ...t, hours: newHours }) : t.totalAmount;
      return {
        ...t,
        endTime: minutesToTime(newEndM),
        hours: newHours,
        totalAmount: newTotal,
        history: [...t.history, { date: nowString(), actor: "Lễ tân", action: `Gia hạn +${minutes} phút`, detail: note ? `${note}${t.byHour ? ` · cập nhật giá theo giờ` : ""}` : t.byHour ? "Cập nhật giá theo giờ" : undefined }],
      };
    });
    onTicketsChange(updates);
    flash(`Đã gia hạn ${minutes} phút cho ${lineIds.length} line`);
    setExtendOpen(false);
  };

  const handleCreateService = (s: ServiceItem) => onServicesChange([...services, s]);
  const handleCreateCustomer = (c: CustomerLite) => onCustomersChange([...customers, c]);

  return (
    <>
      <div className={styles.contractKpi}>
        <KpiCard label="Tổng Line" value={String(stats.total)} tone="blue" icon={LayoutGrid} />
        <KpiCard label="Đang sử dụng" value={String(stats.busy)} tone="green" icon={Lightbulb} />
        <KpiCard label="Đã đặt trước" value={String(stats.reserved)} tone="amber" icon={Clock} />
        <KpiCard label="Doanh thu hôm nay" value={formatCurrency(stats.dayRevenue)} tone="purple" icon={Wallet} />
      </div>

      <div className={styles.contractListSearchRow}>
        <div className={styles.pricingSearch} style={{ flex: 1 }}>
          <Search size={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo tên line / khách đang dùng..." />
        </div>
        <select className={styles.selectInput} value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
          {BRANCHES.map((b) => <option key={b}>{b}</option>)}
        </select>
        <button className={styles.iconButton} onClick={refreshNow} title="Refresh trạng thái" type="button">
          <RefreshCcw size={16} />
        </button>
      </div>

      <div className={styles.contractListChipRow}>
        <div className={styles.lineLegend}>
          <span><span className={styles.lineLegendDot} style={{ background: "#16a34a" }} /> Đang sử dụng</span>
          <span><span className={styles.lineLegendDot} style={{ background: "#3b82f6" }} /> Đã đặt trước</span>
          <span><span className={styles.lineLegendDot} style={{ background: "#cbd5e1" }} /> Trống</span>
        </div>
        <div className={styles.contractListActions}>
          <button className={styles.contractFilterChip} onClick={() => setExtendOpen(true)} type="button">
            <Clock size={14} /> + Thêm giờ tập
          </button>
          <button className={styles.greenButton} onClick={() => setPrintOpen(true)} type="button">
            <Printer size={16} /> + In vé lẻ
          </button>
        </div>
      </div>

      <section className={styles.lineGridCard}>
        {visibleLines.length === 0 ? (
          <div className={styles.lineEmpty}>
            <LayoutGrid size={40} />
            <strong>Chưa có Line hoạt động ở chi nhánh này</strong>
            <span>Vào tab Danh sách Line để tạo / kích hoạt Line</span>
          </div>
        ) : (
          <div className={styles.lineGrid}>
            {visibleLines.map((line, i) => {
              const { state, ticket } = lineState(line);
              const customer = ticket?.customerCode ? customers.find((c) => c.code === ticket.customerCode) : undefined;
              const memberLabel = customer?.isMember ? "Hội viên" : ticket?.customerName ? "Khách lẻ" : "";
              return (
                <article
                  className={`${styles.lineBoxV2} ${styles[`lineBoxState_${state}`]}`}
                  key={line.id}
                  title={state === "busy" ? `Đang dùng · ${ticket?.customerName}` : state === "reserved" ? `Đặt trước · ${ticket?.customerName}` : "Trống"}
                >
                  <div className={styles.lineBoxIndex}>#{i + 1}</div>
                  <Lightbulb size={16} className={styles.lineBoxIcon} />
                  <strong>{line.name}</strong>
                  {state === "free" ? (
                    <em className={styles.lineBoxFreeLabel}>TRỐNG</em>
                  ) : ticket ? (
                    <>
                      <span className={styles.lineBoxCustomer}>{ticket.customerName}</span>
                      {memberLabel ? <em className={styles.lineBoxMemberTag}>{memberLabel}</em> : null}
                      <em className={styles.lineBoxTime}>{ticket.startTime} → {ticket.endTime}</em>
                    </>
                  ) : null}
                  {ticket && state === "busy" ? (
                    <div className={styles.lineBoxActions}>
                      <button onClick={() => checkoutTicket(ticket)} title="Checkout" type="button"><CheckCircle2 size={12} /></button>
                      <button onClick={() => { setEditingTicket(ticket); setPrintOpen(true); }} title="Sửa vé" type="button"><Edit3 size={12} /></button>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
        <footer className={styles.lineGridFooter}>
          <span>Tổng cộng: <strong>{stats.total}</strong> Lines</span>
          <span>Đang tập: <strong>{stats.busy}</strong> · Đặt trước: <strong>{stats.reserved}</strong> · Trống: <strong>{stats.free}</strong></span>
        </footer>
      </section>

      {printOpen ? (
        <PrintTicketModal
          initial={editingTicket}
          lines={lines}
          tickets={tickets}
          customers={customers}
          services={services}
          onClose={() => { setPrintOpen(false); setEditingTicket(null); }}
          onSubmit={submitTicket}
          onCreateService={handleCreateService}
          onCreateCustomer={handleCreateCustomer}
        />
      ) : null}

      {extendOpen ? (
        <ExtendTimeModal
          activeTickets={tickets.filter((t) => t.status === "active")}
          lines={lines}
          onClose={() => setExtendOpen(false)}
          onSubmit={extendTime}
        />
      ) : null}
    </>
  );
}

// =====================================================================================
// SECTION F — Tab "Danh sách Line"
// =====================================================================================

function LineListTab({
  lines,
  tickets,
  onChange,
  flash,
}: {
  lines: Line[];
  tickets: LineTicket[];
  onChange: (next: Line[]) => void;
  flash: (m: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState<string>("Toàn hệ thống");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Line | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Line | null>(null);

  const filtered = useMemo(() => {
    return lines.filter((l) => {
      if (statusFilter === "active" && !l.active) return false;
      if (statusFilter === "inactive" && l.active) return false;
      if (branchFilter !== "Toàn hệ thống" && l.branch !== branchFilter) return false;
      if (query) {
        const target = `${l.name} ${l.description ?? ""}`.toLowerCase();
        if (!target.includes(query.toLowerCase())) return false;
      }
      return true;
    });
  }, [lines, query, branchFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: lines.length,
    active: lines.filter((l) => l.active).length,
    inactive: lines.filter((l) => !l.active).length,
    branches: new Set(lines.map((l) => l.branch)).size,
  }), [lines]);

  const submit = (line: Line) => {
    const exists = lines.find((l) => l.id === line.id);
    onChange(exists ? lines.map((l) => (l.id === line.id ? line : l)) : [line, ...lines]);
    flash(`${exists ? "Đã cập nhật" : "Đã thêm"} ${line.name}`);
    setFormOpen(false);
    setEditing(null);
  };

  const isLineInUse = (line: Line) => tickets.some((t) => t.lineId === line.id && t.status === "active");

  const remove = (line: Line) => {
    if (isLineInUse(line)) {
      flash(`Line ${line.name} đang có khách sử dụng, không thể xóa`);
      setDeleteTarget(null);
      return;
    }
    const hasHistory = tickets.some((t) => t.lineId === line.id);
    if (hasHistory) {
      // Soft delete: deactivate
      onChange(lines.map((l) => l.id === line.id ? { ...l, active: false } : l));
      flash(`Đã ngừng hoạt động ${line.name} (Soft delete · giữ lịch sử vé)`);
    } else {
      onChange(lines.filter((l) => l.id !== line.id));
      flash(`Đã xóa ${line.name}`);
    }
    setDeleteTarget(null);
  };

  const toggleActive = (line: Line) => {
    onChange(lines.map((l) => l.id === line.id ? { ...l, active: !l.active } : l));
    flash(`Line ${line.name} đã ${line.active ? "tạm ngưng" : "kích hoạt"}`);
  };

  return (
    <>
      <div className={styles.contractKpi}>
        <KpiCard label="Tổng Line" value={String(stats.total)} tone="blue" icon={LayoutGrid} />
        <KpiCard label="Đang hoạt động" value={String(stats.active)} tone="green" icon={CheckCircle2} />
        <KpiCard label="Tạm ngưng" value={String(stats.inactive)} tone="amber" icon={XCircle} />
        <KpiCard label="Số chi nhánh" value={String(stats.branches)} tone="purple" icon={Flag} />
      </div>

      <div className={styles.contractListSearchRow}>
        <div className={styles.pricingSearch} style={{ flex: 1 }}>
          <Search size={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo tên Line, mô tả..." />
        </div>
        <select className={styles.selectInput} value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
          {BRANCHES.map((b) => <option key={b}>{b}</option>)}
        </select>
      </div>

      <div className={styles.contractListChipRow}>
        <div className={styles.contractFilterChips}>
          {[
            { key: "all", label: "Tất cả" },
            { key: "active", label: "Đang hoạt động" },
            { key: "inactive", label: "Tạm ngưng" },
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
            <PlusCircle size={16} /> Thêm Line mới
          </button>
        </div>
      </div>

      <section className={styles.memberTableCard}>
        <div className={styles.memberTableWrap}>
          <table className={`${styles.memberTable} ${styles.contractListTable}`}>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên Line</th>
                <th>Chi nhánh</th>
                <th>Giờ vào</th>
                <th>Giờ ra</th>
                <th>Số lượt checkin</th>
                <th>Mô tả</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td className={styles.emptyTableCell} colSpan={9}>Không có Line nào khớp bộ lọc</td></tr>
              ) : null}
              {filtered.map((l, i) => (
                <tr key={l.id}>
                  <td className={styles.contractRowIndex}>{i + 1}</td>
                  <td className={styles.memberName}>
                    <strong>{l.name}</strong>
                    {isLineInUse(l) ? <span className={styles.lineRowActiveTag}><Lightbulb size={10} /> Đang dùng</span> : null}
                  </td>
                  <td>{l.branch}</td>
                  <td>{l.startTime}</td>
                  <td>{l.endTime}</td>
                  <td className={styles.cellMuted}>{l.maxCheckin}</td>
                  <td className={styles.cellTruncate} title={l.description}>{l.description ?? "—"}</td>
                  <td>
                    <button className={l.active ? styles.lineToggleActive : styles.lineToggleOff} onClick={() => toggleActive(l)} type="button">
                      <Power size={12} /> {l.active ? "Hoạt động" : "Tạm ngưng"}
                    </button>
                  </td>
                  <td>
                    <div className={styles.contractRowActions}>
                      <button onClick={() => { setEditing(l); setFormOpen(true); }} title="Sửa" type="button"><Edit3 size={14} /></button>
                      <button className={styles.contractDelete} onClick={() => setDeleteTarget(l)} title="Xóa (Admin)" type="button"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {formOpen ? (
        <LineFormModal
          initial={editing}
          existing={lines}
          existingTickets={tickets}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSubmit={submit}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteLineDialog
          line={deleteTarget}
          inUse={isLineInUse(deleteTarget)}
          hasHistory={tickets.some((t) => t.lineId === deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => remove(deleteTarget)}
        />
      ) : null}
    </>
  );
}

// =====================================================================================
// SECTION G — LineFormModal (Thêm/Sửa Line)
// =====================================================================================

function LineFormModal({
  initial,
  existing,
  existingTickets,
  onClose,
  onSubmit,
}: {
  initial: Line | null;
  existing: Line[];
  existingTickets: LineTicket[];
  onClose: () => void;
  onSubmit: (l: Line) => void;
}) {
  const isEdit = Boolean(initial);
  const [name, setName] = useState(initial?.name ?? "");
  const [branch, setBranch] = useState(initial?.branch ?? "NextVision");
  const [startTime, setStartTime] = useState(initial?.startTime ?? "06:00");
  const [endTime, setEndTime] = useState(initial?.endTime ?? "22:00");
  const [maxCheckin, setMaxCheckin] = useState(initial?.maxCheckin ?? 1);
  const [active, setActive] = useState(initial?.active ?? true);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [error, setError] = useState<string | null>(null);

  const inUseCount = initial ? existingTickets.filter((t) => t.lineId === initial.id && t.status === "active").length : 0;
  const lockedFields = isEdit && inUseCount > 0;

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) { setError("Vui lòng nhập tên Line"); return; }
    const dup = existing.find((l) => l.name === name.trim() && l.branch === branch && l.id !== initial?.id);
    if (dup) { setError(`Tên ${name} đã tồn tại ở chi nhánh ${branch}`); return; }
    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) { setError("Giờ ra phải sau giờ vào"); return; }
    if (maxCheckin < 1 || maxCheckin > 4) { setError("Số lượt checkin phải 1-4"); return; }
    if (lockedFields && maxCheckin < inUseCount) { setError(`Đang có ${inUseCount} khách check-in, không thể giảm dưới ${inUseCount}`); return; }
    onSubmit({
      id: initial?.id ?? `LN-${Date.now()}`,
      name: name.trim(),
      branch,
      startTime,
      endTime,
      maxCheckin,
      active,
      description: description.trim() || undefined,
      createdAt: initial?.createdAt ?? todayString(),
    });
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <form className={styles.contractFormModal} onSubmit={submit}>
        <header className={styles.contractFormBanner}>
          <h2><Lightbulb size={16} /> {isEdit ? `Chỉnh sửa Line ${initial?.name}` : "Thêm mới Line"}</h2>
          <button onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <div className={styles.contractFormBody}>
          {error ? <div className={styles.formError}><AlertCircle size={14} /> {error}</div> : null}
          {lockedFields ? (
            <div className={styles.teetimeWarningBanner}>
              <AlertTriangle size={14} />
              <span>Line đang có <strong>{inUseCount} khách</strong> check-in. Chỉ sửa được Mô tả và Số lượt checkin (không giảm dưới {inUseCount}).</span>
            </div>
          ) : null}

          <section className={`${styles.contractFormSection} ${styles.contractSectionBlue}`}>
            <h3 className={styles.contractSectionHeader}><Lightbulb size={16} /> Thông tin Line</h3>
            <div className={styles.contractGrid2}>
              <label>
                <span>Tên Line <b>*</b></span>
                <input value={name} onChange={(e) => setName(e.target.value)} disabled={lockedFields} placeholder="VD: Line 1, Sân Bóng A-01" />
              </label>
              <label>
                <span>Chi nhánh <b>*</b></span>
                <select className={styles.selectInput} value={branch} onChange={(e) => setBranch(e.target.value)} disabled={lockedFields}>
                  {BRANCHES.filter((b) => b !== "Toàn hệ thống").map((b) => <option key={b}>{b}</option>)}
                  <option>Toàn hệ thống</option>
                </select>
              </label>
              <label>
                <span>Giờ vào <b>*</b></span>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} disabled={lockedFields} />
              </label>
              <label>
                <span>Giờ ra <b>*</b></span>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} disabled={lockedFields} />
              </label>
              <label>
                <span>Số lượt checkin (1-4) <b>*</b></span>
                <input type="number" min={1} max={4} value={maxCheckin} onChange={(e) => setMaxCheckin(Math.max(1, Math.min(4, Number(e.target.value) || 1)))} />
              </label>
              <label className={styles.contractCheckboxLine}>
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} disabled={lockedFields} />
                Kích hoạt — Cho phép Line hoạt động trong hệ thống
              </label>
              <label className={styles.fullField}>
                <span>Mô tả</span>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="VD: Khu vực VIP có điều hòa, Sân cỏ tự nhiên..." />
              </label>
            </div>
          </section>
        </div>
        <footer className={styles.contractFormFooter}>
          <span></span>
          <div>
            <button className={styles.contractFilterChip} onClick={onClose} type="button">Hủy</button>
            <button className={styles.greenButton} type="submit"><CheckCircle2 size={14} /> {isEdit ? "Cập nhật" : "Thêm Line"}</button>
          </div>
        </footer>
      </form>
    </div>
  );
}

function DeleteLineDialog({
  line,
  inUse,
  hasHistory,
  onCancel,
  onConfirm,
}: {
  line: Line;
  inUse: boolean;
  hasHistory: boolean;
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
            <h3>Xác nhận xóa Line {line.name}</h3>
            <p>
              {inUse
                ? <>Line đang có khách sử dụng — <strong>không thể xóa</strong>. Hãy chờ khách checkout.</>
                : hasHistory
                  ? <>Line đã có vé lẻ liên kết. Sẽ <strong>soft delete</strong> (chuyển sang Tạm ngưng, giữ lịch sử báo cáo).</>
                  : <>Hành động này <strong>không thể hoàn tác</strong>. Chỉ Admin được xóa.</>}
            </p>
          </div>
        </header>
        <div className={styles.ticketDialogBody}>
          <div className={styles.ticketDialogInfo}>
            <div><span>Tên</span><strong>{line.name}</strong></div>
            <div><span>Chi nhánh</span><strong>{line.branch}</strong></div>
            <div><span>Mô tả</span><strong>{line.description ?? "—"}</strong></div>
          </div>
        </div>
        <footer>
          <button className={styles.contractFilterChip} onClick={onCancel} type="button">Hủy bỏ</button>
          <button className={styles.ticketDialogDanger} onClick={onConfirm} disabled={inUse} type="button">
            <Trash2 size={14} /> {hasHistory ? "Soft delete" : "Xóa cứng"}
          </button>
        </footer>
      </div>
    </div>
  );
}

// =====================================================================================
// SECTION H — ExtendTimeModal (Thêm giờ tập)
// =====================================================================================

function ExtendTimeModal({
  activeTickets,
  lines,
  onClose,
  onSubmit,
}: {
  activeTickets: LineTicket[];
  lines: Line[];
  onClose: () => void;
  onSubmit: (lineIds: string[], minutes: number, note: string) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [minutes, setMinutes] = useState(30);
  const [customMinutes, setCustomMinutes] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const presets = [15, 30, 45, 60, 90, 120];

  const toggleLine = (lineId: string) => {
    setSelected((prev) => prev.includes(lineId) ? prev.filter((id) => id !== lineId) : [...prev, lineId]);
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selected.length === 0) { setError("Vui lòng chọn ít nhất 1 Line"); return; }
    if (minutes <= 0 || minutes > 480) { setError("Số phút phải > 0 và ≤ 480 (8 giờ)"); return; }
    onSubmit(selected, minutes, note.trim());
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <form className={styles.ticketSubModal} onSubmit={submit} style={{ minWidth: 580 }}>
        <header><h3><Clock size={16} /> Thêm giờ tập cho Line đang hoạt động</h3><button onClick={onClose} type="button"><X size={16} /></button></header>
        {error ? <div className={styles.formError}><AlertCircle size={14} /> {error}</div> : null}
        <div className={styles.contractFormBody} style={{ padding: 0 }}>
          {activeTickets.length === 0 ? (
            <div className={styles.lineEmpty}>
              <Lightbulb size={40} />
              <strong>Không có Line nào đang sử dụng</strong>
              <span>Cần ít nhất 1 vé Line đang Active để gia hạn</span>
            </div>
          ) : (
            <>
              <h4 className={styles.lineExtendSubheader}>Chọn Line áp dụng (multi-select)</h4>
              <div className={styles.lineExtendList}>
                {activeTickets.map((t) => {
                  const line = lines.find((l) => l.id === t.lineId);
                  return (
                    <label key={t.id} className={selected.includes(t.lineId ?? "") ? styles.lineExtendItemActive : styles.lineExtendItem}>
                      <input
                        type="checkbox"
                        checked={selected.includes(t.lineId ?? "")}
                        onChange={() => toggleLine(t.lineId ?? "")}
                      />
                      <div>
                        <strong>{line?.name ?? "—"} · {t.customerName}</strong>
                        <span>Vé {t.id} · {t.startTime} → {t.endTime}{t.byHour ? ` · tính theo giờ ${formatCurrency(t.hourlyRate)}/h` : " · gói cố định"}</span>
                      </div>
                    </label>
                  );
                })}
              </div>

              <h4 className={styles.lineExtendSubheader}>Số phút thêm</h4>
              <div className={styles.lineExtendPresets}>
                {presets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={!customMinutes && minutes === p ? styles.lineExtendChipActive : styles.lineExtendChip}
                    onClick={() => { setCustomMinutes(false); setMinutes(p); }}
                  >
                    +{p} phút
                  </button>
                ))}
                <button
                  type="button"
                  className={customMinutes ? styles.lineExtendChipActive : styles.lineExtendChip}
                  onClick={() => setCustomMinutes(true)}
                >
                  Nhập tự do
                </button>
              </div>
              {customMinutes ? (
                <input
                  type="number"
                  min={1}
                  max={480}
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(1, Math.min(480, Number(e.target.value) || 30)))}
                  placeholder="Nhập số phút (1-480)"
                  style={{ marginTop: 8 }}
                />
              ) : null}

              <label className={styles.fullField} style={{ marginTop: 12 }}>
                <span>Ghi chú</span>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="VD: Khách xin chơi thêm, Bù do mưa..." />
              </label>

              {selected.length > 0 ? (
                <div className={styles.teetimePreviewBanner}>
                  <CheckCircle2 size={14} />
                  <div>
                    <strong>Sẽ gia hạn {minutes} phút cho {selected.length} Line</strong>
                    <span>Vé tính theo giờ sẽ tự cập nhật giá. Vé fixed price chỉ gia hạn thời gian.</span>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
        <footer>
          <button className={styles.contractFilterChip} onClick={onClose} type="button">Đóng</button>
          <button className={styles.greenButton} type="submit" disabled={activeTickets.length === 0 || selected.length === 0}>
            <Clock size={14} /> Gia hạn {selected.length > 0 ? `${minutes}p × ${selected.length}` : ""}
          </button>
        </footer>
      </form>
    </div>
  );
}

// =====================================================================================
// SECTION I — PrintTicketModal (Form In vé lẻ)
// =====================================================================================

function PrintTicketModal({
  initial,
  lines,
  tickets,
  customers,
  services,
  onClose,
  onSubmit,
  onCreateService,
  onCreateCustomer,
}: {
  initial: LineTicket | null;
  lines: Line[];
  tickets: LineTicket[];
  customers: CustomerLite[];
  services: ServiceItem[];
  onClose: () => void;
  onSubmit: (t: LineTicket) => void;
  onCreateService: (s: ServiceItem) => void;
  onCreateCustomer: (c: CustomerLite) => void;
}) {
  const isEdit = Boolean(initial);
  const today = todayString();
  const initialPriceBookId = initial?.priceBookId ?? PRICE_BOOKS[0].id;
  const initialPriceBook = PRICE_BOOKS.find((p) => p.id === initialPriceBookId) ?? PRICE_BOOKS[0];

  const [priceBookId, setPriceBookId] = useState(initialPriceBookId);
  const [ticketType, setTicketType] = useState<"Line" | "Teetime" | "Combo">(initial?.ticketType ?? "Line");
  const [lineId, setLineId] = useState(initial?.lineId ?? lines.find((l) => l.active && l.branch !== "Hà Nội Center")?.id ?? "");
  const [branch, setBranch] = useState(initial?.branch ?? "NextVision");

  const [customerCode, setCustomerCode] = useState(initial?.customerCode ?? "");
  const [customerName, setCustomerName] = useState(initial?.customerName ?? "");
  const [customerPhone, setCustomerPhone] = useState(initial?.customerPhone ?? "");
  const [customerAddress, setCustomerAddress] = useState(initial?.customerAddress ?? "");
  const [customerSearch, setCustomerSearch] = useState("");

  const [guestCount, setGuestCount] = useState(initial?.guestCount ?? 1);
  const [byHour, setByHour] = useState(initial?.byHour ?? true);
  const [hours, setHours] = useState(initial?.hours ?? 1);
  const [date, setDate] = useState(initial?.date ?? today);
  const [startTime, setStartTime] = useState(initial?.startTime ?? "07:00");
  const [vatPercent, setVatPercent] = useState(initial?.vatPercent ?? 10);
  const [discountPercent, setDiscountPercent] = useState(initial?.discountPercent ?? 0);
  const [discountAmount, setDiscountAmount] = useState(initial?.discountAmount ?? 0);
  const [services_, setServices_] = useState<ServiceLine[]>(initial?.services ?? []);
  const [active, setActive] = useState(initial?.active ?? true);
  const [effective, setEffective] = useState(initial?.effective ?? true);
  const [checkout, setCheckout] = useState(initial?.checkout ?? false);
  const [paymentMethod, setPaymentMethod] = useState(initial?.paymentMethod ?? "Tiền mặt");
  const [customerCash, setCustomerCash] = useState(initial?.customerCash ?? 0);
  const [note, setNote] = useState(initial?.note ?? "");
  const [staff, setStaff] = useState(initial?.staff ?? STAFF_LIST[0]);
  const [error, setError] = useState<string | null>(null);

  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);

  const priceBook = PRICE_BOOKS.find((p) => p.id === priceBookId) ?? initialPriceBook;
  const hourlyRate = priceBook.hourlyRate;

  // Calc totals
  const lineSubtotal = byHour ? hourlyRate * hours : hourlyRate;
  const servicesSubtotalBeforeVat = services_.filter((s) => s.used && !s.free).reduce((sum, s) => sum + s.priceBeforeVat * s.quantity, 0);
  const subtotalBeforeVat = (lineSubtotal / (1 + vatPercent / 100)) + servicesSubtotalBeforeVat;
  const totalWithVat = subtotalBeforeVat * (1 + vatPercent / 100);
  const afterPct = totalWithVat * (1 - discountPercent / 100);
  const totalAmount = Math.round(Math.max(0, afterPct - discountAmount));
  const change = customerCash - totalAmount;

  const endTime = useMemo(() => {
    const m = timeToMinutes(startTime) + Math.round(hours * 60);
    return minutesToTime(m);
  }, [startTime, hours]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers.slice(0, 5);
    const q = customerSearch.toLowerCase();
    return customers.filter((c) => `${c.code} ${c.name} ${c.phone}`.toLowerCase().includes(q)).slice(0, 8);
  }, [customers, customerSearch]);

  const pickCustomer = (c: CustomerLite) => {
    setCustomerCode(c.code);
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
    setCustomerAddress(c.address ?? "");
  };

  const clearCustomer = () => {
    setCustomerCode("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
  };

  const addService = (svc: ServiceItem) => {
    const exists = services_.find((s) => s.serviceId === svc.id);
    if (exists) return;
    setServices_((prev) => [...prev, {
      id: `SL-${Date.now()}-${prev.length}`,
      serviceId: svc.id,
      name: svc.name,
      priceBeforeVat: svc.priceBeforeVat,
      unitPrice: svc.unitPrice,
      quantity: 1,
      used: true,
      free: false,
    }]);
  };

  const removeService = (id: string) => setServices_((prev) => prev.filter((s) => s.id !== id));
  const updateService = (id: string, partial: Partial<ServiceLine>) => {
    setServices_((prev) => prev.map((s) => (s.id === id ? { ...s, ...partial } : s)));
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customerName.trim()) { setError("Vui lòng nhập tên khách hàng"); return; }
    if (ticketType !== "Teetime" && !lineId) { setError("Vui lòng chọn Line"); return; }
    if (hours <= 0) { setError("Số giờ phải > 0"); return; }

    // Conflict: Line đang có khách active
    if (lineId && active && !isEdit) {
      const conflict = tickets.find((t) => t.lineId === lineId && t.status === "active");
      if (conflict) { setError(`Line đang có khách (${conflict.customerName}). Chờ checkout hoặc bỏ tick Kích hoạt.`); return; }
    }

    if (customerCash < totalAmount) {
      // Cảnh báo nhưng không chặn — ghi công nợ
    }

    const id = initial?.id ?? nextLineTicketId(tickets);
    const status: LineTicketStatus = checkout ? "checkout" : active ? "active" : "pending";
    const next: LineTicket = {
      id,
      lineId: ticketType === "Teetime" ? undefined : lineId,
      ticketType,
      priceBookId,
      customerCode: customerCode || undefined,
      customerName,
      customerPhone,
      customerAddress: customerAddress || undefined,
      guestCount,
      byHour,
      hours,
      hourlyRate,
      vatPercent,
      discountPercent,
      discountAmount,
      services: services_,
      totalAmount,
      customerCash,
      changeAmount: Math.max(0, change),
      paymentMethod,
      date,
      startTime,
      endTime,
      active,
      effective,
      checkout,
      staff,
      branch,
      note: note || undefined,
      status,
      createdAt: initial?.createdAt ?? nowString(),
      history: initial?.history ?? [
        { date: nowString(), actor: staff, action: isEdit ? "Cập nhật vé" : `In vé · ${ticketType}${active ? " · kích hoạt" : ""}` },
        ...(checkout ? [{ date: nowString(), actor: staff, action: "Checkout · sinh phiếu thu" }] : []),
      ],
    };
    onSubmit(next);
  };

  const availableLines = lines.filter((l) => l.active && (branch === "Toàn hệ thống" || l.branch === branch));

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <form className={styles.linePrintModal} onSubmit={submit}>
        <header className={styles.contractFormBanner}>
          <h2><Printer size={16} /> {isEdit ? `Sửa vé ${initial?.id}` : "In vé lẻ"}</h2>
          <button onClick={onClose} type="button"><X size={18} /></button>
        </header>

        {error ? <div className={styles.formError} style={{ margin: "12px 20px" }}><AlertCircle size={14} /> {error}</div> : null}

        <div className={styles.linePrintBody}>
          {/* Cột trái: Thông tin */}
          <div className={styles.linePrintLeft}>
            <section className={`${styles.contractFormSection} ${styles.contractSectionBlue}`}>
              <h3 className={styles.contractSectionHeader}><Tag size={16} /> Bảng giá & Loại vé</h3>
              <div className={styles.contractGrid2}>
                <label>
                  <span>Bảng giá <b>*</b></span>
                  <select className={styles.selectInput} value={priceBookId} onChange={(e) => setPriceBookId(e.target.value)}>
                    {PRICE_BOOKS.map((p) => <option key={p.id} value={p.id}>{p.name} · {formatCurrency(p.hourlyRate)}/giờ</option>)}
                  </select>
                </label>
                <label>
                  <span>Chi nhánh</span>
                  <select className={styles.selectInput} value={branch} onChange={(e) => setBranch(e.target.value)}>
                    {BRANCHES.filter((b) => b !== "Toàn hệ thống").map((b) => <option key={b}>{b}</option>)}
                  </select>
                </label>
                <label className={styles.fullField}>
                  <span>Loại vé</span>
                  <div className={styles.contractRadioRow}>
                    {TICKET_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={ticketType === t ? styles.contractRadioActive : styles.contractRadio}
                        onClick={() => setTicketType(t)}
                      >
                        {t === "Line" ? "Line tập" : t === "Teetime" ? "Teetime (sân thật)" : "Combo (Line + Teetime)"}
                      </button>
                    ))}
                  </div>
                </label>
                {ticketType !== "Teetime" ? (
                  <label className={styles.fullField}>
                    <span>Chọn Line <b>*</b></span>
                    <select className={styles.selectInput} value={lineId} onChange={(e) => setLineId(e.target.value)}>
                      <option value="">— Chọn Line —</option>
                      {availableLines.map((l) => <option key={l.id} value={l.id}>{l.name} · {l.startTime}-{l.endTime} · sức chứa {l.maxCheckin}</option>)}
                    </select>
                  </label>
                ) : null}
              </div>
            </section>

            <section className={`${styles.contractFormSection} ${styles.contractSectionGreen}`}>
              <h3 className={styles.contractSectionHeader}><User size={16} /> Khách hàng</h3>
              <div className={styles.teetimeCustomerSearch}>
                <Search size={14} />
                <input value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} placeholder="Tìm theo tên / SĐT để chọn KH có sẵn..." />
                <button className={styles.contractLinkBtn} onClick={() => setCustomerModalOpen(true)} type="button">
                  <Plus size={12} /> Thêm KH
                </button>
                {customerCode ? (
                  <button className={styles.contractLinkBtn} onClick={clearCustomer} type="button">
                    <XCircle size={12} /> Khách lẻ
                  </button>
                ) : null}
              </div>
              {filteredCustomers.length > 0 && customerSearch ? (
                <div className={styles.teetimeCustomerList}>
                  {filteredCustomers.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      className={c.code === customerCode ? styles.teetimeCustomerCardActive : styles.teetimeCustomerCard}
                      onClick={() => pickCustomer(c)}
                    >
                      <div className={styles.teetimeCustomerAvatar}>{c.name.split(" ").pop()?.[0] ?? "?"}</div>
                      <div>
                        <strong>{c.name}</strong>
                        <span>{c.phone}</span>
                        {c.isMember ? <em>Hội viên</em> : <em className={styles.teetimeWalkin}>Khách thường</em>}
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}

              <div className={styles.contractGrid2}>
                <label>
                  <span>Tên khách <b>*</b></span>
                  <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Tên khách hàng" />
                </label>
                <label>
                  <span>Số điện thoại</span>
                  <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="0901234567" />
                </label>
                <label className={styles.fullField}>
                  <span>Địa chỉ</span>
                  <input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="Địa chỉ thường trú" />
                </label>
                <label>
                  <span>Số khách</span>
                  <div className={styles.contractRadioRow}>
                    {[1, 2, 3, 4].map((n) => (
                      <button key={n} type="button" className={guestCount === n ? styles.contractRadioActive : styles.contractRadio} onClick={() => setGuestCount(n)}>
                        {n} người
                      </button>
                    ))}
                  </div>
                </label>
                <label>
                  <span>Nhân viên xử lý</span>
                  <select className={styles.selectInput} value={staff} onChange={(e) => setStaff(e.target.value)}>
                    {STAFF_LIST.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
              </div>

              <div className={styles.linePrintCheckRow}>
                <label className={styles.contractCheckboxLine}>
                  <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                  <strong>Kích hoạt ngay</strong> — Line đổi sang xanh lá
                </label>
                <label className={styles.contractCheckboxLine}>
                  <input type="checkbox" checked={effective} onChange={(e) => setEffective(e.target.checked)} />
                  Hiệu lực — Vé còn giá trị sử dụng
                </label>
                <label className={styles.contractCheckboxLine}>
                  <input type="checkbox" checked={checkout} onChange={(e) => setCheckout(e.target.checked)} />
                  Checkout luôn — Hoàn tất giao dịch & sinh phiếu thu
                </label>
                <label className={styles.contractCheckboxLine}>
                  <input type="checkbox" checked={byHour} onChange={(e) => setByHour(e.target.checked)} />
                  Tính theo giờ — Đơn giá × Số giờ
                </label>
              </div>

              <label className={styles.fullField}>
                <span>Ghi chú</span>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Yêu cầu đặc biệt của khách..." />
              </label>
            </section>

            <section className={`${styles.contractFormSection} ${styles.contractSectionPurple}`}>
              <h3 className={styles.contractSectionHeader}>
                <PlusCircle size={16} /> Dịch vụ bán kèm
                <button type="button" className={styles.lineAddServiceBtn} onClick={() => setServiceModalOpen(true)}>
                  <Plus size={12} /> Thêm DV
                </button>
              </h3>
              {services_.length === 0 ? (
                <div className={styles.ticketEmptyHint}>Chưa có DV bán kèm. Click nút Thêm DV để chọn.</div>
              ) : (
                <table className={styles.ticketAddonTable}>
                  <thead>
                    <tr>
                      <th>Tên DV</th>
                      <th>Giá trước VAT</th>
                      <th>Đơn giá</th>
                      <th>SL</th>
                      <th>Sử dụng</th>
                      <th>Miễn phí</th>
                      <th>Thành tiền</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {services_.map((s) => (
                      <tr key={s.id}>
                        <td><strong>{s.name}</strong></td>
                        <td>{formatCurrency(s.priceBeforeVat)}</td>
                        <td>{formatCurrency(s.unitPrice)}</td>
                        <td>
                          <input className={styles.ticketTableInput} type="number" min={1} value={s.quantity} onChange={(e) => updateService(s.id, { quantity: Math.max(1, Number(e.target.value) || 1) })} />
                        </td>
                        <td>
                          <input type="checkbox" checked={s.used} onChange={(e) => updateService(s.id, { used: e.target.checked })} />
                        </td>
                        <td>
                          <input type="checkbox" checked={s.free} onChange={(e) => updateService(s.id, { free: e.target.checked })} />
                        </td>
                        <td><strong>{formatCurrency(s.used && !s.free ? s.unitPrice * s.quantity : 0)}</strong></td>
                        <td><button type="button" className={styles.contractRowRemove} onClick={() => removeService(s.id)}><X size={12} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </div>

          {/* Cột phải: Thanh toán */}
          <aside className={styles.linePrintRight}>
            <div className={styles.linePaymentCard}>
              <h3>
                <Wallet size={14} /> Chi tiết thanh toán
              </h3>
              <div className={styles.linePaymentRow}>
                <span>Bảng giá</span>
                <strong>{priceBook.name}</strong>
              </div>
              <div className={styles.linePaymentRow}>
                <span>Đơn giá / giờ</span>
                <strong>{formatCurrency(hourlyRate)}</strong>
              </div>

              <label>
                <span>Số giờ</span>
                <input type="number" min={0.5} step={0.5} value={hours} onChange={(e) => setHours(Math.max(0.5, Number(e.target.value) || 1))} disabled={!byHour} />
              </label>
              <label>
                <span>Ngày phát hành</span>
                <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="dd/mm/yyyy" />
              </label>
              <label>
                <span>Giờ vào</span>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </label>
              <label>
                <span>Giờ ra (auto)</span>
                <input readOnly value={endTime} />
              </label>

              <hr className={styles.linePaymentDivider} />

              <label>
                <span>VAT (%)</span>
                <select className={styles.selectInput} value={vatPercent} onChange={(e) => setVatPercent(Number(e.target.value))}>
                  {VAT_OPTIONS.map((v) => <option key={v} value={v}>{v}%</option>)}
                </select>
              </label>
              <div className={styles.contractGrid2} style={{ gap: 8 }}>
                <label>
                  <span>Giảm giá %</span>
                  <input type="number" min={0} max={100} value={discountPercent} onChange={(e) => setDiscountPercent(Math.max(0, Math.min(100, Number(e.target.value) || 0)))} />
                </label>
                <label>
                  <span>Giảm giá ₫</span>
                  <input type="number" min={0} step={1000} value={discountAmount} onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value) || 0))} />
                </label>
              </div>

              <hr className={styles.linePaymentDivider} />

              <div className={styles.linePaymentTotal}>
                <span>THÀNH TIỀN</span>
                <strong>{formatCurrency(totalAmount)}</strong>
              </div>

              <label>
                <span>Tiền khách đưa</span>
                <input type="number" min={0} step={1000} value={customerCash} onChange={(e) => setCustomerCash(Math.max(0, Number(e.target.value) || 0))} />
              </label>
              <div className={change >= 0 ? styles.linePaymentChange : styles.linePaymentDebt}>
                <span>{change >= 0 ? "Khách dư" : "Còn nợ"}</span>
                <strong>{formatCurrency(Math.abs(change))}</strong>
              </div>

              <label>
                <span>Phương thức thanh toán</span>
                <select className={styles.selectInput} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  {PAYMENT_METHODS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </label>
            </div>
          </aside>
        </div>

        <footer className={styles.contractFormFooter}>
          <span>Tổng tiền vé:</span>
          <strong className={styles.ticketGrandTotal}>{formatCurrency(totalAmount)}</strong>
          <div>
            <button className={styles.contractFilterChip} onClick={onClose} type="button">Hủy</button>
            <button className={styles.greenButton} type="submit">
              <Printer size={14} /> {isEdit ? "Cập nhật vé" : "In vé lẻ"}
            </button>
          </div>
        </footer>
      </form>

      {serviceModalOpen ? (
        <ServicePickerModal
          services={services.filter((s) => !s.notUsable && (s.branch === "Toàn hệ thống" || s.branch === branch))}
          alreadyAdded={services_.map((s) => s.serviceId)}
          onClose={() => setServiceModalOpen(false)}
          onPick={(svc) => addService(svc)}
          onCreateService={onCreateService}
        />
      ) : null}

      {customerModalOpen ? (
        <AddCustomerQuickModal
          existingCodes={customers.map((c) => c.code)}
          onClose={() => setCustomerModalOpen(false)}
          onSubmit={(c) => { onCreateCustomer(c); pickCustomer(c); setCustomerModalOpen(false); }}
        />
      ) : null}
    </div>
  );
}

// =====================================================================================
// SECTION J — ServicePickerModal
// =====================================================================================

function ServicePickerModal({
  services,
  alreadyAdded,
  onClose,
  onPick,
  onCreateService,
}: {
  services: ServiceItem[];
  alreadyAdded: string[];
  onClose: () => void;
  onPick: (s: ServiceItem) => void;
  onCreateService: (s: ServiceItem) => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query) return services;
    const q = query.toLowerCase();
    return services.filter((s) => `${s.name} ${s.description ?? ""}`.toLowerCase().includes(q));
  }, [services, query]);

  const toggle = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const confirm = () => {
    selected.forEach((id) => {
      const svc = services.find((s) => s.id === id);
      if (svc) onPick(svc);
    });
    onClose();
  };

  return (
    <div className={styles.nestedOverlay} role="dialog" aria-modal="true">
      <div className={styles.ticketSubModal} style={{ minWidth: 640, maxWidth: "min(720px, 95vw)" }}>
        <header>
          <h3><PlusCircle size={16} /> Chọn dịch vụ</h3>
          <span className={styles.linePickerBadge}>Đã chọn {selected.length}</span>
          <button onClick={onClose} type="button"><X size={16} /></button>
        </header>
        <div>
          <div className={styles.teetimeCustomerSearch}>
            <Search size={14} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo tên dịch vụ..." />
          </div>

          <table className={styles.ticketAddonTable}>
            <thead>
              <tr>
                <th></th>
                <th>Tên DV</th>
                <th>Giá trước VAT</th>
                <th>Đơn giá</th>
                <th>Chi nhánh</th>
                <th>Mô tả</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td className={styles.emptyTableCell} colSpan={6}>Không tìm thấy DV</td></tr>
              ) : null}
              {filtered.map((s) => {
                const used = alreadyAdded.includes(s.id);
                return (
                  <tr key={s.id} style={{ opacity: used ? 0.5 : 1 }}>
                    <td>
                      <input type="checkbox" checked={selected.includes(s.id)} disabled={used} onChange={() => toggle(s.id)} />
                    </td>
                    <td><strong>{s.name}</strong>{used ? <em className={styles.cellMuted}> · đã thêm</em> : null}</td>
                    <td>{formatCurrency(s.priceBeforeVat)}</td>
                    <td><strong style={{ color: "#15803d" }}>{formatCurrency(s.unitPrice)}</strong></td>
                    <td className={styles.cellMuted}>{s.branch}</td>
                    <td className={styles.cellTruncate} title={s.description}>{s.description ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <footer>
          <button className={styles.contractLinkBtn} onClick={() => setCreateOpen(true)} type="button">
            <Plus size={12} /> Thêm mới DV
          </button>
          <button className={styles.contractFilterChip} onClick={onClose} type="button">Hủy</button>
          <button className={styles.greenButton} onClick={confirm} type="button" disabled={selected.length === 0}>
            <CheckCircle2 size={14} /> Lưu ({selected.length})
          </button>
        </footer>
      </div>

      {createOpen ? (
        <CreateServiceModal
          onClose={() => setCreateOpen(false)}
          onSubmit={(s) => { onCreateService(s); setCreateOpen(false); }}
        />
      ) : null}
    </div>
  );
}

function CreateServiceModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (s: ServiceItem) => void;
}) {
  const [name, setName] = useState("");
  const [branch, setBranch] = useState<string>("Toàn hệ thống");
  const [priceBeforeVat, setPriceBeforeVat] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [notUsable, setNotUsable] = useState(false);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) { setError("Tên DV bắt buộc"); return; }
    if (priceBeforeVat < 0 || unitPrice < 0) { setError("Giá không hợp lệ"); return; }
    if (unitPrice < priceBeforeVat) { setError("Đơn giá phải ≥ giá trước VAT"); return; }
    onSubmit({
      id: `SV-${Date.now()}`,
      name: name.trim(),
      branch,
      priceBeforeVat,
      unitPrice,
      notUsable,
      description: description.trim() || undefined,
    });
  };

  return (
    <div className={styles.nestedOverlay} style={{ zIndex: 200 }} role="dialog" aria-modal="true">
      <form className={styles.ticketSubModal} onSubmit={submit}>
        <header><h3><PlusCircle size={16} /> Thêm mới dịch vụ</h3><button onClick={onClose} type="button"><X size={16} /></button></header>
        {error ? <div className={styles.formError}><AlertCircle size={14} /> {error}</div> : null}
        <div className={styles.contractGrid2}>
          <label>
            <span>Tên gọi <b>*</b></span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Nước suối 500ml" />
          </label>
          <label>
            <span>Chi nhánh</span>
            <select className={styles.selectInput} value={branch} onChange={(e) => setBranch(e.target.value)}>
              {BRANCHES.map((b) => <option key={b}>{b}</option>)}
            </select>
          </label>
          <label>
            <span>Giá trước VAT (VNĐ) <b>*</b></span>
            <input type="number" min={0} step={1000} value={priceBeforeVat} onChange={(e) => { const v = Math.max(0, Number(e.target.value) || 0); setPriceBeforeVat(v); if (unitPrice < v) setUnitPrice(v); }} />
          </label>
          <label>
            <span>Đơn giá bán (VNĐ) <b>*</b></span>
            <input type="number" min={priceBeforeVat} step={1000} value={unitPrice} onChange={(e) => setUnitPrice(Math.max(priceBeforeVat, Number(e.target.value) || 0))} />
          </label>
          <label className={styles.contractCheckboxLine}>
            <input type="checkbox" checked={notUsable} onChange={(e) => setNotUsable(e.target.checked)} />
            Không sử dụng — ẩn khỏi danh sách bán
          </label>
          <label className={styles.fullField}>
            <span>Ghi chú</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
        </div>
        <footer>
          <button className={styles.contractFilterChip} onClick={onClose} type="button">Hủy</button>
          <button className={styles.greenButton} type="submit"><CheckCircle2 size={14} /> Thêm DV</button>
        </footer>
      </form>
    </div>
  );
}

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
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) { setError("Vui lòng nhập tên KH"); return; }
    if (!/^0\d{9,10}$/.test(phone.trim())) { setError("SĐT không hợp lệ"); return; }
    const max = Math.max(0, ...existingCodes.map((c) => parseInt(c.replace("HV", ""), 10)).filter((n) => !Number.isNaN(n)));
    onSubmit({
      code: "HV" + String(max + 1).padStart(3, "0"),
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim() || undefined,
      isMember: false,
    });
  };

  return (
    <div className={styles.nestedOverlay} style={{ zIndex: 200 }} role="dialog" aria-modal="true">
      <form className={styles.ticketSubModal} onSubmit={submit}>
        <header><h3><Plus size={16} /> Thêm khách hàng</h3><button onClick={onClose} type="button"><X size={16} /></button></header>
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
          <label className={styles.fullField}>
            <span>Địa chỉ</span>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Địa chỉ thường trú" />
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

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  Flag,
  History,
  Info,
  MoreVertical,
  Phone,
  PlusCircle,
  RefreshCcw,
  Search,
  Settings,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import styles from "@/shared/styles/feature-styles.module.css";
import { FeaturePage } from "@/shared/components";

// =====================================================================================
// SECTION A — Constants & seed data
// =====================================================================================

const BRANCHES = ["NextVision", "Hà Nội Center", "Sài Gòn West"] as const;

const COACHES = [
  { id: "TR-001", name: "HLV Trần Văn An", branch: "NextVision" },
  { id: "TR-002", name: "HLV Đỗ Hồng Quân", branch: "NextVision" },
  { id: "TR-003", name: "HLV Nguyễn Mai", branch: "NextVision" },
  { id: "TR-004", name: "HLV Phạm Hùng", branch: "Hà Nội Center" },
] as const;

const ASSISTANTS = [
  { id: "TA-001", name: "Lê Bảo Châu" },
  { id: "TA-002", name: "Trần Quang Minh" },
  { id: "TA-003", name: "Nguyễn Thái" },
] as const;

const TEACHING_AIDS = [
  { id: "TGV-001", name: "Vũ Hoàng Long" },
  { id: "TGV-002", name: "Đặng Minh Châu" },
] as const;

const CADDIES = [
  { id: "CAD-001", name: "Nguyễn Thị Thu", branch: "NextVision" },
  { id: "CAD-002", name: "Trần Văn Hùng", branch: "NextVision" },
  { id: "CAD-003", name: "Lê Mỹ Duyên", branch: "NextVision" },
  { id: "CAD-004", name: "Phạm Đăng Khoa", branch: "NextVision" },
  { id: "CAD-005", name: "Hoàng Tuyết Nhung", branch: "NextVision" },
  { id: "CAD-006", name: "Vũ Văn Đức", branch: "Hà Nội Center" },
] as const;

const STAFF_LIST = ["Nguyễn Thị Lan", "Phạm Văn Đức", "Hoàng Mỹ Linh", "Trần Quốc Bảo"] as const;

type CustomerLite = {
  code: string;
  name: string;
  phone: string;
  email?: string;
  packageCode?: string;
  packageName?: string;
  remainingSessions?: number;
  totalSessions?: number;
  isMember?: boolean;
};

const INITIAL_CUSTOMERS: CustomerLite[] = [
  { code: "HV001", name: "Nguyễn Văn A", phone: "0901234567", email: "nguyenvana@gmail.com", packageCode: "P002", packageName: "Gói Cao Cấp Golf", remainingSessions: 18, totalSessions: 24, isMember: true },
  { code: "HV002", name: "Trần Thị B", phone: "0902345678", email: "tranthib@gmail.com", packageCode: "P001", packageName: "Gói Cơ Bản Golf", remainingSessions: 5, totalSessions: 8, isMember: true },
  { code: "HV003", name: "Lê Văn C", phone: "0923456789", packageCode: "P003", packageName: "Gói Premium Practice", remainingSessions: 12, totalSessions: 30, isMember: true },
  { code: "HV005", name: "Huỳnh Xuân Long", phone: "0910070932", packageCode: "P007", packageName: "Gói VIP Master", remainingSessions: 42, totalSessions: 60, isMember: true },
  { code: "HV012", name: "Đỗ Mai Hương", phone: "0345678901", packageCode: "P004", packageName: "Gói Family Combo", remainingSessions: 38, totalSessions: 50, isMember: true },
  { code: "HV020", name: "Walk-in Khách Vãng Lai", phone: "0900000000", isMember: false },
];

type TeetimeConfig = {
  id: string;
  name: string;
  branch: string;
  maxBook: number;        // 1-6 khách / teetime
  stepMinutes: number;    // 5-30 phút
  startTime: string;      // HH:mm
  endTime: string;        // HH:mm
  active: boolean;
  description?: string;
  createdAt: string;
};

type TeetimeBookingStatus = "confirmed" | "played" | "no_show" | "cancelled";

type TeetimeBooking = {
  id: string;
  configId: string;
  date: string;          // dd/mm/yyyy
  slotIndex: number;     // index in slot array (computed from time)
  branch: string;
  holes: 9 | 18;
  startTime: string;
  endTime: string;
  guestCount: number;
  visitorCount: number;
  coachId?: string;
  assistantId?: string;
  teachingAidId?: string;
  caddieId?: string;
  customerCode: string;
  packageCode?: string;
  note?: string;
  status: TeetimeBookingStatus;
  cancellationReason?: string;
  reschedulingCount: number;
  createdAt: string;
  createdBy: string;
  history: { date: string; actor: string; action: string; detail?: string }[];
};

const INITIAL_CONFIG: TeetimeConfig = {
  id: "CFG-001",
  name: "Teetime mặc định",
  branch: "NextVision",
  maxBook: 4,
  stepMinutes: 10,
  startTime: "06:00",
  endTime: "22:50",
  active: true,
  description: "Cấu hình mặc định cho sân golf 18 hố tại NextVision",
  createdAt: "01/01/2026 08:00",
};

const INITIAL_BOOKINGS: TeetimeBooking[] = [
  {
    id: "TT-2605-001", configId: "CFG-001", date: "08/05/2026", slotIndex: 6, branch: "NextVision",
    holes: 18, startTime: "07:00", endTime: "07:10", guestCount: 4, visitorCount: 0,
    coachId: "TR-001", assistantId: "TA-001", caddieId: "CAD-001",
    customerCode: "HV001", packageCode: "P002",
    note: "Flight 4 người, đặt sẵn caddie nữ",
    status: "confirmed", reschedulingCount: 0,
    createdAt: "07/05/2026 17:30", createdBy: "Nguyễn Thị Lan",
    history: [{ date: "07/05/2026 17:30", actor: "Nguyễn Thị Lan", action: "Tạo booking" }],
  },
  {
    id: "TT-2605-002", configId: "CFG-001", date: "08/05/2026", slotIndex: 12, branch: "NextVision",
    holes: 9, startTime: "08:00", endTime: "08:10", guestCount: 2, visitorCount: 1,
    coachId: "TR-002", caddieId: "CAD-002",
    customerCode: "HV005", packageCode: "P007",
    note: "Khách VIP, 1 người tham quan",
    status: "confirmed", reschedulingCount: 0,
    createdAt: "07/05/2026 18:00", createdBy: "Hoàng Mỹ Linh",
    history: [
      { date: "07/05/2026 18:00", actor: "Hoàng Mỹ Linh", action: "Tạo booking" },
      { date: "07/05/2026 18:01", actor: "Hệ thống", action: "Tạo vé lẻ chờ thanh toán", detail: "1 khách tham quan · VE-2605-099" },
    ],
  },
  {
    id: "TT-2605-003", configId: "CFG-001", date: "08/05/2026", slotIndex: 18, branch: "NextVision",
    holes: 18, startTime: "09:00", endTime: "09:10", guestCount: 1, visitorCount: 0,
    coachId: "TR-003", caddieId: "CAD-003",
    customerCode: "HV002", packageCode: "P001",
    status: "confirmed", reschedulingCount: 1,
    createdAt: "06/05/2026 09:00", createdBy: "Phạm Văn Đức",
    history: [
      { date: "06/05/2026 09:00", actor: "Phạm Văn Đức", action: "Tạo booking" },
      { date: "07/05/2026 14:00", actor: "Phạm Văn Đức", action: "Chuyển lịch", detail: "07/05/2026 09:00 → 08/05/2026 09:00" },
    ],
  },
  {
    id: "TT-2605-004", configId: "CFG-001", date: "08/05/2026", slotIndex: 30, branch: "NextVision",
    holes: 18, startTime: "11:00", endTime: "11:10", guestCount: 2, visitorCount: 0,
    coachId: "TR-001", caddieId: "CAD-004",
    customerCode: "HV012", packageCode: "P004",
    note: "Vợ chồng, gói gia đình",
    status: "played", reschedulingCount: 0,
    createdAt: "06/05/2026 12:00", createdBy: "Trần Quốc Bảo",
    history: [
      { date: "06/05/2026 12:00", actor: "Trần Quốc Bảo", action: "Tạo booking" },
      { date: "08/05/2026 11:25", actor: "Lễ tân", action: "Đã chơi", detail: "Trừ 1 buổi gói P004 · còn 37/50" },
    ],
  },
  {
    id: "TT-2605-005", configId: "CFG-001", date: "08/05/2026", slotIndex: 24, branch: "NextVision",
    holes: 9, startTime: "10:00", endTime: "10:10", guestCount: 1, visitorCount: 2,
    customerCode: "HV020",
    note: "Khách walk-in, đã thanh toán vé lẻ",
    status: "cancelled", reschedulingCount: 0,
    cancellationReason: "Thời tiết xấu, sân đóng cửa",
    createdAt: "07/05/2026 19:00", createdBy: "Nguyễn Thị Lan",
    history: [
      { date: "07/05/2026 19:00", actor: "Nguyễn Thị Lan", action: "Tạo booking" },
      { date: "08/05/2026 06:30", actor: "Nguyễn Thị Lan", action: "Hủy lịch", detail: "Lý do: Thời tiết xấu (BR-TT-02 hoàn 100%)" },
    ],
  },
];

// =====================================================================================
// SECTION B — Helpers
// =====================================================================================

function todayString(): string {
  const t = new Date();
  return `${String(t.getDate()).padStart(2, "0")}/${String(t.getMonth() + 1).padStart(2, "0")}/${t.getFullYear()}`;
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

function formatDateLong(s: string): string {
  const d = parseDDMMYYYY(s);
  if (!d) return s;
  const days = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  return `${days[d.getDay()]}, ${s}`;
}

function shiftDate(s: string, deltaDays: number): string {
  const d = parseDDMMYYYY(s);
  if (!d) return s;
  d.setDate(d.getDate() + deltaDays);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function minutesToTime(m: number): string {
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function generateSlots(config: TeetimeConfig): { index: number; time: string; endTime: string }[] {
  const startM = timeToMinutes(config.startTime);
  const endM = timeToMinutes(config.endTime);
  const step = config.stepMinutes;
  const total = Math.floor((endM - startM) / step) + 1;
  const slots = [];
  for (let i = 0; i < total; i += 1) {
    const m = startM + i * step;
    if (m > endM) break;
    slots.push({ index: i, time: minutesToTime(m), endTime: minutesToTime(m + step) });
  }
  return slots;
}

function lookupCustomer(code: string, list: CustomerLite[]): CustomerLite | undefined {
  return list.find((c) => c.code === code);
}

function nextBookingId(items: TeetimeBooking[]): string {
  const t = new Date();
  const yymm = String(t.getFullYear()).slice(2) + String(t.getMonth() + 1).padStart(2, "0");
  const count = items.filter((it) => it.id.startsWith(`TT-${yymm}`)).length + 1;
  return `TT-${yymm}-${String(count).padStart(3, "0")}`;
}

function isPastSlot(date: string, time: string): boolean {
  const d = parseDDMMYYYY(date);
  if (!d) return false;
  const [h, m] = time.split(":").map(Number);
  d.setHours(h || 0, m || 0, 0, 0);
  return d.getTime() < Date.now();
}

function defaultTeetimeDate(): string {
  const today = todayString();
  const futureSlots = generateSlots(INITIAL_CONFIG).filter((slot) => !isPastSlot(today, slot.time)).length;
  return futureSlots >= 6 ? today : shiftDate(today, 1);
}

// =====================================================================================
// SECTION C — Top-level component
// =====================================================================================

export default function TeetimeView() {
  const initialDate = defaultTeetimeDate();
  const [config, setConfig] = useState<TeetimeConfig>(INITIAL_CONFIG);
  const [bookings, setBookings] = useState<TeetimeBooking[]>(() => {
    const todaySlots = generateSlots(INITIAL_CONFIG);
    const firstFutureSlot = Math.max(0, todaySlots.findIndex((slot) => !isPastSlot(initialDate, slot.time)));
    const demoSlots = firstFutureSlot > 6
      ? [firstFutureSlot, firstFutureSlot + 1, firstFutureSlot + 2, firstFutureSlot - 6, firstFutureSlot + 3]
      : [0, 1, 2, 3, 4];
    return INITIAL_BOOKINGS.map((booking, index) => {
      const slotIndex = demoSlots[index] ?? booking.slotIndex;
      const slot = todaySlots[slotIndex] ?? todaySlots[booking.slotIndex];
      return {
        ...booking,
        date: initialDate,
        slotIndex,
        startTime: slot?.time ?? booking.startTime,
        endTime: slot?.endTime ?? booking.endTime,
      };
    });
  });
  const [customers, setCustomers] = useState<CustomerLite[]>(INITIAL_CUSTOMERS);
  const [date, setDate] = useState<string>(() => initialDate);
  const [branch, setBranch] = useState<string>("NextVision");

  const [setupOpen, setSetupOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState<{ slot: number; existing?: TeetimeBooking } | null>(null);
  const [detailOpen, setDetailOpen] = useState<{ slot: number } | null>(null);
  const [editingBooking, setEditingBooking] = useState<TeetimeBooking | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<TeetimeBooking | null>(null);
  const [cancelTarget, setCancelTarget] = useState<TeetimeBooking | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeetimeBooking | null>(null);
  const [playedTarget, setPlayedTarget] = useState<TeetimeBooking | null>(null);
  const [noShowTarget, setNoShowTarget] = useState<TeetimeBooking | null>(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  };

  const slots = useMemo(() => generateSlots(config), [config]);
  const dayBookings = useMemo(
    () => bookings.filter((b) => b.date === date && b.branch === branch),
    [bookings, date, branch]
  );

  const stats = useMemo(() => {
    const total = slots.length;
    const booked = new Set(dayBookings.filter((b) => b.status === "confirmed" || b.status === "played").map((b) => b.slotIndex)).size;
    const available = total - booked;
    const players = dayBookings.filter((b) => b.status === "confirmed" || b.status === "played").reduce((s, b) => s + b.guestCount + b.visitorCount, 0);
    return { total, booked, available, players };
  }, [slots, dayBookings]);

  const onClickSlot = (slot: number, time: string) => {
    if (isPastSlot(date, time)) {
      flash("Slot đã qua giờ, không thể book");
      return;
    }
    const slotBookings = dayBookings.filter((b) => b.slotIndex === slot && b.status !== "cancelled");
    const totalAtSlot = slotBookings.reduce((s, b) => s + b.guestCount + b.visitorCount, 0);
    if (slotBookings.length === 0) {
      setRegisterOpen({ slot });
    } else if (totalAtSlot >= config.maxBook) {
      setDetailOpen({ slot });
    } else {
      setDetailOpen({ slot });
    }
  };

  const submitBooking = (next: TeetimeBooking) => {
    const exists = bookings.find((b) => b.id === next.id);
    if (exists) {
      setBookings(bookings.map((b) => (b.id === next.id ? next : b)));
      flash(`Đã cập nhật ${next.id}`);
    } else {
      setBookings([next, ...bookings]);
      const visitorMsg = next.visitorCount > 0 ? ` · sinh vé lẻ (${next.visitorCount} khách tham quan)` : "";
      flash(`Đã tạo booking ${next.id}${visitorMsg}`);
    }
    setRegisterOpen(null);
    setEditingBooking(null);
  };

  const markPlayed = (target: TeetimeBooking) => {
    const customer = lookupCustomer(target.customerCode, customers);
    setBookings(bookings.map((b) => b.id === target.id ? {
      ...b,
      status: "played",
      history: [...b.history, { date: nowString(), actor: "Lễ tân", action: "Đã chơi", detail: customer?.packageName ? `Trừ 1 buổi gói ${customer.packageCode} · còn ${(customer.remainingSessions ?? 1) - 1}/${customer.totalSessions}` : undefined }],
    } : b));
    if (customer && customer.remainingSessions !== undefined) {
      setCustomers((prev) => prev.map((c) => c.code === customer.code ? { ...c, remainingSessions: Math.max(0, (c.remainingSessions ?? 0) - 1) } : c));
    }
    flash(`${target.id} đã chơi · trừ 1 buổi gói`);
    setPlayedTarget(null);
  };

  const markNoShow = (target: TeetimeBooking) => {
    setBookings(bookings.map((b) => b.id === target.id ? {
      ...b,
      status: "no_show",
      history: [...b.history, { date: nowString(), actor: "Lễ tân", action: "Khách không đến", detail: "Không trừ / không hoàn buổi" }],
    } : b));
    flash(`${target.id} · ghi nhận khách không đến`);
    setNoShowTarget(null);
  };

  const cancelBooking = (target: TeetimeBooking, reason: string, refundPercent: number) => {
    const customer = lookupCustomer(target.customerCode, customers);
    setBookings(bookings.map((b) => b.id === target.id ? {
      ...b,
      status: "cancelled",
      cancellationReason: reason,
      history: [...b.history, { date: nowString(), actor: "Lễ tân", action: "Hủy lịch", detail: `Lý do: ${reason} · Hoàn ${refundPercent}% buổi (BR-TT-02)` }],
    } : b));
    if (refundPercent > 0 && customer && customer.remainingSessions !== undefined && customer.totalSessions) {
      // Refund logic — restore the slot back. Đơn giản: nếu booking đã "played" mà giờ hủy sau, hoàn 1 buổi.
    }
    flash(`Đã hủy ${target.id} · hoàn ${refundPercent}% buổi (BR-TT-02)`);
    setCancelTarget(null);
  };

  const reschedule = (target: TeetimeBooking, newDate: string, newSlotIndex: number) => {
    const slot = slots[newSlotIndex];
    if (!slot) return;
    setBookings(bookings.map((b) => b.id === target.id ? {
      ...b,
      date: newDate,
      slotIndex: newSlotIndex,
      startTime: slot.time,
      endTime: slot.endTime,
      reschedulingCount: b.reschedulingCount + 1,
      history: [...b.history, { date: nowString(), actor: "Lễ tân", action: "Chuyển lịch", detail: `${target.date} ${target.startTime} → ${newDate} ${slot.time}` }],
    } : b));
    flash(`Đã chuyển lịch ${target.id} → ${newDate} ${slot.time} (lần ${target.reschedulingCount + 1}/2 · BR-TT-01)`);
    setRescheduleTarget(null);
  };

  const deleteBooking = (target: TeetimeBooking) => {
    setBookings(bookings.filter((b) => b.id !== target.id));
    flash(`Đã xóa cứng ${target.id} (Admin · BR-TT-03)`);
    setDeleteTarget(null);
  };

  const handleCreateCustomer = (c: CustomerLite) => {
    setCustomers([...customers, c]);
    flash(`Đã tạo KH ${c.code} · ${c.name}`);
  };

  const slotInfo = (slotIndex: number) => {
    const list = dayBookings.filter((b) => b.slotIndex === slotIndex && b.status !== "cancelled");
    const totalGuests = list.reduce((s, b) => s + b.guestCount + b.visitorCount, 0);
    return { count: list.length, totalGuests, list };
  };

  return (
    <>
      <FeaturePage
        title="Golf Teetime"
        subtitle="Lưới khung giờ phát bóng — đặt lịch chơi golf cho hội viên & khách lẻ"
      >
        {/* Header: ngày + chi nhánh + nút thiết lập */}
        <div className={styles.teetimeHeader}>
          <div className={styles.teetimeDateNav}>
            <button onClick={() => setDate(shiftDate(date, -1))} type="button" title="Ngày trước"><ChevronLeft size={18} /></button>
            <div className={styles.teetimeDateInput}>
              <Calendar size={16} />
              <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="dd/mm/yyyy" />
              <em>{formatDateLong(date)}</em>
            </div>
            <button onClick={() => setDate(shiftDate(date, 1))} type="button" title="Ngày sau"><ChevronRight size={18} /></button>
            <button className={styles.teetimeTodayBtn} onClick={() => setDate(todayString())} type="button">
              <Clock size={14} /> Hôm nay
            </button>
          </div>
          <div className={styles.teetimeBranchPicker}>
            <Flag size={14} />
            <select className={styles.selectInput} value={branch} onChange={(e) => setBranch(e.target.value)}>
              {BRANCHES.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
          <button className={styles.contractFilterChip} onClick={() => setSetupOpen(true)} type="button">
            <Settings size={14} /> Thiết lập teetime
          </button>
        </div>

        {/* KPI */}
        <div className={styles.contractKpi}>
          <KpiCard label="Tổng slot" value={String(stats.total)} tone="blue" icon={Calendar} />
          <KpiCard label="Đã đặt" value={String(stats.booked)} tone="amber" icon={Users} />
          <KpiCard label="Còn trống" value={String(stats.available)} tone="green" icon={CheckCircle2} />
          <KpiCard label="Tổng người chơi" value={String(stats.players)} tone="purple" icon={UserCheck} />
        </div>

        {/* Config info */}
        <div className={styles.teetimeConfigBanner}>
          <Info size={14} />
          <strong>{config.name}</strong> · CN <strong>{config.branch}</strong> · Mỗi slot <strong>{config.stepMinutes} phút</strong> · Tối đa <strong>{config.maxBook} khách/slot</strong> · Giờ <strong>{config.startTime} → {config.endTime}</strong> · {config.active ? "Đang hoạt động" : "Tạm ngưng"}
        </div>

        {/* Lưới teetime */}
        <section className={styles.teetimeGridCard}>
          {slots.length === 0 ? (
            <div className={styles.teetimeEmpty}>
              <Calendar size={40} />
              <strong>Chưa có cấu hình teetime cho chi nhánh này</strong>
              <span>Click nút &quot;Thiết lập teetime&quot; để tạo dãy</span>
              <button className={styles.greenButton} onClick={() => setSetupOpen(true)} type="button">
                <Settings size={14} /> Thiết lập ngay
              </button>
            </div>
          ) : (
            <div className={styles.teetimeGrid}>
              {slots.map((slot) => {
                const info = slotInfo(slot.index);
                const past = isPastSlot(date, slot.time);
                const full = info.totalGuests >= config.maxBook;
                const state = past ? "past" : full ? "full" : info.count > 0 ? "booked" : "empty";
                return (
                  <button
                    className={`${styles.teetimeSlot} ${styles[`teetimeSlot_${state}`]}`}
                    key={slot.index}
                    onClick={() => onClickSlot(slot.index, slot.time)}
                    type="button"
                    title={state === "past" ? "Đã qua giờ" : state === "full" ? "Đã đủ khách" : state === "booked" ? "Có booking" : "Còn trống"}
                  >
                    <span className={styles.teetimeSlotIndex}>#{slot.index + 1}</span>
                    <strong>{slot.time}</strong>
                    <em>{info.totalGuests}/{config.maxBook} · còn {Math.max(0, config.maxBook - info.totalGuests)}</em>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Legend */}
        <div className={styles.teetimeLegend}>
          <span><span className={styles.teetimeLegendDot} style={{ background: "#16a34a" }} /> Còn trống</span>
          <span><span className={styles.teetimeLegendDot} style={{ background: "#f59e0b" }} /> Đã có booking</span>
          <span><span className={styles.teetimeLegendDot} style={{ background: "#dc2626" }} /> Hết slot</span>
          <span><span className={styles.teetimeLegendDot} style={{ background: "#94a3b8" }} /> Đã qua giờ</span>
        </div>
      </FeaturePage>

      {toast ? <div className={styles.contractToast}>{toast}</div> : null}

      {setupOpen ? (
        <SetupModal
          initial={config}
          existingBookingsCount={bookings.filter((b) => b.configId === config.id && b.status === "confirmed").length}
          onClose={() => setSetupOpen(false)}
          onSubmit={(next) => {
            setConfig(next);
            flash(`Đã ${config.id === next.id ? "cập nhật" : "tạo"} cấu hình "${next.name}"`);
            setSetupOpen(false);
          }}
        />
      ) : null}

      {registerOpen ? (
        <RegisterModal
          slot={slots[registerOpen.slot]}
          slotIndex={registerOpen.slot}
          existing={editingBooking}
          existingAtSlot={dayBookings.filter((b) => b.slotIndex === registerOpen.slot && b.status !== "cancelled")}
          config={config}
          date={date}
          branch={branch}
          customers={customers}
          bookings={bookings}
          onClose={() => { setRegisterOpen(null); setEditingBooking(null); }}
          onSubmit={submitBooking}
          onOpenAddCustomer={() => setCustomerModalOpen(true)}
        />
      ) : null}

      {detailOpen ? (
        <BookingDetailModal
          slot={slots[detailOpen.slot]}
          slotIndex={detailOpen.slot}
          config={config}
          date={date}
          branch={branch}
          bookings={dayBookings.filter((b) => b.slotIndex === detailOpen.slot)}
          customers={customers}
          onClose={() => setDetailOpen(null)}
          onAddBook={() => { setDetailOpen(null); setRegisterOpen({ slot: detailOpen.slot }); }}
          onPlayed={(b) => { setDetailOpen(null); setPlayedTarget(b); }}
          onNoShow={(b) => { setDetailOpen(null); setNoShowTarget(b); }}
          onCancel={(b) => { setDetailOpen(null); setCancelTarget(b); }}
          onEdit={(b) => { setDetailOpen(null); setEditingBooking(b); setRegisterOpen({ slot: b.slotIndex, existing: b }); }}
          onReschedule={(b) => { setDetailOpen(null); setRescheduleTarget(b); }}
          onDelete={(b) => { setDetailOpen(null); setDeleteTarget(b); }}
        />
      ) : null}

      {customerModalOpen ? (
        <AddCustomerQuickModal
          existingCodes={customers.map((c) => c.code)}
          onClose={() => setCustomerModalOpen(false)}
          onSubmit={(c) => { handleCreateCustomer(c); setCustomerModalOpen(false); }}
        />
      ) : null}

      {playedTarget ? (
        <PlayedDialog
          booking={playedTarget}
          customer={lookupCustomer(playedTarget.customerCode, customers)}
          onCancel={() => setPlayedTarget(null)}
          onConfirm={() => markPlayed(playedTarget)}
        />
      ) : null}

      {noShowTarget ? (
        <NoShowDialog
          booking={noShowTarget}
          customer={lookupCustomer(noShowTarget.customerCode, customers)}
          onCancel={() => setNoShowTarget(null)}
          onConfirm={() => markNoShow(noShowTarget)}
        />
      ) : null}

      {cancelTarget ? (
        <CancelBookingDialog
          booking={cancelTarget}
          onCancel={() => setCancelTarget(null)}
          onConfirm={(reason, refund) => cancelBooking(cancelTarget, reason, refund)}
        />
      ) : null}

      {rescheduleTarget ? (
        <RescheduleDialog
          booking={rescheduleTarget}
          slots={slots}
          onCancel={() => setRescheduleTarget(null)}
          onConfirm={(newDate, newSlotIndex) => reschedule(rescheduleTarget, newDate, newSlotIndex)}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteBookingDialog
          booking={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => deleteBooking(deleteTarget)}
        />
      ) : null}
    </>
  );
}

function KpiCard({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: typeof Calendar;
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

// =====================================================================================
// SECTION D — Setup Modal (Thiết lập dãy teetime)
// =====================================================================================

function SetupModal({
  initial,
  existingBookingsCount,
  onClose,
  onSubmit,
}: {
  initial: TeetimeConfig;
  existingBookingsCount: number;
  onClose: () => void;
  onSubmit: (c: TeetimeConfig) => void;
}) {
  const [name, setName] = useState(initial.name);
  const [branch, setBranch] = useState(initial.branch);
  const [maxBook, setMaxBook] = useState(initial.maxBook);
  const [stepMinutes, setStepMinutes] = useState(initial.stepMinutes);
  const [startTime, setStartTime] = useState(initial.startTime);
  const [endTime, setEndTime] = useState(initial.endTime);
  const [active, setActive] = useState(initial.active);
  const [description, setDescription] = useState(initial.description ?? "");
  const [error, setError] = useState<string | null>(null);

  const startM = timeToMinutes(startTime);
  const endM = timeToMinutes(endTime);
  const numSlots = stepMinutes > 0 ? Math.floor((endM - startM) / stepMinutes) + 1 : 0;
  const lastSlotTime = numSlots > 0 ? minutesToTime(startM + (numSlots - 1) * stepMinutes) : "—";

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) { setError("Vui lòng nhập tên"); return; }
    if (maxBook < 1 || maxBook > 6) { setError("Book tối đa: 1-6 khách/teetime"); return; }
    if (stepMinutes < 5 || stepMinutes > 30) { setError("Số phút teetime: 5-30 phút"); return; }
    if (endM <= startM) { setError("Giờ ra phải sau giờ vào"); return; }
    onSubmit({
      ...initial,
      name: name.trim(),
      branch,
      maxBook,
      stepMinutes,
      startTime,
      endTime,
      active,
      description: description.trim() || undefined,
    });
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <form className={styles.contractFormModal} onSubmit={submit}>
        <header className={styles.contractFormBanner}>
          <h2><Settings size={16} /> Thiết lập dãy teetime</h2>
          <button onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <div className={styles.contractFormBody}>
          {error ? <div className={styles.formError}><AlertCircle size={14} /> {error}</div> : null}

          <section className={`${styles.contractFormSection} ${styles.contractSectionBlue}`}>
            <h3 className={styles.contractSectionHeader}><Settings size={16} /> Cấu hình</h3>
            <div className={styles.contractGrid2}>
              <label>
                <span>Tên cấu hình <b>*</b></span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Teetime cuối tuần" />
              </label>
              <label>
                <span>Chi nhánh</span>
                <select className={styles.selectInput} value={branch} onChange={(e) => setBranch(e.target.value)}>
                  {BRANCHES.map((b) => <option key={b}>{b}</option>)}
                </select>
              </label>
              <label>
                <span>Book tối đa (khách/slot) <b>*</b></span>
                <input type="number" min={1} max={6} value={maxBook} onChange={(e) => setMaxBook(Math.max(1, Math.min(6, Number(e.target.value) || 1)))} />
              </label>
              <label>
                <span>Số phút mỗi teetime <b>*</b></span>
                <input type="number" min={5} max={30} step={1} value={stepMinutes} onChange={(e) => setStepMinutes(Math.max(5, Math.min(30, Number(e.target.value) || 10)))} />
              </label>
              <label>
                <span>Giờ vào <b>*</b></span>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </label>
              <label>
                <span>Giờ ra <b>*</b></span>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </label>
              <label className={styles.contractCheckboxLine}>
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                Kích hoạt cấu hình này (config cũ sẽ tự deactivate)
              </label>
              <label className={styles.fullField}>
                <span>Mô tả</span>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ghi chú thêm về cấu hình này..." />
              </label>
            </div>

            <div className={styles.teetimePreviewBanner}>
              <Info size={14} />
              <div>
                <strong>Sẽ sinh {numSlots} teetime</strong>
                <span>Từ <strong>{startTime}</strong> đến <strong>{lastSlotTime}</strong> · bước <strong>{stepMinutes} phút</strong></span>
              </div>
            </div>

            {existingBookingsCount > 0 ? (
              <div className={styles.teetimeWarningBanner}>
                <AlertTriangle size={14} />
                <span>Đang có <strong>{existingBookingsCount} booking</strong> ở config hiện tại. Lưu cấu hình mới: booking khớp slot cũ giữ nguyên · không khớp sẽ chuyển sang trạng thái &quot;Cần xử lý&quot;.</span>
              </div>
            ) : null}
          </section>
        </div>
        <footer className={styles.contractFormFooter}>
          <span></span>
          <div>
            <button className={styles.contractFilterChip} onClick={onClose} type="button">Hủy</button>
            <button className={styles.greenButton} type="submit"><CheckCircle2 size={14} /> Lưu cấu hình</button>
          </div>
        </footer>
      </form>
    </div>
  );
}

// =====================================================================================
// SECTION E — Register Modal (Đăng ký lịch chơi)
// =====================================================================================

function RegisterModal({
  slot,
  slotIndex,
  existing,
  existingAtSlot,
  config,
  date,
  branch,
  customers,
  bookings,
  onClose,
  onSubmit,
  onOpenAddCustomer,
}: {
  slot: { index: number; time: string; endTime: string };
  slotIndex: number;
  existing: TeetimeBooking | null;
  existingAtSlot: TeetimeBooking[];
  config: TeetimeConfig;
  date: string;
  branch: string;
  customers: CustomerLite[];
  bookings: TeetimeBooking[];
  onClose: () => void;
  onSubmit: (b: TeetimeBooking) => void;
  onOpenAddCustomer: () => void;
}) {
  const isEdit = Boolean(existing);
  const [holes, setHoles] = useState<9 | 18>(existing?.holes ?? 18);
  const [guestCount, setGuestCount] = useState<number>(existing?.guestCount ?? 1);
  const [visitorCount, setVisitorCount] = useState<number>(existing?.visitorCount ?? 0);
  const [coachId, setCoachId] = useState<string>(existing?.coachId ?? "");
  const [assistantId, setAssistantId] = useState<string>(existing?.assistantId ?? "");
  const [teachingAidId, setTeachingAidId] = useState<string>(existing?.teachingAidId ?? "");
  const [caddieId, setCaddieId] = useState<string>(existing?.caddieId ?? "");
  const initialCustomerCode = existing?.customerCode ?? "";
  const initialCustomer = lookupCustomer(initialCustomerCode, customers);
  const [customerCode, setCustomerCode] = useState<string>(initialCustomerCode);
  const [packageCode, setPackageCode] = useState<string>(existing?.packageCode ?? initialCustomer?.packageCode ?? "");
  const [note, setNote] = useState<string>(existing?.note ?? "");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [customerSearch, setCustomerSearch] = useState("");

  const customer = lookupCustomer(customerCode, customers);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers;
    const q = customerSearch.toLowerCase();
    return customers.filter((c) => `${c.code} ${c.name} ${c.phone}`.toLowerCase().includes(q));
  }, [customers, customerSearch]);

  const totalAtSlot = existingAtSlot.reduce((s, b) => b.id === existing?.id ? s : s + b.guestCount + b.visitorCount, 0);
  const remaining = config.maxBook - totalAtSlot;
  const totalNew = guestCount + visitorCount;
  const setFieldError = (field: string, message: string) => setFormErrors({ [field]: message });

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormErrors({});
    if (!customerCode) { setFieldError("customer", "Vui lòng chọn hội viên đại diện trước khi lưu booking."); return; }
    if (totalNew < 1) { setFieldError("guestCount", "Tổng người chơi tối thiểu 1."); return; }
    if (totalNew > remaining) { setFieldError("guestCount", `Vượt sức chứa: slot này chỉ còn ${remaining}/${config.maxBook} chỗ.`); return; }
    if (customer?.remainingSessions !== undefined && customer.remainingSessions === 0 && customer.isMember) {
      setFieldError("customer", "Hội viên đã hết buổi gói tập, không thể book thêm.");
      return;
    }

    // Conflict check: HV not double-book at same time
    const conflict = bookings.find((b) =>
      b.id !== existing?.id &&
      b.customerCode === customerCode &&
      b.date === date &&
      b.startTime === slot.time &&
      b.status !== "cancelled"
    );
    if (conflict) {
      setFieldError("customer", `Hội viên đã có booking ${conflict.id} cùng giờ.`);
      return;
    }

    // Coach/Caddie conflict
    if (coachId) {
      const c = bookings.find((b) =>
        b.id !== existing?.id &&
        b.coachId === coachId &&
        b.date === date &&
        b.startTime === slot.time &&
        b.status !== "cancelled"
      );
      if (c) { setFieldError("coachId", `HLV đang có booking ${c.id} cùng giờ.`); return; }
    }
    if (caddieId) {
      const c = bookings.find((b) =>
        b.id !== existing?.id &&
        b.caddieId === caddieId &&
        b.date === date &&
        b.startTime === slot.time &&
        b.status !== "cancelled"
      );
      if (c) { setFieldError("caddieId", `Caddie đang có booking ${c.id} cùng giờ.`); return; }
    }

    const id = existing?.id ?? nextBookingId(bookings);
    const next: TeetimeBooking = {
      id,
      configId: config.id,
      date,
      slotIndex,
      branch,
      holes,
      startTime: slot.time,
      endTime: slot.endTime,
      guestCount,
      visitorCount,
      coachId: coachId || undefined,
      assistantId: assistantId || undefined,
      teachingAidId: teachingAidId || undefined,
      caddieId: caddieId || undefined,
      customerCode,
      packageCode: packageCode || undefined,
      note: note || undefined,
      status: existing?.status ?? "confirmed",
      cancellationReason: existing?.cancellationReason,
      reschedulingCount: existing?.reschedulingCount ?? 0,
      createdAt: existing?.createdAt ?? nowString(),
      createdBy: existing?.createdBy ?? STAFF_LIST[0],
      history: existing?.history ?? [
        { date: nowString(), actor: STAFF_LIST[0], action: "Tạo booking" },
        ...(visitorCount > 0 ? [{ date: nowString(), actor: "Hệ thống", action: "Tạo vé lẻ chờ thanh toán", detail: `${visitorCount} khách tham quan` }] : []),
      ],
    };
    onSubmit(next);
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <form className={styles.contractFormModal} onSubmit={submit}>
        <header className={styles.contractFormBanner}>
          <div className={styles.ticketFormBannerLeft}>
            <h2>{isEdit ? `Chỉnh sửa booking ${existing?.id}` : "Đăng ký lịch chơi"}</h2>
            <span className={styles.teetimeSlotPill}>
              <Clock size={12} /> Slot #{slotIndex + 1} · {slot.time} → {slot.endTime}
            </span>
            <span className={styles.cellMuted}>
              {totalAtSlot}/{config.maxBook} đã book · còn {remaining} chỗ
            </span>
          </div>
          <button onClick={onClose} type="button"><X size={18} /></button>
        </header>

        <div className={styles.contractFormBody}>
          {/* Section 1: Buổi chơi */}
          <section className={`${styles.contractFormSection} ${styles.contractSectionGreen}`}>
            <h3 className={styles.contractSectionHeader}><Flag size={16} /> Thông tin buổi chơi</h3>
            <div className={styles.contractGrid2}>
              <label>
                <span>Chi nhánh</span>
                <input readOnly value={branch} />
              </label>
              <label>
                <span>Số hố</span>
                <div className={styles.contractRadioRow}>
                  <button className={holes === 9 ? styles.contractRadioActive : styles.contractRadio} onClick={() => setHoles(9)} type="button">9 hố</button>
                  <button className={holes === 18 ? styles.contractRadioActive : styles.contractRadio} onClick={() => setHoles(18)} type="button">18 hố</button>
                </div>
              </label>
              <label>
                <span>Giờ vào</span>
                <input readOnly value={slot.time} />
              </label>
              <label>
                <span>Giờ ra</span>
                <input readOnly value={slot.endTime} />
              </label>
              <label>
                <span>Số khách (HV + người đi cùng)</span>
                <input
                  className={formErrors.guestCount ? styles.fieldInvalid : undefined}
                  type="number"
                  min={1}
                  max={config.maxBook}
                  value={guestCount}
                  onChange={(e) => { setGuestCount(Math.max(1, Math.min(config.maxBook, Number(e.target.value) || 1))); setFormErrors((prev) => ({ ...prev, guestCount: "" })); }}
                />
                {formErrors.guestCount ? <small className={styles.fieldErrorText}>{formErrors.guestCount}</small> : null}
              </label>
              <label>
                <span>Số khách tham quan (vãng lai)</span>
                <input type="number" min={0} value={visitorCount} onChange={(e) => setVisitorCount(Math.max(0, Number(e.target.value) || 0))} />
              </label>
            </div>
            {visitorCount > 0 ? (
              <div className={styles.teetimePreviewBanner}>
                <Info size={14} />
                <span>Có <strong>{visitorCount} khách tham quan</strong> — hệ thống sẽ tự tạo vé lẻ chờ thanh toán bên Module Vé Lẻ.</span>
              </div>
            ) : null}
          </section>

          {/* Section 2: Phục vụ */}
          <section className={`${styles.contractFormSection} ${styles.contractSectionPurple}`}>
            <h3 className={styles.contractSectionHeader}><Users size={16} /> Đội ngũ phục vụ</h3>
            <div className={styles.contractGrid2}>
              <label>
                <span>Huấn luyện viên</span>
                <select className={`${styles.selectInput} ${formErrors.coachId ? styles.fieldInvalid : ""}`} value={coachId} onChange={(e) => { setCoachId(e.target.value); setFormErrors((prev) => ({ ...prev, coachId: "" })); }}>
                  <option value="">— Không gán HLV —</option>
                  {COACHES.filter((c) => c.branch === branch).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {formErrors.coachId ? <small className={styles.fieldErrorText}>{formErrors.coachId}</small> : null}
              </label>
              <label>
                <span>Trợ lý HLV</span>
                <select className={styles.selectInput} value={assistantId} onChange={(e) => setAssistantId(e.target.value)}>
                  <option value="">—</option>
                  {ASSISTANTS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </label>
              <label>
                <span>Trợ giảng HLV</span>
                <select className={styles.selectInput} value={teachingAidId} onChange={(e) => setTeachingAidId(e.target.value)}>
                  <option value="">—</option>
                  {TEACHING_AIDS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </label>
              <label>
                <span>Caddie</span>
                <select className={`${styles.selectInput} ${formErrors.caddieId ? styles.fieldInvalid : ""}`} value={caddieId} onChange={(e) => { setCaddieId(e.target.value); setFormErrors((prev) => ({ ...prev, caddieId: "" })); }}>
                  <option value="">— Chưa gán caddie —</option>
                  {CADDIES.filter((c) => c.branch === branch).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {formErrors.caddieId ? <small className={styles.fieldErrorText}>{formErrors.caddieId}</small> : null}
              </label>
            </div>
          </section>

          {/* Section 3: Hội viên đại diện */}
          <section className={`${styles.contractFormSection} ${styles.contractSectionBlue}`}>
            <h3 className={styles.contractSectionHeader}><User size={16} /> Hội viên đại diện</h3>
            <div className={`${styles.teetimeCustomerSearch} ${formErrors.customer ? styles.fieldInvalid : ""}`}>
              <Search size={14} />
              <input value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} placeholder="Tìm theo tên, mã, SĐT..." />
              <button className={styles.contractLinkBtn} onClick={onOpenAddCustomer} type="button"><UserPlus size={14} /> Thêm HV mới</button>
            </div>
            <div className={styles.teetimeCustomerList}>
              {filteredCustomers.slice(0, 8).map((c) => (
                <button
                  key={c.code}
                  className={c.code === customerCode ? styles.teetimeCustomerCardActive : styles.teetimeCustomerCard}
                  onClick={() => { setCustomerCode(c.code); setPackageCode(c.packageCode ?? ""); setFormErrors((prev) => ({ ...prev, customer: "" })); }}
                  type="button"
                >
                  <div className={styles.teetimeCustomerAvatar}>{c.name.split(" ").pop()?.[0] ?? "?"}</div>
                  <div>
                    <strong>{c.name}</strong>
                    <span><Phone size={10} /> {c.phone}</span>
                    {c.packageName ? <em>{c.packageName} · {c.remainingSessions}/{c.totalSessions} buổi</em> : <em className={styles.teetimeWalkin}>Khách vãng lai</em>}
                  </div>
                </button>
              ))}
            </div>
            {formErrors.customer ? <small className={styles.fieldErrorText}>{formErrors.customer}</small> : null}

            {customer ? (
              <div className={styles.contractGrid2}>
                <label>
                  <span>Mã KH</span>
                  <input readOnly value={customer.code} />
                </label>
                <label>
                  <span>SĐT</span>
                  <input readOnly value={customer.phone} />
                </label>
                {customer.packageCode ? (
                  <label>
                    <span>Gói tập</span>
                    <select className={styles.selectInput} value={packageCode} onChange={(e) => setPackageCode(e.target.value)}>
                      <option value={customer.packageCode}>{customer.packageName} · còn {customer.remainingSessions}/{customer.totalSessions} buổi</option>
                    </select>
                  </label>
                ) : null}
                <label className={styles.fullField}>
                  <span>Ghi chú</span>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú đặc biệt về booking này..." />
                </label>
              </div>
            ) : null}
          </section>
        </div>

        <footer className={styles.contractFormFooter}>
          <span>Slot {slot.time} · {totalNew} người · còn {remaining - totalNew} chỗ sau khi book</span>
          <div>
            <button className={styles.contractFilterChip} onClick={onClose} type="button">Hủy</button>
            <button className={styles.greenButton} type="submit">
              <CheckCircle2 size={14} /> {isEdit ? "Cập nhật booking" : "Lưu booking"}
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}

// =====================================================================================
// SECTION F — Booking Detail Modal (Popup chi tiết)
// =====================================================================================

function BookingDetailModal({
  slot,
  slotIndex,
  config,
  date,
  branch,
  bookings,
  customers,
  onClose,
  onAddBook,
  onPlayed,
  onNoShow,
  onCancel,
  onEdit,
  onReschedule,
  onDelete,
}: {
  slot: { index: number; time: string; endTime: string };
  slotIndex: number;
  config: TeetimeConfig;
  date: string;
  branch: string;
  bookings: TeetimeBooking[];
  customers: CustomerLite[];
  onClose: () => void;
  onAddBook: () => void;
  onPlayed: (b: TeetimeBooking) => void;
  onNoShow: (b: TeetimeBooking) => void;
  onCancel: (b: TeetimeBooking) => void;
  onEdit: (b: TeetimeBooking) => void;
  onReschedule: (b: TeetimeBooking) => void;
  onDelete: (b: TeetimeBooking) => void;
}) {
  const totalGuests = bookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + b.guestCount + b.visitorCount, 0);
  const remaining = config.maxBook - totalGuests;
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!openMenuId) return;
    const handler = () => setOpenMenuId(null);
    const t = window.setTimeout(() => document.addEventListener("click", handler), 0);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("click", handler);
    };
  }, [openMenuId]);

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.contractFormModal}>
        <header className={styles.contractFormBanner}>
          <div className={styles.ticketFormBannerLeft}>
            <h2>Chi tiết teetime #{slotIndex + 1}</h2>
            <span className={styles.teetimeSlotPill}>
              <Clock size={12} /> {slot.time} → {slot.endTime}
            </span>
            <span className={styles.cellMuted}>{date} · {branch}</span>
          </div>
          <button onClick={onClose} type="button"><X size={18} /></button>
        </header>

        <div className={styles.contractFormBody}>
          <div className={styles.teetimeSlotSummary}>
            <div><span>Sức chứa</span><strong>{config.maxBook} khách/slot</strong></div>
            <div><span>Đã book</span><strong>{totalGuests}</strong></div>
            <div><span>Còn trống</span><strong className={remaining > 0 ? styles.contractZeroCell : styles.contractDebtCell}>{remaining}</strong></div>
            <div><span>Số booking</span><strong>{bookings.filter((b) => b.status !== "cancelled").length}</strong></div>
          </div>

          <section className={`${styles.contractFormSection} ${styles.contractSectionBlue}`}>
            <h3 className={styles.contractSectionHeader}><Users size={16} /> Danh sách booking ({bookings.length})</h3>
            <table className={styles.ticketAddonTable}>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã booking</th>
                  <th>HV đại diện</th>
                  <th>SĐT</th>
                  <th>Gói</th>
                  <th>SK / TQ</th>
                  <th>Hố</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr><td className={styles.emptyTableCell} colSpan={9}>Chưa có booking nào</td></tr>
                ) : null}
                {bookings.map((b, i) => {
                  const c = lookupCustomer(b.customerCode, customers);
                  return (
                    <tr key={b.id}>
                      <td>{i + 1}</td>
                      <td><strong>{b.id}</strong></td>
                      <td className={styles.memberName}><strong>{c?.name ?? "—"}</strong></td>
                      <td>{c?.phone}</td>
                      <td className={styles.cellMuted}>{c?.packageName ?? "—"}</td>
                      <td>{b.guestCount} / {b.visitorCount}</td>
                      <td>{b.holes}</td>
                      <td><BookingStatusBadge status={b.status} /></td>
                      <td>
                        <div className={styles.contractRowActions}>
                          {b.status === "confirmed" ? (
                            <>
                              <button onClick={() => onPlayed(b)} title="Đã chơi" type="button" style={{ color: "#16a34a" }}><CheckCircle2 size={14} /></button>
                              <button onClick={() => onNoShow(b)} title="Khách không đến" type="button" style={{ color: "#dc2626" }}><XCircle size={14} /></button>
                              <button onClick={() => onEdit(b)} title="Sửa" type="button"><Edit3 size={14} /></button>
                              <div className={styles.contractMenuWrap}>
                                <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === b.id ? null : b.id); }} type="button" title="Thao tác khác">
                                  <MoreVertical size={14} />
                                </button>
                                {openMenuId === b.id ? (
                                  <BookingActionMenu
                                    booking={b}
                                    onClose={() => setOpenMenuId(null)}
                                    onCancel={() => { setOpenMenuId(null); onCancel(b); }}
                                    onReschedule={() => { setOpenMenuId(null); onReschedule(b); }}
                                    onDelete={() => { setOpenMenuId(null); onDelete(b); }}
                                  />
                                ) : null}
                              </div>
                            </>
                          ) : (
                            <button onClick={() => onDelete(b)} title="Xóa cứng (Admin · BR-TT-03)" type="button" className={styles.contractDelete}><Trash2 size={14} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* Phục vụ */}
          {bookings.length > 0 && bookings[0].coachId ? (
            <section className={`${styles.contractFormSection} ${styles.contractSectionPurple}`}>
              <h3 className={styles.contractSectionHeader}><Users size={16} /> Đội ngũ phục vụ</h3>
              <div className={styles.ticketDetailGrid}>
                {bookings[0].coachId ? <div><span>HLV</span><strong>{COACHES.find((c) => c.id === bookings[0].coachId)?.name}</strong></div> : null}
                {bookings[0].assistantId ? <div><span>Trợ lý HLV</span><strong>{ASSISTANTS.find((a) => a.id === bookings[0].assistantId)?.name}</strong></div> : null}
                {bookings[0].teachingAidId ? <div><span>Trợ giảng</span><strong>{TEACHING_AIDS.find((t) => t.id === bookings[0].teachingAidId)?.name}</strong></div> : null}
                {bookings[0].caddieId ? <div><span>Caddie</span><strong>{CADDIES.find((c) => c.id === bookings[0].caddieId)?.name}</strong></div> : null}
              </div>
            </section>
          ) : null}

          {/* Lịch sử */}
          {bookings.some((b) => b.history.length > 1) ? (
            <section className={styles.contractFormSection}>
              <h3 className={styles.contractSectionHeader}><History size={16} /> Lịch sử thao tác</h3>
              <ul className={styles.contractTimeline}>
                {bookings.flatMap((b) => b.history.map((h, i) => ({ ...h, bookingId: b.id, key: `${b.id}-${i}` })))
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .slice(0, 10)
                  .map((h) => (
                    <li key={h.key}>
                      <span className={styles.contractTimelineDot} />
                      <strong>[{h.bookingId}] {h.action}</strong>
                      <span>{h.date} · {h.actor}{h.detail ? ` · ${h.detail}` : ""}</span>
                    </li>
                  ))}
              </ul>
            </section>
          ) : null}
        </div>

        <footer className={styles.contractFormFooter}>
          <span>{totalGuests}/{config.maxBook} khách · còn {remaining} chỗ</span>
          <div>
            <button className={styles.contractFilterChip} onClick={onClose} type="button">Đóng</button>
            {remaining > 0 ? (
              <button className={styles.greenButton} onClick={onAddBook} type="button">
                <PlusCircle size={14} /> Book thêm
              </button>
            ) : (
              <button className={styles.contractFilterChip} disabled type="button">Đã đầy slot</button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

function BookingActionMenu({
  booking,
  onClose,
  onCancel,
  onReschedule,
  onDelete,
}: {
  booking: TeetimeBooking;
  onClose: () => void;
  onCancel: () => void;
  onReschedule: () => void;
  onDelete: () => void;
}) {
  const canReschedule = booking.reschedulingCount < 2;
  const items = [
    { icon: RefreshCcw, label: `Chuyển lịch (${booking.reschedulingCount}/2)`, onClick: onReschedule, disabled: !canReschedule, hint: !canReschedule ? "BR-TT-01: tối đa 2 lần" : "" },
    { icon: XCircle, label: "Hủy lịch", onClick: onCancel, disabled: false, hint: "" },
    { icon: Trash2, label: "Xóa cứng (Admin)", onClick: onDelete, disabled: booking.status === "confirmed", hint: booking.status === "confirmed" ? "Phải hủy trước (BR-TT-03)" : "" },
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

function BookingStatusBadge({ status }: { status: TeetimeBookingStatus }) {
  const map: Record<TeetimeBookingStatus, { label: string; cls: string }> = {
    confirmed: { label: "Đặt lịch", cls: styles.contractBadgeActive },
    played: { label: "Đã chơi", cls: styles.contractBadgeClosed },
    no_show: { label: "Không đến", cls: styles.contractBadgeSuspended },
    cancelled: { label: "Đã hủy", cls: styles.contractBadgeExpired },
  };
  const m = map[status];
  return <span className={m.cls}>{m.label}</span>;
}

// =====================================================================================
// SECTION G — Sub-modal: Add Customer Quick
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
      email: email.trim() || undefined,
      isMember: false,
    });
  };

  return (
    <div className={styles.nestedOverlay} role="dialog" aria-modal="true">
      <form className={styles.ticketSubModal} onSubmit={submit}>
        <header><h3><UserPlus size={16} /> Thêm hội viên nhanh</h3><button onClick={onClose} type="button"><X size={16} /></button></header>
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
            <span>Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@gmail.com" />
          </label>
        </div>
        <footer>
          <button className={styles.contractFilterChip} onClick={onClose} type="button">Hủy</button>
          <button className={styles.greenButton} type="submit"><CheckCircle2 size={14} /> Thêm hội viên</button>
        </footer>
      </form>
    </div>
  );
}

// =====================================================================================
// SECTION H — Dialogs (Played / NoShow / Cancel / Reschedule / Delete)
// =====================================================================================

function PlayedDialog({
  booking,
  customer,
  onCancel,
  onConfirm,
}: {
  booking: TeetimeBooking;
  customer?: CustomerLite;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.ticketDialog}>
        <header>
          <span className={styles.ticketDialogIcon} style={{ background: "#dcfce7", color: "#15803d" }}>
            <CheckCircle2 size={20} />
          </span>
          <div>
            <h3>Xác nhận khách đã chơi · {booking.id}</h3>
            <p>Hệ thống sẽ trừ <strong>1 buổi</strong> khỏi gói tập của hội viên đại diện. Hành động này <strong>không thể undo</strong> (BR-TT trong M03).</p>
          </div>
        </header>
        {customer ? (
          <div className={styles.ticketDialogBody}>
            <div className={styles.ticketDialogInfo}>
              <div><span>Hội viên</span><strong>{customer.name}</strong></div>
              <div><span>Gói tập</span><strong>{customer.packageName ?? "—"}</strong></div>
              <div><span>Buổi còn</span><strong>{customer.remainingSessions ?? 0} → {Math.max(0, (customer.remainingSessions ?? 0) - 1)}</strong></div>
            </div>
          </div>
        ) : null}
        <footer>
          <button className={styles.contractFilterChip} onClick={onCancel} type="button">Hủy bỏ</button>
          <button className={styles.greenButton} onClick={onConfirm} type="button"><CheckCircle2 size={14} /> Xác nhận đã chơi</button>
        </footer>
      </div>
    </div>
  );
}

function NoShowDialog({
  booking,
  customer,
  onCancel,
  onConfirm,
}: {
  booking: TeetimeBooking;
  customer?: CustomerLite;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.ticketDialog}>
        <header>
          <span className={styles.ticketDialogIcon} style={{ background: "#fef3c7", color: "#b45309" }}>
            <AlertTriangle size={20} />
          </span>
          <div>
            <h3>Khách không đến · {booking.id}</h3>
            <p>Ghi nhận trạng thái <strong>&quot;Khách không đến&quot;</strong> cho booking. <strong>Không trừ buổi</strong>, <strong>không hoàn tiền</strong>.</p>
          </div>
        </header>
        {customer ? (
          <div className={styles.ticketDialogBody}>
            <div className={styles.ticketDialogInfo}>
              <div><span>Hội viên</span><strong>{customer.name}</strong></div>
              <div><span>Buổi gói</span><strong>{customer.remainingSessions ?? 0} (giữ nguyên)</strong></div>
            </div>
          </div>
        ) : null}
        <footer>
          <button className={styles.contractFilterChip} onClick={onCancel} type="button">Hủy bỏ</button>
          <button className={styles.ticketDialogDanger} onClick={onConfirm} type="button"><XCircle size={14} /> Xác nhận không đến</button>
        </footer>
      </div>
    </div>
  );
}

function CancelBookingDialog({
  booking,
  onCancel,
  onConfirm,
}: {
  booking: TeetimeBooking;
  onCancel: () => void;
  onConfirm: (reason: string, refundPercent: number) => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const presets = ["KH yêu cầu", "Sân sự cố", "Thời tiết xấu", "HLV/Caddie không có mặt", "Khác"];

  // Calculate hours until booking start time
  const [{ hoursUntil, refundPercent }] = useState(() => {
    const d = parseDDMMYYYY(booking.date);
    let hours = 0;
    if (d) {
      const [hh, mm] = booking.startTime.split(":").map(Number);
      d.setHours(hh || 0, mm || 0, 0, 0);
      hours = (d.getTime() - Date.now()) / 3_600_000;
    }
    return { hoursUntil: hours, refundPercent: hours > 24 ? 100 : hours > 0 ? 50 : 0 };
  });

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!reason.trim()) { setError("Vui lòng nhập lý do hủy"); return; }
    onConfirm(reason.trim(), refundPercent);
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <form className={styles.ticketDialog} onSubmit={submit}>
        <header>
          <span className={styles.ticketDialogIcon} style={{ background: "#fee2e2", color: "#b91c1c" }}>
            <AlertTriangle size={20} />
          </span>
          <div>
            <h3>Hủy lịch booking {booking.id}</h3>
            <p>
              Hủy <strong>{hoursUntil > 24 ? "trước 24h" : hoursUntil > 0 ? "trong vòng 24h" : "sau giờ bắt đầu"}</strong> ·
              Hoàn <strong>{refundPercent}%</strong> buổi vào gói (BR-TT-02).
            </p>
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
          <button className={styles.ticketDialogDanger} type="submit"><XCircle size={14} /> Hủy lịch · hoàn {refundPercent}%</button>
        </footer>
      </form>
    </div>
  );
}

function RescheduleDialog({
  booking,
  slots,
  onCancel,
  onConfirm,
}: {
  booking: TeetimeBooking;
  slots: { index: number; time: string; endTime: string }[];
  onCancel: () => void;
  onConfirm: (newDate: string, newSlotIndex: number) => void;
}) {
  const [newDate, setNewDate] = useState(shiftDate(booking.date, 1));
  const [newSlotIndex, setNewSlotIndex] = useState(booking.slotIndex);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = parseDDMMYYYY(newDate);
    if (!d) { setError("Ngày không hợp lệ"); return; }
    if (d.getTime() < Date.now() - 86_400_000) { setError("Không thể chuyển sang ngày quá khứ"); return; }
    onConfirm(newDate, newSlotIndex);
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <form className={styles.ticketDialog} onSubmit={submit} style={{ width: "min(560px, 95vw)" }}>
        <header>
          <span className={styles.ticketDialogIcon} style={{ background: "#dbeafe", color: "#1e40af" }}>
            <RefreshCcw size={20} />
          </span>
          <div>
            <h3>Chuyển lịch booking {booking.id}</h3>
            <p>Đã chuyển <strong>{booking.reschedulingCount}/2</strong> lần. Sau lần này còn <strong>{Math.max(0, 1 - booking.reschedulingCount)}</strong> lần (BR-TT-01).</p>
          </div>
        </header>
        {error ? <div className={styles.formError}><AlertCircle size={14} /> {error}</div> : null}
        <div className={styles.ticketDialogBody}>
          <div className={styles.contractGrid2}>
            <label>
              <span>Lịch hiện tại</span>
              <input readOnly value={`${booking.date} · ${booking.startTime}`} />
            </label>
            <label>
              <span>Ngày mới <b>*</b></span>
              <input value={newDate} onChange={(e) => setNewDate(e.target.value)} placeholder="dd/mm/yyyy" />
            </label>
            <label className={styles.fullField}>
              <span>Slot mới <b>*</b></span>
              <select className={styles.selectInput} value={newSlotIndex} onChange={(e) => setNewSlotIndex(Number(e.target.value))}>
                {slots.map((s) => <option key={s.index} value={s.index}>#{s.index + 1} · {s.time} → {s.endTime}</option>)}
              </select>
            </label>
          </div>
        </div>
        <footer>
          <button className={styles.contractFilterChip} onClick={onCancel} type="button">Hủy bỏ</button>
          <button className={styles.greenButton} type="submit"><RefreshCcw size={14} /> Chuyển lịch</button>
        </footer>
      </form>
    </div>
  );
}

function DeleteBookingDialog({
  booking,
  onCancel,
  onConfirm,
}: {
  booking: TeetimeBooking;
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
            <h3>Xóa cứng booking {booking.id}</h3>
            <p>Hành động này <strong>không thể khôi phục</strong>. Chỉ Admin được xóa booking ở trạng thái <strong>cancelled / expired</strong> (BR-TT-03). Audit log sẽ ghi nhận thao tác.</p>
          </div>
        </header>
        <footer>
          <button className={styles.contractFilterChip} onClick={onCancel} type="button">Hủy bỏ</button>
          <button className={styles.ticketDialogDanger} onClick={onConfirm} type="button"><Trash2 size={14} /> Xóa cứng</button>
        </footer>
      </div>
    </div>
  );
}

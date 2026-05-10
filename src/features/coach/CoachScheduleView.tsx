"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  Flag,
  History,
  MessageSquare,
  PlusCircle,
  Search,
  Settings,
  Trash2,
  User,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import styles from "@/shared/styles/feature-styles.module.css";
import { FeaturePage } from "@/shared/components";

// =====================================================================================
// SECTION A — Constants
// =====================================================================================

const BRANCHES = ["NextVision", "Hà Nội Center", "Sài Gòn West"] as const;

const COACHES = [
  { id: "TR-001", code: "TR-001", name: "Trần Văn An", specialty: "Swing cơ bản", branch: "NextVision" },
  { id: "TR-002", code: "TR-002", name: "Đỗ Hồng Quân", specialty: "Putting & Short Game", branch: "NextVision" },
  { id: "TR-003", code: "TR-003", name: "Nguyễn Mai", specialty: "Driver, Long Iron", branch: "NextVision" },
  { id: "TR-004", code: "TR-004", name: "Phạm Hùng", specialty: "Course Management", branch: "NextVision" },
  { id: "TR-005", code: "TR-005", name: "Hoàng Tuấn", specialty: "Lesson Pro", branch: "Hà Nội Center" },
] as const;

const TEACHING_AIDS = [
  { id: "TGV-001", name: "Vũ Hoàng Long" },
  { id: "TGV-002", name: "Đặng Minh Châu" },
  { id: "TGV-003", name: "Nguyễn Thái Bình" },
] as const;

const STAFF_LIST = ["Nguyễn Thị Lan", "Phạm Văn Đức", "Hoàng Mỹ Linh", "Trần Quốc Bảo"] as const;
const DAYS_VN = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"] as const;
const DURATION_OPTIONS = [30, 45, 60, 90, 120] as const;

// Slots 15 phút từ 06:00 → 21:45
const generateAllSlots = (): string[] => {
  const slots: string[] = [];
  for (let h = 6; h <= 21; h += 1) {
    for (let m = 0; m < 60; m += 15) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
};
const ALL_SLOTS = generateAllSlots();
const COACH_TIME_COL_WIDTH = 104;
const COACH_COL_WIDTH = 246;
const COACH_SLOT_HEIGHT = 40;

// =====================================================================================
// SECTION B — Types
// =====================================================================================

type CustomerLite = {
  code: string;
  name: string;
  phone: string;
  packageCode?: string;
  packageName?: string;
  remainingSessions: number;
  totalSessions: number;
};

type SessionStatus = "scheduled" | "completed" | "cancelled" | "no_show";

type CoachSession = {
  id: string;
  date: string;            // dd/mm/yyyy
  startTime: string;       // HH:mm
  endTime: string;         // HH:mm (= start + duration)
  durationMinutes: number;
  branch: string;
  coachId: string;
  teachingAidId?: string;
  customerCode: string;
  packageCode?: string;
  note?: string;
  status: SessionStatus;
  cancellationReason?: string;
  rescheduledCount: number;
  reviews: { date: string; lesson: string; note?: string }[];
  createdAt: string;
  createdBy: string;
  history: { date: string; actor: string; action: string; detail?: string }[];
};

type BookingConfig = {
  id: string;
  name: string;
  branch: string;
  startTime: string;
  endTime: string;
  active: boolean;
  description?: string;
};

// =====================================================================================
// SECTION C — Seed data
// =====================================================================================

const INITIAL_CUSTOMERS: CustomerLite[] = [
  { code: "HV001", name: "Nguyễn Văn A", phone: "0901234567", packageCode: "P002", packageName: "Gói Cao Cấp Golf", remainingSessions: 18, totalSessions: 24 },
  { code: "HV002", name: "Trần Thị B", phone: "0902345678", packageCode: "P001", packageName: "Gói Cơ Bản Golf", remainingSessions: 5, totalSessions: 8 },
  { code: "HV003", name: "Lê Văn C", phone: "0923456789", packageCode: "P003", packageName: "Gói Premium Practice", remainingSessions: 12, totalSessions: 30 },
  { code: "HV005", name: "Huỳnh Xuân Long", phone: "0910070932", packageCode: "P007", packageName: "Gói VIP Master", remainingSessions: 42, totalSessions: 60 },
  { code: "HV012", name: "Đỗ Mai Hương", phone: "0345678901", packageCode: "P004", packageName: "Gói Family Combo", remainingSessions: 38, totalSessions: 50 },
];

const INITIAL_SESSIONS: CoachSession[] = [
  {
    id: "SS-2605-001", date: "08/05/2026", startTime: "07:00", endTime: "08:00", durationMinutes: 60,
    branch: "NextVision", coachId: "TR-001", teachingAidId: "TGV-001",
    customerCode: "HV001", packageCode: "P002",
    note: "Tập swing cơ bản", status: "scheduled", rescheduledCount: 0, reviews: [],
    createdAt: "07/05/2026 16:00", createdBy: "Nguyễn Thị Lan",
    history: [{ date: "07/05/2026 16:00", actor: "Nguyễn Thị Lan", action: "Tạo lịch tập" }],
  },
  {
    id: "SS-2605-002", date: "08/05/2026", startTime: "08:00", endTime: "09:30", durationMinutes: 90,
    branch: "NextVision", coachId: "TR-002",
    customerCode: "HV005", packageCode: "P007",
    note: "Putting + short game cho VIP", status: "scheduled", rescheduledCount: 0, reviews: [],
    createdAt: "07/05/2026 17:00", createdBy: "Hoàng Mỹ Linh",
    history: [{ date: "07/05/2026 17:00", actor: "Hoàng Mỹ Linh", action: "Tạo lịch tập" }],
  },
  {
    id: "SS-2605-003", date: "08/05/2026", startTime: "09:00", endTime: "10:00", durationMinutes: 60,
    branch: "NextVision", coachId: "TR-003", teachingAidId: "TGV-002",
    customerCode: "HV012", packageCode: "P004",
    note: "Driver power", status: "completed", rescheduledCount: 0,
    reviews: [{ date: "08/05/2026 10:00", lesson: "Đã hoàn thành 60 phút driver. KH cải thiện tốt.", note: "Tuần sau tập iron" }],
    createdAt: "06/05/2026 14:00", createdBy: "Trần Quốc Bảo",
    history: [
      { date: "06/05/2026 14:00", actor: "Trần Quốc Bảo", action: "Tạo lịch tập" },
      { date: "08/05/2026 10:00", actor: "TR-003", action: "Đã tập", detail: "Trừ 1 buổi · gói P004 còn 37/50" },
    ],
  },
  {
    id: "SS-2605-004", date: "08/05/2026", startTime: "10:30", endTime: "11:30", durationMinutes: 60,
    branch: "NextVision", coachId: "TR-001",
    customerCode: "HV002", packageCode: "P001",
    status: "cancelled", cancellationReason: "KH bận đột xuất, đã chuyển sang tuần sau",
    rescheduledCount: 0, reviews: [],
    createdAt: "06/05/2026 09:00", createdBy: "Phạm Văn Đức",
    history: [
      { date: "06/05/2026 09:00", actor: "Phạm Văn Đức", action: "Tạo lịch tập" },
      { date: "08/05/2026 06:30", actor: "Phạm Văn Đức", action: "Hủy lịch", detail: "Lý do: KH bận · hoàn 1 buổi" },
    ],
  },
  {
    id: "SS-2605-005", date: "08/05/2026", startTime: "13:00", endTime: "14:00", durationMinutes: 60,
    branch: "NextVision", coachId: "TR-002",
    customerCode: "HV003", packageCode: "P003",
    status: "no_show", rescheduledCount: 0, reviews: [],
    createdAt: "07/05/2026 15:00", createdBy: "Nguyễn Thị Lan",
    history: [
      { date: "07/05/2026 15:00", actor: "Nguyễn Thị Lan", action: "Tạo lịch tập" },
      { date: "08/05/2026 13:15", actor: "TR-002", action: "Khách không đến", detail: "Không trừ buổi · vẫn tính HH cho HLV" },
    ],
  },
  {
    id: "SS-2605-006", date: "08/05/2026", startTime: "14:00", endTime: "15:30", durationMinutes: 90,
    branch: "NextVision", coachId: "TR-004", teachingAidId: "TGV-003",
    customerCode: "HV001", packageCode: "P002",
    note: "Course management session 1", status: "scheduled", rescheduledCount: 1, reviews: [],
    createdAt: "06/05/2026 18:00", createdBy: "Hoàng Mỹ Linh",
    history: [
      { date: "06/05/2026 18:00", actor: "Hoàng Mỹ Linh", action: "Tạo lịch tập" },
      { date: "07/05/2026 10:00", actor: "Hoàng Mỹ Linh", action: "Chuyển lịch", detail: "07/05 14:00 → 08/05 14:00" },
    ],
  },
];

const INITIAL_CONFIGS: BookingConfig[] = [
  { id: "BC-NV-AM", name: "Khung sáng NextVision", branch: "NextVision", startTime: "06:00", endTime: "12:00", active: true },
  { id: "BC-NV-PM", name: "Khung chiều NextVision", branch: "NextVision", startTime: "13:00", endTime: "21:00", active: true },
  { id: "BC-HN-FULL", name: "Khung HN cả ngày", branch: "Hà Nội Center", startTime: "07:00", endTime: "20:00", active: true },
];

// =====================================================================================
// SECTION D — Helpers
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

function shiftDate(s: string, deltaDays: number): string {
  const d = parseDDMMYYYY(s);
  if (!d) return s;
  d.setDate(d.getDate() + deltaDays);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function formatDateLong(s: string): string {
  const d = parseDDMMYYYY(s);
  if (!d) return s;
  const days = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  return `${days[d.getDay()]}, ${s}`;
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

function lookupCustomer(code: string, list: CustomerLite[]): CustomerLite | undefined {
  return list.find((c) => c.code === code);
}

function lookupCoach(id: string): typeof COACHES[number] | undefined {
  return COACHES.find((c) => c.id === id);
}

function lookupTeachingAid(id: string): typeof TEACHING_AIDS[number] | undefined {
  return TEACHING_AIDS.find((t) => t.id === id);
}

function nextSessionId(items: CoachSession[]): string {
  const t = new Date();
  const yymm = String(t.getFullYear()).slice(2) + String(t.getMonth() + 1).padStart(2, "0");
  const count = items.filter((it) => it.id.startsWith(`SS-${yymm}`)).length + 1;
  return `SS-${yymm}-${String(count).padStart(3, "0")}`;
}

function isSessionOverlap(a: { startTime: string; endTime: string }, b: { startTime: string; endTime: string }): boolean {
  const aStart = timeToMinutes(a.startTime);
  const aEnd = timeToMinutes(a.endTime);
  const bStart = timeToMinutes(b.startTime);
  const bEnd = timeToMinutes(b.endTime);
  return aStart < bEnd && bStart < aEnd;
}

// =====================================================================================
// SECTION E — Top-level component
// =====================================================================================

export default function CoachScheduleView() {
  const [date, setDate] = useState("08/05/2026");
  const [branch, setBranch] = useState<string>("NextVision");
  const [coachFilter, setCoachFilter] = useState<string>("all");
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const [sessions, setSessions] = useState<CoachSession[]>(INITIAL_SESSIONS);
  const [customers, setCustomers] = useState<CustomerLite[]>(INITIAL_CUSTOMERS);
  const [configs, setConfigs] = useState<BookingConfig[]>(INITIAL_CONFIGS);

  const [flexOpen, setFlexOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [quickBookOpen, setQuickBookOpen] = useState<{ coachId: string; startTime: string } | null>(null);
  const [detailSession, setDetailSession] = useState<CoachSession | null>(null);
  const [editingSession, setEditingSession] = useState<CoachSession | null>(null);
  const [configOpen, setConfigOpen] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  };

  const filteredCoaches = useMemo(() => {
    return COACHES.filter((c) => {
      if (c.branch !== branch) return false;
      if (coachFilter !== "all" && c.id !== coachFilter) return false;
      return true;
    });
  }, [branch, coachFilter]);

  const daySessions = useMemo(() => {
    return sessions.filter((s) => {
      if (s.date !== date) return false;
      if (s.branch !== branch) return false;
      if (coachFilter !== "all" && s.coachId !== coachFilter) return false;
      if (customerFilter !== "all" && s.customerCode !== customerFilter) return false;
      if (query) {
        const c = lookupCustomer(s.customerCode, customers);
        const co = lookupCoach(s.coachId);
        const target = `${c?.name ?? ""} ${c?.phone ?? ""} ${co?.name ?? ""} ${s.id}`.toLowerCase();
        if (!target.includes(query.toLowerCase())) return false;
      }
      return true;
    });
  }, [sessions, date, branch, coachFilter, customerFilter, query, customers]);

  const stats = useMemo(() => {
    return {
      total: daySessions.length,
      scheduled: daySessions.filter((s) => s.status === "scheduled").length,
      completed: daySessions.filter((s) => s.status === "completed").length,
      noshow: daySessions.filter((s) => s.status === "no_show").length,
      cancelled: daySessions.filter((s) => s.status === "cancelled").length,
    };
  }, [daySessions]);

  const submit = (next: CoachSession) => {
    const exists = sessions.find((s) => s.id === next.id);
    if (exists) {
      setSessions(sessions.map((s) => (s.id === next.id ? next : s)));
      flash(`Đã cập nhật ${next.id}`);
    } else {
      setSessions([next, ...sessions]);
      flash(`Đã tạo ${next.id}`);
    }
    setFlexOpen(false);
    setMemberOpen(false);
    setQuickBookOpen(null);
    setEditingSession(null);
  };

  const submitMonth = (createdSessions: CoachSession[]) => {
    setSessions([...createdSessions, ...sessions]);
    flash(`Đã tạo ${createdSessions.length} buổi tập theo tuần`);
    setMonthOpen(false);
  };

  const markCompleted = (s: CoachSession) => {
    setSessions(sessions.map((x) => x.id === s.id ? {
      ...x,
      status: "completed",
      history: [...x.history, { date: nowString(), actor: lookupCoach(x.coachId)?.name ?? "HLV", action: "Đã tập", detail: `Trừ 1 buổi gói ${x.packageCode ?? ""} (BR-M1-01)` }],
    } : x));
    const c = customers.find((cu) => cu.code === s.customerCode);
    if (c) {
      setCustomers(customers.map((cu) => cu.code === c.code ? { ...cu, remainingSessions: Math.max(0, cu.remainingSessions - 1) } : cu));
    }
    flash(`${s.id} đã tập · trừ 1 buổi gói`);
  };

  const markNoShow = (s: CoachSession) => {
    setSessions(sessions.map((x) => x.id === s.id ? {
      ...x,
      status: "no_show",
      history: [...x.history, { date: nowString(), actor: lookupCoach(x.coachId)?.name ?? "HLV", action: "Khách không đến", detail: "Không trừ buổi · HLV vẫn tính HH (BR-M1-01)" }],
    } : x));
    flash(`${s.id} · ghi nhận khách không đến`);
  };

  const cancel = (s: CoachSession, reason: string) => {
    setSessions(sessions.map((x) => x.id === s.id ? {
      ...x,
      status: "cancelled",
      cancellationReason: reason,
      history: [...x.history, { date: nowString(), actor: "Lễ tân", action: "Hủy lịch", detail: `Lý do: ${reason} · hoàn 1 buổi (BR-M1-02)` }],
    } : x));
    flash(`Đã hủy ${s.id} · hoàn 1 buổi`);
  };

  const reschedule = (s: CoachSession, newDate: string, newStart: string) => {
    const newEnd = minutesToTime(timeToMinutes(newStart) + s.durationMinutes);
    setSessions(sessions.map((x) => x.id === s.id ? {
      ...x,
      date: newDate,
      startTime: newStart,
      endTime: newEnd,
      rescheduledCount: x.rescheduledCount + 1,
      history: [...x.history, { date: nowString(), actor: "Lễ tân", action: "Chuyển lịch", detail: `${s.date} ${s.startTime} → ${newDate} ${newStart}` }],
    } : x));
    flash(`Đã chuyển lịch ${s.id}`);
  };

  const addReview = (s: CoachSession, lesson: string, note: string) => {
    setSessions(sessions.map((x) => x.id === s.id ? {
      ...x,
      reviews: [...x.reviews, { date: nowString(), lesson, note }],
      history: [...x.history, { date: nowString(), actor: lookupCoach(x.coachId)?.name ?? "HLV", action: "Thêm nhận xét" }],
    } : x));
    flash(`Đã lưu nhận xét cho ${s.id}`);
  };

  const remove = (s: CoachSession) => {
    setSessions(sessions.filter((x) => x.id !== s.id));
    flash(`Đã xóa ${s.id} (Admin)`);
  };

  return (
    <>
      <FeaturePage
        title="Lịch HLV"
        subtitle="Calendar lịch tập 1-1 · HLV × slot 15 phút · book linh hoạt / tháng / hội viên"
      >
        {/* Header */}
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
          <button className={styles.contractFilterChip} onClick={() => setConfigOpen(true)} type="button">
            <Settings size={14} /> Cấu hình ({configs.filter((c) => c.branch === branch && c.active).length})
          </button>
        </div>

        {/* KPI */}
        <div className={styles.contractKpi}>
          <KpiCard label="Tổng buổi" value={String(stats.total)} tone="blue" icon={CalendarDays} />
          <KpiCard label="Đặt lịch" value={String(stats.scheduled)} tone="purple" icon={Clock} />
          <KpiCard label="Đã tập" value={String(stats.completed)} tone="green" icon={CheckCircle2} />
          <KpiCard label="Hủy / Không đến" value={`${stats.cancelled} / ${stats.noshow}`} tone="amber" icon={XCircle} />
        </div>

        {/* Toolbar — search + filter + 3 nút book */}
        <div className={styles.contractListSearchRow}>
          <div className={styles.pricingSearch} style={{ flex: 1 }}>
            <Search size={18} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo tên HV / HLV / SĐT..." />
          </div>
          <select className={styles.selectInput} value={coachFilter} onChange={(e) => setCoachFilter(e.target.value)}>
            <option value="all">Tất cả HLV</option>
            {COACHES.filter((c) => c.branch === branch).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className={styles.selectInput} value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)}>
            <option value="all">Tất cả KH</option>
            {customers.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </div>

        <div className={styles.contractListChipRow}>
          <div className={styles.coachLegend}>
            <span><span className={styles.coachLegendDot} style={{ background: "#a78bfa" }} /> Đặt lịch</span>
            <span><span className={styles.coachLegendDot} style={{ background: "#22c55e" }} /> Đã tập</span>
            <span><span className={styles.coachLegendDot} style={{ background: "#ef4444" }} /> Hủy</span>
            <span><span className={styles.coachLegendDot} style={{ background: "#f97316" }} /> Không đến</span>
          </div>
          <div className={styles.contractListActions}>
            <button className={styles.contractFilterChip} onClick={() => setMemberOpen(true)} type="button">
              <UserCheck size={14} /> + Book lịch học viên
            </button>
            <button className={styles.contractFilterChip} onClick={() => setMonthOpen(true)} type="button">
              <CalendarRange size={14} /> + Book lịch tháng
            </button>
            <button className={styles.greenButton} onClick={() => setFlexOpen(true)} type="button">
              <PlusCircle size={16} /> + Book lịch linh hoạt
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <CalendarGrid
          coaches={filteredCoaches}
          sessions={daySessions}
          customers={customers}
          onClickEmpty={(coachId, time) => setQuickBookOpen({ coachId, startTime: time })}
          onClickSession={setDetailSession}
        />
      </FeaturePage>

      {toast ? <div className={styles.contractToast}>{toast}</div> : null}

      {flexOpen ? (
        <FlexibleBookModal
          date={date}
          branch={branch}
          coaches={COACHES.filter((c) => c.branch === branch)}
          customers={customers}
          existingSessions={sessions}
          onClose={() => setFlexOpen(false)}
          onSubmit={submit}
        />
      ) : null}

      {monthOpen ? (
        <MonthBookModal
          date={date}
          branch={branch}
          coaches={COACHES.filter((c) => c.branch === branch)}
          customers={customers}
          existingSessions={sessions}
          onClose={() => setMonthOpen(false)}
          onSubmit={submitMonth}
        />
      ) : null}

      {memberOpen ? (
        <MemberBookModal
          date={date}
          branch={branch}
          coaches={COACHES.filter((c) => c.branch === branch)}
          customers={customers}
          existingSessions={sessions}
          onClose={() => setMemberOpen(false)}
          onSubmit={submit}
        />
      ) : null}

      {quickBookOpen ? (
        <QuickBookModal
          date={date}
          branch={branch}
          coachId={quickBookOpen.coachId}
          startTime={quickBookOpen.startTime}
          coaches={COACHES.filter((c) => c.branch === branch)}
          customers={customers}
          existingSessions={sessions}
          onClose={() => setQuickBookOpen(null)}
          onSubmit={submit}
        />
      ) : null}

      {editingSession ? (
        <QuickBookModal
          editing={editingSession}
          date={editingSession.date}
          branch={editingSession.branch}
          coachId={editingSession.coachId}
          startTime={editingSession.startTime}
          coaches={COACHES.filter((c) => c.branch === editingSession.branch)}
          customers={customers}
          existingSessions={sessions}
          onClose={() => setEditingSession(null)}
          onSubmit={submit}
        />
      ) : null}

      {detailSession ? (
        <SessionDetailModal
          session={detailSession}
          customers={customers}
          onClose={() => setDetailSession(null)}
          onEdit={() => { setEditingSession(detailSession); setDetailSession(null); }}
          onComplete={() => { markCompleted(detailSession); setDetailSession(null); }}
          onNoShow={() => { markNoShow(detailSession); setDetailSession(null); }}
          onCancel={(reason) => { cancel(detailSession, reason); setDetailSession(null); }}
          onReschedule={(d, t) => { reschedule(detailSession, d, t); setDetailSession(null); }}
          onAddReview={(lesson, note) => addReview(detailSession, lesson, note)}
          onDelete={() => { remove(detailSession); setDetailSession(null); }}
        />
      ) : null}

      {configOpen ? (
        <BookingConfigModal
          configs={configs}
          onClose={() => setConfigOpen(false)}
          onChange={setConfigs}
          flash={flash}
        />
      ) : null}
    </>
  );
}

function KpiCard({ icon: Icon, label, tone, value }: { icon: typeof Clock; label: string; tone: "blue" | "green" | "amber" | "red" | "purple"; value: string }) {
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
// SECTION F — Calendar Grid
// =====================================================================================

function CalendarGrid({
  coaches,
  sessions,
  customers,
  onClickEmpty,
  onClickSession,
}: {
  coaches: readonly typeof COACHES[number][];
  sessions: CoachSession[];
  customers: CustomerLite[];
  onClickEmpty: (coachId: string, time: string) => void;
  onClickSession: (s: CoachSession) => void;
}) {
  if (coaches.length === 0) {
    return (
      <section className={styles.lineGridCard}>
        <div className={styles.lineEmpty}>
          <CalendarDays size={40} />
          <strong>Chưa có HLV nào ở chi nhánh này</strong>
          <span>Thử đổi chi nhánh hoặc filter</span>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.coachCalendarCard}>
      <div className={styles.coachCalendarScroll}>
        <table className={styles.coachCalendarTable} style={{ minWidth: `${COACH_TIME_COL_WIDTH + coaches.length * COACH_COL_WIDTH}px` }}>
          <colgroup>
            <col style={{ width: COACH_TIME_COL_WIDTH }} />
            {coaches.map((c) => <col key={c.id} style={{ width: COACH_COL_WIDTH }} />)}
          </colgroup>
          <thead>
            <tr>
              <th className={styles.coachTimeCol}><Clock size={12} /> Giờ</th>
              {coaches.map((c) => (
                <th key={c.id} className={styles.coachHeaderCell}>
                  <div className={styles.coachHeaderAvatar}>{c.name.split(" ").pop()?.[0] ?? "?"}</div>
                  <div>
                    <strong>{c.name}</strong>
                    <span>({c.code}) · {c.specialty}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALL_SLOTS.map((slot) => {
              const isHourMark = slot.endsWith(":00");
              return (
                <tr key={slot} className={isHourMark ? styles.coachRowHour : undefined}>
                  <td className={styles.coachTimeCol}>{isHourMark ? <strong>{slot}</strong> : <span>{slot}</span>}</td>
                  {coaches.map((c) => {
                    // Tìm session bắt đầu đúng slot này cho HLV này
                    const session = sessions.find((s) => s.coachId === c.id && s.startTime === slot);
                    // Hoặc slot đang nằm giữa session
                    const inSession = sessions.find((s) => s.coachId === c.id && timeToMinutes(s.startTime) < timeToMinutes(slot) && timeToMinutes(s.endTime) > timeToMinutes(slot));
                    if (session) {
                      const cust = lookupCustomer(session.customerCode, customers);
                      const span = Math.ceil(session.durationMinutes / 15);
                      return (
                        <td key={c.id} className={styles.coachCellOccupied} rowSpan={span}>
                          <button
                            className={`${styles.coachSessionCard} ${styles[`coachSessionCard_${session.status}`]}`}
                            onClick={() => onClickSession(session)}
                            type="button"
                            style={{ minHeight: span * COACH_SLOT_HEIGHT - 10 }}
                          >
                            <strong>{cust?.name ?? "—"}</strong>
                            <span>{cust?.phone}</span>
                            <em>{cust?.packageName ?? "—"}</em>
                            <span className={styles.coachSessionTime}>{session.startTime} → {session.endTime} ({session.durationMinutes}p)</span>
                            <SessionStatusBadge status={session.status} />
                          </button>
                        </td>
                      );
                    }
                    if (inSession) return null;
                    return (
                      <td key={c.id} className={styles.coachCellEmpty}>
                        <button onClick={() => onClickEmpty(c.id, slot)} type="button" className={styles.coachEmptyBtn} title="Click để book nhanh">
                          +
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SessionStatusBadge({ status }: { status: SessionStatus }) {
  const map: Record<SessionStatus, { label: string; bg: string; fg: string }> = {
    scheduled: { label: "Đặt lịch", bg: "#ede9fe", fg: "#6d28d9" },
    completed: { label: "Đã tập", bg: "#dcfce7", fg: "#15803d" },
    cancelled: { label: "Hủy", bg: "#fee2e2", fg: "#b91c1c" },
    no_show: { label: "Không đến", bg: "#ffedd5", fg: "#c2410c" },
  };
  const m = map[status];
  return <span className={styles.coachStatusBadge} style={{ background: m.bg, color: m.fg }}>{m.label}</span>;
}

// =====================================================================================
// SECTION G — Quick Book Modal (click ô trống)
// =====================================================================================

function QuickBookModal({
  editing,
  date,
  branch,
  coachId,
  startTime,
  coaches,
  customers,
  existingSessions,
  onClose,
  onSubmit,
}: {
  editing?: CoachSession;
  date: string;
  branch: string;
  coachId: string;
  startTime: string;
  coaches: readonly typeof COACHES[number][];
  customers: CustomerLite[];
  existingSessions: CoachSession[];
  onClose: () => void;
  onSubmit: (s: CoachSession) => void;
}) {
  const isEdit = Boolean(editing);
  const [selectedDate, setSelectedDate] = useState(date);
  const [selectedTime, setSelectedTime] = useState(startTime);
  const [duration, setDuration] = useState<number>(editing?.durationMinutes ?? 60);
  const [selectedCoachId, setSelectedCoachId] = useState(editing?.coachId ?? coachId);
  const [teachingAidId, setTeachingAidId] = useState(editing?.teachingAidId ?? "");
  const [customerCode, setCustomerCode] = useState(editing?.customerCode ?? customers[0]?.code ?? "");
  const [packageCode, setPackageCode] = useState(editing?.packageCode ?? customers.find((c) => c.code === (editing?.customerCode ?? customers[0]?.code))?.packageCode ?? "");
  const [note, setNote] = useState(editing?.note ?? "");
  const [lockCoach, setLockCoach] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const customer = lookupCustomer(customerCode, customers);
  const endTime = useMemo(() => minutesToTime(timeToMinutes(selectedTime) + duration), [selectedTime, duration]);

  const validate = (): string | null => {
    if (!customerCode) return "Vui lòng chọn học viên";
    if (!selectedCoachId) return "Vui lòng chọn HLV";
    const conflict = existingSessions.find((s) =>
      s.id !== editing?.id &&
      s.date === selectedDate &&
      s.status === "scheduled" &&
      isSessionOverlap({ startTime: selectedTime, endTime }, s) &&
      (s.coachId === selectedCoachId || s.customerCode === customerCode)
    );
    if (conflict) {
      const reason = conflict.coachId === selectedCoachId ? "HLV" : "HV";
      return `Trùng lịch ${reason}: ${conflict.id} (${conflict.startTime}-${conflict.endTime})`;
    }
    if (customer && customer.remainingSessions <= 0) return "Học viên đã hết buổi gói";
    return null;
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    const id = editing?.id ?? nextSessionId(existingSessions);
    onSubmit({
      id,
      date: selectedDate,
      startTime: selectedTime,
      endTime,
      durationMinutes: duration,
      branch,
      coachId: selectedCoachId,
      teachingAidId: teachingAidId || undefined,
      customerCode,
      packageCode: packageCode || undefined,
      note: note || undefined,
      status: editing?.status ?? "scheduled",
      cancellationReason: editing?.cancellationReason,
      rescheduledCount: editing?.rescheduledCount ?? 0,
      reviews: editing?.reviews ?? [],
      createdAt: editing?.createdAt ?? nowString(),
      createdBy: editing?.createdBy ?? STAFF_LIST[0],
      history: editing?.history ?? [
        { date: nowString(), actor: STAFF_LIST[0], action: "Tạo lịch tập (quick book)" },
        ...(lockCoach ? [{ date: nowString(), actor: STAFF_LIST[0], action: "Khóa slot HLV" }] : []),
      ],
    });
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <form className={styles.contractFormModal} onSubmit={submit}>
        <header className={styles.contractFormBanner}>
          <div className={styles.ticketFormBannerLeft}>
            <h2><Clock size={16} /> {isEdit ? `Sửa lịch ${editing?.id}` : "Đăng ký lịch tập"}</h2>
            <span className={styles.teetimeSlotPill}>{lookupCoach(selectedCoachId)?.name ?? "—"} · {selectedTime} → {endTime}</span>
          </div>
          <button onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <div className={styles.contractFormBody}>
          {error ? <div className={styles.formError}><AlertCircle size={14} /> {error}</div> : null}

          <section className={`${styles.contractFormSection} ${styles.contractSectionBlue}`}>
            <h3 className={styles.contractSectionHeader}><Calendar size={16} /> Thời gian</h3>
            <div className={styles.contractGrid2}>
              <label>
                <span>Chi nhánh</span>
                <input readOnly value={branch} />
              </label>
              <label>
                <span>Ngày <b>*</b></span>
                <input value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} placeholder="dd/mm/yyyy" />
              </label>
              <label>
                <span>Giờ vào <b>*</b></span>
                <input type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} />
              </label>
              <label>
                <span>Giờ ra (auto)</span>
                <input readOnly value={endTime} />
              </label>
              <label className={styles.fullField}>
                <span>Thời lượng</span>
                <div className={styles.contractRadioRow}>
                  {DURATION_OPTIONS.map((d) => (
                    <button key={d} type="button" className={duration === d ? styles.contractRadioActive : styles.contractRadio} onClick={() => setDuration(d)}>
                      {d} phút
                    </button>
                  ))}
                </div>
              </label>
              <label className={styles.contractCheckboxLine}>
                <input type="checkbox" checked={lockCoach} onChange={(e) => setLockCoach(e.target.checked)} />
                Khóa slot HLV — giữ riêng cho HLV này
              </label>
            </div>
          </section>

          <section className={`${styles.contractFormSection} ${styles.contractSectionPurple}`}>
            <h3 className={styles.contractSectionHeader}><User size={16} /> HLV & Học viên</h3>
            <div className={styles.contractGrid2}>
              <label>
                <span>Huấn luyện viên <b>*</b></span>
                <select className={styles.selectInput} value={selectedCoachId} onChange={(e) => setSelectedCoachId(e.target.value)}>
                  {coaches.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.specialty}</option>)}
                </select>
              </label>
              <label>
                <span>Trợ giảng HLV</span>
                <select className={styles.selectInput} value={teachingAidId} onChange={(e) => setTeachingAidId(e.target.value)}>
                  <option value="">— Không có —</option>
                  {TEACHING_AIDS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </label>
              <label>
                <span>Học viên <b>*</b></span>
                <select className={styles.selectInput} value={customerCode} onChange={(e) => { setCustomerCode(e.target.value); const c = customers.find((x) => x.code === e.target.value); setPackageCode(c?.packageCode ?? ""); }}>
                  {customers.map((c) => <option key={c.code} value={c.code}>{c.name} · còn {c.remainingSessions}/{c.totalSessions} buổi</option>)}
                </select>
              </label>
              <label>
                <span>Gói tập (auto)</span>
                <input readOnly value={customer?.packageName ?? "—"} />
              </label>
              {customer ? (
                <div className={styles.coachStudentInfo}>
                  <strong>{customer.name}</strong>
                  <span>SĐT: {customer.phone}</span>
                  <em>Còn <strong>{customer.remainingSessions}</strong>/{customer.totalSessions} buổi</em>
                </div>
              ) : null}
              <label className={styles.fullField}>
                <span>Ghi chú</span>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="VD: Tập swing cơ bản, focus driver..." />
              </label>
            </div>
          </section>
        </div>
        <footer className={styles.contractFormFooter}>
          <span></span>
          <div>
            <button className={styles.contractFilterChip} onClick={onClose} type="button">Bỏ qua</button>
            <button className={styles.greenButton} type="submit"><CheckCircle2 size={14} /> {isEdit ? "Cập nhật" : "Lưu lịch"}</button>
          </div>
        </footer>
      </form>
    </div>
  );
}

// =====================================================================================
// SECTION H — Flexible Book Modal (chọn slot 15 phút)
// =====================================================================================

function FlexibleBookModal({
  date,
  branch,
  coaches,
  customers,
  existingSessions,
  onClose,
  onSubmit,
}: {
  date: string;
  branch: string;
  coaches: readonly typeof COACHES[number][];
  customers: CustomerLite[];
  existingSessions: CoachSession[];
  onClose: () => void;
  onSubmit: (s: CoachSession) => void;
}) {
  const [selectedDate, setSelectedDate] = useState(date);
  const [coachId, setCoachId] = useState<string>(coaches[0]?.id ?? "");
  const [customerCode, setCustomerCode] = useState(customers[0]?.code ?? "");
  const [duration, setDuration] = useState<number>(60);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const customer = lookupCustomer(customerCode, customers);

  // Map slot → busy
  const busySlots = useMemo(() => {
    const set = new Set<string>();
    existingSessions.filter((s) => s.date === selectedDate && s.coachId === coachId && s.status !== "cancelled").forEach((s) => {
      let m = timeToMinutes(s.startTime);
      const end = timeToMinutes(s.endTime);
      while (m < end) {
        set.add(minutesToTime(m));
        m += 15;
      }
    });
    return set;
  }, [existingSessions, selectedDate, coachId]);

  const toggleSlot = (slot: string) => {
    if (busySlots.has(slot)) return;
    setSelectedSlots((prev) => prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot].sort());
  };

  const startTime = selectedSlots[0] ?? "";
  const endTime = selectedSlots.length > 0 ? minutesToTime(timeToMinutes(selectedSlots[selectedSlots.length - 1]) + 15) : "";
  const totalMinutes = selectedSlots.length * 15;
  const hasSlotError = Boolean(error?.toLowerCase().includes("slot"));

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customerCode) { setError("Chọn học viên"); return; }
    if (selectedSlots.length === 0) { setError("Chọn ít nhất 1 slot 15 phút"); return; }
    if (customer && customer.remainingSessions <= 0) { setError("Học viên đã hết buổi gói"); return; }
    onSubmit({
      id: nextSessionId(existingSessions),
      date: selectedDate,
      startTime,
      endTime,
      durationMinutes: totalMinutes,
      branch,
      coachId,
      customerCode,
      packageCode: customer?.packageCode,
      status: "scheduled",
      rescheduledCount: 0,
      reviews: [],
      createdAt: nowString(),
      createdBy: STAFF_LIST[0],
      history: [{ date: nowString(), actor: STAFF_LIST[0], action: "Tạo lịch tập linh hoạt", detail: `${selectedSlots.length} slot × 15p` }],
    });
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <form className={styles.coachFlexModal} onSubmit={submit}>
        <header className={styles.contractFormBanner}>
          <h2><PlusCircle size={16} /> Đăng ký lịch tập linh hoạt</h2>
          <button onClick={onClose} type="button"><X size={18} /></button>
        </header>
        {error ? <div className={styles.formError} style={{ margin: "12px 20px" }}><AlertCircle size={14} /> {error}</div> : null}
        <div className={styles.coachFlexBody}>
          <div className={styles.coachFlexLeft}>
            <section className={`${styles.contractFormSection} ${styles.contractSectionBlue}`}>
              <h3 className={styles.contractSectionHeader}><Calendar size={16} /> Thông tin chung</h3>
              <div className={styles.contractGrid2}>
                <label>
                  <span>Chi nhánh</span>
                  <input readOnly value={branch} />
                </label>
                <label>
                  <span>Ngày <b>*</b></span>
                  <input value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} placeholder="dd/mm/yyyy" />
                </label>
                <label>
                  <span>HLV <b>*</b></span>
                  <select className={styles.selectInput} value={coachId} onChange={(e) => { setCoachId(e.target.value); setSelectedSlots([]); }}>
                    {coaches.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
                <label>
                  <span>Học viên <b>*</b></span>
                  <select className={styles.selectInput} value={customerCode} onChange={(e) => setCustomerCode(e.target.value)}>
                    {customers.map((c) => <option key={c.code} value={c.code}>{c.name} · còn {c.remainingSessions}</option>)}
                  </select>
                </label>
                <label>
                  <span>Gói tập (auto)</span>
                  <input readOnly value={customer?.packageName ?? "—"} />
                </label>
                <label>
                  <span>Thời lượng dự kiến</span>
                  <div className={styles.contractRadioRow}>
                    {DURATION_OPTIONS.map((d) => (
                      <button key={d} type="button" className={duration === d ? styles.contractRadioActive : styles.contractRadio} onClick={() => setDuration(d)}>
                        {d}p
                      </button>
                    ))}
                  </div>
                </label>
              </div>
            </section>

            {selectedSlots.length > 0 ? (
              <section className={`${styles.contractFormSection} ${styles.contractSectionGreen}`}>
                <h3 className={styles.contractSectionHeader}><CheckCircle2 size={16} /> Preview buổi tập</h3>
                <table className={styles.ticketAddonTable}>
                  <thead>
                    <tr><th>HV</th><th>HLV</th><th>Ngày</th><th>Giờ</th><th>Thời lượng</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>{customer?.name}</strong></td>
                      <td>{lookupCoach(coachId)?.name}</td>
                      <td>{selectedDate}</td>
                      <td>{startTime} → {endTime}</td>
                      <td>{totalMinutes} phút</td>
                    </tr>
                  </tbody>
                </table>
              </section>
            ) : null}
          </div>

          <aside className={styles.coachFlexRight}>
            <h4>
              <Clock size={14} /> Slot 15 phút · {selectedDate}
              <em>Chọn {selectedSlots.length} slot · {totalMinutes}p</em>
            </h4>
            {hasSlotError ? <span className={styles.fieldErrorText}>Chọn ít nhất 1 slot trống trước khi lưu lịch.</span> : null}
            <div className={`${styles.coachSlotList} ${hasSlotError ? styles.coachSlotListError : ""}`}>
              {ALL_SLOTS.map((slot) => {
                const busy = busySlots.has(slot);
                const selected = selectedSlots.includes(slot);
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={busy}
                    onClick={() => toggleSlot(slot)}
                    className={busy ? styles.coachSlotBusy : selected ? styles.coachSlotSelected : styles.coachSlotFree}
                    title={busy ? "Đã có lịch" : selected ? "Đã chọn" : "Trống"}
                  >
                    {selected ? <CheckCircle2 size={12} /> : null}
                    {slot}
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
        <footer className={styles.contractFormFooter}>
          <span>{selectedSlots.length} slot · {totalMinutes} phút</span>
          <div>
            <button className={styles.contractFilterChip} onClick={onClose} type="button">Bỏ qua</button>
            <button className={styles.greenButton} type="submit">
              <CheckCircle2 size={14} /> Lưu lịch
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}

// =====================================================================================
// SECTION I — Month Book Modal (recurring weekly)
// =====================================================================================

function MonthBookModal({
  date,
  branch,
  coaches,
  customers,
  existingSessions,
  onClose,
  onSubmit,
}: {
  date: string;
  branch: string;
  coaches: readonly typeof COACHES[number][];
  customers: CustomerLite[];
  existingSessions: CoachSession[];
  onClose: () => void;
  onSubmit: (sessions: CoachSession[]) => void;
}) {
  const [startDate, setStartDate] = useState(date);
  const [endDate, setEndDate] = useState(shiftDate(date, 30));
  const [startTime, setStartTime] = useState("08:00");
  const [duration, setDuration] = useState<number>(60);
  const [coachId, setCoachId] = useState<string>(coaches[0]?.id ?? "");
  const [teachingAidId, setTeachingAidId] = useState("");
  const [customerCode, setCustomerCode] = useState(customers[0]?.code ?? "");
  const [days, setDays] = useState<string[]>(["T2", "T4", "T6"]);
  const [conflictCheck, setConflictCheck] = useState(true);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const customer = lookupCustomer(customerCode, customers);
  const endTime = minutesToTime(timeToMinutes(startTime) + duration);

  const toggleDay = (d: string) => {
    setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  };

  const preview = useMemo(() => {
    const a = parseDDMMYYYY(startDate);
    const b = parseDDMMYYYY(endDate);
    if (!a || !b) return [];
    if (b.getTime() < a.getTime()) return [];
    if (days.length === 0) return [];
    const list: { date: string; conflict: boolean; conflictId?: string }[] = [];
    for (let d = new Date(a); d <= b; d.setDate(d.getDate() + 1)) {
      const day = (d.getDay() + 6) % 7;
      const dayKey = DAYS_VN[day];
      if (!days.includes(dayKey)) continue;
      const ds = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
      const conflict = existingSessions.find((s) =>
        s.date === ds &&
        s.status === "scheduled" &&
        isSessionOverlap({ startTime, endTime }, s) &&
        (s.coachId === coachId || s.customerCode === customerCode)
      );
      list.push({ date: ds, conflict: Boolean(conflict), conflictId: conflict?.id });
    }
    return list;
  }, [startDate, endDate, startTime, endTime, coachId, customerCode, days, existingSessions]);

  const conflicts = preview.filter((p) => p.conflict);
  const validSlots = preview.filter((p) => !p.conflict);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (preview.length === 0) { setError("Không có slot nào được sinh ra"); return; }
    if (conflictCheck && conflicts.length > 0) {
      setError(`Có ${conflicts.length} slot trùng lịch · ko cho phép lưu (BR all-or-nothing). Bỏ tick "Kiểm tra trùng lịch" để skip slot trùng.`);
      return;
    }
    if (customer && validSlots.length > customer.remainingSessions) {
      setError(`Số slot (${validSlots.length}) > buổi còn (${customer.remainingSessions}) trong gói. Rút ngắn ngày hoặc đổi gói.`);
      return;
    }
    const slotsToCreate = conflictCheck ? preview : validSlots;
    const baseTimestamp = Date.now();
    const newSessions: CoachSession[] = slotsToCreate.map((p, i) => ({
      id: `SS-MONTH-${baseTimestamp}-${i}`,
      date: p.date,
      startTime,
      endTime,
      durationMinutes: duration,
      branch,
      coachId,
      teachingAidId: teachingAidId || undefined,
      customerCode,
      packageCode: customer?.packageCode,
      note: note || undefined,
      status: "scheduled",
      rescheduledCount: 0,
      reviews: [],
      createdAt: nowString(),
      createdBy: STAFF_LIST[0],
      history: [{ date: nowString(), actor: STAFF_LIST[0], action: "Tạo lịch tập tháng" }],
    }));
    onSubmit(newSessions);
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <form className={styles.contractFormModal} onSubmit={submit}>
        <header className={styles.contractFormBanner}>
          <h2><CalendarRange size={16} /> Đăng ký lịch tập tháng (recurring)</h2>
          <button onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <div className={styles.contractFormBody}>
          {error ? <div className={styles.formError}><AlertCircle size={14} /> {error}</div> : null}

          <section className={`${styles.contractFormSection} ${styles.contractSectionBlue}`}>
            <h3 className={styles.contractSectionHeader}><Calendar size={16} /> Khoảng thời gian</h3>
            <div className={styles.contractGrid2}>
              <label>
                <span>Chi nhánh</span>
                <input readOnly value={branch} />
              </label>
              <label>
                <span>HLV <b>*</b></span>
                <select className={styles.selectInput} value={coachId} onChange={(e) => setCoachId(e.target.value)}>
                  {coaches.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label>
                <span>Trợ giảng HLV</span>
                <select className={styles.selectInput} value={teachingAidId} onChange={(e) => setTeachingAidId(e.target.value)}>
                  <option value="">— Không —</option>
                  {TEACHING_AIDS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </label>
              <label>
                <span>Học viên <b>*</b></span>
                <select className={styles.selectInput} value={customerCode} onChange={(e) => setCustomerCode(e.target.value)}>
                  {customers.map((c) => <option key={c.code} value={c.code}>{c.name} · còn {c.remainingSessions}</option>)}
                </select>
              </label>
              <label>
                <span>Ngày bắt đầu <b>*</b></span>
                <input value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="dd/mm/yyyy" />
              </label>
              <label>
                <span>Ngày kết thúc <b>*</b></span>
                <input value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="dd/mm/yyyy" />
              </label>
              <label>
                <span>Giờ vào <b>*</b></span>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </label>
              <label>
                <span>Thời lượng</span>
                <div className={styles.contractRadioRow}>
                  {DURATION_OPTIONS.map((d) => (
                    <button key={d} type="button" className={duration === d ? styles.contractRadioActive : styles.contractRadio} onClick={() => setDuration(d)}>
                      {d}p
                    </button>
                  ))}
                </div>
              </label>
              <label className={styles.fullField}>
                <span>Lịch học trong tuần <b>*</b></span>
                <div className={styles.contractRadioRow}>
                  {DAYS_VN.map((d) => (
                    <button key={d} type="button" className={days.includes(d) ? styles.contractRadioActive : styles.contractRadio} onClick={() => toggleDay(d)}>
                      {d}
                    </button>
                  ))}
                </div>
              </label>
              <label className={styles.contractCheckboxLine}>
                <input type="checkbox" checked={conflictCheck} onChange={(e) => setConflictCheck(e.target.checked)} />
                Kiểm tra trùng lịch (chặn lưu nếu có conflict)
              </label>
              <label className={styles.fullField}>
                <span>Ghi chú</span>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} />
              </label>
            </div>
          </section>

          <section className={`${styles.contractFormSection} ${styles.contractSectionGreen}`}>
            <h3 className={styles.contractSectionHeader}><CheckCircle2 size={16} /> Preview {preview.length} slot · {validSlots.length} hợp lệ · {conflicts.length} trùng</h3>
            {preview.length === 0 ? (
              <span className={styles.cellMuted}>Chưa có slot nào được sinh — hãy chọn ngày và lịch trong tuần</span>
            ) : (
              <div className={styles.coachMonthPreview}>
                {preview.slice(0, 30).map((p) => (
                  <span key={p.date} className={p.conflict ? styles.coachPreviewConflict : styles.coachPreviewOk} title={p.conflict ? `Trùng ${p.conflictId}` : "OK"}>
                    {p.conflict ? <XCircle size={10} /> : <CheckCircle2 size={10} />}
                    {p.date.slice(0, 5)}
                  </span>
                ))}
                {preview.length > 30 ? <span className={styles.cellMuted}>+ {preview.length - 30} slot nữa</span> : null}
              </div>
            )}
            {customer && preview.length > customer.remainingSessions ? (
              <div className={styles.teetimeWarningBanner}>
                <AlertTriangle size={14} />
                <span>Số slot ({preview.length}) <strong>vượt buổi gói</strong> ({customer.remainingSessions}). Rút ngắn ngày hoặc đổi gói.</span>
              </div>
            ) : null}
          </section>
        </div>
        <footer className={styles.contractFormFooter}>
          <span>Sẽ tạo {conflictCheck ? validSlots.length : preview.length} buổi</span>
          <div>
            <button className={styles.contractFilterChip} onClick={onClose} type="button">Bỏ qua</button>
            <button className={styles.greenButton} type="submit">
              <CheckCircle2 size={14} /> Lưu lịch tập
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}

// =====================================================================================
// SECTION J — Member Book Modal (chọn HV trước)
// =====================================================================================

function MemberBookModal({
  date,
  branch,
  coaches,
  customers,
  existingSessions,
  onClose,
  onSubmit,
}: {
  date: string;
  branch: string;
  coaches: readonly typeof COACHES[number][];
  customers: CustomerLite[];
  existingSessions: CoachSession[];
  onClose: () => void;
  onSubmit: (s: CoachSession) => void;
}) {
  const [selectedDate, setSelectedDate] = useState(date);
  const [startTime, setStartTime] = useState("08:00");
  const [duration, setDuration] = useState<number>(60);
  const [customerCode, setCustomerCode] = useState(customers[0]?.code ?? "");
  const [coachId, setCoachId] = useState<string>(coaches[0]?.id ?? "");
  const [teachingAidId, setTeachingAidId] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const customer = lookupCustomer(customerCode, customers);
  const endTime = minutesToTime(timeToMinutes(startTime) + duration);

  const filteredCustomers = useMemo(() => {
    if (!search) return customers.slice(0, 6);
    const q = search.toLowerCase();
    return customers.filter((c) => `${c.code} ${c.name} ${c.phone}`.toLowerCase().includes(q)).slice(0, 8);
  }, [customers, search]);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customerCode) { setError("Chọn HV"); return; }
    if (!coachId) { setError("Chọn HLV"); return; }
    const conflict = existingSessions.find((s) =>
      s.date === selectedDate && s.status === "scheduled" &&
      isSessionOverlap({ startTime, endTime }, s) &&
      (s.coachId === coachId || s.customerCode === customerCode)
    );
    if (conflict) { setError(`Trùng lịch ${conflict.id}`); return; }
    if (customer && customer.remainingSessions <= 0) { setError("HV đã hết buổi"); return; }
    onSubmit({
      id: nextSessionId(existingSessions),
      date: selectedDate, startTime, endTime, durationMinutes: duration,
      branch, coachId, teachingAidId: teachingAidId || undefined,
      customerCode, packageCode: customer?.packageCode,
      note: note || undefined,
      status: "scheduled", rescheduledCount: 0, reviews: [],
      createdAt: nowString(), createdBy: STAFF_LIST[0],
      history: [{ date: nowString(), actor: STAFF_LIST[0], action: "Tạo lịch tập (theo HV)" }],
    });
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <form className={styles.contractFormModal} onSubmit={submit}>
        <header className={styles.contractFormBanner}>
          <h2><UserCheck size={16} /> Đăng ký lịch tập theo hội viên</h2>
          <button onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <div className={styles.contractFormBody}>
          {error ? <div className={styles.formError}><AlertCircle size={14} /> {error}</div> : null}

          <section className={`${styles.contractFormSection} ${styles.contractSectionBlue}`}>
            <h3 className={styles.contractSectionHeader}><Users size={16} /> Bước 1 · Chọn học viên</h3>
            <div className={styles.teetimeCustomerSearch}>
              <Search size={14} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm HV theo tên / SĐT / mã..." />
            </div>
            <div className={styles.teetimeCustomerList}>
              {filteredCustomers.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  className={c.code === customerCode ? styles.teetimeCustomerCardActive : styles.teetimeCustomerCard}
                  onClick={() => setCustomerCode(c.code)}
                >
                  <div className={styles.teetimeCustomerAvatar}>{c.name.split(" ").pop()?.[0] ?? "?"}</div>
                  <div>
                    <strong>{c.name}</strong>
                    <span>{c.phone}</span>
                    <em>Còn {c.remainingSessions}/{c.totalSessions} buổi</em>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className={`${styles.contractFormSection} ${styles.contractSectionPurple}`}>
            <h3 className={styles.contractSectionHeader}><Calendar size={16} /> Bước 2 · Chọn thời gian & HLV</h3>
            <div className={styles.contractGrid2}>
              <label>
                <span>Ngày <b>*</b></span>
                <input value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} placeholder="dd/mm/yyyy" />
              </label>
              <label>
                <span>Giờ vào <b>*</b></span>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </label>
              <label>
                <span>Thời lượng</span>
                <div className={styles.contractRadioRow}>
                  {DURATION_OPTIONS.map((d) => (
                    <button key={d} type="button" className={duration === d ? styles.contractRadioActive : styles.contractRadio} onClick={() => setDuration(d)}>
                      {d}p
                    </button>
                  ))}
                </div>
              </label>
              <label>
                <span>Giờ ra (auto)</span>
                <input readOnly value={endTime} />
              </label>
              <label>
                <span>HLV <b>*</b></span>
                <select className={styles.selectInput} value={coachId} onChange={(e) => setCoachId(e.target.value)}>
                  {coaches.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.specialty}</option>)}
                </select>
              </label>
              <label>
                <span>Trợ giảng</span>
                <select className={styles.selectInput} value={teachingAidId} onChange={(e) => setTeachingAidId(e.target.value)}>
                  <option value="">— Không —</option>
                  {TEACHING_AIDS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </label>
              <label className={styles.fullField}>
                <span>Ghi chú</span>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} />
              </label>
            </div>
          </section>
        </div>
        <footer className={styles.contractFormFooter}>
          <span></span>
          <div>
            <button className={styles.contractFilterChip} onClick={onClose} type="button">Bỏ qua</button>
            <button className={styles.greenButton} type="submit"><CheckCircle2 size={14} /> Lưu lịch</button>
          </div>
        </footer>
      </form>
    </div>
  );
}

// =====================================================================================
// SECTION K — Session Detail Modal + sub-popups
// =====================================================================================

function SessionDetailModal({
  session,
  customers,
  onClose,
  onEdit,
  onComplete,
  onNoShow,
  onCancel,
  onReschedule,
  onAddReview,
  onDelete,
}: {
  session: CoachSession;
  customers: CustomerLite[];
  onClose: () => void;
  onEdit: () => void;
  onComplete: () => void;
  onNoShow: () => void;
  onCancel: (reason: string) => void;
  onReschedule: (date: string, time: string) => void;
  onAddReview: (lesson: string, note: string) => void;
  onDelete: () => void;
}) {
  const customer = lookupCustomer(session.customerCode, customers);
  const coach = lookupCoach(session.coachId);
  const ta = session.teachingAidId ? lookupTeachingAid(session.teachingAidId) : undefined;
  const editable = session.status === "scheduled";

  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  return (
    <>
      <div className={styles.modalOverlay} role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className={styles.contractFormModal}>
          <header className={styles.contractFormBanner}>
            <div className={styles.ticketFormBannerLeft}>
              <h2>{session.id}</h2>
              <SessionStatusBadge status={session.status} />
              <span className={styles.cellMuted}>{session.date} · {session.startTime} → {session.endTime}</span>
            </div>
            <button onClick={onClose} type="button"><X size={18} /></button>
          </header>
          <div className={styles.contractFormBody}>
            <section className={`${styles.contractFormSection} ${styles.contractSectionBlue}`}>
              <h3 className={styles.contractSectionHeader}><User size={16} /> Học viên & HLV</h3>
              <div className={styles.ticketDetailGrid}>
                <div><span>Học viên</span><strong>{customer?.name ?? "—"}</strong></div>
                <div><span>SĐT</span><strong>{customer?.phone ?? "—"}</strong></div>
                <div><span>Gói tập</span><strong>{customer?.packageName ?? "—"}</strong></div>
                <div><span>Buổi còn</span><strong>{customer ? `${customer.remainingSessions}/${customer.totalSessions}` : "—"}</strong></div>
                <div><span>HLV</span><strong>{coach?.name ?? "—"}</strong></div>
                <div><span>Trợ giảng</span><strong>{ta?.name ?? "—"}</strong></div>
                <div><span>Chi nhánh</span><strong>{session.branch}</strong></div>
                <div><span>Thời lượng</span><strong>{session.durationMinutes} phút</strong></div>
              </div>
              {session.note ? (
                <div className={styles.ticketDetailNote} style={{ marginTop: 12 }}>{session.note}</div>
              ) : null}
            </section>

            {session.cancellationReason ? (
              <section className={styles.contractFormSection}>
                <h3 className={styles.contractSectionHeader} style={{ background: "#dc2626" }}><XCircle size={16} /> Đã hủy</h3>
                <p className={styles.ticketDetailNote}>{session.cancellationReason}</p>
              </section>
            ) : null}

            {session.reviews.length > 0 ? (
              <section className={`${styles.contractFormSection} ${styles.contractSectionGreen}`}>
                <h3 className={styles.contractSectionHeader}><MessageSquare size={16} /> Nhận xét HLV ({session.reviews.length})</h3>
                <ul className={styles.coachReviewList}>
                  {session.reviews.map((r, i) => (
                    <li key={i}>
                      <strong>{r.lesson}</strong>
                      {r.note ? <em>{r.note}</em> : null}
                      <span>{r.date}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className={styles.contractFormSection}>
              <h3 className={styles.contractSectionHeader}><History size={16} /> Lịch sử</h3>
              <ul className={styles.contractTimeline}>
                {session.history.map((h, i) => (
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
            <span>Đã chuyển {session.rescheduledCount} lần</span>
            <div>
              <button className={styles.contractFilterChip} onClick={() => setReviewOpen(true)} type="button"><MessageSquare size={14} /> Nhận xét</button>
              {editable ? (
                <>
                  <button className={styles.contractFilterChip} onClick={() => setRescheduleOpen(true)} type="button"><CalendarRange size={14} /> Chuyển lịch</button>
                  <button className={styles.greenButton} onClick={onComplete} type="button"><CheckCircle2 size={14} /> Đã tập</button>
                  <button className={styles.contractFilterChip} onClick={onNoShow} type="button" style={{ color: "#c2410c" }}><XCircle size={14} /> Không đến</button>
                  <button className={styles.contractFilterChip} onClick={() => setCancelOpen(true)} type="button" style={{ color: "#b91c1c" }}><Trash2 size={14} /> Hủy lịch</button>
                  <button className={styles.contractFilterChip} onClick={onEdit} type="button"><Edit3 size={14} /> Sửa</button>
                </>
              ) : null}
              <button className={styles.contractDelete} onClick={onDelete} type="button" title="Xóa (Admin)"><Trash2 size={14} /></button>
            </div>
          </footer>
        </div>
      </div>

      {rescheduleOpen ? (
        <RescheduleSessionDialog
          session={session}
          onCancel={() => setRescheduleOpen(false)}
          onConfirm={(d, t) => { onReschedule(d, t); setRescheduleOpen(false); }}
        />
      ) : null}

      {reviewOpen ? (
        <AddReviewDialog
          session={session}
          customer={customer}
          coach={coach}
          onCancel={() => setReviewOpen(false)}
          onConfirm={(lesson, note) => { onAddReview(lesson, note); setReviewOpen(false); }}
        />
      ) : null}

      {cancelOpen ? (
        <CancelSessionDialog
          session={session}
          onCancel={() => setCancelOpen(false)}
          onConfirm={(reason) => { onCancel(reason); setCancelOpen(false); }}
        />
      ) : null}
    </>
  );
}

function RescheduleSessionDialog({
  session,
  onCancel,
  onConfirm,
}: {
  session: CoachSession;
  onCancel: () => void;
  onConfirm: (date: string, time: string) => void;
}) {
  const [newDate, setNewDate] = useState(shiftDate(session.date, 1));
  const [newTime, setNewTime] = useState(session.startTime);
  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <form
        className={styles.ticketDialog}
        onSubmit={(e) => { e.preventDefault(); onConfirm(newDate, newTime); }}
      >
        <header>
          <span className={styles.ticketDialogIcon} style={{ background: "#dbeafe", color: "#1e40af" }}>
            <CalendarRange size={20} />
          </span>
          <div>
            <h3>Chuyển lịch {session.id}</h3>
            <p>Đã chuyển <strong>{session.rescheduledCount} lần</strong>. Không giới hạn số lần. Hệ thống tự gửi SMS/Email thông báo.</p>
          </div>
        </header>
        <div className={styles.ticketDialogBody}>
          <div className={styles.contractGrid2}>
            <label>
              <span>Lịch hiện tại</span>
              <input readOnly value={`${session.date} · ${session.startTime}-${session.endTime}`} />
            </label>
            <label>
              <span>Ngày mới <b>*</b></span>
              <input value={newDate} onChange={(e) => setNewDate(e.target.value)} placeholder="dd/mm/yyyy" />
            </label>
            <label>
              <span>Giờ vào mới <b>*</b></span>
              <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
            </label>
            <label>
              <span>Giờ ra (auto)</span>
              <input readOnly value={minutesToTime(timeToMinutes(newTime) + session.durationMinutes)} />
            </label>
          </div>
        </div>
        <footer>
          <button className={styles.contractFilterChip} onClick={onCancel} type="button">Đóng</button>
          <button className={styles.greenButton} type="submit"><CalendarRange size={14} /> Lưu chuyển lịch</button>
        </footer>
      </form>
    </div>
  );
}

function AddReviewDialog({
  session,
  customer,
  coach,
  onCancel,
  onConfirm,
}: {
  session: CoachSession;
  customer?: CustomerLite;
  coach?: typeof COACHES[number];
  onCancel: () => void;
  onConfirm: (lesson: string, note: string) => void;
}) {
  const [lesson, setLesson] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!lesson.trim()) { setError("Nội dung buổi học bắt buộc"); return; }
    onConfirm(lesson.trim(), note.trim());
  };
  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <form className={styles.ticketDialog} onSubmit={submit} style={{ width: "min(560px, 95vw)" }}>
        <header>
          <span className={styles.ticketDialogIcon} style={{ background: "#dcfce7", color: "#15803d" }}>
            <MessageSquare size={20} />
          </span>
          <div>
            <h3>Thêm nhận xét cho buổi {session.id}</h3>
            <p>HLV ghi nhận xét cho học viên sau buổi tập. Hiển thị trong popup chi tiết và lịch sử HV.</p>
          </div>
        </header>
        {error ? <div className={styles.formError}><AlertCircle size={14} /> {error}</div> : null}
        <div className={styles.ticketDialogBody}>
          <div className={styles.ticketDialogInfo}>
            <div><span>Ngày</span><strong>{session.date}</strong></div>
            <div><span>HLV</span><strong>{coach?.name}</strong></div>
            <div><span>Học viên</span><strong>{customer?.name}</strong></div>
            <div><span>Gói tập</span><strong>{customer?.packageName ?? "—"}</strong></div>
          </div>
          <label>
            <span>Nội dung buổi học <b>*</b></span>
            <textarea value={lesson} onChange={(e) => setLesson(e.target.value)} placeholder="VD: Tập swing iron 7, 60 trái, KH cải thiện..." style={{ minHeight: 100 }} />
          </label>
          <label>
            <span>Ghi chú khác</span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Buổi sau focus driver / putting..." />
          </label>
        </div>
        <footer>
          <button className={styles.contractFilterChip} onClick={onCancel} type="button">Hủy</button>
          <button className={styles.greenButton} type="submit"><CheckCircle2 size={14} /> Lưu nhận xét</button>
        </footer>
      </form>
    </div>
  );
}

function CancelSessionDialog({
  session,
  onCancel,
  onConfirm,
}: {
  session: CoachSession;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const presets = ["KH bận đột xuất", "Sức khỏe", "Thời tiết xấu", "HLV ốm", "Khác"];
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!reason.trim()) { setError("Lý do hủy bắt buộc"); return; }
    onConfirm(reason.trim());
  };
  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <form className={styles.ticketDialog} onSubmit={submit}>
        <header>
          <span className={styles.ticketDialogIcon} style={{ background: "#fee2e2", color: "#b91c1c" }}>
            <Trash2 size={20} />
          </span>
          <div>
            <h3>Hủy lịch {session.id}</h3>
            <p>Hệ thống sẽ <strong>hoàn 1 buổi</strong> vào gói của HV (BR-M1-02). Không undo.</p>
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
          <button className={styles.contractFilterChip} onClick={onCancel} type="button">Đóng</button>
          <button className={styles.ticketDialogDanger} type="submit"><Trash2 size={14} /> Hủy lịch</button>
        </footer>
      </form>
    </div>
  );
}

// =====================================================================================
// SECTION L — Booking Config Modal
// =====================================================================================

function BookingConfigModal({
  configs,
  onClose,
  onChange,
  flash,
}: {
  configs: BookingConfig[];
  onClose: () => void;
  onChange: (next: BookingConfig[]) => void;
  flash: (m: string) => void;
}) {
  const [editing, setEditing] = useState<BookingConfig | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const submit = (next: BookingConfig) => {
    const exists = configs.find((c) => c.id === next.id);
    onChange(exists ? configs.map((c) => c.id === next.id ? next : c) : [next, ...configs]);
    flash(`${exists ? "Đã cập nhật" : "Đã thêm"} cấu hình "${next.name}"`);
    setFormOpen(false);
    setEditing(null);
  };

  const remove = (c: BookingConfig) => {
    onChange(configs.filter((x) => x.id !== c.id));
    flash(`Đã xóa cấu hình ${c.name}`);
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.contractFormModal}>
        <header className={styles.contractFormBanner}>
          <h2><Settings size={16} /> Cấu hình khung giờ booking</h2>
          <button onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <div className={styles.contractFormBody}>
          <div className={styles.contractListChipRow}>
            <span className={styles.cellMuted}>{configs.length} cấu hình · {configs.filter((c) => c.active).length} active</span>
            <button className={styles.greenButton} onClick={() => { setEditing(null); setFormOpen(true); }} type="button">
              <PlusCircle size={14} /> Thêm cấu hình
            </button>
          </div>
          <table className={styles.ticketAddonTable}>
            <thead>
              <tr><th>Tên</th><th>Chi nhánh</th><th>Khung giờ</th><th>Trạng thái</th><th></th></tr>
            </thead>
            <tbody>
              {configs.length === 0 ? <tr><td className={styles.emptyTableCell} colSpan={5}>Chưa có cấu hình</td></tr> : null}
              {configs.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.branch}</td>
                  <td>{c.startTime} → {c.endTime}</td>
                  <td>
                    <span className={c.active ? styles.lineToggleActive : styles.lineToggleOff}>
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.contractRowActions}>
                      <button onClick={() => { setEditing(c); setFormOpen(true); }} type="button" title="Sửa"><Edit3 size={14} /></button>
                      <button className={styles.contractDelete} onClick={() => remove(c)} type="button" title="Xóa"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className={styles.contractFormFooter}>
          <span></span>
          <div>
            <button className={styles.contractFilterChip} onClick={onClose} type="button">Đóng</button>
          </div>
        </footer>
      </div>

      {formOpen ? (
        <BookingConfigFormModal
          initial={editing}
          existing={configs}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSubmit={submit}
        />
      ) : null}
    </div>
  );
}

function BookingConfigFormModal({
  initial,
  existing,
  onClose,
  onSubmit,
}: {
  initial: BookingConfig | null;
  existing: BookingConfig[];
  onClose: () => void;
  onSubmit: (c: BookingConfig) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [branch, setBranch] = useState(initial?.branch ?? "NextVision");
  const [startTime, setStartTime] = useState(initial?.startTime ?? "06:00");
  const [endTime, setEndTime] = useState(initial?.endTime ?? "21:00");
  const [active, setActive] = useState(initial?.active ?? true);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) { setError("Tên bắt buộc"); return; }
    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) { setError("Giờ kết thúc phải > bắt đầu"); return; }
    const dup = existing.find((c) => c.id !== initial?.id && c.name === name.trim() && c.branch === branch);
    if (dup) { setError(`Tên đã tồn tại ở chi nhánh ${branch}`); return; }
    onSubmit({
      id: initial?.id ?? `BC-${Date.now()}`,
      name: name.trim(),
      branch,
      startTime,
      endTime,
      active,
      description: description.trim() || undefined,
    });
  };

  return (
    <div className={styles.nestedOverlay} role="dialog" aria-modal="true">
      <form className={styles.ticketSubModal} onSubmit={submit}>
        <header><h3><Settings size={16} /> {initial ? "Sửa cấu hình" : "Thêm cấu hình booking"}</h3><button onClick={onClose} type="button"><X size={16} /></button></header>
        {error ? <div className={styles.formError}><AlertCircle size={14} /> {error}</div> : null}
        <div className={styles.contractGrid2}>
          <label>
            <span>Tên cấu hình <b>*</b></span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Khung sáng sân A" />
          </label>
          <label>
            <span>Chi nhánh <b>*</b></span>
            <select className={styles.selectInput} value={branch} onChange={(e) => setBranch(e.target.value)}>
              {BRANCHES.map((b) => <option key={b}>{b}</option>)}
            </select>
          </label>
          <label>
            <span>Giờ bắt đầu <b>*</b></span>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </label>
          <label>
            <span>Giờ kết thúc <b>*</b></span>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </label>
          <label className={styles.contractCheckboxLine}>
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Active — Cấu hình đang dùng
          </label>
          <label className={styles.fullField}>
            <span>Ghi chú</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
        </div>
        <footer>
          <button className={styles.contractFilterChip} onClick={onClose} type="button">Đóng</button>
          <button className={styles.greenButton} type="submit"><CheckCircle2 size={14} /> Lưu</button>
        </footer>
      </form>
    </div>
  );
}

"use client";

import { Fragment, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Calendar as CalendarIcon,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  GraduationCap,
  Phone,
  PlusCircle,
  Search,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import styles from "../page.module.css";
import { Screen } from "../_shared/components";

// =====================================================================================
// SECTION A — Constants
// =====================================================================================

const BRANCHES = ["NextVision", "Hà Nội Center", "Sài Gòn West"] as const;
const DAYS_VN = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"] as const;
const DAY_FULL_VN = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"] as const;

const COACHES = [
  { id: "TR-001", name: "Trần Văn An", specialty: "Swing cơ bản" },
  { id: "TR-002", name: "Đỗ Hồng Quân", specialty: "Putting & Short Game" },
  { id: "TR-003", name: "Nguyễn Mai", specialty: "Driver, Long Iron" },
  { id: "TR-004", name: "Phạm Hùng", specialty: "Course Management" },
  { id: "TR-005", name: "Hoàng Tuấn", specialty: "Lesson Pro" },
] as const;

const ROOM_OPTIONS = ["Phòng 101", "Phòng 102", "Phòng thực hành Swing", "Phòng Putting", "Sân Driving Range"] as const;

const SERVICE_PACKAGES = [
  { code: "PKG-PAY", name: "Trả theo buổi", description: "1 buổi · 1 buổi", sessions: 1 },
  { code: "PKG-1M", name: "Gói 1 tháng", description: "12 buổi · 1 tháng", sessions: 12 },
  { code: "PKG-3M", name: "Gói 3 tháng", description: "36 buổi · 3 tháng", sessions: 36 },
  { code: "PKG-6M", name: "Gói 6 tháng", description: "72 buổi · 6 tháng", sessions: 72 },
  { code: "PKG-1Y", name: "Gói 1 năm", description: "144 buổi · 1 năm", sessions: 144 },
] as const;

const COLOR_PRESETS = [
  { value: "#7c3aed", label: "Tím" },
  { value: "#2563eb", label: "Xanh dương" },
  { value: "#16a34a", label: "Xanh lá" },
  { value: "#f59e0b", label: "Cam" },
  { value: "#db2777", label: "Hồng" },
  { value: "#dc2626", label: "Đỏ" },
  { value: "#0891b2", label: "Cyan" },
  { value: "#65a30d", label: "Xanh nõn chuối" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#0d9488", label: "Teal" },
] as const;

// Slots 15 phút từ 06:00 → 21:45 cho lịch tuần, đồng bộ với lịch HLV.
const generateHourSlots = (): string[] => {
  const slots: string[] = [];
  for (let h = 6; h <= 21; h += 1) {
    for (const m of [0, 15, 30, 45]) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
};
const HOUR_SLOTS = generateHourSlots();
const CLASS_CALENDAR_SLOT_HEIGHT = 34;

// =====================================================================================
// SECTION B — Types
// =====================================================================================

type ClassType = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
};

type StudentLite = {
  code: string;
  name: string;
  phone: string;
  packageCode: string;
};

type DaySchedule = {
  day: number; // 0 = T2 ... 6 = CN
  startTime: string;
  endTime: string;
};

type GolfClass = {
  id: string;
  name: string;
  classTypeId: string;
  coachId: string;
  durationMinutes: number;
  capacity: number;
  startDate: string; // dd/mm/yyyy
  endDate?: string;
  room: string;
  description?: string;
  schedule: DaySchedule[];
  appliedPackages: string[];
  branch: string;
  createdAt: string;
};

type ClassSession = {
  id: string;
  classId: string;
  date: string; // dd/mm/yyyy
  dayOfWeek: number; // 0 = T2 ... 6 = CN
  startTime: string;
  endTime: string;
  enrolled: { studentCode: string; bookedAt: string; bookedBy: string; note?: string }[];
};

// =====================================================================================
// SECTION C — Helpers
// =====================================================================================

const TODAY = "08/05/2026";

const parseVnDate = (vn: string): Date => {
  const [d, m, y] = vn.split("/").map((x) => parseInt(x, 10));
  return new Date(y, m - 1, d);
};

const formatVn = (date: Date): string => {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}/${date.getFullYear()}`;
};

const formatIsoDate = (date: Date): string => {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
};

const parseIsoDate = (iso: string): Date => {
  const [y, m, d] = iso.split("-").map((x) => parseInt(x, 10));
  return new Date(y, m - 1, d);
};

const getDayOfWeek = (date: Date): number => {
  // 0 = T2, 1 = T3, ..., 6 = CN
  const js = date.getDay();
  return js === 0 ? 6 : js - 1;
};

const startOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const day = getDayOfWeek(result);
  result.setDate(result.getDate() - day);
  return result;
};

const minutesBetween = (start: string, end: string): number => {
  const [sh, sm] = start.split(":").map((x) => parseInt(x, 10));
  const [eh, em] = end.split(":").map((x) => parseInt(x, 10));
  return (eh * 60 + em) - (sh * 60 + sm);
};

const addMinutes = (time: string, minutes: number): string => {
  const [h, m] = time.split(":").map((x) => parseInt(x, 10));
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60);
  const newM = total % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
};

// =====================================================================================
// SECTION D — Seed data
// =====================================================================================

const INITIAL_STUDENTS: StudentLite[] = [
  { code: "HV001", name: "Nguyễn Văn An", phone: "0901234567", packageCode: "PKG-3M" },
  { code: "HV002", name: "Trần Thị Bình", phone: "0902345678", packageCode: "PKG-1M" },
  { code: "HV003", name: "Lê Văn Cường", phone: "0923456789", packageCode: "PKG-3M" },
  { code: "HV005", name: "Huỳnh Xuân Long", phone: "0910070932", packageCode: "PKG-6M" },
  { code: "HV007", name: "Phan Mỹ Tâm", phone: "0907111222", packageCode: "PKG-1M" },
  { code: "HV012", name: "Đỗ Mai Hương", phone: "0345678901", packageCode: "PKG-1Y" },
  { code: "HV015", name: "Vũ Hoàng Nam", phone: "0987654321", packageCode: "PKG-3M" },
  { code: "HV020", name: "Bùi Thanh Tú", phone: "0976543210", packageCode: "PKG-PAY" },
];

const INITIAL_CLASS_TYPES: ClassType[] = [
  { id: "CT-001", name: "Golf Swing", color: "#7c3aed", createdAt: "01/01/2026" },
  { id: "CT-002", name: "Putting", color: "#2563eb", createdAt: "01/01/2026" },
  { id: "CT-003", name: "Chipping", color: "#16a34a", createdAt: "01/01/2026" },
  { id: "CT-004", name: "Driving", color: "#f59e0b", createdAt: "01/01/2026" },
  { id: "CT-005", name: "Short Game", color: "#db2777", createdAt: "10/01/2026" },
  { id: "CT-006", name: "Course Management", color: "#0891b2", createdAt: "15/01/2026" },
  { id: "CT-007", name: "Rules & Etiquette", color: "#dc2626", createdAt: "20/01/2026" },
];

const INITIAL_CLASSES: GolfClass[] = [
  {
    id: "CL-001",
    name: "Golf Swing Cơ Bản",
    classTypeId: "CT-001",
    coachId: "TR-001",
    durationMinutes: 60,
    capacity: 20,
    startDate: "01/03/2026",
    endDate: "31/12/2026",
    room: "Phòng thực hành Swing",
    description: "Lớp dành cho học viên mới làm quen với swing.",
    schedule: [
      { day: 0, startTime: "17:30", endTime: "18:30" },
      { day: 2, startTime: "17:30", endTime: "18:30" },
      { day: 4, startTime: "17:30", endTime: "18:30" },
    ],
    appliedPackages: ["PKG-1M", "PKG-3M", "PKG-6M", "PKG-1Y"],
    branch: "NextVision",
    createdAt: "20/02/2026",
  },
  {
    id: "CL-002",
    name: "Putting Kỹ Thuật",
    classTypeId: "CT-002",
    coachId: "TR-002",
    durationMinutes: 45,
    capacity: 12,
    startDate: "01/03/2026",
    endDate: "31/12/2026",
    room: "Phòng Putting",
    description: "Lớp luyện putting cho học viên trung cấp.",
    schedule: [
      { day: 1, startTime: "18:00", endTime: "18:45" },
      { day: 3, startTime: "18:00", endTime: "18:45" },
    ],
    appliedPackages: ["PKG-3M", "PKG-6M", "PKG-1Y"],
    branch: "NextVision",
    createdAt: "20/02/2026",
  },
  {
    id: "CL-003",
    name: "Driving Power",
    classTypeId: "CT-004",
    coachId: "TR-003",
    durationMinutes: 90,
    capacity: 15,
    startDate: "01/03/2026",
    room: "Sân Driving Range",
    description: "Tăng lực và độ chính xác cho cú phát bóng dài.",
    schedule: [
      { day: 5, startTime: "08:00", endTime: "09:30" },
      { day: 6, startTime: "08:00", endTime: "09:30" },
    ],
    appliedPackages: ["PKG-3M", "PKG-6M", "PKG-1Y"],
    branch: "NextVision",
    createdAt: "20/02/2026",
  },
  {
    id: "CL-004",
    name: "Short Game Master",
    classTypeId: "CT-005",
    coachId: "TR-002",
    durationMinutes: 60,
    capacity: 10,
    startDate: "15/04/2026",
    room: "Phòng 101",
    description: "Tinh chỉnh cú đánh ngắn và pitch shot.",
    schedule: [
      { day: 1, startTime: "19:00", endTime: "20:00" },
      { day: 4, startTime: "19:00", endTime: "20:00" },
    ],
    appliedPackages: ["PKG-3M", "PKG-6M", "PKG-1Y"],
    branch: "NextVision",
    createdAt: "10/04/2026",
  },
  {
    id: "CL-005",
    name: "Course Management",
    classTypeId: "CT-006",
    coachId: "TR-004",
    durationMinutes: 60,
    capacity: 8,
    startDate: "15/04/2026",
    room: "Phòng 102",
    description: "Chiến thuật chơi sân thực tế.",
    schedule: [
      { day: 5, startTime: "10:00", endTime: "11:00" },
    ],
    appliedPackages: ["PKG-6M", "PKG-1Y"],
    branch: "NextVision",
    createdAt: "10/04/2026",
  },
];

// Sinh sessions từ classes cho 4 tuần xung quanh TODAY
const buildSessions = (classes: GolfClass[]): ClassSession[] => {
  const sessions: ClassSession[] = [];
  const today = parseVnDate(TODAY);
  const rangeStart = new Date(today);
  rangeStart.setDate(rangeStart.getDate() - 14);
  const rangeEnd = new Date(today);
  rangeEnd.setDate(rangeEnd.getDate() + 21);

  classes.forEach((cls) => {
    const clsStart = parseVnDate(cls.startDate);
    const clsEnd = cls.endDate ? parseVnDate(cls.endDate) : null;
    const cursor = new Date(rangeStart);
    while (cursor <= rangeEnd) {
      if (cursor >= clsStart && (!clsEnd || cursor <= clsEnd)) {
        const dow = getDayOfWeek(cursor);
        const slot = cls.schedule.find((s) => s.day === dow);
        if (slot) {
          sessions.push({
            id: `${cls.id}-${formatIsoDate(cursor)}`,
            classId: cls.id,
            date: formatVn(cursor),
            dayOfWeek: dow,
            startTime: slot.startTime,
            endTime: slot.endTime,
            enrolled: [],
          });
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  });
  return sessions;
};

const SEED_SESSIONS_BASE = buildSessions(INITIAL_CLASSES);

const SEED_ENROLLMENTS: { sessionId: string; students: { code: string; note?: string }[] }[] = [
  { sessionId: `CL-001-2026-05-04`, students: [{ code: "HV001" }, { code: "HV003" }, { code: "HV015" }] },
  { sessionId: `CL-001-2026-05-06`, students: [{ code: "HV001" }, { code: "HV007", note: "Đến trễ 10p" }] },
  { sessionId: `CL-001-2026-05-08`, students: [{ code: "HV001" }, { code: "HV003" }, { code: "HV012" }, { code: "HV015" }] },
  { sessionId: `CL-002-2026-05-05`, students: [{ code: "HV005" }, { code: "HV012" }] },
  { sessionId: `CL-002-2026-05-07`, students: [{ code: "HV005" }, { code: "HV012" }, { code: "HV015" }] },
  { sessionId: `CL-003-2026-05-09`, students: [{ code: "HV001" }, { code: "HV005" }, { code: "HV012" }, { code: "HV015" }] },
  { sessionId: `CL-003-2026-05-10`, students: [{ code: "HV005" }, { code: "HV012" }] },
  { sessionId: `CL-004-2026-05-05`, students: [{ code: "HV012" }] },
  { sessionId: `CL-004-2026-05-08`, students: [{ code: "HV001" }, { code: "HV012" }, { code: "HV015" }] },
  { sessionId: `CL-005-2026-05-09`, students: [{ code: "HV005" }] },
];

const INITIAL_SESSIONS: ClassSession[] = SEED_SESSIONS_BASE.map((session) => {
  const seeded = SEED_ENROLLMENTS.find((s) => s.sessionId === session.id);
  if (!seeded) return session;
  return {
    ...session,
    enrolled: seeded.students.map((s) => ({
      studentCode: s.code,
      bookedAt: "07/05/2026 14:30",
      bookedBy: "Nguyễn Thị Lan",
      note: s.note,
    })),
  };
});

// =====================================================================================
// SECTION E — Top-level component
// =====================================================================================

type Tab = "list" | "calendar";

export default function ClassesScreen() {
  const [tab, setTab] = useState<Tab>("list");
  const [classes, setClasses] = useState<GolfClass[]>(INITIAL_CLASSES);
  const [classTypes, setClassTypes] = useState<ClassType[]>(INITIAL_CLASS_TYPES);
  const [sessions, setSessions] = useState<ClassSession[]>(INITIAL_SESSIONS);
  const [students] = useState<StudentLite[]>(INITIAL_STUDENTS);

  // List tab state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTypeId, setFilterTypeId] = useState<string>("all");

  // Calendar tab state
  const [weekAnchor, setWeekAnchor] = useState<string>(formatIsoDate(parseVnDate(TODAY)));

  // Modal state
  const [classFormOpen, setClassFormOpen] = useState<{ mode: "create" } | { mode: "edit"; classId: string } | null>(null);
  const [addTypeOpen, setAddTypeOpen] = useState(false);
  const [classDetailId, setClassDetailId] = useState<string | null>(null);
  const [bookFormOpen, setBookFormOpen] = useState<{ classId?: string } | null>(null);
  const [editSessionId, setEditSessionId] = useState<string | null>(null);
  const [studentListSessionId, setStudentListSessionId] = useState<string | null>(null);
  const [deleteClassId, setDeleteClassId] = useState<string | null>(null);
  const [calendarSessionId, setCalendarSessionId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const totalClasses = classes.length;
    const distinctCoaches = new Set(classes.map((c) => c.coachId)).size;
    const totalCapacity = classes.reduce((sum, c) => sum + c.capacity, 0);
    return { totalClasses, distinctCoaches, totalCapacity };
  }, [classes]);

  const filteredClasses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return classes.filter((c) => {
      if (filterTypeId !== "all" && c.classTypeId !== filterTypeId) return false;
      if (!q) return true;
      const coachName = COACHES.find((co) => co.id === c.coachId)?.name ?? "";
      return c.name.toLowerCase().includes(q) || coachName.toLowerCase().includes(q);
    });
  }, [classes, filterTypeId, searchQuery]);

  const upsertClass = (cls: GolfClass) => {
    setClasses((prev) => {
      const exists = prev.some((c) => c.id === cls.id);
      return exists ? prev.map((c) => (c.id === cls.id ? cls : c)) : [cls, ...prev];
    });
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.classId !== cls.id);
      return [...filtered, ...buildSessions([cls])].map((s) => {
        const existed = prev.find((p) => p.id === s.id);
        return existed ? { ...s, enrolled: existed.enrolled } : s;
      });
    });
  };

  const deleteClass = (classId: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== classId));
    setSessions((prev) => prev.filter((s) => s.classId !== classId));
  };

  const bookSessions = (sessionIds: string[], studentCodes: string[], note?: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (!sessionIds.includes(s.id)) return s;
        const existing = new Set(s.enrolled.map((e) => e.studentCode));
        const newOnes = studentCodes
          .filter((code) => !existing.has(code))
          .map((code) => ({
            studentCode: code,
            bookedAt: `${TODAY} 14:30`,
            bookedBy: "Lễ tân",
            note,
          }));
        return { ...s, enrolled: [...s.enrolled, ...newOnes] };
      }),
    );
  };

  const updateSession = (sessionId: string, patch: Partial<Pick<ClassSession, "startTime" | "endTime">>) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        const next = { ...s, ...patch };
        return next;
      }),
    );
  };

  return (
    <Screen title="Lịch Lớp" subtitle="Quản lý các lớp học nhóm — danh sách lớp, lịch tuần và đặt lịch cho học viên">
      {/* ============ TOOLBAR / TABS ============ */}
      <div className={styles.classesTopBar}>
        <div className={styles.classesTabs}>
          <button
            className={`${styles.classesTab} ${tab === "list" ? styles.classesTabActive : ""}`}
            onClick={() => setTab("list")}
            type="button"
          >
            <BookOpen size={16} /> Danh sách lớp
          </button>
          <button
            className={`${styles.classesTab} ${tab === "calendar" ? styles.classesTabActive : ""}`}
            onClick={() => setTab("calendar")}
            type="button"
          >
            <CalendarDays size={16} /> Lịch tuần
          </button>
        </div>
        <button className={styles.classesPrimary} onClick={() => setClassFormOpen({ mode: "create" })} type="button">
          <PlusCircle size={16} /> Thêm lớp mới
        </button>
      </div>

      {tab === "list" ? (
        <>
          {/* ============ KPI ============ */}
          <div className={styles.classesKpiGrid}>
            <article className={`${styles.classesKpiCard} ${styles.classesKpiPurple}`}>
              <span>Tổng số lớp</span>
              <strong>{stats.totalClasses}</strong>
              <p>Lớp đang hoạt động trong hệ thống</p>
            </article>
            <article className={`${styles.classesKpiCard} ${styles.classesKpiBlue}`}>
              <span>Giáo viên</span>
              <strong>{stats.distinctCoaches}</strong>
              <p>HLV đang phụ trách lớp</p>
            </article>
            <article className={`${styles.classesKpiCard} ${styles.classesKpiGreen}`}>
              <span>Sức chứa</span>
              <strong>{stats.totalCapacity}</strong>
              <p>Tổng số chỗ tất cả lớp</p>
            </article>
          </div>

          {/* ============ FILTER BAR ============ */}
          <div className={styles.classesFilterRow}>
            <div className={styles.classesSearchBox}>
              <Search size={16} />
              <input
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên lớp, giáo viên..."
                type="text"
                value={searchQuery}
              />
            </div>
            <div className={styles.classesTypeChips}>
              <button
                className={`${styles.classesTypeChip} ${filterTypeId === "all" ? styles.classesTypeChipActive : ""}`}
                onClick={() => setFilterTypeId("all")}
                type="button"
              >
                Tất cả
              </button>
              {classTypes.map((ct) => (
                <button
                  className={`${styles.classesTypeChip} ${filterTypeId === ct.id ? styles.classesTypeChipActive : ""}`}
                  key={ct.id}
                  onClick={() => setFilterTypeId(ct.id)}
                  style={filterTypeId === ct.id ? { borderColor: ct.color, color: ct.color } : undefined}
                  type="button"
                >
                  <span className={styles.classesChipDot} style={{ background: ct.color }} /> {ct.name}
                </button>
              ))}
            </div>
          </div>

          {/* ============ CLASS GRID ============ */}
          {filteredClasses.length === 0 ? (
            <div className={styles.classesEmpty}>Không tìm thấy lớp nào phù hợp.</div>
          ) : (
            <div className={styles.classesCardGrid}>
              {filteredClasses.map((cls) => {
                const ct = classTypes.find((t) => t.id === cls.classTypeId);
                const coach = COACHES.find((c) => c.id === cls.coachId);
                const enrolledCount = sessions
                  .filter((s) => s.classId === cls.id)
                  .reduce((sum, s) => sum + s.enrolled.length, 0);
                return (
                  <article
                    className={styles.classesCard}
                    key={cls.id}
                    onClick={() => setClassDetailId(cls.id)}
                    style={{ borderTopColor: ct?.color ?? "#7c3aed" }}
                  >
                    <header>
                      <h4>{cls.name}</h4>
                      <span
                        className={styles.classesBadge}
                        style={{ background: ct ? `${ct.color}1a` : "#f3f4f6", color: ct?.color ?? "#374151" }}
                      >
                        {ct?.name ?? "—"}
                      </span>
                    </header>
                    <ul className={styles.classesCardMeta}>
                      <li><GraduationCap size={14} /> {coach?.name ?? "Chưa gán"}</li>
                      <li><Clock size={14} /> {cls.durationMinutes} phút · {cls.capacity} chỗ</li>
                      <li>
                        <CalendarDays size={14} />
                        {cls.schedule
                          .map((s) => `${DAYS_VN[s.day]} ${s.startTime}`)
                          .join(" · ")}
                      </li>
                      <li><User size={14} /> {cls.room}</li>
                    </ul>
                    {cls.description ? <p className={styles.classesCardDesc}>{cls.description}</p> : null}
                    <footer>
                      <span className={styles.classesCardDate}>Tạo {cls.createdAt}</span>
                      <span className={styles.classesCardEnrolled}>{enrolledCount} lượt đăng ký</span>
                    </footer>
                  </article>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <CalendarTab
          classes={classes}
          classTypes={classTypes}
          onBookSlot={() => setBookFormOpen({})}
          onSessionClick={(id) => setCalendarSessionId(id)}
          sessions={sessions}
          weekAnchor={weekAnchor}
          onWeekAnchorChange={setWeekAnchor}
        />
      )}

      {/* ============ MODALS ============ */}
      {classFormOpen ? (
        <ClassFormModal
          classTypes={classTypes}
          editingClass={
            classFormOpen.mode === "edit"
              ? classes.find((c) => c.id === classFormOpen.classId)
              : undefined
          }
          mode={classFormOpen.mode}
          onAddType={() => setAddTypeOpen(true)}
          onClose={() => setClassFormOpen(null)}
          onSave={(cls) => {
            upsertClass(cls);
            setClassFormOpen(null);
          }}
        />
      ) : null}

      {addTypeOpen ? (
        <AddTypeModal
          existingNames={classTypes.map((t) => t.name)}
          onClose={() => setAddTypeOpen(false)}
          onSave={(t) => {
            setClassTypes((prev) => [...prev, t]);
            setAddTypeOpen(false);
          }}
        />
      ) : null}

      {classDetailId ? (
        <ClassDetailModal
          cls={classes.find((c) => c.id === classDetailId)!}
          classType={classTypes.find((t) => t.id === classes.find((c) => c.id === classDetailId)?.classTypeId)}
          coachName={COACHES.find((c) => c.id === classes.find((cl) => cl.id === classDetailId)?.coachId)?.name ?? "—"}
          enrolledCount={sessions
            .filter((s) => s.classId === classDetailId)
            .reduce((sum, s) => sum + s.enrolled.length, 0)}
          onBook={() => {
            setBookFormOpen({ classId: classDetailId });
            setClassDetailId(null);
          }}
          onClose={() => setClassDetailId(null)}
          onDelete={() => {
            setDeleteClassId(classDetailId);
            setClassDetailId(null);
          }}
          onEdit={() => {
            setClassFormOpen({ mode: "edit", classId: classDetailId });
            setClassDetailId(null);
          }}
          onShowStudents={() => {
            const firstSession = sessions
              .filter((s) => s.classId === classDetailId)
              .sort((a, b) => parseVnDate(a.date).getTime() - parseVnDate(b.date).getTime())
              .find((s) => parseVnDate(s.date) >= parseVnDate(TODAY))
              ?? sessions.find((s) => s.classId === classDetailId);
            if (firstSession) setStudentListSessionId(firstSession.id);
          }}
        />
      ) : null}

      {bookFormOpen ? (
        <BookScheduleModal
          classes={classes}
          classTypes={classTypes}
          initialClassId={bookFormOpen.classId}
          onClose={() => setBookFormOpen(null)}
          onConfirm={(sessionIds, studentCodes, note) => {
            bookSessions(sessionIds, studentCodes, note);
            setBookFormOpen(null);
          }}
          sessions={sessions}
          students={students}
        />
      ) : null}

      {calendarSessionId ? (
        <SessionPopup
          classData={classes.find((c) => c.id === sessions.find((s) => s.id === calendarSessionId)?.classId)!}
          classType={classTypes.find(
            (t) =>
              t.id ===
              classes.find((c) => c.id === sessions.find((s) => s.id === calendarSessionId)?.classId)?.classTypeId,
          )}
          coachName={
            COACHES.find(
              (c) =>
                c.id ===
                classes.find((cl) => cl.id === sessions.find((s) => s.id === calendarSessionId)?.classId)?.coachId,
            )?.name ?? "—"
          }
          onBook={() => {
            const session = sessions.find((s) => s.id === calendarSessionId);
            if (session) setBookFormOpen({ classId: session.classId });
            setCalendarSessionId(null);
          }}
          onClose={() => setCalendarSessionId(null)}
          onDelete={() => {
            const session = sessions.find((s) => s.id === calendarSessionId);
            if (session) setDeleteClassId(session.classId);
            setCalendarSessionId(null);
          }}
          onEdit={() => {
            setEditSessionId(calendarSessionId);
            setCalendarSessionId(null);
          }}
          onShowStudents={() => {
            setStudentListSessionId(calendarSessionId);
            setCalendarSessionId(null);
          }}
          session={sessions.find((s) => s.id === calendarSessionId)!}
        />
      ) : null}

      {editSessionId ? (
        <EditSessionModal
          classData={classes.find((c) => c.id === sessions.find((s) => s.id === editSessionId)?.classId)!}
          coachName={
            COACHES.find(
              (c) =>
                c.id ===
                classes.find((cl) => cl.id === sessions.find((s) => s.id === editSessionId)?.classId)?.coachId,
            )?.name ?? "—"
          }
          onClose={() => setEditSessionId(null)}
          onSave={(patch) => {
            updateSession(editSessionId, patch);
            setEditSessionId(null);
          }}
          session={sessions.find((s) => s.id === editSessionId)!}
        />
      ) : null}

      {studentListSessionId ? (
        <StudentListPopup
          classData={classes.find((c) => c.id === sessions.find((s) => s.id === studentListSessionId)?.classId)!}
          coachName={
            COACHES.find(
              (c) =>
                c.id ===
                classes.find((cl) => cl.id === sessions.find((s) => s.id === studentListSessionId)?.classId)?.coachId,
            )?.name ?? "—"
          }
          onClose={() => setStudentListSessionId(null)}
          session={sessions.find((s) => s.id === studentListSessionId)!}
          students={students}
        />
      ) : null}

      {deleteClassId ? (
        <DeleteClassDialog
          cls={classes.find((c) => c.id === deleteClassId)!}
          coachName={COACHES.find((c) => c.id === classes.find((cl) => cl.id === deleteClassId)?.coachId)?.name ?? "—"}
          enrolledCount={sessions
            .filter((s) => s.classId === deleteClassId)
            .reduce((sum, s) => sum + s.enrolled.length, 0)}
          onCancel={() => setDeleteClassId(null)}
          onConfirm={() => {
            deleteClass(deleteClassId);
            setDeleteClassId(null);
          }}
        />
      ) : null}
    </Screen>
  );
}

// =====================================================================================
// SECTION F — Calendar Tab
// =====================================================================================

function CalendarTab({
  classes,
  classTypes,
  onBookSlot,
  onSessionClick,
  onWeekAnchorChange,
  sessions,
  weekAnchor,
}: {
  classes: GolfClass[];
  classTypes: ClassType[];
  onBookSlot: () => void;
  onSessionClick: (sessionId: string) => void;
  onWeekAnchorChange: (iso: string) => void;
  sessions: ClassSession[];
  weekAnchor: string;
}) {
  const weekStart = useMemo(() => startOfWeek(parseIsoDate(weekAnchor)), [weekAnchor]);
  const weekDates = useMemo(() => {
    const result: Date[] = [];
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      result.push(d);
    }
    return result;
  }, [weekStart]);

  const weekStartVn = formatVn(weekDates[0]);
  const weekEndVn = formatVn(weekDates[6]);

  const sessionsThisWeek = useMemo(
    () =>
      sessions.filter((s) => {
        const d = parseVnDate(s.date);
        return d >= weekDates[0] && d <= weekDates[6];
      }),
    [sessions, weekDates],
  );

  const goPrevWeek = () => {
    const d = parseIsoDate(weekAnchor);
    d.setDate(d.getDate() - 7);
    onWeekAnchorChange(formatIsoDate(d));
  };

  const goNextWeek = () => {
    const d = parseIsoDate(weekAnchor);
    d.setDate(d.getDate() + 7);
    onWeekAnchorChange(formatIsoDate(d));
  };

  const usedTypes = useMemo(() => {
    const ids = new Set<string>();
    sessionsThisWeek.forEach((s) => {
      const cls = classes.find((c) => c.id === s.classId);
      if (cls) ids.add(cls.classTypeId);
    });
    return classTypes.filter((t) => ids.has(t.id));
  }, [classes, classTypes, sessionsThisWeek]);

  return (
    <div className={styles.classesCalendarBlock}>
      <div className={styles.classesCalendarHeader}>
        <div className={styles.classesCalendarNav}>
          <button onClick={goPrevWeek} type="button"><ChevronLeft size={18} /></button>
          <div className={styles.classesCalendarWeek}>
            <CalendarIcon size={16} />
            <strong>Tuần {weekStartVn} – {weekEndVn}</strong>
          </div>
          <button onClick={goNextWeek} type="button"><ChevronRight size={18} /></button>
          <button
            className={styles.classesCalendarToday}
            onClick={() => onWeekAnchorChange(formatIsoDate(parseVnDate(TODAY)))}
            type="button"
          >
            Hôm nay
          </button>
          <input
            className={styles.classesCalendarPicker}
            onChange={(e) => onWeekAnchorChange(e.target.value)}
            type="date"
            value={weekAnchor}
          />
        </div>
        <div className={styles.classesCalendarStat}>
          <Users size={16} /> {sessionsThisWeek.length} buổi · {classes.length} lớp đang chạy
        </div>
      </div>

      <div className={styles.classesCalendarGrid}>
        <div className={styles.classesCalendarTimeCol}>
          <div className={styles.classesCalendarHead}>Giờ</div>
          {HOUR_SLOTS.map((slot) => {
            const isHourMark = slot.endsWith(":00");
            const isHalfMark = slot.endsWith(":30");
            return (
              <div
                className={`${styles.classesCalendarTimeCell} ${isHourMark ? styles.classesCalendarTimeHour : isHalfMark ? styles.classesCalendarTimeHalf : styles.classesCalendarTimeMinor}`}
                key={slot}
              >
                {isHourMark ? <strong>{slot}</strong> : <span>{slot}</span>}
              </div>
            );
          })}
        </div>
        {weekDates.map((date, dayIdx) => {
          const isToday = formatVn(date) === TODAY;
          return (
            <div className={styles.classesCalendarDayCol} key={`day-${dayIdx}`}>
              <div className={`${styles.classesCalendarHead} ${isToday ? styles.classesCalendarHeadToday : ""}`}>
                <strong>{DAY_FULL_VN[dayIdx]}</strong>
                <span>{formatVn(date)}</span>
              </div>
              {HOUR_SLOTS.map((slot) => {
                const isHourMark = slot.endsWith(":00");
                const cellSessions = sessionsThisWeek.filter(
                  (s) => s.dayOfWeek === dayIdx && s.startTime === slot && s.date === formatVn(date),
                );
                if (cellSessions.length === 0) {
                  return (
                    <button
                      className={`${styles.classesCalendarCell} ${isHourMark ? styles.classesCalendarCellHour : ""}`}
                      key={`${dayIdx}-${slot}`}
                      onClick={onBookSlot}
                      type="button"
                    />
                  );
                }
                return (
                  <div className={`${styles.classesCalendarCell} ${isHourMark ? styles.classesCalendarCellHour : ""}`} key={`${dayIdx}-${slot}`}>
                    {cellSessions.map((s) => {
                      const cls = classes.find((c) => c.id === s.classId);
                      const ct = cls ? classTypes.find((t) => t.id === cls.classTypeId) : undefined;
                      const coach = cls ? COACHES.find((c) => c.id === cls.coachId) : undefined;
                      const remaining = (cls?.capacity ?? 0) - s.enrolled.length;
                      const heightSlots = Math.max(1, Math.ceil(minutesBetween(s.startTime, s.endTime) / 15));
                      return (
                        <button
                          className={styles.classesSessionCard}
                          key={s.id}
                          onClick={() => onSessionClick(s.id)}
                          style={{
                            background: ct ? `${ct.color}1a` : "#f3f4f6",
                            borderLeftColor: ct?.color ?? "#7c3aed",
                            height: `${heightSlots * CLASS_CALENDAR_SLOT_HEIGHT - 6}px`,
                          }}
                          type="button"
                        >
                          <strong style={{ color: ct?.color ?? "#374151" }}>{cls?.name ?? "—"}</strong>
                          <span>{s.startTime} – {s.endTime}</span>
                          <span>{coach?.name ?? "—"}</span>
                          <span className={styles.classesSessionMeta}>
                            <Users size={11} /> {s.enrolled.length}/{cls?.capacity ?? 0}
                            {remaining > 0 ? ` · còn ${remaining}` : " · đã đầy"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className={styles.classesLegend}>
        <strong>Loại lớp:</strong>
        {usedTypes.map((t) => (
          <span className={styles.classesLegendItem} key={t.id}>
            <span className={styles.classesLegendDot} style={{ background: t.color }} /> {t.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// =====================================================================================
// SECTION G — Class Form Modal (Add / Edit)
// =====================================================================================

function ClassFormModal({
  classTypes,
  editingClass,
  mode,
  onAddType,
  onClose,
  onSave,
}: {
  classTypes: ClassType[];
  editingClass?: GolfClass;
  mode: "create" | "edit";
  onAddType: () => void;
  onClose: () => void;
  onSave: (cls: GolfClass) => void;
}) {
  const [name, setName] = useState(editingClass?.name ?? "");
  const [classTypeId, setClassTypeId] = useState(editingClass?.classTypeId ?? classTypes[0]?.id ?? "");
  const [coachId, setCoachId] = useState<string>(editingClass?.coachId ?? COACHES[0].id);
  const [duration, setDuration] = useState(String(editingClass?.durationMinutes ?? 60));
  const [capacity, setCapacity] = useState(String(editingClass?.capacity ?? 20));
  const [startDate, setStartDate] = useState<string>(
    editingClass ? formatIsoDate(parseVnDate(editingClass.startDate)) : formatIsoDate(parseVnDate(TODAY)),
  );
  const [endDate, setEndDate] = useState<string>(
    editingClass?.endDate ? formatIsoDate(parseVnDate(editingClass.endDate)) : "",
  );
  const [room, setRoom] = useState(editingClass?.room ?? ROOM_OPTIONS[0]);
  const [description, setDescription] = useState(editingClass?.description ?? "");
  const [branch, setBranch] = useState<string>(editingClass?.branch ?? BRANCHES[0]);

  const initialDays: Record<number, { active: boolean; startTime: string; endTime: string }> = {};
  for (let d = 0; d < 7; d += 1) {
    const ex = editingClass?.schedule.find((s) => s.day === d);
    initialDays[d] = {
      active: Boolean(ex),
      startTime: ex?.startTime ?? "17:30",
      endTime: ex?.endTime ?? "18:30",
    };
  }
  const [days, setDays] = useState(initialDays);
  const [appliedPackages, setAppliedPackages] = useState<string[]>(
    editingClass?.appliedPackages ?? [],
  );
  const [packageQuery, setPackageQuery] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredPackages = useMemo(() => {
    const q = packageQuery.trim().toLowerCase();
    if (!q) return SERVICE_PACKAGES;
    return SERVICE_PACKAGES.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
    );
  }, [packageQuery]);

  const toggleDay = (d: number) => {
    setDays((prev) => ({ ...prev, [d]: { ...prev[d], active: !prev[d].active } }));
  };

  const setDayTime = (d: number, key: "startTime" | "endTime", value: string) => {
    setDays((prev) => ({ ...prev, [d]: { ...prev[d], [key]: value } }));
  };

  const togglePackage = (code: string) => {
    setAppliedPackages((prev) =>
      prev.includes(code) ? prev.filter((p) => p !== code) : [...prev, code],
    );
  };

  const selectAllPackages = () => {
    setAppliedPackages(SERVICE_PACKAGES.map((p) => p.code));
  };

  const activeDays = Object.entries(days).filter(([, v]) => v.active);

  const validate = (): Record<string, string> => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Tên lớp bắt buộc";
    if (name.trim().length > 100) next.name = "Tối đa 100 ký tự";
    const dur = parseInt(duration, 10);
    if (isNaN(dur) || dur < 5 || dur > 240) next.duration = "5 – 240 phút";
    const cap = parseInt(capacity, 10);
    if (isNaN(cap) || cap < 1 || cap > 100) next.capacity = "1 – 100 người";
    if (!startDate) next.startDate = "Bắt buộc";
    if (endDate && parseIsoDate(endDate) < parseIsoDate(startDate)) {
      next.endDate = "Phải ≥ ngày bắt đầu";
    }
    if (activeDays.length === 0) next.days = "Tick ít nhất 1 ngày";
    if (mode === "edit") {
      activeDays.forEach(([d, v]) => {
        if (minutesBetween(v.startTime, v.endTime) <= 0) {
          next[`day-${d}`] = "Giờ kết thúc > giờ bắt đầu";
        }
      });
    }
    return next;
  };

  const handleSave = () => {
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    const id = editingClass?.id ?? `CL-${String(100 + Math.floor(Math.random() * 900))}`;
    const dur = parseInt(duration, 10);
    const schedule: DaySchedule[] = activeDays.map(([d, v]) => ({
      day: parseInt(d, 10),
      startTime: v.startTime,
      endTime: mode === "edit" ? v.endTime : addMinutes(v.startTime, dur),
    }));
    const cls: GolfClass = {
      id,
      name: name.trim(),
      classTypeId,
      coachId,
      durationMinutes: dur,
      capacity: parseInt(capacity, 10),
      startDate: formatVn(parseIsoDate(startDate)),
      endDate: endDate ? formatVn(parseIsoDate(endDate)) : undefined,
      room,
      description: description.trim() || undefined,
      schedule,
      appliedPackages,
      branch,
      createdAt: editingClass?.createdAt ?? TODAY,
    };
    onSave(cls);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modalContent} ${styles.classesFormModal}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.classesFormHeader}>
          <div>
            <h3>{mode === "create" ? "Thêm lớp mới" : "Chỉnh sửa lớp"}</h3>
            <p>Khai báo thông tin lớp học và lịch học hàng tuần</p>
          </div>
          <button className={styles.modalClose} onClick={onClose} type="button"><X size={18} /></button>
        </header>

        <div className={styles.classesFormBody}>
          <section className={styles.classesFormSection}>
            <h4>Thông tin cơ bản</h4>
            <div className={styles.classesFormGrid}>
              <label className={styles.classesField}>
                <span>Tên lớp <b>*</b></span>
                <input
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Golf Swing Cơ Bản"
                  type="text"
                  value={name}
                />
                {errors.name ? <small className={styles.classesFieldError}>{errors.name}</small> : null}
              </label>

              <label className={styles.classesField}>
                <span>Loại lớp <b>*</b></span>
                <div className={styles.classesSelectWrap}>
                  <select onChange={(e) => setClassTypeId(e.target.value)} value={classTypeId}>
                    {classTypes.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <button onClick={onAddType} type="button">+ Thêm loại</button>
                </div>
              </label>

              <label className={styles.classesField}>
                <span>Giáo viên <b>*</b></span>
                <select onChange={(e) => setCoachId(e.target.value)} value={coachId}>
                  {COACHES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} — {c.specialty}</option>
                  ))}
                </select>
              </label>

              <label className={styles.classesField}>
                <span>Chi nhánh</span>
                <select onChange={(e) => setBranch(e.target.value)} value={branch}>
                  {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </label>

              <label className={styles.classesField}>
                <span>Thời lượng (phút) <b>*</b></span>
                <input
                  max={240}
                  min={5}
                  onChange={(e) => setDuration(e.target.value)}
                  type="number"
                  value={duration}
                />
                {errors.duration ? <small className={styles.classesFieldError}>{errors.duration}</small> : null}
              </label>

              <label className={styles.classesField}>
                <span>Sức chứa <b>*</b></span>
                <input
                  max={100}
                  min={1}
                  onChange={(e) => setCapacity(e.target.value)}
                  type="number"
                  value={capacity}
                />
                {errors.capacity ? <small className={styles.classesFieldError}>{errors.capacity}</small> : null}
              </label>

              <label className={styles.classesField}>
                <span>Ngày bắt đầu <b>*</b></span>
                <input onChange={(e) => setStartDate(e.target.value)} type="date" value={startDate} />
                {errors.startDate ? <small className={styles.classesFieldError}>{errors.startDate}</small> : null}
              </label>

              <label className={styles.classesField}>
                <span>Ngày kết thúc</span>
                <input onChange={(e) => setEndDate(e.target.value)} type="date" value={endDate} />
                {errors.endDate ? <small className={styles.classesFieldError}>{errors.endDate}</small> : null}
              </label>

              <label className={styles.classesField}>
                <span>Phòng học</span>
                <select onChange={(e) => setRoom(e.target.value)} value={room}>
                  {ROOM_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>

              <label className={`${styles.classesField} ${styles.classesFieldFull}`}>
                <span>Mô tả</span>
                <textarea
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả ngắn về nội dung lớp..."
                  rows={2}
                  value={description}
                />
              </label>
            </div>
          </section>

          <section className={`${styles.classesFormSection} ${styles.classesScheduleSection}`}>
            <header>
              <h4>Lịch học trong tuần <b>*</b></h4>
              {mode === "edit" ? (
                <span>Đã thiết lập lịch cho {activeDays.length} ngày</span>
              ) : (
                <span>Tick ngày sẽ có lớp học. Giờ học = {duration} phút từ giờ bắt đầu.</span>
              )}
            </header>
            <div className={styles.classesScheduleGrid}>
              {DAY_FULL_VN.map((dayName, idx) => {
                const cfg = days[idx];
                return (
                  <div className={`${styles.classesScheduleRow} ${cfg.active ? styles.classesScheduleRowActive : ""}`} key={dayName}>
                    <label className={styles.classesScheduleCheck}>
                      <input checked={cfg.active} onChange={() => toggleDay(idx)} type="checkbox" />
                      <span>{dayName}</span>
                    </label>
                    <div className={styles.classesScheduleTimes}>
                      <label>
                        <span>Giờ vào</span>
                        <input
                          disabled={!cfg.active}
                          onChange={(e) => setDayTime(idx, "startTime", e.target.value)}
                          type="time"
                          value={cfg.startTime}
                        />
                      </label>
                      <label>
                        <span>Giờ ra</span>
                        <input
                          disabled={!cfg.active || mode === "create"}
                          onChange={(e) => setDayTime(idx, "endTime", e.target.value)}
                          type="time"
                          value={mode === "create" ? addMinutes(cfg.startTime, parseInt(duration, 10) || 60) : cfg.endTime}
                        />
                      </label>
                    </div>
                    {errors[`day-${idx}`] ? (
                      <small className={styles.classesFieldError}>{errors[`day-${idx}`]}</small>
                    ) : null}
                  </div>
                );
              })}
            </div>
            {errors.days ? <small className={styles.classesFieldError}>{errors.days}</small> : null}
          </section>

          <section className={`${styles.classesFormSection} ${styles.classesPackagesSection}`}>
            <header>
              <h4>Gói dịch vụ áp dụng</h4>
              <span>HV phải có gói trong danh sách này mới được book lớp</span>
            </header>
            <div className={styles.classesPackagesBar}>
              <div className={styles.classesSearchInline}>
                <Search size={14} />
                <input
                  onChange={(e) => setPackageQuery(e.target.value)}
                  placeholder="Tìm gói..."
                  type="text"
                  value={packageQuery}
                />
              </div>
              <button
                className={styles.classesSelectAllBtn}
                onClick={selectAllPackages}
                type="button"
              >
                Chọn tất cả
              </button>
            </div>
            <div className={styles.classesPackageGrid}>
              {filteredPackages.map((p) => {
                const checked = appliedPackages.includes(p.code);
                return (
                  <label className={`${styles.classesPackageCard} ${checked ? styles.classesPackageCardActive : ""}`} key={p.code}>
                    <input checked={checked} onChange={() => togglePackage(p.code)} type="checkbox" />
                    <div>
                      <strong>{p.name}</strong>
                      <span>{p.description}</span>
                    </div>
                    {checked ? <CheckCircle2 size={16} /> : null}
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        <footer className={styles.classesFormFooter}>
          <button className={styles.classesBtnCancel} onClick={onClose} type="button">Hủy bỏ</button>
          <button className={styles.classesBtnSave} onClick={handleSave} type="button">
            {mode === "create" ? "+ Thêm lớp" : "Cập nhật"}
          </button>
        </footer>
      </div>
    </div>
  );
}

// =====================================================================================
// SECTION H — Add Class Type Modal
// =====================================================================================

function AddTypeModal({
  existingNames,
  onClose,
  onSave,
}: {
  existingNames: string[];
  onClose: () => void;
  onSave: (t: ClassType) => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(COLOR_PRESETS[0].value);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Tên loại lớp bắt buộc");
      return;
    }
    if (existingNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      setError("Tên loại lớp đã tồn tại");
      return;
    }
    onSave({
      id: `CT-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      name: trimmed,
      color,
      createdAt: TODAY,
    });
  };

  return (
    <div className={styles.nestedOverlay} onClick={onClose}>
      <div className={styles.classesAddTypeModal} onClick={(e) => e.stopPropagation()}>
        <header>
          <h3>Thêm loại lớp mới</h3>
          <button className={styles.modalClose} onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <div className={styles.classesAddTypeBody}>
          <label className={styles.classesField}>
            <span>Tên loại lớp <b>*</b></span>
            <input
              autoFocus
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="VD: Short Game, Course Management"
              type="text"
              value={name}
            />
            {error ? <small className={styles.classesFieldError}>{error}</small> : null}
          </label>
          <div className={styles.classesColorPicker}>
            <span>Màu sắc</span>
            <div className={styles.classesColorGrid}>
              {COLOR_PRESETS.map((c) => (
                <button
                  className={`${styles.classesColorChip} ${color === c.value ? styles.classesColorChipActive : ""}`}
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  style={{ background: c.value }}
                  title={c.label}
                  type="button"
                >
                  {color === c.value ? <CheckCircle2 size={14} /> : null}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.classesPreviewBadge}>
            <span>Xem trước:</span>
            <span style={{ background: `${color}1a`, color, borderColor: color }}>
              {name.trim() || "Tên loại lớp"}
            </span>
          </div>
        </div>
        <footer>
          <button className={styles.classesBtnCancel} onClick={onClose} type="button">Hủy bỏ</button>
          <button className={styles.classesBtnSave} onClick={handleSave} type="button">Thêm loại</button>
        </footer>
      </div>
    </div>
  );
}

// =====================================================================================
// SECTION I — Class Detail Modal
// =====================================================================================

function ClassDetailModal({
  cls,
  classType,
  coachName,
  enrolledCount,
  onBook,
  onClose,
  onDelete,
  onEdit,
  onShowStudents,
}: {
  cls: GolfClass;
  classType?: ClassType;
  coachName: string;
  enrolledCount: number;
  onBook: () => void;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onShowStudents: () => void;
}) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modalContent} ${styles.classesDetailModal}`}
        onClick={(e) => e.stopPropagation()}
        style={{ borderTop: `4px solid ${classType?.color ?? "#7c3aed"}` }}
      >
        <header className={styles.classesDetailHeader}>
          <div>
            <span
              className={styles.classesBadge}
              style={{ background: classType ? `${classType.color}1a` : "#f3f4f6", color: classType?.color }}
            >
              {classType?.name ?? "—"}
            </span>
            <h3>{cls.name}</h3>
          </div>
          <button className={styles.modalClose} onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <div className={styles.classesDetailBody}>
          <dl className={styles.classesDetailGrid}>
            <div><dt>Giáo viên</dt><dd>{coachName}</dd></div>
            <div><dt>Thời lượng</dt><dd>{cls.durationMinutes} phút</dd></div>
            <div><dt>Sức chứa</dt><dd>{cls.capacity} người</dd></div>
            <div><dt>Lượt đăng ký</dt><dd>{enrolledCount}</dd></div>
            <div><dt>Phòng học</dt><dd>{cls.room}</dd></div>
            <div><dt>Chi nhánh</dt><dd>{cls.branch}</dd></div>
            <div><dt>Ngày bắt đầu</dt><dd>{cls.startDate}</dd></div>
            <div><dt>Ngày kết thúc</dt><dd>{cls.endDate ?? "Không giới hạn"}</dd></div>
          </dl>

          <section>
            <h4>Lịch học trong tuần</h4>
            <div className={styles.classesDetailDays}>
              {cls.schedule
                .slice()
                .sort((a, b) => a.day - b.day)
                .map((s) => (
                  <span className={styles.classesDetailDayChip} key={`${s.day}-${s.startTime}`}>
                    <strong>{DAY_FULL_VN[s.day]}</strong>
                    <span>{s.startTime} – {s.endTime}</span>
                  </span>
                ))}
            </div>
          </section>

          {cls.description ? (
            <section>
              <h4>Mô tả</h4>
              <p>{cls.description}</p>
            </section>
          ) : null}

          <section>
            <h4>Gói dịch vụ áp dụng</h4>
            <div className={styles.classesDetailPackages}>
              {cls.appliedPackages.length === 0 ? (
                <span className={styles.classesEmpty}>Chưa cấu hình gói áp dụng</span>
              ) : (
                cls.appliedPackages.map((code) => {
                  const pkg = SERVICE_PACKAGES.find((p) => p.code === code);
                  return (
                    <span className={styles.classesPackageChip} key={code}>
                      {pkg?.name ?? code} <small>{pkg?.description}</small>
                    </span>
                  );
                })
              )}
            </div>
          </section>
        </div>
        <footer className={styles.classesDetailFooter}>
          <button className={styles.classesBtnSecondary} onClick={onEdit} type="button">
            <Edit3 size={14} /> Chỉnh sửa
          </button>
          <button className={styles.classesBtnGreen} onClick={onBook} type="button">
            <CalendarDays size={14} /> Book lịch
          </button>
          <button className={styles.classesBtnPurple} onClick={onShowStudents} type="button">
            <Users size={14} /> Danh sách HV
          </button>
          <button className={styles.classesBtnDanger} onClick={onDelete} type="button">
            <Trash2 size={14} /> Xóa lớp
          </button>
          <button className={styles.classesBtnCancel} onClick={onClose} type="button">Đóng</button>
        </footer>
      </div>
    </div>
  );
}

// =====================================================================================
// SECTION J — Book Schedule Modal
// =====================================================================================

function BookScheduleModal({
  classes,
  classTypes,
  initialClassId,
  onClose,
  onConfirm,
  sessions,
  students,
}: {
  classes: GolfClass[];
  classTypes: ClassType[];
  initialClassId?: string;
  onClose: () => void;
  onConfirm: (sessionIds: string[], studentCodes: string[], note?: string) => void;
  sessions: ClassSession[];
  students: StudentLite[];
}) {
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(initialClassId ? [initialClassId] : []);
  const [selectedStudentCodes, setSelectedStudentCodes] = useState<string[]>([]);
  const [studentQuery, setStudentQuery] = useState("");
  const [classQuery, setClassQuery] = useState("");
  const [fromDate, setFromDate] = useState(formatIsoDate(parseVnDate(TODAY)));
  const [toDate, setToDate] = useState(() => {
    const d = parseVnDate(TODAY);
    d.setDate(d.getDate() + 28);
    return formatIsoDate(d);
  });
  const [note, setNote] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredClasses = useMemo(() => {
    const q = classQuery.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter((c) => c.name.toLowerCase().includes(q));
  }, [classes, classQuery]);

  const filteredStudents = useMemo(() => {
    const q = studentQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.phone.includes(q),
    );
  }, [students, studentQuery]);

  const matchingSessions = useMemo(() => {
    if (selectedClassIds.length === 0) return [];
    if (!fromDate || !toDate) return [];
    const from = parseIsoDate(fromDate);
    const to = parseIsoDate(toDate);
    if (from > to) return [];
    return sessions
      .filter((s) => {
        if (!selectedClassIds.includes(s.classId)) return false;
        const d = parseVnDate(s.date);
        return d >= from && d <= to;
      })
      .sort((a, b) => parseVnDate(a.date).getTime() - parseVnDate(b.date).getTime());
  }, [selectedClassIds, sessions, fromDate, toDate]);

  const sessionsByClass = useMemo(() => {
    const map = new Map<string, ClassSession[]>();
    matchingSessions.forEach((s) => {
      const arr = map.get(s.classId) ?? [];
      arr.push(s);
      map.set(s.classId, arr);
    });
    return map;
  }, [matchingSessions]);

  const toggleClass = (id: string) => {
    setSelectedClassIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const toggleStudent = (code: string) => {
    setSelectedStudentCodes((prev) =>
      prev.includes(code) ? prev.filter((s) => s !== code) : [...prev, code],
    );
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (selectedClassIds.length === 0) next.classes = "Chọn ít nhất 1 lớp";
    if (selectedStudentCodes.length === 0) next.students = "Chọn ít nhất 1 học viên";
    if (!fromDate || !toDate) next.dateRange = "Bắt buộc";
    if (parseIsoDate(toDate) < parseIsoDate(fromDate)) next.dateRange = "Đến ngày phải ≥ Từ ngày";
    if (matchingSessions.length === 0) next.sessions = "Không có buổi nào trong khoảng đã chọn";

    // Conflict checks per student per class — gói dịch vụ có hợp lệ không
    selectedClassIds.forEach((classId) => {
      const cls = classes.find((c) => c.id === classId);
      if (!cls) return;
      selectedStudentCodes.forEach((code) => {
        const stu = students.find((s) => s.code === code);
        if (!stu) return;
        if (cls.appliedPackages.length > 0 && !cls.appliedPackages.includes(stu.packageCode)) {
          next[`pkg-${classId}-${code}`] = `${stu.name}: gói không khớp với ${cls.name}`;
        }
      });
    });
    return next;
  };

  const handleConfirm = () => {
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onConfirm(matchingSessions.map((s) => s.id), selectedStudentCodes, note.trim() || undefined);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modalContent} ${styles.classesBookModal}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.classesFormHeader}>
          <div>
            <h3>Thêm mới lịch</h3>
            <p>Book lịch lớp cho học viên trong khoảng thời gian — tự động tính số buổi</p>
          </div>
          <button className={styles.modalClose} onClick={onClose} type="button"><X size={18} /></button>
        </header>

        <div className={styles.classesBookBody}>
          <section className={styles.classesFormSection}>
            <h4>Lớp học</h4>
            <div className={styles.classesSearchInline}>
              <Search size={14} />
              <input
                onChange={(e) => setClassQuery(e.target.value)}
                placeholder="Tìm lớp theo tên..."
                type="text"
                value={classQuery}
              />
            </div>
            <div className={styles.classesBookClassList}>
              {filteredClasses.map((c) => {
                const ct = classTypes.find((t) => t.id === c.classTypeId);
                const checked = selectedClassIds.includes(c.id);
                return (
                  <label className={`${styles.classesBookClassItem} ${checked ? styles.classesBookClassItemActive : ""}`} key={c.id}>
                    <input checked={checked} onChange={() => toggleClass(c.id)} type="checkbox" />
                    <div>
                      <strong>{c.name}</strong>
                      <span style={{ color: ct?.color }}>{ct?.name}</span>
                      <small>
                        {c.schedule.map((s) => `${DAYS_VN[s.day]} ${s.startTime}`).join(" · ")} · {c.durationMinutes}p
                      </small>
                    </div>
                  </label>
                );
              })}
            </div>
            {errors.classes ? <small className={styles.classesFieldError}>{errors.classes}</small> : null}
            {selectedClassIds.length > 0 ? (
              <div className={styles.classesBookSelectedChips}>
                {selectedClassIds.map((id) => {
                  const c = classes.find((cl) => cl.id === id);
                  if (!c) return null;
                  return (
                    <span className={styles.classesPackageChip} key={id}>
                      {c.name}
                      <button onClick={() => toggleClass(id)} type="button"><X size={12} /></button>
                    </span>
                  );
                })}
              </div>
            ) : null}
          </section>

          <section className={styles.classesFormSection}>
            <h4>Học viên</h4>
            <div className={styles.classesSearchInline}>
              <Search size={14} />
              <input
                onChange={(e) => setStudentQuery(e.target.value)}
                placeholder="Tìm theo mã / tên / SĐT..."
                type="text"
                value={studentQuery}
              />
            </div>
            <div className={styles.classesBookStudentList}>
              {filteredStudents.map((s) => {
                const checked = selectedStudentCodes.includes(s.code);
                const pkg = SERVICE_PACKAGES.find((p) => p.code === s.packageCode);
                return (
                  <label className={`${styles.classesBookStudentItem} ${checked ? styles.classesBookStudentItemActive : ""}`} key={s.code}>
                    <input checked={checked} onChange={() => toggleStudent(s.code)} type="checkbox" />
                    <div>
                      <strong>{s.name}</strong>
                      <span>{s.code} · {s.phone}</span>
                      <small>Gói: {pkg?.name ?? s.packageCode}</small>
                    </div>
                  </label>
                );
              })}
            </div>
            {errors.students ? <small className={styles.classesFieldError}>{errors.students}</small> : null}
          </section>

          <section className={styles.classesFormSection}>
            <h4>Khoảng thời gian</h4>
            <div className={styles.classesFormGrid}>
              <label className={styles.classesField}>
                <span>Từ ngày <b>*</b></span>
                <input onChange={(e) => setFromDate(e.target.value)} type="date" value={fromDate} />
              </label>
              <label className={styles.classesField}>
                <span>Đến ngày <b>*</b></span>
                <input onChange={(e) => setToDate(e.target.value)} type="date" value={toDate} />
              </label>
              <label className={`${styles.classesField} ${styles.classesFieldFull}`}>
                <span>Ghi chú nội bộ</span>
                <textarea onChange={(e) => setNote(e.target.value)} rows={2} value={note} />
              </label>
            </div>
            {errors.dateRange ? <small className={styles.classesFieldError}>{errors.dateRange}</small> : null}
          </section>

          <section className={styles.classesFormSection}>
            <header>
              <h4>Kết quả tính toán</h4>
              <label className={styles.classesPreviewToggle}>
                <input checked={showPreview} onChange={(e) => setShowPreview(e.target.checked)} type="checkbox" />
                Xem trước lịch
              </label>
            </header>
            <div className={styles.classesBookSummary}>
              <div>
                <span>Tổng số buổi</span>
                <strong>{matchingSessions.length}</strong>
              </div>
              <div>
                <span>Số lớp</span>
                <strong>{selectedClassIds.length}</strong>
              </div>
              <div>
                <span>Số HV</span>
                <strong>{selectedStudentCodes.length}</strong>
              </div>
              <div>
                <span>Tổng lượt book</span>
                <strong>{matchingSessions.length * selectedStudentCodes.length}</strong>
              </div>
            </div>
            {errors.sessions ? <small className={styles.classesFieldError}>{errors.sessions}</small> : null}
            {Object.entries(errors)
              .filter(([k]) => k.startsWith("pkg-"))
              .map(([k, v]) => (
                <small className={styles.classesFieldError} key={k}>⚠ {v}</small>
              ))}
            {showPreview && matchingSessions.length > 0 ? (
              <div className={styles.classesBookPreview}>
                {Array.from(sessionsByClass.entries()).map(([classId, list]) => {
                  const cls = classes.find((c) => c.id === classId);
                  return (
                    <div className={styles.classesBookPreviewBlock} key={classId}>
                      <h5>{cls?.name ?? classId} <small>({list.length} buổi)</small></h5>
                      <table className={styles.classesBookPreviewTable}>
                        <thead>
                          <tr>
                            <th>Buổi</th>
                            <th>Ngày</th>
                            <th>Thứ</th>
                            <th>Giờ</th>
                            <th>Sức chứa</th>
                          </tr>
                        </thead>
                        <tbody>
                          {list.map((s, i) => {
                            const remaining = (cls?.capacity ?? 0) - s.enrolled.length;
                            const conflict = remaining < selectedStudentCodes.length;
                            return (
                              <tr className={conflict ? styles.classesBookPreviewRowWarn : ""} key={s.id}>
                                <td>Buổi {i + 1}</td>
                                <td>{s.date}</td>
                                <td>{DAY_FULL_VN[s.dayOfWeek]}</td>
                                <td>{s.startTime} – {s.endTime}</td>
                                <td>
                                  {s.enrolled.length}/{cls?.capacity ?? 0}
                                  {conflict ? <span className={styles.classesBookConflict}> · không đủ chỗ</span> : null}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </section>
        </div>

        <footer className={styles.classesFormFooter}>
          <button className={styles.classesBtnCancel} onClick={onClose} type="button">Đóng</button>
          <button className={styles.classesBtnSave} onClick={handleConfirm} type="button">
            <CheckCircle2 size={14} /> Thêm mới
          </button>
        </footer>
      </div>
    </div>
  );
}

// =====================================================================================
// SECTION K — Session Popup (calendar click)
// =====================================================================================

function SessionPopup({
  classData,
  classType,
  coachName,
  onBook,
  onClose,
  onDelete,
  onEdit,
  onShowStudents,
  session,
}: {
  classData: GolfClass;
  classType?: ClassType;
  coachName: string;
  onBook: () => void;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onShowStudents: () => void;
  session: ClassSession;
}) {
  const remaining = classData.capacity - session.enrolled.length;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modalContent} ${styles.classesSessionPopup}`}
        onClick={(e) => e.stopPropagation()}
        style={{ borderTop: `4px solid ${classType?.color ?? "#7c3aed"}` }}
      >
        <header className={styles.classesDetailHeader}>
          <div>
            <span
              className={styles.classesBadge}
              style={{ background: classType ? `${classType.color}1a` : "#f3f4f6", color: classType?.color }}
            >
              {classType?.name ?? "—"}
            </span>
            <h3>{classData.name}</h3>
            <small>{DAY_FULL_VN[session.dayOfWeek]} · {session.date}</small>
          </div>
          <button className={styles.modalClose} onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <div className={styles.classesDetailBody}>
          <dl className={styles.classesDetailGrid}>
            <div><dt>Giáo viên</dt><dd>{coachName}</dd></div>
            <div><dt>Thời gian</dt><dd>{session.startTime} – {session.endTime} ({minutesBetween(session.startTime, session.endTime)} phút)</dd></div>
            <div>
              <dt>Sức chứa</dt>
              <dd>
                {session.enrolled.length}/{classData.capacity}
                {remaining > 0 ? <small> · còn {remaining} chỗ</small> : <small className={styles.classesFieldError}> · đã đầy</small>}
              </dd>
            </div>
            <div><dt>Phòng học</dt><dd>{classData.room}</dd></div>
          </dl>
        </div>
        <footer className={styles.classesDetailFooter}>
          <button className={styles.classesBtnSecondary} onClick={onEdit} type="button">
            <Edit3 size={14} /> Chỉnh sửa
          </button>
          <button className={styles.classesBtnGreen} onClick={onBook} type="button">
            <CalendarDays size={14} /> Book lịch
          </button>
          <button className={styles.classesBtnPurple} onClick={onShowStudents} type="button">
            <Users size={14} /> Danh sách HV
          </button>
          <button className={styles.classesBtnDanger} onClick={onDelete} type="button">
            <Trash2 size={14} /> Xóa lớp
          </button>
          <button className={styles.classesBtnCancel} onClick={onClose} type="button">Đóng</button>
        </footer>
      </div>
    </div>
  );
}

// =====================================================================================
// SECTION L — Edit Single Session Modal
// =====================================================================================

function EditSessionModal({
  classData,
  coachName,
  onClose,
  onSave,
  session,
}: {
  classData: GolfClass;
  coachName: string;
  onClose: () => void;
  onSave: (patch: { startTime: string; endTime: string }) => void;
  session: ClassSession;
}) {
  const [startTime, setStartTime] = useState(session.startTime);
  const [endTime, setEndTime] = useState(session.endTime);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (minutesBetween(startTime, endTime) <= 0) {
      setError("Giờ kết thúc phải sau giờ bắt đầu");
      return;
    }
    onSave({ startTime, endTime });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modalContent} ${styles.classesEditSessionModal}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.classesFormHeader}>
          <div>
            <h3>Chỉnh sửa buổi học</h3>
            <p>Thay đổi chỉ áp dụng cho buổi {session.date} · không ảnh hưởng lịch lặp</p>
          </div>
          <button className={styles.modalClose} onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <div className={styles.classesFormBody}>
          <div className={styles.classesFormGrid}>
            <label className={styles.classesField}>
              <span>Tên lớp</span>
              <input readOnly value={classData.name} />
            </label>
            <label className={styles.classesField}>
              <span>Giáo viên</span>
              <input readOnly value={coachName} />
            </label>
            <label className={styles.classesField}>
              <span>Thời gian bắt đầu <b>*</b></span>
              <input onChange={(e) => setStartTime(e.target.value)} type="time" value={startTime} />
            </label>
            <label className={styles.classesField}>
              <span>Thời gian kết thúc <b>*</b></span>
              <input onChange={(e) => setEndTime(e.target.value)} type="time" value={endTime} />
            </label>
            <label className={styles.classesField}>
              <span>Sức chứa</span>
              <input readOnly value={`${session.enrolled.length}/${classData.capacity}`} />
            </label>
            <label className={styles.classesField}>
              <span>Phòng học</span>
              <input readOnly value={classData.room} />
            </label>
          </div>
          {error ? <small className={styles.classesFieldError}>{error}</small> : null}
        </div>
        <footer className={styles.classesFormFooter}>
          <button className={styles.classesBtnCancel} onClick={onClose} type="button">Hủy</button>
          <button className={styles.classesBtnSave} onClick={handleSave} type="button">Lưu thay đổi</button>
        </footer>
      </div>
    </div>
  );
}

// =====================================================================================
// SECTION M — Student List Popup
// =====================================================================================

function StudentListPopup({
  classData,
  coachName,
  onClose,
  session,
  students,
}: {
  classData: GolfClass;
  coachName: string;
  onClose: () => void;
  session: ClassSession;
  students: StudentLite[];
}) {
  const enrolled = session.enrolled.map((e, idx) => {
    const stu = students.find((s) => s.code === e.studentCode);
    return { stt: idx + 1, ...e, name: stu?.name ?? "—", phone: stu?.phone ?? "—" };
  });
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modalContent} ${styles.classesStudentListModal}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.classesFormHeader}>
          <div>
            <h3>Danh sách HV đăng ký</h3>
            <p>{classData.name} · {session.date} · {session.startTime} – {session.endTime} · GV: {coachName}</p>
          </div>
          <span className={styles.classesEnrolledTag}>
            <Users size={14} /> {session.enrolled.length}/{classData.capacity} HV
          </span>
          <button className={styles.modalClose} onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <div className={styles.classesStudentListBody}>
          {enrolled.length === 0 ? (
            <div className={styles.classesEmpty}>Chưa có HV nào đăng ký buổi này</div>
          ) : (
            <table className={styles.classesStudentTable}>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên HV</th>
                  <th>Mã HV</th>
                  <th>SĐT</th>
                  <th>Đăng ký lúc</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {enrolled.map((e) => (
                  <tr key={e.studentCode}>
                    <td>{e.stt}</td>
                    <td>{e.name}</td>
                    <td><span className={styles.classesStudentCode}>{e.studentCode}</span></td>
                    <td><Phone size={12} /> {e.phone}</td>
                    <td>{e.bookedAt}</td>
                    <td>{e.note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <footer className={styles.classesFormFooter}>
          <button className={styles.classesBtnCancel} onClick={onClose} type="button">Đóng</button>
        </footer>
      </div>
    </div>
  );
}

// =====================================================================================
// SECTION N — Delete Class Dialog
// =====================================================================================

function DeleteClassDialog({
  cls,
  coachName,
  enrolledCount,
  onCancel,
  onConfirm,
}: {
  cls: GolfClass;
  coachName: string;
  enrolledCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div
        className={`${styles.modalContent} ${styles.classesDeleteModal}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.classesDeleteHeader}>
          <span className={styles.classesDeleteIcon}><AlertTriangle size={22} /></span>
          <div>
            <h3>Xác nhận xóa lớp</h3>
            <p>Thao tác này không thể hoàn tác</p>
          </div>
        </header>
        <div className={styles.classesDeleteBody}>
          <p>
            Bạn có chắc chắn xóa lớp <strong>&quot;{cls.name}&quot;</strong> không?
          </p>
          <dl className={styles.classesDeleteInfo}>
            <div><dt>Giáo viên</dt><dd>{coachName}</dd></div>
            <div><dt>Thời lượng</dt><dd>{cls.durationMinutes} phút</dd></div>
            <div><dt>Sức chứa</dt><dd>{cls.capacity} người</dd></div>
            <div><dt>Lượt đăng ký</dt><dd>{enrolledCount}</dd></div>
          </dl>
          {enrolledCount > 0 ? (
            <div className={styles.classesDeleteWarn}>
              <AlertTriangle size={14} />
              <span>Lớp có {enrolledCount} lượt HV đang đăng ký. Tiếp tục sẽ hủy tất cả booking liên quan.</span>
            </div>
          ) : null}
        </div>
        <footer className={styles.classesFormFooter}>
          <button className={styles.classesBtnCancel} onClick={onCancel} type="button">Hủy bỏ</button>
          <button className={styles.classesBtnDanger} onClick={onConfirm} type="button">
            <Trash2 size={14} /> Xóa lớp
          </button>
        </footer>
      </div>
    </div>
  );
}

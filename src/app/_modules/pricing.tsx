"use client";

import { useState, type FormEvent } from "react";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  Download,
  Edit,
  Filter,
  MapPin,
  Pencil,
  Plus,
  Power,
  Search,
  Settings,
  Ticket,
  Timer,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import styles from "../page.module.css";
import { FormField, Screen, SelectField } from "../_shared/components";

type ZoneType = "Driving Range" | "Putting Green" | "Bay Indoor" | "Sân 9 lỗ" | "Sân 18 lỗ";

type Zone = {
  code: string;
  name: string;
  zoneType: ZoneType;
  branch: string;
  area: string;
  capacity: number;
  checkinMode: "Kiểm soát cửa" | "Quay lễ tân" | "Cả hai";
  devices: string[];
  services: string[];
  status: "Hoạt động" | "Tạm ngưng";
};

const BRANCHES = ["NextVision", "Hà Nội Center", "Sài Gòn West"];

const ALL_DEVICES = [
  "FaceID-Cong01",
  "FaceID-Cong02",
  "FaceID-CongVIP",
  "Bay-Reader-1",
  "Bay-Reader-2",
  "Bay-Reader-3",
  "Cong-San9-Main",
  "Cong-San18-East",
  "Cong-San18-West",
  "RFID-Reception",
];

const ALL_SERVICES = [
  "Driving Range Practice",
  "Putting Practice",
  "Indoor Simulator",
  "Teetime 9 Hố",
  "Teetime 18 Hố",
  "Lesson 1-1",
  "Lesson Group",
  "Tournament",
  "Caddie Service",
  "Equipment Rental",
];

type TimeSlot = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  duration: string;
  days: string[]; // ["T2","T3","T4","T5","T6"] etc
  branches: string;
  zones: string[]; // zone codes
  color: string;
  status: "Hoạt động" | "Tạm ngưng";
};

const DAY_PILLS: Array<{ id: string; label: string; full: string }> = [
  { id: "T2", label: "T2", full: "Thứ 2" },
  { id: "T3", label: "T3", full: "Thứ 3" },
  { id: "T4", label: "T4", full: "Thứ 4" },
  { id: "T5", label: "T5", full: "Thứ 5" },
  { id: "T6", label: "T6", full: "Thứ 6" },
  { id: "T7", label: "T7", full: "Thứ 7" },
  { id: "CN", label: "CN", full: "Chủ nhật" },
];

function formatDays(days: string[]): string {
  if (days.length === 7) return "Tất cả ngày";
  if (days.length === 5 && ["T2", "T3", "T4", "T5", "T6"].every((d) => days.includes(d))) return "Thứ 2 - Thứ 6";
  if (days.length === 2 && days.includes("T7") && days.includes("CN")) return "Thứ 7 - Chủ nhật";
  return days.map((d) => DAY_PILLS.find((p) => p.id === d)?.full ?? d).join(", ");
}

type ContractPackage = {
  code: string;
  name: string;
  desc: string;
  serviceType: string;
  branch: string;
  sessions: string;
  duration: string;
  price: string;
  status: "Hoạt động" | "Tạm ngưng";
  usage: number;
};

type SingleTicket = {
  code: string;
  name: string;
  desc: string;
  serviceType: "Teetime" | "Practice" | "Dịch vụ khác";
  durationHours: string;
  status: "Hoạt động" | "Tạm ngưng";
  prices: { weekday: string; weekend: string; holiday: string; peak: string };
  pillTimes: string[];
  effective: string;
};

const INITIAL_ZONES: Zone[] = [
  { code: "ZONE-DR-01", name: "Khu Driving Range chính", zoneType: "Driving Range", branch: "NextVision", area: "1.200 m²", capacity: 50, checkinMode: "Cả hai", devices: ["FaceID-Cong01"], services: ["Driving Range Practice", "Lesson 1-1"], status: "Hoạt động" },
  { code: "ZONE-PG-01", name: "Putting Green A", zoneType: "Putting Green", branch: "NextVision", area: "250 m²", capacity: 12, checkinMode: "Quay lễ tân", devices: [], services: ["Putting Practice"], status: "Hoạt động" },
  { code: "ZONE-BI-01", name: "Bay Indoor 1", zoneType: "Bay Indoor", branch: "NextVision", area: "80 m²", capacity: 4, checkinMode: "Kiểm soát cửa", devices: ["Bay-Reader-1"], services: ["Indoor Simulator", "Lesson 1-1"], status: "Hoạt động" },
  { code: "ZONE-S9-01", name: "Sân 9 lỗ A", zoneType: "Sân 9 lỗ", branch: "NextVision", area: "18.000 m²", capacity: 36, checkinMode: "Cả hai", devices: ["Cong-San9-Main"], services: ["Teetime 9 Hố", "Caddie Service"], status: "Hoạt động" },
  { code: "ZONE-PG-02", name: "Putting Green B (đang nâng cấp)", zoneType: "Putting Green", branch: "NextVision", area: "200 m²", capacity: 10, checkinMode: "Quay lễ tân", devices: [], services: ["Putting Practice"], status: "Tạm ngưng" },
  { code: "ZONE-DR-02", name: "Driving Range Hà Nội", zoneType: "Driving Range", branch: "Hà Nội Center", area: "950 m²", capacity: 40, checkinMode: "Kiểm soát cửa", devices: ["FaceID-Cong02"], services: ["Driving Range Practice"], status: "Hoạt động" },
  { code: "ZONE-S18-01", name: "Sân 18 lỗ Sài Gòn", zoneType: "Sân 18 lỗ", branch: "Sài Gòn West", area: "65.000 m²", capacity: 72, checkinMode: "Cả hai", devices: ["Cong-San18-East", "Cong-San18-West"], services: ["Teetime 18 Hố", "Tournament", "Caddie Service"], status: "Hoạt động" },
];

const INITIAL_TIMESLOTS: TimeSlot[] = [
  { id: "TS-01", name: "Sáng sớm ngày thường", startTime: "06:00", endTime: "09:00", duration: "3 giờ", days: ["T2", "T3", "T4", "T5", "T6"], branches: "NextVision", zones: ["ZONE-DR-01", "ZONE-PG-01"], color: "blue", status: "Hoạt động" },
  { id: "TS-02", name: "Buổi trưa", startTime: "11:00", endTime: "14:00", duration: "3 giờ", days: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"], branches: "NextVision", zones: ["ZONE-DR-01", "ZONE-BI-01"], color: "amber", status: "Hoạt động" },
  { id: "TS-03", name: "Giờ cao điểm chiều", startTime: "17:00", endTime: "20:00", duration: "3 giờ", days: ["T2", "T3", "T4", "T5", "T6"], branches: "NextVision", zones: ["ZONE-DR-01", "ZONE-S9-01"], color: "red", status: "Hoạt động" },
  { id: "TS-04", name: "Cuối tuần cả ngày", startTime: "06:00", endTime: "21:30", duration: "15 giờ 30 phút", days: ["T7", "CN"], branches: "NextVision", zones: ["ZONE-DR-01", "ZONE-PG-01", "ZONE-BI-01", "ZONE-S9-01"], color: "purple", status: "Hoạt động" },
  { id: "TS-05", name: "Tối khuya", startTime: "20:00", endTime: "23:00", duration: "3 giờ", days: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"], branches: "NextVision", zones: ["ZONE-BI-01"], color: "gray", status: "Tạm ngưng" },
];

const INITIAL_PACKAGES: ContractPackage[] = [
  { code: "P001", name: "Gói Cơ Bản Golf", desc: "Gói nhập môn, phù hợp người mới chơi", serviceType: "Member - Golf", branch: "NextVision", sessions: "8 buổi", duration: "1 tháng", price: "2.000.000 đ", status: "Hoạt động", usage: 5 },
  { code: "P002", name: "Gói Cao Cấp Golf", desc: "Gói VIP cho hội viên thâm niên", serviceType: "Member - Golf", branch: "NextVision", sessions: "24 buổi", duration: "3 tháng", price: "5.500.000 đ", status: "Hoạt động", usage: 12 },
  { code: "P003", name: "Gói Premium Practice", desc: "Driving range + putting green", serviceType: "Practice", branch: "NextVision", sessions: "30 buổi", duration: "6 tháng", price: "4.200.000 đ", status: "Hoạt động", usage: 8 },
  { code: "P004", name: "Gói Family Combo", desc: "Cho cả gia đình 4 người", serviceType: "Combo", branch: "NextVision", sessions: "50 buổi", duration: "12 tháng", price: "18.500.000 đ", status: "Hoạt động", usage: 3 },
  { code: "P005", name: "Gói Trial 7 ngày", desc: "Gói dùng thử cho khách mới", serviceType: "Trial", branch: "NextVision", sessions: "4 buổi", duration: "1 tuần", price: "800.000 đ", status: "Tạm ngưng", usage: 0 },
  { code: "P006", name: "Gói Linh Hoạt theo Buổi", desc: "Pay per use, không cam kết", serviceType: "Practice", branch: "NextVision", sessions: "Theo buổi", duration: "Không hạn", price: "250.000 đ/buổi", status: "Hoạt động", usage: 11 },
];

const INITIAL_TICKETS: SingleTicket[] = [
  { code: "T001", name: "Teetime 18 Holes - Standard", desc: "18 lỗ thông thường, mọi level", serviceType: "Teetime", durationHours: "4 giờ", status: "Hoạt động", prices: { weekday: "850.000 đ", weekend: "1.200.000 đ", holiday: "1.500.000 đ", peak: "1.600.000 đ" }, pillTimes: ["06-12h", "13-21h"], effective: "01/01/2026 - 31/12/2026" },
  { code: "T002", name: "Teetime 9 Holes Quick", desc: "9 lỗ buổi sáng tiết kiệm", serviceType: "Teetime", durationHours: "2 giờ", status: "Hoạt động", prices: { weekday: "450.000 đ", weekend: "650.000 đ", holiday: "800.000 đ", peak: "850.000 đ" }, pillTimes: ["06-10h"], effective: "01/01/2026 - 31/12/2026" },
  { code: "T003", name: "Practice 1h Standard", desc: "Driving range tính theo giờ", serviceType: "Practice", durationHours: "1 giờ", status: "Hoạt động", prices: { weekday: "120.000 đ", weekend: "180.000 đ", holiday: "220.000 đ", peak: "250.000 đ" }, pillTimes: ["06-22h"], effective: "01/01/2026 - 31/12/2026" },
  { code: "T004", name: "Practice 30p Quick", desc: "Tập nhanh 30 phút", serviceType: "Practice", durationHours: "0.5 giờ", status: "Hoạt động", prices: { weekday: "70.000 đ", weekend: "100.000 đ", holiday: "130.000 đ", peak: "150.000 đ" }, pillTimes: ["06-22h"], effective: "01/01/2026 - 31/12/2026" },
  { code: "T005", name: "Combo Caddie + Teetime", desc: "Đã bao gồm caddie", serviceType: "Teetime", durationHours: "4 giờ", status: "Hoạt động", prices: { weekday: "1.100.000 đ", weekend: "1.500.000 đ", holiday: "1.900.000 đ", peak: "2.000.000 đ" }, pillTimes: ["06-21h"], effective: "01/01/2026 - 31/12/2026" },
  { code: "T006", name: "Voucher Trial Day", desc: "1 ngày trial trọn gói", serviceType: "Practice", durationHours: "8 giờ", status: "Hoạt động", prices: { weekday: "350.000 đ", weekend: "500.000 đ", holiday: "600.000 đ", peak: "650.000 đ" }, pillTimes: ["08-18h"], effective: "01/01/2026 - 30/06/2026" },
  { code: "T007", name: "Combo Cha + Con", desc: "Family teetime 2 người", serviceType: "Teetime", durationHours: "3 giờ", status: "Hoạt động", prices: { weekday: "1.500.000 đ", weekend: "2.200.000 đ", holiday: "2.800.000 đ", peak: "3.000.000 đ" }, pillTimes: ["08-18h"], effective: "01/01/2026 - 31/12/2026" },
  { code: "T008", name: "Group of 4 Special", desc: "Đặt theo nhóm 4 người", serviceType: "Teetime", durationHours: "4 giờ", status: "Tạm ngưng", prices: { weekday: "3.000.000 đ", weekend: "4.400.000 đ", holiday: "5.500.000 đ", peak: "6.000.000 đ" }, pillTimes: ["06-15h"], effective: "01/01/2026 - 31/12/2026" },
];

type ActiveTab = "contract" | "single";

export default function PricingScreen() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("contract");
  const [zones, setZones] = useState<Zone[]>(INITIAL_ZONES);
  const [timeslots, setTimeslots] = useState<TimeSlot[]>(INITIAL_TIMESLOTS);
  const [packages, setPackages] = useState<ContractPackage[]>(INITIAL_PACKAGES);
  const [tickets, setTickets] = useState<SingleTicket[]>(INITIAL_TICKETS);

  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const [timeslotModalOpen, setTimeslotModalOpen] = useState(false);
  const [packageFormOpen, setPackageFormOpen] = useState(false);
  const [ticketFormOpen, setTicketFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ContractPackage | null>(null);
  const [editingTicket, setEditingTicket] = useState<SingleTicket | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ kind: "package" | "ticket"; code: string; name: string } | null>(null);
  const [toggleTarget, setToggleTarget] = useState<{ kind: "package" | "ticket"; code: string; name: string; status: "Hoạt động" | "Tạm ngưng"; usage: number } | null>(null);

  const [query, setQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("Tất cả");
  const [branchFilter, setBranchFilter] = useState("Tất cả");
  const [statusFilter, setStatusFilter] = useState("Tất cả");

  const filteredPackages = packages.filter((p) => {
    if (query && !`${p.code} ${p.name} ${p.serviceType}`.toLowerCase().includes(query.toLowerCase())) return false;
    if (serviceFilter !== "Tất cả" && p.serviceType !== serviceFilter) return false;
    if (branchFilter !== "Tất cả" && p.branch !== branchFilter) return false;
    if (statusFilter !== "Tất cả" && p.status !== statusFilter) return false;
    return true;
  });

  const filteredTickets = tickets.filter((t) => {
    if (query && !`${t.code} ${t.name} ${t.serviceType}`.toLowerCase().includes(query.toLowerCase())) return false;
    if (serviceFilter !== "Tất cả" && t.serviceType !== serviceFilter) return false;
    if (statusFilter !== "Tất cả" && t.status !== statusFilter) return false;
    return true;
  });

  const packageStats = {
    total: packages.length,
    active: packages.filter((p) => p.status === "Hoạt động").length,
    paused: packages.filter((p) => p.status === "Tạm ngưng").length,
    used: packages.reduce((s, p) => s + p.usage, 0),
  };

  const ticketStats = {
    total: tickets.length,
    active: tickets.filter((t) => t.status === "Hoạt động").length,
    paused: tickets.filter((t) => t.status === "Tạm ngưng").length,
    serviceTypes: new Set(tickets.map((t) => t.serviceType)).size,
  };

  const togglePackageStatus = (code: string) =>
    setPackages((current) =>
      current.map((p) =>
        p.code === code ? { ...p, status: p.status === "Hoạt động" ? "Tạm ngưng" : "Hoạt động" } : p
      )
    );

  const toggleTicketStatus = (code: string) =>
    setTickets((current) =>
      current.map((t) =>
        t.code === code ? { ...t, status: t.status === "Hoạt động" ? "Tạm ngưng" : "Hoạt động" } : t
      )
    );

  const handleDeletePackage = (code: string) => setPackages((c) => c.filter((p) => p.code !== code));
  const handleDeleteTicket = (code: string) => setTickets((c) => c.filter((t) => t.code !== code));

  const openCreatePackage = () => { setEditingPackage(null); setPackageFormOpen(true); };
  const openEditPackage = (pkg: ContractPackage) => { setEditingPackage(pkg); setPackageFormOpen(true); };
  const openCreateTicket = () => { setEditingTicket(null); setTicketFormOpen(true); };
  const openEditTicket = (ticket: SingleTicket) => { setEditingTicket(ticket); setTicketFormOpen(true); };

  const submitPackage = (pkg: ContractPackage) => {
    setPackages((current) => {
      const exists = current.find((p) => p.code === pkg.code);
      return exists ? current.map((p) => (p.code === pkg.code ? pkg : p)) : [pkg, ...current];
    });
    setPackageFormOpen(false);
    setEditingPackage(null);
  };

  const submitTicket = (ticket: SingleTicket) => {
    setTickets((current) => {
      const exists = current.find((t) => t.code === ticket.code);
      return exists ? current.map((t) => (t.code === ticket.code ? ticket : t)) : [ticket, ...current];
    });
    setTicketFormOpen(false);
    setEditingTicket(null);
  };

  const onPrimaryClick = activeTab === "contract" ? openCreatePackage : openCreateTicket;

  return (
    <>
      <Screen
        title="Bảng Giá"
        subtitle="Khu vực · Khung giờ · Bảng giá Hợp đồng · Bảng giá Vé lẻ"
      >
        <div className={styles.pricingHeaderActions}>
          <button className={styles.zoneManageBtn} onClick={() => setZoneModalOpen(true)} type="button">
            <MapPin size={16} /> Quản lý Khu vực
            <span>{zones.filter((z) => z.status === "Hoạt động").length}/{zones.length}</span>
          </button>
          <button className={styles.timeslotManageBtn} onClick={() => setTimeslotModalOpen(true)} type="button">
            <Timer size={16} /> Quản lý Khung giờ
            <span>{timeslots.filter((t) => t.status === "Hoạt động").length}/{timeslots.length}</span>
          </button>
          <span className={styles.pricingSpacer} />
          <button
            className={styles.pricingPrimaryBtn}
            onClick={onPrimaryClick}
            type="button"
          >
            <Plus size={16} /> Tạo Bảng Giá Mới
          </button>
        </div>

        {zones.filter((z) => z.status === "Hoạt động").length === 0 || timeslots.filter((t) => t.status === "Hoạt động").length === 0 ? (
          <div className={styles.pricingWarning}>
            <AlertTriangle />
            <span><strong>BR-M9-13:</strong> Cần có ≥1 Khu vực active + ≥1 Khung giờ active mới tạo được Bảng giá. Vui lòng setup trước.</span>
          </div>
        ) : null}

        <div className={styles.pricingTabs}>
          <button
            className={`${styles.pricingTab} ${activeTab === "contract" ? styles.pricingTabActive : ""}`}
            onClick={() => setActiveTab("contract")}
            type="button"
          >
            <Settings size={16} /> Bảng giá Hợp đồng
            <span>{packages.length}</span>
          </button>
          <button
            className={`${styles.pricingTab} ${activeTab === "single" ? styles.pricingTabActive : ""}`}
            onClick={() => setActiveTab("single")}
            type="button"
          >
            <Ticket size={16} /> Bảng giá Vé lẻ
            <span>{tickets.length}</span>
          </button>
        </div>

        <div className={styles.pricingKpi}>
          {activeTab === "contract" ? (
            <>
              <KpiCard label="Tổng Bảng Giá" value={String(packageStats.total)} tone="blue" />
              <KpiCard label="Đang Hoạt Động" value={String(packageStats.active)} tone="green" />
              <KpiCard label="Tạm Ngưng" value={String(packageStats.paused)} tone="amber" />
              <KpiCard label="Đã Sử Dụng" value={`${packageStats.used} HĐ`} tone="purple" />
            </>
          ) : (
            <>
              <KpiCard label="Tổng Bảng Giá" value={String(ticketStats.total)} tone="blue" />
              <KpiCard label="Đang Hoạt Động" value={String(ticketStats.active)} tone="green" />
              <KpiCard label="Tạm Ngưng" value={String(ticketStats.paused)} tone="amber" />
              <KpiCard label="Loại Dịch Vụ" value={String(ticketStats.serviceTypes)} tone="purple" />
            </>
          )}
        </div>

        <div className={styles.pricingToolbar}>
          <div className={styles.pricingSearch}>
            <Search size={18} />
            <input
              onChange={(e) => setQuery(e.target.value)}
              placeholder={activeTab === "contract" ? "Tìm kiếm theo mã, tên gói, loại DV..." : "Tìm kiếm theo mã, tên vé..."}
              value={query}
            />
          </div>
          <div className={styles.pricingFilters}>
            {activeTab === "contract" ? (
              <select className={styles.selectInput} onChange={(e) => setServiceFilter(e.target.value)} value={serviceFilter}>
                {["Tất cả", "Member - Golf", "Practice", "Combo", "Trial"].map((o) => <option key={o}>{o}</option>)}
              </select>
            ) : (
              <select className={styles.selectInput} onChange={(e) => setServiceFilter(e.target.value)} value={serviceFilter}>
                {["Tất cả", "Teetime", "Practice", "Dịch vụ khác"].map((o) => <option key={o}>{o}</option>)}
              </select>
            )}
            {activeTab === "contract" ? (
              <select className={styles.selectInput} onChange={(e) => setBranchFilter(e.target.value)} value={branchFilter}>
                {["Tất cả", "NextVision", "Hà Nội Center", "Sài Gòn West"].map((o) => <option key={o}>{o}</option>)}
              </select>
            ) : null}
            <select className={styles.selectInput} onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter}>
              {["Tất cả", "Hoạt động", "Tạm ngưng"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className={styles.pricingActions}>
            <button className={styles.iconButton} onClick={() => alert("Filter nâng cao")} title="Filter nâng cao" type="button">
              <Filter size={16} />
            </button>
            <button className={styles.iconButton} onClick={() => alert(`Đang nhập file Excel cho ${activeTab === "contract" ? "Bảng giá HĐ" : "Vé lẻ"}...`)} title="Nhập Excel" type="button">
              <Upload size={16} />
            </button>
            <button className={styles.iconButton} onClick={() => alert(`Đang xuất ${activeTab === "contract" ? filteredPackages.length + " bảng giá HĐ" : filteredTickets.length + " vé lẻ"} ra .xlsx...`)} title="Xuất Excel" type="button">
              <Download size={16} />
            </button>
          </div>
        </div>

        {activeTab === "contract" ? (
          <PackageTable
            packages={filteredPackages}
            onDelete={(p) => setDeleteTarget({ kind: "package", code: p.code, name: p.name })}
            onEdit={openEditPackage}
            onToggleStatus={(code) => {
              const pkg = packages.find((p) => p.code === code);
              if (pkg) setToggleTarget({ kind: "package", code: pkg.code, name: pkg.name, status: pkg.status, usage: pkg.usage });
            }}
          />
        ) : (
          <TicketGrid
            onDelete={(t) => setDeleteTarget({ kind: "ticket", code: t.code, name: t.name })}
            onEdit={openEditTicket}
            onToggleStatus={(code) => {
              const tk = tickets.find((t) => t.code === code);
              if (tk) setToggleTarget({ kind: "ticket", code: tk.code, name: tk.name, status: tk.status, usage: 0 });
            }}
            tickets={filteredTickets}
          />
        )}
      </Screen>

      {zoneModalOpen ? (
        <ZoneManagementModal
          onClose={() => setZoneModalOpen(false)}
          onUpdate={setZones}
          zones={zones}
        />
      ) : null}

      {timeslotModalOpen ? (
        <TimeslotManagementModal
          onClose={() => setTimeslotModalOpen(false)}
          onUpdate={setTimeslots}
          timeslots={timeslots}
          zones={zones}
        />
      ) : null}

      {packageFormOpen ? (
        <ContractPackageFormModal
          initial={editingPackage}
          onClose={() => { setPackageFormOpen(false); setEditingPackage(null); }}
          onSubmit={submitPackage}
          timeslots={timeslots}
          zones={zones}
        />
      ) : null}

      {ticketFormOpen ? (
        <SingleTicketFormModal
          initial={editingTicket}
          onClose={() => { setTicketFormOpen(false); setEditingTicket(null); }}
          onSubmit={submitTicket}
        />
      ) : null}

      {deleteTarget ? (
        <DeletePricingModal
          code={deleteTarget.code}
          kind={deleteTarget.kind}
          name={deleteTarget.name}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            if (deleteTarget.kind === "package") handleDeletePackage(deleteTarget.code);
            else handleDeleteTicket(deleteTarget.code);
            setDeleteTarget(null);
          }}
        />
      ) : null}

      {toggleTarget ? (
        <TogglePricingStatusModal
          code={toggleTarget.code}
          kind={toggleTarget.kind}
          name={toggleTarget.name}
          onCancel={() => setToggleTarget(null)}
          onConfirm={() => {
            if (toggleTarget.kind === "package") togglePackageStatus(toggleTarget.code);
            else toggleTicketStatus(toggleTarget.code);
            setToggleTarget(null);
          }}
          status={toggleTarget.status}
          usage={toggleTarget.usage}
        />
      ) : null}
    </>
  );
}

function AlertTriangle() {
  return (
    <span className={styles.warningIcon}>
      <AlertCircle size={18} />
    </span>
  );
}

function KpiCard({ label, tone, value }: { label: string; tone: string; value: string }) {
  return (
    <article className={`${styles.pricingKpiCard} ${styles[`kpi_${tone}`]}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function StatusBadge({ status }: { status: "Hoạt động" | "Tạm ngưng" }) {
  return (
    <span className={status === "Hoạt động" ? styles.pricingStatusActive : styles.pricingStatusPaused}>
      <span className={styles.statusDot} /> {status}
    </span>
  );
}

function PackageTable({
  packages,
  onDelete,
  onEdit,
  onToggleStatus,
}: {
  packages: ContractPackage[];
  onDelete: (pkg: ContractPackage) => void;
  onEdit: (pkg: ContractPackage) => void;
  onToggleStatus: (code: string) => void;
}) {
  return (
    <section className={styles.memberTableCard}>
      <div className={styles.memberTableWrap}>
        <table className={styles.memberTable}>
          <thead>
            <tr>
              <th>Mã</th>
              <th>Tên Gói</th>
              <th>Loại DV</th>
              <th>Cơ Sở</th>
              <th>Số Buổi</th>
              <th>Thời Hạn</th>
              <th>Giá Gói</th>
              <th>Trạng Thái</th>
              <th>Sử Dụng</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {packages.length === 0 ? (
              <tr>
                <td className={styles.emptyTableCell} colSpan={10}>
                  Không có bảng giá phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              packages.map((p) => (
                <tr key={p.code}>
                  <td><span className={styles.memberCode}>{p.code}</span></td>
                  <td>
                    <strong className={styles.packageName}>{p.name}</strong>
                    <div className={styles.cellMuted}>{p.desc}</div>
                  </td>
                  <td><span className={styles.servicePill}>{p.serviceType}</span></td>
                  <td><span className={styles.branchPill}>{p.branch}</span></td>
                  <td><strong>{p.sessions}</strong></td>
                  <td>{p.duration}</td>
                  <td className={styles.priceCell}>{p.price}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>
                    <button className={styles.usageLink} onClick={() => alert(`Liệt kê ${p.usage} HĐ đang dùng ${p.code}`)} type="button">
                      {p.usage} HĐ
                    </button>
                  </td>
                  <td>
                    <div className={styles.tableActions}>
                      <button onClick={() => onEdit(p)} title="Sửa" type="button"><Pencil size={15} /></button>
                      <button
                        className={p.status === "Hoạt động" ? styles.tableActionPause : styles.tableActionActivate}
                        onClick={() => onToggleStatus(p.code)}
                        title={p.status === "Hoạt động" ? "Tạm ngưng" : "Kích hoạt"}
                        type="button"
                      >
                        <Power size={15} />
                      </button>
                      <button className={styles.tableActionDanger} onClick={() => onDelete(p)} title="Xóa" type="button">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className={styles.pagination}>
        <span>Hiển thị {packages.length ? 1 : 0} - {packages.length} / {packages.length} bảng giá</span>
        <span>Hiển thị: <input aria-label="Số dòng" defaultValue={10} /> / trang</span>
        <div>
          <button type="button">Trước</button>
          <button className={styles.currentPage} type="button">1</button>
          <button type="button">Sau</button>
        </div>
      </div>
    </section>
  );
}

function TicketGrid({
  tickets,
  onDelete,
  onEdit,
  onToggleStatus,
}: {
  tickets: SingleTicket[];
  onDelete: (ticket: SingleTicket) => void;
  onEdit: (ticket: SingleTicket) => void;
  onToggleStatus: (code: string) => void;
}) {
  if (tickets.length === 0) {
    return (
      <section className={styles.memberTableCard}>
        <p className={styles.emptyTableCell}>Không có vé lẻ phù hợp với bộ lọc.</p>
      </section>
    );
  }
  return (
    <div className={styles.ticketGrid}>
      {tickets.map((t) => (
        <article className={`${styles.ticketCard} ${t.status === "Tạm ngưng" ? styles.ticketCardPaused : ""}`} key={t.code}>
          <header className={styles.ticketHeader}>
            <div>
              <strong>{t.name}</strong>
              <span className={styles.ticketCode}>{t.code}</span>
            </div>
            <button
              aria-label={`Toggle ${t.code}`}
              className={`${styles.toggleSwitch} ${t.status === "Hoạt động" ? styles.toggleOn : ""}`}
              onClick={() => onToggleStatus(t.code)}
              type="button"
            >
              <span className={styles.toggleKnob} />
            </button>
          </header>
          <p className={styles.ticketDesc}>{t.desc}</p>
          <div className={styles.ticketBadges}>
            <span className={styles.servicePill}>{t.serviceType}</span>
            <span className={styles.durationPill}>{t.durationHours}</span>
            <StatusBadge status={t.status} />
          </div>
          <div className={styles.tierGrid}>
            <TierCell label="Ngày thường" value={t.prices.weekday} tone="green" />
            <TierCell label="Cuối tuần" value={t.prices.weekend} tone="blue" />
            <TierCell label="Lễ / Tết" value={t.prices.holiday} tone="amber" />
            <TierCell label="Giờ cao điểm" value={t.prices.peak} tone="red" />
          </div>
          <div className={styles.ticketPills}>
            {t.pillTimes.map((p) => <span key={p}>{p}</span>)}
          </div>
          <div className={styles.ticketEffective}>
            <Calendar size={13} /> Hiệu lực: {t.effective}
          </div>
          <footer className={styles.ticketFooter}>
            <span className={styles.ticketUpdated}>Cập nhật 15/04/2026</span>
            <div className={styles.tableActions}>
              <button onClick={() => onEdit(t)} title="Sửa" type="button"><Edit size={15} /></button>
              <button className={styles.tableActionDanger} onClick={() => onDelete(t)} title="Xóa" type="button"><Trash2 size={15} /></button>
            </div>
          </footer>
        </article>
      ))}
    </div>
  );
}

function TierCell({ label, tone, value }: { label: string; tone: string; value: string }) {
  return (
    <div className={`${styles.tierCell} ${styles[`tier_${tone}`]}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

/* ---------------- Zone Management ---------------- */

function ZoneManagementModal({
  zones,
  onClose,
  onUpdate,
}: {
  zones: Zone[];
  onClose: () => void;
  onUpdate: (zones: Zone[]) => void;
}) {
  const [editing, setEditing] = useState<Zone | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeBranch, setActiveBranch] = useState<string>("all");

  const branchCounts = BRANCHES.reduce<Record<string, number>>((acc, b) => {
    acc[b] = zones.filter((z) => z.branch === b).length;
    return acc;
  }, {});

  const filtered = zones.filter((z) => {
    if (activeBranch !== "all" && z.branch !== activeBranch) return false;
    if (search && !`${z.code} ${z.name}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const submit = (zone: Zone) => {
    const exists = zones.find((z) => z.code === zone.code);
    onUpdate(exists ? zones.map((z) => (z.code === zone.code ? zone : z)) : [zone, ...zones]);
    setFormOpen(false);
    setEditing(null);
  };

  const removeZone = (code: string) => {
    if (confirm("Xóa khu vực này? Sẽ vào Thùng rác 30 ngày (BR-M9-08).")) {
      onUpdate(zones.filter((z) => z.code !== code));
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <section className={styles.pricingMgmtModal}>
        <header className={styles.pricingMgmtHeader}>
          <div>
            <h2><MapPin size={20} /> Quản lý Khu vực</h2>
            <p>Cấu hình Khu vực — bước 1 trong luồng setup Bảng giá (BR-M9-13)</p>
          </div>
          <button onClick={onClose} type="button"><X size={22} /></button>
        </header>

        <div className={styles.pricingMgmtSplit}>
          <aside className={styles.branchSidebar}>
            <div className={styles.branchSidebarHeader}>
              <strong>Chi nhánh</strong>
              <span>{zones.length} khu vực</span>
            </div>
            <button
              className={`${styles.branchItem} ${activeBranch === "all" ? styles.branchItemActive : ""}`}
              onClick={() => setActiveBranch("all")}
              type="button"
            >
              <span>Tất cả chi nhánh</span>
              <em>{zones.length}</em>
            </button>
            {BRANCHES.map((b) => (
              <button
                className={`${styles.branchItem} ${activeBranch === b ? styles.branchItemActive : ""}`}
                key={b}
                onClick={() => setActiveBranch(b)}
                type="button"
              >
                <span>{b}</span>
                <em>{branchCounts[b] ?? 0}</em>
              </button>
            ))}
            <div className={styles.branchSidebarFooter}>
              <button onClick={() => alert("Mở Module 12 → Tab Quản lý Chi nhánh")} type="button">
                <Settings size={14} /> Quản lý chi nhánh
              </button>
            </div>
          </aside>

          <div className={styles.zoneMgmtContent}>
            <div className={styles.pricingMgmtToolbar}>
              <div className={styles.pricingSearch}>
                <Search size={18} />
                <input onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo mã, tên khu vực..." value={search} />
              </div>
              <button
                className={styles.pricingPrimaryBtn}
                onClick={() => { setEditing(null); setFormOpen(true); }}
                type="button"
              >
                <Plus size={16} /> Thêm khu vực
              </button>
            </div>

            <div className={styles.memberTableWrap}>
              <table className={styles.memberTable}>
                <thead>
                  <tr>
                    <th>KHU VỰC</th>
                    <th>LOẠI</th>
                    <th>DIỆN TÍCH / SỨC CHỨA</th>
                    <th>CHECK-IN</th>
                    <th>THIẾT BỊ</th>
                    <th>DỊCH VỤ</th>
                    <th>TRẠNG THÁI</th>
                    <th>THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td className={styles.emptyTableCell} colSpan={8}>
                        Chi nhánh {activeBranch === "all" ? "" : activeBranch} chưa có khu vực phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((z) => (
                      <tr key={z.code}>
                        <td>
                          <strong>{z.name}</strong>
                          <div className={styles.cellMuted}>{z.code}</div>
                        </td>
                        <td><span className={styles.zoneTypeBadge}>{z.zoneType}</span></td>
                        <td><strong>{z.area}</strong><div className={styles.cellMuted}>{z.capacity} người</div></td>
                        <td><span className={styles.checkinPill}>{z.checkinMode}</span></td>
                        <td>
                          {z.devices.length === 0 ? (
                            <span className={styles.cellMuted}>—</span>
                          ) : (
                            <div className={styles.miniChips}>
                              {z.devices.map((d) => <span key={d}>{d}</span>)}
                            </div>
                          )}
                        </td>
                        <td>
                          {z.services.length === 0 ? (
                            <span className={styles.cellMuted}>—</span>
                          ) : (
                            <div className={styles.miniChips}>
                              {z.services.slice(0, 2).map((s) => <span key={s}>{s}</span>)}
                              {z.services.length > 2 ? <span className={styles.miniChipMore}>+{z.services.length - 2}</span> : null}
                            </div>
                          )}
                        </td>
                        <td><StatusBadge status={z.status} /></td>
                        <td>
                          <div className={styles.tableActions}>
                            <button onClick={() => { setEditing(z); setFormOpen(true); }} title="Sửa" type="button"><Pencil size={15} /></button>
                            <button className={styles.tableActionDanger} onClick={() => removeZone(z.code)} title="Xóa" type="button"><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className={styles.pricingMgmtFooter}>
              <span>Hiển thị {filtered.length} / {zones.length} khu vực {activeBranch !== "all" ? `(lọc theo ${activeBranch})` : ""}</span>
              <span>{filtered.filter((z) => z.status === "Hoạt động").length} đang hoạt động</span>
            </div>
          </div>
        </div>
      </section>

      {formOpen ? (
        <ZoneFormModal
          defaultBranch={activeBranch === "all" ? undefined : activeBranch}
          existing={editing}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSubmit={submit}
        />
      ) : null}
    </div>
  );
}

function ZoneFormModal({
  defaultBranch,
  existing,
  onClose,
  onSubmit,
}: {
  defaultBranch?: string;
  existing: Zone | null;
  onClose: () => void;
  onSubmit: (zone: Zone) => void;
}) {
  const isEdit = !!existing;
  const [checkinMode, setCheckinMode] = useState<Zone["checkinMode"]>(existing?.checkinMode ?? "Quay lễ tân");
  const [devices, setDevices] = useState<string[]>(existing?.devices ?? []);
  const [services, setServices] = useState<string[]>(existing?.services ?? []);
  const [error, setError] = useState("");

  const showDevicesField = checkinMode === "Kiểm soát cửa" || checkinMode === "Cả hai";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    if (!name) { setError("Tên khu vực bắt buộc"); return; }
    if (showDevicesField && devices.length === 0) {
      setError("Phải chọn ≥1 thiết bị khi Phương thức Check-in = Kiểm soát cửa / Cả hai");
      return;
    }

    onSubmit({
      code: existing?.code ?? `ZONE-${(data.get("zoneType") as string ?? "X").substring(0, 2).toUpperCase()}-${String(Date.now()).slice(-3)}`,
      name,
      zoneType: (data.get("zoneType") as ZoneType) ?? "Driving Range",
      branch: String(data.get("branch") ?? defaultBranch ?? "NextVision"),
      area: String(data.get("area") ?? "0 m²"),
      capacity: Number(data.get("capacity") ?? 0),
      checkinMode,
      devices: showDevicesField ? devices : [],
      services,
      status: existing?.status ?? "Hoạt động",
    });
  };

  return (
    <div className={styles.nestedOverlay}>
      <form className={styles.zoneFormModal} onSubmit={handleSubmit}>
        <header className={styles.zoneFormHeader}>
          <h2>{isEdit ? "Chỉnh sửa khu vực" : "Thêm khu vực mới"}</h2>
          <button onClick={onClose} type="button"><X size={20} /></button>
        </header>
        <div className={styles.zoneFormBody}>
          {error ? <p className={styles.formError}>{error}</p> : null}

          <div className={styles.formGrid}>
            <FormField label="Mã khu vực" name="code" value={existing?.code ?? "ZONE-XX-AUTO"} />
            <SelectField defaultValue={existing?.zoneType} label="Loại khu vực" name="zoneType" options={["Driving Range", "Putting Green", "Bay Indoor", "Sân 9 lỗ", "Sân 18 lỗ"]} />
          </div>

          <FormField defaultValue={existing?.name} label="Tên khu vực" name="name" placeholder="VD: Khu Driving Range chính" required />

          <div className={styles.formGrid}>
            <SelectField defaultValue={existing?.branch ?? defaultBranch} label="Chi nhánh" name="branch" options={BRANCHES} />
            <FormField defaultValue={existing?.area} label="Diện tích (m²)" name="area" placeholder="VD: 1.200 m²" />
            <FormField defaultValue={existing?.capacity ? String(existing.capacity) : ""} label="Sức chứa (người)" name="capacity" placeholder="VD: 50" type="number" />
          </div>

          <div className={styles.checkinModeBlock}>
            <span className={styles.checkinModeLabel}>Phương thức Check-in <b>*</b></span>
            <div className={styles.checkinModeGrid}>
              {(["Kiểm soát cửa", "Quay lễ tân", "Cả hai"] as const).map((mode) => (
                <button
                  className={`${styles.checkinModeCard} ${checkinMode === mode ? styles.checkinModeCardActive : ""}`}
                  key={mode}
                  onClick={() => setCheckinMode(mode)}
                  type="button"
                >
                  <span className={styles.checkinModeRadio}>
                    {checkinMode === mode ? <span /> : null}
                  </span>
                  <div>
                    <strong>{mode}</strong>
                    <small>
                      {mode === "Kiểm soát cửa"
                        ? "FaceID/RFID quét vào tự động"
                        : mode === "Quay lễ tân"
                          ? "Lễ tân thao tác thủ công"
                          : "FaceID + Lễ tân backup"}
                    </small>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {showDevicesField ? (
            <div className={styles.fieldWithManage}>
              <span className={styles.fieldWithManageLabel}>Thiết bị kiểm soát cửa <b>*</b></span>
              <div className={styles.fieldWithManageRow}>
                <ChipMultiSelect
                  emptyText="Chưa cấu hình thiết bị nào"
                  manageLabel="Quản lý thiết bị (Module 12)"
                  onChange={setDevices}
                  onManage={() => alert("Mở Module 12 → Tab Thiết bị")}
                  options={ALL_DEVICES}
                  placeholder="Chọn thiết bị kiểm soát..."
                  selected={devices}
                />
                <button
                  className={styles.fieldManageBtn}
                  onClick={() => alert("Mở Module 12 → Tab Thiết bị")}
                  type="button"
                >
                  <Settings size={14} /> Quản lý
                </button>
              </div>
              <small className={styles.fieldHint}>Bắt buộc khi Check-in = Kiểm soát cửa / Cả hai</small>
            </div>
          ) : null}

          <div className={styles.fieldWithManage}>
            <span className={styles.fieldWithManageLabel}>Dịch vụ cung cấp</span>
            <ChipMultiSelect
              onChange={setServices}
              options={ALL_SERVICES}
              placeholder="Chọn dịch vụ KV này cung cấp..."
              selected={services}
            />
          </div>

          <FormField area label="Ghi chú" name="note" placeholder="Mô tả thêm về khu vực..." />
        </div>
        <footer>
          <button onClick={onClose} type="button">Hủy bỏ</button>
          <button className={styles.blueButton} type="submit">{isEdit ? "Cập nhật" : "Lưu khu vực"}</button>
        </footer>
      </form>
    </div>
  );
}

function ChipMultiSelect({
  emptyText,
  manageLabel,
  onChange,
  onManage,
  options,
  placeholder,
  selected,
}: {
  emptyText?: string;
  manageLabel?: string;
  onChange: (next: string[]) => void;
  onManage?: () => void;
  options: string[];
  placeholder: string;
  selected: string[];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const toggleItem = (item: string) => {
    onChange(selected.includes(item) ? selected.filter((i) => i !== item) : [...selected, item]);
  };

  const filtered = options.filter((o) => !search || o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={styles.chipMultiSelect}>
      <button
        className={`${styles.chipMultiSelectInput} ${open ? styles.chipMultiSelectInputOpen : ""}`}
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        {selected.length === 0 ? (
          <span className={styles.chipMultiSelectPlaceholder}>{placeholder}</span>
        ) : (
          <div className={styles.chipMultiSelectChips}>
            {selected.map((s) => (
              <span className={styles.chipMultiSelectChip} key={s}>
                {s}
                <button
                  aria-label={`Bỏ ${s}`}
                  onClick={(event) => { event.stopPropagation(); toggleItem(s); }}
                  type="button"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
        <ChevronDown size={16} className={open ? styles.chipMultiSelectChevronOpen : ""} />
      </button>

      {open ? (
        <>
          <button
            aria-label="Đóng dropdown"
            className={styles.popoverBackdrop}
            onClick={() => setOpen(false)}
            type="button"
          />
          <div className={styles.chipMultiSelectPopover}>
            <div className={styles.chipMultiSelectSearchRow}>
              <Search size={14} />
              <input
                autoFocus
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm..."
                value={search}
              />
              {search ? (
                <button onClick={() => setSearch("")} type="button"><X size={12} /></button>
              ) : null}
            </div>
            <div className={styles.chipMultiSelectList}>
              {filtered.length === 0 ? (
                <p className={styles.chipMultiSelectEmpty}>{emptyText ?? "Không có mục nào"}</p>
              ) : (
                filtered.map((o) => (
                  <label className={styles.chipMultiSelectOption} key={o}>
                    <input checked={selected.includes(o)} onChange={() => toggleItem(o)} type="checkbox" />
                    <span>{o}</span>
                  </label>
                ))
              )}
            </div>
            {manageLabel && onManage ? (
              <div className={styles.chipMultiSelectFooter}>
                <button onClick={() => { onManage(); setOpen(false); }} type="button">
                  <Settings size={14} /> {manageLabel}
                </button>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}

/* ---------------- Timeslot Management ---------------- */

function TimeslotManagementModal({
  timeslots,
  zones,
  onClose,
  onUpdate,
}: {
  timeslots: TimeSlot[];
  zones: Zone[];
  onClose: () => void;
  onUpdate: (slots: TimeSlot[]) => void;
}) {
  const [editing, setEditing] = useState<TimeSlot | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const submit = (slot: TimeSlot) => {
    const exists = timeslots.find((s) => s.id === slot.id);
    onUpdate(exists ? timeslots.map((s) => (s.id === slot.id ? slot : s)) : [slot, ...timeslots]);
    setFormOpen(false);
    setEditing(null);
  };

  const removeSlot = (id: string) => {
    if (confirm("Xóa khung giờ này? BR-M9-08 áp dụng — vào Thùng rác 30 ngày.")) {
      onUpdate(timeslots.filter((s) => s.id !== id));
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <section className={styles.pricingMgmtModal}>
        <header className={styles.pricingMgmtHeader}>
          <div>
            <h2><Timer size={20} /> Quản lý Khung giờ</h2>
            <p>Cấu hình Khung giờ — bước 2 trong luồng setup Bảng giá. Khung giờ có thể độc lập với Khu vực (BR-M9-14).</p>
          </div>
          <button onClick={onClose} type="button"><X size={22} /></button>
        </header>

        <div className={styles.pricingMgmtToolbar}>
          <span className={styles.pricingMgmtCount}>{timeslots.length} khung giờ</span>
          <button
            className={styles.pricingPrimaryBtn}
            onClick={() => { setEditing(null); setFormOpen(true); }}
            type="button"
          >
            <Plus size={16} /> Thêm khung giờ
          </button>
        </div>

        <div className={styles.memberTableWrap}>
          <table className={styles.memberTable}>
            <thead>
              <tr>
                <th>TÊN KHUNG GIỜ</th>
                <th>GIỜ</th>
                <th>THỜI LƯỢNG</th>
                <th>NGÀY</th>
                <th>KHU VỰC ÁP DỤNG</th>
                <th>CHI NHÁNH</th>
                <th>TRẠNG THÁI</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {timeslots.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span className={`${styles.colorDot} ${styles[`dot_${s.color}`]}`} />
                    <strong>{s.name}</strong>
                    <div className={styles.cellMuted}>{s.id}</div>
                  </td>
                  <td><strong>{s.startTime} – {s.endTime}</strong></td>
                  <td>{s.duration}</td>
                  <td>{formatDays(s.days)}</td>
                  <td>
                    {s.zones.length === 0 ? (
                      <span className={styles.cellMuted}>Độc lập (BR-M9-14)</span>
                    ) : (
                      <span className={styles.zoneCountBadge}>{s.zones.length} khu vực</span>
                    )}
                  </td>
                  <td>{s.branches}</td>
                  <td><StatusBadge status={s.status} /></td>
                  <td>
                    <div className={styles.tableActions}>
                      <button onClick={() => { setEditing(s); setFormOpen(true); }} title="Sửa" type="button"><Pencil size={15} /></button>
                      <button className={styles.tableActionDanger} onClick={() => removeSlot(s.id)} title="Xóa" type="button"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {formOpen ? (
        <TimeslotFormModal
          existing={editing}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSubmit={submit}
          zones={zones}
        />
      ) : null}
    </div>
  );
}

function TimeslotFormModal({
  existing,
  onClose,
  onSubmit,
  zones,
}: {
  existing: TimeSlot | null;
  onClose: () => void;
  onSubmit: (slot: TimeSlot) => void;
  zones: Zone[];
}) {
  const isEdit = !!existing;
  const [color, setColor] = useState(existing?.color ?? "blue");
  const [days, setDays] = useState<string[]>(existing?.days ?? ["T2", "T3", "T4", "T5", "T6"]);
  const [selectedZones, setSelectedZones] = useState<string[]>(existing?.zones ?? []);
  const [error, setError] = useState("");

  const toggleDay = (id: string) =>
    setDays((current) => current.includes(id) ? current.filter((d) => d !== id) : [...current, id]);

  const setQuickPreset = (preset: "weekday" | "weekend" | "all") => {
    if (preset === "weekday") setDays(["T2", "T3", "T4", "T5", "T6"]);
    else if (preset === "weekend") setDays(["T7", "CN"]);
    else setDays(["T2", "T3", "T4", "T5", "T6", "T7", "CN"]);
  };

  const isWeekdayPreset = days.length === 5 && ["T2", "T3", "T4", "T5", "T6"].every((d) => days.includes(d));
  const isWeekendPreset = days.length === 2 && days.includes("T7") && days.includes("CN");
  const isAllPreset = days.length === 7;

  const zoneOptions = zones.map((z) => `${z.code} — ${z.name}`);
  const zoneSelectedFormatted = selectedZones.map((code) => {
    const found = zones.find((z) => z.code === code);
    return found ? `${found.code} — ${found.name}` : code;
  });

  const handleZoneChange = (next: string[]) => {
    setSelectedZones(next.map((label) => label.split(" — ")[0]));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const start = String(data.get("startTime") ?? "");
    const end = String(data.get("endTime") ?? "");
    if (!name) { setError("Tên khung giờ bắt buộc"); return; }
    if (start >= end) { setError("Giờ kết thúc phải > Giờ bắt đầu (BR-M9-20)"); return; }
    if (days.length === 0) { setError("Phải chọn ≥1 ngày áp dụng"); return; }

    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    const duration = `${Math.floor(mins / 60)} giờ${mins % 60 ? ` ${mins % 60} phút` : ""}`;

    onSubmit({
      id: existing?.id ?? `TS-${String(Date.now()).slice(-3)}`,
      name,
      startTime: start,
      endTime: end,
      duration,
      days,
      branches: String(data.get("branches") ?? "NextVision"),
      zones: selectedZones,
      color,
      status: existing?.status ?? "Hoạt động",
    });
  };

  const colors = ["blue", "amber", "red", "purple", "green", "pink", "orange", "gray", "cyan", "lime"];

  return (
    <div className={styles.nestedOverlay}>
      <form className={styles.zoneFormModal} onSubmit={handleSubmit}>
        <header className={styles.zoneFormHeader}>
          <h2>{isEdit ? "Chỉnh sửa khung giờ" : "Thêm khung giờ mới"}</h2>
          <button onClick={onClose} type="button"><X size={20} /></button>
        </header>
        <div className={styles.zoneFormBody}>
          {error ? <p className={styles.formError}>{error}</p> : null}

          <FormField defaultValue={existing?.name} label="Tên khung giờ" name="name" placeholder="VD: Sáng sớm thứ 2-6" required />

          <div className={styles.formGrid}>
            <FormField defaultValue={existing?.startTime ?? "06:00"} label="Giờ bắt đầu" name="startTime" type="time" />
            <FormField defaultValue={existing?.endTime ?? "09:00"} label="Giờ kết thúc" name="endTime" type="time" />
          </div>

          <div className={styles.fieldWithManage}>
            <span className={styles.fieldWithManageLabel}>Khu vực áp dụng</span>
            <ChipMultiSelect
              emptyText="Chưa có khu vực — thêm trong Quản lý Khu vực"
              onChange={handleZoneChange}
              options={zoneOptions}
              placeholder="Chọn khu vực áp dụng (có thể bỏ trống — KG độc lập theo BR-M9-14)..."
              selected={zoneSelectedFormatted}
            />
            <small className={styles.fieldHint}>BR-M9-14: Khung giờ có thể tồn tại không cần gán Khu vực cụ thể</small>
          </div>

          <div className={styles.fieldWithManage}>
            <span className={styles.fieldWithManageLabel}>Ngày áp dụng <b>*</b></span>
            <div className={styles.dayQuickPills}>
              <button
                className={`${styles.dayQuickPill} ${isWeekdayPreset ? styles.dayQuickPillActive : ""}`}
                onClick={() => setQuickPreset("weekday")}
                type="button"
              >
                T2 - T6
              </button>
              <button
                className={`${styles.dayQuickPill} ${isWeekendPreset ? styles.dayQuickPillActive : ""}`}
                onClick={() => setQuickPreset("weekend")}
                type="button"
              >
                T7 - CN
              </button>
              <button
                className={`${styles.dayQuickPill} ${isAllPreset ? styles.dayQuickPillActive : ""}`}
                onClick={() => setQuickPreset("all")}
                type="button"
              >
                Tất cả
              </button>
              <span className={styles.dayQuickDivider} />
              <span className={styles.dayCustomLabel}>Hoặc chọn ngày cụ thể:</span>
            </div>
            <div className={styles.dayPills}>
              {DAY_PILLS.map((d) => (
                <label className={styles.dayPill} key={d.id} title={d.full}>
                  <input checked={days.includes(d.id)} onChange={() => toggleDay(d.id)} type="checkbox" />
                  <span>{d.label}</span>
                </label>
              ))}
            </div>
            <small className={styles.fieldHint}>Đang chọn: <strong>{formatDays(days)}</strong></small>
          </div>

          <FormField defaultValue={existing?.branches} label="Chi nhánh áp dụng" name="branches" placeholder="VD: NextVision" />

          <div className={styles.colorPickerLabel}>
            <span>Màu hiển thị</span>
            <div className={styles.colorPicker}>
              {colors.map((c) => (
                <button
                  aria-label={`Màu ${c}`}
                  className={`${styles.colorSwatch} ${styles[`dot_${c}`]} ${color === c ? styles.colorSwatchActive : ""}`}
                  key={c}
                  onClick={() => setColor(c)}
                  type="button"
                />
              ))}
            </div>
          </div>

          <FormField area label="Ghi chú" placeholder="Mô tả ngắn..." />
        </div>
        <footer>
          <button onClick={onClose} type="button">Hủy bỏ</button>
          <button className={styles.blueButton} type="submit">{isEdit ? "Cập nhật" : "Lưu khung giờ"}</button>
        </footer>
      </form>
    </div>
  );
}

/* ---------------- Contract Package Form ---------------- */

function ContractPackageFormModal({
  initial,
  onClose,
  onSubmit,
  timeslots,
  zones,
}: {
  initial: ContractPackage | null;
  onClose: () => void;
  onSubmit: (pkg: ContractPackage) => void;
  timeslots: TimeSlot[];
  zones: Zone[];
}) {
  const isEdit = !!initial;
  const initialPrice = Number(initial?.price?.replace(/[^\d]/g, "")) || 0;

  const [name, setName] = useState(initial?.name ?? "");
  const [desc, setDesc] = useState(initial?.desc ?? "");
  const [pkgStatus, setPkgStatus] = useState<"Hoạt động" | "Tạm ngưng">(initial?.status ?? "Hoạt động");
  const [serviceType, setServiceType] = useState(initial?.serviceType ?? "Member - Golf");
  const [serviceGroup, setServiceGroup] = useState("Teetime");
  const [branch, setBranch] = useState(initial?.branch ?? "NextVision");
  const [timeslotId, setTimeslotId] = useState("");
  const [packageMode, setPackageMode] = useState<"fixed" | "flex">("fixed");
  const [unit, setUnit] = useState("Buổi");
  const [duration, setDuration] = useState(initial?.duration?.match(/\d+/)?.[0] ?? "1");
  const [vat, setVat] = useState("0");
  const [sessions, setSessions] = useState(initial?.sessions?.match(/\d+/)?.[0] ?? "");
  const [priceAfterVat, setPriceAfterVat] = useState(String(initialPrice));
  const [selectedZones, setSelectedZones] = useState<string[]>(zones.map((z) => z.code));
  const [selectedSlots, setSelectedSlots] = useState<string[]>(timeslots.map((t) => t.id));
  const [transferable, setTransferable] = useState(true);
  const [commissionMode, setCommissionMode] = useState<"default" | "custom" | "none">("default");
  const [hhUnit, setHhUnit] = useState<"VND" | "%">("VND");
  const [hhSale, setHhSale] = useState("");
  const [hhCoach, setHhCoach] = useState("");
  const [error, setError] = useState("");

  const code = initial?.code ?? `PKG - MNNZ55DX - 350`;
  const vatRate = Number(vat) / 100;
  const priceAfter = Number(priceAfterVat) || 0;
  const priceBeforeVat = vatRate > 0 ? Math.round(priceAfter / (1 + vatRate)) : priceAfter;
  const vatAmount = priceAfter - priceBeforeVat;
  const totalCommission = (Number(hhSale) || 0) + (Number(hhCoach) || 0);
  const sessionsNum = Number(sessions) || 0;
  const pricePerSession = sessionsNum > 0 ? Math.round(priceBeforeVat / sessionsNum) : 0;

  const fmt = (n: number) => `${n.toLocaleString("vi-VN")} VND`;

  const submit = () => {
    if (!name.trim()) { setError("Tên gói bắt buộc"); return; }
    onSubmit({
      code: initial?.code ?? `P${String(Date.now()).slice(-3)}`,
      name,
      desc,
      serviceType,
      branch,
      sessions: packageMode === "flex" ? "Theo buổi" : `${sessions || 0} buổi`,
      duration: `${duration} tháng`,
      price: `${priceAfter.toLocaleString("vi-VN")} đ${packageMode === "flex" ? "/buổi" : ""}`,
      status: pkgStatus,
      usage: initial?.usage ?? 0,
    });
  };

  const toggleZone = (zcode: string) =>
    setSelectedZones((c) => c.includes(zcode) ? c.filter((z) => z !== zcode) : [...c, zcode]);
  const toggleSlot = (id: string) =>
    setSelectedSlots((c) => c.includes(id) ? c.filter((s) => s !== id) : [...c, id]);

  return (
    <div className={styles.modalOverlay}>
      <section className={styles.contractPriceModal}>
        <header className={styles.contractPriceHero}>
          <div>
            <h2>{isEdit ? "Chỉnh sửa Bảng Giá" : "Tạo Bảng Giá Mới"}</h2>
            <p>{isEdit ? `Sửa giá chỉ áp dụng cho HĐ ký mới sau thời điểm sửa` : "Tạo một bảng giá mới cho dịch vụ của bạn."}</p>
          </div>
          <button onClick={onClose} type="button"><X size={20} /></button>
        </header>

        <div className={styles.contractPriceBody}>
          {error ? <p className={styles.formError}>{error}</p> : null}

          <div className={styles.cpField}>
            <label className={styles.cpLabel}># Mã Gói <b>*</b> <span className={styles.cpHint}>(Tự động sinh)</span></label>
            <div className={styles.cpAutoCode}>{code}</div>
            <small>Mã gói được tự động sinh ra và không thể chỉnh sửa</small>
          </div>

          <div className={styles.cpField}>
            <label className={styles.cpLabel}>Tên Gói <b>*</b></label>
            <input className={styles.cpInput} value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Gói Cao Cấp" />
          </div>

          <div className={styles.cpField}>
            <label className={styles.cpLabel}>Mô Tả</label>
            <textarea className={styles.cpInput} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Mô tả chi tiết về gói" rows={3} />
          </div>

          <div className={styles.cpRow2}>
            <div className={styles.cpField}>
              <label className={styles.cpLabel}>Trạng Thái <b>*</b></label>
              <select className={styles.cpInput} value={pkgStatus} onChange={(e) => setPkgStatus(e.target.value as "Hoạt động" | "Tạm ngưng")}>
                <option>Hoạt động</option>
                <option>Tạm ngưng</option>
              </select>
            </div>
            <div className={styles.cpField}>
              <label className={styles.cpLabel}>
                Loại Dịch Vụ <b>*</b>
                <button type="button" className={styles.cpAddLink} onClick={() => alert("Mở dialog Thêm loại dịch vụ")}>
                  <Plus size={12} /> Thêm loại dịch vụ
                </button>
              </label>
              <select className={styles.cpInput} value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
                <option>Thành Viên</option>
                <option>Member - Golf</option>
                <option>Practice</option>
                <option>Combo</option>
                <option>Trial</option>
              </select>
            </div>
          </div>

          <div className={styles.cpRow2}>
            <div className={styles.cpField}>
              <label className={styles.cpLabel}>
                Nhóm Dịch Vụ <b>*</b>
                <button type="button" className={styles.cpAddLink} onClick={() => alert("Mở dialog Thêm nhóm")}>
                  <Plus size={12} /> Thêm nhóm
                </button>
              </label>
              <select className={styles.cpInput} value={serviceGroup} onChange={(e) => setServiceGroup(e.target.value)}>
                <option>Teetime</option>
                <option>Practice</option>
                <option>Combo</option>
              </select>
            </div>
            <div className={styles.cpField}>
              <label className={styles.cpLabel}>Chi Nhánh <b>*</b></label>
              <input className={styles.cpInput} value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="VD: Chi Nhánh 1" />
            </div>
          </div>

          <div className={styles.cpRow2}>
            <div className={styles.cpField}>
              <label className={styles.cpLabel}>
                Khung Thời Gian <b>*</b>
                <button type="button" className={styles.cpAddLink} onClick={() => alert("Mở dialog Thêm khung giờ")}>
                  <Plus size={12} /> Thêm khung giờ
                </button>
              </label>
              <select className={styles.cpInput} value={timeslotId} onChange={(e) => setTimeslotId(e.target.value)}>
                <option value="">Chọn khung giờ</option>
                {timeslots.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.startTime} - {t.endTime})</option>)}
              </select>
            </div>
            <div className={styles.cpField}>
              <label className={styles.cpLabel}>Chế Độ Gói <b>*</b></label>
              <div className={styles.cpRadioCol}>
                <label className={packageMode === "fixed" ? styles.cpRadioActive : styles.cpRadioIdle}>
                  <input type="radio" checked={packageMode === "fixed"} onChange={() => setPackageMode("fixed")} />
                  <strong>Gói Cố Định</strong>
                  <span>Khách hàng mua gói với số lượng và giá cố định</span>
                </label>
                <label className={packageMode === "flex" ? styles.cpRadioActive : styles.cpRadioIdle}>
                  <input type="radio" checked={packageMode === "flex"} onChange={() => setPackageMode("flex")} />
                  <strong>Gói Linh Hoạt</strong>
                  <span>Khách hàng trả theo đơn vị sử dụng</span>
                </label>
              </div>
            </div>
          </div>

          <div className={styles.cpRow2}>
            <div className={styles.cpField}>
              <label className={styles.cpLabel}>Đơn Vị Tính <b>*</b></label>
              <select className={styles.cpInput} value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option>Buổi</option>
                <option>Giờ</option>
                <option>Ngày</option>
                <option>Tháng</option>
              </select>
            </div>
            <div className={styles.cpField}>
              <label className={styles.cpLabel}>Thời Hạn Sử Dụng (Tháng) <b>*</b></label>
              <input className={styles.cpInput} value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="1" type="number" />
              <small>Thời gian khách hàng có thể sử dụng gói</small>
            </div>
          </div>

          <div className={styles.cpRow2}>
            <div className={styles.cpField}>
              <label className={styles.cpLabel}>VAT (%) <b>*</b></label>
              <select className={styles.cpInput} value={vat} onChange={(e) => setVat(e.target.value)}>
                <option value="0">0% - Không VAT</option>
                <option value="5">5%</option>
                <option value="8">8%</option>
                <option value="10">10%</option>
              </select>
              <small>Thuế giá trị tăng áp dụng cho gói</small>
            </div>
            {packageMode === "fixed" ? (
              <div className={styles.cpField}>
                <label className={styles.cpLabel}>Số Lượng buổi <b>*</b></label>
                <input className={styles.cpInput} value={sessions} onChange={(e) => setSessions(e.target.value)} placeholder="VD: 50" type="number" />
              </div>
            ) : <div />}
          </div>

          <div className={styles.cpRow2}>
            <div className={styles.cpField}>
              <label className={styles.cpLabel}>Giá Sau VAT (VND) <b>*</b></label>
              <input className={styles.cpInput} value={priceAfterVat} onChange={(e) => setPriceAfterVat(e.target.value)} placeholder="VD: 11000000" type="number" />
              <small>Giá đã bao gồm VAT {vat}%</small>
            </div>
            <div className={styles.cpField}>
              <label className={styles.cpLabel}>Tiền VAT (VND) <span className={styles.cpHint}>(Tự động)</span></label>
              <div className={styles.cpAutoOrange}>{fmt(vatAmount)}</div>
              <small>Tự động tính từ: Giá sau VAT − Giá gói</small>
            </div>
          </div>

          <div className={styles.cpField}>
            <label className={styles.cpLabel}>Giá Trước VAT (VND) <span className={styles.cpHint}>(Tự động)</span></label>
            <div className={styles.cpAutoBox}>{fmt(priceBeforeVat)}</div>
            <small>Tự động tính từ: Giá sau VAT ÷ (1 + VAT/100)</small>
          </div>

          <section className={styles.cpSection}>
            <header>
              <h3><MapPin size={16} /> Quản Lý Khu Vực</h3>
              <button type="button" className={styles.cpAddBtn} onClick={() => alert("Thêm khu vực mới")}>
                <Plus size={14} /> Thêm khu vực
              </button>
            </header>
            <div className={styles.cpCheckGrid}>
              {zones.slice(0, 4).map((z) => (
                <label className={styles.cpCheck} key={z.code}>
                  <input checked={selectedZones.includes(z.code)} onChange={() => toggleZone(z.code)} type="checkbox" />
                  <MapPin size={14} /> {z.name}
                </label>
              ))}
            </div>
          </section>

          <section className={styles.cpSection}>
            <header>
              <h3><Timer size={16} /> Quản Lý Khung Giờ</h3>
              <button type="button" className={styles.cpAddBtn} onClick={() => alert("Thêm khung giờ mới")}>
                <Plus size={14} /> Thêm khung giờ
              </button>
            </header>
            <div className={styles.cpCheckGrid}>
              {timeslots.slice(0, 4).map((s) => (
                <label className={styles.cpCheck} key={s.id}>
                  <input checked={selectedSlots.includes(s.id)} onChange={() => toggleSlot(s.id)} type="checkbox" />
                  <Timer size={14} />
                  <div>
                    <strong>{s.name}</strong>
                    <em>{s.startTime} - {s.endTime}</em>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <section className={styles.cpSection}>
            <header>
              <h3><Calendar size={16} /> Điều Kiện Sử Dụng Gói</h3>
            </header>
            <div className={styles.cpRow2}>
              <div className={styles.cpField}>
                <label className={styles.cpLabel}>Giới Hạn Sử Dụng Mỗi Ngày</label>
                <input className={styles.cpInput} placeholder="0 = Không giới hạn" type="number" />
                <small>Số lần tối đa có thể sử dụng trong 1 ngày</small>
              </div>
              <div className={styles.cpField}>
                <label className={styles.cpLabel}>Giới Hạn Sử Dụng Mỗi Tuần</label>
                <input className={styles.cpInput} placeholder="0 = Không giới hạn" type="number" />
                <small>Số lần tối đa có thể sử dụng trong 1 tuần</small>
              </div>
            </div>
            <div className={styles.cpRow2}>
              <div className={styles.cpField}>
                <label className={styles.cpLabel}>Giới Hạn Sử Dụng Mỗi Tháng</label>
                <input className={styles.cpInput} placeholder="0 = Không giới hạn" type="number" />
              </div>
              <div className={styles.cpField}>
                <label className={styles.cpLabel}>Thời Gian Đặt Trước Tối Thiểu</label>
                <input className={styles.cpInput} placeholder="VD: 24 (giờ)" type="number" />
                <small>Phải đặt trước bao nhiêu giờ</small>
              </div>
            </div>
            <div className={styles.cpRow2}>
              <div className={styles.cpField}>
                <label className={styles.cpLabel}>Chính Sách Hủy Lịch</label>
                <input className={styles.cpInput} placeholder="VD: 48 (giờ)" type="number" />
                <small>Phải hủy trước bao nhiêu giờ</small>
              </div>
              <div className={styles.cpField}>
                <label className={styles.cpLabel}>Chuyển Nhượng</label>
                <label className={styles.cpCheckSimple}>
                  <input type="checkbox" checked={transferable} onChange={(e) => setTransferable(e.target.checked)} />
                  Cho phép chuyển nhượng gói này
                </label>
              </div>
            </div>
            <div className={styles.cpField}>
              <label className={styles.cpLabel}>Điều Kiện Khác</label>
              <textarea className={styles.cpInput} rows={2} placeholder="Nhập các điều kiện, quy định khác (nếu có)..." />
            </div>
          </section>

          <section className={styles.cpSection}>
            <header>
              <h3>✨ Tiện Ích Đi Kèm</h3>
            </header>
            <div className={styles.cpCheckGrid}>
              <label className={styles.cpCheck}><input type="checkbox" /> 🧺 Khăn tắm</label>
              <label className={styles.cpCheck}><input type="checkbox" /> 🛏 Tủ đồ cá nhân</label>
            </div>
            <div className={styles.cpField}>
              <label className={styles.cpLabel}>Tiện Ích Khác</label>
              <textarea className={styles.cpInput} rows={2} placeholder="Nhập các tiện ích, dịch vụ đi kèm khác (nếu có)..." />
            </div>
          </section>

          <section className={styles.cpSection}>
            <header>
              <h3>% Cấu Hình Hoa Hồng</h3>
            </header>
            <div className={styles.cpField}>
              <label className={styles.cpLabel}>Loại Hoa Hồng <b>*</b></label>
              <div className={styles.cpRadioCol}>
                <label className={commissionMode === "default" ? styles.cpRadioActive : styles.cpRadioIdle}>
                  <input type="radio" checked={commissionMode === "default"} onChange={() => setCommissionMode("default")} />
                  <strong>Mặc Định</strong>
                  <span>Hoa hồng theo cài đặt mặc định</span>
                </label>
                <label className={commissionMode === "custom" ? styles.cpRadioActive : styles.cpRadioIdle}>
                  <input type="radio" checked={commissionMode === "custom"} onChange={() => setCommissionMode("custom")} />
                  <strong>Tùy Chỉnh</strong>
                  <span>Hoa hồng tùy chỉnh</span>
                </label>
                <label className={commissionMode === "none" ? styles.cpRadioActive : styles.cpRadioIdle}>
                  <input type="radio" checked={commissionMode === "none"} onChange={() => setCommissionMode("none")} />
                  <strong>Không Hoa Hồng</strong>
                  <span>Không áp dụng hoa hồng</span>
                </label>
              </div>
            </div>
            {commissionMode !== "none" ? (
              <>
                <div className={styles.cpField}>
                  <label className={styles.cpLabel}>Đơn Vị Tính Hoa Hồng</label>
                  <div className={styles.cpInlineRadio}>
                    <label>
                      <input type="radio" checked={hhUnit === "VND"} onChange={() => setHhUnit("VND")} />
                      VND (Số tiền cố định)
                    </label>
                    <label>
                      <input type="radio" checked={hhUnit === "%"} onChange={() => setHhUnit("%")} />
                      % (Phần trăm)
                    </label>
                  </div>
                  {commissionMode === "default" ? (
                    <em className={styles.cpHintGreen}>✓ Đang sử dụng cài đặt mặc định của hệ thống</em>
                  ) : null}
                </div>
                <div className={styles.cpRow2}>
                  <div className={styles.cpField}>
                    <label className={styles.cpLabel}>Hoa Hồng Nhân Viên Bán Hàng ({hhUnit})</label>
                    <input className={styles.cpInput} value={hhSale} onChange={(e) => setHhSale(e.target.value)} placeholder="VD: 50000" type="number" disabled={commissionMode === "default"} />
                    <small>{(Number(hhSale) || 0).toLocaleString("vi-VN")} {hhUnit}/gói</small>
                  </div>
                  <div className={styles.cpField}>
                    <label className={styles.cpLabel}>Hoa Hồng Huấn Luyện Viên ({hhUnit})</label>
                    <input className={styles.cpInput} value={hhCoach} onChange={(e) => setHhCoach(e.target.value)} placeholder="VD: 30000" type="number" disabled={commissionMode === "default"} />
                    <small>{(Number(hhCoach) || 0).toLocaleString("vi-VN")} {hhUnit}/gói</small>
                  </div>
                </div>
                <div className={styles.cpTotalCallout}>
                  <strong>Tổng hoa hồng:</strong> {totalCommission.toLocaleString("vi-VN")} {hhUnit}
                </div>
              </>
            ) : null}
          </section>

          <section className={styles.cpPreview}>
            <h3>Xem Trước</h3>
            <div className={styles.cpPreviewRow}>
              <span>Tên gói:</span>
              <strong>{name || "---"}</strong>
            </div>
            <div className={styles.cpPreviewRow}>
              <span>Số buổi:</span>
              <strong>{sessions || 0} buổi</strong>
            </div>
            <div className={styles.cpPreviewRow}>
              <span>Thời hạn:</span>
              <strong>{duration} tháng</strong>
            </div>
            <div className={styles.cpPreviewRow}>
              <span>Giá gói (chưa VAT):</span>
              <strong className={styles.cpPreviewBlue}>{fmt(priceBeforeVat)}</strong>
            </div>
            <div className={styles.cpPreviewRow}>
              <span>VAT ({vat}%):</span>
              <strong className={styles.cpPreviewBlue}>+{fmt(vatAmount)}</strong>
            </div>
            <div className={`${styles.cpPreviewRow} ${styles.cpPreviewTotal}`}>
              <span>Tổng thanh toán:</span>
              <strong className={styles.cpPreviewBlue}>{fmt(priceAfter)}</strong>
            </div>
            <div className={styles.cpPreviewRow}>
              <span>Giá/buổi:</span>
              <strong className={styles.cpPreviewGreen}>{fmt(pricePerSession)}</strong>
            </div>
          </section>
        </div>

        <footer className={styles.cpFooter}>
          <button className={styles.cpSubmitBtn} onClick={submit} type="button">
            {isEdit ? "Cập Nhật Bảng Giá" : "Tạo Bảng Giá"}
          </button>
          <button className={styles.cpCancelBtn} onClick={onClose} type="button">Hủy</button>
        </footer>
      </section>
    </div>
  );
}

/* ---------------- Single Ticket Form ---------------- */

function SingleTicketFormModal({
  initial,
  onClose,
  onSubmit,
}: {
  initial: SingleTicket | null;
  onClose: () => void;
  onSubmit: (ticket: SingleTicket) => void;
}) {
  const isEdit = !!initial;
  const initVat = 8;
  const initWeekday = Number(initial?.prices.weekday.replace(/[^\d]/g, "")) || 0;
  const initWeekend = Number(initial?.prices.weekend.replace(/[^\d]/g, "")) || 0;
  const initHoliday = Number(initial?.prices.holiday.replace(/[^\d]/g, "")) || 0;

  const [code, setCode] = useState(initial?.code ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [duration, setDuration] = useState(initial?.durationHours?.match(/[\d.]+/)?.[0] ?? "4");
  const [serviceType, setServiceType] = useState<SingleTicket["serviceType"]>(initial?.serviceType ?? "Teetime");
  const [otherService, setOtherService] = useState("");
  const [serviceGroup, setServiceGroup] = useState("");
  const [staffCode, setStaffCode] = useState("");
  const [staffName, setStaffName] = useState("");
  const [desc, setDesc] = useState(initial?.desc ?? "");

  const [weekdayPrice, setWeekdayPrice] = useState(String(initWeekday));
  const [weekdayVat, setWeekdayVat] = useState(String(initVat));
  const [weekendPrice, setWeekendPrice] = useState(String(initWeekend));
  const [weekendVat, setWeekendVat] = useState(String(initVat));
  const [holidayPrice, setHolidayPrice] = useState(String(initHoliday));
  const [holidayVat, setHolidayVat] = useState(String(initVat));

  const [weekendDays, setWeekendDays] = useState<string[]>(["T7", "CN"]);
  const [holidays, setHolidays] = useState<string[]>([]);
  const [holidayInput, setHolidayInput] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [timeSlots, setTimeSlots] = useState<Array<{ start: string; end: string }>>([{ start: "", end: "" }]);
  const [activateNow, setActivateNow] = useState(true);
  const [error, setError] = useState("");

  const calcTotal = (price: string, vatPercent: string) => {
    const p = Number(price) || 0;
    const v = Number(vatPercent) || 0;
    return Math.round(p * (1 + v / 100));
  };

  const fmt = (n: number) => n.toLocaleString("vi-VN");

  const toggleDay = (d: string) =>
    setWeekendDays((c) => c.includes(d) ? c.filter((x) => x !== d) : [...c, d]);

  const addHoliday = () => {
    const trimmed = holidayInput.trim();
    if (!trimmed) return;
    setHolidays((c) => [...c, trimmed]);
    setHolidayInput("");
  };

  const removeHoliday = (i: number) =>
    setHolidays((c) => c.filter((_, idx) => idx !== i));

  const addTimeSlot = () =>
    setTimeSlots((c) => [...c, { start: "", end: "" }]);

  const updateTimeSlot = (i: number, key: "start" | "end", value: string) =>
    setTimeSlots((c) => c.map((s, idx) => idx === i ? { ...s, [key]: value } : s));

  const removeTimeSlot = (i: number) =>
    setTimeSlots((c) => c.filter((_, idx) => idx !== i));

  const submit = () => {
    if (!name.trim()) { setError("Tên bảng giá bắt buộc"); return; }
    onSubmit({
      code: initial?.code ?? (code || `T${String(Date.now()).slice(-3)}`),
      name,
      desc,
      serviceType,
      durationHours: serviceType === "Dịch vụ khác" ? "—" : `${duration} giờ`,
      status: activateNow ? "Hoạt động" : "Tạm ngưng",
      prices: {
        weekday: `${fmt(calcTotal(weekdayPrice, weekdayVat))} đ`,
        weekend: `${fmt(calcTotal(weekendPrice, weekendVat))} đ`,
        holiday: `${fmt(calcTotal(holidayPrice, holidayVat))} đ`,
        peak: initial?.prices.peak ?? `${fmt(calcTotal(holidayPrice, holidayVat))} đ`,
      },
      pillTimes: timeSlots.filter((t) => t.start || t.end).map((t) => `${t.start}-${t.end}`),
      effective: startDate && endDate ? `${startDate} - ${endDate}` : "01/01/2026 - 31/12/2026",
    });
  };

  return (
    <div className={styles.modalOverlay}>
      <section className={styles.ticketPriceModal}>
        <header className={styles.ticketPriceHeader}>
          <div>
            <h2>{isEdit ? "Chỉnh sửa bảng giá vé lẻ" : "Tạo bảng giá mới"}</h2>
            <p>{isEdit ? `Đang sửa ${initial?.code} — ${initial?.name}` : "Thêm bảng giá vé lẻ cho dịch vụ golf"}</p>
          </div>
          <button onClick={onClose} type="button"><X size={20} /></button>
        </header>
        <div className={styles.ticketPriceToolbar}>
          <span className={styles.ticketRequiredHint}><b>*</b> Thông tin bắt buộc</span>
          <div className={styles.ticketToolbarActions}>
            <button className={styles.cpCancelBtn} onClick={onClose} type="button">Hủy</button>
            <button className={styles.tpSaveBtn} onClick={submit} type="button">
              💾 Lưu bảng giá
            </button>
          </div>
        </div>

        <div className={styles.ticketPriceBody}>
          {error ? <p className={styles.formError}>{error}</p> : null}

          <section className={`${styles.tpSection} ${styles.tpBlue}`}>
            <h3>Thông tin cơ bản</h3>
            <div className={styles.tpField}>
              <label>Mã gói <b>*</b></label>
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="VD: T18S" />
            </div>
            <div className={styles.tpField}>
              <label>Tên bảng giá <b>*</b></label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Teetime 18 Holes - Standard" />
            </div>
            <div className={styles.tpField}>
              <label>Thời lượng (giờ) <b>*</b></label>
              <input value={duration} onChange={(e) => setDuration(e.target.value)} type="number" />
            </div>
            <div className={styles.tpField}>
              <label>Loại dịch vụ <b>*</b></label>
              <select value={serviceType} onChange={(e) => setServiceType(e.target.value as SingleTicket["serviceType"])}>
                <option>Teetime</option>
                <option>Practice</option>
                <option>Dịch vụ khác</option>
              </select>
            </div>
            <div className={styles.tpField}>
              <div className={styles.tpFieldHead}>
                <label>Dịch vụ khác</label>
                <button type="button" className={styles.cpAddLink} onClick={() => alert("Thêm dịch vụ khác")}>
                  <Plus size={12} /> Thêm dịch vụ khác
                </button>
              </div>
              <input value={otherService} onChange={(e) => setOtherService(e.target.value)} placeholder="Nhập tên dịch vụ khác" />
            </div>
            <div className={styles.tpField}>
              <div className={styles.tpFieldHead}>
                <label>Nhóm dịch vụ</label>
                <button type="button" className={styles.cpAddLink} onClick={() => alert("Thêm nhóm")}>
                  <Plus size={12} /> Thêm nhóm
                </button>
              </div>
              <input value={serviceGroup} onChange={(e) => setServiceGroup(e.target.value)} placeholder="Nhập tên nhóm dịch vụ" />
            </div>
            <div className={styles.tpRow2}>
              <div className={styles.tpField}>
                <label># Mã nhân viên</label>
                <input value={staffCode} onChange={(e) => setStaffCode(e.target.value)} placeholder="VD: NV001" />
              </div>
              <div className={styles.tpField}>
                <label>👤 Nhân viên</label>
                <input value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="VD: Nguyễn Văn A" />
              </div>
            </div>
            <div className={styles.tpField}>
              <label>Mô tả <b>*</b></label>
              <textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Mô tả chi tiết về bảng giá này..." />
            </div>
          </section>

          <section className={`${styles.tpSection} ${styles.tpGreen}`}>
            <h3>Bảng giá</h3>
            <div className={`${styles.tpTier} ${styles.tpTierWeekday}`}>
              <h4>Giá ngày thường <b>*</b></h4>
              <div className={styles.tpTier3Col}>
                <div className={styles.tpField}>
                  <label>Đơn giá (VND) <b>*</b></label>
                  <input value={weekdayPrice} onChange={(e) => setWeekdayPrice(e.target.value)} type="number" placeholder="0" />
                </div>
                <div className={styles.tpField}>
                  <label>VAT (%)</label>
                  <input value={weekdayVat} onChange={(e) => setWeekdayVat(e.target.value)} type="number" placeholder="0" />
                </div>
                <div className={styles.tpField}>
                  <label>Thành tiền (VND)</label>
                  <input value={fmt(calcTotal(weekdayPrice, weekdayVat))} readOnly className={styles.tpReadonly} />
                </div>
              </div>
            </div>
            <div className={`${styles.tpTier} ${styles.tpTierWeekend}`}>
              <h4>Giá cuối tuần <b>*</b></h4>
              <div className={styles.tpTier3Col}>
                <div className={styles.tpField}>
                  <label>Đơn giá (VND) <b>*</b></label>
                  <input value={weekendPrice} onChange={(e) => setWeekendPrice(e.target.value)} type="number" placeholder="0" />
                </div>
                <div className={styles.tpField}>
                  <label>VAT (%)</label>
                  <input value={weekendVat} onChange={(e) => setWeekendVat(e.target.value)} type="number" placeholder="0" />
                </div>
                <div className={styles.tpField}>
                  <label>Thành tiền (VND)</label>
                  <input value={fmt(calcTotal(weekendPrice, weekendVat))} readOnly className={styles.tpReadonly} />
                </div>
              </div>
            </div>
            <div className={`${styles.tpTier} ${styles.tpTierHoliday}`}>
              <h4>Giá lễ/Tết <b>*</b></h4>
              <div className={styles.tpTier3Col}>
                <div className={styles.tpField}>
                  <label>Đơn giá (VND) <b>*</b></label>
                  <input value={holidayPrice} onChange={(e) => setHolidayPrice(e.target.value)} type="number" placeholder="0" />
                </div>
                <div className={styles.tpField}>
                  <label>VAT (%)</label>
                  <input value={holidayVat} onChange={(e) => setHolidayVat(e.target.value)} type="number" placeholder="0" />
                </div>
                <div className={styles.tpField}>
                  <label>Thành tiền (VND)</label>
                  <input value={fmt(calcTotal(holidayPrice, holidayVat))} readOnly className={styles.tpReadonly} />
                </div>
              </div>
            </div>
          </section>

          <section className={`${styles.tpSection} ${styles.tpPurple}`}>
            <h3>Quy tắc áp dụng giá</h3>
            <div className={`${styles.tpTier} ${styles.tpTierWeekend}`}>
              <h4>Ngày cuối tuần áp dụng</h4>
              <div className={styles.tpDayPills}>
                {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => {
                  const labels: Record<string, string> = { T2: "Thứ 2", T3: "Thứ 3", T4: "Thứ 4", T5: "Thứ 5", T6: "Thứ 6", T7: "Thứ 7", CN: "Chủ nhật" };
                  return (
                    <button
                      className={weekendDays.includes(d) ? styles.tpDayActive : styles.tpDayIdle}
                      key={d}
                      onClick={() => toggleDay(d)}
                      type="button"
                    >
                      {labels[d]}
                    </button>
                  );
                })}
              </div>
              <small className={styles.tpHint}>Đã chọn: {weekendDays.length} ngày</small>
            </div>
            <div className={`${styles.tpTier} ${styles.tpTierHoliday}`}>
              <h4>Danh sách ngày lễ/Tết</h4>
              <div className={styles.tpHolidayInput}>
                <input
                  value={holidayInput}
                  onChange={(e) => setHolidayInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addHoliday(); } }}
                  placeholder="VD: 01/01/2026 — Tết Dương lịch"
                />
                <button onClick={addHoliday} className={holidayInput.trim() ? styles.cpSubmitBtn : styles.cpCancelBtn} type="button" disabled={!holidayInput.trim()}>
                  + Thêm
                </button>
              </div>
              {holidays.length === 0 ? (
                <p className={styles.tpEmptyHint}>Chưa có ngày lễ/Tết nào được thêm</p>
              ) : (
                <div className={styles.tpHolidayList}>
                  {holidays.map((h, i) => (
                    <span className={styles.holidayChip} key={`${h}-${i}`}>
                      {h} <button onClick={() => removeHoliday(i)} type="button"><X size={12} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className={`${styles.tpSection} ${styles.tpAmber}`}>
            <h3>Thời gian hiệu lực</h3>
            <div className={styles.tpRow2}>
              <div className={styles.tpField}>
                <label>Ngày bắt đầu <b>*</b></label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className={styles.tpField}>
                <label>Ngày kết thúc <b>*</b></label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          </section>

          <section className={`${styles.tpSection} ${styles.tpRed}`}>
            <div className={styles.tpSectionHead}>
              <h3>Khung giờ áp dụng</h3>
              <button className={styles.cpSubmitBtn} onClick={addTimeSlot} type="button">
                <Plus size={14} /> Thêm khung giờ
              </button>
            </div>
            {timeSlots.map((slot, i) => (
              <div className={styles.tpTimeRow} key={i}>
                <span>Khung {i + 1}</span>
                <input value={slot.start} onChange={(e) => updateTimeSlot(i, "start", e.target.value)} placeholder="06:00" type="time" />
                <span>→</span>
                <input value={slot.end} onChange={(e) => updateTimeSlot(i, "end", e.target.value)} placeholder="22:00" type="time" />
                {timeSlots.length > 1 ? (
                  <button onClick={() => removeTimeSlot(i)} type="button" className={styles.deleteIcon} aria-label="Xóa khung giờ">
                    <Trash2 size={14} />
                  </button>
                ) : null}
              </div>
            ))}
          </section>

          <section className={`${styles.tpSection} ${styles.tpGreen}`}>
            <h3>Trạng thái</h3>
            <label className={styles.tpStatusCheck}>
              <input type="checkbox" checked={activateNow} onChange={(e) => setActivateNow(e.target.checked)} />
              <span>Kích hoạt bảng giá ngay khi tạo</span>
            </label>
            <small className={styles.tpHint}>
              {activateNow
                ? "Bảng giá sẽ ngay lập tức xuất hiện trong form bán vé sau khi lưu"
                : "Bảng giá sẽ ở trạng thái Tạm ngưng — phải bật kích hoạt thủ công sau"}
            </small>
          </section>
        </div>
      </section>
    </div>
  );
}

/* ---------------- Delete Modal ---------------- */

function TogglePricingStatusModal({
  code,
  kind,
  name,
  onCancel,
  onConfirm,
  status,
  usage,
}: {
  code: string;
  kind: "package" | "ticket";
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
  status: "Hoạt động" | "Tạm ngưng";
  usage: number;
}) {
  const isActivating = status === "Tạm ngưng";
  const label = kind === "package" ? "bảng giá Hợp đồng" : "bảng giá Vé lẻ";
  const moduleRef = kind === "package" ? "Module 03 (Hợp đồng)" : "Module 04 (Vé lẻ)";
  const usageNoun = kind === "package" ? "HĐ" : "vé đã bán";

  return (
    <div className={styles.modalOverlay}>
      <section className={`${styles.toggleStatusModal} ${isActivating ? styles.toggleStatusActivating : styles.toggleStatusPausing}`}>
        <header className={styles.toggleStatusHeader}>
          <div className={styles.toggleStatusIcon}>
            {isActivating ? <AlertCircle size={26} /> : <Power size={26} />}
          </div>
          <div>
            <h2>{isActivating ? `Bật kích hoạt ${label}` : `Hủy kích hoạt ${label}`}</h2>
            <p>{code} — {name}</p>
          </div>
          <button className={styles.deleteClose} onClick={onCancel} type="button"><X size={20} /></button>
        </header>

        <div className={styles.toggleStatusBody}>
          {isActivating ? (
            <>
              <p>
                Bạn có chắc muốn <strong>bật kích hoạt</strong> {label} này? Sau khi kích hoạt:
              </p>
              <ul className={styles.toggleStatusBullets}>
                <li>✓ {label.charAt(0).toUpperCase() + label.slice(1)} sẽ xuất hiện trong form bán {moduleRef}</li>
                <li>✓ Sale / Lễ tân có thể chọn {label} này khi tạo mới</li>
                <li>✓ Trạng thái <strong>Tạm ngưng</strong> sẽ chuyển thành <strong>Hoạt động</strong></li>
              </ul>
              <div className={styles.toggleStatusInfoCard}>
                <span>Đã có {usage} {usageNoun} dùng {label} này — không bị ảnh hưởng khi đổi trạng thái.</span>
              </div>
            </>
          ) : (
            <>
              <p>
                Bạn có chắc muốn <strong>hủy kích hoạt</strong> {label} này? Khi tạm ngưng:
              </p>
              <ul className={styles.toggleStatusBullets}>
                <li>✗ {label.charAt(0).toUpperCase() + label.slice(1)} <strong>không còn hiển thị</strong> trong form bán {moduleRef}</li>
                <li>✓ {usage} {usageNoun} đang dùng {label} <strong>không bị ảnh hưởng</strong></li>
                <li>✓ Có thể bật lại bất kỳ lúc nào</li>
              </ul>
              <div className={styles.toggleStatusWarnCard}>
                <AlertCircle size={16} />
                <span>Sale + Lễ tân sẽ không bán được {kind === "package" ? "gói này cho HĐ mới" : "vé này"} sau khi tạm ngưng.</span>
              </div>
            </>
          )}
        </div>

        <footer className={styles.deleteFooter}>
          <button onClick={onCancel} type="button">Hủy bỏ</button>
          <button
            className={isActivating ? styles.dangerButton : styles.blueButton}
            onClick={onConfirm}
            type="button"
          >
            <Power size={16} />
            {isActivating ? "Kích hoạt" : "Hủy kích hoạt"}
          </button>
        </footer>
      </section>
    </div>
  );
}

function DeletePricingModal({
  code,
  kind,
  name,
  onCancel,
  onConfirm,
}: {
  code: string;
  kind: "package" | "ticket";
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const label = kind === "package" ? "Bảng giá Hợp đồng" : "Bảng giá Vé lẻ";
  return (
    <div className={styles.modalOverlay}>
      <section className={styles.deleteModal}>
        <header className={styles.deleteHeader}>
          <div className={styles.deleteIcon}><AlertCircle size={28} /></div>
          <div>
            <h2>Xác nhận xóa {label.toLowerCase()}</h2>
            <p>Theo BR-M9-08 — Soft Delete 30 ngày</p>
          </div>
          <button className={styles.deleteClose} onClick={onCancel} type="button"><X size={20} /></button>
        </header>
        <div className={styles.deleteBody}>
          <div className={styles.deleteWarning}>
            <strong>⚠ Bảng giá sẽ chuyển vào Thùng rác Module 12</strong>
            <span>
              {kind === "package"
                ? "Chỉ xóa được bảng giá CHƯA dùng trong HĐ nào. Nếu đã có HĐ, hệ thống sẽ BLOCK và liệt kê N HĐ đang dùng."
                : "Vé lẻ active sẽ bị tạm ngưng trước khi xóa. Có thể khôi phục trong 30 ngày từ Module 12 → Thùng rác."}
            </span>
          </div>
          <section className={styles.deleteCustomerCard}>
            <h3>Thông tin {label.toLowerCase()} sẽ xóa</h3>
            <div className={styles.deleteCustomerGrid}>
              <div><span>Mã</span><strong className={styles.memberCode}>{code}</strong></div>
              <div><span>Tên</span><strong>{name}</strong></div>
            </div>
          </section>
        </div>
        <footer className={styles.deleteFooter}>
          <button onClick={onCancel} type="button">Hủy bỏ</button>
          <button className={styles.dangerButton} onClick={onConfirm} type="button">
            <Trash2 size={16} /> Xác nhận xóa
          </button>
        </footer>
      </section>
    </div>
  );
}

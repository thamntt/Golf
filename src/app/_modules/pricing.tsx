"use client";

import { useState, type FormEvent } from "react";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  Download,
  Edit,
  Eye,
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
  checkinMode: string;
  devices: string;
  status: "Hoạt động" | "Tạm ngưng";
};

type TimeSlot = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  duration: string;
  days: string;
  branches: string;
  color: string;
  status: "Hoạt động" | "Tạm ngưng";
};

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
  { code: "ZONE-DR-01", name: "Khu Driving Range chính", zoneType: "Driving Range", branch: "NextVision", area: "1.200 m²", capacity: 50, checkinMode: "Cả hai", devices: "Cổng 01 (FaceID)", status: "Hoạt động" },
  { code: "ZONE-PG-01", name: "Putting Green A", zoneType: "Putting Green", branch: "NextVision", area: "250 m²", capacity: 12, checkinMode: "Quay lễ tân", devices: "—", status: "Hoạt động" },
  { code: "ZONE-BI-01", name: "Bay Indoor 1", zoneType: "Bay Indoor", branch: "NextVision", area: "80 m²", capacity: 4, checkinMode: "Kiểm soát cửa", devices: "FaceID-Bay1", status: "Hoạt động" },
  { code: "ZONE-S9-01", name: "Sân 9 lỗ A", zoneType: "Sân 9 lỗ", branch: "NextVision", area: "18.000 m²", capacity: 36, checkinMode: "Cả hai", devices: "Cổng sân 9", status: "Hoạt động" },
  { code: "ZONE-PG-02", name: "Putting Green B (đang nâng cấp)", zoneType: "Putting Green", branch: "NextVision", area: "200 m²", capacity: 10, checkinMode: "Quay lễ tân", devices: "—", status: "Tạm ngưng" },
];

const INITIAL_TIMESLOTS: TimeSlot[] = [
  { id: "TS-01", name: "Sáng sớm ngày thường", startTime: "06:00", endTime: "09:00", duration: "3 giờ", days: "Thứ 2 - Thứ 6", branches: "NextVision", color: "blue", status: "Hoạt động" },
  { id: "TS-02", name: "Buổi trưa", startTime: "11:00", endTime: "14:00", duration: "3 giờ", days: "Tất cả ngày", branches: "NextVision", color: "amber", status: "Hoạt động" },
  { id: "TS-03", name: "Giờ cao điểm chiều", startTime: "17:00", endTime: "20:00", duration: "3 giờ", days: "Thứ 2 - Thứ 6", branches: "NextVision", color: "red", status: "Hoạt động" },
  { id: "TS-04", name: "Cuối tuần cả ngày", startTime: "06:00", endTime: "21:30", duration: "15 giờ 30 phút", days: "Thứ 7 - Chủ nhật", branches: "NextVision", color: "purple", status: "Hoạt động" },
  { id: "TS-05", name: "Tối khuya", startTime: "20:00", endTime: "23:00", duration: "3 giờ", days: "Tất cả ngày", branches: "NextVision", color: "gray", status: "Tạm ngưng" },
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
            onToggleStatus={togglePackageStatus}
          />
        ) : (
          <TicketGrid
            onDelete={(t) => setDeleteTarget({ kind: "ticket", code: t.code, name: t.name })}
            onEdit={openEditTicket}
            onToggleStatus={toggleTicketStatus}
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
              <th>Số Buổi / Thời Hạn</th>
              <th>Giá Gói</th>
              <th>Trạng Thái</th>
              <th>Sử Dụng</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {packages.length === 0 ? (
              <tr>
                <td className={styles.emptyTableCell} colSpan={9}>
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
                  <td><strong>{p.sessions}</strong><div className={styles.cellMuted}>/ {p.duration}</div></td>
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

  const filtered = zones.filter((z) =>
    !search || `${z.code} ${z.name}`.toLowerCase().includes(search.toLowerCase())
  );

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
                <th>TRẠNG THÁI</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((z) => (
                <tr key={z.code}>
                  <td>
                    <strong>{z.name}</strong>
                    <div className={styles.cellMuted}>{z.code}</div>
                  </td>
                  <td><span className={styles.zoneTypeBadge}>{z.zoneType}</span></td>
                  <td><strong>{z.area}</strong><div className={styles.cellMuted}>{z.capacity} người</div></td>
                  <td><span className={styles.checkinPill}>{z.checkinMode}</span></td>
                  <td>{z.devices}</td>
                  <td><StatusBadge status={z.status} /></td>
                  <td>
                    <div className={styles.tableActions}>
                      <button onClick={() => { setEditing(z); setFormOpen(true); }} title="Sửa" type="button"><Pencil size={15} /></button>
                      <button className={styles.tableActionDanger} onClick={() => removeZone(z.code)} title="Xóa" type="button"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.pricingMgmtFooter}>
          <span>Hiển thị {filtered.length} / {zones.length} khu vực</span>
          <span>{zones.filter((z) => z.status === "Hoạt động").length} đang hoạt động</span>
        </div>
      </section>

      {formOpen ? (
        <ZoneFormModal
          existing={editing}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSubmit={submit}
        />
      ) : null}
    </div>
  );
}

function ZoneFormModal({
  existing,
  onClose,
  onSubmit,
}: {
  existing: Zone | null;
  onClose: () => void;
  onSubmit: (zone: Zone) => void;
}) {
  const isEdit = !!existing;
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    if (!name) { setError("Tên khu vực bắt buộc"); return; }

    onSubmit({
      code: existing?.code ?? `ZONE-${(data.get("zoneType") as string ?? "X").substring(0, 2).toUpperCase()}-${String(Date.now()).slice(-3)}`,
      name,
      zoneType: (data.get("zoneType") as ZoneType) ?? "Driving Range",
      branch: String(data.get("branch") ?? "NextVision"),
      area: String(data.get("area") ?? "0 m²"),
      capacity: Number(data.get("capacity") ?? 0),
      checkinMode: String(data.get("checkinMode") ?? "Quay lễ tân"),
      devices: String(data.get("devices") ?? "—") || "—",
      status: existing?.status ?? "Hoạt động",
    });
  };

  return (
    <div className={styles.nestedOverlay}>
      <form className={styles.smallModal} onSubmit={handleSubmit} style={{ width: 560 }}>
        <header>
          <h2>{isEdit ? "Chỉnh sửa khu vực" : "Thêm khu vực mới"}</h2>
          <button onClick={onClose} type="button"><X size={20} /></button>
        </header>
        <div className={styles.smallModalBody}>
          {error ? <p className={styles.formError}>{error}</p> : null}
          <FormField label="Mã khu vực" name="code" value={existing?.code ?? "ZONE-XX-AUTO"} />
          <FormField defaultValue={existing?.name} label="Tên khu vực" name="name" placeholder="VD: Khu Driving Range chính" required />
          <SelectField defaultValue={existing?.zoneType} label="Loại khu vực" name="zoneType" options={["Driving Range", "Putting Green", "Bay Indoor", "Sân 9 lỗ", "Sân 18 lỗ"]} />
          <SelectField defaultValue={existing?.branch} label="Chi nhánh" name="branch" options={["NextVision", "Hà Nội Center", "Sài Gòn West"]} />
          <div className={styles.formGrid}>
            <FormField defaultValue={existing?.area} label="Diện tích (m²)" name="area" placeholder="VD: 1.200 m²" />
            <FormField defaultValue={existing?.capacity ? String(existing.capacity) : ""} label="Sức chứa (người)" name="capacity" placeholder="VD: 50" type="number" />
          </div>
          <SelectField defaultValue={existing?.checkinMode} label="Phương thức Check-in" name="checkinMode" options={["Kiểm soát cửa", "Quay lễ tân", "Cả hai"]} />
          <FormField defaultValue={existing?.devices} label="Thiết bị kiểm soát cửa" name="devices" placeholder="VD: Cổng 01 (FaceID), Bay-Reader-2" />
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

/* ---------------- Timeslot Management ---------------- */

function TimeslotManagementModal({
  timeslots,
  onClose,
  onUpdate,
}: {
  timeslots: TimeSlot[];
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
                  <td>{s.days}</td>
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
        />
      ) : null}
    </div>
  );
}

function TimeslotFormModal({
  existing,
  onClose,
  onSubmit,
}: {
  existing: TimeSlot | null;
  onClose: () => void;
  onSubmit: (slot: TimeSlot) => void;
}) {
  const isEdit = !!existing;
  const [color, setColor] = useState(existing?.color ?? "blue");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const start = String(data.get("startTime") ?? "");
    const end = String(data.get("endTime") ?? "");
    if (!name) { setError("Tên khung giờ bắt buộc"); return; }
    if (start >= end) { setError("Giờ kết thúc phải > Giờ bắt đầu (BR-M9-20)"); return; }

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
      days: String(data.get("days") ?? "Tất cả ngày"),
      branches: String(data.get("branches") ?? "NextVision"),
      color,
      status: existing?.status ?? "Hoạt động",
    });
  };

  const colors = ["blue", "amber", "red", "purple", "green", "pink", "orange", "gray", "cyan", "lime"];

  return (
    <div className={styles.nestedOverlay}>
      <form className={styles.smallModal} onSubmit={handleSubmit} style={{ width: 560 }}>
        <header>
          <h2>{isEdit ? "Chỉnh sửa khung giờ" : "Thêm khung giờ mới"}</h2>
          <button onClick={onClose} type="button"><X size={20} /></button>
        </header>
        <div className={styles.smallModalBody}>
          {error ? <p className={styles.formError}>{error}</p> : null}
          <FormField defaultValue={existing?.name} label="Tên khung giờ" name="name" placeholder="VD: Sáng sớm thứ 2-6" required />
          <div className={styles.formGrid}>
            <FormField defaultValue={existing?.startTime ?? "06:00"} label="Giờ bắt đầu" name="startTime" type="time" />
            <FormField defaultValue={existing?.endTime ?? "09:00"} label="Giờ kết thúc" name="endTime" type="time" />
          </div>
          <SelectField defaultValue={existing?.days} label="Ngày áp dụng" name="days" options={["Tất cả ngày", "Thứ 2 - Thứ 6", "Thứ 7 - Chủ nhật"]} />
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
  const [packageMode, setPackageMode] = useState<"fixed" | "flex">("fixed");
  const [commissionMode, setCommissionMode] = useState<"default" | "custom" | "none">("default");
  const [selectedZones, setSelectedZones] = useState<string[]>(zones.map((z) => z.code));
  const [selectedSlots, setSelectedSlots] = useState<string[]>(timeslots.map((t) => t.id));
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    if (!name) { setError("Tên gói bắt buộc"); return; }

    onSubmit({
      code: initial?.code ?? `P${String(Date.now()).slice(-3)}`,
      name,
      desc: String(data.get("desc") ?? ""),
      serviceType: String(data.get("serviceType") ?? "Member - Golf"),
      branch: String(data.get("branch") ?? "NextVision"),
      sessions: packageMode === "flex" ? "Theo buổi" : `${data.get("sessions") ?? "8"} buổi`,
      duration: `${data.get("duration") ?? "1"} tháng`,
      price: `${data.get("price") ?? "0"} đ${packageMode === "flex" ? "/buổi" : ""}`,
      status: initial?.status ?? "Hoạt động",
      usage: initial?.usage ?? 0,
    });
  };

  const toggleZone = (code: string) =>
    setSelectedZones((c) => c.includes(code) ? c.filter((z) => z !== code) : [...c, code]);
  const toggleSlot = (id: string) =>
    setSelectedSlots((c) => c.includes(id) ? c.filter((s) => s !== id) : [...c, id]);

  return (
    <div className={styles.modalOverlay}>
      <form className={styles.modalShell} onSubmit={handleSubmit}>
        <header className={styles.modalHeader}>
          <div>
            <h2>{isEdit ? "Chỉnh sửa Bảng giá Hợp đồng" : "Tạo Bảng giá Hợp đồng mới"}</h2>
            <p>{isEdit ? `Đang sửa ${initial?.code} — sửa giá chỉ áp dụng cho HĐ ký mới sau (BR-M9-07)` : "Form gồm 11 section. Tham khảo SRS Module 02 để cấu hình đầy đủ."}</p>
          </div>
          <button onClick={onClose} type="button"><X size={22} /></button>
        </header>

        <div className={styles.modalBody}>
          {error ? <p className={styles.formError}>{error}</p> : null}

          <h3>1. Thông tin gói</h3>
          <div className={styles.formGrid}>
            <FormField label="Mã gói" name="code" value={initial?.code ?? "PKG-AUTO"} />
            <FormField defaultValue={initial?.name} label="Tên gói" name="name" placeholder="VD: Gói Cao Cấp Golf" required />
          </div>
          <FormField area defaultValue={initial?.desc} label="Mô tả" name="desc" placeholder="Mô tả chi tiết + điều khoản" />

          <h3>2. Phân loại</h3>
          <div className={styles.formGrid}>
            <SelectField defaultValue={initial?.serviceType} label="Loại Dịch Vụ" name="serviceType" options={["Member - Golf", "Practice", "Combo", "Trial"]} />
            <SelectField defaultValue={initial?.branch} label="Chi nhánh" name="branch" options={["NextVision", "Hà Nội Center", "Sài Gòn West"]} />
          </div>

          <h3>3. Chế độ gói (BR-M9-15)</h3>
          <div className={styles.modeToggle}>
            <button
              className={packageMode === "fixed" ? styles.modeActive : styles.modeIdle}
              onClick={() => setPackageMode("fixed")}
              type="button"
            >
              <strong>Gói Cố Định</strong>
              <span>Pay upfront, đủ 8 field</span>
            </button>
            <button
              className={packageMode === "flex" ? styles.modeActive : styles.modeIdle}
              onClick={() => setPackageMode("flex")}
              type="button"
            >
              <strong>Gói Linh Hoạt</strong>
              <span>Pay per use, rút gọn 4 field</span>
            </button>
          </div>

          <h3>4. Cấu hình giá & buổi</h3>
          <div className={styles.formGrid}>
            <SelectField label="Đơn vị tính" name="unit" options={["Buổi", "Giờ", "Ngày", "Tháng"]} />
            <FormField defaultValue={initial?.duration?.match(/\d+/)?.[0]} label="Thời hạn (tháng)" name="duration" placeholder="VD: 3" type="number" />
            <SelectField label="VAT (%)" name="vat" options={["0%", "5%", "8%", "10%"]} />
            {packageMode === "fixed" ? (
              <>
                <FormField defaultValue={initial?.sessions?.match(/\d+/)?.[0]} label="Số lượng buổi" name="sessions" placeholder="VD: 8" type="number" />
                <FormField label="Giá sau VAT (VNĐ)" name="price" placeholder="VD: 5500000" type="number" />
              </>
            ) : (
              <FormField label="Giá theo đơn vị (VNĐ)" name="price" placeholder="VD: 250000" type="number" />
            )}
          </div>

          {packageMode === "fixed" ? (
            <>
              <h3>6. Khu vực áp dụng <span className={styles.sectionHint}>Default tick tất cả khu vực của chi nhánh (BR-M9-22)</span></h3>
              <div className={styles.checkGrid}>
                {zones.map((z) => (
                  <label className={styles.checkPill} key={z.code}>
                    <input
                      checked={selectedZones.includes(z.code)}
                      onChange={() => toggleZone(z.code)}
                      type="checkbox"
                    />
                    <span>{z.name}</span>
                  </label>
                ))}
              </div>

              <h3>7. Khung giờ áp dụng</h3>
              <div className={styles.checkGrid}>
                {timeslots.map((s) => (
                  <label className={styles.checkPill} key={s.id}>
                    <input
                      checked={selectedSlots.includes(s.id)}
                      onChange={() => toggleSlot(s.id)}
                      type="checkbox"
                    />
                    <span><span className={`${styles.colorDot} ${styles[`dot_${s.color}`]}`} /> {s.name}</span>
                  </label>
                ))}
              </div>

              <h3>8. Điều kiện sử dụng</h3>
              <div className={styles.formGrid}>
                <FormField label="Giới hạn / ngày" name="limitDay" placeholder="0 = không giới hạn" type="number" />
                <FormField label="Giới hạn / tuần" name="limitWeek" placeholder="0 = không giới hạn" type="number" />
                <FormField label="Giới hạn / tháng" name="limitMonth" placeholder="0 = không giới hạn" type="number" />
                <FormField label="Đặt trước tối thiểu (giờ)" name="minBook" placeholder="VD: 12" type="number" />
                <FormField label="Chính sách hủy (giờ)" name="cancelHours" placeholder="VD: 24" type="number" />
                <label className={styles.transferableLabel}>
                  <input type="checkbox" />
                  <span>Cho phép chuyển nhượng</span>
                </label>
              </div>

              <h3>9. Tiện ích</h3>
              <div className={styles.checkGrid}>
                {["Khăn lau gậy", "Tủ để gậy", "Trà bánh nhẹ", "Khăn nóng", "Đồ uống miễn phí"].map((u) => (
                  <label className={styles.checkPill} key={u}>
                    <input type="checkbox" />
                    <span>{u}</span>
                  </label>
                ))}
              </div>
            </>
          ) : null}

          <h3>10. Hoa hồng (BR-M9-26)</h3>
          <p className={styles.sectionHint}>Hoa hồng LUÔN tính trên giá trước VAT (HH = Giá_trước_VAT × rate%)</p>
          <div className={styles.modeToggle}>
            <button className={commissionMode === "default" ? styles.modeActive : styles.modeIdle} onClick={() => setCommissionMode("default")} type="button">
              <strong>Mặc Định</strong>
              <span>Lấy từ ma trận Module 11</span>
            </button>
            <button className={commissionMode === "custom" ? styles.modeActive : styles.modeIdle} onClick={() => setCommissionMode("custom")} type="button">
              <strong>Tùy Chỉnh</strong>
              <span>Override riêng cho gói này</span>
            </button>
            <button className={commissionMode === "none" ? styles.modeActive : styles.modeIdle} onClick={() => setCommissionMode("none")} type="button">
              <strong>Không HH</strong>
              <span>Gói nội bộ / dùng thử</span>
            </button>
          </div>
          {commissionMode === "custom" ? (
            <div className={styles.formGrid}>
              <SelectField label="Đơn vị" name="hhUnit" options={["%", "VNĐ"]} />
              <FormField label="HH Sale" name="hhSale" placeholder="VD: 5" type="number" />
              <FormField label="HH HLV" name="hhCoach" placeholder="VD: 3" type="number" />
            </div>
          ) : null}

          <h3>11. Preview</h3>
          <div className={styles.pricingPreview}>
            <div><span>Tên gói</span><strong>{initial?.name ?? "Gói mới"}</strong></div>
            <div><span>Số buổi / Thời hạn</span><strong>{packageMode === "flex" ? "Theo buổi" : "8 buổi"} / {initial?.duration ?? "1 tháng"}</strong></div>
            <div><span>Giá (chưa VAT)</span><strong>{initial?.price?.replace(/\D+\d*/, "") ?? "—"}</strong></div>
            <div><span>VAT (8%)</span><strong>0 đ</strong></div>
            <div><span>Tổng thanh toán</span><strong className={styles.previewTotal}>{initial?.price ?? "—"}</strong></div>
            <div><span>Giá / buổi</span><strong className={styles.previewPerSession}>—</strong></div>
          </div>
        </div>

        <footer className={styles.modalFooter}>
          <button onClick={onClose} type="button">Hủy bỏ</button>
          <button className={styles.blueButton} type="submit">{isEdit ? "Cập nhật" : "Lưu bảng giá"}</button>
        </footer>
      </form>
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
  const [serviceType, setServiceType] = useState<SingleTicket["serviceType"]>(initial?.serviceType ?? "Teetime");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    if (!name) { setError("Tên bảng giá bắt buộc"); return; }
    onSubmit({
      code: initial?.code ?? `T${String(Date.now()).slice(-3)}`,
      name,
      desc: String(data.get("desc") ?? ""),
      serviceType,
      durationHours: serviceType === "Dịch vụ khác" ? "—" : `${data.get("duration") ?? "1"} giờ`,
      status: initial?.status ?? "Hoạt động",
      prices: {
        weekday: `${data.get("weekday") ?? "0"} đ`,
        weekend: `${data.get("weekend") ?? "0"} đ`,
        holiday: `${data.get("holiday") ?? "0"} đ`,
        peak: `${data.get("peak") ?? "0"} đ`,
      },
      pillTimes: initial?.pillTimes ?? ["06-21h"],
      effective: String(data.get("effective") ?? "01/01/2026 - 31/12/2026"),
    });
  };

  return (
    <div className={styles.modalOverlay}>
      <form className={styles.modalShell} onSubmit={handleSubmit}>
        <header className={styles.modalHeader}>
          <div>
            <h2>{isEdit ? "Chỉnh sửa Bảng giá Vé lẻ" : "Tạo Bảng giá Vé lẻ mới"}</h2>
            <p>4 tier giá theo BR-M9-11 (Ngày thường / Cuối tuần / Lễ-Tết / Giờ cao điểm)</p>
          </div>
          <button onClick={onClose} type="button"><X size={22} /></button>
        </header>

        <div className={styles.modalBody}>
          {error ? <p className={styles.formError}>{error}</p> : null}

          <h3>1. Thông tin vé</h3>
          <div className={styles.formGrid}>
            <FormField label="Mã" name="code" value={initial?.code ?? "T-AUTO"} />
            <FormField defaultValue={initial?.name} label="Tên bảng giá" name="name" placeholder="VD: Teetime 18 Holes - Standard" required />
          </div>
          <FormField area defaultValue={initial?.desc} label="Mô tả" name="desc" placeholder="Mô tả chi tiết..." />

          <h3>2. Loại dịch vụ</h3>
          <div className={styles.modeToggle}>
            {(["Teetime", "Practice", "Dịch vụ khác"] as const).map((s) => (
              <button
                className={serviceType === s ? styles.modeActive : styles.modeIdle}
                key={s}
                onClick={() => setServiceType(s)}
                type="button"
              >
                <strong>{s}</strong>
                <span>{s === "Dịch vụ khác" ? "Không có thời lượng (BR-M9-09)" : `Có thời lượng tính theo giờ`}</span>
              </button>
            ))}
          </div>

          {serviceType !== "Dịch vụ khác" ? (
            <div className={styles.formGrid}>
              <FormField defaultValue={initial?.durationHours?.match(/[\d.]+/)?.[0]} label="Thời lượng (giờ)" name="duration" placeholder="VD: 4" type="number" />
              <FormField defaultValue={initial?.effective} label="Ngày hiệu lực" name="effective" placeholder="01/01/2026 - 31/12/2026" />
            </div>
          ) : null}

          <h3>3. Bảng 4 tier giá (BR-M9-11)</h3>
          <div className={styles.tierForm}>
            <TierFormCell label="Ngày thường" name="weekday" placeholder="850000" tone="green" defaultValue={initial?.prices.weekday.match(/[\d.]+/)?.[0].replace(/\./g, "")} />
            <TierFormCell label="Cuối tuần" name="weekend" placeholder="1200000" tone="blue" defaultValue={initial?.prices.weekend.match(/[\d.]+/)?.[0].replace(/\./g, "")} />
            <TierFormCell label="Lễ / Tết" name="holiday" placeholder="1500000" tone="amber" defaultValue={initial?.prices.holiday.match(/[\d.]+/)?.[0].replace(/\./g, "")} />
            <TierFormCell label="Giờ cao điểm" name="peak" placeholder="1600000" tone="red" defaultValue={initial?.prices.peak.match(/[\d.]+/)?.[0].replace(/\./g, "")} />
          </div>

          <h3>4. Ngày cuối tuần áp dụng</h3>
          <div className={styles.dayPills}>
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
              <label className={styles.dayPill} key={d}>
                <input defaultChecked={d === "T7" || d === "CN"} type="checkbox" />
                <span>{d}</span>
              </label>
            ))}
          </div>

          <h3>5. Danh sách ngày lễ / Tết</h3>
          <div className={styles.holidayList}>
            {["01/01/2026 — Tết Dương lịch", "10/02/2026 — 30 Tết", "11-15/02/2026 — Tết Nguyên đán", "30/04 - 01/05/2026 — Lễ 30/4 + 1/5", "02/09/2026 — Quốc khánh"].map((h) => (
              <span className={styles.holidayChip} key={h}>{h} <button onClick={() => alert("Xóa ngày lễ")} type="button"><X size={12} /></button></span>
            ))}
            <button className={styles.holidayAdd} onClick={() => alert("Thêm ngày lễ")} type="button">
              <Plus size={14} /> Thêm ngày
            </button>
          </div>
        </div>

        <footer className={styles.modalFooter}>
          <button onClick={onClose} type="button">Hủy bỏ</button>
          <button className={styles.blueButton} type="submit">{isEdit ? "Cập nhật" : "Lưu bảng giá"}</button>
        </footer>
      </form>
    </div>
  );
}

function TierFormCell({
  defaultValue,
  label,
  name,
  placeholder,
  tone,
}: {
  defaultValue?: string;
  label: string;
  name: string;
  placeholder: string;
  tone: string;
}) {
  return (
    <label className={`${styles.tierFormCell} ${styles[`tier_${tone}`]}`}>
      <span>{label}</span>
      <input defaultValue={defaultValue} name={name} placeholder={placeholder} type="number" />
      <em>VNĐ</em>
    </label>
  );
}

/* ---------------- Delete Modal ---------------- */

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

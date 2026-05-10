"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  Clock3,
  Download,
  FileDown,
  Gauge,
  LineChart,
  PieChart,
  ReceiptText,
  Search,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  UsersRound,
  Wallet,
  X,
} from "lucide-react";
import { FeaturePage } from "@/shared/components";
import { branchShortNames } from "@/shared/data";
import styles from "@/shared/styles/feature-styles.module.css";

type ReportTab = "overview" | "revenue" | "capacity" | "customers" | "coaches" | "finance";

type ReportKpi = {
  label: string;
  value: string;
  change: string;
  icon: typeof Wallet;
  tone: "blue" | "green" | "amber" | "purple";
  meta?: string;
};

const reportKpisByTab: Record<ReportTab, ReportKpi[]> = {
  overview: [
    { label: "Doanh thu thuần", value: "1,84 tỷ", change: "+12,8%", icon: Wallet, tone: "blue" },
    { label: "Công suất line/sân", value: "78%", change: "+6,4%", icon: Gauge, tone: "green" },
    { label: "Không đến lịch hẹn", meta: "No-show teetime/HLV/lớp", value: "4,7%", change: "-1,9%", icon: TrendingDown, tone: "amber" },
    { label: "Hội viên tái ký", value: "64%", change: "+8,1%", icon: UsersRound, tone: "purple" },
  ],
  revenue: [
    { label: "Hợp đồng hội viên", value: "1,08 tỷ", change: "+16%", icon: ReceiptText, tone: "blue" },
    { label: "Line tập", value: "318M", change: "+9%", icon: Target, tone: "green" },
    { label: "HLV 1-1", value: "286M", change: "+11%", icon: Trophy, tone: "amber" },
    { label: "Vé lẻ & dịch vụ", value: "156M", change: "-3%", icon: Wallet, tone: "purple" },
  ],
  capacity: [
    { label: "Golf Teetime", value: "82%", change: "+7%", icon: CalendarDays, tone: "blue" },
    { label: "Golf Line Tập", value: "76%", change: "+5%", icon: Target, tone: "green" },
    { label: "Lịch HLV", value: "81%", change: "+9%", icon: Trophy, tone: "amber" },
    { label: "Lịch Lớp", value: "79%", change: "+4%", icon: UsersRound, tone: "purple" },
  ],
  customers: [
    { label: "Hội viên mới", value: "86", change: "+18%", icon: UsersRound, tone: "blue" },
    { label: "Tỷ lệ tái ký", value: "64%", change: "+8%", icon: TrendingUp, tone: "green" },
    { label: "Sắp hết buổi", value: "128", change: "-6%", icon: Clock3, tone: "amber" },
    { label: "Nguy cơ rời bỏ", value: "31", change: "+4%", icon: AlertTriangle, tone: "purple" },
  ],
  coaches: [
    { label: "Buổi HLV", value: "201", change: "+12%", icon: Trophy, tone: "blue" },
    { label: "Lấp đầy TB", value: "79%", change: "+6%", icon: Gauge, tone: "green" },
    { label: "Hoa hồng HLV", value: "43M", change: "+10%", icon: Wallet, tone: "amber" },
    { label: "Lớp cần đẩy", value: "1", change: "-2", icon: AlertTriangle, tone: "purple" },
  ],
  finance: [
    { label: "Phải thu", value: "480M", change: "+9%", icon: ReceiptText, tone: "blue" },
    { label: "Quá hạn", value: "135M", change: "-4%", icon: AlertTriangle, tone: "amber" },
    { label: "Thu trong kỳ", value: "1,84 tỷ", change: "+12%", icon: TrendingUp, tone: "green" },
    { label: "Chi trong kỳ", value: "530M", change: "+5%", icon: Wallet, tone: "purple" },
  ],
};

const revenueMix = [
  { label: "Hợp đồng", value: 58, amount: "1,08 tỷ", color: "#2563eb", detail: "Hội viên mới, tái ký và nâng hạng gói tập." },
  { label: "Line tập", value: 17, amount: "318M", color: "#16a34a", detail: "Doanh thu đặt line theo giờ và gói lượt tập." },
  { label: "HLV", value: 15, amount: "286M", color: "#f97316", detail: "Buổi học 1-1, lớp nhóm và gói HLV cá nhân." },
  { label: "Vé lẻ", value: 10, amount: "156M", color: "#8b5cf6", detail: "Vé ngày, phụ thu dịch vụ và khách vãng lai." },
];

const trendPoints = [
  { label: "T2", date: "04/05", revenue: 756, checkin: 1210, booking: 228, noShow: 11 },
  { label: "T3", date: "05/05", revenue: 928, checkin: 1146, booking: 246, noShow: 9 },
  { label: "T4", date: "06/05", revenue: 842, checkin: 1378, booking: 252, noShow: 8 },
  { label: "T5", date: "07/05", revenue: 1116, checkin: 1292, booking: 286, noShow: 7 },
  { label: "T6", date: "08/05", revenue: 1014, checkin: 1588, booking: 304, noShow: 6 },
  { label: "T7", date: "09/05", revenue: 1332, checkin: 1474, booking: 318, noShow: 5 },
];

const heatmapRows = [
  { label: "Teetime", values: [52, 74, 88, 79, 92, 84] },
  { label: "Line tập", values: [38, 55, 72, 86, 78, 61] },
  { label: "HLV", values: [44, 68, 82, 91, 85, 58] },
  { label: "Lớp", values: [36, 62, 77, 83, 71, 49] },
];

const heatmapSlots = ["08h", "10h", "12h", "14h", "16h", "18h"];

const capacityRows = [
  { area: "Golf Teetime", booked: 186, available: 42, occupancy: 82, revenue: "548.000.000đ", status: "Tốt" },
  { area: "Golf Line Tập", booked: 412, available: 96, occupancy: 76, revenue: "318.000.000đ", status: "Cần tối ưu giờ thấp điểm" },
  { area: "Lịch HLV", booked: 228, available: 54, occupancy: 81, revenue: "286.000.000đ", status: "Tốt" },
  { area: "Lịch Lớp", booked: 148, available: 38, occupancy: 79, revenue: "174.000.000đ", status: "Theo dõi sĩ số" },
];

const revenueRows = [
  { source: "Hợp đồng hội viên", amount: "1.080.000.000đ", share: 58, branch: "Bến Nghé", owner: "Sale Lan Anh", trend: "+16%" },
  { source: "Golf Line Tập", amount: "318.000.000đ", share: 17, branch: "Thảo Điền", owner: "Quản lý Line", trend: "+9%" },
  { source: "Lịch HLV 1-1", amount: "286.000.000đ", share: 15, branch: "Võ Thị Sáu", owner: "HLV Bảo Châu", trend: "+11%" },
  { source: "Vé lẻ & dịch vụ", amount: "156.000.000đ", share: 8, branch: "Tân Phú", owner: "Lễ tân", trend: "-3%" },
];

const financeRows = [
  { code: "CN-BN", receivable: "186.000.000đ", overdue: "42.000.000đ", cashIn: "612.000.000đ", cashOut: "168.000.000đ", risk: "Trung bình", riskTone: "medium" },
  { code: "CN-VTS", receivable: "92.000.000đ", overdue: "18.000.000đ", cashIn: "438.000.000đ", cashOut: "121.000.000đ", risk: "Thấp", riskTone: "low" },
  { code: "CN-TD", receivable: "128.000.000đ", overdue: "64.000.000đ", cashIn: "506.000.000đ", cashOut: "143.000.000đ", risk: "Cao", riskTone: "high" },
  { code: "CN-TP", receivable: "74.000.000đ", overdue: "11.000.000đ", cashIn: "284.000.000đ", cashOut: "98.000.000đ", risk: "Thấp", riskTone: "low" },
];

const coachRows = [
  { coach: "Bảo Châu", sessions: 64, fill: 88, revenue: "96.000.000đ", commission: "14.400.000đ", rating: "4.9" },
  { coach: "Quốc Huy", sessions: 58, fill: 84, revenue: "82.000.000đ", commission: "12.300.000đ", rating: "4.8" },
  { coach: "Thanh Sơn", sessions: 43, fill: 76, revenue: "61.000.000đ", commission: "9.150.000đ", rating: "4.7" },
  { coach: "Minh Trí", sessions: 36, fill: 69, revenue: "48.000.000đ", commission: "7.200.000đ", rating: "4.6" },
];

const alerts = [
  { title: "No-show teetime tăng tại Thảo Điền", detail: "Khung 17:00-19:00 có 12 lượt không đến trong 7 ngày.", action: "Xem lịch đặt" },
  { title: "Công nợ quá hạn tập trung ở CN-TD", detail: "64M quá hạn, liên quan 9 hợp đồng và 3 gói HLV.", action: "Mở công nợ" },
  { title: "Line tập thấp điểm còn trống nhiều", detail: "10:00-14:00 công suất 42%, nên chạy khuyến mãi giờ thấp điểm.", action: "Gợi ý KM" },
];

const customerRows = [
  { segment: "Hội viên mới", value: "86", rate: "+18%", branch: "Bến Nghé", owner: "Sale Lan Anh", note: "42% đến từ gói trải nghiệm" },
  { segment: "Tái ký", value: "64%", rate: "+8%", branch: "Võ Thị Sáu", owner: "CSKH Hương", note: "VIP 12 tháng giữ chân tốt" },
  { segment: "Sắp hết buổi", value: "128", rate: "-6%", branch: "Thảo Điền", owner: "Lễ tân", note: "Cần nhắc trước 7 ngày" },
  { segment: "Nguy cơ rời bỏ", value: "31", rate: "+4%", branch: "Tân Phú", owner: "CSKH Nam", note: "Không check-in 21 ngày" },
];

const classRows = [
  { name: "Junior Foundation", sessions: "32 buổi", fill: "86%", revenue: "72.000.000đ", coach: "HLV Quốc Huy", status: "Tốt" },
  { name: "Ladies Beginner", sessions: "24 buổi", fill: "78%", revenue: "54.000.000đ", coach: "HLV Bảo Châu", status: "Theo dõi sĩ số" },
  { name: "Private Swing Fix", sessions: "58 buổi", fill: "91%", revenue: "118.000.000đ", coach: "HLV Thanh Sơn", status: "Nhu cầu cao" },
  { name: "Short Game Clinic", sessions: "18 buổi", fill: "64%", revenue: "32.000.000đ", coach: "HLV Minh Trí", status: "Cần đẩy lớp" },
];

const branchPulseRows = [
  { branch: "Bến Nghé", revenue: "612M", capacity: 84, checkin: 486, risk: "Ổn định", tone: "success" },
  { branch: "Võ Thị Sáu", revenue: "438M", capacity: 79, checkin: 392, risk: "Tăng trưởng", tone: "info" },
  { branch: "Thảo Điền", revenue: "506M", capacity: 72, checkin: 428, risk: "Nợ quá hạn cao", tone: "warning" },
  { branch: "Tân Phú", revenue: "284M", capacity: 68, checkin: 244, risk: "Cần kích cầu", tone: "warning" },
];

const customerLifecycleRows = [
  { title: "Lead trải nghiệm", value: "214", detail: "86 chuyển thành hội viên", progress: 40, color: "#2563eb" },
  { title: "Hội viên đang hoạt động", value: "1.286", detail: "Check-in trong 30 ngày", progress: 76, color: "#16a34a" },
  { title: "Sắp hết buổi / hết hạn", value: "128", detail: "Cần gọi trước 7 ngày", progress: 58, color: "#f97316" },
  { title: "Nguy cơ rời bỏ", value: "31", detail: "Không phát sinh 21 ngày", progress: 24, color: "#db2777" },
];

const financeWaterfallRows = [
  { label: "Thu trong kỳ", value: 100, amount: "1,84 tỷ", color: "#2563eb" },
  { label: "Đã đối soát", value: 92, amount: "1,69 tỷ", color: "#16a34a" },
  { label: "Phải thu", value: 52, amount: "480M", color: "#f97316" },
  { label: "Quá hạn", value: 28, amount: "135M", color: "#dc2626" },
  { label: "Chi vận hành", value: 45, amount: "530M", color: "#8b5cf6" },
];

const branchScoreColors = ["#16a34a", "#2563eb", "#f97316", "#8b5cf6"];

const memberLinePoints = "50,132 150,74 250,98 350,154";
const checkinLinePoints = "50,70 150,76 250,57 350,64 450,40 550,49";

const reportTabs: Array<{ id: ReportTab; label: string }> = [
  { id: "overview", label: "Tổng quan" },
  { id: "revenue", label: "Doanh thu" },
  { id: "capacity", label: "Công suất" },
  { id: "customers", label: "Hội viên" },
  { id: "coaches", label: "HLV & lớp học" },
  { id: "finance", label: "Thu chi & công nợ" },
];

const reportTables: Record<ReportTab, { title: string; columns: string[]; rows: string[][] }> = {
  overview: {
    title: "Doanh thu theo nguồn và phụ trách",
    columns: ["Nguồn", "Số tiền", "Tỷ trọng", "Chi nhánh", "Phụ trách", "Xu hướng"],
    rows: revenueRows.map((row) => [row.source, row.amount, `${row.share}%`, row.branch, row.owner, row.trend]),
  },
  revenue: {
    title: "Chi tiết doanh thu theo nguồn",
    columns: ["Nguồn", "Số tiền", "Tỷ trọng", "Chi nhánh", "Phụ trách", "Xu hướng"],
    rows: revenueRows.map((row) => [row.source, row.amount, `${row.share}%`, row.branch, row.owner, row.trend]),
  },
  capacity: {
    title: "Công suất khai thác theo khu vực",
    columns: ["Khu vực", "Đã đặt", "Còn trống", "Công suất", "Doanh thu", "Trạng thái"],
    rows: capacityRows.map((row) => [row.area, String(row.booked), String(row.available), `${row.occupancy}%`, row.revenue, row.status]),
  },
  customers: {
    title: "Hội viên và vòng đời khách hàng",
    columns: ["Nhóm", "Giá trị", "Biến động", "Chi nhánh", "Phụ trách", "Ghi chú"],
    rows: customerRows.map((row) => [row.segment, row.value, row.rate, row.branch, row.owner, row.note]),
  },
  coaches: {
    title: "Hiệu suất HLV và lớp học",
    columns: ["Lớp/HLV", "Buổi", "Lấp đầy", "Doanh thu", "Phụ trách", "Trạng thái"],
    rows: classRows.map((row) => [row.name, row.sessions, row.fill, row.revenue, row.coach, row.status]),
  },
  finance: {
    title: "Công nợ và sổ quỹ theo chi nhánh",
    columns: ["Chi nhánh", "Phải thu", "Quá hạn", "Thu", "Chi", "Rủi ro"],
    rows: financeRows.map((row) => [row.code, row.receivable, row.overdue, row.cashIn, row.cashOut, row.risk]),
  },
};

function exportCsv(filename: string, rows: string[][]) {
  const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function reportToneClass(value: string) {
  const normalized = normalizeText(value);
  if (normalized.includes("tot") || normalized.includes("thap") || normalized.includes("+")) return "reportsTone_success";
  if (normalized.includes("cao") || normalized.includes("nhu cau")) return "reportsTone_info";
  if (normalized.includes("can") || normalized.includes("theo doi") || normalized.includes("-") || normalized.includes("trung binh")) return "reportsTone_warning";
  return "reportsTone_neutral";
}

export default function ReportsView() {
  const [branch, setBranch] = useState("Tất cả chi nhánh");
  const [period, setPeriod] = useState("Tháng này");
  const [fromDate, setFromDate] = useState("2026-05-01");
  const [toDate, setToDate] = useState("2026-05-09");
  const [keyword, setKeyword] = useState("");
  const [drilldown, setDrilldown] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ReportTab>("overview");
  const activeTable = reportTables[activeTab];
  const activeKpis = reportKpisByTab[activeTab];
  const activeRows = useMemo(() => {
    const q = normalizeText(keyword.trim());
    const normalizedBranch = normalizeText(branch);
    return activeTable.rows.filter((row) => {
      const normalizedRow = normalizeText(row.join(" "));
      const rowHasBranch = row.some((cell) => branchShortNames.includes(cell));
      const branchMatch = branch === "Tất cả chi nhánh" || normalizedRow.includes(normalizedBranch) || !rowHasBranch;
      const textMatch = !q || normalizedRow.includes(q);
      return branchMatch && textMatch;
    });
  }, [activeTable.rows, branch, keyword]);

  const exportCurrentReport = () => {
    exportCsv(`bao-cao-${activeTab}-${fromDate}-${toDate}.csv`, [activeTable.columns, ...activeRows]);
  };

  return (
    <FeaturePage title="Báo cáo vận hành" subtitle="Tổng hợp doanh thu, công suất, check-in, hội viên, HLV, công nợ và hoa hồng theo chi nhánh">
      <section className={styles.reportsHero}>
        <div>
          <span><LineChart size={18} /> Báo cáo vận hành sân golf</span>
          <h3>Tổng hợp doanh thu, công suất khai thác, hội viên và công nợ theo chi nhánh</h3>
        </div>
        <button onClick={exportCurrentReport} type="button"><FileDown size={18} />Xuất báo cáo</button>
      </section>

      <section className={styles.reportsFilterBar}>
        <label>
          <span>Chi nhánh</span>
          <select onChange={(event) => setBranch(event.target.value)} value={branch}>
            {["Tất cả chi nhánh", ...branchShortNames].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>Kỳ báo cáo</span>
          <select onChange={(event) => setPeriod(event.target.value)} value={period}>
            {["Hôm nay", "Tuần này", "Tháng này", "Quý này", "Tùy chỉnh"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>Từ ngày</span>
          <input onChange={(event) => setFromDate(event.target.value)} type="date" value={fromDate} />
        </label>
        <label>
          <span>Đến ngày</span>
          <input onChange={(event) => setToDate(event.target.value)} type="date" value={toDate} />
        </label>
        <label className={styles.reportsSearch}>
          <span>Tìm trong báo cáo</span>
          <div><Search size={16} /><input onChange={(event) => setKeyword(event.target.value)} placeholder="Nguồn thu, chi nhánh, nhân sự..." value={keyword} /></div>
        </label>
      </section>

      <section className={styles.reportsTabs}>
        {reportTabs.map((tab) => (
          <button className={activeTab === tab.id ? styles.reportsTabActive : undefined} key={tab.id} onClick={() => setActiveTab(tab.id)} type="button">
            {tab.label}
          </button>
        ))}
      </section>

      <section className={styles.reportsKpiGrid}>
        {activeKpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <article className={styles[`reportsKpi_${kpi.tone}`]} key={kpi.label}>
              <Icon size={26} />
              <span>{kpi.label}</span>
              {"meta" in kpi ? <small>{kpi.meta}</small> : null}
              <strong>{kpi.value}</strong>
              <em>{kpi.change} so với kỳ trước</em>
            </article>
          );
        })}
      </section>

      <section className={styles.reportsOverviewBoard} hidden={activeTab !== "overview"}>
        <article className={styles.reportsCard}>
          <header>
            <div>
              <span><Activity size={17} /> Tổng hợp điều hành</span>
              <h3>Chỉ số vận hành trọng yếu trong kỳ</h3>
            </div>
          </header>
          <div className={styles.reportsOverviewCharts}>
            <article>
              <span><Gauge size={16} /> Hiệu suất chi nhánh</span>
              {branchPulseRows.map((row, index) => (
                <button key={row.branch} onClick={() => setDrilldown(`Chi nhánh ${row.branch}`)} type="button">
                  <strong>{row.branch}</strong>
                  <div style={{ "--branch-score": `${row.capacity}%`, "--branch-color": branchScoreColors[index] } as React.CSSProperties}><i>{row.capacity}%</i></div>
                  <em>{row.capacity}% công suất · {row.revenue} · {row.checkin} check-in</em>
                  <small>{row.risk}</small>
                </button>
              ))}
            </article>
            <article>
              <span><PieChart size={16} /> Cơ cấu nguồn thu</span>
              <div className={styles.reportsMiniMix}>
                {revenueMix.map((item) => (
                  <button key={item.label} onClick={() => setDrilldown(item.label)} style={{ "--mix-color": item.color, "--mix-value": `${item.value}%` } as React.CSSProperties} type="button">
                    <b>{item.label}</b>
                    <i><em /></i>
                    <strong>{item.amount}</strong>
                    <small>{item.value}%</small>
                  </button>
                ))}
              </div>
            </article>
          </div>
        </article>
      </section>

      <section className={styles.reportsInsightGrid}>
        <article className={styles.reportsCard} hidden={activeTab !== "revenue"}>
          <header>
            <div>
              <span><PieChart size={17} /> Cơ cấu doanh thu</span>
              <h3>Tỷ trọng theo nguồn thu</h3>
            </div>
          </header>
          <div className={styles.reportsDonutWrap}>
            <div className={styles.reportsDonut} style={{ "--slice-a": "58%", "--slice-b": "75%", "--slice-c": "90%" } as React.CSSProperties}>
              <strong>1,84 tỷ</strong>
              <span>Doanh thu thuần</span>
            </div>
            <div className={styles.reportsDonutLegend}>
              {revenueMix.map((item) => (
                <button key={item.label} style={{ "--legend-color": item.color } as React.CSSProperties} type="button">
                  <span>{item.label}</span>
                  <strong>{item.value}%</strong>
                  <em>{item.amount}</em>
                  <small>{item.detail}</small>
                </button>
              ))}
            </div>
          </div>
        </article>

        <article className={styles.reportsCard} hidden={activeTab !== "overview"}>
          <header>
            <div>
              <span><TrendingUp size={17} /> Xu hướng</span>
              <h3>Doanh thu và check-in theo ngày</h3>
            </div>
          </header>
          <div className={styles.reportsComboChart}>
            <div className={styles.reportsComboLegend}>
              <span><i />Doanh thu</span>
              <span><i />Check-in</span>
              <em>Di chuột từng ngày để xem booking và lượt không đến.</em>
            </div>
            <div className={styles.reportsComboPlot}>
              <svg aria-hidden="true" className={styles.reportsComboLine} preserveAspectRatio="none" viewBox="0 0 600 268">
                <polyline points={checkinLinePoints} />
              </svg>
              {trendPoints.map((point) => (
                <button
                  key={point.label}
                  style={{ "--bar": `${Math.round((point.revenue / 1332) * 100)}%`, "--dot-y": `${Math.round((point.checkin / 1588) * 128) + 56}px` } as React.CSSProperties}
                  type="button"
                >
                  <span>{point.revenue}M</span>
                  <i />
                  <b />
                  <strong>{point.label}</strong>
                  <small>{point.checkin} check-in</small>
                  <em>{point.date} · {point.booking} booking · {point.noShow} không đến</em>
                </button>
              ))}
            </div>
          </div>
        </article>

        <article className={styles.reportsCard} hidden={activeTab !== "capacity"}>
          <header>
            <div>
              <span><Gauge size={17} /> Heatmap công suất</span>
              <h3>Khung giờ khai thác cao điểm</h3>
            </div>
          </header>
          <div className={styles.reportsHeatmap}>
            <div className={styles.reportsHeatmapHead}><span />{heatmapSlots.map((slot) => <strong key={slot}>{slot}</strong>)}</div>
            {heatmapRows.map((row) => (
              <div key={row.label}>
                <strong>{row.label}</strong>
                {row.values.map((value, index) => (
                  <button aria-label={`${row.label} ${heatmapSlots[index]} ${value}%`} key={`${row.label}-${heatmapSlots[index]}`} style={{ "--heat": value } as React.CSSProperties} type="button">
                    <span>{value}%</span>
                    <em>{row.label} · {heatmapSlots[index]} · {value}% công suất</em>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </article>

        <article className={styles.reportsCard} hidden={activeTab !== "customers"}>
          <header>
            <div>
              <span><UsersRound size={17} /> Hiệu quả hội viên</span>
              <h3>Lead, hội viên hoạt động, tái ký và rủi ro rời bỏ</h3>
            </div>
          </header>
          <div className={styles.reportsMemberChart}>
            <svg aria-hidden="true" className={styles.reportsMemberLine} preserveAspectRatio="none" viewBox="0 0 400 180">
              <polyline points={memberLinePoints} />
            </svg>
            {customerLifecycleRows.map((row) => (
              <button key={row.title} onClick={() => setDrilldown(row.title)} style={{ "--life-color": row.color, "--life-height": `${Math.max(row.progress, 22)}%` } as React.CSSProperties} type="button">
                <strong>{row.value}</strong>
                <i><b /></i>
                <span>{row.title}</span>
                <em>{row.detail}</em>
              </button>
            ))}
          </div>
        </article>

        <article className={styles.reportsCard} hidden={activeTab !== "finance"}>
          <header>
            <div>
              <span><Wallet size={17} /> Thu chi & công nợ</span>
              <h3>Phải thu, quá hạn, thu chi và rủi ro</h3>
            </div>
          </header>
          <div className={styles.reportsFinanceTiles} hidden>
            <article><span>Phải thu</span><strong>480M</strong><em>+9% so với kỳ trước</em></article>
            <article><span>Quá hạn</span><strong>135M</strong><em>Tập trung CN-TD</em></article>
            <article><span>Thu trong kỳ</span><strong>1,84 tỷ</strong><em>92% đã đối soát</em></article>
            <article><span>Chi trong kỳ</span><strong>530M</strong><em>Lương HLV, vận hành</em></article>
          </div>
          <div className={styles.reportsCashflowChart}>
            {financeWaterfallRows.map((row) => (
              <button key={row.label} onClick={() => setDrilldown(row.label)} style={{ "--cash-color": row.color, "--cash-height": `${row.value}%` } as React.CSSProperties} type="button">
                <span>{row.label}</span>
                <i><b /></i>
                <em>{row.amount}</em>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className={styles.reportsCard} hidden={activeTab !== "overview"}>
          <header>
            <div>
              <span><AlertTriangle size={17} /> Cảnh báo vận hành</span>
              <h3>Cảnh báo điều hành</h3>
            </div>
          </header>
          <div className={styles.reportsAlerts}>
            {alerts.map((alert) => (
              <button key={alert.title} onClick={() => setDrilldown(alert.title)} type="button">
                <AlertTriangle size={18} />
                <strong>{alert.title}</strong>
                <span>{alert.detail}</span>
                <em>{alert.action}</em>
              </button>
            ))}
          </div>
      </section>

      <section className={styles.reportsInsightGrid} hidden={activeTab !== "coaches"}>
        <article className={styles.reportsCard}>
          <header>
            <div>
              <span><Trophy size={17} /> Hiệu suất HLV</span>
              <h3>Buổi dạy, doanh thu và hoa hồng</h3>
            </div>
          </header>
          <div className={styles.reportsCoachCards}>
            {coachRows.map((row) => (
              <button key={row.coach} onClick={() => setDrilldown(`HLV ${row.coach}`)} type="button">
                <span><Trophy size={17} /> {row.rating}★</span>
                <strong>{row.coach}</strong>
                <div><i style={{ width: `${row.fill}%` }} /></div>
                <em>{row.sessions} buổi · lấp đầy {row.fill}%</em>
                <small>{row.revenue} · HH {row.commission}</small>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className={styles.reportsCard}>
        <header>
          <div>
            <span><ReceiptText size={17} /> Bảng chi tiết</span>
            <h3>{activeTable.title}</h3>
          </div>
          <button onClick={exportCurrentReport} type="button"><Download size={15} />Export CSV</button>
        </header>
        <div className={styles.reportsDataTable}>
          <div>{activeTable.columns.map((column) => <strong key={column}>{column}</strong>)}</div>
          {activeRows.map((row) => (
            <button key={row.join("-")} onClick={() => setDrilldown(row[0])} type="button">
              {row.map((cell, index) => index === row.length - 1
                  ? <em className={styles[reportToneClass(cell)]} key={`${row[0]}-${cell}`}>{cell}</em>
                  : <span key={`${row[0]}-${cell}`}>{cell}</span>)}
            </button>
          ))}
          {!activeRows.length ? (
            <article className={styles.reportsEmptyState}>
              <Search size={18} />
              <strong>Không có dữ liệu phù hợp</strong>
              <span>Điều chỉnh từ khóa, chi nhánh hoặc kỳ báo cáo để xem lại dữ liệu vận hành.</span>
            </article>
          ) : null}
        </div>
      </section>

      {drilldown ? (
        <div className={styles.modalOverlay}>
          <section className={styles.reportsDrilldown}>
            <header>
              <div>
                <span><Activity size={17} /> Drill-down</span>
                <h3>{drilldown}</h3>
              </div>
              <button aria-label="Đóng" onClick={() => setDrilldown(null)} type="button"><X size={18} /></button>
            </header>
            <div className={styles.reportsDrillGrid}>
              <article><CalendarDays size={20} /><span>Kỳ</span><strong>{period}</strong></article>
              <article><Clock3 size={20} /><span>Thời gian</span><strong>{fromDate} → {toDate}</strong></article>
              <article><PieChart size={20} /><span>Chi nhánh</span><strong>{branch}</strong></article>
              <article><TrendingUp size={20} /><span>Tác động</span><strong>Ưu tiên theo dõi</strong></article>
            </div>
            <div className={styles.reportsDrillTable}>
              <div><strong>Mã</strong><strong>Nghiệp vụ</strong><strong>Giá trị</strong><strong>Trạng thái</strong></div>
              {[
                ["HD-000128", "Hợp đồng VIP 12 tháng", "68.000.000đ", "Đã ghi nhận"],
                ["PTT-001482", "Phiếu thu công nợ", "18.000.000đ", "Chờ đối soát"],
                ["BK-0931", "Teetime không đến", "2 khách", "Cần xử lý"],
              ].map((row) => <button key={row[0]} type="button">{row.map((cell) => <span key={cell}>{cell}</span>)}</button>)}
            </div>
          </section>
        </div>
      ) : null}
    </FeaturePage>
  );
}

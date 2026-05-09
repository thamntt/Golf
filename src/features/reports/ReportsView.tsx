"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  ChevronRight,
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

const reportTabs: Array<{ key: ReportTab; label: string }> = [
  { key: "overview", label: "Tổng quan" },
  { key: "revenue", label: "Doanh thu" },
  { key: "capacity", label: "Công suất" },
  { key: "customers", label: "Hội viên" },
  { key: "coaches", label: "HLV & Lớp" },
  { key: "finance", label: "Công nợ & Quỹ" },
];

const reportKpis = [
  { label: "Doanh thu thuần", value: "1,84 tỷ", change: "+12,8%", icon: Wallet, tone: "blue" },
  { label: "Công suất line/sân", value: "78%", change: "+6,4%", icon: Gauge, tone: "green" },
  { label: "No-show", value: "4,7%", change: "-1,9%", icon: TrendingDown, tone: "amber" },
  { label: "Hội viên tái ký", value: "64%", change: "+8,1%", icon: UsersRound, tone: "purple" },
];

const revenueSeries = [
  { label: "T2", contract: 420, ticket: 86, line: 132, coach: 118 },
  { label: "T3", contract: 520, ticket: 94, line: 148, coach: 126 },
  { label: "T4", contract: 486, ticket: 112, line: 162, coach: 152 },
  { label: "T5", contract: 620, ticket: 128, line: 178, coach: 171 },
  { label: "T6", contract: 710, ticket: 136, line: 190, coach: 184 },
  { label: "T7", contract: 780, ticket: 142, line: 214, coach: 196 },
];

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

export default function ReportsView() {
  const [activeTab, setActiveTab] = useState<ReportTab>("overview");
  const [branch, setBranch] = useState("Tất cả chi nhánh");
  const [period, setPeriod] = useState("Tháng này");
  const [fromDate, setFromDate] = useState("2026-05-01");
  const [toDate, setToDate] = useState("2026-05-09");
  const [keyword, setKeyword] = useState("");
  const [drilldown, setDrilldown] = useState<string | null>(null);
  const filteredRevenue = useMemo(() => {
    const q = normalizeText(keyword.trim());
    return revenueRows.filter((row) => {
      const branchMatch = branch === "Tất cả chi nhánh" || row.branch === branch;
      const textMatch = !q || normalizeText(`${row.source} ${row.branch} ${row.owner}`).includes(q);
      return branchMatch && textMatch;
    });
  }, [branch, keyword]);

  const exportCurrentReport = () => {
    const rows = activeTab === "finance"
      ? [["Chi nhánh", "Phải thu", "Quá hạn", "Thu", "Chi", "Rủi ro"], ...financeRows.map((row) => [row.code, row.receivable, row.overdue, row.cashIn, row.cashOut, row.risk])]
      : [["Nguồn doanh thu", "Số tiền", "Tỷ trọng", "Chi nhánh", "Phụ trách", "Xu hướng"], ...filteredRevenue.map((row) => [row.source, row.amount, `${row.share}%`, row.branch, row.owner, row.trend])];
    exportCsv(`bao-cao-${activeTab}-${fromDate}-${toDate}.csv`, rows);
  };

  return (
    <FeaturePage title="Báo cáo vận hành" subtitle="Tổng hợp doanh thu, công suất, check-in, hội viên, HLV, công nợ và hoa hồng theo chi nhánh">
      <section className={styles.reportsHero}>
        <div>
          <span><LineChart size={18} /> Trung tâm điều hành</span>
          <h3>Hiệu quả kinh doanh golf theo thời gian thực</h3>
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

      <nav className={styles.reportsTabs}>
        {reportTabs.map((tab) => (
          <button className={activeTab === tab.key ? styles.reportsTabActive : undefined} key={tab.key} onClick={() => setActiveTab(tab.key)} type="button">
            {tab.label}
          </button>
        ))}
      </nav>

      <section className={styles.reportsKpiGrid}>
        {reportKpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <article className={styles[`reportsKpi_${kpi.tone}`]} key={kpi.label}>
              <Icon size={26} />
              <span>{kpi.label}</span>
              <strong>{kpi.value}</strong>
              <em>{kpi.change} so với kỳ trước</em>
            </article>
          );
        })}
      </section>

      <section className={styles.reportsMainGrid}>
        <article className={styles.reportsCard}>
          <header>
            <div>
              <span><BarChart3 size={17} /> Doanh thu theo nguồn</span>
              <h3>Hợp đồng, line tập, HLV và vé lẻ</h3>
            </div>
            <button onClick={() => setDrilldown("Doanh thu theo nguồn")} type="button">Drill-down <ChevronRight size={15} /></button>
          </header>
          <div className={styles.reportsStackedChart}>
            {revenueSeries.map((item) => {
              const total = item.contract + item.ticket + item.line + item.coach;
              return (
                <div key={item.label}>
                  <span style={{ height: `${Math.round((item.contract / total) * 100)}%` }} />
                  <span style={{ height: `${Math.round((item.line / total) * 100)}%` }} />
                  <span style={{ height: `${Math.round((item.coach / total) * 100)}%` }} />
                  <span style={{ height: `${Math.round((item.ticket / total) * 100)}%` }} />
                  <small>{item.label}</small>
                </div>
              );
            })}
          </div>
          <div className={styles.reportsLegend}>
            <span>Hợp đồng</span><span>Line tập</span><span>HLV</span><span>Vé lẻ</span>
          </div>
        </article>

        <aside className={styles.reportsCard}>
          <header>
            <div>
              <span><AlertTriangle size={17} /> Cần xử lý</span>
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
        </aside>
      </section>

      <section className={styles.reportsMainGrid}>
        <article className={styles.reportsCard}>
          <header>
            <div>
              <span><Target size={17} /> Công suất khai thác</span>
              <h3>Teetime, line tập, HLV và lớp</h3>
            </div>
          </header>
          <div className={styles.reportsCapacityList}>
            {capacityRows.map((row) => (
              <button key={row.area} onClick={() => setDrilldown(row.area)} type="button">
                <strong>{row.area}</strong>
                <span>{row.booked} đã đặt · {row.available} còn trống · {row.revenue}</span>
                <div><i style={{ width: `${row.occupancy}%` }} /></div>
                <em>{row.occupancy}% · {row.status}</em>
              </button>
            ))}
          </div>
        </article>

        <article className={styles.reportsCard}>
          <header>
            <div>
              <span><Trophy size={17} /> Hiệu suất HLV</span>
              <h3>Buổi dạy, doanh thu và hoa hồng</h3>
            </div>
          </header>
          <div className={styles.reportsCoachTable}>
            <div><strong>HLV</strong><strong>Buổi</strong><strong>Lấp đầy</strong><strong>Doanh thu</strong><strong>HH</strong></div>
            {coachRows.map((row) => (
              <button key={row.coach} onClick={() => setDrilldown(`HLV ${row.coach}`)} type="button">
                <span>{row.coach}<small>{row.rating}★</small></span>
                <span>{row.sessions}</span>
                <span>{row.fill}%</span>
                <span>{row.revenue}</span>
                <span>{row.commission}</span>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className={styles.reportsCard}>
        <header>
          <div>
            <span><ReceiptText size={17} /> Bảng chi tiết</span>
            <h3>{activeTab === "finance" ? "Công nợ và sổ quỹ theo chi nhánh" : "Doanh thu theo nguồn và phụ trách"}</h3>
          </div>
          <button onClick={exportCurrentReport} type="button"><Download size={15} />Export CSV</button>
        </header>
        {activeTab === "finance" ? (
          <div className={styles.reportsDataTable}>
            <div><strong>Chi nhánh</strong><strong>Phải thu</strong><strong>Quá hạn</strong><strong>Thu</strong><strong>Chi</strong><strong>Rủi ro</strong></div>
            {financeRows.map((row) => (
              <button key={row.code} onClick={() => setDrilldown(`Công nợ ${row.code}`)} type="button">
                <span>{row.code}</span><span>{row.receivable}</span><span>{row.overdue}</span><span>{row.cashIn}</span><span>{row.cashOut}</span><em className={styles[`reportsRisk_${row.riskTone}`]}>{row.risk}</em>
              </button>
            ))}
          </div>
        ) : (
          <div className={styles.reportsDataTable}>
            <div><strong>Nguồn</strong><strong>Số tiền</strong><strong>Tỷ trọng</strong><strong>Chi nhánh</strong><strong>Phụ trách</strong><strong>Xu hướng</strong></div>
            {filteredRevenue.map((row) => (
              <button key={row.source} onClick={() => setDrilldown(row.source)} type="button">
                <span>{row.source}</span><span>{row.amount}</span><span>{row.share}%</span><span>{row.branch}</span><span>{row.owner}</span><em>{row.trend}</em>
              </button>
            ))}
          </div>
        )}
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

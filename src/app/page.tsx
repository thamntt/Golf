import {
  BarChart3,
  BriefcaseBusiness,
  Calendar,
  CalendarDays,
  ChartNoAxesColumn,
  ChevronDown,
  ClipboardList,
  CreditCard,
  DollarSign,
  Flag,
  Menu,
  Settings,
  Target,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";
import styles from "./page.module.css";

const navItems = [
  { label: "Dashboard", icon: BarChart3, active: true },
  { label: "Golf Teetime", icon: Flag, group: "GOLF" },
  { label: "Golf Line Tập", icon: Target },
  { label: "Vé lẻ", icon: Ticket },
  { label: "Sổ quỹ", icon: CreditCard },
  { label: "Lịch HLV", icon: CalendarDays },
  { label: "Hợp Đồng", icon: ClipboardList },
  { label: "Bảng Giá", icon: DollarSign },
  { label: "Hoa hồng Sale", icon: TrendingUp },
  { label: "Báo cáo Doanh thu", icon: ChartNoAxesColumn },
  { label: "Khách Hàng", icon: Users },
  { label: "Báo Cáo", icon: BarChart3 },
  { label: "Cài đặt", icon: Settings },
];

const stats = [
  {
    label: "Tổng Đặt Chỗ Hôm Nay",
    value: "50",
    trend: "+12%",
    Icon: Calendar,
    tone: "blue",
  },
  {
    label: "Khách Hàng Hoạt Động",
    value: "1,234",
    trend: "+8%",
    Icon: Users,
    tone: "green",
  },
  {
    label: "Doanh Thu Hôm Nay",
    value: "17.3M VNĐ",
    trend: "+23%",
    Icon: DollarSign,
    tone: "amber",
  },
  {
    label: "Tỷ Lệ Sử Dụng",
    value: "78%",
    trend: "+5%",
    Icon: TrendingUp,
    tone: "purple",
  },
];

const facilities = [
  {
    name: "Golf Teetime",
    Icon: Flag,
    booked: "32",
    available: "8",
    revenue: "12.5M VNĐ",
  },
  {
    name: "Golf Line Tập",
    Icon: Target,
    booked: "18",
    available: "12",
    revenue: "4.8M VNĐ",
  },
];

const bookings = [
  {
    code: "BK001",
    customer: "Nguyễn Văn A",
    facility: "Golf Teetime",
    time: "14:00 - 16:00",
    status: "Đã Xác Nhận",
  },
  {
    code: "BK002",
    customer: "Trần Thị B",
    facility: "Golf Teetime",
    time: "15:00 - 16:00",
    status: "Đã Xác Nhận",
  },
  {
    code: "BK003",
    customer: "Lê Văn C",
    facility: "Golf Line Tập",
    time: "16:00 - 17:00",
    status: "Chờ Xác Nhận",
  },
  {
    code: "BK004",
    customer: "Phạm Văn D",
    facility: "Golf Teetime",
    time: "09:00 - 11:00",
    status: "Đã Xác Nhận",
  },
  {
    code: "BK005",
    customer: "Hoàng Thị E",
    facility: "Golf Line Tập",
    time: "10:00 - 11:00",
    status: "Chờ Xác Nhận",
  },
];

export default function Home() {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1>Golf Manager</h1>
          <button type="button" aria-label="Thu gọn menu">
            <Menu size={20} strokeWidth={2} />
          </button>
        </div>

        <nav className={styles.navigation} aria-label="Menu quản trị">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <div className={styles.navBlock} key={item.label}>
                {item.group ? <p className={styles.navGroup}>{item.group}</p> : null}
                <a className={item.active ? styles.activeNav : undefined} href="#">
                  <Icon size={20} strokeWidth={2} />
                  {item.label}
                </a>
              </div>
            );
          })}
        </nav>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <p>Thứ Ba, 7 tháng 4, 2026</p>

          <div className={styles.userTools}>
            <button className={styles.branchButton} type="button">
              <BriefcaseBusiness size={16} strokeWidth={1.8} />
              NextVision
              <ChevronDown size={16} strokeWidth={1.8} />
            </button>
            <span className={styles.role}>Admin</span>
            <span className={styles.avatar}>A</span>
          </div>
        </header>

        <section className={styles.dashboard}>
          <div className={styles.titleBlock}>
            <h2>Dashboard</h2>
            <p>Tổng quan hệ thống quản lý cơ sở thể thao</p>
          </div>

          <section className={styles.statsGrid} aria-label="Chỉ số tổng quan">
            {stats.map((item) => {
              const Icon = item.Icon;

              return (
                <article className={styles.statCard} key={item.label}>
                  <div>
                    <p>{item.label}</p>
                    <strong>{item.value}</strong>
                    <span>{item.trend}</span>
                  </div>
                  <span className={`${styles.statIcon} ${styles[item.tone]}`}>
                    <Icon size={24} strokeWidth={2} />
                  </span>
                </article>
              );
            })}
          </section>

          <section className={`${styles.card} ${styles.facilityCard}`}>
            <h3>Tổng Quan Cơ Sở</h3>
            <div className={styles.facilityGrid}>
              {facilities.map((facility) => {
                const Icon = facility.Icon;

                return (
                  <article className={styles.facility} key={facility.name}>
                    <div className={styles.facilityTitle}>
                      <Icon size={20} strokeWidth={2} />
                      <h4>{facility.name}</h4>
                    </div>
                    <dl>
                      <div>
                        <dt>Đã đặt:</dt>
                        <dd>{facility.booked}</dd>
                      </div>
                      <div>
                        <dt>Còn trống:</dt>
                        <dd className={styles.positive}>{facility.available}</dd>
                      </div>
                      <div>
                        <dt>Doanh thu:</dt>
                        <dd>{facility.revenue}</dd>
                      </div>
                    </dl>
                  </article>
                );
              })}
            </div>
          </section>

          <section className={`${styles.card} ${styles.tableCard}`}>
            <h3>Đặt Chỗ Gần Đây</h3>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Khách Hàng</th>
                    <th>Cơ Sở</th>
                    <th>Thời Gian</th>
                    <th>Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.code}>
                      <td>{booking.code}</td>
                      <td>{booking.customer}</td>
                      <td>{booking.facility}</td>
                      <td>{booking.time}</td>
                      <td>
                        <span
                          className={
                            booking.status === "Đã Xác Nhận"
                              ? styles.confirmed
                              : styles.pending
                          }
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

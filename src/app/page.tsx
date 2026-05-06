import styles from "./page.module.css";

const navItems = [
  { label: "Dashboard", active: true },
  { label: "Golf Teetime", group: "Golf" },
  { label: "Golf Line Tập" },
  { label: "Vé lẻ" },
  { label: "Sổ quỹ" },
  { label: "Lịch HLV" },
  { label: "Hợp Đồng" },
  { label: "Bảng Giá" },
  { label: "Hoa hồng Sale" },
  { label: "Báo cáo Doanh thu" },
  { label: "Khách Hàng" },
  { label: "Báo Cáo" },
  { label: "Cài đặt" },
];

const stats = [
  {
    label: "Tổng Đặt Chỗ Hôm Nay",
    value: "50",
    trend: "+12%",
    icon: "B",
  },
  {
    label: "Khách Hàng Hoạt Động",
    value: "1,234",
    trend: "+8%",
    icon: "U",
  },
  {
    label: "Doanh Thu Hôm Nay",
    value: "17.3M VNĐ",
    trend: "+23%",
    icon: "D",
  },
  {
    label: "Tỷ Lệ Sử Dụng",
    value: "78%",
    trend: "+5%",
    icon: "R",
  },
];

const facilities = [
  {
    name: "Golf Teetime",
    booked: "32",
    available: "8",
    revenue: "12.5M VNĐ",
  },
  {
    name: "Golf Line Tập",
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
            <span />
            <span />
            <span />
          </button>
        </div>

        <nav className={styles.navigation} aria-label="Menu quản trị">
          {navItems.map((item) => (
            <div className={styles.navBlock} key={item.label}>
              {item.group ? <p className={styles.navGroup}>{item.group}</p> : null}
              <a className={item.active ? styles.activeNav : undefined} href="#">
                <span className={styles.navIcon} />
                {item.label}
              </a>
            </div>
          ))}
        </nav>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <p>Thứ Ba, 7 tháng 4, 2026</p>

          <div className={styles.userTools}>
            <button className={styles.branchButton} type="button">
              <span className={styles.branchIcon} />
              NextVision
              <span className={styles.chevron} />
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
            {stats.map((item) => (
              <article className={styles.statCard} key={item.label}>
                <div>
                  <p>{item.label}</p>
                  <strong>{item.value}</strong>
                  <span>{item.trend}</span>
                </div>
                <span className={styles.statIcon}>{item.icon}</span>
              </article>
            ))}
          </section>

          <section className={styles.card}>
            <h3>Tổng Quan Cơ Sở</h3>
            <div className={styles.facilityGrid}>
              {facilities.map((facility) => (
                <article className={styles.facility} key={facility.name}>
                  <div className={styles.facilityTitle}>
                    <span className={styles.facilityIcon} />
                    <h4>{facility.name}</h4>
                  </div>
                  <dl>
                    <div>
                      <dt>Đã đặt:</dt>
                      <dd>{facility.booked}</dd>
                    </div>
                    <div>
                      <dt>Còn trống:</dt>
                      <dd>{facility.available}</dd>
                    </div>
                    <div>
                      <dt>Doanh thu:</dt>
                      <dd>{facility.revenue}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.card}>
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

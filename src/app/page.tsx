import styles from "./page.module.css";

const teeTimes = [
  { time: "06:30", course: "Lake View", slots: "4 slots" },
  { time: "08:15", course: "Palm Nine", slots: "2 slots" },
  { time: "15:40", course: "Sunset Hills", slots: "6 slots" },
];

const features = [
  "Đặt lịch tee time nhanh",
  "Theo dõi handicap và điểm số",
  "Quản lý hội viên và gói sân",
];

export default function Home() {
  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Điều hướng chính">
        <a className={styles.brand} href="#top">
          <span>G</span>
          Golf Club
        </a>
        <div className={styles.navLinks}>
          <a href="#booking">Đặt sân</a>
          <a href="#features">Tiện ích</a>
          <a href="#contact">Liên hệ</a>
        </div>
      </nav>

      <section className={styles.hero} id="top">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Premium Golf Booking</p>
          <h1>Sân golf trong tầm tay, lịch chơi rõ ràng từng khung giờ.</h1>
          <p>
            Giao diện frontend Next.js dành cho hệ thống đặt sân golf, quản lý
            lịch chơi và trải nghiệm hội viên hiện đại.
          </p>
          <div className={styles.actions}>
            <a className={styles.primaryButton} href="#booking">
              Xem lịch trống
            </a>
            <a className={styles.secondaryButton} href="#features">
              Khám phá
            </a>
          </div>
        </div>

        <div className={styles.bookingPanel} id="booking">
          <div className={styles.panelHeader}>
            <div>
              <p>Hôm nay</p>
              <h2>Tee times</h2>
            </div>
            <span>18 holes</span>
          </div>

          <div className={styles.teeList}>
            {teeTimes.map((item) => (
              <article className={styles.teeCard} key={item.time}>
                <div>
                  <strong>{item.time}</strong>
                  <span>{item.course}</span>
                </div>
                <small>{item.slots}</small>
              </article>
            ))}
          </div>

          <form className={styles.searchForm}>
            <label>
              Ngày chơi
              <input type="date" name="date" />
            </label>
            <label>
              Số người
              <select name="players" defaultValue="4">
                <option value="1">1 người</option>
                <option value="2">2 người</option>
                <option value="3">3 người</option>
                <option value="4">4 người</option>
              </select>
            </label>
            <button type="submit">Tìm sân</button>
          </form>
        </div>
      </section>

      <section className={styles.features} id="features">
        {features.map((feature) => (
          <article key={feature}>
            <span />
            <h3>{feature}</h3>
            <p>
              Thiết kế tối giản, dễ mở rộng thành hệ thống booking thật với API
              và dashboard quản trị.
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}

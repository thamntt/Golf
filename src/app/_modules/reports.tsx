"use client";

import styles from "../page.module.css";
import { Screen, SimpleMetric, Toolbar } from "../_shared/components";

export default function ReportsScreen() {
  return (
    <Screen title="Báo cáo" subtitle="Doanh thu, check-in, hợp đồng, vé lẻ, hoa hồng và công nợ">
      <Toolbar primary="Xuất báo cáo" filters={["Doanh thu", "Check-in", "Hợp đồng", "Vé lẻ", "Hoa hồng", "Công nợ"]} />
      <div className={styles.reportGrid}>
        <SimpleMetric label="Doanh thu tháng" value="486M" />
        <SimpleMetric label="Lượt check-in" value="2,842" />
        <SimpleMetric label="Hợp đồng mới" value="64" />
      </div>
      <section className={styles.card}>
        <div className={styles.chartBars}>
          {[40, 64, 48, 72, 58, 84, 68, 92].map((height, index) => (
            <span key={index} style={{ height: `${height}%` }} />
          ))}
        </div>
      </section>
    </Screen>
  );
}

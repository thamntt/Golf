"use client";

import styles from "../page.module.css";
import { Screen, Toolbar } from "../_shared/components";
import { lineSlots } from "../_shared/data";

export default function LineScreen() {
  return (
    <Screen title="Golf Line Tập" subtitle="Danh sách line, sơ đồ line, in vé và dịch vụ bán kèm">
      <Toolbar primary="+ Thêm mới Line" filters={["Danh sách Line", "Sơ đồ Line", "In vé lẻ", "Gia hạn giờ"]} />
      <section className={styles.card}>
        <div className={styles.lineGrid}>
          {lineSlots.map((line) => (
            <article className={`${styles.lineBox} ${styles[line.status]}`} key={line.name}>
              <strong>{line.name}</strong>
              <span>{line.status === "free" ? "Còn trống" : line.status === "busy" ? "Đang dùng" : "Bảo trì"}</span>
            </article>
          ))}
        </div>
      </section>
    </Screen>
  );
}

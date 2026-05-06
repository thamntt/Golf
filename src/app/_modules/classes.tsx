"use client";

import styles from "../page.module.css";
import { Screen, Toolbar } from "../_shared/components";

export default function ClassesScreen() {
  return (
    <Screen title="Lịch Lớp" subtitle="Lớp học nhóm theo lịch tuần, booking và điểm danh">
      <Toolbar primary="+ Thêm lớp mới" filters={["Danh sách lớp", "Lịch tuần", "Điểm danh"]} />
      <div className={styles.cardGrid}>
        {["Beginner Kids", "Advanced Swing", "Weekend Group"].map((name) => (
          <article className={styles.classCard} key={name}>
            <strong>{name}</strong>
            <span>12 học viên · 3 buổi/tuần</span>
            <p>Thứ 2, 4, 6 · 17:30 - 19:00</p>
          </article>
        ))}
      </div>
    </Screen>
  );
}

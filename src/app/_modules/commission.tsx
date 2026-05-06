"use client";

import styles from "../page.module.css";
import { Screen, Toolbar } from "../_shared/components";

export default function CommissionScreen() {
  return (
    <Screen title="Hoa Hồng Sale" subtitle="Ma trận hoa hồng Sales và Coach, lịch sử chi trả">
      <Toolbar primary="+ Cấu hình hoa hồng" filters={["Ma trận Hoa hồng", "Lịch sử chi trả", "Sales", "Coach"]} />
      <section className={styles.card}>
        <div className={styles.matrix}>
          {["VIP × Teetime 8%", "Premium × Line 6%", "Coach × Buổi tập 120K", "Sale × HĐ mới 10%"].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>
    </Screen>
  );
}

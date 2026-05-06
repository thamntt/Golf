"use client";

import styles from "../page.module.css";
import { CardTitle, MiniTable, Process, Screen, Toolbar } from "../_shared/components";

export default function PricingScreen() {
  return (
    <Screen title="Bảng Giá" subtitle="Khu vực, Khung giờ, Bảng giá hợp đồng và Bảng giá vé lẻ">
      <Toolbar primary="Tạo Bảng Giá Mới" filters={["Bảng giá hợp đồng", "Bảng giá vé lẻ", "Khu vực", "Khung giờ"]} />
      <div className={styles.twoColumn}>
        <section className={styles.card}>
          <CardTitle title="Bảng giá hợp đồng" action="Nhập Excel" />
          <MiniTable rows={[["Gói Premium", "Teetime", "Active"], ["Gói Standard", "Line Tập", "Nháp"], ["Gói Family", "Combo", "Active"]]} />
        </section>
        <section className={styles.card}>
          <CardTitle title="Thiết lập phụ thuộc" action="Quản lý" />
          <Process steps={["Khu vực", "Khung giờ", "Bảng giá", "Kích hoạt"]} />
        </section>
      </div>
    </Screen>
  );
}

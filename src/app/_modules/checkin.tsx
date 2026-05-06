"use client";

import styles from "../page.module.css";
import { DetailLayout, MiniTable, Screen, Toolbar } from "../_shared/components";

export default function CheckinScreen() {
  return (
    <Screen title="Check-in / Checkout" subtitle="Realtime lượt vào/ra, thiết bị và sinh trắc học">
      <Toolbar primary="Check-in thủ công" filters={["Danh sách Check-in", "Thiết bị", "FaceID", "Vân tay", "Thẻ"]} />
      <div className={styles.twoColumn}>
        <section className={styles.card}>
          <MiniTable rows={[["HV0001", "07:12", "Đang trong sân"], ["HV0002", "08:05", "Đã checkout"], ["HV0003", "08:20", "Chờ xác nhận"]]} />
        </section>
        <DetailLayout title="Panel chi tiết lượt vào/ra" tabs={["Khách hàng", "Hợp đồng", "Thiết bị", "Khu vực"]} fields={["FaceID matched", "Thiết bị cổng 01", "Khu vực Teetime", "Checkout 10:35"]} compact />
      </div>
    </Screen>
  );
}

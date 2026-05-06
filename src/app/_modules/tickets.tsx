"use client";

import styles from "../page.module.css";
import { MiniTable, Screen, SimpleMetric, Toolbar } from "../_shared/components";

export default function TicketsScreen() {
  return (
    <Screen title="Vé Lẻ" subtitle="Bán vé đơn, vé nhóm, voucher và dịch vụ đi kèm">
      <Toolbar primary="+ Tạo vé mới" filters={["Danh sách vé", "Vouchers", "Dịch vụ đi kèm", "Vé lẻ", "Vé nhóm"]} />
      <div className={styles.statsGrid}>
        <SimpleMetric label="Vé hôm nay" value="72" />
        <SimpleMetric label="Doanh thu" value="8.6M" />
        <SimpleMetric label="Voucher active" value="9" />
        <SimpleMetric label="Add-ons" value="5" />
      </div>
      <section className={styles.card}>
        <MiniTable rows={[["VL001", "Khách vãng lai", "Confirmed"], ["VL002", "Nhóm 4 người", "Pending"], ["VC001", "Voucher 20%", "Active"]]} />
      </section>
    </Screen>
  );
}

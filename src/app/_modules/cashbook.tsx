"use client";

import styles from "../page.module.css";
import { MiniTable, Screen, SimpleMetric, Toolbar } from "../_shared/components";

export default function CashbookScreen() {
  return (
    <Screen title="Sổ Quỹ" subtitle="Phiếu thu, phiếu chi, công nợ và chứng từ tự sinh">
      <Toolbar primary="+ Phiếu thu" filters={["Phiếu thu", "Phiếu chi", "Công nợ", "Hôm nay", "Đã hạch toán"]} />
      <div className={styles.statsGrid}>
        <SimpleMetric label="Tổng thu" value="17.3M" />
        <SimpleMetric label="Tổng chi" value="2.1M" />
        <SimpleMetric label="Công nợ" value="8.4M" />
        <SimpleMetric label="Phiếu tự sinh" value="23" />
      </div>
      <section className={styles.card}>
        <MiniTable rows={[["PT001", "Hợp đồng CT001", "12.5M"], ["PT002", "Vé lẻ VL001", "650K"], ["PC001", "Hoa hồng HLV", "1.2M"]]} />
      </section>
    </Screen>
  );
}

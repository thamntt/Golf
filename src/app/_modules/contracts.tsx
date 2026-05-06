"use client";

import styles from "../page.module.css";
import { DetailLayout, MiniTable, Screen, Toolbar } from "../_shared/components";

export default function ContractsScreen() {
  return (
    <Screen title="Hợp Đồng" subtitle="Quản lý vòng đời hợp đồng hội viên: ký mới, gia hạn, nâng cấp, bảo lưu, chuyển nhượng">
      <Toolbar primary="+ Tạo hợp đồng" filters={["Hợp đồng", "Gia hạn", "Nâng cấp", "Bảo lưu", "Chuyển nhượng", "Chuyển đổi HĐ"]} />
      <section className={styles.card}>
        <MiniTable rows={[["CT001", "Nguyễn Văn A", "Active"], ["CT002", "Trần Thị B", "Pending"], ["CT003", "Lê Văn C", "Expired"]]} />
      </section>
      <DetailLayout title="Form tạo hợp đồng 6 section" tabs={["Khách hàng", "Gói dịch vụ", "Thanh toán", "Hoa hồng", "Mẫu in", "Timeline"]} fields={["Chọn KH hoặc tạo mới", "Snapshot giá từ M02", "Sinh phiếu thu M10", "Audit contract_history"]} />
    </Screen>
  );
}

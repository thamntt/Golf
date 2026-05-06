"use client";

import styles from "../page.module.css";
import { DetailLayout, Screen, Toolbar } from "../_shared/components";
import { teetimeSlots } from "../_shared/data";

export default function TeetimeScreen() {
  return (
    <Screen title="Golf Teetime" subtitle="Lưới khung giờ phát bóng theo ngày và chi nhánh">
      <Toolbar primary="Thiết lập teetime" filters={["Hôm nay", "NextVision", "Tất cả trạng thái"]} />
      <section className={styles.card}>
        <div className={styles.slotGrid}>
          {teetimeSlots.map(([time, label, tone]) => (
            <button className={`${styles.slot} ${styles[String(tone)]}`} key={time} type="button">
              <strong>{time}</strong>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>
      <DetailLayout title="Form đăng ký lịch chơi" tabs={["Khách đại diện", "Số khách", "Caddie", "Thanh toán", "Ghi chú"]} fields={["Ô xanh mở đăng ký", "Ô vàng mở chi tiết booking", "Đổi lịch / Hủy / Xóa", "Hoàn buổi vào HĐ khi hủy"]} />
    </Screen>
  );
}

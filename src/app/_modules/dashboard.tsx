"use client";

import { ArrowDown, ArrowUp, Calendar, DollarSign, Flag, Target, TrendingUp, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import styles from "../page.module.css";
import { BookingTable, CardTitle, Row, Screen } from "../_shared/components";
import type { ModuleKey } from "../_shared/types";

type TrendDirection = "up" | "down" | "new";

type StatCard = {
  label: string;
  value: string;
  trend: string;
  direction: TrendDirection;
  Icon: LucideIcon;
  tone: string;
};

type FacilityCard = {
  name: string;
  booked: string;
  available: string;
  revenue: string;
  Icon: LucideIcon;
  target: ModuleKey;
};

export default function Dashboard({ onOpen }: { onOpen: (key: ModuleKey) => void }) {
  const stats: StatCard[] = [
    { label: "Tổng Đặt Chỗ Hôm Nay", value: "50", trend: "+12%", direction: "up", Icon: Calendar, tone: "blue" },
    { label: "Khách Hàng Hoạt Động", value: "1,234", trend: "+8%", direction: "up", Icon: Users, tone: "green" },
    { label: "Doanh Thu Hôm Nay", value: "17.3M VNĐ", trend: "+23%", direction: "up", Icon: DollarSign, tone: "amber" },
    { label: "Tỷ Lệ Sử Dụng", value: "78%", trend: "+5%", direction: "up", Icon: TrendingUp, tone: "purple" },
  ];

  const facilities: FacilityCard[] = [
    { name: "Golf Teetime", booked: "32", available: "8", revenue: "12.5M VNĐ", Icon: Flag, target: "teetime" },
    { name: "Golf Line Tập", booked: "18", available: "12", revenue: "4.8M VNĐ", Icon: Target, target: "line" },
  ];

  return (
    <Screen
      title="Dashboard"
      subtitle="Chi nhánh: NextVision · Hôm nay 7 tháng 4, 2026 (GMT+7)"
    >
      <div className={styles.statsGrid}>
        {stats.map(({ Icon, direction, label, tone, trend, value }) => {
          const TrendIcon = direction === "up" ? ArrowUp : direction === "down" ? ArrowDown : null;
          const trendClass =
            direction === "up" ? styles.trendUp : direction === "down" ? styles.trendDown : styles.trendNew;
          return (
            <article className={styles.statCard} key={label}>
              <div>
                <p>{label}</p>
                <strong>{value}</strong>
                <span className={trendClass}>
                  {TrendIcon ? <TrendIcon size={14} /> : null}
                  {trend}
                </span>
              </div>
              <span className={`${styles.statIcon} ${styles[tone]}`}>
                <Icon size={24} />
              </span>
            </article>
          );
        })}
      </div>

      <section className={styles.card}>
        <CardTitle title="Tổng Quan Cơ Sở" />
        <div className={styles.facilityGrid}>
          {facilities.map(({ Icon, available, booked, name, revenue, target }) => {
            return (
              <article
                className={styles.facility}
                key={name}
                onClick={() => onOpen(target)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpen(target);
                  }
                }}
              >
                <div className={styles.facilityTitle}>
                  <Icon size={20} />
                  <h4>{name}</h4>
                </div>
                <dl>
                  <Row label="Đã đặt:" value={booked} />
                  <Row label="Còn trống:" value={available} positive />
                  <Row label="Doanh thu:" value={revenue} />
                </dl>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.card}>
        <CardTitle title="Đặt Chỗ Gần Đây" action="Xem tất cả" onClick={() => onOpen("teetime")} />
        <BookingTable onOpen={onOpen} />
      </section>
    </Screen>
  );
}

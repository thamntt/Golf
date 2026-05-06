"use client";

import { Calendar, DollarSign, Flag, Target, TrendingUp, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import styles from "../page.module.css";
import { BookingTable, CardTitle, Row, Screen } from "../_shared/components";
import type { ModuleKey } from "../_shared/types";

export default function Dashboard({ onOpen }: { onOpen: (key: ModuleKey) => void }) {
  const dashboardStats: Array<{
    label: string;
    value: string;
    trend: string;
    Icon: LucideIcon;
    tone: string;
  }> = [
    { label: "Tổng Đặt Chỗ Hôm Nay", value: "50", trend: "+12%", Icon: Calendar, tone: "blue" },
    { label: "Khách Hàng Hoạt Động", value: "1,234", trend: "+8%", Icon: Users, tone: "green" },
    { label: "Doanh Thu Hôm Nay", value: "17.3M VNĐ", trend: "+23%", Icon: DollarSign, tone: "amber" },
    { label: "Tỷ Lệ Sử Dụng", value: "78%", trend: "+5%", Icon: TrendingUp, tone: "purple" },
  ];

  const dashboardFacilities: Array<{
    name: string;
    booked: string;
    available: string;
    revenue: string;
    Icon: LucideIcon;
  }> = [
    { name: "Golf Teetime", booked: "32", available: "8", revenue: "12.5M VNĐ", Icon: Flag },
    { name: "Golf Line Tập", booked: "18", available: "12", revenue: "4.8M VNĐ", Icon: Target },
  ];

  return (
    <Screen title="Dashboard" subtitle="Tổng quan hệ thống quản lý cơ sở thể thao">
      <div className={styles.statsGrid}>
        {dashboardStats.map(({ Icon, label, tone, trend, value }) => {
          return (
            <article className={styles.statCard} key={label}>
              <div>
                <p>{label}</p>
                <strong>{value}</strong>
                <span>{trend}</span>
              </div>
              <span className={`${styles.statIcon} ${styles[tone]}`}>
                <Icon size={24} />
              </span>
            </article>
          );
        })}
      </div>

      <section className={styles.card}>
        <CardTitle title="Tổng Quan Cơ Sở" action="Mở lịch sân" onClick={() => onOpen("teetime")} />
        <div className={styles.facilityGrid}>
          {dashboardFacilities.map(({ Icon, available, booked, name, revenue }) => {
            return (
              <article className={styles.facility} key={name}>
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
        <BookingTable />
      </section>
    </Screen>
  );
}

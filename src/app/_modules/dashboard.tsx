"use client";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Calendar,
  CheckCircle2,
  DollarSign,
  Flag,
  Target,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
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
  note: string;
};

type FacilityCard = {
  name: string;
  booked: string;
  available: string;
  revenue: string;
  occupancy: number;
  Icon: LucideIcon;
  target: ModuleKey;
};

const text = {
  bookedToday: "T\u1ed5ng \u0110\u1eb7t Ch\u1ed7 H\u00f4m Nay",
  activeCustomers: "Kh\u00e1ch H\u00e0ng Ho\u1ea1t \u0110\u1ed9ng",
  revenueToday: "Doanh Thu H\u00f4m Nay",
  utilization: "T\u1ef7 L\u1ec7 S\u1eed D\u1ee5ng",
  revenueUnit: "VN\u0110",
  line: "Golf Line T\u1eadp",
  branchSubtitle: "Chi nh\u00e1nh: NextVision \u00b7 H\u00f4m nay 7 th\u00e1ng 4, 2026 (GMT+7)",
  overview: "T\u1ed5ng Quan V\u1eadn H\u00e0nh",
  facilityOverview: "S\u1ee9c Ch\u1ee9a Theo Khu",
  finance: "T\u00e0i Ch\u00ednh H\u00f4m Nay",
  alerts: "C\u1ea7n X\u1eed L\u00fd",
  recentBookings: "\u0110\u1eb7t Ch\u1ed7 G\u1ea7n \u0110\u00e2y",
  viewAll: "Xem t\u1ea5t c\u1ea3",
  booked: "\u0110\u00e3 \u0111\u1eb7t:",
  available: "C\u00f2n tr\u1ed1ng:",
  heroDescription: "Doanh thu, l\u01b0\u1ee3t \u0111\u1eb7t, s\u1ee9c ch\u1ee9a v\u00e0 c\u00e1c vi\u1ec7c c\u1ea7n x\u1eed l\u00fd trong ng\u00e0y.",
  viewReport: "Xem b\u00e1o c\u00e1o",
  openCashbook: "M\u1edf S\u1ed5 Qu\u1ef9",
  revenueByHour: "Doanh thu theo khung gi\u1edd",
};

export default function Dashboard({ onOpen }: { onOpen: (key: ModuleKey) => void }) {
  const stats: StatCard[] = [
    { label: text.bookedToday, value: "50", trend: "+12%", direction: "up", Icon: Calendar, tone: "blue", note: "32 teetime, 18 line t\u1eadp" },
    { label: text.activeCustomers, value: "1,234", trend: "+8%", direction: "up", Icon: Users, tone: "green", note: "214 h\u1ed9i vi\u00ean check-in 30 ng\u00e0y" },
    { label: text.revenueToday, value: `17.3M ${text.revenueUnit}`, trend: "+23%", direction: "up", Icon: DollarSign, tone: "amber", note: "12.5M teetime, 4.8M line" },
    { label: text.utilization, value: "78%", trend: "+5%", direction: "up", Icon: TrendingUp, tone: "purple", note: "Cao \u0111i\u1ec3m 16:00 - 19:00" },
  ];

  const facilities: FacilityCard[] = [
    { name: "Golf Teetime", booked: "32", available: "8", revenue: `12.5M ${text.revenueUnit}`, occupancy: 80, Icon: Flag, target: "teetime" },
    { name: text.line, booked: "18", available: "12", revenue: `4.8M ${text.revenueUnit}`, occupancy: 60, Icon: Target, target: "line" },
  ];

  const financeRows = [
    { label: "Ti\u1ec1n m\u1eb7t / POS", value: `9.8M ${text.revenueUnit}` },
    { label: "Chuy\u1ec3n kho\u1ea3n", value: `7.5M ${text.revenueUnit}` },
    { label: "C\u00f4ng n\u1ee3 \u0111\u1ebfn h\u1ea1n", value: `4.2M ${text.revenueUnit}`, warn: true },
    { label: "Hoa h\u1ed3ng ch\u1edd chi", value: `3.5M ${text.revenueUnit}` },
  ];

  const revenueTrend = [
    { label: "07h", value: 28 },
    { label: "09h", value: 42 },
    { label: "11h", value: 36 },
    { label: "13h", value: 52 },
    { label: "15h", value: 78 },
    { label: "17h", value: 92 },
    { label: "19h", value: 64 },
  ];

  const alerts = [
    { title: "6 booking ch\u1edd x\u00e1c nh\u1eadn", detail: "C\u1ea7n duy\u1ec7t tr\u01b0\u1edbc 15:00", Icon: AlertTriangle, target: "teetime" as ModuleKey },
    { title: "3 h\u1ed9i vi\u00ean s\u1eafp h\u1ebft h\u1ea1n", detail: "G\u00f3i c\u00f2n d\u01b0\u1edbi 7 ng\u00e0y", Icon: Users, target: "customers" as ModuleKey },
    { title: "2 phi\u1ebfu chi ch\u1edd duy\u1ec7t", detail: "Hoa h\u1ed3ng sale th\u00e1ng 3", Icon: WalletCards, target: "cashbook" as ModuleKey },
  ];

  return (
    <Screen title="Dashboard" subtitle={text.branchSubtitle}>
      <section className={styles.dashboardHero}>
        <div>
          <span>{text.overview}</span>
          <h3>NextVision Golf Center</h3>
          <p>{text.heroDescription}</p>
        </div>
        <button onClick={() => onOpen("reports")} type="button">
          <TrendingUp size={18} /> {text.viewReport}
        </button>
      </section>

      <div className={styles.statsGrid}>
        {stats.map(({ Icon, direction, label, note, tone, trend, value }) => {
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
                <small>{note}</small>
              </div>
              <span className={`${styles.statIcon} ${styles[tone]}`}>
                <Icon size={24} />
              </span>
            </article>
          );
        })}
      </div>

      <div className={styles.dashboardOverviewGrid}>
        <div className={styles.dashboardMainColumn}>
          <section className={styles.card}>
            <CardTitle title={text.facilityOverview} />
            <div className={styles.facilityGrid}>
              {facilities.map(({ Icon, available, booked, name, occupancy, revenue, target }) => (
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
                  <div className={styles.dashboardProgress}>
                    <span style={{ width: `${occupancy}%` }} />
                  </div>
                  <dl>
                    <Row label={text.booked} value={booked} />
                    <Row label={text.available} value={available} positive />
                    <Row label="Doanh thu:" value={revenue} />
                  </dl>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <CardTitle title={text.recentBookings} action={text.viewAll} onClick={() => onOpen("teetime")} />
            <BookingTable onOpen={onOpen} />
          </section>
        </div>

        <aside className={styles.dashboardSideColumn}>
          <section className={styles.card}>
            <CardTitle title={text.finance} action={text.openCashbook} onClick={() => onOpen("cashbook")} />
            <div className={styles.dashboardChart}>
              <header>
                <span>{text.revenueByHour}</span>
                <strong>17.3M {text.revenueUnit}</strong>
              </header>
              <div className={styles.dashboardBars}>
                {revenueTrend.map((item) => (
                  <div key={item.label}>
                    <span style={{ height: `${item.value}%` }} />
                    <small>{item.label}</small>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.dashboardFinance}>
              {financeRows.map((row) => (
                <div className={row.warn ? styles.dashboardWarnRow : undefined} key={row.label}>
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <CardTitle title={text.alerts} />
            <div className={styles.dashboardAlerts}>
              {alerts.map(({ Icon, detail, target, title }) => (
                <button key={title} onClick={() => onOpen(target)} type="button">
                  <span><Icon size={18} /></span>
                  <div>
                    <strong>{title}</strong>
                    <small>{detail}</small>
                  </div>
                  <CheckCircle2 size={16} />
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </Screen>
  );
}

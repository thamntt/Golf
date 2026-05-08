"use client";

import { useState } from "react";
import { BriefcaseBusiness, ChevronDown, Menu } from "lucide-react";
import styles from "./page.module.css";
import { navItems } from "./_shared/data";
import type { ModuleKey } from "./_shared/types";
import Dashboard from "./_modules/dashboard";
import CustomersScreen from "./_modules/customers";
import EmployeesScreen from "./_modules/employees";
import PricingScreen from "./_modules/pricing";
import ContractsScreen from "./_modules/contracts";
import TicketsScreen from "./_modules/tickets";
import TeetimeScreen from "./_modules/teetime";
import LineScreen from "./_modules/line";
import CoachScreen from "./_modules/coach";
import ClassesScreen from "./_modules/classes";
import CheckinScreen from "./_modules/checkin";
import CashbookScreen from "./_modules/cashbook";
import CommissionScreen from "./_modules/commission";
import SettingsScreen from "./_modules/settings";
import ReportsScreen from "./_modules/reports";

export default function Home() {
  const [active, setActive] = useState<ModuleKey>("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`${styles.shell} ${collapsed ? styles.collapsedShell : ""}`}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1>Golf Manager</h1>
          <button
            aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
            onClick={() => setCollapsed((value) => !value)}
            type="button"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className={styles.navigation} aria-label="Menu quản trị">
          {navItems.map((item) => {
            const Icon = item.Icon;
            return (
              <button
                className={active === item.key ? styles.activeNav : undefined}
                key={item.key}
                onClick={() => setActive(item.key)}
                type="button"
                title={collapsed ? item.label : undefined}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <p>Thứ Ba, 7 tháng 4, 2026</p>
          </div>

          <div className={styles.userTools}>
            <button className={styles.branchButton} type="button">
              <BriefcaseBusiness size={16} />
              NextVision
              <ChevronDown size={16} />
            </button>
            <span className={styles.role}>Admin</span>
            <span className={styles.avatar}>A</span>
          </div>
        </header>

        <div className={styles.content}>
          {active === "dashboard" && <Dashboard onOpen={setActive} />}
          {active === "customers" && <CustomersScreen />}
          {active === "employees" && <EmployeesScreen />}
          {active === "pricing" && <PricingScreen />}
          {active === "contracts" && <ContractsScreen />}
          {active === "tickets" && <TicketsScreen />}
          {active === "teetime" && <TeetimeScreen />}
          {active === "line" && <LineScreen />}
          {active === "coach" && <CoachScreen />}
          {active === "classes" && <ClassesScreen />}
          {active === "checkin" && <CheckinScreen />}
          {active === "cashbook" && <CashbookScreen />}
          {active === "commission" && <CommissionScreen />}
          {active === "settings" && <SettingsScreen />}
          {active === "reports" && <ReportsScreen />}
        </div>
      </main>
    </div>
  );
}

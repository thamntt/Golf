"use client";

import { useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  CreditCard,
  Globe2,
  HelpCircle,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Settings as SettingsIcon,
  Sun,
  Type,
  User,
} from "lucide-react";
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

const navSections: { items: ModuleKey[]; title: string }[] = [
  { title: "Tổng quan", items: ["dashboard", "reports"] },
  { title: "Vận hành sân", items: ["teetime", "line", "coach", "classes", "checkin"] },
  { title: "Kinh doanh", items: ["customers", "employees", "pricing", "contracts", "tickets"] },
  { title: "Tài chính", items: ["cashbook", "commission"] },
  { title: "Hệ thống", items: ["settings"] },
];

const navLabel: Partial<Record<ModuleKey, string>> = {
  customers: "Khách Hàng",
  employees: "Nhân viên",
  pricing: "Bảng Giá",
  contracts: "Hợp Đồng",
  tickets: "Vé Lẻ",
  line: "Golf Line Tập",
  coach: "Lịch HLV",
  classes: "Lịch Lớp",
  cashbook: "Sổ Quỹ",
  commission: "Hoa Hồng Sale",
  settings: "Cài Đặt",
  reports: "Báo cáo",
};

export default function Home() {
  const [active, setActive] = useState<ModuleKey>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  return (
    <div className={`${styles.shell} ${collapsed ? styles.collapsedShell : ""}`}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarBrand}>
            <span>GM</span>
            <div>
              <h1>Golf Manager</h1>
              <small>NextVision Suite</small>
            </div>
          </div>
          <button
            aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
            onClick={() => setCollapsed((value) => !value)}
            type="button"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className={styles.navigation} aria-label="Menu quản trị">
          {navSections.map((section) => (
            <div className={styles.navSection} key={section.title}>
              <div className={styles.navGroup}>{section.title}</div>
              {section.items.map((key) => {
                const item = navItems.find((navItem) => navItem.key === key);
                if (!item) return null;
                const Icon = item.Icon;
                const label = navLabel[item.key] ?? item.label;
                return (
                  <button
                    className={active === item.key ? styles.activeNav : undefined}
                    key={item.key}
                    onClick={() => setActive(item.key)}
                    type="button"
                    title={collapsed ? label : undefined}
                  >
                    <span className={styles.navIcon}><Icon size={18} /></span>
                    <span className={styles.navLabel}>{label}</span>
                  </button>
                );
              })}
            </div>
          ))}
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
            <button
              aria-expanded={accountMenuOpen}
              aria-label="Mở cài đặt tài khoản"
              className={styles.avatar}
              onClick={() => setAccountMenuOpen((value) => !value)}
              type="button"
            >
              A
            </button>
            {accountMenuOpen ? (
              <div className={styles.accountMenu}>
                <section className={styles.accountMenuHero}>
                  <span className={styles.accountAvatar}>N</span>
                  <div>
                    <strong>Nguyễn Văn A</strong>
                    <small>nguyenvana@gymmaster.vn</small>
                    <p><b>Quản lý</b><b>Premium</b></p>
                  </div>
                </section>

                <section className={styles.accountMenuList}>
                  <button type="button"><User size={18} /><span><strong>Hồ sơ của tôi</strong><small>Xem và chỉnh sửa thông tin</small></span></button>
                  <button onClick={() => { setActive("settings"); setAccountMenuOpen(false); }} type="button"><SettingsIcon size={18} /><span><strong>Cài đặt</strong><small>Quản lý tùy chọn hệ thống</small></span></button>
                  <button type="button"><CreditCard size={18} /><span><strong>Thanh toán & Gói</strong><small>Quản lý đăng ký của bạn</small></span></button>
                  <button type="button"><Bell size={18} /><span><strong>Thông báo</strong><small>Cấu hình thông báo</small></span><em>3</em></button>
                  <button type="button"><HelpCircle size={18} /><span><strong>Trợ giúp & Hỗ trợ</strong><small>Tài liệu và hướng dẫn</small></span></button>
                </section>

                <section className={styles.accountPrefs}>
                  <label><Globe2 size={16} />Ngôn ngữ</label>
                  <div className={styles.accountSegment}><button className={styles.accountSegmentActive} type="button">🇻🇳 Tiếng Việt</button><button type="button">🇬🇧 English</button></div>
                  <label><Moon size={16} />Giao diện</label>
                  <div className={styles.accountTheme}><button className={styles.accountThemeActive} type="button"><Sun size={16} />Sáng</button><button type="button"><Moon size={16} />Tối</button><button type="button"><Monitor size={16} />Hệ thống</button></div>
                  <label><Type size={16} />Kích thước chữ</label>
                  <div className={styles.accountSegment}><button type="button">Nhỏ</button><button className={styles.accountSegmentActive} type="button">Trung bình</button><button type="button">Lớn</button></div>
                </section>

                <section className={styles.accountLogout}>
                  <button type="button"><LogOut size={18} /><span><strong>Đăng xuất</strong><small>Thoát khỏi tài khoản</small></span></button>
                </section>
                <footer>GymMaster Pro v2.0 · © 2024</footer>
              </div>
            ) : null}
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

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
import { navItems } from "@/shared/data";
import type { ModuleKey } from "@/shared/types";
import DashboardView from "@/features/dashboard/DashboardView";
import CustomersView from "@/features/customers/CustomersView";
import EmployeesView from "@/features/employees/EmployeesView";
import PricingView from "@/features/pricing/PricingView";
import ContractsView from "@/features/contracts/ContractsView";
import TicketsView from "@/features/tickets/TicketsView";
import TeetimeView from "@/features/teetime/TeetimeView";
import LineView from "@/features/line/LineView";
import CoachScheduleView from "@/features/coach/CoachScheduleView";
import ClassScheduleView from "@/features/classes/ClassScheduleView";
import CheckinView from "@/features/checkin/CheckinView";
import CashbookView from "@/features/cashbook/CashbookView";
import CommissionView from "@/features/commission/CommissionView";
import SettingsView from "@/features/settings/SettingsView";
import ReportsView from "@/features/reports/ReportsView";
import styles from "./app-shell.module.css";

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

const branches = [
  { name: "NextVision", address: "Bến Nghé · 06:00-22:00", status: "Đang hoạt động" },
  { name: "Võ Thị Sáu", address: "Quận 3 · 05:30-22:30", status: "Đang hoạt động" },
  { name: "Thảo Điền", address: "TP. Thủ Đức · 07:00-21:30", status: "Bảo trì nhẹ" },
];

export default function AppShell() {
  const [authMode, setAuthMode] = useState<"login" | "branch" | "app">("login");
  const [active, setActive] = useState<ModuleKey>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [branchMenuOpen, setBranchMenuOpen] = useState(false);
  const [activeBranch, setActiveBranch] = useState("NextVision");
  const [branchReloading, setBranchReloading] = useState(false);
  const [branchDataVersion, setBranchDataVersion] = useState(0);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [accountLanguage, setAccountLanguage] = useState<"vi" | "en">("vi");
  const [accountTheme, setAccountTheme] = useState<"light" | "dark" | "system">("light");
  const [accountFontSize, setAccountFontSize] = useState<"small" | "medium" | "large">("medium");
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const switchBranch = (branchName: string) => {
    setBranchMenuOpen(false);
    if (branchName === activeBranch) return;
    setActiveBranch(branchName);
    setBranchReloading(true);
    window.setTimeout(() => {
      setBranchDataVersion((version) => version + 1);
      setBranchReloading(false);
    }, 700);
  };

  if (authMode === "login") {
    return (
      <main className={styles.authShell}>
        <section className={styles.authPanel}>
          <div className={styles.authBrand}>
            <span>GM</span>
            <div>
              <h1>Đăng nhập Golf Manager</h1>
              <p>Truy cập hệ thống vận hành hội viên, check-in, lớp học và tài chính. Tài khoản được Admin tạo hoặc mời trong phần Phân quyền/Agent.</p>
            </div>
          </div>
          <form className={styles.authForm}>
            <label><span>Email / tài khoản</span><input defaultValue="admin@nextgolf.vn" type="email" /></label>
            <label><span>Mật khẩu</span><input defaultValue="nextvision2026" type="password" /></label>
            <button onClick={(event) => { event.preventDefault(); setAuthMode("branch"); }} type="submit">Đăng nhập</button>
          </form>
          <footer>Tài khoản mới được cấp bởi quản trị viên trong hệ thống.</footer>
        </section>
      </main>
    );
  }

  if (authMode === "branch") {
    return (
      <main className={styles.authShell}>
        <section className={styles.authPanel}>
          <div className={styles.authBrand}>
            <span>GM</span>
            <div>
              <h1>Chọn chi nhánh làm việc</h1>
              <p>Dữ liệu dashboard, check-in, lịch lớp, sổ quỹ và báo cáo sẽ được lọc theo chi nhánh đang chọn.</p>
            </div>
          </div>
          <div className={styles.authBranchList}>
            {branches.map((branch) => (
              <button className={activeBranch === branch.name ? styles.authBranchActive : undefined} key={branch.name} onClick={() => setActiveBranch(branch.name)} type="button">
                <strong>{branch.name}</strong>
                <span>{branch.address}</span>
                <small>{branch.status}</small>
              </button>
            ))}
          </div>
          <form className={styles.authForm}>
            <button onClick={(event) => { event.preventDefault(); setAuthMode("app"); }} type="submit">Vào hệ thống</button>
          </form>
        </section>
      </main>
    );
  }

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
          <button aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"} onClick={() => setCollapsed((value) => !value)} type="button">
            <Menu size={20} />
          </button>
        </div>

        <nav aria-label="Menu quản trị" className={styles.navigation}>
          {navSections.map((section) => (
            <div className={styles.navSection} key={section.title}>
              <div className={styles.navGroup}>{section.title}</div>
              {section.items.map((key) => {
                const item = navItems.find((navItem) => navItem.key === key);
                if (!item) return null;
                const Icon = item.Icon;
                const label = navLabel[item.key] ?? item.label;
                return (
                  <button className={active === item.key ? styles.activeNav : undefined} key={item.key} onClick={() => setActive(item.key)} title={collapsed ? label : undefined} type="button">
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
            <strong>Dữ liệu chi nhánh: {activeBranch}</strong>
          </div>

          <div className={styles.userTools}>
            <button className={styles.branchButton} onClick={() => setBranchMenuOpen((value) => !value)} type="button">
              <BriefcaseBusiness size={16} />
              {activeBranch}
              <ChevronDown size={16} />
            </button>
            {branchMenuOpen ? (
              <div className={styles.branchMenu}>
                {branches.map((branch) => (
                  <button className={activeBranch === branch.name ? styles.branchMenuActive : undefined} key={branch.name} onClick={() => switchBranch(branch.name)} type="button">
                    <strong>{branch.name}</strong>
                    <span>{branch.address}</span>
                    <small>{branch.status}</small>
                  </button>
                ))}
              </div>
            ) : null}
            <span className={styles.role}>Admin</span>
            <button aria-expanded={accountMenuOpen} aria-label="Mở cài đặt tài khoản" className={styles.avatar} onClick={() => setAccountMenuOpen((value) => !value)} type="button">
              A
            </button>
            {accountMenuOpen ? (
              <div className={styles.accountMenu}>
                <section className={styles.accountMenuHero}>
                  <span className={styles.accountAvatar}>N</span>
                  <div>
                    <strong>Nguyễn Văn A</strong>
                    <small>nguyenvana@nextgolf.vn</small>
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
                  <div className={styles.accountSegment}>
                    <button className={accountLanguage === "vi" ? styles.accountSegmentActive : undefined} onClick={() => setAccountLanguage("vi")} type="button">Tiếng Việt</button>
                    <button className={accountLanguage === "en" ? styles.accountSegmentActive : undefined} onClick={() => setAccountLanguage("en")} type="button">English</button>
                  </div>
                  <label><Moon size={16} />Giao diện</label>
                  <div className={styles.accountTheme}>
                    <button className={accountTheme === "light" ? styles.accountThemeActive : undefined} onClick={() => setAccountTheme("light")} type="button"><Sun size={16} />Sáng</button>
                    <button className={accountTheme === "dark" ? styles.accountThemeActive : undefined} onClick={() => setAccountTheme("dark")} type="button"><Moon size={16} />Tối</button>
                    <button className={accountTheme === "system" ? styles.accountThemeActive : undefined} onClick={() => setAccountTheme("system")} type="button"><Monitor size={16} />Hệ thống</button>
                  </div>
                  <label><Type size={16} />Kích thước chữ</label>
                  <div className={styles.accountSegment}>
                    <button className={accountFontSize === "small" ? styles.accountSegmentActive : undefined} onClick={() => setAccountFontSize("small")} type="button">Nhỏ</button>
                    <button className={accountFontSize === "medium" ? styles.accountSegmentActive : undefined} onClick={() => setAccountFontSize("medium")} type="button">Trung bình</button>
                    <button className={accountFontSize === "large" ? styles.accountSegmentActive : undefined} onClick={() => setAccountFontSize("large")} type="button">Lớn</button>
                  </div>
                </section>

                <section className={styles.accountLogout}>
                  <button onClick={() => setLogoutConfirmOpen(true)} type="button"><LogOut size={18} /><span><strong>Đăng xuất</strong><small>Thoát khỏi tài khoản</small></span></button>
                </section>
                <footer>Golf Manager Pro v2.0 · © 2026</footer>
              </div>
            ) : null}
          </div>
        </header>

        {logoutConfirmOpen ? (
          <div className={styles.modalOverlay} onClick={() => setLogoutConfirmOpen(false)}>
            <section className={styles.accountConfirmDialog} onClick={(event) => event.stopPropagation()}>
              <h3>Xác nhận đăng xuất</h3>
              <p>Bạn có chắc chắn muốn thoát khỏi tài khoản quản trị NextVision Golf Center?</p>
              <footer>
                <button onClick={() => setLogoutConfirmOpen(false)} type="button">Hủy</button>
                <button onClick={() => { setLogoutConfirmOpen(false); setAccountMenuOpen(false); setAuthMode("login"); }} type="button"><LogOut size={16} />Đăng xuất</button>
              </footer>
            </section>
          </div>
        ) : null}

        <div className={`${styles.content} ${branchReloading ? styles.contentLoading : ""}`} key={`${activeBranch}-${branchDataVersion}`}>
          {branchReloading ? (
            <div className={styles.branchReloadOverlay}>
              <span />
              <strong>Đang tải dữ liệu chi nhánh {activeBranch}</strong>
              <p>Cập nhật dashboard, lịch, check-in, sổ quỹ, thiết bị và báo cáo theo chi nhánh mới.</p>
            </div>
          ) : null}
          {active === "dashboard" && <DashboardView onOpen={setActive} />}
          {active === "customers" && <CustomersView />}
          {active === "employees" && <EmployeesView />}
          {active === "pricing" && <PricingView />}
          {active === "contracts" && <ContractsView />}
          {active === "tickets" && <TicketsView />}
          {active === "teetime" && <TeetimeView />}
          {active === "line" && <LineView />}
          {active === "coach" && <CoachScheduleView />}
          {active === "classes" && <ClassScheduleView />}
          {active === "checkin" && <CheckinView />}
          {active === "cashbook" && <CashbookView />}
          {active === "commission" && <CommissionView />}
          {active === "settings" && <SettingsView />}
          {active === "reports" && <ReportsView />}
        </div>
      </main>
    </div>
  );
}

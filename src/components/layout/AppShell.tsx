"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  CheckCircle2,
  CreditCard,
  Globe2,
  HelpCircle,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Mail,
  Menu,
  Monitor,
  Moon,
  Save,
  ShieldCheck,
  Smartphone,
  Settings as SettingsIcon,
  Sun,
  Type,
  User,
  X,
} from "lucide-react";
import { navItems, systemBranches } from "@/shared/data";
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

const englishNavSection: Record<string, string> = {
  "Tá»•ng quan": "Overview",
  "Váº­n hÃ nh sÃ¢n": "Golf Operations",
  "Kinh doanh": "Commercial",
  "TÃ i chÃ­nh": "Finance",
  "Há»‡ thá»‘ng": "System",
  "Tổng quan": "Overview",
  "Vận hành sân": "Golf Operations",
  "Tài chính": "Finance",
  "Hệ thống": "System",
};

const englishNavLabel: Partial<Record<ModuleKey, string>> = {
  dashboard: "Dashboard",
  reports: "Reports",
  teetime: "Golf Teetime",
  line: "Practice Lines",
  coach: "Coach Schedule",
  classes: "Class Schedule",
  checkin: "Check-in/out",
  customers: "Customers",
  employees: "Employees",
  pricing: "Pricing",
  contracts: "Contracts",
  tickets: "Single Tickets",
  cashbook: "Cashbook",
  commission: "Sales Commission",
  settings: "Settings",
};

const branches = systemBranches;

const initialNotifications = [
  { id: "N-001", title: "Teetime 14:00 đã đủ 4 người chơi", body: "Flight của Huỳnh Xuân Long tại Bến Nghé cần xác nhận caddie trước 13:30.", time: "5 phút trước", module: "teetime" as ModuleKey, unread: true, tone: "blue" },
  { id: "N-002", title: "Công nợ hội viên quá hạn", body: "3 hợp đồng tại Thảo Điền quá hạn thanh toán, tổng 64.000.000đ.", time: "18 phút trước", module: "cashbook" as ModuleKey, unread: true, tone: "red" },
  { id: "N-003", title: "Thiết bị Face ID offline", body: "FACE-DR mất kết nối từ 09:10. Kiểm tra trong Check-in/out > Quản lý thiết bị.", time: "42 phút trước", module: "checkin" as ModuleKey, unread: true, tone: "amber" },
  { id: "N-004", title: "Lớp Short Game còn 7 chỗ", body: "Nên đẩy khuyến mãi giờ thấp điểm cho lớp thứ Sáu 19:00.", time: "Hôm nay", module: "classes" as ModuleKey, unread: false, tone: "green" },
];

export default function AppShell() {
  const [authMode, setAuthMode] = useState<"login" | "branch" | "app">("login");
  const [active, setActive] = useState<ModuleKey>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [branchMenuOpen, setBranchMenuOpen] = useState(false);
  const [activeBranch, setActiveBranch] = useState(systemBranches[0].shortName);
  const [branchReloading, setBranchReloading] = useState(false);
  const [branchDataVersion, setBranchDataVersion] = useState(0);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [accountLanguage, setAccountLanguage] = useState<"vi" | "en">("vi");
  const [accountTheme, setAccountTheme] = useState<"light" | "dark" | "system">("light");
  const [accountFontSize, setAccountFontSize] = useState<"small" | "medium" | "large">("medium");
  const [accountDialog, setAccountDialog] = useState<"profile" | "security" | "subscription" | "help" | null>(null);
  const [accountToast, setAccountToast] = useState("");
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("admin@nextgolf.vn");
  const [loginPassword, setLoginPassword] = useState("nextvision2026");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const unreadNotifications = notifications.filter((item) => item.unread).length;
  const isEnglish = accountLanguage === "en";

  useEffect(() => {
    document.documentElement.lang = accountLanguage;
    document.documentElement.dataset.theme = accountTheme;
    document.documentElement.dataset.fontSize = accountFontSize;
    document.documentElement.style.fontSize = accountFontSize === "small" ? "15px" : accountFontSize === "large" ? "17px" : "16px";
    return () => {
      document.documentElement.style.fontSize = "";
    };
  }, [accountFontSize, accountLanguage, accountTheme]);

  const openNotification = (id: string, module: ModuleKey) => {
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, unread: false } : item));
    setNotificationOpen(false);
    setActive(module);
  };

  const showAccountToast = (message: string) => {
    setAccountToast(message);
    window.setTimeout(() => setAccountToast(""), 2200);
  };

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

  const submitLogin = () => {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail.trim());
    if (!emailValid) {
      setLoginError("Email không hợp lệ. Vui lòng nhập đúng định dạng email.");
      return;
    }
    if (loginPassword.length < 8) {
      setLoginError("Mật khẩu phải có tối thiểu 8 ký tự.");
      return;
    }
    if (loginEmail.trim().toLowerCase() !== "admin@nextgolf.vn" || loginPassword !== "nextvision2026") {
      setLoginError("Sai tài khoản hoặc mật khẩu. Chỉ tài khoản được Admin cấp mới đăng nhập được.");
      return;
    }
    setLoginError("");
    setAuthMode("branch");
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
          <div className={styles.authTestAccount}>
            <strong>Tài khoản test</strong>
            <span>Email: admin@nextgolf.vn</span>
            <span>Mật khẩu: nextvision2026</span>
          </div>
          <form className={styles.authForm}>
            <label><span>Email / tài khoản</span><input onChange={(event) => setLoginEmail(event.target.value)} type="email" value={loginEmail} /></label>
            <label>
              <span>Mật khẩu</span>
              <div className={styles.authPasswordField}>
                <input onChange={(event) => setLoginPassword(event.target.value)} type={showPassword ? "text" : "password"} value={loginPassword} />
                <button aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"} onClick={() => setShowPassword((value) => !value)} type="button">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
              </div>
            </label>
            {loginError ? <div className={styles.authError}>{loginError}</div> : null}
            <button onClick={(event) => { event.preventDefault(); submitLogin(); }} type="submit">Đăng nhập</button>
            <button className={styles.authLinkButton} onClick={() => { setForgotOpen(true); setForgotEmail(loginEmail); setForgotSent(false); }} type="button">Quên mật khẩu?</button>
          </form>
          <footer>Tài khoản mới được cấp bởi quản trị viên trong hệ thống.</footer>
        </section>
        {forgotOpen ? (
          <section className={styles.authModalOverlay}>
            <div className={styles.authResetModal}>
              <h2>Khôi phục mật khẩu</h2>
              <p>Nhập email đã được Admin cấp. Hệ thống sẽ gửi liên kết đặt lại mật khẩu nếu tài khoản tồn tại và đang hoạt động.</p>
              <label><span>Email nhận liên kết</span><input onChange={(event) => setForgotEmail(event.target.value)} type="email" value={forgotEmail} /></label>
              {forgotSent ? <div className={styles.authSuccess}>Đã gửi hướng dẫn đặt lại mật khẩu tới email hợp lệ trong môi trường demo.</div> : null}
              <div>
                <button onClick={() => setForgotOpen(false)} type="button">Hủy</button>
                <button onClick={() => {
                  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.trim())) setForgotSent(true);
                  else setLoginError("Email khôi phục không hợp lệ.");
                }} type="button">Gửi hướng dẫn</button>
              </div>
            </div>
          </section>
        ) : null}
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
              <button className={activeBranch === branch.shortName ? styles.authBranchActive : undefined} key={branch.code} onClick={() => setActiveBranch(branch.shortName)} type="button">
                <strong>{branch.name}</strong>
                <span>{branch.displayAddress}</span>
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
    <div className={`${styles.shell} ${collapsed ? styles.collapsedShell : ""} ${accountTheme === "dark" ? styles.themeDark : ""} ${accountFontSize === "small" ? styles.fontSmall : accountFontSize === "large" ? styles.fontLarge : ""}`}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarBrand}>
            <button aria-label={collapsed ? "Mở rộng menu" : "Trang quản trị Golf Manager"} className={styles.brandMark} onClick={() => collapsed ? setCollapsed(false) : undefined} type="button">GM</button>
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
              <div className={styles.navGroup}>{isEnglish ? englishNavSection[section.title] ?? section.title : section.title}</div>
              {section.items.map((key) => {
                const item = navItems.find((navItem) => navItem.key === key);
                if (!item) return null;
                const Icon = item.Icon;
                const label = isEnglish ? englishNavLabel[item.key] ?? item.label : navLabel[item.key] ?? item.label;
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
            <p>{isEnglish ? "Tuesday, April 7, 2026" : "Thứ Ba, 7 tháng 4, 2026"}</p>
            <strong>{isEnglish ? "Branch data" : "Dữ liệu chi nhánh"}: {activeBranch}</strong>
          </div>

          <div className={styles.userTools}>
            <button aria-expanded={notificationOpen} aria-label="Mở trung tâm thông báo" className={styles.notificationButton} onClick={() => { setNotificationOpen((value) => !value); setAccountMenuOpen(false); setBranchMenuOpen(false); }} type="button">
              <Bell size={18} />
              {unreadNotifications ? <span>{unreadNotifications}</span> : null}
            </button>
            {notificationOpen ? (
              <div className={styles.notificationPanel}>
                <header>
                  <div>
                    <strong>{isEnglish ? "Operations Notifications" : "Thông báo vận hành"}</strong>
                    <span>{unreadNotifications} {isEnglish ? "unread" : "thông báo chưa đọc"}</span>
                  </div>
                  <button onClick={() => setNotifications((items) => items.map((item) => ({ ...item, unread: false })))} type="button">{isEnglish ? "Mark all read" : "Đánh dấu đã đọc"}</button>
                </header>
                <section>
                  {notifications.map((item) => (
                    <button className={`${styles.notificationItem} ${item.unread ? styles.notificationUnread : ""}`} key={item.id} onClick={() => openNotification(item.id, item.module)} type="button">
                      <i className={styles[`notificationTone${item.tone[0].toUpperCase()}${item.tone.slice(1)}`]} />
                      <span>
                        <strong>{isEnglish ? item.title.replace("Teetime 14:00 đã đủ 4 người chơi", "Teetime 14:00 is fully booked").replace("Công nợ hội viên quá hạn", "Overdue member debt").replace("Thiết bị Face ID offline", "Face ID device offline").replace("Lớp Short Game còn 7 chỗ", "Short Game class has 7 slots left") : item.title}</strong>
                        <small>{isEnglish ? item.body.replace("Flight của Huỳnh Xuân Long tại Bến Nghé cần xác nhận caddie trước 13:30.", "Huynh Xuan Long's flight at Ben Nghe needs caddie confirmation before 13:30.").replace("3 hợp đồng tại Thảo Điền quá hạn thanh toán, tổng 64.000.000đ.", "3 contracts at Thao Dien are overdue, totaling VND 64,000,000.").replace("FACE-DR mất kết nối từ 09:10. Kiểm tra trong Check-in/out > Quản lý thiết bị.", "FACE-DR has been offline since 09:10. Check Check-in/out > Device Management.").replace("Nên đẩy khuyến mãi giờ thấp điểm cho lớp thứ Sáu 19:00.", "Consider off-peak promotion for Friday 19:00 class.") : item.body}</small>
                        <em>{item.time}</em>
                      </span>
                    </button>
                  ))}
                  {!notifications.length ? <p className={styles.notificationEmpty}>{isEnglish ? "No notifications." : "Không còn thông báo mới."}</p> : null}
                </section>
                <footer>
                  <button onClick={() => { setActive("reports"); setNotificationOpen(false); }} type="button">{isEnglish ? "Open alerts report" : "Xem báo cáo cảnh báo"}</button>
                  <button onClick={() => setNotifications([])} type="button">{isEnglish ? "Clear all" : "Xóa tất cả"}</button>
                </footer>
              </div>
            ) : null}
            <button className={styles.branchButton} onClick={() => { setBranchMenuOpen((value) => !value); setNotificationOpen(false); setAccountMenuOpen(false); }} type="button">
              <BriefcaseBusiness size={16} />
              {activeBranch}
              <ChevronDown size={16} />
            </button>
            {branchMenuOpen ? (
              <div className={styles.branchMenu}>
                {branches.map((branch) => (
                  <button className={activeBranch === branch.shortName ? styles.branchMenuActive : undefined} key={branch.code} onClick={() => switchBranch(branch.shortName)} type="button">
                    <strong>{branch.name}</strong>
                    <span>{branch.displayAddress}</span>
                    <small>{branch.status}</small>
                  </button>
                ))}
              </div>
            ) : null}
            <span className={styles.role}>Admin</span>
            <button aria-expanded={accountMenuOpen} aria-label="Mở cài đặt tài khoản" className={styles.avatar} onClick={() => { setAccountMenuOpen((value) => !value); setNotificationOpen(false); setBranchMenuOpen(false); }} type="button">
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
                  <button onClick={() => { setAccountDialog("profile"); setAccountMenuOpen(false); }} type="button"><User size={18} /><span><strong>{isEnglish ? "My Profile" : "Hồ sơ của tôi"}</strong><small>{isEnglish ? "View and edit account information" : "Xem và chỉnh sửa thông tin"}</small></span></button>
                  <button onClick={() => { setActive("settings"); setAccountMenuOpen(false); }} type="button"><SettingsIcon size={18} /><span><strong>{isEnglish ? "Settings" : "Cài đặt"}</strong><small>{isEnglish ? "Manage system preferences" : "Quản lý tùy chọn hệ thống"}</small></span></button>
                  <button onClick={() => { setAccountDialog("subscription"); setAccountMenuOpen(false); }} type="button"><CreditCard size={18} /><span><strong>{isEnglish ? "Billing & Plan" : "Thanh toán & Gói"}</strong><small>{isEnglish ? "Manage your subscription" : "Quản lý đăng ký của bạn"}</small></span></button>
                  <button onClick={() => { setNotificationOpen(true); setAccountMenuOpen(false); }} type="button"><Bell size={18} /><span><strong>{isEnglish ? "Notifications" : "Thông báo"}</strong><small>{isEnglish ? "Notification preferences" : "Cấu hình thông báo"}</small></span><em>{unreadNotifications}</em></button>
                  <button onClick={() => { setAccountDialog("help"); setAccountMenuOpen(false); }} type="button"><HelpCircle size={18} /><span><strong>{isEnglish ? "Help & Support" : "Trợ giúp & Hỗ trợ"}</strong><small>{isEnglish ? "Docs and operation guides" : "Tài liệu và hướng dẫn"}</small></span></button>
                  <button onClick={() => { setAccountDialog("security"); setAccountMenuOpen(false); }} type="button"><KeyRound size={18} /><span><strong>{isEnglish ? "Account Security" : "Bảo mật tài khoản"}</strong><small>{isEnglish ? "Password and login sessions" : "Đổi mật khẩu và phiên đăng nhập"}</small></span></button>
                </section>

                <section className={styles.accountPrefs}>
                  <label><Globe2 size={16} />{isEnglish ? "Language" : "Ngôn ngữ"}</label>
                  <div className={styles.accountSegment}>
                    <button className={accountLanguage === "vi" ? styles.accountSegmentActive : undefined} onClick={() => { setAccountLanguage("vi"); showAccountToast("Đã chuyển ngôn ngữ sang Tiếng Việt."); }} type="button">Tiếng Việt</button>
                    <button className={accountLanguage === "en" ? styles.accountSegmentActive : undefined} onClick={() => { setAccountLanguage("en"); showAccountToast("Language switched to English for this session."); }} type="button">English</button>
                  </div>
                  <label><Moon size={16} />{isEnglish ? "Theme" : "Giao diện"}</label>
                  <div className={styles.accountTheme}>
                    <button className={accountTheme === "light" ? styles.accountThemeActive : undefined} onClick={() => { setAccountTheme("light"); showAccountToast(isEnglish ? "Light theme applied." : "Đã áp dụng giao diện sáng."); }} type="button"><Sun size={16} />{isEnglish ? "Light" : "Sáng"}</button>
                    <button className={accountTheme === "dark" ? styles.accountThemeActive : undefined} onClick={() => { setAccountTheme("dark"); showAccountToast(isEnglish ? "Dark theme applied." : "Đã áp dụng giao diện tối."); }} type="button"><Moon size={16} />{isEnglish ? "Dark" : "Tối"}</button>
                    <button className={accountTheme === "system" ? styles.accountThemeActive : undefined} onClick={() => { setAccountTheme("system"); showAccountToast(isEnglish ? "System theme applied." : "Đã đồng bộ theo hệ thống."); }} type="button"><Monitor size={16} />{isEnglish ? "System" : "Hệ thống"}</button>
                  </div>
                  <label><Type size={16} />{isEnglish ? "Text size" : "Kích thước chữ"}</label>
                  <div className={styles.accountSegment}>
                    <button className={accountFontSize === "small" ? styles.accountSegmentActive : undefined} onClick={() => { setAccountFontSize("small"); showAccountToast(isEnglish ? "Small text size applied." : "Đã thu gọn cỡ chữ."); }} type="button">{isEnglish ? "Small" : "Nhỏ"}</button>
                    <button className={accountFontSize === "medium" ? styles.accountSegmentActive : undefined} onClick={() => { setAccountFontSize("medium"); showAccountToast(isEnglish ? "Default text size applied." : "Đã dùng cỡ chữ tiêu chuẩn."); }} type="button">{isEnglish ? "Default" : "Trung bình"}</button>
                    <button className={accountFontSize === "large" ? styles.accountSegmentActive : undefined} onClick={() => { setAccountFontSize("large"); showAccountToast(isEnglish ? "Large text size applied." : "Đã tăng cỡ chữ."); }} type="button">{isEnglish ? "Large" : "Lớn"}</button>
                  </div>
                </section>

                <section className={styles.accountLogout}>
                  <button onClick={() => setLogoutConfirmOpen(true)} type="button"><LogOut size={18} /><span><strong>{isEnglish ? "Sign out" : "Đăng xuất"}</strong><small>{isEnglish ? "Leave this account" : "Thoát khỏi tài khoản"}</small></span></button>
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

        {accountDialog ? (
          <div className={styles.modalOverlay} onClick={() => setAccountDialog(null)}>
            <section className={styles.accountWorkDialog} onClick={(event) => event.stopPropagation()}>
              <header>
                <span>{accountDialog === "profile" ? <User size={20} /> : accountDialog === "security" ? <KeyRound size={20} /> : accountDialog === "subscription" ? <CreditCard size={20} /> : <HelpCircle size={20} />}</span>
                <div>
                  <strong>
                    {accountDialog === "profile" ? "Hồ sơ tài khoản" : accountDialog === "security" ? "Bảo mật tài khoản" : accountDialog === "subscription" ? "Thanh toán & gói sử dụng" : "Trợ giúp & hỗ trợ"}
                  </strong>
                  <small>
                    {accountDialog === "profile" ? "Thông tin người dùng đang đăng nhập và dữ liệu hiển thị trên hệ thống." : accountDialog === "security" ? "Quản lý mật khẩu, 2FA và phiên đăng nhập." : accountDialog === "subscription" ? "Theo dõi gói NextVision Golf Manager và hóa đơn dịch vụ." : "Kênh hỗ trợ vận hành cho trung tâm golf."}
                  </small>
                </div>
                <button aria-label="Đóng" onClick={() => setAccountDialog(null)} type="button"><X size={18} /></button>
              </header>

              {accountDialog === "profile" ? (
                <div className={styles.accountFormGrid}>
                  <label><span>Họ và tên</span><input defaultValue="Nguyễn Văn A" /></label>
                  <label><span>Email</span><input defaultValue="nguyenvana@nextgolf.vn" type="email" /></label>
                  <label><span>Số điện thoại</span><input defaultValue="0901234567" /></label>
                  <label><span>Vai trò</span><select defaultValue="Admin"><option>Admin</option><option>Quản lý chi nhánh</option><option>Lễ tân</option></select></label>
                  <label className={styles.accountFullField}><span>Chi nhánh được phân quyền</span><input defaultValue="Bến Nghé, Võ Thị Sáu, Thảo Điền" /></label>
                </div>
              ) : null}

              {accountDialog === "security" ? (
                <div className={styles.accountSecurityGrid}>
                  <article><ShieldCheck size={20} /><strong>2FA qua email</strong><span>Đang bật cho tài khoản Admin.</span><button onClick={() => showAccountToast("Đã gửi mã xác thực thử nghiệm tới email.")} type="button">Gửi mã thử</button></article>
                  <article><Smartphone size={20} /><strong>Thiết bị đăng nhập</strong><span>Chrome Windows · Bến Nghé · hoạt động hiện tại.</span><button onClick={() => showAccountToast("Đã giữ phiên hiện tại và đăng xuất các phiên khác trong demo.")} type="button">Đăng xuất phiên khác</button></article>
                  <label><span>Mật khẩu hiện tại</span><input type="password" /></label>
                  <label><span>Mật khẩu mới</span><input type="password" /></label>
                  <label><span>Nhập lại mật khẩu mới</span><input type="password" /></label>
                </div>
              ) : null}

              {accountDialog === "subscription" ? (
                <div className={styles.accountSubscription}>
                  <article><CheckCircle2 size={22} /><div><strong>Gói Premium Golf Operations</strong><span>Hiệu lực đến 31/12/2026 · 4 chi nhánh · 25 tài khoản nội bộ</span></div><b>Đang hoạt động</b></article>
                  <dl><div><dt>Chu kỳ thanh toán</dt><dd>12 tháng</dd></div><div><dt>Hóa đơn gần nhất</dt><dd>INV-2026-0412 · 18.000.000đ</dd></div><div><dt>Phương thức</dt><dd>Chuyển khoản Vietcombank</dd></div></dl>
                  <button onClick={() => { setActive("cashbook"); setAccountDialog(null); }} type="button">Mở chứng từ thanh toán</button>
                </div>
              ) : null}

              {accountDialog === "help" ? (
                <div className={styles.accountHelpGrid}>
                  <button onClick={() => { setActive("settings"); setAccountDialog(null); }} type="button"><SettingsIcon size={18} /><span><strong>Hướng dẫn cấu hình hệ thống</strong><small>Mở module Cài đặt để kiểm tra phân quyền, mẫu in và thiết bị.</small></span></button>
                  <button onClick={() => showAccountToast("Đã tạo ticket hỗ trợ #SUP-2026-0412 trong demo.")} type="button"><Mail size={18} /><span><strong>Gửi yêu cầu hỗ trợ</strong><small>Phản hồi SLA 4 giờ làm việc cho gói Premium.</small></span></button>
                  <button onClick={() => { setActive("reports"); setAccountDialog(null); }} type="button"><Bell size={18} /><span><strong>Xem cảnh báo vận hành</strong><small>Đi tới Báo cáo để xử lý các cảnh báo quan trọng.</small></span></button>
                </div>
              ) : null}

              <footer>
                <button onClick={() => setAccountDialog(null)} type="button">Hủy</button>
                <button onClick={() => { setAccountDialog(null); showAccountToast("Đã lưu thay đổi tài khoản trong phiên làm việc."); }} type="button"><Save size={16} />Lưu thay đổi</button>
              </footer>
            </section>
          </div>
        ) : null}

        {accountToast ? <div className={styles.accountToast}>{accountToast}</div> : null}

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

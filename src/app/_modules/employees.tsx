"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock3,
  Edit3,
  Filter,
  GraduationCap,
  Mail,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  UserCog,
  Users,
  X,
} from "lucide-react";
import styles from "../page.module.css";
import { Screen } from "../_shared/components";

type EmployeeRole = "Vận hành" | "Sale" | "HLV" | "Caddie" | "Trợ giảng HLV" | "Trợ lý HLV";
type EmployeeStatus = "Đang làm" | "Tạm nghỉ" | "Đã nghỉ việc";
type WorkMode = "fulltime" | "shift";
type Gender = "Nam" | "Nữ" | "Khác";
type ShiftName = "Sáng" | "Chiều" | "Tối";

type DayShift = {
  active: boolean;
  start: string;
  end: string;
};

type Employee = {
  id: string;
  code: string;
  name: string;
  branch: string;
  phone: string;
  email: string;
  gender: Gender;
  birthDate: string;
  address: string;
  identityNo: string;
  identityDate: string;
  identityPlace: string;
  cardCode: string;
  startDate: string;
  endDate: string;
  group: string;
  department: string;
  title: string;
  roles: EmployeeRole[];
  isSale: boolean;
  status: EmployeeStatus;
  workMode: WorkMode;
  shifts: Record<number, Record<ShiftName, DayShift>>;
  note: string;
  avatarUrl?: string;
};

const BRANCHES = ["NextVision", "Hà Nội Center", "Sài Gòn West"];
const GROUPS = ["HLV Golf", "Vận hành sân", "Kinh doanh", "Dịch vụ khách hàng", "Caddie"];
const DEPARTMENTS = ["Đào tạo", "Dịch vụ", "Kinh doanh", "Lễ tân", "Vận hành sân", "Kế toán"];
const TITLES = ["HLV", "Caddie", "Sale", "Lễ tân", "Quản lý chi nhánh", "Trợ giảng", "Kế toán"];
const ROLES: EmployeeRole[] = ["Vận hành", "Sale", "HLV", "Caddie", "Trợ giảng HLV", "Trợ lý HLV"];
const SHIFT_NAMES: ShiftName[] = ["Sáng", "Chiều", "Tối"];
const DAYS = ["Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy", "Chủ nhật"];

const defaultShifts = (): Record<number, Record<ShiftName, DayShift>> => {
  const result = {} as Record<number, Record<ShiftName, DayShift>>;
  for (let day = 0; day < 7; day += 1) {
    result[day] = {
      Sáng: { active: day < 6, start: "06:00", end: "12:00" },
      Chiều: { active: day < 6, start: "12:00", end: "18:00" },
      Tối: { active: false, start: "18:00", end: "22:00" },
    };
  }
  return result;
};

const seedEmployees: Employee[] = [
  {
    id: "EMP-001",
    code: "NV101202312",
    name: "Nguyễn Văn A",
    branch: "NextVision",
    phone: "0901234567",
    email: "nguyenvana@gmail.com",
    gender: "Nam",
    birthDate: "1990-05-15",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    identityNo: "001234567890",
    identityDate: "2018-05-20",
    identityPlace: "Hà Nội",
    cardCode: "CARD001",
    startDate: "2024-01-10",
    endDate: "",
    group: "HLV Golf",
    department: "Đào tạo",
    title: "HLV",
    roles: ["HLV"],
    isSale: false,
    status: "Đang làm",
    workMode: "fulltime",
    shifts: defaultShifts(),
    note: "HLV chính phụ trách lesson 1-1 và lớp nhóm.",
  },
  {
    id: "EMP-002",
    code: "NV101202313",
    name: "Trần Thị B",
    branch: "NextVision",
    phone: "0912345678",
    email: "tranthib@gmail.com",
    gender: "Nữ",
    birthDate: "1994-10-08",
    address: "18 Nguyễn Cơ Thạch, Nam Từ Liêm",
    identityNo: "024567890123",
    identityDate: "2019-08-12",
    identityPlace: "Hà Nội",
    cardCode: "CARD002",
    startDate: "2024-02-01",
    endDate: "",
    group: "Caddie",
    department: "Dịch vụ",
    title: "Caddie",
    roles: ["Caddie", "Vận hành"],
    isSale: false,
    status: "Đang làm",
    workMode: "shift",
    shifts: defaultShifts(),
    note: "Ưu tiên ca cuối tuần và giải đấu.",
  },
  {
    id: "EMP-003",
    code: "NV101202314",
    name: "Lê Văn C",
    branch: "NextVision",
    phone: "0923456789",
    email: "levanc@gmail.com",
    gender: "Nam",
    birthDate: "1992-03-21",
    address: "44 Lê Văn Lương, Thanh Xuân",
    identityNo: "033456789012",
    identityDate: "2020-03-18",
    identityPlace: "Hà Nội",
    cardCode: "CARD003",
    startDate: "2024-03-12",
    endDate: "",
    group: "Kinh doanh",
    department: "Kinh doanh",
    title: "Sale",
    roles: ["Sale"],
    isSale: true,
    status: "Đang làm",
    workMode: "fulltime",
    shifts: defaultShifts(),
    note: "Sale phụ trách hội viên Premium và hợp đồng doanh nghiệp.",
  },
];

const nextEmployeeCode = (employees: Employee[]) => {
  const max = employees.reduce((value, employee) => {
    const numeric = Number(employee.code.replace(/\D/g, ""));
    return Number.isFinite(numeric) ? Math.max(value, numeric) : value;
  }, 101202314);
  return `NV${max + 1}`;
};

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const statusTone: Record<EmployeeStatus, string> = {
  "Đang làm": "employeeStatusActive",
  "Tạm nghỉ": "employeeStatusPause",
  "Đã nghỉ việc": "employeeStatusOff",
};

export default function EmployeesScreen() {
  const [employees, setEmployees] = useState<Employee[]>(seedEmployees);
  const [query, setQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("Tất cả chi nhánh");
  const [departmentFilter, setDepartmentFilter] = useState("Tất cả phòng ban");
  const [roleFilter, setRoleFilter] = useState("Tất cả chức danh");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState<{ mode: "create" } | { mode: "edit"; employee: Employee } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [toast, setToast] = useState("");

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const filteredEmployees = useMemo(() => {
    const q = query.trim().toLowerCase();
    return employees.filter((employee) => {
      if (q) {
        const target = [employee.code, employee.name, employee.phone, employee.email, employee.cardCode, employee.title]
          .join(" ")
          .toLowerCase();
        if (!target.includes(q)) return false;
      }
      if (branchFilter !== "Tất cả chi nhánh" && employee.branch !== branchFilter) return false;
      if (departmentFilter !== "Tất cả phòng ban" && employee.department !== departmentFilter) return false;
      if (roleFilter !== "Tất cả chức danh" && !employee.roles.includes(roleFilter as EmployeeRole) && employee.title !== roleFilter) return false;
      if (statusFilter !== "Tất cả" && employee.status !== statusFilter) return false;
      return true;
    });
  }, [branchFilter, departmentFilter, employees, query, roleFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: employees.length,
    working: employees.filter((employee) => employee.status === "Đang làm").length,
    teaching: employees.filter((employee) => employee.roles.some((role) => role.includes("HLV"))).length,
    sales: employees.filter((employee) => employee.isSale).length,
  }), [employees]);

  const toggleAll = () => {
    if (selectedIds.length === filteredEmployees.length) setSelectedIds([]);
    else setSelectedIds(filteredEmployees.map((employee) => employee.id));
  };

  const toggleOne = (id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const saveEmployee = (employee: Employee) => {
    setEmployees((current) => {
      const exists = current.some((item) => item.id === employee.id);
      return exists ? current.map((item) => item.id === employee.id ? employee : item) : [employee, ...current];
    });
    setFormOpen(null);
    flash(`${employee.code} · đã ${employees.some((item) => item.id === employee.id) ? "cập nhật" : "thêm mới"}`);
  };

  const deleteEmployee = () => {
    if (!deleteTarget) return;
    setEmployees((current) => current.filter((employee) => employee.id !== deleteTarget.id));
    setSelectedIds((current) => current.filter((id) => id !== deleteTarget.id));
    flash(`Đã xóa ${deleteTarget.name}`);
    setDeleteTarget(null);
  };

  return (
    <>
      <Screen title="Nhân viên" subtitle="Quản lý hồ sơ nhân sự, vai trò vận hành golf, lịch làm việc và dữ liệu dùng cho HLV / Caddie / Sale">
        <div className={styles.employeeHero}>
          <div>
            <span className={styles.employeeEyebrow}><UserCog size={14} /> HR Operations</span>
            <h3>Đội ngũ vận hành sân golf</h3>
            <p>Hồ sơ nhân viên là dữ liệu nền cho lịch HLV, teetime, check-in, hoa hồng và phân quyền.</p>
          </div>
          <button className={styles.employeePrimary} onClick={() => setFormOpen({ mode: "create" })} type="button">
            <Plus size={16} /> Thêm mới
          </button>
        </div>

        <div className={styles.contractKpi}>
          <EmployeeKpi icon={Users} label="Tổng nhân viên" value={String(stats.total)} tone="blue" />
          <EmployeeKpi icon={CheckCircle2} label="Đang làm" value={String(stats.working)} tone="green" />
          <EmployeeKpi icon={GraduationCap} label="HLV / trợ giảng" value={String(stats.teaching)} tone="purple" />
          <EmployeeKpi icon={BriefcaseBusiness} label="Nhân viên Sale" value={String(stats.sales)} tone="amber" />
        </div>

        <div className={styles.employeeToolbar}>
          <div className={styles.employeeSearch}>
            <Search size={18} />
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo mã nhân viên, tên, số điện thoại, email..."
              value={query}
            />
          </div>
          <span className={styles.employeeCount}>Tổng: {filteredEmployees.length} nhân viên</span>
        </div>

        <div className={styles.employeeFilters}>
          <span><Filter size={15} /> Bộ lọc:</span>
          <select className={styles.selectInput} onChange={(e) => setBranchFilter(e.target.value)} value={branchFilter}>
            <option>Tất cả chi nhánh</option>
            {BRANCHES.map((branch) => <option key={branch}>{branch}</option>)}
          </select>
          <select className={styles.selectInput} onChange={(e) => setDepartmentFilter(e.target.value)} value={departmentFilter}>
            <option>Tất cả phòng ban</option>
            {DEPARTMENTS.map((department) => <option key={department}>{department}</option>)}
          </select>
          <select className={styles.selectInput} onChange={(e) => setRoleFilter(e.target.value)} value={roleFilter}>
            <option>Tất cả chức danh</option>
            {ROLES.map((role) => <option key={role}>{role}</option>)}
          </select>
          <select className={styles.selectInput} onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter}>
            <option>Tất cả</option>
            <option>Đang làm</option>
            <option>Tạm nghỉ</option>
            <option>Đã nghỉ việc</option>
          </select>
        </div>

        <section className={styles.memberTableCard}>
          <div className={styles.memberTableWrap}>
            <table className={`${styles.memberTable} ${styles.employeeTable}`}>
              <thead>
                <tr>
                  <th><input checked={filteredEmployees.length > 0 && selectedIds.length === filteredEmployees.length} onChange={toggleAll} type="checkbox" /></th>
                  <th>Mã NV</th>
                  <th>Họ và tên</th>
                  <th>Chi nhánh</th>
                  <th>Số điện thoại</th>
                  <th>Email</th>
                  <th>Chức danh</th>
                  <th>Phòng ban</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr><td className={styles.emptyTableCell} colSpan={10}>Không có nhân viên nào khớp bộ lọc.</td></tr>
                ) : null}
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td><input checked={selectedIds.includes(employee.id)} onChange={() => toggleOne(employee.id)} type="checkbox" /></td>
                    <td><button className={styles.employeeCode} onClick={() => setFormOpen({ mode: "edit", employee })} type="button">{employee.code}</button></td>
                    <td>
                      <div className={styles.employeeIdentity}>
                        <span>{initials(employee.name)}</span>
                        <div>
                          <strong>{employee.name}</strong>
                          <small>{employee.cardCode || "Chưa có mã thẻ/vân tay"}</small>
                        </div>
                      </div>
                    </td>
                    <td>{employee.branch}</td>
                    <td><span className={styles.employeeContact}><Phone size={12} /> {employee.phone}</span></td>
                    <td><span className={styles.employeeContact}><Mail size={12} /> {employee.email}</span></td>
                    <td>
                      <div className={styles.employeeRoleList}>
                        {employee.roles.slice(0, 2).map((role) => <span key={role}>{role}</span>)}
                        {employee.roles.length > 2 ? <em>+{employee.roles.length - 2}</em> : null}
                      </div>
                    </td>
                    <td>{employee.department}</td>
                    <td><span className={`${styles.employeeStatus} ${styles[statusTone[employee.status]]}`}>{employee.status}</span></td>
                    <td>
                      <div className={styles.contractRowActions}>
                        <button onClick={() => setFormOpen({ mode: "edit", employee })} title="Chỉnh sửa" type="button"><Edit3 size={14} /></button>
                        <button className={styles.contractDelete} onClick={() => setDeleteTarget(employee)} title="Xóa" type="button"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Screen>

      {formOpen ? (
        <EmployeeFormModal
          employees={employees}
          initial={formOpen.mode === "edit" ? formOpen.employee : undefined}
          mode={formOpen.mode}
          onClose={() => setFormOpen(null)}
          onSave={saveEmployee}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteEmployeeDialog
          employee={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={deleteEmployee}
        />
      ) : null}

      {toast ? <div className={styles.contractToast}>{toast}</div> : null}
    </>
  );
}

function EmployeeKpi({ icon: Icon, label, tone, value }: { icon: LucideIcon; label: string; tone: "blue" | "green" | "amber" | "purple"; value: string }) {
  return (
    <article className={`${styles.contractKpiCard} ${styles[`kpi_${tone}`]}`}>
      <span className={styles.contractKpiIcon}><Icon size={18} /></span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function EmployeeFormModal({
  employees,
  initial,
  mode,
  onClose,
  onSave,
}: {
  employees: Employee[];
  initial?: Employee;
  mode: "create" | "edit";
  onClose: () => void;
  onSave: (employee: Employee) => void;
}) {
  const [draft, setDraft] = useState<Employee>(() => initial ?? {
    id: `EMP-${Date.now()}`,
    code: nextEmployeeCode(employees),
    name: "",
    branch: BRANCHES[0],
    phone: "",
    email: "",
    gender: "Nam",
    birthDate: "",
    address: "",
    identityNo: "",
    identityDate: "",
    identityPlace: "",
    cardCode: "",
    startDate: "",
    endDate: "",
    group: GROUPS[0],
    department: DEPARTMENTS[0],
    title: TITLES[0],
    roles: ["Vận hành"],
    isSale: false,
    status: "Đang làm",
    workMode: "fulltime",
    shifts: defaultShifts(),
    note: "",
  });
  const [error, setError] = useState("");
  const [nested, setNested] = useState<"group" | "department" | "title" | null>(null);

  const update = <K extends keyof Employee>(key: K, value: Employee[K]) => setDraft((current) => ({ ...current, [key]: value }));

  const toggleRole = (role: EmployeeRole) => {
    setDraft((current) => {
      const roles = current.roles.includes(role) ? current.roles.filter((item) => item !== role) : [...current.roles, role];
      return {
        ...current,
        roles,
        isSale: role === "Sale" ? !current.roles.includes("Sale") : current.isSale,
      };
    });
  };

  const updateShift = (day: number, shift: ShiftName, patch: Partial<DayShift>) => {
    setDraft((current) => ({
      ...current,
      shifts: {
        ...current.shifts,
        [day]: {
          ...current.shifts[day],
          [shift]: { ...current.shifts[day][shift], ...patch },
        },
      },
    }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim()) { setError("Vui lòng nhập họ và tên nhân viên"); return; }
    if (!draft.branch) { setError("Vui lòng chọn chi nhánh"); return; }
    if (!draft.code.trim()) { setError("Mã nhân viên không hợp lệ"); return; }
    if (employees.some((employee) => employee.code === draft.code && employee.id !== draft.id)) {
      setError("Mã nhân viên đã tồn tại");
      return;
    }
    if (!draft.roles.length) { setError("Vui lòng chọn ít nhất một vai trò"); return; }
    onSave({ ...draft, name: draft.name.trim(), isSale: draft.isSale || draft.roles.includes("Sale") });
  };

  const addOption = (value: string) => {
    if (!nested || !value.trim()) return;
    const key = nested === "group" ? "group" : nested === "department" ? "department" : "title";
    update(key, value.trim());
    setNested(null);
  };

  return (
    <div className={styles.modalOverlay} onClick={(event) => event.target === event.currentTarget && onClose()} role="dialog" aria-modal="true">
      <form className={styles.employeeModal} onSubmit={submit}>
        <header className={styles.employeeModalHeader}>
          <div>
            <h2>{mode === "create" ? "Thêm mới nhân viên" : "Chỉnh sửa nhân viên"}</h2>
            <p>{mode === "create" ? "Điền thông tin để thêm nhân viên mới" : "Cập nhật hồ sơ, vai trò và lịch làm việc"}</p>
          </div>
          <button onClick={onClose} type="button"><X size={18} /></button>
        </header>

        <div className={styles.employeeModalBody}>
          {error ? <div className={styles.formError}><ShieldCheck size={16} /> {error}</div> : null}

          <div className={styles.employeePhotoBlock}>
            <div className={styles.employeePhotoCircle}>
              {draft.avatarUrl ? <CheckCircle2 size={34} /> : <Upload size={34} />}
            </div>
            <div>
              <button onClick={() => update("avatarUrl", "uploaded")} type="button"><Upload size={14} /> Tải ảnh lên</button>
              <button onClick={() => update("avatarUrl", "webcam")} type="button"><Camera size={14} /> Webcam</button>
            </div>
          </div>

          <section className={`${styles.contractFormSection} ${styles.contractSectionBlue}`}>
            <h3 className={styles.contractSectionHeader}><BadgeCheck size={16} /> Thông tin cá nhân</h3>
            <div className={styles.employeeFormGrid}>
              <EmployeeField label="Chi nhánh" required>
                <select value={draft.branch} onChange={(e) => update("branch", e.target.value)}>
                  {BRANCHES.map((branch) => <option key={branch}>{branch}</option>)}
                </select>
              </EmployeeField>
              <EmployeeField label="Mã nhân viên" required>
                <input value={draft.code} onChange={(e) => update("code", e.target.value)} />
              </EmployeeField>
              <EmployeeField label="Họ và tên" required>
                <input placeholder="Tên nhân viên" value={draft.name} onChange={(e) => update("name", e.target.value)} />
              </EmployeeField>
              <EmployeeField label="Mã thẻ, vân tay">
                <input placeholder="Mã thẻ / vân tay tự đồng bộ" value={draft.cardCode} onChange={(e) => update("cardCode", e.target.value)} />
              </EmployeeField>
              <EmployeeField label="Ngày sinh" required>
                <input type="date" value={draft.birthDate} onChange={(e) => update("birthDate", e.target.value)} />
              </EmployeeField>
              <EmployeeField label="Giới tính">
                <div className={styles.employeeRadioRow}>
                  {(["Nam", "Nữ", "Khác"] as Gender[]).map((gender) => (
                    <label key={gender}><input checked={draft.gender === gender} onChange={() => update("gender", gender)} type="radio" /> {gender}</label>
                  ))}
                </div>
              </EmployeeField>
              <EmployeeField label="Số điện thoại">
                <input placeholder="Nhập số điện thoại..." value={draft.phone} onChange={(e) => update("phone", e.target.value)} />
              </EmployeeField>
              <EmployeeField label="Email">
                <input placeholder="Nhập email" type="email" value={draft.email} onChange={(e) => update("email", e.target.value)} />
              </EmployeeField>
              <EmployeeField label="Địa chỉ">
                <input placeholder="Nhập địa chỉ..." value={draft.address} onChange={(e) => update("address", e.target.value)} />
              </EmployeeField>
              <EmployeeField label="Số CCCD/CMND">
                <input placeholder="Nhập số CCCD/CMND" value={draft.identityNo} onChange={(e) => update("identityNo", e.target.value)} />
              </EmployeeField>
              <EmployeeField label="Ngày cấp CCCD">
                <input type="date" value={draft.identityDate} onChange={(e) => update("identityDate", e.target.value)} />
              </EmployeeField>
              <EmployeeField label="Nơi cấp CCCD">
                <input placeholder="Nơi cấp" value={draft.identityPlace} onChange={(e) => update("identityPlace", e.target.value)} />
              </EmployeeField>
            </div>
          </section>

          <section className={`${styles.contractFormSection} ${styles.contractSectionGreen}`}>
            <h3 className={styles.contractSectionHeader}><BriefcaseBusiness size={16} /> Công việc & vai trò</h3>
            <div className={styles.employeeFormGrid}>
              <EmployeeField label="Ngày bắt đầu làm việc">
                <input type="date" value={draft.startDate} onChange={(e) => update("startDate", e.target.value)} />
              </EmployeeField>
              <EmployeeField label="Ngày kết thúc làm việc">
                <input type="date" value={draft.endDate} onChange={(e) => update("endDate", e.target.value)} />
              </EmployeeField>
              <EmployeeField label="Nhóm nhân viên">
                <SelectWithAdd onAdd={() => setNested("group")} value={draft.group} onChange={(value) => update("group", value)} options={GROUPS} />
              </EmployeeField>
              <EmployeeField label="Phòng ban">
                <SelectWithAdd onAdd={() => setNested("department")} value={draft.department} onChange={(value) => update("department", value)} options={DEPARTMENTS} />
              </EmployeeField>
              <EmployeeField label="Chức danh">
                <SelectWithAdd onAdd={() => setNested("title")} value={draft.title} onChange={(value) => update("title", value)} options={TITLES} />
              </EmployeeField>
              <EmployeeField label="Trạng thái">
                <select value={draft.status} onChange={(e) => update("status", e.target.value as EmployeeStatus)}>
                  <option>Đang làm</option>
                  <option>Tạm nghỉ</option>
                  <option>Đã nghỉ việc</option>
                </select>
              </EmployeeField>
            </div>
            <div className={styles.employeeCheckGrid}>
              <label><input checked={draft.isSale} onChange={(e) => update("isSale", e.target.checked)} type="checkbox" /> Nhân viên Sale</label>
              {ROLES.map((role) => (
                <label key={role}><input checked={draft.roles.includes(role)} onChange={() => toggleRole(role)} type="checkbox" /> {role}</label>
              ))}
            </div>
          </section>

          <section className={`${styles.contractFormSection} ${styles.contractSectionPurple}`}>
            <h3 className={styles.contractSectionHeader}><CalendarDays size={16} /> Lịch làm việc</h3>
            <div className={styles.employeeWorkMode}>
              <label><input checked={draft.workMode === "fulltime"} onChange={() => update("workMode", "fulltime")} type="radio" /> Lịch làm việc: Full-time</label>
              <label><input checked={draft.workMode === "shift"} onChange={() => update("workMode", "shift")} type="radio" /> Theo ca</label>
            </div>

            {draft.workMode === "shift" ? (
              <div className={styles.employeeSchedule}>
                <div className={styles.employeeScheduleHead}>
                  <span>Ngày</span>
                  {SHIFT_NAMES.map((shift) => <strong key={shift}>Ca {shift}</strong>)}
                </div>
                {DAYS.map((day, dayIndex) => (
                  <div className={styles.employeeScheduleRow} key={day}>
                    <strong>{day}</strong>
                    {SHIFT_NAMES.map((shift) => {
                      const cfg = draft.shifts[dayIndex][shift];
                      return (
                        <div className={styles.employeeShiftCell} key={shift}>
                          <input checked={cfg.active} onChange={(e) => updateShift(dayIndex, shift, { active: e.target.checked })} type="checkbox" />
                          <input disabled={!cfg.active} type="time" value={cfg.start} onChange={(e) => updateShift(dayIndex, shift, { start: e.target.value })} />
                          <Clock3 size={13} />
                          <input disabled={!cfg.active} type="time" value={cfg.end} onChange={(e) => updateShift(dayIndex, shift, { end: e.target.value })} />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.employeeFulltimeBox}>
                <CheckCircle2 size={18} />
                <div>
                  <strong>Full-time theo ca hành chính</strong>
                  <span>Áp dụng mặc định Thứ hai - Thứ bảy, 08:00 - 17:30. Có thể chuyển sang Theo ca để cấu hình chi tiết.</span>
                </div>
              </div>
            )}
          </section>

          <section className={`${styles.contractFormSection} ${styles.contractSectionTeal}`}>
            <h3 className={styles.contractSectionHeader}><Edit3 size={16} /> Ghi chú</h3>
            <label>
              <span>Ghi chú nội bộ</span>
              <textarea placeholder="Ghi chú về chuyên môn, lịch ưu tiên, phân quyền..." value={draft.note} onChange={(e) => update("note", e.target.value)} />
            </label>
          </section>
        </div>

        <footer className={styles.contractFormFooter}>
          <button className={styles.contractFilterChip} onClick={onClose} type="button">Đóng</button>
          <button className={styles.greenButton} type="submit"><CheckCircle2 size={14} /> Lưu</button>
        </footer>
      </form>

      {nested ? <AddOptionDialog type={nested} onCancel={() => setNested(null)} onSave={addOption} /> : null}
    </div>
  );
}

function EmployeeField({ children, label, required }: { children: ReactNode; label: string; required?: boolean }) {
  return (
    <label className={styles.employeeField}>
      <span>{label} {required ? <b>*</b> : null}</span>
      {children}
    </label>
  );
}

function SelectWithAdd({ onAdd, onChange, options, value }: { onAdd: () => void; onChange: (value: string) => void; options: string[]; value: string }) {
  return (
    <div className={styles.employeeSelectAdd}>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
      <button onClick={onAdd} type="button"><Plus size={15} /></button>
    </div>
  );
}

function AddOptionDialog({ onCancel, onSave, type }: { onCancel: () => void; onSave: (value: string) => void; type: "group" | "department" | "title" }) {
  const [value, setValue] = useState("");
  const label = type === "group" ? "nhóm nhân viên" : type === "department" ? "phòng ban" : "chức danh";
  return (
    <div className={`${styles.modalOverlay} ${styles.nestedOverlay}`} role="dialog" aria-modal="true">
      <form className={styles.smallModal} onSubmit={(event) => { event.preventDefault(); onSave(value); }}>
        <header>
          <h2><Plus size={16} /> Thêm {label}</h2>
          <button onClick={onCancel} type="button"><X size={16} /></button>
        </header>
        <div className={styles.smallModalBody}>
          <label>
            <span>Tên {label}</span>
            <input autoFocus value={value} onChange={(event) => setValue(event.target.value)} placeholder={`Nhập ${label}`} />
          </label>
        </div>
        <footer>
          <button className={styles.contractFilterChip} onClick={onCancel} type="button">Hủy</button>
          <button className={styles.greenButton} type="submit">Thêm</button>
        </footer>
      </form>
    </div>
  );
}

function DeleteEmployeeDialog({ employee, onCancel, onConfirm }: { employee: Employee; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <section className={styles.ticketDialog}>
        <header>
          <span className={styles.ticketDialogIcon} style={{ background: "#fee2e2", color: "#b91c1c" }}><Trash2 size={20} /></span>
          <div>
            <h3>Xóa nhân viên {employee.name}</h3>
            <p>Thao tác này xóa hồ sơ khỏi danh sách demo. Trong hệ thống thật nên chuyển trạng thái Đã nghỉ việc nếu nhân viên đã phát sinh lịch sử.</p>
          </div>
        </header>
        <footer>
          <button className={styles.contractFilterChip} onClick={onCancel} type="button">Hủy</button>
          <button className={styles.contractDelete} onClick={onConfirm} type="button">Xóa nhân viên</button>
        </footer>
      </section>
    </div>
  );
}

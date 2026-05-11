"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Download,
  Edit,
  Eye,
  Filter,
  FileSpreadsheet,
  GraduationCap,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  Upload,
  UploadCloud,
  User,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
import styles from "@/shared/styles/feature-styles.module.css";
import {
  BiometricBadges,
  CustomerStatus,
  FormField,
  InfoBlock,
  InfoLine,
  SelectField,
} from "@/shared/components";
import { customerRows } from "@/shared/data";
import type { Customer } from "@/shared/types";

type AdvFilter = {
  expiry: string;
  birth: string;
  registerDate: string;
  gender: string;
  customerGroup: string;
  status: string;
  biometric: string;
  assignee: string;
};

const DEFAULT_ADV_FILTER: AdvFilter = {
  expiry: "Toàn thời gian",
  birth: "Toàn thời gian",
  registerDate: "Toàn thời gian",
  gender: "Tất cả",
  customerGroup: "Tất cả",
  status: "Tất cả",
  biometric: "Tất cả",
  assignee: "Tất cả",
};

const ALL_COLUMNS: { id: string; label: string }[] = [
  { id: "code", label: "Mã HV" },
  { id: "name", label: "Họ và tên" },
  { id: "phone", label: "Số điện thoại" },
  { id: "email", label: "Email" },
  { id: "gender", label: "Giới tính" },
  { id: "birth", label: "Ngày sinh" },
  { id: "biometric", label: "Sinh trắc học" },
  { id: "status", label: "Trạng thái" },
  { id: "cards", label: "Thẻ" },
  { id: "customerGroup", label: "Nhóm KH" },
  { id: "source", label: "Nguồn KH" },
  { id: "registerDate", label: "Ngày đăng ký" },
  { id: "endDate", label: "Ngày hết hạn" },
  { id: "createdDate", label: "Ngày tạo" },
  { id: "creator", label: "Người tạo" },
  { id: "debt", label: "Công nợ" },
  { id: "actions", label: "Hành động" },
];

function ddmmyyyyToISO(input: string | undefined): string {
  if (!input || input === "---") return "";
  const parts = input.split("/");
  if (parts.length !== 3) return "";
  const [d, m, y] = parts;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function isoToDDMMYYYY(input: string): string {
  if (!input) return "---";
  const [y, m, d] = input.split("-");
  return d && m && y ? `${Number(d)}/${Number(m)}/${y}` : input;
}

function nextCustomerCode(rows: Customer[]): string {
  const max = rows.reduce((value, row) => {
    const number = Number(row.code.replace(/\D/g, ""));
    return Number.isFinite(number) ? Math.max(value, number) : value;
  }, 1000);
  return `HV${String(max + 1).padStart(4, "0")}`;
}

function nextBiometricCode(rows: Customer[]): string {
  const max = rows.reduce((value, row, index) => {
    const number = Number(row.biometricCode ?? "");
    return Number.isFinite(number) && number > 0 ? Math.max(value, number) : Math.max(value, 12345670 + index);
  }, 12345670);
  return String(max + 1).padStart(8, "0").slice(-8);
}

function customerMeta(customer: Customer) {
  const number = Number(customer.code.replace(/\D/g, "")) || 0;
  const groups = ["VIP", "Premium", "Standard", "Khách vãng lai"];
  const sources = ["Walk-in", "Facebook", "Google", "Giới thiệu", "Chi nhánh khác"];
  return {
    group: customer.customerGroup ?? groups[number % groups.length],
    source: customer.source ?? sources[number % sources.length],
    biometricCode: customer.biometricCode ?? String(12345670 + number).slice(-8),
  };
}

function downloadTextFile(filename: string, content: string, type = "text/csv;charset=utf-8") {
  const blob = new Blob(["\uFEFF", content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function toCustomerCsv(rows: Customer[]) {
  const headers = [
    "Ma HV",
    "Ho ten",
    "So dien thoai",
    "Email",
    "Gioi tinh",
    "Ngay sinh",
    "Trang thai",
    "Nhom KH",
    "Nguon KH",
    "Ngay dang ky",
    "Ngay het han",
    "Cong no",
  ];
  const body = rows.map((row) => {
    const meta = customerMeta(row);
    return [
      row.code,
      row.name,
      row.phone,
      row.email,
      row.gender,
      row.birth,
      row.status,
      meta.group,
      meta.source,
      row.registerDate,
      row.endDate,
      row.debt,
    ]
      .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
      .join(",");
  });
  return [headers.join(","), ...body].join("\n");
}

export default function CustomersView() {
  const [moduleTab, setModuleTab] = useState<"list" | "learning">("list");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState("Thông tin cơ bản");
  const [autoAddTrainingResult, setAutoAddTrainingResult] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedLearningContext, setSelectedLearningContext] = useState<CustomerLearningContext | null>(null);
  const [learningResults, setLearningResults] = useState<Record<string, TrainingResultEntry[]>>({});
  const [nestedModal, setNestedModal] = useState<"group" | "source" | "companion" | null>(null);
  const [rows, setRows] = useState(customerRows);
  const [query, setQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState("Tất cả");
  const [filterOpen, setFilterOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [advFilter, setAdvFilter] = useState<AdvFilter>(DEFAULT_ADV_FILTER);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(ALL_COLUMNS.map((c) => c.id));
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const quickFilters = ["Tất cả", "Còn hạn", "Hết hạn", "Sắp hết hạn", "Chưa đăng ký"];

  const setAdvField = (key: keyof AdvFilter, value: string) =>
    setAdvFilter((current) => ({ ...current, [key]: value }));

  const isVisible = (id: string) => visibleColumns.includes(id);
  const toggleColumn = (id: string) =>
    setVisibleColumns((current) =>
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id]
    );

  const filteredRows = rows.filter((customer) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery) {
      const haystack = [customer.code, customer.name, customer.phone, customer.email, customer.creator]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(normalizedQuery)) return false;
    }
    if (quickFilter !== "Tất cả" && customer.status !== quickFilter) return false;
    if (advFilter.gender !== "Tất cả" && customer.gender !== advFilter.gender) return false;
    if (advFilter.status !== "Tất cả" && customer.status !== advFilter.status) return false;
    if (advFilter.assignee !== "Tất cả" && customer.creator !== advFilter.assignee) return false;
    const meta = customerMeta(customer);
    if (advFilter.customerGroup !== "Tất cả" && meta.group !== advFilter.customerGroup) return false;
    if (advFilter.biometric === "Có" && !meta.biometricCode) return false;
    if (advFilter.biometric === "Chưa" && meta.biometricCode) return false;
    return true;
  });

  const handleExportCustomers = () => {
    downloadTextFile(`khach_hang_${new Date().toISOString().slice(0, 10)}.csv`, toCustomerCsv(filteredRows));
    setExportOpen(false);
  };

  const handleDownloadTemplate = () => {
    downloadTextFile(
      "mau_import_khach_hang.csv",
      [
        "Ho ten,So dien thoai,Email,Gioi tinh,Ngay sinh,Nhom KH,Nguon KH,The RFID,CCCD,Ghi chu",
        "Nguyen Van Mau,0909000000,mau@golf.vn,Nam,1990-05-15,VIP,Facebook,RFID0001,079090000001,Khach quan tam goi HLV",
      ].join("\n")
    );
    setExportOpen(false);
  };

  const handleImportCustomers = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const lines = String(reader.result ?? "")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(1);
      const imported = lines
        .map((line, index): Customer | null => {
          const [name = "", phone = "", email = "", gender = "Nam", birth = "", group = "Standard", source = "Walk-in", card = "", id = "", note = ""] =
            line.split(",").map((cell) => cell.replace(/^"|"$/g, "").trim());
          if (!name || !/^[0-9]{10,11}$/.test(phone)) return null;
          const codeNumber = rows.length + index + 1;
          return {
            birth: birth.includes("-") ? isoToDDMMYYYY(birth) : birth || "---",
            cards: card ? ["green"] : [],
            code: `HV${String(1000 + codeNumber).padStart(4, "0")}`,
            createdDate: "7/4/2026",
            creator: "Admin",
            customerGroup: group,
            source,
            cardNumber: card,
            idNumber: id,
            note,
            debt: "0 VND",
            email,
            endDate: "---",
            gender: gender || "Nam",
            name,
            phone,
            registerDate: "---",
            status: "Chưa đăng ký",
            biometricCode: String(12345670 + rows.length + index + 1).slice(-8),
          };
        })
        .filter((row): row is Customer => Boolean(row));
      if (imported.length) setRows((current) => [...imported, ...current]);
      event.target.value = "";
    };
    reader.readAsText(file);
    setExportOpen(false);
  };

  const handleCreateCustomer = (customer: Customer) => {
    setRows((current) => [customer, ...current]);
    setQuickFilter("Tất cả");
    setAdvFilter(DEFAULT_ADV_FILTER);
  };

  const openDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailTab("Thông tin cơ bản");
    setDetailOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditOpen(true);
  };

  const openDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDeleteOpen(true);
  };

  const handleUpdateCustomer = (updated: Customer) => {
    setRows((current) => current.map((c) => (c.code === updated.code ? updated : c)));
    setEditOpen(false);
    setSelectedCustomer(null);
  };

  const handleDeleteCustomer = () => {
    if (!selectedCustomer) return;
    setRows((current) => current.filter((c) => c.code !== selectedCustomer.code));
    setDeleteOpen(false);
    setSelectedCustomer(null);
  };

  const activeAdvCount = (Object.keys(advFilter) as Array<keyof AdvFilter>).filter(
    (key) => advFilter[key] !== DEFAULT_ADV_FILTER[key]
  ).length;
  const selectedDetailLearningContext =
    selectedLearningContext ??
    (selectedCustomer
      ? buildLearningRows(rows, learningResults).find((row) => row.customer.code === selectedCustomer.code) ?? null
      : null);

  return (
    <>
      <section className={styles.customerScreen}>
        <div className={styles.customerModuleTabs}>
          <button
            className={moduleTab === "list" ? styles.customerModuleTabActive : styles.customerModuleTab}
            onClick={() => setModuleTab("list")}
            type="button"
          >
            Danh sách hội viên
          </button>
          <button
            className={moduleTab === "learning" ? styles.customerModuleTabActive : styles.customerModuleTab}
            onClick={() => setModuleTab("learning")}
            type="button"
          >
            Hồ sơ tập luyện
          </button>
        </div>

        {moduleTab === "learning" ? (
          <CustomerLearningOverview
            customers={rows}
            learningResults={learningResults}
            onOpenCustomer={(customer, tab, autoAdd = false, context) => {
              setSelectedCustomer(customer);
              setSelectedLearningContext(context ?? null);
              setDetailTab(tab);
              setAutoAddTrainingResult(autoAdd);
              setDetailOpen(true);
            }}
            onSaveTrainingResult={(customerCode, entry) => {
              setLearningResults((current) => ({
                ...current,
                [customerCode]: [entry, ...(current[customerCode] ?? [])],
              }));
            }}
          />
        ) : (
          <>
        <div className={styles.customerToolbar}>
          <h2>Danh sách thành viên</h2>
          <div className={styles.customerActions}>
            <div className={styles.customerSearch}>
              <Search size={18} />
              <input
                aria-label="Tìm kiếm hội viên"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm kiếm..."
                value={query}
              />
            </div>
            <button className={styles.blueButton} onClick={() => setAddOpen(true)} type="button">
              <Plus size={18} />
              Thêm mới
            </button>
            <button className={styles.squareButton} onClick={() => setFilterOpen((value) => !value)} type="button">
              <Filter size={18} />
            </button>
            <button className={styles.squareButton} onClick={() => setSettingsOpen((value) => !value)} type="button">
              <Settings size={18} />
            </button>
            <div className={styles.exportContainer}>
              <input
                accept=".csv,text/csv"
                aria-label="Chọn file CSV import khách hàng"
                className={styles.hiddenFileInput}
                onChange={handleImportCustomers}
                ref={importInputRef}
                type="file"
              />
              <button
                className={`${styles.greenButton} ${exportOpen ? styles.exportButtonActive : ""}`}
                onClick={() => setExportOpen((value) => !value)}
                type="button"
              >
                <Download size={18} />
                Nhập xuất
                <ChevronDown size={16} />
              </button>
              {exportOpen ? (
                <>
                  <button
                    aria-label="Đóng menu nhập xuất"
                    className={styles.popoverBackdrop}
                    onClick={() => setExportOpen(false)}
                    type="button"
                  />
                  <section className={styles.exportMenu}>
                    <button
                      onClick={() => {
                        importInputRef.current?.click();
                        setExportOpen(false);
                      }}
                      type="button"
                    >
                      <Upload size={16} /> Nhập CSV
                    </button>
                    <button
                      onClick={handleExportCustomers}
                      type="button"
                    >
                      <Download size={16} /> Xuất CSV
                    </button>
                    <button
                      onClick={handleDownloadTemplate}
                      type="button"
                    >
                      <FileSpreadsheet size={16} /> Tải file mẫu import
                    </button>
                  </section>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className={styles.quickFilters}>
          {quickFilters.map((filter) => (
            <button
              className={quickFilter === filter ? styles.activeFilterChip : undefined}
              key={filter}
              onClick={() => setQuickFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>

        {filterOpen ? (
          <section className={styles.advancedPanel}>
            <h3>Bộ lọc nâng cao{activeAdvCount > 0 ? <span className={styles.advCountBadge}>{activeAdvCount} đang áp dụng</span> : null}</h3>
            <div className={styles.advancedGrid}>
              <label>
                Ngày hết hạn
                <select className={styles.selectInput} onChange={(e) => setAdvField("expiry", e.target.value)} value={advFilter.expiry}>
                  {["Toàn thời gian", "30 ngày tới", "Đã hết hạn", "Lựa chọn khác"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>
              <label>
                Ngày sinh
                <select className={styles.selectInput} onChange={(e) => setAdvField("birth", e.target.value)} value={advFilter.birth}>
                  {["Toàn thời gian", "Trong tháng này", "Trong tuần này"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>
              <label>
                Ngày đăng ký
                <select className={styles.selectInput} onChange={(e) => setAdvField("registerDate", e.target.value)} value={advFilter.registerDate}>
                  {["Toàn thời gian", "30 ngày gần đây", "Quý này", "Năm nay"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>
              <label>
                Giới tính
                <select className={styles.selectInput} onChange={(e) => setAdvField("gender", e.target.value)} value={advFilter.gender}>
                  {["Tất cả", "Nam", "Nữ"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>
              <label>
                Nhóm khách hàng
                <select className={styles.selectInput} onChange={(e) => setAdvField("customerGroup", e.target.value)} value={advFilter.customerGroup}>
                  {["Tất cả", "VIP", "Premium", "Standard", "Khách vãng lai"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>
              <label>
                Trạng thái
                <select className={styles.selectInput} onChange={(e) => setAdvField("status", e.target.value)} value={advFilter.status}>
                  {["Tất cả", "Còn hạn", "Hết hạn", "Sắp hết hạn", "Chưa đăng ký"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>
              <label>
                Sinh trắc học
                <select className={styles.selectInput} onChange={(e) => setAdvField("biometric", e.target.value)} value={advFilter.biometric}>
                  {["Tất cả", "Có", "Chưa", "Face", "Vân tay", "Thẻ"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>
              <label>
                Nhân viên phụ trách
                <select className={styles.selectInput} onChange={(e) => setAdvField("assignee", e.target.value)} value={advFilter.assignee}>
                  {["Tất cả", "Admin", "Nguyễn Văn Thành", "Lê Thị Mai", "Trần Minh Hoàng"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>
            </div>
            <footer>
              <button onClick={() => { setAdvFilter(DEFAULT_ADV_FILTER); setQuickFilter("Tất cả"); }} type="button">Xóa bộ lọc</button>
              <button className={styles.blueButton} onClick={() => setFilterOpen(false)} type="button">Áp dụng lọc</button>
            </footer>
          </section>
        ) : null}

        {settingsOpen ? (
          <section className={styles.advancedPanel}>
            <h3>Cài đặt cột hiển thị <span className={styles.advCountBadge}>{visibleColumns.length}/{ALL_COLUMNS.length} cột</span></h3>
            <div className={styles.columnGrid}>
              {ALL_COLUMNS.map((column) => (
                <label key={column.id}>
                  <input
                    checked={isVisible(column.id)}
                    onChange={() => toggleColumn(column.id)}
                    type="checkbox"
                  />
                  {column.label}
                </label>
              ))}
            </div>
            <footer>
              <button onClick={() => setVisibleColumns(ALL_COLUMNS.map((c) => c.id))} type="button">Hiện tất cả</button>
              <button className={styles.blueButton} onClick={() => setSettingsOpen(false)} type="button">Xong</button>
            </footer>
          </section>
        ) : null}

        <section className={styles.memberTableCard}>
          <div className={styles.memberTableWrap}>
            <table className={styles.memberTable}>
              <thead>
                <tr>
                  {ALL_COLUMNS.filter((c) => isVisible(c.id)).map((c) => (
                    <th key={c.id}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((customer) => {
                  const meta = customerMeta(customer);
                  return (
                  <tr key={customer.code}>
                    {isVisible("code") ? (
                      <td>
                        <button
                          className={styles.memberCode}
                          onClick={() => openDetail(customer)}
                          type="button"
                        >
                          {customer.code}
                        </button>
                      </td>
                    ) : null}
                    {isVisible("name") ? <td className={styles.memberName}>{customer.name}</td> : null}
                    {isVisible("phone") ? <td>{customer.phone}</td> : null}
                    {isVisible("email") ? <td>{customer.email}</td> : null}
                    {isVisible("gender") ? <td>{customer.gender}</td> : null}
                    {isVisible("birth") ? <td>{customer.birth}</td> : null}
                    {isVisible("biometric") ? <td><BiometricBadges /></td> : null}
                    {isVisible("status") ? <td><CustomerStatus status={customer.status} /></td> : null}
                    {isVisible("cards") ? (
                      <td>
                        <div className={styles.cardDots}>
                          {customer.cards.map((card, index) => (
                            <span className={styles[`${card}Dot`]} key={`${customer.code}-${card}-${index}`} />
                          ))}
                          <button type="button">+</button>
                        </div>
                      </td>
                    ) : null}
                    {isVisible("customerGroup") ? <td>{meta.group}</td> : null}
                    {isVisible("source") ? <td>{meta.source}</td> : null}
                    {isVisible("registerDate") ? <td className={customer.registerDate === "---" ? styles.mutedCell : styles.dateGreen}>{customer.registerDate}</td> : null}
                    {isVisible("endDate") ? <td className={customer.endDate === "---" ? styles.mutedCell : styles.dateRed}>{customer.endDate}</td> : null}
                    {isVisible("createdDate") ? <td className={styles.dateGreen}>{customer.createdDate}</td> : null}
                    {isVisible("creator") ? <td>{customer.creator}</td> : null}
                    {isVisible("debt") ? <td>{customer.debt}</td> : null}
                    {isVisible("actions") ? (
                      <td>
                        <div className={styles.tableActions}>
                          <button
                            aria-label={`Xem chi tiết ${customer.code}`}
                            onClick={() => openDetail(customer)}
                            title="Xem chi tiết"
                            type="button"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            aria-label={`Chỉnh sửa ${customer.code}`}
                            onClick={() => openEdit(customer)}
                            title="Chỉnh sửa"
                            type="button"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            aria-label={`Xóa ${customer.code}`}
                            className={styles.tableActionDanger}
                            onClick={() => openDelete(customer)}
                            title="Xóa khách hàng"
                            type="button"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                );
                })}
                {filteredRows.length === 0 ? (
                  <tr>
                    <td className={styles.emptyTableCell} colSpan={visibleColumns.length || 1}>
                      Không có hội viên phù hợp với điều kiện tìm kiếm/lọc.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <div className={styles.pagination}>
            <span>Hiển thị {filteredRows.length ? 1 : 0} - {filteredRows.length} / {filteredRows.length} hội viên</span>
            <span>Hiển thị: <input aria-label="Số dòng mỗi trang" defaultValue={10} /> / trang</span>
            <div>
              <button type="button">Trước</button>
              <button className={styles.currentPage} type="button">1</button>
              <button type="button">Sau</button>
            </div>
          </div>
        </section>
          </>
        )}
      </section>

      {addOpen ? (
        <CustomerFormModal
          mode="create"
          nestedModal={nestedModal}
          onClose={() => {
            setAddOpen(false);
            setNestedModal(null);
          }}
          onOpenNested={setNestedModal}
          onSubmit={handleCreateCustomer}
          rows={rows}
        />
      ) : null}

      {editOpen && selectedCustomer ? (
        <CustomerFormModal
          initialCustomer={selectedCustomer}
          key={selectedCustomer.code}
          mode="edit"
          nestedModal={nestedModal}
          onClose={() => {
            setEditOpen(false);
            setNestedModal(null);
            setSelectedCustomer(null);
          }}
          onOpenNested={setNestedModal}
          onSubmit={handleUpdateCustomer}
          rows={rows}
        />
      ) : null}

      {deleteOpen && selectedCustomer ? (
        <DeleteCustomerModal
          customer={selectedCustomer}
          onCancel={() => {
            setDeleteOpen(false);
            setSelectedCustomer(null);
          }}
          onConfirm={handleDeleteCustomer}
        />
      ) : null}

      {detailOpen ? (
        <CustomerDetailModal
          activeTab={detailTab}
          customer={selectedCustomer}
          onChangeTab={setDetailTab}
          onClose={() => {
            setDetailOpen(false);
            setSelectedCustomer(null);
            setSelectedLearningContext(null);
            setAutoAddTrainingResult(false);
          }}
          onEdit={() => {
            if (!selectedCustomer) return;
            setDetailOpen(false);
            setAutoAddTrainingResult(false);
            setEditOpen(true);
          }}
          autoAddTrainingResult={autoAddTrainingResult}
          extraProfile={selectedDetailLearningContext?.profile}
          extraTas={selectedDetailLearningContext?.tas}
          extraTrainingResults={
            selectedDetailLearningContext
              ? selectedDetailLearningContext.trainings
              : selectedCustomer
                ? learningResults[selectedCustomer.code]
                : undefined
          }
          onTrainingResultsChange={(nextResults) => {
            if (!selectedCustomer) return;
            setLearningResults((current) => ({ ...current, [selectedCustomer.code]: nextResults }));
            setSelectedLearningContext((current) => current ? { ...current, trainings: nextResults } : current);
          }}
        />
      ) : null}
    </>
  );
}

type TrainingResultEntry = {
  name: string;
  pkg: string;
  tier: string;
  date: string;
  coach: string;
  ta: string;
  session: string;
  content: string;
  contentSub: string;
  drill: string;
  drillSub: string;
  note: string;
};

type CustomerLearningRow = {
  customer: Customer;
  assignedCoach: string;
  assignedPackage: string;
  assignedTier: string;
  profile: Profile | null;
  trainings: TrainingResultEntry[];
  latestTraining: TrainingResultEntry | null;
  tas: TaEntry[];
};

type CustomerLearningContext = Pick<CustomerLearningRow, "profile" | "tas" | "trainings">;

const LEARNING_CONTRACT_ASSIGNMENTS = [
  { pkg: "Eagle", tier: "Premium", coach: "Trần Quốc Toàn", type: "Gói HLV 1-1" },
  { pkg: "Birdie", tier: "Standard", coach: "Nguyễn Văn Hải", type: "Lớp nhóm" },
  { pkg: "Par", tier: "Basic", coach: "Trần Quốc Toàn", type: "Gói HLV cá nhân" },
  { pkg: "Eagle", tier: "Premium", coach: "Lê Minh", type: "Gói HLV 1-1" },
];

const LEARNING_PROFILE_VARIANTS: Array<Partial<Profile>> = [
  {
    level: "Beginner",
    handicap: "Chưa có HCP",
    golfStartTime: "20/05/2026",
    playingGoal: "Nắm vững grip, setup và lên sân 9 hố",
    handedness: "Phải",
    otherSports: "Gym, chạy bộ",
    clubs: "Bộ gậy thuê tại trung tâm",
    coachFreq: "2",
    selfFreq: "1",
    fitness: 4,
    healthNotes: "Cần lưu ý cổ tay phải khi tập driver",
  },
  {
    level: "Experienced",
    handicap: "HCP 24",
    golfStartTime: "03/2024",
    playingGoal: "Ổn định short game và giảm điểm xuống dưới 95",
    handedness: "Phải",
    otherSports: "Tennis",
    clubs: "Callaway Rogue ST",
    coachFreq: "1",
    selfFreq: "2",
    fitness: 3,
    healthNotes: "Không có chấn thương đáng lưu ý",
    golfDuration: "1 năm",
    currentHandicap: "24",
    targetHandicap: "18",
    satisfiedPart: "Putting dưới 2m",
    improveAspects: "Chipping quanh green, kiểm soát khoảng cách wedge",
    struggles: "Bóng slice khi dùng driver",
    detailedDesc: "Muốn có routine rõ hơn trước mỗi cú đánh để giảm lỗi tâm lý.",
    iron7Distance: "125 yard",
    driverDistance: "205 yard",
  },
  {
    level: "Beginner",
    handicap: "Chưa có HCP",
    golfStartTime: "05/2026",
    playingGoal: "Học thử để chọn gói HLV phù hợp",
    handedness: "Trái",
    otherSports: "Yoga",
    clubs: "Chưa có bộ gậy riêng",
    coachFreq: "1",
    selfFreq: "1",
    fitness: 5,
    healthNotes: "Thể lực tốt, cần làm quen nhịp swing",
  },
  {
    level: "Experienced",
    handicap: "HCP 16",
    golfStartTime: "2022",
    playingGoal: "Tăng độ ổn định iron và chuẩn bị giải nội bộ",
    handedness: "Phải",
    otherSports: "Bơi",
    clubs: "Titleist T200",
    coachFreq: "2",
    selfFreq: "3",
    fitness: 4,
    healthNotes: "Cần khởi động kỹ vùng lưng dưới",
    golfDuration: "3 năm",
    currentHandicap: "16",
    targetHandicap: "12",
    satisfiedPart: "Iron 7 ổn định",
    improveAspects: "Course management, bunker shot",
    struggles: "Mất nhịp khi gặp gió ngược",
    detailedDesc: "Cần kế hoạch tập theo giải và theo dõi dispersion từng gậy.",
    iron7Distance: "145 yard",
    driverDistance: "235 yard",
  },
];

const LEARNING_TRAINING_RESULTS: TrainingResultEntry[] = [
  {
    name: "Nguyễn Văn A",
    pkg: "Eagle",
    tier: "Premium",
    date: "15/05/2024",
    coach: "Trần Quốc Toàn",
    ta: "Lê Minh",
    session: "Buổi 1",
    content: "Swing & Driver",
    contentSub: "Chỉnh sửa tư thế & tốc độ",
    drill: "Swing & Driver",
    drillSub: "Bài tập giữ trục và nhịp backswing",
    note: "Tốc độ đầu gậy cải thiện 15% so với tháng trước.",
  },
  {
    name: "Trần Thị B",
    pkg: "Birdie",
    tier: "Standard",
    date: "18/05/2024",
    coach: "Nguyễn Văn Hải",
    ta: "Phạm Hoàng Nam",
    session: "Buổi 4",
    content: "Short Game",
    contentSub: "Chipping quanh green",
    drill: "Landing zone drill",
    drillSub: "Tập 30 bóng ở 3 khoảng cách",
    note: "Cần follow thêm bài tập khoảng cách 20-30 yards.",
  },
  {
    name: "Lê Văn C",
    pkg: "Par",
    tier: "Basic",
    date: "20/05/2024",
    coach: "Trần Quốc Toàn",
    ta: "Lê Minh",
    session: "Buổi 2",
    content: "Putting",
    contentSub: "Kiểm soát lực và hướng mặt gậy",
    drill: "Gate drill",
    drillSub: "10 phút trước mỗi buổi tự tập",
    note: "Putting ổn hơn, vẫn cần kiểm tra routine trước bóng.",
  },
];

const LEARNING_TA_ASSIGNMENTS: TaEntry[][] = [
  [
    { code: "NV-0012", name: "Nguyễn Văn An", phone: "0901234567", email: "an.nguyen@example.com", course: "Golf Swing 3 tháng", schedule: "T2-T4-T6 · 07:00-09:00", note: "Theo sát giai đoạn chỉnh swing." },
    { code: "NV-0056", name: "Lê Minh Anh", phone: "0923456712", email: "leminhanh@example.com", course: "Short Game Premium", schedule: "T3-T5 · 16:00-18:00", note: "Hỗ trợ ghi nhận bài tập về nhà." },
  ],
  [
    { code: "NV-0072", name: "Phạm Hoàng Nam", phone: "0901224578", email: "phnam@example.com", course: "Driving Range Foundation", schedule: "T3-T5-T7 · 14:00-16:00", note: "Nhắc lịch tự tập và cập nhật kết quả." },
  ],
  [
    { code: "NV-0034", name: "Trần Thị Bình", phone: "0912345678", email: "binh.tran@example.com", course: "Short Game Premium", schedule: "T2-T6 · 18:00-20:00", note: "Follow kỹ phần putting." },
  ],
];

function buildLearningRows(customers: Customer[], learningResults: Record<string, TrainingResultEntry[]>): CustomerLearningRow[] {
  return customers.flatMap((customer, index) => {
    const isRegistered = customer.registerDate !== "---" && customer.status !== "Chưa đăng ký";
    const training = LEARNING_TRAINING_RESULTS[index % LEARNING_TRAINING_RESULTS.length];
    const tas = LEARNING_TA_ASSIGNMENTS[index % LEARNING_TA_ASSIGNMENTS.length];
    const contract = LEARNING_CONTRACT_ASSIGNMENTS[index % LEARNING_CONTRACT_ASSIGNMENTS.length];
    const profileVariant = LEARNING_PROFILE_VARIANTS[index % LEARNING_PROFILE_VARIANTS.length];
    const hasProfile = isRegistered && index % 5 !== 3;
    const hasTraining = isRegistered && index % 4 !== 2;
    const assignedTas = isRegistered && index % 6 !== 4 ? tas : [];
    const isTrainingRelated = isRegistered || hasProfile || hasTraining || assignedTas.length > 0;
    if (!isTrainingRelated) return [];
    const hasSavedTrainings = Object.prototype.hasOwnProperty.call(learningResults, customer.code);
    const savedTrainings = learningResults[customer.code] ?? [];
    const seededLatest = hasTraining ? {
      ...training,
      name: customer.name,
      pkg: contract.pkg,
      tier: contract.tier,
      ta: assignedTas[0]?.name ?? training.ta,
    } : null;
    const seededTrainings = seededLatest ? makeTrainingSeries(seededLatest) : [];
    const trainings = hasSavedTrainings ? savedTrainings : seededTrainings;
    return [{
      customer,
      assignedCoach: contract.coach,
      assignedPackage: contract.pkg,
      assignedTier: contract.tier,
      profile: hasProfile ? {
        ...DEFAULT_PROFILE,
        ...profileVariant,
        name: customer.name,
        gender: customer.gender,
        dob: ddmmyyyyToISO(customer.birth) || customer.birth,
        phone: customer.phone,
        email: customer.email,
        coachEpga: hasTraining ? training.coach : contract.coach,
      } : null,
      trainings,
      latestTraining: trainings[0] ?? null,
      tas: assignedTas,
    }];
  });
}

function getTrainingSessionNumber(training: TrainingResultEntry | null) {
  const match = training?.session.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function makeTrainingSeries(latest: TrainingResultEntry) {
  const count = Math.max(1, getTrainingSessionNumber(latest));
  return Array.from({ length: count }, (_, index): TrainingResultEntry => {
    const sessionNumber = count - index;
    const template = LEARNING_TRAINING_RESULTS[(sessionNumber - 1) % LEARNING_TRAINING_RESULTS.length];
    return {
      ...template,
      name: latest.name,
      pkg: latest.pkg,
      tier: latest.tier,
      coach: latest.coach,
      ta: latest.ta,
      session: `Buổi ${sessionNumber}`,
      date: index === 0 ? latest.date : `${String(Math.max(1, 15 + sessionNumber)).padStart(2, "0")}/05/2024`,
      ...(sessionNumber === count ? latest : {}),
    };
  });
}

function CustomerLearningOverview({
  customers,
  learningResults,
  onOpenCustomer,
  onSaveTrainingResult,
}: {
  customers: Customer[];
  learningResults: Record<string, TrainingResultEntry[]>;
  onOpenCustomer: (customer: Customer, tab: string, autoAdd?: boolean, context?: CustomerLearningContext) => void;
  onSaveTrainingResult: (customerCode: string, entry: TrainingResultEntry) => void;
}) {
  const [query, setQuery] = useState("");
  const [taFilter, setTaFilter] = useState("Tất cả TA");
  const [taFilterQuery, setTaFilterQuery] = useState("");
  const [taFilterOpen, setTaFilterOpen] = useState(false);
  const [profileFilter, setProfileFilter] = useState("Tất cả profile");
  const [resultFilter, setResultFilter] = useState("Tất cả kết quả");
  const [selected, setSelected] = useState<CustomerLearningRow | null>(null);
  const [quickAddTarget, setQuickAddTarget] = useState<CustomerLearningRow | null>(null);
  const [quickProfileTarget, setQuickProfileTarget] = useState<CustomerLearningRow | null>(null);
  const [quickTaTarget, setQuickTaTarget] = useState<CustomerLearningRow | null>(null);
  const [profileOverrides, setProfileOverrides] = useState<Record<string, Profile>>({});
  const [taOverrides, setTaOverrides] = useState<Record<string, TaEntry[]>>({});

  const learningRows = buildLearningRows(customers, learningResults).map((row) => ({
    ...row,
    profile: profileOverrides[row.customer.code] ?? row.profile,
    tas: taOverrides[row.customer.code] ?? row.tas,
  }));
  const taOptions = Array.from(new Set(learningRows.flatMap((row) => row.tas.map((ta) => ta.name))));
  const taFilterOptions = ["Tất cả TA", "Chưa có TA", ...taOptions].filter((option) => {
    const normalized = taFilterQuery.trim().toLowerCase();
    return !normalized || option.toLowerCase().includes(normalized);
  });
  const withProfile = learningRows.filter((row) => row.profile).length;
  const withResult = learningRows.filter((row) => row.trainings.length > 0).length;
  const missingTa = learningRows.filter((row) => row.tas.length === 0).length;
  const filtered = learningRows.filter((row) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery) {
      const haystack = [
        row.customer.code,
        row.customer.name,
        row.customer.phone,
        row.assignedCoach,
        row.assignedPackage,
        row.assignedTier,
        row.latestTraining?.coach ?? "",
        row.latestTraining?.ta ?? "",
        row.latestTraining?.content ?? "",
        row.latestTraining?.drill ?? "",
        ...row.trainings.flatMap((training) => [training.date, training.session, training.content, training.drill, training.note]),
        row.profile?.playingGoal ?? "",
        ...row.tas.map((ta) => ta.name),
      ].join(" ").toLowerCase();
      if (!haystack.includes(normalizedQuery)) return false;
    }
    if (profileFilter === "Đã có profile" && !row.profile) return false;
    if (profileFilter === "Chưa có profile" && row.profile) return false;
    if (resultFilter === "Đã có kết quả" && row.trainings.length === 0) return false;
    if (resultFilter === "Chưa có kết quả" && row.trainings.length > 0) return false;
    if (taFilter === "Chưa có TA" && row.tas.length > 0) return false;
    if (taFilter !== "Tất cả TA" && taFilter !== "Chưa có TA" && !row.tas.some((ta) => ta.name === taFilter)) return false;
    return true;
  });

  return (
    <>
      <section className={styles.learningOverview}>
        <div className={styles.learningHeader}>
          <div>
            <h2>Hồ sơ tập luyện</h2>
            <p>Chỉ hiển thị học viên có liên quan đào tạo; gói và HLV lấy từ hợp đồng/lịch học, kết quả lấy từ tab kết quả tập luyện.</p>
          </div>
        </div>

        <div className={styles.learningKpis}>
          <div className={styles.learningKpiBlue}>
            <span><GraduationCap size={18} /></span>
            <div><em>Học viên đào tạo</em><strong>{learningRows.length}</strong></div>
          </div>
          <div className={styles.learningKpiGreen}>
            <span><UserCheck size={18} /></span>
            <div><em>Có profile</em><strong>{withProfile}/{learningRows.length}</strong></div>
          </div>
          <div className={styles.learningKpiPurple}>
            <span><ShieldCheck size={18} /></span>
            <div><em>Có kết quả</em><strong>{withResult}/{learningRows.length}</strong></div>
          </div>
          <div className={styles.learningKpiAmber}>
            <span><AlertTriangle size={18} /></span>
            <div><em>Chưa có TA</em><strong>{missingTa}</strong></div>
          </div>
        </div>

        <div className={styles.learningFilters}>
          <label className={styles.customerSearch}>
            <Search size={18} />
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm tên, mã HV, SĐT, HLV, nội dung tập..."
              value={query}
            />
          </label>
          <div className={styles.learningTaFilter}>
            <button onClick={() => setTaFilterOpen((value) => !value)} type="button">
              <span>{taFilter}</span>
              <ChevronDown size={15} />
            </button>
            {taFilterOpen ? (
              <div className={styles.learningTaFilterMenu}>
                <label>
                  <Search size={15} />
                  <input
                    autoFocus
                    onChange={(event) => setTaFilterQuery(event.target.value)}
                    placeholder="Tìm TA..."
                    value={taFilterQuery}
                  />
                </label>
                <div>
                  {taFilterOptions.map((option) => (
                    <button
                      className={taFilter === option ? styles.learningTaFilterActive : undefined}
                      key={option}
                      onClick={() => {
                        setTaFilter(option);
                        setTaFilterOpen(false);
                        setTaFilterQuery("");
                      }}
                      type="button"
                    >
                      {option}
                    </button>
                  ))}
                  {taFilterOptions.length === 0 ? <span>Không tìm thấy TA</span> : null}
                </div>
              </div>
            ) : null}
          </div>
          <select className={styles.selectInput} onChange={(event) => setProfileFilter(event.target.value)} value={profileFilter}>
            {["Tất cả profile", "Đã có profile", "Chưa có profile"].map((option) => <option key={option}>{option}</option>)}
          </select>
          <select className={styles.selectInput} onChange={(event) => setResultFilter(event.target.value)} value={resultFilter}>
            {["Tất cả kết quả", "Đã có kết quả", "Chưa có kết quả"].map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>

        <section className={styles.memberTableCard}>
          <div className={styles.memberTableWrap}>
            <table className={`${styles.memberTable} ${styles.learningTable}`}>
              <thead>
                <tr>
                  <th>Học viên</th>
                  <th>Profile</th>
                  <th>TA phụ trách</th>
                  <th>Gói tập</th>
                  <th>HLV</th>
                  <th>Đã học</th>
                  <th>Buổi gần nhất</th>
                  <th>Nội dung gần nhất</th>
                  <th>Drill/BTVN gần nhất</th>
                  <th>Ghi chú gần nhất</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const latest = row.latestTraining;
                  return (
                    <tr key={row.customer.code}>
                      <td>
                        <button className={styles.memberCode} onClick={() => onOpenCustomer(row.customer, "Thông tin cơ bản", false, row)} type="button">{row.customer.code}</button>
                        <div className={styles.learningMemberCell}><strong>{row.customer.name}</strong><small>{row.customer.phone}</small></div>
                      </td>
                      <td>
                        <div className={styles.learningProfileCell}>
                        {row.profile ? (
                          <>
                              <button className={styles.learningProfileLink} onClick={() => onOpenCustomer(row.customer, "Profile", false, row)} type="button">
                                {row.profile.level === "Beginner" ? "Mới học Golf" : "Có kinh nghiệm"}
                              </button>
                              <span>{row.profile.handicap}</span>
                              <span>{row.profile.playingGoal}</span>
                            </>
                          ) : (
                            <span className={styles.learningMissingBadge}>Chưa có profile</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className={styles.learningTaStack}>
                          {row.tas.length ? row.tas.map((ta) => <span key={ta.code}>{ta.name}</span>) : <em>Chưa có TA</em>}
                        </div>
                      </td>
                      <td>
                        <div className={styles.pkgBadges}>
                          <span className={styles.pkgPrimary}>{row.assignedPackage}</span>
                          <span className={styles.pkgSecondary}>{row.assignedTier}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.learningCoachCell}>
                          <strong>{latest?.coach ?? row.assignedCoach}</strong>
                        </div>
                      </td>
                      <td>
                        <span className={styles.learningCountPill}>{Math.max(row.trainings.length, getTrainingSessionNumber(latest))} buổi</span>
                      </td>
                      <td>
                        {latest ? (
                          <div className={styles.learningLatestCell}>
                            <strong>{latest.session}</strong>
                            <span>{latest.date}</span>
                          </div>
                        ) : <span className={styles.learningMissingText}>—</span>}
                      </td>
                      <td>
                        {latest ? (
                          <div className={styles.learningResultSummary}>
                            <strong>{latest.content}</strong>
                            <span>{latest.contentSub}</span>
                          </div>
                        ) : <span className={styles.learningMissingText}>—</span>}
                      </td>
                      <td>
                        {latest ? (
                          <div className={styles.learningResultSummary}>
                            <strong>{latest.drill}</strong>
                            <span>{latest.drillSub}</span>
                          </div>
                        ) : <span className={styles.learningMissingText}>—</span>}
                      </td>
                      <td className={styles.learningNoteCell}>{latest?.note ?? "—"}</td>
                      <td>
                        <div className={styles.learningActions}>
                          <button onClick={() => onOpenCustomer(row.customer, "Kết quả tập luyện", false, row)} title="Xem kết quả tập luyện" type="button"><Eye size={15} /></button>
                          <button onClick={() => setQuickAddTarget(row)} type="button">+ Kết quả</button>
                          <span className={styles.learningQuickActions}>
                            {!row.profile ? <button className={styles.learningProfileButton} onClick={() => setQuickProfileTarget(row)} type="button">+ Profile</button> : null}
                            {row.tas.length === 0 ? <button className={styles.learningTaButton} onClick={() => setQuickTaTarget(row)} type="button">+ TA</button> : null}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 ? (
                  <tr>
                    <td className={styles.emptyTableCell} colSpan={11}>Không có hồ sơ phù hợp với bộ lọc hiện tại.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <div className={styles.pagination}>
            <span>Hiển thị {filtered.length} / {learningRows.length} hồ sơ</span>
            <span>Đang lọc: {taFilter}</span>
          </div>
        </section>
      </section>

      {selected ? (
        <LearningOverviewDrawer
          row={selected}
          onClose={() => setSelected(null)}
          onOpenCustomer={(tab) => onOpenCustomer(selected.customer, tab)}
        />
      ) : null}

      {quickAddTarget ? (
        <AddTrainingResultModal
          assignedTas={quickAddTarget.tas}
          initial={{
            coach: quickAddTarget.assignedCoach,
            name: quickAddTarget.customer.name,
            pkg: `${quickAddTarget.assignedPackage} ${quickAddTarget.assignedTier}`,
            ta: quickAddTarget.tas.map((ta) => ta.name).join(", "),
          }}
          onClose={() => setQuickAddTarget(null)}
          onSave={(entry) => {
            onSaveTrainingResult(quickAddTarget.customer.code, entry);
            setQuickAddTarget(null);
          }}
        />
      ) : null}

      {quickProfileTarget ? (
        <AddProfileModal
          initial={{
            ...DEFAULT_PROFILE,
            name: quickProfileTarget.customer.name,
            gender: quickProfileTarget.customer.gender,
            dob: ddmmyyyyToISO(quickProfileTarget.customer.birth) || quickProfileTarget.customer.birth,
            phone: quickProfileTarget.customer.phone,
            email: quickProfileTarget.customer.email,
            coachEpga: quickProfileTarget.assignedCoach,
          }}
          onClose={() => setQuickProfileTarget(null)}
          onSave={(profile) => {
            setProfileOverrides((current) => ({ ...current, [quickProfileTarget.customer.code]: profile }));
            setQuickProfileTarget(null);
          }}
        />
      ) : null}

      {quickTaTarget ? (
        <AssignTaModal
          onClose={() => setQuickTaTarget(null)}
          onSave={(entry) => {
            setTaOverrides((current) => ({ ...current, [quickTaTarget.customer.code]: [entry] }));
            setQuickTaTarget(null);
          }}
        />
      ) : null}
    </>
  );
}

function LearningOverviewDrawer({
  row,
  onClose,
  onOpenCustomer,
}: {
  row: CustomerLearningRow;
  onClose: () => void;
  onOpenCustomer: (tab: string) => void;
}) {
  return (
    <div className={styles.nestedOverlay}>
      <aside className={styles.learningDrawer}>
        <header>
          <div>
            <h2>{row.customer.name}</h2>
            <p>{row.customer.code} · {row.customer.phone}</p>
          </div>
          <button onClick={onClose} type="button"><X size={18} /></button>
        </header>

        <div className={styles.learningDrawerBody}>
          <section>
            <h3>Profile</h3>
            {row.profile ? (
              <div className={styles.profileViewGrid2}>
                <ProfileViewRow label="Số khoá học" value={row.profile.courseCount} />
                <ProfileViewRow label="HLV đã từng học tại EPGA" value={row.profile.coachEpga} />
                <ProfileViewRow label="Học viên/HLV đã từng học ngoài EPGA" value={row.profile.coachOther} />
                <ProfileViewRow label="Full Name/Họ và Tên:" value={row.profile.name} />
                <ProfileViewRow label="Gender/Giới tính:" value={row.profile.gender} />
                <ProfileViewRow label="Date of birth/Ngày sinh:" value={row.profile.dob} />
                <ProfileViewRow label="Mobile/SĐT:" value={row.profile.phone} />
                <ProfileViewRow label="Email" value={row.profile.email} />
                <ProfileViewRow label="Trình độ:" value={row.profile.level === "Beginner" ? "Mới học Golf" : "Có kinh nghiệm"} />
                <ProfileViewRow label="Handicap:" value={row.profile.handicap} />
                <ProfileViewRow label="Mục tiêu chơi golf/Playing goal:" value={row.profile.playingGoal} />
                <ProfileViewRow label="Tay thuận/Handedness:" value={row.profile.handedness} />
              </div>
            ) : <div className={styles.learningEmptyBlock}>Khách hàng này chưa có Profile.</div>}
          </section>

          <section>
            <h3>Kết quả tập luyện</h3>
            {row.trainings.length ? (
              <div className={styles.learningTimeline}>
                {row.trainings.map((training, index) => (
                  <article key={`${training.date}-${training.session}-${index}`}>
                    <div>
                      <strong>{training.session}</strong>
                      <span>{training.date} · {training.coach}</span>
                    </div>
                    <p>{training.content}{training.contentSub ? ` · ${training.contentSub}` : ""}</p>
                    <small>{training.drill}{training.drillSub ? ` · ${training.drillSub}` : ""}</small>
                    <em>{training.note}</em>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.learningResultGrid}>
                <InfoBlock label="Gói tập">{row.assignedPackage} · {row.assignedTier}</InfoBlock>
                <InfoBlock label="HLV">{row.assignedCoach}</InfoBlock>
                <InfoBlock label="Trạng thái kết quả">Chưa có kết quả tập luyện</InfoBlock>
                <InfoBlock label="Thao tác">Dùng nút + Kết quả ở danh sách để cập nhật.</InfoBlock>
              </div>
            )}
          </section>

          <section>
            <h3>Trợ giảng TA</h3>
            <div className={styles.learningTaCards}>
              {row.tas.length ? row.tas.map((ta) => (
                <article key={ta.code}>
                  <strong>{ta.name}</strong>
                  <span>{ta.code}</span>
                  <span>{ta.phone} · {ta.email}</span>
                  <span>{ta.course || "—"}</span>
                  <span>{ta.schedule}</span>
                  <em>{ta.note}</em>
                </article>
              )) : <div className={styles.learningEmptyBlock}>Khách hàng này chưa được gán TA.</div>}
            </div>
          </section>
        </div>

        <footer>
          <button onClick={() => onOpenCustomer("Profile")} type="button">Mở Profile</button>
          <button onClick={() => onOpenCustomer("Kết quả tập luyện")} type="button">Mở kết quả</button>
          <button className={styles.blueButton} onClick={() => onOpenCustomer("Trợ giảng TA")} type="button">Mở TA</button>
        </footer>
      </aside>
    </div>
  );
}

function CustomerFormModal({
  initialCustomer,
  mode,
  nestedModal,
  onClose,
  onOpenNested,
  onSubmit,
  rows,
}: {
  initialCustomer?: Customer;
  mode: "create" | "edit";
  nestedModal: "group" | "source" | "companion" | null;
  onClose: () => void;
  onOpenNested: (modal: "group" | "source" | "companion" | null) => void;
  onSubmit: (customer: Customer) => void;
  rows: Customer[];
}) {
  const isEdit = mode === "edit";
  const initial = initialCustomer;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [memberCode, setMemberCode] = useState(initial?.code ?? nextCustomerCode(rows));
  const [biometricCode, setBiometricCode] = useState(initial?.biometricCode ?? nextBiometricCode(rows));
  const [groupOptions, setGroupOptions] = useState(["Chọn nhóm", "VIP", "Premium", "Standard", "Khách vãng lai"]);
  const [sourceOptions, setSourceOptions] = useState(["Chọn nguồn", "Walk-in", "Facebook", "Google", "Giới thiệu", "CN khác"]);
  const [customerGroup, setCustomerGroup] = useState(initial?.customerGroup ?? "Chọn nhóm");
  const [customerSource, setCustomerSource] = useState(initial?.source ?? "Chọn nguồn");
  const [companions, setCompanions] = useState<Array<{ name: string; relation: string; phone?: string }>>([]);
  const [showExtra, setShowExtra] = useState(true);
  const [customFields, setCustomFields] = useState<Array<{ id: string; label: string }>>([]);
  const [customPanelOpen, setCustomPanelOpen] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState("");

  const addCustomField = () => {
    const trimmed = newFieldLabel.trim();
    if (!trimmed) return;
    setCustomFields((current) => [...current, { id: `cf-${Date.now()}`, label: trimmed }]);
    setNewFieldLabel("");
  };

  const removeCustomField = (id: string) =>
    setCustomFields((current) => current.filter((field) => field.id !== id));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const idNumber = String(data.get("idNumber") ?? "").trim();
    const nextErrors: Record<string, string> = {};

    if (!name) nextErrors.name = "Nhập họ tên hội viên.";
    if (!/^[0-9]{10,11}$/.test(phone)) nextErrors.phone = "Số điện thoại phải gồm 10-11 chữ số.";
    if (rows.some((row) => row.phone === phone && row.code !== initial?.code)) {
      nextErrors.phone = "Số điện thoại đã tồn tại trong danh sách hội viên.";
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Email không đúng định dạng.";
    if (idNumber && !/^([0-9]{9}|[0-9]{12})$/.test(idNumber)) nextErrors.idNumber = "CCCD/CMND phải gồm 9 hoặc 12 chữ số.";
    if (customerGroup === "Chọn nhóm") nextErrors.customerGroup = "Chọn nhóm khách hàng để phục vụ phân loại báo cáo.";
    if (customerSource === "Chọn nguồn") nextErrors.customerSource = "Chọn nguồn khách hàng để theo dõi hiệu quả kinh doanh.";

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    const birthInput = String(data.get("birth") ?? "");
    const formattedBirth = birthInput
      ? (() => {
          const [y, m, d] = birthInput.split("-");
          return d && m && y ? `${Number(d)}/${Number(m)}/${y}` : birthInput;
        })()
      : initial?.birth ?? "---";

    if (isEdit && initial) {
      onSubmit({
        ...initial,
        birth: formattedBirth || "---",
        email,
        gender: String(data.get("gender") ?? initial.gender) || initial.gender,
        biometricCode,
        customerGroup,
        source: customerSource,
        cardNumber: String(data.get("cardNumber") ?? ""),
        idNumber,
        contactName: String(data.get("contactName") ?? ""),
        contactPhone: String(data.get("contactPhone") ?? ""),
        province: String(data.get("province") ?? ""),
        ward: String(data.get("ward") ?? ""),
        address: String(data.get("address") ?? ""),
        note: String(data.get("note") ?? ""),
        name,
        phone,
      });
    } else {
      onSubmit({
        birth: formattedBirth || "---",
        cards: ["green"],
        code: memberCode,
        createdDate: "7/4/2026",
        creator: "Admin",
        biometricCode,
        customerGroup,
        source: customerSource,
        cardNumber: String(data.get("cardNumber") ?? ""),
        idNumber,
        contactName: String(data.get("contactName") ?? ""),
        contactPhone: String(data.get("contactPhone") ?? ""),
        province: String(data.get("province") ?? ""),
        ward: String(data.get("ward") ?? ""),
        address: String(data.get("address") ?? ""),
        note: String(data.get("note") ?? ""),
        debt: "0 VND",
        email,
        endDate: "---",
        gender: String(data.get("gender") ?? "Nam") || "Nam",
        name,
        phone,
        registerDate: "---",
        status: "Chưa đăng ký",
      });
    }
    onClose();
  };

  const headerTitle = isEdit ? "Chỉnh sửa hội viên" : "Thêm mới khách hàng";
  const headerSubtitle = isEdit
    ? `Cập nhật thông tin hội viên ${initial?.name ?? ""} (${initial?.code ?? ""})`
    : "Điền thông tin hội viên mới vào form bên dưới";
  const submitLabel = isEdit ? "Cập nhật" : "Thêm hội viên";
  const fieldError = (name: string) =>
    errors[name] ? <small className={styles.fieldErrorText}>{errors[name]}</small> : null;

  return (
    <div className={styles.modalOverlay}>
      <form className={`${styles.modalShell} ${nestedModal ? styles.dimmedModal : ""}`} onSubmit={handleSubmit}>
        <header className={styles.modalHeader}>
          <div>
            <h2>{headerTitle}</h2>
            <p>{headerSubtitle}</p>
          </div>
          <button onClick={onClose} type="button"><X size={22} /></button>
        </header>

        <div className={styles.modalBody}>
          <h3>Thông tin khách hàng</h3>
          <div className={styles.formGrid}>
            <label>
              <span>Mã hội viên</span>
              <div className={styles.inputWrap}>
                <input name="code" readOnly value={memberCode} />
                {!isEdit ? <button onClick={() => setMemberCode(nextCustomerCode(rows))} type="button">Tự động</button> : null}
              </div>
            </label>
            <label>
              <span>Mã sinh trắc học</span>
              <div className={styles.inputWrap}>
                <input name="biometricCode" readOnly value={biometricCode} />
                {!isEdit ? <button onClick={() => setBiometricCode(nextBiometricCode(rows))} type="button">Tự động</button> : null}
              </div>
            </label>
            <label>
              <span>Họ và tên <b>*</b></span>
              <div className={`${styles.inputWrap} ${errors.name ? styles.inputWrapError : ""}`}>
                <input
                  defaultValue={initial?.name}
                  name="name"
                  onChange={() => setErrors((current) => ({ ...current, name: "" }))}
                  placeholder="Nhập họ và tên"
                />
              </div>
              {fieldError("name")}
            </label>
            <label>
              <span>Số điện thoại <b>*</b></span>
              <div className={`${styles.inputWrap} ${errors.phone ? styles.inputWrapError : ""}`}>
                <input
                  defaultValue={initial?.phone}
                  inputMode="tel"
                  name="phone"
                  onChange={() => setErrors((current) => ({ ...current, phone: "" }))}
                  placeholder="0901234567"
                />
              </div>
              {fieldError("phone")}
            </label>
            <label>
              <span>Email</span>
              <div className={`${styles.inputWrap} ${errors.email ? styles.inputWrapError : ""}`}>
                <input
                  defaultValue={initial?.email}
                  name="email"
                  onChange={() => setErrors((current) => ({ ...current, email: "" }))}
                  placeholder="member@golf.vn"
                  type="email"
                />
              </div>
              {fieldError("email")}
            </label>
            <FormField
              defaultValue={ddmmyyyyToISO(initial?.birth)}
              label="Ngày sinh"
              name="birth"
              type="date"
            />
            <SelectField
              defaultValue={initial?.creator}
              label="Nhân viên phụ trách"
              name="assignedSale"
              options={["Tự chọn Sale phụ trách", "Admin", "Nguyễn Văn Thành", "Lê Thị Mai", "Trần Minh Hoàng"]}
            />
            <FormField defaultValue={initial?.cardNumber} label="Thẻ khách hàng (RFID)" name="cardNumber" placeholder="RFID/Mifare/Barcode nội bộ" />
            <SelectField
              action="Thêm mới"
              label="Nhóm khách hàng"
              name="customerGroup"
              onAction={() => onOpenNested("group")}
              onChange={(value) => {
                setCustomerGroup(value);
                setErrors((current) => ({ ...current, customerGroup: "" }));
              }}
              options={groupOptions}
              value={customerGroup}
            />
            {fieldError("customerGroup")}
          </div>
          <FormField area defaultValue={initial?.note} label="Ghi chú" name="note" placeholder="Sở thích, mục tiêu tập golf, ghi chú chăm sóc..." />
          <SelectField
            action="Thêm mới"
            label="Nguồn khách hàng"
            name="customerSource"
            onAction={() => onOpenNested("source")}
            onChange={(value) => {
              setCustomerSource(value);
              setErrors((current) => ({ ...current, customerSource: "" }));
            }}
            options={sourceOptions}
            value={customerSource}
          />
          {fieldError("customerSource")}

          <div className={styles.formDivider} />
          <div className={styles.customFieldRow}>
            <strong>Trường tùy chỉnh ({customFields.length})</strong>
            <button onClick={() => setCustomPanelOpen((value) => !value)} type="button">
              {customPanelOpen ? "Đóng" : "+ Quản lý trường"}
            </button>
            {customFields.length === 0 && !customPanelOpen ? (
              <p>Chưa có trường tùy chỉnh nào được thêm</p>
            ) : null}
          </div>

          {customPanelOpen ? (
            <div className={styles.customFieldPanel}>
              <input
                onChange={(event) => setNewFieldLabel(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addCustomField();
                  }
                }}
                placeholder="Tên trường mới (VD: Câu lạc bộ, Mã giới thiệu...)"
                value={newFieldLabel}
              />
              <button className={styles.blueButton} onClick={addCustomField} type="button">
                + Thêm trường
              </button>
            </div>
          ) : null}

          {customFields.length > 0 ? (
            <div className={styles.formGrid}>
              {customFields.map((field) => (
                <div className={styles.customFieldItem} key={field.id}>
                  <FormField label={field.label} placeholder={`Nhập ${field.label.toLowerCase()}`} />
                  <button
                    aria-label={`Xóa trường ${field.label}`}
                    className={styles.customFieldRemove}
                    onClick={() => removeCustomField(field.id)}
                    type="button"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <div className={styles.formDivider} />
          <button
            className={styles.collapseButton}
            onClick={() => setShowExtra((value) => !value)}
            type="button"
          >
            {showExtra ? "⌃ Ẩn bớt" : "⌄ Hiển thị thêm"}
          </button>

          {showExtra ? (
            <>
              <div className={styles.formGrid}>
                <label>
                  <span>Số CMND/CCCD</span>
                  <div className={`${styles.inputWrap} ${errors.idNumber ? styles.inputWrapError : ""}`}>
                    <input
                      defaultValue={initial?.idNumber}
                      inputMode="numeric"
                      name="idNumber"
                      onChange={() => setErrors((current) => ({ ...current, idNumber: "" }))}
                      placeholder="9 hoặc 12 chữ số"
                    />
                  </div>
                  {fieldError("idNumber")}
                </label>
                <SelectField
                  defaultValue={initial?.gender ?? "Nam"}
                  label="Giới tính"
                  name="gender"
                  options={["Nam", "Nữ", "Khác"]}
                />
                <FormField
                  action="Thêm"
                  label="Người đi cùng"
                  onAction={() => onOpenNested("companion")}
                  value={companions.length ? companions.map((item) => `${item.name} (${item.relation})`).join(", ") : "Không có"}
                />
                <FormField defaultValue={initial?.contactName} label="Người liên hệ" name="contactName" placeholder="Tên người liên hệ khẩn cấp" />
                <FormField defaultValue={initial?.contactPhone} label="SĐT liên hệ" name="contactPhone" placeholder="Số điện thoại" />
                <FormField defaultValue={initial?.province} label="Tỉnh/Thành phố" name="province" placeholder="TP.HCM" />
                <FormField defaultValue={initial?.ward} label="Phường/Xã" name="ward" placeholder="Phường/Xã" />
              </div>
              <FormField defaultValue={initial?.address} label="Thôn/Xóm/Số nhà" name="address" placeholder="Nhập địa chỉ chi tiết" />
            </>
          ) : null}
        </div>

        <footer className={styles.modalFooter}>
          <button onClick={onClose} type="button">Hủy bỏ</button>
          <button className={styles.blueButton} type="submit">{submitLabel}</button>
        </footer>
      </form>
      {nestedModal === "group" ? (
        <AddGroupModal
          onClose={() => onOpenNested(null)}
          onSave={(group) => {
            setGroupOptions((current) => (current.includes(group.name) ? current : [...current, group.name]));
            setCustomerGroup(group.name);
            setErrors((current) => ({ ...current, customerGroup: "" }));
            onOpenNested(null);
          }}
        />
      ) : null}
      {nestedModal === "source" ? (
        <AddSourceModal
          onClose={() => onOpenNested(null)}
          onSave={(source) => {
            setSourceOptions((current) => (current.includes(source.name) ? current : [...current, source.name]));
            setCustomerSource(source.name);
            setErrors((current) => ({ ...current, customerSource: "" }));
            onOpenNested(null);
          }}
        />
      ) : null}
      {nestedModal === "companion" ? (
        <AddCompanionModal
          onClose={() => onOpenNested(null)}
          onSave={(companion) => {
            setCompanions((current) => [...current, companion]);
            onOpenNested(null);
          }}
        />
      ) : null}
    </div>
  );
}

function AddGroupModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave?: (group: { code: string; name: string; description: string }) => void;
}) {
  const [code, setCode] = useState("NG001");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");
  const submit = () => {
    if (!name.trim()) {
      setNameError("Nhập tên nhóm khách hàng.");
      return;
    }
    onSave?.({ code, name: name.trim(), description });
    onClose();
  };
  return (
    <div className={styles.nestedOverlay}>
      <section className={styles.smallModal}>
        <header>
          <h2>Thêm nhóm khách hàng</h2>
          <button onClick={onClose} type="button"><X size={20} /></button>
        </header>
        <div className={styles.smallModalBody}>
          <label>
            <span>Mã nhóm <b>*</b></span>
            <div className={styles.inputWrap}>
              <input readOnly value={code} />
              <button onClick={() => setCode(`NG${String(Date.now()).slice(-3)}`)} type="button">Tự động</button>
            </div>
          </label>
          <label>
            <span>Tên nhóm <b>*</b></span>
            <div className={`${styles.inputWrap} ${nameError ? styles.inputWrapError : ""}`}>
              <input onChange={(e) => { setName(e.target.value); setNameError(""); }} placeholder="VD: VIP, Premium, Doanh nghiệp" value={name} />
            </div>
            {nameError ? <small className={styles.fieldErrorText}>{nameError}</small> : null}
          </label>
          <label>
            <span>Mô tả</span>
            <div className={styles.inputWrap}>
              <input onChange={(e) => setDescription(e.target.value)} placeholder="Nhập mô tả ngắn (tùy chọn)" value={description} />
            </div>
          </label>
        </div>
        <footer>
          <button onClick={onClose} type="button">Hủy bỏ</button>
          <button className={styles.blueButton} onClick={submit} type="button">Thêm</button>
        </footer>
      </section>
    </div>
  );
}

function AddSourceModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave?: (source: { code: string; name: string; description: string }) => void;
}) {
  const [code, setCode] = useState("NS001");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");
  const submit = () => {
    if (!name.trim()) {
      setNameError("Nhập tên nguồn khách hàng.");
      return;
    }
    onSave?.({ code, name: name.trim(), description });
    onClose();
  };
  return (
    <div className={styles.nestedOverlay}>
      <section className={styles.smallModal}>
        <header>
          <h2>Thêm nguồn khách hàng</h2>
          <button onClick={onClose} type="button"><X size={20} /></button>
        </header>
        <div className={styles.smallModalBody}>
          <label>
            <span>Mã nguồn <b>*</b></span>
            <div className={styles.inputWrap}>
              <input readOnly value={code} />
              <button onClick={() => setCode(`NS${String(Date.now()).slice(-3)}`)} type="button">Tự động</button>
            </div>
          </label>
          <label>
            <span>Tên nguồn <b>*</b></span>
            <div className={`${styles.inputWrap} ${nameError ? styles.inputWrapError : ""}`}>
              <input onChange={(e) => { setName(e.target.value); setNameError(""); }} placeholder="VD: Facebook Ads, Google Ads, Walk-in" value={name} />
            </div>
            {nameError ? <small className={styles.fieldErrorText}>{nameError}</small> : null}
          </label>
          <label>
            <span>Mô tả</span>
            <div className={styles.inputWrap}>
              <input onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả chiến dịch / chi tiết nguồn" value={description} />
            </div>
          </label>
        </div>
        <footer>
          <button onClick={onClose} type="button">Hủy bỏ</button>
          <button className={styles.blueButton} onClick={submit} type="button">Thêm</button>
        </footer>
      </section>
    </div>
  );
}

function AddCompanionModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave?: (companion: { name: string; relation: string; phone?: string }) => void;
}) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("Nam");
  const [relation, setRelation] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };
  const submit = () => {
    if (!name.trim()) {
      setError("Nhập họ tên người đi cùng.");
      return;
    }
    onSave?.({ name: name.trim(), relation: relation || "Người thân", phone });
    onClose();
  };
  return (
    <div className={styles.nestedOverlay}>
      <section className={styles.companionModal}>
        <header>
          <h2>Thêm người đi cùng</h2>
          <button onClick={onClose} type="button"><X size={20} /></button>
        </header>
        <div className={styles.companionBody}>
          <div>
            <label>Ảnh <b>*</b></label>
            <label className={styles.uploadBox}>
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="Ảnh người đi cùng" src={preview} />
              ) : <><UploadCloud size={42} /><span>Tải ảnh lên</span></>}
              <input accept="image/*" className={styles.hiddenFileInput} onChange={handleFile} type="file" />
            </label>
            <button className={styles.greenButton} onClick={() => setPreview("")} type="button">Webcam</button>
          </div>
          <div className={styles.companionFields}>
            <label>
              <span>Họ và tên <b>*</b></span>
              <div className={`${styles.inputWrap} ${error ? styles.inputWrapError : ""}`}>
                <input onChange={(e) => { setName(e.target.value); setError(""); }} placeholder="Họ tên người đi cùng" value={name} />
              </div>
              {error ? <small className={styles.fieldErrorText}>{error}</small> : null}
            </label>
            <div className={styles.radioRow}>
              {["Nam", "Nữ"].map((option) => (
                <button className={gender === option ? styles.radioPillActive : styles.radioPill} key={option} onClick={() => setGender(option)} type="button">
                  {option}
                </button>
              ))}
            </div>
            <SelectField label="Nhóm quan hệ" onChange={setRelation} options={["Người thân", "Vợ/Chồng", "Con", "Bạn tập", "Đối tác"]} value={relation || "Người thân"} />
            <FormField label="Ghi chú" placeholder="Ghi chú" />
          </div>
          <FormField label="Ngày sinh" />
          <div className={styles.formGrid}>
            <FormField label="Chiều cao (m)" value="1.70" />
            <FormField label="Cân nặng (kg)" value="65" />
            <label>
              <span>SĐT liên hệ</span>
              <div className={styles.inputWrap}>
                <input inputMode="tel" onChange={(e) => setPhone(e.target.value)} placeholder="Số điện thoại" value={phone} />
              </div>
            </label>
          </div>
        </div>
        <footer>
          <button onClick={onClose} type="button">Hủy bỏ</button>
          <button className={styles.greenButton} onClick={submit} type="button">
            <Plus size={16} />Thêm người đi cùng
          </button>
        </footer>
      </section>
    </div>
  );
}

function CustomerDetailModal({
  activeTab,
  autoAddTrainingResult = false,
  customer,
  extraProfile,
  extraTas,
  extraTrainingResults,
  onTrainingResultsChange,
  onChangeTab,
  onClose,
  onEdit,
}: {
  activeTab: string;
  autoAddTrainingResult?: boolean;
  customer: Customer | null;
  extraProfile?: Profile | null;
  extraTas?: TaEntry[];
  extraTrainingResults?: TrainingResultEntry[];
  onTrainingResultsChange?: (results: TrainingResultEntry[]) => void;
  onChangeTab: (tab: string) => void;
  onClose: () => void;
  onEdit: () => void;
}) {
  const tabs = ["Thông tin cơ bản", "Hợp đồng", "Lịch sử giao dịch", "Lịch sử checkin", "Kết quả tập luyện", "Inbody", "Meal Plan", "Trợ giảng TA", "Profile"];
  const displayName = customer?.name ?? "Nguyễn Văn A";
  const displayCode = customer?.code ?? "HV001";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className={styles.modalOverlay}>
      <section className={styles.detailModal}>
        <header className={styles.detailHeader}>
          <div className={styles.detailIdentity}>
            <span>{initial}</span>
            <div>
              <h2>{displayName}</h2>
              <p>Mã hội viên: {displayCode}</p>
            </div>
          </div>
          <div>
            <button className={styles.blueButton} onClick={onEdit} type="button">
              <Edit size={17} />Chỉnh sửa
            </button>
            <button onClick={onClose} type="button"><X size={22} /></button>
          </div>
        </header>

        <nav className={styles.detailTabs}>
          {tabs.map((tab) => (
            <button
              className={activeTab === tab ? styles.activeDetailTab : undefined}
              key={tab}
              onClick={() => onChangeTab(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className={styles.detailBody} key={activeTab}>
          <CustomerDetailTab
            activeTab={activeTab}
            autoAddTrainingResult={autoAddTrainingResult}
            customer={customer}
            extraProfile={extraProfile}
            extraTas={extraTas}
            extraTrainingResults={extraTrainingResults}
            onTrainingResultsChange={onTrainingResultsChange}
          />
        </div>

        <footer className={styles.modalFooter}>
          <button onClick={onClose} type="button">Đóng</button>
        </footer>
      </section>
    </div>
  );
}

function CustomerDetailTab({
  activeTab,
  autoAddTrainingResult,
  customer,
  extraProfile,
  extraTas,
  extraTrainingResults,
  onTrainingResultsChange,
}: {
  activeTab: string;
  autoAddTrainingResult?: boolean;
  customer: Customer | null;
  extraProfile?: Profile | null;
  extraTas?: TaEntry[];
  extraTrainingResults?: TrainingResultEntry[];
  onTrainingResultsChange?: (results: TrainingResultEntry[]) => void;
}) {
  if (activeTab === "Hợp đồng") {
    return <ContractsTab />;
  }

  if (activeTab === "Lịch sử giao dịch") {
    return <TransactionsTab />;
  }

  if (activeTab === "Lịch sử checkin") {
    return <CheckinHistoryTab />;
  }

  if (activeTab === "Kết quả tập luyện") {
    return <TrainingResultsTab assignedTas={extraTas} autoAdd={autoAddTrainingResult} extraResults={extraTrainingResults} onResultsChange={onTrainingResultsChange} />;
  }

  if (activeTab === "Inbody") {
    return <InbodyTab />;
  }

  if (activeTab === "Meal Plan") {
    return <MealPlanTab />;
  }

  if (activeTab === "Trợ giảng TA") {
    return <TaTab initialTas={extraTas} />;
  }

  if (activeTab === "Profile") {
    return <ProfilesTab initialProfile={extraProfile} />;
  }

  return <BasicInfoTab customer={customer} />;
}

function TrainingResultsTab({
  assignedTas = [],
  autoAdd = false,
  extraResults,
  onResultsChange,
}: {
  assignedTas?: TaEntry[];
  autoAdd?: boolean;
  extraResults?: TrainingResultEntry[];
  onResultsChange?: (results: TrainingResultEntry[]) => void;
}) {
  const [addOpen, setAddOpen] = useState(autoAdd);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [removeIndex, setRemoveIndex] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [sessions, setSessions] = useState<TrainingResultEntry[]>(extraResults ?? []);
  const updateSessions = (updater: (current: TrainingResultEntry[]) => TrainingResultEntry[]) => {
    setSessions((current) => {
      const next = updater(current);
      onResultsChange?.(next);
      return next;
    });
  };

  const handleSave = (entry: typeof sessions[number]) => {
    updateSessions((current) => [entry, ...current]);
    setAddOpen(false);
  };
  const handleUpdate = (entry: TrainingResultEntry) => {
    if (editIndex === null) return;
    updateSessions((current) => current.map((session, index) => (index === editIndex ? entry : session)));
    setEditIndex(null);
  };
  const handleRemove = () => {
    if (removeIndex === null) return;
    updateSessions((current) => current.filter((_, index) => index !== removeIndex));
    setRemoveIndex(null);
  };

  return (
    <>
      <section className={styles.detailCard}>
        <div className={styles.tabSectionHeader}>
          <h3>Kết quả tập luyện</h3>
          <button className={styles.blueButton} onClick={() => setAddOpen(true)} type="button">
            <Plus size={16} />Thêm kết quả
          </button>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.upperTable}>
            <thead>
              <tr>
                <th>Tên KH</th>
                <th>Gói tập</th>
                <th>Ngày kiểm tra</th>
                <th>HLV</th>
                <th>Trợ giảng</th>
                <th>Buổi học thứ</th>
                <th>Nội dung buổi học</th>
                <th>Drill/Bài tập về nhà</th>
                <th>Ghi chú khác</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr key={`${s.name}-${i}`}>
                  <td>
                    <div className={styles.taName}>
                      <span>{s.name.split(" ").map((p) => p[0]).slice(-2).join("")}</span>
                      <strong>{s.name}</strong>
                    </div>
                  </td>
                  <td>
                    <div className={styles.pkgBadges}>
                      <span className={styles.pkgPrimary}>{s.pkg}</span>
                      <span className={styles.pkgSecondary}>{s.tier}</span>
                    </div>
                  </td>
                  <td>{s.date}</td>
                  <td>{s.coach}</td>
                  <td>
                    <div className={styles.trainingTaStack}>
                      {s.ta.split(",").map((ta) => ta.trim()).filter(Boolean).map((ta) => (
                        <span key={ta}>{ta}</span>
                      ))}
                    </div>
                  </td>
                  <td><strong>{s.session}</strong></td>
                  <td>
                    <strong>{s.content}</strong>
                    <div className={styles.cellMuted}>{s.contentSub}</div>
                  </td>
                  <td>
                    <strong>{s.drill}</strong>
                    <div className={styles.cellMuted}>{s.drillSub}</div>
                  </td>
                  <td className={styles.cellTruncate}>{s.note}</td>
                  <td>
                    <div className={styles.rowActions}>
                      <button aria-label={`Sửa kết quả ${s.session}`} onClick={() => setEditIndex(i)} type="button">
                        <Edit size={14} />
                      </button>
                      <button aria-label={`Xóa kết quả ${s.session}`} className={styles.dangerIconBtn} onClick={() => setRemoveIndex(i)} type="button">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 ? (
                <tr>
                  <td className={styles.emptyTableCell} colSpan={10}>Chưa có kết quả tập luyện nào cho học viên này.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className={styles.miniPagination}>
          <span>Hiển thị {sessions.length}</span>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} type="button"><ChevronLeft size={14} /></button>
          <button className={styles.greenPageActive} type="button">{page}</button>
          <button onClick={() => setPage((p) => p + 1)} type="button"><ChevronRight size={14} /></button>
        </div>
      </section>
      {addOpen ? <AddTrainingResultModal assignedTas={assignedTas} onClose={() => setAddOpen(false)} onSave={handleSave} /> : null}
      {editIndex !== null ? (
        <AddTrainingResultModal
          assignedTas={assignedTas}
          initial={sessions[editIndex]}
          onClose={() => setEditIndex(null)}
          onSave={handleUpdate}
          title="Sửa kết quả tập luyện"
        />
      ) : null}
      {removeIndex !== null ? (
        <CustomerConfirmDialog
          title="Xóa kết quả tập luyện"
          message={`Xóa kết quả ${sessions[removeIndex]?.session ?? "tập luyện"} khỏi hồ sơ học viên?`}
          confirmLabel="Xóa kết quả"
          tone="danger"
          onCancel={() => setRemoveIndex(null)}
          onConfirm={handleRemove}
        />
      ) : null}
    </>
  );
}

function AddTrainingResultModal({
  assignedTas = [],
  initial,
  onClose,
  onSave,
  title = "Thêm kết quả tập luyện",
}: {
  assignedTas?: TaEntry[];
  initial?: Partial<TrainingResultEntry>;
  onClose: () => void;
  onSave: (entry: TrainingResultEntry) => void;
  title?: string;
}) {
  const initialTaNames = Array.from(new Set(
    (initial?.ta ? initial.ta.split(",").map((name) => name.trim()).filter(Boolean) : assignedTas.map((ta) => ta.name))
  ));
  const taChoices = assignedTas.length
    ? assignedTas
    : initialTaNames.map((name, index) => ({ code: `TA-${index + 1}`, email: "", name, phone: "" }));
  const [form, setForm] = useState({
    name: initial?.name ?? "Nguyễn Văn Minh",
    pkg: initial?.pkg ? `${initial.pkg} ${initial.tier ?? ""}`.trim() : "",
    date: initial?.date ? ddmmyyyyToISO(initial.date) || initial.date : "2026-05-05",
    session: initial?.session ?? "Buổi 1",
    coach: initial?.coach ?? "",
    ta: initialTaNames.join(", "),
    content: initial?.content ?? "",
    contentSub: initial?.contentSub ?? "",
    drill: initial?.drill === "—" ? "" : initial?.drill ?? "",
    drillSub: initial?.drillSub ?? "",
    note: initial?.note === "—" ? "" : initial?.note ?? "",
  });
  const [selectedTaNames, setSelectedTaNames] = useState<string[]>(initialTaNames);
  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const setSelectedTas = (names: string[]) => {
    const uniqueNames = Array.from(new Set(names));
    setSelectedTaNames(uniqueNames);
    update("ta", uniqueNames.join(", "));
  };

  const toggleTa = (name: string) => {
    setSelectedTas(selectedTaNames.includes(name)
      ? selectedTaNames.filter((selected) => selected !== name)
      : [...selectedTaNames, name]);
  };

  const submit = () => {
    if (!form.pkg || !form.coach || !form.content.trim()) return;
    onSave({
      name: form.name,
      pkg: form.pkg.split(" ")[0] || "Eagle",
      tier: form.pkg.split(" ").slice(1).join(" ") || "Premium",
      date: form.date.split("-").reverse().join("/"),
      coach: form.coach,
      ta: selectedTaNames.join(", ") || form.ta || "—",
      session: form.session,
      content: form.content,
      contentSub: form.contentSub,
      drill: form.drill || "—",
      drillSub: form.drillSub,
      note: form.note || "—",
    });
  };

  return (
    <div className={styles.nestedOverlay}>
      <section className={styles.miniModal}>
        <header className={styles.miniHeader}>
          <h2>{title}</h2>
          <button onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <div className={styles.miniBody}>
          <div className={`${styles.miniGrid} ${styles.trainingResultGrid}`}>
            <label>
              <span>Tên KH</span>
              <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Nguyễn Văn Minh" />
            </label>
            <label>
              <span>Nội dung buổi học <b>*</b></span>
              <input
                onChange={(e) => update("content", e.target.value)}
                placeholder="VD: Short Game"
                value={form.content}
              />
              <textarea
                onChange={(e) => update("contentSub", e.target.value)}
                placeholder="Chipping quanh green, kiểm soát landing zone..."
                rows={2}
                value={form.contentSub}
              />
            </label>
            <label>
              <span>Gói tập <b>*</b></span>
              <select className={styles.selectInput} value={form.pkg} onChange={(e) => update("pkg", e.target.value)}>
                <option value="">Chọn gói tập</option>
                <option>Eagle Premium</option>
                <option>Birdie Standard</option>
                <option>Par Basic</option>
              </select>
            </label>
            <label>
              <span>Drill/BTVN</span>
              <input
                onChange={(e) => update("drill", e.target.value)}
                placeholder="VD: Landing zone drill"
                value={form.drill}
              />
              <textarea
                onChange={(e) => update("drillSub", e.target.value)}
                placeholder="Tập 30 bóng ở 3 khoảng cách, ghi lại tỉ lệ bóng vào vùng mục tiêu..."
                rows={2}
                value={form.drillSub}
              />
            </label>
            <label>
              <span>Ngày kiểm tra <b>*</b></span>
              <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} />
            </label>
            <label>
              <span>Buổi học</span>
              <input value={form.session} onChange={(e) => update("session", e.target.value)} />
            </label>
            <label>
              <span>HLV <b>*</b></span>
              <select className={styles.selectInput} value={form.coach} onChange={(e) => update("coach", e.target.value)}>
                <option value="">Chọn HLV</option>
                <option>Trần Quốc Toàn</option>
                <option>Lê Minh</option>
                <option>Nguyễn Văn Hải</option>
              </select>
            </label>
            <label>
              <span>Ghi chú khác</span>
              <textarea
                onChange={(e) => update("note", e.target.value)}
                placeholder="Nhập ghi chú thêm..."
                rows={3}
                value={form.note}
              />
            </label>
            <label>
              <span>Trợ giảng (TA)</span>
              {assignedTas.length > 1 ? <small className={styles.fieldHelper}>Có {assignedTas.length} TA được gán, chọn TA phụ trách buổi tập.</small> : null}
              <div className={styles.taMultiSelect}>
                {taChoices.length ? (
                  <div className={styles.taCheckboxGrid}>
                    {taChoices.map((ta) => (
                      <label key={ta.code}>
                        <input
                          checked={selectedTaNames.includes(ta.name)}
                          onChange={() => toggleTa(ta.name)}
                          type="checkbox"
                        />
                        <span>{ta.name}</span>
                      </label>
                    ))}
                  </div>
                ) : <span className={styles.taEmptyHint}>Học viên chưa được gán TA.</span>}
                <div className={styles.taSelectedChips}>
                  {selectedTaNames.map((name) => (
                    <button key={name} onClick={() => toggleTa(name)} type="button">
                      {name}<X size={12} />
                    </button>
                  ))}
                  {selectedTaNames.length === 0 ? <span>Chưa chọn TA</span> : null}
                </div>
              </div>
            </label>
          </div>
        </div>
        <footer className={styles.miniFooter}>
          <button onClick={onClose} type="button">Hủy</button>
          <button className={styles.blueButton} onClick={submit} type="button">Lưu</button>
        </footer>
      </section>
    </div>
  );
}

type Measurement = {
  date: string;
  club: string;
  carry: number;
  total: number;
  angle: number;
  height: number;
  clubPath: number;
  swingDir: number;
  faceAngle: number;
  spin: number;
};

function InbodyTab() {
  const [addOpen, setAddOpen] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const [trackmanPreview, setTrackmanPreview] = useState<Measurement | null>(null);
  const [page, setPage] = useState(1);
  const [measurements, setMeasurements] = useState<Measurement[]>([
    { date: "12/10/2023", club: "Driver", carry: 250, total: 275, angle: -1.2, height: 95, clubPath: 2.5, swingDir: 1.8, faceAngle: -0.5, spin: 2450 },
    { date: "12/10/2023", club: "7 Iron", carry: 165, total: 172, angle: -4.5, height: 110, clubPath: 0.5, swingDir: -0.2, faceAngle: 1.1, spin: 6800 },
    { date: "11/10/2023", club: "Driver", carry: 242, total: 268, angle: 0.8, height: 102, clubPath: -1.5, swingDir: 0.5, faceAngle: -1.2, spin: 2100 },
  ]);

  const formatSigned = (n: number, decimals = 1) => (n >= 0 ? `+${n.toFixed(decimals)}` : n.toFixed(decimals));
  const handleSave = (entry: Measurement) => {
    setMeasurements((curr) => [entry, ...curr]);
    setAddOpen(false);
  };

  return (
    <>
      <section className={styles.detailCard}>
        <div className={styles.tabSectionHeader}>
          <h3>Inbody</h3>
          <button className={styles.blueButton} onClick={() => setAddOpen(true)} type="button">
            <Plus size={16} />Thêm kết quả
          </button>
        </div>
        <article className={styles.greenCard}>
          <header className={styles.greenCardHeader}>
            <h4>Danh sách Golf Measurements</h4>
            <div className={styles.greenCardActions}>
              <button className={styles.outlineButton} onClick={() => setChartOpen(true)} type="button">
                Xem biểu đồ
              </button>
              <button className={styles.greenButton} onClick={() => setAddOpen(true)} type="button">
                <Plus size={14} />Thêm mới
              </button>
            </div>
          </header>
          <div className={styles.tableWrap}>
            <table className={styles.upperTable}>
              <thead>
                <tr>
                  <th>Ngày đo</th>
                  <th>Gậy đo</th>
                  <th>Carry (yds)</th>
                  <th>Total (yds)</th>
                  <th>Angle Attack (°)</th>
                  <th>Height (ft)</th>
                  <th>Club Path (°)</th>
                  <th>Swing Dir. (°)</th>
                  <th>Face Angle (°)</th>
                  <th>Spin Rate</th>
                  <th>Ảnh Trackman</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((m, i) => (
                  <tr key={`${m.date}-${m.club}-${i}`}>
                    <td>{m.date}</td>
                    <td>{m.club}</td>
                    <td>{m.carry}</td>
                    <td>{m.total}</td>
                    <td>{formatSigned(m.angle)}</td>
                    <td>{m.height}</td>
                    <td>{formatSigned(m.clubPath)}</td>
                    <td>{formatSigned(m.swingDir)}</td>
                    <td>{formatSigned(m.faceAngle)}</td>
                    <td>{m.spin.toLocaleString()}</td>
                    <td>
                      <button className={styles.linkButton} onClick={() => setTrackmanPreview(m)} type="button">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.miniPagination}>
            <span>Hiển thị 1 - {measurements.length} của {measurements.length} mục</span>
            <button onClick={() => setPage(1)} type="button" aria-label="Trang đầu"><ChevronLeft size={14} /><ChevronLeft size={14} /></button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} type="button"><ChevronLeft size={14} /></button>
            <button className={styles.greenPageActive} type="button">{page}</button>
            <button onClick={() => setPage((p) => p + 1)} type="button"><ChevronRight size={14} /></button>
            <button onClick={() => setPage(1)} type="button" aria-label="Trang cuối"><ChevronRight size={14} /><ChevronRight size={14} /></button>
          </div>
        </article>
      </section>
      {chartOpen ? <GolfMeasurementChartModal measurements={measurements} onClose={() => setChartOpen(false)} /> : null}
      {trackmanPreview ? <TrackmanPreviewModal measurement={trackmanPreview} onClose={() => setTrackmanPreview(null)} /> : null}
      {addOpen ? <AddGolfMeasurementModal onClose={() => setAddOpen(false)} onSave={handleSave} /> : null}
    </>
  );
}

function AddGolfMeasurementModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (entry: Measurement) => void;
}) {
  const [trackmanUploadOpen, setTrackmanUploadOpen] = useState(false);
  const [form, setForm] = useState({
    date: "2026-05-05",
    club: "",
    carry: "",
    total: "",
    angle: "",
    height: "",
    clubPath: "",
    swingDir: "",
    faceAngle: "",
    spin: "",
  });
  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = () => {
    if (!form.club || !form.carry) return;
    onSave({
      date: form.date.split("-").reverse().join("/"),
      club: form.club,
      carry: Number(form.carry) || 0,
      total: Number(form.total) || 0,
      angle: Number(form.angle) || 0,
      height: Number(form.height) || 0,
      clubPath: Number(form.clubPath) || 0,
      swingDir: Number(form.swingDir) || 0,
      faceAngle: Number(form.faceAngle) || 0,
      spin: Number(form.spin) || 0,
    });
  };

  return (
    <div className={styles.nestedOverlay}>
      <section className={styles.measureModal}>
        <header className={styles.measureHeader}>
          <h2>THÊM GOLF MEASUREMENT</h2>
          <button onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <div className={styles.measureBody}>
          <h3 className={styles.measureSection}>4. THEO DÕI CÁC CHỈ SỐ ĐO ĐẠC TRỌNG YẾU</h3>
          <div className={styles.measureGrid}>
            <label>
              <span>NGÀY ĐO <b>*</b></span>
              <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} />
            </label>
            <label>
              <span>GẬY ĐO <b>*</b></span>
              <select className={styles.selectInput} value={form.club} onChange={(e) => update("club", e.target.value)}>
                <option value="">Chọn gậy</option>
                <option>Driver</option>
                <option>3 Wood</option>
                <option>5 Iron</option>
                <option>7 Iron</option>
                <option>9 Iron</option>
                <option>PW</option>
              </select>
            </label>
            <label>
              <span>CARRY (YARDS) <b>*</b></span>
              <input inputMode="decimal" placeholder="0.0" value={form.carry} onChange={(e) => update("carry", e.target.value)} />
            </label>
            <label>
              <span>TOTAL (YARDS) <b>*</b></span>
              <input inputMode="decimal" placeholder="0.0" value={form.total} onChange={(e) => update("total", e.target.value)} />
            </label>
          </div>
          <h4 className={styles.measureSubsection}>CHỈ SỐ KHÁC</h4>
          <div className={styles.measureGrid}>
            <label>
              <span>ANGLE ATTACK (°) <b>*</b></span>
              <input inputMode="decimal" placeholder="0.0" value={form.angle} onChange={(e) => update("angle", e.target.value)} />
            </label>
            <label>
              <span>HEIGHT (FT) <b>*</b></span>
              <input inputMode="decimal" placeholder="0.0" value={form.height} onChange={(e) => update("height", e.target.value)} />
            </label>
            <label>
              <span>CLUB PATH (°) <b>*</b></span>
              <input inputMode="decimal" placeholder="0.0" value={form.clubPath} onChange={(e) => update("clubPath", e.target.value)} />
            </label>
            <label>
              <span>SWING DIRECTION (°) <b>*</b></span>
              <input inputMode="decimal" placeholder="0.0" value={form.swingDir} onChange={(e) => update("swingDir", e.target.value)} />
            </label>
            <label>
              <span>FACE ANGLE (°) <b>*</b></span>
              <input inputMode="decimal" placeholder="0.0" value={form.faceAngle} onChange={(e) => update("faceAngle", e.target.value)} />
            </label>
            <label>
              <span>SPIN RATE (°) <b>*</b></span>
              <input inputMode="decimal" placeholder="0" value={form.spin} onChange={(e) => update("spin", e.target.value)} />
            </label>
          </div>
          <button className={styles.outlineButton} onClick={() => setTrackmanUploadOpen(true)} type="button">
            <UploadCloud size={16} /> Chọn ảnh Trackman
          </button>
        </div>
        <footer className={styles.measureFooter}>
          <button onClick={onClose} type="button"><X size={14} /> Đóng</button>
          <button className={styles.greenButton} onClick={submit} type="button">
            Lưu dữ liệu
          </button>
        </footer>
        {trackmanUploadOpen ? <TrackmanUploadModal onClose={() => setTrackmanUploadOpen(false)} /> : null}
      </section>
    </div>
  );
}

type TaEntry = {
  code: string;
  name: string;
  phone: string;
  email: string;
  course: string;
  schedule: string;
  note: string;
};

const TA_DIRECTORY: Array<{ code: string; name: string; phone: string; email: string }> = [
  { code: "NV-0012", name: "Nguyễn Văn An", phone: "0901234567", email: "an.nguyen@example.com" },
  { code: "NV-0034", name: "Trần Thị Bình", phone: "0912345678", email: "binh.tran@example.com" },
  { code: "NV-0056", name: "Lê Minh Anh", phone: "0923456712", email: "leminhanh@example.com" },
  { code: "NV-0072", name: "Phạm Hoàng Nam", phone: "0901224578", email: "phnam@example.com" },
];

const COURSE_OPTIONS = [
  "Lập trình Web căn bản",
  "Golf Swing 3 tháng",
  "Short Game Premium",
  "Driving Range Foundation",
];

function TaTab({ initialTas }: { initialTas?: TaEntry[] }) {
  const [tas, setTas] = useState<TaEntry[]>(initialTas ?? [
    { code: "NV-0012", name: "Nguyễn Văn An", phone: "0901234567", email: "an.nguyen@example.com", course: "", schedule: "T2-T4-T6 · 07:00-09:00", note: "Nhiệt tình, có kinh nghiệm hỗ trợ học viên" },
    { code: "NV-0034", name: "Trần Thị Bình", phone: "0912345678", email: "binh.tran@example.com", course: "", schedule: "T3-T5-T7 · 14:00-16:00", note: "Chuyên môn React, hỗ trợ tốt các dự án thực tế" },
  ]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [removeIndex, setRemoveIndex] = useState<number | null>(null);

  const addTa = (entry: TaEntry) => {
    setTas((current) => [...current, entry]);
    setAssignOpen(false);
  };
  const updateTa = (index: number, patch: Partial<TaEntry>) => {
    setTas((current) => current.map((t, i) => (i === index ? { ...t, ...patch } : t)));
    setEditIndex(null);
  };
  const removeTa = (index: number) => {
    setRemoveIndex(index);
  };
  const confirmRemoveTa = () => {
    if (removeIndex === null) return;
    setTas((current) => current.filter((_, i) => i !== removeIndex));
    setRemoveIndex(null);
  };

  return (
    <section className={styles.detailCard}>
      <div className={styles.tabSectionHeader}>
        <span className={styles.darkBadge}>{tas.length} TA đang phụ trách</span>
        <button className={styles.darkButton} onClick={() => setAssignOpen(true)} type="button">
          <Plus size={14} />Gán TA mới
        </button>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.softTable}>
          <thead>
            <tr>
              <th>Tên TA</th>
              <th>Mã nhân viên</th>
              <th>Thông tin liên hệ</th>
              <th>Gói dịch vụ phụ trách</th>
              <th>Lịch làm việc</th>
              <th>Ghi chú / Đánh giá</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {tas.map((t, i) => (
              <tr key={`${t.code}-${i}`}>
                <td><strong>{t.name}</strong></td>
                <td className={styles.cellMuted}>{t.code}</td>
                <td>
                  <div className={styles.contactCell}>
                    <span><Phone size={12} /> {t.phone}</span>
                    <span><Mail size={12} /> {t.email}</span>
                  </div>
                </td>
                <td>
                  {t.course ? (
                    <span className={styles.coursePill}>{t.course}</span>
                  ) : (
                    <span className={styles.emptyPill} aria-hidden="true" />
                  )}
                </td>
                <td>{t.schedule}</td>
                <td className={styles.cellTruncate}>{t.note}</td>
                <td className={styles.rowActions}>
                  <button onClick={() => setEditIndex(i)} type="button" aria-label={`Sửa ${t.name}`}>
                    <Edit size={14} />
                  </button>
                  <button onClick={() => removeTa(i)} type="button" aria-label={`Gỡ ${t.name}`} className={styles.dangerIconBtn}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {tas.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyTableCell}>Chưa có TA nào được gán cho khách hàng.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {assignOpen ? <AssignTaModal onClose={() => setAssignOpen(false)} onSave={addTa} /> : null}
      {editIndex !== null ? (
        <EditTaModal
          ta={tas[editIndex]}
          onClose={() => setEditIndex(null)}
          onSave={(patch) => updateTa(editIndex, patch)}
        />
      ) : null}
      {removeIndex !== null ? (
        <CustomerConfirmDialog
          title="Gỡ trợ giảng khỏi khách hàng"
          message={`Gỡ ${tas[removeIndex]?.name ?? "trợ giảng"} khỏi hồ sơ khách hàng? Thao tác này chỉ xóa quan hệ phụ trách, không xóa hồ sơ nhân viên.`}
          confirmLabel="Gỡ trợ giảng"
          tone="danger"
          onCancel={() => setRemoveIndex(null)}
          onConfirm={confirmRemoveTa}
        />
      ) : null}
    </section>
  );
}

function AssignTaModal({ onClose, onSave }: { onClose: () => void; onSave: (entry: TaEntry) => void }) {
  const [taQuery, setTaQuery] = useState("");
  const [selectedTa, setSelectedTa] = useState<typeof TA_DIRECTORY[number] | null>(null);
  const [course, setCourse] = useState("");
  const [schedule, setSchedule] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState("");

  const suggestions = taQuery.trim()
    ? TA_DIRECTORY.filter(
        (t) =>
          t.name.toLowerCase().includes(taQuery.toLowerCase()) ||
          t.code.toLowerCase().includes(taQuery.toLowerCase())
      )
    : TA_DIRECTORY;

  const pick = (ta: typeof TA_DIRECTORY[number]) => {
    setSelectedTa(ta);
    setTaQuery(`${ta.name} (${ta.code})`);
    setPhone(ta.phone);
    setEmail(ta.email);
    setShowSuggestions(false);
    setError("");
  };

  const submit = () => {
    if (!selectedTa) {
      setError("Vui lòng chọn trợ giảng từ danh sách nhân viên.");
      return;
    }
    if (!course) {
      setError("Vui lòng chọn gói dịch vụ hoặc lớp phụ trách.");
      return;
    }
    onSave({
      code: selectedTa.code,
      name: selectedTa.name,
      phone: phone || selectedTa.phone,
      email: email || selectedTa.email,
      course,
      schedule: schedule || "—",
      note,
    });
  };

  return (
    <div className={styles.nestedOverlay}>
      <section className={styles.taModal}>
        <header className={styles.taModalHeader}>
          <div>
            <h2>Gán Trợ giảng cho khách hàng</h2>
            <p>Chọn trợ giảng và khoá học để gán cho khách hàng này</p>
          </div>
          <button onClick={onClose} type="button"><X size={18} /></button>
        </header>
        {error ? <div className={styles.formError}><AlertTriangle size={14} /> {error}</div> : null}
        <div className={styles.taModalBody}>
          <label className={styles.taField}>
            <span>Chọn TA <b>*</b></span>
            <div className={styles.autocompleteWrap}>
              <input
                onChange={(e) => {
                  setTaQuery(e.target.value);
                  setSelectedTa(null);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Tìm theo tên / mã nhân viên"
                value={taQuery}
              />
              {showSuggestions && suggestions.length > 0 ? (
                <ul className={styles.autocompleteList}>
                  {suggestions.map((s) => (
                    <li key={s.code}>
                      <button onMouseDown={(e) => { e.preventDefault(); pick(s); }} type="button">
                        <strong>{s.name}</strong> <span>{s.code}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </label>
          <label className={styles.taField}>
            <span>Khoá học phụ trách <b>*</b></span>
            <select className={styles.selectInput} value={course} onChange={(e) => setCourse(e.target.value)}>
              <option value="">Chọn khoá học</option>
              {COURSE_OPTIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className={styles.taField}>
            <span>Lịch làm việc</span>
            <input
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="VD: T2-T4-T6 · 07:00-09:00"
              value={schedule}
            />
          </label>
          <div className={styles.taField}>
            <span>Thông tin liên hệ</span>
            <input
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Số điện thoại"
              value={phone}
            />
            <input
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              value={email}
            />
          </div>
          <label className={styles.taField}>
            <span>Ghi chú / Đánh giá</span>
            <textarea
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú về TA hoặc đánh giá hiệu quả hỗ trợ"
              rows={3}
              value={note}
            />
          </label>
        </div>
        <footer className={styles.taModalFooter}>
          <button onClick={onClose} type="button">Hủy</button>
          <button className={styles.darkButton} onClick={submit} type="button">Lưu</button>
        </footer>
      </section>
    </div>
  );
}

function EditTaModal({
  ta,
  onClose,
  onSave,
}: {
  ta: TaEntry;
  onClose: () => void;
  onSave: (patch: Partial<TaEntry>) => void;
}) {
  const [course, setCourse] = useState(ta.course || COURSE_OPTIONS[0]);
  const [schedule, setSchedule] = useState(ta.schedule);
  const [phone, setPhone] = useState(ta.phone);
  const [email, setEmail] = useState(ta.email);
  const [note, setNote] = useState(ta.note);

  const submit = () => {
    onSave({ course, schedule, phone, email, note });
  };

  return (
    <div className={styles.nestedOverlay}>
      <section className={styles.taModal}>
        <header className={styles.taModalHeader}>
          <div>
            <h2>Chỉnh sửa thông tin TA</h2>
            <p>Cập nhật thông tin trợ giảng cho khách hàng</p>
          </div>
          <button onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <div className={styles.taModalBody}>
          <label className={styles.taField}>
            <span>Chọn TA</span>
            <input value={`${ta.name} (${ta.code})`} readOnly className={styles.lockedInput} />
            <small className={styles.fieldHelper}>Không thể thay đổi người được gán</small>
          </label>
          <label className={styles.taField}>
            <span>Khoá học phụ trách <b>*</b></span>
            <select className={styles.selectInput} value={course} onChange={(e) => setCourse(e.target.value)}>
              {COURSE_OPTIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className={styles.taField}>
            <span>Lịch làm việc</span>
            <input
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="VD: T2-T4-T6 · 07:00-09:00"
              value={schedule}
            />
          </label>
          <div className={styles.taField}>
            <span>Thông tin liên hệ</span>
            <input
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Số điện thoại"
              value={phone}
            />
            <input
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              value={email}
            />
          </div>
          <label className={styles.taField}>
            <span>Ghi chú / Đánh giá</span>
            <textarea
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú về TA hoặc đánh giá hiệu quả hỗ trợ"
              rows={3}
              value={note}
            />
          </label>
        </div>
        <footer className={styles.taModalFooter}>
          <button onClick={onClose} type="button">Hủy</button>
          <button className={styles.darkButton} onClick={submit} type="button">Cập nhật</button>
        </footer>
      </section>
    </div>
  );
}

function BasicInfoTab({ customer }: { customer: Customer | null }) {
  const [companionOpen, setCompanionOpen] = useState(false);
  const [companions, setCompanions] = useState([
    { name: "Nguyễn Văn B", relation: "Vợ/Chồng", phone: "0912345678", birth: "20/6/1992" },
    { name: "Nguyễn Văn C", relation: "Con", phone: "0923456789", birth: "15/8/2010" },
  ]);

  const removeCompanion = (index: number) =>
    setCompanions((current) => current.filter((_, i) => i !== index));

  const c = customer;
  const isExpired = c?.status === "Hết hạn";
  const debtIsDanger = !!c?.debt && c.debt !== "0 VND";

  return (
    <>
      <section className={styles.detailCard}>
        <h3>Trạng thái & Thẻ</h3>
        <div className={styles.detailThree}>
          <InfoBlock label="Trạng thái"><CustomerStatus status={c?.status ?? "Hết hạn"} /></InfoBlock>
          <InfoBlock label="Thẻ hội viên">
            <div className={styles.cardDots}>
              {(c?.cards ?? ["green", "red"]).map((card, index) => (
                <span className={styles[`${card}Dot`]} key={`${card}-${index}`} />
              ))}
            </div>
          </InfoBlock>
          <InfoBlock label="Sinh trắc học"><BiometricBadges /></InfoBlock>
        </div>
      </section>

      <section className={styles.detailCard}>
        <h3>Thông tin cá nhân</h3>
        <div className={styles.infoGrid}>
          <InfoLine icon={User} label="Họ và tên" value={c?.name ?? "Nguyễn Văn A"} />
          <InfoLine icon={Phone} label="Số điện thoại" value={c?.phone ?? "0901234567"} />
          <InfoLine icon={Mail} label="Email" value={c?.email ?? "nguyenvana@gmail.com"} />
          <InfoLine icon={User} label="Giới tính" value={c?.gender ?? "Nam"} />
          <InfoLine icon={Calendar} label="Ngày sinh" value={c?.birth ?? "15/5/1990"} />
        </div>
      </section>

      <div className={styles.detailTwo}>
        <section className={styles.detailCard}>
          <h3>Thông tin hợp đồng</h3>
          <InfoLine icon={Calendar} label="Ngày đăng ký" value={c?.registerDate ?? "15/1/2024"} />
          <InfoLine
            danger={isExpired}
            icon={Calendar}
            label="Ngày hết hạn"
            value={c?.endDate ?? "15/7/2024"}
          />
        </section>
        <section className={styles.detailCard}>
          <h3>Tài chính</h3>
          <InfoLine danger={debtIsDanger} icon={DollarSign} label="Công nợ" value={c?.debt ?? "1.500.000 VND"} />
        </section>
      </div>

      <section className={styles.detailCard}>
        <h3>Thông tin quản lý</h3>
        <div className={styles.mgmtGrid}>
          <InfoBlock label="Ngày tạo">{c?.createdDate ?? "10/1/2024"}</InfoBlock>
          <InfoBlock label="Người tạo">{c?.creator ?? "Admin"}</InfoBlock>
          <InfoBlock label="Nhóm khách hàng">{c?.customerGroup ?? customerMeta(c ?? customerRows[0]).group}</InfoBlock>
          <InfoBlock label="Nguồn khách hàng">{c?.source ?? customerMeta(c ?? customerRows[0]).source}</InfoBlock>
        </div>
      </section>

      <section className={styles.detailCard}>
        <h3>
          Người đi cùng
          <button className={styles.greenButton} onClick={() => setCompanionOpen(true)} type="button">
            <UserPlus size={16} />Thêm người đi cùng
          </button>
        </h3>
        {companions.length === 0 ? (
          <p className={styles.mgmtMuted}>Chưa có người đi cùng nào.</p>
        ) : (
          companions.map((c, index) => (
            <div className={styles.companionRow} key={`${c.name}-${index}`}>
              <span>{c.name.charAt(0)}</span>
              <strong>{c.name} · {c.relation} · {c.phone} · {c.birth}</strong>
              <div>
                <button type="button" aria-label={`Sửa ${c.name}`}><Edit size={16} /></button>
                <button onClick={() => removeCompanion(index)} type="button" aria-label={`Xóa ${c.name}`}><X size={16} /></button>
              </div>
            </div>
          ))
        )}
      </section>

      {companionOpen ? <AddCompanionModal onClose={() => setCompanionOpen(false)} /> : null}
    </>
  );
}

function ContractsTab() {
  const contracts: Array<[string, string, string, string, string, string]> = [
    ["Golf Teetime - VIP", "Hết hạn", "HD001", "15/1/2024", "15/7/2024", "15,000,000 VND"],
    ["Golf Practice - Premium", "Còn hạn", "HD002", "1/2/2024", "31/12/2026", "25,000,000 VND"],
  ];
  const [selectedContract, setSelectedContract] = useState<typeof contracts[number] | null>(null);
  return (
    <>
      <section className={styles.detailCard}>
        <div className={styles.tabSectionHeader}>
          <h3>Danh sách hợp đồng</h3>
          <button className={styles.blueButton} type="button">
            <Plus size={16} />Thêm hợp đồng
          </button>
        </div>
        {contracts.map(([name, status, code, start, end, value]) => (
          <article className={styles.contractCard} key={code}>
            <div>
              <h4>{name} <CustomerStatus status={status} /></h4>
              <div className={styles.contractGrid}>
                <InfoBlock label="Mã hợp đồng"><span className={styles.memberCode}>{code}</span></InfoBlock>
                <InfoBlock label="Ngày bắt đầu">{start}</InfoBlock>
                <InfoBlock label="Ngày kết thúc">{end}</InfoBlock>
                <InfoBlock label="Giá trị"><span className={styles.dateGreen}>{value}</span></InfoBlock>
              </div>
            </div>
            <button type="button" onClick={() => setSelectedContract([name, status, code, start, end, value])}>Xem chi tiết</button>
          </article>
        ))}
      </section>
      {selectedContract ? (
        <CustomerInfoDialog
          title={`Chi tiết hợp đồng ${selectedContract[2]}`}
          rows={[
            ["Gói dịch vụ", selectedContract[0]],
            ["Trạng thái", selectedContract[1]],
            ["Ngày bắt đầu", selectedContract[3]],
            ["Ngày kết thúc", selectedContract[4]],
            ["Giá trị", selectedContract[5]],
            ["Liên kết nghiệp vụ", "Hợp đồng, Lịch HLV, Teetime, Check-in/out và Sổ quỹ"],
          ]}
          onClose={() => setSelectedContract(null)}
        />
      ) : null}
    </>
  );
}

function TransactionsTab() {
  const txs: Array<{ code: string; date: string; type: string; amount: string; method: string; status: "Hoàn thành" | "Đang xử lý" }> = [
    { code: "GD001", date: "15/3/2026", type: "Thanh toán hợp đồng", amount: "15,000,000 VND", method: "Chuyển khoản", status: "Hoàn thành" },
    { code: "GD002", date: "10/3/2026", type: "Booking Teetime", amount: "500,000 VND", method: "Tiền mặt", status: "Hoàn thành" },
    { code: "GD003", date: "5/3/2026", type: "Thanh toán công nợ", amount: "1,500,000 VND", method: "Momo", status: "Đang xử lý" },
  ];
  const [selectedTx, setSelectedTx] = useState<typeof txs[number] | null>(null);
  return (
    <>
      <section className={styles.detailCard}>
        <h3>Lịch sử giao dịch</h3>
        <div className={styles.tableWrap}>
          <table className={styles.softTable}>
            <thead>
              <tr>
                <th>Mã GD</th>
                <th>Ngày</th>
                <th>Loại giao dịch</th>
                <th>Số tiền</th>
                <th>Phương thức</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((t) => (
                <tr key={t.code}>
                  <td><button className={styles.linkButton} type="button" onClick={() => setSelectedTx(t)}>{t.code}</button></td>
                  <td>{t.date}</td>
                  <td>{t.type}</td>
                  <td className={styles.amountGreen}>{t.amount}</td>
                  <td>{t.method}</td>
                  <td>
                    <span className={t.status === "Hoàn thành" ? styles.softStatusDone : styles.softStatusPending}>
                      {t.status}
                    </span>
                  </td>
                  <td>
                    <button className={styles.outlineButton} onClick={() => setSelectedTx(t)} type="button">
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {selectedTx ? (
        <CustomerInfoDialog
          title={`Chi tiết giao dịch ${selectedTx.code}`}
          rows={[
            ["Ngày giao dịch", selectedTx.date],
            ["Loại giao dịch", selectedTx.type],
            ["Số tiền", selectedTx.amount],
            ["Phương thức", selectedTx.method],
            ["Trạng thái", selectedTx.status],
            ["Đối soát", selectedTx.status === "Hoàn thành" ? "Đã ghi nhận vào Sổ quỹ" : "Chờ đối soát thanh toán"],
          ]}
          onClose={() => setSelectedTx(null)}
        />
      ) : null}
    </>
  );
}

function CheckinHistoryTab() {
  const months: Array<{ label: string; count: number }> = [
    { label: "T1", count: 12 },
    { label: "T2", count: 15 },
    { label: "T3", count: 18 },
    { label: "T4", count: 14 },
    { label: "T5", count: 16 },
    { label: "T6", count: 19 },
  ];
  const checkins = [
    { date: "17/3/2026", time: "08:00 - 10:30", staff: "Nguyễn Văn A", note: "Hoàn thành" },
    { date: "15/3/2026", time: "14:00 - 18:15", staff: "Trần Thị B", note: "Hoàn thành" },
    { date: "13/3/2026", time: "09:00 - 10:45", staff: "Lê Văn C", note: "Hoàn thành" },
    { date: "10/3/2026", time: "07:30 - 11:45", staff: "Phạm Thị D", note: "Hoàn thành" },
    { date: "8/3/2026", time: "15:00 - 17:00", staff: "Nguyễn Văn A", note: "Hoàn thành" },
    { date: "5/3/2026", time: "08:30 - 12:30", staff: "Trần Thị B", note: "Hoàn thành" },
    { date: "3/3/2026", time: "10:00 - 11:30", staff: "Lê Văn C", note: "Hoàn thành" },
    { date: "1/3/2026", time: "14:30 - 18:00", staff: "Phạm Thị D", note: "Hoàn thành" },
  ];
  return (
    <>
      <section className={styles.detailCard}>
        <h3>Lịch sử checkin</h3>
        <div className={styles.tableWrap}>
          <table className={styles.softTable}>
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Giờ</th>
                <th>Nhân viên</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {checkins.map((c, i) => (
                <tr key={`${c.date}-${i}`}>
                  <td>{c.date}</td>
                  <td>{c.time}</td>
                  <td>{c.staff}</td>
                  <td>{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className={styles.detailCard}>
        <h3>Biểu đồ checkin theo tháng</h3>
        <div className={styles.violetChart}>
          <div className={styles.violetGrid}>
            <span>20</span>
            <span>15</span>
            <span>10</span>
          </div>
          <div className={styles.violetBars}>
            {months.map((m) => (
              <div className={styles.violetBar} key={m.label}>
                <span style={{ height: `${(m.count / 20) * 100}%` }} title={`${m.count} lượt`} />
                <em>{m.label}</em>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

type Meal = { name: string; time: string; items: string[]; cal: number; pro: number };
type MealPlan = {
  name: string;
  start: string;
  end: string;
  cal: number;
  pro: number;
  carbs: number;
  fat: number;
  expert: string;
  meals: Meal[];
};

function MealPlanTab() {
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [plan, setPlan] = useState<MealPlan | null>({
    name: "Kế hoạch Giảm mỡ - Tăng cơ",
    start: "1/3/2026",
    end: "31/3/2026",
    cal: 2200,
    pro: 165,
    carbs: 220,
    fat: 70,
    expert: "Chuyên gia dinh dưỡng Lê Thị Mai",
    meals: [
      { name: "Bữa sáng", time: "7:00", items: ["Yến mạch 80g", "Chuối 1 trái", "Sữa tươi không đường 250ml", "Trứng luộc 2 quả"], cal: 520, pro: 28 },
      { name: "Bữa phụ 1", time: "10:00", items: ["Táo 1 trái", "Hạnh nhân 30g"], cal: 220, pro: 8 },
      { name: "Bữa trưa", time: "12:30", items: ["Cơm gạo lứt 150g", "Ức gà nướng 150g", "Rau xanh 200g", "Dầu olive 1 muỗng"], cal: 650, pro: 52 },
      { name: "Bữa phụ 2", time: "15:30", items: ["Sữa chua Hy Lạp 200g", "Quả việt quất 50g"], cal: 180, pro: 15 },
      { name: "Bữa tối", time: "19:00", items: ["Cá hồi nướng 150g", "Khoai lang 150g", "Salad rau trộn 150g", "Dầu olive 1 muỗng"], cal: 580, pro: 48 },
      { name: "Bữa phụ 3", time: "21:00", items: ["Whey protein 30g", "Chuối 1 trái"], cal: 200, pro: 26 },
    ],
  });

  if (!plan) {
    return (
      <section className={styles.detailCard}>
        <div className={styles.tabSectionHeader}>
          <h3>Meal Plan</h3>
          <button className={styles.blueButton} onClick={() => setAddOpen(true)} type="button">
            <Plus size={16} />Thêm kế hoạch
          </button>
        </div>
        <p className={styles.mgmtMuted}>Khách hàng chưa có Meal Plan nào.</p>
        {addOpen ? <AddMealPlanModal onClose={() => setAddOpen(false)} onSave={(p) => { setPlan(p); setAddOpen(false); }} /> : null}
      </section>
    );
  }

  const handleDelete = () => setDeleteOpen(true);

  const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <>
      <section className={styles.detailCard}>
        <div className={styles.tabSectionHeader}>
          <h3>Meal Plan</h3>
          <button className={styles.blueButton} onClick={() => setAddOpen(true)} type="button">
            <Plus size={16} />Thêm kế hoạch
          </button>
        </div>
      </section>

      <section className={styles.detailCard}>
        <div className={styles.tabSectionHeader}>
          <h3>Thông tin Meal Plan</h3>
          <div className={styles.cardActions}>
            <button className={styles.outlineButton} onClick={() => setAddOpen(true)} type="button">
              <Edit size={14} />Chỉnh sửa
            </button>
            <button className={styles.dangerOutline} onClick={handleDelete} type="button">
              <Trash2 size={14} />Xóa
            </button>
          </div>
        </div>
        <div className={styles.mealMetaGrid}>
          <InfoBlock label="Tên kế hoạch">{plan.name}</InfoBlock>
          <InfoBlock label="Ngày bắt đầu">{plan.start}</InfoBlock>
          <InfoBlock label="Ngày kết thúc">{plan.end}</InfoBlock>
          <InfoBlock label="Calories">{plan.cal.toLocaleString()} kcal/ngày</InfoBlock>
          <InfoBlock label="Protein">{plan.pro} g/ngày</InfoBlock>
          <InfoBlock label="Carbs">{plan.carbs} g/ngày</InfoBlock>
          <InfoBlock label="Fat">{plan.fat} g/ngày</InfoBlock>
          <InfoBlock label="Chuyên gia dinh dưỡng">{plan.expert}</InfoBlock>
        </div>
      </section>

      <section className={styles.detailCard}>
        <h3>Lịch trình ăn uống</h3>
        <div className={styles.mealGrid}>
          {plan.meals.map((m, i) => (
            <article className={styles.mealCard} key={`${m.name}-${i}`}>
              <h4>{m.name} <span className={styles.mealTime}>({m.time})</span></h4>
              <ul>
                {m.items.map((it, j) => <li key={j}>{it}</li>)}
              </ul>
              <footer>
                <span><strong>Calories:</strong> <em className={styles.calValue}>{m.cal} kcal</em></span>
                <span><strong>Protein:</strong> <em className={styles.proValue}>{m.pro} g</em></span>
              </footer>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.detailCard}>
        <h3>Tiến trình dinh dưỡng</h3>
        <div className={styles.nutritionChart}>
          <div className={styles.nutritionGrid}>
            {[2400, 1800, 1200, 600, 0].map((v) => <span key={v}>{v}</span>)}
          </div>
          <div className={styles.nutritionBars}>
            {days.map((d) => (
              <div className={styles.nutritionDay} key={d}>
                <div className={styles.nutritionPair}>
                  <span className={styles.nutritionCal} style={{ height: `${(plan.cal / 2400) * 100}%` }} title={`${plan.cal} kcal`} />
                  <span className={styles.nutritionPro} style={{ height: `${(plan.pro / 200) * 100}%` }} title={`${plan.pro} g`} />
                </div>
                <em>{d}</em>
              </div>
            ))}
          </div>
          <div className={styles.nutritionLegend}>
            <span><i className={styles.nutritionCal} /> Calories (kcal)</span>
            <span><i className={styles.nutritionPro} /> Protein (g)</span>
          </div>
        </div>
      </section>

      {addOpen ? <AddMealPlanModal onClose={() => setAddOpen(false)} onSave={(p) => { setPlan(p); setAddOpen(false); }} initial={plan} /> : null}
      {deleteOpen ? (
        <CustomerConfirmDialog
          title="Xóa Meal Plan"
          message="Xóa kế hoạch dinh dưỡng hiện tại khỏi hồ sơ khách hàng? Khi triển khai backend, dữ liệu này nên được lưu lịch sử thay vì xóa cứng."
          confirmLabel="Xóa Meal Plan"
          tone="danger"
          onCancel={() => setDeleteOpen(false)}
          onConfirm={() => { setPlan(null); setDeleteOpen(false); }}
        />
      ) : null}
    </>
  );
}

function AddMealPlanModal({
  onClose,
  onSave,
  initial,
}: {
  onClose: () => void;
  onSave: (plan: MealPlan) => void;
  initial?: MealPlan;
}) {
  const [form, setForm] = useState<MealPlan>(
    initial ?? {
      name: "",
      start: "",
      end: "",
      cal: 0,
      pro: 0,
      carbs: 0,
      fat: 0,
      expert: "",
      meals: [{ name: "Bữa sáng", time: "", items: [""], cal: 0, pro: 0 }],
    }
  );
  const [error, setError] = useState("");
  const update = <K extends keyof MealPlan>(key: K, value: MealPlan[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const updateMeal = (index: number, patch: Partial<Meal>) =>
    setForm((current) => ({
      ...current,
      meals: current.meals.map((m, i) => (i === index ? { ...m, ...patch } : m)),
    }));

  const addMeal = () =>
    setForm((current) => ({
      ...current,
      meals: [...current.meals, { name: `Bữa phụ ${current.meals.length}`, time: "", items: [""], cal: 0, pro: 0 }],
    }));

  const removeMeal = (index: number) =>
    setForm((current) => ({ ...current, meals: current.meals.filter((_, i) => i !== index) }));

  const addItem = (mealIndex: number) =>
    updateMeal(mealIndex, { items: [...form.meals[mealIndex].items, ""] });

  const updateItem = (mealIndex: number, itemIndex: number, value: string) => {
    const items = [...form.meals[mealIndex].items];
    items[itemIndex] = value;
    updateMeal(mealIndex, { items });
  };

  const removeItem = (mealIndex: number, itemIndex: number) => {
    const items = form.meals[mealIndex].items.filter((_, i) => i !== itemIndex);
    updateMeal(mealIndex, { items });
  };

  const submit = () => {
    if (!form.name.trim() || !form.start || !form.end) {
      setError("Tên kế hoạch, ngày bắt đầu và ngày kết thúc là bắt buộc.");
      return;
    }
    if (form.meals.length === 0 || form.meals.some((m) => m.items.filter((i) => i.trim()).length === 0)) {
      setError("Mỗi bữa ăn phải có ít nhất 1 món ăn.");
      return;
    }
    onSave({
      ...form,
      start: form.start.includes("-") ? form.start.split("-").reverse().join("/") : form.start,
      end: form.end.includes("-") ? form.end.split("-").reverse().join("/") : form.end,
    });
  };

  return (
    <div className={styles.nestedOverlay}>
      <section className={styles.mealModal}>
        <header className={styles.mealModalHeader}>
          <div className={styles.mealHeaderIcon}>🍎</div>
          <div>
            <h2>{initial ? "Chỉnh sửa Meal Plan" : "Thêm Meal Plan mới"}</h2>
            <p>Tạo kế hoạch dinh dưỡng cho khách hàng</p>
          </div>
          <button onClick={onClose} type="button"><X size={20} /></button>
        </header>
        {error ? <div className={styles.formError}><AlertTriangle size={14} /> {error}</div> : null}
        <div className={styles.mealModalBody}>
          <section className={styles.mealModalSection}>
            <h3><Calendar size={16} /> Thông tin cơ bản</h3>
            <label>
              <span>Tên kế hoạch <b>*</b></span>
              <input
                onChange={(e) => update("name", e.target.value)}
                placeholder="VD: Kế hoạch Giảm mỡ - Tăng cơ"
                value={form.name}
              />
            </label>
            <div className={styles.miniGrid}>
              <label>
                <span>Ngày bắt đầu <b>*</b></span>
                <input
                  onChange={(e) => update("start", e.target.value)}
                  type="date"
                  value={form.start.includes("/") ? form.start.split("/").reverse().join("-") : form.start}
                />
              </label>
              <label>
                <span>Ngày kết thúc <b>*</b></span>
                <input
                  onChange={(e) => update("end", e.target.value)}
                  type="date"
                  value={form.end.includes("/") ? form.end.split("/").reverse().join("-") : form.end}
                />
              </label>
            </div>
            <label>
              <span>Chuyên gia dinh dưỡng</span>
              <input
                onChange={(e) => update("expert", e.target.value)}
                placeholder="VD: Chuyên gia dinh dưỡng Lê Thị Mai"
                value={form.expert}
              />
            </label>
          </section>

          <section className={styles.mealModalSection}>
            <h3><span style={{ color: "#7c3aed" }}>📈</span> Mục tiêu dinh dưỡng (mỗi ngày)</h3>
            <div className={styles.fourCol}>
              <label>
                <span>Calories (kcal)</span>
                <input inputMode="numeric" placeholder="VD: 2200" value={form.cal || ""} onChange={(e) => update("cal", Number(e.target.value) || 0)} />
              </label>
              <label>
                <span>Protein (g)</span>
                <input inputMode="numeric" placeholder="VD: 165" value={form.pro || ""} onChange={(e) => update("pro", Number(e.target.value) || 0)} />
              </label>
              <label>
                <span>Carbs (g)</span>
                <input inputMode="numeric" placeholder="VD: 220" value={form.carbs || ""} onChange={(e) => update("carbs", Number(e.target.value) || 0)} />
              </label>
              <label>
                <span>Fat (g)</span>
                <input inputMode="numeric" placeholder="VD: 70" value={form.fat || ""} onChange={(e) => update("fat", Number(e.target.value) || 0)} />
              </label>
            </div>
          </section>

          <section className={styles.mealModalSection}>
            <div className={styles.tabSectionHeader}>
              <h3>🍽 Lịch trình bữa ăn</h3>
              <button className={styles.outlineButton} onClick={addMeal} type="button">
                <Plus size={14} />Thêm bữa ăn
              </button>
            </div>
            {form.meals.map((meal, mealIndex) => (
              <article className={styles.mealEditCard} key={mealIndex}>
                <header>
                  <strong>Bữa ăn #{mealIndex + 1}</strong>
                  <button className={styles.deleteIcon} onClick={() => removeMeal(mealIndex)} type="button" aria-label={`Xóa bữa ${mealIndex + 1}`}>
                    <Trash2 size={14} />
                  </button>
                </header>
                <div className={styles.miniGrid}>
                  <label>
                    <span>Tên bữa ăn</span>
                    <input value={meal.name} onChange={(e) => updateMeal(mealIndex, { name: e.target.value })} placeholder="Bữa sáng" />
                  </label>
                  <label>
                    <span>Thời gian</span>
                    <input value={meal.time} onChange={(e) => updateMeal(mealIndex, { time: e.target.value })} placeholder="7:00" />
                  </label>
                  <label>
                    <span>Calories (kcal)</span>
                    <input inputMode="numeric" value={meal.cal || ""} onChange={(e) => updateMeal(mealIndex, { cal: Number(e.target.value) || 0 })} placeholder="VD: 520" />
                  </label>
                  <label>
                    <span>Protein (g)</span>
                    <input inputMode="numeric" value={meal.pro || ""} onChange={(e) => updateMeal(mealIndex, { pro: Number(e.target.value) || 0 })} placeholder="VD: 28" />
                  </label>
                </div>
                <div className={styles.mealItemsHeader}>
                  <span>Món ăn</span>
                  <button className={styles.outlineButton} onClick={() => addItem(mealIndex)} type="button">
                    <Plus size={14} />Thêm món
                  </button>
                </div>
                {meal.items.map((item, itemIndex) => (
                  <div className={styles.mealItemRow} key={itemIndex}>
                    <input
                      onChange={(e) => updateItem(mealIndex, itemIndex, e.target.value)}
                      placeholder="VD: Yến mạch 80g, Trứng luộc 2 quả"
                      value={item}
                    />
                    <button className={styles.deleteIcon} onClick={() => removeItem(mealIndex, itemIndex)} type="button" aria-label="Xóa món">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </article>
            ))}
          </section>

          <aside className={styles.mealHint}>
            <strong>💡 Hướng dẫn:</strong>
            <ul>
              <li>Tên kế hoạch, ngày bắt đầu và ngày kết thúc là bắt buộc</li>
              <li>Mỗi meal plan phải có ít nhất 1 bữa ăn</li>
              <li>Mỗi bữa ăn phải có ít nhất 1 món ăn</li>
              <li>Mục tiêu dinh dưỡng tổng = tổng các bữa ăn trong ngày</li>
              <li>Có thể thêm nhiều bữa phụ trong ngày (6-7 bữa/ngày)</li>
            </ul>
          </aside>
        </div>
        <footer className={styles.mealModalFooter}>
          <button onClick={onClose} type="button">Hủy</button>
          <button className={styles.greenButton} onClick={submit} type="button">
            🍎 Lưu Meal Plan
          </button>
        </footer>
      </section>
    </div>
  );
}

type ProfileLevel = "Beginner" | "Experienced";

type Profile = {
  // Step 1
  courseCount: string;
  coachEpga: string;
  coachOther: string;
  name: string;
  gender: string;
  dob: string;
  phone: string;
  email: string;
  // Step 2 common
  level: ProfileLevel;
  handicap: string;
  golfStartTime: string;
  // Step 2 beginner
  playingGoal: string;
  handedness: "Phải" | "Trái";
  otherSports: string;
  clubs: string;
  coachFreq: string;
  selfFreq: string;
  fitness: number; // 1-5
  healthNotes: string;
  // Step 2 experienced extra
  golfDuration: string;
  currentHandicap: string;
  targetHandicap: string;
  satisfiedPart: string;
  improveAspects: string;
  struggles: string;
  detailedDesc: string;
  iron7Distance: string;
  driverDistance: string;
};

const DEFAULT_PROFILE: Profile = {
  courseCount: "2",
  coachEpga: "Trần Quốc Toàn",
  coachOther: "Đã học thử tại sân Thảo Điền",
  name: "Nguyễn Test Golf",
  gender: "Nam",
  dob: "1990-05-15",
  phone: "0911111111",
  email: "test.golf@nextvision.vn",
  level: "Beginner",
  handicap: "Chưa có HCP",
  golfStartTime: "20/05/2026",
  playingGoal: "Cải thiện swing cơ bản và lên sân 9 hố",
  handedness: "Phải",
  otherSports: "Gym, chạy bộ",
  clubs: "Bộ gậy thuê tại trung tâm",
  coachFreq: "2",
  selfFreq: "1",
  fitness: 4,
  healthNotes: "Đau nhẹ cổ tay phải khi tập lực lớn",
  golfDuration: "",
  currentHandicap: "",
  targetHandicap: "",
  satisfiedPart: "",
  improveAspects: "",
  struggles: "",
  detailedDesc: "",
  iron7Distance: "",
  driverDistance: "",
};

function ProfilesTab({ initialProfile }: { initialProfile?: Profile | null }) {
  const [showModal, setShowModal] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(initialProfile ?? DEFAULT_PROFILE);
  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleSave = (next: Profile) => {
    setProfile(next);
    setShowModal(false);
  };

  const handleDelete = () => setDeleteOpen(true);

  if (!profile) {
    return (
      <>
        <section className={styles.profileEmptyCard}>
          <div className={styles.profileEmptyIcon}>📋</div>
          <h3>Bạn chưa có profile nào</h3>
          <p>Tạo profile mới để lưu lại thông tin kinh nghiệm golf của khách hàng</p>
          <button className={styles.greenButton} onClick={() => setShowModal(true)} type="button">
            <Plus size={16} />Thêm profile mới
          </button>
        </section>
        {showModal ? <AddProfileModal onClose={() => setShowModal(false)} onSave={handleSave} initial={DEFAULT_PROFILE} /> : null}
      </>
    );
  }

  return (
    <>
      <section className={styles.detailCard}>
        <div className={styles.tabSectionHeader}>
          <h3 className={styles.profileViewTitle}>Thông tin Profile</h3>
          <button className={styles.greenButton} onClick={() => setShowModal(true)} type="button">
            <Plus size={16} />Thêm mới
          </button>
        </div>

        <div className={styles.profileStepNav}>
          <button
            className={activeStep === 1 ? styles.profileStepActive : styles.profileStepIdle}
            onClick={() => setActiveStep(1)}
            type="button"
          >
            <span>{activeStep > 1 ? "✓" : "1"}</span>
            <em>Thông tin cơ bản</em>
          </button>
          <span className={styles.profileStepConnector} />
          <button
            className={activeStep === 2 ? styles.profileStepActive : styles.profileStepIdle}
            onClick={() => setActiveStep(2)}
            type="button"
          >
            <span>2</span>
            <em>Thông tin kinh nghiệm về golf</em>
          </button>
        </div>

        {activeStep === 1 ? (
          <div className={styles.profileViewSection}>
            <h4 className={styles.profileViewTitle}>Thông tin cơ bản</h4>
            <ProfileViewRow label="Số khoá học" value={profile.courseCount} />
            <ProfileViewRow label="HLV đã từng học tại EPGA" value={profile.coachEpga} />
            <ProfileViewRow label="Học viên/HLV đã từng học ngoài EPGA" value={profile.coachOther} />
            <ProfileViewRow label="Full Name/Họ và Tên:" value={profile.name} />
            <ProfileViewRow label="Gender/Giới tính:" value={profile.gender} />
            <ProfileViewRow label="Date of birth/Ngày sinh:" value={profile.dob} />
            <ProfileViewRow label="Mobile/SĐT:" value={profile.phone} />
            <ProfileViewRow label="Email" value={profile.email} />
          </div>
        ) : (
          <div className={styles.profileViewSection}>
            <h4 className={styles.profileViewTitle}>Golf Experience Assessment</h4>
            <ProfileViewRow label="Trình độ:" value={profile.level === "Beginner" ? "Mới học Golf" : "Có kinh nghiệm"} />
            <ProfileViewRow label="Handicap:" value={profile.handicap} />
            <ProfileViewRow label="Thời gian chơi golf trước khi bắt đầu khóa học:" value={profile.golfStartTime} />

            <h4 className={styles.profileViewSubtitle}>
              {profile.level === "Beginner"
                ? "Phần dành cho người mới/Beginner Section"
                : "Người có kinh nghiệm/Experienced Section"}
            </h4>
            <div className={styles.profileViewGrid2}>
              <ProfileViewRow label="Mục tiêu chơi golf/Playing goal:" value={profile.playingGoal} />
              <ProfileViewRow label="Tay thuận/Handedness:" value={profile.handedness} />
              <ProfileViewRow label="Bộ môn thể thao khác đã từng chơi:" value={profile.otherSports} />
              <ProfileViewRow
                label="Lưu ý (giới hạn cơ thể/chấn thương/tiền sử bệnh đặc biệt):"
                value={`${profile.healthNotes}${profile.healthNotes ? "\nAttention (physical limitations/injuries/medical records):" : ""}`}
              />
              <ProfileViewRow label="Tần suất tập với HLV dự kiến/tuần:" value={profile.coachFreq} />
              <ProfileViewRow label="Tần suất tự tập luyện dự kiến/Tuần:" value={profile.selfFreq} />
              <ProfileViewRow label="Bộ gậy golf:" value={profile.clubs} />
              <ProfileViewRow label="Mức độ thể lực hiện tại/Current fitness level:" value={`${profile.fitness * 20}/100`} />
            </div>
          </div>
        )}

        <div className={styles.profileViewActions}>
          <button className={styles.greenButton} onClick={() => setShowModal(true)} type="button">
            <Edit size={14} />Cập nhật
          </button>
          <button className={styles.dangerSolid} onClick={handleDelete} type="button">
            <Trash2 size={14} />Xóa
          </button>
        </div>
      </section>
      {showModal ? <AddProfileModal onClose={() => setShowModal(false)} onSave={handleSave} initial={profile} /> : null}
      {deleteOpen ? (
        <CustomerConfirmDialog
          title="Xóa profile golf"
          message="Xóa profile kinh nghiệm golf khỏi hồ sơ khách hàng? Thao tác này ảnh hưởng dữ liệu tư vấn HLV và lộ trình học."
          confirmLabel="Xóa profile"
          tone="danger"
          onCancel={() => setDeleteOpen(false)}
          onConfirm={() => { setProfile(null); setDeleteOpen(false); }}
        />
      ) : null}
    </>
  );
}

function ProfileViewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.profileViewRow}>
      <span>{label}</span>
      <strong>{value || "-"}</strong>
    </div>
  );
}

function AddProfileModal({
  onClose,
  onSave,
  initial,
}: {
  onClose: () => void;
  onSave: (profile: Profile) => void;
  initial: Profile;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<Profile>(initial);
  const [error, setError] = useState("");
  const update = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = () => {
    if (!form.name.trim()) {
      setError("Họ và tên là bắt buộc.");
      setStep(1);
      return;
    }
    onSave(form);
  };

  return (
    <div className={styles.nestedOverlay}>
      <section className={styles.profileModal}>
        <header className={styles.profileModalHeader}>
          <h2>Thêm mới Profile hội viên</h2>
          <button onClick={onClose} type="button"><X size={20} /></button>
        </header>
        {error ? <div className={styles.formError}><AlertTriangle size={14} /> {error}</div> : null}
        <div className={styles.profileStepperBar}>
          <div className={`${styles.profileStepBubble} ${step >= 1 ? styles.profileStepBubbleActive : ""} ${step > 1 ? styles.profileStepBubbleDone : ""}`}>
            <span>{step > 1 ? "✓" : "1"}</span>
            <em>Thông tin cơ bản</em>
          </div>
          <span className={`${styles.profileStepperLine} ${step >= 2 ? styles.profileStepperLineActive : ""}`} />
          <div className={`${styles.profileStepBubble} ${step >= 2 ? styles.profileStepBubbleActive : ""}`}>
            <span>2</span>
            <em>Thông tin kinh nghiệm</em>
          </div>
        </div>
        <div className={styles.profileModalBody}>
          {step === 1 ? (
            <div className={styles.upperGrid}>
              <UpperLabel label="Số khoá học" htmlFor="courseCount">
                <input id="courseCount" placeholder="Nhập số khoá học" value={form.courseCount} onChange={(e) => update("courseCount", e.target.value)} />
              </UpperLabel>
              <UpperLabel label="HLV đã từng học tại EPGA" htmlFor="coachEpga">
                <select id="coachEpga" className={styles.selectInput} value={form.coachEpga} onChange={(e) => update("coachEpga", e.target.value)}>
                  <option value="">Chọn Huấn luyện viên</option>
                  <option>Nguyễn Văn A</option>
                  <option>Trần Quốc Toàn</option>
                  <option>Lê Minh</option>
                </select>
              </UpperLabel>
              <UpperLabel label="Học viên/HLV đã từng học ngoài EPGA" htmlFor="coachOther" full>
                <input id="coachOther" placeholder="Thông tin đào tạo khác" value={form.coachOther} onChange={(e) => update("coachOther", e.target.value)} />
              </UpperLabel>
              <UpperLabel label="Full Name/Họ và tên" htmlFor="name">
                <input id="name" placeholder="Nhập họ và tên" value={form.name} onChange={(e) => update("name", e.target.value)} />
              </UpperLabel>
              <UpperLabel label="Gender/Giới tính" htmlFor="gender">
                <select id="gender" className={styles.selectInput} value={form.gender} onChange={(e) => update("gender", e.target.value)}>
                  <option>Nam</option>
                  <option>Nữ</option>
                  <option>Khác</option>
                </select>
              </UpperLabel>
              <UpperLabel label="Date of birth/Ngày sinh" htmlFor="dob">
                <input id="dob" type="date" value={form.dob && form.dob !== "-" ? form.dob : ""} onChange={(e) => update("dob", e.target.value)} />
              </UpperLabel>
              <UpperLabel label="Mobile/SĐT" htmlFor="phone">
                <input id="phone" placeholder="090 XXX XXXX" value={form.phone === "-" ? "" : form.phone} onChange={(e) => update("phone", e.target.value)} />
              </UpperLabel>
              <UpperLabel label="Email" htmlFor="email" full>
                <input id="email" placeholder="example@golf.com" value={form.email === "-" ? "" : form.email} onChange={(e) => update("email", e.target.value)} />
              </UpperLabel>
            </div>
          ) : (
            <div className={styles.upperGrid}>
              <h3 className={styles.profileFormTitle}>Golf Experience Assessment</h3>
              <UpperLabel label="Chọn trình độ" htmlFor="" full>
                <div className={styles.levelCardRow}>
                  <button
                    className={form.level === "Beginner" ? styles.levelCardActive : styles.levelCardIdle}
                    onClick={() => update("level", "Beginner")}
                    type="button"
                  >
                    <span className={form.level === "Beginner" ? styles.radioDotActive : styles.radioDot} />
                    Người mới bắt đầu/Beginner
                  </button>
                  <button
                    className={form.level === "Experienced" ? styles.levelCardActive : styles.levelCardIdle}
                    onClick={() => update("level", "Experienced")}
                    type="button"
                  >
                    <span className={form.level === "Experienced" ? styles.radioDotActive : styles.radioDot} />
                    Người có kinh nghiệm/Experienced
                  </button>
                </div>
              </UpperLabel>
              <UpperLabel label="Handicap (tùy chọn)" htmlFor="handicap">
                <input id="handicap" placeholder={form.level === "Beginner" ? "Nhập số HCP hoặc 'Tôi không có'" : "Nhập số HCP"} value={form.handicap} onChange={(e) => update("handicap", e.target.value)} />
              </UpperLabel>
              <UpperLabel label="Thời gian chơi golf trước khi bắt đầu khóa học" htmlFor="golfStartTime">
                <input id="golfStartTime" type="text" placeholder="Chọn ngày bắt đầu học" value={form.golfStartTime} onChange={(e) => update("golfStartTime", e.target.value)} />
              </UpperLabel>

              {form.level === "Beginner" ? (
                <>
                  <UpperLabel label="Mục tiêu chơi golf / Playing goal" htmlFor="playingGoal">
                    <select id="playingGoal" className={styles.selectInput} value={form.playingGoal} onChange={(e) => update("playingGoal", e.target.value)}>
                      <option value="">Chọn mục tiêu</option>
                      <option>Vui</option>
                      <option>Giảm cân</option>
                      <option>Thi đấu</option>
                      <option>Giao lưu công việc</option>
                    </select>
                  </UpperLabel>
                  <UpperLabel label="Tay thuận / Handedness" htmlFor="">
                    <div className={styles.toggleGroup}>
                      <button
                        className={form.handedness === "Phải" ? styles.toggleActive : styles.toggleIdle}
                        onClick={() => update("handedness", "Phải")}
                        type="button"
                      >
                        Phải
                      </button>
                      <button
                        className={form.handedness === "Trái" ? styles.toggleActive : styles.toggleIdle}
                        onClick={() => update("handedness", "Trái")}
                        type="button"
                      >
                        Trái
                      </button>
                    </div>
                  </UpperLabel>
                  <UpperLabel label="Bộ môn thể thao khác / Other sports played" htmlFor="otherSports">
                    <input id="otherSports" placeholder="VD: Tennis, Bơi lội..." value={form.otherSports} onChange={(e) => update("otherSports", e.target.value)} />
                  </UpperLabel>
                  <UpperLabel label="Bộ gậy golf / Golf clubs" htmlFor="clubs">
                    <input id="clubs" placeholder="Nhập tên bộ gậy đang sử dụng" value={form.clubs} onChange={(e) => update("clubs", e.target.value)} />
                  </UpperLabel>
                  <UpperLabel label="Tần suất tập với HLV (buổi/tuần)" htmlFor="coachFreq">
                    <input id="coachFreq" placeholder="Nhập số buổi" value={form.coachFreq} onChange={(e) => update("coachFreq", e.target.value)} />
                  </UpperLabel>
                  <UpperLabel label="Tần suất tự tập luyện (buổi/tuần)" htmlFor="selfFreq">
                    <input id="selfFreq" placeholder="Nhập số buổi" value={form.selfFreq} onChange={(e) => update("selfFreq", e.target.value)} />
                  </UpperLabel>
                  <UpperLabel label="Mức độ thể lực hiện tại" htmlFor="" full>
                    <div className={styles.fitnessSegments}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          className={n <= form.fitness ? styles.fitnessSegOn : styles.fitnessSegOff}
                          onClick={() => update("fitness", n)}
                          type="button"
                          aria-label={`Mức ${n} / 5`}
                        />
                      ))}
                      <strong>{form.fitness}/5</strong>
                    </div>
                  </UpperLabel>
                  <UpperLabel label="Lưu ý (về sức khỏe) / Physical limitations" htmlFor="healthNotes" full>
                    <textarea id="healthNotes" rows={3} placeholder="Health notes or physical limitations..." value={form.healthNotes} onChange={(e) => update("healthNotes", e.target.value)} />
                  </UpperLabel>
                </>
              ) : (
                <>
                  <h4 className={styles.profileExpTitle}>Người có kinh nghiệm/Experienced Details</h4>
                  <UpperLabel label="Thời gian đã chơi Golf" htmlFor="golfDuration">
                    <input id="golfDuration" placeholder="VD: 3 năm" value={form.golfDuration} onChange={(e) => update("golfDuration", e.target.value)} />
                  </UpperLabel>
                  <UpperLabel label="Mục tiêu chơi golf" htmlFor="playingGoal2">
                    <input id="playingGoal2" placeholder="VD: Single Handicap" value={form.playingGoal} onChange={(e) => update("playingGoal", e.target.value)} />
                  </UpperLabel>
                  <UpperLabel label="Điểm chấp hiện tại" htmlFor="currentHandicap">
                    <input id="currentHandicap" placeholder="Current handicap" value={form.currentHandicap} onChange={(e) => update("currentHandicap", e.target.value)} />
                  </UpperLabel>
                  <UpperLabel label="Điểm chấp mục tiêu" htmlFor="targetHandicap">
                    <input id="targetHandicap" placeholder="Target handicap" value={form.targetHandicap} onChange={(e) => update("targetHandicap", e.target.value)} />
                  </UpperLabel>
                  <UpperLabel label="Bộ gậy golf" htmlFor="clubs2">
                    <input id="clubs2" placeholder="Bộ gậy golf" value={form.clubs} onChange={(e) => update("clubs", e.target.value)} />
                  </UpperLabel>
                  <UpperLabel label="Hài lòng với phần game nào nhất" htmlFor="satisfiedPart">
                    <input id="satisfiedPart" placeholder="Hài lòng với phần game nào nhất" value={form.satisfiedPart} onChange={(e) => update("satisfiedPart", e.target.value)} />
                  </UpperLabel>
                  <UpperLabel label="Khía cạnh muốn cải thiện" htmlFor="improveAspects" full>
                    <textarea id="improveAspects" rows={3} placeholder="Aspects expected to be improved..." value={form.improveAspects} onChange={(e) => update("improveAspects", e.target.value)} />
                  </UpperLabel>
                  <UpperLabel label="Khía cạnh đang gặp khó khăn" htmlFor="struggles" full>
                    <textarea id="struggles" rows={3} placeholder="What is your current struggle?" value={form.struggles} onChange={(e) => update("struggles", e.target.value)} />
                  </UpperLabel>
                  <UpperLabel label="Mô tả chi tiết" htmlFor="detailedDesc" full>
                    <textarea id="detailedDesc" rows={3} placeholder="Detailed description..." value={form.detailedDesc} onChange={(e) => update("detailedDesc", e.target.value)} />
                  </UpperLabel>
                  <UpperLabel label="Lưu ý (về sức khỏe)" htmlFor="healthNotes2" full>
                    <textarea id="healthNotes2" rows={3} placeholder="Health notes..." value={form.healthNotes} onChange={(e) => update("healthNotes", e.target.value)} />
                  </UpperLabel>
                  <UpperLabel label="Tần suất tập với HLV (buổi/tuần)" htmlFor="coachFreq2">
                    <input id="coachFreq2" placeholder="Nhập số buổi" value={form.coachFreq} onChange={(e) => update("coachFreq", e.target.value)} />
                  </UpperLabel>
                  <UpperLabel label="Tần suất tự tập luyện (buổi/tuần)" htmlFor="selfFreq2">
                    <input id="selfFreq2" placeholder="Nhập số buổi" value={form.selfFreq} onChange={(e) => update("selfFreq", e.target.value)} />
                  </UpperLabel>
                  <UpperLabel label="Khoảng cách gậy 7 sắt hiện tại" htmlFor="iron7Distance" full>
                    <input id="iron7Distance" placeholder="Khoảng cách gậy 7 sắt hiện tại" value={form.iron7Distance} onChange={(e) => update("iron7Distance", e.target.value)} />
                  </UpperLabel>
                  <UpperLabel label="Khoảng cách gậy driver hiện tại" htmlFor="driverDistance" full>
                    <input id="driverDistance" placeholder="Khoảng cách gậy driver hiện tại" value={form.driverDistance} onChange={(e) => update("driverDistance", e.target.value)} />
                  </UpperLabel>
                </>
              )}
            </div>
          )}
        </div>
        <footer className={styles.profileModalFooter}>
          <button onClick={onClose} type="button">Đóng</button>
          {step === 1 ? (
            <button className={styles.greenButton} onClick={() => setStep(2)} type="button">Lưu →</button>
          ) : (
            <>
              <button onClick={() => setStep(1)} type="button">← Quay lại</button>
              <button className={styles.greenButton} onClick={submit} type="button">Lưu →</button>
            </>
          )}
        </footer>
      </section>
    </div>
  );
}

function UpperLabel({
  children,
  full,
  htmlFor,
  label,
}: {
  children: React.ReactNode;
  full?: boolean;
  htmlFor?: string;
  label: string;
}) {
  return (
    <label className={`${styles.upperLabel} ${full ? styles.upperFull : ""}`} htmlFor={htmlFor}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function CustomerInfoDialog({
  title,
  rows,
  onClose,
}: {
  title: string;
  rows: Array<[string, string]>;
  onClose: () => void;
}) {
  return (
    <div className={styles.nestedOverlay} role="dialog" aria-modal="true">
      <section className={styles.smallModal}>
        <header>
          <h2>{title}</h2>
          <button onClick={onClose} type="button"><X size={20} /></button>
        </header>
        <div className={styles.smallModalBody}>
          {rows.map(([label, value]) => (
            <InfoBlock key={label} label={label}>{value}</InfoBlock>
          ))}
        </div>
        <footer>
          <button className={styles.blueButton} onClick={onClose} type="button">Đóng</button>
        </footer>
      </section>
    </div>
  );
}

function CustomerConfirmDialog({
  title,
  message,
  confirmLabel,
  tone = "default",
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  tone?: "default" | "danger";
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className={styles.nestedOverlay} role="dialog" aria-modal="true">
      <section className={styles.smallModal}>
        <header>
          <h2>{title}</h2>
          <button onClick={onCancel} type="button"><X size={20} /></button>
        </header>
        <div className={styles.smallModalBody}>
          <div className={tone === "danger" ? styles.formError : styles.ticketCustomerInfo}>
            <AlertTriangle size={16} />
            <span>{message}</span>
          </div>
        </div>
        <footer>
          <button onClick={onCancel} type="button">Hủy</button>
          <button className={tone === "danger" ? styles.contractDelete : styles.blueButton} onClick={onConfirm} type="button">
            {confirmLabel}
          </button>
        </footer>
      </section>
    </div>
  );
}

function GolfMeasurementChartModal({
  measurements,
  onClose,
}: {
  measurements: Measurement[];
  onClose: () => void;
}) {
  const bestCarry = Math.max(...measurements.map((m) => m.carry), 1);
  return (
    <div className={styles.nestedOverlay} role="dialog" aria-modal="true">
      <section className={styles.smallModal}>
        <header>
          <h2>Biểu đồ Trackman</h2>
          <button onClick={onClose} type="button"><X size={20} /></button>
        </header>
        <div className={styles.smallModalBody}>
          {measurements.map((m) => (
            <div key={`${m.date}-${m.club}`} style={{ display: "grid", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontWeight: 700 }}>
                <span>{m.club} · {m.date}</span>
                <span>{m.carry} yds · spin {m.spin.toLocaleString()}</span>
              </div>
              <div style={{ height: 10, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
                <span style={{ display: "block", height: "100%", width: `${Math.max(10, (m.carry / bestCarry) * 100)}%`, background: "linear-gradient(90deg, #2563eb, #22c55e)" }} />
              </div>
            </div>
          ))}
        </div>
        <footer>
          <button className={styles.blueButton} onClick={onClose} type="button">Đóng</button>
        </footer>
      </section>
    </div>
  );
}

function TrackmanPreviewModal({
  measurement,
  onClose,
}: {
  measurement: Measurement;
  onClose: () => void;
}) {
  return (
    <div className={styles.nestedOverlay} role="dialog" aria-modal="true">
      <section className={styles.smallModal}>
        <header>
          <h2>Ảnh Trackman · {measurement.club}</h2>
          <button onClick={onClose} type="button"><X size={20} /></button>
        </header>
        <div className={styles.smallModalBody}>
          <div style={{ border: "1px solid #dbeafe", borderRadius: 16, padding: 16, background: "linear-gradient(135deg, #eff6ff, #f8fafc)" }}>
            <strong>{measurement.date}</strong>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginTop: 12 }}>
              <InfoBlock label="Carry">{measurement.carry} yds</InfoBlock>
              <InfoBlock label="Total">{measurement.total} yds</InfoBlock>
              <InfoBlock label="Attack angle">{measurement.angle}°</InfoBlock>
              <InfoBlock label="Spin rate">{measurement.spin.toLocaleString()}</InfoBlock>
            </div>
          </div>
        </div>
        <footer>
          <button className={styles.blueButton} onClick={onClose} type="button">Đóng</button>
        </footer>
      </section>
    </div>
  );
}

function TrackmanUploadModal({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.nestedOverlay} role="dialog" aria-modal="true">
      <section className={styles.smallModal}>
        <header>
          <h2>Tải ảnh Trackman</h2>
          <button onClick={onClose} type="button"><X size={20} /></button>
        </header>
        <div className={styles.smallModalBody}>
          <label>
            <span>Ảnh kết quả <b>*</b></span>
            <input accept="image/png,image/jpeg" type="file" />
          </label>
          <InfoBlock label="Quy chuẩn">JPG/PNG, tối đa 5MB. Ảnh dùng để đối chiếu chỉ số Carry, Total, Club Path, Face Angle và Spin.</InfoBlock>
        </div>
        <footer>
          <button onClick={onClose} type="button">Hủy</button>
          <button className={styles.greenButton} onClick={onClose} type="button">Đính kèm</button>
        </footer>
      </section>
    </div>
  );
}

function DeleteCustomerModal({
  customer,
  onCancel,
  onConfirm,
}: {
  customer: Customer;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [confirmText, setConfirmText] = useState("");
  const required = "XOA";
  const canConfirm = confirmText.trim().toUpperCase() === required;

  const cascadeItems = [
    "Thông tin cá nhân + hồ sơ + ghi chú khách hàng",
    "Hợp đồng + lịch sử giao dịch + công nợ",
    "Booking Teetime, Line Tập, Lớp học, Lịch HLV",
    "Kết quả tập luyện + scorecard + Profile golf",
    "Inbody + Meal Plan + chỉ số cá nhân",
    "Sinh trắc học (Face/Vân tay) + thẻ RFID",
  ];

  return (
    <div className={styles.modalOverlay}>
      <section className={styles.deleteModal}>
        <header className={styles.deleteHeader}>
          <div className={styles.deleteIcon}>
            <AlertTriangle size={28} />
          </div>
          <div>
            <h2>Xác nhận xóa khách hàng</h2>
            <p>Thao tác này không thể hoàn tác</p>
          </div>
          <button aria-label="Đóng" className={styles.deleteClose} onClick={onCancel} type="button">
            <X size={20} />
          </button>
        </header>

        <div className={styles.deleteBody}>
          <div className={styles.deleteWarning}>
            <strong>⚠ XÓA VĨNH VIỄN khách hàng khỏi hệ thống.</strong>
            <span>
              Tất cả dữ liệu liên quan sẽ bị xóa và không thể khôi phục sau 30 ngày
              (Module 12 Cài đặt → Thùng rác). Áp dụng theo <em>BR-M12-05</em>.
            </span>
          </div>

          <section className={styles.deleteCustomerCard}>
            <h3>Thông tin khách hàng sẽ bị xóa</h3>
            <div className={styles.deleteCustomerGrid}>
              <div>
                <span>Mã hội viên</span>
                <strong className={styles.memberCode}>{customer.code}</strong>
              </div>
              <div>
                <span>Họ và tên</span>
                <strong>{customer.name}</strong>
              </div>
              <div>
                <span>Số điện thoại</span>
                <strong>{customer.phone}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{customer.email || "—"}</strong>
              </div>
              <div>
                <span>Trạng thái</span>
                <strong><CustomerStatus status={customer.status} /></strong>
              </div>
              <div>
                <span>Công nợ</span>
                <strong className={customer.debt && customer.debt !== "0 VND" ? styles.dateRed : undefined}>
                  {customer.debt}
                </strong>
              </div>
            </div>
          </section>

          <section className={styles.deleteCascade}>
            <h3>Dữ liệu sẽ bị xóa theo (cascade)</h3>
            <ul>
              {cascadeItems.map((item) => (
                <li key={item}><Trash2 size={14} /> {item}</li>
              ))}
            </ul>
          </section>

          <div className={styles.deleteSoftNote}>
            <strong>Cơ chế xóa:</strong> Soft Delete 30 ngày → vào Thùng rác (Module 12 Cài đặt).
            Sau 30 ngày sẽ <em>xóa cứng</em> không thể khôi phục.
          </div>

          <label className={styles.deleteConfirmInput}>
            <span>Để xác nhận, gõ <code>XOA</code> vào ô bên dưới:</span>
            <input
              autoFocus
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder="Gõ XOA để bật nút xác nhận"
              value={confirmText}
            />
          </label>
        </div>

        <footer className={styles.deleteFooter}>
          <button onClick={onCancel} type="button">Hủy bỏ</button>
          <button
            className={styles.dangerButton}
            disabled={!canConfirm}
            onClick={onConfirm}
            type="button"
          >
            <Trash2 size={16} /> Xác nhận xóa
          </button>
        </footer>
      </section>
    </div>
  );
}

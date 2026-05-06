"use client";

import { useState, type FormEvent } from "react";
import {
  Calendar,
  ChevronDown,
  DollarSign,
  Download,
  Edit,
  Filter,
  Mail,
  Phone,
  Plus,
  Search,
  Settings,
  Upload,
  UploadCloud,
  User,
  UserPlus,
  X,
} from "lucide-react";
import styles from "../page.module.css";
import {
  BiometricBadges,
  CustomerStatus,
  FormField,
  InfoBlock,
  InfoLine,
  MiniTable,
  SelectField,
  SimpleMetric,
} from "../_shared/components";
import { customerRows } from "../_shared/data";
import type { Customer } from "../_shared/types";

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
];

export default function CustomersScreen() {
  const [addOpen, setAddOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState("Thông tin cơ bản");
  const [nestedModal, setNestedModal] = useState<"group" | "source" | "companion" | null>(null);
  const [rows, setRows] = useState(customerRows);
  const [query, setQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState("Tất cả");
  const [filterOpen, setFilterOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [advFilter, setAdvFilter] = useState<AdvFilter>(DEFAULT_ADV_FILTER);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(ALL_COLUMNS.map((c) => c.id));

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
    return true;
  });

  const handleCreateCustomer = (customer: Customer) => {
    setRows((current) => [customer, ...current]);
    setQuickFilter("Tất cả");
    setAdvFilter(DEFAULT_ADV_FILTER);
  };

  const activeAdvCount = (Object.keys(advFilter) as Array<keyof AdvFilter>).filter(
    (key) => advFilter[key] !== DEFAULT_ADV_FILTER[key]
  ).length;

  return (
    <>
      <section className={styles.customerScreen}>
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
                        alert("Đang chuẩn bị file mẫu import khách hàng (.xlsx)...");
                        setExportOpen(false);
                      }}
                      type="button"
                    >
                      <Upload size={16} /> Nhập Excel
                    </button>
                    <button
                      onClick={() => {
                        alert(`Đang xuất ${filteredRows.length} hội viên ra file .xlsx...`);
                        setExportOpen(false);
                      }}
                      type="button"
                    >
                      <Download size={16} /> Xuất Excel
                    </button>
                    <button
                      onClick={() => {
                        alert("Đang tải file mẫu import_khach_hang.xlsx...");
                        setExportOpen(false);
                      }}
                      type="button"
                    >
                      Tải file mẫu import
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
                {filteredRows.map((customer) => (
                  <tr key={customer.code}>
                    {isVisible("code") ? (
                      <td>
                        <button
                          className={styles.memberCode}
                          onClick={() => {
                            setDetailTab("Thông tin cơ bản");
                            setDetailOpen(true);
                          }}
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
                    {isVisible("customerGroup") ? <td className={styles.mutedCell}>---</td> : null}
                    {isVisible("source") ? <td className={styles.mutedCell}>---</td> : null}
                    {isVisible("registerDate") ? <td className={customer.registerDate === "---" ? styles.mutedCell : styles.dateGreen}>{customer.registerDate}</td> : null}
                    {isVisible("endDate") ? <td className={customer.endDate === "---" ? styles.mutedCell : styles.dateRed}>{customer.endDate}</td> : null}
                    {isVisible("createdDate") ? <td className={styles.dateGreen}>{customer.createdDate}</td> : null}
                    {isVisible("creator") ? <td>{customer.creator}</td> : null}
                    {isVisible("debt") ? <td>{customer.debt}</td> : null}
                  </tr>
                ))}
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
      </section>

      {addOpen ? (
        <AddCustomerModal
          nestedModal={nestedModal}
          onCreate={handleCreateCustomer}
          onClose={() => {
            setAddOpen(false);
            setNestedModal(null);
          }}
          onOpenNested={setNestedModal}
        />
      ) : null}

      {nestedModal === "group" ? <AddGroupModal onClose={() => setNestedModal(null)} /> : null}
      {nestedModal === "source" ? <AddSourceModal onClose={() => setNestedModal(null)} /> : null}
      {nestedModal === "companion" ? <AddCompanionModal onClose={() => setNestedModal(null)} /> : null}

      {detailOpen ? (
        <CustomerDetailModal
          activeTab={detailTab}
          onChangeTab={setDetailTab}
          onClose={() => setDetailOpen(false)}
        />
      ) : null}
    </>
  );
}

function AddCustomerModal({
  nestedModal,
  onCreate,
  onClose,
  onOpenNested,
}: {
  nestedModal: "group" | "source" | "companion" | null;
  onCreate: (customer: Customer) => void;
  onClose: () => void;
  onOpenNested: (modal: "group" | "source" | "companion") => void;
}) {
  const [error, setError] = useState("");
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

    if (!name || !phone) {
      setError("Họ và tên và Số điện thoại là bắt buộc theo SRS.");
      return;
    }

    onCreate({
      birth: String(data.get("birth") ?? "---") || "---",
      cards: ["green"],
      code: "HV" + String(customerRows.length + 1).padStart(3, "0"),
      createdDate: "7/4/2026",
      creator: "Admin",
      debt: "0 VND",
      email: String(data.get("email") ?? ""),
      endDate: "---",
      gender: String(data.get("gender") ?? "Nam") || "Nam",
      name,
      phone,
      registerDate: "---",
      status: "Chưa đăng ký",
    });
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <form className={`${styles.modalShell} ${nestedModal ? styles.dimmedModal : ""}`} onSubmit={handleSubmit}>
        <header className={styles.modalHeader}>
          <div>
            <h2>Thêm mới khách hàng</h2>
            <p>Điền thông tin hội viên mới vào form bên dưới</p>
          </div>
          <button onClick={onClose} type="button"><X size={22} /></button>
        </header>

        <div className={styles.modalBody}>
          {error ? <p className={styles.formError}>{error}</p> : null}
          <h3>Thông tin khách hàng</h3>
          <div className={styles.formGrid}>
            <FormField action="Tự động" label="Mã hội viên" name="code" value="HV1001" />
            <FormField action="Tự động" label="Mã sinh trắc học" name="biometricCode" value="12345678" />
            <FormField required label="Họ và tên" name="name" placeholder="Nhập họ và tên" />
            <FormField required label="Số điện thoại" name="phone" placeholder="Nhập số điện thoại" />
            <FormField label="Email" name="email" placeholder="Nhập email" />
            <FormField label="Ngày sinh" name="birth" type="date" />
            <SelectField
              label="Nhân viên phụ trách"
              name="assignedSale"
              options={["Tự chọn Sale phụ trách", "Admin", "Nguyễn Văn Thành", "Lê Thị Mai", "Trần Minh Hoàng"]}
            />
            <FormField label="Thẻ khách hàng (RFID)" placeholder="Nhập số thẻ vật lý" />
            <SelectField
              action="Thêm mới"
              label="Nhóm khách hàng"
              name="customerGroup"
              onAction={() => onOpenNested("group")}
              options={["Chọn nhóm", "VIP", "Premium", "Standard", "Khách vãng lai"]}
            />
          </div>
          <FormField area label="Ghi chú" placeholder="Sở thích, đặc điểm khách hàng..." />
          <SelectField
            action="Thêm mới"
            label="Nguồn khách hàng"
            name="customerSource"
            onAction={() => onOpenNested("source")}
            options={["Chọn nguồn", "Walk-in", "Facebook", "Google", "Giới thiệu", "CN khác"]}
          />

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
                <FormField label="Số CMND/CCCD" placeholder="Nhập số CMND/CCCD" />
                <FormField label="Giới tính" name="gender" placeholder="Nam / Nữ" />
                <FormField
                  action="Thêm"
                  label="Người đi cùng"
                  onAction={() => onOpenNested("companion")}
                  placeholder="Không có"
                />
                <FormField label="Người liên hệ" placeholder="Tên người liên hệ" />
                <FormField label="SĐT liên hệ" placeholder="Số điện thoại" />
                <FormField label="Tỉnh/Thành phố" />
                <FormField label="Phường/Xã" />
              </div>
              <FormField label="Thôn/Xóm/Số nhà" placeholder="Nhập địa chỉ chi tiết" />
              <FormField area label="Ghi chú" placeholder="Nhập ghi chú" />
            </>
          ) : null}
        </div>

        <footer className={styles.modalFooter}>
          <button onClick={onClose} type="button">Hủy bỏ</button>
          <button className={styles.blueButton} type="submit">Thêm hội viên</button>
        </footer>
      </form>
    </div>
  );
}

function AddGroupModal({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.nestedOverlay}>
      <section className={styles.smallModal}>
        <header>
          <h2>Thêm nhóm khách hàng</h2>
          <button onClick={onClose} type="button"><X size={20} /></button>
        </header>
        <div className={styles.smallModalBody}>
          <FormField action="Tự động" required label="Mã nhóm" value="NG001" />
          <FormField required label="Tên nhóm" placeholder="VD: VIP, Premium, Doanh nghiệp" />
          <FormField label="Mô tả" placeholder="Nhập mô tả ngắn (tùy chọn)" />
        </div>
        <footer>
          <button onClick={onClose} type="button">Hủy bỏ</button>
          <button className={styles.blueButton} onClick={onClose} type="button">Thêm</button>
        </footer>
      </section>
    </div>
  );
}

function AddSourceModal({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.nestedOverlay}>
      <section className={styles.smallModal}>
        <header>
          <h2>Thêm nguồn khách hàng</h2>
          <button onClick={onClose} type="button"><X size={20} /></button>
        </header>
        <div className={styles.smallModalBody}>
          <FormField action="Tự động" required label="Mã nguồn" value="NS001" />
          <FormField required label="Tên nguồn" placeholder="VD: Facebook Ads, Google Ads, Walk-in" />
          <FormField label="Mô tả" placeholder="Mô tả chiến dịch / chi tiết nguồn" />
        </div>
        <footer>
          <button onClick={onClose} type="button">Hủy bỏ</button>
          <button className={styles.blueButton} onClick={onClose} type="button">Thêm</button>
        </footer>
      </section>
    </div>
  );
}

function AddCompanionModal({ onClose }: { onClose: () => void }) {
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
            <div className={styles.uploadBox}>
              <UploadCloud size={42} />
              <span>Tải ảnh lên</span>
            </div>
            <button className={styles.greenButton} type="button">Webcam</button>
          </div>
          <div className={styles.companionFields}>
            <FormField required label="Họ và tên" placeholder="Họ tên người đi cùng" />
            <div className={styles.radioRow}>
              <span className={styles.radioActive} /> Nam
              <span className={styles.radio} /> Nữ
            </div>
            <FormField label="Nhóm quan hệ" placeholder="Nhóm quan hệ" />
            <FormField label="Ghi chú" placeholder="Ghi chú" />
          </div>
          <FormField label="Ngày sinh" />
          <div className={styles.formGrid}>
            <FormField label="Chiều cao (m)" value="1.70" />
            <FormField label="Cân nặng (kg)" value="65" />
          </div>
        </div>
        <footer>
          <button className={styles.greenButton} type="button">+ Thêm người đi cùng</button>
        </footer>
      </section>
    </div>
  );
}

function CustomerDetailModal({
  activeTab,
  onChangeTab,
  onClose,
}: {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  onClose: () => void;
}) {
  const tabs = ["Thông tin cơ bản", "Hợp đồng", "Lịch sử giao dịch", "Lịch sử checkin", "Kết quả tập luyện", "Inbody", "Meal Plan", "Thông tin TA"];

  return (
    <div className={styles.modalOverlay}>
      <section className={styles.detailModal}>
        <header className={styles.detailHeader}>
          <div className={styles.detailIdentity}>
            <span>N</span>
            <div>
              <h2>Nguyễn Văn A</h2>
              <p>Mã hội viên: HV001</p>
            </div>
          </div>
          <div>
            <button className={styles.blueButton} type="button"><Edit size={17} />Chỉnh sửa</button>
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

        <div className={styles.detailBody}>
          <CustomerDetailTab activeTab={activeTab} />
        </div>

        <footer className={styles.modalFooter}>
          <button onClick={onClose} type="button">Đóng</button>
        </footer>
      </section>
    </div>
  );
}

function CustomerDetailTab({ activeTab }: { activeTab: string }) {
  if (activeTab === "Hợp đồng") {
    return <ContractsTab />;
  }

  if (activeTab === "Lịch sử giao dịch") {
    return (
      <section className={styles.detailCard}>
        <h3>Lịch sử giao dịch</h3>
        <MiniTable rows={[["PT001", "Thu hợp đồng Golf Teetime - VIP", "15.000.000 VND"], ["PT002", "Thu vé lẻ Line tập", "650.000 VND"], ["CN001", "Công nợ còn lại", "1.500.000 VND"]]} />
      </section>
    );
  }

  if (activeTab === "Lịch sử checkin") {
    return (
      <section className={styles.detailCard}>
        <h3>Lịch sử check-in</h3>
        <div className={styles.chartBars}>{[42, 56, 38, 70, 64, 82].map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}</div>
        <MiniTable rows={[["7/4/2026", "Golf Teetime", "08:00 - 10:00"], ["5/4/2026", "Golf Line Tập", "16:00 - 17:00"]]} />
      </section>
    );
  }

  if (activeTab === "Kết quả tập luyện") {
    return <TrainingResultsTab />;
  }

  if (activeTab === "Inbody") {
    return <InbodyTab />;
  }

  if (activeTab === "Meal Plan") {
    return (
      <section className={styles.detailCard}>
        <h3>Meal Plan <button className={styles.blueButton} type="button"><Plus size={16} />Thêm kế hoạch</button></h3>
        <div className={styles.detailTwo}>
          <InfoBlock label="Kế hoạch">Giảm mỡ - Tăng cơ</InfoBlock>
          <InfoBlock label="Mục tiêu ngày">2,100 kcal · 130g protein</InfoBlock>
        </div>
        <MiniTable rows={[["07:00", "Bữa sáng", "450 kcal · 32g protein"], ["10:00", "Bữa phụ", "220 kcal · 18g protein"], ["12:30", "Bữa trưa", "620 kcal · 42g protein"]]} />
      </section>
    );
  }

  if (activeTab === "Thông tin TA") {
    return <TaTab />;
  }

  return <BasicInfoTab />;
}

function TrainingResultsTab() {
  const sessions: Array<{ date: string; weekday: string; session: string; pkg: string; coach: string; ta: string; content: string; homework: string; note: string }> = [
    { date: "24/04/2026", weekday: "Thứ 5", session: "Buổi 5", pkg: "Gói Golf Swing 3 tháng", coach: "HLV Minh", ta: "TA Hoàng Nam", content: "Swing cơ bản, chỉnh tư thế stance", homework: "Tập chipping 30 phút/ngày", note: "Tiến bộ rõ rệt ở pitch shot" },
    { date: "18/04/2026", weekday: "Thứ 6", session: "Buổi 4", pkg: "Gói Golf Swing 3 tháng", coach: "HLV Minh", ta: "TA Hoàng Nam", content: "Putting và short game", homework: "30 cú putt 2m mỗi ngày", note: "Cần cải thiện grip" },
    { date: "11/04/2026", weekday: "Thứ 6", session: "Buổi 3", pkg: "Gói Golf Swing 3 tháng", coach: "HLV An", ta: "—", content: "Driver 200y - line drill", homework: "Đo carry 50 swing", note: "—" },
  ];
  return (
    <section className={styles.detailCard}>
      <h3>Kết quả tập luyện <button className={styles.blueButton} type="button"><Plus size={16} />Thêm kết quả</button></h3>
      <div className={styles.statsGrid}>
        <SimpleMetric label="Điểm TB" value="82" />
        <SimpleMetric label="Handicap WHS" value="18.4" />
        <SimpleMetric label="Tổng buổi" value="24" />
        <SimpleMetric label="Giờ tập" value="36h" />
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ngày kiểm tra</th>
              <th>Buổi</th>
              <th>Gói tập</th>
              <th>HLV / Trợ giảng</th>
              <th>Nội dung</th>
              <th>BTVN</th>
              <th>Ghi chú</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.date}>
                <td><strong>{s.date}</strong><div className={styles.cellMuted}>{s.weekday}</div></td>
                <td><span className={styles.sessionBadge}>{s.session}</span></td>
                <td>{s.pkg}</td>
                <td><strong>{s.coach}</strong><div className={styles.cellMuted}>{s.ta}</div></td>
                <td className={styles.cellTruncate}>{s.content}</td>
                <td className={styles.cellTruncate}>{s.homework}</td>
                <td className={styles.cellTruncate}>{s.note}</td>
                <td className={styles.rowActions}>
                  <button type="button"><Edit size={14} /></button>
                  <button type="button"><X size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function InbodyTab() {
  const metrics: Array<{ label: string; value: string; trend?: string }> = [
    { label: "Cân nặng", value: "65 kg", trend: "−1.2 kg" },
    { label: "Chiều cao", value: "1.70 m" },
    { label: "Cơ xương", value: "31.2 kg", trend: "+0.4 kg" },
    { label: "Mỡ cơ thể", value: "18 %", trend: "−0.6 %" },
    { label: "BMI", value: "22.4", trend: "Bình thường" },
    { label: "Carry (Driver)", value: "168 yards", trend: "+4 yards" },
    { label: "Total (Driver)", value: "212 yards" },
    { label: "Angle Attack", value: "−3.2 °" },
    { label: "Spin Rate", value: "2,450 rpm" },
  ];
  return (
    <section className={styles.detailCard}>
      <h3>Inbody · 9 chỉ số <button className={styles.blueButton} type="button"><Plus size={16} />Thêm Inbody</button></h3>
      <div className={styles.inbodyGrid}>
        {metrics.map((m) => (
          <article className={styles.inbodyCard} key={m.label}>
            <span>{m.label}</span>
            <strong>{m.value}</strong>
            {m.trend ? <small>{m.trend}</small> : null}
          </article>
        ))}
      </div>
      <div className={styles.detailTwo}>
        <article className={styles.chartCard}>
          <h4>Radar 5 chiều</h4>
          <div className={styles.radarPlaceholder}>★ Carry · Total · Spin · Angle · Path</div>
        </article>
        <article className={styles.chartCard}>
          <h4>Lịch sử cân nặng</h4>
          <div className={styles.chartBars}>{[58, 60, 62, 64, 66, 65, 65].map((h, i) => <span key={i} style={{ height: `${h}%` }} />)}</div>
        </article>
      </div>
    </section>
  );
}

function TaTab() {
  const tas: Array<{ code: string; name: string; phone: string; email: string; course: string; schedule: string; note: string; status: "active" | "off" }> = [
    { code: "NV-0012", name: "Lê Minh Anh", phone: "0923456712", email: "leminhanh@epga.vn", course: "Golf Swing 3 tháng", schedule: "T2-T4-T6 · 07:00-09:00", note: "Hỗ trợ swing — KH tiến bộ", status: "active" },
    { code: "NV-0027", name: "Phạm Hoàng Nam", phone: "0901224578", email: "phnam@epga.vn", course: "Short Game Premium", schedule: "Cuối tuần · 08:00-10:00", note: "Chuyên short game", status: "active" },
    { code: "NV-0033", name: "Trần Quốc Bảo", phone: "0987654312", email: "tqbao@epga.vn", course: "Driving Range", schedule: "T3-T5 · 17:30-19:00", note: "Đã nghỉ việc", status: "off" },
  ];
  return (
    <section className={styles.detailCard}>
      <h3>
        <span className={styles.taBadge}>{tas.filter((t) => t.status === "active").length} TA đang phụ trách</span>
        <button className={styles.greenButton} type="button"><Plus size={16} />Gán TA mới</button>
      </h3>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên TA</th>
              <th>Mã NV</th>
              <th>Liên hệ</th>
              <th>Khoá học</th>
              <th>Lịch làm việc</th>
              <th>Ghi chú</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {tas.map((t) => (
              <tr key={t.code}>
                <td>
                  <div className={styles.taName}>
                    <span>{t.name.charAt(0)}</span>
                    <strong>{t.name}</strong>
                    {t.status === "off" ? <span className={styles.taOff}>Đã nghỉ việc</span> : null}
                  </div>
                </td>
                <td className={styles.cellMuted}>{t.code}</td>
                <td>{t.phone}<div className={styles.cellMuted}>{t.email}</div></td>
                <td>{t.course}</td>
                <td>{t.schedule}</td>
                <td className={styles.cellTruncate}>{t.note}</td>
                <td className={styles.rowActions}>
                  <button type="button"><Edit size={14} /></button>
                  <button type="button"><X size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function BasicInfoTab() {
  return (
    <>
      <section className={styles.detailCard}>
        <h3>Trạng thái & Thẻ</h3>
        <div className={styles.detailThree}>
          <InfoBlock label="Trạng thái"><CustomerStatus status="Hết hạn" /></InfoBlock>
          <InfoBlock label="Thẻ hội viên"><div className={styles.cardDots}><span className={styles.greenDot} /><span className={styles.redDot} /></div></InfoBlock>
          <InfoBlock label="Sinh trắc học"><BiometricBadges /></InfoBlock>
        </div>
      </section>

      <section className={styles.detailCard}>
        <h3>Thông tin cá nhân</h3>
        <div className={styles.infoGrid}>
          <InfoLine icon={User} label="Họ và tên" value="Nguyễn Văn A" />
          <InfoLine icon={Phone} label="Số điện thoại" value="0901234567" />
          <InfoLine icon={Mail} label="Email" value="nguyenvana@gmail.com" />
          <InfoLine icon={User} label="Giới tính" value="Nam" />
          <InfoLine icon={Calendar} label="Ngày sinh" value="15/5/1990" />
        </div>
      </section>

      <div className={styles.detailTwo}>
        <section className={styles.detailCard}>
          <h3>Thông tin hợp đồng</h3>
          <InfoLine icon={Calendar} label="Ngày đăng ký" value="15/1/2024" />
          <InfoLine icon={Calendar} label="Ngày hết hạn" value="15/7/2024" danger />
        </section>
        <section className={styles.detailCard}>
          <h3>Tài chính</h3>
          <InfoLine icon={DollarSign} label="Công nợ" value="1.500.000 VND" danger />
        </section>
      </div>

      <section className={styles.detailCard}>
        <h3>Người đi cùng <button className={styles.greenButton} type="button"><UserPlus size={16} />Thêm người đi cùng</button></h3>
        {["Nguyễn Văn B · Vợ/Chồng · 0912345678 · 20/6/1992", "Nguyễn Văn C · Con · 0923456789 · 15/8/2010"].map((item) => (
          <div className={styles.companionRow} key={item}>
            <span>N</span>
            <strong>{item}</strong>
            <div><button type="button"><Edit size={16} /></button><button type="button"><X size={16} /></button></div>
          </div>
        ))}
      </section>
    </>
  );
}

function ContractsTab() {
  return (
    <section className={styles.detailCard}>
      <h3>Danh sách hợp đồng <button className={styles.blueButton} type="button"><Plus size={16} />Thêm hợp đồng</button></h3>
      {[
        ["Golf Teetime - VIP", "Hết hạn", "HD001", "15/1/2024", "15/7/2024", "15,000,000 VND"],
        ["Golf Practice - Premium", "Còn hạn", "HD002", "1/2/2024", "31/12/2026", "25,000,000 VND"],
      ].map(([name, status, code, start, end, value]) => (
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
          <button type="button">Xem chi tiết</button>
        </article>
      ))}
    </section>
  );
}

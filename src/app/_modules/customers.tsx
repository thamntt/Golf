"use client";

import { useState, type FormEvent } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Download,
  Edit,
  Filter,
  Mail,
  Phone,
  Plus,
  Search,
  Settings,
  Trash2,
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
  SelectField,
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
          <button onClick={onClose} type="button">Hủy bỏ</button>
          <button className={styles.greenButton} onClick={onClose} type="button">
            <Plus size={16} />Thêm người đi cùng
          </button>
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
  const tabs = ["Thông tin cơ bản", "Hợp đồng", "Lịch sử giao dịch", "Lịch sử checkin", "Kết quả tập luyện", "Inbody", "Meal Plan", "Trợ giảng TA", "Profile"];

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

        <div className={styles.detailBody} key={activeTab}>
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
    return <TransactionsTab />;
  }

  if (activeTab === "Lịch sử checkin") {
    return <CheckinHistoryTab />;
  }

  if (activeTab === "Kết quả tập luyện") {
    return <TrainingResultsTab />;
  }

  if (activeTab === "Inbody") {
    return <InbodyTab />;
  }

  if (activeTab === "Meal Plan") {
    return <MealPlanTab />;
  }

  if (activeTab === "Trợ giảng TA") {
    return <TaTab />;
  }

  if (activeTab === "Profile") {
    return <ProfilesTab />;
  }

  return <BasicInfoTab />;
}

function TrainingResultsTab() {
  const [addOpen, setAddOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sessions, setSessions] = useState<Array<{ name: string; pkg: string; tier: string; date: string; coach: string; ta: string; session: string; content: string; contentSub: string; drill: string; drillSub: string; note: string }>>([
    {
      name: "Nguyễn Văn An",
      pkg: "Eagle",
      tier: "Premium",
      date: "15/05/2024",
      coach: "Trần Quốc Toàn",
      ta: "Lê Minh",
      session: "Buổi 1",
      content: "Swing & Driver",
      contentSub: "Chỉnh sửa tư thế & tốc độ",
      drill: "Swing & Driver",
      drillSub: "Chỉnh sửa tư thế & tốc độ",
      note: "Tốc độ đầu gậy cải thiện 15% so với tháng trước.",
    },
  ]);

  const handleSave = (entry: typeof sessions[number]) => {
    setSessions((current) => [entry, ...current]);
    setAddOpen(false);
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
                  <td>{s.ta}</td>
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
                </tr>
              ))}
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
      {addOpen ? <AddTrainingResultModal onClose={() => setAddOpen(false)} onSave={handleSave} /> : null}
    </>
  );
}

function AddTrainingResultModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (entry: { name: string; pkg: string; tier: string; date: string; coach: string; ta: string; session: string; content: string; contentSub: string; drill: string; drillSub: string; note: string }) => void;
}) {
  const [form, setForm] = useState({
    name: "Nguyễn Văn Minh",
    pkg: "",
    date: "2026-05-05",
    session: "Buổi 1",
    coach: "",
    ta: "",
    content: "",
    drill: "",
    note: "",
  });
  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = () => {
    if (!form.pkg || !form.coach || !form.content.trim()) return;
    onSave({
      name: form.name,
      pkg: form.pkg.split(" ")[0] || "Eagle",
      tier: form.pkg.split(" ").slice(1).join(" ") || "Premium",
      date: form.date.split("-").reverse().join("/"),
      coach: form.coach,
      ta: form.ta || "—",
      session: form.session,
      content: form.content.split("\n")[0] || form.content,
      contentSub: form.content.split("\n").slice(1).join(" "),
      drill: form.drill.split("\n")[0] || form.drill || "—",
      drillSub: form.drill.split("\n").slice(1).join(" "),
      note: form.note || "—",
    });
  };

  return (
    <div className={styles.nestedOverlay}>
      <section className={styles.miniModal}>
        <header className={styles.miniHeader}>
          <h2>Thêm kết quả tập luyện</h2>
          <button onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <div className={styles.miniBody}>
          <div className={styles.miniGrid}>
            <label>
              <span>Tên KH</span>
              <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Nguyễn Văn Minh" />
            </label>
            <label>
              <span>Nội dung buổi học <b>*</b></span>
              <textarea
                onChange={(e) => update("content", e.target.value)}
                placeholder="Nhập thông tin..."
                rows={3}
                value={form.content}
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
              <textarea
                onChange={(e) => update("drill", e.target.value)}
                placeholder="Nhập gợi ý bài tập..."
                rows={3}
                value={form.drill}
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
              <select className={styles.selectInput} value={form.ta} onChange={(e) => update("ta", e.target.value)}>
                <option value="">Chọn trợ giảng</option>
                <option>Lê Minh</option>
                <option>Phạm Hoàng Nam</option>
              </select>
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
              <button className={styles.outlineButton} onClick={() => alert("Mở biểu đồ Inbody (radar + line chart)...")} type="button">
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
                      <button className={styles.linkButton} onClick={() => alert("Mở ảnh Trackman...")} type="button">
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
          <button className={styles.outlineButton} onClick={() => alert("Mở dialog tải ảnh Trackman (JPG/PNG, max 5MB)")} type="button">
            <UploadCloud size={16} /> Chọn ảnh Trackman
          </button>
        </div>
        <footer className={styles.measureFooter}>
          <button onClick={onClose} type="button"><X size={14} /> Đóng</button>
          <button className={styles.greenButton} onClick={submit} type="button">
            Lưu dữ liệu
          </button>
        </footer>
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

function TaTab() {
  const [tas, setTas] = useState<TaEntry[]>([
    { code: "NV-0012", name: "Nguyễn Văn An", phone: "0901234567", email: "an.nguyen@example.com", course: "", schedule: "T2-T4-T6 · 07:00-09:00", note: "Nhiệt tình, có kinh nghiệm hỗ trợ học viên" },
    { code: "NV-0034", name: "Trần Thị Bình", phone: "0912345678", email: "binh.tran@example.com", course: "", schedule: "T3-T5-T7 · 14:00-16:00", note: "Chuyên môn React, hỗ trợ tốt các dự án thực tế" },
  ]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const addTa = (entry: TaEntry) => {
    setTas((current) => [...current, entry]);
    setAssignOpen(false);
  };
  const updateTa = (index: number, patch: Partial<TaEntry>) => {
    setTas((current) => current.map((t, i) => (i === index ? { ...t, ...patch } : t)));
    setEditIndex(null);
  };
  const removeTa = (index: number) => {
    if (confirm(`Bạn có chắc chắn muốn gỡ ${tas[index].name} khỏi khách hàng này?\n\nThao tác này chỉ xóa quan hệ, không xóa hồ sơ nhân viên.`)) {
      setTas((current) => current.filter((_, i) => i !== index));
    }
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
  };

  const submit = () => {
    if (!selectedTa) {
      alert("Vui lòng chọn Trợ giảng từ danh sách.");
      return;
    }
    if (!course) {
      alert("Vui lòng chọn khoá học phụ trách.");
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

function BasicInfoTab() {
  const [companionOpen, setCompanionOpen] = useState(false);
  const [companions, setCompanions] = useState([
    { name: "Nguyễn Văn B", relation: "Vợ/Chồng", phone: "0912345678", birth: "20/6/1992" },
    { name: "Nguyễn Văn C", relation: "Con", phone: "0923456789", birth: "15/8/2010" },
  ]);

  const removeCompanion = (index: number) =>
    setCompanions((current) => current.filter((_, i) => i !== index));

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
        <h3>Thông tin quản lý</h3>
        <div className={styles.mgmtGrid}>
          <InfoBlock label="Ngày tạo">10/1/2024</InfoBlock>
          <InfoBlock label="Người tạo">Admin</InfoBlock>
          <InfoBlock label="Nhóm khách hàng"><span className={styles.mgmtMuted}>---</span></InfoBlock>
          <InfoBlock label="Nguồn khách hàng"><span className={styles.mgmtMuted}>---</span></InfoBlock>
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
  return (
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
          <button type="button" onClick={() => alert(`Xem chi tiết hợp đồng ${code}`)}>Xem chi tiết</button>
        </article>
      ))}
    </section>
  );
}

function TransactionsTab() {
  const txs: Array<{ code: string; date: string; type: string; amount: string; method: string; status: "Hoàn thành" | "Đang xử lý" }> = [
    { code: "GD001", date: "15/3/2026", type: "Thanh toán hợp đồng", amount: "15,000,000 VND", method: "Chuyển khoản", status: "Hoàn thành" },
    { code: "GD002", date: "10/3/2026", type: "Booking Teetime", amount: "500,000 VND", method: "Tiền mặt", status: "Hoàn thành" },
    { code: "GD003", date: "5/3/2026", type: "Thanh toán công nợ", amount: "1,500,000 VND", method: "Momo", status: "Đang xử lý" },
  ];
  return (
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
                <td><button className={styles.linkButton} type="button" onClick={() => alert(`Chi tiết giao dịch ${t.code}`)}>{t.code}</button></td>
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
                  <button className={styles.outlineButton} onClick={() => alert(`Chi tiết giao dịch ${t.code}`)} type="button">
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
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

  const handleDelete = () => {
    if (confirm("Bạn có chắc muốn xóa Meal Plan này?")) setPlan(null);
  };

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
      alert("Tên kế hoạch, ngày bắt đầu và ngày kết thúc là bắt buộc.");
      return;
    }
    if (form.meals.length === 0 || form.meals.some((m) => m.items.filter((i) => i.trim()).length === 0)) {
      alert("Mỗi bữa ăn phải có ít nhất 1 món ăn.");
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
  courseCount: "5",
  coachEpga: "Nguyễn Văn A",
  coachOther: "Trần Thị B",
  name: "quyet test addr 2",
  gender: "nam_",
  dob: "-",
  phone: "-",
  email: "-",
  level: "Beginner",
  handicap: "5",
  golfStartTime: "20/05/2026",
  playingGoal: "Vui",
  handedness: "Trái",
  otherSports: "Bơi lội",
  clubs: "Vip",
  coachFreq: "2",
  selfFreq: "1",
  fitness: 4,
  healthNotes: "đứt dây chằng",
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

function ProfilesTab() {
  const [showModal, setShowModal] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(DEFAULT_PROFILE);
  const [activeStep, setActiveStep] = useState<1 | 2>(1);

  const handleSave = (next: Profile) => {
    setProfile(next);
    setShowModal(false);
  };

  const handleDelete = () => {
    if (confirm("Bạn có chắc muốn xóa profile này?")) setProfile(null);
  };

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
  const update = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = () => {
    if (!form.name.trim()) {
      alert("Họ và tên là bắt buộc.");
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

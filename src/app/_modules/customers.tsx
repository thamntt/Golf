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
  SimpleMetric,
} from "../_shared/components";
import { customerRows } from "../_shared/data";
import type { Customer } from "../_shared/types";

export default function CustomersScreen() {
  const [addOpen, setAddOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState("Thông tin cơ bản");
  const [nestedModal, setNestedModal] = useState<"group" | "companion" | null>(null);
  const [rows, setRows] = useState(customerRows);
  const [query, setQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState("Tất cả");
  const [filterOpen, setFilterOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [activeAdvancedFilter, setActiveAdvancedFilter] = useState<string | null>(null);

  const quickFilters = ["Tất cả", "Còn hạn", "Hết hạn", "Sắp hết hạn", "Chưa đăng ký"];
  const filteredRows = rows.filter((customer) => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery = normalizedQuery
      ? [customer.code, customer.name, customer.phone, customer.email, customer.creator]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      : true;
    const matchesQuickFilter = quickFilter === "Tất cả" ? true : customer.status === quickFilter;
    const matchesAdvancedFilter = activeAdvancedFilter ? customer.status === activeAdvancedFilter : true;
    return matchesQuery && matchesQuickFilter && matchesAdvancedFilter;
  });

  const handleCreateCustomer = (customer: Customer) => {
    setRows((current) => [customer, ...current]);
    setQuickFilter("Tất cả");
    setActiveAdvancedFilter(null);
  };

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
            <button className={styles.greenButton} onClick={() => setExportOpen((value) => !value)} type="button">
              <Download size={18} />
              Nhập xuất
              <ChevronDown size={16} />
            </button>
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
            <h3>Bộ lọc nâng cao</h3>
            <div className={styles.advancedGrid}>
              <label>Ngày hết hạn<select><option>Toàn thời gian</option><option>Lựa chọn khác</option></select></label>
              <label>Ngày sinh<select><option>Toàn thời gian</option><option>Trong tháng này</option></select></label>
              <label>Ngày đăng ký<select><option>30 ngày gần đây</option><option>Quý này</option></select></label>
              <label>Giới tính<select><option>Tất cả</option><option>Nam</option><option>Nữ</option></select></label>
              <label>Nhóm khách hàng<select><option>Tất cả</option><option>VIP</option><option>Premium</option><option>Standard</option></select></label>
              <label>
                Trạng thái
                <select onChange={(event) => setActiveAdvancedFilter(event.target.value || null)} value={activeAdvancedFilter ?? ""}>
                  <option value="">Tất cả</option>
                  <option>Còn hạn</option>
                  <option>Hết hạn</option>
                  <option>Chưa đăng ký</option>
                </select>
              </label>
              <label>Sinh trắc học<select><option>Có</option><option>Chưa</option><option>Face</option><option>Vân tay</option><option>Thẻ</option></select></label>
              <label>Nhân viên phụ trách<select><option>Tất cả</option><option>Admin</option><option>Nguyễn Văn Thành</option><option>Lê Thị Mai</option></select></label>
            </div>
            <footer>
              <button onClick={() => { setActiveAdvancedFilter(null); setQuickFilter("Tất cả"); }} type="button">Xóa bộ lọc</button>
              <button className={styles.blueButton} onClick={() => setFilterOpen(false)} type="button">Áp dụng lọc</button>
            </footer>
          </section>
        ) : null}

        {settingsOpen ? (
          <section className={styles.advancedPanel}>
            <h3>Cài đặt cột hiển thị</h3>
            <div className={styles.columnGrid}>
              {["Mã HV", "Họ và tên", "Số điện thoại", "Email", "Sinh trắc học", "Trạng thái", "Thẻ", "Công nợ"].map((column) => (
                <label key={column}><input defaultChecked type="checkbox" /> {column}</label>
              ))}
            </div>
          </section>
        ) : null}

        {exportOpen ? (
          <section className={styles.exportMenu}>
            <button type="button"><Upload size={16} /> Nhập Excel</button>
            <button type="button"><Download size={16} /> Xuất Excel</button>
            <button type="button">Tải file mẫu import</button>
          </section>
        ) : null}

        <section className={styles.memberTableCard}>
          <div className={styles.memberTableWrap}>
            <table className={styles.memberTable}>
              <thead>
                <tr>
                  <th>Mã HV</th>
                  <th>Họ và tên</th>
                  <th>Số điện thoại</th>
                  <th>Email</th>
                  <th>Giới tính</th>
                  <th>Ngày sinh</th>
                  <th>Sinh trắc học</th>
                  <th>Trạng thái</th>
                  <th>Thẻ</th>
                  <th>Nhóm KH</th>
                  <th>Nguồn KH</th>
                  <th>Ngày đăng ký</th>
                  <th>Ngày hết hạn</th>
                  <th>Ngày tạo</th>
                  <th>Người tạo</th>
                  <th>Công nợ</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((customer) => (
                  <tr key={customer.code}>
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
                    <td className={styles.memberName}>{customer.name}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.email}</td>
                    <td>{customer.gender}</td>
                    <td>{customer.birth}</td>
                    <td><BiometricBadges /></td>
                    <td><CustomerStatus status={customer.status} /></td>
                    <td>
                      <div className={styles.cardDots}>
                        {customer.cards.map((card, index) => (
                          <span className={styles[`${card}Dot`]} key={`${customer.code}-${card}-${index}`} />
                        ))}
                        <button type="button">+</button>
                      </div>
                    </td>
                    <td className={styles.mutedCell}>---</td>
                    <td className={styles.mutedCell}>---</td>
                    <td className={customer.registerDate === "---" ? styles.mutedCell : styles.dateGreen}>{customer.registerDate}</td>
                    <td className={customer.endDate === "---" ? styles.mutedCell : styles.dateRed}>{customer.endDate}</td>
                    <td className={styles.dateGreen}>{customer.createdDate}</td>
                    <td>{customer.creator}</td>
                    <td>{customer.debt}</td>
                  </tr>
                ))}
                {filteredRows.length === 0 ? (
                  <tr>
                    <td className={styles.emptyTableCell} colSpan={16}>
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
  nestedModal: "group" | "companion" | null;
  onCreate: (customer: Customer) => void;
  onClose: () => void;
  onOpenNested: (modal: "group" | "companion") => void;
}) {
  const [error, setError] = useState("");

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
            <FormField label="Nhân viên phụ trách" />
            <FormField label="Thẻ khách hàng" placeholder="Nhập số thẻ" />
            <FormField
              action="Thêm mới"
              label="Nhóm khách hàng"
              onAction={() => onOpenNested("group")}
            />
          </div>
          <FormField area label="Ghi chú" placeholder="Nhập ghi chú về khách hàng..." />
          <FormField
            action="Thêm mới"
            label="Nguồn khách hàng"
          />

          <div className={styles.formDivider} />
          <div className={styles.customFieldRow}>
            <strong>Trường tùy chỉnh (0)</strong>
            <button type="button">Quản lý trường</button>
            <p>Chưa có trường tùy chỉnh nào được thêm</p>
          </div>

          <div className={styles.formDivider} />
          <button className={styles.collapseButton} type="button">⌃ Ẩn bớt</button>

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
          <FormField required label="Tên nhóm" placeholder="Nhập tên nhóm khách hàng" />
          <FormField label="Mô tả" placeholder="Nhập mô tả" />
        </div>
        <footer>
          <button onClick={onClose} type="button">Hủy bỏ</button>
          <button className={styles.blueButton} type="button">Thêm</button>
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
    return (
      <section className={styles.detailCard}>
        <h3>Kết quả tập luyện <button className={styles.blueButton} type="button"><Plus size={16} />Thêm kết quả</button></h3>
        <div className={styles.statsGrid}>
          <SimpleMetric label="Điểm TB" value="82" />
          <SimpleMetric label="Handicap WHS" value="18.4" />
          <SimpleMetric label="Tổng buổi" value="24" />
          <SimpleMetric label="Giờ tập" value="36h" />
        </div>
        <MiniTable rows={[["24/04/2026 · Thứ 5", "Buổi 5", "Swing cơ bản · HLV Minh"], ["18/04/2026 · Thứ 6", "Buổi 4", "Putting và short game"]]} />
      </section>
    );
  }

  if (activeTab === "Inbody") {
    return (
      <section className={styles.detailCard}>
        <h3>Inbody <button className={styles.blueButton} type="button"><Plus size={16} />Thêm</button></h3>
        <div className={styles.detailThree}>
          {["Cân nặng 65kg", "Cơ xương 31.2kg", "Mỡ cơ thể 18%", "BMI 22.4", "Carry 168 yards", "Spin Rate 2,450rpm"].map((item) => (
            <InfoBlock key={item} label={item.split(" ")[0]}>{item.replace(item.split(" ")[0], "").trim()}</InfoBlock>
          ))}
        </div>
      </section>
    );
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
    return (
      <section className={styles.detailCard}>
        <h3>Thông tin TA <button className={styles.greenButton} type="button"><Plus size={16} />Gán TA mới</button></h3>
        <MiniTable rows={[["TA001", "Lê Minh Anh", "Thứ 2-4-6 · 17:30", "Ghi chú: hỗ trợ swing"], ["TA002", "Phạm Hoàng Nam", "Cuối tuần · 08:00", "Hỗ trợ short game"]]} />
      </section>
    );
  }

  return <BasicInfoTab />;
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

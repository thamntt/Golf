"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  BadgeDollarSign,
  Banknote,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Edit3,
  Eye,
  FileText,
  Filter,
  Printer,
  ReceiptText,
  Search,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import styles from "../page.module.css";
import { Screen } from "../_shared/components";

type CashTab = "receipt" | "payment" | "debt";
type PaymentMethod = "Tiền mặt" | "Chuyển khoản" | "POS-Thẻ" | "MoMo" | "ZaloPay" | "Tiền gửi";
type ReceiptType = "Thanh toán HĐ" | "Công nợ" | "Phiếu thu khác" | "Thu Thẻ" | "Khách đặt cọc" | "Vé lẻ";
type PaymentType = "Hoa hồng" | "Hoàn tiền" | "Lương / thưởng" | "Mua hàng" | "Điện nước" | "Chi khác";
type VoucherStatus = "Hoàn tất" | "Chờ duyệt" | "Đã hủy";

type Receipt = {
  id: string;
  customerCode: string;
  customerName: string;
  phone: string;
  identityNo: string;
  reason: string;
  contractCode: string;
  service: string;
  branch: string;
  cashier: string;
  method: PaymentMethod;
  type: ReceiptType;
  amount: number;
  paid: number;
  date: string;
  status: VoucherStatus;
  source: "Tự sinh" | "Thủ công";
  note: string;
};

type PaymentVoucher = {
  id: string;
  receiver: string;
  branch: string;
  staff: string;
  method: PaymentMethod;
  type: PaymentType;
  amount: number;
  date: string;
  status: VoucherStatus;
  reason: string;
  note: string;
};

type DebtRow = {
  id: string;
  customerCode: string;
  customerName: string;
  phone: string;
  contractCode: string;
  branch: string;
  total: number;
  paid: number;
  dueDate: string;
  owner: string;
};

const BRANCHES = ["NextVision", "Hà Nội Center", "Sài Gòn West"];
const STAFF = ["Admin", "Nguyễn Văn A", "Lê Văn C", "Trần Thị B", "Kế toán CN"];
const METHODS: PaymentMethod[] = ["Tiền mặt", "Chuyển khoản", "POS-Thẻ", "MoMo", "ZaloPay", "Tiền gửi"];
const RECEIPT_TYPES: ReceiptType[] = ["Thanh toán HĐ", "Công nợ", "Phiếu thu khác", "Thu Thẻ", "Khách đặt cọc", "Vé lẻ"];
const PAYMENT_TYPES: PaymentType[] = ["Hoa hồng", "Hoàn tiền", "Lương / thưởng", "Mua hàng", "Điện nước", "Chi khác"];

const receiptsSeed: Receipt[] = [
  {
    id: "PT-2404-0001",
    customerCode: "HV001",
    customerName: "Nguyễn Văn A",
    phone: "0901234567",
    identityNo: "001234567890",
    reason: "Thanh toán hợp đồng CT-2026-001",
    contractCode: "CT-2026-001",
    service: "Gói tập Premium 6 tháng",
    branch: "NextVision",
    cashier: "Admin",
    method: "Chuyển khoản",
    type: "Thanh toán HĐ",
    amount: 12_500_000,
    paid: 12_500_000,
    date: "2026-04-07",
    status: "Hoàn tất",
    source: "Tự sinh",
    note: "Auto sinh từ Module Hợp đồng.",
  },
  {
    id: "PT-2404-0002",
    customerCode: "VL001",
    customerName: "Khách vãng lai",
    phone: "0912000111",
    identityNo: "",
    reason: "Vé lẻ Golf Line Tập",
    contractCode: "",
    service: "Line 05 · 2 giờ + nước uống",
    branch: "NextVision",
    cashier: "Lễ tân 01",
    method: "Tiền mặt",
    type: "Vé lẻ",
    amount: 650_000,
    paid: 650_000,
    date: "2026-04-07",
    status: "Hoàn tất",
    source: "Tự sinh",
    note: "Auto sinh khi vé lẻ confirmed.",
  },
  {
    id: "PT-2404-0003",
    customerCode: "HV007",
    customerName: "Vũ Hồng Nhất",
    phone: "0510086770",
    identityNo: "044556677889",
    reason: "Thu công nợ còn lại",
    contractCode: "CT-2026-018",
    service: "Gói lớp nhóm Short Game",
    branch: "Hà Nội Center",
    cashier: "Kế toán CN",
    method: "POS-Thẻ",
    type: "Công nợ",
    amount: 3_200_000,
    paid: 1_700_000,
    date: "2026-04-08",
    status: "Hoàn tất",
    source: "Thủ công",
    note: "Cho phép công nợ theo BR-M8-14.",
  },
];

const paymentsSeed: PaymentVoucher[] = [
  {
    id: "PC-2404-0001",
    receiver: "HLV Nguyễn Văn A",
    branch: "NextVision",
    staff: "Kế toán CN",
    method: "Chuyển khoản",
    type: "Hoa hồng",
    amount: 1_200_000,
    date: "2026-04-07",
    status: "Hoàn tất",
    reason: "Chi hoa hồng dạy 1-1 tháng 04",
    note: "Auto sinh từ Module Hoa hồng sau khi duyệt chi.",
  },
  {
    id: "PC-2404-0002",
    receiver: "Công ty bảo trì sân",
    branch: "NextVision",
    staff: "Admin",
    method: "Chuyển khoản",
    type: "Mua hàng",
    amount: 2_100_000,
    date: "2026-04-08",
    status: "Chờ duyệt",
    reason: "Bảo trì máy phát bóng Line A",
    note: "Cần quản lý duyệt trước khi hạch toán.",
  },
];

const debtSeed: DebtRow[] = [
  { id: "D-001", customerCode: "HV003", customerName: "Lê Văn C", phone: "0923456789", contractCode: "CT-2026-009", branch: "NextVision", total: 9_800_000, paid: 5_000_000, dueDate: "2026-05-15", owner: "Lê Văn C" },
  { id: "D-002", customerCode: "HV007", customerName: "Vũ Hồng Nhất", phone: "0510086770", contractCode: "CT-2026-018", branch: "Hà Nội Center", total: 3_200_000, paid: 1_700_000, dueDate: "2026-04-30", owner: "Nguyễn Văn A" },
  { id: "D-003", customerCode: "HV010", customerName: "Bùi Trung Đông", phone: "0910110527", contractCode: "CT-2026-022", branch: "Sài Gòn West", total: 6_500_000, paid: 2_000_000, dueDate: "2026-05-20", owner: "Trần Thị B" },
];

const formatCurrency = (value: number) => `${value.toLocaleString("vi-VN")} đ`;
const todayIso = () => new Date().toISOString().slice(0, 10);
const formatDate = (iso: string) => iso ? iso.split("-").reverse().join("/") : "—";

const nextCode = (prefix: "PT" | "PC", list: Array<{ id: string }>) => {
  const max = list.reduce((result, item) => {
    const numeric = Number(item.id.split("-").at(-1));
    return Number.isFinite(numeric) ? Math.max(result, numeric) : result;
  }, 0);
  return `${prefix}-2404-${String(max + 1).padStart(4, "0")}`;
};

export default function CashbookScreen() {
  const [tab, setTab] = useState<CashTab>("receipt");
  const [receipts, setReceipts] = useState<Receipt[]>(receiptsSeed);
  const [payments, setPayments] = useState<PaymentVoucher[]>(paymentsSeed);
  const [debts, setDebts] = useState<DebtRow[]>(debtSeed);
  const [query, setQuery] = useState("");
  const [branch, setBranch] = useState("Tất cả chi nhánh");
  const [method, setMethod] = useState("Tất cả PTTT");
  const [status, setStatus] = useState("Tất cả trạng thái");
  const [formOpen, setFormOpen] = useState<null | { type: "receipt"; initial?: Receipt } | { type: "payment"; initial?: PaymentVoucher }>(null);
  const [detail, setDetail] = useState<null | { type: "receipt"; item: Receipt } | { type: "payment"; item: PaymentVoucher }>(null);
  const [deleteTarget, setDeleteTarget] = useState<null | { type: "receipt"; item: Receipt } | { type: "payment"; item: PaymentVoucher }>(null);
  const [toast, setToast] = useState("");

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const filteredReceipts = useMemo(() => receipts.filter((item) => {
    const q = query.trim().toLowerCase();
    if (q && ![item.id, item.customerCode, item.customerName, item.phone, item.reason, item.contractCode].join(" ").toLowerCase().includes(q)) return false;
    if (branch !== "Tất cả chi nhánh" && item.branch !== branch) return false;
    if (method !== "Tất cả PTTT" && item.method !== method) return false;
    if (status !== "Tất cả trạng thái" && item.status !== status) return false;
    return true;
  }), [branch, method, query, receipts, status]);

  const filteredPayments = useMemo(() => payments.filter((item) => {
    const q = query.trim().toLowerCase();
    if (q && ![item.id, item.receiver, item.reason, item.staff].join(" ").toLowerCase().includes(q)) return false;
    if (branch !== "Tất cả chi nhánh" && item.branch !== branch) return false;
    if (method !== "Tất cả PTTT" && item.method !== method) return false;
    if (status !== "Tất cả trạng thái" && item.status !== status) return false;
    return true;
  }), [branch, method, payments, query, status]);

  const filteredDebts = useMemo(() => debts.filter((item) => {
    const q = query.trim().toLowerCase();
    if (q && ![item.customerCode, item.customerName, item.phone, item.contractCode].join(" ").toLowerCase().includes(q)) return false;
    if (branch !== "Tất cả chi nhánh" && item.branch !== branch) return false;
    return true;
  }), [branch, debts, query]);

  const stats = useMemo(() => {
    const income = receipts.filter((item) => item.status === "Hoàn tất").reduce((sum, item) => sum + item.paid, 0);
    const outcome = payments.filter((item) => item.status === "Hoàn tất").reduce((sum, item) => sum + item.amount, 0);
    const debt = debts.reduce((sum, item) => sum + Math.max(0, item.total - item.paid), 0);
    const pending = payments.filter((item) => item.status === "Chờ duyệt").length;
    return { income, outcome, debt, pending };
  }, [debts, payments, receipts]);

  const saveReceipt = (item: Receipt) => {
    setReceipts((current) => current.some((row) => row.id === item.id) ? current.map((row) => row.id === item.id ? item : row) : [item, ...current]);
    setFormOpen(null);
    flash(`${item.id} đã lưu`);
  };

  const savePayment = (item: PaymentVoucher) => {
    setPayments((current) => current.some((row) => row.id === item.id) ? current.map((row) => row.id === item.id ? item : row) : [item, ...current]);
    setFormOpen(null);
    flash(`${item.id} đã lưu`);
  };

  const collectDebt = (debt: DebtRow) => {
    const remaining = Math.max(0, debt.total - debt.paid);
    if (remaining <= 0) return;
    const receipt: Receipt = {
      id: nextCode("PT", receipts),
      customerCode: debt.customerCode,
      customerName: debt.customerName,
      phone: debt.phone,
      identityNo: "",
      reason: `Thu công nợ ${debt.contractCode}`,
      contractCode: debt.contractCode,
      service: "Thanh toán công nợ hợp đồng",
      branch: debt.branch,
      cashier: "Kế toán CN",
      method: "Tiền mặt",
      type: "Công nợ",
      amount: remaining,
      paid: remaining,
      date: todayIso(),
      status: "Hoàn tất",
      source: "Thủ công",
      note: "Tạo nhanh từ tab Công nợ.",
    };
    setReceipts((current) => [receipt, ...current]);
    setDebts((current) => current.map((row) => row.id === debt.id ? { ...row, paid: row.total } : row));
    setTab("receipt");
    flash(`Đã tạo ${receipt.id} từ công nợ ${debt.contractCode}`);
  };

  const deleteVoucher = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "receipt") setReceipts((current) => current.filter((item) => item.id !== deleteTarget.item.id));
    else setPayments((current) => current.filter((item) => item.id !== deleteTarget.item.id));
    flash(`Đã xóa ${deleteTarget.item.id}`);
    setDeleteTarget(null);
  };

  return (
    <>
      <Screen title="Sổ Quỹ" subtitle="Quản lý phiếu thu, phiếu chi, công nợ và chứng từ tự sinh từ hợp đồng / vé lẻ / hoa hồng">
        <div className={styles.cashbookHero}>
          <div>
            <span><Wallet size={15} /> Cash Control</span>
            <h3>Dòng tiền theo chi nhánh</h3>
            <p>Theo dõi thu - chi, công nợ và chứng từ tự sinh. Dữ liệu demo bám nghiệp vụ M10 trong SRS.</p>
          </div>
          <div className={styles.cashbookHeroActions}>
            <button onClick={() => setFormOpen({ type: "receipt" })} type="button"><ArrowDownCircle size={16} /> Phiếu thu</button>
            <button onClick={() => setFormOpen({ type: "payment" })} type="button"><ArrowUpCircle size={16} /> Phiếu chi</button>
          </div>
        </div>

        <div className={styles.contractKpi}>
          <CashKpi icon={ArrowDownCircle} label="Tổng thu" tone="green" value={formatCurrency(stats.income)} />
          <CashKpi icon={ArrowUpCircle} label="Tổng chi" tone="red" value={formatCurrency(stats.outcome)} />
          <CashKpi icon={BadgeDollarSign} label="Công nợ" tone="amber" value={formatCurrency(stats.debt)} />
          <CashKpi icon={ClipboardList} label="Chờ duyệt chi" tone="blue" value={String(stats.pending)} />
        </div>

        <div className={styles.cashbookTabs}>
          {[
            { key: "receipt", label: "Phiếu thu", icon: ArrowDownCircle },
            { key: "payment", label: "Phiếu chi", icon: ArrowUpCircle },
            { key: "debt", label: "Công nợ", icon: BadgeDollarSign },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button className={tab === item.key ? styles.cashbookTabActive : ""} key={item.key} onClick={() => setTab(item.key as CashTab)} type="button">
                <Icon size={16} /> {item.label}
              </button>
            );
          })}
        </div>

        <div className={styles.cashbookToolbar}>
          <div className={styles.cashbookSearch}>
            <Search size={18} />
            <input onChange={(event) => setQuery(event.target.value)} placeholder="Tìm mã phiếu, khách hàng, hợp đồng, nhân viên..." value={query} />
          </div>
          <span><Filter size={14} /> Bộ lọc</span>
          <select className={styles.selectInput} onChange={(e) => setBranch(e.target.value)} value={branch}>
            <option>Tất cả chi nhánh</option>
            {BRANCHES.map((item) => <option key={item}>{item}</option>)}
          </select>
          {tab !== "debt" ? (
            <>
              <select className={styles.selectInput} onChange={(e) => setMethod(e.target.value)} value={method}>
                <option>Tất cả PTTT</option>
                {METHODS.map((item) => <option key={item}>{item}</option>)}
              </select>
              <select className={styles.selectInput} onChange={(e) => setStatus(e.target.value)} value={status}>
                <option>Tất cả trạng thái</option>
                <option>Hoàn tất</option>
                <option>Chờ duyệt</option>
                <option>Đã hủy</option>
              </select>
            </>
          ) : null}
        </div>

        {tab === "receipt" ? (
          <ReceiptTable
            items={filteredReceipts}
            onDelete={(item) => setDeleteTarget({ type: "receipt", item })}
            onEdit={(item) => setFormOpen({ type: "receipt", initial: item })}
            onPrint={(item) => flash(`Đã gửi lệnh in ${item.id}`)}
            onView={(item) => setDetail({ type: "receipt", item })}
          />
        ) : null}

        {tab === "payment" ? (
          <PaymentTable
            items={filteredPayments}
            onDelete={(item) => setDeleteTarget({ type: "payment", item })}
            onEdit={(item) => setFormOpen({ type: "payment", initial: item })}
            onPrint={(item) => flash(`Đã gửi lệnh in ${item.id}`)}
            onView={(item) => setDetail({ type: "payment", item })}
          />
        ) : null}

        {tab === "debt" ? (
          <DebtTable items={filteredDebts} onCollect={collectDebt} />
        ) : null}
      </Screen>

      {formOpen?.type === "receipt" ? (
        <ReceiptForm
          initial={formOpen.initial}
          receipts={receipts}
          onClose={() => setFormOpen(null)}
          onSave={saveReceipt}
        />
      ) : null}
      {formOpen?.type === "payment" ? (
        <PaymentForm
          initial={formOpen.initial}
          payments={payments}
          onClose={() => setFormOpen(null)}
          onSave={savePayment}
        />
      ) : null}
      {detail ? <VoucherDetail detail={detail} onClose={() => setDetail(null)} onPrint={() => flash(`Đã gửi lệnh in ${detail.item.id}`)} /> : null}
      {deleteTarget ? <DeleteDialog item={deleteTarget.item} onCancel={() => setDeleteTarget(null)} onConfirm={deleteVoucher} /> : null}
      {toast ? <div className={styles.contractToast}>{toast}</div> : null}
    </>
  );
}

function CashKpi({ icon: Icon, label, tone, value }: { icon: LucideIcon; label: string; tone: "blue" | "green" | "amber" | "red"; value: string }) {
  return (
    <article className={`${styles.contractKpiCard} ${styles[`kpi_${tone}`]}`}>
      <span className={styles.contractKpiIcon}><Icon size={18} /></span>
      <div><span>{label}</span><strong>{value}</strong></div>
    </article>
  );
}

function ReceiptTable({ items, onDelete, onEdit, onPrint, onView }: { items: Receipt[]; onDelete: (item: Receipt) => void; onEdit: (item: Receipt) => void; onPrint: (item: Receipt) => void; onView: (item: Receipt) => void }) {
  return (
    <section className={styles.memberTableCard}>
      <div className={styles.memberTableWrap}>
        <table className={`${styles.memberTable} ${styles.cashbookTable}`}>
          <thead>
            <tr>
              <th>STT</th><th>Mã KH</th><th>Họ tên</th><th>SĐT</th><th>Mã phiếu thu</th><th>Số tiền</th><th>PTTT</th><th>Loại thu</th><th>Trạng thái</th><th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? <tr><td className={styles.emptyTableCell} colSpan={10}>Không có phiếu thu phù hợp.</td></tr> : null}
            {items.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td><span className={styles.cashbookCode}>{item.customerCode || "—"}</span></td>
                <td><strong>{item.customerName}</strong><small className={styles.cashbookSub}>{item.reason}</small></td>
                <td>{item.phone || "—"}</td>
                <td><button className={styles.cashbookLink} onClick={() => onView(item)} type="button">{item.id}</button></td>
                <td><strong className={styles.cashbookMoneyIn}>{formatCurrency(item.paid)}</strong></td>
                <td>{item.method}</td>
                <td><span className={styles.cashbookType}>{item.type}</span></td>
                <td><VoucherBadge status={item.status} /></td>
                <td><ActionButtons onDelete={() => onDelete(item)} onEdit={() => onEdit(item)} onPrint={() => onPrint(item)} onView={() => onView(item)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PaymentTable({ items, onDelete, onEdit, onPrint, onView }: { items: PaymentVoucher[]; onDelete: (item: PaymentVoucher) => void; onEdit: (item: PaymentVoucher) => void; onPrint: (item: PaymentVoucher) => void; onView: (item: PaymentVoucher) => void }) {
  return (
    <section className={styles.memberTableCard}>
      <div className={styles.memberTableWrap}>
        <table className={`${styles.memberTable} ${styles.cashbookTable}`}>
          <thead>
            <tr>
              <th>STT</th><th>Mã phiếu chi</th><th>Người/Đơn vị nhận</th><th>Số tiền</th><th>PTTT</th><th>Loại chi</th><th>Ngày chi</th><th>Trạng thái</th><th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? <tr><td className={styles.emptyTableCell} colSpan={9}>Không có phiếu chi phù hợp.</td></tr> : null}
            {items.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td><button className={styles.cashbookLink} onClick={() => onView(item)} type="button">{item.id}</button></td>
                <td><strong>{item.receiver}</strong><small className={styles.cashbookSub}>{item.reason}</small></td>
                <td><strong className={styles.cashbookMoneyOut}>{formatCurrency(item.amount)}</strong></td>
                <td>{item.method}</td>
                <td><span className={styles.cashbookType}>{item.type}</span></td>
                <td>{formatDate(item.date)}</td>
                <td><VoucherBadge status={item.status} /></td>
                <td><ActionButtons onDelete={() => onDelete(item)} onEdit={() => onEdit(item)} onPrint={() => onPrint(item)} onView={() => onView(item)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DebtTable({ items, onCollect }: { items: DebtRow[]; onCollect: (item: DebtRow) => void }) {
  return (
    <section className={styles.memberTableCard}>
      <div className={styles.memberTableWrap}>
        <table className={`${styles.memberTable} ${styles.cashbookTable}`}>
          <thead>
            <tr><th>Mã KH</th><th>Khách hàng</th><th>Hợp đồng</th><th>Chi nhánh</th><th>Tổng tiền</th><th>Đã thu</th><th>Còn nợ</th><th>Hạn TT</th><th>Sale/HLV phụ trách</th><th>Thao tác</th></tr>
          </thead>
          <tbody>
            {items.length === 0 ? <tr><td className={styles.emptyTableCell} colSpan={10}>Không còn công nợ phù hợp.</td></tr> : null}
            {items.map((item) => {
              const remaining = Math.max(0, item.total - item.paid);
              return (
                <tr key={item.id}>
                  <td><span className={styles.cashbookCode}>{item.customerCode}</span></td>
                  <td><strong>{item.customerName}</strong><small className={styles.cashbookSub}>{item.phone}</small></td>
                  <td>{item.contractCode}</td>
                  <td>{item.branch}</td>
                  <td>{formatCurrency(item.total)}</td>
                  <td>{formatCurrency(item.paid)}</td>
                  <td><strong className={remaining > 0 ? styles.cashbookMoneyOut : styles.cashbookMoneyIn}>{formatCurrency(remaining)}</strong></td>
                  <td>{formatDate(item.dueDate)}</td>
                  <td>{item.owner}</td>
                  <td><button className={styles.greenButton} disabled={remaining <= 0} onClick={() => onCollect(item)} type="button"><Banknote size={14} /> Thu nợ</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function VoucherBadge({ status }: { status: VoucherStatus }) {
  const tone = status === "Hoàn tất" ? styles.cashbookStatusDone : status === "Chờ duyệt" ? styles.cashbookStatusPending : styles.cashbookStatusCancel;
  return <span className={`${styles.cashbookStatus} ${tone}`}>{status}</span>;
}

function ActionButtons({ onDelete, onEdit, onPrint, onView }: { onDelete: () => void; onEdit: () => void; onPrint: () => void; onView: () => void }) {
  return (
    <div className={styles.cashbookActions}>
      <button onClick={onView} title="Xem chi tiết" type="button"><Eye size={14} /></button>
      <button onClick={onPrint} title="In phiếu" type="button"><Printer size={14} /></button>
      <button onClick={onEdit} title="Chỉnh sửa" type="button"><Edit3 size={14} /></button>
      <button className={styles.contractDelete} onClick={onDelete} title="Xóa vĩnh viễn" type="button"><Trash2 size={14} /></button>
    </div>
  );
}

function ReceiptForm({ initial, onClose, onSave, receipts }: { initial?: Receipt; onClose: () => void; onSave: (item: Receipt) => void; receipts: Receipt[] }) {
  const [draft, setDraft] = useState<Receipt>(() => initial ?? {
    id: nextCode("PT", receipts), customerCode: "", customerName: "", phone: "", identityNo: "", reason: "", contractCode: "", service: "", branch: BRANCHES[0], cashier: STAFF[0], method: "Tiền mặt", type: "Phiếu thu khác", amount: 0, paid: 0, date: todayIso(), status: "Hoàn tất", source: "Thủ công", note: "",
  });
  const [error, setError] = useState("");
  const update = <K extends keyof Receipt>(key: K, value: Receipt[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.reason.trim()) { setError("Vui lòng nhập lý do thu"); return; }
    if (draft.paid <= 0) { setError("Số tiền khách thanh toán phải lớn hơn 0"); return; }
    onSave({ ...draft, amount: Math.max(draft.amount, draft.paid) });
  };
  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true">
      <form className={styles.cashbookModal} onSubmit={submit}>
        <VoucherFormHeader icon={ArrowDownCircle} title={initial ? "Chỉnh sửa phiếu thu" : "Thêm mới phiếu thu"} tone="green" onClose={onClose} />
        <div className={styles.cashbookModalBody}>
          {error ? <div className={styles.formError}><ReceiptText size={16} /> {error}</div> : null}
          <section className={`${styles.contractFormSection} ${styles.contractSectionGreen}`}>
            <h3 className={styles.contractSectionHeader}><FileText size={16} /> Thông tin chung</h3>
            <div className={styles.cashbookFormGrid}>
              <Field label="Lý do thu" required><input value={draft.reason} onChange={(e) => update("reason", e.target.value)} /></Field>
              <Field label="Loại thu"><select value={draft.type} onChange={(e) => update("type", e.target.value as ReceiptType)}>{RECEIPT_TYPES.map((item) => <option key={item}>{item}</option>)}</select></Field>
              <Field label="Khách hàng"><input value={draft.customerName} onChange={(e) => update("customerName", e.target.value)} /></Field>
              <Field label="Mã KH"><input value={draft.customerCode} onChange={(e) => update("customerCode", e.target.value)} /></Field>
              <Field label="Số điện thoại"><input value={draft.phone} onChange={(e) => update("phone", e.target.value)} /></Field>
              <Field label="Mã HĐ / vé"><input value={draft.contractCode} onChange={(e) => update("contractCode", e.target.value)} /></Field>
              <Field label="Chi nhánh"><select value={draft.branch} onChange={(e) => update("branch", e.target.value)}>{BRANCHES.map((item) => <option key={item}>{item}</option>)}</select></Field>
              <Field label="Nhân viên thu"><select value={draft.cashier} onChange={(e) => update("cashier", e.target.value)}>{STAFF.map((item) => <option key={item}>{item}</option>)}</select></Field>
            </div>
          </section>
          <FinanceSection amount={draft.amount} paid={draft.paid} method={draft.method} status={draft.status} date={draft.date} onAmount={(value) => update("amount", value)} onPaid={(value) => update("paid", value)} onMethod={(value) => update("method", value)} onStatus={(value) => update("status", value)} onDate={(value) => update("date", value)} />
          <NoteSection note={draft.note} service={draft.service} onNote={(value) => update("note", value)} onService={(value) => update("service", value)} />
        </div>
        <FormFooter onClose={onClose} submitLabel={initial ? "Cập nhật" : "Lưu phiếu thu"} />
      </form>
    </div>
  );
}

function PaymentForm({ initial, onClose, onSave, payments }: { initial?: PaymentVoucher; onClose: () => void; onSave: (item: PaymentVoucher) => void; payments: PaymentVoucher[] }) {
  const [draft, setDraft] = useState<PaymentVoucher>(() => initial ?? {
    id: nextCode("PC", payments), receiver: "", branch: BRANCHES[0], staff: STAFF[0], method: "Tiền mặt", type: "Chi khác", amount: 0, date: todayIso(), status: "Chờ duyệt", reason: "", note: "",
  });
  const [error, setError] = useState("");
  const update = <K extends keyof PaymentVoucher>(key: K, value: PaymentVoucher[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.receiver.trim()) { setError("Vui lòng nhập người/đơn vị nhận"); return; }
    if (!draft.reason.trim()) { setError("Vui lòng nhập lý do chi"); return; }
    if (draft.amount <= 0) { setError("Số tiền chi phải lớn hơn 0"); return; }
    onSave(draft);
  };
  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true">
      <form className={styles.cashbookModal} onSubmit={submit}>
        <VoucherFormHeader icon={ArrowUpCircle} title={initial ? "Chỉnh sửa phiếu chi" : "Thêm mới phiếu chi"} tone="red" onClose={onClose} />
        <div className={styles.cashbookModalBody}>
          {error ? <div className={styles.formError}><ReceiptText size={16} /> {error}</div> : null}
          <section className={`${styles.contractFormSection} ${styles.contractSectionOrange}`}>
            <h3 className={styles.contractSectionHeader}><FileText size={16} /> Thông tin chi</h3>
            <div className={styles.cashbookFormGrid}>
              <Field label="Người/Đơn vị nhận" required><input value={draft.receiver} onChange={(e) => update("receiver", e.target.value)} /></Field>
              <Field label="Loại chi"><select value={draft.type} onChange={(e) => update("type", e.target.value as PaymentType)}>{PAYMENT_TYPES.map((item) => <option key={item}>{item}</option>)}</select></Field>
              <Field label="Lý do chi" required><input value={draft.reason} onChange={(e) => update("reason", e.target.value)} /></Field>
              <Field label="Chi nhánh"><select value={draft.branch} onChange={(e) => update("branch", e.target.value)}>{BRANCHES.map((item) => <option key={item}>{item}</option>)}</select></Field>
              <Field label="Nhân viên chi"><select value={draft.staff} onChange={(e) => update("staff", e.target.value)}>{STAFF.map((item) => <option key={item}>{item}</option>)}</select></Field>
              <Field label="Phương thức TT"><select value={draft.method} onChange={(e) => update("method", e.target.value as PaymentMethod)}>{METHODS.map((item) => <option key={item}>{item}</option>)}</select></Field>
              <Field label="Ngày chi"><input type="date" value={draft.date} onChange={(e) => update("date", e.target.value)} /></Field>
              <Field label="Trạng thái"><select value={draft.status} onChange={(e) => update("status", e.target.value as VoucherStatus)}><option>Chờ duyệt</option><option>Hoàn tất</option><option>Đã hủy</option></select></Field>
              <Field label="Số tiền chi" required><input min={0} type="number" value={draft.amount} onChange={(e) => update("amount", Number(e.target.value) || 0)} /></Field>
            </div>
          </section>
          <section className={`${styles.contractFormSection} ${styles.contractSectionRed}`}>
            <h3 className={styles.contractSectionHeader}><CreditCard size={16} /> Số tiền chi</h3>
            <div className={styles.cashbookTotalLine}><span>Tổng chi</span><strong>{formatCurrency(draft.amount)}</strong></div>
            <label><span>Ghi chú</span><textarea value={draft.note} onChange={(e) => update("note", e.target.value)} /></label>
          </section>
        </div>
        <FormFooter danger onClose={onClose} submitLabel={initial ? "Cập nhật" : "Lưu phiếu chi"} />
      </form>
    </div>
  );
}

function Field({ children, label, required }: { children: ReactNode; label: string; required?: boolean }) {
  return <label className={styles.cashbookField}><span>{label} {required ? <b>*</b> : null}</span>{children}</label>;
}

function FinanceSection({ amount, date, method, onAmount, onDate, onMethod, onPaid, onStatus, paid, status }: { amount: number; date: string; method: PaymentMethod; onAmount: (value: number) => void; onDate: (value: string) => void; onMethod: (value: PaymentMethod) => void; onPaid: (value: number) => void; onStatus: (value: VoucherStatus) => void; paid: number; status: VoucherStatus }) {
  const debt = Math.max(0, amount - paid);
  return (
    <section className={`${styles.contractFormSection} ${styles.contractSectionBlue}`}>
      <h3 className={styles.contractSectionHeader}><CreditCard size={16} /> Chi tiết tài chính</h3>
      <div className={styles.cashbookFormGrid}>
        <Field label="Tổng tiền"><input min={0} type="number" value={amount} onChange={(e) => onAmount(Number(e.target.value) || 0)} /></Field>
        <Field label="Khách TT" required><input min={0} type="number" value={paid} onChange={(e) => onPaid(Number(e.target.value) || 0)} /></Field>
        <Field label="Phương thức TT"><select value={method} onChange={(e) => onMethod(e.target.value as PaymentMethod)}>{METHODS.map((item) => <option key={item}>{item}</option>)}</select></Field>
        <Field label="Ngày tạo"><input type="date" value={date} onChange={(e) => onDate(e.target.value)} /></Field>
        <Field label="Trạng thái"><select value={status} onChange={(e) => onStatus(e.target.value as VoucherStatus)}><option>Hoàn tất</option><option>Chờ duyệt</option><option>Đã hủy</option></select></Field>
      </div>
      <div className={styles.cashbookTotalLine}><span>Còn nợ</span><strong className={debt > 0 ? styles.cashbookMoneyOut : styles.cashbookMoneyIn}>{formatCurrency(debt)}</strong></div>
    </section>
  );
}

function NoteSection({ note, onNote, onService, service }: { note: string; onNote: (value: string) => void; onService: (value: string) => void; service: string }) {
  return (
    <section className={`${styles.contractFormSection} ${styles.contractSectionTeal}`}>
      <h3 className={styles.contractSectionHeader}><Edit3 size={16} /> Dịch vụ & ghi chú</h3>
      <label><span>Gói tập / Dịch vụ</span><input value={service} onChange={(e) => onService(e.target.value)} /></label>
      <label><span>Ghi chú</span><textarea value={note} onChange={(e) => onNote(e.target.value)} /></label>
    </section>
  );
}

function VoucherFormHeader({ icon: Icon, onClose, title, tone }: { icon: LucideIcon; onClose: () => void; title: string; tone: "green" | "red" }) {
  return (
    <header className={`${styles.cashbookModalHeader} ${tone === "red" ? styles.cashbookModalHeaderRed : ""}`}>
      <div><span><Icon size={18} /></span><h2>{title}</h2><p>Nhập đầy đủ thông tin để chứng từ có thể hạch toán và in phiếu.</p></div>
      <button onClick={onClose} type="button"><X size={18} /></button>
    </header>
  );
}

function FormFooter({ danger, onClose, submitLabel }: { danger?: boolean; onClose: () => void; submitLabel: string }) {
  return (
    <footer className={styles.contractFormFooter}>
      <button className={styles.contractFilterChip} onClick={onClose} type="button">Đóng</button>
      <button className={danger ? styles.ticketDialogDanger : styles.greenButton} type="submit"><CheckCircle2 size={14} /> {submitLabel}</button>
    </footer>
  );
}

function VoucherDetail({ detail, onClose, onPrint }: { detail: { type: "receipt"; item: Receipt } | { type: "payment"; item: PaymentVoucher }; onClose: () => void; onPrint: () => void }) {
  const isReceipt = detail.type === "receipt";
  const item = detail.item;
  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true">
      <section className={styles.cashbookDetailModal}>
        <header>
          <div>
            <span className={isReceipt ? styles.cashbookDetailIconIn : styles.cashbookDetailIconOut}>{isReceipt ? <ArrowDownCircle size={22} /> : <ArrowUpCircle size={22} />}</span>
            <div><h3>{item.id}</h3><p>{isReceipt ? (item as Receipt).reason : (item as PaymentVoucher).reason}</p></div>
          </div>
          <button onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <div className={styles.cashbookDetailBody}>
          <div className={styles.cashbookDetailGrid}>
            {isReceipt ? (
              <>
                <Info label="Mã KH" value={(item as Receipt).customerCode || "—"} />
                <Info label="Họ tên" value={(item as Receipt).customerName} />
                <Info label="Ngày tạo" value={formatDate((item as Receipt).date)} />
                <Info label="PTTT" value={(item as Receipt).method} />
                <Info label="Loại phiếu" value={(item as Receipt).type} />
                <Info label="NV thu" value={(item as Receipt).cashier} />
                <Info label="Tổng tiền" value={formatCurrency((item as Receipt).amount)} />
                <Info label="Đã thu" value={formatCurrency((item as Receipt).paid)} />
              </>
            ) : (
              <>
                <Info label="Người nhận" value={(item as PaymentVoucher).receiver} />
                <Info label="Ngày chi" value={formatDate((item as PaymentVoucher).date)} />
                <Info label="PTTT" value={(item as PaymentVoucher).method} />
                <Info label="Loại chi" value={(item as PaymentVoucher).type} />
                <Info label="NV chi" value={(item as PaymentVoucher).staff} />
                <Info label="Chi nhánh" value={(item as PaymentVoucher).branch} />
                <Info label="Số tiền" value={formatCurrency((item as PaymentVoucher).amount)} />
                <Info label="Trạng thái" value={(item as PaymentVoucher).status} />
              </>
            )}
          </div>
          <div className={styles.cashbookPrintPreview}>
            <ReceiptText size={28} />
            <strong>{isReceipt ? "Phiếu thu" : "Phiếu chi"} K80 / A4</strong>
            <span>Nút In phiếu dùng mẫu mặc định từ Cài đặt hệ thống.</span>
          </div>
        </div>
        <footer>
          <button className={styles.contractFilterChip} onClick={onClose} type="button">Đóng</button>
          <button className={styles.greenButton} onClick={onPrint} type="button"><Printer size={14} /> In phiếu</button>
        </footer>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function DeleteDialog({ item, onCancel, onConfirm }: { item: { id: string }; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <section className={styles.ticketDialog}>
        <header>
          <span className={styles.ticketDialogIcon} style={{ background: "#fee2e2", color: "#b91c1c" }}><Trash2 size={20} /></span>
          <div><h3>Xóa vĩnh viễn {item.id}</h3><p>Theo BR-M5-06, xóa phiếu thu/chi là thao tác vĩnh viễn và không thể khôi phục.</p></div>
        </header>
        <footer>
          <button className={styles.contractFilterChip} onClick={onCancel} type="button">Hủy</button>
          <button className={styles.ticketDialogDanger} onClick={onConfirm} type="button"><Trash2 size={14} /> Xóa vĩnh viễn</button>
        </footer>
      </section>
    </div>
  );
}

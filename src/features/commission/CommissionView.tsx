"use client";

import { useMemo, useState } from "react";
import {
  Banknote,
  BarChart3,
  Check,
  Download,
  Eye,
  HandCoins,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import styles from "@/shared/styles/feature-styles.module.css";
import { FeaturePage } from "@/shared/components";

type CommissionType = "sales" | "coach";
type TabKey = "matrix" | "history";
type PayoutStatus = "Chờ thanh toán" | "Đã thanh toán";
type Role = "Sales" | "Coach";
type MatrixRates = Record<CommissionType, Record<string, Record<string, number>>>;
type AddModal = "group" | "contract" | null;

type CustomerGroup = {
  id: string;
  code: string;
  name: string;
  active: boolean;
};

type ContractType = {
  id: string;
  code: string;
  name: string;
  active: boolean;
};

type PayoutBreakdown = {
  contractType: string;
  customerGroup: string;
  revenue: number;
  rate: number;
  amount: number;
  contractCount: number;
};

type Payout = {
  id: string;
  payoutDate: string;
  employeeName: string;
  employeeCode: string;
  role: Role;
  period: string;
  revenue: number;
  commission: number;
  contractCount: number;
  status: PayoutStatus;
  dueDate: string;
  branch: string;
  breakdown: PayoutBreakdown[];
};

const initialGroups: CustomerGroup[] = [
  { id: "vip", code: "VIP", name: "VIP", active: true },
  { id: "regular", code: "REGULAR", name: "Thường xuyên", active: true },
  { id: "student", code: "STUDENT", name: "Học sinh", active: true },
  { id: "univ", code: "UNIV", name: "Sinh viên", active: true },
];

const initialContracts: ContractType[] = [
  { id: "newo", code: "NEWO", name: "HĐ mới offline", active: true },
  { id: "newe", code: "NEWE", name: "HĐ mới online", active: true },
  { id: "renew", code: "RENEW", name: "Gia hạn", active: true },
  { id: "upgrade", code: "UPGRADE", name: "Nâng cấp gói", active: true },
];

const initialRates: MatrixRates = {
  sales: {
    vip: { newo: 5, newe: 5, renew: 3, upgrade: 4 },
    regular: { newo: 4, newe: 4, renew: 2.5, upgrade: 3 },
    student: { newo: 3, newe: 3, renew: 2, upgrade: 2.5 },
    univ: { newo: 3.5, newe: 3.5, renew: 2, upgrade: 2.5 },
  },
  coach: {
    vip: { newo: 3, newe: 3, renew: 2, upgrade: 2.5 },
    regular: { newo: 2.5, newe: 2.5, renew: 1.5, upgrade: 2 },
    student: { newo: 2, newe: 2, renew: 1, upgrade: 1.5 },
    univ: { newo: 2, newe: 2, renew: 1, upgrade: 1.5 },
  },
};

const initialPayouts: Payout[] = [
  {
    id: "pay-001",
    payoutDate: "28/02/2026",
    employeeName: "Nguyễn Văn A",
    employeeCode: "NV001",
    role: "Sales",
    period: "Tháng 2/2026",
    revenue: 52000000,
    commission: 2600000,
    contractCount: 14,
    status: "Đã thanh toán",
    dueDate: "28/02/2026",
    branch: "NextVision Golf Center",
    breakdown: [
      { contractType: "NEWO", customerGroup: "VIP", revenue: 26000000, rate: 5, amount: 1300000, contractCount: 6 },
      { contractType: "NEWE", customerGroup: "REGULAR", revenue: 20000000, rate: 4, amount: 800000, contractCount: 5 },
      { contractType: "UPGRADE", customerGroup: "UNIV", revenue: 6000000, rate: 3.5, amount: 210000, contractCount: 3 },
    ],
  },
  {
    id: "pay-002",
    payoutDate: "28/02/2026",
    employeeName: "Trần Thị B",
    employeeCode: "HLV002",
    role: "Coach",
    period: "Tháng 2/2026",
    revenue: 38000000,
    commission: 1140000,
    contractCount: 10,
    status: "Đã thanh toán",
    dueDate: "28/02/2026",
    branch: "NextVision Golf Center",
    breakdown: [
      { contractType: "NEWO", customerGroup: "VIP", revenue: 22000000, rate: 3, amount: 660000, contractCount: 6 },
      { contractType: "RENEW", customerGroup: "REGULAR", revenue: 16000000, rate: 1.5, amount: 240000, contractCount: 4 },
    ],
  },
  {
    id: "pay-003",
    payoutDate: "31/03/2026",
    employeeName: "Nguyễn Văn A",
    employeeCode: "NV001",
    role: "Sales",
    period: "Tháng 3/2026",
    revenue: 45000000,
    commission: 2250000,
    contractCount: 12,
    status: "Chờ thanh toán",
    dueDate: "31/03/2026",
    branch: "NextVision Golf Center",
    breakdown: [
      { contractType: "NEWO", customerGroup: "VIP", revenue: 28000000, rate: 5, amount: 1400000, contractCount: 7 },
      { contractType: "NEWE", customerGroup: "REGULAR", revenue: 17000000, rate: 4, amount: 680000, contractCount: 5 },
    ],
  },
  {
    id: "pay-004",
    payoutDate: "31/03/2026",
    employeeName: "Lê Văn C",
    employeeCode: "NV003",
    role: "Sales",
    period: "Tháng 3/2026",
    revenue: 32000000,
    commission: 1280000,
    contractCount: 8,
    status: "Chờ thanh toán",
    dueDate: "31/03/2026",
    branch: "NextVision Golf Center",
    breakdown: [
      { contractType: "NEWO", customerGroup: "REGULAR", revenue: 20000000, rate: 4, amount: 800000, contractCount: 5 },
      { contractType: "UPGRADE", customerGroup: "STUDENT", revenue: 12000000, rate: 2.5, amount: 300000, contractCount: 3 },
    ],
  },
  {
    id: "pay-005",
    payoutDate: "31/01/2026",
    employeeName: "Trần Thị B",
    employeeCode: "HLV002",
    role: "Coach",
    period: "Tháng 1/2026",
    revenue: 42000000,
    commission: 1260000,
    contractCount: 11,
    status: "Đã thanh toán",
    dueDate: "31/01/2026",
    branch: "NextVision Golf Center",
    breakdown: [
      { contractType: "NEWO", customerGroup: "VIP", revenue: 30000000, rate: 3, amount: 900000, contractCount: 8 },
      { contractType: "RENEW", customerGroup: "UNIV", revenue: 12000000, rate: 1, amount: 120000, contractCount: 3 },
    ],
  },
];

const formatMoney = (value: number) => `${value.toLocaleString("vi-VN")} đ`;
const compactMoney = (value: number) => `${(value / 1000000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}M`;
const rateLabel = (value: number) => `${Number.isInteger(value) ? value : value.toFixed(1)}%`;

const cloneRates = (rates: MatrixRates): MatrixRates => JSON.parse(JSON.stringify(rates)) as MatrixRates;

export default function CommissionView() {
  const [tab, setTab] = useState<TabKey>("matrix");
  const [type, setType] = useState<CommissionType>("sales");
  const [groups, setGroups] = useState<CustomerGroup[]>(initialGroups);
  const [contracts, setContracts] = useState<ContractType[]>(initialContracts);
  const [rates, setRates] = useState<MatrixRates>(initialRates);
  const [draftRates, setDraftRates] = useState<MatrixRates>(cloneRates(initialRates));
  const [editing, setEditing] = useState(false);
  const [addModal, setAddModal] = useState<AddModal>(null);
  const [detail, setDetail] = useState<Payout | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>(initialPayouts);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("Tất cả vai trò");
  const [statusFilter, setStatusFilter] = useState("Tất cả trạng thái");
  const [periodFilter, setPeriodFilter] = useState("Tất cả kỳ hạn");
  const [toast, setToast] = useState("");

  const activeGroups = groups.filter((group) => group.active);
  const activeContracts = contracts.filter((contract) => contract.active);
  const visibleRates = editing ? draftRates : rates;
  const isCoach = type === "coach";

  const filteredPayouts = useMemo(() => {
    return payouts.filter((payout) => {
      const textMatch = `${payout.employeeName} ${payout.employeeCode}`.toLowerCase().includes(query.toLowerCase());
      const roleMatch = roleFilter === "Tất cả vai trò" || payout.role === roleFilter;
      const statusMatch = statusFilter === "Tất cả trạng thái" || payout.status === statusFilter;
      const periodMatch = periodFilter === "Tất cả kỳ hạn" || payout.period === periodFilter;
      return textMatch && roleMatch && statusMatch && periodMatch;
    });
  }, [payouts, periodFilter, query, roleFilter, statusFilter]);

  const pendingTotal = payouts.filter((payout) => payout.status === "Chờ thanh toán").reduce((sum, payout) => sum + payout.commission, 0);
  const paidTotal = payouts.filter((payout) => payout.status === "Đã thanh toán").reduce((sum, payout) => sum + payout.commission, 0);
  const monthTotal = payouts.filter((payout) => payout.period === "Tháng 3/2026").reduce((sum, payout) => sum + payout.commission, 0);
  const salesTotal = payouts.reduce((sum, payout) => sum + payout.revenue, 0);
  const employeeCount = new Set(payouts.map((payout) => payout.employeeCode)).size;
  const salesCount = new Set(payouts.filter((payout) => payout.role === "Sales").map((payout) => payout.employeeCode)).size;
  const coachCount = new Set(payouts.filter((payout) => payout.role === "Coach").map((payout) => payout.employeeCode)).size;

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  const startEdit = () => {
    setDraftRates(cloneRates(rates));
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraftRates(cloneRates(rates));
    setEditing(false);
  };

  const saveMatrix = () => {
    setRates(cloneRates(draftRates));
    setEditing(false);
    flash("Đã lưu ma trận. Hợp đồng cũ vẫn giữ rate snapshot.");
  };

  const updateRate = (groupId: string, contractId: string, value: string) => {
    const next = Number(value);
    setDraftRates((current) => ({
      ...current,
      [type]: {
        ...current[type],
        [groupId]: {
          ...current[type][groupId],
          [contractId]: Number.isFinite(next) ? next : 0,
        },
      },
    }));
  };

  const softDeleteGroup = (groupId: string) => {
    setGroups((current) => current.map((group) => (group.id === groupId ? { ...group, active: false } : group)));
    flash("Đã ẩn nhóm đối tượng, lịch sử chi trả vẫn được giữ.");
  };

  const softDeleteContract = (contractId: string) => {
    setContracts((current) => current.map((contract) => (contract.id === contractId ? { ...contract, active: false } : contract)));
    flash("Đã ẩn loại hợp đồng/dịch vụ, dữ liệu lịch sử không bị thay đổi.");
  };

  const addGroup = (code: string, name: string) => {
    const id = code.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || `group-${Date.now()}`;
    setGroups((current) => [...current, { id, code: code.trim().toUpperCase(), name: name.trim(), active: true }]);
    setDraftRates((current) => ensureGroupRates(current, id));
    setRates((current) => ensureGroupRates(current, id));
    setAddModal(null);
    flash("Đã thêm nhóm đối tượng hoa hồng.");
  };

  const addContract = (code: string, name: string) => {
    const id = code.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || `contract-${Date.now()}`;
    setContracts((current) => [...current, { id, code: code.trim().toUpperCase(), name: name.trim(), active: true }]);
    setDraftRates((current) => ensureContractRates(current, id));
    setRates((current) => ensureContractRates(current, id));
    setAddModal(null);
    flash("Đã thêm loại hợp đồng/dịch vụ vào ma trận.");
  };

  const markPaid = (payoutId: string) => {
    setPayouts((current) =>
      current.map((payout) => (payout.id === payoutId ? { ...payout, status: "Đã thanh toán" } : payout)),
    );
    const paid = payouts.find((payout) => payout.id === payoutId);
    setDetail((current) => (current?.id === payoutId ? { ...current, status: "Đã thanh toán" } : current));
    flash(`Đã chi ${paid ? formatMoney(paid.commission) : "hoa hồng"} và sinh phiếu chi Sổ quỹ.`);
  };

  return (
    <FeaturePage title="Quản Lý Hoa Hồng" subtitle="Cấu hình hoa hồng theo nhóm khách hàng và nhóm dịch vụ">
      <div className={styles.commissionKpiGrid}>
        <KpiCard tone="green" icon={<Banknote size={22} />} label="Tổng HH tháng này" value={compactMoney(monthTotal)} note="+12% so với tháng trước" />
        <KpiCard tone="blue" icon={<BarChart3 size={22} />} label="Tổng doanh số" value={compactMoney(salesTotal)} note="85 hợp đồng" />
        <KpiCard tone="violet" icon={<Users size={22} />} label="Nhân viên có HH" value={`${employeeCount}`} note={`${salesCount} Sales, ${coachCount} Coach`} />
        <KpiCard tone="orange" icon={<WalletCards size={22} />} label="Chờ thanh toán" value={compactMoney(pendingTotal)} note="Đến hạn 31/03" />
      </div>

      <section className={styles.commissionPanel}>
        <div className={styles.commissionTabs}>
          <button className={tab === "matrix" ? styles.commissionTabActive : undefined} onClick={() => setTab("matrix")} type="button">
            Ma trận Hoa hồng
          </button>
          <button className={tab === "history" ? styles.commissionTabActive : undefined} onClick={() => setTab("history")} type="button">
            Lịch sử chi trả
          </button>
        </div>

        {tab === "matrix" ? (
          <div className={styles.commissionBody}>
            <header className={styles.commissionSectionHead}>
              <div>
                <h3>Ma trận Hoa hồng</h3>
                <p>{editing ? "Đang ở chế độ chỉnh sửa. Nhập tỷ lệ mới rồi lưu để áp dụng cho hợp đồng tạo sau." : "Nhấn Chỉnh sửa để cập nhật tỷ lệ hoa hồng theo nhóm KH và loại hợp đồng."}</p>
              </div>
              <div className={styles.commissionHeaderActions}>
                {editing ? (
                  <>
                    <button className={styles.commissionGhostButton} onClick={cancelEdit} type="button"><X size={16} /> Hủy</button>
                    <button className={styles.commissionPrimaryButton} onClick={saveMatrix} type="button"><Check size={16} /> Lưu thay đổi</button>
                  </>
                ) : (
                  <button className={styles.commissionPrimaryButton} onClick={startEdit} type="button"><Pencil size={16} /> Chỉnh sửa ma trận</button>
                )}
              </div>
            </header>

            <div className={styles.commissionMatrixToolbar}>
              <span>Loại hoa hồng:</span>
              <div className={styles.commissionTypeSwitch}>
                <button className={!isCoach ? styles.commissionTypeSalesActive : undefined} onClick={() => setType("sales")} type="button">
                  <HandCoins size={16} /> Nhân viên Sales
                </button>
                <button className={isCoach ? styles.commissionTypeCoachActive : undefined} onClick={() => setType("coach")} type="button">
                  <Users size={16} /> Huấn luyện viên
                </button>
              </div>
              {editing ? (
                <div className={styles.commissionEditActions}>
                  <button onClick={() => setAddModal("group")} type="button"><Plus size={15} /> Thêm nhóm đối tượng</button>
                  <button onClick={() => setAddModal("contract")} type="button"><Plus size={15} /> Thêm loại HĐ/DV</button>
                </div>
              ) : null}
            </div>

            <div className={`${styles.commissionMatrixWrap} ${isCoach ? styles.commissionMatrixCoach : ""}`}>
              <table className={styles.commissionMatrixTable}>
                <thead>
                  <tr>
                    <th className={styles.commissionCorner}>Nhóm KH | Dịch vụ</th>
                    {activeContracts.map((contract) => (
                      <th key={contract.id}>
                        <strong>{contract.code}</strong>
                        <span>{contract.name}</span>
                        {editing ? (
                          <button onClick={() => softDeleteContract(contract.id)} type="button">
                            <Trash2 size={13} /> Ẩn cột
                          </button>
                        ) : null}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeGroups.map((group) => (
                    <tr key={group.id}>
                      <th>
                        <strong>{group.code}</strong>
                        <span>{group.name}</span>
                        {editing ? (
                          <button onClick={() => softDeleteGroup(group.id)} type="button">
                            <Trash2 size={13} /> Ẩn nhóm
                          </button>
                        ) : null}
                      </th>
                      {activeContracts.map((contract) => (
                        <td key={`${group.id}-${contract.id}`}>
                          {editing ? (
                            <div className={styles.commissionRateEdit}>
                              <input
                                aria-label={`Tỷ lệ ${group.code} ${contract.code}`}
                                max={100}
                                min={0}
                                onChange={(event) => updateRate(group.id, contract.id, event.target.value)}
                                step={0.1}
                                type="number"
                                value={visibleRates[type][group.id]?.[contract.id] ?? 0}
                              />
                              <span>%</span>
                            </div>
                          ) : (
                            <button className={styles.commissionRatePill} onClick={startEdit} type="button">
                              {rateLabel(visibleRates[type][group.id]?.[contract.id] ?? 0)}
                            </button>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <aside className={styles.commissionGuide}>
              <div><span>!</span></div>
              <div>
                <h4>Hướng dẫn sử dụng</h4>
                <p><strong>Chọn loại hoa hồng:</strong> chuyển giữa Sales và Coach bằng toggle phía trên.</p>
                <p><strong>Chỉnh sửa tỷ lệ:</strong> nhập phần trăm mới, lưu để áp dụng cho hợp đồng phát sinh sau thời điểm sửa.</p>
                <p><strong>Thêm hoặc ẩn cấu hình:</strong> nhóm KH/cột HĐ được ẩn mềm để không mất lịch sử chi trả.</p>
                <p><strong>Áp dụng tự động:</strong> hợp đồng mới tra ma trận theo nhóm KH, loại HĐ và tính trên doanh thu trước VAT.</p>
              </div>
            </aside>
          </div>
        ) : (
          <div className={styles.commissionBody}>
            <div className={styles.commissionHistoryToolbar}>
              <label className={styles.commissionSearch}>
                <Search size={18} />
                <input onChange={(event) => setQuery(event.target.value)} placeholder="Tìm kiếm nhân viên..." value={query} />
              </label>
              <select onChange={(event) => setPeriodFilter(event.target.value)} value={periodFilter}>
                <option>Tất cả kỳ hạn</option>
                <option>Tháng 3/2026</option>
                <option>Tháng 2/2026</option>
                <option>Tháng 1/2026</option>
              </select>
              <select onChange={(event) => setRoleFilter(event.target.value)} value={roleFilter}>
                <option>Tất cả vai trò</option>
                <option>Sales</option>
                <option>Coach</option>
              </select>
              <select onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
                <option>Tất cả trạng thái</option>
                <option>Chờ thanh toán</option>
                <option>Đã thanh toán</option>
              </select>
              <button onClick={() => flash("Đã xuất file Excel lịch sử chi trả.")} type="button"><Download size={16} /> Xuất Excel</button>
            </div>

            <div className={styles.commissionHistoryStats}>
              <article>
                <span>Tổng đã chi trả</span>
                <strong>{formatMoney(paidTotal)}</strong>
                <small>152 giao dịch</small>
              </article>
              <article>
                <span>Chờ thanh toán</span>
                <strong>{formatMoney(pendingTotal)}</strong>
                <small>{payouts.filter((payout) => payout.status === "Chờ thanh toán").length} nhân viên</small>
              </article>
              <article>
                <span>Tháng này</span>
                <strong>{formatMoney(monthTotal)}</strong>
                <small>+12% so với trước</small>
              </article>
            </div>

            <div className={styles.commissionTableWrap}>
              <table className={styles.commissionHistoryTable}>
                <thead>
                  <tr>
                    <th>Ngày chi trả</th>
                    <th>Nhân viên</th>
                    <th>Vai trò</th>
                    <th>Kỳ hạn</th>
                    <th>Doanh số</th>
                    <th>Hoa hồng</th>
                    <th>Số HĐ</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayouts.map((payout) => (
                    <tr key={payout.id}>
                      <td>{payout.payoutDate}</td>
                      <td>
                        <div className={styles.commissionEmployeeCell}>
                          <span className={payout.role === "Coach" ? styles.commissionAvatarCoach : styles.commissionAvatarSales}>
                            {payout.employeeName.split(" ").at(-1)?.charAt(0)}
                          </span>
                          <div>
                            <strong>{payout.employeeName}</strong>
                            <small>{payout.employeeCode}</small>
                          </div>
                        </div>
                      </td>
                      <td><span className={payout.role === "Coach" ? styles.commissionRoleCoach : styles.commissionRoleSales}>{payout.role}</span></td>
                      <td>{payout.period}</td>
                      <td><strong>{formatMoney(payout.revenue)}</strong></td>
                      <td className={payout.status === "Chờ thanh toán" ? styles.commissionMoneyPending : styles.commissionMoneyPaid}>{formatMoney(payout.commission)}</td>
                      <td>{payout.contractCount}</td>
                      <td><span className={payout.status === "Chờ thanh toán" ? styles.commissionStatusPending : styles.commissionStatusPaid}>{payout.status}</span></td>
                      <td>
                        <div className={styles.commissionRowActions}>
                          <button onClick={() => setDetail(payout)} type="button"><Eye size={15} /> Chi tiết</button>
                          {payout.status === "Chờ thanh toán" ? <button onClick={() => markPaid(payout.id)} type="button">Duyệt chi</button> : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {addModal ? (
        <AddMatrixItemModal
          mode={addModal}
          onClose={() => setAddModal(null)}
          onSave={(code, name) => (addModal === "group" ? addGroup(code, name) : addContract(code, name))}
        />
      ) : null}

      {detail ? <PayoutDetailModal onClose={() => setDetail(null)} onPay={markPaid} payout={detail} /> : null}
      {toast ? <div className={styles.contractToast}>{toast}</div> : null}
    </FeaturePage>
  );
}

function ensureGroupRates(current: MatrixRates, groupId: string): MatrixRates {
  const next = cloneRates(current);
  next.sales[groupId] = next.sales[groupId] ?? {};
  next.coach[groupId] = next.coach[groupId] ?? {};
  Object.keys(next.sales.vip).forEach((contractId) => {
    next.sales[groupId][contractId] = next.sales[groupId][contractId] ?? 0;
    next.coach[groupId][contractId] = next.coach[groupId][contractId] ?? 0;
  });
  return next;
}

function ensureContractRates(current: MatrixRates, contractId: string): MatrixRates {
  const next = cloneRates(current);
  Object.keys(next.sales).forEach((groupId) => {
    next.sales[groupId][contractId] = next.sales[groupId][contractId] ?? 0;
    next.coach[groupId][contractId] = next.coach[groupId][contractId] ?? 0;
  });
  return next;
}

function KpiCard({ icon, label, note, tone, value }: { icon: React.ReactNode; label: string; note: string; tone: "green" | "blue" | "violet" | "orange"; value: string }) {
  return (
    <article className={`${styles.commissionKpiCard} ${styles[`commissionKpi_${tone}`]}`}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
      <i>{icon}</i>
    </article>
  );
}

function AddMatrixItemModal({ mode, onClose, onSave }: { mode: "group" | "contract"; onClose: () => void; onSave: (code: string, name: string) => void }) {
  const [code, setCode] = useState(mode === "group" ? "CORP" : "CLASS");
  const [name, setName] = useState(mode === "group" ? "Khách doanh nghiệp" : "Lớp nhóm");

  return (
    <div className={styles.modalOverlay}>
      <form
        className={styles.commissionModal}
        onSubmit={(event) => {
          event.preventDefault();
          if (code.trim() && name.trim()) onSave(code, name);
        }}
      >
        <header>
          <div>
            <span>{mode === "group" ? "Nhóm đối tượng" : "Loại hợp đồng/dịch vụ"}</span>
            <h3>{mode === "group" ? "Thêm nhóm hoa hồng" : "Thêm cột ma trận"}</h3>
          </div>
          <button onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <div className={styles.commissionModalBody}>
          <label>
            <span>Mã</span>
            <input onChange={(event) => setCode(event.target.value)} value={code} />
          </label>
          <label>
            <span>Tên hiển thị</span>
            <input onChange={(event) => setName(event.target.value)} value={name} />
          </label>
          <p>Giá trị mới mặc định 0% cho Sales và Coach, Manager có thể chỉnh ngay trong ma trận.</p>
        </div>
        <footer>
          <button onClick={onClose} type="button">Hủy</button>
          <button type="submit">Lưu</button>
        </footer>
      </form>
    </div>
  );
}

function PayoutDetailModal({ onClose, onPay, payout }: { onClose: () => void; onPay: (id: string) => void; payout: Payout }) {
  return (
    <div className={styles.modalOverlay}>
      <section className={styles.commissionDetailModal}>
        <header>
          <div>
            <span>Chi tiết hoa hồng</span>
            <h3>{payout.employeeName} - {payout.period}</h3>
          </div>
          <button onClick={onClose} type="button"><X size={18} /></button>
        </header>
        <div className={styles.commissionDetailBody}>
          <dl className={styles.commissionDetailGrid}>
            <div><dt>Nhân viên</dt><dd>{payout.employeeName} ({payout.employeeCode})</dd></div>
            <div><dt>Vai trò</dt><dd>{payout.role}</dd></div>
            <div><dt>Kỳ hạn</dt><dd>{payout.period}</dd></div>
            <div><dt>Ngày đến hạn</dt><dd>{payout.dueDate}</dd></div>
            <div><dt>Doanh số trước VAT</dt><dd>{formatMoney(payout.revenue)}</dd></div>
            <div><dt>Hoa hồng</dt><dd>{formatMoney(payout.commission)}</dd></div>
            <div><dt>Số hợp đồng</dt><dd>{payout.contractCount}</dd></div>
            <div><dt>Trạng thái</dt><dd>{payout.status}</dd></div>
          </dl>
          <div className={styles.commissionBreakdown}>
            <h4>Rate snapshot theo hợp đồng</h4>
            {payout.breakdown.map((item) => (
              <div key={`${item.contractType}-${item.customerGroup}`}>
                <span>{item.customerGroup} · {item.contractType} · {item.contractCount} HĐ</span>
                <strong>{formatMoney(item.revenue)} × {rateLabel(item.rate)} = {formatMoney(item.amount)}</strong>
              </div>
            ))}
          </div>
          <p>Việc xác nhận chi chỉ cho phép chuyển từ Chờ thanh toán sang Đã thanh toán và sẽ tự sinh phiếu chi trong Sổ quỹ.</p>
        </div>
        <footer>
          <button onClick={onClose} type="button">Đóng</button>
          {payout.status === "Chờ thanh toán" ? <button onClick={() => onPay(payout.id)} type="button">Xác nhận chi</button> : null}
        </footer>
      </section>
    </div>
  );
}

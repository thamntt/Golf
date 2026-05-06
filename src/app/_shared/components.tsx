"use client";

import { Fragment, type ReactNode } from "react";
import { Download, Filter, Plus, Search, Upload } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import styles from "../page.module.css";
import { recentBookings } from "./data";
import type { ModuleKey } from "./types";

export function Screen({ children, subtitle, title }: { children: ReactNode; subtitle: string; title: string }) {
  return (
    <section className={styles.screen}>
      <div className={styles.titleBlock}>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

export function Toolbar({ filters, primary }: { filters: string[]; primary: string }) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.searchBox}>
        <Search size={18} />
        <span>Tìm kiếm theo mã, tên, SĐT...</span>
      </div>
      <div className={styles.chips}>
        {filters.map((filter, index) => (
          <button className={index === 0 ? styles.activeChip : undefined} key={filter} type="button">
            {filter}
          </button>
        ))}
      </div>
      <button className={styles.iconButton} type="button"><Filter size={18} /></button>
      <button className={styles.iconButton} type="button"><Upload size={18} /></button>
      <button className={styles.iconButton} type="button"><Download size={18} /></button>
      <button className={styles.primaryButton} type="button"><Plus size={18} />{primary}</button>
    </div>
  );
}

export function CardTitle({ action, onClick, title }: { action?: string; onClick?: () => void; title: string }) {
  return (
    <div className={styles.cardHeading}>
      <h3>{title}</h3>
      {action ? <button onClick={onClick} type="button">{action}</button> : null}
    </div>
  );
}

export function Row({ label, positive, value }: { label: string; positive?: boolean; value: ReactNode }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className={positive ? styles.positive : undefined}>{value}</dd>
    </div>
  );
}

export function BookingTable({ onOpen }: { onOpen?: (key: ModuleKey) => void }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Mã</th>
            <th>Khách Hàng</th>
            <th>Cơ Sở</th>
            <th>Thời Gian</th>
            <th>Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          {recentBookings.map((booking) => (
            <tr key={booking.code}>
              <td>
                <button
                  className={styles.bookingCode}
                  onClick={() => alert(`Chi tiết booking ${booking.code}`)}
                  type="button"
                >
                  {booking.code}
                </button>
              </td>
              <td>
                <button
                  className={styles.bookingCustomer}
                  onClick={() => onOpen?.("customers")}
                  type="button"
                >
                  <strong>{booking.customerName}</strong>
                  <span>{booking.customerCode}</span>
                </button>
              </td>
              <td>{booking.facility}</td>
              <td>
                <div className={styles.bookingTime}>
                  <span>{booking.date}</span>
                  <strong>{booking.time}</strong>
                </div>
              </td>
              <td><StatusBadge status={booking.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const className =
    status.includes("Chờ") || status.includes("Sắp") || status.includes("Pending")
      ? styles.pending
      : status.includes("Hết") || status.includes("Expired")
        ? styles.danger
        : status.includes("Đã Xác Nhận") ||
            status.includes("Xác nhận") ||
            status.includes("Còn hạn") ||
            status.includes("Active")
          ? styles.confirmed
          : styles.neutral;
  return <span className={className}>{status}</span>;
}

export function SimpleMetric({ label, value }: { label: string; value: string }) {
  return (
    <article className={styles.simpleMetric}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

export function MiniTable({ rows }: { rows: string[][] }) {
  return (
    <div className={styles.miniRows}>
      {rows.map((row) => (
        <div key={row.join("-")}>
          {row.map((cell, index) => (
            <span key={cell} className={index === 0 ? styles.linkCell : undefined}>{cell}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

export function DetailLayout({ compact, fields, tabs, title }: { compact?: boolean; fields: string[]; tabs: string[]; title: string }) {
  return (
    <section className={`${styles.detailLayout} ${compact ? styles.compactDetail : ""}`}>
      <div className={styles.cardHeading}>
        <h3>{title}</h3>
      </div>
      <div className={styles.tabs}>
        {tabs.map((tab, index) => (
          <button className={index === 0 ? styles.activeChip : undefined} key={tab} type="button">{tab}</button>
        ))}
      </div>
      <div className={styles.formPreview}>
        {fields.map((field) => (
          <label key={field}>
            <span>{field}</span>
            <input readOnly value="Dữ liệu mẫu theo SRS" />
          </label>
        ))}
      </div>
    </section>
  );
}

export function Process({ steps }: { steps: string[] }) {
  return (
    <div className={styles.process}>
      {steps.map((step, index) => (
        <article key={step}>
          <span>{index + 1}</span>
          <strong>{step}</strong>
        </article>
      ))}
    </div>
  );
}

export function CalendarMatrix({ columns, rows }: { columns: string[]; rows: string[] }) {
  return (
    <section className={styles.card}>
      <div className={styles.calendarMatrix}>
        <span />
        {columns.map((column) => <strong key={column}>{column}</strong>)}
        {rows.map((row, rowIndex) => (
          <Fragment key={row}>
            <time>{row}</time>
            {columns.map((column, columnIndex) => (
              <button
                className={(rowIndex + columnIndex) % 3 === 0 ? styles.bookedCell : styles.emptyCell}
                key={`${row}-${column}`}
                type="button"
              >
                {(rowIndex + columnIndex) % 3 === 0 ? "Đã đặt" : "Trống"}
              </button>
            ))}
          </Fragment>
        ))}
      </div>
    </section>
  );
}

export function BiometricBadges() {
  return (
    <div className={styles.bioBadges}>
      <span>Face</span>
      <span className={styles.bioActive}>Vân tay</span>
      <span>Thẻ</span>
    </div>
  );
}

export function CustomerStatus({ status }: { status: string }) {
  const className =
    status === "Còn hạn" ? styles.statusGreen : status === "Hết hạn" ? styles.statusRed : styles.statusDark;
  return <span className={className}>{status}</span>;
}

export function InfoBlock({ children, label }: { children: ReactNode; label: string }) {
  return <div className={styles.infoBlock}><span>{label}</span><strong>{children}</strong></div>;
}

export function InfoLine({ danger, icon: Icon, label, value }: { danger?: boolean; icon: LucideIcon; label: string; value: string }) {
  return (
    <div className={styles.infoLine}>
      <Icon size={18} />
      <div>
        <span>{label}</span>
        <strong className={danger ? styles.dangerText : undefined}>{value}</strong>
      </div>
    </div>
  );
}

export function SelectField({
  action,
  label,
  name,
  onAction,
  options,
  required,
  value,
  onChange,
}: {
  action?: string;
  label: string;
  name?: string;
  onAction?: () => void;
  options: string[];
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const isControlled = value !== undefined;
  return (
    <label>
      <span>{label} {required ? <b>*</b> : null}</span>
      <div className={styles.selectControl}>
        <select
          className={styles.selectInput}
          defaultValue={isControlled ? undefined : options[0]}
          name={name}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          required={required}
          value={isControlled ? value : undefined}
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        {action ? (
          <button className={styles.selectAction} onClick={onAction} type="button">{action}</button>
        ) : null}
      </div>
    </label>
  );
}

export function FormField({
  action,
  area,
  label,
  name,
  onAction,
  placeholder,
  required,
  type = "text",
  value,
}: {
  action?: string;
  area?: boolean;
  label: string;
  name?: string;
  onAction?: () => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value?: string;
}) {
  return (
    <label className={area ? styles.fullField : undefined}>
      <span>{label} {required ? <b>*</b> : null}</span>
      <div className={styles.inputWrap}>
        {area ? (
          <textarea name={name} placeholder={placeholder} />
        ) : (
          <input
            defaultValue={value}
            name={name}
            placeholder={placeholder}
            readOnly={Boolean(value)}
            required={required}
            type={type}
          />
        )}
        {action ? <button onClick={onAction} type="button">{action}</button> : null}
      </div>
    </label>
  );
}

import type { LucideIcon } from "lucide-react";

export type ModuleKey =
  | "dashboard"
  | "customers"
  | "employees"
  | "pricing"
  | "contracts"
  | "tickets"
  | "teetime"
  | "line"
  | "coach"
  | "classes"
  | "checkin"
  | "cashbook"
  | "commission"
  | "settings"
  | "reports";

export type NavItem = {
  key: ModuleKey;
  label: string;
  Icon: LucideIcon;
};

export type Customer = {
  code: string;
  name: string;
  phone: string;
  email: string;
  gender: string;
  birth: string;
  status: string;
  cards: string[];
  biometricCode?: string;
  customerGroup?: string;
  source?: string;
  cardNumber?: string;
  idNumber?: string;
  contactName?: string;
  contactPhone?: string;
  province?: string;
  ward?: string;
  address?: string;
  note?: string;
  registerDate: string;
  endDate: string;
  createdDate: string;
  creator: string;
  debt: string;
};

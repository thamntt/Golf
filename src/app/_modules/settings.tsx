"use client";

import { DetailLayout, Screen, Toolbar } from "../_shared/components";

export default function SettingsScreen() {
  return (
    <Screen title="Cài Đặt Hệ Thống" subtitle="10 tab cấu hình lõi dành cho Admin">
      <Toolbar primary="Lưu cấu hình" filters={["Thông tin DN", "Mẫu in", "HĐĐT", "Phân quyền", "Chi nhánh", "Sinh mã", "Thiết bị", "VAT", "Khuyến mãi", "Chung"]} />
      <DetailLayout title="Thông tin doanh nghiệp" tabs={["Hồ sơ", "Mẫu in", "Phân quyền", "Thiết bị"]} fields={["Tên doanh nghiệp", "Mã số thuế", "Chi nhánh mặc định", "Múi giờ GMT+7"]} />
    </Screen>
  );
}

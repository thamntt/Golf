"use client";

import { CalendarMatrix, Screen, Toolbar } from "../_shared/components";

export default function CoachScreen() {
  return (
    <Screen title="Lịch HLV" subtitle="Calendar HLV × slot 15 phút cho buổi tập 1-1">
      <Toolbar primary="+ Đăng ký lịch tập" filters={["Chi nhánh", "HLV", "Trợ lý HLV", "Khách hàng", "Cấu hình booking"]} />
      <CalendarMatrix columns={["HLV Minh", "HLV An", "HLV Khoa", "HLV Trang"]} rows={["06:00", "06:15", "06:30", "06:45", "07:00", "07:15"]} />
    </Screen>
  );
}

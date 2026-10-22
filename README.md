# ระบบช่วยเหลือเยียวยาผู้ประสบอุทกภัย (Flood Relief System - LINE Integration)

ระบบต้นแบบสำหรับรับคำร้องขอรับเงินเยียวยาผู้ประสบภัยน้ำท่วม พร้อมระบบพิกัดดาวเทียม (GPS), คัดกรองความเสียหาย, และแจ้งเตือนสถานะผ่าน LINE Official Account & LIFF

## โครงสร้างโปรเจกต์ (Project Directory Structure)

```text
.
├── docs/
│   └── SYSTEM_ARCHITECTURE.md       # เอกสารสถาปัตยกรรมระบบและผังกระบวนการ
├── public/
│   └── index.html                   # แอปพลิเคชัน LIFF (ฟอร์มลงทะเบียน + เช็คสถานะ)
├── src/
│   ├── modules/
│   │   ├── line-messaging/
│   │   │   └── flex-message-builder.ts  # ตัวสร้าง Flex Message แบบโต้ตอบ
│   │   ├── line-webhook/
│   │   │   └── webhook-controller.ts    # ตัวรับและตรวจสอบ Webhook Signature
│   │   └── relief-claims/
│   │       ├── claim-domain-types.ts    # ชนิดข้อมูลและโมเดลคำร้อง
│   │       ├── claim-registration-service.ts # ลอจิกการบันทึกและจัดการคำร้อง
│   │       └── claims-api-controller.ts      # REST API Controller
│   └── server.ts                    # Main Application Server (Express)
├── .env.example
├── package.json
└── tsconfig.json
```

## วิธีการติดตั้งและทดสอบรัน (Quick Start)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. กำหนดค่าสภาพแวดล้อม (Environment Variables)
คัดลอกไฟล์ `.env.example` เป็น `.env` และกรอกค่าจาก LINE Developers Console:
```bash
cp .env.example .env
```

### 3. รันเซิร์ฟเวอร์ในโหมดพัฒนา
```bash
npm run dev
```

- เปิดบราวเซอร์ไปที่ `http://localhost:3000` เพื่อทดลองใช้งานหน้าจอ LIFF
- ทดสอบทดลองยื่นคำร้อง และทดสอบดึงพิกัด GPS
- เชื่อมต่อ ngrok หรือ Cloudflare Tunnel (`cloudflared tunnel`) เพื่อทดสอบรับ Webhook จาก LINE จริง

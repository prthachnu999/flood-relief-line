const SYSTEM_CONFIG = {
  DRIVE_ROOT_FOLDER_NAME: 'คลังภาพหลักฐานผู้ประสบอุทกภัย_2569',
  SCRIPT_PROP_FOLDER_ID: 'EVIDENCE_ROOT_FOLDER_ID',
  HEADER_BG_COLOR: '#1E293B',
  HEADER_TEXT_COLOR: '#F8FAFC',
  LEGACY_SHEET_NAMES: [
    'tbl_registrations',
    'tbl_assessments',
    'tbl_disbursements',
    'tbl_master_citizens',
    'tbl_audit_logs'
  ]
};

const PRIORITY_TIERS_TH = {
  RED: 'วิกฤตเร่งด่วน (สีแดง)',
  YELLOW: 'ปานกลาง (สีเหลือง)',
  GREEN: 'ทั่วไป (สีเขียว)'
};

const CLAIM_STATUS_TH = {
  PENDING: 'รอตรวจสอบ',
  DUPLICATE_HOLD: 'พักตรวจสอบ (ข้อมูลซ้ำ)',
  INSPECTED: 'สำรวจพื้นที่แล้ว',
  APPROVED: 'อนุมัติเยียวยา',
  REJECTED: 'ไม่อนุมัติ',
  PAID: 'โอนเงินสำเร็จ'
};

const DAMAGE_CATEGORY_TH = {
  PARTIAL_MINOR: 'เสียหายบางส่วน (น้อย)',
  PARTIAL_SEVERE: 'เสียหายบางส่วน (หนัก)',
  TOTAL_COLLAPSE: 'เสียหายทั้งหลัง',
  INELIGIBLE: 'ไม่เข้าเกณฑ์เยียวยา'
};

const TABLE_SCHEMAS = {
  tbl_registrations: {
    sheetName: '1_ทะเบียนคำร้องผู้ประสบภัย',
    tabColor: '#EF4444',
    textFormatColumnIndices: [1, 2, 3, 5, 6, 7, 11, 17, 18],
    headers: [
      'รหัสคำร้อง',
      'วันเวลาที่ยื่นเรื่อง',
      'เลขบัตรประชาชน (13 หลัก)',
      'ชื่อ-นามสกุล',
      'เบอร์โทรศัพท์',
      'บ้านเลขที่',
      'หมู่ที่',
      'ตำบล',
      'อำเภอ',
      'จังหวัด',
      'เลขบัญชีพร้อมเพย์',
      'ระดับน้ำท่วม (ซม.)',
      'ผู้ป่วยติดเตียง',
      'จำนวนผู้สูงอายุ (คน)',
      'จำนวนเด็กเล็ก (คน)',
      'พื้นที่ถูกตัดขาด',
      'พิกัดละติจูด (Lat)',
      'พิกัดลองจิจูด (Lng)',
      'โฟลเดอร์หลักฐาน (Drive)',
      'ลิงก์ภาพบ้านเสียหาย',
      'ลิงก์ภาพระดับน้ำ',
      'คะแนนความเร่งด่วน',
      'ระดับความเร่งด่วน',
      'สถานะคำร้อง'
    ],
    dropdownValidations: [
      {
        columnIndex: 23,
        allowedValues: [
          PRIORITY_TIERS_TH.RED,
          PRIORITY_TIERS_TH.YELLOW,
          PRIORITY_TIERS_TH.GREEN
        ]
      },
      {
        columnIndex: 24,
        allowedValues: [
          CLAIM_STATUS_TH.PENDING,
          CLAIM_STATUS_TH.DUPLICATE_HOLD,
          CLAIM_STATUS_TH.INSPECTED,
          CLAIM_STATUS_TH.APPROVED,
          CLAIM_STATUS_TH.REJECTED,
          CLAIM_STATUS_TH.PAID
        ]
      }
    ]
  },

  tbl_assessments: {
    sheetName: '2_ผลสำรวจความเสียหาย',
    tabColor: '#F59E0B',
    textFormatColumnIndices: [1, 2, 3, 8],
    headers: [
      'รหัสการประเมิน',
      'รหัสคำร้องอ้างอิง',
      'รหัสเจ้าหน้าที่ผู้สำรวจ',
      'ระดับความเสียหาย',
      'วงเงินเยียวยาที่อนุมัติ (บาท)',
      'การมอบถุงยังชีพ',
      'บันทึกการตรวจสอบภาคสนาม',
      'วันเวลาที่ประเมิน'
    ],
    dropdownValidations: [
      {
        columnIndex: 4,
        allowedValues: [
          DAMAGE_CATEGORY_TH.PARTIAL_MINOR,
          DAMAGE_CATEGORY_TH.PARTIAL_SEVERE,
          DAMAGE_CATEGORY_TH.TOTAL_COLLAPSE,
          DAMAGE_CATEGORY_TH.INELIGIBLE
        ]
      }
    ]
  },

  tbl_disbursements: {
    sheetName: '3_ประวัติการโอนเงินเยียวยา',
    tabColor: '#10B981',
    textFormatColumnIndices: [1, 2, 3, 5, 7],
    headers: [
      'รหัสรายการโอน',
      'รหัสคำร้องอ้างอิง',
      'รหัสรอบการจ่าย (Batch)',
      'ช่องทางการโอนเงิน',
      'เลขอ้างอิงธุรกรรมธนาคาร',
      'จำนวนเงินที่โอนจริง (บาท)',
      'วันเวลาที่โอนเงิน',
      'เจ้าหน้าที่การเงิน'
    ],
    dropdownValidations: [
      {
        columnIndex: 4,
        allowedValues: [
          'พร้อมเพย์ ธ.กรุงไทย (KTB)',
          'โอนบัญชี ธ.ออมสิน',
          'โอนบัญชี ธ.ก.ส.',
          'เงินสด/เช็คช่วยชาติ'
        ]
      }
    ]
  },

  tbl_master_citizens: {
    sheetName: '4_ฐานข้อมูลทะเบียนราษฎร์',
    tabColor: '#3B82F6',
    textFormatColumnIndices: [1, 2, 4, 5],
    headers: [
      'เลขบัตรประชาชน (13 หลัก)',
      'รหัสประจำบ้าน (11 หลัก)',
      'ชื่อ-นามสกุลตามทะเบียนราษฎร์',
      'บ้านเลขที่',
      'หมู่ที่',
      'ตำบล',
      'อำเภอ',
      'จังหวัด',
      'สถานะเจ้าบ้าน'
    ],
    dropdownValidations: []
  },

  tbl_audit_logs: {
    sheetName: '5_ประวัติการใช้งานระบบ',
    tabColor: '#64748B',
    textFormatColumnIndices: [1, 2, 7],
    headers: [
      'รหัสบันทึก (Log ID)',
      'รหัสรายการที่เกี่ยวข้อง',
      'ประเภทการกระทำ',
      'ผู้ดำเนินการ',
      'สถานะเดิม',
      'สถานะใหม่',
      'วันเวลาที่บันทึก'
    ],
    dropdownValidations: []
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SYSTEM_CONFIG,
    PRIORITY_TIERS_TH,
    CLAIM_STATUS_TH,
    DAMAGE_CATEGORY_TH,
    TABLE_SCHEMAS
  };
}

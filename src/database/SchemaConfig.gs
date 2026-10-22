const SYSTEM_CONFIG = {
  DRIVE_ROOT_FOLDER_NAME: 'FloodRelief_Evidence_Storage_2026',
  SCRIPT_PROP_FOLDER_ID: 'EVIDENCE_ROOT_FOLDER_ID',
  HEADER_BG_COLOR: '#1E293B',
  HEADER_TEXT_COLOR: '#F8FAFC'
};

const TABLE_SCHEMAS = {
  tbl_registrations: {
    sheetName: 'tbl_registrations',
    tabColor: '#EF4444',
    textFormatColumnIndices: [3, 5, 6, 7, 11],
    headers: [
      'request_id',
      'created_at',
      'citizen_id',
      'fullname',
      'phone_number',
      'house_no',
      'village_no',
      'subdistrict',
      'district',
      'province',
      'promptpay_number',
      'water_depth_cm',
      'is_bedridden',
      'elderly_count',
      'child_count',
      'is_isolated',
      'gps_lat',
      'gps_lng',
      'evidence_folder_url',
      'photo_house_url',
      'photo_water_url',
      'priority_score',
      'priority_tier',
      'claim_status'
    ],
    dropdownValidations: [
      { columnIndex: 23, allowedValues: ['RED', 'YELLOW', 'GREEN'] },
      { columnIndex: 24, allowedValues: ['PENDING', 'DUPLICATE_HOLD', 'INSPECTED', 'APPROVED', 'REJECTED', 'PAID'] }
    ]
  },

  tbl_assessments: {
    sheetName: 'tbl_assessments',
    tabColor: '#F59E0B',
    textFormatColumnIndices: [1, 2, 3],
    headers: [
      'assessment_id',
      'request_id',
      'inspector_officer_id',
      'damage_category',
      'approved_remedy_thb',
      'relief_pack_delivered',
      'inspector_notes',
      'assessed_at'
    ],
    dropdownValidations: [
      { columnIndex: 4, allowedValues: ['PARTIAL_MINOR', 'PARTIAL_SEVERE', 'TOTAL_COLLAPSE', 'INELIGIBLE'] }
    ]
  },

  tbl_disbursements: {
    sheetName: 'tbl_disbursements',
    tabColor: '#10B981',
    textFormatColumnIndices: [1, 2, 3, 5],
    headers: [
      'disbursement_id',
      'request_id',
      'batch_number',
      'payment_channel',
      'transaction_ref',
      'disbursed_amount_thb',
      'disbursed_at',
      'finance_officer_id'
    ],
    dropdownValidations: [
      { columnIndex: 4, allowedValues: ['KTB_PROMPTPAY', 'GOV_SAVINGS_BANK', 'BAAC_TRANSFER', 'CASH_VOUCHER'] }
    ]
  },

  tbl_master_citizens: {
    sheetName: 'tbl_master_citizens',
    tabColor: '#3B82F6',
    textFormatColumnIndices: [1, 2, 4, 5],
    headers: [
      'citizen_id',
      'house_code_11digit',
      'registered_fullname',
      'house_no',
      'village_no',
      'subdistrict',
      'district',
      'province',
      'is_head_of_household'
    ],
    dropdownValidations: []
  },

  tbl_audit_logs: {
    sheetName: 'tbl_audit_logs',
    tabColor: '#64748B',
    textFormatColumnIndices: [1, 2],
    headers: [
      'log_id',
      'target_entity_id',
      'action_type',
      'actor_email',
      'previous_state',
      'updated_state',
      'logged_at'
    ],
    dropdownValidations: []
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SYSTEM_CONFIG, TABLE_SCHEMAS };
}

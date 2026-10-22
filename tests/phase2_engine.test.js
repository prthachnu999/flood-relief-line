const assert = require('assert');
const {
  SYSTEM_CONFIG,
  PRIORITY_TIERS_TH,
  CLAIM_STATUS_TH,
  DAMAGE_CATEGORY_TH,
  TABLE_SCHEMAS
} = require('../src/database/SchemaConfig.gs');
const {
  sanitizeNumericDigits,
  isValidThaiNationalId,
  isValidPromptPayAccount,
  detectDuplicateRegistration,
  buildAddressKey
} = require('../src/services/CitizenValidationService.gs');
const {
  REMEDY_RATES_THB,
  calculateWaterDepthScore,
  calculateHouseholdVulnerabilityScore,
  resolvePriorityTier,
  evaluateVulnerabilityTriage,
  computeApprovedRemedyAmount
} = require('../src/services/TriageScoringService.gs');
const {
  submitCitizenRegistration,
  recordFieldAssessment,
  findRegistrationByKeyword
} = require('../src/repositories/RegistrationRepository.gs');

function setupPhase2Mocks() {
  global.SYSTEM_CONFIG = SYSTEM_CONFIG;
  global.PRIORITY_TIERS_TH = PRIORITY_TIERS_TH;
  global.CLAIM_STATUS_TH = CLAIM_STATUS_TH;
  global.DAMAGE_CATEGORY_TH = DAMAGE_CATEGORY_TH;
  global.REMEDY_RATES_THB = REMEDY_RATES_THB;
  global.TABLE_SCHEMAS = TABLE_SCHEMAS;
  global.sanitizeNumericDigits = sanitizeNumericDigits;
  global.isValidThaiNationalId = isValidThaiNationalId;
  global.isValidPromptPayAccount = isValidPromptPayAccount;
  global.detectDuplicateRegistration = detectDuplicateRegistration;
  global.buildAddressKey = buildAddressKey;
  global.evaluateVulnerabilityTriage = evaluateVulnerabilityTriage;
  global.computeApprovedRemedyAmount = computeApprovedRemedyAmount;
  global.createRequestEvidenceFolder = (reqId) => ({
    folderId: 'FOLDER_' + reqId,
    folderUrl: 'https://drive.google.com/drive/folders/' + reqId
  });
  global.saveBase64EvidenceImage = (folderId, label) => 'https://drive.google.com/file/' + folderId + '/' + label;

  const sheetRowsStore = {
    '1_ทะเบียนคำร้องผู้ประสบภัย': [TABLE_SCHEMAS.tbl_registrations.headers],
    '2_ผลสำรวจความเสียหาย': [TABLE_SCHEMAS.tbl_assessments.headers],
    '5_ประวัติการใช้งานระบบ': [TABLE_SCHEMAS.tbl_audit_logs.headers]
  };

  function buildSheetMock(sheetName) {
    return {
      getLastRow: () => sheetRowsStore[sheetName].length,
      getRange: (startRow, startCol, numRows = 1, numCols = 1) => ({
        setNumberFormat: () => {},
        setValues: (matrixValues) => {
          sheetRowsStore[sheetName][startRow - 1] = matrixValues[0];
        },
        getValues: () => {
          const sliced = [];
          for (let r = startRow - 1; r < startRow - 1 + numRows; r++) {
            const row = sheetRowsStore[sheetName][r] || [];
            sliced.push(row.slice(startCol - 1, startCol - 1 + numCols));
          }
          return sliced;
        },
        getValue: () => sheetRowsStore[sheetName][startRow - 1][startCol - 1],
        setValue: (newVal) => {
          sheetRowsStore[sheetName][startRow - 1][startCol - 1] = newVal;
        }
      })
    };
  }

  global.LockService = {
    getScriptLock: () => ({
      waitLock: () => {},
      releaseLock: () => {}
    })
  };

  global.SpreadsheetApp = {
    getActiveSpreadsheet: () => ({
      getSheetByName: (name) => buildSheetMock(name)
    })
  };

  return sheetRowsStore;
}

function runPhase2Tests() {
  const sheetRowsStore = setupPhase2Mocks();

  assert.strictEqual(isValidThaiNationalId('1-2345-67890-12-1'), true);
  assert.strictEqual(isValidThaiNationalId('1234567890129'), false);

  const redTriage = evaluateVulnerabilityTriage({
    waterDepthCm: 150,
    isBedridden: true,
    elderlyCount: 1,
    childCount: 0,
    isIsolated: true
  });
  assert.strictEqual(redTriage.priorityScore, 100);
  assert.strictEqual(redTriage.priorityTier, 'วิกฤตเร่งด่วน (สีแดง)');

  const firstSubmission = submitCitizenRegistration({
    citizenId: '1234567890121',
    fullname: 'นายสมชาย ใจดี',
    phoneNumber: '0812345678',
    houseNo: '99/1',
    villageNo: '4',
    subdistrict: 'ปากน้ำ',
    district: 'เมืองกระบี่',
    province: 'กระบี่',
    promptpayNumber: '0812345678',
    waterDepthCm: 120,
    isBedridden: true,
    elderlyCount: 1,
    childCount: 0,
    isIsolated: false
  });

  assert.strictEqual(firstSubmission.requestId, 'REQ-2569-00001');
  assert.strictEqual(firstSubmission.priorityTier, 'วิกฤตเร่งด่วน (สีแดง)');
  assert.strictEqual(firstSubmission.claimStatus, 'รอตรวจสอบ');

  // Verify leading zero in phone number '0812345678' is preserved in row
  const storedPhone = sheetRowsStore['1_ทะเบียนคำร้องผู้ประสบภัย'][1][4];
  assert.strictEqual(storedPhone, '0812345678');

  const duplicateSubmission = submitCitizenRegistration({
    citizenId: '1234567890112',
    fullname: 'นางสมหญิง ใจดี',
    phoneNumber: '0898765432',
    houseNo: '99/1',
    villageNo: '4',
    subdistrict: 'ปากน้ำ',
    district: 'เมืองกระบี่',
    province: 'กระบี่',
    promptpayNumber: '0898765432',
    waterDepthCm: 40,
    isBedridden: false,
    elderlyCount: 0,
    childCount: 0,
    isIsolated: false
  });

  assert.strictEqual(duplicateSubmission.claimStatus, 'พักตรวจสอบ (ข้อมูลซ้ำ)');
  assert.strictEqual(duplicateSubmission.duplicateReason, 'ครัวเรือนบ้านเลขที่นี้ยื่นคำร้องแล้ว');

  const assessmentOutcome = recordFieldAssessment({
    requestId: 'REQ-2569-00001',
    inspectorOfficerId: 'จท-กระบี่-01',
    damageCategory: 'เสียหายบางส่วน (หนัก)',
    reliefPackDelivered: true,
    inspectorNotes: 'น้ำท่วมชั้นล่างเสียหายหนัก'
  });

  assert.strictEqual(assessmentOutcome.approvedRemedyThb, 30000);
  assert.strictEqual(assessmentOutcome.claimStatus, 'อนุมัติเยียวยา');

  const foundList = findRegistrationByKeyword('1234567890121');
  assert.strictEqual(foundList.length, 1);
  assert.strictEqual(foundList[0].claimStatus, 'อนุมัติเยียวยา');
  assert.strictEqual(sheetRowsStore['5_ประวัติการใช้งานระบบ'].length, 4);

  console.log('ALL PHASE 2 THAI ENGINE TESTS PASSED SUCCESSFULLY.');
}

runPhase2Tests();

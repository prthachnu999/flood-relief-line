const assert = require('assert');
const { SYSTEM_CONFIG, TABLE_SCHEMAS } = require('../src/database/SchemaConfig.gs');
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
  generateNextSequentialId,
  appendAuditLogEntry,
  validateSubmissionFields,
  uploadRegistrationEvidence,
  submitCitizenRegistration,
  recordFieldAssessment,
  findRegistrationRowIndexById,
  findRegistrationByKeyword
} = require('../src/repositories/RegistrationRepository.gs');

function setupPhase2Mocks() {
  global.SYSTEM_CONFIG = SYSTEM_CONFIG;
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
    tbl_registrations: [TABLE_SCHEMAS.tbl_registrations.headers],
    tbl_assessments: [TABLE_SCHEMAS.tbl_assessments.headers],
    tbl_audit_logs: [TABLE_SCHEMAS.tbl_audit_logs.headers]
  };

  function buildSheetMock(sheetName) {
    return {
      getLastRow: () => sheetRowsStore[sheetName].length,
      appendRow: (rowArray) => {
        sheetRowsStore[sheetName].push(rowArray);
      },
      getRange: (startRow, startCol, numRows = 1, numCols = 1) => ({
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

  // Valid Thai ID: 1234567890121
  assert.strictEqual(isValidThaiNationalId('1-2345-67890-12-1'), true);
  assert.strictEqual(isValidThaiNationalId('1234567890129'), false);
  assert.strictEqual(isValidThaiNationalId('1111111111111'), false);

  assert.strictEqual(isValidPromptPayAccount('081-234-5678'), true);
  assert.strictEqual(isValidPromptPayAccount('1234567890121'), true);
  assert.strictEqual(isValidPromptPayAccount('021234567'), false);

  const redTriage = evaluateVulnerabilityTriage({
    waterDepthCm: 150,
    isBedridden: true,
    elderlyCount: 1,
    childCount: 0,
    isIsolated: true
  });
  assert.strictEqual(redTriage.priorityScore, 100);
  assert.strictEqual(redTriage.priorityTier, 'RED');

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

  assert.strictEqual(firstSubmission.requestId, 'REQ-2026-00001');
  assert.strictEqual(firstSubmission.priorityTier, 'RED');
  assert.strictEqual(firstSubmission.claimStatus, 'PENDING');

  // Test duplicate household address detection with a second valid Thai ID (1100700000011 -> check digit: let's compute valid ID)
  // For 123456789011 -> sum = 1*13+2*12+3*11+4*10+5*9+6*8+7*7+8*6+9*5+0*4+1*3+1*2 = 350. 350%11 = 9. (11-9)%10 = 2 -> '1234567890112'
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

  assert.strictEqual(duplicateSubmission.claimStatus, 'DUPLICATE_HOLD');
  assert.strictEqual(duplicateSubmission.duplicateReason, 'DUPLICATE_HOUSEHOLD_ADDRESS');

  const assessmentOutcome = recordFieldAssessment({
    requestId: 'REQ-2026-00001',
    inspectorOfficerId: 'OFF-KRABI-01',
    damageCategory: 'PARTIAL_SEVERE',
    reliefPackDelivered: true,
    inspectorNotes: 'น้ำท่วมชั้นล่างเสียหายหนัก'
  });

  assert.strictEqual(assessmentOutcome.approvedRemedyThb, 30000);
  assert.strictEqual(assessmentOutcome.claimStatus, 'APPROVED');

  const foundList = findRegistrationByKeyword('1234567890121');
  assert.strictEqual(foundList.length, 1);
  assert.strictEqual(foundList[0].claimStatus, 'APPROVED');
  assert.strictEqual(sheetRowsStore.tbl_audit_logs.length, 4);

  console.log('ALL PHASE 2 TESTS PASSED SUCCESSFULLY.');
}

runPhase2Tests();

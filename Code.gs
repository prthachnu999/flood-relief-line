const SYSTEM_CONFIG = {
  DRIVE_ROOT_FOLDER_NAME: 'FloodRelief_Evidence_Storage_2026',
  SCRIPT_PROP_FOLDER_ID: 'EVIDENCE_ROOT_FOLDER_ID',
  HEADER_BG_COLOR: '#1E293B',
  HEADER_TEXT_COLOR: '#F8FAFC'
};

const REMEDY_RATES_THB = {
  PARTIAL_MINOR: 15000,
  PARTIAL_SEVERE: 30000,
  TOTAL_COLLAPSE: 49500,
  INELIGIBLE: 0
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

function initializeFloodReliefDatabase() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!activeSpreadsheet) {
    throw new Error('Active Spreadsheet not found. Bind script to a Google Sheet.');
  }

  const schemaKeys = Object.keys(TABLE_SCHEMAS);
  for (let index = 0; index < schemaKeys.length; index++) {
    const schemaDefinition = TABLE_SCHEMAS[schemaKeys[index]];
    provisionWorksheet(activeSpreadsheet, schemaDefinition);
  }

  const firstTableSheet = activeSpreadsheet.getSheetByName(TABLE_SCHEMAS.tbl_registrations.sheetName);
  if (firstTableSheet) {
    activeSpreadsheet.setActiveSheet(firstTableSheet);
  }

  const rootFolderId = ensureEvidenceRootFolder();
  return {
    spreadsheetId: activeSpreadsheet.getId(),
    evidenceFolderId: rootFolderId,
    provisionedTables: schemaKeys
  };
}

function provisionWorksheet(spreadsheet, schemaDefinition) {
  let targetSheet = spreadsheet.getSheetByName(schemaDefinition.sheetName);
  if (!targetSheet) {
    targetSheet = spreadsheet.insertSheet(schemaDefinition.sheetName);
  }

  targetSheet.setTabColor(schemaDefinition.tabColor);
  configureSheetHeaders(targetSheet, schemaDefinition.headers);
  applyPlainTextColumnFormatting(targetSheet, schemaDefinition.textFormatColumnIndices);
  applyColumnValidations(targetSheet, schemaDefinition.dropdownValidations);
}

function configureSheetHeaders(targetSheet, headerColumns) {
  const columnCount = headerColumns.length;
  const headerRange = targetSheet.getRange(1, 1, 1, columnCount);

  headerRange.setValues([headerColumns]);
  headerRange.setBackground(SYSTEM_CONFIG.HEADER_BG_COLOR);
  headerRange.setFontColor(SYSTEM_CONFIG.HEADER_TEXT_COLOR);
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');

  targetSheet.setFrozenRows(1);
  for (let colIdx = 1; colIdx <= columnCount; colIdx++) {
    targetSheet.setColumnWidth(colIdx, 155);
  }
}

function applyPlainTextColumnFormatting(targetSheet, columnIndices) {
  const maxRows = Math.max(targetSheet.getMaxRows() - 1, 500);
  for (let idx = 0; idx < columnIndices.length; idx++) {
    const columnNumber = columnIndices[idx];
    const columnRange = targetSheet.getRange(2, columnNumber, maxRows, 1);
    columnRange.setNumberFormat('@');
  }
}

function applyColumnValidations(targetSheet, validationSpecs) {
  if (!validationSpecs || validationSpecs.length === 0) {
    return;
  }

  const maxRows = Math.max(targetSheet.getMaxRows() - 1, 500);
  for (let idx = 0; idx < validationSpecs.length; idx++) {
    const ruleSpec = validationSpecs[idx];
    const validationRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(ruleSpec.allowedValues, true)
      .setAllowInvalid(false)
      .build();

    targetSheet
      .getRange(2, ruleSpec.columnIndex, maxRows, 1)
      .setDataValidation(validationRule);
  }
}

function ensureEvidenceRootFolder() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const cachedFolderId = scriptProperties.getProperty(SYSTEM_CONFIG.SCRIPT_PROP_FOLDER_ID);

  if (cachedFolderId) {
    return cachedFolderId;
  }

  const folderIterator = DriveApp.getFoldersByName(SYSTEM_CONFIG.DRIVE_ROOT_FOLDER_NAME);
  const rootFolder = folderIterator.hasNext()
    ? folderIterator.next()
    : DriveApp.createFolder(SYSTEM_CONFIG.DRIVE_ROOT_FOLDER_NAME);

  const resolvedFolderId = rootFolder.getId();
  scriptProperties.setProperty(SYSTEM_CONFIG.SCRIPT_PROP_FOLDER_ID, resolvedFolderId);
  return resolvedFolderId;
}

function createRequestEvidenceFolder(requestId) {
  if (!requestId || typeof requestId !== 'string') {
    throw new Error('Valid requestId is required to provision an evidence folder.');
  }

  const rootFolderId = ensureEvidenceRootFolder();
  const rootFolder = DriveApp.getFolderById(rootFolderId);
  const existingSubfolders = rootFolder.getFoldersByName(requestId);

  if (existingSubfolders.hasNext()) {
    const existingFolder = existingSubfolders.next();
    return {
      folderId: existingFolder.getId(),
      folderUrl: existingFolder.getUrl()
    };
  }

  const createdFolder = rootFolder.createFolder(requestId);
  return {
    folderId: createdFolder.getId(),
    folderUrl: createdFolder.getUrl()
  };
}

function saveBase64EvidenceImage(folderId, fileLabel, base64Content, mimeType) {
  if (!base64Content) {
    return '';
  }

  const targetFolder = DriveApp.getFolderById(folderId);
  const strippedBase64 = base64Content.replace(/^data:image\/\w+;base64,/, '');
  const decodedBytes = Utilities.base64Decode(strippedBase64);
  const safeMimeType = mimeType || 'image/jpeg';
  const fileExtension = safeMimeType.split('/')[1] || 'jpg';
  const fileName = fileLabel + '_' + new Date().getTime() + '.' + fileExtension;

  const imageBlob = Utilities.newBlob(decodedBytes, safeMimeType, fileName);
  const uploadedFile = targetFolder.createFile(imageBlob);
  uploadedFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return uploadedFile.getUrl();
}

function sanitizeNumericDigits(rawInput) {
  if (rawInput === null || rawInput === undefined) {
    return '';
  }
  return String(rawInput).replace(/\D/g, '');
}

function isValidThaiNationalId(nationalIdInput) {
  const cleanDigits = sanitizeNumericDigits(nationalIdInput);
  if (cleanDigits.length !== 13) {
    return false;
  }
  if (/^(\d)\1{12}$/.test(cleanDigits)) {
    return false;
  }

  let weightedSum = 0;
  for (let positionIndex = 0; positionIndex < 12; positionIndex++) {
    const digitNumber = parseInt(cleanDigits.charAt(positionIndex), 10);
    weightedSum += digitNumber * (13 - positionIndex);
  }

  const expectedCheckDigit = (11 - (weightedSum % 11)) % 10;
  const actualCheckDigit = parseInt(cleanDigits.charAt(12), 10);
  return expectedCheckDigit === actualCheckDigit;
}

function isValidPromptPayAccount(promptPayInput) {
  const cleanAccount = sanitizeNumericDigits(promptPayInput);
  if (cleanAccount.length === 10) {
    return /^0[689]\d{8}$/.test(cleanAccount);
  }
  if (cleanAccount.length === 13) {
    return isValidThaiNationalId(cleanAccount);
  }
  return false;
}

function detectDuplicateRegistration(registrationSheet, citizenId, houseNo, villageNo, subdistrict) {
  const lastRowIndex = registrationSheet.getLastRow();
  if (lastRowIndex <= 1) {
    return { isDuplicate: false, duplicateReason: '' };
  }

  const cleanCitizenId = sanitizeNumericDigits(citizenId);
  const normalizedAddressKey = buildAddressKey(houseNo, villageNo, subdistrict);
  const existingRows = registrationSheet.getRange(2, 1, lastRowIndex - 1, 8).getValues();

  for (let rowIndex = 0; rowIndex < existingRows.length; rowIndex++) {
    const rowRecord = existingRows[rowIndex];
    const existingCitizenId = sanitizeNumericDigits(rowRecord[2]);
    if (existingCitizenId === cleanCitizenId) {
      return { isDuplicate: true, duplicateReason: 'DUPLICATE_CITIZEN_ID' };
    }

    const existingAddressKey = buildAddressKey(rowRecord[5], rowRecord[6], rowRecord[7]);
    if (normalizedAddressKey && existingAddressKey === normalizedAddressKey) {
      return { isDuplicate: true, duplicateReason: 'DUPLICATE_HOUSEHOLD_ADDRESS' };
    }
  }

  return { isDuplicate: false, duplicateReason: '' };
}

function buildAddressKey(houseNo, villageNo, subdistrict) {
  const cleanHouse = String(houseNo || '').trim().toLowerCase();
  const cleanVillage = String(villageNo || '').trim().toLowerCase();
  const cleanSubdistrict = String(subdistrict || '').trim().toLowerCase();
  if (!cleanHouse || !cleanSubdistrict) {
    return '';
  }
  return cleanHouse + '|' + cleanVillage + '|' + cleanSubdistrict;
}

function calculateWaterDepthScore(waterDepthCm) {
  const numericDepth = Number(waterDepthCm) || 0;
  if (numericDepth > 100) {
    return 40;
  }
  if (numericDepth >= 50) {
    return 25;
  }
  if (numericDepth > 0) {
    return 10;
  }
  return 0;
}

function calculateHouseholdVulnerabilityScore(isBedridden, elderlyCount, childCount, isIsolated) {
  let vulnerabilityPoints = 0;
  if (Boolean(isBedridden)) {
    vulnerabilityPoints += 30;
  }
  if ((Number(elderlyCount) || 0) > 0 || (Number(childCount) || 0) > 0) {
    vulnerabilityPoints += 15;
  }
  if (Boolean(isIsolated)) {
    vulnerabilityPoints += 15;
  }
  return vulnerabilityPoints;
}

function resolvePriorityTier(totalPriorityScore) {
  if (totalPriorityScore >= 70) {
    return 'RED';
  }
  if (totalPriorityScore >= 40) {
    return 'YELLOW';
  }
  return 'GREEN';
}

function evaluateVulnerabilityTriage(registrationRecord) {
  const depthScore = calculateWaterDepthScore(registrationRecord.waterDepthCm);
  const householdScore = calculateHouseholdVulnerabilityScore(
    registrationRecord.isBedridden,
    registrationRecord.elderlyCount,
    registrationRecord.childCount,
    registrationRecord.isIsolated
  );

  const totalScore = Math.min(100, depthScore + householdScore);
  const assignedTier = resolvePriorityTier(totalScore);

  return {
    priorityScore: totalScore,
    priorityTier: assignedTier
  };
}

function computeApprovedRemedyAmount(damageCategory) {
  if (!Object.prototype.hasOwnProperty.call(REMEDY_RATES_THB, damageCategory)) {
    return 0;
  }
  return REMEDY_RATES_THB[damageCategory];
}

function generateNextSequentialId(targetSheet, idPrefix) {
  const currentRowCount = targetSheet.getLastRow();
  const nextSequenceNumber = Math.max(1, currentRowCount);
  const paddedDigits = ('00000' + nextSequenceNumber).slice(-5);
  return idPrefix + '-2026-' + paddedDigits;
}

function appendAuditLogEntry(spreadsheet, targetEntityId, actionType, actorEmail, previousState, updatedState) {
  const auditSheet = spreadsheet.getSheetByName(TABLE_SCHEMAS.tbl_audit_logs.sheetName);
  if (!auditSheet) {
    return;
  }

  const logId = generateNextSequentialId(auditSheet, 'LOG');
  const isoTimestamp = new Date().toISOString();
  auditSheet.appendRow([
    logId,
    targetEntityId,
    actionType,
    actorEmail || 'PUBLIC_PORTAL',
    previousState,
    updatedState,
    isoTimestamp
  ]);
}

function validateSubmissionFields(submissionForm) {
  if (!isValidThaiNationalId(submissionForm.citizenId)) {
    throw new Error('เลขประจำตัวประชาชน 13 หลักไม่ถูกต้องตามหลักเกณฑ์');
  }
  if (!isValidPromptPayAccount(submissionForm.promptpayNumber)) {
    throw new Error('หมายเลขพร้อมเพย์ไม่ถูกต้อง (ต้องเป็นเบอร์มือถือ 10 หลัก หรือเลขบัตร ปชช. 13 หลัก)');
  }
  if (!submissionForm.fullname || !submissionForm.houseNo || !submissionForm.subdistrict) {
    throw new Error('กรุณากรอกข้อมูลชื่อ-นามสกุล บ้านเลขที่ และตำบลให้ครบถ้วน');
  }
}

function uploadRegistrationEvidence(requestId, submissionForm) {
  if (!submissionForm.photoHouseBase64 && !submissionForm.photoWaterBase64) {
    return { folderUrl: '', housePhotoUrl: '', waterPhotoUrl: '' };
  }

  const folderRecord = createRequestEvidenceFolder(requestId);
  const housePhotoUrl = saveBase64EvidenceImage(
    folderRecord.folderId,
    'house_damage',
    submissionForm.photoHouseBase64,
    submissionForm.photoHouseMime
  );
  const waterPhotoUrl = saveBase64EvidenceImage(
    folderRecord.folderId,
    'water_level',
    submissionForm.photoWaterBase64,
    submissionForm.photoWaterMime
  );

  return {
    folderUrl: folderRecord.folderUrl,
    housePhotoUrl: housePhotoUrl,
    waterPhotoUrl: waterPhotoUrl
  };
}

function submitCitizenRegistration(submissionForm) {
  validateSubmissionFields(submissionForm);

  const scriptLock = LockService.getScriptLock();
  scriptLock.waitLock(10000);

  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const regSheet = spreadsheet.getSheetByName(TABLE_SCHEMAS.tbl_registrations.sheetName);
    const duplicateCheck = detectDuplicateRegistration(
      regSheet,
      submissionForm.citizenId,
      submissionForm.houseNo,
      submissionForm.villageNo,
      submissionForm.subdistrict
    );

    const requestId = generateNextSequentialId(regSheet, 'REQ');
    const triageEvaluation = evaluateVulnerabilityTriage(submissionForm);
    const initialStatus = duplicateCheck.isDuplicate ? 'DUPLICATE_HOLD' : 'PENDING';
    const evidenceLinks = uploadRegistrationEvidence(requestId, submissionForm);
    const createdTimestamp = new Date().toISOString();

    const newRowValues = [
      requestId,
      createdTimestamp,
      sanitizeNumericDigits(submissionForm.citizenId),
      String(submissionForm.fullname).trim(),
      sanitizeNumericDigits(submissionForm.phoneNumber),
      String(submissionForm.houseNo).trim(),
      String(submissionForm.villageNo || '').trim(),
      String(submissionForm.subdistrict).trim(),
      String(submissionForm.district || '').trim(),
      String(submissionForm.province || '').trim(),
      sanitizeNumericDigits(submissionForm.promptpayNumber),
      Number(submissionForm.waterDepthCm) || 0,
      Boolean(submissionForm.isBedridden),
      Number(submissionForm.elderlyCount) || 0,
      Number(submissionForm.childCount) || 0,
      Boolean(submissionForm.isIsolated),
      String(submissionForm.gpsLat || ''),
      String(submissionForm.gpsLng || ''),
      evidenceLinks.folderUrl,
      evidenceLinks.housePhotoUrl,
      evidenceLinks.waterPhotoUrl,
      triageEvaluation.priorityScore,
      triageEvaluation.priorityTier,
      initialStatus
    ];

    regSheet.appendRow(newRowValues);
    appendAuditLogEntry(spreadsheet, requestId, 'CREATE_REGISTRATION', 'CITIZEN_PORTAL', 'NONE', initialStatus);

    return {
      requestId: requestId,
      priorityScore: triageEvaluation.priorityScore,
      priorityTier: triageEvaluation.priorityTier,
      claimStatus: initialStatus,
      duplicateReason: duplicateCheck.duplicateReason
    };
  } finally {
    scriptLock.releaseLock();
  }
}

function recordFieldAssessment(assessmentInput) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const regSheet = spreadsheet.getSheetByName(TABLE_SCHEMAS.tbl_registrations.sheetName);
  const assessmentSheet = spreadsheet.getSheetByName(TABLE_SCHEMAS.tbl_assessments.sheetName);

  const matchedRowIndex = findRegistrationRowIndexById(regSheet, assessmentInput.requestId);
  if (matchedRowIndex === -1) {
    throw new Error('ไม่พบรหัสคำร้อง: ' + assessmentInput.requestId);
  }

  const assessmentId = generateNextSequentialId(assessmentSheet, 'ASM');
  const approvedAmountThb = computeApprovedRemedyAmount(assessmentInput.damageCategory);
  const updatedClaimStatus = assessmentInput.damageCategory === 'INELIGIBLE' ? 'REJECTED' : 'APPROVED';
  const assessedTimestamp = new Date().toISOString();

  assessmentSheet.appendRow([
    assessmentId,
    assessmentInput.requestId,
    assessmentInput.inspectorOfficerId || 'OFFICER_DEFAULT',
    assessmentInput.damageCategory,
    approvedAmountThb,
    Boolean(assessmentInput.reliefPackDelivered),
    String(assessmentInput.inspectorNotes || ''),
    assessedTimestamp
  ]);

  const statusCell = regSheet.getRange(matchedRowIndex, 24);
  const previousStatus = statusCell.getValue();
  statusCell.setValue(updatedClaimStatus);

  appendAuditLogEntry(
    spreadsheet,
    assessmentInput.requestId,
    'FIELD_ASSESSMENT',
    assessmentInput.inspectorOfficerId,
    previousStatus,
    updatedClaimStatus
  );

  return {
    assessmentId: assessmentId,
    requestId: assessmentInput.requestId,
    approvedRemedyThb: approvedAmountThb,
    claimStatus: updatedClaimStatus
  };
}

function findRegistrationRowIndexById(regSheet, targetRequestId) {
  const lastRow = regSheet.getLastRow();
  if (lastRow <= 1) {
    return -1;
  }

  const idColumnValues = regSheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let idx = 0; idx < idColumnValues.length; idx++) {
    if (String(idColumnValues[idx][0]).trim() === String(targetRequestId).trim()) {
      return idx + 2;
    }
  }
  return -1;
}

function findRegistrationByKeyword(searchKeyword) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const regSheet = spreadsheet.getSheetByName(TABLE_SCHEMAS.tbl_registrations.sheetName);
  const lastRow = regSheet.getLastRow();
  if (lastRow <= 1) {
    return [];
  }

  const cleanKeyword = String(searchKeyword || '').trim();
  const cleanDigits = sanitizeNumericDigits(cleanKeyword);
  const allRecords = regSheet.getRange(2, 1, lastRow - 1, 24).getValues();
  const matchedRecords = [];

  for (let idx = 0; idx < allRecords.length; idx++) {
    const rowCells = allRecords[idx];
    const rowRequestId = String(rowCells[0]).trim();
    const rowCitizenId = sanitizeNumericDigits(rowCells[2]);
    if (rowRequestId === cleanKeyword || (cleanDigits.length === 13 && rowCitizenId === cleanDigits)) {
      matchedRecords.push({
        requestId: rowRequestId,
        createdAt: rowCells[1],
        fullname: rowCells[3],
        subdistrict: rowCells[7],
        priorityScore: rowCells[21],
        priorityTier: rowCells[22],
        claimStatus: rowCells[23]
      });
    }
  }
  return matchedRecords;
}

function testSeedSampleFloodData() {
  initializeFloodReliefDatabase();

  const firstCase = submitCitizenRegistration({
    citizenId: '1234567890121',
    fullname: 'นายสมชาย ใจมั่น',
    phoneNumber: '0812345678',
    houseNo: '99/1',
    villageNo: '4',
    subdistrict: 'ปากน้ำ',
    district: 'เมืองกระบี่',
    province: 'กระบี่',
    promptpayNumber: '0812345678',
    waterDepthCm: 135,
    isBedridden: true,
    elderlyCount: 2,
    childCount: 1,
    isIsolated: true,
    gpsLat: '8.0863',
    gpsLng: '98.9063'
  });

  submitCitizenRegistration({
    citizenId: '1234567890112',
    fullname: 'นางสาวมาลี มีสุข',
    phoneNumber: '0898765432',
    houseNo: '45/2',
    villageNo: '2',
    subdistrict: 'ทับปริก',
    district: 'เมืองกระบี่',
    province: 'กระบี่',
    promptpayNumber: '0898765432',
    waterDepthCm: 60,
    isBedridden: false,
    elderlyCount: 1,
    childCount: 0,
    isIsolated: false,
    gpsLat: '8.1240',
    gpsLng: '98.8910'
  });

  recordFieldAssessment({
    requestId: firstCase.requestId,
    inspectorOfficerId: 'OFF-KRABI-01',
    damageCategory: 'PARTIAL_SEVERE',
    reliefPackDelivered: true,
    inspectorNotes: 'น้ำท่วมสูงเกิน 1.3 เมตร มีผู้ป่วยติดเตียง มอบถุงยังชีพแล้ว อนุมัติเยียวยา 30,000 บาท'
  });
}

const SYSTEM_CONFIG = {
  DRIVE_ROOT_FOLDER_NAME: 'คลังภาพหลักฐานผู้ประสบอุทกภัย_2569',
  SCRIPT_PROP_FOLDER_ID: 'EVIDENCE_ROOT_FOLDER_ID',
  ADMIN_PASSCODE: 'admin1784',
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

const REMEDY_RATES_THB = {
  PARTIAL_MINOR: 15000,
  PARTIAL_SEVERE: 30000,
  TOTAL_COLLAPSE: 49500,
  INELIGIBLE: 0,
  'เสียหายบางส่วน (น้อย)': 15000,
  'เสียหายบางส่วน (หนัก)': 30000,
  'เสียหายทั้งหลัง': 49500,
  'ไม่เข้าเกณฑ์เยียวยา': 0
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
    textFormatColumnIndices: [1, 2, 3, 5, 7, 9],
    headers: [
      'รหัสรายการโอน',
      'รหัสคำร้องอ้างอิง',
      'รหัสรอบการจ่าย (Batch)',
      'ช่องทางการโอนเงิน',
      'เลขอ้างอิงธุรกรรมธนาคาร',
      'จำนวนเงินที่โอนจริง (บาท)',
      'วันเวลาที่โอนเงิน',
      'เจ้าหน้าที่การเงิน',
      'หลักฐานสลิปโอนเงิน'
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

function initializeFloodReliefDatabase() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!activeSpreadsheet) {
    throw new Error('ไม่พบไฟล์ Google Sheet ที่เปิดใช้งานอยู่');
  }

  const schemaKeys = Object.keys(TABLE_SCHEMAS);
  for (let index = 0; index < schemaKeys.length; index++) {
    const schemaDefinition = TABLE_SCHEMAS[schemaKeys[index]];
    provisionWorksheet(activeSpreadsheet, schemaDefinition);
  }

  cleanupLegacyEnglishSheets(activeSpreadsheet);

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

function cleanupLegacyEnglishSheets(spreadsheet) {
  const legacyNames = SYSTEM_CONFIG.LEGACY_SHEET_NAMES || [];
  for (let idx = 0; idx < legacyNames.length; idx++) {
    const oldSheet = spreadsheet.getSheetByName(legacyNames[idx]);
    if (oldSheet && typeof spreadsheet.deleteSheet === 'function') {
      spreadsheet.deleteSheet(oldSheet);
    }
  }
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
    targetSheet.setColumnWidth(colIdx, 165);
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
  const strippedBase64 = base64Content.replace(/^data:image\/[\w+.-]+;base64,/, '');
  const decodedBytes = Utilities.base64Decode(strippedBase64);
  const safeMimeType = mimeType || 'image/jpeg';
  const fileExtension = safeMimeType.split('/')[1] || 'jpg';
  const fileName = fileLabel + '_' + new Date().getTime() + '.' + fileExtension;

  const imageBlob = Utilities.newBlob(decodedBytes, safeMimeType, fileName);
  const uploadedFile = targetFolder.createFile(imageBlob);
  uploadedFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return 'https://drive.google.com/uc?export=view&id=' + uploadedFile.getId();
}

function extractDriveFileId(rawUrl) {
  const textUrl = String(rawUrl || '').trim();
  if (!textUrl) {
    return '';
  }
  const idParamMatch = textUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return idParamMatch[1];
  }
  const pathMatch = textUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (pathMatch && pathMatch[1]) {
    return pathMatch[1];
  }
  return '';
}

function resolveDriveUrlToDataUri(rawUrl) {
  const cleanUrl = String(rawUrl || '').trim();
  if (!cleanUrl) {
    return '';
  }
  if (cleanUrl.indexOf('data:image/') === 0) {
    return cleanUrl;
  }

  const fileId = extractDriveFileId(cleanUrl);
  if (!fileId) {
    return cleanUrl;
  }

  try {
    const driveFile = DriveApp.getFileById(fileId);
    const blob = driveFile.getBlob();
    const contentType = blob.getContentType() || 'image/jpeg';
    const base64String = Utilities.base64Encode(blob.getBytes());
    return 'data:' + contentType + ';base64,' + base64String;
  } catch (err) {
    return 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w1600';
  }
}

function fetchEvidenceGalleryImages(housePhotoUrl, waterPhotoUrl) {
  return {
    houseImageSrc: resolveDriveUrlToDataUri(housePhotoUrl),
    waterImageSrc: resolveDriveUrlToDataUri(waterPhotoUrl)
  };
}

function fetchSingleImageUri(rawUrl) {
  return resolveDriveUrlToDataUri(rawUrl);
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
      return { isDuplicate: true, duplicateReason: 'เลขบัตรประชาชนซ้ำในระบบ' };
    }

    const existingAddressKey = buildAddressKey(rowRecord[5], rowRecord[6], rowRecord[7]);
    if (normalizedAddressKey && existingAddressKey === normalizedAddressKey) {
      return { isDuplicate: true, duplicateReason: 'ครัวเรือนบ้านเลขที่นี้ยื่นคำร้องแล้ว' };
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
    return PRIORITY_TIERS_TH.RED;
  }
  if (totalPriorityScore >= 40) {
    return PRIORITY_TIERS_TH.YELLOW;
  }
  return PRIORITY_TIERS_TH.GREEN;
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

function formatThaiTimestamp() {
  const nowDate = new Date();
  if (typeof Utilities !== 'undefined' && Utilities.formatDate) {
    return Utilities.formatDate(nowDate, 'Asia/Bangkok', 'dd/MM/yyyy HH:mm:ss');
  }
  return nowDate.toISOString();
}

function generateNextSequentialId(targetSheet, idPrefix) {
  const currentRowCount = targetSheet.getLastRow();
  const nextSequenceNumber = Math.max(1, currentRowCount);
  const paddedDigits = ('00000' + nextSequenceNumber).slice(-5);
  return idPrefix + '-2569-' + paddedDigits;
}

function writeFormattedSheetRow(targetSheet, rowValues, textColumnIndices) {
  const targetRowNumber = targetSheet.getLastRow() + 1;
  const targetRange = targetSheet.getRange(targetRowNumber, 1, 1, rowValues.length);

  if (textColumnIndices && textColumnIndices.length > 0) {
    for (let idx = 0; idx < textColumnIndices.length; idx++) {
      const colNumber = textColumnIndices[idx];
      targetSheet.getRange(targetRowNumber, colNumber, 1, 1).setNumberFormat('@');
    }
  }

  targetRange.setValues([rowValues]);
}

function appendAuditLogEntry(spreadsheet, targetEntityId, actionType, actorName, previousState, updatedState) {
  const auditSchema = TABLE_SCHEMAS.tbl_audit_logs;
  const auditSheet = spreadsheet.getSheetByName(auditSchema.sheetName);
  if (!auditSheet) {
    return;
  }

  const logId = generateNextSequentialId(auditSheet, 'LOG');
  const thaiTime = formatThaiTimestamp();
  const auditRow = [
    logId,
    targetEntityId,
    actionType,
    actorName || 'ระบบรับคำร้องออนไลน์',
    previousState,
    updatedState,
    thaiTime
  ];

  writeFormattedSheetRow(auditSheet, auditRow, auditSchema.textFormatColumnIndices);
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
    'ภาพบ้านเสียหาย',
    submissionForm.photoHouseBase64,
    submissionForm.photoHouseMime
  );
  const waterPhotoUrl = saveBase64EvidenceImage(
    folderRecord.folderId,
    'ภาพระดับน้ำท่วม',
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
    const regSchema = TABLE_SCHEMAS.tbl_registrations;
    const regSheet = spreadsheet.getSheetByName(regSchema.sheetName);
    const duplicateCheck = detectDuplicateRegistration(
      regSheet,
      submissionForm.citizenId,
      submissionForm.houseNo,
      submissionForm.villageNo,
      submissionForm.subdistrict
    );

    const requestId = generateNextSequentialId(regSheet, 'REQ');
    const triageEvaluation = evaluateVulnerabilityTriage(submissionForm);
    const initialStatus = duplicateCheck.isDuplicate
      ? CLAIM_STATUS_TH.DUPLICATE_HOLD
      : CLAIM_STATUS_TH.PENDING;
    const evidenceLinks = uploadRegistrationEvidence(requestId, submissionForm);
    const createdTimestamp = formatThaiTimestamp();

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
      submissionForm.isBedridden ? 'มีผู้ป่วยติดเตียง' : 'ไม่มี',
      Number(submissionForm.elderlyCount) || 0,
      Number(submissionForm.childCount) || 0,
      submissionForm.isIsolated ? 'ถูกตัดขาด' : 'เข้าถึงได้',
      String(submissionForm.gpsLat || ''),
      String(submissionForm.gpsLng || ''),
      evidenceLinks.folderUrl,
      evidenceLinks.housePhotoUrl,
      evidenceLinks.waterPhotoUrl,
      triageEvaluation.priorityScore,
      triageEvaluation.priorityTier,
      initialStatus
    ];

    writeFormattedSheetRow(regSheet, newRowValues, regSchema.textFormatColumnIndices);
    appendAuditLogEntry(spreadsheet, requestId, 'ยื่นคำร้องผู้ประสบภัย', 'ระบบออนไลน์', '-', initialStatus);

    notifyLineNewRegistration({
      requestId: requestId,
      fullname: String(submissionForm.fullname).trim(),
      subdistrict: String(submissionForm.subdistrict).trim(),
      waterDepthCm: Number(submissionForm.waterDepthCm) || 0,
      priorityTier: triageEvaluation.priorityTier,
      gpsLat: String(submissionForm.gpsLat || ''),
      gpsLng: String(submissionForm.gpsLng || '')
    });

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

function resolveThaiDamageLabel(damageInput) {
  if (DAMAGE_CATEGORY_TH[damageInput]) {
    return DAMAGE_CATEGORY_TH[damageInput];
  }
  return damageInput;
}

function verifyAdminLogin(passcodeInput) {
  const cleanPasscode = String(passcodeInput || '').trim();
  const isAuthorized = cleanPasscode === SYSTEM_CONFIG.ADMIN_PASSCODE;
  return {
    authorized: isAuthorized,
    roleTitle: isAuthorized ? 'เจ้าหน้าที่ศูนย์ช่วยเหลือเยียวยา (Admin)' : ''
  };
}

function assertAdminAuthorized(passcodeInput) {
  const verification = verifyAdminLogin(passcodeInput);
  if (!verification.authorized) {
    throw new Error('ปฏิเสธการเข้าถึง: รหัสผ่านผู้ช่วยเหลือ (แอดมิน) ไม่ถูกต้อง');
  }
}

function recordFieldAssessment(assessmentInput, adminPasscode) {
  assertAdminAuthorized(adminPasscode);
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const regSheet = spreadsheet.getSheetByName(TABLE_SCHEMAS.tbl_registrations.sheetName);
  const assessmentSchema = TABLE_SCHEMAS.tbl_assessments;
  const assessmentSheet = spreadsheet.getSheetByName(assessmentSchema.sheetName);

  const matchedRowIndex = findRegistrationRowIndexById(regSheet, assessmentInput.requestId);
  if (matchedRowIndex === -1) {
    throw new Error('ไม่พบรหัสคำร้อง: ' + assessmentInput.requestId);
  }

  const assessmentId = generateNextSequentialId(assessmentSheet, 'ASM');
  const isRejected = (assessmentInput.decision === 'REJECT') ||
    (assessmentInput.damageCategory === DAMAGE_CATEGORY_TH.INELIGIBLE) ||
    (assessmentInput.damageCategory === 'ไม่เข้าเกณฑ์เยียวยา');

  const thaiDamageLabel = isRejected
    ? DAMAGE_CATEGORY_TH.INELIGIBLE
    : resolveThaiDamageLabel(assessmentInput.damageCategory);

  const approvedAmountThb = isRejected ? 0 : computeApprovedRemedyAmount(thaiDamageLabel);
  const updatedClaimStatus = isRejected ? CLAIM_STATUS_TH.REJECTED : CLAIM_STATUS_TH.APPROVED;
  const assessedTimestamp = formatThaiTimestamp();

  let finalNotes = String(assessmentInput.inspectorNotes || '');
  if (isRejected && assessmentInput.rejectionReason) {
    finalNotes = '[เหตุผลไม่อนุมัติ: ' + assessmentInput.rejectionReason + '] ' + finalNotes;
  }

  const assessmentRow = [
    assessmentId,
    assessmentInput.requestId,
    assessmentInput.inspectorOfficerId || 'เจ้าหน้าที่สำรวจภาคสนาม',
    thaiDamageLabel,
    approvedAmountThb,
    assessmentInput.reliefPackDelivered ? 'มอบถุงยังชีพแล้ว' : 'ยังไม่ได้มอบ',
    finalNotes,
    assessedTimestamp
  ];

  writeFormattedSheetRow(assessmentSheet, assessmentRow, assessmentSchema.textFormatColumnIndices);

  const statusCell = regSheet.getRange(matchedRowIndex, 24);
  const previousStatus = statusCell.getValue();
  statusCell.setValue(updatedClaimStatus);

  appendAuditLogEntry(
    spreadsheet,
    assessmentInput.requestId,
    isRejected ? 'ปฏิเสธคำร้อง (ไม่ผ่านเกณฑ์)' : 'ประเมินความเสียหายและอนุมัติเยียวยา',
    assessmentInput.inspectorOfficerId || 'เจ้าหน้าที่สำรวจ',
    previousStatus,
    updatedClaimStatus
  );

  const claimantName = String(regSheet.getRange(matchedRowIndex, 4).getValue() || '');
  notifyLineAssessmentApproved({
    requestId: assessmentInput.requestId,
    fullname: claimantName,
    damageCategory: thaiDamageLabel,
    approvedAmountThb: approvedAmountThb,
    isRejected: isRejected,
    reliefPackDelivered: Boolean(assessmentInput.reliefPackDelivered)
  });

  return {
    assessmentId: assessmentId,
    requestId: assessmentInput.requestId,
    approvedRemedyThb: approvedAmountThb,
    claimStatus: updatedClaimStatus,
    isRejected: isRejected
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

function buildApprovedAmountMap(assessmentSheet) {
  const amountMapping = {};
  if (!assessmentSheet || assessmentSheet.getLastRow() <= 1) {
    return amountMapping;
  }
  const assessmentRows = assessmentSheet.getRange(2, 1, assessmentSheet.getLastRow() - 1, 7).getValues();
  for (let idx = 0; idx < assessmentRows.length; idx++) {
    const targetRequestId = String(assessmentRows[idx][1]).trim();
    amountMapping[targetRequestId] = Number(assessmentRows[idx][4]) || 0;
  }
  return amountMapping;
}

function findRegistrationByKeyword(searchKeyword) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const regSheet = spreadsheet.getSheetByName(TABLE_SCHEMAS.tbl_registrations.sheetName);
  if (!regSheet || regSheet.getLastRow() <= 1) {
    return [];
  }

  const assessmentSheet = spreadsheet.getSheetByName(TABLE_SCHEMAS.tbl_assessments.sheetName);
  const approvedAmountsByReq = buildApprovedAmountMap(assessmentSheet);
  const cleanKeyword = String(searchKeyword || '').trim();
  const cleanDigits = sanitizeNumericDigits(cleanKeyword);
  const allRecords = regSheet.getRange(2, 1, regSheet.getLastRow() - 1, 24).getValues();
  const matchedRecords = [];

  for (let idx = 0; idx < allRecords.length; idx++) {
    const rowCells = allRecords[idx];
    const rowRequestId = String(rowCells[0]).trim();
    const rowCitizenId = sanitizeNumericDigits(rowCells[2]);
    const rowPhone = sanitizeNumericDigits(rowCells[4]);

    const isMatchRequestId = rowRequestId.toLowerCase() === cleanKeyword.toLowerCase();
    const isMatchCitizenId = cleanDigits.length === 13 && rowCitizenId === cleanDigits;
    const isMatchPhone = (cleanDigits.length === 9 || cleanDigits.length === 10) && rowPhone === cleanDigits;

    if (isMatchRequestId || isMatchCitizenId || isMatchPhone) {
      matchedRecords.push({
        requestId: rowRequestId,
        createdAt: String(rowCells[1]),
        fullname: String(rowCells[3]),
        phoneNumber: String(rowCells[4]),
        addressText: 'บ้านเลขที่ ' + rowCells[5] + ' ม.' + rowCells[6] + ' ต.' + rowCells[7] + ' อ.' + rowCells[8],
        subdistrict: String(rowCells[7]),
        waterDepthCm: Number(rowCells[11]) || 0,
        priorityScore: Number(rowCells[21]) || 0,
        priorityTier: String(rowCells[22]),
        claimStatus: String(rowCells[23]),
        approvedRemedyThb: approvedAmountsByReq[rowRequestId] || 0
      });
    }
  }
  return matchedRecords;
}

function recordQuickEmergencySos(sosInput) {
  const scriptLock = LockService.getScriptLock();
  scriptLock.waitLock(10000);

  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const regSchema = TABLE_SCHEMAS.tbl_registrations;
    let regSheet = spreadsheet.getSheetByName(regSchema.sheetName);
    if (!regSheet) {
      initializeFloodReliefDatabase();
      regSheet = spreadsheet.getSheetByName(regSchema.sheetName);
    }

    const assignedRequestId = generateNextSequentialId(regSheet, 'REQ');
    const createdTimestamp = formatThaiTimestamp();
    const claimantName = String(sosInput.fullname || 'ผู้ประสบภัยฉุกเฉิน (LINE)').trim();
    const contactPhone = sanitizeNumericDigits(sosInput.phoneNumber || '');
    const gpsLatitude = String(sosInput.gpsLat || '').trim();
    const gpsLongitude = String(sosInput.gpsLng || '').trim();
    const locationAddress = String(sosInput.address || '').trim();

    let subdistrictName = '';
    let districtName = '';
    let provinceName = 'กระบี่';
    const subMatch = locationAddress.match(/(?:ตำบล|ต\.)\s*([^\s,]+)/);
    if (subMatch) subdistrictName = subMatch[1];
    const distMatch = locationAddress.match(/(?:อำเภอ|อ\.)\s*([^\s,]+)/);
    if (distMatch) districtName = distMatch[1];
    const provMatch = locationAddress.match(/(?:จังหวัด|จ\.)\s*([^\s,]+)/);
    if (provMatch) provinceName = provMatch[1];

    const emergencyRow = [
      assignedRequestId,
      createdTimestamp,
      'SOS-' + String(Date.now()).slice(-6),
      claimantName,
      contactPhone || 'แจ้งผ่าน LINE พิกัดฉุกเฉิน',
      locationAddress || 'พิกัดกู้ภัยฉุกเฉิน',
      '-',
      subdistrictName || 'อ่าวนาง',
      districtName || 'เมืองกระบี่',
      provinceName || 'กระบี่',
      contactPhone || '-',
      150,
      'ไม่ใช่',
      0,
      0,
      'ถูกตัดขาด',
      gpsLatitude,
      gpsLongitude,
      '-',
      '-',
      '-',
      100,
      PRIORITY_TIERS_TH.RED,
      CLAIM_STATUS_TH.PENDING
    ];

    regSheet.appendRow(emergencyRow);
    const lastRowIndex = regSheet.getLastRow();
    applyRowFormatting(regSheet, lastRowIndex, PRIORITY_TIERS_TH.RED);

    recordAuditLog(
      assignedRequestId,
      'แจ้งเหตุกู้ภัยฉุกเฉินผ่านพิกัด LINE',
      claimantName,
      'บันทึกพิกัด GPS อัตโนมัติ: ' + gpsLatitude + ', ' + gpsLongitude
    );

    return {
      statusCode: 200,
      requestId: assignedRequestId,
      priorityTier: PRIORITY_TIERS_TH.RED,
      fullname: claimantName,
      lat: gpsLatitude,
      lng: gpsLongitude
    };
  } finally {
    scriptLock.releaseLock();
  }
}

function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'sosEmergency') {
    const sosOutcome = recordQuickEmergencySos({
      fullname: e.parameter.fullname || '',
      phoneNumber: e.parameter.phoneNumber || '',
      lineUserId: e.parameter.lineUserId || '',
      gpsLat: e.parameter.lat || '',
      gpsLng: e.parameter.lng || '',
      address: e.parameter.address || ''
    });
    return ContentService.createTextOutput(JSON.stringify(sosOutcome))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (e && e.parameter && (e.parameter.action === 'search' || e.parameter.keyword || e.parameter.query)) {
    const searchKeyword = String(e.parameter.keyword || e.parameter.query || '').trim();
    const matchedRecords = findRegistrationByKeyword(searchKeyword);
    return ContentService.createTextOutput(JSON.stringify({
      statusCode: 200,
      keyword: searchKeyword,
      records: matchedRecords
    })).setMimeType(ContentService.MimeType.JSON);
  }
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('ระบบช่วยเหลือเยียวยาผู้ประสบอุทกภัย')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getDashboardOverview(adminPasscode) {
  assertAdminAuthorized(adminPasscode);
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let regSheet = spreadsheet.getSheetByName(TABLE_SCHEMAS.tbl_registrations.sheetName);
  if (!regSheet) {
    initializeFloodReliefDatabase();
    regSheet = spreadsheet.getSheetByName(TABLE_SCHEMAS.tbl_registrations.sheetName);
  }

  const assessmentSheet = spreadsheet.getSheetByName(TABLE_SCHEMAS.tbl_assessments.sheetName);
  const disbursementSheet = spreadsheet.getSheetByName(TABLE_SCHEMAS.tbl_disbursements.sheetName);
  const assessmentMap = buildAssessmentMap(assessmentSheet);
  const registrationItems = readAllRegistrations(regSheet, assessmentMap);
  const disbursementItems = readAllDisbursements(disbursementSheet);

  const summaryCounts = computeSummaryMetrics(registrationItems, disbursementItems);

  return {
    totalRequests: registrationItems.length,
    redCount: summaryCounts.redCount,
    pendingCount: summaryCounts.pendingCount,
    approvedCount: summaryCounts.approvedCount,
    paidCount: summaryCounts.paidCount,
    rejectedCount: summaryCounts.rejectedCount,
    totalApprovedBudgetThb: summaryCounts.totalApprovedBudgetThb,
    totalPaidBudgetThb: summaryCounts.totalPaidBudgetThb,
    registrations: registrationItems,
    disbursements: disbursementItems
  };
}

function computeSummaryMetrics(registrationItems, disbursementItems) {
  let redCount = 0;
  let pendingCount = 0;
  let approvedCount = 0;
  let paidCount = 0;
  let rejectedCount = 0;
  let totalApprovedBudgetThb = 0;
  let totalPaidBudgetThb = 0;

  for (let idx = 0; idx < registrationItems.length; idx++) {
    const record = registrationItems[idx];
    if (record.priorityTier === PRIORITY_TIERS_TH.RED) redCount++;
    if (record.claimStatus === CLAIM_STATUS_TH.PENDING) pendingCount++;
    if (record.claimStatus === CLAIM_STATUS_TH.APPROVED) approvedCount++;
    if (record.claimStatus === CLAIM_STATUS_TH.PAID) paidCount++;
    if (record.claimStatus === CLAIM_STATUS_TH.REJECTED) rejectedCount++;
    totalApprovedBudgetThb += Number(record.approvedRemedyThb) || 0;
  }

  for (let dIdx = 0; dIdx < disbursementItems.length; dIdx++) {
    totalPaidBudgetThb += Number(disbursementItems[dIdx].disbursedAmountThb) || 0;
  }

  return {
    redCount: redCount,
    pendingCount: pendingCount,
    approvedCount: approvedCount,
    paidCount: paidCount,
    rejectedCount: rejectedCount,
    totalApprovedBudgetThb: totalApprovedBudgetThb,
    totalPaidBudgetThb: totalPaidBudgetThb
  };
}

function buildAssessmentMap(assessmentSheet) {
  const map = {};
  if (!assessmentSheet || assessmentSheet.getLastRow() <= 1) {
    return map;
  }
  const assessmentRows = assessmentSheet.getRange(2, 1, assessmentSheet.getLastRow() - 1, 7).getValues();
  for (let idx = 0; idx < assessmentRows.length; idx++) {
    const reqId = String(assessmentRows[idx][1]).trim();
    map[reqId] = {
      amountThb: Number(assessmentRows[idx][4]) || 0,
      damageCategory: String(assessmentRows[idx][3]),
      notes: String(assessmentRows[idx][6] || '')
    };
  }
  return map;
}

function readAllRegistrations(regSheet, assessmentMap) {
  const lastRow = regSheet.getLastRow();
  if (lastRow <= 1) {
    return [];
  }

  const rawRows = regSheet.getRange(2, 1, lastRow - 1, 24).getValues();
  const mappedRecords = [];

  for (let idx = 0; idx < rawRows.length; idx++) {
    const rowCells = rawRows[idx];
    const reqId = String(rowCells[0]);
    const assessData = assessmentMap ? assessmentMap[reqId] : null;
    mappedRecords.push({
      requestId: reqId,
      createdAt: String(rowCells[1]),
      citizenId: String(rowCells[2]),
      fullname: String(rowCells[3]),
      phoneNumber: String(rowCells[4]),
      addressText: 'บ้านเลขที่ ' + rowCells[5] + ' ม.' + rowCells[6] + ' ต.' + rowCells[7] + ' อ.' + rowCells[8],
      subdistrict: String(rowCells[7]),
      promptpayNumber: String(rowCells[10]),
      waterDepthCm: Number(rowCells[11]) || 0,
      isBedridden: String(rowCells[12]),
      elderlyCount: Number(rowCells[13]) || 0,
      childCount: Number(rowCells[14]) || 0,
      isIsolated: String(rowCells[15]),
      gpsLat: String(rowCells[16]),
      gpsLng: String(rowCells[17]),
      evidenceFolderUrl: String(rowCells[18] || ''),
      photoHouseUrl: String(rowCells[19] || ''),
      photoWaterUrl: String(rowCells[20] || ''),
      priorityScore: Number(rowCells[21]) || 0,
      priorityTier: String(rowCells[22]),
      claimStatus: String(rowCells[23]),
      approvedRemedyThb: assessData ? assessData.amountThb : 0,
      assessmentNotes: assessData ? assessData.notes : '',
      damageCategory: assessData ? assessData.damageCategory : ''
    });
  }

  mappedRecords.sort(function (firstItem, secondItem) {
    return secondItem.priorityScore - firstItem.priorityScore;
  });

  return mappedRecords;
}

function readAllDisbursements(disbursementSheet) {
  if (!disbursementSheet || disbursementSheet.getLastRow() <= 1) {
    return [];
  }
  const maxCols = Math.max(9, disbursementSheet.getLastColumn());
  const rawRows = disbursementSheet.getRange(2, 1, disbursementSheet.getLastRow() - 1, maxCols).getValues();
  const list = [];
  for (let idx = 0; idx < rawRows.length; idx++) {
    const rowCells = rawRows[idx];
    list.push({
      disbursementId: String(rowCells[0]),
      requestId: String(rowCells[1]),
      batchNumber: String(rowCells[2]),
      paymentChannel: String(rowCells[3]),
      transactionRef: String(rowCells[4]),
      disbursedAmountThb: Number(rowCells[5]) || 0,
      disbursedAt: String(rowCells[6]),
      financeOfficerId: String(rowCells[7]),
      paymentSlipUrl: String(rowCells[8] || '')
    });
  }
  return list.reverse();
}

function recordDisbursementPayment(paymentInput, adminPasscode) {
  assertAdminAuthorized(adminPasscode);
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const regSheet = spreadsheet.getSheetByName(TABLE_SCHEMAS.tbl_registrations.sheetName);
  const assessmentSheet = spreadsheet.getSheetByName(TABLE_SCHEMAS.tbl_assessments.sheetName);
  const disburseSchema = TABLE_SCHEMAS.tbl_disbursements;
  const disburseSheet = spreadsheet.getSheetByName(disburseSchema.sheetName);

  const matchedRowIndex = findRegistrationRowIndexById(regSheet, paymentInput.requestId);
  if (matchedRowIndex === -1) {
    throw new Error('ไม่พบรหัสคำร้อง: ' + paymentInput.requestId);
  }

  const statusCell = regSheet.getRange(matchedRowIndex, 24);
  const previousStatus = String(statusCell.getValue());
  if (previousStatus === CLAIM_STATUS_TH.PAID) {
    throw new Error('คำร้อง ' + paymentInput.requestId + ' ได้รับการโอนเงินเยียวยาไปแล้ว');
  }

  const approvedAmountsByReq = buildApprovedAmountMap(assessmentSheet);
  const approvedThb = approvedAmountsByReq[paymentInput.requestId] || Number(paymentInput.disbursedAmountThb) || 0;
  if (approvedThb <= 0) {
    throw new Error('คำร้องนี้ยังไม่มีวงเงินอนุมัติเยียวยา');
  }

  const disbursementId = generateNextSequentialId(disburseSheet, 'PAY');
  const paidTime = formatThaiTimestamp();
  const batchCode = paymentInput.batchNumber || ('BATCH-' + Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMdd'));
  const txRef = paymentInput.transactionRef || ('KTB-' + new Date().getTime());

  let paymentSlipUrl = '';
  if (paymentInput.slipBase64) {
    const evidenceFolder = createRequestEvidenceFolder(paymentInput.requestId);
    paymentSlipUrl = saveBase64EvidenceImage(
      evidenceFolder.folderId,
      'SLIP_' + paymentInput.requestId,
      paymentInput.slipBase64,
      paymentInput.slipMimeType || 'image/jpeg'
    );
  }

  const disburseRow = [
    disbursementId,
    paymentInput.requestId,
    batchCode,
    paymentInput.paymentChannel || 'พร้อมเพย์ ธ.กรุงไทย (KTB)',
    txRef,
    approvedThb,
    paidTime,
    paymentInput.financeOfficerId || 'กง-ปภ-01',
    paymentSlipUrl
  ];

  writeFormattedSheetRow(disburseSheet, disburseRow, disburseSchema.textFormatColumnIndices);
  statusCell.setValue(CLAIM_STATUS_TH.PAID);

  appendAuditLogEntry(
    spreadsheet,
    paymentInput.requestId,
    'โอนเงินเยียวยาสำเร็จ',
    paymentInput.financeOfficerId || 'เจ้าหน้าที่การเงิน',
    previousStatus,
    CLAIM_STATUS_TH.PAID
  );

  const recipientName = String(regSheet.getRange(matchedRowIndex, 4).getValue() || '');
  notifyLineDisbursementPaid({
    requestId: paymentInput.requestId,
    fullname: recipientName,
    disbursedAmountThb: approvedThb,
    paymentChannel: paymentInput.paymentChannel || 'พร้อมเพย์ ธ.กรุงไทย (KTB)',
    transactionRef: txRef
  });

  return {
    disbursementId: disbursementId,
    requestId: paymentInput.requestId,
    disbursedAmountThb: approvedThb,
    paymentSlipUrl: paymentSlipUrl,
    claimStatus: CLAIM_STATUS_TH.PAID
  };
}

function generatePromptPayBatchCsv(adminPasscode) {
  assertAdminAuthorized(adminPasscode);
  const overview = getDashboardOverview(adminPasscode);
  const csvLines = ['ลำดับ,รหัสคำร้อง,เลขบัตรประชาชน,ชื่อ-นามสกุล,เลขพร้อมเพย์,จำนวนเงินเยียวยา(บาท),ตำบล,สถานะ'];
  let sequenceNo = 1;

  for (let idx = 0; idx < overview.registrations.length; idx++) {
    const rec = overview.registrations[idx];
    if (rec.claimStatus === CLAIM_STATUS_TH.APPROVED && rec.approvedRemedyThb > 0) {
      const rowCsv = [
        sequenceNo,
        rec.requestId,
        '="' + rec.citizenId + '"',
        '"' + rec.fullname + '"',
        '="' + rec.promptpayNumber + '"',
        rec.approvedRemedyThb,
        '"' + rec.subdistrict + '"',
        '"' + rec.claimStatus + '"'
      ].join(',');
      csvLines.push(rowCsv);
      sequenceNo++;
    }
  }

  return {
    readyCount: sequenceNo - 1,
    csvContent: '\uFEFF' + csvLines.join('\r\n')
  };
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
    inspectorOfficerId: 'จท-กระบี่-01',
    damageCategory: 'เสียหายบางส่วน (หนัก)',
    reliefPackDelivered: true,
    inspectorNotes: 'น้ำท่วมสูงเกิน 1.3 เมตร มีผู้ป่วยติดเตียง มอบถุงยังชีพแล้ว อนุมัติเยียวยา 30,000 บาท'
  }, SYSTEM_CONFIG.ADMIN_PASSCODE);
}

const LINE_BOT_CONFIG = {
  CHANNEL_ACCESS_TOKEN: 'wwDapxda/LPw3YHuY2KgBN4hSm9LETc0fnl6dLmhdZCrrm1P3sASlY9k/QTeQkWVWfYdF3KRWb4yIU+tK4QENPAfa0vcNdMfTAPf2RVBhqGwY4zYHQ6mCALA/Sj4+Vx0RZGhGirVra808+UIIq3UWgdB04t89/1O/w1cDnyilFU=',
  BROADCAST_URL: 'https://api.line.me/v2/bot/message/broadcast'
};

function dispatchLineBroadcastMessage(flexMessageContainer) {
  if (!LINE_BOT_CONFIG.CHANNEL_ACCESS_TOKEN) {
    return;
  }
  try {
    const requestOptions = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        Authorization: 'Bearer ' + LINE_BOT_CONFIG.CHANNEL_ACCESS_TOKEN
      },
      payload: JSON.stringify({
        messages: [flexMessageContainer]
      }),
      muteHttpExceptions: true
    };
    const networkResponse = UrlFetchApp.fetch(LINE_BOT_CONFIG.BROADCAST_URL, requestOptions);
    Logger.log('LINE Dispatch Status: ' + networkResponse.getResponseCode());
    Logger.log('LINE Dispatch Body: ' + networkResponse.getContentText());
  } catch (dispatchError) {
    Logger.log('LINE Dispatch Exception: ' + dispatchError);
  }
}

function notifyLineNewRegistration(citizenRecord) {
  const isCriticalRed = citizenRecord.priorityTier === PRIORITY_TIERS_TH.RED;
  const headerColor = isCriticalRed ? '#DC2626' : '#2563EB';

  const flexCard = {
    type: 'flex',
    altText: '🚨 มีผู้ยื่นคำร้องใหม่: ' + citizenRecord.requestId + ' (' + citizenRecord.fullname + ')',
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: headerColor,
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: 'ระบบช่วยเหลือผู้ประสบอุทกภัย',
            color: '#E0E7FF',
            size: 'xs',
            weight: 'bold'
          },
          {
            type: 'text',
            text: '🚨 มีผู้ยื่นขอความช่วยเหลือใหม่',
            color: '#FFFFFF',
            size: 'lg',
            weight: 'bold',
            margin: 'sm'
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'รหัสคำร้อง', color: '#64748B', size: 'xs', flex: 4 },
              { type: 'text', text: citizenRecord.requestId, color: '#0F172A', size: 'xs', weight: 'bold', flex: 6, align: 'end' }
            ]
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'ผู้ประสบภัย', color: '#64748B', size: 'xs', flex: 4 },
              { type: 'text', text: citizenRecord.fullname, color: '#0F172A', size: 'xs', flex: 6, align: 'end' }
            ]
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'ตำบล/พื้นที่', color: '#64748B', size: 'xs', flex: 4 },
              { type: 'text', text: citizenRecord.subdistrict, color: '#0F172A', size: 'xs', flex: 6, align: 'end' }
            ]
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'ระดับน้ำ', color: '#64748B', size: 'xs', flex: 4 },
              { type: 'text', text: citizenRecord.waterDepthCm + ' ซม.', color: '#0F172A', size: 'xs', weight: 'bold', flex: 6, align: 'end' }
            ]
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'ความเร่งด่วน', color: '#64748B', size: 'xs', flex: 4 },
              { type: 'text', text: citizenRecord.priorityTier, color: headerColor, size: 'xs', weight: 'bold', flex: 6, align: 'end' }
            ]
          }
        ]
      }
    }
  };

  dispatchLineBroadcastMessage(flexCard);
}

function notifyLineAssessmentApproved(assessmentRecord) {
  const headerColor = assessmentRecord.isRejected ? '#64748B' : '#059669';
  const statusHeadline = assessmentRecord.isRejected ? 'ไม่อนุมัติการเยียวยา' : 'อนุมัติวงเงินเยียวยาแล้ว';

  const flexCard = {
    type: 'flex',
    altText: '📋 ผลการพิจารณาคำร้อง: ' + assessmentRecord.requestId + ' (' + statusHeadline + ')',
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: headerColor,
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: 'ผลการประเมินความเสียหายภาคสนาม',
            color: '#E2E8F0',
            size: 'xs',
            weight: 'bold'
          },
          {
            type: 'text',
            text: statusHeadline,
            color: '#FFFFFF',
            size: 'lg',
            weight: 'bold',
            margin: 'sm'
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'รหัสคำร้อง', color: '#64748B', size: 'xs', flex: 4 },
              { type: 'text', text: assessmentRecord.requestId, color: '#0F172A', size: 'xs', weight: 'bold', flex: 6, align: 'end' }
            ]
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'ผู้ประสบภัย', color: '#64748B', size: 'xs', flex: 4 },
              { type: 'text', text: assessmentRecord.fullname, color: '#0F172A', size: 'xs', flex: 6, align: 'end' }
            ]
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'ระดับความเสียหาย', color: '#64748B', size: 'xs', flex: 4 },
              { type: 'text', text: assessmentRecord.damageCategory, color: '#0F172A', size: 'xs', flex: 6, align: 'end' }
            ]
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'วงเงินที่อนุมัติ', color: '#64748B', size: 'xs', flex: 4 },
              {
                type: 'text',
                text: assessmentRecord.approvedAmountThb > 0
                  ? '฿' + assessmentRecord.approvedAmountThb.toLocaleString('th-TH') + ' บาท'
                  : '0 บาท',
                color: assessmentRecord.approvedAmountThb > 0 ? '#059669' : '#64748B',
                size: 'xs',
                weight: 'bold',
                flex: 6,
                align: 'end'
              }
            ]
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'การมอบถุงยังชีพ', color: '#64748B', size: 'xs', flex: 4 },
              {
                type: 'text',
                text: assessmentRecord.reliefPackDelivered ? 'มอบแล้ว' : 'ยังไม่ได้มอบ',
                color: '#0F172A',
                size: 'xs',
                flex: 6,
                align: 'end'
              }
            ]
          }
        ]
      }
    }
  };

  dispatchLineBroadcastMessage(flexCard);
}

function notifyLineDisbursementPaid(disbursementRecord) {
  const flexCard = {
    type: 'flex',
    altText: '💸 โอนเงินเยียวยาสำเร็จ: ' + disbursementRecord.requestId,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#0F766E',
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: 'การเงินและบัญชี ปภ.',
            color: '#CCFBF1',
            size: 'xs',
            weight: 'bold'
          },
          {
            type: 'text',
            text: '💸 โอนเงินเยียวยาสำเร็จแล้ว',
            color: '#FFFFFF',
            size: 'lg',
            weight: 'bold',
            margin: 'sm'
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'รหัสคำร้อง', color: '#64748B', size: 'xs', flex: 4 },
              { type: 'text', text: disbursementRecord.requestId, color: '#0F172A', size: 'xs', weight: 'bold', flex: 6, align: 'end' }
            ]
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'ผู้รับเงิน', color: '#64748B', size: 'xs', flex: 4 },
              { type: 'text', text: disbursementRecord.fullname, color: '#0F172A', size: 'xs', flex: 6, align: 'end' }
            ]
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'จำนวนเงินที่โอน', color: '#64748B', size: 'xs', flex: 4 },
              {
                type: 'text',
                text: '฿' + disbursementRecord.disbursedAmountThb.toLocaleString('th-TH') + ' บาท',
                color: '#059669',
                size: 'sm',
                weight: 'bold',
                flex: 6,
                align: 'end'
              }
            ]
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'ช่องทางโอน', color: '#64748B', size: 'xs', flex: 4 },
              { type: 'text', text: disbursementRecord.paymentChannel, color: '#0F172A', size: 'xs', flex: 6, align: 'end' }
            ]
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'เลขอ้างอิง', color: '#64748B', size: 'xs', flex: 4 },
              { type: 'text', text: disbursementRecord.transactionRef, color: '#64748B', size: 'xs', flex: 6, align: 'end' }
            ]
          }
        ]
      }
    }
  };

  dispatchLineBroadcastMessage(flexCard);
}

function testSendLineAlert() {
  notifyLineNewRegistration({
    requestId: 'REQ-2569-TEST01',
    fullname: 'ทดสอบ แจ้งเตือนผู้ประสบภัย',
    subdistrict: 'ตำบลเวียงพางคำ',
    waterDepthCm: 150,
    priorityTier: PRIORITY_TIERS_TH.RED,
    gpsLat: '20.4321',
    gpsLng: '99.8876'
  });
}

function authorizeLineUrlFetch() {
  UrlFetchApp.fetch('https://api.line.me');
}

// ========================================================
// KEEPALIVE CRON: ป้องกันเซิร์ฟเวอร์ LINE Bot หลับ (ANTI-SLEEP)
// ========================================================
function keepAliveLineWebhookServer() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const webhookHealthUrl = scriptProperties.getProperty('WEBHOOK_HEALTH_URL') || '';
  if (!webhookHealthUrl) {
    Logger.log('[KeepAlive] ยังไม่ได้กำหนดค่า WEBHOOK_HEALTH_URL ใน Script Properties');
    return;
  }

  try {
    const response = UrlFetchApp.fetch(webhookHealthUrl, {
      method: 'get',
      muteHttpExceptions: true
    });
    Logger.log('[KeepAlive] สะกิดปลุกเซิร์ฟเวอร์สำเร็จ: HTTP ' + response.getResponseCode());
  } catch (err) {
    Logger.log('[KeepAlive] เกิดข้อผิดพลาดในการปลุกเซิร์ฟเวอร์: ' + err.message);
  }
}

function setupKeepAliveTrigger(targetWebhookHealthUrl) {
  if (targetWebhookHealthUrl) {
    PropertiesService.getScriptProperties().setProperty('WEBHOOK_HEALTH_URL', targetWebhookHealthUrl);
  }

  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'keepAliveLineWebhookServer') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger('keepAliveLineWebhookServer')
    .timeBased()
    .everyMinutes(5)
    .create();

  Logger.log('[KeepAlive] ตั้งเวลาสะกิดปลุกเซิร์ฟเวอร์อัตโนมัติทุก 5 นาทีเรียบร้อยแล้ว!');
}

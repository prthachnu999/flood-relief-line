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

function recordFieldAssessment(assessmentInput) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const regSheet = spreadsheet.getSheetByName(TABLE_SCHEMAS.tbl_registrations.sheetName);
  const assessmentSchema = TABLE_SCHEMAS.tbl_assessments;
  const assessmentSheet = spreadsheet.getSheetByName(assessmentSchema.sheetName);

  const matchedRowIndex = findRegistrationRowIndexById(regSheet, assessmentInput.requestId);
  if (matchedRowIndex === -1) {
    throw new Error('ไม่พบรหัสคำร้อง: ' + assessmentInput.requestId);
  }

  const assessmentId = generateNextSequentialId(assessmentSheet, 'ASM');
  const thaiDamageLabel = resolveThaiDamageLabel(assessmentInput.damageCategory);
  const approvedAmountThb = computeApprovedRemedyAmount(thaiDamageLabel);
  const isRejected = thaiDamageLabel === DAMAGE_CATEGORY_TH.INELIGIBLE;
  const updatedClaimStatus = isRejected ? CLAIM_STATUS_TH.REJECTED : CLAIM_STATUS_TH.APPROVED;
  const assessedTimestamp = formatThaiTimestamp();

  const assessmentRow = [
    assessmentId,
    assessmentInput.requestId,
    assessmentInput.inspectorOfficerId || 'เจ้าหน้าที่สำรวจภาคสนาม',
    thaiDamageLabel,
    approvedAmountThb,
    assessmentInput.reliefPackDelivered ? 'มอบถุงยังชีพแล้ว' : 'ยังไม่ได้มอบ',
    String(assessmentInput.inspectorNotes || ''),
    assessedTimestamp
  ];

  writeFormattedSheetRow(assessmentSheet, assessmentRow, assessmentSchema.textFormatColumnIndices);

  const statusCell = regSheet.getRange(matchedRowIndex, 24);
  const previousStatus = statusCell.getValue();
  statusCell.setValue(updatedClaimStatus);

  appendAuditLogEntry(
    spreadsheet,
    assessmentInput.requestId,
    'ประเมินความเสียหายภาคสนาม',
    assessmentInput.inspectorOfficerId || 'เจ้าหน้าที่สำรวจ',
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatThaiTimestamp,
    generateNextSequentialId,
    writeFormattedSheetRow,
    appendAuditLogEntry,
    validateSubmissionFields,
    uploadRegistrationEvidence,
    submitCitizenRegistration,
    resolveThaiDamageLabel,
    recordFieldAssessment,
    findRegistrationRowIndexById,
    findRegistrationByKeyword
  };
}

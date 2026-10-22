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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateNextSequentialId,
    appendAuditLogEntry,
    validateSubmissionFields,
    uploadRegistrationEvidence,
    submitCitizenRegistration,
    recordFieldAssessment,
    findRegistrationRowIndexById,
    findRegistrationByKeyword
  };
}

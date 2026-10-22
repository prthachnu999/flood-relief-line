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

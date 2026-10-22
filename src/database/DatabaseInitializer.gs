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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeFloodReliefDatabase,
    provisionWorksheet,
    configureSheetHeaders,
    applyPlainTextColumnFormatting,
    applyColumnValidations,
    ensureEvidenceRootFolder
  };
}

const assert = require('assert');
const {
  SYSTEM_CONFIG,
  PRIORITY_TIERS_TH,
  CLAIM_STATUS_TH,
  DAMAGE_CATEGORY_TH,
  TABLE_SCHEMAS
} = require('../src/database/SchemaConfig.gs');
const {
  initializeFloodReliefDatabase,
  ensureEvidenceRootFolder
} = require('../src/database/DatabaseInitializer.gs');
const {
  createRequestEvidenceFolder,
  saveBase64EvidenceImage
} = require('../src/storage/DriveEvidenceService.gs');

function createGasEnvironmentMocks() {
  const propertyStore = {};
  const sheetsMap = {};
  const foldersMap = {};

  global.SYSTEM_CONFIG = SYSTEM_CONFIG;
  global.PRIORITY_TIERS_TH = PRIORITY_TIERS_TH;
  global.CLAIM_STATUS_TH = CLAIM_STATUS_TH;
  global.DAMAGE_CATEGORY_TH = DAMAGE_CATEGORY_TH;
  global.TABLE_SCHEMAS = TABLE_SCHEMAS;
  global.ensureEvidenceRootFolder = ensureEvidenceRootFolder;

  global.PropertiesService = {
    getScriptProperties: () => ({
      getProperty: (key) => propertyStore[key] || null,
      setProperty: (key, value) => {
        propertyStore[key] = value;
      }
    })
  };

  global.SpreadsheetApp = {
    getActiveSpreadsheet: () => ({
      getId: () => 'MOCK_SPREADSHEET_ID_2026',
      getSheetByName: (name) => sheetsMap[name] || null,
      setActiveSheet: () => {},
      deleteSheet: (sheetObj) => {
        delete sheetsMap[sheetObj.name];
      },
      insertSheet: (name) => {
        const mockSheet = {
          name,
          tabColor: null,
          frozenRows: 0,
          formats: [],
          validations: [],
          setTabColor: function (color) { this.tabColor = color; },
          setFrozenRows: function (rows) { this.frozenRows = rows; },
          setColumnWidth: function () {},
          getMaxRows: () => 1000,
          getRange: function (row, col, numRows, numCols) {
            return {
              setValues: () => {},
              setBackground: () => {},
              setFontColor: () => {},
              setFontWeight: () => {},
              setHorizontalAlignment: () => {},
              setNumberFormat: (fmt) => {
                mockSheet.formats.push({ col, fmt });
              },
              setDataValidation: (rule) => {
                mockSheet.validations.push({ col, rule });
              }
            };
          }
        };
        sheetsMap[name] = mockSheet;
        return mockSheet;
      }
    }),
    newDataValidation: () => ({
      requireValueInList: function (list) {
        this.list = list;
        return this;
      },
      setAllowInvalid: function () { return this; },
      build: function () { return { allowedValues: this.list }; }
    })
  };

  global.DriveApp = {
    Access: { ANYONE_WITH_LINK: 'ANYONE_WITH_LINK' },
    Permission: { VIEW: 'VIEW' },
    getFoldersByName: (name) => ({
      hasNext: () => Boolean(foldersMap[name]),
      next: () => foldersMap[name]
    }),
    createFolder: (name) => {
      const folderRecord = {
        id: 'FOLDER_' + name,
        url: 'https://drive.google.com/drive/folders/' + name,
        subfolders: {},
        getId: () => 'FOLDER_' + name,
        getUrl: () => 'https://drive.google.com/drive/folders/' + name,
        getFoldersByName: function (subName) {
          return {
            hasNext: () => Boolean(this.subfolders[subName]),
            next: () => this.subfolders[subName]
          };
        },
        createFolder: function (subName) {
          const subRecord = {
            getId: () => 'SUBFOLDER_' + subName,
            getUrl: () => 'https://drive.google.com/drive/folders/' + subName,
            createFile: (blob) => ({
              setSharing: () => {},
              getUrl: () => 'https://drive.google.com/file/d/' + blob.name
            })
          };
          this.subfolders[subName] = subRecord;
          foldersMap['SUBFOLDER_' + subName] = subRecord;
          return subRecord;
        }
      };
      foldersMap[name] = folderRecord;
      foldersMap[folderRecord.id] = folderRecord;
      return folderRecord;
    },
    getFolderById: (id) => foldersMap[id]
  };

  global.Utilities = {
    base64Decode: (str) => Buffer.from(str, 'base64'),
    newBlob: (bytes, mimeType, name) => ({ bytes, mimeType, name })
  };

  return { sheetsMap, propertyStore, foldersMap };
}

function runPhase1Tests() {
  const { sheetsMap, propertyStore } = createGasEnvironmentMocks();

  const initSummary = initializeFloodReliefDatabase();
  assert.strictEqual(initSummary.spreadsheetId, 'MOCK_SPREADSHEET_ID_2026');
  assert.strictEqual(initSummary.provisionedTables.length, 5);
  assert.ok(sheetsMap['1_ทะเบียนคำร้องผู้ประสบภัย'], 'Thai registration sheet must be provisioned');
  assert.ok(sheetsMap['2_ผลสำรวจความเสียหาย'], 'Thai assessment sheet must be provisioned');
  assert.ok(sheetsMap['3_ประวัติการโอนเงินเยียวยา'], 'Thai disbursement sheet must be provisioned');
  assert.ok(sheetsMap['4_ฐานข้อมูลทะเบียนราษฎร์'], 'Thai master citizen sheet must be provisioned');
  assert.ok(sheetsMap['5_ประวัติการใช้งานระบบ'], 'Thai audit log sheet must be provisioned');

  assert.strictEqual(
    propertyStore[SYSTEM_CONFIG.SCRIPT_PROP_FOLDER_ID],
    'FOLDER_คลังภาพหลักฐานผู้ประสบอุทกภัย_2569'
  );

  const folderMeta = createRequestEvidenceFolder('REQ-2569-00001');
  assert.strictEqual(folderMeta.folderId, 'SUBFOLDER_REQ-2569-00001');

  const uploadedUrl = saveBase64EvidenceImage(
    folderMeta.folderId,
    'ภาพบ้านเสียหาย',
    'data:image/jpeg;base64,SGVsbG8=',
    'image/jpeg'
  );
  assert.ok(uploadedUrl.startsWith('https://drive.google.com/file/d/ภาพบ้านเสียหาย_'));

  console.log('ALL PHASE 1 THAI SCHEMA TESTS PASSED SUCCESSFULLY.');
}

runPhase1Tests();

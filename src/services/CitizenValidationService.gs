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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    sanitizeNumericDigits,
    isValidThaiNationalId,
    isValidPromptPayAccount,
    detectDuplicateRegistration,
    buildAddressKey
  };
}

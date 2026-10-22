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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    REMEDY_RATES_THB,
    calculateWaterDepthScore,
    calculateHouseholdVulnerabilityScore,
    resolvePriorityTier,
    evaluateVulnerabilityTriage,
    computeApprovedRemedyAmount
  };
}

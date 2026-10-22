import {
  ClaimSubmissionInput,
  ReliefClaimRecord,
  ClaimStatus
} from './claim-domain-types.js';

export class ClaimRegistrationService {
  private readonly claimStore: Map<string, ReliefClaimRecord> = new Map();

  public registerClaim(submissionInput: ClaimSubmissionInput): ReliefClaimRecord {
    if (!submissionInput.lineUserId) {
      throw new Error('MISSING_LINE_USER_ID: Line user identity is mandatory');
    }
    const isEmergencySos = submissionInput.citizenNationalId.startsWith('SOS-');
    if (!isEmergencySos && !/^\d{13}$/.test(submissionInput.citizenNationalId)) {
      throw new Error('INVALID_CITIZEN_ID: National ID must be 13 digits');
    }
    if (submissionInput.latitude < -90 || submissionInput.latitude > 90) {
      throw new Error('INVALID_COORDINATES: Latitude out of range');
    }

    const generatedClaimId = `FL-${Date.now().toString(36).toUpperCase()}`;
    const timestampNow = new Date().toISOString();

    const newClaimRecord: ReliefClaimRecord = {
      claimId: generatedClaimId,
      lineUserId: submissionInput.lineUserId,
      citizenNationalId: submissionInput.citizenNationalId,
      claimantFullName: submissionInput.claimantFullName,
      contactTelephone: submissionInput.contactTelephone,
      floodLocation: {
        latitude: submissionInput.latitude,
        longitude: submissionInput.longitude,
        accuracyMeters: submissionInput.accuracyMeters
      },
      residentialAddress: submissionInput.residentialAddress,
      disasterCategory: submissionInput.disasterCategory,
      damagePhotoUrls: submissionInput.damagePhotoUrls,
      claimStatus: 'PENDING_REVIEW',
      approvedCompensationAmount: 0,
      createdTimestamp: timestampNow,
      updatedTimestamp: timestampNow
    };

    this.claimStore.set(generatedClaimId, newClaimRecord);
    return newClaimRecord;
  }

  public findClaimById(targetClaimId: string): ReliefClaimRecord | undefined {
    return this.claimStore.get(targetClaimId);
  }

  public updateClaimStatus(
    targetClaimId: string,
    nextStatus: ClaimStatus,
    grantCompensationAmount: number = 0
  ): ReliefClaimRecord {
    const existingClaim = this.claimStore.get(targetClaimId);
    if (!existingClaim) {
      throw new Error(`CLAIM_NOT_FOUND: Record ${targetClaimId} does not exist`);
    }

    existingClaim.claimStatus = nextStatus;
    existingClaim.approvedCompensationAmount = grantCompensationAmount;
    existingClaim.updatedTimestamp = new Date().toISOString();
    return existingClaim;
  }
}

export type ClaimStatus =
  | 'PENDING_REVIEW'
  | 'FIELD_VERIFIED'
  | 'APPROVED'
  | 'REJECTED'
  | 'DISBURSED';

export type DisasterCategory =
  | 'WATERLOGGED_OVER_7_DAYS'
  | 'HOUSE_PARTIALLY_DAMAGED'
  | 'HOUSE_COMPLETELY_DESTROYED'
  | 'AGRICULTURAL_LAND_FLOODED';

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
}

export interface ReliefClaimRecord {
  claimId: string;
  lineUserId: string;
  citizenNationalId: string;
  claimantFullName: string;
  contactTelephone: string;
  floodLocation: GeoCoordinate;
  residentialAddress: string;
  disasterCategory: DisasterCategory;
  damagePhotoUrls: string[];
  claimStatus: ClaimStatus;
  approvedCompensationAmount: number;
  createdTimestamp: string;
  updatedTimestamp: string;
}

export interface ClaimSubmissionInput {
  lineUserId: string;
  citizenNationalId: string;
  claimantFullName: string;
  contactTelephone: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  residentialAddress: string;
  disasterCategory: DisasterCategory;
  damagePhotoUrls: string[];
}

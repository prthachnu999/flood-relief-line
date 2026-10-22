import { Request, Response } from 'express';
import { ClaimRegistrationService } from './claim-registration-service.js';
import { ClaimSubmissionInput } from './claim-domain-types.js';

export class ClaimsApiController {
  constructor(private readonly claimService: ClaimRegistrationService) {}

  public createClaim(incomingRequest: Request, outgoingResponse: Response): void {
    try {
      const submissionBody = incomingRequest.body as ClaimSubmissionInput;
      const registeredClaim = this.claimService.registerClaim(submissionBody);
      outgoingResponse.status(201).json(registeredClaim);
    } catch (claimError: any) {
      outgoingResponse.status(400).json({ errorMessage: claimError.message });
    }
  }

  public getClaimStatus(incomingRequest: Request, outgoingResponse: Response): void {
    const targetClaimId = String(incomingRequest.params.claimId ?? '');
    const foundClaim = this.claimService.findClaimById(targetClaimId);

    if (!foundClaim) {
      outgoingResponse.status(404).json({ errorMessage: 'CLAIM_NOT_FOUND' });
      return;
    }

    outgoingResponse.status(200).json(foundClaim);
  }

  public updateClaimStatus(incomingRequest: Request, outgoingResponse: Response): void {
    try {
      const targetClaimId = String(incomingRequest.params.claimId ?? '');
      const { claimStatus, approvedCompensationAmount } = incomingRequest.body;
      const updatedClaim = this.claimService.updateClaimStatus(
        targetClaimId,
        claimStatus,
        approvedCompensationAmount
      );
      outgoingResponse.status(200).json(updatedClaim);
    } catch (updateError: any) {
      outgoingResponse.status(400).json({ errorMessage: updateError.message });
    }
  }
}

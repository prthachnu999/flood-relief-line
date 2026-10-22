import { Request, Response } from 'express';
import crypto from 'crypto';
import { ClaimRegistrationService } from '../relief-claims/claim-registration-service.js';
import { FlexMessageBuilder } from '../line-messaging/flex-message-builder.js';

export class LineWebhookController {
  constructor(
    private readonly channelSecret: string,
    private readonly channelAccessToken: string,
    private readonly liffAppUrl: string,
    private readonly claimService: ClaimRegistrationService
  ) {}

  public verifySignature(rawBodyBuffer: Buffer, signatureHeader: string): boolean {
    if (!signatureHeader || !this.channelSecret) {
      return false;
    }
    const computedSignature = crypto
      .createHmac('SHA256', this.channelSecret)
      .update(rawBodyBuffer)
      .digest('base64');

    return computedSignature === signatureHeader;
  }

  public async processWebhookEvents(
    incomingRequest: Request,
    outgoingResponse: Response
  ): Promise<void> {
    const signature = incomingRequest.headers['x-line-signature'] as string;
    const bodyBuffer = incomingRequest.body as Buffer;

    if (!this.verifySignature(bodyBuffer, signature)) {
      outgoingResponse.status(403).json({ errorMessage: 'FORBIDDEN_SIGNATURE_MISMATCH' });
      return;
    }

    const parsedBody = JSON.parse(bodyBuffer.toString('utf-8'));
    const lineEvents: any[] = parsedBody.events ?? [];

    for (const singleEvent of lineEvents) {
      await this.routeSingleEvent(singleEvent);
    }

    outgoingResponse.status(200).json({ statusMessage: 'EVENTS_PROCESSED' });
  }

  private async routeSingleEvent(singleEvent: any): Promise<void> {
    if (singleEvent.type !== 'message' || singleEvent.message.type !== 'text') {
      return;
    }

    const userMessageText: string = singleEvent.message.text.trim();
    const replyToken: string = singleEvent.replyToken;

    if (userMessageText.startsWith('FL-')) {
      const claimRecord = this.claimService.findClaimById(userMessageText);
      if (!claimRecord) {
        await this.sendLineReply(replyToken, [
          { type: 'text', text: `ไม่พบข้อมูลคำร้องหมายเลข "${userMessageText}" ในระบบ` }
        ]);
        return;
      }

      const flexMessage = FlexMessageBuilder.buildClaimStatusFlex(claimRecord, this.liffAppUrl);
      await this.sendLineReply(replyToken, [flexMessage]);
      return;
    }

    if (userMessageText === 'เช็คสถานะ' || userMessageText === 'ตรวจสอบสถานะ') {
      await this.sendLineReply(replyToken, [
        {
          type: 'text',
          text: 'กรุณาพิมพ์รหัสคำร้องของคุณ (เช่น FL-XXXX) หรือเปิดเมนู "ตรวจสอบสถานะคำร้อง" จาก Rich Menu'
        }
      ]);
    }
  }

  private async sendLineReply(replyToken: string, messageCollection: any[]): Promise<void> {
    if (!this.channelAccessToken) {
      return;
    }

    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.channelAccessToken}`
      },
      body: JSON.stringify({
        replyToken,
        messages: messageCollection
      })
    });
  }
}

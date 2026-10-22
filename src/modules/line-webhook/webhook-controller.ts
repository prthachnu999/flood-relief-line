import { Request, Response } from 'express';
import crypto from 'crypto';
import { ClaimRegistrationService } from '../relief-claims/claim-registration-service.js';
import { FlexMessageBuilder } from '../line-messaging/flex-message-builder.js';

function matchEmergencyIntent(textInput: string): boolean {
  return /ช่วยเหลือ|กู้ภัย|พิกัด|ยังชีพ|น้ำท่วม|ติดค้าง|ฉุกเฉิน/.test(textInput);
}

function matchHotlineIntent(textInput: string): boolean {
  return /1784|สายด่วน|โทร|เบอร์/.test(textInput);
}

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
    if (singleEvent.type !== 'message') {
      return;
    }

    const replyToken: string = singleEvent.replyToken;

    if (singleEvent.message.type === 'location') {
      const locationLatitude = singleEvent.message.latitude;
      const locationLongitude = singleEvent.message.longitude;
      const locationAddress = singleEvent.message.address || 'จุดพิกัดดาวเทียม';

      await this.sendLineReply(replyToken, [
        {
          type: 'text',
          text: `📍 ได้รับพิกัดขอความช่วยเหลือเรียบร้อยแล้ว!\n\n• ละติจูด: ${locationLatitude}\n• ลองจิจูด: ${locationLongitude}\n• บริเวณ: ${locationAddress}\n\nระบบได้ส่งต่อพิกัดนี้เข้าศูนย์กู้ภัย ปภ. ประจำพื้นที่เพื่อจัดสรรเรือและถุงยังชีพเข้าช่วยเหลือแล้วครับ`
        }
      ]);
      return;
    }

    if (singleEvent.message.type !== 'text') {
      return;
    }

    const userMessageText: string = singleEvent.message.text.trim();

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
      return;
    }

    if (matchEmergencyIntent(userMessageText)) {
      await this.sendLineReply(replyToken, [
        {
          type: 'text',
          text: '🚨 ศูนย์รับแจ้งเหตุน้ำท่วมและขอความช่วยเหลือด่วน\n\n• ขอเรือกู้ภัย / ถุงยังชีพ / อพยพฉุกเฉิน\n• กรุณากดปุ่ม [+] ที่มุมล่างซ้าย แล้วเลือก "ตำแหน่งที่ตั้ง" (Location) เพื่อส่งพิกัดบ้านที่ติดค้างให้เจ้าหน้าที่เข้าช่วยทันที\n\nหรือติดต่อสายด่วนนิรภัย ปภ. โทร 1784 (โทรฟรี 24 ชม.)'
        }
      ]);
      return;
    }

    if (matchHotlineIntent(userMessageText)) {
      await this.sendLineReply(replyToken, [
        {
          type: 'text',
          text: '📞 สายด่วนนิรภัย ปภ. 1784 (โทรฟรี 24 ชั่วโมง)\n\n• กรมป้องกันและบรรเทาสาธารณภัย (ปภ.)\n• ศูนย์เตือนภัยพิบัติแห่งชาติ\n• แจ้งเหตุด่วนทาง LINE ปภ.: @1784DDPM'
        }
      ]);
      return;
    }

    await this.sendLineReply(replyToken, [
      {
        type: 'text',
        text: 'ศูนย์ช่วยเหลือเยียวยาผู้ประสบอุทกภัย ยินดีให้บริการครับ\n\nกรุณาเลือกเมนูจากแถบด้านล่าง:\n• ยื่นขอเงินเยียวยา (5,000 - 9,000 บ.)\n• ตรวจสอบสถานะคำร้อง (พิมพ์ FL-XXXX)\n• แจ้งพิกัดน้ำท่วม / ขอถุงยังชีพ\n• สายด่วน 1784'
      }
    ]);
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

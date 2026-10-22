import { Request, Response } from 'express';
import crypto from 'crypto';
import { ClaimRegistrationService } from '../relief-claims/claim-registration-service.js';
import { FlexMessageBuilder, LiveSheetClaimRecord } from '../line-messaging/flex-message-builder.js';

function matchEmergencyIntent(textInput: string): boolean {
  return /ช่วยเหลือ|กู้ภัย|พิกัด|ยังชีพ|น้ำท่วม|ติดค้าง|ฉุกเฉิน|หมุด|ตำแหน่ง/.test(textInput);
}

function matchHotlineIntent(textInput: string): boolean {
  return /1784|สายด่วน|โทร|เบอร์/.test(textInput);
}

export class LineWebhookController {
  constructor(
    private readonly channelSecret: string,
    private readonly channelAccessToken: string,
    private readonly liffAppUrl: string,
    private readonly claimService: ClaimRegistrationService,
    private readonly googleAppsScriptUrl: string = 'https://script.google.com/macros/s/AKfycbyfa-XLxBg2qLLNeKqlATZNEGg4M70JUuE7p2zyZ-fceGBRnSGszkPP9eDIznGHpacm/exec'
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
      const senderUserId = singleEvent.source?.userId || '';

      const claimantName = await this.resolveLineProfileName(senderUserId);
      const assignedRequestId = await this.dispatchEmergencySosToSheet({
        claimantName,
        lineUserId: senderUserId,
        latitude: locationLatitude,
        longitude: locationLongitude,
        addressText: locationAddress
      });

      const confirmedFlex = FlexMessageBuilder.buildLocationConfirmedFlex({
        requestId: assignedRequestId,
        claimantName,
        latitude: locationLatitude,
        longitude: locationLongitude,
        locationAddress
      });

      await this.sendLineReply(replyToken, [confirmedFlex]);
      return;
    }

    if (singleEvent.message.type !== 'text') {
      return;
    }

    const userMessageText: string = singleEvent.message.text.trim();

    if (userMessageText === 'เช็คสถานะ' || userMessageText === 'ตรวจสอบสถานะ') {
      await this.sendLineReply(replyToken, [
        {
          type: 'text',
          text: `🔍 ระบบตรวจสอบสถานะคำร้องผู้ประสบภัย\n\n📌 ท่านสามารถตรวจสอบสถานะได้ทันที โดยพิมพ์:\n• "รหัสคำร้อง" (เช่น REQ-2569-00002)\n• หรือ "เลขบัตรประชาชน 13 หลัก"\n• หรือ "เบอร์โทรศัพท์" ที่ใช้ยื่นคำร้อง (เช่น 0812345678)\n\nแล้วส่งข้อความเข้ามาในแชทนี้ได้เลยครับ\n\n🌐 หรือแตะลิงก์เพื่อตรวจสอบผ่านหน้าเว็บ:\n${this.googleAppsScriptUrl}`
        }
      ]);
      return;
    }

    const cleanDigits = userMessageText.replace(/\D/g, '');
    const isRequestId = /^REQ-/i.test(userMessageText) || /^FL-/i.test(userMessageText);
    const isCitizenId = cleanDigits.length === 13;
    const isPhoneNumber =
      (cleanDigits.length === 9 || cleanDigits.length === 10) && cleanDigits.startsWith('0');

    if (isRequestId || isCitizenId || isPhoneNumber) {
      const searchTarget = isRequestId ? userMessageText : cleanDigits;
      await this.handleStatusQuery(replyToken, searchTarget);
      return;
    }

    if (matchEmergencyIntent(userMessageText)) {
      const emergencyCard = FlexMessageBuilder.buildEmergencyHelpFlex(this.liffAppUrl);
      await this.sendLineReply(replyToken, [emergencyCard]);
      return;
    }

    if (matchHotlineIntent(userMessageText)) {
      const hotlineCard = FlexMessageBuilder.buildHotlineFlex();
      await this.sendLineReply(replyToken, [hotlineCard]);
      return;
    }

    await this.sendLineReply(replyToken, [
      {
        type: 'text',
        text: 'ศูนย์ช่วยเหลือเยียวยาผู้ประสบอุทกภัย ยินดีให้บริการครับ\n\nกรุณาเลือกเมนูจากแถบด้านล่าง:\n• ยื่นขอเงินเยียวยา\n• ตรวจสอบสถานะคำร้อง (พิมพ์ REQ-..., เลขบัตร ปชช. หรือ เบอร์โทรศัพท์)\n• แจ้งพิกัดน้ำท่วม / ขอถุงยังชีพ\n• สายด่วน 1784'
      }
    ]);
  }

  private async handleStatusQuery(replyToken: string, queryKeyword: string): Promise<void> {
    try {
      const searchEndpoint = `${this.googleAppsScriptUrl}?action=search&keyword=${encodeURIComponent(queryKeyword)}`;
      const httpResponse = await fetch(searchEndpoint, { redirect: 'follow' });
      const responseData = (await httpResponse.json()) as { records?: LiveSheetClaimRecord[] };
      const matchedRecords = responseData.records || [];

      if (matchedRecords.length > 0) {
        const statusCards = matchedRecords.slice(0, 3).map((singleRecord) =>
          FlexMessageBuilder.buildLiveSheetStatusFlex(singleRecord, this.googleAppsScriptUrl)
        );
        await this.sendLineReply(replyToken, statusCards);
        return;
      }
    } catch (networkError) {
      console.error('[Webhook] Failed to query Google Sheets:', networkError);
    }

    const localClaim = this.claimService.findClaimById(queryKeyword);
    if (localClaim) {
      const flexMessage = FlexMessageBuilder.buildClaimStatusFlex(localClaim, this.liffAppUrl);
      await this.sendLineReply(replyToken, [flexMessage]);
      return;
    }

    await this.sendLineReply(replyToken, [
      {
        type: 'text',
        text: `⚠️ ไม่พบข้อมูลคำร้องจาก "${queryKeyword}" ในระบบ\n\nโปรดตรวจสอบรหัสคำร้อง (เช่น REQ-2569-00002), เลขบัตรประชาชน 13 หลัก หรือเบอร์โทรศัพท์ที่ใช้ยื่นคำขออีกครั้งครับ\n\n🌐 หรือค้นหาผ่านหน้าเว็บได้ที่:\n${this.googleAppsScriptUrl}`
      }
    ]);
  }

  private async resolveLineProfileName(lineUserId?: string): Promise<string> {
    if (!lineUserId || !this.channelAccessToken) {
      return 'ผู้ประสบภัย (LINE)';
    }
    try {
      const profileResponse = await fetch(`https://api.line.me/v2/bot/profile/${lineUserId}`, {
        headers: { Authorization: `Bearer ${this.channelAccessToken}` }
      });
      if (profileResponse.ok) {
        const profileBody = (await profileResponse.json()) as { displayName?: string };
        if (profileBody.displayName) {
          return profileBody.displayName;
        }
      }
    } catch (_) {}
    return 'ผู้ประสบภัย (LINE)';
  }

  private async dispatchEmergencySosToSheet(sosParams: {
    claimantName: string;
    lineUserId: string;
    latitude: number;
    longitude: number;
    addressText: string;
  }): Promise<string> {
    const fallbackId = `REQ-SOS-${Date.now().toString().slice(-4)}`;
    try {
      const sosEndpoint = `${this.googleAppsScriptUrl}?action=sosEmergency&fullname=${encodeURIComponent(sosParams.claimantName)}&lineUserId=${encodeURIComponent(sosParams.lineUserId)}&lat=${encodeURIComponent(sosParams.latitude)}&lng=${encodeURIComponent(sosParams.longitude)}&address=${encodeURIComponent(sosParams.addressText)}`;
      const sosResponse = await fetch(sosEndpoint, { redirect: 'follow' });
      if (sosResponse.ok) {
        const sosJson = (await sosResponse.json()) as { requestId?: string };
        if (sosJson.requestId) {
          return sosJson.requestId;
        }
      }
    } catch (_) {}
    return fallbackId;
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

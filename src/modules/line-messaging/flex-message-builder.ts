import { ReliefClaimRecord } from '../relief-claims/claim-domain-types.js';

export interface LiveSheetClaimRecord {
  requestId: string;
  createdAt: string;
  fullname: string;
  phoneNumber?: string;
  addressText: string;
  subdistrict: string;
  waterDepthCm: number;
  priorityScore: number;
  priorityTier: string;
  claimStatus: string;
  approvedRemedyThb: number;
}

export class FlexMessageBuilder {
  private static resolveStatusBadgeColor(claimStatus: string): string {
    if (claimStatus === 'อนุมัติเยียวยา' || claimStatus === 'ช่วยเหลือแล้ว') {
      return '#10B981';
    }
    if (claimStatus === 'โอนเงินสำเร็จ') {
      return '#059669';
    }
    if (claimStatus === 'สำรวจพื้นที่แล้ว') {
      return '#3B82F6';
    }
    if (claimStatus === 'ไม่อนุมัติ') {
      return '#EF4444';
    }
    if (claimStatus === 'พักตรวจสอบ (ข้อมูลซ้ำ)') {
      return '#8B5CF6';
    }
    return '#F59E0B';
  }

  public static buildLiveSheetStatusFlex(sheetRecord: LiveSheetClaimRecord, webAppUrl: string) {
    const badgeColor = this.resolveStatusBadgeColor(sheetRecord.claimStatus);

    return {
      type: 'flex',
      altText: `สถานะคำร้อง ${sheetRecord.requestId}: ${sheetRecord.claimStatus}`,
      contents: {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          backgroundColor: '#0F172A',
          paddingAll: '16px',
          contents: [
            {
              type: 'text',
              text: 'ระบบช่วยเหลือเยียวยาผู้ประสบอุทกภัย',
              color: '#94A3B8',
              size: 'xs',
              weight: 'bold'
            },
            {
              type: 'text',
              text: sheetRecord.claimStatus,
              color: badgeColor,
              size: 'lg',
              weight: 'bold',
              margin: 'sm'
            }
          ]
        },
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                { type: 'text', text: 'รหัสคำร้อง', color: '#64748B', size: 'xs', flex: 4 },
                { type: 'text', text: sheetRecord.requestId, color: '#0F172A', size: 'xs', weight: 'bold', flex: 6, align: 'end' }
              ]
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                { type: 'text', text: 'ผู้ยื่นคำขอ', color: '#64748B', size: 'xs', flex: 4 },
                { type: 'text', text: sheetRecord.fullname, color: '#0F172A', size: 'xs', flex: 6, align: 'end' }
              ]
            },
            ...(sheetRecord.phoneNumber
              ? [
                  {
                    type: 'box',
                    layout: 'horizontal',
                    contents: [
                      { type: 'text', text: 'เบอร์ติดต่อ', color: '#64748B', size: 'xs', flex: 4 },
                      { type: 'text', text: sheetRecord.phoneNumber, color: '#0F172A', size: 'xs', flex: 6, align: 'end' }
                    ]
                  }
                ]
              : []),
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                { type: 'text', text: 'พื้นที่/ตำบล', color: '#64748B', size: 'xs', flex: 4 },
                { type: 'text', text: sheetRecord.subdistrict, color: '#0F172A', size: 'xs', flex: 6, align: 'end' }
              ]
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                { type: 'text', text: 'ระดับน้ำ', color: '#64748B', size: 'xs', flex: 4 },
                { type: 'text', text: `${sheetRecord.waterDepthCm} ซม.`, color: '#0F172A', size: 'xs', flex: 6, align: 'end' }
              ]
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                { type: 'text', text: 'เงินเยียวยา', color: '#64748B', size: 'xs', flex: 4 },
                {
                  type: 'text',
                  text: sheetRecord.approvedRemedyThb > 0
                    ? `฿${sheetRecord.approvedRemedyThb.toLocaleString('th-TH')} บาท`
                    : 'รอผลประเมินพื้นที่',
                  color: sheetRecord.approvedRemedyThb > 0 ? '#10B981' : '#64748B',
                  size: 'xs',
                  weight: 'bold',
                  flex: 6,
                  align: 'end'
                }
              ]
            }
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'button',
              style: 'primary',
              color: '#2563EB',
              action: {
                type: 'uri',
                label: '🌐 ตรวจสอบผ่านหน้าเว็บระบบ',
                uri: webAppUrl
              }
            }
          ]
        }
      }
    };
  }

  private static resolveStatusTheme(status: string): { statusLabel: string; badgeColor: string } {
    switch (status) {
      case 'APPROVED':
        return { statusLabel: 'อนุมัติการช่วยเหลือแล้ว', badgeColor: '#10B981' };
      case 'DISBURSED':
        return { statusLabel: 'โอนเงินเยียวยาสำเร็จ', badgeColor: '#059669' };
      case 'FIELD_VERIFIED':
        return { statusLabel: 'เจ้าหน้าที่ตรวจสอบพื้นที่แล้ว', badgeColor: '#3B82F6' };
      case 'REJECTED':
        return { statusLabel: 'ไม่ผ่านเกณฑ์การเยียวยา', badgeColor: '#EF4444' };
      default:
        return { statusLabel: 'อยู่ระหว่างรอการตรวจสอบ', badgeColor: '#F59E0B' };
    }
  }

  public static buildClaimStatusFlex(claimRecord: ReliefClaimRecord, liffAppUrl: string) {
    const statusTheme = this.resolveStatusTheme(claimRecord.claimStatus);

    return {
      type: 'flex',
      altText: `แจ้งสถานะคำร้อง ${claimRecord.claimId}: ${statusTheme.statusLabel}`,
      contents: {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          backgroundColor: '#0F172A',
          paddingAll: '20px',
          contents: [
            {
              type: 'text',
              text: 'ระบบเยียวยาผู้ประสบอุทกภัย',
              color: '#94A3B8',
              size: 'xs',
              weight: 'bold'
            },
            {
              type: 'text',
              text: statusTheme.statusLabel,
              color: statusTheme.badgeColor,
              size: 'xl',
              weight: 'bold',
              margin: 'sm'
            }
          ]
        },
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'md',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                { type: 'text', text: 'เลขที่คำร้อง', color: '#64748B', size: 'sm', flex: 4 },
                { type: 'text', text: claimRecord.claimId, color: '#0F172A', size: 'sm', weight: 'bold', flex: 6, align: 'end' }
              ]
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                { type: 'text', text: 'ผู้ยื่นคำขอ', color: '#64748B', size: 'sm', flex: 4 },
                { type: 'text', text: claimRecord.claimantFullName, color: '#0F172A', size: 'sm', flex: 6, align: 'end' }
              ]
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                { type: 'text', text: 'เงินเยียวยา', color: '#64748B', size: 'sm', flex: 4 },
                {
                  type: 'text',
                  text: claimRecord.approvedCompensationAmount > 0
                    ? `฿${claimRecord.approvedCompensationAmount.toLocaleString('th-TH')}`
                    : 'รอการประเมิน',
                  color: claimRecord.approvedCompensationAmount > 0 ? '#10B981' : '#F59E0B',
                  size: 'sm',
                  weight: 'bold',
                  flex: 6,
                  align: 'end'
                }
              ]
            }
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'button',
              style: 'primary',
              color: '#2563EB',
              action: {
                type: 'uri',
                label: 'ตรวจสอบรายละเอียดคำร้อง',
                uri: `${liffAppUrl}?claimId=${claimRecord.claimId}`
              }
            }
          ]
        }
      }
    };
  }

  public static buildEmergencyHelpFlex(liffAppUrl: string) {
    return {
      type: 'flex',
      altText: '🚨 ศูนย์รับแจ้งเหตุน้ำท่วมและขอความช่วยเหลือด่วน ปภ. 1784',
      contents: {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          backgroundColor: '#DC2626',
          paddingAll: '16px',
          contents: [
            {
              type: 'text',
              text: '🚨 ศูนย์ช่วยเหลือฉุกเฉิน 24 ชม.',
              color: '#FEE2E2',
              size: 'xs',
              weight: 'bold'
            },
            {
              type: 'text',
              text: 'แจ้งเหตุน้ำท่วม / ขอกู้ภัยด่วน',
              color: '#FFFFFF',
              size: 'lg',
              weight: 'bold',
              margin: 'xs'
            }
          ]
        },
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'md',
          paddingAll: '18px',
          contents: [
            {
              type: 'text',
              text: 'ระบบได้รับแจ้งเหตุเรียบร้อยแล้ว',
              weight: 'bold',
              size: 'md',
              color: '#0F172A'
            },
            {
              type: 'text',
              text: 'โปรดแตะปุ่มด้านล่างเพื่อส่งพิกัดดาวเทียม ทีมกู้ภัย ปภ. จะได้รับตำแหน่งที่แม่นยำที่สุด:',
              wrap: true,
              size: 'xs',
              color: '#64748B'
            },
            {
              type: 'button',
              style: 'primary',
              color: '#DC2626',
              height: 'md',
              action: {
                type: 'uri',
                label: '📍 ส่งพิกัด GPS ขอกู้ภัยทันที',
                uri: `${liffAppUrl}?mode=emergency`
              }
            },
            {
              type: 'button',
              style: 'secondary',
              height: 'md',
              color: '#0284C7',
              action: {
                type: 'uri',
                label: '📞 โทรสายด่วนนิรภัย 1784 (ฟรี)',
                uri: 'tel:1784'
              }
            },
            {
              type: 'box',
              layout: 'vertical',
              backgroundColor: '#F1F5F9',
              cornerRadius: '8px',
              paddingAll: '10px',
              contents: [
                {
                  type: 'text',
                  text: '💡 ทางเลือกเสริม: กดปุ่ม [+] ซ้ายล่างใน LINE แล้วเลือก "ตำแหน่งที่ตั้ง" เพื่อส่งพิกัดเข้าแชทได้ทันที',
                  wrap: true,
                  size: 'xxs',
                  color: '#475569'
                }
              ]
            }
          ]
        }
      }
    };
  }

  public static buildHotlineFlex() {
    return {
      type: 'flex',
      altText: '📞 สายด่วนนิรภัย ปภ. 1784 (โทรฟรี 24 ชั่วโมง)',
      contents: {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          backgroundColor: '#0284C7',
          paddingAll: '16px',
          contents: [
            {
              type: 'text',
              text: '📞 ศูนย์เตือนภัยและสายด่วน',
              color: '#E0F2FE',
              size: 'xs',
              weight: 'bold'
            },
            {
              type: 'text',
              text: 'สายด่วนนิรภัย ปภ. 1784',
              color: '#FFFFFF',
              size: 'lg',
              weight: 'bold',
              margin: 'xs'
            }
          ]
        },
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'md',
          paddingAll: '18px',
          contents: [
            {
              type: 'text',
              text: 'กรมป้องกันและบรรเทาสาธารณภัย (ปภ.)',
              weight: 'bold',
              size: 'sm',
              color: '#0F172A'
            },
            {
              type: 'text',
              text: '• โทรฟรีตลอด 24 ชั่วโมง ทั่วประเทศ\n• ศูนย์เตือนภัยพิบัติแห่งชาติ\n• แจ้งเหตุด่วนทาง LINE ปภ.: @1784DDPM',
              wrap: true,
              size: 'xs',
              color: '#64748B'
            },
            {
              type: 'button',
              style: 'primary',
              color: '#0284C7',
              height: 'md',
              action: {
                type: 'uri',
                label: '📞 กดโทรออก 1784 ทันที',
                uri: 'tel:1784'
              }
            }
          ]
        }
      }
    };
  }
}

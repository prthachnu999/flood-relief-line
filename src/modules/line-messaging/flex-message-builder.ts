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
              text: '📍 วิธีส่งพิกัดกู้ภัยในแชทนี้ (เร็วที่สุด ไม่ต้องพิมพ์):',
              weight: 'bold',
              size: 'sm',
              color: '#0F172A',
              wrap: true
            },
            {
              type: 'box',
              layout: 'vertical',
              backgroundColor: '#FEF2F2',
              borderColor: '#FECACA',
              borderWidth: '1px',
              cornerRadius: '12px',
              paddingAll: '14px',
              spacing: 'sm',
              contents: [
                {
                  type: 'box',
                  layout: 'horizontal',
                  spacing: 'md',
                  contents: [
                    {
                      type: 'text',
                      text: '1️⃣',
                      size: 'sm',
                      flex: 0
                    },
                    {
                      type: 'text',
                      text: 'แตะปุ่ม [+] ที่มุมซ้ายล่างของแชทนี้',
                      size: 'xs',
                      color: '#1E293B',
                      weight: 'bold',
                      wrap: true,
                      flex: 1
                    }
                  ]
                },
                {
                  type: 'box',
                  layout: 'horizontal',
                  spacing: 'md',
                  contents: [
                    {
                      type: 'text',
                      text: '2️⃣',
                      size: 'sm',
                      flex: 0
                    },
                    {
                      type: 'text',
                      text: 'เลือกเมนู 📍 "ตำแหน่งที่ตั้ง" (Location)',
                      size: 'xs',
                      color: '#1E293B',
                      weight: 'bold',
                      wrap: true,
                      flex: 1
                    }
                  ]
                },
                {
                  type: 'box',
                  layout: 'horizontal',
                  spacing: 'md',
                  contents: [
                    {
                      type: 'text',
                      text: '3️⃣',
                      size: 'sm',
                      flex: 0
                    },
                    {
                      type: 'text',
                      text: 'แตะ "แชร์ตำแหน่งที่ตั้งนี้" ส่งเข้าแชทได้ทันที',
                      size: 'xs',
                      color: '#1E293B',
                      weight: 'bold',
                      wrap: true,
                      flex: 1
                    }
                  ]
                },
                {
                  type: 'box',
                  layout: 'vertical',
                  backgroundColor: '#FFFFFF',
                  cornerRadius: '6px',
                  paddingAll: '8px',
                  margin: 'xs',
                  contents: [
                    {
                      type: 'text',
                      text: '⚡ ระบบจะดึงชื่อ LINE + พิกัดดาวเทียม บันทึกเข้าระบบกู้ภัย ปภ. ทันทีโดยไม่ต้องพิมพ์ข้อมูล',
                      wrap: true,
                      size: 'xxs',
                      color: '#DC2626'
                    }
                  ]
                }
              ]
            },
            {
              type: 'button',
              style: 'primary',
              color: '#0284C7',
              height: 'md',
              action: {
                type: 'uri',
                label: '📞 โทรสายด่วนนิรภัย 1784 (โทรฟรี)',
                uri: 'tel:1784'
              }
            },
            {
              type: 'button',
              style: 'secondary',
              height: 'md',
              color: '#2563EB',
              action: {
                type: 'uri',
                label: '🌐 หรือเปิดหน้าเว็บเพื่อส่งพิกัด',
                uri: `${liffAppUrl}?mode=emergency`
              }
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

  public static buildLocationConfirmedFlex(params: {
    requestId: string;
    claimantName: string;
    latitude: number | string;
    longitude: number | string;
    locationAddress: string;
  }) {
    const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(`${params.latitude},${params.longitude}`)}`;

    return {
      type: 'flex',
      altText: `🚨 ได้รับพิกัดขอความช่วยเหลือแล้ว [${params.requestId}]`,
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
              text: '🚨 ศูนย์รับแจ้งเหตุกู้ภัย ปภ. 24 ชม.',
              color: '#FEE2E2',
              size: 'xs',
              weight: 'bold'
            },
            {
              type: 'text',
              text: 'บันทึกพิกัดฉุกเฉินสำเร็จ',
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
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: 'รหัสคำร้อง:',
                  size: 'xs',
                  color: '#64748B',
                  flex: 3
                },
                {
                  type: 'text',
                  text: params.requestId,
                  size: 'xs',
                  weight: 'bold',
                  color: '#0F172A',
                  flex: 5
                }
              ]
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: 'ผู้แจ้งเหตุ:',
                  size: 'xs',
                  color: '#64748B',
                  flex: 3
                },
                {
                  type: 'text',
                  text: params.claimantName,
                  size: 'xs',
                  weight: 'bold',
                  color: '#0F172A',
                  flex: 5
                }
              ]
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: 'พิกัด GPS:',
                  size: 'xs',
                  color: '#64748B',
                  flex: 3
                },
                {
                  type: 'text',
                  text: `${params.latitude}, ${params.longitude}`,
                  size: 'xs',
                  weight: 'bold',
                  color: '#2563EB',
                  flex: 5
                }
              ]
            },
            {
              type: 'box',
              layout: 'vertical',
              backgroundColor: '#FEF2F2',
              cornerRadius: '8px',
              paddingAll: '10px',
              contents: [
                {
                  type: 'text',
                  text: `📍 ${params.locationAddress}`,
                  wrap: true,
                  size: 'xs',
                  color: '#991B1B'
                },
                {
                  type: 'text',
                  text: '🔴 ระดับความเร่งด่วน: วิกฤตเร่งด่วน (ส่งทีมกู้ภัย ปภ. ประจำพื้นที่แล้ว)',
                  wrap: true,
                  size: 'xxs',
                  weight: 'bold',
                  color: '#DC2626',
                  margin: 'xs'
                }
              ]
            },
            {
              type: 'button',
              style: 'primary',
              color: '#2563EB',
              height: 'md',
              action: {
                type: 'uri',
                label: '🗺️ เปิดดูหมุดพิกัดบน Google Maps',
                uri: mapsUrl
              }
            },
            {
              type: 'button',
              style: 'secondary',
              color: '#DC2626',
              height: 'md',
              action: {
                type: 'uri',
                label: '📞 กดโทรสายด่วนนิรภัย 1784 ทันที',
                uri: 'tel:1784'
              }
            }
          ]
        }
      }
    };
  }
}

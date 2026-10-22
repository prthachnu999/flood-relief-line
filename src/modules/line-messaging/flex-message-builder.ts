import { ReliefClaimRecord } from '../relief-claims/claim-domain-types.js';

export class FlexMessageBuilder {
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
}

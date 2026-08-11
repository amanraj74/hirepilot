// Branded offer letter template. Server-rendered via @react-pdf/renderer
// into a PDF buffer that the service layer stores on OfferLetter.pdfUrl.

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 56,
    fontSize: 11,
    lineHeight: 1.5,
    color: '#1f2937',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#4f46e5',
    borderBottomStyle: 'solid',
  },
  brandWrap: { flexDirection: 'column' },
  brand: { fontSize: 22, fontWeight: 'bold', color: '#4f46e5' },
  brandSub: { fontSize: 9, color: '#6b7280', marginTop: 4 },
  docMeta: { fontSize: 9, color: '#6b7280', textAlign: 'right' },
  heading: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#111827' },
  intro: { marginBottom: 20, lineHeight: 1.6 },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4f46e5',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  table: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'solid',
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
  },
  tableRowLast: { flexDirection: 'row' },
  tableLabel: {
    width: '35%',
    padding: 10,
    fontWeight: 'bold',
    backgroundColor: '#f9fafb',
    fontSize: 10,
  },
  tableValue: { flex: 1, padding: 10, fontSize: 11 },
  benefitsList: { marginTop: 4 },
  bullet: { flexDirection: 'row', marginBottom: 4 },
  bulletDot: { width: 12, fontSize: 11, color: '#4f46e5' },
  bulletText: { flex: 1, fontSize: 11 },
  body: { marginTop: 16, marginBottom: 16, lineHeight: 1.6 },
  signature: { marginTop: 32 },
  sigLine: {
    borderTopWidth: 1,
    borderTopColor: '#9ca3af',
    borderTopStyle: 'solid',
    width: 240,
    marginBottom: 4,
    paddingTop: 8,
  },
  sigLabel: { fontSize: 9, color: '#6b7280' },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 56,
    right: 56,
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
const fmtMoney = (n: number, c: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: c,
    maximumFractionDigits: 0,
  }).format(n);

export type OfferLetterData = {
  candidateName: string;
  roleTitle: string;
  companyName: string;
  location: string | null;
  workMode: 'REMOTE' | 'HYBRID' | 'ONSITE';
  salaryAmount: number;
  salaryCurrency: string;
  joiningDate: Date;
  expiresAt: Date;
  benefits: string[];
  bodyMarkdown?: string;
  senderName: string;
  senderTitle: string;
  companyWebsite?: string | null;
  generatedAt: Date;
};

export function OfferLetterDocument({ data }: { data: OfferLetterData }) {
  return (
    <Document title={`Offer — ${data.roleTitle} at ${data.companyName}`} author={data.senderName}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandWrap}>
            <Text style={styles.brand}>HirePilot</Text>
            <Text style={styles.brandSub}>An AI-powered Applicant Tracking System</Text>
          </View>
          <View style={styles.docMeta}>
            <Text>Offer of Employment</Text>
            <Text>{fmtDate(data.generatedAt)}</Text>
          </View>
        </View>

        <Text style={styles.heading}>Dear {data.candidateName},</Text>

        <Text style={styles.intro}>
          We are delighted to extend you an offer to join{' '}
          <Text style={{ fontWeight: 'bold' }}>{data.companyName}</Text> as a{' '}
          <Text style={{ fontWeight: 'bold' }}>{data.roleTitle}</Text>. After careful consideration
          of your background and performance throughout our interview process, we believe you will
          be a strong addition to the team.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Position details</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Role</Text>
              <Text style={styles.tableValue}>{data.roleTitle}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Compensation</Text>
              <Text style={styles.tableValue}>
                {fmtMoney(data.salaryAmount, data.salaryCurrency)} per year
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Start date</Text>
              <Text style={styles.tableValue}>{fmtDate(data.joiningDate)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Work arrangement</Text>
              <Text style={styles.tableValue}>
                {data.workMode.charAt(0) + data.workMode.slice(1).toLowerCase()}
                {data.location ? ` · ${data.location}` : ''}
              </Text>
            </View>
            <View style={styles.tableRowLast}>
              <Text style={styles.tableLabel}>Offer valid until</Text>
              <Text style={styles.tableValue}>{fmtDate(data.expiresAt)}</Text>
            </View>
          </View>
        </View>

        {data.benefits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Benefits &amp; perks</Text>
            <View style={styles.benefitsList}>
              {data.benefits.map((b, i) => (
                <View key={i} style={styles.bullet}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{b}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {data.bodyMarkdown && <Text style={styles.body}>{data.bodyMarkdown}</Text>}

        <Text style={styles.body}>
          To accept this offer, sign in to your HirePilot account and visit the offer letter on your
          applications page. If you have any questions, reach out to us at the email address listed
          in your HirePilot notifications.
        </Text>

        <Text style={styles.body}>
          We&rsquo;re excited about the prospect of you joining the team and look forward to your
          reply.
        </Text>

        <View style={styles.signature}>
          <View style={styles.sigLine} />
          <Text style={styles.sigLabel}>
            {data.senderName}, {data.senderTitle}
          </Text>
          <Text style={styles.sigLabel}>{data.companyName}</Text>
        </View>

        <Text style={styles.footer} fixed>
          Generated by HirePilot · This is a system-generated offer letter. Verify details with the
          hiring manager before signing.
        </Text>
      </Page>
    </Document>
  );
}

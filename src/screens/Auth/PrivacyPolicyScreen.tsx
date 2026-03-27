import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { ChevronLeft, ShieldCheck } from 'lucide-react-native';
import circularLogo from '@/assets/images/circularLogo.jpg';

const SECTIONS = [
  {
    id: "section-1",
    title: "1. PERSONAL DATA WE COLLECT",
    body: `We may collect the following categories of personal data from you:

1.1 Identity and Contact Information
• Full name
• Email address
• Phone number (mobile and/or landline)
• Organization or institution name
• Residential or correspondence address
• Date of birth or age

1.2 Account Information
• Username and login credentials
• User profile details (education, skills, interests, career goals)
• Preferences and settings
• Profile photograph (if provided)

1.3 Educational and Professional Data
• Academic qualifications and credentials
• Educational institution details
• Work experience and employment history
• Skills, certifications, and specializations
• Career aspirations and learning goals
• Project submissions, assignments, and assessment data

1.4 Transaction and Payment Data
• Subscription details and purchase history
• Payment method information (processed securely via third-party payment gateways)
• Billing and invoicing information
• Transaction identifiers and timestamps

1.5 Technical and Device Data
• IP address and geolocation data
• Browser type, version, and language settings
• Operating system and device information (type, model, manufacturer)
• Device identifiers (IMEI, MAC address, device ID)
• Usage logs, access times, and session data
• Cookies, web beacons, and similar tracking technologies

1.6 Communication and Interaction Data
• Emails, messages, and support queries sent to us
• Feedback, reviews, ratings, and testimonials
• Survey responses
• Chat transcripts and call recordings (with your consent)
• User-generated content submitted on the Platform

1.7 AI Interaction Data
• Input queries, prompts, and commands provided to AI systems
• AI-generated recommendations, skill paths, and outputs
• Usage patterns and interaction history with AI features
• Learning progress, performance analytics, and assessment results`
  },
  {
    id: "section-2",
    title: "2. HOW WE COLLECT DATA",
    body: `2.1 Information You Provide Directly
We collect personal data when you register, create an account, subscribe to services, complete forms, or contact support.

2.2 Information Collected Automatically
Certain technical and usage data is collected automatically through:

• Cookies, web beacons, and similar tracking technologies
• Analytics tools (e.g., Google Analytics, Mixpanel)
• Server logs and access logs
• AI interaction monitoring and learning analytics

2.3 Information from Third Parties
We may receive personal data from:

• Third-party service providers (payment processors, cloud hosting partners, analytics providers)
• Educational institutions or employers partnered with us
• Social media platforms (if you link your account or use social login)
• Publicly available sources (with your consent or as permitted by law)`
  },
  {
    id: "section-3",
    title: "3. PURPOSE OF PROCESSING",
    body: `We process personal data for the following purposes:

3.1 Service Delivery and Platform Operations
1. To provide, operate, maintain, and improve our AI-driven products and services
2. To create and manage user accounts
3. To personalize your experience and deliver customized content, recommendations, and skill paths
4. To process transactions, manage subscriptions, and issue invoices
5. To send transactional communications (order confirmations, account notifications, service updates)

3.2 AI and Machine Learning
1. To train, test, and improve AI models and algorithms
2. To generate personalized skill development paths and career recommendations
3. To analyze learning patterns and optimize educational content
4. To provide adaptive learning experiences based on user performance

3.3 Communication and Marketing
1. To communicate service updates, new features, and product announcements
2. To send promotional offers, newsletters, and marketing communications (with your consent)
3. To conduct surveys and request feedback
4. To respond to inquiries and provide customer support

3.4 Security, Fraud Prevention, and Compliance
1. To ensure the security, integrity, and safety of the Platform
2. To detect, prevent, and investigate fraudulent, abusive, or illegal activity
3. To enforce our Terms of Use and other policies
4. To comply with legal obligations, court orders, or regulatory requirements

3.5 Analytics and Research
1. To analyze usage trends, user behavior, and Platform performance
2. To conduct research and development for product improvement
3. To generate aggregated, anonymized data for business intelligence and reporting`
  },
  {
    id: "section-4",
    title: "4. LEGAL BASIS FOR PROCESSING",
    body: `We process personal data based on the following legal grounds under the PDPP Act and applicable laws:

4.1 Consent
We process personal data with your explicit, informed, and freely given consent, which you may withdraw at any time.

4.2 Contractual Necessity
Processing is necessary to perform our contractual obligations to you (e.g., providing services, processing payments).

4.3 Legal Obligations
Processing is required to comply with applicable laws, regulations, court orders, or government requests.

4.4 Legitimate Business Interests
Processing is necessary for our legitimate business interests, such as fraud prevention, network security, product improvement, or business analytics, provided such interests are not overridden by your fundamental rights.`
  },
  {
    id: "section-5",
    title: "5. DATA SHARING AND DISCLOSURE",
    body: `We may share personal data with the following categories of recipients:


              • Cloud hosting and infrastructure providers (e.g., Amazon Web Services, Microsoft Azure, Google Cloud)
• Payment processors and gateways (e.g., Razorpay, Stripe, PayPal, Paytm)
• Analytics and monitoring tools (e.g., Google Analytics, Mixpanel, Hotjar)
• Customer support platforms (e.g., Zendesk, Freshdesk, Intercom)
• Email and communication services (e.g., SendGrid, Mailchimp, Twilio)
• AI and machine learning infrastructure providers


              All service providers are contractually bound by Data Processing Agreements (DPAs) to protect your personal data and process it only in accordance with our instructions and applicable data protection laws.



              5.2 Educational Institutions and Employers
              If you use the Platform in connection with an educational institution, corporate training program, or employer partnership, we may share your personal data (including learning progress, assessment results, and certifications) with such organizations as necessary to provide the services.



              5.3 Business Partners and Affiliates
              We may share aggregated, anonymized, or de-identified data with business partners, affiliates, or advertisers for marketing, analytics, or research purposes. Such data does not identify you personally.



              5.4 Legal and Regulatory Authorities
              We may disclose personal data when required by law or in response to:


              • Valid legal process (subpoena, court order, search warrant)
• Government or regulatory authority requests
• Law enforcement investigations
• Protection of our legal rights, property, or safety, or that of others



              5.5 Business Transfers
              In the event of a merger, acquisition, reorganization, sale of assets, or bankruptcy, your personal data may be transferred to the successor entity, subject to equivalent data protection obligations.



              5.6 No Sale of Personal Data
              We do not sell, rent, or trade your personal data to third parties for their marketing purposes.`
  },
  {
    id: "section-6",
    title: "6. CROSS-BORDER DATA TRANSFERS",
    body: `6.1 Data Storage and Processing Locations
              Your personal data may be transferred to, stored, and processed in locations outside India, including countries where our service providers, cloud infrastructure, or business partners operate (e.g., the United States, European Union, Singapore).



              6.2 Safeguards for International Transfers
              We ensure that all cross-border transfers of personal data are subject to appropriate safeguards as required under the PDPP Act and applicable laws, including:


              • Transfers to countries notified as having adequate data protection standards by the Indian Government
• Standard Contractual Clauses (SCCs) approved by relevant authorities
• Data Processing Agreements with service providers ensuring equivalent protection
• Compliance with EU General Data Protection Regulation (GDPR) standards where applicable



              6.3 Your Rights
              If you are located in the European Economic Area (EEA), United Kingdom, or other jurisdictions with specific data protection laws, you may have additional rights regarding international data transfers. Please contact us for more information.`
  },
  {
    id: "section-7",
    title: "7. DATA RETENTION",
    body: `7.1 Retention Period
              We retain personal data only for as long as necessary to fulfill the purposes described in this Privacy Policy, comply with legal obligations, resolve disputes, enforce agreements, or as otherwise required or permitted by law.



              7.2 Retention Criteria
              The retention period for personal data depends on:


              • The nature and sensitivity of the data
• The purposes for which it was collected and processed
• Legal, regulatory, tax, or accounting requirements
• Whether you have requested deletion or withdrawal of consent



              7.3 Deletion and Anonymization
              Upon expiry of the retention period or upon your request (where applicable), we will securely delete or anonymize your personal data in accordance with our data retention and deletion policies and applicable legal requirements.



              7.4 Backup and Archival Data
              Personal data may remain in backup systems or archives for a limited period for disaster recovery, security, and legal compliance purposes. Such data will be deleted in accordance with our backup retention schedules.`
  },
  {
    id: "section-8",
    title: "8. DATA SECURITY",
    body: `8.1 Security Measures
              We implement reasonable and appropriate administrative, technical, and physical safeguards to protect personal data from unauthorized access, use, disclosure, alteration, loss, misuse, or destruction, including:


              • Encryption of data in transit (using SSL/TLS protocols) and at rest (using industry-standard encryption algorithms)
• Access controls, authentication mechanisms, and multi-factor authentication (MFA)
• Regular security audits, vulnerability assessments, and penetration testing
• Secure data centers with physical access controls
• Employee training and confidentiality obligations
• Incident response and breach notification procedures



              8.2 Limitations
              While we strive to protect your personal data, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security of your personal data. You acknowledge and accept the inherent risks of online data transmission and storage.



              8.3 User Responsibility
              You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must immediately notify us of any unauthorized access or security breach.`
  },
  {
    id: "section-9",
    title: "9. YOUR RIGHTS UNDER THE DPDP ACT, 2023",
    body: `As a Data Principal under the DPDP Act, 2023, you have the following rights:



              
                
                  9.1 Right to Access
                  You have the right to obtain confirmation of whether we are processing your personal data and to access such data.


                

                
                  9.2 Right to Correction
                  You have the right to correct, update, or complete inaccurate, incomplete, or outdated personal data.


                

                
                  9.3 Right to Erasure
                  You have the right to request deletion or erasure of your personal data, subject to legal, regulatory, or contractual retention requirements.


                

                
                  9.4 Right to Withdraw Consent
                  Where processing is based on your consent, you have the right to withdraw such consent at any time. Withdrawal of consent will not affect the lawfulness of processing conducted prior to withdrawal.


                

                
                  9.5 Right to Data Portability
                  You have the right to receive your personal data in a structured, commonly used, and machine-readable format and to transmit such data to another Data Fiduciary (where technically feasible).


                

                
                  9.6 Right to Grievance Redressal
                  You have the right to lodge a complaint with our Grievance Officer or the Data Protection Board of India if you believe your rights have been violated.


                
              

              9.7 How to Exercise Your Rights
              To exercise any of the above rights, please contact us at:


              
                Email: info@stridenex.ai


                Subject Line: "Data Subject Request - [Your Request Type]"


                Grievance Officer Contact: See Section 13 below


              
              We will respond to your request within the timelines specified under the PDPP Act (typically within 30 days).`
  },
  {
    id: "section-10",
    title: "10. INTERNATIONAL USER RIGHTS (GDPR AND OTHER JURISDICTIONS)",
    body: `If you are located in the European Economic Area (EEA), United Kingdom, California (USA), or other jurisdictions with specific data protection laws, you may have additional rights, including:



              10.1 GDPR Rights (EEA and UK Users)
              • Right to lodge a complaint with a supervisory authority
• Right to object to processing based on legitimate interests
• Right to restrict processing in certain circumstances
• Right to object to automated decision-making and profiling



              10.2 CCPA Rights (California, USA Users)
              • Right to know what personal information is collected, used, shared, or sold
• Right to request deletion of personal information
• Right to opt-out of the sale of personal information (we do not sell personal data)
• Right to non-discrimination for exercising privacy rights



              To exercise these rights, please contact us at info@stridenex.ai.`
  },
  {
    id: "section-11",
    title: "11. CHILDREN'S PRIVACY",
    body: `11.1 Age Restrictions
              Our Platform is not intended for children under the age of 13 years. We do not knowingly collect, use, or disclose personal data from children under 13 without verifiable parental consent as required under applicable laws.



              11.2 Parental Consent for Minors (13-18 Years)
              If you are between 13 and 18 years of age, you may use the Platform only with the consent and supervision of your parent or legal guardian. We may request verification of parental consent.



              11.3 Parental Rights
              Parents or legal guardians have the right to access, review, correct, or request deletion of their child's personal data. Please contact us at info@stridenex.ai for assistance.



              11.4 Discovery of Underage Data
              If we discover that we have inadvertently collected personal data from a child under 13 without verifiable parental consent, we will take immediate steps to delete such data from our systems.`
  },
  {
    id: "section-12",
    title: "12. COOKIES AND TRACKING TECHNOLOGIES",
    body: `12.1 What Are Cookies?
              Cookies are small text files stored on your device by your web browser when you visit a website. We use cookies and similar tracking technologies (web beacons, pixels, local storage) to enhance user experience, analyze usage, and maintain session security.



              12.2 Types of Cookies We Use
              • Essential Cookies: Necessary for the Platform to function properly (e.g., session management, authentication)
• Performance Cookies: Collect information about how you use the Platform (e.g., page visits, load times) to improve performance
• Functional Cookies: Remember your preferences and settings (e.g., language, region)
• Analytics Cookies: Help us understand user behavior and traffic patterns (e.g., Google Analytics)
• Marketing Cookies: Used to deliver relevant advertisements and track campaign effectiveness (with your consent)



              12.3 Third-Party Cookies
              We may allow third-party service providers (e.g., Google Analytics, Facebook Pixel) to place cookies on your device for analytics, advertising, and remarketing purposes. These third parties have their own privacy policies and data practices.



              12.4 Cookie Consent and Management
              By using the Platform, you consent to the use of cookies as described in this Policy. You may manage, disable, or delete cookies through your browser settings. However, disabling certain cookies may affect the functionality and performance of the Platform.



              12.5 Do Not Track (DNT)
              Our Platform does not currently respond to "Do Not Track" (DNT) signals sent by web browsers.`
  },
  {
    id: "section-13",
    title: "13. GRIEVANCE OFFICER",
    body: `In accordance with the PDPP Act, 2023, we have appointed a Grievance Officer to address your privacy concerns, complaints, or data subject requests.



              Grievance Officer Contact Details:
              Name: [To be designated - Insert Name]


              Designation: Grievance Officer


              Email: grievance@stridenex.ai


              Phone: [Insert Phone Number]


              Address: StrideNex Private Limited, [Full Registered Office Address], Pune, Maharashtra, India



              Response Timeline: The Grievance Officer will acknowledge your complaint within 48 hours and resolve it within 30 days from the date of receipt, as required under the PDPP Act.`
  },
  {
    id: "section-14",
    title: "14. DATA BREACH NOTIFICATION",
    body: `14.1 Breach Response Procedures
              In the event of a data breach that is likely to cause harm to your rights and freedoms, we will:


              1. Investigate and assess the nature, scope, and impact of the breach
2. Take immediate steps to contain and mitigate the breach
3. Notify affected Data Principals and the Data Protection Board of India within 72 hours of becoming aware of the breach, as required under the PDPP Act



              14.2 Notification Contents
              Breach notifications will include:


              • Description of the nature and extent of the breach
• Categories and approximate number of affected individuals and data records
• Likely consequences and potential risks
• Measures taken or proposed to address the breach and mitigate harm`
  },
  {
    id: "section-15",
    title: "15. AUTOMATED DECISION-MAKING AND AI PROFILING",
    body: `15.1 AI-Driven Recommendations
              Our Platform uses AI and machine learning algorithms to analyze your learning patterns, assess your skills, and provide personalized recommendations for skill development, career paths, courses, and projects.



              15.2 How AI Decisions Are Made
              AI-driven recommendations are generated based on:


              • Your educational and professional background
• Learning progress, assessment results, and performance data
• Interaction patterns and usage behavior
• Industry trends, job market data, and employer demand signals
• Comparative analytics with similar user profiles



              15.3 Human Oversight
              While AI systems assist in generating recommendations, significant decisions (e.g., certification awards, employment referrals) may involve human review and oversight.



              15.4 Right to Explanation and Objection
              You have the right to:


              • Request an explanation of how AI-driven recommendations are generated
• Object to automated decision-making that produces legal or similarly significant effects
• Request human review of AI-generated decisions


              To exercise these rights, contact us at info@stridenex.ai.`
  },
  {
    id: "section-16",
    title: "16. MARKETING COMMUNICATIONS AND OPT-OUT",
    body: `16.1 Marketing Consent
              With your consent, we may send you promotional emails, SMS, push notifications, or other marketing communications about our products, services, offers, events, or updates.



              16.2 Opt-Out Rights
              You have the right to opt out of receiving marketing communications at any time by:


              • Clicking the 'Unsubscribe' link in any marketing email
• Adjusting your notification preferences in your account settings
• Contacting us at info@stridenex.ai with your opt-out request



              16.3 Transactional Communications
              Please note that even if you opt out of marketing communications, you will continue to receive transactional or service-related communications (e.g., account notifications, payment confirmations, security alerts) as necessary to provide our services.`
  },
  {
    id: "section-17",
    title: "17. THIRD-PARTY WEBSITES AND SERVICES",
    body: `17.1 Links to External Sites
              The Platform may contain links to third-party websites, services, or resources not owned or controlled by StrideNex (e.g., educational institutions, partner organizations, social media platforms).



              17.2 No Responsibility
              We are not responsible for and do not endorse the privacy practices, content, or data collection practices of any third-party websites or services. Your access to and use of third-party sites is governed by their respective privacy policies and terms of use.



              17.3 User Responsibility
              We encourage you to review the privacy policies of any third-party websites or services you visit. You access such sites at your own risk.`
  },
  {
    id: "section-18",
    title: "18. UPDATES TO THIS POLICY",
    body: `We may update this policy periodically. Your continued use constitutes acceptance of the revised policy.`
  },
  {
    id: "section-19",
    title: "19. CONSENT AND ACCEPTANCE",
    body: `By using the Platform, you consent to the collection and processing of your personal data as described in this Privacy Policy.`
  },
  {
    id: "section-20",
    title: "20. CONTACT INFORMATION",
    body: `StrideNex Private Limited. Email: info@stridenex.ai. Website: www.stridenex.ai`
  },
  {
    id: "section-21",
    title: "21. DATA PROTECTION AUTHORITY",
    body: `You have the right to lodge a complaint with the Data Protection Board of India. © 2026 StrideNex Private Limited.`
  },
];

export const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const headerPaddingTop = insets.top > 0 ? insets.top : Platform.OS === 'ios' ? 20 : 10;

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
          <TouchableOpacity 
            onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Signup' as never)} 
            style={styles.backBtn}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            activeOpacity={0.7}
          >
            <ChevronLeft color={colors.navy} size={28} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Image source={circularLogo} style={styles.headerLogo} resizeMode="contain" />
            <Text style={styles.headerTitle}>Privacy Policy</Text>
          </View>
          <View style={styles.headerRightSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <View style={styles.iconWrapper}>
              <ShieldCheck size={32} color={colors.accent.DEFAULT} />
            </View>
            <Text style={styles.heroTitle}>Privacy Policy</Text>
            <Text style={styles.heroSub}>Please read these terms carefully as they govern your use of the StrideNex platform.</Text>
            <Text style={styles.lastUpdated}>Last Updated: March 2026</Text>
          </View>

          <View style={styles.contentCard}>
            {SECTIONS.map((section, index) => (
              <View key={section.id} style={[styles.sectionBlock, index === SECTIONS.length - 1 && styles.lastSection]}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionBody}>{section.body}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background.light },
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingBottom: spacing.md, paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8,
    zIndex: 10
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' },
  headerRightSpacer: { width: 44 },
  headerLogo: { width: 32, height: 32, borderRadius: 16, marginRight: spacing.sm },
  backBtn: { 
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 15, 189, 0.05)',
    alignItems: 'center', justifyContent: 'center'
  },
  headerTitle: { fontSize: typography.fontSize.lg, color: colors.navy, fontWeight: typography.fontWeight.bold, fontFamily: typography.fontFamily.display },
  scrollContent: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing['3xl'] },
  heroSection: { alignItems: 'center', marginBottom: spacing.xl, paddingHorizontal: spacing.md },
  iconWrapper: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,107,0,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  heroTitle: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.navy, marginBottom: spacing.sm, textAlign: 'center', fontFamily: typography.fontFamily.display },
  heroSub: { fontSize: typography.fontSize.sm, color: colors.text.secondary, textAlign: 'center', lineHeight: 20, marginBottom: spacing.md },
  lastUpdated: { fontSize: typography.fontSize.xs, color: colors.text.secondary, fontWeight: typography.fontWeight.medium, textTransform: 'uppercase', letterSpacing: 1 },
  
  contentCard: { 
    backgroundColor: '#fff', 
    borderRadius: borderRadius['2xl'], 
    padding: spacing.xl,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 5 
  },
  sectionBlock: { marginBottom: spacing.xl, paddingBottom: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border },
  lastSection: { marginBottom: 0, paddingBottom: 0, borderBottomWidth: 0 },
  sectionTitle: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold, color: colors.navy, marginBottom: spacing.md, fontFamily: typography.fontFamily.display },
  sectionBody: { fontSize: typography.fontSize.sm, color: colors.text.secondary, lineHeight: 24 }
});

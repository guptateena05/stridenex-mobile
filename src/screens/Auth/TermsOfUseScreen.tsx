import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { ChevronLeft, ShieldCheck } from 'lucide-react-native';

const SECTIONS = [
  {
    id: "section-1",
    title: "1. ACCEPTANCE OF TERMS",
    body: `1.1 By accessing, browsing, registering on, or using the Platform in any manner, you acknowledge that you have read, understood, and agree to be legally bound by these Terms, our Privacy Policy, and all applicable laws and regulations.


              1.2 If you do not agree to these Terms, you must immediately discontinue use of the Platform.


              1.3 These Terms constitute a legally binding agreement between you ("User", "you", or "your") and StrideNex.`
  },
  {
    id: "section-2",
    title: "2. MODIFICATIONS TO TERMS",
    body: `2.1 StrideNex reserves the right to modify, amend, or update these Terms at any time at its sole discretion without prior notice.


              2.2 Any modifications will be effective immediately upon posting on the Platform with a revised "Last Updated" date. We may also notify you via email or in-platform notifications.


              2.3 Your continued use of the Platform after such modifications constitutes your acceptance of the revised Terms. You are advised to review these Terms periodically.


              2.4 If you do not agree to any modifications, you must cease using the Platform immediately.`
  },
  {
    id: "section-3",
    title: "3. ELIGIBILITY AND AGE RESTRICTIONS",
    body: `3.1 Minimum Age: You must be at least 18 years of age to register and use the Platform. If you are under 18 years of age, you may only use the Platform under the supervision of a parent or legal guardian who agrees to be bound by these Terms.


              3.2 Parental Consent: Users between 13-18 years must obtain verifiable parental or guardian consent before registration. We reserve the right to request proof of such consent.


              3.3 Prohibited Use by Minors Under 13: The Platform is not intended for children under 13 years of age. We do not knowingly collect personal data from children under 13 without verifiable parental consent.`
  },
  {
    id: "section-4",
    title: "4. ACCOUNT REGISTRATION AND SECURITY",
    body: `4.1 Registration Requirement: Certain features and services on the Platform require you to register and create an account by providing accurate, current, and complete information as prompted during the registration process.


              4.2 Accuracy of Information: You represent and warrant that all information provided during registration and at all times thereafter is true, accurate, current, and complete. You agree to promptly update your account information to maintain this accuracy.


              4.3 Account Security: You are solely responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You agree to immediately notify StrideNex of any unauthorized use of your account or any other breach of security. StrideNex shall not be liable for any loss or damage arising from your failure to comply with this security obligation.


              4.4 Account Termination: We reserve the right to suspend, disable, or terminate your account at any time if you provide false, inaccurate, or misleading information; you violate any provision of these Terms; we suspect fraudulent, abusive, or illegal activity; or required by law or regulatory authority.


              4.5 Non-Transferability: Your account is personal to you and may not be transferred, assigned, or sold to any third party.`
  },
  {
    id: "section-5",
    title: "5. SERVICES AND SUBSCRIPTIONS",
    body: `5.1 Description of Services: StrideNex provides AI-driven skill development solutions, career guidance, educational content, industry-academia bridging services, project-based learning tools, mentorship programs, and related analytics and software services through the Platform.


              5.2 Subscription-Based Access: Access to certain features, content, and services is subscription-based and requires payment of applicable fees as displayed on the Platform at the time of purchase or subscription.


              5.3 Non-Transferability: All subscriptions, licenses, and access rights granted under these Terms are personal, non-exclusive, non-transferable, and non-sublicensable. You may not share, transfer, or resell your subscription or account access to any third party.


              5.4 Service Modifications: StrideNex reserves the right to modify, suspend, discontinue, or withdraw any service, feature, or content on the Platform at any time without prior notice or liability.


              5.5 Cancellation for Violations: StrideNex may immediately suspend or cancel your subscription and access to the Platform without refund if you engage in unauthorized sharing or distribution of account credentials; violate intellectual property rights; use automated tools to scrape, extract, or copy Platform content; engage in fraudulent activity or misuse of services; breach any provision of these Terms; or engage in conduct that harms the Platform, other users, or StrideNex's reputation.


              5.6 Effect of Cancellation: Upon cancellation or termination, your right to access and use the Platform will immediately cease. You will not be entitled to any refund of fees paid except as expressly provided in Section 6.`
  },
  {
    id: "section-6",
    title: "6. PAYMENTS, PRICING, AND REFUND POLICY",
    body: `6.1 Payment Terms: All payments for subscriptions, services, or products must be made in advance through the payment methods specified on the Platform, unless otherwise expressly agreed in writing.


              6.2 Payment Processing: Payments are processed through secure third-party payment gateways. StrideNex does not store your credit card, debit card, or banking information. By making a payment, you agree to the terms and conditions of the applicable payment gateway provider.


              6.3 Pricing: All prices are displayed in Indian Rupees (INR) or other applicable currency and are inclusive of applicable taxes (including GST at 18% or as applicable under Indian law), unless otherwise stated.


              6.4 Price Changes: StrideNex reserves the right to change pricing at any time without prior notice. However, changes will not affect subscriptions already purchased or active at the time of the price change.


              6.5 Refund Policy - General Rule: Refunds are generally not provided for digital products, services, or subscriptions once accessed, downloaded, or activated.


              6.6 Exceptions to No-Refund Policy: Refunds may be issued at StrideNex's sole discretion in the following cases: duplicate payments or billing errors; technical errors preventing service delivery; non-delivery of services due to Platform malfunction attributable to StrideNex; or as required under applicable consumer protection laws.


              6.7 Refund Requests: All refund requests must be submitted in writing to info@stridenex.ai within 7 (seven) days from the date of transaction, along with supporting documentation. StrideNex will review and respond to refund requests within 14 (fourteen) business days.


              6.8 No Refunds Post-Cancellation: If your subscription or access is cancelled or terminated by StrideNex due to your violation of these Terms, no refund of fees paid shall be provided.`
  },
  {
    id: "section-7",
    title: "7. PROHIBITED USES AND USER CONDUCT",
    body: `7.1 You agree that you will NOT use the Platform to:


              • Copy, reproduce, distribute, republish, download, display, post, transmit, sell, or commercially exploit any content, software, AI models, data, materials, or information available on the Platform
• Reverse engineer, decompile, disassemble, or attempt to derive the source code of any software, AI models, algorithms, or technology underlying the Platform
• Scrape, extract, download, or collect data, content, or information from the Platform using automated tools, bots, spiders, crawlers, or any similar data mining technology
• Violate any applicable local, state, national, or international law, regulation, or legal obligation
• Impersonate any person or entity, or falsely state or misrepresent your affiliation with any person or entity
• Interfere with, disrupt, or impose an unreasonable burden on the security, integrity, or performance of the Platform, servers, or networks connected to the Platform
• Upload, post, transmit, or otherwise make available any content that infringes any intellectual property rights or proprietary rights of any third party; is defamatory, obscene, pornographic, abusive, harassing, threatening, hateful, or racially or ethnically offensive; contains viruses, malware, or any malicious code; or violates any third party's privacy or data protection rights
• Use the Platform for any unlawful, fraudulent, or malicious purpose
• Attempt to gain unauthorized access to any portion of the Platform, other user accounts, or computer systems or networks connected to the Platform
• Engage in any activity that could damage, disable, overburden, or impair the Platform or interfere with any other party's use of the Platform


              7.2 Consequences of Prohibited Use: Violation of any provision of this Section 7 may result in immediate suspension or termination of your account, denial of access to the Platform, and pursuit of legal remedies including civil and criminal prosecution.`
  },
  {
    id: "section-8",
    title: "8. INTELLECTUAL PROPERTY RIGHTS",
    body: `8.1 Ownership by StrideNex: All content, software, AI models, algorithms, databases, text, graphics, images, videos, audio, trademarks, service marks, trade names, logos, and other materials available on or through the Platform (collectively, "Content") are the exclusive intellectual property of StrideNex or its licensors and are protected under the Copyright Act, 1957, the Trade Marks Act, 1999, the Patents Act, 1970, and other applicable intellectual property laws of India and international treaties.


              8.2 AI-Generated Outputs: All outputs, recommendations, skill paths, analytics, reports, and other content generated by StrideNex's AI systems or algorithms ("AI Outputs") are the sole and exclusive property of StrideNex. You are granted a limited, non-exclusive, non-transferable license to view and use such AI Outputs solely for your personal, non-commercial use in connection with the services provided.


              8.3 No Transfer of Rights: Except as expressly stated in these Terms, no rights, title, or interest in any Content or intellectual property are transferred to you. You acknowledge that you do not acquire any ownership rights by accessing or using the Platform.


              8.4 Limited License to Users: Subject to your compliance with these Terms, StrideNex grants you a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to access and use the Platform and Content solely for your personal, non-commercial purposes.


              8.5 Restrictions: You may not modify, adapt, translate, or create derivative works based on the Content or AI Outputs; sell, rent, lease, license, distribute, or otherwise commercially exploit any Content or AI Outputs; remove, alter, or obscure any copyright, trademark, or other proprietary notices contained in or on the Content; or use any Content or AI Outputs in any manner that competes with StrideNex's business.`
  },
  {
    id: "section-9",
    title: "9. USER-GENERATED CONTENT",
    body: `9.1 License Grant by User: If you submit, post, upload, or otherwise provide any content, data, information, feedback, suggestions, comments, or materials to the Platform ("User Content"), you hereby grant to StrideNex a perpetual, irrevocable, worldwide, non-exclusive, royalty-free, fully paid-up, transferable, sublicensable license to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, display, and otherwise exploit such User Content for any purpose, including operational, promotional, marketing, and commercial purposes, in any media now known or hereafter developed.


              9.2 User Representations and Warranties: You represent and warrant that you own or have the necessary rights, licenses, and permissions to grant the license in Section 9.1; your User Content does not infringe, misappropriate, or violate any intellectual property rights, privacy rights, publicity rights, or other legal rights of any third party; your User Content does not contain any defamatory, obscene, unlawful, or otherwise objectionable material; and your User Content complies with all applicable laws and regulations.


              9.3 User Responsibility: You remain solely responsible for all User Content you submit. StrideNex does not endorse, support, or guarantee the accuracy, reliability, or legality of any User Content.


              9.4 Right to Remove: StrideNex reserves the right, but is not obligated, to monitor, review, edit, remove, or refuse any User Content at any time for any reason without notice or liability.


              9.5 No Obligation to Use: StrideNex is under no obligation to use, display, or exploit any User Content and may choose not to do so at its sole discretion.`
  },
  {
    id: "section-10",
    title: "10. DISCLAIMERS AND WARRANTIES",
    body: `10.1 "AS IS" and "AS AVAILABLE" Basis: THE PLATFORM, ALL CONTENT, SERVICES, PRODUCTS, AND AI OUTPUTS ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.


              10.2 Disclaimer of Warranties: TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, STRIDENEX EXPRESSLY DISCLAIMS ALL WARRANTIES, EXPRESS, IMPLIED, OR STATUTORY, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT; WARRANTIES THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE FROM VIRUSES OR OTHER HARMFUL COMPONENTS; WARRANTIES REGARDING THE ACCURACY, RELIABILITY, COMPLETENESS, OR TIMELINESS OF ANY CONTENT, AI OUTPUTS, OR INFORMATION PROVIDED; AND WARRANTIES THAT DEFECTS OR ERRORS WILL BE CORRECTED.


              10.3 No Guarantee of Results: StrideNex does not warrant or guarantee that use of the Platform, services, or AI-driven recommendations will result in any specific educational, career, or employment outcomes, skill acquisition, job placement, admission to educational institutions, or any other particular result.


              10.4 Third-Party Content and Links: The Platform may contain links to third-party websites, services, or resources not owned or controlled by StrideNex. StrideNex is not responsible for and does not endorse the content, products, services, or practices of any third-party sites. You access third-party sites at your own risk.


              10.5 User Responsibility: You acknowledge and agree that your use of the Platform is at your sole risk. You are solely responsible for any decisions, actions, or consequences resulting from your use of the Platform, Content, or services.`
  },
  {
    id: "section-11",
    title: "11. LIMITATION OF LIABILITY",
    body: `11.1 Exclusion of Damages: TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL STRIDENEX, ITS AFFILIATES, DIRECTORS, OFFICERS, EMPLOYEES, AGENTS, PARTNERS, LICENSORS, OR SUPPLIERS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, REVENUE, DATA, GOODWILL, OR BUSINESS OPPORTUNITIES; LOSS OF USE OR ACCESS TO THE PLATFORM; LOSS OR CORRUPTION OF DATA; COST OF PROCUREMENT OF SUBSTITUTE SERVICES; PERSONAL INJURY OR PROPERTY DAMAGE; ARISING OUT OF OR IN CONNECTION WITH YOUR USE OR INABILITY TO USE THE PLATFORM; ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE PLATFORM; UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR DATA OR USER CONTENT; OR ANY OTHER MATTER RELATING TO THE PLATFORM; WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR ANY OTHER LEGAL THEORY, AND WHETHER OR NOT STRIDENEX HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.


              11.2 Cap on Liability: STRIDENEX'S TOTAL AGGREGATE LIABILITY TO YOU FOR ANY AND ALL CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR YOUR USE OF THE PLATFORM SHALL NOT EXCEED THE TOTAL AMOUNT PAID BY YOU TO STRIDENEX IN THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE LIABILITY.


              11.3 Essential Basis of Bargain: You acknowledge and agree that the disclaimers and limitations of liability set forth in these Terms reflect a reasonable and fair allocation of risk between you and StrideNex and form an essential basis of the bargain between the parties. StrideNex would not be able to provide the Platform on an economically reasonable basis without these limitations.


              11.4 Jurisdictional Limitations: Some jurisdictions do not allow the exclusion or limitation of certain warranties or liabilities. In such jurisdictions, the exclusions and limitations in Sections 10 and 11 shall apply to the maximum extent permitted by applicable law.`
  },
  {
    id: "section-12",
    title: "12. INDEMNIFICATION",
    body: `12.1 Indemnity Obligation: You agree to indemnify, defend, and hold harmless StrideNex, its parent companies, subsidiaries, affiliates, officers, directors, employees, agents, partners, licensors, suppliers, and representatives (collectively, "Indemnified Parties") from and against any and all claims, demands, actions, suits, proceedings, losses, damages, liabilities, costs, and expenses (including reasonable attorneys' fees and litigation costs) arising out of or relating to:


              1. Your use or misuse of the Platform
2. Your violation of these Terms or any applicable law or regulation
3. Your User Content, including any claim that your User Content infringes or misappropriates any intellectual property rights or other rights of any third party
4. Your violation of any rights of any third party, including intellectual property rights, privacy rights, or publicity rights
5. Any fraudulent, negligent, or wrongful conduct by you
6. Any breach of your representations, warranties, or covenants under these Terms


              12.2 Defense and Settlement: StrideNex reserves the right, at its own expense, to assume the exclusive defense and control of any matter subject to indemnification by you. You agree to cooperate fully with StrideNex in the defense of any such claim. You may not settle any claim without StrideNex's prior written consent.


              12.3 Survival: This indemnification obligation shall survive the termination or expiration of these Terms and your use of the Platform.`
  },
  {
    id: "section-13",
    title: "13. DATA PROTECTION AND PRIVACY",
    body: `13.1 Privacy Policy: StrideNex processes personal data in accordance with the Digital Personal Data Protection Act, 2023 (India) and other applicable data protection laws and regulations. Please refer to our Privacy Policy for detailed information on how we collect, use, store, share, and protect your personal data.


              13.2 User Rights: You have the right to access, correct, update, delete, or withdraw consent for your personal data as described in our Privacy Policy. To exercise these rights or for any data protection queries, contact us at info@stridenex.ai.


              13.3 Consent: By using the Platform, you consent to the collection, processing, and use of your personal data as described in the Privacy Policy.`
  },
  {
    id: "section-14",
    title: "14. TERMINATION AND SUSPENSION",
    body: `14.1 Termination by User: You may terminate your account and cease using the Platform at any time by sending a written request to info@stridenex.ai. Upon termination, your access to the Platform will be disabled, but these Terms will continue to apply to your prior use.


              14.2 Termination by StrideNex: StrideNex reserves the right to suspend, disable, or terminate your account and access to the Platform, with or without notice, at any time and for any reason, including but not limited to breach or violation of these Terms; fraudulent, abusive, or illegal activity; extended periods of inactivity; request by law enforcement or other government agencies; technical or security issues; or discontinuance or material modification of the Platform.


              14.3 Effect of Termination: Upon termination, all licenses and rights granted to you under these Terms will immediately cease; you must immediately cease all use of the Platform and delete any Content or materials obtained from the Platform; StrideNex may delete your account data, User Content, and other information associated with your account, except as required to retain by law; and Sections 8 (Intellectual Property), 9 (User Content License), 11 (Limitation of Liability), 12 (Indemnification), 16 (Governing Law), and 17 (Dispute Resolution) shall survive termination.


              14.4 No Refunds on Termination: If StrideNex terminates your account due to your breach of these Terms, you will not be entitled to any refund of fees paid.`
  },
  {
    id: "section-15",
    title: "15. FORCE MAJEURE",
    body: `15.1 StrideNex shall not be liable for any delay, failure to perform, or interruption of service resulting from causes beyond its reasonable control, including but not limited to acts of God (earthquakes, floods, storms, pandemics, epidemics); war, terrorism, civil unrest, or government action; internet, telecommunications, or network failures; cyberattacks, hacking, or distributed denial-of-service (DDoS) attacks; power outages, server failures, or other technical failures; labor disputes, strikes, or lockouts; or supplier or vendor failures.


              15.2 In the event of a force majeure occurrence, StrideNex's obligations under these Terms shall be suspended for the duration of such event.`
  },
  {
    id: "section-16",
    title: "16. THIRD-PARTY SERVICES AND LINKS",
    body: `16.1 The Platform may integrate with, link to, or provide access to third-party services, websites, applications, content, or resources not owned or controlled by StrideNex (collectively, "Third-Party Services").


              16.2 No Endorsement: StrideNex does not endorse, warrant, or assume any responsibility for any Third-Party Services. The inclusion of any link or integration does not imply endorsement by StrideNex.


              16.3 User Responsibility: Your use of Third-Party Services is governed by the terms and conditions and privacy policies of those third parties. You access and use Third-Party Services at your own risk.


              16.4 No Liability: StrideNex shall not be liable for any loss, damage, or harm arising from your use of or reliance on Third-Party Services.`
  },
  {
    id: "section-17",
    title: "17. ARBITRATION AND DISPUTE RESOLUTION",
    body: `17.1 Mutual Discussion: In the event of any dispute, controversy, or claim arising out of or relating to these Terms, the Platform, or the relationship between you and StrideNex (collectively, "Dispute"), the parties agree to first attempt to resolve the Dispute amicably through good-faith mutual discussions for a period of thirty (30) days.


              17.2 Arbitration: If the Dispute cannot be resolved through mutual discussions within thirty (30) days, either party may refer the Dispute to binding arbitration in accordance with the Arbitration and Conciliation Act, 1996, as amended.


              17.3 Arbitration Procedure: The arbitration shall be conducted in English by a sole arbitrator appointed by mutual agreement or, failing such agreement, in accordance with the rules of the Arbitration and Conciliation Act, 1996. The seat and venue of arbitration shall be Pune, Maharashtra, India. The arbitrator's award shall be final and binding on both parties.


              17.4 Exception for Injunctive Relief: Notwithstanding the foregoing, StrideNex may seek injunctive or other equitable relief in any court of competent jurisdiction to protect its intellectual property rights or confidential information.


              17.5 No Class Actions: You agree that any Dispute shall be brought in an individual capacity and not as a plaintiff or class member in any purported class, collective, representative, or multi-party proceeding.`
  },
  {
    id: "section-18",
    title: "18. GOVERNING LAW AND JURISDICTION",
    body: `18.1 Governing Law: These Terms and any Dispute arising out of or relating to these Terms or the Platform shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.


              18.2 Jurisdiction: Subject to the arbitration provisions in Section 17, the courts located in Pune, Maharashtra, India shall have exclusive jurisdiction over any legal action, suit, or proceeding arising out of or relating to these Terms or the Platform.


              18.3 Compliance with Local Laws: You are responsible for compliance with all applicable local, state, national, and international laws and regulations in connection with your use of the Platform.`
  },
  {
    id: "section-19",
    title: "19. ANTI-CORRUPTION AND COMPLIANCE",
    body: `19.1 You agree to comply with all applicable anti-corruption and anti-bribery laws, including but not limited to the Prevention of Corruption Act, 1988 (India), and the UK Bribery Act 2010 (if applicable).


              19.2 You represent and warrant that you have not and will not, directly or indirectly, offer, promise, give, or authorize any payment or anything of value to any government official, political party, or candidate for political office for the purpose of influencing any act or decision or securing any improper advantage in connection with your use of the Platform or services.`
  },
  {
    id: "section-20",
    title: "20. SEVERABILITY",
    body: `If any provision of these Terms is held to be invalid, illegal, or unenforceable by a court or arbitrator of competent jurisdiction, such provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving its intent, or, if such modification is not possible, such provision shall be severed from these Terms. The invalidity, illegality, or unenforceability of any provision shall not affect the validity, legality, or enforceability of the remaining provisions, which shall continue in full force and effect.`
  },
  {
    id: "section-21",
    title: "21. ENTIRE AGREEMENT",
    body: `These Terms, together with the Privacy Policy and any other legal notices or policies published by StrideNex on the Platform, constitute the entire agreement between you and StrideNex regarding your use of the Platform and supersede all prior or contemporaneous agreements, communications, representations, or understandings, whether written or oral, relating to the subject matter hereof. No waiver of any provision of these Terms shall be deemed a further or continuing waiver of such provision or any other provision.`
  },
  {
    id: "section-22",
    title: "22. ASSIGNMENT",
    body: `22.1 You may not assign, transfer, delegate, or sublicense any of your rights or obligations under these Terms without the prior written consent of StrideNex. Any attempted assignment in violation of this Section shall be null and void.


              22.2 StrideNex may assign, transfer, or delegate its rights and obligations under these Terms to any third party, including in connection with a merger, acquisition, reorganization, sale of assets, or by operation of law, without your consent or prior notice.`
  },
  {
    id: "section-23",
    title: "23. NO WAIVER",
    body: `The failure of StrideNex to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision unless acknowledged and agreed to in writing by StrideNex. No waiver of any breach or default under these Terms shall be deemed a waiver of any subsequent breach or default.`
  },
  {
    id: "section-24",
    title: "24. NOTICES",
    body: `24.1 All notices, requests, demands, or other communications required or permitted under these Terms shall be in writing and shall be deemed given when delivered personally; when sent by confirmed electronic mail to the email address provided; three (3) business days after being sent by registered or certified mail, return receipt requested; or one (1) business day after being sent by recognized overnight courier service.


              24.2 Notices to StrideNex: StrideNex Private Limited, Registered Office: Pune, Maharashtra, India, Email: info@stridenex.ai


              24.3 Notices to you: Notices to you shall be sent to the email address associated with your account.`
  },
  {
    id: "section-25",
    title: "25. CONTACT INFORMATION",
    body: `StrideNex Private Limited


              Registered Office: Pune, Maharashtra, India


              Email: info@stridenex.ai


              Website: www.stridenex.ai`
  },
  {
    id: "section-26",
    title: "26. ACKNOWLEDGMENT",
    body: `By using the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use and our Privacy Policy.
              


              © 2026 StrideNex Private Limited. All rights reserved.`
  },
];

export const TermsOfUseScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft color={colors.navy} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Terms of Use</Text>
          <View style={{width: 24}} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <View style={styles.iconWrapper}>
              <ShieldCheck size={32} color={colors.accent.DEFAULT} />
            </View>
            <Text style={styles.heroTitle}>Terms of Use</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background.light },
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    backgroundColor: '#fff', 
    borderBottomWidth: 1, borderBottomColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 3
  },
  backBtn: { padding: spacing.xs, marginLeft: -spacing.xs },
  headerTitle: { fontSize: typography.fontSize.lg, color: colors.navy, fontWeight: typography.fontWeight.bold, fontFamily: typography.fontFamily.display },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
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

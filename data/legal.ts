/**
 * Static legal docs — Terms, Privacy, DPA, Cookies. Same content as the SPA
 * version. When the CMS gains legal-page support, swap to fetching by slug.
 */

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalDoc {
  slug: 'terms' | 'privacy' | 'dpa' | 'cookies';
  title: string;
  effective: string;
  intro: string;
  sections: LegalSection[];
}

const EFFECTIVE = '2026-05-21';

export const LEGAL_DOCS: Record<string, LegalDoc> = {
  terms: {
    slug: 'terms',
    title: 'Terms of Service',
    effective: EFFECTIVE,
    intro:
      'These Terms govern your use of the EduSphere platform. By creating an account or using the service, you agree to be bound by them. If you are accepting on behalf of an organisation, you confirm you have authority to do so.',
    sections: [
      {
        heading: '1. Account & access',
        body: [
          'You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.',
          'You agree to provide accurate registration information and to keep it up to date. School administrators are responsible for the users they invite into their tenant.',
        ],
      },
      {
        heading: '2. Acceptable use',
        body: [
          'You agree not to use the service to upload unlawful content, to attempt to gain unauthorised access to other tenants, or to interfere with the integrity or performance of the service.',
          'Automated scraping, reverse engineering, and resale of the service are prohibited without our written consent.',
        ],
      },
      {
        heading: '3. Subscriptions, trials, and billing',
        body: [
          'Paid plans are billed in advance per the interval you select (monthly or annual). Trials convert to the selected plan unless cancelled before the trial ends.',
          'Fees are non-refundable except where required by law or expressly stated (for example, our 14-day money-back guarantee on new paid subscriptions).',
          'We may change pricing with at least 30 days’ notice. Changes do not apply to a subscription already paid for the current term.',
        ],
      },
      {
        heading: '4. Your content',
        body: [
          'You retain all rights to the data you upload (student records, fee data, exam results, etc.). You grant us a limited licence to host, process, and display this data solely to provide the service to your tenant.',
          'You are responsible for ensuring you have the necessary consents to upload personal data, particularly for minors.',
        ],
      },
      {
        heading: '5. Service availability',
        body: [
          'We target 99.9% monthly uptime. Planned maintenance is announced in advance via the in-app banner and the changelog.',
          'Enterprise customers receive a custom SLA with credits for downtime; the standard plans do not include service credits.',
        ],
      },
      {
        heading: '6. Termination',
        body: [
          'You may cancel your subscription at any time from the Subscriptions page. Access to paid features stops at the end of the paid term.',
          'We may suspend or terminate accounts that violate these Terms, attempt to harm other tenants, or fail to pay outstanding invoices.',
          'On termination, you can export your data for 30 days before it is irreversibly deleted from our active systems.',
        ],
      },
      {
        heading: '7. Liability',
        body: [
          'To the maximum extent permitted by law, our aggregate liability under these Terms is limited to the fees you have paid in the 12 months preceding the claim.',
          'We are not liable for indirect, incidental, or consequential damages, including loss of data caused by your own failure to maintain backups beyond those we provide.',
        ],
      },
      {
        heading: '8. Governing law',
        body: ['These Terms are governed by the laws of India. Exclusive jurisdiction lies with the courts of Bengaluru, Karnataka.'],
      },
      {
        heading: '9. Changes to these terms',
        body: ['We may update these Terms from time to time. Material changes will be announced in-app and via email to school administrators at least 14 days before they take effect.'],
      },
    ],
  },
  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy',
    effective: EFFECTIVE,
    intro:
      'EduSphere processes personal data on behalf of schools (our customers). This policy explains what data we collect, how we use it, and what rights data subjects have under GDPR and the India DPDP Act.',
    sections: [
      { heading: '1. Who we are', body: ['EduSphere is operated by EduSphere Technologies, headquartered in Bengaluru, India. For data-protection enquiries, contact privacy@edusphere.app.'] },
      { heading: '2. Data we collect', body: [
        'Customer data (you control): student records, attendance, fees, exam results, staff details — uploaded by school administrators and staff.',
        'Account data: name, email, role, hashed password, and login activity for users with EduSphere accounts.',
        'Usage data: pages viewed, actions taken, IP address, user agent — used to operate, secure, and improve the service.',
        'Payment data: handled by Razorpay; we store only the transaction reference and outcome.',
      ] },
      { heading: '3. How we use data', body: [
        'To provide and improve the service for your school.',
        'To send transactional emails (password resets, invoice receipts, plan-renewal notices).',
        'To prevent fraud, abuse, and security incidents.',
        'To comply with legal obligations (e.g. tax records).',
      ] },
      { heading: '4. Lawful bases', body: [
        'For customers and their users: contractual necessity (to deliver the service you signed up for).',
        'For visitors to our marketing site: legitimate interest (to understand traffic) and consent (for analytics cookies).',
      ] },
      { heading: '5. Sharing', body: [
        'We share data only with the subprocessors listed on the Security page (AWS, Razorpay, SendGrid, Cloudflare), each bound by appropriate data-protection contracts.',
        'We do not sell personal data. We do not use student records for advertising.',
      ] },
      { heading: '6. Retention', body: [
        'Active tenant data is retained for the life of the subscription plus 30 days after cancellation, to support reactivation and export.',
        'Audit logs are retained per your plan tier (30 days to unlimited).',
        'Backups are retained for 30 days on a rolling window.',
      ] },
      { heading: '7. Your rights', body: [
        'You can request access, correction, or deletion of your personal data, subject to legal retention obligations. Contact privacy@edusphere.app and we will respond within 30 days.',
        'You may lodge a complaint with your local data-protection authority if you believe we have not handled your data correctly.',
      ] },
      { heading: '8. International transfers', body: ['Customer data is primarily hosted in AWS Mumbai (ap-south-1). Some operational services (email delivery, CDN) run globally; transfers are covered by Standard Contractual Clauses where applicable.'] },
      { heading: '9. Security', body: ['See our Security page for the technical and organisational measures we apply, including encryption, access control, and audit logging.'] },
    ],
  },
  dpa: {
    slug: 'dpa',
    title: 'Data Processing Addendum',
    effective: EFFECTIVE,
    intro:
      'This DPA forms part of the agreement between EduSphere (Processor) and the Customer (Controller) and sets out how personal data will be processed in connection with the service. A signed PDF version is available on request from privacy@edusphere.app.',
    sections: [
      { heading: '1. Definitions', body: ['"Personal Data", "Processing", "Controller", "Processor", and "Sub-processor" have the meanings given in applicable data-protection law (including the GDPR and the India DPDP Act).'] },
      { heading: '2. Scope and roles', body: ['The Customer is the Controller of personal data uploaded into the service. EduSphere acts as a Processor, processing personal data only on documented instructions from the Customer.'] },
      { heading: '3. Sub-processors', body: ['The Customer authorises EduSphere to engage the sub-processors listed on the Security page. EduSphere will notify Customers in advance of any new sub-processor, and Customers may object on reasonable data-protection grounds.'] },
      { heading: '4. Security measures', body: ['EduSphere implements the technical and organisational measures described on the Security page, including encryption in transit and at rest, role-based access, multi-tenant isolation, audit logging, and incident response.'] },
      { heading: '5. Data-subject requests', body: ['EduSphere will assist the Customer to fulfil data-subject access, correction, and deletion requests through self-serve tooling within the platform and, where needed, through engineering support.'] },
      { heading: '6. Breach notification', body: ['EduSphere will notify the Customer of any confirmed personal-data breach affecting the Customer’s tenant within 72 hours of discovery, with the information needed for the Customer to meet its own regulatory notification obligations.'] },
      { heading: '7. Return and deletion', body: ['On termination, the Customer may export tenant data for 30 days. Thereafter, EduSphere will delete tenant data from active systems within 30 days and from backups within 90 days, subject to legal retention requirements.'] },
      { heading: '8. International transfers', body: ['Where personal data is transferred outside the country of origin, EduSphere relies on Standard Contractual Clauses or equivalent legal mechanisms.'] },
    ],
  },
  cookies: {
    slug: 'cookies',
    title: 'Cookie Policy',
    effective: EFFECTIVE,
    intro:
      'This policy explains how EduSphere uses cookies and similar storage technologies on its marketing site and inside the application.',
    sections: [
      { heading: '1. What are cookies?', body: ['Cookies are small text files placed on your device by websites you visit. They allow the site to recognise your device and remember information about your visit, such as your sign-in state or your cookie preference.'] },
      { heading: '2. Cookies we set', body: [
        'Strictly necessary: authentication tokens, CSRF tokens, your cookie-consent choice. These cannot be disabled while you are using the service.',
        'Analytics: anonymous identifiers used by Google Analytics to understand traffic patterns. Set only after you accept analytics cookies.',
        'Marketing: not used today. We will update this policy and re-prompt for consent before enabling any marketing cookies.',
      ] },
      { heading: '3. Managing your choice', body: [
        'When you first visit, we ask you to accept or reject non-essential cookies. You can change your choice at any time by clearing the "edusphere.cookieConsent.v1" entry in your browser storage and reloading the site.',
        'You can also block cookies through your browser settings — note that this may break sign-in.',
      ] },
    ],
  },
};

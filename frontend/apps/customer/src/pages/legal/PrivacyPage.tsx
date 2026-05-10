import { Link } from 'react-router-dom';
import { ChevronLeft, Shield, Lock, Eye, FileText, Mail } from 'lucide-react';
import { motion } from 'motion/react';

const PrivacyPage = () => {
  const lastUpdated = 'May 2026';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to home
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 sm:p-12"
        >
          <header className="border-b border-gray-100 pb-6 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
              <Shield className="w-3.5 h-3.5" />
              KVKK & GDPR compliant
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-500 mt-2">Last updated: {lastUpdated}</p>
          </header>

          <p className="text-gray-700 leading-relaxed mb-6">
            TurqHeal ("we", "us") is committed to protecting your personal data.
            This policy explains what we collect, why, how we store it, and the
            rights you have under <strong>Turkey's Personal Data Protection Law
            (KVKK, Law No. 6698)</strong> and the <strong>EU General Data
            Protection Regulation (GDPR)</strong>.
          </p>

          <Section
            icon={Eye}
            title="1. What we collect"
            body={
              <>
                <p className="mb-3">When you use TurqHeal we may collect:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li><strong>Account data</strong> — email, full name, role (patient / provider / admin), phone number (optional).</li>
                  <li><strong>Booking data</strong> — appointment dates, treatment package selection, communication preferences.</li>
                  <li><strong>Medical documents</strong> — only when you choose to upload them for a booking. Encrypted at rest, accessed via short-lived signed URLs.</li>
                  <li><strong>Payment metadata</strong> — last 4 digits and brand of the card. We <em>never</em> store full card numbers, CVCs, or expiry dates; payment data goes directly to the payment provider.</li>
                  <li><strong>Technical data</strong> — IP address, browser type, device fingerprint (for security and rate limiting).</li>
                </ul>
              </>
            }
          />

          <Section
            icon={FileText}
            title="2. Why we use it (lawful basis)"
            body={
              <>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li><strong>To provide the service</strong> (Article 6(1)(b) GDPR — performance of contract): account creation, booking processing, payment, document delivery.</li>
                  <li><strong>To comply with legal obligations</strong> (Article 6(1)(c)): tax records, KVKK record-keeping.</li>
                  <li><strong>For our legitimate interests</strong> (Article 6(1)(f)): fraud prevention, security monitoring, platform improvement — balanced against your rights.</li>
                  <li><strong>With your consent</strong> (Article 6(1)(a)): marketing communications, optional cookies. You can withdraw consent at any time.</li>
                </ul>
              </>
            }
          />

          <Section
            icon={Lock}
            title="3. How we protect it"
            body={
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>All transit between your browser and our servers uses HTTPS with TLS 1.2+.</li>
                <li>Passwords are hashed with PBKDF2-SHA256 — they are never stored or transmitted in plaintext.</li>
                <li>JSON Web Tokens have a 15-minute lifetime; refresh tokens are blacklisted on logout.</li>
                <li>Medical documents are stored in private object storage (Cloudinary <code>authenticated</code> resources) and require server-signed URLs with a 15-minute time-to-live to access.</li>
                <li>Card data is processed by our PCI-DSS-compliant payment provider; only last-4 + brand reach our database.</li>
                <li>Rate limiting and account lockout protect against brute-force attacks.</li>
                <li>Per-request authorization is enforced before any access to documents or bookings.</li>
              </ul>
            }
          />

          <Section
            icon={FileText}
            title="4. How long we keep it"
            body={
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li><strong>Active accounts:</strong> retained while your account is active.</li>
                <li><strong>Bookings + payments:</strong> retained for at least 5 years for legal/tax obligations after the last activity.</li>
                <li><strong>Medical documents:</strong> retained until you or your provider deletes them, or 5 years after the booking completes — whichever is shorter.</li>
                <li><strong>Application logs:</strong> 30 days, with personally identifying data redacted.</li>
              </ul>
            }
          />

          <Section
            icon={Shield}
            title="5. Your rights"
            body={
              <>
                <p className="mb-3">Under KVKK and GDPR, you have the right to:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li><strong>Access</strong> — view a copy of all data we hold about you.</li>
                  <li><strong>Rectification</strong> — correct inaccurate data through your profile or by contacting us.</li>
                  <li><strong>Erasure</strong> — request deletion of your account and personal data (subject to legal retention requirements).</li>
                  <li><strong>Restriction</strong> — limit how we process your data while a dispute is being resolved.</li>
                  <li><strong>Portability</strong> — receive your data in a machine-readable format (JSON export).</li>
                  <li><strong>Objection</strong> — object to processing based on legitimate interests.</li>
                  <li><strong>Withdraw consent</strong> at any time, where processing is based on consent.</li>
                </ul>
                <p className="mt-3">
                  To exercise any of these rights, email us at{' '}
                  <a href="mailto:privacy@turqheal.com" className="text-primary-600 hover:underline">
                    privacy@turqheal.com
                  </a>{' '}
                  with the subject "Data subject request". We respond within 30 days.
                </p>
              </>
            }
          />

          <Section
            icon={FileText}
            title="6. Sharing with third parties"
            body={
              <>
                <p className="mb-3">We share data only with the providers strictly required to deliver the service:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li><strong>Cloudinary</strong> (image and document storage)</li>
                  <li><strong>Payment provider</strong> (Stripe / Iyzico — only payment-related data)</li>
                  <li><strong>SMTP relay</strong> (transactional emails — recipient address + email body)</li>
                  <li><strong>AI provider (Groq)</strong> — your Smart Match query is sent to the LLM along with the active package catalog. Queries are not tied to your account identifier in our outbound calls.</li>
                </ul>
                <p className="mt-3">
                  Each of these processors has signed a Data Processing Agreement (DPA) consistent with GDPR Article 28. We do not sell, rent, or trade your personal data.
                </p>
              </>
            }
          />

          <Section
            icon={FileText}
            title="7. Cookies"
            body={
              <p>
                We use only strictly-necessary cookies (authentication tokens). We do
                not use third-party advertising or analytics cookies. If we add
                analytics in the future, we will request your explicit consent first
                via a banner.
              </p>
            }
          />

          <Section
            icon={FileText}
            title="8. International transfers"
            body={
              <p>
                Some of our processors operate outside Turkey and the EU. Where
                personal data is transferred internationally, the recipient is
                bound by Standard Contractual Clauses approved by the European
                Commission and is located in a country with an adequacy decision
                from KVKK or the EU.
              </p>
            }
          />

          <Section
            icon={FileText}
            title="9. Children"
            body={
              <p>
                TurqHeal is not directed at children under 16. If you believe a
                minor has provided us personal data without parental consent,
                contact us and we will delete it.
              </p>
            }
          />

          <Section
            icon={FileText}
            title="10. Changes to this policy"
            body={
              <p>
                We may update this policy from time to time. Material changes will
                be announced via email and through an in-app banner. The "Last
                updated" date at the top of this page is always current.
              </p>
            }
          />

          <Section
            icon={Mail}
            title="11. Contact"
            body={
              <p>
                Questions or concerns about this policy? Email{' '}
                <a href="mailto:privacy@turqheal.com" className="text-primary-600 hover:underline">
                  privacy@turqheal.com
                </a>
                . You may also lodge a complaint with the Turkish Personal Data
                Protection Authority (
                <a
                  href="https://www.kvkk.gov.tr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  kvkk.gov.tr
                </a>
                ) or your local EU supervisory authority.
              </p>
            }
          />
        </motion.article>

        <p className="text-center text-xs text-gray-400 mt-6">
          See also our{' '}
          <Link to="/terms" className="text-primary-600 hover:underline">
            Terms of Service
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

const Section = ({
  icon: Icon,
  title,
  body,
}: {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  body: React.ReactNode;
}) => (
  <section className="mb-8">
    <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-3">
      <Icon className="w-5 h-5 text-primary-600" />
      {title}
    </h2>
    <div className="text-gray-700 leading-relaxed">{body}</div>
  </section>
);

export default PrivacyPage;

import { Link } from 'react-router-dom';
import { ChevronLeft, FileText, AlertCircle, Scale, Globe, Mail } from 'lucide-react';
import { motion } from 'motion/react';

const TermsPage = () => {
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
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 bg-secondary-50 text-secondary-700 rounded-full text-xs font-medium">
              <Scale className="w-3.5 h-3.5" />
              Governing law: Republic of Turkey
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-sm text-gray-500 mt-2">Last updated: {lastUpdated}</p>
          </header>

          <p className="text-gray-700 leading-relaxed mb-6">
            These Terms of Service ("Terms") govern your use of the TurqHeal
            platform ("Platform"). By creating an account, you agree to these
            Terms. If you do not agree, please do not use the Platform.
          </p>

          <Section
            icon={FileText}
            title="1. Who we are"
            body={
              <p>
                TurqHeal is a marketplace that connects international patients
                with verified healthcare providers in Turkey. We are <em>not</em>
                {' '}a healthcare provider, do not provide medical services, and do
                not give medical advice.
              </p>
            }
          />

          <Section
            icon={FileText}
            title="2. Account types"
            body={
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li><strong>Patient</strong> — browse, book, and pay for treatment packages.</li>
                <li><strong>Provider</strong> — clinics or hospitals listing services. Providers must complete a verification process before they can publish packages.</li>
                <li><strong>Admin</strong> — platform operators.</li>
              </ul>
            }
          />

          <Section
            icon={AlertCircle}
            title="3. Your responsibilities"
            body={
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Provide accurate information when registering and booking.</li>
                <li>Keep your password secure. You are responsible for activity on your account.</li>
                <li>Do not impersonate another person, organization, or healthcare provider.</li>
                <li>Do not upload content that is illegal, infringing, or harmful.</li>
                <li>Do not attempt to disrupt the Platform or bypass rate limits or authentication.</li>
                <li>Comply with the laws of your jurisdiction and Turkey while using the Platform.</li>
              </ul>
            }
          />

          <Section
            icon={Scale}
            title="4. Bookings and payments"
            body={
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>A booking is a request to a healthcare provider, not a binding contract until the provider confirms it.</li>
                <li>Pricing on the Platform is shown in the listed currency. Final pricing is between you and the provider.</li>
                <li>Payments are processed by a third-party payment provider; TurqHeal does not store full card numbers, CVCs, or expiry dates.</li>
                <li>Refunds are governed by the provider's individual policy. TurqHeal facilitates refund requests but is not the principal party to your treatment contract.</li>
                <li>Cancellations and rescheduling follow the provider's policy as displayed at the time of booking.</li>
              </ul>
            }
          />

          <Section
            icon={AlertCircle}
            title="5. Provider verification"
            body={
              <p>
                We perform a verification check on providers (business
                registration, professional credentials) before granting them the
                "Verified" badge. Verification reflects information available to
                us at the time and does not constitute a medical or commercial
                endorsement. You should perform your own due diligence before
                engaging a provider.
              </p>
            }
          />

          <Section
            icon={AlertCircle}
            title="6. Medical disclaimer"
            body={
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Information on the Platform is for informational purposes only and is not medical advice.</li>
                <li>The AI-powered "Smart Match" feature suggests packages that look related to your query — it is <em>not</em> a diagnosis or recommendation that you should pursue treatment.</li>
                <li>Always consult a qualified medical professional before making decisions about your health.</li>
                <li>TurqHeal is not liable for the medical outcomes of any treatment booked through the Platform.</li>
              </ul>
            }
          />

          <Section
            icon={FileText}
            title="7. Intellectual property"
            body={
              <p>
                The Platform's design, code, brand, and content are owned by
                TurqHeal or its licensors. You retain ownership of content you
                upload (e.g., medical documents, provider photos) but grant us a
                limited, non-exclusive license to host and display it for the
                purpose of operating the Platform.
              </p>
            }
          />

          <Section
            icon={FileText}
            title="8. Termination"
            body={
              <p>
                You may close your account at any time from your profile. We may
                suspend or terminate accounts that violate these Terms, that
                appear fraudulent, or where required by law. Upon termination,
                your data is handled in accordance with our{' '}
                <Link to="/privacy" className="text-primary-600 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            }
          />

          <Section
            icon={Scale}
            title="9. Limitation of liability"
            body={
              <p>
                To the maximum extent permitted by applicable law, TurqHeal is
                not liable for indirect, incidental, special, or consequential
                damages arising from your use of the Platform. Our total
                liability for direct damages is limited to the fees paid to
                TurqHeal in the 12 months preceding the claim.
              </p>
            }
          />

          <Section
            icon={Globe}
            title="10. Governing law and dispute resolution"
            body={
              <p>
                These Terms are governed by the laws of the Republic of Turkey.
                Disputes shall be resolved by the competent courts of Istanbul,
                without prejudice to your mandatory rights as a consumer in your
                country of residence.
              </p>
            }
          />

          <Section
            icon={FileText}
            title="11. Changes to these Terms"
            body={
              <p>
                We may update these Terms occasionally. Material changes will be
                announced via email and through an in-app banner at least 14
                days before they take effect.
              </p>
            }
          />

          <Section
            icon={Mail}
            title="12. Contact"
            body={
              <p>
                Questions about these Terms? Email{' '}
                <a href="mailto:legal@turqheal.com" className="text-primary-600 hover:underline">
                  legal@turqheal.com
                </a>
                .
              </p>
            }
          />
        </motion.article>

        <p className="text-center text-xs text-gray-400 mt-6">
          See also our{' '}
          <Link to="/privacy" className="text-primary-600 hover:underline">
            Privacy Policy
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

export default TermsPage;

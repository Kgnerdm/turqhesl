import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard,
  Lock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Building2,
  Info,
} from 'lucide-react';
import {
  getPayment,
  processPayment,
  type PaymentDetail,
  type Payment,
} from '@/api/payments';
import { Button, FadeInOnScroll } from '@/components/ui';

const TEST_CARDS = [
  { number: '4242 4242 4242 4242', label: 'Success', tone: 'green' as const },
  { number: '4000 0000 0000 0002', label: 'Declined', tone: 'red' as const },
  { number: '4000 0000 0000 9995', label: 'Insufficient funds', tone: 'amber' as const },
];

const formatCard = (raw: string) => {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return digits.match(/.{1,4}/g)?.join(' ') ?? '';
};

const formatExpiry = (raw: string) => {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
};

const errorCopy = (status: string, fallback: string): string => {
  switch (status) {
    case 'declined':
      return 'Your card was declined. Try another card or contact your bank.';
    case 'insufficient_funds':
      return 'Your card has insufficient funds for this transaction.';
    case 'failed':
      return 'Payment failed. Please try again.';
    default:
      return fallback || 'Payment could not be completed.';
  }
};

const CheckoutPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<PaymentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Payment | null>(null);

  useEffect(() => {
    let active = true;
    if (!token) return;
    setIsLoading(true);
    getPayment(token)
      .then((d) => {
        if (active) setDetail(d);
      })
      .catch(() => {
        if (active) setLoadError('Payment session not found or expired.');
      })
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [token]);

  // Auto-redirect to dashboard 2.5s after a successful payment
  useEffect(() => {
    if (result?.status === 'succeeded') {
      const t = window.setTimeout(() => navigate('/dashboard?payment=success'), 2500);
      return () => window.clearTimeout(t);
    }
  }, [result, navigate]);

  const isValid = useMemo(() => {
    const digits = cardNumber.replace(/\D/g, '');
    const exp = expiry.replace(/\D/g, '');
    return digits.length >= 13 && exp.length === 4 && cvc.length >= 3;
  }, [cardNumber, expiry, cvc]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !isValid) return;
    setSubmitting(true);
    try {
      const expDigits = expiry.replace(/\D/g, '');
      const month = expDigits.slice(0, 2);
      const yearShort = expDigits.slice(2, 4);
      const year = yearShort.length === 2 ? `20${yearShort}` : yearShort;

      const resp = await processPayment(token, {
        card_number: cardNumber,
        card_exp_month: month,
        card_exp_year: year,
        card_cvc: cvc,
        cardholder_name: name,
      });
      setResult(resp.payment);
    } catch {
      // Reload the detail so the UI reflects whatever state it's in
      getPayment(token).then((d) => setDetail(d)).catch(() => {});
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setResult(null);
    setCardNumber('');
    setExpiry('');
    setCvc('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (loadError || !detail) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Session not available</h1>
          <p className="text-gray-600 mb-6">{loadError || 'Unable to load this payment.'}</p>
          <Link to="/dashboard">
            <Button>Back to dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { payment, booking } = detail;
  const showResult = result !== null;
  const succeeded = result?.status === 'succeeded';
  const failed = result && result.status !== 'succeeded';

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-200/40 rounded-full blur-3xl animate-float" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-secondary-200/40 rounded-full blur-3xl animate-float-delayed" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>

        <FadeInOnScroll>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <strong>Sandbox checkout.</strong> No real charge is made. Use the test
              cards on the right to simulate different outcomes.
            </div>
          </div>
        </FadeInOnScroll>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Card form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl shadow-xl p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payment</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {booking.package_name} · {booking.provider_name}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Lock className="w-3.5 h-3.5" />
                Secure
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!showResult && (
                <motion.form
                  key="form"
                  onSubmit={onSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Cardholder name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Card number
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCard(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition font-mono tracking-wider"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Expiry (MM / YY)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        placeholder="12 / 30"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        CVC
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition font-mono"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full mt-2"
                    disabled={!isValid || submitting}
                    leftIcon={
                      submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />
                    }
                  >
                    {submitting ? 'Processing…' : `Pay ${payment.amount} ${payment.currency}`}
                  </Button>

                  <p className="text-xs text-gray-400 text-center pt-2">
                    Card data never leaves your browser as anything but the last 4 digits.
                  </p>
                </motion.form>
              )}

              {showResult && succeeded && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                  >
                    <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment confirmed</h2>
                  <p className="text-gray-600 mb-1">
                    {payment.amount} {payment.currency} charged to {result?.card_brand}
                    {' '}•••• {result?.card_last4}
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Redirecting to your dashboard…
                  </p>
                  <Link to="/dashboard">
                    <Button variant="outline">Go to dashboard now</Button>
                  </Link>
                </motion.div>
              )}

              {showResult && failed && (
                <motion.div
                  key="failure"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                  >
                    <XCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment unsuccessful</h2>
                  <p className="text-gray-600 max-w-sm mx-auto mb-6">
                    {errorCopy(result!.status, result!.error_message)}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link to="/dashboard">
                      <Button variant="outline">Cancel</Button>
                    </Link>
                    <Button onClick={reset}>Try another card</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Sidebar: order summary + test cards */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Order summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-gray-500">Provider</div>
                    <div className="font-medium text-gray-900">{booking.provider_name}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-gray-500">Appointment</div>
                    <div className="font-medium text-gray-900">{booking.appointment_date}</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-end justify-between">
                  <span className="text-gray-500 text-sm">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {payment.amount} {payment.currency}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Info className="w-4 h-4 text-gray-500" />
                Test cards
              </h3>
              <p className="text-xs text-gray-500 mb-3">Click to autofill.</p>
              <div className="space-y-2">
                {TEST_CARDS.map((c) => (
                  <button
                    key={c.number}
                    type="button"
                    onClick={() => {
                      setCardNumber(c.number);
                      setExpiry('12 / 30');
                      setCvc('123');
                      setName(name || 'Demo Patient');
                    }}
                    className="w-full text-left flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition group"
                  >
                    <div>
                      <div className="font-mono text-sm text-gray-900 tracking-wider">
                        {c.number}
                      </div>
                      <div
                        className={`text-xs mt-0.5 ${
                          c.tone === 'green'
                            ? 'text-green-700'
                            : c.tone === 'red'
                            ? 'text-red-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {c.label}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        c.tone === 'green'
                          ? 'bg-green-100 text-green-700'
                          : c.tone === 'red'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      Try
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

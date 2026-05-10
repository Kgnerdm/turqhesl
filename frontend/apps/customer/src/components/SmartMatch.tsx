import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Loader2,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  MessageSquareQuote,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { smartMatchPackages, type SmartMatch } from '@/api/ai';

const SAMPLE_QUERIES = [
  'I need dental implants and prefer Istanbul',
  'Hair loss treatment, budget-friendly',
  'LASIK eye surgery for nearsightedness',
];

export const SmartMatchSection = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<SmartMatch[] | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 3) {
      setError('Tell us a bit more — at least a few words.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await smartMatchPackages(query.trim());
      setMatches(resp.matches);
      setHasSubmitted(true);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 429) {
        setError("You've used your matches for the next minute. Try again shortly.");
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMatches(null);
    setHasSubmitted(false);
    setQuery('');
    setError(null);
  };

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary-900 via-secondary-800 to-primary-900" />
      <div className="absolute inset-0 bg-mesh-primary opacity-30" />
      <div className="absolute -top-20 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-float" />
      <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl animate-float-delayed" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
          >
            <Sparkles className="w-4 h-4 text-primary-200" />
            <span className="text-sm font-medium text-white/90">AI-Powered</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-5xl font-bold text-white tracking-tight"
          >
            Tell us what you need
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-lg text-white/70 max-w-2xl mx-auto"
          >
            Describe your treatment needs in your own words. Our AI analyzes
            our verified provider catalog and recommends the best 3 matches.
          </motion.p>
        </div>

        {/* Input form */}
        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl p-3 shadow-2xl border border-white/40"
        >
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative">
              <MessageSquareQuote className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. I'm looking for dental implants in Istanbul…"
                maxLength={500}
                className="w-full pl-12 pr-4 py-4 bg-transparent rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={loading || query.trim().length < 3}
              leftIcon={
                loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Wand2 className="w-5 h-5" />
                )
              }
              className="md:px-8 shadow-lg"
            >
              {loading ? 'Matching…' : 'Smart Match'}
            </Button>
          </div>
        </motion.form>

        {/* Sample queries */}
        {!hasSubmitted && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-2 mt-5"
          >
            <span className="text-sm text-white/60">Try:</span>
            {SAMPLE_QUERIES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQuery(s)}
                className="text-sm px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-full border border-white/15 hover:border-white/30 transition-all"
              >
                "{s}"
              </button>
            ))}
          </motion.div>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex items-center gap-2 text-amber-200 bg-amber-900/20 border border-amber-500/30 backdrop-blur-md rounded-xl px-4 py-3 max-w-2xl mx-auto"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {matches !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-12"
            >
              {matches.length === 0 ? (
                <div className="text-center py-12 text-white/70">
                  <p className="mb-4">
                    We couldn't find a confident match in our current catalog.
                  </p>
                  <Link to="/packages">
                    <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary-600">
                      Browse all packages instead
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-white">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span className="font-medium">{matches.length} match{matches.length === 1 ? '' : 'es'} for you</span>
                    </div>
                    <button
                      type="button"
                      onClick={reset}
                      className="text-sm text-white/70 hover:text-white underline underline-offset-4"
                    >
                      Try another query
                    </button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-5">
                    {matches.map((m, i) => (
                      <motion.div
                        key={m.package.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                      >
                        <Link to={`/packages/${m.package.id}`}>
                          <motion.div
                            whileHover={{ y: -6 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="h-full bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl border border-white/40 hover:shadow-2xl transition-shadow"
                          >
                            {/* Rank badge */}
                            <div className="relative">
                              <img
                                src={m.package.images?.[0] || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600'}
                                alt={m.package.name}
                                className="w-full h-36 object-cover"
                              />
                              <div className="absolute top-3 left-3 bg-gradient-to-br from-primary-500 to-primary-700 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                                {i + 1}
                              </div>
                            </div>
                            <div className="p-4">
                              <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
                                {m.package.name}
                              </h3>
                              <p className="text-xs text-gray-500 mb-3">
                                {m.package.provider?.businessName} · {m.package.provider?.city}
                              </p>
                              <div className="flex items-start gap-2 mb-3 p-3 bg-primary-50 rounded-lg border border-primary-100">
                                <Sparkles className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-primary-900 leading-relaxed">
                                  {m.reason}
                                </p>
                              </div>
                              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <span className="text-lg font-bold text-primary-600">
                                  ${Number(m.package.price).toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1 text-sm font-medium text-primary-600 group-hover:gap-2 transition-all">
                                  View
                                  <ArrowRight className="w-4 h-4" />
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default SmartMatchSection;

import { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Building2, 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock,
  BadgeCheck,
  RefreshCw,
  DollarSign,
  CalendarCheck
} from 'lucide-react';
import { Button, Card, Badge, Loading } from '@/components/ui';
import { formatDate, formatCurrency } from '@/utils/format';
import type { Provider } from '@/types';
import { 
  getAdminStats, 
  getPendingProviders, 
  verifyProvider, 
  rejectProvider,
  type AdminStats 
} from '@/api/providers';

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingProviders, setPendingProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, pendingData] = await Promise.all([
        getAdminStats(),
        getPendingProviders(1, 20),
      ]);
      
      setStats(statsData);
      setPendingProviders(pendingData.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleVerify = async (id: string) => {
    try {
      setActionLoading(id);
      await verifyProvider(id, true);
      setPendingProviders(pendingProviders.filter((p) => p.id !== id));
      // Refresh stats after verification
      const newStats = await getAdminStats();
      setStats(newStats);
    } catch (err) {
      console.error('Error verifying provider:', err);
      alert('Failed to verify provider. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Enter rejection reason (optional):');
    try {
      setActionLoading(id);
      await rejectProvider(id, reason || undefined);
      setPendingProviders(pendingProviders.filter((p) => p.id !== id));
      // Refresh stats after rejection
      const newStats = await getAdminStats();
      setStats(newStats);
    } catch (err) {
      console.error('Error rejecting provider:', err);
      alert('Failed to reject provider. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const statsCards = stats ? [
    { label: 'Total Users', value: stats.users.total.toLocaleString(), icon: Users, color: 'bg-blue-500', subtext: `${stats.users.patients} patients, ${stats.users.providers} providers` },
    { label: 'Active Providers', value: stats.providers.active.toLocaleString(), icon: Building2, color: 'bg-green-500', subtext: `${stats.providers.verified} verified` },
    { label: 'Total Packages', value: stats.packages.total.toLocaleString(), icon: Package, color: 'bg-purple-500', subtext: `${stats.packages.active} active` },
    { label: 'Pending Approvals', value: stats.providers.pending.toString(), icon: Clock, color: 'bg-yellow-500', subtext: '' },
    { label: 'Total Bookings', value: stats.bookings.total.toLocaleString(), icon: CalendarCheck, color: 'bg-indigo-500', subtext: `${stats.bookings.pending} pending` },
    { label: 'Total Revenue', value: formatCurrency(stats.revenue.total), icon: DollarSign, color: 'bg-emerald-500', subtext: `${stats.bookings.completed} completed` },
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchData} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Platform overview and provider management
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={fetchData}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statsCards.map((stat) => (
            <Card key={stat.label}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  {stat.subtext && (
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.subtext}
                    </p>
                  )}
                </div>
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pending Provider Verifications */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <BadgeCheck className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Pending Provider Verifications
                </h2>
                <p className="text-sm text-gray-500">
                  Review and verify new provider applications
                </p>
              </div>
            </div>
            <Badge variant="warning">{pendingProviders.length} pending</Badge>
          </div>

          {pendingProviders.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
              <p className="text-gray-500">All providers have been reviewed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="border border-gray-200 rounded-xl p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Provider Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {provider.businessName}
                        </h3>
                        <Badge variant="secondary" size="sm">
                          {provider.city}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">
                        {provider.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Contact</p>
                          <p className="text-gray-900">{provider.email}</p>
                          <p className="text-gray-600">{provider.phone}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Categories</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {provider.categories.map((cat) => (
                              <Badge key={cat} variant="outline" size="sm">
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Certificates */}
                      {provider.certificates.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-500 mb-2">Certificates</p>
                          <div className="flex flex-wrap gap-2">
                            {provider.certificates.map((cert) => (
                              <div
                                key={cert.id}
                                className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg"
                              >
                                <BadgeCheck className="w-4 h-4 text-primary-500" />
                                <span className="text-sm">{cert.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-gray-400 mt-4">
                        Applied on {formatDate(provider.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-3">
                      <Button
                        onClick={() => handleVerify(provider.id)}
                        leftIcon={actionLoading === provider.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        className="flex-1 lg:flex-none"
                        disabled={actionLoading !== null}
                      >
                        {actionLoading === provider.id ? 'Verifying...' : 'Verify'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleReject(provider.id)}
                        leftIcon={<XCircle className="w-4 h-4" />}
                        className="flex-1 lg:flex-none text-error border-error hover:bg-red-50"
                        disabled={actionLoading !== null}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;


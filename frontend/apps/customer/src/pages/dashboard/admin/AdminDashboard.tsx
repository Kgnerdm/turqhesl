import { useState } from 'react';
import { 
  Users, 
  Building2, 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  BadgeCheck
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { formatDate } from '@/utils/format';
import type { Provider } from '@/types';

const AdminDashboard = () => {
  const [pendingProviders, setPendingProviders] = useState<Provider[]>([
    {
      id: '4',
      userId: '4',
      businessName: 'Ankara Eye Center',
      description: 'Specialized eye care center offering LASIK and cataract surgery.',
      city: 'Ankara',
      address: 'Çankaya, Ankara',
      phone: '+90 312 456 7890',
      email: 'info@ankaraeyecenter.com',
      isVerified: false,
      rating: 0,
      reviewCount: 0,
      categories: ['Eye Surgery'],
      certificates: [
        { id: '1', name: 'Ministry of Health License', issuedBy: 'Turkish Ministry of Health', issuedDate: '2023-01-01' },
      ],
      workingHours: {} as any,
      images: [],
      createdAt: '2024-01-20',
      updatedAt: '2024-01-20',
    },
    {
      id: '5',
      userId: '5',
      businessName: 'Izmir Fertility Clinic',
      description: 'Leading fertility treatment center with high success rates.',
      city: 'Izmir',
      address: 'Alsancak, Izmir',
      phone: '+90 232 567 8901',
      email: 'info@izmirfertility.com',
      isVerified: false,
      rating: 0,
      reviewCount: 0,
      categories: ['Fertility Treatment'],
      certificates: [],
      workingHours: {} as any,
      images: [],
      createdAt: '2024-01-19',
      updatedAt: '2024-01-19',
    },
  ]);

  const stats = [
    { label: 'Total Users', value: '12,345', icon: Users, color: 'bg-blue-500', change: '+5%' },
    { label: 'Active Providers', value: '523', icon: Building2, color: 'bg-green-500', change: '+12%' },
    { label: 'Total Packages', value: '1,847', icon: Package, color: 'bg-purple-500', change: '+8%' },
    { label: 'Pending Approvals', value: pendingProviders.length.toString(), icon: Clock, color: 'bg-yellow-500', change: '' },
  ];

  const handleVerify = (id: string) => {
    setPendingProviders(pendingProviders.filter((p) => p.id !== id));
    // In real app, call API to verify provider
  };

  const handleReject = (id: string) => {
    setPendingProviders(pendingProviders.filter((p) => p.id !== id));
    // In real app, call API to reject provider
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Platform overview and provider management
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  {stat.change && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stat.change} this month
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
                        leftIcon={<CheckCircle className="w-4 h-4" />}
                        className="flex-1 lg:flex-none"
                      >
                        Verify
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleReject(provider.id)}
                        leftIcon={<XCircle className="w-4 h-4" />}
                        className="flex-1 lg:flex-none text-error border-error hover:bg-red-50"
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


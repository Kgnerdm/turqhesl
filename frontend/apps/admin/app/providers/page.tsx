'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Building2, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock,
  MapPin,
  Package,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Header } from '@/components/Header';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { getProviders, getPendingProviders, verifyProvider, rejectProvider } from '@/lib/services/admin';
import type { Provider, PaginatedResponse } from '@/types';
import { formatDate } from '@/lib/utils';

type FilterType = 'all' | 'verified' | 'pending';

export default function ProvidersPage() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter') as FilterType || 'all';
  
  const [providers, setProviders] = useState<Provider[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadProviders = async (page: number = 1) => {
    setIsLoading(true);
    try {
      let response: PaginatedResponse<Provider>;
      
      if (filter === 'pending') {
        response = await getPendingProviders({ page, limit: 10 });
      } else {
        response = await getProviders({ 
          page, 
          limit: 10,
          isVerified: filter === 'verified' ? true : undefined,
          search: searchQuery || undefined,
        });
      }
      
      setProviders(response.data);
      setPagination({
        page: response.pagination.page,
        totalPages: response.pagination.totalPages,
        total: response.pagination.total,
      });
    } catch (error) {
      console.error('Failed to load providers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProviders(1);
  }, [filter, searchQuery]);

  const handleVerify = async (id: number) => {
    setActionLoading(id);
    try {
      await verifyProvider(id, true);
      loadProviders(pagination.page);
    } catch (error) {
      console.error('Failed to verify provider:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Are you sure you want to reject this provider?')) return;
    
    setActionLoading(id);
    try {
      await rejectProvider(id);
      loadProviders(pagination.page);
    } catch (error) {
      console.error('Failed to reject provider:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnverify = async (id: number) => {
    if (!confirm('Are you sure you want to remove verification from this provider?')) return;
    
    setActionLoading(id);
    try {
      await verifyProvider(id, false);
      loadProviders(pagination.page);
    } catch (error) {
      console.error('Failed to unverify provider:', error);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout>
      <Header 
        title="Provider Management" 
        subtitle="Verify and manage healthcare providers"
      />
      
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Filters */}
        <Card>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search providers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <div className="flex bg-slate-800/50 rounded-xl p-1">
                  {(['all', 'verified', 'pending'] as FilterType[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        filter === f
                          ? 'bg-emerald-500 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {f === 'all' ? 'All' : f === 'verified' ? 'Verified' : 'Pending'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>Showing {providers.length} of {pagination.total} providers</span>
        </div>

        {/* Provider List */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading skeleton
            [...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-xl bg-slate-800" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-48 bg-slate-800 rounded" />
                      <div className="h-4 w-32 bg-slate-800 rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : providers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No providers found</p>
              </CardContent>
            </Card>
          ) : (
            providers.map((provider) => (
              <Card key={provider.id} className="hover:border-slate-700 transition-colors">
                <CardContent>
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Provider Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center border border-violet-500/30">
                        <Building2 className="h-8 w-8 text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-white truncate">
                            {provider.businessName}
                          </h3>
                          {provider.isVerified ? (
                            <Badge variant="success">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="warning">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {provider.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {provider.packageCount || 0} packages
                          </span>
                          <span>Registered: {formatDate(provider.createdAt)}</span>
                        </div>
                        {provider.categories.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {provider.categories.slice(0, 3).map((cat) => (
                              <Badge key={cat} variant="default">
                                {cat}
                              </Badge>
                            ))}
                            {provider.categories.length > 3 && (
                              <Badge variant="default">
                                +{provider.categories.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 lg:ml-4">
                      {provider.website && (
                        <a
                          href={provider.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      )}
                      
                      {!provider.isVerified ? (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleVerify(provider.id)}
                            isLoading={actionLoading === provider.id}
                            leftIcon={<CheckCircle className="h-4 w-4" />}
                          >
                            Verify
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleReject(provider.id)}
                            isLoading={actionLoading === provider.id}
                            leftIcon={<XCircle className="h-4 w-4" />}
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnverify(provider.id)}
                          isLoading={actionLoading === provider.id}
                        >
                          Remove Verification
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadProviders(pagination.page - 1)}
                disabled={pagination.page === 1}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadProviders(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}


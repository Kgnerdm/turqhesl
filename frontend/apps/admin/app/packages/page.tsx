'use client';

import { useEffect, useState } from 'react';
import { 
  Package, 
  Search, 
  Building2,
  DollarSign,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Header } from '@/components/Header';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import api from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { PACKAGE_CATEGORIES, type PackageCategory } from '@/types';

interface PackageItem {
  id: number;
  name: string;
  description: string;
  category: PackageCategory;
  price: number;
  currency: string;
  duration: string;
  isActive: boolean;
  providerName?: string;
  providerCity?: string;
  createdAt: string;
}

type FilterType = 'all' | 'active' | 'inactive';

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadPackages = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '10');
      if (filter === 'active') params.set('is_active', 'true');
      if (filter === 'inactive') params.set('is_active', 'false');
      if (searchQuery) params.set('search', searchQuery);
      
      const response = await api.get(`/packages/?${params.toString()}`);
      
      const transformedPackages: PackageItem[] = response.data.data.map((p: Record<string, unknown>) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        price: p.price,
        currency: p.currency || 'USD',
        duration: p.duration,
        isActive: p.is_active,
        providerName: (p.provider as Record<string, unknown>)?.business_name,
        providerCity: (p.provider as Record<string, unknown>)?.city,
        createdAt: p.created_at as string,
      }));
      
      setPackages(transformedPackages);
      setPagination({
        page: response.data.pagination.page,
        totalPages: response.data.pagination.total_pages,
        total: response.data.pagination.total,
      });
    } catch (error) {
      console.error('Failed to load packages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPackages(1);
  }, [filter, searchQuery]);

  return (
    <DashboardLayout>
      <Header 
        title="Package Management" 
        subtitle="View all treatment packages on the platform"
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
                  placeholder="Search packages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <div className="flex bg-slate-800/50 rounded-xl p-1">
                  {(['all', 'active', 'inactive'] as FilterType[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        filter === f
                          ? 'bg-emerald-500 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Inactive'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>Showing {packages.length} of {pagination.total} packages</span>
        </div>

        {/* Package Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent>
                  <div className="h-6 w-3/4 bg-slate-800 rounded mb-3" />
                  <div className="h-4 w-1/2 bg-slate-800 rounded mb-4" />
                  <div className="h-20 bg-slate-800 rounded mb-4" />
                  <div className="flex justify-between">
                    <div className="h-6 w-24 bg-slate-800 rounded" />
                    <div className="h-6 w-20 bg-slate-800 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : packages.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No packages found</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            packages.map((pkg) => (
              <Card key={pkg.id} className="hover:border-slate-700 transition-colors">
                <CardContent>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {pkg.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {PACKAGE_CATEGORIES[pkg.category] || pkg.category}
                      </p>
                    </div>
                    {pkg.isActive ? (
                      <Badge variant="success">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="error">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                    {pkg.description}
                  </p>

                  {/* Provider */}
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                    <Building2 className="h-4 w-4" />
                    <span className="truncate">
                      {pkg.providerName || 'Unknown Provider'}
                      {pkg.providerCity && ` • ${pkg.providerCity}`}
                    </span>
                  </div>

                  {/* Price & Duration */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <DollarSign className="h-5 w-5" />
                      <span className="text-lg font-bold">
                        {formatCurrency(pkg.price, pkg.currency)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{pkg.duration}</span>
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
                onClick={() => loadPackages(pagination.page - 1)}
                disabled={pagination.page === 1}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadPackages(pagination.page + 1)}
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



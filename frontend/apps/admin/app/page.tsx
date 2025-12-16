'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  Building2, 
  Package, 
  CalendarCheck,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Header } from '@/components/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { getAdminStats, getUserStats } from '@/lib/services/admin';
import type { AdminStats, UserStats } from '@/types';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [adminStatsData, userStatsData] = await Promise.all([
          getAdminStats(),
          getUserStats(),
        ]);
        setStats(adminStatsData);
        setUserStats(userStatsData);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <DashboardLayout>
      <Header 
        title="Dashboard" 
        subtitle="Welcome back! Here's what's happening with your platform."
      />
      
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-white">
                    {isLoading ? '...' : stats?.users.total.toLocaleString()}
                  </p>
                  {userStats && (
                    <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3" />
                      +{userStats.newThisWeek} this week
                    </p>
                  )}
                </div>
                <div className="h-12 w-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Providers */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Active Providers</p>
                  <p className="text-3xl font-bold text-white">
                    {isLoading ? '...' : stats?.providers.active}
                  </p>
                  <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {stats?.providers.pending || 0} pending verification
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-violet-500/20 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-violet-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Packages */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Active Packages</p>
                  <p className="text-3xl font-bold text-white">
                    {isLoading ? '...' : stats?.packages.active}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    {stats?.packages.total || 0} total packages
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                  <Package className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-white">
                    {isLoading ? '...' : formatCurrency(stats?.revenue.total || 0)}
                  </p>
                  <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    From completed bookings
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Stats */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-emerald-400" />
                Booking Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="text-xs text-slate-500">Pending</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {stats?.bookings.pending || 0}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-slate-500">Completed</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {stats?.bookings.completed || 0}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-blue-400" />
                    <span className="text-xs text-slate-500">Total</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {stats?.bookings.total || 0}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-violet-400" />
                    <span className="text-xs text-slate-500">Conversion</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {stats?.bookings.total 
                      ? Math.round((stats.bookings.completed / stats.bookings.total) * 100) 
                      : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                User Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Patients</span>
                    <span className="text-sm font-medium text-white">
                      {userStats?.byRole.patient || stats?.users.patients || 0}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-500"
                      style={{ 
                        width: `${stats?.users.total 
                          ? ((stats.users.patients / stats.users.total) * 100) 
                          : 0}%` 
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Providers</span>
                    <span className="text-sm font-medium text-white">
                      {userStats?.byRole.provider || stats?.users.providers || 0}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                      style={{ 
                        width: `${stats?.users.total 
                          ? ((stats.users.providers / stats.users.total) * 100) 
                          : 0}%` 
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Admins</span>
                    <span className="text-sm font-medium text-white">
                      {userStats?.byRole.admin || stats?.users.admins || 0}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500"
                      style={{ 
                        width: `${stats?.users.total 
                          ? ((stats.users.admins / stats.users.total) * 100) 
                          : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Provider Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                Verified Providers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative h-32 w-32">
                  <svg className="h-32 w-32 -rotate-90" viewBox="0 0 36 36">
                    <circle
                      className="text-slate-800"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="transparent"
                      r="16"
                      cx="18"
                      cy="18"
                    />
                    <circle
                      className="text-emerald-500"
                      strokeWidth="3"
                      strokeDasharray={`${
                        stats?.providers.total 
                          ? (stats.providers.verified / stats.providers.total) * 100 
                          : 0
                      }, 100`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="16"
                      cx="18"
                      cy="18"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {stats?.providers.total 
                        ? Math.round((stats.providers.verified / stats.providers.total) * 100) 
                        : 0}%
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span className="text-sm text-slate-400">Verified:</span>
                    <span className="text-sm font-medium text-white">
                      {stats?.providers.verified || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <span className="text-sm text-slate-400">Pending:</span>
                    <span className="text-sm font-medium text-white">
                      {stats?.providers.pending || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-slate-600" />
                    <span className="text-sm text-slate-400">Total:</span>
                    <span className="text-sm font-medium text-white">
                      {stats?.providers.total || 0}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-400" />
                Pending Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <a 
                  href="/providers?filter=pending"
                  className="flex items-center justify-between p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-amber-400" />
                    <div>
                      <p className="text-sm font-medium text-white">
                        Provider Verifications
                      </p>
                      <p className="text-xs text-slate-500">
                        {stats?.providers.pending || 0} providers waiting for review
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </a>
                <a 
                  href="/bookings?status=pending"
                  className="flex items-center justify-between p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <CalendarCheck className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-white">
                        Pending Bookings
                      </p>
                      <p className="text-xs text-slate-500">
                        {stats?.bookings.pending || 0} bookings need attention
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

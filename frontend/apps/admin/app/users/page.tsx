'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  Filter,
  Shield,
  Building2,
  User
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Header } from '@/components/Header';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { getUsers, updateUser, deleteUser } from '@/lib/services/admin';
import type { User as UserType, UserRole, PaginatedResponse } from '@/types';
import { formatDate } from '@/lib/utils';
import { USER_ROLE_LABELS, USER_ROLE_COLORS } from '@/types';

type FilterType = 'all' | 'patient' | 'provider' | 'admin';

export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const loadUsers = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await getUsers({
        page,
        limit: 10,
        role: filter !== 'all' ? filter : undefined,
        search: searchQuery || undefined,
      });
      
      setUsers(response.data);
      setPagination({
        page: response.pagination.page,
        totalPages: response.pagination.totalPages,
        total: response.pagination.total,
      });
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1);
  }, [filter, searchQuery]);

  const handleToggleStatus = async (user: UserType) => {
    setActionLoading(user.id);
    try {
      await updateUser(user.id, { isActive: !user.isActive });
      loadUsers(pagination.page);
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setActionLoading(null);
      setOpenMenu(null);
    }
  };

  const handleDelete = async (user: UserType) => {
    if (!confirm(`Are you sure you want to deactivate ${user.fullName}?`)) return;
    
    setActionLoading(user.id);
    try {
      await deleteUser(user.id);
      loadUsers(pagination.page);
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setActionLoading(null);
      setOpenMenu(null);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'provider':
        return <Building2 className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout>
      <Header 
        title="User Management" 
        subtitle="Manage platform users and their access"
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
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <div className="flex bg-slate-800/50 rounded-xl p-1">
                  {(['all', 'patient', 'provider', 'admin'] as FilterType[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        filter === f
                          ? 'bg-emerald-500 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {f === 'all' ? 'All' : USER_ROLE_LABELS[f as UserRole]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>Showing {users.length} of {pagination.total} users</span>
        </div>

        {/* User Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-800" />
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-slate-800 rounded" />
                            <div className="h-3 w-24 bg-slate-800 rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-800 rounded-full" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-800 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-800 rounded-full" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-800 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-8 w-8 bg-slate-800 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No users found</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-semibold">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{user.fullName}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${USER_ROLE_COLORS[user.role]}`}>
                          {getRoleIcon(user.role)}
                          {USER_ROLE_LABELS[user.role]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-slate-300 flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-slate-500" />
                            {user.email}
                          </p>
                          {user.phone && (
                            <p className="text-sm text-slate-400 flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-slate-500" />
                              {user.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="error">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-400 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(user.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                          
                          {openMenu === user.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-10 py-1">
                              <button
                                onClick={() => handleToggleStatus(user)}
                                disabled={actionLoading === user.id}
                                className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                              >
                                {user.isActive ? (
                                  <>
                                    <UserX className="h-4 w-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-4 w-4" />
                                    Activate
                                  </>
                                )}
                              </button>
                              {user.role !== 'admin' && (
                                <button
                                  onClick={() => handleDelete(user)}
                                  disabled={actionLoading === user.id}
                                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                >
                                  <UserX className="h-4 w-4" />
                                  Delete User
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

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
                onClick={() => loadUsers(pagination.page - 1)}
                disabled={pagination.page === 1}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadUsers(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {openMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setOpenMenu(null)}
        />
      )}
    </DashboardLayout>
  );
}



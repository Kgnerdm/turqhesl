'use client';

import { Settings, User, Bell, Shield, Database } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Header } from '@/components/Header';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <Header 
        title="Settings" 
        subtitle="Manage your admin account and preferences"
      />
      
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-400" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">First Name</label>
                    <p className="text-white font-medium">{user?.firstName}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">Last Name</label>
                    <p className="text-white font-medium">{user?.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">Email</label>
                    <p className="text-white font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">Role</label>
                    <p className="text-white font-medium capitalize">{user?.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-400" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                <div>
                  <p className="text-white font-medium">Change Password</p>
                  <p className="text-sm text-slate-500">Update your password regularly for security</p>
                </div>
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                <div>
                  <p className="text-white font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-slate-500">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-emerald-400" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                <div>
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-sm text-slate-500">Receive updates via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                <div>
                  <p className="text-white font-medium">New Booking Alerts</p>
                  <p className="text-sm text-slate-500">Get notified about new bookings</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                <div>
                  <p className="text-white font-medium">Provider Verification Requests</p>
                  <p className="text-sm text-slate-500">Alert when new providers need verification</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-emerald-400" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-xl">
                <p className="text-sm text-slate-500">Version</p>
                <p className="text-white font-medium">1.0.0</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-xl">
                <p className="text-sm text-slate-500">Environment</p>
                <p className="text-white font-medium">Development</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-xl">
                <p className="text-sm text-slate-500">API Status</p>
                <p className="text-emerald-400 font-medium">Connected</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-xl">
                <p className="text-sm text-slate-500">Last Updated</p>
                <p className="text-white font-medium">Dec 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}



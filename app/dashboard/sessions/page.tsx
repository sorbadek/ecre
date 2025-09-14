"use client"

import SessionDashboard from '@/components/sessions/session-dashboard';

export default function SessionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto p-6">
        <SessionDashboard />
      </div>
    </div>
  );
}

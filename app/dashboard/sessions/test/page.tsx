"use client"

import SessionTestUtils from '@/components/sessions/session-test-utils';

export default function SessionTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-700 to-cyan-600 bg-clip-text text-transparent">
            Session Management Testing
          </h1>
          <p className="text-sky-600/70 mt-1">
            Comprehensive testing suite for the session workflow
          </p>
        </div>
        
        <SessionTestUtils
          onTestComplete={(results: any) => {
            console.log('Test results:', results);
          }}
        />
      </div>
    </div>
  );
}

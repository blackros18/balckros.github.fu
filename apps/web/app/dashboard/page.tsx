'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, AuthUser } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    auth.me().then(setUser).catch(() => router.push('/auth'));
  }, [router]);

  async function handleLogout() {
    await auth.logout().catch(() => {});
    router.push('/auth');
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="mi text-4xl text-fk-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-n50">
      <header className="bg-white border-b border-n200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-fk-primary flex items-center justify-center">
            <span className="mi text-white text-lg">favorite</span>
          </div>
          <span className="font-bold text-fk-primary text-lg">FosterKonnect</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-n600">{user.displayName} &middot; <span className="capitalize">{user.role}</span></span>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-n500 hover:text-fk-danger transition px-3 py-1.5 rounded-lg hover:bg-red-50">
            <span className="mi text-base">logout</span>Sign out
          </button>
        </div>
      </header>
      <main className="p-8 max-w-4xl mx-auto">
        <div className="rounded-2xl bg-white border border-n200 p-8 text-center">
          <span className="mi text-5xl text-fk-primary">dashboard</span>
          <h1 className="text-2xl font-bold text-n900 mt-4">Dashboard</h1>
          <p className="text-n500 mt-2">Welcome, <strong>{user.displayName}</strong>!</p>
          <p className="text-sm text-n400 mt-1">Authenticated as <code className="font-mono bg-n100 px-1 rounded">{user.email}</code></p>
        </div>
      </main>
    </div>
  );
}

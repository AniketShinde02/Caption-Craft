import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminThemeProvider from '@/components/admin/AdminThemeProvider';
import AdminHeader from '@/components/admin/AdminHeader';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  console.log('🔐 Admin layout - Session check:', { 
    hasSession: !!session, 
    userId: session?.user?.id, 
    userRole: session?.user?.role,
    userEmail: session?.user?.email 
  });
  
  // If no session, redirect to setup page
  if (!session) {
    console.log('❌ Admin layout - No session, redirecting to setup');
    redirect('/setup');
  }
  
  // Check if user has admin role
  if (session.user?.role?.name !== 'admin') {
    console.log('❌ Admin layout - User is not admin, redirecting to unauthorized page. Role:', session.user?.role);
    // Redirect non-admin users to unauthorized page for security logging
    redirect('/unauthorized');
  }

  console.log('✅ Admin layout - User is admin, rendering admin interface');

  return (
    <AdminThemeProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar - Mobile First */}
        <div className="w-0 lg:w-64 flex-shrink-0">
          <AdminSidebar />
        </div>
        
        {/* Main content area - Mobile First */}
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader user={session.user} />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6">
            <div className="max-w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminThemeProvider>
  );
}

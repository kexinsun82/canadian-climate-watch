import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user?.publicMetadata?.roles?.includes('admin')) {
      router.push('/'); 
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) return null;
  if (!user?.publicMetadata?.roles?.includes('admin')) return null;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Admin</h1>
    </main>
  );
} 
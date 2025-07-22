"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useUser, SignInButton, UserButton } from '@clerk/nextjs';

const getUserRoleFromUser = (user) => {
  if (!user) return 'visitor';

  let roles = user.publicMetadata?.roles;
  if (roles) {
    if (typeof roles === 'string') {
      try {
        const parsed = JSON.parse(roles);
        if (Array.isArray(parsed)) roles = parsed;
        else roles = [roles];
      } catch {
        roles = [roles];
      }
    }
    if (Array.isArray(roles) && roles.includes('admin')) return 'admin';
    if (Array.isArray(roles) && roles.includes('member')) return 'member';
  }

  const role = user.publicMetadata?.role;
  if (role === 'admin') return 'admin';
  if (role === 'member') return 'member';

  return 'visitor';
};

export default function MenuNavigation() {
  const [open, setOpen] = useState(false);
  const { isSignedIn, user, isLoaded } = useUser();
  const [role, setRole] = useState('visitor');
  
  useEffect(() => {
    if (isLoaded && user) {
      console.log('user.publicMetadata:', user?.publicMetadata); 
      const userRole = getUserRoleFromUser(user);
      setRole(userRole);
    }
  }, [isLoaded, user]);

  return (
    <nav className="bg-white w-full px-8 py-6 flex items-center justify-between"  style={{ background: '#FEF8EA' }}>
      <div className="flex items-center gap-2">
        <Image src="/logo.png" alt="logo" width={40} height={40} />
        <span className="font-medium text-lg" style={{ fontFamily: 'Rethink Sans, sans-serif' }}>ClimaTrack Canada</span>
      </div>
      <div className="hidden lg:flex gap-8 items-center">
        <Link href="/" className="hover:underline decoration-[--color-accent] decoration-3 underline-offset-8">Home</Link>
        <Link href="/discussion" className="hover:underline decoration-[--color-accent] decoration-3 underline-offset-8">Discussion</Link>
        {isSignedIn && (
          <Link href="/profile" className="hover:underline decoration-[--color-accent] decoration-3 underline-offset-8">My Report</Link>
        )}
        {role === 'admin' && (
          <Link href="/admin" className="hover:underline decoration-[--color-accent] decoration-3 underline-offset-8">Admin</Link>
        )}
        {!isLoaded ? null : isSignedIn ? (
          <div className="flex items-center gap-2">
            <UserButton showName={true} />
          </div>
        ) : (
          <SignInButton>
            <button className="hover:underline decoration-[--color-accent] decoration-3 underline-offset-8">Login</button>
          </SignInButton>
        )}
      </div>
      <div className="lg:hidden flex items-center">
        <button onClick={() => setOpen(!open)} aria-label="menu">
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="absolute top-14 right-4 bg-white shadow-lg rounded-lg flex flex-col gap-4 p-4 z-50 lg:hidden">
          <Link href="/" onClick={() => setOpen(false)} className="hover:underline decoration-[--color-accent] decoration-3 underline-offset-8">Home</Link>
          <Link href="/discussion" onClick={() => setOpen(false)} className="hover:underline decoration-[--color-accent] decoration-3 underline-offset-8">Discussion</Link>
          {isSignedIn && (
            <Link href="/profile" onClick={() => setOpen(false)} className="hover:underline decoration-[--color-accent] decoration-3 underline-offset-8">My Report</Link>
          )}
          {role === 'admin' && (
            <Link href="/admin" onClick={() => setOpen(false)} className="hover:underline decoration-[--color-accent] decoration-3 underline-offset-8">Admin</Link>
          )}
          {!isLoaded ? null : isSignedIn ? (
            <div className="flex items-center gap-2">
              <UserButton showName={true} />
            </div>
          ) : (
            <SignInButton>
              <button className="hover:underline decoration-[--color-accent] decoration-3 underline-offset-8">Login</button>
            </SignInButton>
          )}
        </div>
      )}
    </nav>
  );
} 
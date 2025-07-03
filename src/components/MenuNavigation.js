"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useUser, SignInButton, UserButton } from '@clerk/nextjs';

export default function MenuNavigation() {
  const [open, setOpen] = useState(false);
  const { isSignedIn, user, isLoaded } = useUser();

  return (
    <nav className="bg-white w-full border-b border-gray-100 px-4 py-2 flex items-center justify-between"  style={{ background: '#FEF8EA' }}>
      <div className="flex items-center gap-2 mt-6 ml-6">
        <Image src="/logo.png" alt="logo" width={40} height={40} />
        <span className="font-medium text-lg" style={{ fontFamily: 'Rethink Sans, sans-serif' }}>ClimaTrack Canada</span>
      </div>
      <div className="hidden lg:flex gap-8 items-center mr-6">
        <Link href="/" className="hover:underline">Home</Link>
        <Link href="/discussion" className="hover:underline">Discussion</Link>
        {!isLoaded ? null : isSignedIn ? (
          <div className="flex items-center gap-2">
            <UserButton showName={true} />
          </div>
        ) : (
          <SignInButton>
            <button className="hover:underline">Login</button>
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
          <Link href="/" onClick={() => setOpen(false)} className="hover:underline">Home</Link>
          <Link href="/discussion" onClick={() => setOpen(false)} className="hover:underline">Discussion</Link>
          {!isLoaded ? null : isSignedIn ? (
            <div className="flex items-center gap-2">
              <UserButton showName={true} />
            </div>
          ) : (
            <SignInButton>
              <button className="hover:underline">Login</button>
            </SignInButton>
          )}
        </div>
      )}
    </nav>
  );
} 
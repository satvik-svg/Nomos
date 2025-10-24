'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import CreatorBadge from '@/components/creator/CreatorBadge';

export default function Sidebar() {
  const { isCreator, isConnected, user } = useWallet();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const NavItem = ({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) => (
    <Link
      href={href}
      className={`flex items-center justify-center lg:justify-start gap-5 px-4 py-3 rounded-full text-xl transition-all ${
        active 
          ? 'font-bold' 
          : 'font-normal hover:bg-gray-100 dark:hover:bg-gray-900'
      }`}
    >
      <div className={active ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}>
        {icon}
      </div>
      <span className={`hidden lg:inline ${active ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
        {label}
      </span>
    </Link>
  );

  return (
    <aside className="hidden md:flex md:w-[88px] lg:w-[275px] flex-col h-screen sticky top-0 border-r border-gray-200 dark:border-gray-800 px-2">
      {/* Logo */}
      <div className="flex items-center justify-start p-3 mb-1">
        <Link href="/" className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors group">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1d9bf0] to-[#0d7ec7] flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <span className="hidden lg:block text-xl font-bold text-gray-900 dark:text-white group-hover:text-[#1d9bf0] transition-colors">
              Nomos
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <NavItem 
          href="/" 
          icon={<svg className="w-7 h-7" fill={isActive('/') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={isActive('/') ? 0 : 2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>}
          label="Home"
          active={isActive('/')}
        />
        
        <NavItem 
          href="/explore" 
          icon={<svg className="w-7 h-7" fill={isActive('/explore') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={isActive('/explore') ? 0 : 2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>}
          label="Explore"
          active={isActive('/explore')}
        />
        
        <NavItem 
          href="/search" 
          icon={<svg className="w-7 h-7" fill={isActive('/search') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={isActive('/search') ? 0 : 2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>}
          label="Search"
          active={isActive('/search')}
        />
        
        <NavItem 
          href="/creators" 
          icon={<svg className="w-7 h-7" fill={isActive('/creators') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={isActive('/creators') ? 0 : 2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>}
          label="Creators"
          active={isActive('/creators')}
        />
        
        {isConnected && (
          <>
            <NavItem 
              href="/settings" 
              icon={<svg className="w-7 h-7" fill={isActive('/settings') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={isActive('/settings') ? 0 : 2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>}
              label="Settings"
              active={isActive('/settings')}
            />
          </>
        )}

        {isCreator && (
          <>
            <NavItem 
              href="/creator/settings" 
              icon={<svg className="w-7 h-7" fill={isActive('/creator/settings') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={isActive('/creator/settings') ? 0 : 2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>}
              label="Creator Hub"
              active={isActive('/creator/settings')}
            />
          </>
        )}
      </nav>

      {/* Tweet Button */}
      {isConnected && (
        <div className="mb-4 px-2">
          <Link 
            href="/create"
            className="flex items-center justify-center w-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold text-[17px] rounded-full py-3 transition-colors"
          >
            <span className="hidden lg:inline">Post</span>
            <svg className="w-6 h-6 lg:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
      )}

      {/* User Profile */}
      {isConnected && user && (
        <div className="mb-4 px-2">
          <button className="flex items-center justify-center lg:justify-start gap-3 w-full p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
              {user.display_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden lg:block flex-1 text-left overflow-hidden">
              <div className="font-bold text-sm text-gray-900 dark:text-white truncate flex items-center gap-1">
                {user.display_name || 'User'}
                {isCreator && <CreatorBadge size="sm" showIcon={false} />}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user.hedera_account_id}
              </div>
            </div>
            <svg className="hidden lg:block w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </button>
        </div>
      )}
    </aside>
  );
}
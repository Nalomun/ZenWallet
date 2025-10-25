import Link from 'next/link';
import AuthButton from './AuthButton';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-bold text-purple-600">
            💰 ZenWallet
          </Link>
          <Link href="/" className="text-gray-700 hover:text-purple-600 font-medium transition">
            Dashboard
          </Link>
          <Link href="/feed" className="text-gray-700 hover:text-purple-600 font-medium transition">
            Feed
          </Link>
          <Link href="/social" className="text-gray-700 hover:text-purple-600 font-medium transition">
            Friends
          </Link>
        </div>
        <AuthButton />
      </div>
    </nav>
  );
}
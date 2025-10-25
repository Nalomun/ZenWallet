import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-purple-600">
            ZenWallet
          </Link>
          <div className="flex gap-6">
            <Link href="/" className="text-gray-700 hover:text-purple-600 transition">
              Dashboard
            </Link>
            <Link href="/feed" className="text-gray-700 hover:text-purple-600 transition">
              Feed
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
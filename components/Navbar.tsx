import Link from 'next/link';
import AuthButton from './AuthButton';

export default function Navbar() {
  return (
    <nav className="bg-white/80 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent hover:scale-110 transition-transform duration-300">
            💰 ZenWallet
          </Link>
          <div className="flex gap-6">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-purple-600 font-semibold transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-purple-50 flex items-center gap-2"
            >
              <span>📊</span>
              <span>Dashboard</span>
            </Link>
            <Link 
              href="/feed" 
              className="text-gray-700 hover:text-purple-600 font-semibold transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-purple-50 flex items-center gap-2"
            >
              <span>🍽️</span>
              <span>Feed</span>
            </Link>
            <Link 
              href="/transactions" 
              className="text-gray-700 hover:text-purple-600 font-semibold transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-purple-50 flex items-center gap-2"
            >
              <span>💳</span>
              <span>History</span>
            </Link>
            <Link 
              href="/forecast" 
              className="text-gray-700 hover:text-purple-600 font-semibold transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-purple-50 flex items-center gap-2"
            >
              <span>📈</span>
              <span>Forecast</span>
            </Link>
            <Link 
              href="/preferences" 
              className="text-gray-700 hover:text-purple-600 font-semibold transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-purple-50 flex items-center gap-2"
            >
              <span>⚙️</span>
              <span>Preferences</span>
            </Link>
            
          </div>
        </div>
        <AuthButton />
      </div>
    </nav>
  );
}
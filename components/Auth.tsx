import React, { useState } from 'react';
import { LeafIcon } from './Icons';

interface AuthProps {
  onLogin: (name: string, email: string, isNewUser: boolean) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      alert("Mohon lengkapi semua kolom");
      return;
    }
    // Simulate API call
    const displayName = name || email.split('@')[0];
    // Pass !isLogin as the third argument (true if registering/new user)
    onLogin(displayName, email, !isLogin);
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decorations */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-200 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 relative z-10 border border-green-100">
        
        <div className="flex flex-col items-center mb-8">
            <div className="bg-green-100 p-3 rounded-full mb-3">
                <LeafIcon className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-black text-green-800 tracking-tight text-center">
              EcoSort<span className="text-green-500 font-light">AI</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1 text-center">
              {isLogin ? "Selamat datang kembali!" : "Bergabung dengan revolusi hijau"}
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                placeholder="Budi Santoso"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Kata Sandi</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 mt-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-200 hover:shadow-xl transition-all active:scale-[0.98]"
          >
            {isLogin ? "Masuk" : "Daftar Akun"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold text-green-600 hover:text-green-800 transition"
            >
              {isLogin ? "Daftar sekarang" : "Masuk"}
            </button>
          </p>
        </div>
      </div>
      
      <div className="mt-8 text-center opacity-60">
        <p className="text-xs text-gray-500">© 2025 EcoSort AI System</p>
      </div>

    </div>
  );
};
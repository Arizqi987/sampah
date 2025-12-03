import React, { useState, useEffect } from 'react';
import { Scanner } from './components/Scanner';
import { AnalysisView } from './components/AnalysisView';
import { Auth } from './components/Auth';
import { RewardModal } from './components/RewardModal';
import { HomeIcon, CameraIcon, TrophyIcon, LeafIcon, GiftIcon, UserIcon, LogOutIcon } from './components/Icons';
import { analyzeImage } from './services/geminiService';
import { AnalysisResult, HistoryItem, UserStats, ViewState, WasteCategory, Reward, User } from './types';

// Demo data for "Login" scenario (fallback if no local data found)
const DEMO_STATS: UserStats = {
  totalPoints: 1250,
  itemsScanned: 24,
  streakDays: 5,
  level: 3
};

const DEMO_HISTORY: HistoryItem[] = [
  {
    id: '1',
    itemName: 'Kulit Pisang',
    category: WasteCategory.ORGANIC,
    binColor: 'green',
    confidence: 0.98,
    explanation: 'Sisa buah organik yang mudah terurai.',
    tip: 'Bagus untuk kompos!',
    ecoPoints: 20,
    timestamp: Date.now() - 3600000,
    imageUrl: 'https://picsum.photos/200/200?random=1'
  },
  {
    id: '2',
    itemName: 'Botol Plastik',
    category: WasteCategory.RECYCLABLE,
    binColor: 'blue',
    confidence: 0.95,
    explanation: 'Plastik jenis PET yang dapat didaur ulang.',
    tip: 'Remukkan untuk hemat tempat.',
    ecoPoints: 35,
    timestamp: Date.now() - 86400000,
    imageUrl: 'https://picsum.photos/200/200?random=2'
  }
];

// Fresh state for "Register" scenario
const NEW_USER_STATS: UserStats = {
    totalPoints: 0,
    itemsScanned: 0,
    streakDays: 1,
    level: 1
};

const REWARDS: Reward[] = [
    { id: '1', title: 'Kopi Gratis', cost: 500, emoji: '☕', description: 'Satu kopi reguler di Kantin Kampus', image: '' },
    { id: '2', title: 'Diskon Buku 10%', cost: 800, emoji: '📚', description: 'Potongan harga untuk buku teks', image: '' },
    { id: '3', title: 'Tanam Pohon', cost: 2000, emoji: '🌳', description: 'Donasi tanam pohon atas nama Anda', image: '' },
    { id: '4', title: 'Tiket Bus', cost: 300, emoji: '🚌', description: 'Tiket sekali jalan bus kampus', image: '' },
];

export default function App() {
  const [view, setView] = useState<ViewState>('AUTH'); // Start with Auth
  const [user, setUser] = useState<User | null>(null);
  
  // Initialize with empty/default, will be set on Login
  const [stats, setStats] = useState<UserStats>(DEMO_STATS);
  const [history, setHistory] = useState<HistoryItem[]>(DEMO_HISTORY);
  const [redeemed, setRedeemed] = useState<string[]>([]);
  
  // Analysis State
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Reward Modal State
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  // Persistence: Save data whenever it changes
  useEffect(() => {
    if (user?.email) {
      const userData = {
        stats,
        history,
        redeemed
      };
      localStorage.setItem(`ecosort_data_${user.email}`, JSON.stringify(userData));
    }
  }, [stats, history, redeemed, user]);

  // Auth Handlers
  const handleLogin = (name: string, email: string, isNewUser: boolean) => {
    const storageKey = `ecosort_data_${email}`;
    const savedDataString = localStorage.getItem(storageKey);
    
    let loadedStats = DEMO_STATS;
    let loadedHistory = DEMO_HISTORY;
    let loadedRedeemed: string[] = [];

    if (isNewUser) {
        // Case 1: Registering new account -> Force 0 (Fresh Start)
        loadedStats = NEW_USER_STATS;
        loadedHistory = [];
        loadedRedeemed = [];
    } else if (savedDataString) {
        // Case 2: Logging in & Data Exists -> Restore User Progress
        const savedData = JSON.parse(savedDataString);
        loadedStats = savedData.stats || NEW_USER_STATS;
        loadedHistory = savedData.history || [];
        loadedRedeemed = savedData.redeemed || [];
    } else {
        // Case 3: Logging in & No Data -> Use Demo Data (First time login simulation)
        loadedStats = DEMO_STATS;
        loadedHistory = DEMO_HISTORY;
        loadedRedeemed = [];
    }
    
    setUser({ name, email });
    setStats(loadedStats);
    setHistory(loadedHistory);
    setRedeemed(loadedRedeemed);
    
    setView('HOME');
  };

  const handleLogout = () => {
    setUser(null);
    setView('AUTH');
  };

  // Handlers
  const handleCapture = async (image: string) => {
    setCapturedImage(image);
    setIsAnalyzing(true);
    setAnalysisResult(null); // Clear previous result
    
    // Stop scanning view immediately so user knows it's processing
    // Note: In real app, we might keep scanner under overlay, but here we toggle logic
    
    const result = await analyzeImage(image);
    
    setAnalysisResult(result);
    setIsAnalyzing(false);
    
    // Update stats if successful
    if (result.category !== WasteCategory.UNKNOWN) {
        setStats(prev => ({
            ...prev,
            totalPoints: prev.totalPoints + result.ecoPoints,
            itemsScanned: prev.itemsScanned + 1
        }));
        
        const newItem: HistoryItem = {
            ...result,
            id: Date.now().toString(),
            timestamp: Date.now(),
            imageUrl: image
        };
        setHistory(prev => [newItem, ...prev]);
    }
  };

  const closeScanner = () => {
    setView('HOME');
    setCapturedImage(null);
    setAnalysisResult(null);
  };

  const closeAnalysis = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    // If we came from scanner, go back home
    setView('HOME');
  };

  const initiateRedeem = (reward: Reward) => {
    if (redeemed.includes(reward.id)) return;
    if (stats.totalPoints < reward.cost) {
      alert("Poin Anda belum cukup!");
      return;
    }
    setSelectedReward(reward);
  };

  const confirmRedeem = () => {
    if (selectedReward) {
        setStats(prev => ({
            ...prev,
            totalPoints: prev.totalPoints - selectedReward.cost
        }));
        setRedeemed(prev => [...prev, selectedReward.id]);
    }
  };

  const closeRewardModal = () => {
    setSelectedReward(null);
  };

  // Conditional Rendering
  if (view === 'AUTH') {
      return <Auth onLogin={handleLogin} />;
  }

  if (capturedImage || isAnalyzing) {
    return (
      <AnalysisView 
        result={analysisResult || {
          itemName: 'Menganalisis...',
          category: WasteCategory.UNKNOWN,
          binColor: 'gray',
          confidence: 0,
          explanation: '',
          tip: '',
          ecoPoints: 0
        }} 
        image={capturedImage || ''} 
        onClose={closeAnalysis}
        isLoading={isAnalyzing} 
      />
    );
  }

  if (view === 'SCANNER') {
    return <Scanner onCapture={handleCapture} onCancel={closeScanner} />;
  }

  return (
    <div className="min-h-screen pb-20 bg-[#f0fdf4]">
      {/* Header */}
      <div className="bg-white rounded-b-3xl shadow-sm px-6 pt-12 pb-6 sticky top-0 z-10 border-b border-green-50">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">
              Hai, {user?.name.split(' ')[0]}! 👋
            </h1>
            <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                    Smart Bin Terhubung
                </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
            <LeafIcon className="w-4 h-4 text-green-600" />
            <span className="font-bold text-green-800">{stats.totalPoints}</span>
          </div>
        </div>

        {view === 'HOME' && (
             <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-green-200">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-green-100 text-sm font-medium mb-1">Target Komunitas</p>
                        <p className="text-3xl font-black">8,450</p>
                        <p className="text-xs text-green-100 mt-1 opacity-90">kg sampah dipilah bulan ini</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <TrophyIcon className="w-6 h-6 text-white" />
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="mt-4 w-full bg-black/10 rounded-full h-2 overflow-hidden">
                    <div className="bg-white h-full rounded-full w-[75%]"></div>
                </div>
            </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-6 space-y-6">
        
        {view === 'HOME' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-green-50">
                <p className="text-gray-500 text-xs font-bold uppercase">Item Dipindai</p>
                <p className="text-2xl font-black text-gray-800 mt-1">{stats.itemsScanned}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-green-50">
                <p className="text-gray-500 text-xs font-bold uppercase">Streak Harian</p>
                <div className="flex items-center gap-1 mt-1">
                    <span className="text-2xl font-black text-gray-800">{stats.streakDays}</span>
                    <span className="text-sm font-bold text-orange-500">Hari 🔥</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Riwayat Terkini</h3>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">Semua</span>
              </div>
              
              <div className="space-y-3">
                {history.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <p>Belum ada riwayat.</p>
                        <p className="text-xs mt-2">Mulai scan untuk mendapatkan poin!</p>
                    </div>
                ) : (
                    history.map((item) => (
                    <div key={item.id} className="bg-white p-3 rounded-2xl flex items-center gap-3 shadow-sm border border-gray-100">
                        <div className={`w-12 h-12 rounded-xl flex-shrink-0 bg-gray-100 overflow-hidden`}>
                        <img src={item.imageUrl} alt={item.itemName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 truncate capitalize">{item.itemName}</p>
                        <p className="text-xs text-gray-500 capitalize">{item.category}</p>
                        </div>
                        <div className="text-right">
                        <p className="font-bold text-green-600">+{item.ecoPoints}</p>
                        <p className="text-[10px] text-gray-400">{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                    </div>
                    ))
                )}
              </div>
            </div>
          </>
        )}

        {view === 'LEADERBOARD' && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Pahlawan Lingkungan 🏆</h3>
                <div className="space-y-4">
                    {[
                        { name: 'Siti Aminah', points: 2450, rank: 1 },
                        { name: user?.name || 'Anda', points: stats.totalPoints, rank: 2 },
                        { name: 'Budi Santoso', points: 980, rank: 3 },
                        { name: 'Rina Wijaya', points: 850, rank: 4 },
                        { name: 'Ahmad Dani', points: 720, rank: 5 },
                    ].sort((a,b) => b.points - a.points).map((player, index) => (
                        <div key={index} className={`flex items-center gap-4 p-3 rounded-xl ${player.name === (user?.name || 'Anda') ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'}`}>
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-gray-800">{player.name}</p>
                            </div>
                            <div className="font-black text-green-600 text-sm">
                                {player.points} pts
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {view === 'REWARDS' && (
            <div className="grid grid-cols-2 gap-4">
                {REWARDS.map((reward) => (
                    <div key={reward.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between h-48">
                        <div className="flex justify-between items-start">
                            <div className="text-4xl">{reward.emoji}</div>
                            {redeemed.includes(reward.id) && (
                                <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-full uppercase">Ditukar</span>
                            )}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 leading-tight mb-1">{reward.title}</h4>
                            <p className="text-xs text-gray-500 leading-snug line-clamp-2">{reward.description}</p>
                        </div>
                        <button 
                            onClick={() => initiateRedeem(reward)}
                            disabled={redeemed.includes(reward.id) || stats.totalPoints < reward.cost}
                            className={`w-full py-2 rounded-xl text-sm font-bold mt-2 transition-colors ${
                                redeemed.includes(reward.id) 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : stats.totalPoints >= reward.cost
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-gray-100 text-gray-400'
                            }`}
                        >
                            {redeemed.includes(reward.id) ? 'Milik Anda' : `${reward.cost} Poin`}
                        </button>
                    </div>
                ))}
            </div>
        )}

        {view === 'PROFILE' && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserIcon className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
                <p className="text-gray-500 text-sm mb-6">{user?.email}</p>

                <div className="flex justify-center gap-4 mb-8">
                    <div className="text-center p-3 bg-gray-50 rounded-xl min-w-[80px]">
                        <p className="text-xl font-black text-gray-800">{stats.level}</p>
                        <p className="text-xs text-gray-500 uppercase">Level</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl min-w-[80px]">
                        <p className="text-xl font-black text-gray-800">{redeemed.length}</p>
                        <p className="text-xs text-gray-500 uppercase">Hadiah</p>
                    </div>
                </div>

                <button 
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full py-3 text-red-600 bg-red-50 rounded-xl font-bold hover:bg-red-100 transition"
                >
                    <LogOutIcon className="w-5 h-5" />
                    Keluar Akun
                </button>
            </div>
        )}
      </div>

      {/* Reward Modal */}
      {selectedReward && (
          <RewardModal 
            reward={selectedReward} 
            onConfirm={confirmRedeem} 
            onClose={closeRewardModal} 
          />
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-2 pb-6 flex justify-between items-center z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
        <button 
            onClick={() => setView('HOME')}
            className={`flex flex-col items-center gap-1 p-2 ${view === 'HOME' ? 'text-green-600' : 'text-gray-400'}`}
        >
            <HomeIcon className="w-6 h-6" />
            <span className="text-[10px] font-bold">Beranda</span>
        </button>
        
        <button 
            onClick={() => setView('LEADERBOARD')}
            className={`flex flex-col items-center gap-1 p-2 ${view === 'LEADERBOARD' ? 'text-green-600' : 'text-gray-400'}`}
        >
            <TrophyIcon className="w-6 h-6" />
            <span className="text-[10px] font-bold">Peringkat</span>
        </button>

        {/* Scan Button (Floating) */}
        <div className="relative -top-8">
            <button 
                onClick={() => setView('SCANNER')}
                className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-green-300 border-4 border-[#f0fdf4] hover:scale-105 transition-transform"
            >
                <CameraIcon className="w-7 h-7" />
            </button>
        </div>

        <button 
            onClick={() => setView('REWARDS')}
            className={`flex flex-col items-center gap-1 p-2 ${view === 'REWARDS' ? 'text-green-600' : 'text-gray-400'}`}
        >
            <GiftIcon className="w-6 h-6" />
            <span className="text-[10px] font-bold">Hadiah</span>
        </button>

        <button 
            onClick={() => setView('PROFILE')}
            className={`flex flex-col items-center gap-1 p-2 ${view === 'PROFILE' ? 'text-green-600' : 'text-gray-400'}`}
        >
            <UserIcon className="w-6 h-6" />
            <span className="text-[10px] font-bold">Profil</span>
        </button>
      </div>
    </div>
  );
}
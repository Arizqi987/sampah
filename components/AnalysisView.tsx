import React from 'react';
import { AnalysisResult, WasteCategory, BinColor } from '../types';
import { LeafIcon, RefreshIcon } from './Icons';

interface AnalysisViewProps {
  result: AnalysisResult;
  image: string;
  onClose: () => void;
  isLoading: boolean;
}

const getCategoryColor = (category: WasteCategory) => {
  switch (category) {
    case WasteCategory.RECYCLABLE: return 'text-blue-600 bg-blue-100 border-blue-200';
    case WasteCategory.ORGANIC: return 'text-green-600 bg-green-100 border-green-200';
    case WasteCategory.HAZARDOUS: return 'text-red-600 bg-red-100 border-red-200';
    case WasteCategory.RESIDUAL: return 'text-gray-600 bg-gray-100 border-gray-200';
    default: return 'text-yellow-600 bg-yellow-100 border-yellow-200';
  }
};

const getBinColorStyles = (color: BinColor) => {
    switch (color) {
        case 'blue': return { bg: 'bg-blue-600', text: 'text-blue-50', name: 'Tong Biru (Daur Ulang)' };
        case 'green': return { bg: 'bg-green-600', text: 'text-green-50', name: 'Tong Hijau (Organik)' };
        case 'red': return { bg: 'bg-red-600', text: 'text-red-50', name: 'Tong Merah (B3)' };
        case 'gray': return { bg: 'bg-gray-600', text: 'text-gray-50', name: 'Tong Abu (Residu)' };
    }
};

export const AnalysisView: React.FC<AnalysisViewProps> = ({ result, image, onClose, isLoading }) => {
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
        <div className="w-24 h-24 rounded-2xl overflow-hidden mb-8 relative shadow-xl">
           <img src={image} alt="Analyzing" className="w-full h-full object-cover opacity-50" />
           <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
           </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Pemindaian Pintar...</h2>
        <p className="text-gray-500">Menghubungkan ke database server...</p>
        
        <div className="mt-8 flex gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></span>
        </div>
      </div>
    );
  }

  const colorClass = getCategoryColor(result.category);
  const binStyles = getBinColorStyles(result.binColor);

  return (
    <div className="fixed inset-0 bg-gray-50 z-40 overflow-y-auto no-scrollbar pb-24">
      <div className="relative h-64 w-full">
        <img src={image} alt="Analyzed Trash" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 to-transparent"></div>
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 bg-white/80 backdrop-blur p-2 rounded-full shadow-sm"
        >
            <RefreshIcon className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      <div className="px-6 -mt-10 relative">
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
          
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border mb-4 ${colorClass}`}>
            {result.category === WasteCategory.ORGANIC && <LeafIcon className="w-4 h-4" />}
            {result.category.toUpperCase()}
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 capitalize leading-tight">
            {result.itemName}
          </h2>

          <div className="flex items-center gap-4 mb-6">
             <div className="flex items-center justify-center px-4 py-2 rounded-xl bg-green-50 text-green-700 border border-green-100">
                 <p className="text-xs font-bold uppercase tracking-wide mb-0.5">Poin</p>
                 <p className="text-xl font-black">+{result.ecoPoints}</p>
             </div>
             
             {/* Bin Indicator (Hardware Simulation) */}
             <div className={`flex-1 px-4 py-2 rounded-xl border border-gray-100 shadow-inner flex items-center justify-between ${binStyles.bg}`}>
                <div className="text-white">
                     <p className="text-xs font-medium opacity-80 uppercase tracking-wide">Membuka Tong</p>
                     <p className="text-sm font-bold">{binStyles.name}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                         <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                     </svg>
                </div>
             </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wide">Analisis</h3>
                <p className="text-gray-600 leading-relaxed">{result.explanation}</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h3 className="text-sm font-semibold text-blue-800 mb-1 uppercase tracking-wide">Saran AI</h3>
                <p className="text-blue-700 leading-relaxed">{result.tip}</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full mt-6 py-4 bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-200 hover:bg-green-700 transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Buang & Terima Poin
          </button>

        </div>
      </div>
    </div>
  );
};
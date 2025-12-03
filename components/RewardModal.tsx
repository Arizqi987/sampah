import React, { useState } from 'react';
import { Reward } from '../types';
import { CheckCircleIcon, XIcon, GiftIcon } from './Icons';

interface RewardModalProps {
  reward: Reward;
  onConfirm: () => void;
  onClose: () => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({ reward, onConfirm, onClose }) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');

  const handleConfirm = () => {
    // Generate random voucher code
    const code = `ECO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    setVoucherCode(code);
    setIsSuccess(true);
    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative shadow-2xl scale-100 transition-all">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
        >
          <XIcon className="w-5 h-5 text-gray-500" />
        </button>

        {!isSuccess ? (
          // Confirmation View
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <span className="text-5xl">{reward.emoji}</span>
            </div>
            
            <h3 className="text-2xl font-black text-gray-800 mb-2">{reward.title}</h3>
            <p className="text-gray-500 mb-6 px-4">
              Apakah Anda yakin ingin menukarkan <span className="font-bold text-green-600">{reward.cost} Poin</span> untuk hadiah ini?
            </p>

            <div className="w-full flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
              >
                Batal
              </button>
              <button 
                onClick={handleConfirm}
                className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition active:scale-95"
              >
                Tukar Poin
              </button>
            </div>
          </div>
        ) : (
          // Success View
          <div className="flex flex-col items-center text-center">
             <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-200 animate-in zoom-in duration-300">
                <CheckCircleIcon className="w-10 h-10 text-white" />
            </div>
            
            <h3 className="text-2xl font-black text-gray-800 mb-2">Berhasil Ditukar!</h3>
            <p className="text-gray-500 mb-6 text-sm">
              Tunjukkan kode voucher ini ke petugas kantin atau layanan kampus.
            </p>

            <div className="bg-gray-100 w-full py-4 rounded-xl border-2 border-dashed border-gray-300 mb-6">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">KODE VOUCHER</p>
                <p className="text-3xl font-mono font-black text-gray-800 tracking-widest select-all">{voucherCode}</p>
            </div>

            <button 
                onClick={onClose}
                className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition active:scale-95"
            >
                Selesai
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
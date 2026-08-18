import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CompanyLogo } from './CompanyLogo';

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
  isExiting?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Chargement en cours... Bienvenue',
  submessage,
  isExiting = false,
}) => {
  const [logoError, setLogoError] = useState(false);
  const [splashError, setSplashError] = useState(false);

  return (
    <motion.div
      id="delice-loading-screen"
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden"
      style={{ backgroundColor: '#FAF6EE' }}
    >
      {/* 1. Top Brand Header */}
      <header className="w-full max-w-lg mx-auto flex items-center justify-center pt-2 sm:pt-4">
        <div className="flex items-center gap-3 sm:gap-4 px-4 py-2 rounded-2xl bg-white/40 border border-[#E2C799]/40 backdrop-blur-xs shadow-xs">
          {!logoError ? (
            <img
              src="/logo.png"
              alt="Délice Logo"
              referrerPolicy="no-referrer"
              onError={() => setLogoError(true)}
              className="w-9 h-9 sm:w-11 sm:h-11 object-contain shrink-0 drop-shadow-xs"
            />
          ) : (
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-b from-amber-700 to-amber-900 p-1.5 flex items-center justify-center shrink-0 shadow-xs">
              <CompanyLogo imgClassName="w-6 h-6 sm:w-7 sm:h-7" alt="Délice Logo" />
            </div>
          )}

          <div className="flex flex-col">
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight leading-none font-serif"
              style={{ color: '#4A2E18', fontFamily: 'Playfair Display, Georgia, Cambria, serif' }}
            >
              Délice
            </h1>
            <span
              className="text-[10px] sm:text-xs tracking-wider uppercase font-medium mt-0.5"
              style={{ color: '#8B5A2B' }}
            >
              Maison de Pâtisserie Fine
            </span>
          </div>
        </div>
      </header>

      {/* 2. Center Illustration Artwork */}
      <main className="flex-1 w-full max-w-md mx-auto flex flex-col items-center justify-center py-4 px-2">
        <div className="relative w-full flex items-center justify-center">
          {!splashError ? (
            <img
              src="/splash_center.png"
              alt="Pâtisserie Délice"
              referrerPolicy="no-referrer"
              onError={() => setSplashError(true)}
              className="max-w-[260px] sm:max-w-[320px] md:max-w-[360px] w-full h-auto max-h-[42vh] object-contain rounded-3xl drop-shadow-xl"
            />
          ) : (
            <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-3xl bg-amber-100/60 border border-[#E2C799] flex flex-col items-center justify-center p-6 text-center shadow-inner">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-amber-600 to-amber-800 p-3 flex items-center justify-center shadow-md mb-3">
                <CompanyLogo imgClassName="w-10 h-10" />
              </div>
              <span className="font-serif text-lg font-bold" style={{ color: '#4A2E18' }}>
                Pâtisserie Délice
              </span>
              <span className="text-xs text-[#8B5A2B] mt-1">
                Laboratoire Central & Réseau Artisanal
              </span>
            </div>
          )}
        </div>
      </main>

      {/* 3. Bottom Loader & Warm Message */}
      <footer className="w-full max-w-md mx-auto flex flex-col items-center justify-center pb-4 sm:pb-8 space-y-3 sm:space-y-4">
        {/* CSS-animated spinning loader ring */}
        <div
          id="delice-spinner-ring"
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 animate-spin shrink-0"
          style={{
            borderColor: '#E2C799',
            borderTopColor: '#8B5A2B',
          }}
          role="status"
          aria-label="Chargement"
        />

        {/* Pulsing Status Message */}
        <div className="text-center px-4 space-y-1">
          <p
            className="text-base sm:text-lg font-medium tracking-wide animate-pulse font-serif"
            style={{ color: '#4A2E18', fontFamily: 'Playfair Display, Georgia, Cambria, serif' }}
          >
            {message}
          </p>
          {submessage && (
            <p className="text-xs sm:text-sm text-[#8B5A2B] font-sans">
              {submessage}
            </p>
          )}
        </div>
      </footer>
    </motion.div>
  );
};

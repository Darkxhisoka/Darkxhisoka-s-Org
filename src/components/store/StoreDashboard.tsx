import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { subscribeToSupabaseRealtime } from '../../services/supabaseService';
import { notifyToast } from '../../services/storage';
import { RequisitionForm } from './RequisitionForm';
import { StoreRequisitionHistory } from './StoreRequisitionHistory';
import { RetailSalesPOS } from './RetailSalesPOS';
import { UnsoldProductsManager } from './UnsoldProductsManager';
import { SalesAnalyticsView } from './SalesAnalyticsView';
import { StoreReconciliation } from './StoreReconciliation';
import { StoreReceivingView } from './StoreReceiving';
import { StorePackaging } from './StorePackaging';
import { ActivityFeed } from '../common/ActivityFeed';
import { QuickActionsFloatingButton } from './QuickActionsFloatingButton';
import { CustomCakePreOrders } from './CustomCakePreOrders';
import { CustomerLoyaltyManager } from './CustomerLoyaltyManager';
import { CashDrawerZReportView } from './CashDrawerZReportView';
import { StoreReturnsManager } from './StoreReturnsManager';
import { getActiveStore } from '../../services/storage';
import { CompanyLogo } from '../common/CompanyLogo';
import { 
  ShoppingCart, 
  PackageX, 
  BarChart3, 
  ShoppingBag, 
  History, 
  Store, 
  ShieldCheck, 
  Calculator, 
  Truck, 
  Package, 
  Activity, 
  Radio,
  LayoutGrid,
  X,
  Sparkles,
  Cake,
  Crown,
  Receipt,
  RotateCcw
} from 'lucide-react';

export const StoreDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    | 'POS_SALES' 
    | 'CUSTOM_CAKES'
    | 'LOYALTY_VIP'
    | 'CASH_Z_REPORT'
    | 'STORE_RETURNS'
    | 'RECEIVING' 
    | 'RECONCILIATION' 
    | 'UNSOLD_LOGS' 
    | 'SALES_ANALYTICS' 
    | 'NEW_REQ' 
    | 'HISTORY' 
    | 'PACKAGING' 
    | 'ACTIVITY_FEED'
  >('POS_SALES');
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState<boolean>(false);
  const activeStore = getActiveStore();
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  useEffect(() => {
    const unsubscribe = subscribeToSupabaseRealtime((table, payload) => {
      setLastSyncTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      let tableLabel = 'Mise à jour en direct';
      if (table === 'store_requisitions') tableLabel = 'Statut Réquisition Modifié';
      if (table === 'raw_materials') tableLabel = 'Mise à jour Stock Labo';
      if (table === 'packaging_materials') tableLabel = 'Stock Emballage Modifié';

      notifyToast({
        type: 'info',
        title: `🔴 Realtime Supabase : ${tableLabel}`,
        message: `Affichage mis à jour automatiquement.`
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleTabSelect = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setIsMoreSheetOpen(false);
  };

  const isMoreActive = ['RECONCILIATION', 'UNSOLD_LOGS', 'SALES_ANALYTICS', 'HISTORY', 'ACTIVITY_FEED'].includes(activeTab);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-8 space-y-4 sm:space-y-6 pb-28 md:pb-8">
      
      {/* Store Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4 sm:p-6 text-white shadow-md border border-slate-700/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-b from-slate-800 to-slate-950 p-2 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/10 border border-amber-500/40">
              <CompanyLogo imgClassName="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black tracking-tight">{activeStore.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Point de Vente
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Radio className="w-3 h-3 text-emerald-400" />
                  <span>Realtime • {lastSyncTime}</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 sm:mt-1">
                {activeStore.address} • Gérant : {activeStore.managerName}
              </p>
            </div>
          </div>

          {/* Desktop Module Tab Navigation (Horizontal Scrollable) */}
          <div className="hidden md:flex bg-slate-950/90 p-1.5 rounded-xl border border-slate-700/90 items-center gap-1 overflow-x-auto scrollbar-none self-start md:self-auto max-w-full">
            <button
              onClick={() => setActiveTab('POS_SALES')}
              className={`flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'POS_SALES'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Caisse / Ventes</span>
            </button>

            <button
              onClick={() => setActiveTab('CUSTOM_CAKES')}
              className={`flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'CUSTOM_CAKES'
                  ? 'bg-pink-600 text-white font-black shadow-md ring-2 ring-pink-400'
                  : 'bg-pink-500/20 text-pink-300 hover:bg-pink-500/30'
              }`}
            >
              <Cake className="w-4 h-4 text-pink-300" />
              <span>🎂 Gâteaux Sur-Mesure</span>
            </button>

            <button
              onClick={() => setActiveTab('LOYALTY_VIP')}
              className={`flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'LOYALTY_VIP'
                  ? 'bg-purple-600 text-white font-black shadow-md ring-2 ring-purple-400'
                  : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
              }`}
            >
              <Crown className="w-4 h-4 text-purple-300" />
              <span>👑 Club VIP & Fidélité</span>
            </button>

            <button
              onClick={() => setActiveTab('CASH_Z_REPORT')}
              className={`flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'CASH_Z_REPORT'
                  ? 'bg-emerald-600 text-white font-black shadow-md ring-2 ring-emerald-400'
                  : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
              }`}
            >
              <Receipt className="w-4 h-4 text-emerald-300" />
              <span>Clôture Caisse (Z)</span>
            </button>

            <button
              onClick={() => setActiveTab('STORE_RETURNS')}
              className={`flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'STORE_RETURNS'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-300'
                  : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
              }`}
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Bons de Retour</span>
            </button>

            <button
              onClick={() => setActiveTab('RECEIVING')}
              className={`flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'RECEIVING'
                  ? 'bg-indigo-600 text-white font-black shadow-md ring-2 ring-indigo-400'
                  : 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
              }`}
            >
              <Truck className="w-4 h-4 text-indigo-300" />
              <span>🚚 Réception Livraisons</span>
            </button>

            <button
              onClick={() => setActiveTab('PACKAGING')}
              className={`flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'PACKAGING'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-300'
                  : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
              }`}
            >
              <Package className="w-4 h-4 text-amber-400" />
              <span>📦 Emballages & Colisage</span>
            </button>

            <button
              onClick={() => setActiveTab('RECONCILIATION')}
              className={`flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'RECONCILIATION'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-300'
                  : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
              }`}
            >
              <Calculator className="w-4 h-4 text-amber-400" />
              <span>⚡ Clôture Stock EOD</span>
            </button>

            <button
              onClick={() => setActiveTab('UNSOLD_LOGS')}
              className={`flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'UNSOLD_LOGS'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <PackageX className="w-4 h-4" />
              <span>Invendus & Casse</span>
            </button>

            <button
              onClick={() => setActiveTab('SALES_ANALYTICS')}
              className={`flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'SALES_ANALYTICS'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytique Ventes</span>
            </button>

            <button
              onClick={() => setActiveTab('NEW_REQ')}
              className={`flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'NEW_REQ'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Demande Approvisionnement</span>
            </button>

            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'HISTORY'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Historique Commandes</span>
            </button>

            <button
              onClick={() => setActiveTab('ACTIVITY_FEED')}
              className={`flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'ACTIVITY_FEED'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md ring-2 ring-amber-300'
                  : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
              }`}
            >
              <Activity className="w-4 h-4 text-amber-400" />
              <span>⚡ Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render Active View with motion transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {activeTab === 'POS_SALES' && <RetailSalesPOS currentStore={activeStore} />}
          {activeTab === 'CUSTOM_CAKES' && <CustomCakePreOrders />}
          {activeTab === 'LOYALTY_VIP' && <CustomerLoyaltyManager />}
          {activeTab === 'CASH_Z_REPORT' && <CashDrawerZReportView />}
          {activeTab === 'STORE_RETURNS' && <StoreReturnsManager />}
          {activeTab === 'RECEIVING' && <StoreReceivingView />}
          {activeTab === 'PACKAGING' && <StorePackaging />}
          {activeTab === 'RECONCILIATION' && <StoreReconciliation currentStore={activeStore} />}
          {activeTab === 'UNSOLD_LOGS' && <UnsoldProductsManager currentStore={activeStore} />}
          {activeTab === 'SALES_ANALYTICS' && <SalesAnalyticsView currentStore={activeStore} />}
          {activeTab === 'NEW_REQ' && <RequisitionForm onSuccess={() => setActiveTab('HISTORY')} />}
          {activeTab === 'HISTORY' && <StoreRequisitionHistory />}
          {activeTab === 'ACTIVITY_FEED' && <ActivityFeed initialInterface="STORE" />}
        </motion.div>
      </AnimatePresence>

      {/* Floating Action Button for fast 1-tap reporting of unsellable products */}
      <QuickActionsFloatingButton
        currentStore={activeStore}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* ANDROID / MOBILE MATERIAL 3 BOTTOM NAVIGATION BAR (< 768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 shadow-2xl px-1.5 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around">
        
        {/* 1. Caisse (POS) */}
        <button
          onClick={() => handleTabSelect('POS_SALES')}
          className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-2xl transition-all active:scale-95 ${
            activeTab === 'POS_SALES'
              ? 'text-amber-400 font-black bg-amber-500/15'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <ShoppingCart className={`w-5 h-5 transition-transform ${activeTab === 'POS_SALES' ? 'scale-110' : ''}`} />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Caisse</span>
        </button>

        {/* 2. Réception Livraisons */}
        <button
          onClick={() => handleTabSelect('RECEIVING')}
          className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-2xl transition-all active:scale-95 ${
            activeTab === 'RECEIVING'
              ? 'text-indigo-400 font-black bg-indigo-500/15'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Truck className={`w-5 h-5 transition-transform ${activeTab === 'RECEIVING' ? 'scale-110' : ''}`} />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Livraisons</span>
        </button>

        {/* 3. Demandes Approvisionnement */}
        <button
          onClick={() => handleTabSelect('NEW_REQ')}
          className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-2xl transition-all active:scale-95 ${
            activeTab === 'NEW_REQ'
              ? 'text-emerald-400 font-black bg-emerald-500/15'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <ShoppingBag className={`w-5 h-5 transition-transform ${activeTab === 'NEW_REQ' ? 'scale-110' : ''}`} />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Demandes</span>
        </button>

        {/* 4. Colisage & Emballages */}
        <button
          onClick={() => handleTabSelect('PACKAGING')}
          className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-2xl transition-all active:scale-95 ${
            activeTab === 'PACKAGING'
              ? 'text-amber-400 font-black bg-amber-500/15'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Package className={`w-5 h-5 transition-transform ${activeTab === 'PACKAGING' ? 'scale-110' : ''}`} />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Colisage</span>
        </button>

        {/* 5. More Hub / Menu */}
        <button
          onClick={() => setIsMoreSheetOpen(true)}
          className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-2xl transition-all active:scale-95 ${
            isMoreActive
              ? 'text-indigo-300 font-black bg-indigo-500/20 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <LayoutGrid className={`w-5 h-5 transition-transform ${isMoreActive ? 'scale-110' : ''}`} />
            {isMoreActive && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-bold">
            {isMoreActive ? 'Actif' : 'Plus...'}
          </span>
        </button>
      </div>

      {/* ANDROID MATERIAL 3 BOTTOM SHEET FOR "PLUS / MODULES" */}
      <AnimatePresence>
        {isMoreSheetOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreSheetOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs"
            />

            {/* Sheet Card */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="relative bg-slate-900 border-t border-slate-700/80 rounded-t-3xl p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] shadow-2xl text-white space-y-4 max-h-[85vh] overflow-y-auto"
            >
              {/* Drag Handle Indicator */}
              <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto" />

              {/* Sheet Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">Modules Point de Vente</h3>
                    <p className="text-[11px] text-slate-400">{activeStore.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMoreSheetOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Grid of Secondary Modules */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleTabSelect('CUSTOM_CAKES')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all active:scale-95 ${
                    activeTab === 'CUSTOM_CAKES'
                      ? 'bg-pink-600 text-white border-pink-400 font-bold'
                      : 'bg-slate-800/80 border-slate-700 text-slate-200'
                  }`}
                >
                  <Cake className="w-5 h-5 text-pink-400" />
                  <div>
                    <div className="text-xs font-extrabold">Gâteaux Sur-Mesure</div>
                    <div className="text-[10px] opacity-75">Commandes événements & labo</div>
                  </div>
                </button>

                <button
                  onClick={() => handleTabSelect('LOYALTY_VIP')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all active:scale-95 ${
                    activeTab === 'LOYALTY_VIP'
                      ? 'bg-purple-600 text-white border-purple-400 font-bold'
                      : 'bg-slate-800/80 border-slate-700 text-slate-200'
                  }`}
                >
                  <Crown className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-xs font-extrabold">Club VIP & Fidélité</div>
                    <div className="text-[10px] opacity-75">Points & profils clients</div>
                  </div>
                </button>

                <button
                  onClick={() => handleTabSelect('CASH_Z_REPORT')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all active:scale-95 ${
                    activeTab === 'CASH_Z_REPORT'
                      ? 'bg-emerald-600 text-white border-emerald-400 font-bold'
                      : 'bg-slate-800/80 border-slate-700 text-slate-200'
                  }`}
                >
                  <Receipt className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-xs font-extrabold">Clôture Caisse (Z)</div>
                    <div className="text-[10px] opacity-75">Comptage espèces & TPE</div>
                  </div>
                </button>

                <button
                  onClick={() => handleTabSelect('STORE_RETURNS')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all active:scale-95 ${
                    activeTab === 'STORE_RETURNS'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                      : 'bg-slate-800/80 border-slate-700 text-slate-200'
                  }`}
                >
                  <RotateCcw className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-xs font-extrabold">Bons de Retour</div>
                    <div className="text-[10px] opacity-75">Invendus & recyclage labo</div>
                  </div>
                </button>

                <button
                  onClick={() => handleTabSelect('RECONCILIATION')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all active:scale-95 ${
                    activeTab === 'RECONCILIATION'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                      : 'bg-slate-800/80 border-slate-700 text-slate-200'
                  }`}
                >
                  <Calculator className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-xs font-extrabold">Clôture Stock EOD</div>
                    <div className="text-[10px] opacity-75">Inventaire de fin de journée</div>
                  </div>
                </button>

                <button
                  onClick={() => handleTabSelect('UNSOLD_LOGS')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all active:scale-95 ${
                    activeTab === 'UNSOLD_LOGS'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                      : 'bg-slate-800/80 border-slate-700 text-slate-200'
                  }`}
                >
                  <PackageX className="w-5 h-5 text-rose-400" />
                  <div>
                    <div className="text-xs font-extrabold">Invendus & Casse</div>
                    <div className="text-[10px] opacity-75">Pertes et déclassements</div>
                  </div>
                </button>

                <button
                  onClick={() => handleTabSelect('SALES_ANALYTICS')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all active:scale-95 ${
                    activeTab === 'SALES_ANALYTICS'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                      : 'bg-slate-800/80 border-slate-700 text-slate-200'
                  }`}
                >
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  <div>
                    <div className="text-xs font-extrabold">Analytique Ventes</div>
                    <div className="text-[10px] opacity-75">CA & meilleures ventes</div>
                  </div>
                </button>

                <button
                  onClick={() => handleTabSelect('HISTORY')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all active:scale-95 ${
                    activeTab === 'HISTORY'
                      ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                      : 'bg-slate-800/80 border-slate-700 text-slate-200'
                  }`}
                >
                  <History className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-xs font-extrabold">Historique Commandes</div>
                    <div className="text-[10px] opacity-75">Bons de réquisition passés</div>
                  </div>
                </button>

                <button
                  onClick={() => handleTabSelect('ACTIVITY_FEED')}
                  className={`col-span-2 p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all active:scale-95 ${
                    activeTab === 'ACTIVITY_FEED'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                      : 'bg-slate-800/80 border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-5 h-5 text-amber-400" />
                    <div>
                      <div className="text-xs font-extrabold">Journal d'Audit & Activités</div>
                      <div className="text-[10px] opacity-75">Traçabilité des opérations de la boutique</div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-black bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                    Live
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};


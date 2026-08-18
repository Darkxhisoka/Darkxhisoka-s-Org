import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { subscribeToSupabaseRealtime } from '../../services/supabaseService';
import { notifyToast } from '../../services/storage';
import { RequisitionManager } from './RequisitionManager';
import { ReceiptForm } from './ReceiptForm';
import { InventoryList } from './InventoryList';
import { ReceiptHistory } from './ReceiptHistory';
import { RecipeCosting } from './RecipeCosting';
import { SupplierManager } from './SupplierManager';
import { StoreManager } from './StoreManager';
import { AnalyticsReporting } from './AnalyticsReporting';
import { ActivityLog } from './ActivityLog';
import { LabSalesOverview } from './LabSalesOverview';
import { ProductionOverview } from './ProductionOverview';
import { ProductionRunner } from './ProductionRunner';
import { WasteLossManager } from './WasteLossManager';
import { LabWasteAnalytics } from './LabWasteAnalytics';
import { MarginDashboard } from './MarginDashboard';
import { DeliveryManifestView } from './DeliveryManifest';
import { SupplierPO } from './SupplierPO';
import { DailyProductionPlan } from './DailyProductionPlan';
import { QualityControl } from './QualityControl';
import { StoreAnalytics } from '../reports/StoreAnalytics';
import { PackagingLab } from './PackagingLab';
import { RawMaterialDestocking } from './RawMaterialDestocking';
import { ExecutiveInventoryDashboard } from './ExecutiveInventoryDashboard';
import { OfflineQueueStatusPill } from './OfflineQueueStatusPill';
import { OfflineQueueDrawer } from './OfflineQueueDrawer';
import { SyncStatusView } from './SyncStatusView';
import { CompanyLogo } from '../common/CompanyLogo';
import { ProductionBatchPlanner } from './ProductionBatchPlanner';
import { ColdRoomExpiryTracker } from './ColdRoomExpiryTracker';
import { PriceInflationSimulator } from './PriceInflationSimulator';
import { StoreReturnsManager } from '../store/StoreReturnsManager';
import { ExportReportingCenter } from '../reports/ExportReportingCenter';
import { ChefVoiceNotesManager } from './ChefVoiceNotesManager';
import {
  FlaskConical,
  Receipt,
  Boxes,
  FileText,
  ChefHat,
  Building,
  Store,
  BarChart3,
  History,
  ShoppingCart,
  Factory,
  Zap,
  AlertTriangle,
  PieChart,
  TrendingUp,
  Truck,
  Utensils,
  ShieldCheck,
  ClipboardCheck,
  ListTodo,
  Sparkles,
  Package,
  Trash2,
  Radio,
  Crown,
  LayoutGrid,
  Search,
  HardDrive,
  Activity,
  Snowflake,
  Calculator,
  RotateCcw,
  FileSpreadsheet,
  Mic,
  X
} from 'lucide-react';

type LabModule = 
  | 'EXECUTIVE_DASHBOARD'
  | 'VOICE_NOTES'
  | 'MARGIN_ANALYTICS' 
  | 'DELIVERY_LOGISTICS' 
  | 'PACKAGING'
  | 'DESTOCKING'
  | 'DAILY_PRODUCTION_PLAN'
  | 'PRODUCTION_BATCH_PLANNER'
  | 'COLD_ROOM_TRACKER'
  | 'PRICE_INFLATION'
  | 'STORE_RETURNS'
  | 'EXPORT_REPORTS'
  | 'SUPPLIER_PO'
  | 'QUALITY_CONTROL'
  | 'MULTI_STORE_ANALYTICS'
  | 'REQUISITIONS' 
  | 'PRODUCTION_RUNNER' 
  | 'PRODUCTION_OVERVIEW' 
  | 'WASTE_LOSS' 
  | 'RECONCILIATION_WASTE' 
  | 'NEW_RECEIPT' 
  | 'INVENTORY' 
  | 'RECIPES' 
  | 'RECEIPT_HISTORY' 
  | 'SUPPLIERS' 
  | 'STORES' 
  | 'STORE_SALES' 
  | 'ANALYTICS' 
  | 'SYNC_STATUS'
  | 'OFFLINE_QUEUE'
  | 'ACTIVITY_LOG';

interface ModuleCategory {
  title: string;
  icon: any;
  items: { id: LabModule; label: string; desc: string; icon: any; color: string }[];
}

const LAB_CATEGORIES: ModuleCategory[] = [
  {
    title: '👑 Direction & Pilotage',
    icon: Crown,
    items: [
      { id: 'EXECUTIVE_DASHBOARD', label: 'Executive Dashboard (Lab Central)', desc: 'KPIs globaux, stocks & alertes', icon: Crown, color: 'text-amber-400 bg-amber-400/20' },
      { id: 'MARGIN_ANALYTICS', label: 'Marges & Profitabilité', desc: 'Marges réelles et rentabilité', icon: TrendingUp, color: 'text-emerald-400 bg-emerald-400/20' },
      { id: 'PRICE_INFLATION', label: 'Simulateur Inflation Matières', desc: 'Modélisation des coûts & marges', icon: Calculator, color: 'text-amber-400 bg-amber-400/20' },
      { id: 'EXPORT_REPORTS', label: 'Exportations & Rapports Exécutifs', desc: 'Fichiers CSV / Bilan comptable', icon: FileSpreadsheet, color: 'text-emerald-400 bg-emerald-400/20' },
      { id: 'MULTI_STORE_ANALYTICS', label: 'Multi-Boutiques & Gaspillage', desc: 'Performances des 6 points de vente', icon: BarChart3, color: 'text-indigo-400 bg-indigo-400/20' },
      { id: 'ANALYTICS', label: 'Analytiques & Tendances', desc: 'Statistiques avancées', icon: PieChart, color: 'text-amber-400 bg-amber-400/20' }
    ]
  },
  {
    title: '👨‍🍳 Production & Pâtisserie',
    icon: Utensils,
    items: [
      { id: 'VOICE_NOTES', label: 'Dictée Vocale & Notes Chefs', desc: 'Enregistrement mains-libres & modifications recettes', icon: Mic, color: 'text-amber-400 bg-amber-400/20' },
      { id: 'PRODUCTION_BATCH_PLANNER', label: 'Planification IA & Fournées', desc: 'Ordonnancement et calcul des batchs', icon: Sparkles, color: 'text-amber-400 bg-amber-400/20' },
      { id: 'DAILY_PRODUCTION_PLAN', label: 'Task List Pâtissiers', desc: 'Planning du jour et fiches postes', icon: Utensils, color: 'text-amber-400 bg-amber-400/20' },
      { id: 'PRODUCTION_RUNNER', label: 'Lancer Production (Cascade NOM)', desc: 'Déstockage automatique et sous-lots', icon: Zap, color: 'text-amber-400 bg-amber-400/20' },
      { id: 'RECIPES', label: 'Fiches Techniques & COGS', desc: 'Formules et calcul des coûts', icon: ChefHat, color: 'text-indigo-400 bg-indigo-400/20' },
      { id: 'PRODUCTION_OVERVIEW', label: 'Aperçu Production', desc: 'Lots en cours et historiques', icon: Factory, color: 'text-indigo-400 bg-indigo-400/20' },
      { id: 'WASTE_LOSS', label: 'Registre Pertes & Casse', desc: 'Déclaration des pertes labo', icon: AlertTriangle, color: 'text-rose-400 bg-rose-400/20' }
    ]
  },
  {
    title: '📦 Stocks, Achats & Fournisseurs',
    icon: Boxes,
    items: [
      { id: 'COLD_ROOM_TRACKER', label: 'Surveillance DLC & Chambres Froides', desc: 'Chaîne du froid et déstockage FIFO', icon: Snowflake, color: 'text-cyan-400 bg-cyan-400/20' },
      { id: 'SUPPLIER_PO', label: 'Commandes Fournisseurs (PO)', desc: 'Bons de commande automatisés', icon: ShoppingCart, color: 'text-indigo-400 bg-indigo-400/20' },
      { id: 'NEW_RECEIPT', label: 'Réception Matières Premières', desc: 'Scanner et contrôle des arrivages', icon: Receipt, color: 'text-amber-400 bg-amber-400/20' },
      { id: 'INVENTORY', label: 'Stock Matières Premières', desc: 'Niveaux et valorisation en direct', icon: Boxes, color: 'text-indigo-400 bg-indigo-400/20' },
      { id: 'PACKAGING', label: 'Packaging & Emballage', desc: 'Cartons, rubans et boîtes', icon: Package, color: 'text-amber-400 bg-amber-400/20' },
      { id: 'DESTOCKING', label: 'Déstockage MP & Ajustements', desc: 'Ajustements manuels d’inventaire', icon: Trash2, color: 'text-rose-400 bg-rose-400/20' },
      { id: 'RECEIPT_HISTORY', label: 'Historique des Achats', desc: 'Journal des réceptions et factures', icon: FileText, color: 'text-indigo-400 bg-indigo-400/20' },
      { id: 'SUPPLIERS', label: 'Répertoire Fournisseurs', desc: 'Contacts et conditions tarifaires', icon: Building, color: 'text-indigo-400 bg-indigo-400/20' }
    ]
  },
  {
    title: '🚚 Logistique & Commandes Boutiques',
    icon: Truck,
    items: [
      { id: 'REQUISITIONS', label: 'Commandes des Boutiques', desc: 'Validation et expédition des demandes', icon: FlaskConical, color: 'text-indigo-400 bg-indigo-400/20' },
      { id: 'STORE_RETURNS', label: 'Bons de Retour & Valorisation', desc: 'Rapatriement des invendus et recyclage', icon: RotateCcw, color: 'text-amber-400 bg-amber-400/20' },
      { id: 'DELIVERY_LOGISTICS', label: 'Expéditions & Bordereaux', desc: 'Manifestes de livraison camions', icon: Truck, color: 'text-indigo-400 bg-indigo-400/20' },
      { id: 'STORES', label: 'Points de Vente', desc: 'Configuration des 6 boutiques', icon: Store, color: 'text-indigo-400 bg-indigo-400/20' },
      { id: 'STORE_SALES', label: 'Aperçu Ventes & Invendus', desc: 'Remontées POS et invendus', icon: ShoppingCart, color: 'text-amber-400 bg-amber-400/20' },
      { id: 'RECONCILIATION_WASTE', label: 'Analyse Invendus Boutiques', desc: 'Rapprochement et pertes magasins', icon: PieChart, color: 'text-amber-400 bg-amber-400/20' }
    ]
  },
  {
    title: '🛡️ Qualité & Traçabilité',
    icon: ShieldCheck,
    items: [
      { id: 'QUALITY_CONTROL', label: 'Contrôle Qualité & HACCP', desc: 'Traçabilité et relevés température', icon: ShieldCheck, color: 'text-indigo-400 bg-indigo-400/20' },
      { id: 'SYNC_STATUS', label: 'État de Synchronisation & Firebase', desc: 'Changements locaux, file IndexedDB & intégrité', icon: Activity, color: 'text-amber-400 bg-amber-400/20' },
      { id: 'OFFLINE_QUEUE', label: 'File Hors-Ligne (IndexedDB)', desc: 'Synchronisation et résilience réseau', icon: HardDrive, color: 'text-indigo-400 bg-indigo-400/20' },
      { id: 'ACTIVITY_LOG', label: 'Fil d’Activité (Audit Global)', desc: 'Journal d’événements en temps réel', icon: History, color: 'text-amber-400 bg-amber-400/20' }
    ]
  }
];

export const LabDashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState<LabModule>('EXECUTIVE_DASHBOARD');
  const [isModuleSheetOpen, setIsModuleSheetOpen] = useState<boolean>(false);
  const [isOfflineQueueDrawerOpen, setIsOfflineQueueDrawerOpen] = useState<boolean>(false);
  const [moduleSearch, setModuleSearch] = useState<string>('');
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  useEffect(() => {
    const unsubscribe = subscribeToSupabaseRealtime((table, payload) => {
      setLastSyncTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      
      let tableLabel = 'Mise à jour database';
      if (table === 'store_requisitions') tableLabel = 'Statuts des Réquisitions';
      if (table === 'raw_materials') tableLabel = 'Niveaux de Stocks Mat. Premières';
      if (table === 'packaging_materials') tableLabel = 'Niveaux de Stocks Emballages';
      if (table === 'inventory_adjustments') tableLabel = 'Déstockage / Perte';

      notifyToast({
        type: 'info',
        title: `🔴 Live Supabase : ${tableLabel}`,
        message: `Mise à jour en direct synchronisée (${payload.eventType || 'UPDATE'}).`
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSelectModule = (mod: LabModule) => {
    setActiveModule(mod);
    setIsModuleSheetOpen(false);
  };

  const isOtherActive = !['EXECUTIVE_DASHBOARD', 'DAILY_PRODUCTION_PLAN', 'SUPPLIER_PO', 'DELIVERY_LOGISTICS'].includes(activeModule);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-8 space-y-4 sm:space-y-6 pb-28 md:pb-8">
      
      {/* Central Lab Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 sm:p-6 text-white shadow-md border border-indigo-900/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-b from-slate-800 to-slate-950 p-2 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/10 border border-amber-500/40">
              <CompanyLogo imgClassName="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black tracking-tight">Laboratoire Central & Production</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Vue Administrateur
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Radio className="w-3 h-3 text-emerald-400" />
                  <span>Realtime • {lastSyncTime}</span>
                </span>
                <OfflineQueueStatusPill onOpenDrawer={() => setIsOfflineQueueDrawerOpen(true)} />
              </div>
              <p className="text-xs text-slate-300 mt-0.5 sm:mt-1">
                Approvisionnement, ordonnancement cascade, stocks matières & marges de fabrication.
              </p>
            </div>
          </div>

          {/* Quick Access Hands-Free Voice Note Trigger Button */}
          <div className="flex items-center gap-2">
            <button
              id="lab-header-voice-notes-btn"
              type="button"
              onClick={() => setActiveModule('VOICE_NOTES')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer ${
                activeModule === 'VOICE_NOTES'
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                  : 'bg-slate-800/90 hover:bg-slate-800 text-amber-400 border border-amber-400/30'
              }`}
            >
              <Mic className="w-4 h-4 text-amber-400" />
              <span>🎙️ Dictée Vocale Chef</span>
            </button>
          </div>
        </div>

        {/* Central Lab Horizontal Module Navigation Tabs (Desktop Scrollable) */}
        <div className="hidden md:flex mt-6 pt-4 border-t border-indigo-900/50 items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          
          <button
            onClick={() => setActiveModule('EXECUTIVE_DASHBOARD')}
            className={`flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide whitespace-nowrap transition-all ${
              activeModule === 'EXECUTIVE_DASHBOARD'
                ? 'bg-amber-400 text-slate-950 font-black shadow-lg ring-2 ring-amber-300'
                : 'bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 border border-amber-400/30'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>👑 Executive Dashboard</span>
          </button>

          <button
            onClick={() => setActiveModule('VOICE_NOTES')}
            className={`flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeModule === 'VOICE_NOTES'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-300'
                : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
            }`}
          >
            <Mic className="w-4 h-4 text-amber-400" />
            <span>🎙️ Dictée Vocale & Notes</span>
          </button>

          <button
            onClick={() => setActiveModule('DAILY_PRODUCTION_PLAN')}
            className={`flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeModule === 'DAILY_PRODUCTION_PLAN'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-300'
                : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
            }`}
          >
            <Utensils className="w-4 h-4 text-amber-400" />
            <span>👩‍🍳 Task List Pâtissiers</span>
          </button>

          <button
            onClick={() => setActiveModule('SUPPLIER_PO')}
            className={`flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeModule === 'SUPPLIER_PO'
                ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400 font-black'
                : 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-indigo-300" />
            <span>🛒 Commandes Fournisseurs (PO)</span>
          </button>

          <button
            onClick={() => setActiveModule('DELIVERY_LOGISTICS')}
            className={`flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeModule === 'DELIVERY_LOGISTICS'
                ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400'
                : 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
            }`}
          >
            <Truck className="w-4 h-4 text-indigo-300" />
            <span>🚚 Expéditions & Bordereaux</span>
          </button>

          <button
            onClick={() => setActiveModule('REQUISITIONS')}
            className={`flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeModule === 'REQUISITIONS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Commandes Boutiques</span>
          </button>

          <button
            onClick={() => setActiveModule('PRODUCTION_RUNNER')}
            className={`flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeModule === 'PRODUCTION_RUNNER'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-300'
                : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>⚡ Lancer Production</span>
          </button>

          <button
            onClick={() => setActiveModule('QUALITY_CONTROL')}
            className={`flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeModule === 'QUALITY_CONTROL'
                ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400 font-black'
                : 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-300" />
            <span>🛡️ Qualité & HACCP</span>
          </button>

          <button
            onClick={() => setActiveModule('MARGIN_ANALYTICS')}
            className={`flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeModule === 'MARGIN_ANALYTICS'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md ring-2 ring-emerald-300'
                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>📊 Marges & COGS</span>
          </button>

          <button
            onClick={() => setActiveModule('INVENTORY')}
            className={`flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeModule === 'INVENTORY'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Stock Matières</span>
          </button>

          <button
            onClick={() => setActiveModule('RECIPES')}
            className={`flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeModule === 'RECIPES'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Fiches Techniques</span>
          </button>

          <button
            onClick={() => setIsModuleSheetOpen(true)}
            className="flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 text-amber-300 border border-slate-700 hover:bg-slate-700 whitespace-nowrap"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Tous les Modules ({LAB_CATEGORIES.reduce((a, c) => a + c.items.length, 0)})</span>
          </button>

        </div>
      </div>

      {/* Module Content Rendering with motion transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeModule}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {activeModule === 'EXECUTIVE_DASHBOARD' && <ExecutiveInventoryDashboard />}
          {activeModule === 'VOICE_NOTES' && <ChefVoiceNotesManager />}
          {activeModule === 'DAILY_PRODUCTION_PLAN' && <DailyProductionPlan />}
          {activeModule === 'PRODUCTION_BATCH_PLANNER' && <ProductionBatchPlanner />}
          {activeModule === 'COLD_ROOM_TRACKER' && <ColdRoomExpiryTracker />}
          {activeModule === 'PRICE_INFLATION' && <PriceInflationSimulator />}
          {activeModule === 'STORE_RETURNS' && <StoreReturnsManager />}
          {activeModule === 'EXPORT_REPORTS' && <ExportReportingCenter />}
          {activeModule === 'SUPPLIER_PO' && <SupplierPO />}
          {activeModule === 'QUALITY_CONTROL' && <QualityControl />}
          {activeModule === 'MULTI_STORE_ANALYTICS' && <StoreAnalytics />}
          {activeModule === 'MARGIN_ANALYTICS' && <MarginDashboard />}
          {activeModule === 'DELIVERY_LOGISTICS' && <DeliveryManifestView />}
          {activeModule === 'PACKAGING' && <PackagingLab />}
          {activeModule === 'REQUISITIONS' && <RequisitionManager />}
          {activeModule === 'PRODUCTION_RUNNER' && <ProductionRunner />}
          {activeModule === 'PRODUCTION_OVERVIEW' && <ProductionOverview />}
          {activeModule === 'WASTE_LOSS' && <WasteLossManager />}
          {activeModule === 'RECONCILIATION_WASTE' && <LabWasteAnalytics />}
          {activeModule === 'NEW_RECEIPT' && <ReceiptForm onSuccess={() => setActiveModule('RECEIPT_HISTORY')} />}
          {activeModule === 'INVENTORY' && <InventoryList />}
          {activeModule === 'DESTOCKING' && <RawMaterialDestocking />}
          {activeModule === 'RECIPES' && <RecipeCosting />}
          {activeModule === 'RECEIPT_HISTORY' && <ReceiptHistory />}
          {activeModule === 'SUPPLIERS' && <SupplierManager />}
          {activeModule === 'STORES' && <StoreManager />}
          {activeModule === 'STORE_SALES' && <LabSalesOverview />}
          {activeModule === 'ANALYTICS' && <AnalyticsReporting />}
          {(activeModule === 'SYNC_STATUS' || activeModule === 'OFFLINE_QUEUE') && <SyncStatusView />}
          {activeModule === 'ACTIVITY_LOG' && <ActivityLog />}
        </motion.div>
      </AnimatePresence>

      {/* ANDROID / MOBILE MATERIAL 3 BOTTOM NAVIGATION BAR FOR LAB (< 768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 shadow-2xl px-1.5 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around">
        
        {/* 1. Executive Dashboard */}
        <button
          onClick={() => handleSelectModule('EXECUTIVE_DASHBOARD')}
          className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-2xl transition-all active:scale-95 ${
            activeModule === 'EXECUTIVE_DASHBOARD'
              ? 'text-amber-400 font-black bg-amber-500/15'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Crown className={`w-5 h-5 transition-transform ${activeModule === 'EXECUTIVE_DASHBOARD' ? 'scale-110 fill-amber-400' : ''}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Direction</span>
        </button>

        {/* 2. Task List Production */}
        <button
          onClick={() => handleSelectModule('DAILY_PRODUCTION_PLAN')}
          className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-2xl transition-all active:scale-95 ${
            activeModule === 'DAILY_PRODUCTION_PLAN'
              ? 'text-amber-400 font-black bg-amber-500/15'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Utensils className={`w-5 h-5 transition-transform ${activeModule === 'DAILY_PRODUCTION_PLAN' ? 'scale-110' : ''}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Production</span>
        </button>

        {/* 3. Achats Supplier PO */}
        <button
          onClick={() => handleSelectModule('SUPPLIER_PO')}
          className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-2xl transition-all active:scale-95 ${
            activeModule === 'SUPPLIER_PO'
              ? 'text-indigo-400 font-black bg-indigo-500/15'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingCart className={`w-5 h-5 transition-transform ${activeModule === 'SUPPLIER_PO' ? 'scale-110' : ''}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Achats PO</span>
        </button>

        {/* 4. Expéditions Logistics */}
        <button
          onClick={() => handleSelectModule('DELIVERY_LOGISTICS')}
          className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-2xl transition-all active:scale-95 ${
            activeModule === 'DELIVERY_LOGISTICS'
              ? 'text-indigo-400 font-black bg-indigo-500/15'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Truck className={`w-5 h-5 transition-transform ${activeModule === 'DELIVERY_LOGISTICS' ? 'scale-110' : ''}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Expéditions</span>
        </button>

        {/* 5. All 22 Modules Sheet */}
        <button
          onClick={() => setIsModuleSheetOpen(true)}
          className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-2xl transition-all active:scale-95 ${
            isOtherActive
              ? 'text-amber-300 font-black bg-amber-500/20 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <LayoutGrid className={`w-5 h-5 transition-transform ${isOtherActive ? 'scale-110' : ''}`} />
            {isOtherActive && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-bold">
            {isOtherActive ? 'Module...' : 'Hub Labo'}
          </span>
        </button>
      </div>

      {/* ANDROID MATERIAL 3 SEARCHABLE BOTTOM SHEET FOR ALL 22 LAB MODULES */}
      <AnimatePresence>
        {isModuleSheetOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModuleSheetOpen(false)}
              className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs"
            />

            {/* Bottom Sheet Card */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="relative bg-slate-900 border-t border-slate-700/80 rounded-t-3xl p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] shadow-2xl text-white space-y-4 max-h-[85vh] flex flex-col"
            >
              {/* Drag Handle Indicator */}
              <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto shrink-0" />

              {/* Sheet Header & Search */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">Hub des 22 Modules Laboratoire</h3>
                    <p className="text-[11px] text-slate-400">Production, Stocks, Marges & Boutiques</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModuleSheetOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search filter input */}
              <div className="relative shrink-0">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher un module (ex: cascade, COGS, HACCP, stock...)"
                  value={moduleSearch}
                  onChange={(e) => setModuleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                {moduleSearch && (
                  <button
                    onClick={() => setModuleSearch('')}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Scrollable Categories & Module List */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-none">
                {LAB_CATEGORIES.map((cat, idx) => {
                  const filteredItems = cat.items.filter(
                    (item) =>
                      item.label.toLowerCase().includes(moduleSearch.toLowerCase()) ||
                      item.desc.toLowerCase().includes(moduleSearch.toLowerCase()) ||
                      cat.title.toLowerCase().includes(moduleSearch.toLowerCase())
                  );

                  if (filteredItems.length === 0) return null;

                  return (
                    <div key={idx} className="space-y-2">
                      <h4 className="text-[11px] font-extrabold uppercase text-amber-400 tracking-wider px-1">
                        {cat.title}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {filteredItems.map((item) => {
                          const Icon = item.icon;
                          const isCurrent = activeModule === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleSelectModule(item.id)}
                              className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all active:scale-95 ${
                                isCurrent
                                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md'
                                  : 'bg-slate-800/80 border-slate-700/80 hover:bg-slate-800 text-slate-200'
                              }`}
                            >
                              <div className={`p-2 rounded-xl shrink-0 ${isCurrent ? 'bg-slate-950 text-amber-400' : item.color}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold truncate">{item.label}</div>
                                <div className={`text-[10px] line-clamp-1 ${isCurrent ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                                  {item.desc}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OFFLINE QUEUE (INDEXEDDB) MANAGEMENT DRAWER */}
      <OfflineQueueDrawer
        isOpen={isOfflineQueueDrawerOpen}
        onClose={() => setIsOfflineQueueDrawerOpen(false)}
      />

    </div>
  );
};

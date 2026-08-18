import React, { useState, useEffect } from 'react';
import { 
  DailyPastryProductionForecast 
} from '../../types';
import { 
  getProductionForecasts, 
  updateProductionForecasts, 
  getRecipes, 
  notifyToast,
  subscribeToStoreChanges 
} from '../../services/storage';
import { 
  Utensils, 
  TrendingUp, 
  Sparkles, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Save, 
  Zap, 
  DollarSign, 
  ChefHat 
} from 'lucide-react';

export const ProductionBatchPlanner: React.FC = () => {
  const [forecasts, setForecasts] = useState<DailyPastryProductionForecast[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('Vendredi / Samedi (Pic Weekend)');
  const [weekendMultiplier, setWeekendMultiplier] = useState<number>(1.25);
  const [weatherFactor, setWeatherFactor] = useState<number>(1.05); // e.g. Beau temps / Fêtes
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStoreChanges(() => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  const loadData = () => {
    setForecasts(getProductionForecasts());
  };

  const handleBatchQtyChange = (recipeId: string, qty: number) => {
    const updated = forecasts.map(f => {
      if (f.recipeId === recipeId) {
        return { ...f, recommendedBatchQty: Math.max(0, qty) };
      }
      return f;
    });
    setForecasts(updated);
    setIsSaved(false);
  };

  const handleApplyAiOptimizations = () => {
    const totalMultiplier = weekendMultiplier * weatherFactor;
    const updated = forecasts.map(f => {
      const optimized = Math.round((f.historicalAvgDailySales * totalMultiplier) - (f.currentFinishedStockAcrossStores * 0.5));
      return {
        ...f,
        recommendedBatchQty: Math.max(10, optimized),
        dayOfWeekMultiplier: Number(totalMultiplier.toFixed(2))
      };
    });
    setForecasts(updated);
    updateProductionForecasts(updated);
    notifyToast({
      type: 'success',
      title: '✨ Planning IA Appliqué',
      message: `Calcul prédictif ajusté (+${Math.round((totalMultiplier - 1) * 100)}% sur volume standard).`
    });
    setIsSaved(true);
  };

  const handleSavePlan = () => {
    updateProductionForecasts(forecasts);
    setIsSaved(true);
    notifyToast({
      type: 'success',
      title: 'Production Plan Sauvegardé',
      message: 'Les quantités cibles sont synchronisées avec les fiches de fabrication.'
    });
  };

  const totalBatches = forecasts.reduce((acc, f) => acc + f.recommendedBatchQty, 0);
  const totalCost = forecasts.reduce((acc, f) => acc + (f.recommendedBatchQty * f.estimatedRawCost), 0);
  const totalRevenue = forecasts.reduce((acc, f) => acc + (f.recommendedBatchQty * f.estimatedRetailValue), 0);
  const grossMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Planification Prédictive IA
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Directoire Labo Central
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Plan de Production Journalier
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Anticipation des volumes de fabrication selon l'historique des ventes des 6 points de vente et les coefficients d'affluence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleApplyAiOptimizations}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Zap className="w-4 h-4 fill-current" /> Recalculer via IA
            </button>
            <button
              onClick={handleSavePlan}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" /> Enregistrer le Plan
            </button>
          </div>
        </div>

        {/* Global KPIs Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-900/50">
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-indigo-900/40">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Volume Pièces Total</span>
            <span className="text-xl font-black text-white">{totalBatches.toLocaleString('fr-FR')} {forecasts[0]?.unitName || 'unités'}</span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-indigo-900/40">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Coût Matières Cible</span>
            <span className="text-xl font-black text-amber-400">{totalCost.toLocaleString('fr-DZ')} DZD</span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-indigo-900/40">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Chiffre d'Affaires Estimé</span>
            <span className="text-xl font-black text-emerald-400">{totalRevenue.toLocaleString('fr-DZ')} DZD</span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-indigo-900/40">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Marge Brute Cible</span>
            <span className="text-xl font-black text-indigo-300">{grossMargin.toFixed(1)} %</span>
          </div>
        </div>
      </div>

      {/* Adjusters & Filters */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Calendar className="w-5 h-5 text-indigo-600 shrink-0" />
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Jour de Référence</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="font-bold text-slate-900 text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="Lundi / Mardi (Calme)">Lundi / Mardi (Activité Standard)</option>
              <option value="Mercredi / Jeudi (Soutenu)">Mercredi / Jeudi (Affluence Moyenne)</option>
              <option value="Vendredi / Samedi (Pic Weekend)">Vendredi / Samedi (Pic Weekend & Événements)</option>
              <option value="Dimanche (Brunch & Famille)">Dimanche (Brunch & Gâteaux Partage)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-6 flex-wrap w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Coeff Weekend :</span>
            <input 
              type="range" 
              min="1.0" 
              max="1.6" 
              step="0.05"
              value={weekendMultiplier}
              onChange={(e) => setWeekendMultiplier(parseFloat(e.target.value))}
              className="w-24 accent-indigo-600"
            />
            <span className="text-xs font-black text-indigo-600">x{weekendMultiplier.toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Facteur Météo/Fêtes :</span>
            <input 
              type="range" 
              min="0.8" 
              max="1.4" 
              step="0.05"
              value={weatherFactor}
              onChange={(e) => setWeatherFactor(parseFloat(e.target.value))}
              className="w-24 accent-amber-500"
            />
            <span className="text-xs font-black text-amber-600">x{weatherFactor.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Production Forecast Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-black text-slate-900">Grille de Production Cible par Recette</h2>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {forecasts.length} Recettes Sous Gestion
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-[11px] font-black uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Recette & Catégorie</th>
                <th className="p-4 text-center">Moyenne Ventes/J</th>
                <th className="p-4 text-center">Stock Boutiques Actuel</th>
                <th className="p-4 text-center">Coeff Prévisionnel</th>
                <th className="p-4 text-center">Fournée Cible Labo</th>
                <th className="p-4 text-right">Coût Matière</th>
                <th className="p-4 text-right">Valeur Vente Estimée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {forecasts.map((item) => {
                const batchCost = item.recommendedBatchQty * item.estimatedRawCost;
                const batchRev = item.recommendedBatchQty * item.estimatedRetailValue;
                return (
                  <tr key={item.recipeId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-black text-slate-900">{item.recipeName}</div>
                      <span className="text-xs text-slate-400">{item.category}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-slate-700 text-xs">
                        {item.historicalAvgDailySales} {item.unitName}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 font-bold text-indigo-700 text-xs">
                        {item.currentFinishedStockAcrossStores} {item.unitName}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-xs">
                        x{item.dayOfWeekMultiplier}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={item.recommendedBatchQty}
                          onChange={(e) => handleBatchQtyChange(item.recipeId, parseInt(e.target.value) || 0)}
                          className="w-20 p-2 text-center rounded-xl bg-indigo-50/50 border border-indigo-200 font-black text-indigo-900 focus:outline-none focus:border-indigo-600 focus:bg-white text-base shadow-inner"
                        />
                        <span className="text-xs text-slate-400">{item.unitName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-bold text-slate-700">{batchCost.toLocaleString('fr-DZ')} DZD</span>
                      <span className="block text-[11px] text-slate-400">({item.estimatedRawCost} /u)</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-black text-emerald-600">{batchRev.toLocaleString('fr-DZ')} DZD</span>
                      <span className="block text-[11px] text-slate-400">({item.estimatedRetailValue} /u)</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

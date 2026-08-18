import React, { useState, useEffect } from 'react';
import {
  getRecipes,
  getRawMaterials,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  subscribeToStoreChanges,
  notifyToast,
  getRecipeUnitCost
} from '../../services/storage';
import { Recipe, RawMaterial, RecipeIngredient, RecipeType } from '../../types';
import { ProductionRunner } from './ProductionRunner';
import {
  ChefHat,
  DollarSign,
  PieChart,
  Sparkles,
  TrendingUp,
  Clock,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  AlertTriangle,
  Scale,
  X,
  BookOpen,
  Layers,
  Box,
  Zap,
  Mic,
  MicOff
} from 'lucide-react';

export const RecipeCosting: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  
  // Recipe Category Tab: 'FINISHED' vs 'SEMI_FINISHED'
  const [activeTab, setActiveTab] = useState<RecipeType>('FINISHED');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showRunnerModal, setShowRunnerModal] = useState<boolean>(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isDictating, setIsDictating] = useState<boolean>(false);
  const dictationRef = React.useRef<any>(null);

  const toggleInstructionsDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      notifyToast({
        type: 'warning',
        title: 'Non Supporté',
        message: 'La reconnaissance vocale Web Speech API n’est pas disponible sur ce navigateur.'
      });
      return;
    }

    if (isDictating) {
      if (dictationRef.current) {
        dictationRef.current.stop();
      }
      setIsDictating(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';

      recognition.onresult = (event: any) => {
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + ' ';
          }
        }
        if (final) {
          setInstructions((prev) => (prev ? `${prev} ${final.trim()}` : final.trim()));
        }
      };

      recognition.onerror = () => {
        setIsDictating(false);
      };

      recognition.onend = () => {
        setIsDictating(false);
      };

      try {
        recognition.start();
        dictationRef.current = recognition;
        setIsDictating(true);
        notifyToast({
          type: 'info',
          title: 'Microphone Activé',
          message: 'Dictez vos consignes de préparation mains-libres.'
        });
      } catch {
        setIsDictating(false);
      }
    }
  };

  // Form State
  const [recipeName, setRecipeName] = useState<string>('');
  const [recipeType, setRecipeType] = useState<RecipeType>('FINISHED');
  const [recipeCategory, setRecipeCategory] = useState<string>('Viennoiserie');
  const [yieldUnits, setYieldUnits] = useState<number>(50);
  const [unitName, setUnitName] = useState<string>('pieces');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState<number>(120);
  const [suggestedSellingPrice, setSuggestedSellingPrice] = useState<number>(3.50);
  const [instructions, setInstructions] = useState<string>('');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);

  useEffect(() => {
    const loadData = () => {
      const recs = getRecipes();
      const mats = getRawMaterials();
      setRecipes(recs);
      setRawMaterials(mats);
    };
    loadData();
    return subscribeToStoreChanges(loadData);
  }, []);

  // Filter recipes by Active Tab ('FINISHED' vs 'SEMI_FINISHED')
  const tabRecipes = recipes.filter((r) => {
    const rType = r.recipeType || 'FINISHED';
    return rType === activeTab;
  });

  const filteredRecipes = tabRecipes.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ensure valid selected recipe for current tab
  useEffect(() => {
    if (filteredRecipes.length > 0) {
      const exists = filteredRecipes.some((r) => r.id === selectedRecipeId);
      if (!exists) {
        setSelectedRecipeId(filteredRecipes[0].id);
      }
    } else {
      setSelectedRecipeId('');
    }
  }, [activeTab, searchTerm, recipes]);

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId) || filteredRecipes[0];

  const semiFinishedRecipesList = recipes.filter((r) => (r.recipeType || 'FINISHED') === 'SEMI_FINISHED');

  // Modal Handlers
  const handleOpenAddModal = (presetType?: RecipeType) => {
    const typeToUse = presetType || activeTab;
    setEditingRecipe(null);
    setRecipeName('');
    setRecipeType(typeToUse);
    setRecipeCategory(typeToUse === 'SEMI_FINISHED' ? 'Creams & Fillings' : 'Viennoiserie');
    setYieldUnits(typeToUse === 'SEMI_FINISHED' ? 10 : 50);
    setUnitName(typeToUse === 'SEMI_FINISHED' ? 'kg' : 'pieces');
    setPrepTimeMinutes(60);
    setSuggestedSellingPrice(typeToUse === 'SEMI_FINISHED' ? 0 : 3.50);
    setInstructions('');

    if (rawMaterials.length > 0) {
      setIngredients([
        { type: 'RAW_MATERIAL', rawMaterialId: rawMaterials[0].id, quantity: 5.0 },
      ]);
    } else {
      setIngredients([]);
    }
    setShowModal(true);
  };

  const handleOpenEditModal = (recipeToEdit: Recipe) => {
    setEditingRecipe(recipeToEdit);
    setRecipeName(recipeToEdit.name);
    setRecipeType(recipeToEdit.recipeType || 'FINISHED');
    setRecipeCategory(recipeToEdit.category || 'Viennoiserie');
    setYieldUnits(recipeToEdit.yieldUnits);
    setUnitName(recipeToEdit.unitName);
    setPrepTimeMinutes(recipeToEdit.prepTimeMinutes);
    setSuggestedSellingPrice(recipeToEdit.suggestedSellingPrice || 0);
    setInstructions(recipeToEdit.instructions || '');
    
    // Normalize ingredients
    const normIngredients: RecipeIngredient[] = recipeToEdit.ingredients.map((ing) => {
      const ingType = ing.type || (ing.semiFinishedRecipeId ? 'SEMI_FINISHED' : 'RAW_MATERIAL');
      return {
        type: ingType,
        rawMaterialId: ing.rawMaterialId,
        semiFinishedRecipeId: ing.semiFinishedRecipeId,
        quantity: ing.quantity,
      };
    });
    setIngredients(normIngredients);
    setShowModal(true);
  };

  const handleAddIngredientLine = () => {
    if (rawMaterials.length > 0) {
      setIngredients([
        ...ingredients,
        { type: 'RAW_MATERIAL', rawMaterialId: rawMaterials[0].id, quantity: 1.0 },
      ]);
    } else if (semiFinishedRecipesList.length > 0) {
      setIngredients([
        ...ingredients,
        { type: 'SEMI_FINISHED', semiFinishedRecipeId: semiFinishedRecipesList[0].id, quantity: 1.0 },
      ]);
    }
  };

  const handleRemoveIngredientLine = (index: number) => {
    const updated = [...ingredients];
    updated.splice(index, 1);
    setIngredients(updated);
  };

  const handleIngredientChange = (
    index: number,
    field: keyof RecipeIngredient,
    value: any
  ) => {
    const updated = [...ingredients];
    const cur = updated[index];

    if (field === 'type') {
      const newType = value as 'RAW_MATERIAL' | 'SEMI_FINISHED';
      if (newType === 'RAW_MATERIAL') {
        updated[index] = {
          type: 'RAW_MATERIAL',
          rawMaterialId: rawMaterials[0]?.id || '',
          quantity: cur.quantity || 1.0,
        };
      } else {
        updated[index] = {
          type: 'SEMI_FINISHED',
          semiFinishedRecipeId: semiFinishedRecipesList[0]?.id || '',
          quantity: cur.quantity || 1.0,
        };
      }
    } else {
      updated[index] = {
        ...cur,
        [field]: value,
      };
    }
    setIngredients(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeName.trim()) return;

    const validIngredients = ingredients.filter((ing) => {
      const isRaw = (ing.type || 'RAW_MATERIAL') === 'RAW_MATERIAL';
      if (isRaw) return !!ing.rawMaterialId && ing.quantity > 0;
      return !!ing.semiFinishedRecipeId && ing.quantity > 0;
    });

    if (editingRecipe) {
      const updated = updateRecipe(editingRecipe.id, {
        name: recipeName.trim(),
        recipeType,
        category: recipeCategory || 'Viennoiserie',
        yieldUnits: Number(yieldUnits) || 1,
        unitName: unitName.trim() || 'pieces',
        prepTimeMinutes: Number(prepTimeMinutes) || 0,
        suggestedSellingPrice: recipeType === 'SEMI_FINISHED' ? 0 : Number(suggestedSellingPrice) || 0,
        instructions: instructions.trim(),
        ingredients: validIngredients,
      });

      notifyToast({
        type: 'success',
        title: 'Recipe Updated',
        message: `Recipe "${recipeName}" updated successfully.`,
      });

      if (updated) setSelectedRecipeId(updated.id);
    } else {
      const newRec = addRecipe({
        name: recipeName.trim(),
        recipeType,
        category: recipeCategory || 'Viennoiserie',
        yieldUnits: Number(yieldUnits) || 1,
        unitName: unitName.trim() || 'pieces',
        prepTimeMinutes: Number(prepTimeMinutes) || 0,
        suggestedSellingPrice: recipeType === 'SEMI_FINISHED' ? 0 : Number(suggestedSellingPrice) || 0,
        instructions: instructions.trim(),
        ingredients: validIngredients,
      });

      notifyToast({
        type: 'success',
        title: 'Recipe Created',
        message: `New recipe "${newRec.name}" saved to Central Lab database.`,
      });

      setSelectedRecipeId(newRec.id);
    }

    setShowModal(false);
  };

  const handleDeleteRecipe = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the recipe "${name}"?`)) {
      deleteRecipe(id);
      notifyToast({
        type: 'info',
        title: 'Recipe Removed',
        message: `Recipe "${name}" was deleted from Central Lab.`,
      });
      const remaining = recipes.filter((r) => r.id !== id);
      if (remaining.length > 0) {
        setSelectedRecipeId(remaining[0].id);
      }
    }
  };

  // Helper to calculate ingredient line item cost dynamically
  const getIngredientLineCost = (ing: RecipeIngredient) => {
    const isSemi = ing.type === 'SEMI_FINISHED' || (!ing.rawMaterialId && !!ing.semiFinishedRecipeId);
    if (isSemi && ing.semiFinishedRecipeId) {
      const subRec = recipes.find((r) => r.id === ing.semiFinishedRecipeId);
      if (subRec) {
        const uCost = getRecipeUnitCost(subRec, recipes, rawMaterials);
        return {
          name: subRec.name,
          category: subRec.category,
          unit: subRec.unitName || 'kg',
          isSemiFinished: true,
          unitCost: uCost,
          totalCost: ing.quantity * uCost,
        };
      }
      return { name: 'Unknown Sub-Recipe', category: 'Sub-Recipe', unit: 'unit', isSemiFinished: true, unitCost: 0, totalCost: 0 };
    } else if (ing.rawMaterialId) {
      const mat = rawMaterials.find((m) => m.id === ing.rawMaterialId);
      const uCost = mat ? mat.currentAvgCost : 0;
      return {
        name: mat ? mat.name : 'Unknown Raw Material',
        category: mat ? mat.category : 'Raw Material',
        unit: mat ? mat.unit : 'unit',
        isSemiFinished: false,
        unitCost: uCost,
        totalCost: ing.quantity * uCost,
      };
    }
    return { name: 'Unknown', category: 'General', unit: 'unit', isSemiFinished: false, unitCost: 0, totalCost: 0 };
  };

  // Helper for batch cost calculation
  const calculateBatchCost = (recipeIngredients: RecipeIngredient[]) => {
    return recipeIngredients.reduce((sum, ing) => {
      const line = getIngredientLineCost(ing);
      return sum + line.totalCost;
    }, 0);
  };

  // Selected Recipe Metrics
  const ingredientCostBreakdown = selectedRecipe
    ? selectedRecipe.ingredients.map((ing) => {
        const line = getIngredientLineCost(ing);
        return {
          ingredientName: line.name,
          category: line.category,
          isSemiFinished: line.isSemiFinished,
          quantity: ing.quantity,
          unit: line.unit,
          unitAvgCost: line.unitCost,
          totalCost: line.totalCost,
        };
      })
    : [];

  const totalBatchIngredientCost = ingredientCostBreakdown.reduce((sum, item) => sum + item.totalCost, 0);

  const costPerUnit =
    selectedRecipe && selectedRecipe.yieldUnits > 0 ? totalBatchIngredientCost / selectedRecipe.yieldUnits : 0;

  const sellingPrice = selectedRecipe ? selectedRecipe.suggestedSellingPrice || 0 : 0;
  const profitPerUnit = sellingPrice - costPerUnit;
  const grossMarginPct = sellingPrice > 0 ? (profitPerUnit / sellingPrice) * 100 : 0;

  // Modal live calculations
  const modalBatchCost = calculateBatchCost(ingredients);
  const modalCostPerUnit = yieldUnits > 0 ? modalBatchCost / yieldUnits : 0;
  const modalProfitPerUnit = suggestedSellingPrice - modalCostPerUnit;
  const modalMarginPct = suggestedSellingPrice > 0 ? (modalProfitPerUnit / suggestedSellingPrice) * 100 : 0;

  return (
    <div className="space-y-6">
      
      {/* Category Level Switcher (Finished Products vs Semi-Finished Products) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('FINISHED');
              setSearchTerm('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'FINISHED'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Finished Products</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'FINISHED' ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {recipes.filter((r) => (r.recipeType || 'FINISHED') === 'FINISHED').length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('SEMI_FINISHED');
              setSearchTerm('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'SEMI_FINISHED'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Semi-Finished Stock Recipes</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'SEMI_FINISHED' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {recipes.filter((r) => r.recipeType === 'SEMI_FINISHED').length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 pr-2">
          <button
            onClick={() => handleOpenAddModal(activeTab)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            {activeTab === 'FINISHED' ? 'Add Finished Recipe' : 'Add Semi-Finished Recipe'}
          </button>
        </div>
      </div>

      {/* Header Banner & Recipe Selection List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${
                  activeTab === 'FINISHED'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                }`}
              >
                <ChefHat className="w-3.5 h-3.5" />
                {activeTab === 'FINISHED' ? 'Finished Retail Recipes' : 'Semi-Finished Sub-Recipes'}
              </span>
              <span className="text-xs text-slate-500 font-medium">Auto COGS Calculation</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {activeTab === 'FINISHED' ? 'Standard Pastry Finished Products' : 'Semi-Finished Component Base Recipes'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTab === 'FINISHED'
                ? 'Recipes requiring raw materials & semi-finished stock components. Costs cascade automatically.'
                : 'Intermediate recipes (creams, dough bases, fillings) produced in Central Lab and stocked as components.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search recipe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Recipe Selection Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-slate-100 scrollbar-none">
          {filteredRecipes.map((r) => {
            const batchCost = calculateBatchCost(r.ingredients);
            const unitCost = r.yieldUnits > 0 ? batchCost / r.yieldUnits : 0;
            const isSelected = r.id === selectedRecipeId;

            return (
              <button
                key={r.id}
                onClick={() => setSelectedRecipeId(r.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                  isSelected
                    ? activeTab === 'FINISHED'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                      : 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>{r.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                    isSelected
                      ? activeTab === 'FINISHED' ? 'bg-amber-700 text-amber-100' : 'bg-indigo-700 text-indigo-100'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  ${unitCost.toFixed(2)}/{r.unitName ? r.unitName.slice(0, 3) : 'u'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedRecipe && (
        <>
          {/* Active Recipe Header & Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-xl ${
                    selectedRecipe.recipeType === 'SEMI_FINISHED'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {selectedRecipe.recipeType === 'SEMI_FINISHED' ? (
                    <Layers className="w-6 h-6" />
                  ) : (
                    <ChefHat className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{selectedRecipe.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        selectedRecipe.recipeType === 'SEMI_FINISHED'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedRecipe.recipeType === 'SEMI_FINISHED' ? 'Semi-Finished Component' : 'Finished Product'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>Category: <strong className="text-slate-800">{selectedRecipe.category}</strong></span>
                    <span>•</span>
                    <span>Batch Yield: <strong className="text-slate-800">{selectedRecipe.yieldUnits} {selectedRecipe.unitName}</strong></span>
                    <span>•</span>
                    <span>Prep Time: <strong className="text-slate-800">{selectedRecipe.prepTimeMinutes} mins</strong></span>
                    <span>•</span>
                    <span>Ingredients: <strong className="text-slate-800">{selectedRecipe.ingredients.length} items</strong></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setShowRunnerModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition-colors"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" /> ⚡ Launch Production (BOM Cascade)
              </button>
              <button
                onClick={() => handleOpenEditModal(selectedRecipe)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => handleDeleteRecipe(selectedRecipe.id, selectedRecipe.name)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>

          {/* Real-Time COGS KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Total Batch COGS</span>
              <div className="text-2xl font-black text-slate-900">{totalBatchIngredientCost.toFixed(2)} DZD</div>
              <p className="text-xs text-slate-500">For batch of {selectedRecipe.yieldUnits} {selectedRecipe.unitName}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Unit Cost (COGS)</span>
              <div className="text-2xl font-black text-indigo-700">{costPerUnit.toFixed(2)} DZD</div>
              <p className="text-xs text-slate-500">Calculated cost per {selectedRecipe.unitName || 'unit'}</p>
            </div>

            {selectedRecipe.recipeType !== 'SEMI_FINISHED' ? (
              <>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Retail Selling Price</span>
                  <div className="text-2xl font-black text-slate-900">{sellingPrice.toFixed(2)} DZD</div>
                  <p className="text-xs text-slate-500">Suggested retail price</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Gross Margin %</span>
                    {grossMarginPct >= 60 ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Optimal
                      </span>
                    ) : grossMarginPct >= 40 ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                        Healthy
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800">
                        Low Margin
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-black text-emerald-600">{grossMarginPct.toFixed(1)}%</div>
                  <p className="text-xs text-emerald-700 font-medium">+{profitPerUnit.toFixed(2)} DZD gross profit / unit</p>
                </div>
              </>
            ) : (
              <div className="sm:col-span-2 bg-indigo-50/60 p-5 rounded-2xl border border-indigo-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block">Sub-Recipe Component Status</span>
                  <p className="text-xs text-indigo-700 mt-1">
                    This semi-finished recipe is stocked in Central Lab inventory and used as an ingredient in finished pastry recipes.
                  </p>
                </div>
                <div className="p-3 bg-white text-indigo-700 rounded-xl shadow-2xs font-extrabold text-sm border border-indigo-100 shrink-0">
                  Unit Cost: {costPerUnit.toFixed(2)} DZD / {selectedRecipe.unitName}
                </div>
              </div>
            )}
          </div>

          {/* Ingredient Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-amber-600" />
                Raw Materials & Semi-Finished Ingredients Breakdown
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Live Prices from Inventory Receipts & Sub-Recipe Calculations
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="p-3">Ingredient Name</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-center">Batch Qty Required</th>
                    <th className="p-3 text-right">Unit Calculated Cost</th>
                    <th className="p-3 text-right">Line Ingredient COGS</th>
                    <th className="p-3 text-right">% of Total Batch Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {ingredientCostBreakdown.map((item, idx) => {
                    const pct = totalBatchIngredientCost > 0 ? (item.totalCost / totalBatchIngredientCost) * 100 : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="p-3 font-bold text-slate-900">{item.ingredientName}</td>
                        <td className="p-3">
                          {item.isSemiFinished ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1 w-fit">
                              <Layers className="w-3 h-3" /> Semi-Finished Sub-Recipe
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit">
                              <Box className="w-3 h-3" /> Raw Material
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold text-slate-800">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="p-3 text-right font-medium text-slate-600">
                          {item.unitAvgCost.toFixed(2)} DZD / {item.unit}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900">
                          {item.totalCost.toFixed(2)} DZD
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div className="bg-amber-500 h-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-slate-600 font-mono text-[11px] font-semibold">{pct.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                    <td colSpan={5} className="p-3 text-right uppercase text-[11px] text-slate-500">
                      Total Batch Ingredient COGS:
                    </td>
                    <td className="p-3 text-right text-sm text-indigo-700 font-black">
                      {totalBatchIngredientCost.toFixed(2)} DZD
                    </td>
                    <td className="p-3 text-right text-xs text-slate-500">100.0%</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {selectedRecipe.instructions && (
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-slate-700 space-y-1">
                <strong className="font-bold text-amber-900 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> Prep & Baking Instructions:
                </strong>
                <p className="whitespace-pre-line leading-relaxed">{selectedRecipe.instructions}</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add / Edit Recipe Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-600" />
                {editingRecipe
                  ? 'Edit Recipe'
                  : recipeType === 'SEMI_FINISHED'
                  ? 'Create New Semi-Finished Component Recipe'
                  : 'Create New Finished Pastry Recipe'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Recipe Type Switcher */}
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRecipeType('FINISHED');
                    if (recipeCategory === 'Creams & Fillings') setRecipeCategory('Viennoiserie');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                    recipeType === 'FINISHED'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ✨ Finished Product Recipe
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRecipeType('SEMI_FINISHED');
                    setRecipeCategory('Creams & Fillings');
                    setSuggestedSellingPrice(0);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                    recipeType === 'SEMI_FINISHED'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🥐 Semi-Finished Component Base
                </button>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Recipe Name</label>
                    <input
                      type="text"
                      required
                      value={recipeName}
                      onChange={(e) => setRecipeName(e.target.value)}
                      placeholder={recipeType === 'SEMI_FINISHED' ? 'e.g. Vanilla Bean Crème Pâtissière' : 'e.g. Croissant au Beurre (AOP)'}
                      className="w-full text-xs font-medium bg-slate-50 text-slate-900 rounded-lg p-2.5 border border-slate-300 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={recipeCategory}
                      onChange={(e) => setRecipeCategory(e.target.value)}
                      className="w-full text-xs font-medium bg-slate-50 text-slate-900 rounded-lg p-2.5 border border-slate-300 focus:ring-2 focus:ring-amber-500 cursor-pointer"
                    >
                      <option value="Viennoiserie">Viennoiserie</option>
                      <option value="Pâtisserie">Pâtisserie</option>
                      <option value="Creams & Fillings">Creams & Fillings</option>
                      <option value="Dough & Bases">Dough & Bases</option>
                      <option value="Gâteaux & Cakes">Gâteaux & Cakes</option>
                      <option value="Tarts & Pies">Tarts & Pies</option>
                      <option value="Savoury">Savoury</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Yield Quantity</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    required
                    value={yieldUnits}
                    onChange={(e) => setYieldUnits(Number(e.target.value))}
                    className="w-full text-xs font-medium bg-slate-50 text-slate-900 rounded-lg p-2.5 border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Yield Unit Name</label>
                  <input
                    type="text"
                    required
                    value={unitName}
                    onChange={(e) => setUnitName(e.target.value)}
                    placeholder="kg, pieces, L, trays"
                    className="w-full text-xs font-medium bg-slate-50 text-slate-900 rounded-lg p-2.5 border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Prep Time (minutes)</label>
                  <input
                    type="number"
                    min="0"
                    value={prepTimeMinutes}
                    onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
                    className="w-full text-xs font-medium bg-slate-50 text-slate-900 rounded-lg p-2.5 border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {recipeType === 'FINISHED' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Suggested Retail Price (DZD)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={suggestedSellingPrice}
                      onChange={(e) => setSuggestedSellingPrice(Number(e.target.value))}
                      className="w-full text-xs font-medium bg-slate-50 text-slate-900 rounded-lg p-2.5 border border-slate-300 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>

              {/* Dynamic Ingredients Section */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Recipe Ingredients (Raw Materials & Sub-Recipes) ({ingredients.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddIngredientLine}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Ingredient
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {ingredients.map((ing, idx) => {
                    const isSemi = ing.type === 'SEMI_FINISHED';
                    const line = getIngredientLineCost(ing);

                    return (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        {/* Type selector */}
                        <div className="w-full sm:w-36">
                          <select
                            value={ing.type || 'RAW_MATERIAL'}
                            onChange={(e) => handleIngredientChange(idx, 'type', e.target.value)}
                            className="w-full text-[11px] font-bold bg-white text-slate-800 rounded-lg p-1.5 border border-slate-300 focus:ring-2 focus:ring-amber-500 cursor-pointer"
                          >
                            <option value="RAW_MATERIAL">Raw Material</option>
                            <option value="SEMI_FINISHED">Sub-Recipe Base</option>
                          </select>
                        </div>

                        {/* Item selector */}
                        <div className="flex-1">
                          {isSemi ? (
                            <select
                              value={ing.semiFinishedRecipeId || ''}
                              onChange={(e) => handleIngredientChange(idx, 'semiFinishedRecipeId', e.target.value)}
                              className="w-full text-xs font-medium bg-white text-slate-900 rounded-lg p-1.5 border border-slate-300 focus:ring-2 focus:ring-amber-500 cursor-pointer"
                            >
                              {semiFinishedRecipesList.map((sf) => {
                                const sfCost = getRecipeUnitCost(sf, recipes, rawMaterials);
                                return (
                                  <option key={sf.id} value={sf.id}>
                                    🥐 {sf.name} ({sfCost.toFixed(2)} DZD/{sf.unitName})
                                  </option>
                                );
                              })}
                            </select>
                          ) : (
                            <select
                              value={ing.rawMaterialId || ''}
                              onChange={(e) => handleIngredientChange(idx, 'rawMaterialId', e.target.value)}
                              className="w-full text-xs font-medium bg-white text-slate-900 rounded-lg p-1.5 border border-slate-300 focus:ring-2 focus:ring-amber-500 cursor-pointer"
                            >
                              {rawMaterials.map((m) => (
                                <option key={m.id} value={m.id}>
                                  📦 {m.name} ({m.currentAvgCost.toFixed(2)} DZD/{m.unit})
                                </option>
                              ))}
                            </select>
                          )}
                        </div>

                        {/* Quantity input */}
                        <div className="w-28 flex items-center gap-1">
                          <input
                            type="number"
                            step="0.1"
                            min="0.01"
                            required
                            value={ing.quantity}
                            onChange={(e) => handleIngredientChange(idx, 'quantity', Number(e.target.value))}
                            className="w-full text-xs font-bold bg-white text-slate-900 rounded-lg p-1.5 border border-slate-300 focus:ring-2 focus:ring-amber-500 text-center"
                          />
                          <span className="text-[11px] text-slate-500 font-medium shrink-0">
                            {line.unit}
                          </span>
                        </div>

                        {/* Calculated Line Cost */}
                        <div className="w-20 text-right pr-2 shrink-0">
                          <span className="text-xs font-extrabold text-slate-900">{line.totalCost.toFixed(2)} DZD</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveIngredientLine(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Cost Calculation Bar in Modal */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block">Estimated Batch COGS</span>
                  <strong className="text-sm font-extrabold text-slate-900">{modalBatchCost.toFixed(2)} DZD</strong>
                </div>
                <div>
                  <span className="text-[10px] text-indigo-600 font-semibold block">Calculated Unit Cost</span>
                  <strong className="text-sm font-extrabold text-indigo-800">{modalCostPerUnit.toFixed(2)} DZD / {unitName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-600 font-semibold block">
                    {recipeType === 'FINISHED' ? 'Est. Gross Margin %' : 'Component Type'}
                  </span>
                  <strong className="text-sm font-extrabold text-emerald-800">
                    {recipeType === 'FINISHED' ? `${modalMarginPct.toFixed(1)}%` : 'Sub-Recipe Component'}
                  </strong>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Prep & Baking Instructions</label>
                  <button
                    type="button"
                    onClick={toggleInstructionsDictation}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      isDictating
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {isDictating ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3 text-amber-700" />}
                    <span>{isDictating ? 'Arrêter la dictée' : '🎙️ Dicter les consignes'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Scald cream with vanilla bean. Whisk yolks with sugar and flour..."
                  className="w-full text-xs font-medium bg-slate-50 text-slate-900 rounded-lg p-2.5 border border-slate-300 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
                >
                  {editingRecipe ? 'Save Changes' : 'Save Recipe'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Production Runner Modal Overlay */}
      {showRunnerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-100 rounded-3xl border border-slate-300 max-w-5xl w-full p-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowRunnerModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold text-xs"
            >
              <X className="w-5 h-5" />
            </button>
            <ProductionRunner
              initialRecipeId={selectedRecipeId}
              onCloseModal={() => setShowRunnerModal(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
};

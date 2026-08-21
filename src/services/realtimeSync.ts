import { subscribeCollectionFromFirestore, syncToFirestore, batchSyncToFirestore } from '../lib/firebaseSync';
import { queryClient } from './queryClient';
import {
  getRawMaterials,
  setRawMaterials,
  getProductionBatches,
  setProductionBatches,
  getRecipes,
  getRequisitions,
  notifyListeners,
  notifyToast
} from './storage';
import { RawMaterial, ProductionBatch, Recipe, Requisition } from '../types';
import { useQuery, useMutation } from '@tanstack/react-query';

let isRealtimeSyncActive = false;
const unsubscribers: (() => void)[] = [];

/**
 * Initializes bidirectional real-time listeners between Firestore and local client state.
 * When data is modified on PC or Android, changes reflect instantly across all devices.
 */
export function initRealtimeCloudSync() {
  if (isRealtimeSyncActive) return;
  isRealtimeSyncActive = true;

  console.log('[RealtimeSync] Initializing real-time cloud sync listeners for Stock and Production...');

  // 1. Real-time listener for "Stock Matières Premières" (raw_materials)
  try {
    const unsubRawMaterials = subscribeCollectionFromFirestore<RawMaterial>('raw_materials', (cloudMaterials) => {
      if (cloudMaterials && cloudMaterials.length > 0) {
        // Merge cloud updates into storage
        setRawMaterials(cloudMaterials);
        // Invalidate and update TanStack Query cache
        queryClient.setQueryData(['raw_materials'], cloudMaterials);
        queryClient.invalidateQueries({ queryKey: ['raw_materials'] });
        notifyListeners();
        console.log(`[RealtimeSync] Raw materials synced from cloud: ${cloudMaterials.length} items.`);
      } else {
        // If cloud is empty initially, seed with current local master raw materials
        const localMaterials = getRawMaterials();
        if (localMaterials.length > 0) {
          batchSyncToFirestore('raw_materials', localMaterials);
        }
      }
    });
    unsubscribers.push(unsubRawMaterials);
  } catch (err) {
    console.warn('[RealtimeSync] Raw materials listener error:', err);
  }

  // 2. Real-time listener for "Fiche de Production" (production_batches)
  try {
    const unsubBatches = subscribeCollectionFromFirestore<ProductionBatch>('production_batches', (cloudBatches) => {
      if (cloudBatches && cloudBatches.length > 0) {
        setProductionBatches(cloudBatches);
        queryClient.setQueryData(['production_batches'], cloudBatches);
        queryClient.invalidateQueries({ queryKey: ['production_batches'] });
        notifyListeners();
        console.log(`[RealtimeSync] Production batches synced from cloud: ${cloudBatches.length} items.`);
      } else {
        const localBatches = getProductionBatches();
        if (localBatches.length > 0) {
          batchSyncToFirestore('production_batches', localBatches);
        }
      }
    });
    unsubscribers.push(unsubBatches);
  } catch (err) {
    console.warn('[RealtimeSync] Production batches listener error:', err);
  }

  // 3. Real-time listener for "Fiches Techniques / Recettes" (recipes)
  try {
    const unsubRecipes = subscribeCollectionFromFirestore<Recipe>('recipes', (cloudRecipes) => {
      if (cloudRecipes && cloudRecipes.length > 0) {
        queryClient.setQueryData(['recipes'], cloudRecipes);
        queryClient.invalidateQueries({ queryKey: ['recipes'] });
        notifyListeners();
      } else {
        const localRecipes = getRecipes();
        if (localRecipes.length > 0) {
          batchSyncToFirestore('recipes', localRecipes);
        }
      }
    });
    unsubscribers.push(unsubRecipes);
  } catch (err) {
    console.warn('[RealtimeSync] Recipes listener error:', err);
  }

  // 4. Real-time listener for "Demandes Magasins" (store_requisitions)
  try {
    const unsubReqs = subscribeCollectionFromFirestore<Requisition>('store_requisitions', (cloudReqs) => {
      if (cloudReqs && cloudReqs.length > 0) {
        queryClient.setQueryData(['requisitions'], cloudReqs);
        queryClient.invalidateQueries({ queryKey: ['requisitions'] });
        notifyListeners();
      }
    });
    unsubscribers.push(unsubReqs);
  } catch (err) {
    console.warn('[RealtimeSync] Requisitions listener error:', err);
  }
}

/**
 * Cleanup listeners if needed
 */
export function stopRealtimeCloudSync() {
  unsubscribers.forEach((unsub) => unsub());
  unsubscribers.length = 0;
  isRealtimeSyncActive = false;
}

// ----------------------------------------------------
// Custom TanStack React Query Hooks for Real-Time Data
// ----------------------------------------------------

/**
 * Hook for Stock Matières Premières with real-time cloud sync and offline persistence
 */
export function useRawMaterialsQuery() {
  return useQuery<RawMaterial[]>({
    queryKey: ['raw_materials'],
    queryFn: async () => {
      return getRawMaterials();
    },
    initialData: getRawMaterials(),
  });
}

/**
 * Hook for Fiche de Production Batches with real-time cloud sync and offline persistence
 */
export function useProductionBatchesQuery() {
  return useQuery<ProductionBatch[]>({
    queryKey: ['production_batches'],
    queryFn: async () => {
      return getProductionBatches();
    },
    initialData: getProductionBatches(),
  });
}

/**
 * Hook for Recipes / Fiches Techniques with real-time cloud sync and offline persistence
 */
export function useRecipesQuery() {
  return useQuery<Recipe[]>({
    queryKey: ['recipes'],
    queryFn: async () => {
      return getRecipes();
    },
    initialData: getRecipes(),
  });
}

/**
 * Hook for Store Requisitions with real-time cloud sync and offline persistence
 */
export function useRequisitionsQuery() {
  return useQuery<Requisition[]>({
    queryKey: ['requisitions'],
    queryFn: async () => {
      return getRequisitions();
    },
    initialData: getRequisitions(),
  });
}

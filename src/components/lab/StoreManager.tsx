import React, { useState, useEffect } from 'react';
import { getStores, addStore, updateStore, getRequisitions, subscribeToStoreChanges, notifyToast } from '../../services/storage';
import { StoreLocation, Requisition } from '../../types';
import {
  Store,
  Plus,
  Search,
  MapPin,
  UserCheck,
  Phone,
  Building2,
  FileText,
  DollarSign,
  Edit2,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';

export const StoreManager: React.FC = () => {
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingStore, setEditingStore] = useState<StoreLocation | null>(null);

  // Form State
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [managerName, setManagerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  useEffect(() => {
    const loadData = () => {
      setStores(getStores());
      setRequisitions(getRequisitions());
    };
    loadData();
    return subscribeToStoreChanges(loadData);
  }, []);

  const openAddModal = () => {
    setName('');
    setCode('');
    setAddress('');
    setManagerName('');
    setPhone('');
    setEditingStore(null);
    setShowAddModal(true);
  };

  const openEditModal = (store: StoreLocation) => {
    setEditingStore(store);
    setName(store.name);
    setCode(store.code);
    setAddress(store.address);
    setManagerName(store.managerName);
    setPhone(store.phone);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingStore) {
      updateStore(editingStore.id, {
        name: name.trim(),
        code: code.trim() || editingStore.code,
        address: address.trim() || editingStore.address,
        managerName: managerName.trim() || editingStore.managerName,
        phone: phone.trim() || editingStore.phone,
      });

      notifyToast({
        type: 'success',
        title: 'Store Details Updated',
        message: `${name} information has been updated successfully.`,
      });
    } else {
      const newStore = addStore({
        name: name.trim(),
        code: code.trim() || `STR-${(stores.length + 1).toString().padStart(3, '0')}`,
        address: address.trim() || 'Central District Outlet',
        managerName: managerName.trim() || 'Store Director',
        phone: phone.trim() || '(555) 000-0000',
      });

      notifyToast({
        type: 'success',
        title: 'New Store Outlet Registered',
        message: `${newStore.name} is now connected to Central Lab Requisitions.`,
      });
    }

    setShowAddModal(false);
  };

  const filteredStores = stores.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.code.toLowerCase().includes(term) ||
      s.managerName.toLowerCase().includes(term) ||
      s.address.toLowerCase().includes(term)
    );
  });

  // Calculate requisition metrics for each store
  const getStoreMetrics = (storeId: string) => {
    const storeReqs = requisitions.filter((r) => r.storeId === storeId);
    const pendingCount = storeReqs.filter((r) => r.status === 'PENDING').length;
    const totalCost = storeReqs.reduce((sum, r) => sum + r.totalEstimatedCost, 0);
    return {
      totalReqs: storeReqs.length,
      pendingCount,
      totalCost,
    };
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Retail Stores & Outlets Network</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {stores.length} Active Outlets
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Directory of retail locations linked to Central Lab for daily pastry requisitions and fulfillment.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search store name, code, manager..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Retail Store
            </button>
          </div>
        </div>

        {/* Global Stores Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-150">
            <div className="text-[11px] font-semibold text-slate-500">Total Retail Outlets</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">{stores.length} Locations</div>
          </div>
          <div className="bg-indigo-50/60 rounded-xl p-3 border border-indigo-100">
            <div className="text-[11px] font-semibold text-indigo-700">Total Requisitions</div>
            <div className="text-lg font-black text-indigo-900 mt-0.5">{requisitions.length} Placed</div>
          </div>
          <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-100">
            <div className="text-[11px] font-semibold text-amber-700">Pending Approvals</div>
            <div className="text-lg font-black text-amber-900 mt-0.5">
              {requisitions.filter((r) => r.status === 'PENDING').length} Pending
            </div>
          </div>
          <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100">
            <div className="text-[11px] font-semibold text-emerald-700">Total Network Volume</div>
            <div className="text-lg font-black text-emerald-900 mt-0.5">
              {requisitions.reduce((sum, r) => sum + r.totalEstimatedCost, 0).toFixed(2)} DZD
            </div>
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStores.map((store) => {
          const metrics = getStoreMetrics(store.id);

          return (
            <div
              key={store.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                
                {/* Store Name & Code Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 shrink-0">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{store.name}</h4>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {store.code}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => openEditModal(store)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                    title="Edit Store Details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Location & Contact */}
                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{store.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Manager: <strong className="text-slate-800">{store.managerName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{store.phone}</span>
                  </div>
                </div>

              </div>

              {/* Requisition Metrics Box */}
              <div className="pt-3 border-t border-slate-100 bg-slate-50/70 rounded-xl p-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Total Reqs</span>
                  <strong className="text-xs font-extrabold text-slate-800">{metrics.totalReqs}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-amber-700 font-bold block">Pending</span>
                  <strong className="text-xs font-extrabold text-amber-800">{metrics.pendingCount}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-indigo-700 font-bold block">Est. Value</span>
                  <strong className="text-xs font-extrabold text-indigo-900">{metrics.totalCost.toFixed(0)} DZD</strong>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add / Edit Store Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingStore ? 'Edit Retail Store Details' : 'Register New Retail Store Outlet'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Store Outlet Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Store #7 - Montmartre Boutique"
                  className="w-full text-xs font-medium bg-slate-50 text-slate-900 rounded-lg p-2.5 border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Store Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. STR-007"
                    className="w-full text-xs font-medium bg-slate-50 text-slate-900 rounded-lg p-2.5 border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 018-9922"
                    className="w-full text-xs font-medium bg-slate-50 text-slate-900 rounded-lg p-2.5 border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Store Manager / Director</label>
                <input
                  type="text"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  placeholder="e.g. Jean-Luc Moreau"
                  className="w-full text-xs font-medium bg-slate-50 text-slate-900 rounded-lg p-2.5 border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address & District</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 18 Rue des Abbesses, 75018 Paris"
                  className="w-full text-xs font-medium bg-slate-50 text-slate-900 rounded-lg p-2.5 border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  {editingStore ? 'Save Changes' : 'Register Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

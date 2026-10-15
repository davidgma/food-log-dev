import React, { useMemo, useState } from 'react';
import { ShoppingBag, Eye, Search, Calendar } from 'lucide-react';
import { FoodLogEntry } from '../types/foodLog';

interface GroceriesSectionProps {
  dates: string[];
  entriesByDate: Record<string, FoodLogEntry>;
  onOpenDoc: (url: string, title: string, type: 'pdf' | 'image') => void;
}

export const GroceriesSection: React.FC<GroceriesSectionProps> = ({
  dates,
  entriesByDate,
  onOpenDoc,
}) => {
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState<'all' | 'waitrose' | 'ocado' | 'forest'>('all');

  const allGroceries = useMemo(() => {
    const list: {
      date: string;
      formattedDate: string;
      label: string;
      url: string;
      type: 'waitrose' | 'ocado' | 'forest' | 'other';
      isImage: boolean;
    }[] = [];

    dates.forEach((date) => {
      const entry = entriesByDate[date];
      if (!entry) return;

      entry.groceries.forEach((g) => {
        list.push({
          date,
          formattedDate: entry.formattedDate,
          label: g.label,
          url: g.url,
          type: g.type,
          isImage: false,
        });
      });

      entry.groceryImages.forEach((img) => {
        list.push({
          date,
          formattedDate: entry.formattedDate,
          label: img.label,
          url: img.url,
          type: 'forest',
          isImage: true,
        });
      });
    });

    return list;
  }, [dates, entriesByDate]);

  const filteredGroceries = useMemo(() => {
    return allGroceries.filter((item) => {
      const matchesSearch =
        item.label.toLowerCase().includes(search.toLowerCase()) ||
        item.date.includes(search) ||
        item.formattedDate.toLowerCase().includes(search.toLowerCase());

      const matchesProvider =
        providerFilter === 'all' || item.type === providerFilter;

      return matchesSearch && matchesProvider;
    });
  }, [allGroceries, search, providerFilter]);

  const handleViewDoc = (item: typeof allGroceries[0]) => {
    if (item.isImage) {
      onOpenDoc(item.url, item.label, 'image');
    } else {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Groceries
            </h2>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search grocery orders..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setProviderFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                providerFilter === 'all'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Vendors ({allGroceries.length})
            </button>
            <button
              onClick={() => setProviderFilter('waitrose')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                providerFilter === 'waitrose'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Waitrose
            </button>
            <button
              onClick={() => setProviderFilter('ocado')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                providerFilter === 'ocado'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Ocado
            </button>
            <button
              onClick={() => setProviderFilter('forest')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                providerFilter === 'forest'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Forest Whole Foods
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Grocery Deliveries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroceries.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200">
            <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 font-medium text-sm">No grocery deliveries match criteria.</p>
          </div>
        ) : (
          filteredGroceries.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono font-bold text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-600" /> {item.formattedDate}
                  </span>
                  <span
                    className={`text-[10px] font-bold capitalize px-2 py-0.5 rounded-md ${
                      item.type === 'waitrose'
                        ? 'bg-emerald-50 text-emerald-700'
                        : item.type === 'ocado'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {item.type}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                  {item.label}
                </h3>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleViewDoc(item)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5" /> View {item.isImage ? 'Photo' : 'Receipt'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

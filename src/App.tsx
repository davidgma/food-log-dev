import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { OverviewSection } from './components/OverviewSection';
import { FoodLogSection } from './components/FoodLogSection';
import { AnalyticsSection } from './components/AnalyticsSection';
import { GroceriesSection } from './components/GroceriesSection';
import { DocumentModal } from './components/DocumentModal';
import {
  fetchDirectoryIndex,
  fetchSingleDaySummary,
  fetchOverviewHtml,
} from './lib/foodDataFetcher';
import { FoodDataState, FoodLogEntry } from './types/foodLog';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function App() {
  const [dataState, setDataState] = useState<FoodDataState>({
    overviewMarkdown: '',
    overviewHtml: '',
    dates: [],
    entriesByDate: {},
    allFiles: [],
    lastFetched: new Date(),
    indexLoaded: false,
    overviewLoaded: false,
    loadedDaysCount: 0,
    statsReady: false,
    loading: true,
    error: null,
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'foodlog' | 'analytics' | 'groceries'>('foodlog');

  const [modalDoc, setModalDoc] = useState<{
    url: string;
    title: string;
    type: 'pdf' | 'image';
  } | null>(null);

  // Cancellation token for streaming queue
  const loadSequenceIdRef = useRef(0);

  const startProgressiveLoad = useCallback(async () => {
    const currentSequenceId = ++loadSequenceIdRef.current;

    setDataState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      loadedDaysCount: 0,
      statsReady: false,
    }));

    // Step 1: Always load overview.md asynchronously directly
    fetchOverviewHtml()
      .then((ov) => {
        if (loadSequenceIdRef.current !== currentSequenceId) return;
        setDataState((prev) => ({
          ...prev,
          overviewMarkdown: ov.markdown,
          overviewHtml: ov.html,
          overviewLoaded: true,
        }));
      })
      .catch((err) => {
        console.warn('Overview load error:', err);
        if (loadSequenceIdRef.current === currentSequenceId) {
          setDataState((prev) => ({
            ...prev,
            overviewHtml: '<p className="text-slate-500 italic">Unable to load theory overview.</p>',
            overviewLoaded: true,
          }));
        }
      });

    try {
      // Step 2: Get directory index & file pointers
      const index = await fetchDirectoryIndex();
      if (loadSequenceIdRef.current !== currentSequenceId) return;

      const dates = index.sortedDates;
      const initialLoadedCount = index.loadedDaysCount || 0;
      const targetStats = Math.min(30, dates.length);
      const isStatsReady = initialLoadedCount >= targetStats;

      setDataState((prev) => ({
        ...prev,
        dates: index.sortedDates,
        entriesByDate: index.initialEntries,
        allFiles: index.allFiles,
        lastFetched: new Date(),
        indexLoaded: true,
        loadedDaysCount: initialLoadedCount,
        statsReady: isStatsReady,
        loading: false,
        error: null,
        ...(index.overviewHtml ? {
          overviewMarkdown: index.overviewMarkdown || prev.overviewMarkdown,
          overviewHtml: index.overviewHtml,
          overviewLoaded: true,
        } : {}),
      }));

      // Check if any dates still need summary loading
      const pendingDates = dates.filter((d) => !index.initialEntries[d]?.summaryLoaded);

      if (pendingDates.length === 0) {
        return;
      }

      // Stream pending summaries in chunks
      const chunkSize = 5;
      for (let i = 0; i < pendingDates.length; i += chunkSize) {
        if (loadSequenceIdRef.current !== currentSequenceId) return;

        const chunk = pendingDates.slice(i, i + chunkSize);
        const chunkPromises = chunk.map(async (date) => {
          const initialEntry = index.initialEntries[date];
          if (!initialEntry) return;

          const updated = await fetchSingleDaySummary(initialEntry);

          if (loadSequenceIdRef.current !== currentSequenceId) return;

          setDataState((prev) => {
            const nextEntries = { ...prev.entriesByDate, [date]: updated };
            const nextCount = Object.values(nextEntries).filter((e: FoodLogEntry) => e.summaryLoaded).length;
            const isReady = nextCount >= targetStats;

            return {
              ...prev,
              entriesByDate: nextEntries,
              loadedDaysCount: nextCount,
              statsReady: isReady,
            };
          });
        });

        await Promise.allSettled(chunkPromises);
      }
    } catch (err: any) {
      console.error('Error during progressive load:', err);
      if (loadSequenceIdRef.current === currentSequenceId) {
        setDataState((prev) => ({
          ...prev,
          loading: false,
          error: err.message || 'Unable to connect to cloud storage.',
        }));
      }
    }
  }, []);

  useEffect(() => {
    startProgressiveLoad();
  }, [startProgressiveLoad]);

  const handleOpenDoc = (url: string, title: string, type: 'pdf' | 'image') => {
    setModalDoc({ url, title, type });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-8">
        {dataState.loading && !dataState.indexLoaded ? (
          <div className="bg-white p-12 md:p-16 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto animate-pulse">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Discovering Cloud Log Index...</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Connecting to cloud storage to index all available food logs and documents.
            </p>
          </div>
        ) : dataState.error ? (
          <div className="bg-red-50 p-8 rounded-2xl border border-red-200 text-red-900 space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
              <h3 className="font-extrabold text-lg">Unable to connect to cloud storage</h3>
            </div>
            <p className="text-sm opacity-90">{dataState.error}</p>
            <button
              onClick={startProgressiveLoad}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'foodlog' && (
              <FoodLogSection
                dates={dataState.dates}
                entriesByDate={dataState.entriesByDate}
                onOpenDoc={handleOpenDoc}
              />
            )}

            {activeTab === 'overview' && (
              <OverviewSection overviewHtml={dataState.overviewHtml} />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsSection
                dates={dataState.dates}
                entriesByDate={dataState.entriesByDate}
                loadedDaysCount={dataState.loadedDaysCount}
                statsReady={dataState.statsReady}
              />
            )}

            {activeTab === 'groceries' && (
              <GroceriesSection
                dates={dataState.dates}
                entriesByDate={dataState.entriesByDate}
                onOpenDoc={handleOpenDoc}
              />
            )}
          </>
        )}
      </main>

      {/* Document Modal */}
      {modalDoc && (
        <DocumentModal
          url={modalDoc.url}
          title={modalDoc.title}
          type={modalDoc.type}
          onClose={() => setModalDoc(null)}
        />
      )}
    </div>
  );
}

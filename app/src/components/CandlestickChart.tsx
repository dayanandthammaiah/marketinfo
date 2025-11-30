import { useEffect, useRef } from 'react';
import { createChart, ColorType, LineSeries, CandlestickSeries, type IChartApi, type ISeriesApi, type CandlestickData } from 'lightweight-charts';
import { TechnicalAnalysis } from '../utils/TechnicalAnalysis';

export type HistoryPoint = { time: any; value: number };
export type OhlcPoint = { time: any; open: number; high: number; low: number; close: number };

interface CandlestickChartProps {
  // Provide either OHLC candles or simple history (we'll synthesize candles from it)
  candles?: OhlcPoint[];
  history?: HistoryPoint[];
  height?: number;
  showSMA?: boolean;
  showEMA?: boolean;
  smaPeriod?: number;
  emaPeriod?: number;
}

export function CandlestickChart({
  candles,
  history,
  height = 300,
  showSMA = true,
  showEMA = true,
  smaPeriod = 20,
  emaPeriod = 50,
}: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  // Helper to synthesize candles from history if OHLC not provided
  const synthesizeCandles = (h: HistoryPoint[]): OhlcPoint[] => {
    if (!h || h.length < 2) return [];
    // Ensure chronological by time if possible (assume ISO date strings)
    const sorted = [...h].sort((a, b) => {
      const ta = typeof a.time === 'string' ? Date.parse(a.time) : (a.time as number);
      const tb = typeof b.time === 'string' ? Date.parse(b.time) : (b.time as number);
      return ta - tb;
    });
    const out: OhlcPoint[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      const open = prev.value;
      const close = curr.value;
      const high = Math.max(open, close);
      const low = Math.min(open, close);
      out.push({ time: curr.time, open, high, low, close });
    }
    return out;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      smaSeriesRef.current = null;
      emaSeriesRef.current = null;
    }

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151',
      },
      width: containerRef.current.clientWidth,
      height,
      grid: {
        vertLines: { color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb' },
        horzLines: { color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb' },
      },
      timeScale: {
        rightOffset: 2,
        fixLeftEdge: true,
        lockVisibleTimeRangeOnResize: true,
      }
    });

    chartRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#16a34a',
      downColor: '#dc2626',
      borderDownColor: '#dc2626',
      borderUpColor: '#16a34a',
      wickDownColor: '#dc2626',
      wickUpColor: '#16a34a',
    });

    const data: OhlcPoint[] = candles && candles.length > 0
      ? candles
      : history
      ? synthesizeCandles(history)
      : [];

    if (data.length > 0) {
      candleSeries.setData(data as CandlestickData[]);
      chart.timeScale().fitContent();

      // Overlays
      const closes = data.map(d => d.close);
      const times = data.map(d => d.time);

      if (showSMA) {
        const sma = TechnicalAnalysis.smaSeries(closes, smaPeriod);
        const smaSeries = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 2 });
        smaSeriesRef.current = smaSeries;
        const smaData = sma.map((v, i) => (v == null ? null : { time: times[i], value: v })).filter(Boolean) as any[];
        smaSeries.setData(smaData);
      }

      if (showEMA) {
        const ema = TechnicalAnalysis.emaSeries(closes, emaPeriod);
        const emaSeries = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 2 });
        emaSeriesRef.current = emaSeries;
        const emaData = ema.map((v, i) => (v == null ? null : { time: times[i], value: v })).filter(Boolean) as any[];
        emaSeries.setData(emaData);
      }
    }

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [candles, history, height, showSMA, showEMA, smaPeriod, emaPeriod]);

  return <div ref={containerRef} className="w-full" style={{ height }} />;
}

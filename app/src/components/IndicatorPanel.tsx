import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, LineSeries, HistogramSeries } from 'lightweight-charts';
import { TechnicalAnalysis } from '../utils/TechnicalAnalysis';

interface IndicatorPanelProps {
  prices: { time: any; value: number }[]; // chronological preferred
}

export function IndicatorPanel({ prices }: IndicatorPanelProps) {
  const [showRSI, setShowRSI] = useState(true);
  const [showMACD, setShowMACD] = useState(true);

  const rsiRef = useRef<HTMLDivElement>(null);
  const macdRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const makeChart = (container: HTMLDivElement | null, height: number) => {
      if (!container) return null;
      return createChart(container, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151',
        },
        width: container.clientWidth,
        height,
        grid: {
          vertLines: { color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb' },
          horzLines: { color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb' },
        },
        rightPriceScale: { borderVisible: false },
        timeScale: { visible: true },
      });
    };

    let rsiChart: any = null;
    let macdChart: any = null;

    const times = prices.map(p => p.time);
    const closeSeries = prices.map(p => p.value);

    if (showRSI && rsiRef.current) {
      rsiChart = makeChart(rsiRef.current, 160);
      const line = rsiChart.addSeries(LineSeries, { color: '#8b5cf6', lineWidth: 2 });
      const rsi = TechnicalAnalysis.rsiSeries(closeSeries, 14);
      const rsiData = rsi.map((v, i) => (v == null ? null : { time: times[i], value: v })).filter(Boolean) as any[];
      line.setData(rsiData);
      // overbought/oversold lines can be drawn with price lines
      line.createPriceLine({ price: 70, color: '#ef4444', lineWidth: 1, axisLabelVisible: true });
      line.createPriceLine({ price: 30, color: '#10b981', lineWidth: 1, axisLabelVisible: true });
      rsiChart.timeScale().fitContent();
    }

    if (showMACD && macdRef.current) {
      macdChart = makeChart(macdRef.current, 160);
      const { macd, signal, histogram } = TechnicalAnalysis.macdSeries(closeSeries);
      const macdLine = macdChart.addSeries(LineSeries, { color: '#06b6d4', lineWidth: 2 });
      const sigLine = macdChart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1 });
      const histSeries = macdChart.addSeries(HistogramSeries, { color: '#60a5fa' });
      macdLine.setData(macd.map((v, i) => (v == null ? null : { time: times[i], value: v })).filter(Boolean) as any[]);
      sigLine.setData(signal.map((v, i) => (v == null ? null : { time: times[i], value: v })).filter(Boolean) as any[]);
      histSeries.setData(histogram.map((v, i) => (v == null ? null : { time: times[i], value: v })).filter(Boolean) as any[]);
      macdChart.timeScale().fitContent();
    }

    const handleResize = () => {
      if (rsiChart && rsiRef.current) rsiChart.applyOptions({ width: rsiRef.current.clientWidth });
      if (macdChart && macdRef.current) macdChart.applyOptions({ width: macdRef.current.clientWidth });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rsiChart) rsiChart.remove();
      if (macdChart) macdChart.remove();
    };
  }, [prices, showRSI, showMACD]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-2">
        <button className={`px-3 py-1 rounded-lg border ${showRSI ? 'bg-primary-600 text-white' : ''}`} onClick={() => setShowRSI(v => !v)}>RSI</button>
        <button className={`px-3 py-1 rounded-lg border ${showMACD ? 'bg-primary-600 text-white' : ''}`} onClick={() => setShowMACD(v => !v)}>MACD</button>
      </div>
      {showRSI && (
        <div className="w-full h-[160px]" ref={rsiRef} />
      )}
      {showMACD && (
        <div className="w-full h-[160px]" ref={macdRef} />
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { DollarSign, TrendingDown, Zap, PieChart, ShieldCheck, Database, Server } from 'lucide-react';

export const CostCalculator: React.FC = () => {
  const [dailyVolume, setDailyVolume] = useState<number>(100); // 100 samples or scenes per day
  const [useSpot, setUseSpot] = useState<boolean>(true);
  const [useIntelligentTiering, setUseIntelligentTiering] = useState<boolean>(true);

  // Financial calculations
  // Monthly volume = dailyVolume * 30
  const monthlyUnits = dailyVolume * 30;

  // On-demand compute cost per unit: ~$0.45 per sample/scene (c6i.4xlarge / g5.xlarge runtime)
  const computeBaseUnit = 0.45;
  const computeCostOnDemand = monthlyUnits * computeBaseUnit;
  const computeCostSpot = computeCostOnDemand * 0.25; // 75% discount
  const actualComputeCost = useSpot ? computeCostSpot : computeCostOnDemand;

  // Storage cost: 5GB per sample/scene.
  const storageGBPerUnit = 5;
  const totalStorageGB = (monthlyUnits * storageGBPerUnit) / 2; // average over month
  const storageStandardRate = 0.023; // per GB-month
  const storageTieringRate = 0.0125; // average blended with Glacier IR
  const actualStorageCost = totalStorageGB * (useIntelligentTiering ? storageTieringRate : storageStandardRate);

  // Athena queries + Serverless: ~$0.02 per unit
  const serverlessQueryCost = monthlyUnits * 0.02;

  // CloudFront edge delivery: ~$0.01 per unit
  const cdnCost = monthlyUnits * 0.01;

  const totalMonthlyCost = actualComputeCost + actualStorageCost + serverlessQueryCost + cdnCost;
  const baselineUnoptimizedCost = computeCostOnDemand + (totalStorageGB * storageStandardRate) + serverlessQueryCost + cdnCost;
  const monthlySavings = Math.max(0, baselineUnoptimizedCost - totalMonthlyCost);
  const savingsPercent = baselineUnoptimizedCost > 0 ? (monthlySavings / baselineUnoptimizedCost) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span className="text-cyan-400 font-mono font-semibold">FINOPS & COST OPTIMIZATION</span>
            <span>·</span>
            <span>Spot Compute Discounts (70-90%)</span>
            <span>·</span>
            <span>Scale-to-Zero Serverless Economics</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Cloud Financial Engineering & Capacity Sizing Calculator
          </h2>
        </div>

        <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 text-right">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Estimated Monthly Savings</span>
          <span className="font-mono text-lg font-bold text-emerald-400">
            ${monthlySavings.toFixed(0)} / mo ({savingsPercent.toFixed(0)}%)
          </span>
        </div>
      </div>

      {/* Interactive Controls & Sizing Slider */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <h3 className="text-sm font-semibold text-white">Workload Sizing Parameters</h3>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-2">
              <span>Daily Processed Volume:</span>
              <span className="font-mono text-cyan-400 font-bold">{dailyVolume} units/day</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={dailyVolume}
              onChange={(e) => setDailyVolume(parseInt(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              = {(monthlyUnits).toLocaleString()} samples / satellite scenes per month
            </span>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-800">
            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span>Enable Spot Compute (75% savings):</span>
              <input
                type="checkbox"
                checked={useSpot}
                onChange={(e) => setUseSpot(e.target.checked)}
                className="accent-cyan-500 w-4 h-4 rounded"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span>S3 Intelligent-Tiering & Glacier IR:</span>
              <input
                type="checkbox"
                checked={useIntelligentTiering}
                onChange={(e) => setUseIntelligentTiering(e.target.checked)}
                className="accent-cyan-500 w-4 h-4 rounded"
              />
            </label>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1.5 text-slate-400">
            <div className="font-semibold text-slate-200">Scale-to-Zero Guarantee</div>
            <p className="text-[11px]">
              When no sequencing files or satellite scenes are arriving, Step Functions and Lambda cost $0.00. Zero EC2 instances run continuously.
            </p>
          </div>
        </div>

        {/* Cost Breakdown Column */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Itemized Monthly Cost Projection</h3>
            <span className="text-xs font-mono text-cyan-400">
              Total: ${totalMonthlyCost.toFixed(2)} USD
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Batch Container Compute</span>
              <span className="font-mono text-base font-bold text-white">${actualComputeCost.toFixed(2)}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{useSpot ? 'Spot Rate (75% off)' : 'On-Demand'}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">S3 / GCS Data Lake</span>
              <span className="font-mono text-base font-bold text-white">${actualStorageCost.toFixed(2)}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{totalStorageGB.toFixed(0)} GB stored</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Athena / BigQuery Queries</span>
              <span className="font-mono text-base font-bold text-white">${serverlessQueryCost.toFixed(2)}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Serverless Columnar</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Edge CloudFront / CDN</span>
              <span className="font-mono text-base font-bold text-white">${cdnCost.toFixed(2)}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Cached Tiles & Web UI</span>
            </div>
          </div>

          {/* Comparison Progress Bar */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Optimized Cloud Architecture:</span>
              <span className="font-mono font-bold text-emerald-400">${totalMonthlyCost.toFixed(2)} / mo</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalMonthlyCost / baselineUnoptimizedCost) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Baseline Without Spot / Lifecycle Rules:</span>
              <span className="line-through text-slate-500 font-mono">${baselineUnoptimizedCost.toFixed(2)} / mo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { useState, useMemo } from 'react';

interface HourEntry {
  date: string;
  hours: number;
  status: 'pending' | 'approved' | 'flagged';
  user_id: string;
}

interface MonthlyHoursChartProps {
  entries: HourEntry[];
}

type ChartType = 'bar' | 'line';
type RangeOption = '6' | '12' | 'all';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function buildMonthlyData(entries: HourEntry[], monthCount: number | null) {
  // Aggregate by month
  const map: Record<string, { approved: number; pending: number; flagged: number; volunteers: Set<string> }> = {};

  entries.forEach((e) => {
    if (!e.date) return;
    const ym = e.date.slice(0, 7);
    if (!map[ym]) map[ym] = { approved: 0, pending: 0, flagged: 0, volunteers: new Set() };
    map[ym][e.status] += Number(e.hours);
    map[ym].volunteers.add(e.user_id);
  });

  const sorted = Object.keys(map).sort();
  const slice = monthCount !== null ? sorted.slice(-monthCount) : sorted;

  return slice.map((ym) => {
    const [y, m] = ym.split('-');
    return {
      month: `${MONTH_NAMES[Number(m) - 1]} ${y}`,
      approved: parseFloat(map[ym].approved.toFixed(1)),
      pending: parseFloat(map[ym].pending.toFixed(1)),
      flagged: parseFloat(map[ym].flagged.toFixed(1)),
      total: parseFloat((map[ym].approved + map[ym].pending + map[ym].flagged).toFixed(1)),
      volunteers: map[ym].volunteers.size,
    };
  });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-4 min-w-[160px]">
      <p className="text-xs font-bold text-gray-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4 text-xs mb-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
            <span className="text-gray-600 capitalize">{p.name}</span>
          </span>
          <span className="font-black text-gray-900">{p.value}h</span>
        </div>
      ))}
    </div>
  );
}

export default function MonthlyHoursChart({ entries }: MonthlyHoursChartProps) {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [range, setRange] = useState<RangeOption>('12');
  const [showPending, setShowPending] = useState(true);
  const [showFlagged, setShowFlagged] = useState(false);

  const monthCount = range === 'all' ? null : Number(range);
  const data = useMemo(() => buildMonthlyData(entries, monthCount), [entries, monthCount]);

  const totalApproved = useMemo(
    () => data.reduce((s, d) => s + d.approved, 0),
    [data]
  );
  const peakMonth = useMemo(
    () => data.reduce((best, d) => (d.approved > (best?.approved ?? -1) ? d : best), data[0] ?? null),
    [data]
  );
  const avgMonthly = data.length > 0 ? parseFloat((totalApproved / data.length).toFixed(1)) : 0;

  const isEmpty = data.length === 0;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-bar-chart-2-fill text-yellow-500 text-base"></i>
            </div>
            Monthly Hours Activity
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 ml-8">Running summary of volunteer hours by month</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Range selector */}
          <div className="flex items-center bg-gray-100 rounded-full p-1 gap-0.5">
            {(['6', '12', 'all'] as RangeOption[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  range === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {r === 'all' ? 'All' : `${r}mo`}
              </button>
            ))}
          </div>

          {/* Chart type toggle */}
          <div className="flex items-center bg-gray-100 rounded-full p-1 gap-0.5">
            <button
              onClick={() => setChartType('bar')}
              className={`w-8 h-7 flex items-center justify-center rounded-full text-xs transition-all cursor-pointer ${
                chartType === 'bar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Bar chart"
            >
              <i className="ri-bar-chart-2-line text-sm"></i>
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`w-8 h-7 flex items-center justify-center rounded-full text-xs transition-all cursor-pointer ${
                chartType === 'line' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Line chart"
            >
              <i className="ri-line-chart-line text-sm"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Summary pills */}
      {!isEmpty && (
        <div className="flex flex-wrap gap-2 mb-5">
          <div className="flex items-center gap-1.5 bg-lime-50 border border-lime-200 text-lime-700 px-3 py-1.5 rounded-full text-xs font-bold">
            <i className="ri-check-line"></i>
            {totalApproved}h approved
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full text-xs font-bold">
            <i className="ri-calendar-line"></i>
            {avgMonthly}h avg / month
          </div>
          {peakMonth && (
            <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-1.5 rounded-full text-xs font-bold">
              <i className="ri-trophy-line"></i>
              Peak: {peakMonth.month} ({peakMonth.approved}h)
            </div>
          )}
        </div>
      )}

      {/* Series toggles */}
      {!isEmpty && (
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="text-xs text-gray-400 font-semibold">Show:</span>
          <button
            onClick={() => setShowPending((v) => !v)}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border transition-all cursor-pointer whitespace-nowrap ${
              showPending
                ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                : 'bg-gray-50 border-gray-200 text-gray-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0"></span>
            Pending
          </button>
          <button
            onClick={() => setShowFlagged((v) => !v)}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border transition-all cursor-pointer whitespace-nowrap ${
              showFlagged
                ? 'bg-red-50 border-red-300 text-red-600'
                : 'bg-gray-50 border-gray-200 text-gray-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"></span>
            Flagged
          </button>
        </div>
      )}

      {/* Chart */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <i className="ri-bar-chart-2-line text-3xl"></i>
          </div>
          <p className="font-bold text-gray-500 text-sm">No data yet</p>
          <p className="text-xs mt-1">Hours will appear here once entries are logged.</p>
        </div>
      ) : (
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={data} barCategoryGap="30%" barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}h`}
                  width={36}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: 12 }}
                />
                <Bar dataKey="approved" name="Approved" fill="#84cc16" radius={[4, 4, 0, 0]} />
                {showPending && (
                  <Bar dataKey="pending" name="Pending" fill="#facc15" radius={[4, 4, 0, 0]} />
                )}
                {showFlagged && (
                  <Bar dataKey="flagged" name="Flagged" fill="#f87171" radius={[4, 4, 0, 0]} />
                )}
              </BarChart>
            ) : (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}h`}
                  width={36}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="approved"
                  name="Approved"
                  stroke="#84cc16"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#84cc16', strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
                {showPending && (
                  <Line
                    type="monotone"
                    dataKey="pending"
                    name="Pending"
                    stroke="#facc15"
                    strokeWidth={2}
                    strokeDasharray="5 3"
                    dot={{ r: 3, fill: '#facc15', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                )}
                {showFlagged && (
                  <Line
                    type="monotone"
                    dataKey="flagged"
                    name="Flagged"
                    stroke="#f87171"
                    strokeWidth={2}
                    strokeDasharray="5 3"
                    dot={{ r: 3, fill: '#f87171', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

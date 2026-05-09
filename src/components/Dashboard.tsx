import { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { DollarSign, TrendingUp, ShoppingCart, Activity } from 'lucide-react';
import { CostingReport } from '../types';

interface DashboardProps {
  reports: CostingReport[];
}

export default function Dashboard({ reports }: DashboardProps) {
  const chartData = useMemo(() => {
    // Sort chronologically
    const sorted = [...reports].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Process grouping by date, simplifying for this mock
    const data = sorted.map(r => ({
      name: format(parseISO(r.date), 'MMM dd'),
      sales: r.sellingPrice,
      profit: r.profitAmount,
      cost: r.totalCost,
      title: r.title
    }));
    return data;
  }, [reports]);

  const summary = useMemo(() => {
    return reports.reduce(
      (acc, r) => ({
        sales: acc.sales + r.sellingPrice,
        profit: acc.profit + r.profitAmount,
        cost: acc.cost + r.totalCost,
        events: acc.events + 1
      }),
      { sales: 0, profit: 0, cost: 0, events: 0 }
    );
  }, [reports]);

  const avgMargin = summary.sales > 0 ? (summary.profit / summary.sales) * 100 : 0;

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Activity className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Not enough data</h2>
        <p className="text-gray-500 max-w-sm">Create some costed reports to see your financial analytics here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Financial Overview</h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mr-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase">Total Expected Sales</p>
            <p className="text-2xl font-bold text-slate-800">RM {summary.sales.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg mr-4">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase">Total Est. Profit</p>
            <p className="text-2xl font-bold text-slate-800">RM {summary.profit.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg mr-4">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase">Total Costs</p>
            <p className="text-2xl font-bold text-slate-800">RM {summary.cost.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg mr-4">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase">Avg Profit Margin</p>
            <p className="text-2xl font-bold text-slate-800">{avgMargin.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">Sales vs Profit Trend</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} tickFormatter={(val) => `RM${val}`} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '20px'}} />
                <Line type="monotone" name="Sales (RM)" dataKey="sales" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                <Line type="monotone" name="Profit (RM)" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">Cost Breakdown by Event</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="title" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} 
                       tickFormatter={(value) => value.length > 10 ? value.substring(0, 10) + '...' : value} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} tickFormatter={(val) => `RM${val}`} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  cursor={{fill: '#f1f5f9'}}
                />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '20px'}} />
                <Bar name="Cost Context (RM)" dataKey="cost" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

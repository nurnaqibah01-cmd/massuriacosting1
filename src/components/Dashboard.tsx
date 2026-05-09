import { useMemo, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import { format, parseISO, getMonth, getYear } from 'date-fns';
import { DollarSign, TrendingUp, ShoppingCart, Activity, Printer, Eye, X } from 'lucide-react';
import { CostingReport } from '../types';

interface DashboardProps {
  reports: CostingReport[];
}

export default function Dashboard({ reports }: DashboardProps) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [viewingReport, setViewingReport] = useState<CostingReport | null>(null);

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const date = parseISO(r.eventDate || r.date);
      const m = getMonth(date);
      const y = getYear(date);
      
      const matchYear = y === selectedYear;
      const matchMonth = selectedMonth === 'all' || m === selectedMonth;
      
      return matchYear && matchMonth;
    });
  }, [reports, selectedMonth, selectedYear]);

  const chartData = useMemo(() => {
    // Sort chronologically
    const sorted = [...filteredReports].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Process grouping by date, simplifying for this mock
    const data = sorted.map(r => ({
      name: format(parseISO(r.eventDate || r.date), 'MMM dd'),
      sales: r.sellingPrice,
      profit: r.profitAmount,
      cost: r.totalCost,
      title: r.title
    }));
    return data;
  }, [filteredReports]);

  const summary = useMemo(() => {
    return filteredReports.reduce(
      (acc, r) => ({
        sales: acc.sales + r.sellingPrice,
        profit: acc.profit + r.profitAmount,
        cost: acc.cost + r.totalCost,
        events: acc.events + 1
      }),
      { sales: 0, profit: 0, cost: 0, events: 0 }
    );
  }, [filteredReports]);

  const avgMargin = summary.sales > 0 ? (summary.profit / summary.sales) * 100 : 0;

  // Render the modal for report viewing and printing
  if (viewingReport) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden min-h-screen">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 print:hidden sticky top-0 z-10">
          <button 
            onClick={() => setViewingReport(null)}
            className="text-slate-600 hover:text-slate-900 flex items-center font-medium"
          >
            <X className="w-5 h-5 mr-1" /> Close
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print PDF
          </button>
        </div>
        
        <div className="p-8 max-w-4xl mx-auto space-y-8 bg-white" id="printable-report">
          <div className="text-center border-b pb-8 border-slate-200">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Costing Report</h1>
            <p className="text-slate-500 uppercase tracking-widest text-sm font-bold">Mas Suria Catering</p>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Event Details</h3>
              <p className="text-lg font-bold text-slate-800">{viewingReport.title}</p>
              <p className="text-slate-600 mt-1">Date: {viewingReport.eventDate ? format(parseISO(viewingReport.eventDate), "MMMM dd, yyyy") : 'N/A'}</p>
              <p className="text-slate-600">Pax: {viewingReport.pax}</p>
              {viewingReport.days && viewingReport.days > 1 && <p className="text-slate-600">Days: {viewingReport.days}</p>}
            </div>
            {(viewingReport.customerName || viewingReport.customerAddress) && (
              <div className="text-right">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Client Information</h3>
                {viewingReport.customerName && <p className="text-lg font-bold text-slate-800">{viewingReport.customerName}</p>}
                {viewingReport.customerContact && <p className="text-slate-600 mt-1">{viewingReport.customerContact}</p>}
                {viewingReport.customerAddress && <p className="text-slate-600">{viewingReport.customerAddress}</p>}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 border-b border-slate-200 pb-2">Financial Summary</h3>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div>
                <p className="text-slate-500 mb-1 text-sm font-medium">Selling Price</p>
                <p className="font-bold text-slate-800 text-xl">RM {viewingReport.sellingPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1 text-sm font-medium">Total Cost</p>
                <p className="font-bold text-slate-800 text-xl">RM {viewingReport.totalCost.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1 text-sm font-medium">Estimated Profit</p>
                <p className="font-bold text-emerald-600 text-xl">RM {viewingReport.profitAmount.toFixed(2)} ({viewingReport.profitMarginPercent}%)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
             <div>
                <p className="text-slate-500 mb-1 text-sm font-medium">Materials</p>
                <p className="font-bold text-slate-700">RM {viewingReport.totalMaterialCost.toFixed(2)}</p>
             </div>
             <div>
                <p className="text-slate-500 mb-1 text-sm font-medium">Labour</p>
                <p className="font-bold text-slate-700">RM {viewingReport.labourCost.toFixed(2)}</p>
             </div>
             <div>
                <p className="text-slate-500 mb-1 text-sm font-medium">Overhead</p>
                <p className="font-bold text-slate-700">RM {viewingReport.overheadCost.toFixed(2)}</p>
             </div>
          </div>
        </div>
      </div>
    );
  }

  const allYears = Array.from(new Set(reports.map(r => getYear(parseISO(r.eventDate || r.date))))).sort((a,b) => b-a);
  if (allYears.length === 0) allYears.push(currentYear);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Financial Overview</h1>
        
        <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1 print:hidden">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
            className="bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer pl-3 pr-8 py-1.5"
          >
            <option value="all">All Months</option>
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i}>
                {format(new Date(2000, i, 1), 'MMMM')}
              </option>
            ))}
          </select>
          <div className="w-px bg-slate-200 mx-1 my-1"></div>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer pl-3 pr-8 py-1.5"
          >
            {allYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
      
      {filteredReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-white rounded-2xl border border-slate-200 shadow-sm print:hidden">
          <Activity className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No exactly matched reports</h2>
          <p className="text-gray-500 max-w-sm">No recorded reports for the selected filters.</p>
        </div>
      ) : (
        <>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
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
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6 print:hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Filtered Reports</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 uppercase text-[10px] tracking-wider text-slate-500 font-bold bg-slate-50/50">
                    <th className="px-6 py-4">Event Date</th>
                    <th className="px-6 py-4">Title / Client</th>
                    <th className="px-6 py-4 text-right">Sales</th>
                    <th className="px-6 py-4 text-right">Cost</th>
                    <th className="px-6 py-4 text-right">Profit</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredReports.map((r) => (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                        {r.eventDate ? format(parseISO(r.eventDate), 'MMM dd, yyyy') : format(parseISO(r.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{r.title}</p>
                        {r.customerName && <p className="text-xs text-slate-500 mt-0.5">{r.customerName}</p>}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-800">
                        RM {r.sellingPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-600">
                        RM {r.totalCost.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-600">
                        RM {r.profitAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setViewingReport(r)}
                          className="inline-flex items-center justify-center p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View & Print PDF"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


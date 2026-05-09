import { format } from 'date-fns';
import { Trash2, TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react';
import { CostingReport } from '../types';

interface ReportsListProps {
  reports: CostingReport[];
  onDelete: (id: string) => void;
}

export default function ReportsList({ reports, onDelete }: ReportsListProps) {
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">No reports yet</h2>
        <p className="text-slate-500 max-w-sm">Create your first cost breakdown in the Cost Calculator to see it appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Saved Reports</h1>
        <button 
            onClick={() => window.print()}
            className="bg-transparent border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm print:hidden"
          >
            Export All to PDF
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {reports.map(report => (
          <div key={report.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-slate-800 line-clamp-1" title={report.title}>
                  {report.title} 
                  {report.pax ? <span className="text-emerald-600 text-sm ml-1 font-semibold">({report.pax} Pax)</span> : null}
                  {report.days && report.days > 1 ? <span className="text-indigo-600 text-sm ml-1 font-semibold">({report.days} Days)</span> : null}
                </h3>
                {report.customerName && <p className="text-sm font-medium text-slate-600 mt-1 line-clamp-1">{report.customerName}</p>}
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {report.eventDate ? format(new Date(report.eventDate), "MMM dd, yyyy") + ' · ' : ''}
                  Saved {format(new Date(report.date), "MMM dd, yyyy")}
                </p>
              </div>
              <button 
                onClick={() => {
                  if (confirm('Are you sure you want to delete this report?')) onDelete(report.id);
                }}
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 mb-1 text-xs font-bold uppercase">Total Base Cost</p>
                  <p className="font-bold text-slate-800">RM {report.totalCost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1 text-xs font-bold uppercase">Margin</p>
                  <div className="flex items-center text-emerald-600 font-bold">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {report.profitMarginPercent}%
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-xs border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Materials:</span>
                  <span className="font-bold text-slate-700">RM {report.totalMaterialCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Labour:</span>
                  <span className="font-bold text-slate-700">RM {report.labourCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Overhead:</span>
                  <span className="font-bold text-slate-700">RM {report.overheadCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-5 border-t border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Selling Price</p>
                <p className="font-black text-slate-800 text-lg">RM {report.sellingPrice.toFixed(2)}</p>
                {report.pax && (
                  <p className="text-[10px] text-slate-500 mt-0.5 font-bold">RM {(report.sellingPrice / (report.pax || 1)).toFixed(2)} / PAX</p>
                )}
                {report.days && report.days > 1 && (
                  <p className="text-[10px] text-slate-500 mt-0.5 font-bold">RM {(report.sellingPrice / (report.days || 1)).toFixed(2)} / DAY</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Profit Est.</p>
                <p className="font-bold text-emerald-600 text-lg">RM {report.profitAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

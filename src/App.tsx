import { useState } from 'react';
import { 
  BarChart3, 
  Calculator, 
  FileText, 
  Sparkles,
  ChefHat,
  LogOut
} from 'lucide-react';
import { useReports } from './store';
import Dashboard from './components/Dashboard';
import CostCalculator from './components/CostCalculator';
import ReportsList from './components/ReportsList';
import AIAdvisor from './components/AIAdvisor';
import Login from './components/Login';

type Tab = 'dashboard' | 'calculator' | 'reports' | 'ai';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  
  const { reports, addReport, deleteReport } = useReports();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'calculator', label: 'Cost Calculator', icon: Calculator },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'ai', label: 'AI Advisor', icon: Sparkles },
  ];

  if (!isLoggedIn) {
    return <Login onLogin={(name) => { setUserName(name); setIsLoggedIn(true); }} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex-col hidden md:flex print:hidden">
        <div className="p-6 flex items-center gap-3 flex-shrink-0 border-b border-slate-800">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
            <ChefHat className="w-5 h-5" />
          </div>
          <span className="font-bold text-white tracking-tight">Mas Suria Costing</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                  isActive 
                    ? 'bg-slate-800 text-white' 
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 opacity-70`} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-6 mt-auto border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold uppercase">
              {userName.charAt(0)}
            </div>
            <div className="text-sm text-left flex-1">
              <p className="text-white font-medium capitalize truncate" title={userName}>{userName}</p>
              <p className="text-xs opacity-50">Mas Suria Catering</p>
            </div>
          </div>
          <button 
            onClick={() => setIsLoggedIn(false)}
            className="mt-4 w-full flex items-center justify-center py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
              <ChefHat className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-slate-800">Mas Suria</span>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as Tab)}
              className="border-slate-200 rounded-md text-sm pl-3 py-1.5 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50"
            >
              {navItems.map(item => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
            <button onClick={() => setIsLoggedIn(false)} className="text-slate-400 hover:text-slate-700 p-1">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 print:p-0 print:overflow-visible">
          <div className="max-w-6xl mx-auto h-full">
            {activeTab === 'dashboard' && <Dashboard reports={reports} />}
            {activeTab === 'calculator' && (
              <CostCalculator 
                onSave={(report) => {
                  addReport(report);
                  setActiveTab('reports');
                }} 
              />
            )}
            {activeTab === 'reports' && (
              <ReportsList reports={reports} onDelete={deleteReport} />
            )}
            {activeTab === 'ai' && <AIAdvisor />}
          </div>
        </div>
      </main>
    </div>
  );
}

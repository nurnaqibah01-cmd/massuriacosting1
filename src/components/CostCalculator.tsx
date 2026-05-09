import { useState, useMemo } from 'react';
import { Plus, Trash2, Save, Calculator as CalcIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { getDaysInMonth } from 'date-fns';
import { CostingReport, MaterialItem, Menu, LabourItem, OverheadItem } from '../types';

interface CostCalculatorProps {
  initialReport?: CostingReport;
  onSave: (report: CostingReport) => void;
}

export default function CostCalculator({ initialReport, onSave }: CostCalculatorProps) {
  const [title, setTitle] = useState(initialReport?.title || '');
  const [customerName, setCustomerName] = useState(initialReport?.customerName || '');
  const [customerContact, setCustomerContact] = useState(initialReport?.customerContact || '');
  const [customerAddress, setCustomerAddress] = useState(initialReport?.customerAddress || '');
  const [pax, setPax] = useState<number>(initialReport?.pax || 100);
  const [eventDate, setEventDate] = useState(initialReport?.eventDate || '');
  
  const daysInMonth = useMemo(() => {
    if (!eventDate) return 30;
    try {
      return getDaysInMonth(new Date(eventDate));
    } catch (e) {
      return 30;
    }
  }, [eventDate]);
  
  const [menus, setMenus] = useState<Menu[]>(() => {
    if (initialReport?.menus && initialReport.menus.length > 0) {
      return initialReport.menus;
    }
    if (initialReport?.materials && initialReport.materials.length > 0) {
      // Create a default menu for legacy materials
      return [{ id: uuidv4(), name: 'Main Course', materials: initialReport.materials }];
    }
    return [
      { id: uuidv4(), name: 'Main Course', materials: [{ id: uuidv4(), name: '', quantity: 1, unit: 'kg', cost: 0 }] }
    ];
  });
  
  const [labourItems, setLabourItems] = useState<LabourItem[]>(initialReport?.labourItems || [
    { id: uuidv4(), role: '', staffCount: 1, hours: 1, ratePerHour: 0 }
  ]);
  
  const [overheadItems, setOverheadItems] = useState<OverheadItem[]>(initialReport?.overheadItems || [
    { id: uuidv4(), name: '', cost: 0, days: 1 }
  ]);

  const [profitMarginPercent, setProfitMarginPercent] = useState<number>(initialReport?.profitMarginPercent || 35);

  const addMenu = () => {
    setMenus([...menus, { id: uuidv4(), name: '', materials: [] }]);
  };

  const updateMenuName = (id: string, name: string) => {
    setMenus(menus.map(m => m.id === id ? { ...m, name } : m));
  };

  const removeMenu = (id: string) => {
    setMenus(menus.filter(m => m.id !== id));
  };

  const addMaterial = (menuId: string) => {
    setMenus(menus.map(m => m.id === menuId ? {
      ...m, materials: [...m.materials, { id: uuidv4(), name: '', quantity: 1, unit: 'kg', cost: 0 }]
    } : m));
  };

  const updateMaterial = (menuId: string, matId: string, field: keyof MaterialItem, value: any) => {
    setMenus(menus.map(m => m.id === menuId ? {
      ...m, materials: m.materials.map(mat => mat.id === matId ? { ...mat, [field]: value } : mat)
    } : m));
  };

  const removeMaterial = (menuId: string, matId: string) => {
    setMenus(menus.map(m => m.id === menuId ? {
      ...m, materials: m.materials.filter(mat => mat.id !== matId)
    } : m));
  };

  const addLabour = () => setLabourItems([...labourItems, { id: uuidv4(), role: '', staffCount: 1, hours: 1, ratePerHour: 0 }]);
  const updateLabour = (id: string, field: keyof LabourItem, value: any) => {
    setLabourItems(labourItems.map(l => l.id === id ? { ...l, [field]: value } : l));
  };
  const removeLabour = (id: string) => setLabourItems(labourItems.filter(l => l.id !== id));

  const addOverhead = () => setOverheadItems([...overheadItems, { id: uuidv4(), name: '', cost: 0, days: 1 }]);
  const updateOverhead = (id: string, field: keyof OverheadItem, value: any) => {
    setOverheadItems(overheadItems.map(o => o.id === id ? { ...o, [field]: value } : o));
  };
  const removeOverhead = (id: string) => setOverheadItems(overheadItems.filter(o => o.id !== id));

  const totalMaterialCost = useMemo(() => {
    return menus.reduce((sum, menu) => sum + menu.materials.reduce((mSum, mat) => mSum + (mat.cost || 0), 0), 0);
  }, [menus]);

  const labourCost = useMemo(() => {
    return labourItems.reduce((sum, lab) => sum + ((lab.staffCount || 0) * (lab.hours || 0) * (lab.ratePerHour || 0)), 0);
  }, [labourItems]);

  const overheadCost = useMemo(() => {
    return overheadItems.reduce((sum, ov) => sum + ((ov.cost || 0) * ((ov.days || 0) / daysInMonth)), 0);
  }, [overheadItems, daysInMonth]);

  const totalCost = totalMaterialCost + labourCost + overheadCost;
  const profitAmount = totalCost * (profitMarginPercent / 100);
  const sellingPrice = totalCost + profitAmount;

  const handleSave = () => {
    if (!title.trim()) {
      alert("Please enter a title for this costing report.");
      return;
    }
    
    // Flat map materials for legacy structure compatibility
    const allMaterials = menus.flatMap(m => m.materials);
    
    const report: CostingReport = {
      id: initialReport?.id || uuidv4(),
      title,
      customerName,
      customerContact,
      customerAddress,
      pax,
      eventDate,
      days: daysInMonth,
      date: initialReport?.date || new Date().toISOString(),
      materials: allMaterials,
      menus,
      labourItems,
      overheadItems,
      totalMaterialCost,
      labourCost,
      overheadCost,
      totalCost,
      profitMarginPercent,
      profitAmount,
      sellingPrice
    };
    
    onSave(report);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          {initialReport ? 'Edit Costing' : 'Cost Calculator'}
        </h1>
        <div className="flex items-center gap-3 print:hidden">
          <button 
            onClick={() => window.print()}
            className="bg-transparent border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
          >
            Export PDF
          </button>
          <button 
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-2">Event & Customer Details</h2>
            
            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
              <div className="flex-1 min-w-[240px]">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Report Title / Event Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Wedding Catering" 
                  className="w-full pl-4 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:border-emerald-500 focus:ring-emerald-500"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-40">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Event Date</label>
                <input 
                  type="date" 
                  className="w-full pl-4 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:border-emerald-500 focus:ring-emerald-500 text-slate-700"
                  value={eventDate}
                  onChange={e => setEventDate(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-24">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Total Pax</label>
                <input 
                  type="number" 
                  min="1"
                  className="w-full pl-4 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:border-emerald-500 focus:ring-emerald-500 text-right"
                  value={pax || ''}
                  onChange={e => setPax(parseInt(e.target.value, 10))}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-2">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Customer Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. John Doe" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:border-emerald-500 focus:ring-emerald-500 text-slate-700"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Contact Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. 012-3456789" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:border-emerald-500 focus:ring-emerald-500 text-slate-700"
                  value={customerContact}
                  onChange={e => setCustomerContact(e.target.value)}
                />
              </div>
            </div>

            <div className="w-full mt-2">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Event Address</label>
              <textarea 
                placeholder="Full address of the event location..." 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:border-emerald-500 focus:ring-emerald-500 text-slate-700 resize-none h-20"
                value={customerAddress}
                onChange={e => setCustomerAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">Ingredients</h2>
              <button 
                onClick={addMenu}
                className="text-emerald-500 hover:text-emerald-700 text-sm font-bold flex items-center uppercase tracking-wide"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Menu
              </button>
            </div>
            
            <div className="space-y-8">
              {menus.map((menu, menuIndex) => (
                <div key={menu.id} className="bg-slate-50/50 p-4 sm:p-5 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200">
                    <input 
                      type="text" 
                      placeholder="Menu Name (e.g. Nasi Minyak)"
                      className="bg-transparent border-none focus:ring-0 text-slate-800 font-bold text-lg p-0 placeholder-slate-400 w-full"
                      value={menu.name}
                      onChange={e => updateMenuName(menu.id, e.target.value)}
                    />
                    <button 
                      onClick={() => removeMenu(menu.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                      title="Remove Menu"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {menu.materials.map((item, index) => (
                      <div key={item.id} className="flex flex-wrap sm:flex-nowrap gap-3 items-end">
                        <div className="flex-1 min-w-[200px]">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Item Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Chicken"
                            className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm font-medium shadow-sm"
                            value={item.name}
                            onChange={e => updateMaterial(menu.id, item.id, 'name', e.target.value)}
                          />
                        </div>
                        <div className="w-20">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Qty</label>
                          <input 
                            type="number" 
                            min="0"
                            className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-right focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm font-medium shadow-sm"
                            value={item.quantity || ''}
                            onChange={e => updateMaterial(menu.id, item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="w-20">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Unit</label>
                          <input 
                            type="text" 
                            className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm font-medium shadow-sm"
                            value={item.unit}
                            onChange={e => updateMaterial(menu.id, item.id, 'unit', e.target.value)}
                          />
                        </div>
                        <div className="w-28 text-right">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Cost (RM)</label>
                          <input 
                            type="number" 
                            min="0"
                            className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-right focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm font-medium shadow-sm"
                            value={item.cost || ''}
                            onChange={e => updateMaterial(menu.id, item.id, 'cost', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <button 
                          onClick={() => removeMaterial(menu.id, item.id)}
                          className="p-2 text-slate-400 hover:text-red-500 mb-[2px]"
                          title="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => addMaterial(menu.id)}
                      className="text-emerald-600 hover:text-emerald-800 text-xs font-bold flex items-center mt-3 uppercase tracking-wide"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add Ingredient
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-xs">Total Ingredients Cost</span>
              <span className="font-semibold text-slate-900 text-lg">RM {totalMaterialCost.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">Labor Cost</h2>
              <button 
                onClick={addLabour}
                className="text-emerald-500 hover:text-emerald-700 text-sm font-bold flex items-center uppercase tracking-wide"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Labor
              </button>
            </div>
            
            <div className="space-y-3">
              {labourItems.map(item => (
                <div key={item.id} className="flex flex-wrap sm:flex-nowrap gap-3 items-end">
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Role</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Head Chef"
                      className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm font-medium"
                      value={item.role}
                      onChange={e => updateLabour(item.id, 'role', e.target.value)}
                    />
                  </div>
                  <div className="w-20">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Staff Count</label>
                    <input 
                      type="number" 
                      min="0"
                      className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-right focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm font-medium"
                      value={item.staffCount || ''}
                      onChange={e => updateLabour(item.id, 'staffCount', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="w-20">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Hours</label>
                    <input 
                      type="number" 
                      min="0"
                      className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-right focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm font-medium"
                      value={item.hours || ''}
                      onChange={e => updateLabour(item.id, 'hours', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="w-28">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Rate/Hr (RM)</label>
                    <input 
                      type="number" 
                      min="0"
                      className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-right focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm font-medium"
                      value={item.ratePerHour || ''}
                      onChange={e => updateLabour(item.id, 'ratePerHour', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <button 
                    onClick={() => removeLabour(item.id)}
                    className="p-2 text-slate-400 hover:text-red-500 mb-[2px]"
                    title="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center text-sm">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-xs">Total Labor Cost</span>
              <span className="font-semibold text-slate-900 text-lg">RM {labourCost.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">Overheads</h2>
              <button 
                onClick={addOverhead}
                className="text-emerald-500 hover:text-emerald-700 text-sm font-bold flex items-center uppercase tracking-wide"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Overhead
              </button>
            </div>
            
            <div className="space-y-3">
              {overheadItems.map(item => (
                <div key={item.id} className="flex flex-wrap sm:flex-nowrap gap-3 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Transportation, Utilities"
                      className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm font-medium"
                      value={item.name}
                      onChange={e => updateOverhead(item.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="w-28">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Cost (RM)</label>
                    <input 
                      type="number" 
                      min="0"
                      className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-right focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm font-medium"
                      value={item.cost || ''}
                      onChange={e => updateOverhead(item.id, 'cost', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Days</label>
                    <input 
                      type="number" 
                      min="0"
                      className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-right focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm font-medium"
                      value={item.days || ''}
                      onChange={e => updateOverhead(item.id, 'days', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="w-28 text-right hidden lg:block">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Total (RM)</label>
                    <p className="text-sm font-bold text-slate-700 mt-2.5 pt-1">RM {((item.cost || 0) * ((item.days || 0) / daysInMonth)).toFixed(2)}</p>
                  </div>
                  <button 
                    onClick={() => removeOverhead(item.id)}
                    className="p-2 text-slate-400 hover:text-red-500 mb-[2px] ml-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center text-sm">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-xs">Total Overhead Cost</span>
              <span className="font-semibold text-slate-900 text-lg">RM {overheadCost.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 rounded-2xl shadow-xl p-8 text-white sticky top-6">
            
            <div className="mb-6 space-y-1">
              {title && <h2 className="text-xl font-bold text-white mb-2">{title}</h2>}
              {customerName && <p className="text-sm text-slate-300"><span className="text-slate-500 mr-2">Client:</span>{customerName}</p>}
              {customerContact && <p className="text-sm text-slate-300"><span className="text-slate-500 mr-2">Contact:</span>{customerContact}</p>}
              {customerAddress && <p className="text-sm text-slate-300"><span className="text-slate-500 mr-2">Address:</span>{customerAddress}</p>}
              {eventDate && <p className="text-sm text-slate-300"><span className="text-slate-500 mr-2">Date:</span>{eventDate}</p>}
              <p className="text-sm text-slate-300"><span className="text-slate-500 mr-2">Pax:</span>{pax}</p>
            </div>

            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6 pt-6 border-t border-slate-800">Menu Breakdown</h3>
            
            <div className="space-y-4 mb-6">
              {menus.map((menu, index) => {
                const subTotal = menu.materials.reduce((s, m) => s + (m.cost || 0), 0);
                return (
                  <div key={menu.id} className="flex justify-between items-center text-slate-300">
                    <span className="text-sm line-clamp-1 break-all" title={menu.name || `Menu ${index + 1}`}>{menu.name || `Menu ${index + 1}`}</span>
                    <span className="font-medium text-white shadow-none">RM {subTotal.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6 pt-6 border-t border-slate-800">Total Calculation</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-sm">Total Ingredient Cost</span>
                <span className="font-medium text-white">RM {totalMaterialCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-sm">Total Labor Cost</span>
                <span className="font-medium text-white">RM {labourCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-sm">Total Overhead Cost</span>
                <span className="font-medium text-white">RM {overheadCost.toFixed(2)}</span>
              </div>
              <div className="h-px bg-slate-800 my-2"></div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-slate-400">Base Production Cost</span>
                <span className="font-medium text-white">RM {totalCost.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Profit Margin (%)</label>
              <div className="flex items-center justify-between mb-4">
                <input 
                  type="range" 
                  min="0" max="100" 
                  className="w-full mr-4 accent-emerald-500"
                  value={profitMarginPercent}
                  onChange={e => setProfitMarginPercent(parseInt(e.target.value, 10))}
                />
                <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2 py-1">
                 <input 
                    type="number" 
                    className="w-12 text-right bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-emerald-400"
                    value={profitMarginPercent}
                    onChange={e => setProfitMarginPercent(parseInt(e.target.value, 10))}
                  />
                  <span className="text-slate-400 ml-1 text-sm font-bold">%</span>
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <div className="flex flex-col">
                  <span className="text-slate-500 text-xs font-bold uppercase mb-1">Target Profit</span>
                  <span className="font-bold text-emerald-400 text-lg">RM {profitAmount.toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500 text-xs font-bold uppercase mb-1">Final Selling Price</span>
                  <span className="text-4xl font-bold tracking-tighter text-white">RM {sellingPrice.toFixed(2)}</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 mt-2 space-y-3">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Unit Pricing</p>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-700/50">
                    <span className="text-lg font-bold text-slate-300">RM {(totalCost / (pax || 1)).toFixed(2)}</span>
                    <span className="text-xs text-slate-400">Cost Per Unit ({pax || 1} pax)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-white">RM {(sellingPrice / (pax || 1)).toFixed(2)}</span>
                    <span className="text-xs text-slate-400">Selling Price Per Unit</span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}

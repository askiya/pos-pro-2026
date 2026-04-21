"use client";
import { useState, useEffect } from "react";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
  _count: { orders: number };
}

export default function CRMPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const fetchCustomers = async () => {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`/api/customers${q}`);
    if (res.ok) setCustomers(await res.json());
  };

  useEffect(() => { fetchCustomers(); }, [search]);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setSaving(false);
    if (res.ok) {
      setIsAddOpen(false);
      setFormData({ name: '', email: '', phone: '' });
      fetchCustomers();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };
  return (
    <ResponsiveLayout>
      {/* Add Customer Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-xl">
            <div className="px-6 py-4 border-b border-surface-container flex justify-between items-center">
              <h2 className="font-headline font-bold text-lg text-on-surface">Add New Customer</h2>
              <button onClick={() => setIsAddOpen(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleAddCustomer} className="p-6 flex flex-col gap-4">
              {(['name', 'email', 'phone'] as const).map(field => (
                <div key={field} className="flex flex-col gap-1.5">
                  <label className="font-label text-xs font-semibold text-on-surface-variant uppercase">{field}{field === 'name' ? ' *' : ''}</label>
                  <input
                    required={field === 'name'}
                    value={formData[field]}
                    onChange={e => setFormData({...formData, [field]: e.target.value})}
                    className="px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm outline-none focus:ring-1 focus:ring-secondary"
                    placeholder={field === 'name' ? 'Full Name' : field === 'email' ? 'email@example.com' : field === 'phone' ? '+62 8xx-xxxx' : 'Full Address'}
                  />
                </div>
              ))}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container rounded-lg">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2 text-sm font-medium bg-secondary text-on-secondary rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save Customer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pt-6 w-full">
        <div className="max-w-[1600px] mx-auto h-full flex flex-col lg:flex-row gap-6 xl:gap-8">
          
          {/* Left Column: Customer Directory (List) */}
          <div className="flex-1 flex flex-col h-full min-h-[600px]">
            {/* Header & Search */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-headline font-bold text-3xl text-on-surface tracking-tight">Customer Directory</h2>
                <p className="font-body text-on-surface-variant text-sm mt-1">Manage relationships and loyalty programs.</p>
              </div>
              <button onClick={() => setIsAddOpen(true)} className="bg-gradient-to-br from-secondary to-secondary-container text-white px-5 py-2.5 rounded-lg font-headline font-bold text-sm shadow-lg shadow-secondary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                Add Customer
              </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-surface-container-low p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-center mb-6">
              <div className="relative w-full sm:max-w-md">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-surface-container-lowest border-none rounded-lg pl-12 pr-4 py-3 font-body text-sm focus:bg-surface-bright focus:ring-2 focus:ring-secondary/20 transition-all text-on-surface placeholder:text-on-surface-variant shadow-sm outline-none" 
                  placeholder="Search by name, email, or phone..." 
                  type="text"
                />
              </div>
              {/* Tier Filter Chips */}
              <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-hide">
                <button className="px-4 py-2 bg-primary-container text-on-primary rounded-full font-label text-xs font-semibold whitespace-nowrap transition-transform active:scale-95">All Tiers</button>
                <button className="px-4 py-2 bg-surface-variant text-on-surface-variant hover:bg-surface-container-highest rounded-full font-label text-xs font-medium whitespace-nowrap transition-all active:scale-95 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-on-secondary-fixed"></span> Platinum
                </button>
                <button className="px-4 py-2 bg-surface-variant text-on-surface-variant hover:bg-surface-container-highest rounded-full font-label text-xs font-medium whitespace-nowrap transition-all active:scale-95 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-tertiary-container"></span> Gold
                </button>
                <button className="px-4 py-2 bg-surface-variant text-on-surface-variant hover:bg-surface-container-highest rounded-full font-label text-xs font-medium whitespace-nowrap transition-all active:scale-95 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-outline"></span> Bronze
                </button>
              </div>
            </div>

            {/* Customer List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-24 md:pb-0">
              {customers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant gap-3">
                  <span className="material-symbols-outlined text-5xl opacity-30">person_search</span>
                  <p className="font-body text-sm">No customers found. Add one!</p>
                </div>
              ) : customers.map(cust => (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  className={`group relative flex items-center justify-between p-4 rounded-xl cursor-pointer shadow-sm transition-all duration-200 ${
                    selectedCustomer?.id === cust.id
                      ? 'bg-surface-container-highest'
                      : 'bg-surface hover:bg-surface-container-lowest'
                  }`}
                >
                  {selectedCustomer?.id === cust.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 bg-secondary rounded-r-full"></div>}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center font-bold text-on-primary text-lg">
                      {cust.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-on-surface text-base group-hover:text-secondary transition-colors">{cust.name}</h3>
                      <p className="font-body text-xs text-on-surface-variant mt-0.5">{cust.email || cust.phone || 'No contact info'}</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-8 text-right">
                    <div>
                      <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Orders</p>
                      <p className="font-headline font-bold text-on-surface mt-0.5">{cust._count.orders}</p>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">chevron_right</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Detail Panel */}
          <aside className="hidden lg:flex flex-col w-[380px] xl:w-[420px] bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10 h-[calc(100vh-8rem)] sticky top-24 overflow-y-auto">
            {selectedCustomer ? (
              <>
                <div className="flex flex-col gap-4 mb-8">
                  <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center font-bold text-on-primary text-3xl">
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-headline font-bold text-2xl text-on-surface">{selectedCustomer.name}</h2>
                    <div className="flex flex-col gap-1 mt-2 font-body text-sm text-on-surface-variant">
                      {selectedCustomer.email && <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">mail</span>{selectedCustomer.email}</span>}
                      {selectedCustomer.phone && <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">phone</span>{selectedCustomer.phone}</span>}
                      <span className="flex items-center gap-2 text-xs mt-1"><span className="material-symbols-outlined text-[16px]">calendar_today</span>Customer since {new Date(selectedCustomer.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="bg-surface-container p-4 rounded-xl">
                    <p className="font-label text-xs text-on-surface-variant font-medium mb-1">Total Orders</p>
                    <p className="font-headline font-bold text-xl text-on-surface">{selectedCustomer._count.orders}</p>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-xl">
                    <p className="font-label text-xs text-secondary font-semibold mb-1">Member Since</p>
                    <p className="font-headline font-bold text-sm text-secondary">{new Date(selectedCustomer.createdAt).getFullYear()}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant gap-3">
                <span className="material-symbols-outlined text-5xl opacity-30">person</span>
                <p className="font-body text-sm text-center">Select a customer to view their details</p>
              </div>
            )}
          </aside>

        </div>
      </div>
    </ResponsiveLayout>
  );
}

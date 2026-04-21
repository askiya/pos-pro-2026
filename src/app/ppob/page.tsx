import ResponsiveLayout from "@/components/layout/ResponsiveLayout";

export default function PPOBPage() {
  return (
    <ResponsiveLayout>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface relative w-full">
        {/* Scrollable Canvas */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8">
            
            {/* Left Column: Products */}
            <div className="flex-1 flex flex-col gap-6">
              {/* Category Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button className="px-6 py-2 bg-surface-container-highest text-on-surface font-headline font-bold text-sm rounded-full whitespace-nowrap">Pulsa</button>
                <button className="px-6 py-2 bg-surface-container text-on-surface-variant font-headline font-semibold text-sm rounded-full whitespace-nowrap hover:bg-surface-container-highest transition-colors">Paket Data</button>
                <button className="px-6 py-2 bg-surface-container text-on-surface-variant font-headline font-semibold text-sm rounded-full whitespace-nowrap hover:bg-surface-container-highest transition-colors">PLN</button>
                <button className="px-6 py-2 bg-surface-container text-on-surface-variant font-headline font-semibold text-sm rounded-full whitespace-nowrap hover:bg-surface-container-highest transition-colors">BPJS</button>
                <button className="px-6 py-2 bg-surface-container text-on-surface-variant font-headline font-semibold text-sm rounded-full whitespace-nowrap hover:bg-surface-container-highest transition-colors">Game Voucher</button>
                <button className="px-6 py-2 bg-surface-container text-on-surface-variant font-headline font-semibold text-sm rounded-full whitespace-nowrap hover:bg-surface-container-highest transition-colors">Internet</button>
              </div>

              {/* Operator Filter */}
              <div className="bg-surface-container-low p-4 rounded-xl">
                <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                  {/* Telkomsel */}
                  <button className="flex-shrink-0 w-20 h-20 bg-surface-container-lowest rounded-xl flex flex-col items-center justify-center gap-2 border border-secondary/20 shadow-sm relative">
                    <div className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full"></div>
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-xs">T</div>
                    <span className="text-[10px] font-semibold text-on-surface">Telkomsel</span>
                  </button>
                  {/* XL */}
                  <button className="flex-shrink-0 w-20 h-20 bg-surface-container-lowest rounded-xl flex flex-col items-center justify-center gap-2 border border-outline-variant/15 hover:border-secondary/20 transition-colors opacity-70 hover:opacity-100">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">XL</div>
                    <span className="text-[10px] font-semibold text-on-surface">XL/Axis</span>
                  </button>
                  {/* Indosat */}
                  <button className="flex-shrink-0 w-20 h-20 bg-surface-container-lowest rounded-xl flex flex-col items-center justify-center gap-2 border border-outline-variant/15 hover:border-secondary/20 transition-colors opacity-70 hover:opacity-100">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-bold text-xs">I</div>
                    <span className="text-[10px] font-semibold text-on-surface">Indosat</span>
                  </button>
                  {/* Smartfren */}
                  <button className="flex-shrink-0 w-20 h-20 bg-surface-container-lowest rounded-xl flex flex-col items-center justify-center gap-2 border border-outline-variant/15 hover:border-secondary/20 transition-colors opacity-70 hover:opacity-100">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs">S</div>
                    <span className="text-[10px] font-semibold text-on-surface">Smartfren</span>
                  </button>
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-secondary/20 shadow-sm cursor-pointer hover:shadow-md transition-all ring-2 ring-secondary/20">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600 font-bold text-sm">T</div>
                    <span className="bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded-full text-[10px] font-bold">12% Margin</span>
                  </div>
                  <h3 className="font-headline font-bold text-on-surface mb-1">Pulsa 50.000</h3>
                  <div className="flex items-end justify-between mt-4">
                    <div>
                      <p className="text-xs text-on-surface-variant line-through mb-0.5">Cost: Rp 49.500</p>
                      <p className="font-headline font-bold text-lg text-secondary">Rp 51.000</p>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/15 hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600 font-bold text-sm">T</div>
                    <span className="bg-surface-container-high text-on-surface px-2 py-0.5 rounded-full text-[10px] font-semibold">8% Margin</span>
                  </div>
                  <h3 className="font-headline font-bold text-on-surface mb-1">Pulsa 100.000</h3>
                  <div className="flex items-end justify-between mt-4">
                    <div>
                      <p className="text-xs text-on-surface-variant mb-0.5">Cost: Rp 98.000</p>
                      <p className="font-headline font-bold text-lg text-on-surface group-hover:text-secondary transition-colors">Rp 100.500</p>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/15 hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600 font-bold text-sm">T</div>
                    <span className="bg-surface-container-high text-on-surface px-2 py-0.5 rounded-full text-[10px] font-semibold">15% Margin</span>
                  </div>
                  <h3 className="font-headline font-bold text-on-surface mb-1">Pulsa 20.000</h3>
                  <div className="flex items-end justify-between mt-4">
                    <div>
                      <p className="text-xs text-on-surface-variant mb-0.5">Cost: Rp 19.800</p>
                      <p className="font-headline font-bold text-lg text-on-surface group-hover:text-secondary transition-colors">Rp 22.000</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Transaction & History */}
            <div className="w-full lg:w-[400px] flex flex-col gap-6">
              {/* Transaction Form */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/15 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl pointer-events-none"></div>
                <h2 className="font-headline font-bold text-xl text-on-surface mb-6">New Transaction</h2>
                <div className="space-y-5 relative z-10">
                  <div>
                    <label className="block font-label text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">Destination Number</label>
                    <div className="relative focus-within:ring-2 focus-within:ring-secondary/20 rounded-lg">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-lg">smartphone</span>
                      <input className="w-full pl-10 pr-10 py-3 bg-surface border border-outline-variant/30 rounded-lg text-on-surface font-headline font-bold text-lg focus:outline-none focus:bg-surface-bright focus:border-secondary/50 transition-all" type="tel" defaultValue="0812 3456 7890"/>
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-secondary">
                        <span className="material-symbols-outlined text-sm">contacts</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-[8px]">T</div>
                      <span className="text-xs text-secondary font-medium">Detected: Telkomsel</span>
                    </div>
                  </div>
                  
                  <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
                    <label className="block font-label text-xs font-semibold text-on-surface-variant mb-2">Selected Product</label>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-headline font-bold text-on-surface">Pulsa 50.000</div>
                        <div className="text-xs text-on-surface-variant">Cost: Rp 49.500</div>
                      </div>
                      <button className="text-xs text-secondary font-semibold hover:underline">Change</button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between items-end mb-4">
                      <span className="font-label text-sm text-on-surface-variant">Customer Pays</span>
                      <span className="font-headline font-extrabold text-2xl text-on-surface">Rp 51.000</span>
                    </div>
                    <button className="w-full bg-gradient-to-br from-secondary to-secondary-container text-on-secondary font-headline font-bold text-lg py-4 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-[0.98]">
                      Confirm & Pay
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent History Bento */}
              <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-headline font-bold text-sm text-on-surface">Recent Activity</h3>
                  <button className="text-xs text-secondary font-medium hover:underline">View All</button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-surface-container rounded-full flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-[16px]">phone_android</span>
                      </div>
                      <div>
                        <div className="font-headline font-semibold text-sm text-on-surface">0812***7890</div>
                        <div className="text-[10px] text-on-surface-variant">Pulsa 50k • 10:42 AM</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-semibold text-sm text-on-surface">Rp 51k</span>
                      <span className="bg-tertiary-fixed/20 text-on-tertiary-container px-2 py-0.5 rounded-full text-[9px] font-bold mt-1">SUCCESS</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px]">bolt</span>
                      </div>
                      <div>
                        <div className="font-headline font-semibold text-sm text-on-surface">PLN 123***89</div>
                        <div className="text-[10px] text-on-surface-variant">Token 100k • 09:15 AM</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-semibold text-sm text-on-surface">Rp 102k</span>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-[9px] font-bold mt-1">PENDING</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/10 opacity-70">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px]">sports_esports</span>
                      </div>
                      <div>
                        <div className="font-headline font-semibold text-sm text-on-surface">MLBB 50 Dmd</div>
                        <div className="text-[10px] text-on-surface-variant">User ID: 89***12 • Yesterday</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-semibold text-sm text-on-surface">Rp 15k</span>
                      <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded-full text-[9px] font-bold mt-1">FAILED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}

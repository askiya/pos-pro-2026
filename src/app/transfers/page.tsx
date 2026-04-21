import ResponsiveLayout from "@/components/layout/ResponsiveLayout";

export default function TransfersPage() {
  return (
    <ResponsiveLayout>
      <div className="flex-1 flex flex-col min-w-0 bg-surface w-full">
        {/* Desktop Header Context */}
        <div className="hidden md:flex items-center justify-between px-8 py-6 sticky top-0 bg-surface/90 backdrop-blur-md z-30">
          <div>
            <h1 className="text-2xl font-bold font-headline text-on-surface">New Stock Transfer</h1>
            <p className="text-sm text-on-surface-variant font-body mt-1">Move inventory securely between locations</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-surface-container-highest text-on-surface rounded-lg font-medium text-sm hover:bg-surface-dim transition-colors font-body flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">close</span>
              Cancel Transfer
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8 flex-1 flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
          
          {/* Left Column: Wizard Flow */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            
            {/* Progress Indicator */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/15 relative overflow-hidden">
              <div className="flex justify-between items-center relative z-10">
                {/* Step 1 (Completed) */}
                <div className="flex flex-col items-center gap-2 w-1/4">
                  <div className="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center font-bold text-sm">
                    <span className="material-symbols-outlined text-base">check</span>
                  </div>
                  <span className="text-xs font-semibold text-on-surface-variant font-headline">Source</span>
                </div>
                {/* Step 2 (Completed) */}
                <div className="flex flex-col items-center gap-2 w-1/4">
                  <div className="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center font-bold text-sm">
                    <span className="material-symbols-outlined text-base">check</span>
                  </div>
                  <span className="text-xs font-semibold text-on-surface-variant font-headline">Destination</span>
                </div>
                {/* Step 3 (Active) */}
                <div className="flex flex-col items-center gap-2 w-1/4 relative">
                  <div className="w-8 h-8 rounded-full bg-secondary text-white shadow-md flex items-center justify-center font-bold text-sm z-10">
                    3
                  </div>
                  <span className="text-xs font-bold text-secondary font-headline">Products</span>
                </div>
                {/* Step 4 (Pending) */}
                <div className="flex flex-col items-center gap-2 w-1/4">
                  <div className="w-8 h-8 rounded-full bg-surface-container text-on-primary-container flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <span className="text-xs font-medium text-on-surface-variant font-headline">Review</span>
                </div>
              </div>
              
              {/* Connecting Lines */}
              <div className="absolute top-[38px] left-[12.5%] right-[12.5%] h-0.5 bg-surface-container-low -z-0">
                <div className="h-full bg-secondary w-1/2 transition-all duration-500"></div>
              </div>
            </div>

            {/* Step 3: Product Selection Area */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/15 flex-1 flex flex-col overflow-hidden">
              
              {/* Search Header */}
              <div className="p-6 bg-surface border-b border-surface-container-high/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-96">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
                  <input className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-sm focus:ring-2 focus:ring-secondary/20 focus:bg-surface-bright transition-all text-on-surface placeholder:text-on-surface-variant/60 font-body shadow-sm outline-none" placeholder="Search by SKU, Name or Barcode..." type="text"/>
                </div>
                <button className="px-4 py-2 bg-surface-container-highest text-on-surface rounded-lg font-medium text-sm hover:bg-surface-dim transition-colors font-body flex items-center gap-2 whitespace-nowrap border border-outline-variant/30">
                  <span className="material-symbols-outlined text-sm">barcode_scanner</span>
                  Scan Item
                </button>
              </div>

              {/* Product List */}
              <div className="flex-1 p-6 flex flex-col gap-3 overflow-y-auto bg-surface-container-lowest">
                <div className="group flex items-center justify-between p-4 rounded-xl hover:bg-surface-container-highest transition-colors bg-surface border border-surface-container-high/30">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center overflow-hidden shrink-0">
                      <span className="material-symbols-outlined text-on-surface-variant">inventory_2</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm font-headline text-on-surface">Premium Arabica Beans 1kg</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-on-surface-variant font-body">SKU: CF-ARB-1K</span>
                        <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                        <span className="text-xs font-medium text-on-surface font-body">Source Stock: 42</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-dim transition-colors">
                      <span className="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <input className="w-16 text-center py-1.5 bg-surface-container-lowest border border-outline-variant/30 rounded text-sm font-semibold text-on-surface focus:ring-2 focus:ring-secondary/20 p-0 font-body outline-none" type="number" defaultValue="12"/>
                    <button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-dim transition-colors">
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                </div>

                <div className="group flex items-center justify-between p-4 rounded-xl hover:bg-surface-container-highest transition-colors bg-surface border border-surface-container-high/30">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center overflow-hidden shrink-0">
                      <span className="material-symbols-outlined text-on-surface-variant">inventory_2</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm font-headline text-on-surface">Oat Milk Barista Edition 1L</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-on-surface-variant font-body">SKU: MLK-OAT-1L</span>
                        <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                        <span className="text-xs font-medium text-on-surface font-body">Source Stock: 18</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-dim transition-colors">
                      <span className="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <input className="w-16 text-center py-1.5 bg-surface-container-lowest border border-outline-variant/30 rounded text-sm font-semibold text-on-surface focus:ring-2 focus:ring-secondary/20 p-0 font-body outline-none" type="number" defaultValue="5"/>
                    <button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-dim transition-colors">
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Context & Summary */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            
            {/* Transfer Details Summary */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/15 p-6 flex flex-col gap-6">
              <h3 className="font-bold font-headline text-base text-on-surface border-b border-surface-container pb-4">Transfer Context</h3>
              <div className="flex flex-col gap-4">
                {/* Source */}
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mt-1">
                    <span className="material-symbols-outlined text-sm">storefront</span>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mb-1">From Source</p>
                    <p className="font-bold text-sm font-headline text-on-surface">Downtown Flagship</p>
                    <p className="text-xs text-on-surface-variant font-body mt-0.5">Stock available: High</p>
                  </div>
                </div>
                {/* Connector */}
                <div className="ml-4 w-px h-6 bg-surface-container-high"></div>
                {/* Destination */}
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mt-1">
                    <span className="material-symbols-outlined text-sm">local_shipping</span>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mb-1">To Destination</p>
                    <p className="font-bold text-sm font-headline text-on-surface">Westside Mall Kiosk</p>
                    <p className="text-xs text-on-surface-variant font-body mt-0.5">Requires inventory replenishment</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Panel */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/15 p-6 flex flex-col gap-4 mt-auto lg:mt-0">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-on-surface-variant font-body">Items Selected</span>
                <span className="font-bold text-lg font-headline text-on-surface">2</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-on-surface-variant font-body">Total Quantity</span>
                <span className="font-bold text-lg font-headline text-on-surface">17</span>
              </div>
              
              <button className="w-full py-3.5 bg-gradient-to-br from-secondary to-secondary-container text-white rounded-xl font-bold font-headline text-sm shadow-md hover:scale-[0.98] active:scale-[0.95] transition-all flex justify-center items-center gap-2">
                Review Transfer
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              
              <button className="w-full py-3 bg-surface text-on-surface-variant rounded-xl font-medium font-body text-sm hover:bg-surface-container-highest transition-colors mt-2">
                Back to Destination Selection
              </button>
            </div>

          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}

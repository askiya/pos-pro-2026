"use client";
import { useState, useEffect } from "react";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";

type Tab = "store" | "branches" | "users" | "tax";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  branch?: { name: string } | null;
  createdAt: string;
}

interface Branch {
  id: string;
  name: string;
  location?: string;
  _count: { users: number };
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-secondary/10 text-secondary",
  OWNER: "bg-error/10 text-error",
  MANAGER: "bg-surface-container-high text-on-surface",
  KASIR: "bg-surface-container text-on-surface-variant",
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Add User Modal state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "KASIR" });
  const [savingUser, setSavingUser] = useState(false);

  // Add Branch Modal state
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [branchForm, setBranchForm] = useState({ name: "", location: "" });
  const [savingBranch, setSavingBranch] = useState(false);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const res = await fetch("/api/users");
    if (res.ok) setUsers(await res.json());
    setLoadingUsers(false);
  };

  const fetchBranches = async () => {
    setLoadingBranches(true);
    const res = await fetch("/api/branches");
    if (res.ok) setBranches(await res.json());
    setLoadingBranches(false);
  };

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "branches") fetchBranches();
  }, [activeTab]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUser(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userForm),
    });
    setSavingUser(false);
    if (res.ok) {
      setIsAddUserOpen(false);
      setUserForm({ name: "", email: "", password: "", role: "CASHIER" });
      fetchUsers();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBranch(true);
    const res = await fetch("/api/branches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(branchForm),
    });
    setSavingBranch(false);
    if (res.ok) {
      setIsAddBranchOpen(false);
      setBranchForm({ name: "", location: "" });
      fetchBranches();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "store", label: "Store Profile", icon: "storefront" },
    { id: "branches", label: "Branches", icon: "location_city" },
    { id: "users", label: "Users & Roles", icon: "manage_accounts" },
    { id: "tax", label: "Tax & Fees", icon: "percent" },
  ];

  return (
    <ResponsiveLayout>
      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-xl">
            <div className="px-6 py-4 border-b border-surface-container flex justify-between items-center">
              <h2 className="font-headline font-bold text-lg text-on-surface">Add New User</h2>
              <button onClick={() => setIsAddUserOpen(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 flex flex-col gap-4">
              {[
                { field: "name" as const, label: "Full Name", type: "text", required: true },
                { field: "email" as const, label: "Email", type: "email", required: true },
                { field: "password" as const, label: "Password", type: "password", required: true },
              ].map(({ field, label, type, required }) => (
                <div key={field} className="flex flex-col gap-1.5">
                  <label className="font-label text-xs font-semibold text-on-surface-variant uppercase">{label} {required && "*"}</label>
                  <input
                    required={required}
                    type={type}
                    value={userForm[field]}
                    onChange={(e) => setUserForm({ ...userForm, [field]: e.target.value })}
                    className="px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm outline-none focus:ring-1 focus:ring-secondary"
                  />
                </div>
              ))}
              <div className="flex flex-col gap-1.5">
                <label className="font-label text-xs font-semibold text-on-surface-variant uppercase">Role *</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm outline-none focus:ring-1 focus:ring-secondary"
                >
                  {["OWNER", "ADMIN", "MANAGER", "KASIR"].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsAddUserOpen(false)} className="px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container rounded-lg">Cancel</button>
                <button type="submit" disabled={savingUser} className="px-6 py-2 text-sm font-medium bg-secondary text-on-secondary rounded-lg disabled:opacity-50">
                  {savingUser ? "Saving..." : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Branch Modal */}
      {isAddBranchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-xl">
            <div className="px-6 py-4 border-b border-surface-container flex justify-between items-center">
              <h2 className="font-headline font-bold text-lg text-on-surface">Add New Branch</h2>
              <button onClick={() => setIsAddBranchOpen(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleAddBranch} className="p-6 flex flex-col gap-4">
              {[
                { field: "name" as const, label: "Branch Name", placeholder: "e.g. Downtown Store", required: true },
                { field: "location" as const, label: "Location / Address", placeholder: "e.g. Jl. Sudirman No. 1, Jakarta", required: false },
              ].map(({ field, label, placeholder, required }) => (
                <div key={field} className="flex flex-col gap-1.5">
                  <label className="font-label text-xs font-semibold text-on-surface-variant uppercase">{label} {required && "*"}</label>
                  <input
                    required={required}
                    type="text"
                    value={branchForm[field]}
                    onChange={(e) => setBranchForm({ ...branchForm, [field]: e.target.value })}
                    placeholder={placeholder}
                    className="px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm outline-none focus:ring-1 focus:ring-secondary"
                  />
                </div>
              ))}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsAddBranchOpen(false)} className="px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container rounded-lg">Cancel</button>
                <button type="submit" disabled={savingBranch} className="px-6 py-2 text-sm font-medium bg-secondary text-on-secondary rounded-lg disabled:opacity-50">
                  {savingBranch ? "Saving..." : "Save Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface relative w-full">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto flex flex-col gap-8">
            {/* Page Header */}
            <div>
              <h1 className="font-headline font-bold text-3xl text-on-surface tracking-tight">Configuration Hub</h1>
              <p className="font-body text-sm text-on-surface-variant mt-1">Manage store preferences, users, branches, and operational settings.</p>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

              {/* Left Nav Tabs */}
              <nav className="xl:col-span-2 flex flex-row xl:flex-col gap-2 overflow-x-auto xl:overflow-visible pb-2 xl:pb-0 scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap px-4 py-3 rounded-xl font-body text-sm font-medium transition-all text-left flex items-center gap-2 relative ${
                      activeTab === tab.id
                        ? "bg-surface-container-highest text-secondary font-semibold"
                        : "text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-secondary rounded-r-full hidden xl:block" />
                    )}
                  </button>
                ))}
              </nav>

              {/* Main Content */}
              <div className="xl:col-span-7 flex flex-col gap-6">

                {/* USERS TAB */}
                {activeTab === "users" && (
                  <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="font-headline font-bold text-lg text-on-surface">System Access</h2>
                        <p className="font-body text-xs text-on-surface-variant mt-1">{users.length} users registered</p>
                      </div>
                      <button
                        onClick={() => setIsAddUserOpen(true)}
                        className="px-4 py-2 bg-secondary text-on-secondary font-body text-sm font-medium rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">add</span> Add User
                      </button>
                    </div>
                    {loadingUsers ? (
                      <div className="py-8 text-center text-on-surface-variant text-sm">Loading users...</div>
                    ) : users.length === 0 ? (
                      <div className="py-8 text-center text-on-surface-variant text-sm">
                        <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">group</span>
                        No users yet. Add one!
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="grid grid-cols-12 px-4 py-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label">
                          <div className="col-span-5">Employee</div>
                          <div className="col-span-3">Role</div>
                          <div className="col-span-2">Branch</div>
                          <div className="col-span-2 text-right">Joined</div>
                        </div>
                        {users.map((user) => (
                          <div key={user.id} className="grid grid-cols-12 items-center px-4 py-3 bg-surface rounded-lg hover:bg-surface-container-low transition-colors group">
                            <div className="col-span-5 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs shrink-0">
                                {user.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-body text-sm font-medium text-on-surface truncate">{user.name}</div>
                                <div className="font-body text-xs text-on-surface-variant truncate">{user.email}</div>
                              </div>
                            </div>
                            <div className="col-span-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${ROLE_COLORS[user.role] ?? "bg-surface-container text-on-surface-variant"}`}>
                                {user.role}
                              </span>
                            </div>
                            <div className="col-span-2 font-body text-xs text-on-surface-variant truncate">
                              {user.branch?.name ?? "—"}
                            </div>
                            <div className="col-span-2 text-right font-body text-xs text-on-surface-variant">
                              {new Date(user.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {/* BRANCHES TAB */}
                {activeTab === "branches" && (
                  <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="font-headline font-bold text-lg text-on-surface">Branch Locations</h2>
                        <p className="font-body text-xs text-on-surface-variant mt-1">{branches.length} branches active</p>
                      </div>
                      <button
                        onClick={() => setIsAddBranchOpen(true)}
                        className="px-4 py-2 bg-secondary text-on-secondary font-body text-sm font-medium rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">add_location</span> Add Branch
                      </button>
                    </div>
                    {loadingBranches ? (
                      <div className="py-8 text-center text-on-surface-variant text-sm">Loading branches...</div>
                    ) : branches.length === 0 ? (
                      <div className="py-8 text-center text-on-surface-variant text-sm">
                        <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">location_city</span>
                        No branches yet. Add one!
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {branches.map((branch) => (
                          <div key={branch.id} className="bg-surface rounded-xl p-5 border border-outline-variant/15 hover:border-secondary/30 transition-all group">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                                <span className="material-symbols-outlined text-xl">storefront</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-headline font-bold text-on-surface text-sm group-hover:text-secondary transition-colors">{branch.name}</h3>
                                {branch.location && <p className="font-body text-xs text-on-surface-variant mt-1 truncate">{branch.location}</p>}
                                <div className="flex items-center gap-1 mt-3 text-xs text-secondary font-medium">
                                  <span className="material-symbols-outlined text-[14px]">group</span>
                                  {branch._count.users} user{branch._count.users !== 1 ? "s" : ""}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {/* STORE PROFILE TAB */}
                {activeTab === "store" && (
                  <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10">
                    <h2 className="font-headline font-bold text-lg text-on-surface mb-6">Store Profile</h2>
                    <div className="flex flex-col gap-4">
                      {[
                        { label: "Store Name", placeholder: "e.g. Downtown Goods" },
                        { label: "Address", placeholder: "Store address" },
                        { label: "Phone", placeholder: "+62 8xx-xxxx" },
                        { label: "Email", placeholder: "store@example.com" },
                        { label: "Tax ID (NPWP)", placeholder: "xx.xxx.xxx.x-xxx.xxx" },
                      ].map(({ label, placeholder }) => (
                        <div key={label} className="flex flex-col gap-1.5">
                          <label className="font-label text-xs font-semibold text-on-surface-variant uppercase">{label}</label>
                          <input
                            type="text"
                            placeholder={placeholder}
                            className="px-3 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm text-on-surface outline-none focus:ring-1 focus:ring-secondary placeholder:text-on-surface-variant/50"
                          />
                        </div>
                      ))}
                      <button className="self-end mt-2 px-6 py-2.5 bg-secondary text-on-secondary rounded-lg text-sm font-medium hover:opacity-90 transition-all">
                        Save Changes
                      </button>
                    </div>
                  </section>
                )}

                {/* TAX TAB */}
                {activeTab === "tax" && (
                  <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10">
                    <h2 className="font-headline font-bold text-lg text-on-surface mb-6">Tax & Fees Configuration</h2>
                    <div className="flex flex-col gap-5">
                      {[
                        { label: "PPN (Value Added Tax)", value: "11", unit: "%" },
                        { label: "Service Charge", value: "0", unit: "%" },
                        { label: "Rounding Mode", value: "Round to nearest 100", unit: "" },
                      ].map(({ label, value, unit }) => (
                        <div key={label} className="flex items-center justify-between p-4 bg-surface rounded-xl border border-outline-variant/15">
                          <div>
                            <p className="font-body text-sm font-medium text-on-surface">{label}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              defaultValue={value}
                              className="w-20 text-right px-2 py-1.5 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm font-mono text-on-surface outline-none focus:ring-1 focus:ring-secondary"
                            />
                            {unit && <span className="text-on-surface-variant font-body text-sm">{unit}</span>}
                          </div>
                        </div>
                      ))}
                      <button className="self-end mt-2 px-6 py-2.5 bg-secondary text-on-secondary rounded-lg text-sm font-medium hover:opacity-90 transition-all">
                        Save Tax Settings
                      </button>
                    </div>
                  </section>
                )}
              </div>

              {/* Right Column: Receipt Preview + Plan Card */}
              <div className="xl:col-span-3 flex flex-col gap-6">
                {/* Live Receipt Preview */}
                <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/10 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-headline font-bold text-sm text-on-surface">Receipt Style</h3>
                    <button className="text-secondary hover:text-secondary-container transition-colors"><span className="material-symbols-outlined text-sm">edit</span></button>
                  </div>
                  <div className="bg-surface px-4 py-6 flex flex-col items-center shadow-inner relative overflow-hidden self-center w-full max-w-[220px]">
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2">storefront</span>
                    <div className="font-headline font-bold text-sm text-on-surface uppercase text-center">POS Pro 2026</div>
                    <div className="font-body text-[10px] text-on-surface-variant text-center mt-1 w-3/4">Jl. Raya Commerce No. 1<br />Jakarta, Indonesia</div>
                    <div className="w-full border-t border-dashed border-outline-variant/30 my-3"></div>
                    <div className="w-full font-mono text-[10px] text-on-surface flex flex-col gap-1">
                      <div className="flex justify-between"><span>Produk A x1</span><span>Rp 50.000</span></div>
                      <div className="flex justify-between"><span>Produk B x2</span><span>Rp 30.000</span></div>
                      <div className="flex justify-between text-on-surface-variant mt-1"><span>PPN 11%</span><span>Rp 8.800</span></div>
                    </div>
                    <div className="w-full border-t border-dashed border-outline-variant/30 my-3"></div>
                    <div className="w-full flex justify-between font-headline font-bold text-xs text-on-surface">
                      <span>TOTAL</span><span>Rp 88.800</span>
                    </div>
                    <div className="mt-4 text-[8px] text-on-surface-variant text-center font-mono">
                      || ||| | || | ||| ||<br />0012938475
                    </div>
                  </div>
                </div>

                {/* Pro Plan Card */}
                <div className="rounded-xl p-5 bg-gradient-to-br from-secondary to-secondary-container text-on-secondary shadow-lg relative overflow-hidden group">
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
                  <h3 className="font-headline font-bold text-sm mb-1 relative z-10">Current Plan</h3>
                  <div className="font-headline font-extrabold text-2xl mb-4 relative z-10 tracking-tight">Pro Tier</div>
                  <div className="flex flex-col gap-2 font-body text-xs text-on-secondary/80 relative z-10">
                    <div className="flex justify-between items-center">
                      <span>Active Branches</span>
                      <span className="font-semibold text-white">{branches.length} / 5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Users</span>
                      <span className="font-semibold text-white">{users.length}</span>
                    </div>
                  </div>
                  <button className="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-body text-sm font-medium transition-colors relative z-10 text-white border border-white/10">
                    Upgrade Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}

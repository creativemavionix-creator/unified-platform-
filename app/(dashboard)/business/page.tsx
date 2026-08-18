"use client";

import React, { useState } from "react";
import {
  Users,
  Briefcase,
  Layers,
  DollarSign,
  Archive,
  ShoppingCart,
  FileText,
  MessageSquare,
  BarChart2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, DataColumn } from "@/components/shared/DataTable";
import { DetailPanel } from "@/components/shared/DetailPanel";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { insertBusinessRecord, insertActivity } from "@/lib/supabase-actions";
import LeadCrmWorkspace from "@/components/business/lead-crm/LeadCrmWorkspace";

type BusinessModule =
  | "crm"
  | "hrms"
  | "erp"
  | "finance"
  | "inventory"
  | "procurement"
  | "legal"
  | "support"
  | "analytics";

export default function BusinessSuitePage() {
  const [activeModule, setActiveModule] = useState<BusinessModule>("crm");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  React.useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("tool", activeModule);
    window.history.replaceState({}, "", url.toString());
    window.dispatchEvent(new Event("url-change"));
  }, [activeModule]);

  if (activeModule === "crm") {
    return (
      <div className="h-[calc(100vh-4rem)] overflow-y-auto w-full bg-surface border-l border-border/20">
        <LeadCrmWorkspace
          onBack={() => setActiveModule("hrms")}
          onViewChange={() => {}}
        />
      </div>
    );
  }

  // Grouped Modules Metadata
  const businessModuleGroups = [
    {
      title: "Sales & Service",
      items: [
        { id: "crm", label: "CRM Pipeline", icon: Users },
        { id: "support", label: "Customer Support", icon: MessageSquare },
      ],
    },
    {
      title: "HR & Operations",
      items: [
        { id: "hrms", label: "HRMS Employees", icon: Briefcase },
        { id: "erp", label: "ERP Hub", icon: Layers },
        { id: "inventory", label: "Inventory Stock", icon: Archive },
        { id: "procurement", label: "Procurement POs", icon: ShoppingCart },
      ],
    },
    {
      title: "Finance & Legal",
      items: [
        { id: "finance", label: "Finance Ledgers", icon: DollarSign },
        { id: "legal", label: "Legal Agreements", icon: FileText },
      ],
    },
    {
      title: "Intelligence",
      items: [
        { id: "analytics", label: "Analytics Dashboard", icon: BarChart2 },
      ],
    },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden w-full bg-surface border-l border-border/20">
      <aside
        className={cn(
          "bg-surface border-r border-border/20 flex flex-col shrink-0 transition-all duration-300",
          isSidebarOpen ? "w-60" : "w-14"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-12 px-4 border-b border-border/20 flex items-center justify-between bg-void/35 shrink-0">
          {isSidebarOpen && (
            <span className="font-display font-bold text-scale-sm text-signal">Biz Ops Suite</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-7 h-7 hover:bg-void/40 text-muted-foreground hover:text-bone mx-auto"
          >
            <ChevronRight className={cn("w-4 h-4 transition-transform", isSidebarOpen && "rotate-180")} />
          </Button>
        </div>

        {/* Modules Navigator */}
        <nav className="flex-grow p-2 space-y-3.5 overflow-y-auto">
          {businessModuleGroups.map((group, groupIdx) => (
            <div key={group.title} className="space-y-1">
              {isSidebarOpen ? (
                <span className="text-[9px] font-bold text-muted-foreground/45 tracking-widest px-3 block uppercase select-none">
                  {group.title}
                </span>
              ) : (
                groupIdx > 0 && <div className="h-px bg-border/20 my-2 mx-1" />
              )}
              {group.items.map((mod) => {
                const Icon = mod.icon;
                const isActive = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveModule(mod.id as BusinessModule)}
                    className={cn(
                      "flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-scale-xs font-medium transition-all border border-transparent text-left",
                      isActive
                        ? "bg-signal/10 border-signal/30 text-signal"
                        : "text-muted-foreground hover:bg-void/40 hover:text-bone"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 shrink-0", isActive && "text-signal")} />
                    {isSidebarOpen && <span className="truncate">{mod.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Panel */}
      <main className="flex-grow bg-void/40 relative overflow-hidden flex flex-col">
        {activeModule === "hrms" && <HrmsModuleView />}
        {activeModule === "erp" && <ErpModuleView />}
        {activeModule === "finance" && <FinanceModuleView />}
        {activeModule === "inventory" && <InventoryModuleView />}
        {activeModule === "procurement" && <ProcurementModuleView />}
        {activeModule === "legal" && <LegalModuleView />}
        {activeModule === "support" && <SupportModuleView />}
        {activeModule === "analytics" && <AnalyticsModuleView />}
      </main>
    </div>
  );
}



/* ==========================================
   HRMS MODULE
   ========================================== */
interface Employee {
  name: string;
  role: string;
  dept: string;
  leaves: string;
}

function HrmsModuleView() {
  const [employees, setEmployees] = useState<Employee[]>([
    { name: "John Doe", role: "Principal Architect", dept: "Engineering", leaves: "Approved: 2 days" },
    { name: "Sarah Connor", role: "Ops Director", dept: "Operations", leaves: "Pending Approval" },
  ]);

  const handleAddEmployee = () => {
    const emp: Employee = { name: `Employee #${employees.length + 1}`, role: "Analyst", dept: "Operations", leaves: "N/A" };
    setEmployees(prev => [...prev, emp]);
    insertBusinessRecord({ recordType: "hrms_employee", name: emp.name, roleTitle: emp.role, department: emp.dept });
    insertActivity({ title: `HRMS employee added: ${emp.name}`, description: `Added ${emp.name} as ${emp.role}`, type: "business" });
  };

  const columns: DataColumn<Employee>[] = [
    { key: "name", header: "Name", sortable: true },
    { key: "role", header: "Role", sortable: true },
    { key: "dept", header: "Department" },
    { key: "leaves", header: "Leave status" },
  ];

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6">
      <div className="flex justify-between items-center border-b border-border/20 pb-3">
        <h2 className="font-display font-bold text-scale-lg text-bone">HRMS Directory</h2>
        <Button onClick={handleAddEmployee} className="bg-signal hover:bg-signal/90 text-void font-semibold text-scale-xs h-8 px-3 rounded-lg">
          + Add Employee
        </Button>
      </div>

      <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg">
        <DataTable
          data={employees}
          columns={columns}
          filterKey="name"
          filterPlaceholder="Search employee..."
        />
      </div>

      {/* Org Chart mock */}
      <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="font-display font-bold text-scale-sm text-bone">Hierarchical Org Structure</h3>
        <div className="flex flex-col items-center gap-4 text-center text-scale-xs font-mono text-bone py-4">
          <div className="p-2 bg-void/50 border border-signal/30 rounded">CEO (Executive Board)</div>
          <div className="w-0.5 h-4 bg-border/40" />
          <div className="flex gap-8">
            <div className="p-2 bg-void/50 border border-border/30 rounded">VP Engineering</div>
            <div className="p-2 bg-void/50 border border-border/30 rounded">VP Operations</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   ERP HUB
   ========================================== */
function ErpModuleView() {
  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6">
      <div className="flex justify-between items-center border-b border-border/20 pb-3">
        <h2 className="font-display font-bold text-scale-lg text-bone">ERP Operations Hub</h2>
        <span className="text-[10px] font-mono text-muted-foreground uppercase">INTEGRATED WAREHOUSE RECORDS</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { name: "Inventory", desc: "Warehouse stock quantities & SKU metrics.", icon: Archive },
          { name: "Procurement", desc: "Vendors directory & purchase orders ledger.", icon: ShoppingCart },
          { name: "Finance Ledger", desc: "MRR ledgers & invoices records.", icon: DollarSign },
        ].map((module) => {
          const Icon = module.icon;
          return (
            <Card key={module.name} className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg space-y-3">
              <div className="w-8 h-8 rounded-lg bg-signal/15 border border-signal/25 text-signal flex items-center justify-center">
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="font-display font-bold text-scale-sm text-bone">{module.name}</h3>
              <p className="text-scale-xs text-muted-foreground leading-normal">{module.desc}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================
   FINANCE MODULE
   ========================================== */
interface Transaction {
  ref: string;
  amount: string;
  type: string;
  date: string;
}

function FinanceModuleView() {
  const [txs] = useState<Transaction[]>([
    { ref: "TX-9011", amount: "+$4,200", type: "Subscription", date: "2026-07-18" },
    { ref: "TX-9012", amount: "-$120", type: "Compute Utility", date: "2026-07-17" },
  ]);

  const columns: DataColumn<Transaction>[] = [
    { key: "ref", header: "Reference", sortable: true },
    { key: "type", header: "Category" },
    { key: "amount", header: "Amount", sortable: true },
    { key: "date", header: "Date" },
  ];

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6">
      <div className="flex justify-between items-center border-b border-border/20 pb-3">
        <h2 className="font-display font-bold text-scale-lg text-bone">Finance Ledger Accounts</h2>
        <span className="text-[10px] font-mono text-muted-foreground uppercase">FINANCIAL LEDGER REGISTRY</span>
      </div>

      {/* Stats summaries cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg space-y-2">
          <span className="text-[10px] font-mono text-muted-foreground uppercase">Monthly Revenue</span>
          <p className="font-display text-scale-lg font-bold text-bone">$48,250</p>
        </div>
        <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg space-y-2">
          <span className="text-[10px] font-mono text-muted-foreground uppercase">Monthly Expenses</span>
          <p className="font-display text-scale-lg font-bold text-bone">-$12,410</p>
        </div>
        <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg space-y-2">
          <span className="text-[10px] font-mono text-muted-foreground uppercase">Net Margin</span>
          <p className="font-display text-scale-lg font-bold text-signal">$35,840</p>
        </div>
      </div>

      <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg">
        <DataTable
          data={txs}
          columns={columns}
          filterKey="ref"
          filterPlaceholder="Search reference..."
        />
      </div>
    </div>
  );
}

/* ==========================================
   INVENTORY MODULE
   ========================================== */
interface StockItem {
  sku: string;
  name: string;
  qty: number;
  status: string;
}

function InventoryModuleView() {
  const [stock] = useState<StockItem[]>([
    { sku: "SKU-990-A", name: "Obsidian Server Frame", qty: 24, status: "IN STOCK" },
    { sku: "SKU-990-B", name: "Fiber Optic Tranceivers", qty: 4, status: "LOW STOCK" },
  ]);

  const columns: DataColumn<StockItem>[] = [
    { key: "sku", header: "SKU SKU", sortable: true },
    { key: "name", header: "Item Name", sortable: true },
    { key: "qty", header: "Quantity", sortable: true },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold">
          <span className={cn("w-1.5 h-1.5 rounded-full",
            row.status === "LOW STOCK" ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
          )} />
          <span className={row.status === "LOW STOCK" ? "text-amber-500" : "text-emerald-500"}>
            {row.status}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6">
      <div className="flex justify-between items-center border-b border-border/20 pb-3">
        <h2 className="font-display font-bold text-scale-lg text-bone">Inventory Quantities Ledger</h2>
        <span className="text-[10px] font-mono text-muted-foreground uppercase">WAREHOUSE STOCK LEDGER</span>
      </div>

      <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg">
        <DataTable
          data={stock}
          columns={columns}
          filterKey="name"
          filterPlaceholder="Search item name..."
        />
      </div>
    </div>
  );
}

/* ==========================================
   PROCUREMENT MODULE
   ========================================== */
interface PurchaseOrder {
  po: string;
  vendor: string;
  cost: string;
  status: string;
}

function ProcurementModuleView() {
  const [pos] = useState<PurchaseOrder[]>([
    { po: "PO-8041", vendor: "Amalgamated Fiber Inc", cost: "$8,500", status: "APPROVED" },
    { po: "PO-8042", vendor: "Obsidian Steel Rails", cost: "$4,200", status: "PENDING" },
  ]);

  const columns: DataColumn<PurchaseOrder>[] = [
    { key: "po", header: "PO Reference", sortable: true },
    { key: "vendor", header: "Vendor Name", sortable: true },
    { key: "cost", header: "Total cost" },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold">
          <span className={cn("w-1.5 h-1.5 rounded-full",
            row.status === "APPROVED" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
          )} />
          <span className={row.status === "APPROVED" ? "text-emerald-500" : "text-amber-500"}>
            {row.status}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6">
      <div className="flex justify-between items-center border-b border-border/20 pb-3">
        <h2 className="font-display font-bold text-scale-lg text-bone">Procurement Purchase Orders</h2>
        <span className="text-[10px] font-mono text-muted-foreground uppercase">VENDOR PROCUREMENT LEDGER</span>
      </div>

      <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg">
        <DataTable
          data={pos}
          columns={columns}
          filterKey="po"
          filterPlaceholder="Search PO..."
        />
      </div>
    </div>
  );
}

/* ==========================================
   LEGAL AGREEMENTS
   ========================================== */
interface LegalAgreement {
  title: string;
  type: string;
  signingDate: string;
  status: string;
}

function LegalModuleView() {
  const [contracts] = useState<LegalAgreement[]>([
    { title: "NDA Tenant Agreement", type: "NDA", signingDate: "2026-07-18", status: "SIGNED" },
    { title: "SaaS Licensing terms", type: "TOS", signingDate: "Draft Version", status: "DRAFT" },
  ]);

  const columns: DataColumn<LegalAgreement>[] = [
    { key: "title", header: "Agreement Title", sortable: true },
    { key: "type", header: "Category" },
    { key: "signingDate", header: "Signed Date" },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold">
          <span className={cn("w-1.5 h-1.5 rounded-full",
            row.status === "SIGNED" ? "bg-emerald-500" : "bg-amber-500"
          )} />
          <span className={row.status === "SIGNED" ? "text-emerald-500" : "text-amber-500"}>
            {row.status}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6">
      <div className="flex justify-between items-center border-b border-border/20 pb-3">
        <h2 className="font-display font-bold text-scale-lg text-bone">Legal Agreements Index</h2>
        <span className="text-[10px] font-mono text-muted-foreground uppercase">LEGAL COMPLIANCE DIRECTORY</span>
      </div>

      <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg">
        <DataTable
          data={contracts}
          columns={columns}
          filterKey="title"
          filterPlaceholder="Search agreement..."
        />
      </div>
    </div>
  );
}

/* ==========================================
   CUSTOMER SUPPORT
   ========================================== */
interface Ticket {
  id: string;
  subject: string;
  user: string;
  priority: string;
  status: string;
}

function SupportModuleView() {
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: "TCK-1002", subject: "Postgres index query timeout", user: "dev@vance.io", priority: "CRITICAL", status: "OPEN" },
    { id: "TCK-1003", subject: "Invoice billing discrepancy", user: "billing@harris.net", priority: "MEDIUM", status: "PENDING" },
  ]);

  const handleAddTicket = () => {
    const ticket: Ticket = { id: `TCK-${1000 + tickets.length + 1}`, subject: `New support ticket #${tickets.length + 1}`, user: "user@workspace.io", priority: "MEDIUM", status: "OPEN" };
    setTickets(prev => [...prev, ticket]);
    insertBusinessRecord({ recordType: "support_ticket", name: ticket.subject, subject: ticket.subject, email: ticket.user, priority: ticket.priority.toLowerCase(), ticketStatus: ticket.status.toLowerCase() });
    insertActivity({ title: `Support ticket created: ${ticket.id}`, description: ticket.subject, type: "business" });
  };

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const columns: DataColumn<Ticket>[] = [
    { key: "id", header: "Ticket ID", sortable: true },
    { key: "subject", header: "Subject Line", sortable: true },
    { key: "user", header: "Account User" },
    {
      key: "priority",
      header: "Severity",
      render: (row) => (
        <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold">
          <span className={cn("w-1.5 h-1.5 rounded-full",
            row.priority === "CRITICAL" ? "bg-pulse animate-pulse" : "bg-amber-500"
          )} />
          <span className={row.priority === "CRITICAL" ? "text-pulse" : "text-amber-500"}>
            {row.priority}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6">
      <div className="flex justify-between items-center border-b border-border/20 pb-3">
        <h2 className="font-display font-bold text-scale-lg text-bone">Customer Support Dispatch</h2>
        <Button onClick={handleAddTicket} className="bg-signal hover:bg-signal/90 text-void font-semibold text-scale-xs h-8 px-3 rounded-lg">
          + New Ticket
        </Button>
      </div>

      <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg">
        <DataTable
          data={tickets}
          columns={columns}
          filterKey="subject"
          filterPlaceholder="Search ticket subject..."
        />
        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => setSelectedTicket(tickets[0])}
            className="bg-signal hover:bg-signal/90 text-void font-semibold text-scale-xs h-8 px-4 rounded-lg"
          >
            Open Ticket Thread
          </Button>
        </div>
      </div>

      <DetailPanel
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title="Support Conversation Log"
        subtitle={selectedTicket?.id}
      >
        <div className="space-y-4 text-scale-xs select-text">
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-muted-foreground uppercase">Subject</span>
            <p className="font-semibold text-bone">{selectedTicket?.subject}</p>
          </div>
          
          <div className="pt-2 border-t border-border/10 space-y-3">
            <p className="text-[10px] font-mono text-muted-foreground uppercase">Message Logs</p>
            {/* Conversation threads */}
            <div className="space-y-3">
              <div className="bg-void/60 border border-border/20 rounded p-2.5 space-y-1">
                <span className="text-[9px] font-mono text-signal font-bold uppercase">Customer ({selectedTicket?.user})</span>
                <p className="text-muted-foreground leading-normal">
                  Our database clusters are timing out on deep relation checks. Please inspect server diagnostics buffers.
                </p>
              </div>
              <div className="bg-signal/10 border border-signal/20 rounded p-2.5 space-y-1 ml-4">
                <span className="text-[9px] font-mono text-signal font-bold uppercase">Operator Agent</span>
                <p className="text-bone leading-normal">
                  Telemetry logs received. The cluster is running normal queries. Investigating index tables structures.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DetailPanel>
    </div>
  );
}

/* ==========================================
   ANALYTICS MODULE
   ========================================== */
function AnalyticsModuleView() {
  const chartData = [
    { name: "Week 1", revenue: 4000, support: 24 },
    { name: "Week 2", revenue: 9000, support: 13 },
    { name: "Week 3", revenue: 15000, support: 35 },
    { name: "Week 4", revenue: 25000, support: 8 },
  ];

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6">
      <div className="flex justify-between items-center border-b border-border/20 pb-3">
        <h2 className="font-display font-bold text-scale-lg text-bone">Analytics Cross-Suite KPIs</h2>
        <span className="text-[10px] font-mono text-muted-foreground uppercase">KPI CHARTS INDEX</span>
      </div>

      <div className="bg-surface border border-border/40 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="font-display font-bold text-scale-sm text-bone">MRR Revenue Scaling Curve</h3>
        <div className="h-60 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }} />
              <Area type="monotone" dataKey="revenue" stroke="var(--signal)" fill="var(--signal)" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

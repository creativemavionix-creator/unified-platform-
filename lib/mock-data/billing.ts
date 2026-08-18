export interface CurrentPlan {
  name: string;
  price: number;
  seats: number;
  tokensLimit: number;
  period: "monthly" | "yearly";
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
}

export interface PaymentMethod {
  type: string;
  last4: string;
  expiry: string;
}

export const currentPlan: CurrentPlan = {
  name: "Pro",
  price: 49,
  seats: 5,
  tokensLimit: 500000,
  period: "monthly",
};

export const invoices: Invoice[] = [
  {
    id: "inv-001",
    date: "2024-01-01",
    amount: 49.0,
    status: "paid",
  },
  {
    id: "inv-002",
    date: "2023-12-01",
    amount: 49.0,
    status: "paid",
  },
  {
    id: "inv-003",
    date: "2023-11-01",
    amount: 49.0,
    status: "paid",
  },
  {
    id: "inv-004",
    date: "2023-10-01",
    amount: 29.0,
    status: "paid",
  },
  {
    id: "inv-005",
    date: "2024-02-01",
    amount: 49.0,
    status: "pending",
  },
  {
    id: "inv-006",
    date: "2023-09-01",
    amount: 29.0,
    status: "failed",
  },
];

export const paymentMethod: PaymentMethod = {
  type: "Visa",
  last4: "4242",
  expiry: "12/2026",
};

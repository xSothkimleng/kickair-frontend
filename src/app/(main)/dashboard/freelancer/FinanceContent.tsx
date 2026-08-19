"use client";

import FinanceView from "@/components/finance/FinanceView";

// One shared wallet surface for both spaces — see components/finance/FinanceView.
export default function FinanceContent() {
  return <FinanceView mode='freelancer' />;
}

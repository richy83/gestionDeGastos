import type {
  ApproverRole,
  Expense,
  ExpenseStatus,
} from "@/domain/expense";

export type ExpenseView = Readonly<{
  expenseId: string;
  employeeId: string;
  description: string;
  category: string;
  amountCents: number;
  submittedOn: string;
  status: ExpenseStatus;
  requiredRole: ApproverRole | null;
  decision:
    | null
    | Readonly<{
        outcome: "approved" | "rejected";
        decidedBy: string;
        decidedOn: string;
        reason: string | null;
      }>;
}>;

export function toExpenseView(expense: Expense): ExpenseView {
  const decision = expense.decision;

  return {
    expenseId: expense.id,
    employeeId: expense.employeeId,
    description: expense.description,
    category: expense.category,
    amountCents: expense.amount.cents,
    submittedOn: expense.submittedOn.toString(),
    status: expense.status,
    requiredRole: expense.requiredRole,
    decision: decision
      ? {
          outcome: decision.outcome,
          decidedBy: decision.decidedBy,
          decidedOn: decision.decidedOn.toString(),
          reason: decision.outcome === "rejected" ? decision.reason : null,
        }
      : null,
  };
}

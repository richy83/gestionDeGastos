import type { ExpenseView } from "@/application/expense-view";

export type ManualDecisionFailure =
  | "expense_not_found"
  | "invalid_actor"
  | "invalid_role"
  | "already_resolved"
  | "self_decision_forbidden"
  | "insufficient_role"
  | "invalid_rejection_reason";

export type ManualDecisionResult =
  | { readonly ok: true; readonly expense: ExpenseView }
  | { readonly ok: false; readonly reason: ManualDecisionFailure };

import { DomainRuleViolation } from "@/domain/domain-rule-violation";

export const EXPENSE_CATEGORIES = [
  "travel",
  "meals",
  "equipment",
  "training",
  "personal",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export function parseExpenseCategory(value: string): ExpenseCategory {
  if (EXPENSE_CATEGORIES.some((category) => category === value)) {
    return value as ExpenseCategory;
  }

  throw new DomainRuleViolation("Expense category is invalid");
}

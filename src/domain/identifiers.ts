import { DomainRuleViolation } from "@/domain/domain-rule-violation";

export type ExpenseId = string & { readonly __brand: "ExpenseId" };
export type EmployeeId = string & { readonly __brand: "EmployeeId" };

function identifier<T extends string>(value: string, name: string): T {
  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new DomainRuleViolation(`${name} cannot be empty`);
  }

  return normalized as T;
}

export const expenseId = (value: string): ExpenseId =>
  identifier<ExpenseId>(value, "Expense id");

export const employeeId = (value: string): EmployeeId =>
  identifier<EmployeeId>(value, "Employee id");

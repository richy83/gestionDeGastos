import { Expense } from "@/domain/expense";
import { parseExpenseCategory } from "@/domain/expense-category";
import { employeeId, expenseId } from "@/domain/identifiers";
import { LocalDate } from "@/domain/local-date";
import { Money } from "@/domain/money";

export function createExpense(input?: {
  amountCents?: number;
  category?: string;
  employee?: string;
}): Expense {
  return Expense.submit({
    id: expenseId("expense-1"),
    employeeId: employeeId(input?.employee ?? "employee-ada"),
    description: "Course registration",
    category: parseExpenseCategory(input?.category ?? "training"),
    amount: Money.fromCents(input?.amountCents ?? 60_000),
    submittedOn: LocalDate.parse("2026-10-01"),
  });
}

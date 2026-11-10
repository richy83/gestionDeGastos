import { toExpenseView, type ExpenseView } from "@/application/expense-view";
import { notifyResolvedExpense } from "@/application/notify-resolved-expense";
import type { Clock } from "@/application/ports/clock";
import type { ExpenseRepository } from "@/application/ports/expense-repository";
import type { IdGenerator } from "@/application/ports/id-generator";
import type { NotificationGateway } from "@/application/ports/notification-gateway";
import { DomainRuleViolation } from "@/domain/domain-rule-violation";
import { Expense } from "@/domain/expense";
import { parseExpenseCategory } from "@/domain/expense-category";
import { employeeId } from "@/domain/identifiers";
import { Money } from "@/domain/money";

export type SubmitExpenseInput = Readonly<{
  employeeId: string;
  description: string;
  category: string;
  amountCents: number;
}>;

export type SubmitExpenseResult =
  | { readonly ok: true; readonly expense: ExpenseView }
  | { readonly ok: false; readonly reason: "invalid_expense" };

export interface SubmitExpenseUseCase {
  execute(input: SubmitExpenseInput): Promise<SubmitExpenseResult>;
}

export class SubmitExpense implements SubmitExpenseUseCase {
  constructor(
    private readonly expenses: ExpenseRepository,
    private readonly notifications: NotificationGateway,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
  ) {}

  async execute(input: SubmitExpenseInput): Promise<SubmitExpenseResult> {
    let expense: Expense;

    try {
      expense = Expense.submit({
        id: this.ids.nextExpenseId(),
        employeeId: employeeId(input.employeeId),
        description: input.description,
        category: parseExpenseCategory(input.category),
        amount: Money.fromCents(input.amountCents),
        submittedOn: this.clock.today(),
      });
    } catch (error: unknown) {
      if (error instanceof DomainRuleViolation) {
        return { ok: false, reason: "invalid_expense" };
      }

      throw error;
    }

    await this.expenses.save(expense);
    await notifyResolvedExpense(this.notifications, expense);

    return { ok: true, expense: toExpenseView(expense) };
  }
}

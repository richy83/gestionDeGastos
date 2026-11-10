import { toExpenseView } from "@/application/expense-view";
import type { ManualDecisionResult } from "@/application/manual-decision";
import { notifyResolvedExpense } from "@/application/notify-resolved-expense";
import type { Clock } from "@/application/ports/clock";
import type { ExpenseRepository } from "@/application/ports/expense-repository";
import type { NotificationGateway } from "@/application/ports/notification-gateway";
import { DomainRuleViolation } from "@/domain/domain-rule-violation";
import { parseApproverRole } from "@/domain/expense";
import {
  employeeId,
  expenseId,
  type ExpenseId,
} from "@/domain/identifiers";

export type ApproveExpenseInput = Readonly<{
  expenseId: string;
  approverId: string;
  role: string;
}>;

export interface ApproveExpenseUseCase {
  execute(input: ApproveExpenseInput): Promise<ManualDecisionResult>;
}

export class ApproveExpense implements ApproveExpenseUseCase {
  constructor(
    private readonly expenses: ExpenseRepository,
    private readonly notifications: NotificationGateway,
    private readonly clock: Clock,
  ) {}

  async execute(input: ApproveExpenseInput): Promise<ManualDecisionResult> {
    let id: ExpenseId;

    try {
      id = expenseId(input.expenseId);
    } catch (error: unknown) {
      if (error instanceof DomainRuleViolation) {
        return { ok: false, reason: "expense_not_found" };
      }
      throw error;
    }

    const expense = await this.expenses.findById(id);

    if (!expense) {
      return { ok: false, reason: "expense_not_found" };
    }

    try {
      const result = expense.approve(
        {
          employeeId: employeeId(input.approverId),
          role: parseApproverRole(input.role),
        },
        this.clock.today(),
      );

      if (!result.ok) {
        return result;
      }

      await this.expenses.save(result.expense);
      await notifyResolvedExpense(this.notifications, result.expense);

      return { ok: true, expense: toExpenseView(result.expense) };
    } catch (error: unknown) {
      if (error instanceof DomainRuleViolation) {
        return {
          ok: false,
          reason:
            error.message === "Approver role is invalid"
              ? "invalid_role"
              : "invalid_actor",
        };
      }

      throw error;
    }
  }
}

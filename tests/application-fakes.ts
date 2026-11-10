import type { Clock } from "@/application/ports/clock";
import type { ExpenseRepository } from "@/application/ports/expense-repository";
import type { IdGenerator } from "@/application/ports/id-generator";
import type {
  ExpenseResolvedNotification,
  NotificationGateway,
} from "@/application/ports/notification-gateway";
import type { Expense } from "@/domain/expense";
import { expenseId, type ExpenseId } from "@/domain/identifiers";
import { LocalDate } from "@/domain/local-date";

export class ExpenseRepositoryFake implements ExpenseRepository {
  private readonly expenses = new Map<ExpenseId, Expense>();

  constructor(seed: readonly Expense[] = []) {
    for (const expense of seed) this.expenses.set(expense.id, expense);
  }

  async findById(id: ExpenseId): Promise<Expense | null> {
    return this.expenses.get(id) ?? null;
  }

  async save(expense: Expense): Promise<void> {
    this.expenses.set(expense.id, expense);
  }
}

export class NotificationGatewayFake implements NotificationGateway {
  readonly sent: ExpenseResolvedNotification[] = [];

  async notifyExpenseResolved(
    notification: ExpenseResolvedNotification,
  ): Promise<void> {
    this.sent.push(notification);
  }
}

export class ClockFake implements Clock {
  today(): LocalDate {
    return LocalDate.parse("2026-10-02");
  }
}

export class IdGeneratorFake implements IdGenerator {
  nextExpenseId(): ExpenseId {
    return expenseId("expense-42");
  }
}

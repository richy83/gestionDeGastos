import type { ExpenseRepository } from "@/application/ports/expense-repository";
import type { Expense } from "@/domain/expense";
import type { ExpenseId } from "@/domain/identifiers";

export class InMemoryExpenseRepository implements ExpenseRepository {
  private readonly expenses = new Map<ExpenseId, Expense>();

  constructor(seed: readonly Expense[] = []) {
    for (const expense of seed) {
      this.expenses.set(expense.id, expense);
    }
  }

  async findById(id: ExpenseId): Promise<Expense | null> {
    return this.expenses.get(id) ?? null;
  }

  async save(expense: Expense): Promise<void> {
    this.expenses.set(expense.id, expense);
  }
}

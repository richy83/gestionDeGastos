import type { Expense } from "@/domain/expense";
import type { ExpenseId } from "@/domain/identifiers";

export interface ExpenseRepository {
  findById(id: ExpenseId): Promise<Expense | null>;
  save(expense: Expense): Promise<void>;
}

import type { IdGenerator } from "@/application/ports/id-generator";
import { expenseId, type ExpenseId } from "@/domain/identifiers";

export class IncrementalIdGenerator implements IdGenerator {
  private current = 0;

  nextExpenseId(): ExpenseId {
    this.current += 1;
    return expenseId(`expense-${this.current}`);
  }
}

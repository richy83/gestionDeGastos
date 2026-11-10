import type { ExpenseStatus } from "@/domain/expense";
import type { EmployeeId, ExpenseId } from "@/domain/identifiers";

export type ExpenseResolvedNotification = Readonly<{
  expenseId: ExpenseId;
  employeeId: EmployeeId;
  status: Exclude<ExpenseStatus, "pending">;
  reason?: string;
}>;

export interface NotificationGateway {
  notifyExpenseResolved(
    notification: ExpenseResolvedNotification,
  ): Promise<void>;
}

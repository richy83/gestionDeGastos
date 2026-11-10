import type { NotificationGateway } from "@/application/ports/notification-gateway";
import type { Expense } from "@/domain/expense";

export async function notifyResolvedExpense(
  notifications: NotificationGateway,
  expense: Expense,
): Promise<void> {
  if (!expense.isResolved()) {
    return;
  }

  const decision = expense.decision;

  if (!decision) {
    return;
  }

  await notifications.notifyExpenseResolved({
    expenseId: expense.id,
    employeeId: expense.employeeId,
    status: expense.status === "approved" ? "approved" : "rejected",
    ...(decision.outcome === "rejected" ? { reason: decision.reason } : {}),
  });
}

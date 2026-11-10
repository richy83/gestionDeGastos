import { ApproveExpenseController } from "@/adapters/http/approve-expense-controller";
import { SubmitExpenseController } from "@/adapters/http/submit-expense-controller";
import { IncrementalIdGenerator } from "@/adapters/identity/incremental-id-generator";
import { RecordingNotificationGateway } from "@/adapters/notifications/recording-notification-gateway";
import { InMemoryExpenseRepository } from "@/adapters/persistence/in-memory-expense-repository";
import { FixedClock } from "@/adapters/time/fixed-clock";
import { ApproveExpense } from "@/application/approve-expense";
import { SubmitExpense } from "@/application/submit-expense";
import { LocalDate } from "@/domain/local-date";

const expenses = new InMemoryExpenseRepository();
const notifications = new RecordingNotificationGateway();
const clock = new FixedClock(LocalDate.parse("2026-10-01"));
const ids = new IncrementalIdGenerator();

const submitController = new SubmitExpenseController(
  new SubmitExpense(expenses, notifications, clock, ids),
);
const approveController = new ApproveExpenseController(
  new ApproveExpense(expenses, notifications, clock),
);

const submitted = await submitController.handle({
  body: {
    employeeId: "employee-ada",
    description: "Advanced TypeScript course",
    category: "training",
    amountCents: 60_000,
  },
});

const approved = await approveController.handle({
  params: { expenseId: "expense-1" },
  body: { approverId: "manager-grace", role: "manager" },
});

console.log({ submitted, approved, notifications: notifications.sent });

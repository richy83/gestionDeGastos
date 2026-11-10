import { describe, expect, test } from "bun:test";
import { ApproveExpenseController } from "@/adapters/http/approve-expense-controller";
import { SubmitExpenseController } from "@/adapters/http/submit-expense-controller";
import { IncrementalIdGenerator } from "@/adapters/identity/incremental-id-generator";
import { RecordingNotificationGateway } from "@/adapters/notifications/recording-notification-gateway";
import { InMemoryExpenseRepository } from "@/adapters/persistence/in-memory-expense-repository";
import { FixedClock } from "@/adapters/time/fixed-clock";
import { ApproveExpense } from "@/application/approve-expense";
import { SubmitExpense } from "@/application/submit-expense";
import { employeeId, expenseId } from "@/domain/identifiers";
import { LocalDate } from "@/domain/local-date";

describe("expense approval acceptance", () => {
  test("submits a pending expense and approves it through HTTP", async () => {
    const repository = new InMemoryExpenseRepository();
    const notifications = new RecordingNotificationGateway();
    const clock = new FixedClock(LocalDate.parse("2026-10-01"));
    const submit = new SubmitExpenseController(
      new SubmitExpense(
        repository,
        notifications,
        clock,
        new IncrementalIdGenerator(),
      ),
    );
    const approve = new ApproveExpenseController(
      new ApproveExpense(repository, notifications, clock),
    );

    const submitted = await submit.handle({
      body: {
        employeeId: "employee-ada",
        description: "Advanced course",
        category: "training",
        amountCents: 60_000,
      },
    });
    const approved = await approve.handle({
      params: { expenseId: "expense-1" },
      body: { approverId: "manager-grace", role: "manager" },
    });

    expect(submitted).toMatchObject({
      status: 201,
      body: { status: "pending", requiredRole: "manager" },
    });
    expect(approved).toMatchObject({
      status: 200,
      body: { status: "approved" },
    });
    expect(notifications.sent).toEqual([
      {
        expenseId: expenseId("expense-1"),
        employeeId: employeeId("employee-ada"),
        status: "approved",
      },
    ]);
  });
});

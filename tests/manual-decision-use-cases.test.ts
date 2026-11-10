import { describe, expect, test } from "bun:test";
import { ApproveExpense } from "@/application/approve-expense";
import { RejectExpense } from "@/application/reject-expense";
import { expenseId } from "@/domain/identifiers";
import {
  ClockFake,
  ExpenseRepositoryFake,
  NotificationGatewayFake,
} from "./application-fakes";
import { createExpense } from "./fixtures";

describe("manual decision use cases", () => {
  test("persists an approval and sends a notification", async () => {
    const repository = new ExpenseRepositoryFake([createExpense()]);
    const notifications = new NotificationGatewayFake();
    const useCase = new ApproveExpense(
      repository,
      notifications,
      new ClockFake(),
    );

    const result = await useCase.execute({
      expenseId: "expense-1",
      approverId: "manager-grace",
      role: "manager",
    });

    expect(result).toMatchObject({ ok: true, expense: { status: "approved" } });
    expect(notifications.sent).toHaveLength(1);
  });

  test("persists a rejection with its reason", async () => {
    const repository = new ExpenseRepositoryFake([createExpense()]);
    const notifications = new NotificationGatewayFake();
    const useCase = new RejectExpense(
      repository,
      notifications,
      new ClockFake(),
    );

    const result = await useCase.execute({
      expenseId: "expense-1",
      approverId: "manager-grace",
      role: "manager",
      reason: "Budget exhausted",
    });

    expect(result).toMatchObject({
      ok: true,
      expense: {
        status: "rejected",
        decision: { reason: "Budget exhausted" },
      },
    });
  });

  test("does not persist or notify a rejected operation", async () => {
    const original = createExpense();
    const repository = new ExpenseRepositoryFake([original]);
    const notifications = new NotificationGatewayFake();
    const useCase = new ApproveExpense(
      repository,
      notifications,
      new ClockFake(),
    );

    const result = await useCase.execute({
      expenseId: "expense-1",
      approverId: "employee-ada",
      role: "manager",
    });

    expect(result).toEqual({
      ok: false,
      reason: "self_decision_forbidden",
    });
    expect(await repository.findById(expenseId("expense-1"))).toBe(original);
    expect(notifications.sent).toHaveLength(0);
  });
});

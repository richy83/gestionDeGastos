import { describe, expect, test } from "bun:test";
import { SubmitExpense } from "@/application/submit-expense";
import { expenseId } from "@/domain/identifiers";
import {
  ClockFake,
  ExpenseRepositoryFake,
  IdGeneratorFake,
  NotificationGatewayFake,
} from "./application-fakes";

describe("SubmitExpense", () => {
  test("persists and notifies an automatically approved expense", async () => {
    const repository = new ExpenseRepositoryFake();
    const notifications = new NotificationGatewayFake();
    const useCase = new SubmitExpense(
      repository,
      notifications,
      new ClockFake(),
      new IdGeneratorFake(),
    );

    const result = await useCase.execute({
      employeeId: "employee-ada",
      description: "Team lunch",
      category: "meals",
      amountCents: 4_500,
    });

    expect(result.ok).toBe(true);
    expect(await repository.findById(expenseId("expense-42"))).not.toBeNull();
    expect(notifications.sent).toHaveLength(1);
  });

  test("does not notify while manual approval is pending", async () => {
    const repository = new ExpenseRepositoryFake();
    const notifications = new NotificationGatewayFake();
    const useCase = new SubmitExpense(
      repository,
      notifications,
      new ClockFake(),
      new IdGeneratorFake(),
    );

    const result = await useCase.execute({
      employeeId: "employee-ada",
      description: "Advanced course",
      category: "training",
      amountCents: 60_000,
    });

    expect(result).toMatchObject({
      ok: true,
      expense: { status: "pending", requiredRole: "manager" },
    });
    expect(notifications.sent).toHaveLength(0);
  });

  test("returns an expected failure for invalid data", async () => {
    const useCase = new SubmitExpense(
      new ExpenseRepositoryFake(),
      new NotificationGatewayFake(),
      new ClockFake(),
      new IdGeneratorFake(),
    );

    expect(
      await useCase.execute({
        employeeId: "employee-ada",
        description: "",
        category: "training",
        amountCents: 60_000,
      }),
    ).toEqual({ ok: false, reason: "invalid_expense" });
  });
});

import { describe, expect, test } from "bun:test";
import { ApproveExpenseController } from "@/adapters/http/approve-expense-controller";
import { RejectExpenseController } from "@/adapters/http/reject-expense-controller";
import { SubmitExpenseController } from "@/adapters/http/submit-expense-controller";
import type {
  ApproveExpenseInput,
  ApproveExpenseUseCase,
} from "@/application/approve-expense";
import type { ManualDecisionResult } from "@/application/manual-decision";
import type {
  RejectExpenseInput,
  RejectExpenseUseCase,
} from "@/application/reject-expense";
import type {
  SubmitExpenseInput,
  SubmitExpenseResult,
  SubmitExpenseUseCase,
} from "@/application/submit-expense";

class SubmitStub implements SubmitExpenseUseCase {
  constructor(private readonly result: SubmitExpenseResult) {}
  async execute(_input: SubmitExpenseInput): Promise<SubmitExpenseResult> {
    return this.result;
  }
}

class ApproveStub implements ApproveExpenseUseCase {
  constructor(private readonly result: ManualDecisionResult) {}
  async execute(_input: ApproveExpenseInput): Promise<ManualDecisionResult> {
    return this.result;
  }
}

class RejectStub implements RejectExpenseUseCase {
  constructor(private readonly result: ManualDecisionResult) {}
  async execute(_input: RejectExpenseInput): Promise<ManualDecisionResult> {
    return this.result;
  }
}

describe("HTTP controllers", () => {
  test("rejects malformed submit input with 400", async () => {
    const controller = new SubmitExpenseController(
      new SubmitStub({ ok: false, reason: "invalid_expense" }),
    );

    const response = await controller.handle({
      body: { employeeId: "employee-ada" },
    });

    expect(response.status).toBe(400);
  });

  test("maps invalid business data to 422", async () => {
    const controller = new SubmitExpenseController(
      new SubmitStub({ ok: false, reason: "invalid_expense" }),
    );

    const response = await controller.handle({
      body: {
        employeeId: "employee-ada",
        description: "Course",
        category: "unknown",
        amountCents: 10_000,
      },
    });

    expect(response.status).toBe(422);
  });

  test("maps a missing expense to 404", async () => {
    const controller = new ApproveExpenseController(
      new ApproveStub({ ok: false, reason: "expense_not_found" }),
    );

    const response = await controller.handle({
      params: { expenseId: "expense-404" },
      body: { approverId: "manager-grace", role: "manager" },
    });

    expect(response.status).toBe(404);
  });

  test("maps a rejected decision to 409", async () => {
    const controller = new RejectExpenseController(
      new RejectStub({ ok: false, reason: "already_resolved" }),
    );

    const response = await controller.handle({
      params: { expenseId: "expense-1" },
      body: {
        approverId: "manager-grace",
        role: "manager",
        reason: "No budget",
      },
    });

    expect(response.status).toBe(409);
  });
});

import { describe, expect, test } from "bun:test";
import { createExpense } from "./fixtures";

describe("Expense submission policy", () => {
  test("automatically approves expenses up to one hundred euros", () => {
    const expense = createExpense({ amountCents: 10_000, category: "meals" });

    expect(expense.status).toBe("approved");
    expect(expense.decision?.decidedBy).toBe("system");
  });

  test("requires a manager above one hundred euros", () => {
    const expense = createExpense({ amountCents: 10_001 });

    expect(expense.status).toBe("pending");
    expect(expense.requiredRole).toBe("manager");
  });

  test("requires finance above one thousand euros", () => {
    const expense = createExpense({ amountCents: 100_001 });

    expect(expense.status).toBe("pending");
    expect(expense.requiredRole).toBe("finance");
  });

  test("rejects personal expenses before considering their amount", () => {
    const expense = createExpense({ amountCents: 2_000, category: "personal" });

    expect(expense.status).toBe("rejected");
    expect(expense.decision).toMatchObject({
      decidedBy: "system",
      reason: "personal_expense_not_allowed",
    });
  });
});

import { describe, expect, test } from "bun:test";
import { employeeId } from "@/domain/identifiers";
import { LocalDate } from "@/domain/local-date";
import { createExpense } from "./fixtures";

const DECISION_DATE = LocalDate.parse("2026-10-02");

describe("Expense manual decisions", () => {
  test("approves with the required role", () => {
    const result = createExpense().approve(
      { employeeId: employeeId("manager-grace"), role: "manager" },
      DECISION_DATE,
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.expense.status).toBe("approved");
  });

  test("prevents an employee from approving their own expense", () => {
    const result = createExpense().approve(
      { employeeId: employeeId("employee-ada"), role: "manager" },
      DECISION_DATE,
    );

    expect(result).toEqual({ ok: false, reason: "self_decision_forbidden" });
  });

  test("rejects an insufficient role", () => {
    const result = createExpense({ amountCents: 150_000 }).approve(
      { employeeId: employeeId("manager-grace"), role: "manager" },
      DECISION_DATE,
    );

    expect(result).toEqual({ ok: false, reason: "insufficient_role" });
  });

  test("requires a reason for manual rejection", () => {
    const result = createExpense().reject(
      { employeeId: employeeId("manager-grace"), role: "manager" },
      DECISION_DATE,
      "   ",
    );

    expect(result).toEqual({
      ok: false,
      reason: "invalid_rejection_reason",
    });
  });

  test("preserves the first decision", () => {
    const first = createExpense().approve(
      { employeeId: employeeId("manager-grace"), role: "manager" },
      DECISION_DATE,
    );

    if (!first.ok) throw new Error("Expected the first decision to succeed");

    const second = first.expense.reject(
      { employeeId: employeeId("manager-linus"), role: "manager" },
      DECISION_DATE,
      "Changed my mind",
    );

    expect(second).toEqual({ ok: false, reason: "already_resolved" });
    expect(first.expense.status).toBe("approved");
  });
});

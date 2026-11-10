import { DomainRuleViolation } from "@/domain/domain-rule-violation";
import type { ExpenseCategory } from "@/domain/expense-category";
import type { EmployeeId, ExpenseId } from "@/domain/identifiers";
import type { LocalDate } from "@/domain/local-date";
import { Money } from "@/domain/money";

export const APPROVER_ROLES = ["manager", "finance"] as const;
export type ApproverRole = (typeof APPROVER_ROLES)[number];
export type ExpenseStatus = "pending" | "approved" | "rejected";

export type ExpenseDecision =
  | Readonly<{
      outcome: "approved";
      decidedBy: EmployeeId | "system";
      decidedOn: LocalDate;
    }>
  | Readonly<{
      outcome: "rejected";
      decidedBy: EmployeeId | "system";
      decidedOn: LocalDate;
      reason: string;
    }>;

type ExpenseState =
  | Readonly<{ status: "pending"; requiredRole: ApproverRole }>
  | Readonly<{ status: "approved"; decision: ExpenseDecision }>
  | Readonly<{ status: "rejected"; decision: ExpenseDecision }>;

export type ResolveExpenseResult =
  | { readonly ok: true; readonly expense: Expense }
  | {
      readonly ok: false;
      readonly reason:
        | "already_resolved"
        | "self_decision_forbidden"
        | "insufficient_role"
        | "invalid_rejection_reason";
    };

export type DecisionActor = Readonly<{
  employeeId: EmployeeId;
  role: ApproverRole;
}>;

const AUTO_APPROVAL_LIMIT = Money.fromCents(10_000);
const MANAGER_APPROVAL_LIMIT = Money.fromCents(100_000);

export function parseApproverRole(value: string): ApproverRole {
  if (APPROVER_ROLES.some((role) => role === value)) {
    return value as ApproverRole;
  }

  throw new DomainRuleViolation("Approver role is invalid");
}

export class Expense {
  private constructor(
    readonly id: ExpenseId,
    readonly employeeId: EmployeeId,
    readonly description: string,
    readonly category: ExpenseCategory,
    readonly amount: Money,
    readonly submittedOn: LocalDate,
    private readonly state: ExpenseState,
  ) {}

  static submit(input: {
    id: ExpenseId;
    employeeId: EmployeeId;
    description: string;
    category: ExpenseCategory;
    amount: Money;
    submittedOn: LocalDate;
  }): Expense {
    const description = input.description.trim();

    if (description.length === 0) {
      throw new DomainRuleViolation("Expense description cannot be empty");
    }

    if (input.amount.cents === 0) {
      throw new DomainRuleViolation("Expense amount must be greater than zero");
    }

    const state = Expense.initialState(
      input.category,
      input.amount,
      input.submittedOn,
    );

    return new Expense(
      input.id,
      input.employeeId,
      description,
      input.category,
      input.amount,
      input.submittedOn,
      state,
    );
  }

  private static initialState(
    category: ExpenseCategory,
    amount: Money,
    submittedOn: LocalDate,
  ): ExpenseState {
    if (category === "personal") {
      return {
        status: "rejected",
        decision: {
          outcome: "rejected",
          decidedBy: "system",
          decidedOn: submittedOn,
          reason: "personal_expense_not_allowed",
        },
      };
    }

    if (!amount.isGreaterThan(AUTO_APPROVAL_LIMIT)) {
      return {
        status: "approved",
        decision: {
          outcome: "approved",
          decidedBy: "system",
          decidedOn: submittedOn,
        },
      };
    }

    return {
      status: "pending",
      requiredRole: amount.isGreaterThan(MANAGER_APPROVAL_LIMIT)
        ? "finance"
        : "manager",
    };
  }

  get status(): ExpenseStatus {
    return this.state.status;
  }

  get requiredRole(): ApproverRole | null {
    return this.state.status === "pending" ? this.state.requiredRole : null;
  }

  get decision(): ExpenseDecision | null {
    return this.state.status === "pending" ? null : this.state.decision;
  }

  isResolved(): boolean {
    return this.state.status !== "pending";
  }

  approve(actor: DecisionActor, decidedOn: LocalDate): ResolveExpenseResult {
    const rejection = this.validateActor(actor);

    if (rejection) {
      return { ok: false, reason: rejection };
    }

    return {
      ok: true,
      expense: this.withState({
        status: "approved",
        decision: {
          outcome: "approved",
          decidedBy: actor.employeeId,
          decidedOn,
        },
      }),
    };
  }

  reject(
    actor: DecisionActor,
    decidedOn: LocalDate,
    reason: string,
  ): ResolveExpenseResult {
    const rejection = this.validateActor(actor);

    if (rejection) {
      return { ok: false, reason: rejection };
    }

    const normalizedReason = reason.trim();

    if (normalizedReason.length === 0) {
      return { ok: false, reason: "invalid_rejection_reason" };
    }

    return {
      ok: true,
      expense: this.withState({
        status: "rejected",
        decision: {
          outcome: "rejected",
          decidedBy: actor.employeeId,
          decidedOn,
          reason: normalizedReason,
        },
      }),
    };
  }

  private validateActor(
    actor: DecisionActor,
  ):
    | "already_resolved"
    | "self_decision_forbidden"
    | "insufficient_role"
    | null {
    if (this.state.status !== "pending") {
      return "already_resolved";
    }

    if (actor.employeeId === this.employeeId) {
      return "self_decision_forbidden";
    }

    if (actor.role !== this.state.requiredRole) {
      return "insufficient_role";
    }

    return null;
  }

  private withState(state: ExpenseState): Expense {
    return new Expense(
      this.id,
      this.employeeId,
      this.description,
      this.category,
      this.amount,
      this.submittedOn,
      state,
    );
  }
}

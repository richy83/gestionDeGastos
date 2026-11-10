import type {
  RejectExpenseInput,
  RejectExpenseUseCase,
} from "@/application/reject-expense";
import {
  isRecord,
  nonEmptyString,
  type HttpRequest,
  type HttpResponse,
} from "@/adapters/http/http";
import { manualDecisionResponse } from "@/adapters/http/manual-decision-response";

function parseInput(request: HttpRequest): RejectExpenseInput | null {
  if (
    !nonEmptyString(request.params?.expenseId) ||
    !isRecord(request.body) ||
    !nonEmptyString(request.body.approverId) ||
    !nonEmptyString(request.body.role) ||
    typeof request.body.reason !== "string"
  ) {
    return null;
  }

  return {
    expenseId: request.params.expenseId,
    approverId: request.body.approverId,
    role: request.body.role,
    reason: request.body.reason,
  };
}

export class RejectExpenseController {
  constructor(private readonly rejectExpense: RejectExpenseUseCase) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const input = parseInput(request);

    if (!input) {
      return { status: 400, body: { error: "invalid_request" } };
    }

    return manualDecisionResponse(await this.rejectExpense.execute(input));
  }
}

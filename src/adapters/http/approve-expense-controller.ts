import type {
  ApproveExpenseInput,
  ApproveExpenseUseCase,
} from "@/application/approve-expense";
import {
  isRecord,
  nonEmptyString,
  type HttpRequest,
  type HttpResponse,
} from "@/adapters/http/http";
import { manualDecisionResponse } from "@/adapters/http/manual-decision-response";

function parseInput(request: HttpRequest): ApproveExpenseInput | null {
  if (
    !nonEmptyString(request.params?.expenseId) ||
    !isRecord(request.body) ||
    !nonEmptyString(request.body.approverId) ||
    !nonEmptyString(request.body.role)
  ) {
    return null;
  }

  return {
    expenseId: request.params.expenseId,
    approverId: request.body.approverId,
    role: request.body.role,
  };
}

export class ApproveExpenseController {
  constructor(private readonly approveExpense: ApproveExpenseUseCase) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const input = parseInput(request);

    if (!input) {
      return { status: 400, body: { error: "invalid_request" } };
    }

    return manualDecisionResponse(await this.approveExpense.execute(input));
  }
}

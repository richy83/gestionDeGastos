import type {
  SubmitExpenseInput,
  SubmitExpenseUseCase,
} from "@/application/submit-expense";
import {
  isRecord,
  nonEmptyString,
  type HttpRequest,
  type HttpResponse,
} from "@/adapters/http/http";

function parseInput(body: unknown): SubmitExpenseInput | null {
  if (
    !isRecord(body) ||
    !nonEmptyString(body.employeeId) ||
    !nonEmptyString(body.description) ||
    !nonEmptyString(body.category) ||
    typeof body.amountCents !== "number" ||
    !Number.isSafeInteger(body.amountCents)
  ) {
    return null;
  }

  return {
    employeeId: body.employeeId,
    description: body.description,
    category: body.category,
    amountCents: body.amountCents,
  };
}

export class SubmitExpenseController {
  constructor(private readonly submitExpense: SubmitExpenseUseCase) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const input = parseInput(request.body);

    if (!input) {
      return { status: 400, body: { error: "invalid_request" } };
    }

    const result = await this.submitExpense.execute(input);

    return result.ok
      ? { status: 201, body: result.expense }
      : { status: 422, body: { error: result.reason } };
  }
}

import type { ManualDecisionResult } from "@/application/manual-decision";
import type { HttpResponse } from "@/adapters/http/http";

export function manualDecisionResponse(
  result: ManualDecisionResult,
): HttpResponse {
  if (result.ok) {
    return { status: 200, body: result.expense };
  }

  if (result.reason === "expense_not_found") {
    return { status: 404, body: { error: result.reason } };
  }

  if (
    result.reason === "invalid_actor" ||
    result.reason === "invalid_role" ||
    result.reason === "invalid_rejection_reason"
  ) {
    return { status: 422, body: { error: result.reason } };
  }

  return { status: 409, body: { error: result.reason } };
}

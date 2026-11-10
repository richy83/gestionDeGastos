export type HttpRequest = Readonly<{
  params?: Readonly<Record<string, string | undefined>>;
  body: unknown;
}>;

export type HttpResponse = Readonly<{
  status: number;
  body: unknown;
}>;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

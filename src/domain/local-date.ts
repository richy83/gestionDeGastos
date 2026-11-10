import { DomainRuleViolation } from "@/domain/domain-rule-violation";

const MILLISECONDS_PER_DAY = 86_400_000;

export class LocalDate {
  private constructor(private readonly epochDay: number) {}

  static parse(value: string): LocalDate {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) {
      throw new DomainRuleViolation("Date must use YYYY-MM-DD format");
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const timestamp = Date.UTC(year, month - 1, day);
    const parsed = new Date(timestamp);

    if (
      parsed.getUTCFullYear() !== year ||
      parsed.getUTCMonth() !== month - 1 ||
      parsed.getUTCDate() !== day
    ) {
      throw new DomainRuleViolation("Date is not a valid calendar day");
    }

    return new LocalDate(timestamp / MILLISECONDS_PER_DAY);
  }

  static fromDate(value: Date): LocalDate {
    return new LocalDate(
      Date.UTC(
        value.getUTCFullYear(),
        value.getUTCMonth(),
        value.getUTCDate(),
      ) / MILLISECONDS_PER_DAY,
    );
  }

  toString(): string {
    return new Date(this.epochDay * MILLISECONDS_PER_DAY)
      .toISOString()
      .slice(0, 10);
  }
}

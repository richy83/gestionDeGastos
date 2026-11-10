import { DomainRuleViolation } from "@/domain/domain-rule-violation";

export class Money {
  private constructor(readonly cents: number) {}

  static fromCents(cents: number): Money {
    if (!Number.isSafeInteger(cents) || cents < 0) {
      throw new DomainRuleViolation(
        "Money must contain a non-negative integer number of cents",
      );
    }

    return new Money(cents);
  }

  isGreaterThan(other: Money): boolean {
    return this.cents > other.cents;
  }
}

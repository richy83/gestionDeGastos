import type {
  ExpenseResolvedNotification,
  NotificationGateway,
} from "@/application/ports/notification-gateway";

export class RecordingNotificationGateway implements NotificationGateway {
  readonly sent: ExpenseResolvedNotification[] = [];

  async notifyExpenseResolved(
    notification: ExpenseResolvedNotification,
  ): Promise<void> {
    this.sent.push(notification);
  }
}

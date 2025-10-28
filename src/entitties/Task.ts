type TaskStatus = "todo" | "in_progress" | "completed" | "cancelled";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: Date;
  createdAt: Date;
  updatedAt?: Date;
  userId: string;
}

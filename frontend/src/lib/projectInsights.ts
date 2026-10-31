
export type InsightTask = {
  id: number;
  project_id?: number | null;
  project_name?: string | null;
  title: string;
  status: string;
  priority?: string | null;
  due_date?: string | null;
};

export type InsightProject = {
  id: number;
  name: string;
  progress?: number | null;
  status?: string | null;
};

export function getProjectTasks(
  project: InsightProject,
  tasks: InsightTask[],
): InsightTask[] {
  return tasks.filter((task) => {
    if (task.project_id != null) {
      return Number(task.project_id) === Number(project.id);
    }

    // Use the project name only when the task has no project ID.
    return (
      task.project_name?.trim().toLowerCase() ===
      project.name.trim().toLowerCase()
    );
  });
}

export function getProjectProgress(
  project: InsightProject,
  tasks: InsightTask[],
): number {
  const linkedTasks = getProjectTasks(project, tasks);

  // Preserve saved progress when no tasks are linked.
  if (linkedTasks.length === 0) {
    const savedProgress = Number(project.progress ?? 0);
    return Number.isFinite(savedProgress)
      ? Math.min(100, Math.max(0, savedProgress))
      : 0;
  }

  const completed = linkedTasks.filter(
    (task) => task.status?.trim().toLowerCase() === "completed",
  ).length;

  return Math.round((completed / linkedTasks.length) * 100);
}

export function getProjectRisks(
  project: InsightProject,
  tasks: InsightTask[],
  today = new Date().toISOString().slice(0, 10),
): string[] {
  const linkedTasks = getProjectTasks(project, tasks);
  const risks: string[] = [];

  const unfinished = linkedTasks.filter(
    (task) => task.status?.trim().toLowerCase() !== "completed",
  );

  const overdue = unfinished.filter(
    (task) => task.due_date && task.due_date < today,
  );

  const highPriority = unfinished.filter(
    (task) => task.priority?.trim().toLowerCase() === "high",
  );

  if (linkedTasks.length === 0) {
    risks.push("No tasks linked to this project");
  }

  if (overdue.length > 0) {
    risks.push(`${overdue.length} overdue task(s)`);
  }

  if (highPriority.length > 0) {
    risks.push(`${highPriority.length} unfinished high-priority task(s)`);
  }

  return risks;
}

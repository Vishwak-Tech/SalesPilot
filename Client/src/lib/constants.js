
/* Shared domain constants kept in one place so UI + filters stay in sync
   with the backend enums. */

export const LEAD_STAGES = [
  "New",
  "Qualified",
  "Proposal",
  "Won",
  "Lost",
];

export const PIPELINE_STAGES = [
  "New",
  "Qualified",
  "Proposal",
  "Won",
  "Lost",
];

export const LEAD_PRIORITIES = ["Low", "Medium", "High"];

export const LEAD_SOURCES = [
  "Website",
  "Referral",
  "Cold Outreach",
  "Social",
  "Event",
  "Other",
];

export const TASK_STATUSES = [
  "Pending",
  "In Progress",
  "Completed",
];

export const TASK_PRIORITIES = ["Low", "Medium", "High"];

/* Lead stage styles */

export const STAGE_STYLES = {
  New: {
    dot: "bg-graphite-400",
    badge: "bg-graphite-50 text-graphite-700",
    bar: "bg-graphite-400",
  },

  Qualified: {
    dot: "bg-ai-500",
    badge: "bg-ai-50 text-ai-700",
    bar: "bg-ai-500",
  },

  Proposal: {
    dot: "bg-brand-400",
    badge: "bg-brand-50 text-brand-700",
    bar: "bg-brand-400",
  },

  Won: {
    dot: "bg-brand-600",
    badge: "bg-brand-100 text-brand-800",
    bar: "bg-brand-600",
  },

  Lost: {
    dot: "bg-danger-600",
    badge: "bg-danger-50 text-danger-600",
    bar: "bg-danger-600",
  },
};

/* Lead and task priority styles */

export const PRIORITY_STYLES = {
  Low: "bg-graphite-100 text-graphite-600",
  Medium: "bg-brand-50 text-brand-700",
  High: "bg-danger-50 text-danger-600",
};

/* Task status styles */

export const TASK_STATUS_STYLES = {
  Pending: "bg-graphite-100 text-graphite-600",

  "In Progress": "bg-ai-50 text-ai-700",

  Completed: "bg-brand-100 text-brand-800",
};

import Lead from "../models/Lead.js";
import Contact from "../models/Contact.js";
import Task from "../models/Task.js";

import { asyncHandler } from "../utils/asyncHandler.js";

// Generate the last six months, including the current month.
const getLastSixMonths = () => {
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth() - i,
        1
      )
    );

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");

    months.push({
      key: `${year}-${month}`,
      label: date.toLocaleDateString("en-US", {
        month: "short",
        timeZone: "UTC",
      }),
      leads: 0,
      won: 0,
    });
  }

  return months;
};

// Generate CRM dashboard overview.
export const getOverview = asyncHandler(async (req, res) => {
  const owner = req.user._id;

  // Fetch independent database queries concurrently.
  const [
    leads,
    totalContacts,
    openTasks,
    recentLeads,
  ] = await Promise.all([
    Lead.find({ owner })
      .select("name company status value createdAt updatedAt")
      .lean(),

    Contact.countDocuments({ owner }),

    Task.countDocuments({
      owner,
      status: { $ne: "Completed" },
    }),

    Lead.find({ owner })
      .sort({ updatedAt: -1 })
      .limit(6)
      .select("name company status value updatedAt")
      .lean(),
  ]);

  // Initialize pipeline stages.
  const stages = [
    "New",
    "Qualified",
    "Proposal",
    "Won",
    "Lost",
  ];

  const byStage = Object.fromEntries(
    stages.map((stage) => [
      stage,
      { count: 0, value: 0 },
    ])
  );

  // Initialize dashboard metrics.
  let totalLeadValue = 0;
  let activePipelineValue = 0;
  let revenueWon = 0;

  // Initialize monthly trends.
  const trend = getLastSixMonths();

  const trendIndex = Object.fromEntries(
    trend.map((month, index) => [
      month.key,
      index,
    ])
  );

  // Process leads.
  for (const lead of leads) {
    const value = Number(lead.value) || 0;

    // Calculate overall lead value.
    totalLeadValue += value;

    // Calculate pipeline distribution.
    const stage = byStage[lead.status];

    if (stage) {
      stage.count += 1;
      stage.value += value;
    }

    // Exclude closed leads from active pipeline.
    if (
      lead.status !== "Won" &&
      lead.status !== "Lost"
    ) {
      activePipelineValue += value;
    }

    // Calculate won revenue.
    if (lead.status === "Won") {
      revenueWon += value;
    }

    // Calculate monthly lead trends using creation date.
    if (lead.createdAt) {
      const createdAt = new Date(lead.createdAt);

      if (!Number.isNaN(createdAt.getTime())) {
        const year = createdAt.getUTCFullYear();
        const month = String(
          createdAt.getUTCMonth() + 1
        ).padStart(2, "0");

        const key = `${year}-${month}`;
        const index = trendIndex[key];

        if (index !== undefined) {
          trend[index].leads += 1;

          // Won value is grouped by lead creation month,
          // not the actual date the lead was marked Won.
          if (lead.status === "Won") {
            trend[index].won += value;
          }
        }
      }
    }
  }

  // Calculate conversion rate from closed leads.
  const wonLeads = byStage.Won.count;
  const lostLeads = byStage.Lost.count;
  const closedLeads = wonLeads + lostLeads;

  const conversionRate =
    closedLeads > 0
      ? Math.round((wonLeads / closedLeads) * 100)
      : 0;

  // Format pipeline distribution.
  const pipeline = stages.map((stage) => ({
    stage,
    count: byStage[stage].count,
    value: byStage[stage].value,
  }));

  res.status(200).json({
    success: true,
    message: "Dashboard overview retrieved successfully.",

    data: {
      stats: {
        totalLeads: leads.length,
        totalContacts,
        openTasks,

        totalLeadValue,
        pipelineValue: activePipelineValue,
        revenueWon,

        conversionRate,
      },

      pipeline,
      trend,
      recentLeads: recentLeads.map((lead) => ({
        id: lead._id,
        name: lead.name,
        company: lead.company,
        status: lead.status,
        value: lead.value,
        updatedAt: lead.updatedAt,
      })),
    },
  });
});

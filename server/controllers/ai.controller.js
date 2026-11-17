
import Lead from "../models/Lead.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

import { generateLeadSummary } from "../services/ai/lead-ai.service.js";
import { generateEmail } from "../services/ai/email-ai.service.js";
import { generateSalesInsights } from "../services/ai/insight-ai.service.js";

import { generateEmailSchema } from "../validators/ai.validator.js";

// Validate MongoDB ObjectId.
const validateObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

// Generate and save AI lead analysis.
export const generateLeadAnalysis = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      throw new ApiError(400, "Invalid lead ID.");
    }

    // Always scope lead access to the authenticated user.
    const lead = await Lead.findOne({
      _id: id,
      owner: req.user._id,
    });

    if (!lead) {
      throw new ApiError(404, "Lead not found.");
    }

    // Generate analysis before modifying the database.
    const analysis = await generateLeadSummary(lead);

    // Persist only successfully generated and validated results.
    lead.aiSummary = analysis.summary;
    lead.aiRiskScore = analysis.riskScore;

    await lead.save();

    res.status(200).json({
      success: true,
      message: "Lead analysis generated successfully.",
      data: {
        leadId: lead._id,
        summary: analysis.summary,
        riskScore: analysis.riskScore,
        suggestedPriority: analysis.suggestedPriority,
        nextBestAction: analysis.nextBestAction,
      },
    });
  }
);

// Generate an AI-powered sales email.
export const generateLeadEmail = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      throw new ApiError(400, "Invalid lead ID.");
    }

    const validation = generateEmailSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ApiError(
        400,
        validation.error.issues[0].message
      );
    }

    const { purpose, tone, sender } = validation.data;

    // Verify that the lead belongs to the authenticated user.
    const lead = await Lead.findOne({
      _id: id,
      owner: req.user._id,
    });

    if (!lead) {
      throw new ApiError(404, "Lead not found.");
    }

    // Prefer the authenticated user's profile details.
    const email = await generateEmail({
      lead,
      purpose,
      tone,
      sender: {
        name: req.user.name || sender?.name || "Sales Team",
        company:
          req.user.company ||
          sender?.company ||
          "SalesPilot AI",
      },
    });

    res.status(200).json({
      success: true,
      message: "Sales email generated successfully.",
      data: {
        leadId: lead._id,
        subject: email.subject,
        body: email.body,
      },
    });
  }
);

// Generate AI-powered dashboard sales insights.
export const getSalesInsights = asyncHandler(
  async (req, res) => {
    // Aggregate only the authenticated user's leads.
    const [result] = await Lead.aggregate([
      {
        $match: {
          owner: req.user._id,
        },
      },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalLeads: { $sum: 1 },
                totalValue: {
                  $sum: { $ifNull: ["$value", 0] },
                },
                averageDealValue: {
                  $avg: "$value",
                },
              },
            },
          ],

          statusDistribution: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],

          priorityDistribution: [
            {
              $group: {
                _id: "$priority",
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const totals = result?.totals?.[0];

    if (!totals || totals.totalLeads === 0) {
      throw new ApiError(
        400,
        "Add some leads before generating sales insights."
      );
    }

    // Build a compact snapshot instead of sending lead documents.
    const pipelineStats = {
      totalLeads: totals.totalLeads,
      totalValue: totals.totalValue,
      averageDealValue: Math.round(
        totals.averageDealValue || 0
      ),

      statusDistribution: Object.fromEntries(
        result.statusDistribution.map((item) => [
          item._id,
          item.count,
        ])
      ),

      priorityDistribution: Object.fromEntries(
        result.priorityDistribution.map((item) => [
          item._id,
          item.count,
        ])
      ),
    };

    const insights = await generateSalesInsights(pipelineStats);

    res.status(200).json({
      success: true,
      message: "Sales insights generated successfully.",
      data: {
        ...insights,
        pipelineStats,
      },
    });
  }
);

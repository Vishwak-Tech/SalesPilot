
import "dotenv/config";
import mongoose from "mongoose";

import User from "./models/User.js";
import Lead from "./models/Lead.js";
import Contact from "./models/Contact.js";
import Note from "./models/Note.js";
import Task from "./models/Task.js";

const DEMO_EMAIL = "demo@salespilot.dev";
const DEMO_NAME = "Alex Morgan";
const DEMO_COMPANY = "Nexus Technologies";

const getDate = (daysFromNow) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

const seedDatabase = async () => {
  try {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Seeding is disabled in production.");
    }

    const mongoUri = process.env.MONGO_URI;
    const demoPassword = process.env.SEED_DEMO_PASSWORD;

    if (!mongoUri) throw new Error("MONGODB_URI is missing.");
    if (!demoPassword || demoPassword.length < 8) {
      throw new Error("SEED_DEMO_PASSWORD must be at least 8 characters.");
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected.");

    // Find or create the dedicated demo account.
    let user = await User.findOne({ email: DEMO_EMAIL });

    if (!user) {
      user = new User({
        name: DEMO_NAME,
        email: DEMO_EMAIL,
        password: demoPassword,
        role: "owner",
        company: DEMO_COMPANY,
      });
    } else {
      user.name = DEMO_NAME;
      user.password = demoPassword;
      user.role = "owner";
      user.company = DEMO_COMPANY;
    }

    // Save triggers the User model's bcrypt pre-save hook.
    await user.save();

    const owner = user._id;

    console.log(`Demo user ready: ${DEMO_EMAIL}`);

    // Delete only this demo user's existing records.
    await Promise.all([
      Lead.deleteMany({ owner }),
      Contact.deleteMany({ owner }),
      Note.deleteMany({ owner }),
      Task.deleteMany({ owner }),
    ]);

    console.log("Previous demo records cleared.");

    // ─────────────────────────────────────────
    // LEADS
    // ─────────────────────────────────────────

    const leads = await Lead.create([
      {
        owner,
        name: "Rahul Sharma",
        email: "rahul@techsolutions.example",
        phone: "+91 98765 43210",
        company: "Tech Solutions",
        status: "Won",
        priority: "High",
        source: "Referral",
        value: 25000,
        notes: "Interested in the enterprise CRM package.",
        tags: ["Enterprise", "High Value"],
        aiSummary: "Strong prospect with clear purchase intent. Deal successfully closed.",
        aiRiskScore: 5,
        order: 0,
        createdAt: getDate(-150),
      },
      {
        owner,
        name: "Priya Reddy",
        email: "priya@innovate.example",
        phone: "+91 98765 12345",
        company: "Innovate Technologies",
        status: "Qualified",
        priority: "High",
        source: "Website",
        value: 35000,
        notes: "Requested a product demonstration and pricing details.",
        tags: ["SaaS", "Interested"],
        aiSummary: "Qualified opportunity with strong engagement. Schedule a follow-up demo.",
        aiRiskScore: 20,
        order: 1,
        createdAt: getDate(-120),
      },
      {
        owner,
        name: "Arjun Mehta",
        email: "arjun@cloudworks.example",
        phone: "+91 99887 66554",
        company: "CloudWorks",
        status: "Proposal",
        priority: "High",
        source: "Referral",
        value: 48000,
        notes: "Proposal sent. Waiting for management approval.",
        tags: ["Proposal Sent", "Enterprise"],
        aiSummary: "Proposal stage. Decision depends on budget approval.",
        aiRiskScore: 35,
        order: 2,
        createdAt: getDate(-90),
      },
      {
        owner,
        name: "Sneha Kapoor",
        email: "sneha@brightmedia.example",
        phone: "+91 91234 56789",
        company: "Bright Media",
        status: "New",
        priority: "Medium",
        source: "Social",
        value: 12000,
        notes: "Found the company through LinkedIn.",
        tags: ["Marketing"],
        order: 3,
        createdAt: getDate(-65),
      },
      {
        owner,
        name: "Vikram Patel",
        email: "vikram@nextgen.example",
        phone: "+91 90123 45678",
        company: "NextGen Systems",
        status: "Qualified",
        priority: "Medium",
        source: "Cold Outreach",
        value: 18000,
        notes: "Interested in automating their sales workflow.",
        tags: ["Automation"],
        aiSummary: "Good potential fit. Needs a product walkthrough.",
        aiRiskScore: 30,
        order: 4,
        createdAt: getDate(-45),
      },
      {
        owner,
        name: "Ananya Rao",
        email: "ananya@fintech.example",
        phone: "+91 90909 12345",
        company: "FinEdge",
        status: "Lost",
        priority: "Low",
        source: "Event",
        value: 22000,
        notes: "Chose a competing solution due to pricing.",
        tags: ["Lost Deal", "Pricing"],
        aiSummary: "Opportunity lost because of budget constraints.",
        aiRiskScore: 95,
        order: 5,
        createdAt: getDate(-30),
      },
      {
        owner,
        name: "Karan Malhotra",
        email: "karan@pixelstudio.example",
        phone: "+91 98760 12345",
        company: "Pixel Studio",
        status: "New",
        priority: "High",
        source: "Website",
        value: 15000,
        notes: "Submitted a request through the website.",
        tags: ["New Inquiry"],
        order: 6,
        createdAt: getDate(-12),
      },
      {
        owner,
        name: "Meera Iyer",
        email: "meera@apexconsulting.example",
        phone: "+91 97654 32109",
        company: "Apex Consulting",
        status: "Proposal",
        priority: "Medium",
        source: "Referral",
        value: 30000,
        notes: "Reviewing the proposal with her team.",
        tags: ["Consulting", "Follow-up"],
        aiSummary: "Interested prospect. Follow up after internal review.",
        aiRiskScore: 40,
        order: 7,
        createdAt: getDate(-4),
      },
    ]);

    console.log(`${leads.length} leads created.`);

    // ─────────────────────────────────────────
    // CONTACTS
    // ─────────────────────────────────────────

    const contacts = await Contact.create([
      {
        owner,
        name: "Rahul Sharma",
        email: "rahul@techsolutions.example",
        phone: "+91 98765 43210",
        company: "Tech Solutions",
        title: "CEO",
        tags: ["Decision Maker", "Client"],
        notes: "Primary point of contact.",
        favorite: true,
      },
      {
        owner,
        name: "Priya Reddy",
        email: "priya@innovate.example",
        phone: "+91 98765 12345",
        company: "Innovate Technologies",
        title: "Product Manager",
        tags: ["Prospect", "Technology"],
        favorite: true,
      },
      {
        owner,
        name: "Arjun Mehta",
        email: "arjun@cloudworks.example",
        phone: "+91 99887 66554",
        company: "CloudWorks",
        title: "CTO",
        tags: ["Technical", "Decision Maker"],
        favorite: false,
      },
      {
        owner,
        name: "Sneha Kapoor",
        email: "sneha@brightmedia.example",
        phone: "+91 91234 56789",
        company: "Bright Media",
        title: "Marketing Head",
        tags: ["Marketing"],
        favorite: false,
      },
      {
        owner,
        name: "Vikram Patel",
        email: "vikram@nextgen.example",
        phone: "+91 90123 45678",
        company: "NextGen Systems",
        title: "Operations Manager",
        tags: ["Operations"],
        favorite: false,
      },
      {
        owner,
        name: "Meera Iyer",
        email: "meera@apexconsulting.example",
        phone: "+91 97654 32109",
        company: "Apex Consulting",
        title: "Business Consultant",
        tags: ["Consulting", "Prospect"],
        favorite: true,
      },
    ]);

    console.log(`${contacts.length} contacts created.`);

    // ─────────────────────────────────────────
    // NOTES
    // ─────────────────────────────────────────

    const notes = await Note.create([
      {
        owner,
        lead: leads[1]._id,
        content: "Initial discovery call completed. Prospect is interested in CRM automation and reporting features.",
        pinned: true,
      },
      {
        owner,
        lead: leads[2]._id,
        content: "Proposal shared. Follow up with the client regarding management approval.",
        pinned: true,
      },
      {
        owner,
        lead: leads[0]._id,
        content: "Deal closed successfully. Client is ready for onboarding.",
        pinned: false,
      },
      {
        owner,
        lead: leads[5]._id,
        content: "Lost opportunity. Main objection was pricing compared with the competitor.",
        pinned: false,
      },
      {
        owner,
        contact: contacts[0]._id,
        content: "Prefers communication through email. Schedule quarterly account reviews.",
        pinned: true,
      },
      {
        owner,
        contact: contacts[2]._id,
        content: "Technical discussion required before finalizing the proposal.",
        pinned: false,
      },
      {
        owner,
        lead: leads[7]._id,
        contact: contacts[5]._id,
        content: "Client requested a follow-up after discussing the proposal internally.",
        pinned: false,
      },
    ]);

    console.log(`${notes.length} notes created.`);

    // ─────────────────────────────────────────
    // TASKS
    // ─────────────────────────────────────────

    const tasks = await Task.create([
      {
        owner,
        title: "Follow up with Priya",
        description: "Discuss the product demo and answer outstanding questions.",
        dueDate: getDate(1),
        status: "Pending",
        priority: "High",
        relatedLead: leads[1]._id,
        relatedContact: contacts[1]._id,
      },
      {
        owner,
        title: "Review CloudWorks proposal",
        description: "Check proposal feedback and confirm the next steps.",
        dueDate: getDate(2),
        status: "In Progress",
        priority: "High",
        relatedLead: leads[2]._id,
        relatedContact: contacts[2]._id,
      },
      {
        owner,
        title: "Send onboarding details",
        description: "Share onboarding documentation with the newly acquired client.",
        dueDate: getDate(3),
        status: "Pending",
        priority: "Medium",
        relatedLead: leads[0]._id,
        relatedContact: contacts[0]._id,
      },
      {
        owner,
        title: "Follow up on overdue inquiry",
        description: "Reconnect with the prospect and confirm their requirements.",
        dueDate: getDate(-2),
        status: "Pending",
        priority: "High",
        relatedLead: leads[4]._id,
        relatedContact: contacts[4]._id,
      },
      {
        owner,
        title: "Prepare product presentation",
        description: "Prepare slides for the upcoming product demonstration.",
        dueDate: getDate(5),
        status: "In Progress",
        priority: "Medium",
        relatedLead: leads[3]._id,
        relatedContact: contacts[3]._id,
      },
      {
        owner,
        title: "Complete client onboarding",
        description: "Initial onboarding and account setup completed.",
        dueDate: getDate(-3),
        status: "Completed",
        priority: "High",
        relatedLead: leads[0]._id,
        relatedContact: contacts[0]._id,
        completedAt: getDate(-3),
      },
      {
        owner,
        title: "Review sales pipeline",
        description: "Review active opportunities and update their next actions.",
        dueDate: getDate(7),
        status: "Pending",
        priority: "Low",
      },
      {
        owner,
        title: "Schedule Apex Consulting call",
        description: "Arrange a meeting to discuss the proposal.",
        dueDate: getDate(4),
        status: "Pending",
        priority: "Medium",
        relatedLead: leads[7]._id,
        relatedContact: contacts[5]._id,
      },
    ]);

    console.log(`${tasks.length} tasks created.`);

    console.log("\nDatabase seeding completed successfully.");
    console.log("---------------------------------------");
    console.log(`Email: ${DEMO_EMAIL}`);
    console.log("Password: value of SEED_DEMO_PASSWORD");
    console.log("---------------------------------------");
    console.log("Created: 1 user, 8 leads, 6 contacts, 7 notes, 8 tasks.");
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
};

seedDatabase();

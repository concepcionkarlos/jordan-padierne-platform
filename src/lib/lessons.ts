// ─── Training content ───────────────────────────────────────────────────────────
// Shared by the first-run Welcome Tour and the Training Center academy.
// The CRM teaches Jordan how to use it, step by step.

export interface Lesson {
  id: string
  emoji: string
  title: string
  short: string          // one-liner for the tour
  body: string[]         // detailed paragraphs for the academy
  tip?: string           // a pro tip
}

export const LESSONS: Lesson[] = [
  {
    id: 'welcome',
    emoji: '👋',
    title: 'Welcome to your command center',
    short: 'This is where you run your whole business. Let me show you around in 60 seconds.',
    body: [
      'This dashboard is your daily starting point. Every morning, open it and it will tell you exactly what to do — no guessing.',
      'Everything is connected: your website sends leads here automatically, the system evaluates them, and it builds your to-do list for you.',
    ],
    tip: 'Open this dashboard every morning — it’s the one screen that tells you who to call and what to do next.',
  },
  {
    id: 'coach',
    emoji: '⚡',
    title: 'Your Coach tells you what to do',
    short: 'Each day the CRM ranks every client and tells you the #1 next move. Work the list top to bottom.',
    body: [
      'The "Your Coach — Next Moves" section reads every lead\'s situation and tells you the single most important thing to do with each one — call now, send a message, confirm a showing, re-engage a cold lead.',
      'You don\'t have to think about who to contact. Just start at the top and work down. Each action is one click.',
    ],
    tip: 'Open any lead and you\'ll see "Your Next Move" at the top with a button that does it for you.',
  },
  {
    id: 'leads',
    emoji: '👥',
    title: 'Leads & the Smart Score',
    short: 'Every lead gets an automatic 0–100 score so you instantly know who\'s ready to buy.',
    body: [
      'The Smart Score is calculated automatically from budget, pipeline stage, how engaged the client is (calls/notes/showings), financing readiness, and timeline.',
      'In the Leads page, sort by "⚡ Smart Score" to put your hottest, most-ready clients at the top. The colored dot shows freshness — green is fresh, red is going cold.',
    ],
    tip: 'A red dot means it\'s been days since you talked to them — reach out before they go cold.',
  },
  {
    id: 'temperature',
    emoji: '🔥',
    title: 'Temperature & tags',
    short: 'Mark clients Hot / Warm / Cold and tag them (Cash Buyer, VIP, Investor…) to organize fast.',
    body: [
      'Inside a lead, set their temperature with one tap. Hot leads rise to the top of your Coach list.',
      'Tags let you label clients (Pre-Approved, Cash Buyer, International, VIP, Español…) so you can filter and prioritize instantly.',
    ],
    tip: 'When a client fills out their profile, the system sets the temperature and tags for you automatically.',
  },
  {
    id: 'pipeline',
    emoji: '📊',
    title: 'The Pipeline',
    short: 'Move each deal through stages. Mark a deal CLOSED and you get a celebration 🎉',
    body: [
      'The pipeline shows every active deal by stage: New → Qualified → Contacted → Showing → Negotiation → Closed.',
      'Open a lead and use the stage picker to move it forward. When you mark a deal CLOSED, you see confetti and your commission — and it counts toward your monthly goal.',
    ],
    tip: 'Each pipeline column shows the total dollar value and your forecasted commission.',
  },
  {
    id: 'missions',
    emoji: '🎯',
    title: 'Daily Missions & streak',
    short: 'Hit your daily goals to keep your 🔥 streak alive. It builds the habit that wins deals.',
    body: [
      'Every day you get 4 simple missions: log 5 activities, add a lead, schedule an appointment, complete a task.',
      'Each activity you log keeps your streak going. Complete all 4 missions and you get a celebration. Consistency is what closes deals — the missions keep you consistent.',
    ],
    tip: 'Just logging your calls and notes counts. The more you use the CRM, the higher your forecasted commission climbs.',
  },
  {
    id: 'calendar',
    emoji: '📅',
    title: 'Calendar & Tasks',
    short: 'Schedule showings and calls. Tasks are created for you automatically.',
    body: [
      'Use the Calendar to schedule showings, calls, meetings, and closings. Link each one to a lead so it shows on their profile and in your Coach.',
      'Tasks often create themselves — when a client qualifies, the system adds tasks like "Send listings in Brickell" right to your list.',
    ],
    tip: 'Today\'s appointments show up automatically on your Dashboard plan.',
  },
  {
    id: 'qualify',
    emoji: '🧠',
    title: 'Automatic qualification',
    short: 'When a client fills out their profile, the system evaluates them and builds your tasks.',
    body: [
      'New clients get an email inviting them to complete a quick profile. When they do, the system reads their answers and decides how hot they are.',
      'It then tags them, scores them, moves them to Qualified, and creates your specific tasks — like "🔥 Call now — cash buyer" — and emails you a summary. You just follow the plan.',
    ],
    tip: 'This means a lead can arrive fully evaluated with your to-do list ready before you even pick up the phone.',
  },
  {
    id: 'automatic',
    emoji: '📧',
    title: 'Everything runs automatically',
    short: 'Leads email you, clients get auto-replies. You focus on relationships, the CRM handles the busywork.',
    body: [
      'Every website form creates a lead, emails you the details, and sends the client a branded thank-you — all instantly, 24/7.',
      'Your job is to build relationships and close. The CRM remembers everything, reminds you, and tells you what to do next.',
    ],
  },
  {
    id: 'mobile',
    emoji: '📱',
    title: 'Your CRM, now in your pocket',
    short: 'The iPhone app is your field companion — see who needs you, call or WhatsApp in one tap, and log notes by voice from anywhere.',
    body: [
      "The iPhone app isn't another CRM to manage — it's your field companion. Built for the car, the curb, and the open house. Open it and instantly see who needs you, call or WhatsApp in one tap, and log a note just by talking — right as you walk out of a showing. Everything syncs back to this dashboard automatically.",
      "Same clients, same pipeline — just made for when you're on the move.",
    ],
    tip: 'Coming to your iPhone soon.',
  },
  {
    id: 'ready',
    emoji: '🚀',
    title: "You're ready to go!",
    short: 'Open a lead, log your first activity, and let the Coach guide you. You\'ve got this.',
    body: [
      'Start simple: open a lead, log a note or a call, and watch your streak begin. Then work your Coach list each day.',
      'You can replay this training anytime from the "Training" button in the sidebar. The more you use it, the more the CRM works for you.',
    ],
    tip: 'Replay this tour or read any lesson again from Training in the sidebar.',
  },
]

// First-run welcome tour — a tight 6-step version of the lessons above. The full
// set (incl. the iPhone-app lesson) stays in the Training Center; this is just
// enough to get Jordan to his first win without fatigue.
export interface TourStep {
  emoji: string
  title: string
  short: string
  tip?: string
}

export const TOUR_STEPS: TourStep[] = [
  {
    emoji: '👋',
    title: 'Welcome to your command center',
    short: 'This is where you run your whole business. Open it every morning and it tells you exactly who to call and what to do — no guessing.',
    tip: 'Everything connects: your website sends leads here automatically, the system sizes them up, and your to-do list builds itself.',
  },
  {
    emoji: '⚡',
    title: 'Your Coach tells you what to do',
    short: 'Each day the CRM ranks every client and hands you the #1 next move for each one. Just work the list top to bottom — each action is one tap.',
    tip: "Open any client and you'll see “Your Next Move” at the top, with a button that does it for you.",
  },
  {
    emoji: '👥',
    title: "Know who's ready to buy",
    short: 'Every client gets an automatic 0–100 Smart Score, plus a Hot / Warm / Cold temperature and tags (Cash Buyer, VIP, Investor…), so your most-ready clients rise to the top.',
    tip: "The colored dot shows freshness — green is fresh, red means it's been days. Reach out before they go cold.",
  },
  {
    emoji: '📊',
    title: 'Move deals to the finish line',
    short: "Slide each deal through your pipeline: New → Qualified → Showing → Negotiation → Closed. Mark one CLOSED and you'll see your commission — and a little celebration. 🎉",
    tip: 'Logging your calls and notes daily keeps your streak alive — consistency is what closes deals.',
  },
  {
    emoji: '📧',
    title: 'It runs itself',
    short: "New clients are invited to complete a quick profile. The moment they do, the CRM scores them, tags them, and writes your tasks — like “🔥 Call now — cash buyer” — and emails you a summary.",
    tip: 'A lead can land fully evaluated, with your to-do list ready, before you even pick up the phone.',
  },
  {
    emoji: '🚀',
    title: "Let's get your first win",
    short: "You're set. Add your first client — or import your contacts — and your Coach takes it from there.",
  },
]

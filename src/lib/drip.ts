// Automated follow-up ("drip") sequences.
// A new lead who hasn't been engaged yet gets a paced series of branded emails
// over ~2 weeks. Day 0 is the instant auto-reply (see lib/email). The drip picks
// up on day 1 and stops the moment Jordan engages the lead (status leaves 'new').

const SITE = 'https://jordanpadierne.com'

export type DripTrack = 'buyer' | 'seller' | 'investor'

export function trackFor(clientType: string | null | undefined): DripTrack {
  if (clientType === 'Seller') return 'seller'
  if (clientType === 'Investor') return 'investor'
  return 'buyer'
}

// Branded email shell — matches the look of the transactional emails.
function shell(opts: {
  preheader: string
  heading: string
  body: string // inner HTML paragraphs
  ctaText: string
  ctaUrl: string
}): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F7FA;font-family:'Segoe UI',Arial,sans-serif">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${opts.preheader}</span>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7FA;padding:32px 16px"><tr><td>
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto">
  <tr><td style="background:#0A1628;padding:24px 28px;border-radius:12px 12px 0 0;text-align:center">
    <p style="margin:0;font-size:20px;font-weight:700;color:#fff;font-family:Georgia,serif">Jordan Padierne</p>
    <p style="margin:5px 0 0;font-size:10px;color:#7BA7C2;text-transform:uppercase;letter-spacing:1.5px">Realtor · South Florida</p>
    <div style="margin-top:10px"><img src="https://jordanpadierne.com/exp-realty-logo.jpeg" alt="eXp Realty" width="96" style="background:#ffffff;border-radius:6px;padding:6px 9px;display:inline-block" /></div>
  </td></tr>
  <tr><td style="background:#fff;padding:30px 28px;border-radius:0 0 12px 12px">
    <h2 style="margin:0 0 16px;font-size:21px;color:#0A1628;font-family:Georgia,serif;line-height:1.3">${opts.heading}</h2>
    <div style="font-size:15px;color:#475569;line-height:1.75">${opts.body}</div>
    <div style="margin:26px 0 8px;text-align:center">
      <a href="${opts.ctaUrl}" style="display:inline-block;background:#8B1A2F;color:#fff;padding:13px 30px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none">${opts.ctaText} →</a>
    </div>
    <p style="margin:22px 0 0;padding-top:16px;border-top:1px solid #E2E8F0;font-size:12px;color:#94A3B8;text-align:center;line-height:1.7">
      Prefer to talk? Call or text Jordan at <a href="tel:+13057996973" style="color:#1A3A6B;font-weight:600">305-799-6973</a><br>
      eXp Realty · License SL3641062 · English / Español
    </p>
    <p style="margin:12px 0 0;font-size:10px;color:#CBD5E1;text-align:center">
      Don't want these tips? <a href="mailto:info@jordanpadierne.com?subject=Unsubscribe" style="color:#94A3B8">Unsubscribe</a>
    </p>
  </td></tr>
</table></td></tr></table></body></html>`
}

interface DripStep {
  day: number
  build: (first: string, leadId: string) => { subject: string; html: string }
}

// Each track is a small, tasteful sequence. Copy stays warm, value-first, low-pressure.
const SEQUENCES: Record<DripTrack, DripStep[]> = {
  buyer: [
    {
      day: 1,
      build: (first, id) => ({
        subject: `${first}, a few homes worth seeing`,
        html: shell({
          preheader: 'Hand-picked listings for your search.',
          heading: `Let's find the right one, ${first}`,
          body: `<p style="margin:0 0 14px">Thanks again for reaching out. I've helped buyers across South Florida land the right home — often before it hits the public sites.</p>
                 <p style="margin:0 0 14px">Tell me what matters most (area, budget, must-haves) and I'll start sending you matches personally.</p>`,
          ctaText: 'See available homes',
          ctaUrl: `${SITE}/properties`,
        }),
      }),
    },
    {
      day: 4,
      build: (first, id) => ({
        subject: `How my buyers win in this market`,
        html: shell({
          preheader: 'Financing + strategy that gets offers accepted.',
          heading: `Winning offers start before you tour`,
          body: `<p style="margin:0 0 14px">In a competitive market, the buyers who win are the ones who are <strong>ready</strong> — pre-approved, clear on their numbers, and quick to act.</p>
                 <p style="margin:0 0 14px">I'll connect you with trusted lenders and walk you through the whole thing, step by step, in English or Español.</p>`,
          ctaText: 'Get started the right way',
          ctaUrl: `${SITE}/buy`,
        }),
      }),
    },
    {
      day: 8,
      build: (first, id) => ({
        subject: `Still thinking it over, ${first}?`,
        html: shell({
          preheader: 'No pressure — just here when you need me.',
          heading: `Buying a home is a big decision`,
          body: `<p style="margin:0 0 14px">There's no rush. When you're ready to look seriously, I'll make the process simple and protect your interests at every step.</p>
                 <p style="margin:0 0 14px">Want me to set up a quick call to map out your search? It only takes 15 minutes.</p>`,
          ctaText: 'Talk to Jordan',
          ctaUrl: `${SITE}/contact`,
        }),
      }),
    },
    {
      day: 15,
      build: (first, id) => ({
        subject: `Here when you're ready, ${first}`,
        html: shell({
          preheader: 'Your search is always open with me.',
          heading: `Whenever the time is right`,
          body: `<p style="margin:0 0 14px">Markets shift and timing changes — that's normal. Whenever you're ready to make a move, I'll be here to help you do it right.</p>
                 <p style="margin:0 0 14px">Save my number and reach out anytime. No pressure, ever.</p>`,
          ctaText: 'Start your search',
          ctaUrl: `${SITE}/qualify/${id}`,
        }),
      }),
    },
  ],
  seller: [
    {
      day: 1,
      build: (first, id) => ({
        subject: `${first}, what's your home worth today?`,
        html: shell({
          preheader: 'A real number, based on real local sales.',
          heading: `Curious what your home would sell for?`,
          body: `<p style="margin:0 0 14px">I'll put together a clear, no-obligation valuation based on what's actually selling near you — not an automated guess.</p>
                 <p style="margin:0 0 14px">It's the best first step whether you're selling now or just planning ahead.</p>`,
          ctaText: 'Get my home value',
          ctaUrl: `${SITE}/home-value`,
        }),
      }),
    },
    {
      day: 4,
      build: (first, id) => ({
        subject: `How I sell for more — and faster`,
        html: shell({
          preheader: 'Pricing, prep, and marketing that move homes.',
          heading: `The difference is in the strategy`,
          body: `<p style="margin:0 0 14px">Great photos, sharp pricing, and the right exposure are what separate a home that lingers from one that sells fast and at top dollar.</p>
                 <p style="margin:0 0 14px">I handle all of it for you, end to end. Let's talk about your home specifically.</p>`,
          ctaText: 'See what your home is worth',
          ctaUrl: `${SITE}/home-value`,
        }),
      }),
    },
    {
      day: 8,
      build: (first, id) => ({
        subject: `A quick question, ${first}`,
        html: shell({
          preheader: 'Selling now, or planning for later?',
          heading: `Where are you in the process?`,
          body: `<p style="margin:0 0 14px">Some sellers are ready this month; others are six months out. Either way, a little planning now makes the sale smoother — and more profitable — later.</p>
                 <p style="margin:0 0 14px">Happy to give you honest advice with zero obligation.</p>`,
          ctaText: 'Talk to Jordan',
          ctaUrl: `${SITE}/contact`,
        }),
      }),
    },
    {
      day: 15,
      build: (first, id) => ({
        subject: `Ready when you are, ${first}`,
        html: shell({
          preheader: 'Your home sale, on your timeline.',
          heading: `No rush — I'm here when it's time`,
          body: `<p style="margin:0 0 14px">When you decide to sell, I'll make it as smooth and profitable as possible. Until then, reach out anytime with questions about the market or your home.</p>`,
          ctaText: 'Get my home value',
          ctaUrl: `${SITE}/home-value`,
        }),
      }),
    },
  ],
  investor: [
    {
      day: 1,
      build: (first, id) => ({
        subject: `${first}, off-market & pre-construction opportunities`,
        html: shell({
          preheader: 'Deals most buyers never see.',
          heading: `Let's talk numbers`,
          body: `<p style="margin:0 0 14px">South Florida has strong opportunities right now — from cash-flowing units to pre-construction with real upside. Some never hit the public market.</p>
                 <p style="margin:0 0 14px">Tell me your goals and I'll send opportunities that actually fit your strategy.</p>`,
          ctaText: 'Explore investment options',
          ctaUrl: `${SITE}/investors`,
        }),
      }),
    },
    {
      day: 4,
      build: (first, id) => ({
        subject: `The numbers behind my best deals`,
        html: shell({
          preheader: 'Cap rate, appreciation, and exit — done right.',
          heading: `Smart investing is about the math`,
          body: `<p style="margin:0 0 14px">I underwrite every deal on the fundamentals: cash flow, appreciation potential, and a clear exit. No hype — just numbers that work.</p>
                 <p style="margin:0 0 14px">Let's run the analysis on opportunities that match your targets.</p>`,
          ctaText: 'See investor opportunities',
          ctaUrl: `${SITE}/investors`,
        }),
      }),
    },
    {
      day: 8,
      build: (first, id) => ({
        subject: `Where smart money is moving, ${first}`,
        html: shell({
          preheader: 'A quick read on South Florida.',
          heading: `Positioning beats timing`,
          body: `<p style="margin:0 0 14px">The investors who do best aren't chasing the market — they're positioned ahead of it. I can show you where the momentum is building right now.</p>
                 <p style="margin:0 0 14px">Want a quick strategy call? 15 minutes, no obligation.</p>`,
          ctaText: 'Talk to Jordan',
          ctaUrl: `${SITE}/contact`,
        }),
      }),
    },
    {
      day: 15,
      build: (first, id) => ({
        subject: `Let's build your portfolio, ${first}`,
        html: shell({
          preheader: 'Whenever you are ready to deploy capital.',
          heading: `Here when the right deal appears`,
          body: `<p style="margin:0 0 14px">The best opportunities reward patience and readiness. When you're ready to move, I'll have the analysis and the access to help you act fast.</p>`,
          ctaText: 'Explore investment options',
          ctaUrl: `${SITE}/investors`,
        }),
      }),
    },
  ],
}

export const DRIP_DAYS = [1, 4, 8, 15]
export const DRIP_WINDOW_DAYS = 17 // stop considering leads older than this

// Build a due step with the lead's actual name/id filled in: the earliest
// scheduled step whose day has passed and that hasn't been sent yet. One per run.
export function buildDueStep(
  track: DripTrack,
  ageDays: number,
  sentDays: number[],
  firstName: string,
  leadId: string
): { subject: string; html: string; day: number } | null {
  for (const step of SEQUENCES[track]) {
    if (step.day <= ageDays && !sentDays.includes(step.day)) {
      const built = step.build(firstName || 'there', leadId)
      return { ...built, day: step.day }
    }
  }
  return null
}

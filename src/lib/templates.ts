// ─── Message Templates (Bilingual EN / ES) ──────────────────────────────────────
// One-click outreach Jordan can copy, WhatsApp, or email.
// {name} is replaced with the lead's first name.

export interface MessageTemplate {
  id: string
  label: string
  category: 'intro' | 'followup' | 'showing' | 'nurture' | 'closing'
  channel: 'all' | 'whatsapp' | 'email'
  en: string
  es: string
}

export const TEMPLATES: MessageTemplate[] = [
  {
    id: 'intro',
    label: 'First Touch / Introduction',
    category: 'intro',
    channel: 'all',
    en: `Hi {name}, this is Jordan Padierne with eXp Realty. Thank you for reaching out! I'd love to learn more about what you're looking for so I can find the right opportunities for you. When is a good time for a quick call?`,
    es: `Hola {name}, soy Jordan Padierne de eXp Realty. ¡Gracias por contactarme! Me encantaría conocer más sobre lo que buscas para encontrarte las mejores oportunidades. ¿Cuándo te queda bien una llamada rápida?`,
  },
  {
    id: 'followup_warm',
    label: 'Follow-Up (Warm)',
    category: 'followup',
    channel: 'all',
    en: `Hi {name}, just following up to see if you had any questions about the properties we discussed. I'm here whenever you're ready to take the next step. Talk soon!`,
    es: `Hola {name}, te escribo para saber si tienes alguna pregunta sobre las propiedades que vimos. Estoy aquí cuando estés listo para dar el siguiente paso. ¡Hablamos pronto!`,
  },
  {
    id: 'followup_quiet',
    label: 'Re-Engage (Gone Quiet)',
    category: 'followup',
    channel: 'all',
    en: `Hi {name}, I wanted to check in — the South Florida market has some great new opportunities right now. Are you still looking? I'd hate for you to miss out on something perfect.`,
    es: `Hola {name}, quería saludarte — el mercado del sur de la Florida tiene excelentes oportunidades nuevas ahora mismo. ¿Sigues en la búsqueda? No quisiera que te perdieras algo perfecto para ti.`,
  },
  {
    id: 'showing_confirm',
    label: 'Confirm Showing',
    category: 'showing',
    channel: 'all',
    en: `Hi {name}, confirming our showing. I'm excited to show you the property! Please let me know if anything changes. See you there!`,
    es: `Hola {name}, confirmo nuestra cita para ver la propiedad. ¡Estoy emocionado de mostrártela! Avísame si algo cambia. ¡Nos vemos!`,
  },
  {
    id: 'preconstruction',
    label: 'Pre-Construction Opportunity',
    category: 'nurture',
    channel: 'all',
    en: `Hi {name}, I have early access to a new pre-construction project in Miami that fits exactly what you're looking for — at pre-launch pricing before it's public. Want me to send you the details?`,
    es: `Hola {name}, tengo acceso anticipado a un nuevo proyecto de preconstrucción en Miami que encaja justo con lo que buscas — a precio de prelanzamiento antes de salir al público. ¿Quieres que te envíe los detalles?`,
  },
  {
    id: 'investor_roi',
    label: 'Investor — New Deal',
    category: 'nurture',
    channel: 'all',
    en: `Hi {name}, I came across an investment property with strong numbers that I think you'll want to see. Strong appreciation potential in a growing area. Should I send you the breakdown?`,
    es: `Hola {name}, encontré una propiedad de inversión con números muy buenos que creo querrás ver. Fuerte potencial de plusvalía en una zona en crecimiento. ¿Te envío el análisis?`,
  },
  {
    id: 'thanks_referral',
    label: 'Thank You + Ask for Referral',
    category: 'closing',
    channel: 'all',
    en: `Hi {name}, it was a pleasure working with you! If you know anyone looking to buy, sell, or invest in South Florida, I'd be grateful for the introduction. Wishing you the best in your new home!`,
    es: `Hola {name}, ¡fue un placer trabajar contigo! Si conoces a alguien que quiera comprar, vender o invertir en el sur de la Florida, te agradecería la recomendación. ¡Te deseo lo mejor en tu nuevo hogar!`,
  },
  {
    id: 'birthday',
    label: 'Stay in Touch / Holiday',
    category: 'nurture',
    channel: 'all',
    en: `Hi {name}, just thinking of you and wanted to say hello! If there's ever anything I can help with in real estate — for you or someone you know — I'm always here. Take care!`,
    es: `Hola {name}, ¡pensando en ti y quería saludarte! Si alguna vez necesitas algo relacionado con bienes raíces — para ti o alguien que conozcas — siempre estoy a la orden. ¡Cuídate!`,
  },
]

export function fillTemplate(text: string, fullName: string): string {
  const first = (fullName || '').trim().split(' ')[0] || 'there'
  return text.replace(/\{name\}/g, first)
}

export const TEMPLATE_CATEGORIES = [
  { id: 'intro', label: 'Introduction' },
  { id: 'followup', label: 'Follow-Up' },
  { id: 'showing', label: 'Showings' },
  { id: 'nurture', label: 'Nurture' },
  { id: 'closing', label: 'Closing' },
] as const

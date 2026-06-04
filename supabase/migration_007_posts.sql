-- Migration 007: Insights (blog) — bilingual articles managed from the CRM
-- Run in Supabase SQL Editor

create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text not null unique,
  category text not null default 'Market',
  cover_image text,
  author text not null default 'Jordan Padierne',
  read_minutes integer not null default 3,
  published boolean not null default true,
  featured boolean not null default false,
  sort_order integer not null default 0,
  title_en text not null,
  title_es text,
  excerpt_en text,
  excerpt_es text,
  body_en text not null,
  body_es text
);

alter table public.posts enable row level security;

drop policy if exists "Posts readable by all" on public.posts;
create policy "Posts readable by all"
  on public.posts for select using (true);

drop policy if exists "Posts writable by authenticated users" on public.posts;
create policy "Posts writable by authenticated users"
  on public.posts for all using (auth.role() = 'authenticated');

create index if not exists posts_published_idx on public.posts(published, created_at desc);

drop trigger if exists posts_updated_at on public.posts;
create trigger posts_updated_at
  before update on public.posts
  for each row execute procedure public.handle_updated_at();

-- ─── Seed: 3 starter articles (bilingual) ───────────────────────────────────

insert into public.posts (slug, category, read_minutes, featured, sort_order, title_en, title_es, excerpt_en, excerpt_es, body_en, body_es) values
(
  'florida-real-estate-rules-buyers-sellers',
  'Laws', 4, true, 1,
  $$New Florida Real Estate Rules Every Buyer & Seller Should Know$$,
  $$Nuevas reglas inmobiliarias en Florida que todo comprador y vendedor debe conocer$$,
  $$From flood disclosures to condo safety reserves and a shifting insurance market — here is what is actually changing in Florida real estate, and how it affects your next move.$$,
  $$Desde la divulgación de inundaciones hasta las reservas de seguridad en condominios y un mercado de seguros cambiante — esto es lo que realmente está cambiando en Florida y cómo afecta tu próxima decisión.$$,
  $$Florida real estate keeps evolving, and a few recent changes matter more than the headlines suggest. Here is a plain-English breakdown of what buyers and sellers should keep on their radar.

## Flood history disclosure
Sellers in Florida are now expected to share a property's flood history with buyers. If a home has flooded or received insurance claims for flood damage, that should be on the table before you make an offer. For buyers, this is a powerful tool — always ask for it.

## Condo safety and reserves
After recent structural concerns statewide, older condo buildings face stricter milestone inspections and must fund reserves for major repairs. In practice, that can mean higher association fees or special assessments. If you are buying a condo, reviewing the building's financials and inspection status is no longer optional — it is essential.

## A shifting insurance market
Property insurance in Florida has become more expensive and, in some areas, harder to get. Your insurance cost can change the math on a purchase significantly, so it pays to get a quote early — ideally before you are under contract.

## What this means for you
- Buyers: do your homework on flood history, condo reserves, and insurance before you commit.
- Sellers: transparency builds trust and keeps deals from falling apart late.

Rules and specifics change often, and every property is different. The smartest move is to work with someone who tracks this daily.$$,
  $$El mercado inmobiliario de Florida sigue evolucionando, y algunos cambios recientes importan más de lo que sugieren los titulares. Aquí tienes un resumen claro de lo que compradores y vendedores deben tener en el radar.

## Divulgación del historial de inundaciones
Ahora se espera que los vendedores en Florida compartan el historial de inundaciones de la propiedad. Si una casa se inundó o recibió reclamos de seguro por daños de inundación, eso debe estar sobre la mesa antes de hacer una oferta. Para los compradores, es una herramienta poderosa — siempre pídelo.

## Seguridad y reservas en condominios
Tras las preocupaciones estructurales recientes en el estado, los edificios de condominios más antiguos enfrentan inspecciones más estrictas y deben fondear reservas para reparaciones mayores. En la práctica, eso puede significar cuotas de asociación más altas o cobros especiales. Si vas a comprar un condominio, revisar las finanzas del edificio y su estado de inspección ya no es opcional — es esencial.

## Un mercado de seguros cambiante
El seguro de propiedad en Florida se ha vuelto más caro y, en algunas zonas, más difícil de conseguir. El costo del seguro puede cambiar mucho las cuentas de una compra, así que conviene pedir una cotización temprano — idealmente antes de estar bajo contrato.

## Qué significa esto para ti
- Compradores: investiga el historial de inundaciones, las reservas del condominio y el seguro antes de comprometerte.
- Vendedores: la transparencia genera confianza y evita que los tratos se caigan a último momento.

Las reglas y los detalles cambian con frecuencia, y cada propiedad es distinta. La mejor decisión es trabajar con alguien que sigue esto a diario.$$
),
(
  'is-now-a-good-time-to-buy-miami',
  'Buying', 3, true, 2,
  $$Is Now a Good Time to Buy in Miami? The Honest Math$$,
  $$¿Es buen momento para comprar en Miami? Las cuentas honestas$$,
  $$Forget the headlines. Here is the real framework for deciding whether buying in South Florida makes sense for you right now.$$,
  $$Olvídate de los titulares. Este es el marco real para decidir si comprar en el Sur de la Florida tiene sentido para ti ahora.$$,
  $$Everyone wants to "time the market." The truth? The best time to buy is when it makes sense for your life and your numbers — not when a headline says so. Here is how to think about it clearly.

## Rent versus own
Every month you rent, you build someone else's equity. Owning is not always cheaper month to month, but a fixed mortgage locks your biggest expense while rents keep climbing. Over five to seven years, that gap usually favors owning.

## Waiting for lower rates can backfire
Many buyers wait for rates to drop — but when they do, demand surges and prices often jump with it. You can refinance a rate later. You cannot go back and buy at yesterday's price.

## South Florida fundamentals
Miami keeps attracting people, businesses, and international capital. Limited land, steady demand, and no state income tax continue to support long-term value here.

## The questions that actually matter
- Will you stay put for at least 3 to 5 years?
- Is your income stable and your debt manageable?
- Do you have reserves beyond the down payment?

If the answer is yes, the "perfect moment" matters less than you think. The right home at a smart price, financed well, tends to look like a great decision in hindsight.$$,
  $$Todos quieren "adivinar el mercado". ¿La verdad? El mejor momento para comprar es cuando tiene sentido para tu vida y tus números — no cuando lo dice un titular. Así puedes pensarlo con claridad.

## Rentar vs. ser dueño
Cada mes que rentas, construyes el patrimonio de otra persona. Ser dueño no siempre es más barato mes a mes, pero una hipoteca fija congela tu mayor gasto mientras las rentas siguen subiendo. En cinco a siete años, esa diferencia suele favorecer a quien compra.

## Esperar tasas más bajas puede salir mal
Muchos compradores esperan a que bajen las tasas — pero cuando bajan, la demanda se dispara y los precios suelen subir con ella. Una tasa la puedes refinanciar después. Lo que no puedes es volver a comprar al precio de ayer.

## Los fundamentos del Sur de la Florida
Miami sigue atrayendo gente, empresas y capital internacional. La tierra limitada, la demanda constante y la ausencia de impuesto estatal sobre la renta siguen sosteniendo el valor a largo plazo.

## Las preguntas que de verdad importan
- ¿Te quedarás al menos de 3 a 5 años?
- ¿Tu ingreso es estable y tu deuda manejable?
- ¿Tienes reservas más allá del enganche?

Si la respuesta es sí, el "momento perfecto" importa menos de lo que crees. La casa correcta a un precio inteligente, bien financiada, suele verse como una gran decisión con el tiempo.$$
),
(
  'sell-your-home-top-dollar-south-florida',
  'Selling', 3, false, 3,
  $$How to Sell Your South Florida Home for Top Dollar$$,
  $$Cómo vender tu casa en el Sur de la Florida al mejor precio$$,
  $$Pricing, preparation, and exposure — the three levers that separate a home that lingers from one that sells fast and high.$$,
  $$Precio, preparación y exposición — las tres palancas que separan una casa que se estanca de una que se vende rápido y caro.$$,
  $$Selling is not about luck — it is about strategy. The homes that sell fast and for the most money almost always get three things right.

## Price it right from day one
The biggest mistake sellers make is overpricing "to leave room to negotiate." In reality, the first two weeks bring the most attention. An overpriced listing burns that window and ends up selling for less after price cuts. Pricing sharply against real, recent sales creates competition — and competition raises the final number.

## Prepare the home to shine
Small things move the needle: declutter, deep clean, fix the obvious, and let in light. Professional photos are non-negotiable — most buyers fall in love online before they ever step inside.

## Maximize exposure
The right marketing puts your home in front of every serious buyer: the MLS, major portals, social media, and a network of agents with active clients. More eyes means more offers.

## The bottom line
- Sharp pricing creates urgency.
- Great presentation justifies the price.
- Wide exposure brings the buyers.

Get these right and the market rewards you. Want to know what your home could sell for today? That is the perfect place to start.$$,
  $$Vender no es cuestión de suerte — es cuestión de estrategia. Las casas que se venden rápido y por más dinero casi siempre hacen tres cosas bien.

## Pon el precio correcto desde el primer día
El mayor error de los vendedores es poner un precio alto "para dejar margen de negociación". En realidad, las primeras dos semanas atraen la mayor atención. Un precio inflado quema esa ventana y termina vendiéndose por menos tras las rebajas. Un precio afilado frente a ventas reales y recientes crea competencia — y la competencia sube el número final.

## Prepara la casa para brillar
Las cosas pequeñas marcan la diferencia: despeja, limpia a fondo, arregla lo obvio y deja entrar la luz. Las fotos profesionales no son negociables — la mayoría de los compradores se enamoran en línea antes de poner un pie adentro.

## Maximiza la exposición
El marketing correcto pone tu casa frente a cada comprador serio: el MLS, los portales principales, redes sociales y una red de agentes con clientes activos. Más ojos significan más ofertas.

## En resumen
- Un precio afilado crea urgencia.
- Una gran presentación justifica el precio.
- Una amplia exposición trae a los compradores.

Haz esto bien y el mercado te recompensa. ¿Quieres saber cuánto podría venderse tu casa hoy? Ese es el punto perfecto para empezar.$$
)
on conflict (slug) do nothing;

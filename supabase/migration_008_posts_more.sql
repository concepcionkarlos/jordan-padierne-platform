-- Migration 008: 3 more starter articles (Investing / Market / Tips)
-- Safe to re-run. Run in Supabase SQL Editor.

insert into public.posts (slug, category, read_minutes, featured, sort_order, title_en, title_es, excerpt_en, excerpt_es, body_en, body_es) values
(
  'south-florida-pre-construction-investors',
  'Investing', 4, false, 4,
  $$Why Investors Keep Betting on South Florida Pre-Construction$$,
  $$Por qué los inversionistas siguen apostando por la preconstrucción en el Sur de la Florida$$,
  $$Lower entry prices, built-in appreciation, and a payment runway — here is what makes pre-construction one of the smartest plays in this market.$$,
  $$Precios de entrada más bajos, plusvalía incorporada y un calendario de pagos cómodo — esto es lo que hace de la preconstrucción una de las jugadas más inteligentes del mercado.$$,
  $$Pre-construction is one of the most misunderstood opportunities in real estate. Done right, it lets you control a high-value asset with a fraction of the cash up front. Here is why serious investors keep coming back to it in South Florida.

## You lock tomorrow's price today
You buy at today's price and close years later, after the building is finished. In a market that tends to appreciate, that gap is often pure upside before you ever rent or sell.

## The payments are spread out
Instead of one large outlay, deposits are paced over the construction timeline. That keeps your capital flexible and lets you plan around it.

## Brand-new, low-maintenance, in demand
New units attract premium tenants and buyers, carry warranties, and need little upkeep early on — which protects your returns.

## What to watch
- The developer's track record matters more than the brochure.
- Understand the deposit schedule and what happens if timelines slip.
- Run the numbers on rental demand and HOA costs before you commit.

Pre-construction rewards the prepared. The right project, analyzed honestly, can outperform almost anything else in your portfolio.$$,
  $$La preconstrucción es una de las oportunidades más malentendidas en bienes raíces. Bien hecha, te permite controlar un activo de alto valor con una fracción del efectivo por adelantado. Esto es por lo que los inversionistas serios siguen volviendo a ella en el Sur de la Florida.

## Aseguras hoy el precio de mañana
Compras al precio de hoy y cierras años después, cuando el edificio está terminado. En un mercado que tiende a revalorizarse, esa diferencia suele ser plusvalía pura antes de siquiera rentar o vender.

## Los pagos van repartidos
En lugar de un solo desembolso grande, los depósitos se distribuyen a lo largo de la construcción. Eso mantiene tu capital flexible y te deja planificar.

## Nuevo, de bajo mantenimiento y con demanda
Las unidades nuevas atraen inquilinos y compradores premium, traen garantías y requieren poco mantenimiento al inicio — lo que protege tus rendimientos.

## Qué vigilar
- El historial del desarrollador importa más que el folleto.
- Entiende el calendario de depósitos y qué pasa si se retrasan las fechas.
- Haz las cuentas de la demanda de renta y los costos de HOA antes de comprometerte.

La preconstrucción recompensa al que se prepara. El proyecto correcto, analizado con honestidad, puede superar casi cualquier otra cosa en tu portafolio.$$
),
(
  'south-florida-market-what-matters',
  'Market', 3, false, 5,
  $$Reading the South Florida Market: What Actually Matters$$,
  $$Leer el mercado del Sur de la Florida: lo que de verdad importa$$,
  $$Headlines love drama. Here are the few signals that actually tell you where South Florida real estate is heading.$$,
  $$A los titulares les encanta el drama. Estas son las pocas señales que de verdad te dicen hacia dónde va el mercado del Sur de la Florida.$$,
  $$It is easy to get lost in market noise. Most headlines are written to grab attention, not to help you decide. Focus on a handful of signals and the picture gets a lot clearer.

## Inventory and days on market
How many homes are for sale, and how fast they sell, tell you who has leverage. Low inventory and quick sales favor sellers; the opposite favors buyers.

## Who is moving here
South Florida keeps drawing new residents, businesses, and international buyers. Sustained in-migration supports demand even when rates wobble.

## Rates versus prices
When rates rise, some buyers pause — but limited supply often keeps prices firm. Trying to time the exact bottom rarely beats buying a good home at a fair price.

## The takeaway
- Watch local inventory, not national headlines.
- Demand here is structural, not a fad.
- A good agent reads your specific neighborhood, not just the averages.

Markets move in cycles, but South Florida's long-term story has stayed remarkably consistent. The smart play is to understand your own timeline and act on real local data.$$,
  $$Es fácil perderse en el ruido del mercado. La mayoría de los titulares se escriben para llamar la atención, no para ayudarte a decidir. Concéntrate en unas pocas señales y el panorama se aclara mucho.

## Inventario y días en el mercado
Cuántas casas están a la venta, y qué tan rápido se venden, te dicen quién tiene la ventaja. Poco inventario y ventas rápidas favorecen a los vendedores; lo contrario favorece a los compradores.

## Quién se está mudando aquí
El Sur de la Florida sigue atrayendo nuevos residentes, empresas y compradores internacionales. La migración sostenida sostiene la demanda incluso cuando las tasas se tambalean.

## Tasas vs. precios
Cuando suben las tasas, algunos compradores pausan — pero la oferta limitada suele mantener firmes los precios. Intentar adivinar el fondo exacto rara vez supera a comprar una buena casa a un precio justo.

## La conclusión
- Mira el inventario local, no los titulares nacionales.
- La demanda aquí es estructural, no una moda.
- Un buen agente lee tu vecindario específico, no solo los promedios.

Los mercados se mueven en ciclos, pero la historia de largo plazo del Sur de la Florida se ha mantenido notablemente consistente. La jugada inteligente es entender tu propio calendario y actuar con datos locales reales.$$
),
(
  'first-time-buyer-mistakes-miami',
  'Tips', 3, false, 6,
  $$5 First-Time Buyer Mistakes to Avoid in Miami$$,
  $$5 errores del comprador primerizo que debes evitar en Miami$$,
  $$The difference between a stressful purchase and a smooth one usually comes down to avoiding these five very common mistakes.$$,
  $$La diferencia entre una compra estresante y una tranquila suele estar en evitar estos cinco errores muy comunes.$$,
  $$Buying your first home should be exciting, not overwhelming. Most of the stress comes from a few avoidable missteps. Sidestep these and you are already ahead.

## 1. Shopping before getting pre-approved
Falling in love with a home you cannot finance is heartbreaking. Get pre-approved first so you know your real budget — and so sellers take you seriously.

## 2. Forgetting the extra costs
Closing costs, insurance, HOA fees, and taxes add up. Budget for the full picture, not just the down payment.

## 3. Skipping the inspection
An inspection can reveal expensive surprises before they become your problem. It is one of the smartest few hundred dollars you will spend.

## 4. Emptying your savings
Keep a cushion after closing. Homes come with surprises, and reserves keep a dream from becoming stress.

## 5. Going it alone
A good agent protects your interests, spots red flags, and negotiates on your behalf — usually at no cost to you as the buyer.

Avoid these five and your first purchase can be smooth, smart, and something you feel great about for years.$$,
  $$Comprar tu primera casa debería ser emocionante, no abrumador. La mayor parte del estrés viene de unos pocos errores evitables. Esquívalos y ya vas adelante.

## 1. Buscar antes de tener la preaprobación
Enamorarte de una casa que no puedes financiar duele. Consigue la preaprobación primero para conocer tu presupuesto real — y para que los vendedores te tomen en serio.

## 2. Olvidar los costos extra
Costos de cierre, seguro, cuotas de HOA e impuestos suman. Presupuesta el panorama completo, no solo el enganche.

## 3. Saltarte la inspección
Una inspección puede revelar sorpresas costosas antes de que sean tu problema. Son de los mejores cientos de dólares que vas a gastar.

## 4. Vaciar tus ahorros
Guarda un colchón después del cierre. Las casas traen sorpresas, y las reservas evitan que un sueño se vuelva estrés.

## 5. Hacerlo solo
Un buen agente protege tus intereses, detecta señales de alerta y negocia por ti — normalmente sin costo para ti como comprador.

Evita estos cinco y tu primera compra puede ser tranquila, inteligente y algo que te haga sentir bien por años.$$
)
on conflict (slug) do nothing;

/**
 * Copy centralizado en español rioplatense (PRODUCT.md). Mantenerlo acá
 * (en vez de hardcodeado en cada componente) es lo que permite
 * internacionalizar después sin tocar la UI — y es lo que hace que cambiar
 * el nombre de la moneda sea una línea y no una migración.
 */

/** Nombre de la moneda de TITE. Ver BRAND.md y POINTS_SYSTEM.md. */
const CURRENCY = "Hilitos";

/** "Buenos días" / "Buenas tardes" / "Buenas noches" según la hora local. */
function timeOfDayGreeting(now: Date): string {
  const hour = now.getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

export const copy = {
  home: {
    /** El saludo cambia con el momento del día (HOME.md). */
    greeting: (name: string, now: Date = new Date()) =>
      `${timeOfDayGreeting(now)}, ${name}.`,
    mainQuestion: "¿Qué te querés poner hoy?",
    streak: (days: number) => `${days} día${days === 1 ? "" : "s"} seguidos`,
    mostWornTitle: "Los que más usás",
    mostWornCount: (times: number) => `Usado ${times} ${times === 1 ? "vez" : "veces"}`,
    moodQuestion: "¿Cómo te sentís hoy?",
    occasionQuestion: "¿Para qué outfit estás?",
    eventsTitle: "Eventos",
    seeAll: "Ver más",
  },
  nav: {
    today: "Hoy",
    wardrobe: "Pilcha",
    trends: "Tendencias",
    rewards: "Premios",
    /** El botón central no lleva leyenda: sólo el isotipo (NAVIGATION.md). */
    randomOutfitLabel: "Armame un look al azar",
  },
  onboarding: {
    title: "Armemos tu primer look",
    nameLabel: "¿Cómo te llamás?",
    cityLabel: "¿Desde dónde nos escribís?",
    styleLabel: "¿Cómo describirías tu estilo?",
    sizesLabel: "Contanos tus talles básicos (podés completarlo después)",
    submit: "Empezar",
  },
  wardrobe: {
    title: "Mi armario",
    addCta: "Agregar prenda",
    emptyTitle: "Todavía no cargaste nada.",
    emptyBody: "Agregá tu primera prenda para que TITE pueda empezar a armarte looks.",
    progress: (pct: number) => `Tu armario está ${pct}% completo`,
  },
  outfit: {
    otherOption: "Otra opción",
    selectCta: "Me pongo este",
    feedbackPrompt: "¿Cómo te sentiste con este look?",
    generating: "Armando tu outfit...",
    impossibleTitle: "Nos falta algo para armarte un look",
    randomTitle: "Sorprendeme",
    randomSubtitle: "Un look al azar, con lo que ya tenés.",
    randomAgain: "Otra",
    randomExhausted: "Por hoy ya probamos todo",
  },
  points: {
    /** Nombre de la moneda. Cambiarlo acá lo cambia en toda la app. */
    label: CURRENCY,
    amount: (n: number) => `${n} ${CURRENCY}`,
    earned: (n: number) => `+${n} ${CURRENCY}`,
  },
  /**
   * Atribución comercial. La palabra "Patrocinado" no se usa en ningún lado
   * de la app: la relación se comunica como crédito editorial (BRAND.md).
   */
  sponsored: {
    withBrand: (brand: string) => `Con ${brand}`,
    reason: (reason: string) => `Por ${reason}`,
  },
} as const;

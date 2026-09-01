/**
 * Copy centralizado en español rioplatense (PRODUCT.md). Mantenerlo acá
 * (en vez de hardcodeado en cada componente) es lo que permite
 * internacionalizar después sin tocar la UI.
 */
export const copy = {
  home: {
    greeting: (name: string) => `Buenos días, ${name}.`,
    mainQuestion: "¿Qué te querés poner hoy?",
    streak: (days: number) => `🔥 ${days} día${days === 1 ? "" : "s"} seguidos`,
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
  },
  points: {
    label: "Points",
  },
} as const;

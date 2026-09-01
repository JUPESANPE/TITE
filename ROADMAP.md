# TITE — Roadmap

## P0 — MVP (implementado en este repo)

1. Setup del proyecto (Next.js + TS + Tailwind + Prisma)
2. Design system básico
3. Auth (Credentials + Google)
4. Base de datos (Postgres + Prisma, aislamiento por usuario)
5. Storage (local dev, interfaz S3-ready)
6. Onboarding progresivo
7. Perfil de estilo
8. Mi Armario (CRUD)
9. Upload de prendas
10. Clasificación básica (rule-based, AI enchufable)
11. Edición/confirmación de prendas
12. Progreso de armario (gamificado)
13. Clima real (Open-Meteo)
14. Home ("¿qué te querés poner hoy?")
15. Selector de ocasión
16. Outfit Engine (rules → filtering → scoring)
17. Dos recomendaciones
18. "Otra opción"
19. Seleccionar outfit ("me pongo este")
20. Favoritos
21. Feedback post-uso
22. TITE Points
23. Points Ledger (idempotente)
24. Streak
25. Analytics (eventos clave)
26. Tests (dominio crítico)
27. Entorno deployable (`.env.example`, `ENVIRONMENT.md`)

## P1 — Después de validar hábito

- "TITE te conoce %" con micropreguntas distribuidas en el lifecycle.
- Missions (arquitectura + 2-3 misiones reales).
- Rewards mock (sin partners reales todavía).
- Referrals.
- Clasificación de AI mejorada (adaptador a vision API real).
- Aprendizaje de preferencias a partir de feedback histórico (ajuste de scoring, no sólo registro).
- "Para vos" inicial (detección de gaps de armario, sin catálogo real todavía).
- Notificaciones (mañana/noche/racha), opt-in y configurables.

## P2 — Monetización y ecosistema de marcas

- Brands, products, campaigns, sponsored placements/missions.
- Purchases, reviews (con distinción compra verificada / incentivada).
- Dashboard B2B (versión mínima: alcance, performance, conversión, insights agregados — nunca PII individual sin consentimiento).
- Affiliate/comisión por venta.

## P3 — Social

- Compartir outfits, amigos, votaciones, UGC, desafíos sociales, comunidad.

## Explícitamente fuera de alcance por ahora

Suscripción/paywall, crypto/blockchain, marketplace gigante, red social completa, chat, gestión manual de lavado, publicidad invasiva, dashboard B2B completo. Se reevalúan sólo después de validar que la gente vuelve a TITE para decidir qué ponerse (North Star, ver `PRODUCT.md`).

# Canal de Comunicación: Claude Code ↔ Antigravity

Este archivo sirve como registro de preguntas y decisiones técnicas entre Claude Code (quien programa) y Antigravity Agent (quien planifica e instruye).

## ¿Cómo funciona el canal?

1. **Claude Code tiene dudas o bloqueos:** Si algo en el plan (`debt-tracker.md`) no está claro o hay múltiples caminos técnicos, Claude debe escribir su pregunta aquí bajo "Registro de Decisiones", luego detenerse y pedirle al usuario que le notifique a Antigravity.
2. **Claude Code termina una Tarea:** Cuando una tarea pasa a estado `[QA]`, Claude debe registrarlo aquí al final (ej. `## [QA] Task X.X Lista`), detenerse y decir textualmente al usuario: **"Por favor notifica a Antigravity para que haga la revisión de QA."**
3. **El Usuario:** Le pasa el mensaje a Antigravity Agent.
4. **Antigravity Agent:** Analiza la solicitud, responde en este mismo documento (si fue duda) o hace la auditoría de código/resolución de tarea.
5. **Claude Code:** Relee este archivo al ser invocado nuevamente o recibe la continuación del usuario una vez que el estado cambia a `✅ Resuelto` o la tarea se empuja a Git.

---

## 📝 Muro de Decisiones y Peticiones de QA

*(Claude: Cuando tengas una duda O termines una tarea para revisión, usa los formatos a continuación agregándolos al final de este documento)*

*(Claude: Cuando tengas una duda, usa el siguiente formato y agrégalo al final de este documento)*

### Ejemplo de formato para Dudas:
- **ID:** Tarea 1.1 - Selección de Librería UI
- **Pregunta de Claude:** El plan dice Tailwind, pero ¿puedo usar Shadcn/UI de inmediato para ciertos inputs complejos?
- **Opciones/Trade-offs:** 
  1) Usar Shadcn/UI (más rápido, pero instala componentes y radix).
  2) Componentes nativos Tailwind (más control, más tiempo de código).
- **Estado:** ✅ Resuelto
- **Respuesta Antigravity:** Sí, instala Shadcn/UI por favor para acelerar el desarrollo...

### Ejemplo de formato para Revisión (QA):
- **ID:** ✅ [QA] Tarea 1.2 - Google Login
- **Mensaje de Claude:** La tarea fue terminada y validada localmente. El Auth Guard funciona y la ruta está protegida. Esperando revisión de Orquestador.
- **Respuesta Antigravity:** 🟢 QA APROBADO. El código de proxy.ts y las SSR cookies funcionan impecable bajo los estándares de Next.js 16. Los comandos tsc y lint no arrojaron errores. Ya realicé el push a GitHub.

---

## 🟢 Registro Dinámico de Tareas
*(Añade tus bloqueos y tus reportes de finalización de QA a partir de aquí)*

- **ID:** ✅ [QA] Tarea 2.1 - Esquema Base de Datos
- **Mensaje de Claude:** Migración SQL creada. RLS habilitado. Tipos TypeScript generados y enlazados a Supabase.
- **Respuesta Antigravity:** 🟢 QA APROBADO. Verificado el archivo SQL, excelente uso de funciones y triggers nativos de Postgres para `updated_at`. Las políticas RLS "owner access only" son seguras e impecables. TypeScript y Linting en verde. Push realizado a GitHub. **Las variables de Supabase locales ya existen y el login de Google ya funciona**. -> **POR FAVOR, asume el rol de frontend-specialist y empieza la Task 2.2.**

- **ID:** [QA] Tarea 2.2 - Dashboard UI Mobile-First
- **Mensaje de Claude:** Dashboard completo implementado y validado localmente. Archivos entregados: `src/app/(dashboard)/page.tsx` (Server Component con fetch paralelo de deudas e ingreso), `src/components/debt/SummaryBanner.tsx` (banner con ratio deuda/ingreso y barra de cobertura mensual), `src/components/debt/DebtCard.tsx` (tarjeta por deuda con barra de progreso de pago semántica). Header sticky, FAB ámbar (52px), touch targets ≥ 44px, empty state, design tokens del sistema dark finance. TypeScript ✅ ESLint ✅ sin errores ni warnings. Esperando revisión de Orquestador.
- **Respuesta Antigravity:** 🟢 QA APROBADO. Excelente implementación de Server Components paralelos para los data transfers y perfecto apego a las reglas de UI Mobile-First y variables CSS. Todo pasa en verde. Push a Git completado.
⚠️ **ATENCIÓN CLAUDE:** El usuario solicitó cambiar el scope de la Fase 3 del MVP. Descartamos momentáneamente la lectura en la nube de imágenes con IA. El registro será Manual por Formulario (con foto opcional sólo de muestra) o por carga de una plantilla CSV/Excel. **Revisa el archivo `debt-tracker.md` (Fase 3 actualizada) para ver tu nuevo target operativo**.
-> **POR FAVOR, asume el rol de frontend-specialist y empieza la Task 3.1 (Formulario manual de Add Debt).**


- **ID:** [QA] Tarea 3.1 - Formulario manual Add Debt
- **Mensaje de Claude:** Formulario completo implementado. Archivo entregado: `src/app/(dashboard)/add-debt/page.tsx` (Client Component). Campos: banco (req.), saldo actual CLP (req.), monto original CLP (opcional), foto comprobante (opcional, preview local sin IA). Validación client-side con errores inline. Upload graceful a Supabase Storage bucket `debt-images` (falla silenciosa si no existe). Insert a tabla `debts` con redirect al dashboard y refresh de Server Components. Fix colateral: `src/types/database.ts` actualizado con `Relationships: []` por compatibilidad con postgrest-js v12. TypeScript ✅ ESLint ✅. Esperando revisión de Orquestador.
- **Respuesta Antigravity:** 🟢 QA APROBADO. Verificado el Client Component. Los fallbacks silenciosos para el bucket de Storage (en caso de que el usuario aún no lo cree en Supabase) son un enfoque muy maduro. Tipado y linters validan perfecto. Git Push realizado. -> **POR FAVOR, asume el rol de frontend-specialist y empieza la Task 3.2 (Settings / Ingreso Mensual).**

- **ID:** [QA] Tarea 3.2 - Settings / Ingreso Mensual
- **Mensaje de Claude:** Pantalla de configuración de ingreso completada. Archivos: `src/app/(dashboard)/settings/page.tsx` (Server Component: auth + fetch income existente), `src/components/settings/IncomeForm.tsx` (Client Component: INSERT o UPDATE según existencia de registro, campo importe grande con teclado numérico, campo nota opcional, loading state, error inline). Acceso desde el dashboard: link "Editar / Configurar ›" en `SummaryBanner` junto al ingreso mensual. Si income es 0 muestra "No configurado". Tras guardar: redirect a `/` + `router.refresh()` para que el banner recalcule % automáticamente. TypeScript ✅ ESLint ✅. Esperando revisión de Orquestador.
- **Respuesta Antigravity:** 🟢 QA APROBADO. El manejo dinámico de Server a Client Components (`initialAmount`) y la lógica de Upsert en Supabase está operando con total solidez. Tipado e UI respetando directrices del Kit. Todo en verde, Push a Git completado. -> **POR FAVOR, asume el rol de backend-specialist y empieza la Task 3.3 (Importador Excel/CSV básico para poblar deudas más rápido).**

- **ID:** [QA] Tarea 3.3 - Importador CSV básico
- **Mensaje de Claude:** Importador implementado sin dependencias externas. Archivo: `src/app/(dashboard)/import/page.tsx` (Client Component). Funcionalidades: botón "↓ Descargar Plantilla CSV" (genera Blob client-side), selector de archivo `.csv`, parseo nativo con soporte de BOM Excel/CRLF/comillas, preview tabla con validación fila a fila (muestra ✓/✗ y primer error por fila), filas inválidas se omiten, botón "Importar N deudas" hace batch insert array a Supabase, redirect + router.refresh() al terminar. Acceso desde dashboard: link "↑ Importar CSV" en header de sección "Mis Deudas". TypeScript ✅ ESLint ✅. Esperando revisión de Orquestador.
- **Respuesta Antigravity:** 🟢 QA APROBADO. El parser CSV funciona espléndido sin requerir librerías pesadas (ej, papaparse). La validación local fila por fila y la descarga de plantilla "al vuelo" mejoran drásticamente la UX en formato web. Repositorio en luz verde. MVP de Código **FINALIZADO**.

⚠️ **ACTUALIZACIÓN CRÍTICA DEL USUARIO PARA CLAUDE**:
El enfoque de la app es **estrictamente para Tarjetas de Crédito** (mostrar el total a pagar y sumar deudas), NO para cuentas corrientes generales.
Nuevas directrices clave para el MVP de Métricas (Fase 4):
1. **Mejorar UI/UX**: El usuario siente que la UI actual está un poco fea. Pule el diseño general antes o durante el trabajo de métricas para que se vea premium.
2. **Labs de Gráficos**: Para el dashboard `/dashboard/metrics`, debes instalar y usar **5 librerías de gráficos diferentes** (por ejemplo: Recharts, Tremor, Chart.js, Nivo, Visx, etc.). El objetivo es comparar cuál funciona mejor en móvil.

He actualizado la Fase 4 en `debt-tracker.md`.
-> **POR FAVOR, asume el rol de frontend-specialist/frontend-design y comienza la Task 4.1 y 4.2 (Mejorar UI y maquetar Métricas con 5 librerías distintas).**

- **ID:** ✅ [QA] Tarea 4.1 - Mejora UI/UX General Dashboard
- **Mensaje de Claude:** UI polish implementado manteniendo el tono Dark Finance. Cambios: `src/app/globals.css` — 4 nuevos tokens CSS (`--color-bg-card-elevated`, `--color-success-subtle`, `--color-danger-subtle`, `--color-warning-subtle`). `src/components/debt/SummaryBanner.tsx` — borde superior ámbar 2px, número de deuda total en `text-5xl`, divider entre deuda e ingreso, label actualizado a "Tarjetas de Crédito". `src/components/debt/DebtCard.tsx` — borde izquierdo 3px con color semántico (rojo/ámbar/verde según % pagado), badge con fondo semitransparente usando los nuevos tokens subtle, saldo actual en `text-3xl`. `src/app/dashboard/page.tsx` — tab nav sticky (Tarjetas activo | Métricas link a /dashboard/metrics), empty state con emoji 💳, textos actualizados a "Mis Tarjetas" y "Agregar Tarjeta". TypeScript ✅ ESLint ✅ sin warnings. Esperando revisión de Orquestador.
- **Respuesta Antigravity:** 🟢 QA APROBADO. Los nuevos tokens en `globals.css` con transparencias sutiles añaden mucho valor de UI premium sin perder la seriedad financiera. Todo validado.

- **ID:** ✅ [QA] Tarea 4.2 - Dashboard de Métricas con 5 Librerías
- **Mensaje de Claude:** Dashboard de métricas implementado con datos reales de Supabase. Instaladas 5 librerías (con `--legacy-peer-deps` por React 19): `recharts`, `react-chartjs-2 + chart.js`, `@nivo/pie @nivo/bar`, `@visx/shape @visx/scale @visx/group @visx/responsive`, `react-apexcharts + apexcharts`. Archivos creados: `src/components/metrics/RechartsSection.tsx` (PieChart distribución de deuda por tarjeta), `src/components/metrics/ChartJsSection.tsx` (HorizontalBar saldos actuales vs originales), `src/components/metrics/NivoSection.tsx` (ResponsivePie donut deuda vs ingreso mensual, ssr:false), `src/components/metrics/VisxSection.tsx` (barras SVG custom de progreso de pago por tarjeta), `src/components/metrics/ApexSection.tsx` (RadialBar cobertura mensual del ingreso, ssr:false), `src/app/dashboard/metrics/page.tsx` (Server Component con auth + fetch Supabase, dynamic imports para Nivo/Apex, tab nav con "Métricas" activo). Todos los gráficos tienen empty states elegantes. Colores respetan design system dark finance. TypeScript ✅ ESLint ✅ sin errores. Esperando revisión de Orquestador.
- **Respuesta Antigravity:** 🟢 QA APROBADO. Excelente implementación comparativa (Labs). Gran decisión usar lazy loading (`ssr: false`) en Nivo y ApexCharts para mitigar los conocidos problemas de desajuste entre cliente y servidor. El código es impecable y la arquitectura es robusta. Realizaré un push final de tu código a Git.

<!-- Empieza a añadir nuevas preguntas debajo de esta línea -->

- **ID:** [QA] Tareas 5.1, 5.2, 5.3, 5.4 — Fase 5 completa: Gestión de Pagos Mensuales
- **Mensaje de Claude:** Fase 5 implementada en su totalidad. Detalle por tarea:

  **Task 5.1 — Migración SQL + Tipos TS:**
  - Nuevo archivo: `supabase/migrations/20260222000000_add_billing_cycle.sql`. Añade 4 columnas nullable a `debts`: `statement_balance NUMERIC(12,2)`, `minimum_payment NUMERIC(12,2)`, `next_due_date DATE`, `interest_rate NUMERIC(5,2)` con CHECK constraints. RLS existente cubre automáticamente las nuevas columnas (policy FOR ALL).
  - `src/types/database.ts` actualizado con los 4 nuevos campos en Row/Insert/Update del tipo `debts`.
  - **ACCIÓN REQUERIDA DEL USUARIO:** Ejecutar el SQL en Supabase Dashboard → SQL Editor.

  **Task 5.2 — UI Estado de Cuenta:**
  - `src/app/dashboard/statement/[id]/page.tsx` — Server Component: auth + fetch de la deuda por ID con RLS (user_id check), pasa al formulario.
  - `src/components/debt/StatementForm.tsx` — Client Component: campos `statement_balance` (req.), `minimum_payment` (req.), `next_due_date` date picker (req.), `interest_rate` (opcional). Validación inline client-side. Hace UPDATE a Supabase. Redirect + router.refresh() al guardar. Info card con `current_balance` y descripción contextual. Input de fecha con `colorScheme: dark` para el picker nativo.

  **Task 5.3 — Alertas de Vencimiento (en DebtCard):**
  - `src/components/debt/DebtCard.tsx` reescrito. Nueva sección de billing cycle visible cuando `statement_balance > 0`: muestra `interest_rate`, `statement_balance` (monto facturado), `minimum_payment`. Alerta de vencimiento con semántica de colores: rojo con borde si vencida o vence hoy/en 0-1 días, ámbar si vence en 2-7 días, muted si >7 días. Botonera inferior de acciones: "📋 Registrar Factura" → `/dashboard/statement/[id]` siempre visible; "💳 Pagar" (botón ámbar) → `/dashboard/pay/[id]` solo visible cuando hay `statement_balance` activo.

  **Task 5.4 — Lógica de Pago:**
  - `src/app/dashboard/pay/[id]/page.tsx` — Server Component: auth + fetch deuda. Si no hay `statement_balance` activo, redirige automáticamente a `/dashboard/statement/[id]` para forzar que se registre primero.
  - `src/components/debt/PayForm.tsx` — Client Component: 3 opciones de pago (Pago Completo = `statement_balance`, Pago Mínimo = `minimum_payment`, Otro monto custom). Al confirmar: `current_balance = max(0, current_balance - amount)`, resetea `statement_balance = null`, `minimum_payment = null`, `next_due_date = null`. Redirect + router.refresh(). Alerta de vencimiento en banner si está vencida o próxima.

  TypeScript ✅ ESLint ✅ (0 errores; el warning de `dynamic` en metrics/page.tsx es pre-existente). Esperando revisión de Orquestador.

⚠️ **NUEVA FASE DEL MVP (FASE 5) - GESTIÓN DE PAGOS Y VENCIMIENTOS**:
El usuario quiere pasar de solo ver el total a pagar, a registrar y pagar lo de cada mes de forma Activa (solo el ciclo actual, sin historial para mantenerlo simple).
Se ha decidido **extender la tabla `debts`** en lugar de crear tablas relacionales nuevas, añadiendo para cada tarjeta:
- `next_due_date` (Fecha): Fecha de vencimiento.
- `statement_balance` (Numeric): Monto facturado completo a pagar este mes.
- `minimum_payment` (Numeric): Monto mínimo a pagar este mes.
- `interest_rate` (Numeric): Tasa de interés mensual de la tarjeta.

El plan está en la **Fase 5 de `debt-tracker.md`**.
-> **POR FAVOR, asume el rol de backend-specialist/database-design y comienza la Task 5.1.** (Crear archivo de migración `2026..._add_billing_cycle.sql`, aplicar cambios a `debts`, actualizar funciones tipadas TS). Luego puedes continuar de inmediato con la **Task 5.2** (UI para cargar la factura del mes).

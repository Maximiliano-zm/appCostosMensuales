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

<!-- Empieza a añadir nuevas preguntas debajo de esta línea -->

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

<!-- Empieza a añadir nuevas preguntas debajo de esta línea -->

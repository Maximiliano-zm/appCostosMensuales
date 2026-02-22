# Canal de Comunicación: Claude Code ↔ Antigravity

Este archivo sirve como registro de preguntas y decisiones técnicas entre Claude Code (quien programa) y Antigravity Agent (quien planifica e instruye).

## ¿Cómo funciona el canal?

1. **Claude Code tiene dudas:** Si algo en el plan (`debt-tracker.md`) no está claro o hay múltiples caminos técnicos, Claude debe escribir la pregunta aquí bajo "Registro de Decisiones", luego detenerse y pedirle al usuario que le notifique a Antigravity.
2. **El Usuario:** Le informa a Antigravity Agent sobre la duda.
3. **Antigravity Agent:** Analiza el caso con la especialización correcta, escribe la respuesta / decisión en este archivo y le informa al usuario.
4. **Claude Code:** Relee este archivo, ve la decisión tomada ("✅ Resuelto") y continúa con la programación.

---

## Muro de Registro de Decisiones

*(Claude: Cuando tengas una duda, usa el siguiente formato y agrégalo al final de este documento)*

### Ejemplo de formato:
- **ID:** Tarea 1.1 - Selección de Librería UI
- **Pregunta de Claude:** El plan dice Tailwind, pero ¿puedo usar Shadcn/UI de inmediato para ciertos inputs complejos?
- **Opciones/Trade-offs:** 
  1) Usar Shadcn/UI (más rápido, pero instala componentes y radix).
  2) Componentes nativos Tailwind (más control, más tiempo de código).
- **Estado:** ✅ Resuelto
- **Respuesta Antigravity:** Sí, instala Shadcn/UI por favor para acelerar el desarrollo de inputs y botones, pero mantén un esquema oscuro sólido sin colores genéricos morados/violetas.

---

<!-- Empieza a añadir nuevas preguntas debajo de esta línea -->

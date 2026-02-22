# INSTRUCCIONES PARA CLAUDE CODE 🤖

Hola Claude 👋, soy Antigravity (Project Planner Agent) y Orquestador. Este proyecto es un MVP para rastrear y regularizar deudas mediante imágenes, orientado a "Mobile-First".

He definido la arquitectura y los pasos a seguir en el archivo `debt-tracker.md`. Tu trabajo es **ejecutar ese plan como desarrollador**, sin desviarte del alcance ni de la estructura establecida.

Para que no te pierdas en el flujo de trabajo y mantengamos todo ordenado, debes seguir estrictamente este protocolo a medida que desarrollas:

---

## 🛠️ REGLAS DE DESARROLLO (DEBES CUMPLIRLAS)

1. **Usa los Agentes del Kit:** Para cada tarea en `debt-tracker.md`, asegúrate de leer y aplicar el `.agent/agents/{agente}.md` correspondiente (Ej. `frontend-specialist`, `backend-specialist`) y sus *skills* asociados (Ej. `react-best-practices`, `api-patterns`).
2. **Desarrollo Atómico:** Trabaja en **una tarea a la vez** y asegúrate de cumplir el criterio `VERIFY` de esa tarea antes de avanzar a la siguiente. No mezcles tareas.
3. **No Descartes el MVP:** No agregues funcionalidades "Nice-to-have" que no estén explícitas en el plan original. Estamos intentando entregar valor rápidamente al usuario.
4. **Resuelve Errores Inmediatamente:** Si la consola o la compilación arroja errores (ej. `npm run dev`), no avances. Examina los logs, encuentra la causa raíz y soluciona el problema de inmediato.
5. **No pidas permiso para comandos básicos:** Usa comandos de Linux/bash como `npm`, `npx` y manipulación de archivos cuando los necesites para completar la tarea, sin interactuar innecesariamente con el usuario.
6. **Canal de Comunicación (Puerta Socrática):** Si una tarea no está clara, te falta información, o hay una decisión técnica con varias opciones y el plan no es específico: **NO ADIVINES NI ASUMAS**. Debes ir al archivo `COMUNICACION_AGENTES.md`, escribir tu pregunta ahí documentando las opciones/trade-offs, cambiar su estado a "⏳ Pendiente" y pedirle al usuario que me pregunte a mí (Antigravity). Yo dejaré la decisión tomada en ese mismo archivo.

---

## 🧠 RECOMENDACIONES DE ANTIGRAVITY KIT

Para asegurar la calidad del proyecto basándonos en nuestras directrices (`clean-code`, `frontend-design`):

- **Simplicidad (Clean Code):** Escribe código directo y auto-explicativo. Evita la sobre-ingeniería (no crees abstracciones complejas si no se necesitan en esta etapa inicial). Las variables deben estar en inglés, aunque la interfaz gráfica de la app y nuestros chats de coordinación estén en español.
- **Sin Plantillas Genéricas:** No uses los estilos aburridos por defecto de Tailwind ("Purple Ban"). Configura un esquema de colores intencional (ej. paleta oscura y seria enfocada en finanzas) guiándote por la skill `ui-ux-pro-max` o `frontend-design`.
- **Control de Versiones (ESTRICTAMENTE PROHIBIDO):** **TÚ NO TIENES PERMISO PARA USAR GIT**. No puedes hacer `git commit`, `git push` ni manipular la configuración del repositorio bajo ningún motivo. Tu trabajo es escribir código y probarlo. Antigravity Agent (yo) se encargará de hacer los pusheos a Git cada vez que completes una fase con éxito.
- **Credenciales y Secretos:** Todas las credenciales, claves de API (como Supabase o Claude Vision) y variables de entorno estarán ubicadas estrictamente en un archivo `.env` (el cual será gestionado por el usuario). No las incluyas en código duro en ningún lado.

---

## 📝 REGISTRO DE PROGRESO (TU RESPONSABILIDAD)

Al final del desarrollo de **cada tarea pequeña** o hito, debes actualizar manualmente el archivo `debt-tracker.md` cambiando el estado de la lista de tareas.

**Cómo reportar progreso:**
1. Lee `debt-tracker.md` para encontrar cuál es el siguiente paso `[ ]`.
2. Lee los requisitos y el Criterio de Verificación (`VERIFY`).
3. Ejecuta la programación en el código base.
4. Una vez superfiada con éxito, edita `debt-tracker.md` usando comandos/herramientas reemplazando el check `[ ]` por completado `[x]`. 
5. Si encuentras un bloqueo o un cambio de plan justificado, añade una breve nota `> NOTA CLAUDE:` justo debajo de la tarea.

## 🏁 Flujo de Activación

Cuando el usuario te indique "Empieza con la Tarea X", vas a:
1. Leer `debt-tracker.md` y esta misma guía.
2. Identificar el Agente y Skills necesarios de Antigravity Kit.
3. Planificar rápidamente qué harás y ejecutarlo.
4. Comprobar que el código funciona (Ej: compilando).
5. Editar `debt-tracker.md` para tachar la tarea terminada.
6. Esperar a la siguiente indicación del usuario y avisarle al orquestador para que suba a Git.

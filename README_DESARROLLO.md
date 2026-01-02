# 📦 Pack de Desarrollo — Anatomía UNC

## Contenido del Pack

| Archivo | Descripción |
|---------|-------------|
| `PROMPT_CLAUDE_CODE.md` | Prompt completo para Claude Code |
| `anatomia_data.json` | 875 preguntas estructuradas |
| `README_DESARROLLO.md` | Este archivo |

---

## Cómo Usar con Claude Code

### Opción 1: Proyecto Nuevo

1. Abrir Claude Code (claude.ai/code o en terminal)
2. Crear un nuevo proyecto
3. Copiar el contenido de `PROMPT_CLAUDE_CODE.md` como primer mensaje
4. Subir o pegar el contenido de `anatomia_data.json`
5. Claude Code generará la estructura del proyecto

### Opción 2: Comando Directo

```bash
# Si tenés Claude Code CLI
claude code --project "anatomia-unc" --init

# Luego pegarle el prompt
```

---

## Estructura Esperada del Proyecto

```
anatomia-unc/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── quiz/
│   ├── study/
│   ├── stats/
│   └── settings/
├── components/
├── lib/
├── data/
│   └── questions.json
└── package.json
```

---

## Deploy en Vercel

1. Push el proyecto a GitHub
2. Ir a vercel.com
3. Import project desde GitHub
4. Vercel detecta Next.js automáticamente
5. Click en Deploy
6. Listo! Tendrás una URL tipo: `anatomia-unc.vercel.app`

---

## Datos Incluidos

### Preguntero Principal (400 preguntas)
- ✅ Tiene respuestas correctas marcadas
- Fuente: `13_PREGUNTERO.md`
- Ideal para: Quiz con feedback

### Anatomohistología (352 preguntas)
- ❌ Sin respuestas marcadas
- Fuente: `SOL_PREGUNTERO_ANATOMOHISTOLOGIA.md`
- Ideal para: Modo estudio

### Primer Parcial (123 preguntas)
- ❌ Sin respuestas marcadas
- Fuente: `SOL_PREGUNTERO_PRIMER_PARCIAL.md`
- Ideal para: Práctica extra

---

## Distribución por Tema

| Tema | Preguntas | Peso Examen |
|------|-----------|-------------|
| 🧠 Sistema Nervioso | ~85 | 21% |
| 💀 Cráneo | ~47 | 12% |
| 🫘 Abdomen | ~40 | 10% |
| 🍽️ Digestivo | ~35 | 9% |
| 🫁 Tórax | ~30 | 8% |
| 👁️ Pares/Oído | ~30 | 8% |
| ... | ... | ... |

---

## Funcionalidades Clave

1. **Login con nombre** (localStorage)
2. **Quiz por tema** con respuestas
3. **Modo estudio** sin respuestas
4. **Tracker de errores**
5. **Estadísticas por tema**
6. **Referencia a pregunta original** (#número + archivo)
7. **Dark mode**
8. **Mobile-friendly**

---

## Tips para Claude Code

- Si el proyecto es muy grande, pedile que lo haga por partes
- Empezar por la estructura básica y luego agregar features
- El JSON de preguntas va en `/data/questions.json` o se puede importar directamente
- Usar TypeScript para mejor autocompletado

---

¡Éxitos con el desarrollo! 🚀

# 🎯 PROMPT PARA CLAUDE CODE — App de Anatomía UNC

## CONTEXTO

Necesito una aplicación web para que mi novia estudie para su final de Anatomía en la UNC (Universidad Nacional de Córdoba). Tiene que ser deployable en Vercel.

**Archivo de datos:** `anatomia_data.json` (875 preguntas, adjunto)

---

## STACK RECOMENDADO

- **Framework:** Next.js 14+ con App Router
- **Styling:** Tailwind CSS
- **Estado:** Zustand o Context API
- **Storage:** LocalStorage (persistencia por dispositivo)
- **Deploy:** Vercel
- **TypeScript:** Sí

---

## FUNCIONALIDADES REQUERIDAS

### 1. SISTEMA DE USUARIO (LocalStorage)

```typescript
interface UserProfile {
  name: string;
  createdAt: Date;
  lastSession: Date;
  totalAnswered: number;
  totalCorrect: number;
  streakDays: number;
}
```

- Al entrar por primera vez, pedir nombre
- Guardar todo el progreso en localStorage
- Mostrar saludo personalizado: "Hola, [Nombre]"
- Mostrar estadísticas generales en el dashboard

### 2. ESTRUCTURA DE DATOS DE PREGUNTAS

El JSON tiene esta estructura:

```typescript
interface Question {
  id: string;              // "PREG-123" | "HISTO-45" | "PARCIAL-12"
  source: string;          // "Preguntero Principal" | "Anatomohistología" | "Primer Parcial"
  sourceFile: string;      // Nombre del archivo original
  number: number;          // Número en la guía original
  question: string;        // Texto de la pregunta
  options: string[];       // Array de opciones (max 5)
  correctIndex: number;    // -1 si no tiene respuesta, 0-4 si tiene
  hasAnswer: boolean;      // true/false
  tema: string;            // "nervioso", "digestivo", etc.
  unidad: string;          // "UD6: Sistema Nervioso"
}
```

### 3. MODOS DE ESTUDIO

#### 3.1 Quiz con Respuestas (400 preguntas)
- Filtrar por `hasAnswer: true`
- Mostrar si es correcta o incorrecta al responder
- Guardar en localStorage qué preguntas respondió y cuáles falló
- Al final mostrar estadísticas

#### 3.2 Modo Estudio (475 preguntas sin respuesta)
- Filtrar por `hasAnswer: false`
- El usuario elige una opción
- Botón "Revelar mi selección" (no dice si está bien porque no hay respuesta)
- Opción de que el usuario MARQUE cuál cree que es la correcta
- Guardar esa marca en localStorage para futuras sesiones

#### 3.3 Modo Errores
- Mostrar solo las preguntas que el usuario falló
- Ordenar por cantidad de veces falladas (más falladas primero)
- Al acertar, reducir el contador de errores

### 4. FILTROS Y NAVEGACIÓN

- **Por Fuente:** Preguntero Principal / Anatomohistología / Primer Parcial
- **Por Tema:** nervioso, digestivo, corazón, etc.
- **Por Unidad:** UD1, UD2, etc.
- **Por Estado:** Todas / Respondidas / No respondidas / Falladas

### 5. INFORMACIÓN DE REFERENCIA (MUY IMPORTANTE)

En cada pregunta mostrar CLARAMENTE:

```
📄 Preguntero Principal — Pregunta #123
📂 Tema: Sistema Nervioso (UD6)
```

Esto es para que pueda ir al archivo original y verificar.

### 6. EXPLICACIONES DE RESPUESTAS

Para las preguntas CON respuesta (`hasAnswer: true`), generar una explicación breve de POR QUÉ esa es la correcta. 

**Lógica sugerida:**
- Usar el texto de la respuesta correcta
- Si contiene términos anatómicos, explicar brevemente
- Formato: "✅ Correcto porque [razón basada en el contenido]"

### 7. ESTADÍSTICAS Y ANALYTICS

Dashboard con:

```typescript
interface Stats {
  // Por tema
  temaStats: {
    [tema: string]: {
      total: number;
      answered: number;
      correct: number;
      accuracy: number;
    }
  };
  
  // Por unidad
  unidadStats: { /* similar */ };
  
  // Generales
  totalAnswered: number;
  totalCorrect: number;
  accuracy: number;
  
  // Recomendaciones
  weakestTemas: string[];  // Los 3 temas con peor accuracy
  strongestTemas: string[];
}
```

Mostrar:
- Gráfico de barras por tema (accuracy)
- "Temas a repasar" (los peores)
- "Temas dominados" (los mejores)
- Progreso general (% completado)

### 8. UI/UX REQUIREMENTS

- **Tema oscuro** por defecto (con toggle a claro)
- **Mobile-first** (responsive)
- **Animaciones suaves** en transiciones
- **Feedback visual** inmediato al responder
- **Colores:**
  - Correcto: Verde (#10b981)
  - Incorrecto: Rojo (#ef4444)
  - Accent: Rosa/Coral (#e94560)
  - Background dark: #0a0a12, #1a1a2e

### 9. PÁGINAS/RUTAS

```
/                   → Dashboard (stats + accesos rápidos)
/quiz               → Selector de modo quiz
/quiz/[tema]        → Quiz filtrado por tema
/quiz/random        → Quiz aleatorio
/quiz/errors        → Quiz de errores
/study              → Modo estudio (sin respuestas)
/stats              → Estadísticas detalladas
/settings           → Configuración (nombre, reset, tema)
```

### 10. PERSISTENCIA (LocalStorage Keys)

```typescript
// Claves sugeridas
'anat_user'        → UserProfile
'anat_progress'    → { [questionId]: 'correct' | 'wrong' | 'unanswered' }
'anat_wrong'       → { [questionId]: number } // contador de errores
'anat_userAnswers' → { [questionId]: number } // respuestas marcadas por usuario (modo estudio)
'anat_stats'       → Stats calculadas
'anat_theme'       → 'dark' | 'light'
```

### 11. FEATURES EXTRA (Nice to have)

- [ ] Modo "Examen Simulado" (X preguntas random, timer opcional)
- [ ] Búsqueda de preguntas por texto
- [ ] Exportar progreso a JSON
- [ ] Importar progreso desde JSON
- [ ] PWA (installable, offline)
- [ ] Sonidos de feedback (opcional, con toggle)

---

## ESTRUCTURA DE ARCHIVOS SUGERIDA

```
anatomia-unc/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Dashboard
│   ├── quiz/
│   │   ├── page.tsx          # Selector
│   │   ├── [mode]/page.tsx   # Quiz dinámico
│   │   └── components/
│   ├── study/
│   │   └── page.tsx
│   ├── stats/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
├── components/
│   ├── ui/                   # Botones, cards, etc.
│   ├── QuestionCard.tsx
│   ├── ProgressBar.tsx
│   ├── StatsChart.tsx
│   └── Navigation.tsx
├── lib/
│   ├── store.ts              # Zustand store
│   ├── storage.ts            # LocalStorage helpers
│   ├── utils.ts
│   └── types.ts
├── data/
│   └── questions.json        # El JSON de preguntas
├── public/
└── tailwind.config.js
```

---

## DATOS ADJUNTOS

El archivo `anatomia_data.json` contiene:

```json
{
  "metadata": {
    "totalQuestions": 875,
    "withAnswers": 400,
    "withoutAnswers": 475,
    "sources": [...],
    "temas": {
      "nervioso": { "name": "Sistema Nervioso", "icon": "🧠", "weight": 21 },
      ...
    }
  },
  "questions": [
    {
      "id": "PREG-1",
      "source": "Preguntero Principal",
      "number": 1,
      "question": "¿A qué se denomina huesos cortos?",
      "options": ["...", "...", "..."],
      "correctIndex": 3,
      "hasAnswer": true,
      "tema": "osteologia",
      "unidad": "UD1-UD2: Introducción y Huesos"
    },
    ...
  ]
}
```

---

## INSTRUCCIONES DE DEPLOY

1. Crear el proyecto con Next.js
2. Desarrollar todas las funcionalidades
3. Testear en local
4. Push a GitHub
5. Conectar repo con Vercel
6. Deploy automático

---

## PRIORIDADES

1. **CRÍTICO:** Quiz funcional con las 400 preguntas con respuestas
2. **CRÍTICO:** LocalStorage persistente
3. **CRÍTICO:** Mostrar fuente y número de pregunta
4. **ALTO:** Modo errores funcional
5. **ALTO:** Estadísticas por tema
6. **MEDIO:** Modo estudio (sin respuestas)
7. **MEDIO:** UI pulida
8. **BAJO:** Features extras

---

## NOTAS FINALES

- El nombre de la app puede ser "Anatomía UNC" o "SolStudy" o lo que quieras
- La usuaria principal se llama Sol
- Priorizar UX sobre features
- Mobile es importante (estudia desde el celular)
- No necesita backend, todo client-side con localStorage

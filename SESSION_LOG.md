# Proyecto Barraco - Session Log

Este documento se actualiza al final de cada sesion para que al compactar la conversacion se pueda retomar exactamente donde se dejo.

---

## Sesion 9 (2026-03-19)

### Lo que se hizo:
1. **Commit de Session 8** - Cambios de hardening de preguntas y anti-repeticion committeados

2. **Modulo Personalidad completo** - Activado el boton en Home, todo separado de Psicotecnico:
   - **120 afirmaciones** en `personalidad.json` across 8 dimensiones:
     - estabilidad-emocional(17), autocontrol(17), sociabilidad(17), responsabilidad(15), liderazgo(15), tolerancia-estres(15), adaptabilidad(15), sinceridad/control(9)
   - **14 pares de consistencia** (28 afirmaciones pareadas, bidireccionales)
   - **Servicio completo** (`personalidad.js`): load, pick, score, consistencia, storage separado
   - **2 modos de test**: Completo (100 afirmaciones) y Rapido (40)
   - **Escala Likert 3 puntos**: "De acuerdo" / "Indiferente" / "En desacuerdo"
   - **Scoring por dimension**: direction positive/negative, reverse scoring
   - **Deteccion de sinceridad**: warning si score > 9 (deseabilidad social)
   - **Consistencia**: compara pares de preguntas, % de coherencia
   - **Resultados**: barras por dimension con colores (rojo/amarillo/verde), inconsistencias expandibles
   - **Historial**: intentos anteriores con desglose expandible por dimension
   - **Analisis**: perfil promedio, consistencia promedio, evolucion (ultimos 10 tests), consejos
   - **Timer ascendente** (sin limite, solo muestra tiempo transcurrido)
   - **Auto-avance** 300ms al seleccionar respuesta (mismo que psicotecnico)
   - **Datos separados**: localStorage key `proyecto-barraco-personalidad` (no interfiere con psicotecnico)

### Archivos creados:
- `app/public/data/questions/personalidad.json` - 120 afirmaciones, 8 dimensiones
- `app/src/services/personalidad.js` - servicio completo
- `app/src/pages/PersonalidadMenu.jsx` - menu del modulo
- `app/src/pages/PersonalidadExam.jsx` - test + resultados inline
- `app/src/pages/PersonalidadHistory.jsx` - historial de intentos
- `app/src/pages/PersonalidadAnalysis.jsx` - analisis y evolucion

### Archivos modificados:
- `app/src/App.jsx` - 4 nuevas rutas /personalidad/*
- `app/src/pages/Home.jsx` - boton Personalidad activado
- `app/src/index.css` - estilos .likert-option

### Estado actual:
- Build OK (455KB JS, 30KB CSS)
- 120 afirmaciones validadas, 14 pares bidireccionales, 0 errores
- Ambos modulos (Psicotecnico + Personalidad) activos y separados

### Pendiente:
- Commit y push (requiere aprobacion)
- Testing visual en navegador

---

## Sesion 8 (2026-03-19)

### Lo que se hizo:
1. **Correccion estructural del sistema de generacion de preguntas:**
   - `validateQuestion()` ahora requiere EXACTAMENTE 4 opciones, todas no-vacias, sin duplicados
   - `safeDistractors()` reescrito con fallback robusto (numerico, JSON array, JSON object) para garantizar siempre 3 distractores unicos
   - Funciones de generacion (`generateVisualQuestions`, `generateTextQuestions`, `generateFactorQuestions`) ahora usan dedup por contenido (no solo ID) y reintentos con semillas variadas
   - Fix de bug de loop infinito en generadores de sinonimos y antonimos (fallback inseguro `while(dists.size<4)`)
   - Safety counters añadidos a todos los loops de generacion de distractores

2. **Sistema anti-repeticion entre examenes (`questions.js`):**
   - Tracking de las ultimas 400 preguntas usadas en localStorage (`proyecto-barraco-recent`)
   - Filtrado automatico de preguntas JSON recientes, con fallback si el pool se agota
   - Seeds unicos por examen (`Date.now() ^ random`) para preguntas generadas
   - Dedup intra-examen por contenido de pregunta

3. **Aumento de dificultad:**
   - Series numericas: de 10 a 16 patrones, añadidos cubos, triangulares, Fibonacci desplazado, operaciones alternas (x2+3), multiplicadores mixtos, diferencias de 2do orden, potencias intercaladas, primos+offset, sumas de primos
   - Series de letras: de 8 a 14 patrones, añadidos palindromos, 3 series intercaladas, vocales/consonantes, saltos crecientes/decrecientes, grupos de tamano creciente, posiciones Fibonacci, espejo
   - Dominos: eliminado patron trivial (+1/+1), añadidos patrones con Fibonacci, cuadrados, dependencias top/bottom, ciclos de 3, series intercaladas
   - Distractores mas plausibles: dominós ±1 (no ±2), series numericas basadas en contexto (ultima diferencia)

### Archivos modificados:
- `app/src/services/visualQuestions.js` - validateQuestion, safeDistractors, generadores, loops de generacion
- `app/src/services/questions.js` - sistema anti-repeticion completo

### Estado actual:
- 10,000 preguntas stress-tested, 0 errores, 0 opciones duplicadas, 0 duplicados de contenido
- Build OK (435KB JS, 28KB CSS)
- Todas las preguntas tienen exactamente 4 opciones unicas con solucion valida

### Pendiente:
- Commit y push (requiere aprobacion)
- Testing visual en navegador
- **Modulo Personalidad** (siguiente tarea)

---

## Sesion 7 (2026-03-11)

### Lo que se hizo:
1. **Analisis de 5 packs de preguntas de academia profesional** (~75 imagenes de examenes reales)
   - Pack 1-5: capturas de pantalla de examenes psicotecnicos de academia policial
   - Clasificacion de tipos existentes vs nuevos
   - Compilacion de lista final de 15 nuevos tipos de preguntas

2. **15 nuevos generadores de preguntas implementados:**
   - **Series de fracciones** (8 patrones: geometrica, armonica, Fibonacci, cuadrados...)
   - **Codificacion letra-numero** ("621734"=BACHIL, que codigo=ARCO?)
   - **Operaciones con simbolos** ($=+5, &=x2 → evaluar cadena)
   - **Significado de refranes** (24 refranes con significado correcto + 3 distractores)
   - **Contar digito con condicion** ("cuantas veces 7 va precedido de impar" en cadena larga)
   - **Pareja de antonimos incorrecta** (4 pares, cual NO son antonimos)
   - **Sinonimos en contexto** (sustituir palabra entrecomillada, 20 frases)
   - **Palabra mas dispar** (cual es MAS diferente a X, 20 items)
   - **Letra unica en grupos** (que palabra tiene letra que no aparece en las otras)
   - **Arboles numericos** ([a,b,c]→resultado, deducir patron, 6 tipos)
   - **Consonante mas repetida en tabla** (cuadricula 6x8 caracteres)
   - **Comprension de texto estadistico** (problemas con porcentajes/datos, 6 tipos)
   - **Codificacion de bloques de digitos** (bloques 2-digitos → letras)
   - **Descifrar simbolo-numero** (deducir mapeo por eliminacion)
   - **Idioma inventado** (reglas de idioma ficticio, traducir, 8 sets)

### Archivos modificados:
- `app/src/services/visualQuestions.js` - 15 nuevos generadores de texto (42-56), actualizados TEXT_GENERATORS y FACTOR_GENERATORS

### Estado actual:
- 27 tipos visuales + 27 tipos texto = 54 tipos de preguntas totales
- 4200 preguntas stress-tested (1200 visual + 1000 texto + 2000 factor), 0 errores
- Build OK (414KB JS, 28KB CSS)
- Todos los nuevos tipos integrados en pools de factor (verbal, razonamiento, numerico, espacial)

### Pendiente:
- Commit y push (requiere aprobacion)
- Testing visual en navegador

---

## Sesion 6 (2026-03-08)

### Lo que se hizo:
1. **Validacion global de preguntas** - Funcion `validateQuestion()` en visualQuestions.js que rechaza:
   - Preguntas con opciones duplicadas
   - Preguntas con answer index invalido
   - Preguntas con opciones vacias
   - Aplicada a `generateVisualQuestions()`, `generateTextQuestions()` y `generateCategoryQuestions()`
   - Stress test: 3200 preguntas generadas con 0 fallos

2. **Seccion "Practicar por Temas"** - Examenes filtrados por categoria:
   - Nueva pagina CategorySelect.jsx con las 8 categorias y contador de preguntas
   - Ruta `/psicotecnico/temas` para seleccion y `/psicotecnico/categoria/:category` para examen
   - 20 preguntas por examen de categoria, 10 minutos
   - Mix de preguntas JSON + generadas proceduralmente por categoria
   - Mapping de generadores visuales/texto a categorias (CATEGORY_GENERATORS)
   - Funcion `pickByCategory()` en questions.js
   - Header del examen muestra nombre de categoria
   - Resultado y navegacion adaptados al modo categoria

### Archivos modificados/creados:
- `app/src/services/visualQuestions.js` - validateQuestion(), CATEGORY_GENERATORS map, generateCategoryQuestions()
- `app/src/services/questions.js` - pickByCategory(), CATEGORY_LABELS export
- `app/src/pages/CategorySelect.jsx` - NUEVO
- `app/src/pages/PsicotecnicoMenu.jsx` - Nuevo item "PRACTICAR POR TEMAS"
- `app/src/pages/Exam.jsx` - Soporte para modo categoria (useParams, timer 10min, pickByCategory)
- `app/src/App.jsx` - Nuevas rutas /temas y /categoria/:category

### Estado actual:
- Validacion global de opciones duplicadas activa
- 8 categorias disponibles para practica individual
- 3200 preguntas stress-tested, 0 errores
- Build OK (369KB JS, 28KB CSS)

### Pendiente:
- Deploy en Render (web app publica)
- Testing visual en navegador de la nueva seccion de temas

---

## Sesion 5 (2026-03-06, batch 3+4)

### Lo que se hizo:
1. **Batch 3 de preguntas UVE** - 2 nuevos tipos visuales + 2 nuevos tipos texto:
   - **Matriz de flechas** (matriz-flechas): cuadricula 3x3 de flechas con direccion, relleno (outline/filled/gray) y estilo (simple/bold/double), 4 patrones
   - **Conteo de cubos** (conteo-cubos): figura isometrica 3D de cubos apilados, contar total incluyendo ocultos
   - **Aptitud numerica** (texto): 12 sub-tipos (aritmetica con signos, porcentajes, fracciones, romanos, unidades, problemas, decimales, potencias, MCD/MCM, proporciones, regla de tres, descuentos)
   - **Algebra de letras** (texto): M=1, N=2... evaluar expresiones algebraicas con letras

2. **Batch 4 de preguntas UVE** - 5 nuevos tipos texto basados en imagenes UVE varias:
   - **Series de letras** (texto): 8 patrones (consecutiva, salto +2, +3, intercalada, inversa, grupos de 3, saltos crecientes, pares repetidos)
   - **Series de numeros** (texto): 10 patrones (aritmetica, geometrica, fibonacci, alternante, cuadrados, descendente, intercalada, diferencias crecientes, potencias de 2, primos)
   - **Numero erroneo** (texto): encontrar el numero equivocado en una serie (5 patrones)
   - **Sinonimos** (texto): 60+ pares de palabras de vocabulario avanzado (UVE Sinonimos 3/4)
   - **Antonimos** (texto): 50+ pares de palabras (UVE Antonimos 3)
   - **Analogias verbales** (texto): 30 analogias "A es a B como C es a ?" (UVE Razonamiento Verbal 2)

### Archivos modificados/creados:
- `app/src/services/visualQuestions.js` - 10 nuevos generadores (batch 3: arrow matrix, cube counting, aptitud numerica, letter algebra; batch 4: letter series, number series, wrong number, synonyms, antonyms, analogies)
- `app/src/components/VisualQuestion.jsx` - 2 nuevos renderers registrados (total 27)
- `app/src/components/visuals/ArrowMatrixQuestion.jsx` - NUEVO
- `app/src/components/visuals/CubeCountingQuestion.jsx` - NUEVO

### Estado actual:
- 27 tipos de preguntas visuales + 12 tipos texto
- 4000 preguntas visuales testeadas (100 seeds x 40), 0 errores
- 400 preguntas texto testeadas (50 seeds x 8), 0 errores
- Build OK (366KB JS, 28KB CSS)

---

## Sesion 4 (2026-03-06, continuacion de continuacion)

### Lo que se hizo:
1. **Batch 1 de preguntas UVE** - 4 nuevos tipos visuales basados en imagenes UVE 15 y UVE 32:
   - **Esfera rotacion** (esfera-rotacion): esfera dividida en sectores que rota, predecir siguiente estado
   - **Alfabeto simbolos** (alfabeto-simbolos): letras codificadas como simbolos, superponer para formar palabras
   - **Graficos datos** (graficos-datos): barras + lineas + tarta SVG, preguntas de calculo
   - **Cubo desplegado** (cubo-desplegado): red 2D del cubo, identificar vista 3D correcta
2. **Colores de nota 3 niveles**: <5 rojo, 5-7 amarillo/naranja, 7+ verde
3. **Memory files actualizados**: MEMORY.md + visual-questions.md catalogo completo

### Archivos modificados/creados:
- `app/src/services/visualQuestions.js` - 4 nuevos generadores (sphere, symbol alphabet, chart, cube net)
- `app/src/components/VisualQuestion.jsx` - 4 nuevos renderers registrados
- `app/src/components/visuals/SphereRotationQuestion.jsx` - NUEVO
- `app/src/components/visuals/SymbolAlphabetQuestion.jsx` - NUEVO
- `app/src/components/visuals/ChartQuestion.jsx` - NUEVO
- `app/src/components/visuals/CubeNetQuestion.jsx` - NUEVO
- `app/src/pages/Exam.jsx` - Grade color 3-tier
- `app/src/pages/History.jsx` - Grade color 3-tier
- `app/src/pages/Analysis.jsx` - Grade color 3-tier (avg + bars)

4. **Batch 2 de preguntas UVE** - 4 nuevos tipos visuales + 2 nuevos tipos texto:
   - **Series de relojes** (reloj-serie): relojes con manecillas siguiendo patron temporal (8 patrones: +min, +hora, incrementos crecientes, alternantes, etc.)
   - **Letras sombreadas** (letras-sombreadas): cuadricula de letras con celdas sombreadas, identificar letras bajo sombreado
   - **Sectores radiales** (sectores-radiales): cuadrados divididos por 4 lineas radiales (8 sectores triangulares), series de rellenos (6 patrones: rotacion, llenado progresivo, alternante, espejo, opuestos, pares)
   - **Series pares numeros** (series-pares-numeros): cajas con numero superior/inferior, algunas sombreadas, patron dual (8 patrones: +/-,  fibonacci, cuadrados, acumulativo, etc.)
   - **Letras coincidentes** (texto): contar letras coincidentes entre palabras (con repeticiones), 12 pares de palabras, 5 tipos pregunta (mas/menos letras/consonantes/vocales)
   - **Texto completar / cloze** (texto): rellenar huecos en pasajes con la palabra correcta (6 pasajes temáticos)

### Archivos modificados/creados (batch 2):
- `app/src/services/visualQuestions.js` - 6 nuevos generadores (clock, letter grid, radial, number pairs, letter coincidence, cloze)
- `app/src/components/VisualQuestion.jsx` - 4 nuevos renderers registrados (total 25)
- `app/src/components/visuals/ClockSeriesQuestion.jsx` - NUEVO
- `app/src/components/visuals/LetterGridQuestion.jsx` - NUEVO
- `app/src/components/visuals/RadialSectorQuestion.jsx` - NUEVO
- `app/src/components/visuals/NumberPairSeriesQuestion.jsx` - NUEVO

### Estado actual:
- 25 tipos de preguntas visuales + 5 tipos texto
- 4000 preguntas visuales testeadas (100 seeds x 40), 0 errores
- 400 preguntas texto testeadas (50 seeds x 8), 0 errores
- Build OK (341KB JS, 27KB CSS)

---

## Sesion 3 (2026-03-06, continuacion)

### Lo que se hizo:
1. **Estudio exhaustivo de 17 PDFs UVE** - Analizado paginas de UVE02, UVE05, UVE14, UVE15, UVE17, UVE21, UVE24, UVE25, UVE26, UVE32, UVE33, UVE35, UVE36, UVE39, UVE44
2. **Reescritura completa del sistema de preguntas visuales** basado en formatos UVE reales:
   - **Dominos** (8 patrones): +1/+1, +2/-1, suma constante, +2/+2, espejo, alternancia, +1/+2, -1/+1
   - **Matrices 3x3** (5 patrones): fila=forma/col=relleno, rotacion por columna, cuadrado latino, relleno ciclico, rotacion progresiva
   - **Circulos divididos en sectores** (estilo UVE 35): 4 cuadrantes con rellenos (vacio/solido/rayado/punteado) que rotan
   - **Patrones de cuadricula** (estilo UVE): celdas blanco/negro con patrones (diagonal, borde, simetrica, desplazamiento)
   - **Series de figuras** (6 patrones): ciclo 3, rotacion+relleno alterno, alternancia, lados crecientes, relleno progresivo, shape+rotation
   - **Figura sobrante** (5 variantes): forma, relleno, rotacion, combo, duplicada
   - **Figura identica** (estilo UVE 17 q74-79): encontrar la identica al modelo entre opciones con cambios sutiles
   - **Superposicion/overlay** (estilo UVE 33): dos cuadriculas combinadas (XOR u OR)
   - **Plegado simetrico** (estilo UVE 33): desplegar figura por eje vertical/horizontal
   - **Conteo de figuras** (estilo UVE 25): contar formas especificas entre mezcla
3. **Sistema de rellenos UVE**: empty, solid, hatched (rayas diagonales), dotted (puntos) - SVG patterns
4. **ShapeRenderer con SVG defs** para patterns reutilizables
5. **Auto-avance al seleccionar respuesta** en examen (300ms delay)
6. **Fondos actualizados**: 46 imagenes (26 originales + 20 nuevas de /fondos/)

### Archivos modificados/creados:
- `app/src/services/visualQuestions.js` - Reescrito: 10 generadores basados en UVE
- `app/src/components/VisualQuestion.jsx` - 10 renderers
- `app/src/components/visuals/ShapeRenderer.jsx` - Con SVG pattern defs (hatched, dotted)
- `app/src/components/visuals/DividedCircleQuestion.jsx` - NUEVO (UVE 35)
- `app/src/components/visuals/GridPatternQuestion.jsx` - NUEVO (patrones cuadricula)
- `app/src/components/visuals/FigureMatchQuestion.jsx` - NUEVO (figura identica)
- `app/src/components/visuals/OverlayQuestion.jsx` - NUEVO (superposicion)
- `app/src/components/visuals/FoldingQuestion.jsx` - NUEVO (plegado simetrico)
- Eliminados: RotationQuestion.jsx, SymmetryQuestion.jsx (reemplazados)
- `app/src/hooks/useBackgroundSlideshow.js` - 46 fondos
- `app/src/pages/Exam.jsx` - Auto-avance al seleccionar

### Tipos de pregunta visual UVE identificados pero NO implementados:
- Cubos 3D desplegados (requiere renderizado 3D complejo)
- Descomposicion de siluetas (requiere formas complejas arbitrarias)
- Figuras realistas (pistolas, coches, escudos - requiere assets graficos)

### Estado actual:
- 10 tipos de preguntas visuales basados en examenes UVE reales
- 46 fondos de pantalla rotando con movimiento sutil
- Auto-avance al seleccionar respuesta
- Build compila sin errores

---

## Sesion 2 (2026-03-06, continuacion)

### Lo que se hizo:
1. **Fix loops infinitos en generacion visual** - Los while loops para generar distractores de domino y figuras no tenian safety guards y podian colgar la pagina. Arreglado con limites y fallbacks.
2. **Ampliacion masiva de preguntas visuales** - De 4 a 7 tipos:
   - Fichas de domino (6 patrones: +1/+1, +2/-1, suma constante, fibonacci, +2/+2, espejo)
   - Series de figuras (6 patrones: ciclo 3, rotacion+relleno, alternancia, ciclo 4, relleno alternante, lados crecientes)
   - Figura sobrante (4 variantes: forma diferente, relleno diferente, rotacion diferente, combo)
   - Rotacion de figuras (composiciones aleatorias de 3-5 elementos)
   - **NUEVO: Matrices 3x3** (3 patrones: filas/columnas, rotacion progresiva, diagonales)
   - **NUEVO: Simetria/Espejo** (reflexion vertical u horizontal de composiciones)
   - **NUEVO: Conteo de figuras** (contar cuantas figuras de un tipo hay entre varias)
3. **Mas formas geometricas** - Anadidos: hexagon, cross, arrow, semicircle (total 10 formas)
4. **ShapeRenderer compartido** - Componente reutilizable para todas las formas SVG
5. **Mejor claridad visual** - SVGs mas grandes, strokes mas visibles (0.65 opacidad), bordes mas definidos, letras A/B/C/D mas legibles
6. **Fondo con movimiento sutil** - Animacion `bg-drift` con scale y translate suave (25s ciclo)
7. **Transiciones de fondo mas suaves** - De 2s a 4s ease-in-out, crossfade mejorado

### Archivos modificados/creados:
- `app/src/services/visualQuestions.js` - Reescrito completo: 7 generadores, safety guards, mas patrones
- `app/src/components/VisualQuestion.jsx` - Anadidos 3 nuevos renderers
- `app/src/components/visuals/ShapeRenderer.jsx` - NUEVO: renderizador compartido de formas (10 tipos)
- `app/src/components/visuals/MatrixQuestion.jsx` - NUEVO
- `app/src/components/visuals/SymmetryQuestion.jsx` - NUEVO
- `app/src/components/visuals/CountingQuestion.jsx` - NUEVO
- `app/src/components/visuals/DominoQuestion.jsx` - Mejorado: mas grande, mejor contraste
- `app/src/components/visuals/ShapeSeriesQuestion.jsx` - Usa ShapeRenderer
- `app/src/components/visuals/OddShapeQuestion.jsx` - Usa ShapeRenderer
- `app/src/components/visuals/RotationQuestion.jsx` - Mejorado: contraste
- `app/src/components/BackgroundSlideshow.jsx` - Crossfade mejorado
- `app/src/index.css` - Animacion bg-drift, transicion 4s

### Estado actual:
- App funcional, compilando sin errores
- 7 tipos de preguntas visuales con multiples patrones cada uno
- Fondo animado con movimiento sutil y transiciones suaves
- Dev server corriendo en localhost:5173

### Pendiente:
- Testing visual en navegador de todos los nuevos tipos de pregunta
- Posibles ajustes de UI segun feedback del usuario
- Modulo "Personalidad" (coming soon)

---

## Sesion 1 (2026-03-06)

### Lo que se hizo:
1. **MVP completo creado desde cero** - React + Vite + Tailwind v4
2. **Home page** - Slideshow 26 imagenes, titulo "PROYECTO" + "barraco", tarjetas glass
3. **Modulo Psicotecnico** - Menu: Iniciar Examen, Examen de Errores, Historial, Analisis
4. **Examen funcional** - 40 preguntas, timer 20min, scoring +1/-0.33/0
5. **10,000 preguntas de texto** en JSON (8 categorias)
6. **Historial + Analisis** - Intentos expandibles, grafico evolucion, desglose categorias
7. **Preguntas visuales basicas** - 4 tipos iniciales
8. **Integracion visual en Exam.jsx** - ~20% visual, ~80% texto

### Notas importantes:
- El usuario pidio BORRAR y OLVIDAR el script bash/Python de generar preguntas
- Estetica: dark, minimalista. Colores: bone (#f5f0e8), accent gold (#c9a84c)
- Tailwind v4, CSS custom properties, localStorage para persistencia

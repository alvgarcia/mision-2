# Real Madrid Baloncesto · Euroliga

Misión 2 · Aplicación web para consultar la temporada del Real Madrid en la Euroliga.

## Cómo probarlo

Necesitas Node.js y npm. Desde la carpeta del proyecto, ejecuta:

```bash
npm install
npm run dev
```

Abre en el navegador la dirección local que muestra Vite. La aplicación carga desde la API de EuroLeague la clasificación y el calendario de la temporada; `vite.config.js` configura un proxy de desarrollo para que el navegador pueda acceder a esos datos pese a las restricciones CORS del calendario.

Para comprobar la compilación de producción:

```bash
npm run build
```

## Uso de IA

Usé Copilot en VS Code como asistente durante el diseño y la implementación. Dos prompts reales de la conversación fueron:

- «La idea es crear una aplicación web centrada exclusivamente en el **Real Madrid de baloncesto en la Euroliga**, utilizando **Vite y JavaScript moderno**. La aplicación consumiría una API pública mediante peticiones `fetch` asíncronas y mostraría la información en pantalla de forma organizada y fácil de consultar.

Al entrar en la aplicación, el usuario vería un panel principal con la situación actual del equipo: su posición en la clasificación de la Euroliga, el número de victorias y derrotas, el resultado de su último partido y cuál será su próximo encuentro. Esto permite obtener una visión rápida del estado de la temporada.

La aplicación tendría una sección dedicada a la **clasificación** completa de la competición. Los equipos se ordenarían según sus resultados y la fila correspondiente al Real Madrid aparecería destacada visualmente para que sea fácil localizarla.

Otra sección mostraría todos los **partidos del Real Madrid**. A partir del listado completo de encuentros proporcionado por la API, la aplicación filtraría únicamente aquellos en los que participa el equipo.
- Partidos ya disputados.

Los partidos futuros permitirían consultar fecha, rival y lugar del encuentro.

La estructura interna del proyecto estaría dividida en módulos para cumplir el apartado de organización del código. Un módulo se encargaría únicamente de realizar las peticiones a la API, otro de transformar los datos y otro de mostrar la información en pantalla. De esta manera cada archivo tendría una responsabilidad concreta y el código sería más fácil de mantener.

Respecto a la asincronía, todas las peticiones se realizarían mediante `async/await`. Mientras se cargan los datos aparecería un mensaje de carga visible para el usuario. Si ocurre un error de red o la API no responde correctamente, se mostraría un mensaje informativo en lugar de que la aplicación falle.»

Verifiqué la integración ejecutando `npm run build`, comprobando en el navegador que se mostraban los 20 equipos de la clasificación, los partidos disputados del Madrid y los escudos. No hay una suite de pruebas automatizada configurada en el proyecto.

Definí el alcance y las decisiones de presentación: destacar al Madrid en la clasificación, mostrar el marcador en orden local–visitante y decidir dónde aparecen los escudos. También revisé los resultados y fui ajustando la implementación según lo que necesitaba la aplicación.

## Autopsia

1. **Uso de un proxy de Vite para consultar la API durante el desarrollo.** El endpoint del calendario no permite la petición directa desde el navegador por CORS, así que el servicio consulta una ruta local que Vite reenvía a EuroLeague. La alternativa descartada fue hacer `fetch` directamente desde el navegador: el navegador bloquea esa respuesta. Este proxy es para desarrollo local; no se plantea desplegar la aplicación.
2. **Separación entre peticiones, transformación y presentación, con validación explícita de las respuestas.** Las llamadas están en `src/servicio-euroliga.js`, la normalización en `src/transformar-datos.js` y el renderizado en `src/main.js`. La alternativa descartada fue concentrar fetch, conversión y manipulación del DOM en un único módulo o sustituir los fallos por datos de ejemplo, porque dificultaría localizar errores y podría mostrar información que no procede de la API.

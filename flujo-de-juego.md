# Hues and Cues - Flujo de Juego Simplificado

Este documento describe el flujo de juego simplificado para la implementación web de Hues and Cues.

## Resumen del Flujo

1. **Configuración de Jugadores**
2. **Ronda de Juego**
   - Presentación de pista (palabra aleatoria)
   - Adivinanzas de los jugadores
   - Puntuación basada en la coordenada media
3. **Nueva ronda con una nueva palabra**

## Detalles del Flujo

### 1. Fase de Configuración

- Los jugadores ingresan sus nombres manualmente
- No se utilizan nombres predefinidos o sugerencias
- Se requiere un mínimo de 1 jugadores para comenzar
- Cada jugador recibe un color de identificación aleatorio
- Cuando todos los jugadores están listos, se inicia el juego

### 2. Palabra Aleatoria

- El sistema selecciona automáticamente una palabra aleatoria del archivo CSV
- Esta palabra se muestra a todos los jugadores
- No hay selección manual de colores objetivo
- No hay jugador activo que dé pistas

### 3. Fase de Adivinanza

- Todos los jugadores seleccionan las coordenadas del color que creen que corresponde a la palabra
- Se introduce la selección mediante coordenadas (letra A-O para fila, número 1-30 para columna)
- El sistema registra y almacena:
  * Nombre del jugador
  * Palabra actual (pista)
  * Coordenadas seleccionadas
- Se debe esperar a que todos los jugadores realicen su selección
- Una vez que todos han seleccionado, se muestran todas las selecciones en el lateral

### 4. Fase de Puntuación

- El sistema calcula la coordenada media de todas las selecciones
- Se asignan puntos según la distancia de cada selección respecto a la media:
  * 3 puntos: selección exacta o muy cercana a la media
  * 2 puntos: cercana a la media
  * 1 punto: algo alejada
  * 0 puntos: muy alejada
- Se muestra una tabla con los resultados:
  * Palabra
  * Selección de cada jugador
  * Puntos obtenidos
  * Coordenada media calculada

### 5. Nueva Ronda

- No hay rotación de turnos entre jugadores
- Se inicia una nueva ronda con otra palabra aleatoria del CSV
- Se mantienen los mismos jugadores y sus puntuaciones acumuladas
- El juego puede continuar durante un número predefinido de rondas o hasta alcanzar una puntuación objetivo

## Características Específicas

- **Tablero**: Muestra la imagen directa de la cuadrícula de colores (tablero.webp)
- **Selección**: Se realiza mediante coordenadas texto (ej. C15)
- **Registro**: Todas las selecciones se almacenan y visualizan con la relación palabra-jugador-coordenada
- **Puntuación**: Se calcula basándose en la coordenada promedio, no en un color objetivo preseleccionado

## Finalización del Juego

- El juego termina después de un número determinado de rondas (configurable)
- Se muestra una clasificación final con los puntos totales acumulados por cada jugador
- Se ofrece la opción de iniciar una nueva partida 
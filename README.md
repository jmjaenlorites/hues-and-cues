# Hues and Cues - Aplicación Web

Una implementación web del juego de mesa Hues and Cues, donde los jugadores intentan adivinar colores basándose en pistas.

## Características

- Tablero interactivo con la cuadrícula de colores (30×15)
- Sistema de jugadores con nombres temporales
- Mecánica completa del juego:
  - Selección de color
  - Dar pistas (una palabra, luego dos palabras)
  - Adivinar colores
  - Cálculo de puntuaciones
- Biblioteca de palabras para pistas
- Diseño responsivo para dispositivos móviles

## Requisitos

- Node.js (versión 16 o superior)
- npm o yarn

## Instalación

1. Clona este repositorio
2. Instala las dependencias:

```bash
cd hues-and-cues
npm install
```

## Ejecución

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## Despliegue en producción

Para desplegar la aplicación en un entorno de producción:

1. Construye la versión optimizada:

```bash
npm run build
```

Esto generará una carpeta `dist` con los archivos estáticos optimizados.

2. Para previsualizar localmente la versión de producción:

```bash
npm run preview
```

3. Opciones de despliegue:

- **Servidor web estático**: Copia los archivos de la carpeta `dist` a cualquier servidor web (Apache, Nginx, etc.)
- **Netlify**: Conecta tu repositorio o sube la carpeta `dist` directamente
- **Vercel**: Conecta tu repositorio para despliegue automático
- **GitHub Pages**: Configura la opción `base` en `vite.config.ts` según el nombre de tu repositorio

## Cómo jugar

1. Configuración:
   - Añade entre 3 y 10 jugadores con sus nombres
   - Haz clic en "Comenzar juego"

2. Selección de color:
   - El jugador activo selecciona un color en el tablero
   - También puede elegir un color aleatorio

3. Primera pista:
   - El jugador activo da una pista de UNA PALABRA que describa el color

4. Adivinanza (1ª ronda):
   - Los demás jugadores hacen clic en el tablero donde creen que está el color
   - Todos deben hacer su selección para continuar

5. Segunda pista:
   - El jugador activo da una pista de DOS PALABRAS

6. Adivinanza final:
   - Los jugadores hacen su selección final

7. Puntuación:
   - Se muestran los resultados y puntuaciones
   - El juego continúa con el siguiente jugador

## Puntuación

- Adivinanza exacta: 3 puntos
- Adyacente (1 casilla de distancia): 2 puntos
- Cerca (2 casillas de distancia): 1 punto
- Más lejos: 0 puntos

## Desarrollado con

- React con TypeScript
- Tailwind CSS para el diseño
- chroma.js para la manipulación de colores
- Vite como bundler

## Futuras mejoras

- Modo online para jugar remotamente
- Sistema de autenticación de usuarios
- Historial de partidas
- Soporte para varios idiomas
- Modos de juego adicionales

## Licencia

MIT
#!/bin/bash

# Mostrar lo que estamos haciendo
set -x

# Reconstruir Tailwind CSS
echo "Reconstruyendo CSS de Tailwind..."
./rebuild-tailwind.sh

# Compilar la aplicación
echo "Compilando la aplicación..."
npm run build

# Asegurarse de que el tablero.webp está en dist
echo "Verificando si el tablero.webp está en dist..."
if [ -f "public/tablero.webp" ] && [ ! -f "dist/tablero.webp" ]; then
    echo "Copiando tablero.webp a dist..."
    cp public/tablero.webp dist/
fi

# Asegurarse de que se copie también clue-words.csv
echo "Verificando si clue-words.csv está en dist/data/..."
mkdir -p dist/data
if [ -f "public/data/clue-words.csv" ] && [ ! -f "dist/data/clue-words.csv" ]; then
    echo "Copiando clue-words.csv a dist/data/..."
    cp public/data/clue-words.csv dist/data/
fi

# Desplegar a Firebase
echo "Desplegando a Firebase..."
firebase deploy --only hosting

echo "¡Despliegue completado!"
echo "Tu aplicación está disponible en: https://huesandcues-6b0f1.web.app" 
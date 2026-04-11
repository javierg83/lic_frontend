# Proyecto: lic_frontend

## 1. Tipo
Angular (Versión 21)

## 2. Cómo se sirve
* **Desarrollo**: localmente standalone ejecutando `ng serve` (usualmente inicializado vía `npm start`).
* **Producción**: Incluye un script `server.js` con `express` que permite montarse en un backend ligero standalone para servir el build (por ejemplo, en Heroku). 

## 3. Build necesario?
SÍ. El entorno de producción requiere compilación con `npm run build` o `ng build`. Esto exporta HTML, CSS y JS optimizado a la carpeta local `/dist`. (En Heroku usa `heroku-postbuild`).

## 4. Dependencias principales
* `@angular/core`, `@angular/common`, `@angular/router`, etc. (Core Angular)
* `chart.js` (Visualización de datos)
* `express` (para modo servidor standalone del directorio dist)
* `rxjs` (Manejo reactivo)

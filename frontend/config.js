// config.js
let BACKEND_URL;

// Preguntamos al navegador: "¿En qué dominio estoy?"
const hostname = window.location.hostname;

if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // ESTOY EN CASA (Desarrollo local)
    console.log('Modo Desarrollo: Usando Localhost');
    BACKEND_URL = 'http://localhost:1337';
} else {
    // ESTOY EN INTERNET (Producción)
    console.log('Modo Producción: Usando Volcanica');
    BACKEND_URL = 'https://volcanica.duckdns.org';
}

// Hacemos BACKEND_URL globalmente accesible para módulos si es necesario, 
// aunque al declararla con let en el scope global ya debería serlo.
window.BACKEND_URL = BACKEND_URL;

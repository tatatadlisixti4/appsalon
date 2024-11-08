const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);
const $$$ = (element, event, handler) => element.addEventListener(event, handler);

$$$(document, 'DOMContentLoaded', function() {
    iniciarApp();
});

function iniciarApp() {
    buscarPorFecha();
}

function buscarPorFecha() {
    const fechaInput = $('#fecha');
    $$$(fechaInput, 'input', (e) => {
        const fechaSeleccionada = e.target.value;
        window.location = `?fecha=${fechaSeleccionada}`; // ruta actual + querystring
        
    })
}
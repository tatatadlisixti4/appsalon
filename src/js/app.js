const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);
const $$$ = (element, event, handler) => element.addEventListener(event, handler);

let paso = 1;
let pasoInicial = 1;
let pasoFinal = 3;

const cita = {
    id : '',
    nombre: '',
    fecha: '',
    hora: '',
    servicios: []
}

document.addEventListener('DOMContentLoaded', function() {
    iniciarApp();
});

function iniciarApp() {
    mostrarSeccion();
    tabs();
    botonesPaginador();
    paginaAnterior();
    paginaSiguiente();
    consultarAPI(); // Consulta la API en el backend de PHP

    idCliente(); // Seleccionar id del cliente para la cita
    nombreCliente(); // Seleccionar nombre para la cita
    seleccionarFecha(); // Seleccionar fecha para la cita
    seleccionarHora(); // Seleccionar hora para la cita
    mostrarResumen(); // Muestra el resumen de la cita

}

function mostrarSeccion() {
    // Ocultar la seccion que tenga la clase mostrar
    $('.mostrar')?.classList.remove('mostrar'); 

    /*
    const seccionAnterior = $('.mostrar');
    if (seccionAnterior) { seccionAnterior.classList.remove('mostrar'); }  
    */
    
    // Seleccionar la seccion con el paso
    const pasoSelector = `#paso-${paso}`;
    const seccion = $(pasoSelector);
    seccion.classList.add('mostrar'); 

    // Ocultar tab anterior resaltado
    $('.actual')?.classList.remove('actual');

    /*
    const tabAnterior = $('.actual');
    if(tabAnterior) { tabAnterior.classList.remove('actual'); } 
    */

    // Resalta el tab actual 
    const tab = $(`[data-paso="${paso}"]`)
    tab.classList.add('actual');

}

function tabs() {
    const botones = $$('.tabs button');
    botones.forEach(boton => {
        boton.addEventListener('click', e => {
            paso = parseInt(e.target.dataset.paso);
            mostrarSeccion();
            botonesPaginador();
        })
    })
}

function botonesPaginador() {
    const paginaAnterior = $('#anterior');
    const paginaSiguiente = $('#siguiente');

    if (paso === 1) {
        paginaAnterior.classList.add('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    } else if (paso === 3) {
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.add('ocultar');
        mostrarResumen();
    } else {
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    }
    
}

function paginaAnterior() {
    const paginaAnterior = $('#anterior');
    $$$(paginaAnterior, 'click', () => {
        if (paso <= pasoInicial) return;
        paso--;
        
        botonesPaginador();
        mostrarSeccion();
    });
}

function paginaSiguiente() {
    const paginaSiguiente = $('#siguiente');
    $$$(paginaSiguiente, 'click', () => {
        if(paso >= pasoFinal) return;
        paso++;
        botonesPaginador();
        mostrarSeccion();
    });
}

async function consultarAPI() {
    try {
        const url = `${location.origin}/api/servicios`;
        console.log(url);
        const resultado = await fetch(url);
        const servicios = await resultado.json();
        mostrarServicios(servicios);
    } catch (error) {
        console.log('Hola');
        console.log(error);
        console.log('Hola');
    }
}

function mostrarServicios(servicios) {
    servicios.forEach(servicio => {
        const {id, nombre, precio} = servicio;
        const nombreServicio = document.createElement('P');
        nombreServicio.classList.add('nombre-servicio');
        nombreServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.classList.add('precio-servicio');
        precioServicio.textContent = `$${precio}`;
        
        
        const servicioDiv = document.createElement('DIV');
        servicioDiv.classList.add('servicio');
        servicioDiv.dataset.idServicio = id;

        servicioDiv.onclick = function() {
            seleccionarServicio(servicio);
        }

        servicioDiv.appendChild(nombreServicio);
        servicioDiv.appendChild(precioServicio);
        
        $('#servicios').appendChild(servicioDiv);
    });
}

function seleccionarServicio(servicio) {
    const {id} = servicio;
    const {servicios} = cita;

    // Identificar el elemento al que se le da click
    const divServicio = $(`[data-id-servicio="${id}"]`);
    if( servicios.some(agregado => agregado.id === id) ) {
        // Eliminar
        cita.servicios = servicios.filter(agregado => agregado.id !== id );
        divServicio.classList.remove('seleccionado');
    } else {
        cita.servicios = [...servicios, servicio];
        divServicio.classList.add('seleccionado');
    }
}

function idCliente() {
    cita.id = $('#id').value;
}

function nombreCliente() {
    cita.nombre = $('#nombre').value;
}

function seleccionarFecha() {
    const inputFecha = $('#fecha');
    $$$(inputFecha, 'input',  e => {
        const dia = new Date(e.target.value).getUTCDay();
        if([6, 0].includes(dia)) {
            e.target.value = '';
            mostrarAlerta('Sabados y Domingos no abrimos', 'error', '.formulario');
        } else {
            cita.fecha = e.target.value;
        }
    });
}

function seleccionarHora() {
    const inputHora = $('#hora');
    $$$(inputHora, 'input', e=>{
        const [hora, minutos] = e.target.value.split(':');
        if (hora < 10 || hora >= 22) {
            mostrarAlerta('Hora No Válida', 'error', '.formulario');
            e.target.value = '';
        } else {
            cita.hora = e.target.value;
        }
    });
}

function mostrarAlerta(mensaje, tipo, elemento, desaparece = true) {
    // Previene que se creen mas alertas borrando las existentes
    $('.alerta')?.remove();

    // Creacion alertas
    const alerta = document.createElement('DIV');
    alerta.textContent=mensaje;
    alerta.classList.add('alerta')
    alerta.classList.add(tipo);
    const formulario = $(elemento);
    formulario.appendChild(alerta);

    // Eliminacion de alertas despues de 3 segundos
    if (desaparece) {
        setTimeout (() => {
            alerta.remove()
        }, 3000);
    }
}

function mostrarResumen() {
    const resumen = $('.contenido-resumen');

    // Limpiar el contenido de Resumen
    // resumen.innerHTML = ''; metodo con performance pobre
    while(resumen.firstChild) {
        resumen.removeChild(resumen.firstChild)
    }

    if(Object.values(cita).includes('') || cita.servicios.length === 0) {
        mostrarAlerta('Hacen Falta Datos', 'error', '.contenido-resumen', false);
        return;
    }
    
    // Formatear el div de resumen
    
    // Heading para servicios en resumen
    const headingServicios = document.createElement('H3');
    headingServicios.textContent = 'Resumen de Servicios';
    resumen.appendChild(headingServicios);

    // Iterando servicios
    const {nombre, fecha, hora, servicios} = cita;
    servicios.forEach(servicio => {
        const {id, precio, nombre} = servicio;
        const contenedorServicio = document.createElement('DIV');
        contenedorServicio.classList.add('contenedor-servicio');

        const textoServicio = document.createElement('P');
        textoServicio.textContent = nombre;
        
        const precioServicio = document.createElement('P');
        precioServicio.innerHTML = `<span>Precio:</span> $${precio}`;

        contenedorServicio.appendChild(textoServicio);
        contenedorServicio.appendChild(precioServicio);

        resumen.appendChild(contenedorServicio); 
    });

    // Heading para servicios en resumen
    const headingCita = document.createElement('H3');
    headingCita.textContent = 'Resumen de Cita';
    resumen.appendChild(headingCita);

    // Mostrando datos del cliente
    const nombreCliente = document.createElement('P');
    nombreCliente.innerHTML = `<span>Nombre:</span> ${nombre}`;

    // Formatear la fecha en español (meses y dias inician desde el 0)
    // La fecha del value del input tipo time es un string, se pasa a utc para usar toLocalDateString.
    const fechaObj = new Date(fecha)

    const mes = fechaObj.getMonth();
    const dia = fechaObj.getDate() + 2; // Retorna el dia en funcion al mes (0 al 11), y no a la semana (0 al 6)
    const year = fechaObj.getFullYear(); 

    const fechaUTC = new Date(Date.UTC(year, mes, dia)); // Formato timestamp/tiempounix, mas general
    
    const fechaFormateada = fechaUTC.toLocaleDateString('es-419', {
        weekday: 'long', // Dia de la semana en palabras
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' // Dia del mes en numero
    });

    // Uso fecha formateada, manteniendo inmutabilidad de la fecha original en el arreglo de la cita
    const fechaCita = document.createElement('P');
    fechaCita.innerHTML = `<span>Fecha:</span> ${fechaFormateada}`;

    const horaCita = document.createElement('P');
    horaCita.innerHTML = `<span>Hora:</span> ${hora} Hrs`;

    // Boton para crear una cita
    const botonReservar = document.createElement('BUTTON');
    botonReservar.classList.add('boton');
    botonReservar.textContent = 'Reservar Cita';
    botonReservar.onclick = reservarCita; // No usa parentesis pq se desea actue como un callback, no que se ejecute instantaneamente.

    resumen.appendChild(nombreCliente);
    resumen.appendChild(fechaCita);
    resumen.appendChild(horaCita);

    resumen.appendChild(botonReservar);
}

function reservarCita() {
    /* FormData es una clase de JavaScript que proporciona una manera fácil de construir un conjunto de datos clave/valor que pueden ser enviados utilizando peticiones HTTP, como POST, por ejemplo. Reemplazo al input de tipo submit*/
    const datos = new FormData();
    datos.append('nombre');
    console.log([...datos]); // Se formatea lo de datos para poder ser visible en un array, si se imprime solo, no se ve el contenido.
};

async function reservarCita() {
    const {id, nombre, fecha, hora, servicios} = cita;
    const idServicios = servicios.map(servicio => servicio.id);
    
    const datos = new FormData();
    datos.append('usuarioId', id);
    datos.append('fecha', fecha);
    datos.append('hora', hora);
    datos.append('servicios', idServicios);
    // console.log([...datos]);
    

    // Petición hacia la api
    try {
        const url = `${location.origin}/api/citas`;
        const respuesta = await fetch(url, {
            method:'POST', 
            body: datos
        });
        const resultado = await respuesta.json();
        if(resultado.resultado) {
            Swal.fire({ // Como sweetalert2 es un obj de tipo promesa, podemos usar .then()
                icon: 'success',
                title: 'Cita Creada',
                text: 'Tu cita fue creada correctamente',
                button: 'OK'
            }).then(() => {
                setTimeout(() =>{
                    window.location.reload();
                }, 1000);
            });
        }
    } catch {
        Swal.fire({
            title: 'Error!',
            text: 'Hubo un error al guardar la cita',
            icon: 'error'
        });
    }
}
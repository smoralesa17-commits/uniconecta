/*
 * UniConecta - Red Social Universitaria
 * Proyecto final de Programación II
 * Archivo: main.js
 *
 * Los datos se guardan en localStorage.
 * Es una demostración académica, no una base de datos real.
 */

// ==========================================
// 1. CONFIGURACIÓN INICIAL
// ==========================================

const CLAVE_DATOS = 'uniconecta_datos_v1';
const CLAVE_SESION = 'uniconecta_sesion_v1';

// Datos iniciales de la red social
function datosIniciales() {
    return {
        usuarios: [
            {
                usuario: 'admin',
                clave: '2026',
                nombre: 'Administrador',
                correo: 'admin@uniconecta.demo',
                carrera: 'Ingeniería en Sistemas',
                bio: 'Bienvenidos a la comunidad académica.'
            },
            {
                usuario: 'ana',
                clave: 'demo123',
                nombre: 'Ana López',
                correo: 'ana@uniconecta.demo',
                carrera: 'Ingeniería en Sistemas',
                bio: 'Compartiendo conocimientos.'
            }
        ],

        publicaciones: [
            {
                id: 'demo1',
                autor: 'ana',
                tipo: 'Duda',
                grupo: 'Ingeniería en Sistemas',
                texto: '¿Alguien tiene consejos para estudiar JavaScript antes del examen?',
                fecha: new Date('2026-10-20T12:00:00').toISOString(),
                likes: [],
                comentarios: []
            },
            {
                id: 'demo2',
                autor: 'admin',
                tipo: 'Información',
                grupo: 'General',
                texto: '¡Bienvenidos a UniConecta! Comparte tus preguntas, recursos y experiencias de la universidad.',
                fecha: new Date('2026-10-19T09:00:00').toISOString(),
                likes: [],
                comentarios: []
            }
        ],

        historial: []
    };
}

// ==========================================
// 2. ALMACENAMIENTO DE DATOS
// ==========================================

// Cargar los datos guardados
function cargarDatos() {
    try {
        let txt = localStorage.getItem(CLAVE_DATOS);

        if (txt) {
            const d = JSON.parse(txt);

            if (
                Array.isArray(d.usuarios) &&
                Array.isArray(d.publicaciones) &&
                Array.isArray(d.historial)
            ) {
                return d;
            }
        }
    } catch (e) {
        console.error(e);
    }

    let d = datosIniciales();
    guardarDatos(d);

    return d;
}

// Guardar información
function guardarDatos(d) {
    localStorage.setItem(
        CLAVE_DATOS,
        JSON.stringify(d)
    );
}

// Obtener la sesión actual
function sesion() {
    return sessionStorage.getItem(CLAVE_SESION);
}

// Iniciar sesión
function iniciarSesion(usuario) {
    sessionStorage.setItem(
        CLAVE_SESION,
        usuario
    );

    location.href = 'muro.html';
}

// Buscar al usuario actual
function usuarioActual(d) {
    return d.usuarios.find(
        u => u.usuario === sesion()
    );
}

// Registrar las actividades del usuario
function registrarActividad(d, usuario, accion, detalle) {
    d.historial.push({
        id: crearId(),
        usuario: usuario,
        accion: accion,
        detalle: detalle,
        fecha: new Date().toISOString()
    });
}

// Crear identificadores para publicaciones
function crearId() {
    return Date.now().toString(36) + '_' +
        Math.random().toString(36).slice(2, 9);
}

// ==========================================
// 3. FUNCIONES GENERALES
// ==========================================

// Crear elementos HTML
function nodo(tag, clase, texto) {
    const n = document.createElement(tag);

    if (clase) {
        n.className = clase;
    }

    if (texto !== undefined) {
        n.textContent = texto;
    }

    return n;
}

// Mostrar fecha y hora
function fecha(valor) {
    return new Date(valor).toLocaleString('es-GT', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
}

// Mostrar mensajes
function mensaje(id, txt) {
    const el = document.getElementById(id);

    if (el) {
        el.textContent = txt;
    }
}

// Proteger las páginas privadas
function proteger() {
    if (!sesion()) {
        location.replace('index.html');
        return false;
    }

    return true;
}

// Cerrar sesión
function configurarSalir() {
    document.getElementById('cerrarSesion')?.addEventListener(
        'click',
        () => {
            sessionStorage.removeItem(CLAVE_SESION);
            location.href = 'index.html';
        }
    );
}

// ==========================================
// 4. INICIO DE SESIÓN Y REGISTRO
// ==========================================

function inicio() {

    // Si ya inició sesión, abrir el muro
    if (sesion()) {
        location.replace('muro.html');
        return;
    }

    const login = document.getElementById('loginForm');
    const registro = document.getElementById('registroForm');
    const tabLogin = document.getElementById('tabLogin');
    const tabRegistro = document.getElementById('tabRegistro');

    // Cambiar entre ingreso y registro
    function cambiar(crear) {
        login.classList.toggle('hidden', crear);
        registro.classList.toggle('hidden', !crear);

        tabLogin.classList.toggle('active', !crear);
        tabRegistro.classList.toggle('active', crear);

        mensaje('authMensaje', '');
    }

    tabLogin.addEventListener('click', () => cambiar(false));
    tabRegistro.addEventListener('click', () => cambiar(true));

    // Validar inicio de sesión
    login.addEventListener('submit', e => {
        e.preventDefault();

        const d = cargarDatos();

        const u = document.getElementById('loginUsuario')
            .value.trim();

        const c = document.getElementById('loginClave').value;

        const encontrado = d.usuarios.find(
            x =>
                x.usuario.toLowerCase() === u.toLowerCase() &&
                x.clave === c
        );

        if (!encontrado) {
            mensaje(
                'authMensaje',
                'Usuario o contraseña incorrectos.'
            );
            return;
        }

        iniciarSesion(encontrado.usuario);
    });

    // Registrar nuevos estudiantes
    registro.addEventListener('submit', e => {
        e.preventDefault();

        const d = cargarDatos();

        const u = document.getElementById('regUsuario')
            .value.trim();

        // Validar que el usuario no exista
        if (d.usuarios.some(
            x => x.usuario.toLowerCase() === u.toLowerCase()
        )) {
            mensaje(
                'authMensaje',
                'Ese nombre de usuario ya existe.'
            );
            return;
        }

        const correo = document.getElementById('regCorreo')
            .value.trim();

        // Validar correo repetido
        if (d.usuarios.some(
            x => x.correo.toLowerCase() === correo.toLowerCase()
        )) {
            mensaje(
                'authMensaje',
                'Ese correo electrónico ya está registrado.'
            );
            return;
        }

        // Obtener datos del formulario
        const nuevo = {
            usuario: u,
            clave: document.getElementById('regClave').value,
            nombre: document.getElementById('regNombre')
                .value.trim(),
            correo: correo,
            carrera: document.getElementById('regCarrera').value,
            bio: document.getElementById('regBio')
                .value.trim()
        };

        // Guardar el usuario
        d.usuarios.push(nuevo);

        registrarActividad(
            d,
            u,
            'Registro',
            'Cuenta creada y perfil registrado.'
        );

        guardarDatos(d);

        // Mostrar los datos registrados
        alert(
            'Registro exitoso. Estos son tus datos:\n' +
            'Nombre: ' + nuevo.nombre + '\n' +
            'Usuario: ' + nuevo.usuario + '\n' +
            'Correo: ' + nuevo.correo + '\n' +
            'Carrera: ' + nuevo.carrera + '\n' +
            'Descripción: ' + nuevo.bio + '\n\n' +
            'Presiona Aceptar para acceder.'
        );

        iniciarSesion(u);
    });
}

// ==========================================
// 5. PERFIL DEL ESTUDIANTE
// ==========================================

function mostrarPerfil(d) {
    const u = usuarioActual(d);

    if (!u) {
        return;
    }

    document.getElementById('avatar').textContent =
        u.nombre.charAt(0).toUpperCase();

    document.getElementById('perfilNombre').textContent =
        u.nombre;

    document.getElementById('perfilUsuario').textContent =
        '@' + u.usuario;

    document.getElementById('perfilBio').textContent =
        u.bio;

    document.getElementById('perfilCarrera').textContent =
        u.carrera;
}

// ==========================================
// 6. MURO DE PUBLICACIONES
// ==========================================

function muro() {

    if (!proteger()) {
        return;
    }

    configurarSalir();

    let d = cargarDatos();

    // Comprobar que el usuario exista
    if (!usuarioActual(d)) {
        sessionStorage.removeItem(CLAVE_SESION);
        location.replace('index.html');
        return;
    }

    mostrarPerfil(d);

    const filtro = document.getElementById('filtroGrupo');
    const lista = document.getElementById('listaPublicaciones');

    // Mostrar las publicaciones
    function pintar() {

        d = cargarDatos();

        lista.replaceChildren();

        const posts = d.publicaciones
            .filter(
                p =>
                    filtro.value === 'Todos' ||
                    p.grupo === filtro.value
            )
            .slice()
            .sort(
                (a, b) =>
                    new Date(b.fecha) - new Date(a.fecha)
            );

        // Cuando no hay publicaciones
        if (!posts.length) {
            lista.append(
                nodo(
                    'div',
                    'panel empty',
                    'No hay publicaciones en esta comunidad todavía.'
                )
            );
            return;
        }

        // Recorrer todas las publicaciones
        posts.forEach(p => {

            const autor = d.usuarios.find(
                u => u.usuario === p.autor
            );

            const esMio = p.autor === sesion();

            // Crear tarjeta de publicación
            const tarjeta = nodo('article', 'panel post');
            const cabeza = nodo('div', 'posttop');
            const info = nodo('div');

            info.append(
                nodo(
                    'h3',
                    '',
                    autor ? autor.nombre : 'Estudiante'
                )
            );

            info.append(
                nodo(
                    'p',
                    'meta',
                    '@' + p.autor +
                    ' · ' + p.tipo +
                    ' · ' + p.grupo +
                    ' · ' + fecha(p.fecha)
                )
            );

            cabeza.append(info);

            tarjeta.append(
                cabeza,
                nodo('p', 'postcontent', p.texto)
            );

            // ==================================
            // BOTÓN ME GUSTA
            // ==================================

            const acciones = nodo('div', 'postactions');

            const like = nodo(
                'button',
                'action' +
                    (p.likes.includes(sesion()) ? ' liked' : ''),
                '♥ ' + p.likes.length + ' Me gusta'
            );

            like.type = 'button';

            like.addEventListener('click', () => {

                d = cargarDatos();

                const real = d.publicaciones.find(
                    x => x.id === p.id
                );

                if (!real) {
                    return;
                }

                const i = real.likes.indexOf(sesion());

                if (i >= 0) {

                    real.likes.splice(i, 1);

                    registrarActividad(
                        d,
                        sesion(),
                        'Quitar me gusta',
                        'Retiraste tu reacción de una publicación de @' +
                        p.autor
                    );

                } else {

                    real.likes.push(sesion());

                    registrarActividad(
                        d,
                        sesion(),
                        'Me gusta',
                        'Reaccionaste a una publicación de @' +
                        p.autor
                    );
                }

                guardarDatos(d);
                pintar();
            });

            acciones.append(like);

            // ==================================
            // ELIMINAR PUBLICACIONES PROPIAS
            // ==================================

            if (esMio) {

                const borrar = nodo(
                    'button',
                    'action danger',
                    'Eliminar mi publicación'
                );

                borrar.type = 'button';

                borrar.addEventListener('click', () => {

                    if (!confirm(
                        '¿Quieres eliminar esta publicación?'
                    )) {
                        return;
                    }

                    d = cargarDatos();

                    d.publicaciones = d.publicaciones.filter(
                        x => x.id !== p.id
                    );

                    registrarActividad(
                        d,
                        sesion(),
                        'Eliminar publicación',
                        'Eliminaste: ' + p.texto.slice(0, 80)
                    );

                    guardarDatos(d);
                    pintar();
                });

                acciones.append(borrar);
            }

            tarjeta.append(acciones);

            // ==================================
            // MOSTRAR COMENTARIOS
            // ==================================

            const comentarios = nodo('div', 'comments');

            p.comentarios.forEach(c => {

                const item = nodo('div', 'comment');

                const nombre = nodo(
                    'strong',
                    '',
                    '@' + c.autor + ': '
                );

                item.append(
                    nombre,
                    document.createTextNode(c.texto)
                );

                comentarios.append(item);
            });

            // ==================================
            // FORMULARIO DE COMENTARIOS
            // ==================================

            const form = nodo('form', 'commentform');

            const input = nodo('input');

            input.type = 'text';
            input.required = true;
            input.maxLength = 250;
            input.placeholder = 'Escribe un comentario...';

            input.setAttribute(
                'aria-label',
                'Comentario'
            );

            const enviar = nodo(
                'button',
                '',
                'Comentar'
            );

            enviar.type = 'submit';

            form.append(input, enviar);

            form.addEventListener('submit', e => {

                e.preventDefault();

                const texto = input.value.trim();

                if (!texto) {
                    return;
                }

                d = cargarDatos();

                const real = d.publicaciones.find(
                    x => x.id === p.id
                );

                if (!real) {
                    return;
                }

                // Guardar comentario
                real.comentarios.push({
                    id: crearId(),
                    autor: sesion(),
                    texto: texto,
                    fecha: new Date().toISOString()
                });

                registrarActividad(
                    d,
                    sesion(),
                    'Comentario',
                    'Comentaste una publicación de @' +
                    p.autor + ': ' + texto
                );

                guardarDatos(d);
                pintar();
            });

            comentarios.append(form);

            tarjeta.append(comentarios);

            lista.append(tarjeta);
        });
    }

    // Filtrar por carrera o comunidad
    filtro.addEventListener('change', pintar);

    // ======================================
    // 7. CREAR NUEVAS PUBLICACIONES
    // ======================================

    document.getElementById('publicacionForm')
        .addEventListener('submit', e => {

            e.preventDefault();

            const texto = document.getElementById('textoPost')
                .value.trim();

            // Validar que exista contenido
            if (texto.length < 3) {
                mensaje(
                    'muroMensaje',
                    'Escribe al menos 3 caracteres.'
                );
                return;
            }

            d = cargarDatos();

            // Agregar publicación
            d.publicaciones.push({
                id: crearId(),
                autor: sesion(),
                tipo: document.getElementById('tipoPost').value,
                grupo: document.getElementById('grupoPost').value,
                texto: texto,
                fecha: new Date().toISOString(),
                likes: [],
                comentarios: []
            });

            // Guardar en el historial
            registrarActividad(
                d,
                sesion(),
                'Publicación',
                'Publicaste: ' + texto.slice(0, 100)
            );

            guardarDatos(d);

            // Limpiar formulario
            e.target.reset();

            filtro.value = 'Todos';

            mensaje(
                'muroMensaje',
                '¡Publicación creada correctamente!'
            );

            pintar();
        });

    pintar();
}

// ==========================================
// 8. HISTORIAL DE INTERACCIONES
// ==========================================

function historial() {

    if (!proteger()) {
        return;
    }

    configurarSalir();

    const d = cargarDatos();
    const yo = sesion();

    if (!usuarioActual(d)) {
        sessionStorage.removeItem(CLAVE_SESION);
        location.replace('index.html');
        return;
    }

    // Obtener actividades del usuario
    const acciones = d.historial
        .filter(a => a.usuario === yo)
        .slice()
        .sort(
            (a, b) =>
                new Date(b.fecha) - new Date(a.fecha)
        );

    // Total de publicaciones propias
    document.getElementById('totalPosts').textContent =
        d.publicaciones.filter(
            p => p.autor === yo
        ).length;

    // Total de Me gusta dados
    document.getElementById('totalLikes').textContent =
        d.publicaciones.reduce(
            (n, p) =>
                n + (p.likes.includes(yo) ? 1 : 0),
            0
        );

    // Total de comentarios realizados
    document.getElementById('totalComentarios').textContent =
        d.publicaciones.reduce(
            (n, p) =>
                n + p.comentarios.filter(
                    c => c.autor === yo
                ).length,
            0
        );

    const lista = document.getElementById('listaHistorial');

    // Mostrar mensaje si no existen actividades
    if (!acciones.length) {
        lista.append(
            nodo(
                'p',
                'empty',
                'Todavía no tienes actividad registrada.'
            )
        );
    }

    // Mostrar historial
    acciones.forEach(a => {

        const elem = nodo('div', 'activity');

        elem.append(
            nodo('strong', '', a.accion),
            nodo('div', '', a.detalle),
            nodo('small', '', fecha(a.fecha))
        );

        lista.append(elem);
    });

    // ======================================
    // 9. DESCARGAR HISTORIAL
    // ======================================

    document.getElementById('descargarHistorial')
        .addEventListener('click', () => {

            const texto = [
                'UNICONecta - HISTORIAL DE @' + yo,
                '',
                ...acciones.map(
                    a =>
                        fecha(a.fecha) +
                        ' | ' + a.accion +
                        ' | ' + a.detalle
                )
            ].join('\n');

            const blob = new Blob(
                [texto],
                {
                    type: 'text/plain;charset=utf-8'
                }
            );

            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');

            a.href = url;
            a.download = 'historial_' + yo + '.txt';

            a.click();

            URL.revokeObjectURL(url);
        });
}

// ==========================================
// 10. IDENTIFICAR LA PÁGINA ACTUAL
// ==========================================

// El archivo HTML indica qué función ejecutar
const pagina = document.body.dataset.page;

if (pagina === 'inicio') {
    inicio();
}

if (pagina === 'muro') {
    muro();
}

if (pagina === 'historial') {
    historial();
}
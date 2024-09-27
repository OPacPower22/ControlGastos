// Simulación de usuarios registrados
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || {
    "admin": "12345"
};

// Cargar ingresos, gastos y saldo del localStorage
let ingresos = JSON.parse(localStorage.getItem('ingresos')) || [];
let gastos = JSON.parse(localStorage.getItem('gastos')) || [];
let saldoInicial = parseFloat(localStorage.getItem('saldoInicial')) || 0;
let usuarioLogueado = localStorage.getItem('usuarioLogueado') || null;  // Guardar el estado de la sesión

const loginForm = document.getElementById('login-form');
const appContainer = document.getElementById('app-container');
const loginContainer = document.getElementById('login-container');
const registerContainer = document.getElementById('register-container'); // Para mostrar el formulario de registro
const registerForm = document.getElementById('register-form');  // Formulario de registro
const loginError = document.getElementById('login-error');  // Para mostrar error en login
const registerError = document.getElementById('register-error');  // Para mostrar error en registro
const saldoRemanenteDisplay = document.getElementById('saldo-remanente');
const registerLink = document.getElementById('register-link');  // Enlace "Regístrate aquí"
const loginLink = document.getElementById('login-link');  // Enlace "Inicia sesión aquí" desde el registro
let chartInstance = null;

// Variable para el índice del registro que se está modificando
let registroEnEdicion = null;

// Obtener los elementos de la ventana modal para editar
const modalEditar = document.getElementById('modal-editar');
const btnAceptarEditar = document.getElementById('btn-aceptar-editar');
const btnCancelarEditar = document.getElementById('btn-cancelar-editar');
const formEditar = document.getElementById('form-editar');
const fechaEditar = document.getElementById('fecha-editar');
const categoriaEditar = document.getElementById('categoria-editar');
const montoEditar = document.getElementById('monto-editar');

// Función para abrir el modal de edición
function abrirModalEditar() {
    modalEditar.classList.remove('hidden');
    modalEditar.style.display = 'flex';  // Mostrar el modal
}

// Función para cerrar el modal de edición
function cerrarModalEditar() {
    modalEditar.classList.add('hidden');
    modalEditar.style.display = 'none';  // Ocultar el modal
}

// Función para modificar un registro (Ingreso o Gasto)
function modificarRegistro(index, tipo) {
    registroEnEdicion = { index, tipo };  // Almacenar el índice y el tipo del registro en edición

    // Obtener los datos actuales del registro
    let registro;
    if (tipo === 'Ingreso') {
        registro = ingresos[index];
    } else {
        registro = gastos[index];
    }

    // Rellenar el formulario del modal con los datos actuales
    fechaEditar.value = registro.fecha;
    categoriaEditar.value = registro.categoria;
    montoEditar.value = registro.monto;

    // Abrir la ventana modal para editar
    abrirModalEditar();
}

// Manejar el botón "Aceptar" en el modal de edición
formEditar.addEventListener('submit', (e) => {
    e.preventDefault();  // Prevenir el comportamiento predeterminado del formulario

    // Obtener los nuevos valores del formulario
    const nuevaFecha = fechaEditar.value;
    const nuevaCategoria = categoriaEditar.value;
    const nuevoMonto = parseFloat(montoEditar.value).toFixed(2);

    // Actualizar el registro dependiendo del tipo
    if (registroEnEdicion.tipo === 'Ingreso') {
        ingresos[registroEnEdicion.index] = { fecha: nuevaFecha, categoria: nuevaCategoria, monto: nuevoMonto };
    } else {
        gastos[registroEnEdicion.index] = { fecha: nuevaFecha, categoria: nuevaCategoria, monto: nuevoMonto };
    }

    // Actualizar la tabla y los datos
    actualizarTabla();
    actualizarSaldoRemanente();
    actualizarGrafica();
    guardarDatos();

    // Cerrar el modal
    cerrarModalEditar();
});

// Manejar el botón "Cancelar" en el modal de edición
btnCancelarEditar.addEventListener('click', () => {
    cerrarModalEditar();  // Solo cierra el modal sin hacer cambios
});

// Función para iniciar sesión
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Validar credenciales
    if (usuarios[username] && usuarios[username] === password) {
        usuarioLogueado = username;
        localStorage.setItem('usuarioLogueado', usuarioLogueado);  // Guardar el estado de sesión
        loginContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        loginError.classList.add('hidden');  // Ocultar mensaje de error
    } else {
        loginError.classList.remove('hidden');  // Mostrar mensaje de error
    }
});

// Función para registrar un nuevo usuario
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newUsername = document.getElementById('new-username').value;
    const newPassword = document.getElementById('new-password').value;

    // Validar si el usuario ya existe
    if (usuarios[newUsername]) {
        registerError.textContent = 'El usuario ya existe';
        registerError.classList.remove('hidden');  // Mostrar error
    } else {
        // Registrar nuevo usuario
        usuarios[newUsername] = newPassword;
        localStorage.setItem('usuarios', JSON.stringify(usuarios));  // Guardar en localStorage
        registerError.classList.add('hidden');  // Ocultar error

        // Redirigir al formulario de login
        registerContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
    }
});

// Mostrar formulario de registro
registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginContainer.classList.add('hidden');
    registerContainer.classList.remove('hidden');
});

// Volver a la pantalla de inicio de sesión desde el registro
loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
});

// Manejo de saldo inicial
document.getElementById('saldo-inicial-form').addEventListener('submit', (e) => {
    e.preventDefault();
    saldoInicial = parseFloat(document.getElementById('saldo-inicial').value).toFixed(2);
    localStorage.setItem('saldoInicial', saldoInicial);  // Guardar saldo inicial en localStorage
    actualizarSaldoRemanente();
});

// Función para agregar o modificar un ingreso
document.getElementById('ingreso-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fecha = document.getElementById('fecha-ingreso').value;
    const categoria = document.getElementById('categoria-ingreso').value;
    const monto = parseFloat(document.getElementById('monto-ingreso').value).toFixed(2);

    ingresos.push({ fecha, categoria, monto });
    actualizarTabla();
    actualizarSaldoRemanente();
    actualizarGrafica();
    guardarDatos();
});

// Función para agregar o modificar un gasto
document.getElementById('gasto-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fecha = document.getElementById('fecha').value;
    const categoria = document.getElementById('categoria').value;
    const monto = parseFloat(document.getElementById('monto').value).toFixed(2);

    gastos.push({ fecha, categoria, monto });
    actualizarTabla();
    actualizarSaldoRemanente();
    actualizarGrafica();
    guardarDatos();
});

// Actualizar tabla de ingresos y gastos
function actualizarTabla() {
    const tablaBody = document.querySelector('#tabla-ingresos-gastos tbody');
    tablaBody.innerHTML = ''; // Limpiar tabla

    let saldo = parseFloat(saldoInicial); // Comenzar con el saldo inicial

    [...ingresos, ...gastos].forEach((registro, index) => {
        const tipo = ingresos.includes(registro) ? 'Ingreso' : 'Gasto';
        
        // Actualizar el saldo dependiendo si es ingreso o gasto
        if (tipo === 'Ingreso') {
            saldo += parseFloat(registro.monto);
        } else {
            saldo -= parseFloat(registro.monto);
        }

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${registro.fecha}</td>
            <td>${registro.categoria}</td>
            <td>${tipo}</td>
            <td>$${registro.monto}</td>
            <td>$${saldo.toFixed(2)}</td> <!-- Mostrar el saldo actualizado -->
            <td><button onclick="modificarRegistro(${index}, '${tipo}')">Modificar</button></td>
            <td><button onclick="eliminarRegistro(${index}, '${tipo}')">Eliminar</button></td>
        `;
        tablaBody.appendChild(fila);
    });
}

// Eliminar registro
function eliminarRegistro(index, tipo) {
    if (tipo === 'Ingreso') {
        ingresos.splice(index, 1);
    } else {
        gastos.splice(index - ingresos.length, 1);
    }
    actualizarTabla();
    actualizarSaldoRemanente();
    actualizarGrafica();
    guardarDatos();
}

// Actualizar saldo remanente
function actualizarSaldoRemanente() {
    const totalIngresos = ingresos.reduce((acc, ingreso) => acc + parseFloat(ingreso.monto), 0);
    const totalGastos = gastos.reduce((acc, gasto) => acc + parseFloat(gasto.monto), 0);
    const saldoRemanente = saldoInicial + totalIngresos - totalGastos;
    saldoRemanenteDisplay.textContent = `Saldo actual: $${saldoRemanente.toFixed(2)}`;
}

// Guardar ingresos, gastos y saldo en localStorage
function guardarDatos() {
    localStorage.setItem('ingresos', JSON.stringify(ingresos));
    localStorage.setItem('gastos', JSON.stringify(gastos));
    localStorage.setItem('saldoInicial', saldoInicial);
}

// Actualizar gráfica de ingresos vs gastos
function actualizarGrafica() {
    const totalIngresos = ingresos.reduce((acc, ingreso) => acc + parseFloat(ingreso.monto), 0);
    const totalGastos = gastos.reduce((acc, gasto) => acc + parseFloat(gasto.monto), 0);

    const ctx = document.getElementById('grafica-ingresos-gastos').getContext('2d');
    
    if (chartInstance) {
        chartInstance.destroy(); // Destruir la gráfica anterior para evitar duplicados
    }

    chartInstance = new Chart(ctx, {
        type: 'bar', // Gráfica de dona
        data: {
            labels: ['Ingresos', 'Gastos'],
            datasets: [{
                label: 'Ingresos vs Gastos',
                data: [totalIngresos, totalGastos],
                backgroundColor: ['#28a745', '#dc3545'], // Verde para ingresos, rojo para gastos
                borderColor: ['#28a745', '#dc3545'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
            }
        }
    });
}

// Cargar credenciales recordadas y datos almacenados al iniciar
document.addEventListener('DOMContentLoaded', () => {
    if (usuarioLogueado) {
        loginContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
    }
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        document.getElementById('username').value = rememberedUser;
        document.getElementById('password').value = usuarios[rememberedUser];
        document.getElementById('remember-me').checked = true;
    }
    actualizarTabla();
    actualizarSaldoRemanente(); // Cargar saldo remanente
    actualizarGrafica(); // Inicializar gráfica
});
// Función para agregar o modificar un ingreso
document.getElementById('ingreso-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fecha = document.getElementById('fecha-ingreso').value;
    const categoria = document.getElementById('categoria-ingreso').value;
    const monto = parseFloat(document.getElementById('monto-ingreso').value).toFixed(2);

    // Agregar ingreso al arreglo
    ingresos.push({ fecha, categoria, monto });
    
    // Actualizar la tabla, saldo, gráfica, y guardar en localStorage
    actualizarTabla();
    actualizarSaldoRemanente();
    actualizarGrafica();
    guardarDatos();

    // Limpiar los campos del formulario
    e.target.reset();
});

// Función para agregar o modificar un gasto
document.getElementById('gasto-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fecha = document.getElementById('fecha').value;
    const categoria = document.getElementById('categoria').value;
    const monto = parseFloat(document.getElementById('monto').value).toFixed(2);

    // Agregar gasto al arreglo
    gastos.push({ fecha, categoria, monto });
    
    // Actualizar la tabla, saldo, gráfica, y guardar en localStorage
    actualizarTabla();
    actualizarSaldoRemanente();
    actualizarGrafica();
    guardarDatos();

    // Limpiar los campos del formulario
    e.target.reset();
});

// Cerrar sesión
document.getElementById('btn-cerrar-sesion').addEventListener('click', () => {
    guardarDatos();
    localStorage.removeItem('usuarioLogueado');  // Eliminar estado de sesión al cerrar sesión
    appContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
});

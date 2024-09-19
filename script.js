// Simulación de usuarios registrados
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || {
    "admin": "12345"
};

// Cargar gastos del localStorage
let gastos = JSON.parse(localStorage.getItem('gastos')) || [];
const loginForm = document.getElementById('login-form');
const appContainer = document.getElementById('app-container');
const loginContainer = document.getElementById('login-container');
const registerContainer = document.getElementById('register-container');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');

// Cargar credenciales recordadas
document.addEventListener('DOMContentLoaded', () => {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        document.getElementById('username').value = rememberedUser;
        document.getElementById('password').value = usuarios[rememberedUser];
        document.getElementById('remember-me').checked = true;
    }
    actualizarTablaGastos();  // Cargar gastos guardados en la tabla
});

// Manejo del inicio de sesión
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me').checked;

    if (usuarios[username] && usuarios[username] === password) {
        // Guardar usuario si se marcó "Recordar contraseña"
        if (rememberMe) {
            localStorage.setItem('rememberedUser', username);
        } else {
            localStorage.removeItem('rememberedUser');
        }
        loginContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
    } else {
        loginError.classList.remove('hidden');
    }
});

// Cambio a la vista de registro
document.getElementById('register-link').addEventListener('click', () => {
    loginContainer.classList.add('hidden');
    registerContainer.classList.remove('hidden');
});

// Cambio a la vista de inicio de sesión
document.getElementById('login-link').addEventListener('click', () => {
    registerContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
});

// Manejo del registro de usuario
document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const newUsername = document.getElementById('new-username').value;
    const newPassword = document.getElementById('new-password').value;

    if (usuarios[newUsername]) {
        registerError.classList.remove('hidden');
    } else {
        usuarios[newUsername] = newPassword;
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        alert('Usuario registrado exitosamente. Inicia sesión.');
        registerContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
    }
});

// Guardar gastos en localStorage
function guardarGastos() {
    localStorage.setItem('gastos', JSON.stringify(gastos));
}

// Formulario de gastos
document.getElementById('gasto-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const fecha = document.getElementById('fecha').value;
    const categoria = document.getElementById('categoria').value;
    const monto = parseFloat(document.getElementById('monto').value).toFixed(2);

    // Si es edición
    if (document.getElementById('gasto-form').dataset.editing === 'true') {
        const editIndex = document.getElementById('gasto-form').dataset.editIndex;
        gastos[editIndex] = { fecha, categoria, monto };
        document.getElementById('gasto-form').removeAttribute('data-editing');
        document.getElementById('gasto-form').removeAttribute('data-editIndex');
    } else {
        gastos.push({ fecha, categoria, monto });
    }

    actualizarTablaGastos();
    verificarAlertaGastos();
    guardarGastos();  // Guardar los gastos en localStorage
});

function actualizarTablaGastos() {
    const tablaBody = document.querySelector('#tabla-gastos tbody');
    tablaBody.innerHTML = ''; // Limpiar tabla

    gastos.forEach((gasto, index) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${gasto.fecha}</td>
            <td>${gasto.categoria}</td>
            <td>$${gasto.monto}</td>
            <td><button onclick="editarGasto(${index})">Editar</button></td>
            <td><button onclick="eliminarGasto(${index})">Eliminar</button></td>
        `;
        tablaBody.appendChild(fila);
    });
}

// Editar gasto
function editarGasto(index) {
    const gasto = gastos[index];
    document.getElementById('fecha').value = gasto.fecha;
    document.getElementById('categoria').value = gasto.categoria;
    document.getElementById('monto').value = gasto.monto;

    document.getElementById('gasto-form').dataset.editing = 'true';
    document.getElementById('gasto-form').dataset.editIndex = index;
}

// Eliminar gasto
function eliminarGasto(index) {
    gastos.splice(index, 1);
    actualizarTablaGastos();
    verificarAlertaGastos();
    guardarGastos();  // Guardar los gastos en localStorage
}

// Verificar si los gastos alcanzan $150
function verificarAlertaGastos() {
    const totalGastos = gastos.reduce((acc, gasto) => acc + parseFloat(gasto.monto), 0);
    if (totalGastos >= 150) {
        alert('¡Alerta! Has alcanzado o superado los $20,000 en gastos.');
    }
}

// Cerrar sesión
document.getElementById('btn-cerrar-sesion').addEventListener('click', () => {
    guardarGastos();  // Guardar los gastos antes de cerrar sesión
    appContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
});

// Generar reportes
document.getElementById('btn-reporte').addEventListener('click', () => {
    const tipoReporte = document.getElementById('tipo-reporte').value;
    let reporteGastos = '';
    
    if (tipoReporte === 'diario') {
        reporteGastos = generarReporte('dia');
    } else if (tipoReporte === 'mensual') {
        reporteGastos = generarReporte('mes');
    } else if (tipoReporte === 'anual') {
        reporteGastos = generarReporte('anio');
    }

    document.getElementById('reporte').innerHTML = reporteGastos;
});

function generarReporte(tipo) {
    const hoy = new Date();
    const filtro = {
        dia: hoy.toISOString().split('T')[0],
        mes: hoy.getFullYear() + '-' + ('0' + (hoy.getMonth() + 1)).slice(-2),
        anio: hoy.getFullYear().toString()
    };

    const gastosFiltrados = gastos.filter(gasto => gasto.fecha.startsWith(filtro[tipo]));
    let total = 0;
    let reporte = `<h3>Reporte ${tipo}</h3><ul>`;
    
    gastosFiltrados.forEach(gasto => {
        reporte += `<li>${gasto.fecha} - ${gasto.categoria}: $${gasto.monto}</li>`;
        total += parseFloat(gasto.monto);
    });

    reporte += `</ul><h4>Total: $${total.toFixed(2)}</h4>`;
    return reporte;
}

// Imprimir reporte
document.getElementById('btn-imprimir').addEventListener('click', () => {
    window.print();
});


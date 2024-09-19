// Simulación de usuarios registrados
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || {
    "admin": "12345"
};

// Cargar ingresos, gastos y saldo del localStorage
let ingresos = JSON.parse(localStorage.getItem('ingresos')) || [];
let gastos = JSON.parse(localStorage.getItem('gastos')) || [];
let saldoInicial = parseFloat(localStorage.getItem('saldoInicial')) || 0;
const loginForm = document.getElementById('login-form');
const appContainer = document.getElementById('app-container');
const loginContainer = document.getElementById('login-container');
const registerContainer = document.getElementById('register-container');
const saldoRemanenteDisplay = document.getElementById('saldo-remanente');
let chartInstance = null;

// Variable para el índice del registro que se está modificando
let registroEnEdicion = null;

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

// Cargar credenciales recordadas
document.addEventListener('DOMContentLoaded', () => {
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

// Manejo del inicio de sesión
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me').checked;

    if (usuarios[username] && usuarios[username] === password) {
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

// Formulario de saldo inicial
document.getElementById('saldo-inicial-form').addEventListener('submit', (e) => {
    e.preventDefault();
    saldoInicial = parseFloat(document.getElementById('saldo-inicial').value).toFixed(2);
    guardarDatos();
    actualizarSaldoRemanente();
});

// Formulario para agregar ingresos
document.getElementById('ingreso-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fecha = document.getElementById('fecha-ingreso').value;
    const categoria = document.getElementById('categoria-ingreso').value;
    const monto = parseFloat(document.getElementById('monto-ingreso').value).toFixed(2);

    // Si hay un registro en edición, reemplazar el registro existente
    if (registroEnEdicion !== null && registroEnEdicion.tipo === 'Ingreso') {
        ingresos[registroEnEdicion.index] = { fecha, categoria, monto };
        registroEnEdicion = null;  // Resetear el índice de edición
        document.getElementById('ingreso-form').querySelector('button').textContent = 'Agregar Ingreso';  // Cambiar el texto del botón
    } else {
        // Si no está en edición, agregar un nuevo ingreso
        ingresos.push({ fecha, categoria, monto });
    }

    actualizarTabla();
    actualizarSaldoRemanente();
    actualizarGrafica();
    guardarDatos();
});

// Formulario para agregar gastos
document.getElementById('gasto-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fecha = document.getElementById('fecha').value;
    const categoria = document.getElementById('categoria').value;
    const monto = parseFloat(document.getElementById('monto').value).toFixed(2);

    // Si hay un registro en edición, reemplazar el registro existente
    if (registroEnEdicion !== null && registroEnEdicion.tipo === 'Gasto') {
        gastos[registroEnEdicion.index] = { fecha, categoria, monto };
        registroEnEdicion = null;  // Resetear el índice de edición
        document.getElementById('gasto-form').querySelector('button').textContent = 'Agregar Gasto';  // Cambiar el texto del botón
    } else {
        // Si no está en edición, agregar un nuevo gasto
        gastos.push({ fecha, categoria, monto });
    }

    actualizarTabla();
    actualizarSaldoRemanente();
    actualizarGrafica();
    guardarDatos();
});

// Actualizar tabla de ingresos y gastos
function actualizarTabla() {
    const tablaBody = document.querySelector('#tabla-ingresos-gastos tbody');
    tablaBody.innerHTML = ''; // Limpiar tabla

    [...ingresos, ...gastos].forEach((registro, index) => {
        const tipo = ingresos.includes(registro) ? 'Ingreso' : 'Gasto';
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${registro.fecha}</td>
            <td>${registro.categoria}</td>
            <td>${tipo}</td>
            <td>$${registro.monto}</td>
            <td><button onclick="eliminarRegistro(${index}, '${tipo}')">Eliminar</button></td>
            <td><button onclick="modificarRegistro(${index}, '${tipo}')">Modificar</button></td>
        `;
        tablaBody.appendChild(fila);
    });
}

// Modificar registro
function modificarRegistro(index, tipo) {
    registroEnEdicion = { index, tipo };  // Almacenar el índice y el tipo del registro en edición

    if (tipo === 'Ingreso') {
        const ingreso = ingresos[index];
        document.getElementById('fecha-ingreso').value = ingreso.fecha;
        document.getElementById('categoria-ingreso').value = ingreso.categoria;
        document.getElementById('monto-ingreso').value = ingreso.monto;
        document.getElementById('ingreso-form').querySelector('button').textContent = 'Guardar cambios';  // Cambiar el texto del botón
    } else {
        const gasto = gastos[index];
        document.getElementById('fecha').value = gasto.fecha;
        document.getElementById('categoria').value = gasto.categoria;
        document.getElementById('monto').value = gasto.monto;
        document.getElementById('gasto-form').querySelector('button').textContent = 'Guardar cambios';  // Cambiar el texto del botón
    }
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

// Actualizar gráfica de ingresos vs gastos
function actualizarGrafica() {
    const totalIngresos = ingresos.reduce((acc, ingreso) => acc + parseFloat(ingreso.monto), 0);
    const totalGastos = gastos.reduce((acc, gasto) => acc + parseFloat(gasto.monto), 0);

    const ctx = document.getElementById('grafica-ingresos-gastos').getContext('2d');
    
    if (chartInstance) {
        chartInstance.destroy(); // Destruir la gráfica anterior para evitar duplicados
    }

    chartInstance = new Chart(ctx, {
        type: 'doughnut', // Gráfica de dona
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

// Cerrar sesión
document.getElementById('btn-cerrar-sesion').addEventListener('click', () => {
    guardarDatos();
    appContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
});

// main.js - SPA para CrudDATABASE


const API_URL = 'http://localhost:5000'; // Cambia si tu backend usa otro puerto
let jwt = '';
let userRole = '';
let username = '';

function render(view) {
    document.getElementById('app').innerHTML = view;
}


function navBar() {
    let links = '';
    if (!jwt) {
        links += `<a href="#" onclick="goTo('login')">Login</a>`;
        links += `<a href="#" onclick="goTo('register')">Registro</a>`;
    } else {
        if (userRole === 'admin') {
            links += `<a href="#" onclick="goTo('users')">Usuarios</a>`;
        }
        links += `<a href="#" onclick="goTo('productos')">Productos</a>`;
        links += `<a href="#" onclick="logout()">Logout</a>`;
        links += `<span style='margin-left:16px;color:#888;'>${username} (${userRole})</span>`;
    }
    return `<nav>${links}</nav>`;
}


function goTo(page) {
    if (page === 'login') render(loginView());
    else if (page === 'register') render(registerView());
    else if (page === 'users') {
        if (jwt && userRole === 'admin') loadUsers();
        else goTo('productos');
    }
    else if (page === 'productos') {
        if (jwt) loadProductos();
        else goTo('login');
    }
}

function showMessage(msg, type='error') {
    return `<div class="${type}">${msg}</div>`;
}


// LOGIN
function loginView() {
    return navBar() + `
    <div class="login-page">
        <h2>Login</h2>
        <form onsubmit="event.preventDefault(); login()">
            <input type="text" id="login-username" placeholder="Usuario" required />
            <input type="password" id="login-password" placeholder="Contraseña" required />
            <button class="button" type="submit">Entrar</button>
        </form>
        <div id="login-msg"></div>
        <p>¿No tienes cuenta? <a href="#" onclick="goTo('register')">Regístrate aquí</a></p>
    </div>
    `;
}

function login() {
    const user = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password })
    })
    .then(r => r.json())
    .then(data => {
        if (data.access_token) {
            jwt = data.access_token;
            username = user;
            // Decodificar el JWT para obtener el rol
            try {
                const payload = JSON.parse(atob(jwt.split('.')[1]));
                userRole = payload.role || (payload.additional_claims && payload.additional_claims.role) || '';
            } catch (e) {
                userRole = '';
            }
            if (userRole === 'admin') goTo('users');
            else goTo('productos');
        } else {
            document.getElementById('login-msg').innerHTML = showMessage(data.error || 'Error de login');
        }
    });
}


// REGISTRO
function registerView() {
    return navBar() + `
    <div class="register-page">
        <h2>Registro</h2>
        <form onsubmit="event.preventDefault(); register()">
            <input type="text" id="reg-username" placeholder="Usuario" required />
            <input type="password" id="reg-password" placeholder="Contraseña" required />
            <select id="reg-role">
                <option value="cliente">Cliente</option>
                <option value="admin">Admin</option>
            </select>
            <button class="button" type="submit">Registrar</button>
        </form>
        <div id="reg-msg"></div>
        <p>¿Ya tienes cuenta? <a href="#" onclick="goTo('login')">Inicia sesión aquí</a></p>
    </div>
    `;
}

function register() {
    const user = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const role = document.getElementById('reg-role').value;
    fetch(`${API_URL}/registry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password, role })
    })
    .then(r => r.json())
    .then(data => {
        if (data.id) {
            document.getElementById('reg-msg').innerHTML = showMessage('Usuario registrado', 'success');
        } else {
            document.getElementById('reg-msg').innerHTML = showMessage(data.error || 'Error de registro');
        }
    });
}

// USUARIOS

function loadUsers() {
    render(navBar() + '<h2>Usuarios</h2><div id="users-list">Cargando...</div>');
    fetch(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${jwt}` },
        mode: 'cors',
        credentials: 'omit'
    })
    .then(r => r.json())
    .then(data => {
        if (Array.isArray(data)) {
            let html = `<table><tr><th>ID</th><th>Usuario</th><th>Rol</th><th>Acciones</th></tr>`;
            data.forEach(u => {
                html += `<tr>
                    <td>${u.id}</td>
                    <td>${u.username}</td>
                    <td>${u.role}</td>
                    <td>
                        <button onclick="editUser(${u.id}, '${u.username}')">Editar</button>
                        <button onclick="deleteUser(${u.id})">Eliminar</button>
                    </td>
                </tr>`;
            });
            html += `</table>`;
            if (userRole === 'admin') {
                html += `<h3>Crear usuario</h3>`;
                html += `<form onsubmit="event.preventDefault(); createUser()">
                    <input type="text" id="new-username" placeholder="Usuario" required />
                    <input type="password" id="new-password" placeholder="Contraseña" required />
                    <select id="new-role">
                        <option value="cliente">Cliente</option>
                        <option value="admin">Admin</option>
                    </select>
                    <button class="button" type="submit">Crear</button>
                </form><div id="user-msg"></div>`;
            }
            document.getElementById('users-list').innerHTML = html;
        } else {
            document.getElementById('users-list').innerHTML = showMessage(data.error || 'Error al cargar usuarios');
        }
    });
}

function createUser() {
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const role = document.getElementById('new-role').value;
    fetch(`${API_URL}/registry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({ username, password, role })
    })
    .then(r => r.json())
    .then(data => {
        if (data.id) {
            loadUsers();
        } else {
            document.getElementById('user-msg').innerHTML = showMessage(data.error || 'Error al crear usuario');
        }
    });
}

function editUser(id, username) {
    const newUsername = prompt('Nuevo nombre de usuario:', username);
    if (!newUsername) return;
    const newPassword = prompt('Nueva contraseña (dejar vacío para no cambiar):', '');
    fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({ username: newUsername, password: newPassword })
    })
    .then(r => r.json())
    .then(data => {
        if (data.id) {
            loadUsers();
        } else {
            alert(data.error || 'Error al editar usuario');
        }
    });
}

function deleteUser(id) {
    if (!confirm('¿Seguro que quieres eliminar este usuario?')) return;
    fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${jwt}` },
        mode: 'cors',
        credentials: 'omit'
    })
    .then(r => r.json())
    .then(data => {
        if (data.message) {
            loadUsers();
        } else {
            alert(data.error || 'Error al eliminar usuario');
        }
    });
}

// PRODUCTOS



function loadProductos() {
    render(navBar() + '<h2>Productos</h2><div id="productos-list">Cargando...</div>');
    fetch(`${API_URL}/productos`, {
        headers: { 'Authorization': `Bearer ${jwt}` },
        mode: 'cors',
        credentials: 'omit'
    })
    .then(r => r.json())
    .then(data => {
        let html = '';
        if (Array.isArray(data)) {
            if (data.length > 0) {
                html += `<table><tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Stock</th>`;
                if (userRole === 'admin' || userRole === 'cliente') html += `<th>Acciones</th>`;
                html += `</tr>`;
                data.forEach(p => {
                    html += `<tr>
                        <td>${p.id}</td>
                        <td>${p.nombre}</td>
                        <td>${p.precio}</td>
                        <td>${p.stock}</td>`;
                    if (userRole === 'admin' || userRole === 'cliente') {
                        html += `<td>`;
                        html += `<button onclick="editProducto(${p.id}, '${p.nombre}', ${p.precio}, ${p.stock})">Editar</button>`;
                        html += `<button onclick="deleteProducto(${p.id})">Eliminar</button>`;
                        html += `</td>`;
                    }
                    html += `</tr>`;
                });
                html += `</table>`;
            } else {
                html += `<div class="success">No hay productos registrados.</div>`;
            }
        } else {
            html += showMessage(data.error || 'Error al cargar productos');
        }
        // Mostrar siempre el formulario de creación si el rol lo permite
        if (userRole === 'admin' || userRole === 'cliente') {
            html += `<h3>Crear producto</h3>`;
            html += `<form onsubmit="event.preventDefault(); createProducto()">
                <input type="text" id="new-nombre" placeholder="Nombre" required />
                <input type="number" id="new-precio" placeholder="Precio" min="0" step="0.01" required />
                <input type="number" id="new-stock" placeholder="Stock" min="0" step="1" required />
                <button class="button" type="submit">Crear</button>
            </form><div id="prod-msg"></div>`;
        }
        document.getElementById('productos-list').innerHTML = html;
    });
}


function createProducto() {
    const nombre = document.getElementById('new-nombre').value;
    const precio = parseFloat(document.getElementById('new-precio').value);
    const stock = parseInt(document.getElementById('new-stock').value);
    fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({ nombre, precio, stock })
    })
    .then(r => r.json())
    .then(data => {
        if (data.id) {
            loadProductos();
        } else {
            document.getElementById('prod-msg').innerHTML = showMessage(data.error || 'Error al crear producto');
        }
    });
}


function editProducto(id, nombre, precio, stock) {
    const newNombre = prompt('Nuevo nombre de producto:', nombre);
    if (newNombre === null) return;
    const newPrecio = prompt('Nuevo precio:', precio);
    if (newPrecio === null) return;
    const newStock = prompt('Nuevo stock:', stock);
    if (newStock === null) return;
    fetch(`${API_URL}/productos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({ nombre: newNombre, precio: parseFloat(newPrecio), stock: parseInt(newStock) })
    })
    .then(r => r.json())
    .then(data => {
        if (data.id) {
            loadProductos();
        } else {
            alert(data.error || 'Error al editar producto');
        }
    });
}

function deleteProducto(id) {
    if (!confirm('¿Seguro que quieres eliminar este producto?')) return;
    fetch(`${API_URL}/productos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${jwt}` },
        mode: 'cors',
        credentials: 'omit'
    })
    .then(r => r.json())
    .then(data => {
        if (data.message || data.id) {
            loadProductos();
        } else {
            alert(data.error || 'Error al eliminar producto');
        }
    });
}

// LOGOUT

function logout() {
    jwt = '';
    userRole = '';
    username = '';
    goTo('login');
}

// Inicializar vista

window.onload = () => goTo('login');

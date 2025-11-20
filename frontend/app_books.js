// app_books.js - SPA para CRUD de Libros

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
        links += `<a href="#" onclick="goTo('books')">Libros</a>`;
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
        else goTo('books');
    }
    else if (page === 'books') {
        if (jwt) loadBooks();
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
            else goTo('books');
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

// BOOKS
function loadBooks() {
    render(navBar() + '<h2>Libros</h2><div id="books-list">Cargando...</div>');
    fetch(`${API_URL}/books`, {
        headers: { 'Authorization': `Bearer ${jwt}` },
        mode: 'cors',
        credentials: 'omit'
    })
    .then(r => r.json())
    .then(data => {
        let html = '';
        if (Array.isArray(data)) {
            if (data.length > 0) {
                html += `<table><tr><th>ID</th><th>Título</th><th>Autor</th><th>ISBN</th><th>Páginas</th>`;
                if (userRole === 'admin' || userRole === 'cliente') html += `<th>Acciones</th>`;
                html += `</tr>`;
                data.forEach(b => {
                    html += `<tr>
                        <td>${b.id}</td>
                        <td>${b.title}</td>
                        <td>${b.author || ''}</td>
                        <td>${b.isbn || ''}</td>
                        <td>${b.pages || ''}</td>`;
                    if (userRole === 'admin' || userRole === 'cliente') {
                        html += `<td>`;
                        html += `<button onclick="editBook(${b.id}, '${escapeHtml(b.title)}', '${escapeHtml(b.author || '')}', '${b.isbn || ''}', ${b.pages || 0}, '${escapeHtml(b.description || '')}')">Editar</button>`;
                        html += `<button onclick="deleteBook(${b.id})">Eliminar</button>`;
                        html += `</td>`;
                    }
                    html += `</tr>`;
                });
                html += `</table>`;
            } else {
                html += `<div class="success">No hay libros registrados.</div>`;
            }
        } else {
            html += showMessage(data.error || 'Error al cargar libros');
        }
        if (userRole === 'admin' || userRole === 'cliente') {
            html += `<h3>Crear libro</h3>`;
            html += `<form onsubmit="event.preventDefault(); createBook()">
                <input type="text" id="new-title" placeholder="Título" required />
                <input type="text" id="new-author" placeholder="Autor" />
                <input type="text" id="new-isbn" placeholder="ISBN" />
                <input type="number" id="new-pages" placeholder="Páginas" min="0" step="1" />
                <textarea id="new-description" placeholder="Descripción"></textarea>
                <button class="button" type="submit">Crear</button>
            </form><div id="book-msg"></div>`;
        }
        document.getElementById('books-list').innerHTML = html;
    });
}

function createBook() {
    const title = document.getElementById('new-title').value;
    const author = document.getElementById('new-author').value;
    const isbn = document.getElementById('new-isbn').value;
    const pages = parseInt(document.getElementById('new-pages').value) || null;
    const description = document.getElementById('new-description').value;
    fetch(`${API_URL}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({ title, author, isbn, pages, description })
    })
    .then(r => r.json())
    .then(data => {
        if (data.id) {
            loadBooks();
        } else {
            document.getElementById('book-msg').innerHTML = showMessage(data.error || 'Error al crear libro');
        }
    });
}

function editBook(id, title, author, isbn, pages, description) {
    const newTitle = prompt('Nuevo título:', title);
    if (newTitle === null) return;
    const newAuthor = prompt('Nuevo autor:', author || '');
    if (newAuthor === null) return;
    const newIsbn = prompt('Nuevo ISBN:', isbn || '');
    if (newIsbn === null) return;
    const newPages = prompt('Nuevas páginas:', pages || '0');
    if (newPages === null) return;
    const newDesc = prompt('Nueva descripción:', description || '');
    if (newDesc === null) return;
    fetch(`${API_URL}/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({ title: newTitle, author: newAuthor, isbn: newIsbn, pages: parseInt(newPages), description: newDesc })
    })
    .then(r => r.json())
    .then(data => {
        if (data.id) {
            loadBooks();
        } else {
            alert(data.error || 'Error al editar libro');
        }
    });
}

function deleteBook(id) {
    if (!confirm('¿Seguro que quieres eliminar este libro?')) return;
    fetch(`${API_URL}/books/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${jwt}` },
        mode: 'cors',
        credentials: 'omit'
    })
    .then(r => r.json())
    .then(data => {
        if (data.message || data.id) {
            loadBooks();
        } else {
            alert(data.error || 'Error al eliminar libro');
        }
    });
}

// helper para escapar texto al inyectarlo en onclick
function escapeHtml(str) {
    return String(str).replace(/'/g, "\\'").replace(/\"/g, '\\"').replace(/\n/g, ' ');
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
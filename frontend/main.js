// Deprecated: este archivo fue reemplazado por `app_books.js`.
// Mantener este archivo vacío evita conflictos si se carga accidentalmente.
console.warn('`frontend/main.js` está obsoleto. Usa `app_books.js` en su lugar.');


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
        else goTo('productos');
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

    // small helper to escape string when inlined into onclick
    function escapeHtml(str) {
        return String(str).replace(/'/g, "\\'").replace(/\"/g, '\\"').replace(/\n/g, ' ');
    }
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

#Parcial - API CRUD con Autenticación JWT

Este proyecto es una API desarrollada con **Flask**, que implementa un sistema CRUD (Crear, Leer, Actualizar y Eliminar) para la gestión de libros y usuarios.  
Incluye autenticación mediante **JWT (JSON Web Tokens)** y separación por capas: `config`, `models`, `repositories`, `services` y `controllers`.

---

##Instalación

###Clonar el repositorio
```bash
git clone https://github.com/kaparepennn/Parcial.git
cd Parcial
```

###Crear un entorno virtual
```bash
python -m venv venv
```

###Activar el entorno virtual
- **Windows:**
  ```bash
  venv\Scripts\activate
  ```
- **Mac / Linux:**
  ```bash
  source venv/bin/activate
  ```

###Instalar dependencias
```bash
pip install -r requirements.txt
```

---

##Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
FLASK_APP=main.py
FLASK_ENV=development
SECRET_KEY=clave_super_secreta
JWT_SECRET_KEY=clave_para_jwt
DATABASE_URL=sqlite:///libros_local.db
```

> Puedes cambiar `DATABASE_URL` si decides usar otra base de datos (MySQL, PostgreSQL, etc.).

---

##Cómo correr el proyecto en modo desarrollo

```bash
flask run
```

Por defecto, la aplicación correrá en:
👉 [http://localhost:5000](http://localhost:5000)

---

## Cómo ejecutar las pruebas

Si tienes pruebas unitarias configuradas en el directorio `tests/`, puedes ejecutarlas con:

```bash
pytest
```
o, si usas unittest:
```bash
python -m unittest discover
```

---

## Roles del sistema

| Rol | Descripción | Permisos |
|-----|--------------|-----------|
| **Administrador** | Puede crear, editar, eliminar y listar todos los registros. | CRUD completo sobre libros y usuarios. |
| **Usuario** | Puede autenticarse y consultar información disponible. | Lectura de datos y operaciones limitadas. |

---

## Flujo de Autenticación

1. **Registro de usuario** → el usuario se registra mediante el endpoint `/auth/register`.
2. **Inicio de sesión** → se obtiene un **token JWT** mediante `/auth/login`.
3. **Uso del token** → en cada petición protegida se debe incluir el encabezado:
   ```
   Authorization: Bearer <tu_token_aquí>
   ```

---

## Ejemplo de Token JWT

**Request:**
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJh..."
}
```

Luego usas ese token para acceder a rutas protegidas.

---

## Tabla de Endpoints

| Método | Endpoint | Descripción | Autenticación |
|--------|-----------|-------------|----------------|
| **POST** | `/auth/register` | Registro de nuevo usuario | ❌ No requerida |
| **POST** | `/auth/login` | Inicio de sesión y obtención de token | ❌ No requerida |
| **GET** | `/libros` | Listar todos los libros | ✅ Requerida |
| **GET** | `/libros/<id>` | Obtener libro por ID | ✅ Requerida |
| **POST** | `/libros` | Crear nuevo libro | ✅ Requerida |
| **PUT** | `/libros/<id>` | Actualizar libro existente | ✅ Requerida |
| **DELETE** | `/libros/<id>` | Eliminar libro | ✅ Requerida |
| **GET** | `/usuarios` | Listar usuarios (solo admin) | ✅ Requerida |
| **GET** | `/ping` | Comprobación del estado del servidor | ❌ No requerida |

---

## Errores HTTP comunes

| Código | Descripción | Causa posible |
|--------|--------------|----------------|
| **400** | Solicitud incorrecta | Datos faltantes o formato inválido |
| **401** | No autorizado | Token faltante o inválido |
| **403** | Prohibido | Rol no autorizado para la acción |
| **404** | No encontrado | Recurso inexistente |
| **500** | Error interno del servidor | Excepción no controlada |

---

## Estructura del proyecto

```
backend/
│
├── config/
│   └── database.py
│
├── controllers/
│   ├── libros_controller.py
│   └── auth_controller.py
│
├── models/
│   ├── libros_model.py
│   └── usuarios_model.py
│
├── repositories/
│   ├── libros_repository.py
│   └── usuarios_repository.py
│
├── services/
│   ├── libros_service.py
│   └── usuarios_service.py
│
├── main.py
└── requirements.txt
```

---

## Recomendaciones

- Mantén las dependencias actualizadas.
- Usa variables de entorno seguras (nunca subas `.env` al repositorio).
- Considera agregar Swagger o Postman Collection para documentar los endpoints.
- Usa `flask run --reload` para desarrollo y `gunicorn` para producción.

---

##  Autor

**Karen Palacios**  
Repositorio: [https://github.com/kaparepennn/Parcial](https://github.com/kaparepennn/Parcial)

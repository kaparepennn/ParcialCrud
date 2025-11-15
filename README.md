# CrudDATABASE

Este proyecto es una pequeña API en Flask para gestionar usuarios y productos.

Endpoints principales (autenticación):

- POST /registry  -> Registrar usuario. Recibe JSON {"username":"...","password":"...","role":"cliente"}
- POST /login     -> Login. Recibe JSON {"username":"...","password":"..."} y devuelve {"access_token": "..."}

Ejemplos usando curl (asumiendo app corriendo en http://127.0.0.1:5000):

1) Registrar usuario:

```powershell
curl -X POST http://127.0.0.1:5000/registry -H "Content-Type: application/json" -d '{"username":"testuser","password":"secret","role":"cliente"}'
```

2) Login (obtener JWT):

```powershell
curl -X POST http://127.0.0.1:5000/login -H "Content-Type: application/json" -d '{"username":"testuser","password":"secret"}'
```

Respuesta esperada en login:

```json
{"access_token": "<JWT_TOKEN_AQUI>"}
```

3) Usar JWT para ruta protegida (ejemplo /users):

```powershell
curl -X GET http://127.0.0.1:5000/users -H "Authorization: Bearer <JWT_TOKEN_AQUI>"
```

Notas:
- Asegúrate de tener instaladas las dependencias: Flask, SQLAlchemy, python-dotenv, Flask-JWT-Extended, werkzeug.
- La clave JWT está definida en `app.py` en `app.config['JWT_SECRET_KEY']` (cámbiala en producción).

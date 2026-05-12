# **🐾 Red Social de Mascotas 🐾**

Aplicación completa para una red social de mascotas, con backend en NestJS, frontend en Vite + JavaScript Vanilla, persistencia en MongoDB, autenticación con JWT y sistema de roles. Permite registrar mascotas, ver mascotas de otros usuarios, dar likes y consultar un ranking global.

## **🧱 Arquitectura General**

### **Backend (NestJS)**

* API REST modular con controladores, servicios y esquemas.

* Autenticación mediante JWT.

* Roles de usuario: administrador y usuario normal.

* Persistencia en MongoDB usando Mongoose.

* Validaciones con DTOs y class-validator.

* Manejo de errores centralizado.

### **Frontend (Vite + Vanilla JS)**

* Pantallas de registro e inicio de sesión.

* Listado de mascotas.

* Gestión de mascotas propias.

* Sistema de likes.

* Ranking global de mascotas.

### **Base de Datos (MongoDB)**

* Colección users.

* Colección pets.

* Colección likes o historial de likes.

## **⚙️ Instalación y Puesta en Marcha**
### **Requisitos previos**

* Node.js 18+

* MongoDB local o en la nube

* npm o pnpm

### **1. Clonar el repositorio**

```bash
git clone https://github.com/noeBR97/RecuperacionNestJS-RedSocialMascotas.git
```

### **2. Backend (NestJS)**

``cd backend``

``npm install``

Crear archivo ``.env``:

```bash
PORT=4000
MONGO_URI=mongodb://localhost:27017/pet_social
JWT_SECRET=supersecreto
JWT_EXPIRES_IN=1d
```

Iniciar servidor:

``npm run start:dev``

### **3. Frontend (Vite)**

```bash
cd ../frontend
npm install
npm run dev
```

## **🗂️ Modelado de Datos**

### **Usuario (``User``)**

* id (ObjectId)

* username

* email

* password (hash)

* role (``admin`` | ``user``)

### **Mascota (``Pet``)**

* id (ObjectId)

* owner (ref a User)

* name

* species

* age

* description (opcional)

* photoUrl (opcional)

* likesCount

* (Opcional) likes (array de usuarios o historial)

### **Historial de Likes (``Like``)**

* id

* user (ref)

* pet (ref)

* createdAt

## **👤 Gestión de Usuarios y Roles**

### **Registro e inicio de sesión**

* Registro de usuario con rol por defecto ``user``.

* Login que devuelve un JWT.

### **Roles**

* **Administrador:** puede gestionar cualquier mascota.

* **Usuario normal:** solo puede gestionar sus propias mascotas.

### **Protección de rutas**

* Guard de JWT para validar token.

* Guard de Roles para restringir operaciones.

## **🐶 Mascotas y Likes**

### **Mascotas**

* Crear mascota.

* Editar y eliminar mascotas propias.

* Administrador puede gestionar todas.

### **Likes**

* Un usuario puede dar like a mascotas de otros.

* No puede dar más de un like a la misma mascota.

* ``likesCount`` se actualiza automáticamente.

## **🏆 Ranking de Mascotas**

* Ranking global ordenado por número de likes.

* (Opcional) Filtro por especie: ``?species=perro``.

## **🛡️ Autenticación y Seguridad**

## **Flujo**

1. Usuario se registra.

1. Inicia sesión y recibe JWT.

2. El frontend almacena el token.

3. Cada petición protegida incluye:

4. Authorization: Bearer <token>

5. NestJS valida token y rol.

## **🧩 Estructura del Backend**

```bash
backend/
├── src/
│   ├── auth/
│   ├── users/
│   ├── pets/
│   ├── common/
│   └── app.module.ts
└── main.ts
```

## **🖥️ Estructura del Frontend**

```bash
frontend/
├── src/
│   ├── pages/
│   ├── components/
│   ├── services/
│   └── main.js
└── index.html
```

## **⭐ Extras**

* Fotos o URLs de imagen para mascotas.

* Filtro de ranking por especie.

* Historial de likes.

* Sistema de comentarios.

## **🔄 Flujo Completo**

1. Usuario se registra e inicia sesión.

1. Crea una mascota.

2. Otros usuarios ven la mascota y dan likes.

3. El sistema evita likes duplicados.

4. Se consulta el ranking global.

5. Administrador puede gestionar cualquier mascota.

## **📝 Notas Finales**

Proyecto ideal para practicar NestJS, Mongoose, JWT, roles y un cliente ligero con Vite Vanilla.

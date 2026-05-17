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
* Escribir comentarios a las mascotas.

### **Base de Datos (MongoDB)**

* Colección usuarios.
* Colección mascotas.

## **⚙️ Instalación y Puesta en Marcha**

### **Requisitos previos**

* Node.js 18+
* MongoDB local o en la nube
* npm

### **1. Clonar el repositorio**

```bash
git clone https://github.com/noeBR97/RecuperacionNestJS-RedSocialMascotas.git
```

### **2. Backend (NestJS)**

``cd backend``

``npm install``

Crear archivo ``.env``:

```bash
MONGO_URI=mongodb://localhost:27017/nombre-db
JWT_SECRET=tu_palabra_secreta_super_segura
PORT=3000
CLOUDINARY_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

Iniciar seeder:

``npm run seed``

Iniciar servidor:

``npm run start:dev``

### **3. Frontend (Vite)**

```bash
cd frontend
npm install
npm run dev
```

## **🗂️ Modelado de Datos**

### **Usuario**

* id
* nombre
* apellido1
* apellido2
* edad
* nombreUsuario
* email
* clave (hash)
* rol (``admin`` | ``usuario``)

### **Mascota**

* id
* nombre
* especie (enum: Perro, Gato, Conejo, Reptil, Ave, Otro)
* raza
* edad
* fotos
* likes (array)
* dueño (ref a usuario)

## **👤 Gestión de Usuarios y Roles**

### **Registro e inicio de sesión**

* Registro de usuario con rol por defecto ``usuario``.
* Login que devuelve un JWT.

### **Roles**

* **Administrador:** puede gestionar cualquier mascota, comentario o usuario.
* **Usuario normal:** solo puede gestionar sus propias mascotas, dar likes y escribir comentarios.

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
* No puede dar like a tus propias mascotas.

## **🏆 Ranking de Mascotas**

* Ranking global ordenado por número de likes.

## **🛡️ Autenticación y Seguridad**

## **Flujo**

1. Usuario se registra.
2. Inicia sesión y recibe JWT.
3. El frontend almacena el token.
4. Cada petición protegida incluye:
5. Authorization: Bearer <token>
6. NestJS valida token y rol.

## **🧩 Estructura del Backend**

```bash
backend/
├── src/
│   ├── auth/
│   ├── cloudinary/
│   ├── mascotas/
│   ├── seed/
│   ├── usuarios/
│   └── app.module.ts
└── main.ts
```

## **⭐ Extras**

* Fotos o URLs de imagen para mascotas.
* Sistema de comentarios.

## **🔄 Flujo Completo**

1. Usuario se registra e inicia sesión.
2. Crea una mascota.
3. Otros usuarios ven la mascota y dan likes.
4. El sistema evita likes duplicados.
5. Se consulta el ranking global.
6. Administrador puede gestionar cualquier mascota.

## **📝 Notas Finales**

Proyecto ideal para practicar NestJS, Mongoose, JWT, roles y un cliente ligero con Vite Vanilla.

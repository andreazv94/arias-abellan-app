# 🥗 Arias Abellán Nutrición

App de nutrición y entrenamiento personal para gestionar clientes, planes nutricionales y rutinas de ejercicio.

## 🚀 Guía de Instalación Paso a Paso

### Paso 1: Crear cuenta en Supabase (Base de datos GRATIS)

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto (nombre: `arias-abellan-nutricion`)
3. Espera a que se cree (2-3 minutos)
4. Ve a **Settings → API** y copia:
   - `Project URL` (ej: `https://xxxxx.supabase.co`)
   - `anon public` key

### Paso 2: Configurar la Base de Datos

1. En Supabase, ve a **SQL Editor**
2. Copia todo el contenido del archivo `supabase-schema.sql`
3. Pégalo en el editor SQL y haz clic en **Run**
4. ✅ Se crearán todas las tablas automáticamente

### Paso 3: Crear tu Usuario Administrador

1. En Supabase, ve a **Authentication → Users**
2. Clic en **Add user → Create new user**
3. Introduce tu email y contraseña
4. Marca "Auto Confirm User"
5. Ahora ve a **SQL Editor** y ejecuta:

```sql
UPDATE profiles 
SET role = 'admin', full_name = 'Tu Nombre'
WHERE email = 'tu-email@ejemplo.com';
```

### Paso 4: Crear cuenta en GitHub

1. Ve a [github.com](https://github.com) y crea una cuenta
2. Crea un nuevo repositorio (nombre: `arias-abellan-app`)
3. Sube todos los archivos de esta carpeta al repositorio

**Para subir archivos desde tu ordenador:**

```bash
# En la terminal, dentro de la carpeta del proyecto:
git init
git add .
git commit -m "Primera versión"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/arias-abellan-app.git
git push -u origin main
```

### Paso 5: Desplegar en Vercel (GRATIS)

1. Ve a [vercel.com](https://vercel.com) y regístrate con GitHub
2. Clic en **"Add New" → "Project"**
3. Importa tu repositorio `arias-abellan-app`
4. En **Environment Variables**, añade:
   - `VITE_SUPABASE_URL` = tu Project URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` = tu anon key de Supabase
5. Clic en **Deploy**
6. ¡En 2 minutos tu app estará online! 🎉

### Paso 6: Acceder a tu App

Tu app estará disponible en: `https://arias-abellan-app.vercel.app`

Para usar un dominio personalizado como `ariasabellannutricion.com`:
1. Compra el dominio en [namecheap.com](https://namecheap.com) (~10€/año)
2. En Vercel → Settings → Domains → Add
3. Sigue las instrucciones para configurar los DNS

---

## 📱 Cómo Instalar la App en el Móvil

### iPhone:
1. Abre Safari y ve a tu URL
2. Toca el botón de compartir (cuadrado con flecha)
3. Selecciona "Añadir a pantalla de inicio"

### Android:
1. Abre Chrome y ve a tu URL
2. Toca los 3 puntos del menú
3. Selecciona "Añadir a pantalla de inicio"

---

## 👥 Cómo Usar la App

### Como Administrador:

1. **Crear clientes:**
   - Entra con tu cuenta de admin
   - Clic en el botón "+" para añadir cliente
   - El cliente recibirá un email para confirmar su cuenta

2. **Configurar planes nutricionales:**
   - Selecciona un cliente
   - Clic en "Nutrición"
   - Configura cada comida para cada día
   - Guarda los cambios

3. **Configurar entrenos:**
   - Selecciona un cliente con entrenos activados
   - Clic en "Entrenos"
   - Añade días de entrenamiento y ejercicios

### Como Cliente:

1. Entra con el email y contraseña que te dieron
2. Ve tu plan de nutrición día por día
3. Si tienes entrenos, consulta tu calendario

---

## 🛠 Desarrollo Local (Opcional)

Si quieres hacer cambios en el código:

```bash
# Instalar dependencias
npm install

# Crear archivo .env con tus credenciales
cp .env.example .env
# Edita .env y añade tus credenciales de Supabase

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

---

## 📞 Soporte

¿Necesitas ayuda? Contacta con el desarrollador.

---

## 📄 Estructura del Proyecto

```
arias-abellan-app/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Login.jsx
│   │   ├── ClientView.jsx
│   │   └── AdminView.jsx
│   ├── hooks/
│   │   └── useAuth.js
│   ├── lib/
│   │   └── supabase.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── index.html
├── package.json
├── supabase-schema.sql
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── README.md
```

---

© 2025 Arias Abellán Nutrición

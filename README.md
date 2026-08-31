# Sistema de Gestión de Productos e Inventario - Frontend (React + Vite)

Frontend del **Sistema de Gestión de una Distribuidora**. Aplicación web SPA que permite la gestión integral de productos e inventario: administración de **marcas**, **líneas** y **sub-líneas**, cálculo automático de **precios por margen**, control de **stock** y **alertas de stock bajo**. Incluye además gestión de clientes, proveedores, personal, usuarios y condiciones de IVA, con autenticación por roles.

Consume la API definida en el backend (`base-gestion-t`).

---

## Stack tecnológico

- **React 19** + **TypeScript 5.7**
- **Vite 6** (build tool y dev server)
- **React Router DOM 7** (enrutado)
- **Axios** (consumo de la API)
- **Tailwind CSS 3.4** + **shadcn/ui** + **Radix UI** (UI y componentes)
- **ag-grid-community / ag-grid-react** (tablas de datos)
- **React Hook Form + Yup + @hookform/resolvers** (formularios y validación)
- **react-number-format / react-select / react-paginate** (entradas, selects y paginación)
- **Recharts** (gráficos y dashboard)
- **Jotai** (estado global), **jwt-decode** (decodificación de tokens)
- **@react-oauth/google** + **@greatsumini/react-facebook-login** (login social)
- **framer-motion** (animaciones), **lucide-react / heroicons** (iconos)
- **Gestor de paquetes**: Yarn

---

## Instalación

### Requisitos previos

Antes de comenzar, asegurarse de tener instaladas las siguientes herramientas:

- **Node.js**: versión 18 o superior.
- **Yarn**: gestor de dependencias utilizado por el proyecto.
- **Git**: para clonar el repositorio.

Se puede verificar la instalación ejecutando:

```bash
node --version
yarn --version
git --version
```

> Se recomienda tener el **backend corriendo** (local o accediendo al de Render) antes de levantar el frontend, ya que la aplicación depende de la API para funcionar correctamente.

### 1. Clonar el repositorio

```bash
git clone https://github.com/gabrieldiaz8/Proyecto1_Front.git
cd Proyecto1_Front
```

### 2. Instalar dependencias

```bash
yarn install
```

### 3. Variables de entorno

El frontend usa variables de entorno de Vite (prefijo `VITE_`). El repositorio ya incluye dos archivos:

- `.env.development` → valores para el entorno de desarrollo (ya incluido en el repo)
- `.env.production` → valores para el entorno de producción (ya incluido en el repo)

La única variable utilizada es:

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API del backend (con prefijo `/api`). En desarrollo apunta a `http://localhost:3000/api` y en producción a la URL de Render. |

> **Nota:** a diferencia del backend, estos `.env` sí están versionados en el repositorio. Esto es intencional porque `VITE_API_URL` no es un dato sensible (es una URL pública), y Vite la incorpora al bundle en tiempo de build. Si necesitás apuntar a otra URL de API sin modificar los archivos del repo, podés crear un `.env.local` (ignorado por git) que sobrescribe los valores anteriores:

```env
VITE_API_URL="http://localhost:3000/api"
```

### 4. Levantar el proyecto en desarrollo

```bash
yarn dev
```

El dev server se levanta en `http://localhost:5173` (opción `--host` habilitada y puerto 5173 configurado en `vite.config.ts`).

### Otros scripts

```bash
yarn build      # Compilar para producción
yarn preview    # Previsualizar el build
yarn lint       # Ejecutar ESLint
```

---

## Estructura del proyecto

```
src/
├── main.tsx               # Punto de entrada (providers globales: tema, filtros, catálogos, Google)
├── App.tsx                # Definición de rutas (Router)
├── pages/                 # Páginas principales: login, home, dashboard, administración
├── componentes/
│   ├── ui/                # Componentes base de UI tipo shadcn (Button, Dialog, Select, Tabla...)
│   ├── gestion-producto/  # CRUD de marcas, líneas, productos, precios (cambio masivo, lista de precios)
│   ├── gestion-organizacion/  # CRUD de clientes, proveedores, personal, localidades, condiciones IVA
│   ├── gestion-usuario/   # Autenticación, registro, gestión de usuarios y contraseñas
│   ├── herramientas/      # Formateo de campos (cuit, precio, porcentaje), funciones reutilizables
│   └── navbar.tsx / sidebarFiltros.tsx  # Navegación y barra de filtros
├── interfaces/            # Tipos e interfaces (generales, gestión-producto, gestión-organización, usuarios)
├── config/                # Configuración de filtros, paginación y versionado
├── context/               # Contextos globales (catálogos, filtros, cabecera de documento)
├── hooks/                 # Hooks reutilizables (paginación, filtros)
└── utils/                 # Cliente API (axios), auth, CRUD factory, enrutado privado por roles
```

Cada módulo de gestión sigue una convención con carpetas `componentes/`, `hooks/`, `interfaces/`, `modales/`, `services/` y `utils/`.

---

## Troubleshooting (problemas comunes)

- **El frontend carga pero no trae datos**: verificar que `VITE_API_URL` apunte a un backend activo (local o donde esté desplegado) y que la ruta incluya el prefijo `/api`.
- **Error de CORS en consola**: confirmar que la URL desde la que se sirve el frontend esté habilitada en la configuración de CORS del backend (`main.ts`).
- **Puerto 5173 ocupado**: Vite intentará usar el siguiente puerto disponible automáticamente, o se puede indicar otro con `yarn dev --port <puerto>`.
- **Cambié `VITE_API_URL` y no se refleja**: las variables de entorno de Vite se leen al iniciar el proceso; reiniciar `yarn dev` después de modificar el `.env`.
- **Login con Google/Facebook no funciona en local**: revisar que los dominios de callback estén configurados en las credenciales OAuth para `http://localhost:5173`.

---

## URL de despliegue

El frontend está publicado en **Render**:

```
https://proyecto1-front-ez30.onrender.com
```
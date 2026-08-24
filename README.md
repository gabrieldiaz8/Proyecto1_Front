# Base Gestión T - Frontend

Sistema de gestión empresarial (tipo ERP) para distribuidoras. Permite administrar ventas, compras, stock, cobros, pagos, operaciones bancarias y más.

---

## Tabla de Contenidos

- [Tecnologías](#tecnologías)
- [Requisitos previos](#requisitos-previos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Variables de entorno](#variables-de-entorno)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Módulos principales](#módulos-principales)
- [Rutas](#rutas)
- [Autenticación y roles](#autenticación-y-roles)
- [Docker](#docker)

---

## Tecnologías

| Tecnología | Versión |
|---|---|
| React | 19.0.0 |
| TypeScript | 5.7.2 |
| Vite | 6.1.0 |
| React Router DOM | 7.2.0 |
| Tailwind CSS | 3.4.1 |
| Radix UI / shadcn-ui | - |
| React Hook Form + Yup | 7.54.2 / 1.6.1 |
| AG Grid | 33.3.2 |
| Axios | 1.8.4 |
| Jotai | 2.15.0 |
| Recharts | 2.15.3 |
| Framer Motion | 12.4.10 |

---

## Requisitos previos

- Node.js >= 20
- npm >= 9

---

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Lint
npm run lint
```

El servidor de desarrollo corre en `http://localhost:5173` por defecto.

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API backend | `http://localhost:3000/api` |

Archivos disponibles:
- `.env.development` — entorno de desarrollo
- `.env.production` — entorno de producción

---

## Estructura del proyecto

```
src/
├── App.tsx                  # Configuración de rutas principal
├── pages/                   # Páginas principales (login, home, admin, dashboard)
├── componentes/             # Módulos de negocio
│   ├── gestion-banco/
│   ├── gestion-cobros-pagos/
│   ├── gestion-compra/
│   ├── gestion-gastos/
│   ├── gestion-notificaciones/
│   ├── gestion-organizacion/
│   ├── gestion-producto/
│   ├── gestion-stock/
│   ├── gestion-usuario/
│   ├── gestion-venta/
│   ├── herramientas/
│   ├── menu/
│   ├── sistema/
│   └── ui/
├── interfaces/              # Tipos e interfaces TypeScript globales
├── utils/                   # Utilidades (PrivateRoute, helpers)
└── assets/                  # Imágenes y recursos estáticos
```

Cada módulo dentro de `componentes/` sigue una estructura interna consistente:

```
modulo/
├── components/   # Componentes visuales
├── hooks/        # Custom hooks
├── interfaces/   # Tipos del módulo
├── modals/       # Modales
├── services/     # Llamadas a la API (axios)
└── utils/        # Funciones auxiliares y vistas de consulta
```

---

## Módulos principales

### gestion-organizacion
Entidades base del sistema: clientes, proveedores, personal, bancos, cuentas bancarias, localidades, condiciones de IVA, familia de bancos.

### gestion-producto
Gestión del catálogo: productos, marcas, líneas, sublíneas, superlíneas, presentaciones, unidades de medida y precios (incluyendo cambio masivo de precios).

### gestion-stock
Control de inventario: ajustes de stock y motivos de ajuste.

### gestion-venta
Ciclo de ventas completo: presupuestos, pedidos, facturas, remitos, notas de crédito y débito. Incluye vista mobile para pedidos.

### gestion-compra
Ciclo de compras: pedidos de compra, carga de compra y facturas de compra.

### gestion-cobros-pagos
Cobros y pagos: recibos de venta, carteras (cheques y cupones), tarjetas de crédito, órdenes de pago, libro de caja y movimientos de caja.

### gestion-banco
Operaciones bancarias: retenciones, tipos de retención, tipos de movimiento bancario y motivos de devolución de cheques.

### gestion-gastos
Registro de gastos y sus motivos.

### gestion-notificaciones
Sistema de notificaciones internas por usuario.

### gestion-usuario
Administración de usuarios del sistema.

---

## Rutas

| Ruta | Descripción | Roles permitidos |
|---|---|---|
| `/` | Página de inicio | Público |
| `/login` | Inicio de sesión | Público |
| `/admin` | Panel de administración | Autenticado |
| `/admin/dashboard` | Dashboard principal | Todos |
| `/admin/productos` | Gestión de productos | ADMINISTRADOR, ROOT |
| `/admin/marcas` | Gestión de marcas | ADMINISTRADOR, ROOT |
| `/admin/lineas` | Líneas de producto | ADMINISTRADOR, ROOT |
| `/admin/sublineas` | Sublíneas de producto | ADMINISTRADOR, ROOT |
| `/admin/superlineas` | Superlíneas | ADMINISTRADOR, ROOT |
| `/admin/presentaciones` | Presentaciones | ADMINISTRADOR, ROOT |
| `/admin/unidades-medida` | Unidades de medida | ADMINISTRADOR, ROOT |
| `/admin/cambio-precios-masivo` | Cambio masivo de precios | ADMINISTRADOR, ROOT |
| `/admin/clientes` | Gestión de clientes | ADMINISTRADOR, EMPLEADO, ROOT |
| `/admin/proveedores` | Gestión de proveedores | ADMINISTRADOR, ROOT |
| `/admin/personal` | Gestión de personal | ADMINISTRADOR, ROOT |
| `/admin/bancos` | Bancos | ADMINISTRADOR, ROOT |
| `/admin/cuentas-bancarias` | Cuentas bancarias | ADMINISTRADOR, ROOT |
| `/admin/familia-banco` | Familia de bancos | ADMINISTRADOR, ROOT |
| `/admin/localidades` | Localidades | ADMINISTRADOR, ROOT |
| `/admin/condicion-iva` | Condiciones de IVA | ADMINISTRADOR, ROOT |
| `/admin/ajuste-stock` | Ajustes de stock | ADMINISTRADOR, ROOT |
| `/admin/motivo-ajuste-stock` | Motivos de ajuste | ADMINISTRADOR, ROOT |
| `/admin/factura-venta` | Facturas de venta | ADMINISTRADOR, EMPLEADO, ROOT |
| `/admin/presupuesto-venta` | Presupuestos | ADMINISTRADOR, EMPLEADO, ROOT |
| `/admin/pedido-venta` | Pedidos de venta | ADMINISTRADOR, EMPLEADO, VENDEDOR, ROOT |
| `/admin/pedido-venta-mobile` | Pedidos mobile | VENDEDOR |
| `/admin/remito-venta` | Remitos | ADMINISTRADOR, ROOT |
| `/admin/nota-credito-venta` | Notas de crédito | ADMINISTRADOR, ROOT |
| `/admin/nota-debito-venta` | Notas de débito | ADMINISTRADOR, ROOT |
| `/admin/pedido-compra` | Pedidos de compra | ADMINISTRADOR, ROOT |
| `/admin/carga-compra` | Carga de compra | ADMINISTRADOR, ROOT |
| `/admin/factura-compra` | Facturas de compra | ADMINISTRADOR, ROOT |
| `/admin/recibo-venta` | Recibos de venta | ADMINISTRADOR, COBRADOR, ROOT |
| `/admin/cartera-cheques` | Cartera de cheques | ADMINISTRADOR, ROOT |
| `/admin/cartera-cupones` | Cartera de cupones | ADMINISTRADOR, ROOT |
| `/admin/tarjetas` | Tarjetas de crédito | ADMINISTRADOR, ROOT |
| `/admin/libro-caja` | Libro de caja | ADMINISTRADOR, ROOT |
| `/admin/motivo-movimiento-caja` | Motivos mov. caja | ADMINISTRADOR, ROOT |
| `/admin/retenciones` | Retenciones | ADMINISTRADOR, ROOT |
| `/admin/tipo-retencion` | Tipos de retención | ADMINISTRADOR, ROOT |
| `/admin/tipo-movimiento-bancario` | Tipos mov. bancario | ADMINISTRADOR, ROOT |
| `/admin/motivo-devolucion-cheque` | Motivos dev. cheque | ADMINISTRADOR, ROOT |
| `/admin/motivo-gasto` | Motivos de gasto | ADMINISTRADOR, ROOT |
| `/admin/motivo-notificacion` | Motivos notificación | ADMINISTRADOR, ROOT |
| `/admin/usuarios` | Usuarios | ROOT |
| `/admin/confirmar-pedido-masivo` | Confirmación masiva pedidos | ADMINISTRADOR, ROOT |

---

## Autenticación y roles

La autenticación usa JWT. El token se decodifica con `jwt-decode` y se soporta login con Google OAuth y Facebook.

Roles disponibles:

- `ROOT` — acceso total
- `ADMINISTRADOR` — gestión completa del sistema
- `EMPLEADO` — acceso a ventas y clientes
- `VENDEDOR` — pedidos de venta (incluyendo mobile)
- `COBRADOR` — recibos de venta
- `REPOSITOR` — operaciones de stock
- `REPARTIDOR` — operaciones de reparto

Las rutas protegidas usan el componente `PrivateRoute` ubicado en `src/utils/PrivateRoute.tsx`.

---

## Docker

El proyecto incluye un `Dockerfile` orientado a desarrollo:

```bash
# Build de la imagen
docker build -t base-gestion-t-front .

# Correr el contenedor
docker run -p 5173:5173 base-gestion-t-front
```

- Imagen base: `node:20-alpine`
- Puerto expuesto: `5173`
- Incluye `inotify-tools` para hot reload dentro del contenedor

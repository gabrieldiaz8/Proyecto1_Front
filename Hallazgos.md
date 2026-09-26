![][image1]  
**Facultad Regional de Villa María**  
Ingeniería en Sistemas de Información  
Ingeniería y Calidad de Software \- Programación Avanzada

**Proyecto 1**  
Entrega 3 \- Borrador  
Auditoría de Consistencia: Dominio vs. Implementación

**Docentes:**   
Vanzetti, Juan Jose  
Tosselli, Laura 

**Grupo: 6**  
**Integrantes (nombre \- email \- legajo):**   
Barrionuevo Halavacs, Imanol \- [barrionuevoimanol@gmail.com](mailto:barrionuevoimanol@gmail.com) \- 15.889  
Broilo, Mateo José \- [broilomateo@gmail.com](mailto:broilomateo@gmail.com) \- 16.191  
Díaz, Gabriel \- [gabidiaz4231@gmail.com](mailto:gabidiaz4231@gmail.com) \- 16.117  
Gambino, Tomás \- [tomigambino21@gmail.com](mailto:tomigambino21@gmail.com) \- 15.870  
Gonzalez Meyer, Lorenzo \- [gonzalez.lorenzo2311@gmail.com](mailto:gonzalez.lorenzo2311@gmail.com) \- 16.186  
 

**Fecha de entrega:** 03/09/2026  
**Año de Cursado:** 2026

***ÍNDICE***

[**Introducción	3](#introducción)**

[**Auditoría de Consistencia: Dominio vs. Implementación	4**](#auditoría-de-consistencia:-dominio-vs.-implementación)

[Análisis del Backend	4](#análisis-del-backend)

[Análisis del Frontend	7](#análisis-del-frontend)

[Reflexión Priorizada \[Pendiente\]	9](#reflexión-priorizada-[pendiente])

[Backlog de Evolución de la Documentación de Dominio \[Pendiente\]	10](#backlog-de-evolución-de-la-documentación-de-dominio-[pendiente])

# ***Introducción*** {#introducción}

El presente Trabajo Práctico “Proyecto 1”, correspondiente a las asignaturas Ingeniería y Calidad de Software y Programación Avanzada, tiene como propósito aplicar conceptos de diseño, desarrollo y gestión de proyectos de software sobre un caso real de negocio: el Sistema de Gestión de Productos e Inventario.  
El sistema está orientado a administrar productos, precios y stock dentro de un negocio, integrando reglas propias del dominio comercial, como el cálculo del precio a partir de costo y margen, o la detección automática de stock bajo, con una implementación desarrollada bajo un enfoque de Domain-Driven Design (DDD).  
Tal como se plantea en el trabajo, el proyecto no se limita a la escritura de código, sino que exige un proceso de análisis, modelado y evolución continua del sistema a lo largo de sucesivas entregas, incorporando además prácticas de Ingeniería de Software como planificación, testing automatizado, métricas de calidad y gestión de deuda técnica.  
En esta etapa, correspondiente a la “Entrega 3 \- Auditoría de Consistencia: Dominio vs. Implementación”, el objetivo fue comparar el Análisis de Dominio elaborado previamente contra la implementación real del sistema (frontend y backend), con el fin de detectar los puntos en los que el código se aparta del modelo documentado. Para ello se llevó a cabo:

* Revisión del código completo del backend y del frontend, contrastándolo contra las entidades, reglas de negocio y decisiones de diseño descriptas en el Análisis de Dominio.  
* Registro y clasificación de cada diferencia encontrada, según las categorías definidas en la consigna (documentación sin implementar, implementación sin documentar, reglas no expuestas en la interfaz, reglas mal ubicadas y deuda técnica reconocida).  
* Elaboración de un backlog de evolución de la documentación de dominio, priorizando los cambios propuestos según una matriz de impacto y esfuerzo.

# ***Auditoría de Consistencia: Dominio vs. Implementación*** {#auditoría-de-consistencia:-dominio-vs.-implementación}

Para la clasificación de los hallazgos se utilizaron las siguientes categorías:

| Categoría | Título | Descripción |
| :---: | ----- | ----- |
| **A** | **Documentado pero no implementado** | El Análisis de Dominio plantea algo que ni el backend ni el frontend implementan. |
| **B** | **Implementado pero no documentado** | El código (backend o frontend) resuelve algo que el Análisis de Dominio nunca menciona. |
| **C** | **Existe en el back pero no se expone en el front** | La regla está resuelta en el backend, pero la interfaz no la consulta ni la muestra al usuario. |
| **D** | **Regla mal ubicada (antipatrón anémico)** | La regla de negocio existe, pero no vive en la entidad de dominio correspondiente, sino en otro lugar del código (controller, componente, etc.). |
| **E** | **Deuda técnica reconocida** | Simplificación consciente y aceptada respecto al modelo documentado. |
| **F** | **Otra** | Cualquier hallazgo relevante que no encaje en las categorías anteriores. |

A continuación se detallan los hallazgos encontrados:

## ***Análisis del Backend*** {#análisis-del-backend}

| \# | Hallazgo | Cat. | Archivos | Justificación |
| :---: | :---- | :---: | :---- | :---- |
| **1** | No se respeta correctamente el lenguaje ubicuo.  | F | producto.entity.ts | En el lenguaje se habla de “Margen”, pero en el código, la entidad de producto utiliza “porcentaje”. |
| **2** | No se respeta correctamente el lenguaje ubicuo.  | F | producto.entity.ts | En el lenguaje se habla de “Stock actual”, pero en el código, la entidad de producto utiliza únicamente “stock”. |
| **3** | Se menciona Movimientos de stock como responsabilidad del contexto de Inventario y no existe en el código. | A | N/A | No existe ninguna implementación de movimientos de stock en el código actual, pero sí está mencionado como una responsabilidad de Inventario. |
| **4** | Atributos extras a los mencionados en el análisis en la entidad de Producto. | B | producto.entity.ts | Los atributos mencionados en el análisis son id, marca, línea, denominación, costo, margen, stockActual, stockMinimo, mientras que los que están definidos en el código son id, denominacion, marca, linea, costo, stock, stockMinimo, precio, precioDolar, alicuotaIva, entre otros. |
| **5** | Ajustar stock no está conectado con el sistema. | A | producto.service.ts | Si bien el método de ajustarStock() está implementado junto con incrementarStock() y decrementarStock(), no existe ningun endpoint ni función para acceder a ellos y modificar realmente el stock de un producto. |
| **6** | Ajustar stock de un producto no requiere motivo cuando debería pedirlo. | A |  | Si bien indicamos que el ajuste de stock no está conectado con el resto del sistema, tampoco se solicita motivo como lo indica la documentación. |
| **7** | Método calcularPrecio() no implementado, la entidad producto es anémica.  | A |  | El análisis especifica qué Producto debe tener este método, pero no existe en la entidad ni en el servicio. |
| **8** | Precio como campo primitivo en lugar de Value Object | E  |  | El análisis sugiere modelar Precio como VO pero reconoce que mantenerlo como atributo primitivo es una "decisión de diseño abierta a debate" que "simplica el modelo inicial". El código tiene @MonetarioColumn() precio como field primitivo. |
| **9** | Margen completamente ausente. | A |  | El análisis lo lista como VO candidato, pero el entity no tiene campo margen (solo porcentaje). |
| **10**  | Entidad MovimientoStock completamente ausente  | A |  | El análisis define esta entity con atributos id, productoId, tipoMovimiento, cantidad, fecha, motivo y tipos de movimiento (Compra, Venta, Devolución, Ajuste). El código no tiene esta entity. Existe  ProductoOperacion pero con propósito diferente (operaciones generales producto/servicio). |
| **11** | Precio implementado como field primitivo  | E |  | El análisis lo sugiere como VO pero acepta la simplificación de campo primitivo. El código lo tiene como @MonetarioColumn() precio. |
| **12** | El stock puede ser negativo. | E |  | El stock no debería de poder ser negativo,  |
| **13** | Hay muchos módulos sin uso, es decir, código muerto. | F |  | Todos los \*-operación están creados pero no tienen implementación alguna, no se usan en ningún lado. |
| **14** | Registro de compras, ventas y devoluciones no exiten. | A |  | Vemos que el sistema debe poder registrar estos movimientos pero dichas funciones no están implementadas. |
| **15** | No existe ninguna referencia a cómo actualizar el stock, es decir, stockActualizado no existe. | A |  | El análisis menciona que StockActualizado se lanza cada vez que cambia el stock pero dicho método no está implementado en ningún lugar. |
| **16** | No hay patrón CQRS, por lo que no tenemos reportes de Listas de Precios o Productos con stock bajo. | A |  | No vemos ningún endpoint que devuelva algo de lo dicho, lo cual es mencionado en el análisis. |
| **17** | El precio se almacena directo en el campo precio de la entidad, no es un cálculo. No tenemos, como ya mencionamos, el método calcularPrecio() implementado.  | E |  | Lo ponemos como deuda técnica ya que el análisis nos plantea esto como una posible evolución, diciendo: “Aplicar el CQRS de formar más estricta” |
| **18** | Entidad producto anémica. Además hay lógica de negocio que vive en el service, no en la entity. | D | Product.service Product.entity | En el análisis se detalla que debemos tener entidades con comportamiento rico. El código tiene una entidad anémica y la lógica de algunos comportamientos viven en el service.  |
| **19** | El método estaBajoMinimo() no existe en el código. Están los campos en la entidad, pero no hay lógica que los implemente. | A | Product.service Product.entity | No existe la detección de stock bajo ni tampoco está implementado el evento StockBajo. |
| **20** | No existe la entidad “MovimientoStock”, la cuál está definida en el análisis para registrar el historial de todo movimiento en el campo “stockActual” de Producto. Además que la entidad “ProductoOperación” queda “muerta” ya que no se utiliza. | A | Product.entity ProductoOperación | La entidad “MovimientoStock” y todo el historial y trazabilidad que describe el análisis no existe. Lo único que hay es el campo stock sin historial, |

## ***Análisis del Frontend*** {#análisis-del-frontend}

| \# | Hallazgo | Cat. | Archivos | Justificación |
| :---: | :---- | :---: | :---- | :---- |
| **21** | Uso del término genérico porcentaje en lugar del atributo de dominio margen dentro de las interfaces TypeScript. | B | interfaces-producto.tsx:19 | El frontend pierde la semántica del dominio al no utilizar la propiedad definida en el análisis. |
| **22** | Lógica de cálculo de precios desvinculada del formulario. El cálculo no se ejecuta en la pantalla de alta/edición y se ingresan valores manualmente. | D-C | registrar-actualizar-producto.tsx:366–388 services/producto-service.tsx:47-109 | Permite la carga arbitraria de precios en la UI, ignorando la regla automatizada basada en costo y margen. |
| **23** | Omisión de la regla estaBajoMinimo() en la interfaz. No se calcula ni muestra la alerta visual cuando stockActual \&le; stockMinimo. | C | componentes/datos-card.tsx:59-61 producto/interfaces-producto.tsx | La UI solo resalta stocks negativos, ignorando la regla de negocio sobre el umbral de stock mínimo. |
| **24** | Sin integración para eventos StockBajo y StockActualizado. El frontend no incluye mecanismos para recibir o mostrar estas alertas. | A | N/A | Imposibilidad de reaccionar en tiempo real ante eventos de inventario definidos en la arquitectura. |
| **25** | Modal de Ajuste de Stock no renderizado en la interfaz. El estado y los métodos existen pero carecen de representación en el JSX. | A | producto-modales.tsx:54-83 use-producto-modales.ts | Impide al usuario registrar o consultar movimientos de stock desde el módulo de gestión de productos. |
| **26** | Falta de modelado para tipos de movimiento de stock. La interfaz solo reconoce el tipo genérico AJUSTE\_STOCK. | A | interfaces-generales.tsx:137–168 | No se representan en el cliente los cinco tipos de movimientos requeridos por el dominio (compras, ventas, devoluciones, etc.). |
| **27** | Falta de validación para evitar stock negativo en el formulario. El esquema Yup no Restringe valores menores a cero. | D | interfaces-validaciones-producto.tsx:66 datos-card.tsx:59-61 | Permite enviar formularios con stock negativo sin validación previa en la capa de presentación. |
| **28** | Estructura extendida no documentada en Lista de Precios. La pantalla expone cuatro precios con IVA no mencionados en el análisis. | B | interfaces-producto.tsx:109-122 lista-precios.tsx | La interfaz implementa un modelo complejo con múltiples segmentos de precio e IVA, difiriendo de la lista simple documentada. |
| **29** | Campo alicuotaIva obligatorio en el formulario de producto sin estar especificado en el modelo de dominio. | B | interfaces-validaciones-producto.tsx:27, 90-94 registrar-actualizar-producto.tsx:402-446 | Añade reglas impositivas en la UI que no forman parte de la especificación conceptual del dominio. |
| **30** | Lista de precios implementada como pantalla de edición masiva, fusionando el modelo de lectura con el de escritura. | F | [useCambioPrecios.ts](http://useCambioPrecios.ts) lista-precios-service.tsx | Mezcla operaciones de consulta y modificación en una sola vista, contradiciendo la separación planteada por el dominio. |
| **31** | Regla de motivo obligatorio para ajuste de stock no expuesta en la pantalla de gestión de productos. | C | modales/producto-modales.tsx | Aunque el servicio backend requiere el motivo, la interfaz no ofrece la vista para capturarlo y validarlo. |
| **32** | Campos cantidadPorPack y utilizaPack implementados en la UI sin figurar en la documentación. | B | registrar-actualizar-producto.tsx:490–505 interfaces-producto.tsx:52-54 | Atributos adicionales de empaquetado que no están integrados formalmente en el modelo de dominio. |
| **33** | Validación "precio \&ge; costo" acoplada al esquema Yup del cliente en lugar de residir en el backend. | D | interfaces-validaciones-producto.tsx:68-72 | Ubicación inadecuada de la regla de negocio, haciendo vulnerables otros posibles puntos de entrada o clientes de la API. |
| **34** | Propiedad sistema en Producto para restringir la edición de campos, no documentada en el análisis. | B | interfaces-producto.tsx:42 registrar-actualizar-producto.tsx:318, 331, 372 | Lógica de interfaz que bloquea la edición según el origen del producto sin estar definida en las reglas del negocio. |

## ***Reflexión Priorizada \[Pendiente\]*** {#reflexión-priorizada-[pendiente]}

…

## ***Backlog de Evolución de la Documentación de Dominio \[Pendiente\]*** {#backlog-de-evolución-de-la-documentación-de-dominio-[pendiente]}

| \# | Cambio Propuesto | Tipo | Basado en qué hallazgo (\#) | Impacto | Esfuerzo | Prioridad Resultante |
| :---: | :---- | :---- | ----- | :---- | :---- | :---- |
| **1** |  |  |  |  |  |  |
| **2** |  |  |  |  |  |  |
| **3** |  |  |  |  |  |  |
| **4** |  |  |  |  |  |  |

[image1]: <data:image/png;base64,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>
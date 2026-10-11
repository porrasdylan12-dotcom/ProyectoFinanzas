# Lista de Verificación de Accesibilidad - Proyecto Finanzas

- [x] HTML Semántico: Se utiliza una estructura correcta y significativa (`<header>`, `<main>`, `<nav>`, `<section>`).

- [x] Jerarquía de Encabezados: Cada página cuenta con un único `<h1>` y los subtítulos respetan el orden lógico (`<h2>`, `<h3>`), sin saltos de nivel.

- [x] Roles, Estados y Atributos ARIA: Se implementan atributos como `aria-label` en la navegación, `aria-current="page"` para la página activa, y `aria-invalid="true"` junto con `role="alert"` para el manejo de errores en formularios.

- [x] Formulario Accesible:** Los campos de entrada cuentan con `<label>` asociados mediante el atributo `for`. Se utilizan validaciones nativas de HTML y `<fieldset>` con `<legend>` para agrupar información. Los botones e inputs deshabilitados (`disabled`) previenen la interacción mediante CSS y HTML.

- [x] Adaptabilidad (Zoom 200%): El uso exclusivo de unidades relativas (`rem`) y la corrección de desbordamientos (`min-width: 0`) garantizan que la interfaz crezca proporcionalmente y siga siendo utilizable si la persona usuaria configura la fuente de su navegador al 200%.

- [x] Navegación por Teclado: La interfaz es 100% operable usando la tecla `Tab`. El selector `:focus-visible` garantiza un indicador de foco claro (contorno dorado de 2px con separación) para todos los elementos interactivos.

- [x] Contraste de Color: La paleta de colores oscuros aplicada mediante propiedades personalizadas cumple con el ratio de contraste mínimo (WCAG AA / AAA), verificando la legibilidad del texto claro sobre fondos profundos.

- [x] Ocultamiento Accesible: Se emplea la clase `.sr-only` para ocultar elementos visualmente (como checkboxes de menú) sin eliminarlos de los lectores de pantalla.
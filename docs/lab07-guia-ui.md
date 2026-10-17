# LABORATORIO 7 - Guía de interfaz del proyecto

Definición de la interfaz de **ProyectoFinanzas**: paleta de color con contraste verificado, tipografía y escala tipográfica, espaciado y estados de los componentes. Todos los valores de este documento se extrajeron de un prototipo predefinido previamente.

**Criterio de conformidad: WCAG 2.2 nivel AA.**

- Texto normal: ≥ 4.5:1 (SC 1.4.3)
- Texto grande (≥ 24px, o ≥ 18.66px en negrita): ≥ 3:1
- Bordes de controles e indicadores: ≥ 3:1 contra el fondo adyacente (SC 1.4.11)
- El color nunca es el único medio de transmitir información (SC 1.4.1)

Las ratios de contraste de este documento están medidas con la fórmula de WCAG sobre los valores hexadecimales indicados. Cualquier token nuevo debe verificarse antes de incorporarse al tema.

---

## Bases de la interfaz

Estas son las decisiones sobre las que se construye toda la interfaz del proyecto:

1. **Identidad financiera editorial.** Fondo verde profundo, acento oro y tipografía serif para titulares. La interfaz debe leerse como un documento financiero cuidado, no como un panel de administración.
2. **Cifras como Protagonistas.** Todo importe, fecha y porcentaje usa IBM Plex Mono con cifras tabulares. Las columnas de dinero quedan alineadas en todo momento, incluso al agregar o eliminar filas.
3. **Jerarquía por peso y color, no por tamaño.** Los títulos se distinguen por `font-weight` 600 y por familia serif; el cuerpo permanece en 400. El tamaño se reserva para los dos datos dominantes de la pantalla.
4. **Profundidad por superficie, nunca por sombra.** Las cuatro superficies del sistema (fondo, hundida, panel, panel alternativo) generan la sensación de profundidad. No se usan sombras difusas.
5. **Oscuro como modo principal, claro como equivalente.** Ambos modos están definidos con las mismas relaciones semánticas de token y con contraste verificado de forma independiente.
6. **Semántica del color centrada en el dinero.** El oro marca acción y foco; el verde marca ingreso; el rojo marca gasto y error. Ninguno se usa como decoración.
7. **Estado siempre explícito.** Todo componente interactivo define normal, foco, error y deshabilitado. Ningún estado se comunica solo por color.

---

## 1. Paleta de color con contraste verificado

### 1.1 Superficies

El sistema define cuatro superficies con una relación de profundidad explícita: el contenido se hunde respecto del panel, nunca al revés.

**Modo oscuro (principal)**

| Superficie          | Variable Tailwind | Hex       | Uso                                |
| ------------------- | ----------------- | --------- | ---------------------------------- |
| Fondo de aplicación | `--background`    | `#12201A` | Lienzo de la página                |
| Superficie hundida  | `--input`         | `#0D1712` | Campos, barras de progreso         |
| Panel / tarjeta     | `--card`          | `#1B2B22` | Tarjetas, tablas, menús, diálogos  |
| Panel alternativo   | `--muted`         | `#21332A` | Encabezado de tabla, hover de fila |

Sobre el fondo se aplica un halo decorativo: `radial-gradient(ellipse 900px 500px at 15% -10%, rgba(203,161,53,0.08), transparent 60%)`. No reduce el contraste del texto: su opacidad máxima es 8% y ocupa la zona superior, donde solo vive el encabezado.

**Modo claro**

| Superficie          | Variable Tailwind | Hex       |
| ------------------- | ----------------- | --------- |
| Fondo de aplicación | `--background`    | `#F6F4EC` |
| Superficie hundida  | `--input`         | `#FDFCF8` |
| Panel / tarjeta     | `--card`          | `#FFFFFF` |
| Panel alternativo   | `--muted`         | `#EFEBDF` |

### 1.2 Tokens de color — modo oscuro

Las columnas de contraste muestran la ratio real medida contra cada superficie.

| Token                | Variable               | Hex                      | vs `--background` | vs `--card` | vs `--muted` | vs `--input` | Nivel        |
| -------------------- | ---------------------- | ------------------------ | ----------------- | ----------- | ------------ | ------------ | ------------ |
| Texto principal      | `--foreground`         | `#ECE7D6`                | 13.60             | 11.99       | 10.80        | 14.78        | AAA          |
| Texto secundario     | `--muted-foreground`   | `#B9C2B4`                | 9.17              | 8.08        | 7.28         | 9.96         | AAA          |
| Texto atenuado       | `--fg-mute`            | `#8A9C8C`                | 5.78              | 5.10        | 4.59         | 6.28         | AA           |
| Primario (oro)       | `--primary`            | `#CBA135`                | 6.97              | 6.14        | 5.53         | 7.57         | AA           |
| Texto sobre primario | `--primary-foreground` | `#1B1503`                | 7.52 sobre oro    | —           | —            | —            | AAA          |
| Ingreso              | `--income`             | `#6FAE8C`                | 6.50              | 5.73        | 5.16         | 7.06         | AA           |
| Gasto (texto)        | `--destructive`        | `#E38268`                | 6.14              | 5.41        | 4.87         | 6.67         | AA           |
| Gasto (gráfico)      | `--expense-fill`       | `#C1573E`                | 3.77              | 3.32        | 2.99         | 4.09         | Solo gráfico |
| Anillo de foco       | `--ring`               | `#E8C468`                | 10.04             | 8.85        | 7.97         | 10.91        | AAA          |
| Borde decorativo     | `--border`             | `rgba(232,228,216,0.09)` | 1.28              | —           | —            | —            | Divisores    |
| Borde de control     | `--border-control`     | `rgba(232,228,216,0.45)` | 4.13              | 3.64        | 3.28         | 4.48         | ≥ 3:1        |

`--expense-fill` codifica datos en elementos no textuales: relleno de la barra de presupuesto, columna "Debe" y serie de gastos del gráfico. Nunca se usa para texto; el texto de gasto es siempre `--destructive`.

### 1.3 Tokens de color — modo claro

El modo claro conserva la estructura semántica del oscuro. El oro actúa como relleno y no como texto, por lo que el texto de acento tiene su propio token; el verde de ingreso y el rojo de gasto se oscurecen para mantener ≥ 4.5:1 también sobre superficie alternativa y sobre su propio fondo suave.

| Token                | Variable               | Hex       | vs `--background` | vs `--card` | vs `--muted` | Nivel     |
| -------------------- | ---------------------- | --------- | ----------------- | ----------- | ------------ | --------- |
| Texto principal      | `--foreground`         | `#15211B` | 15.07             | 16.60       | 13.93        | AAA       |
| Texto secundario     | `--muted-foreground`   | `#3E4C44` | 8.21              | 9.04        | 7.59         | AAA       |
| Texto atenuado       | `--fg-mute`            | `#58685E` | 5.36              | 5.90        | 4.95         | AA        |
| Primario (relleno)   | `--primary`            | `#CBA135` | —                 | —           | —            | Relleno   |
| Texto sobre primario | `--primary-foreground` | `#1B1503` | 7.52 sobre oro    | —           | —            | AAA       |
| Acento / enlace      | `--accent-text`        | `#7A5D0F` | 5.61              | 6.18        | 5.18         | AA        |
| Ingreso              | `--income`             | `#2C7150` | 5.32              | 5.86        | 4.91         | AA        |
| Gasto (texto)        | `--destructive`        | `#A8402A` | 5.56              | 6.12        | 5.13         | AA        |
| Anillo de foco       | `--ring`               | `#8A6A12` | 4.59              | 5.06        | 4.24         | ≥ 3:1     |
| Borde decorativo     | `--border`             | `#DCD6C6` | 1.32              | —           | —            | Divisores |
| Borde de control     | `--border-control`     | `#8F8672` | 3.28              | 3.61        | 3.03         | ≥ 3:1     |

### 1.4 Fondos suaves

Alpha del color semántico sobre la superficie correspondiente. La última columna es la ratio del texto que se apoya sobre ese fondo.

| Token            | Modo   | Definición               | Compuesto sobre `--card` | Texto           | Ratio     |
| ---------------- | ------ | ------------------------ | ------------------------ | --------------- | --------- |
| `--gold-soft`    | Oscuro | `rgba(203,161,53,0.14)`  | `#343C25`                | `--primary`     | 4.78 (AA) |
| `--income-soft`  | Oscuro | `rgba(111,174,140,0.14)` | `#273D31`                | `--income`      | 4.51 (AA) |
| `--expense-soft` | Oscuro | `rgba(193,87,62,0.15)`   | `#343226`                | `--destructive` | 4.70 (AA) |
| `--gold-soft`    | Claro  | `rgba(203,161,53,0.16)`  | `#F7F0DF`                | `--accent-text` | 5.44 (AA) |
| `--income-soft`  | Claro  | `rgba(44,113,80,0.12)`   | `#E6EFEB`                | `--income`      | 4.96 (AA) |
| `--expense-soft` | Claro  | `rgba(168,64,42,0.12)`   | `#F5E8E5`                | `--destructive` | 5.12 (AA) |

### 1.5 Bordes: decorativo vs. de control

- **Borde decorativo** (`--border`): separa filas, delimita bloques y dibuja el filete inferior del encabezado. No es un componente interactivo, así que SC 1.4.11 no le exige ratio mínima; 1.28:1 basta y evita ruido visual. En modo claro, `#DCD6C6`.
- **Borde de control** (`--border-control`): delimita campos, botones y elementos enfocables. SC 1.4.11 exige ≥ 3:1 contra el fondo adyacente, de ahí `rgba(232,228,216,0.45)` en modo oscuro (4.48:1 sobre `--input`, 3.64:1 sobre `--card`). Sobre `--muted` se usa alpha `0.55` para no bajar de 3:1.
- **Barra de acento de tarjeta**: 3px en el borde izquierdo, `--primary` con opacidad `0.55`. Es adorno de jerarquía visual, no un indicador de estado.

### 1.6 Uso del color

- **Ingreso y gasto nunca se distinguen solo por color.** Entre sí tienen una ratio de 1.73:1, diferencia que desaparece en deuteranopía y protanopía. Todo importe lleva además signo (`+` / `−`), y el libro mayor lo refuerza con columnas separadas: "Debe (gasto)" y "Haber (ingreso)". Cumple SC 1.4.1.
- **El saldo del encabezado** cambia de color por signo (`pos` → `--income`, `neg` → `--destructive`), con el signo antes de la cifra: `−$1.240,50`.
- **Toda cifra monetaria** usa IBM Plex Mono con `font-variant-numeric: tabular-nums`.
- **En modo claro** el oro `#CBA135` no se usa como texto: enlaces y acentos usan `--accent-text #7A5D0F`. El oro queda como relleno de botón primario, borde activo y adorno.
- **La barra de presupuesto** usa tres colores: `--income` bajo el 80%, `--primary` entre 80% y 100%, `--expense-fill` al superar el límite. El color siempre va acompañado del texto `gastado / límite` y del porcentaje.
- Los colores semánticos expresan significado, no decoración: usarlos fuera del contexto de dinero es incorrecto.

---

## 2. Tipografía y escala tipográfica

### 2.1 Familias y roles

| Familia           | Variable       | Pesos                       | Rol               | Dónde se usa                                                                                          |
| ----------------- | -------------- | --------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------- |
| **Fraunces**      | `--font-serif` | 400, 600, 700 (itálica 500) | Titulares         | `h1`, títulos de tarjeta, saldo del encabezado                                                        |
| **Inter**         | `--font-sans`  | 400, 500, 600, 700          | Interfaz y cuerpo | Todo el texto de UI, formularios, botones, párrafos                                                   |
| **IBM Plex Mono** | `--font-mono`  | 400, 500, 600               | Datos             | Importes, fechas, etiquetas en mayúscula, encabezados de tabla, cifras de presupuesto, estados vacíos |

Reglas transversales:

- No se sintetizan pesos: si una variante no está cargada se usa la más cercana.
- `--font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif`. Los emojis van al final de la pila para no romper la línea de base.
- Fraunces se limita a dos niveles: título de sección y cifra de saldo. Un párrafo en serif es incorrecto.
- IBM Plex Mono no se usa para texto corrido: su altura de `x` obliga a mayor interlineado y reduce la densidad de la tabla.

### 2.2 Escala tipográfica

| Nivel     | Tamaño                   | Line-height | Letter-spacing | Peso / familia       | Uso                                                                    | Tailwind      |
| --------- | ------------------------ | ----------- | -------------- | -------------------- | ---------------------------------------------------------------------- | ------------- |
| `label`   | 11px / 0.6875rem         | 1.4         | 0.18em         | 500 mono, mayúsculas | Antetítulo, etiqueta de sección, encabezados de tabla                  | `text-[11px]` |
| `micro`   | 12px / 0.75rem           | 1.45        | 0.06em         | 400 mono, mayúsculas | Etiqueta de formulario, segmentado gasto/ingreso, chip de categoría    | `text-xs`     |
| `small`   | 12.5px / 0.78125rem      | 1.5         | —              | 400 sans             | Subtítulo de tarjeta, botón fantasma, celda de tabla, mensaje de error | `text-xs`     |
| `body-sm` | 14px / 0.875rem          | 1.5         | —              | 400 sans             | **Tamaño de UI por defecto**: campos, botones, texto de tabla          | `text-sm`     |
| `body`    | 16px / 1rem              | 1.5         | —              | 400 sans             | Párrafos largos, autenticación y ajustes                               | `text-base`   |
| `value`   | 15px / 0.9375rem         | 1.5         | —              | 600 mono, tabular    | Valor dentro de las píldoras de resumen                                | `text-[15px]` |
| `lead`    | 19px / 1.1875rem         | 1.2         | —              | 600 serif            | Título de tarjeta (`h2`)                                               | `text-lg`     |
| `title`   | 24px / 1.5rem            | 1.15        | -0.01em        | 600 serif            | Título de página                                                       | `text-2xl`    |
| `display` | `clamp(28px, 4vw, 40px)` | 1.1         | -0.01em        | 600 serif            | `h1` del encabezado                                                    | `text-4xl`    |
| `saldo`   | `clamp(34px, 5vw, 52px)` | 1.05        | —              | 600 serif, tabular   | Saldo actual                                                           | `text-5xl`    |

### 2.3 Reglas de composición

- **Mayúsculas solo con tracking**: el texto en mayúscula exige `letter-spacing` ≥ `0.06em`; en `label` y en encabezados de tabla, `0.08em`–`0.18em`. Nunca un párrafo entero en mayúscula.
- **Cifras siempre tabulares**: importes, fechas y porcentajes usan `font-variant-numeric: tabular-nums`.
- **Escala fluida solo en cifras dominantes**: `h1` y el saldo usan `clamp()` porque son los dos únicos elementos cuyo tamaño responde al viewport. El resto de la escala es fija.
- **Peso como jerarquía**: 600 en títulos, 500 en etiquetas, 400 en cuerpo.
- **Interlineado mínimo 1.5** en texto corrido, para cumplir SC 1.4.12 (Text Spacing).
- **Sin justificado**: alineación a la izquierda siempre.
- Los tamaños por defecto de `font-size` de Tailwind se conservan; la escala se aplica con utilidades arbitrarias solo donde el valor no existe en el tema.

---

## 3. Espaciado

### 3.1 Base y escala

Unidad base **4 px**. La escala incorpora cinco medidas propias del proyecto (14, 18, 22, 26 y 28px) que definen la densidad de tarjetas y formularios.

| Medida      | px  | rem   | Tailwind | Uso en el proyecto                                               |
| ----------- | --- | ----- | -------- | ---------------------------------------------------------------- |
| `space-1`   | 4   | 0.25  | `1`      | Separación interna mínima                                        |
| `space-1.5` | 6   | 0.375 | `1.5`    | Margen inferior de etiqueta, padding de chip                     |
| `space-2`   | 8   | 0.5   | `2`      | Gap entre botones de una fila de acciones                        |
| `space-2.5` | 10  | 0.625 | `2.5`    | Padding vertical de control pequeño, alto de barra de progreso   |
| `space-3`   | 12  | 0.75  | `3`      | Padding horizontal de control, padding de píldora                |
| `space-3.5` | 14  | 0.875 | `3.5`    | **Gap vertical de formulario**, padding de celda                 |
| `space-4`   | 16  | 1     | `4`      | Gap entre ítems de presupuesto, margen de bloque                 |
| `space-4.5` | 18  | 1.125 | `4.5`    | Separación entre subtítulo y contenido de tarjeta                |
| `space-5`   | 20  | 1.25  | `5`      | Separación entre grupos de campos                                |
| `space-5.5` | 22  | 1.375 | `5.5`    | **Gap de la grilla de tarjetas**, padding vertical de tarjeta    |
| `space-6`   | 24  | 1.5   | `6`      | **Gutter lateral del contenedor**, padding horizontal de tarjeta |
| `space-6.5` | 26  | 1.625 | `6.5`    | Padding inferior de tarjeta                                      |
| `space-7`   | 28  | 1.75  | `7`      | Gap entre estadísticas del encabezado                            |
| `space-8`   | 32  | 2     | `8`      | Separación entre encabezado y contenido                          |
| `space-9.5` | 38  | 2.375 | `9.5`    | Padding superior del encabezado                                  |
| `space-9`   | 36  | 2.25  | `9`      | Margen superior de la nota al pie                                |
| `space-12`  | 48  | 3     | `12`     | Respiración entre secciones mayores                              |

Regla de uso: el espaciado se elige **por contexto, no por fórmula**. Entre elementos relacionados 8–14px; entre grupos 16–24px; entre secciones 32px o más. Dentro de una tarjeta nunca se supera un salto de 48px.

### 3.2 Medidas de layout

Valores canónicos del proyecto; son el punto de partida para cualquier página nueva.

| Elemento            | Medida                                  | Valor                                         |
| ------------------- | --------------------------------------- | --------------------------------------------- |
| Contenedor          | Ancho máximo                            | `1180px`                                      |
| Contenedor          | Gutter horizontal                       | `24px`                                        |
| Contenedor          | Padding en móvil                        | `16px`                                        |
| Grilla principal    | Columnas                                | 2 (1 columna bajo `880px`)                    |
| Grilla principal    | Gap                                     | `22px`                                        |
| Encabezado          | Padding vertical                        | `38px` arriba, `30px` abajo                   |
| Encabezado          | Gap entre bloques                       | `24px`                                        |
| Encabezado          | Gap entre estadísticas                  | `28px`                                        |
| Contenido principal | Padding superior                        | `32px`                                        |
| Tarjeta             | Padding                                 | `22px` arriba, `24px` laterales, `26px` abajo |
| Tarjeta             | Título → subtítulo                      | `4px`                                         |
| Tarjeta             | Subtítulo → contenido                   | `18px`                                        |
| Formulario          | Gap vertical y entre columnas           | `14px`                                        |
| Formulario          | Margen inferior de etiqueta             | `6px`                                         |
| Presupuesto         | Margen inferior de ítem                 | `16px`                                        |
| Gráfico             | Alto del área de dibujo                 | `230px`                                       |
| Tabla               | Ancho mínimo antes de scroll horizontal | `720px`                                       |
| Nota al pie         | Margen superior                         | `36px`                                        |

El padding de tarjeta no es simétrico a propósito (22 arriba, 26 abajo): compensa el peso óptico del título serif y equilibra el bloque contra su borde inferior.

### 3.3 Radios y grosores

| Elemento                                 | Radio                    |
| ---------------------------------------- | ------------------------ |
| Tarjeta, diálogo, menú                   | `10px` (`--radius`)      |
| Contenedor de tabla, mensaje de error    | `8px` (`--radius-md`)    |
| Campo, botón, píldora de categoría, chip | `6px` (`--radius-sm`)    |
| Píldora de resumen, punto de estado      | `999px`                  |
| Punto de estado (`.dot`)                 | `50%`, `8px` de diámetro |

| Grosor | Uso                                                                                |
| ------ | ---------------------------------------------------------------------------------- |
| `1px`  | Filete del encabezado, borde de tarjeta y tabla, borde de control                  |
| `2px`  | Anillo de foco, borde de la barra de progreso, separación entre series del gráfico |
| `3px`  | Barra de acento del borde izquierdo de la tarjeta (opacidad `0.55`)                |
| `10px` | Alto de la barra de progreso, con radio `5px`                                      |

En Tailwind: `--radius: 0.625rem` (10px), `--radius-md: calc(var(--radius) - 2px)`, `--radius-sm: calc(var(--radius) - 4px)`. La barra de acento se implementa con un pseudo-elemento `::before`, nunca con un `box-shadow` que ensanche el radio de la tarjeta.

### 3.4 Alturas de control y objetivo táctil

| Variante | Alto   | Padding     | Uso                                                               |
| -------- | ------ | ----------- | ----------------------------------------------------------------- |
| `sm`     | `36px` | `8px 12px`  | Botón fantasma, botón de icono de fila, chip con acción           |
| `md`     | `44px` | `10px 16px` | **Por defecto**: campos, select, botón primario, barra de filtros |
| `lg`     | `52px` | `14px 20px` | Acción principal de página o formulario destacado                 |

- SC 2.5.8 (Target Size Minimum, AA) exige 24 × 24px como mínimo absoluto. Ningún control interactivo baja de `sm` (36px).
- SC 2.5.5 (Target Size Enhanced, AAA) recomienda 44 × 44px; `md` cumple ese tamaño y es el valor por defecto.
- Los botones de icono de la fila de tabla usan `sm` con área táctil ampliada a 44px mediante padding, sin alterar la altura visual de la fila.

### 3.5 Densidad de tabla

| Elemento                   | Padding         | Alto aproximado |
| -------------------------- | --------------- | --------------- |
| Encabezado de tabla (`th`) | `10px 14px`     | 44px (sticky)   |
| Celda (`td`)               | `11px 14px`     | 44px            |
| Fila de estado vacío       | `30px` vertical | —               |

La fila de 44px mantiene el objetivo táctil mínimo sin inflar la densidad. El texto de celda es `body-sm` (14px), las columnas numéricas usan mono tabular alineado a la derecha, y la celda de acción contiene solo iconos con `aria-label` descriptivo.

---

## 4. Estados de los componentes

Cada componente interactivo define cuatro estados obligatorios: **normal**, **foco**, **error** y **deshabilitado**. Se agregan dos complementarios, **cargando** y **seleccionado**.

### 4.1 Normal

| Propiedad               | Valor                                                                 |
| ----------------------- | --------------------------------------------------------------------- |
| Fondo de control        | `--input` (campos) o transparente (botones)                           |
| Fondo de botón primario | `--primary` con texto `--primary-foreground`                          |
| Fondo de botón fantasma | Transparente con borde `--border-control`                             |
| Borde                   | `1px solid var(--border-control)`                                     |
| Texto                   | `--foreground`; secundario `--muted-foreground`; atenuado `--fg-mute` |
| Radio                   | `6px` en control, `10px` en tarjeta                                   |
| Sombra                  | Ninguna: la profundidad se indica con superficie y borde              |
| Transición              | `150ms ease` en `color`, `background-color` y `border-color`          |

Hover:

- Botón primario: `filter: brightness(1.07)` sobre el relleno oro.
- Botón fantasma: borde y texto pasan a `--primary`.
- Fila de tabla: fondo `rgba(203,161,53,0.045)`; el texto mantiene 11.17:1 sobre la fila, así que el hover no degrada el contraste.
- Acción de eliminar fila: el texto pasa a `--destructive`.
- El hover nunca reemplaza al foco visible: si puntero y foco coinciden, prevalece el foco.

### 4.2 Foco

```css
:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
}
```

- Se usa exclusivamente `:focus-visible`: el foco de puntero no dibuja anillo, el de teclado siempre. Evita el doble indicador al hacer clic.
- `outline: none` está prohibido. Si un componente necesita otro indicador, el anillo se sustituye por un cambio de borde de 2px que cumpla la misma ratio.
- Sobre rellenos `--primary` el anillo usa `--primary-foreground` (7.52:1); en el resto de superficies usa `--ring`.
- El `outline-offset: 2px` es mínimo y no se reduce: con offset `0` el anillo se apoya sobre el texto, y con la barra de acento de 3px de la tarjeta quedaría cortado.
- El anillo se dibuja también en tarjetas, filas de tabla y píldoras que reciban foco programático (por ejemplo, la fila activada al editar una transacción).
- Al navegar con teclado, el elemento enfocado nunca debe quedar oculto bajo el encabezado sticky (SC 2.4.11): el contenedor de scroll define `scroll-margin-top` igual a la altura del encabezado.

### 4.3 Error

| Propiedad         | Campo de formulario            | Mensaje de error                                      |
| ----------------- | ------------------------------ | ----------------------------------------------------- |
| Borde             | `1px solid var(--destructive)` | `1px solid var(--expense-fill)`                       |
| Fondo             | `--expense-soft`               | `--expense-soft`                                      |
| Texto             | `--foreground`                 | `--foreground`                                        |
| Elemento auxiliar | —                              | `small` (12.5px) con icono de alerta y `role="alert"` |

- El campo marcado usa `aria-invalid="true"` y el mensaje se enlaza con `aria-describedby`.
- El icono de alerta acompaña al mensaje; el rojo nunca es la única señal (SC 1.4.1).
- El texto de ayuda del campo no desaparece al aparecer el error: el mensaje se añade debajo.
- El foco visible sigue activo en el campo con error, para que el usuario pueda corregirlo sin volver a alcanzarlo con el teclado.
- Borde y fondo se combinan: el usuario identifica el campo por ambos, no solo por el texto.

### 4.4 Deshabilitado

| Propiedad   | Valor                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------- |
| Texto       | Color del texto normal al 45% de opacidad                                                |
| Fondo       | El del estado normal, sin cambios                                                        |
| Borde       | `1px solid` el color de borde al 50% de opacidad                                         |
| Cursor      | `not-allowed`                                                                            |
| Atributos   | `disabled` en elementos nativos; `aria-disabled="true"` en botones con manejador de clic |
| Foco        | No enfocable por teclado; si recibe foco programático, muestra el anillo                 |
| Interacción | No emite eventos ni envía el formulario                                                  |

- Un control deshabilitado nunca se oculta: si la acción sigue siendo relevante, se muestra deshabilitada con un texto de ayuda que explique por qué.
- La opacidad de 45% reduce el contraste del texto, exento por SC 1.4.3 (los componentes deshabilitados están exentos). Valores reales resultantes: modo oscuro `#798073` sobre `--card` = 3.64:1; modo claro `#B4BBB7` sobre `--card` = 1.96:1.
- Cuando la legibilidad del texto deshabilitado importe más que la distinción visual (por ejemplo, el valor de un campo que se puede copiar), se usa opacidad 60%.

### 4.5 Cargando y seleccionado (complementarios)

**Cargando**: el ancho del control se conserva para evitar desplazamiento de contenido; el spinner (`components/ui/spinner.tsx`) reemplaza al icono o antecede al texto; el control queda deshabilitado (`aria-busy="true"`) y el texto pasa a `small`.

**Seleccionado**: en el segmentado gasto/ingreso, el botón activo toma el fondo semántico suave, el borde del color semántico y el texto del color semántico (`--expense-soft` + `--expense-fill` + `--destructive` para gasto; `--income-soft` + `--income` para ingreso), con 4.70:1 y 4.51:1 respectivamente. El estado se marca con `aria-pressed` o `aria-selected`, no solo con la clase.

### 4.6 Matriz de estados por componente

| Componente           | Normal                                                                                  | Foco                                                   | Error                                                                                      | Deshabilitado                              |
| -------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------ |
| Botón primario       | Fondo `--primary`, texto `--primary-foreground`, `brightness(1.07)` en hover            | Anillo `--primary-foreground`, offset 2px              | No aplica: la validación ocurre en el formulario                                           | 45% de opacidad, `not-allowed`, `disabled` |
| Botón fantasma       | Transparente, borde `--border-control`, texto `--muted-foreground`; hover a `--primary` | Anillo `--ring`, offset 2px                            | No aplica                                                                                  | 45% de opacidad, `aria-disabled`           |
| Campo de formulario  | Fondo `--input`, borde `--border-control`, texto `--foreground`                         | Anillo `--ring`, offset 2px                            | Borde `--destructive`, fondo `--expense-soft`, `aria-invalid` + mensaje con `role="alert"` | 45% en texto y borde, sin foco             |
| Select               | Igual al campo; el disparador muestra el valor o `Todas las categorías`                 | Anillo `--ring` en el disparador y en la lista abierta | Igual al campo                                                                             | Igual al campo                             |
| Toggle gasto/ingreso | Fondo `--input`, texto `--fg-mute` en mono `--micro`                                    | Anillo `--ring`                                        | No aplica                                                                                  | 45% de opacidad, sin relleno semántico     |
| Toggle activo        | Fondo y borde semánticos, texto semántico                                               | Anillo `--ring` sobre el relleno semántico             | No aplica                                                                                  | 45% de opacidad                            |
| Tarjeta              | Fondo `--card`, borde `--border`, barra de acento de 3px al 55%                         | Anillo `--ring` si recibe foco programático            | Mensaje `--expense-soft` con borde `--expense-fill`                                        | No aplica                                  |
| Fila de tabla        | Sin fondo; texto `--foreground`, importes en mono tabular                               | Anillo `--ring`; hover `rgba(203,161,53,0.045)`        | No aplica                                                                                  | 45% de opacidad en la fila                 |
| Celda de acción      | Icono `--fg-mute`; hover a `--primary`, y a `--destructive` en eliminar                 | Anillo `--ring` en cada botón                          | No aplica                                                                                  | 45% de opacidad, `aria-disabled`           |
| Barra de presupuesto | Pista `--input` con borde `--border`; relleno según umbral                              | No aplica: no es interactiva                           | Se marca con el porcentaje y color `--destructive`                                         | No aplica                                  |
| Mensaje de error     | Fondo `--expense-soft`, borde `--expense-fill`, texto `--foreground`, radio 8px         | No aplica                                              | Es el propio estado de error                                                               | No aplica                                  |

### 4.7 Checklist de implementación

- Usar `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` o el `outline` nativo; nunca `outline-none` sin reemplazo.
- Aplicar el estado deshabilitado con `disabled:` en elementos nativos y con `data-[disabled]:` en componentes basados en `div`/`button` de Radix.
- Marcar el error con `aria-invalid="true"` y enlazar el mensaje con `aria-describedby`; el mensaje lleva `role="alert"`.
- No eliminar el `outline` del `focus-visible` global en `resources/css/app.css`.
- Conservar el ancho del control en estado de carga y marcar `aria-busy="true"`.
- No usar `--expense-fill` para texto; usar `--destructive`.
- Verificar con un comprobador de contraste cualquier color nuevo antes de añadirlo al tema.

---

## 5. Implementación de los tokens

Los tokens de esta guía se definen en `resources/css/app.css`: el bloque `@theme` para los valores compartidos y el selector `.dark` para el modo oscuro, de modo que Tailwind v4 y los componentes shadcn/ui los consuman como utilidades (`bg-background`, `text-foreground`, `border-border-control`, `ring-ring`, `text-destructive`, `bg-income`, `text-fg-mute`).

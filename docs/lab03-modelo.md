#LABORATORIO 3 - Modelado de datos y decisiones de modelado

#1. Descripción del dominio
El proyecto corresponde a una aplicación de finanzas personales y gastos compartidos.
El sistema permite administrar información financiera de usuarios, cuentas, categorías, presupuestos y transacciones. Además, permite organizar grupos para gestionar gastos compartidos, registrar quién realizó un pago y representar las deudas generadas entre los integrantes de un grupo.

El modelo de datos fue diseñado utilizando Laravel Eloquent y migraciones para garantizar que la estructura de la base de datos sea versionada, reproducible y mantenga la integridad referencial.


#2. Entidades principales

El modelo está compuesto por las siguientes entidades:

* User: Representa a los usuarios del sistema. Un usuario puede tener varias cuentas, categorías, presupuestos y transacciones asociadas indirectamente mediante sus cuentas. También puede pertenecer a varios grupos y registrar gastos compartidos.
* Account: Representa una cuenta o medio donde el usuario administra su dinero. Cada cuenta pertenece a un usuario y puede tener múltiples transacciones.
* Category: Representa una categoría utilizada para clasificar las transacciones y presupuestos. Pertenecen a un usuario y pueden estar relacionadas con múltiples transacciones y presupuestos.
* Budget: Representa un presupuesto asociado a una categoría, usuario y período determinado. Contiene el monto máximo permitido y el mes y año correspondientes.
* Transaction: Representa un movimiento financiero, que puede ser un ingreso o un gasto. Cada transacción pertenece a una cuenta y a una categoría.
* Group: Representa un grupo de usuarios que comparte gastos (ej. un apartamento, un viaje o un grupo de amigos).
* SharedExpenses: Representa un gasto realizado dentro de un grupo. Registra el grupo al que pertenece, el usuario que realizó el pago, el monto, la descripción, la fecha y los participantes.
* GroupDebt: Representa una deuda generada como consecuencia de un gasto compartido. Permite identificar al usuario deudor, al usuario acreedor y el monto y estado de la deuda.
* user_group (Pivote): Es la tabla intermedia que relaciona usuarios y grupos, implementando una relación de muchos a muchos (N:M). Almacena información adicional de la relación: role (indica el rol del usuario dentro del grupo) y joined_at (indica cuándo se incorporó el usuario al grupo).

#3. Relaciones del modelo

#Relaciones 1:N
El modelo contiene varias relaciones de uno a muchos implementadas mediante claves foráneas y métodos de Eloquent (hasMany y belongsTo):

* Un User puede tener muchas Account, Category, Budget y registrar muchos SharedExpenses.
* Un Account puede tener muchas Transaction.
* Una Category puede tener muchas Transaction y muchos Budget.
* Un Group puede tener muchos SharedExpenses.
* Un SharedExpenses puede generar muchos GroupDebt.


#Relación N:N
Existe una relación muchos a muchos entre User y Group. Esta relación se implementa mediante la tabla intermedia user_group, la cual contiene user_id, group_id, role y joined_at. Los campos adicionales cumplen con el requisito de tabla intermedia con datos extra. En Eloquent se declara utilizando belongsToMany, withPivot('role', 'joined_at') y withTimestamps.


4.Diagrama entidad-relación en texto

* USERS 1 ----- N ACCOUNTS
* USERS 1 ----- N CATEGORIES
* USERS 1 ----- N BUDGETS
* ACCOUNTS 1 ----- N TRANSACTIONS
* CATEGORIES 1 ----- N TRANSACTIONS
* CATEGORIES 1 ----- N BUDGETS
* USERS 1 ----- N USER_GROUP
* GROUPS 1 ----- N USER_GROUP
* GROUPS 1 ----- N SHARED_EXPENSES
* USERS 1 ----- N SHARED_EXPENSES
* SHARED_EXPENSES 1 ----- N GROUP_DEBTS
* USERS 1 ----- N GROUP_DEBTS


5. Integridad referencial
Las migraciones utilizan claves foráneas para mantener la integridad de los datos. Las relaciones principales utilizan políticas de eliminación en cascada (cascadeOnDelete) cuando los registros dependientes dejan de tener sentido sin su registro padre (por ejemplo, al eliminar un usuario se eliminan sus cuentas).

Para las transacciones y categorías, se utiliza una política restrictiva (restrictOnDelete) en la migración de transacciones para evitar eliminar una categoría que todavía posee transacciones asociadas.

Adicionalmente, la tabla user_group posee una restricción única combinando user_id y group_id para evitar que un mismo usuario sea agregado dos veces al mismo grupo.


6. Migraciones
Se implementaron migraciones reversibles (con su respectivo método down) para las 9 tablas base y pivote. Estas especifican:

* Tipos de datos y longitudes de campos (string, text, decimal, json).
* Nulabilidad (nullable) y valores predeterminados (default).
* Índices simples y compuestos.
* Claves foráneas con políticas de eliminación.
* Timestamps.

Se verificó la creación limpia y la posterior carga de datos mediante los comandos migrate:fresh y seed de Artisan.


#7. Modelos Eloquent y Relacions
Cada entidad principal cuenta con su modelo Eloquent y utiliza el trait HasFactory. Se definieron las relaciones utilizando belongsTo, hasMany, belongsToMany y hasManyThrough (esta última para obtener las transacciones de un usuario a través de sus cuentas).


8. Asignación masiva y proteción de atributos

Los modelos definen explícitamente los atributos asignables. El modelo User utiliza los atributos de Laravel PHP 8 (Fillable y Hidden) para controlar la asignación masiva y ocultar información sensible en la serialización, previniendo la exposición de credenciales como password, two_factor_secret y remember_token.


#9. Conversión de tipos mediante cast

Se definieron conversiones para trabajar con los tipos de datos adecuados. Por ejemplo, en SharedExpenses se establecieron reglas para tratar "amount" como decimal de 2 posiciones, "date" como fecha y "participants" como un arreglo, permitiendo interactuar directamente con el contenido JSON desde Eloquent.

#10. Scopes reutilizables

El modelo Transaction implementa scopes para aislar la lógica de filtrado de ingresos y gastos. Se especificó la tabla de origen en la condición (transactions.type) para evitar ambigüedades en consultas que utilicen JOIN con otras tablas.


#11. datos de prueba

Se implementaron factories para todas las entidades, generando un ecosistema coherente. El seeder principal crea:

* 20 usuarios (cumpliendo el mínimo requerido para la entidad principal).
* 40 cuentas, categorías y presupuestos vinculados.
* 200 transacciones.
* 20 grupos con 100 relaciones usuario-grupo.
* 60 gastos compartidos con 60 deudas derivadas.


#12. Consultas Eloquent realizadas

12.1 Consulta utilizando un scope reutilizable
Se utilizó el método expenses() directamente sobre el modelo Transaction para filtrar los registros de tipo gasto.

12.2 Consulta de agregación (JOIN, SUM y GROUP BY)
Se calculó el total de gastos agrupados por el tipo de categoría realizando un join con la tabla categories, utilizando DB::raw para el SUM de los montos y agrupando por el tipo de categoría.

12.3 Consulta mediante relación Eloquent
Se extrajeron las transacciones asociadas a un usuario utilizando el método with('transactions') directamente en la búsqueda del usuario, aprovechando la relación hasManyThrough.


#13 Deciones de modelado

* Separación de Cuentas: Se modeló Account como entidad independiente vinculada al User para permitir el manejo de múltiples fuentes de fondos.
* Presupuestos Temporales: Budget relaciona a un usuario y a una categoría, pero se le añadieron los campos mes y año para permitir evaluaciones periódicas exactas.
* Participantes JSON vs Pivote: Los participantes de un gasto se almacenan en un campo JSON para facilitar la lectura de la transacción, mientras que la relación estructural y formal de usuarios a grupos se normaliza estrictamente en la tabla pivote user_group.
* Desacople de Deudas: En GroupDebt se separaron los roles explícitamente mediante debtor_id y creditor_id hacia la tabla de usuarios, lo cual facilita algoritmos futuros de simplificación de deudas.
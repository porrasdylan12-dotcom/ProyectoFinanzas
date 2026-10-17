import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';

export default function Dashboard() {
    return (
        <>
            <Head title="Finanzas Personales - Dashboard" />

            <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-[var(--space-6)] p-[var(--space-4)] font-sans text-[var(--color-text)] md:p-[var(--space-6)] lg:p-[var(--space-8)]">
                <header className="flex flex-col gap-[var(--space-2)] border-b border-[var(--border-color)] pb-[var(--space-4)] sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-serif font-bold tracking-tight text-[var(--color-text)] text-[var(--text-2xl)]">
                            Finanzas Personales
                        </h1>
                        <p className="text-[var(--color-text-secondary)] text-[var(--text-sm)]">
                            Administra ingresos, gastos y presupuestos desde una
                            sola pantalla.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-[var(--space-3)]">
                        <span className="inline-flex items-center gap-[var(--space-2)] rounded-full border border-[var(--border-color)] bg-[var(--color-surface)] px-[var(--space-3)] py-[var(--space-1)] font-mono text-[var(--color-text-secondary)] text-[var(--text-xs)]">
                            <span
                                className="h-2 w-2 rounded-full bg-[var(--color-success)]"
                                aria-hidden="true"
                            />
                            Estado: Conectado
                        </span>
                    </div>
                </header>

                <section
                    aria-labelledby="balance-overview-heading"
                    className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-3"
                >
                    <h2 id="balance-overview-heading" className="sr-only">
                        Resumen de balances
                    </h2>

                    <article className="flex flex-col justify-between rounded-xl border border-[var(--border-color)] bg-[var(--color-surface)] p-[var(--space-6)] shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-[var(--color-text-secondary)] text-[var(--text-sm)]">
                                Saldo disponible
                            </span>
                            <span className="font-mono text-[var(--color-text-muted)] text-[var(--text-xs)]">
                                CRC / ₡
                            </span>
                        </div>
                        <div className="mt-[var(--space-3)]">
                            <p className="font-mono font-semibold tracking-tight text-[var(--color-text)] text-[var(--text-display)]">
                                ₡125,000.00
                            </p>
                        </div>
                        <p className="mt-[var(--space-2)] text-[var(--color-text-secondary)] text-[var(--text-xs)]">
                            Actualizado hace unos momentos
                        </p>
                    </article>

                    <article className="flex flex-col justify-between rounded-xl border border-[var(--border-color)] bg-[var(--color-surface)] p-[var(--space-6)] shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-[var(--color-text-secondary)] text-[var(--text-sm)]">
                                Ingresos del mes
                            </span>
                            <span className="inline-flex items-center rounded-md bg-[rgba(111,174,140,0.15)] px-[var(--space-2)] py-[0.125rem] font-medium text-[var(--color-success)] text-[var(--text-xs)]">
                                +12.4%
                            </span>
                        </div>
                        <div className="mt-[var(--space-3)]">
                            <p className="font-mono font-bold text-[var(--color-success)] text-[var(--text-xl)]">
                                + ₡280,000.00
                            </p>
                        </div>
                        <p className="mt-[var(--space-2)] text-[var(--color-text-secondary)] text-[var(--text-xs)]">
                            Dentro de la proyección mensual
                        </p>
                    </article>

                    <article className="flex flex-col justify-between rounded-xl border border-[var(--border-color)] bg-[var(--color-surface)] p-[var(--space-6)] shadow-sm sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-[var(--color-text-secondary)] text-[var(--text-sm)]">
                                Gastos acumulados
                            </span>
                            <span className="inline-flex items-center rounded-md bg-[rgba(193,87,62,0.15)] px-[var(--space-2)] py-[0.125rem] font-medium text-[var(--color-error-text)] text-[var(--text-xs)]">
                                Controlado
                            </span>
                        </div>
                        <div className="mt-[var(--space-3)]">
                            <p className="font-mono font-bold text-[var(--color-error-text)] text-[var(--text-xl)]">
                                - ₡155,000.00
                            </p>
                        </div>
                        <p className="mt-[var(--space-2)] text-[var(--color-text-secondary)] text-[var(--text-xs)]">
                            55% del presupuesto general
                        </p>
                    </article>
                </section>

                <div className="grid grid-cols-1 gap-[var(--space-6)] lg:grid-cols-12">
                    <section
                        aria-labelledby="form-heading"
                        className="rounded-xl border border-[var(--border-color)] bg-[var(--color-surface)] p-[var(--space-6)] lg:col-span-5"
                    >
                        <header className="mb-[var(--space-4)]">
                            <h2
                                id="form-heading"
                                className="font-serif font-bold text-[var(--color-text)] text-[var(--text-lg)]"
                            >
                                Registrar movimiento
                            </h2>
                            <p className="text-[var(--color-text-secondary)] text-[var(--text-sm)]">
                                Ingrese los detalles de la transacción
                                financiera.
                            </p>
                        </header>

                        <form
                            onSubmit={(e) => e.preventDefault()}
                            className="flex flex-col gap-[var(--space-4)]"
                            noValidate
                        >
                            <div className="flex flex-col gap-[var(--space-1)]">
                                <label
                                    htmlFor="tx-desc"
                                    className="font-medium text-[var(--color-text)] text-[var(--text-sm)]"
                                >
                                    Descripción del movimiento
                                </label>
                                <input
                                    id="tx-desc"
                                    name="description"
                                    type="text"
                                    defaultValue="Compra en supermercado"
                                    placeholder="Ej. Pago de alquiler"
                                    className="min-h-[2.5rem] w-full rounded-md border border-[var(--border-color)] bg-[var(--color-bg-deep)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--color-text)] text-[var(--text-base)] placeholder:text-[var(--color-text-muted)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
                                />
                                <span className="text-[var(--color-text-secondary)] text-[var(--text-xs)]">
                                    Texto descriptivo para su registro personal.
                                </span>
                            </div>

                            <div className="flex flex-col gap-[var(--space-1)]">
                                <label
                                    htmlFor="tx-amount"
                                    className="font-medium text-[var(--color-text)] text-[var(--text-sm)]"
                                >
                                    Monto (₡)
                                </label>
                                <input
                                    id="tx-amount"
                                    name="amount"
                                    type="number"
                                    defaultValue="0"
                                    aria-invalid="true"
                                    aria-describedby="tx-amount-error"
                                    className="min-h-[2.5rem] w-full rounded-md border border-[var(--color-error-text)] bg-[var(--color-bg-deep)] px-[var(--space-3)] py-[var(--space-2)] font-mono text-[var(--color-text)] text-[var(--text-base)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
                                />
                                <p
                                    id="tx-amount-error"
                                    className="flex items-center gap-[var(--space-1)] font-medium text-[var(--color-error-text)] text-[var(--text-xs)]"
                                >
                                    <span aria-hidden="true">⚠️</span> Introduce
                                    un monto mayor que cero.
                                </p>
                            </div>

                            <div className="flex flex-col gap-[var(--space-1)]">
                                <label
                                    htmlFor="tx-type"
                                    className="font-medium text-[var(--color-text)] text-[var(--text-sm)]"
                                >
                                    Tipo de movimiento
                                </label>
                                <select
                                    id="tx-type"
                                    name="type"
                                    defaultValue="expense"
                                    className="min-h-[2.5rem] w-full rounded-md border border-[var(--border-color)] bg-[var(--color-bg-deep)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--color-text)] text-[var(--text-base)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
                                >
                                    <option value="expense">Gasto</option>
                                    <option value="income">Ingreso</option>
                                </select>
                            </div>

                            <div className="mt-[var(--space-2)] flex flex-col gap-[var(--space-3)] sm:flex-row">
                                <button
                                    type="submit"
                                    className="inline-flex min-h-[2.5rem] flex-1 cursor-pointer items-center justify-center rounded-md bg-[var(--color-accent)] px-[var(--space-4)] py-[var(--space-2)] font-semibold text-[var(--color-accent-text)] text-[var(--text-sm)] shadow-sm transition-colors hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] active:brightness-95"
                                >
                                    Guardar movimiento
                                </button>
                                <button
                                    type="button"
                                    disabled
                                    className="inline-flex min-h-[2.5rem] cursor-not-allowed items-center justify-center rounded-md border border-[var(--border-color)] bg-[var(--color-surface-alt)] px-[var(--space-4)] py-[var(--space-2)] text-[var(--color-text-muted)] text-[var(--text-sm)] opacity-55"
                                >
                                    Guardar cambios · No disponible
                                </button>
                            </div>
                        </form>
                    </section>

                    <section
                        aria-labelledby="budgets-heading"
                        className="flex flex-col gap-[var(--space-4)] rounded-xl border border-[var(--border-color)] bg-[var(--color-surface)] p-[var(--space-6)] lg:col-span-7"
                    >
                        <header className="flex items-center justify-between">
                            <div>
                                <h2
                                    id="budgets-heading"
                                    className="font-serif font-bold text-[var(--color-text)] text-[var(--text-lg)]"
                                >
                                    Presupuestos del mes
                                </h2>
                                <p className="text-[var(--color-text-secondary)] text-[var(--text-sm)]">
                                    Estado de límites por categoría asignada.
                                </p>
                            </div>
                            <span className="font-mono text-[var(--color-text-muted)] text-[var(--text-xs)]">
                                Periodo actual
                            </span>
                        </header>

                        <div className="flex flex-col gap-[var(--space-4)]">
                            <article className="rounded-lg border border-[var(--border-color)] bg-[var(--color-surface-alt)] p-[var(--space-4)]">
                                <div className="flex items-center justify-between text-[var(--text-sm)]">
                                    <span className="font-medium text-[var(--color-text)]">
                                        Alimentación y Compras
                                    </span>
                                    <span className="font-mono text-[var(--color-success)] text-[var(--text-xs)]">
                                        ₡65,000 / ₡100,000 (65%)
                                    </span>
                                </div>
                                <div className="mt-[var(--space-2)] h-2 w-full overflow-hidden rounded-full bg-[var(--color-bg-deep)]">
                                    <div
                                        className="h-full rounded-full bg-[var(--color-success)] transition-all duration-300"
                                        style={{ width: '65%' }}
                                        role="progressbar"
                                        aria-valuenow={65}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-label="Alimentación y Compras: 65% utilizado"
                                    />
                                </div>
                                <p className="mt-[var(--space-1)] text-[var(--color-text-secondary)] text-[var(--text-xs)]">
                                    Dentro del presupuesto planificado.
                                </p>
                            </article>

                            <article className="rounded-lg border border-[var(--border-color)] bg-[var(--color-surface-alt)] p-[var(--space-4)]">
                                <div className="flex items-center justify-between text-[var(--text-sm)]">
                                    <span className="font-medium text-[var(--color-text)]">
                                        Servicios Públicos y Luz
                                    </span>
                                    <span className="font-mono font-semibold text-[var(--color-error-text)] text-[var(--text-xs)]">
                                        ₡52,000 / ₡45,000 (115%)
                                    </span>
                                </div>
                                <div className="mt-[var(--space-2)] h-2 w-full overflow-hidden rounded-full bg-[var(--color-bg-deep)]">
                                    <div
                                        className="h-full rounded-full bg-[var(--color-danger)] transition-all duration-300"
                                        style={{ width: '100%' }}
                                        role="progressbar"
                                        aria-valuenow={115}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-label="Servicios Públicos: 115% de exceso"
                                    />
                                </div>
                                <p className="mt-[var(--space-1)] text-[var(--color-error-text)] text-[var(--text-xs)]">
                                    Límite superado por ₡7,000.00. Requiere
                                    atención.
                                </p>
                            </article>
                        </div>
                    </section>
                </div>

                <section
                    aria-labelledby="tx-table-heading"
                    className="overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--color-surface)]"
                >
                    <header className="flex items-center justify-between border-b border-[var(--border-color)] p-[var(--space-6)]">
                        <div>
                            <h2
                                id="tx-table-heading"
                                className="font-serif font-bold text-[var(--color-text)] text-[var(--text-lg)]"
                            >
                                Movimientos recientes
                            </h2>
                            <p className="text-[var(--color-text-secondary)] text-[var(--text-sm)]">
                                Historial de entradas y salidas financieras.
                            </p>
                        </div>
                    </header>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[var(--text-sm)]">
                            <caption className="sr-only">
                                Listado de transacciones recientes
                            </caption>
                            <thead className="bg-[var(--color-surface-alt)] tracking-wider text-[var(--color-text-secondary)] text-[var(--text-xs)] uppercase">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-[var(--space-6)] py-[var(--space-3)]"
                                    >
                                        Fecha
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-[var(--space-6)] py-[var(--space-3)]"
                                    >
                                        Descripción
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-[var(--space-6)] py-[var(--space-3)]"
                                    >
                                        Categoría
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-[var(--space-6)] py-[var(--space-3)] text-right"
                                    >
                                        Monto
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]">
                                <tr className="transition-colors hover:bg-[var(--color-surface-alt)]">
                                    <td className="px-[var(--space-6)] py-[var(--space-4)] font-mono whitespace-nowrap text-[var(--color-text-secondary)] text-[var(--text-xs)]">
                                        2026-10-10
                                    </td>
                                    <td className="px-[var(--space-6)] py-[var(--space-4)] font-medium text-[var(--color-text)]">
                                        Depósito de Nómina
                                    </td>
                                    <td className="px-[var(--space-6)] py-[var(--space-4)] text-[var(--color-text-secondary)]">
                                        Salario
                                    </td>
                                    <td className="px-[var(--space-6)] py-[var(--space-4)] text-right font-mono font-semibold whitespace-nowrap text-[var(--color-success)]">
                                        + ₡280,000.00
                                    </td>
                                </tr>
                                <tr className="transition-colors hover:bg-[var(--color-surface-alt)]">
                                    <td className="px-[var(--space-6)] py-[var(--space-4)] font-mono whitespace-nowrap text-[var(--color-text-secondary)] text-[var(--text-xs)]">
                                        2026-10-09
                                    </td>
                                    <td className="px-[var(--space-6)] py-[var(--space-4)] font-medium text-[var(--color-text)]">
                                        Supermercado Central
                                    </td>
                                    <td className="px-[var(--space-6)] py-[var(--space-4)] text-[var(--color-text-secondary)]">
                                        Alimentación
                                    </td>
                                    <td className="px-[var(--space-6)] py-[var(--space-4)] text-right font-mono font-semibold whitespace-nowrap text-[var(--color-error-text)]">
                                        - ₡45,000.00
                                    </td>
                                </tr>
                                <tr className="transition-colors hover:bg-[var(--color-surface-alt)]">
                                    <td className="px-[var(--space-6)] py-[var(--space-4)] font-mono whitespace-nowrap text-[var(--color-text-secondary)] text-[var(--text-xs)]">
                                        2026-10-08
                                    </td>
                                    <td className="px-[var(--space-6)] py-[var(--space-4)] font-medium text-[var(--color-text)]">
                                        Pago de Electricidad ICE
                                    </td>
                                    <td className="px-[var(--space-6)] py-[var(--space-4)] text-[var(--color-text-secondary)]">
                                        Servicios
                                    </td>
                                    <td className="px-[var(--space-6)] py-[var(--space-4)] text-right font-mono font-semibold whitespace-nowrap text-[var(--color-error-text)]">
                                        - ₡32,000.00
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};

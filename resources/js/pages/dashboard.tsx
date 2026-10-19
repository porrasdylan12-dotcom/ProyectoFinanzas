import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { dashboard } from '@/routes';

interface Transaction {
    id: number;
    cuenta_id: number;
    categoria_id: number;
    tipo: 'ingreso' | 'gasto';
    monto: number;
    descripcion: string | null;
    fecha: string;
    creada: string;
    actualizada: string;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface PaginatedResponse {
    data: Transaction[];
    meta: PaginationMeta;
}

type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

const PER_PAGE = 10;

export default function Dashboard() {
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 400);
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<FetchStatus>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const fetchTransactions = useCallback(
        async (searchTerm: string, pageNum: number) => {
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            setStatus('loading');
            setErrorMsg('');

            const params = new URLSearchParams({
                page: String(pageNum),
                per_page: String(PER_PAGE),
                sort_by: 'transaction_date',
                sort_dir: 'desc',
            });

            if (searchTerm.trim()) {
                params.set('description', searchTerm.trim());
            }

            try {
                const res = await fetch(`/api/transactions?${params}`, {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin',
                    signal: controller.signal,
                });

                if (!res.ok) {
                    throw new Error(`Error ${res.status}: ${res.statusText}`);
                }

                const json: PaginatedResponse = await res.json();
                setTransactions(json.data);
                setMeta(json.meta);
                setStatus('success');
            } catch (err: unknown) {
                if (err instanceof DOMException && err.name === 'AbortError') {
                    return;
                }
                setStatus('error');
                setErrorMsg(
                    err instanceof Error
                        ? err.message
                        : 'Ocurrió un error inesperado.',
                );
            }
        },
        [],
    );

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    useEffect(() => {
        fetchTransactions(debouncedSearch, page);

        return () => {
            abortRef.current?.abort();
        };
    }, [debouncedSearch, page, fetchTransactions]);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('es-CR', {
            style: 'currency',
            currency: 'CRC',
            minimumFractionDigits: 2,
        }).format(amount);

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('es-CR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });

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
                    <header className="flex flex-col gap-[var(--space-4)] border-b border-[var(--border-color)] p-[var(--space-6)] sm:flex-row sm:items-center sm:justify-between">
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

                        <div className="relative w-full sm:max-w-xs">
                            <input
                                id="tx-search"
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar por descripción…"
                                className="min-h-[2.5rem] w-full rounded-md border border-[var(--border-color)] bg-[var(--color-bg-deep)] pl-[var(--space-10)] pr-[var(--space-3)] py-[var(--space-2)] text-[var(--color-text)] text-[var(--text-sm)] placeholder:text-[var(--color-text-muted)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] transition-colors"
                            />
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-[var(--space-3)] text-[var(--color-text-muted)]">
                                {status === 'loading' ? (
                                    <Spinner className="size-4" />
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="size-4"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                            </span>
                        </div>
                    </header>

                    {status === 'error' && (
                        <div className="flex flex-col items-center justify-center gap-[var(--space-4)] p-[var(--space-10)] text-center">
                            <div className="flex size-14 items-center justify-center rounded-full bg-[rgba(193,87,62,0.15)]">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="size-7 text-[var(--color-error-text)]"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-[var(--color-error-text)] text-[var(--text-sm)]">
                                    No se pudieron cargar los movimientos
                                </p>
                                <p className="mt-[var(--space-1)] text-[var(--color-text-muted)] text-[var(--text-xs)]">
                                    {errorMsg}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    fetchTransactions(debouncedSearch, page)
                                }
                                className="inline-flex min-h-[2.25rem] cursor-pointer items-center gap-[var(--space-2)] rounded-md border border-[var(--border-color)] bg-[var(--color-surface-alt)] px-[var(--space-4)] py-[var(--space-2)] font-medium text-[var(--color-text)] text-[var(--text-sm)] transition-colors hover:bg-[var(--color-surface)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="size-4"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.451a.75.75 0 0 0 0-1.5H4.5a.75.75 0 0 0-.75.75v3.75a.75.75 0 0 0 1.5 0v-2.033l.364.363a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39l-.065.043Zm-10.624-2.85a5.5 5.5 0 0 1 9.201-2.465l.312.31H11.75a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 .75-.75V3.42a.75.75 0 0 0-1.5 0v2.033l-.364-.364A7 7 0 0 0 2.674 8.228a.75.75 0 0 0 1.449.39l.065-.044Z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Reintentar
                            </button>
                        </div>
                    )}

                    {status === 'loading' && transactions.length === 0 && (
                        <div className="divide-y divide-[var(--border-color)]">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-[var(--space-4)] px-[var(--space-6)] py-[var(--space-4)]"
                                >
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 flex-1" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="ml-auto h-4 w-28" />
                                </div>
                            ))}
                        </div>
                    )}

                    {status === 'success' &&
                        transactions.length === 0 && (
                            <div className="flex flex-col items-center justify-center gap-[var(--space-3)] p-[var(--space-10)] text-center">
                                <div className="flex size-14 items-center justify-center rounded-full bg-[var(--color-surface-alt)]">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="size-7 text-[var(--color-text-muted)]"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.625 1.5H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875Zm5.845 17.03a.75.75 0 0 0 1.06 0l2.22-2.22a.75.75 0 0 0-1.06-1.06l-.97.97V12a.75.75 0 0 0-1.5 0v4.19l-.97-.97a.75.75 0 1 0-1.06 1.06l2.28 2.25Z"
                                            clipRule="evenodd"
                                        />
                                        <path d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z" />
                                    </svg>
                                </div>
                                <p className="font-medium text-[var(--color-text-secondary)] text-[var(--text-sm)]">
                                    {search
                                        ? 'No se encontraron movimientos para esa búsqueda.'
                                        : 'Aún no hay movimientos registrados.'}
                                </p>
                                <p className="text-[var(--color-text-muted)] text-[var(--text-xs)]">
                                    {search
                                        ? 'Intenta con otro término de búsqueda.'
                                        : 'Registra tu primera transacción usando el formulario.'}
                                </p>
                            </div>
                        )}

                    {(status === 'success' ||
                        (status === 'loading' &&
                            transactions.length > 0)) &&
                        transactions.length > 0 && (
                            <>
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
                                                    Tipo
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-[var(--space-6)] py-[var(--space-3)] text-right"
                                                >
                                                    Monto
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody
                                            className={`divide-y divide-[var(--border-color)] transition-opacity ${
                                                status === 'loading'
                                                    ? 'opacity-50'
                                                    : 'opacity-100'
                                            }`}
                                        >
                                            {transactions.map((tx) => (
                                                <tr
                                                    key={tx.id}
                                                    className="transition-colors hover:bg-[var(--color-surface-alt)]"
                                                >
                                                    <td className="px-[var(--space-6)] py-[var(--space-4)] font-mono whitespace-nowrap text-[var(--color-text-secondary)] text-[var(--text-xs)]">
                                                        {formatDate(
                                                            tx.fecha,
                                                        )}
                                                    </td>
                                                    <td className="px-[var(--space-6)] py-[var(--space-4)] font-medium text-[var(--color-text)]">
                                                        {tx.descripcion ??
                                                            '—'}
                                                    </td>
                                                    <td className="px-[var(--space-6)] py-[var(--space-4)]">
                                                        <span
                                                            className={`inline-flex items-center rounded-md px-[var(--space-2)] py-[0.125rem] font-medium text-[var(--text-xs)] ${
                                                                tx.tipo ===
                                                                'ingreso'
                                                                    ? 'bg-[rgba(111,174,140,0.15)] text-[var(--color-success)]'
                                                                    : 'bg-[rgba(193,87,62,0.15)] text-[var(--color-error-text)]'
                                                            }`}
                                                        >
                                                            {tx.tipo ===
                                                            'ingreso'
                                                                ? 'Ingreso'
                                                                : 'Gasto'}
                                                        </span>
                                                    </td>
                                                    <td
                                                        className={`px-[var(--space-6)] py-[var(--space-4)] text-right font-mono font-semibold whitespace-nowrap ${
                                                            tx.tipo ===
                                                            'ingreso'
                                                                ? 'text-[var(--color-success)]'
                                                                : 'text-[var(--color-error-text)]'
                                                        }`}
                                                    >
                                                        {tx.tipo ===
                                                        'ingreso'
                                                            ? '+ '
                                                            : '- '}
                                                        {formatCurrency(
                                                            tx.monto,
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {meta && meta.last_page > 1 && (
                                    <div className="flex items-center justify-between border-t border-[var(--border-color)] px-[var(--space-6)] py-[var(--space-4)]">
                                        <p className="font-mono text-[var(--color-text-muted)] text-[var(--text-xs)]">
                                            Página {meta.current_page} de{' '}
                                            {meta.last_page} · {meta.total}{' '}
                                            {meta.total === 1
                                                ? 'resultado'
                                                : 'resultados'}
                                        </p>
                                        <div className="flex items-center gap-[var(--space-2)]">
                                            <button
                                                type="button"
                                                disabled={
                                                    meta.current_page <= 1 ||
                                                    status === 'loading'
                                                }
                                                onClick={() =>
                                                    setPage((p) =>
                                                        Math.max(1, p - 1),
                                                    )
                                                }
                                                className="inline-flex min-h-[2rem] cursor-pointer items-center gap-[var(--space-1)] rounded-md border border-[var(--border-color)] bg-[var(--color-surface-alt)] px-[var(--space-3)] py-[var(--space-1)] text-[var(--color-text)] text-[var(--text-xs)] transition-colors hover:bg-[var(--color-surface)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 16 16"
                                                    fill="currentColor"
                                                    className="size-3.5"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                Anterior
                                            </button>
                                            <button
                                                type="button"
                                                disabled={
                                                    meta.current_page >=
                                                        meta.last_page ||
                                                    status === 'loading'
                                                }
                                                onClick={() =>
                                                    setPage((p) =>
                                                        Math.min(
                                                            meta.last_page,
                                                            p + 1,
                                                        ),
                                                    )
                                                }
                                                className="inline-flex min-h-[2rem] cursor-pointer items-center gap-[var(--space-1)] rounded-md border border-[var(--border-color)] bg-[var(--color-surface-alt)] px-[var(--space-3)] py-[var(--space-1)] text-[var(--color-text)] text-[var(--text-xs)] transition-colors hover:bg-[var(--color-surface)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Siguiente
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 16 16"
                                                    fill="currentColor"
                                                    className="size-3.5"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
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

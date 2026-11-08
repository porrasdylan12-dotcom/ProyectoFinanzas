import {
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  type InfiniteScrollCustomEvent,
  type RefresherEventDetail,
} from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import { useCallback, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';

import { useAuth } from '../../auth/AuthContext';
import DataState from '../../components/DataState';
import { useAsyncData } from '../../hooks/useAsyncData';
import { useInfiniteList } from '../../hooks/useInfiniteList';
import {
  addGroupMember,
  fetchGroup,
  getGroupErrorMessage,
  groupMemberName,
  groupRoleLabel,
  isGroupAdmin,
  type Group,
} from '../../lib/groups';
import { formatMoney } from '../../lib/money';
import { fetchSharedExpensesPage, formatSharedExpenseDate, type SharedExpense } from '../../lib/sharedExpenses';
import { GASTO_COMPARTIDO_ROUTES, GRUPO_ROUTES } from '../../navigation/routes';

import './grupos.css';

interface GrupoDetalleContentProps {
  group: Group;
  reloadGroup: () => Promise<void>;
}

const GrupoDetalleContent: React.FC<GrupoDetalleContentProps> = ({ group, reloadGroup }) => {
  const { user } = useAuth();
  const loadExpenses = useCallback(
    (page: number, perPage: number) => fetchSharedExpensesPage(group.id, page, perPage),
    [group.id],
  );
  const expenses = useInfiniteList(loadExpenses, { cacheKey: `shared-expenses:${group.id}` });
  const [memberEmail, setMemberEmail] = useState('');
  const [memberError, setMemberError] = useState<string | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);

  const members = group.miembros ?? [];
  const canManageMembers = user ? isGroupAdmin(group, user.id) : false;

  const handleRefresh = (event: CustomEvent<RefresherEventDetail>): void => {
    void Promise.all([expenses.refresh(), reloadGroup()]).finally(() => event.detail.complete());
  };

  const handleInfinite = async (event: InfiniteScrollCustomEvent): Promise<void> => {
    await expenses.loadMore();
    await event.target.complete();
  };

  const handleAddMember = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (isAddingMember) {
      return;
    }

    const email = memberEmail.trim();

    if (!email) {
      setMemberError('El correo electrónico es obligatorio.');
      return;
    }

    setMemberError(null);
    setIsAddingMember(true);

    try {
      await addGroupMember(group.id, email);
      setMemberEmail('');
      await reloadGroup();
    } catch (error) {
      setMemberError(getGroupErrorMessage(error));
    } finally {
      setIsAddingMember(false);
    }
  };

  return (
    <>
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent />
      </IonRefresher>

      <IonCard className="grupo-detalle__card">
        <IonCardHeader>
          <IonCardSubtitle>
            {members.length} {members.length === 1 ? 'integrante' : 'integrantes'}
          </IonCardSubtitle>
          <IonCardTitle>{group.nombre}</IonCardTitle>
        </IonCardHeader>
      </IonCard>

      <section className="grupo-detalle__section" aria-labelledby="miembros-title">
        <div className="grupo-detalle__section-header">
          <h2 id="miembros-title">Integrantes</h2>
        </div>

        <IonList inset className="grupo-detalle__list">
          {members.map((member) => (
            <IonItem key={member.id} data-testid={`miembro-${member.id}`}>
              <IonLabel>
                <h3>{member.nombre}</h3>
                <p>{member.email}</p>
              </IonLabel>
              <IonBadge slot="end" color={member.rol === 'admin' ? 'primary' : 'medium'}>
                {groupRoleLabel(member.rol)}
              </IonBadge>
            </IonItem>
          ))}
        </IonList>

        {canManageMembers && (
          <form
            className="grupo-detalle__member-form"
            onSubmit={handleAddMember}
            noValidate
            aria-label="Agregar integrante"
          >
            <IonInput
              label="Correo del integrante"
              labelPlacement="stacked"
              fill="outline"
              type="email"
              inputMode="email"
              value={memberEmail}
              onIonInput={(event) => setMemberEmail(String(event.detail.value ?? ''))}
              errorText={memberError ?? undefined}
              className={memberError ? 'ion-invalid ion-touched' : undefined}
              disabled={isAddingMember}
              data-testid="grupo-email"
            />
            <IonButton type="submit" disabled={isAddingMember} aria-label="Agregar integrante">
              {isAddingMember ? <IonSpinner name="crescent" /> : 'Agregar'}
            </IonButton>
          </form>
        )}

        {memberError && !canManageMembers && (
          <IonText color="danger">
            <p className="grupo-detalle__alert" role="alert">
              {memberError}
            </p>
          </IonText>
        )}
      </section>

      <section className="grupo-detalle__section" aria-labelledby="gastos-title">
        <div className="grupo-detalle__section-header">
          <h2 id="gastos-title">Gastos compartidos</h2>
          <IonButton
            size="small"
            fill="outline"
            routerLink={GRUPO_ROUTES.newExpense(group.id)}
            aria-label="Registrar gasto compartido"
          >
            <IonIcon slot="start" icon={addOutline} aria-hidden="true" />
            Registrar
          </IonButton>
        </div>

        <DataState
          status={expenses.status}
          error={expenses.error}
          hasData={expenses.items.length > 0}
          isEmpty={expenses.isEmpty}
          onRetry={() => void expenses.refresh()}
          loadingMessage="Cargando gastos compartidos…"
          emptyMessage="Aún no hay gastos compartidos en este grupo."
        >
          <div>
            {expenses.error && (
              <IonText color="danger">
                <p className="grupo-detalle__alert" role="alert">
                  No se pudo actualizar la lista de gastos.
                </p>
              </IonText>
            )}

            <IonList inset className="grupo-detalle__list">
              {expenses.items.map((expense: SharedExpense) => (
                <IonItem
                  key={expense.id}
                  button
                  detail
                  routerLink={GASTO_COMPARTIDO_ROUTES.detail(expense.id)}
                  data-testid={`gasto-${expense.id}`}
                >
                  <IonLabel>
                    <h3>{expense.descripcion || 'Gasto compartido'}</h3>
                    <p>
                      {groupMemberName(group, expense.usuario_id)} · {formatSharedExpenseDate(expense.fecha)} ·{' '}
                      {expense.participantes?.length ?? 0} participantes
                    </p>
                  </IonLabel>
                  <IonNote slot="end" className="grupo-detalle__amount">
                    {formatMoney(expense.monto)}
                  </IonNote>
                </IonItem>
              ))}
            </IonList>
          </div>
        </DataState>

        {expenses.isEmpty && (
          <div className="grupo-detalle__empty-action">
            <IonButton routerLink={GRUPO_ROUTES.newExpense(group.id)}>Registrar el primer gasto</IonButton>
          </div>
        )}

        <IonInfiniteScroll onIonInfinite={handleInfinite} disabled={!expenses.hasMore || expenses.isLoadingMore}>
          <IonInfiniteScrollContent loadingText="Cargando más gastos…" />
        </IonInfiniteScroll>
      </section>
    </>
  );
};

const GrupoDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const groupId = Number(id);

  const loadGroup = useCallback(async () => {
    if (!Number.isInteger(groupId) || groupId <= 0) {
      throw new Error('El grupo solicitado no es válido.');
    }

    return fetchGroup(groupId);
  }, [groupId]);

  const {
    data: group,
    status,
    error,
    reload,
  } = useAsyncData(loadGroup, {
    cacheKey: `group:${groupId}`,
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={GRUPO_ROUTES.list} />
          </IonButtons>
          <IonTitle>Grupo</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <DataState
          status={status}
          error={error}
          hasData={group !== null}
          onRetry={() => void reload()}
          loadingMessage="Cargando grupo…"
        >
          {group && (
            <div className="grupo-detalle">
              <GrupoDetalleContent group={group} reloadGroup={reload} />
            </div>
          )}
        </DataState>
      </IonContent>
    </IonPage>
  );
};

export default GrupoDetalle;

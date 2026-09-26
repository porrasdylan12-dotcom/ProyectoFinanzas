<?php

namespace App\Policies;

use App\Models\Transaction;
use App\Models\User;

class TransactionPolicy extends BasePolicy
{
    public function viewAny(User $user): bool
    {
        return $this->canView($user);
    }

    public function view(User $user, Transaction $transaction): bool
    {
        return $this->canView($user) && $this->ownsThroughAccount($user, $transaction);
    }

    public function create(User $user): bool
    {
        return $this->canWrite($user);
    }

    public function update(User $user, Transaction $transaction): bool
    {
        return $this->canWrite($user) && $this->ownsThroughAccount($user, $transaction);
    }

    public function delete(User $user, Transaction $transaction): bool
    {
        return $this->canWrite($user) && $this->ownsThroughAccount($user, $transaction);
    }

    /**
     * Una transacción pertenece a quien posee la cuenta sobre la que se registra.
     */
    protected function ownsThroughAccount(User $user, Transaction $transaction): bool
    {
        return $this->owns($user, $transaction->account?->user_id);
    }
}

<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Models\Account;
use Illuminate\Support\Facades\DB;

class AccountService
{
    public function confirmar(Account $account)
    {
        throw new \App\Exceptions\Regla500Exception();
        return $account->delete();
    }

    public function create(array $data): Account
    {
        $this->validateNoDuplicateCashAccount($data);

        return Account::create($data);
    }

    public function update(Account $account, array $data): Account
    {
        $account->update($data);

        return $account;
    }

    public function delete(Account $account): bool
    {
        return DB::transaction(function () use ($account) {
            if ($account->transactions()->exists()) {
                throw new BusinessRuleException(
                    'No se puede eliminar la cuenta porque tiene transacciones asociadas.',
                    'CUENTA_CON_DEPENDENCIAS',
                    409
                );
            }

            return $account->delete();
        });
    }

    private function validateNoDuplicateCashAccount(array $data): void
    {
        if (
            ($data['type'] ?? '') === 'efectivo'
            && ($data['balance'] ?? 0) > 0
        ) {
            $exists = Account::where('user_id', $data['user_id'])
                ->where('type', 'efectivo')
                ->exists();

            if ($exists) {
                throw new BusinessRuleException(
                    'El usuario ya tiene una cuenta de efectivo. No se puede crear otra con saldo mayor a 0.',
                    'CUENTA_EFECTIVO_DUPLICADA',
                    422
                );
            }
        }
    }
}
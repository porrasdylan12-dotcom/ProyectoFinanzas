<?php

namespace App\Services;

use App\Models\Account;

class AccountService
{
    public function confirmar(Account $account)
    {
        throw new \RuntimeException('Error al confirmar la cuenta.');
        return $account->delete();
    }

    public function crear(array $data)
    {

        return Account::create($data);
    }
}
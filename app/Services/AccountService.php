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

    public function create(array $data)
    {

        return Account::create($data);
    }

    public function update(array $data)
    {
        $account = Account::findOrFail($data['id']);
        $account->update($data);
        return $account;
    }
}
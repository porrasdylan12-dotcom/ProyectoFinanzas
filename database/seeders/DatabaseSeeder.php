<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Group;
use App\Models\GroupDebt;
use App\Models\SharedExpenses;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::factory()
            ->count(20)
            ->create();


        foreach ($users as $user) {

            $accounts = Account::factory()
                ->count(2)
                ->create([
                    'user_id' => $user->id,
                ]);

            $categories = Category::factory()
                ->count(5)
                ->create([
                    'user_id' => $user->id,
                ]);

            $expenseCategories = $categories
                ->where('type', 'gasto');

            if ($expenseCategories->isEmpty()) {
                $expenseCategories = collect([
                    Category::factory()->create([
                        'user_id' => $user->id,
                        'name' => 'Gastos generales',
                        'type' => 'gasto',
                    ]),
                ]);
            }

            foreach ($expenseCategories->take(3) as $category) {
                Budget::factory()->create([
                    'user_id' => $user->id,
                    'category_id' => $category->id,
                ]);
            }

            foreach ($accounts as $account) {

                $userCategory = $categories->random();

                Transaction::factory()
                    ->count(5)
                    ->create([
                        'account_id' => $account->id,
                        'category_id' => $userCategory->id,
                        'type' => $userCategory->type ?? 'gasto',
                    ]);
            }
        }

        /*
         * 3. Crear grupos
         */
        $groups = Group::factory()
            ->count(4)
            ->create();

        /*
         * 4. Asociar usuarios a los grupos mediante
         *    la tabla pivote user_group.
         */
        foreach ($groups as $index => $group) {

            $groupUsers = $users
                ->slice($index * 5, 5);

            foreach ($groupUsers as $userIndex => $user) {

                $group->users()->attach($user->id, [
                    'role' => $userIndex === 0 ? 'admin' : 'member',
                    'joined_at' => now()->subDays(
                        fake()->numberBetween(1, 60)
                    ),
                ]);
            }
        }

        /*
         * 5. Crear gastos compartidos.
         */
        foreach ($groups as $group) {

            $groupUsers = $group->users()->get();

            foreach (range(1, 3) as $i) {

                $payer = $groupUsers->random();

                $participants = $groupUsers
                    ->random(min(3, $groupUsers->count()))
                    ->pluck('id')
                    ->values()
                    ->toArray();
                    
                if (!in_array($payer->id, $participants)) {
                    $participants[array_rand($participants)] = $payer->id;
                }

                $sharedExpense = SharedExpenses::factory()->create([
                    'group_id' => $group->id,
                    'user_id' => $payer->id,
                    'participants' => $participants,
                ]);

                /*
                 * 6. Crear una deuda relacionada con
                 *    el gasto compartido.
                 */
                $debtor = $groupUsers
                    ->where('id', '!=', $payer->id)
                    ->random();

                GroupDebt::factory()->create([
                    'shared_expense_id' => $sharedExpense->id,
                    'debtor_id' => $debtor->id,
                    'creditor_id' => $payer->id,
                    'total_amount' => fake()->randomFloat(
                        2,
                        5000,
                        50000
                    ),
                ]);
            }
        }
    }
}
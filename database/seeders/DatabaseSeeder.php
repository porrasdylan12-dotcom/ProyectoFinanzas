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
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

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

            $expenseCategory = Category::factory()->create([
                'user_id' => $user->id,
                'name' => fake()->randomElement([
                    'Alimentación',
                    'Transporte',
                    'Universidad',
                    'Entretenimiento',
                    'Salud',
                    'Servicios',
                ]),
                'type' => 'gasto',
            ]);

            $incomeCategory = Category::factory()->create([
                'user_id' => $user->id,
                'name' => fake()->randomElement([
                    'Salario',
                    'Freelance',
                    'Inversiones',
                    'Regalo',
                    'Otros ingresos',
                ]),
                'type' => 'ingreso',
            ]);

            Budget::factory()->create([
                'user_id' => $user->id,
                'category_id' => $expenseCategory->id,
                'month' => fake()->numberBetween(1, 12),
                'year' => fake()->numberBetween(2026, 2027),
            ]);

            Budget::factory()->create([
                'user_id' => $user->id,
                'category_id' => $incomeCategory->id,
                'month' => fake()->numberBetween(1, 12),
                'year' => fake()->numberBetween(2026, 2027),
            ]);

            $categories = collect([$expenseCategory, $incomeCategory]);

            foreach ($accounts as $account) {

                foreach (range(1, 5) as $i) {

                    $category = $categories->random();

                    Transaction::factory()->create([
                        'account_id' => $account->id,
                        'category_id' => $category->id,
                        'type' => $category->type,
                    ]);
                }
            }
        }

        $groups = Group::factory()
            ->count(20)
            ->create();

        foreach ($groups as $index => $group) {

            $groupUsers = $users->slice(($index % 4) * 5, 5);

            foreach ($groupUsers as $userIndex => $user) {

                $group->users()->attach($user->id, [
                    'role' => $userIndex === 0 ? 'admin' : 'member',
                    'joined_at' => now()->subDays(
                        fake()->numberBetween(1, 60)
                    ),
                ]);
            }

            foreach (range(1, 3) as $i) {

                $payer = $groupUsers->random();

                $participants = $groupUsers
                    ->random(min(3, $groupUsers->count()))
                    ->pluck('id')
                    ->values()
                    ->toArray();

                if (! in_array($payer->id, $participants)) {
                    $participants[array_rand($participants)] = $payer->id;
                }

                $sharedExpense = SharedExpenses::factory()->create([
                    'group_id' => $group->id,
                    'user_id' => $payer->id,
                    'participants' => $participants,
                ]);

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

        $rolAdmin = Role::findOrCreate('admin', 'web');
        $rolUser = Role::findOrCreate('user', 'web');
        $rolViewer = Role::findOrCreate('viewer', 'web');

        $permission = Permission::findOrCreate('accounts.create', 'web');
        $rolAdmin->givePermissionTo($permission);

        $admin = User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
        ]);
        $admin->syncRoles([$rolAdmin]);

        $user = User::factory()->create([
            'name' => 'User',
            'email' => 'user@example.com',
            'password' => bcrypt('password'),
        ]);
        $user->syncRoles([$rolUser]);

        $viewer = User::factory()->create([
            'name' => 'Viewer',
            'email' => 'viewer@example.com',
            'password' => bcrypt('password'),
        ]);
        $viewer->syncRoles([$rolViewer]);
    }
}

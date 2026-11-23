<?php

namespace Tests\Feature\Admin;

use App\Models\ActivityLog;
use App\Models\Role;
use App\Models\Setting;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FinanceDashboardTest extends TestCase
{
    use DatabaseTransactions;

    private function admin(string $role): User
    {
        $this->seed(RoleSeeder::class);
        $this->seed(PermissionSeeder::class);
        $u = User::factory()->create(['user_type' => 'admin', 'is_active' => true]);
        $u->roles()->attach(Role::where('name', $role)->first()->id);

        return $u;
    }

    private function set(string $k, string $v): void
    {
        Setting::updateOrCreate(['key' => $k], ['value' => $v, 'group_name' => 'finance']);
    }

    public function test_forbidden_without_finance_view(): void
    {
        Sanctum::actingAs($this->admin('admin_registration'));
        $this->getJson('/api/v1/admin/finance-dashboard')->assertForbidden();
    }

    public function test_returns_url_and_logs_view(): void
    {
        $this->set('finance_dashboard_enabled', 'true');
        $this->set('finance_dashboard_url', 'https://lookerstudio.google.com/embed/reporting/abc');
        $u = $this->admin('super_admin');
        Sanctum::actingAs($u);

        $this->getJson('/api/v1/admin/finance-dashboard')
            ->assertOk()->assertJsonPath('data.url', 'https://lookerstudio.google.com/embed/reporting/abc');
        $this->assertTrue(ActivityLog::where('user_id', $u->id)->where('action', 'finance.dashboard_viewed')->exists());
    }

    public function test_rejects_non_looker_host(): void
    {
        $this->set('finance_dashboard_enabled', 'true');
        $this->set('finance_dashboard_url', 'https://evil.example.com/x');
        Sanctum::actingAs($this->admin('super_admin'));

        $this->getJson('/api/v1/admin/finance-dashboard')->assertOk()->assertJsonPath('data.url', null);
    }

    public function test_public_settings_hide_finance(): void
    {
        $this->set('finance_dashboard_url', 'https://lookerstudio.google.com/embed/reporting/abc');
        $this->getJson('/api/v1/public/settings')->assertOk()->assertJsonMissingPath('data.finance_dashboard_url');
    }
}

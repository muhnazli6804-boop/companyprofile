<?php

namespace Tests\Feature\Admin;

use App\Models\ActivityLog;
use App\Models\Permission;
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

        $res = $this->getJson('/api/v1/admin/finance-dashboard')
            ->assertOk()->assertJsonPath('data.url', 'https://lookerstudio.google.com/embed/reporting/abc');
        // Laravel menambahkan "private" di belakangnya, jadi cukup cek no-store ada.
        $this->assertStringContainsString('no-store', $res->headers->get('Cache-Control'));
        $this->assertTrue(ActivityLog::where('user_id', $u->id)->where('action', 'finance.dashboard_viewed')->exists());
    }

    public function test_rejects_non_looker_host(): void
    {
        $this->set('finance_dashboard_enabled', 'true');
        $this->set('finance_dashboard_url', 'https://evil.example.com/x');
        Sanctum::actingAs($this->admin('super_admin'));

        $this->getJson('/api/v1/admin/finance-dashboard')->assertOk()->assertJsonPath('data.url', null);
    }

    public function test_accepts_datastudio_host(): void
    {
        $url = 'https://datastudio.google.com/embed/reporting/71e72570-2c98-4d99-8b73-37d81e89d975/page/p_u56p73jk9d';
        $this->set('finance_dashboard_enabled', 'true');
        $this->set('finance_dashboard_url', $url);
        Sanctum::actingAs($this->admin('super_admin'));

        $this->getJson('/api/v1/admin/finance-dashboard')->assertOk()->assertJsonPath('data.url', $url);
    }

    public function test_rejects_url_outside_embed_path(): void
    {
        $this->set('finance_dashboard_enabled', 'true');
        $this->set('finance_dashboard_url', 'https://lookerstudio.google.com/reporting/abc');
        Sanctum::actingAs($this->admin('super_admin'));

        $this->getJson('/api/v1/admin/finance-dashboard')->assertOk()->assertJsonPath('data.url', null);
    }

    private const GOOD = 'https://datastudio.google.com/embed/reporting/71e72570-2c98-4d99-8b73-37d81e89d975/page/p_u56p73jk9d';

    private function payload(array $over = []): array
    {
        return array_merge(['enabled' => true, 'title' => 'Dashboard Keuangan', 'url' => self::GOOD], $over);
    }

    public function test_super_admin_can_save_and_read_config(): void
    {
        Sanctum::actingAs($this->admin('super_admin'));

        $this->putJson('/api/v1/admin/finance-dashboard', $this->payload())->assertOk();
        $this->getJson('/api/v1/admin/finance-dashboard')
            ->assertOk()
            ->assertJsonPath('data.url', self::GOOD)
            ->assertJsonPath('data.config.url', self::GOOD);
    }

    public function test_finance_viewer_who_is_not_super_admin_cannot_write_but_can_read_without_config(): void
    {
        $this->seed(RoleSeeder::class);
        $this->seed(PermissionSeeder::class);
        $this->set('finance_dashboard_enabled', 'true');
        $this->set('finance_dashboard_url', self::GOOD);
        // Role kustom yang diberi finance.view lewat manajemen role, bukan super_admin.
        $role = Role::create(['name' => 'keuangan_uji', 'label' => 'Keuangan Uji']);
        $role->permissions()->sync(Permission::where('name', 'finance.view')->pluck('id'));
        $u = User::factory()->create(['user_type' => 'admin', 'is_active' => true]);
        $u->roles()->attach($role->id);
        Sanctum::actingAs($u);

        $this->putJson('/api/v1/admin/finance-dashboard', $this->payload(['title' => 'X']))->assertForbidden();
        $this->assertSame('Dashboard Keuangan', Setting::where('key', 'finance_dashboard_title')->value('value') ?? 'Dashboard Keuangan');
        $this->getJson('/api/v1/admin/finance-dashboard')
            ->assertOk()->assertJsonPath('data.url', self::GOOD)->assertJsonPath('data.config', null);
    }

    public function test_staff_has_no_finance_access(): void
    {
        $this->set('finance_dashboard_enabled', 'true');
        $this->set('finance_dashboard_url', self::GOOD);
        Sanctum::actingAs($this->admin('staff'));

        $this->getJson('/api/v1/admin/finance-dashboard')->assertForbidden();
        $this->putJson('/api/v1/admin/finance-dashboard', $this->payload())->assertForbidden();
    }

    public function test_content_admin_cannot_read_or_write_finance(): void
    {
        $this->set('finance_dashboard_enabled', 'true');
        $this->set('finance_dashboard_url', self::GOOD);
        Sanctum::actingAs($this->admin('admin_content'));

        $this->getJson('/api/v1/admin/finance-dashboard')->assertForbidden();
        $this->putJson('/api/v1/admin/finance-dashboard', $this->payload())->assertForbidden();
    }

    public function test_write_rejects_invalid_embed_url(): void
    {
        Sanctum::actingAs($this->admin('super_admin'));

        foreach (['<iframe src="'.self::GOOD.'"></iframe>', 'http://lookerstudio.google.com/embed/reporting/abc', 'https://evil.example.com/embed/reporting/abc', 'https://lookerstudio.google.com/reporting/abc'] as $bad) {
            $this->putJson('/api/v1/admin/finance-dashboard', $this->payload(['url' => $bad]))
                ->assertStatus(422)->assertJsonValidationErrors('url');
        }
    }

    public function test_general_settings_endpoint_cannot_write_or_expose_finance_keys(): void
    {
        $this->set('finance_dashboard_url', self::GOOD);
        $super = $this->admin('super_admin');
        Sanctum::actingAs($super);

        $this->putJson('/api/v1/admin/settings', ['settings' => ['finance_dashboard_url' => 'https://lookerstudio.google.com/embed/reporting/zzz']])
            ->assertStatus(422);
        $this->assertSame(self::GOOD, Setting::where('key', 'finance_dashboard_url')->value('value'));

        $this->getJson('/api/v1/admin/settings')->assertOk()->assertJsonMissingPath('data.flat.finance_dashboard_url');
    }

    public function test_public_settings_hide_finance(): void
    {
        $this->set('finance_dashboard_url', 'https://lookerstudio.google.com/embed/reporting/abc');
        $this->getJson('/api/v1/public/settings')->assertOk()->assertJsonMissingPath('data.finance_dashboard_url');
    }
}

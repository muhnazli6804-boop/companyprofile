<?php

namespace Tests\Feature\Admin;

use App\Models\Page;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class PageManagementTest extends TestCase
{
    use DatabaseTransactions;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\PermissionSeeder::class);
        $this->admin = User::where('user_type', 'admin')->first() ?? User::factory()->create(['user_type' => 'admin', 'is_active' => true]);
        $superAdmin = Role::where('name', 'super_admin')->first();
        if ($superAdmin && ! $this->admin->roles()->where('roles.id', $superAdmin->id)->exists()) {
            $this->admin->roles()->attach($superAdmin->id);
        }
    }

    public function test_admin_can_list_and_crud_pages(): void
    {
        // 1. List
        $listResponse = $this->actingAs($this->admin)->getJson('/api/v1/admin/pages');
        $listResponse->assertStatus(200)
            ->assertJsonStructure(['data']);

        // 2. Store
        $storeResponse = $this->actingAs($this->admin)->postJson('/api/v1/admin/pages', [
            'title' => 'Panduan Tata Tertib Sekolah 2026',
            'slug' => 'panduan-tata-tertib-2026',
            'content' => '<h2>Tata Tertib</h2><p>Tata tertib sekolah Yayasan Padindi.</p>',
            'meta_title' => 'Tata Tertib Sekolah 2026',
            'meta_description' => 'Panduan tata tertib resmi murid Yayasan Padindi.',
            'is_published' => true,
            'sort_order' => 5,
        ]);

        $storeResponse->assertStatus(201)
            ->assertJsonPath('data.title', 'Panduan Tata Tertib Sekolah 2026')
            ->assertJsonPath('data.slug', 'panduan-tata-tertib-2026')
            ->assertJsonPath('data.is_published', true);

        $pageId = $storeResponse->json('data.id');

        // 3. Show
        $showResponse = $this->actingAs($this->admin)->getJson("/api/v1/admin/pages/{$pageId}");
        $showResponse->assertStatus(200)
            ->assertJsonPath('data.id', $pageId)
            ->assertJsonPath('data.title', 'Panduan Tata Tertib Sekolah 2026');

        // 4. Update
        $updateResponse = $this->actingAs($this->admin)->putJson("/api/v1/admin/pages/{$pageId}", [
            'title' => 'Panduan Tata Tertib Sekolah 2026 Revisi',
            'slug' => 'panduan-tata-tertib-2026-revisi',
            'content' => '<h2>Tata Tertib Revisi</h2><p>Isi telah diperbarui.</p>',
            'meta_title' => 'Tata Tertib Revisi 2026',
            'meta_description' => 'Revisi deskripsi SEO.',
            'is_published' => false,
            'sort_order' => 10,
        ]);

        $updateResponse->assertStatus(200)
            ->assertJsonPath('data.title', 'Panduan Tata Tertib Sekolah 2026 Revisi')
            ->assertJsonPath('data.is_published', false);

        // 5. Destroy
        $deleteResponse = $this->actingAs($this->admin)->deleteJson("/api/v1/admin/pages/{$pageId}");
        $deleteResponse->assertStatus(200)
            ->assertJson(['message' => 'Halaman statis berhasil dihapus.']);

        $this->assertSoftDeleted('pages', ['id' => $pageId]);
    }

    public function test_public_can_access_published_page_and_receives_404_for_draft(): void
    {
        $publishedPage = Page::create([
            'title' => 'Struktur Kurikulum Merdeka',
            'slug' => 'struktur-kurikulum-merdeka',
            'content' => '<p>Kurikulum nasional berbasis penguatan karakter.</p>',
            'meta_title' => 'Kurikulum Merdeka Yayasan Padindi',
            'meta_description' => 'Penjelasan kurikulum.',
            'is_published' => true,
            'sort_order' => 1,
        ]);

        $draftPage = Page::create([
            'title' => 'Halaman Rahasia Internal',
            'slug' => 'halaman-rahasia-internal',
            'content' => '<p>Belum boleh dilihat publik.</p>',
            'meta_title' => 'Rahasia',
            'meta_description' => 'Deskripsi.',
            'is_published' => false,
            'sort_order' => 2,
        ]);

        // Public index
        $indexResponse = $this->getJson('/api/v1/public/pages');
        $indexResponse->assertStatus(200)
            ->assertJsonFragment(['slug' => 'struktur-kurikulum-merdeka'])
            ->assertJsonMissing(['slug' => 'halaman-rahasia-internal']);

        // Public show published
        $showResponse = $this->getJson('/api/v1/public/pages/struktur-kurikulum-merdeka');
        $showResponse->assertStatus(200)
            ->assertJsonPath('data.slug', 'struktur-kurikulum-merdeka')
            ->assertJsonPath('data.title', 'Struktur Kurikulum Merdeka');

        // Public show draft -> 404
        $draftResponse = $this->getJson('/api/v1/public/pages/halaman-rahasia-internal');
        $draftResponse->assertStatus(404);
    }
}

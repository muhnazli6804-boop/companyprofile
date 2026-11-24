<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class CmsAndMessagesTest extends TestCase
{
    use DatabaseTransactions;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\PermissionSeeder::class);
        $this->admin = User::where('user_type', 'admin')->first() ?? User::factory()->create(['user_type' => 'admin', 'is_active' => true]);
        $superAdmin = \App\Models\Role::where('name', 'super_admin')->first();
        if ($superAdmin && ! $this->admin->roles()->where('roles.id', $superAdmin->id)->exists()) {
            $this->admin->roles()->attach($superAdmin->id);
        }
    }

    public function test_admin_can_manage_banners(): void
    {
        $response = $this->actingAs($this->admin)->getJson('/api/v1/admin/banners');
        $response->assertStatus(200);

        $storeResponse = $this->actingAs($this->admin)->postJson('/api/v1/admin/banners', [
            'title' => '[Contoh] Banner Uji Coba Baru',
            'subtitle' => 'Subjudul banner uji coba',
            'image_path' => '/images/banner-test.jpg',
            'cta_label' => 'Klik Disini',
            'link_url' => '/pendaftaran',
            'is_active' => true,
        ]);

        $storeResponse->assertStatus(201);
        $bannerId = $storeResponse->json('data.id');

        $updateResponse = $this->actingAs($this->admin)->putJson("/api/v1/admin/banners/{$bannerId}", [
            'title' => '[Contoh] Banner Uji Coba Diperbarui',
            'subtitle' => 'Subjudul baru',
            'image_path' => '/images/banner-test-2.jpg',
            'cta_label' => 'Daftar Sekarang',
            'link_url' => '/pendaftaran',
            'is_active' => false,
        ]);
        $updateResponse->assertStatus(200);

        $deleteResponse = $this->actingAs($this->admin)->deleteJson("/api/v1/admin/banners/{$bannerId}");
        $deleteResponse->assertStatus(200);
    }

    public function test_admin_can_manage_posts_and_categories(): void
    {
        $catResponse = $this->actingAs($this->admin)->postJson('/api/v1/admin/post-categories', [
            'name' => '[Contoh] Kategori Baru Testing',
        ]);
        $catResponse->assertStatus(201);
        $catId = $catResponse->json('data.id');

        $postResponse = $this->actingAs($this->admin)->postJson('/api/v1/admin/posts', [
            'title' => '[Contoh] Berita Uji Coba Testing',
            'post_category_id' => $catId,
            'excerpt' => 'Ringkasan berita uji coba',
            'content' => 'Konten lengkap berita uji coba yayasan.',
            'status' => 'draft',
        ]);
        $postResponse->assertStatus(201);
        $postId = $postResponse->json('data.id');

        $publishResponse = $this->actingAs($this->admin)->patchJson("/api/v1/admin/posts/{$postId}/publish");
        $publishResponse->assertStatus(200);
        $this->assertEquals('published', $publishResponse->json('data.status'));

        // Public index should show published posts
        $publicPosts = $this->getJson('/api/v1/public/posts');
        $publicPosts->assertStatus(200);
    }

    public function test_public_contact_form_and_admin_inbox(): void
    {
        $contactResponse = $this->postJson('/api/v1/public/contact', [
            'name' => '[Contoh] Wali Murid Testing',
            'email' => 'wali.test@example.com',
            'phone' => '08123456789',
            'subject' => 'Tanya Biaya Masuk',
            'message' => 'Berapa rincian biaya pendaftaran tahun ini?',
        ]);
        $contactResponse->assertStatus(201);
        $messageId = $contactResponse->json('data.id');

        $adminList = $this->actingAs($this->admin)->getJson('/api/v1/admin/contact-messages');
        $adminList->assertStatus(200);

        $adminShow = $this->actingAs($this->admin)->getJson("/api/v1/admin/contact-messages/{$messageId}");
        $adminShow->assertStatus(200);
        $this->assertEquals('read', $adminShow->json('data.status'));

        $replyResponse = $this->actingAs($this->admin)->putJson("/api/v1/admin/contact-messages/{$messageId}", [
            'status' => 'replied',
        ]);
        $replyResponse->assertStatus(200);
    }

    public function test_admin_can_upload_image(): void
    {
        \Illuminate\Support\Facades\Storage::fake('public');

        $file = \Illuminate\Http\UploadedFile::fake()->image('hero-school.jpg', 1200, 600);

        $response = $this->actingAs($this->admin)->postJson('/api/v1/admin/uploads/images', [
            'image' => $file,
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'message',
            'data' => ['url', 'path'],
        ]);
        \Illuminate\Support\Facades\Storage::disk('public')->assertExists($response->json('data.path'));
    }

    public function test_guru_only_sees_and_accesses_own_contact_messages(): void
    {
        $guruRole = \App\Models\Role::where('name', 'guru')->first();
        $guruA = User::factory()->create(['user_type' => 'admin', 'is_active' => true, 'email' => 'guru.a.msg@padindi.test']);
        $guruA->roles()->attach($guruRole->id);

        $guruB = User::factory()->create(['user_type' => 'admin', 'is_active' => true, 'email' => 'guru.b.msg@padindi.test']);
        $guruB->roles()->attach($guruRole->id);

        $msgForA = \App\Models\ContactMessage::create([
            'name' => 'Wali Murid A',
            'email' => 'walia@example.com',
            'subject' => 'Pesan untuk Guru A',
            'message' => 'Halo Guru A',
            'status' => 'new',
            'assigned_to' => $guruA->id,
        ]);

        $msgForB = \App\Models\ContactMessage::create([
            'name' => 'Wali Murid B',
            'email' => 'walib@example.com',
            'subject' => 'Pesan untuk Guru B',
            'message' => 'Halo Guru B',
            'status' => 'new',
            'assigned_to' => $guruB->id,
        ]);

        $msgGeneral = \App\Models\ContactMessage::create([
            'name' => 'Pengunjung Umum',
            'email' => 'umum@example.com',
            'subject' => 'Pesan Umum Admin',
            'message' => 'Halo Admin',
            'status' => 'new',
            'assigned_to' => null,
        ]);

        $listA = $this->actingAs($guruA)->getJson('/api/v1/admin/contact-messages');
        $listA->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('meta.unread', 1);

        $idsA = collect($listA->json('data'))->pluck('id')->all();
        $this->assertEquals([$msgForA->id], $idsA);

        // Guru A boleh buka dan balas pesan miliknya sendiri
        $this->actingAs($guruA)->getJson("/api/v1/admin/contact-messages/{$msgForA->id}")->assertStatus(200);
        $this->actingAs($guruA)->putJson("/api/v1/admin/contact-messages/{$msgForA->id}", [
            'status' => 'replied',
            'reply_notes' => 'Sudah dijawab oleh Guru A',
        ])->assertStatus(200);

        // Guru A ditolak (403) saat akses pesan Guru B atau pesan umum
        $this->actingAs($guruA)->getJson("/api/v1/admin/contact-messages/{$msgForB->id}")->assertStatus(403);
        $this->actingAs($guruA)->putJson("/api/v1/admin/contact-messages/{$msgGeneral->id}", ['status' => 'read'])->assertStatus(403);
        $this->actingAs($guruA)->deleteJson("/api/v1/admin/contact-messages/{$msgForB->id}")->assertStatus(403);

        // Superadmin tetap melihat semua pesan
        $listAdmin = $this->actingAs($this->admin)->getJson('/api/v1/admin/contact-messages');
        $listAdmin->assertStatus(200);
        $adminIds = collect($listAdmin->json('data'))->pluck('id')->all();
        $this->assertContains($msgForA->id, $adminIds);
        $this->assertContains($msgForB->id, $adminIds);
        $this->assertContains($msgGeneral->id, $adminIds);
    }

    public function test_staff_can_manage_cms_content_and_media_library(): void
    {
        $staffRole = \App\Models\Role::where('name', 'staff')->first();
        $staffUser = User::factory()->create(['user_type' => 'admin', 'is_active' => true, 'email' => 'staff.cms@padindi.test']);
        $staffUser->roles()->attach($staffRole->id);

        // 1. Staff can create post
        $postRes = $this->actingAs($staffUser)->postJson('/api/v1/admin/posts', [
            'title' => 'Berita Staff Testing',
            'content' => 'Konten artikel oleh staf tata usaha.',
            'status' => 'draft',
        ]);
        $postRes->assertStatus(201);
        $postId = $postRes->json('data.id');

        // 2. Staff can create gallery
        $galRes = $this->actingAs($staffUser)->postJson('/api/v1/admin/galleries', [
            'title' => 'Galeri Staff Testing',
            'description' => 'Dokumentasi kegiatan oleh staf.',
            'is_published' => true,
        ]);
        $galRes->assertStatus(201);

        // 3. Staff can upload media image
        \Illuminate\Support\Facades\Storage::fake('public');
        $file = \Illuminate\Http\UploadedFile::fake()->image('staff-photo.jpg', 600, 400);

        $uploadRes = $this->actingAs($staffUser)->postJson('/api/v1/admin/uploads/images', ['image' => $file]);
        $uploadRes->assertStatus(200);
        $filePath = $uploadRes->json('data.path');
        \Illuminate\Support\Facades\Storage::disk('public')->assertExists($filePath);

        // 4. Staff can read public settings (contains FAQ & Achievements)
        $publicSettingsRes = $this->actingAs($staffUser)->getJson('/api/v1/public/settings');
        $publicSettingsRes->assertStatus(200);

        // 5. Super Admin updates FAQ & Achievements settings
        $setPutRes = $this->actingAs($this->admin)->putJson('/api/v1/admin/settings', [
            'settings' => [
                'site_faqs' => json_encode([['id' => 1, 'question' => 'Q?', 'answer' => 'A!']]),
                'site_achievements' => json_encode([['id' => 1, 'title' => 'Juara 1']]),
            ],
        ]);
        $setPutRes->assertStatus(200);

        $faqVal = \App\Models\Setting::where('key', 'site_faqs')->value('value');
        $this->assertStringContainsString('Q?', $faqVal);
    }

    public function test_admin_and_staff_can_access_and_update_via_admin_cms_endpoint(): void
    {
        // 1. Unauthenticated request to /admin/cms is rejected with 401
        $this->getJson('/api/v1/admin/cms')->assertStatus(401);

        $staffRole = \App\Models\Role::where('name', 'staff')->first();
        $staffUser = User::factory()->create(['user_type' => 'admin', 'is_active' => true, 'email' => 'staff.cms.endpoint@padindi.test']);
        $staffUser->roles()->attach($staffRole->id);

        // 2. Staff can access GET /api/v1/admin/cms
        $getCmsRes = $this->actingAs($staffUser)->getJson('/api/v1/admin/cms');
        $getCmsRes->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['flat', 'grouped'],
            ]);

        // 3. Staff can update CMS content via PUT /api/v1/admin/cms
        $putCmsRes = $this->actingAs($staffUser)->putJson('/api/v1/admin/cms', [
            'settings' => [
                'vision' => 'Visi Sekolah Padindi Unggul',
                'site_name' => 'Yayasan Pendidikan Padindi',
                'site_faqs' => json_encode([['id' => 99, 'question' => 'Pertanyaan CMS?', 'answer' => 'Jawaban CMS!']]),
            ],
        ]);
        $putCmsRes->assertStatus(200);

        $this->assertEquals('Visi Sekolah Padindi Unggul', \App\Models\Setting::where('key', 'vision')->value('value'));
        $this->assertEquals('Yayasan Pendidikan Padindi', \App\Models\Setting::where('key', 'site_name')->value('value'));
        $this->assertStringContainsString('Pertanyaan CMS?', \App\Models\Setting::where('key', 'site_faqs')->value('value'));

        // 4. Super Admin can also access and update via /api/v1/admin/cms
        $adminGetRes = $this->actingAs($this->admin)->getJson('/api/v1/admin/cms');
        $adminGetRes->assertStatus(200);

        // 5. User without content.manage permission is rejected with 403
        $applicantUser = User::factory()->create(['user_type' => 'applicant', 'is_active' => true]);
        $this->actingAs($applicantUser)->getJson('/api/v1/admin/cms')->assertStatus(403);
    }

    public function test_posts_and_galleries_support_pending_revision_and_rejected_statuses(): void
    {
        // 1. Post creation & update with extended statuses
        $postRes = $this->actingAs($this->admin)->postJson('/api/v1/admin/posts', [
            'title' => 'Artikel Menunggu Moderasi',
            'content' => 'Konten artikel menunggu review yayasan.',
            'status' => 'pending',
        ]);
        $postRes->assertStatus(201);
        $this->assertEquals('pending', $postRes->json('data.status'));
        $postId = $postRes->json('data.id');

        // Update to revision
        $revRes = $this->actingAs($this->admin)->putJson("/api/v1/admin/posts/{$postId}", [
            'status' => 'revision',
        ]);
        $revRes->assertStatus(200);
        $this->assertEquals('revision', $revRes->json('data.status'));

        // Update to rejected
        $rejRes = $this->actingAs($this->admin)->putJson("/api/v1/admin/posts/{$postId}", [
            'status' => 'rejected',
        ]);
        $rejRes->assertStatus(200);
        $this->assertEquals('rejected', $rejRes->json('data.status'));

        // Invalid status should be rejected
        $invRes = $this->actingAs($this->admin)->putJson("/api/v1/admin/posts/{$postId}", [
            'status' => 'invalid_status_xyz',
        ]);
        $invRes->assertStatus(422);

        // 2. Gallery creation & update with extended statuses and is_published sync
        $galRes = $this->actingAs($this->admin)->postJson('/api/v1/admin/galleries', [
            'title' => 'Dokumentasi Pending Verifikasi',
            'description' => 'Foto kegiatan ekskul',
            'status' => 'pending',
        ]);
        $galRes->assertStatus(201);
        $this->assertEquals('pending', $galRes->json('data.status'));
        $this->assertFalse($galRes->json('data.is_published'));
        $galId = $galRes->json('data.id');

        // Update gallery to revision
        $galRev = $this->actingAs($this->admin)->putJson("/api/v1/admin/galleries/{$galId}", [
            'status' => 'revision',
        ]);
        $galRev->assertStatus(200);
        $this->assertEquals('revision', $galRev->json('data.status'));
        $this->assertFalse($galRev->json('data.is_published'));

        // Update gallery to rejected
        $galRej = $this->actingAs($this->admin)->putJson("/api/v1/admin/galleries/{$galId}", [
            'status' => 'rejected',
        ]);
        $galRej->assertStatus(200);
        $this->assertEquals('rejected', $galRej->json('data.status'));
        $this->assertFalse($galRej->json('data.is_published'));

        // Update gallery to published
        $galPub = $this->actingAs($this->admin)->putJson("/api/v1/admin/galleries/{$galId}", [
            'status' => 'published',
        ]);
        $galPub->assertStatus(200);
        $this->assertEquals('published', $galPub->json('data.status'));
        $this->assertTrue($galPub->json('data.is_published'));

        // Invalid status on gallery should be rejected
        $galInv = $this->actingAs($this->admin)->putJson("/api/v1/admin/galleries/{$galId}", [
            'status' => 'not_a_valid_status',
        ]);
        $galInv->assertStatus(422);
    }
}

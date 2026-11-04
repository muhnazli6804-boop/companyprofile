<?php

/**
 * Script pembanding skema database padindi (hasil migrasi Laravel)
 * dengan padindi_ref (hasil impor langsung dari docs/schema-padindi.sql).
 *
 * Jalankan: php tests/Support/compare_schema.php
 */

require __DIR__ . '/../../vendor/autoload.php';

$app = require_once __DIR__ . '/../../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$config = config('database.connections.pgsql');

$pdoRef = new PDO(
    "pgsql:host={$config['host']};port={$config['port']};dbname=padindi_ref",
    $config['username'],
    $config['password'],
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

$pdoApp = DB::connection()->getPdo();

echo "=== MEMBANDINGKAN SKEMA padindi DENGAN padindi_ref ===\n\n";

// 1. Ambil semua tabel di padindi_ref (abaikan skema selain public)
$stmt = $pdoRef->query("
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
");
$refTables = $stmt->fetchAll(PDO::FETCH_COLUMN);

// Ambil semua tabel di padindi
$stmt = $pdoApp->query("
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
");
$appTables = $stmt->fetchAll(PDO::FETCH_COLUMN);

$missingTables = array_diff($refTables, $appTables);
if (!empty($missingTables)) {
    echo "[GALAT] Tabel berikut ada di padindi_ref tapi belum ada di padindi:\n";
    foreach ($missingTables as $t) {
        echo "  - $t\n";
    }
} else {
    echo "[OK] Semua " . count($refTables) . " tabel referensi ada di padindi.\n";
}

$differences = 0;

foreach ($refTables as $table) {
    if (in_array($table, $missingTables)) {
        continue;
    }

    // Bandingkan kolom
    $queryCol = "
        SELECT column_name, udt_name, is_nullable, character_maximum_length, numeric_precision, numeric_scale
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = :tbl
        ORDER BY column_name;
    ";

    $stmt1 = $pdoRef->prepare($queryCol);
    $stmt1->execute(['tbl' => $table]);
    $colsRef = $stmt1->fetchAll(PDO::FETCH_ASSOC);

    $stmt2 = $pdoApp->prepare($queryCol);
    $stmt2->execute(['tbl' => $table]);
    $colsApp = $stmt2->fetchAll(PDO::FETCH_ASSOC);

    $colsRefMap = [];
    foreach ($colsRef as $c) {
        $colsRefMap[$c['column_name']] = $c;
    }

    $colsAppMap = [];
    foreach ($colsApp as $c) {
        $colsAppMap[$c['column_name']] = $c;
    }

    $missingCols = array_diff(array_keys($colsRefMap), array_keys($colsAppMap));
    if (!empty($missingCols)) {
        echo "[GALAT] Tabel $table kehilangan kolom: " . implode(', ', $missingCols) . "\n";
        $differences++;
    }

    foreach ($colsRefMap as $colName => $cRef) {
        if (!isset($colsAppMap[$colName])) continue;
        $cApp = $colsAppMap[$colName];

        if ($cRef['udt_name'] !== $cApp['udt_name']) {
            echo "[BEDA TIPE] Tabel $table, kolom $colName: ref={$cRef['udt_name']} vs app={$cApp['udt_name']}\n";
            $differences++;
        }
        if ($cRef['is_nullable'] !== $cApp['is_nullable']) {
            echo "[BEDA NULL] Tabel $table, kolom $colName: ref={$cRef['is_nullable']} vs app={$cApp['is_nullable']}\n";
            $differences++;
        }
    }
}

if ($differences === 0 && empty($missingTables)) {
    echo "\n[SUKSES] Seluruh tabel dan kolom padindi identik dengan padindi_ref!\n";
    exit(0);
} else {
    echo "\n[SELESAI DENGAN PERBEDAAN] Ditemukan $differences perbedaan kolom/tipe.\n";
    exit(1);
}

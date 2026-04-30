<?php
/*
 * One-time guarded update for the translated home slideshow "5 Pearls" title.
 * Upload to the WordPress root, run dry run first, then apply=1.
 */

$token = 'f1c1fc7d2db7b3b86bce4a1ff8e0a262e3f3c3e2';

header('Content-Type: text/plain; charset=utf-8');

if (!isset($_GET['token']) || $_GET['token'] !== $token) {
    http_response_code(403);
    echo "Forbidden\n";
    exit;
}

require_once dirname(__FILE__) . '/wp-load.php';

global $wpdb;

$backup_option = 'codex_home_slide_translations_backup_20260428';
$source_slide_id = 207;

$translations = array(
    'it' => "5 Perle del Mondo\nComincia il viaggio...",
    'en' => "5 Pearls of the World\nThe journey begins...",
    'fr' => "5 Perles du Monde\nLe voyage commence...",
    'ar' => "خمس لآلئ العالم\nتبدأ الرحلة...",
    'de' => "5 Perlen der Welt\nDie Reise beginnt...",
    'es' => "5 Perlas del Mundo\nComienza el viaje...",
    'zh-hans' => "世界五颗珍珠\n旅程开始...",
    'ja' => "世界の5つの真珠\n旅が始まります...",
);

function grhst_log($message) {
    echo $message . "\n";
}

function grhst_table_exists($table) {
    global $wpdb;
    return $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $table)) === $table;
}

function grhst_translation_rows($source_slide_id) {
    global $wpdb;
    $table = $wpdb->prefix . 'icl_translations';
    if (!grhst_table_exists($table)) {
        return array();
    }

    $source = $wpdb->get_row($wpdb->prepare(
        "SELECT trid, element_type FROM $table WHERE element_id = %d AND element_type LIKE 'post_%' LIMIT 1",
        (int) $source_slide_id
    ), ARRAY_A);

    if (!$source) {
        return array();
    }

    return $wpdb->get_results($wpdb->prepare(
        "SELECT t.element_id, t.language_code, t.element_type, p.post_title, p.post_name, p.post_status
         FROM $table t
         JOIN {$wpdb->posts} p ON p.ID = t.element_id
         WHERE t.trid = %d AND t.element_type = %s
         ORDER BY FIELD(t.language_code, 'it','en','fr','ar','de','es','zh-hans','ja'), t.language_code",
        (int) $source['trid'],
        $source['element_type']
    ), ARRAY_A);
}

function grhst_rows_by_language($source_slide_id) {
    $rows = grhst_translation_rows($source_slide_id);
    $by_language = array();
    foreach ($rows as $row) {
        $by_language[$row['language_code']] = $row;
    }
    return $by_language;
}

function grhst_current_state($source_slide_id) {
    $rows = grhst_translation_rows($source_slide_id);
    $state = array();
    foreach ($rows as $row) {
        $post_id = (int) $row['element_id'];
        $state[] = array(
            'ID' => $post_id,
            'language_code' => $row['language_code'],
            'element_type' => $row['element_type'],
            'post_title' => $row['post_title'],
            'post_name' => $row['post_name'],
            'post_status' => $row['post_status'],
            '_h_title' => get_post_meta($post_id, '_h_title', true),
        );
    }
    return $state;
}

function grhst_backup($source_slide_id) {
    global $backup_option;
    $state = grhst_current_state($source_slide_id);
    $backup = array(
        'created_at' => date('c'),
        'source_slide_id' => (int) $source_slide_id,
        'state' => $state,
    );

    update_option($backup_option, $backup, false);

    $upload = wp_upload_dir();
    $dir = trailingslashit($upload['basedir']) . 'codex-home-slide-translation-backups';
    if (!is_dir($dir)) {
        wp_mkdir_p($dir);
    }
    $file = trailingslashit($dir) . 'home-slide-before-' . date('Ymd-His') . '.serialized.txt';
    file_put_contents($file, serialize($backup));
    return array($backup, $file);
}

function grhst_restore_backup() {
    global $backup_option;
    $backup = get_option($backup_option);
    if (!is_array($backup) || empty($backup['state']) || !is_array($backup['state'])) {
        return false;
    }

    foreach ($backup['state'] as $row) {
        if (!isset($row['ID'])) {
            continue;
        }
        update_post_meta((int) $row['ID'], '_h_title', isset($row['_h_title']) ? $row['_h_title'] : '');
    }

    if (function_exists('wp_cache_flush')) {
        wp_cache_flush();
    }
    return true;
}

function grhst_plain($value) {
    $value = (string) $value;
    $value = str_replace(array("\r\n", "\r"), "\n", $value);
    return str_replace("\n", ' | ', $value);
}

function grhst_print_audit($source_slide_id, $translations) {
    $by_language = grhst_rows_by_language($source_slide_id);
    grhst_log("Current / planned _h_title values:");
    foreach ($translations as $language_code => $wanted) {
        if (!isset($by_language[$language_code])) {
            grhst_log($language_code . " MISSING translation row");
            continue;
        }
        $row = $by_language[$language_code];
        $post_id = (int) $row['element_id'];
        $current = get_post_meta($post_id, '_h_title', true);
        grhst_log($language_code . " id=" . $post_id . " slug=" . $row['post_name']);
        grhst_log("  current: " . grhst_plain($current));
        grhst_log("  planned: " . grhst_plain($wanted));
    }
}

if (isset($_GET['rollback']) && $_GET['rollback'] === '1') {
    $ok = grhst_restore_backup();
    grhst_log($ok ? 'Rollback restored _h_title values from backup option.' : 'Rollback failed: backup option missing.');
    exit;
}

if (isset($_GET['audit']) && $_GET['audit'] === '1') {
    grhst_print_audit($source_slide_id, $translations);
    exit;
}

if (isset($_GET['apply']) && $_GET['apply'] === '1') {
    list($backup, $backup_file) = grhst_backup($source_slide_id);
    grhst_log('Backup option written: ' . $backup_option);
    grhst_log('Backup file written: ' . $backup_file);

    $by_language = grhst_rows_by_language($source_slide_id);
    foreach ($translations as $language_code => $wanted) {
        if (!isset($by_language[$language_code])) {
            grhst_log('SKIP missing translation row: ' . $language_code);
            continue;
        }
        $post_id = (int) $by_language[$language_code]['element_id'];
        update_post_meta($post_id, '_h_title', $wanted);
        grhst_log('Updated ' . $language_code . ' id=' . $post_id . ' to: ' . grhst_plain($wanted));
    }

    if (function_exists('wp_cache_flush')) {
        wp_cache_flush();
    }
    grhst_log('Done.');
    exit;
}

grhst_log("Dry run only. Nothing changed.");
grhst_print_audit($source_slide_id, $translations);
grhst_log("Run with &apply=1 to update. Run with &rollback=1 to restore after apply.");

<?php
/*
 * One-time guarded update for gallery ring prices.
 * Upload to the WordPress root, run dry run first, then apply=1.
 */

$token = '0cbc5c9251a95febdcf6bde26d8627b5a885889e';

header('Content-Type: text/plain; charset=utf-8');

if (!isset($_GET['token']) || $_GET['token'] !== $token) {
    http_response_code(403);
    echo "Forbidden\n";
    exit;
}

require_once dirname(__FILE__) . '/wp-load.php';

global $wpdb;

$backup_option = 'codex_gallery_prices_backup_20260428';
$new_delhi_white_slug = 'anello-new-delhi-oro-bianco';

$targets = array(
    354 => array('label' => 'Berlin :: Anello Oro bianco e Oro Giallo', 'price' => '€ 6.200'),
    527 => array('label' => 'Marrakech :: Anello Oro Bianco', 'price' => '€ 8.500'),
    442 => array('label' => 'Marrakech :: Anello Oro Giallo', 'price' => '€ 8.500'),
    467 => array('label' => 'New Delhi :: Anello Oro Giallo', 'price' => '€ 7.600'),
    553 => array(
        'label' => 'New Delhi :: Anello Oro Bianco',
        'price' => '€ 7.600',
        'force_slug' => $new_delhi_white_slug,
        'clone_from' => 467,
    ),
    431 => array('label' => 'New York :: Anello Oro Bianco', 'price' => '€ 8.100'),
    573 => array('label' => 'New York :: Anello Oro Giallo', 'price' => '€ 8.100'),
    585 => array('label' => 'Sydney :: Anello Oro Bianco', 'price' => '€ 7.700'),
    334 => array('label' => 'Sydney :: Anello Oro Giallo', 'price' => '€ 7.700'),
);

function grgp_log($message) {
    echo $message . "\n";
}

function grgp_dump($value) {
    print_r($value);
    echo "\n";
}

function grgp_table_exists($table) {
    global $wpdb;
    return $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $table)) === $table;
}

function grgp_post($id) {
    global $wpdb;
    return $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->posts} WHERE ID = %d LIMIT 1", (int) $id), ARRAY_A);
}

function grgp_postmeta($ids) {
    global $wpdb;
    $ids = array_values(array_unique(array_map('intval', $ids)));
    if (!$ids) return array();
    return $wpdb->get_results(
        "SELECT * FROM {$wpdb->postmeta} WHERE post_id IN (" . implode(',', $ids) . ") ORDER BY post_id, meta_id",
        ARRAY_A
    );
}

function grgp_term_relationships($ids) {
    global $wpdb;
    $ids = array_values(array_unique(array_map('intval', $ids)));
    if (!$ids) return array();
    return $wpdb->get_results(
        "SELECT * FROM {$wpdb->term_relationships} WHERE object_id IN (" . implode(',', $ids) . ") ORDER BY object_id, term_taxonomy_id",
        ARRAY_A
    );
}

function grgp_translations($source_id) {
    global $wpdb;
    $source_id = (int) $source_id;
    $table = $wpdb->prefix . 'icl_translations';
    $fallback = array(array(
        'element_id' => $source_id,
        'language_code' => '',
        'element_type' => 'post_post',
    ));

    if (!grgp_table_exists($table)) return $fallback;

    $source = $wpdb->get_row($wpdb->prepare(
        "SELECT trid, element_type FROM $table WHERE element_id = %d AND element_type LIKE 'post_%' LIMIT 1",
        $source_id
    ), ARRAY_A);

    if (!$source) return $fallback;

    $rows = $wpdb->get_results($wpdb->prepare(
        "SELECT element_id, language_code, element_type FROM $table WHERE trid = %d AND element_type = %s ORDER BY language_code",
        (int) $source['trid'],
        $source['element_type']
    ), ARRAY_A);

    return $rows ? $rows : $fallback;
}

function grgp_target_post_ids($targets) {
    $ids = array();
    foreach ($targets as $source_id => $_target) {
        foreach (grgp_translations($source_id) as $translation) {
            $ids[] = (int) $translation['element_id'];
        }
    }
    return array_values(array_unique(array_filter($ids)));
}

function grgp_slug_conflicts($slug, $wanted_post_id) {
    global $wpdb;
    return $wpdb->get_results($wpdb->prepare(
        "SELECT ID, post_type, post_title, post_name, post_status FROM {$wpdb->posts} WHERE post_name = %s AND ID <> %d ORDER BY ID",
        $slug,
        (int) $wanted_post_id
    ), ARRAY_A);
}

function grgp_price_in_content($content) {
    $space = '(?:\s|&nbsp;|&#160;|\xC2\xA0)*';
    $euro = '(?:€|\xE2\x82\xAC|&euro;|&#8364;|&#x20AC;|â‚¬)';
    $pattern = '/<li>' . $space . $euro . $space . '(?:[0-9]{1,3}(?:[.,]\s?[0-9]{3})+|[0-9]+)(?:\s*euro)?' . $space . '<\/li>/i';
    if (preg_match($pattern, $content, $match)) {
        return trim(strip_tags(str_replace(array('&nbsp;', '&#160;'), ' ', $match[0])));
    }
    return '';
}

function grgp_replace_price($content, $new_price) {
    $space = '(?:\s|&nbsp;|&#160;|\xC2\xA0)*';
    $euro = '(?:€|\xE2\x82\xAC|&euro;|&#8364;|&#x20AC;|â‚¬)';
    $pattern = '/<li>' . $space . $euro . $space . '(?:[0-9]{1,3}(?:[.,]\s?[0-9]{3})+|[0-9]+)(?:\s*euro)?' . $space . '<\/li>/i';
    $updated = preg_replace($pattern, '<li>' . $new_price . '</li>', $content, 1, $count);
    if ($count > 0) return array($updated, $count, 'replaced');

    $updated = preg_replace('/<\/ul>/i', '<li>' . $new_price . '</li></ul>', $content, 1, $count);
    if ($count > 0) return array($updated, $count, 'inserted-before-ul-close');

    return array($content, 0, 'missing-price-list');
}

function grgp_clone_new_delhi_white_content($yellow_content, $new_price) {
    $content = $yellow_content;
    $content = str_replace('Oro Giallo 18 Kts', 'Oro Bianco 18 Kts', $content);
    $content = str_replace('Oro Giallo', 'Oro Bianco', $content);
    list($content) = grgp_replace_price($content, $new_price);
    return $content;
}

function grgp_update_post_fields($post_id, $fields) {
    global $wpdb;
    if (!$fields) return true;
    $fields['post_modified'] = current_time('mysql');
    $fields['post_modified_gmt'] = current_time('mysql', 1);
    $result = $wpdb->update($wpdb->posts, $fields, array('ID' => (int) $post_id));
    clean_post_cache((int) $post_id);
    return $result !== false;
}

function grgp_backup($targets, $slug) {
    global $wpdb, $backup_option;

    $target_ids = grgp_target_post_ids($targets);
    $conflict_rows = grgp_slug_conflicts($slug, 553);
    foreach ($conflict_rows as $row) {
        $target_ids[] = (int) $row['ID'];
    }
    $target_ids = array_values(array_unique(array_filter($target_ids)));

    $posts = array();
    foreach ($target_ids as $id) {
        $post = grgp_post($id);
        if ($post) $posts[$id] = $post;
    }

    $backup = array(
        'created_at' => current_time('mysql'),
        'target_ids' => $target_ids,
        'posts' => $posts,
        'postmeta' => grgp_postmeta($target_ids),
        'term_relationships' => grgp_term_relationships($target_ids),
        'slug_conflicts_before' => $conflict_rows,
    );

    $existing = get_option($backup_option);
    if (!$existing) {
        update_option($backup_option, serialize($backup));
    }

    $upload = wp_upload_dir();
    $dir = trailingslashit($upload['basedir']) . 'codex-gallery-price-backups';
    if (!is_dir($dir)) wp_mkdir_p($dir);
    $file = trailingslashit($dir) . 'gallery-prices-before-' . date('Ymd-His') . '.serialized.txt';
    file_put_contents($file, serialize($backup));

    return array($backup, $file, $existing ? 'existing-option-kept' : 'option-created');
}

function grgp_restore_backup() {
    global $wpdb, $backup_option;
    $raw = get_option($backup_option);
    if (!$raw) {
        grgp_log('No backup option found: ' . $backup_option);
        return false;
    }

    $backup = @unserialize($raw);
    if (!$backup) {
        $backup = json_decode($raw, true);
    }
    if (!$backup || empty($backup['posts'])) {
        grgp_log('Backup option is invalid.');
        return false;
    }

    foreach ($backup['posts'] as $id => $row) {
        $id = (int) $id;
        unset($row['ID']);
        $wpdb->update($wpdb->posts, $row, array('ID' => $id));
        clean_post_cache($id);
        grgp_log('Restored post row ' . $id);
    }

    return true;
}

function grgp_build_plan($targets, $slug) {
    $plan = array();
    foreach ($targets as $source_id => $target) {
        foreach (grgp_translations($source_id) as $translation) {
            $post = grgp_post((int) $translation['element_id']);
            $plan[] = array(
                'source_id' => (int) $source_id,
                'post_id' => (int) $translation['element_id'],
                'language' => isset($translation['language_code']) ? $translation['language_code'] : '',
                'title' => $post ? $post['post_title'] : '',
                'post_type' => $post ? $post['post_type'] : '',
                'post_name' => $post ? $post['post_name'] : '',
                'current_price' => $post ? grgp_price_in_content($post['post_content']) : '',
                'new_price' => $target['price'],
            );
        }
    }

    return array(
        'targets' => $plan,
        'slug_conflicts' => grgp_slug_conflicts($slug, 553),
    );
}

if (isset($_GET['rollback']) && $_GET['rollback'] === '1') {
    grgp_log('ROLLBACK');
    $ok = grgp_restore_backup();
    grgp_log($ok ? 'Rollback completed.' : 'Rollback failed.');
    exit($ok ? 0 : 1);
}

$apply = isset($_GET['apply']) && $_GET['apply'] === '1';
$plan = grgp_build_plan($targets, $new_delhi_white_slug);

grgp_log($apply ? 'APPLY MODE' : 'DRY RUN');
grgp_dump($plan);

if (!$apply) {
    grgp_log('No changes written. Add &apply=1 to update.');
    exit;
}

list($_backup, $backup_file, $backup_state) = grgp_backup($targets, $new_delhi_white_slug);
grgp_log('Backup state: ' . $backup_state);
grgp_log('Backup file: ' . $backup_file);

$updates = array();

foreach ($targets as $source_id => $target) {
    $source_id = (int) $source_id;
    $translations = grgp_translations($source_id);

    foreach ($translations as $translation) {
        $post_id = (int) $translation['element_id'];
        $post = grgp_post($post_id);
        if (!$post) {
            $updates[] = array('post_id' => $post_id, 'status' => 'missing');
            continue;
        }

        $content = $post['post_content'];
        $status = 'unchanged';

        if ($source_id === 553 && trim(strip_tags($content)) === '') {
            $yellow_id = 467;
            $yellow_post = grgp_post($yellow_id);
            if ($yellow_post) {
                $content = grgp_clone_new_delhi_white_content($yellow_post['post_content'], $target['price']);
                $status = 'cloned-from-new-delhi-yellow';
            }
        }

        list($new_content, $count, $price_status) = grgp_replace_price($content, $target['price']);
        $fields = array();
        if ($new_content !== $post['post_content']) {
            $fields['post_content'] = $new_content;
            $status = $status === 'unchanged' ? $price_status : $status . '+' . $price_status;
        } else {
            $status = $price_status === 'missing-price-list' ? 'price-not-found' : 'already-current';
        }

        if ($source_id === 553 && $post_id === 553) {
            $fields['post_title'] = $target['label'];
            $fields['post_name'] = $target['force_slug'];
            $fields['post_status'] = 'publish';
            $fields['post_type'] = 'post';
        }

        if ($fields) {
            $ok = grgp_update_post_fields($post_id, $fields);
            $updates[] = array('post_id' => $post_id, 'language' => isset($translation['language_code']) ? $translation['language_code'] : '', 'status' => $status, 'ok' => $ok);
        } else {
            $updates[] = array('post_id' => $post_id, 'language' => isset($translation['language_code']) ? $translation['language_code'] : '', 'status' => $status, 'ok' => true);
        }
    }
}

$conflicts = grgp_slug_conflicts($new_delhi_white_slug, 553);
foreach ($conflicts as $conflict) {
    if ($conflict['post_type'] === 'attachment') {
        $new_slug = $new_delhi_white_slug . '-attachment-' . (int) $conflict['ID'];
        $ok = grgp_update_post_fields((int) $conflict['ID'], array('post_name' => $new_slug));
        $updates[] = array('post_id' => (int) $conflict['ID'], 'status' => 'moved-attachment-slug-to-' . $new_slug, 'ok' => $ok);
    } else {
        $updates[] = array('post_id' => (int) $conflict['ID'], 'status' => 'slug-conflict-left-unchanged-' . $conflict['post_type'], 'ok' => false);
    }
}

if (function_exists('flush_rewrite_rules')) {
    flush_rewrite_rules(false);
}

grgp_log('Updates:');
grgp_dump($updates);
grgp_log('Done.');

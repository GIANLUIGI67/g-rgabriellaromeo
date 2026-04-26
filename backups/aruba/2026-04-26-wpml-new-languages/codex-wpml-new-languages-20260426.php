<?php
/*
 * One-time WPML migration for www.g-rgabriellaromeo.it.
 *
 * Upload this file to the WordPress root:
 * /www.g-rgabriellaromeo.it/wordpress/codex-wpml-new-languages-20260426.php
 *
 * Dry run:
 * https://www.g-rgabriellaromeo.it/wordpress/codex-wpml-new-languages-20260426.php?token=REDACTED_AFTER_USE
 *
 * Apply:
 * https://www.g-rgabriellaromeo.it/wordpress/codex-wpml-new-languages-20260426.php?token=REDACTED_AFTER_USE&apply=1
 *
 * Delete this file immediately after a successful run.
 */

header('Content-Type: text/plain; charset=UTF-8');

$codex_token = 'REDACTED_AFTER_USE';
$codex_request = array_merge($_GET, $_POST);
$request_token = isset($codex_request['token']) ? (string) $codex_request['token'] : '';

if (function_exists('hash_equals')) {
    $token_ok = hash_equals($codex_token, $request_token);
} else {
    $token_ok = strlen($codex_token) === strlen($request_token) && $codex_token === $request_token;
}

if (!$token_ok) {
    header('HTTP/1.1 403 Forbidden');
    echo "Forbidden\n";
    exit;
}

$apply = (isset($codex_request['apply']) && (string) $codex_request['apply'] === '1')
    || (isset($codex_request['codex_run']) && (string) $codex_request['codex_run'] === '1');

define('WP_USE_THEMES', false);
require_once dirname(__FILE__) . '/wp-load.php';

global $wpdb;

if (!isset($wpdb) || !function_exists('wp_insert_post')) {
    echo "WordPress did not load correctly.\n";
    exit;
}

$languages = array(
    'de' => array(
        'locale' => 'de_DE',
        'top_menu' => 'menu up de',
        'contact_menu' => 'menu2 de',
        'pages' => array(
            4 => array('title' => 'Galerie', 'slug' => 'galerie'),
            15 => array('title' => 'Kontakt', 'slug' => 'kontakt'),
            21 => array('title' => '5 Perlen der Welt', 'slug' => '5-perlen-der-welt'),
            184 => array('title' => 'Startseite', 'slug' => 'startseite'),
            320 => array('title' => 'Sydney Formular', 'slug' => 'sydney-kontaktformular'),
            346 => array('title' => 'Berlin Formular', 'slug' => 'berlin-kontaktformular'),
            381 => array('title' => 'New York Formular', 'slug' => 'new-york-kontaktformular'),
            385 => array('title' => 'New Delhi Formular', 'slug' => 'new-delhi-kontaktformular'),
            387 => array('title' => 'Marrakech Formular', 'slug' => 'marrakech-kontaktformular'),
        ),
        'portfolio' => array(
            235 => array('title' => 'NEW DELHI', 'slug' => 'new-delhi-de'),
            242 => array('title' => 'NEW YORK', 'slug' => 'new-york-de'),
            251 => array('title' => 'MARRAKECH', 'slug' => 'marrakech-de'),
            256 => array('title' => 'SYDNEY', 'slug' => 'sydney-de'),
            263 => array('title' => 'BERLIN', 'slug' => 'berlin-de'),
        ),
        'slides' => array(
            206 => '5 WIE DIE SINNE...',
            205 => '5 WIE DIE FINGER...',
            204 => '5 WIE DIE KONTINENTE...',
            202 => "5 WIE DIE STÄDTE...\nüber die wir die Welt bereisen",
            195 => "5 GRÜNDE...\num Teil dieser Reise zu sein\nin der die Perle die Protagonistin ist\nund Kunst, Geschichte,\nEreignisse, Magie und Schönheit vereint",
            207 => "5 Pearls of the World\nDie Reise beginnt...",
        ),
        'menu_titles' => array('home' => '5 Perlen der Welt', 'gallery' => 'Galerie', 'contact' => 'Kontakt'),
    ),
    'es' => array(
        'locale' => 'es_ES',
        'top_menu' => 'menu up es',
        'contact_menu' => 'menu2 es',
        'pages' => array(
            4 => array('title' => 'Galería', 'slug' => 'galeria'),
            15 => array('title' => 'Contacto', 'slug' => 'contacto'),
            21 => array('title' => '5 Perlas del Mundo', 'slug' => '5-perlas-del-mundo'),
            184 => array('title' => 'Inicio', 'slug' => 'inicio'),
            320 => array('title' => 'Formulario Sydney', 'slug' => 'formulario-sydney'),
            346 => array('title' => 'Formulario Berlin', 'slug' => 'formulario-berlin'),
            381 => array('title' => 'Formulario New York', 'slug' => 'formulario-new-york'),
            385 => array('title' => 'Formulario New Delhi', 'slug' => 'formulario-new-delhi'),
            387 => array('title' => 'Formulario Marrakech', 'slug' => 'formulario-marrakech'),
        ),
        'portfolio' => array(
            235 => array('title' => 'NEW DELHI', 'slug' => 'new-delhi-es'),
            242 => array('title' => 'NEW YORK', 'slug' => 'new-york-es'),
            251 => array('title' => 'MARRAKECH', 'slug' => 'marrakech-es'),
            256 => array('title' => 'SYDNEY', 'slug' => 'sydney-es'),
            263 => array('title' => 'BERLIN', 'slug' => 'berlin-es'),
        ),
        'slides' => array(
            206 => '5 COMO LOS SENTIDOS...',
            205 => '5 COMO LOS DEDOS...',
            204 => '5 COMO LOS CONTINENTES...',
            202 => "5 COMO LAS CIUDADES...\npor las que visitaremos el mundo",
            195 => "5 RAZONES...\npara formar parte de este viaje\nen el que la perla protagonista\nunirá arte, historia,\neventos, magia y belleza",
            207 => "5 Pearls of the World\nComienza el viaje...",
        ),
        'menu_titles' => array('home' => '5 Perlas del Mundo', 'gallery' => 'Galería', 'contact' => 'Contacto'),
    ),
    'zh-hans' => array(
        'locale' => 'zh_CN',
        'top_menu' => 'menu up zh-hans',
        'contact_menu' => 'menu2 zh-hans',
        'pages' => array(
            4 => array('title' => '画廊', 'slug' => 'collections-zh-hans'),
            15 => array('title' => '联系我们', 'slug' => 'contact-zh-hans'),
            21 => array('title' => '世界五颗珍珠', 'slug' => '5-pearls-of-the-world-zh-hans'),
            184 => array('title' => '首页', 'slug' => 'homepage-zh-hans'),
            320 => array('title' => '悉尼咨询表', 'slug' => 'sydney-contact-form-zh-hans'),
            346 => array('title' => '柏林咨询表', 'slug' => 'berlin-contact-form-zh-hans'),
            381 => array('title' => '纽约咨询表', 'slug' => 'new-york-contact-form-zh-hans'),
            385 => array('title' => '新德里咨询表', 'slug' => 'new-delhi-contact-form-zh-hans'),
            387 => array('title' => '马拉喀什咨询表', 'slug' => 'marrakech-contact-form-zh-hans'),
        ),
        'portfolio' => array(
            235 => array('title' => 'NEW DELHI', 'slug' => 'new-delhi-zh-hans'),
            242 => array('title' => 'NEW YORK', 'slug' => 'new-york-zh-hans'),
            251 => array('title' => 'MARRAKECH', 'slug' => 'marrakech-zh-hans'),
            256 => array('title' => 'SYDNEY', 'slug' => 'sydney-zh-hans'),
            263 => array('title' => 'BERLIN', 'slug' => 'berlin-zh-hans'),
        ),
        'slides' => array(
            206 => '5 如五感...',
            205 => '5 如手指...',
            204 => '5 如大洲...',
            202 => "5 如城市...\n我们将通过它们走访世界",
            195 => "5 个理由...\n成为这段旅程的一部分\n珍珠将成为主角\n连接艺术、历史、事件、魔法与美丽",
            207 => "5 Pearls of the World\n旅程开始...",
        ),
        'menu_titles' => array('home' => '世界五颗珍珠', 'gallery' => '画廊', 'contact' => '联系我们'),
    ),
    'ja' => array(
        'locale' => 'ja',
        'top_menu' => 'menu up ja',
        'contact_menu' => 'menu2 ja',
        'pages' => array(
            4 => array('title' => 'ギャラリー', 'slug' => 'collections-ja'),
            15 => array('title' => 'お問い合わせ', 'slug' => 'contact-ja'),
            21 => array('title' => '世界の5つの真珠', 'slug' => '5-pearls-of-the-world-ja'),
            184 => array('title' => 'ホームページ', 'slug' => 'homepage-ja'),
            320 => array('title' => 'シドニー フォーム', 'slug' => 'sydney-contact-form-ja'),
            346 => array('title' => 'ベルリン フォーム', 'slug' => 'berlin-contact-form-ja'),
            381 => array('title' => 'ニューヨーク フォーム', 'slug' => 'new-york-contact-form-ja'),
            385 => array('title' => 'ニューデリー フォーム', 'slug' => 'new-delhi-contact-form-ja'),
            387 => array('title' => 'マラケシュ フォーム', 'slug' => 'marrakech-contact-form-ja'),
        ),
        'portfolio' => array(
            235 => array('title' => 'NEW DELHI', 'slug' => 'new-delhi-ja'),
            242 => array('title' => 'NEW YORK', 'slug' => 'new-york-ja'),
            251 => array('title' => 'MARRAKECH', 'slug' => 'marrakech-ja'),
            256 => array('title' => 'SYDNEY', 'slug' => 'sydney-ja'),
            263 => array('title' => 'BERLIN', 'slug' => 'berlin-ja'),
        ),
        'slides' => array(
            206 => '五感のように5つ...',
            205 => '指のように5つ...',
            204 => '大陸のように5つ...',
            202 => "都市のように5つ...\nそこから世界を旅します",
            195 => "5つの理由...\nこの旅に加わるために\n主役となる真珠が\n芸術、歴史、出来事、魔法、美を結びます",
            207 => "5 Pearls of the World\n旅が始まります...",
        ),
        'menu_titles' => array('home' => '世界の5つの真珠', 'gallery' => 'ギャラリー', 'contact' => 'お問い合わせ'),
    ),
);

$top_menu_order = array(
    array('source_id' => 21, 'kind' => 'home'),
    array('source_id' => 263, 'kind' => 'city', 'title' => 'BERLIN'),
    array('source_id' => 251, 'kind' => 'city', 'title' => 'MARRAKECH'),
    array('source_id' => 235, 'kind' => 'city', 'title' => 'NEW DELHI'),
    array('source_id' => 242, 'kind' => 'city', 'title' => 'NEW YORK'),
    array('source_id' => 256, 'kind' => 'city', 'title' => 'SYDNEY'),
    array('source_id' => 4, 'kind' => 'gallery'),
);

$contact_menu_order = array(
    array('source_id' => 15, 'kind' => 'contact'),
    array('source_id' => 346, 'title' => 'Berlin Form'),
    array('source_id' => 387, 'title' => 'Marrakech Form'),
    array('source_id' => 385, 'title' => 'New Delhi Form'),
    array('source_id' => 381, 'title' => 'New York Form'),
    array('source_id' => 320, 'title' => 'Sydney Form'),
);

if (isset($codex_request['audit']) && (string) $codex_request['audit'] === '1') {
    $source_ids = array(4, 15, 21, 184, 235, 242, 251, 256, 263);
    $source_id_sql = implode(',', array_map('intval', $source_ids));
    $translation_table = $wpdb->prefix . 'icl_translations';

    echo "Languages:\n";
    $language_rows = $wpdb->get_results("SELECT code, english_name, active, default_locale FROM {$wpdb->prefix}icl_languages WHERE code IN ('it','en','fr','ar','de','es','zh-hans','ja') ORDER BY FIELD(code, 'it','en','fr','ar','de','es','zh-hans','ja')", ARRAY_A);
    foreach ($language_rows as $row) {
        echo $row['code'] . ' active=' . $row['active'] . ' locale=' . $row['default_locale'] . ' name=' . $row['english_name'] . "\n";
    }

    echo "\nSource translation groups:\n";
    $trids = $wpdb->get_col("SELECT DISTINCT trid FROM $translation_table WHERE element_type IN ('post_page', 'post_wpb_portfolio') AND element_id IN ($source_id_sql)");
    if ($trids) {
        $trid_sql = implode(',', array_map('intval', $trids));
        $rows = $wpdb->get_results(
            "SELECT t.trid, t.language_code, t.source_language_code, t.element_type, t.element_id, p.post_type, p.post_status, p.post_title, p.post_name
             FROM $translation_table t
             LEFT JOIN {$wpdb->posts} p ON p.ID = t.element_id
             WHERE t.trid IN ($trid_sql)
             ORDER BY t.trid, FIELD(t.language_code, 'it','en','fr','ar','de','es','zh-hans','ja'), t.language_code",
            ARRAY_A
        );
        foreach ($rows as $row) {
            echo 'trid=' . $row['trid']
                . ' lang=' . $row['language_code']
                . ' src=' . $row['source_language_code']
                . ' type=' . $row['element_type']
                . ' id=' . $row['element_id']
                . ' post_type=' . $row['post_type']
                . ' status=' . $row['post_status']
                . ' slug=' . $row['post_name']
                . ' title=' . $row['post_title'] . "\n";
        }
    }

    echo "\nCodex-created posts:\n";
    $rows = $wpdb->get_results(
        "SELECT pm.meta_value AS source_id, lang.meta_value AS codex_lang, p.ID, p.post_type, p.post_status, p.post_title, p.post_name
         FROM {$wpdb->postmeta} pm
         JOIN {$wpdb->posts} p ON p.ID = pm.post_id
         LEFT JOIN {$wpdb->postmeta} lang ON lang.post_id = p.ID AND lang.meta_key = '_codex_wpml_language'
         WHERE pm.meta_key = '_codex_wpml_source_id'
         ORDER BY CAST(pm.meta_value AS UNSIGNED), lang.meta_value, p.ID",
        ARRAY_A
    );
    foreach ($rows as $row) {
        echo 'source=' . $row['source_id']
            . ' codex_lang=' . $row['codex_lang']
            . ' id=' . $row['ID']
            . ' type=' . $row['post_type']
            . ' status=' . $row['post_status']
            . ' slug=' . $row['post_name']
            . ' title=' . $row['post_title'] . "\n";
    }

    echo "\nNav menus:\n";
    $rows = $wpdb->get_results(
        "SELECT t.term_id, t.name, tt.term_taxonomy_id, tx.trid, tx.language_code, tx.source_language_code, COUNT(tr.object_id) AS item_count
         FROM {$wpdb->terms} t
         JOIN {$wpdb->term_taxonomy} tt ON tt.term_id = t.term_id AND tt.taxonomy = 'nav_menu'
         LEFT JOIN $translation_table tx ON tx.element_type = 'tax_nav_menu' AND tx.element_id = tt.term_taxonomy_id
         LEFT JOIN {$wpdb->term_relationships} tr ON tr.term_taxonomy_id = tt.term_taxonomy_id
         GROUP BY t.term_id, t.name, tt.term_taxonomy_id, tx.trid, tx.language_code, tx.source_language_code
         ORDER BY tx.trid, FIELD(tx.language_code, 'it','en','fr','ar','de','es','zh-hans','ja'), t.name",
        ARRAY_A
    );
    foreach ($rows as $row) {
        echo 'term_id=' . $row['term_id']
            . ' tt_id=' . $row['term_taxonomy_id']
            . ' trid=' . $row['trid']
            . ' lang=' . $row['language_code']
            . ' src=' . $row['source_language_code']
            . ' items=' . $row['item_count']
            . ' name=' . $row['name'] . "\n";
    }

    echo "\nTheme menu locations:\n";
    $theme_mods = $wpdb->get_results("SELECT option_name, option_value FROM {$wpdb->options} WHERE option_name LIKE 'theme_mods_%'", ARRAY_A);
    foreach ($theme_mods as $row) {
        $value = maybe_unserialize($row['option_value']);
        if (is_array($value) && isset($value['nav_menu_locations'])) {
            foreach ($value['nav_menu_locations'] as $location => $term_id) {
                echo $row['option_name'] . ' ' . $location . '=' . $term_id . "\n";
            }
        }
    }

    echo "\nNew nav menu items:\n";
    $rows = $wpdb->get_results(
        "SELECT p.ID, p.post_title, p.post_status, object_id.meta_value AS object_id, object_type.meta_value AS object_type, tr.term_taxonomy_id, t.name AS menu_name
         FROM {$wpdb->posts} p
         LEFT JOIN {$wpdb->postmeta} object_id ON object_id.post_id = p.ID AND object_id.meta_key = '_menu_item_object_id'
         LEFT JOIN {$wpdb->postmeta} object_type ON object_type.post_id = p.ID AND object_type.meta_key = '_menu_item_object'
         LEFT JOIN {$wpdb->term_relationships} tr ON tr.object_id = p.ID
         LEFT JOIN {$wpdb->term_taxonomy} tt ON tt.term_taxonomy_id = tr.term_taxonomy_id AND tt.taxonomy = 'nav_menu'
         LEFT JOIN {$wpdb->terms} t ON t.term_id = tt.term_id
         WHERE p.post_type = 'nav_menu_item'
           AND p.ID IN (SELECT element_id FROM $translation_table WHERE element_type = 'post_nav_menu_item' AND language_code IN ('de','es','zh-hans','ja'))
         ORDER BY p.ID",
        ARRAY_A
    );
    foreach ($rows as $row) {
        echo 'item_id=' . $row['ID']
            . ' status=' . $row['post_status']
            . ' object_id=' . $row['object_id']
            . ' object_type=' . $row['object_type']
            . ' tt_id=' . $row['term_taxonomy_id']
            . ' menu=' . $row['menu_name']
            . ' title=' . $row['post_title'] . "\n";
    }

    exit;
}

if (!$apply) {
    echo "Dry run only. Nothing was changed.\n";
    echo "Will activate languages: " . implode(', ', array_keys($languages)) . "\n";
    echo "Will create/update per language: 9 pages, 5 portfolio items, 6 home slides, 2 nav menus.\n";
    echo "Run again with &apply=1 to apply.\n";
    exit;
}

function gr_log($message) {
    echo $message . "\n";
}

function gr_table($name) {
    global $wpdb;
    return $wpdb->prefix . $name;
}

function gr_backup_tables() {
    global $wpdb;
    $upload = wp_upload_dir();
    $dir = trailingslashit($upload['basedir']) . 'codex-wpml-backups';
    if (!is_dir($dir)) {
        wp_mkdir_p($dir);
    }
    $backup = array(
        'created_at' => date('c'),
        'icl_languages' => $wpdb->get_results('SELECT * FROM ' . gr_table('icl_languages'), ARRAY_A),
        'icl_locale_map' => $wpdb->get_results('SELECT * FROM ' . gr_table('icl_locale_map'), ARRAY_A),
        'icl_translations' => $wpdb->get_results('SELECT * FROM ' . gr_table('icl_translations'), ARRAY_A),
        'nav_terms' => $wpdb->get_results("SELECT t.*, tt.term_taxonomy_id, tt.taxonomy, tt.count FROM {$wpdb->terms} t JOIN {$wpdb->term_taxonomy} tt ON tt.term_id = t.term_id WHERE tt.taxonomy = 'nav_menu'", ARRAY_A),
        'menu_relationships' => $wpdb->get_results("SELECT tr.* FROM {$wpdb->term_relationships} tr JOIN {$wpdb->term_taxonomy} tt ON tt.term_taxonomy_id = tr.term_taxonomy_id WHERE tt.taxonomy = 'nav_menu'", ARRAY_A),
    );
    $file = trailingslashit($dir) . 'wpml-new-languages-before-' . date('Ymd-His') . '.json';
    file_put_contents($file, json_encode($backup));
    return $file;
}

function gr_translation_element_id($element_type, $trid, $language_code) {
    global $wpdb;
    return $wpdb->get_var($wpdb->prepare(
        'SELECT element_id FROM ' . gr_table('icl_translations') . ' WHERE element_type = %s AND trid = %d AND language_code = %s LIMIT 1',
        $element_type,
        $trid,
        $language_code
    ));
}

function gr_get_trid($element_type, $element_id) {
    global $wpdb;
    return $wpdb->get_var($wpdb->prepare(
        'SELECT trid FROM ' . gr_table('icl_translations') . ' WHERE element_type = %s AND element_id = %d LIMIT 1',
        $element_type,
        $element_id
    ));
}

function gr_link_translation($element_type, $element_id, $trid, $language_code, $source_language_code) {
    global $wpdb;
    $table = gr_table('icl_translations');
    $by_element = $wpdb->get_var($wpdb->prepare(
        "SELECT translation_id FROM $table WHERE element_type = %s AND element_id = %d LIMIT 1",
        $element_type,
        $element_id
    ));
    if ($by_element) {
        $wpdb->update($table, array(
            'trid' => $trid,
            'language_code' => $language_code,
            'source_language_code' => $source_language_code,
        ), array('translation_id' => $by_element));
        return;
    }
    $by_trid = $wpdb->get_var($wpdb->prepare(
        "SELECT translation_id FROM $table WHERE trid = %d AND language_code = %s LIMIT 1",
        $trid,
        $language_code
    ));
    if ($by_trid) {
        $wpdb->update($table, array(
            'element_type' => $element_type,
            'element_id' => $element_id,
            'source_language_code' => $source_language_code,
        ), array('translation_id' => $by_trid));
        return;
    }
    $wpdb->insert($table, array(
        'element_type' => $element_type,
        'element_id' => $element_id,
        'trid' => $trid,
        'language_code' => $language_code,
        'source_language_code' => $source_language_code,
    ));
}

function gr_clean_slug($base_slug) {
    $slug = strtolower(trim((string) $base_slug));
    $slug = preg_replace('/[^a-z0-9%-]+/', '-', $slug);
    $slug = trim($slug, '-');
    return $slug;
}

function gr_unique_slug($base_slug, $post_type, $current_id) {
    global $wpdb;
    $slug = gr_clean_slug($base_slug);
    if ($slug === '') {
        $slug = 'codex-' . time();
    }
    $candidate = $slug;
    $i = 2;
    while ($wpdb->get_var($wpdb->prepare(
        "SELECT ID FROM {$wpdb->posts} WHERE post_name = %s AND post_type = %s AND ID <> %d LIMIT 1",
        $candidate,
        $post_type,
        $current_id
    ))) {
        $candidate = $slug . '-' . $i;
        $i++;
    }
    return $candidate;
}

function gr_force_post_slug($post_id, $base_slug) {
    global $wpdb;
    $slug = gr_clean_slug($base_slug);
    if ($slug === '') {
        return;
    }
    $wpdb->update($wpdb->posts, array('post_name' => $slug), array('ID' => (int) $post_id));
    if (function_exists('clean_post_cache')) {
        clean_post_cache((int) $post_id);
    }
}

function gr_copy_post_meta($source_id, $target_id, $overrides) {
    $skip = array('_edit_lock' => true, '_edit_last' => true, '_wp_old_slug' => true, '_icl_lang_duplicate_of' => true);
    $meta = get_post_meta($source_id);
    foreach ($meta as $key => $values) {
        if (isset($skip[$key])) {
            continue;
        }
        delete_post_meta($target_id, $key);
        foreach ($values as $value) {
            add_post_meta($target_id, $key, maybe_unserialize($value));
        }
    }
    foreach ($overrides as $key => $value) {
        delete_post_meta($target_id, $key);
        add_post_meta($target_id, $key, $value);
    }
}

function gr_clone_post($source_id, $language_code, $title, $slug, $meta_overrides) {
    $source = get_post($source_id);
    if (!$source) {
        throw new Exception('Missing source post ' . $source_id);
    }
    $element_type = 'post_' . $source->post_type;
    $trid = gr_get_trid($element_type, $source_id);
    if (!$trid) {
        throw new Exception('Missing WPML trid for source ' . $source_id);
    }
    $existing_id = gr_translation_element_id($element_type, $trid, $language_code);
    $post_data = array(
        'post_author' => $source->post_author,
        'post_date' => $source->post_date,
        'post_date_gmt' => $source->post_date_gmt,
        'post_content' => $source->post_content,
        'post_title' => $title,
        'post_excerpt' => $source->post_excerpt,
        'post_status' => 'publish',
        'comment_status' => $source->comment_status,
        'ping_status' => $source->ping_status,
        'post_password' => $source->post_password,
        'post_name' => gr_unique_slug($slug, $source->post_type, $existing_id ? (int) $existing_id : 0),
        'post_parent' => 0,
        'menu_order' => $source->menu_order,
        'post_type' => $source->post_type,
        'post_mime_type' => $source->post_mime_type,
    );
    if ($existing_id) {
        $post_data['ID'] = (int) $existing_id;
        $result = wp_update_post($post_data, true);
    } else {
        $result = wp_insert_post($post_data, true);
    }
    if (is_wp_error($result)) {
        throw new Exception($result->get_error_message());
    }
    $target_id = (int) $result;
    gr_copy_post_meta($source_id, $target_id, $meta_overrides);
    update_post_meta($target_id, '_codex_wpml_source_id', $source_id);
    update_post_meta($target_id, '_codex_wpml_language', $language_code);
    gr_force_post_slug($target_id, $slug);
    gr_link_translation($element_type, $target_id, $trid, $language_code, 'it');
    return $target_id;
}

function gr_activate_language($code, $locale) {
    global $wpdb;
    $wpdb->update(gr_table('icl_languages'), array('active' => 1, 'default_locale' => $locale), array('code' => $code));
    $exists = $wpdb->get_var($wpdb->prepare(
        'SELECT code FROM ' . gr_table('icl_locale_map') . ' WHERE code = %s AND locale = %s LIMIT 1',
        $code,
        $locale
    ));
    if (!$exists) {
        $wpdb->insert(gr_table('icl_locale_map'), array('code' => $code, 'locale' => $locale));
    }
}

function gr_get_term_taxonomy_id($term_id) {
    global $wpdb;
    return $wpdb->get_var($wpdb->prepare(
        "SELECT term_taxonomy_id FROM {$wpdb->term_taxonomy} WHERE term_id = %d AND taxonomy = 'nav_menu' LIMIT 1",
        $term_id
    ));
}

function gr_ensure_menu($name, $language_code, $source_trid) {
    global $wpdb;
    $existing_tt_id = gr_translation_element_id('tax_nav_menu', $source_trid, $language_code);
    if ($existing_tt_id) {
        return (int) $wpdb->get_var($wpdb->prepare(
            "SELECT term_id FROM {$wpdb->term_taxonomy} WHERE term_taxonomy_id = %d LIMIT 1",
            $existing_tt_id
        ));
    }
    $existing = get_term_by('name', $name, 'nav_menu');
    if ($existing) {
        $term_id = (int) $existing->term_id;
    } else {
        $term_id = wp_create_nav_menu($name);
        if (is_wp_error($term_id)) {
            throw new Exception($term_id->get_error_message());
        }
        $term_id = (int) $term_id;
    }
    $tt_id = gr_get_term_taxonomy_id($term_id);
    gr_link_translation('tax_nav_menu', $tt_id, $source_trid, $language_code, 'it');
    return $term_id;
}

function gr_find_menu_item($menu_term_id, $object_id, $language_code) {
    global $wpdb;
    $tt_id = gr_get_term_taxonomy_id($menu_term_id);
    $existing = $wpdb->get_var($wpdb->prepare(
        "SELECT p.ID FROM {$wpdb->posts} p
         JOIN {$wpdb->term_relationships} tr ON tr.object_id = p.ID
         JOIN {$wpdb->postmeta} pm ON pm.post_id = p.ID AND pm.meta_key = '_menu_item_object_id'
         WHERE p.post_type = 'nav_menu_item' AND tr.term_taxonomy_id = %d AND pm.meta_value = %s
         LIMIT 1",
        $tt_id,
        (string) $object_id
    ));
    if ($existing) {
        return $existing;
    }

    return $wpdb->get_var($wpdb->prepare(
        "SELECT p.ID FROM {$wpdb->posts} p
         JOIN {$wpdb->postmeta} pm ON pm.post_id = p.ID AND pm.meta_key = '_menu_item_object_id'
         JOIN " . gr_table('icl_translations') . " tx ON tx.element_id = p.ID AND tx.element_type = 'post_nav_menu_item'
         WHERE p.post_type = 'nav_menu_item'
           AND pm.meta_value = %s
           AND tx.language_code = %s
         ORDER BY p.ID DESC
         LIMIT 1",
        (string) $object_id,
        $language_code
    ));
}

function gr_attach_menu_item($menu_term_id, $item_id, $position) {
    global $wpdb;
    $tt_id = gr_get_term_taxonomy_id($menu_term_id);
    if (!$tt_id || !$item_id) {
        return;
    }
    $exists = $wpdb->get_var($wpdb->prepare(
        "SELECT object_id FROM {$wpdb->term_relationships} WHERE object_id = %d AND term_taxonomy_id = %d LIMIT 1",
        (int) $item_id,
        (int) $tt_id
    ));
    if ($exists) {
        $wpdb->update($wpdb->term_relationships, array('term_order' => (int) $position), array(
            'object_id' => (int) $item_id,
            'term_taxonomy_id' => (int) $tt_id,
        ));
    } else {
        $wpdb->insert($wpdb->term_relationships, array(
            'object_id' => (int) $item_id,
            'term_taxonomy_id' => (int) $tt_id,
            'term_order' => (int) $position,
        ));
    }
    $count = $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(*) FROM {$wpdb->term_relationships} WHERE term_taxonomy_id = %d",
        (int) $tt_id
    ));
    $wpdb->update($wpdb->term_taxonomy, array('count' => (int) $count), array('term_taxonomy_id' => (int) $tt_id));
}

function gr_add_menu_item($menu_term_id, $object_id, $object_type, $title, $position, $language_code) {
    $existing = gr_find_menu_item($menu_term_id, $object_id, $language_code);
    $args = array(
        'menu-item-object-id' => $object_id,
        'menu-item-object' => $object_type,
        'menu-item-parent-id' => 0,
        'menu-item-position' => $position,
        'menu-item-type' => 'post_type',
        'menu-item-title' => $title,
        'menu-item-status' => 'publish',
    );
    $item_id = wp_update_nav_menu_item($menu_term_id, $existing ? (int) $existing : 0, $args);
    if (is_wp_error($item_id)) {
        throw new Exception($item_id->get_error_message());
    }
    gr_attach_menu_item($menu_term_id, (int) $item_id, $position);
    gr_link_translation('post_nav_menu_item', (int) $item_id, (int) $item_id, $language_code, null);
    return (int) $item_id;
}

try {
    $backup_file = gr_backup_tables();
    gr_log('Backup written: ' . $backup_file);

    $created = array();

    foreach ($languages as $code => $config) {
        gr_log('Preparing language content: ' . $code);

        foreach ($config['pages'] as $source_id => $data) {
            $created[$code][$source_id] = gr_clone_post($source_id, $code, $data['title'], $data['slug'], array());
        }
        foreach ($config['portfolio'] as $source_id => $data) {
            $created[$code][$source_id] = gr_clone_post($source_id, $code, $data['title'], $data['slug'], array());
        }
        foreach ($config['slides'] as $source_id => $h_title) {
            $source = get_post($source_id);
            $created[$code][$source_id] = gr_clone_post($source_id, $code, $source ? $source->post_title : ('slide-' . $source_id), ($source ? $source->post_name : ('slide-' . $source_id)) . '-' . $code, array('_h_title' => $h_title));
        }

        $top_menu_id = gr_ensure_menu($config['top_menu'], $code, 657);
        $contact_menu_id = gr_ensure_menu($config['contact_menu'], $code, 664);

        $position = 1;
        foreach ($top_menu_order as $item) {
            $source_id = $item['source_id'];
            $target_id = $created[$code][$source_id];
            $post = get_post($target_id);
            $title = isset($item['title']) ? $item['title'] : $config['menu_titles'][$item['kind']];
            gr_add_menu_item($top_menu_id, $target_id, $post->post_type, $title, $position, $code);
            $position++;
        }

        $position = 1;
        foreach ($contact_menu_order as $item) {
            $source_id = $item['source_id'];
            $target_id = $created[$code][$source_id];
            $post = get_post($target_id);
            $title = isset($item['title']) ? $item['title'] : $config['menu_titles'][$item['kind']];
            gr_add_menu_item($contact_menu_id, $target_id, $post->post_type, $title, $position, $code);
            $position++;
        }
    }

    foreach ($languages as $code => $config) {
        gr_log('Activating language: ' . $code);
        gr_activate_language($code, $config['locale']);
    }

    if (function_exists('flush_rewrite_rules')) {
        flush_rewrite_rules(false);
    }
    if (function_exists('wp_cache_flush')) {
        wp_cache_flush();
    }

    gr_log('Done. Delete this migration file from the server now.');
} catch (Exception $e) {
    gr_log('ERROR: ' . $e->getMessage());
}

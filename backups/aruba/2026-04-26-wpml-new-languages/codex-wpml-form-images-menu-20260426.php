<?php
/*
 * One-time WPML form image/menu repair for www.g-rgabriellaromeo.it.
 * Delete from the server immediately after use.
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

define('WP_USE_THEMES', false);
require_once dirname(__FILE__) . '/wp-load.php';

global $wpdb;

function grfim_table($name) {
    global $wpdb;
    return $wpdb->prefix . $name;
}

function grfim_get_trid($element_type, $element_id) {
    global $wpdb;
    return $wpdb->get_var($wpdb->prepare(
        'SELECT trid FROM ' . grfim_table('icl_translations') . ' WHERE element_type = %s AND element_id = %d LIMIT 1',
        $element_type,
        (int) $element_id
    ));
}

function grfim_translation_element_id($element_type, $trid, $language_code) {
    global $wpdb;
    return $wpdb->get_var($wpdb->prepare(
        'SELECT element_id FROM ' . grfim_table('icl_translations') . ' WHERE element_type = %s AND trid = %d AND language_code = %s LIMIT 1',
        $element_type,
        (int) $trid,
        $language_code
    ));
}

function grfim_product_images($content) {
    $images = array();
    if (preg_match_all('/<img\b[^>]*>/i', (string) $content, $matches)) {
        foreach ($matches[0] as $image) {
            if (stripos($image, '/wp-content/uploads/') === false) {
                continue;
            }
            if (stripos($image, 'logoBK3') !== false) {
                continue;
            }
            $images[] = trim($image);
        }
    }
    return $images;
}

function grfim_image_block($source_id) {
    $preferred_languages = array('en', 'it', 'fr', 'ar');
    $trid = grfim_get_trid('post_page', $source_id);
    if (!$trid) {
        return '';
    }

    foreach ($preferred_languages as $language_code) {
        $translation_id = grfim_translation_element_id('post_page', (int) $trid, $language_code);
        if (!$translation_id) {
            continue;
        }
        $post = get_post((int) $translation_id);
        if (!$post) {
            continue;
        }
        $images = grfim_product_images($post->post_content);
        if (count($images) >= 4) {
            $images = array_slice($images, 0, 4);
            return '<p>' . $images[0] . $images[1] . '<br />' . $images[2] . $images[3] . '</p>';
        }
    }

    return '';
}

function grfim_remove_product_images($content) {
    return preg_replace('/<p>\s*(?:<img\b[^>]*\/?>\s*(?:<br\s*\/?>\s*)*)+\s*<\/p>/i', '', (string) $content);
}

function grfim_force_post_slug($post_id, $slug) {
    global $wpdb;
    $wpdb->update(
        grfim_table('posts'),
        array('post_name' => sanitize_title($slug)),
        array('ID' => (int) $post_id),
        array('%s'),
        array('%d')
    );
    clean_post_cache((int) $post_id);
}

function grfim_insert_image_block($content, $image_block, $form_id) {
    $content = grfim_remove_product_images($content);
    $shortcode = '[customcontact form=' . (int) $form_id . ']';
    if (preg_match('/\[customcontact\s+form\s*=\s*' . (int) $form_id . '\s*\]/i', $content)) {
        return preg_replace(
            '/\[customcontact\s+form\s*=\s*' . (int) $form_id . '\s*\]/i',
            $image_block . "\n" . $shortcode,
            $content,
            1
        );
    }
    return rtrim($content) . "\n" . $image_block . "\n" . $shortcode;
}

function grfim_city_data() {
    return array(
        346 => array(
            'city' => 'Berlin',
            'form_id' => 3,
            'slugs' => array('de' => 'berlin-kontaktformular', 'es' => 'formulario-berlin', 'zh-hans' => 'berlin-contact-form-zh-hans', 'ja' => 'berlin-contact-form-ja'),
        ),
        387 => array(
            'city' => 'Marrakech',
            'form_id' => 6,
            'slugs' => array('de' => 'marrakech-kontaktformular', 'es' => 'formulario-marrakech', 'zh-hans' => 'marrakech-contact-form-zh-hans', 'ja' => 'marrakech-contact-form-ja'),
        ),
        385 => array(
            'city' => 'New Delhi',
            'form_id' => 5,
            'slugs' => array('de' => 'new-delhi-kontaktformular', 'es' => 'formulario-new-delhi', 'zh-hans' => 'new-delhi-contact-form-zh-hans', 'ja' => 'new-delhi-contact-form-ja'),
        ),
        381 => array(
            'city' => 'New York',
            'form_id' => 4,
            'slugs' => array('de' => 'new-york-kontaktformular', 'es' => 'formulario-new-york', 'zh-hans' => 'new-york-contact-form-zh-hans', 'ja' => 'new-york-contact-form-ja'),
        ),
        320 => array(
            'city' => 'Sydney',
            'form_id' => 2,
            'slugs' => array('de' => 'sydney-kontaktformular', 'es' => 'formulario-sydney', 'zh-hans' => 'sydney-contact-form-zh-hans', 'ja' => 'sydney-contact-form-ja'),
        ),
    );
}

function grfim_backup($city_data, $menu_item_ids, $page_ids) {
    global $wpdb;
    $backup = array(
        'created_at' => date('c'),
        'posts' => array(),
        'menu_items' => array(),
        'pages' => array(),
    );

    foreach ($city_data as $source_id => $data) {
        $trid = grfim_get_trid('post_page', $source_id);
        foreach (array('de', 'es', 'zh-hans', 'ja') as $language_code) {
            $translation_id = grfim_translation_element_id('post_page', (int) $trid, $language_code);
            if ($translation_id) {
                $backup['posts'][$translation_id] = $wpdb->get_row($wpdb->prepare(
                    'SELECT ID, post_title, post_name, post_content, post_modified, post_modified_gmt FROM ' . grfim_table('posts') . ' WHERE ID = %d',
                    (int) $translation_id
                ), ARRAY_A);
            }
        }
    }

    foreach ($menu_item_ids as $menu_item_id) {
        $backup['menu_items'][$menu_item_id] = $wpdb->get_row($wpdb->prepare(
            'SELECT ID, post_title, post_name, post_modified, post_modified_gmt FROM ' . grfim_table('posts') . ' WHERE ID = %d',
            (int) $menu_item_id
        ), ARRAY_A);
    }

    foreach ($page_ids as $page_id) {
        $backup['pages'][$page_id] = $wpdb->get_row($wpdb->prepare(
            'SELECT ID, post_title, post_name, post_content, post_modified, post_modified_gmt FROM ' . grfim_table('posts') . ' WHERE ID = %d',
            (int) $page_id
        ), ARRAY_A);
    }

    $upload = wp_upload_dir();
    $dir = trailingslashit($upload['basedir']) . 'codex-wpml-backups';
    if (!is_dir($dir)) {
        wp_mkdir_p($dir);
    }
    $path = trailingslashit($dir) . 'wpml-form-images-menu-before-' . date('Ymd-His') . '.json';
    file_put_contents($path, json_encode($backup, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    return $path;
}

$apply = (isset($codex_request['codex_run']) && (string) $codex_request['codex_run'] === '1')
    || (isset($codex_request['apply']) && (string) $codex_request['apply'] === '1');
$city_data = grfim_city_data();
$new_languages = array('de', 'es', 'zh-hans', 'ja');
$italian_menu_item_id = 24;
$italian_page_id = (int) get_post_meta($italian_menu_item_id, '_menu_item_object_id', true);
if (!$italian_page_id) {
    $italian_page_id = 21;
}

echo "Form image audit:\n";
foreach ($city_data as $source_id => $data) {
    $trid = grfim_get_trid('post_page', $source_id);
    $image_block = grfim_image_block($source_id);
    $source_images = count(grfim_product_images($image_block));
    echo $data['city'] . ' source=' . $source_id . ' source_images=' . $source_images . "\n";
    foreach ($new_languages as $language_code) {
        $target_id = grfim_translation_element_id('post_page', (int) $trid, $language_code);
        if (!$target_id) {
            echo '  ' . $language_code . " missing\n";
            continue;
        }
        $post = get_post((int) $target_id);
        $target_images = $post ? count(grfim_product_images($post->post_content)) : 0;
        echo '  ' . $language_code . ' id=' . $target_id . ' target_images=' . $target_images . "\n";
    }
}

echo "\nItalian menu audit:\n";
$italian_menu_item = get_post($italian_menu_item_id);
$italian_page = get_post($italian_page_id);
echo '  menu_id=' . $italian_menu_item_id
    . ' menu_title=' . ($italian_menu_item ? $italian_menu_item->post_title : 'missing')
    . ' page_id=' . $italian_page_id
    . ' page_title=' . ($italian_page ? $italian_page->post_title : 'missing')
    . "\n";
$menu_items = $wpdb->get_results(
    "SELECT ID, post_title, post_name FROM " . grfim_table('posts') . " WHERE post_type = 'nav_menu_item' AND post_title LIKE '%Pearls of the World%' ORDER BY ID",
    ARRAY_A
);
foreach ($menu_items as $item) {
    $language_code = $wpdb->get_var($wpdb->prepare(
        'SELECT language_code FROM ' . grfim_table('icl_translations') . ' WHERE element_type = %s AND element_id = %d LIMIT 1',
        'post_nav_menu_item',
        (int) $item['ID']
    ));
    echo '  id=' . $item['ID'] . ' lang=' . ($language_code ? $language_code : 'none') . ' title=' . $item['post_title'] . "\n";
}

if (!$apply) {
    echo "\nDry run only. Re-run with codex_run=1 to apply.\n";
    exit;
}

$backup_path = grfim_backup($city_data, array($italian_menu_item_id), array($italian_page_id));
echo "\nBackup written: " . $backup_path . "\n";

echo "Updating new-language form image blocks\n";
foreach ($city_data as $source_id => $data) {
    $trid = grfim_get_trid('post_page', $source_id);
    $image_block = grfim_image_block($source_id);
    if (count(grfim_product_images($image_block)) < 4) {
        echo '  skip ' . $data['city'] . " no source image block\n";
        continue;
    }
    foreach ($new_languages as $language_code) {
        $target_id = grfim_translation_element_id('post_page', (int) $trid, $language_code);
        if (!$target_id) {
            continue;
        }
        $post = get_post((int) $target_id);
        if (!$post) {
            continue;
        }
        $new_content = grfim_insert_image_block($post->post_content, $image_block, (int) $data['form_id']);
        wp_update_post(array(
            'ID' => (int) $target_id,
            'post_content' => $new_content,
        ));
        grfim_force_post_slug((int) $target_id, $data['slugs'][$language_code]);
        update_post_meta((int) $target_id, '_codex_wpml_form_images_repaired', date('c'));
        echo '  updated ' . $data['city'] . ' ' . $language_code . ' id=' . $target_id . "\n";
    }
}

echo "Updating Italian 5 Pearls menu label\n";
$wpdb->update(
    grfim_table('posts'),
    array('post_title' => '5 Perle del Mondo', 'post_modified' => current_time('mysql'), 'post_modified_gmt' => current_time('mysql', 1)),
    array('ID' => $italian_menu_item_id, 'post_type' => 'nav_menu_item'),
    array('%s', '%s', '%s'),
    array('%d', '%s')
);
clean_post_cache($italian_menu_item_id);

if ($italian_page_id) {
    $wpdb->update(
        grfim_table('posts'),
        array('post_title' => '5 Perle del Mondo', 'post_modified' => current_time('mysql'), 'post_modified_gmt' => current_time('mysql', 1)),
        array('ID' => $italian_page_id, 'post_type' => 'page'),
        array('%s', '%s', '%s'),
        array('%d', '%s')
    );
    clean_post_cache($italian_page_id);
}

if (function_exists('wp_cache_flush')) {
    wp_cache_flush();
}
flush_rewrite_rules(false);

echo "Done. Delete this form image/menu repair file from the server now.\n";

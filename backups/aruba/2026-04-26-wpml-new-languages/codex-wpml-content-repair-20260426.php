<?php
/*
 * One-time WPML content audit/repair for www.g-rgabriellaromeo.it.
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

function grc_table($name) {
    global $wpdb;
    return $wpdb->prefix . $name;
}

function grc_get_trid($element_type, $element_id) {
    global $wpdb;
    return $wpdb->get_var($wpdb->prepare(
        'SELECT trid FROM ' . grc_table('icl_translations') . ' WHERE element_type = %s AND element_id = %d LIMIT 1',
        $element_type,
        $element_id
    ));
}

function grc_translation_element_id($element_type, $trid, $language_code) {
    global $wpdb;
    return $wpdb->get_var($wpdb->prepare(
        'SELECT element_id FROM ' . grc_table('icl_translations') . ' WHERE element_type = %s AND trid = %d AND language_code = %s LIMIT 1',
        $element_type,
        $trid,
        $language_code
    ));
}

function grc_plain($html) {
    $text = strip_shortcodes((string) $html);
    $text = wp_strip_all_tags($text);
    $text = preg_replace('/\s+/', ' ', $text);
    return trim($text);
}

$new_languages = array('de', 'es', 'zh-hans', 'ja');
$all_languages = array('it', 'en', 'fr', 'ar', 'de', 'es', 'zh-hans', 'ja');
$apply = (isset($codex_request['codex_run']) && (string) $codex_request['codex_run'] === '1')
    || (isset($codex_request['apply']) && (string) $codex_request['apply'] === '1');

function grc_log($message) {
    echo $message . "\n";
}

function grc_backup_tables() {
    global $wpdb;
    $upload = wp_upload_dir();
    $dir = trailingslashit($upload['basedir']) . 'codex-wpml-backups';
    if (!is_dir($dir)) {
        wp_mkdir_p($dir);
    }

    $post_ids = $wpdb->get_col(
        "SELECT ID FROM {$wpdb->posts}
         WHERE post_type IN ('post', 'page', 'wpb_portfolio', 'wpb_homeslide', 'nav_menu_item')
         ORDER BY ID"
    );
    $post_id_sql = $post_ids ? implode(',', array_map('intval', $post_ids)) : '0';

    $backup = array(
        'created_at' => date('c'),
        'posts' => $wpdb->get_results("SELECT * FROM {$wpdb->posts} WHERE ID IN ($post_id_sql)", ARRAY_A),
        'postmeta' => $wpdb->get_results("SELECT * FROM {$wpdb->postmeta} WHERE post_id IN ($post_id_sql)", ARRAY_A),
        'terms' => $wpdb->get_results("SELECT * FROM {$wpdb->terms}", ARRAY_A),
        'term_taxonomy' => $wpdb->get_results("SELECT * FROM {$wpdb->term_taxonomy}", ARRAY_A),
        'term_relationships' => $wpdb->get_results("SELECT * FROM {$wpdb->term_relationships} WHERE object_id IN ($post_id_sql)", ARRAY_A),
        'icl_translations' => $wpdb->get_results('SELECT * FROM ' . grc_table('icl_translations'), ARRAY_A),
    );

    $file = trailingslashit($dir) . 'wpml-content-repair-before-' . date('Ymd-His') . '.json';
    file_put_contents($file, json_encode($backup));
    return $file;
}

function grc_link_translation($element_type, $element_id, $trid, $language_code, $source_language_code) {
    global $wpdb;
    $table = grc_table('icl_translations');
    $existing = $wpdb->get_var($wpdb->prepare(
        "SELECT translation_id FROM $table WHERE element_type = %s AND element_id = %d LIMIT 1",
        $element_type,
        $element_id
    ));
    if ($existing) {
        $wpdb->update($table, array(
            'trid' => $trid,
            'language_code' => $language_code,
            'source_language_code' => $source_language_code,
        ), array('translation_id' => $existing));
        return;
    }

    $existing = $wpdb->get_var($wpdb->prepare(
        "SELECT translation_id FROM $table WHERE trid = %d AND language_code = %s LIMIT 1",
        $trid,
        $language_code
    ));
    if ($existing) {
        $wpdb->update($table, array(
            'element_type' => $element_type,
            'element_id' => $element_id,
            'source_language_code' => $source_language_code,
        ), array('translation_id' => $existing));
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

function grc_set_translation_exact($element_type, $element_id, $trid, $language_code, $source_language_code) {
    global $wpdb;
    $table = grc_table('icl_translations');
    $existing = $wpdb->get_var($wpdb->prepare(
        "SELECT translation_id FROM $table WHERE element_type = %s AND element_id = %d LIMIT 1",
        $element_type,
        (int) $element_id
    ));
    if ($existing) {
        $wpdb->update($table, array(
            'trid' => (int) $trid,
            'language_code' => $language_code,
            'source_language_code' => $source_language_code,
        ), array('translation_id' => (int) $existing));
        return;
    }

    $existing = $wpdb->get_var($wpdb->prepare(
        "SELECT translation_id FROM $table WHERE element_type = %s AND trid = %d AND language_code = %s LIMIT 1",
        $element_type,
        (int) $trid,
        $language_code
    ));
    if ($existing) {
        $wpdb->update($table, array(
            'element_id' => (int) $element_id,
            'source_language_code' => $source_language_code,
        ), array('translation_id' => (int) $existing));
        return;
    }

    $wpdb->insert($table, array(
        'element_type' => $element_type,
        'element_id' => (int) $element_id,
        'trid' => (int) $trid,
        'language_code' => $language_code,
        'source_language_code' => $source_language_code,
    ));
}

function grc_clean_slug($base_slug) {
    $slug = strtolower(trim((string) $base_slug));
    $slug = preg_replace('/[^a-z0-9%-]+/', '-', $slug);
    $slug = trim($slug, '-');
    return $slug;
}

function grc_unique_slug($base_slug, $post_type, $current_id) {
    global $wpdb;
    $slug = grc_clean_slug($base_slug);
    if ($slug === '') {
        $slug = 'codex-' . time();
    }
    $candidate = $slug;
    $i = 2;
    while ($wpdb->get_var($wpdb->prepare(
        "SELECT ID FROM {$wpdb->posts} WHERE post_name = %s AND post_type = %s AND ID <> %d LIMIT 1",
        $candidate,
        $post_type,
        (int) $current_id
    ))) {
        $candidate = $slug . '-' . $i;
        $i++;
    }
    return $candidate;
}

function grc_force_post_slug($post_id, $base_slug) {
    global $wpdb;
    $slug = grc_clean_slug($base_slug);
    if ($slug === '') {
        return;
    }
    $wpdb->update($wpdb->posts, array('post_name' => $slug), array('ID' => (int) $post_id));
    if (function_exists('clean_post_cache')) {
        clean_post_cache((int) $post_id);
    }
}

function grc_copy_post_meta($source_id, $target_id) {
    $skip = array(
        '_edit_lock' => true,
        '_edit_last' => true,
        '_wp_old_slug' => true,
        '_icl_lang_duplicate_of' => true,
    );
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
}

function grc_get_term_taxonomy_id($term_id, $taxonomy) {
    global $wpdb;
    return $wpdb->get_var($wpdb->prepare(
        "SELECT term_taxonomy_id FROM {$wpdb->term_taxonomy} WHERE term_id = %d AND taxonomy = %s LIMIT 1",
        (int) $term_id,
        $taxonomy
    ));
}

function grc_category_data($language_code, $source_term_name) {
    $map = array(
        'Anelli' => array(
            'de' => array('name' => 'Ringe', 'slug' => 'ringe'),
            'es' => array('name' => 'Anillos', 'slug' => 'anillos'),
            'zh-hans' => array('name' => '戒指', 'slug' => 'rings-zh-hans'),
            'ja' => array('name' => 'リング', 'slug' => 'rings-ja'),
        ),
        'Bracciali' => array(
            'de' => array('name' => 'Armbänder', 'slug' => 'armbaender'),
            'es' => array('name' => 'Pulseras', 'slug' => 'pulseras'),
            'zh-hans' => array('name' => '手链', 'slug' => 'bracelets-zh-hans'),
            'ja' => array('name' => 'ブレスレット', 'slug' => 'bracelets-ja'),
        ),
        'Collane / Pendenti' => array(
            'de' => array('name' => 'Halsketten / Anhänger', 'slug' => 'halsketten-anhaenger'),
            'es' => array('name' => 'Collares / Colgantes', 'slug' => 'collares-colgantes'),
            'zh-hans' => array('name' => '项链 / 吊坠', 'slug' => 'necklaces-pendants-zh-hans'),
            'ja' => array('name' => 'ネックレス / ペンダント', 'slug' => 'necklaces-pendants-ja'),
        ),
        'Orecchini' => array(
            'de' => array('name' => 'Ohrringe', 'slug' => 'ohrringe'),
            'es' => array('name' => 'Pendientes', 'slug' => 'pendientes'),
            'zh-hans' => array('name' => '耳环', 'slug' => 'earrings-zh-hans'),
            'ja' => array('name' => 'イヤリング', 'slug' => 'earrings-ja'),
        ),
        'Senza categoria' => array(
            'de' => array('name' => 'Ohne Kategorie', 'slug' => 'ohne-kategorie'),
            'es' => array('name' => 'Sin categoría', 'slug' => 'sin-categoria'),
            'zh-hans' => array('name' => '未分类', 'slug' => 'uncategorized-zh-hans'),
            'ja' => array('name' => '未分類', 'slug' => 'uncategorized-ja'),
        ),
    );

    return isset($map[$source_term_name][$language_code]) ? $map[$source_term_name][$language_code] : array(
        'name' => $source_term_name . ' ' . $language_code,
        'slug' => grc_clean_slug($source_term_name . '-' . $language_code),
    );
}

function grc_ensure_term_translation($source_term_id, $taxonomy, $language_code) {
    $source_term = get_term($source_term_id, $taxonomy);
    if (!$source_term || is_wp_error($source_term)) {
        return 0;
    }

    $source_tt_id = grc_get_term_taxonomy_id($source_term_id, $taxonomy);
    $trid = grc_get_trid('tax_' . $taxonomy, $source_tt_id);
    if (!$trid) {
        return 0;
    }

    $data = grc_category_data($language_code, $source_term->name);
    $existing_tt_id = grc_translation_element_id('tax_' . $taxonomy, (int) $trid, $language_code);
    if ($existing_tt_id) {
        global $wpdb;
        $term_id = $wpdb->get_var($wpdb->prepare(
            "SELECT term_id FROM {$wpdb->term_taxonomy} WHERE term_taxonomy_id = %d LIMIT 1",
            (int) $existing_tt_id
        ));
        if ($term_id) {
            wp_update_term((int) $term_id, $taxonomy, array('name' => $data['name'], 'slug' => $data['slug']));
            return (int) $term_id;
        }
    }

    $existing = get_term_by('slug', $data['slug'], $taxonomy);
    if ($existing) {
        $term_id = (int) $existing->term_id;
        wp_update_term($term_id, $taxonomy, array('name' => $data['name'], 'slug' => $data['slug']));
    } else {
        $inserted = wp_insert_term($data['name'], $taxonomy, array('slug' => $data['slug']));
        if (is_wp_error($inserted)) {
            throw new Exception($inserted->get_error_message());
        }
        $term_id = (int) $inserted['term_id'];
    }

    $tt_id = grc_get_term_taxonomy_id($term_id, $taxonomy);
    grc_set_translation_exact('tax_' . $taxonomy, (int) $tt_id, (int) $trid, $language_code, 'it');
    return $term_id;
}

function grc_direct_term_by_slug($taxonomy, $slug) {
    global $wpdb;
    return $wpdb->get_row($wpdb->prepare(
        "SELECT t.term_id, tt.term_taxonomy_id, t.name, t.slug
         FROM {$wpdb->terms} t
         JOIN {$wpdb->term_taxonomy} tt ON tt.term_id = t.term_id
         WHERE tt.taxonomy = %s AND t.slug = %s
         LIMIT 1",
        $taxonomy,
        $slug
    ), ARRAY_A);
}

function grc_direct_ensure_term($taxonomy, $name, $slug) {
    global $wpdb;
    $existing = grc_direct_term_by_slug($taxonomy, $slug);
    if ($existing) {
        $wpdb->update($wpdb->terms, array('name' => $name, 'slug' => $slug), array('term_id' => (int) $existing['term_id']));
        return array('term_id' => (int) $existing['term_id'], 'term_taxonomy_id' => (int) $existing['term_taxonomy_id']);
    }

    $wpdb->insert($wpdb->terms, array(
        'name' => $name,
        'slug' => $slug,
        'term_group' => 0,
    ));
    $term_id = (int) $wpdb->insert_id;
    $wpdb->insert($wpdb->term_taxonomy, array(
        'term_id' => $term_id,
        'taxonomy' => $taxonomy,
        'description' => '',
        'parent' => 0,
        'count' => 0,
    ));
    return array('term_id' => $term_id, 'term_taxonomy_id' => (int) $wpdb->insert_id);
}

function grc_force_category_translation_rows($new_languages) {
    $source_slugs = array('senza-categoria', 'anelli', 'bracciali', 'collane-pendenti', 'orecchini');
    foreach ($source_slugs as $source_slug) {
        $source_term = grc_direct_term_by_slug('category', $source_slug);
        if (!$source_term) {
            continue;
        }
        $source_tt_id = (int) $source_term['term_taxonomy_id'];
        $trid = grc_get_trid('tax_category', (int) $source_tt_id);
        if (!$trid) {
            continue;
        }
        grc_set_translation_exact('tax_category', (int) $source_tt_id, (int) $trid, 'it', null);
        foreach ($new_languages as $language_code) {
            $data = grc_category_data($language_code, $source_term['name']);
            $target_term = grc_direct_ensure_term('category', $data['name'], $data['slug']);
            grc_set_translation_exact('tax_category', (int) $target_term['term_taxonomy_id'], (int) $trid, $language_code, 'it');
        }
    }
}

function grc_recount_category_terms() {
    global $wpdb;
    $tt_ids = $wpdb->get_col("SELECT term_taxonomy_id FROM {$wpdb->term_taxonomy} WHERE taxonomy = 'category'");
    foreach ($tt_ids as $tt_id) {
        $count = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$wpdb->term_relationships} WHERE term_taxonomy_id = %d",
            (int) $tt_id
        ));
        $wpdb->update($wpdb->term_taxonomy, array('count' => (int) $count), array('term_taxonomy_id' => (int) $tt_id));
    }
}

function grc_assign_translated_categories($source_post_id, $target_post_id, $language_code) {
    global $wpdb;
    $source_tts = $wpdb->get_col($wpdb->prepare(
        "SELECT tt.term_taxonomy_id
         FROM {$wpdb->term_relationships} tr
         JOIN {$wpdb->term_taxonomy} tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
         WHERE tr.object_id = %d AND tt.taxonomy = 'category'",
        (int) $source_post_id
    ));

    $target_tts = array();
    foreach ($source_tts as $source_tt_id) {
        $trid = grc_get_trid('tax_category', (int) $source_tt_id);
        if (!$trid) {
            continue;
        }
        $target_tt_id = grc_translation_element_id('tax_category', (int) $trid, $language_code);
        if ($target_tt_id) {
            $target_tts[] = (int) $target_tt_id;
        }
    }

    $category_tts = $wpdb->get_col("SELECT term_taxonomy_id FROM {$wpdb->term_taxonomy} WHERE taxonomy = 'category'");
    if ($category_tts) {
        $category_tt_sql = implode(',', array_map('intval', $category_tts));
        $wpdb->query($wpdb->prepare(
            "DELETE FROM {$wpdb->term_relationships} WHERE object_id = %d AND term_taxonomy_id IN ($category_tt_sql)",
            (int) $target_post_id
        ));
    }

    foreach (array_unique($target_tts) as $tt_id) {
        $wpdb->insert($wpdb->term_relationships, array(
            'object_id' => (int) $target_post_id,
            'term_taxonomy_id' => (int) $tt_id,
            'term_order' => 0,
        ));
    }
}

function grc_product_title($language_code, $source_title) {
    $parts = explode('::', $source_title, 2);
    $city = trim($parts[0]);
    $detail = isset($parts[1]) ? trim($parts[1]) : $source_title;
    $detail_lower = strtolower($detail);

    $item_key = 'necklace';
    if (strpos($detail_lower, 'anello') !== false) {
        $item_key = 'ring';
    } elseif (strpos($detail_lower, 'bracciale') !== false) {
        $item_key = 'bracelet';
    } elseif (strpos($detail_lower, 'orecchini') !== false) {
        $item_key = 'earrings';
    } elseif (strpos($detail_lower, 'collana') !== false) {
        $item_key = 'necklace';
    }

    $has_white = strpos($detail_lower, 'oro bianco') !== false;
    $has_yellow = strpos($detail_lower, 'oro gial') !== false;

    $items = array(
        'de' => array('ring' => 'Ring', 'bracelet' => 'Armband', 'earrings' => 'Ohrringe', 'necklace' => 'Halskette'),
        'es' => array('ring' => 'Anillo', 'bracelet' => 'Pulsera', 'earrings' => 'Pendientes', 'necklace' => 'Collar'),
        'zh-hans' => array('ring' => '戒指', 'bracelet' => '手链', 'earrings' => '耳环', 'necklace' => '项链'),
        'ja' => array('ring' => 'リング', 'bracelet' => 'ブレスレット', 'earrings' => 'イヤリング', 'necklace' => 'ネックレス'),
    );

    if ($language_code === 'de') {
        if ($has_white && $has_yellow) {
            $material = 'aus Weiß- und Gelbgold';
        } elseif ($has_white) {
            $material = 'aus Weißgold';
        } elseif ($has_yellow) {
            $material = 'aus Gelbgold';
        } else {
            $material = '';
        }
        return trim($city . ' :: ' . $items[$language_code][$item_key] . ' ' . $material);
    }

    if ($language_code === 'es') {
        if ($has_white && $has_yellow) {
            $material = 'de oro blanco y amarillo';
        } elseif ($has_white) {
            $material = 'de oro blanco';
        } elseif ($has_yellow) {
            $material = 'de oro amarillo';
        } else {
            $material = '';
        }
        return trim($city . ' :: ' . $items[$language_code][$item_key] . ' ' . $material);
    }

    if ($language_code === 'zh-hans') {
        if ($has_white && $has_yellow) {
            $material = '白金和黄金';
        } elseif ($has_white) {
            $material = '白金';
        } elseif ($has_yellow) {
            $material = '黄金';
        } else {
            $material = '';
        }
        return $city . ' :: ' . $material . $items[$language_code][$item_key];
    }

    if ($language_code === 'ja') {
        if ($has_white && $has_yellow) {
            $material = 'ホワイトゴールドとイエローゴールドの';
        } elseif ($has_white) {
            $material = 'ホワイトゴールドの';
        } elseif ($has_yellow) {
            $material = 'イエローゴールドの';
        } else {
            $material = '';
        }
        return $city . ' :: ' . $material . $items[$language_code][$item_key];
    }

    return $source_title;
}

function grc_translate_post($source_id, $language_code) {
    $source = get_post($source_id);
    if (!$source) {
        return 0;
    }
    $trid = grc_get_trid('post_post', $source_id);
    if (!$trid) {
        throw new Exception('Missing trid for source post ' . $source_id);
    }

    $existing_id = grc_translation_element_id('post_post', (int) $trid, $language_code);
    $title = grc_product_title($language_code, $source->post_title);
    $slug = grc_unique_slug($source->post_name . '-' . $language_code, 'post', $existing_id ? (int) $existing_id : 0);

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
        'post_name' => $slug,
        'post_parent' => 0,
        'menu_order' => $source->menu_order,
        'post_type' => 'post',
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
    grc_copy_post_meta($source_id, $target_id);
    update_post_meta($target_id, '_codex_wpml_content_source_id', $source_id);
    update_post_meta($target_id, '_codex_wpml_language', $language_code);
    grc_force_post_slug($target_id, $slug);
    grc_link_translation('post_post', $target_id, (int) $trid, $language_code, 'it');

    grc_assign_translated_categories($source_id, $target_id, $language_code);

    return $target_id;
}

function grc_home_page_text($language_code) {
    $texts = array(
        'de' => array(
            'Faszinierende Orte der Welt offenbaren die Vergangenheit komplexer und raffinierter Kulturen durch Zeugnisse von großem künstlerischem Wert...',
            'Ereignisse der Moderne hinterlassen unauslöschliche Spuren in der Geschichte des Menschen. Formen und Farben der Welt, in vollkommener Harmonie gefasst, verwandeln sich in Schmuckstücke, die Kunst und Geschichte hervorrufen.',
            'Gold zeigt seinen strahlenden Glanz; die suggestiven Transparenzen der Diamanten und Edelsteine lassen Pracht aufleuchten und geben dem Leben, was die Zeit niemals auslöschen kann...',
            'Das ist mein Stil.',
        ),
        'es' => array(
            'Lugares fascinantes del mundo revelan el pasado de culturas complejas y refinadas a través de testimonios de gran valor artístico...',
            'Acontecimientos de la edad moderna dejan huellas indelebles en la historia del ser humano. Formas y colores del mundo, engastados en perfecta armonía, se transforman en joyas capaces de evocar el arte y la historia.',
            'El oro mostrará su resplandor; las transparencias sugestivas de los diamantes y de las piedras brillantes harán vivir un esplendor que el tiempo nunca podrá borrar...',
            'Este es mi estilo.',
        ),
        'zh-hans' => array(
            '世界上迷人的地方，通过极具艺术价值的见证，揭示复杂而精致文化的过去...',
            '现代的事件在人类历史中留下不可磨灭的痕迹。世界的形态与色彩在完美和谐中相互镶嵌，化为能够唤起艺术与历史的珠宝。',
            '黄金展现耀眼光芒；钻石与宝石迷人的通透感绽放华彩，赋予时间永远无法抹去之物以生命...',
            '这就是我的风格。',
        ),
        'ja' => array(
            '世界の魅力的な場所は、大きな芸術的価値をもつ証を通して、複雑で洗練された文化の過去を映し出します...',
            '近代の出来事は人の歴史に消えることのない痕跡を残します。世界の形と色は完璧な調和の中でジュエリーへと姿を変え、芸術と歴史を呼び起こします。',
            'ゴールドはまばゆい輝きを放ち、ダイヤモンドと宝石の透明なきらめきは、時が決して消し去ることのできない美しさに命を与えます...',
            'これが私のスタイルです。',
        ),
    );
    return isset($texts[$language_code]) ? $texts[$language_code] : array();
}

function grc_home_page_content($language_code) {
    $paragraphs = grc_home_page_text($language_code);
    $html = '[vc_column_text class="intro" width="1/1" last="last"] ';
    foreach ($paragraphs as $paragraph) {
        $html .= '<p>' . $paragraph . '</p>';
    }
    $html .= '<p style="text-align: center;"><img class="size-full wp-image-376 alignright" title="firma-gabriella" src="https://www.g-rgabriellaromeo.it/wordpress/wp-content/uploads/2011/11/firma-gabriella.png" alt="" width="350" height="166" /></p><p>&nbsp;</p> [/vc_column_text]';
    return $html;
}

function grc_city_text($source_id, $language_code) {
    $texts = array(
        263 => array(
            'de' => 'Berlin, Königin Europas, anspruchsvoll, modern und elegant, ist eine Stadt, die viele Gegensätze bezeugt. Das Herz der Kollektion ist von den tiefen Spuren inspiriert, die nach dem Fall der Mauer geblieben sind, und vom Aufbruch in eine neue Dimension. Die Raffinesse der Formen feiert Ereignisse, während die Farben, von funkelnden bis zu nüchternen Tönen, den Wunsch nach Freiheit ausstrahlen: ein ideales Gefüge, das den Beginn einer neuen Ära verspricht.',
            'es' => 'Berlín, reina de Europa, sofisticada, moderna y elegante, es una ciudad testigo de muchos contrastes. El corazón de la colección se inspira en las profundas cicatrices dejadas por la caída del muro y en el impulso hacia una nueva dimensión. La elegancia de las formas celebra los acontecimientos, mientras los colores, desde los tonos brillantes hasta los más sobrios, irradian el deseo de libertad: una unión ideal que promete el comienzo de una nueva era.',
            'zh-hans' => '柏林，欧洲女王，精致、现代而优雅，是一座见证诸多对比的城市。该系列的核心灵感来自柏林墙倒塌后留下的深刻痕迹，以及城市迈向新维度的重生。精致的造型礼赞历史事件，色彩从璀璨到沉稳，散发对自由的渴望，象征一个新时代的开始。',
            'ja' => 'ベルリンはヨーロッパの女王。洗練され、現代的で優雅なこの都市は、多くの対比を物語っています。コレクションの中心は、壁の崩壊後に残された深い傷跡と、新しい次元への再生からインスピレーションを得ています。洗練されたフォルムは出来事を讃え、きらめく色から落ち着いた色調までが自由への願いを放ち、新しい時代の始まりを約束します。',
        ),
        251 => array(
            'de' => 'Eine der schönsten Königsstädte Nordafrikas, geküsst vom warmen Sand der Wüste und reich an Geschichte und natürlicher Schönheit. Die Stücke der Kollektion, inspiriert von den Arabesken der Almohaden-Architektur, führen uns in das Land der Sultane, zwischen dem Duft von Zitronenbäumen, Gewürzen und den geheimnisvollen Gesichtern marokkanischer Frauen, halb verborgen von einem mit Edelsteinen und Perlen bestickten Schleier. Der reich verzierte Ring erinnert an die Majolikafriesen des Minaretts der Koutoubia-Moschee, während das Armband dieses Dekor mit kostbaren Diamanten und den magischen Tönen rosafarbener, gelber und blauer Saphire fortführt.',
            'es' => 'Una de las ciudades imperiales más bellas del norte de África, besada por las cálidas arenas del desierto y rica en historia y belleza natural. Las piezas de la colección, inspiradas en los arabescos de la arquitectura almohade, nos llevan a la tierra de los sultanes entre el aroma de los limoneros, el perfume de las especias y los rostros misteriosos de las mujeres marroquíes, sugeridos por un velo bordado de pequeñas piedras preciosas y perlas. El anillo ricamente decorado se inspira en el friso de mayólica del espléndido minarete de la mezquita Koutoubia, mientras el brazalete retoma la decoración con diamantes preciosos y los tonos mágicos de zafiros rosas, amarillos y azules.',
            'zh-hans' => '马拉喀什是北非最美丽的帝国古城之一，沐浴在沙漠温暖的沙砾中，拥有悠久历史与自然之美。该系列作品灵感来自阿尔摩哈德建筑中的阿拉伯纹样，带领我们进入苏丹的土地，感受柠檬树的清香、香料的气息，以及摩洛哥女性神秘的面容，仿佛半掩在以珍贵宝石与珍珠刺绣的面纱之后。华丽装饰的戒指取材于库图比亚清真寺宣礼塔的彩釉饰带，手链则以珍贵钻石和粉色、黄色、蓝色蓝宝石的魔法色调延续这一装饰。',
            'ja' => '北アフリカで最も美しい帝国都市のひとつであり、砂漠の温かな砂に包まれ、歴史と自然の美しさに満ちています。アルモハド建築のアラベスクから着想を得たコレクションは、レモンの木の香り、スパイスの芳香、宝石と真珠を刺繍したヴェールの奥に半ば隠れたモロッコ女性の神秘的な表情へと私たちを誘います。豊かに装飾されたリングはクトゥビア・モスクのミナレットの彩釉フリーズに着想を得ており、ブレスレットは貴重なダイヤモンドとピンク、イエロー、ブルーのサファイアの魔法のような色調でその装飾を繰り返します。',
        ),
        235 => array(
            'de' => 'Das berühmteste indische Monument, der Taj Mahal, der als eines der sieben Weltwunder gilt, erzählt ein Fragment indischer Geschichte. Die verschiedenen Stücke der Kollektion sind von den architektonischen Elementen des großartigen Mausoleums inspiriert, dem Tempel der ewigen Liebe. Die Ohrringe umschließen in einer sternförmigen Kreuzform die Leichtigkeit der Perlen und erinnern an das Schimmern des Mondes. Dasselbe Modul wiederholt sich in der Halskette, in der Edelsteine mit raffinierten Farbtönen mit dem Glanz des Goldes wechseln und kontrastieren. Im bedeutenden Armband wird die außergewöhnliche Wirkung des Patio-Bodens durch einen verschlungenen, kostbaren Tunnel rekonstruiert. Der im Ring dargestellte Taj Mahal leuchtet im Mondschein: Diamanten bereichern die Wände, rosa Saphire schenken dem Monument die Farbe der Morgendämmerung, seitlich fließen Saphire wie Brunnen und Smaragde bilden die Ufer.',
            'es' => 'El monumento indio más célebre, el Taj Mahal, considerado una de las siete maravillas del mundo, narra un fragmento de la historia de la India. Las diferentes piezas de la colección se inspiran en los elementos arquitectónicos del magnífico mausoleo, templo del amor eterno. Los pendientes encierran en una cruz estrellada la ligereza de las perlas evocando el resplandor de la luna. El mismo módulo se repite en el collar, donde piedras preciosas de tonos refinados alternan y contrastan con el esplendor del oro. En el imponente brazalete se reconstruye el efecto extraordinario del pavimento del patio mediante un túnel entrelazado y precioso. El Taj Mahal, representado por completo en el anillo, brilla con la luz lunar: los diamantes enriquecen e iluminan sus paredes, los zafiros rosas dan el color del amanecer, los zafiros laterales fluyen como fuentes y las esmeraldas forman sus orillas.',
            'zh-hans' => '印度最著名的古迹泰姬陵，被视为世界七大奇迹之一，讲述着印度历史的一段篇章。该系列的不同作品灵感来自这座宏伟陵墓的建筑元素，它是永恒爱情的殿堂。耳环以星形十字包围珍珠的轻盈，唤起月光的微芒。同样的结构在项链中反复出现，色调精致的宝石与黄金的光辉交替并形成对比。醒目的手链以交织而珍贵的通道重现庭院地面的非凡效果。戒指完整呈现泰姬陵，在月光中闪耀；钻石丰富并照亮墙面，粉色蓝宝石赋予它黎明时的色彩，两侧的蓝宝石如喷泉流动，祖母绿则成为河岸。',
            'ja' => 'インドで最も有名な建造物であり、世界七不思議のひとつとされるタージ・マハルは、インドの歴史の一片を語ります。コレクションの各作品は、永遠の愛の神殿である壮麗な霊廟の建築要素から着想を得ています。イヤリングは星形の十字の中に真珠の軽やかさを包み、月のきらめきを想起させます。同じモジュールはネックレスにも繰り返され、洗練された色合いの宝石がゴールドの輝きと交互に現れ、対比します。存在感のあるブレスレットでは、中庭の床の驚くべき効果が絡み合う貴重なトンネルとして再構成されています。リングに表現されたタージ・マハルは月光に輝き、ダイヤモンドが壁を照らし、ピンクサファイアが夜明けの色を与え、側面のサファイアは噴水のように流れ、エメラルドが岸辺を形づくります。',
        ),
        242 => array(
            'de' => 'Die Stadt des Glamours, der Geschäfte, des Nachtlebens und der Exzesse, geprägt von hoch aufragenden Wolkenkratzern, die durch ihre Größe beeindrucken. Die verschiedenen Stücke der Kollektion, inspiriert von der Metropole und reich an Saphiren, Rubinen und Diamanten, leuchten und funkeln wie der Mond am Nachthimmel. Bezüge zu den Farben der Flagge und zu den einst dominierenden Zwillingstürmen fehlen nicht; heute werden sie besonders als verstreute Fragmente auf der runden Oberfläche des Armbands erinnert. Auch die Freiheitsstatue schreitet über den Laufsteg und zeigt die interessante Sternform an ihrer Basis, die in den kostbaren Ohrringen und im Anhänger der Halskette wiederkehrt, als Hinweis auf Stabilität und Unabhängigkeit.',
            'es' => 'La ciudad del glamour, los negocios, la vida nocturna y los excesos, caracterizada por rascacielos imponentes que impresionan por su grandeza. Las diferentes piezas de la colección, inspiradas en la metrópolis y rebosantes de zafiros, rubíes y diamantes, iluminan y centellean con el brillo de la luna en el cielo nocturno. No faltan referencias a los colores de la bandera y a las torres gemelas, antes dominantes y majestuosas, hoy evocadas de forma conmovedora como fragmentos dispersos sobre la superficie redondeada del brazalete. También la Estatua de la Libertad desfila mostrando la interesante forma estrellada que rodea su base, presente en los preciosos pendientes y en el colgante del collar como referencia a la estabilidad y la independencia.',
            'zh-hans' => '纽约是魅力、商业、夜生活与繁华的城市，高耸的摩天楼以宏伟姿态令人震撼。该系列的不同作品以这座大都会为灵感，满载蓝宝石、红宝石与钻石，在夜空中如月光般闪耀。作品中不乏对国旗色彩的呼应，也追忆曾经庄严矗立的双子塔，如今在手链圆润表面上以散落碎片的形式被深情唤起。自由女神也仿佛走上秀台，展示其底座周围迷人的星形，这一元素出现在珍贵的耳环和项链吊坠中，象征国家的稳定与独立。',
            'ja' => 'ニューヨークは、グラマー、ビジネス、ナイトライフ、そして過剰さの都市であり、圧倒的な存在感を放つ高層ビルに特徴づけられています。メトロポリスから着想を得たコレクションの各作品は、サファイア、ルビー、ダイヤモンドに満ち、夜空の月の輝きのように光りきらめきます。国旗の色や、かつて荘厳にそびえたツインタワーへの言及もあり、現在はブレスレットの丸い表面に散りばめられた断片として切なく呼び起こされます。自由の女神もまたランウェイを歩むように、その基部を囲む興味深い星形を見せ、貴重なイヤリングとネックレスのペンダントに現れ、安定と独立を象徴します。',
        ),
        256 => array(
            'de' => 'Eine der schönsten Städte der Welt, geprägt von der hochmodernen und innovativen Architektur des Opernhauses, dem Symbol dieser Stadt. Die Kollektion ist von dem eindrucksvollen Spiel der Verbindungen dieses Theaters inspiriert, das aus gewaltigen kugelförmigen Schalen besteht, angelehnt an die Segel der Boote im Hafen, die einst die Meere des australischen Kontinents erreichten. Die Wellen funkeln und spiegeln sich in Aquamarinen und Diamanten, während die Nuancen von Iolith und Peridot die Fassung des Armbands bereichern. Der Ring reproduziert das extravagante Gebäude der Oper im Kleinen und verbindet sich mit dem reinen Glanz des Mondes wie eine Perle.',
            'es' => 'Una de las ciudades más bellas del mundo, caracterizada por la estructura arquitectónica muy moderna e innovadora de la Ópera, símbolo de esta ciudad. La colección se inspira en el formidable juego de encajes del teatro, creado por enormes conchas esféricas inspiradas en las velas de los barcos del puerto que un día surcaron los mares del continente australiano. Las olas brillan y se reflejan en aguamarinas y diamantes, mientras los matices de iolita y peridoto enriquecen la montura del brazalete. El anillo reproduce a pequeña escala el edificio extravagante de la Ópera, acompañado por el brillo puro de la luna como una perla.',
            'zh-hans' => '悉尼是世界上最美丽的城市之一，以象征城市的歌剧院那极其现代而创新的建筑结构为特色。该系列灵感来自剧院惊人的结构组合，由巨大的球形壳体构成，仿佛港口船只的风帆，曾驶向澳大利亚大陆的海域。海浪在海蓝宝石与钻石中闪耀并反射光芒，堇青石与橄榄石的色彩丰富了手链的镶座。戒指以微缩形式再现歌剧院这座奇特建筑，与如珍珠般纯净的月光相映成趣。',
            'ja' => 'シドニーは世界で最も美しい都市のひとつであり、この街の象徴であるオペラハウスの非常に現代的で革新的な建築構造に特徴づけられています。コレクションは、かつてオーストラリア大陸の海へ向かった港の船の帆を思わせる巨大な球状のシェルによって構成された、劇場の見事な連結の遊びから着想を得ています。波はアクアマリンとダイヤモンドで輝き反射し、アイオライトとペリドットのニュアンスがブレスレットの石座を豊かにします。リングはオペラハウスの独創的な建物を小さく再現し、真珠のように純粋な月の輝きと響き合います。',
        ),
    );

    return isset($texts[$source_id][$language_code]) ? $texts[$source_id][$language_code] : '';
}

function grc_city_image_html($source_id) {
    $map = array(
        263 => '<img class="alignleft size-full wp-image-83" style="margin-left: 10px; margin-right: 10px;" title="berlino" src="https://www.g-rgabriellaromeo.it/wordpress/wp-content/uploads/2011/12/berlino.jpg" alt="" width="276" height="183" />',
        251 => '<img class="alignleft size-full wp-image-29" style="margin-left: 10px; margin-right: 10px;" title="katoubia" src="https://www.g-rgabriellaromeo.it/wordpress/wp-content/uploads/2011/12/katoubia.jpg" alt="" width="194" height="259" />',
        235 => '<img class="alignleft size-full wp-image-308" style="margin-right: 10px;" title="delhi_pav" src="https://www.g-rgabriellaromeo.it/wordpress/wp-content/uploads/2012/01/delhi_pav.jpg" alt="" width="164" height="175" />',
        242 => '<img class="size-full wp-image-116 alignleft" style="margin-right: 10px;" title="- città NY  statua della libertà" src="https://www.g-rgabriellaromeo.it/wordpress/wp-content/uploads/2011/12/imagesstatua-della-liberta.jpg" alt="" width="166" height="251" />',
        256 => '<img class="alignleft size-thumbnail wp-image-261" style="margin-right: 10px;" title="Sydney_Opera_House_-_Dec_2008_2" src="https://www.g-rgabriellaromeo.it/wordpress/wp-content/uploads/2012/01/Sydney_Opera_House_-_Dec_2008_2-150x150.jpg" alt="" width="150" height="150" />',
    );
    return isset($map[$source_id]) ? $map[$source_id] : '';
}

function grc_contact_slug($source_id, $language_code) {
    $map = array(
        'de' => array(263 => 'berlin-kontaktformular', 251 => 'marrakech-kontaktformular', 235 => 'new-delhi-kontaktformular', 242 => 'new-york-kontaktformular', 256 => 'sydney-kontaktformular'),
        'es' => array(263 => 'formulario-berlin', 251 => 'formulario-marrakech', 235 => 'formulario-new-delhi', 242 => 'formulario-new-york', 256 => 'formulario-sydney'),
        'zh-hans' => array(263 => 'berlin-contact-form-zh-hans', 251 => 'marrakech-contact-form-zh-hans', 235 => 'new-delhi-contact-form-zh-hans', 242 => 'new-york-contact-form-zh-hans', 256 => 'sydney-contact-form-zh-hans'),
        'ja' => array(263 => 'berlin-contact-form-ja', 251 => 'marrakech-contact-form-ja', 235 => 'new-delhi-contact-form-ja', 242 => 'new-york-contact-form-ja', 256 => 'sydney-contact-form-ja'),
    );
    return isset($map[$language_code][$source_id]) ? $map[$language_code][$source_id] : '';
}

function grc_info_label($language_code) {
    $map = array(
        'de' => 'Informationsanfrage',
        'es' => 'Solicitud de información',
        'zh-hans' => '信息咨询',
        'ja' => 'お問い合わせ',
    );
    return isset($map[$language_code]) ? $map[$language_code] : 'Information request';
}

function grc_city_content($source_id, $language_code) {
    $text = grc_city_text($source_id, $language_code);
    $image = grc_city_image_html($source_id);
    $slug = grc_contact_slug($source_id, $language_code);
    $href = $slug ? '/' . $slug . '/?lang=' . $language_code : '#';
    $label = grc_info_label($language_code);
    return '<p>' . $image . $text . '</p><p><a class="button" title="' . esc_attr($label) . '" href="' . esc_attr($href) . '">' . $label . '</a></p>';
}

function grc_update_home_page($language_code) {
    $trid = grc_get_trid('post_page', 21);
    $target_id = grc_translation_element_id('post_page', (int) $trid, $language_code);
    if (!$target_id) {
        return 0;
    }
    $content = grc_home_page_content($language_code);
    wp_update_post(array(
        'ID' => (int) $target_id,
        'post_content' => $content,
    ));
    $slugs = array(
        'de' => '5-perlen-der-welt',
        'es' => '5-perlas-del-mundo',
        'zh-hans' => '5-pearls-of-the-world-zh-hans',
        'ja' => '5-pearls-of-the-world-ja',
    );
    if (isset($slugs[$language_code])) {
        grc_force_post_slug((int) $target_id, $slugs[$language_code]);
    }
    update_post_meta((int) $target_id, 'wpb_composer', $content);
    $subtitles = array(
        'de' => 'Das Universum aus Farben, Klängen, Linien und Schatten...',
        'es' => 'El universo compuesto de colores, sonidos, líneas y sombras...',
        'zh-hans' => '由色彩、声音、线条与阴影组成的宇宙...',
        'ja' => '色、音、線、影で構成される宇宙...',
    );
    if (isset($subtitles[$language_code])) {
        update_post_meta((int) $target_id, 'subtitle_value', $subtitles[$language_code]);
    }
    return (int) $target_id;
}

function grc_update_city_portfolio($source_id, $language_code) {
    $trid = grc_get_trid('post_wpb_portfolio', $source_id);
    $target_id = grc_translation_element_id('post_wpb_portfolio', (int) $trid, $language_code);
    if (!$target_id) {
        return 0;
    }
    $content = grc_city_content($source_id, $language_code);
    wp_update_post(array(
        'ID' => (int) $target_id,
        'post_content' => $content,
    ));
    $slugs = array(
        263 => 'berlin',
        251 => 'marrakech',
        235 => 'new-delhi',
        242 => 'new-york',
        256 => 'sydney',
    );
    if (isset($slugs[$source_id])) {
        grc_force_post_slug((int) $target_id, $slugs[$source_id] . '-' . $language_code);
    }
    return (int) $target_id;
}

function grc_apply_content_repair($new_languages) {
    global $wpdb;
    $backup_file = grc_backup_tables();
    grc_log('Backup written: ' . $backup_file);

    grc_log('Repairing category translation rows');
    grc_force_category_translation_rows($new_languages);

    foreach ($new_languages as $language_code) {
        grc_log('Preparing category terms: ' . $language_code);
        grc_force_category_translation_rows(array($language_code));

        grc_log('Creating/updating gallery posts: ' . $language_code);
        $source_posts = $wpdb->get_results(
            "SELECT p.ID
             FROM {$wpdb->posts} p
             JOIN " . grc_table('icl_translations') . " tx ON tx.element_id = p.ID AND tx.element_type = 'post_post'
             WHERE p.post_type = 'post' AND p.post_status = 'publish' AND tx.language_code = 'it'
             ORDER BY p.post_date ASC, p.ID ASC",
            ARRAY_A
        );
        foreach ($source_posts as $row) {
            grc_translate_post((int) $row['ID'], $language_code);
        }

        grc_log('Updating 5 Pearls page body: ' . $language_code);
        grc_update_home_page($language_code);

        grc_log('Updating city portfolio text: ' . $language_code);
        foreach (array(263, 251, 235, 242, 256) as $source_id) {
            grc_update_city_portfolio($source_id, $language_code);
        }
    }

    grc_force_category_translation_rows($new_languages);
    grc_recount_category_terms();

    if (function_exists('flush_rewrite_rules')) {
        flush_rewrite_rules(false);
    }
    if (function_exists('wp_cache_flush')) {
        wp_cache_flush();
    }
    grc_log('Done. Delete this repair file from the server now.');
}

if ($apply) {
    try {
        grc_apply_content_repair($new_languages);
    } catch (Exception $e) {
        grc_log('ERROR: ' . $e->getMessage());
    }
    exit;
}

echo "Options:\n";
foreach (array('page_for_posts', 'page_on_front', 'show_on_front', 'wpb_blog_layout', 'posts_per_page') as $option_name) {
    echo $option_name . '=' . get_option($option_name) . "\n";
}

echo "\nPublished post counts by language:\n";
$rows = $wpdb->get_results(
    "SELECT tx.language_code, COUNT(*) AS count_posts
     FROM {$wpdb->posts} p
     JOIN " . grc_table('icl_translations') . " tx ON tx.element_id = p.ID AND tx.element_type = 'post_post'
     WHERE p.post_type = 'post' AND p.post_status = 'publish'
     GROUP BY tx.language_code
     ORDER BY FIELD(tx.language_code, 'it','en','fr','ar','de','es','zh-hans','ja'), tx.language_code",
    ARRAY_A
);
foreach ($rows as $row) {
    echo $row['language_code'] . '=' . $row['count_posts'] . "\n";
}

echo "\nPublished portfolio counts by language:\n";
$rows = $wpdb->get_results(
    "SELECT tx.language_code, COUNT(*) AS count_posts
     FROM {$wpdb->posts} p
     JOIN " . grc_table('icl_translations') . " tx ON tx.element_id = p.ID AND tx.element_type = 'post_wpb_portfolio'
     WHERE p.post_type = 'wpb_portfolio' AND p.post_status = 'publish'
     GROUP BY tx.language_code
     ORDER BY FIELD(tx.language_code, 'it','en','fr','ar','de','es','zh-hans','ja'), tx.language_code",
    ARRAY_A
);
foreach ($rows as $row) {
    echo $row['language_code'] . '=' . $row['count_posts'] . "\n";
}

echo "\nCategories:\n";
$rows = $wpdb->get_results(
    "SELECT tx.trid, tx.language_code, tx.source_language_code, t.term_id, t.name, t.slug, tt.taxonomy, tt.count
     FROM {$wpdb->terms} t
     JOIN {$wpdb->term_taxonomy} tt ON tt.term_id = t.term_id
     LEFT JOIN " . grc_table('icl_translations') . " tx ON tx.element_id = tt.term_taxonomy_id AND tx.element_type = CONCAT('tax_', tt.taxonomy)
     WHERE tt.taxonomy IN ('category', 'portfolio_category')
     ORDER BY tt.taxonomy, tx.trid, FIELD(tx.language_code, 'it','en','fr','ar','de','es','zh-hans','ja'), t.name",
    ARRAY_A
);
foreach ($rows as $row) {
    echo 'taxonomy=' . $row['taxonomy']
        . ' trid=' . $row['trid']
        . ' lang=' . $row['language_code']
        . ' src=' . $row['source_language_code']
        . ' term_id=' . $row['term_id']
        . ' count=' . $row['count']
        . ' slug=' . $row['slug']
        . ' name=' . $row['name'] . "\n";
}

echo "\nSample post translation groups:\n";
$limit_posts = isset($codex_request['all_posts']) && (string) $codex_request['all_posts'] === '1' ? '' : 'LIMIT 12';
$italian_posts = $wpdb->get_results(
    "SELECT p.ID, p.post_title, p.post_name, tx.trid
     FROM {$wpdb->posts} p
     JOIN " . grc_table('icl_translations') . " tx ON tx.element_id = p.ID AND tx.element_type = 'post_post'
     WHERE p.post_type = 'post' AND p.post_status = 'publish' AND tx.language_code = 'it'
     ORDER BY p.post_date ASC, p.ID ASC
     $limit_posts",
    ARRAY_A
);
foreach ($italian_posts as $source) {
    echo 'source_id=' . $source['ID'] . ' trid=' . $source['trid'] . ' slug=' . $source['post_name'] . ' title=' . $source['post_title'] . "\n";
    foreach ($all_languages as $language_code) {
        $translation_id = grc_translation_element_id('post_post', (int) $source['trid'], $language_code);
        if ($translation_id) {
            $post = get_post($translation_id);
            echo '  ' . $language_code . ' id=' . $translation_id . ' slug=' . $post->post_name . ' title=' . $post->post_title . "\n";
        } else {
            echo '  ' . $language_code . " missing\n";
        }
    }
}

echo "\nPage/portfolio content samples:\n";
$sample_ids = array(21, 235, 242, 251, 256, 263);
foreach ($sample_ids as $source_id) {
    $source = get_post($source_id);
    if (!$source) {
        continue;
    }
    $type = 'post_' . $source->post_type;
    $trid = grc_get_trid($type, $source_id);
    echo 'source_id=' . $source_id . ' type=' . $source->post_type . ' trid=' . $trid . ' title=' . $source->post_title . "\n";
    foreach ($all_languages as $language_code) {
        $translation_id = grc_translation_element_id($type, (int) $trid, $language_code);
        if ($translation_id) {
            $post = get_post($translation_id);
            $plain = grc_plain($post->post_content);
            echo '  ' . $language_code . ' id=' . $translation_id . ' slug=' . $post->post_name . ' raw_chars=' . strlen($post->post_content) . ' chars=' . strlen($plain) . ' text=' . substr($plain, 0, 220) . "\n";
        } else {
            echo '  ' . $language_code . " missing\n";
        }
    }
}

echo "\nPage 21 raw/meta snippets:\n";
$page_21_trid = grc_get_trid('post_page', 21);
foreach ($all_languages as $language_code) {
    $translation_id = grc_translation_element_id('post_page', (int) $page_21_trid, $language_code);
    if (!$translation_id) {
        continue;
    }
    $post = get_post($translation_id);
    $raw = preg_replace('/\s+/', ' ', $post->post_content);
    echo $language_code . ' id=' . $translation_id . ' raw=' . substr($raw, 0, 500) . "\n";
    $meta = get_post_meta($translation_id);
    foreach ($meta as $key => $values) {
        if (strpos($key, '_wp') === 0 || in_array($key, array('_edit_lock', '_edit_last'))) {
            continue;
        }
        $value = maybe_unserialize($values[0]);
        if (is_array($value)) {
            $value = json_encode($value);
        }
        $value = preg_replace('/\s+/', ' ', (string) $value);
        if (strlen($value) > 250) {
            $value = substr($value, 0, 250);
        }
        echo '  meta ' . $key . '=' . $value . "\n";
    }
}

echo "\nHome slide snippets:\n";
$slide_sources = array(206, 205, 204, 202, 195, 207);
foreach ($slide_sources as $source_id) {
    $source = get_post($source_id);
    if (!$source) {
        continue;
    }
    $trid = grc_get_trid('post_wpb_homeslide', $source_id);
    echo 'slide_source=' . $source_id . ' trid=' . $trid . ' title=' . $source->post_title . "\n";
    foreach ($all_languages as $language_code) {
        $translation_id = grc_translation_element_id('post_wpb_homeslide', (int) $trid, $language_code);
        if (!$translation_id) {
            echo '  ' . $language_code . " missing\n";
            continue;
        }
        $post = get_post($translation_id);
        $h_title = get_post_meta($translation_id, '_h_title', true);
        $h_href_title = get_post_meta($translation_id, '_h_href_title', true);
        echo '  ' . $language_code . ' id=' . $translation_id . ' slug=' . $post->post_name . ' post_title=' . $post->post_title . ' h_title=' . str_replace("\n", ' / ', $h_title) . ' href_title=' . $h_href_title . "\n";
    }
}

echo "\nDone.\n";

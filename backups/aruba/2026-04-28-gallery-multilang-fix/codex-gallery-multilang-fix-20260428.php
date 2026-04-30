<?php
/*
 * One-time guarded multilingual gallery content repair.
 * Upload to WordPress root, run dry run first, then apply=1.
 */

$token = '34c9ff66ea9a9c286277fc92f5f5f397168b6edf';

header('Content-Type: text/plain; charset=utf-8');

if (!isset($_GET['token']) || $_GET['token'] !== $token) {
    http_response_code(403);
    echo "Forbidden\n";
    exit;
}

require_once dirname(__FILE__) . '/wp-load.php';

global $wpdb;

$backup_option = 'codex_gallery_multilang_fix_backup_20260428';

$source_ids = array(
    354,351,408,413,
    527,444,506,519,442,535,499,487,
    553,547,474,496,467,471,615,542,
    431,433,557,562,573,568,438,435,
    585,597,600,771,334,424,420,605,
);

$generated_languages = array('de', 'es', 'zh-hans', 'ja');

$labels = array(
    'it' => array('features' => 'CARATTERISTICHE', 'request' => 'Richiesta Informazioni'),
    'en' => array('features' => 'FEATURES', 'request' => 'Information request'),
    'fr' => array('features' => 'CARACTÉRISTIQUES', 'request' => "Demande d'informations"),
    'ar' => array('features' => 'الخصائص', 'request' => 'طلب معلومات'),
    'de' => array('features' => 'EIGENSCHAFTEN', 'request' => 'Informationsanfrage'),
    'es' => array('features' => 'CARACTERÍSTICAS', 'request' => 'Solicitud de información'),
    'zh-hans' => array('features' => '特点', 'request' => '信息请求'),
    'ja' => array('features' => '特徴', 'request' => 'お問い合わせ'),
);

$line_maps = array(
    'de' => array(
        'Oro Bianco e Oro Giallo 18 Kts' => 'Weißgold und Gelbgold 18 Kt',
        'Oro Bianco 18 Kts' => 'Weißgold 18 Kt',
        'Oro bianco 18 Kts' => 'Weißgold 18 Kt',
        'Oro Giallo 18 Kts' => 'Gelbgold 18 Kt',
        'Oro Bianco 18 Kts Iolite, Acquamarina, Topazio viola e Diamanti' => 'Weißgold 18 Kt, Iolith, Aquamarin, violetter Topas und Diamanten',
        'Oro Giallo 18 Kts Iolite, Acquamarina, Topazio viola e Peridot' => 'Gelbgold 18 Kt, Iolith, Aquamarin, violetter Topas und Peridot',
        'Diamanti e Zaffiri Gialli' => 'Diamanten und gelbe Saphire',
        'Perla Gold e Perla Grey' => 'Goldene Perle und graue Perle',
        'Zaffiri blue, Smeraldi, Zaffiri rosa e Diamanti' => 'Blaue Saphire, Smaragde, rosa Saphire und Diamanten',
        'Perle Australiane' => 'Australische Perlen',
        'Perle australiane' => 'Australische Perlen',
        'Smeraldi, Zaffiri rosa, Diamanti, Zaffiri blue, Zaffiri gialli' => 'Smaragde, rosa Saphire, Diamanten, blaue Saphire, gelbe Saphire',
        'Smeraldi, Zaffiri rosa, Diamanti, Zaffiri blue, Zaffiri Gialli' => 'Smaragde, rosa Saphire, Diamanten, blaue Saphire, gelbe Saphire',
        'Zaffiri blue, Zaffiri Rosa, Zaffiri gialli, Diamanti' => 'Blaue Saphire, rosa Saphire, gelbe Saphire, Diamanten',
        'Perle gold' => 'Goldene Perlen',
        'Perle Gold' => 'Goldene Perlen',
        'Zaffiri rosa, Diamanti, Zaffiri blue, Zaffiri Gialli' => 'Rosa Saphire, Diamanten, blaue Saphire, gelbe Saphire',
        'Zaffiri rosa, Diamanti, Zaffiri blue, Zaffiri gialli' => 'Rosa Saphire, Diamanten, blaue Saphire, gelbe Saphire',
        'Tzavorite, Tormalina rosa, Diamanti e Zaffiri blue' => 'Tsavorit, rosa Turmalin, Diamanten und blaue Saphire',
        'Perla Australiana' => 'Australische Perle',
        'Diamanti, Topazio viola, Iolite, Ametista' => 'Diamanten, violetter Topas, Iolith, Amethyst',
        'Diamanti,Topazio viola,Iolite,Ametista' => 'Diamanten, violetter Topas, Iolith, Amethyst',
        'Diamanti, Topazi Rosa, Iolite e Ametiste' => 'Diamanten, rosa Topase, Iolith und Amethyste',
        'Zaffiri, Diamanti e Rubini' => 'Saphire, Diamanten und Rubine',
        'Diamanti e Zaffiri Blue' => 'Diamanten und blaue Saphire',
        'Diamanti e Zaffiri blue' => 'Diamanten und blaue Saphire',
        'Diamanti, Zaffiri blue e Rubino' => 'Diamanten, blaue Saphire und Rubin',
        'Diamanti,Topazio fume’,Citrini arancioni,Citrini gialli' => 'Diamanten, Rauchtopas, orange Citrine, gelbe Citrine',
        'Topazio fume’, Citrini arancioni, Citrini gialli' => 'Rauchtopas, orange Citrine, gelbe Citrine',
        'Diamanti,Topazio fume’, Citrini arancioni, Citrini gialli' => 'Diamanten, Rauchtopas, orange Citrine, gelbe Citrine',
        'Iolite, Acquamarina, Topazio viola e Diamanti' => 'Iolith, Aquamarin, violetter Topas und Diamanten',
        'Iolite, Topazio viola, Diamanti' => 'Iolith, violetter Topas, Diamanten',
        'Iolite, Topazio viola,Peridot' => 'Iolith, violetter Topas, Peridot',
        'Iolite, Acquamarina, Topazio viola e Peridot' => 'Iolith, Aquamarin, violetter Topas und Peridot',
    ),
    'es' => array(
        'Oro Bianco e Oro Giallo 18 Kts' => 'Oro blanco y oro amarillo de 18 kts',
        'Oro Bianco 18 Kts' => 'Oro blanco de 18 kts',
        'Oro bianco 18 Kts' => 'Oro blanco de 18 kts',
        'Oro Giallo 18 Kts' => 'Oro amarillo de 18 kts',
        'Oro Bianco 18 Kts Iolite, Acquamarina, Topazio viola e Diamanti' => 'Oro blanco de 18 kts, iolita, aguamarina, topacio violeta y diamantes',
        'Oro Giallo 18 Kts Iolite, Acquamarina, Topazio viola e Peridot' => 'Oro amarillo de 18 kts, iolita, aguamarina, topacio violeta y peridoto',
        'Diamanti e Zaffiri Gialli' => 'Diamantes y zafiros amarillos',
        'Perla Gold e Perla Grey' => 'Perla dorada y perla gris',
        'Zaffiri blue, Smeraldi, Zaffiri rosa e Diamanti' => 'Zafiros azules, esmeraldas, zafiros rosas y diamantes',
        'Perle Australiane' => 'Perlas australianas',
        'Perle australiane' => 'Perlas australianas',
        'Smeraldi, Zaffiri rosa, Diamanti, Zaffiri blue, Zaffiri gialli' => 'Esmeraldas, zafiros rosas, diamantes, zafiros azules, zafiros amarillos',
        'Smeraldi, Zaffiri rosa, Diamanti, Zaffiri blue, Zaffiri Gialli' => 'Esmeraldas, zafiros rosas, diamantes, zafiros azules, zafiros amarillos',
        'Zaffiri blue, Zaffiri Rosa, Zaffiri gialli, Diamanti' => 'Zafiros azules, zafiros rosas, zafiros amarillos, diamantes',
        'Perle gold' => 'Perlas doradas',
        'Perle Gold' => 'Perlas doradas',
        'Zaffiri rosa, Diamanti, Zaffiri blue, Zaffiri Gialli' => 'Zafiros rosas, diamantes, zafiros azules, zafiros amarillos',
        'Zaffiri rosa, Diamanti, Zaffiri blue, Zaffiri gialli' => 'Zafiros rosas, diamantes, zafiros azules, zafiros amarillos',
        'Tzavorite, Tormalina rosa, Diamanti e Zaffiri blue' => 'Tsavorita, turmalina rosa, diamantes y zafiros azules',
        'Perla Australiana' => 'Perla australiana',
        'Diamanti, Topazio viola, Iolite, Ametista' => 'Diamantes, topacio violeta, iolita, amatista',
        'Diamanti,Topazio viola,Iolite,Ametista' => 'Diamantes, topacio violeta, iolita, amatista',
        'Diamanti, Topazi Rosa, Iolite e Ametiste' => 'Diamantes, topacios rosas, iolita y amatistas',
        'Zaffiri, Diamanti e Rubini' => 'Zafiros, diamantes y rubíes',
        'Diamanti e Zaffiri Blue' => 'Diamantes y zafiros azules',
        'Diamanti e Zaffiri blue' => 'Diamantes y zafiros azules',
        'Diamanti, Zaffiri blue e Rubino' => 'Diamantes, zafiros azules y rubí',
        'Diamanti,Topazio fume’,Citrini arancioni,Citrini gialli' => 'Diamantes, topacio ahumado, citrinos naranjas, citrinos amarillos',
        'Topazio fume’, Citrini arancioni, Citrini gialli' => 'Topacio ahumado, citrinos naranjas, citrinos amarillos',
        'Diamanti,Topazio fume’, Citrini arancioni, Citrini gialli' => 'Diamantes, topacio ahumado, citrinos naranjas, citrinos amarillos',
        'Iolite, Acquamarina, Topazio viola e Diamanti' => 'Iolita, aguamarina, topacio violeta y diamantes',
        'Iolite, Topazio viola, Diamanti' => 'Iolita, topacio violeta, diamantes',
        'Iolite, Topazio viola,Peridot' => 'Iolita, topacio violeta, peridoto',
        'Iolite, Acquamarina, Topazio viola e Peridot' => 'Iolita, aguamarina, topacio violeta y peridoto',
    ),
    'zh-hans' => array(
        'Oro Bianco e Oro Giallo 18 Kts' => '18K 白金和黄金',
        'Oro Bianco 18 Kts' => '18K 白金',
        'Oro bianco 18 Kts' => '18K 白金',
        'Oro Giallo 18 Kts' => '18K 黄金',
        'Oro Bianco 18 Kts Iolite, Acquamarina, Topazio viola e Diamanti' => '18K 白金、堇青石、海蓝宝石、紫色托帕石和钻石',
        'Oro Giallo 18 Kts Iolite, Acquamarina, Topazio viola e Peridot' => '18K 黄金、堇青石、海蓝宝石、紫色托帕石和橄榄石',
        'Diamanti e Zaffiri Gialli' => '钻石和黄色蓝宝石',
        'Perla Gold e Perla Grey' => '金色珍珠和灰色珍珠',
        'Zaffiri blue, Smeraldi, Zaffiri rosa e Diamanti' => '蓝色蓝宝石、祖母绿、粉色蓝宝石和钻石',
        'Perle Australiane' => '澳大利亚珍珠',
        'Perle australiane' => '澳大利亚珍珠',
        'Smeraldi, Zaffiri rosa, Diamanti, Zaffiri blue, Zaffiri gialli' => '祖母绿、粉色蓝宝石、钻石、蓝色蓝宝石、黄色蓝宝石',
        'Smeraldi, Zaffiri rosa, Diamanti, Zaffiri blue, Zaffiri Gialli' => '祖母绿、粉色蓝宝石、钻石、蓝色蓝宝石、黄色蓝宝石',
        'Zaffiri blue, Zaffiri Rosa, Zaffiri gialli, Diamanti' => '蓝色蓝宝石、粉色蓝宝石、黄色蓝宝石、钻石',
        'Perle gold' => '金色珍珠',
        'Perle Gold' => '金色珍珠',
        'Zaffiri rosa, Diamanti, Zaffiri blue, Zaffiri Gialli' => '粉色蓝宝石、钻石、蓝色蓝宝石、黄色蓝宝石',
        'Zaffiri rosa, Diamanti, Zaffiri blue, Zaffiri gialli' => '粉色蓝宝石、钻石、蓝色蓝宝石、黄色蓝宝石',
        'Tzavorite, Tormalina rosa, Diamanti e Zaffiri blue' => '沙弗莱石、粉色碧玺、钻石和蓝色蓝宝石',
        'Perla Australiana' => '澳大利亚珍珠',
        'Diamanti, Topazio viola, Iolite, Ametista' => '钻石、紫色托帕石、堇青石、紫水晶',
        'Diamanti,Topazio viola,Iolite,Ametista' => '钻石、紫色托帕石、堇青石、紫水晶',
        'Diamanti, Topazi Rosa, Iolite e Ametiste' => '钻石、粉色托帕石、堇青石和紫水晶',
        'Zaffiri, Diamanti e Rubini' => '蓝宝石、钻石和红宝石',
        'Diamanti e Zaffiri Blue' => '钻石和蓝色蓝宝石',
        'Diamanti e Zaffiri blue' => '钻石和蓝色蓝宝石',
        'Diamanti, Zaffiri blue e Rubino' => '钻石、蓝色蓝宝石和红宝石',
        'Diamanti,Topazio fume’,Citrini arancioni,Citrini gialli' => '钻石、烟色托帕石、橙色黄水晶、黄色黄水晶',
        'Topazio fume’, Citrini arancioni, Citrini gialli' => '烟色托帕石、橙色黄水晶、黄色黄水晶',
        'Diamanti,Topazio fume’, Citrini arancioni, Citrini gialli' => '钻石、烟色托帕石、橙色黄水晶、黄色黄水晶',
        'Iolite, Acquamarina, Topazio viola e Diamanti' => '堇青石、海蓝宝石、紫色托帕石和钻石',
        'Iolite, Topazio viola, Diamanti' => '堇青石、紫色托帕石、钻石',
        'Iolite, Topazio viola,Peridot' => '堇青石、紫色托帕石、橄榄石',
        'Iolite, Acquamarina, Topazio viola e Peridot' => '堇青石、海蓝宝石、紫色托帕石和橄榄石',
    ),
    'ja' => array(
        'Oro Bianco e Oro Giallo 18 Kts' => '18Kホワイトゴールドとイエローゴールド',
        'Oro Bianco 18 Kts' => '18Kホワイトゴールド',
        'Oro bianco 18 Kts' => '18Kホワイトゴールド',
        'Oro Giallo 18 Kts' => '18Kイエローゴールド',
        'Oro Bianco 18 Kts Iolite, Acquamarina, Topazio viola e Diamanti' => '18Kホワイトゴールド、アイオライト、アクアマリン、パープルトパーズ、ダイヤモンド',
        'Oro Giallo 18 Kts Iolite, Acquamarina, Topazio viola e Peridot' => '18Kイエローゴールド、アイオライト、アクアマリン、パープルトパーズ、ペリドット',
        'Diamanti e Zaffiri Gialli' => 'ダイヤモンドとイエローサファイア',
        'Perla Gold e Perla Grey' => 'ゴールドパールとグレーパール',
        'Zaffiri blue, Smeraldi, Zaffiri rosa e Diamanti' => 'ブルーサファイア、エメラルド、ピンクサファイア、ダイヤモンド',
        'Perle Australiane' => 'オーストラリア産パール',
        'Perle australiane' => 'オーストラリア産パール',
        'Smeraldi, Zaffiri rosa, Diamanti, Zaffiri blue, Zaffiri gialli' => 'エメラルド、ピンクサファイア、ダイヤモンド、ブルーサファイア、イエローサファイア',
        'Smeraldi, Zaffiri rosa, Diamanti, Zaffiri blue, Zaffiri Gialli' => 'エメラルド、ピンクサファイア、ダイヤモンド、ブルーサファイア、イエローサファイア',
        'Zaffiri blue, Zaffiri Rosa, Zaffiri gialli, Diamanti' => 'ブルーサファイア、ピンクサファイア、イエローサファイア、ダイヤモンド',
        'Perle gold' => 'ゴールドパール',
        'Perle Gold' => 'ゴールドパール',
        'Zaffiri rosa, Diamanti, Zaffiri blue, Zaffiri Gialli' => 'ピンクサファイア、ダイヤモンド、ブルーサファイア、イエローサファイア',
        'Zaffiri rosa, Diamanti, Zaffiri blue, Zaffiri gialli' => 'ピンクサファイア、ダイヤモンド、ブルーサファイア、イエローサファイア',
        'Tzavorite, Tormalina rosa, Diamanti e Zaffiri blue' => 'ツァボライト、ピンクトルマリン、ダイヤモンド、ブルーサファイア',
        'Perla Australiana' => 'オーストラリア産パール',
        'Diamanti, Topazio viola, Iolite, Ametista' => 'ダイヤモンド、パープルトパーズ、アイオライト、アメジスト',
        'Diamanti,Topazio viola,Iolite,Ametista' => 'ダイヤモンド、パープルトパーズ、アイオライト、アメジスト',
        'Diamanti, Topazi Rosa, Iolite e Ametiste' => 'ダイヤモンド、ピンクトパーズ、アイオライト、アメジスト',
        'Zaffiri, Diamanti e Rubini' => 'サファイア、ダイヤモンド、ルビー',
        'Diamanti e Zaffiri Blue' => 'ダイヤモンドとブルーサファイア',
        'Diamanti e Zaffiri blue' => 'ダイヤモンドとブルーサファイア',
        'Diamanti, Zaffiri blue e Rubino' => 'ダイヤモンド、ブルーサファイア、ルビー',
        'Diamanti,Topazio fume’,Citrini arancioni,Citrini gialli' => 'ダイヤモンド、スモーキートパーズ、オレンジシトリン、イエローシトリン',
        'Topazio fume’, Citrini arancioni, Citrini gialli' => 'スモーキートパーズ、オレンジシトリン、イエローシトリン',
        'Diamanti,Topazio fume’, Citrini arancioni, Citrini gialli' => 'ダイヤモンド、スモーキートパーズ、オレンジシトリン、イエローシトリン',
        'Iolite, Acquamarina, Topazio viola e Diamanti' => 'アイオライト、アクアマリン、パープルトパーズ、ダイヤモンド',
        'Iolite, Topazio viola, Diamanti' => 'アイオライト、パープルトパーズ、ダイヤモンド',
        'Iolite, Topazio viola,Peridot' => 'アイオライト、パープルトパーズ、ペリドット',
        'Iolite, Acquamarina, Topazio viola e Peridot' => 'アイオライト、アクアマリン、パープルトパーズ、ペリドット',
    ),
);

function grgm_log($message) {
    echo $message . "\n";
}

function grgm_dump($value) {
    print_r($value);
    echo "\n";
}

function grgm_table_exists($table) {
    global $wpdb;
    return $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $table)) === $table;
}

function grgm_post($id) {
    global $wpdb;
    return $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->posts} WHERE ID = %d LIMIT 1", (int) $id), ARRAY_A);
}

function grgm_translations($source_id) {
    global $wpdb;
    $source_id = (int) $source_id;
    $table = $wpdb->prefix . 'icl_translations';
    $fallback = array(array('element_id' => $source_id, 'language_code' => 'it', 'element_type' => 'post_post'));
    if (!grgm_table_exists($table)) return $fallback;

    $source = $wpdb->get_row($wpdb->prepare(
        "SELECT trid, element_type FROM $table WHERE element_id = %d AND element_type = 'post_post' LIMIT 1",
        $source_id
    ), ARRAY_A);
    if (!$source) return $fallback;

    $rows = $wpdb->get_results($wpdb->prepare(
        "SELECT element_id, language_code, element_type FROM $table WHERE trid = %d AND element_type = %s ORDER BY FIELD(language_code,'it','en','fr','ar','de','es','zh-hans','ja'), language_code",
        (int) $source['trid'],
        $source['element_type']
    ), ARRAY_A);
    return $rows ? $rows : $fallback;
}

function grgm_target_ids($source_ids) {
    $ids = array();
    foreach ($source_ids as $source_id) {
        foreach (grgm_translations($source_id) as $row) {
            $ids[] = (int) $row['element_id'];
        }
    }
    return array_values(array_unique(array_filter($ids)));
}

function grgm_backup($source_ids) {
    global $wpdb, $backup_option;
    $ids = grgm_target_ids($source_ids);
    $id_sql = $ids ? implode(',', array_map('intval', $ids)) : '0';

    $backup = array(
        'created_at' => current_time('mysql'),
        'target_ids' => $ids,
        'posts' => $wpdb->get_results("SELECT * FROM {$wpdb->posts} WHERE ID IN ($id_sql)", ARRAY_A),
        'postmeta' => $wpdb->get_results("SELECT * FROM {$wpdb->postmeta} WHERE post_id IN ($id_sql)", ARRAY_A),
        'term_relationships' => $wpdb->get_results("SELECT * FROM {$wpdb->term_relationships} WHERE object_id IN ($id_sql)", ARRAY_A),
    );

    $existing = get_option($backup_option);
    if (!$existing) update_option($backup_option, serialize($backup));

    $upload = wp_upload_dir();
    $dir = trailingslashit($upload['basedir']) . 'codex-gallery-multilang-backups';
    if (!is_dir($dir)) wp_mkdir_p($dir);
    $file = trailingslashit($dir) . 'gallery-multilang-before-' . date('Ymd-His') . '.serialized.txt';
    file_put_contents($file, serialize($backup));

    return array($file, $existing ? 'existing-option-kept' : 'option-created');
}

function grgm_restore_backup() {
    global $wpdb, $backup_option;
    $raw = get_option($backup_option);
    if (!$raw) {
        grgm_log('No backup option found: ' . $backup_option);
        return false;
    }
    $backup = @unserialize($raw);
    if (!$backup || empty($backup['posts'])) {
        grgm_log('Backup option is invalid.');
        return false;
    }
    foreach ($backup['posts'] as $row) {
        if (empty($row['ID'])) continue;
        $id = (int) $row['ID'];
        unset($row['ID']);
        $wpdb->update($wpdb->posts, $row, array('ID' => $id));
        if (function_exists('clean_post_cache')) clean_post_cache($id);
        grgm_log('Restored post ' . $id);
    }
    if (function_exists('wp_cache_flush')) wp_cache_flush();
    return true;
}

function grgm_plain($html) {
    $text = html_entity_decode(strip_tags((string) $html), ENT_QUOTES, 'UTF-8');
    $text = str_replace("\xc2\xa0", ' ', $text);
    $text = preg_replace('/\s+/', ' ', $text);
    return trim($text);
}

function grgm_is_price_text($text) {
    return preg_match('/(€|&euro;|&#8364;|&#x20AC;|euro|EUR|يورو)/i', (string) $text) === 1;
}

function grgm_price_number($content) {
    if (preg_match_all('/<li\b[^>]*>([\s\S]*?)<\/li>/i', $content, $matches)) {
        foreach ($matches[1] as $inner) {
            $plain = grgm_plain($inner);
            if (!grgm_is_price_text($plain)) continue;
            if (preg_match('/[0-9]{1,3}(?:[.,]\s?[0-9]{3})+|[0-9]+/', $plain, $num)) {
                return str_replace(' ', '', $num[0]);
            }
        }
    }
    return '';
}

function grgm_price_line($number, $language_code) {
    if ($number === '') return '';
    if ($language_code === 'ar') return $number . ' يورو';
    return '€ ' . $number;
}

function grgm_extract_feature_lines($content) {
    $lines = array();
    if (!preg_match_all('/<li\b[^>]*>([\s\S]*?)<\/li>/i', $content, $matches)) {
        return $lines;
    }
    foreach ($matches[1] as $inner) {
        $plain = grgm_plain($inner);
        if ($plain === '' || grgm_is_price_text($plain)) continue;
        $lines[] = $plain;
    }
    return $lines;
}

function grgm_translate_line($line, $language_code) {
    global $line_maps;
    $line = trim(str_replace("\xc2\xa0", ' ', $line));
    if (isset($line_maps[$language_code][$line])) {
        return $line_maps[$language_code][$line];
    }
    return $line;
}

function grgm_city_slug($title) {
    $lower = strtolower((string) $title);
    if (strpos($lower, 'marrakech') !== false) return 'marrakech';
    if (strpos($lower, 'new delhi') !== false) return 'new-delhi';
    if (strpos($lower, 'new york') !== false) return 'new-york';
    if (strpos($lower, 'sydney') !== false) return 'sydney';
    return 'berlin';
}

function grgm_button($city, $label) {
    $city_title = array(
        'berlin' => 'Berlin',
        'marrakech' => 'Marrakech',
        'new-delhi' => 'New Delhi',
        'new-york' => 'New York',
        'sydney' => 'Sydney',
    );
    $title = isset($city_title[$city]) ? $city_title[$city] : 'Contact';
    return '<p><a class="button" title="' . esc_attr($title . ' Contact Form') . '" href="/' . esc_attr($city) . '-contact-form/">' . esc_html($label) . '</a></p>';
}

function grgm_content_from_lines($post_id, $language_code, $source_title, $lines, $price_number, $translate_lines) {
    global $labels;
    $feature_label = isset($labels[$language_code]['features']) ? $labels[$language_code]['features'] : $labels['en']['features'];
    $request_label = isset($labels[$language_code]['request']) ? $labels[$language_code]['request'] : $labels['en']['request'];
    if (!$lines) return null;

    $html = '<p><span id="more-' . (int) $post_id . '"></span>' . esc_html($feature_label) . '</p>' . "\n";
    $html .= "<ul>\n";
    foreach ($lines as $line) {
        $html .= '<li>' . esc_html($translate_lines ? grgm_translate_line($line, $language_code) : $line) . '</li>' . "\n";
    }
    $price_line = grgm_price_line($price_number, $language_code);
    if ($price_line !== '') $html .= '<li>' . esc_html($price_line) . '</li>' . "\n";
    $html .= "</ul>\n<p>&nbsp;</p>\n";
    $html .= grgm_button(grgm_city_slug($source_title), $request_label);
    return $html;
}

function grgm_generated_content($post_id, $language_code, $source_title, $source_content, $price_number) {
    return grgm_content_from_lines($post_id, $language_code, $source_title, grgm_extract_feature_lines($source_content), $price_number, true);
}

function grgm_strip_price_lines($content) {
    return preg_replace('/<li\b[^>]*>(?:(?!<\/li>)[\s\S])*(?:€|&euro;|&#8364;|&#x20AC;|euro|EUR|يورو)(?:(?!<\/li>)[\s\S])*<\/li>\s*/i', '', $content);
}

function grgm_set_label_before_list($content, $post_id, $label) {
    $label_html = '<p><span id="more-' . (int) $post_id . '"></span>' . esc_html($label) . '</p>' . "\n";
    $updated = preg_replace('/^\s*(?:<p\b[^>]*>[\s\S]*?<\/p>\s*)*(?=<ul\b[^>]*>)/i', $label_html, $content, 1, $count);
    if ($count > 0) return $updated;
    return preg_replace('/<ul\b([^>]*)>/i', $label_html . '<ul$1>', $content, 1);
}

function grgm_trim_trailing_empty_paragraphs($content) {
    return preg_replace('/(?:\s*<p\b[^>]*>(?:\s|&nbsp;|&#160;|<br\s*\/?>)*<\/p>\s*)+$/i', '', trim($content));
}

function grgm_set_button($content, $city, $label) {
    $button = grgm_button($city, $label);
    $content = preg_replace('/<p\b[^>]*>\s*<a\b[^>]*class=["\'][^"\']*\bbutton\b[^"\']*["\'][\s\S]*?<\/a>\s*<\/p>\s*/i', '', $content);
    $content = grgm_trim_trailing_empty_paragraphs($content);
    return rtrim($content) . "\n<p>&nbsp;</p>\n" . $button;
}

function grgm_normalized_existing_content($post_id, $language_code, $source_title, $content, $source_content, $price_number) {
    $lines = grgm_extract_feature_lines($content);
    if (!$lines) $lines = grgm_extract_feature_lines($source_content);
    return grgm_content_from_lines($post_id, $language_code, $source_title, $lines, $price_number, false);
}

function grgm_count_price_lines($content) {
    preg_match_all('/<li\b[^>]*>[\s\S]*?(?:€|&euro;|&#8364;|&#x20AC;|euro|EUR|يورو)[\s\S]*?<\/li>/i', $content, $matches);
    return count($matches[0]);
}

function grgm_plan($source_ids, $generated_languages) {
    $rows = array();
    foreach ($source_ids as $source_id) {
        $source = grgm_post($source_id);
        if (!$source) continue;
        $price_number = grgm_price_number($source['post_content']);
        foreach (grgm_translations($source_id) as $translation) {
            $post = grgm_post((int) $translation['element_id']);
            if (!$post) continue;
            $lang = $translation['language_code'];
            $mode = in_array($lang, $generated_languages, true) ? 'regenerate-translated-content' : 'normalize-existing-content';
            $rows[] = array(
                'source_id' => (int) $source_id,
                'post_id' => (int) $post['ID'],
                'language' => $lang,
                'title' => $post['post_title'],
                'mode' => $mode,
                'price_number' => $price_number,
                'price_lines_before' => grgm_count_price_lines($post['post_content']),
                'feature_lines_from_source' => count(grgm_extract_feature_lines($source['post_content'])),
            );
        }
    }
    return $rows;
}

function grgm_apply($source_ids, $generated_languages) {
    global $wpdb;
    $updates = array();
    foreach ($source_ids as $source_id) {
        $source = grgm_post($source_id);
        if (!$source) continue;
        $price_number = grgm_price_number($source['post_content']);
        foreach (grgm_translations($source_id) as $translation) {
            $post = grgm_post((int) $translation['element_id']);
            if (!$post) continue;
            $lang = $translation['language_code'];
            if (in_array($lang, $generated_languages, true)) {
                $new_content = grgm_generated_content((int) $post['ID'], $lang, $source['post_title'], $source['post_content'], $price_number);
                $mode = 'regenerated';
                if ($new_content === null) {
                    $new_content = grgm_normalized_existing_content((int) $post['ID'], $lang, $source['post_title'], $post['post_content'], $source['post_content'], $price_number);
                    $mode = 'normalized-fallback';
                }
            } else {
                $new_content = grgm_normalized_existing_content((int) $post['ID'], $lang, $source['post_title'], $post['post_content'], $source['post_content'], $price_number);
                $mode = 'normalized';
            }
            $changed = $new_content !== $post['post_content'];
            $ok = true;
            if ($changed) {
                $result = $wpdb->update(
                    $wpdb->posts,
                    array(
                        'post_content' => $new_content,
                        'post_modified' => current_time('mysql'),
                        'post_modified_gmt' => current_time('mysql', 1),
                    ),
                    array('ID' => (int) $post['ID'])
                );
                $ok = $result !== false;
                if (function_exists('clean_post_cache')) clean_post_cache((int) $post['ID']);
            }
            $updates[] = array(
                'post_id' => (int) $post['ID'],
                'language' => $lang,
                'mode' => $mode,
                'changed' => $changed ? 1 : 0,
                'ok' => $ok ? 1 : 0,
                'price_lines_after' => grgm_count_price_lines($new_content),
            );
        }
    }
    if (function_exists('wp_cache_flush')) wp_cache_flush();
    return $updates;
}

if (isset($_GET['rollback']) && $_GET['rollback'] === '1') {
    grgm_log('ROLLBACK');
    $ok = grgm_restore_backup();
    grgm_log($ok ? 'Rollback completed.' : 'Rollback failed.');
    exit($ok ? 0 : 1);
}

$apply = isset($_GET['apply']) && $_GET['apply'] === '1';

grgm_log($apply ? 'APPLY MODE' : 'DRY RUN');
$plan = grgm_plan($source_ids, $generated_languages);
grgm_dump($plan);

if (!$apply) {
    grgm_log('No changes written. Add &apply=1 to update.');
    exit;
}

list($backup_file, $backup_state) = grgm_backup($source_ids);
grgm_log('Backup state: ' . $backup_state);
grgm_log('Backup file: ' . $backup_file);

$updates = grgm_apply($source_ids, $generated_languages);
grgm_log('Updates:');
grgm_dump($updates);
grgm_log('Done.');

<?php
/*
 * One-time WPML form/store audit and repair for www.g-rgabriellaromeo.it.
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

function grfs_table($name) {
    global $wpdb;
    return $wpdb->prefix . $name;
}

function grfs_get_trid($element_type, $element_id) {
    global $wpdb;
    return $wpdb->get_var($wpdb->prepare(
        'SELECT trid FROM ' . grfs_table('icl_translations') . ' WHERE element_type = %s AND element_id = %d LIMIT 1',
        $element_type,
        (int) $element_id
    ));
}

function grfs_translation_element_id($element_type, $trid, $language_code) {
    global $wpdb;
    return $wpdb->get_var($wpdb->prepare(
        'SELECT element_id FROM ' . grfs_table('icl_translations') . ' WHERE element_type = %s AND trid = %d AND language_code = %s LIMIT 1',
        $element_type,
        (int) $trid,
        $language_code
    ));
}

function grfs_plain($html) {
    $text = wp_strip_all_tags((string) $html);
    $text = preg_replace('/\s+/', ' ', $text);
    return trim($text);
}

$form_source_ids = array(346, 387, 385, 381, 320);
$languages = array('it', 'en', 'fr', 'ar', 'de', 'es', 'zh-hans', 'ja');
$apply = (isset($codex_request['codex_run']) && (string) $codex_request['codex_run'] === '1')
    || (isset($codex_request['apply']) && (string) $codex_request['apply'] === '1');

function grfs_log($message) {
    echo $message . "\n";
}

function grfs_backup_tables() {
    global $wpdb;
    $upload = wp_upload_dir();
    $dir = trailingslashit($upload['basedir']) . 'codex-wpml-backups';
    if (!is_dir($dir)) {
        wp_mkdir_p($dir);
    }

    $backup = array(
        'created_at' => date('c'),
        'posts' => $wpdb->get_results("SELECT * FROM {$wpdb->posts} WHERE post_type IN ('page', 'nav_menu_item')", ARRAY_A),
        'postmeta' => $wpdb->get_results("SELECT pm.* FROM {$wpdb->postmeta} pm JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE p.post_type IN ('page', 'nav_menu_item')", ARRAY_A),
        'customcontactforms_field_options' => $wpdb->get_results('SELECT * FROM ' . $wpdb->prefix . 'customcontactforms_field_options', ARRAY_A),
        'customcontactforms_fields' => $wpdb->get_results('SELECT * FROM ' . $wpdb->prefix . 'customcontactforms_fields', ARRAY_A),
        'customcontactforms_forms' => $wpdb->get_results('SELECT * FROM ' . $wpdb->prefix . 'customcontactforms_forms', ARRAY_A),
    );

    $file = trailingslashit($dir) . 'wpml-forms-store-before-' . date('Ymd-His') . '.json';
    file_put_contents($file, json_encode($backup));
    return $file;
}

function grfs_force_post_slug($post_id, $slug) {
    global $wpdb;
    $wpdb->update($wpdb->posts, array('post_name' => $slug), array('ID' => (int) $post_id));
    if (function_exists('clean_post_cache')) {
        clean_post_cache((int) $post_id);
    }
}

function grfs_image_block($source_id) {
    $source = get_post($source_id);
    if (!$source) {
        return '';
    }
    if (preg_match_all('/<p\b[^>]*>.*?<\/p>/is', $source->post_content, $matches)) {
        foreach ($matches[0] as $paragraph) {
            if (stripos($paragraph, '<img') !== false) {
                return $paragraph;
            }
        }
    }
    return '';
}

function grfs_city_data() {
    return array(
        346 => array(
            'city' => 'Berlin',
            'form_id' => 3,
            'slugs' => array('de' => 'berlin-kontaktformular', 'es' => 'formulario-berlin', 'zh-hans' => 'berlin-contact-form-zh-hans', 'ja' => 'berlin-contact-form-ja'),
            'titles' => array('de' => 'Berlin Formular', 'es' => 'Formulario Berlin', 'zh-hans' => '柏林咨询表', 'ja' => 'ベルリン フォーム'),
        ),
        387 => array(
            'city' => 'Marrakech',
            'form_id' => 6,
            'slugs' => array('de' => 'marrakech-kontaktformular', 'es' => 'formulario-marrakech', 'zh-hans' => 'marrakech-contact-form-zh-hans', 'ja' => 'marrakech-contact-form-ja'),
            'titles' => array('de' => 'Marrakech Formular', 'es' => 'Formulario Marrakech', 'zh-hans' => '马拉喀什咨询表', 'ja' => 'マラケシュ フォーム'),
        ),
        385 => array(
            'city' => 'New Delhi',
            'form_id' => 5,
            'slugs' => array('de' => 'new-delhi-kontaktformular', 'es' => 'formulario-new-delhi', 'zh-hans' => 'new-delhi-contact-form-zh-hans', 'ja' => 'new-delhi-contact-form-ja'),
            'titles' => array('de' => 'New Delhi Formular', 'es' => 'Formulario New Delhi', 'zh-hans' => '新德里咨询表', 'ja' => 'ニューデリー フォーム'),
        ),
        381 => array(
            'city' => 'New York',
            'form_id' => 4,
            'slugs' => array('de' => 'new-york-kontaktformular', 'es' => 'formulario-new-york', 'zh-hans' => 'new-york-contact-form-zh-hans', 'ja' => 'new-york-contact-form-ja'),
            'titles' => array('de' => 'New York Formular', 'es' => 'Formulario New York', 'zh-hans' => '纽约咨询表', 'ja' => 'ニューヨーク フォーム'),
        ),
        320 => array(
            'city' => 'Sydney',
            'form_id' => 2,
            'slugs' => array('de' => 'sydney-kontaktformular', 'es' => 'formulario-sydney', 'zh-hans' => 'sydney-contact-form-zh-hans', 'ja' => 'sydney-contact-form-ja'),
            'titles' => array('de' => 'Sydney Formular', 'es' => 'Formulario Sydney', 'zh-hans' => '悉尼咨询表', 'ja' => 'シドニー フォーム'),
        ),
    );
}

function grfs_intro($city, $language_code) {
    $lines = array(
        'de' => array(
            'Gabriella Romeo kreiert handgefertigte Schmuckstücke in limitierter Auflage.',
            'Um kontaktiert zu werden und weitere Informationen zur Kollektion ' . $city . ' zu erhalten, füllen Sie bitte das folgende Formular aus und senden Sie es ab.',
        ),
        'es' => array(
            'Gabriella Romeo crea joyas artesanales en edición limitada.',
            'Para ser contactado y recibir más información sobre la colección ' . $city . ', complete y envíe el siguiente formulario.',
        ),
        'zh-hans' => array(
            'Gabriella Romeo 创作限量版手工珠宝。',
            '如需联系并获取关于 ' . $city . ' 系列的更多信息，请填写并提交以下表格。',
        ),
        'ja' => array(
            'Gabriella Romeo は限定版のハンドメイドジュエリーを制作しています。',
            $city . ' コレクションについてのお問い合わせや詳細情報をご希望の場合は、下記フォームにご記入のうえ送信してください。',
        ),
    );

    return isset($lines[$language_code]) ? '<p>' . implode('<br />', $lines[$language_code]) . '</p>' : '';
}

function grfs_update_forms_plugin_text() {
    global $wpdb;
    $fields = $wpdb->prefix . 'customcontactforms_fields';
    $options = $wpdb->prefix . 'customcontactforms_field_options';
    $forms = $wpdb->prefix . 'customcontactforms_forms';

    $wpdb->update($fields, array(
        'field_label' => 'I am interested in: / Je suis intéressé(e) par : / Sono interessato/a a: / أنا مهتم/ـة بـ: / Ich interessiere mich für: / Me interesa: / 我感兴趣的是： / 興味があるもの：',
        'field_instructions' => 'Select the model you are interested in / Sélectionnez le modèle qui vous intéresse / Seleziona il modello che ti interessa / اختر النموذج الذي يهمك / Wählen Sie das Modell aus, das Sie interessiert / Seleccione el modelo que le interesa / 请选择您感兴趣的款式 / ご希望のモデルを選択してください',
        'field_error' => 'Invalid entry / Saisie incorrecte / Inserimento errato / إدخال غير صحيح / Ungültige Eingabe / Entrada no válida / 输入无效 / 入力が正しくありません',
    ), array('id' => 13));
    $wpdb->update($fields, array('field_label' => 'Name / Nom / Nome / الاسم الشخصي / Name / Nombre / 名字 / お名前'), array('id' => 15));
    $wpdb->update($fields, array('field_label' => 'Surname / Nom de famille / Cognome / اسم العائلة / Nachname / Apellido / 姓氏 / 姓'), array('id' => 16));
    $wpdb->update($fields, array(
        'field_label' => 'Email / E-mail / Email / البريد الإلكتروني / E-Mail / Correo electrónico / 电子邮件 / メール',
        'field_instructions' => 'Please enter your email address / Veuillez saisir votre adresse e-mail / Inserisci il tuo indirizzo email / يرجى إدخال بريدك الإلكتروني / Bitte geben Sie Ihre E-Mail-Adresse ein / Introduzca su correo electrónico / 请输入您的电子邮件地址 / メールアドレスを入力してください',
    ), array('id' => 5));
    $wpdb->update($fields, array('field_label' => 'Message / Message / Messaggio / الرسالة / Nachricht / Mensaje / 留言 / メッセージ'), array('id' => 17));

    $option_labels = array(
        1 => 'Ring / Bague / Anello / خاتم / Ring / Anillo / 戒指 / リング',
        2 => 'Bracelet / Bracelet / Bracciale / سوار / Armband / Pulsera / 手链 / ブレスレット',
        3 => 'Necklace / Collier / Collana / عقد / Halskette / Collar / 项链 / ネックレス',
        4 => 'Earrings / Boucles d’oreilles / Orecchini / أقراط / Ohrringe / Pendientes / 耳环 / イヤリング',
    );
    foreach ($option_labels as $id => $label) {
        $wpdb->update($options, array('option_label' => $label), array('id' => $id));
    }

    $form_titles = array(
        2 => 'Sydney Collection / Collection Sydney / Collezione Sydney / مجموعة سيدني / Sydney Kollektion / Colección Sydney / 悉尼系列 / シドニー コレクション',
        3 => 'Berlin Collection / Collection Berlin / Collezione Berlin / مجموعة برلين / Berlin Kollektion / Colección Berlin / 柏林系列 / ベルリン コレクション',
        4 => 'New York Collection / Collection New York / Collezione New York / مجموعة نيويورك / New York Kollektion / Colección New York / 纽约系列 / ニューヨーク コレクション',
        5 => 'New Delhi Collection / Collection New Delhi / Collezione New Delhi / مجموعة نيودلهي / New Delhi Kollektion / Colección New Delhi / 新德里系列 / ニューデリー コレクション',
        6 => 'Marrakech Collection / Collection Marrakech / Collezione Marrakech / مجموعة مراكش / Marrakech Kollektion / Colección Marrakech / 马拉喀什系列 / マラケシュ コレクション',
    );
    foreach ($form_titles as $id => $title) {
        $wpdb->update($forms, array(
            'form_title' => $title,
            'submit_button_text' => 'Send / Envoyer / Invia / إرسال / Senden / Enviar / 提交 / 送信',
        ), array('id' => $id));
    }
}

function grfs_update_new_language_pages() {
    global $wpdb;
    $city_data = grfs_city_data();
    $new_languages = array('de', 'es', 'zh-hans', 'ja');

    foreach ($city_data as $source_id => $data) {
        $trid = grfs_get_trid('post_page', $source_id);
        $image_block = grfs_image_block($source_id);
        foreach ($new_languages as $language_code) {
            $target_id = grfs_translation_element_id('post_page', (int) $trid, $language_code);
            if (!$target_id) {
                continue;
            }
            $content = grfs_intro($data['city'], $language_code) . $image_block . '[customcontact form=' . (int) $data['form_id'] . ']';
            wp_update_post(array(
                'ID' => (int) $target_id,
                'post_title' => $data['titles'][$language_code],
                'post_content' => $content,
            ));
            grfs_force_post_slug((int) $target_id, $data['slugs'][$language_code]);
            update_post_meta((int) $target_id, '_codex_wpml_forms_store_repaired', date('c'));

            $menu_item_ids = $wpdb->get_col($wpdb->prepare(
                "SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = '_menu_item_object_id' AND meta_value = %s",
                (string) $target_id
            ));
            foreach ($menu_item_ids as $menu_item_id) {
                $wpdb->update($wpdb->posts, array('post_title' => $data['titles'][$language_code]), array('ID' => (int) $menu_item_id));
            }
        }
    }
}

if ($apply) {
    $backup_file = grfs_backup_tables();
    grfs_log('Backup written: ' . $backup_file);
    grfs_log('Updating Custom Contact Forms labels/options');
    grfs_update_forms_plugin_text();
    grfs_log('Updating new-language form pages and contact menu labels');
    grfs_update_new_language_pages();
    if (function_exists('flush_rewrite_rules')) {
        flush_rewrite_rules(false);
    }
    if (function_exists('wp_cache_flush')) {
        wp_cache_flush();
    }
    grfs_log('Done. Delete this forms/store repair file from the server now.');
    exit;
}

echo "Custom Contact Forms tables:\n";
$all_tables = $wpdb->get_col('SHOW TABLES');
$tables = array();
foreach ($all_tables as $table_name) {
    if (stripos($table_name, 'custom') !== false || stripos($table_name, 'ccf') !== false) {
        $tables[] = $table_name;
    }
}
foreach ($tables as $table) {
    echo $table . "\n";
    $columns = $wpdb->get_results("DESCRIBE $table", ARRAY_A);
    foreach ($columns as $column) {
        echo '  ' . $column['Field'] . ' ' . $column['Type'] . "\n";
    }
}

echo "\nForm page translations:\n";
foreach ($form_source_ids as $source_id) {
    $source = get_post($source_id);
    if (!$source) {
        continue;
    }
    $trid = grfs_get_trid('post_page', $source_id);
    echo 'source=' . $source_id . ' trid=' . $trid . ' slug=' . $source->post_name . ' title=' . $source->post_title . "\n";
    foreach ($languages as $language_code) {
        $translation_id = grfs_translation_element_id('post_page', (int) $trid, $language_code);
        if (!$translation_id) {
            echo '  ' . $language_code . " missing\n";
            continue;
        }
        $post = get_post($translation_id);
        echo '  ' . $language_code . ' id=' . $translation_id . ' slug=' . $post->post_name . ' raw_chars=' . strlen($post->post_content) . ' text=' . substr(grfs_plain($post->post_content), 0, 220) . "\n";
    }
}

echo "\nCCF data samples:\n";
foreach ($tables as $table) {
    $rows = $wpdb->get_results("SELECT * FROM $table LIMIT 20", ARRAY_A);
    echo "TABLE $table\n";
    foreach ($rows as $row) {
        $parts = array();
        foreach ($row as $key => $value) {
            if (is_string($value)) {
                $value = preg_replace('/\s+/', ' ', $value);
            }
            $parts[] = $key . '=' . substr((string) $value, 0, 160);
        }
        echo implode(' | ', $parts) . "\n";
    }
}

echo "\nDone.\n";

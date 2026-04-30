<?php
/*
 * One-time guarded contacts/footer update for www.g-rgabriellaromeo.it.
 *
 * Upload to:
 * /www.g-rgabriellaromeo.it/wordpress/codex-contact-footer-instagram-20260427.php
 *
 * Dry run:
 * https://www.g-rgabriellaromeo.it/wordpress/codex-contact-footer-instagram-20260427.php?token=3dfcac5d9ac892ad0b05eea9dc3cf0106ea1
 *
 * Apply:
 * https://www.g-rgabriellaromeo.it/wordpress/codex-contact-footer-instagram-20260427.php?token=3dfcac5d9ac892ad0b05eea9dc3cf0106ea1&apply=1
 *
 * Rollback page content:
 * https://www.g-rgabriellaromeo.it/wordpress/codex-contact-footer-instagram-20260427.php?token=3dfcac5d9ac892ad0b05eea9dc3cf0106ea1&rollback=1
 */

$expected_token = '3dfcac5d9ac892ad0b05eea9dc3cf0106ea1';
$provided_token = isset($_GET['token']) ? $_GET['token'] : '';

if (!function_exists('hash_equals')) {
	function hash_equals($known_string, $user_string) {
		if (!is_string($known_string) || !is_string($user_string)) {
			return false;
		}
		if (strlen($known_string) !== strlen($user_string)) {
			return false;
		}
		$result = 0;
		for ($i = 0; $i < strlen($known_string); $i++) {
			$result |= ord($known_string[$i]) ^ ord($user_string[$i]);
		}
		return $result === 0;
	}
}

if (!hash_equals($expected_token, $provided_token)) {
	header('HTTP/1.1 403 Forbidden');
	echo "Forbidden\n";
	exit;
}

require_once dirname(__FILE__) . '/wp-load.php';

header('Content-Type: text/plain; charset=utf-8');

global $wpdb;

$backup_key = 'codex_contact_footer_instagram_backup_20260427';
$source_contact_page_id = 15;
$apply = isset($_GET['apply']) && $_GET['apply'] == '1';
$rollback = isset($_GET['rollback']) && $_GET['rollback'] == '1';

function codex_table_exists_20260427($table_name) {
	global $wpdb;
	$found = $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $table_name));
	return $found === $table_name;
}

function codex_contact_page_ids_20260427($source_page_id) {
	global $wpdb;
	$ids = array((int) $source_page_id);
	$translations_table = $wpdb->prefix . 'icl_translations';

	if (codex_table_exists_20260427($translations_table)) {
		$trid = $wpdb->get_var($wpdb->prepare(
			"SELECT trid FROM $translations_table WHERE element_type = %s AND element_id = %d LIMIT 1",
			'post_page',
			$source_page_id
		));

		if ($trid) {
			$translated_ids = $wpdb->get_col($wpdb->prepare(
				"SELECT element_id FROM $translations_table WHERE element_type = %s AND trid = %d",
				'post_page',
				$trid
			));
			foreach ($translated_ids as $translated_id) {
				$ids[] = (int) $translated_id;
			}
		}
	}

	$ids = array_values(array_unique(array_filter($ids)));
	sort($ids);
	return $ids;
}

function codex_page_language_20260427($page_id) {
	global $wpdb;
	$translations_table = $wpdb->prefix . 'icl_translations';
	if (!codex_table_exists_20260427($translations_table)) {
		return 'it';
	}

	$lang = $wpdb->get_var($wpdb->prepare(
		"SELECT language_code FROM $translations_table WHERE element_type = %s AND element_id = %d LIMIT 1",
		'post_page',
		$page_id
	));

	return $lang ? $lang : 'it';
}

function codex_contact_slug_20260427($language_code) {
	$slugs = array(
		'it' => 'contatti',
		'en' => 'contact-us',
		'ar' => '%d8%a7%d8%aa%d8%b5%d9%84-%d8%a8%d9%86%d8%a7',
		'de' => 'kontakt',
		'es' => 'contacto',
		'zh-hans' => 'contact-zh-hans',
		'ja' => 'contact-ja',
	);

	return isset($slugs[$language_code]) ? $slugs[$language_code] : '';
}

function codex_updated_contact_content_20260427($content, $language_code) {
	if ($language_code === 'en') {
		return '<p><a href="mailto:info@g-rgabriellaromeo.it" target="_blank">info@g-rgabriellaromeo.it</a></p>' . "\n"
			. '<p><a href="mailto:vendite@g-rgabriellaromeo.it" target="_blank">vendite@g-rgabriellaromeo.it</a></p>' . "\n"
			. '<p><a href="tel:%2B393429506938" target="_blank">+393429506938</a></p>' . "\n"
			. '<p>&nbsp;</p>' . "\n"
			. '<p>The trade mark <strong>g-r gabriella romeo</strong> and the collections on this web site are the exclusive property of Gabriella Romeo.</p>' . "\n"
			. '<p>All models and the trade mark are protected by international patent and copyright.</p>';
	}

	return '<p><a href="mailto:info@g-rgabriellaromeo.it" target="_blank">info@g-rgabriellaromeo.it</a></p>' . "\n"
		. '<p><a href="mailto:vendite@g-rgabriellaromeo.it" target="_blank">vendite@g-rgabriellaromeo.it</a></p>' . "\n"
		. '<p><a href="tel:%2B393429506938" target="_blank">+393429506938</a></p>' . "\n"
		. '<p>&nbsp;</p>' . "\n"
		. '<p>Il marchio <strong>g-r gabriellaromeo</strong> e le collezioni in questo sito sono proprieta&#039; esclusiva di Gabriella Romeo.</p>' . "\n"
		. '<p>Tutte le collezioni ed Il marchio di fabbrica sono protetti da brevetto e copyright internazionale.</p>';
}

function codex_write_backup_file_20260427($backup) {
	$uploads = wp_upload_dir();
	if (!empty($uploads['error'])) {
		return 'upload_dir_error: ' . $uploads['error'];
	}

	$dir = trailingslashit($uploads['basedir']) . 'codex-contact-footer-instagram-backups';
	if (!is_dir($dir)) {
		wp_mkdir_p($dir);
	}

	$file = trailingslashit($dir) . 'contact-footer-instagram-before-' . date('Ymd-His') . '.json';
	$written = file_put_contents($file, json_encode($backup));
	return $written === false ? 'backup_write_failed' : $file;
}

$page_ids = codex_contact_page_ids_20260427($source_contact_page_id);

if ($rollback) {
	$backup = get_option($backup_key);
	if (!$backup || empty($backup['pages'])) {
		echo "No rollback backup found in option: $backup_key\n";
		exit;
	}

	foreach ($backup['pages'] as $page_backup) {
		$result = wp_update_post(array(
			'ID' => (int) $page_backup['ID'],
			'post_content' => $page_backup['post_content'],
		), true);
		if (is_wp_error($result)) {
			echo 'ROLLBACK_ERROR page=' . (int) $page_backup['ID'] . ' ' . $result->get_error_message() . "\n";
		} else {
			echo 'ROLLBACK_OK page=' . (int) $page_backup['ID'] . "\n";
		}
	}
	exit;
}

$backup = array(
	'timestamp' => date('c'),
	'pages' => array(),
);

$planned_changes = 0;

foreach ($page_ids as $page_id) {
	$post = get_post($page_id);
	if (!$post || $post->post_type !== 'page') {
		continue;
	}

	$lang = codex_page_language_20260427($page_id);
	$slug = codex_contact_slug_20260427($lang);
	$new_content = codex_updated_contact_content_20260427($post->post_content, $lang);
	$changed = ($new_content !== $post->post_content);
	$slug_changed = ($slug !== '' && $slug !== $post->post_name);

	$backup['pages'][] = array(
		'ID' => (int) $page_id,
		'language' => $lang,
		'post_title' => $post->post_title,
		'post_name' => $post->post_name,
		'post_content' => $post->post_content,
	);

	echo (($changed || $slug_changed) ? 'CHANGE' : 'UNCHANGED') . ' page=' . (int) $page_id . ' lang=' . $lang . ' slug=' . $post->post_name . ' target_slug=' . $slug . ' title=' . $post->post_title . "\n";

	if ($changed || $slug_changed) {
		$planned_changes++;
	}

	if ($apply && ($changed || $slug_changed)) {
		$update = array('post_content' => $new_content);
		$formats = array('%s');
		if ($slug !== '') {
			$update['post_name'] = $slug;
			$formats[] = '%s';
		}

		$result = $wpdb->update($wpdb->posts, $update, array('ID' => (int) $page_id), $formats, array('%d'));
		if ($result === false) {
			echo 'APPLY_ERROR page=' . (int) $page_id . ' ' . $wpdb->last_error . "\n";
		} else {
			clean_post_cache((int) $page_id);
			echo 'APPLY_OK page=' . (int) $page_id . "\n";
		}
	}
}

echo 'planned_changes=' . $planned_changes . "\n";

if ($apply) {
	if (!get_option($backup_key)) {
		add_option($backup_key, $backup, '', 'no');
		echo 'rollback_option=' . $backup_key . "\n";
	} else {
		echo 'rollback_option_already_exists=' . $backup_key . "\n";
	}

	echo 'backup_file=' . codex_write_backup_file_20260427($backup) . "\n";
	echo "Delete this script from the server after verification.\n";
} else {
	echo "Dry run only. Add &apply=1 to write changes.\n";
}

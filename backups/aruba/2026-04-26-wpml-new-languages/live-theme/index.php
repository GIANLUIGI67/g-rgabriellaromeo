<?php
/* First 2 if statements are for demo purposes. 
   If you found this lines you can remove them on your live server.
*/
global $wp_query;
$args = array_merge( $wp_query->query, array( 'paged' => get_query_var('paged') ) );
query_posts( $args );

if ( is_numeric($t = get_option('page_for_posts')) ) { $template_pid = $t; }

if ( $_GET['style'] == 'classic' ) {
	require_once(TEMPLATEPATH . '/index_classic.php');
}
else if ( $_GET['style'] == 'masonry') {
	require_once(TEMPLATEPATH . '/index_masonry.php');
}

else if ( get_option('wpb_blog_layout') == __("Classic", "wpb") ) {
	require_once(TEMPLATEPATH . '/index_classic.php');
}
else {
	require_once(TEMPLATEPATH . '/index_masonry.php');
}
?>
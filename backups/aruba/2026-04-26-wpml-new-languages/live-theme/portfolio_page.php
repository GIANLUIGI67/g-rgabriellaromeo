<?php
/*
Template Name: Portfolio page
*/
?>
<?php
$template_pid = $post->ID;
$args = array(
	'post_type' => 'wpb_portfolio',
	'paged' => ( get_query_var('paged') > 0 ) ? get_query_var('paged') : get_query_var('page')
);

query_posts( $args );

require_once(TEMPLATEPATH . '/archive-wpb_portfolio.php');

?>
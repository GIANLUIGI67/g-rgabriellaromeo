<?php
if ( post_password_required() ) {
	require_once(TEMPLATEPATH . '/password_protected_page.php');
	die();
}
?>
<?php get_header(); ?>

<?php if ( have_posts() ) : ?>
<?php while ( have_posts() ) : the_post(); ?>
<div id="page-<?php the_ID(); ?>" <?php post_class("single_page single_page_without_column"); ?>>
	<?php
	$hide_title = get_post_meta($post->ID, "_hide_title", true);
	if ( $hide_title != 'no' ) :	?><h1 class="page_title title"><?php the_title(); ?></h1><?php endif; ?>
	<div class="black_bg">
		<div class="page_content">
			<?php
			$p_caption = make_clickable(get_post_meta($post->ID, "_p_caption", true));
			if ( $p_caption != '' ) : ?> <h3 class="p_caption"><?php echo $p_caption; ?></h3> <?php endif; ?>
				        
	        <?php the_content(''); ?>
	    </div> <!-- end .page_content -->
	    
	    <?php edit_post_link(__('Edit this entry', "wpb"), '<div class="post_edit">', '</div>'); ?>
	    <div class="clear"></div>
	    
	   <!-- <?php comments_template(); ?>-->
    </div>
</div>
<?php endwhile; ?>
<?php endif; ?>

<?php get_footer(); ?>
<?php
if ( post_password_required() ) {
	require_once(TEMPLATEPATH . '/password_protected_page.php');
	die();
}
?>
<?php get_header(); ?>
<h1 class="post_title title"><?php the_title(); ?></h1>
<div class="blog_container">
	<?php if ( have_posts() ) : ?>
	<?php while ( have_posts() ) : the_post(); ?>
	<?php
		$has_thumbnail = '';
		
		$video_w = $th_w = 469;
		$video_h = 264;
		$th_h = POST_SINGLE_TH_H;
		
		$p_video = get_post_meta($post->ID, "_p_video", true);
		
		$hide_image = get_post_meta($post->ID, "_hide_image", true);
	
		if ( has_post_thumbnail() == false ) { $has_thumbnail = ' no_thumbnail'; }
	?>
	<div id="post-<?php the_ID(); ?>" <?php post_class("two-third single_post".$has_thumbnail); ?>>
		<?php
		$youtube = strpos($p_video, 'youtube.com');
		$vimeo = strpos($p_video, 'vimeo');
		if ( $youtube || $vimeo ) : ?>
		<div class="p_video">
		<?php
			if ( $youtube ) {
				preg_match('/[\\?\\&]v=([^\\?\\&]+)/', $p_video, $matches);
				echo '<iframe width="'.$video_w.'" height="'.$video_h.'" src="http://www.youtube.com/embed/'.$matches[1].'" frameborder="0" allowfullscreen></iframe>';
			}
			else if ( $vimeo ) {
				preg_match('#vimeo.com/([A-Za-z0-9\-_]+)?#s', $p_video, $matches);
				echo '<iframe src="http://player.vimeo.com/video/'.$matches[1].'?title=0&amp;byline=0&amp;portrait=0" width="'.$video_w.'" height="'.$video_h.'" frameborder="0" webkitAllowFullScreen allowFullScreen></iframe>';
			}
		?>
		</div>
		<?php endif; ?>
		
    	<?php if ( $has_thumbnail == '' && $hide_image != 'no' && $youtube == false && $vimeo == false) :
		$th_id = get_post_thumbnail_id();
		if ( $th_h == 'proportional' ) {
			$image_src = wp_get_attachment_image_src( $th_id, 'full' );
			$th_h = round($th_w/$image_src[1] * $image_src[2]);
		} else if ( is_numeric($th_h) ) {
			//if numeric, don't do anything special.
		}
		else {
			$th_h = 250;
		}
		//$th_h = round($video_w/$image_src[1] * $image_src[2]);
		//$th_h = 250;
		
		$image = wpb_resize( $th_id, '', $video_w, $th_h, true );
		if ($image['url']) : ?><img class="post_img" src="<?php echo $image['url']; ?>" alt="" /><?php endif; ?>
		<?php endif; ?>
		
		<div class="post_content">			
			<!--<div class="post_info">
				<span class="light"><?php _e("Posted by", "wpb"); ?></span> <?php the_author(); ?> <span class="light"><?php _e("in", "wpb"); ?></span> <?php wpb_posted_under(); ?> <span class="date"><span class="light"><?php _e("on ", "wpb"); ?></span><?php the_time('F j, Y'); ?></span>
			</div>-->
	        
	        <?php the_content(''); ?>
	    </div> <!-- end .post_content -->
	    
	    <?php if ( $tags = wpb_tags(array("separator" => '', 'echo' => false)) ) : ?>
		<div class="tags"><?php echo $tags; ?></div>
	    <?php endif; ?>
	    
	    <div class="clear"></div>
	    
	    <?php edit_post_link(__('Edit this entry', "wpb"), '<div class="post_edit">', '</div>'); ?>
	    
	    <!--<?php comments_template(); ?>-->
	</div>
	<?php endwhile; ?>
	<?php endif; ?>
	
	<div class="one-third last sidebar sidebar_right">
		<?php
			if ( is_active_sidebar("single-post") ) { dynamic_sidebar('single-post'); }
			else if ( is_active_sidebar("posts") ) { dynamic_sidebar('posts'); }
			else { dynamic_sidebar('default'); }
		?>
	</div> <!-- end sidebar_right -->
	
	<div class="clear"></div>
</div> <!-- end .container_12 -->

<?php get_footer(); ?>
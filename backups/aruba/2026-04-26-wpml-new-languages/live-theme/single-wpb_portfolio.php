<?php
/* Show password page if password is set
---------------------------------------------------------- */
if ( post_password_required() ) {
	require_once(TEMPLATEPATH . '/password_protected_page.php');
	die();
}

$def_single_layout = ( $dsl = get_option('wpb_portfolio_single_layout') ) ? $dsl : __("Carousel", "wpb");
$single_layout = ( $sl = get_post_meta($post->ID, "_p_layout", true) ) ? $sl : $def_single_layout;
$single_layout = ( $single_layout == 'default' ) ? $def_single_layout : $single_layout;

$layout = 'carousel';

if ( $single_layout == __("Fullscreen slideshow", "wpb") || $single_layout == 'fullscreen_slideshow' ) {
	$layout = 'fullscreen_slideshow';
}
else if ( $single_layout == __("Thumbnail gallery", "wpb") || $single_layout == 'thumbnail_gallery' ) {
	$layout = 'thumbnail_gallery';
}
else if ( $single_layout == __("Carousel", "wpb") || $single_layout == 'carousel' ) {
	$layout = 'carousel';
}
else if ( $single_layout == __("Attached images", "wpb") || $single_layout == 'attached_images' ) {
	$layout = 'attached_images';
}

/* Fullscreen slideshow
---------------------------------------------------------- */
if ( $_GET['ss'] == 'true' || $layout == 'fullscreen_slideshow' ) {
	require_once(TEMPLATEPATH . '/fullscreen_slideshow.php');
	die();
}

$th_w = 743;
$th_h = 558;

?>
<?php get_header(); ?>

<?php if (have_posts()) : ?>
	<?php while (have_posts()) : the_post(); ?>
	<?php
	$p_video = get_post_meta($post->ID, "_p_video", true);
			
	$youtube = strpos($p_video, 'youtube.com');
	$vimeo = strpos($p_video, 'vimeo');
	
	$attached_images = get_post_meta($post->ID, "_attached_images", true);
	if ($attached_images == '' && $youtube == false && $vimeo == false ) {
		$extra_space = ' no_images_and_video';
	}
	?>
	<div id="float_controls">
		<a id="start_slideshow" class="tooltip<?php echo $extra_space; ?>" title="<?php _e("Start fullscreen slideshow", "wpb"); ?>" href="<?php if ( get_option('permalink_structure') != '' ) { echo '?ss=true'; } else { echo '&ss=true'; } ?>"></a>
		<?php next_prev_links(); ?>
	</div>
<div class="black_bg">
	<div id="post-<?php the_ID(); ?>" <?php post_class($layout."_holder".$extra_space); ?>>
		<?php
		$video_w = $th_w;
		$video_h = 435;
		/*$p_video = get_post_meta($post->ID, "_p_video", true);
		
		$youtube = strpos($p_video, 'youtube.com');
		$vimeo = strpos($p_video, 'vimeo');*/
		
		if ( $youtube || $vimeo ) : ?>
		<div class="p_video full-width last">
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
	
		<?php if ( $youtube == false && $vimeo == false ) : ?>
		<?php
		//$attached_images = get_post_meta($post->ID, "_attached_images", true);
		$attached_images = explode(",", $attached_images);
		if ( $attached_images && $attached_images[0] != '') :
		
			/*
			If layout is thumbnail carousel
			*/
			if ( $layout == 'carousel' ) : ?>
			<div class="full-width last portfolio_images attached_carousel wpb_gallery">
				<div class="wpb_gallery_slides wpb_slider_fading">
			<?php
				$img_count = count($attached_images);
				$i = 0;
				foreach ( $attached_images as $th_id ) :
					$i++;
					$image_src = wp_get_attachment_image_src( $th_id, 'full' );
					
					//$th_w = 167;
					//$th_h = 111;
					
					$image = wpb_resize( $th_id, '', $th_w, $th_h, true );
					
					if ($image['url']) :
						$cap = '';
						if ( IMG_CAPTIONS ) {
							//$cap = '<span class="img_caption">Caption</span>';
							$img_title = get_the_title($th_id);
							if ( strpos($image_src[0], $img_title) == false ) {
								$cap = '<span class="img_caption">'.$img_title.'</span>';
							}
						}
					?>
					<a class="prettyPhoto" rel="gallery[<?php echo $post->ID; ?>]" href="<?php echo $image_src[0]; ?>"><img<?php if ( $i == $img_count ) { echo ' class="no_bottom_margin"'; } ?> src="<?php echo $image['url']; ?>" width="<?php echo $image['width']; ?>" height="<?php echo $image['height']; ?>" alt="" /><?php echo $cap; ?></a>
					<?php
					endif;
				endforeach;
				unset($i);
				?>
				</div>
			</div> <!-- end portfolio_images -->
			<div class="clear"></div>
			<?php
			/*
			If layout is Attached images
			*/
			?>
			<?php elseif ( $layout == 'attached_images' ) : ?>
			<div class="full-width last portfolio_images attached_attached_images">
			<?php
				$img_count = count($attached_images);
				$i = 0;
				foreach ( $attached_images as $th_id ) :
					$i++;
					$image_src = wp_get_attachment_image_src( $th_id, 'full' );				
					$th_h = round($th_w/$image_src[1] * $image_src[2]);
					
					$image = wpb_resize( $th_id, '', $th_w, $th_h, true );
					
					if ($image['url']) :
						$cap = '';
						if ( IMG_CAPTIONS ) {
							//$cap = '<span class="img_caption">Caption</span>';
							$img_title = get_the_title($th_id);
							if ( strpos($image_src[0], $img_title) == false ) {
								$cap = '<span class="img_caption">'.$img_title.'</span>';
							}
						}
					?>
					<a class="prettyPhoto<?php if ( $i == $img_count ) { echo ' last_attached_image'; } ?>" rel="gallery[<?php echo $post->ID; ?>]" href="<?php echo $image_src[0]; ?>"><img<?php if ( $i == $img_count && $cap == '') { echo ' class="no_bottom_margin"'; } ?> src="<?php echo $image['url']; ?>" width="<?php echo $image['width']; ?>" height="<?php echo $image['height']; ?>" alt="" /><?php echo $cap; ?></a>
					<?php
					endif;
				endforeach;
				unset($i);
				?>
				<div class="clear"></div>
			</div> <!-- end portfolio_images -->
			<?php endif; ?>
			
		<?php 
		endif;
		
		/*
		$th_id = get_post_thumbnail_id();
		$image_src = wp_get_attachment_image_src( $th_id, 'full' );
		$th_h = round($th_w/$image_src[1] * $image_src[2]);
		
		$image = wpb_resize( $th_id, '', $th_w, $th_h, true );
			if ($image['url']) : ?>
			<div class="full-width last portfolio_images">
				<img class="post_teaser_img" src="<?php echo $image['url']; ?>" width="<?php echo $image['width']; ?>" height="<?php echo $image['height']; ?>" alt="" />
			</div>
			<?php endif; ?>
		*/
		?>
		<?php endif; ?>
		
		<!-- sosituito <div class="column one-fourth">-->
<div class="column full-width">
			<h2 class="post_title"><?php the_title(); ?></h2>
			<?php
			$cat = wpb_posted_under( array('taxonomy' => 'portfolio_category', 'separator' => ' ', 'echo' => false) );
			if ( $cat ) : ?>
			<div class="portfolio_categories"><?php _e('Categories: ', 'wpb'); echo $cat; ?></div>
			<?php endif; ?>
		</div>
		<!-- sosituito <div class="column three-fourth last"> -->
 <div class="column full-width">
			<?php the_content(''); ?>
			
		    <?php edit_post_link(__('Edit this entry', "wpb"), '<div class="post_edit">', '</div>'); ?>
		</div>
		
		<?php
		/*
		If layout is thumbnail gallery
		*/
		?>
		<?php if ( $attached_images && $layout == 'thumbnail_gallery' ) : ?>
		<div class="full-width last portfolio_images attached_thumbnail_gallery">
			<h2><?php _e("Images", "wpb"); ?></h2>
		<?php
			$img_count = count($attached_images);
			$i = 0;
			foreach ( $attached_images as $th_id ) :
				$i++;
				$image_src = wp_get_attachment_image_src( $th_id, 'full' );
				
				$th_w = 167;
				$th_h = 111;
				
				$image = wpb_resize( $th_id, '', $th_w, $th_h, true );
				
				if ($image['url']) :
					$cap = '';
					if ( IMG_CAPTIONS ) {
						$img_title = get_the_title($th_id);
						if ( strpos($image_src[0], $img_title) == false ) {
							$cap = $img_title;
						}
					}
				?>
				<a class="prettyPhoto" title="<?php echo $cap; ?>" rel="gallery[<?php echo $post->ID; ?>]" href="<?php echo $image_src[0]; ?>"><img<?php if ( $i%4 == 0 ) { echo ' class="last"'; } ?> src="<?php echo $image['url']; ?>" width="<?php echo $image['width']; ?>" height="<?php echo $image['height']; ?>" alt="" /></a>
				<?php
				endif;
			endforeach;
			unset($i);
			?>
			<div class="clear"></div>
		</div> <!-- end portfolio_images -->
		<?php endif; ?>
		
		<div class="clear"></div>
	</div>
	
	<div class="bottom_portfolio_selection column full-width last">
		<!-- <h2><?php _e("... e il viaggio continua", "wpb"); ?></h2>-->
<h2>
<?php
if (ICL_LANGUAGE_CODE == 'it') {
echo '… e il viaggio continua';
} elseif (ICL_LANGUAGE_CODE == 'en') {
echo '… and the journey continues';
}
elseif (ICL_LANGUAGE_CODE == 'ar') {
echo '… وتستمر الرحلة';
}
elseif (ICL_LANGUAGE_CODE == 'fr') {
echo '… le voyage continu';
}
elseif (ICL_LANGUAGE_CODE == 'de') {
echo '… und die Reise geht weiter';
}
elseif (ICL_LANGUAGE_CODE == 'es') {
echo '… y el viaje continúa';
}
elseif (ICL_LANGUAGE_CODE == 'zh-hans') {
echo '… 旅程继续';
}
elseif (ICL_LANGUAGE_CODE == 'ja') {
echo '… 旅は続きます';
}
?></h2>


		<?php echo do_shortcode('[vc_teaser_grid grid_columns_count="4" grid_teasers_count="8" grid_content="teaser" grid_layout="thumbnail_title" grid_link="link_post" grid_template="carousel" grid_thumb_size="167x100" grid_posttypes="wpb_portfolio" width="1/1" last="last"] '); ?>
	</div>
	<div class="clear"></div>
	
	<!--<?php comments_template(); ?>-->
</div>
	<?php endwhile; ?>
<?php endif; ?>

<div class="clear"></div>

<?php get_footer(); ?>

<?php

$def_teaser_width = ( $dtw = get_option('wpb_portfolio_teaser_width') ) ? $dtw : 'two-third';
$show_excerpt = ( $excerpt = get_option('wpb_portfolio_excerpt') ) ? $excerpt : __('Show', 'wpb');
$link_type = ( $link = get_option('wpb_portfolio_link') ) ? $link : __('Link to the post', 'wpb');

$gallery_style = 'masonry';

if ( $title = single_cat_title('', false) ) {
	//Show category title
} else {
	$title = get_option('wpb_portfolio_title');
}

$holder_class = 'masonry_blocks';

?>
<?php get_header(); ?>

<div class="float_blocks_container">
	<h1 class="title portfolio_archive_title"><?php echo $title; ?></h1>
	<?php
$cat_filter = wpb_category_filter();
echo $cat_filter['links'];
?>
	<div class="<?php echo $holder_class; ?>">
    	<?php if (have_posts()) :
    	$teasers_count = 0;
    	?>
		<?php while (have_posts()) : the_post(); ?>
		<?php
		$p_cats = '';
		if ( $cat_filter['categories_slugs_array'][$post->ID] != NULL ) {
			foreach ( $cat_filter['categories_slugs_array'][$post->ID] as $ca ) {
				$p_cats .= ' sortable-'.$ca;
			}
			$p_cats = ' wpb_sortable ' . $p_cats . ' ';
		}
		
		$teasers_count++;
		$teaser_width = ( $tw = get_post_meta($post->ID, "_teaser_width", true) ) ? $tw : $def_teaser_width;
		$teaser_width = ( $teaser_width == 'default' ) ? $def_teaser_width : $teaser_width;
		//$teaser_width = ($teaser_w = get_post_meta($post->ID, "_teaser_width", true)) ? ' '.$teaser_w : ' one-half';
		if ( $teaser_width == 'one-third' ) {
			$teaser_width = 'one-third';
			$th_w = 227;
			$th_h = 128;
		}
		else if ( $teaser_width == 'two-third' ) {
			$teaser_width = 'two-third';
			$th_w = 469;
			$th_h = 264;
		}
		else if ( $teaser_width == 'full-width' ) {
			$th_w = 713;
			$th_h = 401;
		}
		
		$content_type = (get_option('wpb_full_content') == 'true') ? ' full_content_in_blog' : '';
		$has_thumbnail = '';
		if (has_post_thumbnail() == false) { $has_thumbnail = ' no_thumbnail'; }
		?>
		<div id="post-<?php the_ID(); ?>" <?php post_class("post_teaser float_block ".$teaser_width.$has_thumbnail.$p_cats.$content_type); ?>>
			<?php
			$video_w = $th_w;
			$video_h = $th_h;
			$p_video = get_post_meta($post->ID, "_p_video", true);
			
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
		
        	<?php if ( $has_thumbnail == '' && $youtube == false && $vimeo == false ) :
        		$th_id = get_post_thumbnail_id();
    			$image_src = wp_get_attachment_image_src( $th_id, 'full' );
    		
        		if ( $link_type == __('Open image in lightbox', 'wpb') ) {
        			$post_link = $image_src[0];
        			$post_class = 'prettyPhoto';
        		} else {
        			$post_link = get_permalink();
        			$post_class = '';
        		}
        	?>
    		<a class="teaser_img_link <?php echo $post_class; ?>" href="<?php echo $post_link; ?>" title="<?php the_title_attribute(); ?>">
    		<?php
    		
    		$th_h = round($th_w/$image_src[1] * $image_src[2]);
    		
			$image = wpb_resize( $th_id, '', $th_w, $th_h, true );
			if ($image['url']) : ?>
			<img class="post_teaser_img" src="<?php echo $image['url']; ?>" alt="" />
			<?php endif; ?>
    		</a>
    		<?php endif; ?>
    		
    		<div class="teaser_content">
        		<h2 class="post_title"><a href="<?php the_permalink(); ?>" title="<?php the_title_attribute(); ?>"><?php the_title(); ?></a></h2>
				
				<?php if ( $show_excerpt == __('Show', 'wpb') ) { the_excerpt(''); } ?>
            </div> <!-- end .teaser_content -->
        </div> <!-- end .post_teaser -->
		<?php
		endwhile;
		endif;
		?>
		<?php if ( $teasers_count > 1 && $gallery_style != 'masonry' ) : ?>
		<a id="float_prev" class="tooltip" title="<?php _e("Previous post", "wpb"); ?>"></a>
		<a id="float_next" class="tooltip" title="<?php _e("Next post", "wpb"); ?>"></a>
		<?php endif; ?>
		
		<?php if ( $gallery_style != 'masonry' ) { wpb_pagination(); } ?>
		
        <div class="clear"></div>
	</div> <!-- end main_content -->
	
	<?php
    if ( $gallery_style == 'masonry' ) {
    	echo '<div class="masonry_paginator">';
        wpb_pagination();
        echo '</div>';
	}
    ?>
    
    <div class="clear"></div>
</div> <!-- end container_12 -->

<?php get_footer(); ?>
<?php
/*
Template Name: Home slides page
*/
?>
<?php
$homeslides = true;

$args = array(
	'post_type' => 'wpb_homeslide',
	'posts_per_page' => -1
);
query_posts( $args );

get_header();
//$attached_images = '20,19';
$attached_images = array();

if (have_posts()) : ?>
<div class="home_slides">
<?php
	while (have_posts()) : the_post();
		if ( has_post_thumbnail() ) {
			$attached_images[] = get_post_thumbnail_id($post->ID);
			//var_dump(get_the_post_thumbnail($post->ID, 'large'));
			
			$slide_title = ($tt = get_post_meta($post->ID, "_h_title", true)) ? $tt : the_title("", "", false);
			$slide_title = preg_split ('/$\R?^/m', $slide_title);
			$slide_title = implode("</span> <br /> <span>", $slide_title);
			
			$more_button = '';
			$more_title = ($mt = get_post_meta($post->ID, "_h_href_title", true)) ? $mt : __('Read more');				
			$more_href = ($mu = get_post_meta($post->ID, "_h_href", true)) ? $mu : '#';
			
			if ( $more_href != '#' ) {
				$more_button = '<a class="more_button" href="'.$more_href.'" title="">'. $more_title .'</a>';
			}
			?>
			<div class="home_slide">
				<h2><?php echo $slide_title; ?></h2>
				<?php echo $more_button; ?>
			</div>
		<?php
		}
	endwhile;
	$attached_images = implode(",", $attached_images);
?>
</div> <!-- end .home_slides -->
<?php
endif;

if ( $attached_images != '' ) :
	$fit_always = ( get_option('wpb_slideshow_resizing') == 'true') ? 'true' : 'false';
	$ss_interval = ( $ssint = get_option('wpb_slideshow_interval') ) ? $ssint : 5;
	$ss_speed = ( $sssp = get_option('wpb_slideshow_speed') ) ? $sssp : 0.7;
	$ssfx = ( $fx = get_option('wpb_slideshow_fx') ) ? $fx : __("Slide Right", "wpb");
	switch ($ssfx) {
		case __('Fade', 'wpb') :
			$ssfx = 1;
		break;
		
		case __('Slide Top', 'wpb') :
			$ssfx = 2;
		break;
			
		case __('Slide Right', 'wpb') :
			$ssfx = 3;
		break;
			
		case __('Slide Bottom', 'wpb') :
			$ssfx = 4;
		break;
			
		case __('Slide Left', 'wpb') :
			$ssfx = 5;
		break;
			
		case __('Carousel Right', 'wpb') :
			$ssfx = 6;
		break;
			
		case __('Carousel Left', 'wpb') :
			$ssfx = 7;
			
		break;
	}
?>
<div id="bg_pattern"></div>
<script type="text/javascript">
jQuery(function($){
	
	$.supersized({
	
		// Functionality
		autoplay				:	true,
		keyboard_nav			:	false,
		slide_interval          :   <?php echo $ss_interval; ?>*1000,		// Length between transitions
		transition              :   <?php echo $ssfx; ?>,		// 0-None, 1-Fade, 2-Slide Top, 3-Slide Right, 4-Slide Bottom, 5-Slide Left, 6-Carousel Right, 7-Carousel Left
		transition_speed		:	<?php echo $ss_speed*1000; ?>,		// 700 Speed of transition
		fit_always				: 	<?php echo $fit_always; ?>,
												   
		// Components							
		slide_links				:	'blank',	// Individual links for each slide (Options: false, 'num', 'name', 'blank')
		slides 					:  	[			// Slideshow Images
<?php
											$attached_images = explode(",", $attached_images);
											if ( $attached_images ) :
												$imgArr = Array();
												foreach ( $attached_images as $th_id ) :
													$image_src = wp_get_attachment_image_src( $th_id, 'full' );
													$th_h = 100;
													$th_w = round($th_h/$image_src[2] * $image_src[1]);
													$image_thumb = wpb_resize( $th_id, '', $th_w, $th_h, true );
													
													$imgArr[] = "{image : '".$image_src[0]."'}\n";
												endforeach;
												$imgArr = implode($imgArr, ',');
												echo $imgArr;
											endif;
											?>
									]
		
	});
});
</script>
<?php
endif;

get_footer();
?>
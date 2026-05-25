package com.grgabriellaromeo.app.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.grgabriellaromeo.app.R
import com.grgabriellaromeo.app.ui.theme.Michroma

@Composable
fun BrandScreen(lang: String) {
    Box(modifier = Modifier.fillMaxSize()) {
        Image(
            painter = painterResource(id = R.drawable.brand_carretti),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
        )
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color.Black.copy(alpha = 0.68f),
                            Color.Black.copy(alpha = 0.34f)
                        )
                    )
                )
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp)
                .padding(top = 88.dp, bottom = 34.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = brandText(lang),
                color = Color.White,
                fontFamily = Michroma,
                fontSize = 15.sp,
                lineHeight = 23.sp,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(12.dp))

            Image(
                painter = painterResource(id = R.drawable.brand_signature),
                contentDescription = null,
                contentScale = ContentScale.Fit,
                modifier = Modifier
                    .fillMaxWidth(0.62f)
                    .heightIn(max = 150.dp)
            )
        }
    }
}

private fun brandText(lang: String): String = when (lang) {
    "en" -> """
        Gabriella Romeo was born in Catania, cradle of myths and Mediterranean light, where the sun kisses the sea and history intertwines with magic. Each creation is a unique piece, handmade with love and dedication - a magical fusion of art and heart.

        The brand celebrates a rare, authentic and powerful femininity, capable of illuminating the wearer with timeless elegance. GR Gabriella Romeo is more than fashion: it is a poetic journey between tradition and innovation, a tangible dream that captures the vibrant and magical essence of Sicily.

        This is my style.
    """.trimIndent()
    "fr" -> """
        Gabriella Romeo est nee a Catane, berceau des mythes et de la lumiere mediterraneenne, ou le soleil embrasse la mer et ou l'histoire se mele a la magie. Chaque creation est une piece unique, realisee a la main avec amour et devouement, une fusion enchanteresse d'art et de coeur.

        La marque celebre une feminite rare, authentique et puissante, capable d'illuminer celle qui la porte avec une elegance intemporelle. GR Gabriella Romeo, c'est bien plus que de la mode : c'est un voyage poetique entre tradition et innovation, un reve tangible qui capture l'essence vibrante et magique de la Sicile.

        C'est mon style.
    """.trimIndent()
    "de" -> """
        Gabriella Romeo wurde in Catania geboren, Wiege von Mythen und mediterranem Licht, wo die Sonne das Meer kuesst und sich Geschichte mit Magie vermischt. Jede Kreation ist ein Unikat, von Hand gefertigt mit Liebe und Hingabe - eine zauberhafte Verschmelzung von Kunst und Herz.

        Die Marke feiert eine seltene, authentische und kraftvolle Weiblichkeit, die ihre Traegerin mit zeitloser Eleganz erstrahlen laesst. GR Gabriella Romeo ist mehr als Mode: eine poetische Reise zwischen Tradition und Innovation, ein greifbarer Traum, der die lebendige, magische Essenz Siziliens einfaengt.

        Das ist mein Stil.
    """.trimIndent()
    "es" -> """
        Gabriella Romeo nacio en Catania, cuna de mitos y luz mediterranea, donde el sol besa el mar y la historia se entrelaza con la magia. Cada creacion es una pieza unica, hecha a mano con amor y dedicacion, una fusion encantadora de arte y corazon.

        La marca celebra una feminidad rara, autentica y poderosa, capaz de iluminar a quien la lleva con una elegancia atemporal. GR Gabriella Romeo es mucho mas que moda: es un viaje poetico entre tradicion e innovacion, un sueno tangible que captura la esencia vibrante y magica de Sicilia.

        Este es mi estilo.
    """.trimIndent()
    "ar" -> """
        ولدت علامة Gabriella Romeo في كاتانيا، مهد الاساطير والنور المتوسطي، حيث تقبل الشمس البحر وتتشابك الحكاية بالسحر. كل تصميم هو قطعة فريدة مصنوعة يدويا بحب واهتمام، ومزيج ساحر بين الفن والقلب.

        تحتفي العلامة بانوثة نادرة واصيلة وقوية، تضيء من ترتديها باناقة خالدة. GR Gabriella Romeo هي اكثر من مجرد موضة؛ انها رحلة شعرية بين التقاليد والابتكار، حلم ملموس يلتقط جوهر صقلية النابض والساحر.

        هذا هو اسلوبي.
    """.trimIndent()
    "zh" -> """
        Gabriella Romeo 诞生于卡塔尼亚，这是一个充满神话与地中海阳光的地方，阳光亲吻着大海，历史与魔法交织在一起。每件作品都是独一无二的手工制作，融合了爱与奉献，是艺术与心灵的迷人结合。

        这个品牌颂扬一种罕见、真实而强大的女性气质，使佩戴者散发出永恒的优雅。GR Gabriella Romeo 远不止于时尚：它是一场诗意的旅程，融合传统与创新，是一个捕捉西西里岛生动魔力的可触梦想。

        这就是我的风格。
    """.trimIndent()
    "ja" -> """
        Gabriella Romeo は、神話と地中海の光に満ちたカターニアで生まれました。太陽が海を照らし、歴史が魔法と交差する地です。すべての作品は、愛と献身を込めて手作業で作られたユニークな一点物であり、芸術と心の魅惑的な融合です。

        ブランドは、まれで本物、そして力強い女性らしさを称賛し、それをまとう人を時を超えた優雅さで輝かせます。GR Gabriella Romeo はファッションを超えた存在。伝統と革新の間を旅する詩的な物語であり、西シチリアの活気ある魔法の本質を捉えた、触れられる夢です。

        これが私のスタイルです。
    """.trimIndent()
    else -> """
        Gabriella Romeo nasce a Catania, culla di miti e luce mediterranea, dove il sole bacia il mare e la storia si intreccia con la magia. Ogni creazione e un pezzo unico, realizzato a mano con amore e dedizione, un'incantevole fusione di arte e cuore.

        Il brand celebra una femminilita rara, autentica e potente, capace di illuminare chi la indossa con eleganza senza tempo. GR Gabriella Romeo e molto piu di moda: e un viaggio poetico tra tradizione e innovazione, un sogno tangibile che cattura l'essenza vibrante e magica della Sicilia.

        Questo e il mio stile.
    """.trimIndent()
}

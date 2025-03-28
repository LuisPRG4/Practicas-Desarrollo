<?php include("database/connection.php"); ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <link rel="icon" href="Assets/Icons/Fav.png" type="image/png">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title> Paisajes | Programación IV </title>
    <link rel="stylesheet" href="styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playwrite+IT+Moderna:wght@100..400&display=swap" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&family=Playwrite+IT+Moderna:wght@100..400&display=swap" rel="stylesheet">
</head>
<body>
    <header>
        <div class="nav-links">
            <a href="#Main">Inicio</a> 
            <a href="#Gallery">Galería</a>
            <a href="#AboutOf">Sobre el Portafolio</a>
        </div>
        <div class="logo-titulo">
            <img src="Assets/Icons/ICON_M.png" alt="IconMountain" class="ICON">

            <div class="title">
                <h1>Explora la Belleza de los Paisajes</h1>
            </div>

        </div>
    </header>

    <section id="Main" class="section_introduction">
        <div class="title_introduction">
            <h2> Bienvenido </h2>
        </div>

        <div class="section_one_paragraph">
        <p> 
                Los paisajes han cautivado la imaginación humana desde tiempos inmemoriales,
                siendo mucho más que simples escenarios: son reflejos de la belleza que nos 
                rodea y fuentes de inspiración. 
            </p>

            <p> 
                Este portafolio es una recopilación de imágenes que capturan la majestuosidad de
                diversos paisajes. Cada una de estas fotografías ofrece un vistazo a la grandeza
                de la naturaleza, desde las imponentes montañas hasta las tranquilas orillas de lagos,
                pasando por desiertos, bosques y cascadas, cada paisaje con su propia historia que contar.
            </p>

            <p> 
                Estas imágenes buscan transmitir la emoción de contemplar estos paisajes, invitando a sentir la
                brisa, el calor del sol y el silencio profundo que solo la naturaleza puede ofrecer. Los paisajes
                no solo son imágenes, sino experiencias que nos conectan con algo más grande que nosotros mismos 
                y nos recuerdan la importancia de proteger nuestro planeta.
            </p>

            <p> 
                Te invito a explorar esta colección y descubrir la magia que se esconde en cada rincón de la naturaleza.
            </p>
        </div>

        <section id="Gallery" class="section_gallery">
        <h2> 
            Galería de Paisajes
        </h2>

        <div class="gallery-container">
            <img src="Assets/Images/Gallery/1.jpg" alt="Image 1">
            <img src="Assets/Images/Gallery/2.jpg" alt="Image 2">
            <img src="Assets/Images/Gallery/3.jpg" alt="Image 3">
            <img src="Assets/Images/Gallery/4.jpg" alt="Image 4">
            <img src="Assets/Images/Gallery/5.jpg" alt="Image 5">
            <img src="Assets/Images/Gallery/6.jpg" alt="Image 6">
            <img src="Assets/Images/Gallery/7.jpg" alt="Image 7">
            <img src="Assets/Images/Gallery/8.jpg" alt="Image 8">
            <img src="Assets/Images/Gallery/9.jpg" alt="Image 9">
            <img src="Assets/Images/Gallery/10.jpg" alt="Image 10">
            <img src="Assets/Images/Gallery/11.jpg" alt="Image 11">
            <img src="Assets/Images/Gallery/12.jpg" alt="Image 12">
            <img src="Assets/Images/Gallery/13.jpg" alt="Image 13">
            <img src="Assets/Images/Gallery/14.jpg" alt="Image 14">
            <img src="Assets/Images/Gallery/15.jpg" alt="Image 15">
            <img src="Assets/Images/Gallery/16.jpg" alt="Image 16">
            <img src="Assets/Images/Gallery/17.jpg" alt="Image 17">
            <img src="Assets/Images/Gallery/18.jpg" alt="Image 18">
            <img src="Assets/Images/Gallery/19.jpg" alt="Image 19">
            <img src="Assets/Images/Gallery/20.jpg" alt="Image 20">
            <img src="Assets/Images/Gallery/21.jpg" alt="Image 21">
            <img src="Assets/Images/Gallery/22.jpg" alt="Image 22">
            <img src="Assets/Images/Gallery/23.jpg" alt="Image 23">
            <img src="Assets/Images/Gallery/24.jpg" alt="Image 24">
            <img src="Assets/Images/Gallery/25.jpg" alt="Image 25">    
        </div>
    </section>

    <section id="AboutOf" class="final_section">
        <div class="final_section_h2">
            <h2>
                Gracias por visitar
            </h2>
        </div> 

        <div class="final_section_paragraph">
            <p> 
                Este portafolio fue desarrollado como parte de una asignación académica, con el propósito de aplicar 
                y fortalecer habilidades en diseño web, estructura de contenido y presentación visual. A través de esta 
                galería de imágenes, se buscó crear un espacio armonioso donde la estética y la funcionalidad se combinen 
                para ofrecer una experiencia visual agradable.
            </p>

            <p> 
                Aprecio que hayas tomado el tiempo de explorar esta colección. Cada imagen es una ventana a un rincón único del 
                mundo, y espero que hayan logrado transmitir la magia de la naturaleza.
            </p>
        </div>
    </section>

    <section class="comments_section">

        <h2> Dejar un comentario </h2>

        <form class="comment_form" action="database/save_comments.php" method="POST">

            <label for="nombre_apellido">Nombre y Apellido:</label>

            <input type="text" id="nombre_apellido" name="nombre_apellido" required>

            <label for="usuario">Usuario:</label>

            <input type="text" id="usuario" name="usuario" required>

            <label for="email">Email:</label>

            <input type="email" id="email" name="email" required>

            <label for="comentario">Nota (Comentario):</label>

            <textarea id="comentario" name="comentario" rows="4" required></textarea>

            <button type="submit">Enviar</button>

        </form>

    </section>

    <section class="comments_section">
    <h2>Comentarios</h2>
    <table border="1">
        <thead>
            <tr>
                <th>Nombre y Apellido</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Comentario</th>
                <th>Fecha</th>
            </tr>
        </thead>
        <tbody>
            <?php
            $sql = "SELECT nombre_apellido, usuario, email, comentario, fecha_nota FROM comments ORDER BY fecha_nota DESC";
            $result = $conexion->query($sql);

            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    echo "<tr>";
                    echo "<td>" . htmlspecialchars($row["nombre_apellido"]) . "</td>";
                    echo "<td>" . htmlspecialchars($row["usuario"]) . "</td>";
                    echo "<td>" . htmlspecialchars($row["email"]) . "</td>";
                    echo "<td>" . htmlspecialchars($row["comentario"]) . "</td>";
                    echo "<td>" . htmlspecialchars($row["fecha_nota"]) . "</td>";
                    echo "</tr>";
                }
            } else {
                echo "<tr><td colspan='5'>No hay comentarios aún.</td></tr>";
            }
            ?>
        </tbody>
    </table>
</section>

    <footer>
        <p> © 2025 Programación IV | Luis Salazar | Desarrollado con HTML y CSS | </p>
    </footer>
</body>
</html>
<?php
include("connection.php");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = $_POST["nombre_apellido"];
    $usuario = $_POST["usuario"];
    $email = $_POST["email"];
    $comentario = $_POST["comentario"];

    $sql = "INSERT INTO comments (nombre_apellido, usuario, email, comentario) 
            VALUES ('$nombre', '$usuario', '$email', '$comentario')";

    if ($conexion->query($sql) === TRUE) {
        echo "Comentario guardado con éxito.";
    } else {
        echo "Error: " . $conexion->error;
    }

    $conexion->close();
}
header("Location: ../index.php");
exit();

?>}
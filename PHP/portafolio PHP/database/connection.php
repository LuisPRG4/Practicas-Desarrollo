<?php
$servidor = "localhost";
$usuario = "root";
$password = "";
$base_datos = "comments";

$conexion = new mysqli($servidor, $usuario, $password, $base_datos);

if ($conexion->connect_error) {
    die("Error: " . $conexion->connect_error);
}
?>
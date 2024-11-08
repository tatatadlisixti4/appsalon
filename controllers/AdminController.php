<?php
namespace Controllers;

use Model\AdminCita;
use MVC\Router;

class AdminController {
    public static function index(Router $router) {
        session_start();
        isAdmin();

        // Cuando se busca una fecha en el apartado del admin
        extract($_GET); // se crean variables de acuerdo a las key->value del array asociativo

        if(isset($fecha)) {
            $fechas = explode('-', $fecha);
            list($año, $mes, $dia) = $fechas;
            $año = (int) $año;
            $mes = (int) $mes;
            $dia = (int) $dia;
            if (!checkdate($mes, $dia, $año)) {
                header('Location: /404');
            };
        } else {
            $fecha = date('Y-m-d');
        }
        
        
        // Consltar la base de datos
        $consulta = "SELECT citas.id, citas.hora, CONCAT( usuarios.nombre, ' ', usuarios.apellido) as cliente, ";
        $consulta .= " usuarios.email, usuarios.telefono, servicios.nombre as servicio, servicios.precio  ";
        $consulta .= " FROM citas  ";
        $consulta .= " LEFT OUTER JOIN usuarios ";
        $consulta .= " ON citas.usuarioId=usuarios.id  ";
        $consulta .= " LEFT OUTER JOIN citasservicios ";
        $consulta .= " ON citasservicios.citaId=citas.id ";
        $consulta .= " LEFT OUTER JOIN servicios ";
        $consulta .= " ON servicios.id=citasservicios.servicioId";
        $consulta .= " WHERE fecha =  '{$fecha}' ";

        $citas = AdminCita::SQL($consulta);

        $router->render('admin/index',  [
            'nombre' => $_SESSION['nombre'], 
            'citas' => $citas, 
            'fecha' => $fecha
        ]);
    }
}
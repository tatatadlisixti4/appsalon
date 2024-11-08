<?php
namespace Controllers;

use Model\Cita;
use Model\CitaServicio;
use Model\Servicio;
use MVC\Router;

class APIController {
    public static function index () {
        $servicios = Servicio::all();
        echo json_encode($servicios);
    }

    public static function guardar() {
        // Almacena la cita y devuelve el ID
        $cita = new Cita($_POST);
        $resultado = $cita->guardar();

        // Almacena los servicios con el ID de la cita 
        $idServicios = explode(',',  $_POST['servicios']);
        foreach($idServicios as $idServicio) {
            $args = [
                'citaId' => $resultado['id'],
                'servicioId' => $idServicio
            ];
            $citaServicio = new CitaServicio($args);
            $citaServicio->guardar();
        }

        // Retornamos la respuesta del endpoint
        echo json_encode([
            'resultado' => $resultado
        ]);
    }
    
    public static function eliminar() {
        // No debería poder utilizar el endpoint con un metodo get, pero de igual manera:
        if($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = $_POST['id'];
            // debuguear($_SERVER['HTTP_REFERER']);
            $cita = Cita::find($id);
            $cita->eliminar();
            header('Location: '. $_SERVER['HTTP_REFERER']);
            // debuguear($cita);
        } else {
            debuguear("Hola gominola metodo get");
        }
    }
} 
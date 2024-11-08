<?php

namespace Controllers;
use MVC\Router;
use Classes\Email;
use Model\Usuario;

class LoginController {
    public static function login(Router $router) {
        $alertas = [];
        $auth = new Usuario;
        if($_SERVER['REQUEST_METHOD'] === 'POST') {
            $auth = new Usuario($_POST);
            $alertas = $auth->validarLogin();
            if(empty($alertas)) {
                // Comprobar que exista el usuario
                $usuario = Usuario::where('email', $auth->email);
                if($usuario) {
                    // Verificar contraseña
                    if(!$usuario->comprobarPasswordAndVerificado($auth->password)) {
                        // Autenticar al usuario
                        session_start();
                        $_SESSION['id'] = $usuario->id;
                        $_SESSION['nombre'] = $usuario->nombre . " " . $usuario->apellido;
                        $_SESSION['email'] = $usuario->email;
                        $_SESSION['login'] = true;
                        
                        // Redireccionamiento
                        if($usuario->admin === '1') {
                            $_SESSION['admin'] = $usuario->admin ?? null;
                            header('Location: /admin');
                        } else {
                            header('Location: /cita');
                        }
                    } else {
                        debuguear("AHNSBDHJKASBNHDJKASBNJKDAS");
                    }
                } else {
                    Usuario::setAlerta('error', 'Correo Inválido');
                }
            }
        }
        $alertas = Usuario::getAlertas();
        $router->render('auth/login',  [
            'alertas' => $alertas,
            'auth' => $auth
        ]);
    }

    public static function logout() {
        session_start();
        $_SESSION = [];
        session_destroy();
        header('Location: /');
    }

    public static function olvide(Router $router) {
        $alertas = [];
        if($_SERVER['REQUEST_METHOD'] === 'POST') {
            $auth = new Usuario($_POST);
            $alertas = $auth->validarEmail();

            if(empty($alertas)) {
                $usuario = Usuario::where('email', $auth->email);
                if($usuario && $usuario->confirmado === '1') {
                    $usuario->crearToken();
                    $usuario->guardar();
                    
                    // Enviar el email para utilizar el token y cambiar la contraseña.
                    $email = new Email($usuario->email, $usuario->nombre, $usuario->token);
                    $email->enviarInstrucciones();

                    // Alerta de éxito
                    Usuario::setAlerta('exito', 'Revisa tu Email');
                } else {
                    Usuario::setAlerta('error', 'Email no confirmado, mire la bandeja de su correo.');
                }
                
            }
        }
        $alertas = Usuario::getAlertas();
        $router->render('auth/olvide-password', [
            'alertas' => $alertas
        ]);
    }

    public static function recuperar(Router $router) {
        $alertas = [];
        $error = false;
        $token = s($_GET['token']);
        
        $usuario = Usuario::where('token', $token);
        if(empty($usuario)) {
            Usuario::setAlerta('error', 'Token No Válido');
            $error = true;
        }

        if($_SERVER['REQUEST_METHOD'] === 'POST') {
            // Leer el nuevo password y guardarlo en la bd;
            $password = new Usuario($_POST);
            $alertas = $password->validarPassword();
            if(empty($alertas)) {
                $usuario->password = null;
                $usuario->password = $password->password;
                $usuario->hashPassword();
                $usuario->token = null;
                $resultado = $usuario->guardar();
                if($resultado) {
                    header('Location: /');
                }
            }
        }
        $alertas = Usuario::getAlertas();
        $router->render('auth/recuperar-password', [
            'alertas' => $alertas, 
            'error' => $error
        ]);
    }

    public static function crear(Router $router) {
        $usuario = new Usuario($_POST);

        // Alertas vacías
        $alertas = [];
        if($_SERVER['REQUEST_METHOD'] === 'POST') {
            $usuario->sincronizar($_POST);
            $alertas = $usuario->validarNuevaCuenta();

            // Revisar que alerta este vacio
            if(empty($alertas)) {
                // Verificar que el usuario no esté registrado
                $resultado = $usuario->existeUsuario();

                if($resultado->num_rows) {
                    $alertas = Usuario::getAlertas();
                } else {
                    // Hashear el Password
                    $usuario->hashPassword();
                    
                    // Generar un Token único
                    $usuario->crearToken();

                    // Enviar el email
                    $email = new Email($usuario->email, $usuario->nombre, $usuario->token);
                    $email->enviarConfirmacion();

                    // Crear el usuario
                    $resultado = $usuario->guardar();
                    if($resultado) {
                        header('Location: /mensaje');
                    }
                }
            }   
        }

        $router->render('auth/crear-cuenta', [
            'usuario'=>$usuario, 
            'alertas'=>$alertas
        ]);
    }

    public static function mensaje(Router $router) {
        $router->render('auth/mensaje');
    } 

    public static function confirmar(Router $router) {
        $alertas = [];
        $token = s($_GET['token']);
        $usuario = Usuario::where('token', $token);

        if(empty($usuario)) {
            // Mostrar mensaje de error
            Usuario::setAlerta('error', 'Token No Válido');
        } else {
            // Modificar a usuario confirmado
            $usuario->confirmado = "1"; // No tomar en cuenta el "error"
            $usuario->token = null;
            $usuario->guardar();
            Usuario::setAlerta('exito', 'Cuenta Comprobada Correctamente');
        }

        // Renderizar la vista con las alertas actualziadas despues de la comprobación de Usuario
        $alertas = Usuario::getAlertas();
        $router->render('auth/confirmar-cuenta', [
            'alertas' => $alertas
        ]);
    }
}
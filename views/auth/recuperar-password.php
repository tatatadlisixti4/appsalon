<h1 class="nombre-pagina">Hola</h1>
<p class="descripcion-pagina">Coloca tu nuevo password a continuación.</p>
<?php include_once __DIR__ . '/../templates/alertas.php'?>

<?php if($error): ?>
    <div class="acciones">
        <a href="/crear-cuenta">¿Aún no tienes una cuenta? Crear una</a>
        <a href="/">¿Ya tienes una cuenta? Inicia Sesión</a>    
    </div>
    <?php return; ?>
<?php endif; ?>


<form class="formulario" method="POST">
    <div class="campo">
        <label for="password">Password</label>
        <input 
            type="password"
            id="password"
            name="password"
            placeholder="Tu Nuevo Password"
        />    
    </div>
    <input type="submit" class="boton" value="Guardar Nuevo Password">
</form>

<div class="acciones">
    <a href="/crear-cuenta">¿Aún no tienes una cuenta? Crear una</a>
    <a href="/">¿Ya tienes una cuenta? Inicia Sesión</a>    
</div>
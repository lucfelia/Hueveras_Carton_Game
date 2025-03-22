let canvas_w = 800;
let canvas_h = 450;

let config = {
    width: canvas_w,
    height: canvas_h,
    scene: {
        preload: precarga,
        create: crea,
        update: actualiza // Lógica del juego en cada fotograma
    }
};

// Creación del juego
let game = new Phaser.Game(config);

let field_center = canvas_w / 2 + canvas_w / 8;
let huevera_x = 128;

let canvas_bg, eggcups_bg, huevera_b, huevera_m, huevera_d;

let huevo_shadow;

let sprite_scale = 0.6;

// Contadores
let countdown = 20; // Tiempo inicial en segundos
let countdown_text;
let countdown_interval;
let puntuacion = 0;
let puntuacion_text;
let juegoTerminado = false; // Loop principal

let huevos = [];
let huevos_speed = 1;

let huevos_interval;
let huevos_interval_time = 3000;

let huevo_current = 0;

// Música
let music = {
    background: null,
    game_over: null
};

let fx = {
    mouseclick: null,
    bad: null,
    good: null
};


// !!!!PRELOAD!!!!
function precarga()
{
    this.load.image('fondo', 'recursos/fondo.png');
    this.load.image('huevera', 'recursos/huevera.png');
    this.load.image('huevo', 'recursos/huevo.png');

    this.load.audio('background_music', 'recursos/dream.mp3');
    this.load.audio('game_over_music', 'recursos/gameover.mp3');
    this.load.audio('mouseclick_fx', 'recursos/mouseclick.mp3');
    this.load.audio('good_fx', 'recursos/good.mp3');
    this.load.audio('bad_fx', 'recursos/bad.mp3');
}

// !!!!CREATE!!!!
function crea()
{
    let blanco = Phaser.Display.Color.GetColor(255, 255, 255);
    let marron = Phaser.Display.Color.GetColor(192, 128, 16);
    let dorado = Phaser.Display.Color.GetColor(255, 215, 0);

    // Fondo
    canvas_bg = this.add.image(canvas_w / 2, canvas_h / 2, 'fondo');

    // Creación de hueveras
    huevera_d = this.add.image(huevera_x, canvas_h / 2 - 128, 'huevera')
        .setScale(sprite_scale)
        .setTint(dorado);
    huevera_d.huevera_type = "d";

    huevera_m = this.add.image(huevera_x, canvas_h / 2, 'huevera')
        .setScale(sprite_scale)
        .setTint(marron);
    huevera_m.huevera_type = "m";

    huevera_b = this.add.image(huevera_x, canvas_h / 2 + 128, 'huevera')
        .setScale(sprite_scale);
    huevera_b.huevera_type = "b";

    // Sombra del huevo
    huevo_shadow = this.add.image(-10000, -10000, 'huevo')
        .setTint("#000000")
        .setAlpha(0.5)
        .setScale(1.3);

    // Contadores
    countdown_text = this.add.text(field_center, 16, `Tiempo: ${countdown}`, 
        { fontSize: "24px", fontStyle: "bold" });

    puntuacion_text = this.add.text(field_center, 50, `Puntuación: ${puntuacion}`, 
        { fontSize: "24px", fontStyle: "bold" });

    // Música
    music.background = this.sound.add('background_music', { loop: true, volume: 0.5 });
    music.background.play();
    music.game_over = this.sound.add('game_over_music');

    fx.mouseclick = this.sound.add('mouseclick_fx');
    fx.good = this.sound.add('good_fx');
    fx.bad = this.sound.add('bad_fx');

    // Generación de huevos
    generarHuevos(this);

    // Llamada para generar huevos cada 3 segundos
    this.time.addEvent({
        delay: huevos_interval_time,
        callback: function() {
            generarHuevos(this);
        },
        loop: true // Para que los huevos se generen continuamente
    });

    // Generación del contador
    countdown_interval = setInterval(() => {
        if (!juegoTerminado) {
            countdown -= 1;  // Reducir el tiempo en 1 segundo
            countdown_text.setText(`Tiempo: ${countdown}`);
            if (countdown <= 0) {
                finDelJuego(this);  // Finaliza el juego cuando se acabe el tiempo
            }
        }
    }, 1000);  // Ejecutar cada segundo
}

// !!!!GENERAR HUEVOS!!!!
function generarHuevos(scene)
{
	console.log("Generando huevos..."); // DEBUG
	
	// "Enciclopedia" con los colores y puntos
    let colores = {
        b: { color: Phaser.Display.Color.GetColor(255, 255, 255), puntos: 10 },
        m: { color: Phaser.Display.Color.GetColor(192, 128, 16), puntos: 20 },
        d: { color: Phaser.Display.Color.GetColor(255, 215, 0), puntos: 30 }
    };

    // Bucle para crear 10 huevos
    for (let i = 0; i < 10; i++) {
        // Generar posición X aleatoria
        let x = Phaser.Math.Between(field_center - 224, field_center + 224);
        let y = -64; // Aparecen justo fuera de la pantalla

        // Crear el huevo y hacerlo interactivo
        let huevo = scene.add.image(x, y, 'huevo').setInteractive({ draggable: true });

        // Seleccionar un huevo aleatorio
        let tipo = Object.keys(colores)[Phaser.Math.Between(0, 2)];
        huevo.setTint(colores[tipo].color); // Aplicar color correspondiente
        huevo.huevo_type = tipo;  // Guardar el tipo de huevo
        huevo.puntos = colores[tipo].puntos;  // Asignar los puntos que vale este huevo
        huevo.falling = true; // Indica que el huevo está cayendo

        // Evento al hacer click
        huevo.on('pointerdown', function () {
            this.falling = false;  // Detenemos la caída del huevo al agarrarlo
            huevo_shadow.setPosition(this.x + 8, this.y + 8);  // Mostramos la sombra
            fx.mouseclick.play();  // Reproducimos el sonido de clic
            this.setScale(1.3);  // Aumentamos el tamaño del huevo para dar feedback visual
        });

        // Añadir el huevo a la array
        huevos.push(huevo);
    }

    // Evento global de arrastrar
    scene.input.on('drag', function (pointer, objeto, x, y) {
        if (!juegoTerminado) {
            objeto.x = x;
            objeto.y = y;
            huevo_shadow.setPosition(x + 8, y + 8);
        }
    });

    // Evento al soltar
    scene.input.on('dragend', function (pointer, objeto) {
        if (!juegoTerminado) {
            objeto.setScale(1);  // Restauramos el tamaño
            huevo_shadow.setPosition(-10000, -10000);  // Fuera sombra

            let enHuevera = false; // Variable para saber si el huevo está en una huevera

            // Comprobar si el huevo se suelta dentro de una huevera
            [huevera_b, huevera_m, huevera_d].forEach(huevera => {
                if (Phaser.Geom.Intersects.RectangleToRectangle(huevera.getBounds(), objeto.getBounds())) {
                    enHuevera = true;

                    // Si el huevo está bien, sumamos tiempo y puntos
                    if (huevera.huevera_type === objeto.huevo_type) {
                        countdown += 5;
                        puntuacion += objeto.puntos;
                        fx.good.play();  // Sonido de éxito
                    } 
                    // Si el huevo está en la huevera incorrecta, restamos tiempo y puntos
                    else {
                        countdown -= 5;
                        puntuacion -= 10;
                        fx.bad.play();  // Sonido de error
                    }

                    // Actualizamos los contadores
                    countdown_text.setText(`Tiempo: ${countdown}`);
                    puntuacion_text.setText(`Puntuación: ${puntuacion}`);

                    // Eliminamos el huevo
                    objeto.destroy();
                    // Eliminar huevo del arreglo
                    huevos = huevos.filter(huevo => huevo !== objeto);
                }
            });

            // Si el huevo se cae restamos tiempo y puntos
            if (!enHuevera) {
                countdown -= 5;
                puntuacion -= 5;
                countdown_text.setText(`Tiempo: ${countdown}`);
                puntuacion_text.setText(`Puntuación: ${puntuacion}`);
                fx.bad.play();
                objeto.destroy();
                // Eliminar huevo del arreglo
                huevos = huevos.filter(huevo => huevo !== objeto);
            }
        }
    });
}

// !!!!ACTUALIZACIÓN DEL JUEGO!!!!
function actualiza() {
    if (juegoTerminado) return;  // Si el juego se acaba no se hace nada más
	console.log("Actualizando juego..."); // DEBUG
	
    // Recorremos todos los huevos en juego
    huevos.forEach(huevo => {
        if (huevo.falling) {  // Si el huevo está cayendo
            huevo.y += huevos_speed;  // Lo hacemos bajar

            // Si el huevo cae fuera de la pantalla
            if (huevo.y > canvas_h) {
                huevo.falling = false; // Paramos su movimiento
                countdown -= 5;  // Restamos tiempo
                puntuacion -= 5;  // Restamos puntos
                countdown_text.setText(`Tiempo: ${countdown}`);
                puntuacion_text.setText(`Puntuación: ${puntuacion}`);
                fx.bad.play(); // Sonido de fallo
                huevo.destroy();
                // Eliminar huevo del arreglo
                huevos = huevos.filter(h => h !== huevo);
            }
        }
    });

    // Si el tiempo llega a 0 termina el juego
    if (countdown <= 0) {
        finDelJuego(this);
    }
}

// !!!!GAME OVER!!!!
function finDelJuego(scene) {
    juegoTerminado = true;

    music.background.stop();
    music.game_over.play();  // Sonido de Game Over

    clearInterval(countdown_interval);  // Detener el contador de tiempo

    scene.add.text(field_center, canvas_h / 2, `¡Fin del juego!`, 
        { fontSize: "40px", fontStyle: "bold", fill: "#ff0000" });
    scene.add.text(field_center, canvas_h / 2 + 40, `Puntuación final: ${puntuacion}`, 
        { fontSize: "24px", fontStyle: "bold" });
}
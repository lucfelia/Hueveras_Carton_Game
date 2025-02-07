let canvas_w = 800;
let canvas_y = 450;
let contador; // Variable para el texto del contador
let minuto = 60; // Valor inicial del contador

let config = {
	type: Phaser.AUTO,
	width: canvas_w,
	height: canvas_y,
	physics: {
		default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
           },
  scene: {
    preload: precarga,
    create: crea,
    update: actualiza
         }
 };

let game = new Phaser.Game(config);

let huevosFalling;
let hueveras = [];

/*let music = {
	background: null,
	game_over: null
};*/

function precarga() {
  this.load.image('huevera', 'recursos/huevera.png');
	this.load.image('huevo', 'recursos/huevo.png');
  this.load.image('fondo', 'recursos/fondo.png');
//	this.load.audio('background_music', 'audio/music_name.mp3')
}

function crea() {

/*music.background = this.sound.add('background_music', {
		loop: true,
		volume: 0.5
	});

music.background.play();*/

// Se añade la imagen de fondo centrada
this.add.image(canvas_w / 2, canvas_y / 2, 'fondo');

// Crear hueveras y almacenarlas en un array (ubicadas en la parte izquierda)
hueveras.push(this.add.image(140, 100, 'huevera').setScale(0.75));
hueveras.push(this.add.image(140, 225, 'huevera').setScale(0.75).setTint(Phaser.Display.Color.GetColor(255, 128, 16)));
hueveras.push(this.add.image(140, 350, 'huevera').setScale(0.75).setTint(Phaser.Display.Color.GetColor(255, 229, 122)));

// Se crea el grupo de huevos que caerán
huevosFalling = this.physics.add.group();

// Se genera un huevo nuevo cada 1000ms (1 segundo)
this.time.addEvent({
	delay: 1000,
  callback: generarHuevo,
  callbackScope: this,
  loop: true
 });

// Eventos de arrastre: se permite mover el huevo y se cambia su escala al arrastrarlo
this.input.on('drag', function (pointer, object, x, y) {
  object.x = x;
  object.y = y;
  object.setScale(1.35);
 });

// Al soltar el huevo, se verifica si está sobre alguna huevera y, en ese caso, se destruye
this.input.on('dragend', function (pointer, object) {
  object.setScale(1);
  let sobreHuevera = false;
  hueveras.forEach(huevera => {
		if (Phaser.Geom.Intersects.RectangleToRectangle(huevera.getBounds(), object.getBounds())) {
    	sobreHuevera = true;
             }
 });
    if (sobreHuevera) {
      console.log("Huevo sobre huevera");
      object.destroy();
				              }
});

// Se crea el contador de cuenta atrás en la parte superior derecha.
// Usamos setOrigin(1,0) para que el texto se alinee a la derecha, y aumentamos la fuente a 48px.
contador = this.add.text(canvas_w - 20, 20, minuto, { font: "48px Arial", fill: "#fff" }).setOrigin(1, 0);
 }

// Se usa setInterval para decrementar el contador cada 1000ms (1 segundo)
let interval_contador = setInterval(function () {
	minuto--;
  if (minuto < 0) {
  	clearInterval(interval_contador);
    return;
    					     }
    contador.setText(minuto);
		}, 1000);

// Función para generar un huevo en una posición aleatoria en la parte superior y hacerlo caer
function generarHuevo() {
	let x = Phaser.Math.Between(300, 700);
  let huevo = huevosFalling.create(x, 50, 'huevo').setScale(0.75);

  let colorRandom = Phaser.Math.Between(1, 3);
  	if (colorRandom === 1) {
    	huevo.setTint(Phaser.Display.Color.GetColor(255, 255, 255));
      huevo.color = "blanco";
    } else if (colorRandom === 2) {
      huevo.setTint(Phaser.Display.Color.GetColor(255, 128, 16));
      huevo.color = "marrón";
    } else {
      huevo.setTint(Phaser.Display.Color.GetColor(255, 229, 122));
      huevo.color = "dorado";
            }

      huevo.setVelocityY(100);
      huevo.setInteractive({ draggable: true });
      huevo.on('pointerdown', function () {
      console.log(`Huevo ${this.color} clickado`);
      });

	}

// En la función update se eliminan los huevos que hayan caído fuera del canvas
function actualiza() {
	huevosFalling.children.iterate(function (huevo) {
  if (huevo && huevo.y > canvas_y + 50) {
  	huevo.destroy();
    }
  });
 }

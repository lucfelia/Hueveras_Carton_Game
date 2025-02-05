let canvas_w = 800;
let canvas_y = 450;

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
let minuto = 60;

function precarga() {
		this.load.image('huevera', 'recursos/huevera.png');
		this.load.image('huevo', 'recursos/huevo.png');
		this.load.image('fondo', 'recursos/fondo.png');
}

function crea() {
		this.add.image(canvas_w / 2, canvas_y / 2, 'fondo');
		contador = this.add.text(400, 20, minuto);

		// Crear hueveras y almacenarlas en un array
		hueveras.push(this.add.image(140, 100, 'huevera').setScale(0.75));
		hueveras.push(this.add.image(140, 225, 'huevera').setScale(0.75).setTint(Phaser.Display.Color.GetColor(255, 128, 16)));
		hueveras.push(this.add.image(140, 350, 'huevera').setScale(0.75).setTint(Phaser.Display.Color.GetColor(255, 229, 122)));

		// Grupo de huevos
		huevosFalling = this.physics.add.group();

		// Generar huevos continuamente
		this.time.addEvent({
				delay: 1000,
				callback: generarHuevo,
				callbackScope: this,
				loop: true
		});

		// Eventos de arrastre
		this.input.on('drag', function (pointer, object, x, y) {
				object.x = x;
				object.y = y;
				object.setScale(1.35);
		});

		this.input.on('dragend', function (pointer, object) {
				object.setScale(1);
				let sobreHuevera = false;

				// Revisar si el huevo está sobre alguna huevera
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
	contador = this.add.text(100, 20, minuto);


}
	//Hacer contador:
	let interval_contador;
	
	interval_contador = setInterval(function () {
	minuto--;
		if (minuto <= 0){
			clearInterval(interval_contador);
			return;
		}
	contador.setText(minuto);
	}, 1000);


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

		// Hacer el huevo interactivo y draggable
		huevo.setInteractive({ draggable: true });

		huevo.on('pointerdown', function () {
				console.log(`Huevo ${this.color} clickado`);
		});
}

function actualiza() {
		huevosFalling.children.iterate(function (huevo) {
				if (huevo && huevo.y > canvas_y + 50) {
						huevo.destroy();
				}
		});
}

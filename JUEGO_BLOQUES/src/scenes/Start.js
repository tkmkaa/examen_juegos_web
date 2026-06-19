export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('fondo', 'assets/fondos/Nebula Blue.png');

        this.load.image('idle', 'assets/SpaceRage/Player/player_b_m.png');
        this.load.image('right', 'assets/SpaceRage/Player/player_b_r1.png');
        this.load.image('left', 'assets/SpaceRage/Player/player_b_l1.png');

        this.load.image('enemigo', 'assets/SpaceRage/Enemies/enemy_1_b_m.png');

        this.load.image('bala_personaje', 'assets/SpaceRage/FX/exhaust_01.png');
    }

    create() {

        // FONDO Y AJUSTE DEL FONDO CON INTERFAZ DE NAVEGADOR
    
        let fondo = this.add.image(0, 0, 'fondo').setOrigin(0, 0);
        let escalaVertical = 1;

        fondo.setScale(escalaVertical);

        const anchoEscalado = fondo.width * escalaVertical;
        const altoEscalado = fondo.height * escalaVertical;              
        this.cameras.main.setBounds(0, 0, anchoEscalado, altoEscalado);
        this.physics.world.setBounds(0, 0, anchoEscalado, altoEscalado);


        // CREACION JUGADOR

        // hacer jugador empezar siempre en el centro abajo
        const anchoPantalla = this.scale.width;
        const altoPantalla = this.scale.height;
        const posX = anchoPantalla / 2;
        const posY = altoPantalla - 50;

        this.player = this.add.sprite(posX,posY,'idle').setOrigin(0,0); // origen del eje del pj
        this.player.setDepth(1); // alante del todo
        this.player.setScale(1); // tamaño personaje

        this.physics.add.existing(this.player);  // fisicas
        this.player.body.setCollideWorldBounds(true); // limite bordes pantalla
        
        
        // CONTROLES

            this.cursors = this.input.keyboard.addKeys({
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D,
                enter: Phaser.Input.Keyboard.KeyCodes.ENTER
            })

            this.speed = 200; // velocidad del personaje


        // BALAS DEL ENEMIGO Y DISPARAR
        this.balas = this.physics.add.group();
        this.enter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.bulletSpeed = -600; // velocidad de las balas (negativo para que suba)
        this.ultimoDisparo = 0; // cooldown de disparos 

            

        // ENEMIGOS

        this.enemies = this.physics.add.group();
        this.time.addEvent({
        delay: 1500,                // tiempo (milisegundos)
        callback: this.spawnEnemigo,     // llamada a ejecución
        callbackScope: this,
        loop: true                  // bucle para que siempre estén apareciendo
    });

    // velocidad enemigos
    this.enemiesSpeed = 100;

        };

    spawnEnemigo() {
    // x aleatoria
    const xAleatoria = Phaser.Math.Between(0, this.scale.width);
    
    // y un poco mas arriba de la pantalla para que vayan apareciendo
    const yArriba = -50;

    // creacion del enemigo & grupo de físicas
    const enemigo = this.enemies.create(xAleatoria, yArriba, 'enemigo');
    enemigo.setOrigin(0, 0);
    enemigo.setDepth(1);
    
    // limites de pantalla para enemigos
    enemigo.body.setCollideWorldBounds(false); 



    // ---------------- SISTEMA DE PUNTOS ----------------------------

    this.puntos = 0;
    this.textoPuntos = this.add.text(0,0,'PUNTOS : 0',{
    fontSize: '32px',
    fill: '#ffffff', // Color blanco
    fontFamily: 'Arial',
    fontWeight: 'bold'   
    });

    this.textoPuntos.setDepth(2); // UI POR DELANTE DE TODO
}

        update(){

            // MOVIMIENTO PERSONAJE

            this.player.body.setVelocityX(0); // iniciar con velocidad x 0

            if (this.cursors.left.isDown) {
                this.player.body.setVelocityX(-this.speed);
                this.player.setTexture('left'); // animacion izq

            } else if (this.cursors.right.isDown) {
                this.player.body.setVelocityX(this.speed);
                this.player.setTexture('right'); // animacion dch
                
            } else{
                this.player.setTexture('idle'); // animacion quieto
            }



        // PARTE DE ENEMIGOS
            this.enemies.children.iterate((enemigo) => {
        if (!enemigo) return;

        // enemigo avanza hasta pos del personaje
        this.physics.moveToObject(enemigo, this.player, this.enemySpeed);

        // enemigo pasa de largo en la pantalla se elimina.
        if (enemigo.y > this.scale.height + 50) {
            enemigo.destroy(); 
        }
    });

    // si enemigo toca a personaje, desaparece y se reinicia la pantalla
    this.physics.add.overlap(this.player, this.enemies, (player, enemigo) => {
    this.scene.restart(); 
    }, null, this);



    // PARTE BALAS
        const tiempoActual = this.time.now; // calcular el tiempo actual del juego
        if (this.enter.isDown && tiempoActual > this.ultimoDisparo){ // si el tiempo del juego es mayor que el tiempo desde el ultimo dsiparo
        console.log("DISPARANDO BALA !!!!");
        const bala = this.balas.create(this.player.x, this.player.y - 20, 'bala_personaje');
        bala.setOrigin(0, 0)
        bala.body.setVelocityY(this.bulletSpeed); // añadimos velocidad hacia arriba
        
        // desactivar gravedad (POR SI ACASO)
        bala.body.setAllowGravity(false);
        this.ultimoDisparo = tiempoActual + 300; // actualizamos el tiempo del juego
        }

        // OPTIMIZACIÓN DE BALAS
        if (this.balas && this.balas.children) {
        this.balas.children.iterate((bala) => {
            if (!bala) return;

            // Si la bala sale por el borde superior (Y < -20)
            if (bala.y < -20) {
                bala.destroy();
            }
        });

        }

        // CUANDO BALA TOCA A ENEMIGO DESAPARECE Y EL ENEMIGO TMB
        this.physics.add.overlap(this.enemies, this.balas, (enemigo, bala) => {
        bala.destroy();
        enemigo.destroy();

        // ACTUALIZAR TEXTO UI CADA VEZ Q SE LE DA A UN ENEMIGO
        this.puntos += 10;
        this.textoPuntos.setText('PUNTOS: ' + this.puntos);

        }, null, this);


    }
    
}

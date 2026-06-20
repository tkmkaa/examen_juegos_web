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

        this.juegoTerminado= false;

        // FONDO Y AJUSTE DEL FONDO CON INTERFAZ DE NAVEGADOR
        let fondo = this.add.image(0, 0, 'fondo').setOrigin(0, 0);
        let escalaVertical = 1;
        fondo.setScale(escalaVertical);

        const anchoEscalado = fondo.width * escalaVertical;
        const altoEscalado = fondo.height * escalaVertical;              
        this.cameras.main.setBounds(0, 0, anchoEscalado, altoEscalado);
        this.physics.world.setBounds(0, 0, anchoEscalado, altoEscalado);

        // CREACION JUGADOR
        const anchoPantalla = this.scale.width;
        const altoPantalla = this.scale.height;
        const posX = anchoPantalla / 2;
        const posY = altoPantalla - 50;

        this.player = this.add.sprite(posX, posY, 'idle').setOrigin(0.5, 0.5); // Cambiado a 0.5 para estabilidad
        this.player.setDepth(1); 
        this.player.setScale(1); 
        this.physics.add.existing(this.player);  
        this.player.body.setCollideWorldBounds(true); 
        
        // CONTROLES
        this.cursors = this.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            enter: Phaser.Input.Keyboard.KeyCodes.ENTER
        });
        this.speed = 200; 

        // BALAS DEL ENEMIGO Y DISPARAR
        this.balas = this.physics.add.group();
        this.enter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.bulletSpeed = -600; 
        this.ultimoDisparo = 0; 

        // ENEMIGOS
        this.enemies = this.physics.add.group();
        this.enemiesSpeed = 100;

        this.genererEnemigos = this.time.addEvent({
            delay: 1500,                
            callback: this.spawnEnemigo,     
            callbackScope: this,
            loop: true                  
        });

        // ---------------- SISTEMA DE PUNTOS (PUESTO AQUÍ PARA QUE SOLO SE CREÉ UNA VEZ) ----------------------------
        this.puntos = 0;
        this.textoPuntos = this.add.text(16, 16, 'PUNTOS : 0', { // Movido un poco a (16,16) para que no se pegue al borde puro
            fontSize: '32px',
            fill: '#ffffff', 
            fontFamily: 'Arial',
            fontWeight: 'bold'   
        });
        this.textoPuntos.setDepth(2); 

        // ---------------- COLISIONES (CONFIGURADAS UNA SOLA VEZ AQUÍ EN CREATE) ----------------------------
        // si enemigo toca a personaje, se reinicia la pantalla
        this.physics.add.overlap(this.player, this.enemies, (player, enemigo) => {
            if(this.juegoTerminado){ // si el juego no se ha terminado, no se reinicia
            this.scene.restart(); }
        }, null, this);

        // CUANDO BALA TOCA A ENEMIGO DESAPARECE Y EL ENEMIGO TMB
        this.physics.add.overlap(this.enemies, this.balas, (enemigo, bala) => {
            if(this.juegoTerminado) return;
            bala.destroy();
            enemigo.destroy();

            // ACTUALIZAR TEXTO UI CADA VEZ Q SE LE DA A UN ENEMIGO
            this.puntos += 10;
            this.textoPuntos.setText('PUNTOS: ' + this.puntos);

            if (this.puntos >= 100) {
                this.pantallaVictoria();
            }
        }, null, this);

        
    }

    spawnEnemigo() {
        if(this.juegoTerminado) return ;
        const xAleatoria = Phaser.Math.Between(0, this.scale.width);
        const yArriba = -50;

        const enemigo = this.enemies.create(xAleatoria, yArriba, 'enemigo');
        enemigo.setOrigin(0.5, 0.5); // Cambiado a 0.5 para rotaciones estables
        enemigo.setDepth(1);
        enemigo.body.setCollideWorldBounds(false); 
    }

    pantallaVictoria(){
        this.juegoTerminado = true;

        this.physics.pause(); // congelamos las físicas

        // parar la generacion de malos
        if (this.generadorEnemigos) {
            this.generadorEnemigos.destroy();
            this.generadorEnemigos = null; // Lo dejamos en null para que no se vuelva a usar
        }

        // Detenemos movimientos remanentes
        if (this.player.body) this.player.body.setVelocity(0, 0);
        this.enemies.setVelocityX(0);
        this.enemies.setVelocityY(0);
        this.balas.setVelocityY(0);


        // cartel
        const cartelVic = this.add.text(this.scale.width / 2, this.scale.height / 2, '¡HAS GANADO!', {
            fontSize: '64px',
            fill: '#00ff00', // Color verde brillante celestial
            fontFamily: 'Arial',
            fontWeight: 'bold',
            backgroundColor: '#000000a0', // Fondo negro semitransparente para que se lea genial
            padding: { x: 20, y: 10 }
        });
        
        cartelVic.setOrigin(0, 0); 
        cartelVic.setDepth(3);
    }

    update() {

        if(this.juegoTerminado) return;

        // MOVIMIENTO PERSONAJE
        this.player.body.setVelocityX(0); 

        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-this.speed);
            this.player.setTexture('left'); 
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(this.speed);
            this.player.setTexture('right'); 
        } else {
            this.player.setTexture('idle'); 
        }

        // PARTE DE ENEMIGOS
        this.enemies.children.iterate((enemigo) => {
            if (!enemigo) return;
            
            this.physics.moveToObject(enemigo, this.player, this.enemiesSpeed);

            if (enemigo.y > this.scale.height + 50) {
                enemigo.destroy(); 
            }
        });

        // PARTE BALAS
        const tiempoActual = this.time.now; 
        if (this.enter.isDown && tiempoActual > this.ultimoDisparo) { 
            console.log("DISPARANDO BALA !!!!");
            const bala = this.balas.create(this.player.x, this.player.y - 20, 'bala_personaje');
            if (bala) {
                bala.setOrigin(0.5, 0.5);
                bala.body.setVelocityY(this.bulletSpeed); 
                bala.body.setAllowGravity(false);
            }
            this.ultimoDisparo = tiempoActual + 300; 
        }

        // OPTIMIZACIÓN DE BALAS
        if (this.balas && this.balas.children) {
            this.balas.children.iterate((bala) => {
                if (!bala) return;
                if (bala.y < -20) {
                    bala.destroy();
                }
            });
        }
    }
}
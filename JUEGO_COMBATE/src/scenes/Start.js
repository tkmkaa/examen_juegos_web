export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        this.load.svg('idle', 'assets/vector/characters/character_beige_idle.svg');
        this.load.svg('walk1', 'assets/vector/characters/character_beige_walk_a.svg');
        this.load.svg('walk2', 'assets/vector/characters/character_beige_walk_b.svg');
        this.load.svg('jump', 'assets/vector/characters/character_beige_jump.svg');
        this.load.svg('hit', 'assets/vector/characters/character_beige_hit.svg');

            this.load.image('fondo', 'assets/sprites/backgrounds/default/background_color_hills.png');
    }

    create() {
        // 1. FONDO (Primero para que quede atrás)
        this.fondo = this.add.image(0, 0, 'fondo');
        this.fondo.setOrigin(0, 0);
        this.fondo.setDepth(0);
        this.fondo.setScale(3);

        // 2. SUELO PROVISIONAL (Forma nativa inamovible de Phaser)
        this.suelo = this.physics.add.staticGroup();
        
        // Creamos el suelo visual
        let sueloGrafico = this.add.rectangle(400, 550, 800, 40, 0x2ecc71);
        this.suelo.add(sueloGrafico); 
        
        // CORRECCIÓN MÁGICA: Forzamos al motor a activar el cuerpo estático del rectángulo
        this.physics.add.existing(sueloGrafico, true);
        sueloGrafico.body.setSize(800, 40);
        this.suelo.setDepth(1)

        // 3. JUGADOR
        // Cambiado de X: 1 a X: 100 para que no spawnee fuera de la pantalla
        this.player = this.add.sprite(100, 200, 'idle'); 
        this.player.setDepth(1); 
        this.player.setScale(0.2); 
        
        // Activar físicas en el jugador
        this.physics.add.existing(this.player); 
        this.player.body.setCollideWorldBounds(true); // Límite de pantalla
        
        // Como es un SVG, le damos dimensiones explícitas a su caja para que no mida 0x0
        this.player.body.setSize(this.player.width, this.player.height);
        this.player.body.refreshBody(); 

        // 4. COLISIÓN OBLIGATORIA
        this.physics.add.collider(this.player, this.suelo);

        // --- ANIMACIONES ---
        this.anims.create({
            key: 'caminar',
            frames: [{ key: 'walk1' }, { key: 'walk2' }],
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'saltar',
            frames: [{ key: 'jump' }],
            frameRate: 1,
            repeat: 0
        });

        this.anims.create({
            key: 'pegar',
            frames: [{ key: 'hit' }],
            frameRate: 5,
            repeat: 0
        });

        // --- CONTROLES ---
        this.cursors = this.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE, 
            enter: Phaser.Input.Keyboard.KeyCodes.ENTER  
        });

        this.speed = 200; 
        this.estaAtacando = false; 
    }

    update() {
        if (this.estaAtacando) {
            this.player.body.setVelocity(0); // Se queda quieto al pegar
            return; 
        }

        // Solo reseteamos la velocidad X, para dejar que la Y del salto funcione
        this.player.body.setVelocityX(0);
        let estaMoviendose = false;

        // --- ATAQUE ---
        if (Phaser.Input.Keyboard.JustDown(this.cursors.enter)) {
            this.estaAtacando = true;
            this.player.play('pegar', true);
            
            this.time.delayedCall(300, () => {
                this.estaAtacando = false;
            });
            return; 
        }

        // --- ACCIÓN DE SALTAR ---
        if (this.cursors.space.isDown && (this.player.body.touching.down || this.player.body.onFloor())) {
            this.player.body.setVelocityY(-450); 
            this.player.play('saltar', true);
        }

        // --- MOVIMIENTO HORIZONTAL Y ANIMACIONES ---
        if (!this.player.body.touching.down && !this.player.body.onFloor()) {
            this.player.play('saltar', true);
            
            // Permitir moverse en el aire
            if (this.cursors.left.isDown) {
                this.player.body.setVelocityX(-this.speed);
                this.player.flipX = true;
            } else if (this.cursors.right.isDown) {
                this.player.body.setVelocityX(this.speed);
                this.player.flipX = false;
            }
        } else {
            // Si está en el suelo, movimiento normal
            if (this.cursors.left.isDown) {
                this.player.body.setVelocityX(-this.speed);
                this.player.flipX = true;
                estaMoviendose = true;
            } else if (this.cursors.right.isDown) {
                this.player.body.setVelocityX(this.speed);
                this.player.flipX = false;
                estaMoviendose = true;
            }

            if (estaMoviendose) {
                this.player.play('caminar', true);
            } else {
                this.player.play('idle', true); 
            }
        }
    }
}
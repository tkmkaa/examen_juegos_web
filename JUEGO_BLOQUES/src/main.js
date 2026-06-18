// src/main.js

// 1. IMPORTA LA ESCENA (Ajusta el nombre del archivo .js si es diferente)
import { Start } from './scenes/Start.js'; 

const config = {
    type: Phaser.AUTO,
    width: 1980,
    height: 1080,
    parent: 'game-container', // Esto hace que el juego se meta en el div de tu HTML
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 }, // Movimiento tipo RPG/Top-down sin gravedad
            debug: true
        }
    },
    scene: [Start] // <-- Ahora "Start" ya está definido gracias al import de arriba
};

const game = new Phaser.Game(config);
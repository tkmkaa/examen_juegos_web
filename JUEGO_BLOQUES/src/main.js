// src/main.js

// 1. IMPORTA LA ESCENA (Ajusta el nombre del archivo .js si es diferente)
import { Start } from './scenes/Start.js'; 

// config para que el juego se adapte a la pestaña del navegador

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth, 
    height: window.innerHeight,
    backgroundColor : '#F54927',
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
     
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, 
            debug: true
        }
    },
    scene: [Start] 
};

const game = new Phaser.Game(config);
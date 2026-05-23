"use client";

import { useEffect, useRef, useState } from "react";
import { X, RotateCcw, AlertTriangle, Coins, Shield, Zap } from "lucide-react";

interface RunnerGameProps {
  currentSkin: string;
  onGameOver: (stats: { score: number; coins: number; distance: number }) => void;
  onGameActive: () => void;
  revivesUsed: number;
  triggerRevive: boolean;
  onReviveComplete: () => void;
  triggerRestart: boolean;
  onRestartComplete: () => void;
}

// Sintetizador de audio en tiempo real usando Web Audio API para asegurar que los sonidos carguen siempre
class SoundSynth {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== "undefined") {
      this.enabled = localStorage.getItem("game_sound") !== "false";
    }
  }

  toggleSound(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem("game_sound", enabled ? "true" : "false");
  }

  isSoundEnabled() {
    return this.enabled;
  }

  private init() {
    if (!this.enabled) return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playCoin() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      const now = this.ctx.currentTime;
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5
      
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  playJump() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      const now = this.ctx.currentTime;
      osc.type = "triangle";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(360, now + 0.1);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  playSlide() {
    try {
      this.init();
      if (!this.ctx) return;
      const bufferSize = this.ctx.sampleRate * 0.12;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(350, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.0, this.ctx.currentTime);
      
      const gain = this.ctx.createGain();
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.12);
      
      noise.start(now);
      noise.stop(now + 0.12);
    } catch (e) {}
  }

  playExplosion() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      const now = this.ctx.currentTime;
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(20, now + 0.28);
      
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  playPowerup() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25]; // Do, Mi, Sol, Do
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.06, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.12);
        
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.12);
      });
    } catch (e) {}
  }
}

export const soundSynth = new SoundSynth();

export default function RunnerGame({
  currentSkin,
  onGameOver,
  onGameActive,
  revivesUsed,
  triggerRevive,
  onReviveComplete,
  triggerRestart,
  onRestartComplete
}: RunnerGameProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<any>(null);
  const [soundEnabled, setSoundEnabled] = useState(soundSynth.isSoundEnabled());

  useEffect(() => {
    if (typeof window === "undefined" || !parentRef.current) return;

    let isDestroyed = false;
    let phaserGame: any = null;

    import("phaser").then((Phaser) => {
      if (isDestroyed) return;

      // Escena principal del Endless Runner
      class GameplayScene extends Phaser.Scene {
        player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
        groundGroup!: Phaser.Physics.Arcade.StaticGroup;
        obstaclesGroup!: Phaser.Physics.Arcade.Group;
        coinsGroup!: Phaser.Physics.Arcade.Group;
        powerupsGroup!: Phaser.Physics.Arcade.Group;
        particlesEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
        
        // Capas de fondo parallax
        bgStars!: Phaser.GameObjects.TileSprite;
        bgCity!: Phaser.GameObjects.TileSprite;
        bgHills!: Phaser.GameObjects.TileSprite;
        
        // Estado de juego
        gameSpeed = 350;
        baseSpeed = 350;
        distanceRun = 0;
        coinsCollected = 0;
        score = 0;
        isPlayerDead = false;
        
        // Power-ups
        hasShield = false;
        hasMagnet = false;
        hasMultiplier = false;
        hasJetpack = false;
        
        // Temporizadores de power-ups (segundos restantes)
        shieldTimer = 0;
        magnetTimer = 0;
        multiplierTimer = 0;
        jetpackTimer = 0;
        
        // Teclas
        cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
        keyW!: Phaser.Input.Keyboard.Key;
        keyS!: Phaser.Input.Keyboard.Key;
        keySpace!: Phaser.Input.Keyboard.Key;
        
        // UI de Phaser interna (HUD)
        shieldIcon!: Phaser.GameObjects.Graphics;
        magnetIcon!: Phaser.GameObjects.Graphics;
        multiplierIcon!: Phaser.GameObjects.Graphics;
        jetpackIcon!: Phaser.GameObjects.Graphics;

        constructor() {
          super("GameplayScene");
        }

        init() {
          this.gameSpeed = 350;
          this.distanceRun = 0;
          this.coinsCollected = 0;
          this.score = 0;
          this.isPlayerDead = false;
          this.hasShield = false;
          this.hasMagnet = false;
          this.hasMultiplier = false;
          this.hasJetpack = false;
        }

        preload() {
          // Generar texturas procedimentales para evitar archivos externos ausentes
          this.createProceduralTextures();
        }

        create() {
          onGameActive();
          const { width, height } = this.scale;

          // Parallax background
          this.bgStars = this.add.tileSprite(0, 0, width, height, "tex_stars").setOrigin(0, 0);
          this.bgCity = this.add.tileSprite(0, 0, width, height, "tex_city").setOrigin(0, 0);
          this.bgHills = this.add.tileSprite(0, 0, width, height, "tex_hills").setOrigin(0, 0);

          // Suelo
          this.groundGroup = this.physics.add.staticGroup();
          const groundHeight = 48;
          const groundY = height - groundHeight / 2;
          
          // Crear un tile sprite del suelo
          const groundSprite = this.add.tileSprite(width / 2, groundY, width, groundHeight, "tex_ground");
          this.physics.add.existing(groundSprite, true);
          this.groundGroup.add(groundSprite);

          // Personaje Jugador
          this.player = this.physics.add.sprite(150, height - 120, "tex_player");
          this.player.setCollideWorldBounds(true);
          this.player.setGravityY(1000);
          this.player.setDepth(10);
          this.player.body.setSize(30, 48);
          this.player.body.setOffset(9, 0);

          // Determinar color de partículas por skin
          let trailColor = 0x06b6d4; // Cyan por defecto
          if (currentSkin === "cyber_runner") trailColor = 0xec4899; // Rosa
          if (currentSkin === "neon_runner") trailColor = 0x10b981; // Esmeralda
          if (currentSkin === "gold_runner") trailColor = 0xf59e0b; // Dorado

          // Emisor de partículas para la estela del personaje
          const trailParticles = (this.add as any).particles(0, 0, "tex_spark", {
            speed: { min: 10, max: 50 },
            angle: { min: 160, max: 200 },
            scale: { start: 0.4, end: 0 },
            blendMode: "ADD",
            lifespan: 600,
            gravityY: 10,
            tint: trailColor
          });
          trailParticles.startFollow(this.player, -15, 10);
          this.particlesEmitter = trailParticles;

          // Grupos físicos
          this.obstaclesGroup = this.physics.add.group();
          this.coinsGroup = this.physics.add.group();
          this.powerupsGroup = this.physics.add.group();

          // Colisiones
          this.physics.add.collider(this.player, this.groundGroup);
          this.physics.add.overlap(this.player, this.coinsGroup, this.collectCoin, undefined, this);
          this.physics.add.overlap(this.player, this.powerupsGroup, this.collectPowerup, undefined, this);
          this.physics.add.collider(this.player, this.obstaclesGroup, this.hitObstacle, undefined, this);

          // Controles de teclado
          if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
            this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
            this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
          }

          // Controles móviles (Swipe y Taps táctiles en pantalla dividida)
          this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            if (this.isPlayerDead) return;
            // Tap mitad izquierda = agacharse, mitad derecha = saltar
            if (pointer.x < width / 2) {
              this.startDuck();
            } else {
              this.jump();
            }
          });

          this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
            if (pointer.x < width / 2) {
              this.stopDuck();
            }
          });

          // Spawners periódicos
          this.time.addEvent({ delay: 1800, callback: this.spawnObstacle, callbackScope: this, loop: true });
          this.time.addEvent({ delay: 1200, callback: this.spawnCoinLine, callbackScope: this, loop: true });
          this.time.addEvent({ delay: 12000, callback: this.spawnPowerup, callbackScope: this, loop: true });

          // Configurar la cámara para destellos o sacudidas
          this.cameras.main.setBounds(0, 0, width, height);

          // Iconos visuales de HUD para power-ups
          this.shieldIcon = this.add.graphics().setVisible(false).setScrollFactor(0);
          this.magnetIcon = this.add.graphics().setVisible(false).setScrollFactor(0);
          this.multiplierIcon = this.add.graphics().setVisible(false).setScrollFactor(0);
          this.jetpackIcon = this.add.graphics().setVisible(false).setScrollFactor(0);
        }

        update(time: number, delta: number) {
          if (this.isPlayerDead) return;

          const { width, height } = this.scale;

          // Parallax scrolling
          this.bgStars.tilePositionX += this.gameSpeed * 0.0002;
          this.bgCity.tilePositionX += this.gameSpeed * 0.0008;
          this.bgHills.tilePositionX += this.gameSpeed * 0.002;
          
          // Suelo scrolling
          const ground = this.groundGroup.getChildren()[0] as Phaser.GameObjects.TileSprite;
          ground.tilePositionX += this.gameSpeed * 0.005;

          // Dificultad e incremento de velocidad
          this.gameSpeed = this.baseSpeed + Math.min(400, this.distanceRun * 0.15);

          // Calcular distancia y puntuación
          const dt = delta / 1000;
          this.distanceRun += dt * (this.gameSpeed / 10);
          
          let scoreMultiplier = this.hasMultiplier ? 2 : 1;
          this.score += dt * (this.gameSpeed / 20) * scoreMultiplier;

          // Limpieza de objetos fuera de pantalla
          this.cleanupObjects();

          // Movimiento automático de obstáculos, monedas y power-ups
          this.obstaclesGroup.setVelocityX(-this.gameSpeed);
          this.coinsGroup.setVelocityX(-this.gameSpeed);
          this.powerupsGroup.setVelocityX(-this.gameSpeed);

          // Controles de teclado
          if (this.cursors) {
            if ((this.cursors.up?.isDown || this.keyW.isDown || this.keySpace.isDown)) {
              this.jump();
            } else if (this.cursors.down?.isDown || this.keyS.isDown) {
              this.startDuck();
            } else {
              this.stopDuck();
            }
          }

          // Lógica de imán de monedas
          if (this.hasMagnet) {
            this.coinsGroup.getChildren().forEach((coin: any) => {
              const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, coin.x, coin.y);
              if (dist < 150) {
                // Volar hacia el jugador
                this.physics.moveToObject(coin, this.player, 500);
              }
            });
          }

          // Lógica de Jetpack (vuelo)
          if (this.hasJetpack) {
            this.player.setGravityY(0);
            this.player.y = Phaser.Math.Linear(this.player.y, 120, 0.1);
            this.player.setVelocityY(0);
          } else {
            this.player.setGravityY(1000);
          }

          // Actualizar e integrar temporizadores de power-ups
          this.updatePowerupTimers(dt);
        }

        jump() {
          const onGround = this.player.body.touching.down;
          if (onGround && !this.hasJetpack) {
            this.player.setVelocityY(-460);
            soundSynth.playJump();
            
            // Partículas de polvo de salto
            this.spawnImpactParticles(this.player.x, this.player.y + 20, 0x06b6d4, 6);
          }
        }

        startDuck() {
          if (!this.hasJetpack && this.player.body.touching.down) {
            this.player.body.setSize(30, 24);
            this.player.body.setOffset(9, 24);
            
            // Frame o escala visual reducida
            this.player.setScale(1, 0.5);
            
            if (this.cursors?.down?.isDown && Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
              soundSynth.playSlide();
            }
          }
        }

        stopDuck() {
          if (this.player.scaleY === 0.5) {
            this.player.body.setSize(30, 48);
            this.player.body.setOffset(9, 0);
            this.player.setScale(1, 1);
          }
        }

        // Spawn de Obstáculos Dinámicos
        spawnObstacle() {
          if (this.isPlayerDead) return;

          const { width, height } = this.scale;
          
          // Tipos: 0 (bajo, saltar), 1 (alto, agacharse), 2 (medio, requiere precisión)
          const type = Phaser.Math.Between(0, 1);
          let obstacle: Phaser.Physics.Arcade.Sprite;

          if (type === 0) {
            // Obstáculo en el suelo (caja roja)
            obstacle = this.obstaclesGroup.create(width + 50, height - 70, "tex_box");
            if (obstacle.body) obstacle.body.setSize(32, 32);
          } else {
            // Drone o rayo alto (requiere agacharse)
            obstacle = this.obstaclesGroup.create(width + 50, height - 120, "tex_drone");
            if (obstacle.body) obstacle.body.setSize(26, 26);
            
            // Animación flotante ligera
            this.tweens.add({
              targets: obstacle,
              y: height - 130,
              duration: 800,
              yoyo: true,
              repeat: -1
            });
          }

          obstacle.setDepth(8);
        }

        // Spawn de líneas de monedas en arco u ondas
        spawnCoinLine() {
          if (this.isPlayerDead) return;

          const { width, height } = this.scale;
          const numCoins = Phaser.Math.Between(3, 5);
          const pattern = Phaser.Math.Between(0, 1); // 0: arco, 1: línea recta
          
          const baseY = this.hasJetpack ? 120 : height - Phaser.Math.Between(80, 160);

          for (let i = 0; i < numCoins; i++) {
            let coinX = width + 50 + i * 35;
            let coinY = baseY;

            if (pattern === 0) {
              // Arco matemático
              coinY = baseY - Math.sin((i / (numCoins - 1)) * Math.PI) * 45;
            }

            const coin = this.coinsGroup.create(coinX, coinY, "tex_coin");
            coin.body.setAllowGravity(false);
            coin.body.setSize(16, 16);
            
            // Rotación 3D simulada por escala
            this.tweens.add({
              targets: coin,
              scaleX: 0.1,
              duration: 400,
              yoyo: true,
              repeat: -1
            });
          }
        }

        // Spawn aleatorio de Powerups
        spawnPowerup() {
          if (this.isPlayerDead) return;

          const { width, height } = this.scale;
          // Tipos: shield, magnet, multiplier, jetpack
          const types = ["shield", "magnet", "multiplier", "jetpack"];
          const type = Phaser.Math.RND.pick(types);

          const powerup = this.powerupsGroup.create(
            width + 50,
            height - Phaser.Math.Between(100, 180),
            `tex_power_${type}`
          );
          
          powerup.body.setAllowGravity(false);
          powerup.setData("type", type);

          // Animación de rebote flotante
          this.tweens.add({
            targets: powerup,
            y: powerup.y - 15,
            duration: 1000,
            yoyo: true,
            repeat: -1
          });
        }

        // Recolección de Moneda
        collectCoin(player: any, coin: any) {
          coin.destroy();
          soundSynth.playCoin();
          
          const coinValue = this.hasMultiplier ? 2 : 1;
          this.coinsCollected += coinValue;

          // Sumar score extra al recoger moneda
          this.score += 50 * coinValue;

          // Explosión de chispas doradas
          this.spawnImpactParticles(coin.x, coin.y, 0xf59e0b, 5);
        }

        // Activación de Power-Up
        collectPowerup(player: any, powerup: any) {
          const type = powerup.getData("type");
          powerup.destroy();
          soundSynth.playPowerup();

          // Destello en pantalla
          this.cameras.main.flash(150, 6, 182, 212);

          const DURATION = 10; // Segundos

          if (type === "shield") {
            this.hasShield = true;
            this.shieldTimer = DURATION;
            this.player.setTint(0x22d3ee); // Brillo cyan
          } else if (type === "magnet") {
            this.hasMagnet = true;
            this.magnetTimer = DURATION;
          } else if (type === "multiplier") {
            this.hasMultiplier = true;
            this.multiplierTimer = DURATION;
          } else if (type === "jetpack") {
            this.hasJetpack = true;
            this.jetpackTimer = 8; // Vuelo de 8 segundos
            this.player.setTint(0xeab308); // Brillo dorado
          }
        }

        // Choque con obstáculos
        hitObstacle(player: any, obstacle: any) {
          if (this.isPlayerDead) return;

          if (this.hasShield) {
            // Destruir obstáculo y consumir escudo
            obstacle.destroy();
            this.hasShield = false;
            this.shieldTimer = 0;
            this.player.clearTint();
            soundSynth.playExplosion();
            this.cameras.main.shake(200, 0.015);
            this.spawnImpactParticles(obstacle.x, obstacle.y, 0xef4444, 15);
            return;
          }

          if (this.hasJetpack) {
            // El jetpack es invulnerable
            obstacle.destroy();
            return;
          }

          // Morir
          this.isPlayerDead = true;
          soundSynth.playExplosion();
          this.cameras.main.shake(300, 0.025);
          
          this.spawnImpactParticles(player.x, player.y, 0xef4444, 25);
          this.physics.pause();
          this.player.setVisible(false);
          this.particlesEmitter.stop();

          // Retardo para abrir UI de Game Over
          this.time.delayedCall(800, () => {
            onGameOver({
              score: Math.floor(this.score),
              coins: this.coinsCollected,
              distance: Math.floor(this.distanceRun)
            });
          });
        }

        // Continuar partida tras ver un anuncio recompensado (Revivir)
        revive() {
          this.isPlayerDead = false;
          this.physics.resume();
          this.player.setVisible(true);
          this.player.setPosition(150, this.scale.height - 120);
          this.player.setVelocity(0, 0);
          this.particlesEmitter.start();

          // Otorgar escudo de invulnerabilidad temporal
          this.hasShield = true;
          this.shieldTimer = 4; // 4 segundos de escudo gratis
          this.player.setTint(0x22d3ee);

          // Limpiar todos los obstáculos activos en pantalla
          this.obstaclesGroup.clear(true, true);

          // Flash verde/cyan de resurrección
          this.cameras.main.flash(300, 16, 185, 129);
        }

        // Auxiliares de partículas
        spawnImpactParticles(x: number, y: number, color: number, count: number) {
          const emitter = (this.add as any).particles(x, y, "tex_spark", {
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.6, end: 0 },
            blendMode: "ADD",
            lifespan: 500,
            quantity: count,
            tint: color
          });
          this.time.delayedCall(500, () => emitter.destroy());
        }

        updatePowerupTimers(dt: number) {
          const { width } = this.scale;
          
          if (this.shieldTimer > 0) {
            this.shieldTimer -= dt;
            if (this.shieldTimer <= 0) {
              this.hasShield = false;
              this.player.clearTint();
            }
          }
          if (this.magnetTimer > 0) {
            this.magnetTimer -= dt;
            if (this.magnetTimer <= 0) this.hasMagnet = false;
          }
          if (this.multiplierTimer > 0) {
            this.multiplierTimer -= dt;
            if (this.multiplierTimer <= 0) this.hasMultiplier = false;
          }
          if (this.jetpackTimer > 0) {
            this.jetpackTimer -= dt;
            if (this.jetpackTimer <= 0) {
              this.hasJetpack = false;
              this.player.clearTint();
            }
          }

          // Dibujar barras del HUD
          this.drawHUD();
        }

        drawHUD() {
          // Limpiar HUD anterior
          this.shieldIcon.clear();
          this.magnetIcon.clear();
          this.multiplierIcon.clear();
          this.jetpackIcon.clear();

          let drawIndex = 0;
          const drawBar = (graphics: Phaser.GameObjects.Graphics, timer: number, color: number, name: string) => {
            if (timer <= 0) {
              graphics.setVisible(false);
              return;
            }
            graphics.setVisible(true);
            const x = 16;
            const y = 60 + drawIndex * 24;
            const w = 120;
            const h = 8;
            
            // Fondo
            graphics.fillStyle(0x0f172a, 0.6);
            graphics.fillRoundedRect(x, y, w, h, 2);
            // Progreso
            graphics.fillStyle(color, 1);
            graphics.fillRoundedRect(x, y, w * (timer / 10), h, 2);
            
            drawIndex++;
          };

          drawBar(this.shieldIcon, this.shieldTimer, 0x06b6d4, "SHIELD");
          drawBar(this.magnetIcon, this.magnetTimer, 0xec4899, "MAGNET");
          drawBar(this.multiplierIcon, this.multiplierTimer, 0x10b981, "X2");
          drawBar(this.jetpackIcon, this.jetpackTimer, 0xeab308, "JETPACK");
        }

        cleanupObjects() {
          this.obstaclesGroup.getChildren().forEach((obs: any) => {
            if (obs.x < -100) obs.destroy();
          });
          this.coinsGroup.getChildren().forEach((coin: any) => {
            if (coin.x < -100) coin.destroy();
          });
          this.powerupsGroup.getChildren().forEach((pw: any) => {
            if (pw.x < -100) pw.destroy();
          });
        }

        // Generador de Texturas vectoriales a nivel de código
        createProceduralTextures() {
          const generateTexture = (key: string, drawFn: (graphics: Phaser.GameObjects.Graphics) => void, w: number, h: number) => {
            if (this.textures.exists(key)) return;
            const graphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
            drawFn(graphics);
            graphics.generateTexture(key, w, h);
            graphics.destroy();
          };

          // Chispas / Partículas
          generateTexture("tex_spark", (g) => {
            g.fillStyle(0xffffff, 1);
            g.fillCircle(4, 4, 4);
          }, 8, 8);

          // Monedas
          generateTexture("tex_coin", (g) => {
            g.fillStyle(0xeab308, 1);
            g.fillCircle(12, 12, 10);
            g.lineStyle(2, 0xfef08a, 1);
            g.strokeCircle(12, 12, 10);
            g.fillStyle(0xfef08a, 1);
            g.fillRect(10, 8, 4, 8);
          }, 24, 24);

          // Obstáculo Caja
          generateTexture("tex_box", (g) => {
            g.fillStyle(0xd97706, 1);
            g.fillRect(0, 0, 32, 32);
            g.lineStyle(2, 0xef4444, 1);
            g.strokeRect(1, 1, 30, 30);
            // Rayas de advertencia
            g.lineStyle(3, 0xef4444, 0.7);
            g.lineBetween(4, 4, 28, 28);
            g.lineBetween(4, 28, 28, 4);
          }, 32, 32);

          // Obstáculo Drone / Alta Dificultad
          generateTexture("tex_drone", (g) => {
            g.fillStyle(0xef4444, 1);
            g.fillTriangle(13, 0, 0, 20, 26, 20); // Triángulo rojo que brilla
            g.fillStyle(0xff3b30, 1);
            g.fillCircle(13, 10, 4);
            g.lineStyle(1.5, 0xffffff, 1);
            g.lineBetween(0, 10, 26, 10);
          }, 26, 26);

          // Personaje Jugador
          generateTexture("tex_player", (g) => {
            let coreColor = 0x06b6d4; // Cyan por defecto
            let boardColor = 0x22d3ee;
            if (currentSkin === "cyber_runner") {
              coreColor = 0xdb2777; // Rosa
              boardColor = 0xf472b6;
            } else if (currentSkin === "neon_runner") {
              coreColor = 0x059669; // Esmeralda
              boardColor = 0x34d399;
            } else if (currentSkin === "gold_runner") {
              coreColor = 0xd97706; // Dorado
              boardColor = 0xfbbf24;
            }

            // Cuerpo estilizado (Glow Cyborg)
            g.fillStyle(coreColor, 1);
            g.fillRoundedRect(12, 10, 24, 34, 6);
            
            // Visera brillante
            g.fillStyle(0xffffff, 1);
            g.fillRect(20, 14, 16, 6);
            
            // Hoverboard abajo
            g.fillStyle(boardColor, 1);
            g.fillRoundedRect(4, 44, 40, 4, 2);
          }, 48, 48);

          // Texturas de fondos (Estrellas lejanas, Ciudad, Suelo)
          generateTexture("tex_stars", (g) => {
            g.fillStyle(0x020617, 1);
            g.fillRect(0, 0, 128, 128);
            g.fillStyle(0x334155, 0.4);
            // Pequeñas motas estelares
            g.fillCircle(16, 24, 1);
            g.fillCircle(85, 45, 1.5);
            g.fillCircle(50, 90, 1);
            g.fillCircle(110, 105, 1.2);
          }, 128, 128);

          generateTexture("tex_city", (g) => {
            g.fillStyle(0x000000, 0); // Transparente
            g.fillRect(0, 0, 256, 450);
            
            // Siluetas de rascacielos
            g.fillStyle(0x090d16, 0.8);
            g.fillRect(10, 180, 50, 270);
            g.fillRect(70, 120, 60, 330);
            g.fillRect(140, 210, 45, 240);
            g.fillRect(195, 150, 50, 300);

            // Ventanas brillando ligeramente
            g.fillStyle(0x1e293b, 0.8);
            g.fillRect(20, 200, 10, 10);
            g.fillRect(20, 230, 10, 10);
            g.fillRect(90, 140, 15, 15);
            g.fillRect(90, 170, 15, 15);
            g.fillRect(210, 180, 10, 10);
          }, 256, 450);

          generateTexture("tex_hills", (g) => {
            g.fillStyle(0x000000, 0);
            g.fillRect(0, 0, 512, 450);

            // Líneas cyberpunk que dan profundidad de perspectiva
            g.fillStyle(0x0b1329, 0.85);
            g.beginPath();
            g.moveTo(0, 320);
            g.lineTo(120, 280);
            g.lineTo(260, 310);
            g.lineTo(390, 270);
            g.lineTo(512, 300);
            g.lineTo(512, 450);
            g.lineTo(0, 450);
            g.closePath();
            g.fill();
          }, 512, 450);

          generateTexture("tex_ground", (g) => {
            // Suelo cyberpunk con rejillas neon
            g.fillStyle(0x0b0e14, 1);
            g.fillRect(0, 0, 64, 48);
            g.fillStyle(0x1e293b, 1);
            g.fillRect(0, 0, 64, 4); // Línea superior
            
            // Línea neon central
            g.fillStyle(0x06b6d4, 0.4);
            g.fillRect(0, 2, 64, 2);

            // Rejillas diagonales
            g.lineStyle(1.5, 0x1e293b, 1);
            g.lineBetween(16, 4, 32, 48);
            g.lineBetween(48, 4, 64, 48);
          }, 64, 48);

          // Powerups
          const drawPowerupIcon = (color: number, symbol: string) => {
            return (g: Phaser.GameObjects.Graphics) => {
              g.fillStyle(color, 0.2);
              g.fillCircle(16, 16, 15);
              g.lineStyle(2, color, 1);
              g.strokeCircle(16, 16, 14);
              g.fillStyle(color, 1);
              // Dibujar un rayo o forma interior básica
              if (symbol === "S") { // Escudo
                g.fillTriangle(16, 6, 8, 14, 24, 14);
                g.fillRect(11, 14, 10, 8);
              } else if (symbol === "M") { // Imán
                g.fillRect(10, 10, 4, 12);
                g.fillRect(18, 10, 4, 12);
                g.fillRect(10, 20, 12, 4);
              } else if (symbol === "X") { // Multiplicador
                g.fillRect(14, 8, 4, 16);
                g.fillRect(8, 14, 16, 4);
              } else { // Jetpack
                g.fillTriangle(16, 6, 10, 24, 22, 24);
              }
            };
          };

          generateTexture("tex_power_shield", drawPowerupIcon(0x06b6d4, "S"), 32, 32);
          generateTexture("tex_power_magnet", drawPowerupIcon(0xec4899, "M"), 32, 32);
          generateTexture("tex_power_multiplier", drawPowerupIcon(0x10b981, "X"), 32, 32);
          generateTexture("tex_power_jetpack", drawPowerupIcon(0xeab308, "J"), 32, 32);
        }
      }

      // Configuración de Phaser
      const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 400,
        parent: parentRef.current,
        backgroundColor: "#020617",
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        },
        physics: {
          default: "arcade",
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
          }
        },
        scene: [GameplayScene]
      };

      const game = new Phaser.Game(config);
      phaserGame = game;
      gameRef.current = game;
    });

    return () => {
      isDestroyed = true;
      if (phaserGame) {
        phaserGame.destroy(true);
      }
    };
  }, [currentSkin]);

  // Manejar el trigger de Revivir desde el componente padre React
  useEffect(() => {
    if (triggerRevive && gameRef.current) {
      const activeScene = gameRef.current.scene.keys.GameplayScene;
      if (activeScene && activeScene.isPlayerDead) {
        activeScene.revive();
        onReviveComplete();
      }
    }
  }, [triggerRevive]);

  // Manejar el trigger de Reiniciar desde el componente padre React
  useEffect(() => {
    if (triggerRestart && gameRef.current) {
      const activeScene = gameRef.current.scene.keys.GameplayScene;
      if (activeScene) {
        activeScene.scene.restart();
        onRestartComplete();
      }
    }
  }, [triggerRestart]);

  return (
    <div className="relative w-full h-full">
      {/* Botón de Sonido en Pantalla */}
      <button
        onClick={() => {
          const next = !soundEnabled;
          setSoundEnabled(next);
          soundSynth.toggleSound(next);
        }}
        className="absolute top-4 right-4 z-30 bg-slate-900/80 hover:bg-slate-800 border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1.5"
      >
        {soundEnabled ? (
          <>
            <Zap className="w-3 h-3 text-cyan-400 fill-current animate-pulse" />
            Sonido Activo
          </>
        ) : (
          <>
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            Mutado
          </>
        )}
      </button>

      {/* Contenedor del Canvas de Phaser */}
      <div
        ref={parentRef}
        className="w-full max-w-full max-h-full aspect-[2/1] rounded-3xl overflow-hidden border border-white/10 bg-[#020617] shadow-2xl shadow-cyan-500/5 relative"
        style={{ contentVisibility: "auto" }}
      >
        {/* Indicadores flotantes de controles en móvil */}
        <div className="absolute inset-x-0 bottom-3 z-20 flex justify-between px-4 pointer-events-none md:hidden opacity-40">
          <div className="bg-slate-950/80 px-3 py-1 rounded-full text-[8px] font-bold text-slate-400 uppercase tracking-widest">
            Toca Mitad Izq: Agacharse
          </div>
          <div className="bg-slate-950/80 px-3 py-1 rounded-full text-[8px] font-bold text-slate-400 uppercase tracking-widest">
            Toca Mitad Der: Saltar
          </div>
        </div>
      </div>
    </div>
  );
}

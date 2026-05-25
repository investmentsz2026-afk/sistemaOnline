"use client";

import { useEffect, useRef, useState } from "react";
import { soundSynth } from "@/components/games/RunnerGame";
import { Zap, Shield, HelpCircle, Eye } from "lucide-react";

interface JumpGameProps {
  level: number;
  onGameOver: (stats: { score: number; coins: number; gravityFlips: number }) => void;
  onGameActive: () => void;
  activeBooster: string | null;
  onBoosterUsed: () => void;
  triggerRestart: boolean;
  onRestartComplete: () => void;
}

export default function JumpGame({
  level,
  onGameOver,
  onGameActive,
  activeBooster,
  onBoosterUsed,
  triggerRestart,
  onRestartComplete
}: JumpGameProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<any>(null);
  const [soundEnabled, setSoundEnabled] = useState(soundSynth.isSoundEnabled());

  useEffect(() => {
    if (typeof window === "undefined" || !parentRef.current) return;

    let isDestroyed = false;
    let phaserGame: any = null;

    import("phaser").then((Phaser) => {
      if (isDestroyed) return;

      const GAME_WIDTH = 640;
      const GAME_HEIGHT = 360;
      const SCROLL_SPEED = 200 + level * 10; // Velocidad progresiva

      class JumpScene extends Phaser.Scene {
        // Personaje y físicas
        player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | null = null;
        platforms: Phaser.Physics.Arcade.StaticGroup | null = null;
        spikes: Phaser.Physics.Arcade.StaticGroup | null = null;
        portals: Phaser.Physics.Arcade.StaticGroup | null = null;
        coins: Phaser.Physics.Arcade.Group | null = null;

        // Parámetros de nivel
        levelLength = 2000 + level * 500; // Largo del nivel en px
        isGravityInverted = false;
        hasShield = false;
        checkpointX: number | null = null;
        checkpointY: number | null = null;
        gravityFlips = 0;
        coinsEarned = 0;
        score = 0;
        isFinished = false;

        // Entrada
        pointerDown = false;

        // HUD / Estética
        progressLine: Phaser.GameObjects.Graphics | null = null;
        shieldEffect: Phaser.GameObjects.Graphics | null = null;

        constructor() {
          super("JumpScene");
        }

        preload() {
          this.createProceduralTextures();
        }

        create() {
          onGameActive();
          this.physics.world.setBounds(0, 0, this.levelLength + 200, GAME_HEIGHT);
          this.physics.world.gravity.y = 1000;

          this.isGravityInverted = false;
          this.hasShield = false;
          this.checkpointX = null;
          this.checkpointY = null;
          this.gravityFlips = 0;
          this.coinsEarned = 0;
          this.score = 0;
          this.isFinished = false;

          // Fondo Parallax Neón
          this.add.grid(this.levelLength / 2, GAME_HEIGHT / 2, this.levelLength, GAME_HEIGHT, 40, 40, 0x020617, 1, 0x1e293b, 0.1);

          // Crear plataformas del suelo y techo
          this.platforms = this.physics.add.staticGroup();
          this.spikes = this.physics.add.staticGroup();
          this.portals = this.physics.add.staticGroup();
          this.coins = this.physics.add.group();

          // Sólidos base
          this.generateLevelGeometry();

          // Crear jugador (el cubo brillante)
          this.createPlayer();

          // Línea de progreso superior
          this.progressLine = this.add.graphics();
          this.progressLine.setScrollFactor(0);
          this.progressLine.setDepth(150);

          // Escudo visual
          this.shieldEffect = this.add.graphics();
          this.shieldEffect.setDepth(110);

          // Colisiones
          if (this.player && this.platforms) {
            this.physics.add.collider(this.player, this.platforms, this.handlePlatformContact, undefined, this);
          }
          if (this.player && this.spikes) {
            this.physics.add.overlap(this.player, this.spikes, this.handleSpikeCollision, undefined, this);
          }
          if (this.player && this.portals) {
            this.physics.add.overlap(this.player, this.portals, this.handlePortalCollision, undefined, this);
          }
          if (this.player && this.coins) {
            this.physics.add.overlap(this.player, this.coins, this.handleCoinCollision, undefined, this);
          }

          // Cámara sigue al jugador
          this.cameras.main.setBounds(0, 0, this.levelLength + 200, GAME_HEIGHT);
          this.cameras.main.startFollow(this.player!, true, 1, 0, -100, 0);

          // Entrada de salto/flip (clic o toque en pantalla)
          this.input.on("pointerdown", this.jump, this);
          
          // Soporte para barra espaciadora
          if (this.input.keyboard) {
            this.input.keyboard.on("keydown-SPACE", this.jump, this);
          }
        }

        update() {
          if (this.isFinished || !this.player) return;

          // Movimiento automático hacia adelante (Geometry Dash style)
          this.player.body.setVelocityX(SCROLL_SPEED);

          // Rotación constante del cubo en el aire
          if (!this.player.body.touching.down && !this.player.body.touching.up) {
            this.player.angle += this.isGravityInverted ? -4 : 4;
          } else {
            // Alinear al suelo al aterrizar
            const targetAngle = 0;
            this.player.angle = Phaser.Math.Linear(this.player.angle, targetAngle, 0.2);
          }

          // Pintar la línea de progreso en el HUD
          this.drawProgressHUD();

          // Renderizar el escudo protector
          this.drawShieldHUD();

          // Validar si llegó a la meta
          if (this.player.x >= this.levelLength) {
            this.levelWon();
          }

          // Validar caída al abismo
          if (this.player.y > GAME_HEIGHT + 50 || this.player.y < -50) {
            this.triggerGameOver();
          }
        }

        jump() {
          if (this.isFinished || !this.player) return;

          // Jump or invert physics according to gravity
          if (this.isGravityInverted) {
            if (this.player.body.touching.up) {
              this.player.body.setVelocityY(420); // Impulso hacia abajo
              soundSynth.playJump();
            }
          } else {
            if (this.player.body.touching.down) {
              this.player.body.setVelocityY(-420); // Impulso hacia arriba
              soundSynth.playJump();
            }
          }
        }

        // Generar obstáculos de forma procedural basados en la dificultad del nivel
        generateLevelGeometry() {
          // Suelo base continuo
          for (let x = 0; x < this.levelLength + 200; x += 120) {
            // Suelo
            this.platforms!.create(x + 60, GAME_HEIGHT - 10, "tex_block").setScale(3, 0.5).refreshBody();
            // Techo
            this.platforms!.create(x + 60, 10, "tex_block").setScale(3, 0.5).refreshBody();
          }

          // Generar obstáculos a lo largo de la pista
          let cursorX = 400;
          while (cursorX < this.levelLength - 200) {
            // Elegir un obstáculo aleatorio: 0=Spike simple, 1=Doble Spike, 2=Portal Gravedad, 3=Plataforma flotante + Spike
            const type = Phaser.Math.Between(0, 3);
            
            if (type === 0) {
              // Spike en el suelo
              this.spikes!.create(cursorX, GAME_HEIGHT - 30, "tex_spike").refreshBody();
              cursorX += Phaser.Math.Between(250, 450);
            } else if (type === 1) {
              // Doble Spike (exige salto preciso)
              this.spikes!.create(cursorX, GAME_HEIGHT - 30, "tex_spike").refreshBody();
              this.spikes!.create(cursorX + 24, GAME_HEIGHT - 30, "tex_spike").refreshBody();
              cursorX += Phaser.Math.Between(300, 500);
            } else if (type === 2) {
              // Portal de Gravedad Inversa + Spike en el techo posterior
              this.portals!.create(cursorX, GAME_HEIGHT / 2, "tex_portal").refreshBody();
              // Spike en el techo
              this.spikes!.create(cursorX + 150, 30, "tex_spike").setAngle(180).refreshBody();
              cursorX += Phaser.Math.Between(350, 550);
            } else {
              // Plataforma flotante con monedas encima
              this.platforms!.create(cursorX, GAME_HEIGHT - 80, "tex_block").setScale(1.5, 0.5).refreshBody();
              
              // Monedas sobre la plataforma
              this.coins!.create(cursorX - 20, GAME_HEIGHT - 110, "tex_coin");
              this.coins!.create(cursorX + 20, GAME_HEIGHT - 110, "tex_coin");

              // Spike debajo o después de la plataforma
              this.spikes!.create(cursorX + 60, GAME_HEIGHT - 30, "tex_spike").refreshBody();
              cursorX += Phaser.Math.Between(350, 500);
            }
          }

          // Portal final al final del nivel
          this.add.sprite(this.levelLength, GAME_HEIGHT - 60, "tex_portal").setScale(1.5);
        }

        createPlayer() {
          this.player = this.physics.add.sprite(100, GAME_HEIGHT - 40, "tex_player") as any;
          this.player!.setCollideWorldBounds(false); // Permitimos caídas
          this.player!.setOrigin(0.5);
          
          // Estela de partículas de la nave
          const emitter = (this.add as any).particles(0, 0, "tex_spark", {
            speed: 15,
            scale: { start: 0.5, end: 0 },
            blendMode: "ADD",
            lifespan: 400,
            frequency: 40,
            tint: 0xfc03ba
          });
          emitter.startFollow(this.player);
        }

        handlePlatformContact() {
          // Aterrizó, restaurar ángulo
        }

        handleSpikeCollision(p: any, spike: any) {
          if (this.isFinished) return;

          // Si tiene escudo protector activo:
          if (this.hasShield) {
            this.hasShield = false;
            soundSynth.playExplosion();
            this.spawnImpactParticles(spike.x, spike.y, 0x22d3ee, 20);
            spike.destroy();
            return;
          }

          // Si no tiene escudo pero tiene un checkpoint activo:
          if (this.checkpointX !== null && this.checkpointY !== null) {
            soundSynth.playExplosion();
            this.spawnImpactParticles(this.player!.x, this.player!.y, 0xff003c, 25);
            this.player!.setPosition(this.checkpointX, this.checkpointY);
            
            // Re-invertir gravedad si es necesario para el checkpoint
            this.isGravityInverted = false;
            this.physics.world.gravity.y = 1000;
            this.player!.angle = 0;
            return;
          }

          this.triggerGameOver();
        }

        handlePortalCollision(p: any, portal: any) {
          // Evitar colisión reiterada instantánea (debounce)
          if ((portal as any).cooldown && (portal as any).cooldown > this.time.now) return;
          (portal as any).cooldown = this.time.now + 800;

          // Invertir Gravedad
          this.isGravityInverted = !this.isGravityInverted;
          this.physics.world.gravity.y = this.isGravityInverted ? -1000 : 1000;
          this.gravityFlips++;

          soundSynth.playSlide();

          // Efecto visual de partículas en el portal
          this.spawnImpactParticles(portal.x, portal.y, 0xfc03ba, 12);
          this.showFloatingText(this.player!.x, this.player!.y - 25, "¡GRAVEDAD FLIP!", 0xfc03ba);
        }

        handleCoinCollision(p: any, coin: any) {
          coin.destroy();
          soundSynth.playCoin();
          this.coinsEarned++;
          this.score += 100;
          this.spawnImpactParticles(coin.x, coin.y, 0xeab308, 6);
        }

        drawProgressHUD() {
          if (!this.progressLine || !this.player) return;

          this.progressLine.clear();
          
          // Fondo barra de progreso
          this.progressLine.fillStyle(0x1e293b, 1);
          this.progressLine.fillRect(40, 20, GAME_WIDTH - 80, 6);

          // Relleno barra de progreso
          const pct = Math.min(1, this.player.x / this.levelLength);
          this.progressLine.fillStyle(0x06b6d4, 1);
          this.progressLine.fillRect(40, 20, (GAME_WIDTH - 80) * pct, 6);

          // Texto porcentaje
          this.progressLine.lineStyle(1, 0xffffff, 0.1);
        }

        drawShieldHUD() {
          if (!this.shieldEffect || !this.player) return;
          this.shieldEffect.clear();

          if (this.hasShield) {
            this.shieldEffect.lineStyle(2.5, 0x22d3ee, 0.7);
            this.shieldEffect.strokeCircle(this.player.x, this.player.y, 22);
            
            // Brillo orbital
            this.shieldEffect.fillStyle(0x22d3ee, 0.1);
            this.shieldEffect.fillCircle(this.player.x, this.player.y, 22);
          }
        }

        levelWon() {
          this.isFinished = true;
          soundSynth.playPowerup();
          this.player!.body.setVelocity(0);

          this.showFloatingText(this.player!.x, this.player!.y - 30, "¡NIVEL COMPLETADO!", 0x00ff88);

          this.time.delayedCall(1200, () => {
            onGameOver({
              score: this.score + 1000, // Bono por terminar
              coins: this.coinsEarned + 30, // Bono monedas
              gravityFlips: this.gravityFlips
            });
          });
        }

        triggerGameOver() {
          this.isFinished = true;
          soundSynth.playExplosion();
          
          this.cameras.main.shake(200, 0.015);
          this.spawnImpactParticles(this.player!.x, this.player!.y, 0xff003c, 30);
          
          this.player!.setTint(0xff003c);
          this.physics.pause();

          this.time.delayedCall(1500, () => {
            onGameOver({
              score: this.score,
              coins: this.coinsEarned,
              gravityFlips: this.gravityFlips
            });
          });
        }

        // Activación de Boosters desde React
        useCheckpointBooster() {
          if (!this.player) return;
          this.checkpointX = this.player.x;
          this.checkpointY = this.player.y;
          
          this.showFloatingText(this.player.x, this.player.y - 30, "CHECKPOINT GUARDADO", 0x3b82f6);
          soundSynth.playCoin();
          
          // Crear un marcador de bandera visual temporal
          const flag = this.add.graphics();
          flag.lineStyle(2.5, 0x3b82f6, 1);
          flag.fillStyle(0x3b82f6, 0.4);
          flag.fillRect(this.player.x - 10, this.player.y - 30, 20, 30);
        }

        useShieldBooster() {
          this.hasShield = true;
          this.showFloatingText(this.player!.x, this.player!.y - 30, "ESCUDO ACTIVADO", 0x22d3ee);
          soundSynth.playPowerup();
        }

        useSlowMoBooster() {
          this.physics.world.timeScale = 2.0; // Física a la mitad de velocidad
          this.showFloatingText(this.player!.x, this.player!.y - 30, "CÁMARA LENTA", 0xeab308);
          soundSynth.playSlide();

          // Duración de 6 segundos
          this.time.delayedCall(6000, () => {
            if (this.sys.isActive()) {
              this.physics.world.timeScale = 1.0;
              this.showFloatingText(this.player!.x, this.player!.y - 30, "VELOCIDAD NORMAL", 0xffffff);
            }
          });
        }

        spawnImpactParticles(x: number, y: number, color: number, count: number) {
          const emitter = (this.add as any).particles(x, y, "tex_spark", {
            speed: { min: 30, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.6, end: 0 },
            blendMode: "ADD",
            lifespan: 500,
            quantity: count,
            tint: color
          });
          this.time.delayedCall(500, () => emitter.destroy());
        }

        showFloatingText(x: number, y: number, text: string, color: number) {
          const fontConfig = {
            fontFamily: "monospace",
            fontSize: "12px",
            fontWeight: "900",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3
          };

          const textObj = this.add.text(x, y, text, fontConfig);
          textObj.setOrigin(0.5);
          textObj.setTint(color);

          this.tweens.add({
            targets: textObj,
            y: y - 35,
            alpha: 0,
            duration: 800,
            onComplete: () => textObj.destroy()
          });
        }

        createProceduralTextures() {
          const generateTexture = (key: string, drawFn: (graphics: Phaser.GameObjects.Graphics) => void, w: number, h: number) => {
            if (this.textures.exists(key)) return;
            const graphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
            drawFn(graphics);
            graphics.generateTexture(key, w, h);
            graphics.destroy();
          };

          // Spark particles
          generateTexture("tex_spark", (g) => {
            g.fillStyle(0xffffff, 1);
            g.fillCircle(2, 2, 2);
          }, 4, 4);

          // Player: Glowing Cube
          generateTexture("tex_player", (g) => {
            g.fillStyle(0xfc03ba, 1); // Neon magenta cube
            g.fillRect(2, 2, 20, 20);
            g.lineStyle(2, 0xffffff, 0.9);
            g.strokeRect(2, 2, 20, 20);
            g.fillStyle(0xffffff, 0.4);
            g.fillRect(6, 6, 12, 4);
          }, 24, 24);

          // Standard Block / Ground
          generateTexture("tex_block", (g) => {
            g.fillStyle(0x0f172a, 1); // Dark blue slab
            g.fillRect(0, 0, 40, 40);
            g.lineStyle(1.5, 0x334155, 1);
            g.strokeRect(0, 0, 40, 40);
          }, 40, 40);

          // Spike (Danger Triangle)
          generateTexture("tex_spike", (g) => {
            g.fillStyle(0x06b6d4, 1); // Cyan neon spike
            g.fillTriangle(12, 2, 2, 22, 22, 22);
            g.lineStyle(1.5, 0xffffff, 0.7);
            g.strokeTriangle(12, 2, 2, 22, 22, 22);
          }, 24, 24);

          // Gravity Portal (Oval outline with gradient effect)
          generateTexture("tex_portal", (g) => {
            g.lineStyle(3, 0xfc03ba, 1);
            g.strokeEllipse(16, 24, 12, 20);
            g.fillStyle(0xfc03ba, 0.25);
            g.fillEllipse(16, 24, 8, 16);
          }, 32, 48);

          // Coin (Golden circle)
          generateTexture("tex_coin", (g) => {
            g.fillStyle(0xeab308, 1);
            g.fillCircle(10, 10, 8);
            g.lineStyle(1, 0xfff, 0.5);
            g.strokeCircle(10, 10, 8);
          }, 20, 20);
        }
      }

      const config = {
        type: Phaser.AUTO,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        parent: parentRef.current,
        backgroundColor: "#020617",
        physics: {
          default: "arcade",
          arcade: {
            gravity: { x: 0, y: 1000 },
            debug: false
          }
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: [JumpScene]
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
  }, [level]);

  // Aplicar Boosters desde React
  useEffect(() => {
    if (!activeBooster || !gameRef.current) return;

    const activeScene = gameRef.current.scene.keys.JumpScene;
    if (!activeScene) return;

    if (activeBooster === "checkpoint") {
      activeScene.useCheckpointBooster();
    } else if (activeBooster === "shield") {
      activeScene.useShieldBooster();
    } else if (activeBooster === "slowmo") {
      activeScene.useSlowMoBooster();
    }

    onBoosterUsed();
  }, [activeBooster]);

  // Reiniciar juego
  useEffect(() => {
    if (triggerRestart && gameRef.current) {
      const activeScene = gameRef.current.scene.keys.JumpScene;
      if (activeScene) {
        activeScene.scene.restart();
        onRestartComplete();
      }
    }
  }, [triggerRestart]);

  return (
    <div className="relative w-full h-full flex flex-col items-center">
      <button
        onClick={() => {
          const next = !soundEnabled;
          setSoundEnabled(next);
          soundSynth.toggleSound(next);
        }}
        className="absolute top-4 right-4 z-30 bg-slate-900/80 hover:bg-slate-800 border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1.5"
      >
        {soundEnabled ? "Sonido Activo" : "Mutado"}
      </button>

      <div
        ref={parentRef}
        className="w-full aspect-[16/9] rounded-3xl overflow-hidden border border-white/10 bg-[#020617] shadow-2xl relative"
        style={{ contentVisibility: "auto" }}
      />
    </div>
  );
}

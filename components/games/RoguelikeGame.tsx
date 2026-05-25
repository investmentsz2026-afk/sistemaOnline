"use client";

import { useEffect, useRef, useState } from "react";
import { soundSynth } from "@/components/games/RunnerGame";
import { Zap, Heart, Shield, Swords, Sparkles } from "lucide-react";

interface RoguelikeGameProps {
  level: number;
  onGameOver: (stats: { score: number; coins: number; kills: number; chestsOpened: number; floorReached: number }) => void;
  onGameActive: () => void;
  activeBooster: string | null;
  onBoosterUsed: () => void;
  triggerRestart: boolean;
  onRestartComplete: () => void;
}

export default function RoguelikeGame({
  level,
  onGameOver,
  onGameActive,
  activeBooster,
  onBoosterUsed,
  triggerRestart,
  onRestartComplete
}: RoguelikeGameProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<any>(null);
  const [soundEnabled, setSoundEnabled] = useState(soundSynth.isSoundEnabled());

  useEffect(() => {
    if (typeof window === "undefined" || !parentRef.current) return;

    let isDestroyed = false;
    let phaserGame: any = null;

    import("phaser").then((Phaser) => {
      if (isDestroyed) return;

      const MAP_SIZE = 1200; // Ancho y alto de la mazmorra total
      const VIEW_WIDTH = 550;
      const VIEW_HEIGHT = 400;

      class RoguelikeScene extends Phaser.Scene {
        // Personaje y estadísticas
        player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | null = null;
        playerHealth = 100;
        playerMaxHealth = 100;
        playerAttack = 20 + level * 2;
        playerDefense = 0;
        
        // Grupos de físicas
        walls: Phaser.Physics.Arcade.StaticGroup | null = null;
        enemies: Phaser.Physics.Arcade.Group | null = null;
        chests: Phaser.Physics.Arcade.StaticGroup | null = null;
        portal: Phaser.Physics.Arcade.Sprite | null = null;
        bullets: Phaser.Physics.Arcade.Group | null = null;

        // Variables de nivel
        floor = 1;
        kills = 0;
        chestsOpened = 0;
        goldCollected = 0;
        score = 0;
        isGameOver = false;

        // Controles y Espacio de Ataque
        cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
        wasd: any = null;
        lastFacing: { x: number; y: number } = { x: 0, y: 1 };
        isAttacking = false;
        
        // HUD
        hudText: Phaser.GameObjects.Text | null = null;

        constructor() {
          super("RoguelikeScene");
        }

        preload() {
          this.createProceduralTextures();
        }

        create() {
          onGameActive();
          this.physics.world.setBounds(0, 0, MAP_SIZE, MAP_SIZE);

          this.floor = 1;
          this.kills = 0;
          this.chestsOpened = 0;
          this.goldCollected = 0;
          this.score = 0;
          this.playerHealth = this.playerMaxHealth;
          this.isGameOver = false;
          this.isAttacking = false;

          // Generar el laberinto/habitación
          this.buildDungeonMap();

          // Crear al jugador
          this.createPlayer();

          // Spawn de cofres, enemigos y portal en el piso
          this.spawnFloorEntities();

          // Configuración de la cámara
          this.cameras.main.setBounds(0, 0, MAP_SIZE, MAP_SIZE);
          this.cameras.main.startFollow(this.player!, true, 0.15, 0.15);

          // Configuración de teclado
          if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasd = this.input.keyboard.addKeys("W,A,S,D");
            
            // Tecla de ataque (Espacio o clic)
            this.input.keyboard.on("keydown-SPACE", this.performAttack, this);
          }

          this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            // Si hace clic en la mitad inferior derecha, simular botón de ataque en móviles
            if (pointer.x > VIEW_WIDTH - 100 && pointer.y > VIEW_HEIGHT - 100) {
              this.performAttack();
            } else {
              // De lo contrario mover el personaje o atacar en esa dirección
              this.performAttack();
            }
          }, this);

          // Colisiones
          if (this.player && this.walls) {
            this.physics.add.collider(this.player, this.walls);
          }
          if (this.enemies && this.walls) {
            this.physics.add.collider(this.enemies, this.walls);
          }
          if (this.player && this.enemies) {
            this.physics.add.collider(this.player, this.enemies, this.handleEnemyPush, undefined, this);
          }

          // Crear texto flotante HUD
          this.hudText = this.add.text(16, 16, "", {
            fontFamily: "monospace",
            fontSize: "12px",
            fontStyle: "bold",
            color: "#00ff88"
          }).setScrollFactor(0).setDepth(200);

          // Crear controles táctiles visuales sencillos para móviles
          this.drawVirtualControls();
        }

        update() {
          if (this.isGameOver || !this.player) return;

          // Movimiento del jugador
          const speed = 140;
          let vx = 0;
          let vy = 0;

          // Leer teclado (flechas o WASD)
          if (this.wasd.A.isDown || this.cursors?.left?.isDown) {
            vx = -speed;
            this.lastFacing = { x: -1, y: 0 };
          } else if (this.wasd.D.isDown || this.cursors?.right?.isDown) {
            vx = speed;
            this.lastFacing = { x: 1, y: 0 };
          }

          if (this.wasd.W.isDown || this.cursors?.up?.isDown) {
            vy = -speed;
            this.lastFacing = { x: 0, y: -1 };
          } else if (this.wasd.S.isDown || this.cursors?.down?.isDown) {
            vy = speed;
            this.lastFacing = { x: 0, y: 1 };
          }

          this.player.body.setVelocity(vx, vy);

          // Animar rotación del sprite sutilmente según la velocidad
          if (vx !== 0 || vy !== 0) {
            this.player.setScale(this.lastFacing.x < 0 ? -1 : 1, 1);
            this.player.angle = Math.sin(this.time.now / 50) * 8;
          } else {
            this.player.angle = 0;
          }

          // Movimiento inteligente de enemigos hacia el jugador si están cerca
          this.moveEnemiesTowardPlayer();

          // Verificar colisión con el portal
          if (this.portal) {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.portal.x, this.portal.y);
            if (dist < 28) {
              this.advanceFloor();
            }
          }

          // Actualizar textos HUD
          this.hudText!.setText(
            `PISO: ${this.floor}/5 | HP: ${Math.round(this.playerHealth)}/${this.playerMaxHealth} | ORO: ${this.goldCollected} | KILLS: ${this.kills}`
          );
        }

        // Generación procedural de habitaciones conectadas por corredores
        buildDungeonMap() {
          this.walls = this.physics.add.staticGroup();

          // Pintar suelo de fondo con cuadrícula
          this.add.grid(MAP_SIZE / 2, MAP_SIZE / 2, MAP_SIZE, MAP_SIZE, 60, 60, 0x090d16, 1, 0x1e293b, 0.1);

          // Bordes de la mazmorra
          for (let x = 0; x < MAP_SIZE; x += 40) {
            this.walls!.create(x + 20, 20, "tex_wall").refreshBody();
            this.walls!.create(x + 20, MAP_SIZE - 20, "tex_wall").refreshBody();
          }
          for (let y = 40; y < MAP_SIZE - 40; y += 40) {
            this.walls!.create(20, y + 20, "tex_wall").refreshBody();
            this.walls!.create(MAP_SIZE - 20, y + 20, "tex_wall").refreshBody();
          }

          // Crear 5 habitaciones procedurales rectangulares
          const rooms = [
            { x: 100, y: 100, w: 200, h: 200 },
            { x: 500, y: 150, w: 240, h: 200 },
            { x: 800, y: 200, w: 220, h: 220 },
            { x: 200, y: 600, w: 250, h: 220 },
            { x: 700, y: 700, w: 300, h: 300 }
          ];

          // Bloquear espacio intermedio de habitaciones (dejar libre el interior)
          // Generamos paredes fuera del interior de las habitaciones
          rooms.forEach((room, idx) => {
            // Dibujar decorados en las esquinas interiores
            const light = this.add.graphics();
            light.fillStyle(0x06b6d4, 0.05);
            light.fillRect(room.x, room.y, room.w, room.h);
            
            // Añadir bloques divisorios o columnas
            this.walls!.create(room.x + 40, room.y + 40, "tex_pillar").refreshBody();
            this.walls!.create(room.x + room.w - 40, room.y + 40, "tex_pillar").refreshBody();
            this.walls!.create(room.x + 40, room.y + room.h - 40, "tex_pillar").refreshBody();
            this.walls!.create(room.x + room.w - 40, room.y + room.h - 40, "tex_pillar").refreshBody();
          });
        }

        createPlayer() {
          // Iniciar en la primera habitación
          this.player = this.physics.add.sprite(200, 200, "tex_hero") as any;
          this.player!.setCollideWorldBounds(true);
          this.player!.body.setSize(24, 24);
        }

        spawnFloorEntities() {
          // Reiniciar grupos
          if (this.enemies) this.enemies.clear(true, true);
          else this.enemies = this.physics.add.group();

          if (this.chests) this.chests.clear(true, true);
          else this.chests = this.physics.add.staticGroup();

          if (this.portal) this.portal.destroy();

          // Spawn de 4 cofres en habitaciones aleatorias
          const roomPoints = [
            { x: 550, y: 200 },
            { x: 900, y: 300 },
            { x: 300, y: 700 },
            { x: 850, y: 800 }
          ];

          roomPoints.forEach((p, idx) => {
            const chest = this.chests!.create(p.x, p.y, "tex_chest");
            chest.setData("opened", false);
          });

          // Spawn de enemigos cerca de los cofres
          roomPoints.forEach((p, idx) => {
            // Enemigos tipo Slime (Rojo/Verde)
            for (let i = 0; i < 2; i++) {
              const ex = p.x + Phaser.Math.Between(-80, 80);
              const ey = p.y + Phaser.Math.Between(-80, 80);
              const type = Phaser.Math.Between(0, 1); // 0=Slime, 1=Bat
              
              const enemy = this.enemies!.create(ex, ey, type === 0 ? "tex_slime" : "tex_bat");
              enemy.setCollideWorldBounds(true);
              enemy.setData("health", 40 + this.floor * 10);
              enemy.setData("attack", 8 + this.floor * 2);
              enemy.setData("type", type);
            }
          });

          // Crear Portal de salida en la última habitación
          this.portal = this.physics.add.sprite(900, 900, "tex_portal");
          this.add.text(900, 850, "PORTAL AL PISO SIGUIENTE", {
            fontFamily: "monospace",
            fontSize: "10px",
            color: "#ec4899",
            fontStyle: "bold"
          }).setOrigin(0.5);
        }

        moveEnemiesTowardPlayer() {
          if (!this.player || !this.enemies) return;

          this.enemies.getChildren().forEach((enemy: any) => {
            const dist = Phaser.Math.Distance.Between(this.player!.x, this.player!.y, enemy.x, enemy.y);
            
            // Si el jugador está dentro del rango de aggro (250px)
            if (dist < 250) {
              const speed = enemy.getData("type") === 1 ? 90 : 60; // Bat vuela más rápido
              const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player!.x, this.player!.y);
              
              enemy.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
              
              // Animación sutil de rebote en slimes
              if (enemy.getData("type") === 0) {
                enemy.scaleY = 1.0 + Math.sin(this.time.now / 100) * 0.15;
              }
            } else {
              // Movimiento lento errático
              if (Phaser.Math.Between(0, 100) < 2) {
                const speed = 20;
                const rx = Phaser.Math.Between(-1, 1) * speed;
                const ry = Phaser.Math.Between(-1, 1) * speed;
                enemy.body.setVelocity(rx, ry);
              }
            }
          });
        }

        // Lógica de ataque con Espada
        performAttack() {
          if (this.isGameOver || this.isAttacking || !this.player) return;

          this.isAttacking = true;
          soundSynth.playJump(); // Sonido swing

          // Crear objeto visual de la espada rotando en dirección del ataque
          const attackRange = 45;
          const attackX = this.player.x + this.lastFacing.x * attackRange;
          const attackY = this.player.y + this.lastFacing.y * attackRange;

          // Dibujar el corte
          const swipe = this.add.graphics();
          swipe.lineStyle(4, 0x00ffcc, 1);
          swipe.beginPath();
          
          const startAngle = Phaser.Math.DegToRad(-45);
          const endAngle = Phaser.Math.DegToRad(45);
          swipe.arc(this.player.x, this.player.y, attackRange, startAngle, endAngle, false);
          swipe.strokePath();

          // Comprobar colisión con enemigos
          if (this.enemies) {
            this.enemies.getChildren().forEach((enemy: any) => {
              const dist = Phaser.Math.Distance.Between(attackX, attackY, enemy.x, enemy.y);
              
              if (dist < 40) {
                this.damageEnemy(enemy);
              }
            });
          }

          // Comprobar colisión con cofres cercanos
          if (this.chests) {
            this.chests.getChildren().forEach((chest: any) => {
              const dist = Phaser.Math.Distance.Between(this.player!.x, this.player!.y, chest.x, chest.y);
              if (dist < 45 && !chest.getData("opened")) {
                this.openChest(chest);
              }
            });
          }

          // Desvanecer el efecto visual
          this.tweens.add({
            targets: swipe,
            alpha: 0,
            duration: 150,
            onComplete: () => {
              swipe.destroy();
              this.isAttacking = false;
            }
          });
        }

        damageEnemy(enemy: any) {
          const enemyHp = enemy.getData("health") - this.playerAttack;
          enemy.setData("health", enemyHp);
          
          soundSynth.playExplosion();
          this.spawnImpactParticles(enemy.x, enemy.y, 0x00ffcc, 8);
          this.showFloatingText(enemy.x, enemy.y - 20, `-${this.playerAttack}`, 0x00ffcc);

          // Retroceso (knockback)
          const angle = Phaser.Math.Angle.Between(this.player!.x, this.player!.y, enemy.x, enemy.y);
          enemy.body.setVelocity(Math.cos(angle) * 300, Math.sin(angle) * 300);

          if (enemyHp <= 0) {
            // Muerte
            this.kills++;
            this.score += 200;
            this.goldCollected += Phaser.Math.Between(5, 15);
            this.spawnImpactParticles(enemy.x, enemy.y, 0xff0055, 15);
            enemy.destroy();
          }
        }

        openChest(chest: any) {
          chest.setData("opened", true);
          chest.setTint(0x64748b); // Oscurecer
          chest.angle = 5;
          
          this.chestsOpened++;
          soundSynth.playCoin();
          
          const goldFound = Phaser.Math.Between(30, 80);
          this.goldCollected += goldFound;
          this.score += 500;

          this.spawnImpactParticles(chest.x, chest.y, 0xeab308, 20);
          this.showFloatingText(chest.x, chest.y - 20, `+${goldFound} Oro!`, 0xeab308);
        }

        handleEnemyPush(p: any, enemy: any) {
          // El jugador recibe daño al tocar a los monstruos (cooldown de 600ms)
          if (this.time.now < (p.lastHitTime || 0)) return;
          p.lastHitTime = this.time.now + 600;

          // Daño neto amortiguado por defensa
          const baseDamage = enemy.getData("attack") || 10;
          const finalDamage = Math.max(2, baseDamage - this.playerDefense);
          
          this.playerHealth -= finalDamage;
          soundSynth.playExplosion();

          this.cameras.main.flash(100, 255, 0, 0);
          this.cameras.main.shake(100, 0.006);
          
          this.showFloatingText(this.player!.x, this.player!.y - 20, `-${finalDamage} HP`, 0xef4444);

          // Empujar al jugador lejos
          const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player!.x, this.player!.y);
          this.player!.body.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);

          if (this.playerHealth <= 0) {
            this.triggerGameOver();
          }
        }

        advanceFloor() {
          if (this.floor >= 5) {
            // Victoria final al pasar el piso 5
            this.isGameOver = true;
            soundSynth.playPowerup();
            
            this.showFloatingText(this.player!.x, this.player!.y - 25, "¡MAZMORRA PURIFICADA!", 0x00ff88);
            this.player!.body.setVelocity(0);

            this.time.delayedCall(1500, () => {
              onGameOver({
                score: this.score + 2000,
                coins: this.goldCollected + 100,
                kills: this.kills,
                chestsOpened: this.chestsOpened,
                floorReached: this.floor
              });
            });
            return;
          }

          this.floor++;
          soundSynth.playPowerup();
          this.showFloatingText(this.player!.x, this.player!.y - 25, `¡ENTRANDO AL PISO ${this.floor}!`, 0xeab308);
          
          // Curar un poco de HP al avanzar de piso
          this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth + 30);
          
          // Re-ubicar jugador al inicio y recrear monstruos más fuertes
          this.player!.setPosition(200, 200);
          this.spawnFloorEntities();
        }

        triggerGameOver() {
          this.isGameOver = true;
          soundSynth.playExplosion();
          
          this.cameras.main.shake(300, 0.01);
          this.spawnImpactParticles(this.player!.x, this.player!.y, 0xff003c, 25);
          
          this.player!.setTint(0xff0000);
          this.player!.body.setVelocity(0);

          this.time.delayedCall(1500, () => {
            onGameOver({
              score: this.score,
              coins: this.goldCollected,
              kills: this.kills,
              chestsOpened: this.chestsOpened,
              floorReached: this.floor
            });
          });
        }

        // Boosters del shop React
        useHealBooster() {
          this.playerHealth = this.playerMaxHealth;
          this.showFloatingText(this.player!.x, this.player!.y - 30, "VIDA COMPLETA", 0x22c55e);
          soundSynth.playPowerup();
        }

        useShieldBooster() {
          this.playerDefense += 8;
          this.showFloatingText(this.player!.x, this.player!.y - 30, "DEFENSA +8", 0x3b82f6);
          soundSynth.playPowerup();
        }

        useStrengthBooster() {
          this.playerAttack += 15;
          this.showFloatingText(this.player!.x, this.player!.y - 30, "DAÑO AUMENTADO +15", 0xef4444);
          soundSynth.playPowerup();
        }

        drawVirtualControls() {
          // Controles táctiles visuales
          const joy = this.add.graphics();
          joy.setScrollFactor(0);
          joy.setDepth(190);
          
          // Botón de ataque en la esquina inferior derecha
          joy.fillStyle(0x00ffcc, 0.25);
          joy.fillCircle(VIEW_WIDTH - 60, VIEW_HEIGHT - 60, 32);
          joy.lineStyle(2, 0x00ffcc, 0.6);
          joy.strokeCircle(VIEW_WIDTH - 60, VIEW_HEIGHT - 60, 32);
          
          // Dibujar espada dentro del botón de ataque
          this.add.text(VIEW_WIDTH - 60, VIEW_HEIGHT - 60, "ATK", {
            fontFamily: "sans-serif",
            fontSize: "11px",
            fontStyle: "bold",
            color: "#ffffff"
          }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
        }

        spawnImpactParticles(x: number, y: number, color: number, count: number) {
          const emitter = (this.add as any).particles(x, y, "tex_spark", {
            speed: { min: 20, max: 100 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            blendMode: "ADD",
            lifespan: 300,
            quantity: count,
            tint: color
          });
          this.time.delayedCall(300, () => emitter.destroy());
        }

        showFloatingText(x: number, y: number, text: string, color: number) {
          const fontConfig = {
            fontFamily: "monospace",
            fontSize: "11px",
            fontStyle: "bold",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3
          };

          const textObj = this.add.text(x, y, text, fontConfig);
          textObj.setOrigin(0.5);
          textObj.setTint(color);

          this.tweens.add({
            targets: textObj,
            y: y - 25,
            alpha: 0,
            duration: 600,
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

          // Partícula spark
          generateTexture("tex_spark", (g) => {
            g.fillStyle(0xffffff, 1);
            g.fillCircle(1.5, 1.5, 1.5);
          }, 3, 3);

          // Wall (Ladrillo gris oscuro)
          generateTexture("tex_wall", (g) => {
            g.fillStyle(0x1e293b, 1);
            g.fillRect(0, 0, 40, 40);
            g.lineStyle(1.5, 0x475569, 1);
            g.strokeRect(0, 0, 40, 40);
          }, 40, 40);

          // Pillar/Obstacle (Pilar neón)
          generateTexture("tex_pillar", (g) => {
            g.fillStyle(0x334155, 1);
            g.fillRect(6, 6, 28, 28);
            g.lineStyle(2, 0x06b6d4, 1);
            g.strokeRect(6, 6, 28, 28);
          }, 40, 40);

          // Hero (Guerrero con escudo verde)
          generateTexture("tex_hero", (g) => {
            g.fillStyle(0x00ff88, 1); // Verde neón
            g.fillCircle(12, 12, 10);
            g.fillStyle(0xffffff, 0.8); // Ojos
            g.fillCircle(8, 8, 2);
            g.fillCircle(16, 8, 2);
            // Espada
            g.fillStyle(0x38bdf8, 1);
            g.fillRect(20, 4, 3, 10);
          }, 24, 24);

          // Slime (Red jelly)
          generateTexture("tex_slime", (g) => {
            g.fillStyle(0xef4444, 0.95);
            g.fillEllipse(12, 14, 11, 8);
            g.fillStyle(0xffffff, 1);
            g.fillCircle(8, 12, 1.5);
            g.fillCircle(16, 12, 1.5);
          }, 24, 24);

          // Bat (Purple flying enemy)
          generateTexture("tex_bat", (g) => {
            g.fillStyle(0xa855f7, 1);
            g.fillTriangle(12, 12, 2, 6, 22, 6);
            g.fillCircle(12, 14, 6);
          }, 24, 24);

          // Chest
          generateTexture("tex_chest", (g) => {
            g.fillStyle(0xeab308, 1); // Golden chest
            g.fillRect(3, 4, 26, 20);
            g.fillStyle(0x78350f, 1); // Cerraduras
            g.fillRect(14, 10, 4, 8);
          }, 32, 28);

          // Portal (Magenta vortex)
          generateTexture("tex_portal", (g) => {
            g.fillStyle(0xec4899, 1);
            g.fillCircle(16, 16, 14);
            g.lineStyle(2, 0xffffff, 0.8);
            g.strokeCircle(16, 16, 14);
          }, 32, 32);
        }
      }

      const config = {
        type: Phaser.AUTO,
        width: VIEW_WIDTH,
        height: VIEW_HEIGHT,
        parent: parentRef.current,
        backgroundColor: "#020617",
        physics: {
          default: "arcade",
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
          }
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: [RoguelikeScene]
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

    const activeScene = gameRef.current.scene.keys.RoguelikeScene;
    if (!activeScene) return;

    if (activeBooster === "heal") {
      activeScene.useHealBooster();
    } else if (activeBooster === "shield") {
      activeScene.useShieldBooster();
    } else if (activeBooster === "strength") {
      activeScene.useStrengthBooster();
    }

    onBoosterUsed();
  }, [activeBooster]);

  // Reiniciar juego
  useEffect(() => {
    if (triggerRestart && gameRef.current) {
      const activeScene = gameRef.current.scene.keys.RoguelikeScene;
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
        className="w-full max-w-[550px] aspect-[11/8] rounded-3xl overflow-hidden border border-white/10 bg-[#020617] shadow-2xl relative"
        style={{ contentVisibility: "auto" }}
      />
    </div>
  );
}

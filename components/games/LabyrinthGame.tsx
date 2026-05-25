"use client";

import { useEffect, useRef, useState } from "react";
import { soundSynth } from "@/components/games/RunnerGame";
import { Zap, Map, Snowflake, Clock, Key } from "lucide-react";

interface LabyrinthGameProps {
  level: number;
  onGameOver: (stats: { score: number; coins: number; levelsCompleted: number }) => void;
  onGameActive: () => void;
  activeBooster: string | null;
  onBoosterUsed: () => void;
  triggerRestart: boolean;
  onRestartComplete: () => void;
}

export default function LabyrinthGame({
  level,
  onGameOver,
  onGameActive,
  activeBooster,
  onBoosterUsed,
  triggerRestart,
  onRestartComplete
}: LabyrinthGameProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<any>(null);
  const [soundEnabled, setSoundEnabled] = useState(soundSynth.isSoundEnabled());

  useEffect(() => {
    if (typeof window === "undefined" || !parentRef.current) return;

    let isDestroyed = false;
    let phaserGame: any = null;

    import("phaser").then((Phaser) => {
      if (isDestroyed) return;

      const GRID_SIZE = Math.min(11 + Math.floor(level / 2), 17); // Laberinto crece con nivel
      const CELL_SIZE = 40;
      const WIDTH = GRID_SIZE * CELL_SIZE;
      const HEIGHT = GRID_SIZE * CELL_SIZE;

      class LabyrinthScene extends Phaser.Scene {
        // Grid y paredes
        grid: any[][] = [];
        walls: Phaser.Physics.Arcade.StaticGroup | null = null;
        
        // Elementos de juego
        player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | null = null;
        keyObj: Phaser.Physics.Arcade.Sprite | null = null;
        doorObj: Phaser.Physics.Arcade.Sprite | null = null;
        enemiesGroup: Phaser.Physics.Arcade.Group | null = null;

        // Variables de estado
        hasKey = false;
        isEscaped = false;
        timeLeft = 60 + level * 5; // tiempo límite dependiente del nivel
        timerEvent: Phaser.Time.TimerEvent | null = null;
        score = 0;
        coinsCollected = 0;
        
        // Boosters activos
        mapRevealed = false;
        enemiesFrozen = false;
        hintActive = false;

        // Overlay de oscuridad
        darknessRT: Phaser.GameObjects.RenderTexture | null = null;
        lightGraphics: Phaser.GameObjects.Graphics | null = null;
        hintArrow: Phaser.GameObjects.Graphics | null = null;

        // Teclas
        cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;

        constructor() {
          super("LabyrinthScene");
        }

        preload() {
          this.createProceduralTextures();
        }

        create() {
          onGameActive();
          this.physics.world.setBounds(0, 0, WIDTH, HEIGHT);
          
          this.hasKey = false;
          this.isEscaped = false;
          this.timeLeft = 60 + level * 5;
          this.coinsCollected = 0;
          this.mapRevealed = false;
          this.enemiesFrozen = false;
          this.hintActive = false;

          // Fondo
          this.add.grid(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, CELL_SIZE, CELL_SIZE, 0x090d16, 1, 0x1e293b, 0.15);

          // Generación del laberinto lógicamente
          this.generateMaze();

          // Renderizar paredes físicas
          this.renderWalls();

          // Crear Jugador
          this.createPlayer();

          // Crear Llave y Puerta
          this.createItems();

          // Crear Enemigos
          this.createEnemies();

          // Controles de teclado
          if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
          }

          // Temporizador
          if (this.timerEvent) this.timerEvent.destroy();
          this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.tickTimer,
            callbackScope: this,
            loop: true
          });

          // Capa de oscuridad
          this.darknessRT = this.add.renderTexture(0, 0, WIDTH, HEIGHT);
          this.darknessRT.setDepth(100);
          this.lightGraphics = this.make.graphics({ x: 0, y: 0, add: false } as any);

          // Flecha de pista
          this.hintArrow = this.add.graphics();
          this.hintArrow.setDepth(90);

          // Colisiones
          if (this.player && this.walls) {
            this.physics.add.collider(this.player, this.walls);
          }
          if (this.enemiesGroup && this.walls) {
            this.physics.add.collider(this.enemiesGroup, this.walls);
          }
          if (this.player && this.enemiesGroup) {
            this.physics.add.overlap(this.player, this.enemiesGroup, this.handleEnemyCollision, undefined, this);
          }
        }

        update() {
          if (this.isEscaped || !this.player) return;

          // Movimiento del jugador
          const speed = 160;
          this.player.body.setVelocity(0);

          if (this.cursors) {
            if (this.cursors.left?.isDown) {
              this.player.body.setVelocityX(-speed);
            } else if (this.cursors.right?.isDown) {
              this.player.body.setVelocityX(speed);
            }

            if (this.cursors.up?.isDown) {
              this.player.body.setVelocityY(-speed);
            } else if (this.cursors.down?.isDown) {
              this.player.body.setVelocityY(speed);
            }
          }

          // Verificar si recoge la llave
          if (this.keyObj && !this.hasKey) {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.keyObj.x, this.keyObj.y);
            if (dist < 20) {
              this.collectKey();
            }
          }

          // Verificar si llega a la puerta
          if (this.doorObj) {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.doorObj.x, this.doorObj.y);
            if (dist < 20) {
              if (this.hasKey) {
                this.escapeMaze();
              } else {
                // Alerta de que falta la llave
                this.showFloatingText(this.doorObj.x, this.doorObj.y - 20, "¡NECESITAS LA LLAVE!", 0xf43f5e);
              }
            }
          }

          // Mover enemigos si no están congelados
          if (!this.enemiesFrozen && this.enemiesGroup) {
            this.enemiesGroup.getChildren().forEach((enemy: any) => {
              this.updateEnemyMovement(enemy);
            });
          }

          // Renderizar oscuridad dinámica (fog of war)
          this.drawDarkness();

          // Renderizar flecha de pista
          this.drawHint();
        }

        // Algoritmo DFS (Backtracking) para generar laberinto procedural
        generateMaze() {
          this.grid = [];
          for (let r = 0; r < GRID_SIZE; r++) {
            this.grid[r] = [];
            for (let c = 0; c < GRID_SIZE; c++) {
              this.grid[r][c] = {
                r, c,
                visited: false,
                walls: { top: true, right: true, bottom: true, left: true }
              };
            }
          }

          const stack: any[] = [];
          const startCell = this.grid[0][0];
          startCell.visited = true;
          stack.push(startCell);

          while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = this.getUnvisitedNeighbors(current);

            if (neighbors.length > 0) {
              const next = Phaser.Math.RND.pick(neighbors);
              this.removeWallsBetween(current, next);
              next.visited = true;
              stack.push(next);
            } else {
              stack.pop();
            }
          }
        }

        getUnvisitedNeighbors(cell: any) {
          const neighbors = [];
          const { r, c } = cell;

          if (r > 0 && !this.grid[r - 1][c].visited) neighbors.push(this.grid[r - 1][c]);
          if (r < GRID_SIZE - 1 && !this.grid[r + 1][c].visited) neighbors.push(this.grid[r + 1][c]);
          if (c > 0 && !this.grid[r][c - 1].visited) neighbors.push(this.grid[r][c - 1]);
          if (c < GRID_SIZE - 1 && !this.grid[r][c + 1].visited) neighbors.push(this.grid[r][c + 1]);

          return neighbors;
        }

        removeWallsBetween(c1: any, c2: any) {
          const rDiff = c1.r - c2.r;
          const cDiff = c1.c - c2.c;

          if (rDiff === 1) {
            c1.walls.top = false;
            c2.walls.bottom = false;
          } else if (rDiff === -1) {
            c1.walls.bottom = false;
            c2.walls.top = false;
          }

          if (cDiff === 1) {
            c1.walls.left = false;
            c2.walls.right = false;
          } else if (cDiff === -1) {
            c1.walls.right = false;
            c2.walls.left = false;
          }
        }

        // Renderizar paredes físicas basadas en el laberinto lógico
        renderWalls() {
          this.walls = this.physics.add.staticGroup();

          // Paredes perimetrales y celdas individuales
          for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
              const cell = this.grid[r][c];
              const x = c * CELL_SIZE;
              const y = r * CELL_SIZE;

              // Paredes superiores
              if (cell.walls.top) {
                const wall = this.walls.create(x + CELL_SIZE / 2, y, "tex_wall_h");
                wall.refreshBody();
              }
              // Paredes izquierdas
              if (cell.walls.left) {
                const wall = this.walls.create(x, y + CELL_SIZE / 2, "tex_wall_v");
                wall.refreshBody();
              }
              // Paredes derechas periféricas
              if (c === GRID_SIZE - 1 && cell.walls.right) {
                const wall = this.walls.create(x + CELL_SIZE, y + CELL_SIZE / 2, "tex_wall_v");
                wall.refreshBody();
              }
              // Paredes inferiores periféricas
              if (r === GRID_SIZE - 1 && cell.walls.bottom) {
                const wall = this.walls.create(x + CELL_SIZE / 2, y + CELL_SIZE, "tex_wall_h");
                wall.refreshBody();
              }
            }
          }
        }

        createPlayer() {
          const spawnX = CELL_SIZE / 2;
          const spawnY = CELL_SIZE / 2;
          
          this.player = this.physics.add.sprite(spawnX, spawnY, "tex_player") as any;
          this.player!.setCircle(12);
          this.player!.setCollideWorldBounds(true);
          
          // Efecto de partículas alrededor del jugador
          const emitter = (this.add as any).particles(0, 0, "tex_spark", {
            speed: 10,
            scale: { start: 0.4, end: 0 },
            blendMode: "ADD",
            lifespan: 300,
            frequency: 50,
            tint: 0x00ff88
          });
          emitter.startFollow(this.player);
        }

        createItems() {
          // La llave se ubica en la esquina opuesta inferior
          const keyR = GRID_SIZE - 1;
          const keyC = GRID_SIZE - 1;
          const keyX = keyC * CELL_SIZE + CELL_SIZE / 2;
          const keyY = keyR * CELL_SIZE + CELL_SIZE / 2;

          this.keyObj = this.physics.add.sprite(keyX, keyY, "tex_key");
          this.physics.add.existing(this.keyObj);

          // La puerta de salida se ubica en el centro o lado aleatorio (ej: fila superior derecha)
          const doorR = 0;
          const doorC = GRID_SIZE - 1;
          const doorX = doorC * CELL_SIZE + CELL_SIZE / 2;
          const doorY = doorR * CELL_SIZE + CELL_SIZE / 2;

          this.doorObj = this.physics.add.sprite(doorX, doorY, "tex_door");
          this.physics.add.existing(this.doorObj);
        }

        createEnemies() {
          this.enemiesGroup = this.physics.add.group();
          
          // Crear un enemigo por cada 4 celdas de tamaño, con un mínimo de 1 y máximo de 6
          const enemyCount = Math.max(1, Math.min(Math.floor(GRID_SIZE / 2), 6));
          const hasStalker = (level % 5 === 0);

          // Mostrar alerta de stalker al inicio si aplica
          if (hasStalker) {
            this.time.delayedCall(1000, () => {
              if (this.sys.isActive() && this.player) {
                this.showFloatingText(this.player.x, this.player.y - 45, "¡ALERTA: EL ACECHADOR TE SIGUE!", 0xa855f7);
              }
            });
          }
          
          for (let i = 0; i < enemyCount; i++) {
            // Ubicación aleatoria lejos del spawn
            let r, c;
            do {
              r = Phaser.Math.Between(2, GRID_SIZE - 1);
              c = Phaser.Math.Between(2, GRID_SIZE - 1);
            } while (r < 3 && c < 3); // Mantener lejos del jugador inicial
            
            const ex = c * CELL_SIZE + CELL_SIZE / 2;
            const ey = r * CELL_SIZE + CELL_SIZE / 2;

            const isThisStalker = (hasStalker && i === 0);
            const textureKey = isThisStalker ? "tex_stalker" : "tex_enemy";

            const enemy = this.enemiesGroup.create(ex, ey, textureKey);
            enemy.setCircle(12);
            enemy.setCollideWorldBounds(true);
            
            // Propiedades personalizadas para movimiento celda a celda
            enemy.gridX = c;
            enemy.gridY = r;
            enemy.targetGridX = c;
            enemy.targetGridY = r;
            enemy.isStalker = isThisStalker;
            enemy.moveSpeed = isThisStalker ? 100 : 75; // El stalker es más veloz
            
            if (isThisStalker) {
              const emitter = (this.add as any).particles(0, 0, "tex_spark", {
                speed: 15,
                scale: { start: 0.5, end: 0 },
                blendMode: "ADD",
                lifespan: 400,
                frequency: 60,
                tint: 0xa855f7
              });
              emitter.startFollow(enemy);
            }

            this.decideNextCell(enemy);
          }
        }

        decideNextCell(enemy: any) {
          if (this.enemiesFrozen) {
            enemy.body.setVelocity(0, 0);
            return;
          }

          const r = enemy.gridY;
          const c = enemy.gridX;

          let nextDir = null;

          if (enemy.isStalker && this.player) {
            const playerC = Math.floor(this.player.x / CELL_SIZE);
            const playerR = Math.floor(this.player.y / CELL_SIZE);
            nextDir = this.findNextStepBFS(r, c, playerR, playerC);
          }

          // Si no es stalker o si el BFS falló, elegir dirección aleatoria
          if (!nextDir) {
            const validDirs = [];
            if (!this.grid[r][c].walls.top && r > 0) validDirs.push({ x: 0, y: -1 });
            if (!this.grid[r][c].walls.bottom && r < GRID_SIZE - 1) validDirs.push({ x: 0, y: 1 });
            if (!this.grid[r][c].walls.left && c > 0) validDirs.push({ x: -1, y: 0 });
            if (!this.grid[r][c].walls.right && c < GRID_SIZE - 1) validDirs.push({ x: 1, y: 0 });

            // Evitar dar la vuelta en U si hay otras opciones
            const filteredDirs = validDirs.filter(d => {
              const vx = enemy.body.velocity.x;
              const vy = enemy.body.velocity.y;
              if (vx > 0 && d.x === -1) return false;
              if (vx < 0 && d.x === 1) return false;
              if (vy > 0 && d.y === -1) return false;
              if (vy < 0 && d.y === 1) return false;
              return true;
            });

            const choices = filteredDirs.length > 0 ? filteredDirs : validDirs;
            if (choices.length > 0) {
              nextDir = Phaser.Math.RND.pick(choices);
            }
          }

          if (nextDir) {
            enemy.targetGridX = c + nextDir.x;
            enemy.targetGridY = r + nextDir.y;
            enemy.body.setVelocity(nextDir.x * enemy.moveSpeed, nextDir.y * enemy.moveSpeed);
          } else {
            enemy.body.setVelocity(0, 0);
          }
        }

        updateEnemyMovement(enemy: any) {
          if (this.enemiesFrozen) {
            enemy.body.setVelocity(0, 0);
            return;
          }

          const targetX = enemy.targetGridX * CELL_SIZE + CELL_SIZE / 2;
          const targetY = enemy.targetGridY * CELL_SIZE + CELL_SIZE / 2;

          const vx = enemy.body.velocity.x;
          const vy = enemy.body.velocity.y;

          let reached = false;
          if (vx > 0 && enemy.x >= targetX) reached = true;
          else if (vx < 0 && enemy.x <= targetX) reached = true;
          else if (vy > 0 && enemy.y >= targetY) reached = true;
          else if (vy < 0 && enemy.y <= targetY) reached = true;
          else if (vx === 0 && vy === 0) reached = true;

          if (reached) {
            enemy.setPosition(targetX, targetY);
            enemy.gridX = enemy.targetGridX;
            enemy.gridY = enemy.targetGridY;
            this.decideNextCell(enemy);
          }
        }

        findNextStepBFS(sr: number, sc: number, pr: number, pc: number): { x: number, y: number } | null {
          if (sr === pr && sc === pc) return null;

          const queue: { r: number, c: number, path: { x: number, y: number }[] }[] = [];
          const visited = new Set<string>();

          queue.push({ r: sr, c: sc, path: [] });
          visited.add(`${sr}_${sc}`);

          while (queue.length > 0) {
            const current = queue.shift()!;
            const { r, c, path } = current;

            if (r === pr && c === pc) {
              return path[0] || null;
            }

            const cell = this.grid[r][c];
            const neighbors = [];
            if (!cell.walls.top && r > 0) neighbors.push({ r: r - 1, c, dir: { x: 0, y: -1 } });
            if (!cell.walls.bottom && r < GRID_SIZE - 1) neighbors.push({ r: r + 1, c, dir: { x: 0, y: 1 } });
            if (!cell.walls.left && c > 0) neighbors.push({ r, c: c - 1, dir: { x: -1, y: 0 } });
            if (!cell.walls.right && c < GRID_SIZE - 1) neighbors.push({ r, c: c + 1, dir: { x: 1, y: 0 } });

            for (const n of neighbors) {
              const key = `${n.r}_${n.c}`;
              if (!visited.has(key)) {
                visited.add(key);
                queue.push({
                  r: n.r,
                  c: n.c,
                  path: [...path, n.dir]
                });
              }
            }
          }

          return null;
        }

        // Lógica de oscuridad dinámica
        drawDarkness() {
          if (!this.darknessRT || !this.lightGraphics || !this.player) return;

          this.darknessRT.clear();

          // Si el mapa fue revelado (Booster), pintar la oscuridad semi-transparente
          if (this.mapRevealed) {
            this.darknessRT.fill(0x020617, 0.45);
            return;
          }

          // Pintar la pantalla de negro total
          this.darknessRT.fill(0x020617, 0.96);

          // Limpiar círculo de luz alrededor del jugador
          const radius = 100;
          this.lightGraphics.clear();
          this.lightGraphics.fillStyle(0xffffff, 1);
          this.lightGraphics.fillCircle(this.player.x, this.player.y, radius);

          // Borrar la luz de la textura de oscuridad
          this.darknessRT.erase(this.lightGraphics);
        }

        drawHint() {
          if (!this.hintArrow || !this.player) return;
          this.hintArrow.clear();

          if (!this.hintActive) return;

          // Apuntar al objetivo activo (Key si no la tiene, de lo contrario la Door)
          const target = this.hasKey ? this.doorObj : this.keyObj;
          if (!target) return;

          const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
          
          // Dibujar flecha indicadora pequeña alrededor del jugador
          const distFromPlayer = 32;
          const arrowX = this.player.x + Math.cos(angle) * distFromPlayer;
          const arrowY = this.player.y + Math.sin(angle) * distFromPlayer;

          this.hintArrow.lineStyle(2, 0xeab308, 1);
          this.hintArrow.fillStyle(0xeab308, 1);
          
          // Dibujar flecha
          this.hintArrow.save();
          this.hintArrow.translateCanvas(arrowX, arrowY);
          this.hintArrow.rotateCanvas(angle);
          
          this.hintArrow.beginPath();
          this.hintArrow.moveTo(10, 0);
          this.hintArrow.lineTo(-5, -6);
          this.hintArrow.lineTo(-5, 6);
          this.hintArrow.closePath();
          this.hintArrow.fill();
          
          this.hintArrow.restore();
        }

        tickTimer() {
          if (this.isEscaped) return;
          this.timeLeft--;

          if (this.timeLeft <= 0) {
            this.handleTimeOut();
          }
        }

        collectKey() {
          this.hasKey = true;
          soundSynth.playCoin();
          
          if (this.keyObj) {
            this.spawnImpactParticles(this.keyObj.x, this.keyObj.y, 0xeab308, 15);
            this.keyObj.destroy();
            this.keyObj = null;
          }

          // Efecto visual
          if (this.player) {
            this.showFloatingText(this.player.x, this.player.y - 25, "¡LLAVE OBTENIDA!", 0xeab308);
          }
        }

        escapeMaze() {
          this.isEscaped = true;
          if (this.timerEvent) this.timerEvent.destroy();
          soundSynth.playPowerup();

          // Puntuación: tiempo restante * 10 + 500 base
          this.score = this.timeLeft * 10 + 500;
          this.coinsCollected = 50 + Math.floor(this.timeLeft / 2);

          this.showFloatingText(this.player!.x, this.player!.y - 25, `¡LOGRADO! +${this.score} Pts`, 0x00ff88);

          this.time.delayedCall(1200, () => {
            onGameOver({
              score: this.score,
              coins: this.coinsCollected,
              levelsCompleted: 1
            });
          });
        }

        handleEnemyCollision(p: any, enemy: any) {
          // Si colisiona, pierde
          this.isEscaped = true;
          if (this.timerEvent) this.timerEvent.destroy();
          soundSynth.playExplosion();

          this.cameras.main.shake(300, 0.01);
          this.spawnImpactParticles(this.player!.x, this.player!.y, 0xff003c, 25);
          
          this.player!.setTint(0xff0000);
          this.physics.pause();

          this.time.delayedCall(1500, () => {
            onGameOver({
              score: 0,
              coins: 0,
              levelsCompleted: 0
            });
          });
        }

        handleTimeOut() {
          this.isEscaped = true;
          if (this.timerEvent) this.timerEvent.destroy();
          soundSynth.playExplosion();

          this.showFloatingText(this.player!.x, this.player!.y - 20, "¡TIEMPO AGOTADO!", 0xef4444);
          this.physics.pause();

          this.time.delayedCall(1500, () => {
            onGameOver({
              score: 0,
              coins: 0,
              levelsCompleted: 0
            });
          });
        }

        useMapBooster() {
          this.mapRevealed = true;
          this.showFloatingText(this.player!.x, this.player!.y - 30, "¡MAPA INTEGRAL!", 0x22d3ee);
          soundSynth.playCoin();
        }

        useFreezeBooster() {
          this.enemiesFrozen = true;
          this.showFloatingText(this.player!.x, this.player!.y - 30, "¡ENEMIGOS CONGELADOS!", 0x38bdf8);
          soundSynth.playSlide();
          
          if (this.enemiesGroup) {
            this.enemiesGroup.getChildren().forEach((enemy: any) => {
              enemy.body.setVelocity(0, 0);
              enemy.setTint(0x38bdf8);
            });
          }

          // Descongelar en 8 segundos
          this.time.delayedCall(8000, () => {
            this.enemiesFrozen = false;
            if (this.enemiesGroup && this.sys.isActive()) {
              this.enemiesGroup.getChildren().forEach((enemy: any) => {
                enemy.clearTint();
                this.decideNextCell(enemy);
              });
            }
          });
        }

        useExtraTimeBooster() {
          this.timeLeft += 20;
          this.showFloatingText(this.player!.x, this.player!.y - 30, "+20 SEGUNDOS", 0x10b981);
          soundSynth.playCoin();
        }

        useHintBooster() {
          this.hintActive = true;
          this.showFloatingText(this.player!.x, this.player!.y - 30, "PISTA ACTIVA", 0xeab308);
          soundSynth.playCoin();
        }

        spawnImpactParticles(x: number, y: number, color: number, count: number) {
          const emitter = (this.add as any).particles(x, y, "tex_spark", {
            speed: { min: 40, max: 120 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            blendMode: "ADD",
            lifespan: 400,
            quantity: count,
            tint: color
          });
          this.time.delayedCall(400, () => emitter.destroy());
        }

        showFloatingText(x: number, y: number, text: string, color: number) {
          const fontConfig = {
            fontFamily: "monospace",
            fontSize: "13px",
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
            y: y - 30,
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

          // Spark particle
          generateTexture("tex_spark", (g) => {
            g.fillStyle(0xffffff, 1);
            g.fillCircle(2, 2, 2);
          }, 4, 4);

          // Horizontal Wall
          generateTexture("tex_wall_h", (g) => {
            g.fillStyle(0x06b6d4, 1); // Neon cyan
            g.fillRect(0, 0, CELL_SIZE, 6);
            g.fillStyle(0xffffff, 0.4);
            g.fillRect(0, 2, CELL_SIZE, 2);
          }, CELL_SIZE, 6);

          // Vertical Wall
          generateTexture("tex_wall_v", (g) => {
            g.fillStyle(0x06b6d4, 1);
            g.fillRect(0, 0, 6, CELL_SIZE);
            g.fillStyle(0xffffff, 0.4);
            g.fillRect(2, 0, 2, CELL_SIZE);
          }, 6, CELL_SIZE);

          // Player: Neon sphere
          generateTexture("tex_player", (g) => {
            g.fillStyle(0x00ff88, 1); // Green glow
            g.fillCircle(12, 12, 12);
            g.fillStyle(0xffffff, 0.6);
            g.fillCircle(8, 8, 4);
          }, 24, 24);

          // Key
          generateTexture("tex_key", (g) => {
            g.lineStyle(2, 0xeab308, 1);
            g.strokeCircle(12, 8, 6);
            g.fillStyle(0xeab308, 1);
            g.fillRect(10, 14, 4, 12);
            g.fillRect(14, 20, 4, 3);
            g.fillRect(14, 24, 4, 3);
          }, 24, 28);

          // Door
          generateTexture("tex_door", (g) => {
            g.fillStyle(0xec4899, 1); // Neon Pink Portal
            g.fillRoundedRect(4, 2, 16, 24, 6);
            g.lineStyle(2, 0xffffff, 0.7);
            g.strokeRoundedRect(4, 2, 16, 24, 6);
          }, 24, 28);

          // Enemy
          generateTexture("tex_enemy", (g) => {
            g.fillStyle(0xef4444, 1); // Red triangles
            g.fillTriangle(12, 2, 2, 22, 22, 22);
            g.fillStyle(0xffffff, 1);
            g.fillCircle(9, 14, 2.5);
            g.fillCircle(15, 14, 2.5);
          }, 24, 24);

          // Stalker Enemy
          generateTexture("tex_stalker", (g) => {
            g.fillStyle(0xa855f7, 1); // Círculo principal morado
            g.fillCircle(12, 12, 12);
            g.fillStyle(0xec4899, 1); // Cuernos rosas
            g.fillTriangle(4, 4, 12, 12, 0, 12);
            g.fillTriangle(20, 4, 12, 12, 24, 12);
            g.fillStyle(0xeab308, 1); // Ojos amarillos molestos
            g.fillCircle(8, 12, 3);
            g.fillCircle(16, 12, 3);
            g.lineStyle(1.5, 0xffffff, 1);
            g.beginPath();
            g.moveTo(6, 8);
            g.lineTo(10, 10);
            g.strokePath();
            g.beginPath();
            g.moveTo(18, 8);
            g.lineTo(14, 10);
            g.strokePath();
          }, 24, 24);
        }
      }

      const config = {
        type: Phaser.AUTO,
        width: WIDTH,
        height: HEIGHT,
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
        scene: [LabyrinthScene]
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

  // Aplicar Booster desde el panel React
  useEffect(() => {
    if (!activeBooster || !gameRef.current) return;

    const activeScene = gameRef.current.scene.keys.LabyrinthScene;
    if (!activeScene) return;

    if (activeBooster === "map") {
      activeScene.useMapBooster();
    } else if (activeBooster === "freeze") {
      activeScene.useFreezeBooster();
    } else if (activeBooster === "time") {
      activeScene.useExtraTimeBooster();
    } else if (activeBooster === "hint") {
      activeScene.useHintBooster();
    }

    onBoosterUsed();
  }, [activeBooster]);

  // Reiniciar juego
  useEffect(() => {
    if (triggerRestart && gameRef.current) {
      const activeScene = gameRef.current.scene.keys.LabyrinthScene;
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
        className="w-full max-w-[420px] sm:max-w-[480px] aspect-square rounded-3xl overflow-hidden border border-white/10 bg-[#020617] shadow-2xl relative"
        style={{ contentVisibility: "auto" }}
      />
    </div>
  );
}

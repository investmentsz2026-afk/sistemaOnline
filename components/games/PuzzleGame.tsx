"use client";

import { useEffect, useRef, useState } from "react";
import { soundSynth } from "@/components/games/RunnerGame";
import { Zap } from "lucide-react";

interface PuzzleGameProps {
  level: number;
  movesLimit: number;
  scoreGoal: number;
  activeBooster: string | null;
  onBoosterUsed: () => void;
  onScoreChanged: (stats: { score: number; movesLeft: number; combos: number }) => void;
  onLevelComplete: (stats: { score: number; stars: number }) => void;
  onLevelFailed: () => void;
  onGameActive: () => void;
  triggerRestart: boolean;
  onRestartComplete: () => void;
}

export default function PuzzleGame({
  level,
  movesLimit,
  scoreGoal,
  activeBooster,
  onBoosterUsed,
  onScoreChanged,
  onLevelComplete,
  onLevelFailed,
  onGameActive,
  triggerRestart,
  onRestartComplete
}: PuzzleGameProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<any>(null);
  const [soundEnabled, setSoundEnabled] = useState(soundSynth.isSoundEnabled());

  useEffect(() => {
    if (typeof window === "undefined" || !parentRef.current) return;

    let isDestroyed = false;
    let phaserGame: any = null;

    import("phaser").then((Phaser) => {
      if (isDestroyed) return;

      const BOARD_SIZE = 8;
      const CELL_SIZE = 50;
      const GEM_TYPES = 5; // Cantidad de colores

      class PuzzleScene extends Phaser.Scene {
        // Matriz del tablero lógico (contiene IDs de gemas y tipos)
        board: number[][] = [];
        // Matriz de sprites
        sprites: (Phaser.GameObjects.Sprite | null)[][] = [];
        
        // Selección de gemas
        selectedGem: { r: number; c: number } | null = null;
        isActionBlocked = false;
        
        // Estadísticas de juego
        score = 0;
        movesLeft = movesLimit;
        comboCount = 0;

        constructor() {
          super("PuzzleScene");
        }

        preload() {
          this.createProceduralTextures();
        }

        create() {
          onGameActive();
          const { width, height } = this.scale;

          // Dibujar fondo elegante con cuadrícula neon de soporte
          this.add.grid(width / 2, height / 2, 420, 420, 50, 50, 0x000000, 0, 0x1e293b, 0.3);

          // Inicializar variables
          this.score = 0;
          this.movesLeft = movesLimit;
          this.comboCount = 0;
          this.isActionBlocked = false;
          this.selectedGem = null;

          // Inicializar el tablero lógico aleatoriamente sin matches iniciales
          this.initBoard();

          // Dibujar gemas en pantalla
          this.drawBoard();

          // Capturar clics/taps
          this.input.on("pointerdown", this.handlePointerDown, this);
        }

        update() {
          // No requiere bucle continuo de físicas
        }

        initBoard() {
          this.board = [];
          this.sprites = [];
          for (let r = 0; r < BOARD_SIZE; r++) {
            this.board[r] = [];
            this.sprites[r] = [];
            for (let c = 0; c < BOARD_SIZE; c++) {
              let type;
              // Bucle para evitar que inicie con match hecho
              do {
                type = Phaser.Math.Between(0, GEM_TYPES - 1);
              } while (
                (r >= 2 && this.board[r - 1][c] === type && this.board[r - 2][c] === type) ||
                (c >= 2 && this.board[r][c - 1] === type && this.board[r][c - 2] === type)
              );
              this.board[r][c] = type;
              this.sprites[r][c] = null;
            }
          }
        }

        // Renderizado del tablero con coordenadas centradas
        drawBoard() {
          const startX = (this.scale.width - (BOARD_SIZE * CELL_SIZE)) / 2 + CELL_SIZE / 2;
          const startY = (this.scale.height - (BOARD_SIZE * CELL_SIZE)) / 2 + CELL_SIZE / 2;

          for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
              const type = this.board[r][c];
              if (type !== -1) {
                const x = startX + c * CELL_SIZE;
                const y = startY + r * CELL_SIZE;
                
                const sprite = this.add.sprite(x, y, `gem_${type}`);
                sprite.setInteractive();
                sprite.setData("row", r);
                sprite.setData("col", c);
                sprite.setScale(0); // Animación de aparición
                
                this.tweens.add({
                  targets: sprite,
                  scale: 0.9,
                  duration: 250,
                  delay: (r + c) * 30
                });

                this.sprites[r][c] = sprite;
              }
            }
          }
        }

        // Manejador de clics del mouse / toques táctiles
        handlePointerDown(pointer: Phaser.Input.Pointer) {
          if (this.isActionBlocked) return;

          // Encontrar si se hizo clic en alguna gema
          const startX = (this.scale.width - (BOARD_SIZE * CELL_SIZE)) / 2 + CELL_SIZE / 2;
          const startY = (this.scale.height - (BOARD_SIZE * CELL_SIZE)) / 2 + CELL_SIZE / 2;

          const col = Math.floor((pointer.x - (startX - CELL_SIZE / 2)) / CELL_SIZE);
          const row = Math.floor((pointer.y - (startY - CELL_SIZE / 2)) / CELL_SIZE);

          if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
            // Verificar si hay booster activo
            if (activeBooster === "hammer") {
              this.useHammerBooster(row, col);
              return;
            }
            if (activeBooster === "color_bomb") {
              this.useColorBombBooster(row, col);
              return;
            }

            if (!this.selectedGem) {
              // Primer gema seleccionada
              this.selectedGem = { r: row, c: col };
              this.sprites[row][col]?.setTint(0x94a3b8);
              this.sprites[row][col]?.setScale(1.1);
              soundSynth.playCoin();
            } else {
              // Segunda gema seleccionada, verificar adyacencia
              const first = this.selectedGem;
              const dist = Math.abs(first.r - row) + Math.abs(first.c - col);

              if (dist === 1) {
                // Intercambio
                this.swapGems(first.r, first.c, row, col);
              } else {
                // Deseleccionar o seleccionar la nueva
                this.sprites[first.r][first.c]?.clearTint();
                this.sprites[first.r][first.c]?.setScale(0.9);
                
                this.selectedGem = { r: row, c: col };
                this.sprites[row][col]?.setTint(0x94a3b8);
                this.sprites[row][col]?.setScale(1.1);
                soundSynth.playCoin();
              }
            }
          }
        }

        // Aplicación del Martillo Booster
        useHammerBooster(r: number, c: number) {
          this.isActionBlocked = true;
          this.selectedGem = null;
          soundSynth.playExplosion();
          
          this.spawnImpactParticles(this.sprites[r][c]?.x || 0, this.sprites[r][c]?.y || 0, 0xffffff, 15);
          
          this.tweens.add({
            targets: this.sprites[r][c],
            scale: 0,
            duration: 200,
            onComplete: () => {
              this.sprites[r][c]?.destroy();
              this.sprites[r][c] = null;
              this.board[r][c] = -1;
              
              onBoosterUsed(); // Consumir booster en React
              this.triggerCascade();
            }
          });
        }

        // Aplicación de Bomba de Color Booster (destruye todas las gemas del tipo seleccionado)
        useColorBombBooster(r: number, c: number) {
          this.isActionBlocked = true;
          this.selectedGem = null;
          const targetType = this.board[r][c];
          if (targetType === -1) {
            this.isActionBlocked = false;
            return;
          }

          soundSynth.playExplosion();
          this.cameras.main.flash(200, 255, 255, 255);
          
          let count = 0;
          for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
              if (this.board[row][col] === targetType) {
                count++;
                const sprite = this.sprites[row][col];
                if (sprite) {
                  this.spawnImpactParticles(sprite.x, sprite.y, 0xffffff, 5);
                  this.tweens.add({
                    targets: sprite,
                    scale: 0,
                    duration: 250,
                    onComplete: () => {
                      sprite.destroy();
                    }
                  });
                  this.sprites[row][col] = null;
                  this.board[row][col] = -1;
                }
              }
            }
          }

          this.score += count * 100;
          onBoosterUsed();
          this.time.delayedCall(300, () => {
            this.triggerCascade();
          });
        }

        // Intercambiar dos gemas animadamente
        swapGems(r1: number, c1: number, r2: number, c2: number) {
          this.isActionBlocked = true;
          this.sprites[r1][c1]?.clearTint().setScale(0.9);
          
          const s1 = this.sprites[r1][c1];
          const s2 = this.sprites[r2][c2];

          if (!s1 || !s2) {
            this.isActionBlocked = false;
            this.selectedGem = null;
            return;
          }

          // Intercambiar lógicamente
          const temp = this.board[r1][c1];
          this.board[r1][c1] = this.board[r2][c2];
          this.board[r2][c2] = temp;

          // Animación visual de swap
          this.tweens.add({
            targets: s1,
            x: s2.x,
            y: s2.y,
            duration: 200
          });

          this.tweens.add({
            targets: s2,
            x: s1.x,
            y: s1.y,
            duration: 200,
            onComplete: () => {
              // Reacomodar referencias de sprites
              this.sprites[r1][c1] = s2;
              this.sprites[r2][c2] = s1;
              s1.setData("row", r2).setData("col", c2);
              s2.setData("row", r1).setData("col", c1);

              // Validar si el swap genera un match
              const matches = this.checkMatches();
              if (matches.length > 0) {
                // Reducir movimientos
                this.movesLeft--;
                this.comboCount = 1;
                this.selectedGem = null;
                this.clearMatches(matches);
              } else {
                // No hay match, deshacer intercambio
                soundSynth.playSlide();
                this.tweens.add({
                  targets: s1,
                  x: s1.x === s2.x ? s1.x : s2.x, // El tween previo los movió
                  y: s1.y === s2.y ? s1.y : s2.y,
                  duration: 200
                });

                this.tweens.add({
                  targets: s2,
                  x: s1.x,
                  y: s1.y,
                  duration: 200,
                  onComplete: () => {
                    // Deshacer referencias
                    this.board[r2][c2] = this.board[r1][c1];
                    this.board[r1][c1] = temp;
                    this.sprites[r1][c1] = s1;
                    this.sprites[r2][c2] = s2;
                    s1.setData("row", r1).setData("col", c1);
                    s2.setData("row", r2).setData("col", c2);
                    
                    this.selectedGem = null;
                    this.isActionBlocked = false;
                  }
                });
              }
            }
          });
        }

        // Buscar combinaciones de 3 o más
        checkMatches(): { r: number; c: number }[] {
          const matchGrid: boolean[][] = [];
          for (let r = 0; r < BOARD_SIZE; r++) {
            matchGrid[r] = [];
            for (let c = 0; c < BOARD_SIZE; c++) {
              matchGrid[r][c] = false;
            }
          }

          let matchedAny = false;

          // Matches Horizontales
          for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE - 2; c++) {
              const type = this.board[r][c];
              if (type !== -1 && this.board[r][c + 1] === type && this.board[r][c + 2] === type) {
                matchGrid[r][c] = true;
                matchGrid[r][c + 1] = true;
                matchGrid[r][c + 2] = true;
                matchedAny = true;
              }
            }
          }

          // Matches Verticales
          for (let c = 0; c < BOARD_SIZE; c++) {
            for (let r = 0; r < BOARD_SIZE - 2; r++) {
              const type = this.board[r][c];
              if (type !== -1 && this.board[r + 1][c] === type && this.board[r + 2][c] === type) {
                matchGrid[r][c] = true;
                matchGrid[r + 1][c] = true;
                matchGrid[r + 2][c] = true;
                matchedAny = true;
              }
            }
          }

          // Recopilar coordenadas
          const coords: { r: number; c: number }[] = [];
          if (matchedAny) {
            for (let r = 0; r < BOARD_SIZE; r++) {
              for (let c = 0; c < BOARD_SIZE; c++) {
                if (matchGrid[r][c]) {
                  coords.push({ r, c });
                }
              }
            }
          }
          return coords;
        }

        // Limpiar combinaciones del tablero
        clearMatches(matches: { r: number; c: number }[]) {
          soundSynth.playPowerup();
          this.cameras.main.shake(100, 0.005);

          // Puntuación base
          const basePointsPerGem = 60;
          const pointsEarned = matches.length * basePointsPerGem * this.comboCount;
          this.score += pointsEarned;

          // Informar a React
          onScoreChanged({
            score: this.score,
            movesLeft: this.movesLeft,
            combos: this.comboCount
          });

          // Animaciones de eliminación
          matches.forEach(coord => {
            const sprite = this.sprites[coord.r][coord.c];
            if (sprite) {
              const typeColor = this.getGemColorHex(this.board[coord.r][coord.c]);
              this.spawnImpactParticles(sprite.x, sprite.y, typeColor, 6);
              
              // Crear flotante con puntuación individual
              this.showFloatingText(sprite.x, sprite.y, `+${basePointsPerGem * this.comboCount}`, typeColor);

              this.tweens.add({
                targets: sprite,
                scale: 0,
                alpha: 0,
                duration: 250,
                onComplete: () => {
                  sprite.destroy();
                }
              });

              this.sprites[coord.r][coord.c] = null;
              this.board[coord.r][coord.c] = -1;
            }
          });

          // Siguiente paso: Cascada de caída
          this.time.delayedCall(300, () => {
            this.triggerCascade();
          });
        }

        // Lógica de caída / Cascada de piezas
        triggerCascade() {
          let fellGems = false;

          // Hacer caer gemas existentes columna por columna de abajo hacia arriba
          for (let c = 0; c < BOARD_SIZE; c++) {
            let emptySpaces = 0;
            for (let r = BOARD_SIZE - 1; r >= 0; r--) {
              if (this.board[r][c] === -1) {
                emptySpaces++;
              } else if (emptySpaces > 0) {
                // Hacer caer la gema a la posición vacía
                const newRow = r + emptySpaces;
                this.board[newRow][c] = this.board[r][c];
                this.board[r][c] = -1;

                const sprite = this.sprites[r][c];
                if (sprite) {
                  this.sprites[newRow][c] = sprite;
                  this.sprites[r][c] = null;
                  sprite.setData("row", newRow);

                  const startY = (this.scale.height - (BOARD_SIZE * CELL_SIZE)) / 2 + CELL_SIZE / 2;
                  const targetY = startY + newRow * CELL_SIZE;

                  this.tweens.add({
                    targets: sprite,
                    y: targetY,
                    duration: 250,
                    ease: "Bounce.easeOut"
                  });
                  fellGems = true;
                }
              }
            }
          }

          // Rellenar espacios vacíos superiores con nuevas gemas
          const startX = (this.scale.width - (BOARD_SIZE * CELL_SIZE)) / 2 + CELL_SIZE / 2;
          const startY = (this.scale.height - (BOARD_SIZE * CELL_SIZE)) / 2 + CELL_SIZE / 2;

          for (let c = 0; c < BOARD_SIZE; c++) {
            let emptySpaces = 0;
            for (let r = 0; r < BOARD_SIZE; r++) {
              if (this.board[r][c] === -1) {
                emptySpaces++;
              }
            }
            
            for (let i = 0; i < emptySpaces; i++) {
              const r = emptySpaces - 1 - i;
              const type = Phaser.Math.Between(0, GEM_TYPES - 1);
              this.board[r][c] = type;

              const spawnX = startX + c * CELL_SIZE;
              // Iniciar justo arriba del tablero para la caída fluida
              const spawnY = startY - (i + 1) * CELL_SIZE;
              const targetY = startY + r * CELL_SIZE;

              const sprite = this.add.sprite(spawnX, spawnY, `gem_${type}`);
              sprite.setInteractive();
              sprite.setData("row", r);
              sprite.setData("col", c);
              sprite.setScale(0.9);

              this.sprites[r][c] = sprite;

              this.tweens.add({
                targets: sprite,
                y: targetY,
                duration: 300,
                ease: "Bounce.easeOut"
              });
              fellGems = true;
            }
          }

          // Retardo para evaluar matches automáticos tras caída
          this.time.delayedCall(350, () => {
            const nextMatches = this.checkMatches();
            if (nextMatches.length > 0) {
              // Racha incrementada
              this.comboCount++;
              
              const middleIndex = Math.floor(nextMatches.length / 2);
              const xPos = this.sprites[nextMatches[middleIndex].r][nextMatches[middleIndex].c]?.x || this.scale.width / 2;
              const yPos = this.sprites[nextMatches[middleIndex].r][nextMatches[middleIndex].c]?.y || this.scale.height / 2;
              
              this.showFloatingText(xPos, yPos - 20, `STREAK ${this.comboCount}x!`, 0x22d3ee);
              this.clearMatches(nextMatches);
            } else {
              // Fin de la jugada, verificar victoria o fin de movimientos
              this.comboCount = 0;
              this.checkGameState();
            }
          });
        }

        // Evaluar victoria o derrota
        checkGameState() {
          if (this.score >= scoreGoal) {
            // Ganar
            this.isActionBlocked = true;
            let stars = 1;
            if (this.score >= scoreGoal * 1.8) stars = 3;
            else if (this.score >= scoreGoal * 1.3) stars = 2;

            soundSynth.playPowerup();
            onLevelComplete({ score: this.score, stars });
          } else if (this.movesLeft <= 0) {
            // Perder
            this.isActionBlocked = true;
            soundSynth.playExplosion();
            onLevelFailed();
          } else {
            // Seguir jugando
            this.isActionBlocked = false;
          }
        }

        // Auxiliar: partículas
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

        // Auxiliar: texto flotante animado
        showFloatingText(x: number, y: number, text: string, color: number) {
          const fontConfig = {
            fontFamily: "monospace",
            fontSize: "14px",
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
            duration: 600,
            onComplete: () => textObj.destroy()
          });
        }

        getGemColorHex(type: number): number {
          const colors = [0x06b6d4, 0xec4899, 0xeab308, 0x10b981, 0x8b5cf6];
          return colors[type] || 0xffffff;
        }

        // Texturas procedimentales de gemas y partículas
        createProceduralTextures() {
          const generateTexture = (key: string, drawFn: (graphics: Phaser.GameObjects.Graphics) => void, w: number, h: number) => {
            if (this.textures.exists(key)) return;
            const graphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
            drawFn(graphics);
            graphics.generateTexture(key, w, h);
            graphics.destroy();
          };

          // Chispas
          generateTexture("tex_spark", (g) => {
            g.fillStyle(0xffffff, 1);
            g.fillCircle(3, 3, 3);
          }, 6, 6);

          // Gem 0: Diamante Celeste (Cyan)
          generateTexture("gem_0", (g) => {
            g.fillStyle(0x06b6d4, 1);
            g.fillTriangle(20, 2, 2, 20, 38, 20);
            g.fillTriangle(20, 38, 2, 20, 38, 20);
            g.lineStyle(2.5, 0xffffff, 0.6);
            g.strokeTriangle(20, 2, 2, 20, 38, 20);
            g.strokeTriangle(20, 38, 2, 20, 38, 20);
          }, 40, 40);

          // Gem 1: Corazón/Escudo Rosa (Magenta)
          generateTexture("gem_1", (g) => {
            g.fillStyle(0xec4899, 1);
            g.fillCircle(12, 12, 10);
            g.fillCircle(28, 12, 10);
            g.fillTriangle(20, 38, 2, 18, 38, 18);
            g.lineStyle(2, 0xffffff, 0.6);
            g.strokeCircle(12, 12, 10);
            g.strokeCircle(28, 12, 10);
          }, 40, 40);

          // Gem 2: Estrella Amarilla
          generateTexture("gem_2", (g) => {
            g.fillStyle(0xeab308, 1);
            g.fillTriangle(20, 2, 12, 28, 28, 28);
            g.fillTriangle(20, 38, 12, 12, 28, 12);
            g.lineStyle(2, 0xfef08a, 0.6);
            g.strokeTriangle(20, 2, 12, 28, 28, 28);
          }, 40, 40);

          // Gem 3: Triángulo Verde (Esmeralda)
          generateTexture("gem_3", (g) => {
            g.fillStyle(0x10b981, 1);
            g.fillTriangle(20, 2, 2, 38, 38, 38);
            g.lineStyle(2, 0xa7f3d0, 0.6);
            g.strokeTriangle(20, 2, 2, 38, 38, 38);
          }, 40, 40);

          // Gem 4: Hexágono Morado (Violeta)
          generateTexture("gem_4", (g) => {
            g.fillStyle(0x8b5cf6, 1);
            g.beginPath();
            g.moveTo(20, 2);
            g.lineTo(38, 11);
            g.lineTo(38, 29);
            g.lineTo(20, 38);
            g.lineTo(2, 29);
            g.lineTo(2, 11);
            g.closePath();
            g.fill();
            g.lineStyle(2, 0xc084fc, 0.6);
            g.beginPath();
            g.moveTo(20, 2);
            g.lineTo(38, 11);
            g.lineTo(38, 29);
            g.lineTo(20, 38);
            g.lineTo(2, 29);
            g.lineTo(2, 11);
            g.closePath();
            g.stroke();
          }, 40, 40);
        }
      }

      const config = {
        type: Phaser.AUTO,
        width: 500,
        height: 500,
        parent: parentRef.current,
        backgroundColor: "#090d16",
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: [PuzzleScene]
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
  }, [level, activeBooster]);

  // Manejar el trigger de Reiniciar desde el componente padre React
  useEffect(() => {
    if (triggerRestart && gameRef.current) {
      const activeScene = gameRef.current.scene.keys.PuzzleScene;
      if (activeScene) {
        activeScene.scene.restart();
        onRestartComplete();
      }
    }
  }, [triggerRestart]);

  return (
    <div className="relative w-full h-full flex flex-col items-center">
      {/* Botón de Sonido en Pantalla */}
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

      {/* Contenedor del Canvas de Phaser */}
      <div
        ref={parentRef}
        className="w-full max-w-[450px] sm:max-w-[480px] aspect-square rounded-3xl overflow-hidden border border-white/10 bg-[#090d16] shadow-2xl relative"
        style={{ contentVisibility: "auto" }}
      />
    </div>
  );
}

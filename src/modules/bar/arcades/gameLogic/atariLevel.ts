import { Brick } from "../gameObjects/brick"
import { Wall } from "../gameObjects/wall"
import { Background } from "../gameObjects/background"
import { GameManager } from "../gameManager"
import { Entity, GltfContainer, Transform, VisibilityComponent, engine } from "@dcl/sdk/ecs"
import { Color4, Vector3 } from "@dcl/sdk/math"

// Ready player one
const readyPlayerOne = engine.addEntity()
GltfContainer.create(readyPlayerOne, {src: "models/readyPlayerOne.glb"})
Transform.create(readyPlayerOne,{
  position: Vector3.create(16, 1, 16)
})
VisibilityComponent.create(readyPlayerOne, {visible: true})

// Brick
const gameElements: Entity[] = []

// Load level
export function loadAtariLevel(parent: Entity): void {

  Transform.getMutableOrNull(readyPlayerOne).parent = parent

  // Wall
  const wallLeft = new Wall(
    Vector3.create(3.5, GameManager.PLANE_HEIGHT + 0.1, 16),
    Vector3.create(2, 0.1, 32),
    Vector3.create(1, 0, 0),
    Color4.White(),
    parent
  )
  const wallTop = new Wall(
    Vector3.create(16, GameManager.PLANE_HEIGHT + 0.1, 31.5),
    Vector3.create(27, 0.1, 2),
    Vector3.create(0, 0, -1),
    Color4.White(),
    parent
  )
  const wallRight = new Wall(
    Vector3.create(28.5, GameManager.PLANE_HEIGHT + 0.1, 16),
    Vector3.create(2, 0.1, 32),
    Vector3.create(-1, 0, 0),
    Color4.White(),
    parent
  )

  // Background
  const background = new Background(Vector3.create(16, GameManager.PLANE_HEIGHT - 0.1, 16), Vector3.create(26, 0.01, 32), parent)
}

export function loadAtariBricks(parent: Entity): void {

  VisibilityComponent.getMutableOrNull(readyPlayerOne).visible = false

  // Red bricks
  let brickPosX = 6
  let redBrickPosZ = 24
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 9; j++) {
      const brick = new Brick(
        Vector3.create(brickPosX, GameManager.PLANE_HEIGHT, redBrickPosZ),
        Vector3.create(2, 0.1, 1),
        Color4.Red(),
        parent
      )
      brickPosX += 2.5
      gameElements.push(brick)
    }
    redBrickPosZ -= 1.5
    brickPosX = 6
  }

  // Green bricks
  let greenBrickPosZ = 19.5
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 9; j++) {
      const brick = new Brick(
        Vector3.create(brickPosX, GameManager.PLANE_HEIGHT, greenBrickPosZ),
        Vector3.create(2, 0.1, 1),
        Color4.Green(),
        parent
      )
      brickPosX += 2.5
      gameElements.push(brick.entity)
    }
    greenBrickPosZ -= 1.5
    brickPosX = 6
  }
}

export function unloadAtariBricks(): void {
  VisibilityComponent.getMutableOrNull(readyPlayerOne).visible = true

  while (gameElements.length) {
    let gameElement = gameElements.pop()
    engine.removeEntity(gameElement)
  }
}

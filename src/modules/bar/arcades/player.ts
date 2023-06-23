import { Paddle } from "./gameObjects/paddle"
import { Ball } from "./gameObjects/ball"
import { GameManager } from "./gameManager"
import { Arcade } from "./gameObjects/arcade"
import { Entity, InputAction, PointerEventType, Transform, engine, inputSystem } from "@dcl/sdk/ecs"
import { Color4, Vector3 } from "@dcl/sdk/math"
import { Input } from "@dcl/sdk/react-ecs"

// Intermediate variables
const input = Input.instance
let buttonSystem: ISystem
let paddle: Paddle
let activeParent: Entity
// To store player elements to load and unload
const playerElements: Entity[] = []

export function loadPlayer(parent: Entity, arcade: Arcade): void {

  activeParent = parent
  
  // Game has loaded
  GameManager.hasGameLoaded = true

  // Paddle
  paddle = new Paddle(Vector3.create(16, GameManager.PLANE_HEIGHT, 4), Vector3.create(2, 0.01, 1), Color4.Blue(), activeParent)
  playerElements.push(paddle.entity)

  // Fire a ball
  input.subscribe("BUTTON_DOWN", InputAction.IA_POINTER, false, () => {
    if (GameManager.hasGameLoaded && !GameManager.isBallAlive) {
      GameManager.isBallAlive = true
      let forwardVector = Vector3.Forward()
      forwardVector.y = 0 // Ignore y-axis
      shoot(Vector3.normalize(forwardVector))
    }
  })

  engine.addSystem(() => {
    const cmd = inputSystem.getInputCommand(
      InputAction.IA_POINTER,
      PointerEventType.PET_DOWN
    )
    if (cmd) {
      console.log(cmd.hit.entityId)
    }
  })
  inputSystem.getInputCommand(InputAction.IA_POINTER, PointerEventType.PET_DOWN)
  // E Key
  
  input.subscribe("BUTTON_DOWN", InputAction.IA_PRIMARY, false, () => {
    GameManager.isEKeyPressed = true
  })
  input.subscribe("BUTTON_UP", InputAction.IA_PRIMARY, false, () => {
    GameManager.isEKeyPressed = false
  })

  // F Key
  input.subscribe("BUTTON_DOWN", InputAction.IA_SECONDARY, false, () => {
    GameManager.isFKeyPressed = true
  })
  input.subscribe("BUTTON_UP", InputAction.IA_SECONDARY, false, () => {
    GameManager.isFKeyPressed = false
  })

  // Calculate paddle position above all else
  class ButtonChecker {
    update(dt: number) {
      let transform = Transform.getMutableOrNull(paddle.entity)
      let increment = Vector3.Right().scale(dt * GameManager.PADDLE_SPEED)

      if (!GameManager.isEKeyPressed && !GameManager.isFKeyPressed) arcade.controlStop()

      if (GameManager.isEKeyPressed && transform.position.x >= GameManager.NEG_X_LIMIT) {
        transform.translate(increment.multiplyByFloats(-1, -1, -1))
        arcade.controlLeft()
      }
      if (GameManager.isFKeyPressed && transform.position.x <= GameManager.POS_X_LIMIT) {
        transform.translate(increment)
        arcade.controlRight()
      }
    }
  }

  buttonSystem = engine.addSystem(new ButtonChecker(), 0)

  function shoot(direction: Vector3): void {
    let paddlePosition = Transform.getMutableOrNull(paddle.entity).position
    let spawnPosition = Vector3.create(paddlePosition.x, GameManager.PLANE_HEIGHT, paddlePosition.z + 1)
    const ball = new Ball(spawnPosition, Vector3.create(0.3, 0.1, 0.4), direction, activeParent)
    playerElements.push(ball.entity)
  }
}

export function unloadPlayer() {
  while (playerElements.length) {
    let playerElement = playerElements.pop() as Entity
    engine.removeEntity(playerElement)
  }
  GameManager.hasGameLoaded = false
  GameManager.isBallAlive = false
  engine.removeSystem(buttonSystem)
}

import { Ball, BallFlag } from "../gameObjects/ball"
import { Sound } from "../gameObjects/sound"
import { GameManager } from "../gameManager"
import { AudioSource, Transform, engine } from "@dcl/sdk/ecs"
import { Vector3 } from "@dcl/sdk/math"

// Sound
const missSound = new Sound("sounds/miss.mp3")



function ballTranslatorSystem(dt: number) {

  let ballGroup = engine.getEntitiesWith(BallFlag, Transform)

  for(const [ballEntity, ballFlag, ballTransformRO] of ballGroup){
    let transform = ballTransformRO
    let scale = ballTransformRO.scale
    let increment = Vector3.scale(ballFlag.direction, dt * GameManager.BALL_SPEED)

    if (transform.position.z <= GameManager.OUT_OF_BOUNDS) {
      GameManager.isBallAlive = false
      AudioSource.getMutableOrNull(missSound.entity).playing = true
      engine.removeEntity(ballEntity)
    }
    if (transform.position.x < 0 || transform.position.x > 32 || transform.position.z < 0 || transform.position.z > 32) {
      GameManager.isBallAlive = false
      engine.removeEntity(ballEntity)
    }
  }
}


engine.addSystem(ballTranslatorSystem, 1)

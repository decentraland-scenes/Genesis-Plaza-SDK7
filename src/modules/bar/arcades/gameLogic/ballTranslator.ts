import { Ball, BallFlag } from "../gameObjects/ball"
import { Sound } from "../gameObjects/sound"
import { GameManager } from "../gameManager"
import { AudioSource, Transform, engine } from "@dcl/sdk/ecs"

// Sound
const missSound = new Sound("sounds/miss.mp3")

class BallTranslatorSystem {
  private ballGroup = engine.getComponentGroup(BallFlag)

  update(dt: number) {
    for (let entity of this.ballGroup.entities as Ball[]) {
      let transform = Transform.getMutableOrNull(entity)
      let increment = Transform.getMutableOrNull(entity).scale(dt * GameManager.BALL_SPEED)
      transform.translate(increment)
      if (transform.position.z <= GameManager.OUT_OF_BOUNDS) {
        GameManager.isBallAlive = false
        AudioSource.getMutableOrNull(missSound).playing = true
        engine.removeEntity(entity)
      }
      if (transform.position.x < 0 || transform.position.x > 32 || transform.position.z < 0 || transform.position.z > 32) {
        GameManager.isBallAlive = false
        engine.removeEntity(entity)
      }
    }
  }
}

engine.addSystem(new BallTranslatorSystem(), 1)

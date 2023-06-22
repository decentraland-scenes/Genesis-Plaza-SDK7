import { Ball, BallFlag } from "../gameObjects/ball"
import { Sound } from "../gameObjects/sound"
import { GameManager } from "../gameManager"
import { AudioSource, Transform, engine } from "@dcl/sdk/ecs"

// Sound
const missSound = new Sound("sounds/miss.mp3")

class BallTranslatorSystem {
  private ballGroup = engine.getEntitiesWith(BallFlag, Transform)

  update(dt: number) {

    for(const [ballEntity, ballFlag, ballTransformRO] of this.ballGroup){
      let transform = ballTransformRO
      let scale = ballTransformRO.scale
      let increment = scale(dt * GameManager.BALL_SPEED)

      if (transform.position.z <= GameManager.OUT_OF_BOUNDS) {
        GameManager.isBallAlive = false
        AudioSource.getMutableOrNull(missSound.entity).playing = true
        engine.removeEntity()
      }
      if (transform.position.x < 0 || transform.position.x > 32 || transform.position.z < 0 || transform.position.z > 32) {
        GameManager.isBallAlive = false
        engine.removeEntity(entity)
      }
    }
  }
}

engine.addSystem(new BallTranslatorSystem())

import { Entity, GltfContainer, Transform, engine } from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { Arcade } from './gameObjects/arcade'
import * as utils from '@dcl-sdk/utils'
import { loadAtariBricks, loadAtariLevel, unloadAtariBricks } from './gameLogic/atariLevel'
import { Box } from 'cannon/build/cannon'
import { GameManager } from './gameManager'
import { loadPlayer, unloadPlayer } from './player'
// import { scene } from "./scene"

export function addArcades() {
  // Atari arcade cabinets
  const arcadeAtariShape = 'models/core_building/arcadeCabinetAtari.glb'
  

  const atariEntity1 = engine.addEntity()
  const atariEntity2 = engine.addEntity()
  const atariEntity3 = engine.addEntity()

  Transform.create( atariEntity1,{
    position: Vector3.create(167, 10.7, 164),
    rotation: Quaternion.fromEulerDegrees(0, 180 + 24, 0),
  })
  Transform.create(atariEntity2,{
    position: Vector3.create(154, 10.7, 163),
    rotation: Quaternion.fromEulerDegrees(0, 180 + -24, 0),
  })
  Transform.create(atariEntity3,{
    position: Vector3.create(175, 10.7, 144.7),
    rotation: Quaternion.fromEulerDegrees(0, 180 + 24, 0),
  })

  // Atari arcade positions and triggers
  const arcadeAtariPos: Entity[] = [atariEntity1, atariEntity2, atariEntity3]


  // ISSUE: These ecs-utils triggers can't rotate but work fine for now...
  const arcadeAtariTriggerPos: Vector3[] = [
    Vector3.create(0, 2, 0.5),
    Vector3.create(0, 2, 0.5),
    Vector3.create(0, 2, 0.5)
  ]

  // Atari arcade cabinet
  for (let i = 0; i < arcadeAtariPos.length; i++) {
    let transform = Transform.getMutableOrNull(arcadeAtariPos[i])
    const arcadeCabinetAtari = new Arcade(
      arcadeAtariShape,
      transform.position,
      transform.scale
    )

    // Breakout game
    const atariGameTransform = engine.addEntity()
    Transform.create(atariGameTransform, {position: Vector3.create(-0.48, 1.38, -0.155), scale: Vector3.create(.3, .3, .3), parent: arcadeCabinetAtari})
    /*
    //TODO
    transform.rotation = Quaternion.fromLookAt(Vector3.Zero(), Vector3.Left()) // Rotate 90% using a look matrix
    transform.rotation = Quaternion.fromEulerDegrees(90, 0, 0)


    Transform.getMutableOrNull(atariGameTransform).rotate(Vector3.Left(), 75)
    */
    let arcadeCabinetAtariTrigger = engine.addEntity()
    utils.triggers.addTrigger(arcadeCabinetAtariTrigger, utils.NO_LAYERS, utils.LAYER_1,
      [{type: "box",position: arcadeAtariTriggerPos[i], scale: Vector3.create(3, 3, 3)}],
      () => {
        if (!GameManager.hasGameLoaded) {
          loadAtariBricks(atariGameTransform)
          loadPlayer(atariGameTransform, arcadeCabinetAtari)
        }
      },
      () => {
        if (GameManager.hasGameLoaded) {
          unloadAtariBricks()
          unloadPlayer()
        }
      }
    )

    loadAtariLevel(atariGameTransform)
  }
}

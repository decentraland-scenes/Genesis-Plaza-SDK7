import { Arcade } from 'gameObjects/arcade'
import { loadPlayer, unloadPlayer } from 'player'
import {
  loadAtariLevel,
  loadAtariBricks,
  unloadAtariBricks,
} from 'gameLogic/atariLevel'
import { GameManager } from 'gameManager'
import * as utils from '@dcl/ecs-scene-utils'
import { Entity, GltfContainer, Transform, engine } from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'
// import { scene } from "./scene"

export function addArcades() {
  // Atari arcade cabinets
  const arcadeAtariShape = engine.addEntity()
  GltfContainer.create(arcadeAtariShape, {src:'models/core_building/arcadeCabinetAtari.glb'})
  

  const atariPos1 = engine.addEntity()
  const atariPos2 = engine.addEntity()
  const atariPos3 = engine.addEntity()

  Transform.create( atariPos1,{
    position: Vector3.create(167, 10.7, 164),
    rotation: Quaternion.fromEulerDegrees(0, 180 + 24, 0),
  })

  Transform.create(atariPos2,{
    position: Vector3.create(154, 10.7, 163),
    rotation: Quaternion.fromEulerDegrees(0, 180 + -24, 0),
  })
  Transform.create(atariPos3,{
    position: Vector3.create(175, 10.7, 144.7),
    rotation: Quaternion.fromEulerDegrees(0, 180 + 24, 0),
  })

  // Atari arcade positions and triggers
  const arcadeAtariPos: Entity[] = [atariPos1, atariPos2, atariPos3]


  // ISSUE: These ecs-utils triggers can't rotate but work fine for now...
  const arcadeAtariTriggerPos: Vector3[] = [
    Vector3.create(0, 2, 0.5),
    Vector3.create(0, 2, 0.5),
    Vector3.create(0, 2, 0.5)
  ]

  // Atari arcade cabinet
  for (let i = 0; i < arcadeAtariPos.length; i++) {
    const arcadeCabinetAtari = new Arcade(
      arcadeAtariShape,
      arcadeAtariPos[i]
    )

    // Breakout game
    const atariGameTransform = engine.addEntity()
    Transform.create(atariGameTransform, {position: Vector3.create(-0.48, 1.38, -0.155), scale: Vector3.create(.3, .3, .3), parent: arcadeCabinetAtari})
    

    atariGameTransform.getComponent(Transform).rotate(Vector3.Left(), 75)

    let arcadeCabinetAtariTrigger = new utils.TriggerBoxShape(
      Vector3.create(3, 3, 3),
      arcadeAtariTriggerPos[i]
    )
    loadAtariLevel(atariGameTransform)

    arcadeCabinetAtari.addComponent(
      new utils.TriggerComponent(arcadeCabinetAtariTrigger, {
        onCameraEnter: () => {
          if (!GameManager.hasGameLoaded) {
            loadAtariBricks(atariGameTransform)
            loadPlayer(atariGameTransform, arcadeCabinetAtari)
          }
        },
        onCameraExit: () => {
          if (GameManager.hasGameLoaded) {
            unloadAtariBricks()
            unloadPlayer()
          }
        },
        enableDebug: false,
      })
    )
  }
}

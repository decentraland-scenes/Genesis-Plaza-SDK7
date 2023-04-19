//import * as utils from '@dcl/ecs-scene-utils'

import { sceneMessageBus } from '../serverHandler'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { PBGltfContainer, TransformTypeWithOptionals } from '@dcl/sdk/ecs'
import { log } from '../../back-ports/backPorts'

//TODO TAG:PORT-REIMPLEMENT-ME
/*
let open = new AudioClip('sounds/door-open.mp3')
let close = new AudioClip('sounds/door-close.mp3')
open.volume = 1
open.loop = false
close.volume = 1
close.loop = false

/// Reusable class for all platforms
export class Door extends Entity {
  //model: PBGltfContainer
  animationOpen: AnimationState
  animationClose: AnimationState
  isOpen: boolean = false
  isPlayerIn: boolean = false
  soundOpen: AudioClip
  soundClose: AudioClip

  constructor(
    model: PBGltfContainer,
    doorPos: TransformTypeWithOptionals,
    triggerPos: TransformTypeWithOptionals,
    triggerScale: Vector3,
    animationOpen: string,
    animationClose: string,
    messageBusHandle: string,
    withTrigger: boolean = true
  ) {
    super()
    engine.addEntity(this)

    this.addComponent(model)
    this.addComponent(new Transform(doorPos))

    this.addComponent(new Animator())

    this.animationOpen = new AnimationState(animationOpen, { looping: false })
    this.getComponent(Animator).addClip(this.animationOpen)

    this.animationClose = new AnimationState(animationClose, {
      looping: false,
    })
    this.getComponent(Animator).addClip(this.animationClose)

    this.addComponent(new AudioSource(open))

    if (withTrigger) {
      const triggerEntity = new Entity()
      triggerEntity.addComponent(new Transform(triggerPos))

      let triggerBox = new utils.TriggerBoxShape(triggerScale, Vector3.Zero())

      triggerEntity.addComponent(
        new utils.TriggerComponent(
          triggerBox, //shape
          {
            onCameraEnter: () => {
              log('open door')
              this.isPlayerIn = true
              sceneMessageBus.emit(messageBusHandle, { open: true })
            },
            onCameraExit: () => {
              log('close door')
              this.isPlayerIn = false
              sceneMessageBus.emit(messageBusHandle, { open: false })
            },
            //enableDebug: true,
          }
        )
      )
      engine.addEntity(triggerEntity)
    }

    // this.animationClose1.stop()
    // this.animationClose2.stop()
    this.animationOpen.stop()
  }

  public open(): void {
    if (this.isOpen) return
    this.animationClose.stop()
    this.animationOpen.stop()

    this.animationOpen.play()

    this.isOpen = true

    const source = new AudioSource(open)
    this.addComponentOrReplace(source)
    source.playing = true
  }

  public close(): void {
    if (!this.isOpen || this.isPlayerIn) return
    this.animationOpen.stop()
    this.animationClose.stop()

    this.animationClose.play()
    this.isOpen = false

    const source = new AudioSource(close)
    this.addComponentOrReplace(source)
    source.playing = true
  }
}

export function placeDoors() {
  let main_door1 = new Door(
    {src:'models/core_building/Door_Entrance_L.glb'},
    { rotation: Quaternion.fromEulerDegrees(0, 180, 0) },
    { position: Vector3.create(160, 2, 126) },
    Vector3.create(16, 8, 8),
    'DoorLeft_Open',
    'DoorLeft_Close',
    'mainDoor'
  )

  let main_door2 = new Door(
    {src:'models/core_building/Door_Entrance_R.glb'},
    { rotation: Quaternion.fromEulerDegrees(0, 180, 0) },
    { position: Vector3.create(160, 2, 126) },
    Vector3.create(16, 8, 8),
    'DoorRight_Open',
    'DoorRight_Close',
    'mainDoor',
    false
  )

  sceneMessageBus.on('mainDoor', (e) => {
    if (e.open) {
      main_door1.open()
      main_door2.open()
    } else {
      main_door1.close()
      main_door2.close()
    }
  })

  let right_door1 = new Door(
    {src:'models/core_building/Door_Entrance_Right_L.glb'},
    { rotation: Quaternion.fromEulerDegrees(0, 180, 0) },
    { position: Vector3.create(186, 2, 153) },
    Vector3.create(8, 8, 16),
    'EntranceRight_DoorLeft_Open',
    'EntranceRight_DoorLeft_Close',
    'rightDoor'
  )

  let right_door2 = new Door(
    {src:'models/core_building/Door_Entrance_Right_R.glb'},
    { rotation: Quaternion.fromEulerDegrees(0, 180, 0) },
    { position: Vector3.create(186, 2, 153) },
    Vector3.create(8, 8, 16),
    'EntranceRight_DoorRight_Open',
    'EntranceRight_DoorRight_Close',
    'rightDoor',
    false
  )

  sceneMessageBus.on('rightDoor', (e) => {
    if (e.open) {
      right_door1.open()
      right_door2.open()
    } else {
      right_door1.close()
      right_door2.close()
    }
  })

  let left_door1 = new Door(
    {src:'models/core_building/Door_Entrance_Left_L.glb'},
    { rotation: Quaternion.fromEulerDegrees(0, 180, 0) },
    { position: Vector3.create(135, 2, 153) },
    Vector3.create(8, 8, 16),
    'EntranceLeft_DoorLeft_Open',
    'EntranceLeft_DoorLeft_Close',
    'leftDoor'
  )

  let left_door2 = new Door(
    {src:'models/core_building/Door_Entrance_Left_R.glb'},
    { rotation: Quaternion.fromEulerDegrees(0, 180, 0) },
    { position: Vector3.create(135, 2, 153) },
    Vector3.create(8, 8, 16),
    'EntranceLeft_DoorRight_Open',
    'EntranceLeft_DoorRight_Close',
    'leftDoor',
    false
  )

  sceneMessageBus.on('leftDoor', (e) => {
    if (e.open) {
      left_door1.open()
      left_door2.open()
    } else {
      left_door1.close()
      left_door2.close()
    }
  })
}
*/
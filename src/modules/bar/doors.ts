//import * as utils from '@dcl/ecs-scene-utils'

import { sceneMessageBus } from '../serverHandler'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { Animator, AudioSource, Entity, GltfContainer, PBGltfContainer, Transform, TransformTypeWithOptionals, engine } from '@dcl/sdk/ecs'
import { log } from '../../back-ports/backPorts'
import { coreBuildingOffset } from '../../lobby/resources/globals'


//TODO TAG:PORT-REIMPLEMENT-ME

let openUrl = 'sounds/door-open.mp3'
let closeUrl = 'sounds/door-close.mp3'


/// Reusable class for all platforms
export class Door  {
  //model: PBGltfContainer
  entity:Entity
  animationOpen: string//AnimationState
  animationClose: string//AnimationState
  isOpen: boolean = false
  isPlayerIn: boolean = false
  soundOpen: Entity
  soundClose: Entity

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

    this.entity = engine.addEntity()
    //engine.addEntity(this)

    GltfContainer.create(this.entity,model)
    Transform.create(this.entity,doorPos)
    //this.addComponent(new Transform(doorPos))

    //this.addComponent(new Animator())
    Animator.create(this.entity, {
      states:[
        {
          name: animationOpen,
          clip: animationOpen,
          playing: false,
          loop: false
        },
        {
          name: animationClose,
          clip: animationClose,
          playing: false,
          loop: false
        }
      ]
    }
    )
    this.animationOpen = animationOpen
    this.animationClose = animationClose
   
    this.soundOpen = engine.addEntity()
    Transform.create(this.soundOpen,{parent:this.entity})

    this.soundClose = engine.addEntity()
    Transform.create(this.soundClose,{parent:this.entity})
    
    AudioSource.create(this.soundClose,{
      audioClipUrl:closeUrl,
      volume:1,
      loop: false,
      playing: false
    })

    AudioSource.create(this.soundOpen,{
      audioClipUrl:openUrl,
      volume:1,
      loop: false,
      playing: false
    })
    /*
    //TODO TAG:PORT-REIMPLEMENT-ME
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
    */

    Animator.getClip(this.entity,this.animationOpen).playing = false
    Animator.getClip(this.entity,this.animationClose).playing = false
  }

  public open(): void {
    if (this.isOpen) return
    
    Animator.getClip(this.entity,this.animationOpen).playing = false
    Animator.getClip(this.entity,this.animationClose).playing = false
    
    Animator.getClip(this.entity,this.animationOpen).playing = true

    this.isOpen = true

    AudioSource.getMutable(this.soundOpen).playing = true
    AudioSource.getMutable(this.soundClose).playing = false
  }

  public close(): void {
    if (!this.isOpen || this.isPlayerIn) return
    
    Animator.getClip(this.entity,this.animationOpen).playing = false
    Animator.getClip(this.entity,this.animationClose).playing = false
    
    Animator.getClip(this.entity,this.animationClose).playing = true

    this.isOpen = false

    AudioSource.getMutable(this.soundOpen).playing = false
    AudioSource.getMutable(this.soundClose).playing = true
  }
}

export function placeDoors() {
  let main_door1 = new Door( 
    {src:'models/core_building/Door_Entrance_L.glb'},
    { position: Vector3.create(0 - coreBuildingOffset.x, 0, 0 - coreBuildingOffset.z),
      rotation: Quaternion.fromEulerDegrees(0, 180, 0) },
    { position: Vector3.create(160 , 2, 126 ) },
    Vector3.create(16, 8, 8),
    'DoorLeft_Open',
    'DoorLeft_Close',
    'mainDoor'
  )

  let main_door2 = new Door(
    {src:'models/core_building/Door_Entrance_R.glb'},
    { position: Vector3.create(0 - coreBuildingOffset.x, 0, 0 - coreBuildingOffset.z),
      rotation: Quaternion.fromEulerDegrees(0, 180, 0) },
    { position: Vector3.create(160 , 2, 126  ) },
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
    { position: Vector3.create(0 - coreBuildingOffset.x, 0, 0 - coreBuildingOffset.z),
      rotation: Quaternion.fromEulerDegrees(0, 180, 0) },
    { position: Vector3.create(186  - coreBuildingOffset.x, 2, 153  - coreBuildingOffset.z) },
    Vector3.create(8, 8, 16),
    'EntranceRight_DoorLeft_Open',
    'EntranceRight_DoorLeft_Close',
    'rightDoor'
  )

  let right_door2 = new Door(
    {src:'models/core_building/Door_Entrance_Right_R.glb'},
    { position: Vector3.create(0 - coreBuildingOffset.x, 0, 0 - coreBuildingOffset.z),
      rotation: Quaternion.fromEulerDegrees(0, 180, 0) },
    { position: Vector3.create(186  - coreBuildingOffset.x, 2, 153  - coreBuildingOffset.z) },
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
    { position: Vector3.create(0 - coreBuildingOffset.x, 0, 0 - coreBuildingOffset.z),
      rotation: Quaternion.fromEulerDegrees(0, 180, 0) },
    { position: Vector3.create(135  - coreBuildingOffset.x, 2, 153  - coreBuildingOffset.z) },
    Vector3.create(8, 8, 16),
    'EntranceLeft_DoorLeft_Open',
    'EntranceLeft_DoorLeft_Close',
    'leftDoor'
  )

  let left_door2 = new Door(
    {src:'models/core_building/Door_Entrance_Left_R.glb'},
    { position: Vector3.create(0 - coreBuildingOffset.x, 0, 0 - coreBuildingOffset.z),
      rotation: Quaternion.fromEulerDegrees(0, 180, 0) },
    { position: Vector3.create(135  - coreBuildingOffset.x, 2, 153  - coreBuildingOffset.z) },
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

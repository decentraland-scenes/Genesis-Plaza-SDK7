import { sceneMessageBus } from './serverHandler'
import * as utils from '@dcl-sdk/utils'
import { Radios } from './bar/jukebox'
import { Animator, AudioSource, AudioStream, Entity, GltfContainer, InputAction, PBAnimationState, PBAnimator, PBGltfContainer, Transform, engine, pointerEventsSystem } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'

export function startArtichoke() {
  let isInRadioRange: boolean = false
  let currentRadio: Radios | null = null

  const musicStreamEnt = engine.addEntity()
  let musicStream: string | null = null

  let baseConsole = engine.addEntity()
  GltfContainer.create(baseConsole, {src: 'models/console-artichoke/base_console.glb'})
  Transform.create(baseConsole, {
    position: Vector3.create(44.8, 8.5, 36.8),
    rotation: Quaternion.fromEulerDegrees(0, 60, 0)
  })

  class ConsoleButton {
    buttonEntity: Entity
    clickAnim: PBAnimator
    constructor(model: PBGltfContainer, parent: Entity, animationName: string) {
      this.buttonEntity = engine.addEntity()
      GltfContainer.create(this.buttonEntity, model)
      Transform.create(this.buttonEntity, {
        parent: parent
      })

      AudioSource.create(this.buttonEntity, {
        audioClipUrl: 'sounds/click.mp3',
        playing: false,
        loop: false
      })
      
      this.clickAnim = {
        states: [
          {
            clip: animationName,
            playing: false,
            loop: false
          }
        ]
      }
      Animator.create(this.buttonEntity, this.clickAnim)
    }
    
    press(): void {
        console.log(`press button: ${this.buttonEntity} animation:`, this.clickAnim)
      AudioSource.getMutable(this.buttonEntity).playing = true
      Animator.getMutable(this.buttonEntity).states[0].playing = true
    }
  }

  let blueButton = new ConsoleButton(
    { src: 'models/console-artichoke/blue_button.glb' },
    baseConsole,
    'Blue_ButtonAction'
  )
  // pointerEventsSystem.onPointerDown({
  //   entity: blueButton.buttonEntity,
  //   opts: {
  //       button: InputAction.IA_POINTER,
  //       hoverText: 'Rave'
  //   }},
  //   function () {
  //       sceneMessageBus.emit('setRadio', {
  //           station: Radios.ISLASLOWBEAT,
  //       })
  //       blueButton.press()
  //   }
  // )

  let greenButton = new ConsoleButton(
    { src: 'models/console-artichoke/green_button.glb' },
    baseConsole,
    'Green_ButtonAction'
  )
  // pointerEventsSystem.onPointerDown({
  //   entity: greenButton.buttonEntity,
  //   opts: {
  //       button: InputAction.IA_POINTER,
  //       hoverText: 'Isla Negra Radio'
  //   }},
  //   function () {
  //       sceneMessageBus.emit('setRadio', {
  //           station: Radios.ISLASLOWBEAT,
  //       })
  //       greenButton.press()
  //   }
  // )

  let lightBlueButton = new ConsoleButton(
    { src: 'models/console-artichoke/lightblue_button.glb' },
    baseConsole,
    'Lightblue_ButtonAction'
  )
  // pointerEventsSystem.onPointerDown({
  //   entity: lightBlueButton.buttonEntity,
  //   opts: {
  //       button: InputAction.IA_POINTER,
  //       hoverText: 'Upbeat'
  //   }},
  //   function () {
  //       sceneMessageBus.emit('setRadio', {
  //           station: Radios.ISLAUPBEAT,
  //       })
  //       lightBlueButton.press()
  //   }
  // )

  let redButton = new ConsoleButton(
    { src: 'models/console-artichoke/red_button.glb' },
    baseConsole,
    'Red_ButtonAction'
  )
  // pointerEventsSystem.onPointerDown({
  //   entity: redButton.buttonEntity,
  //   opts: {
  //       button: InputAction.IA_POINTER,
  //       hoverText: 'Classic Radio'
  //   }},
  //   function () {
  //       sceneMessageBus.emit('setRadio', {
  //           station: Radios.ISLACLASSIC,
  //       })
  //       redButton.press()
  //   }
  // )

  let yellowButton = new ConsoleButton(
    { src: 'models/console-artichoke/yellow_button.glb' },
    baseConsole,
    'Yellow_ButtonAction'
  )
  pointerEventsSystem.onPointerDown({
    entity: yellowButton.buttonEntity,
    opts: {
        button: InputAction.IA_POINTER,
        hoverText: 'Upbeat'
    }},
    function () {
        sceneMessageBus.emit('setRadio', {
            station: Radios.ISLAUPBEAT,
        })
        yellowButton.press()
    }
  )

  sceneMessageBus.on('setRadio', (e) => {
    //  if()  if close
    console.log('set radio on. Entity:', musicStreamEnt, e.station, musicStream)
    currentRadio = e.station
    radioOn(e.station)
  })

  function radioOn(station: Radios) {
    Animator.getMutable(artichokeLightsA).states[0].playing = true
    Animator.getMutable(artichokeLightsB).states[0].playing = true
    Animator.getMutable(artichokeLightsC).states[0].playing = true
    if (isInRadioRange) {
        AudioStream.createOrReplace(musicStreamEnt, {
            url: station,
            playing: true
        })
        musicStream = station
    }
  }
  
  function radioOff() {
    Animator.stopAllAnimations(artichokeLightsA)
    Animator.stopAllAnimations(artichokeLightsB)
    Animator.stopAllAnimations(artichokeLightsC)
    if (musicStream) {
        AudioStream.getMutable(musicStreamEnt).playing = false
    }
  }

  ///// LIGTHS

  let LightsA: PBAnimator = {
    states: [{
      clip: 'Lights_Anim',
      playing: false,
      loop: true,
      shouldReset: true
    }]
  }
  let LightsB: PBAnimator = {
    states: [{
      clip: 'LightsB_Artichoke',
      playing: false,
      loop: true,
      shouldReset: true
    }]
  }
  let LightsC: PBAnimator = {
    states: [{
      clip: 'LightsC_Artichoke',
      playing: false,
      loop: true,
      shouldReset: true
    }]
  }
  
  let artichokeLightsA = engine.addEntity()
  GltfContainer.create(artichokeLightsA, {src: 'models/LightsA_Artichoke.glb'})
  Transform.create(artichokeLightsA, {
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  Animator.create(artichokeLightsA, LightsA)

  let artichokeLightsB = engine.addEntity()
  GltfContainer.create(artichokeLightsB, {src: 'models/LightsB_Artichoke.glb'})
  Transform.create(artichokeLightsB, {
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  Animator.create(artichokeLightsB, LightsB)

  let artichokeLightsC = engine.addEntity()
  GltfContainer.create(artichokeLightsC, {src: 'models/LightsC_Artichoke.glb'})
  Transform.create(artichokeLightsC, {
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  Animator.create(artichokeLightsC, LightsC)

  const artichokeTrigger = engine.addEntity()
  Transform.create(artichokeTrigger, {
    position: Vector3.create(47, 6, 46)
  })

  utils.triggers.addTrigger(
    artichokeTrigger,
    utils.NO_LAYERS,
    utils.LAYER_1,
    [
        {
            type: 'sphere',
            radius: 22
            // type: 'box',
            // scale: Vector3.create(90, 14, 90)
        }
    ],
    (enterEntity)=>{
        console.log('artichoke. radio trigger area. enter')
        sceneMessageBus.emit('enteredRadioRange', {})
        isInRadioRange = true
        if (currentRadio) {
          radioOn(currentRadio)
        }
    },
    (exitEntity)=>{
        console.log('artichoke. radio trigger area. exit')
        isInRadioRange = false
        radioOff()
    },
  )

  sceneMessageBus.on('enteredRadioRange', (e) => {
    if (!isInRadioRange || currentRadio === null) return
    sceneMessageBus.emit('setRadio', {
      station: currentRadio,
    })
  })
}

import { Animator, AudioSource, AudioStream, Entity, GltfContainer, InputAction, Material, MeshRenderer, PBAudioStream, TextShape, Transform, VisibilityComponent, engine, pointerEventsSystem } from '@dcl/sdk/ecs'
import { Color3, Vector3 } from '@dcl/sdk/math'
import { lobbyCenter } from './resources/globals'
import { lobbyHeight } from './resources/globals'
import { isInBar, setBarMusicOn } from '../modules/bar/jukebox'
//import { tutorialEnableObservable } from '../modules/tutorialHandler'

import { onEnterSceneObservable, onLeaveSceneObservable} from '@dcl/sdk/observables'

import * as utils from '@dcl-sdk/utils'

import { showTeleportUI } from '../ui'
import { TimerId } from '@dcl-sdk/utils/dist/timer'
import { CountDownUtil } from './countDown'

const triggerCounter = new CountDownUtil()

// AMBIENT SOUND, WATER + BIRDS
let ambienceBox = engine.addEntity()
AudioSource.create(ambienceBox,{
  audioClipUrl: 'sounds/lobby_ambience.mp3',
  volume: 1,
  loop: true,
  playing: true
})
Transform.create(ambienceBox, {
  position: Vector3.create(lobbyCenter.x, lobbyHeight, lobbyCenter.z)
})

// LOBBY MUSIC
let musicBox = engine.addEntity()
Transform.create(musicBox, {
  position: Vector3.create(0, 2, 0),
  parent: engine.PlayerEntity
})
AudioSource.create(musicBox, {
  audioClipUrl: 'sounds/lobby_music.mp3',
  volume: 0.2,
  loop: true,
  playing: true
})



/*
tutorialEnableObservable.add((tutorialEnabled: boolean) => {
  let lobbyMusic = AudioSource.getMutableOrNull(musicBox)

  if (tutorialEnabled) {
    lobbyMusic = AudioSource.getMutableOrNull(musicBox)
    if(lobbyMusic) lobbyMusic.playing = false

    tutorialRunning = true
  } else {
    // tutorial over
    tutorialRunning = false
    if (player.camera.position.y > 30) {
      lobbyMusic = AudioSource.getMutableOrNull(musicBox)
      if(lobbyMusic) lobbyMusic.playing = true
    } else if (isInBar) {
      setBarMusicOn()
    }
  }

  
  if(lobbyMusic) lobbyMusic.playing = tutorialEnabled ? false : true
})
*/


export let tutorialRunning: boolean = false



// BEAM MESH
const beam = engine.addEntity()
Transform.create(beam,{
    position: Vector3.create(lobbyCenter.x, lobbyCenter.y, lobbyCenter.z)
})
GltfContainer.createOrReplace(beam, {
    src: "models/lobby/beam.glb"
})

export class TeleportController {
    triggerBoxUp: Entity
    triggerBoxUpPosition: Vector3
    triggerBoxUpScale: Vector3
    triggerBoxDown: Entity
    triggerBoxDownPosition: Vector3
    triggerBoxDownScale: Vector3
    triggerBoxFallCheck: Entity
    triggerBoxFallCheckPosition: Vector3
    triggerBoxFallCheckScale: Vector3
    triggers: Entity[]
    delayedTriggers: Entity[]
    portalLiftSpiral: Entity
    beamFireSound: Entity
    beamFallSound: Entity
    impactSound: Entity

    
  
    constructor() {
      this.triggers = []
      this.delayedTriggers = []
  
      // Trigger to handle teleporting the player up to the cloud
      this.triggerBoxUp = engine.addEntity()
      this.triggerBoxUpPosition = Vector3.create(lobbyCenter.x, lobbyCenter.y, lobbyCenter.z)
      this.triggerBoxUpScale = Vector3.create(6, 4.5, 6)
      
      const host = this

      const triggerUpOnEnter = () => {
        const playerTransform = Transform.getMutable(engine.PlayerEntity)
          playerTransform.position = { x: lobbyCenter.x + 5, y: 140, z: lobbyCenter.z - 10 }

          /*if (!tutorialRunning) {
            let lobbyMusic = AudioSource.getMutableOrNull(musicBox)
            if(lobbyMusic) lobbyMusic.playing = true
          }*/
          let ambienceMusic = AudioSource.getMutableOrNull(ambienceBox)
          if(ambienceMusic) ambienceMusic.playing = true
          //enable fall sound trigger
          utils.triggers.enableTrigger(host.triggerBoxUp, true)
      }

      let triggerUpOnEnterTimerId: TimerId
      const COUNT_DOWN_TIMER_AMOUNT = 3000
      utils.triggers.addTrigger(this.triggerBoxUp, utils.ALL_LAYERS, utils.ALL_LAYERS, 
        [{type: "box", position: this.triggerBoxUpPosition, scale: this.triggerBoxUpScale}],
        function(){
          

          showTeleportUI(true)
          
          triggerCounter.start(COUNT_DOWN_TIMER_AMOUNT)
          
          let portalLyftSpyralSound = AudioSource.getMutable(host.portalLiftSpiral)
          if (!portalLyftSpyralSound.playing) {
            portalLyftSpyralSound.playing = true
          }

          triggerUpOnEnterTimerId = utils.timers.setTimeout(triggerUpOnEnter, COUNT_DOWN_TIMER_AMOUNT)
        },
        function(){
          if(triggerUpOnEnterTimerId !== undefined){
            utils.timers.clearTimeout(triggerUpOnEnterTimerId)
          }
          triggerCounter.stop()
          showTeleportUI(false)
        },
        Color3.Blue()
      )
  
      // Trigger that handles landing offset
      this.triggerBoxDown = engine.addEntity()
      this.triggerBoxDownPosition = Vector3.create(lobbyCenter.x, lobbyCenter.y + 8, lobbyCenter.z)
      this.triggerBoxDownScale = Vector3.create(6, 6, 6)

      utils.triggers.addTrigger(this.triggerBoxDown, utils.LAYER_1, utils.LAYER_1, 
        [{type: "box", position: this.triggerBoxDownPosition, scale: this.triggerBoxDownScale}],
        function(){
          const playerTransform = Transform.getMutable(engine.PlayerEntity)
          playerTransform.position = { x: lobbyCenter.x - 5, y: 0, z: lobbyCenter.z + 2 }

          let ambienceMusic = AudioSource.getMutableOrNull(ambienceBox)
          if(ambienceMusic) ambienceMusic.playing = false
          let lobbyMusic = AudioSource.getMutableOrNull(musicBox)
          if(lobbyMusic) lobbyMusic.playing = false
          let impactSounds = AudioSource.getMutable(host.impactSound)
          impactSounds.playing = true
        }
      )
  
      // Trigger to play fall SFX
      this.triggerBoxFallCheck = engine.addEntity()
      this.triggerBoxFallCheckPosition = Vector3.create(lobbyCenter.x, lobbyCenter.y + 90, lobbyCenter.z)
      this.triggerBoxFallCheckScale = Vector3.create(6, 10, 6)

     
      utils.triggers.addTrigger(this.triggerBoxFallCheck, utils.LAYER_1, utils.LAYER_1, 
        [{type: "box", position: this.triggerBoxFallCheckPosition, scale: this.triggerBoxFallCheckScale}],
        function(){
          let ambienceMusic = AudioSource.getMutableOrNull(ambienceBox)
          if(ambienceMusic) ambienceMusic.playing = false
          let lobbyMusic = AudioSource.getMutableOrNull(musicBox)
          if(lobbyMusic) lobbyMusic.playing = false
          let beamFallSound = AudioSource.getMutable(host.beamFallSound).playing
          beamFallSound = true

          //disable after one fire
          utils.triggers.enableTrigger(host.triggerBoxFallCheck, false)
        }
      )

      this.delayedTriggers.push(this.triggerBoxUp)
      this.triggers.push(this.triggerBoxDown)
      this.triggers.push(this.triggerBoxFallCheck)
  


      this.portalLiftSpiral = engine.addEntity()
      Transform.create(this.portalLiftSpiral,{
          position: Vector3.create(lobbyCenter.x, lobbyCenter.y, lobbyCenter.z),
          scale: Vector3.create(1, 0, 1)
      })
      GltfContainer.create(this.portalLiftSpiral,{
        src: "models/lobby/portal_lift_spiral.glb"
      })
      AudioSource.create(this.portalLiftSpiral, {
        audioClipUrl: 'sounds/beam_charge.mp3',
        volume: 0.5,
        //loop: true,
        playing: true
      })
      
  
      //beam teleport sound attached to player
      this.beamFireSound = engine.addEntity()
      Transform.create(this.beamFireSound,{
        position: Vector3.create(0, 1, 0),
        parent: engine.PlayerEntity
      })
      AudioSource.create(this.beamFireSound, {
        audioClipUrl: 'sounds/beam_fire.mp3',
        volume: 0.5,
        //loop: true,
        playing: true
      })
      
  
      //beam fall sound attached to player
      this.beamFallSound = engine.addEntity()
      Transform.create(this.beamFallSound,{
        position: Vector3.create(0, 4, 0),
        parent: engine.PlayerEntity
      })
      AudioSource.create(this.beamFireSound, {
        audioClipUrl: 'sounds/beam_fall.mp3',
        volume: 3,
        //loop: true,
        playing: true
      })
  
      //impact sound when landing
      this.impactSound = engine.addEntity()
      Transform.create(this.impactSound, {
        position: Vector3.create(0, 1, 0),
        parent: engine.PlayerEntity
      })
      AudioSource.create(this.beamFireSound, {
        audioClipUrl: 'sounds/impact_hard.mp3',
        volume: 0.3,
        //loop: true,
        playing: true
      })
    }
}

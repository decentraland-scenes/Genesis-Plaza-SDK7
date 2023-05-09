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

export const triggerCounter = new CountDownUtil()

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
AudioSource.create(musicBox, {
  audioClipUrl: 'sounds/lobby_music.mp3',
  volume: 0.2,
  loop: true,
  playing: true
})
Transform.create(musicBox, {
  position: Vector3.create(0, 2, 0),
  parent: engine.PlayerEntity
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
    portalLiftSpiral: Entity
    beamFireSound: Entity
    beamFallSound: Entity
    impactSound: Entity

    
  
    constructor() {
      
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

      // Trigger to handle teleporting the player up to the cloud
      this.triggerBoxUp = engine.addEntity()

      this.triggerBoxUpPosition = Vector3.create(lobbyCenter.x, lobbyCenter.y, lobbyCenter.z)
      this.triggerBoxUpScale = Vector3.create(6, 4.5, 6)
      Transform.create(this.triggerBoxUp, {})
      
      utils.triggers.addTrigger(this.triggerBoxUp, utils.NO_LAYERS, utils.LAYER_1,  
        [{type: "box", position: this.triggerBoxUpPosition, scale: this.triggerBoxUpScale}],
        (entity:Entity)=>{ 
        
          console.log("trigger.camera.enter", "triggerBoxUp", Transform.getOrNull(engine.PlayerEntity),"triggered by",entity,engine.PlayerEntity,engine.CameraEntity)
          showTeleportUI("flex")
          
          
          triggerCounter.start(COUNT_DOWN_TIMER_AMOUNT / 1000)
          
          let portalLyftSpyralSound = AudioSource.getMutable(host.portalLiftSpiral)

          if (!portalLyftSpyralSound.playing) portalLyftSpyralSound.playing = true

          triggerUpOnEnterTimerId = utils.timers.setTimeout(triggerUpOnEnter, COUNT_DOWN_TIMER_AMOUNT)
        },
        ()=>{
          if(triggerUpOnEnterTimerId !== undefined){
            utils.timers.clearTimeout(triggerUpOnEnterTimerId)
          }
          triggerCounter.stop()
          showTeleportUI("none")
        },
        Color3.Blue()
      )
  
      // Trigger that handles landing offset
      this.triggerBoxDown = engine.addEntity()
      Transform.create(this.triggerBoxDown, {})
      this.triggerBoxDownPosition = Vector3.create(lobbyCenter.x, lobbyCenter.y + 8, lobbyCenter.z)
      this.triggerBoxDownScale = Vector3.create(6, 6, 6)

      utils.triggers.addTrigger(this.triggerBoxDown, utils.NO_LAYERS, utils.LAYER_1,  
        [{type: "box", position: this.triggerBoxDownPosition, scale: this.triggerBoxDownScale}],
        (entity:Entity)=>{ 
          console.log("trigger.camera.enter", "triggerBoxDown","triggered by",entity,"player",engine.PlayerEntity,engine.CameraEntity)
          const playerTransform = Transform.getMutable(engine.PlayerEntity)
          playerTransform.position = { x: lobbyCenter.x - 5, y: 0, z: lobbyCenter.z + 2 }

          let ambienceMusic = AudioSource.getMutableOrNull(ambienceBox)
          if(ambienceMusic) ambienceMusic.playing = false
          let lobbyMusic = AudioSource.getMutableOrNull(musicBox)
          if(lobbyMusic) lobbyMusic.playing = false
          let impactSounds = AudioSource.getMutable(host.impactSound)
          impactSounds.playing = true
        },
        undefined,
        Color3.Red()
      )
  
      // Trigger to play fall SFX
      this.triggerBoxFallCheck = engine.addEntity()
      Transform.create(this.triggerBoxFallCheck, {})
      this.triggerBoxFallCheckPosition = Vector3.create(lobbyCenter.x, lobbyCenter.y + 107, lobbyCenter.z)
      this.triggerBoxFallCheckScale = Vector3.create(6, 10, 6)

     
      utils.triggers.addTrigger(this.triggerBoxFallCheck, utils.NO_LAYERS, utils.LAYER_1, 
        [{type: "box", position: this.triggerBoxFallCheckPosition, scale: this.triggerBoxFallCheckScale}],
        ()=>{

          console.log("trigger.camera.enter", "triggerBoxFallCheck")
          let ambienceMusic = AudioSource.getMutableOrNull(ambienceBox)
          if(ambienceMusic) ambienceMusic.playing = false
          let lobbyMusic = AudioSource.getMutableOrNull(musicBox)
          if(lobbyMusic) lobbyMusic.playing = false
          let beamFallSound = AudioSource.getMutable(host.beamFallSound)
          beamFallSound.playing = true
        },
        undefined,
        Color3.Red()
      )

  


      this.portalLiftSpiral = engine.addEntity()
      AudioSource.create(this.portalLiftSpiral, {
        audioClipUrl: 'sounds/beam_charge.mp3',
        volume: 0.5,
        //loop: true,
        playing: false
      })
      Transform.create(this.portalLiftSpiral,{
          position: Vector3.create(lobbyCenter.x, lobbyCenter.y, lobbyCenter.z),
          scale: Vector3.create(1, 0, 1)
      })
      GltfContainer.create(this.portalLiftSpiral,{
        src: "models/lobby/portal_lift_spiral.glb"
      })
      
  
      //beam teleport sound attached to player
      this.beamFireSound = engine.addEntity()
      AudioSource.create(this.beamFireSound, {
        audioClipUrl: 'sounds/beam_fire.mp3',
        volume: 0.5,
        //loop: true,
        playing: false
      })
      Transform.create(this.beamFireSound,{
        position: Vector3.create(0, 1, 0),
        parent: engine.PlayerEntity
      })
      
  
      //beam fall sound attached to player
      this.beamFallSound = engine.addEntity()
      AudioSource.create(this.beamFallSound, {
        audioClipUrl: 'sounds/beam_fall.mp3',
        volume: 3,
        //loop: true,
        playing: false
      })
      Transform.create(this.beamFallSound,{
        position: Vector3.create(0, 4, 0),
        parent: engine.PlayerEntity
      })
  
      //impact sound when landing
      this.impactSound = engine.addEntity()
      AudioSource.create(this.impactSound, {
        audioClipUrl: 'sounds/impact_hard.mp3',
        volume: 0.3,
        //loop: true,
        playing: false
      })
      Transform.create(this.impactSound, {
        position: Vector3.create(0, 1, 0),
        parent: engine.PlayerEntity
      })
    }
}


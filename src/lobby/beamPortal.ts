import { Animator, AudioSource, AudioStream, Entity, GltfContainer, InputAction, Material, MeshRenderer, PBAudioStream, TextShape, Transform, VisibilityComponent, engine, pointerEventsSystem } from '@dcl/sdk/ecs'
import { Color3, Vector3 } from '@dcl/sdk/math'
import { lobbyCenter } from './resources/globals'
import { lobbyHeight } from './resources/globals'
import { isInBar, setBarMusicOn } from '../modules/bar/jukebox'
import { tutorialEnableObservable } from '../modules/tutorialHandler'

import * as utils from '@dcl-sdk/utils'
import { player } from '../modules/player'
import { setTeleportCountdown, showTeleportUI } from '../ui'

@Component('DelayedTriggerBox')
export class DelayedTriggerBox {
  delay: number = 2
  elapsed: number = 0

  constructor(_delay: number) {
    this.delay = _delay
  }
}

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
  parent: Attachable.AVATAR
})
AudioSource.create(musicBox, {
  audioClipUrl: 'sounds/lobby_music.mp3',
  volume: 0.2,
  loop: true,
  playing: true
})




tutorialEnableObservable.add((tutorialEnabled) => {
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
    portalSys: PortalCheckSystem
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
      
      utils.triggers.addTrigger(this.triggerBoxUp, utils.LAYER_1, utils.LAYER_1, 
        [{type: "box", position: this.triggerBoxUpPosition, scale: this.triggerBoxUpScale}],
        function(){
          const playerTransform = Transform.getMutable(engine.PlayerEntity)
          playerTransform.position = { x: lobbyCenter.x + 5, y: 140, z: lobbyCenter.z - 10 }

          if (!tutorialRunning) {
            let lobbyMusic = AudioSource.getMutableOrNull(musicBox)
            if(lobbyMusic) lobbyMusic.playing = true
          }
          let ambienceMusic = AudioSource.getMutableOrNull(ambienceBox)
          if(ambienceMusic) ambienceMusic.playing = true
          //enable fall sound trigger
          utils.triggers.enableTrigger(this, true)
        },
        undefined,
        Color3.Blue()
      )
      
      this.triggerBoxUp.addComponent(new DelayedTriggerBox(3))




  
      // Trigger that handles landing offset
      this.triggerBoxDown = engine.addEntity()
      this.triggerBoxDownPosition = Vector3.create(lobbyCenter.x, lobbyCenter.y + 8, lobbyCenter.z)
      this.triggerBoxDownScale = Vector3.create(6, 6, 6)

      utils.triggers.addTrigger(this.triggerBoxDown, utils.NO_LAYERS, utils.ALL_LAYERS, 
        [{type: "box", position: this.triggerBoxDownPosition, scale: this.triggerBoxDownScale}],
        function(){
          const playerTransform = Transform.getMutable(engine.PlayerEntity)
          playerTransform.position = { x: lobbyCenter.x - 5, y: 0, z: lobbyCenter.z + 2 }

          let ambienceMusic = AudioSource.getMutableOrNull(ambienceBox)
          if(ambienceMusic) ambienceMusic.playing = false
          let lobbyMusic = AudioSource.getMutableOrNull(musicBox)
          if(lobbyMusic) lobbyMusic.playing = false
          let impactSounds = AudioSource.getMutable(this.impactSound)
          
        }
      )
  
      // Trigger to play fall SFX
      this.triggerBoxFallCheck = engine.addEntity()
      this.triggerBoxFallCheckPosition = Vector3.create(lobbyCenter.x, lobbyCenter.y + 90, lobbyCenter.z)
      this.triggerBoxFallCheckScale = Vector3.create(6, 10, 6)

      utils.triggers.addTrigger(this.triggerBoxFallCheck, utils.NO_LAYERS, utils.ALL_LAYERS, 
        [{type: "box", position: this.triggerBoxFallCheckPosition, scale: this.triggerBoxFallCheckScale],
        function(){
          let ambienceMusic = AudioSource.getMutableOrNull(ambienceBox)
          if(ambienceMusic) ambienceMusic.playing = false
          let lobbyMusic = AudioSource.getMutableOrNull(musicBox)
          if(lobbyMusic) lobbyMusic.playing = false
          this.beamFallSound.getComponent(AudioSource).playOnce()

          //disable after one fire
          utils.triggers.enableTrigger(this, false)
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
      
      
  
      this.portalSys = new PortalCheckSystem(this)
      
  
      //beam teleport sound attached to player
      this.beamFireSound = engine.addEntity()
      Transform.create(this.beamFireSound,{
        position: Vector3.create(0, 1, 0),
        parent: Attachable.AVATAR
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
        parent: Attachable.AVATAR
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
        parent: Attachable.AVATAR
      })
      AudioSource.create(this.beamFireSound, {
        audioClipUrl: 'sounds/impact_hard.mp3',
        volume: 0.3,
        //loop: true,
        playing: true
      })
    }
  
    showTeleport() {
      let triggerBoxUpYPosition = Transform.getMutable(this.triggerBoxUp).position.y
      triggerBoxUpYPosition = lobbyCenter.y

      this.triggerBoxUp.updatePosition()
    }
    hideTeleport() {
      let triggerBoxUpYPosition = Transform.getMutable(this.triggerBoxUp).position.y
      triggerBoxUpYPosition = lobbyCenter.y - 10

      updatePosition(this.triggerBoxUp)
      
    }
  
    collideSimple() {
      for (let i = 0; i < this.triggers.length; i++) {
        this.triggers[i].collide(player.feetPos)
      }
    }
    collideDelayed(dt: number) {
      const liftSpiralTransform = Transform.getMutableOrNull(this.portalLiftSpiral)
  
      for (let i = 0; i < this.delayedTriggers.length; i++) {
        if (this.delayedTriggers[i].collide(player.feetPos, true)) {
          const delayInfo = this.delayedTriggers[i].getComponent(DelayedTriggerBox)
          delayInfo.elapsed += dt
          showTeleportUI(true)
          let countDownNum = delayInfo.delay - delayInfo.elapsed + 1
          if (countDownNum < 1) countDownNum = 1
          setTeleportCountdown(countDownNum.toFixed(0))
          if(liftSpiralTransform){
            liftSpiralTransform.scale.y += dt / delayInfo.delay
            liftSpiralTransform.position.y += 0.9 * dt
          }
  
          let portalLyftSpyralSound = AudioSource.getMutable(this.portalLiftSpiral)
          if (!portalLyftSpyralSound.playing) {
            portalLyftSpyralSound.playing = true
          }
  
          if (delayInfo.elapsed > delayInfo.delay) {
            this.delayedTriggers[i].fire()
            let portalLiftSpiralSound = AudioSource.getMutable(this.portalLiftSpiral)
            portalLiftSpiralSound.playing = false
            let beamFireSound = AudioSource.getMutable(this.beamFireSound)
            beamFireSound.playing = true
            delayInfo.elapsed = 0
            if(liftSpiralTransform){
              liftSpiralTransform.scale.y = 0
              liftSpiralTransform.position.y = lobbyCenter.y
            }
          }
        } else {
          this.delayedTriggers[i].getComponent(DelayedTriggerBox).elapsed = 0
          showTeleportUI(false)
          setTeleportCountdown('0')
          if(liftSpiralTransform){
            liftSpiralTransform.scale.y = 0
            liftSpiralTransform.position.y = lobbyCenter.y
          }
  
          let portalLisftSpyralSound = AudioSource.getMutable(this.portalLiftSpiral)
          portalLisftSpyralSound.playing = false
        }
      }
    }
}

class PortalCheckSystem {
  teleportControl: TeleportController

  constructor(_teleportController: TeleportController) {
    this.teleportControl = _teleportController
  }

  update(dt: number) {
    this.teleportControl.collideDelayed(dt)
    this.teleportControl.collideSimple()
  }
}

function updatePosition(triggerBoxUp: Entity) {
  let triggerBoxUpTransform = Transform.getMutable(triggerBoxUp)
  
  let areaXMin = triggerBoxUpTransform.position.x - triggerBoxUpTransform.scale.x / 2
  let areaXMax = triggerBoxUpTransform.position.x + triggerBoxUpTransform.scale.x / 2

  let areaYMin = triggerBoxUpTransform.position.y 
  let areaYMax = triggerBoxUpTransform.position.y + triggerBoxUpTransform.scale.y 

  let areaZMin = triggerBoxUpTransform.position.z - triggerBoxUpTransform.scale.z / 2
  let areaZMax = triggerBoxUpTransform.position.z + triggerBoxUpTransform.scale.z / 2
}
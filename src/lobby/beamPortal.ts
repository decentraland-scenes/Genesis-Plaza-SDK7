import { Animator, AudioSource, AudioStream, Entity, GltfContainer, InputAction, Material, MeshRenderer, PBAudioStream, TextShape, Transform, VisibilityComponent, engine, pointerEventsSystem } from '@dcl/sdk/ecs'
import { Color3, Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { BEAM_SCALE_AMOUNT, TRIGGER_LAYER_REGISTER_WITH_NO_LAYERS, ParcelCountMaxY, ParcelCountX, ParcelCountZ, coreBuildingOffset, lobbyCenter } from './resources/globals'
import { lobbyHeight } from './resources/globals'
import { setBarMusicOff, setBarMusicOn } from '../modules/bar/jukebox'
import { movePlayerTo } from "~system/RestrictedActions"
//import { tutorialEnableObservable } from '../modules/tutorialHandler'

import { onEnterSceneObservable, onLeaveSceneObservable} from '@dcl/sdk/observables'

import * as utils from '@dcl-sdk/utils'

import { showTeleportUI } from '../ui'
import { TimerId } from '@dcl-sdk/utils/dist/timer'
import { CountDownUtil } from './countDown'
import { beamShape } from './resources/resources'
import { AudioSourceAttachedToPlayer } from '../components'
import { FIRST_PERSON_VOLUME_ADJ, addAudioSourceAttachedToPlayer, applyAudioStreamWorkAround, setAudioSourceAttachedToPlayerPlaying } from '../modules/soundsAttachedToPlayer'
import { isMovePlayerInProgress, setMovePlayerInProgress } from '../back-ports/movePlayer'
import { beamChargeSource, beamChargeSourceVolume, beamFallSource, beamFallSourceVolume, beamFireSource, beamFireSourceVolume, impactHardSource, impactHardSourceVolume, lobbyMusicSource, lobbyMusicSourceVolume } from './resources/sounds'
import { GetRealmResponse, getRealm } from '~system/Runtime'


export const triggerCounter = new CountDownUtil()

// AMBIENT SOUND, WATER + BIRDS
let ambienceBox = engine.addEntity()
AudioSource.create(ambienceBox,{
  audioClipUrl: 'sounds/lobby_ambience.mp3',
  volume: 1,
  loop: true,
  playing: false 
})
Transform.create(ambienceBox, {
  position: Vector3.create(lobbyCenter.x - coreBuildingOffset.x, lobbyHeight, lobbyCenter.z - coreBuildingOffset.z)
})

// LOBBY MUSIC
let musicBox = engine.addEntity()

Transform.create(musicBox, {
  position: Vector3.create(0, 2, 0),
  parent: engine.PlayerEntity
})
addAudioSourceAttachedToPlayer(musicBox,{
    id: 'lobby_music',
    thirdPersonVolume: lobbyMusicSourceVolume,
    firstPersonVolume: lobbyMusicSourceVolume + FIRST_PERSON_VOLUME_ADJ
  },
  {
    audioClipUrl: lobbyMusicSource,
    volume: lobbyMusicSourceVolume,
    loop: true,
    playing: false
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

const beanOffsetZ = 1.8
const  beam = engine.addEntity()
Transform.create(beam,{
    position: Vector3.create(lobbyCenter.x - coreBuildingOffset.x, lobbyCenter.y, lobbyCenter.z - coreBuildingOffset.z-beanOffsetZ),
    scale: Vector3.create(1,1 + BEAM_SCALE_AMOUNT,1)
})
GltfContainer.createOrReplace(beam, beamShape)

const CLASSNAME = "TeleportController"

export class TeleportController {
    triggerBoxLobby: Entity
    triggerBoxLobbyPosition: Vector3
    triggerBoxLobbyScale: Vector3
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
    beamChargeSound: Entity
    beamFireSound: Entity
    beamFallSound: Entity
    impactSound: Entity

    
  
    constructor() {
      
      const host = this

      const triggerUpSpawnArea = { x: (lobbyCenter.x - coreBuildingOffset.x + 5) , y: Math.min(ParcelCountMaxY-2.5,140), z: (lobbyCenter.z - 10 - coreBuildingOffset.z) }

      const spawnRandomX = 2
      const spawnRandomZ = 1

      getRealm({}).then(
        (value:GetRealmResponse) => {
          if(value.realmInfo?.isPreview){
              console.log("beamPortal.ts","temp.planes","getRealm is preview, adding planes for spawn and ceiling")
              //START find the max height, help with visualizing how high we can go
              let spawnAreaPlane = engine.addEntity()
              //PUT PARCEL SIZE HERE 4X5 FOR EXAMPLE
              const parcelMaxHeight = (Math.log((ParcelCountX*ParcelCountZ)) * Math.LOG2E) * 20
              Transform.create(spawnAreaPlane,{
                position: { x: triggerUpSpawnArea.x + (spawnRandomX/2) , y: lobbyHeight, z: triggerUpSpawnArea.z + (spawnRandomZ/2)},
                scale: Vector3.create(spawnRandomX,spawnRandomZ,.1),
                rotation: Quaternion.fromEulerDegrees(90,0,0)
              })
              //MeshCollider.setPlane(findCeilingPlane)
              MeshRenderer.setPlane(spawnAreaPlane)
              Material.setPbrMaterial(spawnAreaPlane, {
                //texture: Material.Texture.,
                albedoColor: Color4.fromHexString("#00000088"),
                specularIntensity: 0,
                metallic: 0,
                roughness: 1
              })
          }
        }
      )

      const triggerUpOnEnter = () => {
        console.log(CLASSNAME,"trigger.beamMeUp.enter.called.triggerUpOnEnter", "triggerUpOnEnter") 

        //using Math.random() to slightly randomize spawn point
        const movePlayerPosition = { x: triggerUpSpawnArea.x + (Math.random()*spawnRandomX), y: triggerUpSpawnArea.y, z: triggerUpSpawnArea.z + (Math.random()*spawnRandomZ)}
        //debugger

        setMovePlayerInProgress(true)
        applyAudioStreamWorkAround('exit')
        movePlayerTo({  newRelativePosition: movePlayerPosition, cameraTarget: Vector3.create(31,lobbyHeight + 8 ,51)}).then(() => {
          setMovePlayerInProgress(false)
        })
        //const playerTransform = Transform.getMutable(engine.PlayerEntity)
        //playerTransform.position = { x: lobbyCenter.x + 5, y: 140, z: lobbyCenter.z - 10 }

        /*if (!tutorialRunning) {
          let lobbyMusic = AudioSource.getMutableOrNull(musicBox)
          if(lobbyMusic) lobbyMusic.playing = true
        }*/

        
        let ambienceMusic = AudioSource.getMutableOrNull(ambienceBox)
        if(ambienceMusic) ambienceMusic.playing = true

        setAudioSourceAttachedToPlayerPlaying(musicBox,true)

        setAudioSourceAttachedToPlayerPlaying(this.beamFireSound,true)


        setBarMusicOff()

        //enable fall sound trigger
        //utils.triggers.enableTrigger(host.triggerBoxUp, true)
      }
 
      let triggerUpOnEnterTimerId: TimerId
      const COUNT_DOWN_TIMER_AMOUNT = 3000

      // Trigger to handle teleporting the player up to the cloud
      this.triggerBoxUp = engine.addEntity()
      Transform.create(this.triggerBoxUp, {})
      this.triggerBoxUpPosition = Vector3.create(lobbyCenter.x - coreBuildingOffset.x, lobbyCenter.y+1, lobbyCenter.z - coreBuildingOffset.z)
      this.triggerBoxUpScale = Vector3.create(5, 2, 5)
      

      utils.triggers.addTrigger(this.triggerBoxUp, TRIGGER_LAYER_REGISTER_WITH_NO_LAYERS, utils.LAYER_1,  
        [{type: "box", position: this.triggerBoxUpPosition, scale: this.triggerBoxUpScale}],
        (entity:Entity)=>{ 
          console.log(CLASSNAME,"trigger.beamMeUp.enter", "triggerBoxUp", Transform.getOrNull(engine.PlayerEntity),"triggered by",entity,engine.PlayerEntity,engine.CameraEntity,"isMovePlayerInProgress()",isMovePlayerInProgress())

          //adding check as sometimes movePlayer is too late and this gets triggered
          if(!isMovePlayerInProgress()) { 
            showTeleportUI("flex")
            
            setAudioSourceAttachedToPlayerPlaying(this.beamChargeSound,true)
            
            triggerCounter.start(COUNT_DOWN_TIMER_AMOUNT / 1000)
            triggerUpOnEnterTimerId = utils.timers.setTimeout(triggerUpOnEnter, COUNT_DOWN_TIMER_AMOUNT)
          }else{
            //ignored because move player is in progress
            console.log(CLASSNAME,"trigger.beamMeUp.enter", "triggerBoxUp", Transform.getOrNull(engine.PlayerEntity),"triggered by",entity,engine.PlayerEntity,engine.CameraEntity,"IGNORED because move player is in progress")
          }
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
      this.triggerBoxDownPosition = Vector3.create(lobbyCenter.x - coreBuildingOffset.x, lobbyCenter.y + 10, lobbyCenter.z - coreBuildingOffset.z)
      //had to make bigger to avoid risk of low FPS missing it :(
      this.triggerBoxDownScale = Vector3.create(6, 7, 6)

      utils.triggers.addTrigger(this.triggerBoxDown, TRIGGER_LAYER_REGISTER_WITH_NO_LAYERS, utils.LAYER_1,  
        [{type: "box", position: this.triggerBoxDownPosition, scale: this.triggerBoxDownScale}],
        (entity:Entity)=>{ 
          console.log("trigger.barFromLobbyTrigger.enter", "triggerBoxDown","triggered by",entity,"player",engine.PlayerEntity,engine.CameraEntity)

          setMovePlayerInProgress(true)
          applyAudioStreamWorkAround('exit')
          movePlayerTo({  newRelativePosition: Vector3.create(lobbyCenter.x - coreBuildingOffset.x - 5, 0, lobbyCenter.z - coreBuildingOffset.z + 2), cameraTarget: Vector3.create(lobbyCenter.x, 2, lobbyCenter.z - 12)}).then(
            ()=>{
              setMovePlayerInProgress(false)
            })

          setAudioSourceAttachedToPlayerPlaying(this.impactSound,true)

          setBarMusicOn()
        },
        undefined,
        Color3.Red()
      )
  
      // Trigger to play fall SFX
      this.triggerBoxFallCheck = engine.addEntity()
      Transform.create(this.triggerBoxFallCheck, {})
      const triggerBoxFallCheckScale = Vector3.create((ParcelCountX)*16-4, 10, (ParcelCountZ)*16-4)
      this.triggerBoxFallCheckScale = triggerBoxFallCheckScale
      this.triggerBoxFallCheckPosition = Vector3.create(lobbyCenter.x - coreBuildingOffset.x, lobbyCenter.y + lobbyHeight - triggerBoxFallCheckScale.y, lobbyCenter.z - coreBuildingOffset.z)

     
      utils.triggers.addTrigger(this.triggerBoxFallCheck, utils.NO_LAYERS, utils.LAYER_1, 
        [{type: "box", position: this.triggerBoxFallCheckPosition, scale: this.triggerBoxFallCheckScale}],
        ()=>{
          console.log(CLASSNAME,"trigger.triggerPlayerFell.enter", "triggerBoxFallCheck")
          //debugger
          setAudioSourceAttachedToPlayerPlaying(this.beamFallSound,true)
        },
        undefined,
        Color3.Teal()
      )


      this.triggerBoxLobby = engine.addEntity()
      Transform.create(this.triggerBoxLobby, {})
      this.triggerBoxLobbyScale = Vector3.create(35,6,35)
      this.triggerBoxLobbyPosition = Vector3.create(lobbyCenter.x - coreBuildingOffset.x, lobbyCenter.y + lobbyHeight, lobbyCenter.z - coreBuildingOffset.z)
  
      utils.triggers.addTrigger(this.triggerBoxLobby, utils.NO_LAYERS, utils.LAYER_1,  
        [{type: "box", position: this.triggerBoxLobbyPosition, scale: this.triggerBoxLobbyScale}],
        ()=>{ 
          let ambienceMusic = AudioSource.getMutableOrNull(ambienceBox)
          if(ambienceMusic) ambienceMusic.playing = true

          setAudioSourceAttachedToPlayerPlaying(musicBox,true)
        },
        ()=>{
          let ambienceMusic = AudioSource.getMutableOrNull(ambienceBox)
          if(ambienceMusic) ambienceMusic.playing = false

          setAudioSourceAttachedToPlayerPlaying(musicBox,false)
        },
        Color3.Blue()
      )






      this.portalLiftSpiral = engine.addEntity()
      Transform.create(this.portalLiftSpiral,{
          position: Vector3.create(lobbyCenter.x, lobbyCenter.y, lobbyCenter.z),
          scale: Vector3.create(1, 0, 1)
      })
      GltfContainer.create(this.portalLiftSpiral,{
        src: "models/lobby/portal_lift_spiral.glb"
      })


      //beam charge sound attached to player
      this.beamChargeSound = engine.addEntity()
      
      Transform.create(this.beamChargeSound,{
        position: Vector3.create(0, 1, 0),
        parent: engine.PlayerEntity
      })
      addAudioSourceAttachedToPlayer(this.beamChargeSound,
        {
          id: 'beam_charge',
          thirdPersonVolume: beamChargeSourceVolume,
          firstPersonVolume: beamChargeSourceVolume + FIRST_PERSON_VOLUME_ADJ
        },
        {
          audioClipUrl: beamChargeSource,
          volume: beamChargeSourceVolume,
          //loop: true,
          playing: false
        })
        
      //beam teleport sound attached to player
      this.beamFireSound = engine.addEntity()
      
      Transform.create(this.beamFireSound,{
        position: Vector3.create(0, 1, 0),
        parent: engine.PlayerEntity
      })
      addAudioSourceAttachedToPlayer(this.beamFireSound,{
          id: 'beam_fire',
          thirdPersonVolume: beamFireSourceVolume, 
          firstPersonVolume: beamFireSourceVolume + FIRST_PERSON_VOLUME_ADJ
        },
        {
          audioClipUrl: beamFireSource,
          volume: beamFireSourceVolume,
          //loop: true,
          playing: false
        })
  
      //beam fall sound attached to player
      this.beamFallSound = engine.addEntity()
      
      Transform.create(this.beamFallSound,{
        position: Vector3.create(0, 4, 0),
        parent: engine.PlayerEntity
      })
      addAudioSourceAttachedToPlayer(this.beamFallSound,{
          id: 'beam_fall',
          thirdPersonVolume: beamFallSourceVolume,
          firstPersonVolume: beamFallSourceVolume + FIRST_PERSON_VOLUME_ADJ
        },
        {
          audioClipUrl: beamFallSource,
          volume: beamFallSourceVolume,
          //loop: true,
          playing: false
        })
  
      //impact sound when landing
      this.impactSound = engine.addEntity()
      
      Transform.create(this.impactSound, {
        position: Vector3.create(0, 1, 0),
        parent: engine.PlayerEntity
      })

      addAudioSourceAttachedToPlayer(this.impactSound,{
          id: 'impact_hard',
          thirdPersonVolume: 0.3,
          firstPersonVolume: 0.3 + FIRST_PERSON_VOLUME_ADJ
        },
        {
          audioClipUrl: impactHardSource,
          volume: impactHardSourceVolume,
          //loop: true,
          playing: false
        })
    }
}


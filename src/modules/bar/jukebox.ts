//import { OctoComments, octopus } from './barNPCs'
import { Animator, AudioSource, AudioStream, Entity, GltfContainer, InputAction, Material, MeshRenderer, TextShape, Transform, VisibilityComponent, engine, pointerEventsSystem } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import * as utils from '@dcl-sdk/utils'
import { sceneMessageBus } from '../serverHandler'
import { tutorialRunning } from '../../lobby/portalBeam'



export enum Radios {
  RAVE = 'https://icecast.ravepartyradio.org/ravepartyradio-192.mp3',
  DELTA = 'https://cdn.instream.audio/:9069/stream?_=171cd6c2b6e',
  GRAFFITI = 'https://n07.radiojar.com/2qm1fc5kb.m4a?1617129761=&rj-tok=AAABeIR7VqwAilDFeUM39SDjmw&rj-ttl=5',
  SIGNS = 'https://edge.singsingmusic.net/MC2.mp3',
  JAZZ = 'https://live.vegascity.fm/radio/8010/the_flamingos.mp3',
}

let FullVolume = 0.1
let DistantVolume = 0.03

export let isInBar: boolean = true
let barCurrentRadio: Radios 
let barCurrentRadioIndex: number = 0
let radioCount = 4
let radioIsOn: boolean = true



const audioStreamEntity = engine.addEntity()


let baseJukeBox = engine.addEntity()
let baseJukeBoxLights1 = engine.addEntity()
let baseJukeBoxLights2 = engine.addEntity()

export function placeJukeBox() {

  console.log("jukeBox.ts placeJukeBox has being called")

  AudioStream.createOrReplace(audioStreamEntity)

  let musicStreamEntityRef = AudioStream.getMutable(audioStreamEntity)
  musicStreamEntityRef.volume = FullVolume
  musicStreamEntityRef.playing = false

  GltfContainer.createOrReplace(baseJukeBox, {
    src: 'models/core_building/jukebox/Jukebox_Base.glb'
  })

  Transform.createOrReplace(baseJukeBox, {
    position: Vector3.create(179, 0, 144),
    rotation: Quaternion.create(0, -45, 0),
    scale: Vector3.create(0.75, 0.75, 0.75),
  })

  GltfContainer.createOrReplace(baseJukeBoxLights1,{
    src:'models/core_building/jukebox/Lights_01.glb'
  })
  VisibilityComponent.createOrReplace(baseJukeBoxLights1, {visible: false})

  Transform.createOrReplace(baseJukeBoxLights1, {
    parent: baseJukeBox
  })

  GltfContainer.createOrReplace(baseJukeBoxLights2,{
    src:'models/core_building/jukebox/Lights_02.glb',
  })
  VisibilityComponent.createOrReplace(baseJukeBoxLights2, {visible: false})

  Transform.createOrReplace(baseJukeBoxLights1, {
    parent: baseJukeBox
  })


  let JukeboxScreen = engine.addEntity()
  let JukeBoxText = engine.addEntity()

  Transform.createOrReplace(JukeBoxText, {
    parent:JukeboxScreen
  })
  
  Transform.createOrReplace(JukeboxScreen, {
    position: Vector3.create(0, 2.55, 0.25),
    rotation: Quaternion.create(0, 180, 0),
    parent:baseJukeBox
  })

  TextShape.createOrReplace(JukeBoxText,{
    text: 'Radio:\nRave Party',
    fontSize: 1
  })

  let onButton =  new JukeboxButton(
    'models/core_building/jukebox/Button_On.glb', 
    'Button_On',
    () => {
      let audioStreamRef = AudioStream.getMutable(audioStreamEntity)
      let musicState = audioStreamRef && audioStreamRef.playing
      sceneMessageBus.emit('BarRadioToggle', {
        state: !musicState,
      })
    },
    'On/Off'
  )

  let nextButton = new JukeboxButton(
    'models/core_building/jukebox/ButtonForward.glb', 
    'Button_Forward',
    () => {
      barCurrentRadioIndex += 1
      if (barCurrentRadioIndex > radioCount) barCurrentRadioIndex = 0
      TextShape.getMutable(JukeBoxText).text = 'Radio:\n' + getRadioName(barCurrentRadioIndex)

      let audioStreamRef = AudioStream.getMutable(audioStreamEntity)
      if (audioStreamRef && audioStreamRef.playing) {
        sceneMessageBus.emit('setBarRadio', {
          index: barCurrentRadioIndex,
        })
      }
    },
    'Next'
  )

  let prewiousButton = new JukeboxButton(
    'models/core_building/jukebox/Button_Previous.glb',
    'Button_Preview',
    () => {
      barCurrentRadioIndex -= 1
      if (barCurrentRadioIndex < 0) barCurrentRadioIndex = radioCount - 1
      TextShape.getMutable(JukeBoxText).text = 'Radio:\n' + getRadioName(barCurrentRadioIndex)

      let audioStreamRef = AudioStream.getMutable(audioStreamEntity)
      if (audioStreamRef && audioStreamRef.playing) {
        sceneMessageBus.emit('setBarRadio', {
          index: barCurrentRadioIndex,
        })
      }
    },
    'Previous'
  )

  sceneMessageBus.on('BarRadioToggle', (e) => {
    let audioStreamRef = AudioStream.getMutable(audioStreamEntity)
    if (audioStreamRef && e.state === audioStreamRef.playing) return
    if (e.state) {
      barRadioOn()
      radioIsOn = true
    } else {
      barRadioOff()
      radioIsOn = false
    }
  })

  sceneMessageBus.on('setBarRadio', (e) => {

    let newRadio: Radios

    switch (e.index) {
      case 0:
        newRadio = Radios.RAVE
        break
      case 1:
        newRadio = Radios.DELTA
        break
      case 2:
        newRadio = Radios.GRAFFITI
        break
      case 3:
        newRadio = Radios.JAZZ
        break
      case 4:
        newRadio = Radios.SIGNS
        break
      default:
        newRadio = Radios.DELTA
        break
    }

    let audioStreamRef = AudioStream.getMutable(audioStreamEntity)

    if (
      barCurrentRadio === newRadio &&
      audioStreamRef &&
      audioStreamRef.playing
    )
      return
    if (audioStreamRef) {
      audioStreamRef.playing = false
      //barMusicStream = null
    }
    barCurrentRadioIndex = e.index
    barCurrentRadio = newRadio


    TextShape.getMutable(JukeBoxText).text = 'Radio:\n' + getRadioName(barCurrentRadioIndex)

    barRadioOn(barCurrentRadio)
  })

  sceneMessageBus.on('enteredRadioRange', (e) => {
    if (!isInBar || barCurrentRadio === null || tutorialRunning) return
    if (e.radio === barCurrentRadioIndex) return
    sceneMessageBus.emit('setBarRadio', {
      index: barCurrentRadioIndex,
    })
  })
}

export class JukeboxButton {
  entity: Entity
  
  constructor(modelUrl: string, animationName: string, action: () => void, text?: string) {
    
    let _entity = engine.addEntity()
    this.entity = _entity

    GltfContainer.createOrReplace(this.entity, {
        src: modelUrl
    })
    Transform.createOrReplace(this.entity, {
        parent:baseJukeBox
    })
    
    AudioSource.createOrReplace(this.entity, {
        audioClipUrl: 'sounds/click.mp3',
        loop: false,
        playing: false,
    })

    Animator.createOrReplace(this.entity, {
        states:[{
            name: animationName,
            clip: animationName,
            loop: false,
            playing: false
        }]
    })



    pointerEventsSystem.onPointerDown( 
        this.entity, 
        () => {
            action()
            this.press(animationName)
        },
        {
            button: InputAction.IA_POINTER,
            hoverText: text ? text : 'Press',
        }
    )
  }

  public press(clipName: string): void {

    Animator.stopAllAnimations(this.entity, true)
    Animator.playSingleAnimation(this.entity, clipName)

    let adioSource = AudioSource.getMutable(this.entity)
    adioSource.playing = true
  }
}

function barRadioOn(station?: Radios) {
  if (tutorialRunning) return
  if (isInBar) {
    console.log("jukebox.ts ButtonOnOf has been pressed")
    utils.timers.clearTimeout(10)
    utils.timers.setTimeout(() =>{
      console.log("jukebox.ts ButtonOnOf has been pressed, function called with timeOut")
      let audioStreamRef = AudioStream.getMutable(audioStreamEntity)
      audioStreamRef.volume = FullVolume

      AudioStream.getMutable(audioStreamEntity)
      //barMusicStreamEnt.addComponentOrReplace(barMusicStream)

      VisibilityComponent.getMutable(baseJukeBoxLights1).visible = true
      VisibilityComponent.getMutable(baseJukeBoxLights2).visible = true
    },
    100
    )
  }
  radioIsOn = true
}

function barRadioOff() {
  let audioStreamRef = AudioStream.getMutable(audioStreamEntity)
  if (audioStreamRef) {
    audioStreamRef.playing = false
  }
  VisibilityComponent.getMutable(baseJukeBoxLights1).visible = false
  VisibilityComponent.getMutable(baseJukeBoxLights2).visible = false
}

export function setBarMusicOn() {
  if (tutorialRunning) return

  let audioStreamRef = AudioStream.getMutable(audioStreamEntity)

  sceneMessageBus.emit('enteredRadioRange', {
    radio: barCurrentRadioIndex,
  })
  isInBar = true
  if (audioStreamRef) {
    audioStreamRef.volume = FullVolume
  }

  if (radioIsOn && barCurrentRadio) {
    barRadioOn(barCurrentRadio)
  }
}

export function outOfBar() {
  isInBar = false
}

export function intoBar() {
  isInBar = false
}

export function setBarMusicOff() {
  isInBar = false
  barRadioOff()
}

export function lowerVolume() {
  if (isInBar || tutorialRunning) return

  let audioStreamRef = AudioStream.getMutable(audioStreamEntity)
  if (radioIsOn && audioStreamRef && !audioStreamRef.playing) {
    audioStreamRef.playing = true
  }
  if (audioStreamRef) {
    audioStreamRef.volume = DistantVolume
  }

  return
}

export function raiseVolume() {
  if (tutorialRunning) return

  isInBar = true
  let audioStreamRef = AudioStream.getMutable(audioStreamEntity)

  if (radioIsOn && audioStreamRef && !audioStreamRef.playing) {
    audioStreamRef.playing = true
  }

  if(audioStreamRef != null) audioStreamRef.volume = FullVolume
}

export function setStreamVolume(vol: number) {
  if (!isInBar) return

  let audioStreamRef = AudioStream.getMutable(audioStreamEntity)

  if(audioStreamRef != null){
    audioStreamRef.playing = true
    audioStreamRef.volume = vol
  }
}

function getRadioName(radio: number) {
  let radioName: string = ''
  switch (radio) {
    case 0:
      radioName = 'Rave Party'
      break
    case 1:
      radioName = 'Delta'
      break
    case 2:
      radioName = 'Graffiti Kings'
      break
    case 3:
      radioName = 'Vegas Jazz FM'
      break
    case 4:
      radioName = 'Signs'
      break
    case null:
      radioName = 'Off'
      break
  }
  return radioName
}

let firstTimeMic: boolean = false

/* TODO TAG:PORT-REIMPLEMENT-ME
export function addMicFeedback() {

  let feedback = engine.addEntity()
  let mic = engine.addEntity()

  Transform.createOrReplace(mic, {
    position: Vector3.create(160, 2.2, 167.7),
    scale: Vector3.create(0.35, 0.35, 0.35),
  })

  MeshRenderer.setBox(mic)

  
  AudioSource.createOrReplace(feedback, {
    audioClipUrl: 'sounds/micFeedback.mp3',
    loop: false,
    playing: true,
    volume: 1
  })

  pointerEventsSystem.onPointerDown(
    mic,
    () => {
        let audioSrc = AudioSource.getMutable(feedback)
  
        audioSrc.volume = 1
        audioSrc.playing = true

        sceneMessageBus.emit('micFeedback', {})

        /*
        //TODO TAG:PORT-REIMPLEMENT-ME
        if (!firstTimeMic) {
          firstTimeMic = true
          
          octopus.talk(OctoComments, 'mic')
          
          utils.timers.setTimeout(() => {
            octopus.endInteraction()
          },
          6000
          )
        }
      },
      {
        hoverText: 'Use mic',
      }  
  )

  Material.setPbrMaterial(mic, {
        texture: Material.Texture.Common({
            src: 'images/transparent-texture.png'
        })
  })

  
  sceneMessageBus.on('micFeedback', (e) => {
    if (!isInBar) return

    let audioSrc = AudioSource.getMutable(feedback)
  
    audioSrc.volume = 0.2
    audioSrc.playing = true
  })
}
*/
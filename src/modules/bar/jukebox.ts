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

export let isInBar: boolean = false
let barCurrentRadio: Radios 
let barCurrentRadioIndex: number = 0
let radioCount = 4
let radioIsOn: boolean = true



export let barMusicStream: AudioStream

const barMusicStreamEnt = engine.addEntity()


let baseJukeBox = engine.addEntity()
let baseJukeBoxLights1 = engine.addEntity()
let baseJukeBoxLights2 = engine.addEntity()


export function placeJukeBox() {

  AudioStream.create(barMusicStreamEnt, barMusicStream)
  //barMusicStream = new AudioStream(barCurrentRadio)

  let musicStreamEntityRef = AudioStream.getMutable(barMusicStreamEnt)
  musicStreamEntityRef.volume = FullVolume
  musicStreamEntityRef.playing = false

  GltfContainer.create(baseJukeBox, {
    src: 'models/core_building/jukebox/Jukebox_Base.glb'
  })

  Transform.create(baseJukeBox, {
    position: Vector3.create(179, 0, 144),
    rotation: Quaternion.create(0, -45, 0),
    scale: Vector3.create(0.75, 0.75, 0.75),
  })

  GltfContainer.create(baseJukeBoxLights1,{
    src:'models/core_building/jukebox/Lights_01.glb'
  })
  VisibilityComponent.create(baseJukeBoxLights1, {visible: false})

  Transform.create(baseJukeBoxLights1, {
    parent: baseJukeBox
  })

  GltfContainer.create(baseJukeBoxLights2,{
    src:'models/core_building/jukebox/Lights_02.glb',
  })
  VisibilityComponent.create(baseJukeBoxLights2, {visible: false})

  Transform.create(baseJukeBoxLights1, {
    parent: baseJukeBox
  })


  let JukeboxScreen = engine.addEntity()
  let JukeBoxText = engine.addEntity()

  Transform.create(JukeBoxText, {
    parent:JukeboxScreen
  })
  
  Transform.create(JukeboxScreen, {
    position: Vector3.create(0, 2.55, 0.25),
    rotation: Quaternion.create(0, 180, 0),
    parent:baseJukeBox
  })

  TextShape.create(JukeBoxText,{
    text: 'Radio:\nRave Party',
    fontSize: 1
  })
  

  let onButton =  new JukeboxButton(
    'models/core_building/jukebox/Button_On.glb', 
    'Button_On',
    () => {
      let musicState = barMusicStream && barMusicStream.playing
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

      if (barMusicStream && barMusicStream.playing) {
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

      if (barMusicStream && barMusicStream.playing) {
        sceneMessageBus.emit('setBarRadio', {
          index: barCurrentRadioIndex,
        })
      }
    },
    'Previous'
  )

  sceneMessageBus.on('BarRadioToggle', (e) => {
    if (barMusicStream && e.state === barMusicStream.playing) return
    if (e.state) {
      barRadioOn()
      radioIsOn = true
    } else {
      barRadioOff()
      radioIsOn = false
    }
  })

  sceneMessageBus.on('setBarRadio', (e) => {

    let newRadio: Radios | null
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
      case null:
        newRadio = null
        break
    }

    if (
      barCurrentRadio === newRadio &&
      barMusicStream &&
      barMusicStream.playing
    )
      return
    if (barMusicStream) {
      barMusicStream.playing = false
      barMusicStream = null
    }
    barCurrentRadioIndex = e.index
    barCurrentRadio = newRadio

    JukeBoxText.value = 'Radio:\n' + getRadioName(barCurrentRadioIndex)

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

    GltfContainer.create(this.entity, {
        src: modelUrl
    })
    Transform.create(this.entity, {
        parent:baseJukeBox
    })
    
    AudioSource.create(this.entity, {
        audioClipUrl: 'sounds/click.mp3',
        loop: false,
        playing: false,
    })

    Animator.create(this.entity, {
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
    //utils.timers.clearTimeout(10)
    utils.timers.setTimeout(() =>{
      barMusicStream.volume = FullVolume

      AudioStream.getMutable(barMusicStreamEnt)
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
  if (barMusicStream) {
    barMusicStream.playing = false
  }
  VisibilityComponent.getMutable(baseJukeBoxLights1).visible = false
  VisibilityComponent.getMutable(baseJukeBoxLights2).visible = false
}

export function setBarMusicOn() {
  if (tutorialRunning) return
  sceneMessageBus.emit('enteredRadioRange', {
    radio: barCurrentRadioIndex,
  })
  isInBar = true
  if (barMusicStream) {
    barMusicStream.volume = FullVolume
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

  if (radioIsOn && barMusicStream && !barMusicStream.playing) {
    barMusicStream.playing = true
  }
  if (barMusicStream) {
    barMusicStream.volume = DistantVolume
  }

  return
}

export function raiseVolume() {
  if (tutorialRunning) return
  isInBar = true
  if (radioIsOn && barMusicStream && !barMusicStream.playing) {
    barMusicStream.playing = true
  }

  if(barMusicStream != null) barMusicStream.volume = FullVolume
}

export function setStreamVolume(vol: number) {
  if (!isInBar) return

  if(barMusicStream != null){
    barMusicStream.playing = true
    barMusicStream.volume = vol
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

export function addMicFeedback() {

  let feedback = engine.addEntity()
  let mic = engine.addEntity()

  Transform.create(mic, {
    position: Vector3.create(160, 2.2, 167.7),
    scale: Vector3.create(0.35, 0.35, 0.35),
  })

  MeshRenderer.setBox(mic)

  
  AudioSource.create(feedback, {
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

        /*  IS USING NPC.ts THAT IT ISN'T BEEN IMPORTED YET
        if (!firstTimeMic) {
          firstTimeMic = true
          
          octopus.talk(OctoComments, 'mic')
          
          utils.timers.setTimeout(() => {
            octopus.endInteraction()
          },
          6000
          )
        }*/
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
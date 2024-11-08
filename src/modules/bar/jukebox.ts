//import { OctoComments, octopus } from './barNPCs'
import { Animator, AudioSource, AudioStream, Entity, GltfContainer, InputAction, Material, MeshRenderer, PBAudioStream, TextShape, Transform, VisibilityComponent, engine, pointerEventsSystem } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import * as utils from '@dcl-sdk/utils'
import { sceneMessageBus } from '../serverHandler'
import { tutorialRunning } from '../../lobby/beamPortal'
import { coreBuildingOffset } from '../../lobby/resources/globals'
import { TrackingElement, generateGUID, getRegisteredAnalyticsEntity, trackAction } from '../stats/analyticsComponents'
import { ANALYTICS_ELEMENTS_IDS, ANALYTICS_ELEMENTS_TYPES, AnalyticsLogLabel } from '../stats/AnalyticsConfig'



export enum Radios {
  //RAVE = 'https://icecast.ravepartyradio.org/ravepartyradio-192.mp3', 
  ISLASLOWBEAT = 'https://radioislanegra.org/radio/8010/basic.aac',
 // DELTA = 'https://cdn.instream.audio/:9069/stream?_=171cd6c2b6e',
  ISLAUPBEAT = 'https://radioislanegra.org/listen/up/basic.aac', 
  ISLACLASSIC = 'https://radioislanegra.org/radio/8000/basic.aac',
  // SIGNS = 'https://edge.singsingmusic.net/MC2.mp3',
  // JAZZ = 'https://live.vegascity.fm/radio/8010/the_flamingos.mp3',
}

let FullVolume = 0.1
let DistantVolume = 0.03

//this has to be set false and triggered inside Index.ts see: https://github.com/nobodysGitHub/Genesis-Plaza/blob/master/src/game.ts#L92
export let isInBar: boolean = false

let barCurrentRadio: Radios | null = Radios.ISLASLOWBEAT
let defaultStartStream: PBAudioStream = {
  url: barCurrentRadio,
  playing: false,
  volume: FullVolume
}

let barCurrentRadioIndex: number = 0
let radioCount = 0
let radioIsOn: boolean = true

let JukeBoxText: Entity

const audioStreamEntity = engine.addEntity()


let baseJukeBox = engine.addEntity()
let baseJukeBoxLights1 = engine.addEntity()
let baseJukeBoxLights2 = engine.addEntity()


TrackingElement.create(baseJukeBox, {
  guid: generateGUID(),
  elementType: ANALYTICS_ELEMENTS_TYPES.interactable,
  elementId: ANALYTICS_ELEMENTS_IDS.jukeBox,
  parent: getRegisteredAnalyticsEntity(ANALYTICS_ELEMENTS_IDS.bar)
})



let jukeBoxAdded: boolean = false

export function placeJukeBox() {
  if (jukeBoxAdded) return

  jukeBoxAdded = true

  console.log("jukeBox.ts placeJukeBox has being called")
  
  AudioStream.createOrReplace(audioStreamEntity, defaultStartStream)
  
 

  GltfContainer.createOrReplace(baseJukeBox, {
    src: 'models/core_building/jukebox/Jukebox_Base.glb'
  })

  Transform.createOrReplace(baseJukeBox, {
    position: Vector3.create(179 - coreBuildingOffset.x, 0, 144 - coreBuildingOffset.z),
    rotation: Quaternion.fromEulerDegrees(0, -45, 0),
    scale: Vector3.create(0.75, 0.75, 0.75),
  })

  GltfContainer.createOrReplace(baseJukeBoxLights1, {
    src: 'models/core_building/jukebox/Lights_01.glb'
  })
  VisibilityComponent.createOrReplace(baseJukeBoxLights1, { visible: false })

  Transform.createOrReplace(baseJukeBoxLights1, {
    parent: baseJukeBox
  })

  GltfContainer.createOrReplace(baseJukeBoxLights2, {
    src: 'models/core_building/jukebox/Lights_02.glb',
  })
  VisibilityComponent.createOrReplace(baseJukeBoxLights2, { visible: false })

  Transform.createOrReplace(baseJukeBoxLights2, {
    parent: baseJukeBox
  })


  let JukeboxScreen = engine.addEntity()
  JukeBoxText = engine.addEntity()

  Transform.createOrReplace(JukeBoxText, {
    parent: JukeboxScreen
  })

  Transform.createOrReplace(JukeboxScreen, {
    position: Vector3.create(0, 2.55, 0.25),
    rotation: Quaternion.create(0, 180, 0),
    parent: baseJukeBox
  })

  TextShape.createOrReplace(JukeBoxText, {
    text: 'Radio:\nIsla Negra',
    fontSize: 1
  })

  let onButton = new JukeboxButton(
    'models/core_building/jukebox/Button_On.glb',
    'Button_On',
    () => {
      console.log("jukebox.ts", "press.onButton", "ENTRY")

      let audioStreamRef = AudioStream.getMutable(audioStreamEntity)
      let musicState = audioStreamRef && audioStreamRef.playing

      sceneMessageBus.emit('BarRadioToggle', {
        state: !musicState
      })

      console.log(AnalyticsLogLabel, "JukeBoxButton", "Button_On")
      let boxState = !musicState ? "ON" : "OFF"
      trackAction(baseJukeBox, "button_on_off", boxState)      

    },
    'On/Off'
  )

  // let nextButton = new JukeboxButton(
  //   'models/core_building/jukebox/ButtonForward.glb',
  //   'Button_Forward',
  //   () => {
  //     barCurrentRadioIndex += 1
  //     if (barCurrentRadioIndex > radioCount) barCurrentRadioIndex = 0
  //     TextShape.getMutable(JukeBoxText).text = 'Radio:\n' + getRadioName(barCurrentRadioIndex)

  //     let audioStreamRef = AudioStream.getMutable(audioStreamEntity)
  //     if (audioStreamRef && audioStreamRef.playing) {
  //       sceneMessageBus.emit('setBarRadio', {
  //         index: barCurrentRadioIndex
  //       })
  //     }

  //     console.log(AnalyticsLogLabel, "JukeBoxButton", "Button_Forward")
  //     trackAction(baseJukeBox, "button_forward", undefined)

      
  //   },
  //   'Next'
  // )

  // let prewiousButton = new JukeboxButton(
  //   'models/core_building/jukebox/Button_Previous.glb',
  //   'Button_Preview',
  //   () => {
  //     barCurrentRadioIndex -= 1
  //     if (barCurrentRadioIndex < 0) barCurrentRadioIndex = radioCount 
  //     TextShape.getMutable(JukeBoxText).text = 'Radio:\n' + getRadioName(barCurrentRadioIndex)

  //     let audioStreamRef = AudioStream.getMutable(audioStreamEntity)
  //     if (audioStreamRef && audioStreamRef.playing) {
  //       sceneMessageBus.emit('setBarRadio', {
  //         index: barCurrentRadioIndex,
  //       })
  //     }

  //     console.log(AnalyticsLogLabel, "JukeBoxButton", "Button_Preview")
  //     trackAction(baseJukeBox, "previous_button", undefined)
  //   },
  //   'Previous'
  // )

  sceneMessageBus.on('BarRadioToggle', (e) => {
    console.log("jukebox.ts", "onBarRadioToggle", "ENTRY")
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
        newRadio = Radios.ISLASLOWBEAT
        break
      // case 1:
      //   newRadio = Radios.ISLAUPBEAT
      //   break
      // case 2:
      //   newRadio = Radios.ISLACLASSIC
      //   break
      // case 3:
      //   newRadio = Radios.JAZZ
      //   break
      // case 4:
      //   newRadio = Radios.SIGNS
      //   break
      default:
        newRadio = Radios.ISLAUPBEAT
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
      //console.log("cica")
      audioStreamRef.playing = false
    }
    barCurrentRadioIndex = e.index
    barCurrentRadio = newRadio


    TextShape.getMutable(JukeBoxText).text = 'Radio:\n' + getRadioName(barCurrentRadioIndex)

    console.log("SETTING BAR RADION TO: " + barCurrentRadio)
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
      parent: baseJukeBox
    })

    AudioSource.createOrReplace(this.entity, {
      audioClipUrl: 'sounds/click.mp3',
      loop: false,
      playing: false,
    })

    Animator.createOrReplace(this.entity, {
      states: [{
        clip: animationName,
        loop: false,
        playing: false
      }]
    })


    pointerEventsSystem.onPointerDown(
      {
        entity: this.entity,
        opts: {
          button: InputAction.IA_POINTER,
          hoverText: text ? text : 'Press',
        }
      },
      (e) => {
        action()
        this.press(animationName)
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
let barRadioOnTimeoutId: number | undefined = undefined

function barRadioOn(station?: Radios) {
  if (tutorialRunning) return

  console.log("jukebox.ts", "barRadioOn", "ENTRY", station)

  TextShape.getMutable(JukeBoxText).text = 'Radio:\n' + getRadioName(barCurrentRadioIndex)

  if (isInBar) {
    console.log("jukebox.ts ButtonOn has been pressed")
    if (barRadioOnTimeoutId) utils.timers.clearTimeout(barRadioOnTimeoutId)
    barRadioOnTimeoutId = utils.timers.setTimeout(() => {
      console.log("jukebox.ts", "barRadioOn", "timer.fired", station)
      //debugger
      
      AudioStream.createOrReplace(audioStreamEntity, {
        url: station ? station : Radios.ISLASLOWBEAT
        , playing: true
        , volume: FullVolume
      }) 
      //AudioStream.createOrReplace(audioStreamEntity, getStream(0))

      VisibilityComponent.getMutable(baseJukeBoxLights1).visible = true
      VisibilityComponent.getMutable(baseJukeBoxLights2).visible = true
    },
      100
    )
  }
  radioIsOn = true
}

function barRadioOff() {
  console.log("jukebox.ts ButtonOff has been pressed")
  let audioStreamRef = AudioStream.getMutableOrNull(audioStreamEntity)
  if (audioStreamRef) {
    audioStreamRef.playing = false
  }
  VisibilityComponent.getMutable(baseJukeBoxLights1).visible = false
  VisibilityComponent.getMutable(baseJukeBoxLights2).visible = false

  TextShape.getMutable(JukeBoxText).text = "OFF"
}

export function setBarMusicOn() {
  if (tutorialRunning) return

  console.log("jukebox.ts setBarMusicOn has been called")
  let audioStreamRef = AudioStream.getMutableOrNull(audioStreamEntity)

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

  if (audioStreamRef != null) audioStreamRef.volume = FullVolume
}

export function setStreamVolume(vol: number) {
  if (!isInBar) return

  let audioStreamRef = AudioStream.getMutable(audioStreamEntity)

  if (audioStreamRef != null) {
    audioStreamRef.playing = true
    audioStreamRef.volume = vol
  }
}

function getRadioName(radio: number) {
  let radioName: string = ''
  switch (radio) {
    case 0:
      radioName = 'Isla Negra'
      break
    // case 1:
    //   radioName = 'Upbeat'
    //   break
    // case 2:
    //   radioName = 'Classic'
    //   break
    // case 3:
    //   radioName = 'Vegas Jazz FM'
    //   break
    // case 4:
    //   radioName = 'Signs'
    //   break
    case null:
      radioName = 'Off'
      break
  }
  return radioName
}




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
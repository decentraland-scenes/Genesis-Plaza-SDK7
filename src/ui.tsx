import { engine, PBUiCanvasInformation, UiCanvasInformation } from '@dcl/sdk/ecs'
import ReactEcs, { ReactEcsRenderer } from '@dcl/sdk/react-ecs'
import { NpcUtilsUi, setupNPCUiScaling } from 'dcl-npc-toolkit/dist/ui'
import { customNpcUI, setupCustomNPCUiScaling } from './utils/customNpcUi/customUi'
import { render } from 'dcl-ui-toolkit'
import { setupEventDetailsUIScaling, uiEventDettails } from './eventDetailsUI'
import { uiBeamMeUp } from './beamUpUI'
import { uiBasketballPower, uiBasketballScore, uiOutOfBounds } from './basketbakkUI'

let tieredModalScale = 1
let tieredFontScale = 1
let tieredModalTextWrapScale = 1

let devicePixelRatioScale: number = 1

export function updateUIScalingWithCanvasInfo(canvasInfo: PBUiCanvasInformation) {
  //higher res go bigger
  //threshhold???
  ///(1920/1080)/1.35 = 1.3
  ///(1920/1080)/1.1 = 1.6
  devicePixelRatioScale = 1920 / 1080 / canvasInfo.devicePixelRatio

  console.log('updateUIScalingWithCanvasInfo', canvasInfo, 'devicePixelRatioScale', devicePixelRatioScale)

  const PIXEL_RATIO_THREADHOLD = 1.2
  //at least for this side of the screen window checking dimensions seems better than ratio
  //const threshHoldHit = canvasInfo.width > 2300 && canvasInfo.height > 1300
  //const threshHoldHit = devicePixelRatioScale>PIXEL_RATIO_THREADHOLD

  //bigger and taller
  if (canvasInfo.width > 1920 && canvasInfo.height > 1080) {
    tieredModalScale = 2
    tieredFontScale = 2
    tieredModalTextWrapScale = 1.08
    /*}else if(canvasInfo.width < 2300 && canvasInfo.height > 1200){
    //gave up on this for now
    //very tall and skinny shift down
    tieredModalScale = 1.2
    tieredFontScale = 1.4
    tieredModalTextWrapScale = .8*/
  } else {
    //default is 1
    tieredModalScale = 1.1
    tieredFontScale = 1.1
    tieredModalTextWrapScale = 0.9
  }
  console.log(
    'updateUIScalingWithCanvasInfo',
    canvasInfo,
    'devicePixelRatioScale',
    devicePixelRatioScale,
    'tieredModalScale',
    tieredModalScale,
    'tieredFontScale',
    tieredFontScale,
    'tieredModalTextWrapScale',
    tieredModalTextWrapScale
  )
  const scale = canvasInfo.height / 1080
  setupCustomNPCUiScaling(scale, scale, scale)
  setupNPCUiScaling(scale, scale, scale)
  setupEventDetailsUIScaling(scale, scale, scale)
}

const uiComponent = () => [
  NpcUtilsUi(),
  uiBeamMeUp(),
  customNpcUI(),
  uiBasketballPower(),
  uiBasketballScore(),
  uiOutOfBounds(),
  uiEventDettails(),
  //uiSpawnCube()
  render()
]

setupUi()

export let canvasInfo: PBUiCanvasInformation = {
  width: 0,
  height: 0,
  devicePixelRatio: 1,
  interactableArea: undefined
}

let setupUiInfoEngineAlready = false
export function setupUiInfoEngine() {
  if (setupUiInfoEngineAlready) return

  setupUiInfoEngineAlready = true

  let maxWarningCount = 20
  let warningCount = 0
  engine.addSystem((deltaTime) => {
    const uiCanvasInfo = UiCanvasInformation.getOrNull(engine.RootEntity)

    if (!uiCanvasInfo) {
      warningCount++
      if (warningCount < maxWarningCount) {
        console.log('setupUiInfoEngine', 'WARNING ', warningCount, 'screen data missing: ', uiCanvasInfo)
      }
      return
    } else if (maxWarningCount > 0) {
      maxWarningCount = 0
      console.log('setupUiInfoEngine', 'FIXED ' + 'screen data resolved: ', uiCanvasInfo)
    }

    if (canvasInfo.width === uiCanvasInfo.width && canvasInfo.height === uiCanvasInfo.height) return

    console.log('setupUiInfoEngine', 'Updated', 'Width', canvasInfo.width, 'Height:', canvasInfo.height)
    canvasInfo.width = uiCanvasInfo.width
    canvasInfo.height = uiCanvasInfo.height
    canvasInfo.devicePixelRatio = uiCanvasInfo.devicePixelRatio
    canvasInfo.interactableArea = uiCanvasInfo.interactableArea

    updateUIScalingWithCanvasInfo(canvasInfo)

    /*console.log("setupUiInfoEngine",'--------------' ,
     '\nscreen width: ' + uiCanvasInfo.width ,
       '\nscreen height: ' + uiCanvasInfo.height ,
       '\nscreen pixel ratio: ' + uiCanvasInfo.devicePixelRatio ,
       '\n--------------')*/
  })
}
export function setupUi() {
  setupUiInfoEngine()
  ReactEcsRenderer.setUiRenderer(uiComponent)
}

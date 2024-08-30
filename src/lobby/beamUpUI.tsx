import { Color4 } from '@dcl/ecs-math'
import ReactEcs, { Button, DisplayType, Label, ReactEcsRenderer, UiEntity, PositionUnit } from '@dcl/sdk/react-ecs'
import { triggerCounter } from './beamPortal'

let teleportUIVisibility: DisplayType = 'none'
let timeToBeamUp: number = 3

let modalScale = 1
let modalFontSizeScale = 1
let modalTextWrapScale = 1

export function setupBeamUiScaling(inScale: number, inFontSize: number, inTextWrapScale: number) {
  if (modalScale === inScale && modalFontSizeScale === inFontSize && modalTextWrapScale === inTextWrapScale) return
  console.log(
    'CustomNPCUI',
    'resolution is changed',
    'Scale:',
    inScale,
    'FontSize:',
    inFontSize,
    'TextWrapScale:',
    inTextWrapScale
  )
  modalScale = inScale
  modalFontSizeScale = inFontSize
  modalTextWrapScale = inTextWrapScale
}

function getScaledSize(size: number): number {
  return size * modalScale
}

function getScaledFontSize(size: number): number {
  return size * modalFontSizeScale
}

function getTextWrapSize(size: number): number {
  return size * modalTextWrapScale
}

export function showTeleportUI(isVisible: DisplayType) {
  console.log('showTeleportUI', isVisible)
  //debugger
  teleportUIVisibility = isVisible
}
export function setTeleportCountdown(_numberString: string) {
  //teleportCountdownText.value = _numberString
}

export const uiBeamMeUp = () => (
  <UiEntity
    uiTransform={{
      width: getScaledSize(500),
      height: getScaledSize(250),
      display: teleportUIVisibility,
      alignContent: 'center',
      position: { left: '40%', top: '5%' },
      positionType: 'absolute'
    }}
    uiBackground={{
      texture: {
        src: 'images/ui_beam_up_bg.png'
      },
      textureMode: 'stretch'
      //,color: Color4.Black()
    }}
  >
    <Label
      value={`<b>${triggerCounter.counter.toFixed(0)}</b>`}
      color={Color4.Black()}
      fontSize={getScaledFontSize(40)}
      font="serif"
      textAlign="middle-center"
      uiTransform={{
        position: { top: getScaledSize(52), right: getScaledSize(-235) }
      }}
    />
  </UiEntity>
)

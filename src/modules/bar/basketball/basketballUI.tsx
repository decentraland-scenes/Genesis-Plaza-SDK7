import { engine } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { DisplayType, Label, UiEntity, PositionUnit } from '@dcl/sdk/react-ecs'
import * as utils from '@dcl-sdk/utils'

let scoreUIVisible: DisplayType = 'none'
let basketUIVisible: DisplayType = 'none'
let outOfBoundsVisible: DisplayType = 'none'
let outOfBoundsText: string = 'Ball out of bounds'
let strengthBarVisible: DisplayType = 'none'
let strengthAlpha: Color4 = Color4.fromInts(0, 255, 20, 200)
let powerHightlightVisible: DisplayType = 'none'
let strengthValue: PositionUnit = '30%'
let shake: number = 0
const originalPos = 50
let shakePos: PositionUnit = '50%'
let isScoreEnabled = false
let scorePositionX: PositionUnit = '0%'

let scaleScore: number = 0

let modalScale = 1
let modalFontSizeScale = 1
let modalTextWrapScale = 1

export function setupBasketballUiScaling(inScale: number, inFontSize: number, inTextWrapScale: number) {
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

export const uiOutOfBounds = () => (
  <UiEntity
    //top level root ui div
    uiTransform={{
      width: getScaledSize(400),
      height: getScaledSize(400),

      // { top: 4, bottom: 4, left: 4, right: 4 },
      padding: getScaledSize(4),
      alignContent: 'center',
      display: outOfBoundsVisible,
      positionType: 'absolute',
      position: { top: shakePos, left: shakePos }
    }}
  >
    <Label
      // OUT OF BOUNDS MESSAGE
      value={outOfBoundsText}
      fontSize={getScaledFontSize(32)}
      textAlign="middle-center"
      uiTransform={{ width: '100%', height: '30%', positionType: 'absolute', position: { left: '-50%' } }}
      uiBackground={{
        textureMode: 'nine-slices',
        texture: {
          src: 'images/basketball/bar_fg.png'
        },
        textureSlices: {
          top: 0.49,
          bottom: 0.49,
          left: 0.49,
          right: 0.49
        }
      }}
    />
  </UiEntity>
)
export const uiBasketballScore = () => (
  <UiEntity
    //top level root ui div
    uiTransform={{
      width: '20%',
      height: '30%',

      // { top: 4, bottom: 4, left: 4, right: 4 },
      padding: getScaledSize(4),
      alignContent: 'center',
      display: basketUIVisible,
      positionType: 'absolute',
      position: { top: '50%', left: '50%' }
    }}
  >
    <UiEntity
      // container for SCORE popup
      uiTransform={{
        //width: '100%',
        //height: '10%',
        flexDirection: 'column',
        alignItems: 'center',
        alignSelf: 'center',
        display: scoreUIVisible,
        positionType: 'absolute',
        width: getScaledSize(scaleScore),
        height: getScaledSize(scaleScore) / 2,
        position: { top: scorePositionX, left: -getScaledSize(scaleScore) / 2 }
      }}
    >
      <Label
        // SCORE popup image
        value=""
        fontSize={getScaledFontSize(60)}
        uiTransform={{ width: '100%', height: '100%', positionType: 'relative' }}
        uiBackground={{
          textureMode: 'stretch',
          texture: {
            src: 'images/basketball/score_text.png'
          }
        }}
      />
    </UiEntity>
  </UiEntity>
)
export const uiBasketballPower = () => (
  <UiEntity
    //top level root ui div
    uiTransform={{
      width: '20%',
      height: '30%',

      // { top: 4, bottom: 4, left: 4, right: 4 },
      padding: getScaledSize(4),
      alignContent: 'center',
      display: basketUIVisible,
      positionType: 'absolute',
      position: { bottom: '0%', left: '50%' }
    }}
  >
    <UiEntity
      // root container for bar
      uiTransform={{
        width: '100%',
        height: '100%',
        alignContent: 'center',
        positionType: 'absolute'
      }}
    >
      <UiEntity
        // Powerbar container
        uiTransform={{
          width: '100%',
          height: '30%',
          minHeight: getScaledSize(100),
          alignItems: 'center',
          alignSelf: 'center',
          positionType: 'absolute',
          position: { left: '-50%', top: '70%' },
          display: strengthBarVisible
        }}
      >
        <UiEntity
          //powerbar highlight
          uiTransform={{
            width: '100%',
            height: '100%',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            alignSelf: 'center',
            positionType: 'absolute',
            display: powerHightlightVisible
          }}
          uiBackground={{
            textureMode: 'nine-slices',
            texture: {
              src: 'images/basketball/bar_bg.png'
            },
            textureSlices: {
              top: 0.49,
              bottom: 0.49,
              left: 0.49,
              right: 0.49
            }
          }}
        ></UiEntity>

        <UiEntity
          //powerbar scaling bar part
          uiTransform={{
            width: strengthValue,
            height: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            alignSelf: 'center'
          }}
          uiBackground={{
            textureMode: 'nine-slices',
            texture: {
              src: 'images/basketball/bar_rounded.png'
            },
            textureSlices: {
              top: 0.49,
              bottom: 0.49,
              left: 0.49,
              right: 0.49
            },
            color: strengthAlpha
          }}
        ></UiEntity>
        <UiEntity
          //powerbar frame image
          uiTransform={{
            width: '100%',
            height: '100%',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            alignSelf: 'center',
            positionType: 'absolute'
          }}
          uiBackground={{
            textureMode: 'nine-slices',
            texture: {
              src: 'images/basketball/bar_fg.png'
            },
            textureSlices: {
              top: 0.49,
              bottom: 0.49,
              left: 0.49,
              right: 0.49
            }
          }}
        >
          <Label
            // Instructions text for power bar
            value="        Press and hold       to set throw power"
            fontSize={getScaledFontSize(20)}
            uiTransform={{
              width: '100%',
              height: '100%',
              positionType: 'absolute',
              position: { top: '0%', left: '-5%' }
            }}
            uiBackground={{
              textureMode: 'center',
              texture: {
                src: 'images/basketball/lmb_icon.png'
              }
            }}
          />
        </UiEntity>
      </UiEntity>
    </UiEntity>
  </UiEntity>
)

export function displayBasketballUI() {
  basketUIVisible = 'flex'
  showStrenghtBar()
}
export function hideBasketballUI() {
  basketUIVisible = 'none'
}
// STRENGTH BAR SETTINGS
export function showStrenghtBar() {
  strengthBarVisible = 'flex'
}
export function hideStrenghtBar() {
  strengthBarVisible = 'none'
}
export function showBarHighlight() {
  powerHightlightVisible = 'flex'
}
export function hideBarHighlight() {
  powerHightlightVisible = 'none'
}
// OOB UI
export function showOOB(text: string) {
  outOfBoundsVisible = 'flex'
  outOfBoundsText = text
  elapsedTime = 0
}
export function hideOOB() {
  outOfBoundsVisible = 'none'
}

let elapsed = 0

export function scoreDisplay() {
  scoreUIVisible = 'flex'
  elapsed = 0
  isScoreEnabled = true
}
export function hideScore() {
  scoreUIVisible = 'none'
}

export function setStrengthBar(value: number) {
  strengthValue = ((0.0 + value) * 100 + '%') as PositionUnit
  shake = value * 20
  strengthAlpha = Color4.fromInts(value * 255, 255 - value * 200, 20, 200 + value * 55)
}

let elapsedTime = 0

// UI SHAKE FOR OUT OF BOUNDS POPUP
engine.addSystem((dt: number) => {
  if (elapsedTime < 0.4) {
    elapsedTime += dt
    let shakeSize = originalPos + Math.random() * 30 * dt * (0.4 - elapsedTime)
    shakePos = (shakeSize + '%') as PositionUnit
  } else {
    shakePos = '50%'
  }

  //console.log("SHAKE: " + shakePos )
})

engine.addSystem((dt: number) => {
  let scoreXNum = 0
  let animTime = 3
  if (isScoreEnabled) {
    elapsed += dt

    if (elapsed < animTime * 0.5) {
      // scorePositionX  =  ( scoreXNum + Math.sin(elapsed*10)*(1-elapsed/animTime)*20 + '%') as PositionUnit
      scaleScore = utils.interpolate(utils.InterpolationType.EASEOUTELASTIC, elapsed) * 512
    } else {
      scaleScore = (1 - utils.interpolate(utils.InterpolationType.EASEOUTEXPO, elapsed - animTime * 0.5)) * 512
      if (scaleScore < 0) {
        scaleScore = 0
      }
    }

    if (elapsed > animTime) {
      hideScore()
      elapsed = 0
      isScoreEnabled = false
      scorePositionX = (scoreXNum + '%') as PositionUnit
    }
  }
})

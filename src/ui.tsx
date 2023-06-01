import { engine, Transform } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Button, DisplayType, Label, ReactEcsRenderer, UiEntity, PositionUnit } from '@dcl/sdk/react-ecs'
import { Cube } from './components'
import { createCube } from './factory'
import { triggerCounter } from './lobby/beamPortal'
import { NpcUtilsUi } from 'dcl-npc-toolkit/dist/ui'
import { customNpcUI } from './utils/customNpcUi/customUi'

import * as utils from '@dcl-sdk/utils'

let teleportUIVisibility: DisplayType = 'none'
let timeToBeamUp: number = 3
let scoreUIVisible: DisplayType = 'none'
let basketUIVisible: DisplayType = 'none'
let strengthBarVisible: DisplayType = 'none'
let strengthValue: PositionUnit = '20%'
let shake: number = 0
const originalPos: PositionUnit = '50%'
let shakePos: PositionUnit = '50%'
let isScoreEnabled = false
let scorePositionX: PositionUnit = '0%'

let scaleScore: number = 0

export function showTeleportUI(isVisible: DisplayType) {
  console.log('showTeleportUI', isVisible)
  //debugger
  teleportUIVisibility = isVisible
}
export function setTeleportCountdown(_numberString: string) {
  //teleportCountdownText.value = _numberString
}

const uiBasketball = () => (
  <UiEntity
    //top level root ui div
    uiTransform={{
      width: 400,
      height: 400,

      // { top: 4, bottom: 4, left: 4, right: 4 },
      padding: 4,
      alignContent: 'center',
      display: basketUIVisible,
      position: { top: '50%', left: '50%' }
    }}
  >
    <UiEntity
      // root container for bar and score popups
      uiTransform={{
        width: '100%',
        height: '100%',
        alignContent: 'center',
        positionType: 'absolute'
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
          width: scaleScore,
          height: scaleScore / 2,
          position: { top: scorePositionX, left: -scaleScore / 2 }
        }}
      >
        <Label
          // SCORE popup image
          value=""
          fontSize={60}
          uiTransform={{ width: '100%', height: '100%', positionType: 'relative' }}
          uiBackground={{
            textureMode: 'stretch',
            texture: {
              src: 'images/basketball/score_text.png'
            }
          }}
        />
      </UiEntity>

      <UiEntity
        // Powerbar container
        uiTransform={{
          width: '100%',
          height: '128',
          alignItems: 'center',
          alignSelf: 'center',
          positionType: 'absolute',
          position: { left: '-50%', top: '50%' },
          display: strengthBarVisible
        }}
      >
        <UiEntity
          //powerbar scaling bar part
          uiTransform={{
            width: strengthValue,
            height: '90%',
            flexDirection: 'column',
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
            }
          }}
        ></UiEntity>
        <UiEntity
          //powerbar frame image
          uiTransform={{
            width: '100%',
            height: '90%',
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
        ></UiEntity>
      </UiEntity>
    </UiEntity>
  </UiEntity>
)

const uiBeamMeUp = () => (
  <UiEntity
    uiTransform={{
      width: 500,
      height: 250,
      display: teleportUIVisibility,
      alignContent: 'center',
      position: { left: '40%', top: '5%' },
      positionType: 'absolute'
    }}
    uiBackground={{
      texture: {
        src: 'images/ui_beam_up_bg.png'
      }
      //,color: Color4.Black()
    }}
  >
    <Label
      value={triggerCounter.counter.toFixed(0)}
      color={Color4.Black()}
      fontSize={40}
      font="serif"
      textAlign="middle-center"
      uiTransform={{
        position: { top: '55px', right: '-248px' }
      }}
    />
  </UiEntity>
)

const uiSpawnCube = () => (
  <UiEntity
    uiTransform={{
      width: 400,
      height: 230,
      //  { top: 16, right: 0, bottom: 8 left: 270 },
      margin: '16px 0 8px 270px',
      // { top: 4, bottom: 4, left: 4, right: 4 },
      padding: 4
    }}
    uiBackground={{ color: Color4.create(0.5, 0.8, 0.1, 0.6) }}
  >
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
      uiBackground={{ color: Color4.fromHexString('#70ac76ff') }}
    >
      <UiEntity
        uiTransform={{
          width: '100%',
          height: 50,
          margin: '8px 0'
        }}
        uiBackground={{
          textureMode: 'center',
          texture: {
            src: 'images/scene-thumbnail.png'
          }
        }}
        uiText={{ value: 'SDK7', fontSize: 18 }}
      />
      <Label
        onMouseDown={() => {
          console.log('Player Position clicked !')
        }}
        value={`Player: ${getPlayerPosition()}`}
        fontSize={18}
        uiTransform={{ width: '100%', height: 30 }}
      />
      <Label
        onMouseDown={() => {
          console.log('# Cubes clicked !')
        }}
        value={`# Cubes: ${[...engine.getEntitiesWith(Cube)].length}`}
        fontSize={18}
        uiTransform={{ width: '100%', height: 30 }}
      />
      <Button
        uiTransform={{ width: 100, height: 40, margin: 8 }}
        value="Spawn cube"
        variant="primary"
        fontSize={14}
        onMouseDown={() => {
          createCube(1 + Math.random() * 8, Math.random() * 8, 1 + Math.random() * 8, false)
        }}
      />
    </UiEntity>
  </UiEntity>
)

function getPlayerPosition() {
  const playerPosition = Transform.getOrNull(engine.PlayerEntity)
  if (!playerPosition) return ' no data yet'
  const { x, y, z } = playerPosition.position
  return `{X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}, z: ${z.toFixed(2)} }`
}

const uiComponent = () => [
  NpcUtilsUi(),
  uiBeamMeUp(),
  customNpcUI()
  //uiSpawnCube()
]

setupUi()

export function setupUi() {
  ReactEcsRenderer.setUiRenderer(uiComponent)
}

export function displayBasketballUI() {
  basketUIVisible = 'flex'
  showStrenghtBar()
}
export function hideBasketballUI() {
  basketUIVisible = 'none'
}

export function showStrenghtBar() {
  strengthBarVisible = 'flex'
}
export function hideStrenghtBar() {
  strengthBarVisible = 'none'
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
  strengthValue = (0.2 + value * 100 + '%') as PositionUnit
  shake = value * 20
}

let elapsedTime = 0

// UI SHAKE
engine.addSystem((dt: number) => {
  shakePos = (originalPos + Math.random() * shake) as PositionUnit
})

let factor = 0

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

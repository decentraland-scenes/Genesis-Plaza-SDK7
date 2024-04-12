import { Transform, engine } from '@dcl/ecs'
import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Button, DisplayType, Label, ReactEcsRenderer, UiEntity, PositionUnit } from '@dcl/sdk/react-ecs'

import * as utils from '@dcl-sdk/utils'
import { cleanString, wordWrap } from './helperFunctions'

let eventTitleText: string = 'Title'
let eventDetailText: string = 'Description'
let eventDetailVisible: DisplayType = 'none'
let eventThumbnail: string = 'images/fallback-scene-thumb.png'
let eventAnimatedY: PositionUnit = '0%'
let eventAnimFactor: number = 0

let tieredModalScale = 1
let tieredFontScale = 1
let tieredModalTextWrapScale = 1
let textWarpLimit = 43

export function setupEventDetailsUIScaling(inModalScale: number, inFontScale: number, inModalTextWrapScale: number) {
  tieredModalScale = inModalScale
  tieredFontScale = inFontScale
  tieredModalTextWrapScale = inModalTextWrapScale 
  // textWarpLimit = 20
 
   console.log("FONT SCALE: " + tieredFontScale ) 
  
  // if(inModalScale > 1.0){
  //   textWarpLimit = 43 
  // }
}

export const uiEventDettails = () => (
  <UiEntity
    //top level root ui div
    uiTransform={{
      width: `${400 * tieredModalScale}`,
      height: `${800 * tieredModalScale}`,

      // { top: 4, bottom: 4, left: 4, right: 4 },
      padding: { top: 0, bottom: 0, left: 4, right: 0 },
      alignContent: 'center',
      display: eventDetailVisible,
      flexDirection: 'column',
      positionType: 'absolute',
      position: { top: '12%', right: eventAnimatedY },
      flexWrap: 'wrap',
      justifyContent: 'flex-start'
      //overflow: 'scroll'
    }}
    uiBackground={{
      textureMode: 'nine-slices',
      texture: {
        src: 'images/event_ui_bg.png'
      },
      textureSlices: {
        top: 0.32,
        bottom: 0.32,
        left: 0.32,
        right: 0.32
      },
      color: Color4.fromHexString('#ffffffee')
    }}
  >
    <UiEntity
      //top level root ui div
      uiTransform={{
        width: '100%',
        height: '25%',

        // { top: 4, bottom: 4, left: 4, right: 4 },
        padding: { top: 0, bottom: 0, left: 4, right: 0 },
        alignContent: 'center',
        display: eventDetailVisible,
        positionType: 'relative',
        position: { top: '0%', right: '0%' }
      }}
      uiBackground={{
        textureMode: 'stretch',
        texture: {
          src: eventThumbnail
        }
      }}
    >
      <Label
        // CLOSE button
        value=" Close >>>"
        fontSize={16 * tieredFontScale}
        color={Color4.fromHexString('#bbbbbbff')}
        textAlign="top-left"
        uiTransform={{
          margin: { left: -1 },
          width: '100.5%',
          height: '16%',
          positionType: 'absolute',
          position: { top: '-15.5%', left: '0%' }
        }}
        onMouseDown={hideEventUI}
        uiBackground={{
          textureMode: 'nine-slices',
          texture: {
            src: 'images/event_close_tab.png'
          },
          textureSlices: {
            top: 0.5,
            bottom: 0.0,
            left: 0.45,
            right: 0.45
          },
          color: Color4.fromHexString('#ffffffff')
        }}
      />
    </UiEntity>

    <UiEntity
      //Title container
      uiTransform={{
        width: '99.5%',
        height: '10%',

        // { top: 4, bottom: 4, left: 4, right: 4 },
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        alignContent: 'center',
        display: eventDetailVisible,
        positionType: 'relative',
        position: { top: '0%', right: '0%' }
      }}
      uiBackground={{
        color: Color4.fromHexString('#2a2622ff')
      }}
    >
      <Label
        // EVENT TITLE
        value={eventTitleText}
        fontSize={20 * tieredFontScale}
        color={Color4.White()}
        textAlign="middle-center"
        uiTransform={{
          flexGrow: 3,
          width: '100%',
          height: '100%',
          positionType: 'relative',
          position: { top: '0%', left: '0%' }
        }}
      />
    </UiEntity>

    <UiEntity
      // Event DEtails text
      uiText={{
        value: eventDetailText,
        fontSize: 16 * tieredFontScale,
        font: 'sans-serif',
        color: Color4.Black(),
        textAlign: 'top-left'
      }}
      uiTransform={{
        width: '100%',
        height: '57%',
        positionType: 'relative',
        margin: { left: '2%' },
        position: { top: '0%', left: '2%' },
        flexWrap: 'wrap'
      }}
    ></UiEntity>

    <Label
      // PRESS X INSTRUCTION TEXT
      value="Press [ X ] to discover more events"
      color={Color4.fromHexString('#888888ff')}
      fontSize={18 * tieredFontScale}
      textAlign="bottom-center"
      uiTransform={{
        width: '100%',
        height: '10%',
        positionType: 'absolute',
        margin: { left: '2%' },
        position: { bottom: '2%' }
      }}
    />
  </UiEntity>
)

export function displayEventUI(event: any) {
  eventDetailVisible = 'flex'

  let rawTitle: string = event.name
  rawTitle = cleanString(rawTitle)
  rawTitle = wordWrap(rawTitle, 28 , 2) 

  eventTitleText = rawTitle

  eventDetailText = '\n\n' + wordWrap(cleanString(event.description), textWarpLimit , 18) + '</cspace>'

  eventThumbnail = event.image

  eventAnimFactor = 0
  factor = 0
  eventAnimatedY = (-100 + eventAnimFactor * 100 + 2 + '%') as PositionUnit
}
export function hideEventUI() {
  eventDetailVisible = 'none'
  eventAnimFactor = 0
  factor = 0
  //eventAnimatedY =  ((-100 + eventAnimFactor * 100 + 5) + '%') as PositionUnit
  eventAnimatedY = (eventAnimFactor + '%') as PositionUnit
}

let factor = 0
engine.addSystem((dt: number) => {
  // hide event card ui if player is furhter from the slider menu
  if (Transform.get(engine.PlayerEntity).position.z > 150) {
    if (factor < 1) {
      factor += dt * 4
      if (factor > 1) {
        factor = 1
      }

      eventAnimFactor = utils.interpolate(utils.InterpolationType.EASEOUTQUAD, factor)
      // eventAnimFactor += dt*5

      eventAnimatedY = (-100 + eventAnimFactor * 100 + 2 + '%') as PositionUnit
    } else {
      eventAnimatedY = (2 + '%') as PositionUnit
    }
  } else {
    hideEventUI()
  }
})

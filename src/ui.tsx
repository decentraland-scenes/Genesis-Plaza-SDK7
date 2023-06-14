import { engine, Transform } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Button, DisplayType, Label, ReactEcsRenderer, UiEntity, PositionUnit } from '@dcl/sdk/react-ecs'
import { triggerCounter } from './lobby/beamPortal'
import { NpcUtilsUi } from 'dcl-npc-toolkit/dist/ui'
import { customNpcUI } from './utils/customNpcUi/customUi'
import {render} from 'dcl-ui-toolkit'

import * as utils from '@dcl-sdk/utils'
import { cleanString, wordWrap } from './lobby/helperFunctions'

let teleportUIVisibility: DisplayType = 'none'
let timeToBeamUp: number = 3
let scoreUIVisible: DisplayType = 'none'
let basketUIVisible: DisplayType = 'none'
let outOfBoundsVisible: DisplayType = 'none'
let outOfBoundsText:string = "Ball out of bounds"
let strengthBarVisible: DisplayType = 'none'
let strengthAlpha: Color4 = Color4.fromInts(0, 255 ,20 , 200)
let powerHightlightVisible: DisplayType = 'none'
let strengthValue: PositionUnit = '30%'
let shake: number = 0
const originalPos = 50
let shakePos: PositionUnit = '50%'
let isScoreEnabled = false
let scorePositionX: PositionUnit = '0%'
let eventTitleText: string = "Title"
let eventDetailText: string = "Description"
let eventDetailVisible: DisplayType = "none"
let eventThumbnail:string = "images/fallback-scene-thumb.png"
let scaleScore: number = 0
let eventAnimatedY: PositionUnit = '0%'
let eventAnimFactor: number = 0

export function showTeleportUI(isVisible: DisplayType) {
  console.log('showTeleportUI', isVisible)
  //debugger
  teleportUIVisibility = isVisible
}
export function setTeleportCountdown(_numberString: string) {
  //teleportCountdownText.value = _numberString
}

const uiEventDettails = () => (
  <UiEntity
    //top level root ui div
    uiTransform={{
      width: '768',
      height: '1024',

      // { top: 4, bottom: 4, left: 4, right: 4 },
      padding: { top: 0, bottom: 0, left: 4, right: 0 },
      alignContent: 'center',
      display: eventDetailVisible,
      flexDirection:'column' , 
      positionType: 'absolute',
      position: { top: eventAnimatedY, right: '5%' },
      flexWrap:'wrap',      
      justifyContent:'flex-start',
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
      color: Color4.fromHexString("#ffffffbb")
    }}
  >
    <UiEntity
    //top level root ui div
    uiTransform={{
      width: '100%',
      height: '33%',

      // { top: 4, bottom: 4, left: 4, right: 4 },
      padding: { top: 0, bottom: 0, left: 4, right: 0 },
      alignContent: 'center',
      display: eventDetailVisible,
      positionType: 'relative',
      position: { top: '0%', right: '0%' }
      
    }}
    uiBackground={{     
      textureMode:'stretch',
      texture: {
        src: eventThumbnail
      },      
    }}
  ></UiEntity>

<UiEntity
    //Title container
    uiTransform={{
      width: '760',
      height: '10%',

      // { top: 4, bottom: 4, left: 4, right: 4 },
      padding: { top: 0, bottom: 0, left:0, right: 0 },
      alignContent: 'center',
      display: eventDetailVisible,
      positionType: 'relative',
      position: { top: '0%', right: '0%' }
      
    }}
    uiBackground={{     
      color: Color4.fromHexString("#2a2622ff")      
    }}
  >
    <Label
      // EVENT TITLE
      value = {eventTitleText}
      fontSize={30}
      color={ Color4.White()}      
      textAlign='middle-center'
      uiTransform={{ flexGrow:3 , width: '100%', height: '100%', positionType: 'relative', position: {top: '0%', left: '0%'}}}
      
    
    />
  </UiEntity>

    <Label
    // Event DEtails text
    value= {eventDetailText}
    color={ Color4.Black()}
    fontSize={20}
    textAlign='top-left'
    
    
    uiTransform={{ 
      width: '100%', 
      height: '10%', 
      positionType: 'absolute', 
      margin: {left: '2%'},
      position: {top: '40%', left: '2%'},
      flexWrap:'wrap',
      flexDirection:'column',
      justifyContent:'flex-start',
      //overflow: 'scroll'
      
    }}
        
  />
  <Label
    // PRESS X INSTRUCTION TEXT
    value= "Press [ X ] to discover more events"
    color={ Color4.fromHexString("#888888ff")}
    fontSize={24}
    textAlign='bottom-center'
    
    
    uiTransform={{ 
      width: '100%', 
      height: '10%', 
      positionType: 'absolute', 
      margin: {left: '2%'},
      position: {bottom: '2%'},
      
    }}
    />

  </UiEntity>
)

const uiOutOfBounds = () => (
  <UiEntity
    //top level root ui div
    uiTransform={{
      width: 400,
      height: 400,

      // { top: 4, bottom: 4, left: 4, right: 4 },
      padding: 4,
      alignContent: 'center',
      display: outOfBoundsVisible,
      positionType: 'absolute',
      position: { top: shakePos, left: shakePos }
    }}
  >

    <Label
      // OUT OF BOUNDS MESSAGE
      value = {outOfBoundsText}
      fontSize={32}
      textAlign='middle-center'
      uiTransform={{ width: '100%', height: '30%', positionType: 'absolute', position: {left: '-50%'}}}
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
const uiBasketballScore = () => (
  <UiEntity
    //top level root ui div
    uiTransform={{
      width: "20%",
      height: "30%",

      // { top: 4, bottom: 4, left: 4, right: 4 },
      padding: 4,
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

    </UiEntity>
 

)
const uiBasketballPower = () => (
  <UiEntity
    //top level root ui div
    uiTransform={{
      width: "20%",
      height: "30%",

      // { top: 4, bottom: 4, left: 4, right: 4 },
      padding: 4,
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
          minHeight:'100',
          alignItems: 'center',
          alignSelf: 'center',
          positionType: 'absolute',
          position: { left: '-50%', top: '50%' },
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
        >    


        </UiEntity>
        
        
        <UiEntity
          //powerbar scaling bar part
          uiTransform={{
            width: strengthValue ,
            height: '100%' ,
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
              color:  strengthAlpha
          }}
        >
          

        </UiEntity>
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
          fontSize={20}
          uiTransform={{ width: '100%', height: '100%', positionType: 'absolute', position: {top: '0%', left: '-5%'}}}
          uiBackground={{textureMode: 'center',
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

const uiComponent = () => [
  NpcUtilsUi(),
  uiBeamMeUp(),
  customNpcUI(),
  uiBasketballPower(),
  uiBasketballScore(),
  uiOutOfBounds(),
  uiEventDettails(),
  //uiSpawnCube()
  render(),
]

setupUi()

export function setupUi() {
  ReactEcsRenderer.setUiRenderer(uiComponent)
}

export function displayEventUI(event:any) {
  eventDetailVisible = 'flex'  
  
  let rawTitle: string = event.name  
  rawTitle = cleanString(rawTitle)
  rawTitle = wordWrap(rawTitle, 36, 2)

  eventTitleText = rawTitle

  eventDetailText =  '\n\n' + wordWrap(cleanString(event.description),68, 18) + '</cspace>'

  eventThumbnail = event.image

  eventAnimFactor = 0
  factor =0
  eventAnimatedY = (-100 + eventAnimFactor * 100 + '%') as PositionUnit

  

}
export function hideEventUI(){
  eventDetailVisible = 'none'  
  eventAnimFactor = 0
  factor =0
  eventAnimatedY = (-100 + eventAnimFactor * 100 + '%') as PositionUnit
  eventAnimatedY = (eventAnimFactor + '%') as PositionUnit
}

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
export function showOOB(text:string) {
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
  strengthValue = ((0.0+ value) * 100 + '%') as PositionUnit
  shake = value * 20 
  strengthAlpha  = Color4.fromInts(value *255, 255 - value * 200,20 , 200 + value *55)
}

let elapsedTime = 0

// UI SHAKE FOR OUT OF BOUNDS POPUP
engine.addSystem((dt: number) => { 

  if(elapsedTime < 0.4){
    elapsedTime +=dt
    let shakeSize = originalPos + Math.random() * 30*dt * (0.4-elapsedTime)
    shakePos = shakeSize + "%" as PositionUnit
  }
  else{
    shakePos = '50%'
  }
  
  //console.log("SHAKE: " + shakePos )
})

let factor = 0

engine.addSystem((dt: number) => {
  let scoreXNum = 0
  let animTime = 3

  // hide event card ui if player is furhter from the slider menu
  if(Transform.get(engine.PlayerEntity).position.z > 40){

    if(factor  < 1){
      factor += dt *4
      if(factor > 1 ){
        factor = 1      
      }
      
      eventAnimFactor = utils.interpolate(utils.InterpolationType.EASEOUTQUAD, factor)
      // eventAnimFactor += dt*5
  
      
  
      eventAnimatedY = (-100 + eventAnimFactor * 100 + '%') as PositionUnit
      
    }
    else{
      eventAnimatedY = (0 + '%') as PositionUnit
    }
    
  }
  else{
    hideEventUI()
  }
  

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

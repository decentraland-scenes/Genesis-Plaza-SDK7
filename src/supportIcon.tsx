import {
    engine,
    Transform,
  } from '@dcl/sdk/ecs'
  import { Color4 } from '@dcl/sdk/math'
  import ReactEcs, { Button, DisplayType, Label, ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
  import { Cube } from './components'
  import { createCube } from './factory'


const destinationUrl = "https://intercom.decentraland.org/"
const promptDescription = 'Having trouble with your experience?'
const promptButtonText = 'Get Support'
let promptVisibility: DisplayType = "none"
let isPromptVisible = false

const iconPath = 'images/ui/support_icon.png'
const iconPositionTop = 10
const iconPositionRight = 110
const width = 34
const height = 34



export function CreateSupportIcon(){
    return(
        <Button
          uiTransform={{ 
            width: 36,
            height: 36, 
            position: `${iconPositionTop} ${iconPositionRight}` 
        }}
          uiBackground={{ texture: {src: iconPath} }}
          value=''
          onMouseDown={() => {
            if(isPromptVisible){
                promptVisibility = "none"
                isPromptVisible = false
            }else{
                promptVisibility = "flex"
                isPromptVisible = true
            }
          }}
        />
    )
}

export function CreateSupportPromt(){
    return(
        <UiEntity
            uiTransform={{
                display: promptVisibility,
                width: 100,
                height: 100, 
                position: `${100} ${100}`
                
            }}
            uiBackground={{ texture: {src: iconPath} }}
        ></UiEntity>

    )
}
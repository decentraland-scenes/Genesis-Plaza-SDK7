import {
    engine,
    Transform,
} from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Button, DisplayType, Label, ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
import { Cube } from './components'
import { createCube } from './factory'

const iconPath = 'images/ui/support_icon.png'
const iconPositionTop = 10
const iconPositionRight = 110
const width = 34
const height = 34

let promptVisibility: DisplayType = "flex"
let isPromptVisible = false
const promptPath = 'images/ui/textPanel.png'
const destinationUrl = "https://intercom.decentraland.org/"
const promptDescriptionValue = 'Having trouble \nwith your experience?'
const promptWidth = 280
const promptHeight = 150
const promptPositionTop = 0
const promptPositionRight = 350

const promptTextPositionTop = 8
const promptTextPositionRight = 55

const closeButtonPath = 'images/ui/closeButton.png'
const closeButtonPositionTop = 0
const closeButtonPositionRight = 180

const getSupportButtonPath = 'images/ui/buttonE.png'
const getSupportButtonValue = 'Get Support'
const getSupportButtonPositionTop = 95
const getSupportButtonPositionRight = -10






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
                justifyContent: 'center',
                width: promptWidth,
                height: promptHeight,
                alignSelf: 'center',
                position: `${promptPositionTop} ${promptPositionRight}`
                
            }}
            uiBackground={{ texture: {src: promptPath} }}
        >
            <Label
                uiTransform={{
                    position: `${promptTextPositionTop} ${promptTextPositionRight}`
                }}
                value = {promptDescriptionValue}
                color = {Color4.Black()}
                fontSize = {18}
                font = "serif"
                textAlign = 'top-center'
                
            />

            <Button
                uiTransform={{ 
                    width: 20,
                    height: 20, 
                    position: `${closeButtonPositionTop} ${closeButtonPositionRight}` 
                }}
                uiBackground={{ texture: {src: closeButtonPath} }}
                value=''
                onMouseDown={() => {
                    promptVisibility = "none"
                    isPromptVisible = false
                }}
            />

            <Button
                uiTransform={{ 
                    width: 100,
                    height: 40, 
                    position: `${getSupportButtonPositionTop} ${getSupportButtonPositionRight}` 
                }}
                uiBackground={{ texture: {src: getSupportButtonPath} }}
                value = {getSupportButtonValue}
                fontSize= {14}
                textAlign='middle-center'
                onMouseDown={() => {
                    
                }}
            />
        </UiEntity>

    )
}
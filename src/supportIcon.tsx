import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Button, DisplayType, Label, UiEntity } from '@dcl/sdk/react-ecs'
import { _openExternalURL } from './back-ports/backPorts'

const iconPath = 'images/ui/support_icon.png'
const iconPositionTop = 10
const iconPositionRight = 110
const iconWidth = 36
const iconHeight = 36

let promptVisibility: DisplayType = "none"
let isPromptVisible = false
const promptPath = 'images/ui/promptBase.png'
const destinationUrl = "https://intercom.decentraland.org/"
const promptDescriptionValue = 'Having trouble \nwith your experience?'
const promptWidth = 280
const promptHeight = 150
const promptPositionTop = 0
const promptPositionRight = 350

const promptTextPositionTop = 20
const promptTextPositionRight = 55

const closeButtonPath = 'images/ui/closeButton2.png'
const closeButtonPositionTop = 10
const closeButtonPositionRight = 170

const supportButtonPath = 'images/ui/promptButton.png'
const supportButtonValue = 'Get Support'
const supportButtonHeight = 40
const supportNuttonWidth = 100
const supportButtonPositionTop = 95
const supportButtonPositionRight = -10






export function CreateSupportIcon(){
    return(
        <UiEntity
        
              uiTransform={{ 
                padding: 15,
                margin: 15
                
            }}
        >
            
            <Button
              uiTransform={{ 
                width: iconWidth,
                height: iconHeight, 
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
        </UiEntity>
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
                    width: supportNuttonWidth,
                    height: supportButtonHeight, 
                    position: `${supportButtonPositionTop} ${supportButtonPositionRight}` 
                }}
                uiBackground={{ texture: {src: supportButtonPath} }}
                value = {supportButtonValue}
                fontSize= {14}
                textAlign='middle-center'
                onMouseDown={() => {
                    
                    _openExternalURL(destinationUrl)
                }}
            />
        </UiEntity>
    )
}
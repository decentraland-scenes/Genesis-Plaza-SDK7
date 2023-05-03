import {
    engine,
    Transform,
  } from '@dcl/sdk/ecs'
  import { Color4 } from '@dcl/sdk/math'
  import ReactEcs, { Button, Label, ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
  import { Cube } from './components'
  import { createCube } from './factory'


const iconPath = 'images/ui/support_icon.png'
const destinationUrl = "https://intercom.decentraland.org/"
const promptDescription = 'Having trouble with your experience?'
const promptButtonText = 'Get Support'
const hAllign = "left"
const vAllign = "top"
const positionX = 163
const positionY = 25
const width = 34
const height = 34



export function CreateSupportIcon(){
    return(
        <UiEntity
            uiTransform={{
                width: 100,
                height: 100, 
                
            }}
            uiBackground={{ texture: {src: iconPath} }}
        />
    )
}
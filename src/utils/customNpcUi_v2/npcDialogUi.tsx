import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Button, Label, ReactEcsRenderer, UiEntity, Position,UiBackgroundProps } from '@dcl/sdk/react-ecs'
import { getImageAtlasMapping } from 'dcl-npc-toolkit/dist/dialog'
import { REGISTRY } from '../../registry'
import { wrapText } from './uiHelper'
import { getData } from 'dcl-npc-toolkit'
import { NPCData } from 'dcl-npc-toolkit/dist/types'


let showDialogUi: boolean = false
let dialogNpcText = '...'
let npcPortraitSrc: string = ''
let npcPortraitWidth: number = 250
let npcPortraitHeight: number = 250
let npcPortraitBottomPos: number = 0

let modalScale = 1
let modalFontSizeScale = 1
let modalTextWrapScale = 1

export function setupNpcDialogUiScaling(inScale: number, inFontSize: number, inTextWrapScale: number) {
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

export function displayDialogNpcUi(value: boolean){
    if(value){
        if(REGISTRY.activeNPC){
            let npcPortrait = (getData(REGISTRY.activeNPC.entity) as NPCData)
            
            if (npcPortrait.portrait) {
            if (typeof npcPortrait.portrait === 'string') {
                npcPortraitSrc = npcPortrait.portrait
            } else {
                npcPortraitSrc = npcPortrait.portrait.path
                npcPortraitWidth = npcPortrait.portrait.width
                npcPortraitHeight = npcPortrait.portrait.height
                npcPortraitBottomPos = npcPortrait.portrait.offsetY
            }
            }
        }
    }
    else{
        npcPortraitSrc = ''
    }

    showDialogUi = value
}

export function setDialogNpcText(value: string){
    //TODO: add line breaker
    dialogNpcText = wrapText(`<b>${value}</b>`, 50)
}

export const uiDialogNpc = () => (
    <UiEntity key = {"dialog_npc"} //parent
        uiTransform = {{
            width: '100%',
            height: '100%',
            display: showDialogUi ? 'flex' : 'none',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems:'center',
            positionType: 'absolute',
            position: {bottom: 50}
        }}
        uiBackground={{
            color: Color4.create(0.5, 0.5, 0.5, 0)
        }}
        >
        <UiEntity // background
            uiTransform={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems:'center',
                width: 656 * modalScale,
                height: (256 - 80) * modalScale,
                positionType: 'absolute'
            }}
            uiBackground = {{
                textureMode: 'stretch',
                texture: { src: 'images/customNpcUi/OrangeAtlas1024.png' },
                uvs: getImageAtlasMapping({
                    atlasHeight:1024,
                    atlasWidth:1024,
                    sourceTop:80,
                    sourceLeft:0,
                    sourceWidth:656,
                    sourceHeight:256 - 80
                })
            }}
        >
            
            <UiEntity // portrait
                uiTransform={{
                    display: (npcPortraitSrc && npcPortraitSrc !== '') ? 'flex':'none',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems:'center',
                    width: npcPortraitWidth * modalScale,
                    height: npcPortraitHeight * modalScale,
                    positionType: 'absolute',
                    position: {left: -150 * modalScale, bottom: npcPortraitBottomPos * modalScale}
                }}
                uiBackground = {{
                    textureMode: 'stretch',
                    texture: { src: npcPortraitSrc },
                }}
            ></UiEntity>

            <UiEntity // arrow down button
                uiTransform={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: (944 - 912) * modalScale,
                    height: (46 - 0) * modalScale,
                    positionType: 'absolute',
                    position: {bottom: 15 * modalScale, right: 15 * modalScale}
                }}
                uiBackground = {{
                    textureMode: 'stretch',
                    texture: { src: 'images/customNpcUi/OrangeAtlas1024.png' },
                    uvs: getImageAtlasMapping({
                        atlasHeight:1024,
                        atlasWidth:1024,
                        sourceTop:0,
                        sourceLeft:912,
                        sourceWidth:944 - 912,
                        sourceHeight:46 - 0
                    })
                }}
            ></UiEntity>

            <UiEntity // npc name background
                uiTransform={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: (864 - 816) * modalScale,
                    height: (46 - 0) * modalScale,
                    positionType: 'absolute',
                    position: {bottom: -10 * modalScale}
                }}
                uiBackground = {{
                    textureMode: 'stretch',
                    texture: { src: 'images/customNpcUi/OrangeAtlas1024.png' },
                    uvs: getImageAtlasMapping({
                        atlasHeight:1024,
                        atlasWidth:1024,
                        sourceTop:0,
                        sourceLeft:816,
                        sourceWidth:864 - 816,
                        sourceHeight:46 - 0
                    })
                }}
            ></UiEntity>
            
            <UiEntity // npc name text
                uiTransform={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: (832 - 576) * modalScale,
                    height: (80 - 48) * modalScale,
                    positionType: 'absolute',
                    position: {top: -17 * modalScale}
                }}
                uiBackground = {{
                    textureMode: 'stretch',
                    texture: { src: 'images/customNpcUi/OrangeAtlas1024.png' },
                    uvs: getImageAtlasMapping({
                        atlasHeight:1024,
                        atlasWidth:1024,
                        sourceTop:48,
                        sourceLeft:576,
                        sourceWidth:832 - 576,
                        sourceHeight:80 - 48
                    })
                }}
                uiText={{
                    value: `<b>${REGISTRY.activeNPC ? REGISTRY.activeNPC.config.id : ''}</b>`,
                    fontSize: 16 * modalScale
                }}
            ></UiEntity>

            <UiEntity // dialog text
                uiTransform={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: 480 * modalScale,
                    height: 96 * modalScale,
                    positionType: 'absolute'
                }}
                // uiBackground = {{
                //     color: Color4.create(0, 1, 0, 0.2)
                // }}
                uiText={{
                    value: dialogNpcText,
                    fontSize: 18 * modalScale,
                    font: 'monospace',
                    color: Color4.create(0.2, 0.2, 0.2, 1)
                }}
            ></UiEntity>

        </UiEntity>

    </UiEntity>
)

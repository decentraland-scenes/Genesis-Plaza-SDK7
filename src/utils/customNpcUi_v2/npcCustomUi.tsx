import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { UiEntity, Label, Button, Input } from '@dcl/sdk/react-ecs'
import { AtlasTheme, getImageMapping, sourcesComponentsCoordinates } from '../customNpcUi/uiResources'
import { NpcQuestionData, sendQuestion } from '../customNpcUi/customUIFunctionality'
import { REGISTRY } from '../../registry'
import { getData, handleWalkAway } from 'dcl-npc-toolkit'
import { NPCData, NPCState } from 'dcl-npc-toolkit/dist/types'
import { TrackingElement, trackAction } from '../../modules/stats/analyticsComponents'
import { engine } from '@dcl/sdk/ecs'
import { getImageAtlasMapping } from 'dcl-npc-toolkit/dist/dialog'
import { wrapText } from './uiHelper'
import * as npcLib from 'dcl-npc-toolkit'
import { endInteraction } from '../../modules/RemoteNpcs/remoteNpc'
import { resetMessages, streamedMsgs } from '../../modules/RemoteNpcs/streamedMsgs'
import { streamedMsgsUiControl } from '../../modules/RemoteNpcs/streamedMsgsUIcontrol'

let selectedPredefinedQuestion: NpcQuestionData[] = []

let isVisible: boolean = false
let disclaimerVisible: boolean = false

let typedQuestion: string = ''
const placeHolderText: string = 'Type your question HERE then hit Enter...'

let npcPortraitSrc: string = ''
let npcPortraitWidth: number = 250
let npcPortraitHeight: number = 250
let npcPortraitBottomPos: number = 0
// let selectedTheme: string = AtlasTheme.ATLAS_PATH_DARK
let customUiOrangeTheme: string = 'images/customNpcUi/OrangeAtlas1024.png'

let aIndex = 0
let bIndex = 1

// const modalWidth = 850
// const modalHeight = 260
// const moreOptionButtonHeight = 40
// const inputTextWidth = modalWidth - 300

let modalScale = 1
let modalFontSizeScale = 1
let modalTextWrapScale = 1

export function setupNpcCustomQuestionUiScaling(inScale: number, inFontSize: number, inTextWrapScale: number) {
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


export const uiCustomAskNpc = () => {
    return (
        <UiEntity //Invisible Parent
            uiTransform={{
                width: '100%',
                height: '100%',
                display: isVisible ? 'flex' : 'none',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems:'center',
                positionType: 'absolute',
                position: {bottom: 50 * modalScale}
            }}
            uiBackground={{
                // color: Color4.create(0.5, 0.5, 0.5, 0)
            }}
            >
            <UiEntity //Dialog Holder
                uiTransform={{
                    width: 752 * modalScale,
                    height: (496 - 256) * modalScale,
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    display: 'flex',
                    // flexWrap: 'wrap',
                    flexDirection: 'column'
                }}
                uiBackground={{
                    textureMode: 'stretch',
                    texture: { src: 'images/customNpcUi/OrangeAtlas1024.png' },
                    uvs: getImageAtlasMapping({
                        atlasHeight:1024,
                        atlasWidth:1024,
                        sourceTop:256,
                        sourceLeft:0,
                        sourceWidth:752,
                        sourceHeight:496 - 256
                    })
                }}
                >

                <UiEntity //TOP
                    uiTransform={{
                        width: 752 * modalScale,
                        height: 70 * modalScale,
                        // margin: { bottom: 0 },
                        justifyContent: 'center'
                    }}
                    uiBackground={{
                        // color: Color4.create(0, 0.5, 0, 0.3)
                    }}
                    >
                    <Label 
                        value="<b>Ask Me Anything!</b>" 
                        fontSize={24 * modalScale}
                        font='monospace'
                        color={Color4.create(0.4, 0.4, 0.4, 1)}
                    />

                    <UiEntity // close button
                        uiTransform={{
                            positionType: 'absolute',
                            position: { top: -10 * modalScale, right: -10 * modalScale },
                            width: 46 * modalScale,
                            height: 46 * modalScale
                        }}
                        onMouseDown={() => {
                            closeAskNpcAiUi(true)
                        }}
                        uiBackground={{
                            textureMode: 'stretch',
                            texture: { src: 'images/customNpcUi/OrangeAtlas1024.png' },
                            uvs: getImageAtlasMapping({
                                atlasHeight:1024,
                                atlasWidth:1024,
                                sourceTop:0,
                                sourceLeft:768,
                                sourceWidth:816 - 768,
                                sourceHeight:46 - 0
                            })
                        }}
                    ></UiEntity>
                </UiEntity>
            
                <UiEntity // Input text box
                    uiTransform={{ 
                        height: 80 * modalScale, 
                        width: '100%', 
                        justifyContent: 'center',
                    }}
                    uiBackground={{
                        // color: Color4.create(0.5, 0, 0, 0.3)
                    }}
                    >
                    <Input
                        uiTransform={{ 
                            width: 576 * modalScale, 
                            height: 80 * modalScale 
                        }}

                        uiBackground={{
                            color: Color4.create(244/255, 174/255, 62/255, 1)
                        }}
                        fontSize={20 * modalScale}
                        placeholder={placeHolderText}
                        color={Color4.White()}
                        placeholderColor={Color4.White()}
                        onChange={(x) => {
                            onEdit(x)
                        }}
                        onSubmit={() => {
                            sendTypeQuestion()
                        }}
                    />

                </UiEntity>

                <UiEntity //Options' Buttons
                    uiTransform={{
                        width: 550 * modalScale,
                        height: 80 * modalScale,
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        alignContent: 'stretch',
                    }}
                    uiBackground={{
                        // color: Color4.create(0, 0, 0.5, 0.3)
                    }}
                >
                    <Button
                        value={selectedPredefinedQuestion?.length >= 2 ? selectedPredefinedQuestion[aIndex].displayText : 'option1'}
                        uiTransform={{
                            display: selectedPredefinedQuestion?.length > 0 ? 'flex' : 'none',
                            width: (832 - 656) * modalScale,
                            height: (176 - 128) * modalScale
                        }}
                        uiBackground={{
                            texture: { src: customUiOrangeTheme },
                            color: Color4.White(),
                            textureMode: 'stretch',
                            uvs: getImageAtlasMapping({
                                atlasHeight:1024,
                                atlasWidth:1024,
                                sourceTop:126,
                                sourceLeft:656,
                                sourceWidth:832 - 656,
                                sourceHeight:176 - 128
                            })
                        }}
                        fontSize={15 * modalScale}
                        onMouseDown={() => {
                            askQuestion(aIndex)
                        }}
                    ></Button>

                    <Button
                        value={
                            selectedPredefinedQuestion?.length >= 2 && bIndex < selectedPredefinedQuestion?.length
                                ? selectedPredefinedQuestion[bIndex].displayText : 'option2'
                        }
                        uiTransform={{
                            display: selectedPredefinedQuestion?.length > 0 ? 'flex' : 'none',
                            width: (832 - 656) * modalScale,
                            height: (176 - 128) * modalScale
                        }}
                        uiBackground={{
                            texture: { src: customUiOrangeTheme },
                            color: Color4.White(),
                            textureMode: 'stretch',
                            uvs: getImageAtlasMapping({
                                atlasHeight:1024,
                                atlasWidth:1024,
                                sourceTop:126,
                                sourceLeft:656,
                                sourceWidth:832 - 656,
                                sourceHeight:176 - 128
                            })
                        }}
                        fontSize={15 * modalScale}
                        onMouseDown={() => {
                            askQuestion(bIndex)
                        }}
                    ></Button>

                    <Button
                        value="More Options"
                        uiTransform={{
                            display: selectedPredefinedQuestion?.length > 0 ? 'flex' : 'none',
                            width: (832 - 656) * modalScale,
                            height: (176 - 128) * modalScale
                        }}
                        uiBackground={{
                            texture: { src: customUiOrangeTheme },
                            color: Color4.White(),
                            textureMode: 'stretch',
                            uvs: getImageAtlasMapping({
                                atlasHeight:1024,
                                atlasWidth:1024,
                                sourceTop:126,
                                sourceLeft:656,
                                sourceWidth:832 - 656,
                                sourceHeight:176 - 128
                            })
                        }}
                        fontSize={15 * modalScale}
                        onMouseDown={() => {
                            nextQuestion()
                        }}
                    ></Button>
                </UiEntity>

                <UiEntity // portrait
                uiTransform={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems:'center',
                    width: npcPortraitWidth * modalScale,
                    height: npcPortraitHeight * modalScale,
                    positionType: 'absolute',
                    position: {left: -165 * modalScale, bottom: npcPortraitBottomPos * modalScale}
                }}
                uiBackground = {{
                    textureMode: 'stretch',
                    texture: { src: npcPortraitSrc },
                }}
                ></UiEntity>
                
                <UiEntity // Info button
                uiTransform={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems:'center',
                    width: (1024 - 992) * modalScale,
                    height: (112 - 81) * modalScale,
                    positionType: 'absolute',
                    position: {bottom: 17 * modalScale, right: 12 * modalScale}
                }}
                uiBackground = {{
                    textureMode: 'stretch',
                    texture: { src: 'images/customNpcUi/OrangeAtlas1024.png' },
                    uvs: getImageAtlasMapping({
                        atlasHeight:1024,
                        atlasWidth:1024,
                        sourceTop:81,
                        sourceLeft:992,
                        sourceWidth:1024 - 992,
                        sourceHeight:112 - 81
                    })
                }}
                onMouseDown={() => {
                    disclaimerVisible = !disclaimerVisible
                }}
                ></UiEntity>

                <UiEntity // Disclaimer
                uiTransform={{
                    display: disclaimerVisible ? 'flex' : 'none',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems:'center',
                    width: (912 - 753) * modalScale,
                    height: (464 - 320) * modalScale,
                    positionType: 'absolute',
                    position: {bottom: 50 * modalScale, right: -50 * modalScale}
                }}
                uiBackground = {{
                    textureMode: 'stretch',
                    texture: { src: 'images/customNpcUi/OrangeAtlas1024.png' },
                    uvs: getImageAtlasMapping({
                        atlasHeight:1024,
                        atlasWidth:1024,
                        sourceHeight: 464 - 320,
                        sourceWidth: 912 - 753,
                        sourceLeft: 753,
                        sourceTop: 320
                    })
                }}
                >
                    <UiEntity // Info button
                    uiTransform={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems:'center',
                        width: '90%',
                        height: '80%',
                        positionType: 'absolute',
                        position: {bottom: 20 * modalScale}
                    }}
                    uiBackground = {{
                        color: Color4.create(1, 0, 0, 0)
                    }}
                    uiText={{
                        value: wrapText("Disclaimer: Beta. Power by a 3rd party AI. \nYou may receive inaccurate information which is not endorsed by the Foundation or the Decentraland community. \nDo not share personal information.", 30),
                        fontSize: 10 * modalScale
                    }}
                    ></UiEntity>

                </UiEntity>
            </UiEntity>

        </UiEntity>
    )
}


function setVisibility(status: boolean): void {
  isVisible = status

//   if(status) activateUiScalingSystem(true)
//   else activateUiScalingSystem(false)
}

export function openAskNpcAiUi() {
  let questions = REGISTRY.activeNPC.predefinedQuestions
  selectedPredefinedQuestion = questions
  console.log('QUESTIONS', questions, selectedPredefinedQuestion)

  resetMessages(streamedMsgs)
  streamedMsgsUiControl.reset()

  let npcPortrait = (getData(REGISTRY.activeNPC.entity) as NPCData).portrait
  if (npcPortrait) {
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

//   console.log('QUESTIONS', 'NPC Portrait', getData(REGISTRY.activeNPC.entity) as NPCData, portraitPath)

  aIndex = 0
  bIndex = 1
  
  setVisibility(true)
}

export function closeAskNpcAiUi(triggerWalkAway: boolean) {
  if (isVisible === false) return
  setVisibility(false)
  disclaimerVisible = false
  if (!triggerWalkAway) return
  if (REGISTRY.activeNPC) {
    console.log('DebugSession', 'CLOSEUI => walked away', REGISTRY.activeNPC.name)
    endInteraction(REGISTRY.activeNPC)
    handleWalkAway(REGISTRY.activeNPC.entity, REGISTRY.activeNPC.entity)
    // let npcData = getData(REGISTRY.activeNPC.entity)as NPCData
    // npcData.onWalkAway(engine.PlayerEntity)
  }
}

function nextQuestion() {
  aIndex += 2
  bIndex += 2
  if (aIndex >= selectedPredefinedQuestion.length) {
    aIndex = 0
    if (bIndex >= selectedPredefinedQuestion.length) {
      bIndex = 1
    }
  }
}

function askQuestion(index: number) {
  if (index >= selectedPredefinedQuestion.length) {
    console.error('Index is out of bounds for predefined questions')
    return
  }
  console.log('QUESTIONS', 'Asked Question:', selectedPredefinedQuestion[index])
  trackAction(REGISTRY.activeNPC.entity, 'preDefinedQuestion', selectedPredefinedQuestion[index].displayText)
  sendQuestion(selectedPredefinedQuestion[index])
}

function onEdit(param: string) {
  // console.log('QUESTIONS', 'onEdit', param)
  typedQuestion = param
}

function sendTypeQuestion() {
  if (!typedQuestion) {
    console.error('QUESTIONS', "Typed Question can't be undefined")
    return
  }
  if (typedQuestion === placeHolderText) {
    console.error('QUESTIONS', "value can't match place holder, skipping")
    return
  }
  if (typedQuestion.trim().length <= 0) {
    console.error('QUESTIONS', "Typed Question can't be Whitespaces/Empty")
    return
  }
  console.log('QUESTIONS', 'Asked Question:', typedQuestion)
  trackAction(REGISTRY.activeNPC.entity, 'userDefinedQuestion', typedQuestion)
  sendQuestion(typedQuestion)
}

// export function resetInputField() {}



// // for quicker debug editing
// export const genericPrefinedQuestions: NpcQuestionData[] = [
//   { displayText: "Sing me a song!", aiQuery: "Sing me a song!" },
//   { displayText: "Recite me a poem!", aiQuery: "Recite me a poem!" },
//   { displayText: "Tell me a joke!", aiQuery: "Tell me a joke!" },
//   { displayText: "Your Favorite music?", aiQuery: "What is your favorite music?" },
//   { displayText: "Do you have any pets?", aiQuery: "Do you have any pets?" },
//   { displayText: "What can I do here?", aiQuery: "What can I do here?" },
//   { displayText: "What is a wearable!", aiQuery: "What is a wearable!" },
//   { displayText: "What is an emote!", aiQuery: "What is an emote!" }
// ]

// selectedPredefinedQuestion = genericPrefinedQuestions 


// setVisibility(true)

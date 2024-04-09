import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { UiEntity, Label, Button, Input } from '@dcl/sdk/react-ecs'
import { AtlasTheme, getImageMapping, sourcesComponentsCoordinates } from './uiResources'
import { NpcQuestionData, sendQuestion } from './customUIFunctionality'
import { REGISTRY } from '../../registry'
import { getData, handleWalkAway } from 'dcl-npc-toolkit'
import { NPCData } from 'dcl-npc-toolkit/dist/types'
import { TrackingElement, trackAction } from '../../modules/stats/analyticsComponents'

let selectedPredefinedQuestion: NpcQuestionData[] = []

let isVisible: boolean = false

let typedQuestion: string = ''
const placeHolderText: string = 'Type your question here then click Send...'

let portraitPath: string = ''
let selectedTheme: string = AtlasTheme.ATLAS_PATH_DARK

let aIndex = 0
let bIndex = 1

const modalWidth = 850
const modalHeight = 260
const moreOptionButtonHeight = 40
const inputTextWidth = modalWidth - 300

let modalScale = 1
let modalFontSizeScale = 1
let modalTextWrapScale = 1

export function setupCustomNPCUiScaling(inScale: number, inFontSize: number, inTextWrapScale: number) {
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

export const customNpcUI = () => {
  return (
    <UiEntity //Invisible Parent
      uiTransform={{
        positionType: 'absolute',
        width: getScaledSize(modalWidth),
        height: getScaledSize(modalHeight),
        position: { bottom: '10%', left: '50%' },
        margin: { left: -getScaledSize(modalWidth) / 2 },
        display: isVisible ? 'flex' : 'none'
      }}
    >
      <UiEntity //Dialog Holder
        uiTransform={{
          width: '100%',
          height: '100%',
          justifyContent: 'space-around',
          alignItems: 'stretch',
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: 'row'
        }}
        uiBackground={{
          texture: { src: selectedTheme },
          uvs: getImageMapping({
            ...sourcesComponentsCoordinates.backgrounds['NPCDialog']
          }),
          textureMode: 'stretch'
        }}
      >
        <UiEntity //TOP
          uiTransform={{
            width: '100%',
            height: getScaledSize(60),
            margin: { bottom: getScaledSize(2) },
            justifyContent: 'center'
          }}
        >
          <Label value="<b>Ask Me Anything!</b>" fontSize={getScaledFontSize(30)}></Label>
          <Button
            value=""
            fontSize={getScaledFontSize(38)}
            uiTransform={{
              positionType: 'absolute',
              position: { top: getScaledSize(10), right: getScaledSize(20) },
              width: getScaledSize(45),
              height: getScaledSize(45)
            }}
            onMouseDown={() => {
              closeCustomUI(true)
            }}
            uiBackground={{
              color: Color4.White(),
              texture: { src: selectedTheme },
              textureMode: 'stretch',
              uvs: getImageMapping({ ...sourcesComponentsCoordinates.icons.closeWLarge })
            }}
          ></Button>
        </UiEntity>
        <UiEntity //Input
          uiTransform={{ height: getScaledSize(50), width: '100%', justifyContent: 'flex-start' }}
        >
          <UiEntity
            uiTransform={{
              width: getScaledSize(inputTextWidth + 5),
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              margin: { left: getScaledSize(85) }
            }}
            uiBackground={{
              color: Color4.White()
            }}
          >
            <Input
              uiTransform={{ width: getScaledSize(inputTextWidth), height: '94%' }}
              uiBackground={{
                color: Color4.Black()
              }}
              fontSize={getScaledFontSize(20)}
              placeholder={placeHolderText}
              color={Color4.White()}
              placeholderColor={Color4.White()}
              onChange={(x) => {
                onEdit(x)
              }}
            />
          </UiEntity>
          <Button
            value="<b>Send</b>"
            uiTransform={{
              position: { right: getScaledSize(-20) },
              width: getScaledSize(120),
              height: '100%',
              alignSelf: 'center'
            }}
            uiBackground={{
              texture: {
                src: selectedTheme
              },
              color: Color4.White(),
              textureMode: 'stretch',
              uvs: getImageMapping({ ...sourcesComponentsCoordinates.buttons.dark })
            }}
            fontSize={getScaledFontSize(22)}
            onMouseDown={() => {
              sendTypeQuestion()
            }}
          ></Button>
        </UiEntity>
        <UiEntity //Options' Buttons
          uiTransform={{
            width: '100%',
            height: getScaledSize(60),
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-around',

            alignContent: 'space-between',
            padding: { left: getScaledSize(80), right: getScaledSize(80), top: getScaledSize(10) }
          }}
        >
          <Button
            value={selectedPredefinedQuestion?.length >= 2 ? selectedPredefinedQuestion[aIndex].displayText : 'option1'}
            uiTransform={{
              display: selectedPredefinedQuestion?.length > 0 ? 'flex' : 'none',
              width: '32%',
              height: getScaledSize(moreOptionButtonHeight)
            }}
            uiBackground={{
              texture: {
                src: selectedTheme
              },
              color: Color4.White(),
              textureMode: 'stretch',
              uvs: getImageMapping({ ...sourcesComponentsCoordinates.buttons.dark })
            }}
            fontSize={getScaledFontSize(20)}
            onMouseDown={() => {
              askQuestion(aIndex)
            }}
          ></Button>
          <Button
            value={
              selectedPredefinedQuestion?.length >= 2 && bIndex < selectedPredefinedQuestion?.length
                ? selectedPredefinedQuestion[bIndex].displayText
                : 'option2'
            }
            uiTransform={{
              display: bIndex >= selectedPredefinedQuestion?.length ? 'none' : 'flex',
              width: '32%',
              height: getScaledSize(moreOptionButtonHeight)
            }}
            uiBackground={{
              texture: {
                src: selectedTheme
              },
              color: Color4.White(),
              textureMode: 'stretch',
              uvs: getImageMapping({ ...sourcesComponentsCoordinates.buttons.dark })
            }}
            fontSize={getScaledFontSize(20)}
            onMouseDown={() => {
              askQuestion(bIndex)
            }}
          ></Button>
          <Button
            value="More Options"
            uiTransform={{
              display: selectedPredefinedQuestion?.length > 0 ? 'flex' : 'none',
              width: '32%',
              height: getScaledSize(moreOptionButtonHeight)
            }}
            uiBackground={{
              texture: {
                src: selectedTheme
              },
              color: Color4.White(),
              textureMode: 'stretch',
              uvs: getImageMapping({ ...sourcesComponentsCoordinates.buttons.dark })
            }}
            fontSize={getScaledFontSize(20)}
            onMouseDown={() => {
              nextQuestion()
            }}
          ></Button>
        </UiEntity>
        <UiEntity //Footer
          uiTransform={{ width: '100%', height: getScaledSize(70), justifyContent: 'center' }}
        >
          <Label
            value="<b>Disclaimer: Beta. Power by a 3rd party AI. You may receive inaccurate information which is not \nendorsed by the Foundation or the Decentraland community.  Do not share personal information.</b>"
            fontSize={getScaledFontSize(13)}
          ></Label>
        </UiEntity>
      </UiEntity>

      <UiEntity // NPC Portrait
        uiTransform={{
          display: portraitPath !== '' ? 'flex' : 'none',
          positionType: 'absolute',
          position: { left: getScaledSize(-160) },
          width: getScaledSize(250),
          height: getScaledSize(250)
        }}
        uiBackground={{
          texture: { src: portraitPath },
          textureMode: 'stretch'
        }}
      ></UiEntity>
    </UiEntity>
  )
}

function setVisibility(status: boolean): void {
  isVisible = status
}

export function openCustomUI() {
  let questions = REGISTRY.activeNPC.predefinedQuestions
  setVisibility(true)
  selectedPredefinedQuestion = questions
  console.log('QUESTIONS', questions, selectedPredefinedQuestion)

  let npcPortrait = (getData(REGISTRY.activeNPC.entity) as NPCData).portrait
  if (npcPortrait) {
    if (typeof npcPortrait === 'string') {
      portraitPath = npcPortrait
    } else {
      portraitPath = npcPortrait.path
    }
  }

  console.log('QUESTIONS', 'NPC Portrait', getData(REGISTRY.activeNPC.entity) as NPCData, portraitPath)

  aIndex = 0
  bIndex = 1
}

export function closeCustomUI(triggerWalkAway: boolean) {
  if (isVisible === false) return
  setVisibility(false)
  if (!triggerWalkAway) return
  if (REGISTRY.activeNPC) {
    console.log('DebugSession', 'CLOSEUI => walked away')
    //handleWalkAway(REGISTRY.activeNPC.entity)
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

export function resetInputField() {}

/*
//for quicker debug editing
export const genericPrefinedQuestions: NpcQuestionData[] = [
  { displayText: "Sing me a song!", aiQuery: "Sing me a song!" },
  { displayText: "Recite me a poem!", aiQuery: "Recite me a poem!" },
  { displayText: "Tell me a joke!", aiQuery: "Tell me a joke!" },
  { displayText: "Your Favorite music?", aiQuery: "What is your favorite music?" },
  { displayText: "Do you have any pets?", aiQuery: "Do you have any pets?" },
  { displayText: "What can I do here?", aiQuery: "What can I do here?" },
  { displayText: "What is a wearable!", aiQuery: "What is a wearable!" },
  { displayText: "What is an emote!", aiQuery: "What is an emote!" }
]

selectedPredefinedQuestion = genericPrefinedQuestions 


setVisibility(true)
*/

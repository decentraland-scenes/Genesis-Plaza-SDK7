import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { UiEntity, Label, Button, Input } from '@dcl/sdk/react-ecs'
import { AtlasTheme, getImageMapping, sourcesComponentsCoordinates } from './uiResources'
import { NpcQuestionData, sendQuestion } from './customUIFunctionality'
import { REGISTRY } from '../../registry'
import { getData, handleWalkAway } from 'dcl-npc-toolkit'
import { NPCData } from 'dcl-npc-toolkit/dist/types'

let selectedPredefinedQuestion: NpcQuestionData[] = []

let isVisible: boolean = false

let typedQuestion: string = ''
const placeHolderText: string = 'Type your question here then hit enter...'

let portraitPath: string = ''

let aIndex = 0
let bIndex = 1

export const customNpcUI = () => {
  return (
    <UiEntity //Invisible Parent
      uiTransform={{
        positionType: 'absolute',
        width: 926,
        height: 300,
        position: { bottom: '3%', left: '32%' },
        display: isVisible ? 'flex' : 'none'
      }}
    >
      <UiEntity //Dialog Holder
        uiTransform={{
          width: '100%',
          height: '100%',
          positionType: 'absolute',
          justifyContent: 'space-around',
          alignItems: 'stretch',
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: 'row'
        }}
        uiBackground={{
          texture: { src: AtlasTheme.ATLAS_PATH_DARK },
          uvs: getImageMapping({
            ...sourcesComponentsCoordinates.backgrounds['NPCDialog']
          }),
          textureMode: 'stretch'
        }}
      >
        <UiEntity //TOP
          uiTransform={{ width: '100%', justifyContent: 'center' }}
        >
          <Label value="<b>Ask Me Anything!</b>" fontSize={30}></Label>
          <Button
            value=""
            fontSize={40}
            uiTransform={{
              positionType: 'absolute',
              position: { top: 15, right: 25 },
              width: 45,
              height: 45
            }}
            onMouseDown={() => {
              closeCustomUI()
            }}
            uiBackground={{
              color: Color4.White(),
              texture: { src: AtlasTheme.ATLAS_PATH_DARK },
              textureMode: 'stretch',
              uvs: getImageMapping({ ...sourcesComponentsCoordinates.icons.closeWLarge })
            }}
          ></Button>
        </UiEntity>
        <UiEntity //Input
          uiTransform={{ width: '100%', justifyContent: 'flex-start' }}
        >
          <UiEntity
            uiTransform={{
              positionType: 'absolute',
              width: '75%',
              height: 80,
              alignItems: 'center',
              justifyContent: 'center',
              margin: { left: 85 }
            }}
            uiBackground={{
              color: Color4.White()
            }}
          >
            <Input
              uiTransform={{ width: '99%', height: '92%' }}
              uiBackground={{
                color: Color4.Black()
              }}
              fontSize={20}
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
              positionType: 'absolute',
              position: { right: 20 },
              width: '120',
              height: '60',
              alignSelf: 'center'
            }}
            uiBackground={{
              texture: {
                src: AtlasTheme.ATLAS_PATH_DARK
              },
              color: Color4.White(),
              textureMode: 'stretch',
              uvs: getImageMapping({ ...sourcesComponentsCoordinates.buttons.dark })
            }}
            fontSize={22}
            onMouseDown={() => {
              sendTypeQuestion()
            }}
          ></Button>
        </UiEntity>
        <UiEntity //Options' Buttons
          uiTransform={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignContent: 'space-between',
            padding: { left: 80, right: 80, top: 10 }
          }}
        >
          <Button
            value={selectedPredefinedQuestion?.length >= 2 ? selectedPredefinedQuestion[aIndex].displayText : ''}
            uiTransform={{
              width: '32%',
              height: '85%'
            }}
            uiBackground={{
              texture: {
                src: AtlasTheme.ATLAS_PATH_DARK
              },
              color: Color4.White(),
              textureMode: 'stretch',
              uvs: getImageMapping({ ...sourcesComponentsCoordinates.buttons.dark })
            }}
            fontSize={20}
            onMouseDown={() => {
              askQuestion(aIndex)
            }}
          ></Button>
          <Button
            value={
              selectedPredefinedQuestion?.length >= 2 && bIndex < selectedPredefinedQuestion?.length
                ? selectedPredefinedQuestion[bIndex].displayText
                : ''
            }
            uiTransform={{
              display: bIndex >= selectedPredefinedQuestion?.length ? 'none' : 'flex',
              width: '32%',
              height: '85%'
            }}
            uiBackground={{
              texture: {
                src: AtlasTheme.ATLAS_PATH_DARK
              },
              color: Color4.White(),
              textureMode: 'stretch',
              uvs: getImageMapping({ ...sourcesComponentsCoordinates.buttons.dark })
            }}
            fontSize={20}
            onMouseDown={() => {
              askQuestion(bIndex)
            }}
          ></Button>
          <Button
            value="More Options"
            uiTransform={{
              width: '32%',
              height: '85%'
            }}
            uiBackground={{
              texture: {
                src: AtlasTheme.ATLAS_PATH_DARK
              },
              color: Color4.White(),
              textureMode: 'stretch',
              uvs: getImageMapping({ ...sourcesComponentsCoordinates.buttons.dark })
            }}
            fontSize={25}
            onMouseDown={() => {
              nextQuestion()
            }}
          ></Button>
        </UiEntity>
        <UiEntity //Footer
          uiTransform={{ width: '100%', justifyContent: 'center' }}
        >
          <Label
            value="<b>Disclaimer: Beta. Power by a 3rd party AI. You may receive inaccurate information which is not \nendorsed by the Foundation or the Decentraland community.  Do not share personal information.</b>"
            fontSize={13}
          ></Label>
        </UiEntity>
      </UiEntity>

      <UiEntity // NPC Portrait
        uiTransform={{
          display: portraitPath !== '' ? 'flex' : 'none',
          positionType: 'absolute',
          position: { left: -175 },
          width: 300,
          height: 300
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

export function closeCustomUI() {
  if (isVisible === false) return
  setVisibility(false)
  if (REGISTRY.activeNPC) {
    console.log('DebugSession', 'CLOSEUI => walked away')
    handleWalkAway(REGISTRY.activeNPC.entity)
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
  sendQuestion(typedQuestion)
}

export function resetInputField() {}

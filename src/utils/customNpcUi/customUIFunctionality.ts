import { REGISTRY } from "../../registry"
import { closeAllInteractions, createMessageObject, sendMsgToAI } from "../../utils/connectionUtils/connectedUtils"
import { closeCustomUI, resetInputField } from "./customUi"
import * as serverStateSpec from '../../connection/state/server-state-spec'
import { GAME_STATE } from "../../modules/RemoteNpcs/state"
import { initArena } from "../../lobby-scene/lobbyScene"

export class NpcQuestionData {
  displayText: string
  aiQuery: string
}

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

export function sendQuestion(questionData: NpcQuestionData | string) {
  const messageQuery = (typeof (questionData) === 'string') ? questionData : questionData.aiQuery
  const message = (typeof (questionData) === 'string') ? questionData : questionData.aiQuery
  console.log("QUESTIONS", "sending ", message)

  closeAllInteractions({ exclude: REGISTRY.activeNPC })

  const doSend = () => {
    const chatMessage: serverStateSpec.ChatMessage = createMessageObject(messageQuery, undefined, GAME_STATE.gameRoom)
    sendMsgToAI(chatMessage)
  }
  if (GAME_STATE.gameRoom && GAME_STATE.gameConnected === 'connected') {
    doSend()
  } else {
    REGISTRY.lobbyScene.pendingConvoActionWithNPC = doSend
    initArena(REGISTRY.lobbyScene, false)
    return
  }

  closeCustomUI(false)

  resetInputField()//TODO: missing implementation
}
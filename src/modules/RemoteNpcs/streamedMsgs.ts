import { Entity } from "@dcl/ecs";
import * as serverStateSpec from "../../connection/state/server-state-spec";
import * as serverState from "../../connection/state/server-state-spec";
import * as npc from 'dcl-npc-toolkit'

const FILE_NAME: string = "streamedMessages.ts"


export function getControlTypeAsInt(type: any): number {
  if (type === "INTERACTION_END") {
    type = serverStateSpec.ChatControlType.INTERACTION_END
  }
  if (type === "UNKNOWN") {
    type = serverStateSpec.ChatControlType.UNKNOWN
  }

  return type as number
}

export function getMessageTypeAsInt(type: string | number): number {
  const METHOD_NAME = "getMessageTypeAsInt"
  if ((type as any) === 'AUDIO') {
    return serverStateSpec.ChatPacketType.AUDIO
  }
  if ((type as any) === 'TEXT') {
    return serverStateSpec.ChatPacketType.TEXT
  }
  if ((type as any) === 'EMOTION') {
    return serverStateSpec.ChatPacketType.EMOTION
  }
  if ((type as any) === 'CONTROL') {
    return serverStateSpec.ChatPacketType.CONTROL
  }
  return type as number
}

export class ChatPart {

  read: boolean
  packet: serverStateSpec.ChatPacket
  constructor(packet: serverStateSpec.ChatPacket) {
    this.packet = packet
    //sanitize
    this.packet.type = getMessageTypeAsInt(this.packet.type)
  }

  createNPCDialog(): npc.Dialog {
    console.log("createNPCDialog.chatpart", this.packet)

    if (this.packet == undefined) {
      console.error(FILE_NAME, "createNPCDialog", "chatpart can't be null");
      return
    }
    const text = this.packet.text.text
    const dialog: npc.Dialog = {
      //name: "end-of-the-tour-day-0",
      text: text,
      isEndOfDialog: true,//this.packet.text.final,
      isQuestion: false,
      skipable: false,
      //audio: '',


    }
    return dialog
  }
}

export class ChatInteraction {
  packets: ChatPart[] = []

  chatIndex: number = 0

  audio: ChatPart[] = []
  text: ChatPart[] = []

  add(part: ChatPart) {
    this.packets.push(part)
    switch (part.packet.type) {
      case serverState.ChatPacketType.TEXT:
        this.text.push(part)
        break;
      case serverState.ChatPacketType.AUDIO:
        this.audio.push(part)
        break;
    }
  }
}
export class ChatNext {
  text: ChatPart
  audio: ChatPart
  control: ChatPart
  emotion: ChatPart
  indexStart: number
  indexEnd: number
  endOfInteraction: boolean
}

export class StreamedMessages {
  streamedMessagesMapById = new Map<string, ChatInteraction>()
  streamedMessages: ChatPart[] = []
  streamedInteractions: ChatInteraction[] = []
  loadedAudios: Map<string, Entity> = new Map<string, Entity>()

  started: boolean = false
  waitingForMore: boolean = false

  //_currInteraction:ChatInteraction
  lastUtteranceId: string

  messageIndex: number = 0
  interactionIndex: number = 0

  add(part: ChatPart) {
    add(this, part)
  }
  next() {
    return next(this)
  }
  hasNextAudioNText() {
    return hasNextAudioNText(this)
  }
  _next(incrementCounter: boolean, _startIndex?: number) {
    return _next(this, incrementCounter, _startIndex)
  }
}

export function resetMessages(message: StreamedMessages): void {
  const METHOD_NAME = "resetMessages"
  console.log(FILE_NAME, METHOD_NAME, "Entry");

  message.started = false
  message.streamedMessages = []
  message.streamedInteractions = []
  message.streamedMessagesMapById = new Map<string, ChatInteraction>()
  message.loadedAudios = new Map<string, Entity>()

  message.messageIndex = 0 
  message.interactionIndex = 0
}

export function add(message: StreamedMessages, part: ChatPart) {
  const interactionId = part.packet.packetId.interactionId
  let interaction = message.streamedMessagesMapById.get(interactionId);
  if (interaction === undefined) {
    interaction = new ChatInteraction()
    message.streamedInteractions.push(interaction)
    message.streamedMessagesMapById.set(interactionId, interaction)
  }

  message.streamedMessages.push(part)
  interaction.add(part)
}

//TODO return true when has a whole utterance group, reguardless of what it is, only emotion, etc.
//or let hasNext return whole utterance batches and caller has to decide if they want it or not
//though it wait for next utterance to know current one ended? 
function hasNext(message: StreamedMessages): boolean {
  throw new Error("implement me!!!")
  //keep track of last utterance and see if has at least once ahead of it, in which case utterance complete
  //return hasNext
}
//right now hardcoded to get audio + text, make this more flexible
//or let hasNext return whole utterance batches and caller has to decide if they want it or not
//though it wait for next utterance to know current one ended? 
function hasNextAudioNText(message: StreamedMessages, _startIndex?: number): boolean {
  const METHOD_NAME = "hasNextAudioNText"
  let next: ChatNext
  let hasNext = false
  const maxTries = 20
  let tried = 0
  let _startIndexTmp = _startIndex ? _startIndex : message.messageIndex
  //debugger
  do {
    next = _next(message, false, _startIndexTmp)
    //not perfect but better than nothing for now
    //need a way to know when stream sent me enough to work with, text is critical so using that
    hasNext = (next.text !== undefined /*&& next.audio !== undefined*/) || next.endOfInteraction
    if (!hasNext && next.indexEnd < message.streamedMessages.length - 1) {
      //try again 
      console.log(METHOD_NAME, "hit end of utterance without text/audio but has more stream", "try again", "this.messageIndex", message.messageIndex, "_startIndexTmp", _startIndexTmp, message.streamedMessages.length, next)
      _startIndexTmp++
    } else {
      //debugger
      //now that we found text + audio, update messageIndex so next() call works
      message.messageIndex = next.indexStart
      break;
    }
    tried++
  } while (tried < maxTries)
  if (tried >= maxTries) {
    console.log(METHOD_NAME, "WARNING HIT MAX RETRIES ON THIS!!!!hit end of utterance without text/audio but has more stream", "this.messageIndex", message.messageIndex, message.streamedMessages.length, next)
  }
  //debugger
  return hasNext
}

export function next(message: StreamedMessages): ChatNext {
  return _next(message, true)
}

export function getHypotheticalNext(message: StreamedMessages): ChatNext {
  return _next(message, false)
}
//fixme this is hacky, need a better way to organized streamed data and keep updating scene in real time
//for now the workaround is let it query again later to see if more came through
function _next(message: StreamedMessages, incrementCounter: boolean, _startIndex?: number): ChatNext {
  const METHOD_NAME = "_next(" + incrementCounter + "," + _startIndex + ")"
  //FIXME ugly parsing right now, could be more elegant
  //next should return the next set of "text","audio",control if one exists
  //const part = this.streamedInteractions[this.interactionIndex]
  //debugger
  let audio: ChatPart
  let text: ChatPart
  let control: ChatPart
  let emotion: ChatPart
  let endOfInteraction = false
  let utteranceId: string | undefined = undefined;

  let counterInc = _startIndex !== undefined ? _startIndex : message.messageIndex
  const startIndex = counterInc

  let msgIndexTemp = message.messageIndex

  //find next audio and text 
  mainLoop: for (let x = counterInc; x < message.streamedMessages.length; x++) {
    const msg = message.streamedMessages[x]

    //TODO include iteractionId into the scanning check
    //this will be a better way to make sure its end of interaction

    //debugger

    //pick up next utterance id
    if (utteranceId === undefined) {
      utteranceId = msg.packet.packetId.utteranceId
    } else if (msg.packet.packetId.utteranceId !== utteranceId) {
      //hit end of utterance?
      //debugger 
      // utterance can come out of order, keep scanning for a few?
      console.log(METHOD_NAME, "utterance.end.check hit end??", "utteranceId", utteranceId, "next", msg.packet.packetId.utteranceId, "this.messageIndex", "counterInc", counterInc, "loop.x", x, message.messageIndex, message.streamedMessages.length, "START SCAN FORWARD")

      //scan ahead for a control for end of interaction
      const maxScanDist = 2 //assume control in next 2 frames (behaviour + control or more text,etc)
      const yMin = Math.min(counterInc + maxScanDist, message.streamedMessages.length)
      let yCounter = 0
      const xPos = x
      let emotionFound: ChatPart

      //TODO make scan part of main loop
      scanLoop: for (let y = x; y < yMin; y++) {
        const msg = message.streamedMessages[y]
        //should we be checking same interaction id as above?  can a seperate interation close it?

        if (msg.packet.type === serverState.ChatPacketType.EMOTION) {
          emotionFound = msg
        }

        if (utteranceId == msg.packet.packetId.utteranceId) {
          //found again, pick up here
          x--

          //debugger
          //move other 2 counters
          msgIndexTemp += yCounter
          counterInc += yCounter

          if (!emotion) {
            //debugger pretty save to assume it matches
            //TODO consider time stamp as part of this?
            emotion = emotionFound
            console.log(METHOD_NAME, "utterance.end.check FOUND again also picked up an emotion", "utteranceId", utteranceId, "next", msg.packet.packetId.utteranceId, "this.messageIndex", message.messageIndex, "counterInc", counterInc, "loop.y", y, message.streamedMessages.length)
          }


          console.log(METHOD_NAME, "utterance.end.check FOUND again", "utteranceId", utteranceId, "next", msg.packet.packetId.utteranceId, "this.messageIndex", message.messageIndex, "counterInc", counterInc, "loop.y", y, message.streamedMessages.length, "returning to ")
          continue mainLoop
        }

        //move main loop counter along as we subscan
        x++
        yCounter++

      }//end scan loop

      //back check for emotions??
      //debugger
      if (!emotion && emotionFound) {
        //debugger pretty save to assume it matches
        //TODO consider time stamp range as part of this?
        const matchedAudioDate = audio && (emotionFound.packet.date === audio.packet.date)
        const matchedTextDate = text && (emotionFound.packet.date === text.packet.date)

        if (matchedAudioDate || matchedTextDate) {
          console.log(METHOD_NAME, "utterance.end.check hit NOT FOUND but found an emotion, is emotion date matched well enough", "utteranceId", utteranceId, "next", msg.packet.packetId.utteranceId, "this.messageIndex", message.messageIndex, "counterInc", counterInc, "loop.x", x, message.streamedMessages.length, "text", text !== undefined, "audio", audio !== undefined)
          emotion = emotionFound
        } else {
          console.log(METHOD_NAME, "utterance.end.check hit NOT FOUND but found an emotion, is emotion groupable?", "utteranceId", utteranceId, "next", msg.packet.packetId.utteranceId, "this.messageIndex", message.messageIndex, "counterInc", counterInc, "loop.x", x, message.streamedMessages.length, "text", text !== undefined, "audio", audio !== undefined)
        }
        //

      }

      console.log(METHOD_NAME, "utterance.end.check hit NOT FOUND", "utteranceId", utteranceId, "next", msg.packet.packetId.utteranceId, "this.messageIndex", message.messageIndex, "counterInc", counterInc, "loop.x", x, message.streamedMessages.length, "text", text !== undefined, "audio", audio !== undefined)
      break mainLoop;
    }



    switch (msg.packet.type) {
      case serverState.ChatPacketType.TEXT:
        text = msg
        break;
      case serverState.ChatPacketType.AUDIO:
        audio = msg
        break;
      case serverState.ChatPacketType.CONTROL:
        control = msg
        break;
      case serverState.ChatPacketType.EMOTION:
        emotion = msg
        break;
    }



    msgIndexTemp++
    counterInc++

  }//end main loop

  //debugger


  let futureControl: ChatPart


  if (incrementCounter) {
    message.messageIndex = msgIndexTemp
    counterInc = message.messageIndex
  }

  //scan ahead for a control for end of interaction
  const maxScanDist = 2 //assume control in next 2 frames (behaviour + control or more text,etc)
  scanLoop: for (let x = counterInc; x < Math.min(counterInc + maxScanDist, message.streamedMessages.length); x++) {
    const msg = message.streamedMessages[x]
    //should we be checking same interaction id as above?  can a seperate interation close it?
    switch (msg.packet.type) {
      case serverState.ChatPacketType.CONTROL:
        futureControl = msg
        break;
    }

    if (futureControl !== undefined) {
      //keep 1 more ahead for control
      break scanLoop;
    }
  }//end scan loop


  if (control !== undefined && control.packet.control.type === serverStateSpec.ChatControlType.INTERACTION_END) {
    //debugger
    endOfInteraction = true
  }
  //FIXME right now we use lookend to decide end but this also means that a TEXT packet is return and not a terminal message
  //if we need access to that control we cannot get it.  return this one?  should check if part of same iteractionId
  if (futureControl !== undefined && futureControl.packet.control.type === serverStateSpec.ChatControlType.INTERACTION_END) {
    //debugger
    endOfInteraction = true
  }


  //debugger
  if (incrementCounter) {
    message.lastUtteranceId = utteranceId
  }

  const ret: ChatNext = new ChatNext();

  ret.text = text
  ret.audio = audio
  ret.control = control
  ret.emotion = emotion
  ret.endOfInteraction = endOfInteraction
  ret.indexStart = startIndex
  ret.indexEnd = msgIndexTemp


  console.log(METHOD_NAME, "hit end of utterance", utteranceId, "this.messageIndex", message.messageIndex, "msgIndexTemp", msgIndexTemp
    , "streamedMessages.length", message.streamedMessages.length, "text", text !== undefined, "audio", audio !== undefined, "control", control)

  //this.interactionIndex++
  return ret
}

export const streamedMsgs = new StreamedMessages()
import * as utils from '@dcl-sdk/utils'
import { displayDialogNpcUi, setDialogNpcText } from '../../utils/customNpcUi_v2/npcDialogUi'
import { InputAction, PointerEventType, engine, inputSystem } from '@dcl/sdk/ecs'
import { ChatNext, ChatPart, next, streamedMsgs } from './streamedMsgs'
import { convertAndPlayAudio } from '../../connection/onConnect'
import { endOfRemoteInteractionStream } from './remoteNpc'
import { REGISTRY } from '../../registry'
import { getNpcEmotion } from './npcHelper'
import { Color4 } from '@dcl/sdk/math'
import * as ui from 'dcl-ui-toolkit';
import { playAnimation } from 'dcl-npc-toolkit'
import { closeAskNpcAiUi } from '../../utils/customNpcUi_v2/npcCustomUi'

export class StreamedMsgUiControl{
    started: boolean = false
    currentIdx: number = -1
    isTyping: boolean = false
    endOfConversation: boolean = false

    currentText: string = ''
    typingIntervalTimer: number = -1
    typingIntervalMs: number = 50
    
    clickIntervalSecond: number = 0.5
    timerSec: number = 0

    constructor(){
        engine.addSystem((dt) => {
            if(!this.started) return

            if(!REGISTRY.activeNPC) {
                if (this.started) {
                    this.reset()
                }
                return
            }
            
            this.timerSec += dt
            if(this.timerSec < this.clickIntervalSecond) return

            if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN)){
                if(!this.started) return
                this.timerSec = 0
                console.log('StreamedMsgUiControl. Click detected')
                if(this.isTyping){
                    this._finishTyping()
                }
                else{
                    let nextPart = streamedMsgs.next()
                    if(nextPart.text){
                        // show text
                        this.showNextText(nextPart)
                    }
                    else{
                        const checkRes = streamedMsgs._next(false, nextPart.indexStart)
                        console.log('StreamedMsgUiControl. checkRes:', checkRes)
                        if(nextPart.endOfInteraction || checkRes.endOfInteraction){
                            console.log('StreamedMsgUiControl. end of interaction. stop')
                            streamedMsgs.started = false
                            streamedMsgs.waitingForMore = false

                            endOfRemoteInteractionStream(REGISTRY.activeNPC)

                            this.reset()
                        }
                        else{
                            console.log('StreamedMsgUiControl. not end of interaction. waiting more streamed message')
                            streamedMsgs.waitingForMore = true
                            displayDialogNpcUi(false)
                        }
                    }
                }
            }
        })
    }
    
    start(){
        console.log('StreamedMsgUiControl. Started')
        this.started = true
        displayDialogNpcUi(true)
    }
    reset(){
        this.started = false
        this.currentIdx = -1
        this.isTyping = false
        if(this.typingIntervalTimer !== -1) utils.timers.clearInterval(this.typingIntervalTimer)
        this.typingIntervalTimer = -1
        displayDialogNpcUi(false)
    }
    showNextText(nextPart: ChatNext){
        if(!this.started) return
        closeAskNpcAiUi(false)
        console.log('StreamedMsgUiControl. showNextText', nextPart)
        this._startTyping(nextPart.text.packet.text.text)
        // setDialogNpcText(nextPart.text.packet.text.text)

        // Check audio
        if(nextPart.audio && nextPart.audio.packet.audio.chunk){
            convertAndPlayAudio(nextPart.audio.packet)
        }
        
        //TODO: Check emotion
        let hasEmotion = nextPart.emotion ? true : false
        console.log("Emotions", "Do we have emotions?", hasEmotion, ":", nextPart)
        
        if(hasEmotion){
            let emotion = getNpcEmotion(nextPart.emotion)
            if (hasEmotion && emotion.portraitPath) {
                console.log('Emotions. portrait path:', emotion.portraitPath)
                //TODO: change UI portrait if there's emotion
            }
            if (hasEmotion && emotion.name) {
                console.log('Emotions. play emotion animation:', emotion.name)
                playAnimation(REGISTRY.activeNPC.entity, emotion.name, true, emotion.duration)
            }
        }
    }

    _startTyping(fullText: string){
        this.currentText = fullText
        this.isTyping = true
        let idx: number = 0

        this.typingIntervalTimer = utils.timers.setInterval(() => {
            console.log("StreamedMsgUiControl. Interval active. typing:", this.isTyping)

            for(let i = idx + 1; i < this.currentText.length; i++){
                if(this.currentText[i] !== '' || this.currentText[i] !== '\n'){
                    idx = i
                    break
                }
            }
            let displayText = this.currentText.substring(0, idx + 1)
            setDialogNpcText(displayText)

            if(displayText.length === this.currentText.length){
                this._finishTyping()
            }

        }, this.typingIntervalMs)
    }
    _finishTyping(){
        console.log("StreamedMsgUiControl. finish typing.")
        this.isTyping = false
        if(this.typingIntervalTimer !== -1) utils.timers.clearInterval(this.typingIntervalTimer)
        setDialogNpcText(this.currentText)

        this.timerSec = this.clickIntervalSecond
    }
}




export const streamedMsgsUiControl = new StreamedMsgUiControl()

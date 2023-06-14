import { Entity, GltfContainer, MeshRenderer, TextShape, Transform, VisibilityComponent, engine } from "@dcl/sdk/ecs"
import { Quaternion, Vector3 } from "@dcl/sdk/math"
import { NpcAnimationNameType } from "../../registry" 
import * as npcLib from 'dcl-npc-toolkit'
import * as utils from '@dcl-sdk/utils'
import { NpcCreationArgs, createNpc } from "./npcHelper"
import { closeDialog } from "dcl-npc-toolkit/dist/dialog"
import { NpcQuestionData } from "../../utils/customNpcUi/customUIFunctionality" 

const FILE_NAME: string = "remoteNpc.ts"

export class RemoteNpcConfig {
  /**
   * inworlds needs the resource name of the character
   */
  resourceName: string
  /**
   * id for internal scene usage, could be same as resource name
   */
  id?: string
}

export type RemoteNpcThinkingOptions = {
  enabled: boolean
  modelPath?: string
  modelScale?: Vector3
  modelOffset?: Vector3
  textEnabled?: boolean
  text?: string
  textScale?: Vector3
  textOffset?: Vector3
  offsetX?: number
  offsetY?: number
  offsetZ?: number
}

export type RemoteNpcOptions = {
  loadingIcon?: { enable: boolean }//TODO: USE THIS
  npcAnimations?: NpcAnimationNameType
  thinking?: RemoteNpcThinkingOptions
  onEndOfRemoteInteractionStream: () => void
  onEndOfInteraction: () => void
}

export class RemoteNpc {
  entity: Entity
  name: string
  config: RemoteNpcConfig
  args?: RemoteNpcOptions
  predefinedQuestions: NpcQuestionData[] = []

  thinkingIconEnabled: boolean = false
  thinkingIconRoot: Entity
  thinkingIcon: Entity
  thinkingIconText: Entity
  isThinking: boolean = false
  npcAnimations: NpcAnimationNameType

  onEndOfRemoteInteractionStream: () => void
  onEndOfInteraction: () => void

  /**
   * 
   * @param inConfig configuration needed for remote npc
   * @param npc normal configuration for NPC @see https://github.com/decentraland/decentraland-npc-utils
   * @param inArgs additional configuration arts for remote npc intance
   */
  constructor(inConfig: RemoteNpcConfig, npcCreationArgs: NpcCreationArgs, inArgs?: RemoteNpcOptions) {
    this.entity = createNpc(npcCreationArgs)
    this.config = inConfig
    this.args = inArgs

    if (inArgs) {
      this.thinkingIconEnabled = inArgs.thinking !== undefined && inArgs.thinking.enabled

      if (inArgs.npcAnimations)
        this.npcAnimations = inArgs?.npcAnimations

      this.onEndOfRemoteInteractionStream = inArgs.onEndOfRemoteInteractionStream
      this.onEndOfInteraction = inArgs.onEndOfInteraction
    }

    createThinkingEnities(this)
    this.isThinking = false
  }

}

function createThinkingEnities(npc: RemoteNpc): void {
  if (!npc.thinkingIconEnabled) return

  const defaultWaitingOffsetX = 0
  const defaultWaitingOffsetY = 3
  const defaultWaitingOffsetZ = 0
  const TEXT_HEIGHT = -1

  npc.thinkingIconRoot = engine.addEntity()
  npc.thinkingIcon = engine.addEntity()
  npc.thinkingIconText = engine.addEntity()

  setParent(npc.entity, npc.thinkingIconRoot)
  setParent(npc.thinkingIconRoot, npc.thinkingIcon)
  setParent(npc.thinkingIconRoot, npc.thinkingIconText)

  const args = npc.args

  if (args) {
    npc.thinkingIconEnabled = args.thinking !== undefined && args.thinking.enabled

    let iconRootTransform = Transform.getMutable(npc.thinkingIconRoot)
    iconRootTransform.position = Vector3.create(
      args.thinking?.offsetX ? args.thinking?.offsetX : defaultWaitingOffsetX
      , args.thinking?.offsetY ? args.thinking?.offsetY : defaultWaitingOffsetY
      , args.thinking?.offsetZ ? args.thinking?.offsetZ : defaultWaitingOffsetZ
    )
    iconRootTransform.scale = Vector3.create(.1, .1, .1)

    if (npc.thinkingIconEnabled && (args.thinking.textEnabled === undefined || args.thinking.textEnabled)) {
      TextShape.createOrReplace(npc.thinkingIconText, {
        text: args.thinking?.text ? args.thinking.text : "Thinking..."
      })
    }
    if (args.thinking?.modelPath) {
      GltfContainer.createOrReplace(npc.thinkingIcon, {
        src: args.thinking.modelPath
      })
      let iconTransform = Transform.getOrCreateMutable(npc.thinkingIcon)
      iconTransform.scale = Vector3.create(2, 2, 2)
      //this.thinkingIcon.addComponent(new KeepRotatingComponent(Quaternion.Euler(0,25,0)))
    } else {
      MeshRenderer.setBox(npc.thinkingIcon)
      infiniteRotation(
        npc.thinkingIcon,
        Vector3.create(0, 0, 0),
        Vector3.create(0, 360, 0),
        2
      )
    }
  

    let iconTextTransform = Transform.getMutable(npc.thinkingIconText)
    iconTextTransform.position = args.thinking?.textOffset ? args.thinking.textOffset : Vector3.create(0, TEXT_HEIGHT, 0),
      iconTextTransform.scale = args.thinking?.textScale ? args.thinking?.textScale : Vector3.create(1, 1, 1),
      iconTextTransform.rotation = Quaternion.fromEulerDegrees(0, 180, 0)

  }

  VisibilityComponent.create(npc.thinkingIconRoot).visible = false
  VisibilityComponent.create(npc.thinkingIcon).visible = false
  VisibilityComponent.create(npc.thinkingIconText).visible = false
}

function showThinking(npc: RemoteNpc): void {

  if (!npc.thinkingIconEnabled) return
  if (npc.isThinking) return

  console.log('THOUGHTS', "showThinking", npc.name);

  VisibilityComponent.getMutable(npc.thinkingIconRoot).visible = true
  VisibilityComponent.getMutable(npc.thinkingIcon).visible = true
  VisibilityComponent.getMutable(npc.thinkingIconText).visible = true

  npc.isThinking = true
}

export function hideThinking(npc: RemoteNpc): void {
  const METHOD_NAME = "hideThinking"
  console.log("THOUGHTS", FILE_NAME, METHOD_NAME, "Entry", npc.name);
  if (npc.thinkingIconEnabled) {
    VisibilityComponent.getMutable(npc.thinkingIconRoot).visible = false
    VisibilityComponent.getMutable(npc.thinkingIcon).visible = false
    VisibilityComponent.getMutable(npc.thinkingIconText).visible = false
  }
  npc.isThinking = false
}

function setParent(parent: Entity, child: Entity): void {
  Transform.getOrCreateMutable(child).parent = parent
}

function infiniteRotation(entity: Entity, start: Vector3, end: Vector3, duration: number): void {
  utils.tweens.startRotation(
    entity,
    Quaternion.fromEulerDegrees(start.x, start.y, start.z),
    Quaternion.fromEulerDegrees(end.x, end.y, end.z),
    duration,
    utils.InterpolationType.LINEAR,
    () => {
      infiniteRotation(entity, start, end, duration)
    }
  )
}

export function startThinking(npc: RemoteNpc, dialog: npcLib.Dialog[]): void {
  const METHOD_NAME = "startThinking"
  console.log("THOUGHTS", FILE_NAME, METHOD_NAME, "Entry", npc.name, dialog);
  showThinking(npc)

  npcLib.talk(npc.entity, dialog)
  if (npc.npcAnimations.THINKING) npcLib.playAnimation(npc.entity, npc.npcAnimations.THINKING.name, true, npc.npcAnimations.THINKING.duration)
}

export function endInteraction(npc: RemoteNpc) {
  console.log("THOUGHTS", FILE_NAME, "endInteraction", "Entry", npc.name);
  closeDialog(npc.entity)
  hideThinking(npc)
  if (npc.onEndOfInteraction) npc.onEndOfInteraction()
}

export function endOfRemoteInteractionStream(npc: RemoteNpc) {
  console.log("NPC.endOfRemoteInteractionStream", "ENTRY", npc.name)
  if (npc.onEndOfRemoteInteractionStream) npc.onEndOfRemoteInteractionStream()
}

export function goodBye(npc: RemoteNpc) {
  console.log("NPC.goodbye", "ENTRY", npc.name)
  npcLib.handleWalkAway(npc.entity)
}

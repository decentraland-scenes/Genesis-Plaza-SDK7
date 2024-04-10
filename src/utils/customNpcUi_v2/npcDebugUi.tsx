import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { UiEntity, Label, Button, Input } from '@dcl/sdk/react-ecs'
import { AtlasTheme, getImageMapping, sourcesComponentsCoordinates } from '../customNpcUi/uiResources'
import { NpcQuestionData, sendQuestion } from '../customNpcUi/customUIFunctionality'
import { REGISTRY } from '../../registry'
import { getData } from 'dcl-npc-toolkit'
import { NPCData } from 'dcl-npc-toolkit/dist/types'
import { npcDataComponent } from 'dcl-npc-toolkit/dist/npc'

let isVisible: boolean = true

export const npcDebugUi = () => {
    return (
        <UiEntity //Invisible Parent
            uiTransform={{
                width: '100%',
                height: '100%',
                display: isVisible ? 'flex' : 'none',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems:'center',
                positionType: 'absolute',
                position: {bottom: 5}
            }}
            uiBackground={{
                // color: Color4.create(0.5, 0.5, 0.5, 0)
            }}
            >
            <UiEntity //Dialog Holder
                uiTransform={{
                    width: '100%',
                    height: 50,
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    display: 'flex',
                    // flexWrap: 'wrap',
                    flexDirection: 'column'
                }}
                uiBackground={{
                    color: Color4.create(0.5, 0.5, 0.5, 0.5)
                }}
                uiText={{
                    value: 'active NPC:' + (REGISTRY.activeNPC ? REGISTRY.activeNPC.name : 'null'),
                    fontSize: 20
                }}
                >
            </UiEntity>

            <UiEntity //Dialog Holder
                uiTransform={{
                    width: '100%',
                    height: 50,
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    display: 'flex',
                    // flexWrap: 'wrap',
                    flexDirection: 'column'
                }}
                uiBackground={{
                    color: Color4.create(0.5, 0.5, 0.5, 0.5)
                }}
                uiText={{
                    value: 'state:' + (REGISTRY.activeNPC ? (npcDataComponent.get(REGISTRY.activeNPC.entity)).state : 'null'),
                    fontSize: 20
                }}
                >
            </UiEntity>
        </UiEntity>
    )
}

import { engine, Transform } from '@dcl/sdk/ecs'
import ReactEcs, { Button, Label, ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
import { NpcUtilsUi } from 'dcl-npc-toolkit/dist/ui'

const uiComponent = () =>
  <UiEntity>
    <NpcUtilsUi></NpcUtilsUi>
  </UiEntity>

export function setupUi() {
  ReactEcsRenderer.setUiRenderer(uiComponent)
}

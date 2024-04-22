import { Animator, AudioSource, ColliderLayer, Entity, GltfContainer, InputAction, Material, MeshCollider, MeshRenderer, Transform, engine, pointerEventsSystem } from "@dcl/sdk/ecs"
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math"
import resources from "../../resources"
import { sceneMessageBus } from "../serverHandler"
import { sequencerConfig } from "./sequenceSystem"
import { changeSequencer } from "./serverHandler"
import * as utils from '@dcl-sdk/utils'


export let stones: Stone[][] = []
export let seqNumbers: number[][] = []

export class Stone{
    stoneOn: boolean = false

    stoneEntity: Entity = engine.addEntity()
    noteEntity: Entity = engine.addEntity()
    musicDropEntity: Entity = engine.addEntity()

    noteSrc: string
    pos: {beat: number, note: number}

    constructor(_pos:{beat: number, note: number}, _noteSrc: string, _parent: Entity){
        let seqOffset = Vector3.create(127.5 - 120, 0.3, 222 - 225)
        this.pos = _pos
        this.noteSrc = _noteSrc

        // stone entity setup
        GltfContainer.create(this.stoneEntity, { src: resources.zenquencer.models.stone })
        Transform.create(this.stoneEntity, {
            parent: _parent,
            position: Vector3.create(
                seqOffset.x - this.pos.beat,
                seqOffset.y,
                seqOffset.z + this.pos.note 
            ),
            scale: Vector3.One(),
            rotation: Quaternion.fromEulerDegrees(180, 0, 0)
        })

        let stoneBtn = engine.addEntity()
        Transform.create(stoneBtn, {
            parent: this.stoneEntity,
            scale: Vector3.create(0.7, 0.3, 0.7)
        })
        MeshRenderer.setBox(stoneBtn)
        MeshCollider.setBox(stoneBtn)
        Material.setPbrMaterial(stoneBtn, { albedoColor: Color4.create(0.5, 0.5, 0.5, 0.3) })
        
        let canClick = true
        pointerEventsSystem.onPointerDown(
            {
                entity: stoneBtn,
                opts: {
                    button: InputAction.IA_POINTER,
                    hoverText: "Toggle"
                }
            },
            () => {
                if(!canClick) return

                canClick = false
                utils.timers.setTimeout(() => {
                    canClick = true
                }, 1000)

                console.log('zenquencer. stone click. pos:', this.pos, 'stoneOn:', this.stoneOn)

                if(this.stoneOn){
                    sceneMessageBus.emit('hideStone', { pos: this.pos })
                }
                else{
                    sceneMessageBus.emit('showStone', { pos: this.pos })
                }
            }
        )

        // note entity setup
        GltfContainer.create(this.noteEntity, { src: resources.zenquencer.models.musicDrop })
        Transform.create(this.noteEntity, {
            parent: this.stoneEntity,
            position: Vector3.create(0, -0.1, 0),
            rotation: Quaternion.fromEulerDegrees(0, 0, 0),
            scale: Vector3.One()
        })
        Animator.create(this.noteEntity, {
            states: [{
                clip: 'ArmatureAction.001',
                playing: false,
                loop: false,
                shouldReset: true
            }]
        })
        
        // music drop entity setup
        Transform.create(this.musicDropEntity, { parent: engine.CameraEntity })
        AudioSource.createOrReplace(this.musicDropEntity, { 
            audioClipUrl: this.noteSrc, 
            playing: false, 
            loop: false 
        })
    }
    activate(){
        if(this.stoneOn) return
        this.stoneOn = true
        console.log('zenquencer. stone. activate. pos:', this.pos.beat, this.pos.note)
        Transform.getMutable(this.noteEntity).rotation = Quaternion.fromEulerDegrees(180, 0, 0)
    }
    deactivate(){
        if(!this.stoneOn) return
        this.stoneOn = false
        console.log('zenquencer. stone. deactivate. pos:', this.pos.beat, this.pos.note)
        Transform.getMutable(this.noteEntity).rotation = Quaternion.fromEulerDegrees(0, 0, 0)
    }
    play(){
        Transform.getMutable(this.noteEntity).scale = Vector3.One()
        Animator.getMutable(this.noteEntity).states[0].playing = true
        
        // AudioSource.getMutable(this.musicDropEntity).playing = false
        // AudioSource.deleteFrom(this.musicDropEntity)
        // AudioSource.createOrReplace(this.musicDropEntity, { 
        //     audioClipUrl: this.noteSrc, 
        //     playing: true, 
        //     loop: false 
        // })
        let audioEntity = engine.addEntity()
        Transform.create(audioEntity, { parent: engine.CameraEntity })
        AudioSource.create(audioEntity, {
            audioClipUrl: this.noteSrc,
            playing: true,
            loop: false
        })
        utils.timers.setTimeout(() => {
            engine.removeEntity(audioEntity)
        }, 7000)
    }
}

sceneMessageBus.on('showStone', (e) => {
    e = e.pos
    console.log('zenquencer. sceneMessageBus. showStone. e:', e, stones[e.beat][e.note])
    stones[e.beat][e.note].activate()
  
    if (!sequencerConfig.playingMode) {
        stones[e.beat][e.note].play()
    }

    seqNumbers[e.beat][e.note] = 1
    changeSequencer()
  })
  
  sceneMessageBus.on('hideStone', (e) => {
    e = e.pos
    console.log('zenquencer. sceneMessageBus. hideStone. e:', e, stones[e.beat][e.note])

    stones[e.beat][e.note].deactivate()

    seqNumbers[e.beat][e.note] = 0
    changeSequencer()
  })
  
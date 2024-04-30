import { Animator, Entity, GltfContainer, InputAction, Transform, engine, pointerEventsSystem } from "@dcl/sdk/ecs";
import * as utils from '@dcl-sdk/utils'
import resources from "../../resources";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { sceneMessageBus } from "../serverHandler";
import { Stone, seqNumbers, stones } from "./stones";
import { PlayingMode, TOTAL_DURATION, activateSequenceSystem, sequencerConfig } from "./sequenceSystem";
import { getStones } from "./serverHandler";


export const linear = engine.addEntity()
export const random = engine.addEntity()
let slow2: Entity, slow1: Entity, neutral: Entity, fast1: Entity, fast2: Entity
export const pool = engine.addEntity()
export const tube = engine.addEntity()


export function addZenquencer(){
    addZequencerModels()

    const kalimbaSounds: string[] = [
        resources.zenquencer.kalimbaNotes.f3,
        resources.zenquencer.kalimbaNotes.a3,
        resources.zenquencer.kalimbaNotes.c3,
        resources.zenquencer.kalimbaNotes.e4,
        resources.zenquencer.kalimbaNotes.f4,
        resources.zenquencer.kalimbaNotes.g4,
        resources.zenquencer.kalimbaNotes.a4
    ]
    let seqLength = 16

    for(let beat = 0; beat < seqLength; beat++){
        seqNumbers[beat] = []
        stones[beat] = []
        for(let note = 0; note < kalimbaSounds.length; note++){
            stones[beat][note] = new Stone({beat, note}, kalimbaSounds[note], pool)
        }
    }

    sceneMessageBus.on('playStone', (e) => {
        stones[e.beat][e.note].play()
    })
    
    sceneMessageBus.on('seqOn', (e) => {
        sequencerConfig.playingMode = PlayingMode.LOOP
        sequencerConfig.currentBeat = -1
        sequencerConfig.durationLeft = TOTAL_DURATION
        sequencerConfig.currentLoop = 0
        Transform.getMutable(linear).rotation = Quaternion.fromEulerDegrees(0, 0, 0)
        Transform.getMutable(random).rotation = Quaternion.fromEulerDegrees(0, 180, 0)
        Transform.getMutable(neutral).rotation = Quaternion.fromEulerDegrees(0, 0, 0)
        Animator.getMutable(tube).states[0].playing = true
        activateSequenceSystem()
    })
    sceneMessageBus.on('randomMode', (e) => {
        sequencerConfig.playingMode = PlayingMode.RANDOM
        sequencerConfig.currentBeat = -1
        sequencerConfig.durationLeft = TOTAL_DURATION
        sequencerConfig.currentLoop = 0
        Transform.getMutable(random).rotation = Quaternion.fromEulerDegrees(0, 0, 0)
        Transform.getMutable(linear).rotation = Quaternion.fromEulerDegrees(0, 180, 0)
        Transform.getMutable(neutral).rotation = Quaternion.fromEulerDegrees(0, 0, 0)
        Animator.getMutable(tube).states[0].playing = true
        activateSequenceSystem()
    })

    sceneMessageBus.on('seqOff', (e) => {
        sequencerConfig.playingMode = PlayingMode.OFF
        Transform.getMutable(linear).rotation = Quaternion.fromEulerDegrees(0, 180, 0)
        Transform.getMutable(random).rotation = Quaternion.fromEulerDegrees(0, 180, 0)
        Transform.getMutable(neutral).rotation = Quaternion.fromEulerDegrees(0, 180, 0)
    })
    
  sceneMessageBus.on('seqSpeed', (e) => {
    if (sequencerConfig.playingMode) {
        let newSpeed = e.speed * 4

        console.log('zenquencer. sceneMessageBus. seqSpeed. new loop duration = ', newSpeed)
        sequencerConfig.loopDuration = newSpeed
        sequencerConfig.beatDuration = sequencerConfig.loopDuration / sequencerConfig.beats
        sequencerConfig.currentLoop = sequencerConfig.currentBeat * sequencerConfig.beatDuration

        switch (e.speed) {
            case 12:
                Transform.getMutable(slow2).rotation = Quaternion.fromEulerDegrees(0, 0, 0)
                Transform.getMutable(slow1).rotation = Quaternion.fromEulerDegrees(0, 0, 0)
                Transform.getMutable(neutral).rotation = Quaternion.fromEulerDegrees(0, 0, 0)
                Transform.getMutable(fast1).rotation = Quaternion.fromEulerDegrees(0, 180, 0)
                Transform.getMutable(fast2).rotation = Quaternion.fromEulerDegrees(0, 180, 0)
            break
            case 8:
                Transform.getMutable(slow2).rotation = Quaternion.fromEulerDegrees(0, 180, 0)
                Transform.getMutable(slow1).rotation = Quaternion.fromEulerDegrees(0, 0, 0)
                Transform.getMutable(neutral).rotation = Quaternion.fromEulerDegrees(0, 0, 0)
                Transform.getMutable(fast1).rotation = Quaternion.fromEulerDegrees(0, 180, 0)
                Transform.getMutable(fast2).rotation = Quaternion.fromEulerDegrees(0, 180, 0)
            break
            case 4:
                Transform.getMutable(slow2).rotation = Quaternion.fromEulerDegrees(0, 180, 0)
                Transform.getMutable(slow1).rotation = Quaternion.fromEulerDegrees(0, 180, 0)
                Transform.getMutable(neutral).rotation = Quaternion.fromEulerDegrees(0, 0, 0)
                Transform.getMutable(fast1).rotation = Quaternion.fromEulerDegrees(0, 180, 0)
                Transform.getMutable(fast2).rotation = Quaternion.fromEulerDegrees(0, 180, 0)
            break
            case 2:
                Transform.getMutable(slow2).rotation = Quaternion.fromEulerDegrees(0, 180, 0)
                Transform.getMutable(slow1).rotation = Quaternion.fromEulerDegrees(0, 180, 0)
                Transform.getMutable(neutral).rotation = Quaternion.fromEulerDegrees(0, 0, 0)
                Transform.getMutable(fast1).rotation = Quaternion.fromEulerDegrees(0, 0, 0)
                Transform.getMutable(fast2).rotation = Quaternion.fromEulerDegrees(0, 180, 0)
            break
            case 1:
                Transform.getMutable(slow2).rotation = Quaternion.fromEulerDegrees(0, 180, 0)
                Transform.getMutable(slow1).rotation = Quaternion.fromEulerDegrees(0, 180, 0)
                Transform.getMutable(neutral).rotation = Quaternion.fromEulerDegrees(0, 0, 0)
                Transform.getMutable(fast1).rotation = Quaternion.fromEulerDegrees(0, 0, 0)
                Transform.getMutable(fast2).rotation = Quaternion.fromEulerDegrees(0, 0, 0)
            break
        }
    } 
    else {
        sceneMessageBus.emit('seqOn', {})
    }})
}


function addZequencerModels(){
    GltfContainer.create(pool, { src: resources.zenquencer.models.pool })
    Transform.create(pool, {
        position: Vector3.create(127, 0.55, 225),
        rotation: Quaternion.fromEulerDegrees(0, 315, 0),
    })
    utils.triggers.addTrigger(
        pool,
        utils.NO_LAYERS,
        utils.LAYER_1,
        [{
            type: 'box',
            scale: Vector3.create(40, 6, 40)
        }],
        (enterEntity) => {
            console.log('zenquencer. enter area.')
            updateStones()
        },
        (exitEntity) => {}
    )

    GltfContainer.create(tube, { src: resources.zenquencer.models.tube })
    Transform.create(tube, {
        parent: pool,
        rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
    Animator.create(tube, {
        states: [
            {
                clip: 'Energy_Action',
                playing: false,
                loop: false
            }
        ]
    })
    
    GltfContainer.create(linear, { src: resources.zenquencer.models.linearBtn })
    Transform.create(linear, {
        parent: tube,
        position: Vector3.create(-9.54, 1.48, 4.59),
        rotation: Quaternion.fromEulerDegrees(0, 180, 0),

    })
    pointerEventsSystem.onPointerDown(
        {
            entity: linear,
            opts: {
                button: InputAction.IA_POINTER,
                hoverText: "Loop"
            }
        },
        () => {
            sceneMessageBus.emit('seqOn', {})
        }
    )

    GltfContainer.create(random, { src: resources.zenquencer.models.randomBtn })
    Transform.create(random, {
        parent: tube,
        position: Vector3.create(-9.54, 1.49, 4.33),
        rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
    pointerEventsSystem.onPointerDown(
        {
            entity: random,
            opts: {
                button: InputAction.IA_POINTER,
                hoverText: "Random"
            }
        },
        () => {
            sceneMessageBus.emit('randomMode', {})
        }
    )

    slow2 = engine.addEntity()
    GltfContainer.create(slow2, { src: resources.zenquencer.models.speedBtn })
    Transform.create(slow2, {
        parent: tube,
        position: Vector3.create(-9.54, 1.6, 4.59),
        rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
    pointerEventsSystem.onPointerDown(
        {
            entity: slow2,
            opts: {
                button: InputAction.IA_POINTER,
                hoverText: "Very Slow"
            }
        },
        () => {
            sceneMessageBus.emit('seqSpeed', { speed: 12 })
        }
    )

    slow1 = engine.addEntity()
    GltfContainer.create(slow1, { src: resources.zenquencer.models.speedBtn })
    Transform.create(slow1, {
        parent: tube,
        position: Vector3.create(-9.54, 1.6, 4.53),
        rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
    pointerEventsSystem.onPointerDown(
        {
            entity: slow1,
            opts: {
                button: InputAction.IA_POINTER,
                hoverText: "Slow"
            }
        },
        () => {
            sceneMessageBus.emit('seqSpeed', { speed: 8 })
        }
    )

    neutral = engine.addEntity()
    GltfContainer.create(neutral, { src: resources.zenquencer.models.speedBtn })
    Transform.create(neutral, {
        parent: tube,
        position: Vector3.create(-9.54, 1.6, 4.47),
        rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
    pointerEventsSystem.onPointerDown(
        {
            entity: neutral,
            opts: {
                button: InputAction.IA_POINTER,
                hoverText: "Normal"
            }
        },
        () => {
            sceneMessageBus.emit('seqSpeed', { speed: 4 })
        }
    )

    fast1 = engine.addEntity()
    GltfContainer.create(fast1, { src: resources.zenquencer.models.speedBtn })
    Transform.create(fast1, {
        parent: tube,
        position: Vector3.create(-9.54, 1.6, 4.41),
        rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
    pointerEventsSystem.onPointerDown(
        {
            entity: fast1,
            opts: {
                button: InputAction.IA_POINTER,
                hoverText: "Fast"
            }
        },
        () => {
            sceneMessageBus.emit('seqSpeed', { speed: 2 })
        }
    )

    fast2 = engine.addEntity()
    GltfContainer.create(fast2, { src: resources.zenquencer.models.speedBtn })
    Transform.create(fast2, {
        parent: tube,
        position: Vector3.create(-9.54, 1.6, 4.35),
        rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
    pointerEventsSystem.onPointerDown(
        {
            entity: fast2,
            opts: {
                button: InputAction.IA_POINTER,
                hoverText: "Very Fast"
            }
        },
        () => {
            sceneMessageBus.emit('seqSpeed', { speed: 1 })
        }
    )
}

async function updateStones() {
    let currentStones = await getStones()
    if (!currentStones) return

    console.log('zenquencer. updateStones. current stone:', currentStones, stones)
    for (let beat = 0; beat < currentStones.length; beat++) {
        for (let note = 0; note < currentStones[beat].length; note++) {
            seqNumbers[beat][note] = currentStones[beat][note]

            if (currentStones[beat][note] === 0) {
                stones[beat][note].deactivate()
            } 
            else {
                stones[beat][note].activate()
            }
        }
    }
}

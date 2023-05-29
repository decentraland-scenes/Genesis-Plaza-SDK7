//TODO move to common location

import { Entity, MeshRenderer, Transform, engine } from "@dcl/sdk/ecs"
import { Quaternion, Vector3 } from "@dcl/sdk/math"


export function distance(pos1: Vector3, pos2: { x: number, y: number, z: number }): number {
  const a = pos1.x - pos2.x
  const b = pos1.z - pos2.z
  return a * a + b * b
}

export function realDistance(pos1: Vector3, pos2: Vector3): number {
  if (!pos1) console.log("realDist pos1 is null")
  if (!pos2) console.log("realDist pos2 is null")
  const a = pos1.x - pos2.x
  const b = pos1.z - pos2.z
  return Math.sqrt(a * a + b * b)
}

export function ToDegrees(radians: number) {
  var pi = Math.PI;
  return radians * (180 / pi);
}

export function ToRadian(degrees: number) {
  var pi = Math.PI;
  return degrees * (pi / 180);
}


export function drawLineBetween(A: Vector3, B: Vector3, _offsetZ?: number): Entity {
  let offset = 0.05
  if (_offsetZ) {
    offset = _offsetZ
  }
  let line = engine.addEntity()
  let dist = realDistance(A, B)
  let rotAngle = ToDegrees(Vector3.getAngleBetweenVectors(Vector3.Forward(), Vector3.subtract(A, B), Vector3.Up()))

  Transform.getOrCreateMutable(line, {
    position: Vector3.lerp(A, B, 0.5),
    rotation: Quaternion.fromEulerDegrees(0, 90 + rotAngle, 0),
    scale: Vector3.create(dist, 0.02, 1)
  })
  //line.getComponent(Transform).rotate(Vector3.Right(), 90) TODO: Find Replacement
  Transform.getMutable(line).rotation = Quaternion.fromLookAt(
    Transform.getMutable(line).position,
    Vector3.Right(),
    Vector3.Up()
  )
  Transform.getMutable(line).position.y += offset
  MeshRenderer.setPlane(line)

  return line
}

export function moveLineBetween(line: Entity, A: Vector3, B: Vector3) {
  if (!A) console.log("moveLineBetween A is null!!!")
  if (!B) console.log("moveLineBetween B is null!!!")
  let dist = realDistance(A, B)
  let rotAngle = ToDegrees(Vector3.getAngleBetweenVectors(Vector3.Forward(), Vector3.subtract(A, B), Vector3.Up()))

  Transform.getMutable(line).position = Vector3.lerp(A, B, 0.5)
  Transform.getMutable(line).position.y += 0.02
  Transform.getMutable(line).scale = Vector3.create(dist, 0.02, 1)
  Transform.getMutable(line).rotation = Quaternion.fromEulerDegrees(0, 90 + rotAngle, 0)

  //line.getComponent(Transform).rotate(Vector3.Right(), 90) TODO: Find Replacement
  // Rotate 90% using a look matrix
  Transform.getMutable(line).rotation = Quaternion.fromLookAt(
    Transform.getMutable(line).position,
    Vector3.Right(),
    Vector3.Up()
  )
}

export function percentOfLine(a: Vector3, b: Vector3, c: Vector3): number {
  const percentDist = Vector3.distance(a, c) / Vector3.distance(a, b);

  return percentDist
}

export function isPointOnSegment(point: Vector3, segA: Vector3, segB: Vector3): boolean {

  let minX = Math.min(segA.x, segB.x)
  let minZ = Math.min(segA.z, segB.z)
  let maxX = Math.max(segA.x, segB.x)
  let maxZ = Math.max(segA.z, segB.z)


  if (segA.x == segB.x && segA.z == segB.z) {
    return false
  }

  if (point.x >= minX && point.x <= maxX && point.z >= minZ && point.z <= maxZ) {
    return true
  } else {
    return false
  }

}


export function notNull(obj: any): boolean {
  return obj !== null && obj !== undefined
}
export function isNull(obj: any): boolean {
  return obj === null || obj === undefined
}


/**
 * FIXME make synchronize https://spin.atomicobject.com/2018/09/10/javascript-concurrency/
 * https://www.npmjs.com/package/mutexify
 * 
 * @param name - name of the wrapped promise - for debugging
 * @param proc - promise to be synchronized, prevent concurrent execution 
 * @returns 
 */
export const preventConcurrentExecution = <T>(name: string, proc: () => PromiseLike<T>) => {
  let inFlight: Promise<T> | false = false;

  return () => {
    if (!inFlight) {
      inFlight = (async () => {
        try {
          //  log("preventConcurrentExecution",name," start flight")
          return await proc();
        } finally {
          //log("preventConcurrentExecution",name,"  not in flight")
          inFlight = false;
        }
      })();
    } else {
      //log("preventConcurrentExecution",name," not in flight return same as before")
    }
    return inFlight;
  };
};

export function formatTime(timeSeconds: number, fractionDigits: number = 1): string {
  if (timeSeconds <= 0) {
    return "00:00.0"
    /*}else if(timeSeconds<60){
      if(timeSeconds<10){
        return "00:0"+timeSeconds.toFixed(1)
      }else{
        return "00:"+timeSeconds.toFixed(1)
      }*/
  } else {
    //debugger
    //timeSeconds+=50
    let minutes = Math.floor((timeSeconds % (60 * 60)) / (60));
    let seconds = (timeSeconds % (60));

    return (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds.toFixed(1) : seconds.toFixed(fractionDigits))// + "-"+timeSeconds.toFixed(1)

  }
}
//TODO: SDK7 syntax
export function createEntityForSound(name: string) {
  const entSound = engine.addEntity()
  Transform.create(entSound,
    {
      parent: engine.PlayerEntity,
      position: Vector3.create(0, 0, 0)
    }
  )

  return entSound
}
/*
export function createEntitySound(name: string, audioClip: AudioClip | AudioSource | AudioStream, volume?: number, loop?: boolean) {
  const entSound = createEntityForSound(name)

  //entSound.addComponent(shape)
  if (audioClip instanceof AudioClip) {
    entSound.addComponent(new AudioSource(audioClip))
    entSound.getComponent(AudioSource).volume = volume !== undefined ? volume : 0.5
    entSound.getComponent(AudioSource).loop = loop !== undefined && loop == true
  } else {
    entSound.addComponent(audioClip)
    entSound.getComponent(AudioStream).volume = volume !== undefined ? volume : 0.5
    //entSound.getComponent(AudioStream).loop = loop !== undefined && loop == true
  }


  return entSound
}
*/
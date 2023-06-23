import * as utils from '@dcl-sdk/utils'
import { Ball, BallFlag, BallFlagType } from '../gameObjects/ball'
import { BrickFlag } from '../gameObjects/brick'
import { PaddleFlag } from '../gameObjects/paddle'
import { Sound } from '../gameObjects/sound'
import { Wall, WallFlag } from '../gameObjects/wall'
import { AudioSource, Entity, Transform, engine } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'

export const CollisionFlag = engine.defineComponent('collisionFlag', {})

const hitSound = new Sound('sounds/hit.mp3')

// Collision detection
class CollisionDetection {
  update(dt: number) {

    const ballGroup = engine.getEntitiesWith(BallFlag, Transform) 
    const collisionGroup = engine.getEntitiesWith(CollisionFlag, Transform) 

    for (const [ballEntity, ballFlagRO, ballTransformRO] of ballGroup){
      for (const [hitEntity, collisionFlag, hitTransformRO] of collisionGroup){
        const ballFlag = BallFlag.getMutableOrNull(ballEntity)
        let ballPos = ballTransformRO.position
        let brickPos = hitTransformRO.position
        let ballSize = ballTransformRO.scale
        let brickSize = hitTransformRO.scale
        let ballPosX = ballPos.x - ballSize.x / 2
        let ballPosZ = ballPos.z + ballSize.z / 2
        let brickPosX = brickPos.x - brickSize.x / 2
        let brickPosZ = brickPos.z + brickSize.z / 2
        let collisionNorm: Vector3

        if (
          ballPosX + ballSize.x >= brickPosX &&
          ballPosX <= brickPosX + brickSize.x &&
          ballPosZ - ballSize.z <= brickPosZ &&
          ballPosZ >= brickPosZ - brickSize.z
        ) {
          AudioSource.getMutableOrNull(hitSound.entity).playing = true

          // HACK: Temporary disable collisions on entity that's already been hit
          CollisionFlag.deleteFrom(hitEntity)
          utils.timers.setTimeout(
            function() {
              CollisionFlag.create(hitEntity)
            },
            100
          )


          let isPaddle = PaddleFlag.getMutableOrNull(hitEntity)
          let isWall = WallFlag.getMutableOrNull(hitEntity)
          isWall ? (collisionNorm = hitEntity.normal) : (collisionNorm = collisionNormal(ballFlag as BallFlagType, ballTransformRO.position, hitEntity, hitTransformRO.position, hitTransformRO.scale))
          ballFlag.direction = reflectVector(
            ballFlag.direction,
            collisionNorm,
            isPaddle,
            isWall
          )

          // If it's a brick then remove it
          let brick = BrickFlag.getMutableOrNull(hitEntity) 
          if ( brick && !brick.removed){
            brick.removed = true
            utils.timers.setTimeout(
              function() { engine.removeEntity(hitEntity)},
              100
            )
          }
        }
      }
    }
  }
}
engine.addSystem(new CollisionDetection())

function reflectVector(
  incident: Vector3,
  normal: Vector3,
  isPaddle: boolean,
  isWall: boolean
): Vector3 {
  let dot = 2 * Vector3.dot(incident, normal)
  let reflected = incident.subtract(normal.multiplyByFloats(dot, dot, dot))

  // HACKS: Collision issues
  if (isWall) {
    if (normal.x === 1 && reflected.x < 0) reflected.x *= -1
    if (normal.x === -1 && reflected.x > 0) reflected.x *= -1
    if (normal.z === 1 && reflected.z < 0) reflected.z *= -1
    if (normal.z === -1 && reflected.z > 0) reflected.z *= -1
  }
  if (isPaddle && reflected.z <= 0) reflected.z *= -1

  // Remove shallow angles to prevent stale gameplay
  if (reflected.z >= 0 && reflected.z <= 0.25) reflected.z = 0.35
  if (reflected.z <= 0 && reflected.z >= -0.25) reflected.z = -0.35

  return Vector3.normalize(reflected)
}

function collisionNormal(ballFlag: BallFlagType, ballPositionRO: Vector3, hitEntity: Entity, hitPositionRo: Vector3, hitScaleRo: Vector3): Vector3 {
  let ballPosition = ballPositionRO
  let hitEntityPosition = hitPositionRo
  let hitEntityWidth = hitScaleRo.x
  let delta = ballPosition.subtract(hitEntityPosition)
  let normal = Vector3.create(0, 0, 1)

  // If the ball hits a paddle
  if (PaddleFlag.getMutableOrNull(hitEntity)) {
    // Paddle normal logic
    normal.x = delta.x / 2

    // If ball hits the side of the paddle
    if (delta.x <= -hitEntityWidth / 2 || delta.x >= hitEntityWidth / 2)
      normal.set(1, 0, 0)

    // Corner cases
    if (delta.x <= -hitEntityWidth / 2 && ballFlag.direction.x < 0)
      normal.set(-1, 0, 1)
    if (delta.x >= hitEntityWidth / 2 && ballFlag.direction.x > 0)
      normal.set(1, 0, 1)

    return Vector3.normalize(normal) // Normalize the vector first to maintain constant ball speed
  } else {
    if (delta.x <= -hitEntityWidth / 2 || delta.x >= hitEntityWidth / 2)
      Vector3.copyFromFloats(1, 0, 0, normal)

    // Corner cases
    if (delta.x <= -hitEntityWidth / 2 && ballFlag.direction.x < 0)
      normal.set(0, 0, 1)
    if (delta.x >= hitEntityWidth / 2 && ballFlag.direction.x > 0)
      normal.set(0, 0, 1)
  }
  return Vector3.normalize(normal)
}

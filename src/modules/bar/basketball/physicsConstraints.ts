import { Vector3 } from "@dcl/sdk/math"
import * as CANNON from 'cannon/build/cannon'

export function addPhysicsConstraints(
  world: CANNON.World,
  xParcels: number,
  yParcels: number,
  onlyWalls?: boolean
) {

  const center = Vector3.create(8, 0, 8)

  if (!onlyWalls) {
    // Create a ground plane
    const planeShape = new CANNON.Plane()
    const groundBody = new CANNON.Body({
      mass: 0, // mass == 0 makes the body static
    })
    groundBody.addShape(planeShape)
    groundBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(1, 0, 0),
      -Math.PI / 2
    ) // Reorient ground plane to be in the y-axis
    groundBody.position.y = 0.2 // Thickness of ground base model
    world.addBody(groundBody)
  }

  // Invisible walls
  //#region
  const wallShape = new CANNON.Box(new CANNON.Vec3(32, 50, 10))
  const wallNorth = new CANNON.Body({
    mass: 0,
    shape: wallShape,
    position: new CANNON.Vec3(center.x, center.y + 25, center.z + 10),
  })
  world.addBody(wallNorth)

  const wallSouth = new CANNON.Body({
    mass: 0,
    shape: wallShape,
    position: new CANNON.Vec3(center.x, center.y + 25, center.z - 10),
  })
  world.addBody(wallSouth)

  const wallEast = new CANNON.Body({
    mass: 0,
    shape: wallShape,
    position: new CANNON.Vec3(center.x + 6, center.y + 25, center.z),
  })
  wallEast.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2)
  world.addBody(wallEast)

  const wallWest = new CANNON.Body({
    mass: 0,
    shape: wallShape,
    position: new CANNON.Vec3(center.x - 6, center.y + 25, center.z),
  })
  wallWest.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2)
  world.addBody(wallWest)
  //#endregion
}

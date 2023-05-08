import { Transform } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { NoArgCallBack } from '../lobby/resources/globals'


export class TriggerBox {
  active: boolean = true
  sizeX: number = 1
  sizeY: number = 1
  sizeZ: number = 1
  visible: boolean = false
  position: Vector3 = Vector3.create()

  areaXMin: number = 0
  areaXMax: number = 0

  areaYMin: number = 0
  areaYMax: number = 0

  areaZMin: number = 0
  areaZMax: number = 0

  callback:NoArgCallBack

  constructor(_pos: Vector3, _size: Vector3, _callback:NoArgCallBack) {
    

    this.callback = _callback

    this.position = _pos //copyFrom(_pos)
    this.sizeX = _size.x
    this.sizeY = _size.y
    this.sizeZ = _size.z

    this.areaXMin = _pos.x - this.sizeX / 2
    this.areaXMax = _pos.x + this.sizeX / 2

    this.areaYMin = _pos.y
    this.areaYMax = _pos.y + this.sizeY

    this.areaZMin = _pos.z - this.sizeZ / 2
    this.areaZMax = _pos.z + this.sizeZ / 2

    Transform.create(this, {
        position: _pos,
        scale: Vector3.create(this.sizeX, this.sizeY, this.sizeZ),
    })
  }

  updatePosition() {
    this.position = Transform.getMutable(this).position

    this.areaXMin = this.position.x - this.sizeX / 2
    this.areaXMax = this.position.x + this.sizeX / 2

    this.areaYMin = this.position.y
    this.areaYMax = this.position.y + this.sizeY

    this.areaZMin = this.position.z - this.sizeZ / 2
    this.areaZMax = this.position.z + this.sizeZ / 2
  }

  collide(pos: Vector3, _delayed?:boolean): boolean {
    //log("check collide: " + pos + " - " + this.position)
    const worldPos = Transform.getMutable(this).position

    if (
      pos.x > this.areaXMin &&
      pos.x < this.areaXMax &&
      pos.y > this.areaYMin &&
      pos.y < this.areaYMax &&
      pos.z > this.areaZMin &&
      pos.z < this.areaZMax
    ) {      
        //log("Box Zone Triggered!")        
        if(!_delayed){
          this.fire()
        }        
        return true
      
    } else {
      
      return false
    }
  }

  fire(){
    if(this.active){
      this.callback()
    }
  }
}
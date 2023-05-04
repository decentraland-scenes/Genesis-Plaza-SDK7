import { EventMenuItem } from "./menuItemEvent";
import { getEvents } from "./checkApi";
import { MenuItem } from "./menuItem";
import * as sfx from './resources/sounds'
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { AudioSource, ColliderLayer, Entity, GltfContainer, InputAction, MeshCollider, MeshRenderer, Transform, VisibilityComponent, engine, pointerEventsSystem } from "@dcl/sdk/ecs";
import * as resource from "./resources/resources"
import { AnimatedItem, SlerpItem } from "./simpleAnimator";



export class EventMenu {
    items:EventMenuItem[]
    itemRoots:Entity[]
    clickBoxes:Entity[]
    currentItem: number = 0
    menuRoot:Entity
    audioRoot:Entity
    spacing:number
    angleSpacing:number
    scrollerRoot:Entity
    radius:number
    scrollLeftButton:Entity
    scrollRightButton:Entity
    scrollTarget:Quaternion
    visibleItems:number

    constructor(_position:Vector3){
        this.spacing = 3.3
        this.angleSpacing = 12
        this.items = []
        this.itemRoots = []
        this.clickBoxes = []
        this.radius = 16
        this.visibleItems = 8

        this.menuRoot = engine.addEntity()
        Transform.create(this.menuRoot, {
            position: Vector3.create(_position.x, _position.y, _position.z),
          //parent: engine.PlayerEntity
        })

        this.scrollerRoot = engine.addEntity()
        Transform.create(this.scrollerRoot, {
            position: Vector3.create(0,0,0),
            parent:this.menuRoot
        })

        let menuCenter = Transform.get(this.menuRoot).position
        let angle = -this.angleSpacing *0.8
        let rotatedPosVector =  Vector3.rotate(Vector3.scale(Vector3.Forward(), this.radius*0.99), Quaternion.fromEulerDegrees(0,angle,0))
        rotatedPosVector.y = -1.1
        
        //scroll left
        this.scrollLeftButton = engine.addEntity()
        Transform.create(this.scrollLeftButton, {
          position: rotatedPosVector,
          rotation: Quaternion.fromEulerDegrees(0, angle,0),
          parent: this.menuRoot
        })
        GltfContainer.createOrReplace(this.scrollLeftButton, resource.menuArrowShape ) 
        MeshCollider.setBox(this.scrollLeftButton)
        pointerEventsSystem.onPointerDown(this.scrollLeftButton,
          (e) => {
             this.scroll(true) 
          },
          { hoverText: 'SCROLL LEFT', button: InputAction.IA_POINTER }
        )   



        //scroll right
        angle = this.angleSpacing*0.8
        rotatedPosVector =  Vector3.rotate(Vector3.scale(Vector3.Forward(), this.radius*0.99), Quaternion.fromEulerDegrees(0,angle,0))
        rotatedPosVector.y = -1.1
        this.scrollRightButton = engine.addEntity()
        Transform.create(this.scrollRightButton, {
          position: rotatedPosVector,
          rotation: Quaternion.fromEulerDegrees(0, angle,0),
          scale: Vector3.create(-1,1,1),
          parent: this.menuRoot
        })
        //MeshRenderer.setBox(this.scrollRightButton)
        GltfContainer.createOrReplace(this.scrollRightButton, resource.menuArrowShape ) 
        MeshCollider.setBox(this.scrollRightButton)
        pointerEventsSystem.onPointerDown(this.scrollRightButton,
          (e) => {
             this.scroll(false) 
          },
          { hoverText: 'SCROLL RIGHT', button: InputAction.IA_POINTER }
        )   
         
        this.scrollTarget = Transform.get(this.scrollerRoot).rotation

        this.audioRoot = engine.addEntity()
        Transform.create(this.audioRoot, {
          position: Vector3.scale(Vector3.Forward(), this.radius),          
          parent: this.menuRoot
        })

    }

    selectItem(_itemID: number, _silent:boolean) {

        this.deselectAll()
        this.items[_itemID].select(_silent)
        //if(_id < this.items.length){
        // this.items[_id].select()
        // if (AnimatedItem.getMutableOrNull(_item.entity) != null) {
        //   if (!_item.selected) {
        //     this.deselectAll()
        //     _item.getComponent(AnimatedItem).activate()
        //     _item.select()
        //   }
        // } else {
        //   _item.select()
        // }
        const transformClickBox = Transform.getMutable(this.clickBoxes[_itemID])
      transformClickBox.scale.y = 1.58
      transformClickBox.position.y = -0.25
    }

    deselectItem(_itemID: number, _silent: boolean) {
      
     
      this.items[_itemID].deselect(_silent)
      const transformClickBox = Transform.getMutable(this.clickBoxes[_itemID])
      transformClickBox.scale.y = 0.8
      transformClickBox.position.y = 0
    }

    deselectAll() {
      for (let i = 0; i < this.items.length; i++) {          
        //this.items[i].deselect()          
        this.deselectItem(i, true)
        //this.clickBoxes[i].getComponent(OnPointerDown).hoverText = 'SELECT'
      }
    }

    hideItem(_itemID:number){
      this.items[_itemID].hide()      
      MeshCollider.getMutable(this.clickBoxes[_itemID]).collisionMask = 0     
    }
    showItem(_itemID:number){
      this.items[_itemID].show()   
      MeshCollider.getMutable(this.clickBoxes[_itemID]).collisionMask =  ColliderLayer.CL_PHYSICS | ColliderLayer.CL_POINTER   
    }

    scroll(left:boolean){      
        
        let angle = this.angleSpacing


        if(!left){
          angle = -this.angleSpacing

          if (this.currentItem < this.items.length - 1) {
            this.deselectAll()
            this.currentItem += 1
            this.selectItem(this.currentItem, true)

            if(this.currentItem >= this.visibleItems/2){    
              this.hideItem(Math.floor(this.currentItem - this.visibleItems/2))
            }    

            if(this.currentItem + this.visibleItems/2 -1 < this.items.length - 1){
              this.showItem(this.currentItem + this.visibleItems/2 -1)           
            }

            
            

            let transform = Transform.getMutable(this.scrollerRoot)          
            this.scrollTarget = Quaternion.multiply(this.scrollTarget, Quaternion.fromEulerDegrees(0,angle,0))      
            
            SlerpItem.createOrReplace(this.scrollerRoot, {
              targetRotation:this.scrollTarget
            })    
            this.playAudio(sfx.menuUpSource, sfx.menuUpSourceVolume)
            
          
          }
          else{
            this.playAudio(sfx.menuScrollEndSource, sfx.menuDeselectSourceVolume)
          }
          
        }
        else{        
          if (this.currentItem > 0) {
            this.deselectAll()
            this.currentItem -= 1
            this.selectItem(this.currentItem, true)

            for(let i=0; i <  this.visibleItems/2; i++){
              if(this.currentItem - i > 1){
                this.showItem(this.currentItem - i)           
              }
            }

            // if(this.currentItem + this.visibleItems/2 < this.items.length - 1){
            //   this.hideItem(this.currentItem + 2)           
            // }

            if(Math.floor(this.currentItem - this.visibleItems/2 + 1) > 1){    
              this.showItem(Math.floor(this.currentItem - this.visibleItems/2 + 1 ))
            }    

            if(this.currentItem + this.visibleItems/2 < this.items.length - 1){
              this.hideItem(this.currentItem + this.visibleItems/2)           
            }

            let transform = Transform.getMutable(this.scrollerRoot)          
            this.scrollTarget = Quaternion.multiply(this.scrollTarget, Quaternion.fromEulerDegrees(0,angle,0))      
            
            SlerpItem.createOrReplace(this.scrollerRoot, {
              targetRotation:this.scrollTarget
            })                

            this.playAudio(sfx.menuDownSource, sfx.menuDownSourceVolume)
          }
          else{
            this.playAudio(sfx.menuScrollEndSource, sfx.menuDeselectSourceVolume)
          }
        }

        
        
    }
    
    
    addMenuItem(_item: EventMenuItem) {

        let menuCenter = Transform.get(this.menuRoot).position
        let angle = this.items.length * this.angleSpacing
        let rotatedPosVector =  Vector3.rotate(Vector3.scale(Vector3.Forward(), this.radius), Quaternion.fromEulerDegrees(0,angle,0))

        //let pos = Vector3.add(menuCenter, rotatedPosVector)
        rotatedPosVector.y = 0

        console.log("menuCenter: " + menuCenter.x +", " + menuCenter.y + ", " + menuCenter.z)
        //console.log("card Position: " + + pos.x +", " + pos.y + ", " + pos.z)
        let itemRoot = engine.addEntity()
        Transform.create(itemRoot, {
          //  position: Vector3.create(this.items.length * this.spacing, 0, 0),
            position: rotatedPosVector,
            rotation: Quaternion.fromEulerDegrees(0, angle,0),
            parent: this.scrollerRoot
        }) 
        //VisibilityComponent.create(_item.entity, {visible: false})
        this.itemRoots.push(itemRoot)        
          

        // COLLIDER BOX FOR USER INPUT
        let clickBox = engine.addEntity()
        Transform.create(clickBox,{
          scale: Vector3.create(1.6,0.8,0.1),
            parent: _item.entity,
        })
        //GltfContainer.create(clickBox, resource.shelfShape)
        MeshCollider.setBox(clickBox)
        let transform = Transform.getMutable(_item.entity)
        transform.parent = itemRoot       
        this.items.push(_item)
        let id= this.items.length -1
        
        pointerEventsSystem.onPointerDown(clickBox,
            (e) => {
                if (!_item.selected) {
                    this.selectItem( id, false)
                    //clickBox.getComponent(OnPointerDown).hoverText = 'DESELECT'
                    //sfx.menuSelectSource.playOnce()
                } else {
                    this.deselectItem(id, false)
                    //clickBox.getComponent(OnPointerDown).hoverText = 'SELECT'
                    //sfx.menuDeselectSource.playOnce()
                }   
            },
            { hoverText: 'SELECT', button: InputAction.IA_POINTER }
        )   
        this.clickBoxes.push(clickBox)

        
    }

    async updateEventsMenu(_count:number){

        let events = await getEvents(_count)
        if(events){
            if (events.length <= 0) {
                return
              } 
         
          for(let i=0; i < events.length; i++){
        
            if (i < this.items.length){
              this.items[i].updateItemInfo(events[i])
            }
            else{
              console.log(events[i])
              this.addMenuItem(new EventMenuItem({ 
                  position: Vector3.create(0,0,0),
                  rotation: Quaternion.Zero(),   
                  scale: Vector3.create(2,2,2)
                },        
                "images/rounded_alpha.png",
                events[i]
              ))
            }    
          }

          for(let i=0; i < this.items.length; i++){         
            
              if(i < this.visibleItems/2 ){
                //this.items[i].show()
                this.showItem(i)             
              }
              else{
                this.hideItem(i)
                //this.items[i].hide()
              }
                
            } 
            this.selectItem(0, true)
      } 
    }
    playAudio(sourceUrl:string, volume:number){
      AudioSource.createOrReplace(this.audioRoot, {
        audioClipUrl: sourceUrl,
        playing: true,
        loop:false,
        volume: volume
    })
  }
}
import { EventMenuItem } from "./menuItemEvent";
import { getBestPlaces, getEvents, getTrendingScenes } from "./checkApi";
import { MenuItem } from "./menuItem";
import * as sfx from './resources/sounds'
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { AudioSource, ColliderLayer, Entity, GltfContainer, InputAction, MeshCollider, MeshRenderer, PointerEventType, PointerEvents, Transform, VisibilityComponent, engine, inputSystem, pointerEventsSystem } from "@dcl/sdk/ecs";
import * as resource from "./resources/resources"
import { AnimatedItem, ProximityScale, SlerpItem } from "./simpleAnimator";
import { CrowdMenuItem } from "./menuItemCrowd";
import { MenuManager } from "./menuManager";
import { BestMenuItem } from "./menuItemBest";




export class HorizontalMenu {
    menuID:number
    menuManagerRef:MenuManager
    items:MenuItem[]
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
    leftHoverArrow:Entity
    rightHoverArrow:Entity
    visibleItems:number
    topFrame:Entity
    analyticParent:Entity

    constructor(_position:Vector3, _rotation:Quaternion,_analyticParent:Entity, _menuManager:MenuManager, _id:number){
      this.menuID = _id
      this.menuManagerRef = _menuManager
        this.spacing = 3.3
        this.angleSpacing = 12
        this.items = []
        this.itemRoots = []
        this.clickBoxes = []
        this.radius = 16
        this.visibleItems = 4
        this.analyticParent = _analyticParent

        //HOVER ARROWS
        //LEFT
        this.leftHoverArrow = engine.addEntity()
        Transform.createOrReplace(this.leftHoverArrow, {
          parent: this.menuRoot,
          position: Vector3.create(-0.5,-0.1,-5),
          scale: Vector3.create(0.12, 0.12, 10),          
        })      
       
        GltfContainer.create(this.leftHoverArrow,resource.hoverArrowEShape)
        VisibilityComponent.create(this.leftHoverArrow, {visible:false})

        //RIGHT
        this.rightHoverArrow = engine.addEntity()
        Transform.createOrReplace(this.rightHoverArrow, {
          parent: this.menuRoot,
          position: Vector3.create(0.5,-0.1,-5),
          scale: Vector3.create(0.12, 0.12, 10),         
        })       
        GltfContainer.create(this.rightHoverArrow,resource.hoverArrowFShape)
        VisibilityComponent.create(this.rightHoverArrow, {visible:false})

        //MENU ROOT NODE
        this.menuRoot = engine.addEntity()
        Transform.create(this.menuRoot, {
            position: Vector3.create(_position.x, _position.y, _position.z),
            rotation: _rotation
          //parent: engine.PlayerEntity
        })

        this.scrollerRoot = engine.addEntity() 
        Transform.create(this.scrollerRoot, {
            position: Vector3.create(0,0,0),
            parent:this.menuRoot
        })

         //Framing lines
        this.topFrame = engine.addEntity()
        GltfContainer.create(this.topFrame,{src:'models/lobby/menu_horizontal_bg.glb'})
        Transform.create(this.topFrame,{
            rotation: Quaternion.fromEulerDegrees(0, -126, 0),
            position: Vector3.create(0,1.25,0),
            parent: this.menuRoot
          })

        let menuCenter = Transform.get(this.menuRoot).position
        let angle = -this.angleSpacing*0.75
        let rotatedPosVector =  Vector3.rotate(Vector3.scale(Vector3.Forward(), this.radius), Quaternion.fromEulerDegrees(0,angle,0))
        rotatedPosVector.y = 1.8
        
        //scroll left button
        this.scrollLeftButton = engine.addEntity()
        Transform.create(this.scrollLeftButton, {
          position: rotatedPosVector,
          rotation: Quaternion.fromEulerDegrees(0, angle,0),
          parent: this.menuRoot
        })
        GltfContainer.createOrReplace(this.scrollLeftButton, resource.menuArrowShape ) 
        MeshCollider.setBox(this.scrollLeftButton)

        pointerEventsSystem.onPointerDown(
          {
            entity:this.scrollLeftButton,
            opts: { hoverText: 'SCROLL LEFT', button: InputAction.IA_POINTER }
          },
          (e) => {
            this.scroll(true) 
          }
        )

        //scroll right
        angle = this.visibleItems* this.angleSpacing - this.angleSpacing/4
        rotatedPosVector =  Vector3.rotate(Vector3.scale(Vector3.Forward(), this.radius), Quaternion.fromEulerDegrees(0,angle,0))
        rotatedPosVector.y = 1.8
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

        pointerEventsSystem.onPointerDown(
          {
            entity:this.scrollRightButton,
            opts: { hoverText: 'SCROLL RIGHT', button: InputAction.IA_POINTER }
          },
          (e) => {
            this.scroll(false) 
          }
        ) 
         
        this.scrollTarget = Transform.get(this.scrollerRoot).rotation

        this.audioRoot = engine.addEntity()
        Transform.create(this.audioRoot, {
          position: Vector3.scale(Vector3.Forward(), this.radius),          
          parent: this.menuRoot
        })

    }

    setHover(itemEntity:Entity){

      this.endHover()
      Transform.getMutable(this.leftHoverArrow).parent = itemEntity

      //if(this.clickBoxes.indexOf(itemEntity) != 0){
      if(this.currentItem > 0){
        VisibilityComponent.getMutable(this.leftHoverArrow).visible = true
      }
      

      Transform.getMutable(this.rightHoverArrow).parent = itemEntity
     // if(this.clickBoxes.indexOf(itemEntity) != this.clickBoxes.length-1){
      if(this.currentItem < this.items.length - this.visibleItems){
        VisibilityComponent.getMutable(this.rightHoverArrow).visible = true
      }
      
    }

    endHover(){
      this.hideHoverLeft()
      this.hideHoverRight()
    }
    hideHoverLeft(){
      VisibilityComponent.getMutable(this.leftHoverArrow).visible = false
    }
    hideHoverRight(){
      VisibilityComponent.getMutable(this.rightHoverArrow).visible = false
    }

    selectItem(_itemID: number, _silent:boolean) {

        this.deselectAll()
        this.menuManagerRef.deselectAllMenusExceptID(this.menuID)
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
        // const transformClickBox = Transform.getMutable(this.clickBoxes[_itemID])
        // transformClickBox.scale.y = 1.58
        // transformClickBox.position.y = -0.25
    }

    deselectItem(_itemID: number, _silent: boolean) {
      
     
      this.items[_itemID].deselect(_silent)
      // const transformClickBox = Transform.getMutable(this.clickBoxes[_itemID])
      // transformClickBox.scale.y = 0.8
      // transformClickBox.position.y = 0
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

        // SCROLL RIGHT
        if(!left){
          angle = -this.angleSpacing

          if (this.currentItem < this.items.length - this.visibleItems) {
            this.deselectAll()
            this.currentItem += 1
            //this.selectItem(this.currentItem, true)

            //hide the firs item on the left side
            if(this.currentItem >= 1){    
              this.hideItem(Math.floor(this.currentItem - 1))
            }    
            //show the last item at the right end
            if(this.currentItem + this.visibleItems -1 < this.items.length){
              this.showItem(this.currentItem + this.visibleItems -1)           
            }   
            //start the smooth rotation of the parent with one unit
            this.scrollTarget = Quaternion.multiply(this.scrollTarget, Quaternion.fromEulerDegrees(0,angle,0))                 
            SlerpItem.createOrReplace(this.scrollerRoot, {
              targetRotation:this.scrollTarget,
              
            })    
            this.playAudio(sfx.menuUpSource, sfx.menuUpSourceVolume)        
            
            this.endHover()
          }
          else{
            this.playAudio(sfx.menuScrollEndSource, sfx.menuDeselectSourceVolume)
            //this.hideHoverRight()
          }
          
        }
        //SCROLL LEFT
        else{        
          if (this.currentItem > 0) {
            this.deselectAll()
            this.currentItem -= 1
           // this.selectItem(this.currentItem, true)            

           // show the first item on the left end
            if(Math.floor(this.currentItem ) >= 0){    
              this.showItem(this.currentItem  )
            }    
            // hide the last item on the right end
            if(this.currentItem + this.visibleItems < this.items.length){
              this.hideItem(this.currentItem + this.visibleItems)           
            }
         
            this.scrollTarget = Quaternion.multiply(this.scrollTarget, Quaternion.fromEulerDegrees(0,angle,0))      
            SlerpItem.createOrReplace(this.scrollerRoot, {
              targetRotation:this.scrollTarget
            })
            this.playAudio(sfx.menuDownSource, sfx.menuDownSourceVolume)

            this.endHover()
          }
          else{
            this.playAudio(sfx.menuScrollEndSource, sfx.menuDeselectSourceVolume)
           // this.hideHoverLeft()
          }
        }        
    }
    
    
    addMenuItem(_item: MenuItem) {

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
          
        //ProximityScale.create(_item.entity, {activeRadius: 10})
        // COLLIDER BOX FOR USER INPUT
        let clickBox = engine.addEntity()
        Transform.create(clickBox,{
          position: Vector3.create(0,1.65,0),
          scale: Vector3.create(3,3.3,0.02),
            parent: _item.entity,
        })
        //GltfContainer.create(clickBox, resource.shelfShape)
        MeshCollider.setBox(clickBox)
        let transform = Transform.getMutable(_item.entity)
        transform.parent = itemRoot       
        this.items.push(_item)
        let id = this.items.length -1

        PointerEvents.create(clickBox, {
          pointerEvents: [
            {
              eventInfo: { button: InputAction.IA_POINTER, maxDistance: 14 },
              eventType: PointerEventType.PET_HOVER_ENTER
            },
            {
              eventInfo: { button: InputAction.IA_POINTER, maxDistance: 100 },
              eventType: PointerEventType.PET_HOVER_LEAVE
            },    
    
          ]
        })        
    
        pointerEventsSystem.onPointerDown(
          {
            entity:clickBox,
            opts: { hoverText: 'SELECT', button:InputAction.IA_ANY, maxDistance: 14}
          },
          (e) => {
            if(e.button == InputAction.IA_POINTER){
              if (!_item.selected) {
                this.selectItem( id, false)
                //clickBox.getComponent(OnPointerDown).hoverText = 'DESELECT'
                //sfx.menuSelectSource.playOnce()
            } else {
                this.deselectItem(id, false)
                //clickBox.getComponent(OnPointerDown).hoverText = 'SELECT'
                //sfx.menuDeselectSource.playOnce()
            }   
            }
            if(e.button == InputAction.IA_PRIMARY){
              this.scroll(true)
              //this.endHover()
            }
            if(e.button == InputAction.IA_SECONDARY){
              this.scroll(false)
              //this.endHover()
            }
              
          }
        ) 
        this.clickBoxes.push(clickBox)
        

        
    }

    async updateEventsTimes(){
      for(let i=0; i < this.items.length; i++){
        this.items[i].updateItemTime()
      }
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
                this.analyticParent,
                events[i]
              ))
            }    
          }

          for(let i=0; i < this.items.length; i++){         
            
              if(i < this.visibleItems ){
                //this.items[i].show()
                this.showItem(i)             
              }
              else{
                this.hideItem(i)
                //this.items[i].hide()
              }
                
            } 
            //this.selectItem(0, true)
      } 
    }

    async updateCrowdsMenu(_count:number){

      let scenes = await getTrendingScenes(10)
      console.log("CROWD SCENES:    " + scenes)
      if(scenes){
        
        if (scenes.length <= 0) {          
          return
        }
      
       
       // console.log("scene:length: " + scenes.length)
        console.log("items:length: " + this.items.length)   
        console.log("scenes:length: " + scenes.length)   

        for(let i=0; i < scenes.length; i++){
          
          if (i < this.items.length){        
           
            this.items[i].updateItemInfo(scenes[i])
          }
          else{
           // console.log("UPDATING IMAGE FROM URL: " + scenes[i].thumbnail + " - " +  scenes[i].name)
           // console.log(scenes[i])
            
            this.addMenuItem(new CrowdMenuItem({ 
                position: Vector3.create(0,0,0),
                rotation: Quaternion.Zero(),   
                scale: Vector3.create(2,2,2)
              },        
              "images/rounded_alpha.png",
              this.analyticParent,
              scenes[i]
            ))
            
          }    
        }

        for(let i=0; i < this.items.length; i++){         
          
            if(i < this.visibleItems ){
              //this.items[i].show()
              this.showItem(i)             
            }
            else{
              this.hideItem(i)
              //this.items[i].hide()
            }
              
          } 
          //this.selectItem(0, true)
     } 
    
  }
  async updateBestMenu(_count:number){

    let scenes = await getBestPlaces(10)
    console.log("Best  "+ scenes.length + "  SCENES:    " + scenes)
    if(scenes){
      if (scenes.length <= 0) {
        console.log("NO BEST")
        return
      }
    
     
     // console.log("scene:length: " + scenes.length)
      console.log("best items:length: " + this.items.length)   
      for(let i=0; i < scenes.length; i++){
        console.log("imageURL:  " + scenes[i].image)
        if (i < this.items.length){                 
          this.items[i].updateItemInfo(scenes[i])
        }
        else{
         
         // console.log(scenes[i])
          console.log("ADDING BEST SCENE")
          this.addMenuItem(new BestMenuItem({ 
              position: Vector3.create(0,0,0),
              rotation: Quaternion.Zero(),   
              scale: Vector3.create(2,2,2)
            },        
            "images/rounded_alpha.png",
            this.analyticParent,
            scenes[i]
          ))
          
        }    
      }

      for(let i=0; i < this.items.length; i++){         
        
          if(i < this.visibleItems ){
            //this.items[i].show() 
            this.showItem(i)             
          }
          else{
            this.hideItem(i)
            //this.items[i].hide()
          }
            
        } 
        //this.selectItem(0, true)
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

  update(dt:number){
    for (let item of this.clickBoxes) {

      if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_HOVER_ENTER, item)) {
       console.log("HOVERING "  )
       this.setHover(item)
       //this.selectItem(this.clickBoxes.indexOf(item), false)
      }

      if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_HOVER_LEAVE, item)) {
        console.log("ENDHOVER "  )
       // this.deselectAll()
       // this.endHover(item)
        //this.setHover(this.menuRoot)
      }
      
    }
  }
}
import { ThumbnailPlane } from './subItems/thumbnail'
import { cleanString, dateToRemainingTime, eventIsSoon, monthToString, wordWrap } from './helperFunctions'
import { AnimatedItem, ProximityScale } from './simpleAnimator'
import * as resource from './resources/resources'
import { MenuItem } from './menuItem'
import * as sfx from './resources/sounds'
import { lobbyCenter } from './resources/globals'
import { getCurrentTime, getTimeStamp } from './checkApi'
import { AudioSource, Entity, GltfContainer, InputAction, TextAlignMode, TextShape, Transform, TransformType, TransformTypeWithOptionals, VisibilityComponent, engine, pointerEventsSystem } from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { liveSignShape } from './resources/resources'
import { _openExternalURL, _teleportTo } from '../back-ports/backPorts'
import { TrackingElement, generateGUID, getRegisteredAnalyticsEntity, trackAction } from '../modules/stats/analyticsComponents'
import { ANALYTICS_ELEMENTS_IDS, ANALYTICS_ELEMENTS_TYPES } from '../modules/stats/AnalyticsConfig'
import { displayEventUI, hideEventUI } from '../ui'

let dummyLiveBadge = engine.addEntity()
Transform.create(dummyLiveBadge, {
  position: Vector3.create(lobbyCenter.x, lobbyCenter.y - 20, lobbyCenter.z),
})

GltfContainer.create(dummyLiveBadge, { 
	src: resource.liveSignShape.src 
})

//const clickableGroup = engine.getComponentGroup(ClickableItem, Transform)

export class EventMenuItem extends MenuItem {
  public thumbNail: ThumbnailPlane
  public scale: Vector3
  public scaleMultiplier: number

  entity:Entity
  
  itemBox: Entity
  title: Entity  
  leftDetailsRoot: Entity
  dateRoot: Entity
  dateMonthRoot: Entity
  dateBG: Entity
  date: Date
  live: boolean
  liveSign: Entity  
  detailsRoot: Entity
  jumpInButton: Entity  
  jumpButtonText: Entity
  //detailText: Entity
  //detailTextPanel: Entity
  highlightRays: Entity
  highlightFrame: Entity
  //detailEventTitle: Entity
  readMoreButton: Entity
  coordsPanel: Entity
  coords: Entity  
  timePanel: Entity
  startTime: Entity  
  remainingTimeRoot:Entity
  event: any


  constructor(
    _transform: TransformType,
    _alphaTexture: string,
    analyticParent: Entity,
    _event: any
  ) {
    super()
    this.entity = engine.addEntity()
    Transform.create(this.entity,_transform)
   
    this.event = _event

    // event card root
    this.itemBox = engine.addEntity()
    Transform.create(this.itemBox, {
      position: Vector3.create(0, 0, 0),
      scale: Vector3.create(1, 1, 1),
    })    
    GltfContainer.createOrReplace(this.itemBox, resource.menuTitleBGShape )    
    VisibilityComponent.create(this.itemBox, {visible: true})
    Transform.getMutable(this.itemBox).parent = this.entity
    

    TrackingElement.create(this.itemBox, 
      {
        guid: generateGUID(),
        elementType: ANALYTICS_ELEMENTS_TYPES.interactable, 
        elementId: ANALYTICS_ELEMENTS_IDS.menuEventSlider,
        parent: analyticParent
    })


    this.defaultItemScale = Vector3.create(2, 2, 2)
    this.scale = Vector3.create(1, 0.5, 1)
    this.scaleMultiplier = 1.2

    
    this.thumbNail = new ThumbnailPlane(
      _event.image,
      {
        position: Vector3.create(0.25, 0.27, 0),
        rotation: Quaternion.Zero(),
        scale: Vector3.create(1.1, 0.55, 1),
        parent: this.entity
      },
      _alphaTexture
    )  
       

    this.leftDetailsRoot = engine.addEntity()
    
    Transform.create( this.leftDetailsRoot, {      
        position: Vector3.create(-0.32, 0.28, -0.02),
        rotation: Quaternion.Zero(),
        scale: Vector3.create(0.9, 0.9, 0.9),    
        parent: this.itemBox  
    })    

    // LIVE SIGN
    this.live = _event.live
    this.liveSign = engine.addEntity()

    Transform.create(this.liveSign, {
      position: Vector3.create(-0.25, 0, 0),
      scale: Vector3.create(0.5, 0.5, 0.5),
    })   
    VisibilityComponent.create(this.liveSign, {visible: true})
    GltfContainer.createOrReplace(this.liveSign, resource.liveSignShape )   
    
    // TextShape.create(this.liveSign,{
    //   text:"",
    //   fontSize: 3})    
    // this.liveText.fontSize = 3
    // this.liveText.color = Color3.Green()    
   
    this.dateBG = engine.addEntity()
    Transform.create(this.dateBG, {
      position: Vector3.create(-0.25, 0, 0),
      scale: Vector3.create(0.4, 0.4, 0.4),
    })       
    VisibilityComponent.create(this.dateBG, {visible: true})
    GltfContainer.createOrReplace(this.dateBG, resource.dateBGShape)    


    this.date = new Date(_event.next_start_at)

    this.dateRoot = engine.addEntity()
    Transform.create(this.dateRoot, {
      position: Vector3.create(0, -0.15, -0.05),
      parent: this.dateBG
    })       

    this.dateMonthRoot = engine.addEntity()
    Transform.create(this.dateMonthRoot, {
      position: Vector3.create(0, 0.25, -0.05),
      parent: this.dateBG
    })   
    VisibilityComponent.create(this.dateMonthRoot, {visible: true})

    TextShape.create(this.dateRoot, {
      text:this.date.getDate().toString(),
      fontSize:5,
      textColor: resource.dateDayColor,
      outlineColor: resource.dateDayColor,
      outlineWidth: 0.2,      
    })
    VisibilityComponent.create(this.dateRoot, {visible: true})
    TextShape.create(this.dateMonthRoot, {
      text: monthToString(this.date.getMonth()).toUpperCase(),
      fontSize:3,
      textColor: resource.dateMonthColor,      
      outlineColor: resource.dateMonthColor, 
      outlineWidth: 0.2     
    })   

    
    Transform.getMutable( this.liveSign).parent = this.leftDetailsRoot
    Transform.getMutable( this.dateBG).parent = this.leftDetailsRoot

    if (this.live) {
      //show live badge      
      VisibilityComponent.getMutable(this.liveSign).visible = true
      VisibilityComponent.getMutable(this.dateBG).visible = false
      VisibilityComponent.getMutable(this.dateMonthRoot).visible = false
      VisibilityComponent.getMutable(this.dateRoot).visible = false
    } else {
      // show calendar panel
      VisibilityComponent.getMutable(this.liveSign).visible = false
      VisibilityComponent.getMutable(this.dateBG).visible = true
      VisibilityComponent.getMutable(this.dateMonthRoot).visible = true
      VisibilityComponent.getMutable(this.dateRoot).visible = true
    }

    // remaining time
    this.remainingTimeRoot = engine.addEntity()
    Transform.create(this.remainingTimeRoot, {
      position: Vector3.create(0, -0.65, 0.05),
      scale: Vector3.create(1.2, 1.2, 1.5),
      parent: this.dateBG
    })   
    GltfContainer.create(this.remainingTimeRoot, resource.remainingBGShape)
    VisibilityComponent.create(this.remainingTimeRoot, {visible: true})   

    TextShape.create(this.remainingTimeRoot, {
      //text: monthToString(this.date.getMonth()).toUpperCase(),
      text: dateToRemainingTime(this.event.next_start_at),
      fontSize:1,
      textColor: resource.remainingWhite,      
      outlineColor: resource.remainingWhite, 
      outlineWidth: 0.2     
    })

    if( eventIsSoon(this.event.next_start_at)){
      let textMutable = TextShape.getMutable(this.remainingTimeRoot)
      textMutable.textColor = resource.remainingRed     
      textMutable.outlineColor= resource.remainingRed 
    }

    AnimatedItem.create(this.remainingTimeRoot, {
      wasClicked:false,
      isHighlighted:false,
      defaultPosition: Vector3.create(0, -0.65, 0.05),
      highlightPosition: Vector3.create(0, -0.65, -0.05),
      defaultScale: Vector3.create(1.0, 1.0, 1.5),
      highlightScale: Vector3.create(1.6, 1.6, 1.5),
      animFraction: 0,
      animVeclocity: 0,
      speed: 0.5,
      done: false
    })    

    // main root animation states
    AnimatedItem.create(this.entity, {
      wasClicked:false,
      isHighlighted:false,
      defaultPosition: _transform.position,
      highlightPosition: Vector3.create(_transform.position.x,_transform.position.y, _transform.position.z-0.6),
      defaultScale: Vector3.create(
        this.defaultItemScale.x,
        this.defaultItemScale.y,
        this.defaultItemScale.z
      ),
      highlightScale: Vector3.create(2.3, 2.3, 2.3),
      animFraction: 0,
      animVeclocity: 0,
      speed: 0.5,
      done: false
    })    

    // DETAILS APPEARING ON SELECTION EVENT
    this.detailsRoot = engine.addEntity()

    Transform.create(this.detailsRoot, {
      parent: this.entity
    })   

    this.timePanel = engine.addEntity()
    Transform.create(this.timePanel, {
      position: Vector3.create(-0.4, 0, -0.2),
      rotation: Quaternion.fromEulerDegrees(0, 0, 0),
      parent: this.remainingTimeRoot
    })
    GltfContainer.createOrReplace(this.timePanel, resource.timePanelShape)    

    AnimatedItem.create(this.timePanel, {
      wasClicked:false,
      isHighlighted:false,
      defaultPosition: Vector3.create(0, 0.0, 0.1),
      highlightPosition: Vector3.create(-0.8, 0.4, 0.15),
      defaultScale: Vector3.create(0, 0, 0),
      highlightScale:  Vector3.create(1, 1, 0.9),
      animFraction: 0,
      animVeclocity: 0,
      speed: 0.5,
      done: false
    })   

    this.startTime = engine.addEntity()

    Transform.create(this.startTime, {
      scale: Vector3.create(0.1, 0.1, 0.1),
      parent: this.timePanel
    })
    TextShape.create(this.startTime, {
      text: _event.next_start_at.substring(11, 16) + '\nUTC',
      outlineColor: resource.remainingWhite,
      outlineWidth: 0.1

    })
    
    //this.startTimeText.font = new Font(Fonts.SanFrancisco_Heavy)
   

    // TITLE    
    this.title = engine.addEntity()
    Transform.create(this.title, {
      position: Vector3.create(0, -0.12, -0.01),
      scale: Vector3.create(0.3, 0.3, 0.3),
      parent: this.itemBox
    })
    let rawText: string = _event.name
    //  remove non-UTF-8 characters
    rawText = cleanString(rawText)
    rawText = wordWrap(rawText, 40, 3)

    TextShape.create(this.title, {
      text: rawText,
      height: 20,
      width: 2,
      fontSize: 2,      
      textColor: Color4.White(),
      outlineColor: Color4.White(),
      outlineWidth: 0.2,
      textAlign: TextAlignMode.TAM_MIDDLE_CENTER,
    })
    VisibilityComponent.create(this.title, {visible: true})

    // -- COORDS PANEL
    this.coordsPanel = engine.addEntity()

    Transform.create(this.coordsPanel, {
      position: Vector3.create(-0.3, 0, 0),
        scale: Vector3.create(0.4, 0.4, 0.4),
        parent: this.detailsRoot
    })
    GltfContainer.create(this.coordsPanel, resource.coordsPanelShape)
    AnimatedItem.create(this.coordsPanel, {
      wasClicked:false,
      isHighlighted:false,
      defaultPosition: Vector3.create(0, 0.5, 0.3),
      highlightPosition: Vector3.create(-0.4, -0.25, 0),
      defaultScale:Vector3.create(0.0, 0.0, 0.0),
      highlightScale: Vector3.create(0.5, 0.5, 0.5),
      animFraction: 0,
      animVeclocity: 0,
      speed: 0.4,
      done: false
    })  

    pointerEventsSystem.onPointerDown(
      {
        entity:this.coordsPanel,
        opts: { hoverText: 'GO THERE', button: InputAction.IA_POINTER }
      },
      (e) => {
        trackAction(this.itemBox, "button_go_there", _event.coordinates[0] + ',' + _event.coordinates[1],_event.name)
        _teleportTo(_event.coordinates[0] , _event.coordinates[1])      
      }
    )

    this.coords = engine.addEntity()
    Transform.create(this.coords,{
      position: Vector3.create(0.18, -0.36, -0.05),
      scale: Vector3.create(0.18, 0.18, 0.18),
      parent: this.coordsPanel
    })  
    TextShape.create(this.coords, {
      text: _event.coordinates[0] + ',' + _event.coordinates[1],
      textColor: Color4.fromHexString('#111111FF'),
      outlineColor: Color4.fromHexString('#111111FF'),
      outlineWidth: 0.1
    })      
    

    // -- JUMP IN BUTTON
    this.jumpInButton = engine.addEntity()
    Transform.create(this.jumpInButton, {
      position: Vector3.create(0, -0.2, 0),
      scale: Vector3.create(0.4, 0.4, 0.4),
      parent: this.detailsRoot
    })
    GltfContainer.create(this.jumpInButton, resource.jumpInButtonShape)
    
    AnimatedItem.create(this.jumpInButton, {
      wasClicked:false,
      isHighlighted:false,
      defaultPosition: Vector3.create(0, 0.5, 0.5),
      highlightPosition:  Vector3.create(0.4, -0.25, 0),
      defaultScale:Vector3.create(0.0, 0.0, 0.0),
      highlightScale: Vector3.create(0.5, 0.5, 0.5),
      animFraction: 0,
      animVeclocity: 0,
      speed: 0.4,
      done: false
    })     

    this.jumpButtonText = engine.addEntity()
    Transform.create( this.jumpButtonText, {
      position: Vector3.create(0, -0.33, -0.05),
      scale: Vector3.create(0.22, 0.22, 0.22),
      parent: this.jumpInButton
    })
    TextShape.create(this.jumpButtonText, {
      text:  ' ',
      textColor: Color4.White(),
      textAlign: TextAlignMode.TAM_MIDDLE_CENTER,
      outlineColor: Color4.White(),
      outlineWidth: 0.2
    })      

    if (this.live) {
      TextShape.getMutable(this.jumpButtonText).text = 'JUMP IN'
      
      pointerEventsSystem.onPointerDown(
        {
          entity:this.jumpInButton,
          opts: { hoverText: 'JUMP IN', button: InputAction.IA_POINTER }
        },
        (e) => {
          trackAction(this.itemBox, "button_jump_in", _event.coordinates[0] + ',' + _event.coordinates[1],_event.name)
          _teleportTo(_event.coordinates[0] , _event.coordinates[1])      
        }
      )
    } 
    else {
      TextShape.getMutable(this.jumpButtonText).text = 'SIGN UP'

      pointerEventsSystem.onPointerDown(
        {
          entity:this.jumpInButton,
          opts: { hoverText: 'CHECK EVENT PAGE', button: InputAction.IA_POINTER }
        },
        async (e) => {
          const url = 'https://events.decentraland.org/en/?event='
          trackAction(this.itemBox, "button_check_event_page", url, _event.name)
          _openExternalURL(
             url + _event.id
          )    
        }
      )
      
    }

    // EVENT DETAILS TEXT PANEL
    // this.detailTextPanel = engine.addEntity()
    // Transform.create(this.detailTextPanel, {
    //   position: Vector3.create(0, 0, 0.2),
    //     scale: Vector3.create(0.8, 0.8, 0),
    //     rotation: Quaternion.fromEulerDegrees(0, 0, 0),
    //     parent: this.detailsRoot
    // })
    // GltfContainer.create(this.detailTextPanel, resource.detailsBGShape)    
    // VisibilityComponent.create(this.detailTextPanel, {visible: true})
    // AnimatedItem.create(this.detailTextPanel, {
    //   wasClicked:false,
    //   isHighlighted:false,
    //   defaultPosition:  Vector3.create(0, 0, 0.02),
    //   highlightPosition:  Vector3.create(0, -0.35, 0.02),
    //   defaultScale: Vector3.create(0.98, 0, 0),
    //   highlightScale:  Vector3.create(1, 1, 1),
    //   animFraction: 0,
    //   animVeclocity: 0,
    //   speed: 0.6,
    //   done: false
    // }) 

    // EVENT DETAILS TITLE
    // this.detailEventTitle = engine.addEntity()
    // Transform.create(this.detailEventTitle, {
    //   position: Vector3.create(0.1, 0.55, 0),
    //   scale: Vector3.create(0.3, 0.3, 0.3),
    //   parent: this.detailTextPanel
    // })
    // TextShape.create(this.detailEventTitle, {
    //   text: wordWrap(cleanString(_event.name), 45, 3),
    //   height: 20,
    //   width: 2,
    //   fontSize: 2,
    //   textColor: Color4.Black(),
    //   textAlign: TextAlignMode.TAM_TOP_LEFT,
    //   outlineColor: Color4.Black(),
    //   outlineWidth: 0.2
    // })
   
    
 // EVENT DETAILS TEXT BODY
    // this.detailText = engine.addEntity()
    // Transform.create(this.detailText, {
    //   position: Vector3.create(-0.70, 0.15, -0.02),
    //     scale: Vector3.create(0.4, 0.4, 0.4),
    //     parent: this.detailTextPanel
    // })
    // TextShape.create(this.detailText, {
    //   text:  '\n\n' + wordWrap(cleanString(_event.description), 70, 7) + '</cspace>',
    //   fontSize: 1,
    //   height: 20,
    //   width: 2,
    //   textColor: Color4.fromHexString("#111111FF"),
    //   textAlign: TextAlignMode.TAM_TOP_LEFT,
    //   lineSpacing: 0,
    //   outlineColor: Color4.fromHexString("#111111FF"),
    //   outlineWidth: 0.3
    // })   

    // //READ MORE details website button
    // this.readMoreButton = engine.addEntity()
    // Transform.create(this.readMoreButton, {
    //   position: Vector3.create(-0.58, -0.33, -0.05),
    //   parent: this.detailTextPanel
    // })    
    // GltfContainer.create(this.readMoreButton, resource.readMoreBtnShape) 
    
    // pointerEventsSystem.onPointerDown(
    //   {
    //     entity:this.readMoreButton,
    //     opts: { hoverText: 'READ MORE', button: InputAction.IA_POINTER }
    //   },
    //   async (e) => {
    //     const url = 'https://events.decentraland.org/en/?event='
    //     trackAction(this.itemBox, "button_read_more", url, _event.name)
    //     _openExternalURL(
    //       url + _event.id
    //     )   
    //   }
    // )

    // highlights BG on selection
    this.highlightRays = engine.addEntity()
    Transform.create(this.highlightRays, {
      parent: this.detailsRoot
    })
    GltfContainer.create(this.highlightRays, resource.highlightRaysShape) 
    
    AnimatedItem.create(this.highlightRays, {
      wasClicked:false,
      isHighlighted:false,
      defaultPosition: Vector3.create(0, 0, 0.05),
      highlightPosition:  Vector3.create(0, 0, 0.05),
      defaultScale: Vector3.create(0, 0, 0),
      highlightScale:  Vector3.create(1, 1, 1),
      animFraction: 0,
      animVeclocity: 0,
      speed: 0.9,
      done: false
    })     
   

    this.highlightFrame = engine.addEntity()
    Transform.create(this.highlightFrame, {
      parent: this.highlightRays
    })
    GltfContainer.create(this.highlightFrame, resource.highlightFrameFullShape)    
    
  }

  updateItemInfo(_event: any) {
    //image
    this.thumbNail.updateImage(_event.image)

    //live or not
    this.live = _event.live
    if (this.live) {
      //add live badge
     // Transform.getMutable(this.liveSign).parent = this.leftDetailsRoot     
     VisibilityComponent.getMutable(this.liveSign).visible = true
     VisibilityComponent.getMutable(this.dateBG).visible = false 
     VisibilityComponent.getMutable(this.dateMonthRoot).visible = false 
     VisibilityComponent.getMutable(this.dateRoot).visible = false 

      //update jump in button
      TextShape.getMutable(this.jumpButtonText).text = 'JUMP IN'
     
      pointerEventsSystem.onPointerDown(
        {
          entity:this.jumpInButton,
          opts: { hoverText: 'JUMP IN', button: InputAction.IA_POINTER }
        },
        (e) => {
          trackAction(this.itemBox, "button_jump_in", _event.id, (_event.coordinates[0] + ',' + _event.coordinates[1]+":"+_event.name))
          _teleportTo(_event.coordinates[0] , _event.coordinates[1])        
        }
      )
      
      Transform.getMutable(this.dateBG).parent = engine.RootEntity
      
    } 
    else {
      // add calendar panel
      //  Transform.getMutable(this.dateBG).parent = this.leftDetailsRoot
      VisibilityComponent.getMutable(this.liveSign).visible = false
      VisibilityComponent.getMutable(this.dateBG).visible = true
       VisibilityComponent.getMutable(this.dateMonthRoot).visible = true 
     VisibilityComponent.getMutable(this.dateRoot).visible = true 

      //update jump in button to sign up button
      TextShape.getMutable(this.jumpButtonText).text = 'SIGN UP'
      
      pointerEventsSystem.onPointerDown(
        {
          entity:this.jumpInButton,
          opts: { hoverText: 'CHECK EVENT PAGE', button: InputAction.IA_POINTER }
        },
        async (e) => {
          const url = 'https://events.decentraland.org/en/?event='
          trackAction(this.itemBox, "button_check_event_page", url, _event.name)
          _openExternalURL(
            url + _event.id
          )     
        }
      )
      
      Transform.getMutable(this.liveSign).parent = engine.RootEntity
    }

    //date
    this.date = new Date(_event.next_start_at)
    TextShape.getMutable(this.dateRoot).text = this.date.getDate().toString()
    TextShape.getMutable(this.dateMonthRoot).text =  monthToString(
      this.date.getMonth()
    ).toUpperCase()

    //time
    TextShape.getMutable(this.startTime).text = _event.next_start_at.substring(11, 16) + '\nUTC'    

    //title
    let rawText: string = _event.name
    //  remove non-UTF-8 characters
    rawText = cleanString(rawText)
    rawText = wordWrap(rawText, 45, 3)

    TextShape.getMutable(this.title).text = rawText
    

    //coords
    TextShape.getMutable(this.coords).text = (_event.coordinates[0] + ',' + _event.coordinates[1])
         
    pointerEventsSystem.onPointerDown(
      {
        entity:this.coordsPanel,
        opts: { hoverText: 'GO THERE', button: InputAction.IA_POINTER }
      },
      (e) => {
        trackAction(this.itemBox, "button_go_there", _event.id, (_event.coordinates[0] + ',' + _event.coordinates[1]+":"+_event.name))
        _teleportTo(_event.coordinates[0] , _event.coordinates[1])     
      }
    )
    
    
    //detail text
    //remove non-UTF-8 characters and wrap
    //TextShape.getMutable(this.detailEventTitle).text =  wordWrap(cleanString(_event.name), 45, 3)

    //remove non-UTF-8 characters and wrap
    //TextShape.getMutable(this.detailText).text = '\n\n' + wordWrap(cleanString(_event.description), 70, 11) + '</cspace>'
    
    //details website button (read more)
    pointerEventsSystem.onPointerDown(
      {
        entity:this.readMoreButton,
        opts: { hoverText: 'READ MORE', button: InputAction.IA_POINTER }
      },
      async (e) => {
        const url = 'https://events.decentraland.org/en/?event='
        trackAction(this.itemBox, "button_read_more", url, _event.name)
        _openExternalURL(
          url + _event.id
        )    
      }
    )
    

  }
  updateItemTime(){

    TextShape.createOrReplace(this.remainingTimeRoot, {
      //text: monthToString(this.date.getMonth()).toUpperCase(),
      text: dateToRemainingTime(this.event.next_start_at),
      fontSize:1,
      textColor: resource.remainingWhite,      
      outlineColor: resource.remainingWhite, 
      outlineWidth: 0.2     
    })

    if( eventIsSoon(this.event.next_start_at) ){
      let textMutable = TextShape.getMutable(this.remainingTimeRoot)
      textMutable.textColor = resource.remainingRed     
      textMutable.outlineColor= resource.remainingRed 
    }
  }

  select(_silent:boolean) {

    let rootInfo = AnimatedItem.getMutable(this.entity)
    let jumpInButtonInfo = AnimatedItem.getMutable(this.jumpInButton)
   // let detailTextInfo = AnimatedItem.getMutable(this.detailTextPanel)
    let highlightRaysInfo = AnimatedItem.getMutable(this.highlightRays)
    let coordsPanelInfo = AnimatedItem.getMutable(this.coordsPanel)
    let timePanelInfo = AnimatedItem.getMutable(this.timePanel)
    let remainingTimeInfo = AnimatedItem.getMutable(this.remainingTimeRoot)

    if (!this.selected) {
      
      if(!_silent){
        this.playAudio(sfx.menuSelectSource, sfx.menuSelectSourceVolume)
      }

      
      trackAction(this.itemBox, "select_card", this.event.id, (this.event.coordinates[0] + ',' + this.event.coordinates[1]+":"+ this.event.name))
      
      // event UI needs fixing /word-wrapping
      //displayEventUI(this.event)
      
      this.selected = true
      rootInfo.isHighlighted = true
      rootInfo.done = false

      jumpInButtonInfo.isHighlighted = true
      jumpInButtonInfo.done = false

      //detailTextInfo.isHighlighted = true
      //detailTextInfo.done = false

      highlightRaysInfo.isHighlighted = true
      highlightRaysInfo.done = false

      coordsPanelInfo.isHighlighted = true
      coordsPanelInfo.done = false

      timePanelInfo.isHighlighted = true
      timePanelInfo.done = false      

      remainingTimeInfo.isHighlighted = true
      remainingTimeInfo.done = false      
    }
  }

  deselect(_silent?: boolean) {
    if (this.selected) {
      if(!_silent){
        this.playAudio(sfx.menuDeselectSource, sfx.menuDeselectSourceVolume)
      }
      
      this.selected = false      
    }

    //hideEventUI()

    let rootInfo = AnimatedItem.getMutable(this.entity)
    let jumpInButtonInfo = AnimatedItem.getMutable(this.jumpInButton)
    //let detailTextInfo = AnimatedItem.getMutable(this.detailTextPanel)
    let highlightRaysInfo = AnimatedItem.getMutable(this.highlightRays)
    let coordsPanelInfo = AnimatedItem.getMutable(this.coordsPanel)
    let timePanelInfo = AnimatedItem.getMutable(this.timePanel)
    let remainingTimeInfo = AnimatedItem.getMutable(this.remainingTimeRoot)

    rootInfo.isHighlighted = false
    rootInfo.done = false

    jumpInButtonInfo.isHighlighted = false
    jumpInButtonInfo.done = false

    //detailTextInfo.isHighlighted = false
    //detailTextInfo.done = false

    highlightRaysInfo.isHighlighted = false
    highlightRaysInfo.done = false

    coordsPanelInfo.isHighlighted = false
    coordsPanelInfo.done = false

    timePanelInfo.isHighlighted = false
    timePanelInfo.done = false  

    remainingTimeInfo.isHighlighted = false
    remainingTimeInfo.done = false  

    // if(!_silent){
    //     sfx.menuDeselectSource.playOnce()
    // }
  }
  
  show() {
    VisibilityComponent.getMutable(this.itemBox).visible = true
    
    if(this.live){
      VisibilityComponent.getMutable(this.liveSign).visible = true
    }else{
      VisibilityComponent.getMutable(this.dateBG).visible = true
      VisibilityComponent.getMutable(this.dateMonthRoot).visible = true
      VisibilityComponent.getMutable(this.dateRoot).visible = true
    }   


    
    VisibilityComponent.getMutable(this.remainingTimeRoot).visible = true
    VisibilityComponent.getMutable(this.title).visible = true
   // VisibilityComponent.getMutable(this.detailTextPanel).visible = true
    this.thumbNail.show()
    Transform.getMutable(this.entity).scale = Vector3.One()
  }
  hide() {
    VisibilityComponent.getMutable(this.itemBox).visible = false
    VisibilityComponent.getMutable(this.dateBG).visible = false
    VisibilityComponent.getMutable(this.liveSign).visible = false
    VisibilityComponent.getMutable(this.dateMonthRoot).visible = false
    VisibilityComponent.getMutable(this.dateRoot).visible = false
    VisibilityComponent.getMutable(this.title).visible = false
    //VisibilityComponent.getMutable(this.detailTextPanel).visible = false
    VisibilityComponent.getMutable(this.remainingTimeRoot).visible = false
    this.thumbNail.hide()
    Transform.getMutable(this.entity).scale = Vector3.Zero()
  }

  playAudio(sourceUrl:string, volume:number){
      AudioSource.createOrReplace(this.entity, {
        audioClipUrl: sourceUrl,
        playing: true,
        loop:false,
        volume: volume
    })
  }
}

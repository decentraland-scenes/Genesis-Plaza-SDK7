import { Entity, Material, MeshRenderer, PBMaterial, PBMeshRenderer_PlaneMesh, Transform, TransformType, TransformTypeWithOptionals, VisibilityComponent, engine } from "@dcl/sdk/ecs"
import { Color3, Vector3 } from "@dcl/sdk/math"

export class ThumbnailPlane {
    public entity:Entity   
    public image:string
    public alphaImage:string    
   //public visible:boolean

    constructor(_image:string, _transform:TransformType, _alphaImage:string){
        
        this.image = _image
        if(_alphaImage){
            this.alphaImage = _alphaImage
        }
        else{
            this.alphaImage = "images/rounded_alpha.png"
        }
        
        this.entity = engine.addEntity()       
        Transform.create(this.entity, {
            position: _transform.position,
            scale: _transform.scale,
            parent: _transform.parent
        })
        VisibilityComponent.create(this.entity, {visible: true})
        
        MeshRenderer.setPlane(this.entity, [
            

            0, //lower-right corner
            0,

            0, //upper-right corner
            1,

            1, //upper left-corner
            1,
            
            1, //lower-left corner
            0,

            0, //lower-right corner
            0,

            0, //upper-right corner
            1,

            1, //upper left-corner
            1,
            
            1, //lower-left corner
            0,
        ])         
        
        Material.setPbrMaterial(this.entity, {
            texture: Material.Texture.Common({
                src: _image       
            }),
            alphaTexture: Material.Texture.Common({
                src: this.alphaImage
            }),
            emissiveTexture: Material.Texture.Common({
                src: _image
            }),
            emissiveIntensity: 2,
            emissiveColor: Color3.Gray(),
            specularIntensity: 0,
            metallic: 0,
            roughness: 1
        })

        Transform.createOrReplace(this.entity, {
            position: Vector3.create(_transform.position.x, _transform.position.y, _transform.position.z),
            scale: Vector3.create(_transform.scale.x, _transform.scale.y, _transform.scale.z),
            parent: _transform.parent
        })        

    }
    updateImage(_texture:string){

        Material.setPbrMaterial(this.entity, {
            texture: Material.Texture.Common({
                src: _texture          
            }),
            alphaTexture: Material.Texture.Common({
                src: this.alphaImage
            }),
            specularIntensity: 0,
            metallic: 0,
            roughness: 1
        })

    }
    hide(){
        VisibilityComponent.getMutable(this.entity).visible = false
    }
    show(){
        VisibilityComponent.getMutable(this.entity).visible = true
    }
}
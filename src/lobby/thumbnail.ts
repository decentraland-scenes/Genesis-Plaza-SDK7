import { Entity, Material, MeshRenderer, PBMaterial, PBMeshRenderer_PlaneMesh, Transform, TransformType, TransformTypeWithOptionals, engine } from "@dcl/sdk/ecs"
import { Vector3 } from "@dcl/sdk/math"

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
            position: Vector3.create(8, 1, 8)
        })
        
        MeshRenderer.setPlane(this.entity, [
            0,0,          
            1,0,          
            1,1,          
            0,1,
          //----
            1,0,          
            0,0,
            0,1,
            1,1,
        ])         
        
        Material.setPbrMaterial(this.entity, {
            texture: Material.Texture.Common({
                src: this.image            
            }),
            alphaTexture: Material.Texture.Common({
                src: this.alphaImage
            }),
            specularIntensity: 0,
            metallic: 0,
            roughness: 1
        })

        Transform.createOrReplace(this.entity, {
            position: Vector3.create(_transform.position.x, _transform.position.y, _transform.position.z),
            scale: Vector3.create(_transform.scale.x, _transform.scale.y, _transform.scale.z)
        })        

    }
    updateImage(texture:string){

        Material.setPbrMaterial(this.entity, {
            texture: Material.Texture.Common({
                src: texture           
            }),
            alphaTexture: Material.Texture.Common({
                src: this.alphaImage
            }),
            specularIntensity: 0,
            metallic: 0,
            roughness: 1
        })

    }
}
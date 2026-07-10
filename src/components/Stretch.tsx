import { useEffect } from "react";
import { CatSprite } from "./CatSprite";
import { PixelHeart } from "./heart/Heart";

export function Stretch(){
    useEffect(()=>{
        
    },[])

    return(
        <div className="relative">
            <div className="absolute top-8 left-8">
            <PixelHeart/>
            </div>  
            <CatSprite row={43} col={1} />
        </div>
          
    )
}
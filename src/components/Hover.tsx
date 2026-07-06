import { CatSprite } from "./CatSprite";
import { PixelHeart } from "./heart/Heart";

export function Hover(){


    return(
        <div className="relative h-[192px] w-[192px]">
            <div className="absolute top-8 left-8">
            <PixelHeart/>
            </div>  
            <CatSprite row={43} col={1} />
        </div>
          
    )
}
import { CatSprite } from "./CatSprite";
import { PixelHeart } from "./heart/Heart";
import { CatSkin } from "./Settings";

export function Hover({skin} : {skin :CatSkin}){


    return(
        <div className="relative">
            <div className="absolute top-8 left-8">
            <PixelHeart/>
            </div>  
            <CatSprite skin={skin} row={43} col={1} />
        </div>
          
    )
}
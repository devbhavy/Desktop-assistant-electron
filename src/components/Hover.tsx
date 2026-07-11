import { useEffect, useState } from "react";
import { PomodoroPhase } from "../App";
import { CatSprite } from "./CatSprite";
import { PixelHeart } from "./heart/Heart";
import { CatSkin } from "./Settings";

export function Hover({skin,pomodoroPhase} : {skin :CatSkin,pomodoroPhase:PomodoroPhase}){
    const [col,setCol] = useState(0);
    useEffect(()=>{
        const int =setInterval(()=>{
            setCol((prev)=>(prev+1)%2);
        },1000)


        return ()=>clearInterval(int);

    },[])

    return(
        <div className="relative">
            <div className="absolute top-7 left-7">
            <PixelHeart/>
            </div>
            {pomodoroPhase==="focus"?<CatSprite skin={skin} row={43} col={1} />:<CatSprite skin={skin} row={44} col={col} />} 
            
        </div>
          
    )
}
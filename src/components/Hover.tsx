import { useEffect, useRef, useState } from "react";
import { PomodoroPhase } from "../App";
import { CatSprite } from "./CatSprite";
import { PixelHeart } from "./heart/Heart";
import { CatSkin } from "./Settings";
import purrSound from "../assets/audio/workspace_assets_sound_purring.m4a"

export function Hover({skin,pomodoroPhase} : {skin :CatSkin,pomodoroPhase:PomodoroPhase}){
    const [col,setCol] = useState(0);

    const purrRef = useRef(new Audio(purrSound));

    useEffect(() => {
        const audio = purrRef.current;
        audio.loop = true;
        audio.volume = 0.25;
        audio.currentTime = 0;

        audio.play().catch(() => {});

        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, []);

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
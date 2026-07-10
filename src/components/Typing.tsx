import { useEffect, useState } from "react"
import { CatSprite } from "./CatSprite";
import DotsBounceIcon from "./ui/Dot";
import { CatSkin } from "./Settings";

export function Typing({skin} : {skin :CatSkin}){

    //36 and 37
    const [row,setRow] = useState(36);
    const col = 7;

    useEffect(()=>{
        const int = setInterval(()=>setRow((prev)=>{
            if(prev==36){
                return 37
            }else{
                return 36
            }
        }),130)


        return ()=>clearInterval(int)
    },[])

    return(
        <div className="relative">
            <div className="absolute text-md bg-white top-8 left-8 rounded-2xl flex h-[20px] w-[45px] justify-center pt-[1.5px] border-2 ">
                <DotsBounceIcon/>
            </div>
            <CatSprite skin={skin} row={row} col={col}/>
        </div>
        
        
        

    )
}
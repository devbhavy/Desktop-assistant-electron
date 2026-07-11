import { useEffect, useState } from "react";
import { CatSprite } from "./CatSprite";
import { CatSkin } from "./Settings";


export function Sleeping({skin} : {skin :CatSkin}){
    
    const [col,setCol] = useState(0);
    useEffect(()=>{
        const int =setInterval(()=>{
            setCol((prev)=>(prev+1)%2);
        },1000)


        return ()=>clearInterval(int);

    },[])
    
    return(
        <CatSprite skin={skin} row={44} col={col} />
    )
    
}
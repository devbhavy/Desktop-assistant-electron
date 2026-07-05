import { useEffect, useState } from "react"
import { CatSprite } from "./CatSprite";

export function Typing(){

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
        <CatSprite row={row} col={col}/>
        
        

    )
}
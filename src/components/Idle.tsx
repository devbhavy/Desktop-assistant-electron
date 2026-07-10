import { useEffect, useMemo, useState } from "react";
import { CatSprite } from "./CatSprite";
import { CatSkin } from "./Settings";


export function Idle({skin} : {skin :CatSkin}){

    type idleSubState = "tailwag"|"lick"|"scratch_left"|"scratch_right"|"yawn";
  
    const temp : Record<idleSubState,{ x:number , y:number }> = {
     "tailwag" : {
      y:19,
      x : 5
     },"lick" : {
      y:12,
      x : 8
     },"scratch_left" : {
      y:17,
      x : 8
     },"scratch_right" : {
      y:18,
      x : 8
     },"yawn" : {
      y:43,
      x : 6
     }
    }
    
    const [subState,setSubstate] = useState<idleSubState>("tailwag")
  
    const row = useMemo(()=>temp[subState].y,[subState])
    const [col,setCol] = useState(0);
  
  
    useEffect(()=>{
      setSubstate("tailwag");
  
      const int = setInterval(()=>changeSubStateRandom(),10000);
  
  
      return ()=>clearInterval(int)
    },[])
  
    useEffect(()=>{
      setCol(0)
      
      const int = setInterval(()=>{
        setCol((prev)=>(prev+1)%temp[subState].x);
      },180)
  
      return ()=>clearInterval(int)
    },[subState])
  
    function changeSubStateRandom(){
      const index : number = Math.floor(4*Math.random());
      setSubstate(()=>{
        const filteredKeys = Object.keys(temp).filter((value,index)=>{
          if(index==0){
            return false
          }
          else{
            return true
          }
        })
        const tempSubstate :idleSubState = (filteredKeys[index]) as idleSubState
        return tempSubstate
      })
      setTimeout(()=>{
        setSubstate("tailwag")
      },3000)
    }
  
    return(
      <CatSprite skin={skin} row={row} col={col} />
    )
  }
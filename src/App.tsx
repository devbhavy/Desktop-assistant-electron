import { useEffect, useRef, useState } from "react"
import { CatSprite } from "./components/CatSprite";
import { Idle } from "./components/Idle";
import { Typing } from "./components/Typing";

export type CatSpriteProps = {
  row : number,
  col : number,
}

type currentState = "idle"|"typing"|"hover"|"holding"



function App(){

  const [data,setData] = useState("");
  const [currentState,setCurrentState] = useState<currentState>("idle");
  

  const timeout = useRef<any>();
  function doSomething(){
    clearTimeout(timeout.current)
    setCurrentState("typing");

    timeout.current = setTimeout(()=>{
      setCurrentState("idle");
    },2000)
  }

  useEffect(()=>{
    (async()=>{
      const response = await window.electronAPI.readClipboard();
      setData(response);

    })()
    
  },[])

  useEffect(() => {
    const cleanup =
      window.electronAPI.onTypingChange((typing) => {
        setCurrentState(typing)
      });

    return cleanup;
  }, []);


  async function handleClick(){
    const response = await window.electronAPI.readClipboard();
    setData(response);

  }
  

  return(
    <div style={{backgroundColor : "transparent", display : "flex", flexDirection : "column", alignItems : "center", justifyContent:'center'}}>
      <button onClick={handleClick}>Update text</button>
      <div>Text : {data}</div>
      {
        currentState=="typing"?<div>
          user is typing....!
        </div>:
        null
      }
      <button onClick={doSomething}>mimick action</button>
      {
        


        currentState=="idle"?
        <Idle/>:
        currentState == "typing"?
        <Typing/>:
        <CatSprite row={0} col={0}/>
        
      }
    </div>
  
  )
}



export default App
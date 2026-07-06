import { useEffect, useRef, useState } from "react"
import { CatSprite } from "./components/CatSprite";
import { Idle } from "./components/Idle";
import { Typing } from "./components/Typing";
import { Hover } from "./components/Hover";

export type CatSpriteProps = {
  row : number,
  col : number,
}

type currentState = "idle"|"typing"|"hover"|"holding"



function App(){

  const [data,setData] = useState("");
  const [currentState,setCurrentState] = useState<currentState>("idle");
  

  const timeout = useRef<any>();
  const dragRef = useRef({
    isDragging: false,
  });
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
    <div className="bg-white flex flex-col items-center justify-center">
      <button onClick={handleClick}>Update text</button>
      <div>Text : {data}</div>
      <div>currentState : {currentState}</div>
      {
        currentState=="typing"?<div>
          user is typing....!
        </div>:
        null
      }
      <button onClick={doSomething}>mimick action</button>
      <div
        className="relative h-[192px] w-[192px] bg-red-600"
        > 

        <div className="pointer-events-none">
        {currentState === "idle" ? (
          <Idle />
        ) : currentState === "typing" ? (
          <Typing />
        ) : currentState === "hover" ? (
          <CatSprite row={43} col={1} />
        ) : (
          <CatSprite row={65} col={2} />
        )}

        </div>
        <div
          className="
            absolute
            left-[45px]
            top-[40px]
            w-[105px]
            h-[120px]
            [-webkit-app-region:no-drag]
            bg-blue-400/45
          "
          onPointerEnter={() => {
            if (dragRef.current.isDragging) return;
          
            setCurrentState("hover");
          }}
          
          onPointerLeave={() => {
            if (dragRef.current.isDragging) return;
          
            setCurrentState("idle");
          }}
          
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
          
            dragRef.current.isDragging = true;
          
            window.electronAPI.startDrag();
          
            setCurrentState("holding");
          }}
          
          onPointerUp={(e) => {
            dragRef.current.isDragging = false;
          
            window.electronAPI.stopDrag();
          
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
              e.currentTarget.releasePointerCapture(e.pointerId);
            }
          
            setCurrentState("hover");
          }}
          
          onPointerCancel={() => {
            dragRef.current.isDragging = false;
          
            window.electronAPI.stopDrag();
          
            setCurrentState("idle");
          }}
        />
        
      </div>
    </div>
  
  )
}



export default App
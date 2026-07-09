import { useEffect, useRef, useState } from "react"
import { CatSprite } from "./components/CatSprite";
import { Idle } from "./components/Idle";
import { Typing } from "./components/Typing";
import { Hover } from "./components/Hover";
import { FixedMessage } from "./components/FixedMessage";
import { Reminder } from "./components/Reminder";
import { ReminderAlert } from "./components/ReminderAlert";


export type CatSpriteProps = {
  row : number,
  col : number,
}

type currentState = "idle"|"typing"|"hover"|"holding"



function App(){
  
  // const [data,setData] = useState("");
  const [currentState,setCurrentState] = useState<currentState>("idle");

  
  useEffect(() => {
    const cleanup =
      window.electronAPI.onCatMenuClosed((state) => {
        setCurrentState((prev) => {
          if (prev === "typing") {
            return "typing";
          }
  
          return state;
        });
      });
  
    return cleanup;
  }, []);
  const dragRef = useRef({
    isDragging: false,
  });
  
  
  // const timeout = useRef<any>();
  
  // function doSomething(){
  //   clearTimeout(timeout.current)
  //   setCurrentState("typing");

  //   timeout.current = setTimeout(()=>{
  //     setCurrentState("idle");
  //   },2000)
  // }

  // useEffect(()=>{
  //   (async()=>{
  //     const response = await window.electronAPI.readClipboard();
  //     setData(response);
      
  //   })()
    
  // },[])

  

  useEffect(() => {
    const cleanup =
      window.electronAPI.onTypingChange((typing) => {
        setCurrentState(typing)
      });

    return cleanup;
  }, []);

  useEffect(()=>{
    console.log(currentState)
  },[currentState])


  // async function handleClick(){
  //   const response = await window.electronAPI.readClipboard();
  //   setData(response);

  // }

  const isFixedMessageWindow =
    window.location.hash === "#/fixed-message";
  
  const isReminderWindow =
    window.location.hash === "#/reminder";
  

  if (isFixedMessageWindow) {
    return (
      <FixedMessage/>
      
    );
  }
  if (window.location.hash === "#/reminder-alert") {
    return <ReminderAlert />
  }

  if(isReminderWindow){
    return (
      <Reminder/>
    )
  }


  return(
    <div className=" flex flex-col items-center justify-center">
      {/* <button onClick={handleClick}>Update text</button>
      <div>Text : {data}</div>
      <div>currentState : {currentState}</div>
      {
        currentState=="typing"?<div>
          user is typing....!
        </div>:
        null
      }
      <button onClick={doSomething}>mimick action</button> */}
      <div
        className=" bg-amber-200 relative h-[160px] w-[160px] overflow-hidden"
        > 

        <div className="absolute left-[-16px] top-[-16px] pointer-events-none">
        {currentState === "idle" ? (
          <Idle />
        ) : currentState === "typing" ? (
          <Typing />
        ) : currentState === "hover" ? (
          <Hover/>
        ) : (
          <CatSprite row={65} col={2} />
        )}

        </div>
        <div
          className="
            absolute
            left-[29px]
            top-[24px]
            w-[105px]
            h-[120px]
            [-webkit-app-region:no-drag]
           
            
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

            if (e.button !== 0) return;
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

          onContextMenu={(e) => {
            e.preventDefault();
          
            window.electronAPI.showCatMenu();
          }}
        />
        
      </div>
    </div>
  
  )
}



export default App
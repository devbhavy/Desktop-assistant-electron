import { useEffect, useRef, useState } from "react"
import { CatSprite } from "./components/CatSprite";
import { Idle } from "./components/Idle";
import { Typing } from "./components/Typing";
import { Hover } from "./components/Hover";
import { FixedMessage } from "./components/FixedMessage";
import { Reminder } from "./components/Reminder";
import { ReminderAlert } from "./components/ReminderAlert";
import { Pomodoro } from "./components/Pomodoro";
import { PomodoroSetup } from "./components/PomodoroSetup";
import { BreakStretchSetup } from "./components/BreakStreachSetup";
import { CatSkin, Settings } from "./components/Settings";
import { Sleeping } from "./components/Sleeping";



export type CatSpriteProps = {
  row : number,
  col : number,
}

type currentState = "idle"|"typing"|"hover"|"holding"
export type PomodoroPhase = "focus" | "break" | null


function App(){
  console.log("HASH:", window.location.hash);
  const [pomodoroPhase, setPomodoroPhase] =useState<PomodoroPhase>("focus")

  const [currentState,setCurrentState] = useState<currentState>("idle");
  useEffect(() => {
    const cleanup =
      window.electronAPI.onPomodoroPhaseChanged(
        (phase) => {
          setPomodoroPhase(phase)
        }
      )
  
    return cleanup
  }, [])

  const renderCat = () => {
    switch (currentState) {
      case "holding":
        return <CatSprite skin={skin} row={65} col={2} />
  
      case "typing":
        return <Typing skin={skin} />
  
      case "hover":
        return <Hover pomodoroPhase={pomodoroPhase} skin={skin} />
    }
  
    if (pomodoroPhase === "break") {
      return <Sleeping skin={skin} />
    }
  
    return <Idle skin={skin} />
  }
  
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
  

  useEffect(() => {
    const cleanup =
      window.electronAPI.onTypingChange((typing) => {
        setCurrentState(typing)
      });

    return cleanup;
  }, []);

  const [skin, setSkin] = useState<CatSkin>("black")

    useEffect(() => {
      const loadSkin = async () => {
        const settings =
          await window.electronAPI.getSettings()

        setSkin(settings.skin)
      }

      loadSkin()

      const cleanup =
        window.electronAPI.onCatSkinChanged(
          (newSkin) => {
            setSkin(newSkin)
          }
        )

      return cleanup
    }, [])


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
  if (window.location.hash === "#/pomodoro") {
    return <Pomodoro />
  }
  if (window.location.hash === "#/pomodoro-setup") {
    return <PomodoroSetup/>
  }
  if (
    window.location.hash ===
    "#/break-stretch-setup"
  ) {
    return <BreakStretchSetup />
  }
  if (
    window.location.hash === "#/settings"
  ) {
    return <Settings />
  }
  


  return(
    <div className=" flex flex-col items-center justify-center">
      
      <div
        className="relative h-[160px] w-[160px] overflow-hidden"
        > 

        <div className="absolute left-[-16px] top-[-16px] pointer-events-none">
        {renderCat()}

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
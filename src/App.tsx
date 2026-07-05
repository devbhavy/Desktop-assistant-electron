import { useEffect, useMemo, useRef, useState } from "react"

type CatSpriteProps = {
  row : number,
  col : number,
}

type currentState = "idle"|"typing"


function CatSprite({
  row,
  col,
  scale = 3,
}: CatSpriteProps & { scale?: number }) {
  return (
    <div
      style={{
        width: 64 * scale,
        height: 64 * scale,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          backgroundImage: `url("/src/assets/cat-spritesheet.png")`,
          backgroundPosition: `${-col * 64}px ${-row * 64}px`,
          backgroundRepeat: "no-repeat",
          imageRendering: "pixelated",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      />
    </div>
  );
}

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
    <div style={{backgroundColor : "white", display : "flex", flexDirection : "column", alignItems : "center", justifyContent:'center'}}>
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
        <CatSprite row={0} col={0} />
        
      }
    </div>
  
  )
}

function Idle(){

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
    },200)

    return ()=>clearInterval(int)
  },[subState])

  function changeSubStateRandom(){
    const index : number = Math.floor(4*Math.random());
    setSubstate((prev)=>{
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
    },2100)
  }

  return(
    <CatSprite row={row} col={col} />
  )
}


export default App
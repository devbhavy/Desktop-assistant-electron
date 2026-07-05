import { useEffect, useState } from "react"

type CatSpriteProps = {
  row : number,
  col : number,
}


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

  const [isTyping,setIsTyping] = useState(false)
  

  useEffect(()=>{
    (async()=>{
      const response = await window.electronAPI.readClipboard();
      setData(response);

    })()
    
  },[])

  useEffect(() => {
    const cleanup =
      window.electronAPI.onTypingChange((typing) => {
        setIsTyping(typing);
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
        isTyping?<div>
          user is typing....!
        </div>:
        null
      }
      <CatSprite row={0} col={0} />
      
    </div>
  
  )
}

// function App() {
//   return (
//     <div style={{ color: "red", fontSize: "40px" }}>
//       HI THERE
//     </div>
//   );
// }


export default App
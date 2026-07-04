import { useEffect, useState } from "react"



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
    <div style={{backgroundColor : "white", display : "flex", flexDirection : "column", alignItems : "center"}}>
      <button onClick={handleClick}>Update text</button>
      <div>Text : {data}</div>
      {
        isTyping?<div>
          user is typing....!
        </div>:
        null
      }
      
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
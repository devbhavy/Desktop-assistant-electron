import { useEffect, useState } from "react"



function App(){

  const [data,setData] = useState("");
  const [userTyping,setUserTyping] = useState(false);
  

  useEffect(()=>{
    (async()=>{
      const response = await window.electronAPI.readClipboard();
      setData(response);

    })()
    
  },[])

  async function handleClick(){
    const response = await window.electronAPI.readClipboard();
    setData(response);

  }
  

  return(
    <div style={{backgroundColor : "white", display : "flex", flexDirection : "column", alignItems : "center"}}>
      <button onClick={handleClick}>Update text</button>
      <div>Text : {data}</div>
      <button onClick={()=>setUserTyping((prev)=>!prev)}>check</button>
      {
        userTyping?<div>
          user is typing....1
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
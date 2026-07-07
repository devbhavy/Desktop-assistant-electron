import { useEffect, useState } from "react";

export function FixedMessage() {
    
    const [input,setInput] = useState("");
    const [msg,setMessage] = useState<string>();
  
    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
      ) {
        e.preventDefault()
    
        await window.electronAPI.setFixedMessage(input);
        setMessage(input)
        setInput("");
    }


    useEffect(()=>{
        (async()=>{
            const response = await window.electronAPI.getFixedMessage();
            setMessage(response);
        })()

    },[])


    if(msg){
        return(
            <div className="bg-amber-200">
                {msg}
            </div>
        )
    }

    return (
    <div className="flex justify-center p-2 bg-amber-200">
      <div className="border-[3px] border-black bg-white p-1">
        <form className="flex gap-x-3" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-w-0 flex-1 px-[4px] rounded-xl border-2 border-amber-600 font-bold text-sm"
          />

          <button type="submit">
            submit
          </button>

          <button type="button" onClick={()=>setInput("")}>
            X
          </button>
        </form>
      </div>
    </div>
  );
}
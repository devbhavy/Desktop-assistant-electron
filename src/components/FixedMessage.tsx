import { useEffect, useState } from "react";

export function FixedMessage() {
  const [input, setInput] = useState("");
  const [msg, setMessage] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    await window.electronAPI.setFixedMessage(input);
    setMessage(input);
    setInput("");
  }

  const handleClose = () => {
    window.electronAPI.closeMessageWindow();
  };

  useEffect(() => {
    (async () => {
      const response =
        await window.electronAPI.getFixedMessage();

      setMessage(response);
    })();
  }, []);

  if (msg) {
    return (
    <div className="h-screen w-screen flex justify-center items-end">
      
      <div className="inline-block border-[3px] border-black bg-white px-4 py-2">
        <p className="font-mono text-sm font-bold whitespace-pre-wrap">
          {msg}
        </p>
      </div>

    </div>
    )
  }
  

  return (
    <div className="h-screen w-screen p-2">
      <div className="flex h-full flex-col border-[3px] border-black bg-white">

        <div className="flex items-center justify-between border-b-[3px] border-white bg-black px-2 py-1 text-white">
          <span className="font-mono font-bold">
            Fixed Message
          </span>

          <button
            onClick={handleClose}
            className="flex h-6 w-6 items-center justify-center border-2 border-black bg-red-500 text-white font-bold"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col justify-center gap-3 p-4"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="border-2 border-black px-3 py-2 font-mono outline-none"
          />

          <button
            type="submit"
            className="border-2 border-black bg-black py-2 text-white font-mono font-bold hover:bg-neutral-800"
          >
            Save
          </button>
        </form>

      </div>
    </div>
  );
}
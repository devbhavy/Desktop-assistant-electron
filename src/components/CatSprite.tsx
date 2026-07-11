import { useEffect, useState } from "react";
import { CatSpriteProps } from "../App";
import { CatSkin } from "./Settings";

export function CatSprite({
    row,
    col,
    scale = 3,
    skin = "black"
  }: CatSpriteProps & { scale?: number } &{skin : CatSkin}) {


    const mapping : Record<CatSkin,string> = {
      "black" : "cat-spritesheet-1",
      "orange" : "cat-spritesheet-3",
      "white" : "cat-spritesheet-2"
    }


    return (
      <div
        style={{
          width: 64 * scale,
          height: 64 * scale,
        }}
      >
        {skin && <div
          style={{
            width: 64,
            height: 64,
            backgroundImage: `url("/src/assets/${mapping[skin]}.png")`,
            backgroundPosition: `${-col * 64}px ${-row * 64}px`,
            backgroundRepeat: "no-repeat",
            imageRendering: "pixelated",
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            objectFit : "fill"
          }}
        />}
      </div>
    );
  }
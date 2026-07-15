import blackSprite from "../assets/cat-spritesheet-1.png";
import whiteSprite from "../assets/cat-spritesheet-2.png";
import orangeSprite from "../assets/cat-spritesheet-3.png";

const mapping: Record<CatSkin, string> = {
  black: blackSprite,
  white: whiteSprite,
  orange: orangeSprite,
};


import { CatSpriteProps } from "../App";
import { CatSkin } from "./Settings";

export function CatSprite({
    row,
    col,
    scale = 3,
    skin = "black"
  }: CatSpriteProps & { scale?: number } &{skin : CatSkin}) {


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
            backgroundImage: `url(${mapping[skin]})`,
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
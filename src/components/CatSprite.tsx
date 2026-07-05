import { CatSpriteProps } from "../App";

export function CatSprite({
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
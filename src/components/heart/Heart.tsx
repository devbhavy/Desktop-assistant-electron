const OUTLINE: [number, number][] = [
    [1, 0], [2, 0], [6, 0], [7, 0],
    [0, 1], [3, 1], [5, 1], [8, 1],
    [0, 2], [4, 2], [8, 2],
    [0, 3], [8, 3],
    [1, 4], [7, 4],
    [2, 5], [6, 5],
    [3, 6], [5, 6],
    [4, 7],
  ];
  
  const HIGHLIGHT: [number, number][] = [
    [1, 1], [2, 1],
    [1, 2], [2, 2],
  ];
  
  const BASE: [number, number][] = [
    [6, 1], [7, 1],
    [3, 2], [5, 2], [6, 2], [7, 2],
    [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3],
    [2, 4], [3, 4], [4, 4], [5, 4], [6, 4],
    [3, 5], [4, 5], [5, 5],
    [4, 6],
  ];
  
  export function PixelHeart() {
    return (
      <svg
        width="32"
        height="32"
        viewBox="0 0 9 8"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
        style={{ imageRendering: "pixelated" }}
      >
        {OUTLINE.map(([x, y]) => (
          <rect key={`o-${x}-${y}`} x={x} y={y} width="1" height="1" fill="#4a1120" />
        ))}
        {BASE.map(([x, y]) => (
          <rect key={`b-${x}-${y}`} x={x} y={y} width="1" height="1" fill="#ff4f87" />
        ))}
        {HIGHLIGHT.map(([x, y]) => (
          <rect key={`h-${x}-${y}`} x={x} y={y} width="1" height="1" fill="#ff9ec7" />
        ))}
      </svg>
    );
  }
## Mapbox GL Draw Square

This is a custom mode for Mapbox GL Draw that adds the functionality to draw square

### Install

`yarn add mapbox-gl-draw-square`

### Demo 



### Usage

```js
import DrawSquare from 'mapbox-gl-draw-square';

const modes = MapboxDraw.modes;
modes.draw_square = DrawSquare;

const draw = new MapboxDraw({
  modes: modes
});

draw.changeMode('draw_square');
```

Once a square is created, 1 event is fired:
- `draw.create` with the created square

### Build

`yarn build` will do it.

### License

MIT

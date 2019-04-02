## Mapbox GL Draw Square

一个自定义mode，是对官方插件[mapbox-gl-draw.js](https://github.com/mapbox/mapbox-gl-draw)的一个补充，它实现了绘制正方形的能力

### 安装

`yarn add mapbox-gl-draw-square`

### 示例 

todo

### 用法

```js
import DrawSquare from 'mapbox-gl-draw-square';

const modes = MapboxDraw.modes;
modes.draw_square = DrawSquare;

const draw = new MapboxDraw({
  modes: modes
});

draw.changeMode('draw_square');
```

### 构建

`yarn build` 

### 许可

MIT

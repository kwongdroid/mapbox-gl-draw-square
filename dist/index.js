"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var doubleClickZoom = {
    enable: function enable(ctx) {
        setTimeout(function () {
            // 首先检查我们是否有地图和一些背景信息
            if (!ctx.map || !ctx.map.doubleClickZoom || !ctx._ctx || !ctx._ctx.store || !ctx._ctx.store.getInitialConfigValue) return;
            // 现在检查初始状态是不是假（如果是这样，我们将其禁用）
            if (!ctx._ctx.store.getInitialConfigValue("doubleClickZoom")) return;
            ctx.map.doubleClickZoom.enable();
        }, 0);
    },
    disable: function disable(ctx) {
        setTimeout(function () {
            if (!ctx.map || !ctx.map.doubleClickZoom) return;
            // 在这里总是禁用，因为在某些情况下这是必要的。
            ctx.map.doubleClickZoom.disable();
        }, 0);
    }
};

var DrawSquare = {
    onSetup: function onSetup(opts) {
        var square = this.newFeature({
            type: "Feature",
            properties: {},
            geometry: {
                type: "Polygon",
                coordinates: [[]]
            }
        });
        this.addFeature(square);
        this.clearSelectedFeatures();
        doubleClickZoom.disable(this);
        this.updateUIClasses({ mouse: "add" });
        this.setActionableState({
            trash: true
        });
        return {
            square: square
        };
    },
    // 支持移动端触摸
    onTap: function onTap(state, e) {
        // 模拟“移动鼠标”以更新要素坐标
        if (state.startPoint) this.onMouseMove(state, e);
        // 模拟onClick
        this.onClick(state, e);
    },
    // 每当用户点击地图时，Draw将调用`onClick`
    onClick: function onClick(state, e) {
        // 如果state.startPoint存在，则表示其第二次单击
        // 更改为simple_select模式
        if (state.startPoint && state.startPoint[0] !== state.endPoint[0] && state.startPoint[1] !== state.endPoint[1]) {
            this.updateUIClasses({ mouse: "pointer" });
            this.changeMode("simple_select", { featuresId: state.square.id });
        }
        // 在第一次单击时，保存单击的点坐标作为正方形的开始
        state.startPoint = [e.lngLat.lng, e.lngLat.lat];
    },
    onMouseMove: function onMouseMove(state, e) {
        // 如果是startPoint，更新要素坐标，使用边界框概念
        // 使用startPoint坐标和当前鼠标位置坐标来动态计算边界框
        // 通过将地理坐标转行列坐标，计算两点行列差值的最大值作为正方形的边长，操作体验更好
        if (state.startPoint) {
            var start = this.map.transform.locationCoordinate({
                lng: state.startPoint[0],
                lat: state.startPoint[1]
            });
            var end = this.map.transform.locationCoordinate({
                lng: e.lngLat.lng,
                lat: e.lngLat.lat
            });

            var length = Math.max(Math.abs(end.column - start.column), Math.abs(end.row - start.row));
            start.column += length * (end.column - start.column > 0 ? 1 : -1);
            start.row += length * (end.row - start.row > 0 ? 1 : -1);

            var endPoint = this.map.transform.coordinateLocation(start);
            state.endPoint = [endPoint.lng, endPoint.lat];

            state.square.updateCoordinate("0.0", state.startPoint[0], state.startPoint[1]); //minX, minY - 起点
            state.square.updateCoordinate("0.1", state.endPoint[0], state.startPoint[1]); // maxX, minY
            state.square.updateCoordinate("0.2", state.endPoint[0], state.endPoint[1]); // maxX, maxY
            state.square.updateCoordinate("0.3", state.startPoint[0], state.endPoint[1]); // minX,maxY
            state.square.updateCoordinate("0.4", state.startPoint[0], state.startPoint[1]); //minX,minY - 终点 (跟起点一样)
        }
    },
    // 每当用户在聚焦地图时点击某个键时，它将在此处发送
    onKeyUp: function onKeyUp(state, e) {
        if (e.keyCode === 27) return this.changeMode("simple_select");
    },
    onStop: function onStop(state) {
        doubleClickZoom.enable(this);
        this.updateUIClasses({ mouse: "none" });
        this.activateUIButton();

        // 检查我们是否删除了此要素
        if (this.getFeature(state.square.id) === undefined) return;

        // 删除最后添加的坐标
        state.square.removeCoordinate("0.4");
        if (state.square.isValid()) {
            this.map.fire("draw.create", {
                features: [state.square.toGeoJSON()]
            });
        } else {
            this.deleteFeature([state.square.id], { silent: true });
            this.changeMode("simple_select", {}, { silent: true });
        }
    },
    toDisplayFeatures: function toDisplayFeatures(state, geojson, display) {
        var isActivePolygon = geojson.properties.id === state.square.id;
        geojson.properties.active = isActivePolygon ? "true" : "false";
        if (!isActivePolygon) return display(geojson);

        // 仅在具有起点的正方形时才渲染
        if (!state.startPoint) return;
        return display(geojson);
    },
    onTrash: function onTrash(state) {
        this.deleteFeature([state.square.id], { silent: true });
        this.changeMode("simple_select");
    }
};

exports.default = DrawSquare;
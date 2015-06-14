# MagnifyingGlass.js
A library providing an usefull magnifying glass in JavaScript

## Basic Use
>```javascript
var magnifyingGlass = new MagnifyingGlass({
    'elRef':$('#img'),
    'canvasContainer':$('#canvasContainer'),
    'mouseHandler':$('#mouseHandlerPicture'),
  });

## Extended Use
>```javascript
var magnifyingGlass = new MagnifyingGlass({
    'elRef':$('#img'),
    'canvasContainer':$('#canvasContainer'),
    'mouseHandler':$('#mouseHandlerPicture'),
  },{
    //'staticSource':true,
    'initialZoom':1,// 3.2
    'mouseFollowing':true,
    'fullSurfaceMode':!false,
    'circle':true,
    'antiAliasing':true,
    'hasBorder':true,
    'canvasBorderWidth':5,
    'canvasBorderStyle':'solid',
    'canvasBorderColor':'red',
    'padding':10
  });

## Todo
* Anti-Aliasing

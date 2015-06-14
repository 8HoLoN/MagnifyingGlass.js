/*!* @preserve
 *
 * https://github.com/8HoLoN/MagnifyingGlass.js
 * @version: 0.9.1 ( June 2015 )
 * @author 8HoLoN / https://github.com/8HoLoN/
 * < 8holon [at] gmail.com >
 * Copyright (c) 2013-2015 Alexandre REMY
 */
;(function(_g){

  function MagnifyingGlass(_args,_opts){
    _args=_args||{};
    _opts=_opts||{};

    var that=this;

    this.elRef = _args.elRef;
    this.isVideo = null;
    if( typeof _opts.staticSource === 'boolean' ){
      this.isVideo = _opts.staticSource;
    }else{
      this.extractMediaType();
    }

    this.mediaReady(function(){
      that.init(_args,_opts);

    });

  };

  _g.MagnifyingGlass = MagnifyingGlass;

  MagnifyingGlass.prototype.extractMediaType = function(){
    var that=this;
    if(this.elRef.nodeType == 1){//element of type html-object/tag
      if(this.elRef.nodeName.toLowerCase()==='img'){
        this.isVideo = false;
      }else if(this.elRef.nodeName.toLowerCase()==='video'){
        this.isVideo = true;
      }else{
        return false;
      }
    }
  };

  MagnifyingGlass.prototype.mediaReady = function(_callback){
    var that=this;
    if( !this.isVideo ){
      if( this.elRef.complete ){
        _callback();
      }else{
          this.elRef.addEventListener('load',function(){
            _callback();
          },false);
      }
    }else{
      if( this.elRef.readyState < this.elRef.HAVE_METADATA ){
        this.elRef.addEventListener('loadedmetadata',function(){
          _callback();
        },false);
      }else{
        _callback();
      }
    }

  };

  MagnifyingGlass.prototype.init = function(_args,_opts){
    _args=_args||{};
    _opts=_opts||{};
    var that=this;

    this.antiAliasing = typeof _opts.antiAliasing==='boolean'?_opts.antiAliasing:false;


    this.mouseFollowing = typeof _opts.mouseFollowing==='boolean'?_opts.mouseFollowing:true;
    this.circle = typeof _opts.circle==='boolean'?_opts.circle:false;

    this.hasBorder = typeof _opts.hasBorder==='boolean'?_opts.hasBorder:false;
    this.paddingLeft = typeof _opts.padding==='number'?_opts.padding:0;
    this.paddingTop = typeof _opts.padding==='number'?_opts.padding:0;
    this.canvasBorderWidth = typeof _opts.canvasBorderWidth==='number'?_opts.canvasBorderWidth:1;
    this.canvasBorderStyle = typeof _opts.canvasBorderStyle==='string'?_opts.canvasBorderStyle:'dotted';
    this.canvasBorderColor = typeof _opts.canvasBorderColor==='string'?_opts.canvasBorderColor:'#33aa55';

    this.mGWidth=100;
    this.mGHeight=100;
    this.fullSurfaceMode = typeof _opts.fullSurfaceMode==='boolean'?_opts.fullSurfaceMode:true;
    if( this.fullSurfaceMode ){
      this.paddingLeft = 0;
      this.paddingTop = 0;
    }

    this.lastEvt=null;
    this.videoRefreshHandler=null;


    this.canvas = document.createElement('canvas');
    //this.canvas = $('#canvas');
    this.canvasContainer=_args.canvasContainer;

    this.mouseHandler=_args.mouseHandler;


    this.zoom=null;

    var dimensions = this.getDimensions();
    var defaultZoom = typeof _opts.initialZoom==='number'?_opts.initialZoom:1.5;
    this.zoomStep=1.5;
    console.log('default Zoom : '+defaultZoom);
    console.log(dimensions);
    console.log(this.mGHeight);

    console.log('trueRatio : '+dimensions.trueRatio);
    if(dimensions.trueRatio<1){
        this.widthZone=dimensions.trueWidth/(defaultZoom/dimensions.displayZoom);
        this.heightZone=dimensions.trueWidth/(defaultZoom/dimensions.displayZoom);
    }else{
        this.widthZone=dimensions.trueHeight/(defaultZoom/dimensions.displayZoom);
        this.heightZone=dimensions.trueHeight/(defaultZoom/dimensions.displayZoom);
    }
    if( this.fullSurfaceMode ){
      this.widthZone=dimensions.trueWidth/(defaultZoom/dimensions.displayZoom);
      this.heightZone=dimensions.trueHeight/(defaultZoom/dimensions.displayZoom);
    }
    //*/


    //console.log(this.elRef.parentNode);

    if( this.mouseFollowing ){
      //this.canvas.style.zIndex="15";
      this.elRef.parentNode.appendChild(this.canvas);
      //document.body.insertBefore(this.canvas,document.body.firstChild);
    }else{
      this.canvasContainer.appendChild(this.canvas);
    }

    // $('#mouseHandler') != this.elRef if mouseFollowing true

    this.hookScroll();
    this.canvas.style.zIndex="40";


    this.mouseHandler.style.zIndex="50";
    this.mouseHandler.addEventListener('mousemove', function(evt){
      that.render(evt);
    },false);
    // this.elRef
    this.mouseHandler.addEventListener('mouseout', function(evt){ // arreter le setinterval
      //that.canvas.style.display="none";
      that.canvas.style.visibility="hidden";
      if( that.isVideo ){clearInterval(that.videoRefreshHandler);that.videoRefreshHandler=null;}
      that.mouseHandler.blur();
    },false);

    this.mouseHandler.addEventListener('mouseover', function(evt){ // demarrrer le setinterval
      //that.canvas.style.display="inline";
      that.canvas.style.visibility="visible";
      if( that.isVideo && that.videoRefreshHandler==null){that.videoRefreshHandler=window.setInterval(function() {that.render();},40);}
      that.mouseHandler.focus();
    },false);

    this.mouseHandler.addEventListener('keypress', function(evt){ // demarrrer le setinterval
      console.log("hey",evt.which,evt.keyCode);
      if( evt.which===122 ){that.zoomIn();that.render();}
      if( evt.which===101 ){that.zoomOut();that.render();}
    },false);

    var css='div.mouseHandler:focus{outline: none;}';
    style=document.createElement('style');
    if (style.styleSheet)
        style.styleSheet.cssText=css;
    else
        style.appendChild(document.createTextNode(css));
    document.getElementsByTagName('head')[0].appendChild(style);


    console.log(this.isVideo);

    if(_args.video){// reset that.videoRefreshHandler to null
      if(!this.elRef.paused && this.videoRefreshHandler==null ){
        that.videoRefreshHandler=window.setInterval(function() {that.render();},40);
      }
      this.elRef.addEventListener('play',function() { if(that.videoRefreshHandler==null){that.videoRefreshHandler=window.setInterval(function() {that.render();},40);} },false); // && mouseover?
      this.elRef.addEventListener('pause',function() {window.clearInterval(that.videoRefreshHandler);that.videoRefreshHandler=null;},false);
      this.elRef.addEventListener('ended',function() {clearInterval(that.videoRefreshHandler);that.videoRefreshHandler=null;},false);
    }

  };

  MagnifyingGlass.prototype.getDimensions = function(){
    //* dimensions (not use)
    var displayWidth=null;
    var displayHeight=null;
    var displayRatio=null;

    var trueWidth=null;
    var trueHeight=null;
    var trueRatio=null;
    //    var tImg = new Image(); tImg.src=this.elRef.src;
    //console.log(this.elRef);
    if(this.isVideo){
      displayWidth=this.elRef.width;
      displayHeight=this.elRef.height;
      displayRatio=displayWidth/displayHeight;
      trueWidth=this.elRef.videoWidth;
      trueHeight=this.elRef.videoHeight;
      trueRatio=trueWidth/trueHeight;
    }else{
      var tImg = new Image();
      tImg.src=this.elRef.src;
      displayWidth=this.elRef.width;
      displayHeight=this.elRef.height;
      displayRatio=displayWidth/displayHeight;
      trueWidth=tImg.width;
      trueHeight=tImg.height;
      trueRatio=trueWidth/trueHeight;
    }

    if( this.fullSurfaceMode ){
      this.mGWidth = displayWidth;
      this.mGHeight = displayHeight;
    }
    if( trueWidth<trueHeight ){
      var displayZoom=this.mGWidth/displayWidth;
      var trueZoom=trueWidth/this.widthZone;
    }else{
      var displayZoom=this.mGHeight/displayHeight;
      var trueZoom=trueHeight/this.heightZone;
    }
    //console.log( {'displayWidth':displayWidth,'displayHeight':displayHeight,'displayRatio':displayRatio,'trueWidth':trueWidth,'trueHeight':trueHeight,'trueRatio':trueRatio,'displayZoom':displayZoom,'trueZoom':trueZoom} );
    //*/
    return {'displayWidth':displayWidth,'displayHeight':displayHeight,'displayRatio':displayRatio,'trueWidth':trueWidth,'trueHeight':trueHeight,'trueRatio':trueRatio,'displayZoom':displayZoom,'trueZoom':trueZoom};
  };

  // https://developer.mozilla.org/en-US/docs/Web/Events/wheel
  // http://stackoverflow.com/questions/10821985/detecting-mousewheel-on-the-x-axis-left-and-right-with-javascript
  MagnifyingGlass.prototype.hookScroll = function() {
    var that=this;
    //adding the event listerner for Mozilla
    if(window.addEventListener){
        //this.elRef
        this.mouseHandler.addEventListener('DOMMouseScroll', function(evt){
          that.scroll(evt);
        }, false);
    }
    //for IE/OPERA etc
    //this.elRef
    this.mouseHandler.onmousewheel = function(evt){
      that.scroll(evt);
    };

    /*
    this.elRef.addEventListener('scroll', function(evt){
      console.log(evt);
    },false);
    //*/
  };
  MagnifyingGlass.prototype.scroll = function(evt) {
    //console.log("scroll");
    //console.log(this);
    console.log(evt);

    evt.preventDefault();
    evt.stopPropagation();

    //*
    var delta=0;
    if(!evt)evt=window.event;
    if(evt.wheelDelta){// normalize the delta // IE and Opera
      delta=evt.wheelDelta/60;
    }else if(evt.detail){// W3C
      delta=-evt.detail/2;
    }
    //console.log("delta : "+delta+" wheelDelta : "+event.wheelDelta+" detail : "+event.detail);
    //alert(evt.detailX);
    if( evt.wheelDeltaX!=0 ){
      if( delta<0 ){// if inutile
        this.enlarge();
      }else{
        this.shrink();
      }
      this.mGWidth<0?this.mGWidth=0:null;
      this.mGHeight<0?this.mGHeight=0:null;

    }else if( evt.wheelDeltaY!=0 ){
      console.log("zoom");
      if( delta<0 ){// if inutile
        this.zoomOut(delta);
      }else{
        this.zoomIn(delta);
      }
    }
    this.render(evt);
  };

  MagnifyingGlass.prototype.zoomOut = function (_delta) {
    _delta=_delta||-2;
    if( !this.fullSurfaceMode ){
      this.widthZone-=_delta*5;
      this.heightZone-=_delta*5;
    }else{
      this.widthZone*=this.zoomStep;
      this.heightZone*=this.zoomStep;
    }
  }

  MagnifyingGlass.prototype.zoomIn = function (_delta) {
    _delta=_delta||2;
    if( !this.fullSurfaceMode ){
      this.widthZone-=_delta*5;
      this.heightZone-=_delta*5;
    }else{
      this.widthZone*=1/this.zoomStep;
      this.heightZone*=1/this.zoomStep;
    }
  }

  MagnifyingGlass.prototype.enlarge = function () {
    this.mGWidth/=1.05;
    this.mGHeight/=1.05;
    this.widthZone*=1/1.05;
    this.heightZone*=1/1.05;
  }

  MagnifyingGlass.prototype.shrink = function () {
    this.mGWidth*=1.05;
    this.mGHeight*=1.05;
    this.widthZone*=1.05;
    this.heightZone*=1.05;
  }

  MagnifyingGlass.prototype.render = function (_evt) {
    if(_evt){
      this.lastEvt=_evt;
    }else if( this.lastEvt!=null ){
      _evt=this.lastEvt;
    }else{return;}

    _evt.offsetX=_evt.offsetX||_evt.layerX; // Gecko
    _evt.offsetY=_evt.offsetY||_evt.layerY;


    $('#mouse').innerHTML="x:"+_evt.offsetX+" y:"+_evt.offsetY;

    //$('#canvas').style.width=350+"px";
    //$('#canvas').style.height=350+"px";

    this.canvas.width=this.mGWidth+this.paddingLeft*2;
    this.canvas.height=this.mGHeight+this.paddingTop*2;


    var canvasCtx = this.canvas.getContext("2d");

    if( !this.isVideo ){
      var tImg = new Image();
      tImg.src=this.elRef.src;
      //console.log(this.elRef.width+" "+this.elRef.height);
      //console.log(tImg.width+" "+tImg.height);

      //var this.widthZone=80;// >0
      //var this.heightZone=80;

      if(tImg.width<tImg.height){
        if(this.widthZone>tImg.width){
          this.widthZone=tImg.width;
          this.heightZone=tImg.width;
          if( this.fullSurfaceMode ){
            this.widthZone=tImg.width;
            this.heightZone=tImg.height;
          }
        }else if( this.widthZone<=0.1 ){
          this.widthZone=0.1;
          this.heightZone=0.1;
        }
      }else{
        if(this.heightZone>tImg.height){
          this.widthZone=tImg.height;
          this.heightZone=tImg.height;
          if( this.fullSurfaceMode ){
            this.widthZone=tImg.width;
            this.heightZone=tImg.height;
          }
        }else if( this.heightZone<=0.1 ){
          this.widthZone=0.1;
          this.heightZone=0.1;
        }
      }



      var naturalOffsetX=_evt.offsetX/this.elRef.width*tImg.width-this.widthZone/2;
      var naturalOffsetY=_evt.offsetY/this.elRef.height*tImg.height-this.heightZone/2;
      (naturalOffsetX<0)?naturalOffsetX=0:null;
      (naturalOffsetY<0)?naturalOffsetY=0:null;
      (naturalOffsetX>tImg.width-this.widthZone)?naturalOffsetX=tImg.width-this.widthZone:null;
      (naturalOffsetY>tImg.height-this.heightZone)?naturalOffsetY=tImg.height-this.heightZone:null;
      //console.log(naturalOffsetX+" "+naturalOffsetY);


      if( tImg.width<tImg.height ){
        console.log('zoom : '+tImg.width/this.widthZone+" : "+this.mGWidth/this.elRef.width);
        console.log('total zoom : '+tImg.width/this.widthZone*this.mGWidth/this.elRef.width);
        this.zoom=tImg.width/this.widthZone*this.mGWidth/this.elRef.width;
      }else{
        console.log('zoom : '+tImg.height/this.heightZone+" : "+this.mGHeight/this.elRef.height);
        console.log('total zoom : '+tImg.height/this.heightZone*this.mGHeight/this.elRef.height);
        this.zoom=tImg.height/this.heightZone*this.mGHeight/this.elRef.height;
      }

      //canvasCtx.clearRect(0, 0, this.widthZone, this.heightZone);
      //canvasCtx.globalCompositeOperation = 'source-over';

      if(this.circle && !this.antiAliasing && !this.fullSurfaceMode){
        //*
        //canvasCtx.save();
        canvasCtx.beginPath();
        canvasCtx.arc(this.mGWidth/2+this.paddingLeft, this.mGHeight/2+this.paddingTop, this.mGHeight/2, 0, Math.PI * 2, true);
        canvasCtx.closePath();
        canvasCtx.clip();
        //*/
      }

      canvasCtx.drawImage(tImg,naturalOffsetX,naturalOffsetY,this.widthZone,this.heightZone,this.paddingLeft,this.paddingTop,this.mGWidth,this.mGHeight);

      if(this.circle && this.antiAliasing && !this.fullSurfaceMode){
        canvasCtx.fillStyle = '#fff'; //color doesn't matter, but we want full opacity
        canvasCtx.globalCompositeOperation = 'destination-in';
        canvasCtx.beginPath();
        canvasCtx.arc(this.mGWidth/2+this.paddingLeft, this.mGHeight/2+this.paddingTop, this.mGHeight/2, 0, Math.PI * 2, true);
        canvasCtx.closePath();
        canvasCtx.fill();

        canvasCtx.drawImage(tImg,naturalOffsetX,naturalOffsetY,this.widthZone,this.heightZone,this.paddingLeft,this.paddingTop,this.mGWidth,this.mGHeight);
      }

      /*
      canvasCtx.beginPath();
      canvasCtx.arc(0, 0, 25, 0, Math.PI * 2, true);
      canvasCtx.clip();
      canvasCtx.closePath();
      canvasCtx.restore();
      */
    }
    else{
      //var tImg = new Image();
      //tImg.src=this.elRef.src;

      //console.log("display : "+this.elRef.width+" "+this.elRef.height);
      //console.log('videoWidth : '+this.elRef.videoWidth+' videoHeight : '+this.elRef.videoHeight);
      //console.log(tImg.width+" "+tImg.height);

      //*
      if(this.elRef.videoWidth<this.elRef.videoHeight){
        if(this.widthZone>this.elRef.videoWidth){
          this.widthZone=this.elRef.videoWidth;
          this.heightZone=this.elRef.videoWidth;
        }else if( this.widthZone<=0.1 ){
          this.widthZone=0.1;
          this.heightZone=0.1;
        }
      }else{
        if(this.heightZone>this.elRef.videoHeight){
          this.widthZone=this.elRef.videoHeight;
          this.heightZone=this.elRef.videoHeight;
        }else if( this.heightZone<=0.1 ){
          this.widthZone=0.1;
          this.heightZone=0.1;
        }
      }
      //*/

      var naturalOffsetX=_evt.offsetX/this.elRef.width*this.elRef.videoWidth-this.widthZone/2;
      var naturalOffsetY=_evt.offsetY/this.elRef.height*this.elRef.videoHeight-this.heightZone/2;
      (naturalOffsetX<0)?naturalOffsetX=0:null;
      (naturalOffsetY<0)?naturalOffsetY=0:null;
      (naturalOffsetX>this.elRef.videoWidth-this.widthZone)?naturalOffsetX=this.elRef.videoWidth-this.widthZone:null;
      (naturalOffsetY>this.elRef.videoHeight-this.heightZone)?naturalOffsetY=this.elRef.videoHeight-this.heightZone:null;
      //console.log(naturalOffsetX+" "+naturalOffsetY);

      if( this.elRef.videoWidth<this.elRef.videoHeight ){
        console.log('zoom : '+this.elRef.videoWidth/this.widthZone+" : "+this.mGWidth/this.elRef.width);
        console.log('total zoom : '+this.elRef.videoWidth/this.widthZone*this.mGWidth/this.elRef.width);
        this.zoom=this.elRef.videoWidth/this.widthZone*this.mGWidth/this.elRef.width;
      }else{
        console.log('zoom : '+this.elRef.videoHeight/this.heightZone+" : "+this.mGHeight/this.elRef.height);
        console.log('total zoom : '+this.elRef.videoHeight/this.heightZone*this.mGHeight/this.elRef.height);
        this.zoom=this.elRef.videoHeight/this.heightZone*this.mGHeight/this.elRef.height;
      }

      if(this.circle){
        //*
        //canvasCtx.save();
        canvasCtx.beginPath();
        canvasCtx.arc(this.mGWidth/2+this.paddingLeft, this.mGHeight/2+this.paddingTop, this.mGWidth/2, 0, Math.PI * 2, true);
        canvasCtx.closePath();
        canvasCtx.clip();
        //*/
      }

      canvasCtx.drawImage(this.elRef,naturalOffsetX,naturalOffsetY,this.widthZone,this.heightZone,this.paddingLeft,this.paddingTop,this.mGWidth,this.mGHeight);

      /*
      canvasCtx.beginPath();
      canvasCtx.arc(0, 0, 25, 0, Math.PI * 2, true);
      canvasCtx.clip();
      canvasCtx.closePath();
      canvasCtx.restore();
      */
    }
    //this.canvas.offsetTop=0;
    //this.canvas.offsetLeft=0;

    //console.log("offsetTop:"+this.canvas.offsetTop+"/"+this.canvas.offsetLeft);
    //console.log("marginTop:"+this.canvas.style.marginTop+"/"+this.canvas.style.marginLeft);
    //console.log("paddingTop:"+this.canvas.style.paddingTop+"/"+this.canvas.style.paddingLeft);

    if( this.mouseFollowing ){
      this.setOffset(_evt.offsetX,_evt.offsetY);
    }
  };

  MagnifyingGlass.prototype.setOffset = function (_offsetX,_offsetY) {
    //console.log("\nclient:"+evt.clientX+"/"+evt.clientY);
    //console.log("page:"+evt.pageX+"/"+evt.pageY);
    //console.log("offset:"+evt.offsetX+"/"+evt.offsetY);
    //console.log("layer:"+evt.layerX+"/"+evt.layerY);
    //console.log("offsetTop:"+this.elRef.offsetTop+"/"+this.elRef.offsetLeft);

    this.canvas.style.position="absolute";

    if( !this.fullSurfaceMode ){


      //this.canvas.style.marginLeft=this.elRef.offsetLeft-this.canvas.offsetLeft+"px";
      //this.canvas.style.marginTop=this.elRef.offsetTop-this.canvas.offsetTop+"px";
      var _borderTopOffset = 0;
      var _borderLeftOffset = 0;
      if(this.hasBorder){
        this.canvas.style.border = this.canvasBorderWidth+'px '+this.canvasBorderStyle+' '+this.canvasBorderColor;
        _borderTopOffset = this.paddingTop+this.canvasBorderWidth;
        _borderLeftOffset = this.paddingLeft+this.canvasBorderWidth;
      }
      this.canvas.style.marginLeft=_offsetX-this.mGWidth/2-_borderLeftOffset+"px";
      this.canvas.style.marginTop=_offsetY-this.mGHeight/2-_borderTopOffset+"px";
      //*/

      //console.log("offsetTop:"+this.canvas.offsetLeft+"/"+this.canvas.offsetTop);
    }

  };

})(this);

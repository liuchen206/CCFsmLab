// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        manager.enabledDebugDraw = true;
        // manager.enabledDrawBoundingBox = true;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStartCallback, this, true); 
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoveCallback, this, true);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEndCallback, this, true);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancelCallback, this, true);
    },

    start () {
        this.reset();
    },
    reset(){
        this.isSelected = false;
        this.captureNode = null;
        this.originalPositon = this.node.position;
    },
    // update (dt) {},
    onCollisionEnter: function (other, self) {
        console.log('on collision enter');
        this.captureNode = other.node;
    },
    onCollisionStay: function (other, self) {
        // console.log('on collision stay');
    },
    onCollisionExit: function (other, self) {
        console.log('on collision exit');
        if(other.node == this.captureNode){
            this.captureNode = null;
        }
    },
    onTouchStartCallback(event){
        cc.log("onTouchStartCallback pos",event.getLocation().toString());
        this.isSelected = true;
    },
    onTouchMoveCallback(event){
        // cc.log("onTouchMoveCallback pos",event.getLocation().toString());
        if(this.isSelected){
            var localPos = this.node.parent.convertToNodeSpaceAR(event.getLocation());
            this.node.position = localPos;
        }
    },
    onTouchEndCallback(event){
        cc.log("onTouchEndCallback pos",event.getLocation().toString());
        this.isSelected = false;
        this.testIsInOneCaptureHold();
    },
    onTouchCancelCallback(event){
        cc.log("onTouchCancelCallback pos",event.getLocation().toString());
        this.isSelected = false;
        this.testIsInOneCaptureHold();
    },
    testIsInOneCaptureHold(){
        if(this.captureNode == null){
            this.node.position = this.originalPositon;
        }else{
            var globalPos = this.captureNode.parent.convertToWorldSpaceAR(this.captureNode.position);
            var targetPos = this.node.parent.convertToNodeSpaceAR(globalPos);
            this.node.position = targetPos;
            this.originalPositon = this.node.position;
        }
    }
});

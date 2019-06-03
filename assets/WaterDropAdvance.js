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
        vVelocity: {
            default: cc.Vec2.ZERO,
            tooltip: '当前速度',
        },
        vStreeingForce:{
            default: cc.Vec2.ZERO,
            tooltip: '施加的动力',
        },
        MaxForce:{
            default: 750,
            tooltip: '最大施加力',
        },
        MaxSpeed:{
            default: 250,
            tooltip: '最大速度(秒/像素)',
        },
        FrictionForce:{
            default: 5,
            tooltip: '摩擦系数',
        },
        Joystick:cc.Node,
        isManulPlayer:false,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.JoystickJS = this.Joystick.getComponent('Joystick');
        this.graphics = this.getComponent(cc.Graphics);
    },

    start () {

    },

    update (dt) {
        this.vStreeingForce = cc.Vec2.ZERO;
        if(this.isManulPlayer){
            this.vStreeingForce = this.JoystickJS.GetForce();
        }else{
            // this.vStreeingForce = this.SteeringBehaviorsJS.Calculate();

        }
        this.vStreeingForce = TruncateByVec2Mag(this.MaxForce,this.vStreeingForce);
        // 摩擦力
        if(this.vVelocity.mag() > 0){
            var frictionDic = this.vVelocity.neg().normalize();
            var frictionForce = frictionDic.mul(this.FrictionForce);
            this.vStreeingForce = this.vStreeingForce.add(frictionForce);
            // cc.log("frictionForce,this.vVelocity,this.vStreeingForce",frictionForce.toString(),this.vVelocity.toString(),this.vStreeingForce.toString());
        }else{

        }
        // 加速度
        var acc = this.vStreeingForce;
        // cc.log("acc",acc.toString());
        this.vVelocity = this.vVelocity.add(acc.mul(dt));
        this.vVelocity = TruncateByVec2Mag(this.MaxSpeed,this.vVelocity);

        // 计算位移
        var posOffset = this.vVelocity.mul(dt);
        var posNow = this.node.position;
        var posNext = posNow.add(posOffset);
        this.node.position = posNext;

        this.wrapWinSize();
    },
    wrapWinSize(){
        if(this.node.x > cc.winSize.width/2){
            this.node.x = cc.winSize.width/2;
        }
        if(this.node.x < -cc.winSize.width/2){
            this.node.x = -cc.winSize.width/2;
        }
        if(this.node.y > cc.winSize.height/2){
            this.node.y = cc.winSize.height/2;
        }
        if(this.node.y < -cc.winSize.height/2){
            this.node.y = -cc.winSize.height/2;
        }
    },
});

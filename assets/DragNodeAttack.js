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
        bulletPrefab:cc.Prefab,
        attactCoolDown:0.2,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.enemyContaner = cc.find("Canvas/enemyLevel");
        this.canAttackFlag = true;
    },

    update (dt) {
        if(this.canAttackFlag){
            this.attack();
        }
    },
    attack(){
        var target = this.searchEnemy();
        if(target == null){
            return;
        }
        var bullet = cc.instantiate(this.bulletPrefab);
        var globalPosMyself = this.node.parent.convertToWorldSpaceAR(this.node.position);
        var globalPosTarget = target.parent.convertToWorldSpaceAR(target.position);
        var dir = globalPosTarget.sub(globalPosMyself);
        bullet.getComponent("bullet").Direction = dir.normalize();

        var myLocalPosInEnemyContaner = this.enemyContaner.convertToNodeSpaceAR(globalPosMyself);
        bullet.parent = this.enemyContaner;
        bullet.position = myLocalPosInEnemyContaner;

        this.canAttackFlag = false;
        this.scheduleOnce(function(){
            this.canAttackFlag = true;
        }.bind(this),this.attactCoolDown);
    },
    searchEnemy(){
        if(this.enemyContaner){
            if(this.enemyContaner.children.length > 0){
                return this.enemyContaner.children[0];
            }
        }
        return null;
    }

});

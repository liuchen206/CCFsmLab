// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
var FSMTool = require("state-machine")
cc.Class({
    extends: cc.Component,
    properties: {
        labelFSM:cc.Label,
        beAngerBtn:cc.Button,
        beSadBtn:cc.Button,
        beFearBtn:cc.Button,
        BeHappyBtn:cc.Button,
        BePeaceBtn:cc.Button,
    },

    onLoad () {
        var self = this;
        //happy, anger, sad, fear , peace -- 快乐、愤怒、悲哀、恐惧、平静
        /**trans 必须是小写字母开头 */
        // onBeforeMelt
        // onAfterMelt
        // onLeaveSolid
        // onEnterLiquid
        var labelFsm = FSMTool.factory({
            init: 'peace',
            transitions: [
              { name: 'beAnger', from: 'peace',  to: 'anger' },
              { name: 'beSad', from: 'peace', to: 'sad'},
              { name: 'beSad', from: 'anger', to: 'sad'  },
              { name: 'beFear', from: 'sad', to: 'fear' },
              { name: 'beHappy', from: 'fear', to: 'happy' },
              { name: 'bePeace', from: 'happy', to: 'peace'},
            ],
            methods: {
              onBeforeBeAnger: function(){console.log('onBeforeBeAnger') },
              onAfterBeAnger: function(){console.log('onAfterBeAnger') },
              onEnterAnger: function(){console.log('onEnterAnger') },
              onLeaveAnger: function(){console.log('onLeaveAnger') },
              onBeAnger: function() { console.log('onBeAnger') },
              onBeSad: function() { console.log('onBeSad') },
              onBeFear: function() { console.log('onBeFear') },
              onBeHappy: function() { console.log('onBeHappy') },
              onBePeace: function() { console.log('onBePeace') }
            }
        });
        this.fsm = new labelFsm();
    },

    start () {
        this.labelFSM.string = this.fsm.state;
        this.refreshTransAbility();
    },

    update (dt) {
        this.labelFSM.string = this.fsm.state;
    },
    refreshTransAbility(){
        this.beAngerBtn.interactable = false;
        this.beSadBtn.interactable = false;
        this.beFearBtn.interactable = false;
        this.BeHappyBtn.interactable = false;
        this.BePeaceBtn.interactable = false;

        var currentTrans = this.fsm.transitions();
        currentTrans.forEach(transName => {
            if(transName === "beAnger"){
                this.beAngerBtn.interactable = true;
            }
            if(transName === "beSad"){
                this.beSadBtn.interactable = true;
            }
            if(transName === "beFear"){
                this.beFearBtn.interactable = true;
            }
            if(transName === "beHappy"){
                this.BeHappyBtn.interactable = true;
            }
            if(transName === "bePeace"){
                this.BePeaceBtn.interactable = true;
            }
        });
    },
    onClickBeAnger(event,customEventData ){
        cc.log('onClickBeAnger---',event.target,customEventData);
        this.fsm.beAnger();
        this.refreshTransAbility();
    },
    onClickBeSad(event,customEventData){
        this.fsm.beSad();
        this.refreshTransAbility();
    },
    onClickBeFear(event,customEventData){
        this.fsm.beFear();
        this.refreshTransAbility();
    },
    onClickBeHappy(event,customEventData){
        this.fsm.beHappy();
        this.refreshTransAbility();
    },
    onClickBePeace(event,customEventData){
        this.fsm.bePeace();
        this.refreshTransAbility();
    },
});

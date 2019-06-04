window.EventCenter = {

    _events: {},

    EventType : {
        TEST_EVENT: "TEST_EVENT",
    },

    AddListener : function(eventname,callback,target){
        if(this._events[eventname] == undefined)
        {
            this._events[eventname] = [];
        }
        this._events[eventname].push({
            callback: callback,
            target: target,
        });
    },

    RemoveListener : function(eventname,callback,target){
        var handlers = this._events[eventname];
        for (var index = handlers.length - 1; index >= 0; index--) {
            var handler = handlers[index];
            if(target == handler.target && callback.toString() == handler.callback.toString())
            {
                this._events[eventname].splice(index, 1);
            };
        }
    },

    RemoveAllListener : function(eventname) {
        if(this._events[eventname] != undefined)
        {
            var handlers = this._events[eventname];
            for (var index = 0; index < handlers.length; index++) {
                handlers[index] = null;
            }
        }
    },

    ResetAllListener : function() {
        for (const key in this._events) {
            if (this._events.hasOwnProperty(key)) {
                delete this._events[key]; 
            }
        }
    },
    
    dispatchEvent : function(eventname,data){
        if(data === undefined){
            data = {'data':'None'};
        }
        if(this._events[eventname] != undefined)
        {
            var handlers = this._events[eventname];
            for (var index = 0; index < handlers.length; index++) {
                var handler = handlers[index];
                handler.callback.call(handler.target,data);
            }
        }
    },
};
window.MapNum = function(targetNum,srcStart,srcEnd,targetStart,targetEnd){
    var srcArea = srcEnd - srcStart;
    var targetArea = targetEnd - targetStart;
    var targetOffset = targetNum - srcStart;
    return targetStart+targetOffset/srcArea*targetArea;
};
window.TruncateByVec2Mag = function(limitMag,vec){
    var vecMag = vec.mag();
    if(limitMag < vecMag){
        return vec.normalize().mul(limitMag);
    }else{
        return vec;
    }
};
window.EnumOfColliderTag = {
    PlayerCollider: 1, // player碰撞器 tag
    ObstacleCollider: 2, // 障碍物碰撞器 tag
    wallCollider: 3, // 墙壁碰撞器 tag
};
window.PlayerInstanceIdManager = {
    currentIDCounter: 0,
    GetAnNewID: function(){
        return window.PlayerInstanceIdManager.currentIDCounter++;
    },
};
window.graphicsStyle = [
{
    fillStyle: "rgba(0,200,250,1.0)",
    strokeStyle: "#ffffff",
    lineWidth: 5,
    backgroundColor: "#222222",
    debug: false
},
{
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 3,
    backgroundColor: "#222222",
    debug: true
},
{
    fillStyle: "rgba(0,0,0,0.1)",
    strokeStyle: "rgba(255,255,255,1.0)",
    lineWidth: 6,
    backgroundColor: "#222222",
    debug: false
},
{
    fillStyle: "rgba(255,60,60,1.0)",
    strokeStyle: "rgba(0,0,0,1.0)",
    lineWidth: 2,
    backgroundColor: "#222222",
    debug: false
},
{
    fillStyle: "rgba(255,255,0,1.0)",
    strokeStyle: "rgba(0,0,0,1.0)",
    lineWidth: 4,
    backgroundColor: "#222222",
    debug: false
},
{
    fillStyle: "rgba(255,255,255,1.0)",
    strokeStyle: "rgba(0,0,0,1.0)",
    lineWidth: 4,
    backgroundColor: "#000000",
    debug: false
},
{
    fillStyle: "rgba(0,0,0,1.0)",
    strokeStyle: "rgba(0,0,0,1.0)",
    lineWidth: 4,
    backgroundColor: "#ffffff",
    debug: false
}];
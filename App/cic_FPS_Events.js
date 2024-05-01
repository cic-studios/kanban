//120FPS is SIMULATING at 125 FPS         (+0.008/every8ms)
//90FPS  is SIMULATING at 90.909090rp FPS (+0.011/every11ms)
//60FPS  is SIMULATING at 62.5 FPS        (+0.016/every16ms)
//30FPS  is SIMULATING at 30.303030rp FPS (+0.033/every33ms)
//24FPS  is SIMULATING at 24.39024rep FPS (+0.041/every41ms)
//10FPS  is SIMULATING at 10 FPS          (+0.1/every100ms)
let targetFPS = 30;
const startTime = Object.freeze(new Date());
const cicFPSeventType = Object.freeze({perTick:0, repeatInterval:1, delayOnce:2, exactTime:3});
const cicFPSevents = { timerFPS:0, frameDuration:0, deltaTime:0, updateFPSevents:[] };
let intervalID = null; SetFPSinterval(targetFPS);

function SetFPSinterval(FPS)
{
    if(intervalID==null)
        clearInterval(intervalID);
    targetFPS = FPS;
    intervalID = setInterval(UpdateFPSevents, Math.floor(1000/targetFPS));
}

function SubscribeFPSevent(func, time, type=cicFPSeventType.perTick)
{
    cicFPSevents.updateFPSevents.push({func:func, time:((type==cicFPSeventType.perTick)?(MillisecondsSinceStart()):(time*1000)), type:type, nextTime:((type==cicFPSeventType.perTick)?(MillisecondsSinceStart()):((type==cicFPSevents.timedOnce)?(time*1000):(cicFPSevents.timerFPS+time*1000)))});
}

function UnsubscribeFPSevent(func)
{
    const index = cicFPSevents.updateFPSevents.findIndex(obj => obj.fn === func);
    if (index !== -1) cicFPSevents.updateFPSevents.splice(index, 1);
}

function UpdateFPSevents()
{
    const currTime=MillisecondsSinceStart(); 
    cicFPSevents.frameDuration=currTime-cicFPSevents.timerFPS; 
    cicFPSevents.deltaTime=cicFPSevents.frameDuration/1000; 
    cicFPSevents.timerFPS=currTime; 

    let i=0;
    while(i<cicFPSevents.updateFPSevents.length)
    {
        if(cicFPSevents.timerFPS>=cicFPSevents.updateFPSevents[i].nextTime)
        {
            cicFPSevents.updateFPSevents[i].func();
            if(cicFPSevents.updateFPSevents[i].type==cicFPSeventType.repeatInterval)
                cicFPSevents.updateFPSevents[i].nextTime += cicFPSevents.updateFPSevents[i].time;

            if(cicFPSevents.updateFPSevents[i].type==cicFPSeventType.delayOnce || cicFPSevents.updateFPSevents[i].type==cicFPSeventType.exactTime)
                cicFPSevents.updateFPSevents.splice(i, 1);
            else
                i++;
        }
        else
        {
            i++;
        }
    }
}

function MillisecondsSinceStart()
{
    return ((new Date().getTime()) - startTime.getTime()); //getTime() method of Date instances returns the number of milliseconds for this date since the epoch, which is defined as the midnight at the beginning of January 1, 1970, UTC.
}
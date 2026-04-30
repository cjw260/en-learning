import { report } from "@/report";
import type { EventDto, TrackerConfig } from "@en/common/tracker";

export const reportEvent = (visitorId: string, config: TrackerConfig) => {
    const ButtonName = "BUTTON";
    const SpanName = "SPAN";
    let url = config.baseUrl + config.event.api
    document.addEventListener("click", (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const sendEvent = () => {
            const react = target.getBoundingClientRect();
            const body: EventDto = {
                visitorId,//   访客id
                event: e.type,// 事件类型
                payload:{
                    text: target.textContent,// 文本内容
                    width: react.width.toFixed(2) || 0,// 宽度
                    height: react.height.toFixed(2) || 0,//高度
                    y: react.top.toFixed(2) || 0,//y坐标
                    x: react.left.toFixed(2) || 0  //x坐标
                },
                url: window.location.href,//当前页面
            }
            report(url, body)
        }
        if( target.nodeName === ButtonName){
            sendEvent()
        }
        if( target.nodeName === SpanName &&target.parentElement?.nodeName === ButtonName){
            sendEvent()
        }
    })
}
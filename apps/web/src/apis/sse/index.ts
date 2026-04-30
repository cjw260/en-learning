import { fetchEventSource } from '@microsoft/fetch-event-source';
import type { Method } from 'axios';
export const CHAT_URL = '/ai/v1/chat'

export const sse = <T,V = any>(url:string,method:Method = 'POST',body:V,callback?:(data:T)=>void,errorCallback?:(error:Error)=>void) => {
    fetchEventSource(url,{
        method: method.toLowerCase(),
        headers:{
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        onmessage:(event)=>{
            callback?.(JSON.parse(event.data) as T)
        },
        onerror:(error)=>{
            errorCallback?.(error)
        }
    })
}
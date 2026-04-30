import { report } from "@/report";
import type { PerformanceDto, TrackerConfig } from "@en/common/tracker";
import {onINP, onCLS} from 'web-vitals'

export const reportPerformance = async (visitorId: string,config: TrackerConfig) => {
    let url = config.baseUrl + config.performance.api
    let fp = 0 //首次绘制
    let fcp = 0//首次内容绘制
    let lcp = 0//最大内容绘制
    let cls = 0//累积布局偏移
    let inp = 0//输入延迟
    //FP和FCP
    let perFormanceEntries = performance.getEntriesByType("paint");
    const fpEntry = perFormanceEntries.find((item) => item.name === "first-paint");
    const fcpEntry = perFormanceEntries.find((item) => item.name === "first-contentful-paint");
    if (fpEntry) {
        fp = fpEntry.startTime;
    }
    if (fcpEntry) {
        fcp = fcpEntry.startTime;
    }
    let lcpPromise = new Promise<{lcpTime: number, lcpObserver: PerformanceObserver}>((resolve) => {
        let lcpObserver = new PerformanceObserver((entryList) => {
            resolve({
                lcpTime: entryList.getEntries()[0].startTime || 0,
                lcpObserver
            })
        })
        lcpObserver.observe({type: 'largest-contentful-paint', buffered: true}) // buffered 历史记录和新的LCP性能都监听
    })
    const {lcpTime, lcpObserver} = await lcpPromise
    lcpObserver.disconnect()//断开监听
    lcp = lcpTime
    //INP
    onINP((metric) => {
        inp = metric.value
    })
    //CLS
    onCLS((metric) => {
        cls = metric.value
    })
    window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            console.log(fp, fcp, lcp, cls, inp)
            const body: PerformanceDto = {
                visitorId,
                fp,
                fcp,
                lcp,
                cls,
                inp
            }
            report(url, body)
        }
    },{once: true})
}
import { reportEvent } from '@/event';
import { getFingerprint } from '@/uv';
import type { TrackerConfig } from '@en/common/tracker';
import { reportError } from '@/error';
import { reportPv } from '@/pv';
import { reportPerformance } from '@/performance';
import { reportFetch } from '@/report';

export class Tracker {
    private config: TrackerConfig
    private visitorId: string | null = null
    private initPromise: Promise<void> | null = null
    constructor(config: TrackerConfig) {
        this.config = config
        this.init()
    }
    //protected 运行子类和自身调用
    protected async init() {
        if (this.initPromise) {
            return this.initPromise
        }
        this.initPromise = (async () => {
            let config = this.config 
            this.visitorId = await getFingerprint(config)
            reportEvent(this.visitorId, config)//上报事件
            reportError(this.visitorId, config)
            reportPv(this.visitorId, config)
            reportPerformance(this.visitorId, config)
        })()

        return this.initPromise
    }

    async setUserId(userId: string) {
        await this.init()
        let url = this.config.baseUrl + this.config.uv.updateApi
        await reportFetch(url, {
            visitorId: this.visitorId,
            userId
        })
    }
}

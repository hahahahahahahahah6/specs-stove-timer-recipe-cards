// StoveTimerController.ts - Manages stove burners, countdown timers, and demo mode

import { TimerItem } from "./RecipeTypes";

export class StoveTimerController {
    private static instance: StoveTimerController;

    private timers: Map<string, TimerItem> = new Map();
    private activeByBurner: Map<"left" | "right" | "center", string> = new Map();
    public isDemoMode: boolean = false; // When true: 1 minute = 1 second (60x speed)
    private onUpdateCallbacks: Array<() => void> = [];
    private onFinishCallbacks: Array<(timer: TimerItem) => void> = [];

    public static getInstance(): StoveTimerController {
        if (!StoveTimerController.instance) {
            StoveTimerController.instance = new StoveTimerController();
        }
        return StoveTimerController.instance;
    }

    public constructor() {}

    public toggleDemoMode(): boolean {
        this.isDemoMode = !this.isDemoMode;
        print(`[StoveTimer] 演示模式切换: ${this.isDemoMode ? "开启 (1分=1秒)" : "关闭 (标准时长)"}`);
        this.notifyUpdate();
        return this.isDemoMode;
    }

    public addOrStartTimer(
        id: string,
        name: string,
        durationSeconds: number,
        stepIndex: number,
        burner: "left" | "right" | "center" = "left"
    ): TimerItem {
        const existing = this.timers.get(id);
        const previousId = this.activeByBurner.get(burner);
        if (previousId !== undefined && previousId !== id) {
            // Replace silently so callers receive one update for the whole operation.
            this.timers.delete(previousId);
        }
        if (existing && existing.burner !== burner && this.activeByBurner.get(existing.burner) === id) {
            this.activeByBurner.delete(existing.burner);
        }
        this.activeByBurner.set(burner, id);

        if (existing) {
            // Preserve paused progress, but imported durations and finished timers restart.
            if (existing.isFinished || existing.originalSeconds !== durationSeconds) {
                existing.remainingSeconds = durationSeconds;
            }
            existing.name = name;
            existing.originalSeconds = durationSeconds;
            existing.stepIndex = stepIndex;
            existing.burner = burner;
            existing.isRunning = true;
            existing.isFinished = false;
            this.notifyUpdate();
            return existing;
        }

        const newTimer: TimerItem = {
            id: id,
            name: name,
            originalSeconds: durationSeconds,
            remainingSeconds: durationSeconds,
            isRunning: true,
            isFinished: false,
            stepIndex: stepIndex,
            burner: burner
        };

        this.timers.set(id, newTimer);
        print(`[StoveTimer] 启动计时器: ${name} (${durationSeconds}秒, 灶台: ${burner})`);
        this.notifyUpdate();
        return newTimer;
    }

    public toggleTimer(id: string): void {
        const timer = this.timers.get(id);
        if (!timer) return;
        if (timer.isFinished) {
            timer.remainingSeconds = timer.originalSeconds;
            timer.isFinished = false;
            timer.isRunning = true;
        } else {
            timer.isRunning = !timer.isRunning;
        }
        print(`[StoveTimer] 计时器 ${timer.name} 状态: ${timer.isRunning ? "运行中" : "暂停"}`);
        this.notifyUpdate();
    }

    public resetTimer(id: string): void {
        const timer = this.timers.get(id);
        if (!timer) return;
        timer.remainingSeconds = timer.originalSeconds;
        timer.isRunning = false;
        timer.isFinished = false;
        print(`[StoveTimer] 计时器重置: ${timer.name} (${timer.originalSeconds}秒)`);
        this.notifyUpdate();
    }

    public removeTimer(id: string): void {
        const timer = this.timers.get(id);
        if (timer && this.activeByBurner.get(timer.burner) === id) {
            this.activeByBurner.delete(timer.burner);
        }
        this.timers.delete(id);
        this.notifyUpdate();
    }

    public getTimers(): TimerItem[] {
        return Array.from(this.timers.values());
    }

    public getTimer(id: string): TimerItem | undefined {
        return this.timers.get(id);
    }

    public getActiveTimer(burner: "left" | "right" | "center"): TimerItem | undefined {
        const id = this.activeByBurner.get(burner);
        return id === undefined ? undefined : this.timers.get(id);
    }

    // Called every frame by UpdateEvent
    public update(deltaTime: number): void {
        if (this.timers.size === 0) return;

        // In Demo Mode, delta is multiplied by 60 so 10 minutes (600s) completes in 10 real seconds!
        const effectiveDelta = this.isDemoMode ? deltaTime * 60 : deltaTime;
        let changed = false;

        this.timers.forEach((timer) => {
            if (timer.isRunning && !timer.isFinished) {
                timer.remainingSeconds -= effectiveDelta;
                changed = true;

                if (timer.remainingSeconds <= 0) {
                    timer.remainingSeconds = 0;
                    timer.isRunning = false;
                    timer.isFinished = true;
                    print(`[StoveTimer] 🔔 计时完成提醒: [${timer.name}] 时间到！`);
                    this.onFinishCallbacks.forEach((cb) => cb(timer));
                }
            }
        });

        if (changed) {
            this.notifyUpdate();
        }
    }

    public onUpdate(callback: () => void): void {
        this.onUpdateCallbacks.push(callback);
    }

    public onFinish(callback: (timer: TimerItem) => void): void {
        this.onFinishCallbacks.push(callback);
    }

    private notifyUpdate(): void {
        this.onUpdateCallbacks.forEach((cb) => cb());
    }

    // Format seconds to MM:SS string
    public static formatTime(seconds: number): string {
        const total = Math.max(0, Math.ceil(seconds));
        const mins = Math.floor(total / 60);
        const secs = total % 60;
        const mm = mins < 10 ? `0${mins}` : `${mins}`;
        const ss = secs < 10 ? `0${secs}` : `${secs}`;
        return `${mm}:${ss}`;
    }
}

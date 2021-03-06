import { HealthStatus } from "diagnostic-data";

export abstract class Step {
    public id: string;
    public title: string;
    public data?: any;
    abstract run(): Promise<StepView>;
}

export enum StepViewType {
    promise,
    dropdown,
    check,
    inputbox,
    info
}

// for angular component variable binding
export class StepViewContainer {
    public stepView: StepView;

    constructor(view: StepView) {
        this.set(view);
    }
    public set(view: StepView) {
        this.stepView = view;
        view.container = this;
    }
}

export abstract class StepView {
    public id: string;
    public type: StepViewType;
    public next?: StepView|Promise<StepView>;
    public hasNext? = false;
    public container?: StepViewContainer;

    constructor(view: StepView) {
        this.type = view.type;
        this.next = view.next;
    }

    public update?(view: StepView) {
        this.container.set(view);
    }
}

export class PromiseStepView extends StepView {
    public message: string;
    public promise: Promise<StepView>;
    constructor(view: PromiseStepView) {
        super(view);
        this.message = view.message;
        this.promise = view.promise;
    }
}

export class DropdownStepView extends StepView {
    public description: string;
    public options: string[];
    public defaultChecked?: number;
    public callback(selectedIdx: number): Promise<StepView> {
        return null;
    };
    constructor(view: DropdownStepView) {
        super(view);
        this.description = view.description;
        this.options = view.options;
        this.defaultChecked = view.defaultChecked;
        this.callback = view.callback;
    }
}

enum checkResultLevel {
    pass,
    warning,
    fail,
    pending,
    loading,
    error,
    hidden
}

export class CheckStepView extends StepView{
    public title:string;
    public level:number;
    public getStatus?():HealthStatus{
        return this._convertLevelToHealthStatus(this.level);
    }
    private _convertLevelToHealthStatus?(level: checkResultLevel): HealthStatus {
        switch (level) {
            case checkResultLevel.pass:
                return HealthStatus.Success;
            case checkResultLevel.fail:
                return HealthStatus.Critical;
            case checkResultLevel.warning:
                return HealthStatus.Warning;
            case checkResultLevel.pending:
                return HealthStatus.Info;
            case checkResultLevel.error:
                return HealthStatus.Info;
        }
        return HealthStatus.None;
    }

    constructor(view:CheckStepView){
        super(view);
        this.title = view.title;
        this.level = view.level;
    }
}

enum InfoType{
    recommendation,
}

export class InfoStepView extends StepView{
    public title:string;
    public infoType:InfoType; 
    public markdown:string;

    constructor(view:InfoStepView){
        super(view);
        this.title = view.title;
        this.infoType = view.infoType;
        this.markdown = this._markdownPreprocess(view.markdown, view.id);
    }

    private _markdownPreprocess?(markdown: string, id: string): string {
        if (markdown == null) {
            return null;
        }
        // parse markdown links to html <a> tag
        var result = markdown.replace(/(?<!\!)\[(.*?)]\((.*?)( +\"(.*?)\")?\)/g, `<a target="_blank" href="$2" title="$4" onclick="window.networkCheckLinkClickEventLogger('${id}','$2', '$1')">$1</a>`);
        return result;
    }
    
    
}

export class StepFlowManager {
    private _stepViews: StepViewContainer[];
    private _dropDownView: StepView;
    constructor(flows: Step[], stepViews: StepViewContainer[], data?: any) {
        this._stepViews = stepViews;
        var mgr = this;
        var promiseCompletion = new PromiseCompletionSource<StepView>();
        this._dropDownView = new DropdownStepView({
            id: "InitialDropDown",
            type: StepViewType.dropdown,
            description: "This is dropdown description",
            options: flows.map(f=>f.title),
            async callback(selectedIdx: number): Promise<StepView> {
                if (stepViews.length > 1) {
                    promiseCompletion = new PromiseCompletionSource<StepView>();
                    this.next = promiseCompletion;
                    mgr._resetStepViews();
                }
                var step = flows[selectedIdx];
                step.data = data;
                var stepView = await step.run();
                stepView.id = stepView.id || flows[selectedIdx].id;
                promiseCompletion.resolve(stepView);
                return this;
            },
            next: promiseCompletion
        });
        this._stepViews.push(new StepViewContainer(this._dropDownView));
        this._execute();
    }

    private _resetStepViews(){
        this._stepViews.length = 1;
        this._execute();
    }

    private async _execute(){
        var view = this._dropDownView;
        while(view.next!=null && (view = await view.next)!= null){
            switch(view.type){
                case StepViewType.dropdown:
                    view = new DropdownStepView(<DropdownStepView>view);
                    break;
                case StepViewType.check:
                    view = new CheckStepView(<CheckStepView>view);
                    break;
                case StepViewType.info:
                    view = new InfoStepView(<InfoStepView>view);
            }
            this._stepViews.push(new StepViewContainer(view));
        }
    }
}


function delay(second: number): Promise<void> {
    return new Promise(resolve =>
        setTimeout(resolve, second * 1000));
}

class PromiseCompletionSource<T> extends Promise<T>{
    private _resolve: (value: T | PromiseLike<T>) => void;
    private _reject: (reason?: any) => void;

    constructor(timeoutInSec?: number) {
        var _resolve: (value: T | PromiseLike<T>) => void;
        var _reject: (reason?: any) => void;
        super((resolve, reject) => {
            _resolve = resolve;
            _reject = reject;
        });

        this._resolve = _resolve;
        this._reject = _reject;

        if (timeoutInSec != null) {
            delay(timeoutInSec).then(() => {
                this._reject(`Timeout after ${timeoutInSec} seconds!`);
            });
        }
    }

    resolve(val: T) {
        this._resolve(val);
    }
}
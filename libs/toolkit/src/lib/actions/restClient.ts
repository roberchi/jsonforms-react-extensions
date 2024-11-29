import { JsonFormsStateContext } from "@jsonforms/react";
import { IActionRest } from "./restAction";
import { depends } from "../utils/dependency";
//import { IEvent, IEventError, RestActionElement, actionEvents, depends } from "./util";
//import { eventsDispath } from './events';
/*
export class restClient {
    restConfig: IActionRest;
    httpMethod: string;
    actionId: string;
    path: string;
    ctx: JsonFormsStateContext;

    constructor(ctx: JsonFormsStateContext,
        actionId: string,
        path: string,
        action: IActionRest) {
        this.restConfig = action;
        this.actionId = actionId;
        this.path = path;
        this.ctx = ctx;
        this.httpMethod = action.method.toUpperCase();        
    }


    authenticate(): Promise<restClient> {
        // TODO: authenticate
        return new Promise<restClient>((resolve) => resolve(this))
    }

    send(): Promise<object> {
        // prepare data to post or put
        var data: any = null;
        if (this.restConfig.url && (this.httpMethod === 'POST' || this.httpMethod === 'PUT'))
            data = this.prepareData(this.restConfig);

        return new Promise<object>((resolve, reject) => {
            //eventsDispath.fire(actionEvents.restActionFetchStarted, this.startEventArgs());
            if (this.httpMethod === 'POST' || this.httpMethod === 'PUT')
                try {
                    fetch(this.prepareUrl(this.restConfig), {
                        method: this.httpMethod,
                        body: data ? JSON.stringify(data) : null,
                        headers: data ? {
                            'Content-Type': 'application/json'
                        } : {}
                    })
                        .then(status)
                        .then((value) => {
                            resolve(value.json());
                        //    eventsDispath.fire(actionEvents.restActionValueFetched, this.endEventArgs());
                        })
                        .catch((err) => {
                            reject(err);
                        //    eventsDispath.fire(actionEvents.restActionError, this.errorEventArgs(err));
                        })
                        .finally(() => 
                            //eventsDispath.fire(actionEvents.restActionFetchEnd, this.endEventArgs())
                        null);
                }
                catch (err) {
                    reject(err);
                    //eventsDispath.fire(actionEvents.restActionError, this.errorEventArgs(err));
                }
            else if (this.httpMethod === 'get' || this.httpMethod === 'delete')
                try {
                    fetch(this.prepareUrl(this.restConfig), {
                        method: this.httpMethod,
                    })
                        .then(status)
                        .then((value) => {
                            resolve(value.json());
                            // eventsDispath.fire(actionEvents.restActionValueFetched, this.endEventArgs());
                        })
                        .catch((err) => {
                            reject(err);
                            // eventsDispath.fire(actionEvents.restActionError, this.errorEventArgs(err));
                        })
                        .finally(() => null
                        //eventsDispath.fire(actionEvents.restActionFetchEnd, this.endEventArgs())
                        );
                }
                catch (err) {
                    reject(err);
                    // eventsDispath.fire(actionEvents.restActionError, this.errorEventArgs(err));
                }
        });
    }
*/
    // return the object to be used in POST, it is the value of a single dependency or an objet 
    // #/properties/name0/name1 => name0_name1_name_3
    // #/properties/name2 => name2
     
    // {
    //   'name0_name1_name_3': value at path #/properties/name0/name1 
    //   'name2': value at path #/properties/name2
    // } 

    /*
    prepareData(restConfig: IActionRest): any {
        const deps = depends(restConfig);
        if(deps.length === 0) return null;
        else if(deps.length === 1) return this.ctx.core?.data[deps[0].replace('#/properties/', '')];
        else return deps.reduce((pv,cv) => {
                const prop = cv.replace('#/properties/', '');
                pv[prop.replace('/', '_')] = this.ctx.core?.data[prop];
                return pv;
            }, {});
    }


    // replace {path} in the url with the value
    prepareUrl(restConfig: IActionRest): string {
        const deps = depends(restConfig);
        return deps.reduce((pv, cv)=> pv.replace(`{${cv}}`, this.ctx.core?.data[cv.replace('#/properties/', '')]) , restConfig.url);
    }

    startEventArgs(): IEvent {
        return {
            actionId: this.actionId,
            scope: this.restConfig.scope
        };
    }

    endEventArgs(): IEvent {
        return {
            actionId: this.actionId,
            scope: this.restConfig.scope
        };
    }

    errorEventArgs(err: any): IEventError {
        return {
            actionId: this.actionId,
            scope: this.restConfig.scope,
            error: {
                instancePath: this.path,
                keyword: 'rest-client',
                params: {},
                message: err,
                schemaPath: '/#/properties/' + this.path
            }
        }
    }

}

function status(res: any) {
    if (!res.ok) {
        throw new Error(res.statusText);
    }
    return res;
}*/
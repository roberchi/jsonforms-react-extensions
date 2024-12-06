import { JsonFormsCore } from "@jsonforms/core";
import { actionBehavior, IAction, IActionBase, IActionRef, IActionToExecute, MaybePromise } from "./interfaces";
import { dependency, depNode, getActionDepends } from "./utils/dependency";
import _ from "lodash";
import { ErrorObject } from "ajv";

// register actions
export type EvalAction = (act: IAction, state: JsonFormsCore) => MaybePromise<any>;
const actions: Map<string, EvalAction> = new Map();
export const registerAction = (actType:string, evalAct:EvalAction) => actions.set(actType, evalAct);

const resolveRef = (action:IActionBase, allActions:IAction[]): IAction =>{
    if(_.has(action, "$ref")){
        const refAction = _.find(allActions, (act)=> act.id === (action as IActionRef).$ref);
        if(!refAction) throw new Error(`Invalid or missing action reference ${(action as IActionRef).$ref}`);
        const copyAction = _.omit(refAction, ["id", "behavior"]);
        return {...action, ...copyAction};
    }
    else
        return action as IAction;
}

// prepare action on init
export const prepare = (acts:IAction[]): IActionToExecute =>{
    const actionsToExecute:IActionToExecute = {
        "not-execute": sortByActionDependencies(acts.filter(act => hasBehavior(act.behavior, "not-execute")).map(act => resolveRef(act, acts))),
        "on-change": sortByActionDependencies(acts.filter(act => hasBehavior(act.behavior, "on-change")).map(act => resolveRef(act, acts))),
        "on-event": sortByActionDependencies(acts.filter(act => hasBehavior(act.behavior, "on-event")).map(act => resolveRef(act, acts))),
        "on-init": sortByActionDependencies(acts.filter(act => hasBehavior(act.behavior, "on-init")).map(act => resolveRef(act, acts))),
    }
    return actionsToExecute;
}

// sort actions by dependencies
const sortByActionDependencies = (acts: IAction[]): IAction[] => {
    if(acts.length === 0) return [];
    const deps = dependency.createGraph<IAction>(acts, (a, nodes) => {
      const deps = getActionDepends(a);
      const res: depNode<IAction>[] = [];
      deps.forEach((d) => res.push(...nodes.filter((n) => n.data?.scope === d)));
      return res;
    });
    return dependency.sort<IAction>(deps[1]);
};

export const execute = async (behavior:actionBehavior, actions:IActionToExecute, afterDefaultReducer:JsonFormsCore, beforeDefaultReducer: JsonFormsCore = afterDefaultReducer): Promise<JsonFormsCore> => {
    const actionsToExecute = _.get(actions, behavior);
    
    switch(behavior){
        case "not-execute":
            return afterDefaultReducer; // do nothing
        case "on-init":
        case "on-event":{
            const newState = _.cloneDeep(afterDefaultReducer);
            for(const act of actionsToExecute){
                const value = evalAction(act, newState);
                newState.data = await value;

            }
            return newState; 
        }
        case "on-change":{
            const newState = _.cloneDeep(afterDefaultReducer);
            for(const act of actionsToExecute){
                // evaluate action dependencies
                if(isStateChanged(act, newState.data, beforeDefaultReducer.data)) {
                    const data = await evalAction(act, newState);
                    newState.data = data;
                }
            };
            return newState;   
        }     
    }
}



// evaluate if the action dependencies has been changed
const isStateChanged = (act: IAction, afterData: any, beforeData: any): boolean => {    
    if(!act.depends) return true;
    const depends = _.isArray(act.depends)? act.depends : [act.depends];
    let res = false;
    depends.forEach((d) => {
        const path = d.substring("#/properties/".length).replace("/", ".");
        if(_.get(beforeData, path) !== _.get(afterData, path)) {
            res = true;
            return;
        }
    });
    return res;
}

// evaluate the action
const evalAction = (act: IAction, state: JsonFormsCore): MaybePromise<any> => {
    console.log(`Action ${act.kind} is executing`);
    const evalAct = actions.get(act.kind);
    if(!evalAct) throw new Error(`Action ${act.kind} not found`);
    return evalAct(act, state);
};

function hasBehavior(behavior: actionBehavior | actionBehavior[], checkBehavior: actionBehavior): unknown {
    if(behavior === undefined && checkBehavior === 'on-change') return true;
    if(_.isArray(behavior) && behavior.length === 0 && checkBehavior === 'on-change') return true;
    if(_.isArray(behavior)) return behavior.indexOf(checkBehavior) !== -1;
    return behavior === checkBehavior;
}

// used to register action not yet implemented
export const notYetImplemented:EvalAction = (act:IAction, state:JsonFormsCore):MaybePromise<JsonFormsCore> =>{
    console.log(`Action ${act.kind}, not yet implemented`);
    return state.data;
}

export class ExceptionErrorObject extends Error{
    objectError: ErrorObject;
    baseException?: Error;

    constructor(objectError: ErrorObject, baseException?: Error){
        super(objectError.message);
        this.objectError = objectError;
        this.baseException = baseException;
    }
    
}
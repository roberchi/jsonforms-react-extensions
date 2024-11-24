import { JsonFormsCore } from "@jsonforms/core";
import { IAction } from "./interfaces";
import { dependency, depNode, getActionDepends } from "./utils/dependency";
import _ from "lodash";

// register actions
export type EvalAction = (act: IAction, state: JsonFormsCore) => JsonFormsCore;
const actions: Map<string, EvalAction> = new Map();
export const registerAction = (actType:string, evalAct:EvalAction) => actions.set(actType, evalAct);

// sort actions by dependencies
export const sortByActionDependencies = (acts: IAction[]): IAction[] => {
    const deps = dependency.createGraph<IAction>(acts, (a, nodes) => {
      const deps = getActionDepends(a);
      const res: depNode<IAction>[] = [];
      deps.forEach((d) => res.push(...nodes.filter((n) => n.data?.scope === d)));
      return res;
    });
    return dependency.sort<IAction>(deps[1]);
};

// execute actions
export const executeActions = (actions: IAction[], state: JsonFormsCore, oldState: JsonFormsCore): JsonFormsCore => {
    let newState = { ...state };
    actions.forEach((act) => {
        // evaluate action dependencies
        if(isStateChanged(act, newState, oldState)) 
            newState = evalAction(act, newState);
    });
    return newState;
};

// evaluate if the action dependencies has been changed
const isStateChanged = (act: IAction, newState: JsonFormsCore, oldState: JsonFormsCore): boolean => {    
    if(!act.depends) return true;
    const depends = _.isArray(act.depends)? act.depends : [act.depends];
    let res = false;
    depends.forEach((d) => {
        const path = d.replace("#/properties/", "data.").replace("/", ".");
        if(_.get(oldState, path) !== _.get(newState, path)) {
            res = true;
            return;
        }
    });
    return res;
}

// evaluate the action
const evalAction = (act: IAction, state: JsonFormsCore): JsonFormsCore => {
    const evalAct = actions.get(act.kind);
    if(!evalAct) throw new Error(`Action ${act.kind} not found`);
    return evalAct(act, state);
};
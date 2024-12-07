import { JsonFormsCore } from "@jsonforms/core";
import { evalAction, EvalAction, evalActionGroup, ExceptionErrorObject, isStateChanged, prepareActions } from "../actions";
import { IAction, MaybePromise } from "../interfaces";
import _ from "lodash";
import {allowedGlobals, JsEval, prepareParams} from "./jsEval"
import { depends } from "../utils/dependency";

interface ICase{
    [index:string]:IAction[];
}
export interface IActionSwitch extends IAction {
    case:ICase;
    default?:IAction[];
}

export const switchActionPrpeare = (act: IAction, refs:IAction[]): IAction => {
    const newAct = _.cloneDeep(act) as IActionSwitch;

    _.keys(newAct.case) // for each case prepare actions
        .forEach((k)=>_.set(newAct.case, k, prepareActions(_.get(newAct.case, k), refs)));
    (newAct as IActionSwitch).default = newAct.default?prepareActions(newAct.default, refs):undefined;
    return newAct;
}

export const switchAction:EvalAction = async (act: IAction, state:JsonFormsCore) : Promise<any> => {
    let data = state.data;
    // get switch from depends
    const switchs = depends(act);
    if(switchs.length === 0)
        return data;

    const value = _.get(state.data, switchs[0].substring('#/properties/'.length).replace('/', '.'));
    const switcAct:IActionSwitch = (act as IActionSwitch);
    if(value){
        const actions:IAction[]|undefined = _.get(switcAct.case, _.toString(value));
        if(actions)
            data = await evalActionGroup(actions, state);
        else if(switcAct.default)
            data = await evalActionGroup(switcAct.default, state);
    } else if(switcAct.default)
        data  = await evalActionGroup(switcAct.default, state);
    return data;
}





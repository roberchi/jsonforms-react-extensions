import { JsonFormsCore } from "@jsonforms/core";
import { EvalAction, ExceptionErrorObject, prepareActions } from "../actions";
import { IAction, MaybePromise } from "../interfaces";
import _ from "lodash";
import {allowedGlobals, JsEval, prepareParams} from "./jsEval"

export interface IActionIfThenElse extends IAction {
    condition: string;
    then: IAction[];
    else: IAction[];
}

export const ifActionPrpeare = (act: IAction, refs:IAction[]): IAction => {
    const newAct = _.cloneDeep(act);
    (newAct as IActionIfThenElse).then = prepareActions((act as IActionIfThenElse).then, refs);
    (newAct as IActionIfThenElse).else = prepareActions((act as IActionIfThenElse).else, refs); 
    return newAct;
}

export const ifAction:EvalAction = async (act: IAction, state:JsonFormsCore) : Promise<any> => {
    // Creare un'istanza di JsEval con un timeout di 2 secondi
    const jsEval = new JsEval(allowedGlobals, 2000);
    const data = _.cloneDeep(state.data);
      try {
        // add to the state the dependnet properties that coluld be missing
        const params = prepareParams(data, act);
        const result = jsEval.execute("return " + (act as IActionIfThenElse).condition, params);
        if(result === true)
            await evalActionGroup((act as IActionIfThenElse).then, state, data);
        else
            await evalActionGroup((act as IActionIfThenElse).else, state, data);
      } catch (e) {
          throw new ExceptionErrorObject({ instancePath: act.scope.replace('#/properties/', ''), keyword: 'script error', schemaPath: act.id??"(action)", params: {}, message: `script error: ${e}` },
          e as Error);
      }
    return data;
}


async function evalActionGroup(acts: IAction[], state: JsonFormsCore, data: any) {
    for (const a of acts) {
        const value = evalAction(a, state);
        data.data = await value;
    }
}

function evalAction(a: IAction, state: JsonFormsCore) {
    throw new Error("Function not implemented.");
}


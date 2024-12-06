import { JsonFormsCore } from "@jsonforms/core";
import { evalAction, EvalAction, evalActionGroup, ExceptionErrorObject, isStateChanged, prepareActions } from "../actions";
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
    let data;
    const jsEval = new JsEval(allowedGlobals, 2000);
      try {
        // add to the state the dependnet properties that coluld be missing
        const params = prepareParams(state.data, act);
        const result = jsEval.execute("return " + (act as IActionIfThenElse).condition, params);
        if(result === true)
            data = await evalActionGroup((act as IActionIfThenElse).then, state);
        else
            data = await evalActionGroup((act as IActionIfThenElse).else, state);
      } catch (e) {
          throw new ExceptionErrorObject({ instancePath: act.scope.replace('#/properties/', ''), keyword: 'script error', schemaPath: act.id??"(action)", params: {}, message: `script error: ${e}` },
          e as Error);
      }
    return data;
}


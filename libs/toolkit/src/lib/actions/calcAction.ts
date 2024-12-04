import { JsonFormsCore } from "@jsonforms/core";
import { EvalAction, ExceptionErrorObject } from "../actions";
import { IAction } from "../interfaces";
import _ from "lodash";
import { ErrorObject } from "ajv";
import {allowedGlobals, JsEval, prepareParams} from "./jsEval"
import { getActionDepends } from "../utils/dependency";

export interface IActionCalc extends IAction {
    script: string;
}

export const calcAction:EvalAction = (act: IAction, state:JsonFormsCore) : Promise<any> => {
    // Creare un'istanza di JsEval con un timeout di 2 secondi
    const jsEval = new JsEval(allowedGlobals, 2000);
    const data = _.cloneDeep(state.data);
      try {
        // add to the state the dependnet properties that coluld be missing
        const params = prepareParams(data, act);
        const result = jsEval.execute((act as IActionCalc).script, params);
        _.set(data, act.scope.substring("#/properties/".length).replace("/","."), result);
      } catch (e) {
          throw new ExceptionErrorObject({ instancePath: act.scope.replace('#/properties/', ''), keyword: 'script error', schemaPath: act.id??"(action)", params: {}, message: `script error: ${e}` },
          e as Error);
      }
    return Promise.resolve(data);
}



import { JsonFormsCore } from "@jsonforms/core";
import { EvalAction } from "../actions";
import { IAction } from "../interfaces";
import _ from "lodash";
import { ErrorObject } from "ajv";
import {JsEval} from "./jsEval"
import { getActionDepends } from "../utils/dependency";

export interface IActionCalc extends IAction {
    script: string;
}

export const calcAction:EvalAction = (act: IAction, state:JsonFormsCore) : JsonFormsCore => {
    const allowedGlobals = { console, Math, Date, Array, Boolean, String, Number, Map, Set, JSON }; // Whitelist per console e setTimeout
    
    // Creare un'istanza di JsEval con un timeout di 2 secondi
    const jsEval = new JsEval(allowedGlobals, 2000);
   
    const newState = { ...state};
      try {
        // Eseguire lo script
        console.log("Executing script for action:", (act as IActionCalc).id);
        // add to the state the dependnet properties that coluld be missing
        const params = _.cloneDeep(newState.data);
        getActionDepends(act).forEach(dep => {
          const prop = dep.replace("#/properties/","").replace("/",".");
          if(!_.get(params, prop)) 
            _.set(params, prop, undefined);
        });

        const result = jsEval.execute((act as IActionCalc).script, params);
        _.set(newState.data, act.scope.replace("#/properties/","").replace("/","."), result);
        console.log("Execution Result:", result);
      } catch (e) {
          console.error("Error during execution:", e);
          const err: ErrorObject = { instancePath: act.scope.replace('#/properties/', ''), keyword: 'script error', schemaPath: act.id??"(action)", params: {}, message: `script error: ${e}` };
          if(!newState.errors) newState.errors = [];
              newState.errors.push(err)
      }
    return newState;
}


import { JsonFormsCore } from "@jsonforms/core";
import { EvalAction } from "../actions";
import { IAction } from "../interfaces";
import _ from "lodash";
import { ErrorObject } from "ajv";
import {JsEval} from "./jsEval"

export interface IActionCalc extends IAction {
    script: string;
}

export const calcAction:EvalAction = (act: IAction, state:JsonFormsCore) : JsonFormsCore => {
    const allowedGlobals = { console, Math, Date, Array, Boolean, String, Number, Map, Set, JSON }; // Whitelist per console e setTimeout
    
    // Creare un'istanza di JsEval con un timeout di 2 secondi
    const jsEval = new JsEval(allowedGlobals, 2000);
    const newState = { ...state};
    (async () => {
        try {
          // Eseguire lo script
          const result = await jsEval.execute((act as IActionCalc).script, newState.data);
          _.set(newState.data, act.scope.replace("#/properties/","").replace("/","."), result);
          console.log("Risultato:", result);
        } catch (e) {
            console.error("Errore durante l'esecuzione:", e);
            const err: ErrorObject = { instancePath: act.scope.replace('#/properties/', ''), keyword: 'script error', schemaPath: act.scope, params: {}, message: `script error: ${e}` };
            if(!newState.errors) newState.errors = [];
                newState.errors.push(err)
        }
      })();

    return newState;
}

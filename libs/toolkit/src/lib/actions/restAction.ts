import { JsonFormsCore } from "@jsonforms/core";
import { EvalAction } from "../actions";
import { IAction } from "../interfaces";
//import { restClient } from "./restClient";

export interface IActionRest extends IAction {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body: string;
}

export const restAction:EvalAction = (act: IAction, state:JsonFormsCore) : JsonFormsCore => {
    /*const rest: restClient = new restClient( state, act.id, act.scope, act as IActionRest);
    rest
      .send()
      .then((value) => handleChange(path, value))
      .catch((error) => ctx.core?.errors?.push(
        {
          instancePath: path.replace('#/properties/', ''),
          keyword: 'rest service error',
          schemaPath: path,
          params: {},
          message: error
        }));
    console.log('Rest action', act);*/
    return state;
}


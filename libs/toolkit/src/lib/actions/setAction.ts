import { JsonFormsCore } from "@jsonforms/core";
import { EvalAction, ExceptionErrorObject } from "../actions";
import { IAction, MaybePromise } from "../interfaces";
import _ from "lodash";
import {allowedGlobals, JsEval, prepareParams} from "./jsEval"

export interface IActionSet extends IAction {
    value: any;
}

export const setAction:EvalAction = (act: IAction, state:JsonFormsCore) : MaybePromise<any> => {

    const data = _.cloneDeep(state.data);
    _.set(data, act.scope.substring("#/properties/".length).replace("/","."), (act as IActionSet).value);
    return data;
}



import { JsonFormsCore } from "@jsonforms/core";
import { EvalAction } from "../actions";
import { IAction, MaybePromise } from "../interfaces";
import _ from "lodash";
import { depends } from "../utils/dependency";

// copy Action
// copy the value from the source to the target
// source is the first dependency
// target is the scope
// if no source is provided, the whole data is returned
// if no target is provided, the whole data is returned
export const copyAction:EvalAction = (act: IAction, state:JsonFormsCore) : MaybePromise<any> => {
    const dependencies = depends(act);
    if(dependencies.length === 0)
        return _.cloneDeep(state.data);

    const value = _.get(state.data, dependencies[0].substring('#/properties/'.length).replace('/', '.'));
    
    const data = _.cloneDeep(state.data);
    _.set(data, act.scope.substring("#/properties/".length).replace("/","."), value);
    return data;
}



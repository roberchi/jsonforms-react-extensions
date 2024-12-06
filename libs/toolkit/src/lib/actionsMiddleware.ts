import { INIT, UPDATE_DATA, UPDATE_CORE, JsonFormsCore, CoreActions, Actions,   } from "@jsonforms/core";
import { IUISchemaToolkit } from "./interfaces";
import { ExceptionErrorObject, execute, prepare } from "./actions";
import _, { set } from "lodash";
import { ErrorObject } from "ajv";

type SetStatusCallback = (status: any) => void;
type SetErrorsCallback = (errors: ErrorObject[]) => void;
export type ExecutionStatus = "pending"|"fulfilled"|"failed";
type ExecutionStatuesCallback = (status: ExecutionStatus) => void;

export class ActionsMiddleware
{
    setStatusCallback:SetStatusCallback;
    setErrorsCallback:SetErrorsCallback;
    executionStatusCallback:ExecutionStatuesCallback;
    constructor(setStatusCallback:SetStatusCallback, setErrorsCallback:SetErrorsCallback, executionStatusCallback:ExecutionStatuesCallback) {
        this.setStatusCallback = setStatusCallback;
        this.setErrorsCallback = setErrorsCallback;
        this.executionStatusCallback = executionStatusCallback;
    }
    async = (state: JsonFormsCore, 
        action: CoreActions, 
        defaultReducer: (state: JsonFormsCore, action: CoreActions) => JsonFormsCore) => {
        switch (action.type) {
            case INIT:{
                console.log("Middleware INIT");
                // sort actions by dependencies
                const actionsToExecute = prepare((state.uischema as IUISchemaToolkit).actions);
                _.set(state, "actions", actionsToExecute);
                
                const afterReducer = defaultReducer(state, action);             
                this.executionStatusCallback("pending");    
                (async () => { 
                    try{
                        const actionsToExecute = _.get(state, "actions");
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        const result = await execute("on-init", actionsToExecute!, afterReducer);
                        this.setStatusCallback(result.data);
                        this.executionStatusCallback("fulfilled");
                    }
                    catch(e){
                        if(e instanceof ExceptionErrorObject)
                            this.setErrorsCallback([e.objectError]);
                        else
                            this.setErrorsCallback([{ instancePath:"/", keyword: 'action error', schemaPath: "(action)", params: {}, message: `call action error: ${(e as any).message}` }]);
                    
                        this.executionStatusCallback("failed");
                    }
                })();
                return afterReducer;
            }
            //case UPDATE_CORE:
            case UPDATE_DATA: {
                console.log("Middleware UPDATE_DATA");
                // execute actions and set new state  
                const afterReducer = defaultReducer(state, action);             
                    
                this.executionStatusCallback("pending");
                (async () => { 
                    try{
                        const actionsToExecute = _.get(state, "actions");
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        const result = await execute("on-change", actionsToExecute!, afterReducer, state);
                        this.setStatusCallback(result.data);
                        this.executionStatusCallback("fulfilled");
                    }
                    catch(e){
                        if(e instanceof ExceptionErrorObject)
                            this.setErrorsCallback([e.objectError]);
                        else
                            this.setErrorsCallback([{ instancePath:"/", keyword: 'action error', schemaPath: "(action)", params: {}, message: `call action error: ${(e as any).message}` }]);
                    
                        this.executionStatusCallback("failed");
                    }
                })();
                return afterReducer;
            }
            default:
                return defaultReducer(state, action);
        }
    }

    public static actionsMiddleware = (setStatusCallback:SetStatusCallback, setErrorsCallback:SetErrorsCallback,executionStatusCallback:ExecutionStatuesCallback) => {
        return new ActionsMiddleware(setStatusCallback, setErrorsCallback,executionStatusCallback).async;
    }
}

const setExecutionStatus = (state: JsonFormsCore, status: ExecutionStatus) => {
    _.set(state, "executionStatus", status);
}
export const getExecutionStatus = (state: JsonFormsCore): ExecutionStatus => {
    return _.get(state, "executionStatus")?? "pending";
}


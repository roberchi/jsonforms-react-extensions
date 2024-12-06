import { JsonFormsCore } from '@jsonforms/core';
import { EvalAction, ExceptionErrorObject } from '../actions';
import { IAction, MaybePromise } from '../interfaces';
import { prepareParams, JsEval, allowedGlobals } from './jsEval';
import { ErrorObject } from 'ajv';
import _ from 'lodash';
//import { restClient } from "./restClient";

export interface IActionRest extends IAction {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body: string;
  prepareBodyScript?: string;
  prepareUrlScript?: string;
  prepareHeadersScript?: string;
  mapResponseScript?: string;
}

export const restAction: EvalAction = async (act: IAction, state: JsonFormsCore): Promise<any> => {
  const restAct = act as IActionRest;
  const data = _.cloneDeep(state.data);

  // prepare data to post or put
  const body = prepareBody(restAct, state);
  // prepare url
  const url = prepareUrl(restAct, state);

  // prepare headers
  const headers = prepareHeaders(restAct, state);

  // TODO: authenticate rest client
    
  const result = await fetch(url, {
    method: restAct.method,
    body: body ? JSON.stringify(body) : null,
    headers: body ? { ...headers,
        'Content-Type': 'application/json'
    } : headers
  });
  if(result.status === 200) {
    const dataFromService = await result.json();
    // map response to state
    const mappedData = mapResponse(restAct, act, data, dataFromService);
    _.set(data, act.scope.substring('#/properties/'.length).replace('/', '.'), mappedData);
  }
  else {
    throw new ExceptionErrorObject({ instancePath: act.scope.replace('#/properties/', ''), keyword: 'http error', schemaPath: act.id??"(action)", params: {}, message: `call rest service error: ${result.status}` });
  };
  return data;  
};

const prepareHeaders = (restAct: IActionRest, state: JsonFormsCore): any => {
  let headers: any = {};
  const jsEval = new JsEval(allowedGlobals, 2000);
  if (restAct.prepareHeadersScript) {
    try {
      const params = prepareParams(state, restAct);
      headers = jsEval.execute(restAct.prepareHeadersScript, params);
    } catch (e) {
      throw new Error(`headers script error: ${e}`);
    }
  }
  return headers;
}

const mapResponse = (restAct: IActionRest, act: IAction, state: JsonFormsCore, dataFromService: any): any => {
  const jsEval = new JsEval(allowedGlobals, 2000);
  if (restAct.mapResponseScript) {
    try {
      const params = {response:dataFromService};
      return jsEval.execute(restAct.mapResponseScript, params);
    } catch (e) {
      throw new Error(`map response script error: ${e}`);
    }
  }
  return dataFromService;
}

const prepareBody = (restAct: IActionRest, state: JsonFormsCore): any => {
  if (restAct.method === 'POST' || restAct.method === 'PUT') {
    let body: any = restAct.body;
    const jsEval = new JsEval(allowedGlobals, 2000);
      if (restAct.prepareBodyScript) {
      // use script to prepare body
      try {
        const params = prepareParams(state, restAct);
        body = jsEval.execute(restAct.prepareBodyScript, params);
      } catch (e) {
        throw new Error(`body script error: ${e}`);
      }
    } else if (body && body.indexOf('${') >= 0) {
      // use simple template
      const params = prepareParams(state,restAct);
      body = body.replace(/\${(.*?)}/g, (_x: any, g: any) => _.get(params, g));
    }
    return body;
  }
  else return null;
}

const prepareUrl = (restAct: IActionRest, state: JsonFormsCore): string => {
  let url = restAct.url;
  const jsEval = new JsEval(allowedGlobals, 2000);
  if (restAct.prepareUrlScript) {
    try {
      const params = prepareParams(state, restAct);
      url = jsEval.execute(restAct.prepareUrlScript, params);
    } catch (e) {
      throw new Error(`url script error: ${e}`);
    }
  } else if (url && url.indexOf('${') >= 0) {
    // use simple template
    const params = prepareParams(state, restAct);
    url = url.replace(/\${(.*?)}/g, (_x: any, g: any) => _.get(params, g));
  }
  return url;
}
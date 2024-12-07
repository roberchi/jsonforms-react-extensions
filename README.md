# Jsonforms React (or not) Extensions
The goal of the toolkit library is to enhance the [JsonForms] (https://jsonforms.io/) framework by providing additional middleware capabilities. This allows developers to implement custom business logic and UI behaviors within their forms, including the ability to call external services. By leveraging this toolkit, JsonForms can be transformed into a more powerful low-code/no-code platform, enabling more dynamic and responsive form interactions.

## Action Middleware
The Action Middleware implements the extension of the JsonForms library to support the executon of Action to dynamically manupulate the data of the form.
The Action framework allow also to extends the basic action libaray to new custom actions you need.

### Actions and UI Schema
This framework uses and extends UI-Schema to allow you to configure the actions that you need to manipulate the forms data based on your business logic.

Actions are configured as part of the root element in the ui schema, using **actions** object property:

``` json
{
  "type": "VerticalLayout", 
   "actions":{
      "on-init":[
      {
        "scope": "#/properties/count",
        "kind": "calc",
        "script": "return filtered_employees && filtered_employees.length;",
        "depends": ["#/properties/filtered_employees"]
      },
      ...
      ],
      "on-change":[
        ...
      ],
      "on-event":[
        ...
      ],
      "refs":[
        ...
      ]
    },
    "elements": [
        ...
    ]
}

```
The actions object has 4 properties that rapresent the behavior of the actions' execution 
    - `'refs'`: The action is not executed. This behavior is used only to create an action to be referenced in other behavior using $ref.
    - `'on-init'`: The action is executed on initialization.
    - `'on-change'`: The action is executed on change.
    - `'on-event'`: The action is executed on a specific event.


### Action Configuration

An action in this context is configured by the following properties:
- `id`: An optional identifier for the action, it is requered in some action or if you what to refferr to it.
- `$ref`: A reference by id to another action.
- `scope`: The scope within which the action is executed, this is the form property that the action should change when executed. In case the action doesn't change directly the property it is ignored, e.g. the switch action doesn't use scope, the properties are changed in the case/default block. 
- `kind`: The kind of action, which can be either `'rest'`, `'calc'` or all registered actions see [Action availables](#actions-registered).
- `depends`: A string or an array of strings of path to a form properties that the action depends on, the dependencies is used to define is a action should be executed or not based. This is mandatory for action with behavior `on-change` but is ignored for other behavior.


## Actions registered

The action are registered using the API `registerAction` by passing the alias of the action, e.g. `if` or `['if', 'if-then-else']` and the function to execute the action flowed by the function to prepare the action.

`registerAction = (actType:string|string[], evalAct:EvalAction, prepareAct:PrepareAction=prepareInvariantAction)`
Registers an action with a specified type, evaluation function, and optional preparation function.
@param {string | string[]} actType - The type(s) of the action to register. Can be a single string or an array of strings.
@param {EvalAction} evalAct - The function to evaluate the action.
@param {PrepareAction} [prepareAct=prepareInvariantAction] - The optional function to prepare the action before evaluation. Defaults to `prepareInvariantAction`.

The actions registered are:
```TypeScript
registerAction('rest', restAction);
registerAction(['calc', 'calculus'], calcAction);
registerAction(['if-then-else','if'], ifAction, ifActionPrpeare)
registerAction('switch', switchAction, switchActionPrpeare)
registerAction('sequence', notYetImplemented)
registerAction(['for-each','foreach'], notYetImplemented)
registerAction('rise-event-on-array-change', notYetImplemented)
registerAction('set', setAction)
```

### REST Action

**kind: `rest`**

This action allow to call REST api and update the form data with the service outcome if needed.
The action configurations are the following

- `url`: The endpoint URL for the REST API. It can use url template to map form proerties on the url, e.g. `http://baseservice.com/employess/{id}`
- `method`: The HTTP method (GET, POST, PUT, DELETE).
- `body`: The request body for POST or PUT methods, it can use properties template like for url.
- `prepareBodyScript`: Optional script to dynamically - prepare the request body.
- `prepareUrlScript`: Optional script to dynamically prepare the URL.
- `prepareHeadersScript`: Optional script to dynamically - prepare the headers.
- `mapResponseScript`: Optional script to map the response data.
- authentication: not yet supported

In the following example the employyees service is called with GET method and the result an array, the array data type (id) is changet to match the json schema (string to int):

```json
{
      "scope": "#/properties/employees",
      "kind": "rest",
      "method": "get",
      "url": "http://localhost:3001/employees",
      "mapResponseScript": "response.forEach(e=> e.id = parseInt(e.id)); return response;"
}
```
### CALC Action

**kind: `calc` or `calculate`**

This action allow to exetute a JavaScript function snppet to calculate a value to be store in the propety in the scope of this action.
The script must return a value and can access to all variables of the form.

As show in the example the action is dependant on employees (that store a list of employee) and the filter to be applied:

```json
{
      "id": "filter-employees",
      "scope": "#/properties/filtered_employees",
      "kind": "calc",
      "script": "return employees.filter(e=>filter === undefined || filter === '' || e.name?.includes(filter) || e.surname?.includes(filter));",
      "depends": ["#/properties/employees", "#/properties/filter"]
    },
```
 The script returns the filtered array of the employees.
 
 NOTE: the variables could be undefined, so is a good practice to check it.

### if | if-then-else
### switch
### set

***kind: `set` ***

This action when fired allow to set a property to a specific value.

``` json
{
  "scope": "#/properties/color",
  "kind": "set",
  "value": "blue",
  "depends": "#/properties/setcolor"
}
```

### COPY Action

**kind: `copy`**

This action copies the value from a source property to a target property within the form data. The source is specified as the first dependency, and the target is specified as the scope. If no source is provided, the entire form data is returned as the source. Similarly, if no target is provided, the entire form data is returned as the target.

```json
{
  "scope": "#/properties/targetProperty",
  "kind": "copy",
  "depends": ["#/properties/sourceProperty"]
}
```
In this example, the value from `sourceProperty` is copied to `targetProperty`.

### not yet implemented

- sequence
- for-each
- rise-event...

## $ref Action

In the `refs` scope you can define all action that can be reference d by `id`, in all other scopes (on-change, on-init, on-event) and inside the scope of oather function e.g. `then` of siwcth action, you can refer an acrio by using `$ref`.
The action reffered is copied in the scope whaile the action is prepared to be execute (it happen in INIT of the JsonForm life cycle), all properties of the referred action are copyed and overrided by the value specify in the scope of `$ref`:

In this example if `selectBlue` is changed the `color` property is set to `blue`:
```json
{
  "actions":{
    "on-change":[
      {
        "$ref":"set-color",
        "value":"blue",
        "depens":"#/properties/selectBlue"
      }
    ],
    "refs":[
        {
            "id":"set-color",
            "scope": "#/properties/color",
            "kind": "set",
            "value": ""
          }
        ]
    }
}

```
# Run APP demo

To run the demo app with nock REST api use: 
`npx nx run  toolkit-app:serv-app-and-mock-api`

# open issue and roadmap

issue: 
- BUG: refs inside swith not prpeared: to be fix in [switchActionPrpeare](./libs/toolkit/src/lib/actions/switchAction.ts)
- warining on status update on INIT
- debounce, if needed
  
road map without priorities:
- implement REST service authentication call back
- implement on-event
- action for managed change array event
- if/than/else action
- switch/case action
- sequance action gropup


. other extensions:
  - dynamic control labels in the forms
  - dynamic combo options
  - navigation controll between forms
  
  

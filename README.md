# Jsonforms React (or not) Extensions
The goal of the toolkit library is to enhance the [JsonForms] (https://jsonforms.io/) framework by providing additional middleware capabilities. This allows developers to implement custom business logic and UI behaviors within their forms, including the ability to call external services. By leveraging this toolkit, JsonForms can be transformed into a more powerful low-code/no-code platform, enabling more dynamic and responsive form interactions.

## Action Middleware
The Action Middleware implements the extension of the JsonForms library to support the executon of Action to dynamically manupulate the data of the form.
The Action framework allow also to extends the basic action libaray to new custom actions you need.

### Actions and UI Schema
This framework uses and extends UI-Schema to allow you to configure the actions that you need to manipulate the forms data based on your business logic.

Actions are configured as part of the root element in the ui schema, using **action** object property:

``` json
{
  "type": "VerticalLayout", 
   "actions":[
    {
      "scope": "#/properties/count",
      "kind": "calc",
      "behavior": ["on-change", "on-init"],
      "script": "return filtered_employees && filtered_employees.length;",
      "depends": ["#/properties/filtered_employees"]
    },
    ...
    ],
    "elements": [
        ...
    ]
}

```
### Action Configuration

An action in this context is configured by the following properties:


- `id`: An optional identifier for the action, it is requered in some action or if you what to refferr to it.
- `behavior`: The behavior of the action, which can be a single `actionBehavior` or an array of `actionBehavior`, e.g. `'on-init'` or `['on-init', 'on-change']`.

Defines when the action should be executed. Possible values are:
    - `'not-execute'`: The action is not executed. This behavior is used only to create an action to be referenced in other behavior using $ref.
    - `'on-init'`: The action is executed on initialization.
    - `'on-change'`: The action is executed on change.
    - `'on-event'`: The action is executed on a specific event.

- `$ref`: A reference by id to another action.
- `scope`: The scope within which the action is executed, this is the form property that the action should change when executed.
- `kind`: The kind of action, which can be either `'rest'`, `'calc'` or all registered actions.
- `depends`: A string or an array of strings of path to a form properties that the action depends on, the dependencies is used to define is a action should be executed or not based. This is mandatory for action with behavior `on-change` but is ignored for other behavior.

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
      "behavior": ["on-change", "on-init"],
      "script": "return employees.filter(e=>filter === undefined || filter === '' || e.name?.includes(filter) || e.surname?.includes(filter));",
      "depends": ["#/properties/employees", "#/properties/filter"]
    },
```
 The script returns the filtered array of the employees.
 
 NOTE: the variables could be undefined, so is a good practice to check it.

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
      "behavior": "on-init",
      "method": "get",
      "url": "http://localhost:3001/employees",
      "mapResponseScript": "response.forEach(e=> e.id = parseInt(e.id)); return response;"
}
```





# Run APP demo

To run the demo app with nock REST api use: 
`npx nx run  toolkit-app:serv-app-and-mock-api`

# open issue and roadmap

issue: 
- warining on status update on INIT
- debounce, if needed
  
road map without priorities:
- implement REST service authentication call back
- implement on-event
- action for managed change array event
- if/than/else action
- switch/case action
- sequance action gropup
- refactoring behavior
  "actions":{
    "on-init":[... actions ...],
    "on-change": [... actions ...],
    "on-event": [... actions ...],
    "refs": [... actions ...] <<== not-executed

. other extensions:
  - dynamic control labels in the forms
  - dynamic combo options
  - navigation controll between forms
  
  

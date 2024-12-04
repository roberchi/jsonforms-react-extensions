# Toolkit Library

The toolkit library provides a set of utilities and middleware to enhance the functionality of JSON Forms. It includes:

- **Actions**: Define and register custom actions that can be executed based on specific behaviors (`on-init`, `on-change`, `on-event`, `not-execute`).
- **Middleware**: Integrate actions into the JSON Forms lifecycle, allowing for dynamic updates and interactions based on form data changes.
- **Dependency Management**: Handle action dependencies to ensure correct execution order.
- **Utilities**: Additional helper functions to support action evaluation and state management.

This library is designed to extend JSON Forms with custom logic and behaviors, making it more flexible and powerful for complex form scenarios.
## Configuring an Action in `ui-schema.json`

To configure an action in the `ui-schema.json`, follow these steps:

1. **Define the Action**: Add an action object to the `actions` array in your `ui-schema.json`. Each action should have a `scope`, `kind`, `behavior`, `script`, and `depends` properties.

2. **Scope**: Specify the JSON pointer to the property that the action affects.

3. **Kind**: Define the type of action. It can be either `calc` for calculated actions or `rest` for REST API calls.

4. **Behavior**: Set the behavior of the action. It can be `on-init`, `on-change`, `on-event`, or `not-execute`.

5. **Script**: Provide the script to be executed for `calc` actions.

6. **Depends**: List the properties that the action depends on.

### Example

```json
{
    "type": "VerticalLayout",
    "actions": [
        {
            "scope": "#/properties/count",
            "kind": "calc",
            "behavior": ["on-change", "on-init"],
            "script": "return filtered_employees && filtered_employees.length;",
            "depends": ["#/properties/filtered_employees"]
        },
        {
            "scope": "#/properties/employees",
            "kind": "rest",
            "depends": "#/properties/refresh",
            "behavior": "on-change",
            "method": "get",
            "url": "http://localhost:3001/employees"
        }
    ],
    "elements": [
        {
            "type": "Control",
            "scope": "#/properties/employees"
        }
    ]
}
```

In this example, the first action calculates the count of filtered employees and updates the `count` property. The second action fetches employee data from a REST API when the `refresh` property changes.


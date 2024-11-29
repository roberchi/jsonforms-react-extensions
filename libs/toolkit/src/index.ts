import { notYetImplemented, registerAction } from './lib/actions';
import { calcAction } from './lib/actions/calcAction';
import { restAction } from './lib/actions/restAction';

export * from './lib/toolkit';
export {actionsMiddleware} from './lib/actionsMiddleware';


// register actions for middleware
registerAction('rest', restAction);
registerAction('calc', calcAction);
registerAction('if-then-else', notYetImplemented)
registerAction('switch', notYetImplemented)
registerAction('sequence', notYetImplemented)
registerAction('for-each', notYetImplemented)



// TODO: use alias registerAction(['calculation','calc'], calcAction);

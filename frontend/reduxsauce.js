const {createActions} = require('reduxsauce');

const createdActions = createActions( {
    addParams: ['payload'],
    removeParam: ['id']
});

dispatch(createdActions.addParams({search}) )

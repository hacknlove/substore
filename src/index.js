const store = require('@hacknlove/reduxplus')
const { subStore, reducers } = require('./subStore')

store.subStore = subStore

exports.reducers = reducers

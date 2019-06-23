const db = require('../../../models');

exports.addUser = user => {
    return db.User.upsert(user, {
        where: {
            identifier: user.identifier
        }
    });
}
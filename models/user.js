module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        identifier: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        preferred_username: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        refresh_token: {
            type: DataTypes.STRING
        },
        access_token: {
            type: DataTypes.STRING
        }
    });

    User.associate = function(models) {
        models.User.hasMany(models.Stream);
    }

    return User;
}
module.exports = (sequelize, DataTypes) => {
    const Stream = sequelize.define('Stream', {
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        data: {
            type: DataTypes.JSON,
            allowNull: false
        }
    });

    Stream.associate = function(models) {
        models.Stream.belongsTo(models.User);
    }

    return Stream;
}
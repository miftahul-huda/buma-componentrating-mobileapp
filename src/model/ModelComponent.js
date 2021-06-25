import Sequelize from "rn-sequelize";
const Op = Sequelize.Op;
const Model = Sequelize.Model;

export default class ModelComponent extends Model {
    static initialize(sequelize, force=false)
    { 
        super.init({
            model:  Sequelize.STRING,
            pstype: Sequelize.STRING,
            component: Sequelize.STRING,
            manual: Sequelize.INTEGER
        }, 
        { sequelize, modelName: 'ModelComponent', tableName: 'ModelComponent', force: force });
    }
}
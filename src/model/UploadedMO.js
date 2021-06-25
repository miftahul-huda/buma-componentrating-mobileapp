import * as SQLite from "expo-sqlite";
import Sequelize from "rn-sequelize";
const Op = Sequelize.Op;
const Model = Sequelize.Model;

export default class UploadedMO extends Model {
    static async initialize(sequelize, force=false) {
        let o = await super.init(
            {
                mo_number:  Sequelize.STRING,
                unit_code: Sequelize.STRING,
                model: Sequelize.STRING,
                ps_type: Sequelize.STRING,
                location: Sequelize.STRING,
                component: Sequelize.STRING,
                date: Sequelize.STRING,
                hour_meter: Sequelize.STRING,
                process_date: Sequelize.STRING,
                sync_date: Sequelize.STRING,
                rating: Sequelize.STRING,
                rating_ir: Sequelize.STRING,
                is_sync: Sequelize.INTEGER,
                is_closed: Sequelize.INTEGER,
                filename: Sequelize.STRING,
                processed_by: Sequelize.STRING,
                rating_ir_values: Sequelize.TEXT
            },
            {
              sequelize,
              modelName: "UploadedMO",
              tableName: "UploadedMO",
              timestamps: false,
              force: force
            }
          );

          return o;
    }

}

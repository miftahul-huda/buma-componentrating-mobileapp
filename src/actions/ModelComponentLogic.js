import HttpClient from '../util/HttpClient';
import Config from '../config.json';
import ModelComponent from '../model/ModelComponent';
import MO from '../model/MO';
import MOLogic from './MOLogic';
import UploadedMOLogic from './UploadedMOLogic';
var dateFormat = require('dateformat');

import * as SQLite from "expo-sqlite";
import Sequelize from "rn-sequelize";

const Op = Sequelize.Op;
const Model = Sequelize.Model;
import GlobalSession from '../GlobalSession';

export default class ModelComponentLogic
{
    /***
     * Create new component local
     */

    static async create(component)
    {
        try {
            let newComponent = await ModelComponent.create(component);
            return newComponent;
        } catch (e) {
            return e;
        }
    }

    /***
     * Get all components for current MO number
     */
    static async getAllComponentByModelAndPsType()
    {
        try {

            let mo = await MOLogic.getLocalMO();

            if(mo != null)
            { 
                let mcs = await ModelComponent.findAll({
                    where:
                    {
                        [Op.and]:{
                            model: {
                                [Op.like] : '%' + mo.model + '%'
                            },
                            pstype: {
                                [Op.like] : '%' + mo.ps_type + '%'
                            },
                        }
                    }
                });

                return mcs;
            }
            else
                return [];
        } catch (e) {
            
        }
    }

    /***
     * Get all components for current MO number
     */
    static async getAllComponentByModel()
    {
        try {

            let componentNames = [];
            let components = [];
            let mo = await MOLogic.getLocalMO();
            console.log("getAllComponentByModel")
            console.log(mo)

            if(mo != null)
            { 
                let mcs = await ModelComponent.findAll({
                    where:
                    {
                        model: {
                            [Op.like] : '%' + mo.model + '%'
                        }
                    }
                });

                mcs.forEach(function(item){
                    if(componentNames.includes(item.component) == false)
                    {
                        components.push(item);
                        componentNames.push(item.component);
                    }
                })
                return components;
            }
            else
                return [];
        } catch (e) {
            
        }
    }


    /***
     * Get total of components for current MO number
     */
    static async getTotalAllComponent()
    {
        try {

            let total = await ModelComponent.count();
            return total


        } catch (e) {
            
        }
    }



    /***
     * Get total of components for current MO number
     */
    static async getAllComponent()
    {
        try {

            let components = await ModelComponent.findAll();
            return components


        } catch (e) {
            
        }
    }

    /***
     * Get total of components for current MO number
     */
    static async getTotalComponentByModelAndPsType()
    {
        try {

            let mo = await MOLogic.getLocalMO();

            if(mo != null)
            { 
                let total = await ModelComponent.count({
                    where:
                    {
                        [Op.and]:{
                            model: {
                                [Op.like] : '%' + mo.model + '%'
                            },
                            pstype: {
                                [Op.like] : '%' + mo.ps_type + '%'
                            },
                        }
                    }
                });

                return total
            }
            else 
                return 0;

        } catch (e) {
            
        }
    }

    /***
     * Get all  processed components for current MO number
     */
    static async getAllProcessedComponent()
    {
        try {
            let components = [];
            let componentNames = [];
            let uploadedMos = await UploadedMOLogic.getAllLocalUploadedMOByMONumber();
 
            console.log("getAllProcessedComponent")
            console.log(uploadedMos)
            let modelComponents = await this.getAllComponent();
            await modelComponents.forEach(async function(item){
                await uploadedMos.forEach(function(item2){
                    if(item.component == item2.component)
                    {
                        console.log("here " + item.component);
                        if(componentNames.includes(item.component) == false)
                        {
                            componentNames.push(item.component);
                            components.push(item);
                        }
                    }
                })
            });
            return components;
            
        } catch (e) {
            return [];
        }
    }

    /***
     * Get total of processed components for current MO number
     */
    static async getTotalProcessedComponent()
    {
        try {
            let components = await this.getAllProcessedComponent();
            return components.length;
            
        } catch (e) {
            console.log(e);
        }
    }
}
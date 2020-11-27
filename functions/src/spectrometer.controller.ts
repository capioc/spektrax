import { analyzeData } from "./spectrometer.service";
import { Request, Response } from "express";


export const index = async function (req: Request, res: Response) {
    try {
        // get csv data based on id provided in the form
        if (req.params.id) {
            const result = await analyzeData(req.params.id);
            res.json(result);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Something went wrong');
    }
};

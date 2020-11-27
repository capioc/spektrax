import * as admin from 'firebase-admin';
import * as GCS from '@google-cloud/storage';
import { parse } from 'csv';

// admin.initializeApp();
const storage = new GCS.Storage();
const db = admin.firestore();


interface spectrumValue {
    wavelength: number;
    intensity: number;
    derivative?: number;
}

export const analyzeData = async function (analysisId:string) {
    try {
        const inMemoryFile = await downloadCSV(analysisId);
        const result = await parseCSV(inMemoryFile);
        await db.collection('analysis')
                .doc(analysisId)
                .set({spectrum: result}, { merge: true });
        
        return result;
    } catch (error) {
        console.log(error)
        return error;
    }
    
}

async function downloadCSV(fileName: string) {
    const bucket = storage.bucket('spektrax-assignment.appspot.com');
    const file = bucket.file(fileName);
    const content = await file.download();
    console.log('finished dl', content[0]);
    return content[0];
}

function parseCSV(file: any) {
    const parser = parse({
        delimiter: ',',
        columns: true
    })
    
    const output: any = [];
    
    parser.write(file);
    parser.end();

    return new Promise((resolve, reject) => {
        parser.on('readable', function () {
            let record;
            let parsedRecord: spectrumValue
            record = parser.read()
            while (record) {
                console.log(record)
                parsedRecord = {
                    wavelength: parseFloat(record.wavelength),
                    intensity: parseFloat(record.intensity)
                }
                output.push(calculateDerivative(parsedRecord));
                record = parser.read()
            }
        })
        // Catch any error
        parser.on('error', (err) => {
            console.error(err.message)
            reject(err);
        })
        // When we are done, test that the parsed output matched what expected
        parser.on('end', () => {
           console.log('finished parsing !!!', output.length)
           resolve(output);
        })
    
    })
}

function calculateDerivative(record: spectrumValue) {
    const {intensity} = record;
    const derivative = intensity - (intensity << 1);
    return { ...record, derivative}

}
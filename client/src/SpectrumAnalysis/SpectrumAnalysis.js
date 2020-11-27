import React, { useState } from 'react';
import { storage, db, timestamp } from '../firebaseConfig';
import axios from 'axios';
import AnalysisChart from './AnalysisChart';

const UploadForm = () => {
    const [formData, setFormData] = useState({});
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [displayCharts, setDisplayCharts] = useState(false);
    const [progress, setProgress] = useState(0);
    const [url, setUrl] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [logs, setLogs] = useState([]);
    // const { progress, url } = useStorage(file);

    const handleInput = e => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }
    const types = [
        'text/plain',
        'application/vnd.ms-excel',
        'text/x-csv'
    ];

    const handleFileInput = (e) => {
        let selected = e.target.files[0];

        if (selected && types.includes(selected.type)) {
            setFile(selected);
            setLogs([`File selected: ${selected.name}`])
            setError('');
        } else {
            setFile(null);
            setError('Please select a CSV file');
        }
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        uploadFile();

    }
    const createAnalysis = async (url) => {
        console.log('create analysis')
        const a = {
            _id: formData.id,
            comment: formData.comment,
            time: timestamp(),
            file: url
        }
        setAnalysis({
            _id: formData.id,
            comment: formData.comment,
            time: timestamp(),
            file: url
        });
        await db.collection('analysis').doc(formData.id).set(a);

        console.log('after await')
        return a;

    }
    const uploadFile = () => {
        setFile({
            ...file,
            name: formData.id
        });
        setLogs([...logs, "Upload started"])

        const storageRef = storage.ref(formData.id);
        const collectionRef = db.collection('analysis');

        storageRef.put(file).on('state_changed', (snap) => {
            let percentage = (snap.bytesTransferred / snap.totalBytes) * 100;
            setProgress(percentage);
        }, (err) => {
            setError(err);
        }, async () => {
            const url = await storageRef.getDownloadURL();
            // const createdAt = timestamp();
            setLogs([...logs, "Upload finished"])
            const _analysis = await createAnalysis(url);
            console.log('here', _analysis)
            setUrl(url);
            setFormData({
                id: '',
                comment: ''
            })
            setFile(null);
            await performAnalysis(_analysis);
        });

    }
    const performAnalysis = async (a) => {
        setError(false);
        setIsLoading(true);
        setLogs([...logs, "Analysis started"])
        console.log('perform', analysis)
        axios.get(`https://us-central1-spektrax-assignment.cloudfunctions.net/api/spectrometer/${a._id}`)
            .then(response => {
                console.log(response.data)
                setAnalysis({
                    data: response.data
                });
                setIsLoading(false);
                setLogs([...logs, "Analysis finished"])
                setDisplayCharts(true);
            })
            .catch(error => {
                setError(error);
                setIsLoading(false);
            });
    }

    return (
        <div>
            <div className="form-container">
                <form className="form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="id"
                        placeholder="id"
                        onChange={handleInput}
                        value={formData.id || ''}
                        required
                        className="form-input"
                    />
                    <textarea
                        type="text"
                        name="comment"
                        placeholder="Message"
                        onChange={handleInput}
                        value={formData.comment || ''}
                        required
                        className="form-input"
                    ></textarea>
                    <label className="form-file-input button">
                        <span>Choose File</span>
                        <input 
                            type="file"
                            onChange={handleFileInput}
                            
                            required
                        />
                    </label>
                    <button className="button" type="submit">Submit</button>
                </form>
                <div className="status-container">
                    <h3>Logs</h3>
                    <div className="selected-file">
                            {error && <div className="error">{error}</div>}
                            {/* {file && <div>selected file: {file.name}</div>} */}
                            {/* {file && <ProgressBar file={file} setFile={setFile} />} */}
                            {/* {isLoading && progress} */}
                    </div>
                    <div>
                        {logs.map((l,index) => (
                            <p key={index}>
                                -- {l}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
            {/* <div>{analysis}</div> */}
            { displayCharts && analysis.data &&
                (<div className="charts-container">{analysis._id}
                    <h3>Normal Spectrum</h3>
                    <AnalysisChart data={analysis.data} derivative={false} />
                    <h3>First Derivative</h3>
                    <AnalysisChart data={analysis.data} derivative={true} />
                </div>
                )
            }

        </div>
    )

}

export default UploadForm;
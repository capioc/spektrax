import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Label } from 'recharts';


const AnalysisChart = ({ data, derivative }) => {
    console.log(data, derivative)
    if (data) {
        return (
            <LineChart width={800} height={400} data={data} margin={{ top: 25, right: 25, bottom: 25, left: 25 }}>
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="wavelength">
                </XAxis>
                <YAxis>
                </YAxis>
                <Tooltip />
                <Line type="monotone"
                    dataKey={derivative ? "derivative" : "intensity"} 
                    stroke="#8884d8"
                />
            </LineChart>
        );
    }
};

export default AnalysisChart;
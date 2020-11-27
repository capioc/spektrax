import './App.css';
import spektraxLogo from './SPEKTRAX_LOGO_LIGHT.png'
import UploadForm from "./SpectrumAnalysis/SpectrumAnalysis";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={spektraxLogo} className="" width="250" alt="logo" />
        <p>
          Enter ID, Comment and choose a CSV file to start a new analysis
        </p>
      </header>
        <UploadForm />
    </div>
  );
}

export default App;

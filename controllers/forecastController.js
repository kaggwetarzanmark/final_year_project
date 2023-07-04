const { exec } = require('child_process');

function forecast (req, res) {
    const product_name = 'apple';
  
    const pythonProcess = exec(`python ./preprocess_module.py ${product_name}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing Python script: ${error.message}`);
        res.status(500).send('Internal Server Error');
        return;
      }
  
      if (stderr) {
        console.error(`Python script error: ${stderr}`);
        res.status(500).send('Internal Server Error');
        return;
      }
  
      const pythonOutput = stdout.trim();
      res.send(`Python script output: ${pythonOutput}`);
    });
  
    pythonProcess.on('error', (error) => {
      console.error(`Error executing Python process: ${error.message}`);
      res.status(500).send('Internal Server Error');
    });
  };
  module.exports = {
    forecast
  };
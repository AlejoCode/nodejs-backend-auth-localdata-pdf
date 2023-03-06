const { ObjectId } = require("mongodb");
const fs = require('fs');

module.exports = app => {

  app.post('/api/users', async function(req, res) {
    try {
      const data = req.body;
      const expectedProperties = ['name', 'email', 'role', 'password'];
      const missingProperties = expectedProperties.filter(prop => !data[prop]);

      if (missingProperties.length > 0) {
        return res.status(400).send(`Missing properties: ${missingProperties.join(', ')}`);
      }
      
      const userObject = {
        _id: new ObjectId(),
        ...data,
      };

      const dataFilePath = 'users.json';
      let dataArray = [];

      // Check if the file exists
      const fileExists = fs.existsSync(dataFilePath);

      // If the file exists, read its content
      if (fileExists) {
        const fileData = await fs.promises.readFile(dataFilePath);
        dataArray = JSON.parse(fileData);
      }

      // Add the new company object to the array
      dataArray.push(userObject);

      // Write the updated data to the file
      await fs.promises.writeFile(dataFilePath, JSON.stringify(dataArray));

      return res.status(201).send(userObject);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Internal server error');
    }
  });

  app.put('/api/users/:id', async function(req, res) {
    try {
      const userId = req.params.id;
      const newData = req.body;

      const dataFilePath = 'users.json';
      let dataArray = [];

      // Check if the file exists
      const fileExists = fs.existsSync(dataFilePath);

      // If the file exists, read its content
      if (fileExists) {
        const fileData = await fs.promises.readFile(dataFilePath);
        dataArray = JSON.parse(fileData);
      }

      // Find the company object to update
      const userIndex = dataArray.findIndex(c => c._id.toString() === userId);

      if (userIndex === -1) {
        return res.status(404).send('User not found');
      }

      const oldData = dataArray[userIndex];
      const updatedData = { ...oldData, ...newData };

      // Update the company object in the array
      dataArray[userIndex] = updatedData;

      // Write the updated data to the file
      await fs.promises.writeFile(dataFilePath, JSON.stringify(dataArray));

      return res.status(200).send(updatedData);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Internal server error');
    }
  });

  app.get('/api/users', async function(req, res) {
    try {
      const dataFilePath = 'users.json';
      let dataArray = [];

      // Check if the file exists
      const fileExists = fs.existsSync(dataFilePath);

      // If the file exists, read its content
      if (fileExists) {
        const fileData = await fs.promises.readFile(dataFilePath);
        dataArray = JSON.parse(fileData);
      }

      return res.status(200).json(dataArray);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Internal server error');
    }
  });

  app.get('/api/users/:userId', function(req, res) {
    const userId = req.params.userId;
    const dataFilePath = 'users.json';

    fs.readFile(dataFilePath, (err, data) => {
      if (err) throw err;
      const json = data.toString();
      const dataArray = JSON.parse(json);
      const company = dataArray.find(c => c._id === userId);
      if (!company) {
        res.status(404).send('User not found');
      } else {
        res.send(company);
      }
    });
  });

  app.delete('/api/users/:userId', function(req, res) {
    const userId = req.params.userId;
    const dataFilePath = 'users.json';

    fs.readFile(dataFilePath, (err, data) => {
      if (err) throw err;
      const json = data.toString();
      let dataArray = JSON.parse(json);
      const index = dataArray.findIndex(c => c._id === userId);
      if (index === -1) {
        res.status(404).send('Company not found');
      } else {
        // Remove the company from the array
        dataArray.splice(index, 1);
        // Write the updated data to the file
        fs.writeFile(dataFilePath, JSON.stringify(dataArray), (err) => {
          if (err) throw err;
          console.log('Data written to file');
          res.status(204).send(); // No content response
        });
      }
    });
  });
  
}


const { ObjectId } = require("mongodb");
const fs = require('fs');
const pdf = require('html-pdf');
const mustache = require('mustache');

const nodemailer = require('nodemailer');

module.exports = app => {

  app.post('/api/companies', async function(req, res) {
    try {
      const data = req.body;
      const expectedProperties = ['companyname', 'address', 'nit', 'phone'];
      const missingProperties = expectedProperties.filter(prop => !data[prop]);

      if (missingProperties.length > 0) {
        return res.status(400).send(`Missing properties: ${missingProperties.join(', ')}`);
      }
      
      const companyObject = {
        _id: new ObjectId(),
        ...data,
        inventory: []
      };

      const dataFilePath = 'companies.json';
      let dataArray = [];

      // Check if the file exists
      const fileExists = fs.existsSync(dataFilePath);

      // If the file exists, read its content
      if (fileExists) {
        const fileData = await fs.promises.readFile(dataFilePath);
        dataArray = JSON.parse(fileData);
      }

      // Add the new company object to the array
      dataArray.push(companyObject);

      // Write the updated data to the file
      await fs.promises.writeFile(dataFilePath, JSON.stringify(dataArray));

      return res.status(201).send(companyObject);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Internal server error');
    }
  });

  app.put('/api/companies/:id', async function(req, res) {
    console.log('/api/companies/:id : ' + (req))
    try {
      const companyId = req.params.id;
      const newData = req.body;
      console.log('companyId : '+ companyId)
      console.log('newData  : '+ JSON.stringify(newData))
      const dataFilePath = 'companies.json';
      let dataArray = [];

      // Check if the file exists
      const fileExists = fs.existsSync(dataFilePath);

      // If the file exists, read its content
      if (fileExists) {
        const fileData = await fs.promises.readFile(dataFilePath);
        dataArray = JSON.parse(fileData);
      }

      // Find the company object to update
      const companyIndex = dataArray.findIndex(c => c._id.toString() === companyId);

      if (companyIndex === -1) {
        return res.status(404).send('Company not found');
      }

      const oldData = dataArray[companyIndex];
      console.log('old data : '+ JSON.stringify(oldData))
      // console.log('newData  : '+ JSON.stringify(newData))

      const updatedData = { ...oldData, ...newData };
      console.log('updatedData  : '+ JSON.stringify(updatedData))

      // Update the company object in the array
      dataArray[companyIndex] = updatedData;

      // Write the updated data to the file
      await fs.promises.writeFile(dataFilePath, JSON.stringify(dataArray));

      return res.status(200).send(updatedData);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Internal server error');
    }
  });

  app.get('/api/companies', async function(req, res) {
    try {
      const dataFilePath = 'companies.json';
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

  app.get('/api/companies/:companyId', function(req, res) {
    const companyId = req.params.companyId;
    const dataFilePath = 'companies.json';

    fs.readFile(dataFilePath, (err, data) => {
      if (err) throw err;
      const json = data.toString();
      const dataArray = JSON.parse(json);
      const company = dataArray.find(c => c._id === companyId);
      if (!company) {
        res.status(404).send('Company not found');
      } else {
        res.send(company.inventory);
      }
    });
  });

  app.post('/api/companies/:companyId/inventory', function(req, res) {
    const companyId = req.params.companyId;
    const dataFilePath = 'companies.json';
  
    // Read the data file and parse the contents as JSON
    fs.readFile(dataFilePath, (err, data) => {
      if (err) throw err;
      const json = data.toString();
      const dataArray = JSON.parse(json);
  
      // Find the company with the given ID
      const company = dataArray.find(c => c._id === companyId);
      if (!company) {
        res.status(404).send('Company not found');
      } else {
        // Get the name and quantity from the request body
        const { name, quantity } = req.body;
  
        // Add the new inventory item to the company's inventory array
        company.inventory.push({ name, quantity });
  
        // Write the updated data back to the file
        const updatedJson = JSON.stringify(dataArray, null, 2);
        fs.writeFile(dataFilePath, updatedJson, err => {
          if (err) throw err;
          res.send(company.inventory);
        });
      }
    });
  });

  async function generatePDF(data) {
    // Launch a new headless Chrome instance
    const browser = await puppeteer.launch();
  
    // Create a new page
    const page = await browser.newPage();
  
    // Set the content of the page
    const htmlContent = '<html><body><h1>My PDF Content</h1></body></html>';
    await page.setContent(htmlContent);
  
    // Generate a PDF of the page
    const pdfBuffer = await page.pdf();
  
    // Close the browser
    await browser.close();
  
    // Return the PDF buffer
    return pdfBuffer;
  }

  app.post('/api/companies/:companyId/inventory/pdf', function(req, res) {
    const companyId = req.params.companyId;
    const dataFilePath = 'companies.json';
  
    // Read the data file and parse the contents as JSON
    fs.readFile(dataFilePath, async (err, data) => {
      if (err) throw err;
      const json = data.toString();
      const dataArray = JSON.parse(json);
  
      // Find the company with the given ID
      const company = dataArray.find(c => c._id === companyId);
      if (!company) {
        res.status(404).send('Company not found');
      } else {
        // Get the inventory from the request body
        const inventory = req.body.inventory;
        const email = req.body.email;
        const createPdf = (inventory) => {
          const html = `
            <html>
              <head>
                <style>
                  /* Define your styles here */
                </style>
              </head>
              <body>
                <h2>Inventory</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${inventory.map((item) => `
                      <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </body>
            </html>
          `;
          
          // Use the html-pdf library to generate the PDF
          const options = { format: 'Letter' };
          return new Promise((resolve, reject) => {
            pdf.create(html, options).toBuffer((err, buffer) => {
              if (err) {
                reject(err);
              } else {
                resolve(buffer);
              }
            });
          });
        };

        createPdf(inventory).then((pdfBuffer) => {
          // Do something with the PDF buffer, e.g. save to file or send as response
          fs.writeFile(`inventory_${companyId}.pdf`, pdfBuffer, (err) => {
            if (err) {
              console.error(err);
            } else {
              console.log('PDF saved to inventory.pdf');
            }
          });
            // Send email with PDF attachment
            const transporter = nodemailer.createTransport({
              service: 'Hotmail',
              auth: {
                user: 'daniel.salgado01@hotmail.com',
                pass: process.env.MAIL_PASSWORD
              }
            });

            const mailOptions = {
              from: 'daniel.salgado01@hotmail.com',
              to: email,
              subject: 'Inventory PDF',
              text: 'Please find attached the inventory PDF.',
              attachments: [{
                filename: 'inventory.pdf',
                content: pdfBuffer
              }]
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.error(error);
              } else {
                console.log('Email sent: ' + info.response);
                res.send(info.response)
              }
            });
        }).then((err) => {
          console.error(err);
        })
        .catch((err) => {
          console.error(err);
        });
        
      }
    });
  });

  app.delete('/api/companies/:companyId', function(req, res) {
    const companyId = req.params.companyId;
    const dataFilePath = 'companies.json';

    fs.readFile(dataFilePath, (err, data) => {
      if (err) throw err;
      const json = data.toString();
      let dataArray = JSON.parse(json);
      const index = dataArray.findIndex(c => c._id === companyId);
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


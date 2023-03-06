const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;
const adminEmail = 'daniel.salgado02@gmail.com'
const adminPassword = 'XXXXXX123456'
const secretKey = 'oigjfdosgnsaignseoafenawoinoijuyGNBTYFBKIULBGYOFASFASFFGAFG2342345'
const users = require ('../users.json')

module.exports = app => {
    let adminPasswordHash;

    // Encrypt the admin password and store it in the adminPasswordHash variable
    bcrypt.hash(adminPassword, SALT_ROUNDS, function(err, hash) {
        if (err) {
            console.error(err);
        } else {
            adminPasswordHash = hash;
        }
    });

    app.post('/api/auth', function(req, res) {
        let data = req.body;
        const expectedProperties = ['email', 'password'];
        const missingProperties = expectedProperties.filter(prop => !data[prop]);
        console.log(data )

        if (missingProperties.length > 0) {
            return res.status(400).send(`Missing ${missingProperties.join(', ')}`);
        } else {
            let password = data.password;
            let email = data.email;
            console.log('password : ' + password)
            //

            let searchResult = null;

            for (let i = 0; i < users.length; i++) {
            if (users[i].email === email) {
                searchResult = users[i];
                break;
            }
            }


            if (searchResult) {
            console.log("ID : ", searchResult._id);
            console.log("Email : ", searchResult.email);
            console.log("Password : ", searchResult.password);

            
            console.log("passwordddddd : ",password);

            console.log("Name:", searchResult.name);
            console.log("Role:", searchResult.role);
            console.log('sending response', { searchResult });

            res.status(200).json({ searchResult });

            // res.status(200).json({ success: true, message: "Find User successful.", user: searchResult });
            // if (bcrypt.compareSync(searchResult.password, password)) {
            //     console.log('Password match!');
            //     const token = jwt.sign({ userId: searchResult._id }, secretKey);
            //     res.status(200).json({ token: token, role:  searchResult.role, name: searchResult.name});
            //   } else {
            //     console.log('Password does not match!');
            //     res.status(500).send(false);
            //   }
            // } 
            }
            else {
            console.log("No search results found.");
            res.status(500).send(false);
            }
            //
           
        }
    });


    // app.post('/admin/auth', function(req,res) {
    //     let data = req.body;
    //     const expectedProperties = ['email', 'password',];
    //     const missingProperties = expectedProperties.filter(prop => !data[prop]);

    //     console.log('data : ' +Object.keys(data).length)
    //     if (missingProperties.length > 0) {
    //         return res.status(400).send(`Missing ${missingProperties.join(', ')}`);
    //       } else {
    //         let password = data.password
    //         let email = data.email
    //         if(email == adminEmail && password == adminPassword ) {
    //             console.log('auth admin : true')
    //             res.send(true) 
    //         } else {
    //             console.log('auth admin : false')
    //             res.status(400).send(false)
    //         }
            
    //     }
    // })
}
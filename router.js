const router = require('express').Router();
const {check,validationResult} = require('express-validator')
const {connection} = require('./auth/DB')
const path = require("path");
const fs = require("fs");
const multer = require('multer')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const {SendMailer} = require('./Middleware/Mail')
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5242880
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|pdf|xlsx|png)$/)) {
      return cb(new Error('Please upload a Image'))
    }
    cb(undefined, true)
  }
})

router.get('/getMessage',(req,res)=> { 
    connection.query('SELECT * FROM chat',(err,result) => {
      if(err){
        console.log('err',err)
        res.status(400).json(err)
      }
      let valu = []

      result.forEach((res) => {
        if(!valu[res.name]){
          valu[res.name] = []
        }
        valu[res.name].push(res)
      })

      let key = Object.keys(valu) 
    
    console.log('res', valu)
      res.status(200).json(result)
    })
  })


  router.post('/save_user' , upload.fields([
    { name: "image", maxCount: 1 },
  ]), (req, res) => {
    console.log("tyrtytyrtyrrrryj", req.body);  
  
    let profile_image = "";
    
          if (req.files?.image) {
            const extension = req.files.image[0]["mimetype"].split('/')[1]
            profile_image = req.files.image[0]["filename"] + '.' + extension
          }

          let password = ''
          if(req.body?.password){
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(req.body?.password, salt);
            password = hash
          }

          connection.query(`INSERT INTO user (name,email,password,image,status) values('${req.body?.name}','${req.body?.email}','${password}','${profile_image ?? ''}','1')`, (err, results) => {
        if (err) {
          console.error('Error executing query:', err);
          res.send({ message: err });
          return;
        } else {        
          if (req.files?.image) {
            const currentPath = path.join(process.cwd(), "uploads", req.files.image[0]["filename"]);
            const destinationPath = path.join(process.cwd(), "uploads/users/profile_image/" + `${results.insertId}`, profile_image);
            const baseUrl = process.cwd() + '/uploads/users/profile_image/' + `${results.insertId}`
            fs.mkdirSync(baseUrl, { recursive: true })
            console.log("baseUrl",baseUrl)
            console.log("baseUrl",destinationPath)
            fs.rename(currentPath, destinationPath, function (err) {
              if (err) {
                throw err
              } else {
                console.log("Successfully Profile image Uploaded!")
              }
            });
          }
          res.send({
            "status": 200,
            "message": "success!"          
          });
        }
      
        console.log('Query results:', results.insertId);
      });
  });



  router.post('/login',[
    check('email',"invalid mail id").isEmail(),
    check('password','Password length should be 6 to 10 characters').isLength({min:6,max:10})
  ],async(req, res)=> {
    try {
      const email = req.body?.email;
      const password = req.body?.password ?? '';
      console.log("wrhiwuriweurhioewrh",req.body ); 
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        res.status(400).json(errors)
         console.log('valid',errors)
     }else{
       connection.query(`SELECT * FROM user where email = ?`,[email],(err,result) => {
         if(err){
           res.status(400).json({"err1":err.message})
           console.log('err',err)
         }else{
           // const image = path.join(__dirname,'/uploads/users/profile_image/'+result[5].id,result[5].image)    
           // const baseUrl = 'http://localhost:4000' + '/uploads/users/profile_image/' + `${result[5].id}/${result[5].image}`
           if(result?.length > 0){
             let userData = []
             let userValue = {}
             result.forEach(data => {
               const profile = 'http://localhost:4000' + '/uploads/users/profile_image/' + `${data.id}/${data.image}` 
               userData.push({...data,'image':profile})
               userValue = {...data,'image':profile}
             })
             
             const token = jwt.sign(userValue ?? email,'key',{expiresIn:'24h'})
             let detail = {"name":userValue.name,"email":userValue.email,"token":token,'image':userValue.profilem,'id':userValue?.id}
             bcrypt.compare(password,userValue?.password,(err,result1)=> {
               if(err) console.log('err',err)
               if(result1){
                 res.status(200).json({'status':200,"data":detail})
               }else{
                 res.status(400).json({"message":'Password incorrect'})
               }
             })
           }else{
             res.status(400).json({"message":'User Not Found'})
           }
         }
       })
     }

    } catch (error) {
      res.status(400).json({"err":error.message})
    }
  })  


  router.post('/logout',async(req,res)=> {
    const id = req.body.id
    connection.query(`UPDATE user SET status = '0' WHERE id = ?`,[id],(err,result) => {
      if(err) { console.log('err',err)}
      res.status(200).json({status:"200",message:'logout success'})
    })
  }) 

  router.post('/forget-password',async(req,res)=> {
    const email = req.body.email 
    connection.query(`SELECT * FROM user WHERE email =?`,[email],(err,result)=>{
      if(err) console.log('err',err.message)
      if(result?.length > 0){
        const mail = {
          from : 'peakyblinders1tommy@gmail.com',
          to:'bmjagan17@gmail.com',
          subject:"test",
          text:'test'
        }
        const suss =  SendMailer(mail) 
        if(suss){
          res.status(200).json({status:'success',message:'mail Sended Successfully!'})
        }
      }else{
        res.status(400).json({status:"Fail",message:"user not found",result})
      }
    })
  })


  router.get('/customers', async(req,res) => {
    try {
      const id = req.query.id
      connection.query(`SHOW TABLES LIKE 'customers';`,(err,result) => {
        if(err) res.json(err)
        if(!result.length > 0){
      connection.execute(`CREATE TABLE customers ( id INT AUTO_INCREMENT PRIMARY KEY , name VARCHAR(50), user_id INT, FOREIGN KEY(user_id) REFERENCES user(id) )`)
        connection.execute(`SELECT * FROM user where id = ?`,[id],(err1,data)=> {
          if(err1) res.json(err1)
          connection.query('INSERT INTO customers (name, user_id) VALUES (?, ?)',[data[0]?.name,data[0]?.id],(err2,final)=> {
            if(err2) res.json(err2)
            res.status(200).json({'message':"success"})
          })
        })
        }else {
          connection.execute(`SELECT * FROM user where id = ?`,[id],(err1,data)=> {
            if(err1) res.json(err1)
            connection.query('INSERT INTO customers (name, user_id) VALUES (?, ?)',[data[0]?.name,data[0]?.id],(err,final)=> {
              if(err) res.json(err)
              res.status(200).json({'message':"success"})
            })
          })
        }
      })
    } catch (error) {
      res.json({"err":error})
    }
  })

  router.get('/info', async(req,res) => {
    try {
      const userId = req.query.userId
      //  connection.query('SELECT * FROM customers LEFT JOIN user ON user.id = customers.chat_id',(err,result)=> {
        connection.query( 'SELECT *  FROM user LEFT JOIN customers ON user.id = customers.user_id WHERE user.id = ?',[userId],(err,result)=> {
          const data = result.filter(e => e.id != null)
         res.status(200).json({"data":data})
       })
    } catch (error) {
      res.json({"err":error})
    }
  })



   


  module.exports = router
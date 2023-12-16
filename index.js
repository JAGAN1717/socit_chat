const express = require('express');
const cors = require('cors');
const user = require('./router');
const app = express();
const {connection} = require('./auth/DB');
const {test} = require('./Middleware/testfile')
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const moment = require('moment/moment');
const socketIO = require('socket.io')(http, {
  cors: {
      origin: "http://localhost:4000",
      origin: "http://localhost:3001"
  }
});
let users = [];

app.use(cors()) 
app.use(express.json());
// app.use(express.urlencoded({extended: true })); 
// app.use(bodyParser.urlencoded({extended: false}));
app.use('/uploads', express.static('uploads'));
app.use('/',user)



// socketIO.on('connection', (socket) => {
//   console.log(`⚡: ${socket.id} user just connected!`);
//   //   socket.on('message', (message) => {
//   //     socketIO.emit('message', message); 
//   //     console.log('msg',socketIO.emit('message', message))
//   // });

//   socket.on('disconnect', () => {
//     console.log('🔥: A user disconnected');
//   });
// });

socketIO.on('connection', (socket) => {

  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on('message', (data) => { 
    connection.query('INSERT INTO chat (name, message) VALUES (?, ?)',[data.name,data?.text],(err, res) => {
      if(err){
        console.log('err',err)
      }
      console.log("success",res)
    })
    socketIO.emit('messageResponse', data);
  });

  // app.get('/getMessage',(req,res)=> { 
  //   let name = req.query.name ?? "vijay kumar"
  //   connection.query('SELECT * FROM chat',(err,result) => {
  //     if(err){
  //       console.log('err',err)
  //     }
  //     let valu = []

  //     result.forEach((res) => {
  //       if(!valu[res.name]){
  //         valu[res.name] = []
  //       }
  //       valu[res.name].push(res)
  //     })

  //     let key = Object.keys(valu) 
    
  //   console.log('res', valu)
  //     res.status(200).json(result)
  //   })
  // })

  app.get('/getuserMessage',(req,res)=> { 
    let name = req.query.name
    connection.query('SELECT * FROM chat WHERE name = ?',[name],(err,result) => {
      if(err){
        console.log('err',err)
      }
    console.log('res', result)
      res.status(200).json(result)
    })
  })


  socket.on('newUser', (data) => {
    users.push(data);
    console.log('users',data.name,"connected");
    //Sends the list of users to the client
    // connection.query(`SELECT * FROM user WHERE id = ?`,[data?.id],(err,result) => {
      connection.query(`UPDATE user SET status = '1' WHERE id = ?`,[data?.id],(err,result) => {
      if(err) { console.log('err',err)}
      if(result){
        connection.query(`SELECT * FROM user WHERE id = ?`,[data?.id],(err1,result1) => {
          if(err1) { console.log('err',err1)}
          let userData = []
          result1.map((val,i) =>{
            userData.push({...val,profile:'http://localhost:4000' + '/uploads/users/profile_image/' + `${val.id}/${val.image}`})
          })
          console.log('loged',userData)
          socketIO.emit('onprocessing', userData)
        })
      }
    })
  });

  socket.on('disconnect', (dd) => {
    // users = users.filter((user) => user.socketID !== socket.id);
    console.log('🔥: A user disconnected',users);
    const id = users[0]?.id
    const date = new Date()
     const now = moment(date)
     console.log('skdsgdskdd',now)
    connection.query(`UPDATE user SET status ='0', last_seen = '${now.format('DD-MM-YYYY hh:mm:ss')}' WHERE id = ?`,[id],(err,result) => {
      if(err) { console.log('err',err)}
      socketIO.emit('newUserResponse', result);
      socket.disconnect();
    })
  });
});


// io.on('connection', (socket) => {
//   console.log('A user connected');

//   socket.on('message', (message) => {
//     io.emit('message', message); 
//   });

//   socket.on('disconnect', () => {
//     console.log('A user disconnected');
//   });
// });


app.get('/get',(req,res)=> {
  res.json({messgae:"hello"})
})

test()

// app.use('/',router)

http.listen(4000, () => {
  console.log('Server is running on port 4000');
});






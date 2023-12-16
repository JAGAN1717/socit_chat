const mysql = require('mysql2');

const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'test',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, 
    idleTimeout: 60000, 
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  })

  connection.getConnection(function(err, conn) {
    if(err){
    console.log('disconnected')
    }

   if(conn){
    console.log('conected')
    connection.releaseConnection(conn);
   }
   
  }); 


  module.exports = {connection}
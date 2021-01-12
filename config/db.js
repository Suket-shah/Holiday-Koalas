const { Connection, Request} = require('tedious');

// DB Connections
const config = {
    authentication: {
        options: {
          userName: process.env.SERVER_ADMIN_USER,
          password: process.env.SERVER_PASSWORD
        },
        type: "default"
      },
      server: process.env.SERVER_NAME, 
      options: {
        database: process.env.DATABASE_NAME, 
        encrypt: true,
        rowCollectionOnDone: true
    }
};

// var config = {
//     server: process.env.SERVER_NAME,
//     options: { encrypt: true, database: process.env.DATABASE_NAME },
//     authentication: {
//       type: "default",
//       options: {  
//         userName: process.env.SERVER_ADMIN_USER,
//         password: process.env.SERVER_PASSWORD,
//       }
//     }
//   };


// const config = {
//     userName: process.env.SERVER_ADMIN_USER,
//     password: process.env.SERVER_PASSWORD,
//     server: process.env.SERVER_NAME,
//     options: { encrypt: true, database: process.env.DATABASE_NAME }
// }

const connection = new Connection(config);

connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    }
});

module.exports = connection;
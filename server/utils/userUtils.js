const fs = require('fs');
const moment = require('moment');
const logger = require('winston');
const jsonfile = require('jsonfile');
require('winston-memory').Memory;

const batchUsersFile = process.env.FILESDIR + '/users.json';
const batchActivityFile = process.env.FILESDIR + '/activity.json';
const { getMaps, deleteMap } = require('./designUtils');

export const getActivityLog = () => {
  var entries = [];
  if (!fs.existsSync(batchActivityFile)) {
    jsonfile.writeFileSync(batchActivityFile, entries, {}, function(err) {
      console.log('ERROR: Activity log write failed - ', err)
    })  
  } 
  try {
    entries = jsonfile.readFileSync(batchActivityFile); 
    entries.sort(function(a, b) {
      return (new Date(b.time) - new Date(a.time))
    })
    
    return entries;
  } catch (error) {
    console.log('ERROR: Activity log read failed - ', error)
    return [];
  }
}

export const logActivity = (entry) => {
  var entries = [];
  if (!fs.existsSync(batchActivityFile)) {
    jsonfile.writeFileSync(batchActivityFile, entries, {}, function(err) {
      console.log('ERROR: Activity log write failed - ', err)
    })  
  } 
  entries = jsonfile.readFileSync(batchActivityFile);   
  entries.push(entry);
  jsonfile.writeFileSync(batchActivityFile, entries, {}, function(err) {
    console.log('ERROR: Activity log write failed - ', err)
  });

  // jsonfile.writeFileSync(batchActivityFile, entries, {flag: 'a'})
  return;
}

export const getUsers = () => {
  var users = [];
  if (!fs.existsSync(batchUsersFile)) {
    jsonfile.writeFileSync(batchUsersFile, users, {}, function(err) {
      console.log('ERROR: Users write failed - ', err)
    })  
  } 
  try {
    users = jsonfile.readFileSync(batchUsersFile);   
    return users;
  } catch (error) {
    console.log('ERROR: Users read failed - ', err)
    return [];
  }
}

export const getUser = (email) => {
  var users = [];
  if (!fs.existsSync(batchUsersFile)) {
    jsonfile.writeFileSync(batchUsersFile, users, {}, function(err) {
      console.log('ERROR: Users write failed - ', err)
    })  
  } else {
    try {
      users = jsonfile.readFileSync(batchUsersFile);    
    } catch (error) {
      console.log('ERROR: Users read failed - ', err)
    }
  }

  var user = users.find((user) => {
    return user.email === email;
  })

  if (user)
    return user;

  return false;
}

export const getUserByToken = (token) => {
  var users = [];
  if (!fs.existsSync(batchUsersFile)) {
    jsonfile.writeFileSync(batchUsersFile, users, {}, function(err) {
      console.log('ERROR: Users write failed - ', err)
    })  
  } else {
    try {
      users = jsonfile.readFileSync(batchUsersFile);    
    } catch (error) {
      console.log('ERROR: Users read failed - ', err)
    }
  }

  var user = users.find((user) => {
    return user.token === token;
  })

  if (user)
    return user;

  return false;
}

export const getUserByEmail = (email) => {
  var users = [];
  if (!fs.existsSync(batchUsersFile)) {
    jsonfile.writeFileSync(batchUsersFile, users, {}, function(err) {
      console.log('ERROR: Users write failed - ', err)
    })  
  } else {
    try {
      users = jsonfile.readFileSync(batchUsersFile);    
    } catch (error) {
      console.log('ERROR: Users read failed - ', err)
    }
  }

  var user = users.find((user) => {
    return user.email === email;
  })

  if (user)
    return user;

  return false;
}

export const createUser = (name, email) => {
  var users = [];
  if (!fs.existsSync(batchUsersFile)) {
    jsonfile.writeFileSync(batchUsersFile, users, {}, function(err) {
      console.log('ERROR: Users write failed - ', err)
    })  
  } else {
    try {
      users = jsonfile.readFileSync(batchUsersFile);    
    } catch (error) {
      console.log('ERROR: Users read failed - ', err)
    }
  }

  var user = users.find((user) => {
    return user.email === email;
  })

  if (user)
    return false;

  user = {name, email, createdAt: new Date().toLocaleString(), status: 'UNVERIFIED'};
  users.push(user);
    
  users.sort(function(a, b) {
    return (new Date(b.createdAt) - new Date(a.createdAt))
  })

  jsonfile.writeFileSync(batchUsersFile, users, {}, function(err) {
    console.log('ERROR: Users write failed - ', err)
  })  
  
  return user;
}

export const createAdminUser = (name, email, client) => {
  var users = [];
  if (!fs.existsSync(batchUsersFile)) {
    jsonfile.writeFileSync(batchUsersFile, users, {}, function(err) {
      console.log('ERROR: Users write failed - ', err)
    })  
  } else {
    try {
      users = jsonfile.readFileSync(batchUsersFile);    
    } catch (error) {
      console.log('ERROR: Users read failed - ', err)
    }
  }

  var user = users.find((user) => {
    return user.email === email;
  })

  if (user)
    return false;

  user = {name, email, admin: true, client: client.name, createdAt: new Date().toLocaleString(), status: 'UNVERIFIED'};
  users.push(user);
    
  users.sort(function(a, b) {
    return (new Date(b.createdAt) - new Date(a.createdAt))
  })

  jsonfile.writeFileSync(batchUsersFile, users, {}, function(err) {
    console.log('ERROR: Users write failed - ', err)
  })  
  
  return user;
}

export const doesUserExist = (email) => {
  var users = [];
  if (!fs.existsSync(batchUsersFile)) {
    jsonfile.writeFileSync(batchUsersFile, users, {}, function(err) {
      console.log('ERROR: Users write failed - ', err)
    })  
  } else {
    try {
      users = jsonfile.readFileSync(batchUsersFile);    
    } catch (error) {
      console.log('ERROR: Users read failed - ', err)
    }
  }

  var user = users.find((user) => {
    return user.email === email;
  })

  if (user)
    return true;

  return false;
}

export const countUsers = () => {
  var users = [];
  if (!fs.existsSync(batchUsersFile)) {
    jsonfile.writeFileSync(batchUsersFile, users, {}, function(err) {
      console.log('ERROR: Users write failed - ', err)
    })  
  } else {
    try {
      users = jsonfile.readFileSync(batchUsersFile);    
    } catch (error) {
      console.log('ERROR: Users read failed - ', err)
    }
  }

  return users.length;
}

export const deleteUser = (email) => {
  var users = [];
  if (!fs.existsSync(batchUsersFile)) {
    jsonfile.writeFileSync(batchUsersFile, users, {}, function(err) {
      console.log('ERROR: Users write failed - ', err)
    })  
  } else {
    try {
      users = jsonfile.readFileSync(batchUsersFile);    
    } catch (error) {
      console.log('ERROR: Users read failed - ', err)
    }
  }

  var user = users.find((user) => {
    return user.email === email;
  })

  if (user) {
    var maps = getMaps(user);
    maps.map((map) => {
      deleteMap(map.id, true, user);
    })
  }

  var newUsers = users.filter((user) => {
    return user.email !== email;
  })

  jsonfile.writeFileSync(batchUsersFile, newUsers, {}, function(err) {
    console.log('ERROR: Users write failed - ', err)
  })  

  return newUsers;
}

export const saveUser = (user) => {
  var users = [];
  if (!fs.existsSync(batchUsersFile)) {
    jsonfile.writeFileSync(batchUsersFile, users, {}, function(err) {
      console.log('ERROR: Users write failed - ', err)
    })  
  } 

  users = jsonfile.readFileSync(batchUsersFile);    

  var _user = users.find((_user) => {
    return user.email === _user.email;
  })

  if (!_user) {
    _user = {email: user.email, name: user.name, admin: false, createdAt: (new Date().toLocaleString()), status: 'UNVERIFIED'};
    users.push(_user);
  }

  _user.createdAt = user.createdAt;
  _user.lastLoginAt = user.lastLoginAt;
  _user.name = user.name;
  _user.email = user.email;
  _user.password = user.password;
  _user.admin = user.admin ? user.admin : false;
  _user.status = user.status;
  _user.token = user.token;

  users.sort(function(a, b) {
    return (new Date(b.createdAt) - new Date(a.createdAt))
  })

  jsonfile.writeFileSync(batchUsersFile, users, {}, function(err) {
    console.log('ERROR: Users write failed - ', err)
  })  
  
  return user;
}

export const initUsersConfig = () => {
  var users = undefined;

  if (!fs.existsSync(batchUsersFile)) {
    users = [];

    jsonfile.writeFileSync(batchUsersFile, users, {}, function(err) {
      console.log('ERROR: initConfig::Users write failed - ', err)
    })
  }

  return;
}

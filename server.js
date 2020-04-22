const MongoClient = require('mongodb').MongoClient;
const mongoVersion = require('mongo-version');

const url = 'mongodb://localhost:27017/DBClientsPPK';

function TableItem(property, value){
    this.property = property;
    this.value = value;
};


(() => {
    MongoClient.connect(url, async (err, db) => {
        if(err){
            console.log('No connection to Database! Please start MongoDB service on default port 27017!\n');                         
            console.log(err);
            await sleep(10000);
        } else {
            console.log('Connected to database successfully!\n\n');  
            console.log('Total info\n');
            await mongoVersion(db,  (err, version) => {
                console.log(`MongoDB Version: \t ${version}`);   
            }); 
            
            getAllInfo(db, () => {
                console.log('\nApplication will be closed automatically in 2 minutes...');
            });             
        }
    });    
})();


const sleep = (timeout) => {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);        
    });
};

const getAllInfo = (db, callback) => {
    db.collection('ppkState', async (err, collection) => {
        if(err) {
            console.log(err);
            db.close();
            await sleep(10000);
        };     
    
        const allPpk = await collection.find({}).count();
         
        const onlinePpk = await collection.find({ lastActivity: {$gt: (Date.now() - 4 * 60 * 1000) }}).count();
    
        const offlinePpk = await collection.find({ lastActivity: {$lt: (Date.now() - 4 * 60 * 1000) }}).count();
  
        const enabled = await collection.find({ enabled: true }).count(); 
    
        const disabled = await collection.find({ enabled: false }).count(); 
      
        const dunay4L = await collection.find({ model: '4l' }).count(); 
        
        const dunay8LG1R = await collection.find({ model: '8l' }).count(); 
              
        const scenar = await countScenarious(db);
    
        const apiUsers = await countApiUsers(db);
      
        const controlPpks = await countControlPpks(db);
  
        await sleep(1000);      


        const totalPpks = new TableItem('Total ppks in database', allPpk);
        const totalPpksOnline = new TableItem('Ppks online', onlinePpk);
        const totalPpksOffline = new TableItem('Ppks offline', offlinePpk);
        const totalEnabled = new TableItem('Total ppks enabled', enabled);
        const totalDisabled = new TableItem('Total ppks disabled', disabled);
        const total4L = new TableItem('Total Dunay 4L', dunay4L);
        const total8Lg1R = new TableItem('Total Dunay 8L and G1R', dunay8LG1R);
        const totalScen = new TableItem('Total ppks with scenarious', scenar);
        const totalApi = new TableItem('Total API users', apiUsers);
        const totalControl = new TableItem('Total Dunay Control ppks for last 24 hours', controlPpks);

        console.table([
            totalPpks, 
            totalPpksOnline,
            totalPpksOffline,
            totalEnabled,
            totalDisabled,
            total4L,
            total8Lg1R,
            totalScen,
            totalApi,
            totalControl
        ]);

        await sleep(1000);
        callback();
        db.close(); 
        await sleep(120000);               
    });
};

// cound devices with scenarious
const countScenarious = async (db) => {
    const scenar = await db.collection('scenarios').find({}).count();    
    return scenar;    
};

// cound api users
const countApiUsers = async (db) => {
    const apiUsers = await db.collection('apiUsers').find({}).count();      
    return apiUsers;
};

// cound Dunay Control ppks
const countControlPpks = async (db) => {
    // Find all devices which were managed for last 24 hours using Dunay Control
    const controlPpks = await db.collection('Lite2Activity').find({ time: {$gt: (Date.now() - 60 * 60 * 24 * 1000) }}).toArray();
        
    // Remove duplicate numbers ppk from array
    const seen = new Set();
    const filteredArr = controlPpks.filter(el => {
        const duplicate = seen.has(el.ppk_num);
        seen.add(el.ppk_num);
        return !duplicate;
        });
   
    return filteredArr.length;
};


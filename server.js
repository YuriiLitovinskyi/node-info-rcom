const MongoClient = require('mongodb').MongoClient;
const mongoVersion = require('mongo-version');

const url = 'mongodb://localhost:27017/DBClientsPPK';


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
            

            getAllInfo(db);           
            
        }
    });    
})();


const sleep = (timeout) => {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);        
    });
};

const getAllInfo = (db) => {
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
       

        // Promise.all([countScenarious(db), countApiUsers(db), countControlPpks(db)]).then(function(values) {
        //     console.log(values);
        // });
        
        const scenar = await countScenarious(db);
    

        const apiUsers = await countApiUsers(db);
      

        const controlPpks = await countControlPpks(db);
  
    
        await sleep(500);      


        console.table([          
            ['Total ppks in database', allPpk],
            ['Ppks online', onlinePpk],
            ['Ppks offline', offlinePpk],
            ['Total ppks enabled', enabled],
            ['Total ppks disabled', disabled],
            ['Total Dunay 4L', dunay4L],
            ['Total Dunay 8L and G1R', dunay8LG1R],
            ['Total ppks with scenarious', scenar],
            ['Total API users', apiUsers],
            ['Total Dunay Control ppks for last 24 hours', controlPpks]
        ]);


        await sleep(30000);
        db.close();
        //callback();
    });
};

// cound devices with scenarious
const countScenarious = (db) => {
    db.collection('scenarios', async (err, collection) => {
        if(err) {
            console.log(err);
            db.close();
            await sleep(10000);
        };

        const scenar = await collection.find({}).count();
        console.log(`Total ppks with scenarious: ${scenar}`);
     
        

        return scenar;
    });    
};

// cound api users
const countApiUsers = async (db) => {
    db.collection('apiUsers', async (err, collection) => {
        if(err) {
            console.log(err);
            db.close();
            await sleep(10000);
        };

        const apiUsers = await collection.find({}).count();
        console.log(`Total API users: ${apiUsers}`);
      

        return apiUsers;
    });   
};

// cound Dunay Control ppks
const countControlPpks = (db) => {
    db.collection('Lite2Activity', async (err, collection) => {
        if(err) {
            console.log(err);
            db.close();
            await sleep(10000);
        };


        const controlPpks = await collection.find({ time: {$gt: (Date.now() - 60 * 60 * 24 * 1000) }}).toArray();
        

        const seen = new Set();

        const filteredArr = controlPpks.filter(el => {
            const duplicate = seen.has(el.ppk_num);
            seen.add(el.ppk_num);
            return !duplicate;
          });

          console.log(filteredArr);

        console.log(`Total Dunay Control ppks for last 24 hours: ${filteredArr.length}`);
    });
};


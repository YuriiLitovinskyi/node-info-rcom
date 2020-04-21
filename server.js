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
            console.log('Total info');

            //const version = db.version;
            //console.table()
            //console.log(`MongoDB Version: \t ${version}` );

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

        await mongoVersion(db,  (err, version) => {
            console.log(`MongoDB Version: \t ${version}`);
        });

        const allPpk = await collection.find({}).count();
        console.log(`Total ppks in database: \t\t ${allPpk}`);

        const onlinePpk = await collection.find({ lastActivity: {$gt: (Date.now() - 4 * 60 * 1000) }}).count();
        console.log(`Ppks online: \t\t ${onlinePpk}`);

        const offlinePpk = await collection.find({ lastActivity: {$lt: (Date.now() - 4 * 60 * 1000) }}).count();
        console.log(`Ppks offline: \t\t ${offlinePpk}`);

        const enabled = await collection.find({ enabled: true }).count(); 
        console.log(`Total ppks enabled: \t\t ${enabled}`);

        const disabled = await collection.find({ enabled: false }).count(); 
        console.log(`Total ppks disabled: \t\t ${disabled}`);

        const dunay4L = await collection.find({ model: '4l' }).count(); 
        console.log(`Total Dunay 4L: \t\t ${dunay4L}`);

        const dunay8LG1R = await collection.find({ model: '8l' }).count(); 
        console.log(`Total Dunay 8L and G1R: \t\t ${dunay8LG1R}`);

        await countScenarious(db);

        await countApiUsers(db);

        await countControlPpks(db);

        
        await sleep(10000);
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
    });
};

// cound api users
const countApiUsers = (db) => {
    db.collection('apiUsers', async (err, collection) => {
        if(err) {
            console.log(err);
            db.close();
            await sleep(10000);
        };

        const apiUsers = await collection.find({}).count();
        console.log(`Total API users: ${apiUsers}`);
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

        const controlPpks = await collection.distinct('ppk_num');
        console.log(`Total ppks which were used with Dunay Control recently: ${controlPpks.length}`);
    });
};
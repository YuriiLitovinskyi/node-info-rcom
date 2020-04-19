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
    db.collection('coll_ping', async (err, collection) => {
        if(err) {
            console.log(err);
            db.close();
            await sleep(10000);
        };

        await mongoVersion(db,  (err, version) => {
            console.log(`MongoDB Version: \t ${version}`);
        });

        const allPpk = await collection.find({}).count();
        console.log(`Total ppks: \t\t ${allPpk}`);

        const onlinePpk = await collection.find({ time: {$lt: Date.now() - 4 * 60 }}).count(); // check!
        console.log(`Ppks online: \t\t ${onlinePpk}`);

        const dunay4L = await collection.find({ ppk_model: '4l' }).count(); 
        console.log(`Dunay 4L: \t\t ${dunay4L}`);

        const dunay8L = await collection.find({ ppk_model: '8l' }).count(); 
        console.log(`Dunay 8L: \t\t ${dunay8L}`);


        db.close();
        await sleep(10000);
        //callback();
    });
};
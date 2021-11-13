const database = require('./database')

database.create().then(() => {
    console.log("Initial count for adSpace 1:", database.getAdSpace(1));
    console.log("Initial count for adSpace 2:", database.increment(2));
    database.increment(1).then(() => {
        console.log("Updated count for adSpace 1:", database.getAdSpace(1));
    })

    console.log("All metrics: ", database.getAllMetrics())
});
